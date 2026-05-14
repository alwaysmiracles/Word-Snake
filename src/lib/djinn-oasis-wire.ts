// ─────────────────────────────────────────────────────────────────────────────
// Djinn Oasis Wire — Desert genie wish-granting oasis management module
// SSR-safe · Seeded PRNG · React hooks · Word Snake game integration
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type DjinnElement =
  | 'fire'
  | 'water'
  | 'earth'
  | 'wind'
  | 'shadow'
  | 'light'
  | 'time'
  | 'storm';

export type DjinnRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type WishCategory =
  | 'wealth'
  | 'power'
  | 'knowledge'
  | 'love'
  | 'health'
  | 'adventure'
  | 'protection'
  | 'creativity'
  | 'fame'
  | 'longevity'
  | 'wisdom'
  | 'fortune'
  | 'harmony'
  | 'mystery'
  | 'transcendence';

export type ArtifactRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type QuestType = 'collect' | 'summon' | 'trade' | 'explore' | 'wish';

export interface DjinnDef {
  id: string;
  name: string;
  element: DjinnElement;
  basePower: number;
  abilities: string[];
  rarity: DjinnRarity;
  summonCost: number;
  description: string;
  lore: string;
}

export interface WishDef {
  id: string;
  name: string;
  category: WishCategory;
  coinCost: number;
  xpReward: number;
  coinReward: number;
  requiredElement: DjinnElement | 'any';
  cooldown: number;
  description: string;
  riskLevel: number;
}

export interface OasisZoneDef {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  xpMultiplier: number;
  coinMultiplier: number;
  wishDiscount: number;
  summonBonus: number;
  maxLevel: number;
  unlockLevel: number;
}

export interface ArtifactDef {
  id: string;
  name: string;
  rarity: ArtifactRarity;
  power: number;
  xpBonus: number;
  coinBonus: number;
  elementBoost: DjinnElement | 'all';
  description: string;
  lore: string;
}

export interface MerchantDef {
  id: string;
  name: string;
  specialty: string;
  discount: number;
  description: string;
  dialogue: string[];
  minLevel: number;
}

export interface PortalDef {
  id: string;
  destination: string;
  cost: number;
  minLevel: number;
  xpReward: number;
  coinReward: number;
  description: string;
  element: DjinnElement | 'none';
}

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  target: number;
  xpReward: number;
  coinReward: number;
  minLevel: number;
}

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  dialogues: string[];
  location: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  coinReward: number;
  iconHint: string;
}

export interface TitleThreshold {
  title: string;
  minLevel: number;
}

export interface OwnedDjinn {
  defId: string;
  nickname: string;
  level: number;
  xp: number;
  loyalty: number;
  bound: boolean;
}

export interface GrantedWish {
  defId: string;
  grantedAt: number;
  result: 'success' | 'partial' | 'twisted' | 'failed';
  coinsGained: number;
  xpGained: number;
}

export interface OwnedZone {
  defId: string;
  level: number;
  slots: number;
  activated: boolean;
}

export interface OwnedArtifact {
  defId: string;
  quantity: number;
  equipped: boolean;
}

export interface OpenedPortal {
  defId: string;
  visits: number;
  lastVisit: number;
  unlocked: boolean;
}

export interface ActiveQuest {
  defId: string;
  progress: number;
  accepted: boolean;
  completed: boolean;
  claimed: boolean;
}

export interface UnlockedAchievement {
  defId: string;
  unlockedAt: number;
}

export interface DailyTask {
  id: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  coinReward: number;
  claimed: boolean;
  date: number;
}

export interface DjinnOasisState {
  level: number;
  xp: number;
  coins: number;
  djinns: OwnedDjinn[];
  activeDjinn: string | null;
  oasisZones: OwnedZone[];
  artifacts: OwnedArtifact[];
  wishHistory: GrantedWish[];
  merchants: Record<string, number>;
  portals: OpenedPortal[];
  quests: ActiveQuest[];
  achievements: UnlockedAchievement[];
  streak: number;
  lastDaily: number | null;
  dailyTask: DailyTask | null;
  totalWishesGranted: number;
  totalDjinnsSummoned: number;
  totalPortalsOpened: number;
  totalTradesCompleted: number;
  totalArtifactsCollected: number;
  totalQuestsCompleted: number;
  totalCoinsEarned: number;
  seed: number;
}

