// ─── Global Leaderboard Wire for Word Snake ────────────────────────────────
// Standalone functions for multi-category leaderboard persistence with localStorage.

// ─── Types ───────────────────────────────────────────────────────────────────

export type TimePeriod = "today" | "thisWeek" | "thisMonth" | "allTime";

export interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPeriodic: boolean;
  resetCadence: "daily" | "weekly" | "monthly" | "never";
  sortOrder: number;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  avatar: string;
  score: number;
  rank: number;
  previousRank: number;
  category: string;
  period: TimePeriod;
  timestamp: number;
  badge?: string;
  highlight?: boolean;
}

export interface PlayerRankData {
  rank: number;
  previousRank: number;
  score: number;
  totalPlayers: number;
  percentile: number;
  trend: "improving" | "declining" | "stable" | "new";
}

export interface RankHistoryEntry {
  rank: number;
  timestamp: number;
  period: string;
}

export interface SeasonInfo {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  isActive: boolean;
  weekNumber: number;
}

export interface LeaderboardState {
  entries: Record<string, LeaderboardEntry[]>;
  rankHistory: Record<string, RankHistoryEntry[]>;
  seasonHistory: SeasonInfo[];
  currentSeason: SeasonInfo | null;
  initialized: boolean;
  lastRefresh: number;
  currentPlayerId: string;
}

export interface LeaderboardStats {
  totalCategories: number;
  totalEntries: number;
  playerParticipations: number;
  averageScores: Record<string, number>;
  topScoreEver: number;
}

export interface LeaderboardSummary {
  categories: LeaderboardCategory[];
  stats: LeaderboardStats;
  currentSeason: SeasonInfo | null;
  playerAverageRank: number;
  playerMedals: { gold: number; silver: number; bronze: number };
  dominantCategory: string | null;
}

export interface LeaderboardCard {
  category: LeaderboardCategory;
  top3: LeaderboardEntry[];
  playerRank: PlayerRankData | null;
}

export interface LeaderboardRow {
  rank: number;
  playerName: string;
  avatar: string;
  score: number;
  badge: string | null;
  rankChange: number;
  isCurrentPlayer: boolean;
  highlight: boolean;
  percentile: number;
}

export interface LeaderboardTable {
  category: LeaderboardCategory;
  period: TimePeriod;
  page: number;
  pageSize: number;
  totalPages: number;
  rows: LeaderboardRow[];
  playerRank: PlayerRankData | null;
}

export interface ComparisonResult {
  currentPlayer: { name: string; score: number; rank: number };
  targetPlayer: { name: string; score: number; rank: number };
  rankDifference: number;
  scoreDifference: number;
  winRatio: number;
  categoriesWon: string[];
  categoriesLost: string[];
}

export interface LeaderboardOverview {
  summary: LeaderboardSummary;
  podiums: Record<string, LeaderboardEntry[]>;
  categoryCards: LeaderboardCard[];
  topMovers: LeaderboardEntry[];
  weeklyResetCountdown: string;
  monthlyResetCountdown: string;
  activeSeason: SeasonInfo | null;
}

