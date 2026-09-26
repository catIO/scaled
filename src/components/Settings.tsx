import { useEffect, useState, useRef } from 'react';
import { MdSettings, MdAdd, MdDelete, MdFileUpload, MdFileDownload } from 'react-icons/md';
import { toast } from '@/components/ui/use-toast';
import { CONTROL_BUTTON_SIZE, CONTROL_ICON_SIZE } from '@/lib/constants';
import { getLocalDateString, getElapsedDays } from '@/lib/dateUtils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Check, ChevronsUpDown, Info, ExternalLink, Flame } from "lucide-react";
import { UNIQUE_SCALE_NAMES } from '@/lib/notation';
import { PracticeSettings, PracticeState } from '@/types/practice';

const AVAILABLE_FINGER_PATTERNS = ['i-m', 'm-i', 'm-a', 'a-m', 'i-a', 'a-i', 'a-m-i'] as const;

// Helper function to check if imported file is valid
interface BackupData {
  version?: number;
  settings: PracticeSettings;
  practiceState: PracticeState;
  dailyRepetitions?: Record<string, number>;
  streak?: number;
  completedDays?: number;
}

const isValidBackup = (data: unknown): data is BackupData => {
  if (!data || typeof data !== 'object') return false;

  const dataObj = data as Record<string, unknown>;
  const settings = dataObj.settings as PracticeSettings | undefined;
  const practiceState = dataObj.practiceState as PracticeState | undefined;
  if (!settings || typeof settings !== 'object') return false;
  if (!practiceState || typeof practiceState !== 'object') return false;

  // Validate settings
  if (!Array.isArray(settings.scales)) return false;
  if (!settings.scales.every((s: unknown) => typeof s === 'string')) return false;
  if (settings.cycleDays !== undefined && (typeof settings.cycleDays !== 'number' || settings.cycleDays < 1)) return false;

  if (!settings.metronome || typeof settings.metronome !== 'object') return false;
  if (typeof settings.metronome.enabled !== 'boolean') return false;
  if (typeof settings.metronome.bpm !== 'number' || settings.metronome.bpm < 30 || settings.metronome.bpm > 300) return false;
  if (typeof settings.metronome.volume !== 'number' || settings.metronome.volume < 0 || settings.metronome.volume > 100) return false;
  if (!['low', 'medium', 'high'].includes(settings.metronome.tone)) return false;
  if (![1, 2, 3, 4].includes(settings.metronome.subdivision)) return false;

  if (settings.fingerPatterns !== undefined) {
    if (!Array.isArray(settings.fingerPatterns)) return false;
    if (!settings.fingerPatterns.every((p: unknown) => typeof p === 'string')) return false;
  }

  if (settings.useStreak !== undefined && typeof settings.useStreak !== 'boolean') return false;

  // Validate practiceState
  if (typeof practiceState.currentScaleIndex !== 'number') return false;
  if (!Array.isArray(practiceState.scaleProgress)) return false;
  if (!Array.isArray(practiceState.practiceOrder)) return false;
  if (!practiceState.practiceOrder.every((idx: unknown) => typeof idx === 'number')) return false;

  return true;
};

interface SettingsProps {
  settings: PracticeSettings;
  onSettingsChange: (settings: PracticeSettings) => void;
  onReset: () => void;
  onResetStreak?: () => void;
  onStartNewCycle?: (cycleDays: number) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  practiceState: PracticeState;
  dailyRepetitions?: Record<string, number>;
  streak?: number;
  onImport: (
    settings: PracticeSettings,
    state: PracticeState,
    dailyRepetitions?: Record<string, number>,
    streak?: number
  ) => void;
  initialTab?: 'scales' | 'goals' | 'fingers';
  onGearClick?: () => void;
  onOpenAbout?: () => void;
}

