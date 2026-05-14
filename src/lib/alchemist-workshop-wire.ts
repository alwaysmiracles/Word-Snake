import { useState, useCallback, useRef } from 'react';

// ============================================================
// Alchemist's Workshop — Magical Potion Brewing Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// ============================================================

// ============================================================
// Types
// ============================================================

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type BonusType = 'speed' | 'quality' | 'yield' | 'luck';
export type QuestType = 'brew' | 'sell' | 'earn' | 'collect' | 'experiment';
export type DailyType = 'brew' | 'sell' | 'earn' | 'transmute';

export interface IngredientDef {
  id: string;
  name: string;
  rarity: Rarity;
  cost: number;
  description: string;
  emoji: string;
}

export interface PotionDef {
  id: string;
  name: string;
  rarity: Rarity;
  ingredients: { ingredientId: string; amount: number }[];
  brewTime: number;
  sellPrice: number;
  xpReward: number;
  stationId: string;
  description: string;
  emoji: string;
  requiredLevel: number;
  effect: string;
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

export interface BrewJob {
  id: string;
  potionId: string;
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

export interface ExperimentResult {
  potionId: string | null;
  potionName: string;
  rarity: Rarity;
  quality: number;
  coinsEarned: number;
  xpEarned: number;
  wasNew: boolean;
}

export interface TransmutationRecipe {
  fromIngredientId: string;
  toIngredientId: string;
  fromAmount: number;
  toAmount: number;
  cost: number;
  requiredLevel: number;
}

export interface AlchemistWorkshopState {
  level: number;
  xp: number;
  coins: number;
  unlockedPotions: string[];
  activeStation: string;
  ingredients: Record<string, number>;
  reputation: number;
  reputationTitle: string;
  completedBrews: number;
  soldPotions: number;
  totalEarned: number;
  totalSpent: number;
  brewingQueue: BrewJob[];
  dailyStreak: number;
  lastDaily: string | null;
  activeQuests: QuestState[];
  completedQuests: string[];
  unlockedAchievements: AchievementState[];
  alchemyContestEntries: number;
  alchemyContestWins: number;
  alchemyContestLastRank: number | null;
  dailyTask: DailyTaskState | null;
  stations: StationState[];
  tools: ToolState[];
  seed: number;
  brewCountByRarity: Record<Rarity, number>;
  ingredientCountByRarity: Record<Rarity, number>;
  stationUpgradeCount: number;
  toolUpgradeCount: number;
  totalExperiments: number;
  totalTransmutations: number;
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

function awHashString(str: string): number {
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
  if (level >= AW_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function clampLevel(lvl: number): number {
  return Math.max(1, Math.min(AW_MAX_LEVEL, lvl));
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

export const AW_MAX_LEVEL = 50;

export const AW_RARITIES: RarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
  { key: 'mythic', label: 'Mythic', color: '#F472B6', xpMultiplier: 8 },
];

export const AW_TITLE_THRESHOLDS: TitleInfo[] = [
  { name: 'Apprentice', levelRequired: 1, description: 'A humble beginning in the art of alchemy' },
  { name: 'Novice Alchemist', levelRequired: 5, description: 'Learning to identify reagents and brew basic elixirs' },
  { name: 'Journeyman Brewer', levelRequired: 10, description: 'Your potions are sought after by local adventurers' },
  { name: 'Arcane Chemist', levelRequired: 18, description: 'Master of complex transmutation and distillation' },
  { name: 'Master Distiller', levelRequired: 25, description: 'Your legendary brews are known across the realm' },
  { name: 'Grand Enchanter', levelRequired: 33, description: 'Even the Archmage Council seeks your expertise' },
  { name: 'Archmage Alchemist', levelRequired: 42, description: 'Your potions can reshape the fabric of reality' },
  { name: 'Grand Transmuter', levelRequired: 50, description: 'The greatest alchemist in all the known realms' },
];

export const AW_REPUTATION_TITLES: string[] = [
  'Unknown', 'Known', 'Respected', 'Esteemed', 'Renowned', 'Legendary',
];

export const AW_INGREDIENTS: IngredientDef[] = [
  { id: 'crystalized_dew', name: 'Crystalized Morning Dew', rarity: 'common', cost: 5, description: 'Dewdrops frozen in time at the crack of dawn', emoji: '💧' },
  { id: 'mandrake_root', name: 'Mandrake Root', rarity: 'common', cost: 6, description: 'A potent root used as a base for many brews', emoji: '🌱' },
  { id: 'fire_lily', name: 'Fire Lily', rarity: 'common', cost: 4, description: 'A flower that burns to the touch, adds fiery essence', emoji: '🔥' },
  { id: 'enchanted_mushroom', name: 'Enchanted Mushroom', rarity: 'common', cost: 7, description: 'Glowing fungi found in enchanted forest groves', emoji: '🍄' },
  { id: 'spirit_bark', name: 'Spirit Willow Bark', rarity: 'common', cost: 5, description: 'Bark from the spirit willow, soothes magical ailments', emoji: '🌿' },
  { id: 'moonstone_dust', name: 'Moonstone Dust', rarity: 'uncommon', cost: 12, description: 'Ground from moonstones under a full moon', emoji: '🌙' },
  { id: 'fairy_wing_powder', name: 'Fairy Wing Powder', rarity: 'uncommon', cost: 14, description: 'Shimmering powder shed by fairies at midsummer', emoji: '🧚' },
  { id: 'gargoyle_stone', name: 'Gargoyle Stone', rarity: 'uncommon', cost: 10, description: 'Pebbles from living gargoyles, hardens potions', emoji: '🪨' },
  { id: 'elven_moonpetal', name: 'Elven Moonpetal', rarity: 'uncommon', cost: 13, description: 'Rare flower that only blooms in moonlit elven gardens', emoji: '🌸' },
  { id: 'sunstone_core', name: 'Sunstone Core', rarity: 'uncommon', cost: 11, description: 'The glowing heart of a sunstone crystal', emoji: '☀️' },
  { id: 'dragon_scale', name: 'Dragon Scale', rarity: 'rare', cost: 25, description: 'An iridescent scale from a young dragon', emoji: '🐉' },
  { id: 'phoenix_ash', name: 'Phoenix Ash', rarity: 'rare', cost: 28, description: 'Ashes from a phoenix rebirth, radiates warmth', emoji: '🦅' },
  { id: 'thunder_lotus', name: 'Thunder Lotus', rarity: 'rare', cost: 22, description: 'A lotus that blooms during thunderstorms', emoji: '⚡' },
  { id: 'frost_shard', name: 'Frost Crystal Shard', rarity: 'rare', cost: 24, description: 'Never-melting ice from the eternal glaciers', emoji: '❄️' },
  { id: 'wyrm_fang', name: 'Wyrm Fang', rarity: 'rare', cost: 26, description: 'A fang from an ancient wyrm, potent reagent', emoji: '🦷' },
  { id: 'shadow_essence', name: 'Shadow Essence', rarity: 'epic', cost: 40, description: 'Bottled darkness from the Shadow Realm', emoji: '🌑' },
  { id: 'basilisk_eye', name: 'Basilisk Eye', rarity: 'epic', cost: 38, description: 'Preserved eye of a basilisk — handle with care', emoji: '👁️' },
  { id: 'kraken_ink', name: 'Kraken Ink', rarity: 'epic', cost: 42, description: 'Deep-sea ink with reality-altering properties', emoji: '🦑' },
  { id: 'abyssal_pearl', name: 'Abyssal Pearl', rarity: 'epic', cost: 45, description: 'A pearl formed in the deepest ocean trenches', emoji: '🫧' },
  { id: 'spirit_venom', name: 'Spirit Venom', rarity: 'epic', cost: 36, description: 'Venom extracted from spectral serpents', emoji: '🐍' },
  { id: 'mermaid_tears', name: 'Mermaid Tears', rarity: 'legendary', cost: 60, description: 'Tears of pure ocean magic, extremely rare', emoji: '🧜' },
  { id: 'starfall_fragment', name: 'Starfall Fragment', rarity: 'legendary', cost: 65, description: 'A shard of a fallen star, radiates cosmic energy', emoji: '⭐' },
  { id: 'chimera_horn', name: 'Chimera Horn', rarity: 'legendary', cost: 70, description: 'Powdered horn from a rare chimera', emoji: '🦄' },
  { id: 'void_salt', name: 'Void Salt', rarity: 'mythic', cost: 120, description: 'Salt crystallized from the void between dimensions', emoji: '🕳️' },
  { id: 'unicorn_blood', name: 'Unicorn Blood', rarity: 'mythic', cost: 150, description: 'A drop of pure, immortal life essence', emoji: '💎' },
  { id: 'eternity_sand', name: 'Eternity Sand', rarity: 'mythic', cost: 130, description: 'Sand from the Hourglass of Eternity itself', emoji: '⏳' },
];

export const AW_STATIONS: StationDef[] = [
  { id: 'mortar_pestle', name: 'Mortar & Pestle', description: 'The classic alchemist tool for grinding and mixing basic reagents', emoji: '⚗️', maxLevel: 10, baseSpeedMultiplier: 1.0, baseQualityBonus: 0, baseUpgradeCost: 100 },
  { id: 'crystal_cauldron', name: 'Crystal Cauldron', description: 'A transparent cauldron that reveals the alchemy process within', emoji: '🫕', maxLevel: 10, baseSpeedMultiplier: 1.0, baseQualityBonus: 5, baseUpgradeCost: 120 },
  { id: 'shadow_distillery', name: 'Shadow Distillery', description: 'Distills essences in absolute darkness for maximum purity', emoji: '🌑', maxLevel: 10, baseSpeedMultiplier: 0.9, baseQualityBonus: 10, baseUpgradeCost: 200 },
  { id: 'storm_flask_foundry', name: 'Storm Flask Foundry', description: 'Harnesses lightning to accelerate magical reactions', emoji: '⚡', maxLevel: 10, baseSpeedMultiplier: 1.2, baseQualityBonus: 3, baseUpgradeCost: 150 },
  { id: 'herbal_incubator', name: 'Herbal Incubator', description: 'Slowly nurtures botanical potions to peak potency', emoji: '🌱', maxLevel: 10, baseSpeedMultiplier: 1.0, baseQualityBonus: 8, baseUpgradeCost: 180 },
  { id: 'astral_alembic', name: 'Astral Alembic', description: 'Connects to astral planes for ethereal ingredient infusion', emoji: '🔮', maxLevel: 10, baseSpeedMultiplier: 0.8, baseQualityBonus: 15, baseUpgradeCost: 250 },
  { id: 'void_condenser', name: 'Void Condenser', description: 'Condenses raw magical energy into liquid form', emoji: '🕳️', maxLevel: 10, baseSpeedMultiplier: 1.1, baseQualityBonus: 6, baseUpgradeCost: 160 },
  { id: 'dragon_forge_crucible', name: 'Dragon Forge Crucible', description: 'Ancient crucible heated by dormant dragon fire', emoji: '🐉', maxLevel: 10, baseSpeedMultiplier: 1.5, baseQualityBonus: 12, baseUpgradeCost: 300 },
];

export const AW_POTIONS: PotionDef[] = [
  { id: 'healing_salve', name: 'Healing Salve', rarity: 'common', ingredients: [{ ingredientId: 'mandrake_root', amount: 2 }, { ingredientId: 'spirit_bark', amount: 1 }], brewTime: 15, sellPrice: 18, xpReward: 10, stationId: 'mortar_pestle', description: 'A basic healing potion that mends minor wounds', emoji: '❤️', requiredLevel: 1, effect: 'Restores 20 HP' },
  { id: 'speed_elixir', name: 'Minor Speed Elixir', rarity: 'common', ingredients: [{ ingredientId: 'fire_lily', amount: 1 }, { ingredientId: 'crystalized_dew', amount: 2 }], brewTime: 12, sellPrice: 15, xpReward: 8, stationId: 'herbal_incubator', description: 'A fizzy brew that makes your legs feel lighter', emoji: '💨', requiredLevel: 1, effect: '+15% move speed for 1 hour' },
  { id: 'nightvision_draught', name: 'Nightvision Draught', rarity: 'common', ingredients: [{ ingredientId: 'moonstone_dust', amount: 1 }, { ingredientId: 'enchanted_mushroom', amount: 2 }], brewTime: 18, sellPrice: 20, xpReward: 10, stationId: 'crystal_cauldron', description: 'See clearly in the darkest dungeons', emoji: '👁️', requiredLevel: 1, effect: 'Darkvision for 2 hours' },
  { id: 'warmth_tonic', name: 'Warmth Tonic', rarity: 'common', ingredients: [{ ingredientId: 'fire_lily', amount: 2 }, { ingredientId: 'spirit_bark', amount: 1 }], brewTime: 10, sellPrice: 12, xpReward: 6, stationId: 'mortar_pestle', description: 'Warms the body from within on cold nights', emoji: '🔥', requiredLevel: 1, effect: 'Resistance to cold for 3 hours' },
  { id: 'basic_antidote', name: 'Basic Antidote', rarity: 'common', ingredients: [{ ingredientId: 'mandrake_root', amount: 1 }, { ingredientId: 'enchanted_mushroom', amount: 2 }, { ingredientId: 'crystalized_dew', amount: 1 }], brewTime: 20, sellPrice: 22, xpReward: 11, stationId: 'herbal_incubator', description: 'Neutralizes common poisons and venoms', emoji: '💊', requiredLevel: 2, effect: 'Cures common poisons' },
  { id: 'strength_brew', name: 'Minor Strength Brew', rarity: 'uncommon', ingredients: [{ ingredientId: 'dragon_scale', amount: 1 }, { ingredientId: 'mandrake_root', amount: 2 }, { ingredientId: 'fire_lily', amount: 1 }], brewTime: 25, sellPrice: 35, xpReward: 18, stationId: 'dragon_forge_crucible', description: 'Temporarily grants superhuman strength', emoji: '💪', requiredLevel: 2, effect: '+5 Strength for 1 hour' },
  { id: 'fortune_flask', name: 'Fortune Flask', rarity: 'uncommon', ingredients: [{ ingredientId: 'sunstone_core', amount: 2 }, { ingredientId: 'fairy_wing_powder', amount: 1 }], brewTime: 22, sellPrice: 38, xpReward: 20, stationId: 'astral_alembic', description: 'A golden liquid that attracts good luck', emoji: '🍀', requiredLevel: 3, effect: '+10% luck for 2 hours' },
  { id: 'clear_mind', name: 'Clear Mind Potion', rarity: 'uncommon', ingredients: [{ ingredientId: 'elven_moonpetal', amount: 2 }, { ingredientId: 'crystalized_dew', amount: 1 }], brewTime: 20, sellPrice: 32, xpReward: 16, stationId: 'crystal_cauldron', description: 'Sharpens focus and clears mental fog', emoji: '🧠', requiredLevel: 3, effect: '+5 Wisdom for 2 hours' },
  { id: 'barkskin_elixir', name: 'Barkskin Elixir', rarity: 'uncommon', ingredients: [{ ingredientId: 'spirit_bark', amount: 3 }, { ingredientId: 'gargoyle_stone', amount: 1 }], brewTime: 28, sellPrice: 40, xpReward: 22, stationId: 'herbal_incubator', description: 'Hardens skin to bark-like toughness', emoji: '🛡️', requiredLevel: 4, effect: '+10 Armor for 1 hour' },
  { id: 'water_breathing', name: 'Water Breathing Potion', rarity: 'uncommon', ingredients: [{ ingredientId: 'moonstone_dust', amount: 1 }, { ingredientId: 'crystalized_dew', amount: 2 }, { ingredientId: 'enchanted_mushroom', amount: 1 }], brewTime: 30, sellPrice: 42, xpReward: 21, stationId: 'crystal_cauldron', description: 'Grow gills and breathe underwater freely', emoji: '🌊', requiredLevel: 5, effect: 'Water breathing for 1 hour' },
  { id: 'flame_shield', name: 'Flame Shield Draught', rarity: 'rare', ingredients: [{ ingredientId: 'dragon_scale', amount: 1 }, { ingredientId: 'fire_lily', amount: 2 }, { ingredientId: 'phoenix_ash', amount: 1 }], brewTime: 35, sellPrice: 60, xpReward: 30, stationId: 'dragon_forge_crucible', description: 'Creates a protective barrier of fire around the drinker', emoji: '🔥', requiredLevel: 5, effect: 'Fire immunity for 30 minutes' },
  { id: 'invisibility_tincture', name: 'Invisibility Tincture', rarity: 'rare', ingredients: [{ ingredientId: 'shadow_essence', amount: 1 }, { ingredientId: 'moonstone_dust', amount: 2 }, { ingredientId: 'fairy_wing_powder', amount: 1 }], brewTime: 40, sellPrice: 70, xpReward: 35, stationId: 'shadow_distillery', description: 'Turns the drinker completely invisible', emoji: '👻', requiredLevel: 6, effect: 'Invisibility for 10 minutes' },
  { id: 'berserker_brew', name: 'Berserker Brew', rarity: 'rare', ingredients: [{ ingredientId: 'wyrm_fang', amount: 1 }, { ingredientId: 'fire_lily', amount: 2 }, { ingredientId: 'dragon_scale', amount: 1 }], brewTime: 32, sellPrice: 65, xpReward: 32, stationId: 'storm_flask_foundry', description: 'Sends the drinker into a powerful rage', emoji: '😤', requiredLevel: 7, effect: '+15 Strength, +10 Attack for 5 minutes' },
  { id: 'frost_resistance', name: 'Frost Resistance Potion', rarity: 'rare', ingredients: [{ ingredientId: 'frost_shard', amount: 2 }, { ingredientId: 'spirit_bark', amount: 1 }, { ingredientId: 'crystalized_dew', amount: 1 }], brewTime: 30, sellPrice: 55, xpReward: 28, stationId: 'void_condenser', description: 'Makes the drinker immune to freezing temperatures', emoji: '❄️', requiredLevel: 8, effect: 'Frost immunity for 1 hour' },
  { id: 'spider_climb', name: 'Spider Climb Elixir', rarity: 'rare', ingredients: [{ ingredientId: 'gargoyle_stone', amount: 2 }, { ingredientId: 'enchanted_mushroom', amount: 1 }, { ingredientId: 'fairy_wing_powder', amount: 1 }], brewTime: 28, sellPrice: 50, xpReward: 25, stationId: 'herbal_incubator', description: 'Allows the drinker to climb any surface', emoji: '🕷️', requiredLevel: 8, effect: 'Wall climbing for 30 minutes' },
  { id: 'feather_fall', name: 'Feather Fall Draft', rarity: 'rare', ingredients: [{ ingredientId: 'fairy_wing_powder', amount: 2 }, { ingredientId: 'crystalized_dew', amount: 1 }, { ingredientId: 'elven_moonpetal', amount: 1 }], brewTime: 25, sellPrice: 52, xpReward: 26, stationId: 'astral_alembic', description: 'Slows falling speed to a gentle float', emoji: '🪶', requiredLevel: 9, effect: 'Safe falling for 1 hour' },
  { id: 'eagle_eye', name: 'Eagle Eye Tonic', rarity: 'rare', ingredients: [{ ingredientId: 'sunstone_core', amount: 2 }, { ingredientId: 'frost_shard', amount: 1 }], brewTime: 22, sellPrice: 48, xpReward: 24, stationId: 'crystal_cauldron', description: 'Grants incredibly sharp long-distance vision', emoji: '🦅', requiredLevel: 10, effect: '+20 Perception for 1 hour' },
  { id: 'tongues_tonic', name: 'Tongues Tonic', rarity: 'rare', ingredients: [{ ingredientId: 'elven_moonpetal', amount: 2 }, { ingredientId: 'moonstone_dust', amount: 1 }, { ingredientId: 'spirit_bark', amount: 1 }], brewTime: 30, sellPrice: 55, xpReward: 28, stationId: 'crystal_cauldron', description: 'Enables understanding of all spoken languages', emoji: '🗣️', requiredLevel: 10, effect: 'Understand all languages for 2 hours' },
  { id: 'viper_antidote', name: 'Viper Venom Antidote', rarity: 'epic', ingredients: [{ ingredientId: 'spirit_venom', amount: 1 }, { ingredientId: 'mandrake_root', amount: 2 }, { ingredientId: 'enchanted_mushroom', amount: 2 }], brewTime: 45, sellPrice: 95, xpReward: 48, stationId: 'shadow_distillery', description: 'Cures even the most deadly mythical poisons', emoji: '🐍', requiredLevel: 11, effect: 'Cures all poisons and grants immunity for 1 hour' },
  { id: 'polymorph_potion', name: 'Polymorph Potion', rarity: 'epic', ingredients: [{ ingredientId: 'kraken_ink', amount: 1 }, { ingredientId: 'fairy_wing_powder', amount: 2 }, { ingredientId: 'shadow_essence', amount: 1 }], brewTime: 55, sellPrice: 110, xpReward: 55, stationId: 'astral_alembic', description: 'Temporarily transforms the drinker into another creature', emoji: '🐸', requiredLevel: 12, effect: 'Polymorph for 10 minutes' },
  { id: 'phasing_draught', name: 'Phasing Draught', rarity: 'epic', ingredients: [{ ingredientId: 'shadow_essence', amount: 2 }, { ingredientId: 'abyssal_pearl', amount: 1 }, { ingredientId: 'moonstone_dust', amount: 1 }], brewTime: 50, sellPrice: 100, xpReward: 50, stationId: 'shadow_distillery', description: 'Allows the drinker to phase through solid matter', emoji: '🌀', requiredLevel: 13, effect: 'Phase through walls for 5 minutes' },
  { id: 'shadow_step', name: 'Shadow Step Elixir', rarity: 'epic', ingredients: [{ ingredientId: 'shadow_essence', amount: 2 }, { ingredientId: 'fairy_wing_powder', amount: 1 }, { ingredientId: 'thunder_lotus', amount: 1 }], brewTime: 48, sellPrice: 105, xpReward: 52, stationId: 'shadow_distillery', description: 'Teleport short distances by stepping through shadows', emoji: '🌑', requiredLevel: 14, effect: 'Shadow teleport 5 times' },
  { id: 'storm_ward', name: 'Storm Ward Brew', rarity: 'epic', ingredients: [{ ingredientId: 'thunder_lotus', amount: 2 }, { ingredientId: 'frost_shard', amount: 1 }, { ingredientId: 'dragon_scale', amount: 1 }], brewTime: 52, sellPrice: 108, xpReward: 54, stationId: 'storm_flask_foundry', description: 'Creates a ward that deflects lightning and storms', emoji: '⛈️', requiredLevel: 15, effect: 'Storm immunity for 30 minutes' },
  { id: 'charm_potion', name: 'Charm Potion', rarity: 'epic', ingredients: [{ ingredientId: 'elven_moonpetal', amount: 2 }, { ingredientId: 'fairy_wing_powder', amount: 1 }, { ingredientId: 'sunstone_core', amount: 1 }], brewTime: 42, sellPrice: 90, xpReward: 45, stationId: 'astral_alembic', description: 'Makes the drinker impossibly charming and persuasive', emoji: '💕', requiredLevel: 16, effect: '+20 Charisma for 1 hour' },
  { id: 'memory_elixir', name: 'Memory Elixir', rarity: 'epic', ingredients: [{ ingredientId: 'abyssal_pearl', amount: 1 }, { ingredientId: 'moonstone_dust', amount: 2 }, { ingredientId: 'elven_moonpetal', amount: 1 }], brewTime: 44, sellPrice: 92, xpReward: 46, stationId: 'crystal_cauldron', description: 'Perfectly restores and enhances memory', emoji: '📖', requiredLevel: 17, effect: 'Perfect memory for 2 hours' },
  { id: 'true_seeing', name: 'True Seeing Tincture', rarity: 'epic', ingredients: [{ ingredientId: 'sunstone_core', amount: 2 }, { ingredientId: 'basilisk_eye', amount: 1 }, { ingredientId: 'moonstone_dust', amount: 1 }], brewTime: 50, sellPrice: 115, xpReward: 58, stationId: 'astral_alembic', description: 'Reveals hidden doors, illusions, and invisible creatures', emoji: '👁️', requiredLevel: 18, effect: 'True seeing for 30 minutes' },
  { id: 'dragon_armor', name: 'Dragon Scale Armor Potion', rarity: 'legendary', ingredients: [{ ingredientId: 'dragon_scale', amount: 3 }, { ingredientId: 'chimera_horn', amount: 1 }, { ingredientId: 'gargoyle_stone', amount: 2 }], brewTime: 70, sellPrice: 200, xpReward: 100, stationId: 'dragon_forge_crucible', description: 'Grants skin as tough as dragon scales', emoji: '🐉', requiredLevel: 20, effect: '+50 Armor for 30 minutes' },
  { id: 'time_warp', name: 'Time Warp Elixir', rarity: 'legendary', ingredients: [{ ingredientId: 'starfall_fragment', amount: 1 }, { ingredientId: 'abyssal_pearl', amount: 2 }, { ingredientId: 'thunder_lotus', amount: 1 }], brewTime: 75, sellPrice: 220, xpReward: 110, stationId: 'astral_alembic', description: 'Briefly accelerates time around the drinker', emoji: '⏰', requiredLevel: 22, effect: '2x action speed for 1 minute' },
  { id: 'phoenix_rebirth', name: 'Phoenix Rebirth Draught', rarity: 'legendary', ingredients: [{ ingredientId: 'phoenix_ash', amount: 3 }, { ingredientId: 'dragon_scale', amount: 1 }, { ingredientId: 'mermaid_tears', amount: 1 }], brewTime: 80, sellPrice: 250, xpReward: 125, stationId: 'dragon_forge_crucible', description: 'If the drinker dies, they are reborn in flames', emoji: '🔥', requiredLevel: 24, effect: 'Auto-revive with 50% HP once' },
  { id: 'mind_control', name: 'Mind Control Tincture', rarity: 'legendary', ingredients: [{ ingredientId: 'basilisk_eye', amount: 1 }, { ingredientId: 'kraken_ink', amount: 2 }, { ingredientId: 'shadow_essence', amount: 1 }], brewTime: 68, sellPrice: 210, xpReward: 105, stationId: 'shadow_distillery', description: 'Allows subtle influence over weak-minded creatures', emoji: '🧿', requiredLevel: 26, effect: 'Suggest command to one creature' },
  { id: 'teleport_brew', name: 'Teleportation Brew', rarity: 'legendary', ingredients: [{ ingredientId: 'starfall_fragment', amount: 2 }, { ingredientId: 'fairy_wing_powder', amount: 1 }, { ingredientId: 'void_salt', amount: 1 }], brewTime: 72, sellPrice: 230, xpReward: 115, stationId: 'void_condenser', description: 'Instantly teleport to any known location', emoji: '✨', requiredLevel: 28, effect: 'Teleport once anywhere' },
  { id: 'leviathan_breath', name: 'Leviathan\'s Breath', rarity: 'legendary', ingredients: [{ ingredientId: 'kraken_ink', amount: 2 }, { ingredientId: 'mermaid_tears', amount: 1 }, { ingredientId: 'abyssal_pearl', amount: 2 }], brewTime: 78, sellPrice: 240, xpReward: 120, stationId: 'void_condenser', description: 'Grants the power to breathe underwater and command sea life', emoji: '🌊', requiredLevel: 30, effect: 'Underwater mastery for 1 hour' },
  { id: 'eternal_youth', name: 'Elixir of Eternal Youth', rarity: 'mythic', ingredients: [{ ingredientId: 'unicorn_blood', amount: 1 }, { ingredientId: 'mermaid_tears', amount: 2 }, { ingredientId: 'elven_moonpetal', amount: 2 }, { ingredientId: 'starfall_fragment', amount: 1 }], brewTime: 100, sellPrice: 500, xpReward: 250, stationId: 'astral_alembic', description: 'Temporarily reverses aging — the ultimate beauty potion', emoji: '🌸', requiredLevel: 33, effect: 'Youthful form for 24 hours' },
  { id: 'philosopher_essence', name: 'Philosopher\'s Stone Essence', rarity: 'mythic', ingredients: [{ ingredientId: 'void_salt', amount: 1 }, { ingredientId: 'unicorn_blood', amount: 1 }, { ingredientId: 'phoenix_ash', amount: 2 }, { ingredientId: 'dragon_scale', amount: 2 }], brewTime: 110, sellPrice: 550, xpReward: 275, stationId: 'dragon_forge_crucible', description: 'A diluted essence of the legendary Philosopher\'s Stone', emoji: '💎', requiredLevel: 36, effect: 'Transform lead into gold (10 units)' },
  { id: 'void_walker', name: 'Void Walker Potion', rarity: 'mythic', ingredients: [{ ingredientId: 'void_salt', amount: 2 }, { ingredientId: 'shadow_essence', amount: 2 }, { ingredientId: 'abyssal_pearl', amount: 1 }, { ingredientId: 'starfall_fragment', amount: 1 }], brewTime: 95, sellPrice: 480, xpReward: 240, stationId: 'void_condenser', description: 'Walk between dimensions, existing partially in the void', emoji: '🕳️', requiredLevel: 39, effect: 'Planar travel for 10 minutes' },
  { id: 'omniscience', name: 'Omniscience Draught', rarity: 'mythic', ingredients: [{ ingredientId: 'basilisk_eye', amount: 1 }, { ingredientId: 'unicorn_blood', amount: 1 }, { ingredientId: 'sunstone_core', amount: 2 }, { ingredientId: 'abyssal_pearl', amount: 1 }], brewTime: 105, sellPrice: 520, xpReward: 260, stationId: 'astral_alembic', description: 'Grants temporary all-knowing awareness of surroundings', emoji: '🔮', requiredLevel: 42, effect: 'All-knowing for 5 minutes' },
  { id: 'world_tree_brew', name: 'World Tree Sap Brew', rarity: 'mythic', ingredients: [{ ingredientId: 'spirit_bark', amount: 3 }, { ingredientId: 'enchanted_mushroom', amount: 2 }, { ingredientId: 'mermaid_tears', amount: 1 }, { ingredientId: 'eternity_sand', amount: 1 }], brewTime: 98, sellPrice: 490, xpReward: 245, stationId: 'herbal_incubator', description: 'Channels the power of the World Tree itself', emoji: '🌳', requiredLevel: 44, effect: 'Full heal + regeneration for 1 hour' },
  { id: 'creation_catalyst', name: 'Creation Catalyst', rarity: 'mythic', ingredients: [{ ingredientId: 'eternity_sand', amount: 1 }, { ingredientId: 'void_salt', amount: 1 }, { ingredientId: 'starfall_fragment', amount: 2 }, { ingredientId: 'chimera_horn', amount: 1 }], brewTime: 115, sellPrice: 580, xpReward: 290, stationId: 'void_condenser', description: 'Brings inanimate objects to temporary life', emoji: '✨', requiredLevel: 46, effect: 'Animate objects for 10 minutes' },
  { id: 'fate_weaver', name: 'Fate Weaver Elixir', rarity: 'mythic', ingredients: [{ ingredientId: 'eternity_sand', amount: 2 }, { ingredientId: 'unicorn_blood', amount: 1 }, { ingredientId: 'basilisk_eye', amount: 1 }, { ingredientId: 'kraken_ink', amount: 1 }], brewTime: 108, sellPrice: 540, xpReward: 270, stationId: 'shadow_distillery', description: 'See and briefly alter the threads of fate', emoji: '🧶', requiredLevel: 48, effect: 'Reroll one event outcome' },
  { id: 'panacea_supreme', name: 'Panacea Supreme', rarity: 'mythic', ingredients: [{ ingredientId: 'unicorn_blood', amount: 1 }, { ingredientId: 'mermaid_tears', amount: 1 }, { ingredientId: 'phoenix_ash', amount: 1 }, { ingredientId: 'eternity_sand', amount: 1 }, { ingredientId: 'void_salt', amount: 1 }], brewTime: 120, sellPrice: 600, xpReward: 300, stationId: 'dragon_forge_crucible', description: 'The ultimate cure-all — cures everything, buffs everything', emoji: '🏆', requiredLevel: 50, effect: 'Full cure, all stats +10 for 1 hour' },
];

export const AW_TOOLS: ToolDef[] = [
  { id: 'enchanted_alembic', name: 'Enchanted Alembic', description: 'A self-stirring alembic that accelerates distillation', emoji: '⚗️', maxLevel: 10, bonusType: 'speed', baseBonusValue: 5, baseUpgradeCost: 50 },
  { id: 'starlight_lens', name: 'Starlight Lens', description: 'Magnifying lens that reveals impurities in any mixture', emoji: '🔭', maxLevel: 10, bonusType: 'quality', baseBonusValue: 4, baseUpgradeCost: 60 },
  { id: 'void_filter', name: 'Void Filter', description: 'Filters out unwanted essences, increasing yield', emoji: '🕳️', maxLevel: 10, bonusType: 'yield', baseBonusValue: 3, baseUpgradeCost: 70 },
  { id: 'philosopher_compass', name: 'Philosopher\'s Compass', description: 'Points toward the ideal brewing conditions', emoji: '🧭', maxLevel: 10, bonusType: 'luck', baseBonusValue: 5, baseUpgradeCost: 80 },
  { id: 'alchemist_scale', name: 'Alchemist\'s Scale', description: 'Perfectly measures ingredients to the atom', emoji: '⚖️', maxLevel: 10, bonusType: 'quality', baseBonusValue: 5, baseUpgradeCost: 90 },
  { id: 'elemental_stirrer', name: 'Elemental Stirrer', description: 'Stirs with elemental force for faster reactions', emoji: '🪄', maxLevel: 10, bonusType: 'speed', baseBonusValue: 4, baseUpgradeCost: 55 },
  { id: 'rune_spoon', name: 'Rune Etched Spoon', description: 'Ancient spoon inscribed with purity runes', emoji: '🥄', maxLevel: 10, bonusType: 'quality', baseBonusValue: 3, baseUpgradeCost: 45 },
  { id: 'time_sandglass', name: 'Time Sandglass', description: 'Speeds up reactions by locally accelerating time', emoji: '⏳', maxLevel: 10, bonusType: 'speed', baseBonusValue: 6, baseUpgradeCost: 100 },
];

export const AW_QUESTS: QuestDef[] = [
  { id: 'quest_first_brew', name: 'First Brew', description: 'Brew 3 potions to prove your alchemical potential', type: 'brew', target: 3, rewardCoins: 80, rewardXP: 40, requiredLevel: 1, emoji: '⚗️' },
  { id: 'quest_potion_novice', name: 'Potion Novice', description: 'Brew 10 potions of any kind', type: 'brew', target: 10, rewardCoins: 150, rewardXP: 75, requiredLevel: 1, emoji: '🧪' },
  { id: 'quest_scavenger', name: 'Ingredient Scavenger', description: 'Collect 15 ingredients from merchants', type: 'collect', target: 15, rewardCoins: 200, rewardXP: 100, requiredLevel: 2, emoji: '🧺' },
  { id: 'quest_profitable', name: 'Profitable Alchemy', description: 'Earn a total of 500 coins from selling potions', type: 'earn', target: 500, rewardCoins: 200, rewardXP: 100, requiredLevel: 3, emoji: '💰' },
  { id: 'quest_rare_discovery', name: 'Rare Discovery', description: 'Brew 3 rare-rarity or higher potions', type: 'brew', target: 3, rewardCoins: 300, rewardXP: 150, requiredLevel: 6, emoji: '💎' },
  { id: 'quest_upgrade_station', name: 'Station Upgrade', description: 'Upgrade any brewing station to level 5', type: 'experiment', target: 5, rewardCoins: 250, rewardXP: 125, requiredLevel: 6, emoji: '🔧' },
  { id: 'quest_experiment_master', name: 'Experiment Master', description: 'Brew 50 potions total', type: 'brew', target: 50, rewardCoins: 400, rewardXP: 200, requiredLevel: 10, emoji: '🔬' },
  { id: 'quest_wealthy_alchemist', name: 'Wealthy Alchemist', description: 'Earn a total of 2000 coins', type: 'earn', target: 2000, rewardCoins: 500, rewardXP: 250, requiredLevel: 12, emoji: '👑' },
  { id: 'quest_legendary_brew', name: 'Legendary Concoction', description: 'Brew 5 legendary or mythic potions', type: 'brew', target: 5, rewardCoins: 800, rewardXP: 400, requiredLevel: 22, emoji: '🌟' },
  { id: 'quest_grand_transmuter', name: 'Ultimate Transmuter', description: 'Brew 200 potions total', type: 'brew', target: 200, rewardCoins: 1500, rewardXP: 750, requiredLevel: 35, emoji: '🏰' },
];

export const AW_NPCS: NPCDef[] = [
  { id: 'npc_master_aldric', name: 'Master Aldric', role: 'Master Alchemist', description: 'A retired grand alchemist who mentors promising students', emoji: '🧙', greeting: 'Ah, young alchemist! The crucible awaits your brilliance.' },
  { id: 'npc_merchant_zara', name: 'Zara the Merchant', role: 'Reagent Trader', description: 'Travels between realms selling rare alchemical ingredients', emoji: '🧳', greeting: 'Welcome! I have reagents from places you\'ve never heard of.' },
  { id: 'npc_apprentice_thistle', name: 'Thistle', role: 'Your Apprentice', description: 'An eager young apprentice learning the alchemical arts', emoji: '🧒', greeting: 'Master! I\'ve prepared the reagents just like you showed me!' },
  { id: 'npc_inspector_vex', name: 'Inspector Vex', role: 'Guild Inspector', description: 'Ensures all alchemists follow the Guild\'s safety protocols', emoji: '📋', greeting: 'I trust your ventilation runes are up to code?' },
  { id: 'npc_rival_morven', name: 'Morven Darkbrew', role: 'Rival Alchemist', description: 'Your main competitor in the annual Alchemy Contest', emoji: '🧙‍♂️', greeting: 'Oh, it\'s you again. I hope your potions are better than last year.' },
  { id: 'npc_sage_orlin', name: 'Old Sage Orlin', role: 'Mystic Supplier', description: 'A mysterious sage who supplies the rarest ingredients', emoji: '🔮', greeting: 'The cosmos provides to those who understand its balance.' },
];

export const AW_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach_first_brew', name: 'First Spark', description: 'Complete your first brew', conditionKey: 'completedBrews', targetValue: 1, rewardCoins: 10, rewardXP: 5, emoji: '✨' },
  { id: 'ach_brew_10', name: 'Getting Warmed Up', description: 'Complete 10 brews', conditionKey: 'completedBrews', targetValue: 10, rewardCoins: 50, rewardXP: 25, emoji: '🔥' },
  { id: 'ach_brew_50', name: 'Potion Machine', description: 'Complete 50 brews', conditionKey: 'completedBrews', targetValue: 50, rewardCoins: 200, rewardXP: 100, emoji: '⚙️' },
  { id: 'ach_brew_100', name: 'Centurion Alchemist', description: 'Complete 100 brews', conditionKey: 'completedBrews', targetValue: 100, rewardCoins: 500, rewardXP: 250, emoji: '💯' },
  { id: 'ach_sell_5', name: 'First Sales', description: 'Sell 5 potions', conditionKey: 'soldPotions', targetValue: 5, rewardCoins: 30, rewardXP: 15, emoji: '💰' },
  { id: 'ach_sell_50', name: 'Potion Magnate', description: 'Sell 50 potions', conditionKey: 'soldPotions', targetValue: 50, rewardCoins: 300, rewardXP: 150, emoji: '🎉' },
  { id: 'ach_earn_1000', name: 'Thousand Club', description: 'Earn 1000 coins total', conditionKey: 'totalEarned', targetValue: 1000, rewardCoins: 100, rewardXP: 50, emoji: '💰' },
  { id: 'ach_earn_10000', name: 'Tycoon', description: 'Earn 10000 coins total', conditionKey: 'totalEarned', targetValue: 10000, rewardCoins: 1000, rewardXP: 500, emoji: '🤑' },
  { id: 'ach_level_10', name: 'Double Digits', description: 'Reach level 10', conditionKey: 'level', targetValue: 10, rewardCoins: 150, rewardXP: 75, emoji: '🔟' },
  { id: 'ach_level_25', name: 'Quarter Century', description: 'Reach level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 400, rewardXP: 200, emoji: '🌟' },
  { id: 'ach_level_50', name: 'Maximum Power', description: 'Reach the maximum level', conditionKey: 'level', targetValue: 50, rewardCoins: 2000, rewardXP: 1000, emoji: '👑' },
  { id: 'ach_streak_7', name: 'Week Warrior', description: 'Maintain a 7-day daily streak', conditionKey: 'dailyStreak', targetValue: 7, rewardCoins: 200, rewardXP: 100, emoji: '📅' },
  { id: 'ach_streak_30', name: 'Monthly Devotee', description: 'Maintain a 30-day daily streak', conditionKey: 'dailyStreak', targetValue: 30, rewardCoins: 1000, rewardXP: 500, emoji: '🗓️' },
  { id: 'ach_experiment_10', name: 'Experimentation Expert', description: 'Complete 10 potion experiments', conditionKey: 'totalExperiments', targetValue: 10, rewardCoins: 300, rewardXP: 150, emoji: '🔬' },
  { id: 'ach_reputation_max', name: 'Reputation Master', description: 'Reach maximum reputation rank', conditionKey: 'reputation', targetValue: 1000, rewardCoins: 500, rewardXP: 250, emoji: '🏅' },
];

export const AW_DAILY_TASK_POOL: DailyTaskPoolDef[] = [
  { id: 'daily_brew_3', name: 'Daily Brew', description: 'Brew 3 potions today', type: 'brew', target: 3, rewardCoins: 30, rewardXP: 15, emoji: '⚗️' },
  { id: 'daily_brew_5', name: 'Brew Frenzy', description: 'Brew 5 potions today', type: 'brew', target: 5, rewardCoins: 50, rewardXP: 25, emoji: '🔥' },
  { id: 'daily_brew_10', name: 'Brew Marathon', description: 'Brew 10 potions today', type: 'brew', target: 10, rewardCoins: 100, rewardXP: 50, emoji: '⚡' },
  { id: 'daily_sell_2', name: 'Daily Sales', description: 'Sell 2 potions today', type: 'sell', target: 2, rewardCoins: 25, rewardXP: 12, emoji: '🧪' },
  { id: 'daily_sell_5', name: 'Busy Day', description: 'Sell 5 potions today', type: 'sell', target: 5, rewardCoins: 60, rewardXP: 30, emoji: '🎉' },
  { id: 'daily_earn_200', name: 'Daily Income', description: 'Earn 200 coins today', type: 'earn', target: 200, rewardCoins: 40, rewardXP: 20, emoji: '💰' },
  { id: 'daily_earn_500', name: 'Big Earn', description: 'Earn 500 coins today', type: 'earn', target: 500, rewardCoins: 80, rewardXP: 40, emoji: '💎' },
  { id: 'daily_transmute_3', name: 'Transmutation Practice', description: 'Transmute 3 ingredients today', type: 'transmute', target: 3, rewardCoins: 20, rewardXP: 10, emoji: '🔄' },
];

export const AW_TRANSMUTATION_RECIPES: TransmutationRecipe[] = [
  { fromIngredientId: 'crystalized_dew', toIngredientId: 'spirit_bark', fromAmount: 3, toAmount: 2, cost: 10, requiredLevel: 3 },
  { fromIngredientId: 'fire_lily', toIngredientId: 'sunstone_core', fromAmount: 3, toAmount: 1, cost: 15, requiredLevel: 5 },
  { fromIngredientId: 'mandrake_root', toIngredientId: 'enchanted_mushroom', fromAmount: 2, toAmount: 2, cost: 10, requiredLevel: 3 },
  { fromIngredientId: 'gargoyle_stone', toIngredientId: 'frost_shard', fromAmount: 2, toAmount: 1, cost: 20, requiredLevel: 7 },
  { fromIngredientId: 'thunder_lotus', toIngredientId: 'dragon_scale', fromAmount: 3, toAmount: 1, cost: 30, requiredLevel: 10 },
  { fromIngredientId: 'fairy_wing_powder', toIngredientId: 'moonstone_dust', fromAmount: 2, toAmount: 2, cost: 15, requiredLevel: 5 },
  { fromIngredientId: 'wyrm_fang', toIngredientId: 'phoenix_ash', fromAmount: 2, toAmount: 2, cost: 25, requiredLevel: 8 },
  { fromIngredientId: 'frost_shard', toIngredientId: 'shadow_essence', fromAmount: 3, toAmount: 1, cost: 35, requiredLevel: 12 },
  { fromIngredientId: 'basilisk_eye', toIngredientId: 'kraken_ink', fromAmount: 2, toAmount: 2, cost: 40, requiredLevel: 15 },
  { fromIngredientId: 'abyssal_pearl', toIngredientId: 'starfall_fragment', fromAmount: 3, toAmount: 1, cost: 60, requiredLevel: 20 },
  { fromIngredientId: 'chimera_horn', toIngredientId: 'mermaid_tears', fromAmount: 2, toAmount: 1, cost: 50, requiredLevel: 22 },
  { fromIngredientId: 'spirit_venom', toIngredientId: 'void_salt', fromAmount: 5, toAmount: 1, cost: 80, requiredLevel: 28 },
];

// ============================================================
// Initial State Factory
// ============================================================

function createInitialState(seed?: number): AlchemistWorkshopState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  return {
    level: 1,
    xp: 0,
    coins: 100,
    unlockedPotions: ['healing_salve', 'speed_elixir', 'nightvision_draught', 'warmth_tonic'],
    activeStation: 'mortar_pestle',
    ingredients: { crystalized_dew: 10, mandrake_root: 8, fire_lily: 6, spirit_bark: 5, enchanted_mushroom: 5 },
    reputation: 0,
    reputationTitle: 'Unknown',
    completedBrews: 0,
    soldPotions: 0,
    totalEarned: 0,
    totalSpent: 0,
    brewingQueue: [],
    dailyStreak: 0,
    lastDaily: null,
    activeQuests: [],
    completedQuests: [],
    unlockedAchievements: AW_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, unlockedAt: null })),
    alchemyContestEntries: 0,
    alchemyContestWins: 0,
    alchemyContestLastRank: null,
    dailyTask: null,
    stations: AW_STATIONS.map((s) => ({ id: s.id, level: 1 })),
    tools: AW_TOOLS.map((t) => ({ id: t.id, level: 1, equipped: t.id === 'enchanted_alembic' })),
    seed: effectiveSeed,
    brewCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    ingredientCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    stationUpgradeCount: 0,
    toolUpgradeCount: 0,
    totalExperiments: 0,
    totalTransmutations: 0,
  };
}

// ============================================================
// Hook: useAlchemistWorkshop
// ============================================================

export function useAlchemistWorkshop(initialSeed?: number) {
  const [state, setState] = useState<AlchemistWorkshopState>(() => createInitialState(initialSeed));
  const prngRef = useRef<() => number>(mulberry32(state.seed));

  // ---- Core State ----

  const awGetState = useCallback((): Readonly<AlchemistWorkshopState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const awResetState = useCallback((newSeed?: number) => {
    const s = createInitialState(newSeed);
    prngRef.current = mulberry32(s.seed);
    setState(s);
  }, []);

  const awSeed = useCallback((seed: number) => {
    prngRef.current = mulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const awRandom = useCallback((): number => {
    return prngRef.current();
  }, []);

  const awRandomInt = useCallback((min: number, max: number): number => {
    const rng = prngRef.current();
    return min + Math.floor(rng * (max - min + 1));
  }, []);

  const awRandomChoice = useCallback(<T>(arr: readonly T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(prngRef.current() * arr.length)];
  }, []);

  // ---- Level / XP ----

  const awGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const awGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const awGetXPTillNext = useCallback((): number => {
    return xpRequiredForLevel(state.level);
  }, [state.level]);

  const awGetXPTotal = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const awAddXP = useCallback((amount: number): AlchemistWorkshopState => {
    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += Math.floor(amount);
      while (level < AW_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= AW_MAX_LEVEL) xp = 0;
      next = { ...prev, level: clampLevel(level), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Title ----

  const awGetTitle = useCallback((): TitleInfo => {
    let current = AW_TITLE_THRESHOLDS[0];
    for (const t of AW_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const awGetAllTitles = useCallback((): TitleInfo[] => {
    return [...AW_TITLE_THRESHOLDS];
  }, []);

  const awGetNextTitle = useCallback((): TitleInfo | null => {
    for (const t of AW_TITLE_THRESHOLDS) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const awGetProgress = useCallback((): number => {
    const needed = xpRequiredForLevel(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const awGetOverallProgress = useCallback((): number => {
    return state.level / AW_MAX_LEVEL;
  }, [state.level]);

  // ---- Coins ----

  const awGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const awAddCoins = useCallback((amount: number): AlchemistWorkshopState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: clampCoins(prev.coins + amount), totalEarned: prev.totalEarned + Math.max(0, amount) };
      return next;
    });
    return next;
  }, [state]);

  const awSpendCoins = useCallback((amount: number): { success: boolean; state: AlchemistWorkshopState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: clampCoins(prev.coins - amount), totalSpent: prev.totalSpent + amount };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const awCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Potions ----

  const awGetPotions = useCallback((): PotionDef[] => {
    return [...AW_POTIONS];
  }, []);

  const awGetUnlockedPotions = useCallback((): PotionDef[] => {
    return AW_POTIONS.filter((p) => state.unlockedPotions.includes(p.id));
  }, [state.unlockedPotions]);

  const awGetLockedPotions = useCallback((): PotionDef[] => {
    return AW_POTIONS.filter((p) => !state.unlockedPotions.includes(p.id));
  }, [state.unlockedPotions]);

  const awGetPotionById = useCallback((id: string): PotionDef | null => {
    return AW_POTIONS.find((p) => p.id === id) ?? null;
  }, []);

  const awIsPotionUnlocked = useCallback((potionId: string): boolean => {
    return state.unlockedPotions.includes(potionId);
  }, [state.unlockedPotions]);

  const awUnlockPotion = useCallback((potionId: string): { success: boolean; state: AlchemistWorkshopState } => {
    const potion = AW_POTIONS.find((p) => p.id === potionId);
    if (!potion) return { success: false, state };
    if (state.unlockedPotions.includes(potionId)) return { success: false, state };
    if (state.level < potion.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      if (prev.unlockedPotions.includes(potionId)) return prev;
      next = { ...prev, unlockedPotions: [...prev.unlockedPotions, potionId] };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Stations ----

  const awGetStations = useCallback((): StationDef[] => {
    return [...AW_STATIONS];
  }, []);

  const awGetStationLevels = useCallback((): StationState[] => {
    return [...state.stations];
  }, [state.stations]);

  const awGetActiveStation = useCallback((): StationDef | null => {
    return AW_STATIONS.find((s) => s.id === state.activeStation) ?? null;
  }, [state.activeStation]);

  const awSetActiveStation = useCallback((stationId: string): { success: boolean; state: AlchemistWorkshopState } => {
    const exists = AW_STATIONS.find((s) => s.id === stationId);
    if (!exists) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, activeStation: stationId };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const awGetStationLevel = useCallback((stationId: string): number => {
    const s = state.stations.find((st) => st.id === stationId);
    return s?.level ?? 1;
  }, [state.stations]);

  const awGetStationSpeedMultiplier = useCallback((stationId: string): number => {
    const def = AW_STATIONS.find((s) => s.id === stationId);
    const st = state.stations.find((s) => s.id === stationId);
    if (!def || !st) return 1;
    return def.baseSpeedMultiplier * (1 + (st.level - 1) * 0.1);
  }, [state.stations]);

  const awGetStationQualityBonus = useCallback((stationId: string): number => {
    const def = AW_STATIONS.find((s) => s.id === stationId);
    const st = state.stations.find((s) => s.id === stationId);
    if (!def || !st) return 0;
    return def.baseQualityBonus + (st.level - 1) * 2;
  }, [state.stations]);

  const awUpgradeStation = useCallback((stationId: string): { success: boolean; cost: number; state: AlchemistWorkshopState } => {
    const def = AW_STATIONS.find((s) => s.id === stationId);
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

  const awGetIngredients = useCallback((): IngredientDef[] => {
    return [...AW_INGREDIENTS];
  }, []);

  const awGetIngredientById = useCallback((id: string): IngredientDef | null => {
    return AW_INGREDIENTS.find((i) => i.id === id) ?? null;
  }, []);

  const awGetInventory = useCallback((): Record<string, number> => {
    return { ...state.ingredients };
  }, [state.ingredients]);

  const awGetIngredientCount = useCallback((ingredientId: string): number => {
    return state.ingredients[ingredientId] ?? 0;
  }, [state.ingredients]);

  const awGetIngredientCost = useCallback((ingredientId: string): number => {
    const def = AW_INGREDIENTS.find((i) => i.id === ingredientId);
    return def?.cost ?? 0;
  }, []);

  const awBuyIngredient = useCallback((ingredientId: string, amount: number = 1): { success: boolean; cost: number; state: AlchemistWorkshopState } => {
    const def = AW_INGREDIENTS.find((i) => i.id === ingredientId);
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
      // Update daily task if it's collect type
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = AW_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'transmute') {
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

  const awUseIngredient = useCallback((ingredientId: string, amount: number = 1): boolean => {
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

  const awHasIngredients = useCallback((potionId: string): boolean => {
    const potion = AW_POTIONS.find((p) => p.id === potionId);
    if (!potion) return false;
    return potion.ingredients.every((ing) => (state.ingredients[ing.ingredientId] ?? 0) >= ing.amount);
  }, [state.ingredients]);

  const awGetMissingIngredients = useCallback((potionId: string): { ingredientId: string; name: string; have: number; need: number }[] => {
    const potion = AW_POTIONS.find((p) => p.id === potionId);
    if (!potion) return [];
    return potion.ingredients
      .map((ing) => {
        const def = AW_INGREDIENTS.find((i) => i.id === ing.ingredientId);
        const have = state.ingredients[ing.ingredientId] ?? 0;
        return { ingredientId: ing.ingredientId, name: def?.name ?? ing.ingredientId, have, need: ing.amount };
      })
      .filter((m) => m.have < m.need);
  }, [state.ingredients]);

  // ---- Brewing ----

  const awBrew = useCallback((potionId: string, now: number = Date.now()): { success: boolean; brewJob: BrewJob | null; state: AlchemistWorkshopState } => {
    const potion = AW_POTIONS.find((p) => p.id === potionId);
    if (!potion) return { success: false, brewJob: null, state };
    if (!state.unlockedPotions.includes(potionId)) return { success: false, brewJob: null, state };

    // Check ingredients
    const hasAll = potion.ingredients.every((ing) => (state.ingredients[ing.ingredientId] ?? 0) >= ing.amount);
    if (!hasAll) return { success: false, brewJob: null, state };

    // Check station
    if (state.activeStation !== potion.stationId) return { success: false, brewJob: null, state };

    // Check not already brewing (max 3 slots)
    if (state.brewingQueue.length >= 3) return { success: false, brewJob: null, state };

    // Calculate speed from station and tools
    const speedMult = awGetStationSpeedMultiplier(potion.stationId);
    const equippedTools = state.tools.filter((t) => t.equipped);
    let toolSpeedBonus = 0;
    for (const ts of equippedTools) {
      const def = AW_TOOLS.find((td) => td.id === ts.id);
      if (def && def.bonusType === 'speed') {
        toolSpeedBonus += def.baseBonusValue * (0.5 + ts.level * 0.15);
      }
    }
    const effectiveSpeed = speedMult + toolSpeedBonus * 0.01;

    const adjustedTime = Math.max(5, Math.floor(potion.brewTime / effectiveSpeed));
    const qualityBase = awGetStationQualityBonus(potion.stationId);
    let toolQualityBonus = 0;
    for (const ts of equippedTools) {
      const def = AW_TOOLS.find((td) => td.id === ts.id);
      if (def && def.bonusType === 'quality') {
        toolQualityBonus += def.baseBonusValue * (0.5 + ts.level * 0.15);
      }
    }
    const quality = Math.min(100, 50 + qualityBase + toolQualityBonus + Math.floor(prngRef.current() * 10));

    const brewJob: BrewJob = {
      id: `brew_${potionId}_${now}`,
      potionId,
      startedAt: now,
      endsAt: now + adjustedTime * 1000,
      quality,
      stationId: potion.stationId,
    };

    let next = state;
    setState((prev) => {
      const newIngredients = { ...prev.ingredients };
      for (const ing of potion.ingredients) {
        const have = newIngredients[ing.ingredientId] ?? 0;
        newIngredients[ing.ingredientId] = have - ing.amount;
        if (newIngredients[ing.ingredientId] <= 0) delete newIngredients[ing.ingredientId];
      }

      // Yield bonus from tools
      let extraYield = 0;
      for (const ts of prev.tools.filter((t) => t.equipped)) {
        const def = AW_TOOLS.find((td) => td.id === ts.id);
        if (def && def.bonusType === 'yield') {
          extraYield += def.baseBonusValue * (0.5 + ts.level * 0.15);
        }
      }
      const bonusYield = prngRef.current() * 100 < extraYield ? 1 : 0;

      next = {
        ...prev,
        ingredients: newIngredients,
        brewingQueue: [...prev.brewingQueue, brewJob],
      };

      // Quest progress
      next = awProcessQuestProgress(next, 'brew', 1 + bonusYield);

      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = AW_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'brew') {
          next = {
            ...next,
            dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + (1 + bonusYield) },
          };
        }
      }

      return next;
    });

    return { success: true, brewJob, state: next };
  }, [state, awGetStationSpeedMultiplier, awGetStationQualityBonus]);

  const awGetBrewingQueue = useCallback((): BrewJob[] => {
    return [...state.brewingQueue];
  }, [state.brewingQueue]);

  const awCancelBrew = useCallback((brewJobId: string): { success: boolean; state: AlchemistWorkshopState } => {
    const idx = state.brewingQueue.findIndex((b) => b.id === brewJobId);
    if (idx === -1) return { success: false, state };
    let next = state;
    setState((prev) => {
      const potion = AW_POTIONS.find((p) => p.id === prev.brewingQueue[idx].potionId);
      let newIngredients = { ...prev.ingredients };
      if (potion) {
        for (const ing of potion.ingredients) {
          newIngredients[ing.ingredientId] = (newIngredients[ing.ingredientId] ?? 0) + ing.amount;
        }
      }
      const newQueue = [...prev.brewingQueue];
      newQueue.splice(idx, 1);
      next = { ...prev, ingredients: newIngredients, brewingQueue: newQueue };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const awCollectBrew = useCallback((brewJobId: string, now: number = Date.now()): { success: boolean; potion: PotionDef | null; quality: number; coinsEarned: number; xpEarned: number; state: AlchemistWorkshopState } => {
    const job = state.brewingQueue.find((b) => b.id === brewJobId);
    if (!job) return { success: false, potion: null, quality: 0, coinsEarned: 0, xpEarned: 0, state };
    if (now < job.endsAt) return { success: false, potion: null, quality: 0, coinsEarned: 0, xpEarned: 0, state };

    const potion = AW_POTIONS.find((p) => p.id === job.potionId);
    if (!potion) return { success: false, potion: null, quality: 0, coinsEarned: 0, xpEarned: 0, state };

    const qualityMult = job.quality / 100;
    const rarityMult = rarityMultiplier(potion.rarity);
    const coinsEarned = Math.floor(potion.sellPrice * qualityMult * (0.8 + rarityMult * 0.2));
    const xpEarned = Math.floor(potion.xpReward * qualityMult * rarityMult);

    let next = state;
    setState((prev) => {
      const newQueue = prev.brewingQueue.filter((b) => b.id !== brewJobId);
      const newBrewCountByRarity = { ...prev.brewCountByRarity, [potion.rarity]: prev.brewCountByRarity[potion.rarity] + 1 };

      next = {
        ...prev,
        brewingQueue: newQueue,
        coins: clampCoins(prev.coins + coinsEarned),
        totalEarned: prev.totalEarned + coinsEarned,
        completedBrews: prev.completedBrews + 1,
        soldPotions: prev.soldPotions + 1,
        brewCountByRarity: newBrewCountByRarity,
        reputation: Math.min(1000, prev.reputation + Math.floor(rarityMult)),
      };

      // Add XP and handle level up
      let { level, xp } = next;
      xp += xpEarned;
      while (level < AW_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= AW_MAX_LEVEL) xp = 0;
      next = { ...next, level: clampLevel(level), xp };

      // Update reputation title
      const repTitleIdx = Math.min(AW_REPUTATION_TITLES.length - 1, Math.floor(next.reputation / 200));
      next = { ...next, reputationTitle: AW_REPUTATION_TITLES[repTitleIdx] };

      // Quest progress for earn and sell
      next = awProcessQuestProgress(next, 'earn', coinsEarned);
      next = awProcessQuestProgress(next, 'sell', 1);

      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = AW_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'sell') {
          next = {
            ...next,
            dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 },
          };
        }
        if (poolDef && poolDef.type === 'earn') {
          next = {
            ...next,
            dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + coinsEarned },
          };
        }
      }

      return next;
    });

    return { success: true, potion, quality: job.quality, coinsEarned, xpEarned, state: next };
  }, [state]);

  const awGetBrewTimeRemaining = useCallback((brewJobId: string, now: number = Date.now()): number => {
    const job = state.brewingQueue.find((b) => b.id === brewJobId);
    if (!job) return 0;
    return Math.max(0, job.endsAt - now);
  }, [state.brewingQueue]);

  const awGetPotionProfit = useCallback((potionId: string): number => {
    const potion = AW_POTIONS.find((p) => p.id === potionId);
    if (!potion) return 0;
    let ingredientCost = 0;
    for (const ing of potion.ingredients) {
      const def = AW_INGREDIENTS.find((i) => i.id === ing.ingredientId);
      if (def) ingredientCost += def.cost * ing.amount;
    }
    return potion.sellPrice - ingredientCost;
  }, []);

  // ---- Transmutation ----

  const awGetTransmutationRecipes = useCallback((): TransmutationRecipe[] => {
    return [...AW_TRANSMUTATION_RECIPES];
  }, []);

  const awGetAvailableTransmutations = useCallback((): TransmutationRecipe[] => {
    return AW_TRANSMUTATION_RECIPES.filter((t) => {
      if (state.level < t.requiredLevel) return false;
      if ((state.ingredients[t.fromIngredientId] ?? 0) < t.fromAmount) return false;
      if (state.coins < t.cost) return false;
      return true;
    });
  }, [state.level, state.ingredients, state.coins]);

  const awTransmute = useCallback((recipeIndex: number): { success: boolean; transmutation: TransmutationRecipe | null; state: AlchemistWorkshopState } => {
    const recipe = AW_TRANSMUTATION_RECIPES[recipeIndex];
    if (!recipe) return { success: false, transmutation: null, state };
    if (state.level < recipe.requiredLevel) return { success: false, transmutation: null, state };
    if ((state.ingredients[recipe.fromIngredientId] ?? 0) < recipe.fromAmount) return { success: false, transmutation: null, state };
    if (state.coins < recipe.cost) return { success: false, transmutation: null, state };

    let next = state;
    setState((prev) => {
      const newIngredients = { ...prev.ingredients };
      newIngredients[recipe.fromIngredientId] = (newIngredients[recipe.fromIngredientId] ?? 0) - recipe.fromAmount;
      if (newIngredients[recipe.fromIngredientId] <= 0) delete newIngredients[recipe.fromIngredientId];
      newIngredients[recipe.toIngredientId] = (newIngredients[recipe.toIngredientId] ?? 0) + recipe.toAmount;

      // Luck bonus: small chance of extra output
      let bonusAmount = 0;
      const luckTools = prev.tools.filter((t) => t.equipped);
      let luckBonus = 0;
      for (const ts of luckTools) {
        const def = AW_TOOLS.find((td) => td.id === ts.id);
        if (def && def.bonusType === 'luck') {
          luckBonus += def.baseBonusValue * (0.5 + ts.level * 0.15);
        }
      }
      if (prngRef.current() * 100 < luckBonus) bonusAmount = 1;
      if (bonusAmount > 0) {
        newIngredients[recipe.toIngredientId] = (newIngredients[recipe.toIngredientId] ?? 0) + bonusAmount;
      }

      const repGain = 2 + bonusAmount;
      next = {
        ...prev,
        ingredients: newIngredients,
        coins: clampCoins(prev.coins - recipe.cost),
        totalSpent: prev.totalSpent + recipe.cost,
        totalTransmutations: prev.totalTransmutations + 1,
        reputation: Math.min(1000, prev.reputation + repGain),
      };

      const repTitleIdx = Math.min(AW_REPUTATION_TITLES.length - 1, Math.floor(next.reputation / 200));
      next = { ...next, reputationTitle: AW_REPUTATION_TITLES[repTitleIdx] };

      // Quest progress for experiment
      next = awProcessQuestProgress(next, 'experiment', 1);

      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = AW_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'transmute') {
          next = {
            ...next,
            dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 },
          };
        }
      }

      return next;
    });

    return { success: true, transmutation: recipe, state: next };
  }, [state]);

  // ---- Experimentation ----

  const awExperiment = useCallback((ingredientIds: string[], now: number = Date.now()): ExperimentResult => {
    // Check if we have at least 2 ingredients to experiment with
    if (ingredientIds.length < 2) {
      return { potionId: null, potionName: 'Failed Experiment', rarity: 'common', quality: 0, coinsEarned: 0, xpEarned: 0, wasNew: false };
    }

    // Check we have all ingredients
    for (const id of ingredientIds) {
      if ((state.ingredients[id] ?? 0) < 1) {
        return { potionId: null, potionName: 'Missing Ingredients', rarity: 'common', quality: 0, coinsEarned: 0, xpEarned: 0, wasNew: false };
      }
    }

    // Use PRNG to determine experiment outcome
    const expSeed = awHashString(`experiment_${now}_${state.seed}`);
    const rng = mulberry32(expSeed);

    // Determine rarity of result based on ingredient rarities
    const ingredientRarities = ingredientIds.map((id) => {
      const def = AW_INGREDIENTS.find((i) => i.id === id);
      return def?.rarity ?? 'common';
    });
    const rarityOrder: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
    const maxRarityIdx = Math.max(...ingredientRarities.map((r) => rarityOrder.indexOf(r)));

    // Roll for result rarity (weighted toward lower rarities)
    let resultRarityIdx = 0;
    const roll = rng() * 100;
    if (maxRarityIdx >= 5 && roll < 2) resultRarityIdx = 5;
    else if (maxRarityIdx >= 4 && roll < 8) resultRarityIdx = 4;
    else if (maxRarityIdx >= 3 && roll < 20) resultRarityIdx = 3;
    else if (maxRarityIdx >= 2 && roll < 45) resultRarityIdx = 2;
    else if (maxRarityIdx >= 1 && roll < 75) resultRarityIdx = 1;
    else resultRarityIdx = 0;

    const resultRarity = rarityOrder[resultRarityIdx];

    // Find a potion of that rarity (or discover a new one)
    const candidates = AW_POTIONS.filter((p) => p.rarity === resultRarity);
    const discovered = candidates[Math.floor(rng() * candidates.length)];

    // Quality based on luck tools
    let luckBonus = 0;
    for (const ts of state.tools.filter((t) => t.equipped)) {
      const def = AW_TOOLS.find((td) => td.id === ts.id);
      if (def && def.bonusType === 'luck') {
        luckBonus += def.baseBonusValue * (0.5 + ts.level * 0.15);
      }
    }
    const quality = Math.min(100, 30 + Math.floor(rng() * 40) + Math.floor(luckBonus));

    let coinsEarned = Math.floor(quality * rarityMultiplier(resultRarity) * 0.5);
    let xpEarned = Math.floor(quality * rarityMultiplier(resultRarity) * 0.3);
    let wasNew = false;

    let next = state;
    setState((prev) => {
      // Consume ingredients
      const newIngredients = { ...prev.ingredients };
      for (const id of ingredientIds) {
        newIngredients[id] = (newIngredients[id] ?? 0) - 1;
        if (newIngredients[id] <= 0) delete newIngredients[id];
      }

      // Check if this is a new potion discovery
      const isNew = discovered && !prev.unlockedPotions.includes(discovered.id);
      wasNew = isNew;

      // Add the potion to unlocked if new
      const newUnlocked = isNew ? [...prev.unlockedPotions, discovered.id] : prev.unlockedPotions;

      // Extra rewards for new discoveries
      const bonusCoins = isNew ? Math.floor(discovered.sellPrice * 0.5) : 0;
      const bonusXP = isNew ? Math.floor(discovered.xpReward * 0.5) : 0;

      next = {
        ...prev,
        ingredients: newIngredients,
        unlockedPotions: newUnlocked,
        coins: clampCoins(prev.coins + coinsEarned + bonusCoins),
        totalEarned: prev.totalEarned + coinsEarned + bonusCoins,
        totalExperiments: prev.totalExperiments + 1,
        reputation: Math.min(1000, prev.reputation + (isNew ? 15 : 3)),
      };

      const repTitleIdx = Math.min(AW_REPUTATION_TITLES.length - 1, Math.floor(next.reputation / 200));
      next = { ...next, reputationTitle: AW_REPUTATION_TITLES[repTitleIdx] };

      // XP
      let { level, xp } = next;
      xp += xpEarned + bonusXP;
      while (level < AW_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= AW_MAX_LEVEL) xp = 0;
      next = { ...next, level: clampLevel(level), xp };

      coinsEarned += bonusCoins;
      xpEarned += bonusXP;

      return next;
    });

    return {
      potionId: discovered?.id ?? null,
      potionName: discovered?.name ?? 'Unknown Concoction',
      rarity: resultRarity,
      quality,
      coinsEarned,
      xpEarned,
      wasNew,
    };
  }, [state]);

  // ---- Reputation ----

  const awGetReputation = useCallback((): number => {
    return state.reputation;
  }, [state.reputation]);

  const awGetReputationTitle = useCallback((): string => {
    return state.reputationTitle;
  }, [state.reputationTitle]);

  const awGetReputationRank = useCallback((): number => {
    return Math.min(AW_REPUTATION_TITLES.length - 1, Math.floor(state.reputation / 200));
  }, [state.reputation]);

  const awGetNextReputationTitle = useCallback((): string | null => {
    const currentIdx = Math.min(AW_REPUTATION_TITLES.length - 1, Math.floor(state.reputation / 200));
    if (currentIdx >= AW_REPUTATION_TITLES.length - 1) return null;
    return AW_REPUTATION_TITLES[currentIdx + 1];
  }, [state.reputation]);

  const awGetReputationProgress = useCallback((): number => {
    const currentThreshold = Math.floor(state.reputation / 200) * 200;
    return (state.reputation - currentThreshold) / 200;
  }, [state.reputation]);

  const awAddReputation = useCallback((amount: number): AlchemistWorkshopState => {
    let next = state;
    setState((prev) => {
      const newRep = Math.min(1000, prev.reputation + amount);
      const repTitleIdx = Math.min(AW_REPUTATION_TITLES.length - 1, Math.floor(newRep / 200));
      next = { ...prev, reputation: newRep, reputationTitle: AW_REPUTATION_TITLES[repTitleIdx] };
      return next;
    });
    return next;
  }, [state]);

  // ---- Tools ----

  const awGetTools = useCallback((): ToolDef[] => {
    return [...AW_TOOLS];
  }, []);

  const awGetToolStates = useCallback((): ToolState[] => {
    return [...state.tools];
  }, [state.tools]);

  const awGetEquippedTools = useCallback((): ToolState[] => {
    return state.tools.filter((t) => t.equipped);
  }, [state.tools]);

  const awGetToolLevel = useCallback((toolId: string): number => {
    const t = state.tools.find((ts) => ts.id === toolId);
    return t?.level ?? 1;
  }, [state.tools]);

  const awGetToolBonus = useCallback((toolId: string): number => {
    const ts = state.tools.find((t) => t.id === toolId);
    const def = AW_TOOLS.find((t) => t.id === toolId);
    if (!ts || !def) return 0;
    return def.baseBonusValue * (0.5 + ts.level * 0.15);
  }, [state.tools]);

  const awEquipTool = useCallback((toolId: string): { success: boolean; state: AlchemistWorkshopState } => {
    const def = AW_TOOLS.find((t) => t.id === toolId);
    if (!def) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newTools = prev.tools.map((t) => ({
        ...t,
        equipped: t.id === toolId ? true : (t.equipped && AW_TOOLS.find((d) => d.id === t.id)?.bonusType === def.bonusType ? false : t.equipped),
      }));
      next = { ...prev, tools: newTools };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const awUpgradeTool = useCallback((toolId: string): { success: boolean; cost: number; state: AlchemistWorkshopState } => {
    const def = AW_TOOLS.find((t) => t.id === toolId);
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
      // Quest progress for experiment (station/tool upgrade)
      const maxStationLevel = Math.max(...prev.stations.map((s) => s.level));
      const maxToolLevel = Math.max(...newTools.map((t) => t.level));
      next = awProcessQuestProgress(next, 'experiment', Math.max(maxStationLevel, maxToolLevel));
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Quests ----

  const awGetQuests = useCallback((): QuestDef[] => {
    return [...AW_QUESTS];
  }, []);

  const awGetActiveQuests = useCallback((): (QuestDef & QuestState)[] => {
    return state.activeQuests.map((aq) => {
      const def = AW_QUESTS.find((q) => q.id === aq.id);
      if (!def) return { ...aq, name: '', description: '', type: 'brew' as QuestType, target: 0, rewardCoins: 0, rewardXP: 0, requiredLevel: 0, emoji: '' };
      return { ...aq, ...def };
    });
  }, [state.activeQuests]);

  const awGetAvailableQuests = useCallback((): QuestDef[] => {
    const activeIds = new Set(state.activeQuests.map((q) => q.id));
    const completedIds = new Set(state.completedQuests);
    return AW_QUESTS.filter((q) => !activeIds.has(q.id) && !completedIds.has(q.id) && state.level >= q.requiredLevel);
  }, [state.activeQuests, state.completedQuests, state.level]);

  const awGetCompletedQuests = useCallback((): string[] => {
    return [...state.completedQuests];
  }, [state.completedQuests]);

  const awAcceptQuest = useCallback((questId: string): { success: boolean; state: AlchemistWorkshopState } => {
    const def = AW_QUESTS.find((q) => q.id === questId);
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

  const awGetQuestProgress = useCallback((questId: string): number => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    return aq?.progress ?? 0;
  }, [state.activeQuests]);

  const awCompleteQuest = useCallback((questId: string): { success: boolean; rewardCoins: number; rewardXP: number; state: AlchemistWorkshopState } => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    if (!aq || !aq.completed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const def = AW_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, rewardCoins: 0, rewardXP: 0, state };

    let next = state;
    setState((prev) => {
      const newActive = prev.activeQuests.filter((q) => q.id !== questId);
      let { level, xp } = prev;
      xp += def.rewardXP;
      while (level < AW_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= AW_MAX_LEVEL) xp = 0;

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

  const awAbandonQuest = useCallback((questId: string): { success: boolean; state: AlchemistWorkshopState } => {
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

  const awGetAchievements = useCallback((): AchievementDef[] => {
    return [...AW_ACHIEVEMENTS];
  }, []);

  const awGetUnlockedAchievements = useCallback((): AchievementState[] => {
    return state.unlockedAchievements.filter((a) => a.unlocked);
  }, [state.unlockedAchievements]);

  const awIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    const a = state.unlockedAchievements.find((ach) => ach.id === achievementId);
    return a?.unlocked ?? false;
  }, [state.unlockedAchievements]);

  const awCheckAchievements = useCallback((): AchievementState[] => {
    const now = Date.now();
    let next = state;
    const newlyUnlocked: AchievementState[] = [];

    setState((prev) => {
      let updated = prev;

      for (const ach of AW_ACHIEVEMENTS) {
        const currentState = updated.unlockedAchievements.find((a) => a.id === ach.id);
        if (!currentState || currentState.unlocked) continue;

        let value = 0;
        switch (ach.conditionKey) {
          case 'completedBrews': value = updated.completedBrews; break;
          case 'soldPotions': value = updated.soldPotions; break;
          case 'totalEarned': value = updated.totalEarned; break;
          case 'level': value = updated.level; break;
          case 'dailyStreak': value = updated.dailyStreak; break;
          case 'totalExperiments': value = updated.totalExperiments; break;
          case 'reputation': value = updated.reputation; break;
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
          while (level < AW_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
            xp -= xpRequiredForLevel(level);
            level += 1;
          }
          if (level >= AW_MAX_LEVEL) xp = 0;
          updated = { ...updated, level: clampLevel(level), xp };
        }
      }
      next = updated;
      return updated;
    });

    return newlyUnlocked;
  }, [state]);

  const awUnlockAchievement = useCallback((achievementId: string): { success: boolean; state: AlchemistWorkshopState } => {
    const ach = AW_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) return { success: false, state };
    const current = state.unlockedAchievements.find((a) => a.id === achievementId);
    if (current?.unlocked) return { success: false, state };

    let next = state;
    const now = Date.now();
    setState((prev) => {
      let { level, xp } = prev;
      xp += ach.rewardXP;
      while (level < AW_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= AW_MAX_LEVEL) xp = 0;

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

  const awGetDailyTask = useCallback((): DailyTaskState | null => {
    return state.dailyTask;
  }, [state.dailyTask]);

  const awRefreshDailyTask = useCallback((now: number = Date.now()): { dailyTask: DailyTaskPoolDef | null; state: AlchemistWorkshopState } => {
    const dayKey = generateDayKey(now);

    // Check if we need a new daily task
    if (state.dailyTask && state.dailyTask.dayKey === dayKey) {
      const pool = AW_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
      return { dailyTask: pool ?? null, state };
    }

    // Generate new daily task based on day seed
    const daySeed = awHashString(dayKey) & 0x7fffffff;
    const rng = mulberry32(daySeed);
    const taskIndex = Math.floor(rng() * AW_DAILY_TASK_POOL.length);
    const task = AW_DAILY_TASK_POOL[taskIndex];

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

  const awClaimDailyReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: AlchemistWorkshopState } => {
    if (!state.dailyTask || state.dailyTask.claimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const poolDef = AW_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask.poolId);
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
      while (level < AW_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= AW_MAX_LEVEL) xp = 0;

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

  const awGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  const awGetLastDaily = useCallback((): string | null => {
    return state.lastDaily;
  }, [state.lastDaily]);

  // ---- Alchemy Contest ----

  const awEnterContest = useCallback((potionId: string, now: number = Date.now()): { success: boolean; rank: number; prize: number; state: AlchemistWorkshopState } => {
    const potion = AW_POTIONS.find((p) => p.id === potionId);
    if (!potion || !state.unlockedPotions.includes(potionId)) {
      return { success: false, rank: 0, prize: 0, state };
    }

    // Simulate contest using PRNG
    const contestSeed = awHashString(`contest_${now}_${state.seed}`);
    const rng = mulberry32(contestSeed);
    const stationLevel = state.stations.find((s) => s.id === potion.stationId)?.level ?? 1;
    const toolQuality = state.tools.filter((t) => t.equipped).reduce((acc, ts) => {
      const def = AW_TOOLS.find((d) => d.id === ts.id);
      return acc + (def?.bonusType === 'quality' ? def.baseBonusValue * (0.5 + ts.level * 0.15) : 0);
    }, 0);

    const baseScore = 40 + stationLevel * 3 + toolQuality + rarityMultiplier(potion.rarity) * 10;
    const luckBonus = state.tools.filter((t) => t.equipped).reduce((acc, ts) => {
      const def = AW_TOOLS.find((d) => d.id === ts.id);
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
        alchemyContestEntries: prev.alchemyContestEntries + 1,
        alchemyContestWins: prev.alchemyContestWins + (isWin ? 1 : 0),
        alchemyContestLastRank: rank,
        coins: clampCoins(prev.coins + prize),
        totalEarned: prev.totalEarned + prize,
        reputation: Math.min(1000, prev.reputation + (isWin ? 25 : 5)),
      };

      const repTitleIdx = Math.min(AW_REPUTATION_TITLES.length - 1, Math.floor(next.reputation / 200));
      next = { ...next, reputationTitle: AW_REPUTATION_TITLES[repTitleIdx] };

      // XP for participation
      const participationXP = Math.floor(potion.xpReward * 0.5);
      let { level, xp } = next;
      xp += participationXP;
      while (level < AW_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= AW_MAX_LEVEL) xp = 0;
      next = { ...next, level: clampLevel(level), xp };
      return next;
    });

    return { success: true, rank, prize, state: next };
  }, [state]);

  const awGetContestRank = useCallback((): number | null => {
    return state.alchemyContestLastRank;
  }, [state.alchemyContestLastRank]);

  const awGetContestStats = useCallback((): { entries: number; wins: number; winRate: number; lastRank: number | null } => {
    return {
      entries: state.alchemyContestEntries,
      wins: state.alchemyContestWins,
      winRate: state.alchemyContestEntries > 0 ? state.alchemyContestWins / state.alchemyContestEntries : 0,
      lastRank: state.alchemyContestLastRank,
    };
  }, [state]);

  // ---- Stats ----

  const awGetStats = useCallback(() => {
    return {
      completedBrews: state.completedBrews,
      soldPotions: state.soldPotions,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      profit: state.totalEarned - state.totalSpent,
      reputation: state.reputation,
      reputationTitle: state.reputationTitle,
      dailyStreak: state.dailyStreak,
      contestEntries: state.alchemyContestEntries,
      contestWins: state.alchemyContestWins,
      unlockedPotionCount: state.unlockedPotions.length,
      totalPotionCount: AW_POTIONS.length,
      questsCompleted: state.completedQuests.length,
      achievementsUnlocked: state.unlockedAchievements.filter((a) => a.unlocked).length,
      stationUpgradeCount: state.stationUpgradeCount,
      toolUpgradeCount: state.toolUpgradeCount,
      totalExperiments: state.totalExperiments,
      totalTransmutations: state.totalTransmutations,
    };
  }, [state]);

  const awGetBrewCount = useCallback((): number => {
    return state.completedBrews;
  }, [state.completedBrews]);

  const awGetEarnedCoins = useCallback((): number => {
    return state.totalEarned;
  }, [state.totalEarned]);

  const awGetProfit = useCallback((): number => {
    return state.totalEarned - state.totalSpent;
  }, [state.totalEarned, state.totalSpent]);

  const awGetTotalSpent = useCallback((): number => {
    return state.totalSpent;
  }, [state.totalSpent]);

  // ---- NPC Interaction ----

  const awGetNPCs = useCallback((): NPCDef[] => {
    return [...AW_NPCS];
  }, []);

  const awGetNPCById = useCallback((id: string): NPCDef | null => {
    return AW_NPCS.find((n) => n.id === id) ?? null;
  }, []);

  const awGetRarityInfo = useCallback((rarity: Rarity): RarityInfo | null => {
    return AW_RARITIES.find((r) => r.key === rarity) ?? null;
  }, []);

  const awGetAllRarities = useCallback((): RarityInfo[] => {
    return [...AW_RARITIES];
  }, []);

  // ---- Utility / Misc ----

  const awGetPotionsByStation = useCallback((stationId: string): PotionDef[] => {
    return AW_POTIONS.filter((p) => p.stationId === stationId);
  }, []);

  const awGetPotionsByRarity = useCallback((rarity: Rarity): PotionDef[] => {
    return AW_POTIONS.filter((p) => p.rarity === rarity);
  }, []);

  const awGetIngredientsByRarity = useCallback((rarity: Rarity): IngredientDef[] => {
    return AW_INGREDIENTS.filter((i) => i.rarity === rarity);
  }, []);

  const awIsBrewing = useCallback((): boolean => {
    return state.brewingQueue.length > 0;
  }, [state.brewingQueue]);

  const awGetMaxBrewSlots = useCallback((): number => {
    return Math.min(3, 1 + Math.floor(state.level / 15));
  }, [state.level]);

  const awGetAvailableBrewSlots = useCallback((): number => {
    return awGetMaxBrewSlots() - state.brewingQueue.length;
  }, [state.brewingQueue, awGetMaxBrewSlots]);

  // ============================================================
  // Extended Utilities
  // ============================================================

  /** Buy multiple ingredients in one call, returns per-ingredient results. */
  const awBatchBuyIngredients = useCallback(
    (items: { ingredientId: string; amount: number }[]): { totalSpent: number; results: { ingredientId: string; success: boolean; cost: number }[]; state: AlchemistWorkshopState } => {
      // Pre-validate total cost
      let totalCost = 0;
      const validated: { ingredientId: string; amount: number; cost: number }[] = [];
      for (const item of items) {
        const def = AW_INGREDIENTS.find((i) => i.id === item.ingredientId);
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
          const def = AW_INGREDIENTS.find((i) => i.id === item.ingredientId);
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

  /** Find the best potion for a given station based on profit/minute. */
  const awGetBestPotionForStation = useCallback(
    (stationId: string): PotionDef | null => {
      const potions = AW_POTIONS.filter(
        (p) => p.stationId === stationId && state.unlockedPotions.includes(p.id) && state.level >= p.requiredLevel
      );
      if (potions.length === 0) return null;
      const speedMult = awGetStationSpeedMultiplier(stationId);
      return potions.reduce((best, potion) => {
        const adjustedTime = Math.max(5, potion.brewTime / speedMult);
        const profitPerMin = potion.sellPrice / (adjustedTime / 60);
        const bestTime = Math.max(5, best.brewTime / speedMult);
        const bestProfit = best.sellPrice / (bestTime / 60);
        return profitPerMin > bestProfit ? potion : best;
      });
    },
    [state.unlockedPotions, state.level, awGetStationSpeedMultiplier]
  );

  /** Find the most profitable potion among all unlocked potions. */
  const awGetMostProfitablePotion = useCallback((): PotionDef | null => {
    const unlocked = AW_POTIONS.filter((p) => state.unlockedPotions.includes(p.id) && state.level >= p.requiredLevel);
    if (unlocked.length === 0) return null;
    return unlocked.reduce((best, potion) => (potion.sellPrice > best.sellPrice ? potion : best));
  }, [state.unlockedPotions, state.level]);

  /** Get all potions the player can afford the ingredients for. */
  const awGetAffordablePotions = useCallback((): PotionDef[] => {
    return AW_POTIONS.filter((potion) => {
      if (!state.unlockedPotions.includes(potion.id)) return false;
      if (state.level < potion.requiredLevel) return false;
      let cost = 0;
      for (const ing of potion.ingredients) {
        const def = AW_INGREDIENTS.find((i) => i.id === ing.ingredientId);
        if (def) cost += def.cost * Math.max(0, ing.amount - (state.ingredients[ing.ingredientId] ?? 0));
      }
      return state.coins >= cost;
    });
  }, [state.unlockedPotions, state.level, state.coins, state.ingredients]);

  /** Get all potions the player has all ingredients for and station matches. */
  const awGetBrewablePotions = useCallback((): PotionDef[] => {
    return AW_POTIONS.filter((potion) => {
      if (!state.unlockedPotions.includes(potion.id)) return false;
      if (state.level < potion.requiredLevel) return false;
      if (state.activeStation !== potion.stationId) return false;
      return potion.ingredients.every((ing) => (state.ingredients[ing.ingredientId] ?? 0) >= ing.amount);
    });
  }, [state.unlockedPotions, state.level, state.activeStation, state.ingredients]);

  /** Get a comprehensive summary of the workshop state. */
  const awGetWorkshopSummary = useCallback((): {
    workshopName: string;
    level: number;
    title: TitleInfo;
    coins: number;
    xp: number;
    xpTillNext: number;
    progress: number;
    potionsUnlocked: number;
    potionsTotal: number;
    stationsOwned: number;
    toolsEquipped: number;
    potionsSold: number;
    reputation: number;
    reputationTitle: string;
    dailyStreak: number;
    totalBrews: number;
    contestWins: number;
    netWorth: number;
  } => {
    const title = (() => {
      let current = AW_TITLE_THRESHOLDS[0];
      for (const t of AW_TITLE_THRESHOLDS) {
        if (state.level >= t.levelRequired) current = t;
      }
      return current;
    })();
    const inventoryValue = Object.entries(state.ingredients).reduce((sum, [id, qty]) => {
      const def = AW_INGREDIENTS.find((i) => i.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
    return {
      workshopName: "Alchemist's Workshop",
      level: state.level,
      title,
      coins: state.coins,
      xp: state.xp,
      xpTillNext: xpRequiredForLevel(state.level),
      progress: xpRequiredForLevel(state.level) > 0 ? state.xp / xpRequiredForLevel(state.level) : 1,
      potionsUnlocked: state.unlockedPotions.length,
      potionsTotal: AW_POTIONS.length,
      stationsOwned: state.stations.filter((s) => s.level > 1).length,
      toolsEquipped: state.tools.filter((t) => t.equipped).length,
      potionsSold: state.soldPotions,
      reputation: state.reputation,
      reputationTitle: state.reputationTitle,
      dailyStreak: state.dailyStreak,
      totalBrews: state.completedBrews,
      contestWins: state.alchemyContestWins,
      netWorth: state.coins + inventoryValue,
    };
  }, [state]);

  /** Get tips/hints for the current workshop state. */
  const awGetWorkshopTips = useCallback((): string[] => {
    const tips: string[] = [];

    // Tip about locked potions
    const lockedCount = AW_POTIONS.filter(
      (p) => !state.unlockedPotions.includes(p.id) && state.level >= p.requiredLevel
    ).length;
    if (lockedCount > 0) {
      tips.push(`You have ${lockedCount} potion(s) available to discover through experimentation!`);
    }

    // Tip about station upgrades
    const lowestStation = state.stations.reduce(
      (min, s) => (s.level < min.level ? s : min),
      state.stations[0]
    );
    const lowestDef = AW_STATIONS.find((s) => s.id === lowestStation.id);
    if (lowestStation.level < 3 && lowestDef) {
      tips.push(`Consider upgrading ${lowestDef.name} — higher levels improve speed and quality!`);
    }

    // Tip about reputation
    if (state.reputation < 200) {
      tips.push('Keep brewing and selling potions to build your alchemist reputation!');
    }

    // Tip about tools
    const unequippedSpeedTool = state.tools.find(
      (t) => !t.equipped && AW_TOOLS.find((d) => d.id === t.id)?.bonusType === 'speed'
    );
    if (unequippedSpeedTool) {
      const def = AW_TOOLS.find((d) => d.id === unequippedSpeedTool.id);
      if (def) tips.push(`Equip ${def.name} to speed up your brewing!`);
    }

    // Tip about daily streak
    if (state.dailyStreak > 0 && state.dailyStreak % 7 === 0) {
      tips.push(`Amazing ${state.dailyStreak}-day streak! Daily rewards get a ${Math.floor(state.dailyStreak * 5)}% bonus!`);
    }

    // Tip about ingredients running low
    const lowIngredients = AW_INGREDIENTS.filter(
      (i) => (state.ingredients[i.id] ?? 0) < 3 && state.unlockedPotions.some((p) =>
        AW_POTIONS.find((pot) => pot.id === p)?.ingredients.some((ing) => ing.ingredientId === i.id)
      )
    );
    if (lowIngredients.length > 0) {
      const names = lowIngredients.slice(0, 3).map((i) => i.name).join(', ');
      tips.push(`Running low on: ${names}. Stock up before your next brewing session!`);
    }

    // Tip about quests
    const completableQuests = state.activeQuests.filter((q) => q.completed && !state.completedQuests.includes(q.id));
    if (completableQuests.length > 0) {
      tips.push(`You have ${completableQuests.length} quest(s) ready to claim rewards for!`);
    }

    // Tip about level
    if (state.level < 10) {
      tips.push('Keep brewing to level up! Higher levels unlock more powerful potions and stations.');
    } else if (state.level < 25) {
      tips.push('Epic and legendary potions await at higher levels — keep pushing!');
    } else if (state.level >= 40) {
      tips.push('You are approaching the pinnacle of alchemy. Mythic potions are within reach!');
    }

    // Tip about contest
    if (state.alchemyContestEntries > 0 && state.alchemyContestWins === 0) {
      tips.push('Try improving your station quality and tool bonuses to win the Alchemy Contest!');
    }

    // Tip about transmutation
    if (state.totalTransmutations === 0) {
      tips.push('Try transmuting ingredients to convert surplus reagents into rarer ones!');
    }

    // Tip about experimentation
    if (state.totalExperiments < 3) {
      tips.push('Experiment with combining 2+ ingredients — you might discover new potions!');
    }

    if (tips.length === 0) {
      tips.push('Your workshop is running smoothly! Keep brewing and expanding your alchemical knowledge.');
    }

    return tips;
  }, [state]);

  /** Calculate the efficiency (coins per XP per second) for a potion. */
  const awCalculateBrewEfficiency = useCallback(
    (potionId: string): { coinsPerSecond: number; xpPerSecond: number; overallScore: number } => {
      const potion = AW_POTIONS.find((p) => p.id === potionId);
      if (!potion) return { coinsPerSecond: 0, xpPerSecond: 0, overallScore: 0 };

      const speedMult = awGetStationSpeedMultiplier(potion.stationId);
      const adjustedTime = Math.max(1, potion.brewTime / speedMult);

      const coinsPerSecond = potion.sellPrice / adjustedTime;
      const xpPerSecond = potion.xpReward / adjustedTime;
      const overallScore = coinsPerSecond + xpPerSecond * 2;

      return { coinsPerSecond: Math.round(coinsPerSecond * 100) / 100, xpPerSecond: Math.round(xpPerSecond * 100) / 100, overallScore: Math.round(overallScore * 100) / 100 };
    },
    [awGetStationSpeedMultiplier]
  );

  /** Get recommended upgrades based on current state and budget. */
  const awGetRecommendedUpgrades = useCallback(
    (budget: number): { type: 'station' | 'tool'; id: string; name: string; cost: number; priority: number }[] => {
      const recommendations: { type: 'station' | 'tool'; id: string; name: string; cost: number; priority: number }[] = [];

      // Evaluate station upgrades
      for (const st of state.stations) {
        const def = AW_STATIONS.find((s) => s.id === st.id);
        if (!def || st.level >= def.maxLevel) continue;
        const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.6, st.level - 1));
        if (cost > budget) continue;
        const isActive = st.id === state.activeStation;
        const priority = (isActive ? 10 : 5) + (def.maxLevel - st.level) * 2 + def.baseQualityBonus;
        recommendations.push({ type: 'station', id: st.id, name: def.name, cost, priority });
      }

      // Evaluate tool upgrades
      for (const tl of state.tools) {
        const def = AW_TOOLS.find((t) => t.id === tl.id);
        if (!def || tl.level >= def.maxLevel) continue;
        const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, tl.level - 1));
        if (cost > budget) continue;
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

  /** Simulate a brew without actually brewing — returns projected results. */
  const awSimulateBrew = useCallback(
    (potionId: string): {
      potion: PotionDef | null;
      canBrew: boolean;
      estimatedTime: number;
      estimatedQuality: number;
      estimatedCoins: number;
      estimatedXP: number;
      missingIngredients: { ingredientId: string; name: string; have: number; need: number }[];
      reason: string;
    } => {
      const potion = AW_POTIONS.find((p) => p.id === potionId);
      if (!potion) return { potion: null, canBrew: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients: [], reason: 'Potion not found' };
      if (!state.unlockedPotions.includes(potionId)) return { potion, canBrew: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients: [], reason: 'Potion is locked' };
      if (state.level < potion.requiredLevel) return { potion, canBrew: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients: [], reason: `Requires level ${potion.requiredLevel}` };
      if (state.activeStation !== potion.stationId) {
        const stationDef = AW_STATIONS.find((s) => s.id === potion.stationId);
        return { potion, canBrew: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients: [], reason: `Requires station: ${stationDef?.name ?? potion.stationId}` };
      }

      const missingIngredients = potion.ingredients
        .map((ing) => {
          const def = AW_INGREDIENTS.find((i) => i.id === ing.ingredientId);
          const have = state.ingredients[ing.ingredientId] ?? 0;
          return { ingredientId: ing.ingredientId, name: def?.name ?? ing.ingredientId, have, need: ing.amount };
        })
        .filter((m) => m.have < m.need);

      if (missingIngredients.length > 0) return { potion, canBrew: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients, reason: 'Missing ingredients' };
      if (state.brewingQueue.length >= awGetMaxBrewSlots()) return { potion, canBrew: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingIngredients: [], reason: 'All brew slots are full' };

      // Calculate estimates
      const speedMult = awGetStationSpeedMultiplier(potion.stationId);
      const estimatedTime = Math.max(5, Math.floor(potion.brewTime / speedMult));
      const qualityBase = awGetStationQualityBonus(potion.stationId);
      const estimatedQuality = Math.min(100, 50 + qualityBase + 5);
      const qualityMult = estimatedQuality / 100;
      const rarityMult = rarityMultiplier(potion.rarity);
      const estimatedCoins = Math.floor(potion.sellPrice * qualityMult * (0.8 + rarityMult * 0.2));
      const estimatedXP = Math.floor(potion.xpReward * qualityMult * rarityMult);

      return { potion, canBrew: true, estimatedTime, estimatedQuality, estimatedCoins, estimatedXP, missingIngredients: [], reason: 'Ready to brew' };
    },
    [state.unlockedPotions, state.level, state.activeStation, state.ingredients, state.brewingQueue, awGetMaxBrewSlots, awGetStationSpeedMultiplier, awGetStationQualityBonus]
  );

  /** Get distribution of unlocked potions by rarity. */
  const awGetPotionRarityDistribution = useCallback((): Record<Rarity, { total: number; unlocked: number }> => {
    const result: Record<Rarity, { total: number; unlocked: number }> = {
      common: { total: 0, unlocked: 0 },
      uncommon: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 },
      mythic: { total: 0, unlocked: 0 },
    };
    for (const potion of AW_POTIONS) {
      result[potion.rarity].total += 1;
      if (state.unlockedPotions.includes(potion.id)) {
        result[potion.rarity].unlocked += 1;
      }
    }
    return result;
  }, [state.unlockedPotions]);

  /** Get the total coin value of all ingredients in inventory. */
  const awGetInventoryValue = useCallback((): number => {
    return Object.entries(state.ingredients).reduce((sum, [id, qty]) => {
      const def = AW_INGREDIENTS.find((i) => i.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
  }, [state.ingredients]);

  /** Get net worth: coins + inventory value. */
  const awGetNetWorth = useCallback((): number => {
    const inventoryValue = Object.entries(state.ingredients).reduce((sum, [id, qty]) => {
      const def = AW_INGREDIENTS.find((i) => i.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
    return state.coins + inventoryValue;
  }, [state.coins, state.ingredients]);

  // ============================================================
  // Return all functions
  // ============================================================

  return {
    awGetState,
    awResetState,
    awSeed,
    awRandom,
    awRandomInt,
    awRandomChoice,
    awGetLevel,
    awGetXP,
    awGetXPTillNext,
    awGetXPTotal,
    awAddXP,
    awGetTitle,
    awGetAllTitles,
    awGetNextTitle,
    awGetProgress,
    awGetOverallProgress,
    awGetCoins,
    awAddCoins,
    awSpendCoins,
    awCanAfford,
    awGetPotions,
    awGetUnlockedPotions,
    awGetLockedPotions,
    awGetPotionById,
    awIsPotionUnlocked,
    awUnlockPotion,
    awGetStations,
    awGetStationLevels,
    awGetActiveStation,
    awSetActiveStation,
    awGetStationLevel,
    awGetStationSpeedMultiplier,
    awGetStationQualityBonus,
    awUpgradeStation,
    awGetIngredients,
    awGetIngredientById,
    awGetInventory,
    awGetIngredientCount,
    awGetIngredientCost,
    awBuyIngredient,
    awUseIngredient,
    awHasIngredients,
    awGetMissingIngredients,
    awBrew,
    awGetBrewingQueue,
    awCancelBrew,
    awCollectBrew,
    awGetBrewTimeRemaining,
    awGetPotionProfit,
    awGetTransmutationRecipes,
    awGetAvailableTransmutations,
    awTransmute,
    awExperiment,
    awGetReputation,
    awGetReputationTitle,
    awGetReputationRank,
    awGetNextReputationTitle,
    awGetReputationProgress,
    awAddReputation,
    awGetTools,
    awGetToolStates,
    awGetEquippedTools,
    awGetToolLevel,
    awGetToolBonus,
    awEquipTool,
    awUpgradeTool,
    awGetQuests,
    awGetActiveQuests,
    awGetAvailableQuests,
    awGetCompletedQuests,
    awAcceptQuest,
    awGetQuestProgress,
    awCompleteQuest,
    awAbandonQuest,
    awGetAchievements,
    awGetUnlockedAchievements,
    awIsAchievementUnlocked,
    awCheckAchievements,
    awUnlockAchievement,
    awGetDailyTask,
    awRefreshDailyTask,
    awClaimDailyReward,
    awGetDailyStreak,
    awGetLastDaily,
    awEnterContest,
    awGetContestRank,
    awGetContestStats,
    awGetStats,
    awGetBrewCount,
    awGetEarnedCoins,
    awGetProfit,
    awGetTotalSpent,
    awGetNPCs,
    awGetNPCById,
    awGetRarityInfo,
    awGetAllRarities,
    awGetPotionsByStation,
    awGetPotionsByRarity,
    awGetIngredientsByRarity,
    awIsBrewing,
    awGetMaxBrewSlots,
    awGetAvailableBrewSlots,
    // -- Extended utilities --
    awBatchBuyIngredients,
    awGetBestPotionForStation,
    awGetMostProfitablePotion,
    awGetAffordablePotions,
    awGetBrewablePotions,
    awGetWorkshopSummary,
    awGetWorkshopTips,
    awCalculateBrewEfficiency,
    awGetRecommendedUpgrades,
    awSimulateBrew,
    awGetPotionRarityDistribution,
    awGetInventoryValue,
    awGetNetWorth,
  };
}

// ============================================================
// Internal Quest Progress Helper (not exported)
// ============================================================

function awProcessQuestProgress(
  state: AlchemistWorkshopState,
  type: QuestType,
  amount: number
): AlchemistWorkshopState {
  let updated = state;
  for (const aq of updated.activeQuests) {
    if (aq.completed) continue;
    const def = AW_QUESTS.find((q) => q.id === aq.id);
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

export default useAlchemistWorkshop;
