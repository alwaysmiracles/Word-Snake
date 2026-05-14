import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

// ============================================================
// Galaxy Garden — Cosmic Botanical Garden in Space
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// ============================================================

// ============================================================
// Types
// ============================================================

export type GyRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type GyGrowthStage = 'spore' | 'cosmic_sprout' | 'stellar_seedling' | 'nebula_budding' | 'galaxy_flowering' | 'cosmic_harvest';
export type GySectorType = 'nursery' | 'meadow' | 'vineyard' | 'grove' | 'greenhouse' | 'terrace' | 'orchard' | 'vault';
export type GyFertilizerType = 'growth' | 'yield' | 'quality' | 'resilience' | 'cosmic';
export type GyStructureType = 'utility' | 'decorative' | 'production' | 'defensive' | 'research';
export type GyAbilityCategory = 'cultivation' | 'harvest' | 'defense' | 'exploration' | 'cosmic';
export type GyHarvestEventType = 'meteor_shower' | 'solar_flare' | 'comet_tail' | 'dark_matter_wave' | 'nebula_bloom' | 'pulsar_surge';
export type GyDailyQuestType = 'plant' | 'fertilize' | 'harvest' | 'tend';

export interface GyPlantDef {
  id: string;
  name: string;
  rarity: GyRarity;
  seedCost: number;
  growTime: number;
  harvestValue: number;
  xpReward: number;
  sectorId: string;
  description: string;
  emoji: string;
  requiredLevel: number;
  hybridParents: string[];
}

export interface GySectorDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseGrowthBonus: number;
  baseHarvestBonus: number;
  baseUpgradeCost: number;
  maxSlots: number;
  unlockLevel: number;
}

export interface GyFertilizerDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: GyFertilizerType;
  power: number;
  duration: number;
  cost: number;
  requiredLevel: number;
}

export interface GyStructureDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  structureType: GyStructureType;
  bonusType: GyFertilizerType;
  baseBonusValue: number;
  baseBuildCost: number;
  requiredLevel: number;
}

export interface GyAbilityDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: GyAbilityCategory;
  cooldown: number;
  duration: number;
  power: number;
  unlockLevel: number;
  unlockCost: number;
}

export interface GyAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface GyTitleInfo {
  name: string;
  levelRequired: number;
  description: string;
  emoji: string;
}

export interface GyRarityInfo {
  key: GyRarity;
  label: string;
  color: string;
  xpMultiplier: number;
  coinMultiplier: number;
}

export interface GyHybridRecipe {
  parentA: string;
  parentB: string;
  result: string;
  resultName: string;
  resultEmoji: string;
  requiredLevel: number;
}

export interface GyDailyTaskPoolDef {
  id: string;
  name: string;
  description: string;
  type: GyDailyQuestType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface GyHarvestEventDef {
  id: string;
  name: string;
  description: string;
  eventType: GyHarvestEventType;
  duration: number;
  growthMultiplier: number;
  yieldMultiplier: number;
  bonusResource: string;
  bonusAmount: number;
  emoji: string;
}

export interface GyPlantSlot {
  id: string;
  sectorId: string;
  plantId: string | null;
  plantedAt: number;
  harvestAt: number;
  growthStage: GyGrowthStage;
  fertilized: boolean;
  fertilizerType: GyFertilizerType | null;
  blessed: boolean;
  hybridParents: string[];
  harvestCount: number;
}

export interface GyStructureState {
  id: string;
  level: number;
  built: boolean;
}

export interface GyAbilityState {
  id: string;
  unlocked: boolean;
  lastUsedAt: number;
}

export interface GyAchievementState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface GyDailyTaskState {
  poolId: string;
  progress: number;
  claimed: boolean;
  dayKey: string;
}

export interface GyHybridRecord {
  id: string;
  parentA: string;
  parentB: string;
  resultPlantId: string;
  discovered: boolean;
  discoveredAt: number | null;
}

export interface GyHarvestEventState {
  eventId: string | null;
  startedAt: number;
  endsAt: number;
}

export interface GyGalaxyGardenState {
  level: number;
  xp: number;
  coins: number;
  unlockedPlants: string[];
  activeSector: string;
  unlockedSectors: string[];
  sectorLevels: Record<string, number>;
  seeds: Record<string, number>;
  fertilizers: Record<string, number>;
  plantSlots: GyPlantSlot[];
  structures: GyStructureState[];
  abilities: GyAbilityState[];
  unlockedAchievements: GyAchievementState[];
  dailyStreak: number;
  lastDaily: string | null;
  dailyTask: GyDailyTaskState | null;
  totalHarvested: number;
  totalEarned: number;
  totalSpent: number;
  totalPlanted: number;
  totalFertilized: number;
  totalHybridized: number;
  totalCosmicEvents: number;
  harvestEvent: GyHarvestEventState;
  hybridRecords: GyHybridRecord[];
  seed: number;
  harvestCountByRarity: Record<GyRarity, number>;
  gardenExpansionCount: number;
  structureUpgradeCount: number;
  abilityUseCount: number;
  cosmicEssence: number;
}

// ============================================================
// Seeded PRNG (mulberry32)
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

function gyHashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return hash;
}

// ============================================================
// XP / Level Helpers
// ============================================================

function gyXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= GY_MAX_LEVEL) return Infinity;
  return Math.floor(120 * level * (1 + level * 0.14));
}

function gyClampLevel(lvl: number): number {
  return Math.max(1, Math.min(GY_MAX_LEVEL, lvl));
}

function gyClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function gyGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function gyRarityMultiplier(r: GyRarity): number {
  const map: Record<GyRarity, number> = {
    common: 1, uncommon: 1.5, rare: 2.5, epic: 4, legendary: 7,
  };
  return map[r] ?? 1;
}

function gyRarityCoinMultiplier(r: GyRarity): number {
  const map: Record<GyRarity, number> = {
    common: 1, uncommon: 1.4, rare: 2, epic: 3.5, legendary: 6,
  };
  return map[r] ?? 1;
}

function gyGrowthStageFromProgress(progress: number): GyGrowthStage {
  if (progress < 0.17) return 'spore';
  if (progress < 0.33) return 'cosmic_sprout';
  if (progress < 0.5) return 'stellar_seedling';
  if (progress < 0.75) return 'nebula_budding';
  if (progress < 1) return 'galaxy_flowering';
  return 'cosmic_harvest';
}

// ============================================================
// Constants
// ============================================================

export const GY_MAX_LEVEL = 50;

export const GY_RARITIES: GyRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1, coinMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5, coinMultiplier: 1.4 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2.5, coinMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 4, coinMultiplier: 3.5 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 7, coinMultiplier: 6 },
];

export const GY_TITLE_THRESHOLDS: GyTitleInfo[] = [
  { name: 'Space Seedling', levelRequired: 1, description: 'A tiny cosmic sprout just beginning to feel the gravity of the stars', emoji: '🌱' },
  { name: 'Nebula Gardener', levelRequired: 7, description: 'Your first cosmic flowers bloom, painting the void with nebula colors', emoji: '🌿' },
  { name: 'Star Cultivator', levelRequired: 14, description: 'Starlight bends to your will — plants grow wherever you tread', emoji: '⭐' },
  { name: 'Comet Harvester', levelRequired: 21, description: 'You ride comet tails to gather rare cosmic pollen from distant worlds', emoji: '☄️' },
  { name: 'Pulsar Botanist', levelRequired: 28, description: 'Pulsar energy courses through your garden, accelerating all growth', emoji: '💫' },
  { name: 'Void Bloom Master', levelRequired: 35, description: 'Even the void itself yields to your botanical mastery', emoji: '🌌' },
  { name: 'Supernova Cultivator', levelRequired: 43, description: 'Your garden explodes with new life after every stellar cycle', emoji: '💥' },
  { name: 'Cosmic Gardener', levelRequired: 50, description: 'You tend the gardens of galaxies — the universe is your greenhouse', emoji: '👨‍🚀' },
];

export const GY_GROWTH_STAGES: GyGrowthStage[] = [
  'spore', 'cosmic_sprout', 'stellar_seedling', 'nebula_budding', 'galaxy_flowering', 'cosmic_harvest',
];

// ============================================================
// 8 Garden Sectors
// ============================================================

export const GY_SECTORS: GySectorDef[] = [
  { id: 'nebula_nursery', name: 'Nebula Nursery', description: 'A soft-glowing nursery where stardust-infused seeds first sprout under swirling nebula light', emoji: '🌌', maxLevel: 10, baseGrowthBonus: 5, baseHarvestBonus: 5, baseUpgradeCost: 80, maxSlots: 8, unlockLevel: 1 },
  { id: 'starflower_meadow', name: 'Starflower Meadow', description: 'An open field of bioluminescent flowers that bloom in stellar patterns at night', emoji: '🌸', maxLevel: 10, baseGrowthBonus: 8, baseHarvestBonus: 8, baseUpgradeCost: 120, maxSlots: 8, unlockLevel: 1 },
  { id: 'comet_vineyard', name: 'Comet Vineyard', description: 'Vines that grow along comet trails, their fruit charged with kinetic cosmic energy', emoji: '🍇', maxLevel: 10, baseGrowthBonus: 10, baseHarvestBonus: 12, baseUpgradeCost: 180, maxSlots: 8, unlockLevel: 5 },
  { id: 'gravity_grove', name: 'Gravity Grove', description: 'Trees that manipulate local gravity, creating floating gardens and orbital fruit', emoji: '🌳', maxLevel: 10, baseGrowthBonus: 12, baseHarvestBonus: 10, baseUpgradeCost: 220, maxSlots: 8, unlockLevel: 10 },
  { id: 'pulsar_greenhouse', name: 'Pulsar Greenhouse', description: 'A radiation-shielded dome powered by pulsar energy — grows plants at 3x speed', emoji: '🏡', maxLevel: 10, baseGrowthBonus: 20, baseHarvestBonus: 8, baseUpgradeCost: 300, maxSlots: 8, unlockLevel: 15 },
  { id: 'void_bloom_terrace', name: 'Void Bloom Terrace', description: 'Terraced gardens on the edge of the void — only the hardiest cosmic flora survive here', emoji: '🕳️', maxLevel: 10, baseGrowthBonus: 8, baseHarvestBonus: 18, baseUpgradeCost: 350, maxSlots: 8, unlockLevel: 22 },
  { id: 'supernova_orchard', name: 'Supernova Orchard', description: 'Ancient trees that bloom only during stellar explosions, bearing supernova fruit', emoji: '🍎', maxLevel: 10, baseGrowthBonus: 15, baseHarvestBonus: 22, baseUpgradeCost: 450, maxSlots: 8, unlockLevel: 30 },
  { id: 'cosmic_seed_vault', name: 'Cosmic Seed Vault', description: 'The most secure chamber in the galaxy — stores and cultivates the rarest seeds from across the universe', emoji: '🏦', maxLevel: 10, baseGrowthBonus: 18, baseHarvestBonus: 25, baseUpgradeCost: 600, maxSlots: 8, unlockLevel: 40 },
];

// ============================================================
// 35 Cosmic Plants (5 rarity tiers)
// ============================================================

