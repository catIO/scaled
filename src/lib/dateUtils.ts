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

export function getElapsedDays(cycleStartDate?: string, today: Date = new Date()): number {
  if (!cycleStartDate) return 1;
  const todayStart = getStartOfDay(today);
  const cycleStart = getStartOfDay(parseLocalDate(cycleStartDate));
  const diffMs = todayStart.getTime() - cycleStart.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

export interface DailyGoalCalculation {
  elapsedDays: number;
  currentDayOfCycle: number;
  remainingDaysInCycle: number;
  daysRemainingAfterToday: number;
  isOverdue: boolean;
  daysLeftText: string;
  completedBeforeToday: number;
  remainingGoalForCycle: number;
  dailyTargetRepetitions: number;
  dailyRemainingRepetitions: number;
  dailyTargetDisplay: number;
  todayPaceProgressDisplay: number;
  isOnDailyPace: boolean;
}

/**
 * Calculates the daily goal dynamically based on remaining repetitions for the cycle
 * divided by the remaining days in the cycle (including today).
 */
export function calculateDailyGoal({
  weeklyGoalRepetitions,
  weeklyCompletedRepetitions,
  todayCompletedRepetitions,
  cycleDays,
  currentDayOfCycle: explicitCurrentDay,
  cycleStartDate,
  today = new Date(),
}: {
  weeklyGoalRepetitions: number;
  weeklyCompletedRepetitions: number;
  todayCompletedRepetitions: number;
  cycleDays: number;
  currentDayOfCycle?: number;
  cycleStartDate?: string;
  today?: Date;
}): DailyGoalCalculation {
  const safeCycleDays = Math.max(1, cycleDays || 7);
  const elapsedDays = explicitCurrentDay ?? getElapsedDays(cycleStartDate, today);
  const currentDayOfCycle = Math.min(safeCycleDays, elapsedDays);
  const isOverdue = elapsedDays > safeCycleDays;
  const daysRemainingAfterToday = Math.max(0, safeCycleDays - elapsedDays);
  const remainingDaysInCycle = Math.max(1, safeCycleDays - elapsedDays + 1);

  const daysLeftText = isOverdue
    ? 'cycle ended'
    : daysRemainingAfterToday === 0
    ? 'last day'
    : `${daysRemainingAfterToday} ${daysRemainingAfterToday === 1 ? 'day' : 'days'} left`;

  const completedBeforeToday = Math.max(0, weeklyCompletedRepetitions - todayCompletedRepetitions);
  const remainingGoalForCycle = Math.max(0, weeklyGoalRepetitions - completedBeforeToday);

  const dailyTargetRepetitions = remainingGoalForCycle / remainingDaysInCycle;
  const dailyTargetDisplay = Math.ceil(dailyTargetRepetitions);

  const dailyRemainingRepetitions = Math.max(0, dailyTargetDisplay - todayCompletedRepetitions);
  const todayPaceProgressDisplay = Math.min(todayCompletedRepetitions, dailyTargetDisplay);
  const isOnDailyPace = todayCompletedRepetitions >= dailyTargetRepetitions;

  return {
    elapsedDays,
    currentDayOfCycle,
    remainingDaysInCycle,
    daysRemainingAfterToday,
    isOverdue,
    daysLeftText,
    completedBeforeToday,
    remainingGoalForCycle,
    dailyTargetRepetitions,
    dailyRemainingRepetitions,
    dailyTargetDisplay,
    todayPaceProgressDisplay,
    isOnDailyPace,
  };
}

