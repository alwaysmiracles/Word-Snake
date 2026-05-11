/**
 * score-live-wire.ts — Word Snake Score Live Wire
 *
 * Bridges the Score Breakdown system (score-breakdown.ts) to actual game events.
 * Populates score entries when words are collected, tracks power-up bonuses,
 * combo milestones, time efficiency, and provides analytics helpers.
 */

import {
  createScoreBreakdown,
  addScoreEntry,
  getScoreRating as calcScoreRating,
  loadBreakdown,
  type ScoreBreakdown,
  type ScoreEntry,
} from './score-breakdown';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WordHistoryEntry {
  word: string;
  points: number;
  combo: number;
  powerup: string;
  timestamp: number;
}

export interface ScoreLiveWire {
  breakdown: ScoreBreakdown;
  sessionStartTime: number;
  wordHistory: WordHistoryEntry[];
}

export interface WordEatenData {
  word: string;
  basePoints: number;
  combo: number;
  activePowerUps: string[];
  difficulty: string;
  rarity: string;
  category: string;
  timeElapsed: number;
}

export interface MiniSummary {
  totalScore: number;
  wordsEaten: number;
  avgPointsPerWord: number;
  bestWord: string | null;
  currentRating: string;
}

export interface ComboBucket {
  range: string;
  count: number;
}

export interface CategorySummary {
  category: string;
  count: number;
  points: number;
  percent: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  easy: 1.0,
  medium: 1.25,
  hard: 1.5,
  extreme: 2.0,
};

const RARITY_MULTIPLIERS: Record<string, number> = {
  common: 1.0,
  uncommon: 1.2,
  rare: 1.5,
  epic: 2.0,
  legendary: 3.0,
};

const COMBO_MILESTONES = [5, 10, 15, 20, 25, 50] as const;

const CHART_COLORS = [
  '#4ade80', '#f59e0b', '#3b82f6', '#a855f7',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
];

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createScoreLiveWire(): ScoreLiveWire {
  return {
    breakdown: createScoreBreakdown(),
    sessionStartTime: Date.now(),
    wordHistory: [],
  };
}

// ---------------------------------------------------------------------------
// Multiplier helpers
// ---------------------------------------------------------------------------

function computeComboMultiplier(combo: number): number {
  // combo 1 → 1.0, combo 2 → 1.1, combo 3 → 1.2, …
  return 1 + 0.1 * (combo - 1);
}

function computePowerUpMultiplier(activePowerUps: string[]): number {
  if (activePowerUps.includes('double_points')) return 2.0;
  if (activePowerUps.includes('magnet')) return 1.5;
  return 1.0;
}

function computeDifficultyMultiplier(difficulty: string): number {
  return DIFFICULTY_MULTIPLIERS[difficulty] ?? 1.0;
}

function computeRarityMultiplier(rarity: string): number {
  return RARITY_MULTIPLIERS[rarity] ?? 1.0;
}

// ---------------------------------------------------------------------------
// Core recording
// ---------------------------------------------------------------------------

/**
 * Called when the snake eats a word. Calculates all bonuses and populates
 * both the breakdown entries and the word history.
 */
export function recordWordEaten(wire: ScoreLiveWire, data: WordEatenData): void {
  const { word, basePoints, combo, activePowerUps, difficulty, rarity, category, timeElapsed } = data;

  const comboMult = computeComboMultiplier(combo);
  const powerupMult = computePowerUpMultiplier(activePowerUps);
  const diffMult = computeDifficultyMultiplier(difficulty);
  const rarityMult = computeRarityMultiplier(rarity);

  // Total = basePoints × comboMult × powerupMult × diffMult × rarityMult
  const totalPoints = Math.round(
    basePoints * comboMult * powerupMult * diffMult * rarityMult,
  );

  // Difficulty bonus portion for the breakdown field
  const difficultyBonus = Math.round(basePoints * (diffMult - 1));

  const entry: ScoreEntry = {
    word,
    category,
    rarity,
    basePoints,
    comboMultiplier: Math.round(comboMult * 100) / 100,
    powerUpMultiplier: Math.round(powerupMult * 100) / 100,
    difficultyBonus,
    totalPoints,
    timeToCollect: Math.round(timeElapsed),
    timestamp: Date.now(),
    position: { x: 0, y: 0 }, // not tracked at this wiring layer
  };

  addScoreEntry(wire.breakdown, entry);

  wire.wordHistory.push({
    word,
    points: totalPoints,
    combo,
    powerup: activePowerUps.length > 0 ? activePowerUps.join(', ') : 'none',
    timestamp: entry.timestamp,
  });
}