export const GY_PLANTS: GyPlantDef[] = [
  // ---- Common (8) ----
  { id: 'star_daisy', name: 'Star Daisy', rarity: 'common', seedCost: 5, growTime: 25, harvestValue: 14, xpReward: 8, sectorId: 'nebula_nursery', description: 'Simple daisies that emit a faint starlight glow when touched', emoji: '🌼', requiredLevel: 1, hybridParents: [] },
  { id: 'moon_clover', name: 'Moon Clover', rarity: 'common', seedCost: 4, growTime: 20, harvestValue: 10, xpReward: 6, sectorId: 'starflower_meadow', description: 'Four-leaf clovers that grow best in low-gravity moonlight', emoji: '🍀', requiredLevel: 1, hybridParents: [] },
  { id: 'cosmic_grass', name: 'Cosmic Grass', rarity: 'common', seedCost: 3, growTime: 15, harvestValue: 8, xpReward: 5, sectorId: 'nebula_nursery', description: 'Swaying purple grass that hums with subtle cosmic vibrations', emoji: '🌾', requiredLevel: 1, hybridParents: [] },
  { id: 'aster_moss', name: 'Asteroid Moss', rarity: 'common', seedCost: 4, growTime: 18, harvestValue: 9, xpReward: 6, sectorId: 'gravity_grove', description: 'Moss that grows on floating asteroids, absorbing mineral-rich cosmic dust', emoji: '🪨', requiredLevel: 1, hybridParents: [] },
  { id: 'solar_tulip', name: 'Solar Tulip', rarity: 'common', seedCost: 5, growTime: 22, harvestValue: 12, xpReward: 7, sectorId: 'starflower_meadow', description: 'Golden tulips that track solar flares and turn to face the nearest star', emoji: '🌻', requiredLevel: 1, hybridParents: [] },
  { id: 'plasma_fern', name: 'Plasma Fern', rarity: 'common', seedCost: 4, growTime: 20, harvestValue: 11, xpReward: 7, sectorId: 'nebula_nursery', description: 'Fronds crackling with contained plasma — harmless but visually spectacular', emoji: '🌿', requiredLevel: 1, hybridParents: [] },
  { id: 'dustbloom', name: 'Dustbloom', rarity: 'common', seedCost: 3, growTime: 16, harvestValue: 9, xpReward: 5, sectorId: 'comet_vineyard', description: 'Tiny flowers that feed on cosmic dust and release oxygen in thin atmospheres', emoji: '💧', requiredLevel: 1, hybridParents: [] },
  { id: 'grav_berry', name: 'Gravity Berry', rarity: 'common', seedCost: 5, growTime: 24, harvestValue: 13, xpReward: 8, sectorId: 'gravity_grove', description: 'Berries that float upward when ripe — a favorite snack of space travelers', emoji: '🫐', requiredLevel: 1, hybridParents: [] },
  // ---- Uncommon (8) ----
  { id: 'quasar_rose', name: 'Quasar Rose', rarity: 'uncommon', seedCost: 14, growTime: 40, harvestValue: 32, xpReward: 18, sectorId: 'starflower_meadow', description: 'Roses whose petals pulse with quasar-like intensity, blindingly beautiful', emoji: '🌹', requiredLevel: 4, hybridParents: [] },
  { id: 'dark_ivy', name: 'Dark Matter Ivy', rarity: 'uncommon', seedCost: 16, growTime: 45, harvestValue: 36, xpReward: 20, sectorId: 'void_bloom_terrace', description: 'Invisible roots anchored in dark matter — only the leaves are visible, floating in space', emoji: '🖤', requiredLevel: 5, hybridParents: [] },
  { id: 'nova_lily', name: 'Nova Lily', rarity: 'uncommon', seedCost: 15, growTime: 42, harvestValue: 34, xpReward: 19, sectorId: 'nebula_nursery', description: 'Lilies that briefly flare like a nova when they bloom, releasing energy spores', emoji: '💫', requiredLevel: 5, hybridParents: [] },
  { id: 'warp_vine', name: 'Warp Vine', rarity: 'uncommon', seedCost: 18, growTime: 48, harvestValue: 40, xpReward: 22, sectorId: 'comet_vineyard', description: 'Vines that grow faster than light — their tendrils stretch across folded space', emoji: '🌀', requiredLevel: 6, hybridParents: [] },
  { id: 'neutron_shroom', name: 'Neutron Shroom', rarity: 'uncommon', seedCost: 13, growTime: 38, harvestValue: 30, xpReward: 17, sectorId: 'gravity_grove', description: 'Extremely dense mushrooms — a single cap weighs more than a small moon', emoji: '🍄', requiredLevel: 4, hybridParents: [] },
  { id: 'solar_orchid', name: 'Solar Orchid', rarity: 'uncommon', seedCost: 15, growTime: 44, harvestValue: 35, xpReward: 20, sectorId: 'starflower_meadow', description: 'Orchids that bloom in synchronized patterns during solar eclipses', emoji: '🪻', requiredLevel: 6, hybridParents: [] },
  { id: 'crystal_sage', name: 'Crystal Sage', rarity: 'uncommon', seedCost: 12, growTime: 36, harvestValue: 28, xpReward: 16, sectorId: 'pulsar_greenhouse', description: 'Herbaceous plants with crystalline leaves that store cosmic knowledge', emoji: '💎', requiredLevel: 4, hybridParents: [] },
  { id: 'ion_cactus', name: 'Ion Cactus', rarity: 'uncommon', seedCost: 11, growTime: 34, harvestValue: 26, xpReward: 15, sectorId: 'comet_vineyard', description: 'Cacti that generate ion storms to protect themselves from space pests', emoji: '🌵', requiredLevel: 3, hybridParents: [] },
  // ---- Rare (7) ----
  { id: 'void_lotus', name: 'Void Lotus', rarity: 'rare', seedCost: 35, growTime: 65, harvestValue: 75, xpReward: 42, sectorId: 'void_bloom_terrace', description: 'Blooms in the space between dimensions — its petals contain infinite depth', emoji: '🪷', requiredLevel: 9, hybridParents: [] },
  { id: 'pulsar_sunflower', name: 'Pulsar Sunflower', rarity: 'rare', seedCost: 38, growTime: 70, harvestValue: 82, xpReward: 46, sectorId: 'pulsar_greenhouse', description: 'Giant sunflowers that emit pulsar beams from their centers to nourish surrounding plants', emoji: '🌻', requiredLevel: 10, hybridParents: [] },
  { id: 'black_hole_jade', name: 'Black Hole Jade', rarity: 'rare', seedCost: 40, growTime: 72, harvestValue: 88, xpReward: 50, sectorId: 'void_bloom_terrace', description: 'A succulent so dense it has its own gravitational field — pulls in cosmic nutrients', emoji: '🕳️', requiredLevel: 11, hybridParents: [] },
  { id: 'meteor_bonsai', name: 'Meteor Bonsai', rarity: 'rare', seedCost: 32, growTime: 60, harvestValue: 70, xpReward: 40, sectorId: 'gravity_grove', description: 'Miniature trees grown from meteorite fragments, each one a unique cosmic sculpture', emoji: '🌳', requiredLevel: 9, hybridParents: [] },
  { id: 'galaxy_iris', name: 'Galaxy Iris', rarity: 'rare', seedCost: 36, growTime: 68, harvestValue: 80, xpReward: 45, sectorId: 'starflower_meadow', description: 'Irises whose petals contain swirling galaxy patterns that shift over time', emoji: '🌈', requiredLevel: 10, hybridParents: [] },
  { id: 'quantum_corn', name: 'Quantum Corn', rarity: 'rare', seedCost: 30, growTime: 55, harvestValue: 65, xpReward: 38, sectorId: 'comet_vineyard', description: 'Exists in multiple growth states simultaneously — harvest it and it collapses into full ripeness', emoji: '🌽', requiredLevel: 8, hybridParents: [] },
  { id: 'aurora_bamboo', name: 'Aurora Bamboo', rarity: 'rare', seedCost: 34, growTime: 62, harvestValue: 76, xpReward: 43, sectorId: 'nebula_nursery', description: 'Translucent bamboo that displays aurora-like light patterns when shaken by cosmic wind', emoji: '🎋', requiredLevel: 10, hybridParents: [] },
  // ---- Epic (7) ----
  { id: 'stellar_oak', name: 'Stellar Oak', rarity: 'epic', seedCost: 80, growTime: 95, harvestValue: 180, xpReward: 100, sectorId: 'gravity_grove', description: 'An ancient oak whose roots tap into stellar cores — its acorns contain miniature stars', emoji: '🌳', requiredLevel: 18, hybridParents: [] },
  { id: 'supernova_peony', name: 'Supernova Peony', rarity: 'epic', seedCost: 90, growTime: 100, harvestValue: 200, xpReward: 110, sectorId: 'supernova_orchard', description: 'Only blooms when a nearby star goes supernova — its petals are pure explosive energy contained in floral form', emoji: '💥', requiredLevel: 20, hybridParents: [] },
  { id: 'dark_nebula_willow', name: 'Dark Nebula Willow', rarity: 'epic', seedCost: 85, growTime: 98, harvestValue: 190, xpReward: 105, sectorId: 'void_bloom_terrace', description: 'Weeping branches that trail through dark nebulae, absorbing primordial cosmic matter', emoji: '🌙', requiredLevel: 19, hybridParents: [] },
  { id: 'time_bonsai', name: 'Temporal Bonsai', rarity: 'epic', seedCost: 100, growTime: 110, harvestValue: 220, xpReward: 120, sectorId: 'cosmic_seed_vault', description: 'Grows backward through time — its future state is already visible while its past is still forming', emoji: '⏳', requiredLevel: 22, hybridParents: [] },
  { id: 'singularity_rose', name: 'Singularity Rose', rarity: 'epic', seedCost: 95, growTime: 105, harvestValue: 210, xpReward: 115, sectorId: 'void_bloom_terrace', description: 'At its center lies a micro-singularity — the rose petals orbit it in perfect spirals', emoji: '🌀', requiredLevel: 21, hybridParents: [] },
  { id: 'cosmic_cherry', name: 'Cosmic Cherry Blossom', rarity: 'epic', seedCost: 75, growTime: 90, harvestValue: 170, xpReward: 95, sectorId: 'nebula_nursery', description: 'Petals drift through space creating pink nebulae — entire regions bloom because of it', emoji: '🌸', requiredLevel: 17, hybridParents: [] },
  { id: 'antimatter_orchid', name: 'Antimatter Orchid', rarity: 'epic', seedCost: 88, growTime: 102, harvestValue: 195, xpReward: 108, sectorId: 'pulsar_greenhouse', description: 'Exists as antimatter — must be handled with care but yields incredibly potent cosmic essence', emoji: '⚛️', requiredLevel: 20, hybridParents: [] },
  // ---- Legendary (5) ----
  { id: 'world_tree_cosmic', name: 'Yggdrasil Cosmic', rarity: 'legendary', seedCost: 250, growTime: 150, harvestValue: 550, xpReward: 300, sectorId: 'cosmic_seed_vault', description: 'The cosmic World Tree whose branches connect all garden sectors across spacetime itself', emoji: '🌍', requiredLevel: 32, hybridParents: [] },
  { id: 'eternal_starbloom', name: 'Eternal Starbloom', rarity: 'legendary', seedCost: 300, growTime: 160, harvestValue: 650, xpReward: 350, sectorId: 'cosmic_seed_vault', description: 'A flower made of condensed starlight that never wilts and generates infinite cosmic essence', emoji: '⭐', requiredLevel: 36, hybridParents: [] },
  { id: 'genesis_seed_plant', name: 'Genesis Seed Plant', rarity: 'legendary', seedCost: 280, growTime: 145, harvestValue: 600, xpReward: 325, sectorId: 'supernova_orchard', description: 'The original cosmic plant from which all flora in the galaxy descended — growing one reshapes reality', emoji: '🌱', requiredLevel: 34, hybridParents: [] },
  { id: 'omniverse_lily', name: 'Omniverse Lily', rarity: 'legendary', seedCost: 350, growTime: 180, harvestValue: 750, xpReward: 400, sectorId: 'cosmic_seed_vault', description: 'Exists simultaneously in all universes — its fragrance grants visions of infinite possibilities', emoji: '🔮', requiredLevel: 42, hybridParents: [] },
  { id: 'void_emperor_lotus', name: 'Void Emperor Lotus', rarity: 'legendary', seedCost: 400, growTime: 200, harvestValue: 900, xpReward: 500, sectorId: 'cosmic_seed_vault', description: 'The rarest plant in existence — blooms once every cosmic age and grants dominion over the void', emoji: '👑', requiredLevel: 48, hybridParents: [] },
];

// ============================================================
// 30 Cosmic Fertilizers / Resources
// ============================================================

export const GY_FERTILIZERS: GyFertilizerDef[] = [
  { id: 'stardust_compost', name: 'Stardust Compost', description: 'Compost made from fallen star fragments — boosts growth rate', emoji: '✨', type: 'growth', power: 10, duration: 30, cost: 8, requiredLevel: 1 },
  { id: 'nebula_nectar', name: 'Nebula Nectar', description: 'Sweet nectar harvested from nebula blooms — increases harvest yield', emoji: '🍯', type: 'yield', power: 12, duration: 30, cost: 10, requiredLevel: 1 },
  { id: 'moonbeam_water', name: 'Moonbeam Water', description: 'Water infused with concentrated moonlight — improves plant quality', emoji: '🌙', type: 'quality', power: 8, duration: 30, cost: 6, requiredLevel: 1 },
  { id: 'comet_maneure', name: 'Comet Maneure', description: 'Enriched material from comet tails — strengthens plant resilience', emoji: '☄️', type: 'resilience', power: 15, duration: 45, cost: 15, requiredLevel: 3 },
  { id: 'dark_matter_extract', name: 'Dark Matter Extract', description: 'Concentrated dark matter — cosmic growth acceleration', emoji: '🕳️', type: 'cosmic', power: 25, duration: 60, cost: 50, requiredLevel: 10 },
  { id: 'solar_spice', name: 'Solar Spice', description: 'Crystallized solar energy — warms roots and accelerates germination', emoji: '☀️', type: 'growth', power: 15, duration: 30, cost: 12, requiredLevel: 3 },
  { id: 'plasma_rain', name: 'Plasma Rain', description: 'Ionized precipitation from stellar storms — boosts yields dramatically', emoji: '⚡', type: 'yield', power: 20, duration: 30, cost: 20, requiredLevel: 5 },
  { id: 'quantum_fertilizer', name: 'Quantum Fertilizer', description: 'Puts plants in superposition — they grow in all stages at once', emoji: '⚛️', type: 'growth', power: 30, duration: 45, cost: 35, requiredLevel: 8 },
  { id: 'pulsar_dew', name: 'Pulsar Dew', description: 'Morning dew from pulsar-irradiated gardens — concentrated cosmic quality', emoji: '💧', type: 'quality', power: 18, duration: 45, cost: 18, requiredLevel: 5 },
  { id: 'asteroid_meal', name: 'Asteroid Meal', description: 'Crushed asteroid rock — mineral-rich and incredibly resilient', emoji: '🪨', type: 'resilience', power: 20, duration: 60, cost: 22, requiredLevel: 6 },
  { id: 'gravity_well_mud', name: 'Gravity Well Mud', description: 'Mud from gravity wells — roots grow deeper and stronger', emoji: '🌀', type: 'growth', power: 18, duration: 40, cost: 16, requiredLevel: 5 },
  { id: 'cosmic_essence_drops', name: 'Cosmic Essence Drops', description: 'Pure liquid cosmic essence — the ultimate all-purpose fertilizer', emoji: '💎', type: 'cosmic', power: 40, duration: 60, cost: 80, requiredLevel: 15 },
  { id: 'nova_ash', name: 'Nova Ash', description: 'Ash from stellar explosions — supercharges growth in explosive bursts', emoji: '💥', type: 'growth', power: 35, duration: 30, cost: 30, requiredLevel: 8 },
  { id: 'void_slime', name: 'Void Slime', description: 'Living matter from the void — makes plants virtually indestructible', emoji: '👾', type: 'resilience', power: 30, duration: 60, cost: 45, requiredLevel: 12 },
  { id: 'photon_spray', name: 'Photon Spray', description: 'Concentrated light particles — perfect for light-hungry cosmic plants', emoji: '🔦', type: 'yield', power: 15, duration: 30, cost: 10, requiredLevel: 2 },
  { id: 'ion_storm_brew', name: 'Ion Storm Brew', description: 'Brewed from ionized gas — makes plants resistant to cosmic radiation', emoji: '🌩️', type: 'resilience', power: 22, duration: 45, cost: 20, requiredLevel: 7 },
  { id: 'chroniton_solution', name: 'Chroniton Solution', description: 'Time-altering liquid — plants mature faster by locally slowing time', emoji: '⏳', type: 'growth', power: 45, duration: 30, cost: 65, requiredLevel: 18 },
  { id: 'warp_crystal_dust', name: 'Warp Crystal Dust', description: 'Powdered warp crystals — harvests yield items from parallel dimensions', emoji: '🔮', type: 'cosmic', power: 50, duration: 45, cost: 90, requiredLevel: 20 },
  { id: 'stellar_honey', name: 'Stellar Honey', description: 'Honey produced by cosmic bees near dying stars — incredibly sweet yield booster', emoji: '🍯', type: 'yield', power: 25, duration: 45, cost: 28, requiredLevel: 8 },
  { id: 'magnetar_polish', name: 'Magnetar Polish', description: 'Magnetic polish from magnetar surfaces — aligns plant molecules for optimal quality', emoji: '🧲', type: 'quality', power: 28, duration: 45, cost: 32, requiredLevel: 10 },
  { id: 'gamma_ray_lotion', name: 'Gamma Ray Lotion', description: 'Harnesses gamma radiation in safe doses — stimulates rapid cell division', emoji: '☢️', type: 'growth', power: 38, duration: 30, cost: 55, requiredLevel: 15 },
  { id: 'xenon_bloom_powder', name: 'Xenon Bloom Powder', description: 'Noble gas compound that forces plants into peak flowering condition', emoji: '💨', type: 'quality', power: 32, duration: 40, cost: 38, requiredLevel: 12 },
  { id: 'black_hole_compost', name: 'Black Hole Compost', description: 'Compost compressed by a micro black hole — impossibly nutrient-dense', emoji: '🕳️', type: 'cosmic', power: 60, duration: 60, cost: 120, requiredLevel: 25 },
  { id: 'aurora_fertilizer', name: 'Aurora Fertilizer', description: 'Crystallized aurora borealis particles — plants shimmer and produce more', emoji: '🌈', type: 'yield', power: 30, duration: 45, cost: 35, requiredLevel: 10 },
  { id: 'meteorite_ore_feed', name: 'Meteorite Ore Feed', description: 'Crushed meteorite ore — feeds mineral-hungry plants with rare elements', emoji: '☄️', type: 'resilience', power: 25, duration: 50, cost: 25, requiredLevel: 8 },
  { id: 'cosmic_mist', name: 'Cosmic Mist', description: 'A fine mist of vaporized cosmic essence — gently boosts all plant attributes', emoji: '🌫️', type: 'cosmic', power: 20, duration: 60, cost: 40, requiredLevel: 12 },
  { id: 'fusion_core_drops', name: 'Fusion Core Drops', description: 'Liquid from a contained fusion reaction — extreme growth acceleration', emoji: '🔥', type: 'growth', power: 55, duration: 20, cost: 100, requiredLevel: 22 },
  { id: 'antimatter_solution', name: 'Antimatter Solution', description: 'Carefully contained antimatter that annihilates pests while boosting yield', emoji: '⚛️', type: 'yield', power: 40, duration: 30, cost: 75, requiredLevel: 18 },
  { id: 'dimensional_fluid', name: 'Dimensional Fluid', description: 'Liquid that phases between dimensions — harvests cosmic essence from elsewhere', emoji: '🌀', type: 'cosmic', power: 70, duration: 45, cost: 150, requiredLevel: 30 },
  { id: 'quasar_dust_tea', name: 'Quasar Dust Tea', description: 'A brewed tea from quasar-infused cosmic dust — simultaneously boosts growth and quality', emoji: '🍵', type: 'quality', power: 35, duration: 50, cost: 42, requiredLevel: 14 },
];

