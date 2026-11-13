---
# scaled-755q
title: Calculate cycle target from daily goal and cycle days with remainder distribution
status: completed
type: feature
priority: normal
created_at: 2026-11-13T10:22:44Z
updated_at: 2026-11-13T10:24:09Z
---

Derive per-scale cycle target automatically from (dailyGoal * cycleDays) / totalScales, distributing any remainder (+1 play) to the first N scales, and make Cycle Target read-only in Settings.

## Summary of Changes
- Added `calculateCycleTargetSummary` and `getScaleCycleTarget` in `src/lib/dateUtils.ts` to compute per-scale cycle targets from `(dailyGoal * cycleDays) / totalScales` and distribute any remainder (+1 play) to the first `remainder` scales.
- Updated `src/components/ProgressTracker.tsx` and `src/pages/Index.tsx` (`ScaleCard`) to use `getScaleCycleTarget` per scale index.
- Replaced the editable Cycle Target input in `src/components/Settings.tsx` with a read-only derived card displaying the calculated target range and breakdown.
- Verified with `npx tsc --noEmit`, `npx eslint` on modified files, and `npm run build`.
