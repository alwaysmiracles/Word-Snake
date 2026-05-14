// ============================================================
// Blood Diamond Wire — 血钻矿脉
// A diamond mining, cutting, polishing, and trading game engine.
// All named exports use the `bd` prefix.
// React appears ONLY in the default-export hook (no named export
// function calls any React API).
// ============================================================

import { useState, useCallback } from 'react';

// ------------------------------------------------------------
// 1. Type Aliases
// ------------------------------------------------------------

export type GemType =
  | 'white'
  | 'blue'
  | 'yellow'
  | 'pink'
  | 'red'
  | 'black'
  | 'blood'
  | 'green'
  | 'champagne'
  | 'cognac'
  | 'violet'
  | 'gray';

export type CutStyle = 'brilliant' | 'princess' | 'emerald' | 'marquise' | 'cushion';

export type ClarityGrade = 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI';

export type PolishStage = 0 | 1 | 2 | 3 | 4;

export type MarketTrend = 'up' | 'down' | 'stable';

// ------------------------------------------------------------
// 2. Interfaces
// ------------------------------------------------------------

export interface GemItem {
  id: string;
  type: GemType;
  carat: number;
  clarity: ClarityGrade;
  cut: CutStyle | null;
  polishStage: PolishStage;
  baseValue: number;
  isBloodDiamond: boolean;
  minedAtShaft: number;
  minedAtTick: number;
}

export interface JewelryItem {
  id: string;
  name: string;
  gemIds: string[];
  totalCarat: number;
  baseValue: number;
  craftedAtTick: number;
}

export interface VIPClient {
  id: string;
  name: string;
  title: string;
  preferredTypes: GemType[];
  minClarity: ClarityGrade;
  minCarat: number;
  rewardMultiplier: number;
  lastFulfilledDay: number;
  cooldownDays: number;
  active: boolean;
}

export interface MineShaft {
  id: number;
  name: string;
  depthMeters: number;
  unlockLevel: number;
  gemWeights: Record<string, number>;
  baseYield: number;
  maxCarat: number;
  description: string;
  dangerLevel: number; // 0-10
}

export interface JewelryRecipe {
  id: string;
  name: string;
  description: string;
  requiredGems: Array<{
    type: GemType | 'any';
    count: number;
    minPolish: number;
    minClarity?: ClarityGrade;
  }>;
  valueMultiplier: number;
  unlockLevel: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  rewardCoins: number;
}

export interface MineUpgradeDef {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costScale: number;
}

export interface SwingResult {
  quality: number;
  isCritical: boolean;
  isFumble: boolean;
}

export interface AppraisalResult {
  colorScore: number;
  cutScore: number;
  clarityScore: number;
  caratScore: number;
  totalValue: number;
  grade: string;
  description: string;
}

export interface BloodDiamondState {
  // --- Core player stats ---
  level: number;
  xp: number;
  coins: number;

  // --- Lifetime counters ---
  totalMined: number;
  totalPolished: number;
  totalSold: number;
  totalCoinsEarned: number;
  totalCaratsMined: number;
  bloodDiamondsFound: number;
  gemsCutCount: number;
  jewelryCraftedCount: number;
  vipOrdersFulfilled: number;

  // --- Mining ---
  activeShaft: number;
  pickaxeLevel: number;
  lanternLevel: number;
  cartLevel: number;
  luckLevel: number;
  fortuneLevel: number;

  // --- Collections ---
  inventory: GemItem[];
  polishedGems: GemItem[];
  jewelryCrafted: JewelryItem[];

  // --- Mine upgrades ---
  mineUpgrades: Record<string, number>;

  // --- Daily system ---
  dailyVeinDiscovered: boolean;
  dailyVeinGems: GemItem[];
  lastVeinDay: number;
  day: number;
  streak: number;

  // --- Market ---
  marketTick: number;
  marketPrices: Record<string, number>;

  // --- VIP ---
  vipClients: VIPClient[];

  // --- Achievements ---
  achievements: string[];

  // --- Internal ID counter ---
  nextId: number;
}

// ------------------------------------------------------------
// 3. Constants — Gem Types (12)
// ------------------------------------------------------------

export const BD_GEM_TYPES: Array<{
  id: GemType;
  name: string;
  rarity: number;
  baseValue: number;
  color: string;
}> = [
  { id: 'white', name: 'White Diamond', rarity: 1.0, baseValue: 100, color: '#ffffff' },
  { id: 'blue', name: 'Blue Diamond', rarity: 0.30, baseValue: 500, color: '#4488ff' },
  { id: 'yellow', name: 'Yellow Diamond', rarity: 0.50, baseValue: 300, color: '#ffdd00' },
  { id: 'pink', name: 'Pink Diamond', rarity: 0.20, baseValue: 800, color: '#ff88aa' },
  { id: 'red', name: 'Red Diamond', rarity: 0.10, baseValue: 1200, color: '#ff2200' },
  { id: 'black', name: 'Black Diamond', rarity: 0.15, baseValue: 600, color: '#333333' },
  { id: 'blood', name: 'Blood Diamond', rarity: 0.02, baseValue: 5000, color: '#990000' },
  { id: 'green', name: 'Green Diamond', rarity: 0.25, baseValue: 400, color: '#44cc44' },
  { id: 'champagne', name: 'Champagne Diamond', rarity: 0.40, baseValue: 250, color: '#f5deb3' },
  { id: 'cognac', name: 'Cognac Diamond', rarity: 0.35, baseValue: 350, color: '#8b4513' },
  { id: 'violet', name: 'Violet Diamond', rarity: 0.08, baseValue: 1500, color: '#8800ff' },
  { id: 'gray', name: 'Gray Diamond', rarity: 0.60, baseValue: 150, color: '#999999' },
];

// ------------------------------------------------------------
// 4. Constants — Cut Styles (5)
// ------------------------------------------------------------

export const BD_CUT_STYLES: Array<{
  id: CutStyle;
  name: string;
  multiplier: number;
  difficulty: number;
}> = [
  { id: 'brilliant', name: 'Brilliant Round', multiplier: 1.0, difficulty: 1 },
  { id: 'princess', name: 'Princess', multiplier: 0.95, difficulty: 2 },
  { id: 'emerald', name: 'Emerald', multiplier: 0.90, difficulty: 1 },
  { id: 'marquise', name: 'Marquise', multiplier: 1.08, difficulty: 3 },
  { id: 'cushion', name: 'Cushion', multiplier: 0.88, difficulty: 2 },
];

// ------------------------------------------------------------
// 5. Constants — Clarity Grades (6)
// ------------------------------------------------------------

export const BD_CLARITY_GRADES: Array<{
  id: ClarityGrade;
  name: string;
  multiplier: number;
  weight: number;
}> = [
  { id: 'IF', name: 'Internally Flawless', multiplier: 2.0, weight: 0.05 },
  { id: 'VVS1', name: 'Very Very Slightly Included 1', multiplier: 1.70, weight: 0.10 },
  { id: 'VVS2', name: 'Very Very Slightly Included 2', multiplier: 1.50, weight: 0.15 },
  { id: 'VS1', name: 'Very Slightly Included 1', multiplier: 1.30, weight: 0.25 },
  { id: 'VS2', name: 'Very Slightly Included 2', multiplier: 1.15, weight: 0.25 },
  { id: 'SI', name: 'Slightly Included', multiplier: 1.00, weight: 0.20 },
];

// ------------------------------------------------------------
// 6. Constants — Mine Shafts (8)
// ------------------------------------------------------------

export const BD_MINE_SHAFTS: MineShaft[] = [
  {
    id: 0,
    name: 'Surface Quarry',
    depthMeters: 10,
    unlockLevel: 1,
    gemWeights: { white: 40, gray: 30, champagne: 20, yellow: 10 },
    baseYield: 2,
    maxCarat: 2.0,
    description: 'A sunlit quarry with common gems near the surface.',
    dangerLevel: 0,
  },
  {
    id: 1,
    name: 'Crystal Cavern',
    depthMeters: 80,
    unlockLevel: 5,
    gemWeights: { white: 20, blue: 15, yellow: 20, gray: 15, green: 15, champagne: 15 },
    baseYield: 3,
    maxCarat: 3.0,
    description: 'Shimmering crystals line these underground passages.',
    dangerLevel: 1,
  },
  {
    id: 2,
    name: 'Obsidian Tunnel',
    depthMeters: 200,
    unlockLevel: 10,
    gemWeights: { black: 20, white: 15, cognac: 15, yellow: 15, pink: 10, gray: 10, green: 15 },
    baseYield: 4,
    maxCarat: 4.5,
    description: 'Dark volcanic glass walls conceal hidden treasures.',
    dangerLevel: 2,
  },
  {
    id: 3,
    name: 'Ruby Depths',
    depthMeters: 400,
    unlockLevel: 16,
    gemWeights: { red: 20, pink: 20, white: 10, blue: 10, violet: 10, green: 15, champagne: 15 },
    baseYield: 5,
    maxCarat: 5.5,
    description: 'A crimson-lit cavern where red gems glow in the dark.',
    dangerLevel: 3,
  },
  {
    id: 4,
    name: 'Sapphire Abyss',
    depthMeters: 650,
    unlockLevel: 22,
    gemWeights: { blue: 25, violet: 15, white: 10, green: 15, pink: 10, cognac: 10, black: 15 },
    baseYield: 6,
    maxCarat: 7.0,
    description: 'An underground lake of sapphire-tinted water.',
    dangerLevel: 5,
  },
  {
    id: 5,
    name: 'Emerald Grotto',
    depthMeters: 900,
    unlockLevel: 29,
    gemWeights: { green: 25, blue: 15, yellow: 15, white: 10, pink: 10, cognac: 10, red: 5, violet: 10 },
    baseYield: 7,
    maxCarat: 8.0,
    description: 'Bioluminescent moss illuminates rare green stones.',
    dangerLevel: 6,
  },
  {
    id: 6,
    name: 'Diamond Heart',
    depthMeters: 1200,
    unlockLevel: 37,
    gemWeights: { white: 15, blue: 15, pink: 15, red: 10, green: 10, violet: 10, black: 10, champagne: 15 },
    baseYield: 8,
    maxCarat: 10.0,
    description: 'The mythical core where the rarest diamonds form.',
    dangerLevel: 8,
  },
  {
    id: 7,
    name: 'Magma Core',
    depthMeters: 1500,
    unlockLevel: 45,
    gemWeights: { blood: 5, red: 15, black: 15, violet: 10, blue: 10, pink: 10, white: 10, green: 10, cognac: 15 },
    baseYield: 10,
    maxCarat: 12.0,
    description: 'The deepest shaft where blood diamonds occasionally appear.',
    dangerLevel: 10,
  },
];

// ------------------------------------------------------------
// 7. Constants — Jewelry Recipes (6)
// ------------------------------------------------------------

