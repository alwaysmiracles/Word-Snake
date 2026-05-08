'use client';

/**
 * pvp-enhancement-wire.ts — Enhanced PvP Multiplayer Features for Word Snake
 *
 * Match history, win stats, Elo ratings, player profiles, AI opponent config,
 * head-to-head comparisons, leaderboards, rematch suggestions, and PvP tips.
 * Persisted under `ws_pvp_enhancement`.
 */

import { type PvPState, createPvPState } from '@/lib/pvp-mode';
import { type AiBotState, createAiBot, AI_BOT_CONFIG } from '@/lib/ai-bot';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PvPMatchMode = 'pvp-local' | 'pvp-ai';
export type AIPersonality = 'aggressive' | 'defensive' | 'chaotic' | 'strategic' | 'mimic';
export type MatchWinner = 'player1' | 'player2' | 'tie';

export interface PvPMatchRecord {
  id: string;
  timestamp: number;
  mode: PvPMatchMode;
  winner: MatchWinner;
  player1Score: number;
  player1WordsEaten: string[];
  player2Score: number;
  player2WordsEaten: string[];
  durationSeconds: number;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  aiPersonality?: AIPersonality;
  powerUpsUsed: number;
  eloChange: number;
}

export interface WinStats {
  totalMatches: number; wins: number; losses: number; ties: number;
  winRate: number; currentStreak: number; bestWinStreak: number; bestLossStreak: number;
  bestScore: number; averageScore: number; averageOpponentScore: number;
  totalPlayTimeSeconds: number;
}

export interface PlayerProfileSummary {
  playerName: string; totalPvPMatches: number; wins: number; losses: number; ties: number;
  winRate: number; currentElo: number; bestElo: number; currentStreak: number;
  bestScore: number; averageScore: number; favoriteMode: PvPMatchMode | null;
  favoriteAIDifficulty: 'easy' | 'medium' | 'hard' | null;
  rankTitle: string; rankEmoji: string;
}

export interface PvPMatchSetupConfig {
  mode: PvPMatchMode;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  aiPersonality?: AIPersonality;
  enablePowerUpStealing?: boolean;
  timeLimitSeconds?: number;
  targetScore?: number;
  gridWidth?: number;
  gridHeight?: number;
}

export interface PvPMatchSetupResult {
  pvpState: PvPState; aiBotState: AiBotState | null;
  config: PvPMatchSetupConfig; estimatedDuration: string; difficultyLabel: string;
}

export interface AIOpponentConfiguration {
  difficulty: 'easy' | 'medium' | 'hard';
  personality: AIPersonality;
  intelligence: number;
  reactionDelayMs: number;
  aggressionFactor: number;
  mistakeFrequency: number;
  stealPowerUpChance: number;
  description: string;
  colorScheme: { head: string; bodyStart: string; bodyEnd: string; glow: string };
}

export interface HeadToHeadResult {
  totalMatches: number; playerWins: number; opponentWins: number; ties: number;
  winRate: number; averagePlayerScore: number; averageOpponentScore: number;
  averageScoreDifference: number; longestWinStreak: number; longestLossStreak: number;
  biggestWinMargin: number; biggestLossMargin: number;
  totalWordsPlayer: number; totalWordsOpponent: number;
  recentTrend: 'improving' | 'declining' | 'stable'; trendDetail: string;
}

export interface PvPLeaderboardEntry {
  rank: number; matchId: string; playerName: string; score: number;
  wordsEaten: number; opponentScore: number; margin: number;
  mode: PvPMatchMode; aiDifficulty?: 'easy' | 'medium' | 'hard';
  durationSeconds: number; timestamp: number; eloAfterMatch: number;
}

export interface RematchOption {
  suggested: boolean; reason: string;
  recommendedDifficulty: 'easy' | 'medium' | 'hard' | null;
  recommendedPersonality: AIPersonality | null;
  confidence: number; motivationalMessage: string;
}

export interface PvPTip {
  id: string; category: 'strategy' | 'powerups' | 'defense' | 'scoring' | 'mental';
  title: string; content: string; priority: number; relevance: number;
}

