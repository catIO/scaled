import { useEffect, useState, useRef } from 'react';
import { MdSettings, MdAdd, MdDelete, MdFileUpload, MdFileDownload } from 'react-icons/md';
import { toast } from '@/components/ui/use-toast';
import { CONTROL_BUTTON_SIZE, CONTROL_ICON_SIZE } from '@/lib/constants';
import { getLocalDateString } from '@/lib/dateUtils';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { UNIQUE_SCALE_NAMES } from '@/lib/notation';
import { PracticeSettings, PracticeState } from '@/types/practice';

const AVAILABLE_FINGER_PATTERNS = ['i-m', 'm-i', 'm-a', 'a-m', 'i-a', 'a-i', 'a-m-i'] as const;

// Helper function to check if imported file is valid
const isValidBackup = (data: any): data is { settings: PracticeSettings; practiceState: PracticeState } => {
  if (!data || typeof data !== 'object') return false;

  const { settings, practiceState } = data;
  if (!settings || typeof settings !== 'object') return false;
  if (!practiceState || typeof practiceState !== 'object') return false;

  // Validate settings
  if (!Array.isArray(settings.scales)) return false;
  if (!settings.scales.every((s: any) => typeof s === 'string')) return false;
  if (typeof settings.repetitionsRequired !== 'number' || settings.repetitionsRequired < 1) return false;
  if (settings.weeklyGoalRepetitions !== undefined && (typeof settings.weeklyGoalRepetitions !== 'number' || settings.weeklyGoalRepetitions < 1)) return false;

  if (!settings.metronome || typeof settings.metronome !== 'object') return false;
  if (typeof settings.metronome.enabled !== 'boolean') return false;
  if (typeof settings.metronome.bpm !== 'number' || settings.metronome.bpm < 30 || settings.metronome.bpm > 300) return false;
  if (typeof settings.metronome.volume !== 'number' || settings.metronome.volume < 0 || settings.metronome.volume > 100) return false;
  if (!['low', 'medium', 'high'].includes(settings.metronome.tone)) return false;
  if (![1, 2, 3, 4].includes(settings.metronome.subdivision)) return false;

  if (settings.fingerPatterns !== undefined) {
    if (!Array.isArray(settings.fingerPatterns)) return false;
    if (!settings.fingerPatterns.every((p: any) => typeof p === 'string')) return false;
  }

  // Validate practiceState
  if (typeof practiceState.currentScaleIndex !== 'number' || practiceState.currentScaleIndex < 0) return false;
  if (!Array.isArray(practiceState.scaleProgress)) return false;
  for (const progress of practiceState.scaleProgress) {
    if (!progress || typeof progress !== 'object') return false;
    if (typeof progress.name !== 'string') return false;
    if (typeof progress.successCount !== 'number' || progress.successCount < 0) return false;
    if (typeof progress.completed !== 'boolean') return false;
  }
  if (!Array.isArray(practiceState.practiceOrder)) return false;
  if (!practiceState.practiceOrder.every((idx: any) => typeof idx === 'number')) return false;

  return true;
};

interface SettingsProps {
  settings: PracticeSettings;
  onSettingsChange: (settings: PracticeSettings) => void;
  onReset: () => void;
  onStartNewCycle?: (cycleDays: number) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  practiceState: PracticeState;
  onImport: (settings: PracticeSettings, state: PracticeState) => void;
  initialTab?: 'scales' | 'goals' | 'fingers';
  onGearClick?: () => void;
}

