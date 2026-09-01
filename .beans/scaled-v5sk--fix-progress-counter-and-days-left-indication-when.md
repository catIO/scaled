---
# scaled-v5sk
title: Fix progress counter and days left indication when goal or timeline changes
status: completed
type: bug
priority: normal
created_at: 2026-09-01T09:40:10Z
updated_at: 2026-09-01T09:42:58Z
---

Fix stale weeklyGoalRepetitions and day count calculations when scales, repetitions, or cycle duration are updated or reset

## Tasks
- [x] Ensure weeklyGoalRepetitions is always accurately computed from scales and repetitionsRequired across settings, resets, and migrations
- [x] Fix daily target scales-per-day calculation so it dynamically updates when goal or timeline is modified
- [x] Improve elapsed days and remaining days left calculation in dateUtils (accounting for DST and cycle boundary states)
- [x] Clarify day and days-left indication across Index header, ProgressTracker, and Settings modal
- [x] Validate changes with typechecks and build

## Summary of Changes
- Synchronized goal calculations with `scales.length * repetitionsRequired` across settings updates, migrations, resets, and cycle starts.
- Added `getElapsedDays` and enhanced `calculateDailyGoal` in `dateUtils.ts` with DST-safe date math, days-left text, and cycle expiration status.
- Added days-left status indicators in both the main view header (`Day X of Y (Z days left)`) and Settings modal (`Current Cycle`).
- Fixed scale completion state checks to use dynamic `successCount >= repetitionsRequired`.