export interface PvPEnhancementState {
  matchHistory: PvPMatchRecord[];
  currentElo: number; bestElo: number; totalXpEarned: number;
  dismissedTipIds: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_pvp_enhancement';
const MAX_HISTORY = 100;
const DEFAULT_ELO = 1000;
const DEFAULT_K = 32;

const RANK_TIERS: { minElo: number; title: string; emoji: string }[] = [
  { minElo: 0, title: 'Bronze Serpent', emoji: '🥉' },
  { minElo: 800, title: 'Silver Snake', emoji: '🥈' },
  { minElo: 1000, title: 'Golden Python', emoji: '🥇' },
  { minElo: 1200, title: 'Platinum Viper', emoji: '💎' },
  { minElo: 1400, title: 'Diamond Cobra', emoji: '💠' },
  { minElo: 1600, title: 'Master Asp', emoji: '👑' },
  { minElo: 1800, title: 'Grandmaster Wyrm', emoji: '🐉' },
  { minElo: 2000, title: 'Legendary Serpent', emoji: '🌟' },
];

const PERSONALITY_COLORS: Record<AIPersonality, AIOpponentConfiguration['colorScheme']> = {
  aggressive: { head: '#ef4444', bodyStart: '#f87171', bodyEnd: '#991b1b', glow: '#fca5a5' },
  defensive: { head: '#22c55e', bodyStart: '#4ade80', bodyEnd: '#166534', glow: '#86efac' },
  chaotic: { head: '#a855f7', bodyStart: '#c084fc', bodyEnd: '#581c87', glow: '#d8b4fe' },
  strategic: { head: '#f97316', bodyStart: '#fb923c', bodyEnd: '#7c2d12', glow: '#fdba74' },
  mimic: { head: '#06b6d4', bodyStart: '#22d3ee', bodyEnd: '#164e63', glow: '#67e8f9' },
};

// ── Persistence helpers ───────────────────────────────────────────────────────

function uid(): string {
  try { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
  catch { return 'unknown'; }
}

function emptyState(): PvPEnhancementState {
  return { matchHistory: [], currentElo: DEFAULT_ELO, bestElo: DEFAULT_ELO, totalXpEarned: 0, dismissedTipIds: [] };
}

function loadState(): PvPEnhancementState {
  try {
    if (typeof window === 'undefined') return emptyState();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<PvPEnhancementState>;
      return {
        matchHistory: Array.isArray(p.matchHistory) ? p.matchHistory : [],
        currentElo: typeof p.currentElo === 'number' ? p.currentElo : DEFAULT_ELO,
        bestElo: typeof p.bestElo === 'number' ? p.bestElo : DEFAULT_ELO,
        totalXpEarned: typeof p.totalXpEarned === 'number' ? p.totalXpEarned : 0,
        dismissedTipIds: Array.isArray(p.dismissedTipIds) ? p.dismissedTipIds : [],
      };
    }
  } catch { /* corrupted — reset */ }
  return emptyState();
}

function saveState(state: PvPEnhancementState): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, matchHistory: state.matchHistory.slice(-MAX_HISTORY) }));
  } catch { /* quota exceeded */ }
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function getRankForElo(elo: number): { title: string; emoji: string } {
  let tier = RANK_TIERS[0];
  for (const t of RANK_TIERS) { if (elo >= t.minElo) tier = t; }
  return { title: tier.title, emoji: tier.emoji };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60), s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function calculateStreak(matches: PvPMatchRecord[]): number {
  if (!matches.length) return 0;
  const lastWinner = matches[matches.length - 1].winner;
  if (lastWinner === 'tie') return 0;
  let count = 0;
  for (let i = matches.length - 1; i >= 0; i--) {
    if (matches[i].winner === lastWinner) count++;
    else break;
  }
  return lastWinner === 'player1' ? count : -count;
}

// ── 1. Match History ──────────────────────────────────────────────────────────

/** Returns recent PvP match records, newest first. */
export function getMatchHistory(limit: number = 20, modeFilter?: PvPMatchMode): PvPMatchRecord[] {
  try {
    const history = loadState().matchHistory;
    const filtered = modeFilter ? history.filter((m) => m.mode === modeFilter) : history;
    return filtered.slice(-limit).reverse();
  } catch { return []; }
}

