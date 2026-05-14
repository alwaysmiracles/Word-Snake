/**
 * reaper-gamble-wire.ts
 *
 * Reaper's Gamble (死神赌局) — A dark gambling / card-game engine where players
 * bet soul coins against the Grim Reaper across five game modes: Blackjack,
 * Poker, Roulette, Dice, and Soul Rummy.
 *
 * NO React imports in named exports — ONLY in the default export hook.
 * NO localStorage / window / document / setInterval / setTimeout.
 * All named exports use the `rx` prefix.
 * No named functions starting with "use".
 * Default export: `export default function useReaperGamble(initialState?)`
 * No `useMemo` in the hook — direct function calls only.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

/** The ten death-themed card suits. */
export type RxDeathSuit =
  | 'skull' | 'scythe' | 'hourglass' | 'coffin' | 'raven'
  | 'bone' | 'candle' | 'mirror' | 'rose' | 'crown';

/** Standard card ranks (A through K). */
export type RxCardRank =
  | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K';

/** A single card in the deck. */
export interface RxCard {
  readonly suit: RxDeathSuit;
  readonly rank: RxCardRank;
  readonly id: string;
}

/** Available game modes. */
export type RxGameMode = 'blackjack' | 'poker' | 'roulette' | 'dice' | 'rummy';

/** Player actions during betting. */
export type RxBetAction = 'ante' | 'raise' | 'allIn' | 'fold' | 'call' | 'check';

/** Poker hand rankings (death-themed names). */
export type RxHandRank =
  | 'high_card' | 'one_pair' | 'two_pair' | 'three_of_kind'
  | 'straight' | 'flush' | 'full_house' | 'four_of_kind'
  | 'straight_flush' | 'royal_flush';

/** Generic game phase across modes. */
export type RxGamePhase =
  | 'idle' | 'betting' | 'playing' | 'dealer_turn' | 'showdown'
  | 'result' | 'challenge' | 'finished';

/** Roulette bet types. */
export type RxRouletteBet =
  | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high'
  | 'dozen_1' | 'dozen_2' | 'dozen_3' | 'column_1' | 'column_2' | 'column_3'
  | 'single' | 'death_number';

/** Dice bet types. */
export type RxDiceBet =
  | 'over_seven' | 'under_seven' | 'exact_seven'
  | 'doubles' | 'snake_eyes' | 'boxcars'
  | 'total_2' | 'total_3' | 'total_4' | 'total_5'
  | 'total_6' | 'total_8' | 'total_9' | 'total_10' | 'total_11' | 'total_12';

/** Rummy meld classification. */
export type RxMeldType = 'set' | 'run' | 'soul_meld';

/** Achievement identifiers. */
export type RxAchievementId =
  | 'first_blood' | 'soul_hoarder' | 'lucky_devil'
  | 'deaths_door' | 'reapers_bane' | 'card_shark'
  | 'high_roller' | 'midnight_gambler' | 'fate_weaver'
  | 'diamond_soul' | 'undying_streak' | 'bone_collector'
  | 'crown_of_skulls' | 'hourglass_master' | 'final_hand';

/** Challenge tier for Reaper encounters. */
export type RxChallengeTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// ── Mode-specific sub-states ──────────────────────────────────────────────────

export interface RxBlackjackState {
  playerScore: number;
  dealerScore: number;
  playerDone: boolean;
  dealerDone: boolean;
  doubledDown: boolean;
  insuranceTaken: boolean;
}

export interface RxPokerState {
  holeCards: RxCard[];
  communityCards: RxCard[];
  bettingRound: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  pot: number;
  playerBet: number;
  dealerBet: number;
  folded: boolean;
}

export interface RxRouletteState {
  winningNumber: number | null;
  bets: { betType: RxRouletteBet; amount: number; target?: number }[];
  spinHistory: number[];
}

export interface RxDiceState {
  dice: [number, number];
  lastTotal: number | null;
  bets: { betType: RxDiceBet; amount: number }[];
  rollHistory: [number, number][];
}

export interface RxRummyState {
  playerHand: RxCard[];
  dealerHand: RxCard[];
  discardPile: RxCard[];
  drawnThisTurn: boolean;
  melds: { type: RxMeldType; cards: RxCard[] }[];
  dealerMelds: { type: RxMeldType; cards: RxCard[] }[];
  roundOver: boolean;
}

// ── Core state ───────────────────────────────────────────────────────────────

export interface RxGamblerStats {
  luck: number;
  fate: number;
  fateUsed: number;
}

export interface RxReaperChallenge {
  active: boolean;
  tier: RxChallengeTier;
  winsSinceLast: number;
  winsNeeded: number;
  reaperBonus: number;
  defeated: number;
}

export interface RxDailyBonusState {
  dayStreak: number;
  lastClaimDay: number;
  totalClaimed: number;
  bonusClaimed: boolean;
}

