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
}

export interface PracticeSettings {
  scales: string[];
  repetitionsRequired: number;
  metronome: MetronomeSettings;
  fingerPatterns: string[]; // array of finger patterns to use for all scales
}

export interface PracticeState {
  currentScaleIndex: number;
  scaleProgress: ScaleProgress[];
  practiceOrder: number[];
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
  metronome: {
    enabled: true,
    bpm: 80,
    volume: 70,
    tone: 'medium',
  },
  fingerPatterns: [],
};
