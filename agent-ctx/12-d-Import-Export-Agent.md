# Task 12-d: Custom Word Import/Export Feature

## Work Summary

Added bulk import/export functionality for custom words via JSON and CSV formats.

## Files Modified

1. **`src/lib/custom-words.ts`** — Added 6 new functions:
   - `exportCustomWordsJSON()`: Pretty-printed JSON export
   - `importCustomWordsJSON(jsonString)`: Parse and import JSON array
   - `exportCustomWordsCSV()`: CSV export with header row
   - `importCustomWordsCSV(csvString)`: Parse and import CSV with quoted-field handling
   - `generateSampleJSON()`: Sample JSON template
   - `generateSampleCSV()`: Sample CSV template
   - Helper: `parseCSVLine()` for RFC 4180 CSV parsing
   - Constant: `VALID_CATEGORIES` for import validation

2. **`src/components/custom-words-dialog.tsx`** — Added Import/Export UI:
   - Export JSON/CSV buttons (disabled when empty)
   - Import section with format radio buttons, textarea, import button
   - Inline import results with imported/skipped counts and scrollable error list
   - Sample download links for JSON and CSV templates
   - File download via Blob + URL.createObjectURL

## Validation
- Same rules as `addCustomWord`: 3-15 chars, letters only, max 50 words, no duplicates
- Points auto-calculated from word length if not provided or invalid
- CSV handles quoted fields and auto-detects header rows
- ESLint passes with zero errors
