import { useState, useCallback, useRef } from 'react';

// ============================================================
// Fairy Garden — Enchanted Garden Management Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// ============================================================

// ============================================================
// Types
// ============================================================

export type FgRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type FgQuestType = 'plant' | 'grow' | 'harvest' | 'befriend' | 'explore' | 'pollinate';
export type FgDailyType = 'plant' | 'water' | 'harvest' | 'befriend';
export type FgGrowthStage = 'seed' | 'sprout' | 'seedling' | 'budding' | 'flowering' | 'harvest_ready';
export type FgBlessingType = 'growth' | 'yield' | 'quality' | 'friendship' | 'luck';

export interface PlantDef {
  id: string;
  name: string;
  rarity: FgRarity;
  seedCost: number;
  growTime: number;
  harvestValue: number;
  xpReward: number;
  zoneId: string;
  description: string;
  emoji: string;
  requiredLevel: number;
  hybridParents: string[];
}

export interface ZoneDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseGrowthBonus: number;
  baseHarvestBonus: number;
  baseUpgradeCost: number;
  maxSlots: number;
}

export interface FairyDef {
  id: string;
  name: string;
  species: string;
  friendshipMax: number;
  giftMultiplier: number;
  favoritePlants: string[];
  description: string;
  emoji: string;
}

export interface NatureSpiritDef {
  id: string;
  name: string;
  element: string;
  description: string;
  emoji: string;
  blessingType: FgBlessingType;
  blessingPower: number;
}

export interface StructureDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  bonusType: FgBlessingType;
  baseBonusValue: number;
  baseUpgradeCost: number;
}

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  type: FgQuestType;
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
  type: FgDailyType;
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
  key: FgRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface PlantSlot {
  id: string;
  zoneId: string;
  plantId: string | null;
  plantedAt: number;
  harvestAt: number;
  growthStage: FgGrowthStage;
  watered: boolean;
  blessed: boolean;
  blessingFairyId: string | null;
  hybridParents: string[];
  harvestCount: number;
}

export interface FriendshipState {
  fairyId: string;
  friendship: number;
  giftsReceived: number;
  lastGiftAt: number | null;
}

