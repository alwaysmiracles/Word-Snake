# Task 9-c: Poem Sharing Agent

## Task: Add Poem Sharing Feature to Word Snake Game

## Work Completed

### Files Created
- `src/lib/poem-share.ts` — Poem sharing utilities (generateShareImage, sharePoem, downloadShareImage)

### Files Modified
- `src/components/make-poem.tsx` — Added Share button to current poem result and poem history cards

## Key Details

### generateShareImage(poem, style, usedWords)
- Generates a 1080×1080 PNG (Instagram-friendly square)
- Background: Deep purple → dark blue → dark purple gradient
- Decorative elements: constellation dots, radial glow, thin border with rounded corners, corner ✦ ornaments
- Title: "✨ Word Snake Poem" + style label
- Poem: center-aligned, serif italic, auto-wrapped at ~40 chars
- Used words: "Words woven in:" label with comma-separated list
- Watermark: "word-snake.game" at bottom with subtle opacity
- Returns Blob

### sharePoem(blob)
- Tries navigator.share() first (Web Share API)
- Falls back to downloading the image

### downloadShareImage(blob, filename?)
- Downloads via object URL

### UI Changes
- Added `Share` icon import from lucide-react
- Added `sharingId` state for loading tracking
- Added `handleSharePoem()` handler
- Share button on current poem result (next to Copy/Save/Download)
- Share button on poem history cards (hover, next to Heart/Copy)
- Both show Loader2 spinner while generating

## ESLint
- Zero errors
