// ============================================================================
// carnival-wire.ts — Carnival / Funfair System Wire Module for Word Snake
// ============================================================================
// SSR-safe state management. No localStorage, window, document, setInterval,
// or addEventListener. Uses Date.now() for all timestamps.
// All exported functions use the `cv` prefix.
// ============================================================================

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

type PrizeCategory = "headgear" | "trail" | "frame" | "title" | "powerup";

type WheelSegmentType =
  | "coins_2x"
  | "xp_100"
  | "mystery_box"
  | "free_spin"
  | "jackpot"
  | "small_prize"
  | "medium_prize"
  | "powerup"
  | "extra_life"
  | "nothing";

interface WheelSegment {
  label: string;
  type: WheelSegmentType;
  multiplier: number;
  color: string;
  weight: number;
}

interface SpinResult {
  segment: WheelSegment;
  timestamp: number;
  reward: number;
  rewardType: "tickets" | "xp" | "tokens" | "prize" | "powerup" | "extra_life" | "none";
}

interface CarnivalAttraction {
  id: string;
  name: string;
  description: string;
  icon: string;
  ticketCost: number;
  maxPlaysPerDay: number;
  category: "game" | "fortune" | "challenge";
  isActive: boolean;
}

interface Peg {
  index: number;
  word: string;
  pointValue: number;
  hasRing: boolean;
}

interface RingTossState {
  pegs: Peg[];
  ringsRemaining: number;
  roundScore: number;
  isRoundActive: boolean;
  roundNumber: number;
  totalScore: number;
  perfectRoundBonus: boolean;
}

interface Mole {
  holeIndex: number;
  word: string;
  pointValue: number;
  isGolden: boolean;
  isPopped: boolean;
  popTimestamp: number;
}

interface WhackAWordState {
  moles: Mole[];
  score: number;
  combo: number;
  maxCombo: number;
  wordsHit: number;
  wordsMissed: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  timeRemaining: number;
}

interface Balloon {
  letter: string;
  index: number;
  isPopped: boolean;
  color: string;
}

interface BalloonPopState {
  balloons: Balloon[];
  targetWord: string;
  currentSpelling: string;
  score: number;
  attemptsLeft: number;
  isActive: boolean;
  roundsCompleted: number;
}

interface FortuneResult {
  prediction: string;
  bonus: { type: string; amount: number };
  timestamp: number;
  mood: "positive" | "neutral" | "mysterious";
}

interface Prize {
  id: string;
  name: string;
  description: string;
  rarity: RarityTier;
  category: PrizeCategory;
  cost: number;
  currency: "tickets" | "tokens";
  icon: string;
  duplicates: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: { type: string; amount: number };
  unlocked: boolean;
  unlockTimestamp: number | null;
  progress: number;
  maxProgress: number;
}

interface CarnivalEvent {
  id: string;
  name: string;
  description: string;
  startDate: number;
  endDate: number;
  isActive: boolean;
  bonusMultiplier: number;
  exclusivePrizeId: string | null;
}

interface EventLeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  timestamp: number;
}

interface DailyBonus {
  day: number;
  claimed: boolean;
  claimTimestamp: number | null;
  reward: { type: string; amount: number };
}

interface SeasonInfo {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  dayProgress: number;
  totalDays: number;
  isActive: boolean;
  exclusivePrizes: string[];
}