// ============================================================
// 25 Garden Structures
// ============================================================

export const GY_STRUCTURES: GyStructureDef[] = [
  { id: 'stardust_fountain', name: 'Stardust Fountain', description: 'A fountain that sprays liquid stardust, fertilizing all nearby plants automatically', emoji: '⛲', maxLevel: 10, structureType: 'utility', bonusType: 'growth', baseBonusValue: 5, baseBuildCost: 60, requiredLevel: 1 },
  { id: 'nebula_lantern', name: 'Nebula Lantern', description: 'A glowing lantern that mimics nebula light to nourish night-blooming cosmic plants', emoji: '🏮', maxLevel: 10, structureType: 'decorative', bonusType: 'quality', baseBonusValue: 4, baseBuildCost: 50, requiredLevel: 1 },
  { id: 'compost_comet', name: 'Compost Comet', description: 'A small captured comet that orbits the garden, dropping cosmic compost as it passes', emoji: '☄️', maxLevel: 10, structureType: 'production', bonusType: 'yield', baseBonusValue: 6, baseBuildCost: 80, requiredLevel: 2 },
  { id: 'gravity_well_planter', name: 'Gravity Well Planter', description: 'Uses micro-gravity to accelerate root growth and nutrient absorption', emoji: '🌀', maxLevel: 10, structureType: 'utility', bonusType: 'growth', baseBonusValue: 7, baseBuildCost: 100, requiredLevel: 3 },
  { id: 'solar_mirror_array', name: 'Solar Mirror Array', description: 'Orbiting mirrors that concentrate starlight onto specific garden plots', emoji: '☀️', maxLevel: 10, structureType: 'utility', bonusType: 'growth', baseBonusValue: 8, baseBuildCost: 120, requiredLevel: 4 },
  { id: 'cosmic_wind_chime', name: 'Cosmic Wind Chime', description: 'Chimes that ring with cosmic frequencies, stimulating plant cell division', emoji: '🎵', maxLevel: 10, structureType: 'decorative', bonusType: 'quality', baseBonusValue: 6, baseBuildCost: 70, requiredLevel: 2 },
  { id: 'asteroid_shield_gen', name: 'Asteroid Shield Generator', description: 'Generates a protective field that deflects micrometeorites from plants', emoji: '🛡️', maxLevel: 10, structureType: 'defensive', bonusType: 'resilience', baseBonusValue: 10, baseBuildCost: 150, requiredLevel: 5 },
  { id: 'void_siphon', name: 'Void Siphon', description: 'Siphons tiny amounts of energy from the void to boost plant resilience', emoji: '🕳️', maxLevel: 10, structureType: 'production', bonusType: 'resilience', baseBonusValue: 8, baseBuildCost: 130, requiredLevel: 5 },
  { id: 'pulsar_water_pump', name: 'Pulsar Water Pump', description: 'Pumps pulsar-energized water through the garden irrigation system', emoji: '💧', maxLevel: 10, structureType: 'utility', bonusType: 'growth', baseBonusValue: 9, baseBuildCost: 140, requiredLevel: 6 },
  { id: 'quantum_greenhouse_dome', name: 'Quantum Greenhouse Dome', description: 'A dome where plants exist in quantum superposition, growing exponentially faster', emoji: '🏛️', maxLevel: 10, structureType: 'production', bonusType: 'growth', baseBonusValue: 12, baseBuildCost: 200, requiredLevel: 8 },
  { id: 'starlight_harvester', name: 'Starlight Harvester', description: 'Collects and stores starlight energy for use during dark cosmic periods', emoji: '✨', maxLevel: 10, structureType: 'utility', bonusType: 'yield', baseBonusValue: 10, baseBuildCost: 160, requiredLevel: 7 },
  { id: 'dark_matter_store', name: 'Dark Matter Storage', description: 'Stores dark matter safely for use as ultra-premium cosmic fertilizer', emoji: '🏦', maxLevel: 10, structureType: 'utility', bonusType: 'cosmic', baseBonusValue: 8, baseBuildCost: 180, requiredLevel: 9 },
  { id: 'cosmic_bee_hive', name: 'Cosmic Bee Hive', description: 'Houses space bees that pollinate plants and produce stellar honey', emoji: '🐝', maxLevel: 10, structureType: 'production', bonusType: 'yield', baseBonusValue: 11, baseBuildCost: 170, requiredLevel: 7 },
  { id: 'aurora_projector', name: 'Aurora Projector', description: 'Projects miniature auroras over the garden, boosting all plant quality', emoji: '🌈', maxLevel: 10, structureType: 'decorative', bonusType: 'quality', baseBonusValue: 9, baseBuildCost: 150, requiredLevel: 8 },
  { id: 'warp_gate_planter', name: 'Warp Gate Planter', description: 'A planter connected to a warp gate — nutrients arrive from other dimensions', emoji: '🚀', maxLevel: 10, structureType: 'production', bonusType: 'cosmic', baseBonusValue: 12, baseBuildCost: 250, requiredLevel: 12 },
  { id: 'fusion_heater', name: 'Fusion Heater', description: 'Provides consistent warmth from controlled fusion for cold-sensitive species', emoji: '🔥', maxLevel: 10, structureType: 'utility', bonusType: 'growth', baseBonusValue: 10, baseBuildCost: 190, requiredLevel: 10 },
  { id: 'meteor_defense_net', name: 'Meteor Defense Net', description: 'An electromagnetic net that vaporizes incoming meteorites before they strike', emoji: '🕸️', maxLevel: 10, structureType: 'defensive', bonusType: 'resilience', baseBonusValue: 14, baseBuildCost: 220, requiredLevel: 12 },
  { id: 'cosmic_essence_condenser', name: 'Cosmic Essence Condenser', description: 'Condenses ambient cosmic essence into usable liquid form for fertilizing', emoji: '🧪', maxLevel: 10, structureType: 'production', bonusType: 'cosmic', baseBonusValue: 15, baseBuildCost: 280, requiredLevel: 14 },
  { id: 'gravity_tree_house', name: 'Gravity Tree House', description: 'A tree house that floats in adjusted gravity — decorative and inspiring', emoji: '🏠', maxLevel: 10, structureType: 'decorative', bonusType: 'quality', baseBonusValue: 8, baseBuildCost: 130, requiredLevel: 6 },
  { id: 'solar_sail_shade', name: 'Solar Sail Shade', description: 'Deployable solar sails that provide optimal shade patterns for delicate plants', emoji: '⛵', maxLevel: 10, structureType: 'utility', bonusType: 'quality', baseBonusValue: 7, baseBuildCost: 100, requiredLevel: 5 },
  { id: 'dark_nebula_greenhouse', name: 'Dark Nebula Greenhouse', description: 'A greenhouse within a dark nebula — grows void-adapted plants perfectly', emoji: '🌑', maxLevel: 10, structureType: 'production', bonusType: 'resilience', baseBonusValue: 16, baseBuildCost: 300, requiredLevel: 15 },
  { id: 'chroniton_clock_tower', name: 'Chroniton Clock Tower', description: 'Emits chroniton waves that locally accelerate time for nearby plants', emoji: '🕐', maxLevel: 10, structureType: 'research', bonusType: 'growth', baseBonusValue: 14, baseBuildCost: 320, requiredLevel: 16 },
  { id: 'singularity_statue', name: 'Singularity Statue', description: 'A decorative statue with a safe micro-singularity at its core — attracts cosmic energy', emoji: '🗿', maxLevel: 10, structureType: 'decorative', bonusType: 'cosmic', baseBonusValue: 10, baseBuildCost: 240, requiredLevel: 13 },
  { id: 'antimatter_reactor_bed', name: 'Antimatter Reactor Bed', description: 'A planter bed powered by antimatter — plants grow with impossible speed', emoji: '⚛️', maxLevel: 10, structureType: 'production', bonusType: 'growth', baseBonusValue: 16, baseBuildCost: 350, requiredLevel: 18 },
  { id: 'omniverse_observatory', name: 'Omniverse Observatory', description: 'Observes all universes simultaneously — reveals rare seed locations and optimal planting times', emoji: '🔭', maxLevel: 10, structureType: 'research', bonusType: 'cosmic', baseBonusValue: 20, baseBuildCost: 500, requiredLevel: 25 },
];

// ============================================================
// 22 Gardening Abilities
// ============================================================

