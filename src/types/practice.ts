export interface ScaleProgress {
  name: string;
  successCount: number;
  completed: boolean;
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
}

export const DEFAULT_SCALES = [
  'C Major',
];

export const DEFAULT_SETTINGS: PracticeSettings = {
  scales: DEFAULT_SCALES,
  dailyGoal: 10,
  cycleDays: 7,
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
