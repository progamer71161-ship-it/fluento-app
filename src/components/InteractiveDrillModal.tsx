import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle, Sparkles } from 'lucide-react';
import { PracticeDrill } from '../types';

interface InteractiveDrillModalProps {
  drill: PracticeDrill | null;
  onClose: () => void;
}

export const InteractiveDrillModal: React.FC<InteractiveDrillModalProps> = ({ drill, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [bpm, setBpm] = useState(140);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pulse, setPulse] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<any>(null);
  const metronomeRef = useRef<any>(null);

  useEffect(() => {
    if (drill) {
      setSecondsLeft(drill.timeMinutes * 60);
      setBpm(drill.recommendedBpm || 140);
      setIsActive(false);
      setIsCompleted(false);
    }
  }, [drill]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (metronomeRef.current) clearInterval(metronomeRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playClickSound = (isHigh = false) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = isHigh ? 880 : 440;

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (_) {}
  };

  useEffect(() => {
    if (isActive && !isCompleted) {
      const intervalMs = (60 / bpm) * 1000;
      metronomeRef.current = setInterval(() => {
        setPulse((p) => !p);
        playClickSound(false);
      }, intervalMs);

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            clearInterval(metronomeRef.current);
            setIsActive(false);
            setIsCompleted(true);
            playClickSound(true);
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#58CC02', '#1CB0F6', '#FF9600', '#46A302'],
                disableForReducedMotion: true,
              });
            } catch (_) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (metronomeRef.current) clearInterval(metronomeRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (metronomeRef.current) clearInterval(metronomeRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, bpm, soundEnabled, isCompleted]);

  if (!drill) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setSecondsLeft(drill.timeMinutes * 60);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/70 backdrop-blur-xs">
      <div className="surface max-w-lg w-full p-0 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#E5E7EB] flex items-center justify-between bg-[#F0F9FF]">
          <div>
            <span className="font-label text-[#58CC02] block">
              INTERACTIVE MICRO-DRILL · {drill.pillar.toUpperCase()}
            </span>
            <h3 className="text-base font-extrabold text-[#1E293B]">{drill.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-[#1E293B] hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Target Metric Card */}
          <div className="bg-[#E5F9D3] border-2 border-[#B7EE8F] rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#58CC02] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-label text-[#46A302] block mb-0.5">DRILL TARGET OBJECTIVE:</span>
              <p className="text-[#1E293B] font-extrabold">{drill.targetMetric}</p>
            </div>
          </div>

          {/* Drill Instructions */}
          <div className="space-y-1">
            <span className="font-label text-slate-500 block">INSTRUCTIONS:</span>
            <p className="text-xs leading-relaxed bg-[#F0F9FF] p-3.5 rounded-2xl border-2 border-[#E5E7EB] text-[#1E293B] font-medium">
              {drill.instructions}
            </p>
          </div>

          {/* Metronome / Visual Pacing Indicator */}
          <div className="flex flex-col items-center justify-center py-6 bg-[#235390] rounded-2xl text-white relative overflow-hidden border-4 border-[#1CB0F6]">
            {/* Visual Pulse Orb */}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-100 ${
                pulse ? 'scale-115 bg-white/30' : 'scale-90 bg-white/10'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full transition-colors duration-100 ${
                  pulse ? 'bg-[#58CC02]' : 'bg-[#1CB0F6]'
                }`}
              />
            </div>

            {/* Timer readout */}
            <div className="mt-4 text-3xl font-extrabold font-mono tabular-nums tracking-wider text-white">
              {formatTime(secondsLeft)}
            </div>
            <span className="font-label text-white/80 mt-1">
              {isActive ? 'SESSION IN PROGRESS...' : isCompleted ? 'DRILL COMPLETED!' : 'READY TO START'}
            </span>

            {/* Metronome Speed adjustment if applicable */}
            {drill.drillType === 'metronome' && (
              <div className="mt-4 px-6 w-full flex items-center justify-between text-xs text-white/90">
                <span className="font-mono font-bold">Tempo: {bpm} BPM</span>
                <input
                  type="range"
                  min={100}
                  max={180}
                  step={5}
                  value={bpm}
                  disabled={isActive}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-36 accent-[#58CC02] cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Completion Celebration Message */}
          {isCompleted && (
            <div className="p-3.5 bg-[#E5F9D3] border-2 border-[#B7EE8F] rounded-2xl text-center flex items-center justify-center gap-2 text-[#46A302] text-xs font-extrabold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-[#58CC02]" />
              <span>Great practice! Your nervous system is calibrating this natural cadence.</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="btn-secondary py-1.5! px-3! text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#1CB0F6]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>{soundEnabled ? 'Chime On' : 'Muted'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="w-9 h-9 rounded-xl border-2 border-[#E5E7EB] hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer text-[#64748B]"
                title="Reset drill timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {!isActive ? (
                <button
                  onClick={() => setIsActive(true)}
                  className="btn-primary text-xs py-2! px-5! flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Drill</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsActive(false)}
                  className="btn-secondary text-xs py-2! px-5! flex items-center gap-1.5"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