export const BD_JEWELRY_RECIPES: JewelryRecipe[] = [
  {
    id: 'pendant',
    name: 'Diamond Pendant',
    description: 'A simple yet elegant pendant featuring a single gem.',
    requiredGems: [{ type: 'any', count: 1, minPolish: 3 }],
    valueMultiplier: 1.5,
    unlockLevel: 1,
  },
  {
    id: 'bracelet',
    name: 'Tennis Bracelet',
    description: 'A bracelet of five matching gems in a row.',
    requiredGems: [{ type: 'any', count: 5, minPolish: 2, minClarity: 'VS2' }],
    valueMultiplier: 2.5,
    unlockLevel: 8,
  },
  {
    id: 'engagement_ring',
    name: 'Engagement Ring',
    description: 'A flawless gem set in a gold band.',
    requiredGems: [{ type: 'any', count: 1, minPolish: 4, minClarity: 'IF' }],
    valueMultiplier: 4.0,
    unlockLevel: 15,
  },
  {
    id: 'crown',
    name: 'Royal Crown',
    description: 'Eight gems of various types set in a regal crown.',
    requiredGems: [{ type: 'any', count: 8, minPolish: 3, minClarity: 'VS1' }],
    valueMultiplier: 5.0,
    unlockLevel: 25,
  },
  {
    id: 'earrings',
    name: 'Chandelier Earrings',
    description: 'Two matching gems forming elegant drop earrings.',
    requiredGems: [{ type: 'any', count: 2, minPolish: 3, minClarity: 'VVS2' }],
    valueMultiplier: 3.0,
    unlockLevel: 12,
  },
  {
    id: 'necklace',
    name: 'Statement Necklace',
    description: 'Three distinct gems forming a bold centerpiece.',
    requiredGems: [{ type: 'any', count: 3, minPolish: 4, minClarity: 'VS1' }],
    valueMultiplier: 3.5,
    unlockLevel: 20,
  },
];

// ------------------------------------------------------------
// 8. Constants — VIP Clients (8)
// ------------------------------------------------------------

export const BD_VIP_CLIENTS: VIPClient[] = [
  {
    id: 'duchess',
    name: 'Duchess of Monaco',
    title: 'Royalty',
    preferredTypes: ['white', 'blue', 'pink'],
    minClarity: 'VVS1',
    minCarat: 2.0,
    rewardMultiplier: 2.5,
    lastFulfilledDay: -10,
    cooldownDays: 5,
    active: false,
  },
  {
    id: 'sheikh',
    name: 'Sheikh Al-Rashid',
    title: 'Oil Baron',
    preferredTypes: ['yellow', 'champagne', 'cognac'],
    minClarity: 'VS1',
    minCarat: 3.0,
    rewardMultiplier: 2.0,
    lastFulfilledDay: -10,
    cooldownDays: 4,
    active: false,
  },
  {
    id: 'lady',
    name: 'Lady Kensington',
    title: 'Socialite',
    preferredTypes: ['pink', 'violet', 'green'],
    minClarity: 'VVS2',
    minCarat: 1.5,
    rewardMultiplier: 2.2,
    lastFulfilledDay: -10,
    cooldownDays: 6,
    active: false,
  },
  {
    id: 'emperor',
    name: 'Emperor Tanaka',
    title: 'Industrialist',
    preferredTypes: ['black', 'blue', 'white'],
    minClarity: 'IF',
    minCarat: 4.0,
    rewardMultiplier: 3.5,
    lastFulfilledDay: -10,
    cooldownDays: 8,
    active: false,
  },
  {
    id: 'baroness',
    name: 'Baroness Von Stein',
    title: 'Collector',
    preferredTypes: ['green', 'cognac', 'champagne'],
    minClarity: 'VS2',
    minCarat: 1.0,
    rewardMultiplier: 1.8,
    lastFulfilledDay: -10,
    cooldownDays: 3,
    active: false,
  },
  {
    id: 'prince',
    name: 'Prince Adebayo',
    title: 'Diplomat',
    preferredTypes: ['red', 'blood', 'violet'],
    minClarity: 'VVS1',
    minCarat: 2.5,
    rewardMultiplier: 3.0,
    lastFulfilledDay: -10,
    cooldownDays: 7,
    active: false,
  },
  {
    id: 'madame',
    name: 'Madame Fontaine',
    title: 'Fashion Icon',
    preferredTypes: ['pink', 'white', 'blue'],
    minClarity: 'VS1',
    minCarat: 1.8,
    rewardMultiplier: 2.0,
    lastFulfilledDay: -10,
    cooldownDays: 4,
    active: false,
  },
  {
    id: 'lord',
    name: 'Lord Blackwood',
    title: 'Mystery Baron',
    preferredTypes: ['black', 'blood', 'red'],
    minClarity: 'VVS2',
    minCarat: 3.0,
    rewardMultiplier: 4.0,
    lastFulfilledDay: -10,
    cooldownDays: 10,
    active: false,
  },
];

// ------------------------------------------------------------
// 9. Constants — Achievements (15)
// ------------------------------------------------------------

export const BD_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_spark', name: 'First Spark', description: 'Mine your first gem.', icon: '💎', rewardCoins: 50 },
  { id: 'hundred_carats', name: 'Hundred Carats', description: 'Mine 100 total carats.', icon: '⚖️', rewardCoins: 200 },
  { id: 'thousand_carats', name: 'Thousand Carats', description: 'Mine 1,000 total carats.', icon: '🏔️', rewardCoins: 1000 },
  { id: 'gemologist', name: 'Gemologist', description: 'Mine 50 gems total.', icon: '🔬', rewardCoins: 300 },
  { id: 'master_cutter', name: 'Master Cutter', description: 'Cut 25 gems.', icon: '✂️', rewardCoins: 500 },
  { id: 'flawless_find', name: 'Flawless Find', description: 'Find an IF clarity gem.', icon: '✨', rewardCoins: 800 },
  { id: 'blood_hunter', name: 'Blood Hunter', description: 'Find a blood diamond.', icon: '🩸', rewardCoins: 2000 },
  { id: 'market_tycoon', name: 'Market Tycoon', description: 'Earn 100,000 coins total.', icon: '💰', rewardCoins: 5000 },
  { id: 'jeweler_apprentice', name: "Jeweler's Apprentice", description: 'Craft your first jewelry.', icon: '💍', rewardCoins: 400 },
  { id: 'vip_favorite', name: 'VIP Favorite', description: 'Fulfill 10 VIP orders.', icon: '👑', rewardCoins: 3000 },
  { id: 'deep_diver', name: 'Deep Diver', description: 'Unlock all mine shafts.', icon: '🕳️', rewardCoins: 5000 },
  { id: 'polish_perfection', name: 'Polish Perfection', description: 'Polish 100 gems to max.', icon: '🪞', rewardCoins: 1500 },
  { id: 'streak_master', name: 'Streak Master', description: 'Maintain a 7-day streak.', icon: '🔥', rewardCoins: 2000 },
  { id: 'diamond_empire', name: 'Diamond Empire', description: 'Accumulate 1,000,000 coins total.', icon: '🏰', rewardCoins: 20000 },
  { id: 'legendary_miner', name: 'Legendary Miner', description: 'Reach level 50.', icon: '⭐', rewardCoins: 10000 },
];

// ------------------------------------------------------------
// 10. Constants — Mine Upgrades (5)
// ------------------------------------------------------------

export const BD_MINE_UPGRADES: MineUpgradeDef[] = [
  {
    id: 'pickaxe',
    name: 'Titanium Pickaxe',
    description: 'Increases base mining yield per swing.',
    maxLevel: 20,
    baseCost: 100,
    costScale: 1.6,
  },
  {
    id: 'lantern',
    name: 'Enchanted Lantern',
    description: 'Reveals rarer gems and improves clarity odds.',
    maxLevel: 15,
    baseCost: 200,
    costScale: 1.7,
  },
  {
    id: 'cart',
    name: 'Mining Cart',
    description: 'Increases maximum carat size found.',
    maxLevel: 15,
    baseCost: 150,
    costScale: 1.5,
  },
  {
    id: 'luck',
    name: 'Fortune Charm',
    description: 'Increases rare gem and blood diamond chance.',
    maxLevel: 10,
    baseCost: 500,
    costScale: 2.0,
  },
  {
    id: 'fortune',
    name: 'Fortune Amplifier',
    description: 'Amplifies all bonus multipliers during mining.',
    maxLevel: 10,
    baseCost: 800,
    costScale: 2.2,
  },
];

// ------------------------------------------------------------
// 11. Constants — Polish Stage Labels
// ------------------------------------------------------------

export const BD_POLISH_LABELS: string[] = [
  'Rough',
  'Coarse Polish',
  'Fine Polish',
  'Mirror Finish',
  'Flawless Shine',
];

// ------------------------------------------------------------
// 12. Internal Utilities (not exported)
// ------------------------------------------------------------

