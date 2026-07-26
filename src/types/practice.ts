export interface ScaleProgress {
  name: string;
  successCount: number;
  completed: boolean;
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
  repetitionsRequired: number;
  weeklyGoalRepetitions: number;
  cycleDays: number;
  metronome: MetronomeSettings;
  fingerPatterns: string[]; // array of finger patterns to use for all scales
}

export interface PracticeState {
  currentScaleIndex: number;
  scaleProgress: ScaleProgress[];
  practiceOrder: number[];
  cycleStartDate: string;
}

export const DEFAULT_SCALES = [
  'G',
  'E min Harmonic',
  'E min Melodic',
  'A min Harmonic',
  'A min Melodic',
];

export const DEFAULT_SETTINGS: PracticeSettings = {
  scales: DEFAULT_SCALES,
  repetitionsRequired: 3,
  weeklyGoalRepetitions: DEFAULT_SCALES.length * 3,
  cycleDays: 7,
  metronome: {
    enabled: true,
    bpm: 80,
    volume: 70,
    tone: 'medium',
    subdivision: 1,
  },
  fingerPatterns: [],
};