/** Record a completed match, updating Elo and XP automatically. */
export function recordMatch(match: Omit<PvPMatchRecord, 'id' | 'timestamp' | 'eloChange'>): PvPMatchRecord {
  try {
    const state = loadState();
    const expectedAdjust = match.mode === 'pvp-ai'
      ? (match.aiDifficulty === 'easy' ? 0.2 : match.aiDifficulty === 'hard' ? -0.2 : 0)
      : 0;
    const expected = 0.5 + expectedAdjust;
    const actual = match.winner === 'player1' ? 1 : match.winner === 'tie' ? 0.5 : 0;
    const eloChange = Math.round(DEFAULT_K * (actual - expected));

    const record: PvPMatchRecord = { ...match, id: uid(), timestamp: Date.now(), eloChange };
    state.matchHistory.push(record);
    state.currentElo += eloChange;
    state.bestElo = Math.max(state.bestElo, state.currentElo);
    state.totalXpEarned += Math.max(10, Math.round(Math.abs(eloChange) * 2 + match.player1Score * 0.1));
    saveState(state);
    return record;
  } catch {
    return { ...match, id: uid(), timestamp: Date.now(), eloChange: 0 };
  }
}

/** Clear all match history from storage. */
export function clearMatchHistory(): boolean {
  try {
    const state = loadState();
    state.matchHistory = [];
    saveState(state);
    return true;
  } catch { return false; }
}

// ── 2. Win Statistics ─────────────────────────────────────────────────────────

/** Aggregate win/loss stats across all (or filtered) matches. */
export function getWinStats(modeFilter?: PvPMatchMode): WinStats {
  const empty: WinStats = {
    totalMatches: 0, wins: 0, losses: 0, ties: 0, winRate: 0, currentStreak: 0,
    bestWinStreak: 0, bestLossStreak: 0, bestScore: 0, averageScore: 0,
    averageOpponentScore: 0, totalPlayTimeSeconds: 0,
  };
  try {
    const matches = loadState().matchHistory;
    const filtered = modeFilter ? matches.filter((m) => m.mode === modeFilter) : matches;
    if (!filtered.length) return empty;

    let wins = 0, losses = 0, ties = 0, bestScore = 0, totalP = 0, totalO = 0, playTime = 0;
    let bws = 0, bls = 0, cws = 0, cls = 0;
    for (const m of filtered) {
      if (m.winner === 'player1') { wins++; cws++; cls = 0; bws = Math.max(bws, cws); }
      else if (m.winner === 'player2') { losses++; cls++; cws = 0; bls = Math.max(bls, cls); }
      else { ties++; cws = 0; cls = 0; }
      bestScore = Math.max(bestScore, m.player1Score);
      totalP += m.player1Score; totalO += m.player2Score; playTime += m.durationSeconds;
    }
    return {
      totalMatches: filtered.length, wins, losses, ties,
      winRate: wins / filtered.length, currentStreak: calculateStreak(filtered),
      bestWinStreak: bws, bestLossStreak: bls, bestScore,
      averageScore: Math.round(totalP / filtered.length),
      averageOpponentScore: Math.round(totalO / filtered.length),
      totalPlayTimeSeconds: playTime,
    };
  } catch { return empty; }
}

// ── 3. Player Profile Summary ─────────────────────────────────────────────────

