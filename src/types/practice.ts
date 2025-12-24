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
}

export interface PracticeState {
  currentScaleIndex: number;
  scaleProgress: ScaleProgress[];
  practiceOrder: number[];
}

export const DEFAULT_SCALES = [
  'C Major',
  'G Major', 
  'D Major',
  'A Major',
  'E Major',
  'B Major',
  'F Major',
  'Bb Major',
  'Eb Major',
  'Ab Major',
  'A Minor',
  'E Minor',
  'D Minor',
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
};
