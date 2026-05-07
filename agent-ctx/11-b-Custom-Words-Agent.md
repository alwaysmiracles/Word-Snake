# Task 11-b: Custom Words Agent

## Task: Add Custom Word Lists — Allow Players to Add Their Own Words

### Work Completed

1. **Created `src/lib/custom-words.ts`**:
   - `CustomWord` interface with word, category, points
   - Full CRUD: getCustomWords, addCustomWord, removeCustomWord, clearCustomWords
   - Validation: no duplicates (case-insensitive), max 50, 3-15 chars, letters only
   - `calculatePoints()`: auto by length (3-5:5, 6-8:10, 9-12:15, 13-15:20)
   - `getCustomWordsByCategories()`: filter by category set

2. **Modified `src/lib/word-pool.ts`**:
   - Added `CUSTOM_WORD_SPAWN_CHANCE = 0.10`
   - Added `WordPick` interface: `{ word, category, points, isCustom }`
   - Changed `getRandomWordWithCategories()` return type to `WordPick`
   - 10% chance to pick custom words when available and matching categories
   - Added `getWordEntryIncludingCustom()` for eating custom words correctly
   - Added `getTotalWordCount()`

3. **Created `src/components/custom-words-dialog.tsx`**:
   - Dialog with word input, category selector (8 pills), points preview
   - Scrollable custom words list with remove buttons
   - Clear All with confirmation, empty state

4. **Modified `src/components/snake-game.tsx`**:
   - Added `showCustomWords` state
   - "✏️ Words" button with count in both pre-game and post-game button groups
   - Updated `spawnWord()` to use `WordPick` return
   - Updated eating logic to use `getWordEntryIncludingCustom()`
   - Rendered `<CustomWordsDialog>` component

### Key Results
- ESLint passes with zero errors
- Custom words integrate with category filter and spawn at 10% chance
- Full validation and localStorage persistence
