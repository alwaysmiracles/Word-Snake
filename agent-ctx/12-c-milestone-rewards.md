# Task 12-c: Achievement Milestone Rewards

## Summary
Added a complete milestone rewards system that grants gameplay bonuses when players reach achievement completion thresholds (25%, 50%, 75%, 100%).

## Files Created
- `src/lib/achievement-milestones.ts` — Milestone config, check functions, bonus getters, localStorage persistence

## Files Modified
- `src/components/achievement-gallery.tsx` — Added milestone tier display section with progress indicators
- `src/components/snake-game.tsx` — Applied milestone bonuses in gameplay + celebration toast

## Milestone Tiers
| Tier | Threshold | Name | Bonus |
|------|-----------|------|-------|
| Bronze 🥉 | 3/11 (25%) | Apprentice Wordsmith | +5 points per word |
| Silver 🥈 | 6/11 (50%) | Journeyman Poet | 1 extra life per game |
| Gold 🥇 | 9/11 (75%) | Master Lexicon | 2× power-up spawn rate |
| Platinum 💎 | 11/11 (100%) | Legendary Scribe | Golden sparkle particle trail |

## Implementation Details
- All milestone unlocks persisted in localStorage (`word-snake-milestones`)
- Milestones checked after eating a word and on game over
- Extra life from Silver consumed once per game (tracked via `extraLifeAvailable` in GameState)
- Bronze bonus applied before all multipliers (stacks with combo, weather, streak, power-ups)
- Gold bonus multiplies the base POWERUP_SPAWN_CHANCE
- Platinum bonus spawns golden particles each draw frame behind snake head
- Special golden toast notification appears when milestones unlock
- Gallery shows 4 milestone cards with lock/unlock state and progress bars
