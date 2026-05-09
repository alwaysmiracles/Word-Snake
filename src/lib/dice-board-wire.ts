/**
 * dice-board-wire.ts
 *
 * Dice Board / Dice Game System wire for the Word Snake game.
 * Includes 12 collectible themed dice, 5 dice games (Word Yahtzee,
 * Dice Poker, Dice Duel, Dice Challenge, Lucky 7), a betting system,
 * Yahtzee scoring with all 13 categories, daily dice challenges,
 * achievements, and full statistics tracking.
 *
 * NO React imports — pure TypeScript logic.
 * NO localStorage / window / document / setInterval / setTimeout / addEventListener.
 * All exported functions use the `dc` prefix.
 * SSR-safe: lazy initialization via ensureInit().
 */
// ── Types ────────────────────────────────────────────────────────────────────
type DiceId =
  | 'fire' | 'ice' | 'nature' | 'storm' | 'royal' | 'shadow'
  | 'crystal' | 'lucky' | 'ancient' | 'neon' | 'ocean' | 'cosmic';
type DiceRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type DiceTheme =
  | 'flame' | 'frost' | 'leaf' | 'lightning' | 'crown' | 'skull'
  | 'prism' | 'clover' | 'rune' | 'glow' | 'wave' | 'stars';
type FaceEffect = 'none' | 'fire_blast' | 'ice_shield' | 'nature_heal'
  | 'storm_strike' | 'royal_boost' | 'shadow_curse' | 'prism_refract'
  | 'lucky_charm' | 'rune_power' | 'neon_flash' | 'ocean_tide' | 'cosmic_warp'
  | 'double_roll' | 'bonus_coins' | 'shield' | 'mega_blast';
type GameId = 'word_yahtzee' | 'dice_poker' | 'dice_duel' | 'dice_challenge' | 'lucky_7';
type YahtzeeCategory =
  | 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
  | 'three_of_kind' | 'four_of_kind' | 'full_house'
  | 'small_straight' | 'large_straight' | 'yahtzee' | 'chance';
type PokerRankName =
  | 'high_card' | 'one_pair' | 'two_pair' | 'three_of_kind'
  | 'straight' | 'flush' | 'full_house' | 'four_of_kind'
  | 'straight_flush' | 'five_of_kind' | 'yahtzee';