export interface DjinnOasisReturn {
  state: DjinnOasisState;
  djGetState: () => DjinnOasisState;
  djResetState: () => void;
  djGetLevel: () => number;
  djGetXp: () => number;
  djGetTitle: () => string;
  djGetProgress: () => number;
  djGetProgressToNextLevel: () => { current: number; required: number; pct: number };
  djAddXP: (amount: number) => { leveledUp: boolean; newLevel: number; xpGained: number };
  djGetCoins: () => number;
  djAddCoins: (amount: number) => number;
  djSpendCoins: (amount: number) => boolean;
  djGetDjinns: () => OwnedDjinn[];
  djGetActiveDjinn: () => OwnedDjinn | null;
  djSetActiveDjinn: (ownedId: string) => boolean;
  djSummonDjinn: (defId: string, nickname?: string) => { success: boolean; djinn?: OwnedDjinn; reason?: string };
  djGetDjinnPower: (ownedId: string) => number;
  djGetDjinnByElement: (element: DjinnElement) => OwnedDjinn[];
  djGetWishes: () => WishDef[];
  djGrantWish: (defId: string) => { success: boolean; result?: GrantedWish; reason?: string };
  djGetWishHistory: () => GrantedWish[];
  djGetWishesByCategory: (category: WishCategory) => WishDef[];
  djCalculateWishCost: (defId: string) => number;
  djGetOasisZones: () => OwnedZone[];
  djUpgradeZone: (defId: string) => { success: boolean; newLevel?: number; reason?: string };
  djGetZoneBonus: (defId: string) => { xpMul: number; coinMul: number; wishDiscount: number; summonBonus: number };
  djIsZoneUnlocked: (defId: string) => boolean;
  djGetArtifacts: () => OwnedArtifact[];
  djCollectArtifact: (defId: string) => { success: boolean; isNew?: boolean; reason?: string };
  djEquipArtifact: (defId: string) => boolean;
  djGetArtifactBonus: () => { xpBonus: number; coinBonus: number; elementBoost: Record<string, number> };
  djGetPortals: () => PortalDef[];
  djOpenPortal: (defId: string) => { success: boolean; reward?: { xp: number; coins: number }; reason?: string };
  djGetUnlockedPortals: () => PortalDef[];
  djGetPortalCost: (defId: string) => number;
  djGetMerchants: () => MerchantDef[];
  djTrade: (merchantId: string, spendAmount: number) => { success: boolean; reward?: { item: string; coins: number }; reason?: string };
  djGetMerchantReputation: (merchantId: string) => number;
  djGetQuests: () => QuestDef[];
  djGetActiveQuests: () => ActiveQuest[];
  djAcceptQuest: (defId: string) => boolean;
  djCompleteQuest: (defId: string) => { success: boolean; reward?: { xp: number; coins: number }; reason?: string };
  djGetQuestProgress: (defId: string) => { progress: number; target: number };
  djGetAvailableQuests: () => QuestDef[];
  djGetAchievements: () => AchievementDef[];
  djCheckAchievements: () => UnlockedAchievement[];
  djGetUnlockedAchievements: () => UnlockedAchievement[];
  djIsAchievementUnlocked: (defId: string) => boolean;
  djGetDailyTask: () => DailyTask | null;
  djClaimDailyReward: () => { success: boolean; reward?: { xp: number; coins: number }; reason?: string };
  djUpdateDailyProgress: (amount: number) => number;
  djCheckStreak: () => { streak: number; isToday: boolean };
  djGetStreak: () => number;
  djGetTotalStats: () => Record<string, number>;
  djGetSummonCost: (defId: string) => number;
  djGetUpgradeCost: (defId: string, currentLevel: number) => number;
  djGetNpcs: () => NpcDef[];
  djTalkToNpc: (npcId: string) => string;
  djGetNpcDialogue: (npcId: string, index?: number) => string;
  djPerformRitual: () => { success: boolean; bonusXP: number; bonusCoins: number; messages: string[] };
  djGetRitualBonus: () => { xpMultiplier: number; coinMultiplier: number };
  djGetCompletionPercentage: () => number;
  djGetMultiplier: () => { xp: number; coins: number };
  djGetRecommendations: () => string[];
  djGetElementAffinity: () => Record<DjinnElement, number>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Seeded PRNG (mulberry32) — SSR-safe, no Math.random
// ═══════════════════════════════════════════════════════════════════════════════

function createPRNG(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function seededPick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function seededShuffle<T>(rng: () => number, arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper: XP table — level 1-45
// ═══════════════════════════════════════════════════════════════════════════════

function xpForLevel(level: number): number {
  if (level >= DJ_MAX_LEVEL) return Infinity;
  return Math.floor(80 * Math.pow(level, 1.45) + 20 * level);
}

function xpToLevel(totalXp: number): number {
  let lvl = 1;
  let accumulated = 0;
  while (lvl < DJ_MAX_LEVEL) {
    const needed = xpForLevel(lvl);
    if (accumulated + needed > totalXp) break;
    accumulated += needed;
    lvl++;
  }
  return lvl;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper: date hash for daily seed
// ═══════════════════════════════════════════════════════════════════════════════

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function isSameDay(ts1: number | null, ts2: number | null): boolean {
  if (ts1 === null || ts2 === null) return false;
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isYesterday(ts: number | null): boolean {
  if (ts === null) return false;
  const d = new Date(ts);
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper: find def by id
// ═══════════════════════════════════════════════════════════════════════════════

function findDef<T extends { id: string }>(defs: readonly T[], id: string): T | undefined {
  return defs.find(d => d.id === id);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS — 12 exported
// ═══════════════════════════════════════════════════════════════════════════════

export const DJ_MAX_LEVEL = 45;

export const DJ_TITLE_THRESHOLDS: TitleThreshold[] = [
  { title: 'Mortal', minLevel: 1 },
  { title: 'Wish Seeker', minLevel: 5 },
  { title: 'Sand Walker', minLevel: 10 },
  { title: 'Djinn Binder', minLevel: 15 },
  { title: 'Oasis Keeper', minLevel: 20 },
  { title: 'Desert Sultan', minLevel: 28 },
  { title: 'Eternal Vizier', minLevel: 36 },
  { title: 'Eternal Sultan', minLevel: 42 },
];

export const DJ_DJINNS: readonly DjinnDef[] = [
  {
    id: 'fire-ifrit',
    name: 'Fire Djinn',
    element: 'fire',
    basePower: 120,
    abilities: ['Flame Breath', 'Inferno Shield', 'Ember Dash'],
    rarity: 'common',
    summonCost: 100,
    description: 'A blazing spirit of elemental fire, born from the scorching heart of the desert.',
    lore: 'Ifrits were forged in the Great Conflagration, when the first sun kissed the endless dunes.',
  },
  {
    id: 'water-marid',
    name: 'Water Djinn',
    element: 'water',
    basePower: 130,
    abilities: ['Tidal Surge', 'Healing Mist', 'Aqua Veil'],
    rarity: 'common',
    summonCost: 110,
    description: 'A flowing spirit dwelling in the hidden oases beneath the sand.',
    lore: 'The Marid commands the aquifers that snake beneath the desert, giving life to all.',
  },
  {
    id: 'earth-golem',
    name: 'Earth Djinn',
    element: 'earth',
    basePower: 140,
    abilities: ['Stone Skin', 'Quake Slam', 'Sand Castle'],
    rarity: 'rare',
    summonCost: 200,
    description: 'An ancient spirit woven from petrified wood and desert stone.',
    lore: 'Earth Djinns predate all others, emerging when the world was still forming.',
  },
  {
    id: 'wind-zephyr',
    name: 'Wind Djinn',
    element: 'wind',
    basePower: 135,
    abilities: ['Gale Force', 'Dust Devil', 'Skywalk'],
    rarity: 'rare',
    summonCost: 220,
    description: 'A swift spirit that rides the sirocco winds across the dunes.',
    lore: 'The Zephyr whispers secrets carried from distant lands, never resting.',
  },
  {
    id: 'shadow-shade',
    name: 'Shadow Djinn',
    element: 'shadow',
    basePower: 160,
    abilities: ['Dark Pact', 'Phantom Step', 'Eclipse'],
    rarity: 'epic',
    summonCost: 500,
    description: 'A mysterious entity formed from the absence of light in deep canyon shadows.',
    lore: 'Shadow Djinns exist between moments, glimpsed only at twilight.',
  },
  {
    id: 'light-radiance',
    name: 'Light Djinn',
    element: 'light',
    basePower: 155,
    abilities: ['Divine Glow', 'Purify', 'Dawn\'s Edge'],
    rarity: 'epic',
    summonCost: 480,
    description: 'A luminous being crystallized from the first sunrise over the Great Dune Sea.',
    lore: 'Born when the primordial darkness first parted, Radiance carries the memory of the first light.',
  },
  {
    id: 'time-chronos',
    name: 'Time Djinn',
    element: 'time',
    basePower: 190,
    abilities: ['Temporal Loop', 'Age Rewind', 'Moment Steal'],
    rarity: 'legendary',
    summonCost: 1200,
    description: 'A timeless being that exists outside the flow of hours and days.',
    lore: 'Chronos was there at the beginning and will remain after the last grain falls.',
  },
  {
    id: 'storm-tempest',
    name: 'Storm Djinn',
    element: 'storm',
    basePower: 200,
    abilities: ['Lightning Strike', 'Thunder Call', 'Eye of Storm'],
    rarity: 'legendary',
    summonCost: 1500,
    description: 'The most powerful of all desert spirits, commanding the fury of the monsoon.',
    lore: 'When the Tempest speaks, even the oldest dunes tremble and reshape.',
  },
] as const;

export const DJ_RITUAL_CONFIG = {
  baseXP: 20,
  baseCoins: 15,
  levelXPPer: 3,
  levelCoinPer: 2,
  randomRangeXP: 30,
  randomRangeCoins: 25,
  loyaltyGainMin: 2,
  loyaltyGainMax: 5,
  artifactChance: 0.2,
  djinnXPBonusChance: 0.3,
  djinnXPMin: 5,
  djinnXPMax: 15,
  streakCooldownHours: 24,
} as const;

export const DJ_WISHES: readonly WishDef[] = [
  { id: 'wish-wealth-coins', name: 'Golden Rain', category: 'wealth', coinCost: 50, xpReward: 30, coinReward: 200, requiredElement: 'any', cooldown: 0, description: 'Summon a rain of golden coins from the sky.', riskLevel: 1 },
  { id: 'wish-wealth-treasure', name: 'Buried Treasure', category: 'wealth', coinCost: 200, xpReward: 80, coinReward: 800, requiredElement: 'earth', cooldown: 3, description: 'Unearth a long-buried desert treasure chest.', riskLevel: 2 },
  { id: 'wish-wealth-jewel', name: 'Jewel of the Oasis', category: 'wealth', coinCost: 500, xpReward: 150, coinReward: 2000, requiredElement: 'water', cooldown: 5, description: 'Retrieve the legendary jewel from the Crystal Spring.', riskLevel: 3 },
  { id: 'wish-power-strength', name: 'Herculean Might', category: 'power', coinCost: 80, xpReward: 60, coinReward: 100, requiredElement: 'fire', cooldown: 1, description: 'Gain the strength of a thousand desert warriors.', riskLevel: 2 },
  { id: 'wish-power-command', name: 'Command of Sands', category: 'power', coinCost: 300, xpReward: 120, coinReward: 300, requiredElement: 'earth', cooldown: 4, description: 'Control the sands themselves, reshaping the dunes.', riskLevel: 4 },
  { id: 'wish-power-transcend', name: 'Djinn\'s Might', category: 'power', coinCost: 1000, xpReward: 400, coinReward: 500, requiredElement: 'storm', cooldown: 8, description: 'Channel the raw power of a Djinn into yourself.', riskLevel: 7 },
  { id: 'wish-knowledge-tome', name: 'Ancient Tome', category: 'knowledge', coinCost: 60, xpReward: 100, coinReward: 50, requiredElement: 'light', cooldown: 0, description: 'Read from a tome containing forgotten wisdom.', riskLevel: 1 },
  { id: 'wish-knowledge-prophecy', name: 'Prophecy Sight', category: 'knowledge', coinCost: 250, xpReward: 200, coinReward: 100, requiredElement: 'shadow', cooldown: 3, description: 'Glimpse the threads of fate and future.', riskLevel: 3 },
  { id: 'wish-knowledge-omniscience', name: 'All-Knowing Eye', category: 'knowledge', coinCost: 800, xpReward: 500, coinReward: 200, requiredElement: 'time', cooldown: 10, description: 'Open the All-Knowing Eye for a moment of total clarity.', riskLevel: 8 },
  { id: 'wish-love-friendship', name: 'Bond of Friendship', category: 'love', coinCost: 40, xpReward: 40, coinReward: 30, requiredElement: 'water', cooldown: 0, description: 'Strengthen the bond between companions.', riskLevel: 1 },
  { id: 'wish-love-loyalty', name: 'Eternal Loyalty', category: 'love', coinCost: 350, xpReward: 150, coinReward: 200, requiredElement: 'wind', cooldown: 4, description: 'Earn the eternal loyalty of a desert spirit.', riskLevel: 3 },
  { id: 'wish-love-unison', name: 'Soul Unison', category: 'love', coinCost: 900, xpReward: 350, coinReward: 400, requiredElement: 'light', cooldown: 7, description: 'Merge your essence briefly with a willing Djinn.', riskLevel: 6 },
  { id: 'wish-health-vitality', name: 'Oasis Vitality', category: 'health', coinCost: 70, xpReward: 50, coinReward: 60, requiredElement: 'water', cooldown: 0, description: 'Drink from the waters of eternal vitality.', riskLevel: 1 },
  { id: 'wish-health-rejuvenation', name: 'Desert Rejuvenation', category: 'health', coinCost: 280, xpReward: 180, coinReward: 150, requiredElement: 'earth', cooldown: 3, description: 'The sands themselves restore your youth.', riskLevel: 2 },
  { id: 'wish-adventure-map', name: 'Explorer\'s Map', category: 'adventure', coinCost: 90, xpReward: 70, coinReward: 80, requiredElement: 'wind', cooldown: 0, description: 'Reveal a hidden path across the dunes.', riskLevel: 2 },
  { id: 'wish-adventure-teleport', name: 'Distant Shore', category: 'adventure', coinCost: 400, xpReward: 250, coinReward: 300, requiredElement: 'storm', cooldown: 5, description: 'Teleport to any discovered location in the desert.', riskLevel: 4 },
  { id: 'wish-adventure-quest', name: 'Legendary Quest', category: 'adventure', coinCost: 700, xpReward: 450, coinReward: 500, requiredElement: 'time', cooldown: 8, description: 'Begin a legendary quest of great peril and reward.', riskLevel: 7 },
  { id: 'wish-protection-shield', name: 'Djinn\'s Shield', category: 'protection', coinCost: 100, xpReward: 60, coinReward: 70, requiredElement: 'earth', cooldown: 1, description: 'Erect a barrier of compressed sand and magic.', riskLevel: 1 },
  { id: 'wish-protection-sanctuary', name: 'Safe Haven', category: 'protection', coinCost: 350, xpReward: 150, coinReward: 100, requiredElement: 'light', cooldown: 4, description: 'Create a sanctuary impervious to all harm.', riskLevel: 3 },
  { id: 'wish-creativity-inspire', name: 'Muse\'s Touch', category: 'creativity', coinCost: 55, xpReward: 80, coinReward: 40, requiredElement: 'wind', cooldown: 0, description: 'Receive divine inspiration from a desert muse.', riskLevel: 1 },
  { id: 'wish-creativity-masterwork', name: 'Desert Masterwork', category: 'creativity', coinCost: 300, xpReward: 200, coinReward: 200, requiredElement: 'fire', cooldown: 5, description: 'Create a masterpiece forged in Djinn fire.', riskLevel: 3 },
  { id: 'wish-fame-glory', name: 'Bard\'s Song', category: 'fame', coinCost: 120, xpReward: 90, coinReward: 150, requiredElement: 'wind', cooldown: 2, description: 'Have your deeds sung across every oasis.', riskLevel: 2 },
  { id: 'wish-fame-legend', name: 'Living Legend', category: 'fame', coinCost: 600, xpReward: 300, coinReward: 400, requiredElement: 'light', cooldown: 6, description: 'Become a living legend whose name echoes through time.', riskLevel: 5 },
  { id: 'wish-longevity-years', name: 'Century\'s Gift', category: 'longevity', coinCost: 450, xpReward: 200, coinReward: 250, requiredElement: 'time', cooldown: 6, description: 'Extend your life by a century.', riskLevel: 4 },
  { id: 'wish-longevity-immortal', name: 'Eternal Breath', category: 'longevity', coinCost: 1500, xpReward: 600, coinReward: 800, requiredElement: 'time', cooldown: 12, description: 'Receive the eternal breath of the Time Djinn.', riskLevel: 9 },
  { id: 'wish-wisdom-sage', name: 'Sage\'s Counsel', category: 'wisdom', coinCost: 80, xpReward: 120, coinReward: 60, requiredElement: 'shadow', cooldown: 1, description: 'Consult with an ancient desert sage.', riskLevel: 1 },
  { id: 'wish-wisdom-enlighten', name: 'Enlightenment', category: 'wisdom', coinCost: 600, xpReward: 400, coinReward: 200, requiredElement: 'light', cooldown: 7, description: 'Achieve a moment of perfect enlightenment.', riskLevel: 5 },
  { id: 'wish-fortune-luck', name: 'Lucky Star', category: 'fortune', coinCost: 65, xpReward: 45, coinReward: 120, requiredElement: 'light', cooldown: 0, description: 'Align the stars in your favor for a day.', riskLevel: 1 },
  { id: 'wish-fortune-jackpot', name: 'Jackpot Wish', category: 'fortune', coinCost: 500, xpReward: 200, coinReward: 1500, requiredElement: 'fire', cooldown: 6, description: 'Gamble on a wish with a chance for incredible fortune.', riskLevel: 6 },
  { id: 'wish-harmony-balance', name: 'Elemental Balance', category: 'harmony', coinCost: 200, xpReward: 150, coinReward: 100, requiredElement: 'any', cooldown: 2, description: 'Balance the elements within and around you.', riskLevel: 2 },
  { id: 'wish-mystery-riddle', name: 'Riddle of Sphinx', category: 'mystery', coinCost: 150, xpReward: 180, coinReward: 80, requiredElement: 'shadow', cooldown: 2, description: 'Solve the ancient riddle for hidden knowledge.', riskLevel: 4 },
  { id: 'wish-transcend-ascend', name: 'Ascension', category: 'transcendence', coinCost: 2000, xpReward: 1000, coinReward: 2000, requiredElement: 'storm', cooldown: 15, description: 'Transcend mortal limits and briefly join the ranks of Djinns.', riskLevel: 10 },
] as const;

export const DJ_OASIS_ZONES: readonly OasisZoneDef[] = [
  {
    id: 'zone-mirage-garden',
    name: 'Mirage Garden',
    description: 'A shimmering garden that appears and disappears with the heat waves, filled with illusionary flowers that grant visions.',
    baseCost: 200,
    xpMultiplier: 1.1,
    coinMultiplier: 1.05,
    wishDiscount: 0.05,
    summonBonus: 0,
    maxLevel: 10,
    unlockLevel: 1,
  },
  {
    id: 'zone-crystal-spring',
    name: 'Crystal Spring',
    description: 'A spring of pure crystalline water that heals and restores, said to be tears of an ancient water Djinn.',
    baseCost: 350,
    xpMultiplier: 1.05,
    coinMultiplier: 1.15,
    wishDiscount: 0,
    summonBonus: 0.05,
    maxLevel: 10,
    unlockLevel: 3,
  },
  {
    id: 'zone-sand-cathedral',
    name: 'Sand Cathedral',
    description: 'A towering cathedral carved entirely from desert sandstone by the first Earth Djinn.',
    baseCost: 500,
    xpMultiplier: 1.2,
    coinMultiplier: 1.0,
    wishDiscount: 0.1,
    summonBonus: 0,
    maxLevel: 10,
    unlockLevel: 7,
  },
  {
    id: 'zone-star-observatory',
    name: 'Star Observatory',
    description: 'Perched atop the highest dune, this observatory reveals the secrets written in desert stars.',
    baseCost: 700,
    xpMultiplier: 1.15,
    coinMultiplier: 1.1,
    wishDiscount: 0,
    summonBonus: 0.1,
    maxLevel: 10,
    unlockLevel: 12,
  },
  {
    id: 'zone-echo-bazaar',
    name: 'Echo Bazaar',
    description: 'A marketplace where voices carry across time, selling wares from past and future eras.',
    baseCost: 900,
    xpMultiplier: 1.0,
    coinMultiplier: 1.3,
    wishDiscount: 0.08,
    summonBonus: 0,
    maxLevel: 10,
    unlockLevel: 17,
  },
  {
    id: 'zone-phoenix-nest',
    name: 'Phoenix Nest',
    description: 'The rebirth place of the legendary desert phoenix, radiating intense fire energy.',
    baseCost: 1200,
    xpMultiplier: 1.25,
    coinMultiplier: 1.15,
    wishDiscount: 0.12,
    summonBonus: 0.08,
    maxLevel: 10,
    unlockLevel: 22,
  },
  {
    id: 'zone-moonlit-oasis',
    name: 'Moonlit Oasis',
    description: 'An oasis that only exists under moonlight, where Shadow and Light Djinns dance.',
    baseCost: 1800,
    xpMultiplier: 1.3,
    coinMultiplier: 1.2,
    wishDiscount: 0.15,
    summonBonus: 0.12,
    maxLevel: 10,
    unlockLevel: 28,
  },
  {
    id: 'zone-eternal-palace',
    name: 'Eternal Palace',
    description: 'The legendary palace of the Djinn Sultan, existing in all moments simultaneously.',
    baseCost: 3000,
    xpMultiplier: 1.5,
    coinMultiplier: 1.4,
    wishDiscount: 0.2,
    summonBonus: 0.15,
    maxLevel: 10,
    unlockLevel: 35,
  },
] as const;

export const DJ_ARTIFACTS: readonly ArtifactDef[] = [
  { id: 'artifact-lamp-wonders', name: 'Lamp of Wonders', rarity: 'legendary', power: 50, xpBonus: 0.2, coinBonus: 0.1, elementBoost: 'all', description: 'The fabled lamp that grants three wishes to any who rub it.', lore: 'Forged by the first Djinn, this lamp contains a fragment of creation itself.' },
  { id: 'artifact-ring-solomon', name: 'Ring of Solomon', rarity: 'legendary', power: 45, xpBonus: 0.15, coinBonus: 0.15, elementBoost: 'all', description: 'A ring that commands obedience from all Djinn-kind.', lore: 'King Solomon used this ring to build his great temple in a single night.' },
  { id: 'artifact-scarab-amulet', name: 'Scarab Amulet', rarity: 'epic', power: 35, xpBonus: 0.1, coinBonus: 0.1, elementBoost: 'earth', description: 'An ancient scarab that channels the power of the desert soil.', lore: 'Scarabs were sacred to the builders of pyramids, carrying souls to the afterlife.' },
  { id: 'artifact-crystal-hourglass', name: 'Crystal Hourglass', rarity: 'epic', power: 40, xpBonus: 0.15, coinBonus: 0.05, elementBoost: 'time', description: 'An hourglass made of pure crystal that slows time around the user.', lore: 'Each grain is a moment stolen from the end of the universe.' },
  { id: 'artifact-desert-rose', name: 'Desert Rose', rarity: 'rare', power: 20, xpBonus: 0.08, coinBonus: 0.08, elementBoost: 'earth', description: 'A crystalline rose formed by sand and mineral over millennia.', lore: 'Desert Roses bloom once every thousand years under a blue moon.' },
  { id: 'artifact-flying-carpet', name: 'Flying Carpet', rarity: 'epic', power: 30, xpBonus: 0.1, coinBonus: 0.12, elementBoost: 'wind', description: 'A enchanted carpet that soars above the dunes.', lore: 'Woven by Wind Djinns on looms made from cloud-stuff.' },
  { id: 'artifact-eye-horus', name: 'Eye of Horus', rarity: 'legendary', power: 48, xpBonus: 0.18, coinBonus: 0.08, elementBoost: 'light', description: 'The all-seeing eye that pierces all illusions.', lore: 'Horus sacrificed his eye to gain wisdom; it was restored by Thoth.' },
  { id: 'artifact-shadow-cloak', name: 'Shadow Cloak', rarity: 'epic', power: 38, xpBonus: 0.12, coinBonus: 0.1, elementBoost: 'shadow', description: 'A cloak woven from living shadows.', lore: 'The Shadow Cloak wraps its wearer in the space between moments.' },
  { id: 'artifact-fire-gem', name: 'Ember Gem', rarity: 'rare', power: 22, xpBonus: 0.06, coinBonus: 0.06, elementBoost: 'fire', description: 'A gem that burns with eternal internal flame.', lore: 'Found in the heart of extinct volcanoes deep beneath the sand.' },
  { id: 'artifact-water-flask', name: 'Everflow Flask', rarity: 'rare', power: 25, xpBonus: 0.07, coinBonus: 0.07, elementBoost: 'water', description: 'A flask that never empties, filled with enchanted water.', lore: 'Created by the Marid to ensure no traveler dies of thirst.' },
  { id: 'artifact-storm-orb', name: 'Storm Orb', rarity: 'legendary', power: 52, xpBonus: 0.22, coinBonus: 0.12, elementBoost: 'storm', description: 'A swirling orb containing an eternal thunderstorm.', lore: 'The Storm Orb is what the Tempest Djinn uses as its heart.' },
  { id: 'artifact-sphinx-mask', name: 'Sphinx Mask', rarity: 'epic', power: 36, xpBonus: 0.14, coinBonus: 0.06, elementBoost: 'shadow', description: 'A mask that grants the wisdom of the Sphinx.', lore: 'Wearers hear the riddles the Sphinx whispers to the wind.' },
  { id: 'artifact-oasis-pearl', name: 'Oasis Pearl', rarity: 'rare', power: 18, xpBonus: 0.05, coinBonus: 0.1, elementBoost: 'water', description: 'A luminous pearl from the deepest oasis pool.', lore: 'Each pearl contains the memory of a thousand rains.' },
  { id: 'artifact-dune-scroll', name: 'Dune Scroll', rarity: 'common', power: 10, xpBonus: 0.04, coinBonus: 0.03, elementBoost: 'earth', description: 'An ancient scroll with knowledge of the shifting sands.', lore: 'Written by nomads who could read the language of dunes.' },
  { id: 'artifact-star-compass', name: 'Star Compass', rarity: 'rare', power: 24, xpBonus: 0.08, coinBonus: 0.08, elementBoost: 'light', description: 'A compass that always points toward your heart\'s desire.', lore: 'Forged under a shower of stars during the Great Alignment.' },
  { id: 'artifact-djinn-bottle', name: 'Djinn Bottle', rarity: 'mythic', power: 60, xpBonus: 0.25, coinBonus: 0.2, elementBoost: 'all', description: 'A bottle containing the essence of a primordial Djinn.', lore: 'Only one exists, and it has passed through countless hands.' },
  { id: 'artifact-sandstorm-totem', name: 'Sandstorm Totem', rarity: 'epic', power: 32, xpBonus: 0.11, coinBonus: 0.09, elementBoost: 'wind', description: 'A totem that can summon or calm desert sandstorms.', lore: 'Shamans used this totem to protect their tribes from the wrath of the desert.' },
  { id: 'artifact-sun-stone', name: 'Sun Stone', rarity: 'rare', power: 28, xpBonus: 0.09, coinBonus: 0.07, elementBoost: 'fire', description: 'A stone that glows with captured sunlight.', lore: 'Sun Stones were used to light the underground cities of the ancients.' },
  { id: 'artifact-moon-crescent', name: 'Moon Crescent', rarity: 'rare', power: 26, xpBonus: 0.07, coinBonus: 0.09, elementBoost: 'shadow', description: 'A crescent shaped from moonlight itself.', lore: 'Falls from the sky only during lunar eclipses.' },
  { id: 'artifact-eternal-sands', name: 'Vial of Eternal Sands', rarity: 'mythic', power: 55, xpBonus: 0.2, coinBonus: 0.18, elementBoost: 'time', description: 'A vial containing sands from the beginning of time.', lore: 'When released, these sands can briefly rewind or accelerate time itself.' },
] as const;

export const DJ_MERCHANTS: readonly MerchantDef[] = [
  { id: 'merchant-aladdin', name: 'Aladdin the Wanderer', specialty: 'wish-boosts', discount: 0.1, description: 'A former street rat who now trades in magical curiosities.', dialogue: ['Careful what you wish for, friend.', 'I\'ve seen wishes granted and lives changed.', 'My prices are fair—for the desert.'], minLevel: 1 },
  { id: 'merchant-scheherazade', name: 'Scheherazade the Storyteller', specialty: 'knowledge', discount: 0.15, description: 'She trades in stories, each one containing hidden power.', dialogue: ['Every tale has a price.', 'I know a thousand and one stories.', 'Knowledge is the greatest currency.'], minLevel: 3 },
  { id: 'merchant-sinbad', name: 'Sinbad the Sailor', specialty: 'portals', discount: 0.12, description: 'A legendary sailor who found portals to other realms.', dialogue: ['I\'ve sailed seas that don\'t exist on any map.', 'Every voyage costs something.', 'The best treasures are beyond the horizon.'], minLevel: 6 },
  { id: 'merchant-jafar', name: 'Jafar the Sorcerer', specialty: 'artifacts', discount: 0.08, description: 'A cunning sorcerer who deals in powerful and dangerous artifacts.', dialogue: ['Power has a price, always.', 'I deal in artifacts of great potency.', 'Everything I sell is authentic... mostly.'], minLevel: 10 },
  { id: 'merchant-morgiana', name: 'Morgiana the Clever', specialty: 'tools', discount: 0.18, description: 'A clever merchant who sells practical magical tools.', dialogue: ['Why fight when you can outsmart?', 'The right tool changes everything.', 'I give discounts to the wise.'], minLevel: 14 },
  { id: 'merchant-zulfiqar', name: 'Zulfiqar the Smith', specialty: 'weapons', discount: 0.05, description: 'A master smith who forges weapons from desert metals.', dialogue: ['My blades sing in the desert wind.', 'Steel and magic, forged as one.', 'A good weapon is worth its weight in gold.'], minLevel: 18 },
  { id: 'merchant-nasreddin', name: 'Nasreddin the Fool', specialty: 'mystery', discount: 0.25, description: 'A seemingly foolish merchant whose deals hide great wisdom.', dialogue: ['Foolish is he who pays full price!', 'I may seem simple, but my goods are not.', 'The wisest buyer is the one who laughs.'], minLevel: 24 },
  { id: 'merchant-khadija', name: 'Khadija the Radiant', specialty: 'luxury', discount: 0.07, description: 'A wealthy merchant princess dealing in the finest luxuries.', dialogue: ['Only the finest for the finest.', 'Luxury is not a sin—it is a reward.', 'I cater only to those of discerning taste.'], minLevel: 30 },
] as const;

export const DJ_PORTALS: readonly PortalDef[] = [
  { id: 'portal-forgotten-temple', destination: 'Forgotten Temple', cost: 100, minLevel: 1, xpReward: 50, coinReward: 80, description: 'An ancient temple buried beneath centuries of sand.', element: 'earth' },
  { id: 'portal-sky-islands', destination: 'Sky Islands', cost: 200, minLevel: 3, xpReward: 80, coinReward: 120, description: 'Floating islands tethered to the earth by chains of wind.', element: 'wind' },
  { id: 'portal-volcanic-caverns', destination: 'Volcanic Caverns', cost: 300, minLevel: 5, xpReward: 120, coinReward: 180, description: 'Molten caverns where Fire Djinns forge their weapons.', element: 'fire' },
  { id: 'portal-abyssal-depths', destination: 'Abyssal Depths', cost: 350, minLevel: 7, xpReward: 130, coinReward: 200, description: 'The deepest underwater cave, home to ancient sea creatures.', element: 'water' },
  { id: 'portal-twilight-realm', destination: 'Twilight Realm', cost: 500, minLevel: 10, xpReward: 200, coinReward: 280, description: 'A realm between light and dark where shadows take form.', element: 'shadow' },
  { id: 'portal-radiant-palace', destination: 'Radiant Palace', cost: 600, minLevel: 12, xpReward: 240, coinReward: 320, description: 'A palace of pure light existing on a higher plane.', element: 'light' },
  { id: 'portal-time-vortex', destination: 'Time Vortex', cost: 800, minLevel: 15, xpReward: 300, coinReward: 400, description: 'A swirling vortex that leads to moments frozen in time.', element: 'time' },
  { id: 'portal-storm-peak', destination: 'Storm Peak', cost: 900, minLevel: 17, xpReward: 350, coinReward: 450, description: 'The tallest peak where eternal storms rage.', element: 'storm' },
  { id: 'portal-bone-yard', destination: 'Bone Yard', cost: 250, minLevel: 4, xpReward: 100, coinReward: 150, description: 'A graveyard of ancient beasts, full of secrets.', element: 'earth' },
  { id: 'portal-moon-wells', destination: 'Moon Wells', cost: 400, minLevel: 8, xpReward: 160, coinReward: 230, description: 'Magical wells that reflect moonlight into liquid power.', element: 'water' },
  { id: 'portal-inferno-gate', destination: 'Inferno Gate', cost: 550, minLevel: 11, xpReward: 220, coinReward: 300, description: 'A gate that opens into a realm of perpetual fire.', element: 'fire' },
  { id: 'portal-whispering-dunes', destination: 'Whispering Dunes', cost: 150, minLevel: 2, xpReward: 70, coinReward: 100, description: 'Dunes that whisper secrets to those who listen.', element: 'wind' },
  { id: 'portal-shadow-maze', destination: 'Shadow Maze', cost: 650, minLevel: 13, xpReward: 260, coinReward: 350, description: 'A labyrinth of living shadows that rearranges itself.', element: 'shadow' },
  { id: 'portal-sun-forges', destination: 'Sun Forges', cost: 750, minLevel: 14, xpReward: 280, coinReward: 380, description: 'Forges powered by concentrated sunlight.', element: 'fire' },
  { id: 'portal-crystal-caverns', destination: 'Crystal Caverns', cost: 450, minLevel: 9, xpReward: 180, coinReward: 250, description: 'Caverns filled with giant crystals that hum with energy.', element: 'light' },
  { id: 'portal-sand-colosseum', destination: 'Sand Colosseum', cost: 500, minLevel: 10, xpReward: 200, coinReward: 270, description: 'An arena where heroes test their mettle.', element: 'earth' },
  { id: 'portal-cloud-city', destination: 'Cloud City', cost: 700, minLevel: 12, xpReward: 260, coinReward: 340, description: 'A city built on permanent storm clouds.', element: 'wind' },
  { id: 'portal-ancient-library', destination: 'Ancient Library', cost: 350, minLevel: 6, xpReward: 150, coinReward: 200, description: 'A library containing the knowledge of vanished civilizations.', element: 'light' },
  { id: 'portal-mirage-sea', destination: 'Mirage Sea', cost: 280, minLevel: 5, xpReward: 110, coinReward: 170, description: 'An ocean that is mostly illusion—but its treasures are real.', element: 'water' },
  { id: 'portal-dragon-bones', destination: 'Dragon Bones', cost: 1000, minLevel: 20, xpReward: 400, coinReward: 500, description: 'The skeletal remains of the last desert dragon.', element: 'fire' },
  { id: 'portal-eternal-night', destination: 'Eternal Night', cost: 850, minLevel: 16, xpReward: 320, coinReward: 420, description: 'A pocket dimension where the sun never rises.', element: 'shadow' },
  { id: 'portal-genesis-fountain', destination: 'Genesis Fountain', cost: 1200, minLevel: 22, xpReward: 450, coinReward: 600, description: 'The fountain where all desert water originated.', element: 'water' },
  { id: 'portal-clockwork-desert', destination: 'Clockwork Desert', cost: 950, minLevel: 18, xpReward: 380, coinReward: 480, description: 'A desert of gears and cogs powered by Time Djinn magic.', element: 'time' },
  { id: 'portal-thunder-dome', destination: 'Thunder Dome', cost: 1100, minLevel: 21, xpReward: 420, coinReward: 550, description: 'A dome where lightning is harvested for power.', element: 'storm' },
  { id: 'portal-djinn-realm', destination: 'Djinn Realm', cost: 2000, minLevel: 30, xpReward: 800, coinReward: 1000, description: 'The home dimension of the Djinns themselves.', element: 'storm' },
] as const;

export const DJ_QUESTS: readonly QuestDef[] = [
  { id: 'quest-summon-three', name: 'Djinn Caller', description: 'Summon 3 Djinns into your service.', type: 'summon', target: 3, xpReward: 200, coinReward: 150, minLevel: 1 },
  { id: 'quest-grant-ten-wishes', name: 'Wish Granter', description: 'Grant 10 wishes to travelers.', type: 'wish', target: 10, xpReward: 300, coinReward: 200, minLevel: 3 },
  { id: 'quest-collect-five-artifacts', name: 'Treasure Hunter', description: 'Collect 5 magical artifacts.', type: 'collect', target: 5, xpReward: 250, coinReward: 300, minLevel: 2 },
  { id: 'quest-open-five-portals', name: 'Portal Explorer', description: 'Open 5 portals to other realms.', type: 'explore', target: 5, xpReward: 350, coinReward: 250, minLevel: 5 },
  { id: 'quest-trade-ten-times', name: 'Master Trader', description: 'Complete 10 trades with merchants.', type: 'trade', target: 10, xpReward: 400, coinReward: 350, minLevel: 7 },
  { id: 'quest-upgrade-three-zones', name: 'Oasis Builder', description: 'Upgrade 3 oasis zones to level 3.', type: 'collect', target: 3, xpReward: 500, coinReward: 400, minLevel: 10 },
  { id: 'quest-summon-legendary', name: 'Legendary Summoner', description: 'Summon a legendary Djinn.', type: 'summon', target: 1, xpReward: 800, coinReward: 500, minLevel: 15 },
  { id: 'quest-daily-streak-seven', name: 'Devoted Pilgrim', description: 'Maintain a 7-day daily streak.', type: 'wish', target: 7, xpReward: 600, coinReward: 400, minLevel: 5 },
  { id: 'quest-max-zone', name: 'Zone Master', description: 'Fully upgrade any oasis zone to max level.', type: 'collect', target: 1, xpReward: 700, coinReward: 600, minLevel: 20 },
  { id: 'quest-open-all-portals', name: 'World Walker', description: 'Open all 25 portal destinations.', type: 'explore', target: 25, xpReward: 2000, coinReward: 1500, minLevel: 25 },
] as const;

export const DJ_NPCS: readonly NpcDef[] = [
  { id: 'npc-elder-sand', name: 'Elder of Sands', role: 'guide', dialogues: ['Welcome, young wish-seeker. The desert has much to teach.', 'Patience is the greatest treasure.', 'Even the smallest oasis sustains life.'], location: 'Mirage Garden' },
  { id: 'npc-guardian-spring', name: 'Guardian of the Spring', role: 'healer', dialogues: ['Drink deeply, traveler. The waters heal all wounds.', 'The Crystal Spring remembers every soul it has touched.', 'Water is life; never forget this.'], location: 'Crystal Spring' },
  { id: 'npc-wandering-mystic', name: 'Wandering Mystic', role: 'fortune-teller', dialogues: ['I see great potential in your future.', 'The stars align for a wish of great consequence.', 'Your destiny is written in the sands.'], location: 'Star Observatory' },
  { id: 'npc-desert-fox', name: 'Desert Fox', role: 'trickster', dialogues: ['Hehe, looking for something specific?', 'I know a shortcut... for a price.', 'Not all that glitters is gold, but most of it is.'], location: 'Echo Bazaar' },
  { id: 'npc-phoenix-keeper', name: 'Phoenix Keeper', role: 'quest-giver', dialogues: ['The phoenix rebirths every millennium. Be ready.', 'Fire tests all things; pure gold survives.', 'I guard the sacred flame of renewal.'], location: 'Phoenix Nest' },
] as const;

export const DJ_ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: 'ach-first-wish', name: 'First Wish', description: 'Grant your very first wish.', xpReward: 50, coinReward: 25, iconHint: 'sparkle' },
  { id: 'ach-summon-first', name: 'Djinn Contact', description: 'Summon your first Djinn.', xpReward: 60, coinReward: 30, iconHint: 'flame' },
  { id: 'ach-wealthy', name: 'Desert Tycoon', description: 'Accumulate 10,000 coins.', xpReward: 200, coinReward: 500, iconHint: 'coins' },
  { id: 'ach-zone-builder', name: 'Oasis Architect', description: 'Own and upgrade all 8 oasis zones.', xpReward: 500, coinReward: 800, iconHint: 'building' },
  { id: 'ach-collector', name: 'Artifact Hoarder', description: 'Collect 10 different artifacts.', xpReward: 300, coinReward: 400, iconHint: 'gem' },
  { id: 'ach-portal-master', name: 'Realm Walker', description: 'Open 15 different portals.', xpReward: 400, coinReward: 600, iconHint: 'portal' },
  { id: 'ach-wish-50', name: 'Wish Factory', description: 'Grant 50 wishes total.', xpReward: 600, coinReward: 700, iconHint: 'wand' },
  { id: 'ach-streak-30', name: 'Devoted Sultan', description: 'Maintain a 30-day daily streak.', xpReward: 800, coinReward: 1000, iconHint: 'calendar' },
  { id: 'ach-level-45', name: 'Eternal Sultan', description: 'Reach the maximum level of 45.', xpReward: 1000, coinReward: 2000, iconHint: 'crown' },
  { id: 'ach-all-djinns', name: 'Djinn Collector', description: 'Own at least one of each Djinn element type.', xpReward: 700, coinReward: 900, iconHint: 'djinn' },
  { id: 'ach-mythic-artifact', name: 'Mythic Finder', description: 'Obtain a mythic rarity artifact.', xpReward: 500, coinReward: 600, iconHint: 'star' },
  { id: 'ach-legendary-summon', name: 'Legend Bound', description: 'Summon a legendary-rarity Djinn.', xpReward: 450, coinReward: 500, iconHint: 'lightning' },
  { id: 'ach-quest-master', name: 'Quest Conqueror', description: 'Complete all available quests.', xpReward: 600, coinReward: 800, iconHint: 'scroll' },
  { id: 'ach-trade-50', name: 'Merchant\'s Friend', description: 'Complete 50 trades with merchants.', xpReward: 400, coinReward: 500, iconHint: 'handshake' },
  { id: 'ach-ritual-10', name: 'Ritual Adept', description: 'Perform the daily ritual 10 times.', xpReward: 350, coinReward: 450, iconHint: 'moon' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Default state factory
// ═══════════════════════════════════════════════════════════════════════════════

function createDefaultState(seed: number): DjinnOasisState {
  const portals: OpenedPortal[] = DJ_PORTALS.map(p => ({
    defId: p.id,
    visits: 0,
    lastVisit: 0,
    unlocked: false,
  }));

  const quests: ActiveQuest[] = DJ_QUESTS.map(q => ({
    defId: q.id,
    progress: 0,
    accepted: false,
    completed: false,
    claimed: false,
  }));

  return {
    level: 1,
    xp: 0,
    coins: 500,
    djinns: [],
    activeDjinn: null,
    oasisZones: [],
    artifacts: [],
    wishHistory: [],
    merchants: {},
    portals,
    quests,
    achievements: [],
    streak: 0,
    lastDaily: null,
    dailyTask: null,
    totalWishesGranted: 0,
    totalDjinnsSummoned: 0,
    totalPortalsOpened: 0,
    totalTradesCompleted: 0,
    totalArtifactsCollected: 0,
    totalQuestsCompleted: 0,
    totalCoinsEarned: 0,
    seed,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Achievement checker
// ═══════════════════════════════════════════════════════════════════════════════

function evaluateAchievements(state: DjinnOasisState): string[] {
  const newlyUnlocked: string[] = [];
  const alreadyUnlocked = new Set(state.achievements.map(a => a.defId));

  const checks: Record<string, boolean> = {
    'ach-first-wish': state.totalWishesGranted >= 1,
    'ach-summon-first': state.totalDjinnsSummoned >= 1,
    'ach-wealthy': state.coins >= 10000 || state.totalCoinsEarned >= 10000,
    'ach-zone-builder': state.oasisZones.length >= 8 && state.oasisZones.every(z => z.level >= 1),
    'ach-collector': state.artifacts.filter(a => a.quantity > 0).length >= 10,
    'ach-portal-master': state.portals.filter(p => p.unlocked).length >= 15,
    'ach-wish-50': state.totalWishesGranted >= 50,
    'ach-streak-30': state.streak >= 30,
    'ach-level-45': state.level >= 45,
    'ach-all-djinns': (() => {
      const elements = new Set(state.djinns.map(d => {
        const def = findDef(DJ_DJINNS, d.defId);
        return def?.element;
      }));
      return DJ_DJINNS.every(dj => elements.has(dj.element));
    })(),
    'ach-mythic-artifact': state.artifacts.some(a => {
      const def = findDef(DJ_ARTIFACTS, a.defId);
      return def?.rarity === 'mythic' && a.quantity > 0;
    }),
    'ach-legendary-summon': state.djinns.some(d => {
      const def = findDef(DJ_DJINNS, d.defId);
      return def?.rarity === 'legendary';
    }),
    'ach-quest-master': state.quests.filter(q => q.completed).length >= DJ_QUESTS.length,
    'ach-trade-50': state.totalTradesCompleted >= 50,
    'ach-ritual-10': state.achievements.filter(a => a.defId === 'ach-ritual-10').length === 0 && state.streak >= 10,
  };

  for (const [achId, condition] of Object.entries(checks)) {
    if (condition && !alreadyUnlocked.has(achId)) {
      newlyUnlocked.push(achId);
    }
  }

  return newlyUnlocked;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Daily task generator (seeded)
// ═══════════════════════════════════════════════════════════════════════════════

function generateDailyTask(dateSeed: number, level: number): DailyTask {
  const rng = createPRNG(dateSeed * 7919 + 31337);
  const taskTemplates = [
    { desc: 'Grant {n} wishes today', baseTarget: 3, xpBase: 100, coinBase: 80 },
    { desc: 'Sumon {n} Djinn spirits', baseTarget: 1, xpBase: 150, coinBase: 100 },
    { desc: 'Open {n} portals', baseTarget: 2, xpBase: 120, coinBase: 90 },
    { desc: 'Collect {n} artifacts', baseTarget: 2, xpBase: 130, coinBase: 85 },
    { desc: 'Complete {n} trades', baseTarget: 3, xpBase: 110, coinBase: 95 },
    { desc: 'Upgrade {n} oasis zones', baseTarget: 1, xpBase: 140, coinBase: 110 },
  ];
  const template = taskTemplates[Math.floor(rng() * taskTemplates.length)];
  const target = Math.max(1, template.baseTarget + Math.floor(level / 15));
  const xpReward = Math.floor(template.xpBase * (1 + level * 0.05));
  const coinReward = Math.floor(template.coinBase * (1 + level * 0.04));

  return {
    id: `daily-${dateSeed}`,
    description: template.desc.replace('{n}', String(target)),
    target,
    progress: 0,
    xpReward,
    coinReward,
    claimed: false,
    date: dateSeed,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Quest progress updater (internal helper)
// ═══════════════════════════════════════════════════════════════════════════════

function incrementQuestProgress(
  quests: ActiveQuest[],
  questType: QuestType,
  amount: number,
  state: DjinnOasisState,
): ActiveQuest[] {
  return quests.map(q => {
    if (!q.accepted || q.completed) return q;
    const def = findDef(DJ_QUESTS, q.defId);
    if (!def || def.type !== questType) return q;
    const newProgress = Math.min(q.progress + amount, def.target);
    const completed = newProgress >= def.target;
    return { ...q, progress: newProgress, completed };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// The Hook
// ═══════════════════════════════════════════════════════════════════════════════

export function useDjinnOasis(initialSeed: number = 42): DjinnOasisReturn {
  const seedRef = useRef(initialSeed);
  const [state, setState] = useState<DjinnOasisState>(() => createDefaultState(initialSeed));

  // ── djGetState ──────────────────────────────────────────────────────────────
  const djGetState = useCallback(() => state, [state]);

  // ── djResetState ───────────────────────────────────────────────────────────
  const djResetState = useCallback(() => {
    seedRef.current = seedRef.current + 1;
    setState(createDefaultState(seedRef.current));
  }, []);

  // ── djGetLevel ─────────────────────────────────────────────────────────────
  const djGetLevel = useCallback(() => state.level, [state.level]);

  // ── djGetXp ────────────────────────────────────────────────────────────────
  const djGetXp = useCallback(() => state.xp, [state.xp]);

  // ── djGetTitle ─────────────────────────────────────────────────────────────
  const djGetTitle = useCallback(() => {
    let title = DJ_TITLE_THRESHOLDS[0].title;
    for (const t of DJ_TITLE_THRESHOLDS) {
      if (state.level >= t.minLevel) title = t.title;
    }
    return title;
  }, [state.level]);

  // ── djGetProgress ──────────────────────────────────────────────────────────
  const djGetProgress = useCallback(() => {
    if (state.level >= DJ_MAX_LEVEL) return 100;
    const xpInLevel = state.xp;
    const needed = xpForLevel(state.level);
    return Math.min(100, Math.floor((xpInLevel / needed) * 100));
  }, [state.xp, state.level]);

  // ── djGetProgressToNextLevel ───────────────────────────────────────────────
  const djGetProgressToNextLevel = useCallback(() => {
    if (state.level >= DJ_MAX_LEVEL) {
      return { current: state.xp, required: 1, pct: 100 };
    }
    const needed = xpForLevel(state.level);
    return {
      current: state.xp,
      required: needed,
      pct: Math.min(100, Math.floor((state.xp / needed) * 100)),
    };
  }, [state.xp, state.level]);

  // ── djAddXP ────────────────────────────────────────────────────────────────
  const djAddXP = useCallback((amount: number) => {
    let result = { leveledUp: false, newLevel: state.level, xpGained: amount };
    setState(prev => {
      const mul = getXPMultiplier(prev);
      const totalGain = Math.floor(amount * mul);
      let newXp = prev.xp + totalGain;
      let newLevel = prev.level;
      let leveledUp = false;

      while (newLevel < DJ_MAX_LEVEL) {
        const needed = xpForLevel(newLevel);
        if (newXp >= needed) {
          newXp -= needed;
          newLevel++;
          leveledUp = true;
        } else {
          break;
        }
      }

      if (newLevel >= DJ_MAX_LEVEL) newXp = 0;

      result = { leveledUp, newLevel, xpGained: totalGain };
      return { ...prev, xp: newXp, level: newLevel };
    });
    return result;
  }, [state.level]);

  // ── djGetCoins ─────────────────────────────────────────────────────────────
  const djGetCoins = useCallback(() => state.coins, [state.coins]);

  // ── djAddCoins ─────────────────────────────────────────────────────────────
  const djAddCoins = useCallback((amount: number) => {
    let added = 0;
    setState(prev => {
      const mul = getCoinMultiplier(prev);
      added = Math.floor(amount * mul);
      const newTotalCoins = prev.totalCoinsEarned + added;
      return { ...prev, coins: prev.coins + added, totalCoinsEarned: newTotalCoins };
    });
    return added;
  }, []);

  // ── djSpendCoins ───────────────────────────────────────────────────────────
  const djSpendCoins = useCallback((amount: number) => {
    let success = false;
    setState(prev => {
      if (prev.coins < amount) return prev;
      success = true;
      return { ...prev, coins: prev.coins - amount };
    });
    return success;
  }, []);

  // ── djGetDjinns ────────────────────────────────────────────────────────────
  const djGetDjinns = useCallback(() => state.djinns, [state.djinns]);

  // ── djGetActiveDjinn ───────────────────────────────────────────────────────
  const djGetActiveDjinn = useCallback(() => {
    if (!state.activeDjinn) return null;
    return state.djinns.find(d => d.defId === state.activeDjinn) ?? null;
  }, [state.djinns, state.activeDjinn]);

  // ── djSetActiveDjinn ───────────────────────────────────────────────────────
  const djSetActiveDjinn = useCallback((ownedId: string) => {
    let success = false;
    setState(prev => {
      const exists = prev.djinns.some(d => d.defId === ownedId);
      if (!exists) return prev;
      success = true;
      return { ...prev, activeDjinn: ownedId };
    });
    return success;
  }, []);

  // ── djSummonDjinn ──────────────────────────────────────────────────────────
  const djSummonDjinn = useCallback((defId: string, nickname?: string) => {
    let result: { success: boolean; djinn?: OwnedDjinn; reason?: string } = { success: false, reason: 'Unknown error' };
    setState(prev => {
      const def = findDef(DJ_DJINNS, defId);
      if (!def) { result = { success: false, reason: `Djinn "${defId}" not found.` }; return prev; }
      if (prev.djinns.some(d => d.defId === defId)) { result = { success: false, reason: 'Already owned.' }; return prev; }

      const summonMul = getSummonMultiplier(prev);
      const cost = Math.floor(def.summonCost * (1 - summonMul));
      if (prev.coins < cost) { result = { success: false, reason: `Need ${cost} coins, have ${prev.coins}.` }; return prev; }
      if (prev.level < (def.rarity === 'legendary' ? 15 : def.rarity === 'epic' ? 8 : def.rarity === 'rare' ? 4 : 1)) {
        result = { success: false, reason: `Level too low for ${def.rarity} djinns.` };
        return prev;
      }

      const rng = createPRNG(prev.seed + prev.totalDjinnsSummoned + Date.now());
      const loyaltyRoll = seededInt(rng, 40, 80);

      const newDjinn: OwnedDjinn = {
        defId,
        nickname: nickname ?? def.name,
        level: 1,
        xp: 0,
        loyalty: loyaltyRoll,
        bound: false,
      };

      result = { success: true, djinn: newDjinn };
      const newQuests = incrementQuestProgress(prev.quests, 'summon', 1, prev);
      return {
        ...prev,
        djinns: [...prev.djinns, newDjinn],
        coins: prev.coins - cost,
        totalDjinnsSummoned: prev.totalDjinnsSummoned + 1,
        quests: newQuests,
      };
    });
    return result;
  }, []);

  // ── djGetDjinnPower ────────────────────────────────────────────────────────
  const djGetDjinnPower = useCallback((ownedId: string) => {
    const owned = state.djinns.find(d => d.defId === ownedId);
    if (!owned) return 0;
    const def = findDef(DJ_DJINNS, owned.defId);
    if (!def) return 0;
    const loyaltyBonus = 1 + owned.loyalty / 200;
    const levelBonus = 1 + (owned.level - 1) * 0.15;
    return Math.floor(def.basePower * loyaltyBonus * levelBonus);
  }, [state.djinns]);

  // ── djGetDjinnByElement ────────────────────────────────────────────────────
  const djGetDjinnByElement = useCallback((element: DjinnElement) => {
    return state.djinns.filter(d => {
      const def = findDef(DJ_DJINNS, d.defId);
      return def?.element === element;
    });
  }, [state.djinns]);

  // ── djGetWishes ────────────────────────────────────────────────────────────
  const djGetWishes = useCallback(() => [...DJ_WISHES], []);

  // ── djGrantWish ────────────────────────────────────────────────────────────
  const djGrantWish = useCallback((defId: string) => {
    let result: { success: boolean; result?: GrantedWish; reason?: string } = { success: false, reason: 'Unknown error' };
    setState(prev => {
      const def = findDef(DJ_WISHES, defId);
      if (!def) { result = { success: false, reason: `Wish "${defId}" not found.` }; return prev; }

      // Check element requirement
      if (def.requiredElement !== 'any') {
        const hasElement = prev.djinns.some(d => {
          const djDef = findDef(DJ_DJINNS, d.defId);
          return djDef?.element === def.requiredElement;
        });
        if (!hasElement) {
          result = { success: false, reason: `Requires a ${def.requiredElement} Djinn.` };
          return prev;
        }
      }

      // Apply wish discount from zones
      const zoneDiscount = getWishDiscountTotal(prev);
      const cost = Math.floor(def.coinCost * (1 - zoneDiscount));
      if (prev.coins < cost) {
        result = { success: false, reason: `Need ${cost} coins, have ${prev.coins}.` };
        return prev;
      }

      // Cooldown check
      const lastWish = prev.wishHistory.find(w => w.defId === defId);
      if (lastWish && def.cooldown > 0) {
        const cooldownMs = def.cooldown * 60 * 60 * 1000;
        if (Date.now() - lastWish.grantedAt < cooldownMs) {
          result = { success: false, reason: `Wish on cooldown for ${def.cooldown}h.` };
          return prev;
        }
      }

      // Determine wish outcome using seeded PRNG
      const rng = createPRNG(prev.seed + prev.totalWishesGranted + 99991);
      const roll = rng();
      const risk = def.riskLevel / 10;
      let wishResult: GrantedWish['result'];
      let coinMul = 1;
      let xpMul = 1;

      if (roll > risk * 0.3 + 0.05) {
        wishResult = roll > risk * 0.1 ? 'success' : 'partial';
        coinMul = wishResult === 'success' ? 1 : 0.5;
        xpMul = wishResult === 'success' ? 1 : 0.6;
      } else {
        wishResult = roll > 0.02 ? 'twisted' : 'failed';
        coinMul = wishResult === 'twisted' ? 0.3 : 0;
        xpMul = wishResult === 'twisted' ? 0.4 : 0.1;
      }

      // Apply zone multipliers
      const zoneXP = getXPMultiplier(prev);
      const zoneCoin = getCoinMultiplier(prev);

      const coinsGained = Math.floor(def.coinReward * coinMul * zoneCoin);
      const xpGained = Math.floor(def.xpReward * xpMul * zoneXP);

      const granted: GrantedWish = {
        defId,
        grantedAt: Date.now(),
        result: wishResult,
        coinsGained,
        xpGained,
      };

      result = { success: true, result: granted };

      const newQuests = incrementQuestProgress(prev.quests, 'wish', 1, prev);

      // Check for artifact drop
      const artifactDrop = rng() < 0.15;
      let newArtifacts = [...prev.artifacts];
      let newTotalArtifacts = prev.totalArtifactsCollected;
      if (artifactDrop) {
        const available = DJ_ARTIFACTS.filter(a => {
          const owned = newArtifacts.find(oa => oa.defId === a.id);
          return !owned || owned.quantity < 3;
        });
        if (available.length > 0) {
          const dropped = seededPick(rng, available);
          const existing = newArtifacts.find(a => a.defId === dropped.id);
          if (existing) {
            newArtifacts = newArtifacts.map(a => a.defId === dropped.id ? { ...a, quantity: a.quantity + 1 } : a);
          } else {
            newArtifacts.push({ defId: dropped.id, quantity: 1, equipped: false });
          }
          newTotalArtifacts++;
        }
      }

      // Check achievements
      const newState = {
        ...prev,
        coins: prev.coins - cost + coinsGained,
        wishHistory: [granted, ...prev.wishHistory].slice(0, 100),
        totalWishesGranted: prev.totalWishesGranted + 1,
        totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
        quests: newQuests,
        artifacts: newArtifacts,
        totalArtifactsCollected: newTotalArtifacts,
      };
      const newAch = evaluateAchievements(newState);
      if (newAch.length > 0) {
        newState.achievements = [
          ...newAch.map(id => ({ defId: id, unlockedAt: Date.now() })),
          ...newState.achievements,
        ];
      }
      return newState;
    });
    return result;
  }, []);

  // ── djGetWishHistory ───────────────────────────────────────────────────────
  const djGetWishHistory = useCallback(() => state.wishHistory, [state.wishHistory]);

  // ── djGetWishesByCategory ──────────────────────────────────────────────────
  const djGetWishesByCategory = useCallback((category: WishCategory) => {
    return DJ_WISHES.filter(w => w.category === category);
  }, []);

  // ── djCalculateWishCost ────────────────────────────────────────────────────
  const djCalculateWishCost = useCallback((defId: string) => {
    const def = findDef(DJ_WISHES, defId);
    if (!def) return 0;
    const zoneDiscount = getWishDiscountTotal(state);
    return Math.max(1, Math.floor(def.coinCost * (1 - zoneDiscount)));
  }, [state]);

  // ── djGetOasisZones ────────────────────────────────────────────────────────
  const djGetOasisZones = useCallback(() => state.oasisZones, [state.oasisZones]);

  // ── djUpgradeZone ──────────────────────────────────────────────────────────
  const djUpgradeZone = useCallback((defId: string) => {
    let result: { success: boolean; newLevel?: number; reason?: string } = { success: false, reason: 'Unknown error' };
    setState(prev => {
      const def = findDef(DJ_OASIS_ZONES, defId);
      if (!def) { result = { success: false, reason: `Zone "${defId}" not found.` }; return prev; }
      if (prev.level < def.unlockLevel) { result = { success: false, reason: 'Level too low to unlock.' }; return prev; }

      const existing = prev.oasisZones.find(z => z.defId === defId);
      const currentLevel = existing?.level ?? 0;
      const newLevel = currentLevel + 1;
      if (newLevel > def.maxLevel) { result = { success: false, reason: 'Zone already at max level.' }; return prev; }

      const cost = Math.floor(def.baseCost * Math.pow(1.6, currentLevel));
      if (prev.coins < cost) { result = { success: false, reason: `Need ${cost} coins.` }; return prev; }

      let newZones: OwnedZone[];
      if (existing) {
        newZones = prev.oasisZones.map(z => z.defId === defId ? { ...z, level: newLevel } : z);
      } else {
        newZones = [...prev.oasisZones, { defId, level: newLevel, slots: 3, activated: true }];
      }

      // Give djinns XP on zone upgrade
      const newDjinns = prev.djinns.map(d => {
        const djDef = findDef(DJ_DJINNS, d.defId);
        if (!djDef) return d;
        const zoneElement = def.id.includes('crystal') || def.id.includes('moonlit') || def.id.includes('genesis') ? 'water' :
          def.id.includes('phoenix') || def.id.includes('inferno') ? 'fire' :
          def.id.includes('star') || def.id.includes('radiant') ? 'light' :
          def.id.includes('echo') || def.id.includes('sky') ? 'wind' :
          def.id.includes('sand') || def.id.includes('eternal') ? 'earth' :
          def.id.includes('mirage') ? 'shadow' : 'storm';
        if (djDef.element === zoneElement) {
          return { ...d, xp: d.xp + 20, loyalty: Math.min(100, d.loyalty + 5) };
        }
        return { ...d, loyalty: Math.min(100, d.loyalty + 2) };
      });

      result = { success: true, newLevel };
      const newQuests = incrementQuestProgress(prev.quests, 'collect', 1, { ...prev, oasisZones: newZones });
      return {
        ...prev,
        oasisZones: newZones,
        djinns: newDjinns,
        coins: prev.coins - cost,
        quests: newQuests,
      };
    });
    return result;
  }, []);

  // ── djGetZoneBonus ─────────────────────────────────────────────────────────
  const djGetZoneBonus = useCallback((defId: string) => {
    const owned = state.oasisZones.find(z => z.defId === defId);
    const def = findDef(DJ_OASIS_ZONES, defId);
    if (!def) return { xpMul: 1, coinMul: 1, wishDiscount: 0, summonBonus: 0 };
    const level = owned?.level ?? 0;
    const levelScale = 1 + level * 0.08;
    return {
      xpMul: 1 + (def.xpMultiplier - 1) * level * 0.15,
      coinMul: 1 + (def.coinMultiplier - 1) * level * 0.15,
      wishDiscount: def.wishDiscount * level * 0.12,
      summonBonus: def.summonBonus * level * 0.12,
    };
  }, [state.oasisZones]);

  // ── djIsZoneUnlocked ───────────────────────────────────────────────────────
  const djIsZoneUnlocked = useCallback((defId: string) => {
    const def = findDef(DJ_OASIS_ZONES, defId);
    if (!def) return false;
    if (state.level < def.unlockLevel) return false;
    return state.oasisZones.some(z => z.defId === defId);
  }, [state.level, state.oasisZones]);

  // ── djGetArtifacts ─────────────────────────────────────────────────────────
  const djGetArtifacts = useCallback(() => state.artifacts, [state.artifacts]);

  // ── djCollectArtifact ──────────────────────────────────────────────────────
  const djCollectArtifact = useCallback((defId: string) => {
    let result: { success: boolean; isNew?: boolean; reason?: string } = { success: false, reason: 'Unknown error' };
    setState(prev => {
      const def = findDef(DJ_ARTIFACTS, defId);
      if (!def) { result = { success: false, reason: `Artifact "${defId}" not found.` }; return prev; }

      const existing = prev.artifacts.find(a => a.defId === defId);
      const isNew = !existing;
      if (existing && existing.quantity >= 3) { result = { success: false, reason: 'Already at max quantity (3).' }; return prev; }

      let newArtifacts: OwnedArtifact[];
      if (existing) {
        newArtifacts = prev.artifacts.map(a => a.defId === defId ? { ...a, quantity: a.quantity + 1 } : a);
      } else {
        newArtifacts = [...prev.artifacts, { defId, quantity: 1, equipped: false }];
      }

      result = { success: true, isNew };
      const newState = {
        ...prev,
        artifacts: newArtifacts,
        totalArtifactsCollected: prev.totalArtifactsCollected + 1,
      };
      const newAch = evaluateAchievements(newState);
      if (newAch.length > 0) {
        newState.achievements = [
          ...newAch.map(id => ({ defId: id, unlockedAt: Date.now() })),
          ...newState.achievements,
        ];
      }
      return newState;
    });
    return result;
  }, []);

  // ── djEquipArtifact ────────────────────────────────────────────────────────
  const djEquipArtifact = useCallback((defId: string) => {
    let success = false;
    setState(prev => {
      const exists = prev.artifacts.find(a => a.defId === defId && a.quantity > 0);
      if (!exists) return prev;
      success = true;
      return {
        ...prev,
        artifacts: prev.artifacts.map(a =>
          a.defId === defId ? { ...a, equipped: !a.equipped } : a,
        ),
      };
    });
    return success;
  }, []);

  // ── djGetArtifactBonus ─────────────────────────────────────────────────────
  const djGetArtifactBonus = useCallback(() => {
    let xpBonus = 0;
    let coinBonus = 0;
    const elementBoost: Record<string, number> = {};

    for (const owned of state.artifacts) {
      if (!owned.equipped || owned.quantity <= 0) continue;
      const def = findDef(DJ_ARTIFACTS, owned.defId);
      if (!def) continue;
      xpBonus += def.xpBonus;
      coinBonus += def.coinBonus;
      if (def.elementBoost !== 'all') {
        elementBoost[def.elementBoost] = (elementBoost[def.elementBoost] ?? 0) + def.power * 0.02;
      } else {
        for (const dj of DJ_DJINNS) {
          elementBoost[dj.element] = (elementBoost[dj.element] ?? 0) + def.power * 0.01;
        }
      }
    }

    return { xpBonus, coinBonus, elementBoost };
  }, [state.artifacts]);

  // ── djGetPortals ───────────────────────────────────────────────────────────
  const djGetPortals = useCallback(() => [...DJ_PORTALS], []);

  // ── djOpenPortal ───────────────────────────────────────────────────────────
  const djOpenPortal = useCallback((defId: string) => {
    let result: { success: boolean; reward?: { xp: number; coins: number }; reason?: string } = { success: false, reason: 'Unknown error' };
    setState(prev => {
      const def = findDef(DJ_PORTALS, defId);
      if (!def) { result = { success: false, reason: `Portal "${defId}" not found.` }; return prev; }
      if (prev.level < def.minLevel) { result = { success: false, reason: `Requires level ${def.minLevel}.` }; return prev; }

      const xpMul = getXPMultiplier(prev);
      const coinMul = getCoinMultiplier(prev);
      const xp = Math.floor(def.xpReward * xpMul);
      const coins = Math.floor(def.coinReward * coinMul);

      const newPortals = prev.portals.map(p => {
        if (p.defId === defId) {
          return { ...p, unlocked: true, visits: p.visits + 1, lastVisit: Date.now() };
        }
        return p;
      });

      result = { success: true, reward: { xp, coins } };
      const newQuests = incrementQuestProgress(prev.quests, 'explore', 1, prev);
      const newState = {
        ...prev,
        portals: newPortals,
        xp: prev.xp + xp,
        coins: prev.coins + coins,
        totalCoinsEarned: prev.totalCoinsEarned + coins,
        totalPortalsOpened: prev.totalPortalsOpened + 1,
        quests: newQuests,
      };

      // Level up check
      let newLevel = newState.level;
      let newXp = newState.xp;
      while (newLevel < DJ_MAX_LEVEL && newXp >= xpForLevel(newLevel)) {
        newXp -= xpForLevel(newLevel);
        newLevel++;
      }
      newState.level = newLevel;
      newState.xp = newXp;

      const newAch = evaluateAchievements(newState);
      if (newAch.length > 0) {
        newState.achievements = [
          ...newAch.map(id => ({ defId: id, unlockedAt: Date.now() })),
          ...newState.achievements,
        ];
      }
      return newState;
    });
    return result;
  }, []);

  // ── djGetUnlockedPortals ───────────────────────────────────────────────────
  const djGetUnlockedPortals = useCallback(() => {
    const unlockedIds = new Set(state.portals.filter(p => p.unlocked).map(p => p.defId));
    return DJ_PORTALS.filter(p => unlockedIds.has(p.id));
  }, [state.portals]);

  // ── djGetPortalCost ────────────────────────────────────────────────────────
  const djGetPortalCost = useCallback((defId: string) => {
    const def = findDef(DJ_PORTALS, defId);
    return def?.cost ?? 0;
  }, []);

  // ── djGetMerchants ─────────────────────────────────────────────────────────
  const djGetMerchants = useCallback(() => [...DJ_MERCHANTS], []);

  // ── djTrade ────────────────────────────────────────────────────────────────
  const djTrade = useCallback((merchantId: string, spendAmount: number) => {
    let result: { success: boolean; reward?: { item: string; coins: number }; reason?: string } = { success: false, reason: 'Unknown error' };
    setState(prev => {
      const def = findDef(DJ_MERCHANTS, merchantId);
      if (!def) { result = { success: false, reason: `Merchant "${merchantId}" not found.` }; return prev; }
      if (prev.level < def.minLevel) { result = { success: false, reason: `Requires level ${def.minLevel}.` }; return prev; }
      if (spendAmount <= 0) { result = { success: false, reason: 'Must spend a positive amount.' }; return prev; }
      if (prev.coins < spendAmount) { result = { success: false, reason: `Need ${spendAmount} coins.` }; return prev; }

      const rep = prev.merchants[merchantId] ?? 0;
      const repDiscount = Math.min(0.3, rep * 0.02);
      const effectiveDiscount = def.discount + repDiscount;
      const rng = createPRNG(prev.seed + prev.totalTradesCompleted + 72727);

      // Generate trade reward based on merchant specialty
      const possibleItems = getTradeItems(def.specialty);
      const item = seededPick(rng, possibleItems);
      const baseValue = Math.floor(spendAmount * (1.1 + effectiveDiscount) * (0.8 + rng() * 0.4));
      const coinReturn = Math.floor(baseValue * 0.3);

      const newRep = rep + 1;
      const newMerchants = { ...prev.merchants, [merchantId]: newRep };

      result = { success: true, reward: { item, coins: coinReturn } };
      const newQuests = incrementQuestProgress(prev.quests, 'trade', 1, prev);
      return {
        ...prev,
        coins: prev.coins - spendAmount + coinReturn,
        merchants: newMerchants,
        totalTradesCompleted: prev.totalTradesCompleted + 1,
        totalCoinsEarned: prev.totalCoinsEarned + coinReturn,
        quests: newQuests,
      };
    });
    return result;
  }, []);

  // ── djGetMerchantReputation ────────────────────────────────────────────────
  const djGetMerchantReputation = useCallback((merchantId: string) => {
    return state.merchants[merchantId] ?? 0;
  }, [state.merchants]);

  // ── djGetQuests ────────────────────────────────────────────────────────────
  const djGetQuests = useCallback(() => [...DJ_QUESTS], []);

  // ── djGetActiveQuests ──────────────────────────────────────────────────────
  const djGetActiveQuests = useCallback(() => state.quests, [state.quests]);

  // ── djAcceptQuest ──────────────────────────────────────────────────────────
  const djAcceptQuest = useCallback((defId: string) => {
    let success = false;
    setState(prev => {
      const def = findDef(DJ_QUESTS, defId);
      if (!def) return prev;
      if (prev.level < def.minLevel) return prev;
      const existing = prev.quests.find(q => q.defId === defId);
      if (!existing || existing.accepted || existing.completed) return prev;
      success = true;
      return {
        ...prev,
        quests: prev.quests.map(q => q.defId === defId ? { ...q, accepted: true } : q),
      };
    });
    return success;
  }, []);

  // ── djCompleteQuest ────────────────────────────────────────────────────────
  const djCompleteQuest = useCallback((defId: string) => {
    let result: { success: boolean; reward?: { xp: number; coins: number }; reason?: string } = { success: false, reason: 'Unknown error' };
    setState(prev => {
      const active = prev.quests.find(q => q.defId === defId);
      if (!active || !active.accepted || !active.completed || active.claimed) {
        result = { success: false, reason: 'Quest cannot be claimed.' };
        return prev;
      }
      const def = findDef(DJ_QUESTS, defId);
      if (!def) { result = { success: false, reason: 'Quest def not found.' }; return prev; }

      result = { success: true, reward: { xp: def.xpReward, coins: def.coinReward } };
      const newState = {
        ...prev,
        quests: prev.quests.map(q => q.defId === defId ? { ...q, claimed: true } : q),
        coins: prev.coins + def.coinReward,
        totalCoinsEarned: prev.totalCoinsEarned + def.coinReward,
        totalQuestsCompleted: prev.totalQuestsCompleted + 1,
      };

      // Handle XP
      let newLevel = newState.level;
      let newXp = newState.xp + def.xpReward;
      while (newLevel < DJ_MAX_LEVEL && newXp >= xpForLevel(newLevel)) {
        newXp -= xpForLevel(newLevel);
        newLevel++;
      }
      newState.level = newLevel;
      newState.xp = newXp;

      const newAch = evaluateAchievements(newState);
      if (newAch.length > 0) {
        newState.achievements = [
          ...newAch.map(id => ({ defId: id, unlockedAt: Date.now() })),
          ...newState.achievements,
        ];
      }
      return newState;
    });
    return result;
  }, []);

  // ── djGetQuestProgress ─────────────────────────────────────────────────────
  const djGetQuestProgress = useCallback((defId: string) => {
    const active = state.quests.find(q => q.defId === defId);
    if (!active) return { progress: 0, target: 0 };
    const def = findDef(DJ_QUESTS, defId);
    return { progress: active.progress, target: def?.target ?? 0 };
  }, [state.quests]);

  // ── djGetAvailableQuests ───────────────────────────────────────────────────
  const djGetAvailableQuests = useCallback(() => {
    return DJ_QUESTS.filter(q => {
      if (state.level < q.minLevel) return false;
      const active = state.quests.find(aq => aq.defId === q.id);
      return !active || !active.accepted;
    });
  }, [state.level, state.quests]);

  // ── djGetAchievements ──────────────────────────────────────────────────────
  const djGetAchievements = useCallback(() => [...DJ_ACHIEVEMENTS], []);

  // ── djCheckAchievements ────────────────────────────────────────────────────
  const djCheckAchievements = useCallback(() => {
    const newOnes = evaluateAchievements(state);
    // Auto-unlock new achievements
    if (newOnes.length > 0) {
      setState(prev => {
        const existing = new Set(prev.achievements.map(a => a.defId));
        const toAdd = newOnes.filter(id => !existing.has(id));
        if (toAdd.length === 0) return prev;
        return {
          ...prev,
          achievements: [
            ...toAdd.map(id => ({ defId: id, unlockedAt: Date.now() })),
            ...prev.achievements,
          ],
        };
      });
    }
    return newOnes.map(id => ({ defId: id, unlockedAt: Date.now() }));
  }, [state]);

  // ── djGetUnlockedAchievements ──────────────────────────────────────────────
  const djGetUnlockedAchievements = useCallback(() => state.achievements, [state.achievements]);

  // ── djIsAchievementUnlocked ────────────────────────────────────────────────
  const djIsAchievementUnlocked = useCallback((defId: string) => {
    return state.achievements.some(a => a.defId === defId);
  }, [state.achievements]);

  // ── djGetDailyTask ─────────────────────────────────────────────────────────
  const djGetDailyTask = useCallback(() => {
    const today = dateHash();
    if (state.dailyTask && state.dailyTask.date === today) {
      return state.dailyTask;
    }
    // Generate new daily task for today
    return generateDailyTask(today, state.level);
  }, [state.dailyTask, state.level]);

  // ── djClaimDailyReward ─────────────────────────────────────────────────────
  const djClaimDailyReward = useCallback(() => {
    let result: { success: boolean; reward?: { xp: number; coins: number }; reason?: string } = { success: false, reason: 'No daily reward to claim.' };
    setState(prev => {
      const today = dateHash();
      const todaySeed = createPRNG(today * 31147);

      // Check streak
      let newStreak = prev.streak;
      if (isSameDay(prev.lastDaily, today)) {
        result = { success: false, reason: 'Already claimed today.' };
        return prev;
      }
      if (isYesterday(prev.lastDaily)) {
        newStreak = prev.streak + 1;
      } else if (prev.lastDaily !== null && !isSameDay(prev.lastDaily, today)) {
        newStreak = 1;
      } else {
        newStreak = 1;
      }

      const streakBonus = Math.min(newStreak * 0.1, 3);
      const baseXP = 50 + prev.level * 5;
      const baseCoins = 30 + prev.level * 3;
      const xpReward = Math.floor(baseXP * (1 + streakBonus) * (1 + todaySeed() * 0.3));
      const coinReward = Math.floor(baseCoins * (1 + streakBonus) * (1 + todaySeed() * 0.3));

      const dailyTask = generateDailyTask(today, prev.level);

      result = { success: true, reward: { xp: xpReward, coins: coinReward } };

      const newState = {
        ...prev,
        coins: prev.coins + coinReward,
        totalCoinsEarned: prev.totalCoinsEarned + coinReward,
        streak: newStreak,
        lastDaily: Date.now(),
        dailyTask,
      };

      // Apply XP with multiplier
      let newLevel = newState.level;
      let newXp = newState.xp + xpReward;
      while (newLevel < DJ_MAX_LEVEL && newXp >= xpForLevel(newLevel)) {
        newXp -= xpForLevel(newLevel);
        newLevel++;
      }
      newState.level = newLevel;
      newState.xp = newXp;

      // Update daily streak quest
      const newQuests = incrementQuestProgress(prev.quests, 'wish', 1, newState);

      const newAch = evaluateAchievements(newState);
      if (newAch.length > 0) {
        newState.achievements = [
          ...newAch.map(id => ({ defId: id, unlockedAt: Date.now() })),
          ...newState.achievements,
        ];
      }

      return { ...newState, quests: newQuests };
    });
    return result;
  }, []);

  // ── djUpdateDailyProgress ──────────────────────────────────────────────────
  const djUpdateDailyProgress = useCallback((amount: number) => {
    let newProgress = 0;
    setState(prev => {
      const today = dateHash();
      if (!prev.dailyTask || prev.dailyTask.date !== today) return prev;
      if (prev.dailyTask.claimed) return prev;
      const updated = Math.min(prev.dailyTask.progress + amount, prev.dailyTask.target);
      newProgress = updated;
      return {
        ...prev,
        dailyTask: { ...prev.dailyTask, progress: updated },
      };
    });
    return newProgress;
  }, []);

  // ── djCheckStreak ──────────────────────────────────────────────────────────
  const djCheckStreak = useCallback(() => {
    const today = dateHash();
    const isToday = isSameDay(state.lastDaily, today);
    return { streak: state.streak, isToday };
  }, [state.streak, state.lastDaily]);

  // ── djGetStreak ────────────────────────────────────────────────────────────
  const djGetStreak = useCallback(() => state.streak, [state.streak]);

  // ── djGetTotalStats ────────────────────────────────────────────────────────
  const djGetTotalStats = useCallback(() => ({
    totalWishesGranted: state.totalWishesGranted,
    totalDjinnsSummoned: state.totalDjinnsSummoned,
    totalPortalsOpened: state.totalPortalsOpened,
    totalTradesCompleted: state.totalTradesCompleted,
    totalArtifactsCollected: state.totalArtifactsCollected,
    totalQuestsCompleted: state.totalQuestsCompleted,
    totalCoinsEarned: state.totalCoinsEarned,
    ownedDjinns: state.djinns.length,
    upgradedZones: state.oasisZones.reduce((sum, z) => sum + z.level, 0),
    unlockedAchievements: state.achievements.length,
    currentStreak: state.streak,
  }), [state]);

  // ── djGetSummonCost ────────────────────────────────────────────────────────
  const djGetSummonCost = useCallback((defId: string) => {
    const def = findDef(DJ_DJINNS, defId);
    if (!def) return 0;
    const mul = getSummonMultiplier(state);
    return Math.max(1, Math.floor(def.summonCost * (1 - mul)));
  }, [state]);

  // ── djGetUpgradeCost ───────────────────────────────────────────────────────
  const djGetUpgradeCost = useCallback((defId: string, currentLevel: number) => {
    const def = findDef(DJ_OASIS_ZONES, defId);
    if (!def) return 0;
    return Math.floor(def.baseCost * Math.pow(1.6, currentLevel));
  }, []);

  // ── djGetNpcs ──────────────────────────────────────────────────────────────
  const djGetNpcs = useCallback(() => [...DJ_NPCS], []);

  // ── djTalkToNpc ────────────────────────────────────────────────────────────
  const djTalkToNpc = useCallback((npcId: string) => {
    const npc = findDef(DJ_NPCS, npcId);
    if (!npc) return '...';
    const rng = createPRNG(state.seed + npcId.length * 17);
    return seededPick(rng, npc.dialogues);
  }, [state.seed]);

  // ── djGetNpcDialogue ───────────────────────────────────────────────────────
  const djGetNpcDialogue = useCallback((npcId: string, index?: number) => {
    const npc = findDef(DJ_NPCS, npcId);
    if (!npc) return '...';
    if (index !== undefined && index >= 0 && index < npc.dialogues.length) {
      return npc.dialogues[index];
    }
    return npc.dialogues[0];
  }, []);

  // ── djPerformRitual ────────────────────────────────────────────────────────
  const djPerformRitual = useCallback(() => {
    const messages: string[] = [];
    let bonusXP = 0;
    let bonusCoins = 0;

    setState(prev => {
      const today = dateHash();
      if (isSameDay(prev.lastDaily, today)) {
        messages.push('Ritual already performed today. Come back tomorrow.');
        return prev;
      }

      const rng = createPRNG(today * 42139 + prev.level);
      const djinns = prev.djinns;
      const active = prev.activeDjinn ? djinns.find(d => d.defId === prev.activeDjinn) : null;

      // Base ritual bonus
      bonusXP = Math.floor(20 + prev.level * 3 + (rng() * 30));
      bonusCoins = Math.floor(15 + prev.level * 2 + (rng() * 25));

      messages.push('The sands shimmer as the ritual begins...');

      // Active djinn bonus
      if (active) {
        const def = findDef(DJ_DJINNS, active.defId);
        if (def) {
          bonusXP = Math.floor(bonusXP * (1 + active.loyalty / 100));
          bonusCoins = Math.floor(bonusCoins * (1 + active.loyalty / 100));
          messages.push(`${active.nickname || def.name} channels ${def.element} energy into the ritual!`);
        }
      }

      // Zone bonuses
      const activatedZones = prev.oasisZones.filter(z => z.activated);
      if (activatedZones.length > 0) {
        const zoneBonus = Math.min(activatedZones.length * 0.1, 0.8);
        bonusXP = Math.floor(bonusXP * (1 + zoneBonus));
        bonusCoins = Math.floor(bonusCoins * (1 + zoneBonus));
        messages.push(`${activatedZones.length} oasis zone(s) amplify the ritual!`);
      }

      // Loyalty boost for all djinns
      const loyaltyGain = seededInt(rng, 2, 5);
      const newDjinns = prev.djinns.map(d => ({
        ...d,
        loyalty: Math.min(100, d.loyalty + loyaltyGain),
        xp: d.xp + seededInt(rng, 5, 15),
      }));

      // XP and coins
      const xpMul = getXPMultiplier(prev);
      const coinMul = getCoinMultiplier(prev);
      bonusXP = Math.floor(bonusXP * xpMul);
      bonusCoins = Math.floor(bonusCoins * coinMul);

      messages.push(`Ritual complete! +${bonusXP} XP, +${bonusCoins} coins.`);

      // Rare event: find artifact
      const artifactChance = rng();
      if (artifactChance < 0.2) {
        const available = DJ_ARTIFACTS.filter(a => {
          const owned = prev.artifacts.find(oa => oa.defId === a.id);
          return !owned || owned.quantity < 3;
        });
        if (available.length > 0) {
          const found = seededPick(rng, available);
          bonusCoins += Math.floor(found.power * 5);
          messages.push(`✨ The ritual revealed the ${found.name}!`);
        }
      }

      // Rare event: djinn XP bonus
      if (rng() < 0.3 && newDjinns.length > 0) {
        const bonusTarget = seededPick(rng, newDjinns);
        messages.push(`${bonusTarget.nickname} resonates with the ritual and grows stronger!`);
      }

      const newState = {
        ...prev,
        djinns: newDjinns,
        coins: prev.coins + bonusCoins,
        totalCoinsEarned: prev.totalCoinsEarned + bonusCoins,
      };

      // Apply XP
      let newLevel = newState.level;
      let newXp = newState.xp + bonusXP;
      while (newLevel < DJ_MAX_LEVEL && newXp >= xpForLevel(newLevel)) {
        newXp -= xpForLevel(newLevel);
        newLevel++;
      }
      newState.level = newLevel;
      newState.xp = newXp;

      return newState;
    });

    return { success: true, bonusXP, bonusCoins, messages };
  }, []);

  // ── djGetRitualBonus ───────────────────────────────────────────────────────
  const djGetRitualBonus = useCallback(() => {
    const activeDjinn = state.activeDjinn ? state.djinns.find(d => d.defId === state.activeDjinn) : null;
    const loyaltyBonus = activeDjinn ? 1 + activeDjinn.loyalty / 100 : 1;
    const zoneCount = state.oasisZones.filter(z => z.activated).length;
    const zoneBonus = 1 + Math.min(zoneCount * 0.1, 0.8);
    const artifactBonus = 1 + getArtifactXPBonus(state);

    return {
      xpMultiplier: loyaltyBonus * zoneBonus * artifactBonus,
      coinMultiplier: loyaltyBonus * zoneBonus * getArtifactCoinBonus(state),
    };
  }, [state]);

  // ── djGetCompletionPercentage ──────────────────────────────────────────────
  const djGetCompletionPercentage = useCallback(() => {
    let total = 0;
    let completed = 0;

    // Djinns
    total += DJ_DJINNS.length;
    completed += state.djinns.length;

    // Zones
    total += DJ_OASIS_ZONES.length;
    completed += state.oasisZones.length;

    // Artifacts
    total += DJ_ARTIFACTS.length;
    completed += state.artifacts.filter(a => a.quantity > 0).length;

    // Portals
    total += DJ_PORTALS.length;
    completed += state.portals.filter(p => p.unlocked).length;

    // Achievements
    total += DJ_ACHIEVEMENTS.length;
    completed += state.achievements.length;

    // Quests
    total += DJ_QUESTS.length;
    completed += state.quests.filter(q => q.claimed).length;

    // Level
    total += 1;
    completed += state.level >= DJ_MAX_LEVEL ? 1 : 0;

    return Math.floor((completed / total) * 100);
  }, [state]);

  // ── djGetMultiplier ────────────────────────────────────────────────────────
  const djGetMultiplier = useCallback(() => {
    return {
      xp: getXPMultiplier(state),
      coins: getCoinMultiplier(state),
    };
  }, [state]);

  // ── djGetRecommendations ───────────────────────────────────────────────────
  const djGetRecommendations = useCallback(() => {
    const recs: string[] = [];

    // Suggest summoning based on owned elements
    const ownedElements = new Set(state.djinns.map(d => findDef(DJ_DJINNS, d.defId)?.element));
    const missingElements = DJ_DJINNS.filter(d => !ownedElements.has(d.element));
    if (missingElements.length > 0) {
      const cheapest = missingElements.sort((a, b) => a.summonCost - b.summonCost)[0];
      recs.push(`Summon the ${cheapest.name} to expand your elemental collection.`);
    }

    // Suggest zone upgrades
    const lowZones = state.oasisZones.filter(z => z.level < 3);
    if (lowZones.length > 0) {
      const zoneDef = findDef(DJ_OASIS_ZONES, lowZones[0].defId);
      if (zoneDef) recs.push(`Upgrade ${zoneDef.name} for better bonuses.`);
    }

    // Suggest unlocking zones
    const unlockable = DJ_OASIS_ZONES.filter(z => z.unlockLevel <= state.level && !state.oasisZones.some(oz => oz.defId === z.id));
    if (unlockable.length > 0) {
      recs.push(`${unlockable[0].name} is now available! Consider unlocking it.`);
    }

    // Suggest wish granting
    if (state.coins > 300) {
      recs.push('You have enough coins to grant powerful wishes.');
    }

    // Suggest portal exploration
    const unvisited = DJ_PORTALS.filter(p => p.minLevel <= state.level && !state.portals.find(op => op.defId === p.id && op.unlocked));
    if (unvisited.length > 0) {
      recs.push(`${unvisited.length} unexplored portal(s) await your discovery.`);
    }

    // Suggest daily ritual
    if (!isSameDay(state.lastDaily, dateHash())) {
      recs.push('Don\'t forget to perform the daily ritual for bonuses!');
    }

    // Suggest artifact equipping
    const unequipped = state.artifacts.filter(a => a.quantity > 0 && !a.equipped);
    if (unequipped.length > 0) {
      recs.push(`${unequipped.length} artifact(s) can be equipped for bonuses.`);
    }

    // Suggest quest completion
    const completable = state.quests.filter(q => q.accepted && q.completed && !q.claimed);
    if (completable.length > 0) {
      recs.push(`${completable.length} quest(s) have rewards ready to claim!`);
    }

    // Suggest active djinn if none
    if (!state.activeDjinn && state.djinns.length > 0) {
      recs.push('Set an active Djinn for ritual and wish bonuses.');
    }

    return recs;
  }, [state]);

  // ── djGetElementAffinity ───────────────────────────────────────────────────
  const djGetElementAffinity = useCallback(() => {
    const affinity: Record<DjinnElement, number> = {
      fire: 0, water: 0, earth: 0, wind: 0,
      shadow: 0, light: 0, time: 0, storm: 0,
    };
    for (const dj of state.djinns) {
      const def = findDef(DJ_DJINNS, dj.defId);
      if (def) {
        affinity[def.element] += dj.level * 10 + dj.loyalty;
      }
    }
    return affinity;
  }, [state.djinns]);

  // ═════════════════════════════════════════════════════════════════════════════
  // Internal multiplier helpers
  // ═════════════════════════════════════════════════════════════════════════════

  function getXPMultiplier(s: DjinnOasisState): number {
    let mul = 1;
    for (const zone of s.oasisZones) {
      const def = findDef(DJ_OASIS_ZONES, zone.defId);
      if (def && zone.level > 0) {
        mul += (def.xpMultiplier - 1) * zone.level * 0.15;
      }
    }
    mul += getArtifactXPBonus(s);
    return mul;
  }

  function getCoinMultiplier(s: DjinnOasisState): number {
    let mul = 1;
    for (const zone of s.oasisZones) {
      const def = findDef(DJ_OASIS_ZONES, zone.defId);
      if (def && zone.level > 0) {
        mul += (def.coinMultiplier - 1) * zone.level * 0.15;
      }
    }
    mul += getArtifactCoinBonus(s);
    return mul;
  }

  function getWishDiscountTotal(s: DjinnOasisState): number {
    let discount = 0;
    for (const zone of s.oasisZones) {
      const def = findDef(DJ_OASIS_ZONES, zone.defId);
      if (def && zone.level > 0) {
        discount += def.wishDiscount * zone.level * 0.12;
      }
    }
    return Math.min(discount, 0.5);
  }

  function getSummonMultiplier(s: DjinnOasisState): number {
    let bonus = 0;
    for (const zone of s.oasisZones) {
      const def = findDef(DJ_OASIS_ZONES, zone.defId);
      if (def && zone.level > 0) {
        bonus += def.summonBonus * zone.level * 0.12;
      }
    }
    return Math.min(bonus, 0.4);
  }

  function getArtifactXPBonus(s: DjinnOasisState): number {
    let bonus = 0;
    for (const a of s.artifacts) {
      if (!a.equipped || a.quantity <= 0) continue;
      const def = findDef(DJ_ARTIFACTS, a.defId);
      if (def) bonus += def.xpBonus;
    }
    return bonus;
  }

  function getArtifactCoinBonus(s: DjinnOasisState): number {
    let bonus = 0;
    for (const a of s.artifacts) {
      if (!a.equipped || a.quantity <= 0) continue;
      const def = findDef(DJ_ARTIFACTS, a.defId);
      if (def) bonus += def.coinBonus;
    }
    return bonus;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Internal: trade item pool
  // ═════════════════════════════════════════════════════════════════════════════

  function getTradeItems(specialty: string): string[] {
    const items: Record<string, string[]> = {
      'wish-boosts': ['Wish Amplifier', 'Desire Crystal', 'Lamp Oil', 'Wish Scroll', 'Fate Thread'],
      'knowledge': ['Ancient Scroll', 'Wisdom Elixir', 'Memory Shard', 'Prophecy Page', 'Rune Stone'],
      'portals': ['Portal Key', 'Dimension Shard', 'Rift Stone', 'Wayfinder Compass', 'Gate Crystal'],
      'artifacts': ['Polishing Cloth', 'Enchantment Dust', 'Restoration Kit', 'Appraisal Lens', 'Display Pedestal'],
      'tools': ['Sand Shovel', 'Dune Compass', 'Water Skin', 'Desert Cloak', 'Binding Rope'],
      'weapons': ['Scimitar Shard', 'Shield Fragment', 'Arrow Bundle', 'Blade Oil', 'Armor Patch'],
      'mystery': ['Mystery Box', 'Enigma Coin', 'Fortune Cookie', 'Shadow Essence', 'Riddle Scroll'],
      'luxury': ['Silk Robe', 'Golden Goblet', 'Incense Bundle', 'Gem-Studded Crown', 'Ivory Flute'],
    };
    return items[specialty] ?? ['Desert Trinket', 'Sand Rose', 'Copper Coin', 'Bone Charm', 'Dried Herb'];
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Return object
  // ═════════════════════════════════════════════════════════════════════════════

  return {
    state,
    djGetState,
    djResetState,
    djGetLevel,
    djGetXp,
    djGetTitle,
    djGetProgress,
    djGetProgressToNextLevel,
    djAddXP,
    djGetCoins,
    djAddCoins,
    djSpendCoins,
    djGetDjinns,
    djGetActiveDjinn,
    djSetActiveDjinn,
    djSummonDjinn,
    djGetDjinnPower,
    djGetDjinnByElement,
    djGetWishes,
    djGrantWish,
    djGetWishHistory,
    djGetWishesByCategory,
    djCalculateWishCost,
    djGetOasisZones,
    djUpgradeZone,
    djGetZoneBonus,
    djIsZoneUnlocked,
    djGetArtifacts,
    djCollectArtifact,
    djEquipArtifact,
    djGetArtifactBonus,
    djGetPortals,
    djOpenPortal,
    djGetUnlockedPortals,
    djGetPortalCost,
    djGetMerchants,
    djTrade,
    djGetMerchantReputation,
    djGetQuests,
    djGetActiveQuests,
    djAcceptQuest,
    djCompleteQuest,
    djGetQuestProgress,
    djGetAvailableQuests,
    djGetAchievements,
    djCheckAchievements,
    djGetUnlockedAchievements,
    djIsAchievementUnlocked,
    djGetDailyTask,
    djClaimDailyReward,
    djUpdateDailyProgress,
    djCheckStreak,
    djGetStreak,
    djGetTotalStats,
    djGetSummonCost,
    djGetUpgradeCost,
    djGetNpcs,
    djTalkToNpc,
    djGetNpcDialogue,
    djPerformRitual,
    djGetRitualBonus,
    djGetCompletionPercentage,
    djGetMultiplier,
    djGetRecommendations,
    djGetElementAffinity,
  };
}

export default useDjinnOasis;