export function Settings({
  settings,
  onSettingsChange,
  onReset,
  onStartNewCycle,
  open: controlledOpen,
  onOpenChange,
  practiceState,
  onImport,
  initialTab,
  onGearClick,
}: SettingsProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [newScale, setNewScale] = useState('');
  const [activeTab, setActiveTab] = useState<'scales' | 'goals' | 'fingers'>(initialTab || 'scales');
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [octaves, setOctaves] = useState('1');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cycleDays = settings.cycleDays || 7;
  const suggestedWeeklyGoal = settings.scales.length * settings.repetitionsRequired;
  const dailyTarget = suggestedWeeklyGoal / cycleDays;
  const dailyTargetRounded = Math.max(1, Math.ceil(dailyTarget));

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab || 'scales');
    }
  }, [initialTab, open]);

  const handleExport = () => {
    try {
      const exportData = {
        version: 1,
        settings,
        practiceState,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = getLocalDateString();
      link.download = `scaled-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Success",
        description: "Your practice settings and progress have been downloaded.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Export Failed",
        description: "Could not export your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') return;
        const json = JSON.parse(text);

        if (isValidBackup(json)) {
          const { settings: importedSettings, practiceState: importedState } = json;

          // Fallback check for finger patterns if undefined
          if (!importedSettings.fingerPatterns) {
            importedSettings.fingerPatterns = [];
          }

          // Goal settings migration for older backups
          if (!importedSettings.weeklyGoalRepetitions || importedSettings.weeklyGoalRepetitions < 1) {
            importedSettings.weeklyGoalRepetitions = importedSettings.scales.length * importedSettings.repetitionsRequired;
          }
          if (!importedSettings.cycleDays || importedSettings.cycleDays < 1) {
            importedSettings.cycleDays = 7;
          }
          if (!importedState.cycleStartDate) {
            importedState.cycleStartDate = getLocalDateString();
          }

          // Integrity check: match scales and progress elements
          const scaleNames = importedSettings.scales;
          const progressNames = importedState.scaleProgress.map((p) => p.name);

          // Verify identical scales set
          const match = scaleNames.length === progressNames.length &&
            scaleNames.every((name) => progressNames.includes(name));

          if (!match) {
            toast({
              title: "Import Error",
              description: "The scales list in settings does not match the progress data.",
              variant: "destructive",
            });
            return;
          }

          // Ensure practiceOrder is within valid range of scales
          const maxScaleIndex = scaleNames.length;
          const invalidOrderIdx = importedState.practiceOrder.some(
            (idx) => idx < 0 || idx >= maxScaleIndex
          );

          if (invalidOrderIdx) {
            toast({
              title: "Import Error",
              description: "The practice order contains invalid indices.",
              variant: "destructive",
            });
            return;
          }

          onImport(importedSettings, importedState);
          setOpen(false);

          toast({
            title: "Import Success",
            description: "Practice settings and progress restored successfully.",
          });
        } else {
          toast({
            title: "Invalid File Format",
            description: "The selected file is not a valid Scaled backup file.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error(err);
        toast({
          title: "Import Failed",
          description: "Failed to read or parse the selected file.",
          variant: "destructive",
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const addScale = () => {
    if (newScale.trim()) {
      const scaleNameWithOctaves = `${newScale.trim()} - ${octaves} Octave${octaves === '1' ? '' : 's'}`;
      if (!settings.scales.includes(scaleNameWithOctaves)) {
        onSettingsChange({
          ...settings,
          scales: [...settings.scales, scaleNameWithOctaves],
        });
        setNewScale('');
        setOctaves('1');
      }
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
          onClick={onGearClick}
          className={`${CONTROL_BUTTON_SIZE} rounded-xl hover:bg-muted p-0 flex items-center justify-center`}
        >
          <MdSettings className={`${CONTROL_ICON_SIZE} text-foreground`} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Practice Settings</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'scales' | 'goals' | 'fingers')} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scales">Scales</TabsTrigger>
            <TabsTrigger value="fingers">Finger Patterns</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          {/* Scales Tab */}
          <TabsContent value="scales" className="space-y-6 mt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Scales to Practice</Label>

              <div className="flex gap-2">
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="flex-1 justify-between font-normal"
                    >
                      {newScale || "Select or type scale..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search or type scale..."
                        onValueChange={(val) => {
                          // Keep newScale in sync with typing so they can add arbitrary text
                          setNewScale(val);
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-2 text-sm text-muted-foreground flex items-center justify-between">
                            <span>No standard scale found.</span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setComboboxOpen(false)}
                            >
                              Use "{newScale}"
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {UNIQUE_SCALE_NAMES.map((scale) => (
                            <CommandItem
                              key={scale}
                              value={scale}
                              onSelect={(currentValue) => {
                                // shadcn command lowercases the value, we should find the original casing
                                const originalScale = UNIQUE_SCALE_NAMES.find(s => s.toLowerCase() === currentValue.toLowerCase()) || currentValue;
                                setNewScale(originalScale);
                                setComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${newScale === scale ? "opacity-100" : "opacity-0"}`}
                              />
                              {scale}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Select value={octaves} onValueChange={setOctaves}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Octaves" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Octave</SelectItem>
                    <SelectItem value="2">2 Octaves</SelectItem>
                    <SelectItem value="3">3 Octaves</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={addScale} size="icon" variant="secondary" aria-label="Add scale" disabled={!newScale.trim()}>
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

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6 mt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Repetitions Per Scale</Label>
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
              <Label className="text-sm font-medium">Goal Timeline</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[settings.cycleDays || 7]}
                  onValueChange={([value]) =>
                    onSettingsChange({ ...settings, cycleDays: value })
                  }
                  min={1}
                  max={30}
                  step={1}
                  className="flex-1"
                />
                <span className="w-16 text-right text-base font-bold text-primary">
                  {settings.cycleDays || 7} Days
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Target: {suggestedWeeklyGoal} completed scales over {settings.cycleDays || 7} days.
              </p>
              <p className="text-xs text-muted-foreground">
                Daily pace target: {dailyTargetRounded} completed scales/day.
              </p>
            </div>

            {onStartNewCycle && (
              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Current Cycle</p>
                  <p className="text-xs text-muted-foreground">Started: {practiceState.cycleStartDate || 'Today'}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onStartNewCycle(settings.cycleDays || 7);
                    setOpen(false);
                  }}
                >
                  Start New Cycle
                </Button>
              </div>
            )}

            {/* Data Management Section */}
            <div className="pt-4 border-t space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Data Management</h3>
                <p className="text-xs text-muted-foreground">
                  Backup your settings and progress or restore them from a previous backup.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 h-10 rounded-lg"
                >
                  <MdFileDownload className="w-4 h-4" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  onClick={handleImportClick}
                  className="flex items-center justify-center gap-2 h-10 rounded-lg"
                >
                  <MdFileUpload className="w-4 h-4" />
                  Import Data
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset all progress? This will reset all current session practice scores and shufflings. This action cannot be undone.")) {
                    onReset();
                    setOpen(false);
                  }
                }}
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive h-10 rounded-lg font-medium"
              >
                Reset All Progress
              </Button>
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

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json"
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}
