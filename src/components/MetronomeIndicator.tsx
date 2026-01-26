import { useState, useEffect, useRef } from 'react';
import { MdPlayArrow, MdPause, MdKeyboardArrowDown, MdRemove, MdAdd } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MetronomeSettings } from '@/types/practice';

interface MetronomeIndicatorProps {
  settings: MetronomeSettings;
  isPlaying: boolean;
  onToggle: () => void;
  onSettingsChange: (updates: Partial<MetronomeSettings>) => void;
}

export function MetronomeIndicator({ 
  settings, 
  isPlaying, 
  onToggle,
  onSettingsChange 
}: MetronomeIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleBpmDecrease = () => {
    if (settings.bpm > 40) {
      onSettingsChange({ bpm: Math.max(40, settings.bpm - 5) });
    }
  };

  const handleBpmIncrease = () => {
    if (settings.bpm < 200) {
      onSettingsChange({ bpm: Math.min(200, settings.bpm + 5) });
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement;
    const isArrowClick = target.closest('[data-dropdown-arrow]') !== null;
    
    if (isArrowClick && settings.enabled) {
      e.stopPropagation();
      setIsOpen(!isOpen);
    } else {
      // Click on play/pause icon or BPM toggles metronome
      if (settings.enabled) {
        onToggle();
      }
    }
  };

  return (
    <div className="relative" ref={widgetRef}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={handleButtonClick}
            aria-label={isPlaying ? 'Pause metronome' : 'Start metronome'}
            className={`h-12 px-4 rounded-xl flex items-center gap-2 transition-all duration-200 ${
              settings.enabled
                ? isPlaying
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
                  : 'bg-muted text-foreground hover:bg-muted/80 hover:text-foreground'
                : 'bg-muted text-muted-foreground opacity-60'
            }`}
            disabled={!settings.enabled}
          >
            {isPlaying && settings.enabled ? (
              <MdPause className="w-5 h-5" />
            ) : (
              <MdPlayArrow className="w-5 h-5" />
            )}
            {settings.enabled && (
              <span className="text-sm font-medium">{settings.bpm}</span>
            )}
            {settings.enabled && (
              <span 
                data-dropdown-arrow 
                className="flex items-center transition-transform"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <MdKeyboardArrowDown className="w-4 h-4" />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          {isPlaying ? 'Pause metronome' : 'Start metronome'}
        </TooltipContent>
      </Tooltip>

      {/* Dropdown Menu */}
      {isOpen && settings.enabled && (
        <div
          className="absolute left-0 mt-2 w-80 bg-card rounded-lg shadow-lg border border-border py-4 px-4 z-50"
        >
          {/* Enable/Disable */}
          <div className="mb-4 flex items-center justify-between">
            <Label className="text-sm font-medium">Metronome</Label>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => onSettingsChange({ enabled })}
            />
          </div>

          {/* BPM Control */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">BPM</Label>
              <span className="text-lg font-bold">{settings.bpm}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                onClick={handleBpmDecrease}
                disabled={settings.bpm <= 40}
              >
                <MdRemove className="w-4 h-4" />
              </Button>
              <Slider
                value={[settings.bpm]}
                onValueChange={([bpm]) => onSettingsChange({ bpm })}
                min={40}
                max={200}
                step={1}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                onClick={handleBpmIncrease}
                disabled={settings.bpm >= 200}
              >
                <MdAdd className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Volume</Label>
              <span className="text-sm text-muted-foreground">{settings.volume}%</span>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={([volume]) => onSettingsChange({ volume })}
              min={0}
              max={100}
              step={1}
            />
          </div>

          {/* Tone Selector */}
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">Tone</Label>
            <Select
              value={settings.tone}
              onValueChange={(tone) =>
                onSettingsChange({ tone: tone as MetronomeSettings['tone'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (220 Hz)</SelectItem>
                <SelectItem value="medium">Medium (440 Hz)</SelectItem>
                <SelectItem value="high">High (880 Hz)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start/Pause Button */}
          <Button
            onClick={() => {
              onToggle();
              setIsOpen(false);
            }}
            className={`w-full ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isPlaying ? (
              <span className="flex items-center justify-center gap-2">
                <MdPause className="w-4 h-4" />
                Pause
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <MdPlayArrow className="w-4 h-4" />
                Start
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
