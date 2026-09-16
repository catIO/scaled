---
# scaled-dcgv
title: Simplify goals to daily scale count with round-based random selection
status: completed
type: feature
priority: normal
created_at: 2026-09-16T09:34:03Z
updated_at: 2026-09-16T09:53:53Z
---

Simplify goals so the user only has to select how many scales to practice every day, maintaining random scale selection without repeating until all scales are played once.


## Tasks
- [x] Update PracticeSettings and PracticeState types in practice.ts
- [x] Add simplified daily goal helpers in dateUtils.ts
- [x] Update Settings.tsx Goals tab to single daily goal slider and update import/export
- [x] Update ProgressTracker.tsx to show daily goal progress and round status
- [x] Update ScaleCard.tsx to show round position and total reps
- [x] Update Index.tsx to wire simplified daily goal, celebration, and round cycling
- [x] Update AboutModal.tsx and About.tsx copy
- [x] Run typecheck and linter to verify


## User Feedback
- Default dailyGoal is 10
- No backwards compatibility needed for repetitionsRequired, weeklyGoalRepetitions, cycleDays
- Add daily practice streak counter with clean icon (lucide-react Flame, no raw emojis)

## Summary of Changes
- Simplified goals so the user only selects daily scales to practice (default 10).
- Removed legacy cycleDays, repetitionsRequired, and weeklyGoalRepetitions settings.
- Maintained random scale order that cycles through all active scales without repetition until the full syllabus has been played.
- Added consecutive daily practice streak calculation and indicator with clean Lucide Flame icon.
- Updated ScaleCard to show scale position in cycle and total reps practiced.
- Updated ProgressTracker with daily goal progress bar, streak badge, cycle round info, and queue status per scale.
- Updated Settings Goals tab to a single clean Daily Goal slider with data management.
- Removed obsolete GoalAchievementModal.
- Updated AboutModal and About page text.


## Bug Fix
- Restored missing `Info` and `ExternalLink` imports from `lucide-react` in `Settings.tsx` which caused a runtime ReferenceError when opening settings.
