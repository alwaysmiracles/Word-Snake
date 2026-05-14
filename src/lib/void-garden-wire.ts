import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { persist } from 'zustand/middleware';

// ============================================================
// Void Garden — Cosmic Garden Cultivation Wire
// ============================================================

// ============================================================
// Types
// ============================================================

export type VgRarity = 'common' | 'unusual' | 'rare' | 'epic' | 'legendary';

export type VgVoidType = 'shadow' | 'cosmic' | 'nebula' | 'stellar' | 'dimensional' | 'abyssal' | 'astral' | 'quantum';

export type VgRealmType = 'meadow' | 'nursery' | 'grove' | 'sanctum' | 'voidpit' | 'observatory' | 'nexus' | 'genesis';

export type VgDailyQuestType = 'plant' | 'crosspollinate' | 'prune' | 'harvest' | 'feed' | 'explore';

export interface VgPlantDef {
  id: string;
  name: string;
  rarity: VgRarity;
  voidType: VgVoidType;
  description: string;
  emoji: string;
  cosmicPower: number;
  growthSpeed: number;
  realmId: string;
  requiredLevel: number;
}

export interface VgRealmDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockLevel: number;
  baseGrowRate: number;
  plantList: string[];
  essenceList: string[];
}

export interface VgEssenceDef {
  id: string;
  name: string;
  rarity: VgRarity;
  description: string;
  emoji: string;
  gatherXp: number;
  realmId: string;
  voidEnergy: number;
}

export interface VgStructureDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  bonusType: string;
  bonusPerLevel: number;
  requiredLevel: number;
}

export interface VgAbilityDef {
  id: string;
  name: string;
  rarity: VgRarity;
  description: string;
  emoji: string;
  voidCost: number;
  cooldown: number;
  xpReward: number;
  requiredLevel: number;
  effect: string;
}

export interface VgAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXp: number;
  emoji: string;
}

