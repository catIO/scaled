import { ScaleProgress } from '@/types/practice';
import { MdCheck } from 'react-icons/md';

interface ProgressTrackerProps {
  scaleProgress: ScaleProgress[];
  repetitionsRequired: number;
  currentScale: string;
}

export function ProgressTracker({ scaleProgress, repetitionsRequired, currentScale }: ProgressTrackerProps) {
  return (
    <div className="w-full space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Progress</h3>
      <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
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
