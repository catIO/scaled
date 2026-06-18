import { useState, useRef, useCallback, useEffect } from 'react';

interface MetronomeSettings {
  bpm: number;
  volume: number;
  tone: 'low' | 'medium' | 'high';
  enabled: boolean;
  subdivision: 1 | 2 | 3 | 4;
}

const TONE_FREQUENCIES: Record<string, number> = {
  low: 220,
  medium: 440,
  high: 880,
};

export function useMetronome(settings: MetronomeSettings) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const tickCountRef = useRef(0);

  const playClick = useCallback((isMainBeat = true) => {
    if (!audioContextRef.current || !settings.enabled) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    // Main beats: full accent; subdivisions: lighter tick at same pitch
    oscillator.frequency.value = TONE_FREQUENCIES[settings.tone];
    oscillator.type = 'sine';

    const now = audioContextRef.current.currentTime;
    const effectiveVolume = isMainBeat ? settings.volume : settings.volume * 0.35;
    const decayTime = isMainBeat ? 0.08 : 0.04;
    gainNode.gain.setValueAtTime(effectiveVolume / 100, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

    oscillator.start(now);
    oscillator.stop(now + decayTime);
  }, [settings.enabled, settings.tone, settings.volume]);

  const start = useCallback(() => {
    if (!settings.enabled) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const intervalMs = (60 / settings.bpm / settings.subdivision) * 1000;

    tickCountRef.current = 0;
    playClick(true);
    intervalRef.current = window.setInterval(() => {
      tickCountRef.current += 1;
      const isMainBeat = tickCountRef.current % settings.subdivision === 0;
      playClick(isMainBeat);
    }, intervalMs);
    setIsPlaying(true);
  }, [settings.bpm, settings.enabled, settings.subdivision, playClick]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    tickCountRef.current = 0;
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  // Restart metronome when settings change while playing
  useEffect(() => {
    if (isPlaying && settings.enabled) {
      stop();
      start();
    } else if (!settings.enabled && isPlaying) {
      stop();
    }
  }, [settings.bpm, settings.enabled, settings.tone, settings.volume, settings.subdivision, isPlaying, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { isPlaying, start, stop, toggle };
}
