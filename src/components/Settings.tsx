import { useState } from 'react';
import { MdSettings, MdAdd, MdDelete, MdClose } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PracticeSettings } from '@/types/practice';

interface SettingsProps {
  settings: PracticeSettings;
  onSettingsChange: (settings: PracticeSettings) => void;
  onReset: () => void;
}

export function Settings({ settings, onSettingsChange, onReset }: SettingsProps) {
  const [open, setOpen] = useState(false);
  const [newScale, setNewScale] = useState('');

  const addScale = () => {
    if (newScale.trim() && !settings.scales.includes(newScale.trim())) {
      onSettingsChange({
        ...settings,
        scales: [...settings.scales, newScale.trim()],
      });
      setNewScale('');
    }
  };

  const removeScale = (scale: string) => {
    onSettingsChange({
      ...settings,
      scales: settings.scales.filter((s) => s !== scale),
    });
  };

  const updateMetronome = (updates: Partial<typeof settings.metronome>) => {
    onSettingsChange({
      ...settings,
      metronome: { ...settings.metronome, ...updates },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-2xl bg-card border border-border hover:bg-card/80 p-0"
        >
          <MdSettings className="w-6 h-6 text-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Practice Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Repetitions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Required Repetitions</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.repetitionsRequired]}
                onValueChange={([value]) =>
                  onSettingsChange({ ...settings, repetitionsRequired: value })
                }
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-center text-lg font-bold text-primary">
                {settings.repetitionsRequired}
              </span>
            </div>
          </div>

          {/* Metronome Settings */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Metronome</Label>
              <Switch
                checked={settings.metronome.enabled}
                onCheckedChange={(enabled) => updateMetronome({ enabled })}
              />
            </div>

            {settings.metronome.enabled && (
              <div className="space-y-4 animate-slide-up">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">BPM</Label>
                    <span className="text-xs font-medium">{settings.metronome.bpm}</span>
                  </div>
                  <Slider
                    value={[settings.metronome.bpm]}
                    onValueChange={([bpm]) => updateMetronome({ bpm })}
                    min={40}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs text-muted-foreground">Volume</Label>
                    <span className="text-xs font-medium">{settings.metronome.volume}%</span>
                  </div>
                  <Slider
                    value={[settings.metronome.volume]}
                    onValueChange={([volume]) => updateMetronome({ volume })}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Tone</Label>
                  <Select
                    value={settings.metronome.tone}
                    onValueChange={(tone: 'low' | 'medium' | 'high') =>
                      updateMetronome({ tone })
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
              </div>
            )}
          </div>

          {/* Scales */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Scales to Practice</Label>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add new scale..."
                value={newScale}
                onChange={(e) => setNewScale(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addScale()}
                className="flex-1"
              />
              <Button onClick={addScale} size="icon" variant="secondary">
                <MdAdd className="w-4 h-4" />
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {settings.scales.map((scale) => (
                <div
                  key={scale}
                  className="flex items-center justify-between bg-card p-3 rounded-lg material-shadow-sm"
                >
                  <span className="text-sm">{scale}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeScale(scale)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <MdDelete className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={() => {
              onReset();
              setOpen(false);
            }}
            className="w-full"
          >
            Reset All Progress
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