/** Deterministic pseudo-random from a seed in [0, 1). */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/** Weighted random pick from an entries array of [key, weight]. */
function weightedPick(entries: [string, number][], seed: number): string {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = seededRandom(seed) * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

/** Clamp a number between min and max. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Round a number to a given number of decimal places. */
function roundTo(value: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

/** Generate a unique gem ID from the state counter. */
function nextGemId(state: BloodDiamondState): string {
  return `gem-${state.nextId}`;
}

/** Generate a unique jewelry ID from the state counter. */
function nextJewelryId(state: BloodDiamondState): string {
  return `jewel-${state.nextId}`;
}

/** Increment the nextId counter on state (immutable). */
function incrementNextId(state: BloodDiamondState): BloodDiamondState {
  return { ...state, nextId: state.nextId + 1 };
}

// ------------------------------------------------------------
// 13. State Creation
// ------------------------------------------------------------

/** Build the initial default market prices from gem type base values. */
function buildInitialMarketPrices(): Record<string, number> {
  const prices: Record<string, number> = {};
  for (const g of BD_GEM_TYPES) {
    prices[g.id] = g.baseValue;
  }
  return prices;
}

/** Create a fresh BloodDiamondState with sensible defaults. */
export function bdCreateInitialState(): BloodDiamondState {
  return {
    level: 1,
    xp: 0,
    coins: 500,
    totalMined: 0,
    totalPolished: 0,
    totalSold: 0,
    totalCoinsEarned: 500,
    totalCaratsMined: 0,
    bloodDiamondsFound: 0,
    gemsCutCount: 0,
    jewelryCraftedCount: 0,
    vipOrdersFulfilled: 0,
    activeShaft: 0,
    pickaxeLevel: 0,
    lanternLevel: 0,
    cartLevel: 0,
    luckLevel: 0,
    fortuneLevel: 0,
    inventory: [],
    polishedGems: [],
    jewelryCrafted: [],
    mineUpgrades: {
      pickaxe: 0,
      lantern: 0,
      cart: 0,
      luck: 0,
      fortune: 0,
    },
    dailyVeinDiscovered: false,
    dailyVeinGems: [],
    lastVeinDay: 0,
    day: 1,
    streak: 0,
    marketTick: 0,
    marketPrices: buildInitialMarketPrices(),
    vipClients: BD_VIP_CLIENTS.map((c) => ({ ...c })),
    achievements: [],
    nextId: 1,
  };
}

/** Shallow-clone the state (for immutable updates). */
export function bdCloneState(state: BloodDiamondState): BloodDiamondState {
  return {
    ...state,
    inventory: [...state.inventory],
    polishedGems: [...state.polishedGems],
    jewelryCrafted: [...state.jewelryCrafted],
    dailyVeinGems: [...state.dailyVeinGems],
    vipClients: state.vipClients.map((c) => ({ ...c })),
    mineUpgrades: { ...state.mineUpgrades },
    marketPrices: { ...state.marketPrices },
    achievements: [...state.achievements],
  };
}

// ------------------------------------------------------------
// 14. Core Getters
// ------------------------------------------------------------

export function bdGetLevel(state: BloodDiamondState): number {
  return state.level;
}

export function bdGetXP(state: BloodDiamondState): number {
  return state.xp;
}

export function bdGetCoins(state: BloodDiamondState): number {
  return state.coins;
}

export function bdGetTotalMined(state: BloodDiamondState): number {
  return state.totalMined;
}

export function bdGetTotalPolished(state: BloodDiamondState): number {
  return state.totalPolished;
}

export function bdGetTotalSold(state: BloodDiamondState): number {
  return state.totalSold;
}

export function bdGetTotalCoinsEarned(state: BloodDiamondState): number {
  return state.totalCoinsEarned;
}

export function bdGetTotalCaratsMined(state: BloodDiamondState): number {
  return roundTo(state.totalCaratsMined, 2);
}

export function bdGetBloodDiamondsFound(state: BloodDiamondState): number {
  return state.bloodDiamondsFound;
}

export function bdGetGemsCutCount(state: BloodDiamondState): number {
  return state.gemsCutCount;
}

export function bdGetJewelryCraftedCount(state: BloodDiamondState): number {
  return state.jewelryCraftedCount;
}

export function bdGetVipOrdersFulfilled(state: BloodDiamondState): number {
  return state.vipOrdersFulfilled;
}

export function bdGetActiveShaft(state: BloodDiamondState): number {
  return state.activeShaft;
}

export function bdGetDay(state: BloodDiamondState): number {
  return state.day;
}

export function bdGetStreak(state: BloodDiamondState): number {
  return state.streak;
}

export function bdGetMarketTick(state: BloodDiamondState): number {
  return state.marketTick;
}

export function bdGetInventory(state: BloodDiamondState): GemItem[] {
  return state.inventory;
}

export function bdGetPolishedGems(state: BloodDiamondState): GemItem[] {
  return state.polishedGems;
}

export function bdGetJewelry(state: BloodDiamondState): JewelryItem[] {
  return state.jewelryCrafted;
}

export function bdGetInventoryCount(state: BloodDiamondState): number {
  return state.inventory.length;
}

export function bdGetPolishedCount(state: BloodDiamondState): number {
  return state.polishedGems.length;
}

export function bdGetJewelryCount(state: BloodDiamondState): number {
  return state.jewelryCrafted.length;
}

// ------------------------------------------------------------
// 15. Shaft Getters & Selection
// ------------------------------------------------------------

export function bdGetAllShafts(): MineShaft[] {
  return BD_MINE_SHAFTS;
}

export function bdGetShaftInfo(shaftId: number): MineShaft | undefined {
  return BD_MINE_SHAFTS.find((s) => s.id === shaftId);
}

export function bdGetShaftDepth(shaftId: number): number {
  return BD_MINE_SHAFTS[shaftId]?.depthMeters ?? 0;
}

export function bdGetShaftUnlockLevel(shaftId: number): number {
  return BD_MINE_SHAFTS[shaftId]?.unlockLevel ?? 999;
}

export function bdIsShaftUnlocked(state: BloodDiamondState, shaftId: number): boolean {
  return state.level >= bdGetShaftUnlockLevel(shaftId);
}

export function bdGetUnlockedShafts(state: BloodDiamondState): MineShaft[] {
  return BD_MINE_SHAFTS.filter((s) => state.level >= s.unlockLevel);
}

export function bdSetActiveShaft(state: BloodDiamondState, shaftId: number): BloodDiamondState {
  if (!bdIsShaftUnlocked(state, shaftId)) return state;
  return { ...state, activeShaft: shaftId };
}

export function bdGetShaftGemWeights(shaftId: number): Record<string, number> {
  return BD_MINE_SHAFTS[shaftId]?.gemWeights ?? {};
}

// ------------------------------------------------------------
// 16. Gem Type Lookups
// ------------------------------------------------------------

export function bdGetGemTypes(): typeof BD_GEM_TYPES {
  return BD_GEM_TYPES;
}

export function bdGetGemRarity(gemType: GemType): number {
  return BD_GEM_TYPES.find((g) => g.id === gemType)?.rarity ?? 1.0;
}

export function bdGetGemBaseValue(gemType: GemType): number {
  return BD_GEM_TYPES.find((g) => g.id === gemType)?.baseValue ?? 100;
}

export function bdGetGemName(gemType: GemType): string {
  return BD_GEM_TYPES.find((g) => g.id === gemType)?.name ?? gemType;
}

export function bdGetGemColor(gemType: GemType): string {
  return BD_GEM_TYPES.find((g) => g.id === gemType)?.color ?? '#ffffff';
}

export function bdIsBloodDiamond(gem: GemItem): boolean {
  return gem.type === 'blood' || gem.isBloodDiamond;
}

export function bdGetGemDescription(gem: GemItem): string {
  const typeName = bdGetGemName(gem.type);
  const cutStr = gem.cut ? ` (${gem.cut})` : '';
  const polishStr = BD_POLISH_LABELS[gem.polishStage];
  return `${typeName}${cutStr} — ${gem.clarity} clarity, ${gem.carat}ct, ${polishStr}`;
}

// ------------------------------------------------------------
// 17. Cut Style Lookups
// ------------------------------------------------------------

export function bdGetCutStyles(): typeof BD_CUT_STYLES {
  return BD_CUT_STYLES;
}

export function bdGetCutMultiplier(cut: CutStyle): number {
  return BD_CUT_STYLES.find((c) => c.id === cut)?.multiplier ?? 1.0;
}

export function bdGetCutDifficulty(cut: CutStyle): number {
  return BD_CUT_STYLES.find((c) => c.id === cut)?.difficulty ?? 1;
}

export function bdGetBestCutForValue(gem: GemItem): CutStyle {
  // Higher multiplier = better value; difficulty matters for success.
  // Rank by multiplier as a simple heuristic.
  const sorted = [...BD_CUT_STYLES].sort((a, b) => b.multiplier - a.multiplier);
  return sorted[0].id;
}

// ------------------------------------------------------------
// 18. Clarity Lookups
// ------------------------------------------------------------

export function bdGetClarityGrades(): typeof BD_CLARITY_GRADES {
  return BD_CLARITY_GRADES;
}

export function bdGetClarityMultiplier(clarity: ClarityGrade): number {
  return BD_CLARITY_GRADES.find((c) => c.id === clarity)?.multiplier ?? 1.0;
}

export function bdGetClarityName(clarity: ClarityGrade): string {
  return BD_CLARITY_GRADES.find((c) => c.id === clarity)?.name ?? clarity;
}

export function bdIsClarityAtLeast(grade: ClarityGrade, minimum: ClarityGrade): boolean {
  const order: ClarityGrade[] = ['SI', 'VS2', 'VS1', 'VVS2', 'VVS1', 'IF'];
  return order.indexOf(grade) >= order.indexOf(minimum);
}

// ------------------------------------------------------------
// 19. Polish Stage Lookups
// ------------------------------------------------------------

export function bdGetPolishLabels(): string[] {
  return BD_POLISH_LABELS;
}

export function bdGetPolishLabel(stage: PolishStage): string {
  return BD_POLISH_LABELS[stage] ?? 'Unknown';
}

export function bdIsFullyPolished(gem: GemItem): boolean {
  return gem.polishStage === 4;
}

export function bdGetPolishProgress(gem: GemItem): number {
  return gem.polishStage / 4;
}

// ------------------------------------------------------------
// 20. Swing / Mining Mini-Game
// ------------------------------------------------------------

/**
 * Evaluate a pickaxe swing timing.
 * @param timing Normalised 0–1 value representing when the player swung.
 *   0.5 is the perfect "sweet spot".
 * @returns A SwingResult with quality multiplier and flags.
 */
export function bdEvaluateSwing(timing: number): SwingResult {
  const t = clamp(timing, 0, 1);
  const distance = Math.abs(t - 0.5); // 0 = perfect, 0.5 = worst

  if (distance < 0.05) {
    return { quality: 2.0, isCritical: true, isFumble: false };
  }
  if (distance < 0.12) {
    return { quality: 1.5, isCritical: false, isFumble: false };
  }
  if (distance < 0.25) {
    return { quality: 1.0, isCritical: false, isFumble: false };
  }
  if (distance < 0.40) {
    return { quality: 0.7, isCritical: false, isFumble: false };
  }
  return { quality: 0.3, isCritical: false, isFumble: true };
}

/** Get the sweet-spot range for the swing mini-game. */
export function bdGetSwingSweetSpot(): { min: number; max: number } {
  return { min: 0.38, max: 0.62 };
}

// ------------------------------------------------------------
// 21. Clarity Generation
// ------------------------------------------------------------

/** Generate a random clarity grade, biased by lantern upgrade. */
function generateClarity(state: BloodDiamondState, seed: number): ClarityGrade {
  const lanternBonus = state.lanternLevel * 0.03; // +3 % per level toward better grades
  const adjustedWeights = BD_CLARITY_GRADES.map((g, i) => {
    const bonus = lanternBonus * (BD_CLARITY_GRADES.length - 1 - i);
    return [g.id, g.weight + bonus] as [string, number];
  });
  return weightedPick(adjustedWeights, seed) as ClarityGrade;
}

// ------------------------------------------------------------
// 22. Gem Generation
// ------------------------------------------------------------

/**
 * Generate a single gem based on shaft configuration and state.
 */
function generateGem(
  state: BloodDiamondState,
  shaftId: number,
  seed: number,
  qualityMultiplier: number,
): GemItem {
  const shaft = BD_MINE_SHAFTS[shaftId];
  if (!shaft) {
    // Fallback for safety
    return {
      id: `gem-${state.nextId}`,
      type: 'white',
      carat: 1.0,
      clarity: 'SI',
      cut: null,
      polishStage: 0,
      baseValue: 100,
      isBloodDiamond: false,
      minedAtShaft: 0,
      minedAtTick: state.marketTick,
    };
  }

  // Pick gem type
  const entries = Object.entries(shaft.gemWeights);
  let gemType = weightedPick(entries, seed) as GemType;

  // Blood diamond chance (rare)
  const luckBonus = state.luckLevel * 0.005;
  const fortuneBonus = state.fortuneLevel * 0.003;
  const bloodChance = 0.02 + luckBonus + fortuneBonus;
  let isBlood = false;
  if (seededRandom(seed + 7777) < bloodChance) {
    gemType = 'blood';
    isBlood = true;
  }

  // Carat
  const cartBonus = state.cartLevel * 0.2;
  const maxCarat = shaft.maxCarat + cartBonus;
  const caratRoll = seededRandom(seed + 1234);
  const carat = roundTo(0.3 + caratRoll * maxCarat * qualityMultiplier, 2);
  const clampedCarat = clamp(carat, 0.1, 50);

  // Clarity
  const clarity = generateClarity(state, seed + 5678);

  // Base value
  const gemDef = BD_GEM_TYPES.find((g) => g.id === gemType);
  const baseVal = (gemDef?.baseValue ?? 100) * clampedCarat;
  const finalBaseVal = isBlood ? baseVal * 10 : baseVal;

  return {
    id: `gem-${state.nextId}`,
    type: gemType,
    carat: clampedCarat,
    clarity,
    cut: null,
    polishStage: 0,
    baseValue: Math.round(finalBaseVal),
    isBloodDiamond: isBlood,
    minedAtShaft: shaftId,
    minedAtTick: state.marketTick,
  };
}

// ------------------------------------------------------------
// 23. Mining — Core Action
// ------------------------------------------------------------

/**
 * Execute a mining action.
 * @param swingTiming Normalised 0-1 timing for the mini-game. If omitted,
 *   a default "decent" quality (1.0) is used.
 */
export function bdMine(
  state: BloodDiamondState,
  shaftId?: number,
  swingTiming?: number,
): BloodDiamondState {
  let s = bdCloneState(state);

  // Resolve shaft
  const targetShaft = shaftId ?? s.activeShaft;
  if (!bdIsShaftUnlocked(s, targetShaft)) return state;

  // Evaluate swing
  const swing = swingTiming !== undefined ? bdEvaluateSwing(swingTiming) : { quality: 1.0, isCritical: false, isFumble: false };

  // Fumble: nothing found
  if (swing.isFumble) {
    return addXP(s, 5);
  }

  const shaft = BD_MINE_SHAFTS[targetShaft];
  if (!shaft) return state;

  // Calculate yield count
  const pickaxeBonus = s.pickaxeLevel * 0.3;
  const fortuneBonus = s.fortuneLevel * 0.1;
  let gemCount = Math.round(shaft.baseYield * swing.quality * (1 + pickaxeBonus + fortuneBonus));
  gemCount = clamp(gemCount, 1, 20);

  // Generate gems
  const newGems: GemItem[] = [];
  for (let i = 0; i < gemCount; i++) {
    const seed = s.nextId * 100 + i + s.marketTick * 7;
    const gem = generateGem(s, targetShaft, seed, swing.quality);
    newGems.push(gem);
    s = incrementNextId(s);
  }

  // Add gems to inventory
  s = {
    ...s,
    inventory: [...s.inventory, ...newGems],
    activeShaft: targetShaft,
    totalMined: s.totalMined + newGems.length,
    totalCaratsMined: roundTo(s.totalCaratsMined + newGems.reduce((sum, g) => sum + g.carat, 0), 2),
    bloodDiamondsFound: s.bloodDiamondsFound + newGems.filter((g) => g.isBloodDiamond).length,
  };

  // XP reward
  const xpGain = Math.round(10 * swing.quality * gemCount);
  s = addXP(s, xpGain);

  return s;
}

/** Calculate the expected mine yield for a shaft given current upgrades. */
export function bdCalculateMineYield(state: BloodDiamondState, shaftId?: number): {
  minGems: number;
  maxGems: number;
  avgGems: number;
} {
  const targetShaft = shaftId ?? state.activeShaft;
  const shaft = BD_MINE_SHAFTS[targetShaft];
  if (!shaft) return { minGems: 0, maxGems: 0, avgGems: 0 };

  const pickaxeBonus = state.pickaxeLevel * 0.3;
  const fortuneBonus = state.fortuneLevel * 0.1;
  const base = shaft.baseYield * (1 + pickaxeBonus + fortuneBonus);

  return {
    minGems: Math.max(1, Math.round(base * 0.3)),
    maxGems: Math.round(base * 2.0),
    avgGems: Math.round(base * 1.0),
  };
}

// ------------------------------------------------------------
// 24. Cutting
// ------------------------------------------------------------

/**
 * Cut a gem with a chosen cut style.
 * Has a chance of failure that reduces carat.
 * Costs coins based on cut difficulty.
 */
export function bdCutGem(
  state: BloodDiamondState,
  gemId: string,
  cutStyle: CutStyle,
): BloodDiamondState {
  const gem = state.inventory.find((g) => g.id === gemId) ??
              state.polishedGems.find((g) => g.id === gemId);
  if (!gem) return state;
  if (gem.cut !== null) return state; // Already cut

  const cutDef = BD_CUT_STYLES.find((c) => c.id === cutStyle);
  if (!cutDef) return state;

  const cost = Math.round(50 * cutDef.difficulty * (gem.carat + 1));
  if (state.coins < cost) return state;

  // Success chance: base 80 % minus difficulty * 10 %, plus level bonus
  const levelBonus = Math.min(state.level * 0.5, 15);
  const successChance = clamp(0.80 - (cutDef.difficulty - 1) * 0.08 + levelBonus / 100, 0.3, 0.99);
  const roll = seededRandom(state.nextId + 999);
  const isSuccess = roll < successChance;

  let updatedGem: GemItem;
  if (isSuccess) {
    const multiplier = cutDef.multiplier;
    updatedGem = {
      ...gem,
      cut: cutStyle,
      baseValue: Math.round(gem.baseValue * multiplier),
    };
  } else {
    // Failure: reduce carat by 10-25 %
    const lossFactor = 0.75 + seededRandom(state.nextId + 1111) * 0.15;
    updatedGem = {
      ...gem,
      carat: roundTo(gem.carat * lossFactor, 2),
      baseValue: Math.round(gem.baseValue * lossFactor),
    };
  }

  // Replace gem in whichever array it was found in
  let s = { ...state, coins: state.coins - cost, gemsCutCount: state.gemsCutCount + (isSuccess ? 1 : 0) };
  s = incrementNextId(s);

  if (state.inventory.some((g) => g.id === gemId)) {
    s = { ...s, inventory: s.inventory.map((g) => (g.id === gemId ? updatedGem : g)) };
  }
  if (state.polishedGems.some((g) => g.id === gemId)) {
    s = { ...s, polishedGems: s.polishedGems.map((g) => (g.id === gemId ? updatedGem : g)) };
  }

  return addXP(s, isSuccess ? 15 : 5);
}

/** Get the cost to cut a gem with a given cut style. */
export function bdGetCutCost(state: BloodDiamondState, gemId: string, cutStyle: CutStyle): number {
  const gem = state.inventory.find((g) => g.id === gemId) ??
              state.polishedGems.find((g) => g.id === gemId);
  if (!gem) return 0;
  const cutDef = BD_CUT_STYLES.find((c) => c.id === cutStyle);
  if (!cutDef) return 0;
  return Math.round(50 * cutDef.difficulty * (gem.carat + 1));
}

// ------------------------------------------------------------
// 25. Polishing
// ------------------------------------------------------------

/**
 * Polish a gem by one stage.
 * Costs coins. Has a small chance of carat loss.
 */
export function bdPolishGem(state: BloodDiamondState, gemId: string): BloodDiamondState {
  const gem = state.inventory.find((g) => g.id === gemId) ??
              state.polishedGems.find((g) => g.id === gemId);
  if (!gem) return state;
  if (gem.polishStage >= 4) return state; // Already max

  const stageCost = 20 + gem.polishStage * 30 + Math.round(gem.carat * 10);
  if (state.coins < stageCost) return state;

  const lossRoll = seededRandom(state.nextId + 3333);
  const caratLoss = lossRoll < 0.1 ? roundTo(gem.carat * 0.05, 2) : 0;

  const newCarat = roundTo(gem.carat - caratLoss, 2);
  const polishValueBonus = 1 + gem.polishStage * 0.1;

  const updatedGem: GemItem = {
    ...gem,
    polishStage: (gem.polishStage + 1) as PolishStage,
    carat: newCarat,
    baseValue: Math.round(gem.baseValue * polishValueBonus),
  };

  let s = { ...state, coins: state.coins - stageCost, totalPolished: state.totalPolished + 1 };
  s = incrementNextId(s);

  if (state.inventory.some((g) => g.id === gemId)) {
    s = { ...s, inventory: s.inventory.map((g) => (g.id === gemId ? updatedGem : g)) };
  }
  if (state.polishedGems.some((g) => g.id === gemId)) {
    s = { ...s, polishedGems: s.polishedGems.map((g) => (g.id === gemId ? updatedGem : g)) };
  }

  // If fully polished, move to polishedGems
  if (updatedGem.polishStage === 4 && s.inventory.some((g) => g.id === gemId)) {
    s = {
      ...s,
      inventory: s.inventory.filter((g) => g.id !== gemId),
      polishedGems: [...s.polishedGems, updatedGem],
    };
  }

  return addXP(s, 10);
}

/** Get the cost to polish a gem to the next stage. */
export function bdGetPolishCost(state: BloodDiamondState, gemId: string): number {
  const gem = state.inventory.find((g) => g.id === gemId) ??
              state.polishedGems.find((g) => g.id === gemId);
  if (!gem || gem.polishStage >= 4) return 0;
  return 20 + gem.polishStage * 30 + Math.round(gem.carat * 10);
}

/** Move a gem from inventory to polished list (force move). */
export function bdMoveToPolished(state: BloodDiamondState, gemId: string): BloodDiamondState {
  const idx = state.inventory.findIndex((g) => g.id === gemId);
  if (idx === -1) return state;
  const gem = state.inventory[idx];
  return {
    ...state,
    inventory: state.inventory.filter((g) => g.id !== gemId),
    polishedGems: [...state.polishedGems, gem],
  };
}

/** Move a gem from polished back to inventory. */
export function bdMoveToInventory(state: BloodDiamondState, gemId: string): BloodDiamondState {
  const idx = state.polishedGems.findIndex((g) => g.id === gemId);
  if (idx === -1) return state;
  const gem = state.polishedGems[idx];
  return {
    ...state,
    polishedGems: state.polishedGems.filter((g) => g.id !== gemId),
    inventory: [...state.inventory, gem],
  };
}

// ------------------------------------------------------------
// 26. Appraisal — 4Cs Valuation
// ------------------------------------------------------------

/**
 * Full 4Cs appraisal of a gem.
 * Returns individual scores and a total market value.
 */
export function bdAppraiseGem(state: BloodDiamondState, gem: GemItem): AppraisalResult {
  // Color score (based on rarity — rarer = higher score)
  const rarity = bdGetGemRarity(gem.type);
  const colorScore = roundTo(clamp((1 - rarity) * 100 + 50, 50, 200), 1);

  // Cut score
  const cutScore = gem.cut ? roundTo(bdGetCutMultiplier(gem.cut) * 100, 1) : 0;

  // Clarity score
  const clarityMult = bdGetClarityMultiplier(gem.clarity);
  const clarityScore = roundTo(clarityMult * 50, 1);

  // Carat score (exponential scaling)
  const caratScore = roundTo(Math.pow(gem.carat, 1.3) * 10, 1);

  // Total value = base * clarity_mult * cut_mult * polish_bonus * market_price_factor
  const marketFactor = (state.marketPrices[gem.type] ?? bdGetGemBaseValue(gem.type)) / bdGetGemBaseValue(gem.type);
  const polishBonus = 1 + gem.polishStage * 0.1;
  const cutMult = gem.cut ? bdGetCutMultiplier(gem.cut) : 0.6;
  const totalValue = Math.round(
    gem.baseValue * clarityMult * cutMult * polishBonus * Math.max(0.5, marketFactor),
  );

  // Grade label
  const total = colorScore + cutScore + clarityScore + caratScore;
  let grade: string;
  if (total >= 500) grade = 'Legendary';
  else if (total >= 350) grade = 'Exceptional';
  else if (total >= 250) grade = 'Excellent';
  else if (total >= 150) grade = 'Good';
  else if (total >= 80) grade = 'Fair';
  else grade = 'Poor';

  const bloodTag = gem.isBloodDiamond ? ' [BLOOD DIAMOND]' : '';
  const description =
    `${bdGetGemName(gem.type)}${bloodTag}, ${gem.carat}ct, ${gem.clarity} clarity` +
    (gem.cut ? `, ${gem.cut} cut` : '') +
    `, ${BD_POLISH_LABELS[gem.polishStage]}`;

  return {
    colorScore,
    cutScore,
    clarityScore,
    caratScore,
    totalValue,
    grade,
    description,
  };
}

/** Quick value estimate for a gem (single number). */
export function bdGetGemValue(state: BloodDiamondState, gem: GemItem): number {
  return bdAppraiseGem(state, gem).totalValue;
}

/** Quick value of a jewelry item. */
export function bdGetJewelryValue(state: BloodDiamondState, jewelry: JewelryItem): number {
  const allGems = [...state.inventory, ...state.polishedGems];
  let total = 0;
  for (const gid of jewelry.gemIds) {
    const g = allGems.find((x) => x.id === gid);
    if (g) total += bdGetGemValue(state, g);
  }
  return jewelry.baseValue + Math.round(total * 0.5);
}

// ------------------------------------------------------------
// 27. Market System
// ------------------------------------------------------------

/** Get the current market price for a gem type. */
export function bdGetMarketPrice(state: BloodDiamondState, gemType: GemType): number {
  return state.marketPrices[gemType] ?? bdGetGemBaseValue(gemType);
}

/** Get all current market prices. */
export function bdGetAllMarketPrices(state: BloodDiamondState): Record<string, number> {
  return { ...state.marketPrices };
}

/** Determine the market trend for a gem type (compare current vs base). */
export function bdGetMarketTrend(state: BloodDiamondState, gemType: GemType): MarketTrend {
  const current = state.marketPrices[gemType] ?? bdGetGemBaseValue(gemType);
  const base = bdGetGemBaseValue(gemType);
  if (current > base * 1.1) return 'up';
  if (current < base * 0.9) return 'down';
  return 'stable';
}

/** Get the percentage change from base price for a gem type. */
export function bdGetMarketChange(state: BloodDiamondState, gemType: GemType): number {
  const base = bdGetGemBaseValue(gemType);
  const current = state.marketPrices[gemType] ?? base;
  return roundTo(((current - base) / base) * 100, 1);
}

/**
 * Fluctuate the market by one tick.
 * Prices shift based on a deterministic sine-based oscillator.
 */
export function bdFluctuateMarket(state: BloodDiamondState): BloodDiamondState {
  const newTick = state.marketTick + 1;
  const newPrices: Record<string, number> = {};

  for (const gem of BD_GEM_TYPES) {
    const base = gem.baseValue;
    // Each gem type oscillates with a unique phase
    const phase = BD_GEM_TYPES.indexOf(gem) * 1.7 + 0.5;
    const volatility = 0.05 + (1 - gem.rarity) * 0.08; // Rarer = more volatile
    const oscillation = Math.sin(newTick * 0.1 + phase) * volatility;
    const noise = (seededRandom(newTick * 13 + BD_GEM_TYPES.indexOf(gem) * 7) - 0.5) * 0.04;
    const newPrice = base * (1 + oscillation + noise);
    newPrices[gem.id] = Math.max(Math.round(base * 0.5), Math.round(newPrice));
  }

  return { ...state, marketTick: newTick, marketPrices: newPrices };
}

/** Get a summary of the best and worst performing gems. */
export function bdGetMarketSummary(state: BloodDiamondState): {
  best: { type: GemType; change: number };
  worst: { type: GemType; change: number };
} {
  let best: { type: GemType; change: number } = { type: 'white', change: -Infinity };
  let worst: { type: GemType; change: number } = { type: 'white', change: Infinity };

  for (const gem of BD_GEM_TYPES) {
    const change = bdGetMarketChange(state, gem.id);
    if (change > best.change) best = { type: gem.id, change };
    if (change < worst.change) worst = { type: gem.id, change };
  }

  return { best, worst };
}

// ------------------------------------------------------------
// 28. Selling
// ------------------------------------------------------------

/** Sell a single gem from inventory or polished list. */
export function bdSellGem(state: BloodDiamondState, gemId: string): BloodDiamondState {
  const allGems = [...state.inventory, ...state.polishedGems];
  const gem = allGems.find((g) => g.id === gemId);
  if (!gem) return state;

  const value = bdGetGemValue(state, gem);

  let s = {
    ...state,
    coins: state.coins + value,
    totalSold: state.totalSold + 1,
    totalCoinsEarned: state.totalCoinsEarned + value,
    inventory: state.inventory.filter((g) => g.id !== gemId),
    polishedGems: state.polishedGems.filter((g) => g.id !== gemId),
  };

  return addXP(s, Math.round(value / 50));
}

/** Sell all gems in the polished list. */
export function bdSellAllPolished(state: BloodDiamondState): BloodDiamondState {
  let s = { ...state };
  for (const gem of [...s.polishedGems]) {
    s = bdSellGem(s, gem.id);
  }
  return s;
}

/** Sell all gems in inventory. */
export function bdSellAllInventory(state: BloodDiamondState): BloodDiamondState {
  let s = { ...state };
  for (const gem of [...s.inventory]) {
    s = bdSellGem(s, gem.id);
  }
  return s;
}

/** Sell a jewelry item. */
export function bdSellJewelry(state: BloodDiamondState, jewelryId: string): BloodDiamondState {
  const jewelry = state.jewelryCrafted.find((j) => j.id === jewelryId);
  if (!jewelry) return state;

  const value = bdGetJewelryValue(state, jewelry);
  let s = {
    ...state,
    coins: state.coins + value,
    totalSold: state.totalSold + 1,
    totalCoinsEarned: state.totalCoinsEarned + value,
    jewelryCrafted: state.jewelryCrafted.filter((j) => j.id !== jewelryId),
  };

  return addXP(s, Math.round(value / 30));
}

// ------------------------------------------------------------
// 29. VIP Client System
// ------------------------------------------------------------

/** Get all VIP clients. */
export function bdGetVIPClients(state: BloodDiamondState): VIPClient[] {
  return state.vipClients;
}

/** Get a specific VIP client by ID. */
export function bdGetVIPClient(state: BloodDiamondState, clientId: string): VIPClient | undefined {
  return state.vipClients.find((c) => c.id === clientId);
}

/** Check if a VIP client's order can be fulfilled right now. */
export function bdCanFulfillOrder(
  state: BloodDiamondState,
  clientId: string,
): boolean {
  const client = state.vipClients.find((c) => c.id === clientId);
  if (!client || !client.active) return false;

  const availableGems = [...state.inventory, ...state.polishedGems];
  const matchingGems = availableGems.filter(
    (g) =>
      client.preferredTypes.includes(g.type) &&
      bdIsClarityAtLeast(g.clarity, client.minClarity) &&
      g.carat >= client.minCarat &&
      g.polishStage >= 2,
  );

  return matchingGems.length > 0;
}

/** Fulfill a VIP client's order. Returns updated state and reward info. */
export function bdFulfillOrder(
  state: BloodDiamondState,
  clientId: string,
): { state: BloodDiamondState; reward: number; gemId: string } | null {
  const clientIdx = state.vipClients.findIndex((c) => c.id === clientId);
  if (clientIdx === -1) return null;
  const client = state.vipClients[clientIdx];
  if (!client.active) return null;

  // Find the best matching gem
  const availableGems = [...state.inventory, ...state.polishedGems];
  const matchingGems = availableGems
    .filter(
      (g) =>
        client.preferredTypes.includes(g.type) &&
        bdIsClarityAtLeast(g.clarity, client.minClarity) &&
        g.carat >= client.minCarat &&
        g.polishStage >= 2,
    )
    .sort((a, b) => bdGetGemValue(state, b) - bdGetGemValue(state, a));

  if (matchingGems.length === 0) return null;

  const chosenGem = matchingGems[0];
  const baseReward = bdGetGemValue(state, chosenGem);
  const reward = Math.round(baseReward * client.rewardMultiplier);

  // Remove gem
  let s: BloodDiamondState = {
    ...state,
    coins: state.coins + reward,
    totalSold: state.totalSold + 1,
    totalCoinsEarned: state.totalCoinsEarned + reward,
    vipOrdersFulfilled: state.vipOrdersFulfilled + 1,
    inventory: state.inventory.filter((g) => g.id !== chosenGem.id),
    polishedGems: state.polishedGems.filter((g) => g.id !== chosenGem.id),
    vipClients: state.vipClients.map((c, i) =>
      i === clientIdx
        ? { ...c, active: false, lastFulfilledDay: state.day }
        : c,
    ),
  };

  s = addXP(s, 50);
  return { state: s, reward, gemId: chosenGem.id };
}

/** Get the reward estimate for fulfilling a client's order. */
export function bdGetClientRewardEstimate(state: BloodDiamondState, clientId: string): number {
  const client = state.vipClients.find((c) => c.id === clientId);
  if (!client) return 0;

  const availableGems = [...state.inventory, ...state.polishedGems];
  const matchingGems = availableGems.filter(
    (g) =>
      client.preferredTypes.includes(g.type) &&
      bdIsClarityAtLeast(g.clarity, client.minClarity) &&
      g.carat >= client.minCarat &&
      g.polishStage >= 2,
  );

  if (matchingGems.length === 0) return 0;
  const bestGem = matchingGems.sort((a, b) => bdGetGemValue(state, b) - bdGetGemValue(state, a))[0];
  return Math.round(bdGetGemValue(state, bestGem) * client.rewardMultiplier);
}

// ------------------------------------------------------------
// 30. Jewelry Crafting
// ------------------------------------------------------------

/** Get all jewelry recipes. */
export function bdGetJewelryRecipes(): JewelryRecipe[] {
  return BD_JEWELRY_RECIPES;
}

/** Get a specific jewelry recipe. */
export function bdGetJewelryRecipe(recipeId: string): JewelryRecipe | undefined {
  return BD_JEWELRY_RECIPES.find((r) => r.id === recipeId);
}

/** Check if a recipe can be crafted with current gems. */
export function bdCanCraftRecipe(
  state: BloodDiamondState,
  recipeId: string,
): boolean {
  const recipe = BD_JEWELRY_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return false;
  if (state.level < recipe.unlockLevel) return false;

  const availableGems = [...state.inventory, ...state.polishedGems];

  for (const req of recipe.requiredGems) {
    let matchCount = 0;
    for (const gem of availableGems) {
      if (
        (req.type === 'any' || gem.type === req.type) &&
        gem.polishStage >= req.minPolish &&
        (req.minClarity === undefined || bdIsClarityAtLeast(gem.clarity, req.minClarity))
      ) {
        matchCount++;
      }
    }
    if (matchCount < req.count) return false;
  }

  return true;
}

/** Get the cost to craft a jewelry recipe. */
export function bdGetCraftCost(state: BloodDiamondState, recipeId: string): number {
  const recipe = BD_JEWELRY_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return 0;
  const totalGems = recipe.requiredGems.reduce((s, r) => s + r.count, 0);
  return Math.round(200 * totalGems * (1 + state.level * 0.05));
}

/**
 * Craft a jewelry item from a recipe.
 * Consumes matching gems from inventory/polished lists.
 */
export function bdCraftJewelry(
  state: BloodDiamondState,
  recipeId: string,
): BloodDiamondState | null {
  if (!bdCanCraftRecipe(state, recipeId)) return null;

  const recipe = BD_JEWELRY_RECIPES.find((r) => r.id === recipeId)!;
  const cost = bdGetCraftCost(state, recipeId);
  if (state.coins < cost) return null;

  const availableGems = [...state.inventory, ...state.polishedGems];
  const usedGemIds: string[] = [];
  let totalCarat = 0;
  let totalBaseValue = 0;

  // For each requirement, pick the cheapest qualifying gems first
  const remainingReqs = recipe.requiredGems.map((r) => ({ ...r }));
  const usedIds = new Set<string>();

  for (const req of remainingReqs) {
    let filled = 0;
    const sorted = availableGems
      .filter((g) => !usedIds.has(g.id))
      .filter(
        (g) =>
          (req.type === 'any' || g.type === req.type) &&
          g.polishStage >= req.minPolish &&
          (req.minClarity === undefined || bdIsClarityAtLeast(g.clarity, req.minClarity)),
      )
      .sort((a, b) => bdGetGemValue(state, a) - bdGetGemValue(state, b));

    for (let i = 0; i < sorted.length && filled < req.count; i++) {
      usedIds.add(sorted[i].id);
      usedGemIds.push(sorted[i].id);
      totalCarat = roundTo(totalCarat + sorted[i].carat, 2);
      totalBaseValue += sorted[i].baseValue;
      filled++;
    }
  }

  if (usedGemIds.length === 0) return null;

  const jewelryValue = Math.round(totalBaseValue * recipe.valueMultiplier);
  const jewelry: JewelryItem = {
    id: `jewel-${state.nextId}`,
    name: recipe.name,
    gemIds: usedGemIds,
    totalCarat,
    baseValue: jewelryValue,
    craftedAtTick: state.marketTick,
  };

  let s: BloodDiamondState = {
    ...state,
    coins: state.coins - cost,
    jewelryCraftedCount: state.jewelryCraftedCount + 1,
    inventory: state.inventory.filter((g) => !usedIds.has(g.id)),
    polishedGems: state.polishedGems.filter((g) => !usedIds.has(g.id)),
    jewelryCrafted: [...state.jewelryCrafted, jewelry],
  };
  s = incrementNextId(s);
  s = addXP(s, 30 * usedGemIds.length);

  return s;
}

// ------------------------------------------------------------
// 31. Mine Upgrades
// ------------------------------------------------------------

/** Get all mine upgrade definitions. */
export function bdGetMineUpgradeDefs(): MineUpgradeDef[] {
  return BD_MINE_UPGRADES;
}

/** Get the upgrade level for a specific upgrade. */
export function bdGetUpgradeLevel(state: BloodDiamondState, upgradeId: string): number {
  return state.mineUpgrades[upgradeId] ?? 0;
}

/** Get the cost for the next level of an upgrade. */
export function bdGetUpgradeCost(state: BloodDiamondState, upgradeId: string): number {
  const def = BD_MINE_UPGRADES.find((u) => u.id === upgradeId);
  if (!def) return 0;
  const currentLevel = state.mineUpgrades[upgradeId] ?? 0;
  if (currentLevel >= def.maxLevel) return Infinity;
  return Math.round(def.baseCost * Math.pow(def.costScale, currentLevel));
}

/** Check if an upgrade can be purchased. */
export function bdCanUpgrade(state: BloodDiamondState, upgradeId: string): boolean {
  const def = BD_MINE_UPGRADES.find((u) => u.id === upgradeId);
  if (!def) return false;
  const currentLevel = state.mineUpgrades[upgradeId] ?? 0;
  if (currentLevel >= def.maxLevel) return false;
  const cost = Math.round(def.baseCost * Math.pow(def.costScale, currentLevel));
  return state.coins >= cost;
}

/** Purchase an upgrade. */
export function bdUpgradeMine(state: BloodDiamondState, upgradeId: string): BloodDiamondState {
  if (!bdCanUpgrade(state, upgradeId)) return state;

  const def = BD_MINE_UPGRADES.find((u) => u.id === upgradeId)!;
  const currentLevel = state.mineUpgrades[upgradeId] ?? 0;
  const cost = Math.round(def.baseCost * Math.pow(def.costScale, currentLevel));

  const s: BloodDiamondState = {
    ...state,
    coins: state.coins - cost,
    mineUpgrades: { ...state.mineUpgrades, [upgradeId]: currentLevel + 1 },
  };

  // Map upgrade id to the appropriate field
  if (upgradeId === 'pickaxe') return { ...s, pickaxeLevel: currentLevel + 1 };
  if (upgradeId === 'lantern') return { ...s, lanternLevel: currentLevel + 1 };
  if (upgradeId === 'cart') return { ...s, cartLevel: currentLevel + 1 };
  if (upgradeId === 'luck') return { ...s, luckLevel: currentLevel + 1 };
  if (upgradeId === 'fortune') return { ...s, fortuneLevel: currentLevel + 1 };
  return s;
}

/** Get all current upgrade levels. */
export function bdGetAllUpgrades(state: BloodDiamondState): Record<string, number> {
  return { ...state.mineUpgrades };
}

// ------------------------------------------------------------
// 32. Daily Vein Discovery
// ------------------------------------------------------------

/** Check if a vein should be discoverable today. */
export function bdShouldDiscoverVein(state: BloodDiamondState): boolean {
  if (state.dailyVeinDiscovered) return false;
  return state.day > state.lastVeinDay;
}

/** Discover a daily gem vein, adding bonus gems to the state. */
export function bdDiscoverVein(state: BloodDiamondState): BloodDiamondState {
  if (!bdShouldDiscoverVein(state)) return state;

  const shaft = BD_MINE_SHAFTS[state.activeShaft];
  const veinGems: GemItem[] = [];
  let s = bdCloneState(state);
  const veinSize = 3 + Math.floor(seededRandom(s.day * 42) * 5);

  for (let i = 0; i < veinSize; i++) {
    const seed = s.nextId * 200 + i + s.day * 31;
    const gem = generateGem(s, state.activeShaft, seed, 1.3); // Veins give better gems
    veinGems.push(gem);
    s = incrementNextId(s);
  }

  return {
    ...s,
    dailyVeinDiscovered: true,
    lastVeinDay: s.day,
    dailyVeinGems: veinGems,
    inventory: [...s.inventory, ...veinGems],
    totalMined: s.totalMined + veinGems.length,
    totalCaratsMined: roundTo(
      s.totalCaratsMined + veinGems.reduce((sum, g) => sum + g.carat, 0),
      2,
    ),
  };
}

/** Get the gems from today's discovered vein. */
export function bdGetVeinGems(state: BloodDiamondState): GemItem[] {
  return state.dailyVeinGems;
}

/** Collect vein gems into inventory (if not already done). */
export function bdCollectVeinGems(state: BloodDiamondState): BloodDiamondState {
  if (state.dailyVeinDiscovered && state.dailyVeinGems.length > 0) {
    // Check if they are already in inventory
    const veinIds = new Set(state.dailyVeinGems.map((g) => g.id));
    const alreadyCollected = state.inventory.some((g) => veinIds.has(g.id));
    if (alreadyCollected) return state;

    return {
      ...state,
      inventory: [...state.inventory, ...state.dailyVeinGems],
    };
  }
  return state;
}

/** Reset the daily vein (called at the start of a new day). */
export function bdResetDailyVein(state: BloodDiamondState): BloodDiamondState {
  return {
    ...state,
    dailyVeinDiscovered: false,
    dailyVeinGems: [],
  };
}

// ------------------------------------------------------------
// 33. Day / Streak Management
// ------------------------------------------------------------

/** Advance to the next day. Resets vein, updates streak, fluctuates market. */
export function bdAdvanceDay(state: BloodDiamondState): BloodDiamondState {
  let s: BloodDiamondState = {
    ...state,
    day: state.day + 1,
    streak: state.streak + 1,
  };

  s = bdResetDailyVein(s);
  s = bdFluctuateMarket(s);
  s = bdRefreshVIPClients(s);

  return s;
}

/** Increment the streak (called when the player does something today). */
export function bdIncrementStreak(state: BloodDiamondState): BloodDiamondState {
  return { ...state, streak: state.streak + 1 };
}

/** Reset the streak to 0. */
export function bdResetStreak(state: BloodDiamondState): BloodDiamondState {
  return { ...state, streak: 0 };
}

/** Check if streak is at a milestone (every 7 days). */
export function bdIsStreakMilestone(state: BloodDiamondState): boolean {
  return state.streak > 0 && state.streak % 7 === 0;
}

/** Get the streak bonus coins (awarded at milestones). */
export function bdGetStreakBonus(state: BloodDiamondState): number {
  if (!bdIsStreakMilestone(state)) return 0;
  return 100 * Math.floor(state.streak / 7);
}

/** Claim the streak bonus if available. */
export function bdClaimStreakBonus(state: BloodDiamondState): BloodDiamondState {
  const bonus = bdGetStreakBonus(state);
  if (bonus === 0) return state;
  return {
    ...state,
    coins: state.coins + bonus,
    totalCoinsEarned: state.totalCoinsEarned + bonus,
  };
}

// ------------------------------------------------------------
// 34. VIP Client Refresh
// ------------------------------------------------------------

/** Refresh which VIP clients are active based on cooldowns. */
export function bdRefreshVIPClients(state: BloodDiamondState): BloodDiamondState {
  const updated = state.vipClients.map((c) => {
    if (state.day - c.lastFulfilledDay >= c.cooldownDays) {
      return { ...c, active: true };
    }
    return c;
  });
  return { ...state, vipClients: updated };
}

/** Get the active VIP clients (those with open orders). */
export function bdGetActiveClients(state: BloodDiamondState): VIPClient[] {
  return state.vipClients.filter((c) => c.active);
}

// ------------------------------------------------------------
// 35. Level / XP System
// ------------------------------------------------------------

/** XP required to reach a given level from level-1. */
export function bdGetXPForLevel(level: number): number {
  // Quadratic scaling: 100 * level^1.5
  return Math.round(100 * Math.pow(level, 1.5));
}

/** XP required to go from the current level to the next level. */
export function bdGetXPToNextLevel(state: BloodDiamondState): number {
  return bdGetXPForLevel(state.level + 1);
}

/** Progress toward the next level as a fraction 0-1. */
export function bdGetLevelProgress(state: BloodDiamondState): number {
  const currentLevelXP = bdGetXPForLevel(state.level);
  const nextLevelXP = bdGetXPForLevel(state.level + 1);
  const progress = (state.xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
  return clamp(progress, 0, 1);
}

/** The maximum level in the game. */
export function bdGetMaxLevel(): number {
  return 50;
}

/** Add XP to the state, handling level-ups. */
function addXP(state: BloodDiamondState, amount: number): BloodDiamondState {
  let s = { ...state, xp: state.xp + amount };
  let safety = 0;
  while (s.level < bdGetMaxLevel() && s.xp >= bdGetXPForLevel(s.level + 1) && safety < 60) {
    s = { ...s, level: s.level + 1 };
    safety++;
  }
  return s;
}

/** Public XP addition (also checks achievements). */
export function bdAddXP(state: BloodDiamondState, amount: number): BloodDiamondState {
  let s = addXP(state, amount);
  s = bdCheckAchievements(s);
  return s;
}

/** Get a title based on the player's level. */
export function bdGetMinerTitle(state: BloodDiamondState): string {
  const lvl = state.level;
  if (lvl >= 50) return 'Legendary Diamond Lord';
  if (lvl >= 45) return 'Master of the Magma Core';
  if (lvl >= 40) return 'Imperial Gem Cutter';
  if (lvl >= 35) return 'Diamond Heart Explorer';
  if (lvl >= 30) return 'Deep Shaft Veteran';
  if (lvl >= 25) return 'Gem Trade Baron';
  if (lvl >= 20) return 'Crystal Cavern Delver';
  if (lvl >= 15) return 'Skilled Jewel Smith';
  if (lvl >= 10) return 'Apprentice Gemologist';
  if (lvl >= 5) return 'Novice Miner';
  return 'Fresh Recruit';
}

// ------------------------------------------------------------
// 36. Fortune & Risk System
// ------------------------------------------------------------

/** Get the player's fortune score (affects rare finds). */
export function bdGetFortune(state: BloodDiamondState): number {
  const base = state.fortuneLevel * 10;
  const luckBonus = state.luckLevel * 5;
  const streakBonus = Math.min(state.streak, 30) * 2;
  return base + luckBonus + streakBonus;
}

/** Calculate the risk level for a mining action at a given shaft. */
export function bdCalculateRisk(state: BloodDiamondState, shaftId?: number): {
  riskLevel: number;
  caveInChance: number;
  gasPocketChance: number;
  bonusChance: number;
} {
  const shaft = BD_MINE_SHAFTS[shaftId ?? state.activeShaft];
  if (!shaft) return { riskLevel: 0, caveInChance: 0, gasPocketChance: 0, bonusChance: 0 };

  const danger = shaft.dangerLevel;
  const luckReduction = state.luckLevel * 0.5;
  const effectiveDanger = Math.max(0, danger - luckReduction);

  return {
    riskLevel: roundTo(effectiveDanger, 1),
    caveInChance: roundTo(effectiveDanger * 0.02, 3),
    gasPocketChance: roundTo(effectiveDanger * 0.03, 3),
    bonusChance: roundTo(effectiveDanger * 0.05 + state.fortuneLevel * 0.01, 3),
  };
}

/** Process a risk event after mining (called internally). */
export function bdProcessRiskEvent(
  state: BloodDiamondState,
  shaftId?: number,
): {
  state: BloodDiamondState;
  event: 'none' | 'cave_in' | 'gas_pocket' | 'lucky_find' | 'blood_vein';
  message: string;
} {
  const shaft = BD_MINE_SHAFTS[shaftId ?? state.activeShaft];
  if (!shaft) return { state, event: 'none', message: '' };

  const risk = bdCalculateRisk(state, shaftId);
  const roll = seededRandom(state.nextId + 5555);

  if (roll < risk.caveInChance) {
    // Cave-in: lose some coins
    const loss = Math.round(state.coins * 0.1);
    const s = { ...state, coins: Math.max(0, state.coins - loss) };
    return { state: incrementNextId(s), event: 'cave_in', message: `Cave-in! Lost ${loss} coins.` };
  }

  if (roll < risk.caveInChance + risk.gasPocketChance) {
    // Gas pocket: lose some inventory gems
    if (state.inventory.length === 0) {
      return { state, event: 'none', message: 'Gas pocket! But your inventory was empty.' };
    }
    const lostIdx = Math.floor(seededRandom(state.nextId + 6666) * state.inventory.length);
    const lostGem = state.inventory[lostIdx];
    const s = {
      ...state,
      inventory: state.inventory.filter((_, i) => i !== lostIdx),
    };
    return {
      state: incrementNextId(s),
      event: 'gas_pocket',
      message: `Gas pocket! Lost a ${bdGetGemName(lostGem.type)}.`,
    };
  }

  if (roll < risk.caveInChance + risk.gasPocketChance + risk.bonusChance) {
    // Lucky find: gain a bonus gem
    const bonusGem = generateGem(state, shaft.id, state.nextId + 7777, 1.5);
    const s = incrementNextId({
      ...state,
      inventory: [...state.inventory, bonusGem],
      totalMined: state.totalMined + 1,
    });
    return { state: s, event: 'lucky_find', message: `Lucky find! Got a ${bdGetGemName(bonusGem.type)}!` };
  }

  return { state, event: 'none', message: '' };
}

// ------------------------------------------------------------
// 37. Achievement System
// ------------------------------------------------------------

/** Get all achievement definitions. */
export function bdGetAllAchievements(): AchievementDef[] {
  return BD_ACHIEVEMENTS;
}

/** Get the list of unlocked achievement IDs. */
export function bdGetAchievements(state: BloodDiamondState): string[] {
  return [...state.achievements];
}

/** Check if a specific achievement is unlocked. */
export function bdHasAchievement(state: BloodDiamondState, achievementId: string): boolean {
  return state.achievements.includes(achievementId);
}

/** Get an achievement definition by ID. */
export function bdGetAchievementDef(achievementId: string): AchievementDef | undefined {
  return BD_ACHIEVEMENTS.find((a) => a.id === achievementId);
}

/** Get progress info for an achievement (for UI display). */
export function bdGetAchievementProgress(
  state: BloodDiamondState,
  achievementId: string,
): { current: number; target: number; label: string } | null {
  const ach = BD_ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!ach) return null;

  switch (achievementId) {
    case 'first_spark':
      return { current: Math.min(state.totalMined, 1), target: 1, label: 'Gems mined' };
    case 'hundred_carats':
      return { current: state.totalCaratsMined, target: 100, label: 'Total carats' };
    case 'thousand_carats':
      return { current: state.totalCaratsMined, target: 1000, label: 'Total carats' };
    case 'gemologist':
      return { current: state.totalMined, target: 50, label: 'Gems mined' };
    case 'master_cutter':
      return { current: state.gemsCutCount, target: 25, label: 'Gems cut' };
    case 'flawless_find': {
      const ifCount = [...state.inventory, ...state.polishedGems].filter(
        (g) => g.clarity === 'IF',
      ).length;
      return { current: Math.min(ifCount, 1), target: 1, label: 'IF gems' };
    }
    case 'blood_hunter':
      return { current: Math.min(state.bloodDiamondsFound, 1), target: 1, label: 'Blood diamonds' };
    case 'market_tycoon':
      return { current: state.totalCoinsEarned, target: 100000, label: 'Coins earned' };
    case 'jeweler_apprentice':
      return { current: Math.min(state.jewelryCraftedCount, 1), target: 1, label: 'Jewelry crafted' };
    case 'vip_favorite':
      return { current: state.vipOrdersFulfilled, target: 10, label: 'VIP orders' };
    case 'deep_diver':
      return {
        current: BD_MINE_SHAFTS.filter((s) => state.level >= s.unlockLevel).length,
        target: BD_MINE_SHAFTS.length,
        label: 'Shafts unlocked',
      };
    case 'polish_perfection': {
      const maxPolished = [...state.inventory, ...state.polishedGems].filter(
        (g) => g.polishStage === 4,
      ).length;
      return { current: maxPolished, target: 100, label: 'Gems fully polished' };
    }
    case 'streak_master':
      return { current: state.streak, target: 7, label: 'Day streak' };
    case 'diamond_empire':
      return { current: state.totalCoinsEarned, target: 1000000, label: 'Coins earned' };
    case 'legendary_miner':
      return { current: state.level, target: 50, label: 'Level' };
    default:
      return null;
  }
}

/**
 * Check and unlock any newly earned achievements.
 * Awards coins for each new achievement.
 */
export function bdCheckAchievements(state: BloodDiamondState): BloodDiamondState {
  let s = state;
  const ifCount = [...s.inventory, ...s.polishedGems].filter((g) => g.clarity === 'IF').length;
  const maxPolished = [...s.inventory, ...s.polishedGems].filter(
    (g) => g.polishStage === 4,
  ).length;
  const unlockedShafts = BD_MINE_SHAFTS.filter((sh) => s.level >= sh.unlockLevel).length;

  const checks: Array<[string, boolean]> = [
    ['first_spark', s.totalMined >= 1],
    ['hundred_carats', s.totalCaratsMined >= 100],
    ['thousand_carats', s.totalCaratsMined >= 1000],
    ['gemologist', s.totalMined >= 50],
    ['master_cutter', s.gemsCutCount >= 25],
    ['flawless_find', ifCount >= 1],
    ['blood_hunter', s.bloodDiamondsFound >= 1],
    ['market_tycoon', s.totalCoinsEarned >= 100000],
    ['jeweler_apprentice', s.jewelryCraftedCount >= 1],
    ['vip_favorite', s.vipOrdersFulfilled >= 10],
    ['deep_diver', unlockedShafts >= BD_MINE_SHAFTS.length],
    ['polish_perfection', maxPolished >= 100],
    ['streak_master', s.streak >= 7],
    ['diamond_empire', s.totalCoinsEarned >= 1000000],
    ['legendary_miner', s.level >= 50],
  ];

  for (const [id, condition] of checks) {
    if (condition && !s.achievements.includes(id)) {
      const achDef = BD_ACHIEVEMENTS.find((a) => a.id === id);
      const reward = achDef?.rewardCoins ?? 0;
      s = {
        ...s,
        achievements: [...s.achievements, id],
        coins: s.coins + reward,
        totalCoinsEarned: s.totalCoinsEarned + reward,
      };
    }
  }

  return s;
}

/** Get the count of unlocked achievements. */
export function bdGetAchievementCount(state: BloodDiamondState): number {
  return state.achievements.length;
}

/** Get the total number of achievements. */
export function bdGetTotalAchievements(): number {
  return BD_ACHIEVEMENTS.length;
}

// ------------------------------------------------------------
// 38. Inventory Management
// ------------------------------------------------------------

/** Find a gem by ID across inventory and polished lists. */
export function bdFindGem(state: BloodDiamondState, gemId: string): GemItem | undefined {
  return state.inventory.find((g) => g.id === gemId) ??
         state.polishedGems.find((g) => g.id === gemId);
}

/** Get total inventory value (all gems + all jewelry). */
export function bdGetTotalInventoryValue(state: BloodDiamondState): number {
  let total = 0;
  for (const gem of state.inventory) {
    total += bdGetGemValue(state, gem);
  }
  for (const gem of state.polishedGems) {
    total += bdGetGemValue(state, gem);
  }
  for (const jewelry of state.jewelryCrafted) {
    total += bdGetJewelryValue(state, jewelry);
  }
  return total;
}

/** Remove a gem by ID from wherever it is. */
export function bdRemoveGem(state: BloodDiamondState, gemId: string): BloodDiamondState {
  return {
    ...state,
    inventory: state.inventory.filter((g) => g.id !== gemId),
    polishedGems: state.polishedGems.filter((g) => g.id !== gemId),
  };
}

/** Sort inventory by value (highest first). */
export function bdSortInventoryByValue(state: BloodDiamondState): BloodDiamondState {
  const sorted = [...state.inventory].sort(
    (a, b) => bdGetGemValue(state, b) - bdGetGemValue(state, a),
  );
  return { ...state, inventory: sorted };
}

/** Sort polished gems by value (highest first). */
export function bdSortPolishedByValue(state: BloodDiamondState): BloodDiamondState {
  const sorted = [...state.polishedGems].sort(
    (a, b) => bdGetGemValue(state, b) - bdGetGemValue(state, a),
  );
  return { ...state, polishedGems: sorted };
}

/** Filter inventory to only show gems of a specific type. */
export function bdFilterInventoryByType(state: BloodDiamondState, gemType: GemType): GemItem[] {
  return state.inventory.filter((g) => g.type === gemType);
}

/** Filter polished gems to only show gems of a specific type. */
export function bdFilterPolishedByType(state: BloodDiamondState, gemType: GemType): GemItem[] {
  return state.polishedGems.filter((g) => g.type === gemType);
}

/** Get a count of gems grouped by type in inventory. */
export function bdGetInventoryBreakdown(state: BloodDiamondState): Record<GemType, number> {
  const counts: Record<string, number> = {};
  for (const gem of BD_GEM_TYPES) {
    counts[gem.id] = 0;
  }
  for (const gem of state.inventory) {
    counts[gem.type] = (counts[gem.type] ?? 0) + 1;
  }
  return counts as Record<GemType, number>;
}

/** Get a count of gems grouped by type in polished list. */
export function bdGetPolishedBreakdown(state: BloodDiamondState): Record<GemType, number> {
  const counts: Record<string, number> = {};
  for (const gem of BD_GEM_TYPES) {
    counts[gem.id] = 0;
  }
  for (const gem of state.polishedGems) {
    counts[gem.type] = (counts[gem.type] ?? 0) + 1;
  }
  return counts as Record<GemType, number>;
}

// ------------------------------------------------------------
// 39. Economy & Stats Helpers
// ------------------------------------------------------------

/** Calculate the estimated daily earnings rate. */
export function bdCalculateDailyEarnings(state: BloodDiamondState): number {
  const avgYield = bdCalculateMineYield(state).avgGems;
  const shaft = BD_MINE_SHAFTS[state.activeShaft];
  if (!shaft) return 0;

  const avgCarat = shaft.maxCarat * 0.5;
  const avgBaseValue = BD_GEM_TYPES.reduce((s, g) => s + g.baseValue, 0) / BD_GEM_TYPES.length;
  const avgClarityMult = BD_CLARITY_GRADES.reduce((s, g) => s + g.multiplier, 0) / BD_CLARITY_GRADES.length;

  const perSwingValue = avgYield * avgCarat * avgBaseValue * avgClarityMult * 0.6;
  // Assume ~20 swings per "day"
  return Math.round(perSwingValue * 20);
}

/** Get the player's net worth (coins + inventory value). */
export function bdGetNetWorth(state: BloodDiamondState): number {
  return state.coins + bdGetTotalInventoryValue(state);
}

/** Get a comprehensive stats summary. */
export function bdGetStatsSummary(state: BloodDiamondState): {
  level: number;
  title: string;
  coins: number;
  netWorth: number;
  totalMined: number;
  totalSold: number;
  totalPolished: number;
  bloodDiamondsFound: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  streak: number;
  day: number;
  activeShaftName: string;
  inventorySize: number;
  polishedSize: number;
  jewelryCount: number;
} {
  return {
    level: state.level,
    title: bdGetMinerTitle(state),
    coins: state.coins,
    netWorth: bdGetNetWorth(state),
    totalMined: state.totalMined,
    totalSold: state.totalSold,
    totalPolished: state.totalPolished,
    bloodDiamondsFound: state.bloodDiamondsFound,
    achievementsUnlocked: state.achievements.length,
    achievementsTotal: BD_ACHIEVEMENTS.length,
    streak: state.streak,
    day: state.day,
    activeShaftName: BD_MINE_SHAFTS[state.activeShaft]?.name ?? 'Unknown',
    inventorySize: state.inventory.length,
    polishedSize: state.polishedGems.length,
    jewelryCount: state.jewelryCrafted.length,
  };
}

// ------------------------------------------------------------
// 40. Game Summary — Serialization Helpers
// ------------------------------------------------------------

/** Serialize state to a plain JSON-compatible object for persistence. */
export function bdSerializeState(state: BloodDiamondState): string {
  return JSON.stringify(state);
}

/** Deserialize state from a JSON string. */
export function bdDeserializeState(json: string): BloodDiamondState | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed.level === 'number') {
      return parsed as BloodDiamondState;
    }
    return null;
  } catch {
    return null;
  }
}

