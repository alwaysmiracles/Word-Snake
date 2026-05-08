/**
 * Word Mastery Tracker — Client-side only module for Word Snake.
 * Tracks per-word encounter history and computes mastery levels
 * from 'new' up through 'legendary' based on cumulative encounters.
 * Persistence via localStorage with key prefix 'ws_mastery_'.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type MasteryLevel = 'new' | 'seen' | 'learning' | 'familiar' | 'mastered' | 'legendary';

export interface WordMastery {
  word: string;
  category: string;
  encounters: number;
  collected: number;
  missed: number;
  firstSeenAt: number;
  lastSeenAt: number;
  lastCollectedAt: number | null;
  totalScoreFromWord: number;
  masteryLevel: MasteryLevel;
  streak: number;
  bestStreak: number;
}

export interface MasteryProgress {
  current: number;
  needed: number;
  percent: number;
  currentLevel: MasteryLevel;
  nextLevel: MasteryLevel | null;
}

export interface MasteryStats {
  totalWords: number;
  masteredCount: number;
  legendaryCount: number;
  averageMastery: number;
  totalEncounters: number;
  collectionRate: number;
  categoryMastery: Record<string, { total: number; mastered: number; avgLevel: number }>;
  weakestWords: WordMastery[];
  strongestWords: WordMastery[];
  recentProgress: { word: string; level: MasteryLevel; timestamp: number }[];
}

// ── Constants ───────────────────────────────────────────────────────────────

export const MASTERY_THRESHOLDS: Record<MasteryLevel, number> = {
  new: 0, seen: 1, learning: 3, familiar: 8, mastered: 15, legendary: 30,
};
const LEVEL_ORDER: MasteryLevel[] = ['new', 'seen', 'learning', 'familiar', 'mastered', 'legendary'];

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  new: '#6b7280', seen: '#3b82f6', learning: '#8b5cf6',
  familiar: '#f59e0b', mastered: '#10b981', legendary: '#f97316',
};

export const MASTERY_EMOJIS: Record<MasteryLevel, string> = {
  new: '\u2B1C', seen: '\uD83D\uDD35', learning: '\uD83D\uDFE3',
  familiar: '\uD83D\uDFE1', mastered: '\uD83D\uDFE2', legendary: '\uD83D\uDD25',
};

const DISPLAY_NAMES: Record<MasteryLevel, string> = {
  new: 'New', seen: 'Seen', learning: 'Learning',
  familiar: 'Familiar', mastered: 'Mastered', legendary: 'Legendary',
};
const WEIGHT: Record<MasteryLevel, number> = {
  new: 0, seen: 1, learning: 2, familiar: 3, mastered: 4, legendary: 5,
};

// ── Storage helpers ─────────────────────────────────────────────────────────

const STORE_KEY = 'ws_mastery_data';
const UPS_KEY = 'ws_mastery_levelups';
let cache: Map<string, WordMastery> | null = null;

function loadCache(): Map<string, WordMastery> {
  if (cache) return cache;
  cache = new Map<string, WordMastery>();
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORE_KEY) : null;
    if (raw) for (const m of JSON.parse(raw) as WordMastery[]) cache.set(m.word, m);
  } catch { /* ignore */ }
  return cache;
}

function persist(): void {
  try {
    if (cache) localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(cache.values())));
  } catch { /* ignore quota errors */ }
}

function loadUps(): { word: string; level: MasteryLevel; timestamp: number }[] {
  try {
    const r = typeof window !== 'undefined' ? localStorage.getItem(UPS_KEY) : null;
    return r ? JSON.parse(r) : [];
  } catch { return []; }
}

function persistUps(ups: { word: string; level: MasteryLevel; timestamp: number }[]): void {
  try { localStorage.setItem(UPS_KEY, JSON.stringify(ups)); } catch { /* ignore */ }
}

// ── Internal helpers ────────────────────────────────────────────────────────

