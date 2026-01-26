import { useState } from 'react';
import { MdSettings, MdAdd, MdDelete } from 'react-icons/md';
import { CONTROL_BUTTON_SIZE, CONTROL_ICON_SIZE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { PracticeSettings } from '@/types/practice';

const AVAILABLE_FINGER_PATTERNS = ['i-m', 'm-i', 'm-a', 'a-m', 'i-a', 'a-i', 'a-m-i'] as const;

interface SettingsProps {
  settings: PracticeSettings;
  onSettingsChange: (settings: PracticeSettings) => void;
  onReset: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Settings({ settings, onSettingsChange, onReset, open: controlledOpen, onOpenChange }: SettingsProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
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


  const toggleFingerPattern = (pattern: string) => {
    const currentPatterns = settings.fingerPatterns || [];
    if (currentPatterns.includes(pattern)) {
      onSettingsChange({
        ...settings,
        fingerPatterns: currentPatterns.filter((p) => p !== pattern),
      });
    } else {
      onSettingsChange({
        ...settings,
        fingerPatterns: [...currentPatterns, pattern],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open settings"
          className={`${CONTROL_BUTTON_SIZE} rounded-xl hover:bg-muted p-0 flex items-center justify-center`}
        >
          <MdSettings className={`${CONTROL_ICON_SIZE} text-foreground`} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Practice Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="scales" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scales">Scales</TabsTrigger>
            <TabsTrigger value="fingers">Finger Patterns</TabsTrigger>
          </TabsList>

          {/* Scales Tab */}
          <TabsContent value="scales" className="space-y-6 mt-4">
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
                <Button onClick={addScale} size="icon" variant="secondary" aria-label="Add scale">
                  <MdAdd className="w-4 h-4" />
                </Button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
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
                      aria-label={`Remove scale ${scale}`}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <MdDelete className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Finger Patterns Tab */}
          <TabsContent value="fingers" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Right Hand Finger Patterns</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Select finger patterns to practice. Patterns will be randomly selected during practice for all scales.
                </p>
              </div>

              <div className="p-4 bg-card rounded-lg border border-border space-y-3">
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_FINGER_PATTERNS.map((pattern) => {
                    const isSelected = (settings.fingerPatterns || []).includes(pattern);
                    return (
                      <Button
                        key={pattern}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleFingerPattern(pattern)}
                        className="h-10 px-4"
                      >
                        {pattern}
                      </Button>
                    );
                  })}
                </div>
                {(settings.fingerPatterns || []).length > 0 && (
                  <div className="text-xs text-muted-foreground pt-2">
                    Selected: {(settings.fingerPatterns || []).join(', ')}
                  </div>
                )}
                {(settings.fingerPatterns || []).length === 0 && (
                  <div className="text-xs text-muted-foreground pt-2">
                    No patterns selected. Default patterns will be used.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reset Button */}
        <div className="pt-4 border-t">
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