export interface PodiumData {
  gold: LeaderboardEntry | null;
  silver: LeaderboardEntry | null;
  bronze: LeaderboardEntry | null;
  category: LeaderboardCategory;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "ws_leaderboard_wire";
const CURRENT_PLAYER_ID = "player_self";

const AVATARS = [
  "🐍", "🐉", "🦎", "🐊", "🐢", "🐙", "🦑", "🐡", "🦈", "🐬",
  "🦩", "🦚", "🦜", "🦊", "🐯", "🦁", "🐻", "🐼", "🐨", "🦄",
  "🐝", "🦋", "🐞", "🦗", "🦂", "🕷", "🐢", "🦎", "🐊", "🐉",
  "🎃", "👻", "👽", "🤖", "💀", "🎃", "🧙", "🧛", "🧟", "🧞",
  "⚡", "🔥", "💧", "🌟", "💫", "🌈", "💎", "🏆", "👑", "🎯",
];

const MOCK_PLAYER_NAMES: string[] = [
  "DragonSlayer99", "WordNinja", "SnakeKing", "LetterHunter", "VowelViper",
  "ConsonantCrusher", "AlphaAce", "BetaBlaster", "GammaGuru", "DeltaDash",
  "EpsilonEagle", "ZetaZapper", "EtaEater", "ThetaThrill", "IotaInvoker",
  "KappaKing", "LambdaLion", "MuMaster", "NuNoble", "XiXenon",
  "OmicronOracle", "PiPhantom", "RhoRider", "SigmaSnake", "TauTitan",
  "UpsilonUltra", "PhiFighter", "ChiChampion", "PsiPredator", "OmegaOverlord",
  "LexiconLegend", "SyllableSamurai", "PhonemePhoenix", "MorphemeMage", "SyntaxSorcerer",
  "GrammarGuard", "PunctuationPaladin", "ProsePriest", "VerseValkyrie", "RuneRanger",
  "ThesaurusThief", "DictionaryDuke", "AnagramAssassin", "PalindromePrince", "AcronymAce",
  "CrypticClaw", "VocabViking", "WordWizard", "SpellSmith", "GlyphGlider",
];

const CATEGORIES: LeaderboardCategory[] = [
  { id: "overall_score", name: "Overall Score", description: "Combined score across all game modes", icon: "🏆", isPeriodic: false, resetCadence: "never", sortOrder: 0 },
  { id: "words_eaten", name: "Words Eaten", description: "Total words consumed by your snake", icon: "🍔", isPeriodic: false, resetCadence: "never", sortOrder: 1 },
  { id: "longest_snake", name: "Longest Snake", description: "Maximum snake length achieved", icon: "📏", isPeriodic: false, resetCadence: "never", sortOrder: 2 },
  { id: "combo_master", name: "Combo Master", description: "Highest combo chain completed", icon: "🔥", isPeriodic: false, resetCadence: "never", sortOrder: 3 },
  { id: "speed_run", name: "Speed Run", description: "Fastest time to reach target score", icon: "⚡", isPeriodic: false, resetCadence: "never", sortOrder: 4 },
  { id: "marathon", name: "Marathon", description: "Longest single session duration", icon: "🏃", isPeriodic: false, resetCadence: "never", sortOrder: 5 },
  { id: "daily_challenge", name: "Daily Challenge", description: "Best daily challenge performance", icon: "📅", isPeriodic: true, resetCadence: "daily", sortOrder: 6 },
  { id: "weekly_quest", name: "Weekly Quest", description: "Weekly quest points accumulated", icon: "📋", isPeriodic: true, resetCadence: "weekly", sortOrder: 7 },
  { id: "monthly_points", name: "Monthly Points", description: "Monthly cumulative score", icon: "📆", isPeriodic: true, resetCadence: "monthly", sortOrder: 8 },
  { id: "alltime_streak", name: "All-Time Streak", description: "Consecutive days played", icon: "🔥", isPeriodic: false, resetCadence: "never", sortOrder: 9 },
];

// ─── Storage Helpers ─────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof globalThis.window !== "undefined";
}

function loadState(): LeaderboardState {
  if (!isBrowser()) {
    return createEmptyState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LeaderboardState;
      return { ...createEmptyState(), ...parsed };
    }
  } catch {
    // corrupted data — start fresh
  }
  return createEmptyState();
}

function saveState(state: LeaderboardState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full — silently fail
  }
}

function createEmptyState(): LeaderboardState {
  return {
    entries: {},
    rankHistory: {},
    seasonHistory: [],
    currentSeason: null,
    initialized: false,
    lastRefresh: 0,
    currentPlayerId: CURRENT_PLAYER_ID,
  };
}

// ─── Time Helpers ────────────────────────────────────────────────────────────

function todayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function thisWeekStart(): number {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

function thisMonthStart(): number {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function filterByPeriod(entries: LeaderboardEntry[], period: TimePeriod): LeaderboardEntry[] {
  const now = Date.now();
  let cutoff = 0;
  switch (period) {
    case "today":
      cutoff = todayStart();
      break;
    case "thisWeek":
      cutoff = thisWeekStart();
      break;
    case "thisMonth":
      cutoff = thisMonthStart();
      break;
    case "allTime":
    default:
      return entries;
  }
  return entries.filter((e) => e.timestamp >= cutoff);
}

function assignBadge(entry: LeaderboardEntry): string | undefined {
  if (entry.rank === 1) return "🥇";
  if (entry.rank === 2) return "🥈";
  if (entry.rank === 3) return "🥉";
  return undefined;
}

function getCategoryById(id: string): LeaderboardCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

function makeKey(category: string, period: TimePeriod): string {
  return `${category}::${period}`;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ─── Mock Data Generation ────────────────────────────────────────────────────

function generateMockPlayers(): LeaderboardEntry[] {
  const now = Date.now();
  const players: LeaderboardEntry[] = [];

  for (let i = 0; i < MOCK_PLAYER_NAMES.length; i++) {
    const name = MOCK_PLAYER_NAMES[i];
    const playerId = `mock_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    const avatar = AVATARS[i % AVATARS.length];
    const baseSeed = i * 137 + 42;

    for (const cat of CATEGORIES) {
      for (const period of ["allTime"] as TimePeriod[]) {
        const scoreVariation = Math.floor(seededRandom(baseSeed + cat.sortOrder * 7) * 9000) + 1000;
        const previousScore = Math.floor(seededRandom(baseSeed + cat.sortOrder * 13 + 100) * 9500) + 500;
        const ts = now - Math.floor(seededRandom(baseSeed + 3) * 30 * 24 * 60 * 60 * 1000);

        players.push({
          playerId,
          playerName: name,
          avatar,
          score: scoreVariation,
          rank: 0,
          previousRank: 0,
          category: cat.id,
          period,
          timestamp: ts,
        });
      }
    }
  }

  // Add period-specific entries for a subset (recent activity)
  const recentPeriods: TimePeriod[] = ["today", "thisWeek", "thisMonth"];
  const todayCutoff = todayStart();
  const weekCutoff = thisWeekStart();
  const monthCutoff = thisMonthStart();
  const cutoffs: Record<string, number> = { today: todayCutoff, thisWeek: weekCutoff, thisMonth: monthCutoff };

  for (let i = 0; i < 30; i++) {
    const name = MOCK_PLAYER_NAMES[i];
    const playerId = `mock_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    const avatar = AVATARS[i % AVATARS.length];
    const baseSeed = i * 137 + 42;

    for (const cat of CATEGORIES) {
      for (const period of recentPeriods) {
        if (seededRandom(baseSeed + cat.sortOrder * 3 + period.length) < 0.4) continue;
        const scoreVal = Math.floor(seededRandom(baseSeed + cat.sortOrder * 11 + period.length * 7) * 5000) + 500;
        const ts = cutoffs[period] + Math.floor(seededRandom(baseSeed + 5) * (Date.now() - cutoffs[period]));

        players.push({
          playerId,
          playerName: name,
          avatar,
          score: scoreVal,
          rank: 0,
          previousRank: 0,
          category: cat.id,
          period,
          timestamp: ts,
        });
      }
    }
  }

  return players;
}

function rankEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  return sorted.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    badge: assignBadge({ ...entry, rank: idx + 1 }),
  }));
}

function buildRankedEntries(players: LeaderboardEntry[]): Record<string, LeaderboardEntry[]> {
  const buckets: Record<string, LeaderboardEntry[]> = {};

  for (const cat of CATEGORIES) {
    for (const period of ["today", "thisWeek", "thisMonth", "allTime"] as TimePeriod[]) {
      const key = makeKey(cat.id, period);
      const matching = players.filter((p) => p.category === cat.id && p.period === period);
      buckets[key] = rankEntries(matching);
    }
  }

  return buckets;
}

// ─── Initialization ──────────────────────────────────────────────────────────

export function initLeaderboard(): LeaderboardState {
  const state = loadState();
  if (state.initialized) return state;

  const mockPlayers = generateMockPlayers();
  const entries = buildRankedEntries(mockPlayers);

  // Add current player with some default scores
  const now = Date.now();
  for (const cat of CATEGORIES) {
    for (const period of ["allTime", "thisMonth", "thisWeek", "today"] as TimePeriod[]) {
      const key = makeKey(cat.id, period);
      const baseScore = Math.floor(Math.random() * 6000) + 2000;
      const existing = entries[key] || [];
      existing.push({
        playerId: CURRENT_PLAYER_ID,
        playerName: "You",
        avatar: "🎮",
        score: baseScore,
        rank: 0,
        previousRank: 0,
        category: cat.id,
        period,
        timestamp: now,
        highlight: true,
      });
      entries[key] = rankEntries(existing);
    }
  }

  // Build rank history
  const rankHistory: Record<string, RankHistoryEntry[]> = {};
  for (const cat of CATEGORIES) {
    const key = cat.id;
    const history: RankHistoryEntry[] = [];
    const allTimeEntries = entries[makeKey(cat.id, "allTime")] || [];
    const playerEntry = allTimeEntries.find((e) => e.playerId === CURRENT_PLAYER_ID);
    if (playerEntry) {
      for (let w = 8; w >= 0; w--) {
        const variation = Math.floor(Math.random() * 10) - 5;
        history.push({
          rank: Math.max(1, playerEntry.rank + variation),
          timestamp: now - w * 7 * 24 * 60 * 60 * 1000,
          period: `Week ${9 - w}`,
        });
      }
    }
    rankHistory[key] = history;
  }

  // Season
  const seasonStart = thisMonthStart();
  const seasonEnd = seasonStart + 30 * 24 * 60 * 60 * 1000;
  const currentSeason: SeasonInfo = {
    id: "season_2025_01",
    name: "Season of the Serpent",
    startDate: seasonStart,
    endDate: seasonEnd,
    isActive: true,
    weekNumber: Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000)) + 1,
  };

  const seasonHistory: SeasonInfo[] = [
    {
      id: "season_2024_12",
      name: "Season of the Phoenix",
      startDate: seasonStart - 30 * 24 * 60 * 60 * 1000,
      endDate: seasonStart,
      isActive: false,
      weekNumber: 4,
    },
    {
      id: "season_2024_11",
      name: "Season of the Dragon",
      startDate: seasonStart - 60 * 24 * 60 * 60 * 1000,
      endDate: seasonStart - 30 * 24 * 60 * 60 * 1000,
      isActive: false,
      weekNumber: 4,
    },
    {
      id: "season_2024_10",
      name: "Season of the Owl",
      startDate: seasonStart - 90 * 24 * 60 * 60 * 1000,
      endDate: seasonStart - 60 * 24 * 60 * 60 * 1000,
      isActive: false,
      weekNumber: 4,
    },
  ];

  const newState: LeaderboardState = {
    entries,
    rankHistory,
    seasonHistory,
    currentSeason,
    initialized: true,
    lastRefresh: now,
    currentPlayerId: CURRENT_PLAYER_ID,
  };

  saveState(newState);
  return newState;
}