interface CarnivalStats {
  totalTicketsEarned: number;
  totalTicketsSpent: number;
  totalTokensEarned: number;
  gamesPlayed: Record<string, number>;
  bestScores: Record<string, number>;
  totalPrizesCollected: number;
  carnivalLevel: number;
  totalSpins: number;
  totalRoundsCompleted: number;
  totalWordsWhacked: number;
  jackpotWins: number;
  perfectRounds: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WHEEL_SEGMENTS: WheelSegment[] = [
  { label: "×2 Coins", type: "coins_2x", multiplier: 2, color: "#FFD700", weight: 15 },
  { label: "×2 Coins", type: "coins_2x", multiplier: 2, color: "#FFA500", weight: 15 },
  { label: "×2 Coins", type: "coins_2x", multiplier: 2, color: "#FFEC8B", weight: 15 },
  { label: "+100 XP", type: "xp_100", multiplier: 100, color: "#4FC3F7", weight: 12 },
  { label: "+100 XP", type: "xp_100", multiplier: 100, color: "#29B6F6", weight: 12 },
  { label: "Mystery Box", type: "mystery_box", multiplier: 0, color: "#AB47BC", weight: 8 },
  { label: "Free Spin", type: "free_spin", multiplier: 1, color: "#66BB6A", weight: 7 },
  { label: "Jackpot!", type: "jackpot", multiplier: 0, color: "#E53935", weight: 2 },
  { label: "Small Prize", type: "small_prize", multiplier: 0, color: "#8D6E63", weight: 6 },
  { label: "Medium Prize", type: "medium_prize", multiplier: 0, color: "#5C6BC0", weight: 4 },
  { label: "Power-Up", type: "powerup", multiplier: 0, color: "#26C6DA", weight: 5 },
  { label: "Extra Life", type: "extra_life", multiplier: 0, color: "#EF5350", weight: 4 },
  { label: "Nothing", type: "nothing", multiplier: 0, color: "#78909C", weight: 15 },
];

const FREE_SPIN_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours
const DAILY_SPIN_RESET_MS = 24 * 60 * 60 * 1000;

const WORD_POOL_SHORT = ["cat", "dog", "run", "fly", "hop", "sun", "map", "box", "cup", "pen"];
const WORD_POOL_MEDIUM = ["jump", "fast", "glow", "brave", "cloud", "stone", "river", "flame", "dream", "quest"];
const WORD_POOL_LONG = ["castle", "dragon", "wizard", "rocket", "planet", "galaxy", "puzzle", "shadow", "mystic", "oracle"];
const WORD_POOL_EXTENDED = ["crystal", "phoenix", "thunder", "mystery", "carnival", "fortune", "rainbow", "diamond", "volcano", "labyrinth"];
const WORD_POOL_MAX = ["adventure", "butterfly", "celebrate", "discovery", "enchanted", "fireworks", "hurricane", "moonlight", "symphony", "wonderland"];

const PEG_POINT_VALUES: Record<number, number> = { 3: 50, 4: 100, 5: 250, 6: 500, 7: 1000 };
const WHACK_DURATION_MS = 30_000;

const ALL_PRIZES: Prize[] = [
  { id: "pr_01", name: "Clown Nose", description: "A classic red clown nose.", rarity: "common", category: "headgear", cost: 100, currency: "tickets", icon: "🔴", duplicates: 0 },
  { id: "pr_02", name: "Paper Crown", description: "A makeshift royal crown.", rarity: "common", category: "headgear", cost: 100, currency: "tickets", icon: "👑", duplicates: 0 },
  { id: "pr_03", name: "Sparkle Trail", description: "Sparkling particles follow you.", rarity: "uncommon", category: "trail", cost: 250, currency: "tickets", icon: "✨", duplicates: 0 },
  { id: "pr_04", name: "Confetti Trail", description: "Colorful confetti bursts.", rarity: "uncommon", category: "trail", cost: 300, currency: "tickets", icon: "🎊", duplicates: 0 },
  { id: "pr_05", name: "Wooden Frame", description: "A rustic wooden border.", rarity: "common", category: "frame", cost: 80, currency: "tickets", icon: "🪵", duplicates: 0 },
  { id: "pr_06", name: "Golden Frame", description: "An ornate golden border.", rarity: "rare", category: "frame", cost: 600, currency: "tickets", icon: "🖼️", duplicates: 0 },
  { id: "pr_07", name: "Funster Title", description: "Title: The Funster.", rarity: "common", category: "title", cost: 150, currency: "tickets", icon: "🎪", duplicates: 0 },
  { id: "pr_08", name: "Ringmaster", description: "Title: Ringmaster.", rarity: "uncommon", category: "title", cost: 350, currency: "tickets", icon: "🎩", duplicates: 0 },
  { id: "pr_09", name: "Word Shield", description: "Block one wrong letter.", rarity: "rare", category: "powerup", cost: 500, currency: "tickets", icon: "🛡️", duplicates: 0 },
  { id: "pr_10", name: "Hint Lantern", description: "Reveals a hidden letter.", rarity: "uncommon", category: "powerup", cost: 300, currency: "tickets", icon: "🏮", duplicates: 0 },
  { id: "pr_11", name: "Top Hat", description: "A dapper carnival top hat.", rarity: "rare", category: "headgear", cost: 700, currency: "tickets", icon: "🎩", duplicates: 0 },
  { id: "pr_12", name: "Fire Trail", description: "Blazing fire particles.", rarity: "rare", category: "trail", cost: 650, currency: "tickets", icon: "🔥", duplicates: 0 },
  { id: "pr_13", name: "Crystal Frame", description: "A shimmering crystal border.", rarity: "epic", category: "frame", cost: 1200, currency: "tickets", icon: "💎", duplicates: 0 },
  { id: "pr_14", name: "Carnival King", description: "Title: Carnival King.", rarity: "epic", category: "title", cost: 1500, currency: "tickets", icon: "🏰", duplicates: 0 },
  { id: "pr_15", name: "Time Freeze", description: "Pause the game clock for 5s.", rarity: "epic", category: "powerup", cost: 1000, currency: "tickets", icon: "⏳", duplicates: 0 },
  { id: "pr_16", name: "Star Crown", description: "A radiant star-studded crown.", rarity: "epic", category: "headgear", cost: 1400, currency: "tickets", icon: "⭐", duplicates: 0 },
  { id: "pr_17", name: "Rainbow Trail", description: "A prismatic rainbow trail.", rarity: "epic", category: "trail", cost: 1300, currency: "tickets", icon: "🌈", duplicates: 0 },
  { id: "pr_18", name: "Word Oracle", description: "Reveals the entire word.", rarity: "legendary", category: "powerup", cost: 50, currency: "tokens", icon: "🔮", duplicates: 0 },
  { id: "pr_19", name: "Dragon Mask", description: "A fearsome dragon headdress.", rarity: "legendary", category: "headgear", cost: 75, currency: "tokens", icon: "🐉", duplicates: 0 },
  { id: "pr_20", name: "Legendary Frame", description: "The ultimate carnival border.", rarity: "legendary", category: "frame", cost: 100, currency: "tokens", icon: "🏆", duplicates: 0 },
];

const ATTRACTIONS: CarnivalAttraction[] = [
  { id: "wheel", name: "Spinning Wheel", description: "Spin the fortune wheel for rewards!", icon: "🎡", ticketCost: 10, maxPlaysPerDay: 50, category: "game", isActive: true },
  { id: "ring_toss", name: "Ring Toss", description: "Toss rings onto word pegs for points.", icon: "🎪", ticketCost: 5, maxPlaysPerDay: 30, category: "game", isActive: true },
  { id: "whack", name: "Whack-a-Word", description: "Whack popping word moles!", icon: "🔨", ticketCost: 8, maxPlaysPerDay: 20, category: "game", isActive: true },
  { id: "balloon", name: "Balloon Pop", description: "Pop balloons to spell words.", icon: "🎈", ticketCost: 5, maxPlaysPerDay: 25, category: "game", isActive: true },
  { id: "fortune", name: "Fortune Teller", description: "Get a mystical prediction!", icon: "🔮", ticketCost: 15, maxPlaysPerDay: 10, category: "fortune", isActive: true },
  { id: "duck_hunt", name: "Duck Hunt", description: "Shoot rubber ducks with words.", icon: "🦆", ticketCost: 8, maxPlaysPerDay: 20, category: "game", isActive: true },
  { id: "strength", name: "Strength Test", description: "Type fast to ring the bell!", icon: "💪", ticketCost: 10, maxPlaysPerDay: 15, category: "challenge", isActive: true },
  { id: "maze", name: "Maze Runner", description: "Navigate the word maze.", icon: "🌀", ticketCost: 12, maxPlaysPerDay: 15, category: "challenge", isActive: true },
];

const FORTUNE_PREDICTIONS = [
  { prediction: "Great words shall flow from your fingertips!", bonus: { type: "xp", amount: 200 }, mood: "positive" as const },
  { prediction: "The letters align in your favor today.", bonus: { type: "tickets", amount: 50 }, mood: "positive" as const },
  { prediction: "A hidden word waits to be discovered...", bonus: { type: "tokens", amount: 2 }, mood: "mysterious" as const },
  { prediction: "Fortune smiles upon your snake's path.", bonus: { type: "xp", amount: 150 }, mood: "positive" as const },
  { prediction: "The stars spell something grand for you.", bonus: { type: "tickets", amount: 75 }, mood: "mysterious" as const },
  { prediction: "Your vocabulary grows stronger each day.", bonus: { type: "xp", amount: 100 }, mood: "neutral" as const },
  { prediction: "A legendary word is within your grasp.", bonus: { type: "tokens", amount: 3 }, mood: "mysterious" as const },
  { prediction: "The carnival spirits bless your next game.", bonus: { type: "tickets", amount: 100 }, mood: "positive" as const },
  { prediction: "Patience reveals the longest words.", bonus: { type: "xp", amount: 75 }, mood: "neutral" as const },
  { prediction: "Destiny weaves words of power for you.", bonus: { type: "tokens", amount: 1 }, mood: "mysterious" as const },
];

const EVENT_ACHIEVEMENTS: Achievement[] = [
  { id: "ea_01", name: "First Spin", description: "Spin the wheel for the first time.", condition: "spin_count >= 1", reward: { type: "tickets", amount: 25 }, unlocked: false, unlockTimestamp: null, progress: 0, maxProgress: 1 },
  { id: "ea_02", name: "Lucky Streak", description: "Win 3 spins in a row.", condition: "consecutive_wins >= 3", reward: { type: "tickets", amount: 100 }, unlocked: false, unlockTimestamp: null, progress: 0, maxProgress: 3 },
  { id: "ea_03", name: "Ring Master", description: "Get a perfect round in Ring Toss.", condition: "perfect_rounds >= 1", reward: { type: "tickets", amount: 150 }, unlocked: false, unlockTimestamp: null, progress: 0, maxProgress: 1 },
  { id: "ea_04", name: "Word Whacker", description: "Whack 50 words total.", condition: "words_whacked >= 50", reward: { type: "xp", amount: 500 }, unlocked: false, unlockTimestamp: null, progress: 0, maxProgress: 50 },
  { id: "ea_05", name: "Balloon Buster", description: "Pop 30 balloons.", condition: "balloons_popped >= 30", reward: { type: "tickets", amount: 200 }, unlocked: false, unlockTimestamp: null, progress: 0, maxProgress: 30 },
  { id: "ea_06", name: "Fortune Seeker", description: "Visit the Fortune Teller 10 times.", condition: "fortune_visits >= 10", reward: { type: "tokens", amount: 5 }, unlocked: false, unlockTimestamp: null, progress: 0, maxProgress: 10 },
  { id: "ea_07", name: "Jackpot Winner", description: "Hit the Jackpot on the wheel.", condition: "jackpot_wins >= 1", reward: { type: "tokens", amount: 10 }, unlocked: false, unlockTimestamp: null, progress: 0, maxProgress: 1 },
  { id: "ea_08", name: "Ticket Hoarder", description: "Earn 5000 tickets total.", condition: "total_tickets >= 5000", reward: { type: "tokens", amount: 15 }, unlocked: false, unlockTimestamp: null, progress: 0, maxProgress: 5000 },
  { id: "ea_09", name: "Dedicated Player", description: "Play 100 games total.", condition: "total_games >= 100", reward: { type: "tickets", amount: 500 }, unlocked: false, unlockTimestamp: null, progress: 0, maxProgress: 100 },
  { id: "ea_10", name: "Collector", description: "Collect 10 unique prizes.", condition: "prizes_collected >= 10", reward: { type: "tokens", amount: 20 }, unlocked: false, unlockTimestamp: null, progress: 0, maxProgress: 10 },
];

const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200,
  6600, 8200, 10000, 12000, 14500, 17500, 21000, 25000, 30000, 36000,
];

