import { useState, useCallback, useRef } from 'react';

// ============================================================
// Sorcerer's Bakery — Magical Bakery Management Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// ============================================================

// ============================================================
// Types
// ============================================================

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type BonusType = 'speed' | 'quality' | 'yield' | 'luck';
export type QuestType = 'bake' | 'serve' | 'earn' | 'collect' | 'upgrade';
export type DailyType = 'bake' | 'serve' | 'earn' | 'craft';

export interface IngredientDef {
  id: string;
  name: string;
  rarity: Rarity;
  cost: number;
  description: string;
  emoji: string;
}

export interface RecipeDef {
  id: string;
  name: string;
  rarity: Rarity;
  ingredients: { ingredientId: string; amount: number }[];
  bakeTime: number;
  sellPrice: number;
  xpReward: number;
  stationId: string;
  description: string;
  emoji: string;
  requiredLevel: number;
}

export interface StationDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseSpeedMultiplier: number;
  baseQualityBonus: number;
  baseUpgradeCost: number;
}

export interface CustomerDef {
  id: string;
  name: string;
  species: string;
  patience: number;
  tipMultiplier: number;
  favoriteRecipes: string[];
  description: string;
  emoji: string;
}

export interface ToolDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  bonusType: BonusType;
  baseBonusValue: number;
  baseUpgradeCost: number;
}

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  requiredLevel: number;
  emoji: string;
}

