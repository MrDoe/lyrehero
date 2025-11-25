import { NOTE_FREQUENCIES } from '../constants';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private stream: MediaStream | null = null;
  private buffer: Float32Array = new Float32Array(0);
  private isListening: boolean = false;
  
  // Configurable thresholds - very permissive for real instruments
  public rmsThreshold: number = 0.0005; 
  public correlationThreshold: number = 0.01;

  async start(): Promise<void> {
    if (this.audioContext?.state === 'running') return;

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000 // Request specific sample rate if possible for consistency
      });
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          channelCount: 1
        }
      });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 8192; // Large FFT for excellent low frequency resolution
      this.analyser.smoothingTimeConstant = 0; // No smoothing for accurate pitch detection
      this.buffer = new Float32Array(this.analyser.fftSize);

      // Create Gain Node to boost quiet microphones
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.5; // 150% volume boost - avoid clipping

      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
      
      // Simple path: Source -> Gain -> Analyser
      this.mediaStreamSource.connect(this.gainNode);
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
    if (this.gainNode) this.gainNode.disconnect();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.mediaStreamSource = null;
    this.gainNode = null;
    this.isListening = false;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  setGain(value: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }

  detectPitch(): { note: string; frequency: number; clarity: number; volume: number } | null {
    if (!this.analyser || !this.isListening || !this.audioContext) {
      console.log('AudioEngine: Not ready', { analyser: !!this.analyser, listening: this.isListening, context: !!this.audioContext });
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

    // 2. Perform Pitch Detection regardless of volume (for debug visualization)
    // The UI handles the thresholding logic for 'accepting' a note.
    const result = this.detectPitchNSDF(this.buffer, this.audioContext.sampleRate);
    
    // Debug logging - always log when there's signal
    console.log('AudioEngine detectPitch:', { rms: rms.toFixed(4), freq: result.frequency.toFixed(1), clarity: result.clarity.toFixed(3) });
    
    // 3. Determine if it's a valid note based on thresholds
    // Even if it fails thresholds, we return the detected raw data for the UI debug graph
    let note = "";
    if (rms > this.rmsThreshold && result.clarity > this.correlationThreshold) {
        note = this.frequencyToNote(result.frequency);
    }

    return {
      note: note,
      frequency: result.frequency,
      clarity: result.clarity,
      volume: rms
    };
  }

  /**
   * Simple autocorrelation-based pitch detection
   * Much faster and always returns a frequency
   */
  private detectPitchNSDF(buffer: Float32Array, sampleRate: number): { frequency: number, clarity: number } {
    const MIN_FREQ = 50;
    const MAX_FREQ = 1200;
    
    const minPeriod = Math.floor(sampleRate / MAX_FREQ);
    const maxPeriod = Math.floor(sampleRate / MIN_FREQ);
    const bufLen = buffer.length;
    
    // Use a smaller analysis window for speed
    const analysisSize = Math.min(2048, bufLen);
    
    let bestPeriod = minPeriod;
    let bestCorrelation = -1;

    // Simple autocorrelation - find the period with highest correlation
    for (let period = minPeriod; period <= maxPeriod && period < analysisSize; period++) {
      let correlation = 0;
      let norm1 = 0;
      let norm2 = 0;
      
      const compareLength = Math.min(analysisSize - period, 512);
      
      for (let i = 0; i < compareLength; i++) {
        const val1 = buffer[i];
        const val2 = buffer[i + period];
        correlation += val1 * val2;
        norm1 += val1 * val1;
        norm2 += val2 * val2;
      }
      
      // Normalized correlation
      const normFactor = Math.sqrt(norm1 * norm2);
      if (normFactor > 0.0000001) {
        correlation /= normFactor;
      } else {
        correlation = 0;
      }
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    // Always return a frequency
    const frequency = sampleRate / bestPeriod;
    const clampedFreq = Math.max(MIN_FREQ, Math.min(frequency, MAX_FREQ));
    
    return { 
      frequency: clampedFreq, 
      clarity: Math.max(0, bestCorrelation) 
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