import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Wind,
  Volume2,
  Activity,
  CheckCircle2,
  ArrowRight,
  Smile
} from 'lucide-react';

interface QuickWarmupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPracticeAfterWarmup?: () => void;
}

export type WarmupExerciseType = 'breath' | 'resonance' | 'trills' | 'articulation';

interface WarmupExercise {
  id: WarmupExerciseType;
  title: string;
  category: 'Breath Control' | 'Vocal Resonance' | 'Vocal Agility';
  tagline: string;
  clinicalPurpose: string;
  totalSeconds: number;
  phases: {
    startSec: number;
    endSec: number;
    phaseName: string;
    instruction: string;
    vocalAction: string;
  }[];
}

const WARMUP_EXERCISES: WarmupExercise[] = [
  {
    id: 'breath',
    title: 'Diaphragmatic Breath Pacing',
    category: 'Breath Control',
    tagline: 'Establish subglottal pressure & calm speech anxiety',
    clinicalPurpose: 'Regulates airflow consistency, stabilizes speaking rate, and relaxes throat muscles prior to speech delivery.',
    totalSeconds: 30,
    phases: [
      { startSec: 0, endSec: 4, phaseName: 'INHALE', instruction: 'Inhale deeply through your nose, expanding your lower ribs and belly.', vocalAction: 'Breathe In (Belly out)' },
      { startSec: 4, endSec: 7, phaseName: 'HOLD', instruction: 'Suspend gently without locking your throat or lifting shoulders.', vocalAction: 'Hold & Relax Shoulders' },
      { startSec: 7, endSec: 10, phaseName: 'EXHALE', instruction: 'Release a steady, audible "Sssss" hiss through your teeth.', vocalAction: 'Exhale with "Sssss"' },
      { startSec: 10, endSec: 14, phaseName: 'INHALE', instruction: 'Second deep diaphragmatic inhalation.', vocalAction: 'Deep Belly Inhale' },
      { startSec: 14, endSec: 17, phaseName: 'HOLD', instruction: 'Maintain open, poised chest alignment.', vocalAction: 'Suspend & Poise' },
      { startSec: 17, endSec: 20, phaseName: 'EXHALE', instruction: 'Exhale steadily with "Shhhh", feeling lower abdomen engage.', vocalAction: 'Exhale with "Shhhh"' },
      { startSec: 20, endSec: 24, phaseName: 'INHALE', instruction: 'Final expansive breath to prime vocal airflow.', vocalAction: 'Full Inhale' },
      { startSec: 24, endSec: 27, phaseName: 'HOLD', instruction: 'Feel centered, present, and calm.', vocalAction: 'Stay Centered' },
      { startSec: 27, endSec: 30, phaseName: 'EXHALE', instruction: 'Slow continuous exhale blowing out an imaginary candle.', vocalAction: 'Smooth Complete Release' }
    ]
  },
  {
    id: 'resonance',
    title: 'Mask Resonance & Humming',
    category: 'Vocal Resonance',
    tagline: 'Forward acoustic placement for rich, effortless projection',
    clinicalPurpose: 'Shifts acoustic vibration from the throat into the facial mask (lips, bridge of nose) to amplify vocal presence without strain.',
    totalSeconds: 30,
    phases: [
      { startSec: 0, endSec: 6, phaseName: 'LOW MASK HUM', instruction: 'Gently touch lips together with loose jaw. Hum "Mmmmm", feeling tingling on your lips.', vocalAction: 'Low Hum: "Mmmmmm"' },
      { startSec: 6, endSec: 12, phaseName: 'CHEST-TO-NOSE HUM', instruction: 'Shift the hum from chest vibration up to the bridge of your nose and cheekbones.', vocalAction: 'Mid Resonance: "Mmm-Hmm"' },
      { startSec: 12, endSec: 18, phaseName: 'NASAL CONSONANT OPEN', instruction: 'Transition "Mmm" into "Mee-May-Mah", feeling the sound project out front.', vocalAction: '"Mee - May - Mah"' },
      { startSec: 18, endSec: 24, phaseName: 'BELL TONE RESONANCE', instruction: 'Hum an upbeat resonant "Ding-Dong", projecting clarity effortlessly.', vocalAction: '"Ding - Dong - Sing"' },
      { startSec: 24, endSec: 30, phaseName: 'WARM EXECUTIVE TONE', instruction: 'Say warmly: "One, two, three, clear and bright", feeling full facial resonance.', vocalAction: 'Resonant Speech: "1, 2, 3"' }
    ]
  },
  {
    id: 'trills',
    title: 'Lip Trill Pitch Glides',
    category: 'Vocal Agility',
    tagline: 'Vocal cord coordination and dynamic range priming',
    clinicalPurpose: 'Balances airflow resistance and releases jaw/larynx tension to expand pitch flexibility and avoid monotonous delivery.',
    totalSeconds: 30,
    phases: [
      { startSec: 0, endSec: 8, phaseName: 'LIP FLUTTER BASELINE', instruction: 'Blow air through relaxed lips to create a continuous motorboat "Brrrr" buzz.', vocalAction: 'Lip Trill: "Brrrrr"' },
      { startSec: 8, endSec: 15, phaseName: 'UPWARD GLIDE', instruction: 'While trilling, slide pitch smoothly from low comfort to a gentle high note.', vocalAction: 'Slide Upwards (Low → High)' },
      { startSec: 15, endSec: 22, phaseName: 'DOWNWARD GLIDE', instruction: 'Glide the trill gently back down like a landing airplane.', vocalAction: 'Slide Downwards (High → Low)' },
      { startSec: 22, endSec: 30, phaseName: 'SIREN WAVES', instruction: 'Roll the trill in two continuous gentle waves (low-high-low) to loosen cords.', vocalAction: 'Smooth Siren Waves' }
    ]
  },
  {
    id: 'articulation',
    title: 'Diction & Consonant Agility',
    category: 'Vocal Agility',
    tagline: 'Rapid tongue, lip, and palate articulation',
    clinicalPurpose: 'Enlivens the articulators (lips, teeth, tongue, soft palate) to prevent slurring and ensure punchy, crisp word endings.',
    totalSeconds: 30,
    phases: [
      { startSec: 0, endSec: 10, phaseName: 'TONGUE TIP & PALATE', instruction: 'Repeat rhythmically: "Ta-Ka-Ta-Ka, Da-Ga-Da-Ga", feeling sharp consonant releases.', vocalAction: '"Ta-Ka-Ta-Ka, Da-Ga-Da-Ga"' },
      { startSec: 10, endSec: 20, phaseName: 'LIP & TOOTH TRANSITIONS', instruction: 'Recite clearly: "Red leather, yellow leather, rich leather".', vocalAction: '"Red leather, yellow leather"' },
      { startSec: 20, endSec: 30, phaseName: 'CRISP DENTAL VELAR', instruction: 'Deliver punchy cadence: "Unique New York, crisp consonant delivery".', vocalAction: '"Unique New York, you need it"' }
    ]
  }
];

