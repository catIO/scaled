/**
 * Returns a Date object stripped of time components (00:00:00.000 in local timezone).
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

/**
 * Returns a 'YYYY-MM-DD' string formatted in local timezone.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a 'YYYY-MM-DD' string as a Date at 00:00:00 in local timezone.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return getStartOfDay();
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return getStartOfDay(new Date(dateStr));
}

/**
 * Returns a 'YYYY-MM-DD' key for the given date in local timezone.
 */
export function getDayKey(date: Date = new Date()): string {
  return getLocalDateString(getStartOfDay(date));
}

export function calculateDailyStreak(
  dailyRepetitions: Record<string, number>,
  dailyGoal: number,
  today: Date = new Date()
): number {
  if (dailyGoal <= 0) return 0;

  const todayStart = getStartOfDay(today);
  const todayKey = getDayKey(todayStart);
  const todayCount = dailyRepetitions[todayKey] || 0;
  const todayMet = todayCount >= dailyGoal;

  let streak = todayMet ? 1 : 0;
  const checkDate = new Date(todayStart);

  // Check backwards from yesterday
  while (true) {
    checkDate.setDate(checkDate.getDate() - 1);
    const key = getDayKey(checkDate);
    const count = dailyRepetitions[key] || 0;
    if (count >= dailyGoal) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export interface DailyGoalProgress {
  todayCompleted: number;
  dailyGoal: number;
  dailyRemaining: number;
  isGoalMet: boolean;
  progressPct: number;
}

export function getDailyGoalProgress(
  todayCompleted: number,
  dailyGoal: number
): DailyGoalProgress {
  const safeGoal = Math.max(1, dailyGoal);
  const dailyRemaining = Math.max(0, safeGoal - todayCompleted);
  const isGoalMet = todayCompleted >= safeGoal;
  const progressPct = Math.min(100, (todayCompleted / safeGoal) * 100);

  return {
    todayCompleted,
    dailyGoal: safeGoal,
    dailyRemaining,
    isGoalMet,
    progressPct,
  };
}

/**
 * Returns the Monday (start of week) for a given date.
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = getStartOfDay(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Calculates how many times a scale was completed during the current week (Monday to Sunday).
 */
export function getScaleWeeklyCompletions(
  history: Record<string, number> | undefined,
  today: Date = new Date()
): number {
  if (!history) return 0;
  const startOfWeek = getStartOfWeek(today);
  let total = 0;

  const current = new Date(startOfWeek);
  for (let i = 0; i < 7; i++) {
    const key = getDayKey(current);
    total += history[key] || 0;
    current.setDate(current.getDate() + 1);
  }
  return total;
}

/**
 * Calculates elapsed days since cycle start date (inclusive, 1-indexed).
 */
export function getElapsedDays(cycleStartDate?: string, today: Date = new Date()): number {
  if (!cycleStartDate) return 1;
  const todayStart = getStartOfDay(today);
  const cycleStart = getStartOfDay(parseLocalDate(cycleStartDate));
  const diffMs = todayStart.getTime() - cycleStart.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

