// ---------------------------------------------------------------------------
// Profile Card Wire — Word Snake Game
// Standalone functions (no class) with localStorage persistence.
// Storage key: ws_profile_card_wire
// ---------------------------------------------------------------------------

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type AvatarRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface AvatarItem {
  id: string;
  name: string;
  emoji: string;
  rarity: AvatarRarity;
  unlockCondition: string;
  unlocked: boolean;
  selected: boolean;
}

export interface TitleItem {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedDate: string | null;
}

export interface FrameItem {
  id: string;
  name: string;
  color: string;
  gradient: string;
  unlocked: boolean;
  selected: boolean;
}

export type ActivityStatus = "online" | "away" | "dnd" | "offline";

export interface FeaturedSlot {
  slot: number;
  achievementId: string | null;
}

export interface ProfileStats {
  gamesPlayed: number;
  wordsFound: number;
  totalScore: number;
  longestWord: number;
  bestCombo: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
}

export interface ProfileActivityEntry {
  type: "avatar_change" | "title_change" | "frame_change" | "achievement_earned" | "bio_update" | "level_up" | "rank_up";
  description: string;
  timestamp: number;
}

export interface ProfileState {
  currentAvatarId: string;
  currentTitleId: string;
  currentFrameId: string;
  unlockedAvatarIds: string[];
  earnedTitleIds: Record<string, string>; // titleId → earnedDate ISO
  unlockedFrameIds: string[];
  bio: string;
  mood: string;
  status: ActivityStatus;
  featuredAchievements: [string | null, string | null, string | null]; // 3 slots
  visibleStats: string[];
  joinDate: string;
  playTimeMinutes: number;
  activityLog: ProfileActivityEntry[];
}

export interface ProfileData {
  avatar: AvatarItem;
  title: TitleItem;
  frame: FrameItem;
  bio: string;
  mood: string;
  status: ActivityStatus;
  featuredAchievements: [string | null, string | null, string | null];
  stats: ProfileStats;
  completionPercent: number;
  levelBadge: LevelBadge;
  rankBadge: RankBadge;
  joinDate: string;
  playTimeHours: number;
}

export interface LevelBadge {
  level: number;
  icon: string;
  title: string;
  xpCurrent: number;
  xpToNext: number;
}

export interface RankBadge {
  rank: string;
  icon: string;
  tier: number;
  minScore: number;
}

export interface ProfileOverview {
  card: ProfileData;
  collectionProgress: CollectionProgress;
  recentActivity: ProfileActivityEntry[];
}

export interface CollectionProgress {
  avatarsUnlocked: number;
  avatarsTotal: number;
  titlesEarned: number;
  titlesTotal: number;
  framesUnlocked: number;
  framesTotal: number;
  overallPercent: number;
}

export interface AvatarGridItem {
  avatar: AvatarItem;
  gridPosition: number;
  canUnlock: boolean;
}

export interface TitleListItem {
  title: TitleItem;
  isNew: boolean;
  category: string;
}

export interface FrameGalleryItem {
  frame: FrameItem;
  preview: string;
}

