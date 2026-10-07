import React from 'react';
import { ArrowRight, Sparkles, Mic, BookOpen } from 'lucide-react';
import { Scenario } from '../types';
import { SCENARIOS } from '../data/scenarios';

interface ScenariosViewProps {
  onSelectScenario: (scenario: Scenario) => void;
  onPreloadBenchmark: (scenario: Scenario) => void;
}

export const ScenariosView: React.FC<ScenariosViewProps> = ({
  onSelectScenario,
  onPreloadBenchmark,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#E5E7EB]">
        <div>
          <div className="font-label text-slate-500 mb-0.5">CURATED EXERCISES</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
            Communication Scenarios
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Specialized speech scenarios calibrated with clinical cadence benchmarks and executive rubrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            className="surface flex flex-col justify-between hover:border-[#1CB0F6] transition-all group"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                <span className="font-label text-[#1CB0F6] font-bold">
                  {scenario.category}
                </span>
                <div className="flex items-center gap-3 font-mono tabular-nums text-[11px] font-bold">
                  <span>Pace: {scenario.targetWpmRange[0]}–{scenario.targetWpmRange[1]} WPM</span>
                  <span>Eye: &gt;{scenario.targetEyeContact}%</span>
                </div>
              </div>

              <h2 className="text-xl font-extrabold text-[#1E293B] group-hover:text-[#1CB0F6] transition-colors leading-snug">
                {scenario.title}
              </h2>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed font-medium">
                {scenario.description}
              </p>

              {/* Prompt box */}
              <div className="mt-4 p-3.5 bg-[#F0F9FF] rounded-2xl border-2 border-[#E5E7EB]">
                <span className="font-label text-slate-500 block mb-0.5">PROMPT QUESTION:</span>
                <p className="text-xs italic text-[#1E293B] font-semibold">"{scenario.promptQuestion}"</p>
              </div>

              {/* Clinical Delivery Hints */}
              <div className="mt-4 space-y-1.5">
                <span className="font-label text-slate-500 block">COACHING DIRECTIVES:</span>
                {scenario.hints.map((hint, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#64748B] font-medium">
                    <span className="text-[#58CC02] font-black shrink-0">✓</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions with 3D tactile buttons */}
            <div className="mt-6 pt-4 border-t-2 border-[#E5E7EB] flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => onPreloadBenchmark(scenario)}
                className="btn-secondary text-xs py-2! px-3.5! flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1CB0F6]" />
                <span>Evaluate Benchmark</span>
              </button>

              <button
                onClick={() => onSelectScenario(scenario)}
                className="btn-primary text-xs py-2! px-4! flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5 text-white" />
                <span>Practice Live</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