export function Settings({
  settings,
  onSettingsChange,
  onReset,
  onResetStreak,
  onStartNewCycle,
  open: controlledOpen,
  onOpenChange,
  practiceState,
  dailyRepetitions,
  streak = 0,
  onImport,
  initialTab,
  onGearClick,
  onOpenAbout,
}: SettingsProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [newScale, setNewScale] = useState('');
  const [activeTab, setActiveTab] = useState<'scales' | 'goals' | 'fingers'>(initialTab || 'scales');
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [octaves, setOctaves] = useState('1');
  const [showResetStreakConfirm, setShowResetStreakConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cycleDays = settings.cycleDays || 7;
  const elapsedDays = getElapsedDays(practiceState.cycleStartDate);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab || 'scales');
    }
  }, [initialTab, open]);

  const handleExport = () => {
    try {
      const exportData: BackupData = {
        version: 1,
        settings,
        practiceState,
        dailyRepetitions: dailyRepetitions || {},
        streak,
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
          const importedDailyRepetitions = json.dailyRepetitions;
          const rawStreak = typeof json.streak === 'number'
            ? json.streak
            : (typeof json.completedDays === 'number' ? json.completedDays : undefined);

          // Fallback check for finger patterns if undefined
          if (!importedSettings.fingerPatterns) {
            importedSettings.fingerPatterns = [];
          }

          // Daily goal & cycle migration for older backups
          if (!importedSettings.dailyGoal || importedSettings.dailyGoal < 1) {
            importedSettings.dailyGoal = 10;
          }
          if (!importedSettings.cycleDays || importedSettings.cycleDays < 1) {
            importedSettings.cycleDays = 7;
          }
          if (!importedState.cycleStartDate) {
            importedState.cycleStartDate = getLocalDateString();
          }
          if (importedState.round === undefined || importedState.round < 1) {
            importedState.round = 1;
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

          onImport(importedSettings, importedState, importedDailyRepetitions, rawStreak);
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
        const newScales = [...settings.scales, scaleNameWithOctaves];
        onSettingsChange({
          ...settings,
          scales: newScales,
        });
        setNewScale('');
        setOctaves('1');
      }
    }
  };

  const removeScale = (scale: string) => {
    const newScales = settings.scales.filter((s) => s !== scale);
    onSettingsChange({
      ...settings,
      scales: newScales,
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
            {/* Daily Goal */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Daily Goal</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[settings.dailyGoal]}
                  onValueChange={([value]) =>
                    onSettingsChange({
                      ...settings,
                      dailyGoal: value,
                    })
                  }
                  min={1}
                  max={30}
                  step={1}
                  className="flex-1"
                />
                <span className="w-16 text-right text-base font-bold text-primary">
                  {settings.dailyGoal} / Day
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose how many scales you want to practice each day. Scaled randomly selects from your list without repeating until all scales have been played.
              </p>
            </div>

            {/* Practice Cycle */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Practice Cycle</Label>
                <span className="text-sm font-bold text-primary">
                  {cycleDays} {cycleDays === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <Slider
                value={[cycleDays]}
                onValueChange={([value]) =>
                  onSettingsChange({
                    ...settings,
                    cycleDays: value,
                  })
                }
                min={1}
                max={30}
                step={1}
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Define how many days your practice cycle lasts (e.g. 7 days for a weekly cycle).
              </p>
            </div>

            {/* Current Cycle Status */}
            <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Current Cycle</p>
                <p className="text-xs text-muted-foreground">
                  Started: {practiceState.cycleStartDate || 'Today'} · Day {Math.min(elapsedDays, cycleDays)} of {cycleDays}
                </p>
              </div>
              {onStartNewCycle && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStartNewCycle(cycleDays)}
                  className="text-xs h-8"
                >
                  Start New Cycle
                </Button>
              )}
            </div>

            {/* Practice Streak Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <Label htmlFor="use-streak-toggle" className="text-sm font-medium">Practice Streak</Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Track daily practice consistency. Streaks do not reset automatically on missed days.
                  </p>
                </div>
                <Switch
                  id="use-streak-toggle"
                  checked={settings.useStreak !== false}
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      useStreak: checked,
                    })
                  }
                />
              </div>

              {settings.useStreak !== false && (
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Current Streak</p>
                      <p className="text-xs text-muted-foreground">
                        {streak} {streak === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowResetStreakConfirm(true)}
                    disabled={streak === 0}
                    className="text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    Reset Streak
                  </Button>
                </div>
              )}
            </div>

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

        <div className="border-t border-border pt-4 mt-2 flex items-center justify-between text-xs text-muted-foreground">
          {onOpenAbout ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenAbout();
              }}
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About Scaled & Guide</span>
            </button>
          ) : (
            <span />
          )}
          <a
            href="https://practice-lab.net/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <span>Practice Lab Suite</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json"
          className="hidden"
        />

        <AlertDialog open={showResetStreakConfirm} onOpenChange={setShowResetStreakConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Practice Streak?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset your daily practice streak to 0. Your scale practice scores and completion history will remain intact. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (onResetStreak) {
                    onResetStreak();
                  }
                  setShowResetStreakConfirm(false);
                }}
                className={buttonVariants({ variant: "destructive" })}
              >
                Reset Streak
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