export const QuickWarmupModal: React.FC<QuickWarmupModalProps> = ({
  isOpen,
  onClose,
  onStartPracticeAfterWarmup,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<WarmupExerciseType>('breath');
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const activeExercise = WARMUP_EXERCISES.find((e) => e.id === selectedExercise) || WARMUP_EXERCISES[0];

  const currentPhase = activeExercise.phases.find(
    (p) => elapsedSeconds >= p.startSec && elapsedSeconds < p.endSec
  ) || activeExercise.phases[activeExercise.phases.length - 1];

  // Stop audio and timers when modal closes
  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      stopAudioSynthesis();
    };
  }, [isOpen]);

  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playPhaseChime = (high = false) => {
    try {
      initAudioContext();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(high ? 659.25 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (_) {}
  };

  const startAudioSynthesis = () => {
    try {
      initAudioContext();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      if (!oscillatorRef.current) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.035, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      }
    } catch (_) {}
  };

  const stopAudioSynthesis = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch (_) {}
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setIsCompleted(false);
    startAudioSynthesis();
    playPhaseChime(false);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextSec = prev + 1;

        // Dynamic frequency modulation for exercises
        if (audioCtxRef.current && oscillatorRef.current) {
          const ctx = audioCtxRef.current;
          if (selectedExercise === 'breath') {
            const cycleSec = nextSec % 10;
            if (cycleSec < 4) {
              oscillatorRef.current.frequency.setValueAtTime(196 + cycleSec * 15, ctx.currentTime);
            } else if (cycleSec < 7) {
              oscillatorRef.current.frequency.setValueAtTime(256, ctx.currentTime);
            } else {
              oscillatorRef.current.frequency.setValueAtTime(256 - (cycleSec - 7) * 20, ctx.currentTime);
            }
          } else if (selectedExercise === 'trills') {
            const freq = 130 + Math.sin(nextSec * 0.7) * 60;
            oscillatorRef.current.frequency.setValueAtTime(freq, ctx.currentTime);
          } else if (selectedExercise === 'resonance') {
            const baseNotes = [130.81, 146.83, 164.81, 174.61, 196.00];
            const noteIdx = Math.floor(nextSec / 6) % baseNotes.length;
            oscillatorRef.current.frequency.setValueAtTime(baseNotes[noteIdx], ctx.currentTime);
          }
        }

        // Chime on major phase transitions
        if ([4, 7, 10, 14, 17, 20, 24, 27].includes(nextSec)) {
          playPhaseChime(nextSec >= 24);
        }

        // Complete 30-second duration
        if (nextSec >= activeExercise.totalSeconds) {
          clearInterval(timerIntervalRef.current);
          setIsPlaying(false);
          setIsCompleted(true);
          stopAudioSynthesis();
          playPhaseChime(true);
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#58CC02', '#1CB0F6', '#FF9600', '#46A302'],
              disableForReducedMotion: true,
            });
          } catch (_) {}
          return activeExercise.totalSeconds;
        }

        return nextSec;
      });
    } , 1000);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    stopAudioSynthesis();
  };

  const handleReset = () => {
    handlePause();
    setElapsedSeconds(0);
    setIsCompleted(false);
  };

  const handleSelectExercise = (id: WarmupExerciseType) => {
    handleReset();
    setSelectedExercise(id);
  };

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((elapsedSeconds / activeExercise.totalSeconds) * 100));
  const remainingSeconds = Math.max(0, activeExercise.totalSeconds - elapsedSeconds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="surface w-full max-w-xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b-2 border-[#E5E7EB] flex items-center justify-between bg-[#F0F9FF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#E5E7EB] text-[#1CB0F6] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#1CB0F6]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1E293B] flex items-center gap-2">
                <span>30-Second Quick Vocal Warmup</span>
                <span className="font-label text-[#58CC02] bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                  GUIDED AUDIO
                </span>
              </h3>
              <p className="text-xs text-[#64748B] font-medium">
                Prepare your vocal cords, subglottal breath, and resonance before speaking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-[#1E293B] hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exercise Tab Strip */}
        <div className="p-3 bg-[#F0F9FF] border-b-2 border-[#E5E7EB] flex items-center gap-2 overflow-x-auto text-xs">
          {WARMUP_EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSelectExercise(ex.id)}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedExercise === ex.id
                  ? 'bg-[#1CB0F6] text-white shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#1E293B] border-2 border-[#E5E7EB]'
              }`}
            >
              {ex.id === 'breath' && <Wind className="w-3.5 h-3.5" />}
              {ex.id === 'resonance' && <Volume2 className="w-3.5 h-3.5" />}
              {ex.id === 'trills' && <Activity className="w-3.5 h-3.5" />}
              {ex.id === 'articulation' && <Smile className="w-3.5 h-3.5" />}
              <span>{ex.title}</span>
            </button>
          ))}
        </div>

        {/* Interactive Guided Warmup Canvas Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Exercise Info */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-1 font-bold">
              <span className="font-label text-[#58CC02]">
                {activeExercise.category.toUpperCase()}
              </span>
              <span className="font-mono">{activeExercise.totalSeconds}s Guided Routine</span>
            </div>
            <h4 className="text-lg font-extrabold text-[#1E293B]">{activeExercise.title}</h4>
            <p className="text-xs text-[#64748B] mt-1 font-medium">{activeExercise.clinicalPurpose}</p>
          </div>

          {/* Visual Breathing & Resonance Animated Orb */}
          <div className="py-6 flex flex-col items-center justify-center bg-[#F0F9FF] rounded-2xl border-2 border-[#E5E7EB] relative overflow-hidden">
            {/* Pulsing visual guide orb */}
            <div className="relative flex items-center justify-center">
              <div
                className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-700 ${
                  isPlaying
                    ? currentPhase.phaseName.includes('INHALE')
                      ? 'scale-115 bg-[#E5F9D3] border-4 border-[#58CC02] shadow-lg shadow-[#58CC02]/20'
                      : currentPhase.phaseName.includes('HOLD')
                      ? 'scale-110 bg-[#FFF2DE] border-4 border-[#FF9600] shadow-md shadow-[#FF9600]/20'
                      : 'scale-90 bg-[#E0F2FE] border-4 border-[#1CB0F6]'
                    : isCompleted
                    ? 'scale-100 bg-[#E5F9D3] border-4 border-[#58CC02]'
                    : 'scale-100 bg-white border-2 border-[#E5E7EB]'
                }`}
              >
                <div className="text-center p-2">
                  <span className="font-label text-[#64748B] block">
                    {isPlaying ? currentPhase.phaseName : isCompleted ? 'FINISHED' : 'READY'}
                  </span>
                  <span className="text-4xl font-extrabold font-mono tabular-nums text-[#1E293B] block my-0.5">
                    {remainingSeconds}s
                  </span>
                  <span className="text-[10px] text-[#64748B] font-bold block">
                    {isPlaying ? 'Audio Guide Playing' : isCompleted ? 'Primed!' : '30s Exercise'}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Phase Action Banner */}
            <div className="mt-5 text-center max-w-sm px-4">
              <div className="inline-block px-3 py-1 rounded-xl bg-white text-[#1CB0F6] text-xs font-extrabold font-mono mb-2 border-2 border-[#E5E7EB]">
                {currentPhase.vocalAction}
              </div>
              <p className="text-xs text-[#1E293B] font-medium leading-relaxed">
                {currentPhase.instruction}
              </p>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full absolute bottom-0 left-0 right-0 h-2 bg-[#E5E7EB]">
              <div
                className="h-full bg-[#58CC02] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Exercise Complete Encouragement Banner */}
          {isCompleted && (
            <div className="p-4 bg-[#E5F9D3] border-2 border-[#B7EE8F] rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#58CC02] shrink-0" />
                <div>
                  <strong className="text-[#1E293B] block font-extrabold">Vocal Preparation Complete!</strong>
                  <span className="text-[#64748B] font-medium">
                    Your breath flow and vocal cords are primed. Jump straight into practice.
                  </span>
                </div>
              </div>

              {onStartPracticeAfterWarmup && (
                <button
                  onClick={() => {
                    onClose();
                    onStartPracticeAfterWarmup();
                  }}
                  className="btn-primary py-2! px-3.5! text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <span>Practice Now</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Controls Footer */}
        <div className="p-4 border-t-2 border-[#E5E7EB] bg-[#F0F9FF] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="btn-primary text-xs py-2! px-4! flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{elapsedSeconds > 0 ? 'Resume Audio' : 'Start 30s Audio Guide'}</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="btn-secondary text-xs py-2! px-4! flex items-center gap-2"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleReset}
              disabled={elapsedSeconds === 0}
              className={`p-2.5 rounded-xl border-2 border-[#E5E7EB] transition-colors ${
                elapsedSeconds > 0
                  ? 'text-[#64748B] hover:text-[#1E293B] bg-white cursor-pointer'
                  : 'text-slate-300 bg-slate-100 cursor-not-allowed opacity-50'
              }`}
              title="Reset to 0s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-bold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer px-3 py-2"
            >
              Skip Warmup
            </button>

            {onStartPracticeAfterWarmup && (
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                  onStartPracticeAfterWarmup();
                }}
                className="btn-primary-blue text-xs py-2! px-4! flex items-center gap-1.5"
              >
                <span>Jump to Practice</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
