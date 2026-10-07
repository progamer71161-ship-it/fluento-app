import { DailyStreakState } from '../types';

export const STREAK_STORAGE_KEY = 'fluento_daily_practice_streak';

export function getLocalDateString(dateInput?: Date | string | number): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

export function getStoredDailyStreak(): DailyStreakState {
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) {
      // Default initial state (1-day baseline for encouraging start if user has existing sessions)
      return {
        currentStreak: 0,
        bestStreak: 0,
        lastPracticeDate: '',
        todayPracticed: false,
        practiceHistory: [],
        totalPracticeDays: 0,
      };
    }

    const data: DailyStreakState = JSON.parse(raw);

    // Evaluate streak validity against today's date
    if (data.lastPracticeDate === today) {
      return {
        ...data,
        todayPracticed: true,
      };
    } else if (data.lastPracticeDate === yesterday) {
      // Practiced yesterday, awaiting session today (streak still alive!)
      return {
        ...data,
        todayPracticed: false,
      };
    } else if (data.lastPracticeDate) {
      // More than 1 day missed; reset current streak to 0, preserve bestStreak
      return {
        ...data,
        currentStreak: 0,
        todayPracticed: false,
      };
    }

    return data;
  } catch (err) {
    console.warn('Failed to parse daily streak from localStorage', err);
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastPracticeDate: '',
      todayPracticed: false,
      practiceHistory: [],
      totalPracticeDays: 0,
    };
  }
}

export function saveStoredDailyStreak(streak: DailyStreakState): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
  } catch (err) {
    console.warn('Failed to write daily streak to localStorage', err);
  }
}

export function recordDailyPractice(): DailyStreakState {
  const current = getStoredDailyStreak();
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  // If already practiced today, keep streak and return
  if (current.lastPracticeDate === today && current.todayPracticed) {
    return current;
  }

  let newCurrentStreak = 1;
  if (current.lastPracticeDate === yesterday) {
    newCurrentStreak = current.currentStreak + 1;
  } else if (current.lastPracticeDate === today) {
    newCurrentStreak = Math.max(1, current.currentStreak);
  }

  const updatedHistory = Array.from(new Set([...current.practiceHistory, today]));
  const updatedBestStreak = Math.max(current.bestStreak, newCurrentStreak);

  const updated: DailyStreakState = {
    currentStreak: newCurrentStreak,
    bestStreak: updatedBestStreak,
    lastPracticeDate: today,
    todayPracticed: true,
    practiceHistory: updatedHistory,
    totalPracticeDays: updatedHistory.length,
  };

  saveStoredDailyStreak(updated);
  return updated;
}

export interface DayTrailItem {
  dayName: string;
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
  practiced: boolean;
}

export function getWeeklyDayTrail(practiceHistory: string[] = []): DayTrailItem[] {
  const todayStr = getLocalDateString();
  const historySet = new Set(practiceHistory);
  const items: DayTrailItem[] = [];

  // Generate 7 days ending with today
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayName = d.toLocaleDateString(undefined, { weekday: 'narrow' }); // 'M', 'T', 'W', etc.
    const dayNumber = d.getDate();

    items.push({
      dayName,
      dayNumber,
      dateStr,
      isToday: dateStr === todayStr,
      practiced: historySet.has(dateStr),
    });
  }

  return items;
}
