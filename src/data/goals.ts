import {
  SpeechTargetGoal,
  GoalSessionResult,
  GoalProgressSummary,
  SessionHistoryItem,
  SessionMetrics,
  CommunicationClassTier,
  CommunicationClassLevel,
  ClassWiseAnalysisResult
} from '../types';

export const GOAL_STORAGE_KEY = 'fluento_active_speech_goal';

export const DEFAULT_GOAL_PRESETS: SpeechTargetGoal[] = [
  {
    id: 'executive_clarity',
    name: 'Executive Clarity',
    description: 'Measured, authoritative cadence with minimal filler pauses, suitable for boardroom presentations and leadership meetings.',
    targetWpm: 140,
    wpmTolerance: 10,
    maxFillers: 2,
    minEyeContact: 80,
    minPauseCount: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'high_energy_keynote',
    name: 'Dynamic Keynote',
    description: 'Brisk, charismatic tempo with sharp engagement and steady eye contact for pitches and large audience talks.',
    targetWpm: 155,
    wpmTolerance: 12,
    maxFillers: 3,
    minEyeContact: 85,
    minPauseCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'thoughtful_storyteller',
    name: 'Thoughtful Storyteller',
    description: 'Unrushed, reflective pacing that leaves generous room for breath and audience connection.',
    targetWpm: 128,
    wpmTolerance: 8,
    maxFillers: 1,
    minEyeContact: 75,
    minPauseCount: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'zero_filler_mastery',
    name: 'Zero-Filler Mastery',
    description: 'Laser focus on deliberate silent breath transitions instead of filler crutches like "um" or "like".',
    targetWpm: 135,
    wpmTolerance: 15,
    maxFillers: 0,
    minEyeContact: 80,
    minPauseCount: 4,
    createdAt: new Date().toISOString(),
  }
];

export function getActiveGoal(): SpeechTargetGoal {
  try {
    const saved = localStorage.getItem(GOAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load active goal from localStorage', e);
  }
  return DEFAULT_GOAL_PRESETS[0];
}

export function saveActiveGoal(goal: SpeechTargetGoal): void {
  try {
    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goal));
  } catch (e) {
    console.warn('Failed to save active goal to localStorage', e);
  }
}

export function evaluateMetricsAgainstGoal(
  goal: SpeechTargetGoal,
  metrics: SessionMetrics
): {
  wpmAchieved: boolean;
  fillersAchieved: boolean;
  eyeContactAchieved: boolean;
  pausesAchieved: boolean;
  fullyAchieved: boolean;
  wpmDelta: number;
} {
  const minWpm = goal.targetWpm - goal.wpmTolerance;
  const maxWpm = goal.targetWpm + goal.wpmTolerance;
  const wpmAchieved = metrics.wordsPerMinute >= minWpm && metrics.wordsPerMinute <= maxWpm;
  const fillersAchieved = metrics.fillerWordCount <= goal.maxFillers;
  const eyeContactAchieved = metrics.eyeContactPercentage >= goal.minEyeContact;
  const minPauses = goal.minPauseCount ?? 0;
  const pausesAchieved = metrics.pauseCount >= minPauses;

  const fullyAchieved = wpmAchieved && fillersAchieved && eyeContactAchieved && pausesAchieved;
  const wpmDelta = metrics.wordsPerMinute - goal.targetWpm;

  return {
    wpmAchieved,
    fillersAchieved,
    eyeContactAchieved,
    pausesAchieved,
    fullyAchieved,
    wpmDelta,
  };
}