// ─── Core Data Access ────────────────────────────────────────────────────────

export function getLeaderboardData(
  category: string,
  period: TimePeriod = "allTime",
  page: number = 1,
  pageSize: number = 10
): { entries: LeaderboardEntry[]; totalPages: number; totalEntries: number } {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  const key = makeKey(category, period);
  let allEntries = freshState.entries[key] || [];

  if (period !== "allTime") {
    allEntries = filterByPeriod(allEntries, period);
  }

  const totalEntries = allEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * pageSize;
  const paginated = allEntries.slice(start, start + pageSize);

  return { entries: paginated, totalPages, totalEntries };
}

export function getGlobalRankings(category: string): LeaderboardEntry[] {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  return freshState.entries[makeKey(category, "allTime")] || [];
}

export function getPlayerRank(category: string, period: TimePeriod = "allTime"): PlayerRankData | null {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  const key = makeKey(category, period);
  let entries = freshState.entries[key] || [];

  if (period !== "allTime") {
    entries = filterByPeriod(entries, period);
  }

  const playerEntry = entries.find((e) => e.playerId === CURRENT_PLAYER_ID);
  if (!playerEntry) return null;

  const totalPlayers = entries.length;
  const percentile = totalPlayers > 0 ? Math.round(((totalPlayers - playerEntry.rank) / totalPlayers) * 100) : 0;

  let trend: PlayerRankData["trend"] = "stable";
  if (playerEntry.previousRank === 0) {
    trend = "new";
  } else if (playerEntry.rank < playerEntry.previousRank) {
    trend = "improving";
  } else if (playerEntry.rank > playerEntry.previousRank) {
    trend = "declining";
  }

  return {
    rank: playerEntry.rank,
    previousRank: playerEntry.previousRank,
    score: playerEntry.score,
    totalPlayers,
    percentile,
    trend,
  };
}

export function getPlayerBestRank(category: string): number | null {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  const history = freshState.rankHistory[category];
  if (!history || history.length === 0) {
    const allTimeEntries = freshState.entries[makeKey(category, "allTime")] || [];
    const playerEntry = allTimeEntries.find((e) => e.playerId === CURRENT_PLAYER_ID);
    return playerEntry ? playerEntry.rank : null;
  }

  let best = Infinity;
  for (const h of history) {
    if (h.rank < best) best = h.rank;
  }
  return best === Infinity ? null : best;
}

export function getTopPlayers(category: string, count: number = 10): LeaderboardEntry[] {
  const entries = getGlobalRankings(category);
  return entries.slice(0, count);
}

