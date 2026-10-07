import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Eye,
  Mic,
  MessageSquare,
  Clock,
  Play,
  RotateCcw,
  Copy,
  Check,
  PartyPopper,
  Target,
  Layers,
  Flame,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { EvaluationResult, SessionMetrics, PracticeDrill, SpeechTargetGoal, SessionHistoryItem } from '../types';
import {
  analyzeCommunicationClass,
  evaluateMetricsAgainstGoal,
  computeGoalProgress,
  DEFAULT_GOAL_PRESETS,
} from '../data/goals';
import { SetGoalsModal } from './SetGoalsModal';

interface EvaluationViewProps {
  metrics: SessionMetrics;
  evaluation: EvaluationResult;
  onStartNewPractice: () => void;
  onLaunchDrill: (drill: PracticeDrill) => void;
  activeGoal?: SpeechTargetGoal;
  onUpdateGoal?: (goal: SpeechTargetGoal) => void;
  history?: SessionHistoryItem[];
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  metrics,
  evaluation,
  onStartNewPractice,
  onLaunchDrill,
  activeGoal,
  onUpdateGoal,
  history,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSetGoalsModalOpen, setIsSetGoalsModalOpen] = useState(false);

  const currentGoal = activeGoal || DEFAULT_GOAL_PRESETS[0];
  const classAnalysis = analyzeCommunicationClass(metrics, 'Class A');
  const goalEval = evaluateMetricsAgainstGoal(currentGoal, metrics);
  const goalProgress = computeGoalProgress(currentGoal, history || []);

  // Celebratory confetti sequence on session completion in Duolingo palette
  const triggerConfetti = () => {
    try {
      // Stage 1: Central fountain
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#58CC02', '#1CB0F6', '#FF9600', '#46A302', '#1899D6', '#FFFFFF'],
        disableForReducedMotion: true,
      });

      // Stage 2: Left and right celebratory arcs
      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 55,
          origin: { x: 0.05, y: 0.7 },
          colors: ['#58CC02', '#1CB0F6', '#FF9600'],
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 55,
          origin: { x: 0.95, y: 0.7 },
          colors: ['#58CC02', '#1CB0F6', '#FF9600'],
          disableForReducedMotion: true,
        });
      }, 240);
    } catch (err) {
      console.warn('Confetti effect error:', err);
    }
  };

  useEffect(() => {
    triggerConfetti();
  }, [metrics.id]);

  const handleCopyReport = () => {
    const markdown = `# Fluento Communication Evaluation Report
Scenario: ${metrics.scenarioTitle}
Date: ${new Date().toLocaleDateString()}
Duration: ${metrics.durationSeconds}s | Pace: ${metrics.wordsPerMinute} WPM | Fillers: ${metrics.fillerWordCount} | Eye Contact: ${metrics.eyeContactPercentage}%

## Overall Score: ${evaluation.overallScore}/100
Primary Genuine Strength: ${evaluation.primaryGenuineStrength}
Summary: ${evaluation.warmEncouragingSummary}

### 1. Delivery & Pace (Score: ${evaluation.deliveryAndPace.score}/100)
- Pace Assessment: ${evaluation.deliveryAndPace.paceAssessment}
- Key Observation: ${evaluation.deliveryAndPace.keyObservation}
Strengths:
${evaluation.deliveryAndPace.strengths.map((s) => `  * ${s}`).join('\n')}
Actionable Tips:
${evaluation.deliveryAndPace.actionableTips.map((t) => `  * ${t}`).join('\n')}

### 2. Verbal Content (Score: ${evaluation.verbalContent.score}/100)
- Structure & Tone: ${evaluation.verbalContent.structureTone}
- Filler Word Analysis: ${evaluation.verbalContent.fillerWordAnalysis}
- Key Observation: ${evaluation.verbalContent.keyObservation}
Strengths:
${evaluation.verbalContent.strengths.map((s) => `  * ${s}`).join('\n')}
Actionable Tips:
${evaluation.verbalContent.actionableTips.map((t) => `  * ${t}`).join('\n')}

### 3. Non-Verbal Cues (Score: ${evaluation.nonVerbalCues.score}/100)
- Eye Contact: ${evaluation.nonVerbalCues.eyeContactAssessment}
- Engagement: ${evaluation.nonVerbalCues.facialPostureEngagement}
- Key Observation: ${evaluation.nonVerbalCues.keyObservation}
Strengths:
${evaluation.nonVerbalCues.strengths.map((s) => `  * ${s}`).join('\n')}
Actionable Tips:
${evaluation.nonVerbalCues.actionableTips.map((t) => `  * ${t}`).join('\n')}
`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Header matching Variation 5 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1 font-bold">
            <span className="font-label text-[#58CC02]">SESSION COMPLETED</span>
            <span aria-hidden="true">•</span>
            <span className="text-[#1E293B]">{metrics.scenarioTitle}</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono tabular-nums">{formatSecs(metrics.durationSeconds)} duration</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
            Communication Coaching Report
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={triggerConfetti}
            className="btn-secondary py-2! px-3.5! text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            title="Celebrate session completion with confetti!"
          >
            <PartyPopper className="w-3.5 h-3.5 text-[#FF9600]" />
            <span>Celebrate 🎉</span>
          </button>

          <button
            onClick={handleCopyReport}
            className="btn-secondary py-2! px-3.5! text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#58CC02]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Report' : 'Copy Report'}</span>
          </button>

          <button
            onClick={onStartNewPractice}
            className="btn-primary py-2! px-4! text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white" />
            <span>Practice Another Session</span>
          </button>
        </div>
      </div>

      {/* Primary Genuine Strength Spotlight (Praise First) - Variation 5 Surface Green */}
      <div className="surface-green p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-15 pointer-events-none">
          <Award className="w-32 h-32 text-white" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1 flex-1">
            <span className="font-label text-white/90 tracking-widest block">
              CORE GENUINE STRENGTH SPOTLIGHT
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              "{evaluation.primaryGenuineStrength}"
            </h2>
            <p className="text-sm text-white/90 leading-relaxed max-w-3xl font-medium mt-1">
              {evaluation.warmEncouragingSummary}
            </p>
          </div>
          <div className="sm:text-right shrink-0 bg-white text-[#1E293B] px-5 py-3 rounded-2xl border-2 border-white/40 shadow-md">
            <span className="font-label text-slate-500 block">OVERALL SCORE</span>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-4xl font-extrabold font-mono tabular-nums text-[#58CC02]">
                {evaluation.overallScore}
              </span>
              <span className="text-xs text-slate-400 font-bold">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Class-Wise Level Communication Analysis & Target Goal Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Class-Wise Communication Level Analysis */}
        <div className="surface flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5E7EB] mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#1CB0F6] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#1CB0F6]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1E293B]">Class-Wise Level Analysis</h3>
                  <span className="font-label text-slate-500">STANDARDIZED TIERED RUBRIC</span>
                </div>
              </div>

              <span
                className="px-3 py-1 rounded-xl text-xs font-mono font-extrabold border-2 flex items-center gap-1.5"
                style={{
                  backgroundColor: classAnalysis.currentClass.bgLight,
                  color: classAnalysis.currentClass.color,
                  borderColor: classAnalysis.currentClass.borderColor,
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{classAnalysis.currentClass.shortBadge}</span>
              </span>
            </div>

            <div className="mb-4">
              <h4 className="text-base font-extrabold text-[#1E293B] mb-1">
                {classAnalysis.currentClass.title}
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                {classAnalysis.currentClass.description}
              </p>
            </div>

            {/* Pillar Tier Breakdown */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y-2 border-[#E5E7EB] text-xs">
              <div className="text-center p-2.5 rounded-xl bg-[#F0F9FF] border-2 border-[#E5E7EB]">
                <span className="font-label text-slate-500 block">PACE CLASS</span>
                <span className="font-mono font-extrabold text-[#1CB0F6] block mt-0.5 text-sm">
                  {classAnalysis.pillarBreakdown.paceClass}
                </span>
                <span className="text-[11px] font-bold text-[#64748B]">{metrics.wordsPerMinute} WPM</span>
              </div>
              <div className="text-center p-2.5 rounded-xl bg-[#F0F9FF] border-2 border-[#E5E7EB]">
                <span className="font-label text-slate-500 block">FILLER CLASS</span>
                <span className="font-mono font-extrabold text-[#FF9600] block mt-0.5 text-sm">
                  {classAnalysis.pillarBreakdown.fillerClass}
                </span>
                <span className="text-[11px] font-bold text-[#64748B]">{metrics.fillerWordCount} fillers</span>
              </div>
              <div className="text-center p-2.5 rounded-xl bg-[#F0F9FF] border-2 border-[#E5E7EB]">
                <span className="font-label text-slate-500 block">EYE FOCUS</span>
                <span className="font-mono font-extrabold text-[#58CC02] block mt-0.5 text-sm">
                  {classAnalysis.pillarBreakdown.eyeContactClass}
                </span>
                <span className="text-[11px] font-bold text-[#64748B]">{metrics.eyeContactPercentage}% focus</span>
              </div>
            </div>

            {/* Next Level Milestones */}
            <div className="mt-3.5">
              <span className="font-label text-[#1E293B] block mb-2 font-bold">
                MILESTONES TO REACH NEXT CLASS TIER:
              </span>
              <ul className="space-y-1.5 text-xs text-[#64748B]">
                {classAnalysis.nextLevelMilestones.map((ms, i) => (
                  <li key={i} className="flex items-start gap-1.5 font-medium">
                    <ChevronRight className="w-3.5 h-3.5 text-[#58CC02] shrink-0 mt-0.5" />
                    <span>{ms}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Card 2: Target Goals & Progress Towards Targets */}
        <div className="surface flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5E7EB] mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF2DE] text-[#FF9600] flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#FF9600]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1E293B]">Active Improvement Target</h3>
                  <span className="font-label text-slate-500">{currentGoal.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {goalEval.fullyAchieved ? (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-[#E5F9D3] text-[#46A302] border border-[#B7EE8F] flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#58CC02]" />
                    <span>Goal Hit!</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-[#FFF2DE] text-[#D97706] border border-[#FDE68A] flex items-center gap-1">
                    <span>Progressing</span>
                  </span>
                )}
                <button
                  onClick={() => setIsSetGoalsModalOpen(true)}
                  className="btn-secondary py-1! px-2.5! text-xs flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3 text-[#1CB0F6]" />
                  <span>Adjust</span>
                </button>
              </div>
            </div>

            {/* Goal Criteria Breakdown */}
            <div className="space-y-2.5 my-3">
              {/* Pace comparison */}
              <div className="p-3 rounded-xl bg-[#F0F9FF] border-2 border-[#E5E7EB] flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-[#1E293B] block">Pace Target ({currentGoal.targetWpm} ±{currentGoal.wpmTolerance} WPM)</span>
                  <span className="text-[11px] text-[#64748B] font-bold">Actual: {metrics.wordsPerMinute} WPM</span>
                </div>
                {goalEval.wpmAchieved ? (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-[#E5F9D3] text-[#46A302] border border-[#B7EE8F] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Achieved
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FFF2DE] text-[#D97706] border border-[#FDE68A]">
                    {goalEval.wpmDelta > 0 ? `+${goalEval.wpmDelta} WPM fast` : `${goalEval.wpmDelta} WPM slow`}
                  </span>
                )}
              </div>

              {/* Filler comparison */}
              <div className="p-3 rounded-xl bg-[#F0F9FF] border-2 border-[#E5E7EB] flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-[#1E293B] block">Filler Words (≤ {currentGoal.maxFillers} max)</span>
                  <span className="text-[11px] text-[#64748B] font-bold">Actual: {metrics.fillerWordCount} detected</span>
                </div>
                {goalEval.fillersAchieved ? (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-[#E5F9D3] text-[#46A302] border border-[#B7EE8F] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Achieved
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    +{metrics.fillerWordCount - currentGoal.maxFillers} over target
                  </span>
                )}
              </div>

              {/* Eye contact comparison */}
              <div className="p-3 rounded-xl bg-[#F0F9FF] border-2 border-[#E5E7EB] flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-[#1E293B] block">Eye Contact (≥ {currentGoal.minEyeContact}% min)</span>
                  <span className="text-[11px] text-[#64748B] font-bold">Actual: {metrics.eyeContactPercentage}%</span>
                </div>
                {goalEval.eyeContactAchieved ? (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-[#E5F9D3] text-[#46A302] border border-[#B7EE8F] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Achieved
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FFF2DE] text-[#D97706] border border-[#FDE68A]">
                    Needs +{currentGoal.minEyeContact - metrics.eyeContactPercentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Streak & Success Rate Tracker */}
            <div className="p-3 bg-[#F0F9FF] border-2 border-[#E5E7EB] rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-[#FF9600] fill-[#FF9600]" />
                <div>
                  <strong className="text-[#1E293B] font-extrabold block">
                    {goalProgress.currentStreak > 0
                      ? `${goalProgress.currentStreak}-Session Target Streak Active!`
                      : 'Streak awaiting next target match'}
                  </strong>
                  <span className="text-[#64748B] text-[11px] font-medium">
                    {goalProgress.successRate}% hit rate across {goalProgress.totalAttempts} sessions
                  </span>
                </div>
              </div>
              {goalProgress.bestStreak > 0 && (
                <span className="font-mono text-xs text-[#1E293B] font-extrabold bg-white px-2.5 py-1 rounded-xl border-2 border-[#E5E7EB]">
                  Best: {goalProgress.bestStreak}x
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Three Core Pillars Grid */}
      <div>
        <div className="mb-4">
          <div className="font-label text-slate-500 mb-0.5">3-PILLAR CLINICAL FRAMEWORK</div>
          <h2 className="text-2xl font-extrabold text-[#1E293B]">Evaluation Across Core Pillars</h2>
          <p className="text-xs text-[#64748B] font-medium mt-0.5">
            Clinical assessment of vocal pace, narrative structure, and camera engagement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Delivery & Pace */}
          <div className="surface flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5E7EB] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#1CB0F6] flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1E293B]">1. Delivery & Pace</h3>
                    <span className="font-mono tabular-nums text-[11px] text-[#64748B] font-bold">
                      {metrics.wordsPerMinute} WPM · {metrics.pauseCount} pauses
                    </span>
                  </div>
                </div>
                <span className="text-xl font-extrabold font-mono tabular-nums text-[#1CB0F6]">
                  {evaluation.deliveryAndPace.score}
                  <span className="text-xs text-slate-400 font-bold">/100</span>
                </span>
              </div>

              {/* Assessment observation */}
              <div className="bg-[#F0F9FF] p-3 rounded-xl border-2 border-[#E5E7EB] text-xs text-[#1E293B] mb-4 font-medium">
                <span className="font-label text-[#0284C7] block mb-1">TEMPO ASSESSMENT:</span>
                {evaluation.deliveryAndPace.paceAssessment}
              </div>

              {/* Strengths */}
              <div className="space-y-2 mb-4">
                <span className="font-label text-[#58CC02] flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-3.5 h-3.5 text-[#58CC02]" />
                  <span>STRENGTHS OBSERVED:</span>
                </span>
                <ul className="space-y-1.5 pl-1">
                  {evaluation.deliveryAndPace.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-[#1E293B] flex items-start gap-2 font-medium">
                      <span className="text-[#58CC02] font-black shrink-0">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Tips */}
              <div className="space-y-2">
                <span className="font-label text-[#1CB0F6] flex items-center gap-1.5 font-bold">
                  <TrendingUp className="w-3.5 h-3.5 text-[#1CB0F6]" />
                  <span>ACTIONABLE DELIVERY TIPS:</span>
                </span>
                <ul className="space-y-1.5 pl-1">
                  {evaluation.deliveryAndPace.actionableTips.map((t, i) => (
                    <li key={i} className="text-xs text-[#64748B] flex items-start gap-2 font-medium">
                      <span className="text-[#1CB0F6] font-black shrink-0">→</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t-2 border-[#E5E7EB] text-[11px] text-[#64748B] italic font-medium">
              {evaluation.deliveryAndPace.keyObservation}
            </div>
          </div>

          {/* Pillar 2: Verbal Content */}
          <div className="surface flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5E7EB] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF2DE] text-[#FF9600] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1E293B]">2. Verbal Content</h3>
                    <span className="font-mono tabular-nums text-[11px] text-[#64748B] font-bold">
                      {metrics.wordCount} words · {metrics.fillerWordCount} fillers
                    </span>
                  </div>
                </div>
                <span className="text-xl font-extrabold font-mono tabular-nums text-[#FF9600]">
                  {evaluation.verbalContent.score}
                  <span className="text-xs text-slate-400 font-bold">/100</span>
                </span>
              </div>

              {/* Assessment observation */}
              <div className="bg-[#F0F9FF] p-3 rounded-xl border-2 border-[#E5E7EB] text-xs text-[#1E293B] mb-4 font-medium">
                <span className="font-label text-[#D97706] block mb-1">FILLER & FLOW DIAGNOSTIC:</span>
                {evaluation.verbalContent.fillerWordAnalysis}
              </div>

              {/* Strengths */}
              <div className="space-y-2 mb-4">
                <span className="font-label text-[#58CC02] flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-3.5 h-3.5 text-[#58CC02]" />
                  <span>STRENGTHS OBSERVED:</span>
                </span>
                <ul className="space-y-1.5 pl-1">
                  {evaluation.verbalContent.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-[#1E293B] flex items-start gap-2 font-medium">
                      <span className="text-[#58CC02] font-black shrink-0">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Tips */}
              <div className="space-y-2">
                <span className="font-label text-[#1CB0F6] flex items-center gap-1.5 font-bold">
                  <TrendingUp className="w-3.5 h-3.5 text-[#1CB0F6]" />
                  <span>ACTIONABLE CONTENT TIPS:</span>
                </span>
                <ul className="space-y-1.5 pl-1">
                  {evaluation.verbalContent.actionableTips.map((t, i) => (
                    <li key={i} className="text-xs text-[#64748B] flex items-start gap-2 font-medium">
                      <span className="text-[#1CB0F6] font-black shrink-0">→</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t-2 border-[#E5E7EB] text-[11px] text-[#64748B] italic font-medium">
              {evaluation.verbalContent.keyObservation}
            </div>
          </div>

          {/* Pillar 3: Non-Verbal Cues */}
          <div className="surface flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5E7EB] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#E5F9D3] text-[#46A302] flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1E293B]">3. Non-Verbal Cues</h3>
                    <span className="font-mono tabular-nums text-[11px] text-[#64748B] font-bold">
                      {metrics.eyeContactPercentage}% gaze · {metrics.postureStabilityPercentage}% poise
                    </span>
                  </div>
                </div>
                <span className="text-xl font-extrabold font-mono tabular-nums text-[#58CC02]">
                  {evaluation.nonVerbalCues.score}
                  <span className="text-xs text-slate-400 font-bold">/100</span>
                </span>
              </div>

              {/* Assessment observation */}
              <div className="bg-[#F0F9FF] p-3 rounded-xl border-2 border-[#E5E7EB] text-xs text-[#1E293B] mb-4 font-medium">
                <span className="font-label text-[#46A302] block mb-1">GAZE & PRESENCE:</span>
                {evaluation.nonVerbalCues.eyeContactAssessment}
              </div>

              {/* Strengths */}
              <div className="space-y-2 mb-4">
                <span className="font-label text-[#58CC02] flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-3.5 h-3.5 text-[#58CC02]" />
                  <span>STRENGTHS OBSERVED:</span>
                </span>
                <ul className="space-y-1.5 pl-1">
                  {evaluation.nonVerbalCues.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-[#1E293B] flex items-start gap-2 font-medium">
                      <span className="text-[#58CC02] font-black shrink-0">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Tips */}
              <div className="space-y-2">
                <span className="font-label text-[#1CB0F6] flex items-center gap-1.5 font-bold">
                  <TrendingUp className="w-3.5 h-3.5 text-[#1CB0F6]" />
                  <span>ACTIONABLE PRESENCE TIPS:</span>
                </span>
                <ul className="space-y-1.5 pl-1">
                  {evaluation.nonVerbalCues.actionableTips.map((t, i) => (
                    <li key={i} className="text-xs text-[#64748B] flex items-start gap-2 font-medium">
                      <span className="text-[#1CB0F6] font-black shrink-0">→</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t-2 border-[#E5E7EB] text-[11px] text-[#64748B] italic font-medium">
              {evaluation.nonVerbalCues.keyObservation}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Speech Progression Timeline */}
      <div className="surface">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#1E293B] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1CB0F6]" />
              <span>Session Timeline & Fluency Fluctuations</span>
            </h3>
            <p className="text-xs text-[#64748B] font-medium">
              Interactive timeline mapping timestamped filler words, natural pauses, and pacing shifts
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-[#64748B] font-bold">
            Total Duration: {metrics.durationSeconds}s
          </span>
        </div>

        {/* Timeline Bar */}
        <div className="relative h-12 bg-[#F0F9FF] rounded-2xl p-2 flex items-center border-2 border-[#E5E7EB] overflow-hidden">
          <div className="absolute inset-x-0 h-1 bg-[#CBD5E1] top-1/2 -translate-y-1/2" />

          {metrics.timelineEvents.map((evt, idx) => {
            const leftPct = Math.min(95, Math.max(5, (evt.timestamp / metrics.durationSeconds) * 100));
            const isFiller = evt.type === 'filler';
            const isPause = evt.type === 'pause';

            return (
              <div
                key={idx}
                style={{ left: `${leftPct}%` }}
                className="absolute -translate-x-1/2 group cursor-pointer"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125 ${
                    isFiller ? 'bg-[#FF9600]' : isPause ? 'bg-[#58CC02]' : 'bg-[#1CB0F6]'
                  }`}
                />
                <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white text-[11px] px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap z-20 font-mono font-bold">
                  {formatSecs(evt.timestamp)}: {evt.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Legend */}
        <div className="mt-3 flex items-center justify-between text-xs text-[#64748B] pt-2 border-t-2 border-[#E5E7EB] font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#58CC02]" />
              <span>Breath Pause ({metrics.pauseCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9600]" />
              <span>Filler Word Marker ({metrics.fillerWordCount})</span>
            </span>
          </div>
          <span className="font-mono text-[11px]">Hover markers to inspect timestamp events</span>
        </div>
      </div>

      {/* Verbatim Transcript Analysis */}
      <div className="surface">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#1E293B]">Verbatim Transcript Analysis</h3>
            <p className="text-xs text-[#64748B] font-medium">
              Annotated quotes from your speech with therapist praise and concise alternatives
            </p>
          </div>
          <span className="text-xs text-[#64748B] font-mono tabular-nums font-bold">
            {metrics.wordCount} words analyzed
          </span>
        </div>

        {/* Full Transcript Box */}
        <div className="p-4 bg-[#F0F9FF] rounded-2xl border-2 border-[#E5E7EB] text-sm leading-relaxed text-[#1E293B] max-h-52 overflow-y-auto mb-6 font-medium">
          <p className="whitespace-pre-wrap">{metrics.transcript}</p>
        </div>

        {/* Phrase Highlights */}
        {evaluation.transcriptHighlights && evaluation.transcriptHighlights.length > 0 && (
          <div className="space-y-3">
            <span className="font-label text-slate-500 block">
              SPECIFIC PHRASE UPGRADES
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evaluation.transcriptHighlights.map((hl, idx) => {
                const isPraise = hl.category === 'praise';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isPraise
                        ? 'bg-[#E5F9D3]/60 border-[#B7EE8F] text-[#1E293B]'
                        : 'bg-[#F0F9FF] border-[#E5E7EB] text-[#1E293B]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] mb-1">
                      <span className="font-label">
                        {isPraise ? 'OUTSTANDING DELIVERY' : 'RECOMMENDED UPGRADE'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold italic text-[#1E293B] mb-2">
                      "{hl.snippet}"
                    </p>

                    <p className="text-xs text-[#64748B] mb-2 font-medium">{hl.feedback}</p>

                    <div className="pt-2 border-t-2 border-[#E5E7EB] flex items-start gap-1.5 text-xs font-extrabold text-[#1CB0F6]">
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Upgrade: "{hl.improvedAlternative}"</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Practice Drills Deck - Variation 5 Tactile Card */}
      <div className="surface-blue p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-white/20">
          <div>
            <span className="font-label text-white/90 tracking-widest block mb-1">
              IMMEDIATE SKILL REINFORCEMENT
            </span>
            <h3 className="text-xl font-extrabold text-white">Recommended Clinical Micro-Drills</h3>
            <p className="text-xs text-white/85 font-medium mt-0.5">
              Interactive 2-minute drills designed to target your specific cadence and fluency opportunities
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {evaluation.recommendedDrills.map((drill) => (
            <div
              key={drill.id}
              className="bg-white rounded-2xl p-5 border-2 border-white/60 shadow-md flex flex-col justify-between text-[#1E293B]"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                  <span className="font-mono tabular-nums font-bold text-[#1CB0F6]">{drill.timeMinutes} MIN DRILL</span>
                  <span className="font-label text-[#58CC02]">{drill.pillar}</span>
                </div>
                <h4 className="text-base font-extrabold text-[#1E293B]">
                  {drill.title}
                </h4>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed font-medium">{drill.instructions}</p>
              </div>

              <div className="mt-5 pt-3 border-t-2 border-[#E5E7EB] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B] truncate max-w-[130px] font-bold">
                  Target: {drill.targetMetric}
                </span>
                <button
                  onClick={() => onLaunchDrill(drill)}
                  className="btn-primary py-1.5! px-3! text-xs flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Launch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Goals & Class-Wise Levels Modal */}
      <SetGoalsModal
        isOpen={isSetGoalsModalOpen}
        onClose={() => setIsSetGoalsModalOpen(false)}
        activeGoal={currentGoal}
        onSaveGoal={(goal) => {
          if (onUpdateGoal) onUpdateGoal(goal);
        }}
        history={history || []}
      />
    </div>
  );
};