/** Compact PvP player card with rank, stats, and preferences. */
export function getPlayerProfileSummary(playerName: string = 'Player'): PlayerProfileSummary {
  try {
    const state = loadState();
    const stats = getWinStats();
    const rank = getRankForElo(state.currentElo);

    const mc: Record<PvPMatchMode, number> = { 'pvp-local': 0, 'pvp-ai': 0 };
    const ac: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    for (const m of state.matchHistory) { mc[m.mode]++; if (m.aiDifficulty) ac[m.aiDifficulty]++; }

    return {
      playerName, totalPvPMatches: stats.totalMatches, wins: stats.wins,
      losses: stats.losses, ties: stats.ties, winRate: stats.winRate,
      currentElo: state.currentElo, bestElo: state.bestElo,
      currentStreak: stats.currentStreak, bestScore: stats.bestScore,
      averageScore: stats.averageScore,
      favoriteMode: stats.totalMatches > 0 ? (mc['pvp-ai'] >= mc['pvp-local'] ? 'pvp-ai' : 'pvp-local') : null,
      favoriteAIDifficulty: ac.hard >= ac.medium && ac.hard >= ac.easy ? 'hard' : ac.medium >= ac.easy ? 'medium' : ac.easy > 0 ? 'easy' : null,
      rankTitle: rank.title, rankEmoji: rank.emoji,
    };
  } catch {
    const r = getRankForElo(DEFAULT_ELO);
    return { playerName, totalPvPMatches: 0, wins: 0, losses: 0, ties: 0, winRate: 0,
      currentElo: DEFAULT_ELO, bestElo: DEFAULT_ELO, currentStreak: 0, bestScore: 0,
      averageScore: 0, favoriteMode: null, favoriteAIDifficulty: null,
      rankTitle: r.title, rankEmoji: r.emoji };
  }
}

// ── 4. Elo Rating ─────────────────────────────────────────────────────────────

/**
 * Simple Elo calculation:
 *   Expected = 1 / (1 + 10^((Rb - Ra) / 400))
 *   New = Ra + K * (Actual - Expected)
 */
export function calculateEloRating(
  playerScore: number, opponentScore: number,
  currentElo: number = DEFAULT_ELO, kFactor: number = DEFAULT_K,
): { newElo: number; change: number; expectedScore: number; actualScore: number } {
  const actual = playerScore > opponentScore ? 1 : playerScore < opponentScore ? 0 : 0.5;
  const estOpponent = currentElo + (opponentScore - playerScore) * 2;
  const expected = 1 / (1 + Math.pow(10, (estOpponent - currentElo) / 400));
  const change = Math.round(kFactor * (actual - expected));
  return { newElo: Math.max(0, currentElo + change), change, expectedScore: expected, actualScore: actual };
}

/** Get current Elo without modifying it. */
export function getCurrentElo(): number { try { return loadState().currentElo; } catch { return DEFAULT_ELO; } }

/** Get best Elo achieved. */
export function getBestElo(): number { try { return loadState().bestElo; } catch { return DEFAULT_ELO; } }

/** Reset Elo to default. */
export function resetElo(): { previousElo: number; newElo: number } {
  try {
    const state = loadState(); const prev = state.currentElo;
    state.currentElo = DEFAULT_ELO; saveState(state);
    return { previousElo: prev, newElo: DEFAULT_ELO };
  } catch { return { previousElo: DEFAULT_ELO, newElo: DEFAULT_ELO }; }
}

// ── 5. Match Setup ────────────────────────────────────────────────────────────

/** Creates a fully configured PvP match with game state overrides. */
export function setupPvPMatch(config: PvPMatchSetupConfig): PvPMatchSetupResult {
  const pvpState = createPvPState();
  let aiBotState: AiBotState | null = null;
  let difficultyLabel = '';

  if (config.mode === 'pvp-ai' && config.aiDifficulty) {
    aiBotState = createAiBot(config.aiDifficulty);
    difficultyLabel = AI_BOT_CONFIG[config.aiDifficulty].label;
  } else {
    difficultyLabel = config.mode === 'pvp-local' ? 'Local PvP' : 'Unknown';
  }

  let estimatedDuration = '2–5 min';
  if (config.timeLimitSeconds) estimatedDuration = formatDuration(config.timeLimitSeconds);
  else if (config.targetScore) estimatedDuration = `~${Math.max(1, Math.round(config.targetScore / 50))} min`;

  // Adjust P2 spawn for non-standard grids
  if (config.gridWidth && config.gridHeight) {
    const maxX = Math.min(config.gridWidth - 1, 26);
    const midY = Math.floor(config.gridHeight / 2);
    pvpState.player2Snake = [
      { x: maxX, y: midY },
      { x: Math.min(maxX + 1, config.gridWidth - 1), y: midY },
      { x: Math.min(maxX + 2, config.gridWidth - 1), y: midY },
    ];
  }

  return { pvpState, aiBotState, config, estimatedDuration, difficultyLabel };
}