export function submitScore(category: string, score: number): LeaderboardEntry | null {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  const now = Date.now();

  // Check if player already has an entry for each period
  const periods: TimePeriod[] = ["allTime", "thisMonth", "thisWeek", "today"];
  for (const period of periods) {
    const key = makeKey(category, period);
    const existing = freshState.entries[key] || [];
    const playerIdx = existing.findIndex((e) => e.playerId === CURRENT_PLAYER_ID);

    const newEntry: LeaderboardEntry = {
      playerId: CURRENT_PLAYER_ID,
      playerName: "You",
      avatar: "🎮",
      score: playerIdx >= 0 ? Math.max(existing[playerIdx].score, score) : score,
      rank: 0,
      previousRank: playerIdx >= 0 ? existing[playerIdx].rank : 0,
      category,
      period,
      timestamp: now,
      highlight: true,
    };

    if (playerIdx >= 0) {
      existing[playerIdx] = newEntry;
    } else {
      existing.push(newEntry);
    }

    freshState.entries[key] = rankEntries(existing);
  }

  // Update rank history
  if (!freshState.rankHistory[category]) {
    freshState.rankHistory[category] = [];
  }
  const allTimeRanked = freshState.entries[makeKey(category, "allTime")] || [];
  const currentEntry = allTimeRanked.find((e) => e.playerId === CURRENT_PLAYER_ID);
  if (currentEntry) {
    freshState.rankHistory[category].push({
      rank: currentEntry.rank,
      timestamp: now,
      period: `Manual ${new Date(now).toLocaleDateString()}`,
    });
    // Keep only last 50 entries
    if (freshState.rankHistory[category].length > 50) {
      freshState.rankHistory[category] = freshState.rankHistory[category].slice(-50);
    }
  }

  freshState.lastRefresh = now;
  saveState(freshState);

  const finalEntries = freshState.entries[makeKey(category, "allTime")] || [];
  return finalEntries.find((e) => e.playerId === CURRENT_PLAYER_ID) || null;
}

export function getRankChange(category: string): { change: number; direction: "up" | "down" | "none" } {
  const rank = getPlayerRank(category, "allTime");
  if (!rank || rank.previousRank === 0) return { change: 0, direction: "none" };

  const change = rank.previousRank - rank.rank; // positive = improvement
  const direction = change > 0 ? "up" : change < 0 ? "down" : "none";
  return { change: Math.abs(change), direction };
}

// ─── Stats & Summary ─────────────────────────────────────────────────────────

export function getLeaderboardStats(): LeaderboardStats {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  let totalEntries = 0;
  let playerParticipations = 0;
  const averageScores: Record<string, number> = {};
  let topScoreEver = 0;

  for (const cat of CATEGORIES) {
    const allTimeKey = makeKey(cat.id, "allTime");
    const entries = freshState.entries[allTimeKey] || [];
    totalEntries += entries.length;

    const playerInCat = entries.some((e) => e.playerId === CURRENT_PLAYER_ID);
    if (playerInCat) playerParticipations++;

    if (entries.length > 0) {
      const sum = entries.reduce((acc, e) => acc + e.score, 0);
      averageScores[cat.id] = Math.round(sum / entries.length);
      const max = entries[0].score;
      if (max > topScoreEver) topScoreEver = max;
    }
  }

  return {
    totalCategories: CATEGORIES.length,
    totalEntries,
    playerParticipations,
    averageScores,
    topScoreEver,
  };
}

export function getCategories(): LeaderboardCategory[] {
  return [...CATEGORIES];
}

// ─── Search ──────────────────────────────────────────────────────────────────

export function searchPlayers(query: string): LeaderboardEntry[] {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  const lowerQuery = query.toLowerCase().trim();
  if (lowerQuery.length === 0) return [];

  const seen = new Set<string>();
  const results: LeaderboardEntry[] = [];

  // Search across all categories, prefer allTime
  for (const cat of CATEGORIES) {
    const entries = freshState.entries[makeKey(cat.id, "allTime")] || [];
    for (const entry of entries) {
      if (seen.has(entry.playerId)) continue;
      if (entry.playerName.toLowerCase().includes(lowerQuery)) {
        seen.add(entry.playerId);
        results.push(entry);
      }
    }
  }

  return results.slice(0, 20);
}

// ─── Player Profile ──────────────────────────────────────────────────────────

