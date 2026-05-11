'use client';

/**
 * stats-export-wire.ts — UI-friendly wiring layer for Word Snake stats export.
 *
 * Provides high-level functions connecting the low-level export engine (stats-export.ts)
 * with game data sources so the UI can call a single function per user action.
 * All public functions are safe (try/catch). Export history persisted under
 * `ws_stats_export_history` (max 50 entries).
 */

import {
  type ExportFormat, type ExportSection, type ExportConfig, type ExportResult,
  type GameExportData, collectExportData, exportAsJSON, exportAsCSV,
  exportAsMarkdown, exportToClipboard, triggerDownload,
  createDefaultExportConfig, formatFileSize, getSectionLabel, getFormatIcon,
  EXPORT_VERSION,
} from '@/lib/stats-export';
import { type GameStats, getGameStats, formatPlayTime } from '@/lib/game-stats';
import { type LeaderboardEntry, getLeaderboard } from '@/lib/leaderboard';
import { type MasteryStats, getMasteryStats, getLevelEmoji, getLevelName } from '@/lib/word-mastery';
import { ACHIEVEMENTS, getUnlockedAchievements } from '@/lib/achievements';
import { getStreak, STREAK_BONUSES, getStreakMultiplier } from '@/lib/streak';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ExportHistoryEntry {
  id: string;
  timestamp: string;
  format: ExportFormat;
  sections: ExportSection[];
  sizeBytes: number;
  success: boolean;
  error?: string;
  filename?: string;
}

export interface ExportSummary {
  totalExports: number;
  successfulExports: number;
  failedExports: number;
  totalBytesExported: number;
  totalBytesFormatted: string;
  mostCommonFormat: ExportFormat | null;
  formatBreakdown: Record<ExportFormat, number>;
  lastExportAt: string | null;
  firstExportAt: string | null;
  averageExportSize: number;
  averageExportSizeFormatted: string;
}

export interface WireResult<T = string> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ShareableData {
  gamesPlayed: number;
  bestScore: number;
  totalScore: number;
  uniqueWords: number;
  achievements: number;
  currentStreak: number;
  longestStreak: number;
  playTime: string;
  masteredWords: number;
  legendaryWords: number;
}

export interface AchievementReportRow {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
}

export interface AchievementReport {
  totalAchievements: number;
  unlockedCount: number;
  lockedCount: number;
  completionPercent: number;
  rows: AchievementReportRow[];
  markdown: string;
}

export interface SessionReport {
  player: {
    gamesPlayed: number;
    totalScore: number;
    bestScore: number;
    bestScoreDifficulty: string;
    averageScore: number;
    totalPlayTime: string;
    totalWordsEaten: number;
    maxCombo: number;
    coins: number;
  };
  streak: { current: number; longest: number; multiplier: number; nextMilestone: string | null };
  leaderboard: { topScores: LeaderboardEntry[] };
  mastery: MasteryStats;
  achievements: { unlocked: string[]; total: number; completionPct: number };
  generatedAt: string;
  markdown: string;
}

export interface ClipboardOptions {
  sections?: ExportSection[];
  format?: Exclude<ExportFormat, 'clipboard'>;
}

// ── Constants ────────────────────────────────────────────────────────────────

const HISTORY_KEY = 'ws_stats_export_history';
const MAX_HISTORY = 50;

const ALL_EXPORT_SECTIONS: ExportSection[] = [
  'overview', 'achievements', 'leaderboard',
  'word-collection', 'session-history', 'practice', 'custom',
];

// ── Internal helpers ─────────────────────────────────────────────────────────

function uid(): string {
  try { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
  catch { return 'unknown'; }
}

function readHistory(): ExportHistoryEntry[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) return p; }
  } catch { /* ignore */ }
  return [];
}

function writeHistory(entries: ExportHistoryEntry[]): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(-MAX_HISTORY)));
  } catch { /* quota exceeded */ }
}

function recordExport(entry: Omit<ExportHistoryEntry, 'id'>): void {
  try { const h = readHistory(); h.push({ ...entry, id: uid() }); writeHistory(h); }
  catch { /* ignore */ }
}

function buildConfig(overrides: Partial<ExportConfig> = {}): ExportConfig {
  return { ...createDefaultExportConfig(), ...overrides };
}

