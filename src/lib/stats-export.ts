/**
 * stats-export.ts — Stats Export feature for Word Snake (client-side only).
 * Export game statistics in JSON, CSV, Markdown, or copy to clipboard.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type ExportFormat = 'json' | 'csv' | 'markdown' | 'clipboard';

export type ExportSection =
  | 'overview' | 'achievements' | 'leaderboard'
  | 'word-collection' | 'session-history' | 'practice' | 'custom';

export interface ExportConfig {
  format: ExportFormat;
  sections: ExportSection[];
  includeTimestamp: boolean;
  prettyPrint: boolean;
  fileName?: string;
}

export interface ExportResult {
  success: boolean;
  data: string;
  filename: string;
  size: number;
  format: ExportFormat;
  sections: ExportSection[];
  error?: string;
}

export interface GameExportData {
  exportVersion: number;
  exportedAt: string;
  player: {
    totalGamesPlayed: number; totalScore: number; bestScore: number;
    totalTimePlayed: number; wordsCollected: number; uniqueWordsCollected: number;
    achievements: number; coins: number;
  };
  sessions: Array<{ date: string; score: number; words: number; duration: number; difficulty: string }>;
  achievements: Array<{ id: string; name: string; unlockedAt: string }>;
  wordCollection: Array<{ word: string; category: string; timesCollected: number; rarity: string }>;
  leaderboard: Array<{ rank: number; score: number; date: string; difficulty: string }>;
  practice: Array<{ date: string; wordsLearned: number; accuracy: number; duration: number }>;
  customData?: Record<string, unknown>;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const EXPORT_VERSION = 2;

const ALL_SECTIONS: ExportSection[] = [
  'overview', 'achievements', 'leaderboard',
  'word-collection', 'session-history', 'practice', 'custom',
];

// ── Data Collection ──────────────────────────────────────────────────────────

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

/** Gathers all game data from localStorage into a unified GameExportData object. */
export function collectExportData(): GameExportData {
  const stats = safeGet<Record<string, unknown>>('ws_game_stats', {});
  const sessions = safeGet<GameExportData['sessions']>('ws_sessions', []);
  const achievements = safeGet<GameExportData['achievements']>('ws_achievements', []);
  const words = safeGet<GameExportData['wordCollection']>('ws_words_collected', []);
  const leaderboard = safeGet<GameExportData['leaderboard']>('ws_leaderboard', []);
  const practice = safeGet<GameExportData['practice']>('ws_practice_history', []);
  const uniqueWords = new Set(words.map(w => w.word)).size;
  return {
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    player: {
      totalGamesPlayed: (stats.totalGamesPlayed as number) ?? 0,
      totalScore: (stats.totalScore as number) ?? 0,
      bestScore: (stats.bestScore as number) ?? 0,
      totalTimePlayed: (stats.totalTimePlayed as number) ?? 0,
      wordsCollected: (stats.wordsCollected as number) ?? words.reduce((s, w) => s + w.timesCollected, 0),
      uniqueWordsCollected: (stats.uniqueWordsCollected as number) ?? uniqueWords,
      achievements: achievements.length,
      coins: (stats.coins as number) ?? 0,
    },
    sessions, achievements, wordCollection: words, leaderboard, practice,
    customData: safeGet<Record<string, unknown>>('ws_custom_data', undefined),
  };
}

// ── Formatters ───────────────────────────────────────────────────────────────

export function exportAsJSON(data: GameExportData, config: ExportConfig): string {
  const payload = config.includeTimestamp ? data : { ...data, exportedAt: undefined };
  return JSON.stringify(payload, null, config.prettyPrint ? 2 : 0);
}

export function exportAsCSV(data: GameExportData): string {
  const h = ['Date', 'Score', 'Words', 'Duration (s)', 'Difficulty'];
  const rows = data.sessions.map(s => `${s.date},${s.score},${s.words},${s.duration},${s.difficulty}`);
  return [h.join(','), ...rows].join('\n');
}

