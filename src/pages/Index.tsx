import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMetronome } from '@/hooks/useMetronome';
import { ScaleCard } from '@/components/ScaleCard';
import { ProgressTracker } from '@/components/ProgressTracker';
import { MetronomeIndicator } from '@/components/MetronomeIndicator';
import { Settings } from '@/components/Settings';
import {
  PracticeSettings,
  PracticeState,
  ScaleProgress,
  DEFAULT_SETTINGS,
} from '@/types/practice';
import { getNextFingerCombination } from '@/lib/fingerCombinations';

const WEEKDAY_TO_INDEX: Record<PracticeSettings['weekStartsOn'], number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function getStartOfDay(date: Date): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function getWeekStartDate(date: Date, weekStartsOn: PracticeSettings['weekStartsOn']): Date {
  const today = getStartOfDay(date);
  const currentDay = today.getDay();
  const weekStart = WEEKDAY_TO_INDEX[weekStartsOn];
  const diff = (currentDay - weekStart + 7) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - diff);
  return start;
}

function getWeekKey(date: Date, weekStartsOn: PracticeSettings['weekStartsOn']): string {
  const weekStart = getWeekStartDate(date, weekStartsOn);
  return weekStart.toISOString().split('T')[0];
}

function getDayKey(date: Date): string {
  return getStartOfDay(date).toISOString().split('T')[0];
}

// Shuffle array using Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
  };
}

const ACCEPT_COOLDOWN_MS = 900;