export interface ProfileShareCard {
  code: string;
  avatarEmoji: string;
  titleName: string;
  frameGradient: string;
  score: number;
  level: number;
  rank: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = "ws_profile_card_wire";

const DEFAULT_AVATAR_DEFINITIONS: Omit<AvatarItem, "unlocked" | "selected">[] = [
  { id: "snake", name: "Snake", emoji: "🐍", rarity: "common", unlockCondition: "Default avatar" },
  { id: "cat", name: "Curious Cat", emoji: "🐱", rarity: "common", unlockCondition: "Play 5 games" },
  { id: "dog", name: "Loyal Dog", emoji: "🐶", rarity: "common", unlockCondition: "Play 10 games" },
  { id: "frog", name: "Leaping Frog", emoji: "🐸", rarity: "common", unlockCondition: "Find 50 words" },
  { id: "owl", name: "Wise Owl", emoji: "🦉", rarity: "common", unlockCondition: "Find 100 words" },
  { id: "fox", name: "Clever Fox", emoji: "🦊", rarity: "uncommon", unlockCondition: "Earn 5,000 total score" },
  { id: "rabbit", name: "Swift Rabbit", emoji: "🐰", rarity: "uncommon", unlockCondition: "Find a 6-letter word" },
  { id: "bear", name: "Mighty Bear", emoji: "🐻", rarity: "uncommon", unlockCondition: "Complete 3 daily challenges" },
  { id: "panda", name: "Chill Panda", emoji: "🐼", rarity: "uncommon", unlockCondition: "Play 7 days in a row" },
  { id: "penguin", name: "Cool Penguin", emoji: "🐧", rarity: "uncommon", unlockCondition: "Win 10 PvP matches" },
  { id: "dragon", name: "Fire Dragon", emoji: "🐉", rarity: "rare", unlockCondition: "Find 500 words" },
  { id: "unicorn", name: "Magic Unicorn", emoji: "🦄", rarity: "rare", unlockCondition: "Reach level 15" },
  { id: "phoenix", name: "Phoenix", emoji: "🔥", rarity: "rare", unlockCondition: "Achieve a 10x combo" },
  { id: "eagle", name: "Soaring Eagle", emoji: "🦅", rarity: "rare", unlockCondition: "Find a 9-letter word" },
  { id: "turtle", name: "Steady Turtle", emoji: "🐢", rarity: "rare", unlockCondition: "Play 50 games" },
  { id: "crystal_ball", name: "Crystal Ball", emoji: "🔮", rarity: "epic", unlockCondition: "Earn 50,000 total score" },
  { id: "wizard", name: "Archwizard", emoji: "🧙", rarity: "epic", unlockCondition: "Complete all tutorial stages" },
  { id: "alien", name: "Alien Visitor", emoji: "👽", rarity: "epic", unlockCondition: "Find every word in a puzzle" },
  { id: "ghost", name: "Friendly Ghost", emoji: "👻", rarity: "epic", unlockCondition: "Play during Halloween event" },
  { id: "robot", name: "Battle Bot", emoji: "🤖", rarity: "epic", unlockCondition: "Win 50 PvP matches" },
  { id: "gem", name: "Living Gem", emoji: "💎", rarity: "legendary", unlockCondition: "Find 2,000 words" },
  { id: "star", name: "Falling Star", emoji: "⭐", rarity: "legendary", unlockCondition: "Reach level 30" },
  { id: "rainbow", name: "Rainbow Spirit", emoji: "🌈", rarity: "legendary", unlockCondition: "Earn 200,000 total score" },
  { id: "cosmic_eye", name: "Cosmic Eye", emoji: "👁️", rarity: "legendary", unlockCondition: "Complete 100 daily challenges" },
];

const DEFAULT_TITLE_DEFINITIONS: Omit<TitleItem, "earned" | "earnedDate">[] = [
  { id: "new_player", name: "New Player", description: "Welcome to Word Snake!" },
  { id: "word_collector", name: "Word Collector", description: "Find 100 words total" },
  { id: "word_master", name: "Word Master", description: "Find 1,000 words total" },
  { id: "word_sage", name: "Word Sage", description: "Find 5,000 words total" },
  { id: "word_legend", name: "Word Legend", description: "Find 10,000 words total" },
  { id: "speed_demon", name: "Speed Demon", description: "Complete a game in under 60 seconds" },
  { id: "lightning_fingers", name: "Lightning Fingers", description: "Find 20 words in one minute" },
  { id: "combo_king", name: "Combo King", description: "Achieve a 15x combo" },
  { id: "combo_emperor", name: "Combo Emperor", description: "Achieve a 25x combo" },
  { id: "streak_warrior", name: "Streak Warrior", description: "Maintain a 7-day play streak" },
  { id: "streak_legend", name: "Streak Legend", description: "Maintain a 30-day play streak" },
  { id: "pvp_champion", name: "PvP Champion", description: "Win 25 PvP matches" },
  { id: "pvp_gladiator", name: "PvP Gladiator", description: "Win 100 PvP matches" },
  { id: "daily_hero", name: "Daily Hero", description: "Complete 10 daily challenges" },
  { id: "daily_legend", name: "Daily Legend", description: "Complete 50 daily challenges" },
  { id: "high_scorer", name: "High Scorer", description: "Score 10,000 in a single game" },
  { id: "score_titan", name: "Score Titan", description: "Score 50,000 in a single game" },
  { id: "long_word_slinger", name: "Long Word Slinger", description: "Find a 10-letter word" },
  { id: "dictionary_devourer", name: "Dictionary Devourer", description: "Find a 14-letter word" },
  { id: "night_owl", name: "Night Owl", description: "Play 50 games between midnight and 6 AM" },
  { id: "early_bird", name: "Early Bird", description: "Play 50 games between 6 AM and 9 AM" },
  { id: "explorer", name: "Explorer", description: "Try all 5 game modes" },
  { id: "master_of_all", name: "Master of All", description: "Reach level 10 in every game mode" },
  { id: "generous", name: "Generous Soul", description: "Share your profile 5 times" },
  { id: "veteran", name: "Veteran", description: "Play 200 games" },
  { id: "centurion", name: "Centurion", description: "Play 500 games" },
  { id: "first_blood", name: "First Blood", description: "Win your first PvP match" },
  { id: "flawless", name: "Flawless Victory", description: "Win a PvP match without missing a word" },
  { id: "comeback_kid", name: "Comeback Kid", description: "Win after being 500+ points behind" },
  { id: "social_butterfly", name: "Social Butterfly", description: "Visit 10 different player profiles" },
  { id: "customizer", name: "Customizer", description: "Unlock 10 avatars, 5 titles, and 5 frames" },
  { id: "completionist", name: "Completionist", description: "Unlock every avatar, title, and frame" },
  { id: "boss_slayer", name: "Boss Slayer", description: "Defeat 10 boss challenges" },
  { id: "word_artist", name: "Word Artist", description: "Use 200 unique words in a single game" },
];

const DEFAULT_FRAME_DEFINITIONS: Omit<FrameItem, "unlocked" | "selected">[] = [
  { id: "basic", name: "Basic", color: "#8B8B8B", gradient: "linear-gradient(135deg, #8B8B8B, #B0B0B0)" },
  { id: "gold", name: "Gold", color: "#FFD700", gradient: "linear-gradient(135deg, #FFD700, #FFA500)" },
  { id: "silver", name: "Silver", color: "#C0C0C0", gradient: "linear-gradient(135deg, #E8E8E8, #A0A0A0)" },
  { id: "bronze", name: "Bronze", color: "#CD7F32", gradient: "linear-gradient(135deg, #CD7F32, #8B4513)" },
  { id: "crystal", name: "Crystal", color: "#B0E0E6", gradient: "linear-gradient(135deg, #E0FFFF, #87CEEB)" },
  { id: "flame", name: "Flame", color: "#FF4500", gradient: "linear-gradient(135deg, #FF4500, #FF8C00, #FFD700)" },
  { id: "ice", name: "Ice", color: "#00CED1", gradient: "linear-gradient(135deg, #E0FFFF, #00CED1, #4682B4)" },
  { id: "nature", name: "Nature", color: "#228B22", gradient: "linear-gradient(135deg, #90EE90, #228B22, #006400)" },
  { id: "cosmic", name: "Cosmic", color: "#4B0082", gradient: "linear-gradient(135deg, #191970, #4B0082, #9400D3)" },
  { id: "neon", name: "Neon", color: "#FF00FF", gradient: "linear-gradient(135deg, #FF00FF, #00FFFF)" },
  { id: "retro", name: "Retro", color: "#FF6B6B", gradient: "linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4)" },
  { id: "pixel", name: "Pixel", color: "#32CD32", gradient: "linear-gradient(135deg, #32CD32, #00FF00)" },
  { id: "holographic", name: "Holographic", color: "#FF1493", gradient: "linear-gradient(135deg, #FF1493, #00BFFF, #7FFF00, #FFD700)" },
];

const RANK_THRESHOLDS: { rank: string; icon: string; tier: number; minScore: number }[] = [
  { rank: "Bronze", icon: "🥉", tier: 1, minScore: 0 },
  { rank: "Silver", icon: "🥈", tier: 2, minScore: 5000 },
  { rank: "Gold", icon: "🥇", tier: 3, minScore: 20000 },
  { rank: "Platinum", icon: "💠", tier: 4, minScore: 50000 },
  { rank: "Diamond", icon: "💎", tier: 5, minScore: 100000 },
  { rank: "Master", icon: "👑", tier: 6, minScore: 250000 },
  { rank: "Grandmaster", icon: "🌟", tier: 7, minScore: 500000 },
  { rank: "Supreme", icon: "🏆", tier: 8, minScore: 1000000 },
];

const LEVEL_THRESHOLDS: { level: number; icon: string; title: string; xp: number }[] = [
  { level: 1, icon: "🌱", title: "Seedling", xp: 0 },
  { level: 2, icon: "🌿", title: "Sprout", xp: 500 },
  { level: 3, icon: "🍀", title: "Lucky Learner", xp: 1500 },
  { level: 4, icon: "🌳", title: "Wordling", xp: 3000 },
  { level: 5, icon: "⭐", title: "Rising Star", xp: 5000 },
  { level: 6, icon: "🔥", title: "Firestarter", xp: 8000 },
  { level: 7, icon: "⚡", title: "Shock Writer", xp: 12000 },
  { level: 8, icon: "🌙", title: "Moon Scribe", xp: 17000 },
  { level: 9, icon: "❄️", title: "Frost Scholar", xp: 23000 },
  { level: 10, icon: "🌊", title: "Tide Thinker", xp: 30000 },
  { level: 11, icon: "🦅", title: "Sky Reader", xp: 40000 },
  { level: 12, icon: "🦁", title: "Lion Lexicon", xp: 52000 },
  { level: 13, icon: "🐉", title: "Dragon Scholar", xp: 66000 },
  { level: 14, icon: "🗡️", title: "Word Knight", xp: 82000 },
  { level: 15, icon: "🧙", title: "Spellcaster", xp: 100000 },
  { level: 16, icon: "👑", title: "Word Monarch", xp: 125000 },
  { level: 17, icon: "🔮", title: "Oracle of Words", xp: 155000 },
  { level: 18, icon: "🌌", title: "Galactic Linguist", xp: 190000 },
  { level: 19, icon: "🌟", title: "Stellar Sage", xp: 230000 },
  { level: 20, icon: "🏆", title: "Champion of Words", xp: 280000 },
  { level: 21, icon: "🌈", title: "Prismatic Scholar", xp: 340000 },
  { level: 22, icon: "💀", title: "Skull Scribe", xp: 410000 },
  { level: 23, icon: "🦑", title: "Kraken of Letters", xp: 490000 },
  { level: 24, icon: "🌋", title: "Volcanic Wordsmith", xp: 580000 },
  { level: 25, icon: "💎", title: "Diamond Lexicon", xp: 680000 },
  { level: 26, icon: "🚀", title: "Rocket Reader", xp: 800000 },
  { level: 27, icon: "🏴‍☠️", title: "Word Pirate", xp: 940000 },
  { level: 28, icon: "👾", title: "Alien Linguist", xp: 1100000 },
  { level: 29, icon: "🎭", title: "Phantom Wordsmith", xp: 1300000 },
  { level: 30, icon: "⬛", title: "Void Speaker", xp: 1550000 },
];

const DEFAULT_VISIBLE_STATS: string[] = [
  "gamesPlayed",
  "wordsFound",
  "totalScore",
  "bestCombo",
  "currentStreak",
];

// ═══════════════════════════════════════════════════════════════════════════
// Storage helpers
// ═══════════════════════════════════════════════════════════════════════════

function isBrowser(): boolean {
  return typeof globalThis.window !== "undefined";
}

function loadState(): ProfileState {
  if (!isBrowser()) {
    return createDefaultState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProfileState>;
      return mergeWithDefaults(parsed);
    }
  } catch {
    // corrupted — fall through to default
  }