export interface StructureState {
  id: string;
  level: number;
  built: boolean;
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

export interface HybridRecord {
  id: string;
  parentA: string;
  parentB: string;
  resultPlantId: string;
  discovered: boolean;
  discoveredAt: number | null;
}

export interface FairyGardenState {
  level: number;
  xp: number;
  coins: number;
  unlockedPlants: string[];
  activeZone: string;
  seeds: Record<string, number>;
  plantSlots: PlantSlot[];
  friendships: FriendshipState[];
  structures: StructureState[];
  activeQuests: QuestState[];
  completedQuests: string[];
  unlockedAchievements: AchievementState[];
  dailyStreak: number;
  lastDaily: string | null;
  dailyTask: DailyTaskState | null;
  totalHarvested: number;
  totalEarned: number;
  totalSpent: number;
  totalPlanted: number;
  totalWatered: number;
  totalBefriended: number;
  gardenShowEntries: number;
  gardenShowWins: number;
  gardenShowLastRank: number | null;
  hybridRecords: HybridRecord[];
  seed: number;
  harvestCountByRarity: Record<FgRarity, number>;
  plantCountByRarity: Record<FgRarity, number>;
  structureUpgradeCount: number;
  zoneUpgradeCount: number;
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

function fgHashString(str: string): number {
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

function fgXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= FG_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function fgClampLevel(lvl: number): number {
  return Math.max(1, Math.min(FG_MAX_LEVEL, lvl));
}

function fgClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function fgGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function fgRarityMultiplier(r: FgRarity): number {
  const map: Record<FgRarity, number> = {
    common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5, mythic: 8,
  };
  return map[r] ?? 1;
}

function fgGrowthStageFromProgress(progress: number): FgGrowthStage {
  if (progress < 0.17) return 'seed';
  if (progress < 0.33) return 'sprout';
  if (progress < 0.5) return 'seedling';
  if (progress < 0.75) return 'budding';
  if (progress < 1) return 'flowering';
  return 'harvest_ready';
}

// ============================================================
// Constants
// ============================================================

export const FG_MAX_LEVEL = 50;

export const FG_RARITIES: RarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
  { key: 'mythic', label: 'Mythic', color: '#F472B6', xpMultiplier: 8 },
];

export const FG_TITLE_THRESHOLDS: TitleInfo[] = [
  { name: 'Seedling', levelRequired: 1, description: 'A tiny sprout just beginning to feel the magic of the earth' },
  { name: 'Budding Gardener', levelRequired: 5, description: 'Your first enchanted flowers bloom under your care' },
  { name: 'Green Thumb', levelRequired: 10, description: 'Common plants flourish wherever you walk' },
  { name: 'Fairy Friend', levelRequired: 18, description: 'The fairy folk trust you enough to share their secrets' },
  { name: 'Enchanted Botanist', levelRequired: 25, description: 'Rare and magical plants bend to your will' },
  { name: 'Grove Keeper', levelRequired: 33, description: 'An entire grove thrives under your guardianship' },
  { name: 'Archfey Gardener', levelRequired: 42, description: 'Nature spirits themselves bow to your horticultural mastery' },
  { name: 'Archdruid', levelRequired: 50, description: 'You are one with the ancient magic of all living things' },
];

export const FG_GROWTH_STAGES: FgGrowthStage[] = [
  'seed', 'sprout', 'seedling', 'budding', 'flowering', 'harvest_ready',
];

export const FG_ZONES: ZoneDef[] = [
  { id: 'moonlight_meadow', name: 'Moonlight Meadow', description: 'A soft, silvery meadow bathed in eternal moonlight — perfect for night-blooming plants', emoji: '🌙', maxLevel: 10, baseGrowthBonus: 0, baseHarvestBonus: 5, baseUpgradeCost: 80, maxSlots: 6 },
  { id: 'crystal_glade', name: 'Crystal Glade', description: 'Shimmering crystal formations amplify plant growth with prismatic energy', emoji: '💎', maxLevel: 10, baseGrowthBonus: 10, baseHarvestBonus: 0, baseUpgradeCost: 100, maxSlots: 6 },
  { id: 'rainbow_grove', name: 'Rainbow Grove', description: 'A kaleidoscopic grove where colors nourish the soul of every plant', emoji: '🌈', maxLevel: 10, baseGrowthBonus: 5, baseHarvestBonus: 8, baseUpgradeCost: 120, maxSlots: 6 },
  { id: 'shadow_thicket', name: 'Shadow Thicket', description: 'Dark and mysterious — rare plants that fear sunlight thrive here', emoji: '🌑', maxLevel: 10, baseGrowthBonus: 15, baseHarvestBonus: 5, baseUpgradeCost: 150, maxSlots: 6 },
  { id: 'fairy_ring', name: 'Fairy Ring', description: 'A sacred circle of mushrooms where fairies dance and plants grow supernaturally', emoji: '🧚', maxLevel: 10, baseGrowthBonus: 8, baseHarvestBonus: 12, baseUpgradeCost: 180, maxSlots: 6 },
  { id: 'mystic_pond', name: 'Mystic Pond', description: 'Enchanted waters that feed magical roots and nourish aquatic wonders', emoji: '🌊', maxLevel: 10, baseGrowthBonus: 5, baseHarvestBonus: 10, baseUpgradeCost: 140, maxSlots: 6 },
  { id: 'ancient_oak', name: 'Ancient Oak', description: 'Beneath the oldest tree in the realm, ancient magic seeps into the soil', emoji: '🌳', maxLevel: 10, baseGrowthBonus: 12, baseHarvestBonus: 8, baseUpgradeCost: 200, maxSlots: 6 },
  { id: 'starlight_clearing', name: 'Starlight Clearing', description: 'An open sky where starlight directly nourishes the rarest celestial plants', emoji: '✨', maxLevel: 10, baseGrowthBonus: 20, baseHarvestBonus: 15, baseUpgradeCost: 250, maxSlots: 6 },
];

export const FG_PLANTS: PlantDef[] = [
  // Common (10)
  { id: 'moonbloom', name: 'Moonbloom', rarity: 'common', seedCost: 5, growTime: 30, harvestValue: 15, xpReward: 10, zoneId: 'moonlight_meadow', description: 'A simple flower that opens only at night, glowing with soft silver light', emoji: '🌼', requiredLevel: 1, hybridParents: [] },
  { id: 'starfern', name: 'Starfern', rarity: 'common', seedCost: 5, growTime: 25, harvestValue: 12, xpReward: 8, zoneId: 'starlight_clearing', description: 'Fern fronds dusted with tiny sparkles that mimic distant stars', emoji: '🌿', requiredLevel: 1, hybridParents: [] },
  { id: 'dewdrop_daisy', name: 'Dewdrop Daisy', rarity: 'common', seedCost: 4, growTime: 20, harvestValue: 10, xpReward: 7, zoneId: 'mystic_pond', description: 'Daisies that produce their own eternal morning dew', emoji: '🌸', requiredLevel: 1, hybridParents: [] },
  { id: 'foxbell', name: 'Foxglove Bell', rarity: 'common', seedCost: 6, growTime: 35, harvestValue: 18, xpReward: 12, zoneId: 'shadow_thicket', description: 'Towering bells that chime softly when the wind blows through them', emoji: '🔔', requiredLevel: 1, hybridParents: [] },
  { id: 'brambleberry', name: 'Brambleberry', rarity: 'common', seedCost: 5, growTime: 28, harvestValue: 14, xpReward: 9, zoneId: 'fairy_ring', description: 'Sweet dark berries protected by enchanted thorns', emoji: '🫐', requiredLevel: 1, hybridParents: [] },
  { id: 'thistledown', name: 'Thistledown', rarity: 'common', seedCost: 4, growTime: 22, harvestValue: 11, xpReward: 7, zoneId: 'rainbow_grove', description: 'Fluffy purple thistles that release floating seeds like tiny wishes', emoji: '💜', requiredLevel: 1, hybridParents: [] },
  { id: 'clover_charm', name: 'Clover Charm', rarity: 'common', seedCost: 5, growTime: 20, harvestValue: 12, xpReward: 8, zoneId: 'fairy_ring', description: 'Four-leaf clovers that grant minor luck to whoever finds one', emoji: '🍀', requiredLevel: 1, hybridParents: [] },
  { id: 'bluebell_whisper', name: 'Bluebell Whisper', rarity: 'common', seedCost: 5, growTime: 24, harvestValue: 13, xpReward: 8, zoneId: 'moonlight_meadow', description: 'Tiny blue bells that carry whispered messages between distant gardens', emoji: '💙', requiredLevel: 1, hybridParents: [] },
  { id: 'morning_glory', name: 'Morning Glory', rarity: 'common', seedCost: 4, growTime: 18, harvestValue: 10, xpReward: 7, zoneId: 'ancient_oak', description: 'Vines that bloom with the sunrise and wrap around the oldest branches', emoji: '🌻', requiredLevel: 1, hybridParents: [] },
  { id: 'sweetgrass', name: 'Sweetgrass', rarity: 'common', seedCost: 3, growTime: 15, harvestValue: 8, xpReward: 6, zoneId: 'ancient_oak', description: 'Fragrant grass used in fairy rituals to purify and bless gardens', emoji: '🌾', requiredLevel: 1, hybridParents: [] },
  // Uncommon (8)
  { id: 'pixie_rose', name: 'Pixie Rose', rarity: 'uncommon', seedCost: 12, growTime: 40, harvestValue: 30, xpReward: 18, zoneId: 'fairy_ring', description: 'Roses that change color based on the mood of nearby pixies', emoji: '🌹', requiredLevel: 3, hybridParents: [] },
  { id: 'crystal_ivy', name: 'Crystal Ivy', rarity: 'uncommon', seedCost: 14, growTime: 45, harvestValue: 35, xpReward: 20, zoneId: 'crystal_glade', description: 'Translucent leaves that refract light into miniature rainbows', emoji: '💎', requiredLevel: 4, hybridParents: [] },
  { id: 'frostlily', name: 'Frostlily', rarity: 'uncommon', seedCost: 15, growTime: 50, harvestValue: 38, xpReward: 22, zoneId: 'moonlight_meadow', description: 'A lily made of living ice that never melts yet never freezes its surroundings', emoji: '❄️', requiredLevel: 5, hybridParents: [] },
  { id: 'emberblossom', name: 'Emberblossom', rarity: 'uncommon', seedCost: 13, growTime: 42, harvestValue: 32, xpReward: 19, zoneId: 'shadow_thicket', description: 'A warm flower that glows with inner fire, harmless but cozy', emoji: '🔥', requiredLevel: 4, hybridParents: [] },
  { id: 'sunbeam_orchid', name: 'Sunbeam Orchid', rarity: 'uncommon', seedCost: 11, growTime: 38, harvestValue: 28, xpReward: 16, zoneId: 'rainbow_grove', description: 'Golden orchids that track the sun across the sky', emoji: '☀️', requiredLevel: 3, hybridParents: [] },
  { id: 'river_reed', name: 'River Reed', rarity: 'uncommon', seedCost: 10, growTime: 35, harvestValue: 25, xpReward: 15, zoneId: 'mystic_pond', description: 'Musical reeds that play melodies when water flows past them', emoji: '🎵', requiredLevel: 3, hybridParents: [] },
  { id: 'twilight_jasmine', name: 'Twilight Jasmine', rarity: 'uncommon', seedCost: 13, growTime: 44, harvestValue: 33, xpReward: 19, zoneId: 'shadow_thicket', description: 'Only blooms at dusk, releasing a fragrance that induces prophetic dreams', emoji: '🌺', requiredLevel: 5, hybridParents: [] },
  { id: 'mossfern', name: 'Mossfern', rarity: 'uncommon', seedCost: 10, growTime: 32, harvestValue: 24, xpReward: 14, zoneId: 'ancient_oak', description: 'Ancient moss-covered ferns that remember everything they have ever seen', emoji: '🍃', requiredLevel: 3, hybridParents: [] },
  // Rare (7)
  { id: 'dragonlily', name: 'Dragonlily', rarity: 'rare', seedCost: 30, growTime: 60, harvestValue: 70, xpReward: 40, zoneId: 'shadow_thicket', description: 'A fierce flower with dragon-scale petals and a fiery scent', emoji: '🐉', requiredLevel: 8, hybridParents: [] },
  { id: 'phoenix_petal', name: 'Phoenix Petal', rarity: 'rare', seedCost: 35, growTime: 65, harvestValue: 80, xpReward: 45, zoneId: 'rainbow_grove', description: 'Burns and regrows daily — each cycle the flowers grow more vibrant', emoji: '🪶', requiredLevel: 9, hybridParents: [] },
  { id: 'unicorn_thistle', name: 'Unicorn Thistle', rarity: 'rare', seedCost: 28, growTime: 55, harvestValue: 65, xpReward: 38, zoneId: 'crystal_glade', description: 'A majestic thistle that unicorns nibble on for strength', emoji: '🦄', requiredLevel: 8, hybridParents: [] },
  { id: 'mermaid_kelp', name: 'Mermaid Kelp', rarity: 'rare', seedCost: 25, growTime: 50, harvestValue: 60, xpReward: 35, zoneId: 'mystic_pond', description: 'Bioluminescent kelp forests that attract merfolk singers', emoji: '🧜', requiredLevel: 7, hybridParents: [] },
  { id: 'shadow_orchid', name: 'Shadow Orchid', rarity: 'rare', seedCost: 32, growTime: 58, harvestValue: 75, xpReward: 42, zoneId: 'shadow_thicket', description: 'An orchid that grows in absolute darkness, feeding on shadow magic', emoji: '🖤', requiredLevel: 9, hybridParents: [] },
  { id: 'storm_tulip', name: 'Storm Tulip', rarity: 'rare', seedCost: 27, growTime: 52, harvestValue: 62, xpReward: 36, zoneId: 'ancient_oak', description: 'Generates tiny lightning bolts between its petals during thunderstorms', emoji: '⚡', requiredLevel: 8, hybridParents: [] },
  { id: 'silver_birch_sapling', name: 'Silver Birch Sapling', rarity: 'rare', seedCost: 30, growTime: 70, harvestValue: 72, xpReward: 44, zoneId: 'moonlight_meadow', description: 'A young silver birch whose bark contains lunar prophecies', emoji: '🌳', requiredLevel: 10, hybridParents: [] },
  // Epic (5)
  { id: 'crystal_moonflower', name: 'Crystal Moonflower', rarity: 'epic', seedCost: 60, growTime: 80, harvestValue: 140, xpReward: 80, zoneId: 'crystal_glade', description: 'A flower of pure crystal that blooms only under the full moon, radiating prismatic light', emoji: '🌙', requiredLevel: 15, hybridParents: [] },
  { id: 'ancient_willow', name: 'Ancient Willow', rarity: 'epic', seedCost: 55, growTime: 90, harvestValue: 130, xpReward: 75, zoneId: 'mystic_pond', description: 'Its weeping branches can reach into the spirit world and bring back lost memories', emoji: '🌿', requiredLevel: 14, hybridParents: [] },
  { id: 'enchanted_mushroom', name: 'Enchanted Mushroom', rarity: 'epic', seedCost: 50, growTime: 70, harvestValue: 120, xpReward: 70, zoneId: 'fairy_ring', description: 'Glowing fungi that expand the mind — a single bite reveals the fairy realm', emoji: '🍄', requiredLevel: 13, hybridParents: [] },
  { id: 'spirit_blossom', name: 'Spirit Blossom', rarity: 'epic', seedCost: 65, growTime: 85, harvestValue: 150, xpReward: 85, zoneId: 'fairy_ring', description: 'Attracts friendly nature spirits that linger to bless nearby plants', emoji: '👻', requiredLevel: 16, hybridParents: [] },
  { id: 'prism_rose', name: 'Prism Rose', rarity: 'epic', seedCost: 58, growTime: 75, harvestValue: 135, xpReward: 78, zoneId: 'rainbow_grove', description: 'Each petal is a different color and contains a different magical property', emoji: '🌹', requiredLevel: 15, hybridParents: [] },
  // Legendary (3)
  { id: 'world_tree_sapling', name: 'World Tree Sapling', rarity: 'legendary', seedCost: 150, growTime: 120, harvestValue: 350, xpReward: 200, zoneId: 'ancient_oak', description: 'A descendant of Yggdrasil itself — its roots connect all the garden zones', emoji: '🌍', requiredLevel: 25, hybridParents: [] },
  { id: 'celestial_rose', name: 'Celestial Rose', rarity: 'legendary', seedCost: 180, growTime: 110, harvestValue: 400, xpReward: 220, zoneId: 'starlight_clearing', description: 'Grown from stardust and moonbeams — said to be the most beautiful flower in existence', emoji: '🌟', requiredLevel: 28, hybridParents: [] },
  { id: 'void_lotus', name: 'Void Lotus', rarity: 'legendary', seedCost: 200, growTime: 130, harvestValue: 450, xpReward: 250, zoneId: 'shadow_thicket', description: 'Blooms in the space between dimensions — its petals contain infinite depth', emoji: '🕳️', requiredLevel: 30, hybridParents: [] },
  // Mythic (2)
  { id: 'eternal_starbloom', name: 'Eternal Starbloom', rarity: 'mythic', seedCost: 500, growTime: 180, harvestValue: 1000, xpReward: 500, zoneId: 'starlight_clearing', description: 'A flower made of condensed starlight that never wilts and grants eternal youth to its gardener', emoji: '⭐', requiredLevel: 40, hybridParents: [] },
  { id: 'genesis_seed_bloom', name: 'Genesis Seed Bloom', rarity: 'mythic', seedCost: 600, growTime: 200, harvestValue: 1200, xpReward: 600, zoneId: 'ancient_oak', description: 'The original plant from which all magical flora descended — growing one reshapes the garden forever', emoji: '🌱', requiredLevel: 45, hybridParents: [] },
];

export const FG_FAIRIES: FairyDef[] = [
  { id: 'fire_fairy', name: 'Ignis', species: 'Fire Fairy', friendshipMax: 100, giftMultiplier: 1.5, favoritePlants: ['emberblossom', 'phoenix_petal', 'dragonlily'], description: 'A warm-hearted fairy whose touch can accelerate the growth of fire-aligned plants', emoji: '🔥' },
  { id: 'ice_pixie', name: 'Frostina', species: 'Ice Pixie', friendshipMax: 100, giftMultiplier: 1.3, favoritePlants: ['frostlily', 'crystal_moonflower', 'crystal_ivy'], description: 'A delicate pixie who freezes dewdrops into perfect crystal sculptures', emoji: '🧊' },
  { id: 'earth_sprite', name: 'Terranova', species: 'Earth Sprite', friendshipMax: 100, giftMultiplier: 1.4, favoritePlants: ['ancient_willow', 'silver_birch_sapling', 'world_tree_sapling'], description: 'A sturdy sprite who tends the deepest roots and strengthens the soil', emoji: '🪨' },
  { id: 'wind_sylph', name: 'Zephyra', species: 'Wind Sylph', friendshipMax: 100, giftMultiplier: 1.2, favoritePlants: ['storm_tulip', 'thistledown', 'morning_glory'], description: 'A swift sylph who carries seeds on the wind to faraway gardens', emoji: '💨' },
  { id: 'water_nymph', name: 'Naiad', species: 'Water Nymph', friendshipMax: 100, giftMultiplier: 1.4, favoritePlants: ['mermaid_kelp', 'river_reed', 'dewdrop_daisy'], description: 'A graceful nymph who blesses pond plants with perfect hydration', emoji: '💧' },
  { id: 'light_sprite', name: 'Lumina', species: 'Light Sprite', friendshipMax: 100, giftMultiplier: 1.6, favoritePlants: ['sunbeam_orchid', 'celestial_rose', 'eternal_starbloom'], description: 'A radiant sprite made of pure light who accelerates photosynthesis', emoji: '💡' },
  { id: 'shadow_wisp', name: 'Umbral', species: 'Shadow Wisp', friendshipMax: 100, giftMultiplier: 1.3, favoritePlants: ['shadow_orchid', 'twilight_jasmine', 'void_lotus'], description: 'A mysterious wisp that nurtures plants in the darkest corners', emoji: '🌑' },
  { id: 'nature_dryad', name: 'Sylvaria', species: 'Nature Dryad', friendshipMax: 100, giftMultiplier: 1.5, favoritePlants: ['ancient_willow', 'mossfern', 'genesis_seed_bloom'], description: 'A tree spirit who has guarded the ancient oak for millennia', emoji: '🌳' },
  { id: 'storm_fairy', name: 'Thunderella', species: 'Storm Fairy', friendshipMax: 100, giftMultiplier: 1.4, favoritePlants: ['storm_tulip', 'dragonlily', 'prism_rose'], description: 'An electrifying fairy whose storms nourish plants with nitrogen-rich rain', emoji: '⛈️' },
  { id: 'crystal_pixie', name: 'Gemma', species: 'Crystal Pixie', friendshipMax: 100, giftMultiplier: 1.3, favoritePlants: ['crystal_ivy', 'crystal_moonflower', 'unicorn_thistle'], description: 'A sparkling pixie who grows crystals on plant stems for added beauty', emoji: '💎' },
  { id: 'moon_fairy', name: 'Lunara', species: 'Moon Fairy', friendshipMax: 100, giftMultiplier: 1.5, favoritePlants: ['moonbloom', 'frostlily', 'crystal_moonflower'], description: 'A serene fairy who draws moonbeams down to nourish night bloomers', emoji: '🌙' },
  { id: 'sun_fairy', name: 'Solara', species: 'Sun Fairy', friendshipMax: 100, giftMultiplier: 1.5, favoritePlants: ['sunbeam_orchid', 'phoenix_petal', 'celestial_rose'], description: 'A brilliant fairy who ensures no plant ever lacks for sunlight', emoji: '☀️' },
  { id: 'forest_elf', name: 'Faelorn', species: 'Forest Elf', friendshipMax: 100, giftMultiplier: 1.2, favoritePlants: ['mossfern', 'morning_glory', 'sweetgrass'], description: 'A wise elf who teaches the ancient ways of harmonious gardening', emoji: '🧝' },
  { id: 'garden_gnome', name: 'Grumblepot', species: 'Garden Gnome', friendshipMax: 100, giftMultiplier: 1.1, favoritePlants: ['brambleberry', 'clover_charm', 'thistledown'], description: 'A gruff but lovable gnome who secretly tends gardens while no one watches', emoji: '🧙' },
  { id: 'pixie_dust', name: 'Twinkle', species: 'Pixie', friendshipMax: 100, giftMultiplier: 1.8, favoritePlants: ['pixie_rose', 'enchanted_mushroom', 'spirit_blossom'], description: 'A tiny pixie whose dust can make any plant bloom instantly', emoji: '✨' },
  { id: 'frost_fairy', name: 'Glaciera', species: 'Frost Fairy', friendshipMax: 100, giftMultiplier: 1.3, favoritePlants: ['frostlily', 'silver_birch_sapling', 'void_lotus'], description: 'A regal fairy who preserves flowers in perfect ice crystal display cases', emoji: '❄️' },
  { id: 'ember_sprite', name: 'Cinder', species: 'Ember Sprite', friendshipMax: 100, giftMultiplier: 1.4, favoritePlants: ['emberblossom', 'dragonlily', 'phoenix_petal'], description: 'A cheerful sprite who keeps greenhouses warm during cold seasons', emoji: '🔥' },
  { id: 'dewdrop_fairy', name: 'Misty', species: 'Dewdrop Fairy', friendshipMax: 100, giftMultiplier: 1.2, favoritePlants: ['dewdrop_daisy', 'river_reed', 'mermaid_kelp'], description: 'A gentle fairy who collects morning dew to water the most delicate seedlings', emoji: '💦' },
  { id: 'starlight_sprite', name: 'Nova', species: 'Starlight Sprite', friendshipMax: 100, giftMultiplier: 1.7, favoritePlants: ['starfern', 'celestial_rose', 'eternal_starbloom'], description: 'A celestial sprite born from falling stars, bringing cosmic energy to plants', emoji: '⭐' },
  { id: 'aurora_fairy', name: 'Aurora', species: 'Aurora Fairy', friendshipMax: 100, giftMultiplier: 1.6, favoritePlants: ['prism_rose', 'starfern', 'celestial_rose'], description: 'A dazzling fairy who paints the garden sky with northern lights each night', emoji: '🌌' },
];

export const FG_NATURE_SPIRITS: NatureSpiritDef[] = [
  { id: 'spirit_spring', name: 'Verdantia', element: 'Spring', description: 'The spirit of rebirth — new growth springs wherever she walks', emoji: '🌱', blessingType: 'growth', blessingPower: 15 },
  { id: 'spirit_summer', name: 'Solstice', element: 'Summer', description: 'The spirit of abundance — plants under her care produce double harvests', emoji: '☀️', blessingType: 'yield', blessingPower: 20 },
  { id: 'spirit_autumn', name: 'Equinox', element: 'Autumn', description: 'The spirit of harvest — ensures all plants reach their full potential', emoji: '🍂', blessingType: 'quality', blessingPower: 18 },
  { id: 'spirit_winter', name: 'Frostfall', element: 'Winter', description: 'The spirit of rest — protects dormant plants through the coldest seasons', emoji: '❄️', blessingType: 'growth', blessingPower: 12 },
  { id: 'spirit_dawn', name: 'Auroriel', element: 'Dawn', description: 'The spirit of new beginnings — her light accelerates seed germination', emoji: '🌅', blessingType: 'growth', blessingPower: 14 },
  { id: 'spirit_dusk', name: 'Twilighta', element: 'Dusk', description: 'The spirit of transitions — helps plants adapt to new environments', emoji: '🌆', blessingType: 'quality', blessingPower: 16 },
  { id: 'spirit_rain', name: 'Pluviel', element: 'Rain', description: 'The spirit of waters — her gentle rains nourish every root and branch', emoji: '🌧️', blessingType: 'yield', blessingPower: 22 },
  { id: 'spirit_wind', name: 'Zephyrius', element: 'Wind', description: 'The spirit of the breeze — spreads pollen and seeds across the garden', emoji: '💨', blessingType: 'growth', blessingPower: 13 },
  { id: 'spirit_earth', name: 'Terramantus', element: 'Earth', description: 'The spirit of soil — enriches the ground with ancient minerals', emoji: '🌍', blessingType: 'yield', blessingPower: 25 },
  { id: 'spirit_stars', name: 'Stellaria', element: 'Stars', description: 'The spirit of the cosmos — aligns starlight to feed celestial plants', emoji: '⭐', blessingType: 'quality', blessingPower: 20 },
  { id: 'spirit_dreams', name: 'Somnambula', element: 'Dreams', description: 'The spirit of dreams — plants grow in magical ways while you sleep', emoji: '💭', blessingType: 'luck', blessingPower: 18 },
  { id: 'spirit_growth', name: 'Floracia', element: 'Growth', description: 'The spirit of all growing things — the most powerful nature spirit', emoji: '🌸', blessingType: 'growth', blessingPower: 30 },
];

export const FG_STRUCTURES: StructureDef[] = [
  { id: 'gazing_pond', name: 'Gazing Pond', description: 'A magical pond that reflects the health of every plant in the garden', emoji: 'Lake', maxLevel: 10, bonusType: 'growth', baseBonusValue: 5, baseUpgradeCost: 50 },
  { id: 'stone_fountain', name: 'Stone Fountain', description: 'An enchanted fountain that waters nearby plants automatically', emoji: '⛲', maxLevel: 10, bonusType: 'yield', baseBonusValue: 4, baseUpgradeCost: 60 },
  { id: 'garden_arch', name: 'Garden Arch', description: 'A living archway of climbing roses that attracts rare butterflies', emoji: '🏛️', maxLevel: 10, bonusType: 'friendship', baseBonusValue: 6, baseUpgradeCost: 70 },
  { id: 'fairy_lantern', name: 'Fairy Lantern', description: 'A glowing lantern that fairies use as a beacon to find your garden', emoji: '🏮', maxLevel: 10, bonusType: 'friendship', baseBonusValue: 5, baseUpgradeCost: 45 },
  { id: 'mushroom_house', name: 'Mushroom House', description: 'A tiny house where helpful garden sprites decide to move in', emoji: '🏠', maxLevel: 10, bonusType: 'yield', baseBonusValue: 6, baseUpgradeCost: 80 },
  { id: 'wind_chime_tower', name: 'Wind Chime Tower', description: 'Musical chimes that soothe plants and accelerate gentle growth', emoji: '🎶', maxLevel: 10, bonusType: 'growth', baseBonusValue: 7, baseUpgradeCost: 90 },
  { id: 'crystal_bird_bath', name: 'Crystal Bird Bath', description: 'Attracts magical birds whose songs bless the garden', emoji: '🕊️', maxLevel: 10, bonusType: 'quality', baseBonusValue: 5, baseUpgradeCost: 55 },
  { id: 'ancient_sundial', name: 'Ancient Sundial', description: 'A prehistoric sundial that optimizes sunlight for every zone', emoji: '⏰', maxLevel: 10, bonusType: 'luck', baseBonusValue: 8, baseUpgradeCost: 100 },
];

export const FG_QUESTS: QuestDef[] = [
  { id: 'quest_first_planting', name: 'First Roots', description: 'Plant your first 5 seeds to begin your enchanted garden', type: 'plant', target: 5, rewardCoins: 50, rewardXP: 25, requiredLevel: 1, emoji: '🌱' },
  { id: 'quest_green_thumb', name: 'Green Thumb', description: 'Harvest 10 plants from your garden', type: 'harvest', target: 10, rewardCoins: 100, rewardXP: 50, requiredLevel: 2, emoji: '🌿' },
  { id: 'quest_fairy_friend', name: 'Fairy Friend', description: 'Befriend 3 fairies by reaching friendship level 20', type: 'befriend', target: 3, rewardCoins: 150, rewardXP: 75, requiredLevel: 3, emoji: '🧚' },
  { id: 'quest_zone_explorer', name: 'Zone Explorer', description: 'Upgrade 2 different garden zones to level 3', type: 'explore', target: 2, rewardCoins: 200, rewardXP: 100, requiredLevel: 5, emoji: '🗺️' },
  { id: 'quest_hybrid_hunter', name: 'Hybrid Hunter', description: 'Discover 3 hybrid plants through cross-pollination', type: 'pollinate', target: 3, rewardCoins: 300, rewardXP: 150, requiredLevel: 8, emoji: '🧬' },
  { id: 'quest_epic_garden', name: 'Epic Garden', description: 'Grow 5 epic-rarity or higher plants to harvest', type: 'grow', target: 5, rewardCoins: 400, rewardXP: 200, requiredLevel: 12, emoji: '🌺' },
  { id: 'quest_fairy_circle', name: 'Fairy Circle', description: 'Befriend 10 different fairies', type: 'befriend', target: 10, rewardCoins: 500, rewardXP: 250, requiredLevel: 15, emoji: '🧚‍♀️' },
  { id: 'quest_master_grower', name: 'Master Grower', description: 'Harvest 50 plants total from any zone', type: 'harvest', target: 50, rewardCoins: 600, rewardXP: 300, requiredLevel: 18, emoji: '🌻' },
  { id: 'quest_legendary_bloom', name: 'Legendary Bloom', description: 'Grow 3 legendary or mythic plants to harvest', type: 'grow', target: 3, rewardCoins: 800, rewardXP: 400, requiredLevel: 25, emoji: '🌟' },
  { id: 'quest_archdruid_trial', name: 'Archdruid Trial', description: 'Discover all possible hybrid plants and max out 1 zone', type: 'pollinate', target: 10, rewardCoins: 1500, rewardXP: 750, requiredLevel: 35, emoji: '👑' },
];

export const FG_NPCS: NPCDef[] = [
  { id: 'npc_elaria', name: 'Elaria the Sage', role: 'Garden Elder', description: 'An ancient dryad who has tended enchanted gardens for a thousand years', emoji: '🧚', greeting: 'Welcome, young gardener. The soil remembers your touch — let us see what grows.' },
  { id: 'npc_meridian', name: 'Meridian', role: 'Seed Merchant', description: 'A traveling merchant who trades rare seeds from distant magical lands', emoji: '🧳', greeting: 'Fresh seeds from the Whispering Marshes! Care to try something exotic?' },
  { id: 'npc_pip', name: 'Pip', role: 'Fairy Apprentice', description: 'A tiny fairy learning gardening magic alongside you', emoji: '🧚‍♂️', greeting: 'I watered the moonblooms while you were away! Did I do it right?' },
  { id: 'npc_thornwick', name: 'Professor Thornwick', role: 'Botany Expert', description: 'A scholarly gnome who studies magical plant crossbreeding', emoji: '📚', greeting: 'Fascinating! The pollen count in your garden suggests hybrid potential!' },
  { id: 'npc_luna', name: 'Luna Moth', role: 'Garden Guardian', description: 'A mystical moth who protects the garden from pests and blight', emoji: '🦋', greeting: 'All is well in the garden today, gardener. No shadow rot detected.' },
  { id: 'npc_ironroot', name: 'Ironroot', role: 'Structure Builder', description: 'A dwarven craftsman who builds enchanted garden structures', emoji: '🔨', greeting: 'Need a new fountain? My stone-wrought marvels last a thousand years!' },
];

export const FG_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach_first_plant', name: 'First Seed', description: 'Plant your very first seed', conditionKey: 'totalPlanted', targetValue: 1, rewardCoins: 10, rewardXP: 5, emoji: '🌱' },
  { id: 'ach_plant_25', name: 'Seed Sower', description: 'Plant 25 seeds total', conditionKey: 'totalPlanted', targetValue: 25, rewardCoins: 50, rewardXP: 25, emoji: '🌾' },
  { id: 'ach_plant_100', name: 'Garden of Plenty', description: 'Plant 100 seeds total', conditionKey: 'totalPlanted', targetValue: 100, rewardCoins: 200, rewardXP: 100, emoji: '🌻' },
  { id: 'ach_plant_500', name: 'Endless Fields', description: 'Plant 500 seeds total', conditionKey: 'totalPlanted', targetValue: 500, rewardCoins: 500, rewardXP: 250, emoji: '🌾' },
  { id: 'ach_harvest_10', name: 'First Harvest', description: 'Harvest 10 plants', conditionKey: 'totalHarvested', targetValue: 10, rewardCoins: 30, rewardXP: 15, emoji: '🌷' },
  { id: 'ach_harvest_50', name: 'Bountiful Garden', description: 'Harvest 50 plants', conditionKey: 'totalHarvested', targetValue: 50, rewardCoins: 200, rewardXP: 100, emoji: '💐' },
  { id: 'ach_harvest_200', name: 'Garden Empire', description: 'Harvest 200 plants', conditionKey: 'totalHarvested', targetValue: 200, rewardCoins: 500, rewardXP: 250, emoji: '🏰' },
  { id: 'ach_water_50', name: 'Diligent Waterer', description: 'Water your plants 50 times', conditionKey: 'totalWatered', targetValue: 50, rewardCoins: 100, rewardXP: 50, emoji: '💧' },
  { id: 'ach_befriend_5', name: 'Fairy Acquaintance', description: 'Reach friendship 50 with 5 different fairies', conditionKey: 'totalBefriended', targetValue: 5, rewardCoins: 150, rewardXP: 75, emoji: '🧚' },
  { id: 'ach_befriend_15', name: 'Fairy Court', description: 'Reach friendship 50 with 15 different fairies', conditionKey: 'totalBefriended', targetValue: 15, rewardCoins: 500, rewardXP: 250, emoji: '👑' },
  { id: 'ach_earn_1000', name: 'Thousand Petals', description: 'Earn 1000 coins total from harvests', conditionKey: 'totalEarned', targetValue: 1000, rewardCoins: 100, rewardXP: 50, emoji: '💰' },
  { id: 'ach_earn_10000', name: 'Garden Tycoon', description: 'Earn 10000 coins total from harvests', conditionKey: 'totalEarned', targetValue: 10000, rewardCoins: 1000, rewardXP: 500, emoji: '🤑' },
  { id: 'ach_level_10', name: 'Double Digits', description: 'Reach garden level 10', conditionKey: 'level', targetValue: 10, rewardCoins: 150, rewardXP: 75, emoji: '🔟' },
  { id: 'ach_level_25', name: 'Quarter Bloom', description: 'Reach garden level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 400, rewardXP: 200, emoji: '🌟' },
  { id: 'ach_level_50', name: 'Archdruid Ascendant', description: 'Reach the maximum garden level', conditionKey: 'level', targetValue: 50, rewardCoins: 2000, rewardXP: 1000, emoji: '👑' },
];

export const FG_DAILY_TASK_POOL: DailyTaskPoolDef[] = [
  { id: 'daily_plant_3', name: 'Daily Planting', description: 'Plant 3 seeds in your garden', type: 'plant', target: 3, rewardCoins: 25, rewardXP: 12, emoji: '🌱' },
  { id: 'daily_plant_5', name: 'Planting Spree', description: 'Plant 5 seeds in your garden', type: 'plant', target: 5, rewardCoins: 40, rewardXP: 20, emoji: '🌾' },
  { id: 'daily_water_5', name: 'Watering Day', description: 'Water 5 plants', type: 'water', target: 5, rewardCoins: 20, rewardXP: 10, emoji: '💧' },
  { id: 'daily_water_10', name: 'Deep Watering', description: 'Water 10 plants', type: 'water', target: 10, rewardCoins: 35, rewardXP: 18, emoji: '🌊' },
  { id: 'daily_harvest_3', name: 'Harvest Time', description: 'Harvest 3 fully grown plants', type: 'harvest', target: 3, rewardCoins: 30, rewardXP: 15, emoji: '🌷' },
  { id: 'daily_harvest_5', name: 'Bountiful Harvest', description: 'Harvest 5 fully grown plants', type: 'harvest', target: 5, rewardCoins: 55, rewardXP: 28, emoji: '💐' },
  { id: 'daily_befriend_1', name: 'Fairy Visit', description: 'Give a gift to 1 fairy', type: 'befriend', target: 1, rewardCoins: 20, rewardXP: 10, emoji: '🧚' },
  { id: 'daily_befriend_3', name: 'Social Gardener', description: 'Give gifts to 3 different fairies', type: 'befriend', target: 3, rewardCoins: 45, rewardXP: 22, emoji: '🧚‍♀️' },
];

export const FG_HYBRID_RECIPES: { parentA: string; parentB: string; result: string; resultName: string; resultEmoji: string }[] = [
  { parentA: 'moonbloom', parentB: 'starfern', result: 'hybrid_moonstar', resultName: 'Moonstar Blossom', resultEmoji: '🌟' },
  { parentA: 'pixie_rose', parentB: 'crystal_ivy', result: 'hybrid_prism_ivy', resultName: 'Prism Ivy Rose', resultEmoji: '🌹' },
  { parentA: 'frostlily', parentB: 'emberblossom', result: 'hybrid_frostfire', resultName: 'Frostfire Lily', resultEmoji: '💎' },
  { parentA: 'dragonlily', parentB: 'phoenix_petal', result: 'hybrid_dragon_phoenix', resultName: 'Dragon Phoenix Bloom', resultEmoji: '🐉' },
  { parentA: 'unicorn_thistle', parentB: 'mermaid_kelp', result: 'hybrid_unicorn_wave', resultName: 'Unicorn Wave Thistle', resultEmoji: '🦄' },
  { parentA: 'shadow_orchid', parentB: 'crystal_moonflower', result: 'hybrid_shadow_crystal', resultName: 'Shadow Crystal Orchid', resultEmoji: '🌑' },
  { parentA: 'ancient_willow', parentB: 'spirit_blossom', result: 'hybrid_spirit_willow', resultName: 'Spirit Willow', resultEmoji: '👻' },
  { parentA: 'celestial_rose', parentB: 'void_lotus', result: 'hybrid_cosmic_void', resultName: 'Cosmic Void Rose', resultEmoji: '🌌' },
  { parentA: 'world_tree_sapling', parentB: 'eternal_starbloom', result: 'hybrid_eternal_tree', resultName: 'Eternal World Bloom', resultEmoji: '🌍' },
  { parentA: 'enchanted_mushroom', parentB: 'prism_rose', result: 'hybrid_chromatic_shroom', resultName: 'Chromatic Shroom', resultEmoji: '🍄' },
];

// ============================================================
// Initial State Factory
// ============================================================

function createInitialState(seed?: number): FairyGardenState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  const startingPlants = ['moonbloom', 'starfern', 'dewdrop_daisy', 'foxbell', 'brambleberry', 'thistledown', 'clover_charm', 'bluebell_whisper', 'morning_glory', 'sweetgrass'];
  const plantSlots: PlantSlot[] = FG_ZONES.map((zone) => {
    const slots: PlantSlot[] = [];
    for (let i = 0; i < zone.maxSlots; i++) {
      slots.push({
        id: `slot_${zone.id}_${i}`,
        zoneId: zone.id,
        plantId: null,
        plantedAt: 0,
        harvestAt: 0,
        growthStage: 'seed',
        watered: false,
        blessed: false,
        blessingFairyId: null,
        hybridParents: [],
        harvestCount: 0,
      });
    }
    return slots;
  }).flat();

