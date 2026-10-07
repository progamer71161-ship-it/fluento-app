import React, { useState } from 'react';
import {
  Clock,
  TrendingUp,
  Award,
  Eye,
  Mic,
  Trash2,
  ArrowRight,
  Activity,
  Sliders,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Briefcase,
  MessageSquare,
  Target,
  Layers,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { SessionHistoryItem, SessionFilterType, getSessionCategory } from '../types';

interface HistoryViewProps {
  history: SessionHistoryItem[];
  onSelectSession: (item: SessionHistoryItem) => void;
  onDeleteSession: (id: string) => void;
  onStartPractice: () => void;
  onAddSampleHistory?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectSession,
  onDeleteSession,
  onStartPractice,
  onAddSampleHistory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SessionFilterType>('All');
  const [sessionWindow, setSessionWindow] = useState<'last5' | 'all'>('last5');
  const [activeMetricTab, setActiveMetricTab] = useState<'overall' | 'all' | 'wpm' | 'fillers' | 'pillars'>('overall');

  // Category Target Communication Goals Metadata
  const CATEGORY_GOALS: Record<
    SessionFilterType,
    {
      title: string;
      subtitle: string;
      targetMetrics: string;
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      bg: string;
      border: string;
    }
  > = {
    All: {
      title: 'Overall Communication Mastery',
      subtitle: 'Longitudinal tracking across all presentation, conversational, and interview scenarios',
      targetMetrics: '130–155 WPM · ≤2 fillers · ≥80% camera connection',
      icon: Layers,
      color: '#58CC02',
      bg: '#F0F9FF',
      border: '#E5E7EB',
    },
    Professional: {
      title: 'Professional & Executive Presentations',
      subtitle: 'Pitches, board presentations, and all-hands speeches calibrated for high-stakes leadership',
      targetMetrics: '130–150 WPM · ≤1 filler · ≥85% direct engagement · Resonant breath pauses',
      icon: Briefcase,
      color: '#1CB0F6',
      bg: '#F0F9FF',
      border: '#E5E7EB',
    },
    Casual: {
      title: 'Conversational & Interpersonal Fluency',
      subtitle: 'One-on-one dialogues, constructive feedback, and natural everyday storytelling',
      targetMetrics: '115–135 WPM · Empathetic listening pauses · Smooth continuous vocal onset',
      icon: MessageSquare,
      color: '#FF9600',
      bg: '#FFFDF9',
      border: '#E5E7EB',
    },
    Interviews: {
      title: 'Job & Technical Interviews',
      subtitle: 'Behavioral STAR frameworks, technical explanations, and high-conviction responses',
      targetMetrics: '135–155 WPM · ≤2 fillers · ≥75% direct camera lens anchor · Concise conclusions',
      icon: Target,
      color: '#8B5CF6',
      bg: '#F5F3FF',
      border: '#E5E7EB',
    },
  };

  // If history is completely empty
  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="surface w-20 h-20 rounded-3xl bg-[#E0F2FE] text-[#1CB0F6] flex items-center justify-center mx-auto">
          <BarChart3 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#1E293B]">No Recorded Practice Sessions Yet</h2>
          <p className="text-xs text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed font-medium">
            Record a live speech session or evaluate a preset speech to track your pacing trend, filler word reduction, and engagement scores over time.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          {onAddSampleHistory && (
            <button
              onClick={onAddSampleHistory}
              className="btn-secondary text-xs py-2! px-4! flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1CB0F6]" />
              <span>Load Sample Progression Data</span>
            </button>
          )}
          <button
            onClick={onStartPractice}
            className="btn-primary text-xs py-2! px-5! inline-flex items-center gap-2 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-white" />
            <span>Start Practice Session</span>
          </button>
        </div>
      </div>
    );
  }

  // Count sessions per category across complete history
  const categoryCounts = {
    All: history.length,
    Professional: history.filter((item) => getSessionCategory(item) === 'Professional').length,
    Casual: history.filter((item) => getSessionCategory(item) === 'Casual').length,
    Interviews: history.filter((item) => getSessionCategory(item) === 'Interviews').length,
  };

  // Filtered dataset according to selected tab
  const filteredHistory = selectedCategory === 'All'
    ? history
    : history.filter((item) => getSessionCategory(item) === selectedCategory);

  // Calculate longitudinal averages for current filtered dataset
  const avgScore = filteredHistory.length > 0
    ? Math.round(filteredHistory.reduce((acc, h) => acc + h.evaluation.overallScore, 0) / filteredHistory.length)
    : 0;
  const avgWpm = filteredHistory.length > 0
    ? Math.round(filteredHistory.reduce((acc, h) => acc + h.metrics.wordsPerMinute, 0) / filteredHistory.length)
    : 0;
  const avgEyeContact = filteredHistory.length > 0
    ? Math.round(filteredHistory.reduce((acc, h) => acc + h.metrics.eyeContactPercentage, 0) / filteredHistory.length)
    : 0;
  const totalFillers = filteredHistory.reduce((acc, h) => acc + h.metrics.fillerWordCount, 0);

  // Selected session set for Recharts: last 5 sessions (chronological order) vs all sessions
  const activeSessions = sessionWindow === 'last5'
    ? [...filteredHistory].slice(0, 5).reverse()
    : [...filteredHistory].reverse();

  // Prepare chronological progression data for Recharts (Session 1 -> Session N)
  const chartData = activeSessions.map((item, idx) => ({
    sessionIndex: `S${idx + 1}`,
    name: `Session ${idx + 1}`,
    title: item.metrics.scenarioTitle,
    date: item.timestamp,
    score: item.evaluation.overallScore,
    wpm: item.metrics.wordsPerMinute,
    fillers: item.metrics.fillerWordCount,
    delivery: item.evaluation.deliveryAndPace.score,
    verbal: item.evaluation.verbalContent.score,
    nonVerbal: item.evaluation.nonVerbalCues.score,
    category: getSessionCategory(item),
  }));

  // Window delta calculations (comparing newest in window vs oldest in window)
  const windowLatest = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const windowOldest = chartData.length > 0 ? chartData[0] : null;
  const windowScoreDelta = windowLatest && windowOldest && chartData.length > 1
    ? windowLatest.score - windowOldest.score
    : 0;
  const windowAvgScore = chartData.length > 0
    ? Math.round(chartData.reduce((acc, c) => acc + c.score, 0) / chartData.length)
    : 0;
  const windowMaxScore = chartData.length > 0
    ? Math.max(...chartData.map((c) => c.score))
    : 0;
  const windowMinScore = chartData.length > 0
    ? Math.min(...chartData.map((c) => c.score))
    : 0;

  // Longitudinal score delta across filtered history
  const scoreDelta = filteredHistory.length > 1
    ? filteredHistory[0].evaluation.overallScore - filteredHistory[filteredHistory.length - 1].evaluation.overallScore
    : 0;

  // Longitudinal filler count delta (oldest - newest)
  const fillerDelta = filteredHistory.length > 1
    ? filteredHistory[filteredHistory.length - 1].metrics.fillerWordCount - filteredHistory[0].metrics.fillerWordCount
    : 0;

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="surface p-3 text-xs space-y-1.5 shadow-xl max-w-xs z-50">
          <div className="flex items-center justify-between gap-3 border-b-2 border-[#E5E7EB] pb-1.5 font-bold">
            <span className="text-[#1E293B]">{data.name}</span>
            <span className="font-mono text-[#64748B] text-[10px]">{data.date}</span>
          </div>
          <div className="text-[11px] font-extrabold text-[#1CB0F6] truncate">{data.title}</div>
          <div className="space-y-1 pt-1 font-mono text-[11px]">
            <div className="flex justify-between gap-3">
              <span className="text-[#64748B]">Overall Score:</span>
              <strong className="text-[#58CC02]">{data.score}/100</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[#64748B]">Speaking Pace:</span>
              <strong className="text-[#1CB0F6]">{data.wpm} WPM</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[#64748B]">Filler Words:</span>
              <strong className="text-[#FF9600]">{data.fillers}</strong>
            </div>
            {activeMetricTab === 'pillars' && (
              <div className="pt-1.5 border-t border-[#E5E7EB] space-y-0.5 text-[10px]">
                <div className="flex justify-between text-[#1CB0F6]">
                  <span>Delivery & Pace:</span>
                  <span>{data.delivery}/100</span>
                </div>
                <div className="flex justify-between text-[#FF9600]">
                  <span>Verbal Content:</span>
                  <span>{data.verbal}/100</span>
                </div>
                <div className="flex justify-between text-[#58CC02]">
                  <span>Non-Verbal Cues:</span>
                  <span>{data.nonVerbal}/100</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#E5E7EB]">
        <div>
          <div className="font-label text-slate-500 mb-0.5">ANALYTICS & LONGITUDINAL PROGRESS</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
            History & Growth Tracker
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Category-benchmarked trajectory across speaking rate, filler reduction, and clinical fluency scores
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onAddSampleHistory && (
            <button
              onClick={onAddSampleHistory}
              className="btn-secondary py-2! px-3.5! text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              title="Preload simulated practice sessions across multiple categories"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1CB0F6]" />
              <span>Load Sample Progression</span>
            </button>
          )}

          <button
            onClick={onStartPractice}
            className="btn-primary py-2! px-4! text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-white" />
            <span>Practice New Speech</span>
          </button>
        </div>
      </div>

      {/* Category Segmented Controller Filter */}
      <div className="surface space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#1CB0F6]" />
            <span className="font-label text-slate-500 font-bold">CATEGORY FILTER:</span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F0F9FF] border-2 border-[#E5E7EB] rounded-2xl text-xs font-extrabold flex-wrap">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'All'
                  ? 'bg-[#1CB0F6] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedCategory === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#64748B]'
                }`}
              >
                {categoryCounts.All}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('Professional')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'Professional'
                  ? 'bg-[#1CB0F6] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Professional</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedCategory === 'Professional' ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#64748B]'
                }`}
              >
                {categoryCounts.Professional}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('Casual')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'Casual'
                  ? 'bg-[#1CB0F6] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Casual</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedCategory === 'Casual' ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#64748B]'
                }`}
              >
                {categoryCounts.Casual}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('Interviews')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'Interviews'
                  ? 'bg-[#1CB0F6] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Interviews</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedCategory === 'Interviews' ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#64748B]'
                }`}
              >
                {categoryCounts.Interviews}
              </span>
            </button>
          </div>
        </div>

        {/* Tailored Communication Goal Banner */}
        <div className="p-4 rounded-2xl border-2 border-[#E5E7EB] bg-[#F0F9FF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            {React.createElement(CATEGORY_GOALS[selectedCategory].icon, {
              className: 'w-5 h-5 shrink-0 mt-0.5 text-[#1CB0F6]',
            })}
            <div>
              <h3 className="font-extrabold text-[#1E293B] flex items-center gap-2">
                <span>{CATEGORY_GOALS[selectedCategory].title}</span>
                <span className="font-label text-[#1CB0F6] bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                  {selectedCategory} GOAL
                </span>
              </h3>
              <p className="text-[#64748B] text-xs mt-0.5 font-medium">
                {CATEGORY_GOALS[selectedCategory].subtitle}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#E5E7EB] font-mono text-xs text-[#1E293B] self-stretch sm:self-auto text-center shrink-0 font-bold">
            <span className="font-label text-slate-500 block mb-0.5">
              BENCHMARK STANDARD
            </span>
            <span>{CATEGORY_GOALS[selectedCategory].targetMetrics}</span>
          </div>
        </div>
      </div>

      {/* When the selected filter has zero sessions */}
      {filteredHistory.length === 0 ? (
        <div className="surface p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F0F9FF] text-[#1CB0F6] flex items-center justify-center mx-auto border-2 border-[#E5E7EB]">
            {React.createElement(CATEGORY_GOALS[selectedCategory].icon, { className: 'w-7 h-7' })}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#1E293B]">
              No {selectedCategory} Sessions Recorded Yet
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 leading-relaxed font-medium">
              Complete a {selectedCategory.toLowerCase()} scenario in the Studio or load sample data to track your communication progress for this category.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className="btn-secondary text-xs py-2! px-4!"
            >
              View All Sessions ({history.length})
            </button>
            <button
              onClick={onStartPractice}
              className="btn-primary text-xs py-2! px-4! flex items-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Practice {selectedCategory} Speech</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Aggregate Stats Cards for Filtered Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="surface">
              <div className="flex items-center justify-between">
                <span className="font-label text-slate-500">AVERAGE SCORE</span>
                {filteredHistory.length > 1 && scoreDelta !== 0 && (
                  <span className={`text-[11px] font-extrabold font-mono px-2 py-0.5 rounded-lg ${
                    scoreDelta > 0 ? 'bg-[#E5F9D3] text-[#46A302] border border-[#B7EE8F]' : 'bg-[#FFF2DE] text-[#D97706] border border-[#FDE68A]'
                  }`}>
                    {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} pts trend
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono tabular-nums text-[#58CC02]">
                  {avgScore}
                </span>
                <span className="text-xs text-slate-400 font-bold">/ 100</span>
              </div>
              <span className="text-[11px] text-[#64748B] mt-1 block font-medium">
                Across {filteredHistory.length} {selectedCategory !== 'All' ? selectedCategory.toLowerCase() : ''} session{filteredHistory.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="surface">
              <span className="font-label text-slate-500">MEAN SPEAKING RATE</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono tabular-nums text-[#1CB0F6]">
                  {avgWpm}
                </span>
                <span className="text-xs text-slate-400 font-bold">WPM</span>
              </div>
              <span className="text-[11px] text-[#64748B] mt-1 block font-medium">
                Ideal target: {CATEGORY_GOALS[selectedCategory].targetMetrics.split('·')[0].trim()}
              </span>
            </div>

            <div className="surface">
              <div className="flex items-center justify-between">
                <span className="font-label text-slate-500">FILLER WORD REDUCTION</span>
                {filteredHistory.length > 1 && fillerDelta > 0 && (
                  <span className="text-[11px] font-extrabold font-mono bg-[#E5F9D3] text-[#46A302] border border-[#B7EE8F] px-2 py-0.5 rounded-lg">
                    -{fillerDelta} fillers
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono tabular-nums text-[#FF9600]">
                  {totalFillers}
                </span>
                <span className="text-xs text-slate-400 font-bold">total fillers</span>
              </div>
              <span className="text-[11px] text-[#64748B] mt-1 block font-medium">
                Camera focus: {avgEyeContact}% avg eye contact
              </span>
            </div>
          </div>

          {/* PERFORMANCE OVER TIME VISUAL SUMMARY (RECHARTS) */}
          <div className="surface space-y-4">
            {/* Header with Title, Range Toggle & Metric Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#1CB0F6] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-extrabold text-[#1E293B]">
                      {sessionWindow === 'last5'
                        ? `Overall Score Progress · ${selectedCategory} (Last 5 Sessions)`
                        : `Overall Score Progress · ${selectedCategory} (All Sessions)`}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-extrabold border border-[#BAE6FD]">
                      {sessionWindow === 'last5'
                        ? `Last ${chartData.length} Sessions`
                        : `${filteredHistory.length} Sessions`}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] font-medium">
                    Visualizing score trajectory, improvement trends, and clinical fluency benchmarks
                  </p>
                </div>
              </div>

              {/* Controls: Window Selector & Metric Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Session Window Toggle */}
                <div className="flex items-center gap-1 p-1 bg-[#F0F9FF] border-2 border-[#E5E7EB] rounded-2xl text-xs font-extrabold">
                  <button
                    onClick={() => setSessionWindow('last5')}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      sessionWindow === 'last5'
                        ? 'bg-[#1CB0F6] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    <span>Last 5 Sessions</span>
                  </button>
                  <button
                    onClick={() => setSessionWindow('all')}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                      sessionWindow === 'all'
                        ? 'bg-[#1CB0F6] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    <span>All ({filteredHistory.length})</span>
                  </button>
                </div>

                {/* Metric Mode Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[#F0F9FF] border-2 border-[#E5E7EB] rounded-2xl text-xs font-extrabold">
                  <button
                    onClick={() => setActiveMetricTab('overall')}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                      activeMetricTab === 'overall'
                        ? 'bg-[#58CC02] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    Overall Score
                  </button>
                  <button
                    onClick={() => setActiveMetricTab('all')}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                      activeMetricTab === 'all'
                        ? 'bg-[#1CB0F6] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    Combined
                  </button>
                  <button
                    onClick={() => setActiveMetricTab('wpm')}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                      activeMetricTab === 'wpm'
                        ? 'bg-[#1CB0F6] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    Pace (WPM)
                  </button>
                  <button
                    onClick={() => setActiveMetricTab('fillers')}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                      activeMetricTab === 'fillers'
                        ? 'bg-[#FF9600] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    Fillers
                  </button>
                  <button
                    onClick={() => setActiveMetricTab('pillars')}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                      activeMetricTab === 'pillars'
                        ? 'bg-[#1CB0F6] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    3 Pillars
                  </button>
                </div>
              </div>
            </div>

            {/* Trend Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F0F9FF] rounded-2xl border-2 border-[#E5E7EB] text-xs">
              <div className="space-y-0.5">
                <span className="font-label text-slate-500 block">
                  {sessionWindow === 'last5' ? '5-SESSION TREND' : 'GROWTH TREND'}
                </span>
                <div className="flex items-center gap-1.5">
                  {chartData.length > 1 ? (
                    <span
                      className={`text-sm font-extrabold font-mono px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                        windowScoreDelta > 0
                          ? 'bg-[#E5F9D3] text-[#46A302] border border-[#B7EE8F]'
                          : windowScoreDelta === 0
                          ? 'bg-slate-200 text-[#64748B]'
                          : 'bg-[#FFF2DE] text-[#D97706] border border-[#FDE68A]'
                      }`}
                    >
                      <TrendingUp className={`w-3.5 h-3.5 ${windowScoreDelta < 0 ? 'rotate-180' : ''}`} />
                      <span>
                        {windowScoreDelta > 0 ? `+${windowScoreDelta} pts` : `${windowScoreDelta} pts`}
                      </span>
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-[#64748B] font-bold">Baseline set</span>
                  )}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="font-label text-slate-500 block">LATEST SCORE</span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-lg font-extrabold text-[#58CC02]">
                    {windowLatest ? windowLatest.score : '--'}
                  </span>
                  <span className="text-[11px] text-[#64748B]">/ 100</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="font-label text-slate-500 block">
                  {sessionWindow === 'last5' ? '5-SESSION AVERAGE' : 'CATEGORY AVERAGE'}
                </span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-lg font-extrabold text-[#1CB0F6]">{windowAvgScore}</span>
                  <span className="text-[11px] text-[#64748B]">/ 100</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="font-label text-slate-500 block">PEAK SCORE</span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-lg font-extrabold text-[#FF9600]">{windowMaxScore}</span>
                  <span className="text-[11px] text-[#64748B]">/ 100</span>
                </div>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 18, right: 24, left: -10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="sessionIndex"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    domain={
                      activeMetricTab === 'fillers'
                        ? [0, 'dataMax + 2']
                        : activeMetricTab === 'overall'
                        ? [Math.max(40, windowMinScore - 10), 100]
                        : [40, 180]
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={32}
                    wrapperStyle={{ paddingTop: '8px', fontSize: '11px', fontWeight: 'bold' }}
                  />

                  {/* Benchmark Reference Line at 80 pts */}
                  {(activeMetricTab === 'overall' || activeMetricTab === 'all') && (
                    <ReferenceLine
                      y={80}
                      stroke="#58CC02"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Executive Benchmark (80)',
                        position: 'insideBottomRight',
                        fill: '#58CC02',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}
                    />
                  )}

                  {/* View: Overall Score Progress (FEATURED) */}
                  {activeMetricTab === 'overall' && (
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Overall Score (0–100)"
                      stroke="#58CC02"
                      strokeWidth={3.5}
                      dot={{ fill: '#FFFFFF', stroke: '#58CC02', strokeWidth: 3, r: 6 }}
                      activeDot={{ r: 8, fill: '#58CC02', stroke: '#FFFFFF', strokeWidth: 2 }}
                      label={{
                        position: 'top',
                        fill: '#1E293B',
                        fontSize: 12,
                        fontWeight: 800,
                        offset: 8,
                      }}
                    />
                  )}

                  {/* View: Combined Metrics */}
                  {activeMetricTab === 'all' && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Overall Score (0-100)"
                        stroke="#58CC02"
                        strokeWidth={3}
                        dot={{ fill: '#58CC02', r: 5 }}
                        activeDot={{ r: 7, fill: '#46A302' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="wpm"
                        name="Speaking Pace (WPM)"
                        stroke="#1CB0F6"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ fill: '#1CB0F6', r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="fillers"
                        name="Filler Count"
                        stroke="#FF9600"
                        strokeWidth={2}
                        dot={{ fill: '#FF9600', r: 3 }}
                      />
                    </>
                  )}

                  {/* View: WPM Cadence */}
                  {activeMetricTab === 'wpm' && (
                    <Line
                      type="monotone"
                      dataKey="wpm"
                      name="Speaking Pace (WPM)"
                      stroke="#1CB0F6"
                      strokeWidth={3}
                      dot={{ fill: '#1CB0F6', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  )}

                  {/* View: Filler Reduction */}
                  {activeMetricTab === 'fillers' && (
                    <Line
                      type="monotone"
                      dataKey="fillers"
                      name="Filler Words Detected"
                      stroke="#FF9600"
                      strokeWidth={3}
                      dot={{ fill: '#FF9600', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  )}

                  {/* View: 3 Pillars */}
                  {activeMetricTab === 'pillars' && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="delivery"
                        name="Delivery & Pace (0-100)"
                        stroke="#1CB0F6"
                        strokeWidth={2.5}
                        dot={{ fill: '#1CB0F6', r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="verbal"
                        name="Verbal Content (0-100)"
                        stroke="#FF9600"
                        strokeWidth={2.5}
                        dot={{ fill: '#FF9600', r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="nonVerbal"
                        name="Non-Verbal Cues (0-100)"
                        stroke="#58CC02"
                        strokeWidth={2.5}
                        dot={{ fill: '#58CC02', r: 4 }}
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Insight Footer */}
            <div className="pt-3 border-t-2 border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#64748B] gap-2 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#58CC02] shrink-0" />
                <span>
                  {chartData.length === 1
                    ? `First baseline ${selectedCategory.toLowerCase()} session recorded. Additional sessions will build the progress trajectory.`
                    : windowScoreDelta > 0
                    ? `Positive trajectory: ${selectedCategory} score improved by +${windowScoreDelta} points across the last ${chartData.length} sessions!`
                    : windowScoreDelta === 0
                    ? `Steady performance: Maintained consistent scores across the last ${chartData.length} ${selectedCategory.toLowerCase()} sessions.`
                    : `${selectedCategory} score shifted by ${windowScoreDelta} points across recent sessions. Review micro-drills to boost delivery.`}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#64748B] font-bold">
                {sessionWindow === 'last5'
                  ? `Showing 5 most recent ${selectedCategory.toLowerCase()} sessions`
                  : `All ${filteredHistory.length} ${selectedCategory.toLowerCase()} sessions`}
              </span>
            </div>
          </div>

          {/* Past Sessions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#1E293B]">
                {selectedCategory === 'All'
                  ? 'All Completed Sessions'
                  : `${selectedCategory} Sessions (${filteredHistory.length})`}
              </h2>
              <span className="text-xs text-[#64748B] font-mono font-bold">
                Showing {filteredHistory.length} of {history.length} total
              </span>
            </div>

            <div className="space-y-3">
              {filteredHistory.map((item) => {
                const category = getSessionCategory(item);
                return (
                  <div
                    key={item.id}
                    className="surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1CB0F6] transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full border ${
                            category === 'Interviews'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : category === 'Professional'
                              ? 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]'
                              : 'bg-[#FFF2DE] text-[#D97706] border-[#FDE68A]'
                          }`}
                        >
                          {category}
                        </span>
                        <span className="font-extrabold text-[#1E293B]">{item.metrics.scenarioTitle}</span>
                        <span aria-hidden="true">•</span>
                        <span className="font-mono tabular-nums">{item.timestamp}</span>
                        <span aria-hidden="true">•</span>
                        <span className="font-mono tabular-nums">{item.metrics.durationSeconds}s</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-[#1E293B]">
                        {item.evaluation.primaryGenuineStrength}
                      </h3>
                      <div className="mt-2 flex items-center gap-4 text-xs font-mono tabular-nums text-[#64748B] font-bold">
                        <span>Pace: {item.metrics.wordsPerMinute} WPM</span>
                        <span>Fillers: {item.metrics.fillerWordCount}</span>
                        <span>Eye Contact: {item.metrics.eyeContactPercentage}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="font-label text-slate-500 block">SCORE</span>
                        <span className="text-2xl font-extrabold font-mono tabular-nums text-[#58CC02]">
                          {item.evaluation.overallScore}
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectSession(item)}
                        className="btn-primary-blue text-xs py-2! px-3.5! flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Scorecard</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </button>

                      <button
                        onClick={() => onDeleteSession(item.id)}
                        className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
