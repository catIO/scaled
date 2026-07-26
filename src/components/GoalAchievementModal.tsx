import { useState } from 'react';
import { MdEmojiEvents, MdRefresh, MdPlayArrow } from 'react-icons/md';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface GoalAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewCycle: (cycleDays: number) => void;
  completedScalesCount: number;
  totalRepetitionsCompleted: number;
  currentCycleDays: number;
}

export function GoalAchievementModal({
  isOpen,
  onClose,
  onStartNewCycle,
  completedScalesCount,
  totalRepetitionsCompleted,
  currentCycleDays,
}: GoalAchievementModalProps) {
  const [selectedDays, setSelectedDays] = useState<number>(currentCycleDays || 7);

  const presetDays = [7, 14, 30];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-6 text-center space-y-6">
        <DialogHeader className="space-y-3">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <MdEmojiEvents className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Goal Achieved!
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            You've completed all {completedScalesCount} scales with {totalRepetitionsCompleted} total practice reps!
          </DialogDescription>
        </DialogHeader>

        <div className="bg-card p-4 rounded-xl border border-border space-y-3 text-left">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Start a New Practice Cycle
          </Label>
          <p className="text-xs text-muted-foreground">
            Choose your target cycle duration in days:
          </p>
          <div className="flex gap-2 pt-1">
            {presetDays.map((days) => (
              <Button
                key={days}
                type="button"
                variant={selectedDays === days ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDays(days)}
                className="flex-1 text-xs"
              >
                {days} Days
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            size="lg"
            onClick={() => onStartNewCycle(selectedDays)}
            className="w-full rounded-xl h-12 flex items-center justify-center gap-2"
          >
            <MdRefresh className="w-5 h-5" />
            Start New {selectedDays}-Day Cycle
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-muted-foreground hover:text-foreground h-10"
          >
            <MdPlayArrow className="w-4 h-4 mr-1" />
            Keep Practicing Continuous Set
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