  const defaultState = createDefaultState();
  saveState(defaultState);
  return defaultState;
}

function saveState(state: ProfileState): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

function createDefaultState(): ProfileState {
  const now = new Date().toISOString();
  return {
    currentAvatarId: "snake",
    currentTitleId: "new_player",
    currentFrameId: "basic",
    unlockedAvatarIds: ["snake"],
    earnedTitleIds: { new_player: now },
    unlockedFrameIds: ["basic"],
    bio: "",
    mood: "😊",
    status: "online",
    featuredAchievements: [null, null, null],
    visibleStats: [...DEFAULT_VISIBLE_STATS],
    joinDate: now,
    playTimeMinutes: 0,
    activityLog: [
      {
        type: "avatar_change",
        description: "Equipped default avatar Snake 🐍",
        timestamp: Date.now(),
      },
    ],
  };
}

function mergeWithDefaults(partial: Partial<ProfileState>): ProfileState {
  const defaults = createDefaultState();

  return {
    currentAvatarId: partial.currentAvatarId ?? defaults.currentAvatarId,
    currentTitleId: partial.currentTitleId ?? defaults.currentTitleId,
    currentFrameId: partial.currentFrameId ?? defaults.currentFrameId,
    unlockedAvatarIds: Array.isArray(partial.unlockedAvatarIds)
      ? partial.unlockedAvatarIds
      : defaults.unlockedAvatarIds,
    earnedTitleIds:
      partial.earnedTitleIds && typeof partial.earnedTitleIds === "object"
        ? partial.earnedTitleIds
        : defaults.earnedTitleIds,
    unlockedFrameIds: Array.isArray(partial.unlockedFrameIds)
      ? partial.unlockedFrameIds
      : defaults.unlockedFrameIds,
    bio: typeof partial.bio === "string" ? partial.bio : defaults.bio,
    mood: typeof partial.mood === "string" ? partial.mood : defaults.mood,
    status: isValidStatus(partial.status) ? partial.status : defaults.status,
    featuredAchievements: Array.isArray(partial.featuredAchievements)
      ? (partial.featuredAchievements as [string | null, string | null, string | null])
      : defaults.featuredAchievements,
    visibleStats: Array.isArray(partial.visibleStats)
      ? partial.visibleStats
      : defaults.visibleStats,
    joinDate: partial.joinDate ?? defaults.joinDate,
    playTimeMinutes:
      typeof partial.playTimeMinutes === "number"
        ? partial.playTimeMinutes
        : defaults.playTimeMinutes,
    activityLog: Array.isArray(partial.activityLog)
      ? partial.activityLog
      : defaults.activityLog,
  };
}