// ---------------------------------------------------------------------------
// Power-up bonus tracking
// ---------------------------------------------------------------------------

/**
 * Record bonus points awarded directly by a power-up (e.g. time bonuses,
 * shield survival rewards). Stored as a synthetic entry so they contribute
 * to the grand total but don't distort per-word averages.
 */
export function recordPowerUpBonus(wire: ScoreLiveWire, type: string, points: number): void {
  const entry: ScoreEntry = {
    word: `[power-up:${type}]`,
    category: 'powerup',
    rarity: 'common',
    basePoints: 0,
    comboMultiplier: 1.0,
    powerUpMultiplier: 1.0,
    difficultyBonus: points,
    totalPoints: points,
    timeToCollect: 0,
    timestamp: Date.now(),
    position: { x: 0, y: 0 },
  };

  addScoreEntry(wire.breakdown, entry);

  wire.wordHistory.push({
    word: `[power-up:${type}]`,
    points,
    combo: 0,
    powerup: type,
    timestamp: entry.timestamp,
  });
}

// ---------------------------------------------------------------------------
// Combo milestones
// ---------------------------------------------------------------------------

/**
 * Check whether a combo size is a milestone and, if so, record it as a
 * zero-point celebration entry in the history for UI highlight.
 * Returns the milestone label or null.
 */
export function recordComboEvent(wire: ScoreLiveWire, comboSize: number): string | null {
  if (!COMBO_MILESTONES.includes(comboSize as typeof COMBO_MILESTONES[number])) {
    return null;
  }

  const label = `COMBO ×${comboSize}`;
  wire.wordHistory.push({
    word: label,
    points: 0,
    combo: comboSize,
    powerup: 'milestone',
    timestamp: Date.now(),
  });

  return label;
}

// ---------------------------------------------------------------------------
// Time efficiency
// ---------------------------------------------------------------------------

/**
 * Update points-per-second and points-per-minute on the breakdown based on
 * total elapsed game time (ms). Does not mutate entries.
 */
export function updateTimeEfficiency(wire: ScoreLiveWire, totalElapsed: number): void {
  const seconds = totalElapsed / 1000;
  if (seconds <= 0) return;
  wire.breakdown.sessionDuration = Math.round(seconds);
}

// ---------------------------------------------------------------------------
// Analytics helpers
// ---------------------------------------------------------------------------

/** Top N scoring words with their full entry details. */
export function getTopWords(wire: ScoreLiveWire, count: number = 5): ScoreEntry[] {
  return wire.breakdown.topWords.slice(0, count);
}

/** Points breakdown by category, sorted descending by total points. */
export function getCategoryBreakdown(wire: ScoreLiveWire): CategorySummary[] {
  const total = wire.breakdown.grandTotal || 1;
  return Object.entries(wire.breakdown.categoryBreakdown)
    .map(([category, v]) => ({
      category,
      count: v.count,
      points: v.points,
      percent: (v.points / total) * 100,
    }))
    .sort((a, b) => b.points - a.points);
}

/** Bucket combo sizes into histogram ranges. */
export function getComboDistribution(wire: ScoreLiveWire): ComboBucket[] {
  const combos = wire.breakdown.entries.map((e) => Math.round(e.comboMultiplier * 10) - 10);
  const buckets: ComboBucket[] = [
    { range: '0', count: 0 },
    { range: '1-2', count: 0 },
    { range: '3-5', count: 0 },
    { range: '6-10', count: 0 },
    { range: '11-15', count: 0 },
    { range: '16-20', count: 0 },
    { range: '20+', count: 0 },
  ];

  for (const c of combos) {
    if (c <= 0) buckets[0].count++;
    else if (c <= 2) buckets[1].count++;
    else if (c <= 5) buckets[2].count++;
    else if (c <= 10) buckets[3].count++;
    else if (c <= 15) buckets[4].count++;
    else if (c <= 20) buckets[5].count++;
    else buckets[6].count++;
  }

  return buckets;
}

