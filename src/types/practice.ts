export interface ScaleProgress {
  name: string;
  successCount: number;
  completed: boolean;
  cycleCompletions?: number; // completions within the active practice cycle
  history?: Record<string, number>; // YYYY-MM-DD -> completion count
}

export interface MetronomeSettings {
  enabled: boolean;
  bpm: number;
  volume: number;
  tone: 'low' | 'medium' | 'high';
  subdivision: 1 | 2 | 3 | 4;
}

export interface PracticeSettings {
  scales: string[];
  dailyGoal: number; // Number of scales to practice every day
  cycleDays: number; // Duration of practice cycle in days (default: 7)
  targetPlays?: number; // Target completions per scale in cycle (default: 6)
  autoDailyGoal?: boolean; // Automatically divide scales across cycle days with buffer day
  metronome: MetronomeSettings;
  fingerPatterns: string[]; // Array of finger patterns to use for all scales
  useStreak?: boolean; // Whether to track and display practice streak (default: true)
}

export interface PracticeStreakState {
  streak: number;
  lastCompletedDate?: string;
}

export interface PracticeState {
  currentScaleIndex: number;
  scaleProgress: ScaleProgress[];
  practiceOrder: number[];
  round: number;
  cycleStartDate?: string;
  reviewPool?: string[]; // Scales queued for review on the cycle buffer day
  todayRetries?: string[]; // Scale names already retried once today
  todayRetriesDate?: string; // Date key corresponding to todayRetries
  currentReviewIndex?: number; // Pointer within reviewPool during buffer day review
  bonusRound?: boolean; // Free play mode on buffer day when review pool is cleared
}

export const DEFAULT_SCALES = [
  'C Major',
];

export const DEFAULT_SETTINGS: PracticeSettings = {
  scales: DEFAULT_SCALES,
  dailyGoal: 15,
  cycleDays: 7,
  targetPlays: 6,
  autoDailyGoal: false,
  metronome: {
    enabled: true,
    bpm: 80,
    volume: 70,
    tone: 'medium',
    subdivision: 1,
  },
  fingerPatterns: [],
  useStreak: true,
};
