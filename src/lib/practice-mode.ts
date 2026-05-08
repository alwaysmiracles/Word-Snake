// ─── Practice Mode: stress-free vocabulary learning for Word Snake ─────────
// Client-side only module — no API routes, no 'use client' directive needed.

// ─── Interfaces ───────────────────────────────────────────────────────────

export interface PracticeWordEntry {
  word: string;
  category: string;
  timestamp: number;
  correct: boolean;
  attempts: number;
  timeToCollect: number;
  phonetic?: string;
  translation?: string;
}

export interface PracticeModeConfig {
  enabled: boolean;
  showTranslations: boolean;
  showPhonetics: boolean;
  highlightCategories: boolean;
  wordHistory: PracticeWordEntry[];
  sessionTimer: number;
  targetWordCount: number;
  autoAdvance: boolean;
  difficultyFilter: 'all' | 'easy' | 'medium' | 'hard';
  recentWords: string[];
  maxRecentWords: number;
}

export interface PracticeStats {
  totalWords: number;
  correctFirst: number;
  avgTimeToCollect: number;
  sessionDuration: number;
  streak: number;
  bestStreak: number;
  categoryBreakdown: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
}

export interface PracticeSessionSummary {
  startTime: number;
  endTime: number;
  wordsLearned: number;
  wordsCorrect: number;
  avgTimeMs: number;
  categoriesExplored: number;
}

export interface PracticeSession {
  sessionId: string;
  startTime: number;
  config: PracticeModeConfig;
  words: PracticeWordEntry[];
  stats: PracticeStats;
}

// ─── Internal helpers ─────────────────────────────────────────────────────

const STORAGE_PREFIX = 'ws_practice_';
const KEYS = { history: `${STORAGE_PREFIX}history`, config: `${STORAGE_PREFIX}config` } as const;

const WORD_OF_THE_DAY_POOL = [
  'serendipity', 'ephemeral', 'eloquent', 'resilience', 'ubiquitous',
  'pristine', 'tenacious', 'whimsical', 'luminous', 'catalyst',
  'enigma', 'cascade', 'vivacious', 'nostalgia', 'labyrinth',
  'quintessence', 'melancholy', 'tranquility', 'sapphire', 'harmony',
  'diligent', 'benevolent', 'gratitude', 'fortitude', 'silhouette',
  'radiant', 'euphoria', 'symbiosis', 'ambrosia', 'chrysalis',
  'ephemera', 'gossamer', 'mirage', 'nebula', 'oblivion',
] as const;

type StoredSummary = PracticeSessionSummary & { sessionId: string };

function storageGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageSet(key: string, value: string): boolean {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}
function storageRemove(key: string): boolean {
  try { localStorage.removeItem(key); return true; } catch { return false; }
}
function generateSessionId(): string {
  return `prac_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Config ───────────────────────────────────────────────────────────────

export function createPracticeConfig(): PracticeModeConfig {
  return {
    enabled: true, showTranslations: true, showPhonetics: true, highlightCategories: true,
    wordHistory: [], sessionTimer: 0, targetWordCount: 20, autoAdvance: false,
    difficultyFilter: 'all', recentWords: [], maxRecentWords: 50,
  };
}

export function loadPracticeConfig(): PracticeModeConfig {
  const raw = storageGet(KEYS.config);
  if (!raw) return createPracticeConfig();
  try {
    return { ...createPracticeConfig(), ...JSON.parse(raw) };
  } catch {
    return createPracticeConfig();
  }
}

export function savePracticeConfig(config: PracticeModeConfig): boolean {
  return storageSet(KEYS.config, JSON.stringify(config));
}

// ─── Session lifecycle ────────────────────────────────────────────────────

export function startPracticeSession(config?: Partial<PracticeModeConfig>): PracticeSession {
  const merged: PracticeModeConfig = {
    ...createPracticeConfig(), ...loadPracticeConfig(), ...config,
  };
  return {
    sessionId: generateSessionId(),
    startTime: Date.now(),
    config: merged,
    words: [],
    stats: {
      totalWords: 0, correctFirst: 0, avgTimeToCollect: 0, sessionDuration: 0,
      streak: 0, bestStreak: 0, categoryBreakdown: {}, difficultyBreakdown: {},
    },
  };
}

export function recordPracticeWord(
  session: PracticeSession,
  word: string,
  category: string,
  timeToCollect: number,
  correct: boolean,
  phonetic?: string,
  translation?: string,
): PracticeSession {
  const entry: PracticeWordEntry = {
    word, category, timestamp: Date.now(), correct,
    attempts: correct ? 1 : 2, timeToCollect, phonetic, translation,
  };

  session.words.push(entry);
  const stats = session.stats;
  stats.totalWords++;

  if (correct) {
    stats.correctFirst++;
    stats.streak++;
    if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
  } else {
    stats.streak = 0;
  }

  const totalTime = stats.avgTimeToCollect * (stats.totalWords - 1) + timeToCollect;
  stats.avgTimeToCollect = Math.round(totalTime / stats.totalWords);

  stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1;

  const difficulty = getWordDifficulty(category, timeToCollect);
  stats.difficultyBreakdown[difficulty] = (stats.difficultyBreakdown[difficulty] || 0) + 1;

  session.config.recentWords.push(word);
  if (session.config.recentWords.length > session.config.maxRecentWords) {
    session.config.recentWords.shift();
  }

  return session;
}

export function endPracticeSession(session: PracticeSession): PracticeSessionSummary {
  const now = Date.now();
  session.stats.sessionDuration = now - session.startTime;

  const correctCount = session.words.filter((w) => w.correct).length;
  const categoriesExplored = new Set(session.words.map((w) => w.category)).size;
  const totalTime = session.words.reduce((sum, w) => sum + w.timeToCollect, 0);
  const avgTime = session.words.length > 0 ? Math.round(totalTime / session.words.length) : 0;

  const summary: PracticeSessionSummary = {
    startTime: session.startTime, endTime: now,
    wordsLearned: session.words.length, wordsCorrect: correctCount,
    avgTimeMs: avgTime, categoriesExplored,
  };

  const history = getPracticeHistory();
  history.push({ ...summary, sessionId: session.sessionId });
  storageSet(KEYS.history, JSON.stringify(history));

  return summary;
}

// ─── History ──────────────────────────────────────────────────────────────

export function getPracticeHistory(): StoredSummary[] {
  const raw = storageGet(KEYS.history);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function clearPracticeHistory(): boolean {
  return storageRemove(KEYS.history);
}

// ─── Aggregate stats ──────────────────────────────────────────────────────

export function getPracticeStats(): PracticeStats {
  const history = getPracticeHistory();
  const aggregate: PracticeStats = {
    totalWords: 0, correctFirst: 0, avgTimeToCollect: 0, sessionDuration: 0,
    streak: 0, bestStreak: 0, categoryBreakdown: {}, difficultyBreakdown: {},
  };
  if (history.length === 0) return aggregate;

  let weightedTimeSum = 0;
  for (const s of history) {
    aggregate.totalWords += s.wordsLearned;
    aggregate.correctFirst += s.wordsCorrect;
    weightedTimeSum += s.avgTimeMs * s.wordsLearned;
    aggregate.sessionDuration += s.endTime - s.startTime;
    if (s.wordsCorrect > aggregate.bestStreak) aggregate.bestStreak = s.wordsCorrect;
  }
  aggregate.avgTimeToCollect =
    aggregate.totalWords > 0 ? Math.round(weightedTimeSum / aggregate.totalWords) : 0;
  return aggregate;
}

// ─── Import / Export ──────────────────────────────────────────────────────

export function exportPracticeData(): string {
  return JSON.stringify({
    history: getPracticeHistory(),
    config: loadPracticeConfig(),
    exportedAt: Date.now(),
    version: 1,
  }, null, 2);
}

export function importPracticeData(json: string): { success: boolean; message: string } {
  try {
    const payload = JSON.parse(json);
    if (!payload || typeof payload !== 'object') {
      return { success: false, message: 'Invalid JSON structure.' };
    }
    if (Array.isArray(payload.history)) storageSet(KEYS.history, JSON.stringify(payload.history));
    if (payload.config && typeof payload.config === 'object') {
      storageSet(KEYS.config, JSON.stringify(payload.config));
    }
    return {
      success: true,
      message: `Imported ${Array.isArray(payload.history) ? payload.history.length : 0} session(s).`,
    };
  } catch {
    return { success: false, message: 'Failed to parse JSON data.' };
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────

export function formatPracticeDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

export function getWordDifficulty(
  category: string,
  rarity?: number,
): 'easy' | 'medium' | 'hard' {
  if (rarity !== undefined && rarity !== null) {
    if (rarity <= 3) return 'easy';
    if (rarity <= 7) return 'medium';
    return 'hard';
  }
  const lc = category.toLowerCase().trim();
  const easyCats = ['basic', 'common', 'starter', 'beginner', 'everyday'];
  const hardCats = ['advanced', 'academic', 'technical', 'literary', 'scientific'];
  if (easyCats.some((c) => lc.includes(c))) return 'easy';
  if (hardCats.some((c) => lc.includes(c))) return 'hard';
  return 'medium';
}

export function getPracticeWordOfTheDay(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return WORD_OF_THE_DAY_POOL[seed % WORD_OF_THE_DAY_POOL.length];
}

/** Check whether a word has been seen recently in the current session config. */
export function isRecentWord(config: PracticeModeConfig, word: string): boolean {
  return config.recentWords.includes(word.toLowerCase());
}
