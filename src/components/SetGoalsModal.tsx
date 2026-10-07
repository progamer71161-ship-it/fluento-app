import React, { useState } from 'react';
import {
  X,
  Target,
  Check,
  Sparkles,
  Sliders,
  CheckCircle2,
  TrendingUp,
  Flame,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SpeechTargetGoal, SessionHistoryItem, CommunicationClassTier, CommunicationClassLevel } from '../types';
import { DEFAULT_GOAL_PRESETS, COMMUNICATION_CLASSES, computeGoalProgress } from '../data/goals';

interface SetGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGoal: SpeechTargetGoal;
  onSaveGoal: (goal: SpeechTargetGoal) => void;
  history: SessionHistoryItem[];
}

export const SetGoalsModal: React.FC<SetGoalsModalProps> = ({
  isOpen,
  onClose,
  activeGoal,
  onSaveGoal,
  history,
}) => {
  const [modalTab, setModalTab] = useState<'classes' | 'presets' | 'custom'>('classes');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(activeGoal.id);
  const [selectedClassLevel, setSelectedClassLevel] = useState<CommunicationClassLevel>('Class A');

  // Custom goal parameters
  const [customName, setCustomName] = useState<string>(activeGoal.name);
  const [customWpm, setCustomWpm] = useState<number>(activeGoal.targetWpm);
  const [customTolerance, setCustomTolerance] = useState<number>(activeGoal.wpmTolerance);
  const [customMaxFillers, setCustomMaxFillers] = useState<number>(activeGoal.maxFillers);
  const [customMinEyeContact, setCustomMinEyeContact] = useState<number>(activeGoal.minEyeContact);
  const [customMinPauses, setCustomMinPauses] = useState<number>(activeGoal.minPauseCount || 2);

  if (!isOpen) return null;

  // Selected candidate goal based on active tab
  const getCandidateGoal = (): SpeechTargetGoal => {
    if (modalTab === 'custom') {
      return {
        id: `custom_${Date.now()}`,
        name: customName || 'Custom Target',
        description: `Personalized target calibrated to ${customWpm} WPM and ≤${customMaxFillers} filler words.`,
        targetWpm: customWpm,
        wpmTolerance: customTolerance,
        maxFillers: customMaxFillers,
        minEyeContact: customMinEyeContact,
        minPauseCount: customMinPauses,
        createdAt: new Date().toISOString(),
        isCustom: true,
      };
    }

    if (modalTab === 'classes') {
      const cls = COMMUNICATION_CLASSES.find((c) => c.level === selectedClassLevel) || COMMUNICATION_CLASSES[0];
      const midWpm = Math.round((cls.idealWpmRange[0] + cls.idealWpmRange[1]) / 2);
      const tol = Math.round((cls.idealWpmRange[1] - cls.idealWpmRange[0]) / 2);
      return {
        id: `class_${cls.level.toLowerCase().replace(' ', '_')}`,
        name: `${cls.title}`,
        description: cls.description,
        targetWpm: midWpm,
        wpmTolerance: tol,
        maxFillers: cls.maxFillers,
        minEyeContact: cls.minEyeContact,
        minPauseCount: cls.minPauseCount,
        createdAt: new Date().toISOString(),
      };
    }

    return DEFAULT_GOAL_PRESETS.find((p) => p.id === selectedPresetId) || DEFAULT_GOAL_PRESETS[0];
  };

  const currentCandidate = getCandidateGoal();
  const simulatedProgress = computeGoalProgress(currentCandidate, history);

  const handleSelectClass = (cls: CommunicationClassTier) => {
    setSelectedClassLevel(cls.level);
    const midWpm = Math.round((cls.idealWpmRange[0] + cls.idealWpmRange[1]) / 2);
    const tol = Math.round((cls.idealWpmRange[1] - cls.idealWpmRange[0]) / 2);
    setCustomName(cls.title);
    setCustomWpm(midWpm);
    setCustomTolerance(tol);
    setCustomMaxFillers(cls.maxFillers);
    setCustomMinEyeContact(cls.minEyeContact);
    setCustomMinPauses(cls.minPauseCount);
  };

  const handleSelectPreset = (preset: SpeechTargetGoal) => {
    setSelectedPresetId(preset.id);
    setCustomName(preset.name);
    setCustomWpm(preset.targetWpm);
    setCustomTolerance(preset.wpmTolerance);
    setCustomMaxFillers(preset.maxFillers);
    setCustomMinEyeContact(preset.minEyeContact);
    setCustomMinPauses(preset.minPauseCount || 2);
  };

  const handleSave = () => {
    onSaveGoal(currentCandidate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="surface max-w-2xl w-full p-0 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b-2 border-[#E5E7EB] flex items-center justify-between bg-[#F0F9FF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#E5E7EB] text-[#1CB0F6] flex items-center justify-center">
              <Target className="w-5 h-5 text-[#1CB0F6]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1E293B] flex items-center gap-2">
                <span>Communication Targets & Class-Wise Levels</span>
                <span className="font-label text-[#58CC02] bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                  PROFICIENCY RUBRIC
                </span>
              </h3>
              <p className="text-xs text-[#64748B] font-medium">
                Calibrate target pace (WPM), filler word ceilings, and screen focus across communication classes
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

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 3-Way Segmented Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F0F9FF] border-2 border-[#E5E7EB] rounded-2xl text-xs font-extrabold">
            <button
              onClick={() => setModalTab('classes')}
              className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                modalTab === 'classes'
                  ? 'bg-[#1CB0F6] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Class-Wise Levels</span>
            </button>
            <button
              onClick={() => setModalTab('presets')}
              className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                modalTab === 'presets'
                  ? 'bg-[#1CB0F6] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Goal Presets</span>
            </button>
            <button
              onClick={() => setModalTab('custom')}
              className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                modalTab === 'custom'
                  ? 'bg-[#1CB0F6] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Custom Sliders</span>
            </button>
          </div>

          {/* TAB 1: Class-Wise Level Selection */}
          {modalTab === 'classes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label text-slate-500 block">
                  SELECT YOUR TARGET COMMUNICATION CLASS
                </span>
                <span className="text-[11px] text-[#64748B] font-bold">
                  Tiered clinical standards
                </span>
              </div>

              <div className="space-y-3">
                {COMMUNICATION_CLASSES.map((cls) => {
                  const isSelected = selectedClassLevel === cls.level;
                  return (
                    <div
                      key={cls.level}
                      onClick={() => handleSelectClass(cls)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F0F9FF] border-[#1CB0F6] shadow-sm'
                          : 'bg-white border-[#E5E7EB] hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold"
                            style={{ backgroundColor: cls.bgLight, color: cls.color }}
                          >
                            {cls.shortBadge}
                          </span>
                          <h4 className="text-sm font-extrabold text-[#1E293B]">{cls.title}</h4>
                        </div>
                        {isSelected ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#1CB0F6] text-white text-[11px] font-extrabold flex items-center gap-1 self-start sm:self-auto">
                            <Check className="w-3 h-3" /> Selected Target
                          </span>
                        ) : (
                          <span className="text-xs text-[#64748B] font-bold flex items-center gap-1">
                            Select <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#64748B] leading-relaxed mb-3 font-medium">
                        {cls.description}
                      </p>

                      {/* Criteria Benchmark Pill Strip */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono tabular-nums font-bold">
                        <span className="px-2.5 py-1 rounded-xl bg-[#F0F9FF] border-2 border-[#E5E7EB] text-[#1CB0F6]">
                          Tempo: {cls.idealWpmRange[0]}–{cls.idealWpmRange[1]} WPM
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-[#FFF2DE] border-2 border-[#FDE68A] text-[#D97706]">
                          Fillers: ≤ {cls.maxFillers}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-[#E5F9D3] border-2 border-[#B7EE8F] text-[#46A302]">
                          Eye Focus: ≥ {cls.minEyeContact}%
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-[#F0F9FF] border-2 border-[#E5E7EB] text-[#64748B]">
                          Pauses: ≥ {cls.minPauseCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Standard Goal Presets */}
          {modalTab === 'presets' && (
            <div className="space-y-3">
              <span className="font-label text-slate-500 block">
                SELECT A GOAL BLUEPRINT
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEFAULT_GOAL_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#F0F9FF] border-[#1CB0F6] shadow-sm'
                          : 'bg-white border-[#E5E7EB] hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-sm font-extrabold text-[#1E293B]">{preset.name}</h4>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#1CB0F6] text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] mb-3 leading-relaxed font-medium">
                          {preset.description}
                        </p>
                      </div>

                      <div className="space-y-1 text-[11px] font-mono tabular-nums text-[#64748B] pt-2 border-t-2 border-[#E5E7EB] font-bold">
                        <div className="flex justify-between text-[#1CB0F6]">
                          <span>Pace Target:</span>
                          <strong>{preset.targetWpm} ±{preset.wpmTolerance} WPM</strong>
                        </div>
                        <div className="flex justify-between text-[#FF9600]">
                          <span>Max Fillers:</span>
                          <strong>≤ {preset.maxFillers}</strong>
                        </div>
                        <div className="flex justify-between text-[#58CC02]">
                          <span>Eye Focus:</span>
                          <strong>≥ {preset.minEyeContact}%</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Custom Sliders */}
          {modalTab === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="font-label text-slate-500 block mb-1">
                  CUSTOM TARGET NAME:
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Keynote Precision Benchmark"
                  className="w-full text-xs p-2.5 bg-[#F0F9FF] border-2 border-[#E5E7EB] rounded-xl text-[#1E293B] font-bold focus:outline-hidden focus:border-[#1CB0F6]"
                />
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                <div className="p-3.5 bg-[#F0F9FF] rounded-2xl border-2 border-[#E5E7EB]">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#1E293B] mb-1">
                    <span>Target Speaking Rate</span>
                    <span className="font-mono text-[#1CB0F6]">{customWpm} WPM (±{customTolerance})</span>
                  </div>
                  <input
                    type="range"
                    min={90}
                    max={190}
                    step={5}
                    value={customWpm}
                    onChange={(e) => setCustomWpm(Number(e.target.value))}
                    className="w-full accent-[#1CB0F6] cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-[#F0F9FF] rounded-2xl border-2 border-[#E5E7EB]">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#1E293B] mb-1">
                    <span>Filler Words Ceiling</span>
                    <span className="font-mono text-[#FF9600]">≤ {customMaxFillers} allowed</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={customMaxFillers}
                    onChange={(e) => setCustomMaxFillers(Number(e.target.value))}
                    className="w-full accent-[#FF9600] cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-[#F0F9FF] rounded-2xl border-2 border-[#E5E7EB]">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#1E293B] mb-1">
                    <span>Minimum Eye Contact</span>
                    <span className="font-mono text-[#58CC02]">≥ {customMinEyeContact}%</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={95}
                    step={5}
                    value={customMinEyeContact}
                    onChange={(e) => setCustomMinEyeContact(Number(e.target.value))}
                    className="w-full accent-[#58CC02] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Simulated History Match Strip */}
          <div className="p-4 bg-[#F0F9FF] border-2 border-[#E5E7EB] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border-2 border-[#E5E7EB] text-[#1CB0F6] flex items-center justify-center shrink-0 font-bold">
                🎯
              </div>
              <div>
                <strong className="text-[#1E293B] block font-extrabold">Historical Alignment Simulation</strong>
                <span className="text-[#64748B] text-[11px] font-medium">
                  If this target had been active: {simulatedProgress.achievedCount} of {simulatedProgress.totalAttempts} past sessions would have hit all criteria.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <span className="text-base font-extrabold font-mono text-[#58CC02]">
                {simulatedProgress.successRate}%
              </span>
              <span className="text-[11px] text-[#64748B] font-bold">hit rate</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t-2 border-[#E5E7EB] bg-[#F0F9FF] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn-secondary text-xs py-2! px-4!"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="btn-primary text-xs py-2! px-5! flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 text-white" />
            <span>Apply Target to Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
