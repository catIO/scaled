import { ScaleProgress } from '@/types/practice';
import { MdCheck, MdEdit } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { CONTROL_BUTTON_SIZE, CONTROL_ICON_SIZE } from '@/lib/constants';

interface ProgressTrackerProps {
  scaleProgress: ScaleProgress[];
  repetitionsRequired: number;
  currentScale: string;
  onOpenSettings?: () => void;
}

export function ProgressTracker({ scaleProgress, repetitionsRequired, currentScale, onOpenSettings }: ProgressTrackerProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-m font-bold text-muted-foreground uppercase tracking-wider py-2">Progress</h3>
        {onOpenSettings && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className={`${CONTROL_BUTTON_SIZE} rounded-xl hover:bg-muted p-0 flex items-center justify-center`}
          >
            <MdEdit className={`${CONTROL_ICON_SIZE} text-foreground`} />
          </Button>
        )}
      </div>
      <div className="grid gap-2 overflow-y-auto pr-2">
        {scaleProgress.map((scale) => {
          const progress = (scale.successCount / repetitionsRequired) * 100;
          const isCurrent = scale.name === currentScale;
          
          return (
            <div
              key={scale.name}
              className={`
                relative overflow-hidden rounded-lg p-3 transition-all duration-300
                ${isCurrent ? 'bg-primary/10 ring-2 ring-primary' : 'bg-card'}
                ${scale.completed ? 'bg-success/10' : ''}
                material-shadow-sm
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-card-foreground'}`}>
                  {scale.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {scale.successCount}/{repetitionsRequired}
                </span>
              </div>
              
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    scale.completed ? 'bg-success' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              
              {scale.completed && (
                <div className="absolute top-2 right-2">
                  <MdCheck className="w-4 h-4 text-success" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
