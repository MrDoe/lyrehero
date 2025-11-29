import { NOTE_FREQUENCIES, LYRE_NOTES } from "../constants";

// Lyre harp frequency range: F3 (174.61 Hz) to C6 (1046.5 Hz)
const LYRE_MIN_FREQ = 165; // Slightly below F3 to allow for tuning variations
const LYRE_MAX_FREQ = 1100; // Slightly above C6

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null;
  private lowPassFilter: BiquadFilterNode | null = null; // Added for band-pass filtering
  private stream: MediaStream | null = null;
  private buffer: Float32Array = new Float32Array(0);
  private frequencyBuffer: Float32Array = new Float32Array(0); // For spectral analysis
  private isListening: boolean = false;

  // Configurable thresholds
  public rmsThreshold: number = 0.002; // Slightly higher to reject quiet noise
  public correlationThreshold: number = 0.3; // Much stricter - noise has low correlation

  // Noise resistance: temporal smoothing
  private noteHistory: string[] = [];
  private frequencyHistory: number[] = [];
  private readonly HISTORY_SIZE = 5; // Number of frames to consider
  private readonly REQUIRED_CONSISTENCY = 3; // How many must agree

  // Adaptive noise floor
  private noiseFloor: number = 0.001;
  private noiseFloorSamples: number[] = [];
  private readonly NOISE_FLOOR_WINDOW = 50;

  // Lyre-specific detection settings
  private readonly HARMONIC_TOLERANCE = 0.08; // 8% tolerance for harmonic detection
  private readonly SPECTRAL_FLATNESS_THRESHOLD = 0.3; // Below this = tonal sound
  private readonly CENTS_TOLERANCE = 50; // Accept notes within 50 cents (half semitone)

  async start(): Promise<void> {
    if (this.audioContext?.state === "running") return;

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)({
        sampleRate: 48000, // Request specific sample rate if possible for consistency
      });
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          channelCount: 1,
        },
      });

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 8192; // Large FFT for excellent low frequency resolution
      this.analyser.smoothingTimeConstant = 0; // No smoothing for accurate pitch detection
      this.buffer = new Float32Array(this.analyser.fftSize);
      this.frequencyBuffer = new Float32Array(this.analyser.frequencyBinCount);

      // Create High-Pass Filter to remove low-frequency noise (rumble, HVAC, etc.)
      // Set just below lyre harp range to remove non-musical sounds
      this.highPassFilter = this.audioContext.createBiquadFilter();
      this.highPassFilter.type = "highpass";
      this.highPassFilter.frequency.value = 150; // Cut frequencies below lyre range
      this.highPassFilter.Q.value = 0.7; // Gentle rolloff

      // Create Low-Pass Filter to remove high-frequency noise (hiss, electronics)
      // This creates a band-pass effect focused on lyre harp frequencies
      this.lowPassFilter = this.audioContext.createBiquadFilter();
      this.lowPassFilter.type = "lowpass";
      this.lowPassFilter.frequency.value = 1200; // Cut frequencies above lyre range
      this.lowPassFilter.Q.value = 0.7; // Gentle rolloff

      // Create Gain Node to boost quiet microphones
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.5; // 150% volume boost - avoid clipping

      this.mediaStreamSource = this.audioContext.createMediaStreamSource(
        this.stream
      );

      // Signal path: Source -> HighPass -> LowPass -> Gain -> Analyser
      // This creates a band-pass filter effect for lyre harp frequencies
      this.mediaStreamSource.connect(this.highPassFilter);
      this.highPassFilter.connect(this.lowPassFilter);
      this.lowPassFilter.connect(this.gainNode);
      this.gainNode.connect(this.analyser);

      this.isListening = true;
    } catch (error) {
      console.error("Error starting audio engine:", error);
      this.stop();
      throw error;
    }
  }

  stop(): void {
    if (this.mediaStreamSource) this.mediaStreamSource.disconnect();
    if (this.highPassFilter) this.highPassFilter.disconnect();
    if (this.lowPassFilter) this.lowPassFilter.disconnect();
    if (this.gainNode) this.gainNode.disconnect();

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.mediaStreamSource = null;
    this.highPassFilter = null;
    this.lowPassFilter = null;
    this.gainNode = null;
    this.isListening = false;

    // Reset noise tracking
    this.noteHistory = [];
    this.frequencyHistory = [];
    this.noiseFloorSamples = [];
    this.noiseFloor = 0.001;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  setGain(value: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }

  detectPitch(): {
    note: string;
    frequency: number;
    clarity: number;
    volume: number;
  } | null {
    if (!this.analyser || !this.isListening || !this.audioContext) {
      console.log("AudioEngine: Not ready", {
        analyser: !!this.analyser,
        listening: this.isListening,
        context: !!this.audioContext,
      });
      return null;
    }

    // Safety check for buffer size
    if (this.buffer.length !== this.analyser.fftSize) {
      this.buffer = new Float32Array(this.analyser.fftSize);
    }
    if (this.frequencyBuffer.length !== this.analyser.frequencyBinCount) {
      this.frequencyBuffer = new Float32Array(this.analyser.frequencyBinCount);
    }

    this.analyser.getFloatTimeDomainData(this.buffer as any);
    this.analyser.getFloatFrequencyData(this.frequencyBuffer as any);

    // 1. Calculate RMS (Volume)
    let rms = 0;
    const bufferLength = this.buffer.length;
    for (let i = 0; i < bufferLength; i++) {
      rms += this.buffer[i] * this.buffer[i];
    }
    rms = Math.sqrt(rms / bufferLength);

    // 2. Update adaptive noise floor (tracks quiet periods)
    this.updateNoiseFloor(rms);

    // 3. Calculate Zero-Crossing Rate (noise has erratic crossings)
    const zcr = this.calculateZeroCrossingRate(this.buffer);
    const isLikelyNoise = zcr > 0.3; // High ZCR suggests noise, not pitched signal

    // 4. Calculate spectral flatness (tonality measure)
    // Low flatness = tonal sound (music), High flatness = noise
    const spectralFlatness = this.calculateSpectralFlatness(
      this.frequencyBuffer,
      this.audioContext.sampleRate
    );
    const isTonalSound = spectralFlatness < this.SPECTRAL_FLATNESS_THRESHOLD;

    // 5. Perform Pitch Detection
    const result = this.detectPitchNSDF(
      this.buffer,
      this.audioContext.sampleRate
    );

    // 6. Check for harmonic content (musical notes have harmonics)
    const hasHarmonics = this.checkHarmonicContent(
      this.frequencyBuffer,
      result.frequency,
      this.audioContext.sampleRate
    );

    // 7. Determine raw detected note (before temporal smoothing)
    let rawNote = "";
    const effectiveThreshold = Math.max(this.rmsThreshold, this.noiseFloor * 2);

    // Enhanced detection criteria for lyre harp:
    // - Must pass volume threshold
    // - Must have good pitch clarity
    // - Must not have excessive zero-crossings (noise indicator)
    // - Must be tonal (low spectral flatness) OR have harmonic content
    // - Frequency must be in lyre harp range
    const isValidLyreFrequency =
      result.frequency >= LYRE_MIN_FREQ && result.frequency <= LYRE_MAX_FREQ;

    if (
      rms > effectiveThreshold &&
      result.clarity > this.correlationThreshold &&
      !isLikelyNoise &&
      isValidLyreFrequency &&
      (isTonalSound || hasHarmonics)
    ) {
      rawNote = this.frequencyToLyreNote(result.frequency);
    }

    // 8. Apply temporal smoothing - only accept notes that are consistent
    this.noteHistory.push(rawNote);
    this.frequencyHistory.push(result.frequency);
    if (this.noteHistory.length > this.HISTORY_SIZE) {
      this.noteHistory.shift();
      this.frequencyHistory.shift();
    }

    const stableNote = this.getMostConsistentNote();
    const stableFrequency = this.getMedianFrequency();

    // Debug logging
    console.log("AudioEngine detectPitch:", {
      rms: rms.toFixed(4),
      noiseFloor: this.noiseFloor.toFixed(4),
      freq: result.frequency.toFixed(1),
      clarity: result.clarity.toFixed(3),
      zcr: zcr.toFixed(3),
      spectralFlatness: spectralFlatness.toFixed(3),
      hasHarmonics,
      isTonal: isTonalSound,
      rawNote,
      stableNote,
    });

    return {
      note: stableNote,
      frequency: stableFrequency,
      clarity: result.clarity,
      volume: rms,
    };
  }

  /**
   * Update adaptive noise floor based on recent quiet samples
   */
  private updateNoiseFloor(rms: number): void {
    // Only update noise floor during quiet periods
    if (rms < this.noiseFloor * 3 || this.noiseFloorSamples.length < 10) {
      this.noiseFloorSamples.push(rms);
      if (this.noiseFloorSamples.length > this.NOISE_FLOOR_WINDOW) {
        this.noiseFloorSamples.shift();
      }
      // Noise floor is the median of recent quiet samples
      const sorted = [...this.noiseFloorSamples].sort((a, b) => a - b);
      this.noiseFloor = sorted[Math.floor(sorted.length / 2)] || 0.001;
    }
  }

  /**
   * Calculate zero-crossing rate - high values indicate noise
   */
  private calculateZeroCrossingRate(buffer: Float32Array): number {
    let crossings = 0;
    const len = Math.min(buffer.length, 2048); // Only analyze a portion
    for (let i = 1; i < len; i++) {
      if (
        (buffer[i] >= 0 && buffer[i - 1] < 0) ||
        (buffer[i] < 0 && buffer[i - 1] >= 0)
      ) {
        crossings++;
      }
    }
    return crossings / len;
  }

  /**
   * Get the most frequently occurring note in recent history
   */
  private getMostConsistentNote(): string {
    if (this.noteHistory.length < this.REQUIRED_CONSISTENCY) return "";

    // Count occurrences of each note
    const counts: Record<string, number> = {};
    for (const note of this.noteHistory) {
      if (note) {
        // Don't count empty strings
        counts[note] = (counts[note] || 0) + 1;
      }
    }

    // Find the note with the highest count
    let maxCount = 0;
    let bestNote = "";
    for (const [note, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        bestNote = note;
      }
    }

    // Only return if we have enough consistency
    return maxCount >= this.REQUIRED_CONSISTENCY ? bestNote : "";
  }

  /**
   * Get median frequency from recent history (reduces jitter)
   */
  private getMedianFrequency(): number {
    if (this.frequencyHistory.length === 0) return 0;
    const sorted = [...this.frequencyHistory].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }

  /**
   * Calculate spectral flatness (Wiener entropy)
   * Low values indicate tonal sounds (musical notes)
   * High values indicate noise-like sounds
   */
  private calculateSpectralFlatness(
    frequencyData: Float32Array,
    sampleRate: number
  ): number {
    // Focus on lyre harp frequency range for better accuracy
    const binWidth = sampleRate / (frequencyData.length * 2);
    const minBin = Math.floor(LYRE_MIN_FREQ / binWidth);
    const maxBin = Math.min(
      Math.ceil(LYRE_MAX_FREQ / binWidth),
      frequencyData.length - 1
    );

    if (maxBin <= minBin) return 1.0; // Return high flatness if range is invalid

    // Convert dB to linear power values
    const powers: number[] = [];
    for (let i = minBin; i <= maxBin; i++) {
      // frequencyData is in dB, convert to linear power
      const linearPower = Math.pow(10, frequencyData[i] / 10);
      if (linearPower > 0) {
        powers.push(linearPower);
      }
    }

    if (powers.length === 0) return 1.0;

    // Calculate geometric mean and arithmetic mean
    let logSum = 0;
    let arithmeticSum = 0;
    for (const power of powers) {
      logSum += Math.log(power + 1e-10); // Add small value to avoid log(0)
      arithmeticSum += power;
    }

    const geometricMean = Math.exp(logSum / powers.length);
    const arithmeticMean = arithmeticSum / powers.length;

    // Spectral flatness is the ratio of geometric to arithmetic mean
    // Value between 0 (tonal) and 1 (noise-like)
    if (arithmeticMean <= 0) return 1.0;
    return Math.min(1.0, geometricMean / arithmeticMean);
  }

  /**
   * Check if the detected fundamental frequency has harmonics present
   * Musical notes from stringed instruments have clear harmonic series
   */
  private checkHarmonicContent(
    frequencyData: Float32Array,
    fundamentalFreq: number,
    sampleRate: number
  ): boolean {
    if (fundamentalFreq <= 0) return false;

    const binWidth = sampleRate / (frequencyData.length * 2);
    const fundamentalBin = Math.round(fundamentalFreq / binWidth);

    // Get the power at the fundamental frequency
    if (fundamentalBin >= frequencyData.length) return false;
    const fundamentalPower = frequencyData[fundamentalBin];

    // Check for the 2nd and 3rd harmonics (most prominent in stringed instruments)
    let harmonicsFound = 0;
    const harmonicsToCheck = [2, 3]; // 2nd and 3rd harmonics

    for (const harmonic of harmonicsToCheck) {
      const harmonicFreq = fundamentalFreq * harmonic;
      if (harmonicFreq > LYRE_MAX_FREQ * 2) continue; // Allow harmonics above lyre range

      const harmonicBin = Math.round(harmonicFreq / binWidth);
      if (harmonicBin >= frequencyData.length) continue;

      // Check if there's significant energy at the harmonic frequency
      // Allow some tolerance in frequency (bins around the expected harmonic)
      let maxHarmonicPower = -Infinity;
      const searchRange = Math.max(1, Math.round(harmonicBin * this.HARMONIC_TOLERANCE));
      for (
        let b = Math.max(0, harmonicBin - searchRange);
        b <= Math.min(frequencyData.length - 1, harmonicBin + searchRange);
        b++
      ) {
        if (frequencyData[b] > maxHarmonicPower) {
          maxHarmonicPower = frequencyData[b];
        }
      }

      // Harmonic should be present (within 20dB of fundamental is typical for strings)
      if (maxHarmonicPower > fundamentalPower - 25) {
        harmonicsFound++;
      }
    }

    // Require at least one harmonic to confirm it's a musical note
    return harmonicsFound >= 1;
  }

  /**
   * Convert frequency to a lyre harp note using cents-based tolerance
   * Only returns valid lyre notes (F3 to C6, diatonic)
   * Uses musical cents for more accurate pitch matching
   */
  private frequencyToLyreNote(frequency: number): string {
    if (frequency < LYRE_MIN_FREQ || frequency > LYRE_MAX_FREQ) return "";

    let minCents = Infinity;
    let bestNote = "";

    // Only check against valid lyre notes
    for (const noteName of LYRE_NOTES) {
      const noteFreq = NOTE_FREQUENCIES[noteName];
      if (!noteFreq) continue;

      // Calculate difference in cents (1200 cents = 1 octave)
      // cents = 1200 * log2(f1/f2)
      const cents = Math.abs(1200 * Math.log2(frequency / noteFreq));

      if (cents < minCents) {
        minCents = cents;
        bestNote = noteName;
      }
    }

    // Only accept if within tolerance (50 cents = half semitone)
    if (minCents > this.CENTS_TOLERANCE) {
      return "";
    }

    return bestNote;
  }

  /**
   * Improved NSDF (Normalized Square Difference Function) pitch detection
   * Uses parabolic interpolation and proper peak picking
   */
  private detectPitchNSDF(
    buffer: Float32Array,
    sampleRate: number
  ): { frequency: number; clarity: number } {
    const MIN_FREQ = 100; // Lyre harp lowest note ~130Hz, add margin
    const MAX_FREQ = 1200;

    const minPeriod = Math.floor(sampleRate / MAX_FREQ);
    const maxPeriod = Math.floor(sampleRate / MIN_FREQ);
    const analysisSize = Math.min(2048, buffer.length);

    // Calculate NSDF values for each period
    const nsdf: number[] = [];
    for (
      let period = minPeriod;
      period <= maxPeriod && period < analysisSize;
      period++
    ) {
      let acf = 0; // Autocorrelation
      let energy1 = 0;
      let energy2 = 0;

      const compareLength = Math.min(analysisSize - period, 512);

      for (let i = 0; i < compareLength; i++) {
        const val1 = buffer[i];
        const val2 = buffer[i + period];
        acf += val1 * val2;
        energy1 += val1 * val1;
        energy2 += val2 * val2;
      }

      // NSDF formula: 2 * r(t) / (m(0) + m(t))
      const energySum = energy1 + energy2;
      const nsdfValue = energySum > 0.0000001 ? (2 * acf) / energySum : 0;
      nsdf.push(nsdfValue);
    }

    // Find peaks in NSDF (local maxima above threshold)
    const peaks: { period: number; value: number }[] = [];
    const PEAK_THRESHOLD = 0.2; // Minimum NSDF value to consider

    for (let i = 1; i < nsdf.length - 1; i++) {
      if (
        nsdf[i] > nsdf[i - 1] &&
        nsdf[i] > nsdf[i + 1] &&
        nsdf[i] > PEAK_THRESHOLD
      ) {
        // Parabolic interpolation for sub-sample accuracy
        const alpha = nsdf[i - 1];
        const beta = nsdf[i];
        const gamma = nsdf[i + 1];
        const peakOffset = (0.5 * (alpha - gamma)) / (alpha - 2 * beta + gamma);
        const interpolatedPeriod = minPeriod + i + peakOffset;
        const interpolatedValue = beta - 0.25 * (alpha - gamma) * peakOffset;

        peaks.push({ period: interpolatedPeriod, value: interpolatedValue });
      }
    }

    if (peaks.length === 0) {
      return { frequency: 0, clarity: 0 };
    }

    // Select the first peak that's at least 80% of the maximum
    // This helps avoid octave errors (picking harmonics instead of fundamental)
    const maxPeakValue = Math.max(...peaks.map((p) => p.value));
    const threshold = maxPeakValue * 0.8;

    let bestPeak = peaks[0];
    for (const peak of peaks) {
      if (peak.value >= threshold) {
        bestPeak = peak;
        break; // Take the first (lowest frequency) peak above threshold
      }
    }

    const frequency = sampleRate / bestPeak.period;
    const clampedFreq = Math.max(MIN_FREQ, Math.min(frequency, MAX_FREQ));

    return {
      frequency: clampedFreq,
      clarity: Math.max(0, Math.min(1, bestPeak.value)),
    };
  }
}