export const GY_ABILITIES: GyAbilityDef[] = [
  { id: 'gy_cosmic_water', name: 'Cosmic Watering', description: 'Water plants with cosmic-infused water that reduces grow time by 20%', emoji: '💧', category: 'cultivation', cooldown: 60, duration: 0, power: 20, unlockLevel: 1, unlockCost: 0 },
  { id: 'gy_rapid_grow', name: 'Rapid Growth Burst', description: 'Instantly advance one plant to the next growth stage', emoji: '🚀', category: 'cultivation', cooldown: 300, duration: 0, power: 100, unlockLevel: 3, unlockCost: 50 },
  { id: 'gy_stellar_blessing', name: 'Stellar Blessing', description: 'Bless all plants in current sector with starlight, boosting harvest quality by 30%', emoji: '⭐', category: 'harvest', cooldown: 600, duration: 120, power: 30, unlockLevel: 5, unlockCost: 100 },
  { id: 'gy_nebula_shield', name: 'Nebula Shield', description: 'Create a protective nebula cloud that guards plants from cosmic hazards for 60 seconds', emoji: '🌌', category: 'defense', cooldown: 900, duration: 60, power: 50, unlockLevel: 7, unlockCost: 150 },
  { id: 'gy_comet_sweep', name: 'Comet Sweep Harvest', description: 'Instantly harvest all ready plants in a sector with a passing comet', emoji: '☄️', category: 'harvest', cooldown: 300, duration: 0, power: 0, unlockLevel: 4, unlockCost: 80 },
  { id: 'gy_dark_vision', name: 'Dark Matter Vision', description: 'See hidden hybrid combinations and secret plant properties for 30 seconds', emoji: '👁️', category: 'exploration', cooldown: 1200, duration: 30, power: 0, unlockLevel: 8, unlockCost: 200 },
  { id: 'gy_gravity_pulse', name: 'Gravity Pulse', description: 'Emit a gravity pulse that instantly waters and fertilizes all plants in range', emoji: '🌀', category: 'cultivation', cooldown: 600, duration: 0, power: 25, unlockLevel: 10, unlockCost: 250 },
  { id: 'gy_pulsar_beam', name: 'Pulsar Growth Beam', description: 'Focus a pulsar beam on one plant — triple its growth speed for 60 seconds', emoji: '💫', category: 'cultivation', cooldown: 900, duration: 60, power: 200, unlockLevel: 12, unlockCost: 350 },
  { id: 'gy_void_bloom', name: 'Void Bloom Trigger', description: 'Force a void-adapted plant into instant maximum bloom regardless of growth stage', emoji: '🕳️', category: 'cultivation', cooldown: 1800, duration: 0, power: 500, unlockLevel: 15, unlockCost: 500 },
  { id: 'gy_cosmic_compost_bomb', name: 'Cosmic Compost Bomb', description: 'Detonate a compost bomb — all plants in sector get massive growth and yield boost', emoji: '💥', category: 'cultivation', cooldown: 1800, duration: 60, power: 40, unlockLevel: 14, unlockCost: 450 },
  { id: 'gy_solar_flare_shield', name: 'Solar Flare Shield', description: 'Deploy a solar flare to incinerate cosmic pests and protect plants for 120 seconds', emoji: '☀️', category: 'defense', cooldown: 1500, duration: 120, power: 80, unlockLevel: 16, unlockCost: 550 },
  { id: 'gy_quantum_clone', name: 'Quantum Clone Seed', description: 'Clone a planted seed quantum-mechanically — get a free duplicate of a rare plant', emoji: '⚛️', category: 'exploration', cooldown: 3600, duration: 0, power: 0, unlockLevel: 18, unlockCost: 600 },
  { id: 'gy_time_warp', name: 'Temporal Time Warp', description: 'Warp time in one sector — all plants instantly complete their current growth cycle', emoji: '⏳', category: 'cosmic', cooldown: 3600, duration: 0, power: 1000, unlockLevel: 20, unlockCost: 800 },
  { id: 'gy_cosmic_essence_drain', name: 'Cosmic Essence Drain', description: 'Drain cosmic essence from the void and convert it into coins and XP', emoji: '💎', category: 'harvest', cooldown: 600, duration: 0, power: 0, unlockLevel: 11, unlockCost: 300 },
  { id: 'gy_aurora_bless', name: 'Aurora Blessing', description: 'Summon an aurora that makes all plants in the garden glow and produce double harvest', emoji: '🌈', category: 'cosmic', cooldown: 7200, duration: 180, power: 100, unlockLevel: 22, unlockCost: 900 },
  { id: 'gy_warp_harvest', name: 'Warp Harvest', description: 'Open a warp gate and harvest yield from parallel-dimension copies of your plants', emoji: '🚀', category: 'harvest', cooldown: 5400, duration: 0, power: 0, unlockLevel: 25, unlockCost: 1000 },
  { id: 'gy_singularity_fertilize', name: 'Singularity Fertilizer', description: 'Create a micro-singularity that hyper-condenses nutrients into all garden soil', emoji: '🕳️', category: 'cosmic', cooldown: 5400, duration: 300, power: 75, unlockLevel: 28, unlockCost: 1200 },
  { id: 'gy_nova_bloom', name: 'Nova Bloom Wave', description: 'Trigger a nova wave that forces all plants to their next growth stage simultaneously', emoji: '💥', category: 'cosmic', cooldown: 7200, duration: 0, power: 500, unlockLevel: 30, unlockCost: 1500 },
  { id: 'gy_dimensional_scout', name: 'Dimensional Scout', description: 'Send a scout to another dimension — returns with rare seeds and cosmic essence', emoji: '🌀', category: 'exploration', cooldown: 10800, duration: 0, power: 0, unlockLevel: 33, unlockCost: 2000 },
  { id: 'gy_antimatter_boost', name: 'Antimatter Boost', description: 'Apply antimatter energy to one plant — quadruple its harvest value this cycle', emoji: '⚛️', category: 'harvest', cooldown: 3600, duration: 0, power: 300, unlockLevel: 35, unlockCost: 2500 },
  { id: 'gy_omniverse_bloom', name: 'Omniverse Bloom', description: 'Channel energy from all universes — every plant in the garden reaches cosmic harvest', emoji: '🌍', category: 'cosmic', cooldown: 14400, duration: 0, power: 2000, unlockLevel: 40, unlockCost: 5000 },
  { id: 'gy_eternal_garden', name: 'Eternal Garden', description: 'Make one sector eternally self-sustaining — plants auto-harvest and replant forever', emoji: '♾️', category: 'cosmic', cooldown: 86400, duration: 86400, power: 0, unlockLevel: 45, unlockCost: 10000 },
];

// ============================================================
// 18 Achievements
// ============================================================

export const GY_ACHIEVEMENTS: GyAchievementDef[] = [
  { id: 'ach_first_cosmic_seed', name: 'First Cosmic Seed', description: 'Plant your very first cosmic seed in the garden', conditionKey: 'totalPlanted', targetValue: 1, rewardCoins: 10, rewardXP: 5, emoji: '🌱' },
  { id: 'ach_nursery_open', name: 'Nursery Open', description: 'Plant 10 seeds total across all sectors', conditionKey: 'totalPlanted', targetValue: 10, rewardCoins: 50, rewardXP: 25, emoji: '🚀' },
  { id: 'ach_cosmic_garden_50', name: 'Cosmic Garden', description: 'Plant 50 seeds in your galactic garden', conditionKey: 'totalPlanted', targetValue: 50, rewardCoins: 200, rewardXP: 100, emoji: '🌌' },
  { id: 'ach_first_harvest', name: 'First Stellar Harvest', description: 'Harvest your first fully grown cosmic plant', conditionKey: 'totalHarvested', targetValue: 1, rewardCoins: 15, rewardXP: 10, emoji: '🌸' },
  { id: 'ach_bountiful_cosmos', name: 'Bountiful Cosmos', description: 'Harvest 50 cosmic plants', conditionKey: 'totalHarvested', targetValue: 50, rewardCoins: 300, rewardXP: 150, emoji: '💐' },
  { id: 'ach_harvest_200', name: 'Galactic Harvest Empire', description: 'Harvest 200 cosmic plants', conditionKey: 'totalHarvested', targetValue: 200, rewardCoins: 800, rewardXP: 400, emoji: '🏰' },
  { id: 'ach_fertilize_100', name: 'Cosmic Fertilizer Master', description: 'Fertilize your plants 100 times', conditionKey: 'totalFertilized', targetValue: 100, rewardCoins: 250, rewardXP: 125, emoji: '✨' },
  { id: 'ach_earn_5000', name: 'Stellar Tycoon', description: 'Earn 5,000 coins total from cosmic harvests', conditionKey: 'totalEarned', targetValue: 5000, rewardCoins: 200, rewardXP: 100, emoji: '💰' },
  { id: 'ach_earn_50000', name: 'Galaxy Rich', description: 'Earn 50,000 coins total from harvests', conditionKey: 'totalEarned', targetValue: 50000, rewardCoins: 2000, rewardXP: 1000, emoji: '🤑' },
  { id: 'ach_level_10', name: 'Nebula Gardener', description: 'Reach Galaxy Garden level 10', conditionKey: 'level', targetValue: 10, rewardCoins: 150, rewardXP: 75, emoji: '🌿' },
  { id: 'ach_level_25', name: 'Comet Harvester', description: 'Reach Galaxy Garden level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 500, rewardXP: 250, emoji: '☄️' },
  { id: 'ach_level_50', name: 'Cosmic Gardener', description: 'Reach the maximum Galaxy Garden level 50', conditionKey: 'level', targetValue: 50, rewardCoins: 5000, rewardXP: 2500, emoji: '👨‍🚀' },
  { id: 'ach_hybrid_5', name: 'Cosmic Botanist', description: 'Discover 5 hybrid cosmic plants', conditionKey: 'totalHybridized', targetValue: 5, rewardCoins: 300, rewardXP: 150, emoji: '🧬' },
  { id: 'ach_expand_4', name: 'Sector Explorer', description: 'Unlock 4 different garden sectors', conditionKey: 'gardenExpansionCount', targetValue: 4, rewardCoins: 400, rewardXP: 200, emoji: '🗺️' },
  { id: 'ach_build_10', name: 'Structure Architect', description: 'Build 10 garden structures', conditionKey: 'structureUpgradeCount', targetValue: 10, rewardCoins: 350, rewardXP: 175, emoji: '🏗️' },
  { id: 'ach_ability_5', name: 'Ability Adept', description: 'Unlock and use 5 gardening abilities', conditionKey: 'abilityUseCount', targetValue: 5, rewardCoins: 200, rewardXP: 100, emoji: '⚡' },
  { id: 'ach_cosmic_events_10', name: 'Cosmic Survivor', description: 'Participate in 10 cosmic harvest events', conditionKey: 'totalCosmicEvents', targetValue: 10, rewardCoins: 500, rewardXP: 250, emoji: '🌠' },
  { id: 'ach_legendary_grow', name: 'Legendary Bloom', description: 'Harvest a legendary-rarity cosmic plant', conditionKey: 'harvestCountByRarity_legendary', targetValue: 1, rewardCoins: 1000, rewardXP: 500, emoji: '👑' },
];

// ============================================================
// Hybrid Recipes
// ============================================================

export const GY_HYBRID_RECIPES: GyHybridRecipe[] = [
  { parentA: 'star_daisy', parentB: 'moon_clover', result: 'hybrid_star_clover', resultName: 'Star Clover Bloom', resultEmoji: '🌟', requiredLevel: 6 },
  { parentA: 'quasar_rose', parentB: 'nova_lily', result: 'hybrid_quasar_nova', resultName: 'Quasar Nova Rose', resultEmoji: '💫', requiredLevel: 10 },
  { parentA: 'void_lotus', parentB: 'dark_ivy', result: 'hybrid_void_dark', resultName: 'Void Dark Vine', resultEmoji: '🖤', requiredLevel: 14 },
  { parentA: 'pulsar_sunflower', parentB: 'neutron_shroom', result: 'hybrid_pulsar_neutron', resultName: 'Pulsar Neutron Bloom', resultEmoji: '⭐', requiredLevel: 15 },
  { parentA: 'stellar_oak', parentB: 'aurora_bamboo', result: 'hybrid_stellar_aurora', resultName: 'Stellar Aurora Grove', resultEmoji: '🌈', requiredLevel: 22 },
  { parentA: 'supernova_peony', parentB: 'time_bonsai', result: 'hybrid_supernova_time', resultName: 'Temporal Supernova Tree', resultEmoji: '💥', requiredLevel: 26 },
  { parentA: 'dark_nebula_willow', parentB: 'singularity_rose', result: 'hybrid_nebula_singular', resultName: 'Nebula Singular Rose', resultEmoji: '🌀', requiredLevel: 28 },
  { parentA: 'cosmic_cherry', parentB: 'antimatter_orchid', result: 'hybrid_cherry_antimatter', resultName: 'Antimatter Cherry Blossom', resultEmoji: '🌸', requiredLevel: 24 },
  { parentA: 'world_tree_cosmic', parentB: 'eternal_starbloom', result: 'hybrid_cosmic_eternal', resultName: 'Eternal Cosmic Tree', resultEmoji: '🌍', requiredLevel: 38 },
  { parentA: 'genesis_seed_plant', parentB: 'omniverse_lily', result: 'hybrid_genesis_omni', resultName: 'Genesis Omniverse Flower', resultEmoji: '🔮', requiredLevel: 45 },
  { parentA: 'black_hole_jade', parentB: 'warp_vine', result: 'hybrid_blackhole_warp', resultName: 'Warp Hole Jade', resultEmoji: '🕳️', requiredLevel: 16 },
  { parentA: 'galaxy_iris', parentB: 'solar_orchid', result: 'hybrid_galaxy_solar', resultName: 'Solar Galaxy Orchid', resultEmoji: '🪻', requiredLevel: 18 },
  { parentA: 'meteor_bonsai', parentB: 'gravity_berry', result: 'hybrid_meteor_gravity', resultName: 'Gravity Meteor Berry Tree', resultEmoji: '🫐', requiredLevel: 12 },
  { parentA: 'quantum_corn', parentB: 'ion_cactus', result: 'hybrid_quantum_ion', resultName: 'Quantum Ion Cactus Corn', resultEmoji: '🌽', requiredLevel: 13 },
  { parentA: 'crystal_sage', parentB: 'plasma_fern', result: 'hybrid_crystal_plasma', resultName: 'Crystal Plasma Herb', resultEmoji: '💎', requiredLevel: 11 },
];

// ============================================================
// Daily Task Pool
// ============================================================

export const GY_DAILY_TASK_POOL: GyDailyTaskPoolDef[] = [
  { id: 'daily_plant_3', name: 'Daily Cosmic Planting', description: 'Plant 3 cosmic seeds in your garden', type: 'plant', target: 3, rewardCoins: 30, rewardXP: 15, emoji: '🌱' },
  { id: 'daily_plant_6', name: 'Planting Spree', description: 'Plant 6 cosmic seeds across sectors', type: 'plant', target: 6, rewardCoins: 55, rewardXP: 28, emoji: '🌾' },
  { id: 'daily_fertilize_3', name: 'Cosmic Fertilizing', description: 'Fertilize 3 plants with cosmic fertilizer', type: 'fertilize', target: 3, rewardCoins: 25, rewardXP: 12, emoji: '✨' },
  { id: 'daily_fertilize_6', name: 'Deep Fertilization', description: 'Fertilize 6 plants in your garden', type: 'fertilize', target: 6, rewardCoins: 45, rewardXP: 22, emoji: '🧪' },
  { id: 'daily_harvest_3', name: 'Harvest Time', description: 'Harvest 3 fully grown cosmic plants', type: 'harvest', target: 3, rewardCoins: 35, rewardXP: 18, emoji: '🌸' },
  { id: 'daily_harvest_5', name: 'Bountiful Cosmic Harvest', description: 'Harvest 5 fully grown plants', type: 'harvest', target: 5, rewardCoins: 60, rewardXP: 30, emoji: '💐' },
  { id: 'daily_tend_5', name: 'Garden Tending', description: 'Water or fertilize 5 plants in your garden', type: 'tend', target: 5, rewardCoins: 40, rewardXP: 20, emoji: '💧' },
  { id: 'daily_tend_10', name: 'Thorough Tending', description: 'Water or fertilize 10 plants across all sectors', type: 'tend', target: 10, rewardCoins: 70, rewardXP: 35, emoji: '🌍' },
];

// ============================================================
// Cosmic Harvest Events
// ============================================================

export const GY_HARVEST_EVENTS: GyHarvestEventDef[] = [
  { id: 'event_meteor_shower', name: 'Meteor Shower', description: 'A meteor shower rains mineral-rich fragments across the garden, boosting all growth', eventType: 'meteor_shower', duration: 120, growthMultiplier: 1.5, yieldMultiplier: 1.2, bonusResource: 'asteroid_meal', bonusAmount: 3, emoji: '☄️' },
  { id: 'event_solar_flare', name: 'Solar Flare Surge', description: 'A nearby star emits a powerful solar flare, supercharging all plants with light energy', eventType: 'solar_flare', duration: 90, growthMultiplier: 1.8, yieldMultiplier: 1.0, bonusResource: 'solar_spice', bonusAmount: 5, emoji: '☀️' },
  { id: 'event_comet_tail', name: 'Comet Tail Passage', description: 'A comet passes close by, trailing cosmic dust that fertilizes everything it touches', eventType: 'comet_tail', duration: 150, growthMultiplier: 1.3, yieldMultiplier: 1.5, bonusResource: 'stardust_compost', bonusAmount: 4, emoji: '🌠' },
  { id: 'event_dark_matter_wave', name: 'Dark Matter Wave', description: 'A wave of concentrated dark matter washes over the garden, unlocking hidden potential', eventType: 'dark_matter_wave', duration: 100, growthMultiplier: 2.0, yieldMultiplier: 1.3, bonusResource: 'dark_matter_extract', bonusAmount: 2, emoji: '🕳️' },
  { id: 'event_nebula_bloom', name: 'Nebula Bloom Festival', description: 'A passing nebula blankets the garden in colorful gas — plants bloom spectacularly', eventType: 'nebula_bloom', duration: 180, growthMultiplier: 1.2, yieldMultiplier: 2.0, bonusResource: 'nebula_nectar', bonusAmount: 3, emoji: '🌌' },
  { id: 'event_pulsar_surge', name: 'Pulsar Energy Surge', description: 'A nearby pulsar directs a beam of concentrated energy right into the garden', eventType: 'pulsar_surge', duration: 60, growthMultiplier: 3.0, yieldMultiplier: 1.5, bonusResource: 'pulsar_dew', bonusAmount: 2, emoji: '💫' },
];

// ============================================================
// Initial State Factory
// ============================================================

function createInitialState(seed?: number): GyGalaxyGardenState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  const rng = mulberry32(effectiveSeed);

  const startingPlants = GY_PLANTS
    .filter((p) => p.requiredLevel <= 1)
    .map((p) => p.id);

  const plantSlots: GyPlantSlot[] = [];
  const startingSectors = GY_SECTORS.filter((s) => s.unlockLevel <= 1);
  for (const sector of startingSectors) {
    for (let i = 0; i < sector.maxSlots; i++) {
      plantSlots.push({
        id: `${sector.id}_slot_${i}`,
        sectorId: sector.id,
        plantId: null,
        plantedAt: 0,
        harvestAt: 0,
        growthStage: 'spore',
        fertilized: false,
        fertilizerType: null,
        blessed: false,
        hybridParents: [],
        harvestCount: 0,
      });
    }
  }

  return {
    level: 1,
    xp: 0,
    coins: 150,
    unlockedPlants: startingPlants,
    activeSector: 'nebula_nursery',
    unlockedSectors: startingSectors.map((s) => s.id),
    sectorLevels: Object.fromEntries(startingSectors.map((s) => [s.id, 1])),
    seeds: { star_daisy: 5, moon_clover: 5, cosmic_grass: 5, grav_berry: 3 },
    fertilizers: { stardust_compost: 3, moonbeam_water: 2 },
    plantSlots,
    structures: GY_STRUCTURES.map((s) => ({ id: s.id, level: 0, built: s.id === 'stardust_fountain' ? true : false })),
    abilities: GY_ABILITIES.map((a) => ({ id: a.id, unlocked: a.unlockLevel <= 1 && a.unlockCost === 0, lastUsedAt: 0 })),
    unlockedAchievements: GY_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, unlockedAt: null })),
    dailyStreak: 0,
    lastDaily: null,
    dailyTask: null,
    totalHarvested: 0,
    totalEarned: 0,
    totalSpent: 0,
    totalPlanted: 0,
    totalFertilized: 0,
    totalHybridized: 0,
    totalCosmicEvents: 0,
    harvestEvent: { eventId: null, startedAt: 0, endsAt: 0 },
    hybridRecords: GY_HYBRID_RECIPES.map((h) => ({
      id: h.result,
      parentA: h.parentA,
      parentB: h.parentB,
      resultPlantId: h.result,
      discovered: false,
      discoveredAt: null,
    })),
    seed: effectiveSeed,
    harvestCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    gardenExpansionCount: startingSectors.length,
    structureUpgradeCount: 1,
    abilityUseCount: 0,
    cosmicEssence: 0,
  };
}