function computeLevel(encounters: number): MasteryLevel {
  let level: MasteryLevel = 'new';
  for (const lv of LEVEL_ORDER) if (encounters >= MASTERY_THRESHOLDS[lv]) level = lv;
  return level;
}

function fresh(word: string, category: string): WordMastery {
  const now = Date.now();
  return { word, category, encounters: 0, collected: 0, missed: 0, firstSeenAt: now,
    lastSeenAt: now, lastCollectedAt: null, totalScoreFromWord: 0,
    masteryLevel: 'new', streak: 0, bestStreak: 0 };
}

// ── Core API ────────────────────────────────────────────────────────────────

/** Record an encounter (collected = eaten, missed = passed). Auto-updates level. */
export function recordEncounter(word: string, category: string, collected: boolean, score = 0): WordMastery {
  const c = loadCache();
  const m = c.get(word) ?? fresh(word, category);
  const now = Date.now();
  m.encounters += 1;
  m.lastSeenAt = now;
  if (collected) {
    m.collected += 1;
    m.lastCollectedAt = now;
    if (++m.streak > m.bestStreak) m.bestStreak = m.streak;
  } else { m.missed += 1; m.streak = 0; }
  m.totalScoreFromWord += score;
  const prev = m.masteryLevel;
  m.masteryLevel = computeLevel(m.encounters);
  c.set(word, m);
  persist();
  if (m.masteryLevel !== prev) {
    const ups = loadUps();
    ups.push({ word, level: m.masteryLevel, timestamp: now });
    if (ups.length > 200) ups.splice(0, ups.length - 200);
    persistUps(ups);
  }
  return m;
}

/** Get full mastery data for a word, or undefined. */
export function getMastery(word: string): WordMastery | undefined {
  return loadCache().get(word);
}

/** Quick helper — returns just the mastery level for a word. */
export function getMasteryLevel(word: string): MasteryLevel {
  return loadCache().get(word)?.masteryLevel ?? 'new';
}

/** Get all tracked word masteries. */
export function getAllMasteries(): WordMastery[] {
  return Array.from(loadCache().values());
}

/** Get all words at a given mastery level. */
export function getWordsByLevel(level: MasteryLevel): WordMastery[] {
  return getAllMasteries().filter((m) => m.masteryLevel === level);
}

/** Reset mastery for one word, or all when no word given. */
export function resetMastery(word?: string): void {
  const c = loadCache();
  if (word) c.delete(word); else { c.clear(); cache = null; }
  persist();
}

// ── Analytics ───────────────────────────────────────────────────────────────

/** Compute aggregate mastery stats across all tracked words. */
export function getMasteryStats(): MasteryStats {
  const all = getAllMasteries();
  const total = all.length;
  if (total === 0) return { totalWords: 0, masteredCount: 0, legendaryCount: 0, averageMastery: 0,
    totalEncounters: 0, collectionRate: 0, categoryMastery: {},
    weakestWords: [], strongestWords: [], recentProgress: loadUps().slice(-10) };

  let totalEnc = 0, totalCol = 0, sumW = 0, masteredCount = 0, legendaryCount = 0;
  const cats = new Map<string, { total: number; mastered: number; wSum: number }>();

  for (const m of all) {
    totalEnc += m.encounters; totalCol += m.collected; sumW += WEIGHT[m.masteryLevel];
    if (m.masteryLevel === 'mastered') masteredCount++;
    if (m.masteryLevel === 'legendary') legendaryCount++;
    const cat = cats.get(m.category) ?? { total: 0, mastered: 0, wSum: 0 };
    cat.total++; cat.wSum += WEIGHT[m.masteryLevel];
    if (m.masteryLevel === 'mastered' || m.masteryLevel === 'legendary') cat.mastered++;
    cats.set(m.category, cat);
  }

  const categoryMastery: MasteryStats['categoryMastery'] = {};
  cats.forEach((d, name) => { categoryMastery[name] = { total: d.total, mastered: d.mastered, avgLevel: d.wSum / d.total }; });

  const sorted = [...all].sort((a, b) => WEIGHT[a.masteryLevel] - WEIGHT[b.masteryLevel]);
  return { totalWords: total, masteredCount, legendaryCount, averageMastery: sumW / total,
    totalEncounters: totalEnc, collectionRate: totalEnc > 0 ? totalCol / totalEnc : 0,
    categoryMastery, weakestWords: sorted.slice(0, 10), strongestWords: sorted.slice(-10).reverse(),
    recentProgress: loadUps().slice(-10) };
}

