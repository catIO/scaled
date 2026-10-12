---
# scaled-gfsn
title: Distribute scales evenly across practice cycle with buffer day and failed scale review
status: completed
type: feature
priority: normal
created_at: 2026-10-12T11:15:03Z
updated_at: 2026-10-12T11:29:30Z
---

Ensure all scales are distributed evenly across cycle days using ceiling pacing with a buffer/review day, and handle failed scales via same-day requeue and buffer-day review pool.


## Todo
- [x] Implement cycle pacing helper functions (ceiling daily goal calculation, buffer day detection, review pool tracking)
- [x] Add settings option/auto-sync for daily goal derived from total scales and cycle days
- [x] Implement same-day retry and cycle review pool tracking for declined/failed scales
- [x] Implement buffer/review day mode on final cycle day
- [x] Update UI copy and badges for cycle status, buffer day, and review mode
- [x] Verify build, types, and functionality


## Summary of Changes
- Added cycle pacing calculations (`calculatePacedDailyGoal` and `isCycleBufferDay`) in `dateUtils.ts` reserving the final cycle day as a Buffer & Review Day.
- Added `autoDailyGoal` setting and auto-sync in `Settings.tsx` and `Index.tsx` so daily target automatically calculates as `Math.ceil(scales.length / (cycleDays - 1))`.
- Implemented same-day retry: first time a scale is declined, it re-queues at the end of today's remaining session.
- Implemented cycle review pool: if declined a second time (or unmastered), it saves to `reviewPool` for dedicated review on Buffer Day.
- Implemented Buffer Day review mode on Day D: automatically serves queued review scales with 'Buffer Review' badges, or displays a Cycle Complete celebration card when all scales have zero pending reviews.
- Added 'Review' badge in ProgressTracker and retry/review badges in ScaleCard without raw emojis.
- Verified with TypeScript type checks and production Vite builds.
