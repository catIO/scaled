import { useState, useEffect } from 'react';
import { MdCheck, MdClose, MdMusicNote } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { getRandomFingerCombination } from '@/lib/fingerCombinations';

interface ScaleCardProps {
  scaleName: string;
  successCount: number;
  repetitionsRequired: number;
  onAccept: () => void;
  onDecline: () => void;
  isCompleted: boolean;
  /** When provided, this pattern is shown; otherwise a random one is chosen from fingerPatterns */
  fingerCombination?: string | null;
  fingerPatterns?: string[];
}

export function ScaleCard({
  scaleName,
  successCount,
  repetitionsRequired,
  onAccept,
  onDecline,
  isCompleted,
  fingerCombination: fingerCombinationProp,
  fingerPatterns,
}: ScaleCardProps) {
  const [localFingerCombination, setLocalFingerCombination] = useState<string | null>(
    () => getRandomFingerCombination(scaleName, fingerPatterns)
  );

  // When parent doesn't control finger combination, update local when scale or patterns change
  useEffect(() => {
    if (fingerCombinationProp !== undefined) return;
    setLocalFingerCombination(getRandomFingerCombination(scaleName, fingerPatterns));
  }, [scaleName, fingerPatterns, fingerCombinationProp]);

  const fingerCombination =
    fingerCombinationProp !== undefined ? fingerCombinationProp : localFingerCombination;

  return (
    <div className="w-full max-w-md animate-scale-in">
      <div className="bg-muted rounded-2xl material-shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <MdMusicNote className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Practice Scale
          </p>
          <h2 className="text-4xl font-bold text-card-foreground">
            {scaleName}
          </h2>
          {fingerCombination && (
            <p className="text-lg text-muted-foreground font-medium pb-0">
              {fingerCombination}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 py-4 pt-2">
          <div className="flex gap-1">
            {Array.from({ length: repetitionsRequired }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  i < successCount ? 'bg-success scale-110' : 'bg-foreground/20'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground ml-2">
            {successCount} / {repetitionsRequired}
          </span>
        </div>

        {!isCompleted && (
          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={onDecline}
              aria-label="Mark scale as incomplete"
              className="w-16 h-16 rounded-xl bg-destructive text-white hover:bg-destructive/90 [&_svg]:!w-8 [&_svg]:!h-9"
            >
              <MdClose />
            </Button>
            <Button
              onClick={onAccept}
              aria-label="Mark scale as completed"
              className="w-16 h-16 rounded-xl bg-success text-white hover:bg-success/90 [&_svg]:!w-8 [&_svg]:!h-8"
            >
              <MdCheck />
            </Button>
          </div>
        )}

        {isCompleted && (
          <div className="pt-4 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full">
              <MdCheck className="w-5 h-5" />
              <span className="font-medium">Scale Mastered!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