export function getPlayerProfile(playerId: string): {
  playerName: string;
  avatar: string;
  totalCategories: number;
  bestRank: number;
  averageScore: number;
  totalMedals: { gold: number; silver: number; bronze: number };
  ranks: Record<string, PlayerRankData>;
} | null {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  let playerName = "";
  let avatar = "";
  let bestRank = Infinity;
  let totalScore = 0;
  let categoryCount = 0;
  let gold = 0;
  let silver = 0;
  let bronze = 0;
  const ranks: Record<string, PlayerRankData> = {};

  for (const cat of CATEGORIES) {
    const entries = freshState.entries[makeKey(cat.id, "allTime")] || [];
    const entry = entries.find((e) => e.playerId === playerId);
    if (!entry) continue;

    playerName = entry.playerName;
    avatar = entry.avatar;
    categoryCount++;
    totalScore += entry.score;
    if (entry.rank < bestRank) bestRank = entry.rank;

    if (entry.rank === 1) gold++;
    if (entry.rank === 2) silver++;
    if (entry.rank === 3) bronze++;

    ranks[cat.id] = {
      rank: entry.rank,
      previousRank: entry.previousRank,
      score: entry.score,
      totalPlayers: entries.length,
      percentile: entries.length > 0 ? Math.round(((entries.length - entry.rank) / entries.length) * 100) : 0,
      trend: entry.rank < entry.previousRank ? "improving" : entry.rank > entry.previousRank ? "declining" : "stable",
    };
  }

  if (categoryCount === 0) return null;

  return {
    playerName,
    avatar,
    totalCategories: categoryCount,
    bestRank: bestRank === Infinity ? 0 : bestRank,
    averageScore: Math.round(totalScore / categoryCount),
    totalMedals: { gold, silver, bronze },
    ranks,
  };
}

// ─── Historical & Trends ─────────────────────────────────────────────────────

export function getRankHistory(category: string, periods: number = 8): RankHistoryEntry[] {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  const history = freshState.rankHistory[category] || [];
  return history.slice(-periods);
}

