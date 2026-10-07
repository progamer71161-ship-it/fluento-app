import React, { useState } from 'react';
import { X, Sparkles, Sliders } from 'lucide-react';
import { Scenario, SessionMetrics } from '../types';
import { SCENARIOS } from '../data/scenarios';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (metrics: SessionMetrics) => void;
  activeScenario: Scenario;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  onAnalyze,
  activeScenario,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState(activeScenario.id);
  const [transcript, setTranscript] = useState(activeScenario.sampleTranscript);
  const [wpm, setWpm] = useState(activeScenario.sampleMetrics.wordsPerMinute);
  const [fillerCount, setFillerCount] = useState(activeScenario.sampleMetrics.fillerWordCount);
  const [eyeContact, setEyeContact] = useState(activeScenario.sampleMetrics.eyeContactPercentage);
  const [posture, setPosture] = useState(activeScenario.sampleMetrics.postureStabilityPercentage);
  const [duration, setDuration] = useState(activeScenario.sampleMetrics.durationSeconds);
  const [pauseCount, setPauseCount] = useState(activeScenario.sampleMetrics.pauseCount);

  if (!isOpen) return null;

  const handleSelectScenario = (id: string) => {
    const sc = SCENARIOS.find((s) => s.id === id);
    if (!sc) return;
    setSelectedScenarioId(id);
    setTranscript(sc.sampleTranscript);
    setWpm(sc.sampleMetrics.wordsPerMinute);
    setFillerCount(sc.sampleMetrics.fillerWordCount);
    setEyeContact(sc.sampleMetrics.eyeContactPercentage);
    setPosture(sc.sampleMetrics.postureStabilityPercentage);
    setDuration(sc.sampleMetrics.durationSeconds);
    setPauseCount(sc.sampleMetrics.pauseCount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    const words = transcript.trim().split(/\s+/).length;
    const currentScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || activeScenario;

    const metrics: SessionMetrics = {
      id: `manual_${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scenarioId: currentScenario.id,
      scenarioTitle: currentScenario.title,
      durationSeconds: duration,
      wordCount: words,
      wordsPerMinute: wpm,
      fillerWordCount: fillerCount,
      fillerDetails: fillerCount > 0 ? [{ word: 'um', count: fillerCount, timestamps: [12, 28] }] : [],
      eyeContactPercentage: eyeContact,
      postureStabilityPercentage: posture,
      pauseCount: pauseCount,
      averagePauseSeconds: 1.5,
      transcript: transcript.trim(),
      timelineEvents: [
        { timestamp: Math.round(duration * 0.25), type: 'filler', label: `Filler word bridge` },
        { timestamp: Math.round(duration * 0.5), type: 'pause', label: `Natural pause interval` },
      ],
    };

    onAnalyze(metrics);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/70 backdrop-blur-xs">
      <div className="surface max-w-2xl w-full max-h-[90vh] flex flex-col p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#E5E7EB] flex items-center justify-between bg-[#F0F9FF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#E5E7EB] flex items-center justify-center text-[#1CB0F6]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#1E293B]">Custom Session & Benchmark Input</h2>
              <p className="text-xs text-[#64748B] font-medium">
                Test communication metrics directly with preset benchmarks or custom transcripts
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Preset Selector */}
          <div>
            <label className="font-label text-slate-500 block mb-2">
              SELECT PRESET SCENARIO TEMPLATE:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SCENARIOS.map((sc) => (
                <button
                  type="button"
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`p-3 rounded-2xl text-left border-2 text-xs transition-all cursor-pointer ${
                    selectedScenarioId === sc.id
                      ? 'border-[#1CB0F6] bg-[#F0F9FF] text-[#1E293B] font-bold shadow-xs'
                      : 'border-[#E5E7EB] hover:border-slate-300 text-[#64748B] bg-white'
                  }`}
                >
                  <span className="font-extrabold block truncate text-[#1E293B]">{sc.title}</span>
                  <span className="text-[11px] text-[#64748B] font-mono tabular-nums font-medium">
                    Target: {sc.targetWpmRange[0]}–{sc.targetWpmRange[1]} WPM
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Transcript Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-label text-slate-500">SPEECH TRANSCRIPT CONTENT</label>
              <span className="text-xs text-[#64748B] font-mono tabular-nums font-bold">
                {transcript.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste or type speech transcript..."
              className="w-full text-sm p-3.5 border-2 border-[#E5E7EB] bg-[#F0F9FF] rounded-2xl focus:outline-hidden focus:border-[#1CB0F6] text-[#1E293B] leading-relaxed font-sans font-medium"
              required
            />
          </div>

          {/* Sliders for Core Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t-2 border-[#E5E7EB]">
            {/* WPM Slider */}
            <div className="bg-[#F0F9FF] p-3.5 rounded-2xl border-2 border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-extrabold text-[#1E293B]">Speaking Pace (WPM)</span>
                <span className="font-extrabold font-mono tabular-nums text-[#1CB0F6]">{wpm} WPM</span>
              </div>
              <input
                type="range"
                min={70}
                max={220}
                step={2}
                value={wpm}
                onChange={(e) => setWpm(Number(e.target.value))}
                className="w-full accent-[#1CB0F6] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] mt-1 font-mono font-bold">
                <span>Slow (80)</span>
                <span className="text-[#58CC02]">Ideal (130-155)</span>
                <span>Fast (210)</span>
              </div>
            </div>

            {/* Filler Words Slider */}
            <div className="bg-[#F0F9FF] p-3.5 rounded-2xl border-2 border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-extrabold text-[#1E293B]">Filler Word Count</span>
                <span className="font-extrabold font-mono tabular-nums text-[#FF9600]">{fillerCount} fillers</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={fillerCount}
                onChange={(e) => setFillerCount(Number(e.target.value))}
                className="w-full accent-[#FF9600] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] mt-1 font-mono font-bold">
                <span>0 (Clean)</span>
                <span>5 (Normal)</span>
                <span>15+ (Frequent)</span>
              </div>
            </div>

            {/* Eye Contact Slider */}
            <div className="bg-[#F0F9FF] p-3.5 rounded-2xl border-2 border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-extrabold text-[#1E293B]">Eye Contact %</span>
                <span className="font-extrabold font-mono tabular-nums text-[#58CC02]">{eyeContact}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={eyeContact}
                onChange={(e) => setEyeContact(Number(e.target.value))}
                className="w-full accent-[#58CC02] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] mt-1 font-mono font-bold">
                <span>20%</span>
                <span className="text-[#58CC02]">80%+ (Strong)</span>
                <span>100%</span>
              </div>
            </div>

            {/* Posture & Stability Slider */}
            <div className="bg-[#F0F9FF] p-3.5 rounded-2xl border-2 border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-extrabold text-[#1E293B]">Posture Stability %</span>
                <span className="font-extrabold font-mono tabular-nums text-[#1CB0F6]">{posture}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={100}
                step={5}
                value={posture}
                onChange={(e) => setPosture(Number(e.target.value))}
                className="w-full accent-[#1CB0F6] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] mt-1 font-mono font-bold">
                <span>30%</span>
                <span className="text-[#58CC02]">85%+ (Poised)</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Duration & Pauses */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-[#1E293B] block mb-1">
                Duration: <span className="font-mono tabular-nums text-[#1CB0F6]">{duration}s</span>
              </label>
              <input
                type="range"
                min={15}
                max={180}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-[#1CB0F6] cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-extrabold text-[#1E293B] block mb-1">
                Deliberate Pauses: <span className="font-mono tabular-nums text-[#58CC02]">{pauseCount}</span>
              </label>
              <input
                type="range"
                min={0}
                max={12}
                value={pauseCount}
                onChange={(e) => setPauseCount(Number(e.target.value))}
                className="w-full accent-[#58CC02] cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t-2 border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2! px-4!"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2! px-5! flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Evaluate with AI Coach</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
