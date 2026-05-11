/**
 * score-breakdown.ts — Word Snake Score Breakdown System
 * Client-side only module for detailed per-word score analysis.
 * All localStorage operations wrapped in try/catch.
 */

export interface ScoreEntry {
  word: string;
  category: string;
  rarity: string;
  basePoints: number;
  comboMultiplier: number;
  powerUpMultiplier: number;
  difficultyBonus: number;
  totalPoints: number;
  timeToCollect: number;
  timestamp: number;
  position: { x: number; y: number };
}

export interface ScoreBreakdown {
  entries: ScoreEntry[];
  totalBasePoints: number;
  totalComboBonus: number;
  totalPowerUpBonus: number;
  totalDifficultyBonus: number;
  grandTotal: number;
  averageTimeToCollect: number;
  fastestWord: ScoreEntry | null;
  slowestWord: ScoreEntry | null;
  longestCombo: number;
  categoryBreakdown: Record<string, { count: number; points: number }>;
  rarityBreakdown: Record<string, { count: number; points: number }>;
  topWords: ScoreEntry[];
  sessionDuration: number;
}

const STORAGE_PREFIX = 'ws_score_breakdown_';
const RARITY_WEIGHTS: Record<string, number> = { common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5 };
const RATING_THRESHOLDS = [
  { min: 0, rating: 'D' }, { min: 500, rating: 'C' }, { min: 1500, rating: 'B' },
  { min: 3000, rating: 'A' }, { min: 6000, rating: 'S' }, { min: 10000, rating: 'SS' },
] as const;

// --- Core CRUD ---

export function createScoreBreakdown(): ScoreBreakdown {
  return {
    entries: [], totalBasePoints: 0, totalComboBonus: 0, totalPowerUpBonus: 0,
    totalDifficultyBonus: 0, grandTotal: 0, averageTimeToCollect: 0,
    fastestWord: null, slowestWord: null, longestCombo: 0,
    categoryBreakdown: {}, rarityBreakdown: {}, topWords: [], sessionDuration: 0,
  };
}

function recalc(b: ScoreBreakdown): void {
  if (b.entries.length === 0) { Object.assign(b, createScoreBreakdown()); return; }
  b.totalBasePoints = 0; b.totalComboBonus = 0; b.totalPowerUpBonus = 0;
  b.totalDifficultyBonus = 0; b.grandTotal = 0;
  b.categoryBreakdown = {}; b.rarityBreakdown = {};
  b.fastestWord = b.entries[0]; b.slowestWord = b.entries[0];
  for (const e of b.entries) {
    b.totalBasePoints += e.basePoints;
    b.totalComboBonus += e.basePoints * (e.comboMultiplier - 1);
    b.totalPowerUpBonus += e.basePoints * (e.powerUpMultiplier - 1);
    b.totalDifficultyBonus += e.difficultyBonus;
    b.grandTotal += e.totalPoints;
    const cb = b.categoryBreakdown[e.category] ?? { count: 0, points: 0 };
    cb.count++; cb.points += e.totalPoints; b.categoryBreakdown[e.category] = cb;
    const rb = b.rarityBreakdown[e.rarity] ?? { count: 0, points: 0 };
    rb.count++; rb.points += e.totalPoints; b.rarityBreakdown[e.rarity] = rb;
    if (e.timeToCollect < (b.fastestWord?.timeToCollect ?? Infinity)) b.fastestWord = e;
    if (e.timeToCollect > (b.slowestWord?.timeToCollect ?? -1)) b.slowestWord = e;
  }
  b.averageTimeToCollect = b.entries.reduce((s, e) => s + e.timeToCollect, 0) / b.entries.length;
  b.topWords = [...b.entries].sort((a, c) => c.totalPoints - a.totalPoints);
}

export function addScoreEntry(breakdown: ScoreBreakdown, entry: ScoreEntry): ScoreBreakdown {
  breakdown.entries.push(entry);
  if (entry.comboMultiplier > breakdown.longestCombo) breakdown.longestCombo = entry.comboMultiplier;
  if (breakdown.entries.length >= 2) {
    breakdown.sessionDuration = Math.round(
      (breakdown.entries[breakdown.entries.length - 1].timestamp - breakdown.entries[0].timestamp) / 1000,
    );
  }
  recalc(breakdown);
  try { localStorage.setItem(STORAGE_PREFIX + 'current', JSON.stringify(breakdown)); } catch { /* ignore */ }
  return breakdown;
}