export interface VgTitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface VgRarityInfo {
  key: VgRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface VgColorTheme {
  voidBlack: string;
  cosmicPurple: string;
  nebulaPink: string;
  starlightGold: string;
  dimensionTeal: string;
  eclipseSilver: string;
}

export interface VgPlantState {
  planted: boolean;
  count: number;
  fullyGrown: boolean;
  harvestedCount: number;
  plantedAt: number | null;
}

export interface VgRealmState {
  explored: boolean;
  level: number;
  plantedCount: number;
  harvestedCount: number;
  plantsDiscovered: number;
  unlockedAt: number | null;
}

export interface VgAbilityState {
  learned: boolean;
  castCount: number;
  cooldownEnd: number;
}

export interface VgStructureState {
  level: number;
  built: boolean;
  lastUpgradedAt: number | null;
}

export interface VgAchievementState {
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface VgDailyQuestState {
  lastDate: string | null;
  streak: number;
  completed: boolean;
  questType: VgDailyQuestType | null;
  questProgress: number;
  questTarget: number;
  rewardClaimed: boolean;
}

export interface VgPlantedPlot {
  id: string;
  plantId: string;
  realmId: string;
  plantedAt: number;
  growth: number;
  health: number;
  nourished: boolean;
  lastNourishedAt: number | null;
  crossPollinated: boolean;
}

export interface VgTotals {
  totalPlanted: number;
  totalHarvested: number;
  totalCrossPollinated: number;
  totalPruned: number;
  totalStructuresBuilt: number;
  totalAbilitiesCast: number;
  totalEssencesGathered: number;
  totalRealmsExplored: number;
  totalCosmicEnergySpent: number;
}

export interface VoidGardenState {
  level: number;
  xp: number;
  coins: number;
  title: string;
  voidEnergy: number;
  maxVoidEnergy: number;
  plants: Record<string, VgPlantState>;
  realms: Record<string, VgRealmState>;
  essences: Record<string, number>;
  structures: Record<string, VgStructureState>;
  abilities: Record<string, VgAbilityState>;
  plantedPlots: VgPlantedPlot[];
  achievements: Record<string, VgAchievementState>;
  dailyQuest: VgDailyQuestState;
  totals: VgTotals;
  seed: number;
}

// ============================================================
// Seeded PRNG
// ============================================================

function vgMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================
// Helper Functions
// ============================================================

export const VG_MAX_LEVEL = 50;

function vgXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= VG_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function vgClampLevel(lvl: number): number {
  return Math.max(1, Math.min(VG_MAX_LEVEL, lvl));
}

function vgClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function vgClampEnergy(e: number, max: number): number {
  return Math.max(0, Math.min(max, Math.floor(e)));
}

function vgGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function vgRarityMultiplier(r: VgRarity): number {
  const map: Record<VgRarity, number> = {
    common: 1,
    unusual: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
  };
  return map[r] ?? 1;
}

function vgMakeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// ============================================================
// Constants
// ============================================================

export const VG_COLOR_THEME: VgColorTheme = {
  voidBlack: '#0A0A12',
  cosmicPurple: '#7B2FBE',
  nebulaPink: '#E91E8C',
  starlightGold: '#FFD700',
  dimensionTeal: '#14B8A6',
  eclipseSilver: '#A8A9C0',
};

export const VG_RARITIES: VgRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'unusual', label: 'Unusual', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#C084FC', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
];

export const VG_TITLES: VgTitleInfo[] = [
  { name: 'Void Seedling', levelRequired: 1, description: 'A fragile sprout emerging from the infinite darkness of the void' },
  { name: 'Cosmic Sprout', levelRequired: 5, description: 'Your roots have tasted the cosmic energy of interdimensional soil' },
  { name: 'Nebula Cultivator', levelRequired: 10, description: 'Nebula dust clings to your fingertips as you shape reality itself' },
  { name: 'Astral Gardener', levelRequired: 18, description: 'You tend flowers that bloom between the folds of spacetime' },
  { name: 'Dimensional Botanist', levelRequired: 25, description: 'Your knowledge of void flora spans across ten dimensions' },
  { name: 'Stellar Horticulturist', levelRequired: 33, description: 'Stars bend to your will as you cultivate celestial gardens' },
  { name: 'Cosmic Harvest Lord', levelRequired: 42, description: 'You command the harvest of realities, reaping worlds like wheat' },
  { name: 'Cosmic Gardener', levelRequired: 50, description: 'The void itself bends to your garden — master of all cosmic cultivation' },
];

export const VG_REALMS: VgRealmDef[] = [
  {
    id: 'void_meadow',
    name: 'Void Meadow',
    description: 'A serene expanse of translucent grass where void seeds first take root',
    emoji: '🌌',
    unlockLevel: 1,
    baseGrowRate: 0.7,
    plantList: ['shadow_lily', 'void_dandelion', 'dark_rose', 'null_clover', 'echo_violet', 'hollow_buttercup', 'drift_iris'],
    essenceList: ['void_dew', 'null_powder', 'dark_humus'],
  },
  {
    id: 'cosmic_nursery',
    name: 'Cosmic Nursery',
    description: 'A protected cradle of nebulonic energy where rare seedlings are nurtured',
    emoji: '🌸',
    unlockLevel: 5,
    baseGrowRate: 0.65,
    plantList: ['cosmic_orchid', 'starlight_tulip', 'nebula_cactus', 'aurora_bonsai', 'pulsar_carnation'],
    essenceList: ['stardust_soil', 'nebula_mist', 'solar_compost'],
  },
  {
    id: 'dimensional_grove',
    name: 'Dimensional Grove',
    description: 'A shimmering forest where trees grow sideways through dimensional rifts',
    emoji: '🌳',
    unlockLevel: 10,
    baseGrowRate: 0.75,
    plantList: ['rift_willow', 'portal_oak', 'shard_maple', 'twilight_ash', 'void_birch'],
    essenceList: ['dimension_fiber', 'rift_resin', 'portal_nectar'],
  },
  {
    id: 'stellar_sanctum',
    name: 'Stellar Sanctum',
    description: 'A sacred garden bathed in the light of dying stars, home to celestial flora',
    emoji: '✨',
    unlockLevel: 18,
    baseGrowRate: 0.6,
    plantList: ['supernova_sunflower', 'constellation_ivy', 'pulsar_peony', 'quasar_rose'],
    essenceList: ['starlight_essence', 'solar_flare_sap', 'nova_bloom_extract'],
  },
  {
    id: 'abyssal_void_pit',
    name: 'Abyssal Void Pit',
    description: 'A terrifying chasm of pure emptiness where the most dangerous plants thrive',
    emoji: '🕳️',
    unlockLevel: 25,
    baseGrowRate: 0.5,
    plantList: ['abyss_lotus', 'null_thorn', 'devouring_vine', 'entropy_blossom'],
    essenceList: ['abyssal_sludge', 'entropy_resin', 'null_core_fragment'],
  },
  {
    id: 'astral_observatory',
    name: 'Astral Observatory',
    description: 'An ancient observatory overgrown with plants that read the cosmic tapestry',
    emoji: '🔭',
    unlockLevel: 33,
    baseGrowRate: 0.55,
    plantList: ['cosmic_fern', 'timeline_tree', 'fate_weed', 'destiny_moss'],
    essenceList: ['astral_dewdrop', 'time_sand_powder', 'fate_thread'],
  },
  {
    id: 'quantum_nexus',
    name: 'Quantum Nexus',
    description: 'A garden that exists in all possible states simultaneously, where impossibility blooms',
    emoji: '⚛️',
    unlockLevel: 40,
    baseGrowRate: 0.45,
    plantList: ['probability_petal', 'superposition_shrub', 'quantum_cactus'],
    essenceList: ['quantum_soil', 'probability_dust', 'wave_compost'],
  },
  {
    id: 'genesis_garden',
    name: 'Genesis Garden',
    description: 'The origin point of all void gardens — where creation itself first sprouted',
    emoji: '🌱',
    unlockLevel: 45,
    baseGrowRate: 0.4,
    plantList: ['genesis_seedling', 'omni_bloom', 'eternal_rose'],
    essenceList: ['genesis_dew', 'creation_soil', 'origin_spark'],
  },
];

export const VG_PLANTS: VgPlantDef[] = [
  // Common (8)
  { id: 'shadow_lily', name: 'Shadow Lily', rarity: 'common', voidType: 'shadow', description: 'A lily that absorbs ambient darkness and converts it into faint luminescence', emoji: '🌑', cosmicPower: 8, growthSpeed: 1.2, realmId: 'void_meadow', requiredLevel: 1 },
  { id: 'void_dandelion', name: 'Void Dandelion', rarity: 'common', voidType: 'dimensional', description: 'Its seeds float between dimensions, occasionally vanishing and reappearing', emoji: '🌼', cosmicPower: 6, growthSpeed: 1.4, realmId: 'void_meadow', requiredLevel: 1 },
  { id: 'dark_rose', name: 'Dark Rose', rarity: 'common', voidType: 'shadow', description: 'Thorns made of solidified void energy — handle with care', emoji: '🥀', cosmicPower: 10, growthSpeed: 1.0, realmId: 'void_meadow', requiredLevel: 1 },
  { id: 'null_clover', name: 'Null Clover', rarity: 'common', voidType: 'abyssal', description: 'Each leaf represents a different universe — finding four is cosmically improbable', emoji: '☘️', cosmicPower: 7, growthSpeed: 1.3, realmId: 'void_meadow', requiredLevel: 1 },
  { id: 'echo_violet', name: 'Echo Violet', rarity: 'common', voidType: 'cosmic', description: 'Its petals vibrate with residual echoes from parallel dimensions', emoji: '💜', cosmicPower: 9, growthSpeed: 1.1, realmId: 'void_meadow', requiredLevel: 1 },
  { id: 'hollow_buttercup', name: 'Hollow Buttercup', rarity: 'common', voidType: 'stellar', description: 'Bright golden flowers with centers that contain miniature black holes', emoji: '🌼', cosmicPower: 8, growthSpeed: 1.2, realmId: 'void_meadow', requiredLevel: 1 },
  { id: 'void_tulip', name: 'Void Tulip', rarity: 'common', voidType: 'dimensional', description: 'A tulip whose petals open into tiny voids that absorb stray light', emoji: '🌷', cosmicPower: 7, growthSpeed: 1.3, realmId: 'void_meadow', requiredLevel: 1 },
  { id: 'dark_thistle', name: 'Dark Thistle', rarity: 'common', voidType: 'abyssal', description: 'A prickly thistle that feeds on ambient void radiation', emoji: '🌾', cosmicPower: 9, growthSpeed: 1.1, realmId: 'void_meadow', requiredLevel: 1 },
  { id: 'drift_iris', name: 'Drift Iris', rarity: 'common', voidType: 'dimensional', description: 'Its roots anchor across multiple planes of existence simultaneously', emoji: '🪻', cosmicPower: 7, growthSpeed: 1.3, realmId: 'void_meadow', requiredLevel: 1 },
  // Unusual (7)
  { id: 'cosmic_orchid', name: 'Cosmic Orchid', rarity: 'unusual', voidType: 'cosmic', description: 'An orchid whose blooms contain swirling miniature nebulae', emoji: '🌺', cosmicPower: 22, growthSpeed: 0.9, realmId: 'cosmic_nursery', requiredLevel: 5 },
  { id: 'starlight_tulip', name: 'Starlight Tulip', rarity: 'unusual', voidType: 'stellar', description: 'Glows with captured starlight that intensifies during meteor showers', emoji: '🌷', cosmicPower: 20, growthSpeed: 1.0, realmId: 'cosmic_nursery', requiredLevel: 5 },
  { id: 'nebula_cactus', name: 'Nebula Cactus', rarity: 'unusual', voidType: 'nebula', description: 'A resilient cactus that stores compressed nebula gas within its spines', emoji: '🌵', cosmicPower: 18, growthSpeed: 1.1, realmId: 'cosmic_nursery', requiredLevel: 5 },
  { id: 'aurora_bonsai', name: 'Aurora Bonsai', rarity: 'unusual', voidType: 'cosmic', description: 'A miniature tree that displays aurora-like light shows on its leaves', emoji: '🌳', cosmicPower: 25, growthSpeed: 0.7, realmId: 'cosmic_nursery', requiredLevel: 5 },
  { id: 'pulsar_carnation', name: 'Pulsar Carnation', rarity: 'unusual', voidType: 'stellar', description: 'Rhythmically pulses with energy like a distant pulsar beacon', emoji: '🏵️', cosmicPower: 21, growthSpeed: 0.85, realmId: 'cosmic_nursery', requiredLevel: 8 },
  { id: 'void_sunflower', name: 'Void Sunflower', rarity: 'unusual', voidType: 'cosmic', description: 'Always faces the nearest dimensional rift, absorbing cross-dimensional light', emoji: '🌻', cosmicPower: 19, growthSpeed: 0.95, realmId: 'cosmic_nursery', requiredLevel: 8 },
  // Rare (7)
  { id: 'rift_willow', name: 'Rift Willow', rarity: 'rare', voidType: 'dimensional', description: 'A weeping willow whose tears open tiny dimensional rifts when they hit the ground', emoji: '🌿', cosmicPower: 45, growthSpeed: 0.6, realmId: 'dimensional_grove', requiredLevel: 12 },
  { id: 'portal_oak', name: 'Portal Oak', rarity: 'rare', voidType: 'dimensional', description: 'Its trunk contains a stable portal to a pocket dimension of infinite soil', emoji: '🌲', cosmicPower: 50, growthSpeed: 0.5, realmId: 'dimensional_grove', requiredLevel: 15 },
  { id: 'shard_maple', name: 'Shard Maple', rarity: 'rare', voidType: 'quantum', description: 'Its leaves are crystalline shards that refract reality into multiple spectrums', emoji: '🍁', cosmicPower: 42, growthSpeed: 0.65, realmId: 'dimensional_grove', requiredLevel: 12 },
  { id: 'twilight_ash', name: 'Twilight Ash', rarity: 'rare', voidType: 'shadow', description: 'An ash tree that grows in perpetual twilight, casting no shadow of its own', emoji: '🪵', cosmicPower: 48, growthSpeed: 0.55, realmId: 'dimensional_grove', requiredLevel: 15 },
  { id: 'void_birch', name: 'Void Birch', rarity: 'rare', voidType: 'abyssal', description: 'White bark that absorbs all light — its hollow trunk leads to the void', emoji: '🌳', cosmicPower: 44, growthSpeed: 0.6, realmId: 'dimensional_grove', requiredLevel: 12 },
  { id: 'supernova_sunflower', name: 'Supernova Sunflower', rarity: 'rare', voidType: 'stellar', description: 'When it blooms, it releases a blinding flash like a miniature supernova', emoji: '🌻', cosmicPower: 55, growthSpeed: 0.45, realmId: 'stellar_sanctum', requiredLevel: 18 },
  { id: 'cosmos_dahlia', name: 'Cosmos Dahlia', rarity: 'rare', voidType: 'nebula', description: 'A dahlia whose petals display the full spectrum of cosmic radiation', emoji: '🌼', cosmicPower: 48, growthSpeed: 0.55, realmId: 'dimensional_grove', requiredLevel: 15 },
  // Epic (7)
  { id: 'constellation_ivy', name: 'Constellation Ivy', rarity: 'epic', voidType: 'stellar', description: 'An ever-growing vine that maps the positions of every star in existence', emoji: '🌿', cosmicPower: 100, growthSpeed: 0.35, realmId: 'stellar_sanctum', requiredLevel: 25 },
  { id: 'pulsar_peony', name: 'Pulsar Peony', rarity: 'epic', voidType: 'stellar', description: 'Each petal is a concentrated burst of pulsar radiation contained in floral form', emoji: '🌸', cosmicPower: 110, growthSpeed: 0.3, realmId: 'stellar_sanctum', requiredLevel: 28 },
  { id: 'quasar_rose', name: 'Quasar Rose', rarity: 'epic', voidType: 'cosmic', description: 'The most luminous flower known — its brilliance rivals that of quasars', emoji: '🌹', cosmicPower: 115, growthSpeed: 0.28, realmId: 'stellar_sanctum', requiredLevel: 28 },
  { id: 'abyss_lotus', name: 'Abyss Lotus', rarity: 'epic', voidType: 'abyssal', description: 'Floats on pools of liquid void, blooming only when it detects dimensional instability', emoji: '🪷', cosmicPower: 105, growthSpeed: 0.32, realmId: 'abyssal_void_pit', requiredLevel: 30 },
  { id: 'null_thorn', name: 'Null Thorn', rarity: 'epic', voidType: 'abyssal', description: 'A thorny bush whose branches extend into the space between space itself', emoji: '🌵', cosmicPower: 95, growthSpeed: 0.38, realmId: 'abyssal_void_pit', requiredLevel: 28 },
  { id: 'devouring_vine', name: 'Devouring Vine', rarity: 'epic', voidType: 'quantum', description: 'Consumes other plants and converts them into concentrated cosmic energy', emoji: '🐍', cosmicPower: 120, growthSpeed: 0.25, realmId: 'abyssal_void_pit', requiredLevel: 30 },
  { id: 'entropy_blossom', name: 'Entropy Blossom', rarity: 'epic', voidType: 'nebula', description: 'Accelerates decay around it — harvest quickly before it returns to chaos', emoji: '🍂', cosmicPower: 108, growthSpeed: 0.2, realmId: 'abyssal_void_pit', requiredLevel: 30 },
  // Legendary (6)
  { id: 'probability_petal', name: 'Probability Petal', rarity: 'legendary', voidType: 'quantum', description: 'Exists in all states simultaneously — observing it collapses its waveform', emoji: '💮', cosmicPower: 250, growthSpeed: 0.15, realmId: 'quantum_nexus', requiredLevel: 40 },
  { id: 'superposition_shrub', name: 'Superposition Shrub', rarity: 'legendary', voidType: 'quantum', description: 'Is both alive and dead until you water it — the ultimate Schrodinger plant', emoji: '🌱', cosmicPower: 270, growthSpeed: 0.12, realmId: 'quantum_nexus', requiredLevel: 42 },
  { id: 'quantum_cactus', name: 'Quantum Cactus', rarity: 'legendary', voidType: 'quantum', description: 'Spines that tunnel through quantum barriers — infinite water from nowhere', emoji: '🌵', cosmicPower: 240, growthSpeed: 0.18, realmId: 'quantum_nexus', requiredLevel: 40 },
  { id: 'genesis_seedling', name: 'Genesis Seedling', rarity: 'legendary', voidType: 'astral', description: 'The first plant ever to exist — it contains the blueprint for all creation', emoji: '🌱', cosmicPower: 300, growthSpeed: 0.1, realmId: 'genesis_garden', requiredLevel: 45 },
  { id: 'omni_bloom', name: 'Omni Bloom', rarity: 'legendary', voidType: 'cosmic', description: 'A flower that blooms in every dimension simultaneously — eternal and omnipresent', emoji: '🌺', cosmicPower: 350, growthSpeed: 0.08, realmId: 'genesis_garden', requiredLevel: 48 },
  { id: 'eternal_rose', name: 'Eternal Rose', rarity: 'legendary', voidType: 'dimensional', description: 'A rose frozen in eternal bloom — its petals hold fragments of every timeline', emoji: '🌹', cosmicPower: 320, growthSpeed: 0.09, realmId: 'genesis_garden', requiredLevel: 45 },
];

export const VG_ESSENCES: VgEssenceDef[] = [
  // Void Meadow (4)
  { id: 'void_dew', name: 'Void Dew', rarity: 'common', description: 'Drops of condensed void moisture that sustain shadow plants', emoji: '💧', gatherXp: 8, realmId: 'void_meadow', voidEnergy: 10 },
  { id: 'null_powder', name: 'Null Powder', rarity: 'common', description: 'Fine dust collected from the spaces between atoms', emoji: '💨', gatherXp: 7, realmId: 'void_meadow', voidEnergy: 8 },
  { id: 'dark_humus', name: 'Dark Humus', rarity: 'common', description: 'Nutrient-rich soil from the void floor, teeming with dark microorganisms', emoji: '🖤', gatherXp: 9, realmId: 'void_meadow', voidEnergy: 12 },
  // Cosmic Nursery (4)
  { id: 'stardust_soil', name: 'Stardust Soil', rarity: 'unusual', description: 'Soil infused with crystallized stardust particles', emoji: '✨', gatherXp: 15, realmId: 'cosmic_nursery', voidEnergy: 18 },
  { id: 'nebula_mist', name: 'Nebula Mist', rarity: 'unusual', description: 'Harvested from cosmic clouds — a gaseous fertilizer of immense power', emoji: '🌫️', gatherXp: 16, realmId: 'cosmic_nursery', voidEnergy: 20 },
  { id: 'solar_compost', name: 'Solar Compost', rarity: 'unusual', description: 'Decayed solar matter that radiates warmth and growth energy', emoji: '☀️', gatherXp: 14, realmId: 'cosmic_nursery', voidEnergy: 16 },
  // Dimensional Grove (4)
  { id: 'dimension_fiber', name: 'Dimension Fiber', rarity: 'rare', description: 'Threads pulled from the fabric of dimensional barriers', emoji: '🧵', gatherXp: 30, realmId: 'dimensional_grove', voidEnergy: 35 },
  { id: 'rift_resin', name: 'Rift Resin', rarity: 'rare', description: 'A sticky substance that seeps through dimensional cracks', emoji: '🫧', gatherXp: 32, realmId: 'dimensional_grove', voidEnergy: 38 },
  { id: 'portal_nectar', name: 'Portal Nectar', rarity: 'rare', description: 'Sweet liquid drawn from flowers that grow near stable portals', emoji: '🍯', gatherXp: 35, realmId: 'dimensional_grove', voidEnergy: 40 },
  // Stellar Sanctum (4)
  { id: 'starlight_essence', name: 'Starlight Essence', rarity: 'epic', description: 'Pure liquid starlight, distilled from the light of ancient stars', emoji: '⭐', gatherXp: 70, realmId: 'stellar_sanctum', voidEnergy: 65 },
  { id: 'solar_flare_sap', name: 'Solar Flare Sap', rarity: 'epic', description: 'Volcanic sap charged with the fury of solar flares', emoji: '🔥', gatherXp: 75, realmId: 'stellar_sanctum', voidEnergy: 70 },
  { id: 'nova_bloom_extract', name: 'Nova Bloom Extract', rarity: 'epic', description: 'Concentrated essence from plants that bloom during stellar nova events', emoji: '🌸', gatherXp: 80, realmId: 'stellar_sanctum', voidEnergy: 75 },
  // Abyssal Void Pit (4)
  { id: 'abyssal_sludge', name: 'Abyssal Sludge', rarity: 'epic', description: 'Primordial ooze from the deepest layers of the void', emoji: '🫠', gatherXp: 72, realmId: 'abyssal_void_pit', voidEnergy: 68 },
  { id: 'entropy_resin', name: 'Entropy Resin', rarity: 'rare', description: 'Amber-like resin that slowly dissolves everything it touches', emoji: '🪨', gatherXp: 34, realmId: 'abyssal_void_pit', voidEnergy: 42 },
  { id: 'null_core_fragment', name: 'Null Core Fragment', rarity: 'epic', description: 'Fragments of the null core that powers the void between dimensions', emoji: '💎', gatherXp: 85, realmId: 'abyssal_void_pit', voidEnergy: 80 },
  // Astral Observatory (4)
  { id: 'astral_dewdrop', name: 'Astral Dewdrop', rarity: 'rare', description: 'Dew collected from plants that grow on the astral plane', emoji: '💧', gatherXp: 36, realmId: 'astral_observatory', voidEnergy: 44 },
  { id: 'time_sand_powder', name: 'Time Sand Powder', rarity: 'epic', description: 'Sand from the hourglass of time itself — accelerates or reverses growth', emoji: '⏳', gatherXp: 78, realmId: 'astral_observatory', voidEnergy: 72 },
  { id: 'fate_thread', name: 'Fate Thread', rarity: 'rare', description: 'Silken threads from the tapestry of destiny, woven by cosmic spiders', emoji: '🕸️', gatherXp: 33, realmId: 'astral_observatory', voidEnergy: 40 },
  // Quantum Nexus (4)
  { id: 'quantum_soil', name: 'Quantum Soil', rarity: 'legendary', description: 'Soil that exists in a superposition of all possible nutrient states', emoji: '⚛️', gatherXp: 200, realmId: 'quantum_nexus', voidEnergy: 150 },
  { id: 'probability_dust', name: 'Probability Dust', rarity: 'legendary', description: 'Dust that makes the impossible possible — one grain can change a harvest', emoji: '✨', gatherXp: 220, realmId: 'quantum_nexus', voidEnergy: 160 },
  { id: 'wave_compost', name: 'Wave Compost', rarity: 'epic', description: 'Compost that behaves as both a particle and a wave depending on observation', emoji: '🌊', gatherXp: 82, realmId: 'quantum_nexus', voidEnergy: 78 },
  // Genesis Garden (3)
  { id: 'genesis_dew', name: 'Genesis Dew', rarity: 'legendary', description: 'The first dewdrop ever formed — contains the memory of creation', emoji: '💧', gatherXp: 250, realmId: 'genesis_garden', voidEnergy: 180 },
  { id: 'creation_soil', name: 'Creation Soil', rarity: 'legendary', description: 'The original soil from which the first void garden sprang', emoji: '🌍', gatherXp: 280, realmId: 'genesis_garden', voidEnergy: 200 },
  { id: 'origin_spark', name: 'Origin Spark', rarity: 'legendary', description: 'Embers from the big bang that created all void gardens', emoji: '🔥', gatherXp: 300, realmId: 'genesis_garden', voidEnergy: 220 },
  { id: 'dark_nectar', name: 'Dark Nectar', rarity: 'rare', description: 'A sweet nectar harvested from deep void blossoms that feeds cosmic growth', emoji: '🍯', gatherXp: 36, realmId: 'void_meadow', voidEnergy: 42 },
  { id: 'void_crystal_powder', name: 'Void Crystal Powder', rarity: 'unusual', description: 'Powdered crystals from void formations — excellent for unusual plant growth', emoji: '💎', gatherXp: 17, realmId: 'cosmic_nursery', voidEnergy: 19 },
  { id: 'dimension_bark', name: 'Dimension Bark', rarity: 'rare', description: 'Bark from trees that grow between dimensions, rich in transplanar nutrients', emoji: '🪵', gatherXp: 34, realmId: 'dimensional_grove', voidEnergy: 41 },
  { id: 'abyss_ink', name: 'Abyss Ink', rarity: 'unusual', description: 'Dark ink harvested from abyssal squids of the void pit — strengthens void plants', emoji: '🖊️', gatherXp: 18, realmId: 'abyssal_void_pit', voidEnergy: 21 },
  { id: 'stellar_pollen', name: 'Stellar Pollen', rarity: 'unusual', description: 'Golden pollen shed by stellar flowers during their peak bloom cycle', emoji: '🌸', gatherXp: 16, realmId: 'stellar_sanctum', voidEnergy: 20 },
  { id: 'genesis_pollen', name: 'Genesis Pollen', rarity: 'legendary', description: 'Pollen from the first flowers of creation — contains the spark of life itself', emoji: '🌼', gatherXp: 260, realmId: 'genesis_garden', voidEnergy: 190 },
];

export const VG_STRUCTURES: VgStructureDef[] = [
  { id: 'void_greenhouse', name: 'Void Greenhouse', description: 'A greenhouse that filters cosmic radiation for optimal growth', emoji: '🏡', maxLevel: 10, baseCost: 50, costMultiplier: 1.5, bonusType: 'growth_speed', bonusPerLevel: 5, requiredLevel: 1 },
  { id: 'nebula_sprinkler', name: 'Nebula Sprinkler', description: 'Sprinkles compressed nebula gas to nourish your void plants', emoji: '💦', maxLevel: 10, baseCost: 60, costMultiplier: 1.5, bonusType: 'void_energy_regen', bonusPerLevel: 3, requiredLevel: 3 },
  { id: 'dimensional_fence', name: 'Dimensional Fence', description: 'Protects your garden from interdimensional pests and void creatures', emoji: '🏗️', maxLevel: 10, baseCost: 80, costMultiplier: 1.6, bonusType: 'plot_protection', bonusPerLevel: 10, requiredLevel: 5 },
  { id: 'cosmic_compost_bin', name: 'Cosmic Compost Bin', description: 'Converts waste essences into high-grade cosmic fertilizer', emoji: '♻️', maxLevel: 10, baseCost: 70, costMultiplier: 1.5, bonusType: 'essence_efficiency', bonusPerLevel: 4, requiredLevel: 5 },
  { id: 'starlight_lamp', name: 'Starlight Lamp', description: 'An eternal lamp that mimics the light of distant stars for night growth', emoji: '💡', maxLevel: 10, baseCost: 100, costMultiplier: 1.6, bonusType: 'growth_speed', bonusPerLevel: 3, requiredLevel: 8 },
  { id: 'void_well', name: 'Void Well', description: 'Draws void energy from the deep abyss to replenish your reserves', emoji: '🪣', maxLevel: 10, baseCost: 120, costMultiplier: 1.7, bonusType: 'max_void_energy', bonusPerLevel: 10, requiredLevel: 10 },
  { id: 'reality_pruner', name: 'Reality Pruner', description: 'Precision tool that trims problematic growth by editing local reality', emoji: '✂️', maxLevel: 10, baseCost: 90, costMultiplier: 1.5, bonusType: 'prune_efficiency', bonusPerLevel: 5, requiredLevel: 12 },
  { id: 'cross_pollination_chamber', name: 'Cross-Pollination Chamber', description: 'A sealed chamber where dimensional cross-pollination can be safely conducted', emoji: '🔬', maxLevel: 10, baseCost: 150, costMultiplier: 1.7, bonusType: 'crosspollinate_chance', bonusPerLevel: 4, requiredLevel: 15 },
  { id: 'astral_weather_vane', name: 'Astral Weather Vane', description: 'Predicts and manipulates cosmic weather for ideal growing conditions', emoji: '🧭', maxLevel: 10, baseCost: 110, costMultiplier: 1.6, bonusType: 'gather_rate', bonusPerLevel: 3, requiredLevel: 18 },
  { id: 'harvest_shrine', name: 'Harvest Shrine', description: 'A shrine that blesses each harvest with additional cosmic energy', emoji: '⛩️', maxLevel: 10, baseCost: 130, costMultiplier: 1.7, bonusType: 'harvest_bonus', bonusPerLevel: 6, requiredLevel: 20 },
  { id: 'void_energy_condenser', name: 'Void Energy Condenser', description: 'Condenses ambient void energy into usable concentrated form', emoji: '🔋', maxLevel: 10, baseCost: 160, costMultiplier: 1.8, bonusType: 'void_energy_regen', bonusPerLevel: 5, requiredLevel: 22 },
  { id: 'dimensional_archive', name: 'Dimensional Archive', description: 'Stores knowledge of every plant ever cultivated across dimensions', emoji: '📚', maxLevel: 10, baseCost: 140, costMultiplier: 1.7, bonusType: 'xp_boost', bonusPerLevel: 3, requiredLevel: 25 },
  { id: 'entropy_shield', name: 'Entropy Shield', description: 'Shields plants from entropy, extending their peak growth window', emoji: '🛡️', maxLevel: 10, baseCost: 170, costMultiplier: 1.8, bonusType: 'decay_resistance', bonusPerLevel: 5, requiredLevel: 28 },
  { id: 'quantum_greenhouse', name: 'Quantum Greenhouse', description: 'A greenhouse where plants grow in superposition — harvest from all timelines', emoji: '⚛️', maxLevel: 10, baseCost: 200, costMultiplier: 1.9, bonusType: 'harvest_bonus', bonusPerLevel: 8, requiredLevel: 30 },
  { id: 'cosmic_transplanter', name: 'Cosmic Transplanter', description: 'Moves plants between dimensions without transplant shock', emoji: '🔧', maxLevel: 10, baseCost: 180, costMultiplier: 1.8, bonusType: 'plant_health', bonusPerLevel: 5, requiredLevel: 33 },
  { id: 'void_bee_hive', name: 'Void Bee Hive', description: 'Bees made of pure void energy that cross-pollinate automatically', emoji: '🐝', maxLevel: 10, baseCost: 150, costMultiplier: 1.7, bonusType: 'auto_crosspollinate', bonusPerLevel: 2, requiredLevel: 35 },
  { id: 'stellar_greenhouse', name: 'Stellar Greenhouse', description: 'Powered by a captured star — provides unlimited growing light', emoji: '🌟', maxLevel: 10, baseCost: 220, costMultiplier: 1.9, bonusType: 'growth_speed', bonusPerLevel: 7, requiredLevel: 38 },
  { id: 'abyssal_extractor', name: 'Abyssal Extractor', description: 'Extracts precious materials from the abyssal void pit depths', emoji: '⛏️', maxLevel: 10, baseCost: 200, costMultiplier: 1.9, bonusType: 'essence_efficiency', bonusPerLevel: 6, requiredLevel: 40 },
  { id: 'genesis_crystal', name: 'Genesis Crystal', description: 'A crystal containing a fragment of the genesis event — the ultimate garden tool', emoji: '💎', maxLevel: 10, baseCost: 300, costMultiplier: 2.0, bonusType: 'all_bonuses', bonusPerLevel: 2, requiredLevel: 45 },
  { id: 'omni_sprout_system', name: 'Omni Sprout System', description: 'An all-in-one garden management system of unfathomable cosmic sophistication', emoji: '🤖', maxLevel: 10, baseCost: 250, costMultiplier: 1.9, bonusType: 'auto_harvest', bonusPerLevel: 3, requiredLevel: 42 },
  { id: 'reality_loom', name: 'Reality Loom', description: 'Weaves the fabric of reality to create perfect growing conditions', emoji: '🧶', maxLevel: 10, baseCost: 280, costMultiplier: 2.0, bonusType: 'xp_boost', bonusPerLevel: 5, requiredLevel: 45 },
  { id: 'cosmic_harvester', name: 'Cosmic Harvester', description: 'A sentient machine that harvests plants at the exact moment of peak cosmic power', emoji: '🌾', maxLevel: 10, baseCost: 260, costMultiplier: 1.9, bonusType: 'harvest_bonus', bonusPerLevel: 10, requiredLevel: 48 },
  { id: 'eternal_fountain', name: 'Eternal Fountain', description: 'An infinite source of void energy that never runs dry', emoji: '⛲', maxLevel: 10, baseCost: 350, costMultiplier: 2.0, bonusType: 'max_void_energy', bonusPerLevel: 15, requiredLevel: 48 },
  { id: 'creation_anvil', name: 'Creation Anvil', description: 'Forge new plant species from raw cosmic materials', emoji: '🔨', maxLevel: 10, baseCost: 320, costMultiplier: 2.0, bonusType: 'all_bonuses', bonusPerLevel: 3, requiredLevel: 50 },
  { id: 'void_observatory_tower', name: 'Void Observatory Tower', description: 'A towering structure that observes cosmic events and alerts to harvest opportunities', emoji: '🗼', maxLevel: 10, baseCost: 180, costMultiplier: 1.8, bonusType: 'gather_rate', bonusPerLevel: 4, requiredLevel: 35 },
];

export const VG_ABILITIES: VgAbilityDef[] = [
  // Common (5)
  { id: 'void_bloom', name: 'Void Bloom', rarity: 'common', description: 'Force a void plant to bloom instantly with a burst of dark energy', emoji: '🌼', voidCost: 10, cooldown: 5, xpReward: 12, requiredLevel: 1, effect: 'instant_grow' },
  { id: 'shadow_nourish', name: 'Shadow Nourish', rarity: 'common', description: 'Feed a plant with condensed shadow to boost its growth', emoji: '🌑', voidCost: 8, cooldown: 10, xpReward: 10, requiredLevel: 1, effect: 'growth_boost' },
  { id: 'reality_prune', name: 'Reality Prune', rarity: 'common', description: 'Snip away dead growth by briefly editing local reality', emoji: '✂️', voidCost: 12, cooldown: 15, xpReward: 15, requiredLevel: 1, effect: 'prune' },
  { id: 'cosmic_water', name: 'Cosmic Water', rarity: 'common', description: 'Water your garden with compressed cosmic energy', emoji: '💧', voidCost: 10, cooldown: 3, xpReward: 8, requiredLevel: 1, effect: 'water' },
  { id: 'void_scan', name: 'Void Scan', rarity: 'common', description: 'Scan the void to discover hidden plant seeds', emoji: '🔭', voidCost: 8, cooldown: 20, xpReward: 12, requiredLevel: 1, effect: 'discover' },
  // Unusual (5)
  { id: 'dimensional_shift', name: 'Dimensional Shift', rarity: 'unusual', description: 'Briefly shift a plant to a more favorable dimension for growth', emoji: '🌀', voidCost: 20, cooldown: 8, xpReward: 25, requiredLevel: 8, effect: 'dimension_boost' },
  { id: 'nebula_fertilize', name: 'Nebula Fertilize', rarity: 'unusual', description: 'Fertilize with raw nebula gas to supercharge nutrient absorption', emoji: '☁️', voidCost: 25, cooldown: 30, xpReward: 28, requiredLevel: 8, effect: 'nutrient_boost' },
  { id: 'starlight_beam', name: 'Starlight Beam', rarity: 'unusual', description: 'Focus starlight onto plants to accelerate photosynthesis', emoji: '🌟', voidCost: 18, cooldown: 4, xpReward: 22, requiredLevel: 8, effect: 'light_boost' },
  { id: 'entropy_shield', name: 'Entropy Shield', rarity: 'unusual', description: 'Shield your garden from entropy for a brief period', emoji: '🛡️', voidCost: 22, cooldown: 60, xpReward: 20, requiredLevel: 10, effect: 'defense' },
  { id: 'rift_harvest', name: 'Rift Harvest', rarity: 'unusual', description: 'Open a dimensional rift to harvest essences from parallel gardens', emoji: '🌀', voidCost: 15, cooldown: 15, xpReward: 24, requiredLevel: 8, effect: 'essence_harvest' },
  // Rare (4)
  { id: 'quantum_split', name: 'Quantum Split', rarity: 'rare', description: 'Split a plant into two using quantum superposition — double the harvest', emoji: '⚛️', voidCost: 40, cooldown: 20, xpReward: 50, requiredLevel: 18, effect: 'duplicate' },
  { id: 'time_accelerate', name: 'Time Accelerate', rarity: 'rare', description: 'Speed up time around your garden for rapid growth', emoji: '⏩', voidCost: 35, cooldown: 25, xpReward: 45, requiredLevel: 20, effect: 'time_warp' },
  { id: 'void_transmute', name: 'Void Transmute', rarity: 'rare', description: 'Transmute common essences into rarer variants using void alchemy', emoji: '⚗️', voidCost: 30, cooldown: 45, xpReward: 40, requiredLevel: 18, effect: 'transmute' },
  { id: 'cross_pollinate', name: 'Cross-Pollinate', rarity: 'rare', description: 'Cross-pollinate two plants to create a hybrid with enhanced traits', emoji: '🧬', voidCost: 25, cooldown: 30, xpReward: 35, requiredLevel: 18, effect: 'crosspollinate' },
  // Epic (4)
  { id: 'reality_rewrite', name: 'Reality Rewrite', rarity: 'epic', description: 'Temporarily rewrite the rules of your garden — make anything grow anywhere', emoji: '📝', voidCost: 60, cooldown: 120, xpReward: 100, requiredLevel: 32, effect: 'ultimate' },
  { id: 'void_collapse', name: 'Void Collapse', rarity: 'epic', description: 'Collapse a pocket void to release a massive burst of growing energy', emoji: '🕳️', voidCost: 50, cooldown: 90, xpReward: 80, requiredLevel: 35, effect: 'burst' },
  { id: 'cosmic_ripple', name: 'Cosmic Ripple', rarity: 'epic', description: 'Send a ripple through spacetime that benefits all gardens everywhere', emoji: '🌊', voidCost: 70, cooldown: 180, xpReward: 120, requiredLevel: 38, effect: 'global_buff' },
  { id: 'entropy_reverse', name: 'Entropy Reverse', rarity: 'epic', description: 'Reverse entropy in your garden, restoring decayed plants to full vitality', emoji: '🔄', voidCost: 55, cooldown: 90, xpReward: 90, requiredLevel: 35, effect: 'restore' },
  // Legendary (4)
  { id: 'genesis_bloom', name: 'Genesis Bloom', rarity: 'legendary', description: 'Trigger a genesis event — all plants in your garden bloom simultaneously', emoji: '🌺', voidCost: 100, cooldown: 300, xpReward: 250, requiredLevel: 45, effect: 'ultimate' },
  { id: 'dimension_fusion', name: 'Dimension Fusion', rarity: 'legendary', description: 'Fuse multiple dimensions together for the ultimate growing environment', emoji: '🌀', voidCost: 80, cooldown: 240, xpReward: 200, requiredLevel: 45, effect: 'ultimate' },
  { id: 'time_garden', name: 'Time Garden', rarity: 'legendary', description: 'Pause time for your garden — grow without any time passing outside', emoji: '⏳', voidCost: 120, cooldown: 600, xpReward: 300, requiredLevel: 50, effect: 'ultimate' },
  { id: 'void_creation', name: 'Void Creation', rarity: 'legendary', description: 'Create new species of void plants from pure cosmic energy', emoji: '🌱', voidCost: 100, cooldown: 300, xpReward: 280, requiredLevel: 48, effect: 'create' },
];

export const VG_ACHIEVEMENTS: VgAchievementDef[] = [
  { id: 'ach_first_realm', name: 'First Steps into the Void', description: 'Explore your first garden realm', conditionKey: 'totalRealmsExplored', targetValue: 1, rewardCoins: 25, rewardXp: 15, emoji: '👣' },
  { id: 'ach_plant_discoverer_5', name: 'Plant Discoverer', description: 'Discover 5 different void plants', conditionKey: 'totalPlanted', targetValue: 5, rewardCoins: 100, rewardXp: 50, emoji: '🔍' },
  { id: 'ach_plant_discoverer_15', name: 'Cosmic Botanist', description: 'Discover 15 different void plants', conditionKey: 'totalPlanted', targetValue: 15, rewardCoins: 300, rewardXp: 150, emoji: '📖' },
  { id: 'ach_plant_discoverer_35', name: 'Void Flora Master', description: 'Discover all 35 void plants', conditionKey: 'totalPlanted', targetValue: 35, rewardCoins: 1000, rewardXp: 500, emoji: '📚' },
  { id: 'ach_harvester_20', name: 'Novice Harvester', description: 'Harvest 20 plants total', conditionKey: 'totalHarvested', targetValue: 20, rewardCoins: 80, rewardXp: 40, emoji: '🌾' },
  { id: 'ach_harvester_100', name: 'Master Harvester', description: 'Harvest 100 plants total', conditionKey: 'totalHarvested', targetValue: 100, rewardCoins: 300, rewardXp: 150, emoji: '💐' },
  { id: 'ach_crosspollinate_5', name: 'Cross-Pollinator', description: 'Cross-pollinate 5 plants', conditionKey: 'totalCrossPollinated', targetValue: 5, rewardCoins: 100, rewardXp: 50, emoji: '🧬' },
  { id: 'ach_crosspollinate_20', name: 'Gene Weaver', description: 'Cross-pollinate 20 plants', conditionKey: 'totalCrossPollinated', targetValue: 20, rewardCoins: 400, rewardXp: 200, emoji: '🧬' },
  { id: 'ach_pruner_10', name: 'Reality Pruner', description: 'Reality prune 10 times', conditionKey: 'totalPruned', targetValue: 10, rewardCoins: 150, rewardXp: 75, emoji: '✂️' },
  { id: 'ach_structure_builder_5', name: 'Builder', description: 'Build or upgrade 5 garden structures', conditionKey: 'totalStructuresBuilt', targetValue: 5, rewardCoins: 200, rewardXp: 100, emoji: '🏗️' },
  { id: 'ach_realm_explorer', name: 'Realm Explorer', description: 'Explore all 8 garden realms', conditionKey: 'totalRealmsExplored', targetValue: 8, rewardCoins: 500, rewardXp: 250, emoji: '🗺️' },
  { id: 'ach_ability_user_25', name: 'Ability Adept', description: 'Use void abilities 25 times', conditionKey: 'totalAbilitiesCast', targetValue: 25, rewardCoins: 150, rewardXp: 75, emoji: '✨' },
  { id: 'ach_ability_user_100', name: 'Ability Master', description: 'Use void abilities 100 times', conditionKey: 'totalAbilitiesCast', targetValue: 100, rewardCoins: 500, rewardXp: 250, emoji: '💫' },
  { id: 'ach_essence_collector', name: 'Essence Hoarder', description: 'Gather 100 essences total', conditionKey: 'totalEssencesGathered', targetValue: 100, rewardCoins: 200, rewardXp: 100, emoji: '💧' },
  { id: 'ach_energy_spender', name: 'Void Energy Consumer', description: 'Spend 500 total void energy', conditionKey: 'totalCosmicEnergySpent', targetValue: 500, rewardCoins: 300, rewardXp: 150, emoji: '🔋' },
  { id: 'ach_essence_collector_500', name: 'Essence Tycoon', description: 'Gather 500 essences total', conditionKey: 'totalEssencesGathered', targetValue: 500, rewardCoins: 800, rewardXp: 400, emoji: '💎' },
  { id: 'ach_structure_max', name: 'Master Builder', description: 'Max level any garden structure', conditionKey: 'level', targetValue: 25, rewardCoins: 500, rewardXp: 250, emoji: '🏰' },
  { id: 'ach_cosmic_gardener', name: 'Cosmic Gardener', description: 'Reach the maximum level of 50', conditionKey: 'level', targetValue: 50, rewardCoins: 2000, rewardXp: 1000, emoji: '👑' },
];

export const VG_DAILY_QUEST_TYPES: { type: VgDailyQuestType; name: string; description: string; target: number; rewardCoins: number; rewardXp: number; rewardVoidEnergy: number; emoji: string }[] = [
  { type: 'plant', name: 'Void Planting', description: 'Plant void seeds in explored realms', target: 5, rewardCoins: 50, rewardXp: 30, rewardVoidEnergy: 20, emoji: '🌱' },
  { type: 'crosspollinate', name: 'Cross-Pollination', description: 'Cross-pollinate void plants for hybrids', target: 3, rewardCoins: 60, rewardXp: 35, rewardVoidEnergy: 25, emoji: '🧬' },
  { type: 'prune', name: 'Reality Pruning', description: 'Prune and shape your void garden', target: 4, rewardCoins: 55, rewardXp: 32, rewardVoidEnergy: 22, emoji: '✂️' },
  { type: 'harvest', name: 'Cosmic Harvest', description: 'Harvest fully grown void plants', target: 5, rewardCoins: 65, rewardXp: 38, rewardVoidEnergy: 28, emoji: '🌾' },
  { type: 'feed', name: 'Essence Feeding', description: 'Feed essences to your void plants', target: 6, rewardCoins: 45, rewardXp: 28, rewardVoidEnergy: 18, emoji: '💧' },
  { type: 'explore', name: 'Realm Exploration', description: 'Explore new garden realms', target: 2, rewardCoins: 70, rewardXp: 40, rewardVoidEnergy: 30, emoji: '🗺️' },
];

// ============================================================
// Initial State Factory
// ============================================================

function vgCreateInitialState(seed?: number): VoidGardenState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  const plants: Record<string, VgPlantState> = {};
  for (const p of VG_PLANTS) {
    plants[p.id] = { planted: false, count: 0, fullyGrown: false, harvestedCount: 0, plantedAt: null };
  }
  const realms: Record<string, VgRealmState> = {};
  for (const r of VG_REALMS) {
    realms[r.id] = {
      explored: r.unlockLevel <= 1,
      level: 1,
      plantedCount: 0,
      harvestedCount: 0,
      plantsDiscovered: 0,
      unlockedAt: r.unlockLevel <= 1 ? Date.now() : null,
    };
  }
  const structures: Record<string, VgStructureState> = {};
  for (const s of VG_STRUCTURES) {
    structures[s.id] = { level: 0, built: false, lastUpgradedAt: null };
  }
  const abilities: Record<string, VgAbilityState> = {};
  for (const a of VG_ABILITIES) {
    abilities[a.id] = { learned: a.requiredLevel <= 1, castCount: 0, cooldownEnd: 0 };
  }
  const achievements: Record<string, VgAchievementState> = {};
  for (const ac of VG_ACHIEVEMENTS) {
    achievements[ac.id] = { unlocked: false, unlockedAt: null };
  }