// ── 6. AI Opponent Configuration ──────────────────────────────────────────────

/** Returns complete AI opponent config based on difficulty and personality. */
export function configureAIOpponent(
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  personality: AIPersonality = 'strategic',
): AIOpponentConfiguration {
  const base = AI_BOT_CONFIG[difficulty].intelligence;
  const mods: Record<AIPersonality, { intMod: number; delay: number; aggro: number; mistakes: number; steal: number; desc: string }> = {
    aggressive: { intMod: 0.05, delay: 50, aggro: 0.8, mistakes: 0.15, steal: 0.7, desc: 'Rushes toward words and actively challenges your path.' },
    defensive: { intMod: 0.1, delay: 150, aggro: 0.2, mistakes: 0.1, steal: 0.2, desc: 'Plays it safe, avoids collisions, and rarely steals.' },
    chaotic: { intMod: -0.2, delay: 80, aggro: 0.5, mistakes: 0.4, steal: 0.5, desc: 'Unpredictable moves — expect the unexpected!' },
    strategic: { intMod: 0.08, delay: 100, aggro: 0.5, mistakes: 0.12, steal: 0.4, desc: 'Balanced approach with smart pathfinding.' },
    mimic: { intMod: 0, delay: 60, aggro: 0.4, mistakes: 0.2, steal: 0.3, desc: 'Copies your strategies — can you outsmart yourself?' },
  };
  const mod = mods[personality];
  const intelligence = Math.max(0, Math.min(1, base + mod.intMod));
  return {
    difficulty, personality, intelligence,
    reactionDelayMs: Math.round(mod.delay * (1.2 - intelligence * 0.5)),
    aggressionFactor: mod.aggro, mistakeFrequency: mod.mistakes,
    stealPowerUpChance: mod.steal, description: mod.desc,
    colorScheme: PERSONALITY_COLORS[personality],
  };
}

/** List all available AI personalities with descriptions. */
export function getAvailablePersonalities(): { personality: AIPersonality; label: string; description: string; bestFor: string }[] {
  return [
    { personality: 'aggressive', label: 'Aggressive', description: 'Rushes toward words and challenges your path.', bestFor: 'Experienced players' },
    { personality: 'defensive', label: 'Defensive', description: 'Plays safe and avoids collisions.', bestFor: 'Learning the ropes' },
    { personality: 'chaotic', label: 'Chaotic', description: 'Random and unpredictable movements.', bestFor: 'Fun, casual matches' },
    { personality: 'strategic', label: 'Strategic', description: 'Balanced approach with smart pathfinding.', bestFor: 'Competitive play' },
    { personality: 'mimic', label: 'Mimic', description: 'Mirrors your movements and strategies.', bestFor: 'Testing your adaptability' },
  ];
}

// ── 7. Head to Head ───────────────────────────────────────────────────────────