/** Validate that a state object conforms to the expected shape. */
export function bdValidateState(state: unknown): state is BloodDiamondState {
  if (typeof state !== 'object' || state === null) return false;
  const s = state as Record<string, unknown>;
  return (
    typeof s.level === 'number' &&
    typeof s.xp === 'number' &&
    typeof s.coins === 'number' &&
    Array.isArray(s.inventory) &&
    Array.isArray(s.polishedGems) &&
    Array.isArray(s.jewelryCrafted) &&
    Array.isArray(s.achievements)
  );
}

// ------------------------------------------------------------
// 41. Mine full action (swing + mine + risk event)
// ------------------------------------------------------------

/**
 * Complete mining turn: swing pickaxe, mine gems, process risk event.
 * Returns the new state along with event info.
 */
export function bdFullMineTurn(
  state: BloodDiamondState,
  swingTiming: number,
  shaftId?: number,
): {
  state: BloodDiamondState;
  swingResult: SwingResult;
  riskEvent: { event: string; message: string };
  gemsFound: number;
} {
  const swingResult = bdEvaluateSwing(swingTiming);
  const afterMine = bdMine(state, shaftId, swingTiming);
  const shaft = shaftId ?? state.activeShaft;
  const riskResult = bdProcessRiskEvent(afterMine, shaft);

  return {
    state: bdCheckAchievements(riskResult.state),
    swingResult,
    riskEvent: { event: riskResult.event, message: riskResult.message },
    gemsFound: afterMine.totalMined - state.totalMined,
  };
}

