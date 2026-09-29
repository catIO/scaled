import { DEFAULT_SETTINGS, type PracticeSettings, type PracticeState, type ScaleProgress } from '@/types/practice';

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

/**
 * Calculates completed days where the daily goal was met.
 * Streaks do not reset automatically on missed days.
 */
export function calculateCompletedDays(
  dailyRepetitions: Record<string, number>,
  dailyGoal: number,
  celebrations?: Record<string, boolean>
): { count: number; lastCompletedDate?: string } {
  if (dailyGoal <= 0) return { count: 0 };
  const completedDateKeys = new Set<string>();

  if (dailyRepetitions && typeof dailyRepetitions === 'object') {
    for (const [dayKey, count] of Object.entries(dailyRepetitions)) {
      if (Number(count) >= dailyGoal) {
        completedDateKeys.add(dayKey);
      }
    }
  }

  if (celebrations && typeof celebrations === 'object') {
    for (const [dayKey, celebrated] of Object.entries(celebrations)) {
      if (celebrated) {
        completedDateKeys.add(dayKey);
      }
    }
  }

  const sortedDates = Array.from(completedDateKeys).sort();
  const lastCompletedDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : undefined;

  return {
    count: sortedDates.length,
    lastCompletedDate,
  };
}

/**
 * Calculates the practice streak without automatic reset.
 * Each day the daily goal is met adds to the streak.
 */
export function calculateDailyStreak(
  dailyRepetitions: Record<string, number>,
  dailyGoal: number,
  _today: Date = new Date()
): number {
  if (dailyGoal <= 0) return 0;
  return calculateCompletedDays(dailyRepetitions, dailyGoal).count;
}

/**
 * Reconstructs or updates dailyRepetitions by aggregating per-scale completion histories
 * and merging with any explicitly provided dailyRepetitions (ensuring no counts are lost or double-counted).
 */
