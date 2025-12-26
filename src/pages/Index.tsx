import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { MdRefresh, MdEmojiEvents } from 'react-icons/md';
import { Button } from '@/components/ui/button';
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

export default function Index() {
  const [settings, setSettings] = useLocalStorage<PracticeSettings>(
    'scale-practice-settings',
    DEFAULT_SETTINGS
  );

  const initialPracticeState = useMemo(
    () => initializePracticeState(settings),
    [settings]
  );
  const [practiceState, setPracticeState] = useLocalStorage<PracticeState>(
    'scale-practice-state',
    initialPracticeState
  );

  const { isPlaying, toggle } = useMetronome(settings.metronome);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Track pending navigation to prevent race conditions
  const pendingNavigationRef = useRef<number | null>(null);

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

  const allCompleted = useMemo(
    () => practiceState.scaleProgress.every((s) => s.completed),
    [practiceState.scaleProgress]
  );

  const completedCount = useMemo(
    () => practiceState.scaleProgress.filter((s) => s.completed).length,
    [practiceState.scaleProgress]
  );

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0D9488', '#F97316', '#22C55E'],
    });
  }, []);

  const moveToNextScale = useCallback(() => {
    setPracticeState((prev) => {
      // Find next incomplete scale
      let nextIndex = (prev.currentScaleIndex + 1) % prev.practiceOrder.length;
      let attempts = 0;

      while (attempts < prev.practiceOrder.length) {
        const scaleIndex = prev.practiceOrder[nextIndex];
        if (!prev.scaleProgress[scaleIndex]?.completed) {
          break;
        }
        nextIndex = (nextIndex + 1) % prev.practiceOrder.length;
        attempts++;
      }

      return { ...prev, currentScaleIndex: nextIndex };
    });
  }, [setPracticeState]);

  const handleAccept = useCallback(() => {
    // Clear any pending navigation to prevent race conditions
    if (pendingNavigationRef.current !== null) {
      clearTimeout(pendingNavigationRef.current);
      pendingNavigationRef.current = null;
    }

    setPracticeState((prev) => {
      const orderIndex = prev.practiceOrder[prev.currentScaleIndex];
      const newProgress = [...prev.scaleProgress];
      const scale = newProgress[orderIndex];
      
      if (!scale || scale.completed) return prev;

      const newCount = scale.successCount + 1;
      const isNowCompleted = newCount >= settings.repetitionsRequired;

      newProgress[orderIndex] = {
        ...scale,
        successCount: newCount,
        completed: isNowCompleted,
      };

      if (isNowCompleted) {
        setTimeout(fireConfetti, 100);
      }

      return { ...prev, scaleProgress: newProgress };
    });

    // Move to next after a brief delay
    pendingNavigationRef.current = window.setTimeout(() => {
      moveToNextScale();
      pendingNavigationRef.current = null;
    }, 500);
  }, [settings.repetitionsRequired, fireConfetti, moveToNextScale, setPracticeState]);

  const handleDecline = useCallback(() => {
    moveToNextScale();
  }, [moveToNextScale]);

  const handleReset = useCallback(() => {
    setPracticeState(initializePracticeState(settings));
  }, [settings, setPracticeState]);

  const handleSettingsChange = useCallback(
    (newSettings: PracticeSettings) => {
      setSettings(newSettings);
    },
    [setSettings]
  );

  // Cleanup pending navigation on unmount
  useEffect(() => {
    return () => {
      if (pendingNavigationRef.current !== null) {
        clearTimeout(pendingNavigationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Main Container Box */}
      <div className="w-full max-w-6xl bg-card rounded-2xl border border-border material-shadow-xl relative">
        {/* Top Left Controls */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-card rounded-2xl p-1 border border-border z-10">
          <MetronomeIndicator
            settings={settings.metronome}
            isPlaying={isPlaying}
            onToggle={toggle}
          />
          <Settings
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onReset={handleReset}
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
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
                <p className="text-muted-foreground">
                  {completedCount} of {practiceState.scaleProgress.length} scales completed
                </p>
              </div>

              {/* Current Scale Card or Completion */}
              {allCompleted ? (
                <div className="text-center space-y-6 animate-scale-in">
                  <div className="w-24 h-24 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                    <MdEmojiEvents className="w-10 h-10 text-success" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-foreground">
                      Practice Complete!
                    </h2>
                    <p className="text-muted-foreground">
                      You've mastered all {practiceState.scaleProgress.length} scales
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleReset}
                    className="rounded-xl h-14 px-8"
                  >
                    <MdRefresh className="w-5 h-5 mr-2" />
                    Start New Session
                  </Button>
                </div>
              ) : currentScale ? (
                <ScaleCard
                  scaleName={currentScale.name}
                  successCount={currentScale.successCount}
                  repetitionsRequired={settings.repetitionsRequired}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  isCompleted={currentScale.completed}
                />
              ) : null}
            </div>

            {/* Sidebar - Progress Tracker */}
            <aside className="lg:sticky lg:top-24 bg-muted/50 rounded-2xl p-6">
              <ProgressTracker
                scaleProgress={practiceState.scaleProgress}
                repetitionsRequired={settings.repetitionsRequired}
                currentScale={currentScale?.name || ''}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