// ------------------------------------------------------------
// 42. Bulk actions
// ------------------------------------------------------------

/** Auto-polish all gems in inventory to their max (costs coins). */
export function bdAutoPolishAll(state: BloodDiamondState): BloodDiamondState {
  let s = { ...state };
  const gemIds = s.inventory.filter((g) => g.polishStage < 4).map((g) => g.id);
  for (const id of gemIds) {
    s = bdPolishGem(s, id);
  }
  return s;
}

/** Auto-cut all uncut polished gems with the best cut. */
export function bdAutoCutAll(state: BloodDiamondState): BloodDiamondState {
  let s = { ...state };
  const uncut = [...s.polishedGems, ...s.inventory].filter((g) => g.cut === null);
  for (const gem of uncut) {
    const bestCut = bdGetBestCutForValue(gem);
    s = bdCutGem(s, gem.id, bestCut);
  }
  return s;
}

// ------------------------------------------------------------
// 43. Constants Accessors
// ------------------------------------------------------------

/** Get mine upgrade definitions. */
export function bdGetUpgradeDefs(): MineUpgradeDef[] {
  return BD_MINE_UPGRADES;
}

/** Get polish stage names. */
export function bdGetPolishStages(): string[] {
  return [...BD_POLISH_LABELS];
}

/** Get VIP client templates. */
export function bdGetVIPClientTemplates(): VIPClient[] {
  return BD_VIP_CLIENTS.map((c) => ({ ...c }));
}