export function deriveDailyRepetitions(
  scaleProgress?: ScaleProgress[],
  existingDailyReps?: Record<string, number>
): Record<string, number> {
  const fromHistory: Record<string, number> = {};
  if (scaleProgress && Array.isArray(scaleProgress)) {
    for (const scale of scaleProgress) {
      if (scale.history && typeof scale.history === 'object') {
        for (const [dayKey, count] of Object.entries(scale.history)) {
          const num = Number(count);
          if (Number.isFinite(num) && num > 0) {
            fromHistory[dayKey] = (fromHistory[dayKey] || 0) + num;
          }
        }
      }
    }
  }

  const result: Record<string, number> = {};
  if (existingDailyReps && typeof existingDailyReps === 'object') {
    for (const [dayKey, count] of Object.entries(existingDailyReps)) {
      const num = Number(count);
      if (Number.isFinite(num) && num > 0) {
        result[dayKey] = num;
      }
    }
  }

  for (const [dayKey, count] of Object.entries(fromHistory)) {
    result[dayKey] = Math.max(result[dayKey] || 0, count);
  }
  return result;
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
 * Calculates how many times a scale was completed during the active practice cycle.
 */
export function getScaleCycleCompletions(
  history: Record<string, number> | undefined,
  cycleStartDate?: string,
  cycleDays: number = 7,
  today: Date = new Date()
): number {
  if (!history || !cycleStartDate) return 0;

  const cycleStart = getStartOfDay(parseLocalDate(cycleStartDate));
  const todayStart = getStartOfDay(today);
  if (todayStart.getTime() < cycleStart.getTime()) return 0;

  const safeCycleDays = Math.max(1, cycleDays || 7);
  const cycleEnd = new Date(cycleStart);
  cycleEnd.setDate(cycleEnd.getDate() + safeCycleDays - 1);

  const effectiveEnd = todayStart.getTime() < cycleEnd.getTime() ? todayStart : cycleEnd;

  let total = 0;
  const current = new Date(cycleStart);
  while (current.getTime() <= effectiveEnd.getTime()) {
    const key = getDayKey(current);
    total += history[key] || 0;
    current.setDate(current.getDate() + 1);
  }
  return total;
}

/**
 * Returns the effective start date of the current cycle, automatically advancing
 * to a fresh cycle if elapsed days exceed cycle duration.
 */
export function getCurrentCycleStartDate(
  cycleStartDate?: string,
  cycleDays: number = 7,
  today: Date = new Date()
): string {
  if (!cycleStartDate) return getLocalDateString(today);

  const safeCycleDays = Math.max(1, cycleDays || 7);
  const elapsedDays = getElapsedDays(cycleStartDate, today);
  if (elapsedDays <= safeCycleDays) {
    return cycleStartDate;
  }

  // Advance by full cycle intervals
  const cyclesElapsed = Math.floor((elapsedDays - 1) / safeCycleDays);
  const cycleStart = parseLocalDate(cycleStartDate);
  cycleStart.setDate(cycleStart.getDate() + cyclesElapsed * safeCycleDays);
  return getLocalDateString(cycleStart);
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

/**
 * Migrates legacy backups (from older deployed versions that tracked successCount without history or dailyRepetitions)
 * so that practice streak, day of cycle, scale completion status, and history are faithfully restored.
 */
export function migrateLegacyBackup(
  importedSettings: PracticeSettings & Record<string, unknown>,
  importedState: PracticeState & Record<string, unknown>,
  today: Date = new Date(),
  existingDailyReps?: Record<string, number>
): {
  settings: PracticeSettings;
  practiceState: PracticeState;
  dailyRepetitions: Record<string, number>;
} {
  const rawDailyGoal = Number(importedSettings.dailyGoal);
  const repReq = Number(importedSettings.repetitionsRequired) || 3;
  const cycleDays = Number(importedSettings.cycleDays) || 7;
  const scaleCount = Array.isArray(importedSettings.scales) ? importedSettings.scales.length : 10;
  const inferredDailyGoal = Math.max(1, Math.round((scaleCount * repReq) / cycleDays));
  const dailyGoal = Number.isFinite(rawDailyGoal) && rawDailyGoal > 0 ? rawDailyGoal : inferredDailyGoal;

  const settings: PracticeSettings = {
    ...DEFAULT_SETTINGS,
    ...importedSettings,
    dailyGoal,
    cycleDays,
    metronome: importedSettings.metronome || DEFAULT_SETTINGS.metronome,
    fingerPatterns: importedSettings.fingerPatterns || [],
  };

  const round = typeof importedState.round === 'number' && importedState.round >= 1
    ? importedState.round
    : 1;

  const hasHistory = importedState.scaleProgress.some(
    (s) => s.history && Object.keys(s.history).length > 0
  );

  let cycleStartDate = importedState.cycleStartDate;
  const totalSuccess = importedState.scaleProgress.reduce(
    (sum, s) => sum + (s.successCount || 0),
    0
  );

  // If cycleStartDate is missing or defaults to today despite past completions, infer start date
  if (!cycleStartDate) {
    const completedDays = Math.max(1, Math.min(cycleDays, Math.round(totalSuccess / dailyGoal)));
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - completedDays);
    cycleStartDate = getLocalDateString(startDate);
  }

  const elapsedDays = getElapsedDays(cycleStartDate, today);
  const completedDaysCount = Math.max(1, Math.min(cycleDays, elapsedDays - 1));

  const completedDateKeys: string[] = [];
  for (let d = completedDaysCount; d >= 1; d--) {
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - d);
    completedDateKeys.push(getDayKey(pastDate));
  }

  const migratedProgress = importedState.scaleProgress.map((scale) => {
    if (scale.history && Object.keys(scale.history).length > 0) {
      return scale;
    }
    const count = scale.successCount || 0;
    const history: Record<string, number> = {};
    if (count > 0 && completedDateKeys.length > 0) {
      for (let i = 0; i < count; i++) {
        const dateKey = completedDateKeys[i % completedDateKeys.length];
        history[dateKey] = (history[dateKey] || 0) + 1;
      }
    }
    return {
      ...scale,
      history,
    };
  });

  const dailyRepetitions = deriveDailyRepetitions(migratedProgress, existingDailyReps);

  if (!hasHistory && totalSuccess > 0) {
    for (const key of completedDateKeys) {
      dailyRepetitions[key] = Math.max(dailyRepetitions[key] || 0, dailyGoal);
    }
  }

  const practiceState: PracticeState = {
    ...importedState,
    scaleProgress: migratedProgress,
    round,
    cycleStartDate,
  };

  return {
    settings,
    practiceState,
    dailyRepetitions,
  };
}