/** Compare player performance against the AI/opponent. */
export function getHeadToHead(modeFilter?: PvPMatchMode): HeadToHeadResult {
  const empty: HeadToHeadResult = {
    totalMatches: 0, playerWins: 0, opponentWins: 0, ties: 0, winRate: 0,
    averagePlayerScore: 0, averageOpponentScore: 0, averageScoreDifference: 0,
    longestWinStreak: 0, longestLossStreak: 0, biggestWinMargin: 0, biggestLossMargin: 0,
    totalWordsPlayer: 0, totalWordsOpponent: 0, recentTrend: 'stable', trendDetail: 'No matches played yet.',
  };
  try {
    const matches = loadState().matchHistory;
    const filtered = modeFilter ? matches.filter((m) => m.mode === modeFilter) : matches;
    if (!filtered.length) return empty;

    let pw = 0, ow = 0, t = 0, tps = 0, tos = 0, bwm = 0, blm = 0, twp = 0, two = 0;
    let lws = 0, lls = 0, cws = 0, cls = 0;
    for (const m of filtered) {
      if (m.winner === 'player1') { pw++; cws++; cls = 0; lws = Math.max(lws, cws); }
      else if (m.winner === 'player2') { ow++; cls++; cws = 0; lls = Math.max(lls, cls); }
      else { t++; cws = 0; cls = 0; }
      const margin = m.player1Score - m.player2Score;
      if (margin > 0) bwm = Math.max(bwm, margin);
      if (margin < 0) blm = Math.max(blm, Math.abs(margin));
      tps += m.player1Score; tos += m.player2Score;
      twp += m.player1WordsEaten.length; two += m.player2WordsEaten.length;
    }
    const n = filtered.length;
    const avgP = Math.round(tps / n), avgO = Math.round(tos / n);

    // Trend from last 5
    const recent = filtered.slice(-5);
    const rw = recent.filter((m) => m.winner === 'player1').length;
    const rl = recent.filter((m) => m.winner === 'player2').length;
    let recentTrend: HeadToHeadResult['recentTrend'];
    let trendDetail: string;
    if (rw > rl + 1) { recentTrend = 'improving'; trendDetail = `Won ${rw} of last ${recent.length}. Keep it up!`; }
    else if (rl > rw + 1) { recentTrend = 'declining'; trendDetail = `Lost ${rl} of last ${recent.length}. Regroup!`; }
    else { recentTrend = 'stable'; trendDetail = `Split results in last ${recent.length}. Evenly matched!`; }

    return {
      totalMatches: n, playerWins: pw, opponentWins: ow, ties: t, winRate: pw / n,
      averagePlayerScore: avgP, averageOpponentScore: avgO, averageScoreDifference: avgP - avgO,
      longestWinStreak: lws, longestLossStreak: lls, biggestWinMargin: bwm, biggestLossMargin: blm,
      totalWordsPlayer: twp, totalWordsOpponent: two, recentTrend, trendDetail,
    };
  } catch { return empty; }
}

// ── 8. PvP Leaderboard ────────────────────────────────────────────────────────

/** Ranked leaderboard of PvP match scores, highest first. */
export function getPvPLeaderboard(limit: number = 10, modeFilter?: PvPMatchMode): PvPLeaderboardEntry[] {
  try {
    const matches = loadState().matchHistory;
    const filtered = modeFilter ? matches.filter((m) => m.mode === modeFilter) : matches;
    const sorted = [...filtered].sort((a, b) => b.player1Score !== a.player1Score ? b.player1Score - a.player1Score : b.timestamp - a.timestamp);

    let elo = DEFAULT_ELO;
    return sorted.slice(0, limit).map((m, i) => {
      elo += m.eloChange;
      return {
        rank: i + 1, matchId: m.id, playerName: 'Player', score: m.player1Score,
        wordsEaten: m.player1WordsEaten.length, opponentScore: m.player2Score,
        margin: m.player1Score - m.player2Score, mode: m.mode,
        aiDifficulty: m.aiDifficulty, durationSeconds: m.durationSeconds,
        timestamp: m.timestamp, eloAfterMatch: elo,
      };
    });
  } catch { return []; }
}

// ── 9. Rematch ────────────────────────────────────────────────────────────────

/** Analyzes the last match and suggests whether to rematch, with settings adjustments. */
export function getRematchOption(lastMatch: PvPMatchRecord | null): RematchOption {
  if (!lastMatch) return {
    suggested: true, reason: 'No recent match found. Start a new PvP game!',
    recommendedDifficulty: 'medium', recommendedPersonality: 'strategic', confidence: 0.5,
    motivationalMessage: '🎮 Every champion starts with their first match!',
  };

  const diff = lastMatch.player1Score - lastMatch.player2Score;
  const won = lastMatch.winner === 'player1';
  const tied = lastMatch.winner === 'tie';
  const isAI = lastMatch.mode === 'pvp-ai';

  let reason = '', recDiff: 'easy' | 'medium' | 'hard' | null = null;
  let recPers: AIPersonality | null = null, conf = 0.5, msg = '';

  if (tied) {
    reason = 'That was a tie! One more round to settle it?';
    recDiff = lastMatch.aiDifficulty ?? null; recPers = 'aggressive'; conf = 0.9;
    msg = '⚡ So close! A rematch will decide the winner!';
  } else if (won) {
    if (diff > 100) {
      reason = 'Dominant victory! Ready for a harder challenge?';
      recDiff = isAI ? (lastMatch.aiDifficulty === 'easy' ? 'medium' : 'hard') : null;
      recPers = 'aggressive'; conf = 0.8; msg = '🔥 Too easy? Step up the difficulty!';
    } else {
      reason = 'Close win! Try again to prove it was no fluke.';
      recDiff = lastMatch.aiDifficulty ?? null; recPers = 'strategic'; conf = 0.85;
      msg = '💪 You won — but can you do it again?';
    }
  } else {
    const margin = Math.abs(diff);
    if (margin > 100) {
      reason = 'Tough loss. Lower the difficulty or try a different personality?';
      recDiff = isAI ? (lastMatch.aiDifficulty === 'hard' ? 'medium' : 'easy') : null;
      recPers = 'defensive'; conf = 0.7; msg = '🔄 Everyone loses sometimes. Adjust and retry!';
    } else {
      reason = 'So close! One more try and you can turn it around.';
      recDiff = lastMatch.aiDifficulty ?? null; recPers = 'strategic'; conf = 0.9;
      msg = '🎯 Just missed it! Rematch to flip the result!';
    }
  }

  return { suggested: true, reason, recommendedDifficulty: recDiff, recommendedPersonality: recPers, confidence: conf, motivationalMessage: msg };
}

