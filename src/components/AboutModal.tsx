import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info, CheckCircle2, Music, Target, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: 'Configure Your Practice',
    description: 'Open Settings to customize your active scale list, repetitions per scale, cycle length, and week start day.',
    icon: Target,
  },
  {
    title: 'Finger Combinations',
    description: 'Select right-hand finger patterns (e.g., i-m, m-i, a-m-i) to cycle through while practicing.',
    icon: Music,
  },
  {
    title: 'Practice & Record',
    description: 'Play the prompt scale and click Accept for each clean run to increment your repetition counter.',
    icon: CheckCircle2,
  },
  {
    title: 'Daily & Weekly Targets',
    description: 'Track daily pace against your automatically calculated goal so you finish every scale in your cycle.',
    icon: Sparkles,
  },
];

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>Guide & Overview</span>
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            About Scaled
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Scaled helps musicians build consistent practice habits with progressive repetition tracking, finger combination cycling, and pace-adjusted daily goals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* How To Use Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              How To Use
            </h3>
            <div className="grid gap-3">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-muted/30"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-medium text-xs">
                      {index + 1}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-sm text-foreground">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{step.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Practice Lab Suite Section */}
          <section className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Practice Lab Suite</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Explore our full collection of focused music practice tools.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0 ml-3">
                <a
                  href="https://practice-lab.net/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>practice-lab.net</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </Button>
            </div>
          </section>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="secondary" onClick={onClose} className="px-5">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