// ============================================================
// Hook: useGalaxyGarden
// ============================================================

export default function useGalaxyGarden(initialSeed?: number) {
  const [state, setState] = useState<GyGalaxyGardenState>(() => createInitialState(initialSeed));
  const prngRef = useRef<() => number>(mulberry32(state.seed));

  // Sync prng seed via effect
  useEffect(() => {
    prngRef.current = mulberry32(state.seed);
  }, [state.seed]);

  // Sync seed ref when state changes (for reading in setState callbacks)
  const stateRef = useRef<GyGalaxyGardenState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- Core State ----

  const gyGetState = useCallback((): Readonly<GyGalaxyGardenState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const gyResetState = useCallback((newSeed?: number) => {
    const s = createInitialState(newSeed);
    prngRef.current = mulberry32(s.seed);
    setState(s);
  }, []);

  // ---- Level / XP ----

  const gyGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const gyGetXp = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const gyGetXpToNext = useCallback((): number => {
    return gyXpRequired(state.level);
  }, [state.level]);

  const gyGetXpProgress = useCallback((): number => {
    const needed = gyXpRequired(state.level);
    if (needed <= 0 || needed === Infinity) return 1;
    return state.xp / needed;
  }, [state.level, state.xp]);

  const gyGetTitle = useCallback((): GyTitleInfo => {
    let title = GY_TITLE_THRESHOLDS[0];
    for (const t of GY_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) {
        title = t;
      }
    }
    return title;
  }, [state.level]);

  // ---- Coins ----

  const gyGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const gyGetCosmicEssence = useCallback((): number => {
    return state.cosmicEssence;
  }, [state.cosmicEssence]);

  const gySpendCoins = useCallback((amount: number): { success: boolean; state: GyGalaxyGardenState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: gyClampCoins(prev.coins - amount), totalSpent: prev.totalSpent + amount };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const gyCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Plants ----

  const gyGetPlants = useCallback((): GyPlantDef[] => {
    return [...GY_PLANTS];
  }, []);

  const gyGetPlantById = useCallback((id: string): GyPlantDef | null => {
    return GY_PLANTS.find((p) => p.id === id) ?? null;
  }, []);

  const gyGetUnlockedPlants = useCallback((): GyPlantDef[] => {
    return GY_PLANTS.filter((p) => state.unlockedPlants.includes(p.id));
  }, [state.unlockedPlants]);

  const gyGetLockedPlants = useCallback((): GyPlantDef[] => {
    return GY_PLANTS.filter((p) => !state.unlockedPlants.includes(p.id));
  }, [state.unlockedPlants]);

  const gyIsPlantUnlocked = useCallback((plantId: string): boolean => {
    return state.unlockedPlants.includes(plantId);
  }, [state.unlockedPlants]);

  const gyUnlockPlant = useCallback((plantId: string): { success: boolean; state: GyGalaxyGardenState } => {
    const plant = GY_PLANTS.find((p) => p.id === plantId);
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

  const gyGetPlantsByRarity = useCallback((rarity: GyRarity): GyPlantDef[] => {
    return GY_PLANTS.filter((p) => p.rarity === rarity);
  }, []);

  const gyGetPlantsBySector = useCallback((sectorId: string): GyPlantDef[] => {
    return GY_PLANTS.filter((p) => p.sectorId === sectorId);
  }, []);

  // ---- Seeds / Inventory ----

  const gyGetSeeds = useCallback((): Record<string, number> => {
    return { ...state.seeds };
  }, [state.seeds]);

  const gyGetSeedCount = useCallback((plantId: string): number => {
    return state.seeds[plantId] ?? 0;
  }, [state.seeds]);

  const gyBuySeeds = useCallback((plantId: string, amount: number = 1): { success: boolean; cost: number; state: GyGalaxyGardenState } => {
    const def = GY_PLANTS.find((p) => p.id === plantId);
    if (!def) return { success: false, cost: 0, state };
    if (!state.unlockedPlants.includes(plantId)) return { success: false, cost: 0, state };
    const totalCost = def.seedCost * amount;
    if (state.coins < totalCost) return { success: false, cost: totalCost, state };
    let next = state;
    setState((prev) => {
      const newSeeds = { ...prev.seeds, [plantId]: (prev.seeds[plantId] ?? 0) + amount };
      next = { ...prev, seeds: newSeeds, coins: gyClampCoins(prev.coins - totalCost), totalSpent: prev.totalSpent + totalCost };

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = GY_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'plant') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + amount } };
        }
      }
      return next;
    });
    return { success: true, cost: totalCost, state: next };
  }, [state]);

  // ---- Sectors ----

  const gyGetSectors = useCallback((): GySectorDef[] => {
    return [...GY_SECTORS];
  }, []);

  const gyGetSectorById = useCallback((id: string): GySectorDef | null => {
    return GY_SECTORS.find((z) => z.id === id) ?? null;
  }, []);

  const gyGetActiveSector = useCallback((): GySectorDef | null => {
    return GY_SECTORS.find((z) => z.id === state.activeSector) ?? null;
  }, [state.activeSector]);

  const gySetActiveSector = useCallback((sectorId: string): { success: boolean; state: GyGalaxyGardenState } => {
    const exists = GY_SECTORS.find((z) => z.id === sectorId);
    if (!exists) return { success: false, state };
    let next = state;
    setState((prev) => { next = { ...prev, activeSector: sectorId }; return next; });
    return { success: true, state: next };
  }, [state]);

  const gyGetUnlockedSectors = useCallback((): GySectorDef[] => {
    return GY_SECTORS.filter((s) => state.unlockedSectors.includes(s.id));
  }, [state.unlockedSectors]);

  const gyGetLockedSectors = useCallback((): GySectorDef[] => {
    return GY_SECTORS.filter((s) => !state.unlockedSectors.includes(s.id));
  }, [state.unlockedSectors]);

  const gyUnlockSector = useCallback((sectorId: string): { success: boolean; cost: number; state: GyGalaxyGardenState } => {
    const sectorDef = GY_SECTORS.find((s) => s.id === sectorId);
    if (!sectorDef) return { success: false, cost: 0, state };
    if (state.unlockedSectors.includes(sectorId)) return { success: false, cost: 0, state };
    if (state.level < sectorDef.unlockLevel) return { success: false, cost: 0, state };
    if (state.coins < sectorDef.baseUpgradeCost) return { success: false, cost: sectorDef.baseUpgradeCost, state };

    let next = state;
    setState((prev) => {
      const newSlots: GyPlantSlot[] = [...prev.plantSlots];
      for (let i = 0; i < sectorDef.maxSlots; i++) {
        newSlots.push({
          id: `${sectorId}_slot_${i}`,
          sectorId,
          plantId: null,
          plantedAt: 0,
          harvestAt: 0,
          growthStage: 'spore',
          fertilized: false,
          fertilizerType: null,
          blessed: false,
          hybridParents: [],
          harvestCount: 0,
        });
      }

      next = {
        ...prev,
        plantSlots: newSlots,
        unlockedSectors: [...prev.unlockedSectors, sectorId],
        sectorLevels: { ...prev.sectorLevels, [sectorId]: 1 },
        coins: gyClampCoins(prev.coins - sectorDef.baseUpgradeCost),
        totalSpent: prev.totalSpent + sectorDef.baseUpgradeCost,
        gardenExpansionCount: prev.gardenExpansionCount + 1,
      };
      return next;
    });
    return { success: true, cost: sectorDef.baseUpgradeCost, state: next };
  }, [state]);

  const gyUpgradeSector = useCallback((sectorId: string): { success: boolean; cost: number; state: GyGalaxyGardenState } => {
    const sectorDef = GY_SECTORS.find((s) => s.id === sectorId);
    if (!sectorDef) return { success: false, cost: 0, state };
    const currentLevel = state.sectorLevels[sectorId] ?? 0;
    if (currentLevel >= sectorDef.maxLevel) return { success: false, cost: 0, state };
    if (currentLevel < 1) return { success: false, cost: 0, state };
    const cost = Math.floor(sectorDef.baseUpgradeCost * Math.pow(1.6, currentLevel));
    if (state.coins < cost) return { success: false, cost, state };

    let next = state;
    setState((prev) => {
      const prevLevel = prev.sectorLevels[sectorId] ?? 0;
      next = {
        ...prev,
        sectorLevels: { ...prev.sectorLevels, [sectorId]: prevLevel + 1 },
        coins: gyClampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  const gyGetSectorGrowthBonus = useCallback((sectorId: string): number => {
    const sectorDef = GY_SECTORS.find((s) => s.id === sectorId);
    const sectorLevel = state.sectorLevels[sectorId] ?? 1;
    const baseBonus = sectorDef?.baseGrowthBonus ?? 0;
    const levelBonus = (sectorLevel - 1) * 3;

    let structureBonus = 0;
    for (const st of state.structures) {
      if (!st.built) continue;
      const def = GY_STRUCTURES.find((d) => d.id === st.id);
      if (def && def.bonusType === 'growth') {
        structureBonus += def.baseBonusValue * (0.5 + st.level * 0.15);
      }
    }
    return baseBonus + levelBonus + structureBonus;
  }, [state.sectorLevels, state.structures]);

  const gyGetSectorHarvestBonus = useCallback((sectorId: string): number => {
    const sectorDef = GY_SECTORS.find((s) => s.id === sectorId);
    const sectorLevel = state.sectorLevels[sectorId] ?? 1;
    const baseBonus = sectorDef?.baseHarvestBonus ?? 0;
    const levelBonus = (sectorLevel - 1) * 2;

    let structureBonus = 0;
    for (const st of state.structures) {
      if (!st.built) continue;
      const def = GY_STRUCTURES.find((d) => d.id === st.id);
      if (def && def.bonusType === 'yield') {
        structureBonus += def.baseBonusValue * (0.5 + st.level * 0.15);
      }
    }
    return baseBonus + levelBonus + structureBonus;
  }, [state.sectorLevels, state.structures]);

  const gyGetSlotsForSector = useCallback((sectorId: string): GyPlantSlot[] => {
    return state.plantSlots.filter((s) => s.sectorId === sectorId);
  }, [state.plantSlots]);

  const gyGetEmptySlots = useCallback((sectorId: string): GyPlantSlot[] => {
    return state.plantSlots.filter((s) => s.sectorId === sectorId && s.plantId === null);
  }, [state.plantSlots]);

  // ---- Planting ----

  const gyPlant = useCallback((plantId: string, slotId: string, now: number = Date.now()): { success: boolean; state: GyGalaxyGardenState } => {
    const plant = GY_PLANTS.find((p) => p.id === plantId);
    if (!plant) return { success: false, state };
    if (!state.unlockedPlants.includes(plantId)) return { success: false, state };
    if (state.level < plant.requiredLevel) return { success: false, state };

    const slotIdx = state.plantSlots.findIndex((s) => s.id === slotId);
    if (slotIdx === -1) return { success: false, state };
    const slot = state.plantSlots[slotIdx];
    if (slot.plantId !== null) return { success: false, state };

    const currentSeeds = state.seeds[plantId] ?? 0;
    if (currentSeeds < 1) return { success: false, state };

    if (slot.sectorId !== plant.sectorId && plant.sectorId !== 'cosmic_seed_vault') return { success: false, state };

    const growthBonus = gyGetSectorGrowthBonus(slot.sectorId);
    const growthMult = 1 + growthBonus * 0.01;
    const adjustedGrowTime = Math.max(10, Math.floor(plant.growTime / growthMult));
    const harvestAt = now + adjustedGrowTime * 1000;

    let next = state;
    setState((prev) => {
      const newSeeds = { ...prev.seeds };
      newSeeds[plantId] = (newSeeds[plantId] ?? 0) - 1;
      if (newSeeds[plantId] <= 0) { delete newSeeds[plantId]; }

      const newSlots = [...prev.plantSlots];
      newSlots[slotIdx] = {
        ...newSlots[slotIdx],
        plantId,
        plantedAt: now,
        harvestAt,
        growthStage: 'spore',
        fertilized: false,
        fertilizerType: null,
        blessed: false,
        hybridParents: [],
        harvestCount: prev.plantSlots[slotIdx].harvestCount,
      };

      next = { ...prev, seeds: newSeeds, plantSlots: newSlots, totalPlanted: prev.totalPlanted + 1 };

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = GY_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'plant') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }

      return next;
    });
    return { success: true, state: next };
  }, [state, gyGetSectorGrowthBonus]);

  // ---- Watering (Cosmic Watering) ----

  const gyWater = useCallback((slotId: string, now: number = Date.now()): { success: boolean; timeReduced: number; state: GyGalaxyGardenState } => {
    const slotIdx = state.plantSlots.findIndex((s) => s.id === slotId);
    if (slotIdx === -1) return { success: false, timeReduced: 0, state };
    const slot = state.plantSlots[slotIdx];
    if (slot.plantId === null) return { success: false, timeReduced: 0, state };

    const remaining = Math.max(0, slot.harvestAt - now);
    const reductionMs = Math.floor(remaining * 0.2);
    const newHarvestAt = slot.harvestAt - reductionMs;

    let next = state;
    setState((prev) => {
      const newSlots = [...prev.plantSlots];
      newSlots[slotIdx] = { ...newSlots[slotIdx], harvestAt: Math.max(now, newHarvestAt) };
      next = { ...prev, plantSlots: newSlots };

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = GY_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && (poolDef.type === 'tend' || poolDef.type === 'fertilize')) {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }
      return next;
    });
    return { success: true, timeReduced: reductionMs, state: next };
  }, [state]);

  // ---- Growth / Harvest ----

  const gyGetPlantGrowthProgress = useCallback((slotId: string, now: number = Date.now()): { progress: number; stage: GyGrowthStage; remainingMs: number } => {
    const slot = state.plantSlots.find((s) => s.id === slotId);
    if (!slot || slot.plantId === null) return { progress: 0, stage: 'spore', remainingMs: 0 };
    if (now >= slot.harvestAt) return { progress: 1, stage: 'cosmic_harvest', remainingMs: 0 };
    const totalMs = slot.harvestAt - slot.plantedAt;
    const elapsed = now - slot.plantedAt;
    const progress = Math.min(1, elapsed / totalMs);
    return { progress, stage: gyGrowthStageFromProgress(progress), remainingMs: slot.harvestAt - now };
  }, [state.plantSlots]);

  const gyHarvest = useCallback((slotId: string, now: number = Date.now()): { success: boolean; plant: GyPlantDef | null; coinsEarned: number; xpEarned: number; essenceEarned: number; state: GyGalaxyGardenState } => {
    const slotIdx = state.plantSlots.findIndex((s) => s.id === slotId);
    if (slotIdx === -1) return { success: false, plant: null, coinsEarned: 0, xpEarned: 0, essenceEarned: 0, state };
    const slot = state.plantSlots[slotIdx];
    if (slot.plantId === null) return { success: false, plant: null, coinsEarned: 0, xpEarned: 0, essenceEarned: 0, state };
    if (now < slot.harvestAt) return { success: false, plant: null, coinsEarned: 0, xpEarned: 0, essenceEarned: 0, state };

    const plant = GY_PLANTS.find((p) => p.id === slot.plantId);
    if (!plant) return { success: false, plant: null, coinsEarned: 0, xpEarned: 0, essenceEarned: 0, state };

    const rarityMult = gyRarityMultiplier(plant.rarity);
    const coinMult = gyRarityCoinMultiplier(plant.rarity);
    const harvestBonus = gyGetSectorHarvestBonus(slot.sectorId);
    const qualityMult = 0.8 + harvestBonus * 0.01;
    const blessingMult = slot.blessed ? 1.3 : 1;
    const fertilizerMult = slot.fertilized ? 1.2 : 1;

    // Harvest event bonus
    let eventMult = 1;
    if (state.harvestEvent.eventId && now < state.harvestEvent.endsAt) {
      const eventDef = GY_HARVEST_EVENTS.find((e) => e.id === state.harvestEvent.eventId);
      if (eventDef) eventMult = eventDef.yieldMultiplier;
    }

    const coinsEarned = Math.floor(plant.harvestValue * qualityMult * blessingMult * fertilizerMult * coinMult * eventMult);
    const xpEarned = Math.floor(plant.xpReward * rarityMult * blessingMult);
    const essenceEarned = plant.rarity === 'epic' ? 5 : plant.rarity === 'legendary' ? 15 : 0;

    let next = state;
    setState((prev) => {
      const newSlots = [...prev.plantSlots];
      const newHarvestCount = newSlots[slotIdx].harvestCount + 1;
      newSlots[slotIdx] = {
        ...newSlots[slotIdx],
        plantId: null,
        plantedAt: 0,
        harvestAt: 0,
        growthStage: 'spore',
        fertilized: false,
        fertilizerType: null,
        blessed: false,
        hybridParents: [],
        harvestCount: newHarvestCount,
      };

      const newHarvestByRarity = { ...prev.harvestCountByRarity, [plant.rarity]: prev.harvestCountByRarity[plant.rarity] + 1 };

      next = {
        ...prev,
        plantSlots: newSlots,
        coins: gyClampCoins(prev.coins + coinsEarned),
        totalEarned: prev.totalEarned + coinsEarned,
        totalHarvested: prev.totalHarvested + 1,
        harvestCountByRarity: newHarvestByRarity,
        cosmicEssence: prev.cosmicEssence + essenceEarned,
      };

      let { level, xp } = next;
      xp += xpEarned;
      while (level < GY_MAX_LEVEL && xp >= gyXpRequired(level)) {
        xp -= gyXpRequired(level);
        level += 1;
      }
      if (level >= GY_MAX_LEVEL) xp = 0;
      next = { ...next, level: gyClampLevel(level), xp };

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = GY_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'harvest') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }

      return next;
    });

    return { success: true, plant, coinsEarned, xpEarned, essenceEarned, state: next };
  }, [state, gyGetSectorHarvestBonus]);

  const gyGetHarvestableSlots = useCallback((now: number = Date.now()): GyPlantSlot[] => {
    return state.plantSlots.filter((s) => s.plantId !== null && now >= s.harvestAt);
  }, [state.plantSlots]);

  const gyGetGrowingSlots = useCallback((now: number = Date.now()): GyPlantSlot[] => {
    return state.plantSlots.filter((s) => s.plantId !== null && now < s.harvestAt);
  }, [state.plantSlots]);

  // ---- Fertilizers ----

  const gyGetFertilizers = useCallback((): GyFertilizerDef[] => {
    return [...GY_FERTILIZERS];
  }, []);

  const gyGetFertilizerById = useCallback((id: string): GyFertilizerDef | null => {
    return GY_FERTILIZERS.find((f) => f.id === id) ?? null;
  }, []);

  const gyGetFertilizerInventory = useCallback((): Record<string, number> => {
    return { ...state.fertilizers };
  }, [state.fertilizers]);

  const gyBuyFertilizer = useCallback((fertilizerId: string, amount: number = 1): { success: boolean; cost: number; state: GyGalaxyGardenState } => {
    const def = GY_FERTILIZERS.find((f) => f.id === fertilizerId);
    if (!def) return { success: false, cost: 0, state };
    if (state.level < def.requiredLevel) return { success: false, cost: 0, state };
    const totalCost = def.cost * amount;
    if (state.coins < totalCost) return { success: false, cost: totalCost, state };

    let next = state;
    setState((prev) => {
      const newFerts = { ...prev.fertilizers, [fertilizerId]: (prev.fertilizers[fertilizerId] ?? 0) + amount };
      next = { ...prev, fertilizers: newFerts, coins: gyClampCoins(prev.coins - totalCost), totalSpent: prev.totalSpent + totalCost };
      return next;
    });
    return { success: true, cost: totalCost, state: next };
  }, [state]);

  const gyApplyFertilizer = useCallback((slotId: string, fertilizerId: string, now: number = Date.now()): { success: boolean; bonus: number; state: GyGalaxyGardenState } => {
    const fertDef = GY_FERTILIZERS.find((f) => f.id === fertilizerId);
    if (!fertDef) return { success: false, bonus: 0, state };
    const currentFerts = state.fertilizers[fertilizerId] ?? 0;
    if (currentFerts < 1) return { success: false, bonus: 0, state };

    const slotIdx = state.plantSlots.findIndex((s) => s.id === slotId);
    if (slotIdx === -1) return { success: false, bonus: 0, state };
    const slot = state.plantSlots[slotIdx];
    if (slot.plantId === null) return { success: false, bonus: 0, state };

    let next = state;
    setState((prev) => {
      const newFerts = { ...prev.fertilizers };
      newFerts[fertilizerId] = (newFerts[fertilizerId] ?? 0) - 1;
      if (newFerts[fertilizerId] <= 0) { delete newFerts[fertilizerId]; }

      const newSlots = [...prev.plantSlots];
      const newSlot = { ...newSlots[slotIdx], fertilized: true, fertilizerType: fertDef.type };
      newSlots[slotIdx] = newSlot;

      // Growth type fertilizer reduces time
      if (fertDef.type === 'growth') {
        const remaining = Math.max(0, newSlot.harvestAt - now);
        const reduction = Math.floor(remaining * fertDef.power * 0.01);
        newSlot.harvestAt = Math.max(now, newSlot.harvestAt - reduction);
        newSlots[slotIdx] = newSlot;
      }

      next = {
        ...prev,
        fertilizers: newFerts,
        plantSlots: newSlots,
        totalFertilized: prev.totalFertilized + 1,
      };

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = GY_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && (poolDef.type === 'fertilize' || poolDef.type === 'tend')) {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }

      return next;
    });
    return { success: true, bonus: fertDef.power, state: next };
  }, [state]);

  // ---- Blessing (cosmic version) ----

  const gyBlessPlant = useCallback((slotId: string): { success: boolean; state: GyGalaxyGardenState } => {
    const slotIdx = state.plantSlots.findIndex((s) => s.id === slotId);
    if (slotIdx === -1) return { success: false, state };
    const slot = state.plantSlots[slotIdx];
    if (slot.plantId === null || slot.blessed) return { success: false, state };
    if (state.cosmicEssence < 5) return { success: false, state };

    let next = state;
    setState((prev) => {
      const newSlots = [...prev.plantSlots];
      newSlots[slotIdx] = { ...newSlots[slotIdx], blessed: true };
      next = { ...prev, plantSlots: newSlots, cosmicEssence: prev.cosmicEssence - 5 };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Hybridization ----

  const gyCheckHybridization = useCallback((sectorId: string, now: number = Date.now()): { success: boolean; hybridRecipe: GyHybridRecipe | null; state: GyGalaxyGardenState } => {
    const zoneSlots = state.plantSlots.filter((s) => s.sectorId === sectorId && s.plantId !== null);
    if (zoneSlots.length < 2) return { success: false, hybridRecipe: null, state };

    const plantedIds = new Set(zoneSlots.map((s) => s.plantId!));
    for (const recipe of GY_HYBRID_RECIPES) {
      const alreadyDiscovered = state.hybridRecords.find((h) => h.resultPlantId === recipe.result && h.discovered);
      if (alreadyDiscovered) continue;
      if (state.level < recipe.requiredLevel) continue;
      if (plantedIds.has(recipe.parentA) && plantedIds.has(recipe.parentB)) {
        if (prngRef.current() < 0.2) {
          let next = state;
          setState((prev) => {
            const newRecords = prev.hybridRecords.map((h) =>
              h.resultPlantId === recipe.result ? { ...h, discovered: true, discoveredAt: now } : h
            );
            const updatedUnlocked = prev.unlockedPlants.includes(recipe.result)
              ? prev.unlockedPlants
              : [...prev.unlockedPlants, recipe.result];

            next = { ...prev, hybridRecords: newRecords, unlockedPlants: updatedUnlocked, totalHybridized: prev.totalHybridized + 1 };

            let { level, xp } = next;
            xp += 150;
            while (level < GY_MAX_LEVEL && xp >= gyXpRequired(level)) {
              xp -= gyXpRequired(level);
              level += 1;
            }
            if (level >= GY_MAX_LEVEL) xp = 0;
            next = { ...next, level: gyClampLevel(level), xp };
            return next;
          });
          return { success: true, hybridRecipe: recipe, state: next };
        }
      }
    }
    return { success: false, hybridRecipe: null, state };
  }, [state]);

  const gyGetHybridRecords = useCallback((): GyHybridRecord[] => {
    return [...state.hybridRecords];
  }, [state.hybridRecords]);

  const gyGetDiscoveredHybrids = useCallback((): GyHybridRecord[] => {
    return state.hybridRecords.filter((h) => h.discovered);
  }, [state.hybridRecords]);

  const gyGetUndiscoveredHybrids = useCallback((): GyHybridRecord[] => {
    return state.hybridRecords.filter((h) => !h.discovered);
  }, [state.hybridRecords]);

  // ---- Structures ----

  const gyGetStructures = useCallback((): GyStructureDef[] => {
    return [...GY_STRUCTURES];
  }, []);

  const gyGetStructureStates = useCallback((): GyStructureState[] => {
    return [...state.structures];
  }, [state.structures]);

  const gyGetBuiltStructures = useCallback((): GyStructureState[] => {
    return state.structures.filter((s) => s.built);
  }, [state.structures]);

  const gyBuildStructure = useCallback((structureId: string): { success: boolean; cost: number; state: GyGalaxyGardenState } => {
    const def = GY_STRUCTURES.find((s) => s.id === structureId);
    if (!def) return { success: false, cost: 0, state };
    const st = state.structures.find((s) => s.id === structureId);
    if (st?.built) return { success: false, cost: 0, state };
    if (state.level < def.requiredLevel) return { success: false, cost: 0, state };
    if (state.coins < def.baseBuildCost) return { success: false, cost: def.baseBuildCost, state };

    let next = state;
    setState((prev) => {
      const newStructures = prev.structures.map((s) =>
        s.id === structureId ? { ...s, built: true, level: 1 } : s
      );
      const upgradeCount = prev.structures.find((s) => s.id === structureId && !s.built)
        ? prev.structureUpgradeCount + 1
        : prev.structureUpgradeCount;
      next = { ...prev, structures: newStructures, coins: gyClampCoins(prev.coins - def.baseBuildCost), totalSpent: prev.totalSpent + def.baseBuildCost, structureUpgradeCount: upgradeCount };
      return next;
    });
    return { success: true, cost: def.baseBuildCost, state: next };
  }, [state]);

  const gyUpgradeStructure = useCallback((structureId: string): { success: boolean; cost: number; state: GyGalaxyGardenState } => {
    const def = GY_STRUCTURES.find((s) => s.id === structureId);
    const st = state.structures.find((s) => s.id === structureId);
    if (!def || !st || !st.built) return { success: false, cost: 0, state };
    if (st.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseBuildCost * Math.pow(1.5, st.level));
    if (state.coins < cost) return { success: false, cost, state };

    let next = state;
    setState((prev) => {
      const newStructures = prev.structures.map((s) =>
        s.id === structureId ? { ...s, level: s.level + 1 } : s
      );
      next = { ...prev, structures: newStructures, coins: gyClampCoins(prev.coins - cost), totalSpent: prev.totalSpent + cost, structureUpgradeCount: prev.structureUpgradeCount + 1 };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  const gyGetStructureBonus = useCallback((structureId: string): number => {
    const st = state.structures.find((s) => s.id === structureId);
    const def = GY_STRUCTURES.find((d) => d.id === structureId);
    if (!st || !def || !st.built) return 0;
    return def.baseBonusValue * (0.5 + st.level * 0.15);
  }, [state.structures]);

  // ---- Abilities ----

  const gyGetAbilities = useCallback((): GyAbilityDef[] => {
    return [...GY_ABILITIES];
  }, []);

  const gyGetAbilityById = useCallback((id: string): GyAbilityDef | null => {
    return GY_ABILITIES.find((a) => a.id === id) ?? null;
  }, []);

  const gyGetAbilityStates = useCallback((): GyAbilityState[] => {
    return [...state.abilities];
  }, [state.abilities]);

  const gyGetUnlockedAbilities = useCallback((): GyAbilityState[] => {
    return state.abilities.filter((a) => a.unlocked);
  }, [state.abilities]);

  const gyIsAbilityUnlocked = useCallback((abilityId: string): boolean => {
    const a = state.abilities.find((ab) => ab.id === abilityId);
    return a?.unlocked ?? false;
  }, [state.abilities]);

  const gyUnlockAbility = useCallback((abilityId: string): { success: boolean; cost: number; state: GyGalaxyGardenState } => {
    const def = GY_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return { success: false, cost: 0, state };
    if (state.level < def.unlockLevel) return { success: false, cost: def.unlockCost, state };
    if (state.coins < def.unlockCost) return { success: false, cost: def.unlockCost, state };

    const abilityState = state.abilities.find((a) => a.id === abilityId);
    if (abilityState?.unlocked) return { success: false, cost: 0, state };

    let next = state;
    setState((prev) => {
      const newAbilities = prev.abilities.map((a) =>
        a.id === abilityId ? { ...a, unlocked: true } : a
      );
      next = { ...prev, abilities: newAbilities, coins: gyClampCoins(prev.coins - def.unlockCost), totalSpent: prev.totalSpent + def.unlockCost };
      return next;
    });
    return { success: true, cost: def.unlockCost, state: next };
  }, [state]);

  const gyUseAbility = useCallback((abilityId: string, now: number = Date.now()): { success: boolean; state: GyGalaxyGardenState } => {
    const abilityState = state.abilities.find((a) => a.id === abilityId);
    if (!abilityState || !abilityState.unlocked) return { success: false, state };
    const def = GY_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return { success: false, state };

    const cooldownMs = def.cooldown * 1000;
    if (now - abilityState.lastUsedAt < cooldownMs) return { success: false, state };

    let next = state;
    setState((prev) => {
      const newAbilities = prev.abilities.map((a) =>
        a.id === abilityId ? { ...a, lastUsedAt: now } : a
      );

      let updated = { ...prev, abilities: newAbilities, abilityUseCount: prev.abilityUseCount + 1 };

      // Ability-specific effects
      if (def.category === 'cultivation' && def.power > 0) {
        // Growth boost ability — reduce all growing plants' time
        const newSlots = [...updated.plantSlots];
        for (let i = 0; i < newSlots.length; i++) {
          const slot = newSlots[i];
          if (slot.plantId && now < slot.harvestAt) {
            const remaining = slot.harvestAt - now;
            const reduction = Math.floor(remaining * (def.power / 1000));
            newSlots[i] = { ...slot, harvestAt: slot.harvestAt - reduction };
          }
        }
        updated = { ...updated, plantSlots: newSlots };
      }

      if (abilityId === 'gy_cosmic_essence_drain') {
        const essenceGain = 5 + Math.floor(stateRef.current.level * 0.5);
        const coinGain = 20 + stateRef.current.level * 5;
        const xpGain = 10 + stateRef.current.level * 3;
        updated = { ...updated, cosmicEssence: updated.cosmicEssence + essenceGain, coins: gyClampCoins(updated.coins + coinGain), totalEarned: updated.totalEarned + coinGain };
        let { level, xp } = updated;
        xp += xpGain;
        while (level < GY_MAX_LEVEL && xp >= gyXpRequired(level)) {
          xp -= gyXpRequired(level);
          level += 1;
        }
        if (level >= GY_MAX_LEVEL) xp = 0;
        updated = { ...updated, level: gyClampLevel(level), xp };
      }

      return updated;
    });
    return { success: true, state: next };
  }, [state]);

  const gyIsAbilityOnCooldown = useCallback((abilityId: string, now: number = Date.now()): boolean => {
    const abilityState = state.abilities.find((a) => a.id === abilityId);
    if (!abilityState || !abilityState.unlocked) return true;
    const def = GY_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return true;
    return (now - abilityState.lastUsedAt) < def.cooldown * 1000;
  }, [state.abilities]);

  const gyGetAbilityCooldownRemaining = useCallback((abilityId: string, now: number = Date.now()): number => {
    const abilityState = state.abilities.find((a) => a.id === abilityId);
    if (!abilityState || !abilityState.unlocked) return 0;
    const def = GY_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return 0;
    const remaining = def.cooldown * 1000 - (now - abilityState.lastUsedAt);
    return Math.max(0, remaining);
  }, [state.abilities]);

  // ---- Achievements ----

  const gyGetAchievements = useCallback((): GyAchievementDef[] => {
    return [...GY_ACHIEVEMENTS];
  }, []);

  const gyGetUnlockedAchievements = useCallback((): GyAchievementState[] => {
    return state.unlockedAchievements.filter((a) => a.unlocked);
  }, [state.unlockedAchievements]);

  const gyIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    const a = state.unlockedAchievements.find((ach) => ach.id === achievementId);
    return a?.unlocked ?? false;
  }, [state.unlockedAchievements]);

  const gyCheckAchievements = useCallback((): GyAchievementState[] => {
    const now = Date.now();
    let next = state;
    const newlyUnlocked: GyAchievementState[] = [];

    setState((prev) => {
      let updated = prev;

      for (const ach of GY_ACHIEVEMENTS) {
        const currentState = updated.unlockedAchievements.find((a) => a.id === ach.id);
        if (!currentState || currentState.unlocked) continue;

        let value = 0;
        if (ach.conditionKey === 'totalPlanted') value = updated.totalPlanted;
        else if (ach.conditionKey === 'totalHarvested') value = updated.totalHarvested;
        else if (ach.conditionKey === 'totalFertilized') value = updated.totalFertilized;
        else if (ach.conditionKey === 'totalEarned') value = updated.totalEarned;
        else if (ach.conditionKey === 'level') value = updated.level;
        else if (ach.conditionKey === 'totalHybridized') value = updated.totalHybridized;
        else if (ach.conditionKey === 'gardenExpansionCount') value = updated.gardenExpansionCount;
        else if (ach.conditionKey === 'structureUpgradeCount') value = updated.structureUpgradeCount;
        else if (ach.conditionKey === 'abilityUseCount') value = updated.abilityUseCount;
        else if (ach.conditionKey === 'totalCosmicEvents') value = updated.totalCosmicEvents;
        else if (ach.conditionKey === 'harvestCountByRarity_legendary') value = updated.harvestCountByRarity.legendary;

        if (value >= ach.targetValue) {
          newlyUnlocked.push({ id: ach.id, unlocked: true, unlockedAt: now });
          updated = {
            ...updated,
            unlockedAchievements: updated.unlockedAchievements.map((a) =>
              a.id === ach.id ? { ...a, unlocked: true, unlockedAt: now } : a
            ),
            coins: gyClampCoins(updated.coins + ach.rewardCoins),
            totalEarned: updated.totalEarned + ach.rewardCoins,
          };
          let { level, xp } = updated;
          xp += ach.rewardXP;
          while (level < GY_MAX_LEVEL && xp >= gyXpRequired(level)) {
            xp -= gyXpRequired(level);
            level += 1;
          }
          if (level >= GY_MAX_LEVEL) xp = 0;
          updated = { ...updated, level: gyClampLevel(level), xp };
        }
      }

      return updated;
    });

    return newlyUnlocked;
  }, [state]);

  // ---- Daily Tasks ----

  const gyGetDailyTask = useCallback((): GyDailyTaskState | null => {
    return state.dailyTask;
  }, [state.dailyTask]);

  const gyRefreshDailyTask = useCallback((now: number = Date.now()): { dailyTask: GyDailyTaskPoolDef | null; state: GyGalaxyGardenState } => {
    const dayKey = gyGenerateDayKey(now);
    if (state.dailyTask && state.dailyTask.dayKey === dayKey) {
      const pool = GY_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
      return { dailyTask: pool ?? null, state };
    }

    const daySeed = gyHashString(dayKey) & 0x7fffffff;
    const rng = mulberry32(daySeed);
    const taskIndex = Math.floor(rng() * GY_DAILY_TASK_POOL.length);
    const task = GY_DAILY_TASK_POOL[taskIndex];

    const yesterdayKey = gyGenerateDayKey(now - 86400000);
    const newStreak = state.lastDaily === yesterdayKey ? state.dailyStreak + 1 : (state.lastDaily === dayKey ? state.dailyStreak : 1);

    let next = state;
    setState((prev) => {
      next = { ...prev, dailyTask: { poolId: task.id, progress: 0, claimed: false, dayKey }, dailyStreak: newStreak, lastDaily: dayKey };
      return next;
    });
    return { dailyTask: task, state: next };
  }, [state]);

  const gyClaimDailyReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: GyGalaxyGardenState } => {
    if (!state.dailyTask || state.dailyTask.claimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const poolDef = GY_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask.poolId);
    if (!poolDef) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    if (state.dailyTask.progress < poolDef.target) return { success: false, rewardCoins: 0, rewardXP: 0, state };

    const streakBonus = 1 + state.dailyStreak * 0.05;
    const rewardCoins = Math.floor(poolDef.rewardCoins * streakBonus);
    const rewardXP = Math.floor(poolDef.rewardXP * streakBonus);

    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += rewardXP;
      while (level < GY_MAX_LEVEL && xp >= gyXpRequired(level)) {
        xp -= gyXpRequired(level);
        level += 1;
      }
      if (level >= GY_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        dailyTask: { ...prev.dailyTask!, claimed: true },
        coins: gyClampCoins(prev.coins + rewardCoins),
        totalEarned: prev.totalEarned + rewardCoins,
        level: gyClampLevel(level),
        xp,
      };
      return next;
    });
    return { success: true, rewardCoins, rewardXP, state: next };
  }, [state]);

  const gyGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  // ---- Cosmic Harvest Events ----

  const gyGetHarvestEvents = useCallback((): GyHarvestEventDef[] => {
    return [...GY_HARVEST_EVENTS];
  }, []);

  const gyGetCurrentEvent = useCallback((): { event: GyHarvestEventDef | null; remainingMs: number } => {
    if (!state.harvestEvent.eventId) return { event: null, remainingMs: 0 };
    const eventDef = GY_HARVEST_EVENTS.find((e) => e.id === state.harvestEvent.eventId);
    const now = Date.now();
    const remaining = Math.max(0, state.harvestEvent.endsAt - now);
    if (remaining <= 0) return { event: null, remainingMs: 0 };
    return { event: eventDef ?? null, remainingMs: remaining };
  }, [state.harvestEvent]);

  const gyTriggerHarvestEvent = useCallback((eventId: string, now: number = Date.now()): { success: boolean; event: GyHarvestEventDef | null; state: GyGalaxyGardenState } => {
    const eventDef = GY_HARVEST_EVENTS.find((e) => e.id === eventId);
    if (!eventDef) return { success: false, event: null, state };
    if (state.harvestEvent.eventId && now < state.harvestEvent.endsAt) return { success: false, event: null, state };

    let next = state;
    setState((prev) => {
      const newFerts = { ...prev.fertilizers };
      newFerts[eventDef.bonusResource] = (newFerts[eventDef.bonusResource] ?? 0) + eventDef.bonusAmount;

      next = {
        ...prev,
        harvestEvent: { eventId, startedAt: now, endsAt: now + eventDef.duration * 1000 },
        fertilizers: newFerts,
        totalCosmicEvents: prev.totalCosmicEvents + 1,
      };
      return next;
    });
    return { success: true, event: eventDef, state: next };
  }, [state]);

  const gyGetRandomEvent = useCallback((now: number = Date.now()): GyHarvestEventDef | null => {
    if (state.harvestEvent.eventId && now < state.harvestEvent.endsAt) return null;
    const dayKey = gyGenerateDayKey(now);
    const daySeed = (gyHashString(`event_${dayKey}_${state.seed}`) & 0x7fffffff);
    const rng = mulberry32(daySeed);
    const hour = new Date(now).getHours();
    // Events are more likely at certain hours
    const threshold = (hour >= 12 && hour <= 18) ? 0.3 : 0.1;
    if (rng() < threshold) {
      const idx = Math.floor(rng() * GY_HARVEST_EVENTS.length);
      return GY_HARVEST_EVENTS[idx];
    }
    return null;
  }, [state.harvestEvent, state.seed]);

  // ---- Stats ----

  const gyGetStats = useCallback(() => {
    return {
      totalPlanted: state.totalPlanted,
      totalHarvested: state.totalHarvested,
      totalFertilized: state.totalFertilized,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      profit: state.totalEarned - state.totalSpent,
      dailyStreak: state.dailyStreak,
      plantsUnlocked: state.unlockedPlants.length,
      plantsTotal: GY_PLANTS.length,
      sectorsUnlocked: state.unlockedSectors.length,
      sectorsTotal: GY_SECTORS.length,
      structuresBuilt: state.structures.filter((s) => s.built).length,
      structuresTotal: GY_STRUCTURES.length,
      abilitiesUnlocked: state.abilities.filter((a) => a.unlocked).length,
      achievementsUnlocked: state.unlockedAchievements.filter((a) => a.unlocked).length,
      hybridsDiscovered: state.hybridRecords.filter((h) => h.discovered).length,
      totalCosmicEvents: state.totalCosmicEvents,
      cosmicEssence: state.cosmicEssence,
      gardenExpansionCount: state.gardenExpansionCount,
    };
  }, [state]);

  const gyGetGardenOverview = useCallback(() => {
    const title = GY_TITLE_THRESHOLDS.reduce((best, t) => state.level >= t.levelRequired ? t : best, GY_TITLE_THRESHOLDS[0]);
    const seedValue = Object.entries(state.seeds).reduce((sum, [id, count]) => {
      const def = GY_PLANTS.find((p) => p.id === id);
      return sum + (def?.seedCost ?? 0) * count;
    }, 0);
    const fertValue = Object.entries(state.fertilizers).reduce((sum, [id, count]) => {
      const def = GY_FERTILIZERS.find((f) => f.id === id);
      return sum + (def?.cost ?? 0) * count;
    }, 0);

    return {
      gardenName: 'Galaxy Garden',
      level: state.level,
      title,
      coins: state.coins,
      xp: state.xp,
      xpTillNext: gyXpRequired(state.level),
      progress: gyXpRequired(state.level) > 0 ? state.xp / gyXpRequired(state.level) : 1,
      plantsUnlocked: state.unlockedPlants.length,
      plantsTotal: GY_PLANTS.length,
      sectorsUnlocked: state.unlockedSectors.length,
      sectorsTotal: GY_SECTORS.length,
      totalHarvested: state.totalHarvested,
      hybridsDiscovered: state.hybridRecords.filter((h) => h.discovered).length,
      dailyStreak: state.dailyStreak,
      cosmicEssence: state.cosmicEssence,
      netWorth: state.coins + seedValue + fertValue,
    };
  }, [state]);

  // ---- Rarity Info ----

  const gyGetRarityInfo = useCallback((rarity: GyRarity): GyRarityInfo | null => {
    return GY_RARITIES.find((r) => r.key === rarity) ?? null;
  }, []);

  const gyGetAllRarities = useCallback((): GyRarityInfo[] => {
    return [...GY_RARITIES];
  }, []);

  // ---- Titles ----

  const gyGetTitles = useCallback((): GyTitleInfo[] => {
    return [...GY_TITLE_THRESHOLDS];
  }, []);

  const gyGetCurrentTitle = useCallback((): GyTitleInfo => {
    let title = GY_TITLE_THRESHOLDS[0];
    for (const t of GY_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) title = t;
    }
    return title;
  }, [state.level]);

  // ---- Garden Tips ----

  const gyGetGardenTips = useCallback((): string[] => {
    const tips: string[] = [];

    const lockedAvailable = GY_PLANTS.filter(
      (p) => !state.unlockedPlants.includes(p.id) && state.level >= p.requiredLevel
    ).length;
    if (lockedAvailable > 0) {
      tips.push(`🌟 ${lockedAvailable} new cosmic plant(s) available to unlock at your current level!`);
    }

    const emptySlots = state.plantSlots.filter((s) => s.plantId === null).length;
    if (emptySlots > 4) {
      tips.push(`🌱 You have ${emptySlots} empty plot(s) — plant more cosmic seeds for bountiful harvests!`);
    }

    const harvestable = state.plantSlots.filter((s) => s.plantId !== null && Date.now() >= s.harvestAt).length;
    if (harvestable > 0) {
      tips.push(`🌸 ${harvestable} plant(s) are ready for cosmic harvest!`);
    }

    if (state.cosmicEssence >= 5) {
      const unblessed = state.plantSlots.filter((s) => s.plantId !== null && !s.blessed).length;
      if (unblessed > 0) {
        tips.push(`✨ You have ${state.cosmicEssence} cosmic essence — bless plants for 30% harvest boost!`);
      }
    }

    if (state.dailyStreak > 0 && state.dailyStreak % 7 === 0) {
      tips.push(`🔥 Amazing ${state.dailyStreak}-day streak! Daily rewards get a ${Math.floor(state.dailyStreak * 5)}% bonus!`);
    }

    const undiscoveredHybrids = state.hybridRecords.filter((h) => !h.discovered).length;
    if (undiscoveredHybrids > 0) {
      tips.push(`🧬 ${undiscoveredHybrids} undiscovered hybrid(s) — try planting parent pairs together!`);
    }

    if (!state.harvestEvent.eventId || Date.now() >= state.harvestEvent.endsAt) {
      tips.push(`☄️ No active cosmic harvest event — keep an eye out for meteor showers and solar flares!`);
    }

    const lockedSectors = GY_SECTORS.filter((s) => !state.unlockedSectors.includes(s.id) && state.level >= s.unlockLevel);
    if (lockedSectors.length > 0) {
      tips.push(`🗺️ ${lockedSectors.length} new sector(s) can be unlocked at your current level!`);
    }

    const lockedAbilities = GY_ABILITIES.filter((a) => {
      const abilityState = state.abilities.find((ab) => ab.id === a.id);
      return !abilityState?.unlocked && state.level >= a.unlockLevel;
    });
    if (lockedAbilities.length > 0) {
      tips.push(`⚡ ${lockedAbilities.length} gardening abilit(y/ies) can be unlocked at your current level!`);
    }

    return tips;
  }, [state]);

  // ---- Plant Profitability ----

  const gyGetPlantEfficiency = useCallback((plantId: string): { coinsPerSecond: number; xpPerSecond: number; overallScore: number } => {
    const plant = GY_PLANTS.find((p) => p.id === plantId);
    if (!plant) return { coinsPerSecond: 0, xpPerSecond: 0, overallScore: 0 };

    const growthBonus = gyGetSectorGrowthBonus(plant.sectorId);
    const growthMult = 1 + growthBonus * 0.01;
    const adjustedTime = Math.max(1, plant.growTime / growthMult);

    const coinsPerSecond = plant.harvestValue / adjustedTime;
    const xpPerSecond = plant.xpReward / adjustedTime;
    const overallScore = coinsPerSecond + xpPerSecond * 2;

    return {
      coinsPerSecond: Math.round(coinsPerSecond * 100) / 100,
      xpPerSecond: Math.round(xpPerSecond * 100) / 100,
      overallScore: Math.round(overallScore * 100) / 100,
    };
  }, [gyGetSectorGrowthBonus]);

  // ---- Recommended Actions ----

  const gyGetRecommendedPlants = useCallback((): GyPlantDef[] => {
    const affordablePlants = GY_PLANTS.filter((p) =>
      state.unlockedPlants.includes(p.id) && (state.seeds[p.id] ?? 0) > 0
    );
    return [...affordablePlants].sort((a, b) => {
      const effA = gyGetPlantEfficiency(a.id);
      const effB = gyGetPlantEfficiency(b.id);
      return effB.overallScore - effA.overallScore;
    });
  }, [state.unlockedPlants, state.seeds, gyGetPlantEfficiency]);

  // ---- Memoized summary ----

  const gySummary = useMemo(() => {
    return {
      level: state.level,
      coins: state.coins,
      cosmicEssence: state.cosmicEssence,
      activeSector: state.activeSector,
      totalPlants: state.unlockedPlants.length,
      totalSectors: state.unlockedSectors.length,
      dailyStreak: state.dailyStreak,
      totalHarvested: state.totalHarvested,
    };
  }, [state]);

  // ---- Return all hook functions ----

  return {
    gyGetState,
    gyResetState,
    gyGetLevel,
    gyGetXp,
    gyGetXpToNext,
    gyGetXpProgress,
    gyGetTitle,
    gyGetCoins,
    gyGetCosmicEssence,
    gySpendCoins,
    gyCanAfford,
    gyGetPlants,
    gyGetPlantById,
    gyGetUnlockedPlants,
    gyGetLockedPlants,
    gyIsPlantUnlocked,
    gyUnlockPlant,
    gyGetPlantsByRarity,
    gyGetPlantsBySector,
    gyGetSeeds,
    gyGetSeedCount,
    gyBuySeeds,
    gyGetSectors,
    gyGetSectorById,
    gyGetActiveSector,
    gySetActiveSector,
    gyGetUnlockedSectors,
    gyGetLockedSectors,
    gyUnlockSector,
    gyUpgradeSector,
    gyGetSectorGrowthBonus,
    gyGetSectorHarvestBonus,
    gyGetSlotsForSector,
    gyGetEmptySlots,
    gyPlant,
    gyWater,
    gyGetPlantGrowthProgress,
    gyHarvest,
    gyGetHarvestableSlots,
    gyGetGrowingSlots,
    gyGetFertilizers,
    gyGetFertilizerById,
    gyGetFertilizerInventory,
    gyBuyFertilizer,
    gyApplyFertilizer,
    gyBlessPlant,
    gyCheckHybridization,
    gyGetHybridRecords,
    gyGetDiscoveredHybrids,
    gyGetUndiscoveredHybrids,
    gyGetStructures,
    gyGetStructureStates,
    gyGetBuiltStructures,
    gyBuildStructure,
    gyUpgradeStructure,
    gyGetStructureBonus,
    gyGetAbilities,
    gyGetAbilityById,
    gyGetAbilityStates,
    gyGetUnlockedAbilities,
    gyIsAbilityUnlocked,
    gyUnlockAbility,
    gyUseAbility,
    gyIsAbilityOnCooldown,
    gyGetAbilityCooldownRemaining,
    gyGetAchievements,
    gyGetUnlockedAchievements,
    gyIsAchievementUnlocked,
    gyCheckAchievements,
    gyGetDailyTask,
    gyRefreshDailyTask,
    gyClaimDailyReward,
    gyGetDailyStreak,
    gyGetHarvestEvents,
    gyGetCurrentEvent,
    gyTriggerHarvestEvent,
    gyGetRandomEvent,
    gyGetStats,
    gyGetGardenOverview,
    gyGetRarityInfo,
    gyGetAllRarities,
    gyGetTitles,
    gyGetCurrentTitle,
    gyGetGardenTips,
    gyGetPlantEfficiency,
    gyGetRecommendedPlants,
    gySummary,
  };
}
