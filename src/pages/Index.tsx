import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink, Music } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { CONTROL_BUTTON_SIZE, CONTROL_ICON_SIZE } from '@/lib/constants';
import { Progress } from '@/components/ui/progress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMetronome } from '@/hooks/useMetronome';
import { ScaleCard } from '@/components/ScaleCard';
import { ProgressTracker } from '@/components/ProgressTracker';
import { MetronomeIndicator } from '@/components/MetronomeIndicator';
import { Settings } from '@/components/Settings';
import { AboutModal } from '@/components/AboutModal';
import {
  PracticeSettings,
  PracticeState,
  ScaleProgress,
  PracticeStreakState,
  DEFAULT_SETTINGS,
} from '@/types/practice';
import { getNextFingerCombination } from '@/lib/fingerCombinations';
import {
  getDayKey,
  calculateDailyStreak,
  calculateCompletedDays,
  deriveDailyRepetitions,
  migrateLegacyBackup,
  getScaleWeeklyCompletions,
  getElapsedDays,
  getLocalDateString,
} from '@/lib/dateUtils';

// Shuffle array using Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates an order for the next round that avoids repeating recent scales from the end of the previous round.
 */
function generateNextRoundOrder(
  scaleCount: number,
  previousOrder: number[],
  bufferSize: number = 2
): number[] {
  if (scaleCount <= 1) {
    return [0];
  }

  const baseIndices = Array.from({ length: scaleCount }, (_, i) => i);
  let maxBuffer = Math.min(bufferSize, Math.floor(scaleCount / 2));

  while (maxBuffer > 0) {
    const recentTail = new Set(previousOrder.slice(-maxBuffer));

    for (let attempts = 0; attempts < 30; attempts++) {
      const candidate = shuffleArray(baseIndices);
      let valid = true;
      for (let i = 0; i < maxBuffer; i++) {
        if (recentTail.has(candidate[i])) {
          valid = false;
          break;
        }
      }
      if (valid) {
        return candidate;
      }
    }
    maxBuffer--;
  }

  return shuffleArray(baseIndices);
}

function initializePracticeState(settings: PracticeSettings): PracticeState {
  const scaleProgress: ScaleProgress[] = settings.scales.map((name) => ({
    name,
    successCount: 0,
    completed: false,
  }));

  const practiceOrder = shuffleArray(
    Array.from({ length: settings.scales.length }, (_, i) => i)
  );

  return {
    currentScaleIndex: 0,
    scaleProgress,
    practiceOrder,
    round: 1,
    cycleStartDate: getLocalDateString(),
  };
}

const ACCEPT_COOLDOWN_MS = 900;

const getInitialStreakState = (): PracticeStreakState => {
  try {
    const saved = localStorage.getItem('scale-practice-streak');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed === 'number') {
        return { streak: parsed };
      }
      if (parsed && typeof parsed.streak === 'number') {
        return parsed;
      }
    }

    const savedReps = localStorage.getItem('scale-practice-daily-repetitions');
    const savedSettings = localStorage.getItem('scale-practice-settings');
    const goal = savedSettings ? (JSON.parse(savedSettings).dailyGoal || 10) : 10;
    if (savedReps) {
      const reps = JSON.parse(savedReps) as Record<string, number>;
      const completed = calculateCompletedDays(reps, goal);
      return {
        streak: completed.count,
        lastCompletedDate: completed.lastCompletedDate,
      };
    }
  } catch (e) {
    console.error('Error initializing streak state:', e);
  }
  return { streak: 0 };
};

