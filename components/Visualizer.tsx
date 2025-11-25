import React, { useEffect, useRef } from 'react';
import { AudioEngine } from '../services/audioEngine';

interface VisualizerProps {
  isListening: boolean;
  audioEngine: AudioEngine | null;
}

export const Visualizer: React.FC<VisualizerProps> = ({ isListening, audioEngine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas initially
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isListening || !audioEngine) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Draw "off" state
      ctx.strokeStyle = '#334155'; // slate-700
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width - 20, canvas.height / 2); // Leave room for meter
      ctx.stroke();
      return;
    }

    const analyser = audioEngine.getAnalyser();
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get Real Audio Data
      analyser.getByteTimeDomainData(dataArray);

      // --- Draw Waveform ---
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4ade80'; // Green-400
      ctx.beginPath();

      const sliceWidth = (canvas.width - 20) / bufferLength; // Reserve 20px for Level Meter
      let x = 0;

      // Calculate RMS for volume meter while looping
      let sumSquares = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // 128 is silence (0 to 255 range)
        const y = (v * canvas.height) / 2;

        // Calculate deviation from silence (1.0) for RMS
        const amplitude = v - 1;
        sumSquares += amplitude * amplitude;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width - 20, canvas.height / 2);
      ctx.stroke();

      // --- Draw Level Meter (VU Meter) ---
      const rms = Math.sqrt(sumSquares / bufferLength);
      // Amplify RMS for display purposes (sensitivity)
      const volume = Math.min(rms * 10, 1); 

      const meterX = canvas.width - 12;
      const meterWidth = 8;
      const meterHeight = canvas.height;
      const fillHeight = volume * meterHeight;

      // Background
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(meterX, 0, meterWidth, meterHeight);

      // Filled Level (Gradient)
      const gradient = ctx.createLinearGradient(0, meterHeight, 0, 0);
      gradient.addColorStop(0, '#4ade80'); // Green
      gradient.addColorStop(0.6, '#facc15'); // Yellow
      gradient.addColorStop(1, '#f87171'); // Red
      
      ctx.fillStyle = gradient;
      ctx.fillRect(meterX, meterHeight - fillHeight, meterWidth, fillHeight);
      
      // Frame for meter
      ctx.strokeStyle = '#475569'; // slate-600
      ctx.lineWidth = 1;
      ctx.strokeRect(meterX, 0, meterWidth, meterHeight);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isListening, audioEngine]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={60} 
        className="rounded-lg bg-slate-900/50 backdrop-blur-sm border border-slate-700"
      />
      <div className="absolute top-1 right-1 text-[10px] text-slate-500 font-mono">MIC</div>
    </div>
  );
};