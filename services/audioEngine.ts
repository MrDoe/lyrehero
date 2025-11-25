import { NOTE_FREQUENCIES } from "../constants";

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null;
  private stream: MediaStream | null = null;
  private buffer: Float32Array = new Float32Array(0);
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

      // Create High-Pass Filter to remove low-frequency noise (rumble, HVAC, etc.)
      this.highPassFilter = this.audioContext.createBiquadFilter();
      this.highPassFilter.type = "highpass";
      this.highPassFilter.frequency.value = 80; // Cut frequencies below 80Hz
      this.highPassFilter.Q.value = 0.7; // Gentle rolloff

      // Create Gain Node to boost quiet microphones
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.5; // 150% volume boost - avoid clipping

      this.mediaStreamSource = this.audioContext.createMediaStreamSource(
        this.stream
      );

      // Signal path: Source -> HighPass -> Gain -> Analyser
      this.mediaStreamSource.connect(this.highPassFilter);
      this.highPassFilter.connect(this.gainNode);
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

    this.analyser.getFloatTimeDomainData(this.buffer as any);

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

    // 4. Perform Pitch Detection
    const result = this.detectPitchNSDF(
      this.buffer,
      this.audioContext.sampleRate
    );

    // 5. Determine raw detected note (before temporal smoothing)
    let rawNote = "";
    const effectiveThreshold = Math.max(this.rmsThreshold, this.noiseFloor * 2);

    if (
      rms > effectiveThreshold &&
      result.clarity > this.correlationThreshold &&
      !isLikelyNoise
    ) {
      rawNote = this.frequencyToNote(result.frequency);
    }

    // 6. Apply temporal smoothing - only accept notes that are consistent
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

  private frequencyToNote(frequency: number): string {
    if (frequency <= 0 || frequency < 50 || frequency > 1300) return "";

    let minDiff = Infinity;
    let bestNote = "";

    for (const [note, freq] of Object.entries(NOTE_FREQUENCIES)) {
      const diff = Math.abs(freq - frequency);
      if (diff < minDiff) {
        minDiff = diff;
        bestNote = note;
      }
    }

    // Use a percentage-based tolerance instead of fixed Hz
    // This is more robust across different frequency ranges
    const bestNoteFreq = NOTE_FREQUENCIES[bestNote] || 440;
    const percentDiff = (minDiff / bestNoteFreq) * 100;

    // Allow up to 10% frequency deviation - generous for real instruments
    if (percentDiff > 10) {
      return "";
    }

    return bestNote;
  }
}
