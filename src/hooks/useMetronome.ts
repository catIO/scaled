import { useState, useRef, useCallback, useEffect } from 'react';

interface MetronomeSettings {
  bpm: number;
  volume: number;
  tone: 'low' | 'medium' | 'high';
  enabled: boolean;
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
  const gainNodeRef = useRef<GainNode | null>(null);

  const playClick = useCallback(() => {
    if (!audioContextRef.current || !settings.enabled) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = TONE_FREQUENCIES[settings.tone];
    oscillator.type = 'sine';

    const now = audioContextRef.current.currentTime;
    gainNode.gain.setValueAtTime(settings.volume / 100, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }, [settings.enabled, settings.tone, settings.volume]);

  const start = useCallback(() => {
    if (!settings.enabled) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const intervalMs = (60 / settings.bpm) * 1000;
    
    playClick();
    intervalRef.current = window.setInterval(playClick, intervalMs);
    setIsPlaying(true);
  }, [settings.bpm, settings.enabled, playClick]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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
  }, [settings.bpm, settings.enabled, settings.tone, settings.volume, isPlaying, start, stop]);

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