export function getRankTrend(category: string): "improving" | "declining" | "stable" {
  const history = getRankHistory(category, 4);
  if (history.length < 2) return "stable";

  const recent = history.slice(-2);
  const older = history.slice(-4, -2);
  const recentAvg = recent.reduce((s, h) => s + h.rank, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((s, h) => s + h.rank, 0) / older.length : recentAvg;

  const diff = olderAvg - recentAvg; // positive = rank number decreased (improved)
  if (diff > 1) return "improving";
  if (diff < -1) return "declining";
  return "stable";
}

// ─── Summary & Cards ─────────────────────────────────────────────────────────

export function getLeaderboardSummary(): LeaderboardSummary {
  const stats = getLeaderboardStats();
  const state = loadState();
  const medals = getMedalCount();
  const avgRank = getAverageRank();
  const dominant = getDominantCategory();

  return {
    categories: getCategories(),
    stats,
    currentSeason: state.currentSeason,
    playerAverageRank: avgRank,
    playerMedals: medals,
    dominantCategory: dominant,
  };
}

export function getLeaderboardCard(category: string): LeaderboardCard {
  const cat = getCategoryById(category) || CATEGORIES[0];
  const topAllTime = getTopPlayers(category, 3);
  const playerRank = getPlayerRank(category, "allTime");

  return {
    category: cat,
    top3: topAllTime,
    playerRank,
  };
}

export function getLeaderboardRow(entry: LeaderboardEntry, rank: number): LeaderboardRow {
  const totalPlayers = 51; // 50 mock + 1 current
  const percentile = totalPlayers > 0 ? Math.round(((totalPlayers - rank) / totalPlayers) * 100) : 0;
  const rankChange = entry.previousRank > 0 ? entry.previousRank - rank : 0;

  return {
    rank,
    playerName: entry.playerName,
    avatar: entry.avatar,
    score: entry.score,
    badge: assignBadge(entry) || null,
    rankChange,
    isCurrentPlayer: entry.playerId === CURRENT_PLAYER_ID,
    highlight: entry.highlight || false,
    percentile,
  };
}

export function getLeaderboardTable(
  category: string,
  period: TimePeriod = "allTime",
  page: number = 1
): LeaderboardTable {
  const cat = getCategoryById(category) || CATEGORIES[0];
  const { entries, totalPages, totalEntries } = getLeaderboardData(category, period, page, 10);
  const playerRank = getPlayerRank(category, period);

  const rows = entries.map((entry, idx) =>
    getLeaderboardRow(entry, (page - 1) * 10 + idx + 1)
  );

  return {
    category: cat,
    period,
    page,
    pageSize: 10,
    totalPages,
    rows,
    playerRank,
  };
}

// ─── Medals & Rankings ───────────────────────────────────────────────────────

export function getMedalCount(): { gold: number; silver: number; bronze: number } {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  let gold = 0;
  let silver = 0;
  let bronze = 0;

  for (const cat of CATEGORIES) {
    const entries = freshState.entries[makeKey(cat.id, "allTime")] || [];
    const playerEntry = entries.find((e) => e.playerId === CURRENT_PLAYER_ID);
    if (!playerEntry) continue;
    if (playerEntry.rank === 1) gold++;
    if (playerEntry.rank === 2) silver++;
    if (playerEntry.rank === 3) bronze++;
  }

  return { gold, silver, bronze };
}

export function getPercentile(category: string): number {
  const rank = getPlayerRank(category, "allTime");
  return rank ? rank.percentile : 0;
}

export function getAverageRank(): number {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  let totalRank = 0;
  let count = 0;

  for (const cat of CATEGORIES) {
    const entries = freshState.entries[makeKey(cat.id, "allTime")] || [];
    const playerEntry = entries.find((e) => e.playerId === CURRENT_PLAYER_ID);
    if (playerEntry) {
      totalRank += playerEntry.rank;
      count++;
    }
  }

  return count > 0 ? Math.round(totalRank / count) : 0;
}

export function getDominantCategory(): string | null {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  let bestRank = Infinity;
  let bestCategory: string | null = null;

  for (const cat of CATEGORIES) {
    const entries = freshState.entries[makeKey(cat.id, "allTime")] || [];
    const playerEntry = entries.find((e) => e.playerId === CURRENT_PLAYER_ID);
    if (playerEntry && playerEntry.rank < bestRank) {
      bestRank = playerEntry.rank;
      bestCategory = cat.id;
    }
  }

  return bestCategory;
}

// ─── Nearby & Comparison ─────────────────────────────────────────────────────

export function getNearbyPlayers(category: string, count: number = 5): {
  above: LeaderboardEntry[];
  below: LeaderboardEntry[];
  currentPlayer: LeaderboardEntry | null;
} {
  const rankings = getGlobalRankings(category);
  const playerIdx = rankings.findIndex((e) => e.playerId === CURRENT_PLAYER_ID);

  if (playerIdx === -1) {
    return { above: rankings.slice(0, count), below: [], currentPlayer: null };
  }

  const halfCount = Math.floor(count / 2);
  const aboveStart = Math.max(0, playerIdx - halfCount);
  const aboveEnd = playerIdx;
  const belowStart = playerIdx + 1;
  const belowEnd = belowStart + halfCount;

  return {
    above: rankings.slice(aboveStart, aboveEnd),
    below: rankings.slice(belowStart, belowEnd),
    currentPlayer: rankings[playerIdx],
  };
}

export function compareWithTarget(playerId: string): ComparisonResult | null {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  let currentFound = false;
  let targetFound = false;
  const categoriesWon: string[] = [];
  const categoriesLost: string[] = [];
  let currentTotalRank = 0;
  let targetTotalRank = 0;
  let categoryCount = 0;
  let currentTotalScore = 0;
  let targetTotalScore = 0;

  let currentPlayerData: { name: string; score: number; rank: number } = { name: "You", score: 0, rank: 0 };
  let targetPlayerData: { name: string; score: number; rank: number } = { name: "", score: 0, rank: 0 };

  for (const cat of CATEGORIES) {
    const entries = freshState.entries[makeKey(cat.id, "allTime")] || [];
    const currentEntry = entries.find((e) => e.playerId === CURRENT_PLAYER_ID);
    const targetEntry = entries.find((e) => e.playerId === playerId);

    if (currentEntry) {
      currentFound = true;
      currentTotalRank += currentEntry.rank;
      currentTotalScore += currentEntry.score;
      currentPlayerData = { name: currentEntry.playerName, score: currentEntry.score, rank: currentEntry.rank };
    }
    if (targetEntry) {
      targetFound = true;
      targetTotalRank += targetEntry.rank;
      targetTotalScore += targetEntry.score;
      targetPlayerData = { name: targetEntry.playerName, score: targetEntry.score, rank: targetEntry.rank };
    }

    if (currentEntry && targetEntry) {
      categoryCount++;
      if (currentEntry.rank < targetEntry.rank) {
        categoriesWon.push(cat.name);
      } else if (targetEntry.rank < currentEntry.rank) {
        categoriesLost.push(cat.name);
      }
    }
  }

  if (!currentFound || !targetFound || categoryCount === 0) return null;

  const avgCurrentRank = currentTotalRank / categoryCount;
  const avgTargetRank = targetTotalRank / categoryCount;
  const winRatio = categoriesWon.length / categoryCount;

  return {
    currentPlayer: currentPlayerData,
    targetPlayer: targetPlayerData,
    rankDifference: Math.round(avgTargetRank - avgCurrentRank),
    scoreDifference: Math.round((targetTotalScore - currentTotalScore) / categoryCount),
    winRatio,
    categoriesWon,
    categoriesLost,
  };
}

// ─── Resets & Seasons ────────────────────────────────────────────────────────

export function getWeeklyResetCountdown(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const diff = nextMonday.getTime() - now.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  return `${days}d ${hours}h ${minutes}m`;
}

export function getMonthlyResetCountdown(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
  const diff = nextMonth.getTime() - now.getTime();

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  return `${days}d ${hours}h ${minutes}m`;
}

export function getActiveSeason(): SeasonInfo | null {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  return freshState.currentSeason;
}

export function getSeasonHistory(count: number = 3): SeasonInfo[] {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  return freshState.seasonHistory.slice(-count);
}

// ─── Refresh & Movers ────────────────────────────────────────────────────────

export function refreshMockData(): LeaderboardState {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  const now = Date.now();

  // Randomly adjust mock player scores to simulate competition
  for (const cat of CATEGORIES) {
    for (const period of ["allTime", "thisMonth", "thisWeek", "today"] as TimePeriod[]) {
      const key = makeKey(cat.id, period);
      const entries = freshState.entries[key] || [];

      const updated = entries.map((entry) => {
        if (entry.playerId === CURRENT_PLAYER_ID) return entry;

        // Apply random fluctuation
        const fluctuation = Math.floor((Math.random() - 0.4) * 500); // slight upward bias
        const newScore = Math.max(100, entry.score + fluctuation);

        return {
          ...entry,
          score: newScore,
          previousRank: entry.rank,
          timestamp: Math.max(entry.timestamp, now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        };
      });

      freshState.entries[key] = rankEntries(updated);
    }
  }

  freshState.lastRefresh = now;
  saveState(freshState);
  return freshState;
}

export function getTopMovers(category: string, count: number = 5): LeaderboardEntry[] {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  const entries = freshState.entries[makeKey(category, "allTime")] || [];

  const movers = entries
    .filter((e) => e.previousRank > 0 && e.previousRank !== e.rank)
    .sort((a, b) => {
      const changeA = a.previousRank - a.rank;
      const changeB = b.previousRank - b.rank;
      return changeB - changeA;
    })
    .slice(0, count);

  return movers;
}

export function getLongestRanks(): Array<{ playerName: string; avatar: string; category: string; weeksAtOne: number }> {
  const state = loadState();
  if (!state.initialized) initLeaderboard();

  const freshState = loadState();
  const results: Array<{ playerName: string; avatar: string; category: string; weeksAtOne: number }> = [];

  for (const cat of CATEGORIES) {
    const history = freshState.rankHistory[cat.id] || [];
    const allTimeEntries = freshState.entries[makeKey(cat.id, "allTime")] || [];
    const topPlayer = allTimeEntries[0];

    if (!topPlayer) continue;

    // Count how many times in history this player was at rank 1
    let weeksAtOne = 0;
    for (const h of history) {
      // Check the top entry for that historical period
      if (h.rank === 1 && topPlayer.rank === 1) {
        weeksAtOne++;
      }
    }

    // Also look at current standing
    if (topPlayer.rank === 1) {
      weeksAtOne += 3; // Base estimate for current reign
    }

    results.push({
      playerName: topPlayer.playerName,
      avatar: topPlayer.avatar,
      category: cat.name,
      weeksAtOne,
    });
  }

  return results.sort((a, b) => b.weeksAtOne - a.weeksAtOne);
}

// ─── UI Helper Functions ─────────────────────────────────────────────────────

export function getLeaderboardOverview(): LeaderboardOverview {
  const summary = getLeaderboardSummary();
  const podiums: Record<string, LeaderboardEntry[]> = {};

  for (const cat of CATEGORIES.slice(0, 5)) {
    podiums[cat.id] = getTopPlayers(cat.id, 3);
  }

  const categoryCards = CATEGORIES.map((cat) => getLeaderboardCard(cat.id));
  const topMovers = getTopMovers("overall_score", 5);

  return {
    summary,
    podiums,
    categoryCards,
    topMovers,
    weeklyResetCountdown: getWeeklyResetCountdown(),
    monthlyResetCountdown: getMonthlyResetCountdown(),
    activeSeason: getActiveSeason(),
  };
}

export function getCategoryGrid(): LeaderboardCard[] {
  return CATEGORIES.map((cat) => getLeaderboardCard(cat.id));
}

export function getPodiumData(category: string): PodiumData {
  const cat = getCategoryById(category) || CATEGORIES[0];
  const top3 = getTopPlayers(category, 3);

  return {
    gold: top3[0] || null,
    silver: top3[1] || null,
    bronze: top3[2] || null,
    category: cat,
  };
}