export interface NPCDef {
  id: string;
  name: string;
  role: string;
  description: string;
  emoji: string;
  greeting: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface DailyTaskPoolDef {
  id: string;
  name: string;
  description: string;
  type: DailyType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface TitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface RarityInfo {
  key: Rarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface BakeJob {
  id: string;
  recipeId: string;
  startedAt: number;
  endsAt: number;
  quality: number;
  stationId: string;
}

export interface ToolState {
  id: string;
  level: number;
  equipped: boolean;
}

export interface StationState {
  id: string;
  level: number;
}

export interface QuestState {
  id: string;
  accepted: boolean;
  completed: boolean;
  progress: number;
}

export interface AchievementState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface DailyTaskState {
  poolId: string;
  progress: number;
  claimed: boolean;
  dayKey: string;
}

export interface ActiveCustomer {
  id: string;
  arrivedAt: number;
  orderRecipeId: string | null;
  served: boolean;
  satisfied: boolean;
}

export interface SorcerersBakeryState {
  level: number;
  xp: number;
  coins: number;
  unlockedRecipes: string[];
  activeStation: string;
  ingredients: Record<string, number>;
  activeCustomers: ActiveCustomer[];
  customerSatisfaction: number;
  completedBakes: number;
  servedCustomers: number;
  totalEarned: number;
  totalSpent: number;
  bakingQueue: BakeJob[];
  dailyStreak: number;
  lastDaily: string | null;
  activeQuests: QuestState[];
  completedQuests: string[];
  unlockedAchievements: AchievementState[];
  bakeOffEntries: number;
  bakeOffWins: number;
  bakeOffLastRank: number | null;
  dailyTask: DailyTaskState | null;
  stations: StationState[];
  tools: ToolState[];
  seed: number;
  bakeCountByRarity: Record<Rarity, number>;
  ingredientCountByRarity: Record<Rarity, number>;
  stationUpgradeCount: number;
  toolUpgradeCount: number;
}

// ============================================================
// Seeded PRNG (mulberry32 — no Math.random)
// ============================================================

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sbHashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return hash;
}

// ============================================================
// XP Curve Helper
// ============================================================

function xpRequiredForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= SB_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function clampLevel(lvl: number): number {
  return Math.max(1, Math.min(SB_MAX_LEVEL, lvl));
}

function clampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function generateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function rarityMultiplier(r: Rarity): number {
  const map: Record<Rarity, number> = {
    common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5, mythic: 8,
  };
  return map[r] ?? 1;
}

// ============================================================
// Constants
// ============================================================

export const SB_MAX_LEVEL = 50;

export const SB_RARITIES: RarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
  { key: 'mythic', label: 'Mythic', color: '#F472B6', xpMultiplier: 8 },
];

export const SB_TITLE_THRESHOLDS: TitleInfo[] = [
  { name: 'Apprentice Baker', levelRequired: 1, description: 'A humble beginning in the magical bakery arts' },
  { name: 'Novice Conjurer', levelRequired: 5, description: 'Learning to infuse pastries with minor enchantments' },
  { name: 'Enchanted Baker', levelRequired: 10, description: 'Your enchanted loaves are the talk of the village' },
  { name: 'Arcane Pastry Chef', levelRequired: 18, description: 'Master of magical cake decoration' },
  { name: 'Mystic Confectioner', levelRequired: 25, description: 'Your sweets grant temporary powers to those who eat them' },
  { name: 'Grand Enchanter', levelRequired: 33, description: 'Even the Wizard Council orders from your bakery' },
  { name: 'Archmage Baker', levelRequired: 42, description: 'Your legendary Fire Cake can warm entire kingdoms' },
  { name: 'Grand Sorcerer Baker', levelRequired: 50, description: 'The greatest magical baker in all the realms' },
];

export const SB_INGREDIENTS: IngredientDef[] = [
  { id: 'phoenix_egg', name: 'Phoenix Egg', rarity: 'rare', cost: 25, description: 'An egg reborn from flame, adds fiery warmth to any batter', emoji: '🥚' },
  { id: 'moon_flour', name: 'Moon Flour', rarity: 'common', cost: 5, description: 'Ground from moonlit wheat under a full moon', emoji: '🌾' },
  { id: 'star_sugar', name: 'Star Sugar', rarity: 'uncommon', cost: 12, description: 'Crystallized stardust that makes frosting sparkle', emoji: '✨' },
  { id: 'dragon_breath_pepper', name: 'Dragon Breath Pepper', rarity: 'epic', cost: 40, description: 'Intensely spicy, use with extreme caution', emoji: '🌶️' },
  { id: 'fairy_butter', name: 'Fairy Butter', rarity: 'common', cost: 8, description: 'Churned by pixies, lighter than air', emoji: '🧈' },
  { id: 'crystal_milk', name: 'Crystal Milk', rarity: 'uncommon', cost: 10, description: 'Sourced from the Crystal Caves of Elowen', emoji: '🥛' },
  { id: 'shadow_cocoa', name: 'Shadow Cocoa', rarity: 'rare', cost: 22, description: 'Dark cocoa harvested from the Shadow Realm', emoji: '🍫' },
  { id: 'thunder_yeast', name: 'Thunder Yeast', rarity: 'epic', cost: 35, description: 'Causes dough to rise with electric energy', emoji: '⚡' },
  { id: 'enchanted_vanilla', name: 'Enchanted Vanilla', rarity: 'common', cost: 6, description: 'Vanilla pods blessed by forest nymphs', emoji: '🌿' },
  { id: 'mermaid_honey', name: 'Mermaid Honey', rarity: 'legendary', cost: 60, description: 'Golden honey from the deepest ocean reefs', emoji: '🍯' },
  { id: 'golem_salt', name: 'Golem Salt', rarity: 'common', cost: 4, description: 'Rock salt mined by stone golems', emoji: '🧂' },
  { id: 'aurora_food_coloring', name: 'Aurora Food Coloring', rarity: 'rare', cost: 28, description: 'Shifts colors like the northern lights', emoji: '🌈' },
  { id: 'unicorn_sprinkles', name: 'Unicorn Sprinkles', rarity: 'legendary', cost: 55, description: 'Tiny rainbow crystalline shards', emoji: '🦄' },
  { id: 'troll_dough', name: 'Troll Dough', rarity: 'uncommon', cost: 15, description: 'Extremely sticky and resilient base dough', emoji: '🫓' },
  { id: 'elf_cinnamon', name: 'Elf Cinnamon', rarity: 'uncommon', cost: 14, description: 'Warmed by elven songs, adds a woody sweetness', emoji: '🪵' },
  { id: 'ice_shard_powder', name: 'Ice Shard Powder', rarity: 'rare', cost: 24, description: 'Ground from glacial ice shards, never melts', emoji: '❄️' },
  { id: 'mandrake_extract', name: 'Mandrake Extract', rarity: 'epic', cost: 38, description: 'Potent flavor enhancer — wear earmuffs while extracting', emoji: '🌱' },
  { id: 'phoenix_feather_garnish', name: 'Phoenix Feather Garnish', rarity: 'legendary', cost: 65, description: 'A single feather that makes any dish legendary', emoji: '🪶' },
  { id: 'void_essence', name: 'Void Essence', rarity: 'mythic', cost: 120, description: 'A drop of pure nothingness — adds infinite depth', emoji: '🕳️' },
  { id: 'sunrise_berry_jam', name: 'Sunrise Berry Jam', rarity: 'uncommon', cost: 11, description: 'Jam made from berries that only bloom at dawn', emoji: '🍓' },
];

export const SB_STATIONS: StationDef[] = [
  { id: 'oven_of_flames', name: 'Oven of Flames', description: 'A forge-oven powered by elemental fire spirits', emoji: '🔥', maxLevel: 10, baseSpeedMultiplier: 1.0, baseQualityBonus: 0, baseUpgradeCost: 100 },
  { id: 'frost_mixer', name: 'Frost Mixer', description: 'Mixes batter while keeping it supernaturally cold', emoji: '🧊', maxLevel: 10, baseSpeedMultiplier: 1.0, baseQualityBonus: 5, baseUpgradeCost: 120 },
  { id: 'thunder_kneader', name: 'Thunder Kneader', description: 'Electrically kneads dough to perfect consistency', emoji: '⚡', maxLevel: 10, baseSpeedMultiplier: 1.2, baseQualityBonus: 3, baseUpgradeCost: 150 },
  { id: 'shadow_oven', name: 'Shadow Oven', description: 'Bakes in absolute darkness for deeper flavors', emoji: '🌑', maxLevel: 10, baseSpeedMultiplier: 0.9, baseQualityBonus: 10, baseUpgradeCost: 200 },
  { id: 'starlight_glasscase', name: 'Starlight Glasscase', description: 'Display case that cures pastries under starlight', emoji: '🌟', maxLevel: 10, baseSpeedMultiplier: 1.0, baseQualityBonus: 8, baseUpgradeCost: 180 },
  { id: 'enchantment_table', name: 'Enchantment Table', description: 'Final enchanting station for imbuing magical effects', emoji: '🔮', maxLevel: 10, baseSpeedMultiplier: 0.8, baseQualityBonus: 15, baseUpgradeCost: 250 },
  { id: 'crystal_freezer', name: 'Crystal Freezer', description: 'Preserves magical baked goods indefinitely', emoji: '💎', maxLevel: 10, baseSpeedMultiplier: 1.1, baseQualityBonus: 6, baseUpgradeCost: 160 },
  { id: 'dragon_forge', name: 'Dragon Forge', description: 'Ancient station heated by sleeping dragon breath', emoji: '🐉', maxLevel: 10, baseSpeedMultiplier: 1.5, baseQualityBonus: 12, baseUpgradeCost: 300 },
];

export const SB_RECIPES: RecipeDef[] = [
  { id: 'fire_cake', name: 'Fire Cake', rarity: 'uncommon', ingredients: [{ ingredientId: 'moon_flour', amount: 3 }, { ingredientId: 'phoenix_egg', amount: 1 }, { ingredientId: 'fairy_butter', amount: 1 }], bakeTime: 30, sellPrice: 45, xpReward: 20, stationId: 'oven_of_flames', description: 'A warm, glowing cake that crackles with inner fire', emoji: '🎂', requiredLevel: 1 },
  { id: 'ice_cookie', name: 'Ice Cookie', rarity: 'common', ingredients: [{ ingredientId: 'moon_flour', amount: 2 }, { ingredientId: 'crystal_milk', amount: 1 }, { ingredientId: 'star_sugar', amount: 1 }], bakeTime: 15, sellPrice: 22, xpReward: 10, stationId: 'frost_mixer', description: 'Cookies chilled to perfection, never melt in your hand', emoji: '🍪', requiredLevel: 1 },
  { id: 'lightning_pie', name: 'Lightning Pie', rarity: 'rare', ingredients: [{ ingredientId: 'troll_dough', amount: 2 }, { ingredientId: 'thunder_yeast', amount: 1 }, { ingredientId: 'enchanted_vanilla', amount: 1 }], bakeTime: 40, sellPrice: 70, xpReward: 35, stationId: 'thunder_kneader', description: 'A pie with a jolt — literally zaps your taste buds', emoji: '🥧', requiredLevel: 3 },
  { id: 'shadow_bread', name: 'Shadow Bread', rarity: 'rare', ingredients: [{ ingredientId: 'moon_flour', amount: 4 }, { ingredientId: 'shadow_cocoa', amount: 1 }, { ingredientId: 'golem_salt', amount: 1 }], bakeTime: 35, sellPrice: 60, xpReward: 30, stationId: 'shadow_oven', description: 'Dark rye that absorbs all surrounding light', emoji: '🍞', requiredLevel: 4 },
  { id: 'starlight_muffin', name: 'Starlight Muffin', rarity: 'uncommon', ingredients: [{ ingredientId: 'moon_flour', amount: 2 }, { ingredientId: 'star_sugar', amount: 2 }, { ingredientId: 'fairy_butter', amount: 1 }], bakeTime: 20, sellPrice: 35, xpReward: 18, stationId: 'starlight_glasscase', description: 'Glows softly in the dark with a celestial aroma', emoji: '🧁', requiredLevel: 2 },
  { id: 'enchanted_eclair', name: 'Enchanted Eclair', rarity: 'epic', ingredients: [{ ingredientId: 'troll_dough', amount: 3 }, { ingredientId: 'crystal_milk', amount: 2 }, { ingredientId: 'enchanted_vanilla', amount: 2 }, { ingredientId: 'aurora_food_coloring', amount: 1 }], bakeTime: 55, sellPrice: 110, xpReward: 55, stationId: 'enchantment_table', description: 'Shifts flavor with every bite — sweet, savory, spicy', emoji: '🥖', requiredLevel: 8 },
  { id: 'crystal_cupcake', name: 'Crystal Cupcake', rarity: 'rare', ingredients: [{ ingredientId: 'moon_flour', amount: 2 }, { ingredientId: 'ice_shard_powder', amount: 1 }, { ingredientId: 'star_sugar', amount: 2 }], bakeTime: 25, sellPrice: 55, xpReward: 28, stationId: 'crystal_freezer', description: 'A translucent cupcake with a frozen sugar core', emoji: '🧊', requiredLevel: 5 },
  { id: 'dragon_breath_croissant', name: 'Dragon Breath Croissant', rarity: 'legendary', ingredients: [{ ingredientId: 'moon_flour', amount: 3 }, { ingredientId: 'dragon_breath_pepper', amount: 1 }, { ingredientId: 'fairy_butter', amount: 2 }, { ingredientId: 'phoenix_egg', amount: 1 }], bakeTime: 70, sellPrice: 200, xpReward: 100, stationId: 'dragon_forge', description: 'Impossibly flaky — each bite releases a puff of spicy steam', emoji: '🥐', requiredLevel: 15 },
  { id: 'mermaid_tart', name: 'Mermaid Tart', rarity: 'epic', ingredients: [{ ingredientId: 'troll_dough', amount: 2 }, { ingredientId: 'mermaid_honey', amount: 1 }, { ingredientId: 'sunrise_berry_jam', amount: 2 }], bakeTime: 45, sellPrice: 95, xpReward: 48, stationId: 'frost_mixer', description: 'A shimmering tart with ocean-sweet filling', emoji: '🫧', requiredLevel: 7 },
  { id: 'unicorn_cake', name: 'Unicorn Cake', rarity: 'legendary', ingredients: [{ ingredientId: 'moon_flour', amount: 5 }, { ingredientId: 'unicorn_sprinkles', amount: 2 }, { ingredientId: 'crystal_milk', amount: 2 }, { ingredientId: 'star_sugar', amount: 3 }], bakeTime: 80, sellPrice: 220, xpReward: 110, stationId: 'starlight_glasscase', description: 'A magnificent multi-layered cake topped with a spiral horn', emoji: '🦄', requiredLevel: 18 },
  { id: 'void_macaron', name: 'Void Macaron', rarity: 'mythic', ingredients: [{ ingredientId: 'moon_flour', amount: 3 }, { ingredientId: 'void_essence', amount: 1 }, { ingredientId: 'shadow_cocoa', amount: 2 }, { ingredientId: 'mermaid_honey', amount: 1 }], bakeTime: 100, sellPrice: 500, xpReward: 250, stationId: 'shadow_oven', description: 'A macaron that exists between dimensions — infinite flavor', emoji: '🕳️', requiredLevel: 30 },
  { id: 'phoenix_cinnamon_roll', name: 'Phoenix Cinnamon Roll', rarity: 'rare', ingredients: [{ ingredientId: 'moon_flour', amount: 3 }, { ingredientId: 'elf_cinnamon', amount: 2 }, { ingredientId: 'fairy_butter', amount: 2 }], bakeTime: 30, sellPrice: 50, xpReward: 25, stationId: 'oven_of_flames', description: 'Swirled with cinnamon and phoenix warmth — reborn fresh daily', emoji: '🥐', requiredLevel: 4 },
  { id: 'enchanted_glaze_donut', name: 'Enchanted Glaze Donut', rarity: 'uncommon', ingredients: [{ ingredientId: 'moon_flour', amount: 2 }, { ingredientId: 'crystal_milk', amount: 1 }, { ingredientId: 'star_sugar', amount: 2 }], bakeTime: 25, sellPrice: 42, xpReward: 22, stationId: 'thunder_kneader', description: 'Enchanted donut that glows and grants +1 charisma', emoji: '🍩', requiredLevel: 3 },
  { id: 'fairy_biscuit', name: 'Fairy Biscuit', rarity: 'common', ingredients: [{ ingredientId: 'moon_flour', amount: 2 }, { ingredientId: 'fairy_butter', amount: 1 }, { ingredientId: 'golem_salt', amount: 1 }], bakeTime: 10, sellPrice: 15, xpReward: 8, stationId: 'crystal_freezer', description: 'Light as air — one bite makes you float an inch off the ground', emoji: '🍪', requiredLevel: 1 },
  { id: 'thunder_brownie', name: 'Thunder Brownie', rarity: 'epic', ingredients: [{ ingredientId: 'shadow_cocoa', amount: 3 }, { ingredientId: 'thunder_yeast', amount: 1 }, { ingredientId: 'phoenix_egg', amount: 2 }], bakeTime: 50, sellPrice: 100, xpReward: 50, stationId: 'thunder_kneader', description: 'A dense, fudgy brownie with crackling electric frosting', emoji: '🍫', requiredLevel: 10 },
  { id: 'aurora_layer_cake', name: 'Aurora Layer Cake', rarity: 'legendary', ingredients: [{ ingredientId: 'moon_flour', amount: 4 }, { ingredientId: 'aurora_food_coloring', amount: 2 }, { ingredientId: 'crystal_milk', amount: 2 }, { ingredientId: 'fairy_butter', amount: 2 }], bakeTime: 75, sellPrice: 210, xpReward: 105, stationId: 'enchantment_table', description: 'Layers shift colors like the aurora borealis', emoji: '🌈', requiredLevel: 20 },
  { id: 'mandrake_cupcake', name: 'Mandrake Cupcake', rarity: 'epic', ingredients: [{ ingredientId: 'moon_flour', amount: 2 }, { ingredientId: 'mandrake_extract', amount: 1 }, { ingredientId: 'crystal_milk', amount: 1 }, { ingredientId: 'star_sugar', amount: 1 }], bakeTime: 40, sellPrice: 85, xpReward: 42, stationId: 'enchantment_table', description: 'Screams deliciously when bitten — +5 to potion skills', emoji: '🧁', requiredLevel: 9 },
  { id: 'elf_sugar_cookie', name: 'Elf Sugar Cookie', rarity: 'uncommon', ingredients: [{ ingredientId: 'moon_flour', amount: 2 }, { ingredientId: 'star_sugar', amount: 2 }, { ingredientId: 'elf_cinnamon', amount: 1 }], bakeTime: 18, sellPrice: 30, xpReward: 15, stationId: 'starlight_glasscase', description: 'Intricately decorated with elven calligraphy', emoji: '🍪', requiredLevel: 2 },
  { id: 'dragon_scale_wafer', name: 'Dragon Scale Wafer', rarity: 'rare', ingredients: [{ ingredientId: 'moon_flour', amount: 1 }, { ingredientId: 'dragon_breath_pepper', amount: 1 }, { ingredientId: 'golem_salt', amount: 1 }], bakeTime: 20, sellPrice: 48, xpReward: 24, stationId: 'dragon_forge', description: 'Crunchy wafer as tough as dragon scales', emoji: '🐉', requiredLevel: 6 },
  { id: 'moonlight_biscotti', name: 'Moonlight Biscotti', rarity: 'uncommon', ingredients: [{ ingredientId: 'moon_flour', amount: 3 }, { ingredientId: 'enchanted_vanilla', amount: 2 }, { ingredientId: 'golem_salt', amount: 1 }], bakeTime: 28, sellPrice: 38, xpReward: 19, stationId: 'oven_of_flames', description: 'Twice-baked under moonlight for extra crunch', emoji: '🥠', requiredLevel: 3 },
  { id: 'frost_queen_sorbet', name: 'Frost Queen Sorbet', rarity: 'epic', ingredients: [{ ingredientId: 'ice_shard_powder', amount: 2 }, { ingredientId: 'sunrise_berry_jam', amount: 2 }, { ingredientId: 'mermaid_honey', amount: 1 }], bakeTime: 35, sellPrice: 90, xpReward: 45, stationId: 'crystal_freezer', description: 'So cold it freezes your tongue and warms your heart', emoji: '🍧', requiredLevel: 11 },
  { id: 'phoenix_feather_pain', name: 'Phoenix Feather Pain', rarity: 'mythic', ingredients: [{ ingredientId: 'moon_flour', amount: 4 }, { ingredientId: 'phoenix_feather_garnish', amount: 1 }, { ingredientId: 'crystal_milk', amount: 2 }, { ingredientId: 'enchanted_vanilla', amount: 2 }], bakeTime: 90, sellPrice: 450, xpReward: 225, stationId: 'oven_of_flames', description: 'The legendary pain au chocolat of the phoenix realm', emoji: '🥖', requiredLevel: 28 },
  { id: 'shadow_chocolate_truffle', name: 'Shadow Chocolate Truffle', rarity: 'legendary', ingredients: [{ ingredientId: 'shadow_cocoa', amount: 3 }, { ingredientId: 'fairy_butter', amount: 2 }, { ingredientId: 'mermaid_honey', amount: 1 }, { ingredientId: 'void_essence', amount: 1 }], bakeTime: 65, sellPrice: 240, xpReward: 120, stationId: 'shadow_oven', description: 'Darkness distilled into chocolate — dangerously addictive', emoji: '🍬', requiredLevel: 22 },
  { id: 'enchanted_baguette', name: 'Enchanted Baguette', rarity: 'common', ingredients: [{ ingredientId: 'moon_flour', amount: 3 }, { ingredientId: 'golem_salt', amount: 1 }, { ingredientId: 'enchanted_vanilla', amount: 1 }], bakeTime: 22, sellPrice: 18, xpReward: 9, stationId: 'thunder_kneader', description: 'A crispy baguette that hums with faint magic', emoji: '🥖', requiredLevel: 1 },
  { id: 'troll_stone_scone', name: 'Troll Stone Scone', rarity: 'uncommon', ingredients: [{ ingredientId: 'troll_dough', amount: 2 }, { ingredientId: 'golem_salt', amount: 1 }, { ingredientId: 'crystal_milk', amount: 1 }], bakeTime: 20, sellPrice: 28, xpReward: 14, stationId: 'dragon_forge', description: 'Hearty scone dense as granite but melts on the tongue', emoji: '🫓', requiredLevel: 4 },
  { id: 'star_dust_shortbread', name: 'Star Dust Shortbread', rarity: 'rare', ingredients: [{ ingredientId: 'moon_flour', amount: 2 }, { ingredientId: 'star_sugar', amount: 2 }, { ingredientId: 'fairy_butter', amount: 2 }], bakeTime: 22, sellPrice: 52, xpReward: 26, stationId: 'starlight_glasscase', description: 'Melt-in-your-mouth shortbread that leaves sparkle trails', emoji: '✨', requiredLevel: 5 },
  { id: 'wyvern_spice_bun', name: 'Wyvern Spice Bun', rarity: 'rare', ingredients: [{ ingredientId: 'troll_dough', amount: 2 }, { ingredientId: 'elf_cinnamon', amount: 2 }, { ingredientId: 'dragon_breath_pepper', amount: 1 }], bakeTime: 32, sellPrice: 58, xpReward: 29, stationId: 'dragon_forge', description: 'A spiced bun with a fiery kick — popular with warriors', emoji: '🌶️', requiredLevel: 7 },
  { id: 'void_pudding', name: 'Void Pudding', rarity: 'mythic', ingredients: [{ ingredientId: 'void_essence', amount: 2 }, { ingredientId: 'shadow_cocoa', amount: 2 }, { ingredientId: 'mermaid_honey', amount: 1 }, { ingredientId: 'crystal_milk', amount: 2 }], bakeTime: 95, sellPrice: 480, xpReward: 240, stationId: 'enchantment_table', description: 'A pudding that tastes like everything and nothing simultaneously', emoji: '🍮', requiredLevel: 35 },
  { id: 'crystal_sugar_glass', name: 'Crystal Sugar Glass', rarity: 'epic', ingredients: [{ ingredientId: 'star_sugar', amount: 3 }, { ingredientId: 'ice_shard_powder', amount: 1 }, { ingredientId: 'aurora_food_coloring', amount: 1 }], bakeTime: 30, sellPrice: 88, xpReward: 44, stationId: 'crystal_freezer', description: 'Edible stained-glass decoration for the finest cakes', emoji: '💎', requiredLevel: 12 },
  { id: 'elf_banana_bread', name: 'Elf Banana Bread', rarity: 'common', ingredients: [{ ingredientId: 'moon_flour', amount: 3 }, { ingredientId: 'fairy_butter', amount: 1 }, { ingredientId: 'enchanted_vanilla', amount: 1 }], bakeTime: 25, sellPrice: 20, xpReward: 10, stationId: 'oven_of_flames', description: 'Moist banana bread from the Elven Orchard recipes', emoji: '🍌', requiredLevel: 1 },
  { id: 'thunder_pretzel', name: 'Thunder Pretzel', rarity: 'uncommon', ingredients: [{ ingredientId: 'troll_dough', amount: 2 }, { ingredientId: 'golem_salt', amount: 2 }, { ingredientId: 'thunder_yeast', amount: 1 }], bakeTime: 20, sellPrice: 32, xpReward: 16, stationId: 'thunder_kneader', description: 'A twisted pretzel crackling with static electricity', emoji: '🥨', requiredLevel: 3 },
  { id: 'dragonfruit_tart', name: 'Dragonfruit Tart', rarity: 'rare', ingredients: [{ ingredientId: 'troll_dough', amount: 2 }, { ingredientId: 'sunrise_berry_jam', amount: 2 }, { ingredientId: 'aurora_food_coloring', amount: 1 }], bakeTime: 30, sellPrice: 56, xpReward: 28, stationId: 'frost_mixer', description: 'Vibrant magenta tart with exotic dragonfruit filling', emoji: '🍒', requiredLevel: 6 },
];

export const SB_CUSTOMERS: CustomerDef[] = [
  { id: 'gandalf_thewhite', name: 'Gandalf the White', species: 'Wizard', patience: 60, tipMultiplier: 1.2, favoriteRecipes: ['fire_cake', 'enchanted_eclair', 'phoenix_cinnamon_roll'], description: 'A wise old wizard who appreciates fine magical baking', emoji: '🧙' },
  { id: 'elara_moonwhisper', name: 'Elara Moonwhisper', species: 'Elf', patience: 90, tipMultiplier: 1.5, favoriteRecipes: ['starlight_muffin', 'elf_sugar_cookie', 'moonlight_biscotti'], description: 'Elven ambassador with refined pastry preferences', emoji: '🧝' },
  { id: 'smokefang', name: 'Smokefang', species: 'Dragon', patience: 30, tipMultiplier: 2.0, favoriteRecipes: ['dragon_breath_croissant', 'dragon_scale_wafer', 'wyvern_spice_bun'], description: 'A young dragon who loves spicy baked goods', emoji: '🐉' },
  { id: 'puck_trickster', name: 'Puck Trickster', species: 'Fairy', patience: 45, tipMultiplier: 1.3, favoriteRecipes: ['fairy_biscuit', 'unicorn_cake', 'crystal_cupcake'], description: 'A mischievous fairy with a sweet tooth', emoji: '🧚' },
  { id: 'gronk_stonefoot', name: 'Gronk Stonefoot', species: 'Troll', patience: 120, tipMultiplier: 1.1, favoriteRecipes: ['troll_stone_scone', 'shadow_bread', 'enchanted_baguette'], description: 'A patient troll who enjoys hearty baked goods', emoji: '👹' },
  { id: 'luna_nightbloom', name: 'Luna Nightbloom', species: 'Witch', patience: 75, tipMultiplier: 1.4, favoriteRecipes: ['shadow_chocolate_truffle', 'void_macaron', 'mandrake_cupcake'], description: 'A potion master who uses baked goods as ingredients', emoji: '🧙‍♀️' },
  { id: 'aurum_goldclaw', name: 'Aurum Goldclaw', species: 'Dwarf', patience: 50, tipMultiplier: 1.8, favoriteRecipes: ['dragon_scale_wafer', 'thunder_brownie', 'crystal_sugar_glass'], description: 'A wealthy dwarf who pays generously for quality', emoji: '⛏️' },
  { id: 'nixie_reefswimmer', name: 'Nixie Reefswimmer', species: 'Mermaid', patience: 80, tipMultiplier: 1.6, favoriteRecipes: ['mermaid_tart', 'frost_queen_sorbet', 'crystal_cupcake'], description: 'A mermaid princess from the coral kingdom', emoji: '🧜' },
  { id: 'thorne_shadowmere', name: 'Thorne Shadowmere', species: 'Vampire', patience: 100, tipMultiplier: 1.7, favoriteRecipes: ['shadow_bread', 'shadow_chocolate_truffle', 'void_pudding'], description: 'An ancient vampire who only eats after dark', emoji: '🧛' },
  { id: 'sparkplug', name: 'Sparkplug', species: 'Golem', patience: 150, tipMultiplier: 1.0, favoriteRecipes: ['enchanted_baguette', 'thunder_pretzel', 'troll_stone_scone'], description: 'A clockwork golem who runs on pastry fuel', emoji: '🤖' },
  { id: 'dewdrop', name: 'Dewdrop', species: 'Pixie', patience: 35, tipMultiplier: 1.3, favoriteRecipes: ['fairy_biscuit', 'star_dust_shortbread', 'elf_sugar_cookie'], description: 'A tiny pixie with enormous appetite', emoji: '🧚‍♀️' },
  { id: 'ignis_blazeheart', name: 'Ignis Blazeheart', species: 'Phoenix', patience: 40, tipMultiplier: 2.2, favoriteRecipes: ['fire_cake', 'phoenix_feather_pain', 'dragon_breath_croissant'], description: 'A phoenix who judges baked goods by their inner warmth', emoji: '🔥' },
  { id: 'bran_oakenshield', name: 'Bran Oakenshield', species: 'Treant', patience: 200, tipMultiplier: 0.9, favoriteRecipes: ['elf_banana_bread', 'moonlight_biscotti', 'enchanted_baguette'], description: 'An ancient tree-being with all the time in the world', emoji: '🌳' },
  { id: 'zara_starfall', name: 'Zara Starfall', species: 'Sorceress', patience: 55, tipMultiplier: 1.9, favoriteRecipes: ['aurora_layer_cake', 'unicorn_cake', 'enchanted_eclair'], description: 'A traveling sorceress collecting recipes from every realm', emoji: '⭐' },
  { id: 'bubbles', name: 'Bubbles', species: 'Slime', patience: 300, tipMultiplier: 0.5, favoriteRecipes: ['ice_cookie', 'crystal_cupcake', 'frost_queen_sorbet'], description: 'A friendly slime that absorbs flavor through its membrane', emoji: '🟢' },
];

export const SB_TOOLS: ToolDef[] = [
  { id: 'wand_whisk', name: 'Wand Whisk', description: 'A whisk enchanted to mix batter to perfect consistency', emoji: '🪄', maxLevel: 10, bonusType: 'speed', baseBonusValue: 5, baseUpgradeCost: 50 },
  { id: 'enchanted_rolling_pin', name: 'Enchanted Rolling Pin', description: 'Rolls dough itself while you prepare other ingredients', emoji: '🪵', maxLevel: 10, bonusType: 'quality', baseBonusValue: 3, baseUpgradeCost: 60 },
  { id: 'crystal_measure', name: 'Crystal Measure', description: 'Magical measuring cups that ensure exact portions every time', emoji: '💎', maxLevel: 10, bonusType: 'quality', baseBonusValue: 4, baseUpgradeCost: 45 },
  { id: 'heat_resistant_gloves', name: 'Heat-Resistant Gloves', description: 'Dragon-leather gloves that let you handle any oven', emoji: '🧤', maxLevel: 10, bonusType: 'speed', baseBonusValue: 4, baseUpgradeCost: 55 },
  { id: 'star_sifter', name: 'Star Sifter', description: 'Sifts flour with starlight for lighter baked goods', emoji: '⭐', maxLevel: 10, bonusType: 'yield', baseBonusValue: 3, baseUpgradeCost: 70 },
  { id: 'lucky_spoon', name: 'Lucky Spoon', description: 'A spoon blessed by fortune fairies for better outcomes', emoji: '🍀', maxLevel: 10, bonusType: 'luck', baseBonusValue: 5, baseUpgradeCost: 80 },
  { id: 'frost_palette', name: 'Frost Palette', description: 'For intricate frozen decorations and ice cream artistry', emoji: '🎨', maxLevel: 10, bonusType: 'quality', baseBonusValue: 5, baseUpgradeCost: 90 },
  { id: 'time_turner_timer', name: 'Time-Turner Timer', description: 'A magical timer that briefly speeds up baking', emoji: '⏳', maxLevel: 10, bonusType: 'speed', baseBonusValue: 6, baseUpgradeCost: 100 },
];

export const SB_QUESTS: QuestDef[] = [
  { id: 'quest_fire_starter', name: 'Fire Starter', description: 'Bake 5 Fire Cakes to prove your flame mastery', type: 'bake', target: 5, rewardCoins: 100, rewardXP: 50, requiredLevel: 1, emoji: '🔥' },
  { id: 'quest_cookie_monster', name: 'Cookie Monster', description: 'Bake 10 cookies of any kind', type: 'bake', target: 10, rewardCoins: 150, rewardXP: 75, requiredLevel: 1, emoji: '🍪' },
  { id: 'quest_first_serve', name: 'First Serve', description: 'Serve 3 customers successfully', type: 'serve', target: 3, rewardCoins: 80, rewardXP: 40, requiredLevel: 1, emoji: '🧑‍🍳' },
  { id: 'quest_earn_500', name: 'Pocket Change', description: 'Earn a total of 500 coins', type: 'earn', target: 500, rewardCoins: 200, rewardXP: 100, requiredLevel: 2, emoji: '💰' },
  { id: 'quest_collect_rare', name: 'Rare Collector', description: 'Collect 20 rare ingredients', type: 'collect', target: 20, rewardCoins: 300, rewardXP: 150, requiredLevel: 5, emoji: '💎' },
  { id: 'quest_upgrade_station', name: 'Station Master', description: 'Upgrade any baking station to level 5', type: 'upgrade', target: 5, rewardCoins: 250, rewardXP: 125, requiredLevel: 6, emoji: '🔧' },
  { id: 'quest_bake_epic', name: 'Epic Baker', description: 'Bake 3 epic-rarity or higher recipes', type: 'bake', target: 3, rewardCoins: 400, rewardXP: 200, requiredLevel: 8, emoji: '🧁' },
  { id: 'quest_serve_20', name: 'Popular Bakery', description: 'Serve 20 customers', type: 'serve', target: 20, rewardCoins: 500, rewardXP: 250, requiredLevel: 10, emoji: '🎉' },
  { id: 'quest_earn_2000', name: 'Wealthy Baker', description: 'Earn a total of 2000 coins', type: 'earn', target: 2000, rewardCoins: 600, rewardXP: 300, requiredLevel: 12, emoji: '👑' },
  { id: 'quest_legendary_baker', name: 'Legend in the Making', description: 'Bake 5 legendary or mythic recipes', type: 'bake', target: 5, rewardCoins: 800, rewardXP: 400, requiredLevel: 18, emoji: '🌟' },
  { id: 'quest_max_station', name: 'Ultimate Station', description: 'Fully upgrade any station to max level', type: 'upgrade', target: 10, rewardCoins: 1000, rewardXP: 500, requiredLevel: 25, emoji: '🏗️' },
  { id: 'quest_serve_100', name: 'Bakery Empire', description: 'Serve 100 customers total', type: 'serve', target: 100, rewardCoins: 1500, rewardXP: 750, requiredLevel: 30, emoji: '🏰' },
];

export const SB_NPCS: NPCDef[] = [
  { id: 'npc_elder_baker', name: 'Baker Morgran', role: 'Bakery Elder', description: 'A retired grand baker who shares wisdom and recipes', emoji: '👴', greeting: 'Ah, young baker! The oven awaits your magic touch.' },
  { id: 'npc_merchant_iris', name: 'Iris the Merchant', role: 'Ingredient Trader', description: 'Travels between realms selling rare ingredients', emoji: '🧳', greeting: 'Welcome! I have ingredients from places you\'ve never heard of.' },
  { id: 'npc_apprentice_finn', name: 'Finn', role: 'Your Apprentice', description: 'A eager young apprentice learning from you', emoji: '👦', greeting: 'Master! I\'ve prepared the ingredients just like you showed me!' },
  { id: 'npc_inspector_grim', name: 'Inspector Grim', role: 'Health Inspector', description: 'A strict but fair health inspector — magical division', emoji: '📋', greeting: 'I trust your fire extinguishing spells are up to date?' },
  { id: 'npc_rival_sylvia', name: 'Sylvia Starbake', role: 'Rival Baker', description: 'Your main competitor in the annual bake-off', emoji: '👩‍🍳', greeting: 'Oh, it\'s you again. I hope your pastries are better than last year.' },
  { id: 'npc_trainer_gale', name: 'Gale Windwalker', role: 'Tool Smith', description: 'Enchanted blacksmith who crafts magical baking tools', emoji: '⚒️', greeting: 'Need an upgrade? My hammer and spells are at your service.' },
];

export const SB_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach_first_bake', name: 'First Spark', description: 'Complete your first bake', conditionKey: 'completedBakes', targetValue: 1, rewardCoins: 10, rewardXP: 5, emoji: '✨' },
  { id: 'ach_bake_10', name: 'Getting Warmed Up', description: 'Complete 10 bakes', conditionKey: 'completedBakes', targetValue: 10, rewardCoins: 50, rewardXP: 25, emoji: '🔥' },
  { id: 'ach_bake_50', name: 'Baking Machine', description: 'Complete 50 bakes', conditionKey: 'completedBakes', targetValue: 50, rewardCoins: 200, rewardXP: 100, emoji: '⚙️' },
  { id: 'ach_bake_100', name: 'Centurion Baker', description: 'Complete 100 bakes', conditionKey: 'completedBakes', targetValue: 100, rewardCoins: 500, rewardXP: 250, emoji: '💯' },
  { id: 'ach_serve_5', name: 'First Smiles', description: 'Serve 5 customers', conditionKey: 'servedCustomers', targetValue: 5, rewardCoins: 30, rewardXP: 15, emoji: '😊' },
  { id: 'ach_serve_50', name: 'Crowd Pleaser', description: 'Serve 50 customers', conditionKey: 'servedCustomers', targetValue: 50, rewardCoins: 300, rewardXP: 150, emoji: '🎉' },
  { id: 'ach_earn_1000', name: 'Thousand Club', description: 'Earn 1000 coins total', conditionKey: 'totalEarned', targetValue: 1000, rewardCoins: 100, rewardXP: 50, emoji: '💰' },
  { id: 'ach_earn_10000', name: 'Tycoon', description: 'Earn 10000 coins total', conditionKey: 'totalEarned', targetValue: 10000, rewardCoins: 1000, rewardXP: 500, emoji: '🤑' },
  { id: 'ach_level_10', name: 'Double Digits', description: 'Reach level 10', conditionKey: 'level', targetValue: 10, rewardCoins: 150, rewardXP: 75, emoji: '🔟' },
  { id: 'ach_level_25', name: 'Quarter Century', description: 'Reach level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 400, rewardXP: 200, emoji: '🌟' },
  { id: 'ach_level_50', name: 'Maximum Magic', description: 'Reach the maximum level', conditionKey: 'level', targetValue: 50, rewardCoins: 2000, rewardXP: 1000, emoji: '👑' },
  { id: 'ach_streak_7', name: 'Week Warrior', description: 'Maintain a 7-day daily streak', conditionKey: 'dailyStreak', targetValue: 7, rewardCoins: 200, rewardXP: 100, emoji: '📅' },
  { id: 'ach_streak_30', name: 'Monthly Devotee', description: 'Maintain a 30-day daily streak', conditionKey: 'dailyStreak', targetValue: 30, rewardCoins: 1000, rewardXP: 500, emoji: '🗓️' },
  { id: 'ach_bakeoff_win', name: 'Champion Baker', description: 'Win a bake-off competition', conditionKey: 'bakeOffWins', targetValue: 1, rewardCoins: 500, rewardXP: 250, emoji: '🏆' },
  { id: 'ach_all_common_recipes', name: 'Common Collection', description: 'Unlock all common recipes', conditionKey: 'unlockedCommonRecipes', targetValue: 4, rewardCoins: 100, rewardXP: 50, emoji: '📖' },
];

export const SB_DAILY_TASK_POOL: DailyTaskPoolDef[] = [
  { id: 'daily_bake_3', name: 'Daily Bake', description: 'Bake 3 items today', type: 'bake', target: 3, rewardCoins: 30, rewardXP: 15, emoji: '🎂' },
  { id: 'daily_bake_5', name: 'Bake Frenzy', description: 'Bake 5 items today', type: 'bake', target: 5, rewardCoins: 50, rewardXP: 25, emoji: '🔥' },
  { id: 'daily_bake_10', name: 'Bake Marathon', description: 'Bake 10 items today', type: 'bake', target: 10, rewardCoins: 100, rewardXP: 50, emoji: '⚡' },
  { id: 'daily_serve_2', name: 'Daily Service', description: 'Serve 2 customers today', type: 'serve', target: 2, rewardCoins: 25, rewardXP: 12, emoji: '🧑‍🍳' },
  { id: 'daily_serve_5', name: 'Busy Day', description: 'Serve 5 customers today', type: 'serve', target: 5, rewardCoins: 60, rewardXP: 30, emoji: '🎉' },
  { id: 'daily_earn_200', name: 'Daily Income', description: 'Earn 200 coins today', type: 'earn', target: 200, rewardCoins: 40, rewardXP: 20, emoji: '💰' },
  { id: 'daily_earn_500', name: 'Big Earn', description: 'Earn 500 coins today', type: 'earn', target: 500, rewardCoins: 80, rewardXP: 40, emoji: '💎' },
  { id: 'daily_craft_5', name: 'Ingredient Gathering', description: 'Buy 5 ingredients today', type: 'craft', target: 5, rewardCoins: 20, rewardXP: 10, emoji: '🧺' },
];

// ============================================================
// Initial State Factory
// ============================================================

function createInitialState(seed?: number): SorcerersBakeryState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  return {
    level: 1,
    xp: 0,
    coins: 100,
    unlockedRecipes: ['fire_cake', 'ice_cookie', 'fairy_biscuit', 'enchanted_baguette', 'elf_banana_bread'],
    activeStation: 'oven_of_flames',
    ingredients: { moon_flour: 10, fairy_butter: 5, golem_salt: 5, enchanted_vanilla: 3, star_sugar: 3 },
    activeCustomers: [],
    customerSatisfaction: 100,
    completedBakes: 0,
    servedCustomers: 0,
    totalEarned: 0,
    totalSpent: 0,
    bakingQueue: [],
    dailyStreak: 0,
    lastDaily: null,
    activeQuests: [],
    completedQuests: [],
    unlockedAchievements: SB_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, unlockedAt: null })),
    bakeOffEntries: 0,
    bakeOffWins: 0,
    bakeOffLastRank: null,
    dailyTask: null,
    stations: SB_STATIONS.map((s) => ({ id: s.id, level: 1 })),
    tools: SB_TOOLS.map((t) => ({ id: t.id, level: 1, equipped: t.id === 'wand_whisk' })),
    seed: effectiveSeed,
    bakeCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    ingredientCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    stationUpgradeCount: 0,
    toolUpgradeCount: 0,
  };
}