interface DieFace {
  value: number;
  label: string;
  effect: FaceEffect;
  emoji: string;
}
interface DieDefinition {
  id: DiceId;
  name: string;
  description: string;
  rarity: DiceRarity;
  theme: DiceTheme;
  primaryColor: string;
  secondaryColor: string;
  faces: DieFace[];
  unlockCost: number;
}
interface DiceCollection {
  unlocked: DiceId[];
  unlockDates: Record<DiceId, number>;
}
interface RollResult {
  diceId: DiceId;
  values: number[];
  faces: DieFace[];
  total: number;
  timestamp: number;
  effects: FaceEffect[];
  bonuses: number;
}
type YahtzeeScorecard = Record<YahtzeeCategory, number | null>;
interface YahtzeeState {
  dice: number[];
  kept: boolean[];
  rerollsLeft: number;
  rollCount: number;
  scorecard: YahtzeeScorecard;
  upperBonus: number;
  yahtzeeBonusCount: number;
  totalScore: number;
  gameComplete: boolean;
  turnsPlayed: number;
}
interface PokerResult {
  hand: number[];
  rank: PokerRankName;
  rankValue: number;
  description: string;
  payout: number;
}
interface DuelResult {
  playerDice: number[];
  aiDice: number[];
  playerTotal: number;
  aiTotal: number;
  winner: 'player' | 'ai' | 'tie';
  coinsWon: number;
  timestamp: number;
}
interface ChallengeObjective {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: number;
}
interface Lucky7Result {
  dice: [number, number];
  total: number;
  isJackpot: boolean;
  coinsWon: number;
  timestamp: number;
}
interface BetRecord {
  amount: number;
  game: GameId;
  won: boolean;
  payout: number;
  timestamp: number;
  isDoubleOrNothing: boolean;
}
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate: number | null;
  progress: number;
  target: number;
}
interface DailyState {
  lastClaimDate: string;
  streak: number;
  bestStreak: number;
  totalClaimed: number;
  todayChallenge: string;
  todayChallengeProgress: number;
  todayChallengeComplete: boolean;
}
interface BoardStats {
  totalRolls: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  totalCoinsWon: number;
  totalCoinsLost: number;
  netCoins: number;
  jackpotCount: number;
  bestScores: Record<GameId, number>;
  diceRollsByType: Record<DiceId, number>;
  longestWinStreak: number;
  currentWinStreak: number;
  totalPlayTimeMs: number;
}
interface GameDefinition {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  minBet: number;
  maxBet: number;
  minPlayers: number;
  maxPlayers: number;
}
interface GameSession {
  id: GameId;
  active: boolean;
  bet: number;
  startTime: number;
  score: number;
  result: 'pending' | 'win' | 'loss' | 'tie';
  coinsWon: number;
}
interface DoubleOrNothingState {
  active: boolean;
  lastWinAmount: number;
  timestamp: number;
}
interface DcState {
  coins: number;
  diceCollection: DiceCollection;
  lastRollResult: RollResult | null;
  rollHistory: RollResult[];
  activeGame: GameSession | null;
  yahtzeeState: YahtzeeState | null;
  pokerResult: PokerResult | null;
  duelResult: DuelResult | null;
  lucky7Result: Lucky7Result | null;
  challenges: ChallengeObjective[];
  betHistory: BetRecord[];
  doubleOrNothing: DoubleOrNothingState;
  achievements: Achievement[];
  daily: DailyState;
  stats: BoardStats;
  sessionStartTime: number;
}
interface UIField {
  label: string;
  value: string;
  color: string;
}
interface UICard {
  title: string;
  icon: string;
  fields: UIField[];
  color: string;
}
// ── Constants ────────────────────────────────────────────────────────────────
const MIN_BET = 10;
const MAX_BET = 500;
const STARTING_COINS = 1000;
const MAX_BET_HISTORY = 20;
const MAX_ROLL_HISTORY = 50;
const UPPER_BONUS_THRESHOLD = 63;
const UPPER_BONUS_POINTS = 35;
const YAHTZEE_BONUS_POINTS = 100;
const LUCKY7_JACKPOT_MULTIPLIER = 7;
const LUCKY7_WIN_MULTIPLIER = 5;
const DAILY_CHALLENGE_POOL = [
  'Roll exactly 21 with 5 dice',
  'Get three-of-a-kind in one roll',
  'Roll a straight (1-2-3-4-5)',
  'Score 30+ in a single Lucky 7 session',
  'Win 3 Dice Duels in a row',
  'Roll all sixes with 5 dice',
  'Get a Full House in Dice Poker',
  'Accumulate 500 coins from bets',
];
const RARITY_COLORS: Record<DiceRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#34D399',
  rare: '#60A5FA',
  epic: '#A78BFA',
  legendary: '#FBBF24',
};
const RARITY_ORDER: Record<DiceRarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};
// ── 12 Dice Definitions ──────────────────────────────────────────────────────
const DICE_DEFINITIONS: readonly DieDefinition[] = [
  {
    id: 'fire', name: 'Fire Dice', description: 'Blazing hot dice that burn through luck',
    rarity: 'common', theme: 'flame', primaryColor: '#EF4444', secondaryColor: '#F97316',
    unlockCost: 0,
    faces: [
      { value: 1, label: 'Spark', effect: 'none', emoji: '🔥' },
      { value: 2, label: 'Ember', effect: 'none', emoji: '🔥' },
      { value: 3, label: 'Flame', effect: 'fire_blast', emoji: '🔥' },
      { value: 4, label: 'Blaze', effect: 'fire_blast', emoji: '🔥' },
      { value: 5, label: 'Inferno', effect: 'bonus_coins', emoji: '🔥' },
      { value: 6, label: 'Supernova', effect: 'mega_blast', emoji: '🔥' },
    ],
  },
  {
    id: 'ice', name: 'Ice Dice', description: 'Frost-cold dice that freeze your opponents',
    rarity: 'common', theme: 'frost', primaryColor: '#3B82F6', secondaryColor: '#93C5FD',
    unlockCost: 0,
    faces: [
      { value: 1, label: 'Frost', effect: 'none', emoji: '❄️' },
      { value: 2, label: 'Chill', effect: 'none', emoji: '❄️' },
      { value: 3, label: 'Freeze', effect: 'ice_shield', emoji: '❄️' },
      { value: 4, label: 'Glacier', effect: 'ice_shield', emoji: '❄️' },
      { value: 5, label: 'Blizzard', effect: 'shield', emoji: '❄️' },
      { value: 6, label: 'Absolute Zero', effect: 'double_roll', emoji: '❄️' },
    ],
  },
  {
    id: 'nature', name: 'Nature Dice', description: 'Living dice that grow with each roll',
    rarity: 'common', theme: 'leaf', primaryColor: '#22C55E', secondaryColor: '#86EFAC',
    unlockCost: 50,
    faces: [
      { value: 1, label: 'Seed', effect: 'none', emoji: '🌿' },
      { value: 2, label: 'Sprout', effect: 'none', emoji: '🌿' },
      { value: 3, label: 'Bloom', effect: 'nature_heal', emoji: '🌿' },
      { value: 4, label: 'Vine', effect: 'nature_heal', emoji: '🌿' },
      { value: 5, label: 'Ancient Tree', effect: 'bonus_coins', emoji: '🌿' },
      { value: 6, label: 'World Tree', effect: 'lucky_charm', emoji: '🌿' },
    ],
  },
  {
    id: 'storm', name: 'Storm Dice', description: 'Electric dice crackling with power',
    rarity: 'uncommon', theme: 'lightning', primaryColor: '#8B5CF6', secondaryColor: '#C4B5FD',
    unlockCost: 100,
    faces: [
      { value: 1, label: 'Static', effect: 'none', emoji: '⚡' },
      { value: 2, label: 'Spark Gap', effect: 'none', emoji: '⚡' },
      { value: 3, label: 'Thunder', effect: 'storm_strike', emoji: '⚡' },
      { value: 4, label: 'Lightning', effect: 'storm_strike', emoji: '⚡' },
      { value: 5, label: 'Thunderstorm', effect: 'double_roll', emoji: '⚡' },
      { value: 6, label: 'Tempest', effect: 'mega_blast', emoji: '⚡' },
    ],
  },
  {
    id: 'royal', name: 'Royal Dice', description: 'Golden dice worthy of a king',
    rarity: 'rare', theme: 'crown', primaryColor: '#EAB308', secondaryColor: '#FDE047',
    unlockCost: 200,
    faces: [
      { value: 1, label: 'Pawn', effect: 'none', emoji: '👑' },
      { value: 2, label: 'Knight', effect: 'none', emoji: '👑' },
      { value: 3, label: 'Bishop', effect: 'royal_boost', emoji: '👑' },
      { value: 4, label: 'Rook', effect: 'royal_boost', emoji: '👑' },
      { value: 5, label: 'Queen', effect: 'bonus_coins', emoji: '👑' },
      { value: 6, label: 'King', effect: 'lucky_charm', emoji: '👑' },
    ],
  },
  {
    id: 'shadow', name: 'Shadow Dice', description: 'Dark dice that curse your luck',
    rarity: 'rare', theme: 'skull', primaryColor: '#1F2937', secondaryColor: '#4B5563',
    unlockCost: 200,
    faces: [
      { value: 1, label: 'Wisp', effect: 'none', emoji: '💀' },
      { value: 2, label: 'Shade', effect: 'none', emoji: '💀' },
      { value: 3, label: 'Phantom', effect: 'shadow_curse', emoji: '💀' },
      { value: 4, label: 'Wraith', effect: 'shadow_curse', emoji: '💀' },
      { value: 5, label: 'Lich', effect: 'double_roll', emoji: '💀' },
      { value: 6, label: 'Death', effect: 'mega_blast', emoji: '💀' },
    ],
  },
  {
    id: 'crystal', name: 'Crystal Dice', description: 'Prismatic dice that refract probability',
    rarity: 'epic', theme: 'prism', primaryColor: '#EC4899', secondaryColor: '#F9A8D4',
    unlockCost: 400,
    faces: [
      { value: 1, label: 'Quartz', effect: 'none', emoji: '💎' },
      { value: 2, label: 'Topaz', effect: 'none', emoji: '💎' },
      { value: 3, label: 'Sapphire', effect: 'prism_refract', emoji: '💎' },
      { value: 4, label: 'Ruby', effect: 'prism_refract', emoji: '💎' },
      { value: 5, label: 'Diamond', effect: 'bonus_coins', emoji: '💎' },
      { value: 6, label: 'Eternity Gem', effect: 'lucky_charm', emoji: '💎' },
    ],
  },
  {
    id: 'lucky', name: 'Lucky Dice', description: 'Four-leaf clover dice of pure fortune',
    rarity: 'epic', theme: 'clover', primaryColor: '#10B981', secondaryColor: '#6EE7B7',
    unlockCost: 400,
    faces: [
      { value: 1, label: 'Penny', effect: 'none', emoji: '🍀' },
      { value: 2, label: 'Horseshoe', effect: 'none', emoji: '🍀' },
      { value: 3, label: 'Wishbone', effect: 'lucky_charm', emoji: '🍀' },
      { value: 4, label: 'Rainbow', effect: 'lucky_charm', emoji: '🍀' },
      { value: 5, label: 'Pot of Gold', effect: 'bonus_coins', emoji: '🍀' },
      { value: 6, label: 'Four-Leaf', effect: 'double_roll', emoji: '🍀' },
    ],
  },
  {
    id: 'ancient', name: 'Ancient Dice', description: 'Stone dice carved with forgotten runes',
    rarity: 'rare', theme: 'rune', primaryColor: '#A8A29E', secondaryColor: '#D6D3D1',
    unlockCost: 300,
    faces: [
      { value: 1, label: 'Dust', effect: 'none', emoji: '🪨' },
      { value: 2, label: 'Relic', effect: 'none', emoji: '🪨' },
      { value: 3, label: 'Glyph', effect: 'rune_power', emoji: '🪨' },
      { value: 4, label: 'Rune', effect: 'rune_power', emoji: '🪨' },
      { value: 5, label: 'Artifact', effect: 'shield', emoji: '🪨' },
      { value: 6, label: 'Ancient One', effect: 'mega_blast', emoji: '🪨' },
    ],
  },
  {
    id: 'neon', name: 'Neon Dice', description: 'Glowing cyberpunk dice from the grid',
    rarity: 'epic', theme: 'glow', primaryColor: '#F472B6', secondaryColor: '#FBCFE8',
    unlockCost: 500,
    faces: [
      { value: 1, label: 'Pixel', effect: 'none', emoji: '💜' },
      { value: 2, label: 'Glow', effect: 'none', emoji: '💜' },
      { value: 3, label: 'Flash', effect: 'neon_flash', emoji: '💜' },
      { value: 4, label: 'Pulse', effect: 'neon_flash', emoji: '💜' },
      { value: 5, label: 'Hyperdrive', effect: 'double_roll', emoji: '💜' },
      { value: 6, label: 'Overdrive', effect: 'bonus_coins', emoji: '💜' },
    ],
  },
  {
    id: 'ocean', name: 'Ocean Dice', description: 'Tidal dice that ride the waves of fate',
    rarity: 'uncommon', theme: 'wave', primaryColor: '#06B6D4', secondaryColor: '#67E8F9',
    unlockCost: 150,
    faces: [
      { value: 1, label: 'Drop', effect: 'none', emoji: '🌊' },
      { value: 2, label: 'Ripple', effect: 'none', emoji: '🌊' },
      { value: 3, label: 'Wave', effect: 'ocean_tide', emoji: '🌊' },
      { value: 4, label: 'Tide', effect: 'ocean_tide', emoji: '🌊' },
      { value: 5, label: 'Tsunami', effect: 'shield', emoji: '🌊' },
      { value: 6, label: 'Leviathan', effect: 'lucky_charm', emoji: '🌊' },
    ],
  },
  {
    id: 'cosmic', name: 'Cosmic Dice', description: 'Dice forged in the heart of a dying star',
    rarity: 'legendary', theme: 'stars', primaryColor: '#7C3AED', secondaryColor: '#A78BFA',
    unlockCost: 1000,
    faces: [
      { value: 1, label: 'Dust', effect: 'none', emoji: '🌌' },
      { value: 2, label: 'Nebula', effect: 'none', emoji: '🌌' },
      { value: 3, label: 'Star', effect: 'cosmic_warp', emoji: '🌌' },
      { value: 4, label: 'Pulsar', effect: 'cosmic_warp', emoji: '🌌' },
      { value: 5, label: 'Black Hole', effect: 'mega_blast', emoji: '🌌' },
      { value: 6, label: 'Supernova', effect: 'double_roll', emoji: '🌌' },
    ],
  },
];
// ── Game Definitions ─────────────────────────────────────────────────────────
const GAME_DEFINITIONS: readonly GameDefinition[] = [
  { id: 'word_yahtzee', name: 'Word Yahtzee', description: 'Roll 5 dice for word-themed combinations',
    icon: '🎲', minBet: 0, maxBet: 0, minPlayers: 1, maxPlayers: 1 },
  { id: 'dice_poker', name: 'Dice Poker', description: 'Roll 5 dice for poker hands and win coins',
    icon: '🃏', minBet: MIN_BET, maxBet: MAX_BET, minPlayers: 1, maxPlayers: 1 },
  { id: 'dice_duel', name: 'Dice Duel', description: 'Challenge the AI to a dice showdown',
    icon: '⚔️', minBet: MIN_BET, maxBet: MAX_BET, minPlayers: 2, maxPlayers: 2 },
  { id: 'dice_challenge', name: 'Dice Challenge', description: 'Complete specific roll objectives',
    icon: '🎯', minBet: 0, maxBet: 0, minPlayers: 1, maxPlayers: 1 },
  { id: 'lucky_7', name: 'Lucky 7', description: 'Roll two dice and hit 7 for the jackpot',
    icon: '🎰', minBet: MIN_BET, maxBet: MAX_BET, minPlayers: 1, maxPlayers: 1 },
];
// ── Yahtzee Category Metadata ────────────────────────────────────────────────
const YAHTZEE_CATEGORIES: { id: YahtzeeCategory; name: string; description: string }[] = [
  { id: 'ones', name: 'Ones', description: 'Sum of all ones' },
  { id: 'twos', name: 'Twos', description: 'Sum of all twos' },
  { id: 'threes', name: 'Threes', description: 'Sum of all threes' },
  { id: 'fours', name: 'Fours', description: 'Sum of all fours' },
  { id: 'fives', name: 'Fives', description: 'Sum of all fives' },
  { id: 'sixes', name: 'Sixes', description: 'Sum of all sixes' },
  { id: 'three_of_kind', name: 'Three of a Kind', description: 'At least 3 of the same number' },
  { id: 'four_of_kind', name: 'Four of a Kind', description: 'At least 4 of the same number' },
  { id: 'full_house', name: 'Full House', description: '3 of one + 2 of another (25 pts)' },
  { id: 'small_straight', name: 'Small Straight', description: '4 consecutive numbers (30 pts)' },
  { id: 'large_straight', name: 'Large Straight', description: '5 consecutive numbers (40 pts)' },
  { id: 'yahtzee', name: 'Yahtzee', description: 'All 5 dice the same (50 pts)' },
  { id: 'chance', name: 'Chance', description: 'Sum of all dice' },
];
// ── Challenge Objectives ─────────────────────────────────────────────────────
function createInitialChallenges(): ChallengeObjective[] {
  return [
    { id: 'ch_total_100', name: 'Century Roller', description: 'Roll dice 100 times total', target: 100, progress: 0, completed: false, reward: 200 },
    { id: 'ch_yahtzee_once', name: 'First Yahtzee!', description: 'Score a Yahtzee (5 of a kind)', target: 1, progress: 0, completed: false, reward: 500 },
    { id: 'ch_jackpot_3', name: 'Jackpot Hunter', description: 'Hit the Lucky 7 jackpot 3 times', target: 3, progress: 0, completed: false, reward: 300 },
    { id: 'ch_win_10_duels', name: 'Duel Champion', description: 'Win 10 Dice Duels', target: 10, progress: 0, completed: false, reward: 400 },
    { id: 'ch_collect_6', name: 'Collector', description: 'Collect 6 different dice', target: 6, progress: 0, completed: false, reward: 250 },
    { id: 'ch_coins_5000', name: 'Rich Roller', description: 'Accumulate 5000 total coins won', target: 5000, progress: 0, completed: false, reward: 1000 },
    { id: 'ch_straight', name: 'Straight Shooter', description: 'Roll a large straight in Yahtzee', target: 1, progress: 0, completed: false, reward: 350 },
    { id: 'ch_poker_flush', name: 'Poker Face', description: 'Win 5 Dice Poker games', target: 5, progress: 0, completed: false, reward: 300 },
    { id: 'ch_daily_7', name: 'Daily Devotee', description: 'Claim 7 daily rolls', target: 7, progress: 0, completed: false, reward: 500 },
    { id: 'ch_all_dice', name: 'Completionist', description: 'Collect all 12 dice', target: 12, progress: 0, completed: false, reward: 2000 },
  ];
}
// ── Achievement Definitions ──────────────────────────────────────────────────
const ACHIEVEMENT_DEFS: { id: string; name: string; desc: string; icon: string; target: number }[] = [
  { id: 'ach_first_roll', name: 'First Roll', desc: 'Roll dice for the first time', icon: '🎲', target: 1 },
  { id: 'ach_roller_500', name: 'Dedicated Roller', desc: 'Roll dice 500 times', icon: '🔥', target: 500 },
  { id: 'ach_yahtzee_master', name: 'Yahtzee Master', desc: 'Score 3 Yahtzees in one game', icon: '⭐', target: 3 },
  { id: 'ach_big_winner', name: 'Big Winner', desc: 'Win 1000+ coins in a single game', icon: '💰', target: 1000 },
  { id: 'ach_streak_5', name: 'Hot Streak', desc: 'Win 5 games in a row', icon: '📈', target: 5 },
  { id: 'ach_jackpot_5', name: 'Lucky Devil', desc: 'Hit 5 Lucky 7 jackpots', icon: '🎰', target: 5 },
  { id: 'ach_all_common', name: 'Common Ground', desc: 'Collect all common dice', icon: '⬜', target: 3 },
  { id: 'ach_perfect_score', name: 'Perfect Score', desc: 'Score 300+ in Word Yahtzee', icon: '🏆', target: 300 },
  { id: 'ach_duel_slayer', name: 'Duel Slayer', desc: 'Win 25 Dice Duels', icon: '⚔️', target: 25 },
  { id: 'ach_collector', name: 'Full Collection', desc: 'Collect all 12 dice', icon: '✨', target: 12 },
  { id: 'ach_coins_10k', name: 'Tycoon', desc: 'Have 10,000 coins at once', icon: '💎', target: 10000 },
  { id: 'ach_daily_30', name: 'Monthly Roller', desc: 'Maintain a 30-day daily streak', icon: '📅', target: 30 },
];
// ── Module-Level State (null-initialized for SSR) ────────────────────────────
let dcState: DcState | null = null;
// ── State Initialization ─────────────────────────────────────────────────────
function createDefaultState(): DcState {
  const emptyScorecard: YahtzeeScorecard = {
    ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
    three_of_kind: null, four_of_kind: null, full_house: null,
    small_straight: null, large_straight: null, yahtzee: null, chance: null,
  };
  return {
    coins: STARTING_COINS,
    diceCollection: { unlocked: ['fire' as DiceId, 'ice' as DiceId], unlockDates: { fire: 0, ice: 0, nature: 0, storm: 0, royal: 0, shadow: 0, crystal: 0, lucky: 0, ancient: 0, neon: 0, ocean: 0, cosmic: 0 } },
    lastRollResult: null,
    rollHistory: [],
    activeGame: null,
    yahtzeeState: null,
    pokerResult: null,
    duelResult: null,
    lucky7Result: null,
    challenges: createInitialChallenges(),
    betHistory: [],
    doubleOrNothing: { active: false, lastWinAmount: 0, timestamp: 0 },
    achievements: ACHIEVEMENT_DEFS.map(a => ({
      id: a.id, name: a.name, description: a.desc, icon: a.icon,
      unlocked: false, unlockedDate: null, progress: 0, target: a.target,
    })),
    daily: {
      lastClaimDate: '', streak: 0, bestStreak: 0, totalClaimed: 0,
      todayChallenge: '', todayChallengeProgress: 0, todayChallengeComplete: false,
    },
    stats: {
      totalRolls: 0, gamesPlayed: 0, gamesWon: 0, winRate: 0,
      totalCoinsWon: 0, totalCoinsLost: 0, netCoins: 0, jackpotCount: 0,
      bestScores: { word_yahtzee: 0, dice_poker: 0, dice_duel: 0, dice_challenge: 0, lucky_7: 0 },
      diceRollsByType: { fire: 0, ice: 0, nature: 0, storm: 0, royal: 0, shadow: 0, crystal: 0, lucky: 0, ancient: 0, neon: 0, ocean: 0, cosmic: 0 },
      longestWinStreak: 0, currentWinStreak: 0, totalPlayTimeMs: 0,
    },
    sessionStartTime: Date.now(),
  };
}
function ensureInit(): DcState {
  if (!dcState) {
    dcState = createDefaultState();
  }
  return dcState;
}
// ── Utility Functions ────────────────────────────────────────────────────────
function rollSingleDie(diceId: DiceId): DieFace {
  const def = DICE_DEFINITIONS.find(d => d.id === diceId);
  if (!def) {
    const fallback: DieFace = { value: 1, label: '?', effect: 'none', emoji: '❓' };
    return fallback;
  }
  const idx = Math.floor(Math.random() * 6);
  return def.faces[idx];
}
function rollMultipleDice(diceId: DiceId, count: number): RollResult {
  const def = DICE_DEFINITIONS.find(d => d.id === diceId);
  const faces: DieFace[] = [];
  const values: number[] = [];
  const effects: FaceEffect[] = [];
  let total = 0;
  let bonuses = 0;
  for (let i = 0; i < count; i++) {
    const face = rollSingleDie(diceId);
    faces.push(face);
    values.push(face.value);
    total += face.value;
    if (face.effect !== 'none') {
      effects.push(face.effect);
    }
    if (face.effect === 'bonus_coins') bonuses += 10;
    if (face.effect === 'mega_blast') bonuses += 25;
  }
  return {
    diceId,
    values,
    faces,
    total,
    timestamp: Date.now(),
    effects,
    bonuses,
  };
}
function tallyValues(dice: number[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const d of dice) {
    counts[d] = (counts[d] || 0) + 1;
  }
  return counts;
}
function getSortedUnique(dice: number[]): number[] {
  return Array.from(new Set(dice)).sort((a, b) => a - b);
}
function isSmallStraight(dice: number[]): boolean {
  const unique = getSortedUnique(dice);
  const str = unique.join('');
  return (
    str.includes('1234') ||
    str.includes('2345') ||
    str.includes('3456')
  );
}
function isLargeStraight(dice: number[]): boolean {
  const unique = getSortedUnique(dice);
  const str = unique.join('');
  return str === '12345' || str === '23456';
}
function computeYahtzeeScore(category: YahtzeeCategory, dice: number[]): number {
  const counts = tallyValues(dice);
  const total = dice.reduce((s, v) => s + v, 0);
  switch (category) {
    case 'ones': return (counts[1] || 0) * 1;
    case 'twos': return (counts[2] || 0) * 2;
    case 'threes': return (counts[3] || 0) * 3;
    case 'fours': return (counts[4] || 0) * 4;
    case 'fives': return (counts[5] || 0) * 5;
    case 'sixes': return (counts[6] || 0) * 6;
    case 'three_of_kind': {
      for (const c of Object.values(counts)) { if (c >= 3) return total; }
      return 0;
    }
    case 'four_of_kind': {
      for (const c of Object.values(counts)) { if (c >= 4) return total; }
      return 0;
    }
    case 'full_house': {
      const vals = Object.values(counts).sort();
      if (vals.length === 2 && vals[0] === 2 && vals[1] === 3) return 25;
      return 0;
    }
    case 'small_straight': return isSmallStraight(dice) ? 30 : 0;
    case 'large_straight': return isLargeStraight(dice) ? 40 : 0;
    case 'yahtzee': {
      if (Object.values(counts).some(c => c === 5)) return 50;
      return 0;
    }
    case 'chance': return total;
  }
}
function evaluatePokerHand(dice: number[]): PokerResult {
  const counts = tallyValues(dice);
  const sortedCounts = Object.entries(counts)
    .map(([v, c]) => ({ value: parseInt(v), count: c }))
    .sort((a, b) => b.count - a.count || b.value - a.value);
  const total = dice.reduce((s, v) => s + v, 0);
  let rank: PokerRankName;
  let rankValue: number;
  let description: string;
  let payout = 0;
  const maxCount = sortedCounts[0]?.count || 0;
  const uniqueCount = Object.keys(counts).length;
  const uniqueSorted = getSortedUnique(dice);
  if (maxCount === 5) {
    rank = 'yahtzee';
    rankValue = 100;
    description = 'Yahtzee! All five dice match!';
    payout = 50;
  } else if (maxCount === 4) {
    rank = 'four_of_kind';
    rankValue = 80;
    description = `Four of a Kind: four ${sortedCounts[0].value}s`;
    payout = 25;
  } else if (maxCount === 3 && sortedCounts[1]?.count === 2) {
    rank = 'full_house';
    rankValue = 60;
    description = `Full House: ${sortedCounts[0].value}s over ${sortedCounts[1].value}s`;
    payout = 15;
  } else if (isLargeStraight(dice)) {
    rank = 'large_straight' as PokerRankName;
    rankValue = 55;
    description = 'Large Straight: 5 consecutive values';
    payout = 12;
  } else if (isSmallStraight(dice)) {
    rank = 'small_straight' as PokerRankName;
    rankValue = 40;
    description = 'Small Straight: 4 consecutive values';
    payout = 8;
  } else if (maxCount === 3) {
    rank = 'three_of_kind';
    rankValue = 30;
    description = `Three of a Kind: three ${sortedCounts[0].value}s`;
    payout = 5;
  } else if (sortedCounts.filter(s => s.count === 2).length === 2) {
    rank = 'two_pair';
    rankValue = 20;
    description = `Two Pair: ${sortedCounts[0].value}s and ${sortedCounts[1].value}s`;
    payout = 3;
  } else if (maxCount === 2) {
    rank = 'one_pair';
    rankValue = 10;
    description = `One Pair: two ${sortedCounts[0].value}s`;
    payout = 1;
  } else {
    rank = 'high_card';
    rankValue = 1;
    description = `High Card: ${Math.max(...dice)}`;
    payout = 0;
  }
  return { hand: [...dice], rank, rankValue, description, payout };
}
function dateSeedString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function seededIndex(seed: string, length: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return Math.abs(h) % length;
}
function getDailyChallengeForToday(): string {
  const seed = dateSeedString();
  const idx = seededIndex(seed, DAILY_CHALLENGE_POOL.length);
  return DAILY_CHALLENGE_POOL[idx];
}
function recordBet(s: DcState, amount: number, game: GameId, won: boolean, payout: number, isDouble: boolean): void {
  s.betHistory.unshift({
    amount, game, won, payout, timestamp: Date.now(), isDoubleOrNothing: isDouble,
  });
  if (s.betHistory.length > MAX_BET_HISTORY) {
    s.betHistory = s.betHistory.slice(0, MAX_BET_HISTORY);
  }
}
function updateWinStreak(s: DcState, won: boolean): void {
  if (won) {
    s.stats.currentWinStreak += 1;
    if (s.stats.currentWinStreak > s.stats.longestWinStreak) {
      s.stats.longestWinStreak = s.stats.currentWinStreak;
    }
  } else {
    s.stats.currentWinStreak = 0;
  }
}
function updateChallengeProgress(s: DcState, challengeId: string, increment: number): void {
  const ch = s.challenges.find(c => c.id === challengeId);
  if (ch && !ch.completed) {
    ch.progress = Math.min(ch.progress + increment, ch.target);
    if (ch.progress >= ch.target) {
      ch.completed = true;
      s.coins += ch.reward;
      s.stats.totalCoinsWon += ch.reward;
    }
  }
}
// ── Exported Functions: State Management ─────────────────────────────────────
export function dcGetState(): DcState {
  return ensureInit();
}
export function dcResetState(): DcState {
  dcState = createDefaultState();
  return dcState;
}
// ── Exported Functions: Dice Collection ──────────────────────────────────────
export function dcGetDice(): DieDefinition[] {
  return [...DICE_DEFINITIONS];
}
function dcGetDiceById(id: DiceId): DieDefinition | null {
  return DICE_DEFINITIONS.find(d => d.id === id) ?? null;
}
export function dcGetCollectedDice(): DiceId[] {
  const s = ensureInit();
  return [...s.diceCollection.unlocked];
}
export function dcUnlockDice(id: DiceId): { success: boolean; message: string } {
  const s = ensureInit();
  const def = DICE_DEFINITIONS.find(d => d.id === id);
  if (!def) return { success: false, message: `Unknown dice: ${id}` };
  if (s.diceCollection.unlocked.includes(id)) {
    return { success: false, message: `${def.name} is already unlocked` };
  }
  if (s.coins < def.unlockCost) {
    return { success: false, message: `Need ${def.unlockCost} coins (have ${s.coins})` };
  }
  s.coins -= def.unlockCost;
  s.diceCollection.unlocked.push(id);
  s.diceCollection.unlockDates[id] = Date.now();
  const collected = s.diceCollection.unlocked.length;
  updateChallengeProgress(s, 'ch_collect_6', 1);
  updateChallengeProgress(s, 'ch_all_dice', 1);
  if (collected >= 3) {
    updateChallengeProgress(s, 'ach_all_common', 1);
  }
  return { success: true, message: `Unlocked ${def.name}! (${collected}/12 collected)` };
}
// ── Exported Functions: Rolling Dice ─────────────────────────────────────────
export function dcRollDice(diceId: DiceId, count: number): RollResult {
  const s = ensureInit();
  const result = rollMultipleDice(diceId, count);
  s.lastRollResult = result;
  s.rollHistory.unshift(result);
  if (s.rollHistory.length > MAX_ROLL_HISTORY) {
    s.rollHistory = s.rollHistory.slice(0, MAX_ROLL_HISTORY);
  }
  s.stats.totalRolls += count;
  s.stats.diceRollsByType[diceId] += count;
  if (result.bonuses > 0) {
    s.coins += result.bonuses;
    s.stats.totalCoinsWon += result.bonuses;
  }
  updateChallengeProgress(s, 'ch_total_100', count);
  if (s.stats.totalRolls >= 1) updateChallengeProgress(s, 'ach_first_roll', 1);
  if (s.stats.totalRolls >= 500) updateChallengeProgress(s, 'ach_roller_500', 1);
  return result;
}
export function dcRollAll(count: number): RollResult {
  const s = ensureInit();
  const randomId = s.diceCollection.unlocked[
    Math.floor(Math.random() * s.diceCollection.unlocked.length)
  ];
  return dcRollDice(randomId, count);
}
export function dcGetRollResult(): RollResult | null {
  return ensureInit().lastRollResult;
}
// ── Exported Functions: Games ────────────────────────────────────────────────
export function dcGetGames(): GameDefinition[] {
  return [...GAME_DEFINITIONS];
}
export function dcGetGame(id: GameId): GameDefinition | null {
  return GAME_DEFINITIONS.find(g => g.id === id) ?? null;
}
export function dcStartGame(gameId: GameId): GameSession {
  const s = ensureInit();
  const def = GAME_DEFINITIONS.find(g => g.id === gameId);
  const session: GameSession = {
    id: gameId,
    active: true,
    bet: 0,
    startTime: Date.now(),
    score: 0,
    result: 'pending',
    coinsWon: 0,
  };
  s.activeGame = session;
  s.stats.gamesPlayed += 1;
  if (gameId === 'word_yahtzee') {
    const emptyScorecard: YahtzeeScorecard = {
      ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
      three_of_kind: null, four_of_kind: null, full_house: null,
      small_straight: null, large_straight: null, yahtzee: null, chance: null,
    };
    s.yahtzeeState = {
      dice: [0, 0, 0, 0, 0],
      kept: [false, false, false, false, false],
      rerollsLeft: 2,
      rollCount: 0,
      scorecard: emptyScorecard,
      upperBonus: 0,
      yahtzeeBonusCount: 0,
      totalScore: 0,
      gameComplete: false,
      turnsPlayed: 0,
    };
  }
  return session;
}
// ── Exported Functions: Word Yahtzee ─────────────────────────────────────────
export function dcGetYahtzeeState(): YahtzeeState | null {
  return ensureInit().yahtzeeState;
}
function dcGetYahtzeeScorecard(): YahtzeeScorecard | null {
  return ensureInit().yahtzeeState?.scorecard ?? null;
}
export function dcRollForYahtzee(rerollCount?: number): { dice: number[]; rerollsLeft: number } {
  const s = ensureInit();
  if (!s.yahtzeeState || s.yahtzeeState.gameComplete) {
    dcStartGame('word_yahtzee');
  }
  const ys = s.yahtzeeState!;
  const rerolls = Math.min(rerollCount ?? 1, ys.rerollsLeft);
  ys.rerollsLeft -= rerolls;
  ys.rollCount += 1;
  s.stats.totalRolls += 5;
  for (let i = 0; i < 5; i++) {
    if (!ys.kept[i]) {
      ys.dice[i] = Math.floor(Math.random() * 6) + 1;
    }
  }
  return { dice: [...ys.dice], rerollsLeft: ys.rerollsLeft };
}
function dcGetRerollsLeft(): number {
  return ensureInit().yahtzeeState?.rerollsLeft ?? 0;
}
export function dcKeepDice(indices: number[]): boolean[] {
  const s = ensureInit();
  if (!s.yahtzeeState) return [false, false, false, false, false];
  s.yahtzeeState.kept = [false, false, false, false, false];
  for (const idx of indices) {
    if (idx >= 0 && idx < 5) {
      s.yahtzeeState.kept[idx] = true;
    }
  }
  return [...s.yahtzeeState.kept];
}
export function dcScoreYahtzee(category: YahtzeeCategory): {
  scored: boolean; points: number; totalScore: number; gameComplete: boolean; message: string;
} {
  const s = ensureInit();
  if (!s.yahtzeeState) return { scored: false, points: 0, totalScore: 0, gameComplete: false, message: 'No active Yahtzee game' };
  const ys = s.yahtzeeState;
  if (ys.scorecard[category] !== null) {
    return { scored: false, points: 0, totalScore: ys.totalScore, gameComplete: ys.gameComplete, message: `${category} already scored` };
  }
  const points = computeYahtzeeScore(category, ys.dice);
  ys.scorecard[category] = points;
  ys.totalScore += points;
  ys.turnsPlayed += 1;
  // Check for Yahtzee bonus
  if (category === 'yahtzee' && points === 50) {
    if (ys.yahtzeeBonusCount > 0) {
      const bonusPts = YAHTZEE_BONUS_POINTS;
      ys.totalScore += bonusPts;
      ys.yahtzeeBonusCount += 1;
      updateChallengeProgress(s, 'ch_yahtzee_once', 1);
      updateChallengeProgress(s, 'ach_yahtzee_master', 1);
    } else {
      ys.yahtzeeBonusCount = 1;
      updateChallengeProgress(s, 'ch_yahtzee_once', 1);
      updateChallengeProgress(s, 'ach_yahtzee_master', 1);
    }
  }
  // Check for large straight challenge
  if (category === 'large_straight' && points > 0) {
    updateChallengeProgress(s, 'ch_straight', 1);
  }
  // Compute upper section bonus
  const upperCategories: YahtzeeCategory[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
  let upperSum = 0;
  let upperAllScored = true;
  for (const uc of upperCategories) {
    if (ys.scorecard[uc] !== null) {
      upperSum += ys.scorecard[uc]!;
    } else {
      upperAllScored = false;
    }
  }
  if (upperAllScored && upperSum >= UPPER_BONUS_THRESHOLD && ys.upperBonus === 0) {
    ys.upperBonus = UPPER_BONUS_POINTS;
    ys.totalScore += UPPER_BONUS_POINTS;
  }
  // Reset for next turn
  ys.kept = [false, false, false, false, false];
  ys.rerollsLeft = 2;
  ys.rollCount = 0;
  // Check if game is complete
  const allScored = (Object.values(ys.scorecard) as (number | null)[]).every(v => v !== null);
  if (allScored) {
    ys.gameComplete = true;
    s.stats.bestScores.word_yahtzee = Math.max(s.stats.bestScores.word_yahtzee, ys.totalScore);
    s.stats.gamesWon += 1;
    updateWinStreak(s, true);
    if (ys.totalScore >= 300) {
      updateChallengeProgress(s, 'ach_perfect_score', 1);
    }
  }
  return {
    scored: true, points, totalScore: ys.totalScore, gameComplete: ys.gameComplete,
    message: `Scored ${points} points for ${category}`,
  };
}
// ── Exported Functions: Dice Poker ───────────────────────────────────────────
export function dcGetPokerHand(): PokerResult | null {
  return ensureInit().pokerResult;
}
function dcGetPokerRank(): string {
  return ensureInit().pokerResult?.rank ?? 'none';
}
export function dcPlayPoker(bet: number): PokerResult {
  const s = ensureInit();
  if (bet < MIN_BET) bet = MIN_BET;
  if (bet > MAX_BET) bet = MAX_BET;
  if (s.coins < bet) bet = s.coins;
  s.coins -= bet;
  s.stats.totalCoinsLost += bet;
  const dice = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
  s.stats.totalRolls += 5;
  const result = evaluatePokerHand(dice);
  s.pokerResult = result;
  const winnings = bet + Math.floor(bet * (result.payout / 10));
  if (winnings > bet) {
    s.coins += winnings;
    s.stats.totalCoinsWon += winnings;
    s.stats.gamesWon += 1;
    updateWinStreak(s, true);
    recordBet(s, bet, 'dice_poker', true, winnings, false);
    updateChallengeProgress(s, 'ch_poker_flush', 1);
  } else {
    updateWinStreak(s, false);
    recordBet(s, bet, 'dice_poker', false, 0, false);
  }
  if (s.activeGame && s.activeGame.id === 'dice_poker') {
    s.activeGame.bet = bet;
    s.activeGame.score = result.rankValue;
    s.activeGame.coinsWon = Math.max(0, winnings - bet);
    s.activeGame.result = winnings > bet ? 'win' : 'loss';
    s.activeGame.active = false;
  }
  s.stats.bestScores.dice_poker = Math.max(s.stats.bestScores.dice_poker, result.rankValue);
  return result;
}
// ── Exported Functions: Dice Duel ────────────────────────────────────────────
export function dcPlayDuel(bet: number): DuelResult {
  const s = ensureInit();
  if (bet < MIN_BET) bet = MIN_BET;
  if (bet > MAX_BET) bet = MAX_BET;
  if (s.coins < bet) bet = s.coins;
  s.coins -= bet;
  s.stats.totalCoinsLost += bet;
  s.stats.totalRolls += 6;
  const playerDice = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);
  const aiDice = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);
  const playerTotal = playerDice.reduce((a, b) => a + b, 0);
  const aiTotal = aiDice.reduce((a, b) => a + b, 0);
  let winner: 'player' | 'ai' | 'tie';
  let coinsWon = 0;
  if (playerTotal > aiTotal) {
    winner = 'player';
    coinsWon = bet * 2;
    s.coins += coinsWon;
    s.stats.totalCoinsWon += coinsWon;
    s.stats.gamesWon += 1;
    updateWinStreak(s, true);
    updateChallengeProgress(s, 'ch_win_10_duels', 1);
    updateChallengeProgress(s, 'ach_duel_slayer', 1);
    recordBet(s, bet, 'dice_duel', true, coinsWon, false);
  } else if (aiTotal > playerTotal) {
    winner = 'ai';
    coinsWon = 0;
    updateWinStreak(s, false);
    recordBet(s, bet, 'dice_duel', false, 0, false);
  } else {
    winner = 'tie';
    coinsWon = bet;
    s.coins += coinsWon;
    s.stats.totalCoinsWon += coinsWon;
    recordBet(s, bet, 'dice_duel', false, coinsWon, false);
  }
  const result: DuelResult = {
    playerDice, aiDice, playerTotal, aiTotal, winner, coinsWon, timestamp: Date.now(),
  };
  s.duelResult = result;
  if (s.activeGame && s.activeGame.id === 'dice_duel') {
    s.activeGame.bet = bet;
    s.activeGame.score = playerTotal;
    s.activeGame.coinsWon = coinsWon - bet;
    s.activeGame.result = winner === 'player' ? 'win' : winner === 'tie' ? 'tie' : 'loss';
    s.activeGame.active = false;
  }
  s.stats.bestScores.dice_duel = Math.max(s.stats.bestScores.dice_duel, playerTotal);
  return result;
}
function dcGetDuelResult(): DuelResult | null {
  return ensureInit().duelResult;
}
// ── Exported Functions: Dice Challenge ───────────────────────────────────────
export function dcPlayChallenge(objectiveId: string): {
  completed: boolean; progress: number; target: number; reward: number;
} {
  const s = ensureInit();
  const challenge = s.challenges.find(c => c.id === objectiveId);
  if (!challenge) {
    return { completed: false, progress: 0, target: 0, reward: 0 };
  }
  if (challenge.completed) {
    return { completed: true, progress: challenge.progress, target: challenge.target, reward: challenge.reward };
  }
  // Simulate a roll for the challenge
  s.stats.totalRolls += 5;
  const roll = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
  const rollResult = roll.reduce((a, b) => a + b, 0);
  const increment = Math.ceil(rollResult / 10);
  challenge.progress = Math.min(challenge.progress + increment, challenge.target);
  if (challenge.progress >= challenge.target) {
    challenge.completed = true;
    s.coins += challenge.reward;
    s.stats.totalCoinsWon += challenge.reward;
    s.stats.gamesWon += 1;
  }
  if (s.activeGame && s.activeGame.id === 'dice_challenge') {
    s.activeGame.score = rollResult;
    s.activeGame.result = challenge.completed ? 'win' : 'pending';
    if (challenge.completed) s.activeGame.active = false;
  }
  return { completed: challenge.completed, progress: challenge.progress, target: challenge.target, reward: challenge.reward };
}
export function dcGetChallengeProgress(): ChallengeObjective[] {
  return [...ensureInit().challenges];
}
// ── Exported Functions: Lucky 7 ──────────────────────────────────────────────
export function dcPlayLucky7(bet: number): Lucky7Result {
  const s = ensureInit();
  if (bet < MIN_BET) bet = MIN_BET;
  if (bet > MAX_BET) bet = MAX_BET;
  if (s.coins < bet) bet = s.coins;
  s.coins -= bet;
  s.stats.totalCoinsLost += bet;
  s.stats.totalRolls += 2;
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const total = d1 + d2;
  const isJackpot = total === 7;
  let coinsWon = 0;
  if (isJackpot) {
    coinsWon = bet * LUCKY7_JACKPOT_MULTIPLIER;
    s.stats.jackpotCount += 1;
    s.stats.gamesWon += 1;
    updateWinStreak(s, true);
    updateChallengeProgress(s, 'ch_jackpot_3', 1);
    updateChallengeProgress(s, 'ach_jackpot_5', 1);
  } else if (total >= 10) {
    coinsWon = Math.floor(bet * LUCKY7_WIN_MULTIPLIER / 2);
    s.stats.gamesWon += 1;
    updateWinStreak(s, true);
  } else {
    updateWinStreak(s, false);
  }
  s.coins += coinsWon;
  if (coinsWon > 0) s.stats.totalCoinsWon += coinsWon;
  const result: Lucky7Result = { dice: [d1, d2], total, isJackpot, coinsWon, timestamp: Date.now() };
  s.lucky7Result = result;
  s.doubleOrNothing = { active: coinsWon > bet, lastWinAmount: coinsWon - bet, timestamp: Date.now() };
  recordBet(s, bet, 'lucky_7', coinsWon > bet, coinsWon, false);
  if (s.activeGame && s.activeGame.id === 'lucky_7') {
    s.activeGame.bet = bet;
    s.activeGame.score = total;
    s.activeGame.coinsWon = Math.max(0, coinsWon - bet);
    s.activeGame.result = coinsWon > bet ? 'win' : 'loss';
    s.activeGame.active = false;
  }
  s.stats.bestScores.lucky_7 = Math.max(s.stats.bestScores.lucky_7, coinsWon);
  return result;
}
function dcGetLucky7Result(): Lucky7Result | null {
  return ensureInit().lucky7Result;
}
// ── Exported Functions: Betting & Coins ──────────────────────────────────────
export function dcGetCoins(): number {
  return ensureInit().coins;
}
export function dcAddCoins(amount: number): number {
  const s = ensureInit();
  const clamped = Math.max(0, amount);
  s.coins += clamped;
  s.stats.totalCoinsWon += clamped;
  if (s.coins >= 10000) updateChallengeProgress(s, 'ach_coins_10k', 1);
  return s.coins;
}
export function dcBetCoins(amount: number): { success: boolean; remaining: number; message: string } {
  const s = ensureInit();
  const clamped = Math.max(0, Math.min(amount, s.coins, MAX_BET));
  if (clamped < MIN_BET && amount > 0) {
    return { success: false, remaining: s.coins, message: `Minimum bet is ${MIN_BET} coins` };
  }
  if (clamped <= 0) {
    return { success: false, remaining: s.coins, message: 'Invalid bet amount' };
  }
  s.coins -= clamped;
  return { success: true, remaining: s.coins, message: `Bet ${clamped} coins` };
}
export function dcDoubleOrNothing(): { success: boolean; won: boolean; amount: number; coins: number } {
  const s = ensureInit();
  if (!s.doubleOrNothing.active || s.doubleOrNothing.lastWinAmount <= 0) {
    return { success: false, won: false, amount: 0, coins: s.coins };
  }
  const riskAmount = s.doubleOrNothing.lastWinAmount;
  s.coins -= riskAmount;
  s.doubleOrNothing.active = false;
  const roll = Math.random();
  const won = roll < 0.5;
  if (won) {
    const prize = riskAmount * 2;
    s.coins += prize;
    s.stats.totalCoinsWon += prize;
    recordBet(s, riskAmount, s.activeGame?.id ?? 'dice_duel', true, prize, true);
    return { success: true, won: true, amount: prize, coins: s.coins };
  } else {
    s.stats.totalCoinsLost += riskAmount;
    recordBet(s, riskAmount, s.activeGame?.id ?? 'dice_duel', false, 0, true);
    return { success: true, won: false, amount: 0, coins: s.coins };
  }
}
// ── Exported Functions: Board & Stats ────────────────────────────────────────
export function dcGetBoard(): {
  coins: number; activeGame: GameSession | null; lastRoll: RollResult | null;
  diceCollected: number; diceTotal: number; winRate: number;
} {
  const s = ensureInit();
  return {
    coins: s.coins,
    activeGame: s.activeGame,
    lastRoll: s.lastRollResult,
    diceCollected: s.diceCollection.unlocked.length,
    diceTotal: DICE_DEFINITIONS.length,
    winRate: s.stats.gamesPlayed > 0 ? (s.stats.gamesWon / s.stats.gamesPlayed) * 100 : 0,
  };
}
export function dcGetStats(): BoardStats {
  const s = ensureInit();
  return {
    ...s.stats,
    winRate: s.stats.gamesPlayed > 0 ? (s.stats.gamesWon / s.stats.gamesPlayed) * 100 : 0,
    netCoins: s.stats.totalCoinsWon - s.stats.totalCoinsLost,
  };
}
export function dcGetCoinHistory(): BetRecord[] {
  return [...ensureInit().betHistory];
}
function dcGetTotalRolls(): number {
  return ensureInit().stats.totalRolls;
}
function dcGetGamesPlayed(): number {
  return ensureInit().stats.gamesPlayed;
}
function dcGetWinRate(): number {
  const s = ensureInit();
  return s.stats.gamesPlayed > 0 ? (s.stats.gamesWon / s.stats.gamesPlayed) * 100 : 0;
}
function dcGetJackpotCount(): number {
  return ensureInit().stats.jackpotCount;
}
function dcGetBestScore(gameId: GameId): number {
  return ensureInit().stats.bestScores[gameId] ?? 0;
}
function dcGetCollectionProgress(): { collected: number; total: number; percentage: number } {
  const s = ensureInit();
  const collected = s.diceCollection.unlocked.length;
  return { collected, total: DICE_DEFINITIONS.length, percentage: (collected / DICE_DEFINITIONS.length) * 100 };
}
// ── Exported Functions: Daily Dice ───────────────────────────────────────────
export function dcGetDailyRoll(): {
  challenge: string; canClaim: boolean; streak: number; bonus: number;
} {
  const s = ensureInit();
  const today = dateSeedString();
  const canClaim = s.daily.lastClaimDate !== today;
  const challenge = getDailyChallengeForToday();
  const bonus = Math.min(100, 20 + s.daily.streak * 10);
  return { challenge, canClaim, streak: s.daily.streak, bonus };
}
export function dcClaimDailyRoll(): {
  claimed: boolean; bonusCoins: number; streak: number; challenge: string;
} {
  const s = ensureInit();
  const today = dateSeedString();
  if (s.daily.lastClaimDate === today) {
    return { claimed: false, bonusCoins: 0, streak: s.daily.streak, challenge: getDailyChallengeForToday() };
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (s.daily.lastClaimDate === yesterdayStr) {
    s.daily.streak += 1;
  } else if (s.daily.lastClaimDate !== today) {
    s.daily.streak = 1;
  }
  s.daily.lastClaimDate = today;
  s.daily.totalClaimed += 1;
  if (s.daily.streak > s.daily.bestStreak) {
    s.daily.bestStreak = s.daily.streak;
  }
  const bonusCoins = Math.min(100, 20 + s.daily.streak * 10);
  s.coins += bonusCoins;
  s.stats.totalCoinsWon += bonusCoins;
  s.daily.todayChallenge = getDailyChallengeForToday();
  s.daily.todayChallengeProgress = 0;
  s.daily.todayChallengeComplete = false;
  updateChallengeProgress(s, 'ch_daily_7', 1);
  if (s.daily.bestStreak >= 30) updateChallengeProgress(s, 'ach_daily_30', 1);
  return { claimed: true, bonusCoins, streak: s.daily.streak, challenge: s.daily.todayChallenge };
}
export function dcGetDailyStreak(): { current: number; best: number; totalClaimed: number } {
  const s = ensureInit();
  return { current: s.daily.streak, best: s.daily.bestStreak, totalClaimed: s.daily.totalClaimed };
}
// ── Exported Functions: Achievements ─────────────────────────────────────────
export function dcGetAchievements(): Achievement[] {
  return [...ensureInit().achievements];
}
export function dcCheckAchievements(): Achievement[] {
  const s = ensureInit();
  // Check first roll
  if (s.stats.totalRolls >= 1) {
    const a = s.achievements.find(x => x.id === 'ach_first_roll');
    if (a && !a.unlocked) { a.unlocked = true; a.unlockedDate = Date.now(); }
  }
  // Check roller 500
  if (s.stats.totalRolls >= 500) {
    const a = s.achievements.find(x => x.id === 'ach_roller_500');
    if (a && !a.unlocked) { a.unlocked = true; a.unlockedDate = Date.now(); }
  }
  // Check big winner
  if (s.stats.totalCoinsWon >= 1000) {
    const a = s.achievements.find(x => x.id === 'ach_big_winner');
    if (a && !a.unlocked) { a.unlocked = true; a.unlockedDate = Date.now(); }
  }
  // Check hot streak
  if (s.stats.currentWinStreak >= 5) {
    const a = s.achievements.find(x => x.id === 'ach_streak_5');
    if (a && !a.unlocked) { a.unlocked = true; a.unlockedDate = Date.now(); }
  }
  // Check lucky devil
  if (s.stats.jackpotCount >= 5) {
    const a = s.achievements.find(x => x.id === 'ach_jackpot_5');
    if (a && !a.unlocked) { a.unlocked = true; a.unlockedDate = Date.now(); }
  }
  // Check common ground
  const commonDice = s.diceCollection.unlocked.filter(id => {
    const def = DICE_DEFINITIONS.find(d => d.id === id);
    return def && def.rarity === 'common';
  });
  if (commonDice.length >= 3) {
    const a = s.achievements.find(x => x.id === 'ach_all_common');
    if (a && !a.unlocked) { a.unlocked = true; a.unlockedDate = Date.now(); }
  }
  // Check duel slayer
  const duelChallenge = s.challenges.find(c => c.id === 'ch_win_10_duels');
  if (duelChallenge && duelChallenge.progress >= 25) {
    const a = s.achievements.find(x => x.id === 'ach_duel_slayer');
    if (a && !a.unlocked) { a.unlocked = true; a.unlockedDate = Date.now(); }
  }
  // Check full collection
  if (s.diceCollection.unlocked.length >= 12) {
    const a = s.achievements.find(x => x.id === 'ach_collector');
    if (a && !a.unlocked) { a.unlocked = true; a.unlockedDate = Date.now(); }
  }
  // Check tycoon
  if (s.coins >= 10000) {
    const a = s.achievements.find(x => x.id === 'ach_coins_10k');
    if (a && !a.unlocked) { a.unlocked = true; a.unlockedDate = Date.now(); }
  }
  // Check monthly roller
  if (s.daily.bestStreak >= 30) {
    const a = s.achievements.find(x => x.id === 'ach_daily_30');
    if (a && !a.unlocked) { a.unlocked = true; a.unlockedDate = Date.now(); }
  }
  // Update progress on all achievements
  for (const a of s.achievements) {
    if (!a.unlocked) {
      switch (a.id) {
        case 'ach_first_roll': a.progress = Math.min(s.stats.totalRolls, 1); break;
        case 'ach_roller_500': a.progress = Math.min(s.stats.totalRolls, 500); break;
        case 'ach_yahtzee_master': a.progress = s.yahtzeeState?.yahtzeeBonusCount ?? 0; break;
        case 'ach_big_winner': a.progress = Math.min(s.stats.totalCoinsWon, 1000); break;
        case 'ach_streak_5': a.progress = Math.min(s.stats.currentWinStreak, 5); break;
        case 'ach_jackpot_5': a.progress = Math.min(s.stats.jackpotCount, 5); break;
        case 'ach_all_common': a.progress = commonDice.length; break;
        case 'ach_perfect_score': a.progress = Math.min(s.stats.bestScores.word_yahtzee, 300); break;
        case 'ach_duel_slayer': a.progress = Math.min(duelChallenge?.progress ?? 0, 25); break;
        case 'ach_collector': a.progress = s.diceCollection.unlocked.length; break;
        case 'ach_coins_10k': a.progress = Math.min(s.coins, 10000); break;
        case 'ach_daily_30': a.progress = Math.min(s.daily.bestStreak, 30); break;
      }
    }
  }
  return [...s.achievements];
}
// ── Exported Functions: Overview & Dashboard ─────────────────────────────────
export function dcGetDiceBoardOverview(): {
  title: string; totalDice: number; collectedDice: number; totalGames: number;
  totalRolls: number; coins: number; winRate: number; jackpotCount: number;
  topScore: number; activeGame: string | null;
} {
  const s = ensureInit();
  const topScore = Math.max(...Object.values(s.stats.bestScores));
  return {
    title: '🎲 Dice Board',
    totalDice: DICE_DEFINITIONS.length,
    collectedDice: s.diceCollection.unlocked.length,
    totalGames: s.stats.gamesPlayed,
    totalRolls: s.stats.totalRolls,
    coins: s.coins,
    winRate: s.stats.gamesPlayed > 0 ? Math.round((s.stats.gamesWon / s.stats.gamesPlayed) * 100) : 0,
    jackpotCount: s.stats.jackpotCount,
    topScore,
    activeGame: s.activeGame?.id ?? null,
  };
}
export function dcGetDiceBoardDashboard(): UICard[] {
  const s = ensureInit();
  const overview = dcGetDiceBoardOverview();
  const cards: UICard[] = [];
  // Stats card
  cards.push({
    title: 'Board Stats',
    icon: '📊',
    color: '#3B82F6',
    fields: [
      { label: 'Total Rolls', value: String(overview.totalRolls), color: '#93C5FD' },
      { label: 'Games Played', value: String(overview.totalGames), color: '#93C5FD' },
      { label: 'Win Rate', value: `${overview.winRate}%`, color: '#34D399' },
      { label: 'Jackpots', value: String(overview.jackpotCount), color: '#FBBF24' },
    ],
  });
  // Coins card
  cards.push({
    title: 'Coin Treasury',
    icon: '💰',
    color: '#EAB308',
    fields: [
      { label: 'Balance', value: String(s.coins), color: '#FDE047' },
      { label: 'Total Won', value: String(s.stats.totalCoinsWon), color: '#34D399' },
      { label: 'Total Bet', value: String(s.stats.totalCoinsLost), color: '#F87171' },
      { label: 'Net Profit', value: String(s.stats.totalCoinsWon - s.stats.totalCoinsLost), color: s.stats.totalCoinsWon >= s.stats.totalCoinsLost ? '#34D399' : '#F87171' },
    ],
  });
  // Collection card
  cards.push({
    title: 'Dice Collection',
    icon: '🎲',
    color: '#8B5CF6',
    fields: [
      { label: 'Collected', value: `${overview.collectedDice}/${overview.totalDice}`, color: '#C4B5FD' },
      { label: 'Rarest', value: getRarestDice(s), color: '#FBBF24' },
      { label: 'Progress', value: `${Math.round((overview.collectedDice / overview.totalDice) * 100)}%`, color: '#A78BFA' },
      { label: 'Next Unlock', value: getNextUnlockName(s), color: '#93C5FD' },
    ],
  });
  // Daily card
  const daily = dcGetDailyRoll();
  cards.push({
    title: 'Daily Dice',
    icon: '📅',
    color: '#10B981',
    fields: [
      { label: 'Streak', value: String(daily.streak), color: '#6EE7B7' },
      { label: 'Bonus', value: `${daily.bonus} coins`, color: '#FDE047' },
      { label: 'Can Claim', value: daily.canClaim ? 'Yes ✅' : 'No ❌', color: daily.canClaim ? '#34D399' : '#F87171' },
      { label: 'Challenge', value: daily.challenge, color: '#D1D5DB' },
    ],
  });
  // Best scores card
  cards.push({
    title: 'Best Scores',
    icon: '🏆',
    color: '#F97316',
    fields: [
      { label: 'Word Yahtzee', value: String(s.stats.bestScores.word_yahtzee), color: '#FDBA74' },
      { label: 'Dice Poker', value: String(s.stats.bestScores.dice_poker), color: '#FDBA74' },
      { label: 'Dice Duel', value: String(s.stats.bestScores.dice_duel), color: '#FDBA74' },
      { label: 'Lucky 7', value: String(s.stats.bestScores.lucky_7), color: '#FDBA74' },
    ],
  });
  return cards;
}
function getRarestDice(s: DcState): string {
  let bestRarity = -1;
  let bestName = 'None';
  for (const id of s.diceCollection.unlocked) {
    const def = DICE_DEFINITIONS.find(d => d.id === id);
    if (def && RARITY_ORDER[def.rarity] > bestRarity) {
      bestRarity = RARITY_ORDER[def.rarity];
      bestName = def.name;
    }
  }
  return bestName;
}
function getNextUnlockName(s: DcState): string {
  for (const def of DICE_DEFINITIONS) {
    if (!s.diceCollection.unlocked.includes(def.id)) {
      return `${def.name} (${def.unlockCost}💰)`;
    }
  }
  return 'All collected! 🎉';
}
// ── Exported Functions: UI Card Helpers ──────────────────────────────────────
export function dcGetDiceCard(id: DiceId): UICard | null {
  const def = DICE_DEFINITIONS.find(d => d.id === id);
  if (!def) return null;
  const s = ensureInit();
  const isUnlocked = s.diceCollection.unlocked.includes(id);
  const rollCount = s.stats.diceRollsByType[id] ?? 0;
  return {
    title: def.name,
    icon: def.faces[5].emoji,
    color: isUnlocked ? def.primaryColor : '#6B7280',
    fields: [
      { label: 'Rarity', value: def.rarity.charAt(0).toUpperCase() + def.rarity.slice(1), color: RARITY_COLORS[def.rarity] },
      { label: 'Theme', value: def.theme, color: def.secondaryColor },
      { label: 'Status', value: isUnlocked ? 'Unlocked ✅' : `Locked ( costs ${def.unlockCost}💰 )`, color: isUnlocked ? '#34D399' : '#F87171' },
      { label: 'Times Rolled', value: String(rollCount), color: '#93C5FD' },
      { label: 'Face 6 Effect', value: `${def.faces[5].label} (${def.faces[5].effect})`, color: '#FBBF24' },
      { label: 'Description', value: def.description, color: '#D1D5DB' },
    ],
  };
}
export function dcGetGameCard(id: GameId): UICard | null {
  const def = GAME_DEFINITIONS.find(g => g.id === id);
  if (!def) return null;
  const s = ensureInit();
  const bestScore = s.stats.bestScores[id] ?? 0;
  const isActive = s.activeGame?.id === id && s.activeGame.active;
  const fields: UIField[] = [
    { label: 'Description', value: def.description, color: '#D1D5DB' },
    { label: 'Best Score', value: String(bestScore), color: '#FBBF24' },
    { label: 'Status', value: isActive ? 'Playing... 🎮' : 'Available', color: isActive ? '#34D399' : '#9CA3AF' },
  ];
  if (def.minBet > 0) {
    fields.push({ label: 'Bet Range', value: `${def.minBet} - ${def.maxBet}💰`, color: '#FDE047' });
    fields.push({ label: 'Players', value: `${def.minPlayers}-${def.maxPlayers}`, color: '#93C5FD' });
  }
  return { title: def.name, icon: def.icon, color: '#3B82F6', fields };
}
export function dcGetRollCard(): UICard {
  const s = ensureInit();
  const last = s.lastRollResult;
  const fields: UIField[] = [];
  if (last) {
    fields.push({ label: 'Dice Used', value: last.diceId, color: RARITY_COLORS[DICE_DEFINITIONS.find(d => d.id === last.diceId)?.rarity ?? 'common'] });
    fields.push({ label: 'Values', value: last.values.join(', '), color: '#93C5FD' });
    fields.push({ label: 'Total', value: String(last.total), color: '#FBBF24' });
    fields.push({ label: 'Bonuses', value: `+${last.bonuses}💰`, color: last.bonuses > 0 ? '#34D399' : '#9CA3AF' });
    if (last.effects.length > 0) {
      fields.push({ label: 'Effects', value: last.effects.join(', '), color: '#A78BFA' });
    }
  } else {
    fields.push({ label: 'Status', value: 'No rolls yet', color: '#9CA3AF' });
  }
  return {
    title: 'Last Roll',
    icon: '🎲',
    color: '#8B5CF6',
    fields,
  };
}
