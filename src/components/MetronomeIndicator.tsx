import { MdPlayArrow, MdPause } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { MetronomeSettings } from '@/types/practice';
import { CONTROL_BUTTON_SIZE, CONTROL_ICON_SIZE } from '@/lib/constants';

interface MetronomeIndicatorProps {
  settings: MetronomeSettings;
  isPlaying: boolean;
  onToggle: () => void;
}

export function MetronomeIndicator({ settings, isPlaying, onToggle }: MetronomeIndicatorProps) {
  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      aria-label={isPlaying ? 'Pause metronome' : 'Start metronome'}
      className={`${CONTROL_BUTTON_SIZE} rounded-xl hover:bg-muted p-0 flex items-center justify-center`}
      disabled={!settings.enabled}
    >
      {isPlaying ? (
        <MdPause className={`${CONTROL_ICON_SIZE} text-foreground`} />
      ) : (
        <MdPlayArrow className={`${CONTROL_ICON_SIZE} text-foreground`} />
      )}
    </Button>
  );
}