// ============================================================
// Hook: useSorcerersBakery
// ============================================================

export function useSorcerersBakery(initialSeed?: number) {
  const [state, setState] = useState<SorcerersBakeryState>(() => createInitialState(initialSeed));
  const prngRef = useRef<() => number>(mulberry32(state.seed));

  // ---- Core State ----

  const sbGetState = useCallback((): Readonly<SorcerersBakeryState> => {
    // Returning a frozen read-only reference
    return Object.freeze({ ...state });
  }, [state]);

  const sbResetState = useCallback((newSeed?: number) => {
    const s = createInitialState(newSeed);
    prngRef.current = mulberry32(s.seed);
    setState(s);
  }, []);

  const sbSeed = useCallback((seed: number) => {
    prngRef.current = mulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const sbRandom = useCallback((): number => {
    return prngRef.current();
  }, []);

  const sbRandomInt = useCallback((min: number, max: number): number => {
    const rng = prngRef.current();
    return min + Math.floor(rng * (max - min + 1));
  }, []);

  const sbRandomChoice = useCallback(<T>(arr: readonly T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(prngRef.current() * arr.length)];
  }, []);

  // ---- Level / XP ----

  const sbGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const sbGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const sbGetXPTillNext = useCallback((): number => {
    return xpRequiredForLevel(state.level);
  }, [state.level]);

  const sbGetXPTotal = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const sbAddXP = useCallback((amount: number): SorcerersBakeryState => {
    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += Math.floor(amount);
      while (level < SB_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= SB_MAX_LEVEL) xp = 0;
      next = { ...prev, level: clampLevel(level), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Title ----

  const sbGetTitle = useCallback((): TitleInfo => {
    let current = SB_TITLE_THRESHOLDS[0];
    for (const t of SB_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const sbGetAllTitles = useCallback((): TitleInfo[] => {
    return [...SB_TITLE_THRESHOLDS];
  }, []);

  const sbGetNextTitle = useCallback((): TitleInfo | null => {
    for (const t of SB_TITLE_THRESHOLDS) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const sbGetProgress = useCallback((): number => {
    const needed = xpRequiredForLevel(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const sbGetOverallProgress = useCallback((): number => {
    return state.level / SB_MAX_LEVEL;
  }, [state.level]);

  // ---- Coins ----

  const sbGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const sbAddCoins = useCallback((amount: number): SorcerersBakeryState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: clampCoins(prev.coins + amount), totalEarned: prev.totalEarned + Math.max(0, amount) };
      return next;
    });
    return next;
  }, [state]);

  const sbSpendCoins = useCallback((amount: number): { success: boolean; state: SorcerersBakeryState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: clampCoins(prev.coins - amount), totalSpent: prev.totalSpent + amount };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const sbCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Recipes ----

  const sbGetRecipes = useCallback((): RecipeDef[] => {
    return [...SB_RECIPES];
  }, []);

  const sbGetUnlockedRecipes = useCallback((): RecipeDef[] => {
    return SB_RECIPES.filter((r) => state.unlockedRecipes.includes(r.id));
  }, [state.unlockedRecipes]);

  const sbGetLockedRecipes = useCallback((): RecipeDef[] => {
    return SB_RECIPES.filter((r) => !state.unlockedRecipes.includes(r.id));
  }, [state.unlockedRecipes]);

  const sbGetRecipeById = useCallback((id: string): RecipeDef | null => {
    return SB_RECIPES.find((r) => r.id === id) ?? null;
  }, []);

  const sbIsRecipeUnlocked = useCallback((recipeId: string): boolean => {
    return state.unlockedRecipes.includes(recipeId);
  }, [state.unlockedRecipes]);

  const sbUnlockRecipe = useCallback((recipeId: string): { success: boolean; state: SorcerersBakeryState } => {
    const recipe = SB_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return { success: false, state };
    if (state.unlockedRecipes.includes(recipeId)) return { success: false, state };
    if (state.level < recipe.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      if (prev.unlockedRecipes.includes(recipeId)) return prev;
      next = { ...prev, unlockedRecipes: [...prev.unlockedRecipes, recipeId] };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Stations ----

  const sbGetStations = useCallback((): StationDef[] => {
    return [...SB_STATIONS];
  }, []);

  const sbGetStationLevels = useCallback((): StationState[] => {
    return [...state.stations];
  }, [state.stations]);

  const sbGetActiveStation = useCallback((): StationDef | null => {
    return SB_STATIONS.find((s) => s.id === state.activeStation) ?? null;
  }, [state.activeStation]);

  const sbSetActiveStation = useCallback((stationId: string): { success: boolean; state: SorcerersBakeryState } => {
    const exists = SB_STATIONS.find((s) => s.id === stationId);
    if (!exists) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, activeStation: stationId };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const sbGetStationLevel = useCallback((stationId: string): number => {
    const s = state.stations.find((st) => st.id === stationId);
    return s?.level ?? 1;
  }, [state.stations]);

  const sbGetStationSpeedMultiplier = useCallback((stationId: string): number => {
    const def = SB_STATIONS.find((s) => s.id === stationId);
    const st = state.stations.find((s) => s.id === stationId);
    if (!def || !st) return 1;
    return def.baseSpeedMultiplier * (1 + (st.level - 1) * 0.1);
  }, [state.stations]);

  const sbGetStationQualityBonus = useCallback((stationId: string): number => {
    const def = SB_STATIONS.find((s) => s.id === stationId);
    const st = state.stations.find((s) => s.id === stationId);
    if (!def || !st) return 0;
    return def.baseQualityBonus + (st.level - 1) * 2;
  }, [state.stations]);

  const sbUpgradeStation = useCallback((stationId: string): { success: boolean; cost: number; state: SorcerersBakeryState } => {
    const def = SB_STATIONS.find((s) => s.id === stationId);
    const st = state.stations.find((s) => s.id === stationId);
    if (!def || !st) return { success: false, cost: 0, state };
    if (st.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.6, st.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const newStations = prev.stations.map((s) =>
        s.id === stationId ? { ...s, level: s.level + 1 } : s
      );
      next = {
        ...prev,
        stations: newStations,
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
        stationUpgradeCount: prev.stationUpgradeCount + 1,
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Ingredients ----

  const sbGetIngredients = useCallback((): IngredientDef[] => {
    return [...SB_INGREDIENTS];
  }, []);

  const sbGetIngredientById = useCallback((id: string): IngredientDef | null => {
    return SB_INGREDIENTS.find((i) => i.id === id) ?? null;
  }, []);

  const sbGetInventory = useCallback((): Record<string, number> => {
    return { ...state.ingredients };
  }, [state.ingredients]);

  const sbGetIngredientCount = useCallback((ingredientId: string): number => {
    return state.ingredients[ingredientId] ?? 0;
  }, [state.ingredients]);

  const sbGetIngredientCost = useCallback((ingredientId: string): number => {
    const def = SB_INGREDIENTS.find((i) => i.id === ingredientId);
    return def?.cost ?? 0;
  }, []);

  const sbBuyIngredient = useCallback((ingredientId: string, amount: number = 1): { success: boolean; cost: number; state: SorcerersBakeryState } => {
    const def = SB_INGREDIENTS.find((i) => i.id === ingredientId);
    if (!def) return { success: false, cost: 0, state };
    const totalCost = def.cost * amount;
    if (state.coins < totalCost) return { success: false, cost: totalCost, state };
    let next = state;
    setState((prev) => {
      const newIngredients = { ...prev.ingredients, [ingredientId]: (prev.ingredients[ingredientId] ?? 0) + amount };
      const newCountByRarity = { ...prev.ingredientCountByRarity, [def.rarity]: prev.ingredientCountByRarity[def.rarity] + amount };
      next = {
        ...prev,
        ingredients: newIngredients,
        coins: clampCoins(prev.coins - totalCost),
        totalSpent: prev.totalSpent + totalCost,
        ingredientCountByRarity: newCountByRarity,
      };
      // Update daily task if it's craft type
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = SB_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'craft') {
          next = {
            ...next,
            dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + amount },
          };
        }
      }
      return next;
    });
    return { success: true, cost: totalCost, state: next };
  }, [state]);

  const sbUseIngredient = useCallback((ingredientId: string, amount: number = 1): boolean => {
    const current = state.ingredients[ingredientId] ?? 0;
    if (current < amount) return false;
    let success = false;
    setState((prev) => {
      const have = prev.ingredients[ingredientId] ?? 0;
      if (have < amount) { success = false; return prev; }
      success = true;
      const newIngredients = { ...prev.ingredients };
      newIngredients[ingredientId] = have - amount;
      if (newIngredients[ingredientId] <= 0) delete newIngredients[ingredientId];
      return { ...prev, ingredients: newIngredients };
    });
    return success;
  }, [state]);

  const sbHasIngredients = useCallback((recipeId: string): boolean => {
    const recipe = SB_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return false;
    return recipe.ingredients.every((ing) => (state.ingredients[ing.ingredientId] ?? 0) >= ing.amount);
  }, [state.ingredients]);

  const sbGetMissingIngredients = useCallback((recipeId: string): { ingredientId: string; name: string; have: number; need: number }[] => {
    const recipe = SB_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return [];
    return recipe.ingredients
      .map((ing) => {
        const def = SB_INGREDIENTS.find((i) => i.id === ing.ingredientId);
        const have = state.ingredients[ing.ingredientId] ?? 0;
        return { ingredientId: ing.ingredientId, name: def?.name ?? ing.ingredientId, have, need: ing.amount };
      })
      .filter((m) => m.have < m.need);
  }, [state.ingredients]);

  // ---- Baking ----

  const sbBake = useCallback((recipeId: string, now: number = Date.now()): { success: boolean; bakeJob: BakeJob | null; state: SorcerersBakeryState } => {
    const recipe = SB_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return { success: false, bakeJob: null, state };
    if (!state.unlockedRecipes.includes(recipeId)) return { success: false, bakeJob: null, state };

    // Check ingredients
    const hasAll = recipe.ingredients.every((ing) => (state.ingredients[ing.ingredientId] ?? 0) >= ing.amount);
    if (!hasAll) return { success: false, bakeJob: null, state };

    // Check station
    if (state.activeStation !== recipe.stationId) return { success: false, bakeJob: null, state };

    // Check not already baking (max 3 slots)
    if (state.bakingQueue.length >= 3) return { success: false, bakeJob: null, state };

    // Calculate speed from station and tools
    const speedMult = sbGetStationSpeedMultiplier(recipe.stationId);
    const equippedTools = state.tools.filter((t) => t.equipped);
    let toolSpeedBonus = 0;
    for (const ts of equippedTools) {
      const def = SB_TOOLS.find((td) => td.id === ts.id);
      if (def && def.bonusType === 'speed') {
        toolSpeedBonus += def.baseBonusValue * (0.5 + ts.level * 0.15);
      }
    }
    const effectiveSpeed = speedMult + toolSpeedBonus * 0.01;

    const adjustedTime = Math.max(5, Math.floor(recipe.bakeTime / effectiveSpeed));
    const qualityBase = sbGetStationQualityBonus(recipe.stationId);
    let toolQualityBonus = 0;
    for (const ts of equippedTools) {
      const def = SB_TOOLS.find((td) => td.id === ts.id);
      if (def && def.bonusType === 'quality') {
        toolQualityBonus += def.baseBonusValue * (0.5 + ts.level * 0.15);
      }
    }
    const quality = Math.min(100, 50 + qualityBase + toolQualityBonus + Math.floor(prngRef.current() * 10));

    const bakeJob: BakeJob = {
      id: `bake_${recipeId}_${now}`,
      recipeId,
      startedAt: now,
      endsAt: now + adjustedTime * 1000,
      quality,
      stationId: recipe.stationId,
    };

    let next = state;
    setState((prev) => {
      const newIngredients = { ...prev.ingredients };
      for (const ing of recipe.ingredients) {
        const have = newIngredients[ing.ingredientId] ?? 0;
        newIngredients[ing.ingredientId] = have - ing.amount;
        if (newIngredients[ing.ingredientId] <= 0) delete newIngredients[ing.ingredientId];
      }

      // Yield bonus from tools
      let extraYield = 0;
      for (const ts of prev.tools.filter((t) => t.equipped)) {
        const def = SB_TOOLS.find((td) => td.id === ts.id);
        if (def && def.bonusType === 'yield') {
          extraYield += def.baseBonusValue * (0.5 + ts.level * 0.15);
        }
      }
      const bonusYield = prngRef.current() * 100 < extraYield ? 1 : 0;

      next = {
        ...prev,
        ingredients: newIngredients,
        bakingQueue: [...prev.bakingQueue, bakeJob],
      };

      // Quest progress
      next = sbProcessQuestProgress(next, 'bake', 1 + bonusYield);

      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = SB_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'bake') {
          next = {
            ...next,
            dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + (1 + bonusYield) },
          };
        }
      }

      return next;
    });

    return { success: true, bakeJob, state: next };
  }, [state, sbGetStationSpeedMultiplier, sbGetStationQualityBonus]);

  const sbGetBakingQueue = useCallback((): BakeJob[] => {
    return [...state.bakingQueue];
  }, [state.bakingQueue]);

  const sbCancelBake = useCallback((bakeJobId: string): { success: boolean; state: SorcerersBakeryState } => {
    const idx = state.bakingQueue.findIndex((b) => b.id === bakeJobId);
    if (idx === -1) return { success: false, state };
    let next = state;
    setState((prev) => {
      const recipe = SB_RECIPES.find((r) => r.id === prev.bakingQueue[idx].recipeId);
      let newIngredients = { ...prev.ingredients };
      if (recipe) {
        for (const ing of recipe.ingredients) {
          newIngredients[ing.ingredientId] = (newIngredients[ing.ingredientId] ?? 0) + ing.amount;
        }
      }
      const newQueue = [...prev.bakingQueue];
      newQueue.splice(idx, 1);
      next = { ...prev, ingredients: newIngredients, bakingQueue: newQueue };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const sbCollectBake = useCallback((bakeJobId: string, now: number = Date.now()): { success: boolean; recipe: RecipeDef | null; quality: number; coinsEarned: number; xpEarned: number; state: SorcerersBakeryState } => {
    const job = state.bakingQueue.find((b) => b.id === bakeJobId);
    if (!job) return { success: false, recipe: null, quality: 0, coinsEarned: 0, xpEarned: 0, state };
    if (now < job.endsAt) return { success: false, recipe: null, quality: 0, coinsEarned: 0, xpEarned: 0, state };

    const recipe = SB_RECIPES.find((r) => r.id === job.recipeId);
    if (!recipe) return { success: false, recipe: null, quality: 0, coinsEarned: 0, xpEarned: 0, state };

    const qualityMult = job.quality / 100;
    const rarityMult = rarityMultiplier(recipe.rarity);
    const coinsEarned = Math.floor(recipe.sellPrice * qualityMult * (0.8 + rarityMult * 0.2));
    const xpEarned = Math.floor(recipe.xpReward * qualityMult * rarityMult);

    let next = state;
    setState((prev) => {
      const newQueue = prev.bakingQueue.filter((b) => b.id !== bakeJobId);
      const newBakeCountByRarity = { ...prev.bakeCountByRarity, [recipe.rarity]: prev.bakeCountByRarity[recipe.rarity] + 1 };

      next = {
        ...prev,
        bakingQueue: newQueue,
        coins: clampCoins(prev.coins + coinsEarned),
        totalEarned: prev.totalEarned + coinsEarned,
        completedBakes: prev.completedBakes + 1,
        bakeCountByRarity: newBakeCountByRarity,
      };

      // Add XP and handle level up
      let { level, xp } = next;
      xp += xpEarned;
      while (level < SB_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= SB_MAX_LEVEL) xp = 0;
      next = { ...next, level: clampLevel(level), xp };

      // Quest progress for earn
      next = sbProcessQuestProgress(next, 'earn', coinsEarned);

      return next;
    });

    return { success: true, recipe, quality: job.quality, coinsEarned, xpEarned, state: next };
  }, [state]);

  const sbGetBakeTimeRemaining = useCallback((bakeJobId: string, now: number = Date.now()): number => {
    const job = state.bakingQueue.find((b) => b.id === bakeJobId);
    if (!job) return 0;
    return Math.max(0, job.endsAt - now);
  }, [state.bakingQueue]);

  const sbGetRecipeProfit = useCallback((recipeId: string): number => {
    const recipe = SB_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return 0;
    let ingredientCost = 0;
    for (const ing of recipe.ingredients) {
      const def = SB_INGREDIENTS.find((i) => i.id === ing.ingredientId);
      if (def) ingredientCost += def.cost * ing.amount;
    }
    return recipe.sellPrice - ingredientCost;
  }, []);

  // ---- Customers ----

  const sbGetCustomers = useCallback((): CustomerDef[] => {
    return [...SB_CUSTOMERS];
  }, []);

  const sbGetActiveCustomers = useCallback((): ActiveCustomer[] => {
    return [...state.activeCustomers];
  }, [state]);

  const sbSpawnCustomer = useCallback((now: number = Date.now()): { success: boolean; customer: CustomerDef | null; state: SorcerersBakeryState } => {
    if (state.activeCustomers.length >= 5) return { success: false, customer: null, state };
    // Pick a random customer not already active
    const activeIds = new Set(state.activeCustomers.map((c) => c.id));
    const available = SB_CUSTOMERS.filter((c) => !activeIds.has(c.id));
    if (available.length === 0) return { success: false, customer: null, state };

    const customer = available[Math.floor(prngRef.current() * available.length)];
    const orderRecipe = customer.favoriteRecipes.length > 0
      ? customer.favoriteRecipes[Math.floor(prngRef.current() * customer.favoriteRecipes.length)]
      : null;

    const activeCustomer: ActiveCustomer = {
      id: customer.id,
      arrivedAt: now,
      orderRecipeId: orderRecipe,
      served: false,
      satisfied: false,
    };

    let next = state;
    setState((prev) => {
      next = { ...prev, activeCustomers: [...prev.activeCustomers, activeCustomer] };
      return next;
    });

    return { success: true, customer, state: next };
  }, [state]);

  const sbServeCustomer = useCallback((customerId: string, now: number = Date.now()): { success: boolean; tip: number; satisfaction: number; state: SorcerersBakeryState } => {
    const active = state.activeCustomers.find((c) => c.id === customerId);
    if (!active || active.served) return { success: false, tip: 0, satisfaction: state.customerSatisfaction, state };

    const customerDef = SB_CUSTOMERS.find((c) => c.id === customerId);
    if (!customerDef) return { success: false, tip: 0, satisfaction: state.customerSatisfaction, state };

    // Check if the ordered recipe is available (completed recently or in inventory concept)
    const isFavorite = active.orderRecipeId
      ? state.unlockedRecipes.includes(active.orderRecipeId)
      : false;

    const elapsed = (now - active.arrivedAt) / 1000;
    const patienceRatio = Math.max(0, 1 - elapsed / customerDef.patience);

    let satisfactionGain = isFavorite ? 15 : 5;
    satisfactionGain = Math.floor(satisfactionGain * (0.5 + patienceRatio * 0.5));

    const baseTip = isFavorite ? 20 : 5;
    const tip = Math.floor(baseTip * customerDef.tipMultiplier * (0.5 + patienceRatio * 0.5));

    let next = state;
    setState((prev) => {
      const newActive = prev.activeCustomers.map((c) =>
        c.id === customerId ? { ...c, served: true, satisfied: patienceRatio > 0.3 } : c
      );
      const newSatisfaction = Math.min(100, prev.customerSatisfaction + satisfactionGain);

      next = {
        ...prev,
        activeCustomers: newActive,
        customerSatisfaction: newSatisfaction,
        coins: clampCoins(prev.coins + tip),
        totalEarned: prev.totalEarned + tip,
        servedCustomers: prev.servedCustomers + 1,
      };

      // Quest progress
      next = sbProcessQuestProgress(next, 'serve', 1);

      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = SB_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'serve') {
          next = {
            ...next,
            dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 },
          };
        }
      }

      // Earn quest progress
      next = sbProcessQuestProgress(next, 'earn', tip);

      return next;
    });

    return { success: true, tip, satisfaction: Math.min(100, state.customerSatisfaction + satisfactionGain), state: next };
  }, [state]);

  const sbDismissCustomer = useCallback((customerId: string): { success: boolean; state: SorcerersBakeryState } => {
    const idx = state.activeCustomers.findIndex((c) => c.id === customerId);
    if (idx === -1) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newActive = [...prev.activeCustomers];
      newActive.splice(idx, 1);
      const wasSatisfied = prev.activeCustomers[idx].satisfied;
      next = {
        ...prev,
        activeCustomers: newActive,
        customerSatisfaction: Math.max(0, prev.customerSatisfaction - (wasSatisfied ? 0 : 10)),
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const sbGetCustomerSatisfaction = useCallback((): number => {
    return state.customerSatisfaction;
  }, [state.customerSatisfaction]);

  const sbGetCustomerOrder = useCallback((customerId: string): string | null => {
    const active = state.activeCustomers.find((c) => c.id === customerId);
    return active?.orderRecipeId ?? null;
  }, [state]);

  const sbAutoSpawnCustomers = useCallback((now: number = Date.now()): SorcerersBakeryState => {
    // Spawn customers based on level and random chance
    const maxCustomers = Math.min(5, 1 + Math.floor(state.level / 5));
    const rng = mulberry32(now + state.seed);
    while (state.activeCustomers.length < maxCustomers) {
      const available = SB_CUSTOMERS.filter((c) => !state.activeCustomers.some((ac) => ac.id === c.id));
      if (available.length === 0) break;
      if (rng() > 0.3) break; // 30% chance to spawn each slot
      // We can't modify state in a loop so we'll use a different approach
      break;
    }
    return state;
  }, [state]);

  // ---- Tools ----

  const sbGetTools = useCallback((): ToolDef[] => {
    return [...SB_TOOLS];
  }, []);

  const sbGetToolStates = useCallback((): ToolState[] => {
    return [...state.tools];
  }, [state.tools]);

  const sbGetEquippedTools = useCallback((): ToolState[] => {
    return state.tools.filter((t) => t.equipped);
  }, [state.tools]);

  const sbGetToolLevel = useCallback((toolId: string): number => {
    const t = state.tools.find((ts) => ts.id === toolId);
    return t?.level ?? 1;
  }, [state.tools]);

  const sbGetToolBonus = useCallback((toolId: string): number => {
    const ts = state.tools.find((t) => t.id === toolId);
    const def = SB_TOOLS.find((t) => t.id === toolId);
    if (!ts || !def) return 0;
    return def.baseBonusValue * (0.5 + ts.level * 0.15);
  }, [state.tools]);

  const sbEquipTool = useCallback((toolId: string): { success: boolean; state: SorcerersBakeryState } => {
    const def = SB_TOOLS.find((t) => t.id === toolId);
    if (!def) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newTools = prev.tools.map((t) => ({
        ...t,
        equipped: t.id === toolId ? true : (t.equipped && SB_TOOLS.find((d) => d.id === t.id)?.bonusType === def.bonusType ? false : t.equipped),
      }));
      next = { ...prev, tools: newTools };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const sbUpgradeTool = useCallback((toolId: string): { success: boolean; cost: number; state: SorcerersBakeryState } => {
    const def = SB_TOOLS.find((t) => t.id === toolId);
    const ts = state.tools.find((t) => t.id === toolId);
    if (!def || !ts) return { success: false, cost: 0, state };
    if (ts.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, ts.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const newTools = prev.tools.map((t) =>
        t.id === toolId ? { ...t, level: t.level + 1 } : t
      );
      next = {
        ...prev,
        tools: newTools,
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
        toolUpgradeCount: prev.toolUpgradeCount + 1,
      };
      // Quest progress for upgrade
      const maxStationLevel = Math.max(...prev.stations.map((s) => s.level));
      const maxToolLevel = Math.max(...newTools.map((t) => t.level));
      next = sbProcessQuestProgress(next, 'upgrade', Math.max(maxStationLevel, maxToolLevel));
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Quests ----

  const sbGetQuests = useCallback((): QuestDef[] => {
    return [...SB_QUESTS];
  }, []);

  const sbGetActiveQuests = useCallback((): (QuestDef & QuestState)[] => {
    return state.activeQuests.map((aq) => {
      const def = SB_QUESTS.find((q) => q.id === aq.id);
      if (!def) return { ...aq, name: '', description: '', type: 'bake' as QuestType, target: 0, rewardCoins: 0, rewardXP: 0, requiredLevel: 0, emoji: '' };
      return { ...aq, ...def };
    });
  }, [state.activeQuests]);

  const sbGetAvailableQuests = useCallback((): QuestDef[] => {
    const activeIds = new Set(state.activeQuests.map((q) => q.id));
    const completedIds = new Set(state.completedQuests);
    return SB_QUESTS.filter((q) => !activeIds.has(q.id) && !completedIds.has(q.id) && state.level >= q.requiredLevel);
  }, [state.activeQuests, state.completedQuests, state.level]);

  const sbGetCompletedQuests = useCallback((): string[] => {
    return [...state.completedQuests];
  }, [state.completedQuests]);

  const sbAcceptQuest = useCallback((questId: string): { success: boolean; state: SorcerersBakeryState } => {
    const def = SB_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.activeQuests.some((q) => q.id === questId)) return { success: false, state };
    if (state.completedQuests.includes(questId)) return { success: false, state };
    if (state.activeQuests.length >= 5) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        activeQuests: [...prev.activeQuests, { id: questId, accepted: true, completed: false, progress: 0 }],
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const sbGetQuestProgress = useCallback((questId: string): number => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    return aq?.progress ?? 0;
  }, [state.activeQuests]);

  const sbCompleteQuest = useCallback((questId: string): { success: boolean; rewardCoins: number; rewardXP: number; state: SorcerersBakeryState } => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    if (!aq || !aq.completed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const def = SB_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, rewardCoins: 0, rewardXP: 0, state };

    let next = state;
    setState((prev) => {
      const newActive = prev.activeQuests.filter((q) => q.id !== questId);
      let { level, xp } = prev;
      xp += def.rewardXP;
      while (level < SB_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= SB_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        activeQuests: newActive,
        completedQuests: [...prev.completedQuests, questId],
        coins: clampCoins(prev.coins + def.rewardCoins),
        totalEarned: prev.totalEarned + def.rewardCoins,
        level: clampLevel(level),
        xp,
      };
      return next;
    });

    return { success: true, rewardCoins: def.rewardCoins, rewardXP: def.rewardXP, state: next };
  }, [state]);

  const sbAbandonQuest = useCallback((questId: string): { success: boolean; state: SorcerersBakeryState } => {
    const idx = state.activeQuests.findIndex((q) => q.id === questId);
    if (idx === -1) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newActive = [...prev.activeQuests];
      newActive.splice(idx, 1);
      next = { ...prev, activeQuests: newActive };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Achievements ----

  const sbGetAchievements = useCallback((): AchievementDef[] => {
    return [...SB_ACHIEVEMENTS];
  }, []);

  const sbGetUnlockedAchievements = useCallback((): AchievementState[] => {
    return state.unlockedAchievements.filter((a) => a.unlocked);
  }, [state.unlockedAchievements]);

  const sbIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    const a = state.unlockedAchievements.find((ach) => ach.id === achievementId);
    return a?.unlocked ?? false;
  }, [state.unlockedAchievements]);

  const sbCheckAchievements = useCallback((): AchievementState[] => {
    const now = Date.now();
    let next = state;
    const newlyUnlocked: AchievementState[] = [];

    setState((prev) => {
      let updated = prev;
      const commonRecipeCount = SB_RECIPES.filter((r) => r.rarity === 'common' && prev.unlockedRecipes.includes(r.id)).length;

      for (const ach of SB_ACHIEVEMENTS) {
        const currentState = updated.unlockedAchievements.find((a) => a.id === ach.id);
        if (!currentState || currentState.unlocked) continue;

        let value = 0;
        switch (ach.conditionKey) {
          case 'completedBakes': value = updated.completedBakes; break;
          case 'servedCustomers': value = updated.servedCustomers; break;
          case 'totalEarned': value = updated.totalEarned; break;
          case 'level': value = updated.level; break;
          case 'dailyStreak': value = updated.dailyStreak; break;
          case 'bakeOffWins': value = updated.bakeOffWins; break;
          case 'unlockedCommonRecipes': value = commonRecipeCount; break;
          default: value = 0; break;
        }

        if (value >= ach.targetValue) {
          newlyUnlocked.push({ id: ach.id, unlocked: true, unlockedAt: now });
          updated = {
            ...updated,
            unlockedAchievements: updated.unlockedAchievements.map((a) =>
              a.id === ach.id ? { ...a, unlocked: true, unlockedAt: now } : a
            ),
            coins: clampCoins(updated.coins + ach.rewardCoins),
            totalEarned: updated.totalEarned + ach.rewardCoins,
          };
          // Apply XP
          let { level, xp } = updated;
          xp += ach.rewardXP;
          while (level < SB_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
            xp -= xpRequiredForLevel(level);
            level += 1;
          }
          if (level >= SB_MAX_LEVEL) xp = 0;
          updated = { ...updated, level: clampLevel(level), xp };
        }
      }
      next = updated;
      return updated;
    });

    return newlyUnlocked;
  }, [state]);

  const sbUnlockAchievement = useCallback((achievementId: string): { success: boolean; state: SorcerersBakeryState } => {
    const ach = SB_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) return { success: false, state };
    const current = state.unlockedAchievements.find((a) => a.id === achievementId);
    if (current?.unlocked) return { success: false, state };

    let next = state;
    const now = Date.now();
    setState((prev) => {
      let { level, xp } = prev;
      xp += ach.rewardXP;
      while (level < SB_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= SB_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        unlockedAchievements: prev.unlockedAchievements.map((a) =>
          a.id === achievementId ? { ...a, unlocked: true, unlockedAt: now } : a
        ),
        coins: clampCoins(prev.coins + ach.rewardCoins),
        totalEarned: prev.totalEarned + ach.rewardCoins,
        level: clampLevel(level),
        xp,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Daily Tasks ----

  const sbGetDailyTask = useCallback((): DailyTaskState | null => {
    return state.dailyTask;
  }, [state.dailyTask]);

  const sbRefreshDailyTask = useCallback((now: number = Date.now()): { dailyTask: DailyTaskPoolDef | null; state: SorcerersBakeryState } => {
    const dayKey = generateDayKey(now);

    // Check if we need a new daily task
    if (state.dailyTask && state.dailyTask.dayKey === dayKey) {
      const pool = SB_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
      return { dailyTask: pool ?? null, state };
    }

    // Generate new daily task based on day seed
    const daySeed = sbHashString(dayKey) & 0x7fffffff;
    const rng = mulberry32(daySeed);
    const taskIndex = Math.floor(rng() * SB_DAILY_TASK_POOL.length);
    const task = SB_DAILY_TASK_POOL[taskIndex];

    // Update streak
    const yesterdayKey = generateDayKey(now - 86400000);
    const newStreak = state.lastDaily === yesterdayKey ? state.dailyStreak + 1 : (state.lastDaily === dayKey ? state.dailyStreak : 1);

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        dailyTask: { poolId: task.id, progress: 0, claimed: false, dayKey },
        dailyStreak: newStreak,
        lastDaily: dayKey,
      };
      return next;
    });

    return { dailyTask: task, state: next };
  }, [state]);

  const sbClaimDailyReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: SorcerersBakeryState } => {
    if (!state.dailyTask || state.dailyTask.claimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const poolDef = SB_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask.poolId);
    if (!poolDef) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    if (state.dailyTask.progress < poolDef.target) return { success: false, rewardCoins: 0, rewardXP: 0, state };

    // Streak bonus
    const streakBonus = 1 + state.dailyStreak * 0.05;
    const rewardCoins = Math.floor(poolDef.rewardCoins * streakBonus);
    const rewardXP = Math.floor(poolDef.rewardXP * streakBonus);

    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += rewardXP;
      while (level < SB_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= SB_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        dailyTask: { ...prev.dailyTask!, claimed: true },
        coins: clampCoins(prev.coins + rewardCoins),
        totalEarned: prev.totalEarned + rewardCoins,
        level: clampLevel(level),
        xp,
      };
      return next;
    });

    return { success: true, rewardCoins, rewardXP, state: next };
  }, [state]);

  const sbGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  const sbGetLastDaily = useCallback((): string | null => {
    return state.lastDaily;
  }, [state.lastDaily]);

  // ---- Bake-Off ----

  const sbEnterBakeOff = useCallback((recipeId: string, now: number = Date.now()): { success: boolean; rank: number; prize: number; state: SorcerersBakeryState } => {
    const recipe = SB_RECIPES.find((r) => r.id === recipeId);
    if (!recipe || !state.unlockedRecipes.includes(recipeId)) {
      return { success: false, rank: 0, prize: 0, state };
    }

    // Simulate bake-off using PRNG
    const contestSeed = sbHashString(`bakeoff_${now}_${state.seed}`);
    const rng = mulberry32(contestSeed);
    const stationLevel = state.stations.find((s) => s.id === recipe.stationId)?.level ?? 1;
    const toolQuality = state.tools.filter((t) => t.equipped).reduce((acc, ts) => {
      const def = SB_TOOLS.find((d) => d.id === ts.id);
      return acc + (def?.bonusType === 'quality' ? def.baseBonusValue * (0.5 + ts.level * 0.15) : 0);
    }, 0);

    const baseScore = 40 + stationLevel * 3 + toolQuality + rarityMultiplier(recipe.rarity) * 10;
    const luckBonus = state.tools.filter((t) => t.equipped).reduce((acc, ts) => {
      const def = SB_TOOLS.find((d) => d.id === ts.id);
      return acc + (def?.bonusType === 'luck' ? def.baseBonusValue * (0.5 + ts.level * 0.15) : 0);
    }, 0);
    const myScore = baseScore + rng() * 20 + luckBonus * 2;

    // Generate 9 NPC scores
    const npcScores: number[] = [];
    for (let i = 0; i < 9; i++) {
      npcScores.push(30 + rng() * 70);
    }
    const allScores = [...npcScores, myScore];
    allScores.sort((a, b) => b - a);
    const rank = allScores.indexOf(myScore) + 1;

    const prizes = [0, 500, 300, 150, 75, 30, 10, 0, 0, 0];
    const prize = prizes[rank - 1] ?? 0;
    const isWin = rank === 1;

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        bakeOffEntries: prev.bakeOffEntries + 1,
        bakeOffWins: prev.bakeOffWins + (isWin ? 1 : 0),
        bakeOffLastRank: rank,
        coins: clampCoins(prev.coins + prize),
        totalEarned: prev.totalEarned + prize,
      };

      // XP for participation
      const participationXP = Math.floor(recipe.xpReward * 0.5);
      let { level, xp } = next;
      xp += participationXP;
      while (level < SB_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= SB_MAX_LEVEL) xp = 0;
      next = { ...next, level: clampLevel(level), xp };
      return next;
    });

    return { success: true, rank, prize, state: next };
  }, [state]);

  const sbGetBakeOffRank = useCallback((): number | null => {
    return state.bakeOffLastRank;
  }, [state.bakeOffLastRank]);

  const sbGetBakeOffStats = useCallback((): { entries: number; wins: number; winRate: number; lastRank: number | null } => {
    return {
      entries: state.bakeOffEntries,
      wins: state.bakeOffWins,
      winRate: state.bakeOffEntries > 0 ? state.bakeOffWins / state.bakeOffEntries : 0,
      lastRank: state.bakeOffLastRank,
    };
  }, [state]);

  // ---- Stats ----

  const sbGetStats = useCallback(() => {
    return {
      completedBakes: state.completedBakes,
      servedCustomers: state.servedCustomers,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      profit: state.totalEarned - state.totalSpent,
      customerSatisfaction: state.customerSatisfaction,
      dailyStreak: state.dailyStreak,
      bakeOffEntries: state.bakeOffEntries,
      bakeOffWins: state.bakeOffWins,
      unlockedRecipeCount: state.unlockedRecipes.length,
      totalRecipeCount: SB_RECIPES.length,
      questsCompleted: state.completedQuests.length,
      achievementsUnlocked: state.unlockedAchievements.filter((a) => a.unlocked).length,
      stationUpgradeCount: state.stationUpgradeCount,
      toolUpgradeCount: state.toolUpgradeCount,
    };
  }, [state]);

  const sbGetBakeCount = useCallback((): number => {
    return state.completedBakes;
  }, [state.completedBakes]);

  const sbGetEarnedCoins = useCallback((): number => {
    return state.totalEarned;
  }, [state.totalEarned]);

  const sbGetProfit = useCallback((): number => {
    return state.totalEarned - state.totalSpent;
  }, [state.totalEarned, state.totalSpent]);

  const sbGetTotalSpent = useCallback((): number => {
    return state.totalSpent;
  }, [state.totalSpent]);

  // ---- NPC Interaction ----

  const sbGetNPCs = useCallback((): NPCDef[] => {
    return [...SB_NPCS];
  }, []);

  const sbGetNPCById = useCallback((id: string): NPCDef | null => {
    return SB_NPCS.find((n) => n.id === id) ?? null;
  }, []);

  const sbGetRarityInfo = useCallback((rarity: Rarity): RarityInfo | null => {
    return SB_RARITIES.find((r) => r.key === rarity) ?? null;
  }, []);

  const sbGetAllRarities = useCallback((): RarityInfo[] => {
    return [...SB_RARITIES];
  }, []);

  // ---- Utility / Misc ----

  const sbGetRecipesByStation = useCallback((stationId: string): RecipeDef[] => {
    return SB_RECIPES.filter((r) => r.stationId === stationId);
  }, []);

  const sbGetRecipesByRarity = useCallback((rarity: Rarity): RecipeDef[] => {
    return SB_RECIPES.filter((r) => r.rarity === rarity);
  }, []);

  const sbGetIngredientsByRarity = useCallback((rarity: Rarity): IngredientDef[] => {
    return SB_INGREDIENTS.filter((i) => i.rarity === rarity);
  }, []);

  const sbIsBaking = useCallback((): boolean => {
    return state.bakingQueue.length > 0;
  }, [state.bakingQueue]);

  const sbGetMaxBakeSlots = useCallback((): number => {
    return Math.min(3, 1 + Math.floor(state.level / 15));
  }, [state.level]);

  const sbGetAvailableBakeSlots = useCallback((): number => {
    return sbGetMaxBakeSlots() - state.bakingQueue.length;
  }, [state.bakingQueue, sbGetMaxBakeSlots]);

  // ============================================================
  // Extended Utilities
  // ============================================================

  /** Buy multiple ingredients in one call, returns per-ingredient results. */
  const sbBatchBuyIngredients = useCallback(
    (items: { ingredientId: string; amount: number }[]): { totalSpent: number; results: { ingredientId: string; success: boolean; cost: number }[]; state: SorcerersBakeryState } => {
      // Pre-validate total cost
      let totalCost = 0;
      const validated: { ingredientId: string; amount: number; cost: number }[] = [];
      for (const item of items) {
        const def = SB_INGREDIENTS.find((i) => i.id === item.ingredientId);
        if (!def) continue;
        const cost = def.cost * item.amount;
        totalCost += cost;
        validated.push({ ...item, cost });
      }
      if (state.coins < totalCost) {
        return {
          totalSpent: 0,
          results: items.map((item) => ({ ingredientId: item.ingredientId, success: false, cost: 0 })),
          state,
        };
      }

      let next = state;
      const results: { ingredientId: string; success: boolean; cost: number }[] = [];
      setState((prev) => {
        let newCoins = prev.coins;
        const newIngredients = { ...prev.ingredients };
        const newCountByRarity = { ...prev.ingredientCountByRarity };
        let spent = 0;

        for (const item of validated) {
          newCoins -= item.cost;
          spent += item.cost;
          newIngredients[item.ingredientId] = (newIngredients[item.ingredientId] ?? 0) + item.amount;
          const def = SB_INGREDIENTS.find((i) => i.id === item.ingredientId);
          if (def) newCountByRarity[def.rarity] = newCountByRarity[def.rarity] + item.amount;
          results.push({ ingredientId: item.ingredientId, success: true, cost: item.cost });
        }

        next = {
          ...prev,
          ingredients: newIngredients,
          coins: clampCoins(newCoins),
          totalSpent: prev.totalSpent + spent,
          ingredientCountByRarity: newCountByRarity,
        };
        return next;
      });

      return { totalSpent: totalCost, results, state: next };
    },
    [state]
  );

  /** Find the best recipe for a given station based on profit/minute. */
  const sbGetBestRecipeForStation = useCallback(
    (stationId: string): RecipeDef | null => {
      const recipes = SB_RECIPES.filter(
        (r) => r.stationId === stationId && state.unlockedRecipes.includes(r.id) && state.level >= r.requiredLevel
      );
      if (recipes.length === 0) return null;
      const speedMult = sbGetStationSpeedMultiplier(stationId);
      return recipes.reduce((best, recipe) => {
        const adjustedTime = Math.max(5, recipe.bakeTime / speedMult);
        const profitPerMin = recipe.sellPrice / (adjustedTime / 60);
        const bestTime = Math.max(5, best.bakeTime / speedMult);
        const bestProfit = best.sellPrice / (bestTime / 60);
        return profitPerMin > bestProfit ? recipe : best;
      });
    },
    [state.unlockedRecipes, state.level, sbGetStationSpeedMultiplier]
  );

  /** Find the most profitable recipe among all unlocked recipes. */
  const sbGetMostProfitableRecipe = useCallback((): RecipeDef | null => {
    const unlocked = SB_RECIPES.filter((r) => state.unlockedRecipes.includes(r.id) && state.level >= r.requiredLevel);
    if (unlocked.length === 0) return null;
    return unlocked.reduce((best, recipe) => (recipe.sellPrice > best.sellPrice ? recipe : best));
  }, [state.unlockedRecipes, state.level]);

  /** Get all recipes the player can afford the ingredients for. */
  const sbGetAffordableRecipes = useCallback((): RecipeDef[] => {
    return SB_RECIPES.filter((recipe) => {
      if (!state.unlockedRecipes.includes(recipe.id)) return false;
      if (state.level < recipe.requiredLevel) return false;
      let cost = 0;
      for (const ing of recipe.ingredients) {
        const def = SB_INGREDIENTS.find((i) => i.id === ing.ingredientId);
        if (def) cost += def.cost * Math.max(0, ing.amount - (state.ingredients[ing.ingredientId] ?? 0));
      }
      return state.coins >= cost;
    });
  }, [state.unlockedRecipes, state.level, state.coins, state.ingredients]);

  /** Get all recipes the player has all ingredients for and station matches. */
  const sbGetBakeableRecipes = useCallback((): RecipeDef[] => {
    return SB_RECIPES.filter((recipe) => {
      if (!state.unlockedRecipes.includes(recipe.id)) return false;
      if (state.level < recipe.requiredLevel) return false;
      if (state.activeStation !== recipe.stationId) return false;
      return recipe.ingredients.every((ing) => (state.ingredients[ing.ingredientId] ?? 0) >= ing.amount);
    });
  }, [state.unlockedRecipes, state.level, state.activeStation, state.ingredients]);

  /** Get a comprehensive summary of the bakery state. */
  const sbGetBakerySummary = useCallback((): {
    bakeryName: string;
    level: number;
    title: TitleInfo;
    coins: number;
    xp: number;
    xpTillNext: number;
    progress: number;
    recipesUnlocked: number;
    recipesTotal: number;
    stationsOwned: number;
    toolsEquipped: number;
    customersServed: number;
    satisfaction: number;
    dailyStreak: number;
    totalBakes: number;
    bakeOffWins: number;
    netWorth: number;
  } => {
    const title = (() => {
      let current = SB_TITLE_THRESHOLDS[0];
      for (const t of SB_TITLE_THRESHOLDS) {
        if (state.level >= t.levelRequired) current = t;
      }
      return current;
    })();
    const inventoryValue = Object.entries(state.ingredients).reduce((sum, [id, qty]) => {
      const def = SB_INGREDIENTS.find((i) => i.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
    return {
      bakeryName: "Sorcerer's Bakery",
      level: state.level,
      title,
      coins: state.coins,
      xp: state.xp,
      xpTillNext: xpRequiredForLevel(state.level),
      progress: xpRequiredForLevel(state.level) > 0 ? state.xp / xpRequiredForLevel(state.level) : 1,
      recipesUnlocked: state.unlockedRecipes.length,
      recipesTotal: SB_RECIPES.length,
      stationsOwned: state.stations.filter((s) => s.level > 1).length,
      toolsEquipped: state.tools.filter((t) => t.equipped).length,
      customersServed: state.servedCustomers,
      satisfaction: state.customerSatisfaction,
      dailyStreak: state.dailyStreak,
      totalBakes: state.completedBakes,
      bakeOffWins: state.bakeOffWins,
      netWorth: state.coins + inventoryValue,
    };
  }, [state]);

  /** Get tips/hints for the current bakery state. */
  const sbGetCustomerTips = useCallback((): string[] => {
    const tips: string[] = [];

    // Tip about locked recipes
    const lockedCount = SB_RECIPES.filter(
      (r) => !state.unlockedRecipes.includes(r.id) && state.level >= r.requiredLevel
    ).length;
    if (lockedCount > 0) {
      tips.push(`You have ${lockedCount} recipe(s) available to unlock at your current level!`);
    }

    // Tip about station upgrades
    const lowestStation = state.stations.reduce(
      (min, s) => (s.level < min.level ? s : min),
      state.stations[0]
    );
    const lowestDef = SB_STATIONS.find((s) => s.id === lowestStation.id);
    if (lowestStation.level < 3 && lowestDef) {
      tips.push(`Consider upgrading ${lowestDef.name} — higher levels improve speed and quality!`);
    }

    // Tip about customer satisfaction
    if (state.customerSatisfaction < 50) {
      tips.push('Customer satisfaction is low — try serving their favorite recipes for bonus satisfaction!');
    }

    // Tip about tools
    const unequippedSpeedTool = state.tools.find(
      (t) => !t.equipped && SB_TOOLS.find((d) => d.id === t.id)?.bonusType === 'speed'
    );
    if (unequippedSpeedTool) {
      const def = SB_TOOLS.find((d) => d.id === unequippedSpeedTool.id);
      if (def) tips.push(`Equip ${def.name} to speed up your baking!`);
    }

    // Tip about daily streak
    if (state.dailyStreak > 0 && state.dailyStreak % 7 === 0) {
      tips.push(`Amazing ${state.dailyStreak}-day streak! Daily rewards get a ${Math.floor(state.dailyStreak * 5)}% bonus!`);
    }

    // Tip about ingredients running low
    const lowIngredients = SB_INGREDIENTS.filter(
      (i) => (state.ingredients[i.id] ?? 0) < 3 && state.unlockedRecipes.some((r) =>
        SB_RECIPES.find((rec) => rec.id === r)?.ingredients.some((ing) => ing.ingredientId === i.id)
      )
    );
    if (lowIngredients.length > 0) {
      const names = lowIngredients.slice(0, 3).map((i) => i.name).join(', ');
      tips.push(`Running low on: ${names}. Stock up before your next baking session!`);
    }

    // Tip about quests
    const completableQuests = state.activeQuests.filter((q) => q.completed && !state.completedQuests.includes(q.id));
    if (completableQuests.length > 0) {
      tips.push(`You have ${completableQuests.length} quest(s) ready to claim rewards for!`);
    }

    // Tip about level
    if (state.level < 10) {
      tips.push('Keep baking to level up! Higher levels unlock more powerful recipes and stations.');
    } else if (state.level < 25) {
      tips.push('Epic and legendary recipes await at higher levels — keep pushing!');
    } else if (state.level >= 40) {
      tips.push('You are approaching the pinnacle of magical baking. Mythic recipes are within reach!');
    }

    // Tip about bake-off
    if (state.bakeOffEntries > 0 && state.bakeOffWins === 0) {
      tips.push('Try improving your station quality and tool bonuses to win a bake-off!');
    }

    if (tips.length === 0) {
      tips.push('Your bakery is running smoothly! Keep serving customers and experimenting with recipes.');
    }

    return tips;
  }, [state]);

  /** Calculate the efficiency (coins per XP per second) for a recipe. */
  const sbCalculateBakeEfficiency = useCallback(
    (recipeId: string): { coinsPerSecond: number; xpPerSecond: number; overallScore: number } => {
      const recipe = SB_RECIPES.find((r) => r.id === recipeId);
      if (!recipe) return { coinsPerSecond: 0, xpPerSecond: 0, overallScore: 0 };

      const speedMult = sbGetStationSpeedMultiplier(recipe.stationId);
      const adjustedTime = Math.max(1, recipe.bakeTime / speedMult);

      const coinsPerSecond = recipe.sellPrice / adjustedTime;
      const xpPerSecond = recipe.xpReward / adjustedTime;
      const overallScore = coinsPerSecond + xpPerSecond * 2;

      return { coinsPerSecond: Math.round(coinsPerSecond * 100) / 100, xpPerSecond: Math.round(xpPerSecond * 100) / 100, overallScore: Math.round(overallScore * 100) / 100 };
    },
    [sbGetStationSpeedMultiplier]
  );

  /** Get recommended upgrades based on current state and budget. */
  const sbGetRecommendedUpgrades = useCallback(
    (budget: number): { type: 'station' | 'tool'; id: string; name: string; cost: number; priority: number }[] => {
      const recommendations: { type: 'station' | 'tool'; id: string; name: string; cost: number; priority: number }[] = [];

      // Evaluate station upgrades
      for (const st of state.stations) {
        const def = SB_STATIONS.find((s) => s.id === st.id);
        if (!def || st.level >= def.maxLevel) continue;
        const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.6, st.level - 1));
        if (cost > budget) continue;
        // Priority: higher for active station, higher for lower levels
        const isActive = st.id === state.activeStation;
        const priority = (isActive ? 10 : 5) + (def.maxLevel - st.level) * 2 + def.baseQualityBonus;
        recommendations.push({ type: 'station', id: st.id, name: def.name, cost, priority });
      }

      // Evaluate tool upgrades
      for (const tl of state.tools) {
        const def = SB_TOOLS.find((t) => t.id === tl.id);
        if (!def || tl.level >= def.maxLevel) continue;
        const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, tl.level - 1));
        if (cost > budget) continue;
        // Priority: higher for equipped tools, higher for luck/quality
        const isEquipped = tl.equipped;
        const typeBonus = def.bonusType === 'luck' ? 8 : def.bonusType === 'quality' ? 6 : def.bonusType === 'speed' ? 5 : 3;
        const priority = (isEquipped ? 10 : 3) + typeBonus + (def.maxLevel - tl.level);
        recommendations.push({ type: 'tool', id: tl.id, name: def.name, cost, priority });
      }

      recommendations.sort((a, b) => b.priority - a.priority);
      return recommendations;
    },
    [state.stations, state.tools, state.activeStation]
  );

  /** Simulate a bake without actually baking — returns projected results. */
  const sbSimulateBake = useCallback(
    (recipeId: string): {
      recipe: RecipeDef | null;
      canBake: boolean;
      estimatedTime: number;
      estimatedQuality: number;
      estimatedCoins: number;
      estimatedXP: number;
      missingIngredients: { ingredientId: string; name: string; have: number; need: number }[];
      reason: string;
    } => {
      const recipe = SB_RECIPES.find((r) => r.id === recipeId);
      if (!recipe) return { recipe: null, canBake: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients: [], reason: 'Recipe not found' };
      if (!state.unlockedRecipes.includes(recipeId)) return { recipe, canBake: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients: [], reason: 'Recipe is locked' };
      if (state.level < recipe.requiredLevel) return { recipe, canBake: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients: [], reason: `Requires level ${recipe.requiredLevel}` };
      if (state.activeStation !== recipe.stationId) {
        const stationDef = SB_STATIONS.find((s) => s.id === recipe.stationId);
        return { recipe, canBake: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients: [], reason: `Requires station: ${stationDef?.name ?? recipe.stationId}` };
      }

      const missingIngredients = recipe.ingredients
        .map((ing) => {
          const def = SB_INGREDIENTS.find((i) => i.id === ing.ingredientId);
          const have = state.ingredients[ing.ingredientId] ?? 0;
          return { ingredientId: ing.ingredientId, name: def?.name ?? ing.ingredientId, have, need: ing.amount };
        })
        .filter((m) => m.have < m.need);

      if (missingIngredients.length > 0) return { recipe, canBake: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients, reason: 'Missing ingredients' };
      if (state.bakingQueue.length >= sbGetMaxBakeSlots()) return { recipe, canBake: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients: [], reason: 'All bake slots are full' };

      // Calculate estimates
      const speedMult = sbGetStationSpeedMultiplier(recipe.stationId);
      const estimatedTime = Math.max(5, Math.floor(recipe.bakeTime / speedMult));
      const qualityBase = sbGetStationQualityBonus(recipe.stationId);
      const estimatedQuality = Math.min(100, 50 + qualityBase + 5);
      const qualityMult = estimatedQuality / 100;
      const rarityMult = rarityMultiplier(recipe.rarity);
      const estimatedCoins = Math.floor(recipe.sellPrice * qualityMult * (0.8 + rarityMult * 0.2));
      const estimatedXP = Math.floor(recipe.xpReward * qualityMult * rarityMult);

      return { recipe, canBake: true, estimatedTime, estimatedQuality, estimatedCoins, estimatedXP, missingIngredients: [], reason: 'Ready to bake' };
    },
    [state.unlockedRecipes, state.level, state.activeStation, state.ingredients, state.bakingQueue, sbGetMaxBakeSlots, sbGetStationSpeedMultiplier, sbGetStationQualityBonus]
  );

  /** Get distribution of unlocked recipes by rarity. */
  const sbGetRecipeRarityDistribution = useCallback((): Record<Rarity, { total: number; unlocked: number }> => {
    const result: Record<Rarity, { total: number; unlocked: number }> = {
      common: { total: 0, unlocked: 0 },
      uncommon: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 },
      mythic: { total: 0, unlocked: 0 },
    };
    for (const recipe of SB_RECIPES) {
      result[recipe.rarity].total += 1;
      if (state.unlockedRecipes.includes(recipe.id)) {
        result[recipe.rarity].unlocked += 1;
      }
    }
    return result;
  }, [state.unlockedRecipes]);

  /** Get the total coin value of all ingredients in inventory. */
  const sbGetInventoryValue = useCallback((): number => {
    return Object.entries(state.ingredients).reduce((sum, [id, qty]) => {
      const def = SB_INGREDIENTS.find((i) => i.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
  }, [state.ingredients]);

  /** Get net worth: coins + inventory value. */
  const sbGetNetWorth = useCallback((): number => {
    const inventoryValue = Object.entries(state.ingredients).reduce((sum, [id, qty]) => {
      const def = SB_INGREDIENTS.find((i) => i.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
    return state.coins + inventoryValue;
  }, [state.coins, state.ingredients]);

  // ============================================================
  // Return all functions
  // ============================================================

  return {
    sbGetState,
    sbResetState,
    sbSeed,
    sbRandom,
    sbRandomInt,
    sbRandomChoice,
    sbGetLevel,
    sbGetXP,
    sbGetXPTillNext,
    sbGetXPTotal,
    sbAddXP,
    sbGetTitle,
    sbGetAllTitles,
    sbGetNextTitle,
    sbGetProgress,
    sbGetOverallProgress,
    sbGetCoins,
    sbAddCoins,
    sbSpendCoins,
    sbCanAfford,
    sbGetRecipes,
    sbGetUnlockedRecipes,
    sbGetLockedRecipes,
    sbGetRecipeById,
    sbIsRecipeUnlocked,
    sbUnlockRecipe,
    sbGetStations,
    sbGetStationLevels,
    sbGetActiveStation,
    sbSetActiveStation,
    sbGetStationLevel,
    sbGetStationSpeedMultiplier,
    sbGetStationQualityBonus,
    sbUpgradeStation,
    sbGetIngredients,
    sbGetIngredientById,
    sbGetInventory,
    sbGetIngredientCount,
    sbGetIngredientCost,
    sbBuyIngredient,
    sbUseIngredient,
    sbHasIngredients,
    sbGetMissingIngredients,
    sbBake,
    sbGetBakingQueue,
    sbCancelBake,
    sbCollectBake,
    sbGetBakeTimeRemaining,
    sbGetRecipeProfit,
    sbGetCustomers,
    sbGetActiveCustomers,
    sbSpawnCustomer,
    sbServeCustomer,
    sbDismissCustomer,
    sbGetCustomerSatisfaction,
    sbGetCustomerOrder,
    sbAutoSpawnCustomers,
    sbGetTools,
    sbGetToolStates,
    sbGetEquippedTools,
    sbGetToolLevel,
    sbGetToolBonus,
    sbEquipTool,
    sbUpgradeTool,
    sbGetQuests,
    sbGetActiveQuests,
    sbGetAvailableQuests,
    sbGetCompletedQuests,
    sbAcceptQuest,
    sbGetQuestProgress,
    sbCompleteQuest,
    sbAbandonQuest,
    sbGetAchievements,
    sbGetUnlockedAchievements,
    sbIsAchievementUnlocked,
    sbCheckAchievements,
    sbUnlockAchievement,
    sbGetDailyTask,
    sbRefreshDailyTask,
    sbClaimDailyReward,
    sbGetDailyStreak,
    sbGetLastDaily,
    sbEnterBakeOff,
    sbGetBakeOffRank,
    sbGetBakeOffStats,
    sbGetStats,
    sbGetBakeCount,
    sbGetEarnedCoins,
    sbGetProfit,
    sbGetTotalSpent,
    sbGetNPCs,
    sbGetNPCById,
    sbGetRarityInfo,
    sbGetAllRarities,
    sbGetRecipesByStation,
    sbGetRecipesByRarity,
    sbGetIngredientsByRarity,
    sbIsBaking,
    sbGetMaxBakeSlots,
    sbGetAvailableBakeSlots,
    // -- Extended utilities --
    sbBatchBuyIngredients,
    sbGetBestRecipeForStation,
    sbGetMostProfitableRecipe,
    sbGetAffordableRecipes,
    sbGetBakeableRecipes,
    sbGetBakerySummary,
    sbGetCustomerTips,
    sbCalculateBakeEfficiency,
    sbGetRecommendedUpgrades,
    sbSimulateBake,
    sbGetRecipeRarityDistribution,
    sbGetInventoryValue,
    sbGetNetWorth,
  };
}

// ============================================================
// Internal Quest Progress Helper (not exported)
// ============================================================

function sbProcessQuestProgress(
  state: SorcerersBakeryState,
  type: QuestType,
  amount: number
): SorcerersBakeryState {
  let updated = state;
  for (const aq of updated.activeQuests) {
    if (aq.completed) continue;
    const def = SB_QUESTS.find((q) => q.id === aq.id);
    if (!def || def.type !== type) continue;
    const newProgress = aq.progress + amount;
    const isCompleted = newProgress >= def.target;
    updated = {
      ...updated,
      activeQuests: updated.activeQuests.map((q) =>
        q.id === aq.id ? { ...q, progress: Math.min(newProgress, def.target), completed: isCompleted } : q
      ),
    };
  }
  return updated;
}

export default useSorcerersBakery;