  return {
    level: 1,
    xp: 0,
    coins: 100,
    unlockedPlants: startingPlants,
    activeZone: 'moonlight_meadow',
    seeds: { moonbloom: 5, starfern: 5, dewdrop_daisy: 5, sweetgrass: 5, clover_charm: 3 },
    plantSlots,
    friendships: FG_FAIRIES.map((f) => ({ fairyId: f.id, friendship: 0, giftsReceived: 0, lastGiftAt: null })),
    structures: FG_STRUCTURES.map((s) => ({ id: s.id, level: 1, built: s.id === 'gazing_pond' })),
    activeQuests: [],
    completedQuests: [],
    unlockedAchievements: FG_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, unlockedAt: null })),
    dailyStreak: 0,
    lastDaily: null,
    dailyTask: null,
    totalHarvested: 0,
    totalEarned: 0,
    totalSpent: 0,
    totalPlanted: 0,
    totalWatered: 0,
    totalBefriended: 0,
    gardenShowEntries: 0,
    gardenShowWins: 0,
    gardenShowLastRank: null,
    hybridRecords: FG_HYBRID_RECIPES.map((h) => ({ id: h.result, parentA: h.parentA, parentB: h.parentB, resultPlantId: h.result, discovered: false, discoveredAt: null })),
    seed: effectiveSeed,
    harvestCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    plantCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    structureUpgradeCount: 0,
    zoneUpgradeCount: 0,
  };
}