export default function Index() {
  const [rawSettings, setRawSettings] = useLocalStorage<PracticeSettings>(
    'scale-practice-settings',
    DEFAULT_SETTINGS
  );

  // Migrate old settings and ensure fingerPatterns and dailyGoal are properly initialized
  const settings = useMemo(() => {
    const migrated: PracticeSettings & {
      fingerCombinations?: unknown;
      repetitionsRequired?: unknown;
      weeklyGoalRepetitions?: unknown;
      cycleDays?: unknown;
    } = {
      ...rawSettings,
    };
    let needsUpdate = false;
    const validSubdivisions = [1, 2, 3, 4];

    // Remove legacy properties if they exist
    if ('fingerCombinations' in migrated) {
      delete migrated.fingerCombinations;
      needsUpdate = true;
    }
    if ('repetitionsRequired' in migrated) {
      delete migrated.repetitionsRequired;
      needsUpdate = true;
    }
    if ('weeklyGoalRepetitions' in migrated) {
      delete migrated.weeklyGoalRepetitions;
      needsUpdate = true;
    }

    if (!migrated.cycleDays || !Number.isFinite(migrated.cycleDays) || migrated.cycleDays < 1) {
      migrated.cycleDays = 7;
      needsUpdate = true;
    }

    if (!migrated.dailyGoal || !Number.isFinite(migrated.dailyGoal) || migrated.dailyGoal < 1) {
      migrated.dailyGoal = 10;
      needsUpdate = true;
    }

    if (migrated.useStreak === undefined) {
      migrated.useStreak = true;
      needsUpdate = true;
    }

    // Ensure fingerPatterns exists and is an array
    // Also clear old format patterns (like 'im', 'ma', 'am') - only keep new format
    const newFormatPatterns = ['i-m', 'm-i', 'm-a', 'a-m', 'i-a', 'a-i', 'a-m-i'];
    if (!migrated.fingerPatterns || !Array.isArray(migrated.fingerPatterns)) {
      migrated.fingerPatterns = [];
      needsUpdate = true;
    } else {
      // Filter out old format patterns (2 chars without hyphen) and keep only new format
      const filtered = migrated.fingerPatterns.filter((p: string) =>
        newFormatPatterns.includes(p)
      );
      if (filtered.length !== migrated.fingerPatterns.length) {
        migrated.fingerPatterns = filtered;
        needsUpdate = true;
      }
    }

    // Ensure metronome settings have all current fields and valid ranges
    if (!migrated.metronome) {
      migrated.metronome = { ...DEFAULT_SETTINGS.metronome };
      needsUpdate = true;
    } else {
      if (!Number.isFinite(migrated.metronome.bpm)) {
        migrated.metronome.bpm = DEFAULT_SETTINGS.metronome.bpm;
        needsUpdate = true;
      } else {
        const clampedBpm = Math.min(300, Math.max(30, migrated.metronome.bpm));
        if (clampedBpm !== migrated.metronome.bpm) {
          migrated.metronome.bpm = clampedBpm;
          needsUpdate = true;
        }
      }

      if (!validSubdivisions.includes(migrated.metronome.subdivision as 1 | 2 | 3 | 4)) {
        migrated.metronome.subdivision = 1;
        needsUpdate = true;
      }
    }

    // If migration was needed, update immediately
    if (needsUpdate) {
      setRawSettings(migrated);
    }

    return migrated;
  }, [rawSettings, setRawSettings]);

  const initialPracticeState = useMemo(
    () => initializePracticeState(settings),
    [settings]
  );
  const [practiceState, setPracticeState] = useLocalStorage<PracticeState>(
    'scale-practice-state',
    initialPracticeState
  );
  const [dailyRepetitions, setDailyRepetitions] = useLocalStorage<Record<string, number>>(
    'scale-practice-daily-repetitions',
    {}
  );
  const [dailyGoalCelebrations, setDailyGoalCelebrations] = useLocalStorage<Record<string, boolean>>(
    'scale-practice-daily-goal-celebrations',
    {}
  );
  const [streakState, setStreakState] = useLocalStorage<PracticeStreakState>(
    'scale-practice-streak',
    getInitialStreakState()
  );

  const { isPlaying, toggle } = useMetronome(settings.metronome);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'scales' | 'goals' | 'fingers'>('goals');
  const [isAcceptPending, setIsAcceptPending] = useState(false);

  // Track pending navigation to prevent race conditions
  const pendingNavigationRef = useRef<number | null>(null);
  const acceptInProgressRef = useRef(false);
  const acceptUnlockTimeoutRef = useRef<number | null>(null);
  const lastAcceptAtRef = useRef(0);

  // Track recently used finger patterns so we avoid too many duplicates per iteration
  const recentFingerPatternsRef = useRef<string[]>([]);
  const [chosenFingerPattern, setChosenFingerPattern] = useState<string | null>(null);

  // Track previous scales to detect actual changes
  const prevScalesRef = useRef<string[]>(settings.scales);

  // Sync practice state only when scales actually change
  useEffect(() => {
    const prevScales = prevScalesRef.current;
    const currentScales = settings.scales;

    // Check if scales actually changed
    const scalesChanged = prevScales.length !== currentScales.length ||
      !prevScales.every((s, i) => currentScales[i] === s);

    if (!scalesChanged) return;

    prevScalesRef.current = currentScales;

    setPracticeState((prev) => {
      const existingProgress = new Map(
        prev.scaleProgress.map((p) => [p.name, p])
      );

      const newScaleProgress = currentScales.map((name) => {
        const existing = existingProgress.get(name);
        return existing || { name, successCount: 0, completed: false };
      });

      const newPracticeOrder = shuffleArray(
        Array.from({ length: currentScales.length }, (_, i) => i)
      );

      return {
        ...prev,
        currentScaleIndex: 0,
        scaleProgress: newScaleProgress,
        practiceOrder: newPracticeOrder,
        round: prev.round || 1,
      };
    });
  }, [settings.scales, setPracticeState]);

  const currentOrderIndex = practiceState.practiceOrder[practiceState.currentScaleIndex] ?? practiceState.practiceOrder[0];
  const currentScale = practiceState.scaleProgress[currentOrderIndex];

  // Pick next finger combination when scale or patterns change; avoid recently used
  useEffect(() => {
    if (!currentScale?.name) {
      setChosenFingerPattern(null);
      return;
    }
    const patterns = settings.fingerPatterns;
    if (!patterns?.length) {
      setChosenFingerPattern(null);
      return;
    }
    const result = getNextFingerCombination(patterns, recentFingerPatternsRef.current);
    if (result) {
      setChosenFingerPattern(result.pattern);
      recentFingerPatternsRef.current = result.newRecent;
    } else {
      setChosenFingerPattern(null);
    }
  }, [currentScale?.name, settings.fingerPatterns]);

  const today = new Date();
  const todayDayKey = getDayKey(today);
  const todayCompleted = dailyRepetitions[todayDayKey] || 0;
  const dailyGoal = settings.dailyGoal || 10;
  const cycleDays = settings.cycleDays || 7;
  const elapsedDays = getElapsedDays(practiceState.cycleStartDate, today);
  const currentDayOfCycle = Math.min(cycleDays, elapsedDays);
  const streak = typeof streakState === 'number' ? streakState : (streakState?.streak || 0);
  const currentScaleWeeklyCompletions = useMemo(() => {
    const fromHist = getScaleWeeklyCompletions(currentScale?.history);
    return Math.max(fromHist, currentScale?.successCount || 0);
  }, [currentScale?.history, currentScale?.successCount]);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0D9488', '#F97316', '#22C55E'],
    });
  }, []);

  useEffect(() => {
    const celebrationKey = todayDayKey;
    const alreadyCelebrated = dailyGoalCelebrations[celebrationKey];
    const reachedDailyGoal = todayCompleted >= dailyGoal;

    if (!alreadyCelebrated && reachedDailyGoal) {
      fireConfetti();
      setDailyGoalCelebrations((prev) => ({
        ...prev,
        [celebrationKey]: true,
      }));
    }

    if (reachedDailyGoal) {
      setStreakState((prev) => {
        const currentStreak = typeof prev === 'number' ? prev : (prev?.streak || 0);
        const lastDate = typeof prev === 'object' ? prev?.lastCompletedDate : undefined;

        if (lastDate === todayDayKey) {
          return typeof prev === 'object' ? prev : { streak: currentStreak, lastCompletedDate: todayDayKey };
        }

        return {
          streak: currentStreak + 1,
          lastCompletedDate: todayDayKey,
        };
      });
    }
  }, [
    dailyGoal,
    dailyGoalCelebrations,
    fireConfetti,
    setDailyGoalCelebrations,
    setStreakState,
    todayCompleted,
    todayDayKey,
  ]);

  // Reconcile dailyRepetitions and scale history with practiceState (recovers completions on reload or after legacy import)
  useEffect(() => {
    const needsMigration = practiceState.scaleProgress.some(
      (s) => (s.successCount || 0) > 0 && (!s.history || Object.keys(s.history).length === 0)
    );

    if (needsMigration) {
      const migrated = migrateLegacyBackup(
        settings as PracticeSettings & Record<string, unknown>,
        practiceState as PracticeState & Record<string, unknown>,
        today,
        dailyRepetitions
      );
      setPracticeState(migrated.practiceState);
      setDailyRepetitions((prev) => ({
        ...migrated.dailyRepetitions,
        ...prev,
      }));
      return;
    }

    const derived = deriveDailyRepetitions(
      practiceState.scaleProgress,
      dailyRepetitions
    );
    const hasMissingData = Object.entries(derived).some(
      ([key, count]) => (dailyRepetitions[key] || 0) < count
    );
    if (hasMissingData) {
      setDailyRepetitions(derived);
    }
  }, [practiceState, dailyRepetitions, settings, setPracticeState, setDailyRepetitions, today]);

  // Recover completions if today was already celebrated (confetti fired) but repetitions count was wiped
  useEffect(() => {
    if (dailyGoalCelebrations[todayDayKey] && (dailyRepetitions[todayDayKey] || 0) < dailyGoal) {
      setDailyRepetitions((prev) => ({
        ...prev,
        [todayDayKey]: Math.max(prev[todayDayKey] || 0, dailyGoal),
      }));
    }
  }, [dailyGoal, dailyGoalCelebrations, dailyRepetitions, setDailyRepetitions, todayDayKey]);

  const moveToNextScale = useCallback(() => {
    setPracticeState((prev) => {
      const total = prev.practiceOrder.length;

      // Continue cycling through all scales once before reshuffling for the next round.
      const nextPos = prev.currentScaleIndex + 1;
      if (nextPos < total) {
        return { ...prev, currentScaleIndex: nextPos };
      }

      const newPracticeOrder = generateNextRoundOrder(total, prev.practiceOrder);
      toast({
        title: "Cycle Completed",
        description: "All scales have been played! Reshuffling for a new cycle.",
      });
      return {
        ...prev,
        practiceOrder: newPracticeOrder,
        currentScaleIndex: 0,
        round: (prev.round || 1) + 1,
      };
    });
  }, [setPracticeState]);

  const handleAccept = useCallback(() => {
    // Ignore repeated clicks while handling the current successful attempt.
    if (acceptInProgressRef.current) return;

    const now = Date.now();
    if (now - lastAcceptAtRef.current < ACCEPT_COOLDOWN_MS) return;

    acceptInProgressRef.current = true;
    setIsAcceptPending(true);

    let didAccept = false;

    setPracticeState((prev) => {
      const orderIndex = prev.practiceOrder[prev.currentScaleIndex];
      const newProgress = [...prev.scaleProgress];
      const scale = newProgress[orderIndex];

      if (!scale) return prev;

      didAccept = true;

      const newCount = scale.successCount + 1;
      const currentHistory = { ...(scale.history || {}) };
      currentHistory[todayDayKey] = (currentHistory[todayDayKey] || 0) + 1;

      newProgress[orderIndex] = {
        ...scale,
        successCount: newCount,
        completed: true,
        history: currentHistory,
      };

      return { ...prev, scaleProgress: newProgress };
    });

    if (!didAccept) {
      acceptInProgressRef.current = false;
      setIsAcceptPending(false);
      return;
    }

    setDailyRepetitions((prev) => ({
      ...prev,
      [todayDayKey]: (prev[todayDayKey] || 0) + 1,
    }));

    lastAcceptAtRef.current = Date.now();

    // Move to next after a brief delay
    pendingNavigationRef.current = window.setTimeout(() => {
      moveToNextScale();
      pendingNavigationRef.current = null;

      const elapsed = Date.now() - lastAcceptAtRef.current;
      const remainingLock = Math.max(0, ACCEPT_COOLDOWN_MS - elapsed);

      if (acceptUnlockTimeoutRef.current !== null) {
        clearTimeout(acceptUnlockTimeoutRef.current);
      }

      acceptUnlockTimeoutRef.current = window.setTimeout(() => {
        acceptInProgressRef.current = false;
        setIsAcceptPending(false);
        acceptUnlockTimeoutRef.current = null;
      }, remainingLock);
    }, 500);
  }, [moveToNextScale, setDailyRepetitions, setPracticeState, todayDayKey]);

  const handleDecline = useCallback(() => {
    moveToNextScale();
  }, [moveToNextScale]);

  const handleResetStreak = useCallback(() => {
    setStreakState({
      streak: 0,
      lastCompletedDate: todayCompleted >= dailyGoal ? todayDayKey : undefined,
    });
    toast({
      title: "Streak Reset",
      description: "Your practice streak has been reset to 0.",
    });
  }, [dailyGoal, setStreakState, todayCompleted, todayDayKey]);

  const handleReset = useCallback(() => {
    recentFingerPatternsRef.current = [];
    setPracticeState(initializePracticeState(settings));
    setDailyRepetitions({});
    setDailyGoalCelebrations({});
    setStreakState({ streak: 0 });
  }, [settings, setDailyGoalCelebrations, setDailyRepetitions, setPracticeState, setStreakState]);

  const handleStartNewCycle = useCallback(
    (newCycleDays: number) => {
      recentFingerPatternsRef.current = [];
      setRawSettings((prev) => ({ ...prev, cycleDays: newCycleDays }));
      setPracticeState((prev) => ({
        ...prev,
        cycleStartDate: getLocalDateString(),
        round: 1,
        currentScaleIndex: 0,
        practiceOrder: shuffleArray(
          Array.from({ length: settings.scales.length }, (_, i) => i)
        ),
      }));
      toast({
        title: "New Cycle Started",
        description: `Started a fresh ${newCycleDays}-day practice cycle.`,
      });
    },
    [settings.scales.length, setPracticeState, setRawSettings]
  );

  const handleSettingsChange = useCallback(
    (newSettings: PracticeSettings) => {
      setRawSettings(newSettings);
    },
    [setRawSettings]
  );

  const handleImport = useCallback(
    (
      importedSettings: PracticeSettings,
      importedState: PracticeState,
      importedDailyRepetitions?: Record<string, number>,
      rawStreak?: number
    ) => {
      // Migrate legacy backup format from deployed versions if needed
      const migrated = migrateLegacyBackup(
        importedSettings as PracticeSettings & Record<string, unknown>,
        importedState as PracticeState & Record<string, unknown>,
        today,
        importedDailyRepetitions || dailyRepetitions
      );

      prevScalesRef.current = migrated.settings.scales;
      setRawSettings(migrated.settings);
      setPracticeState(migrated.practiceState);

      const restoredDailyRepetitions = deriveDailyRepetitions(
        migrated.practiceState.scaleProgress,
        importedDailyRepetitions || migrated.dailyRepetitions
      );

      if (typeof rawStreak === 'number' && rawStreak >= 0) {
        const goal = migrated.settings.dailyGoal || 10;
        const todayCount = (restoredDailyRepetitions || {})[todayDayKey] || 0;
        setStreakState({
          streak: rawStreak,
          lastCompletedDate: todayCount >= goal ? todayDayKey : undefined,
        });
      } else {
        const goal = migrated.settings.dailyGoal || 10;
        const completed = calculateCompletedDays(restoredDailyRepetitions, goal);
        setStreakState({
          streak: completed.count,
          lastCompletedDate: completed.lastCompletedDate,
        });
      }

      setDailyRepetitions(restoredDailyRepetitions);

      // Restore celebrations for completed days
      const celebrations: Record<string, boolean> = {};
      const goal = migrated.settings.dailyGoal || 10;
      for (const [dayKey, count] of Object.entries(restoredDailyRepetitions)) {
        if (count >= goal) {
          celebrations[dayKey] = true;
        }
      }
      setDailyGoalCelebrations(celebrations);
    },
    [setDailyGoalCelebrations, setDailyRepetitions, setRawSettings, setPracticeState, setStreakState, today, todayDayKey]
  );

  // Cleanup pending navigation on unmount
  useEffect(() => {
    return () => {
      if (pendingNavigationRef.current !== null) {
        clearTimeout(pendingNavigationRef.current);
      }
      if (acceptUnlockTimeoutRef.current !== null) {
        clearTimeout(acceptUnlockTimeoutRef.current);
      }
    };
  }, []);

  // Spacebar to toggle metronome
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if spacebar is pressed
      if (e.code !== 'Space' || e.key !== ' ') return;

      // Don't trigger if user is typing in an input field
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement instanceof HTMLElement && activeElement.isContentEditable))
      ) {
        return;
      }

      // Only toggle if metronome is enabled
      if (settings.metronome.enabled) {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle, settings.metronome.enabled]);

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        {/* Main Container Box */}
        <div className="w-full max-w-5xl bg-card rounded-2xl border border-border material-shadow-xl relative">
          {/* Top Header Bar */}
          <header className="px-6 pt-6 pb-2 flex items-center justify-between">
            {/* Top Left Controls - Metronome */}
            <div className="flex items-center gap-2 bg-card rounded-2xl p-1 border border-border">
              <MetronomeIndicator
                settings={settings.metronome}
                isPlaying={isPlaying}
                onToggle={toggle}
                onSettingsChange={(updates) => {
                  setRawSettings({
                    ...settings,
                    metronome: { ...settings.metronome, ...updates },
                  });
                }}
              />
            </div>

            {/* Top Right Controls - About & Settings */}
            <div className="flex items-center gap-2 bg-card rounded-2xl p-1 border border-border">
              <Button
                variant="ghost"
                size="icon"
                aria-label="About Scaled and How to Use"
                onClick={() => setAboutOpen(true)}
                className={`${CONTROL_BUTTON_SIZE} rounded-xl hover:bg-muted p-0 flex items-center justify-center`}
              >
                <Info className={`${CONTROL_ICON_SIZE} text-foreground`} />
              </Button>
              <Settings
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onReset={handleReset}
                onResetStreak={handleResetStreak}
                onStartNewCycle={handleStartNewCycle}
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                practiceState={practiceState}
                dailyRepetitions={dailyRepetitions}
                streak={streak}
                onImport={handleImport}
                initialTab={settingsInitialTab}
                onGearClick={() => setSettingsInitialTab('goals')}
                onOpenAbout={() => setAboutOpen(true)}
              />
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 md:p-8 pt-4">
            <div className="grid lg:grid-cols-[1fr,320px] gap-6 lg:gap-8 items-start">
              {/* Center Section - Current Scale */}
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                {/* Title */}
                <div className="text-center space-y-2 animate-slide-up">
                  <h1 className="text-3xl font-bold text-foreground">Scaled</h1>
                  <div className="w-64 mx-auto space-y-2 mt-2">
                    <Progress
                      value={dailyGoal > 0 ? Math.min(100, (todayCompleted / dailyGoal) * 100) : 100}
                      className="h-1.5 bg-secondary"
                    />
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <span>
                        Day {currentDayOfCycle} of {cycleDays} · {todayCompleted} of {dailyGoal} daily scales completed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current Scale Card */}
                {currentScale ? (
                  <ScaleCard
                    scaleName={currentScale.name}
                    successCount={currentScale.successCount}
                    weeklyCompletions={currentScaleWeeklyCompletions}
                    currentRoundPosition={practiceState.currentScaleIndex + 1}
                    totalInRound={practiceState.practiceOrder.length}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    acceptDisabled={isAcceptPending}
                    fingerCombination={chosenFingerPattern}
                    fingerPatterns={settings.fingerPatterns}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-sm bg-muted/20 border border-border rounded-2xl animate-fade-in">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Music className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-foreground">No scales in practice list</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Add scales in Settings to set up your practice syllabus.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSettingsInitialTab('scales');
                        setSettingsOpen(true);
                      }}
                      className="text-xs"
                    >
                      Add Scales
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar - Progress Tracker */}
              <aside className="lg:sticky lg:top-24 bg-muted/50 rounded-2xl p-6">
                <ProgressTracker
                  scaleProgress={practiceState.scaleProgress}
                  dailyGoal={dailyGoal}
                  todayCompleted={todayCompleted}
                  currentScale={currentScale?.name || ''}
                  currentScaleIndex={practiceState.currentScaleIndex}
                  practiceOrder={practiceState.practiceOrder}
                  round={practiceState.round || 1}
                  streak={streak}
                  useStreak={settings.useStreak !== false}
                  onOpenSettings={() => {
                    setSettingsInitialTab('scales');
                    setSettingsOpen(true);
                  }}
                />
              </aside>
            </div>
          </main>
        </div>
      </div>

      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      <footer className="pt-4 pb-2 text-xs text-muted-foreground flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer text-muted-foreground"
        >
          <Info className="w-3.5 h-3.5" />
          <span>About Scaled</span>
        </button>
        <span className="text-border" aria-hidden="true">•</span>
        <a
          href="https://practice-lab.net/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors text-muted-foreground"
        >
          <span>Practice Lab Suite</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      </footer>
    </div>
  );
}