export interface RxAchievementRecord {
  id: RxAchievementId;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface RxStreakData {
  current: number;
  best: number;
  modeStreaks: Record<RxGameMode, number>;
}

export interface RxGameResult {
  mode: RxGameMode;
  won: boolean;
  payout: number;
  xpGained: number;
  timestamp: number;
}

export interface RxReaperGambleState {
  soulCoins: number;
  currentBet: number;
  ante: number;
  deck: RxCard[];
  playerHand: RxCard[];
  dealerHand: RxCard[];
  communityCards: RxCard[];
  gameMode: RxGameMode;
  phase: RxGamePhase;
  stats: RxGamblerStats;
  level: number;
  xp: number;
  totalXP: number;
  wins: number;
  losses: number;
  pushes: number;
  streak: RxStreakData;
  achievements: RxAchievementRecord[];
  reaperChallenge: RxReaperChallenge;
  dailyBonus: RxDailyBonusState;
  history: RxGameResult[];
  blackjack: RxBlackjackState;
  poker: RxPokerState;
  roulette: RxRouletteState;
  dice: RxDiceState;
  rummy: RxRummyState;
}

export interface RxPokerHandEval {
  rank: RxHandRank;
  score: number[];
  name: string;
}

export interface RxGameSummary {
  mode: RxGameMode;
  result: 'win' | 'loss' | 'push';
  coinsWon: number;
  coinsLost: number;
  netCoins: number;
  currentLevel: number;
  totalXP: number;
  achievementsUnlocked: RxAchievementId[];
  challengeTriggered: boolean;
  streakCount: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const rxSTARTING_COINS = 1000;
export const rxMIN_ANTE = 10;
export const rxMAX_BET = 50000;
export const rxBLACKJACK_PAYOUT = 1.5;
export const rxDEFAULT_LUCK = 10;
export const rxDEFAULT_FATE = 5;
export const rxMAX_FATE = 100;
export const rxMAX_LUCK = 100;
export const rxCHALLENGE_INTERVAL = 5;
export const rxMAX_LEVEL = 40;
export const rxMAX_HISTORY = 100;

/** Suit metadata: symbol, display name, color hex. */
export const rxSUIT_INFO: Record<RxDeathSuit, { symbol: string; name: string; color: string }> = {
  skull:     { symbol: 'S', name: 'Skull',     color: '#E2E8F0' },
  scythe:    { symbol: 'X', name: 'Scythe',    color: '#94A3B8' },
  hourglass: { symbol: 'H', name: 'Hourglass', color: '#F59E0B' },
  coffin:    { symbol: 'C', name: 'Coffin',    color: '#78350F' },
  raven:     { symbol: 'R', name: 'Raven',     color: '#1E293B' },
  bone:      { symbol: 'B', name: 'Bone',      color: '#D6D3D1' },
  candle:    { symbol: 'L', name: 'Candle',    color: '#F97316' },
  mirror:    { symbol: 'M', name: 'Mirror',    color: '#A78BFA' },
  rose:      { symbol: 'W', name: 'Rose',      color: '#E11D48' },
  crown:     { symbol: 'K', name: 'Crown',     color: '#EAB308' },
};

/** The four primary suits used in the standard 52-card deck. */
export const rxPRIMARY_SUITS: readonly RxDeathSuit[] = [
  'skull', 'scythe', 'hourglass', 'coffin',
];

/** Secondary suits for special cards and Soul Rummy. */
export const rxSECONDARY_SUITS: readonly RxDeathSuit[] = [
  'raven', 'bone', 'candle', 'mirror', 'rose', 'crown',
];

/** All ten suits. */
export const rxALL_SUITS: readonly RxDeathSuit[] = [
  ...rxPRIMARY_SUITS, ...rxSECONDARY_SUITS,
];

/** Standard 13 ranks. */
export const rxSTANDARD_RANKS: readonly RxCardRank[] = [
  'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K',
];

/** Death-themed face card display names. */
export const rxFACE_CARD_NAMES: Record<string, string> = {
  J: 'Wraith',
  Q: 'Banshee',
  K: 'Reaper',
};

/** Numeric value mapping for Blackjack. */
export const rxRANK_BLACKJACK_VALUE: Record<RxCardRank, number> = {
  A: 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, J: 10, Q: 10, K: 10,
};

/** Numeric rank index for poker evaluation (A-high = 12). */
export const rxRANK_INDEX: Record<RxCardRank, number> = {
  '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5,
  '8': 6, '9': 7, '10': 8, J: 9, Q: 10, K: 11, A: 12,
};

/** Death-themed names for poker hand ranks. */
export const rxHAND_RANK_NAMES: Record<RxHandRank, string> = {
  high_card:     'Flickering Candle',
  one_pair:      'Paired Shadows',
  two_pair:      'Twin Graves',
  three_of_kind: 'Triad of Souls',
  straight:      'Bone Line',
  flush:         'Blood Moon',
  full_house:    'Coffin Pair',
  four_of_kind:  'Four Skulls',
  straight_flush:'Scythe\'s Edge',
  royal_flush:   'Death\'s Throne',
};

/** Numeric priority for each hand rank (higher = better). */
export const rxHAND_RANK_VALUE: Record<RxHandRank, number> = {
  high_card: 0, one_pair: 1, two_pair: 2, three_of_kind: 3,
  straight: 4, flush: 5, full_house: 6, four_of_kind: 7,
  straight_flush: 8, royal_flush: 9,
};

/** Payout multipliers for poker hands (relative to bet). */
export const rxPOKER_PAYOUTS: Record<RxHandRank, number> = {
  high_card: 0, one_pair: 1, two_pair: 2, three_of_kind: 3,
  straight: 4, flush: 6, full_house: 9, four_of_kind: 25,
  straight_flush: 50, royal_flush: 100,
};

/** Roulette payout table. */
export const rxROULETTE_PAYOUTS: Record<RxRouletteBet, number> = {
  red: 1, black: 1, odd: 1, even: 1, low: 1, high: 1,
  dozen_1: 2, dozen_2: 2, dozen_3: 2,
  column_1: 2, column_2: 2, column_3: 2,
  single: 35, death_number: 50,
};

/** Dice payout table. */
export const rxDICE_PAYOUTS: Record<RxDiceBet, number> = {
  over_seven: 1, under_seven: 1, exact_seven: 4,
  doubles: 2, snake_eyes: 30, boxcars: 30,
  total_2: 30, total_3: 15, total_4: 10, total_5: 7,
  total_6: 5, total_8: 5, total_9: 7, total_10: 10,
  total_11: 15, total_12: 30,
};

/** XP required for each level (1-indexed). */
export const rxLEVEL_XP: readonly number[] = [
  0, 100, 220, 360, 520, 700, 910, 1140, 1400, 1700,
  2050, 2440, 2880, 3370, 3920, 4540, 5230, 6010, 6880, 7860,
  8960, 10200, 11590, 13150, 14890, 16830, 19000, 21420, 24120, 27140,
  30510, 34270, 38460, 43120, 48300, 54050, 60430, 67500, 75320, 83960,
];

/** Level title names. */
export const rxLEVEL_TITLES: readonly string[] = [
  '', 'Lost Soul', 'Lost Soul', 'Lost Soul', 'Lost Soul', 'Lost Soul',
  'Wandering Spirit', 'Wandering Spirit', 'Wandering Spirit',
  'Wandering Spirit', 'Wandering Spirit',
  'Shadow Gambler', 'Shadow Gambler', 'Shadow Gambler',
  'Shadow Gambler', 'Shadow Gambler',
  'Bone Dealer', 'Bone Dealer', 'Bone Dealer', 'Bone Dealer', 'Bone Dealer',
  'Soul Collector', 'Soul Collector', 'Soul Collector',
  'Soul Collector', 'Soul Collector',
  'Phantom Wagerer', 'Phantom Wagerer', 'Phantom Wagerer',
  'Phantom Wagerer', 'Phantom Wagerer',
  'Death\'s Apprentice', 'Death\'s Apprentice', 'Death\'s Apprentice',
  'Death\'s Apprentice',
  'Soul Baron', 'Soul Baron', 'Soul Baron',
  'The Reaper\'s Rival',
];

/** Streak bonus multipliers. */
export const rxSTREAK_MULTIPLIERS: readonly { threshold: number; multiplier: number }[] = [
  { threshold: 0, multiplier: 1.0 },
  { threshold: 3, multiplier: 1.2 },
  { threshold: 5, multiplier: 1.5 },
  { threshold: 7, multiplier: 1.8 },
  { threshold: 10, multiplier: 2.0 },
  { threshold: 15, multiplier: 2.5 },
  { threshold: 20, multiplier: 3.0 },
];

/** Daily bonus coin amounts by streak day. */
export const rxDAILY_BONUS_AMOUNTS: readonly number[] = [
  100, 120, 150, 180, 220, 270, 330, 400, 480, 580,
];

/** Challenge tier metadata. */
export const rxCHALLENGE_TIERS: readonly {
  tier: RxChallengeTier;
  title: string;
  multiplier: number;
  reward: number;
}[] = [
  { tier: 1, title: 'Apprentice Reaper',  multiplier: 1.5, reward: 500 },
  { tier: 2, title: 'Soul Collector',     multiplier: 2.0, reward: 800 },
  { tier: 3, title: 'Grave Warden',       multiplier: 2.5, reward: 1200 },
  { tier: 4, title: 'Phantom Lord',       multiplier: 3.0, reward: 1800 },
  { tier: 5, title: 'Death\'s Herald',    multiplier: 4.0, reward: 2500 },
  { tier: 6, title: 'Soul Harvester',     multiplier: 5.0, reward: 3500 },
  { tier: 7, title: 'Death\'s Champion',  multiplier: 7.0, reward: 5000 },
  { tier: 8, title: 'The Final Reaper',   multiplier: 10.0, reward: 10000 },
];

/** All 15 achievement definitions. */
export const rxACHIEVEMENT_DEFS: readonly {
  id: RxAchievementId;
  name: string;
  description: string;
  target: number;
}[] = [
  { id: 'first_blood',       name: 'First Blood',        description: 'Win your first game against the Reaper',        target: 1 },
  { id: 'soul_hoarder',      name: 'Soul Hoarder',       description: 'Accumulate 10,000 soul coins',                  target: 10000 },
  { id: 'lucky_devil',       name: 'Lucky Devil',        description: 'Win 5 games in a row',                          target: 5 },
  { id: 'deaths_door',       name: 'Death\'s Door',      description: 'Win a game with exactly 1 soul coin left',      target: 1 },
  { id: 'reapers_bane',      name: 'Reaper\'s Bane',     description: 'Defeat a Reaper challenge',                     target: 1 },
  { id: 'card_shark',        name: 'Card Shark',         description: 'Win 100 games total',                           target: 100 },
  { id: 'high_roller',       name: 'High Roller',        description: 'Place a bet of 1,000+ soul coins',              target: 1000 },
  { id: 'midnight_gambler',  name: 'Midnight Gambler',   description: 'Win in all 5 game modes',                       target: 5 },
  { id: 'fate_weaver',       name: 'Fate Weaver',        description: 'Use fate twist 10 times',                       target: 10 },
  { id: 'diamond_soul',      name: 'Diamond Soul',       description: 'Reach level 40',                                target: 40 },
  { id: 'undying_streak',    name: 'Undying Streak',     description: 'Win 10 games in a row',                         target: 10 },
  { id: 'bone_collector',    name: 'Bone Collector',     description: 'Win 50 games of Blackjack',                     target: 50 },
  { id: 'crown_of_skulls',   name: 'Crown of Skulls',    description: 'Win 50 games of Poker',                         target: 50 },
  { id: 'hourglass_master',  name: 'Hourglass Master',   description: 'Win 50 games of Roulette',                      target: 50 },
  { id: 'final_hand',        name: 'The Final Hand',     description: 'Win with 4 different suits in hand',            target: 4 },
];

/** Red roulette numbers. */
export const rxROULETTE_RED: readonly number[] = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

/** Game mode display names and icons. */
export const rxGAME_MODE_INFO: Record<RxGameMode, { name: string; icon: string; description: string }> = {
  blackjack: { name: 'Reaper Blackjack',  icon: '[BJ]', description: 'Beat the dealer without going over 21' },
  poker:     { name: 'Soul Poker',        icon: '[PK]', description: 'Texas Hold\'em with death cards' },
  roulette:  { name: 'Wheel of Fate',     icon: '[RL]', description: 'Spin the Reaper\'s wheel' },
  dice:      { name: 'Bone Dice',         icon: '[DC]', description: 'Roll the cursed dice' },
  rummy:     { name: 'Soul Rummy',        icon: '[RM]', description: 'Meld souls from the abyss' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: CARD & DECK UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/** Build a unique card ID from suit and rank. */
export function rxCardId(suit: RxDeathSuit, rank: RxCardRank): string {
  return `${suit}_${rank}`;
}

/** Get the display name for a card (death-themed face cards). */
export function rxGetCardName(card: RxCard): string {
  const faceName = rxFACE_CARD_NAMES[card.rank];
  const suitInfo = rxSUIT_INFO[card.suit];
  if (faceName) {
    return `${faceName} of ${suitInfo.name}`;
  }
  if (card.rank === 'A') return `Ace of ${suitInfo.name}`;
  return `${card.rank} of ${suitInfo.name}`;
}

/** Get a short label for a card (e.g., "Wraith S", "7 H"). */
export function rxGetCardLabel(card: RxCard): string {
  const faceName = rxFACE_CARD_NAMES[card.rank];
  const rank = faceName ? faceName.charAt(0) : card.rank;
  return `${rank}${rxSUIT_INFO[card.suit].symbol}`;
}

/** Get a flavour description for a card. */
export function rxGetCardDescription(card: RxCard): string {
  const suit = card.suit;
  const face = rxFACE_CARD_NAMES[card.rank];
  if (face) {
    switch (suit) {
      case 'skull':     return `A spectral ${face.toLowerCase()} woven from bone dust and whispers.`;
      case 'scythe':    return `A ${face.toLowerCase()} that reaps memories along with souls.`;
      case 'hourglass': return `A ${face.toLowerCase()} who sees time running out for all.`;
      case 'coffin':    return `A ${face.toLowerCase()} that emerged from the sealed crypt.`;
      default:          return `A ${face.toLowerCase()} of the ${rxSUIT_INFO[suit].name}.`;
    }
  }
  switch (suit) {
    case 'skull':     return `A skull-marked ${card.rank} that chills the hand.`;
    case 'scythe':    return `The ${card.rank} of scythes gleams with deadly intent.`;
    case 'hourglass': return `An hourglass card showing ${card.rank} grains of sand.`;
    case 'coffin':    return `A ${card.rank} carved into ancient coffin wood.`;
    case 'raven':     return `A raven carries the ${card.rank} of ill omen.`;
    case 'bone':      return `A ${card.rank} etched onto polished bone.`;
    case 'candle':    return `The ${card.rank} flickers in spectral flame.`;
    case 'mirror':    return `A mirror reflects the ${card.rank} in reversed form.`;
    case 'rose':      return `A withered rose bears the mark of ${card.rank}.`;
    case 'crown':     return `The ${card.rank} of a dead king's crown.`;
  }
}

/** Create the standard 52-card deck (4 suits x 13 ranks). */
export function rxCreateStandardDeck(): RxCard[] {
  const deck: RxCard[] = [];
  for (const suit of rxPRIMARY_SUITS) {
    for (const rank of rxSTANDARD_RANKS) {
      deck.push({ suit, rank, id: rxCardId(suit, rank) });
    }
  }
  return deck;
}

/** Create an expanded deck for Soul Rummy (10 suits x 6 ranks). */
export function rxCreateRummyDeck(): RxCard[] {
  const rummyRanks: RxCardRank[] = ['A', '2', '3', '4', '5', '6'];
  const deck: RxCard[] = [];
  for (const suit of rxALL_SUITS) {
    for (const rank of rummyRanks) {
      deck.push({ suit, rank, id: rxCardId(suit, rank) });
    }
  }
  return deck;
}

/** Fisher-Yates shuffle. */
export function rxShuffleDeck(deck: RxCard[]): RxCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }
  return shuffled;
}

/** Draw N cards from deck, returning [drawn, remaining]. */
export function rxDrawCards(deck: RxCard[], count: number): { drawn: RxCard[]; remaining: RxCard[] } {
  if (count <= 0) return { drawn: [], remaining: [...deck] };
  const remaining = [...deck];
  const drawn = remaining.splice(0, Math.min(count, remaining.length));
  return { drawn, remaining };
}

/** Draw a single card from deck. */
export function rxDrawSingleCard(deck: RxCard[]): { card: RxCard | null; remaining: RxCard[] } {
  if (deck.length === 0) return { card: null, remaining: [] };
  const remaining = [...deck];
  const card = remaining.shift()!;
  return { card, remaining };
}

/** Sort a hand of cards by rank then suit. */
export function rxSortHand(hand: RxCard[]): RxCard[] {
  return [...hand].sort((a, b) => {
    const ri = rxRANK_INDEX[a.rank] - rxRANK_INDEX[b.rank];
    if (ri !== 0) return ri;
    return rxALL_SUITS.indexOf(a.suit) - rxALL_SUITS.indexOf(b.suit);
  });
}

/** Count unique suits in a hand. */
export function rxCountSuits(hand: RxCard[]): number {
  return new Set(hand.map(c => c.suit)).size;
}

/** Count unique ranks in a hand. */
export function rxCountRanks(hand: RxCard[]): number {
  return new Set(hand.map(c => c.rank)).size;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: BLACKJACK ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Calculate the Blackjack score for a hand, accounting for Aces. */
export function rxBlackjackScore(hand: RxCard[]): number {
  let score = 0;
  let aces = 0;
  for (const card of hand) {
    score += rxRANK_BLACKJACK_VALUE[card.rank];
    if (card.rank === 'A') aces++;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

/** Check if a 2-card hand is a natural blackjack. */
export function rxIsBlackjack(hand: RxCard[]): boolean {
  return hand.length === 2 && rxBlackjackScore(hand) === 21;
}

/** Check if a hand has busted (over 21). */
export function rxIsBust(hand: RxCard[]): boolean {
  return rxBlackjackScore(hand) > 21;
}

/** Determine if the dealer must hit (score < 17). */
export function rxDealerMustHit(hand: RxCard[]): boolean {
  return rxBlackjackScore(hand) < 17;
}

/** Evaluate the full outcome of a blackjack round. */
export function rxEvaluateBlackjack(
  playerHand: RxCard[],
  dealerHand: RxCard[],
  bet: number,
): { result: 'win' | 'loss' | 'push' | 'blackjack'; payout: number; description: string } {
  const ps = rxBlackjackScore(playerHand);
  const ds = rxBlackjackScore(dealerHand);
  const playerBJ = rxIsBlackjack(playerHand);
  const dealerBJ = rxIsBlackjack(dealerHand);
  const playerBust = ps > 21;
  const dealerBust = ds > 21;

  if (playerBJ && dealerBJ) {
    return { result: 'push', payout: bet, description: 'Both have Blackjack — a grim draw.' };
  }
  if (playerBJ) {
    const payout = Math.floor(bet + bet * rxBLACKJACK_PAYOUT);
    return { result: 'blackjack', payout, description: 'Blackjack! The Reaper trembles.' };
  }
  if (dealerBJ) {
    return { result: 'loss', payout: 0, description: 'Dealer has Blackjack. Death claims another.' };
  }
  if (playerBust) {
    return { result: 'loss', payout: 0, description: `Bust with ${ps}. Your soul crumbles.` };
  }
  if (dealerBust) {
    return { result: 'win', payout: bet * 2, description: `Dealer busts with ${ds}. You survive.` };
  }
  if (ps > ds) {
    return { result: 'win', payout: bet * 2, description: `${ps} beats ${ds}. The Reaper withdraws.` };
  }
  if (ds > ps) {
    return { result: 'loss', payout: 0, description: `${ds} beats ${ps}. Death smiles.` };
  }
  return { result: 'push', payout: bet, description: `Push at ${ps}. A fleeting reprieve.` };
}

/** Apply the luck modifier to potentially improve a drawn card. */
export function rxLuckyDraw(deck: RxCard[], luck: number): { card: RxCard; remaining: RxCard[] } {
  const modifier = (luck / rxMAX_LUCK) * 0.2;
  const roll = Math.random();
  if (roll < modifier && deck.length >= 2) {
    const first = rxDrawSingleCard(deck);
    const second = rxDrawSingleCard(first.remaining);
    const better = second.card ?? first.card!;
    const chosen = (second.card && rxRANK_INDEX[second.card.rank] > rxRANK_INDEX[first.card!.rank])
      ? second.card : first.card!;
    return { card: chosen, remaining: second.remaining.length > 0 ? second.remaining : first.remaining };
  }
  const { card, remaining } = rxDrawSingleCard(deck);
  return { card: card!, remaining };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: POKER ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Generate all combinations of `size` items from `arr`. */
export function rxCombinations<T>(arr: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (arr.length < size) return [];
  const [first, ...rest] = arr;
  const withFirst = rxCombinations(rest, size - 1).map(c => [first, ...c]);
  const withoutFirst = rxCombinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

/** Evaluate a 5-card poker hand. Returns rank and comparison score. */
export function rxEvaluatePokerHand(hand: RxCard[]): RxPokerHandEval {
  const sorted = [...hand].sort((a, b) => rxRANK_INDEX[b.rank] - rxRANK_INDEX[a.rank]);
  const ranks = sorted.map(c => rxRANK_INDEX[c.rank]);
  const suits = sorted.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);
  const uniqueRanks = Array.from(new Set(ranks)).sort((a, b) => b - a);
  let isStraight = false;
  let straightHigh = -1;

  if (uniqueRanks.length === 5) {
    if (uniqueRanks[0] - uniqueRanks[4] === 4) {
      isStraight = true;
      straightHigh = uniqueRanks[0];
    }
    // Ace-low straight (A-2-3-4-5)
    if (uniqueRanks[0] === 12 && uniqueRanks[1] === 3 && uniqueRanks[4] === 0) {
      isStraight = true;
      straightHigh = 3;
    }
  }

  const rankCounts: Record<number, number> = {};
  for (const r of ranks) {
    rankCounts[r] = (rankCounts[r] || 0) + 1;
  }
  const groups = Object.entries(rankCounts)
    .map(([rank, count]) => ({ rank: Number(rank), count }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);

  const isRoyalFlush = isFlush && isStraight && straightHigh === 12;
  if (isRoyalFlush) {
    return { rank: 'royal_flush', score: [9, 12], name: rxHAND_RANK_NAMES.royal_flush };
  }
  if (isFlush && isStraight) {
    return { rank: 'straight_flush', score: [8, straightHigh], name: rxHAND_RANK_NAMES.straight_flush };
  }
  if (groups[0].count === 4) {
    return { rank: 'four_of_kind', score: [7, groups[0].rank, groups[1].rank], name: rxHAND_RANK_NAMES.four_of_kind };
  }
  if (groups[0].count === 3 && groups[1].count === 2) {
    return { rank: 'full_house', score: [6, groups[0].rank, groups[1].rank], name: rxHAND_RANK_NAMES.full_house };
  }
  if (isFlush) {
    return { rank: 'flush', score: [5, ...ranks], name: rxHAND_RANK_NAMES.flush };
  }
  if (isStraight) {
    return { rank: 'straight', score: [4, straightHigh], name: rxHAND_RANK_NAMES.straight };
  }
  if (groups[0].count === 3) {
    const kickers = groups.slice(1).map(g => g.rank).sort((a, b) => b - a);
    return { rank: 'three_of_kind', score: [3, groups[0].rank, ...kickers], name: rxHAND_RANK_NAMES.three_of_kind };
  }
  if (groups[0].count === 2 && groups[1].count === 2) {
    const pairs = [groups[0].rank, groups[1].rank].sort((a, b) => b - a);
    const kicker = groups[2].rank;
    return { rank: 'two_pair', score: [2, ...pairs, kicker], name: rxHAND_RANK_NAMES.two_pair };
  }
  if (groups[0].count === 2) {
    const kickers = groups.slice(1).map(g => g.rank).sort((a, b) => b - a);
    return { rank: 'one_pair', score: [1, groups[0].rank, ...kickers], name: rxHAND_RANK_NAMES.one_pair };
  }
  return { rank: 'high_card', score: [0, ...ranks], name: rxHAND_RANK_NAMES.high_card };
}

/** Find the best 5-card poker hand from 5-7 cards. */
export function rxBestPokerHand(cards: RxCard[]): RxPokerHandEval {
  if (cards.length <= 5) return rxEvaluatePokerHand(cards);
  const combos = rxCombinations(cards, 5);
  let best: RxPokerHandEval | null = null;
  for (const combo of combos) {
    const eval_ = rxEvaluatePokerHand(combo);
    if (!best || rxBetterHand(eval_, best)) {
      best = eval_;
    }
  }
  return best!;
}

/** Compare two hand evaluations: returns true if `a` beats `b`. */
export function rxBetterHand(a: RxPokerHandEval, b: RxPokerHandEval): boolean {
  for (let i = 0; i < Math.max(a.score.length, b.score.length); i++) {
    const av = a.score[i] ?? 0;
    const bv = b.score[i] ?? 0;
    if (av !== bv) return av > bv;
  }
  return false;
}

/** Get the death-themed display name for a hand rank. */
export function rxGetHandName(rank: RxHandRank): string {
  return rxHAND_RANK_NAMES[rank];
}

/** Get the payout multiplier for a poker hand. */
export function rxGetPokerPayout(rank: RxHandRank): number {
  return rxPOKER_PAYOUTS[rank];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: ROULETTE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Spin the roulette wheel (0-36, plus 37 for the Death number). */
export function rxSpinRoulette(): number {
  return Math.floor(Math.random() * 38); // 0-37
}

/** Check if a roulette number is considered "red". */
export function rxIsRedNumber(num: number): boolean {
  return rxROULETTE_RED.includes(num);
}

/** Check if a roulette number is the special Death number (37). */
export function rxIsDeathNumber(num: number): boolean {
  return num === 37;
}

/** Check if a number is even (0 and Death excluded). */
export function rxIsEvenNumber(num: number): boolean {
  return num >= 1 && num <= 36 && num % 2 === 0;
}

/** Evaluate a roulette bet against the winning number. */
export function rxEvaluateRouletteBet(
  betType: RxRouletteBet,
  winningNumber: number,
  target?: number,
): { won: boolean; payout: number } {
  let won = false;
  switch (betType) {
    case 'red':
      won = rxIsRedNumber(winningNumber);
      break;
    case 'black':
      won = winningNumber >= 1 && winningNumber <= 36 && !rxIsRedNumber(winningNumber);
      break;
    case 'odd':
      won = winningNumber >= 1 && winningNumber <= 36 && winningNumber % 2 === 1;
      break;
    case 'even':
      won = rxIsEvenNumber(winningNumber);
      break;
    case 'low':
      won = winningNumber >= 1 && winningNumber <= 18;
      break;
    case 'high':
      won = winningNumber >= 19 && winningNumber <= 36;
      break;
    case 'dozen_1':
      won = winningNumber >= 1 && winningNumber <= 12;
      break;
    case 'dozen_2':
      won = winningNumber >= 13 && winningNumber <= 24;
      break;
    case 'dozen_3':
      won = winningNumber >= 25 && winningNumber <= 36;
      break;
    case 'column_1':
      won = winningNumber >= 1 && winningNumber <= 36 && winningNumber % 3 === 1;
      break;
    case 'column_2':
      won = winningNumber >= 1 && winningNumber <= 36 && winningNumber % 3 === 2;
      break;
    case 'column_3':
      won = winningNumber >= 1 && winningNumber <= 36 && winningNumber % 3 === 0;
      break;
    case 'single':
      won = winningNumber === (target ?? -1);
      break;
    case 'death_number':
      won = rxIsDeathNumber(winningNumber);
      break;
  }
  const payout = won ? rxROULETTE_PAYOUTS[betType] : 0;
  return { won, payout };
}

/** Get the payout multiplier for a roulette bet type. */
export function rxGetRoulettePayout(betType: RxRouletteBet): number {
  return rxROULETTE_PAYOUTS[betType];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: DICE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Roll two six-sided dice. */
export function rxRollDice(): [number, number] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

/** Get the total of two dice. */
export function rxDiceTotal(dice: [number, number]): number {
  return dice[0] + dice[1];
}

/** Check if two dice show the same value. */
export function rxIsDoubles(dice: [number, number]): boolean {
  return dice[0] === dice[1];
}

/** Evaluate a dice bet. */
export function rxEvaluateDiceBet(
  betType: RxDiceBet,
  dice: [number, number],
): { won: boolean; payout: number } {
  const total = rxDiceTotal(dice);
  const isDubs = rxIsDoubles(dice);
  let won = false;

  switch (betType) {
    case 'over_seven':
      won = total > 7;
      break;
    case 'under_seven':
      won = total < 7;
      break;
    case 'exact_seven':
      won = total === 7;
      break;
    case 'doubles':
      won = isDubs;
      break;
    case 'snake_eyes':
      won = dice[0] === 1 && dice[1] === 1;
      break;
    case 'boxcars':
      won = dice[0] === 6 && dice[1] === 6;
      break;
    case 'total_2': won = total === 2; break;
    case 'total_3': won = total === 3; break;
    case 'total_4': won = total === 4; break;
    case 'total_5': won = total === 5; break;
    case 'total_6': won = total === 6; break;
    case 'total_8': won = total === 8; break;
    case 'total_9': won = total === 9; break;
    case 'total_10': won = total === 10; break;
    case 'total_11': won = total === 11; break;
    case 'total_12': won = total === 12; break;
  }

  return { won, payout: won ? rxDICE_PAYOUTS[betType] : 0 };
}

/** Get the payout multiplier for a dice bet type. */
export function rxGetDicePayout(betType: RxDiceBet): number {
  return rxDICE_PAYOUTS[betType];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: SOUL RUMMY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Check if cards form a valid "set" (same rank, different suits). */
export function rxIsValidSet(cards: RxCard[]): boolean {
  if (cards.length < 3) return false;
  const firstRank = cards[0].rank;
  const suits = new Set(cards.map(c => c.suit));
  return cards.every(c => c.rank === firstRank) && suits.size === cards.length;
}

/** Check if cards form a valid "run" (same suit, consecutive ranks). */
export function rxIsValidRun(cards: RxCard[]): boolean {
  if (cards.length < 3) return false;
  const firstSuit = cards[0].suit;
  if (!cards.every(c => c.suit === firstSuit)) return false;
  const sorted = [...cards].sort((a, b) => rxRANK_INDEX[a.rank] - rxRANK_INDEX[b.rank]);
  for (let i = 1; i < sorted.length; i++) {
    if (rxRANK_INDEX[sorted[i].rank] !== rxRANK_INDEX[sorted[i - 1].rank] + 1) return false;
  }
  return true;
}

/** Check if cards form a soul meld (same rank, all 10 suits — special). */
export function rxIsValidSoulMeld(cards: RxCard[]): boolean {
  if (cards.length < 3) return false;
  const firstRank = cards[0].rank;
  const suits = new Set(cards.map(c => c.suit));
  return cards.every(c => c.rank === firstRank) && suits.size >= 3;
}

/** Classify a group of cards as a meld type, or null if invalid. */
export function rxClassifyMeld(cards: RxCard[]): RxMeldType | null {
  if (rxIsValidSet(cards)) return 'set';
  if (rxIsValidRun(cards)) return 'run';
  if (rxIsValidSoulMeld(cards)) return 'soul_meld';
  return null;
}

/** Calculate deadwood (unmelded card penalty) in a Rummy hand. */
export function rxCalculateDeadwood(hand: RxCard[], melds: RxCard[][]): number {
  const meldedIds = new Set(melds.flat().map(c => c.id));
  const deadwood = hand.filter(c => !meldedIds.has(c.id));
  return deadwood.reduce((sum, c) => {
    if (c.rank === 'A') return sum + 1;
    if (rxFACE_CARD_NAMES[c.rank]) return sum + 10;
    return sum + rxRANK_BLACKJACK_VALUE[c.rank];
  }, 0);
}

/** Score a completed Rummy round. Positive = player wins. */
export function rxScoreRummyRound(
  playerHand: RxCard[],
  dealerHand: RxCard[],
  playerMelds: RxCard[][],
  dealerMelds: RxCard[][],
): { playerScore: number; dealerScore: number; winner: 'player' | 'dealer' | 'push' } {
  const playerDead = rxCalculateDeadwood(playerHand, playerMelds);
  const dealerDead = rxCalculateDeadwood(dealerHand, dealerMelds);
  if (playerDead < dealerDead) {
    return { playerScore: dealerDead - playerDead, dealerScore: 0, winner: 'player' };
  }
  if (dealerDead < playerDead) {
    return { playerScore: 0, dealerScore: playerDead - dealerDead, winner: 'dealer' };
  }
  return { playerScore: 0, dealerScore: 0, winner: 'push' };
}

/** Auto-detect possible melds in a Rummy hand. */
export function rxFindPossibleMelds(hand: RxCard[]): RxCard[][] {
  const melds: RxCard[][] = [];
  const used = new Set<string>();

  // Check sets
  const rankGroups: Record<string, RxCard[]> = {};
  for (const card of hand) {
    if (!rankGroups[card.rank]) rankGroups[card.rank] = [];
    rankGroups[card.rank].push(card);
  }
  for (const group of Object.values(rankGroups)) {
    if (group.length >= 3) {
      const meld = group.slice(0, Math.min(group.length, 4));
      melds.push(meld);
      meld.forEach(c => used.add(c.id));
    }
  }

  // Check runs
  const suitGroups: Record<string, RxCard[]> = {};
  for (const card of hand) {
    if (used.has(card.id)) continue;
    if (!suitGroups[card.suit]) suitGroups[card.suit] = [];
    suitGroups[card.suit].push(card);
  }
  for (const group of Object.values(suitGroups)) {
    const sorted = group.sort((a, b) => rxRANK_INDEX[a.rank] - rxRANK_INDEX[b.rank]);
    let runStart = 0;
    for (let i = 1; i <= sorted.length; i++) {
      if (i < sorted.length && rxRANK_INDEX[sorted[i].rank] === rxRANK_INDEX[sorted[i - 1].rank] + 1) {
        continue;
      }
      if (i - runStart >= 3) {
        melds.push(sorted.slice(runStart, i));
      }
      runStart = i;
    }
  }

  return melds;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: BETTING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/** Check if the player can afford a given bet amount. */
export function rxCanAfford(coins: number, amount: number): boolean {
  return coins >= amount;
}

/** Clamp a bet to valid range. */
export function rxClampBet(amount: number, maxCoins: number): number {
  return Math.min(Math.max(amount, rxMIN_ANTE), Math.min(maxCoins, rxMAX_BET));
}

/** Calculate total payout including streak multiplier. */
export function rxCalculatePayout(basePayout: number, streakMultiplier: number): number {
  return Math.floor(basePayout * streakMultiplier);
}

/** Process an ante bet, returning updated coins. */
export function rxProcessAnte(coins: number, ante: number): { newCoins: number; actualAnte: number } {
  const actual = rxClampBet(ante, coins);
  return { newCoins: coins - actual, actualAnte: actual };
}

/** Process a raise bet. */
export function rxProcessRaise(coins: number, currentBet: number, raiseAmount: number): { newCoins: number; newBet: number } {
  const raise = rxClampBet(raiseAmount, coins);
  const newBet = currentBet + raise;
  return { newCoins: coins - raise, newBet };
}

/** Process an all-in bet. */
export function rxProcessAllIn(coins: number): { bet: number; newCoins: number } {
  return { bet: coins, newCoins: 0 };
}

/** Format soul coins for display. */
export function rxFormatCoins(amount: number): string {
  return amount.toLocaleString() + ' SC';
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: LEVEL & XP SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/** Get XP required to reach the next level from the current one. */
export function rxGetXPForLevel(level: number): number {
  if (level < 1 || level > rxLEVEL_XP.length) return 999999;
  return rxLEVEL_XP[level] ?? 999999;
}

/** Derive the player level from total XP. */
export function rxGetLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpRemaining = totalXP;
  while (level < rxMAX_LEVEL && xpRemaining >= rxGetXPForLevel(level + 1)) {
    level++;
    xpRemaining -= rxGetXPForLevel(level);
  }
  return level;
}

/** Add XP and return the new total and whether a level-up occurred. */
export function rxAddXP(currentXP: number, currentLevel: number, amount: number): {
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
} {
  let xp = currentXP + amount;
  const newLevel = rxGetLevelFromXP(xp);
  return { newXP: xp, newLevel, leveledUp: newLevel > currentLevel };
}

/** Get the title for a given level. */
export function rxGetLevelTitle(level: number): string {
  if (level < 1) return '';
  if (level >= rxLEVEL_TITLES.length) return rxLEVEL_TITLES[rxLEVEL_TITLES.length - 1];
  return rxLEVEL_TITLES[level];
}

/** Get progress toward the next level (0.0 to 1.0). */
export function rxGetLevelProgress(totalXP: number): number {
  const level = rxGetLevelFromXP(totalXP);
  if (level >= rxMAX_LEVEL) return 1.0;
  const currentLevelXP = rxLEVEL_XP.slice(0, level + 1).reduce((a, b) => a + b, 0);
  const nextLevelXP = currentLevelXP + (rxLEVEL_XP[level + 1] ?? 999999);
  const range = nextLevelXP - currentLevelXP;
  if (range <= 0) return 1.0;
  return Math.min(1.0, Math.max(0.0, (totalXP - currentLevelXP) / range));
}

/** XP reward for winning a game mode. */
export function rxGetModeXP(mode: RxGameMode): number {
  switch (mode) {
    case 'blackjack': return 15;
    case 'poker':     return 25;
    case 'roulette':  return 10;
    case 'dice':      return 12;
    case 'rummy':     return 20;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: ACHIEVEMENT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/** Create the initial (locked) achievement records. */
export function rxInitAchievements(): RxAchievementRecord[] {
  return rxACHIEVEMENT_DEFS.map(a => ({
    id: a.id,
    unlocked: false,
    progress: 0,
    target: a.target,
  }));
}

/** Get the list of all achievement definitions. */
export function rxGetAchievementDefs(): typeof rxACHIEVEMENT_DEFS {
  return [...rxACHIEVEMENT_DEFS];
}

/** Check if an achievement is unlocked. */
export function rxHasAchievement(achievements: RxAchievementRecord[], id: RxAchievementId): boolean {
  return achievements.some(a => a.id === id && a.unlocked);
}

/** Get unlocked achievement IDs. */
export function rxGetUnlockedAchievements(achievements: RxAchievementRecord[]): RxAchievementId[] {
  return achievements.filter(a => a.unlocked).map(a => a.id);
}

/** Increment progress on an achievement. Returns true if it just unlocked. */
export function rxAdvanceAchievement(
  achievements: RxAchievementRecord[],
  id: RxAchievementId,
  increment: number,
): { achievements: RxAchievementRecord[]; justUnlocked: boolean } {
  const updated = achievements.map(a => {
    if (a.id !== id || a.unlocked) return a;
    const newProgress = Math.min(a.progress + increment, a.target);
    return { ...a, progress: newProgress, unlocked: newProgress >= a.target };
  });
  const before = rxHasAchievement(achievements, id);
  const after = rxHasAchievement(updated, id);
  return { achievements: updated, justUnlocked: !before && after };
}

/** Batch-update achievements based on current state. Returns newly unlocked IDs. */
export function rxCheckAchievements(
  state: RxReaperGambleState,
): { achievements: RxAchievementRecord[]; newlyUnlocked: RxAchievementId[] } {
  let records = [...state.achievements];
  const newlyUnlocked: RxAchievementId[] = [];

  const tryAdvance = (id: RxAchievementId, value: number) => {
    const result = rxAdvanceAchievement(records, id, value);
    records = result.achievements;
    if (result.justUnlocked) newlyUnlocked.push(id);
  };

  // First Blood
  if (state.wins >= 1) tryAdvance('first_blood', state.wins);
  // Soul Hoarder
  tryAdvance('soul_hoarder', state.soulCoins);
  // Lucky Devil
  tryAdvance('lucky_devil', state.streak.current);
  // Undying Streak
  tryAdvance('undying_streak', state.streak.current);
  // Death's Door
  if (state.soulCoins === 1 && state.wins > 0) tryAdvance('deaths_door', 1);
  // Reaper's Bane
  tryAdvance('reapers_bane', state.reaperChallenge.defeated);
  // Card Shark
  tryAdvance('card_shark', state.wins);
  // High Roller
  tryAdvance('high_roller', state.currentBet);
  // Midnight Gambler
  const modesWon = new Set(state.history.filter(h => h.won).map(h => h.mode)).size;
  tryAdvance('midnight_gambler', modesWon);
  // Fate Weaver
  tryAdvance('fate_weaver', state.stats.fateUsed);
  // Diamond Soul
  tryAdvance('diamond_soul', state.level);
  // Bone Collector
  const bjWins = state.history.filter(h => h.won && h.mode === 'blackjack').length;
  tryAdvance('bone_collector', bjWins);
  // Crown of Skulls
  const pokerWins = state.history.filter(h => h.won && h.mode === 'poker').length;
  tryAdvance('crown_of_skulls', pokerWins);
  // Hourglass Master
  const rouletteWins = state.history.filter(h => h.won && h.mode === 'roulette').length;
  tryAdvance('hourglass_master', rouletteWins);
  // Final Hand
  const suitsInHand = rxCountSuits(state.playerHand);
  if (suitsInHand >= 4) tryAdvance('final_hand', suitsInHand);

  return { achievements: records, newlyUnlocked };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: STREAK SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/** Create a fresh streak data object. */
export function rxCreateStreakData(): RxStreakData {
  return {
    current: 0,
    best: 0,
    modeStreaks: {
      blackjack: 0, poker: 0, roulette: 0, dice: 0, rummy: 0,
    },
  };
}

/** Increment the win streak. */
export function rxIncrementStreak(streak: RxStreakData, mode: RxGameMode): RxStreakData {
  const newCurrent = streak.current + 1;
  const newBest = Math.max(streak.best, newCurrent);
  return {
    current: newCurrent,
    best: newBest,
    modeStreaks: {
      ...streak.modeStreaks,
      [mode]: streak.modeStreaks[mode] + 1,
    },
  };
}

/** Reset the win streak on a loss. */
export function rxResetStreak(streak: RxStreakData): RxStreakData {
  return {
    ...streak,
    current: 0,
    modeStreaks: {
      blackjack: 0, poker: 0, roulette: 0, dice: 0, rummy: 0,
    },
  };
}

/** Get the payout multiplier based on current streak. */
export function rxGetStreakMultiplier(streak: number): number {
  let multiplier = 1.0;
  for (const tier of rxSTREAK_MULTIPLIERS) {
    if (streak >= tier.threshold) multiplier = tier.multiplier;
  }
  return multiplier;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 13: REAPER CHALLENGE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/** Create a fresh Reaper challenge state. */
export function rxCreateChallengeState(): RxReaperChallenge {
  return {
    active: false,
    tier: 1,
    winsSinceLast: 0,
    winsNeeded: rxCHALLENGE_INTERVAL,
    reaperBonus: 0,
    defeated: 0,
  };
}

/** Check if a Reaper challenge should trigger after a win. */
export function rxShouldTriggerChallenge(challenge: RxReaperChallenge): boolean {
  return !challenge.active && challenge.winsSinceLast >= challenge.winsNeeded;
}

/** Activate the next Reaper challenge. */
export function rxActivateChallenge(challenge: RxReaperChallenge): RxReaperChallenge {
  const nextTier = Math.min(challenge.tier, rxCHALLENGE_TIERS.length) as RxChallengeTier;
  const tierInfo = rxCHALLENGE_TIERS[nextTier - 1];
  return {
    ...challenge,
    active: true,
    tier: nextTier,
    reaperBonus: tierInfo.multiplier,
    winsSinceLast: 0,
  };
}

/** Resolve a Reaper challenge: won or lost. */
export function rxResolveChallenge(
  challenge: RxReaperChallenge,
  won: boolean,
): RxReaperChallenge {
  if (won) {
    const tierInfo = rxCHALLENGE_TIERS[challenge.tier - 1];
    return {
      ...challenge,
      active: false,
      defeated: challenge.defeated + 1,
      winsSinceLast: 0,
      winsNeeded: rxCHALLENGE_INTERVAL,
      reaperBonus: 0,
    };
  }
  return {
    ...challenge,
    active: false,
    winsSinceLast: 0,
    winsNeeded: rxCHALLENGE_INTERVAL,
    reaperBonus: 0,
  };
}

/** Get the reward for defeating a challenge tier. */
export function rxGetChallengeReward(tier: RxChallengeTier): number {
  const idx = tier - 1;
  if (idx < 0 || idx >= rxCHALLENGE_TIERS.length) return 0;
  return rxCHALLENGE_TIERS[idx].reward;
}

/** Get the challenge tier title. */
export function rxGetChallengeTitle(tier: RxChallengeTier): string {
  const idx = tier - 1;
  if (idx < 0 || idx >= rxCHALLENGE_TIERS.length) return 'Unknown';
  return rxCHALLENGE_TIERS[idx].title;
}

/** Get the challenge tier multiplier. */
export function rxGetChallengeMultiplier(tier: RxChallengeTier): number {
  const idx = tier - 1;
  if (idx < 0 || idx >= rxCHALLENGE_TIERS.length) return 1;
  return rxCHALLENGE_TIERS[idx].multiplier;
}

/** Increment the win counter toward the next challenge. */
export function rxIncrementChallengeProgress(challenge: RxReaperChallenge): RxReaperChallenge {
  return {
    ...challenge,
    winsSinceLast: challenge.winsSinceLast + 1,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 14: FATE & LUCK SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/** Calculate the effective luck modifier (0.0 to 0.2). */
export function rxCalculateLuckModifier(luck: number): number {
  return (luck / rxMAX_LUCK) * 0.2;
}

/** Get the effective luck after challenge bonus. */
export function rxGetEffectiveLuck(luck: number, challengeBonus: number): number {
  return Math.min(rxMAX_LUCK, luck + Math.floor(challengeBonus * 2));
}

/** Spend fate points to perform a twist. Returns remaining fate or -1 if insufficient. */
export function rxFateTwist(
  fate: number,
  fateUsed: number,
  cost: number,
): { fateRemaining: number; fateUsedTotal: number; success: boolean } {
  const effectiveFate = fate + Math.floor(fateUsed * 0.1);
  if (effectiveFate < cost) {
    return { fateRemaining: fate, fateUsedTotal: fateUsed, success: false };
  }
  return {
    fateRemaining: Math.max(0, fate - cost),
    fateUsedTotal: fateUsed + 1,
    success: true,
  };
}

/** Regenerate fate (1 point per game played, up to MAX_FATE). */
export function rxRegenerateFate(fate: number): number {
  return Math.min(rxMAX_FATE, fate + 1);
}

/** Apply a fate twist to a card draw — swap the drawn card for a better one. */
export function rxApplyFateToDraw(
  deck: RxCard[],
  currentCard: RxCard,
): { newCard: RxCard; remaining: RxCard[] } {
  const remaining = deck.filter(c => c.id !== currentCard.id);
  if (remaining.length === 0) return { newCard: currentCard, remaining: deck };
  const better = remaining.filter(c => rxRANK_INDEX[c.rank] > rxRANK_INDEX[currentCard.rank]);
  if (better.length > 0) {
    const pick = better[Math.floor(Math.random() * better.length)];
    return { newCard: pick, remaining: remaining.filter(c => c.id !== pick.id) };
  }
  return { newCard: currentCard, remaining };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 15: DAILY BONUS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/** Create a fresh daily bonus state. */
export function rxCreateDailyBonusState(): RxDailyBonusState {
  return {
    dayStreak: 0,
    lastClaimDay: 0,
    totalClaimed: 0,
    bonusClaimed: false,
  };
}

/** Get the daily bonus amount based on streak day. */
export function rxGetDailyBonusAmount(streakDay: number): number {
  const idx = Math.min(streakDay - 1, rxDAILY_BONUS_AMOUNTS.length - 1);
  return rxDAILY_BONUS_AMOUNTS[Math.max(0, idx)];
}

/** Claim the daily bonus. */
export function rxClaimDailyBonus(
  daily: RxDailyBonusState,
  currentDay: number,
): { coins: number; newDaily: RxDailyBonusState; claimed: boolean } {
  if (daily.lastClaimDay === currentDay) {
    return { coins: 0, newDaily: daily, claimed: false };
  }
  const daysDiff = currentDay - daily.lastClaimDay;
  const newStreak = daysDiff === 1 ? daily.dayStreak + 1 : 1;
  const amount = rxGetDailyBonusAmount(newStreak);
  const newDaily: RxDailyBonusState = {
    dayStreak: newStreak,
    lastClaimDay: currentDay,
    totalClaimed: daily.totalClaimed + amount,
    bonusClaimed: true,
  };
  return { coins: amount, newDaily, claimed: true };
}

/** Check if the daily bonus is available today. */
export function rxIsDailyBonusAvailable(daily: RxDailyBonusState, currentDay: number): boolean {
  return daily.lastClaimDay !== currentDay;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 16: STATE MANAGEMENT — Pure Functions
// ═══════════════════════════════════════════════════════════════════════════════

/** Create the initial game state. */
export function rxCreateInitialState(): RxReaperGambleState {
  return {
    soulCoins: rxSTARTING_COINS,
    currentBet: 0,
    ante: rxMIN_ANTE,
    deck: [],
    playerHand: [],
    dealerHand: [],
    communityCards: [],
    gameMode: 'blackjack',
    phase: 'idle',
    stats: { luck: rxDEFAULT_LUCK, fate: rxDEFAULT_FATE, fateUsed: 0 },
    level: 1,
    xp: 0,
    totalXP: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    streak: rxCreateStreakData(),
    achievements: rxInitAchievements(),
    reaperChallenge: rxCreateChallengeState(),
    dailyBonus: rxCreateDailyBonusState(),
    history: [],
    blackjack: {
      playerScore: 0,
      dealerScore: 0,
      playerDone: false,
      dealerDone: false,
      doubledDown: false,
      insuranceTaken: false,
    },
    poker: {
      holeCards: [],
      communityCards: [],
      bettingRound: 'preflop',
      pot: 0,
      playerBet: 0,
      dealerBet: 0,
      folded: false,
    },
    roulette: {
      winningNumber: null,
      bets: [],
      spinHistory: [],
    },
    dice: {
      dice: [1, 1],
      lastTotal: null,
      bets: [],
      rollHistory: [],
    },
    rummy: {
      playerHand: [],
      dealerHand: [],
      discardPile: [],
      drawnThisTurn: false,
      melds: [],
      dealerMelds: [],
      roundOver: false,
    },
  };
}

/** Validate that a state object looks correct. */
export function rxValidateState(state: RxReaperGambleState): boolean {
  if (state.soulCoins < 0) return false;
  if (state.level < 1 || state.level > rxMAX_LEVEL) return false;
  if (state.currentBet < 0) return false;
  if (state.achievements.length !== rxACHIEVEMENT_DEFS.length) return false;
  return true;
}

/** Check if the game is over (player has no coins). */
export function rxIsGameOver(state: RxReaperGambleState): boolean {
  return state.soulCoins <= 0 && state.phase !== 'idle';
}

/** Process a win: add coins, XP, update streak, check achievements and challenges. */
export function rxProcessWin(
  state: RxReaperGambleState,
  payout: number,
): RxReaperGambleState {
  const streakMult = rxGetStreakMultiplier(state.streak.current + 1);
  const adjustedPayout = rxCalculatePayout(payout, streakMult);
  const xpGain = rxGetModeXP(state.gameMode);

  let newState = { ...state };
  newState.soulCoins += adjustedPayout;
  newState.wins += 1;

  // XP
  const xpResult = rxAddXP(newState.totalXP, newState.level, xpGain);
  newState.totalXP = xpResult.newXP;
  newState.xp = xpGain;
  newState.level = xpResult.newLevel;

  // Streak
  newState.streak = rxIncrementStreak(newState.streak, newState.gameMode);

  // Challenge progress
  newState.reaperChallenge = rxIncrementChallengeProgress(newState.reaperChallenge);

  // Fate regen
  newState.stats = { ...newState.stats, fate: rxRegenerateFate(newState.stats.fate) };

  // History
  const result: RxGameResult = {
    mode: newState.gameMode,
    won: true,
    payout: adjustedPayout,
    xpGained: xpGain,
    timestamp: Date.now(),
  };
  newState.history = [result, ...newState.history].slice(0, rxMAX_HISTORY);

  // Achievements
  const achResult = rxCheckAchievements(newState);
  newState.achievements = achResult.achievements;

  // Trigger challenge?
  if (rxShouldTriggerChallenge(newState.reaperChallenge)) {
    newState.reaperChallenge = rxActivateChallenge(newState.reaperChallenge);
    newState.phase = 'challenge';
  }

  return newState;
}

/** Process a loss: update streak and record. */
export function rxProcessLoss(state: RxReaperGambleState): RxReaperGambleState {
  let newState = { ...state };
  newState.losses += 1;
  newState.streak = rxResetStreak(newState.streak);

  // Small XP consolation
  const xpGain = Math.floor(rxGetModeXP(newState.gameMode) * 0.3);
  const xpResult = rxAddXP(newState.totalXP, newState.level, xpGain);
  newState.totalXP = xpResult.newXP;
  newState.xp = xpGain;
  newState.level = xpResult.newLevel;

  newState.stats = { ...newState.stats, fate: rxRegenerateFate(newState.stats.fate) };

  const result: RxGameResult = {
    mode: newState.gameMode,
    won: false,
    payout: 0,
    xpGained: xpGain,
    timestamp: Date.now(),
  };
  newState.history = [result, ...newState.history].slice(0, rxMAX_HISTORY);

  const achResult = rxCheckAchievements(newState);
  newState.achievements = achResult.achievements;

  if (newState.soulCoins <= 0) {
    newState.phase = 'finished';
  }

  return newState;
}

/** Process a push (tie). */
export function rxProcessPush(state: RxReaperGambleState, returnedBet: number): RxReaperGambleState {
  let newState = { ...state };
  newState.soulCoins += returnedBet;
  newState.pushes += 1;

  const result: RxGameResult = {
    mode: newState.gameMode,
    won: false,
    payout: returnedBet,
    xpGained: 2,
    timestamp: Date.now(),
  };
  newState.history = [result, ...newState.history].slice(0, rxMAX_HISTORY);

  const achResult = rxCheckAchievements(newState);
  newState.achievements = achResult.achievements;

  return newState;
}

/** Create a game summary for display. */
export function rxCreateGameSummary(
  state: RxReaperGambleState,
  result: 'win' | 'loss' | 'push',
  coinsWon: number,
  coinsLost: number,
): RxGameSummary {
  return {
    mode: state.gameMode,
    result,
    coinsWon,
    coinsLost,
    netCoins: coinsWon - coinsLost,
    currentLevel: state.level,
    totalXP: state.totalXP,
    achievementsUnlocked: rxGetUnlockedAchievements(state.achievements),
    challengeTriggered: state.reaperChallenge.active,
    streakCount: state.streak.current,
    timestamp: Date.now(),
  };
}

/** Get a quick stats display object. */
export function rxGetStatsDisplay(state: RxReaperGambleState): {
  winRate: number;
  totalGames: number;
  levelTitle: string;
  nextLevelProgress: number;
  streakMultiplier: number;
} {
  const total = state.wins + state.losses + state.pushes;
  return {
    winRate: total > 0 ? Math.round((state.wins / total) * 100) / 100 : 0,
    totalGames: total,
    levelTitle: rxGetLevelTitle(state.level),
    nextLevelProgress: rxGetLevelProgress(state.totalXP),
    streakMultiplier: rxGetStreakMultiplier(state.streak.current),
  };
}

/** Convert a card to a compact string representation. */
export function rxCardToString(card: RxCard): string {
  return `${card.rank}${rxSUIT_INFO[card.suit].symbol}`;
}

/** Convert a hand to a string of card labels. */
export function rxHandToString(hand: RxCard[]): string {
  return hand.map(rxCardToString).join(' ');
}

/** Get the win count for a specific game mode. */
export function rxGetModeWins(state: RxReaperGambleState, mode: RxGameMode): number {
  return state.history.filter(h => h.won && h.mode === mode).length;
}

/** Get the loss count for a specific game mode. */
export function rxGetModeLosses(state: RxReaperGambleState, mode: RxGameMode): number {
  return state.history.filter(h => !h.won && h.mode === mode).length;
}

/** Check if all modes have been played. */
export function rxAllModesPlayed(state: RxReaperGambleState): boolean {
  const modes = new Set(state.history.map(h => h.mode));
  return rxALL_SUITS.length > 0 && modes.size >= 5;
}

/** Reset the full game state. */
export function rxResetGame(): RxReaperGambleState {
  return rxCreateInitialState();
}

/** Partially update state with a deep merge. */
export function rxUpdateState(
  state: RxReaperGambleState,
  patch: Partial<RxReaperGambleState>,
): RxReaperGambleState {
  return { ...state, ...patch };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 17: GAME MODE STARTERS — Pure Transition Functions
// ═══════════════════════════════════════════════════════════════════════════════

/** Start a new Blackjack round. */
export function rxStartBlackjack(state: RxReaperGambleState, ante: number): RxReaperGambleState {
  const { newCoins, actualAnte } = rxProcessAnte(state.soulCoins, ante);
  const deck = rxShuffleDeck(rxCreateStandardDeck());
  const { drawn: p1, remaining: r1 } = rxDrawCards(deck, 2);
  const { drawn: d1, remaining: r2 } = rxDrawCards(r1, 2);
  return {
    ...state,
    soulCoins: newCoins,
    currentBet: actualAnte,
    ante: actualAnte,
    deck: r2,
    playerHand: p1,
    dealerHand: d1,
    communityCards: [],
    gameMode: 'blackjack',
    phase: 'playing',
    blackjack: {
      playerScore: rxBlackjackScore(p1),
      dealerScore: rxBlackjackScore(d1),
      playerDone: false,
      dealerDone: false,
      doubledDown: false,
      insuranceTaken: false,
    },
  };
}

/** Hit in Blackjack. */
export function rxBlackjackHit(state: RxReaperGambleState): RxReaperGambleState {
  const { card, remaining } = rxDrawSingleCard(state.deck);
  if (!card) return state;
  const newHand = [...state.playerHand, card];
  const score = rxBlackjackScore(newHand);
  const busted = score > 21;
  return {
    ...state,
    deck: remaining,
    playerHand: newHand,
    blackjack: {
      ...state.blackjack,
      playerScore: score,
      playerDone: busted,
    },
    phase: busted ? 'showdown' : 'playing',
  };
}

/** Stand in Blackjack (trigger dealer play and evaluate). */
export function rxBlackjackStand(state: RxReaperGambleState): RxReaperGambleState {
  let deck = [...state.deck];
  let dealerHand = [...state.dealerHand];
  while (rxDealerMustHit(dealerHand) && deck.length > 0) {
    const { card, remaining } = rxDrawSingleCard(deck);
    if (!card) break;
    dealerHand = [...dealerHand, card];
    deck = remaining;
  }
  const eval_ = rxEvaluateBlackjack(state.playerHand, dealerHand, state.currentBet);
  let newState: RxReaperGambleState = {
    ...state,
    deck,
    dealerHand,
    phase: 'result',
    blackjack: {
      ...state.blackjack,
      dealerScore: rxBlackjackScore(dealerHand),
      playerDone: true,
      dealerDone: true,
    },
  };
  if (eval_.result === 'win' || eval_.result === 'blackjack') {
    newState = rxProcessWin(newState, eval_.payout);
  } else if (eval_.result === 'loss') {
    newState = rxProcessLoss(newState);
  } else {
    newState = rxProcessPush(newState, eval_.payout);
  }
  return newState;
}

/** Double down in Blackjack. */
export function rxBlackjackDoubleDown(state: RxReaperGambleState): RxReaperGambleState {
  if (state.playerHand.length !== 2 || state.soulCoins < state.currentBet) return state;
  const { card, remaining } = rxDrawSingleCard(state.deck);
  if (!card) return state;
  const newHand = [...state.playerHand, card];
  const doubledBet = state.currentBet * 2;
  let newState: RxReaperGambleState = {
    ...state,
    soulCoins: state.soulCoins - state.currentBet,
    currentBet: doubledBet,
    deck: remaining,
    playerHand: newHand,
    blackjack: {
      ...state.blackjack,
      playerScore: rxBlackjackScore(newHand),
      playerDone: true,
      doubledDown: true,
    },
  };
  // Auto-stand after double down
  newState = rxBlackjackStand(newState);
  return newState;
}

/** Start a new Poker round. */
export function rxStartPoker(state: RxReaperGambleState, ante: number): RxReaperGambleState {
  const { newCoins, actualAnte } = rxProcessAnte(state.soulCoins, ante);
  const deck = rxShuffleDeck(rxCreateStandardDeck());
  const { drawn: p1, remaining: r1 } = rxDrawCards(deck, 2);
  const { drawn: d1, remaining: r2 } = rxDrawCards(r1, 2);
  return {
    ...state,
    soulCoins: newCoins,
    currentBet: actualAnte,
    ante: actualAnte,
    deck: r2,
    playerHand: p1,
    dealerHand: d1,
    communityCards: [],
    gameMode: 'poker',
    phase: 'playing',
    poker: {
      holeCards: p1,
      communityCards: [],
      bettingRound: 'preflop',
      pot: actualAnte * 2,
      playerBet: actualAnte,
      dealerBet: actualAnte,
      folded: false,
    },
  };
}

/** Deal the flop (3 community cards) in Poker. */
export function rxPokerFlop(state: RxReaperGambleState): RxReaperGambleState {
  const { drawn, remaining } = rxDrawCards(state.deck, 3);
  return {
    ...state,
    deck: remaining,
    communityCards: drawn,
    poker: {
      ...state.poker,
      communityCards: drawn,
      bettingRound: 'flop',
    },
  };
}

/** Deal the turn (1 community card) in Poker. */
export function rxPokerTurn(state: RxReaperGambleState): RxReaperGambleState {
  const { drawn, remaining } = rxDrawCards(state.deck, 1);
  const newCommunity = [...state.communityCards, ...drawn];
  return {
    ...state,
    deck: remaining,
    communityCards: newCommunity,
    poker: {
      ...state.poker,
      communityCards: newCommunity,
      bettingRound: 'turn',
    },
  };
}

/** Deal the river (1 community card) in Poker and evaluate. */
export function rxPokerRiver(state: RxReaperGambleState): RxReaperGambleState {
  const { drawn, remaining } = rxDrawCards(state.deck, 1);
  const newCommunity = [...state.communityCards, ...drawn];
  const allCards = [...state.poker.holeCards, ...newCommunity];
  const playerEval = rxBestPokerHand(allCards);
  // Dealer gets random evaluation for simplicity
  const dealerAllCards = [...state.dealerHand, ...newCommunity];
  const dealerEval = rxBestPokerHand(dealerAllCards);

  let newState: RxReaperGambleState = {
    ...state,
    deck: remaining,
    communityCards: newCommunity,
    gameMode: 'poker',
    phase: 'result',
    poker: {
      ...state.poker,
      communityCards: newCommunity,
      bettingRound: 'showdown',
    },
  };

  if (rxBetterHand(playerEval, dealerEval)) {
    const payout = state.poker.pot + Math.floor(state.poker.pot * rxGetPokerPayout(playerEval.rank) * 0.1);
    newState = rxProcessWin(newState, payout);
  } else if (rxBetterHand(dealerEval, playerEval)) {
    newState = rxProcessLoss(newState);
  } else {
    newState = rxProcessPush(newState, state.poker.playerBet);
  }

  return newState;
}

/** Fold in Poker. */
export function rxPokerFold(state: RxReaperGambleState): RxReaperGambleState {
  return rxProcessLoss({
    ...state,
    phase: 'result',
    poker: { ...state.poker, folded: true },
  });
}

/** Place a Roulette bet. */
export function rxPlaceRouletteBet(
  state: RxReaperGambleState,
  betType: RxRouletteBet,
  amount: number,
  target?: number,
): RxReaperGambleState {
  const clamped = rxClampBet(amount, state.soulCoins);
  if (clamped <= 0) return state;
  return {
    ...state,
    soulCoins: state.soulCoins - clamped,
    currentBet: state.currentBet + clamped,
    roulette: {
      ...state.roulette,
      bets: [...state.roulette.bets, { betType, amount: clamped, target }],
    },
    phase: 'betting',
    gameMode: 'roulette',
  };
}

/** Spin the roulette wheel and resolve all bets. */
export function rxSpinAndResolveRoulette(state: RxReaperGambleState): RxReaperGambleState {
  const winningNumber = rxSpinRoulette();
  let totalWin = 0;

  const resolvedBets = state.roulette.bets.map(bet => {
    const result = rxEvaluateRouletteBet(bet.betType, winningNumber, bet.target);
    if (result.won) {
      totalWin += bet.amount + Math.floor(bet.amount * result.payout);
    }
    return { ...bet, won: result.won, payout: result.payout };
  });

  let newState: RxReaperGambleState = {
    ...state,
    soulCoins: state.soulCoins + totalWin,
    phase: 'result',
    roulette: {
      winningNumber,
      bets: resolvedBets,
      spinHistory: [winningNumber, ...state.roulette.spinHistory].slice(0, 20),
    },
  };

  if (totalWin > 0) {
    newState = rxProcessWin(newState, totalWin);
  } else if (resolvedBets.length > 0) {
    newState = rxProcessLoss(newState);
  }

  return newState;
}

/** Place a Dice bet. */
export function rxPlaceDiceBet(
  state: RxReaperGambleState,
  betType: RxDiceBet,
  amount: number,
): RxReaperGambleState {
  const clamped = rxClampBet(amount, state.soulCoins);
  if (clamped <= 0) return state;
  return {
    ...state,
    soulCoins: state.soulCoins - clamped,
    currentBet: state.currentBet + clamped,
    dice: {
      ...state.dice,
      bets: [...state.dice.bets, { betType, amount: clamped }],
    },
    phase: 'betting',
    gameMode: 'dice',
  };
}

/** Roll the dice and resolve all bets. */
export function rxRollAndResolveDice(state: RxReaperGambleState): RxReaperGambleState {
  const dice = rxRollDice();
  const total = rxDiceTotal(dice);
  let totalWin = 0;

  const resolvedBets = state.dice.bets.map(bet => {
    const result = rxEvaluateDiceBet(bet.betType, dice);
    if (result.won) {
      totalWin += bet.amount + Math.floor(bet.amount * result.payout);
    }
    return { ...bet, won: result.won, payout: result.payout };
  });

  let newState: RxReaperGambleState = {
    ...state,
    soulCoins: state.soulCoins + totalWin,
    phase: 'result',
    dice: {
      dice,
      lastTotal: total,
      bets: resolvedBets,
      rollHistory: [dice, ...state.dice.rollHistory].slice(0, 20),
    },
  };

  if (totalWin > 0) {
    newState = rxProcessWin(newState, totalWin);
  } else if (resolvedBets.length > 0) {
    newState = rxProcessLoss(newState);
  }

  return newState;
}

/** Start a new Soul Rummy round. */
export function rxStartRummy(state: RxReaperGambleState, ante: number): RxReaperGambleState {
  const { newCoins, actualAnte } = rxProcessAnte(state.soulCoins, ante);
  const deck = rxShuffleDeck(rxCreateRummyDeck());
  const { drawn: p1, remaining: r1 } = rxDrawCards(deck, 10);
  const { drawn: d1, remaining: r2 } = rxDrawCards(r1, 10);
  const { card: discard, remaining: r3 } = rxDrawSingleCard(r2);
  return {
    ...state,
    soulCoins: newCoins,
    currentBet: actualAnte,
    ante: actualAnte,
    deck: r3,
    playerHand: rxSortHand(p1),
    dealerHand: d1,
    communityCards: [],
    gameMode: 'rummy',
    phase: 'playing',
    rummy: {
      playerHand: rxSortHand(p1),
      dealerHand: d1,
      discardPile: discard ? [discard] : [],
      drawnThisTurn: false,
      melds: [],
      dealerMelds: [],
      roundOver: false,
    },
  };
}

/** Draw a card in Rummy (from deck or discard pile). */
export function rxRummyDraw(
  state: RxReaperGambleState,
  fromDiscard: boolean,
): RxReaperGambleState {
  let card: RxCard | null = null;
  let remaining = [...state.deck];
  let discardPile = [...state.rummy.discardPile];

  if (fromDiscard && discardPile.length > 0) {
    card = discardPile.shift()!;
  } else if (!fromDiscard && remaining.length > 0) {
    const result = rxDrawSingleCard(remaining);
    card = result.card;
    remaining = result.remaining;
  }

  if (!card) return state;
  const newHand = rxSortHand([...state.rummy.playerHand, card]);
  return {
    ...state,
    deck: remaining,
    playerHand: newHand,
    rummy: {
      ...state.rummy,
      playerHand: newHand,
      discardPile,
      drawnThisTurn: true,
    },
  };
}

/** Discard a card in Rummy. */
export function rxRummyDiscard(state: RxReaperGambleState, cardId: string): RxReaperGambleState {
  const card = state.rummy.playerHand.find(c => c.id === cardId);
  if (!card || !state.rummy.drawnThisTurn) return state;
  const newHand = state.rummy.playerHand.filter(c => c.id !== cardId);
  return {
    ...state,
    playerHand: newHand,
    rummy: {
      ...state.rummy,
      playerHand: newHand,
      discardPile: [card, ...state.rummy.discardPile],
      drawnThisTurn: false,
    },
  };
}

/** Submit melds and end the Rummy round. */
export function rxRummySubmitMelds(state: RxReaperGambleState): RxReaperGambleState {
  const playerMelds = rxFindPossibleMelds(state.rummy.playerHand);
  const dealerMelds = rxFindPossibleMelds(state.rummy.dealerHand);
  const result = rxScoreRummyRound(
    state.rummy.playerHand,
    state.rummy.dealerHand,
    playerMelds,
    dealerMelds,
  );

  let newState: RxReaperGambleState = {
    ...state,
    phase: 'result',
    rummy: {
      ...state.rummy,
      melds: playerMelds.map(cards => ({ type: rxClassifyMeld(cards) ?? 'set', cards })),
      dealerMelds: dealerMelds.map(cards => ({ type: rxClassifyMeld(cards) ?? 'set', cards })),
      roundOver: true,
    },
  };

  if (result.winner === 'player') {
    const payout = state.currentBet * 2 + result.playerScore * 5;
    newState = rxProcessWin(newState, payout);
  } else if (result.winner === 'dealer') {
    newState = rxProcessLoss(newState);
  } else {
    newState = rxProcessPush(newState, state.currentBet);
  }

  return newState;
}

/** Return to idle phase (between rounds). */
export function rxReturnToIdle(state: RxReaperGambleState): RxReaperGambleState {
  return {
    ...state,
    phase: 'idle',
    currentBet: 0,
    playerHand: [],
    dealerHand: [],
    communityCards: [],
    blackjack: {
      playerScore: 0, dealerScore: 0,
      playerDone: false, dealerDone: false,
      doubledDown: false, insuranceTaken: false,
    },
    poker: {
      holeCards: [], communityCards: [],
      bettingRound: 'preflop', pot: 0,
      playerBet: 0, dealerBet: 0, folded: false,
    },
    roulette: { winningNumber: null, bets: [], spinHistory: state.roulette.spinHistory },
    dice: { dice: [1, 1], lastTotal: null, bets: [], rollHistory: state.dice.rollHistory },
    rummy: {
      playerHand: [], dealerHand: [], discardPile: [],
      drawnThisTurn: false, melds: [], dealerMelds: [], roundOver: false,
    },
  };
}

/** Claim daily bonus and update state. */
export function rxClaimDailyBonusState(
  state: RxReaperGambleState,
  currentDay: number,
): RxReaperGambleState {
  const result = rxClaimDailyBonus(state.dailyBonus, currentDay);
  if (!result.claimed) return state;
  return {
    ...state,
    soulCoins: state.soulCoins + result.coins,
    dailyBonus: result.newDaily,
  };
}

/** Use a fate twist to improve a card in hand. */
export function rxUseFateTwist(state: RxReaperGambleState, cardIndex: number): RxReaperGambleState {
  const card = state.playerHand[cardIndex];
  if (!card) return state;
  const twistResult = rxFateTwist(state.stats.fate, state.stats.fateUsed, 3);
  if (!twistResult.success) return state;

  const { newCard, remaining } = rxApplyFateToDraw(state.deck, card);
  const newHand = [...state.playerHand];
  newHand[cardIndex] = newCard;

  return {
    ...state,
    playerHand: newHand,
    deck: remaining,
    stats: {
      ...state.stats,
      fate: twistResult.fateRemaining,
      fateUsed: twistResult.fateUsedTotal,
    },
  };
}

/** Get the number of coins needed for a "bailout" (minimum to keep playing). */
export function rxGetBailoutCost(): number {
  return rxMIN_ANTE * 5;
}

/** Grant a bailout if the player is broke (Reaper's mercy). */
export function rxGrantBailout(state: RxReaperGambleState): RxReaperGambleState {
  if (state.soulCoins > 0) return state;
  const bailout = rxGetBailoutCost();
  return {
    ...state,
    soulCoins: bailout,
    phase: 'idle',
    streak: rxResetStreak(state.streak),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 18: DEFAULT EXPORT — useReaperGamble HOOK (React only here)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';

export default function useReaperGamble(
  initialState?: RxReaperGambleState,
) {
  const [state, setState] = useState<RxReaperGambleState>(
    initialState ?? rxCreateInitialState(),
  );

  // ── Generic actions ──────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    setState(rxCreateInitialState());
  }, []);

  const returnToIdle = useCallback(() => {
    setState(s => rxReturnToIdle(s));
  }, []);

  const claimDailyBonus = useCallback((currentDay: number) => {
    setState(s => rxClaimDailyBonusState(s, currentDay));
  }, []);

  const grantBailout = useCallback(() => {
    setState(s => rxGrantBailout(s));
  }, []);

  const useFateTwist = useCallback((cardIndex: number) => {
    setState(s => rxUseFateTwist(s, cardIndex));
  }, []);

  // ── Blackjack ────────────────────────────────────────────────────────────
  const startBlackjack = useCallback((ante: number) => {
    setState(s => rxStartBlackjack(s, ante));
  }, []);

  const blackjackHit = useCallback(() => {
    setState(s => rxBlackjackHit(s));
  }, []);

  const blackjackStand = useCallback(() => {
    setState(s => rxBlackjackStand(s));
  }, []);

  const blackjackDoubleDown = useCallback(() => {
    setState(s => rxBlackjackDoubleDown(s));
  }, []);

  // ── Poker ────────────────────────────────────────────────────────────────
  const startPoker = useCallback((ante: number) => {
    setState(s => rxStartPoker(s, ante));
  }, []);

  const pokerFlop = useCallback(() => {
    setState(s => rxPokerFlop(s));
  }, []);

  const pokerTurn = useCallback(() => {
    setState(s => rxPokerTurn(s));
  }, []);

  const pokerRiver = useCallback(() => {
    setState(s => rxPokerRiver(s));
  }, []);

  const pokerFold = useCallback(() => {
    setState(s => rxPokerFold(s));
  }, []);

  // ── Roulette ─────────────────────────────────────────────────────────────
  const placeRouletteBet = useCallback((
    betType: RxRouletteBet,
    amount: number,
    target?: number,
  ) => {
    setState(s => rxPlaceRouletteBet(s, betType, amount, target));
  }, []);

  const spinRoulette = useCallback(() => {
    setState(s => rxSpinAndResolveRoulette(s));
  }, []);

  // ── Dice ─────────────────────────────────────────────────────────────────
  const placeDiceBet = useCallback((betType: RxDiceBet, amount: number) => {
    setState(s => rxPlaceDiceBet(s, betType, amount));
  }, []);

  const rollDice = useCallback(() => {
    setState(s => rxRollAndResolveDice(s));
  }, []);

  // ── Soul Rummy ───────────────────────────────────────────────────────────
  const startRummy = useCallback((ante: number) => {
    setState(s => rxStartRummy(s, ante));
  }, []);

  const rummyDraw = useCallback((fromDiscard: boolean) => {
    setState(s => rxRummyDraw(s, fromDiscard));
  }, []);

  const rummyDiscard = useCallback((cardId: string) => {
    setState(s => rxRummyDiscard(s, cardId));
  }, []);

  const rummySubmitMelds = useCallback(() => {
    setState(s => rxRummySubmitMelds(s));
  }, []);

  return {
    state,
    // Generic
    resetGame,
    returnToIdle,
    claimDailyBonus,
    grantBailout,
    useFateTwist,
    // Blackjack
    startBlackjack,
    blackjackHit,
    blackjackStand,
    blackjackDoubleDown,
    // Poker
    startPoker,
    pokerFlop,
    pokerTurn,
    pokerRiver,
    pokerFold,
    // Roulette
    placeRouletteBet,
    spinRoulette,
    // Dice
    placeDiceBet,
    rollDice,
    // Rummy
    startRummy,
    rummyDraw,
    rummyDiscard,
    rummySubmitMelds,
  };
}