// ── 10. PvP Tips ──────────────────────────────────────────────────────────────

const TIPS_DB: Omit<PvPTip, 'relevance'>[] = [
  { id: 'pvp-s1', category: 'strategy', title: 'Control the Center', content: 'Position in the center for equal access to words in all directions.', priority: 8 },
  { id: 'pvp-s2', category: 'strategy', title: 'Corner Trap', content: 'Lure your opponent into corners where escape routes are limited.', priority: 7 },
  { id: 'pvp-s3', category: 'strategy', title: 'Path Planning', content: 'Think 3–4 moves ahead. Good path planning prevents getting boxed in.', priority: 9 },
  { id: 'pvp-s4', category: 'strategy', title: 'Word Priority', content: 'Focus on longer words for more points instead of short words nearby.', priority: 6 },
  { id: 'pvp-s5', category: 'strategy', title: 'Study the AI', content: 'Watch the AI\'s movement patterns. Each personality has tendencies you can exploit.', priority: 8 },
  { id: 'pvp-p1', category: 'powerups', title: 'Steal Strategically', content: 'Only steal power-ups when close to the opponent and they have high-value effects.', priority: 7 },
  { id: 'pvp-p2', category: 'powerups', title: 'Shield Timing', content: 'Save Shield for critical moments in tight spaces near your opponent.', priority: 8 },
  { id: 'pvp-p3', category: 'powerups', title: 'Double Points Burst', content: 'Activate Double Points when a high-value word is nearby for max score impact.', priority: 7 },
  { id: 'pvp-p4', category: 'powerups', title: 'Deny Opponent', content: 'Grab power-ups even if you don\'t need them — denying resources is a valid strategy!', priority: 6 },
  { id: 'pvp-d1', category: 'defense', title: 'Wall Safety', content: 'Stay away from walls when your opponent is nearby. Wall collisions are the most common loss.', priority: 9 },
  { id: 'pvp-d2', category: 'defense', title: 'Tail Awareness', content: 'Always know where your own tail is. Self-collisions are embarrassing and avoidable.', priority: 8 },
  { id: 'pvp-d3', category: 'defense', title: 'Create Escape Routes', content: 'Keep at least two directions open at all times so you can dodge sudden threats.', priority: 8 },
  { id: 'pvp-sc1', category: 'scoring', title: 'Combo Chains', content: 'Maintain word collection combos in PvP. They stack faster and can swing a close match.', priority: 7 },
  { id: 'pvp-sc2', category: 'scoring', title: 'Rare Word Rush', content: 'Rare and legendary words appear less often. Drop everything and grab them!', priority: 8 },
  { id: 'pvp-sc3', category: 'scoring', title: 'Margin Matters', content: 'Score margin affects Elo rating change. Dominate for bigger gains!', priority: 7 },
  { id: 'pvp-m1', category: 'mental', title: 'Stay Calm', content: 'Panic leads to mistakes. Take a deep breath before making sharp turns.', priority: 9 },
  { id: 'pvp-m2', category: 'mental', title: 'Learn from Losses', content: 'Review your losses — they teach more than wins. What went wrong?', priority: 8 },
  { id: 'pvp-m3', category: 'mental', title: 'Warm Up First', content: 'Play a quick easy AI match before competitive games to warm up reflexes.', priority: 5 },
  { id: 'pvp-m4', category: 'mental', title: 'Take Breaks', content: 'Losing streak? Take a 5-minute break. Mental fatigue causes careless mistakes.', priority: 7 },
];

