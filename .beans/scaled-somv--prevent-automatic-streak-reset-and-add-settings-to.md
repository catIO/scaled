---
# scaled-somv
title: Prevent automatic streak reset and add settings toggle and manual reset
status: completed
type: feature
priority: normal
created_at: 2026-09-26T11:00:03Z
updated_at: 2026-09-26T11:06:13Z
---

Update streak behavior so it does not reset automatically. Add option under settings to choose whether to use streak (default on) and an option to reset it with confirmation.

## Tasks
- [x] Update types in practice.ts with useStreak and PracticeStreakState
- [x] Update dateUtils.ts with non-resetting streak calculation and migration helpers
- [x] Update Settings.tsx with useStreak toggle, streak status, and confirmation dialog for manual reset
- [x] Update ProgressTracker.tsx to support useStreak toggle
- [x] Update Index.tsx state management, persistence, import/export, and daily goal completion logic
- [x] Verify build and typechecks

## Summary of Changes

- Updated streak tracking to no longer reset automatically on missed practice days.
- Stored and tracked daily streak explicitly in `scale-practice-streak` with automatic backward-compatible recovery from past daily completion records.
- Added a `useStreak` toggle (default on) under Settings > Goals.
- Added a Current Streak status indicator and a "Reset Streak" button in Settings > Goals.
- Implemented an accessible shadcn/ui confirmation dialog (`AlertDialog`) before resetting the streak counter to 0.
- Updated ProgressTracker to respect the `useStreak` preference.
- Updated backup export and import to preserve the streak value without generating artificial consecutive dates.