// ============================================================
// Hook: useFairyGarden
// ============================================================

export default function useFairyGarden(initialSeed?: number) {
  const [state, setState] = useState<FairyGardenState>(() => createInitialState(initialSeed));
  const prngRef = useRef<() => number>(mulberry32(state.seed));

  // ---- Core State ----

  const fgGetState = useCallback((): Readonly<FairyGardenState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const fgResetState = useCallback((newSeed?: number) => {
    const s = createInitialState(newSeed);
    prngRef.current = mulberry32(s.seed);
    setState(s);
  }, []);

  const fgSeed = useCallback((seed: number) => {
    prngRef.current = mulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const fgRandom = useCallback((): number => {
    return prngRef.current();
  }, []);

  const fgRandomInt = useCallback((min: number, max: number): number => {
    const rng = prngRef.current();
    return min + Math.floor(rng * (max - min + 1));
  }, []);

  const fgRandomChoice = useCallback(<T>(arr: readonly T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(prngRef.current() * arr.length)];
  }, []);

  // ---- Level / XP ----

  const fgGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const fgGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const fgGetXPTillNext = useCallback((): number => {
    return fgXpRequired(state.level);
  }, [state.level]);

  const fgAddXP = useCallback((amount: number): FairyGardenState => {
    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += Math.floor(amount);
      while (level < FG_MAX_LEVEL && xp >= fgXpRequired(level)) {
        xp -= fgXpRequired(level);
        level += 1;
      }
      if (level >= FG_MAX_LEVEL) xp = 0;
      next = { ...prev, level: fgClampLevel(level), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Title ----

  const fgGetTitle = useCallback((): TitleInfo => {
    let current = FG_TITLE_THRESHOLDS[0];
    for (const t of FG_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const fgGetAllTitles = useCallback((): TitleInfo[] => {
    return [...FG_TITLE_THRESHOLDS];
  }, []);

  const fgGetNextTitle = useCallback((): TitleInfo | null => {
    for (const t of FG_TITLE_THRESHOLDS) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const fgGetProgress = useCallback((): number => {
    const needed = fgXpRequired(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const fgGetOverallProgress = useCallback((): number => {
    return state.level / FG_MAX_LEVEL;
  }, [state.level]);

  // ---- Coins ----

  const fgGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const fgAddCoins = useCallback((amount: number): FairyGardenState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: fgClampCoins(prev.coins + amount), totalEarned: prev.totalEarned + Math.max(0, amount) };
      return next;
    });
    return next;
  }, [state]);

  const fgSpendCoins = useCallback((amount: number): { success: boolean; state: FairyGardenState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: fgClampCoins(prev.coins - amount), totalSpent: prev.totalSpent + amount };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fgCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Plants ----

  const fgGetPlants = useCallback((): PlantDef[] => {
    return [...FG_PLANTS];
  }, []);

  const fgGetPlantById = useCallback((id: string): PlantDef | null => {
    return FG_PLANTS.find((p) => p.id === id) ?? null;
  }, []);

  const fgGetUnlockedPlants = useCallback((): PlantDef[] => {
    return FG_PLANTS.filter((p) => state.unlockedPlants.includes(p.id));
  }, [state.unlockedPlants]);

  const fgGetLockedPlants = useCallback((): PlantDef[] => {
    return FG_PLANTS.filter((p) => !state.unlockedPlants.includes(p.id));
  }, [state.unlockedPlants]);

  const fgIsPlantUnlocked = useCallback((plantId: string): boolean => {
    return state.unlockedPlants.includes(plantId);
  }, [state.unlockedPlants]);

  const fgUnlockPlant = useCallback((plantId: string): { success: boolean; state: FairyGardenState } => {
    const plant = FG_PLANTS.find((p) => p.id === plantId);
    if (!plant) return { success: false, state };
    if (state.unlockedPlants.includes(plantId)) return { success: false, state };
    if (state.level < plant.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      if (prev.unlockedPlants.includes(plantId)) return prev;
      next = { ...prev, unlockedPlants: [...prev.unlockedPlants, plantId] };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fgGetPlantsByRarity = useCallback((rarity: FgRarity): PlantDef[] => {
    return FG_PLANTS.filter((p) => p.rarity === rarity);
  }, []);

  const fgGetPlantsByZone = useCallback((zoneId: string): PlantDef[] => {
    return FG_PLANTS.filter((p) => p.zoneId === zoneId);
  }, []);

  // ---- Seeds / Inventory ----

  const fgGetSeeds = useCallback((): Record<string, number> => {
    return { ...state.seeds };
  }, [state.seeds]);

  const fgGetSeedCount = useCallback((plantId: string): number => {
    return state.seeds[plantId] ?? 0;
  }, [state.seeds]);

  const fgGetSeedCost = useCallback((plantId: string): number => {
    const def = FG_PLANTS.find((p) => p.id === plantId);
    return def?.seedCost ?? 0;
  }, []);

  const fgBuySeeds = useCallback((plantId: string, amount: number = 1): { success: boolean; cost: number; state: FairyGardenState } => {
    const def = FG_PLANTS.find((p) => p.id === plantId);
    if (!def) return { success: false, cost: 0, state };
    if (!state.unlockedPlants.includes(plantId)) return { success: false, cost: 0, state };
    const totalCost = def.seedCost * amount;
    if (state.coins < totalCost) return { success: false, cost: totalCost, state };
    let next = state;
    setState((prev) => {
      const newSeeds = { ...prev.seeds, [plantId]: (prev.seeds[plantId] ?? 0) + amount };
      const newCountByRarity = { ...prev.plantCountByRarity, [def.rarity]: prev.plantCountByRarity[def.rarity] + amount };
      next = { ...prev, seeds: newSeeds, coins: fgClampCoins(prev.coins - totalCost), totalSpent: prev.totalSpent + totalCost, plantCountByRarity: newCountByRarity };

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = FG_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'plant') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + amount } };
        }
      }
      return next;
    });
    return { success: true, cost: totalCost, state: next };
  }, [state]);

  const fgUseSeed = useCallback((plantId: string): boolean => {
    const current = state.seeds[plantId] ?? 0;
    if (current < 1) return false;
    let success = false;
    setState((prev) => {
      const have = prev.seeds[plantId] ?? 0;
      if (have < 1) { success = false; return prev; }
      success = true;
      const newSeeds = { ...prev.seeds };
      newSeeds[plantId] = have - 1;
      if (newSeeds[plantId] <= 0) delete newSeeds[plantId];
      return { ...prev, seeds: newSeeds };
    });
    return success;
  }, [state]);

  // ---- Zones ----

  const fgGetZones = useCallback((): ZoneDef[] => {
    return [...FG_ZONES];
  }, []);

  const fgGetZoneById = useCallback((id: string): ZoneDef | null => {
    return FG_ZONES.find((z) => z.id === id) ?? null;
  }, []);

  const fgGetActiveZone = useCallback((): ZoneDef | null => {
    return FG_ZONES.find((z) => z.id === state.activeZone) ?? null;
  }, [state.activeZone]);

  const fgSetActiveZone = useCallback((zoneId: string): { success: boolean; state: FairyGardenState } => {
    const exists = FG_ZONES.find((z) => z.id === zoneId);
    if (!exists) return { success: false, state };
    let next = state;
    setState((prev) => { next = { ...prev, activeZone: zoneId }; return next; });
    return { success: true, state: next };
  }, [state]);

  const fgGetZoneGrowthBonus = useCallback((zoneId: string): number => {
    // Find the zone level from structures or a simple calculation
    const zoneSlotCount = state.plantSlots.filter((s) => s.zoneId === zoneId).length;
    const builtStructuresInZone = state.structures.filter((s) => s.built);
    let structureBonus = 0;
    for (const st of builtStructuresInZone) {
      const def = FG_STRUCTURES.find((d) => d.id === st.id);
      if (def && def.bonusType === 'growth') {
        structureBonus += def.baseBonusValue * (0.5 + st.level * 0.15);
      }
    }
    const zoneDef = FG_ZONES.find((z) => z.id === zoneId);
    return (zoneDef?.baseGrowthBonus ?? 0) + structureBonus;
  }, [state.plantSlots, state.structures]);

  const fgGetZoneHarvestBonus = useCallback((zoneId: string): number => {
    const builtStructures = state.structures.filter((s) => s.built);
    let structureBonus = 0;
    for (const st of builtStructures) {
      const def = FG_STRUCTURES.find((d) => d.id === st.id);
      if (def && def.bonusType === 'yield') {
        structureBonus += def.baseBonusValue * (0.5 + st.level * 0.15);
      }
    }
    const zoneDef = FG_ZONES.find((z) => z.id === zoneId);
    return (zoneDef?.baseHarvestBonus ?? 0) + structureBonus;
  }, [state.structures]);

  const fgGetSlotsForZone = useCallback((zoneId: string): PlantSlot[] => {
    return state.plantSlots.filter((s) => s.zoneId === zoneId);
  }, [state.plantSlots]);

  const fgGetEmptySlots = useCallback((zoneId: string): PlantSlot[] => {
    return state.plantSlots.filter((s) => s.zoneId === zoneId && s.plantId === null);
  }, [state.plantSlots]);

  const fgGetUsedSlots = useCallback((zoneId: string): PlantSlot[] => {
    return state.plantSlots.filter((s) => s.zoneId === zoneId && s.plantId !== null);
  }, [state.plantSlots]);

  // ---- Planting ----

  const fgPlant = useCallback((plantId: string, slotId: string, now: number = Date.now()): { success: boolean; state: FairyGardenState } => {
    const plant = FG_PLANTS.find((p) => p.id === plantId);
    if (!plant) return { success: false, state };
    if (!state.unlockedPlants.includes(plantId)) return { success: false, state };
    if (state.level < plant.requiredLevel) return { success: false, state };

    const slotIdx = state.plantSlots.findIndex((s) => s.id === slotId);
    if (slotIdx === -1) return { success: false, state };
    const slot = state.plantSlots[slotIdx];
    if (slot.plantId !== null) return { success: false, state };
    if (slot.harvestAt > now) return { success: false, state };

    const currentSeeds = state.seeds[plantId] ?? 0;
    if (currentSeeds < 1) return { success: false, state };

    // Check zone compatibility
    if (slot.zoneId !== plant.zoneId) return { success: false, state };

    const growthBonus = fgGetZoneGrowthBonus(slot.zoneId);
    const growthMult = 1 + growthBonus * 0.01;
    const adjustedGrowTime = Math.max(10, Math.floor(plant.growTime / growthMult));
    const harvestAt = now + adjustedGrowTime * 1000;

    let next = state;
    setState((prev) => {
      const newSeeds = { ...prev.seeds };
      newSeeds[plantId] = (newSeeds[plantId] ?? 0) - 1;
      if (newSeeds[plantId] <= 0) delete newSeeds[plantId];

      const newSlots = [...prev.plantSlots];
      newSlots[slotIdx] = {
        ...newSlots[slotIdx],
        plantId,
        plantedAt: now,
        harvestAt,
        growthStage: 'seed',
        watered: false,
        blessed: false,
        blessingFairyId: null,
        hybridParents: [],
        harvestCount: prev.plantSlots[slotIdx].harvestCount,
      };

      next = { ...prev, seeds: newSeeds, plantSlots: newSlots, totalPlanted: prev.totalPlanted + 1 };

      next = fgProcessQuestProgress(next, 'plant', 1);

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = FG_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'plant') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }

      return next;
    });

    return { success: true, state: next };
  }, [state, fgGetZoneGrowthBonus]);

  // ---- Watering ----

  const fgWater = useCallback((slotId: string, now: number = Date.now()): { success: boolean; timeReduced: number; state: FairyGardenState } => {
    const slotIdx = state.plantSlots.findIndex((s) => s.id === slotId);
    if (slotIdx === -1) return { success: false, timeReduced: 0, state };
    const slot = state.plantSlots[slotIdx];
    if (slot.plantId === null) return { success: false, timeReduced: 0, state };
    if (slot.watered) return { success: false, timeReduced: 0, state };

    const plant = FG_PLANTS.find((p) => p.id === slot.plantId);
    if (!plant) return { success: false, timeReduced: 0, state };

    const remaining = Math.max(0, slot.harvestAt - now);
    const reductionMs = Math.floor(remaining * 0.15); // 15% time reduction
    const newHarvestAt = slot.harvestAt - reductionMs;

    let next = state;
    setState((prev) => {
      const newSlots = [...prev.plantSlots];
      newSlots[slotIdx] = { ...newSlots[slotIdx], watered: true, harvestAt: Math.max(now, newHarvestAt) };

      next = { ...prev, plantSlots: newSlots, totalWatered: prev.totalWatered + 1 };

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = FG_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'water') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }

      return next;
    });

    return { success: true, timeReduced: reductionMs, state: next };
  }, [state]);

  // ---- Growth / Harvest ----

  const fgGetPlantGrowthProgress = useCallback((slotId: string, now: number = Date.now()): { progress: number; stage: FgGrowthStage; remainingMs: number } => {
    const slot = state.plantSlots.find((s) => s.id === slotId);
    if (!slot || slot.plantId === null) return { progress: 0, stage: 'seed', remainingMs: 0 };
    if (now >= slot.harvestAt) return { progress: 1, stage: 'harvest_ready', remainingMs: 0 };
    const plant = FG_PLANTS.find((p) => p.id === slot.plantId);
    if (!plant) return { progress: 0, stage: 'seed', remainingMs: 0 };
    const totalMs = slot.harvestAt - slot.plantedAt;
    const elapsed = now - slot.plantedAt;
    const progress = Math.min(1, elapsed / totalMs);
    return { progress, stage: fgGrowthStageFromProgress(progress), remainingMs: slot.harvestAt - now };
  }, [state.plantSlots]);

  const fgHarvest = useCallback((slotId: string, now: number = Date.now()): { success: boolean; plant: PlantDef | null; coinsEarned: number; xpEarned: number; state: FairyGardenState } => {
    const slotIdx = state.plantSlots.findIndex((s) => s.id === slotId);
    if (slotIdx === -1) return { success: false, plant: null, coinsEarned: 0, xpEarned: 0, state };
    const slot = state.plantSlots[slotIdx];
    if (slot.plantId === null) return { success: false, plant: null, coinsEarned: 0, xpEarned: 0, state };
    if (now < slot.harvestAt) return { success: false, plant: null, coinsEarned: 0, xpEarned: 0, state };

    const plant = FG_PLANTS.find((p) => p.id === slot.plantId);
    if (!plant) return { success: false, plant: null, coinsEarned: 0, xpEarned: 0, state };

    const rarityMult = fgRarityMultiplier(plant.rarity);
    const harvestBonus = fgGetZoneHarvestBonus(slot.zoneId);
    const qualityMult = 0.8 + (harvestBonus + (slot.blessed ? 20 : 0)) * 0.01;
    const blessingMult = slot.blessed ? 1.2 : 1;
    const coinsEarned = Math.floor(plant.harvestValue * qualityMult * blessingMult * (0.8 + rarityMult * 0.2));
    const xpEarned = Math.floor(plant.xpReward * rarityMult * blessingMult);

    let next = state;
    setState((prev) => {
      const newSlots = [...prev.plantSlots];
      const newHarvestCount = newSlots[slotIdx].harvestCount + 1;
      newSlots[slotIdx] = {
        ...newSlots[slotIdx],
        plantId: null,
        plantedAt: 0,
        harvestAt: 0,
        growthStage: 'seed',
        watered: false,
        blessed: false,
        blessingFairyId: null,
        hybridParents: [],
        harvestCount: newHarvestCount,
      };

      const newHarvestByRarity = { ...prev.harvestCountByRarity, [plant.rarity]: prev.harvestCountByRarity[plant.rarity] + 1 };

      next = {
        ...prev,
        plantSlots: newSlots,
        coins: fgClampCoins(prev.coins + coinsEarned),
        totalEarned: prev.totalEarned + coinsEarned,
        totalHarvested: prev.totalHarvested + 1,
        harvestCountByRarity: newHarvestByRarity,
      };

      // Level up
      let { level, xp } = next;
      xp += xpEarned;
      while (level < FG_MAX_LEVEL && xp >= fgXpRequired(level)) {
        xp -= fgXpRequired(level);
        level += 1;
      }
      if (level >= FG_MAX_LEVEL) xp = 0;
      next = { ...next, level: fgClampLevel(level), xp };

      next = fgProcessQuestProgress(next, 'harvest', 1);
      next = fgProcessQuestProgress(next, 'grow', 1);

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = FG_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'harvest') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }

      return next;
    });

    return { success: true, plant, coinsEarned, xpEarned, state: next };
  }, [state, fgGetZoneHarvestBonus]);

  const fgGetHarvestableSlots = useCallback((now: number = Date.now()): PlantSlot[] => {
    return state.plantSlots.filter((s) => s.plantId !== null && now >= s.harvestAt);
  }, [state.plantSlots]);

  const fgGetGrowingSlots = useCallback((now: number = Date.now()): PlantSlot[] => {
    return state.plantSlots.filter((s) => s.plantId !== null && now < s.harvestAt);
  }, [state.plantSlots]);

  const fgGetFlowers = useCallback((now: number = Date.now()): PlantSlot[] => {
    return state.plantSlots.filter((s) => {
      if (s.plantId === null) return false;
      const progress = now >= s.harvestAt ? 1 : (now - s.plantedAt) / Math.max(1, s.harvestAt - s.plantedAt);
      return progress >= 0.75;
    });
  }, [state.plantSlots]);

  // ---- Cross-Pollination ----

  const fgCheckPollination = useCallback((zoneId: string, now: number = Date.now()): { success: boolean; hybridRecipe: typeof FG_HYBRID_RECIPES[number] | null; state: FairyGardenState } => {
    const zoneSlots = state.plantSlots.filter((s) => s.zoneId === zoneId && s.plantId !== null);
    if (zoneSlots.length < 2) return { success: false, hybridRecipe: null, state };

    // Collect flowering+ plants
    const floweringPlants = zoneSlots.filter((s) => {
      if (now < s.harvestAt * 0.75 + s.plantedAt * 0.25) return false;
      return true;
    });

    if (floweringPlants.length < 2) return { success: false, hybridRecipe: null, state };

    // Check for matching hybrid recipe
    const plantedIds = new Set(floweringPlants.map((s) => s.plantId!));
    for (const recipe of FG_HYBRID_RECIPES) {
      const alreadyDiscovered = state.hybridRecords.find((h) => h.resultPlantId === recipe.result && h.discovered);
      if (alreadyDiscovered) continue;
      if (plantedIds.has(recipe.parentA) && plantedIds.has(recipe.parentB)) {
        // 25% chance per check
        if (prngRef.current() < 0.25) {
          let next = state;
          setState((prev) => {
            const newRecords = prev.hybridRecords.map((h) =>
              h.resultPlantId === recipe.result ? { ...h, discovered: true, discoveredAt: now } : h
            );
            next = { ...prev, hybridRecords: newRecords, unlockedPlants: [...prev.unlockedPlants, recipe.result] };

            // XP for discovery
            let { level, xp } = next;
            xp += 100;
            while (level < FG_MAX_LEVEL && xp >= fgXpRequired(level)) {
              xp -= fgXpRequired(level);
              level += 1;
            }
            if (level >= FG_MAX_LEVEL) xp = 0;
            next = { ...next, level: fgClampLevel(level), xp };

            next = fgProcessQuestProgress(next, 'pollinate', 1);
            return next;
          });
          return { success: true, hybridRecipe: recipe, state: next };
        }
      }
    }

    return { success: false, hybridRecipe: null, state };
  }, [state]);

  const fgGetHybridRecords = useCallback((): HybridRecord[] => {
    return [...state.hybridRecords];
  }, [state.hybridRecords]);

  const fgGetDiscoveredHybrids = useCallback((): HybridRecord[] => {
    return state.hybridRecords.filter((h) => h.discovered);
  }, [state.hybridRecords]);

  const fgGetUndiscoveredHybrids = useCallback((): HybridRecord[] => {
    return state.hybridRecords.filter((h) => !h.discovered);
  }, [state.hybridRecords]);

  const fgGetHybridRecipeFor = useCallback((parentA: string, parentB: string): typeof FG_HYBRID_RECIPES[number] | null => {
    return FG_HYBRID_RECIPES.find((h) =>
      (h.parentA === parentA && h.parentB === parentB) || (h.parentA === parentB && h.parentB === parentA)
    ) ?? null;
  }, []);

  // ---- Fairies & Friendship ----

  const fgGetFairies = useCallback((): FairyDef[] => {
    return [...FG_FAIRIES];
  }, []);

  const fgGetFairyById = useCallback((id: string): FairyDef | null => {
    return FG_FAIRIES.find((f) => f.id === id) ?? null;
  }, []);

  const fgGetFriendships = useCallback((): FriendshipState[] => {
    return [...state.friendships];
  }, [state.friendships]);

  const fgGetFriendship = useCallback((fairyId: string): FriendshipState | null => {
    return state.friendships.find((f) => f.fairyId === fairyId) ?? null;
  }, [state.friendships]);

  const fgGetFriendshipLevel = useCallback((fairyId: string): number => {
    const f = state.friendships.find((fs) => fs.fairyId === fairyId);
    return f?.friendship ?? 0;
  }, [state.friendships]);

  const fgGiveGift = useCallback((fairyId: string, plantId: string, now: number = Date.now()): { success: boolean; friendshipGain: number; coinBonus: number; state: FairyGardenState } => {
    const fairyDef = FG_FAIRIES.find((f) => f.id === fairyId);
    if (!fairyDef) return { success: false, friendshipGain: 0, coinBonus: 0, state };

    const currentSeeds = state.seeds[plantId] ?? 0;
    if (currentSeeds < 1) return { success: false, friendshipGain: 0, coinBonus: 0, state };

    const friendshipState = state.friendships.find((f) => f.fairyId === fairyId);
    if (!friendshipState) return { success: false, friendshipGain: 0, coinBonus: 0, state };
    if (friendshipState.friendship >= fairyDef.friendshipMax) return { success: false, friendshipGain: 0, coinBonus: 0, state };

    const isFavorite = fairyDef.favoritePlants.includes(plantId);
    const baseGain = isFavorite ? 15 : 5;
    const structureFriendshipBonus = state.structures.filter((s) => s.built).reduce((acc, st) => {
      const def = FG_STRUCTURES.find((d) => d.id === st.id);
      return acc + (def?.bonusType === 'friendship' ? def.baseBonusValue * (0.5 + st.level * 0.15) : 0);
    }, 0);
    const friendshipGain = Math.floor(baseGain * (1 + structureFriendshipBonus * 0.01));
    const coinBonus = Math.floor(baseGain * fairyDef.giftMultiplier * 0.5);

    let next = state;
    setState((prev) => {
      const newSeeds = { ...prev.seeds };
      newSeeds[plantId] = (newSeeds[plantId] ?? 0) - 1;
      if (newSeeds[plantId] <= 0) delete newSeeds[plantId];

      const newFriendships = prev.friendships.map((f) =>
        f.fairyId === fairyId
          ? { ...f, friendship: Math.min(fairyDef.friendshipMax, f.friendship + friendshipGain), giftsReceived: f.giftsReceived + 1, lastGiftAt: now }
          : f
      );

      const newBefriended = newFriendships.filter((f) => f.friendship >= 50).length;
      const prevBefriended = prev.friendships.filter((f) => f.friendship >= 50).length;
      const befriendedIncrease = Math.max(0, newBefriended - prevBefriended);

      next = {
        ...prev,
        seeds: newSeeds,
        friendships: newFriendships,
        coins: fgClampCoins(prev.coins + coinBonus),
        totalEarned: prev.totalEarned + coinBonus,
        totalBefriended: prev.totalBefriended + befriendedIncrease,
      };

      next = fgProcessQuestProgress(next, 'befriend', befriendedIncrease);

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = FG_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'befriend') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }

      return next;
    });

    return { success: true, friendshipGain, coinBonus, state: next };
  }, [state]);

  const fgBlessPlant = useCallback((fairyId: string, slotId: string, now: number = Date.now()): { success: boolean; state: FairyGardenState } => {
    const friendship = state.friendships.find((f) => f.fairyId === fairyId);
    if (!friendship || friendship.friendship < 30) return { success: false, state };

    const slotIdx = state.plantSlots.findIndex((s) => s.id === slotId);
    if (slotIdx === -1) return { success: false, state };
    const slot = state.plantSlots[slotIdx];
    if (slot.plantId === null || slot.blessed) return { success: false, state };

    let next = state;
    setState((prev) => {
      const newSlots = [...prev.plantSlots];
      newSlots[slotIdx] = { ...newSlots[slotIdx], blessed: true, blessingFairyId: fairyId };
      next = { ...prev, plantSlots: newSlots };
      return next;
    });

    return { success: true, state: next };
  }, [state]);

  // ---- Structures ----

  const fgGetStructures = useCallback((): StructureDef[] => {
    return [...FG_STRUCTURES];
  }, []);

  const fgGetStructureStates = useCallback((): StructureState[] => {
    return [...state.structures];
  }, [state.structures]);

  const fgGetBuiltStructures = useCallback((): StructureState[] => {
    return state.structures.filter((s) => s.built);
  }, [state.structures]);

  const fgGetStructureLevel = useCallback((structureId: string): number => {
    const s = state.structures.find((st) => st.id === structureId);
    return s?.built ? s.level : 0;
  }, [state.structures]);

  const fgGetStructureBonus = useCallback((structureId: string): number => {
    const st = state.structures.find((s) => s.id === structureId);
    const def = FG_STRUCTURES.find((d) => d.id === structureId);
    if (!st || !def || !st.built) return 0;
    return def.baseBonusValue * (0.5 + st.level * 0.15);
  }, [state.structures]);

  const fgBuildStructure = useCallback((structureId: string): { success: boolean; cost: number; state: FairyGardenState } => {
    const def = FG_STRUCTURES.find((s) => s.id === structureId);
    if (!def) return { success: false, cost: 0, state };
    const st = state.structures.find((s) => s.id === structureId);
    if (st?.built) return { success: false, cost: 0, state };
    if (state.coins < def.baseUpgradeCost) return { success: false, cost: def.baseUpgradeCost, state };

    let next = state;
    setState((prev) => {
      const newStructures = prev.structures.map((s) =>
        s.id === structureId ? { ...s, built: true, level: 1 } : s
      );
      next = { ...prev, structures: newStructures, coins: fgClampCoins(prev.coins - def.baseUpgradeCost), totalSpent: prev.totalSpent + def.baseUpgradeCost };
      return next;
    });
    return { success: true, cost: def.baseUpgradeCost, state: next };
  }, [state]);

  const fgUpgradeStructure = useCallback((structureId: string): { success: boolean; cost: number; state: FairyGardenState } => {
    const def = FG_STRUCTURES.find((s) => s.id === structureId);
    const st = state.structures.find((s) => s.id === structureId);
    if (!def || !st || !st.built) return { success: false, cost: 0, state };
    if (st.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, st.level));
    if (state.coins < cost) return { success: false, cost, state };

    let next = state;
    setState((prev) => {
      const newStructures = prev.structures.map((s) =>
        s.id === structureId ? { ...s, level: s.level + 1 } : s
      );
      next = { ...prev, structures: newStructures, coins: fgClampCoins(prev.coins - cost), totalSpent: prev.totalSpent + cost, structureUpgradeCount: prev.structureUpgradeCount + 1 };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Nature Spirits ----

  const fgGetNatureSpirits = useCallback((): NatureSpiritDef[] => {
    return [...FG_NATURE_SPIRITS];
  }, []);

  const fgGetNatureSpiritById = useCallback((id: string): NatureSpiritDef | null => {
    return FG_NATURE_SPIRITS.find((s) => s.id === id) ?? null;
  }, []);

  // ---- Quests ----

  const fgGetQuests = useCallback((): QuestDef[] => {
    return [...FG_QUESTS];
  }, []);

  const fgGetActiveQuests = useCallback((): (QuestDef & QuestState)[] => {
    return state.activeQuests.map((aq) => {
      const def = FG_QUESTS.find((q) => q.id === aq.id);
      if (!def) return { ...aq, name: '', description: '', type: 'plant' as FgQuestType, target: 0, rewardCoins: 0, rewardXP: 0, requiredLevel: 0, emoji: '' };
      return { ...aq, ...def };
    });
  }, [state.activeQuests]);

  const fgGetAvailableQuests = useCallback((): QuestDef[] => {
    const activeIds = new Set(state.activeQuests.map((q) => q.id));
    const completedIds = new Set(state.completedQuests);
    return FG_QUESTS.filter((q) => !activeIds.has(q.id) && !completedIds.has(q.id) && state.level >= q.requiredLevel);
  }, [state.activeQuests, state.completedQuests, state.level]);

  const fgGetCompletedQuests = useCallback((): string[] => {
    return [...state.completedQuests];
  }, [state.completedQuests]);

  const fgAcceptQuest = useCallback((questId: string): { success: boolean; state: FairyGardenState } => {
    const def = FG_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.activeQuests.some((q) => q.id === questId)) return { success: false, state };
    if (state.completedQuests.includes(questId)) return { success: false, state };
    if (state.activeQuests.length >= 5) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = { ...prev, activeQuests: [...prev.activeQuests, { id: questId, accepted: true, completed: false, progress: 0 }] };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fgGetQuestProgress = useCallback((questId: string): number => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    return aq?.progress ?? 0;
  }, [state.activeQuests]);

  const fgCompleteQuest = useCallback((questId: string): { success: boolean; rewardCoins: number; rewardXP: number; state: FairyGardenState } => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    if (!aq || !aq.completed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const def = FG_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, rewardCoins: 0, rewardXP: 0, state };

    let next = state;
    setState((prev) => {
      const newActive = prev.activeQuests.filter((q) => q.id !== questId);
      let { level, xp } = prev;
      xp += def.rewardXP;
      while (level < FG_MAX_LEVEL && xp >= fgXpRequired(level)) {
        xp -= fgXpRequired(level);
        level += 1;
      }
      if (level >= FG_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        activeQuests: newActive,
        completedQuests: [...prev.completedQuests, questId],
        coins: fgClampCoins(prev.coins + def.rewardCoins),
        totalEarned: prev.totalEarned + def.rewardCoins,
        level: fgClampLevel(level),
        xp,
      };
      return next;
    });

    return { success: true, rewardCoins: def.rewardCoins, rewardXP: def.rewardXP, state: next };
  }, [state]);

  const fgAbandonQuest = useCallback((questId: string): { success: boolean; state: FairyGardenState } => {
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

  const fgGetAchievements = useCallback((): AchievementDef[] => {
    return [...FG_ACHIEVEMENTS];
  }, []);

  const fgGetUnlockedAchievements = useCallback((): AchievementState[] => {
    return state.unlockedAchievements.filter((a) => a.unlocked);
  }, [state.unlockedAchievements]);

  const fgIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    const a = state.unlockedAchievements.find((ach) => ach.id === achievementId);
    return a?.unlocked ?? false;
  }, [state.unlockedAchievements]);

  const fgCheckAchievements = useCallback((): AchievementState[] => {
    const now = Date.now();
    let next = state;
    const newlyUnlocked: AchievementState[] = [];

    setState((prev) => {
      let updated = prev;

      for (const ach of FG_ACHIEVEMENTS) {
        const currentState = updated.unlockedAchievements.find((a) => a.id === ach.id);
        if (!currentState || currentState.unlocked) continue;

        let value = 0;
        switch (ach.conditionKey) {
          case 'totalPlanted': value = updated.totalPlanted; break;
          case 'totalHarvested': value = updated.totalHarvested; break;
          case 'totalWatered': value = updated.totalWatered; break;
          case 'totalBefriended': value = updated.totalBefriended; break;
          case 'totalEarned': value = updated.totalEarned; break;
          case 'level': value = updated.level; break;
          default: value = 0; break;
        }

        if (value >= ach.targetValue) {
          newlyUnlocked.push({ id: ach.id, unlocked: true, unlockedAt: now });
          updated = {
            ...updated,
            unlockedAchievements: updated.unlockedAchievements.map((a) =>
              a.id === ach.id ? { ...a, unlocked: true, unlockedAt: now } : a
            ),
            coins: fgClampCoins(updated.coins + ach.rewardCoins),
            totalEarned: updated.totalEarned + ach.rewardCoins,
          };
          let { level, xp } = updated;
          xp += ach.rewardXP;
          while (level < FG_MAX_LEVEL && xp >= fgXpRequired(level)) {
            xp -= fgXpRequired(level);
            level += 1;
          }
          if (level >= FG_MAX_LEVEL) xp = 0;
          updated = { ...updated, level: fgClampLevel(level), xp };
        }
      }
      next = updated;
      return updated;
    });

    return newlyUnlocked;
  }, [state]);

  const fgUnlockAchievement = useCallback((achievementId: string): { success: boolean; state: FairyGardenState } => {
    const ach = FG_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) return { success: false, state };
    const current = state.unlockedAchievements.find((a) => a.id === achievementId);
    if (current?.unlocked) return { success: false, state };

    let next = state;
    const now = Date.now();
    setState((prev) => {
      let { level, xp } = prev;
      xp += ach.rewardXP;
      while (level < FG_MAX_LEVEL && xp >= fgXpRequired(level)) {
        xp -= fgXpRequired(level);
        level += 1;
      }
      if (level >= FG_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        unlockedAchievements: prev.unlockedAchievements.map((a) =>
          a.id === achievementId ? { ...a, unlocked: true, unlockedAt: now } : a
        ),
        coins: fgClampCoins(prev.coins + ach.rewardCoins),
        totalEarned: prev.totalEarned + ach.rewardCoins,
        level: fgClampLevel(level),
        xp,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Daily Tasks ----

  const fgGetDailyTask = useCallback((): DailyTaskState | null => {
    return state.dailyTask;
  }, [state.dailyTask]);

  const fgRefreshDailyTask = useCallback((now: number = Date.now()): { dailyTask: DailyTaskPoolDef | null; state: FairyGardenState } => {
    const dayKey = fgGenerateDayKey(now);

    if (state.dailyTask && state.dailyTask.dayKey === dayKey) {
      const pool = FG_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
      return { dailyTask: pool ?? null, state };
    }

    const daySeed = fgHashString(dayKey) & 0x7fffffff;
    const rng = mulberry32(daySeed);
    const taskIndex = Math.floor(rng() * FG_DAILY_TASK_POOL.length);
    const task = FG_DAILY_TASK_POOL[taskIndex];

    const yesterdayKey = fgGenerateDayKey(now - 86400000);
    const newStreak = state.lastDaily === yesterdayKey ? state.dailyStreak + 1 : (state.lastDaily === dayKey ? state.dailyStreak : 1);

    let next = state;
    setState((prev) => {
      next = { ...prev, dailyTask: { poolId: task.id, progress: 0, claimed: false, dayKey }, dailyStreak: newStreak, lastDaily: dayKey };
      return next;
    });

    return { dailyTask: task, state: next };
  }, [state]);

  const fgClaimDailyReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: FairyGardenState } => {
    if (!state.dailyTask || state.dailyTask.claimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const poolDef = FG_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask.poolId);
    if (!poolDef) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    if (state.dailyTask.progress < poolDef.target) return { success: false, rewardCoins: 0, rewardXP: 0, state };

    const streakBonus = 1 + state.dailyStreak * 0.05;
    const rewardCoins = Math.floor(poolDef.rewardCoins * streakBonus);
    const rewardXP = Math.floor(poolDef.rewardXP * streakBonus);

    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += rewardXP;
      while (level < FG_MAX_LEVEL && xp >= fgXpRequired(level)) {
        xp -= fgXpRequired(level);
        level += 1;
      }
      if (level >= FG_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        dailyTask: { ...prev.dailyTask!, claimed: true },
        coins: fgClampCoins(prev.coins + rewardCoins),
        totalEarned: prev.totalEarned + rewardCoins,
        level: fgClampLevel(level),
        xp,
      };
      return next;
    });

    return { success: true, rewardCoins, rewardXP, state: next };
  }, [state]);

  const fgGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  const fgGetLastDaily = useCallback((): string | null => {
    return state.lastDaily;
  }, [state.lastDaily]);

  // ---- Garden Show ----

  const fgEnterGardenShow = useCallback((slotId: string, now: number = Date.now()): { success: boolean; rank: number; prize: number; state: FairyGardenState } => {
    const slot = state.plantSlots.find((s) => s.id === slotId);
    if (!slot || slot.plantId === null) return { success: false, rank: 0, prize: 0, state };

    const plant = FG_PLANTS.find((p) => p.id === slot.plantId);
    if (!plant) return { success: false, rank: 0, prize: 0, state };

    const contestSeed = fgHashString(`show_${now}_${state.seed}`);
    const rng = mulberry32(contestSeed);

    const zoneBonus = fgGetZoneHarvestBonus(slot.zoneId) + fgGetZoneGrowthBonus(slot.zoneId);
    const blessingBonus = slot.blessed ? 20 : 0;
    const structureQuality = state.structures.filter((s) => s.built).reduce((acc, st) => {
      const def = FG_STRUCTURES.find((d) => d.id === st.id);
      return acc + (def?.bonusType === 'quality' ? def.baseBonusValue * (0.5 + st.level * 0.15) : 0);
    }, 0);
    const structureLuck = state.structures.filter((s) => s.built).reduce((acc, st) => {
      const def = FG_STRUCTURES.find((d) => d.id === st.id);
      return acc + (def?.bonusType === 'luck' ? def.baseBonusValue * (0.5 + st.level * 0.15) : 0);
    }, 0);

    const baseScore = 40 + zoneBonus + blessingBonus + structureQuality + fgRarityMultiplier(plant.rarity) * 10;
    const myScore = baseScore + rng() * 20 + structureLuck * 2;

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
        gardenShowEntries: prev.gardenShowEntries + 1,
        gardenShowWins: prev.gardenShowWins + (isWin ? 1 : 0),
        gardenShowLastRank: rank,
        coins: fgClampCoins(prev.coins + prize),
        totalEarned: prev.totalEarned + prize,
      };

      const participationXP = Math.floor(plant.xpReward * 0.5);
      let { level, xp } = next;
      xp += participationXP;
      while (level < FG_MAX_LEVEL && xp >= fgXpRequired(level)) {
        xp -= fgXpRequired(level);
        level += 1;
      }
      if (level >= FG_MAX_LEVEL) xp = 0;
      next = { ...next, level: fgClampLevel(level), xp };
      return next;
    });

    return { success: true, rank, prize, state: next };
  }, [state, fgGetZoneHarvestBonus, fgGetZoneGrowthBonus]);

  const fgGetGardenShowStats = useCallback((): { entries: number; wins: number; winRate: number; lastRank: number | null } => {
    return {
      entries: state.gardenShowEntries,
      wins: state.gardenShowWins,
      winRate: state.gardenShowEntries > 0 ? state.gardenShowWins / state.gardenShowEntries : 0,
      lastRank: state.gardenShowLastRank,
    };
  }, [state]);

  // ---- Stats ----

  const fgGetStats = useCallback(() => {
    return {
      totalPlanted: state.totalPlanted,
      totalHarvested: state.totalHarvested,
      totalWatered: state.totalWatered,
      totalBefriended: state.totalBefriended,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      profit: state.totalEarned - state.totalSpent,
      dailyStreak: state.dailyStreak,
      gardenShowEntries: state.gardenShowEntries,
      gardenShowWins: state.gardenShowWins,
      unlockedPlantCount: state.unlockedPlants.length,
      totalPlantCount: FG_PLANTS.length,
      questsCompleted: state.completedQuests.length,
      achievementsUnlocked: state.unlockedAchievements.filter((a) => a.unlocked).length,
      structureUpgradeCount: state.structureUpgradeCount,
      hybridsDiscovered: state.hybridRecords.filter((h) => h.discovered).length,
      totalHybrids: state.hybridRecords.length,
    };
  }, [state]);

  const fgGetTotalHarvested = useCallback((): number => {
    return state.totalHarvested;
  }, [state.totalHarvested]);

  const fgGetEarnedCoins = useCallback((): number => {
    return state.totalEarned;
  }, [state.totalEarned]);

  const fgGetProfit = useCallback((): number => {
    return state.totalEarned - state.totalSpent;
  }, [state.totalEarned, state.totalSpent]);

  // ---- NPCs ----

  const fgGetNPCs = useCallback((): NPCDef[] => {
    return [...FG_NPCS];
  }, []);

  const fgGetNPCById = useCallback((id: string): NPCDef | null => {
    return FG_NPCS.find((n) => n.id === id) ?? null;
  }, []);

  // ---- Rarity Info ----

  const fgGetRarityInfo = useCallback((rarity: FgRarity): RarityInfo | null => {
    return FG_RARITIES.find((r) => r.key === rarity) ?? null;
  }, []);

  const fgGetAllRarities = useCallback((): RarityInfo[] => {
    return [...FG_RARITIES];
  }, []);

  // ---- Extended Utilities ----

  const fgGetGardenSummary = useCallback((): {
    gardenName: string;
    level: number;
    title: TitleInfo;
    coins: number;
    xp: number;
    xpTillNext: number;
    progress: number;
    plantsUnlocked: number;
    plantsTotal: number;
    zonesExplored: number;
    fairiesBefriended: number;
    totalHarvested: number;
    hybridsDiscovered: number;
    dailyStreak: number;
    gardenShowWins: number;
    netWorth: number;
  } => {
    const title = (() => {
      let current = FG_TITLE_THRESHOLDS[0];
      for (const t of FG_TITLE_THRESHOLDS) {
        if (state.level >= t.levelRequired) current = t;
      }
      return current;
    })();
    const seedValue = Object.entries(state.seeds).reduce((sum, [id, qty]) => {
      const def = FG_PLANTS.find((p) => p.id === id);
      return sum + (def?.seedCost ?? 0) * qty;
    }, 0);
    const zonesExplored = FG_ZONES.filter((z) => state.plantSlots.some((s) => s.zoneId === z.id && s.plantId !== null)).length;
    const fairiesBefriended = state.friendships.filter((f) => f.friendship >= 50).length;
    const hybridsDiscovered = state.hybridRecords.filter((h) => h.discovered).length;
    return {
      gardenName: 'Fairy Garden',
      level: state.level,
      title,
      coins: state.coins,
      xp: state.xp,
      xpTillNext: fgXpRequired(state.level),
      progress: fgXpRequired(state.level) > 0 ? state.xp / fgXpRequired(state.level) : 1,
      plantsUnlocked: state.unlockedPlants.length,
      plantsTotal: FG_PLANTS.length,
      zonesExplored,
      fairiesBefriended,
      totalHarvested: state.totalHarvested,
      hybridsDiscovered,
      dailyStreak: state.dailyStreak,
      gardenShowWins: state.gardenShowWins,
      netWorth: state.coins + seedValue,
    };
  }, [state]);

  const fgGetGardenTips = useCallback((): string[] => {
    const tips: string[] = [];

    const lockedPlants = FG_PLANTS.filter(
      (p) => !state.unlockedPlants.includes(p.id) && state.level >= p.requiredLevel
    ).length;
    if (lockedPlants > 0) {
      tips.push(`You have ${lockedPlants} new plant(s) available to unlock at your current level!`);
    }

    const emptySlots = state.plantSlots.filter((s) => s.plantId === null).length;
    if (emptySlots > 4) {
      tips.push('Your garden has many empty plots — plant more seeds to maximize your harvests!');
    }

    const waterableSlots = state.plantSlots.filter((s) => s.plantId !== null && !s.watered && s.growthStage !== 'harvest_ready').length;
    if (waterableSlots > 0) {
      tips.push(`${waterableSlots} plant(s) could benefit from watering — it reduces grow time by 15%!`);
    }

    const unblessedSlots = state.plantSlots.filter((s) => s.plantId !== null && !s.blessed).length;
    const befriendedFairies = state.friendships.filter((f) => f.friendship >= 30);
    if (unblessedSlots > 0 && befriendedFairies.length > 0) {
      tips.push(`You have ${befriendedFairies.length} fairy friend(s) with friendship 30+ — ask them to bless your plants!`);
    }

    if (state.dailyStreak > 0 && state.dailyStreak % 7 === 0) {
      tips.push(`Amazing ${state.dailyStreak}-day streak! Daily rewards get a ${Math.floor(state.dailyStreak * 5)}% bonus!`);
    }

    const undiscoveredHybrids = state.hybridRecords.filter((h) => !h.discovered).length;
    if (undiscoveredHybrids > 0) {
      tips.push(`${undiscoveredHybrids} hybrid combination(s) remain undiscovered — try cross-pollination!`);
    }

    const completableQuests = state.activeQuests.filter((q) => q.completed);
    if (completableQuests.length > 0) {
      tips.push(`You have ${completableQuests.length} quest(s) ready to claim rewards for!`);
    }

    if (state.level < 10) {
      tips.push('Keep planting and harvesting to level up! Higher levels unlock rarer plants and new zones.');
    } else if (state.level >= 40) {
      tips.push('You are approaching the rank of Archdruid! The rarest mythic plants await you.');
    }

    if (tips.length === 0) {
      tips.push('Your fairy garden is flourishing beautifully! Keep tending to your magical plants.');
    }

    return tips;
  }, [state]);

  const fgGetBestPlantForZone = useCallback(
    (zoneId: string): PlantDef | null => {
      const plants = FG_PLANTS.filter(
        (p) => p.zoneId === zoneId && state.unlockedPlants.includes(p.id) && state.level >= p.requiredLevel
      );
      if (plants.length === 0) return null;
      const growthMult = 1 + fgGetZoneGrowthBonus(zoneId) * 0.01;
      const harvestMult = 1 + fgGetZoneHarvestBonus(zoneId) * 0.01;
      return plants.reduce((best, plant) => {
        const adjustedTime = Math.max(10, plant.growTime / growthMult);
        const adjustedValue = Math.floor(plant.harvestValue * harvestMult * fgRarityMultiplier(plant.rarity));
        const profitPerSec = adjustedValue / (adjustedTime / 60);
        const bestTime = Math.max(10, best.growTime / growthMult);
        const bestValue = Math.floor(best.harvestValue * harvestMult * fgRarityMultiplier(best.rarity));
        const bestProfit = bestValue / (bestTime / 60);
        return profitPerSec > bestProfit ? plant : best;
      });
    },
    [state.unlockedPlants, state.level, fgGetZoneGrowthBonus, fgGetZoneHarvestBonus]
  );

  const fgGetMostValuablePlant = useCallback((): PlantDef | null => {
    const unlocked = FG_PLANTS.filter((p) => state.unlockedPlants.includes(p.id) && state.level >= p.requiredLevel);
    if (unlocked.length === 0) return null;
    return unlocked.reduce((best, plant) => (plant.harvestValue * fgRarityMultiplier(plant.rarity) > best.harvestValue * fgRarityMultiplier(best.rarity) ? plant : best));
  }, [state.unlockedPlants, state.level]);

  const fgGetAffordablePlants = useCallback((): PlantDef[] => {
    return FG_PLANTS.filter((p) => {
      if (!state.unlockedPlants.includes(p.id)) return false;
      if (state.level < p.requiredLevel) return false;
      return state.coins >= p.seedCost;
    });
  }, [state.unlockedPlants, state.level, state.coins]);

  const fgGetPlantablePlants = useCallback((): PlantDef[] => {
    return FG_PLANTS.filter((p) => {
      if (!state.unlockedPlants.includes(p.id)) return false;
      if (state.level < p.requiredLevel) return false;
      return (state.seeds[p.id] ?? 0) > 0 && state.plantSlots.some((s) => s.zoneId === p.zoneId && s.plantId === null);
    });
  }, [state.unlockedPlants, state.level, state.seeds, state.plantSlots]);

  const fgCalculatePlantEfficiency = useCallback(
    (plantId: string): { coinsPerSecond: number; xpPerSecond: number; overallScore: number } => {
      const plant = FG_PLANTS.find((p) => p.id === plantId);
      if (!plant) return { coinsPerSecond: 0, xpPerSecond: 0, overallScore: 0 };

      const growthMult = 1 + fgGetZoneGrowthBonus(plant.zoneId) * 0.01;
      const adjustedTime = Math.max(1, plant.growTime / growthMult);

      const coinsPerSecond = plant.harvestValue / adjustedTime;
      const xpPerSecond = plant.xpReward / adjustedTime;
      const overallScore = coinsPerSecond + xpPerSecond * 2;

      return { coinsPerSecond: Math.round(coinsPerSecond * 100) / 100, xpPerSecond: Math.round(xpPerSecond * 100) / 100, overallScore: Math.round(overallScore * 100) / 100 };
    },
    [fgGetZoneGrowthBonus]
  );

  const fgGetRecommendedUpgrades = useCallback(
    (budget: number): { type: 'structure' | 'zone'; id: string; name: string; cost: number; priority: number }[] => {
      const recommendations: { type: 'structure'; id: string; name: string; cost: number; priority: number }[] = [];

      for (const st of state.structures) {
        const def = FG_STRUCTURES.find((d) => d.id === st.id);
        if (!def) continue;
        if (!st.built) {
          if (def.baseUpgradeCost > budget) continue;
          const priority = 8 + def.baseBonusValue * 2;
          recommendations.push({ type: 'structure', id: st.id, name: def.name, cost: def.baseUpgradeCost, priority });
        } else if (st.level < def.maxLevel) {
          const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, st.level));
          if (cost > budget) continue;
          const priority = (def.maxLevel - st.level) * 2 + def.baseBonusValue;
          recommendations.push({ type: 'structure', id: st.id, name: def.name, cost, priority });
        }
      }

      recommendations.sort((a, b) => b.priority - a.priority);
      return recommendations;
    },
    [state.structures]
  );

  const fgSimulateHarvest = useCallback(
    (plantId: string): {
      plant: PlantDef | null;
      estimatedTime: number;
      estimatedCoins: number;
      estimatedXP: number;
      hasSeed: boolean;
      hasSlot: boolean;
      zoneId: string | null;
    } => {
      const plant = FG_PLANTS.find((p) => p.id === plantId);
      if (!plant) return { plant: null, estimatedTime: 0, estimatedCoins: 0, estimatedXP: 0, hasSeed: false, hasSlot: false, zoneId: null };
      if (!state.unlockedPlants.includes(plantId)) return { plant, estimatedTime: 0, estimatedCoins: 0, estimatedXP: 0, hasSeed: false, hasSlot: false, zoneId: plant.zoneId };

      const growthMult = 1 + fgGetZoneGrowthBonus(plant.zoneId) * 0.01;
      const harvestMult = 1 + fgGetZoneHarvestBonus(plant.zoneId) * 0.01;
      const adjustedTime = Math.max(10, Math.floor(plant.growTime / growthMult));
      const estimatedCoins = Math.floor(plant.harvestValue * harvestMult * fgRarityMultiplier(plant.rarity));
      const estimatedXP = Math.floor(plant.xpReward * fgRarityMultiplier(plant.rarity));
      const hasSeed = (state.seeds[plantId] ?? 0) > 0;
      const hasSlot = state.plantSlots.some((s) => s.zoneId === plant.zoneId && s.plantId === null);

      return { plant, estimatedTime: adjustedTime, estimatedCoins, estimatedXP, hasSeed, hasSlot, zoneId: plant.zoneId };
    },
    [state.unlockedPlants, state.seeds, state.plantSlots, fgGetZoneGrowthBonus, fgGetZoneHarvestBonus]
  );

  const fgGetPlantRarityDistribution = useCallback((): Record<FgRarity, number> => {
    return { ...state.harvestCountByRarity };
  }, [state.harvestCountByRarity]);

  const fgGetInventoryValue = useCallback((): number => {
    return Object.entries(state.seeds).reduce((sum, [id, qty]) => {
      const def = FG_PLANTS.find((p) => p.id === id);
      return sum + (def?.seedCost ?? 0) * qty;
    }, 0);
  }, [state.seeds]);

  const fgGetNetWorth = useCallback((): number => {
    return state.coins + fgGetInventoryValue();
  }, [state.coins, fgGetInventoryValue]);

  return {
    // Core
    fgGetState,
    fgResetState,
    fgSeed,
    fgRandom,
    fgRandomInt,
    fgRandomChoice,
    // Level / XP
    fgGetLevel,
    fgGetXP,
    fgGetXPTillNext,
    fgAddXP,
    // Title
    fgGetTitle,
    fgGetAllTitles,
    fgGetNextTitle,
    // Progress
    fgGetProgress,
    fgGetOverallProgress,
    // Coins
    fgGetCoins,
    fgAddCoins,
    fgSpendCoins,
    fgCanAfford,
    // Plants
    fgGetPlants,
    fgGetPlantById,
    fgGetUnlockedPlants,
    fgGetLockedPlants,
    fgIsPlantUnlocked,
    fgUnlockPlant,
    fgGetPlantsByRarity,
    fgGetPlantsByZone,
    // Seeds
    fgGetSeeds,
    fgGetSeedCount,
    fgGetSeedCost,
    fgBuySeeds,
    fgUseSeed,
    // Zones
    fgGetZones,
    fgGetZoneById,
    fgGetActiveZone,
    fgSetActiveZone,
    fgGetZoneGrowthBonus,
    fgGetZoneHarvestBonus,
    fgGetSlotsForZone,
    fgGetEmptySlots,
    fgGetUsedSlots,
    // Planting
    fgPlant,
    fgWater,
    fgGetPlantGrowthProgress,
    fgHarvest,
    fgGetHarvestableSlots,
    fgGetGrowingSlots,
    fgGetFlowers,
    // Cross-Pollination
    fgCheckPollination,
    fgGetHybridRecords,
    fgGetDiscoveredHybrids,
    fgGetUndiscoveredHybrids,
    fgGetHybridRecipeFor,
    // Fairies
    fgGetFairies,
    fgGetFairyById,
    fgGetFriendships,
    fgGetFriendship,
    fgGetFriendshipLevel,
    fgGiveGift,
    fgBlessPlant,
    // Nature Spirits
    fgGetNatureSpirits,
    fgGetNatureSpiritById,
    // Structures
    fgGetStructures,
    fgGetStructureStates,
    fgGetBuiltStructures,
    fgGetStructureLevel,
    fgGetStructureBonus,
    fgBuildStructure,
    fgUpgradeStructure,
    // Quests
    fgGetQuests,
    fgGetActiveQuests,
    fgGetAvailableQuests,
    fgGetCompletedQuests,
    fgAcceptQuest,
    fgGetQuestProgress,
    fgCompleteQuest,
    fgAbandonQuest,
    // Achievements
    fgGetAchievements,
    fgGetUnlockedAchievements,
    fgIsAchievementUnlocked,
    fgCheckAchievements,
    fgUnlockAchievement,
    // Daily
    fgGetDailyTask,
    fgRefreshDailyTask,
    fgClaimDailyReward,
    fgGetDailyStreak,
    fgGetLastDaily,
    // Garden Show
    fgEnterGardenShow,
    fgGetGardenShowStats,
    // Stats
    fgGetStats,
    fgGetTotalHarvested,
    fgGetEarnedCoins,
    fgGetProfit,
    // NPCs
    fgGetNPCs,
    fgGetNPCById,
    // Rarity
    fgGetRarityInfo,
    fgGetAllRarities,
    // Extended
    fgGetGardenSummary,
    fgGetGardenTips,
    fgGetBestPlantForZone,
    fgGetMostValuablePlant,
    fgGetAffordablePlants,
    fgGetPlantablePlants,
    fgCalculatePlantEfficiency,
    fgGetRecommendedUpgrades,
    fgSimulateHarvest,
    fgGetPlantRarityDistribution,
    fgGetInventoryValue,
    fgGetNetWorth,
  };
}

// ============================================================
// Internal Quest Progress Helper (not exported)
// ============================================================

function fgProcessQuestProgress(
  state: FairyGardenState,
  type: FgQuestType,
  amount: number
): FairyGardenState {
  let updated = state;
  for (const aq of updated.activeQuests) {
    if (aq.completed) continue;
    const def = FG_QUESTS.find((q) => q.id === aq.id);
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