/** Returns contextual PvP tips ranked by relevance to recent performance. */
export function getPvPTips(matchHistory: PvPMatchRecord[], maxTips: number = 5): PvPTip[] {
  try {
    const dismissed = loadState().dismissedTipIds;
    const candidates = TIPS_DB.filter((t) => !dismissed.includes(t.id));
    if (!candidates.length) return [];

    const recent = matchHistory.slice(-10);
    const w: Record<PvPTip['category'], number> = { strategy: 0.5, powerups: 0.5, defense: 0.5, scoring: 0.5, mental: 0.5 };

    if (recent.length > 0) {
      const losses = recent.filter((m) => m.winner === 'player2').length;
      const avgScore = recent.reduce((s, m) => s + m.player1Score, 0) / recent.length;
      const closeMatches = recent.filter((m) => Math.abs(m.player1Score - m.player2Score) < 30).length;
      const last5Losses = recent.slice(-5).filter((m) => m.winner === 'player2').length;
      const winRate = recent.filter((m) => m.winner === 'player1').length / recent.length;

      if (losses >= recent.length * 0.6) { w.defense = 0.9; w.mental = 0.8; w.strategy = 0.7; }
      if (avgScore < 50) { w.scoring = 0.9; w.strategy = 0.7; }
      if (closeMatches >= recent.length * 0.5) { w.powerups = 0.9; w.strategy = 0.8; }
      if (last5Losses >= 4) { w.mental = 1.0; }
      if (winRate > 0.7) { w.strategy = 0.9; w.scoring = 0.7; }
    }

    return candidates.map((tip) => ({
      ...tip, relevance: Math.min(1, (tip.priority / 10) * 0.6 + (w[tip.category] ?? 0.5) * 0.4),
    })).sort((a, b) => b.relevance - a.relevance || b.priority - a.priority).slice(0, maxTips);
  } catch {
    return TIPS_DB.sort((a, b) => b.priority - a.priority).slice(0, 3).map((t) => ({ ...t, relevance: 0.5 }));
  }
}

/** Mark a PvP tip as dismissed. */
export function dismissPvPTip(tipId: string): boolean {
  try {
    const state = loadState();
    if (!state.dismissedTipIds.includes(tipId)) { state.dismissedTipIds.push(tipId); saveState(state); }
    return true;
  } catch { return false; }
}

/** Reset all dismissed PvP tips. */
export function resetDismissedPvPTips(): boolean {
  try { const s = loadState(); s.dismissedTipIds = []; saveState(s); return true; } catch { return false; }
}

// ── Utility Exports ───────────────────────────────────────────────────────────

/** Get all rank tiers for display. */
export function getRankTiers(): { minElo: number; title: string; emoji: string }[] {
  return RANK_TIERS.map((t) => ({ ...t }));
}

/** Get rank info with progress toward next tier. */
export function getRankInfo(elo: number): { title: string; emoji: string; progress: number } {
  const rank = getRankForElo(elo);
  const idx = RANK_TIERS.findIndex((t) => t.minElo === rank.minElo);
  const next = RANK_TIERS[idx + 1];
  const progress = next ? (elo - rank.minElo) / (next.minElo - rank.minElo) : 1;
  return { ...rank, progress: Math.min(1, Math.max(0, progress)) };
}

/** Get total XP earned from PvP. */
export function getPvPXPEarned(): number { try { return loadState().totalXpEarned; } catch { return 0; } }

/** Format an Elo change as a signed string. */
export function formatEloChange(change: number): string {
  return change > 0 ? `+${change}` : change < 0 ? `${change}` : '±0';
}
