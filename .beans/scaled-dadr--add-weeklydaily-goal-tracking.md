---
# scaled-dadr
title: Add weekly/daily goal tracking
status: completed
type: feature
priority: normal
created_at: 2026-07-24T13:57:33Z
updated_at: 2026-07-24T14:32:06Z
---

Implement weekly goal pacing with Monday-based week starts, add goal options to settings, move confetti trigger to daily pace completion, and keep practice flow running beyond target completion.

## Summary of Changes
- Added weekly goal settings to practice configuration: total weekly repetitions and week start day.
- Added goal controls in Settings with suggested weekly target and daily pace preview.
- Updated progress tracking to use weekly completed reps against weekly goal in the existing progress areas.
- Added daily pace calculation and once-per-day confetti when cumulative progress reaches the expected pace for the current day.
- Removed the completion gate so practice can continue even after per-scale repetition thresholds are reached.

## Consolidated Feature Summary\n- Implemented weekly and daily goal tracking around scale practice with Monday-first week support.\n- Daily progress now tracks completed scales today against the inferred daily target, with once-per-day confetti when the daily target is met.\n- Weekly goal is now inferred automatically from scales x repetitions per scale to prevent manual goal drift.\n- Updated progress language and rounding to show user-friendly whole-number targets and remaining counts.\n- Removed completion gating so users can continue practicing after hitting repetition thresholds.\n- Reorganized Settings into three tabs: Scales, Goals, and Finger Patterns.\n- Moved Data Management controls into the Goals tab.\n- Added direct edit-scales flow from the progress panel (tooltip + opens Settings on Scales tab).\n- Added About page with usage instructions and external Practice Mate link.\n- Added footer links outside the app card at the bottom of the page and refined related copy.
