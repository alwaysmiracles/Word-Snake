# Task 12-a: Snake Skin Preview on Start Screen Canvas

## Agent: Snake Skin Preview Agent

## Summary
Added an animated snake skin preview to the start screen canvas, so players can see what their selected skin looks like before starting the game.

## Changes Made

### `src/components/snake-game.tsx`
- Rewrote the start screen section in the `draw()` function (lines ~1192-1425)
- Changed from fully-centered layout to two-column layout:
  - **Left column** (33% width): Title, subtitle, category legend (2 cols), rarity legend, weather info, streak bonus
  - **Right column** (72% center): Animated snake skin preview with skin name/description
  - **Bottom strip**: Controls and "Press to start" prompt
- **Animated preview snake**:
  - 10 segments in S-curve pattern using sine wave math
  - Uses `Date.now()` for smooth animation (primary wave at time/1200, micro-wave at time/800)
  - Same rendering logic as in-game snake: headColor, bodyGradient, eyeColor, all 5 patterns
  - Head eyes track direction toward next segment via `Math.atan2()`
  - Glow effect behind snake (6% opacity)
  - Connector segments between adjacent body segments (except dotted pattern)
- **Skin name display**: Skin name in headColor (bold 14px) + description in gray (10px) below preview
- **Instant update**: Reads `gs.activeSkin` every frame, so skin selector changes are immediately reflected

### No changes to `src/lib/snake-skins.ts`
- Existing skin data structure was sufficient for all preview needs

## Verification
- ESLint passes with zero errors
- Dev server compiles successfully
- Preview only shows on start screen (not during gameplay or game over)
