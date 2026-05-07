# Task 3-a: Add Word Category Filter in the Snake Game

## Agent: Category Filter Agent

## Summary
Successfully implemented the Word Category Filter feature for the Snake Game.

## Changes Made

### `src/lib/word-pool.ts`
- Added `getRandomWordWithCategories(exclude, categories?)` — spawns words only from active categories, with fallback to full pool if no words available
- Added `getWordCountByCategory(category)` — returns word count per category for display

### `src/components/snake-game.tsx`
- Changed `activeCategory: WordCategory | 'all'` → `activeCategories: Set<WordCategory>` in both `GameState` and `uiState`
- Updated `spawnWord()` to call `getRandomWordWithCategories()` with active category filter
- Added `ALL_CATEGORIES` constant, `loadActiveCategories()`, `saveActiveCategories()` helpers
- Added `toggleCategory()` — toggles individual category, prevents deselecting all (minimum 1 active)
- Added `toggleAllCategories()` — toggles between all selected and single category
- Added `CATEGORY_BG_CLASSES` — per-category active state styling map
- Added Category Filter UI (visible before game start / after game over):
  - Filter icon + "Categories:" label + "All" toggle button
  - Pill/chip style buttons with colored dots, labels, and word counts
  - Active: category-colored bg/border/text; Inactive: dimmed slate styling
  - Smooth 200ms transition animations
- Imported `Filter` icon from lucide-react
- localStorage persistence via key `word-snake-categories`

## Verification
- ESLint passes with no errors
- Dev server compiles successfully
