import { useState, lazy, Suspense } from 'react';
import { ScaleProgress } from '@/types/practice';
import { MdEdit, MdMusicNote } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CONTROL_BUTTON_SIZE, CONTROL_ICON_SIZE } from '@/lib/constants';
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

  const weeklyProgressPct = weeklyGoalRepetitions
    ? (weeklyCompletedRepetitions / weeklyGoalRepetitions) * 100
    : 0;
  const dailyTargetRounded = Math.ceil(dailyTargetRepetitions);
  const dailyRemainingRounded = Math.max(0, Math.ceil(dailyRemainingRepetitions));

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-m font-bold text-muted-foreground uppercase tracking-wider py-2">Progress</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {weeklyCompletedRepetitions}/{weeklyGoalRepetitions}
          </span>
        </div>
        {onOpenSettings && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
                aria-label="Edit scales"
                className={`${CONTROL_BUTTON_SIZE} rounded-xl hover:bg-muted p-0 flex items-center justify-center`}
              >
                <MdEdit className={`${CONTROL_ICON_SIZE} text-foreground`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit scales</TooltipContent>
          </Tooltip>
        )}
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
