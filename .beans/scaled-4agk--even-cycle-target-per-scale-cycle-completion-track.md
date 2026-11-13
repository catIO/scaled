---
# scaled-4agk
title: Even cycle target per scale, cycle completion tracking, and cycle success modal
status: completed
type: feature
priority: normal
created_at: 2026-11-13T10:39:21Z
updated_at: 2026-11-13T10:40:46Z
---

Remove Cycle Target card from Settings, round up per-scale target evenly across all scales, replace round counter with cycle completion progress in ProgressTracker, and show a Cycle Complete success modal when all scales meet their cycle target.

## Summary of Changes
- Updated `calculateCycleTargetSummary` and `getScaleCycleTarget` in `src/lib/dateUtils.ts` to round up evenly across all scales (`Math.max(1, Math.ceil((dailyGoal * cycleDays) / totalScales))`).
- Removed the Cycle Target card from `src/components/Settings.tsx` so Goals only configures Daily Goal and Practice Cycle.
- Replaced the round/scale counter in `src/components/ProgressTracker.tsx` with a Cycle Progress bar showing completed scales and capped cycle plays toward the cycle total.
- Added a Cycle Complete success modal (`Dialog`) with confetti in `src/pages/Index.tsx` when all scales reach their cycle target, with Continue Practicing and Start New Cycle actions.
- Verified with `npx tsc --noEmit`, `npx eslint` on modified files, and `npm run build`.