  return {
    level: 1,
    xp: 0,
    coins: 100,
    title: 'Void Seedling',
    voidEnergy: 50,
    maxVoidEnergy: 100,
    plants,
    realms,
    essences: { void_dew: 3, null_powder: 2, dark_humus: 2 },
    structures,
    abilities,
    plantedPlots: [],
    achievements,
    dailyQuest: {
      lastDate: null,
      streak: 0,
      completed: false,
      questType: null,
      questProgress: 0,
      questTarget: 0,
      rewardClaimed: false,
    },
    totals: {
      totalPlanted: 0,
      totalHarvested: 0,
      totalCrossPollinated: 0,
      totalPruned: 0,
      totalStructuresBuilt: 0,
      totalAbilitiesCast: 0,
      totalEssencesGathered: 0,
      totalRealmsExplored: 0,
      totalCosmicEnergySpent: 0,
    },
    seed: effectiveSeed,
  };
}

// ============================================================
// Hook: useVoidGarden
// ============================================================

export default function useVoidGarden(initialSeed?: number) {
  const [state, setState] = useState<VoidGardenState>(() => vgCreateInitialState(initialSeed));
  const prngRef = useRef<() => number>(vgMulberry32(state.seed));
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- Core State ----

  const vgGetState = useCallback((): Readonly<VoidGardenState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const vgResetState = useCallback((newSeed?: number) => {
    const s = vgCreateInitialState(newSeed);
    prngRef.current = vgMulberry32(s.seed);
    setState(s);
  }, []);

  const vgGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const vgGetXp = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const vgGetXPTillNext = useCallback((): number => {
    return vgXpRequired(state.level);
  }, [state.level]);

  const vgAddXp = useCallback((amount: number): VoidGardenState => {
    let next = state;
    setState((prev) => {
      let lvl = prev.level;
      let xp = prev.xp + Math.floor(amount);
      while (lvl < VG_MAX_LEVEL && xp >= vgXpRequired(lvl)) {
        xp -= vgXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= VG_MAX_LEVEL) xp = 0;
      next = { ...prev, level: vgClampLevel(lvl), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Coins ----

  const vgGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const vgAddCoins = useCallback((amount: number): VoidGardenState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: vgClampCoins(prev.coins + amount) };
      return next;
    });
    return next;
  }, [state]);

  const vgSpendCoins = useCallback((amount: number): { success: boolean; state: VoidGardenState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: vgClampCoins(prev.coins - amount) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Void Energy ----

  const vgGetVoidEnergy = useCallback((): number => {
    return state.voidEnergy;
  }, [state.voidEnergy]);

  const vgGetMaxVoidEnergy = useCallback((): number => {
    return state.maxVoidEnergy;
  }, [state.maxVoidEnergy]);

  const vgAddVoidEnergy = useCallback((amount: number): VoidGardenState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, voidEnergy: vgClampEnergy(prev.voidEnergy + amount, prev.maxVoidEnergy) };
      return next;
    });
    return next;
  }, [state]);

  const vgSpendVoidEnergy = useCallback((amount: number): { success: boolean; state: VoidGardenState } => {
    if (state.voidEnergy < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        voidEnergy: vgClampEnergy(prev.voidEnergy - amount, prev.maxVoidEnergy),
        totals: { ...prev.totals, totalCosmicEnergySpent: prev.totals.totalCosmicEnergySpent + amount },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgCanAffordEnergy = useCallback((amount: number): boolean => {
    return state.voidEnergy >= amount;
  }, [state.voidEnergy]);

  const vgRegenVoidEnergy = useCallback((amount: number): VoidGardenState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, voidEnergy: vgClampEnergy(prev.voidEnergy + amount, prev.maxVoidEnergy) };
      return next;
    });
    return next;
  }, [state]);

  // ---- Title ----

  const vgGetTitle = useCallback((): VgTitleInfo => {
    let current = VG_TITLES[0];
    for (const t of VG_TITLES) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const vgGetAllTitles = useCallback((): VgTitleInfo[] => {
    return [...VG_TITLES];
  }, []);

  const vgGetNextTitle = useCallback((): VgTitleInfo | null => {
    for (const t of VG_TITLES) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const vgGetProgress = useCallback((): number => {
    const needed = vgXpRequired(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const vgGetOverallProgress = useCallback((): number => {
    return state.level / VG_MAX_LEVEL;
  }, [state.level]);

  const vgGetEnergyProgress = useCallback((): number => {
    if (state.maxVoidEnergy <= 0) return 0;
    return state.voidEnergy / state.maxVoidEnergy;
  }, [state.voidEnergy, state.maxVoidEnergy]);

  // ---- Plants ----

  const vgGetPlants = useCallback((): VgPlantDef[] => {
    return [...VG_PLANTS];
  }, []);

  const vgGetPlantById = useCallback((id: string): VgPlantDef | null => {
    return VG_PLANTS.find((p) => p.id === id) ?? null;
  }, []);

  const vgGetDiscoveredPlants = useCallback((): VgPlantDef[] => {
    return VG_PLANTS.filter((p) => state.plants[p.id]?.planted);
  }, [state.plants]);

  const vgGetPlantByRarity = useCallback((rarity: VgRarity): VgPlantDef[] => {
    return VG_PLANTS.filter((p) => p.rarity === rarity);
  }, []);

  const vgGetPlantByVoidType = useCallback((voidType: VgVoidType): VgPlantDef[] => {
    return VG_PLANTS.filter((p) => p.voidType === voidType);
  }, []);

  const vgDiscoverPlant = useCallback((plantId: string): { success: boolean; state: VoidGardenState } => {
    const def = VG_PLANTS.find((p) => p.id === plantId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      const existing = prev.plants[plantId];
      if (!existing) return prev;
      const wasNew = !existing.planted;
      next = {
        ...prev,
        plants: {
          ...prev.plants,
          [plantId]: {
            ...existing,
            planted: true,
            count: existing.count + 1,
            plantedAt: Date.now(),
          },
        },
        totals: {
          ...prev.totals,
          totalPlanted: prev.totals.totalPlanted + (wasNew ? 1 : 0),
        },
      };
      if (wasNew) {
        const realmState = prev.realms[def.realmId];
        if (realmState) {
          next = {
            ...next,
            realms: {
              ...next.realms,
              [def.realmId]: { ...realmState, plantsDiscovered: realmState.plantsDiscovered + 1 },
            },
          };
        }
      }
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgGetPlantDiscoveryCount = useCallback((): number => {
    return Object.values(state.plants).filter((p) => p.planted).length;
  }, [state.plants]);

  const vgIsPlantDiscovered = useCallback((plantId: string): boolean => {
    return state.plants[plantId]?.planted ?? false;
  }, [state.plants]);

  const vgGetPlantCount = useCallback((plantId: string): number => {
    return state.plants[plantId]?.count ?? 0;
  }, [state.plants]);

  const vgGetPlantInfo = useCallback((plantId: string): VgPlantState | null => {
    return state.plants[plantId] ?? null;
  }, [state.plants]);

  // ---- Realms ----

  const vgGetRealms = useCallback((): VgRealmDef[] => {
    return [...VG_REALMS];
  }, []);

  const vgGetRealmById = useCallback((id: string): VgRealmDef | null => {
    return VG_REALMS.find((r) => r.id === id) ?? null;
  }, []);

  const vgExploreRealm = useCallback((realmId: string): { success: boolean; state: VoidGardenState } => {
    const def = VG_REALMS.find((r) => r.id === realmId);
    if (!def) return { success: false, state };
    if (state.level < def.unlockLevel) return { success: false, state };
    if (state.realms[realmId]?.explored) return { success: false, state };
    let next = state;
    setState((prev) => {
      const realmState = prev.realms[realmId];
      if (!realmState) return prev;
      next = {
        ...prev,
        realms: {
          ...prev.realms,
          [realmId]: { ...realmState, explored: true, unlockedAt: Date.now() },
        },
        totals: { ...prev.totals, totalRealmsExplored: prev.totals.totalRealmsExplored + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgIsRealmExplored = useCallback((realmId: string): boolean => {
    return state.realms[realmId]?.explored ?? false;
  }, [state.realms]);

  const vgGetRealmLevel = useCallback((realmId: string): number => {
    return state.realms[realmId]?.level ?? 1;
  }, [state.realms]);

  const vgUpgradeRealm = useCallback((realmId: string): { success: boolean; cost: number; state: VoidGardenState } => {
    const def = VG_REALMS.find((r) => r.id === realmId);
    if (!def) return { success: false, cost: 0, state };
    const realmState = state.realms[realmId];
    if (!realmState || !realmState.explored) return { success: false, cost: 0, state };
    const cost = Math.floor(50 * Math.pow(1.5, realmState.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const rs = prev.realms[realmId];
      if (!rs) return prev;
      next = {
        ...prev,
        realms: { ...prev.realms, [realmId]: { ...rs, level: rs.level + 1 } },
        coins: vgClampCoins(prev.coins - cost),
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  const vgGetExploredRealms = useCallback((): VgRealmDef[] => {
    return VG_REALMS.filter((r) => state.realms[r.id]?.explored);
  }, [state.realms]);

  const vgGetUnexploredRealms = useCallback((): VgRealmDef[] => {
    return VG_REALMS.filter((r) => !state.realms[r.id]?.explored);
  }, [state.realms]);

  const vgGetRealmInfo = useCallback((realmId: string): VgRealmState | null => {
    return state.realms[realmId] ?? null;
  }, [state.realms]);

  // ---- Essences ----

  const vgGetEssences = useCallback((): VgEssenceDef[] => {
    return [...VG_ESSENCES];
  }, []);

  const vgGetEssenceById = useCallback((id: string): VgEssenceDef | null => {
    return VG_ESSENCES.find((e) => e.id === id) ?? null;
  }, []);

  const vgGetEssenceCount = useCallback((essenceId: string): number => {
    return state.essences[essenceId] ?? 0;
  }, [state.essences]);

  const vgGetAllEssenceCounts = useCallback((): Record<string, number> => {
    return { ...state.essences };
  }, [state.essences]);

  const vgGatherEssence = useCallback((essenceId: string, amount: number = 1): { success: boolean; state: VoidGardenState } => {
    const def = VG_ESSENCES.find((e) => e.id === essenceId);
    if (!def) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newEssences = { ...prev.essences, [essenceId]: (prev.essences[essenceId] ?? 0) + amount };
      const newXp = def.gatherXp * amount;
      const energyGain = def.voidEnergy * amount;
      next = {
        ...prev,
        essences: newEssences,
        voidEnergy: vgClampEnergy(prev.voidEnergy + energyGain, prev.maxVoidEnergy),
        totals: { ...prev.totals, totalEssencesGathered: prev.totals.totalEssencesGathered + amount },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(newXp);
      while (lvl < VG_MAX_LEVEL && xp >= vgXpRequired(lvl)) {
        xp -= vgXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= VG_MAX_LEVEL) xp = 0;
      next = { ...next, level: vgClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgCanGatherEssence = useCallback((essenceId: string): boolean => {
    const def = VG_ESSENCES.find((e) => e.id === essenceId);
    if (!def) return false;
    return state.level >= (VG_REALMS.find((r) => r.id === def.realmId)?.unlockLevel ?? 1);
  }, [state.level]);

  const vgGetEssencesByRarity = useCallback((rarity: VgRarity): VgEssenceDef[] => {
    return VG_ESSENCES.filter((e) => e.rarity === rarity);
  }, []);

  const vgGetTotalEssencesGathered = useCallback((): number => {
    return Object.values(state.essences).reduce((sum, count) => sum + count, 0);
  }, [state.essences]);

  const vgGetEssenceInfo = useCallback((essenceId: string): { count: number; def: VgEssenceDef | null } => {
    return { count: state.essences[essenceId] ?? 0, def: VG_ESSENCES.find((e) => e.id === essenceId) ?? null };
  }, [state.essences]);

  const vgGatherInRealm = useCallback((realmId: string): { success: boolean; essences: { essenceId: string; amount: number }[]; state: VoidGardenState } => {
    const def = VG_REALMS.find((r) => r.id === realmId);
    if (!def) return { success: false, essences: [], state };
    const realmState = state.realms[realmId];
    if (!realmState || !realmState.explored) return { success: false, essences: [], state };

    const realmLevel = realmState.level;
    const baseRate = def.baseGrowRate + realmLevel * 0.02;
    const rng = prngRef.current();

    const foundEssences: { essenceId: string; amount: number }[] = [];
    const newEssences: Record<string, number> = { ...state.essences };
    let totalEnergy = 0;

    for (const essenceId of def.essenceList) {
      if (rng <= baseRate) {
        const amount = 1 + Math.floor(prngRef.current() * 2);
        newEssences[essenceId] = (newEssences[essenceId] ?? 0) + amount;
        foundEssences.push({ essenceId, amount });
        const essenceDef = VG_ESSENCES.find((e) => e.id === essenceId);
        if (essenceDef) totalEnergy += essenceDef.voidEnergy * amount;
      }
    }

    if (foundEssences.length === 0) return { success: true, essences: [], state };

    const totalXp = foundEssences.reduce((sum, e) => {
      const edef = VG_ESSENCES.find((ed) => ed.id === e.essenceId);
      return sum + ((edef?.gatherXp ?? 5) * e.amount);
    }, 0);

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        essences: newEssences,
        voidEnergy: vgClampEnergy(prev.voidEnergy + totalEnergy, prev.maxVoidEnergy),
        totals: { ...prev.totals, totalEssencesGathered: prev.totals.totalEssencesGathered + foundEssences.length },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(totalXp);
      while (lvl < VG_MAX_LEVEL && xp >= vgXpRequired(lvl)) {
        xp -= vgXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= VG_MAX_LEVEL) xp = 0;
      next = { ...next, level: vgClampLevel(lvl), xp };
      return next;
    });
    return { success: true, essences: foundEssences, state: next };
  }, [state]);

  // ---- Structures ----

  const vgGetStructures = useCallback((): VgStructureDef[] => {
    return [...VG_STRUCTURES];
  }, []);

  const vgGetStructureById = useCallback((id: string): VgStructureDef | null => {
    return VG_STRUCTURES.find((s) => s.id === id) ?? null;
  }, []);

  const vgBuildStructure = useCallback((structureId: string): { success: boolean; state: VoidGardenState } => {
    const def = VG_STRUCTURES.find((s) => s.id === structureId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    const structureState = state.structures[structureId];
    if (structureState?.built) return { success: false, state };
    const cost = def.baseCost;
    if (state.coins < cost) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        structures: {
          ...prev.structures,
          [structureId]: { level: 1, built: true, lastUpgradedAt: Date.now() },
        },
        coins: vgClampCoins(prev.coins - cost),
        totals: { ...prev.totals, totalStructuresBuilt: prev.totals.totalStructuresBuilt + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgUpgradeStructure = useCallback((structureId: string): { success: boolean; cost: number; state: VoidGardenState } => {
    const def = VG_STRUCTURES.find((s) => s.id === structureId);
    if (!def) return { success: false, cost: 0, state };
    const structureState = state.structures[structureId];
    if (!structureState || !structureState.built) return { success: false, cost: 0, state };
    if (structureState.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, structureState.level));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const ss = prev.structures[structureId];
      if (!ss) return prev;
      next = {
        ...prev,
        structures: { ...prev.structures, [structureId]: { ...ss, level: ss.level + 1, lastUpgradedAt: Date.now() } },
        coins: vgClampCoins(prev.coins - cost),
        totals: { ...prev.totals, totalStructuresBuilt: prev.totals.totalStructuresBuilt + 1 },
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  const vgIsStructureBuilt = useCallback((structureId: string): boolean => {
    return state.structures[structureId]?.built ?? false;
  }, [state.structures]);

  const vgGetStructureLevel = useCallback((structureId: string): number => {
    return state.structures[structureId]?.level ?? 0;
  }, [state.structures]);

  const vgGetBuiltStructures = useCallback((): VgStructureDef[] => {
    return VG_STRUCTURES.filter((s) => state.structures[s.id]?.built);
  }, [state.structures]);

  const vgGetStructureInfo = useCallback((structureId: string): VgStructureState | null => {
    return state.structures[structureId] ?? null;
  }, [state.structures]);

  const vgGetUpgradeCost = useCallback((structureId: string): number => {
    const def = VG_STRUCTURES.find((s) => s.id === structureId);
    const ss = state.structures[structureId];
    if (!def || !ss || !ss.built) return def?.baseCost ?? 0;
    if (ss.level >= def.maxLevel) return 0;
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, ss.level));
  }, [state.structures]);

  const vgGetStructureBonus = useCallback((structureId: string): { type: string; value: number } | null => {
    const def = VG_STRUCTURES.find((s) => s.id === structureId);
    const ss = state.structures[structureId];
    if (!def || !ss || !ss.built) return null;
    return { type: def.bonusType, value: def.bonusPerLevel * ss.level };
  }, [state.structures]);

  // ---- Abilities ----

  const vgGetAbilities = useCallback((): VgAbilityDef[] => {
    return [...VG_ABILITIES];
  }, []);

  const vgGetAbilityById = useCallback((id: string): VgAbilityDef | null => {
    return VG_ABILITIES.find((a) => a.id === id) ?? null;
  }, []);

  const vgLearnAbility = useCallback((abilityId: string): { success: boolean; state: VoidGardenState } => {
    const def = VG_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.abilities[abilityId]?.learned) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        abilities: {
          ...prev.abilities,
          [abilityId]: { ...prev.abilities[abilityId], learned: true },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgCastAbility = useCallback((abilityId: string, now: number = Date.now()): { success: boolean; state: VoidGardenState } => {
    const def = VG_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return { success: false, state };
    const abilityState = state.abilities[abilityId];
    if (!abilityState || !abilityState.learned) return { success: false, state };
    if (now < abilityState.cooldownEnd) return { success: false, state };
    if (state.voidEnergy < def.voidCost) return { success: false, state };
    let next = state;
    setState((prev) => {
      const as = prev.abilities[abilityId];
      next = {
        ...prev,
        abilities: {
          ...prev.abilities,
          [abilityId]: {
            ...as!,
            castCount: as!.castCount + 1,
            cooldownEnd: now + def.cooldown * 1000,
          },
        },
        voidEnergy: vgClampEnergy(prev.voidEnergy - def.voidCost, prev.maxVoidEnergy),
        totals: {
          ...prev.totals,
          totalAbilitiesCast: prev.totals.totalAbilitiesCast + 1,
          totalCosmicEnergySpent: prev.totals.totalCosmicEnergySpent + def.voidCost,
        },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(def.xpReward);
      while (lvl < VG_MAX_LEVEL && xp >= vgXpRequired(lvl)) {
        xp -= vgXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= VG_MAX_LEVEL) xp = 0;
      next = { ...next, level: vgClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgIsAbilityLearned = useCallback((abilityId: string): boolean => {
    return state.abilities[abilityId]?.learned ?? false;
  }, [state.abilities]);

  const vgGetLearnedAbilities = useCallback((): VgAbilityDef[] => {
    return VG_ABILITIES.filter((a) => state.abilities[a.id]?.learned);
  }, [state.abilities]);

  const vgGetAbilityCooldown = useCallback((abilityId: string, now: number = Date.now()): number => {
    const as = state.abilities[abilityId];
    if (!as) return 0;
    return Math.max(0, Math.ceil((as.cooldownEnd - now) / 1000));
  }, [state.abilities]);

  const vgGetAbilityCastCount = useCallback((abilityId: string): number => {
    return state.abilities[abilityId]?.castCount ?? 0;
  }, [state.abilities]);

  const vgCanCastAbility = useCallback((abilityId: string, now: number = Date.now()): boolean => {
    const def = VG_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return false;
    const as = state.abilities[abilityId];
    if (!as || !as.learned) return false;
    if (state.voidEnergy < def.voidCost) return false;
    return now >= as.cooldownEnd;
  }, [state.abilities, state.voidEnergy]);

  const vgGetAbilitiesByRarity = useCallback((rarity: VgRarity): VgAbilityDef[] => {
    return VG_ABILITIES.filter((a) => a.rarity === rarity);
  }, []);

  const vgGetAbilityInfo = useCallback((abilityId: string): VgAbilityState | null => {
    return state.abilities[abilityId] ?? null;
  }, [state.abilities]);

  // ---- Planted Plots ----

  const vgPlantVoidSeed = useCallback((plantId: string, realmId: string): { success: boolean; plotId: string; state: VoidGardenState } => {
    const plantDef = VG_PLANTS.find((p) => p.id === plantId);
    if (!plantDef) return { success: false, plotId: '', state };
    if (state.level < plantDef.requiredLevel) return { success: false, plotId: '', state };
    const realmState = state.realms[realmId];
    if (!realmState || !realmState.explored) return { success: false, plotId: '', state };
    const cost = Math.floor(15 * (1 + VG_PLANTS.indexOf(plantDef) * 0.3));
    if (state.coins < cost) return { success: false, plotId: '', state };
    if (state.voidEnergy < 5) return { success: false, plotId: '', state };
    const plotId = vgMakeId('plot');
    const newPlot: VgPlantedPlot = {
      id: plotId,
      plantId,
      realmId,
      plantedAt: Date.now(),
      growth: 0,
      health: 100,
      nourished: false,
      lastNourishedAt: null,
      crossPollinated: false,
    };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        plantedPlots: [...prev.plantedPlots, newPlot],
        coins: vgClampCoins(prev.coins - cost),
        voidEnergy: vgClampEnergy(prev.voidEnergy - 5, prev.maxVoidEnergy),
        plants: {
          ...prev.plants,
          [plantId]: { ...prev.plants[plantId], planted: true, count: (prev.plants[plantId]?.count ?? 0) + 1, plantedAt: Date.now() },
        },
        realms: {
          ...prev.realms,
          [realmId]: { ...prev.realms[realmId]!, plantedCount: prev.realms[realmId]!.plantedCount + 1 },
        },
        totals: {
          ...prev.totals,
          totalPlanted: prev.totals.totalPlanted + (prev.plants[plantId]?.planted ? 0 : 1),
          totalCosmicEnergySpent: prev.totals.totalCosmicEnergySpent + 5,
        },
      };
      return next;
    });
    return { success: true, plotId, state: next };
  }, [state]);

  const vgGetPlantedPlots = useCallback((): VgPlantedPlot[] => {
    return [...state.plantedPlots];
  }, [state.plantedPlots]);

  const vgGetPlotGrowth = useCallback((plotId: string): number => {
    const plot = state.plantedPlots.find((p) => p.id === plotId);
    if (!plot) return 0;
    const def = VG_PLANTS.find((p) => p.id === plot.plantId);
    if (!def) return 0;
    const realmState = state.realms[plot.realmId];
    const realmLevel = realmState?.level ?? 1;
    const growthBonus = Object.values(state.structures).reduce((sum, ss) => {
      if (!ss.built) return sum;
      const sdef = VG_STRUCTURES.find((s) => s.id === Object.keys(state.structures).find((k) => state.structures[k] === ss));
      if (sdef && sdef.bonusType === 'growth_speed') return sum + sdef.bonusPerLevel * ss.level;
      return sum;
    }, 0);
    const growthMult = 1 + (growthBonus + realmLevel * 2) / 100;
    const elapsed = Date.now() - plot.plantedAt;
    const growthTimeSeconds = Math.max(30, 600 / (def.growthSpeed * growthMult));
    return Math.min(100, (elapsed / (growthTimeSeconds * 1000)) * 100);
  }, [state.plantedPlots, state.realms, state.structures]);

  const vgNourishPlot = useCallback((plotId: string): { success: boolean; state: VoidGardenState } => {
    const plotIdx = state.plantedPlots.findIndex((p) => p.id === plotId);
    if (plotIdx === -1) return { success: false, state };
    const plot = state.plantedPlots[plotIdx];
    if (plot.nourished) return { success: false, state };
    if (state.voidEnergy < 8) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newPlots = [...prev.plantedPlots];
      newPlots[plotIdx] = {
        ...newPlots[plotIdx],
        nourished: true,
        lastNourishedAt: Date.now(),
        growth: Math.min(100, newPlots[plotIdx].growth + 15),
      };
      next = {
        ...prev,
        plantedPlots: newPlots,
        voidEnergy: vgClampEnergy(prev.voidEnergy - 8, prev.maxVoidEnergy),
        totals: { ...prev.totals, totalCosmicEnergySpent: prev.totals.totalCosmicEnergySpent + 8 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgRemovePlot = useCallback((plotId: string): { success: boolean; state: VoidGardenState } => {
    const plotIdx = state.plantedPlots.findIndex((p) => p.id === plotId);
    if (plotIdx === -1) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, plantedPlots: prev.plantedPlots.filter((p) => p.id !== plotId) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgGetPlotById = useCallback((plotId: string): VgPlantedPlot | null => {
    return state.plantedPlots.find((p) => p.id === plotId) ?? null;
  }, [state.plantedPlots]);

  const vgGetPlotsInRealm = useCallback((realmId: string): VgPlantedPlot[] => {
    return state.plantedPlots.filter((p) => p.realmId === realmId);
  }, [state.plantedPlots]);

  // ---- Cross-Pollination ----

  const vgCrossPollinate = useCallback((plotId1: string, plotId2: string): { success: boolean; state: VoidGardenState } => {
    const plot1 = state.plantedPlots.find((p) => p.id === plotId1);
    const plot2 = state.plantedPlots.find((p) => p.id === plotId2);
    if (!plot1 || !plot2) return { success: false, state };
    if (plot1.crossPollinated || plot2.crossPollinated) return { success: false, state };
    if (state.voidEnergy < 15) return { success: false, state };

    const crossPollBonus = Object.values(state.structures).reduce((sum, ss) => {
      if (!ss.built) return sum;
      for (const sdef of VG_STRUCTURES) {
        const sKey = Object.keys(state.structures).find((k) => state.structures[k] === ss);
        if (sKey && sdef.id === sKey && sdef.bonusType === 'crosspollinate_chance') {
          return sum + sdef.bonusPerLevel * ss.level;
        }
      }
      return sum;
    }, 0);
    const successChance = 0.3 + crossPollBonus * 0.01;
    const rng = prngRef.current();
    if (rng > successChance) {
      let next = state;
      setState((prev) => ({
        ...prev,
        voidEnergy: vgClampEnergy(prev.voidEnergy - 15, prev.maxVoidEnergy),
        totals: { ...prev.totals, totalCosmicEnergySpent: prev.totals.totalCosmicEnergySpent + 15 },
      }));
      return { success: false, state: next };
    }

    let next = state;
    setState((prev) => {
      const newPlots = prev.plantedPlots.map((p) => {
        if (p.id === plotId1 || p.id === plotId2) {
          return { ...p, crossPollinated: true, health: Math.min(100, p.health + 20), growth: Math.min(100, p.growth + 20) };
        }
        return p;
      });
      next = {
        ...prev,
        plantedPlots: newPlots,
        voidEnergy: vgClampEnergy(prev.voidEnergy - 15, prev.maxVoidEnergy),
        totals: {
          ...prev.totals,
          totalCrossPollinated: prev.totals.totalCrossPollinated + 1,
          totalCosmicEnergySpent: prev.totals.totalCosmicEnergySpent + 15,
        },
      };
      let lvl = next.level;
      let xp = next.xp + 25;
      while (lvl < VG_MAX_LEVEL && xp >= vgXpRequired(lvl)) {
        xp -= vgXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= VG_MAX_LEVEL) xp = 0;
      next = { ...next, level: vgClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Reality Pruning ----

  const vgRealityPrune = useCallback((plotId: string): { success: boolean; state: VoidGardenState } => {
    const plotIdx = state.plantedPlots.findIndex((p) => p.id === plotId);
    if (plotIdx === -1) return { success: false, state };
    if (state.voidEnergy < 10) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newPlots = [...prev.plantedPlots];
      const plot = newPlots[plotIdx];
      newPlots[plotIdx] = {
        ...plot,
        health: Math.min(100, plot.health + 25),
        growth: Math.min(100, plot.growth + 8),
      };
      next = {
        ...prev,
        plantedPlots: newPlots,
        voidEnergy: vgClampEnergy(prev.voidEnergy - 10, prev.maxVoidEnergy),
        totals: {
          ...prev.totals,
          totalPruned: prev.totals.totalPruned + 1,
          totalCosmicEnergySpent: prev.totals.totalCosmicEnergySpent + 10,
        },
      };
      let lvl = next.level;
      let xp = next.xp + 15;
      while (lvl < VG_MAX_LEVEL && xp >= vgXpRequired(lvl)) {
        xp -= vgXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= VG_MAX_LEVEL) xp = 0;
      next = { ...next, level: vgClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Cosmic Harvest ----

  const vgHarvestCosmic = useCallback((plotId: string): { success: boolean; rewards: { coins: number; xp: number; energy: number; essenceId: string; essenceAmount: number } | null; state: VoidGardenState } => {
    const plot = state.plantedPlots.find((p) => p.id === plotId);
    if (!plot) return { success: false, rewards: null, state };

    const plantDef = VG_PLANTS.find((p) => p.id === plot.plantId);
    if (!plantDef) return { success: false, rewards: null, state };

    const realmState = state.realms[plot.realmId];
    const realmLevel = realmState?.level ?? 1;
    const growthBonus = Object.values(state.structures).reduce((sum, ss) => {
      if (!ss.built) return sum;
      for (const sdef of VG_STRUCTURES) {
        const sKey = Object.keys(state.structures).find((k) => state.structures[k] === ss);
        if (sKey && sdef.id === sKey && sdef.bonusType === 'growth_speed') {
          return sum + sdef.bonusPerLevel * ss.level;
        }
      }
      return sum;
    }, 0);
    const growthMult = 1 + (growthBonus + realmLevel * 2) / 100;
    const growthTimeSeconds = Math.max(30, 600 / (plantDef.growthSpeed * growthMult));
    const elapsed = Date.now() - plot.plantedAt;
    const growthPercent = (elapsed / (growthTimeSeconds * 1000)) * 100;
    const actualGrowth = Math.min(100, growthPercent + plot.growth);

    if (actualGrowth < 100) return { success: false, rewards: null, state };

    const rarityMult = vgRarityMultiplier(plantDef.rarity);
    const crossPollBonus = plot.crossPollinated ? 1.5 : 1;
    const harvestBonus = Object.values(state.structures).reduce((sum, ss) => {
      if (!ss.built) return sum;
      for (const sdef of VG_STRUCTURES) {
        const sKey = Object.keys(state.structures).find((k) => state.structures[k] === ss);
        if (sKey && sdef.id === sKey && sdef.bonusType === 'harvest_bonus') {
          return sum + sdef.bonusPerLevel * ss.level;
        }
      }
      return sum;
    }, 0);
    const totalMult = rarityMult * crossPollBonus * (1 + harvestBonus / 100);

    const coinsReward = Math.floor(plantDef.cosmicPower * totalMult * 2);
    const xpReward = Math.floor(plantDef.cosmicPower * totalMult * 1.5);
    const energyReward = Math.floor(plantDef.cosmicPower * totalMult * 0.5);

    const realmDef = VG_REALMS.find((r) => r.id === plot.realmId);
    const essenceId = realmDef?.essenceList[0] ?? 'void_dew';
    const essenceAmount = Math.ceil(totalMult);

    const rewards = { coins: coinsReward, xp: xpReward, energy: energyReward, essenceId, essenceAmount };

    let next = state;
    setState((prev) => {
      const newPlots = prev.plantedPlots.filter((p) => p.id !== plotId);
      const newEssences = { ...prev.essences, [essenceId]: (prev.essences[essenceId] ?? 0) + essenceAmount };
      const newPlants = { ...prev.plants };
      if (newPlants[plot.plantId]) {
        newPlants[plot.plantId] = { ...newPlants[plot.plantId], fullyGrown: true, harvestedCount: newPlants[plot.plantId].harvestedCount + 1 };
      }
      const newRealms = { ...prev.realms };
      if (newRealms[plot.realmId]) {
        newRealms[plot.realmId] = { ...newRealms[plot.realmId], harvestedCount: newRealms[plot.realmId].harvestedCount + 1 };
      }
      next = {
        ...prev,
        plantedPlots: newPlots,
        essences: newEssences,
        plants: newPlants,
        realms: newRealms,
        coins: vgClampCoins(prev.coins + coinsReward),
        voidEnergy: vgClampEnergy(prev.voidEnergy + energyReward, prev.maxVoidEnergy),
        totals: { ...prev.totals, totalHarvested: prev.totals.totalHarvested + 1 },
      };
      let lvl = next.level;
      let xp = next.xp + xpReward;
      while (lvl < VG_MAX_LEVEL && xp >= vgXpRequired(lvl)) {
        xp -= vgXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= VG_MAX_LEVEL) xp = 0;
      next = { ...next, level: vgClampLevel(lvl), xp };
      return next;
    });
    return { success: true, rewards, state: next };
  }, [state]);

  // ---- Daily Quest ----

  const vgGetDailyQuest = useCallback((): VgDailyQuestState => {
    return { ...state.dailyQuest };
  }, [state.dailyQuest]);

  const vgStartDailyQuest = useCallback((): { success: boolean; state: VoidGardenState } => {
    const today = vgGenerateDayKey(Date.now());
    if (state.dailyQuest.lastDate === today) return { success: false, state };
    const questIdx = Math.floor(prngRef.current() * VG_DAILY_QUEST_TYPES.length);
    const quest = VG_DAILY_QUEST_TYPES[questIdx];
    const newStreak = state.dailyQuest.lastDate !== null
      ? (vgGenerateDayKey(Date.now() - 86400000) === state.dailyQuest.lastDate ? state.dailyQuest.streak + 1 : 1)
      : 1;
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        dailyQuest: {
          lastDate: today,
          streak: newStreak,
          completed: false,
          questType: quest.type,
          questProgress: 0,
          questTarget: quest.target,
          rewardClaimed: false,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgUpdateQuestProgress = useCallback((amount: number = 1): { success: boolean; state: VoidGardenState } => {
    const dq = state.dailyQuest;
    if (!dq.questType) return { success: false, state };
    if (dq.completed) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newProgress = Math.min(prev.dailyQuest.questTarget, prev.dailyQuest.questProgress + amount);
      const completed = newProgress >= prev.dailyQuest.questTarget;
      next = {
        ...prev,
        dailyQuest: {
          ...prev.dailyQuest,
          questProgress: newProgress,
          completed,
        },
      };
      if (completed) {
        const quest = VG_DAILY_QUEST_TYPES.find((q) => q.type === prev.dailyQuest.questType);
        if (quest) {
          const streakBonus = Math.floor(quest.rewardCoins * (prev.dailyQuest.streak * 0.1));
          const streakEnergy = Math.floor(quest.rewardVoidEnergy * (prev.dailyQuest.streak * 0.1));
          next = {
            ...next,
            coins: vgClampCoins(next.coins + quest.rewardCoins + streakBonus),
            voidEnergy: vgClampEnergy(next.voidEnergy + quest.rewardVoidEnergy + streakEnergy, next.maxVoidEnergy),
          };
          let lvl = next.level;
          let xp = next.xp + Math.floor(quest.rewardXp);
          while (lvl < VG_MAX_LEVEL && xp >= vgXpRequired(lvl)) {
            xp -= vgXpRequired(lvl);
            lvl += 1;
          }
          if (lvl >= VG_MAX_LEVEL) xp = 0;
          next = { ...next, level: vgClampLevel(lvl), xp };
        }
      }
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const vgGetQuestStreak = useCallback((): number => {
    return state.dailyQuest.streak;
  }, [state.dailyQuest]);

  const vgGetQuestInfo = useCallback((): { type: VgDailyQuestType | null; name: string; description: string; target: number; progress: number; rewardCoins: number; rewardXp: number; rewardVoidEnergy: number; emoji: string } | null => {
    const dq = state.dailyQuest;
    if (!dq.questType) return null;
    const questDef = VG_DAILY_QUEST_TYPES.find((q) => q.type === dq.questType);
    if (!questDef) return null;
    return {
      type: dq.questType,
      name: questDef.name,
      description: questDef.description,
      target: dq.questTarget,
      progress: dq.questProgress,
      rewardCoins: questDef.rewardCoins + Math.floor(questDef.rewardCoins * (dq.streak * 0.1)),
      rewardXp: questDef.rewardXp,
      rewardVoidEnergy: questDef.rewardVoidEnergy + Math.floor(questDef.rewardVoidEnergy * (dq.streak * 0.1)),
      emoji: questDef.emoji,
    };
  }, [state.dailyQuest]);

  const vgIsQuestComplete = useCallback((): boolean => {
    return state.dailyQuest.completed;
  }, [state.dailyQuest]);

  const vgClaimQuestReward = useCallback((): { success: boolean; state: VoidGardenState } => {
    if (!state.dailyQuest.completed || state.dailyQuest.rewardClaimed) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        dailyQuest: { ...prev.dailyQuest, rewardClaimed: true },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Achievements ----

  const vgGetAchievements = useCallback((): VgAchievementDef[] => {
    return [...VG_ACHIEVEMENTS];
  }, []);

  const vgGetAchievementById = useCallback((id: string): VgAchievementDef | null => {
    return VG_ACHIEVEMENTS.find((a) => a.id === id) ?? null;
  }, []);

  const vgIsAchievementUnlocked = useCallback((id: string): boolean => {
    return state.achievements[id]?.unlocked ?? false;
  }, [state.achievements]);

  const vgGetUnlockedAchievements = useCallback((): VgAchievementDef[] => {
    return VG_ACHIEVEMENTS.filter((a) => state.achievements[a.id]?.unlocked);
  }, [state.achievements]);

  const vgGetLockedAchievements = useCallback((): VgAchievementDef[] => {
    return VG_ACHIEVEMENTS.filter((a) => !state.achievements[a.id]?.unlocked);
  }, [state.achievements]);

  const vgCheckAchievements = useCallback((): { newlyUnlocked: VgAchievementDef[]; state: VoidGardenState } => {
    const newlyUnlocked: VgAchievementDef[] = [];
    let next = state;
    setState((prev) => {
      const newAchievements = { ...prev.achievements };
      const totalsMap: Record<string, number> = {
        totalPlanted: prev.totals.totalPlanted,
        totalHarvested: prev.totals.totalHarvested,
        totalCrossPollinated: prev.totals.totalCrossPollinated,
        totalPruned: prev.totals.totalPruned,
        totalStructuresBuilt: prev.totals.totalStructuresBuilt,
        totalAbilitiesCast: prev.totals.totalAbilitiesCast,
        totalEssencesGathered: prev.totals.totalEssencesGathered,
        totalRealmsExplored: prev.totals.totalRealmsExplored,
        totalCosmicEnergySpent: prev.totals.totalCosmicEnergySpent,
        level: prev.level,
      };
      for (const ach of VG_ACHIEVEMENTS) {
        const achState = newAchievements[ach.id];
        if (achState && !achState.unlocked) {
          const value = totalsMap[ach.conditionKey] ?? 0;
          if (value >= ach.targetValue) {
            newAchievements[ach.id] = { ...achState, unlocked: true, unlockedAt: Date.now() };
            newlyUnlocked.push(ach);
          }
        }
      }
      next = { ...prev, achievements: newAchievements };
      return next;
    });
    return { newlyUnlocked, state: next };
  }, [state]);

  const vgGetAchievementProgress = useCallback((id: string): { current: number; target: number; percentage: number } => {
    const def = VG_ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return { current: 0, target: 0, percentage: 0 };
    const totalsMap: Record<string, number> = {
      totalPlanted: state.totals.totalPlanted,
      totalHarvested: state.totals.totalHarvested,
      totalCrossPollinated: state.totals.totalCrossPollinated,
      totalPruned: state.totals.totalPruned,
      totalStructuresBuilt: state.totals.totalStructuresBuilt,
      totalAbilitiesCast: state.totals.totalAbilitiesCast,
      totalEssencesGathered: state.totals.totalEssencesGathered,
      totalRealmsExplored: state.totals.totalRealmsExplored,
      totalCosmicEnergySpent: state.totals.totalCosmicEnergySpent,
      level: state.level,
    };
    const current = Math.min(totalsMap[def.conditionKey] ?? 0, def.targetValue);
    return { current, target: def.targetValue, percentage: def.targetValue > 0 ? current / def.targetValue : 0 };
  }, [state]);

  const vgGetAchievementCount = useCallback((): number => {
    return Object.values(state.achievements).filter((a) => a.unlocked).length;
  }, [state.achievements]);

  const vgGetAchievementInfo = useCallback((id: string): VgAchievementState | null => {
    return state.achievements[id] ?? null;
  }, [state.achievements]);

  // ---- Void Energy Management ----

  const vgGetEnergyRegenRate = useCallback((): number => {
    let regen = 1;
    for (const [sId, ss] of Object.entries(state.structures)) {
      if (!ss.built) continue;
      const sdef = VG_STRUCTURES.find((s) => s.id === sId);
      if (sdef && sdef.bonusType === 'void_energy_regen') {
        regen += sdef.bonusPerLevel * ss.level;
      }
    }
    return regen;
  }, [state.structures]);

  const vgGetEffectiveMaxEnergy = useCallback((): number => {
    let maxE = state.maxVoidEnergy;
    for (const [sId, ss] of Object.entries(state.structures)) {
      if (!ss.built) continue;
      const sdef = VG_STRUCTURES.find((s) => s.id === sId);
      if (sdef && sdef.bonusType === 'max_void_energy') {
        maxE += sdef.bonusPerLevel * ss.level;
      }
    }
    return maxE;
  }, [state.maxVoidEnergy, state.structures]);

  // ---- Stats / Computed ----

  const vgGetTotalPlanted = useCallback((): number => {
    return state.totals.totalPlanted;
  }, [state.totals]);

  const vgGetTotalHarvested = useCallback((): number => {
    return state.totals.totalHarvested;
  }, [state.totals]);

  const vgGetTotalCrossPollinated = useCallback((): number => {
    return state.totals.totalCrossPollinated;
  }, [state.totals]);

  const vgGetTotalPruned = useCallback((): number => {
    return state.totals.totalPruned;
  }, [state.totals]);

  const vgGetTotalAbilitiesCast = useCallback((): number => {
    return state.totals.totalAbilitiesCast;
  }, [state.totals]);

  const vgGetOverallStats = useCallback((): VgTotals => {
    return { ...state.totals };
  }, [state.totals]);

  // ---- Computed Values (useMemo) ----

  const currentTitle = useMemo((): VgTitleInfo => {
    let current = VG_TITLES[0];
    for (const t of VG_TITLES) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const xpProgress = useMemo((): number => {
    const needed = vgXpRequired(state.level);
    if (needed === Infinity || needed <= 0) return 1;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const overallProgress = useMemo((): number => {
    return state.level / VG_MAX_LEVEL;
  }, [state.level]);

  const discoveredPlantCount = useMemo((): number => {
    return Object.values(state.plants).filter((p) => p.planted).length;
  }, [state.plants]);

  const exploredRealmCount = useMemo((): number => {
    return Object.values(state.realms).filter((r) => r.explored).length;
  }, [state.realms]);

  const totalEssenceCount = useMemo((): number => {
    return Object.values(state.essences).reduce((sum, count) => sum + count, 0);
  }, [state.essences]);

  const learnedAbilityCount = useMemo((): number => {
    return Object.values(state.abilities).filter((a) => a.learned).length;
  }, [state.abilities]);

  const builtStructureCount = useMemo((): number => {
    return Object.values(state.structures).filter((s) => s.built).length;
  }, [state.structures]);

  const unlockedAchievementCount = useMemo((): number => {
    return Object.values(state.achievements).filter((a) => a.unlocked).length;
  }, [state.achievements]);

  const activePlotCount = useMemo((): number => {
    return state.plantedPlots.length;
  }, [state.plantedPlots]);

  const fullyGrownPlotCount = useMemo((): number => {
    return state.plantedPlots.filter((plot) => {
      const def = VG_PLANTS.find((p) => p.id === plot.plantId);
      if (!def) return false;
      const realmState = state.realms[plot.realmId];
      const realmLevel = realmState?.level ?? 1;
      const growthBonus = Object.values(state.structures).reduce((sum, ss) => {
        if (!ss.built) return sum;
        for (const sdef of VG_STRUCTURES) {
          const sKey = Object.keys(state.structures).find((k) => state.structures[k] === ss);
          if (sKey && sdef.id === sKey && sdef.bonusType === 'growth_speed') {
            return sum + sdef.bonusPerLevel * ss.level;
          }
        }
        return sum;
      }, 0);
      const growthMult = 1 + (growthBonus + realmLevel * 2) / 100;
      const growthTimeSeconds = Math.max(30, 600 / (def.growthSpeed * growthMult));
      const elapsed = Date.now() - plot.plantedAt;
      const growthPercent = (elapsed / (growthTimeSeconds * 1000)) * 100;
      const actualGrowth = Math.min(100, growthPercent + plot.growth);
      return actualGrowth >= 100;
    }).length;
  }, [state.plantedPlots, state.realms, state.structures]);

  const totalBonusPower = useMemo((): Record<string, number> => {
    const bonuses: Record<string, number> = {};
    for (const [sId, ss] of Object.entries(state.structures)) {
      if (ss.built) {
        const def = VG_STRUCTURES.find((s) => s.id === sId);
        if (def) {
          bonuses[def.bonusType] = (bonuses[def.bonusType] ?? 0) + def.bonusPerLevel * ss.level;
        }
      }
    }
    return bonuses;
  }, [state.structures]);

  const cosmicPowerScore = useMemo((): number => {
    return Object.values(state.plants).reduce((sum, p) => {
      const def = VG_PLANTS.find((pl) => pl.id === Object.keys(state.plants).find((k) => state.plants[k] === p));
      if (def) return sum + def.cosmicPower * p.harvestedCount;
      return sum;
    }, 0);
  }, [state.plants]);

  // ---- Auto Achievement Check ----

  useEffect(() => {
    const checkAndNotify = () => {
      const s = stateRef.current;
      const totalsMap: Record<string, number> = {
        totalPlanted: s.totals.totalPlanted,
        totalHarvested: s.totals.totalHarvested,
        totalCrossPollinated: s.totals.totalCrossPollinated,
        totalPruned: s.totals.totalPruned,
        totalStructuresBuilt: s.totals.totalStructuresBuilt,
        totalAbilitiesCast: s.totals.totalAbilitiesCast,
        totalEssencesGathered: s.totals.totalEssencesGathered,
        totalRealmsExplored: s.totals.totalRealmsExplored,
        totalCosmicEnergySpent: s.totals.totalCosmicEnergySpent,
        level: s.level,
      };
      let changed = false;
      const newAchievements = { ...s.achievements };
      for (const ach of VG_ACHIEVEMENTS) {
        const achState = newAchievements[ach.id];
        if (achState && !achState.unlocked) {
          const value = totalsMap[ach.conditionKey] ?? 0;
          if (value >= ach.targetValue) {
            newAchievements[ach.id] = { ...achState, unlocked: true, unlockedAt: Date.now() };
            changed = true;
          }
        }
      }
      if (changed) {
        setState((prev) => ({ ...prev, achievements: newAchievements }));
      }
    };
    checkAndNotify();
  }, [state.totals, state.level]);

  // ---- Void Energy Auto Regen ----

  useEffect(() => {
    const interval = setInterval(() => {
      const regenRate = (() => {
        const s = stateRef.current;
        let regen = 1;
        for (const [sId, ss] of Object.entries(s.structures)) {
          if (!ss.built) continue;
          const sdef = VG_STRUCTURES.find((st) => st.id === sId);
          if (sdef && sdef.bonusType === 'void_energy_regen') {
            regen += sdef.bonusPerLevel * ss.level;
          }
        }
        return regen;
      })();
      setState((prev) => {
        if (prev.voidEnergy >= prev.maxVoidEnergy) return prev;
        return {
          ...prev,
          voidEnergy: vgClampEnergy(prev.voidEnergy + regenRate, prev.maxVoidEnergy),
        };
      });
    }, 5000);
    return () => { clearInterval(interval); };
  }, []);

  // ---- Color Theme ----

  const vgGetColorTheme = useCallback((): VgColorTheme => {
    return { ...VG_COLOR_THEME };
  }, []);

  // ---- Random Helpers ----

  const vgRandomInt = useCallback((min: number, max: number): number => {
    return min + Math.floor(prngRef.current() * (max - min + 1));
  }, []);

  const vgGetSeed = useCallback((): number => {
    return state.seed;
  }, [state.seed]);

  const vgSetSeed = useCallback((seed: number): void => {
    prngRef.current = vgMulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  // ---- Compat alias for persist middleware (placeholder) ----

  const vgPersistConfig = useMemo(() => ({
    name: 'void-garden-storage',
    version: 1,
  }), []);

  // ---- Multi-Plot Plant ----

  const vgPlantMultiple = useCallback((plantId: string, realmId: string, count: number): { success: boolean; plotIds: string[]; state: VoidGardenState } => {
    const plantDef = VG_PLANTS.find((p) => p.id === plantId);
    if (!plantDef) return { success: false, plotIds: [], state };
    if (state.level < plantDef.requiredLevel) return { success: false, plotIds: [], state };
    const realmState = state.realms[realmId];
    if (!realmState || !realmState.explored) return { success: false, plotIds: [], state };
    const costPerSeed = Math.floor(15 * (1 + VG_PLANTS.indexOf(plantDef) * 0.3));
    const totalCost = costPerSeed * count;
    const totalEnergy = 5 * count;
    if (state.coins < totalCost) return { success: false, plotIds: [], state };
    if (state.voidEnergy < totalEnergy) return { success: false, plotIds: [], state };

    const plotIds: string[] = [];
    const newPlots: VgPlantedPlot[] = [];
    for (let i = 0; i < count; i++) {
      const plotId = vgMakeId('plot');
      plotIds.push(plotId);
      newPlots.push({
        id: plotId,
        plantId,
        realmId,
        plantedAt: Date.now(),
        growth: 0,
        health: 100,
        nourished: false,
        lastNourishedAt: null,
        crossPollinated: false,
      });
    }

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        plantedPlots: [...prev.plantedPlots, ...newPlots],
        coins: vgClampCoins(prev.coins - totalCost),
        voidEnergy: vgClampEnergy(prev.voidEnergy - totalEnergy, prev.maxVoidEnergy),
        plants: {
          ...prev.plants,
          [plantId]: { ...prev.plants[plantId], planted: true, count: (prev.plants[plantId]?.count ?? 0) + count, plantedAt: Date.now() },
        },
        realms: {
          ...prev.realms,
          [realmId]: { ...prev.realms[realmId]!, plantedCount: prev.realms[realmId]!.plantedCount + count },
        },
        totals: {
          ...prev.totals,
          totalPlanted: prev.totals.totalPlanted + (prev.plants[plantId]?.planted ? 0 : 1),
          totalCosmicEnergySpent: prev.totals.totalCosmicEnergySpent + totalEnergy,
        },
      };
      return next;
    });
    return { success: true, plotIds, state: next };
  }, [state]);

  // ---- Bulk Harvest ----

  const vgHarvestAllReady = useCallback((): { harvested: number; totalRewards: { coins: number; xp: number; energy: number }; state: VoidGardenState } => {
    let harvested = 0;
    let totalCoins = 0;
    let totalXp = 0;
    let totalEnergy = 0;

    const readyPlotIds: string[] = [];
    for (const plot of state.plantedPlots) {
      const plantDef = VG_PLANTS.find((p) => p.id === plot.plantId);
      if (!plantDef) continue;
      const realmState = state.realms[plot.realmId];
      const realmLevel = realmState?.level ?? 1;
      const growthBonus = Object.values(state.structures).reduce((sum, ss) => {
        if (!ss.built) return sum;
        for (const sdef of VG_STRUCTURES) {
          const sKey = Object.keys(state.structures).find((k) => state.structures[k] === ss);
          if (sKey && sdef.id === sKey && sdef.bonusType === 'growth_speed') {
            return sum + sdef.bonusPerLevel * ss.level;
          }
        }
        return sum;
      }, 0);
      const growthMult = 1 + (growthBonus + realmLevel * 2) / 100;
      const growthTimeSeconds = Math.max(30, 600 / (plantDef.growthSpeed * growthMult));
      const elapsed = Date.now() - plot.plantedAt;
      const growthPercent = (elapsed / (growthTimeSeconds * 1000)) * 100;
      const actualGrowth = Math.min(100, growthPercent + plot.growth);
      if (actualGrowth >= 100) {
        readyPlotIds.push(plot.id);
        const rarityMult = vgRarityMultiplier(plantDef.rarity);
        const crossPollBonus = plot.crossPollinated ? 1.5 : 1;
        const harvestBonus = Object.values(state.structures).reduce((hbSum, ss) => {
          if (!ss.built) return hbSum;
          for (const sdef of VG_STRUCTURES) {
            const sKey = Object.keys(state.structures).find((k) => state.structures[k] === ss);
            if (sKey && sdef.id === sKey && sdef.bonusType === 'harvest_bonus') {
              return hbSum + sdef.bonusPerLevel * ss.level;
            }
          }
          return hbSum;
        }, 0);
        const totalMult = rarityMult * crossPollBonus * (1 + harvestBonus / 100);
        totalCoins += Math.floor(plantDef.cosmicPower * totalMult * 2);
        totalXp += Math.floor(plantDef.cosmicPower * totalMult * 1.5);
        totalEnergy += Math.floor(plantDef.cosmicPower * totalMult * 0.5);
      }
    }

    if (readyPlotIds.length === 0) return { harvested: 0, totalRewards: { coins: 0, xp: 0, energy: 0 }, state };

    harvested = readyPlotIds.length;

    let next = state;
    setState((prev) => {
      const remainingPlots = prev.plantedPlots.filter((p) => { return !readyPlotIds.includes(p.id); });
      let newCoins = prev.coins + totalCoins;
      let newEnergy = prev.voidEnergy + totalEnergy;
      let newLevel = prev.level;
      let newXp = prev.xp + totalXp;
      while (newLevel < VG_MAX_LEVEL && newXp >= vgXpRequired(newLevel)) {
        newXp -= vgXpRequired(newLevel);
        newLevel += 1;
      }
      if (newLevel >= VG_MAX_LEVEL) newXp = 0;

      next = {
        ...prev,
        plantedPlots: remainingPlots,
        coins: vgClampCoins(newCoins),
        voidEnergy: vgClampEnergy(newEnergy, prev.maxVoidEnergy),
        level: vgClampLevel(newLevel),
        xp: newXp,
        totals: { ...prev.totals, totalHarvested: prev.totals.totalHarvested + harvested },
      };
      return next;
    });
    return { harvested, totalRewards: { coins: totalCoins, xp: totalXp, energy: totalEnergy }, state: next };
  }, [state]);

  // ---- Feed Essence to Plot ----

  const vgFeedEssenceToPlot = useCallback((plotId: string, essenceId: string): { success: boolean; state: VoidGardenState } => {
    const plotIdx = state.plantedPlots.findIndex((p) => p.id === plotId);
    if (plotIdx === -1) return { success: false, state };
    const essenceCount = state.essences[essenceId] ?? 0;
    if (essenceCount < 1) return { success: false, state };

    let next = state;
    setState((prev) => {
      const newPlots = [...prev.plantedPlots];
      newPlots[plotIdx] = {
        ...newPlots[plotIdx],
        health: Math.min(100, newPlots[plotIdx].health + 10),
        growth: Math.min(100, newPlots[plotIdx].growth + 5),
      };
      const newEssences = { ...prev.essences };
      newEssences[essenceId] -= 1;
      if (newEssences[essenceId] <= 0) { delete newEssences[essenceId]; }
      next = { ...prev, plantedPlots: newPlots, essences: newEssences };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ============================================================
  // Return Object
  // ============================================================

  return {
    // State
    vgGetState,
    vgResetState,

    // Level / XP
    vgGetLevel,
    vgGetXp,
    vgGetXPTillNext,
    vgAddXp,

    // Coins
    vgGetCoins,
    vgAddCoins,
    vgSpendCoins,
    vgCanAfford,

    // Void Energy
    vgGetVoidEnergy,
    vgGetMaxVoidEnergy,
    vgAddVoidEnergy,
    vgSpendVoidEnergy,
    vgCanAffordEnergy,
    vgRegenVoidEnergy,
    vgGetEnergyRegenRate,
    vgGetEffectiveMaxEnergy,
    vgGetEnergyProgress,

    // Title
    vgGetTitle,
    vgGetAllTitles,
    vgGetNextTitle,

    // Progress
    vgGetProgress,
    vgGetOverallProgress,

    // Plants
    vgGetPlants,
    vgGetPlantById,
    vgGetDiscoveredPlants,
    vgGetPlantByRarity,
    vgGetPlantByVoidType,
    vgDiscoverPlant,
    vgGetPlantDiscoveryCount,
    vgIsPlantDiscovered,
    vgGetPlantCount,
    vgGetPlantInfo,

    // Realms
    vgGetRealms,
    vgGetRealmById,
    vgExploreRealm,
    vgIsRealmExplored,
    vgGetRealmLevel,
    vgUpgradeRealm,
    vgGetExploredRealms,
    vgGetUnexploredRealms,
    vgGetRealmInfo,

    // Essences
    vgGetEssences,
    vgGetEssenceById,
    vgGetEssenceCount,
    vgGetAllEssenceCounts,
    vgGatherEssence,
    vgCanGatherEssence,
    vgGetEssencesByRarity,
    vgGetTotalEssencesGathered,
    vgGetEssenceInfo,
    vgGatherInRealm,

    // Structures
    vgGetStructures,
    vgGetStructureById,
    vgBuildStructure,
    vgUpgradeStructure,
    vgIsStructureBuilt,
    vgGetStructureLevel,
    vgGetBuiltStructures,
    vgGetStructureInfo,
    vgGetUpgradeCost,
    vgGetStructureBonus,

    // Abilities
    vgGetAbilities,
    vgGetAbilityById,
    vgLearnAbility,
    vgCastAbility,
    vgIsAbilityLearned,
    vgGetLearnedAbilities,
    vgGetAbilityCooldown,
    vgGetAbilityCastCount,
    vgCanCastAbility,
    vgGetAbilitiesByRarity,
    vgGetAbilityInfo,

    // Planted Plots
    vgPlantVoidSeed,
    vgPlantMultiple,
    vgGetPlantedPlots,
    vgGetPlotGrowth,
    vgNourishPlot,
    vgRemovePlot,
    vgGetPlotById,
    vgGetPlotsInRealm,

    // Cross-Pollination
    vgCrossPollinate,

    // Reality Pruning
    vgRealityPrune,

    // Cosmic Harvest
    vgHarvestCosmic,
    vgHarvestAllReady,

    // Feed Essence
    vgFeedEssenceToPlot,

    // Daily Quest
    vgGetDailyQuest,
    vgStartDailyQuest,
    vgUpdateQuestProgress,
    vgGetQuestStreak,
    vgGetQuestInfo,
    vgIsQuestComplete,
    vgClaimQuestReward,

    // Achievements
    vgGetAchievements,
    vgGetAchievementById,
    vgIsAchievementUnlocked,
    vgGetUnlockedAchievements,
    vgGetLockedAchievements,
    vgCheckAchievements,
    vgGetAchievementProgress,
    vgGetAchievementCount,
    vgGetAchievementInfo,

    // Stats
    vgGetTotalPlanted,
    vgGetTotalHarvested,
    vgGetTotalCrossPollinated,
    vgGetTotalPruned,
    vgGetTotalAbilitiesCast,
    vgGetOverallStats,

    // Helpers
    vgGetColorTheme,
    vgRandomInt,
    vgGetSeed,
    vgSetSeed,

    // Persist config
    vgPersistConfig,

    // Computed values
    currentTitle,
    xpProgress,
    overallProgress,
    discoveredPlantCount,
    exploredRealmCount,
    totalEssenceCount,
    learnedAbilityCount,
    builtStructureCount,
    unlockedAchievementCount,
    activePlotCount,
    fullyGrownPlotCount,
    totalBonusPower,
    cosmicPowerScore,
  };
}
