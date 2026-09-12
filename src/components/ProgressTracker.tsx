import { useState, lazy, Suspense } from 'react';
import { ScaleProgress } from '@/types/practice';
import { MdMusicNote } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Sparkles, X } from 'lucide-react';
import { SCALE_DICTIONARY, getBaseScaleName, getOctaveCount, generateMultiOctaveABC } from '@/lib/notation';

const ScaleNotationModal = lazy(() =>
  import('@/components/ScaleNotationModal').then((module) => ({ default: module.ScaleNotationModal }))
);

interface ProgressTrackerProps {
  scaleProgress: ScaleProgress[];
  repetitionsRequired: number;
  weeklyGoalRepetitions: number;
  weeklyCompletedRepetitions: number;
  dailyTargetRepetitions: number;
  dailyRemainingRepetitions: number;
  currentScale: string;
  cycleDays?: number;
  onOpenSettings?: () => void;
}

export function ProgressTracker({
  scaleProgress,
  repetitionsRequired,
  weeklyGoalRepetitions,
  weeklyCompletedRepetitions,
  dailyTargetRepetitions,
  dailyRemainingRepetitions,
  currentScale,
  cycleDays = 7,
  onOpenSettings,
}: ProgressTrackerProps) {
  const [notationScale, setNotationScale] = useState<{ name: string, abc: string } | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useLocalStorage('scaled-starter-tip-dismissed', false);

  const showStarterTip = !onboardingDismissed && scaleProgress.length <= 1;

  const weeklyProgressPct = weeklyGoalRepetitions
    ? (weeklyCompletedRepetitions / weeklyGoalRepetitions) * 100
    : 0;
  const dailyTargetRounded = Math.ceil(dailyTargetRepetitions);
  const dailyRemainingRounded = Math.max(0, Math.ceil(dailyRemainingRepetitions));

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between py-1">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Progress</h3>
        <span className="text-xs font-medium text-muted-foreground">
          {weeklyCompletedRepetitions}/{weeklyGoalRepetitions}
        </span>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${weeklyCompletedRepetitions >= weeklyGoalRepetitions ? 'bg-success' : 'bg-primary'
            }`}
          style={{ width: `${Math.min(weeklyProgressPct, 100)}%` }}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Daily target: {dailyTargetRounded} reps | Remaining today: {dailyRemainingRounded}
      </div>

      <div className="grid gap-2 overflow-y-auto pr-2">
        {scaleProgress.map((scale) => {
          const isScaleCompleted = scale.successCount >= repetitionsRequired;
          const progress = (scale.successCount / repetitionsRequired) * 100;
          const isCurrent = scale.name === currentScale;
          const baseName = getBaseScaleName(scale.name);
          const octaves = getOctaveCount(scale.name);
          const baseDef = SCALE_DICTIONARY[baseName];
          const notation = baseDef ? {
            name: scale.name,
            abc: generateMultiOctaveABC(baseDef, octaves)
          } : null;

          return (
            <div
              key={scale.name}
              className={`
                relative overflow-hidden rounded-lg p-3 transition-all duration-300
                ${isCurrent ? 'bg-primary/10 ring-2 ring-primary' : 'bg-card'}
                ${isScaleCompleted ? 'bg-success/10' : ''}
                material-shadow-sm
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-card-foreground'}`}>
                  {scale.name}
                </span>
                <div className="flex items-center gap-2">
                  {notation && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:bg-primary/10 hover:text-primary z-10"
                      onClick={() => setNotationScale(notation)}
                      aria-label={`View notation for ${scale.name}`}
                    >
                      <MdMusicNote className="w-4 h-4" />
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {scale.successCount}/{repetitionsRequired}
                  </span>
                </div>
              </div>

              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${isScaleCompleted ? 'bg-success' : 'bg-primary'
                    }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              {/* Checkmark removed */}
            </div>
          );
        })}
      </div>

      {showStarterTip && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Started</span>
            </div>
            <button
              type="button"
              onClick={() => setOnboardingDismissed(true)}
              className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
              aria-label="Dismiss tip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We loaded <strong>C Major</strong> as your starter scale. Add, remove, and organize all your scales anytime in <strong>Settings</strong>.
          </p>
          {onOpenSettings && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="w-full text-xs h-8"
            >
              Customize Scales
            </Button>
          )}
        </div>
      )}

      {notationScale && (
        <Suspense fallback={null}>
          <ScaleNotationModal
            isOpen={!!notationScale}
            onClose={() => setNotationScale(null)}
            scaleName={notationScale?.name || ''}
            abcString={notationScale?.abc || ''}
          />
        </Suspense>
      )}
    </div>
  );
}