function isValidStatus(s: unknown): s is ActivityStatus {
  return s === "online" || s === "away" || s === "dnd" || s === "offline";
}

function pushActivity(state: ProfileState, entry: ProfileActivityEntry): void {
  state.activityLog.unshift(entry);
  // keep only the most recent 100 entries
  if (state.activityLog.length > 100) {
    state.activityLog = state.activityLog.slice(0, 100);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// External stats reader — looks for game-stats or default zeros
// ═══════════════════════════════════════════════════════════════════════════

function readGameStats(): ProfileStats {
  if (!isBrowser()) {
    return defaultProfileStats();
  }

  try {
    const raw = localStorage.getItem("ws_game_stats");
    if (raw) {
      const s = JSON.parse(raw);
      return {
        gamesPlayed: typeof s.gamesPlayed === "number" ? s.gamesPlayed : 0,
        wordsFound: typeof s.wordsFound === "number" ? s.wordsFound : 0,
        totalScore: typeof s.totalScore === "number" ? s.totalScore : 0,
        longestWord: typeof s.longestWord === "number" ? s.longestWord : 0,
        bestCombo: typeof s.bestCombo === "number" ? s.bestCombo : 0,
        winRate:
          typeof s.winRate === "number"
            ? s.winRate
            : typeof s.gamesWon === "number" && typeof s.gamesPlayed === "number" && s.gamesPlayed > 0
              ? Math.round((s.gamesWon / s.gamesPlayed) * 10000) / 100
              : 0,
        currentStreak: typeof s.currentStreak === "number" ? s.currentStreak : 0,
        bestStreak: typeof s.bestStreak === "number" ? s.bestStreak : 0,
      };
    }
  } catch {
    // ignore
  }

  return defaultProfileStats();
}

function defaultProfileStats(): ProfileStats {
  return {
    gamesPlayed: 0,
    wordsFound: 0,
    totalScore: 0,
    longestWord: 0,
    bestCombo: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Compute level from total score
// ═══════════════════════════════════════════════════════════════════════════

function computeLevel(totalScore: number): LevelBadge {
  let current = LEVEL_THRESHOLDS[0];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalScore >= LEVEL_THRESHOLDS[i].xp) {
      current = LEVEL_THRESHOLDS[i];
      break;
    }
  }

  const idx = LEVEL_THRESHOLDS.indexOf(current);
  const nextLevel = idx < LEVEL_THRESHOLDS.length - 1 ? LEVEL_THRESHOLDS[idx + 1] : null;
  const xpCurrent = totalScore - current.xp;
  const xpToNext = nextLevel ? nextLevel.xp - current.xp : 0;

  return {
    level: current.level,
    icon: current.icon,
    title: current.title,
    xpCurrent,
    xpToNext,
  };
}

function computeRank(totalScore: number): RankBadge {
  let current = RANK_THRESHOLDS[0];

  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalScore >= RANK_THRESHOLDS[i].minScore) {
      current = RANK_THRESHOLDS[i];
      break;
    }
  }

  return {
    rank: current.rank,
    icon: current.icon,
    tier: current.tier,
    minScore: current.minScore,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Exported functions
// ═══════════════════════════════════════════════════════════════════════════

// -----------------------------------------------------------------------
// 1. initProfileCard
// -----------------------------------------------------------------------

export function initProfileCard(): ProfileState {
  const state = loadState();
  saveState(state);
  return state;
}

// -----------------------------------------------------------------------
// 2. getAvatarOptions
// -----------------------------------------------------------------------

export function getAvatarOptions(): AvatarItem[] {
  const state = loadState();

  return DEFAULT_AVATAR_DEFINITIONS.map((def) => ({
    ...def,
    unlocked: state.unlockedAvatarIds.includes(def.id),
    selected: state.currentAvatarId === def.id,
  }));
}

// -----------------------------------------------------------------------
// 3. getCurrentAvatar
// -----------------------------------------------------------------------

export function getCurrentAvatar(): AvatarItem {
  const state = loadState();
  const all = getAvatarOptions();
  return all.find((a) => a.id === state.currentAvatarId) ?? all[0];
}

// -----------------------------------------------------------------------
// 4. selectAvatar
// -----------------------------------------------------------------------

export function selectAvatar(avatarId: string): boolean {
  const state = loadState();

  if (!state.unlockedAvatarIds.includes(avatarId)) {
    return false;
  }

  const definition = DEFAULT_AVATAR_DEFINITIONS.find((a) => a.id === avatarId);
  if (!definition) {
    return false;
  }

  state.currentAvatarId = avatarId;

  pushActivity(state, {
    type: "avatar_change",
    description: `Equipped avatar ${definition.name} ${definition.emoji}`,
    timestamp: Date.now(),
  });

  saveState(state);
  return true;
}

// -----------------------------------------------------------------------
// 5. unlockAvatar
// -----------------------------------------------------------------------

export function unlockAvatar(avatarId: string): boolean {
  const state = loadState();

  const definition = DEFAULT_AVATAR_DEFINITIONS.find((a) => a.id === avatarId);
  if (!definition) {
    return false;
  }

  if (state.unlockedAvatarIds.includes(avatarId)) {
    return false;
  }

  state.unlockedAvatarIds.push(avatarId);

  pushActivity(state, {
    type: "achievement_earned",
    description: `Unlocked avatar ${definition.name} ${definition.emoji}`,
    timestamp: Date.now(),
  });

  saveState(state);
  return true;
}

// -----------------------------------------------------------------------
// 6. getTitles
// -----------------------------------------------------------------------

export function getTitles(): TitleItem[] {
  const state = loadState();

  return DEFAULT_TITLE_DEFINITIONS.map((def) => ({
    ...def,
    earned: def.id in state.earnedTitleIds,
    earnedDate: state.earnedTitleIds[def.id] ?? null,
  }));
}

// -----------------------------------------------------------------------
// 7. getCurrentTitle
// -----------------------------------------------------------------------

export function getCurrentTitle(): TitleItem {
  const state = loadState();
  const all = getTitles();
  return all.find((t) => t.id === state.currentTitleId) ?? all[0];
}

// -----------------------------------------------------------------------
// 8. selectTitle
// -----------------------------------------------------------------------

export function selectTitle(titleId: string): boolean {
  const state = loadState();

  if (!(titleId in state.earnedTitleIds)) {
    return false;
  }

  const definition = DEFAULT_TITLE_DEFINITIONS.find((t) => t.id === titleId);
  if (!definition) {
    return false;
  }

  state.currentTitleId = titleId;

  pushActivity(state, {
    type: "title_change",
    description: `Changed title to "${definition.name}"`,
    timestamp: Date.now(),
  });

  saveState(state);
  return true;
}

// -----------------------------------------------------------------------
// 9. earnTitle
// -----------------------------------------------------------------------

export function earnTitle(titleId: string): boolean {
  const state = loadState();

  const definition = DEFAULT_TITLE_DEFINITIONS.find((t) => t.id === titleId);
  if (!definition) {
    return false;
  }

  if (titleId in state.earnedTitleIds) {
    return false;
  }

  const now = new Date().toISOString();
  state.earnedTitleIds[titleId] = now;

  // Auto-equip first earned title or upgrade
  if (Object.keys(state.earnedTitleIds).length <= 2) {
    state.currentTitleId = titleId;
  }

  pushActivity(state, {
    type: "achievement_earned",
    description: `Earned title "${definition.name}"`,
    timestamp: Date.now(),
  });

  saveState(state);
  return true;
}

// -----------------------------------------------------------------------
// 10. getFrames
// -----------------------------------------------------------------------

export function getFrames(): FrameItem[] {
  const state = loadState();

  return DEFAULT_FRAME_DEFINITIONS.map((def) => ({
    ...def,
    unlocked: state.unlockedFrameIds.includes(def.id),
    selected: state.currentFrameId === def.id,
  }));
}

// -----------------------------------------------------------------------
// 11. getCurrentFrame
// -----------------------------------------------------------------------

export function getCurrentFrame(): FrameItem {
  const state = loadState();
  const all = getFrames();
  return all.find((f) => f.id === state.currentFrameId) ?? all[0];
}

// -----------------------------------------------------------------------
// 12. selectFrame
// -----------------------------------------------------------------------

export function selectFrame(frameId: string): boolean {
  const state = loadState();

  if (!state.unlockedFrameIds.includes(frameId)) {
    return false;
  }

  const definition = DEFAULT_FRAME_DEFINITIONS.find((f) => f.id === frameId);
  if (!definition) {
    return false;
  }

  state.currentFrameId = frameId;

  pushActivity(state, {
    type: "frame_change",
    description: `Equipped ${definition.name} frame`,
    timestamp: Date.now(),
  });

  saveState(state);
  return true;
}

// -----------------------------------------------------------------------
// 13. unlockFrame
// -----------------------------------------------------------------------

export function unlockFrame(frameId: string): boolean {
  const state = loadState();

  const definition = DEFAULT_FRAME_DEFINITIONS.find((f) => f.id === frameId);
  if (!definition) {
    return false;
  }

  if (state.unlockedFrameIds.includes(frameId)) {
    return false;
  }

  state.unlockedFrameIds.push(frameId);

  pushActivity(state, {
    type: "achievement_earned",
    description: `Unlocked ${definition.name} frame`,
    timestamp: Date.now(),
  });

  saveState(state);
  return true;
}

// -----------------------------------------------------------------------
// 14. getBio
// -----------------------------------------------------------------------

export function getBio(): string {
  const state = loadState();
  return state.bio;
}

// -----------------------------------------------------------------------
// 15. setBio
// -----------------------------------------------------------------------

export function setBio(text: string): string {
  const state = loadState();
  const trimmed = typeof text === "string" ? text.slice(0, 200).trim() : "";
  state.bio = trimmed;

  if (trimmed.length > 0) {
    pushActivity(state, {
      type: "bio_update",
      description: "Updated profile bio",
      timestamp: Date.now(),
    });
  }

  saveState(state);
  return trimmed;
}

// -----------------------------------------------------------------------
// 16. getMood
// -----------------------------------------------------------------------

export function getMood(): string {
  const state = loadState();
  return state.mood;
}

// -----------------------------------------------------------------------
// 17. setMood
// -----------------------------------------------------------------------

export function setMood(emoji: string): boolean {
  const state = loadState();

  if (typeof emoji !== "string" || emoji.length === 0 || emoji.length > 8) {
    return false;
  }

  state.mood = emoji;
  saveState(state);
  return true;
}

// -----------------------------------------------------------------------
// 18. getStatus
// -----------------------------------------------------------------------

export function getStatus(): ActivityStatus {
  const state = loadState();
  return state.status;
}

// -----------------------------------------------------------------------
// 19. setStatus
// -----------------------------------------------------------------------

export function setStatus(status: ActivityStatus): boolean {
  if (!isValidStatus(status)) {
    return false;
  }

  const state = loadState();
  state.status = status;
  saveState(state);
  return true;
}

// -----------------------------------------------------------------------
// 20. getFeaturedAchievements
// -----------------------------------------------------------------------

export function getFeaturedAchievements(): [string | null, string | null, string | null] {
  const state = loadState();
  return [...state.featuredAchievements] as [string | null, string | null, string | null];
}

// -----------------------------------------------------------------------
// 21. setFeaturedAchievement
// -----------------------------------------------------------------------

export function setFeaturedAchievement(slot: number, achievementId: string | null): boolean {
  if (typeof slot !== "number" || slot < 1 || slot > 3) {
    return false;
  }

  const state = loadState();
  const index = slot - 1;

  if (achievementId !== null && typeof achievementId !== "string") {
    return false;
  }

  state.featuredAchievements[index] = achievementId;
  saveState(state);
  return true;
}

// -----------------------------------------------------------------------
// 22. getProfileCompletion
// -----------------------------------------------------------------------

export function getProfileCompletion(): number {
  const state = loadState();
  let filled = 0;
  let total = 10;

  // Has avatar selected (always true after init)
  filled += 1;

  // Has non-default avatar
  if (state.currentAvatarId !== "snake") filled += 1;

  // Has title beyond new_player
  if (state.currentTitleId !== "new_player") filled += 1;

  // Has non-default frame
  if (state.currentFrameId !== "basic") filled += 1;

  // Has bio set
  if (state.bio.length > 0) filled += 1;

  // Has mood set (not default)
  if (state.mood !== "😊") filled += 1;

  // Has featured achievements
  const featured = state.featuredAchievements.filter((a) => a !== null).length;
  filled += Math.min(featured, 1);

  // Multiple titles earned
  if (Object.keys(state.earnedTitleIds).length >= 3) filled += 1;

  // Multiple avatars unlocked
  if (state.unlockedAvatarIds.length >= 5) filled += 1;

  // Multiple frames unlocked
  if (state.unlockedFrameIds.length >= 3) filled += 1;

  total = 11;
  return Math.round((filled / total) * 10000) / 100;
}

// -----------------------------------------------------------------------
// 23. getProfileCard
// -----------------------------------------------------------------------

export function getProfileCard(): ProfileData {
  const avatar = getCurrentAvatar();
  const title = getCurrentTitle();
  const frame = getCurrentFrame();
  const state = loadState();
  const stats = readGameStats();
  const completion = getProfileCompletion();
  const level = computeLevel(stats.totalScore);
  const rank = computeRank(stats.totalScore);

  return {
    avatar,
    title,
    frame,
    bio: state.bio,
    mood: state.mood,
    status: state.status,
    featuredAchievements: [...state.featuredAchievements] as [string | null, string | null, string | null],
    stats,
    completionPercent: completion,
    levelBadge: level,
    rankBadge: rank,
    joinDate: state.joinDate,
    playTimeHours: Math.round((state.playTimeMinutes / 60) * 100) / 100,
  };
}

// -----------------------------------------------------------------------
// 24. generateShareCode
// -----------------------------------------------------------------------

export function generateShareCode(): string {
  const state = loadState();
  const stats = readGameStats();
  const level = computeLevel(stats.totalScore);

  const payload = {
    a: state.currentAvatarId,
    t: state.currentTitleId,
    f: state.currentFrameId,
    s: Math.min(stats.totalScore, 99999999),
    l: level.level,
    r: computeRank(stats.totalScore).tier,
    b: state.bio.slice(0, 60),
    m: state.mood,
  };

  const json = JSON.stringify(payload);
  if (isBrowser()) {
    return btoa(json);
  }

  // Node fallback — manual base64
  return Buffer.from(json, "utf-8").toString("base64");
}

// -----------------------------------------------------------------------
// 25. parseShareCode
// -----------------------------------------------------------------------

export function parseShareCode(code: string): ProfileShareCard | null {
  if (typeof code !== "string" || code.length === 0) {
    return null;
  }

  try {
    let json: string;
    if (isBrowser()) {
      json = atob(code.trim());
    } else {
      json = Buffer.from(code.trim(), "base64").toString("utf-8");
    }

    const data = JSON.parse(json);

    const avatarDef = DEFAULT_AVATAR_DEFINITIONS.find((a) => a.id === data.a);
    const titleDef = DEFAULT_TITLE_DEFINITIONS.find((t) => t.id === data.t);
    const frameDef = DEFAULT_FRAME_DEFINITIONS.find((f) => f.id === data.f);

    const rankEntry = RANK_THRESHOLDS.find((r) => r.tier === (data.r ?? 1));

    return {
      code: code.trim(),
      avatarEmoji: avatarDef?.emoji ?? "🐍",
      titleName: titleDef?.name ?? "New Player",
      frameGradient: frameDef?.gradient ?? DEFAULT_FRAME_DEFINITIONS[0].gradient,
      score: typeof data.s === "number" ? data.s : 0,
      level: typeof data.l === "number" ? data.l : 1,
      rank: rankEntry?.rank ?? "Bronze",
    };
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------
// 26. getProfileStats
// -----------------------------------------------------------------------

export function getProfileStats(): ProfileStats {
  return readGameStats();
}

// -----------------------------------------------------------------------
// 27. getCollectionProgress
// -----------------------------------------------------------------------

export function getCollectionProgress(): CollectionProgress {
  const state = loadState();

  const avatarsUnlocked = state.unlockedAvatarIds.length;
  const avatarsTotal = DEFAULT_AVATAR_DEFINITIONS.length;

  const titlesEarned = Object.keys(state.earnedTitleIds).length;
  const titlesTotal = DEFAULT_TITLE_DEFINITIONS.length;

  const framesUnlocked = state.unlockedFrameIds.length;
  const framesTotal = DEFAULT_FRAME_DEFINITIONS.length;

  const grandTotal = avatarsTotal + titlesTotal + framesTotal;
  const grandUnlocked = avatarsUnlocked + titlesEarned + framesUnlocked;
  const overallPercent = grandTotal > 0 ? Math.round((grandUnlocked / grandTotal) * 10000) / 100 : 0;

  return {
    avatarsUnlocked,
    avatarsTotal,
    titlesEarned,
    titlesTotal,
    framesUnlocked,
    framesTotal,
    overallPercent,
  };
}

// -----------------------------------------------------------------------
// 28. getRecentActivity
// -----------------------------------------------------------------------

export function getRecentActivity(count: number): ProfileActivityEntry[] {
  const state = loadState();
  const n = typeof count === "number" && count > 0 ? Math.min(count, 100) : 10;
  return state.activityLog.slice(0, n);
}

// -----------------------------------------------------------------------
// 29. getLevelBadge
// -----------------------------------------------------------------------

export function getLevelBadge(): LevelBadge {
  const stats = readGameStats();
  return computeLevel(stats.totalScore);
}

// -----------------------------------------------------------------------
// 30. getJoinDate
// -----------------------------------------------------------------------

export function getJoinDate(): string {
  const state = loadState();
  return state.joinDate;
}

// -----------------------------------------------------------------------
// 31. getPlayTime
// -----------------------------------------------------------------------

export function getPlayTime(): number {
  const state = loadState();
  return Math.round((state.playTimeMinutes / 60) * 100) / 100;
}

// -----------------------------------------------------------------------
// 32. getRankBadge
// -----------------------------------------------------------------------

export function getRankBadge(): RankBadge {
  const stats = readGameStats();
  return computeRank(stats.totalScore);
}

// -----------------------------------------------------------------------
// 33. getProfileOverview
// -----------------------------------------------------------------------

export function getProfileOverview(): ProfileOverview {
  const card = getProfileCard();
  const collectionProgress = getCollectionProgress();
  const recentActivity = getRecentActivity(15);

  return {
    card,
    collectionProgress,
    recentActivity,
  };
}

// -----------------------------------------------------------------------
// 34. getAvatarGrid
// -----------------------------------------------------------------------

export function getAvatarGrid(): AvatarGridItem[] {
  const state = loadState();

  return DEFAULT_AVATAR_DEFINITIONS.map((def, index) => ({
    avatar: {
      ...def,
      unlocked: state.unlockedAvatarIds.includes(def.id),
      selected: state.currentAvatarId === def.id,
    },
    gridPosition: index,
    canUnlock: !state.unlockedAvatarIds.includes(def.id),
  }));
}

// -----------------------------------------------------------------------
// 35. getTitleList
// -----------------------------------------------------------------------

export function getTitleList(): TitleListItem[] {
  const state = loadState();

  return DEFAULT_TITLE_DEFINITIONS.map((def) => {
    const earned = def.id in state.earnedTitleIds;
    const earnedDate = state.earnedTitleIds[def.id];
    const isNew =
      earned && earnedDate
        ? Date.now() - new Date(earnedDate).getTime() < 7 * 24 * 60 * 60 * 1000
        : false;

    let category = "General";
    if (def.id.startsWith("pvp")) category = "PvP";
    else if (def.id.startsWith("daily")) category = "Daily";
    else if (def.id.startsWith("combo")) category = "Combo";
    else if (def.id.startsWith("streak")) category = "Streak";
    else if (def.id.startsWith("speed")) category = "Speed";
    else if (def.id.startsWith("word") || def.id === "long_word_slinger" || def.id === "dictionary_devourer")
      category = "Words";
    else if (def.id === "night_owl" || def.id === "early_bird") category = "Time";
    else if (def.id === "explorer" || def.id === "master_of_all") category = "Modes";
    else if (def.id === "customizer" || def.id === "completionist" || def.id === "generous" || def.id === "social_butterfly")
      category = "Social";

    return {
      title: {
        ...def,
        earned,
        earnedDate: earnedDate ?? null,
      },
      isNew,
      category,
    };
  });
}

// -----------------------------------------------------------------------
// 36. getFrameGallery
// -----------------------------------------------------------------------

export function getFrameGallery(): FrameGalleryItem[] {
  const state = loadState();

  return DEFAULT_FRAME_DEFINITIONS.map((def) => ({
    frame: {
      ...def,
      unlocked: state.unlockedFrameIds.includes(def.id),
      selected: state.currentFrameId === def.id,
    },
    preview: def.gradient,
  }));
}

// -----------------------------------------------------------------------
// 37. getProfileShareCard
// -----------------------------------------------------------------------

export function getProfileShareCard(): ProfileShareCard {
  const state = loadState();
  const stats = readGameStats();
  const level = computeLevel(stats.totalScore);
  const rank = computeRank(stats.totalScore);

  const avatarDef = DEFAULT_AVATAR_DEFINITIONS.find((a) => a.id === state.currentAvatarId);
  const titleDef = DEFAULT_TITLE_DEFINITIONS.find((t) => t.id === state.currentTitleId);
  const frameDef = DEFAULT_FRAME_DEFINITIONS.find((f) => f.id === state.currentFrameId);

  return {
    code: generateShareCode(),
    avatarEmoji: avatarDef?.emoji ?? "🐍",
    titleName: titleDef?.name ?? "New Player",
    frameGradient: frameDef?.gradient ?? DEFAULT_FRAME_DEFINITIONS[0].gradient,
    score: stats.totalScore,
    level: level.level,
    rank: rank.rank,
  };
}
