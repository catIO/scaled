import { MdPlayArrow, MdPause } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { MetronomeSettings } from '@/types/practice';

interface MetronomeIndicatorProps {
  settings: MetronomeSettings;
  isPlaying: boolean;
  onToggle: () => void;
}

export function MetronomeIndicator({ settings, isPlaying, onToggle }: MetronomeIndicatorProps) {
  if (!settings.enabled) return null;

  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      className="h-12 w-12 rounded-2xl bg-card border border-border hover:bg-card/80 p-0"
    >
      {isPlaying ? (
        <MdPause className="w-6 h-6 text-foreground" />
      ) : (
        <MdPlayArrow className="w-6 h-6 text-foreground" />
      )}
    </Button>
  );
}
