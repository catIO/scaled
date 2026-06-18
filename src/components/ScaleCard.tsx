import { useState, useEffect, lazy, Suspense } from 'react';
import { MdCheck, MdClose, MdMusicNote } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { getRandomFingerCombination } from '@/lib/fingerCombinations';
import { SCALE_DICTIONARY, getBaseScaleName, getOctaveCount, generateMultiOctaveABC } from '@/lib/notation';

const ScaleNotationModal = lazy(() =>
  import('@/components/ScaleNotationModal').then((module) => ({ default: module.ScaleNotationModal }))
);

interface ScaleCardProps {
  scaleName: string;
  successCount: number;
  repetitionsRequired: number;
  onAccept: () => void;
  onDecline: () => void;
  isCompleted: boolean;
  acceptDisabled?: boolean;
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
  acceptDisabled = false,
  fingerCombination: fingerCombinationProp,
  fingerPatterns,
}: ScaleCardProps) {
  const [localFingerCombination, setLocalFingerCombination] = useState<string | null>(
    () => getRandomFingerCombination(scaleName, fingerPatterns)
  );
  const [showNotation, setShowNotation] = useState(false);

  const baseName = getBaseScaleName(scaleName);
  const octaves = getOctaveCount(scaleName);
  const baseDef = SCALE_DICTIONARY[baseName];
  const notation = baseDef ? {
    name: scaleName,
    abc: generateMultiOctaveABC(baseDef, octaves)
  } : null;

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
        <button
          onClick={() => notation && setShowNotation(true)}
          disabled={!notation}
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${notation ? 'bg-primary/10 hover:bg-primary/20 cursor-pointer' : 'bg-primary/10 opacity-50 cursor-not-allowed'}`}
          aria-label="View Scale Notation"
        >
          <MdMusicNote className="w-8 h-8 text-primary" />
        </button>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Practice Scale
          </p>
          <h2 className="text-4xl font-bold text-card-foreground flex flex-col items-center gap-1">
            <span>{scaleName.split(' - ')[0]}</span>
            {scaleName.includes(' - ') && (
              <span className="text-2xl text-muted-foreground font-medium">
                {scaleName.split(' - ').slice(1).join(' - ')}
              </span>
            )}
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
                className={`w-4 h-4 rounded-full transition-all duration-300 ${i < successCount ? 'bg-success scale-110' : 'bg-foreground/20'
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
              disabled={acceptDisabled}
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

        {showNotation && (
          <Suspense fallback={null}>
            <ScaleNotationModal
              isOpen={showNotation}
              onClose={() => setShowNotation(false)}
              scaleName={notation?.name || ''}
              abcString={notation?.abc || ''}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
