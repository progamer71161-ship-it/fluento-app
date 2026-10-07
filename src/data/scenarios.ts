import { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'interview_star',
    title: 'Behavioral Job Interview',
    category: 'interview',
    description: 'Structure complex engineering or leadership achievements using Situation, Task, Action, and Result.',
    targetWpmRange: [135, 155],
    targetEyeContact: 75,
    promptQuestion: 'Tell me about a time you led a team through an unexpected crisis or high-stakes deadline.',
    hints: [
      'Spend 15% on Situation/Task, 60% on specific Actions you took, 25% on tangible Results.',
      'Maintain steady eye contact with the camera lens when delivering your punchy conclusion.',
      'Use deliberate 1-second transitions instead of saying "and um, so yeah".'
    ],
    sampleTranscript: "In my previous role as lead engineer, our payment gateway failed during Black Friday weekend, threatening millions in sales. Um, my immediate task was to stabilize checkout within thirty minutes. I gathered a tiger team of four engineers, isolated the misconfigured database connection pool, and rolled back the hotfix within twelve minutes. Like, we then introduced circuit breakers so future spikes wouldn't cascade. As a result, checkout availability was restored to 99.98% for the remainder of the rush, saving an estimated 450,000 dollars in revenue.",
    sampleMetrics: {
      durationSeconds: 52,
      wordCount: 94,
      wordsPerMinute: 148,
      fillerWordCount: 3,
      fillerDetails: [
        { word: 'um', count: 1, timestamps: [12] },
        { word: 'like', count: 1, timestamps: [34] },
        { word: 'so', count: 1, timestamps: [37] }
      ],
      eyeContactPercentage: 78,
      postureStabilityPercentage: 86,
      pauseCount: 4,
      averagePauseSeconds: 1.4
    }
  },
  {
    id: 'executive_pitch',
    title: '60-Second Investor / Executive Pitch',
    category: 'pitch',
    description: 'Deliver a high-velocity, razor-sharp value proposition with high confidence and zero hesitation.',
    targetWpmRange: [130, 150],
    targetEyeContact: 85,
    promptQuestion: 'Pitch your breakthrough product to a venture investor in under 60 seconds.',
    hints: [
      'Hook with an acute industry pain point within the first 10 seconds.',
      'State your technical moat clearly with concrete metrics.',
      'Keep eye contact centered directly on the camera lens to project conviction.'
    ],
    sampleTranscript: "Every year, enterprise security teams drown in twenty thousand false alarms daily. Vocalis Security solves this by using deterministic verification models that filter out 98% of noise in real time. We replace four hours of manual triage with a 10-second automated diagnostic. In our first beta with three Fortune 500 customers, we cut incident response times by half, and closed seventy thousand dollars in recurring revenue in just thirty days. We are raising our seed round to scale engineering.",
    sampleMetrics: {
      durationSeconds: 42,
      wordCount: 88,
      wordsPerMinute: 139,
      fillerWordCount: 0,
      fillerDetails: [],
      eyeContactPercentage: 88,
      postureStabilityPercentage: 92,
      pauseCount: 5,
      averagePauseSeconds: 1.2
    }
  },
  {
    id: 'keynote_presentation',
    title: 'Keynote & All-Hands Address',
    category: 'presentation',
    description: 'Inspire and align a large audience with dynamic vocal modulation, intentional dramatic pauses, and open posture.',
    targetWpmRange: [120, 145],
    targetEyeContact: 70,
    promptQuestion: 'Address your company to announce a pivotal shift in product strategy for the upcoming year.',
    hints: [
      'Allow 2-second silence after major statements to let key insights land.',
      'Avoid rushing through slides; steady breathing commands authority.',
      'Keep an open chest posture with level shoulders.'
    ],
    sampleTranscript: "Good morning team. Today, we are making the most consequential architectural decision in our company's history. Over the past six months, we listened closely to our customers, and um, what they told us was simple: speed and reliability beat feature quantity every single time. So, starting next quarter, we are dedicating forty percent of all engineering capacity to zero-downtime infrastructure and performance optimization. This isn't a pivot; it's a doubling down on craftsmanship. Let's build something we are genuinely proud of.",
    sampleMetrics: {
      durationSeconds: 58,
      wordCount: 85,
      wordsPerMinute: 122,
      fillerWordCount: 2,
      fillerDetails: [
        { word: 'um', count: 1, timestamps: [18] },
        { word: 'so', count: 1, timestamps: [25] }
      ],
      eyeContactPercentage: 74,
      postureStabilityPercentage: 85,
      pauseCount: 6,
      averagePauseSeconds: 2.1
    }
  },
  {
    id: 'difficult_conversation',
    title: 'Difficult Feedback Conversation',
    category: 'conversation',
    description: 'Address sensitive team performance issues with empathy, non-defensive cadence, and psychological safety.',
    targetWpmRange: [115, 135],
    targetEyeContact: 80,
    promptQuestion: 'Deliver constructive feedback to a senior colleague whose missed deadlines are impacting sprint velocity.',
    hints: [
      'Adopt a calm, compassionate speaking pace to keep cortisol levels low.',
      'Ask open questions and pause comfortably to invite genuine collaboration.',
      'Maintain warm, steady facial engagement without crossing your arms.'
    ],
    sampleTranscript: "Thank you for taking the time to sync one-on-one. I wanted to chat about the last two sprint deliveries for the checkout migration. I noticed that the PR reviews slipped past Wednesday, which created a bottleneck for QA. I know you've been balancing unexpected production support tickets as well. I value your technical judgment tremendously, and I want to make sure you have the breathing room to do your best work. How can we rebalance these responsibilities together?",
    sampleMetrics: {
      durationSeconds: 46,
      wordCount: 81,
      wordsPerMinute: 125,
      fillerWordCount: 1,
      fillerDetails: [
        { word: 'well', count: 1, timestamps: [28] }
      ],
      eyeContactPercentage: 82,
      postureStabilityPercentage: 89,
      pauseCount: 4,
      averagePauseSeconds: 1.8
    }
  },
  {
    id: 'speech_fluency_therapy',
    title: 'Fluency & Pacing Therapy Practice',
    category: 'therapy',
    description: 'Clinical fluency practice focused on gentle vocal onset, diaphragmatic breath resets, and stutter-free rhythm.',
    targetWpmRange: [110, 130],
    targetEyeContact: 70,
    promptQuestion: 'Practice reading or recounting a personal story using gentle phrase chunks and natural respiratory pauses.',
    hints: [
      'Take a gentle diaphragmatic inhale before each sentence.',
      'Emphasize smooth continuous phonation across word boundaries.',
      'Treat pauses as your anchor of power, never a failure.'
    ],
    sampleTranscript: "Early this morning, I walked through the park near my home. The air was crisp, and the autumn leaves were beginning to turn golden. I watched a group of rowers gliding silently across the river. It reminded me how much rhythm and ease matter, especially when we communicate. Every sentence is simply a breath shared with another person.",
    sampleMetrics: {
      durationSeconds: 38,
      wordCount: 61,
      wordsPerMinute: 118,
      fillerWordCount: 0,
      fillerDetails: [],
      eyeContactPercentage: 75,
      postureStabilityPercentage: 90,
      pauseCount: 5,
      averagePauseSeconds: 1.9
    }
  }
];

export const FILLER_WORDS_LIST = [
  'um',
  'uh',
  'like',
  'you know',
  'sort of',
  'kind of',
  'actually',
  'basically',
  'literally',
  'so',
  'right',
  'i mean'
];