/** Get the number of mine shafts. */
export function bdGetShaftCount(): number {
  return BD_MINE_SHAFTS.length;
}

/** Get the number of gem types. */
export function bdGetGemTypeCount(): number {
  return BD_GEM_TYPES.length;
}

/** Get the number of cut styles. */
export function bdGetCutStyleCount(): number {
  return BD_CUT_STYLES.length;
}

/** Get the number of clarity grades. */
export function bdGetClarityGradeCount(): number {
  return BD_CLARITY_GRADES.length;
}

/** Get the number of jewelry recipes. */
export function bdGetRecipeCount(): number {
  return BD_JEWELRY_RECIPES.length;
}

// ============================================================
// 44. DEFAULT EXPORT — React Hook
// ============================================================
// React imports are ONLY allowed in this default export.
// No useMemo is used.
// ============================================================

export default function useBloodDiamond(initialState?: BloodDiamondState) {
  const [state, setState] = useState<BloodDiamondState>(
    initialState ?? bdCreateInitialState(),
  );

  // --- Mining ---
  const mine = useCallback(
    (shaftId?: number, swingTiming?: number) => {
      setState((prev) => bdMine(prev, shaftId, swingTiming));
    },
    [],
  );

  const fullMineTurn = useCallback(
    (swingTiming: number, shaftId?: number) => {
      setState((prev) => {
        const result = bdFullMineTurn(prev, swingTiming, shaftId);
        return result.state;
      });
    },
    [],
  );

  // --- Cutting ---
  const cutGem = useCallback(
    (gemId: string, cutStyle: CutStyle) => {
      setState((prev) => bdCutGem(prev, gemId, cutStyle));
    },
    [],
  );

  // --- Polishing ---
  const polishGem = useCallback(
    (gemId: string) => {
      setState((prev) => bdPolishGem(prev, gemId));
    },
    [],
  );

  // --- Selling ---
  const sellGem = useCallback(
    (gemId: string) => {
      setState((prev) => bdSellGem(prev, gemId));
    },
    [],
  );

  const sellAllPolished = useCallback(() => {
    setState((prev) => bdSellAllPolished(prev));
  }, []);

  const sellAllInventory = useCallback(() => {
    setState((prev) => bdSellAllInventory(prev));
  }, []);

  const sellJewelry = useCallback(
    (jewelryId: string) => {
      setState((prev) => bdSellJewelry(prev, jewelryId));
    },
    [],
  );

  // --- Shaft ---
  const setActiveShaft = useCallback(
    (shaftId: number) => {
      setState((prev) => bdSetActiveShaft(prev, shaftId));
    },
    [],
  );

  // --- Market ---
  const fluctuateMarket = useCallback(() => {
    setState((prev) => bdFluctuateMarket(prev));
  }, []);

  // --- VIP ---
  const fulfillOrder = useCallback(
    (clientId: string) => {
      setState((prev) => {
        const result = bdFulfillOrder(prev, clientId);
        return result?.state ?? prev;
      });
    },
    [],
  );

  // --- Jewelry ---
  const craftJewelry = useCallback(
    (recipeId: string) => {
      setState((prev) => bdCraftJewelry(prev, recipeId) ?? prev);
    },
    [],
  );

  // --- Upgrades ---
  const upgradeMine = useCallback(
    (upgradeId: string) => {
      setState((prev) => bdUpgradeMine(prev, upgradeId));
    },
    [],
  );

  // --- Daily ---
  const discoverVein = useCallback(() => {
    setState((prev) => bdDiscoverVein(prev));
  }, []);

  const advanceDay = useCallback(() => {
    setState((prev) => bdAdvanceDay(prev));
  }, []);

  const claimStreakBonus = useCallback(() => {
    setState((prev) => bdClaimStreakBonus(prev));
  }, []);

  // --- Inventory ---
  const moveToPolished = useCallback(
    (gemId: string) => {
      setState((prev) => bdMoveToPolished(prev, gemId));
    },
    [],
  );

  const moveToInventory = useCallback(
    (gemId: string) => {
      setState((prev) => bdMoveToInventory(prev, gemId));
    },
    [],
  );

  // --- Reset ---
  const reset = useCallback(() => {
    setState(bdCreateInitialState());
  }, []);

  // --- Direct computed values (no useMemo) ---
  const level = state.level;
  const xp = state.xp;
  const coins = state.coins;
  const streak = state.streak;
  const day = state.day;
  const activeShaft = state.activeShaft;
  const minerTitle = bdGetMinerTitle(state);
  const levelProgress = bdGetLevelProgress(state);
  const xpToNext = bdGetXPToNextLevel(state);
  const netWorth = bdGetNetWorth(state);
  const fortune = bdGetFortune(state);
  const achievementCount = state.achievements.length;
  const totalAchievements = BD_ACHIEVEMENTS.length;
  const shaftInfo = BD_MINE_SHAFTS[state.activeShaft];
  const inventoryValue = bdGetTotalInventoryValue(state);
  const stats = bdGetStatsSummary(state);
  const marketPrices = state.marketPrices;
  const marketSummary = bdGetMarketSummary(state);

  return {
    // State
    state,
    // Actions
    mine,
    fullMineTurn,
    cutGem,
    polishGem,
    sellGem,
    sellAllPolished,
    sellAllInventory,
    sellJewelry,
    setActiveShaft,
    fluctuateMarket,
    fulfillOrder,
    craftJewelry,
    upgradeMine,
    discoverVein,
    advanceDay,
    claimStreakBonus,
    moveToPolished,
    moveToInventory,
    reset,
    // Computed
    level,
    xp,
    coins,
    streak,
    day,
    activeShaft,
    minerTitle,
    levelProgress,
    xpToNext,
    netWorth,
    fortune,
    achievementCount,
    totalAchievements,
    shaftInfo,
    inventoryValue,
    stats,
    marketPrices,
    marketSummary,
  };
}