const RANK_TITLES = [
  "Carnival Visitor", "Fun Seeker", "Game Enthusiast", "Ticket Collector",
  "Attraction Fan", "Ring Champion", "Wheel Spinner", "Fortune Hunter",
  "Carnival Expert", "Prize Winner", "Balloon Artist", "Mole Whacker",
  "Duck Sharpshooter", "Bell Ringer", "Maze Navigator", "Carnival Master",
  "Grand Ringmaster", "Legendary Player", "Carnival Legend", "Supreme Funster",
];

const BALLOON_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"];

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(segments: WheelSegment[]): WheelSegment {
  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const seg of segments) {
    roll -= seg.weight;
    if (roll <= 0) return seg;
  }
  return segments[segments.length - 1];
}

function getDayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function computeCarnivalLevel(totalTicketsEarned: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalTicketsEarned >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function generatePegs(): Peg[] {
  const wordPools = [WORD_POOL_SHORT, WORD_POOL_MEDIUM, WORD_POOL_LONG, WORD_POOL_EXTENDED, WORD_POOL_MAX];
  return wordPools.map((pool, idx) => {
    const word = pickRandom(pool);
    const pointValue = PEG_POINT_VALUES[word.length] || 100;
    return { index: idx, word, pointValue, hasRing: false };
  });
}

function generateMoles(): Mole[] {
  const allWords = [...WORD_POOL_SHORT, ...WORD_POOL_MEDIUM, ...WORD_POOL_LONG];
  const moles: Mole[] = [];
  for (let i = 0; i < 9; i++) {
    const word = pickRandom(allWords);
    moles.push({
      holeIndex: i,
      word,
      pointValue: word.length * 20,
      isGolden: Math.random() < 0.1,
      isPopped: false,
      popTimestamp: Date.now() + Math.floor(Math.random() * 5000),
    });
  }
  return moles;
}

function generateBalloons(word: string): Balloon[] {
  const letters = word.split("");
  const shuffled = [...letters].sort(() => Math.random() - 0.5);
  return shuffled.map((letter, idx) => ({
    letter,
    index: idx,
    isPopped: false,
    color: pickRandom(BALLOON_COLORS),
  }));
}

function pickTargetWord(): string {
  const pool = [...WORD_POOL_MEDIUM, ...WORD_POOL_LONG, ...WORD_POOL_EXTENDED];
  return pickRandom(pool);
}

// ---------------------------------------------------------------------------
// State (SSR-safe)
// ---------------------------------------------------------------------------

interface CarnivalState {
  tickets: number;
  tokens: number;
  jackpotPool: number;
  spinHistory: SpinResult[];
  lastFreeSpinTime: number;
  lastDailySpinTime: string;
  freeSpinsAvailable: number;
  ringToss: RingTossState | null;
  whackAWord: WhackAWordState | null;
  balloonPop: BalloonPopState | null;
  fortuneHistory: FortuneResult[];
  collectedPrizeIds: string[];
  stats: CarnivalStats;
  dailyBonus: DailyBonus;
  dailyPlayCounts: Record<string, number>;
  lastDailyReset: string;
  currentEvent: CarnivalEvent | null;
  eventLeaderboard: EventLeaderboardEntry[];
  consecutiveSpinWins: number;
  totalBalloonsPopped: number;
  totalFortuneVisits: number;
}

let state: CarnivalState | null = null;

function ensureInit(): CarnivalState {
  if (state) return state;
  const now = Date.now();
  const todayKey = getDayKey(now);
  state = {
    tickets: 0,
    tokens: 0,
    jackpotPool: 500,
    spinHistory: [],
    lastFreeSpinTime: 0,
    lastDailySpinTime: "",
    freeSpinsAvailable: 1,
    ringToss: null,
    whackAWord: null,
    balloonPop: null,
    fortuneHistory: [],
    collectedPrizeIds: [],
    stats: {
      totalTicketsEarned: 0,
      totalTicketsSpent: 0,
      totalTokensEarned: 0,
      gamesPlayed: {},
      bestScores: {},
      totalPrizesCollected: 0,
      carnivalLevel: 1,
      totalSpins: 0,
      totalRoundsCompleted: 0,
      totalWordsWhacked: 0,
      jackpotWins: 0,
      perfectRounds: 0,
    },
    dailyBonus: {
      day: 1,
      claimed: false,
      claimTimestamp: null,
      reward: { type: "tickets", amount: 50 },
    },
    dailyPlayCounts: {},
    lastDailyReset: todayKey,
    currentEvent: {
      id: "event_weekly_01",
      name: "Grand Carnival Week",
      description: "Double tickets on all attractions this week!",
      startDate: now,
      endDate: now + 7 * 24 * 60 * 60 * 1000,
      isActive: true,
      bonusMultiplier: 2,
      exclusivePrizeId: "pr_18",
    },
    eventLeaderboard: [],
    consecutiveSpinWins: 0,
    totalBalloonsPopped: 0,
    totalFortuneVisits: 0,
  };
  return state;
}

// ---------------------------------------------------------------------------
// State Management
// ---------------------------------------------------------------------------

export function cvGetState(): CarnivalState {
  return ensureInit();
}

export function cvResetState(): void {
  state = null;
  ensureInit();
}

// ---------------------------------------------------------------------------
// Daily Reset Logic
// ---------------------------------------------------------------------------

function ensureDailyReset(s: CarnivalState): void {
  const todayKey = getDayKey(Date.now());
  if (s.lastDailyReset !== todayKey) {
    s.dailyPlayCounts = {};
    s.lastDailyReset = todayKey;
    if (s.dailyBonus.claimed) {
      s.dailyBonus = {
        day: ((s.dailyBonus.day) % 7) + 1,
        claimed: false,
        claimTimestamp: null,
        reward: { type: "tickets", amount: 50 + (s.dailyBonus.day * 10) },
      };
    }
  }
}

function getEventBonusMultiplier(s: CarnivalState): number {
  if (s.currentEvent && s.currentEvent.isActive) {
    if (Date.now() >= s.currentEvent.startDate && Date.now() <= s.currentEvent.endDate) {
      return s.currentEvent.bonusMultiplier;
    }
    s.currentEvent.isActive = false;
  }
  return 1;
}

// ---------------------------------------------------------------------------
// Carnival Core
// ---------------------------------------------------------------------------

export function cvGetCarnival() {
  const s = ensureInit();
  return {
    tickets: s.tickets,
    tokens: s.tokens,
    jackpotPool: s.jackpotPool,
    carnivalLevel: cvGetCarnivalLevel(),
    attractionsAvailable: ATTRACTIONS.filter(a => a.isActive),
    totalPrizes: ALL_PRIZES.length,
    collectedCount: s.collectedPrizeIds.length,
  };
}

export function cvGetCarnivalLevel(): number {
  const s = ensureInit();
  s.stats.carnivalLevel = computeCarnivalLevel(s.stats.totalTicketsEarned);
  return s.stats.carnivalLevel;
}

export function cvAddTickets(amount: number): number {
  const s = ensureInit();
  const eventMultiplier = getEventBonusMultiplier(s);
  const total = Math.floor(amount * eventMultiplier);
  s.tickets += total;
  s.stats.totalTicketsEarned += total;
  return total;
}

export function cvAddTokens(amount: number): number {
  const s = ensureInit();
  s.tokens += amount;
  s.stats.totalTokensEarned += amount;
  return amount;
}

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

export function cvGetTickets(): number {
  return ensureInit().tickets;
}

export function cvGetTokens(): number {
  return ensureInit().tokens;
}

export function cvSpendTickets(amount: number): boolean {
  const s = ensureInit();
  if (s.tickets < amount) return false;
  s.tickets -= amount;
  s.stats.totalTicketsSpent += amount;
  return true;
}

export function cvSpendTokens(amount: number): boolean {
  const s = ensureInit();
  if (s.tokens < amount) return false;
  s.tokens -= amount;
  return true;
}

// ---------------------------------------------------------------------------
// Attractions
// ---------------------------------------------------------------------------

export function cvGetAttractions(): CarnivalAttraction[] {
  return [...ATTRACTIONS];
}

export function cvGetAttraction(id: string): CarnivalAttraction | null {
  return ATTRACTIONS.find(a => a.id === id) ?? null;
}

export function cvPlayAttraction(id: string): { success: boolean; message: string; gameState?: unknown } {
  const s = ensureInit();
  ensureDailyReset(s);
  const attraction = ATTRACTIONS.find(a => a.id === id);
  if (!attraction) return { success: false, message: "Attraction not found." };
  if (!attraction.isActive) return { success: false, message: "This attraction is currently closed." };

  const playsToday = s.dailyPlayCounts[id] || 0;
  if (playsToday >= attraction.maxPlaysPerDay) {
    return { success: false, message: "Daily play limit reached for this attraction." };
  }
  if (s.tickets < attraction.ticketCost) {
    return { success: false, message: "Not enough tickets." };
  }

  s.tickets -= attraction.ticketCost;
  s.stats.totalTicketsSpent += attraction.ticketCost;
  s.dailyPlayCounts[id] = playsToday + 1;
  s.stats.gamesPlayed[id] = (s.stats.gamesPlayed[id] || 0) + 1;

  switch (id) {
    case "ring_toss":
      s.ringToss = {
        pegs: generatePegs(),
        ringsRemaining: 3,
        roundScore: 0,
        isRoundActive: true,
        roundNumber: (s.ringToss?.roundNumber ?? 0) + 1,
        totalScore: s.ringToss?.totalScore ?? 0,
        perfectRoundBonus: false,
      };
      return { success: true, message: "Ring Toss started! Aim for the word pegs.", gameState: s.ringToss };

    case "whack":
      s.whackAWord = {
        moles: generateMoles(),
        score: 0,
        combo: 0,
        maxCombo: 0,
        wordsHit: 0,
        wordsMissed: 0,
        startTime: Date.now(),
        endTime: Date.now() + WHACK_DURATION_MS,
        isActive: true,
        timeRemaining: WHACK_DURATION_MS,
      };
      return { success: true, message: "Whack-a-Word started! Hit those moles!", gameState: s.whackAWord };

    case "balloon":
      {
        const targetWord = pickTargetWord();
        s.balloonPop = {
          balloons: generateBalloons(targetWord),
          targetWord,
          currentSpelling: "",
          score: 0,
          attemptsLeft: targetWord.length + 3,
          isActive: true,
          roundsCompleted: s.balloonPop?.roundsCompleted ?? 0,
        };
        return { success: true, message: `Pop balloons to spell: ${targetWord.length} letter word!`, gameState: s.balloonPop };
      }

    case "fortune":
      {
        const fortune = cvGetFortune();
        return { success: true, message: fortune.prediction, gameState: fortune };
      }

    case "wheel":
      {
        const result = cvSpinWheel();
        return { success: true, message: `You landed on: ${result.segment.label}`, gameState: result };
      }

    case "duck_hunt":
      {
        const points = Math.floor(Math.random() * 200) + 50;
        const ticketsEarned = cvAddTickets(points);
        updateBestScore(s, "duck_hunt", points);
        return { success: true, message: `Duck Hunt complete! Earned ${ticketsEarned} tickets.`, gameState: { points, ticketsEarned } };
      }

    case "strength":
      {
        const power = Math.floor(Math.random() * 100) + 1;
        let prize = "Try Again";
        let ticketsEarned = 0;
        if (power >= 95) { prize = "Bell Ringer!"; ticketsEarned = cvAddTickets(500); }
        else if (power >= 80) { prize = "Strong!"; ticketsEarned = cvAddTickets(200); }
        else if (power >= 60) { prize = "Good Effort!"; ticketsEarned = cvAddTickets(100); }
        else if (power >= 40) { prize = "Not Bad"; ticketsEarned = cvAddTickets(50); }
        else { ticketsEarned = cvAddTickets(10); }
        updateBestScore(s, "strength", power);
        return { success: true, message: `Power: ${power}/100 — ${prize} (+${ticketsEarned} tickets)`, gameState: { power, prize, ticketsEarned } };
      }

    case "maze":
      {
        const words = Array.from({ length: 5 }, () => pickRandom(WORD_POOL_MEDIUM));
        const timeTaken = Math.floor(Math.random() * 60) + 15;
        const points = Math.max(10, 300 - timeTaken * 3);
        const ticketsEarned = cvAddTickets(points);
        updateBestScore(s, "maze", points);
        return { success: true, message: `Maze completed in ${timeTaken}s! +${ticketsEarned} tickets.`, gameState: { words, timeTaken, points, ticketsEarned } };
      }

    default:
      return { success: false, message: "Unknown attraction." };
  }
}

function updateBestScore(s: CarnivalState, attractionId: string, score: number): void {
  const currentBest = s.stats.bestScores[attractionId] || 0;
  if (score > currentBest) {
    s.stats.bestScores[attractionId] = score;
  }
}

// ---------------------------------------------------------------------------
// Spinning Wheel
// ---------------------------------------------------------------------------

export function cvSpinWheel(): SpinResult {
  const s = ensureInit();
  s.stats.totalSpins++;
  const segment = weightedPick(WHEEL_SEGMENTS);
  const now = Date.now();

  let reward = 0;
  let rewardType: SpinResult["rewardType"] = "none";

  switch (segment.type) {
    case "coins_2x": {
      const base = 20;
      reward = base * segment.multiplier;
      rewardType = "tickets";
      const earned = cvAddTickets(reward);
      reward = earned;
      break;
    }
    case "xp_100":
      reward = segment.multiplier;
      rewardType = "xp";
      break;
    case "mystery_box": {
      const mysteryRewards = [
        { r: 150, t: "tickets" as const },
        { r: 300, t: "tickets" as const },
        { r: 3, t: "tokens" as const },
        { r: 200, t: "xp" as const },
      ];
      const pick = pickRandom(mysteryRewards);
      reward = pick.r;
      rewardType = pick.t;
      if (pick.t === "tickets") reward = cvAddTickets(pick.r);
      else if (pick.t === "tokens") cvAddTokens(pick.r);
      break;
    }
    case "free_spin":
      reward = 1;
      rewardType = "tickets";
      s.freeSpinsAvailable++;
      break;
    case "jackpot":
      reward = s.jackpotPool;
      rewardType = "tickets";
      const jpEarned = cvAddTickets(s.jackpotPool);
      reward = jpEarned;
      s.jackpotPool = 500;
      s.stats.jackpotWins++;
      s.consecutiveSpinWins++;
      break;
    case "small_prize":
      reward = 50;
      rewardType = "tickets";
      reward = cvAddTickets(50);
      break;
    case "medium_prize":
      reward = 150;
      rewardType = "tickets";
      reward = cvAddTickets(150);
      break;
    case "powerup":
      reward = 1;
      rewardType = "powerup";
      break;
    case "extra_life":
      reward = 1;
      rewardType = "extra_life";
      break;
    case "nothing":
      reward = 0;
      rewardType = "none";
      s.consecutiveSpinWins = 0;
      break;
  }

  if (segment.type !== "nothing") {
    s.jackpotPool += 10;
  }

  const result: SpinResult = { segment, timestamp: now, reward, rewardType };
  s.spinHistory.unshift(result);
  if (s.spinHistory.length > 20) s.spinHistory = s.spinHistory.slice(0, 20);

  cvCheckAchievements();
  return result;
}

export function cvGetWheelResult(): SpinResult | null {
  const s = ensureInit();
  return s.spinHistory[0] ?? null;
}

export function cvGetFreeSpins(): { available: number; nextFreeSpinAt: number } {
  const s = ensureInit();
  const now = Date.now();
  const timeSinceLastFree = now - s.lastFreeSpinTime;
  if (timeSinceLastFree >= FREE_SPIN_COOLDOWN_MS) {
    return { available: s.freeSpinsAvailable + 1, nextFreeSpinAt: 0 };
  }
  return {
    available: s.freeSpinsAvailable,
    nextFreeSpinAt: s.lastFreeSpinTime + FREE_SPIN_COOLDOWN_MS,
  };
}

export function cvGetSpinHistory(): SpinResult[] {
  return [...ensureInit().spinHistory];
}

export function cvUseFreeSpin(): SpinResult | null {
  const s = ensureInit();
  const freeInfo = cvGetFreeSpins();
  if (freeInfo.available < 1) return null;
  s.freeSpinsAvailable = Math.max(0, s.freeSpinsAvailable - 1);
  s.lastFreeSpinTime = Date.now();
  return cvSpinWheel();
}

// ---------------------------------------------------------------------------
// Ring Toss
// ---------------------------------------------------------------------------

export function cvGetRingTossState(): RingTossState | null {
  const s = ensureInit();
  if (!s.ringToss || !s.ringToss.isRoundActive) return null;
  return { ...s.ringToss, pegs: [...s.ringToss.pegs] };
}

export function cvGetPegs(): Peg[] {
  const s = ensureInit();
  if (!s.ringToss) return [];
  return [...s.ringToss.pegs];
}

export function cvTossRing(pegIndex: number): { success: boolean; landed: boolean; points: number; message: string } {
  const s = ensureInit();
  if (!s.ringToss || !s.ringToss.isRoundActive) {
    return { success: false, landed: false, points: 0, message: "No active Ring Toss round." };
  }
  if (s.ringToss.ringsRemaining <= 0) {
    return { success: false, landed: false, points: 0, message: "No rings remaining." };
  }

  s.ringToss.ringsRemaining--;
  const peg = s.ringToss.pegs[pegIndex];
  if (!peg) {
    return { success: false, landed: false, points: 0, message: "Invalid peg." };
  }

  // Accuracy decreases with distance (higher index = farther peg)
  const accuracy = Math.max(0.3, 0.9 - pegIndex * 0.1);
  const landed = Math.random() < accuracy;

  if (landed) {
    peg.hasRing = true;
    s.ringToss.roundScore += peg.pointValue;
    s.stats.totalRoundsCompleted++;

    if (s.ringToss.ringsRemaining === 0) {
      s.ringToss.isRoundActive = false;
      const allLanded = s.ringToss.pegs.filter(p => p.hasRing).length;
      if (allLanded === 3) {
        s.ringToss.roundScore *= 3;
        s.ringToss.perfectRoundBonus = true;
        s.stats.perfectRounds++;
      }
      const ticketsEarned = cvAddTickets(s.ringToss.roundScore);
      s.ringToss.totalScore += s.ringToss.roundScore;
      updateBestScore(s, "ring_toss", s.ringToss.roundScore);
      cvCheckAchievements();
      return {
        success: true, landed: true,
        points: s.ringToss.roundScore,
        message: `Ring landed on "${peg.word}"! Round over. ${s.ringToss.perfectRoundBonus ? "PERFECT ROUND! 3x bonus! " : ""}+${ticketsEarned} tickets.`,
      };
    }
    return { success: true, landed: true, points: peg.pointValue, message: `Ring landed on "${peg.word}"! +${peg.pointValue} points.` };
  }

  if (s.ringToss.ringsRemaining === 0) {
    s.ringToss.isRoundActive = false;
    const ticketsEarned = cvAddTickets(s.ringToss.roundScore);
    s.ringToss.totalScore += s.ringToss.roundScore;
    updateBestScore(s, "ring_toss", s.ringToss.roundScore);
    return {
      success: true, landed: false, points: s.ringToss.roundScore,
      message: `Missed! Round over. Total: ${s.ringToss.roundScore} points. +${ticketsEarned} tickets.`,
    };
  }

  return { success: true, landed: false, points: 0, message: `Missed! ${s.ringToss.ringsRemaining} rings remaining.` };
}

// ---------------------------------------------------------------------------
// Whack-a-Word
// ---------------------------------------------------------------------------

export function cvGetWhackAWordState(): WhackAWordState | null {
  const s = ensureInit();
  if (!s.whackAWord || !s.whackAWord.isActive) return null;
  const now = Date.now();
  const elapsed = now - s.whackAWord.startTime;
  const remaining = Math.max(0, WHACK_DURATION_MS - elapsed);
  if (remaining <= 0) {
    s.whackAWord.isActive = false;
    s.whackAWord.timeRemaining = 0;
    const ticketsEarned = cvAddTickets(s.whackAWord.score);
    updateBestScore(s, "whack", s.whackAWord.score);
    return { ...s.whackAWord, timeRemaining: 0, moles: [...s.whackAWord.moles] };
  }
  return { ...s.whackAWord, timeRemaining: remaining, moles: [...s.whackAWord.moles] };
}

export function cvGetMoles(): Mole[] {
  const s = ensureInit();
  if (!s.whackAWord) return [];
  return [...s.whackAWord.moles];
}

export function cvWhackWord(holeIndex: number): { success: boolean; points: number; message: string; isGolden: boolean } {
  const s = ensureInit();
  if (!s.whackAWord || !s.whackAWord.isActive) {
    return { success: false, points: 0, message: "No active Whack-a-Word game.", isGolden: false };
  }

  const now = Date.now();
  if (now >= s.whackAWord.endTime) {
    s.whackAWord.isActive = false;
    return { success: false, points: 0, message: "Time's up!", isGolden: false };
  }

  const mole = s.whackAWord.moles[holeIndex];
  if (!mole) return { success: false, points: 0, message: "Invalid hole.", isGolden: false };
  if (mole.isPopped) return { success: false, points: 0, message: "Already whacked!", isGolden: false };

  mole.isPopped = true;
  const isGolden = mole.isGolden;
  let points = mole.pointValue;

  if (isGolden) {
    points *= 5;
  }

  s.whackAWord.combo++;
  if (s.whackAWord.combo > s.whackAWord.maxCombo) {
    s.whackAWord.maxCombo = s.whackAWord.combo;
  }
  const comboMultiplier = 1 + (s.whackAWord.combo - 1) * 0.25;
  points = Math.floor(points * comboMultiplier);

  s.whackAWord.score += points;
  s.whackAWord.wordsHit++;
  s.stats.totalWordsWhacked++;

  const remaining = s.whackAWord.endTime - now;
  if (remaining <= 0) {
    s.whackAWord.isActive = false;
    s.whackAWord.timeRemaining = 0;
    const ticketsEarned = cvAddTickets(s.whackAWord.score);
    updateBestScore(s, "whack", s.whackAWord.score);
    cvCheckAchievements();
    return {
      success: true, points, isGolden,
      message: `Whacked "${mole.word}"! +${points} pts (Combo ×${s.whackAWord.combo})! Game over! +${ticketsEarned} tickets.`,
    };
  }

  return {
    success: true, points, isGolden,
    message: `Whacked "${mole.word}"! +${points} pts (Combo ×${s.whackAWord.combo})`,
  };
}

export function cvWhackMiss(): void {
  const s = ensureInit();
  if (!s.whackAWord || !s.whackAWord.isActive) return;
  s.whackAWord.combo = 0;
  s.whackAWord.wordsMissed++;
}

// ---------------------------------------------------------------------------
// Balloon Pop
// ---------------------------------------------------------------------------

export function cvGetBalloonPopState(): BalloonPopState | null {
  const s = ensureInit();
  if (!s.balloonPop || !s.balloonPop.isActive) return null;
  return { ...s.balloonPop, balloons: [...s.balloonPop.balloons] };
}

export function cvGetBalloons(): Balloon[] {
  const s = ensureInit();
  if (!s.balloonPop) return [];
  return [...s.balloonPop.balloons];
}

export function cvPopBalloon(balloonIndex: number): { success: boolean; letter: string; correct: boolean; message: string; wordComplete: boolean } {
  const s = ensureInit();
  if (!s.balloonPop || !s.balloonPop.isActive) {
    return { success: false, letter: "", correct: false, message: "No active Balloon Pop game.", wordComplete: false };
  }

  const balloon = s.balloonPop.balloons[balloonIndex];
  if (!balloon) return { success: false, letter: "", correct: false, message: "Invalid balloon.", wordComplete: false };
  if (balloon.isPopped) return { success: false, letter: balloon.letter, correct: false, message: "Already popped!", wordComplete: false };

  balloon.isPopped = true;
  s.totalBalloonsPopped++;
  s.balloonPop.attemptsLeft--;

  const targetWord = s.balloonPop.targetWord;
  const nextLetterIndex = s.balloonPop.currentSpelling.length;
  const neededLetter = targetWord[nextLetterIndex];

  if (balloon.letter === neededLetter) {
    s.balloonPop.currentSpelling += balloon.letter;
    s.balloonPop.score += 25;

    if (s.balloonPop.currentSpelling === targetWord) {
      s.balloonPop.isActive = false;
      s.balloonPop.roundsCompleted++;
      const bonus = s.balloonPop.attemptsLeft * 15;
      s.balloonPop.score += bonus;
      const ticketsEarned = cvAddTickets(s.balloonPop.score);
      cvCheckAchievements();
      return {
        success: true, letter: balloon.letter, correct: true,
        message: `Word "${targetWord}" complete! +${bonus} bonus! +${ticketsEarned} tickets.`,
        wordComplete: true,
      };
    }
    return { success: true, letter: balloon.letter, correct: true, message: `Correct! "${s.balloonPop.currentSpelling}" so far.`, wordComplete: false };
  }

  if (s.balloonPop.attemptsLeft <= 0) {
    s.balloonPop.isActive = false;
    const ticketsEarned = cvAddTickets(Math.floor(s.balloonPop.score / 2));
    return {
      success: true, letter: balloon.letter, correct: false,
      message: `Wrong letter! Game over. The word was "${targetWord}". +${ticketsEarned} tickets.`,
      wordComplete: false,
    };
  }
  return { success: true, letter: balloon.letter, correct: false, message: `Wrong letter! ${s.balloonPop.attemptsLeft} attempts left.`, wordComplete: false };
}

// ---------------------------------------------------------------------------
// Fortune Teller
// ---------------------------------------------------------------------------

export function cvGetFortune(): FortuneResult {
  const s = ensureInit();
  s.totalFortuneVisits++;
  const prediction = pickRandom(FORTUNE_PREDICTIONS);
  const result: FortuneResult = {
    prediction: prediction.prediction,
    bonus: { ...prediction.bonus },
    timestamp: Date.now(),
    mood: prediction.mood,
  };

  if (result.bonus.type === "tickets") cvAddTickets(result.bonus.amount);
  else if (result.bonus.type === "tokens") cvAddTokens(result.bonus.amount);

  s.fortuneHistory.unshift(result);
  if (s.fortuneHistory.length > 20) s.fortuneHistory = s.fortuneHistory.slice(0, 20);

  cvCheckAchievements();
  return result;
}

export function cvGetFortuneHistory(): FortuneResult[] {
  return [...ensureInit().fortuneHistory];
}

// ---------------------------------------------------------------------------
// Prize Collection
// ---------------------------------------------------------------------------

export function cvGetPrizes(): Prize[] {
  return ALL_PRIZES.map(p => ({
    ...p,
    duplicates: ensureInit().collectedPrizeIds.filter(id => id === p.id).length,
    collected: ensureInit().collectedPrizeIds.includes(p.id),
  }));
}

export function cvGetPrizeCollection(): { prizeId: string; name: string; rarity: RarityTier; duplicates: number }[] {
  const s = ensureInit();
  const collectionMap = new Map<string, number>();
  for (const id of s.collectedPrizeIds) {
    collectionMap.set(id, (collectionMap.get(id) || 0) + 1);
  }
  const result: { prizeId: string; name: string; rarity: RarityTier; duplicates: number }[] = [];
  for (const [prizeId, dupes] of collectionMap) {
    const prize = ALL_PRIZES.find(p => p.id === prizeId);
    if (prize) result.push({ prizeId, name: prize.name, rarity: prize.rarity, duplicates: dupes });
  }
  return result;
}

export function cvRedeemPrize(prizeId: string): { success: boolean; message: string; isDuplicate: boolean; duplicateTickets: number } {
  const s = ensureInit();
  const prize = ALL_PRIZES.find(p => p.id === prizeId);
  if (!prize) return { success: false, message: "Prize not found.", isDuplicate: false, duplicateTickets: 0 };

  const cost = prize.cost;
  if (prize.currency === "tickets") {
    if (!cvSpendTickets(cost)) return { success: false, message: "Not enough tickets.", isDuplicate: false, duplicateTickets: 0 };
  } else {
    if (!cvSpendTokens(cost)) return { success: false, message: "Not enough tokens.", isDuplicate: false, duplicateTickets: 0 };
  }

  const isDuplicate = s.collectedPrizeIds.includes(prizeId);
  s.collectedPrizeIds.push(prizeId);
  s.stats.totalPrizesCollected++;

  let duplicateTickets = 0;
  if (isDuplicate) {
    const dupeValue = prize.currency === "tickets"
      ? Math.floor(prize.cost * 0.25)
      : Math.floor(prize.cost * 0.1) * 10;
    duplicateTickets = cvAddTickets(dupeValue);
  }

  cvCheckAchievements();
  return {
    success: true,
    message: isDuplicate
      ? `Duplicate "${prize.name}"! Converted to ${duplicateTickets} tickets.`
      : `Redeemed "${prize.name}"!`,
    isDuplicate,
    duplicateTickets,
  };
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export function cvGetEvent(): CarnivalEvent | null {
  const s = ensureInit();
  if (s.currentEvent && s.currentEvent.isActive && Date.now() <= s.currentEvent.endDate) {
    return { ...s.currentEvent };
  }
  return null;
}

export function cvGetEventLeaderboard(): EventLeaderboardEntry[] {
  return [...ensureInit().eventLeaderboard];
}

export function cvGetEventAchievements(): Achievement[] {
  return EVENT_ACHIEVEMENTS.map(a => ({ ...a }));
}

export function cvSetActiveEvent(event: Partial<CarnivalEvent>): CarnivalEvent | null {
  const s = ensureInit();
  if (s.currentEvent) {
    Object.assign(s.currentEvent, event);
    return { ...s.currentEvent };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export function cvGetAchievements(): Achievement[] {
  const s = ensureInit();
  return EVENT_ACHIEVEMENTS.map(a => ({ ...a }));
}

export function cvCheckAchievements(): Achievement[] {
  const s = ensureInit();
  const newlyUnlocked: Achievement[] = [];

  const checks: Record<string, number> = {
    spin_count: s.stats.totalSpins,
    consecutive_wins: s.consecutiveSpinWins,
    perfect_rounds: s.stats.perfectRounds,
    words_whacked: s.stats.totalWordsWhacked,
    balloons_popped: s.totalBalloonsPopped,
    fortune_visits: s.totalFortuneVisits,
    jackpot_wins: s.stats.jackpotWins,
    total_tickets: s.stats.totalTicketsEarned,
    total_games: Object.values(s.stats.gamesPlayed).reduce((a, b) => a + b, 0),
    prizes_collected: new Set(s.collectedPrizeIds).size,
  };

  for (const achievement of EVENT_ACHIEVEMENTS) {
    if (achievement.unlocked) continue;
    const condKey = achievement.condition.split(" >= ")[0];
    const condValue = parseInt(achievement.condition.split(" >= ")[1], 10);
    const current = checks[condKey] ?? 0;
    achievement.progress = Math.min(current, achievement.maxProgress);

    if (current >= condValue) {
      achievement.unlocked = true;
      achievement.unlockTimestamp = Date.now();
      if (achievement.reward.type === "tickets") cvAddTickets(achievement.reward.amount);
      else if (achievement.reward.type === "tokens") cvAddTokens(achievement.reward.amount);
      else if (achievement.reward.type === "xp") { /* XP tracking handled externally */ }
      newlyUnlocked.push({ ...achievement });
    }
  }

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

export function cvGetStats(): CarnivalStats {
  const s = ensureInit();
  s.stats.carnivalLevel = computeCarnivalLevel(s.stats.totalTicketsEarned);
  return { ...s.stats };
}

export function cvGetTotalGamesPlayed(): number {
  const s = ensureInit();
  return Object.values(s.stats.gamesPlayed).reduce((a, b) => a + b, 0);
}

export function cvGetBestScore(attractionId: string): number {
  return ensureInit().stats.bestScores[attractionId] || 0;
}

// ---------------------------------------------------------------------------
// Daily Bonus
// ---------------------------------------------------------------------------

export function cvGetDailyBonus(): DailyBonus & { canClaim: boolean } {
  const s = ensureInit();
  ensureDailyReset(s);
  return { ...s.dailyBonus, canClaim: !s.dailyBonus.claimed };
}

export function cvClaimDailyBonus(): { claimed: boolean; reward: { type: string; amount: number } } {
  const s = ensureInit();
  ensureDailyReset(s);
  if (s.dailyBonus.claimed) return { claimed: false, reward: { type: "none", amount: 0 } };

  s.dailyBonus.claimed = true;
  s.dailyBonus.claimTimestamp = Date.now();

  if (s.dailyBonus.reward.type === "tickets") cvAddTickets(s.dailyBonus.reward.amount);
  else if (s.dailyBonus.reward.type === "tokens") cvAddTokens(s.dailyBonus.reward.amount);

  return { claimed: true, reward: { ...s.dailyBonus.reward } };
}

// ---------------------------------------------------------------------------
// Season
// ---------------------------------------------------------------------------

export function cvGetSeasonProgress(): SeasonInfo {
  const s = ensureInit();
  const now = Date.now();
  const startOffset = now % (7 * 24 * 60 * 60 * 1000);
  const seasonStart = now - startOffset;
  const dayProgress = Math.min(7, Math.floor(startOffset / (24 * 60 * 60 * 1000)) + 1);

  return {
    id: `season_${Math.floor(now / (7 * 24 * 60 * 60 * 1000))}`,
    name: "Carnival Season",
    startDate: seasonStart,
    endDate: seasonStart + 7 * 24 * 60 * 60 * 1000,
    dayProgress,
    totalDays: 7,
    isActive: true,
    exclusivePrizes: ["pr_18", "pr_19", "pr_20"],
  };
}

export function cvGetSeasonPrizes(): Prize[] {
  return ALL_PRIZES.filter(p => ["pr_18", "pr_19", "pr_20"].includes(p.id)).map(p => ({
    ...p,
    collected: ensureInit().collectedPrizeIds.includes(p.id),
  }));
}

// ---------------------------------------------------------------------------
// Progression
// ---------------------------------------------------------------------------

export function cvGetCarnivalRank(): { rank: number; title: string; level: number; nextLevelAt: number; progress: number } {
  const s = ensureInit();
  const level = cvGetCarnivalLevel();
  const earned = s.stats.totalTicketsEarned;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 1.5;
  const progress = nextThreshold > currentThreshold
    ? Math.min(1, (earned - currentThreshold) / (nextThreshold - currentThreshold))
    : 1;

  return {
    rank: level,
    title: RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)],
    level,
    nextLevelAt: nextThreshold,
    progress: Math.floor(progress * 100),
  };
}

export function cvGetNextPrizeUnlock(): { prize: Prize | null; ticketsNeeded: number; canAfford: boolean } | null {
  const s = ensureInit();
  const uncollected = ALL_PRIZES.find(p => !s.collectedPrizeIds.includes(p.id));
  if (!uncollected) return null;
  const cost = uncollected.cost;
  const canAfford = uncollected.currency === "tickets"
    ? s.tickets >= cost
    : s.tokens >= cost;
  return { prize: { ...uncollected }, ticketsNeeded: cost, canAfford };
}

// ---------------------------------------------------------------------------
// UI Helpers
// ---------------------------------------------------------------------------

export function cvGetCarnivalOverview(): {
  level: number;
  title: string;
  tickets: number;
  tokens: number;
  jackpotPool: number;
  gamesPlayed: number;
  prizesCollected: number;
  totalPrizes: number;
  freeSpins: number;
  activeEvent: string | null;
} {
  const s = ensureInit();
  const level = cvGetCarnivalLevel();
  const event = cvGetEvent();
  return {
    level,
    title: RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)],
    tickets: s.tickets,
    tokens: s.tokens,
    jackpotPool: s.jackpotPool,
    gamesPlayed: cvGetTotalGamesPlayed(),
    prizesCollected: new Set(s.collectedPrizeIds).size,
    totalPrizes: ALL_PRIZES.length,
    freeSpins: cvGetFreeSpins().available,
    activeEvent: event?.name ?? null,
  };
}

export function cvGetCarnivalDashboard(): {
  overview: ReturnType<typeof cvGetCarnivalOverview>;
  attractions: { id: string; name: string; icon: string; playsToday: number; maxPlays: number; cost: number }[];
  recentSpins: SpinResult[];
  dailyBonus: ReturnType<typeof cvGetDailyBonus>;
  rank: ReturnType<typeof cvGetCarnivalRank>;
  stats: CarnivalStats;
} {
  const s = ensureInit();
  ensureDailyReset(s);
  return {
    overview: cvGetCarnivalOverview(),
    attractions: ATTRACTIONS.map(a => ({
      id: a.id,
      name: a.name,
      icon: a.icon,
      playsToday: s.dailyPlayCounts[a.id] || 0,
      maxPlays: a.maxPlaysPerDay,
      cost: a.ticketCost,
    })),
    recentSpins: s.spinHistory.slice(0, 5),
    dailyBonus: cvGetDailyBonus(),
    rank: cvGetCarnivalRank(),
    stats: cvGetStats(),
  };
}

export function cvGetAttractionCard(id: string): {
  attraction: CarnivalAttraction | null;
  playsToday: number;
  bestScore: number;
  isAvailable: boolean;
  message: string;
} {
  const s = ensureInit();
  ensureDailyReset(s);
  const attraction = ATTRACTIONS.find(a => a.id === id);
  if (!attraction) return { attraction: null, playsToday: 0, bestScore: 0, isAvailable: false, message: "Attraction not found." };

  const playsToday = s.dailyPlayCounts[id] || 0;
  const bestScore = s.stats.bestScores[id] || 0;
  const canAfford = s.tickets >= attraction.ticketCost;
  const canPlay = playsToday < attraction.maxPlaysPerDay && canAfford && attraction.isActive;

  let message = "Ready to play!";
  if (!attraction.isActive) message = "Currently closed.";
  else if (!canAfford) message = "Not enough tickets.";
  else if (playsToday >= attraction.maxPlaysPerDay) message = "Daily limit reached.";

  return { attraction, playsToday, bestScore, isAvailable: canPlay, message };
}

export function cvGetPrizeCard(prizeId: string): {
  prize: Prize | null;
  owned: boolean;
  duplicateCount: number;
  canAfford: boolean;
  rarityLabel: string;
} {
  const s = ensureInit();
  const prize = ALL_PRIZES.find(p => p.id === prizeId);
  if (!prize) return { prize: null, owned: false, duplicateCount: 0, canAfford: false, rarityLabel: "" };

  const owned = s.collectedPrizeIds.includes(prizeId);
  const duplicateCount = s.collectedPrizeIds.filter(id => id === prizeId).length - (owned ? 1 : 0);
  const canAfford = prize.currency === "tickets"
    ? s.tickets >= prize.cost
    : s.tokens >= prize.cost;

  const rarityLabels: Record<RarityTier, string> = {
    common: "Common",
    uncommon: "Uncommon",
    rare: "Rare",
    epic: "Epic",
    legendary: "Legendary",
  };

  return { prize: { ...prize }, owned, duplicateCount, canAfford, rarityLabel: rarityLabels[prize.rarity] };
}

export function cvGetWheelCard(): {
  segments: WheelSegment[];
  jackpotPool: number;
  freeSpins: number;
  nextFreeAt: number;
  totalSpins: number;
  lastResult: SpinResult | null;
} {
  const s = ensureInit();
  const freeInfo = cvGetFreeSpins();
  return {
    segments: [...WHEEL_SEGMENTS],
    jackpotPool: s.jackpotPool,
    freeSpins: freeInfo.available,
    nextFreeAt: freeInfo.nextFreeSpinAt,
    totalSpins: s.stats.totalSpins,
    lastResult: s.spinHistory[0] ?? null,
  };
}

// ---------------------------------------------------------------------------
// Jackpot Management
// ---------------------------------------------------------------------------

export function cvAddToJackpot(amount: number): void {
  const s = ensureInit();
  s.jackpotPool += amount;
}

export function cvGetJackpot(): number {
  return ensureInit().jackpotPool;
}

// ---------------------------------------------------------------------------
// Export count summary
// ---------------------------------------------------------------------------
// Exported functions (40 total):
//   cvGetState, cvResetState,
//   cvGetCarnival, cvGetCarnivalLevel, cvAddTickets, cvAddTokens,
//   cvGetTickets, cvGetTokens, cvSpendTickets, cvSpendTokens,
//   cvGetAttractions, cvGetAttraction, cvPlayAttraction,
//   cvSpinWheel, cvGetWheelResult, cvGetFreeSpins, cvGetSpinHistory, cvUseFreeSpin,
//   cvGetRingTossState, cvGetPegs, cvTossRing,
//   cvGetWhackAWordState, cvGetMoles, cvWhackWord, cvWhackMiss,
//   cvGetBalloonPopState, cvGetBalloons, cvPopBalloon,
//   cvGetFortune, cvGetFortuneHistory,
//   cvGetPrizes, cvGetPrizeCollection, cvRedeemPrize,
//   cvGetEvent, cvGetEventLeaderboard, cvGetEventAchievements, cvSetActiveEvent,
//   cvGetAchievements, cvCheckAchievements,
//   cvGetStats, cvGetTotalGamesPlayed, cvGetBestScore,
//   cvGetDailyBonus, cvClaimDailyBonus,
//   cvGetSeasonProgress, cvGetSeasonPrizes,
//   cvGetCarnivalRank, cvGetNextPrizeUnlock,
//   cvGetCarnivalOverview, cvGetCarnivalDashboard,
//   cvGetAttractionCard, cvGetPrizeCard, cvGetWheelCard,
//   cvAddToJackpot, cvGetJackpot
// Total: 52 exports
