---
# scaled-ggzb
title: Configure cycle target plays to 6 and remove buffer day lockout for 7-day practice
status: completed
type: feature
priority: normal
created_at: 2026-10-18T10:51:26Z
updated_at: 2026-10-18T10:57:50Z
---

Adjust cycle target completions per scale to 6 plays (6 rounds) so that 15 scales/day across 7 days leaves 3 plays on Day 7 to complete all scales, and remove automatic Buffer & Rest Day lockout so Day 7 is a normal practice day.

## Summary of Changes
- Added `targetPlays` setting (default: 6) to `PracticeSettings` and `DEFAULT_SETTINGS`, configurable in Settings Goals tab.
- Updated `ScaleCard` and `ProgressTracker` to evaluate completion and fractions against `targetPlays` (e.g. `5/6`, `6/6`) instead of hardcoding `cycleDays`.
- Removed the automatic Day 7 Buffer & Rest Day lockout so Day 7 remains an active practice day to play regular scales and finish remaining target plays.
- Updated `isCycleBufferDay` to false and updated decline toast messages to queue for review without buffer day references.
- Verified production build successfully.
