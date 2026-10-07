import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveStage } from './components/LiveStage';
import { EvaluationView } from './components/EvaluationView';
import { ManualEntryModal } from './components/ManualEntryModal';
import { InteractiveDrillModal } from './components/InteractiveDrillModal';
import { ScenariosView } from './components/ScenariosView';
import { DrillsView } from './components/DrillsView';
import { HistoryView } from './components/HistoryView';
import { SplashScreen } from './components/SplashScreen';
import { Scenario, SessionMetrics, EvaluationResult, SessionHistoryItem, PracticeDrill, SpeechTargetGoal, DailyStreakState } from './types';
import { SCENARIOS } from './data/scenarios';
import { getActiveGoal, saveActiveGoal } from './data/goals';
import { getStoredDailyStreak, recordDailyPractice } from './utils/streak';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'fluento_session_history';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<'studio' | 'scenarios' | 'drills' | 'history'>('studio');
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);
  const [activeGoal, setActiveGoal] = useState<SpeechTargetGoal>(getActiveGoal);
  const [dailyStreak, setDailyStreak] = useState<DailyStreakState>(getStoredDailyStreak);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [activeDrillModal, setActiveDrillModal] = useState<PracticeDrill | null>(null);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStageText, setEvaluationStageText] = useState('Analyzing speech session metrics...');
  const [currentMetrics, setCurrentMetrics] = useState<SessionMetrics | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<SessionHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('vocalis_ai_session_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save session history to localStorage', e);
    }
  }, [history]);

  // Handle evaluation request
  const handleEvaluate = async (metrics: SessionMetrics) => {
    setIsEvaluating(true);
    setEvalError(null);
    setCurrentMetrics(metrics);
    setEvaluationStageText('Evaluating delivery cadence, pauses, and WPM pace...');

    const stageTimer1 = setTimeout(() => {
      setEvaluationStageText('Analyzing narrative structure, vocabulary, and filler words...');
    }, 1200);

    const stageTimer2 = setTimeout(() => {
      setEvaluationStageText('Assessing visual engagement, eye contact, and head poise...');
    }, 2400);

    const stageTimer3 = setTimeout(() => {
      setEvaluationStageText('Synthesizing speech therapist recommendations and tailored micro-drills...');
    }, 3600);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: metrics.transcript,
          wordsPerMinute: metrics.wordsPerMinute,
          fillerWordCount: metrics.fillerWordCount,
          fillerDetails: metrics.fillerDetails,
          eyeContactPercentage: metrics.eyeContactPercentage,
          postureStabilityPercentage: metrics.postureStabilityPercentage,
          durationSeconds: metrics.durationSeconds,
          pauseCount: metrics.pauseCount,
          averagePauseSeconds: metrics.averagePauseSeconds,
          scenarioTitle: metrics.scenarioTitle,
          scenarioCategory: activeScenario.category,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const evaluation: EvaluationResult = await response.json();
      setCurrentEvaluation(evaluation);

      // Prepend to history
      const historyItem: SessionHistoryItem = {
        id: metrics.id,
        timestamp: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        metrics,
        evaluation,
      };

      setHistory((prev) => [historyItem, ...prev]);

      // Record daily practice streak
      const updatedStreak = recordDailyPractice();
      setDailyStreak(updatedStreak);

      setActiveTab('studio');
    } catch (err: any) {
      console.error('Failed to evaluate speech session:', err);
      setEvalError(
        'Unable to complete AI evaluation. Please verify your connection or retry with manual benchmark.'
      );
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setIsEvaluating(false);
    }
  };

  const handleRecordDailyPractice = () => {
    const updated = recordDailyPractice();
    setDailyStreak(updated);
  };

  const handleStartNewPractice = () => {
    setCurrentEvaluation(null);
    setCurrentMetrics(null);
    setActiveTab('studio');
  };

  const handleUpdateGoal = (newGoal: SpeechTargetGoal) => {
    setActiveGoal(newGoal);
    saveActiveGoal(newGoal);
  };

  const handleSelectScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setCurrentEvaluation(null);
    setCurrentMetrics(null);
    setActiveTab('studio');
  };

  const handlePreloadBenchmark = (scenario: Scenario) => {
    setActiveScenario(scenario);
    const metrics: SessionMetrics = {
      id: `benchmark_${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      durationSeconds: scenario.sampleMetrics.durationSeconds,
      wordCount: scenario.sampleMetrics.wordCount,
      wordsPerMinute: scenario.sampleMetrics.wordsPerMinute,
      fillerWordCount: scenario.sampleMetrics.fillerWordCount,
      fillerDetails: scenario.sampleMetrics.fillerDetails,
      eyeContactPercentage: scenario.sampleMetrics.eyeContactPercentage,
      postureStabilityPercentage: scenario.sampleMetrics.postureStabilityPercentage,
      pauseCount: scenario.sampleMetrics.pauseCount,
      averagePauseSeconds: scenario.sampleMetrics.averagePauseSeconds,
      transcript: scenario.sampleTranscript,
      timelineEvents: [
        { timestamp: 12, type: 'filler', label: 'Filler word bridge' },
        { timestamp: 24, type: 'pause', label: 'Natural 1.8s breath pause' },
      ],
    };
    handleEvaluate(metrics);
  };

  const handleSelectHistorySession = (item: SessionHistoryItem) => {
    setCurrentMetrics(item.metrics);
    setCurrentEvaluation(item.evaluation);
    setActiveTab('studio');
  };

  const handleDeleteHistorySession = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddSampleHistory = () => {
    const sampleItems: SessionHistoryItem[] = [
      {
        id: `sample_${Date.now()}_3`,
        timestamp: 'Today, 2:15 PM',
        metrics: {
          id: `sample_m_3`,
          createdAt: '2:15 PM',
          scenarioTitle: '60-Second Investor Pitch',
          durationSeconds: 48,
          wordCount: 114,
          wordsPerMinute: 142,
          fillerWordCount: 1,
          fillerDetails: [{ word: 'um', count: 1, timestamps: [18] }],
          eyeContactPercentage: 88,
          postureStabilityPercentage: 92,
          pauseCount: 5,
          averagePauseSeconds: 1.5,
          transcript: "Every year, enterprise security teams drown in twenty thousand false alarms daily. Vocalis solves this with deterministic verification models that filter out 98% of noise...",
          timelineEvents: [
            { timestamp: 18, type: 'filler', label: 'Brief bridge "um"' },
            { timestamp: 32, type: 'pause', label: 'Deliberate 1.5s pause' }
          ]
        },
        evaluation: {
          overallScore: 92,
          primaryGenuineStrength: "Authoritative cadence with crisp, clear metric delivery.",
          warmEncouragingSummary: "Exceptional mastery of pacing and conciseness. Your pause placement commands immediate attention.",
          deliveryAndPace: {
            score: 95,
            paceAssessment: "Flawless executive pace (142 WPM)",
            strengths: ["Steady rhythm", "Natural breath transitions"],
            actionableTips: ["Maintain this exact steady breath cadence"],
            keyObservation: "Optimal conversational pacing."
          },
          verbalContent: {
            score: 91,
            structureTone: "Razor-sharp value proposition",
            fillerWordAnalysis: "Single isolated filler word",
            strengths: ["High verbal economy", "Impactful statistics"],
            actionableTips: ["Use silence instead of bridging with 'um'"],
            keyObservation: "Very high signal-to-noise ratio."
          },
          nonVerbalCues: {
            score: 90,
            eyeContactAssessment: "88% direct camera connection",
            facialPostureEngagement: "92% poised posture",
            strengths: ["Firm eye anchor", "Open shoulders"],
            actionableTips: ["Keep chin level through concluding sentence"],
            keyObservation: "High executive presence."
          },
          transcriptHighlights: [],
          recommendedDrills: []
        }
      },
      {
        id: `sample_${Date.now()}_2`,
        timestamp: 'Yesterday, 4:30 PM',
        metrics: {
          id: `sample_m_2`,
          createdAt: '4:30 PM',
          scenarioTitle: 'Behavioral Job Interview',
          durationSeconds: 54,
          wordCount: 135,
          wordsPerMinute: 150,
          fillerWordCount: 4,
          fillerDetails: [
            { word: 'like', count: 2, timestamps: [14, 32] },
            { word: 'so', count: 2, timestamps: [22, 45] }
          ],
          eyeContactPercentage: 80,
          postureStabilityPercentage: 85,
          pauseCount: 4,
          averagePauseSeconds: 1.4,
          transcript: "In my previous role as team lead, we faced an unexpected production outage during our busiest quarter...",
          timelineEvents: [
            { timestamp: 14, type: 'filler', label: 'Filler: "like"' },
            { timestamp: 28, type: 'pause', label: 'Pause (1.4s)' }
          ]
        },
        evaluation: {
          overallScore: 84,
          primaryGenuineStrength: "Engaging storytelling structure with authentic passion.",
          warmEncouragingSummary: "Clear progression from problem to solution. Trimming transition words will elevate authority.",
          deliveryAndPace: {
            score: 86,
            paceAssessment: "Slightly brisk but well controlled (150 WPM)",
            strengths: ["Energetic delivery", "Good volume consistency"],
            actionableTips: ["Inhale before answering key prompts"],
            keyObservation: "Good momentum throughout."
          },
          verbalContent: {
            score: 82,
            structureTone: "Structured STAR framework",
            fillerWordAnalysis: "4 filler occurrences detected",
            strengths: ["Clear action steps described"],
            actionableTips: ["Replace 'like' with 1-second pause"],
            keyObservation: "Story arc was clear and easy to follow."
          },
          nonVerbalCues: {
            score: 84,
            eyeContactAssessment: "80% camera connection",
            facialPostureEngagement: "85% stability",
            strengths: ["Good head alignment"],
            actionableTips: ["Anchor gaze on camera lens during key findings"],
            keyObservation: "Strong visual engagement."
          },
          transcriptHighlights: [],
          recommendedDrills: []
        }
      },
      {
        id: `sample_${Date.now()}_casual_1`,
        timestamp: '3 days ago, 10:00 AM',
        metrics: {
          id: `sample_m_casual_1`,
          createdAt: '10:00 AM',
          scenarioId: 'difficult_conversation',
          scenarioTitle: 'Difficult Feedback Conversation',
          durationSeconds: 46,
          wordCount: 96,
          wordsPerMinute: 125,
          fillerWordCount: 1,
          fillerDetails: [{ word: 'well', count: 1, timestamps: [18] }],
          eyeContactPercentage: 82,
          postureStabilityPercentage: 88,
          pauseCount: 4,
          averagePauseSeconds: 1.8,
          transcript: "Thank you for syncing one-on-one. I wanted to talk about our sprint deliverables for checkout...",
          timelineEvents: [
            { timestamp: 18, type: 'filler', label: 'Filler: "well"' },
            { timestamp: 30, type: 'pause', label: 'Comfortable 1.8s breath pause' }
          ]
        },
        evaluation: {
          overallScore: 86,
          primaryGenuineStrength: "Calm, empathetic non-defensive tone that establishes safety.",
          warmEncouragingSummary: "Superb cadence for delicate interpersonal dialogue. Natural phrase spacing kept cortisol low.",
          deliveryAndPace: {
            score: 88,
            paceAssessment: "Gentle, measured conversational pace (125 WPM)",
            strengths: ["Warm modulation", "No defensive rush"],
            actionableTips: ["Continue holding silence comfortably after asking questions"],
            keyObservation: "Pacing invited psychological safety."
          },
          verbalContent: {
            score: 85,
            structureTone: "Constructive feedback format",
            fillerWordAnalysis: "Single filler, very clean",
            strengths: ["Empathetic framing", "Collaborative problem-solving"],
            actionableTips: ["Lead with direct observation before shared solutions"],
            keyObservation: "High verbal clarity and warmth."
          },
          nonVerbalCues: {
            score: 86,
            eyeContactAssessment: "82% compassionate screen contact",
            facialPostureEngagement: "88% open relaxed posture",
            strengths: ["Warm facial expression"],
            actionableTips: ["Maintain level chin angle"],
            keyObservation: "Inviting posture."
          },
          transcriptHighlights: [],
          recommendedDrills: []
        }
      },
      {
        id: `sample_${Date.now()}_interview_2`,
        timestamp: '4 days ago, 2:30 PM',
        metrics: {
          id: `sample_m_interview_2`,
          createdAt: '2:30 PM',
          scenarioId: 'interview_tech',
          scenarioTitle: 'Technical Architecture Interview',
          durationSeconds: 52,
          wordCount: 122,
          wordsPerMinute: 140,
          fillerWordCount: 2,
          fillerDetails: [
            { word: 'um', count: 1, timestamps: [14] },
            { word: 'like', count: 1, timestamps: [36] }
          ],
          eyeContactPercentage: 78,
          postureStabilityPercentage: 84,
          pauseCount: 4,
          averagePauseSeconds: 1.5,
          transcript: "When architecting our distributed caching layer, we had to choose between Redis and Memcached...",
          timelineEvents: [
            { timestamp: 14, type: 'filler', label: 'Filler "um"' },
            { timestamp: 36, type: 'filler', label: 'Filler "like"' }
          ]
        },
        evaluation: {
          overallScore: 88,
          primaryGenuineStrength: "Precise engineering terminology delivered with calm conviction.",
          warmEncouragingSummary: "Strong technical answer. You balanced trade-offs concisely without rambling.",
          deliveryAndPace: {
            score: 90,
            paceAssessment: "Calibrated 140 WPM interview cadence",
            strengths: ["Steady explanation speed", "Thoughtful pauses"],
            actionableTips: ["Pause silently when recalling specific data structures"],
            keyObservation: "Rhythm remained consistent."
          },
          verbalContent: {
            score: 87,
            structureTone: "Rigorous technical STAR structure",
            fillerWordAnalysis: "2 isolated fillers",
            strengths: ["Concrete architecture trade-offs"],
            actionableTips: ["Anchor conclusion with the final system uptime"],
            keyObservation: "Very credible technical depth."
          },
          nonVerbalCues: {
            score: 86,
            eyeContactAssessment: "78% camera focus",
            facialPostureEngagement: "84% poised alignment",
            strengths: ["Direct eye connection"],
            actionableTips: ["Keep eyes anchored to camera when stating final stats"],
            keyObservation: "Solid executive poise."
          },
          transcriptHighlights: [],
          recommendedDrills: []
        }
      },
      {
        id: `sample_${Date.now()}_pro_2`,
        timestamp: '5 days ago, 11:15 AM',
        metrics: {
          id: `sample_m_pro_2`,
          createdAt: '11:15 AM',
          scenarioId: 'keynote_presentation',
          scenarioTitle: 'Keynote & All-Hands Address',
          durationSeconds: 60,
          wordCount: 130,
          wordsPerMinute: 130,
          fillerWordCount: 2,
          fillerDetails: [
            { word: 'so', count: 2, timestamps: [20, 44] }
          ],
          eyeContactPercentage: 84,
          postureStabilityPercentage: 90,
          pauseCount: 6,
          averagePauseSeconds: 2.0,
          transcript: "Good morning team. Today we make the most consequential strategic decision in our journey...",
          timelineEvents: [
            { timestamp: 20, type: 'filler', label: 'Filler "so"' },
            { timestamp: 35, type: 'pause', label: 'Dramatic 2s keynote pause' }
          ]
        },
        evaluation: {
          overallScore: 89,
          primaryGenuineStrength: "Inspiring rhetorical pauses that let critical vision land.",
          warmEncouragingSummary: "Magnetic all-hands delivery. Your deliberate pauses conveyed deep leadership poise.",
          deliveryAndPace: {
            score: 92,
            paceAssessment: "Masterful 130 WPM keynote cadence",
            strengths: ["Dramatic pauses", "Resonant projection"],
            actionableTips: ["Hold eye contact through concluding vision statement"],
            keyObservation: "Audience-commanding cadence."
          },
          verbalContent: {
            score: 88,
            structureTone: "Compelling motivational arc",
            fillerWordAnalysis: "Only 2 minor filler occurrences",
            strengths: ["Strong opening hook", "Clear rallying cry"],
            actionableTips: ["Drop transitional 'so' before key announcements"],
            keyObservation: "Inspiring narrative arc."
          },
          nonVerbalCues: {
            score: 88,
            eyeContactAssessment: "84% direct engagement",
            facialPostureEngagement: "90% chest-open posture",
            strengths: ["Open chest", "Level shoulders"],
            actionableTips: ["Allow gentle head nod on concluding call-to-action"],
            keyObservation: "High inspirational posture."
          },
          transcriptHighlights: [],
          recommendedDrills: []
        }
      }
    ];

    setHistory((prev) => [...sampleItems, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F9FF] text-[#1E293B]">
      {/* Dedicated Intro / Splash Screen on Startup */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} durationMs={2600} />
      )}

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'studio') {
            // Keep currentEvaluation in memory but switch view
          }
        }}
        onOpenManualEntry={() => setIsManualModalOpen(true)}
        onReplaySplash={() => setShowSplash(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Loading / Evaluating State Curtain */}
        {isEvaluating && (
          <div className="max-w-xl mx-auto px-4 py-20 text-center animate-in fade-in duration-300">
            <div className="surface p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#E0F2FE] border-2 border-[#1CB0F6] text-[#1CB0F6] flex items-center justify-center mx-auto shadow-xs">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#1E293B]">AI Speech Coach at Work</h2>
              <p className="text-sm font-bold text-[#1CB0F6] font-mono">
                {evaluationStageText}
              </p>
              <p className="font-label text-slate-400 max-w-sm mx-auto">
                ANALYZING VOCAL CADENCE AGAINST CLINICAL SPEECH RUBRICS AND EXECUTIVE DELIVERY BENCHMARKS
              </p>
            </div>
          </div>
        )}

        {/* Evaluation Error Banner */}
        {evalError && !isEvaluating && (
          <div className="max-w-4xl mx-auto px-4 my-6">
            <div className="surface p-4 border-amber-300! bg-[#FFFBEB]! text-[#92400E] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{evalError}</span>
              </div>
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="btn-primary-blue text-xs py-1.5! px-3!"
              >
                Try Manual Benchmark
              </button>
            </div>
          </div>
        )}

        {/* Main Tab Routing (when not actively evaluating) */}
        {!isEvaluating && (
          <>
            {activeTab === 'studio' && (
              currentEvaluation && currentMetrics ? (
                <EvaluationView
                  metrics={currentMetrics}
                  evaluation={currentEvaluation}
                  onStartNewPractice={handleStartNewPractice}
                  onLaunchDrill={(drill) => setActiveDrillModal(drill)}
                  activeGoal={activeGoal}
                  onUpdateGoal={handleUpdateGoal}
                  history={history}
                />
              ) : (
                <LiveStage
                  activeScenario={activeScenario}
                  onFinishSession={handleEvaluate}
                  onOpenManualEntry={() => setIsManualModalOpen(true)}
                  onSelectScenario={handleSelectScenario}
                  activeGoal={activeGoal}
                  onUpdateGoal={handleUpdateGoal}
                  history={history}
                  dailyStreak={dailyStreak}
                  onRecordDailyPractice={handleRecordDailyPractice}
                />
              )
            )}

            {activeTab === 'scenarios' && (
              <ScenariosView
                onSelectScenario={handleSelectScenario}
                onPreloadBenchmark={handlePreloadBenchmark}
              />
            )}

            {activeTab === 'drills' && (
              <DrillsView
                onLaunchDrill={(drill) => setActiveDrillModal(drill)}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                history={history}
                onSelectSession={handleSelectHistorySession}
                onDeleteSession={handleDeleteHistorySession}
                onStartPractice={() => {
                  setCurrentEvaluation(null);
                  setCurrentMetrics(null);
                  setActiveTab('studio');
                }}
                onAddSampleHistory={handleAddSampleHistory}
              />
            )}
          </>
        )}
      </main>

      {/* Manual & Benchmark Entry Modal */}
      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAnalyze={handleEvaluate}
        activeScenario={activeScenario}
      />

      {/* Interactive Micro-Drill Modal */}
      <InteractiveDrillModal
        drill={activeDrillModal}
        onClose={() => setActiveDrillModal(null)}
      />

      {/* Footer matching Variation 5 */}
      <footer className="h-[60px] border-t-2 border-[#E5E7EB] bg-white flex items-center justify-between px-6 sm:px-12 text-[0.75rem] font-extrabold text-[#AFC2D1] tracking-wider uppercase">
        <div className="flex items-center gap-3 sm:gap-6">
          <span>DELIVERY & PACE</span>
          <span>•</span>
          <span>VERBAL CONTENT</span>
          <span>•</span>
          <span>NON-VERBAL CUES</span>
        </div>
        <div>
          <span>© {new Date().getFullYear()} FLUENTO</span>
        </div>
      </footer>
    </div>
  );
}