function safeWrap<T>(fn: () => T): WireResult<T> {
  try { return { success: true, data: fn() }; }
  catch (err) {
    return { success: false, data: '' as unknown as T, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

function fmtNum(n: number): string { return n.toLocaleString(); }

function buildShareableData(stats: GameStats, mastery: MasteryStats): ShareableData {
  return {
    gamesPlayed: stats.totalGamesPlayed,
    bestScore: stats.bestScore,
    totalScore: stats.totalScore,
    uniqueWords: stats.totalWordsEaten,
    achievements: stats.achievementsUnlocked,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    playTime: formatPlayTime(stats.totalPlayTime),
    masteredWords: mastery.masteredCount,
    legendaryWords: mastery.legendaryCount,
  };
}

/** Filter GameExportData to only include the requested sections. */
function filterExportData(data: GameExportData, sections: ExportSection[]): GameExportData {
  const has = (s: ExportSection) => sections.includes(s);
  return {
    exportVersion: data.exportVersion,
    exportedAt: data.exportedAt,
    player: has('overview') ? data.player : {
      totalGamesPlayed: data.player.totalGamesPlayed,
      totalScore: 0, bestScore: 0, totalTimePlayed: 0,
      wordsCollected: 0, uniqueWordsCollected: 0, achievements: 0, coins: 0,
    },
    sessions: has('session-history') ? data.sessions : [],
    achievements: has('achievements') ? data.achievements : [],
    wordCollection: has('word-collection') ? data.wordCollection : [],
    leaderboard: has('leaderboard') ? data.leaderboard : [],
    practice: has('practice') ? data.practice : [],
    customData: has('custom') ? data.customData : undefined,
  };
}

/** Render formatted content for a given format + config. */
function renderContent(data: GameExportData, config: ExportConfig): string {
  if (config.format === 'csv') return exportAsCSV(data);
  if (config.format === 'markdown') return exportAsMarkdown(data);
  return exportAsJSON(data, config);
}

// ── 1. Quick Export ──────────────────────────────────────────────────────────

/**
 * Exports all stats in one click. Triggers download for json/csv/md,
 * copies to clipboard for 'clipboard'. Every call recorded in history.
 */
export async function quickExport(format: ExportFormat): Promise<WireResult<ExportResult>> {
  try {
    const config = buildConfig({ format });
    const data = collectExportData();
    let result: ExportResult;

    if (format === 'clipboard') {
      result = await exportToClipboard(data, config);
    } else {
      const content = renderContent(data, config);
      const filename = config.fileName ?? 'word-snake-stats';
      triggerDownload(content, filename, format);
      result = {
        success: true, data: content, filename,
        size: new Blob([content]).size, format, sections: config.sections,
      };
    }

    recordExport({
      timestamp: new Date().toISOString(), format: result.format,
      sections: result.sections, sizeBytes: result.size,
      success: result.success, error: result.error,
      filename: result.filename || undefined,
    });
    return { success: true, data: result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Quick export failed';
    recordExport({
      timestamp: new Date().toISOString(), format, sections: ALL_EXPORT_SECTIONS,
      sizeBytes: 0, success: false, error: msg,
    });
    return { success: false, data: {} as ExportResult, error: msg };
  }
}

// ── 2. Custom Export ─────────────────────────────────────────────────────────

/** Exports only the selected sections in the given format. */
export async function customExport(
  sections: ExportSection[],
  format: ExportFormat = 'json',
): Promise<WireResult<ExportResult>> {
  try {
    if (!sections.length) {
      return { success: false, data: {} as ExportResult, error: 'At least one section must be selected' };
    }
    const config = buildConfig({ format, sections });
    const filtered = filterExportData(collectExportData(), sections);
    let result: ExportResult;

    if (format === 'clipboard') {
      result = await exportToClipboard(filtered, config);
    } else {
      const content = renderContent(filtered, config);
      const filename = config.fileName ?? `word-snake-${sections.join('-')}`;
      triggerDownload(content, filename, format);
      result = {
        success: true, data: content, filename,
        size: new Blob([content]).size, format, sections,
      };
    }

    recordExport({
      timestamp: new Date().toISOString(), format: result.format,
      sections: result.sections, sizeBytes: result.size,
      success: result.success, error: result.error,
      filename: result.filename || undefined,
    });
    return { success: true, data: result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Custom export failed';
    recordExport({
      timestamp: new Date().toISOString(), format, sections,
      sizeBytes: 0, success: false, error: msg,
    });
    return { success: false, data: {} as ExportResult, error: msg };
  }
}

// ── 3. Export History ────────────────────────────────────────────────────────

/** Returns past exports with timestamps and sizes (newest first, max 50). */
export function getExportHistory(): WireResult<ExportHistoryEntry[]> {
  return safeWrap(() => readHistory().slice().reverse());
}

/** Clear all export history from localStorage. */
export function clearExportHistory(): WireResult<boolean> {
  return safeWrap(() => {
    if (typeof window !== 'undefined') localStorage.removeItem(HISTORY_KEY);
    return true;
  });
}

// ── 4. Preview ───────────────────────────────────────────────────────────────

/** Returns a string preview without triggering download or clipboard. */
export function previewExport(
  sections: ExportSection[] = ALL_EXPORT_SECTIONS,
  format: ExportFormat = 'markdown',
): WireResult<string> {
  return safeWrap(() => {
    const config = buildConfig({ format, sections });
    const filtered = filterExportData(collectExportData(), sections);
    return renderContent(filtered, config);
  });
}

// ── 5. Download Stats ────────────────────────────────────────────────────────

/** Triggers a browser download of stats in the specified format. */
export async function downloadStats(
  format: ExportFormat = 'json',
  filename?: string,
  sections?: ExportSection[],
): Promise<WireResult<ExportResult>> {
  try {
    const active = sections ?? ALL_EXPORT_SECTIONS;
    const config = buildConfig({ format, fileName: filename ?? 'word-snake-stats', sections: active });
    const filtered = filterExportData(collectExportData(), active);
    const content = renderContent(filtered, config);
    const safeName = config.fileName ?? 'word-snake-stats';
    triggerDownload(content, safeName, format);

    const result: ExportResult = {
      success: true, data: content, filename: safeName,
      size: new Blob([content]).size, format, sections: active,
    };
    recordExport({
      timestamp: new Date().toISOString(), format, sections: active,
      sizeBytes: result.size, success: true, filename: safeName,
    });
    return { success: true, data: result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Download failed';
    return { success: false, data: {} as ExportResult, error: msg };
  }
}

// ── 6. Copy to Clipboard ─────────────────────────────────────────────────────

/** Copies formatted stats to the system clipboard. */
export async function copyStatsToClipboard(
  sections: ExportSection[] = ALL_EXPORT_SECTIONS,
  options?: ClipboardOptions,
): Promise<WireResult<boolean>> {
  try {
    const active = options?.sections ?? sections;
    const fmt: Exclude<ExportFormat, 'clipboard'> = (options?.format as any) ?? 'json';
    const config = buildConfig({ format: fmt, sections: active });
    const filtered = filterExportData(collectExportData(), active);
    const content = renderContent(filtered, config);

    await navigator.clipboard.writeText(content);
    recordExport({
      timestamp: new Date().toISOString(), format: 'clipboard',
      sections: active, sizeBytes: new Blob([content]).size, success: true,
    });
    return { success: true, data: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Clipboard copy failed';
    recordExport({
      timestamp: new Date().toISOString(), format: 'clipboard',
      sections, sizeBytes: 0, success: false, error: msg,
    });
    return { success: false, data: false, error: msg };
  }
}

// ── 7. Export Summary ────────────────────────────────────────────────────────

/** Aggregated summary: count, total data, most common format, etc. */
export function getExportSummary(): WireResult<ExportSummary> {
  return safeWrap(() => {
    const history = readHistory();
    const empty = {
      totalExports: 0, successfulExports: 0, failedExports: 0,
      totalBytesExported: 0, totalBytesFormatted: '0 B', mostCommonFormat: null,
      formatBreakdown: { json: 0, csv: 0, markdown: 0, clipboard: 0 },
      lastExportAt: null, firstExportAt: null,
      averageExportSize: 0, averageExportSizeFormatted: '0 B',
    } satisfies ExportSummary;

    if (!history.length) return empty;

    const breakdown: Record<ExportFormat, number> = { json: 0, csv: 0, markdown: 0, clipboard: 0 };
    let totalBytes = 0;
    for (const e of history) { breakdown[e.format]++; totalBytes += e.sizeBytes; }
    const successCount = history.filter(h => h.success).length;
    const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]) as [ExportFormat, number][];
    const avgSize = Math.round(totalBytes / history.length);
    const ts = history.map(h => h.timestamp).sort();

    return {
      totalExports: history.length,
      successfulExports: successCount,
      failedExports: history.length - successCount,
      totalBytesExported: totalBytes,
      totalBytesFormatted: formatFileSize(totalBytes),
      mostCommonFormat: sorted[0][1] > 0 ? sorted[0][0] : null,
      formatBreakdown: breakdown,
      lastExportAt: ts[ts.length - 1] ?? null,
      firstExportAt: ts[0] ?? null,
      averageExportSize: avgSize,
      averageExportSizeFormatted: formatFileSize(avgSize),
    };
  });
}

// ── 8. Shareable Text ────────────────────────────────────────────────────────

/** Generates compact multi-line text for social media / messaging. */
export function generateShareableText(): WireResult<string> {
  return safeWrap(() => {
    const stats = getGameStats();
    const d = buildShareableData(stats, getMasteryStats());
    return [
      '🐍 Word Snake — Stats', '',
      `📊 Games Played: ${fmtNum(d.gamesPlayed)}`,
      `🏆 Best Score: ${fmtNum(d.bestScore)}`,
      `💰 Total Score: ${fmtNum(d.totalScore)}`,
      `📖 Unique Words: ${fmtNum(d.uniqueWords)}`,
      `🎖️ Achievements: ${d.achievements}/${stats.totalAchievements}`, '',
      `🔥 Streak: ${d.currentStreak} day${d.currentStreak !== 1 ? 's' : ''} (best: ${d.longestStreak})`,
      `⏱️ Play Time: ${d.playTime}`, '',
      `📚 Mastered: ${d.masteredWords} | Legendary: ${d.legendaryWords}`, '',
      '#WordSnake',
    ].join('\n');
  });
}

/** Structured data behind the shareable text (for custom share cards). */
export function generateShareableData(): WireResult<ShareableData> {
  return safeWrap(() => buildShareableData(getGameStats(), getMasteryStats()));
}

// ── 9. Session Report ────────────────────────────────────────────────────────

/** Creates a detailed Markdown session report. */
export function generateSessionReport(): WireResult<SessionReport> {
  return safeWrap(() => {
    const stats = getGameStats();
    const streak = getStreak();
    const topScores = getLeaderboard();
    const mastery = getMasteryStats();
    const unlocked = getUnlockedAchievements();
    const totalAch = ACHIEVEMENTS.length;
    const pct = totalAch > 0 ? Math.round((unlocked.length / totalAch) * 100) : 0;
    const mult = getStreakMultiplier(streak.currentStreak);
    const nextMs = streak.currentStreak < 30
      ? STREAK_BONUSES.find(b => b.days > streak.currentStreak) : null;
    const s = stats;

    // Markdown builder
    const L: string[] = [];
    const push = (...lines: string[]) => L.push(...lines);

    push(
      '# 🐍 Word Snake — Session Report',
      `> Generated: ${new Date().toLocaleString()} · v${EXPORT_VERSION}`, '',
      '## 👤 Player Overview', '',
      '| Metric | Value |', '|--------|-------|',
      `| Games Played | ${fmtNum(s.totalGamesPlayed)} |`,
      `| Total Score | ${fmtNum(s.totalScore)} |`,
      `| Best Score | ${fmtNum(s.bestScore)} (${s.bestScoreDifficulty}) |`,
      `| Average Score | ${fmtNum(s.averageScore)} |`,
      `| Play Time | ${formatPlayTime(s.totalPlayTime)} |`,
      `| Words Eaten | ${fmtNum(s.totalWordsEaten)} |`,
      `| Max Combo | ${s.maxCombo} |`,
      `| Coins | ${fmtNum(s.coins || 0)} |`, '',

      '## 🔥 Streak', '',
      `- **Current:** ${streak.currentStreak} day${streak.currentStreak !== 1 ? 's' : ''}`,
      `- **Longest:** ${streak.longestStreak} days`,
      `- **Multiplier:** ×${mult.toFixed(mult % 1 === 0 ? 0 : 2)}`,
      nextMs
        ? `- **Next Milestone:** ${nextMs.emoji} ${nextMs.name} (${nextMs.days} days) — ${nextMs.description}`
        : '- **Next Milestone:** All milestones unlocked!',
      '',
    );

    // Leaderboard
    push('## 🏆 Leaderboard (Top Scores)', '');
    if (topScores.length) {
      push('| Rank | Score | Words | Difficulty | Date | Daily |',
           '|------|-------|-------|------------|------|-------|');
      topScores.forEach((e, i) => push(
        `| ${i + 1} | ${fmtNum(e.score)} | ${e.wordsEaten} | ${e.difficulty} | ${e.date} | ${e.isDailyChallenge ? '✅' : ''} |`,
      ));
    } else { push('_No leaderboard entries yet._'); }
    push('');

    // Mastery overview
    push(
      '## 📚 Word Mastery', '',
      `- **Total Tracked Words:** ${mastery.totalWords}`,
      `- **Mastered:** ${mastery.masteredCount} · **Legendary:** ${mastery.legendaryCount}`,
      `- **Average Mastery:** ${mastery.averageMastery.toFixed(2)} / 5.0`,
      `- **Collection Rate:** ${Math.round(mastery.collectionRate * 100)}%`, '',
    );

    // Category breakdown
    const cats = Object.entries(mastery.categoryMastery);
    if (cats.length) {
      push('| Category | Total | Mastered | Avg Level |',
           '|----------|-------|----------|-----------|');
      cats.forEach(([c, i]) => push(`| ${c} | ${i.total} | ${i.mastered} | ${i.avgLevel.toFixed(1)} |`));
      push('');
    }

    // Words to practice
    if (mastery.weakestWords.length) {
      push('### Words to Practice', '', '| Word | Level | Encounters | Missed |',
           '|------|-------|------------|--------|');
      mastery.weakestWords.slice(0, 8).forEach(w => push(
        `| ${w.word} | ${getLevelEmoji(w.masteryLevel)} ${getLevelName(w.masteryLevel)} | ${w.encounters} | ${w.missed} |`,
      ));
      push('');
    }

    // Achievements
    const unlockedAch = ACHIEVEMENTS.filter(a => unlocked.includes(a.id));
    const lockedAch = ACHIEVEMENTS.filter(a => !unlocked.includes(a.id));
    push(
      '## 🎖️ Achievements', '',
      `- **Progress:** ${unlocked.length} / ${totalAch} (${pct}%)`, '',
    );
    if (unlockedAch.length) {
      push('### Unlocked', '', '| Achievement | Description |', '|-------------|-------------|');
      unlockedAch.forEach(a => push(`| ${a.emoji} ${a.title} | ${a.description} |`));
      push('');
    }
    if (lockedAch.length) {
      push('### Locked', '', '| Achievement | Description |', '|-------------|-------------|');
      lockedAch.forEach(a => push(`| 🔒 ${a.title} | ${a.description} |`));
      push('');
    }
    push('---', '_Generated by Word Snake Stats Export_');

    return {
      player: {
        gamesPlayed: s.totalGamesPlayed, totalScore: s.totalScore,
        bestScore: s.bestScore, bestScoreDifficulty: s.bestScoreDifficulty,
        averageScore: s.averageScore, totalPlayTime: formatPlayTime(s.totalPlayTime),
        totalWordsEaten: s.totalWordsEaten, maxCombo: s.maxCombo, coins: s.coins || 0,
      },
      streak: {
        current: streak.currentStreak, longest: streak.longestStreak, multiplier: mult,
        nextMilestone: nextMs ? `${nextMs.emoji} ${nextMs.name} (${nextMs.days} days)` : null,
      },
      leaderboard: { topScores },
      mastery,
      achievements: { unlocked, total: totalAch, completionPct: pct },
      generatedAt: new Date().toISOString(),
      markdown: L.join('\n'),
    };
  });
}

// ── 10. Achievement Report ───────────────────────────────────────────────────

/** Creates a formatted achievement list with unlock status + completion %. */
export function generateAchievementReport(): WireResult<AchievementReport> {
  return safeWrap(() => {
    const ids = getUnlockedAchievements();
    const total = ACHIEVEMENTS.length;
    const unlockedCount = ids.length;
    const pct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

    const rows: AchievementReportRow[] = ACHIEVEMENTS.map(a => ({
      id: a.id, title: a.title, description: a.description,
      emoji: a.emoji, unlocked: ids.includes(a.id),
    }));

    const md: string[] = [
      '## 🎖️ Word Snake — Achievement Report', '',
      `**Progress:** ${unlockedCount} / ${total} (${pct}%)`, '',
    ];

    const un = rows.filter(r => r.unlocked);
    if (un.length) {
      md.push('### ✅ Unlocked', '');
      un.forEach(r => md.push(`- ${r.emoji} **${r.title}** — ${r.description}`));
      md.push('');
    }

    const lk = rows.filter(r => !r.unlocked);
    if (lk.length) {
      md.push('### 🔒 Locked', '');
      lk.forEach(r => md.push(`- 🔒 **${r.title}** — ${r.description}`));
      md.push('');
    }

    // Text progress bar
    const filled = Math.round((pct / 100) * 20);
    md.push(`\`${'█'.repeat(filled)}${'░'.repeat(20 - filled)} ${pct}%\``);

    return {
      totalAchievements: total,
      unlockedCount,
      lockedCount: total - unlockedCount,
      completionPercent: pct,
      rows,
      markdown: md.join('\n'),
    };
  });
}

// ── Re-exports ───────────────────────────────────────────────────────────────
// Convenience: re-export commonly used types so UI components need one import.

export type { ExportFormat, ExportSection, ExportConfig, ExportResult, GameExportData } from '@/lib/stats-export';
export { getSectionLabel, getFormatIcon, formatFileSize, createDefaultExportConfig, collectExportData } from '@/lib/stats-export';