export function resetBreakdown(breakdown: ScoreBreakdown): ScoreBreakdown {
  try { localStorage.removeItem(STORAGE_PREFIX + 'current'); } catch { /* ignore */ }
  return Object.assign(breakdown, createScoreBreakdown());
}

// --- Scoring engine ---

export function calculateWordScore(
  word: string, category: string, rarity: string,
  comboCount: number, powerUpsActive: number, difficulty: number, timeToCollect: number,
): Omit<ScoreEntry, 'timestamp' | 'position'> {
  const rarityW = RARITY_WEIGHTS[rarity] ?? 1;
  const basePoints = Math.round(word.length * 10 * rarityW);
  const comboMultiplier = 1 + Math.min(comboCount, 20) * 0.1;
  const powerUpMultiplier = 1 + Math.min(powerUpsActive, 5) * 0.15;
  const difficultyBonus = Math.round(basePoints * difficulty * 0.5);
  const totalPoints = Math.round(basePoints * comboMultiplier * powerUpMultiplier + difficultyBonus);
  return {
    word, category, rarity, basePoints,
    comboMultiplier: Math.round(comboMultiplier * 100) / 100,
    powerUpMultiplier: Math.round(powerUpMultiplier * 100) / 100,
    difficultyBonus, totalPoints, timeToCollect,
  };
}

// --- Analysis helpers ---

export function getBreakdownSummary(breakdown: ScoreBreakdown): string {
  if (breakdown.entries.length === 0) return 'No score data yet.';
  const b = breakdown;
  return [
    `📊 Score Breakdown (${b.entries.length} words)`,
    `Grand Total: ${formatPoints(b.grandTotal)} pts`,
    `Base: ${formatPoints(b.totalBasePoints)} | Combo: +${formatPoints(b.totalComboBonus)} | Power-Up: +${formatPoints(b.totalPowerUpBonus)} | Difficulty: +${formatPoints(b.totalDifficultyBonus)}`,
    `Avg time/word: ${(b.averageTimeToCollect / 1000).toFixed(2)}s | Rating: ${getScoreRating(b.grandTotal)}`,
    b.fastestWord ? `Fastest: "${b.fastestWord.word}" (${b.fastestWord.timeToCollect}ms)` : '',
    b.slowestWord ? `Slowest: "${b.slowestWord.word}" (${b.slowestWord.timeToCollect}ms)` : '',
  ].filter(Boolean).join('\n');
}

export function getTopScoringWords(breakdown: ScoreBreakdown, count: number = 5): ScoreEntry[] {
  return breakdown.topWords.slice(0, count);
}

export function getCategoryContribution(breakdown: ScoreBreakdown): { category: string; points: number; percent: number }[] {
  const total = breakdown.grandTotal || 1;
  return Object.entries(breakdown.categoryBreakdown)
    .map(([category, v]) => ({ category, points: v.points, percent: (v.points / total) * 100 }))
    .sort((a, c) => c.points - a.points);
}

export function getRarityContribution(breakdown: ScoreBreakdown): { rarity: string; points: number; percent: number }[] {
  const total = breakdown.grandTotal || 1;
  return Object.entries(breakdown.rarityBreakdown)
    .map(([rarity, v]) => ({ rarity, points: v.points, percent: (v.points / total) * 100 }))
    .sort((a, c) => c.points - a.points);
}

export function getAverageTimeByCategory(breakdown: ScoreBreakdown): Record<string, number> {
  const acc: Record<string, { total: number; count: number }> = {};
  for (const e of breakdown.entries) {
    const a = acc[e.category] ?? { total: 0, count: 0 };
    a.total += e.timeToCollect; a.count++; acc[e.category] = a;
  }
  const out: Record<string, number> = {};
  for (const [cat, v] of Object.entries(acc)) out[cat] = v.total / v.count;
  return out;
}

