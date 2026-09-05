import React, { useEffect, useRef } from 'react';
import { Mic, CheckCircle2, Sparkles } from 'lucide-react';
import { getAudioContext } from '../../services/speechService';

export type WaveformState = 'idle' | 'listening' | 'processing' | 'recognized';

interface WaveformVisualizerProps {
  state: WaveformState;
  audioStream?: MediaStream | null;
  height?: number;
  transcript?: string;
  onTapMic?: () => void;
  languageLabel?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  state,
  audioStream,
  height = 120,
  transcript = '',
  onTapMic,
  languageLabel = 'Voice Input Active'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localAnalyser: AnalyserNode | null = null;
    let localSource: MediaStreamAudioSourceNode | null = null;

    if (state === 'listening' && audioStream) {
      try {
        const audioCtx = getAudioContext();
        if (audioCtx) {
          localAnalyser = audioCtx.createAnalyser();
          localAnalyser.fftSize = 64;
          localSource = audioCtx.createMediaStreamSource(audioStream);
          localSource.connect(localAnalyser);
          analyserRef.current = localAnalyser;
        }
      } catch (e) {
        console.warn('Live audio analyzer init note:', e);
      }
    }

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      const numBars = 32;
      const barWidth = Math.max(3, (width / numBars) - 4);
      const centerY = h / 2;

      let freqData = new Uint8Array(32);
      if (localAnalyser && state === 'listening') {
        localAnalyser.getByteFrequencyData(freqData);
      }

      phase += 0.08;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 6;

        if (state === 'listening') {
          if (localAnalyser && freqData[i] > 0) {
            barHeight = Math.max(8, (freqData[i] / 255) * (h * 0.8));
          } else {
            // Harmonic lively simulated wave
            barHeight = 10 + Math.sin(phase + i * 0.3) * 16 + Math.cos(phase * 1.5 + i * 0.2) * 10;
          }
        } else if (state === 'processing') {
          barHeight = 12 + Math.sin(phase * 2 + i * 0.4) * 14;
        } else if (state === 'recognized') {
          barHeight = 8 + Math.sin(phase * 0.5 + i * 0.2) * 6;
        } else {
          // Idle ambient gentle wave
          barHeight = 4 + Math.sin(phase * 0.3 + i * 0.1) * 3;
        }

        const x = i * (barWidth + 4) + 6;
        const topY = centerY - barHeight / 2;

        // Gradient styling
        const grad = ctx.createLinearGradient(0, topY, 0, topY + barHeight);
        if (state === 'listening') {
          grad.addColorStop(0, '#0d9488'); // Teal 600
          grad.addColorStop(1, '#059669'); // Emerald 600
        } else if (state === 'processing') {
          grad.addColorStop(0, '#3b82f6'); // Blue 500
          grad.addColorStop(1, '#8b5cf6'); // Purple 500
        } else if (state === 'recognized') {
          grad.addColorStop(0, '#10b981'); // Emerald 500
          grad.addColorStop(1, '#059669'); // Emerald 600
        } else {
          grad.addColorStop(0, '#cbd5e1'); // Slate 300
          grad.addColorStop(1, '#94a3b8'); // Slate 400
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        if ((ctx as any).roundRect) {
          (ctx as any).roundRect(x, topY, barWidth, barHeight, 4);
        } else {
          ctx.rect(x, topY, barWidth, barHeight);
        }
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (localSource) {
        try { localSource.disconnect(); } catch (e) {}
      }
    };
  }, [state, audioStream]);

  return (
    <div className="w-full bg-slate-900 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-lg border border-slate-800 text-white relative overflow-hidden">
      <div className="flex items-center justify-between w-full mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${
            state === 'listening' ? 'bg-red-500 animate-ping' :
            state === 'processing' ? 'bg-amber-400 animate-spin' :
            state === 'recognized' ? 'bg-emerald-400' : 'bg-slate-500'
          }`} />
          <span className="font-bold tracking-wide text-slate-200">
            {state === 'listening' ? 'Doctor Assistant is Listening (बोलिए)...' :
             state === 'processing' ? 'Processing Clinical Speech...' :
             state === 'recognized' ? 'Voice Recognized' : 'Microphone Ready'}
          </span>
        </div>
        <span className="text-[11px] font-medium text-teal-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
          {languageLabel}
        </span>
      </div>

      <canvas 
        ref={canvasRef} 
        width={480} 
        height={height} 
        className="w-full max-w-lg h-24 my-1 cursor-pointer"
        onClick={onTapMic}
      />

      {transcript && (
        <div className="mt-2 px-4 py-2 rounded-xl bg-slate-800/90 border border-teal-500/30 text-teal-200 text-xs sm:text-sm font-serif italic max-w-xl text-center animate-in fade-in">
          "{transcript}"
        </div>
      )}
    </div>
  );
};