export default function Index() {
  const [rawSettings, setRawSettings] = useLocalStorage<PracticeSettings>(
    'scale-practice-settings',
    DEFAULT_SETTINGS
  );

  // Migrate old settings and ensure fingerPatterns is properly initialized
  const settings = useMemo(() => {
    const migrated: PracticeSettings & { fingerCombinations?: unknown } = {
      ...rawSettings,
    };
    let needsUpdate = false;
    const validSubdivisions = [1, 2, 3, 4];

    // Remove old fingerCombinations property if it exists
    if ('fingerCombinations' in migrated) {
      delete migrated.fingerCombinations;
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

    // Ensure weekly goal fields exist and remain in valid bounds
    if (!Number.isFinite(migrated.weeklyGoalRepetitions) || migrated.weeklyGoalRepetitions < 1) {
      migrated.weeklyGoalRepetitions = Math.max(1, migrated.scales.length * migrated.repetitionsRequired);
      needsUpdate = true;
    } else {
      const clampedWeeklyGoal = Math.max(1, Math.floor(migrated.weeklyGoalRepetitions));
      if (clampedWeeklyGoal !== migrated.weeklyGoalRepetitions) {
        migrated.weeklyGoalRepetitions = clampedWeeklyGoal;
        needsUpdate = true;
      }
    }

    const validWeekStartsOn: PracticeSettings['weekStartsOn'][] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    if (!validWeekStartsOn.includes(migrated.weekStartsOn)) {
      migrated.weekStartsOn = 'monday';
      needsUpdate = true;
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

  const { isPlaying, toggle } = useMetronome(settings.metronome);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'scales' | 'goals' | 'fingers'>('scales');
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
        currentScaleIndex: 0,
        scaleProgress: newScaleProgress,
        practiceOrder: newPracticeOrder,
      };
    });
  }, [settings.scales, setPracticeState]);

  const currentOrderIndex = practiceState.practiceOrder[practiceState.currentScaleIndex];
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

  const weeklyCompletedRepetitions = useMemo(
    () => practiceState.scaleProgress.reduce((acc, s) => acc + s.successCount, 0),
    [practiceState.scaleProgress]
  );

  const weeklyGoalRepetitions = Math.max(
    1,
    settings.scales.length * settings.repetitionsRequired
  );
  const dailyTargetRepetitions = weeklyGoalRepetitions / 7;
  const today = new Date();
  const todayDayKey = getDayKey(today);
  const thisWeekKey = getWeekKey(today, settings.weekStartsOn);
  const todayCompletedRepetitions = dailyRepetitions[todayDayKey] || 0;
  const dailyRemainingRepetitions = Math.max(0, dailyTargetRepetitions - todayCompletedRepetitions);
  const dailyTargetDisplay = Math.max(1, Math.ceil(dailyTargetRepetitions));
  const todayPaceProgressDisplay = Math.min(todayCompletedRepetitions, dailyTargetDisplay);
  const isOnDailyPace = todayCompletedRepetitions >= dailyTargetRepetitions;

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0D9488', '#F97316', '#22C55E'],
    });
  }, []);

  useEffect(() => {
    const celebrationKey = `${thisWeekKey}:${todayDayKey}`;
    const alreadyCelebrated = dailyGoalCelebrations[celebrationKey];
    const reachedDailyPace = todayCompletedRepetitions >= dailyTargetRepetitions;

    if (!alreadyCelebrated && reachedDailyPace) {
      fireConfetti();
      setDailyGoalCelebrations((prev) => ({
        ...prev,
        [celebrationKey]: true,
      }));
    }
  }, [
    dailyTargetRepetitions,
    dailyGoalCelebrations,
    fireConfetti,
    setDailyGoalCelebrations,
    thisWeekKey,
    todayDayKey,
    todayCompletedRepetitions,
  ]);

  const moveToNextScale = useCallback(() => {
    setPracticeState((prev) => {
      const total = prev.practiceOrder.length;

      // Continue cycling through all scales, reshuffling each round.
      const nextPos = prev.currentScaleIndex + 1;
      if (nextPos < total) {
        return { ...prev, currentScaleIndex: nextPos };
      }

      const newPracticeOrder = shuffleArray(
        Array.from({ length: total }, (_, i) => i)
      );
      return {
        ...prev,
        practiceOrder: newPracticeOrder,
        currentScaleIndex: 0,
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
      const isNowCompleted = newCount >= settings.repetitionsRequired;

      newProgress[orderIndex] = {
        ...scale,
        successCount: newCount,
        completed: isNowCompleted,
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
  }, [settings.repetitionsRequired, moveToNextScale, setDailyRepetitions, setPracticeState, todayDayKey]);

  const handleDecline = useCallback(() => {
    moveToNextScale();
  }, [moveToNextScale]);

  const handleReset = useCallback(() => {
    recentFingerPatternsRef.current = [];
    setPracticeState(initializePracticeState(settings));
    setDailyRepetitions({});
    setDailyGoalCelebrations({});
  }, [settings, setDailyGoalCelebrations, setDailyRepetitions, setPracticeState]);

  const handleSettingsChange = useCallback(
    (newSettings: PracticeSettings) => {
      setRawSettings(newSettings);
    },
    [setRawSettings]
  );

  const handleImport = useCallback(
    (importedSettings: PracticeSettings, importedState: PracticeState) => {
      prevScalesRef.current = importedSettings.scales;
      setRawSettings(importedSettings);
      setPracticeState(importedState);
      setDailyRepetitions({});
      setDailyGoalCelebrations({});
    },
    [setDailyGoalCelebrations, setDailyRepetitions, setRawSettings, setPracticeState]
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
        <div className="w-full max-w-6xl bg-card rounded-2xl border border-border material-shadow-xl relative">
          {/* Top Left Controls */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-card rounded-2xl p-1 border border-border z-10">
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
            <Settings
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onReset={handleReset}
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
              practiceState={practiceState}
              onImport={handleImport}
              initialTab={settingsInitialTab}
            />
          </div>

          {/* Main Content */}
          <main className="p-8 pt-20">
            <div className="grid lg:grid-cols-[1fr,320px] gap-8 items-start">
              {/* Center Section - Current Scale */}
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                {/* Title */}
                <div className="text-center space-y-2 animate-slide-up">
                  <h1 className="text-3xl font-bold text-foreground">Scaled</h1>
                  <div className="w-64 mx-auto space-y-2 mt-2">
                    <Progress
                      value={(weeklyCompletedRepetitions / weeklyGoalRepetitions) * 100}
                      className="h-1.5 bg-secondary"
                    />
                    <p className="text-xs text-muted-foreground">
                      {todayPaceProgressDisplay} or {dailyTargetDisplay} completed scales towards today's target
                    </p>
                  </div>
                </div>

                {/* Current Scale Card */}
                {currentScale ? (
                  <ScaleCard
                    scaleName={currentScale.name}
                    successCount={currentScale.successCount}
                    repetitionsRequired={settings.repetitionsRequired}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    isCompleted={false}
                    acceptDisabled={isAcceptPending}
                    fingerCombination={chosenFingerPattern}
                    fingerPatterns={settings.fingerPatterns}
                  />
                ) : null}
              </div>

              {/* Sidebar - Progress Tracker */}
              <aside className="lg:sticky lg:top-24 bg-muted/50 rounded-2xl p-6">
                <ProgressTracker
                  scaleProgress={practiceState.scaleProgress}
                  repetitionsRequired={settings.repetitionsRequired}
                  weeklyGoalRepetitions={weeklyGoalRepetitions}
                  weeklyCompletedRepetitions={weeklyCompletedRepetitions}
                  dailyTargetRepetitions={dailyTargetRepetitions}
                  dailyRemainingRepetitions={dailyRemainingRepetitions}
                  currentScale={currentScale?.name || ''}
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

      <footer className="pt-4 text-xs text-muted-foreground flex items-center justify-center gap-6">
        <Link to="/about" className="text-primary underline hover:text-primary/90">
          About + How to Use
        </Link>
        <a
          href="https://practice-mate.app/"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline hover:text-primary/90"
        >
          More Apps
        </a>
      </footer>
    </div>
  );
}
