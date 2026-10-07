export type CoachingPillar = 'delivery' | 'verbal' | 'nonverbal';

export interface Scenario {
  id: string;
  title: string;
  category: 'interview' | 'pitch' | 'presentation' | 'conversation' | 'therapy';
  description: string;
  targetWpmRange: [number, number];
  targetEyeContact: number;
  promptQuestion: string;
  hints: string[];
  sampleTranscript: string;
  sampleMetrics: {
    durationSeconds: number;
    wordCount: number;
    wordsPerMinute: number;
    fillerWordCount: number;
    fillerDetails: { word: string; count: number; timestamps: number[] }[];
    eyeContactPercentage: number;
    postureStabilityPercentage: number;
    pauseCount: number;
    averagePauseSeconds: number;
  };
}

export interface TimelineEvent {
  timestamp: number; // in seconds
  type: 'filler' | 'pause' | 'pace_spike';
  label: string;
  details?: string;
}

export interface SessionMetrics {
  id: string;
  createdAt: string;
  scenarioId?: string;
  scenarioTitle: string;
  durationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  fillerWordCount: number;
  fillerDetails: { word: string; count: number; timestamps: number[] }[];
  eyeContactPercentage: number;
  postureStabilityPercentage: number;
  pauseCount: number;
  averagePauseSeconds: number;
  transcript: string;
  timelineEvents: TimelineEvent[];
}

export interface PillarEvaluation {
  score: number;
  paceAssessment?: string;
  structureTone?: string;
  fillerWordAnalysis?: string;
  eyeContactAssessment?: string;
  facialPostureEngagement?: string;
  strengths: string[];
  actionableTips: string[];
  keyObservation: string;
}

export interface TranscriptHighlight {
  snippet: string;
  category: 'praise' | 'filler_reduction' | 'conciseness' | 'phrasing_upgrade';
  feedback: string;
  improvedAlternative: string;
}

export interface PracticeDrill {
  id: string;
  title: string;
  pillar: CoachingPillar;
  timeMinutes: number;
  targetMetric: string;
  instructions: string;
  drillType: 'metronome' | 'pause_trainer' | 'eye_anchor' | 'filler_substitution';
  recommendedBpm?: number;
}

export interface EvaluationResult {
  overallScore: number;
  primaryGenuineStrength: string;
  warmEncouragingSummary: string;
  deliveryAndPace: {
    score: number;
    paceAssessment: string;
    strengths: string[];
    actionableTips: string[];
    keyObservation: string;
  };
  verbalContent: {
    score: number;
    structureTone: string;
    fillerWordAnalysis: string;
    strengths: string[];
    actionableTips: string[];
    keyObservation: string;
  };
  nonVerbalCues: {
    score: number;
    eyeContactAssessment: string;
    facialPostureEngagement: string;
    strengths: string[];
    actionableTips: string[];
    keyObservation: string;
  };
  transcriptHighlights: TranscriptHighlight[];
  recommendedDrills: PracticeDrill[];
}

export interface SessionHistoryItem {
  id: string;
  timestamp: string;
  metrics: SessionMetrics;
  evaluation: EvaluationResult;
}

export interface SpeechTargetGoal {
  id: string;
  name: string;
  description: string;
  targetWpm: number;
  wpmTolerance: number; // e.g. ±10 WPM
  maxFillers: number;
  minEyeContact: number;
  minPauseCount?: number;
  createdAt: string;
  isCustom?: boolean;
}

export interface GoalSessionResult {
  sessionId: string;
  date: string;
  actualWpm: number;
  actualFillers: number;
  actualEyeContact: number;
  wpmAchieved: boolean;
  fillersAchieved: boolean;
  eyeContactAchieved: boolean;
  fullyAchieved: boolean;
}

export interface GoalProgressSummary {
  goal: SpeechTargetGoal;
  totalAttempts: number;
  achievedCount: number;
  successRate: number; // 0 - 100%
  currentStreak: number;
  bestStreak: number;
  recentResults: GoalSessionResult[];
}

export type CommunicationClassLevel = 'Class D' | 'Class C' | 'Class B' | 'Class A';

export interface CommunicationClassTier {
  level: CommunicationClassLevel;
  title: string;
  shortBadge: string;
  levelNumber: number;
  idealWpmRange: [number, number];
  maxFillers: number;
  minEyeContact: number;
  minPauseCount: number;
  description: string;
  competencies: string[];
  color: string;
  bgLight: string;
  borderColor: string;
}

export interface ClassWiseAnalysisResult {
  currentClass: CommunicationClassTier;
  targetClass: CommunicationClassTier;
  classMatchPercentage: number;
  pillarBreakdown: {
    paceClass: CommunicationClassLevel;
    fillerClass: CommunicationClassLevel;
    eyeContactClass: CommunicationClassLevel;
  };
  unlockedCompetencies: string[];
  nextLevelMilestones: string[];
}

export type SessionFilterType = 'All' | 'Professional' | 'Casual' | 'Interviews';

export function getSessionCategory(item: SessionHistoryItem): 'Professional' | 'Casual' | 'Interviews' {
  const scenarioId = (item.metrics.scenarioId || '').toLowerCase();
  const title = (item.metrics.scenarioTitle || '').toLowerCase();

  // Interviews
  if (
    scenarioId.includes('interview') ||
    title.includes('interview') ||
    title.includes('behavioral') ||
    title.includes('hiring') ||
    title.includes('candidate')
  ) {
    return 'Interviews';
  }

  // Professional: pitches, keynotes, board presentations, investor meetings, executive addresses
  if (
    scenarioId.includes('pitch') ||
    scenarioId.includes('presentation') ||
    scenarioId.includes('keynote') ||
    scenarioId.includes('executive') ||
    title.includes('pitch') ||
    title.includes('presentation') ||
    title.includes('keynote') ||
    title.includes('executive') ||
    title.includes('investor') ||
    title.includes('all-hands') ||
    title.includes('board') ||
    title.includes('business') ||
    title.includes('product')
  ) {
    return 'Professional';
  }

  // Casual: conversations, therapy, social, everyday, dialogue
  return 'Casual';
}

export interface DailyStreakState {
  currentStreak: number;
  bestStreak: number;
  lastPracticeDate: string; // 'YYYY-MM-DD'
  todayPracticed: boolean;
  practiceHistory: string[]; // dates array 'YYYY-MM-DD'
  totalPracticeDays: number;
}
