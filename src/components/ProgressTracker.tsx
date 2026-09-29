import { useState, lazy, Suspense, useMemo } from 'react';
import { ScaleProgress } from '@/types/practice';
import { MdMusicNote } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Sparkles, X, Flame } from 'lucide-react';
import { SCALE_DICTIONARY, getBaseScaleName, getOctaveCount, generateMultiOctaveABC } from '@/lib/notation';
import { getScaleCycleCompletions } from '@/lib/dateUtils';

const ScaleNotationModal = lazy(() =>
  import('@/components/ScaleNotationModal').then((module) => ({ default: module.ScaleNotationModal }))
);

interface ProgressTrackerProps {
  scaleProgress: ScaleProgress[];
  dailyGoal: number;
  todayCompleted: number;
  currentScale: string;
  currentScaleIndex: number;
  practiceOrder: number[];
  round?: number;
  onOpenSettings?: () => void;
  streak?: number;
  useStreak?: boolean;
  cycleStartDate?: string;
  cycleDays?: number;
  today?: Date;
}

export function ProgressTracker({
  scaleProgress,
  dailyGoal,
  todayCompleted,
  currentScale,
  currentScaleIndex,
  practiceOrder,
  round = 1,
  onOpenSettings,
  streak = 0,
  useStreak = true,
  cycleStartDate,
  cycleDays = 7,
  today,
}: ProgressTrackerProps) {
  const [notationScale, setNotationScale] = useState<{ name: string; abc: string } | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useLocalStorage('scaled-starter-tip-dismissed', false);

  const showStarterTip = !onboardingDismissed && scaleProgress.length <= 1;

  const dailyProgressPct = dailyGoal > 0 ? (todayCompleted / dailyGoal) * 100 : 0;
  const totalScales = scaleProgress.length;
  const currentScaleNumber = totalScales > 0 ? Math.min(totalScales, currentScaleIndex + 1) : 0;

  const playedIndices = useMemo(() => {
    return new Set(practiceOrder.slice(0, currentScaleIndex));
  }, [practiceOrder, currentScaleIndex]);

  return (
    <div className="w-full space-y-4">
      {/* Daily Goal Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Daily Goal
            </h3>
            {useStreak && streak > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-semibold text-xs select-none cursor-default"
                    aria-label={`${streak} day daily goal streak`}
                  >
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{streak} {streak === 1 ? 'day' : 'days'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  {streak} day daily goal streak
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {todayCompleted}/{dailyGoal}
          </span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              todayCompleted >= dailyGoal ? 'bg-success' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(dailyProgressPct, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Round {round}</span>
          <span>Scale {currentScaleNumber} of {totalScales}</span>
        </div>
      </div>

      {/* Scale List */}
      <div className="grid gap-2 overflow-y-auto max-h-[50vh] pr-1">
        {scaleProgress.map((scale, idx) => {
          const isCurrent = scale.name === currentScale;
          const isPlayedInRound = playedIndices.has(idx);
          const baseName = getBaseScaleName(scale.name);
          const octaves = getOctaveCount(scale.name);
          const baseDef = SCALE_DICTIONARY[baseName];
          const notation = baseDef
            ? {
                name: scale.name,
                abc: generateMultiOctaveABC(baseDef, octaves),
              }
            : null;

          const cyclePlays = getScaleCycleCompletions(
            scale.history,
            cycleStartDate,
            cycleDays,
            today
          );
          const isScaleCompleted = cyclePlays >= cycleDays;
          const progress = Math.min(100, (cyclePlays / cycleDays) * 100);

          return (
            <div
              key={scale.name}
              className={`
                relative overflow-hidden rounded-lg p-3 transition-all duration-300
                ${isCurrent ? 'bg-primary/10 ring-2 ring-primary' : 'bg-card'}
                ${isPlayedInRound && !isCurrent ? 'opacity-85' : ''}
                material-shadow-sm
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium truncate mr-2 ${
                    isCurrent ? 'text-primary font-semibold' : 'text-card-foreground'
                  }`}
                >
                  {scale.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground cursor-default font-medium">
                        {cyclePlays}/{cycleDays}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Practiced {cyclePlays} of {cycleDays} in current cycle ({scale.successCount || 0} all-time)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isScaleCompleted ? 'bg-success' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
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
