---
# scaled-zjlm
title: Fix cycle scale completion counting and cycle boundary resets
status: completed
type: bug
priority: normal
created_at: 2026-09-29T09:57:27Z
updated_at: 2026-09-29T11:16:50Z
---

Fix scale completion tracking so it accurately reflects completions within the active practice cycle, clears when a new cycle begins, and eliminates the hardcoded / 7 lifetime leak.

## Summary of Changes

- Implemented `getScaleCycleCompletions` in `dateUtils.ts` to count only completions within the active cycle window without leaking lifetime rep counts.
- Implemented `getCurrentCycleStartDate` in `dateUtils.ts` for automatic cycle rollover when elapsed days exceed cycle duration.
- Updated `handleStartNewCycle` in `Index.tsx` and automatic cycle sync to clear `scaleProgress.completed` flags so scales start fresh on Day 1.
- Updated `ProgressTracker.tsx` to show cycle completions against cycle target (`0/1`, `1/1`) and filled green progress bars only when completed in the active cycle.
- Updated `ScaleCard.tsx` to show cycle completion status (`0/1`, `1/1`) and all-time plays in tooltips, replacing the hardcoded 7-dot weekly display.
- Corrected the reshuffle toast in `moveToNextScale` to say 'Round Completed' instead of 'Cycle Completed'.

- Added 'Reset Scale Plays' action to Settings Goals tab to allow resetting cycle play counts to 0 without affecting the cycle day, daily goal progress, or practice streaks.
- Replaced fraction displays with exact play counts ('0 plays', '1 play', '2 plays') in ProgressTracker and ScaleCard.

- Restored the 7 cycle dots row in ScaleCard representing the 7-day cycle.
- Restored cycle play counting directly from scale history (from cycleStartDate to today) so actual plays from yesterday and today are immediately reflected and preserved.
- Restored the {cyclePlays}/{cycleDays} display in both ScaleCard and ProgressTracker.