export function getTimeEfficiency(breakdown: ScoreBreakdown): number {
  const totalMs = breakdown.entries.reduce((s, e) => s + e.timeToCollect, 0);
  return totalMs === 0 ? 0 : breakdown.grandTotal / (totalMs / 1000);
}

export function getComboAnalysis(breakdown: ScoreBreakdown): {
  avgComboSize: number; maxCombo: number; comboDistribution: Record<number, number>;
} {
  const combos = breakdown.entries.map((e) => Math.round(e.comboMultiplier * 10) - 10);
  const sum = combos.reduce((a, b) => a + b, 0);
  const dist: Record<number, number> = {};
  for (const c of combos) dist[c] = (dist[c] ?? 0) + 1;
  return { avgComboSize: combos.length ? sum / combos.length : 0, maxCombo: breakdown.longestCombo, comboDistribution: dist };
}

export function getScoreDistribution(breakdown: ScoreBreakdown): Record<string, number> {
  const ranges: Record<string, [number, number]> = {
    '0-10': [0, 10], '10-25': [10, 25], '25-50': [25, 50], '50-100': [50, 100], '100+': [100, Infinity],
  };
  const out: Record<string, number> = {};
  for (const [label, [lo, hi]] of Object.entries(ranges))
    out[label] = breakdown.entries.filter((e) => e.totalPoints >= lo && e.totalPoints < hi).length;
  return out;
}

export function compareBreakdowns(a: ScoreBreakdown, b: ScoreBreakdown): {
  total: number; base: number; combo: number; powerUp: number; difficulty: number; timeEff: number;
} {
  const pct = (nv: number, ov: number) => (ov === 0 ? (nv > 0 ? 100 : 0) : ((nv - ov) / ov) * 100);
  return {
    total: pct(b.grandTotal, a.grandTotal), base: pct(b.totalBasePoints, a.totalBasePoints),
    combo: pct(b.totalComboBonus, a.totalComboBonus), powerUp: pct(b.totalPowerUpBonus, a.totalPowerUpBonus),
    difficulty: pct(b.totalDifficultyBonus, a.totalDifficultyBonus),
    timeEff: pct(getTimeEfficiency(b), getTimeEfficiency(a)),
  };
}

export function getSessionScoreRate(breakdown: ScoreBreakdown): number {
  return breakdown.sessionDuration === 0 ? 0 : (breakdown.grandTotal / breakdown.sessionDuration) * 60;
}

// --- Chart.js formatter ---

export function getBreakdownAsChartJS(breakdown: ScoreBreakdown): {
  categoryPie: { labels: string[]; datasets: { data: number[]; backgroundColor: string[] }[] };
  rarityBar: { labels: string[]; datasets: { label: string; data: number[] }[] };
} {
  const palette = ['#4ade80', '#f59e0b', '#3b82f6', '#a855f7', '#ef4444', '#06b6d4'];
  const cat = getCategoryContribution(breakdown);
  const rar = getRarityContribution(breakdown);
  return {
    categoryPie: {
      labels: cat.map((c) => c.category),
      datasets: [{ data: cat.map((c) => c.points), backgroundColor: palette.slice(0, cat.length) }],
    },
    rarityBar: {
      labels: rar.map((r) => r.rarity),
      datasets: [{ label: 'Points', data: rar.map((r) => r.points) }],
    },
  };
}

// --- Formatting utilities ---

export function formatPoints(n: number): string {
  return n.toLocaleString('en-US');
}

export function getScoreRating(totalPoints: number): string {
  let rating = 'D';
  for (const t of RATING_THRESHOLDS) { if (totalPoints >= t.min) rating = t.rating; }
  return rating;
}

// --- Persistence ---

export function loadBreakdown(): ScoreBreakdown {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'current');
    if (raw) return JSON.parse(raw) as ScoreBreakdown;
  } catch { /* corrupted */ }
  return createScoreBreakdown();
}

export function saveBreakdown(breakdown: ScoreBreakdown): void {
  try { localStorage.setItem(STORAGE_PREFIX + 'current', JSON.stringify(breakdown)); } catch { /* quota */ }
}
