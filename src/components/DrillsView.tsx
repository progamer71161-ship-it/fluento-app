import React from 'react';
import { Play } from 'lucide-react';
import { PracticeDrill } from '../types';

interface DrillsViewProps {
  onLaunchDrill: (drill: PracticeDrill) => void;
}

const ALL_DRILLS: PracticeDrill[] = [
  {
    id: 'drill_pause_conditioning',
    title: 'The 2-Second Deliberate Pause Drill',
    pillar: 'delivery',
    timeMinutes: 2,
    targetMetric: '2.0-second silence between paragraphs',
    instructions: 'Speak one complete thought or sentence, halt vocalization, inhale gently through your nose for 2 full seconds while looking at the camera, then speak your next sentence.',
    drillType: 'pause_trainer'
  },
  {
    id: 'drill_metronome_140',
    title: 'Metronome Pacing Calibration (140 WPM)',
    pillar: 'delivery',
    timeMinutes: 3,
    targetMetric: 'Consistent 140 WPM rhythm without rushing',
    instructions: 'Synchronize your syllable stresses with the gentle audible metronome pulse. Internalize a measured, executive cadence that prevents anxiety acceleration.',
    drillType: 'metronome',
    recommendedBpm: 140
  },
  {
    id: 'drill_filler_substitution',
    title: 'Filler Substitution (Silent Breath Switch)',
    pillar: 'verbal',
    timeMinutes: 2,
    targetMetric: 'Zero "um" or "like" verbalizations',
    instructions: 'Speak spontaneously on any topic. Whenever you feel the urge to say "um", "uh", or "like", lock your lips closed and take a quiet diaphragmatic breath instead.',
    drillType: 'filler_substitution'
  },
  {
    id: 'drill_eye_anchor',
    title: 'Webcam Lens Anchor Drill',
    pillar: 'nonverbal',
    timeMinutes: 2,
    targetMetric: '90%+ sustained camera focus',
    instructions: 'Deliver a short story or answer without looking at the preview screen or desktop notes. Maintain connection directly with the camera aperture.',
    drillType: 'eye_anchor'
  },
  {
    id: 'drill_metronome_slow',
    title: 'Fluency Gentle Onset Pacing (120 WPM)',
    pillar: 'delivery',
    timeMinutes: 3,
    targetMetric: 'Gentle vocal onset and stutter-free phonation',
    instructions: 'Practice reading with light articulatory contact and smooth continuous phonation, matching the slower 120 WPM metronome.',
    drillType: 'metronome',
    recommendedBpm: 120
  }
];

export const DrillsView: React.FC<DrillsViewProps> = ({ onLaunchDrill }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-6 border-b-2 border-[#E5E7EB]">
        <div className="font-label text-slate-500 mb-0.5">TARGETED WORKOUTS</div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
          Fluency & Micro-Drills
        </h1>
        <p className="text-xs text-[#64748B] mt-1 font-medium">
          Targeted micro-conditioning exercises with audio metronomes, pause trainers, and gaze anchors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ALL_DRILLS.map((drill) => (
          <div
            key={drill.id}
            className="surface flex flex-col justify-between hover:border-[#58CC02] transition-all"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                <span className="font-label text-[#58CC02] font-bold">
                  {drill.pillar.toUpperCase()} PILLAR
                </span>
                <span className="font-mono text-xs font-bold text-[#1CB0F6]">
                  {drill.timeMinutes} MIN
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#1E293B] leading-snug">
                {drill.title}
              </h3>

              <div className="mt-3.5 p-3.5 bg-[#F0F9FF] rounded-2xl border-2 border-[#E5E7EB] text-xs">
                <span className="font-label text-slate-500 block mb-0.5">THERAPEUTIC TARGET:</span>
                <p className="text-[#1E293B] font-semibold">{drill.targetMetric}</p>
              </div>

              <p className="text-xs text-[#64748B] mt-3 leading-relaxed font-medium">
                {drill.instructions}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-[#E5E7EB] flex items-center justify-end">
              <button
                onClick={() => onLaunchDrill(drill)}
                className="btn-primary-blue text-xs py-2! px-4! flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Launch Interactive Drill</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