export function computeGoalProgress(
  goal: SpeechTargetGoal,
  history: SessionHistoryItem[]
): GoalProgressSummary {
  if (!history || history.length === 0) {
    return {
      goal,
      totalAttempts: 0,
      achievedCount: 0,
      successRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      recentResults: [],
    };
  }

  const results: GoalSessionResult[] = history.map((item) => {
    const evalResult = evaluateMetricsAgainstGoal(goal, item.metrics);
    return {
      sessionId: item.id,
      date: item.timestamp,
      actualWpm: item.metrics.wordsPerMinute,
      actualFillers: item.metrics.fillerWordCount,
      actualEyeContact: item.metrics.eyeContactPercentage,
      wpmAchieved: evalResult.wpmAchieved,
      fillersAchieved: evalResult.fillersAchieved,
      eyeContactAchieved: evalResult.eyeContactAchieved,
      fullyAchieved: evalResult.fullyAchieved,
    };
  });

  const totalAttempts = results.length;
  const achievedCount = results.filter((r) => r.fullyAchieved).length;
  const successRate = totalAttempts > 0 ? Math.round((achievedCount / totalAttempts) * 100) : 0;

  // Calculate current streak (most recent first)
  let currentStreak = 0;
  for (let i = 0; i < results.length; i++) {
    if (results[i].fullyAchieved) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate best streak historically (reverse order: oldest to newest)
  let bestStreak = 0;
  let tempStreak = 0;
  const chronological = [...results].reverse();
  for (let i = 0; i < chronological.length; i++) {
    if (chronological[i].fullyAchieved) {
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  return {
    goal,
    totalAttempts,
    achievedCount,
    successRate,
    currentStreak,
    bestStreak,
    recentResults: results.slice(0, 5), // last 5 sessions
  };
}

export const COMMUNICATION_CLASSES: CommunicationClassTier[] = [
  {
    level: 'Class A',
    title: 'Class A: Executive & Keynote Mastery',
    shortBadge: 'Class A · Level 4',
    levelNumber: 4,
    idealWpmRange: [135, 155],
    maxFillers: 1,
    minEyeContact: 85,
    minPauseCount: 3,
    description: 'Top-tier leadership delivery with deliberate breath spacing, forward vocal placement, and magnetic audience engagement.',
    competencies: [
      'Sub-2 filler execution per minute',
      'Calibrated executive pace (135–155 WPM)',
      'Commanding eye-level focus (≥85%)',
      'Resonant breath punctuation'
    ],
    color: '#2D5A43',
    bgLight: '#E8F1EC',
    borderColor: '#C8DFD2',
  },
  {
    level: 'Class B',
    title: 'Class B: Proficient Professional',
    shortBadge: 'Class B · Level 3',
    levelNumber: 3,
    idealWpmRange: [125, 160],
    maxFillers: 3,
    minEyeContact: 75,
    minPauseCount: 2,
    description: 'Clear, fluent workplace and client-ready communication with steady cadence and minimal conversational friction.',
    competencies: [
      'Controlled filler frequency (≤3)',
      'Natural conversational cadence (125–160 WPM)',
      'Consistent screen contact (≥75%)',
      'Effective pause transitions'
    ],
    color: '#3B7A57',
    bgLight: '#F0F5F2',
    borderColor: '#D5E6DB',
  },
  {
    level: 'Class C',
    title: 'Class C: Competent Conversational',
    shortBadge: 'Class C · Level 2',
    levelNumber: 2,
    idealWpmRange: [110, 170],
    maxFillers: 5,
    minEyeContact: 65,
    minPauseCount: 1,
    description: 'Functional everyday speech with occasional pacing rushes and filler crutches under complexity or hesitation.',
    competencies: [
      'Functional message articulation',
      'Developing pacing control',
      'Basic camera presence'
    ],
    color: '#8A6828',
    bgLight: '#FBF5EC',
    borderColor: '#E5D7C2',
  },
  {
    level: 'Class D',
    title: 'Class D: Foundational Speaker',
    shortBadge: 'Class D · Level 1',
    levelNumber: 1,
    idealWpmRange: [90, 185],
    maxFillers: 10,
    minEyeContact: 50,
    minPauseCount: 0,
    description: 'Developing vocal stability; speech may show rapid anxiety rushes, frequent vocal fillers, or camera disengagement.',
    competencies: [
      'Establishing diaphragm breath foundation',
      'Becoming conscious of filler habits'
    ],
    color: '#9C5A2B',
    bgLight: '#FDF6ED',
    borderColor: '#F3DFC9',
  }
];

export function determineMetricClass(wpm: number, fillers: number, eye: number): {
  paceClass: CommunicationClassLevel;
  fillerClass: CommunicationClassLevel;
  eyeContactClass: CommunicationClassLevel;
  overallClass: CommunicationClassLevel;
} {
  // Pace evaluation
  let paceClass: CommunicationClassLevel = 'Class D';
  if (wpm >= 135 && wpm <= 155) paceClass = 'Class A';
  else if (wpm >= 125 && wpm <= 165) paceClass = 'Class B';
  else if (wpm >= 110 && wpm <= 175) paceClass = 'Class C';

  // Filler evaluation
  let fillerClass: CommunicationClassLevel = 'Class D';
  if (fillers <= 1) fillerClass = 'Class A';
  else if (fillers <= 3) fillerClass = 'Class B';
  else if (fillers <= 5) fillerClass = 'Class C';

  // Eye contact evaluation
  let eyeContactClass: CommunicationClassLevel = 'Class D';
  if (eye >= 85) eyeContactClass = 'Class A';
  else if (eye >= 75) eyeContactClass = 'Class B';
  else if (eye >= 65) eyeContactClass = 'Class C';

  // Overall class: weighted calculation (A=4, B=3, C=2, D=1)
  const scoreMap: Record<CommunicationClassLevel, number> = {
    'Class A': 4,
    'Class B': 3,
    'Class C': 2,
    'Class D': 1,
  };
  const avg = (scoreMap[paceClass] + scoreMap[fillerClass] + scoreMap[eyeContactClass]) / 3;

  let overallClass: CommunicationClassLevel = 'Class D';
  if (avg >= 3.4) overallClass = 'Class A';
  else if (avg >= 2.5) overallClass = 'Class B';
  else if (avg >= 1.6) overallClass = 'Class C';

  return { paceClass, fillerClass, eyeContactClass, overallClass };
}

export function analyzeCommunicationClass(
  metrics: SessionMetrics,
  targetClassLevel: CommunicationClassLevel = 'Class A'
): ClassWiseAnalysisResult {
  const { paceClass, fillerClass, eyeContactClass, overallClass } = determineMetricClass(
    metrics.wordsPerMinute,
    metrics.fillerWordCount,
    metrics.eyeContactPercentage
  );

  const currentTier = COMMUNICATION_CLASSES.find((c) => c.level === overallClass) || COMMUNICATION_CLASSES[3];
  const targetTier = COMMUNICATION_CLASSES.find((c) => c.level === targetClassLevel) || COMMUNICATION_CLASSES[0];

  const scoreMap: Record<CommunicationClassLevel, number> = {
    'Class A': 4,
    'Class B': 3,
    'Class C': 2,
    'Class D': 1,
  };
  const currentVal = scoreMap[overallClass];
  const targetVal = scoreMap[targetClassLevel];
  const classMatchPercentage = Math.min(100, Math.round((currentVal / targetVal) * 100));

  const nextLevelMilestones: string[] = [];
  if (overallClass !== 'Class A') {
    if (paceClass !== 'Class A') {
      nextLevelMilestones.push(`Calibrate tempo closer to 135–155 WPM (currently ${metrics.wordsPerMinute} WPM)`);
    }
    if (fillerClass !== 'Class A') {
      nextLevelMilestones.push(`Reduce filler count to ≤ 1 (currently ${metrics.fillerWordCount}) by substituting pauses`);
    }
    if (eyeContactClass !== 'Class A') {
      nextLevelMilestones.push(`Increase camera eye contact to ≥ 85% (currently ${metrics.eyeContactPercentage}%)`);
    }
    if (metrics.pauseCount < 3) {
      nextLevelMilestones.push(`Add at least 3 deliberate silent breath transitions across speech`);
    }
  } else {
    nextLevelMilestones.push('Maintain Class A mastery across consecutive presentations to solidify your streak!');
  }

  return {
    currentClass: currentTier,
    targetClass: targetTier,
    classMatchPercentage,
    pillarBreakdown: {
      paceClass,
      fillerClass,
      eyeContactClass,
    },
    unlockedCompetencies: currentTier.competencies,
    nextLevelMilestones,
  };
}