export function exportAsMarkdown(data: GameExportData): string {
  const p = data.player;
  const L: string[] = [
    '# Word Snake — Stats Report', `> Exported: ${data.exportedAt}`, '',
    '## Overview', '', '| Metric | Value |', '| --- | --- |',
    `| Games Played | ${p.totalGamesPlayed} |`, `| Total Score | ${p.totalScore} |`,
    `| Best Score | ${p.bestScore} |`, `| Time Played | ${fmtDur(p.totalTimePlayed)} |`,
    `| Words Collected | ${p.wordsCollected} (${p.uniqueWordsCollected} unique) |`,
    `| Achievements | ${p.achievements} |`, `| Coins | ${p.coins} |`,
  ];
  if (data.leaderboard.length) {
    L.push('', '## Leaderboard', '', '| Rank | Score | Date | Difficulty |', '| --- | --- | --- | --- |');
    data.leaderboard.slice(0, 10).forEach(e => L.push(`| ${e.rank} | ${e.score} | ${e.date} | ${e.difficulty} |`));
  }
  if (data.achievements.length) {
    L.push('', '## Achievements', '', '| Name | Unlocked |', '| --- | --- |');
    data.achievements.forEach(a => L.push(`| ${a.name} | ${a.unlockedAt} |`));
  }
  if (data.practice.length) {
    L.push('', '## Practice History', '', '| Date | Words Learned | Accuracy | Duration (s) |', '| --- | --- | --- | --- |');
    data.practice.forEach(r => L.push(`| ${r.date} | ${r.wordsLearned} | ${Math.round(r.accuracy * 100)}% | ${r.duration} |`));
  }
  if (data.wordCollection.length) {
    L.push('', '## Word Collection (top 15)', '', '| Word | Category | Times | Rarity |', '| --- | --- | --- | --- |');
    data.wordCollection.slice(0, 15).forEach(w => L.push(`| ${w.word} | ${w.category} | ${w.timesCollected} | ${w.rarity} |`));
  }
  return L.join('\n');
}

export async function exportToClipboard(data: GameExportData, config: ExportConfig): Promise<ExportResult> {
  const text = exportAsJSON(data, config);
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, data: text, filename: '', size: new Blob([text]).size, format: 'clipboard', sections: config.sections };
  } catch (err) {
    return { success: false, data: '', filename: '', size: 0, format: 'clipboard', sections: config.sections,
      error: err instanceof Error ? err.message : 'Clipboard write failed' };
  }
}

// ── Download ─────────────────────────────────────────────────────────────────

export function triggerDownload(data: string, filename: string, format: ExportFormat): void {
  const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'md';
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.${ext}`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function createDefaultExportConfig(): ExportConfig {
  return { format: 'json', sections: [...ALL_SECTIONS], includeTimestamp: true, prettyPrint: true, fileName: 'word-snake-stats' };
}

export function getExportSizeEstimate(data: GameExportData, format: ExportFormat): number {
  const c = createDefaultExportConfig();
  const sample = format === 'csv' ? exportAsCSV(data)
    : format === 'markdown' ? exportAsMarkdown(data)
    : exportAsJSON(data, c);
  return new Blob([sample]).size;
}

export function validateImportData(json: string): { valid: boolean; errors: string[]; version: number } {
  const errors: string[] = [];
  let version = 0;
  try {
    const d = JSON.parse(json);
    if (!d || typeof d !== 'object') { errors.push('Root is not an object'); return { valid: false, errors, version }; }
    if (typeof d.exportVersion !== 'number') { errors.push('Missing exportVersion'); }
    else { version = d.exportVersion; if (version > EXPORT_VERSION) errors.push(`Future version ${version}`); }
    if (!d.player || typeof d.player !== 'object') errors.push('Missing player object');
    else ['totalGamesPlayed', 'totalScore', 'bestScore'].forEach(k => {
      if (typeof d.player[k] !== 'number') errors.push(`player.${k} is not a number`);
    });
    if (!Array.isArray(d.sessions)) errors.push('sessions must be an array');
    if (!Array.isArray(d.achievements)) errors.push('achievements must be an array');
    return { valid: errors.length === 0, errors, version };
  } catch { errors.push('Invalid JSON'); return { valid: false, errors, version }; }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

export function getSectionLabel(section: ExportSection): string {
  const m: Record<ExportSection, string> = {
    overview: 'Overview', achievements: 'Achievements', leaderboard: 'Leaderboard',
    'word-collection': 'Word Collection', 'session-history': 'Session History',
    practice: 'Practice', custom: 'Custom Data',
  };
  return m[section];
}

export function getFormatIcon(format: ExportFormat): string {
  return ({ json: '📄', csv: '📊', markdown: '📝', clipboard: '📋' })[format];
}

export async function quickExport(format: ExportFormat): Promise<ExportResult> {
  const config = createDefaultExportConfig();
  config.format = format;
  const data = collectExportData();
  if (format === 'clipboard') return exportToClipboard(data, config);
  const content = format === 'csv' ? exportAsCSV(data)
    : format === 'markdown' ? exportAsMarkdown(data)
    : exportAsJSON(data, config);
  const filename = config.fileName ?? 'word-snake-stats';
  triggerDownload(content, filename, format);
  return { success: true, data: content, filename, size: new Blob([content]).size, format, sections: config.sections };
}

export function buildShareText(data: GameExportData): string {
  const p = data.player;
  return [
    '🐍 Word Snake Stats',
    `Games: ${p.totalGamesPlayed} | Best: ${p.bestScore} | Words: ${p.uniqueWordsCollected}`,
    `Score: ${p.totalScore} | Achievements: ${p.achievements} | Coins: ${p.coins}`,
    `Play time: ${fmtDur(p.totalTimePlayed)}`,
    '#WordSnake',
  ].join('\n');
}

// ── Internal ─────────────────────────────────────────────────────────────────

function fmtDur(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m < 60) return `${m}m ${s}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