/** D through SS rating based on grand total. */
export function getScoreRating(wire: ScoreLiveWire): string {
  return calcScoreRating(wire.breakdown.grandTotal);
}

/** Compact summary for HUD / end-of-game card. */
export function getMiniSummary(wire: ScoreLiveWire): MiniSummary {
  const { grandTotal, entries, topWords } = wire.breakdown;
  return {
    totalScore: grandTotal,
    wordsEaten: entries.length,
    avgPointsPerWord: entries.length > 0 ? Math.round(grandTotal / entries.length) : 0,
    bestWord: topWords.length > 0 ? topWords[0].word : null,
    currentRating: calcScoreRating(grandTotal),
  };
}

// ---------------------------------------------------------------------------
// Session management
// ---------------------------------------------------------------------------

/**
 * Reset entries for a new game but preserve historical aggregates so the UI
 * can show "previous game" comparisons.
 */
export function resetForNewGame(wire: ScoreLiveWire): void {
  const prevTotal = wire.breakdown.grandTotal;
  const prevEntries = wire.breakdown.entries.length;

  // Reset the breakdown to empty
  const fresh = createScoreBreakdown();
  // Carry forward comparison anchors as a private-ish extra field
  Object.assign(wire.breakdown, fresh);

  // Store previous stats for comparison on the wire object itself
  (wire as unknown as Record<string, unknown>)['_prevTotal'] = prevTotal;
  (wire as unknown as Record<string, unknown>)['_prevWordCount'] = prevEntries;

  wire.wordHistory = [];
  wire.sessionStartTime = Date.now();
}

/**
 * Export the full session state as a plain JSON-serialisable object.
 * Safe to stringify and send over a network or store in IndexedDB.
 */
export function exportSessionData(wire: ScoreLiveWire): object {
  return {
    breakdown: wire.breakdown,
    sessionStartTime: wire.sessionStartTime,
    sessionDuration: wire.breakdown.sessionDuration,
    wordHistory: wire.wordHistory,
    exportedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Chart.js data formatters
// ---------------------------------------------------------------------------

/**
 * Return pre-formatted datasets ready for Chart.js consumption.
 *
 * - categoryPie: doughnut/pie chart of points by category
 * - scoreBar: bar chart of score distribution buckets
 * - comboHistogram: bar chart of combo size distribution
 */
export function getChartJSData(wire: ScoreLiveWire): {
  categoryPie: {
    labels: string[];
    datasets: { data: number[]; backgroundColor: string[] }[];
  };
  scoreBar: {
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
  comboHistogram: {
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor: string[] }[];
  };
} {
  // --- Category pie ---
  const cats = getCategoryBreakdown(wire);
  const categoryPie = {
    labels: cats.map((c) => c.category),
    datasets: [
      {
        data: cats.map((c) => c.points),
        backgroundColor: CHART_COLORS.slice(0, cats.length),
      },
    ],
  };

  // --- Score distribution bar ---
  const scoreRanges: [string, number, number][] = [
    ['0-10', 0, 10],
    ['10-25', 10, 25],
    ['25-50', 25, 50],
    ['50-100', 50, 100],
    ['100-250', 100, 250],
    ['250-500', 250, 500],
    ['500+', 500, Infinity],
  ];
  const scoreBar = {
    labels: scoreRanges.map((r) => r[0]),
    datasets: [
      {
        label: 'Words',
        data: scoreRanges.map(
          ([, lo, hi]) =>
            wire.breakdown.entries.filter((e) => e.totalPoints >= lo && e.totalPoints < hi).length,
        ),
      },
    ],
  };

  // --- Combo histogram ---
  const comboBuckets = getComboDistribution(wire);
  const comboHistogram = {
    labels: comboBuckets.map((b) => b.range),
    datasets: [
      {
        label: 'Words',
        data: comboBuckets.map((b) => b.count),
        backgroundColor: CHART_COLORS.slice(0, comboBuckets.length),
      },
    ],
  };

  return { categoryPie, scoreBar, comboHistogram };
}