/** Words with the lowest mastery — most need practice. */
export function getWeakestWords(count = 10): WordMastery[] {
  return getAllMasteries().sort((a, b) => WEIGHT[a.masteryLevel] - WEIGHT[b.masteryLevel]).slice(0, count);
}

/** Words with the highest mastery. */
export function getStrongestWords(count = 10): WordMastery[] {
  return getAllMasteries().sort((a, b) => WEIGHT[b.masteryLevel] - WEIGHT[a.masteryLevel]).slice(0, count);
}

/** Progress info for a single word toward the next level. */
export function getMasteryProgress(word: string): MasteryProgress {
  const m = loadCache().get(word);
  const enc = m?.encounters ?? 0;
  const currentLevel = computeLevel(enc);
  const idx = LEVEL_ORDER.indexOf(currentLevel);
  if (idx >= LEVEL_ORDER.length - 1) return { current: enc, needed: 0, percent: 100, currentLevel, nextLevel: null };

  const next = LEVEL_ORDER[idx + 1];
  const lo = MASTERY_THRESHOLDS[currentLevel];
  const hi = MASTERY_THRESHOLDS[next];
  const pct = Math.round(Math.min(100, Math.max(0, ((enc - lo) / (hi - lo)) * 100)));
  return { current: enc, needed: hi, percent: pct, currentLevel, nextLevel: next };
}

/** Per-category mastery stats. */
export function getCategoryMastery(category: string) {
  const words = getAllMasteries().filter((m) => m.category === category);
  if (!words.length) return { total: 0, mastered: 0, avgLevel: 0, words: [] };
  let mastered = 0, sum = 0;
  for (const w of words) { sum += WEIGHT[w.masteryLevel]; if (WEIGHT[w.masteryLevel] >= 4) mastered++; }
  return { total: words.length, mastered, avgLevel: sum / words.length, words };
}

/** Get recent mastery level-up events. */
export function getRecentLevelUps(count = 20): { word: string; level: MasteryLevel; timestamp: number }[] {
  return loadUps().slice(-count).reverse();
}

// ── Display helpers ─────────────────────────────────────────────────────────

export function getLevelName(level: MasteryLevel): string { return DISPLAY_NAMES[level]; }
export function getLevelColor(level: MasteryLevel): string { return MASTERY_COLORS[level]; }
export function getLevelEmoji(level: MasteryLevel): string { return MASTERY_EMOJIS[level]; }

// ── Import / Export ─────────────────────────────────────────────────────────

/** Serialize all mastery data to a JSON string. */
export function exportMasteryData(): string {
  return JSON.stringify({ version: 1, exportedAt: Date.now(), words: getAllMasteries() });
}

/** Import mastery data from a previously exported JSON string. Merges by word. */
export function importMasteryData(json: string): { imported: number; errors: string[] } {
  const errors: string[] = [];
  let imported = 0;
  try {
    const data = JSON.parse(json);
    const words: unknown[] = data.words ?? data;
    const c = loadCache();
    for (const entry of words) {
      try {
        const m = entry as WordMastery;
        if (typeof m.word !== 'string') { errors.push('Skipping entry: missing word'); continue; }
        m.masteryLevel = computeLevel(m.encounters ?? 0);
        c.set(m.word, m);
        imported++;
      } catch (e) { errors.push(`Entry error: ${e}`); }
    }
    persist();
  } catch (e) { errors.push(`Parse error: ${e}`); }
  return { imported, errors };
}
