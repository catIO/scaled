---
# scaled-1b0v
title: Reset practice streak automatically when a day is missed
status: completed
type: feature
priority: normal
created_at: 2026-11-15T15:03:46Z
updated_at: 2026-11-15T15:07:02Z
---

Update streak calculation and state management so streaks reset to 0 when a full calendar day is missed without meeting the daily goal, and update streak copy in Settings and About.

## Summary of Changes
- Added `getDayDiff` and updated `calculateDailyStreak` in `src/lib/dateUtils.ts` to count consecutive days meeting `dailyGoal` ending today or yesterday, resetting to 0 if a day is missed.
- Updated `getInitialStreakState` and the streak `useEffect` in `src/pages/Index.tsx` to reset `streak` to 0 when `lastCompletedDate` is more than 1 calendar day before `todayDayKey` (or 1 if today's goal is already met).
- Updated streak descriptions in `src/components/Settings.tsx` and `src/pages/About.tsx`.
- Verified with `npx tsc --noEmit`, `npx eslint` on modified files, and `npm run build`.
