import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { persist } from 'zustand/middleware';

// ============================================================
// Frost Vine — Enchanted Winter Forest Vine Exploration Wire
// ============================================================

// ============================================================
// Types
// ============================================================

export type FvRarity = 'common' | 'unusual' | 'rare' | 'epic' | 'legendary';

export type FvVineAction = 'weave' | 'brew' | 'bond' | 'thaw' | 'wall';

export type FvElixirGrade = 'frost' | 'glacier' | 'permafrost' | 'eternal';

export type FvDailyQuestType = 'weave' | 'brew' | 'bond' | 'thaw' | 'wall' | 'explore';

export interface FvCreatureDef {
  id: string;
  name: string;
  rarity: FvRarity;
  groveId: string;
  vineType: string;
  frostPotency: number;
  growthRate: number;
  description: string;
  emoji: string;
  xpReward: number;
  bondChance: number;
  requiredLevel: number;
}

export interface FvGroveDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockLevel: number;
  baseGatherRate: number;
  creatureList: string[];
  herbList: string[];
}

export interface FvHerbDef {
  id: string;
  name: string;
  rarity: FvRarity;
  description: string;
  emoji: string;
  gatherXp: number;
  groveId: string;
}

export interface FvAbilityDef {
  id: string;
  name: string;
  rarity: FvRarity;
  description: string;
  emoji: string;
  frostCost: number;
  cooldown: number;
  xpReward: number;
  requiredLevel: number;
  effect: string;
}

export interface FvStructureDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  frostBonus: number;
  requiredLevel: number;
}

export interface FvIceSpiritDef {
  id: string;
  name: string;
  element: string;
  description: string;
  emoji: string;
  blessingType: string;
  blessingPower: number;
  giftPreference: string;
}

export interface FvElixirRecipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  ingredients: { herbId: string; amount: number }[];
  grade: FvElixirGrade;
  effect: string;
  effectValue: number;
  xpReward: number;
  requiredLevel: number;
}

export interface FvAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXp: number;
  emoji: string;
}

export interface FvTitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface FvRarityInfo {
  key: FvRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface FvColorTheme {
  frostGreen: string;
  iceWhite: string;
  winterBlue: string;
  vineBrown: string;
  snowdropPink: string;
  permafrostTeal: string;
}

export interface FvCreatureState {
  owned: boolean;
  count: number;
  bonded: boolean;
  ridden: boolean;
  lastSeen: number | null;
}

export interface FvGroveState {
  explored: boolean;
  level: number;
  gatheredCount: number;
  creaturesFound: number;
  unlockedAt: number | null;
}

export interface FvAbilityState {
  learned: boolean;
  castCount: number;
  cooldownEnd: number;
}

export interface FvStructureState {
  level: number;
  builtAt: number | null;
}

export interface FvIceSpiritState {
  befriended: boolean;
  friendship: number;
  giftsGiven: number;
  lastGiftAt: number | null;
}

export interface FvAchievementState {
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface FvDailyQuestState {
  lastDate: string | null;
  streak: number;
  completed: boolean;
  questType: FvDailyQuestType | null;
  questProgress: number;
  questTarget: number;
  rewardClaimed: boolean;
}

export interface FvSeasonState {
  id: string | null;
  progress: number;
  startTime: number | null;
  endTime: number | null;
  rewardClaimed: boolean;
}

export interface FvTotals {
  totalWeaved: number;
  totalCreaturesFound: number;
  totalElixirsBrewed: number;
  totalWallsBuilt: number;
  totalThawsManaged: number;
  totalAbilityCasts: number;
  totalSpiritsBefriended: number;
  totalRides: number;
  totalHerbsGathered: number;
}

export interface FrostVineState {
  level: number;
  xp: number;
  coins: number;
  title: string;
  creatures: Record<string, FvCreatureState>;
  groves: Record<string, FvGroveState>;
  herbs: Record<string, number>;
  elixirs: Record<string, number>;
  abilities: Record<string, FvAbilityState>;
  structures: Record<string, FvStructureState>;
  iceSpirits: Record<string, FvIceSpiritState>;
  achievements: Record<string, FvAchievementState>;
  dailyQuest: FvDailyQuestState;
  activeSeason: FvSeasonState;
  totals: FvTotals;
  seed: number;
  thawLevel: number;
  vineWallStrength: number;
}

// ============================================================
// Seeded PRNG
// ============================================================

function fvMulberry32(seed: number): () => number {
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

export const FV_MAX_LEVEL = 50;

function fvXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= FV_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function fvClampLevel(lvl: number): number {
  return Math.max(1, Math.min(FV_MAX_LEVEL, lvl));
}

function fvClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function fvGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function fvRarityMultiplier(r: FvRarity): number {
  const map: Record<FvRarity, number> = {
    common: 1,
    unusual: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
  };
  return map[r] ?? 1;
}

function fvMakeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// ============================================================
// Constants
// ============================================================

export const FV_COLOR_THEME: FvColorTheme = {
  frostGreen: '#A8D8B9',
  iceWhite: '#E8F4F8',
  winterBlue: '#7EB8D4',
  vineBrown: '#6B4226',
  snowdropPink: '#F8C8DC',
  permafrostTeal: '#5FABA8',
};

export const FV_RARITIES: FvRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'unusual', label: 'Unusual', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
];

export const FV_TITLES: FvTitleInfo[] = [
  { name: 'Frost Sprout', levelRequired: 1, description: 'A tender seedling taking root in the frozen forest' },
  { name: 'Ice Tendril', levelRequired: 6, description: 'Your first frost vines begin to weave through the undergrowth' },
  { name: 'Winter Cultivator', levelRequired: 12, description: 'You nurture frost herbs through the harshest winters' },
  { name: 'Glacier Gardener', levelRequired: 20, description: 'A master of frozen botany with thriving ice gardens' },
  { name: 'Frostvine Warden', levelRequired: 28, description: 'Guardian of the vine groves — creatures bow to your frost mastery' },
  { name: 'Permafrost Sage', levelRequired: 36, description: 'Your wisdom rivals the oldest ice spirits of the frozen wood' },
  { name: 'Ancient Iceweaver', levelRequired: 44, description: 'You weave frost vines that withstand the deepest freeze' },
  { name: 'Eternal Vinekeeper', levelRequired: 50, description: 'The forest chose you — an eternal bond between frost and vine' },
];

export const FV_GROVES: FvGroveDef[] = [
  {
    id: 'frozen_canopy',
    name: 'Frozen Canopy',
    description: 'Towering ice-covered trees where frost vines drape like crystalline curtains',
    emoji: '🌲',
    unlockLevel: 1,
    baseGatherRate: 0.7,
    creatureList: ['ice_moth', 'frost_wisp', 'bark_beetle', 'vine_sprite', 'snow_fox'],
    herbList: ['frostpetal', 'ice_fern', 'snowdrop_moss'],
  },
  {
    id: 'ice_root_hollow',
    name: 'Ice Root Hollow',
    description: 'A deep cavern of ancient roots sheathed in permanent ice',
    emoji: '🕳️',
    unlockLevel: 5,
    baseGatherRate: 0.65,
    creatureList: ['root_badger', 'crystal_toad', 'frost_wisp', 'vine_sprite', 'seed_squirrel'],
    herbList: ['rootmint', 'glacial_root', 'vine_berry'],
  },
  {
    id: 'frost_bloom_garden',
    name: 'Frost Bloom Garden',
    description: 'A magical garden where frost flowers bloom year-round beneath frozen boughs',
    emoji: '🌸',
    unlockLevel: 10,
    baseGatherRate: 0.75,
    creatureList: ['frost_wisp', 'bark_beetle', 'ice_moth', 'snow_wren', 'thorn_bug'],
    herbList: ['frost_blossom', 'snow_lily', 'winter_sage'],
  },
  {
    id: 'glacier_vine_trail',
    name: 'Glacier Vine Trail',
    description: 'A winding path along a frozen river where ancient vines cross overhead',
    emoji: '❄️',
    unlockLevel: 15,
    baseGatherRate: 0.7,
    creatureList: ['ice_moth', 'river_nymph', 'snow_fox', 'frost_weasel', 'dew_ant'],
    herbList: ['glacier_moss', 'crystal_vine', 'permafrost_leaf'],
  },
  {
    id: 'evergreen_hollow',
    name: 'Evergreen Hollow',
    description: 'A sheltered valley where pine trees wear crowns of eternal frost',
    emoji: '🌲',
    unlockLevel: 20,
    baseGatherRate: 0.6,
    creatureList: ['vine_sprite', 'ice_moth', 'crystal_toad', 'frost_owl', 'ice_dragonet'],
    herbList: ['evergreen_extract', 'frost_berries', 'pine_resin'],
  },
  {
    id: 'ancient_vine_sanctum',
    name: 'Ancient Vine Sanctum',
    description: 'The sacred heart of the frost forest where the oldest vines pulse with ice magic',
    emoji: '🏛️',
    unlockLevel: 30,
    baseGatherRate: 0.55,
    creatureList: ['frost_owl', 'ancient_treant', 'spirit_bear', 'thorn_wolf', 'emerald_basilisk'],
    herbList: ['ancient_vine_bark', 'phoenix_frost_fern', 'void_frost_petal'],
  },
  {
    id: 'thorn_tundra',
    name: 'Thorn Tundra',
    description: 'A frozen wasteland of thorny vines and biting winds hiding rare frost creatures',
    emoji: '🌑',
    unlockLevel: 35,
    baseGatherRate: 0.5,
    creatureList: ['shadow_panther', 'thorn_wolf', 'vine_serpent', 'bramble_boar', 'frost_wyrm'],
    herbList: ['thorn_ice_root', 'shadow_fern', 'dragonlily'],
  },
  {
    id: 'world_frost_tree',
    name: 'World Frost Tree',
    description: 'The legendary frost tree connecting all frozen realms — source of all vine magic',
    emoji: '🌍',
    unlockLevel: 45,
    baseGatherRate: 0.45,
    creatureList: ['frost_dragon', 'world_tree_guardian', 'ice_stag', 'elder_phoenix', 'frost_hydra'],
    herbList: ['world_tree_sap', 'starfall_frost_blossom', 'eternity_root'],
  },
];

export const FV_CREATURES: FvCreatureDef[] = [
  // Common (8)
  { id: 'ice_moth', name: 'Ice Moth', rarity: 'common', groveId: 'frozen_canopy', vineType: 'Frost Thread', frostPotency: 8, growthRate: 0.6, description: 'A moth with wings of frozen gossamer that leaves ice crystals in its wake', emoji: '🦋', xpReward: 10, bondChance: 0.5, requiredLevel: 1 },
  { id: 'frost_wisp', name: 'Frost Wisp', rarity: 'common', groveId: 'frozen_canopy', vineType: 'Rootvine', frostPotency: 6, growthRate: 0.7, description: 'Tiny spirits that dance along frozen vines, emitting soft cold light', emoji: '✨', xpReward: 8, bondChance: 0.55, requiredLevel: 1 },
  { id: 'bark_beetle', name: 'Bark Beetle', rarity: 'common', groveId: 'frost_bloom_garden', vineType: 'Bark Crawler', frostPotency: 5, growthRate: 0.8, description: 'Beetles that burrow under frozen bark carrying messages through the vine network', emoji: '🪲', xpReward: 8, bondChance: 0.6, requiredLevel: 1 },
  { id: 'vine_sprite', name: 'Vine Sprite', rarity: 'common', groveId: 'frozen_canopy', vineType: 'Twining Sprout', frostPotency: 9, growthRate: 0.5, description: 'Mischievous sprites that tend to frost vines, weaving ice patterns into leaves', emoji: '🧚', xpReward: 10, bondChance: 0.5, requiredLevel: 1 },
  { id: 'snow_fox', name: 'Snow Fox', rarity: 'common', groveId: 'frozen_canopy', vineType: 'Trail Vine', frostPotency: 12, growthRate: 0.4, description: 'A fox with frost-white fur that navigates the frozen forest with grace', emoji: '🦊', xpReward: 12, bondChance: 0.45, requiredLevel: 1 },
  { id: 'dew_ant', name: 'Dew Ant', rarity: 'common', groveId: 'glacier_vine_trail', vineType: 'Dewvine', frostPotency: 4, growthRate: 0.9, description: 'Industrious ants that build elaborate frozen dewdrop bridges between vines', emoji: '🐜', xpReward: 6, bondChance: 0.65, requiredLevel: 1 },
  { id: 'snow_wren', name: 'Snow Wren', rarity: 'common', groveId: 'frost_bloom_garden', vineType: 'Nestvine', frostPotency: 7, growthRate: 0.7, description: 'Tiny birds that weave frost vine nests and sing crystalline melodies', emoji: '🐦', xpReward: 10, bondChance: 0.5, requiredLevel: 1 },
  { id: 'seed_squirrel', name: 'Seed Squirrel', rarity: 'common', groveId: 'ice_root_hollow', vineType: 'Burrow Vine', frostPotency: 6, growthRate: 0.8, description: 'A squirrel that buries frost seeds that sprout into ice vines', emoji: '🐿️', xpReward: 10, bondChance: 0.55, requiredLevel: 1 },
  // Unusual (8)
  { id: 'bramble_boar', name: 'Bramble Boar', rarity: 'unusual', groveId: 'thorn_tundra', vineType: 'Thorn Vine', frostPotency: 22, growthRate: 0.3, description: 'A boar covered in frost-thorned vines that regenerate instantly when damaged', emoji: '🐗', xpReward: 25, bondChance: 0.35, requiredLevel: 5 },
  { id: 'crystal_toad', name: 'Crystal Toad', rarity: 'unusual', groveId: 'frost_bloom_garden', vineType: 'Crystal Root', frostPotency: 18, growthRate: 0.35, description: 'A translucent toad whose body is made of frozen crystal vine sap', emoji: '🐸', xpReward: 20, bondChance: 0.4, requiredLevel: 5 },
  { id: 'frost_weasel', name: 'Frost Weasel', rarity: 'unusual', groveId: 'glacier_vine_trail', vineType: 'Wind Vine', frostPotency: 20, growthRate: 0.4, description: 'A swift weasel that surfs along frozen vines at incredible speed', emoji: '🦡', xpReward: 24, bondChance: 0.35, requiredLevel: 5 },
  { id: 'root_badger', name: 'Root Badger', rarity: 'unusual', groveId: 'ice_root_hollow', vineType: 'Deep Root', frostPotency: 19, growthRate: 0.3, description: 'A badger that tunnels through frozen root networks without cracking the ice', emoji: '🦦', xpReward: 22, bondChance: 0.38, requiredLevel: 5 },
  { id: 'frost_owl', name: 'Frost Owl', rarity: 'unusual', groveId: 'evergreen_hollow', vineType: 'Perch Vine', frostPotency: 24, growthRate: 0.25, description: 'An owl with vine-wrapped talons that sees through winter storms', emoji: '🦉', xpReward: 25, bondChance: 0.3, requiredLevel: 8 },
  { id: 'river_nymph', name: 'River Nymph', rarity: 'unusual', groveId: 'glacier_vine_trail', vineType: 'Water Vine', frostPotency: 21, growthRate: 0.3, description: 'A frost nymph who weaves vines across frozen rivers to create ice bridges', emoji: '🧜', xpReward: 28, bondChance: 0.25, requiredLevel: 8 },
  { id: 'thorn_bug', name: 'Thorn Bug', rarity: 'unusual', groveId: 'frost_bloom_garden', vineType: 'Armor Vine', frostPotency: 16, growthRate: 0.45, description: 'A beetle with a shell of frost thorns that grows harder each winter', emoji: '🪨', xpReward: 20, bondChance: 0.4, requiredLevel: 5 },
  { id: 'ice_dragonet', name: 'Ice Dragonet', rarity: 'unusual', groveId: 'evergreen_hollow', vineType: 'Dragon Vine', frostPotency: 26, growthRate: 0.2, description: 'A small frost dragon that nests in the canopy weaving protective vine barriers', emoji: '🐉', xpReward: 28, bondChance: 0.28, requiredLevel: 8 },
  // Rare (7)
  { id: 'ice_stag', name: 'Ice Stag', rarity: 'rare', groveId: 'world_frost_tree', vineType: 'Antler Vine', frostPotency: 45, growthRate: 0.15, description: 'A stag whose antlers are living frost vines crowned with eternal ice crystals', emoji: '🦌', xpReward: 55, bondChance: 0.18, requiredLevel: 12 },
  { id: 'thorn_wolf', name: 'Thorn Wolf', rarity: 'rare', groveId: 'thorn_tundra', vineType: 'Pack Vine', frostPotency: 42, growthRate: 0.18, description: 'A wolf wrapped in thorned vines that commands packs of lesser frost creatures', emoji: '🐺', xpReward: 55, bondChance: 0.18, requiredLevel: 15 },
  { id: 'forest_phoenix', name: 'Frost Phoenix', rarity: 'rare', groveId: 'evergreen_hollow', vineType: 'Phoenix Vine', frostPotency: 48, growthRate: 0.12, description: 'A phoenix of ice that rises from frozen vines, radiating renewal frost', emoji: '🔥', xpReward: 60, bondChance: 0.15, requiredLevel: 18 },
  { id: 'vine_serpent', name: 'Vine Serpent', rarity: 'rare', groveId: 'thorn_tundra', vineType: 'Coil Vine', frostPotency: 40, growthRate: 0.2, description: 'A serpent made entirely of living frost vines that squeezes through any crack', emoji: '🐍', xpReward: 50, bondChance: 0.2, requiredLevel: 15 },
  { id: 'shadow_panther', name: 'Shadow Panther', rarity: 'rare', groveId: 'thorn_tundra', vineType: 'Shadow Vine', frostPotency: 50, growthRate: 0.1, description: 'A panther that moves between ice shadows, its body wrapped in dark frost vines', emoji: '🐈‍⬛', xpReward: 60, bondChance: 0.15, requiredLevel: 18 },
  { id: 'crystal_deer', name: 'Crystal Deer', rarity: 'rare', groveId: 'evergreen_hollow', vineType: 'Prism Vine', frostPotency: 43, growthRate: 0.17, description: 'A deer with crystalline vine antlers that refract light into frost rainbows', emoji: '✨', xpReward: 55, bondChance: 0.18, requiredLevel: 15 },
  { id: 'frost_wyrm', name: 'Frost Wyrm', rarity: 'rare', groveId: 'thorn_tundra', vineType: 'Serpent Vine', frostPotency: 55, growthRate: 0.08, description: 'A serpentine ice dragon that freezes threats in crystalline vine shells', emoji: '🧊', xpReward: 65, bondChance: 0.12, requiredLevel: 20 },
  // Epic (5)
  { id: 'ancient_treant', name: 'Ancient Treant', rarity: 'epic', groveId: 'ancient_vine_sanctum', vineType: 'World Vine', frostPotency: 85, growthRate: 0.05, description: 'A sentient tree of immense age, its roots woven with the oldest frost vines', emoji: '🌳', xpReward: 130, bondChance: 0.08, requiredLevel: 30 },
  { id: 'spirit_bear', name: 'Spirit Bear', rarity: 'epic', groveId: 'ancient_vine_sanctum', vineType: 'Spirit Vine', frostPotency: 80, growthRate: 0.06, description: 'A spectral bear that walks between frost and spirit realms, wrapped in ghostly vines', emoji: '🐻', xpReward: 130, bondChance: 0.08, requiredLevel: 30 },
  { id: 'emerald_basilisk', name: 'Emerald Basilisk', rarity: 'epic', groveId: 'ancient_vine_sanctum', vineType: 'Jade Vine', frostPotency: 78, growthRate: 0.07, description: 'A basilisk with emerald frost vine scales whose gaze turns intruders to jade', emoji: '💚', xpReward: 120, bondChance: 0.09, requiredLevel: 30 },
  { id: 'frost_dragon', name: 'Frost Dragon', rarity: 'epic', groveId: 'world_frost_tree', vineType: 'Dragon Frost Vine', frostPotency: 95, growthRate: 0.03, description: 'The supreme frost dragon whose body is a tapestry of ancient ice vines', emoji: '🐲', xpReward: 150, bondChance: 0.05, requiredLevel: 38 },
  { id: 'frost_hydra', name: 'Frost Hydra', rarity: 'epic', groveId: 'world_frost_tree', vineType: 'Hydra Vine', frostPotency: 90, growthRate: 0.04, description: 'A many-headed vine dragon that regrows two frost vine heads for every one cut', emoji: '🌿', xpReward: 140, bondChance: 0.06, requiredLevel: 36 },
  // Legendary (7)
  { id: 'world_tree_guardian', name: 'World Tree Guardian', rarity: 'legendary', groveId: 'world_frost_tree', vineType: 'Eternal Vine', frostPotency: 150, growthRate: 0.01, description: 'An immortal being born from the World Frost Tree to protect all frozen realms', emoji: '🛡️', xpReward: 350, bondChance: 0.02, requiredLevel: 48 },
  { id: 'ice_stag', name: 'Moon Ice Stag', rarity: 'legendary', groveId: 'world_frost_tree', vineType: 'Moon Vine', frostPotency: 140, growthRate: 0.02, description: 'The legendary stag that carries the winter moon across the frozen sky', emoji: '🌙', xpReward: 320, bondChance: 0.03, requiredLevel: 45 },
  { id: 'elder_phoenix', name: 'Elder Frost Phoenix', rarity: 'legendary', groveId: 'world_frost_tree', vineType: 'Eternal Phoenix Vine', frostPotency: 145, growthRate: 0.015, description: 'The original frost phoenix whose frozen flames created the first ice vines', emoji: '🔥', xpReward: 340, bondChance: 0.025, requiredLevel: 45 },
  { id: 'frost_night_mare', name: 'Frost Night Mare', rarity: 'legendary', groveId: 'world_frost_tree', vineType: 'Dream Vine', frostPotency: 135, growthRate: 0.02, description: 'A spectral horse that gallops through frozen dreams, leaving vine trails on ice', emoji: '🐎', xpReward: 300, bondChance: 0.03, requiredLevel: 45 },
  { id: 'eternal_vinekeeper', name: 'Eternal Vinekeeper', rarity: 'legendary', groveId: 'world_frost_tree', vineType: 'All Vines', frostPotency: 200, growthRate: 0.0, description: 'The mythical keeper of all frost vines, a being of pure frozen botanical energy', emoji: '👑', xpReward: 500, bondChance: 0.01, requiredLevel: 50 },
  { id: 'glacier_titan', name: 'Glacier Titan', rarity: 'legendary', groveId: 'thorn_tundra', vineType: 'Titan Vine', frostPotency: 160, growthRate: 0.01, description: 'A colossal being made of compressed glacier ice and ancient vine roots', emoji: '🗿', xpReward: 380, bondChance: 0.015, requiredLevel: 48 },
  { id: 'crystal_queen', name: 'Crystal Vine Queen', rarity: 'legendary', groveId: 'ancient_vine_sanctum', vineType: 'Crown Vine', frostPotency: 170, growthRate: 0.008, description: 'The queen of all crystal vines whose crown commands the frozen forest', emoji: '👸', xpReward: 400, bondChance: 0.01, requiredLevel: 50 },
];

export const FV_HERBS: FvHerbDef[] = [
  // Common (7)
  { id: 'frostpetal', name: 'Frostpetal', rarity: 'common', description: 'A luminous petal covered in frost crystals, used in basic ice elixirs', emoji: '🌸', gatherXp: 8, groveId: 'frozen_canopy' },
  { id: 'ice_fern', name: 'Ice Fern', rarity: 'common', description: 'Frost-covered fern fronds that soothe cold damage and calm the mind', emoji: '🌿', gatherXp: 7, groveId: 'frozen_canopy' },
  { id: 'snowdrop_moss', name: 'Snowdrop Moss', rarity: 'common', description: 'Soft frozen moss that produces healing frost dew drops', emoji: '💧', gatherXp: 6, groveId: 'frozen_canopy' },
  { id: 'rootmint', name: 'Rootmint', rarity: 'common', description: 'Cool mint that grows from frozen roots, refreshing and purifying', emoji: '🍃', gatherXp: 8, groveId: 'ice_root_hollow' },
  { id: 'vine_berry', name: 'Vine Berry', rarity: 'common', description: 'Dark frost berries packed with restorative nutrients from vine flowers', emoji: '🫐', gatherXp: 7, groveId: 'ice_root_hollow' },
  { id: 'winter_sage', name: 'Winter Sage', rarity: 'common', description: 'Ancient frost sage leaves used by vinekeepers for wisdom-enhancing teas', emoji: '🌿', gatherXp: 8, groveId: 'frost_bloom_garden' },
  { id: 'glacier_moss', name: 'Glacier Moss', rarity: 'common', description: 'Blue-green moss that grows on slow-moving glaciers, rich in frost nutrients', emoji: '💧', gatherXp: 7, groveId: 'glacier_vine_trail' },
  // Unusual (7)
  { id: 'frost_blossom', name: 'Frost Blossom', rarity: 'unusual', description: 'Flowers that bloom only during frost peaks, their nectar boosts vine growth', emoji: '🌺', gatherXp: 15, groveId: 'frost_bloom_garden' },
  { id: 'snow_lily', name: 'Snow Lily', rarity: 'unusual', description: 'Pure white lilies that absorb and store frost energy in their petals', emoji: '🤍', gatherXp: 14, groveId: 'frost_bloom_garden' },
  { id: 'glacial_root', name: 'Glacial Root', rarity: 'unusual', description: 'Deep roots harvested from beneath glaciers with immense frost power', emoji: '🧊', gatherXp: 16, groveId: 'ice_root_hollow' },
  { id: 'crystal_vine', name: 'Crystal Vine', rarity: 'unusual', description: 'Living vine segments that have crystallized into potent magical ingredients', emoji: '💎', gatherXp: 15, groveId: 'glacier_vine_trail' },
  { id: 'permafrost_leaf', name: 'Permafrost Leaf', rarity: 'unusual', description: 'Leaves from permafrost plants that never thaw, containing ancient ice magic', emoji: '❄️', gatherXp: 16, groveId: 'glacier_vine_trail' },
  { id: 'evergreen_extract', name: 'Evergreen Extract', rarity: 'unusual', description: 'Concentrated sap from frost evergreens that hardens into protective ice', emoji: '🌲', gatherXp: 14, groveId: 'evergreen_hollow' },
  { id: 'pine_resin', name: 'Frost Pine Resin', rarity: 'unusual', description: 'Frozen resin from ancient pines used as a binding agent in elixirs', emoji: '🍯', gatherXp: 15, groveId: 'evergreen_hollow' },
  // Rare (6)
  { id: 'dragonlily', name: 'Dragon Lily', rarity: 'rare', description: 'A fierce frost flower with dragon-scale petals that radiate intense cold', emoji: '🐉', gatherXp: 30, groveId: 'thorn_tundra' },
  { id: 'frost_berries', name: 'Frost Berries', rarity: 'rare', description: 'Rare berries from the heart of the frozen forest that boost frost potency', emoji: '🫐', gatherXp: 28, groveId: 'evergreen_hollow' },
  { id: 'thorn_ice_root', name: 'Thorn Ice Root', rarity: 'rare', description: 'Frozen roots from thorn vines that carry potent defensive frost magic', emoji: '🧊', gatherXp: 32, groveId: 'thorn_tundra' },
  { id: 'shadow_fern', name: 'Shadow Fern', rarity: 'rare', description: 'Dark ferns that grow in complete darkness with shadow-frost properties', emoji: '🌑', gatherXp: 30, groveId: 'thorn_tundra' },
  { id: 'ancient_vine_bark', name: 'Ancient Vine Bark', rarity: 'rare', description: 'Bark from the oldest frost vines containing centuries of ice magic', emoji: '🪵', gatherXp: 35, groveId: 'ancient_vine_sanctum' },
  { id: 'void_frost_petal', name: 'Void Frost Petal', rarity: 'rare', description: 'Petals from void flowers that grow between dimensions of ice and vine', emoji: '🕳️', gatherXp: 34, groveId: 'ancient_vine_sanctum' },
  // Epic (5)
  { id: 'phoenix_frost_fern', name: 'Phoenix Frost Fern', rarity: 'epic', description: 'Ferns tipped with frost phoenix feathers that never melt and always regenerate', emoji: '🪶', gatherXp: 70, groveId: 'ancient_vine_sanctum' },
  { id: 'world_tree_sap', name: 'World Frost Tree Sap', rarity: 'epic', description: 'Frozen sap from the World Frost Tree, the most potent frost substance known', emoji: '🌍', gatherXp: 80, groveId: 'world_frost_tree' },
  { id: 'starfall_frost_blossom', name: 'Starfall Frost Blossom', rarity: 'epic', description: 'Frost flowers that bloom only when stars fall, capturing cosmic ice energy', emoji: '⭐', gatherXp: 75, groveId: 'world_frost_tree' },
  { id: 'eternity_root', name: 'Eternity Root', rarity: 'epic', description: 'A frozen root existing outside of time, granting temporal frost awareness', emoji: '♾️', gatherXp: 85, groveId: 'world_frost_tree' },
  { id: 'crown_vine_essence', name: 'Crown Vine Essence', rarity: 'epic', description: 'Pure essence distilled from the crown vines of the Crystal Vine Queen', emoji: '👑', gatherXp: 90, groveId: 'ancient_vine_sanctum' },
  // Legendary (5)
  { id: 'eternal_frost_dew', name: 'Eternal Frost Dew', rarity: 'legendary', description: 'Dew that never evaporates, collected from the oldest vines at midnight frost peaks', emoji: '💧', gatherXp: 200, groveId: 'world_frost_tree' },
  { id: 'glacier_heart_crystal', name: 'Glacier Heart Crystal', rarity: 'legendary', description: 'The crystallized heart of a glacier, containing primordial ice vine power', emoji: '💠', gatherXp: 220, groveId: 'world_frost_tree' },
  { id: 'frostweaver_blood', name: 'Frostweaver Blood', rarity: 'legendary', description: 'The frozen ichor of an Eternal Vinekeeper, pure liquid frost vine magic', emoji: '🩸', gatherXp: 250, groveId: 'world_frost_tree' },
  { id: 'permafrost_soul', name: 'Permafrost Soul', rarity: 'legendary', description: 'A fragment of permafrost consciousness that grants eternal frost bonding', emoji: '👻', gatherXp: 280, groveId: 'thorn_tundra' },
  { id: 'vine_origin_seed', name: 'Vine Origin Seed', rarity: 'legendary', description: 'The seed from which all frost vines originated, containing creation frost energy', emoji: '🌱', gatherXp: 300, groveId: 'world_frost_tree' },
];

export const FV_ABILITIES: FvAbilityDef[] = [
  // Common (5)
  { id: 'vine_grasp', name: 'Vine Grasp', rarity: 'common', description: 'Command frost vines to ensnare a target in ice', emoji: '🌿', frostCost: 10, cooldown: 5, xpReward: 15, requiredLevel: 1, effect: 'cc' },
  { id: 'frost_weave', name: 'Frost Weave', rarity: 'common', description: 'Accelerate frost vine growth in the surrounding area', emoji: '🌱', frostCost: 8, cooldown: 10, xpReward: 12, requiredLevel: 1, effect: 'growth' },
  { id: 'vine_armor', name: 'Vine Armor', rarity: 'common', description: 'Wrap yourself in hardened frost vines for temporary protection', emoji: '🛡️', frostCost: 12, cooldown: 15, xpReward: 15, requiredLevel: 1, effect: 'defense' },
  { id: 'ice_seed', name: 'Ice Seed', rarity: 'common', description: 'Launch explosive frost seeds that burst into ice shards on impact', emoji: '❄️', frostCost: 10, cooldown: 3, xpReward: 10, requiredLevel: 1, effect: 'damage' },
  { id: 'gentle_freeze', name: 'Gentle Freeze', rarity: 'common', description: 'Summon a gentle frost that heals frost creatures and vines', emoji: '🌨️', frostCost: 8, cooldown: 20, xpReward: 12, requiredLevel: 1, effect: 'heal' },
  // Unusual (5)
  { id: 'frost_beam', name: 'Frost Beam', rarity: 'unusual', description: 'Channel concentrated frost into a powerful beam of vine-wrapped ice', emoji: '💙', frostCost: 20, cooldown: 8, xpReward: 25, requiredLevel: 8, effect: 'damage' },
  { id: 'vine_wall', name: 'Vine Wall', rarity: 'unusual', description: 'Raise a wall of interwoven frost vines that deflects attacks', emoji: '🧱', frostCost: 25, cooldown: 30, xpReward: 30, requiredLevel: 8, effect: 'defense' },
  { id: 'vine_lash', name: 'Vine Lash', rarity: 'unusual', description: 'Extend a razor-sharp frost vine to strike at range', emoji: '🐍', frostCost: 18, cooldown: 4, xpReward: 20, requiredLevel: 8, effect: 'damage' },
  { id: 'natures_frost', name: "Nature's Frost", rarity: 'unusual', description: 'Bless a creature with frost-vine enhanced abilities for a short time', emoji: '🎁', frostCost: 22, cooldown: 60, xpReward: 28, requiredLevel: 10, effect: 'buff' },
  { id: 'frost_wind', name: 'Frost Wind', rarity: 'unusual', description: 'Command frozen winds to carry vine seeds and frost spirits', emoji: '💨', frostCost: 15, cooldown: 15, xpReward: 22, requiredLevel: 8, effect: 'utility' },
  // Rare (5)
  { id: 'thorn_storm', name: 'Thorn Storm', rarity: 'rare', description: 'Unleash a devastating whirlwind of enchanted frost thorns', emoji: '🌪️', frostCost: 40, cooldown: 20, xpReward: 50, requiredLevel: 18, effect: 'damage' },
  { id: 'vine_drain', name: 'Vine Drain', rarity: 'rare', description: 'Draw frost energy from enemies to restore your own vitality', emoji: '💀', frostCost: 35, cooldown: 25, xpReward: 45, requiredLevel: 20, effect: 'heal' },
  { id: 'beast_call', name: 'Beast Call', rarity: 'rare', description: 'Send a frost call that summons bonded frost creatures to your aid', emoji: '🦁', frostCost: 30, cooldown: 45, xpReward: 40, requiredLevel: 18, effect: 'summon' },
  { id: 'root_network', name: 'Root Network', rarity: 'rare', description: 'Connect with all vine roots in the area for awareness and travel', emoji: '🕸️', frostCost: 25, cooldown: 30, xpReward: 35, requiredLevel: 18, effect: 'utility' },
  { id: 'seasonal_thaw', name: 'Seasonal Thaw', rarity: 'rare', description: 'Temporarily thaw a frozen area, revealing hidden frost botanical secrets', emoji: '☀️', frostCost: 30, cooldown: 40, xpReward: 45, requiredLevel: 20, effect: 'utility' },
  // Epic (4)
  { id: 'ancient_awakening', name: 'Ancient Awakening', rarity: 'epic', description: 'Awaken the dormant frost power of the ancient vines', emoji: '🌋', frostCost: 60, cooldown: 120, xpReward: 100, requiredLevel: 32, effect: 'ultimate' },
  { id: 'spirit_walk', name: 'Spirit Walk', rarity: 'epic', description: 'Phase into the frost spirit realm, becoming invisible and intangible', emoji: '👻', frostCost: 50, cooldown: 90, xpReward: 80, requiredLevel: 35, effect: 'utility' },
  { id: 'world_frost_blessing', name: "World Frost Blessing", rarity: 'epic', description: 'Channel the World Frost Tree to grant massive regeneration to all allies', emoji: '🌍', frostCost: 70, cooldown: 180, xpReward: 120, requiredLevel: 38, effect: 'heal' },
  { id: 'vine_overgrowth', name: 'Vine Overgrowth', rarity: 'epic', description: 'Cause vines to grow explosively in all directions, overwhelming enemies', emoji: '🌿', frostCost: 55, cooldown: 100, xpReward: 90, requiredLevel: 30, effect: 'damage' },
  // Legendary (3)
  { id: 'frosts_wrath', name: "Frost's Wrath", rarity: 'legendary', description: 'Unleash the full fury of the frozen forest upon your enemies', emoji: '⚔️', frostCost: 100, cooldown: 300, xpReward: 250, requiredLevel: 45, effect: 'ultimate' },
  { id: 'eternal_winter', name: 'Eternal Winter', rarity: 'legendary', description: 'Cast an eternal winter that freezes time itself in a localized area', emoji: '⏳', frostCost: 80, cooldown: 240, xpReward: 200, requiredLevel: 45, effect: 'utility' },
  { id: 'vine_rebirth', name: 'Vine Rebirth', rarity: 'legendary', description: 'The ultimate frost vine spell — resurrect fallen allies and restore devastated frost land', emoji: '🔄', frostCost: 120, cooldown: 600, xpReward: 300, requiredLevel: 50, effect: 'ultimate' },
];

export const FV_STRUCTURES: FvStructureDef[] = [
  { id: 'vine_wall_basic', name: 'Basic Vine Wall', description: 'A simple wall of woven frost vines for basic protection', emoji: '🧱', maxLevel: 10, baseCost: 30, costMultiplier: 1.4, frostBonus: 5, requiredLevel: 1 },
  { id: 'frost_greenhouse', name: 'Frost Greenhouse', description: 'A frozen greenhouse that accelerates herb growth and frost potency', emoji: '🏡', maxLevel: 10, baseCost: 50, costMultiplier: 1.5, frostBonus: 8, requiredLevel: 3 },
  { id: 'ice_spirit_shrine', name: 'Ice Spirit Shrine', description: 'A shrine where ice spirits gather, boosting friendship gains', emoji: '⛩️', maxLevel: 10, baseCost: 80, costMultiplier: 1.5, frostBonus: 10, requiredLevel: 5 },
  { id: 'root_cellar', name: 'Root Cellar', description: 'An underground storage carved from frozen roots for herb preservation', emoji: '🕳️', maxLevel: 10, baseCost: 40, costMultiplier: 1.4, frostBonus: 6, requiredLevel: 2 },
  { id: 'vine_bridge', name: 'Vine Bridge', description: 'A bridge of living frost vines spanning frozen chasms between groves', emoji: '🌉', maxLevel: 10, baseCost: 60, costMultiplier: 1.5, frostBonus: 7, requiredLevel: 8 },
  { id: 'thorn_barrier', name: 'Thorn Barrier', description: 'A defensive barrier of frost thorns that damages approaching threats', emoji: '🛡️', maxLevel: 10, baseCost: 70, costMultiplier: 1.5, frostBonus: 12, requiredLevel: 10 },
  { id: 'crystal_hothouse', name: 'Crystal Hothouse', description: 'A structure of crystal-clear frost vines that grows rare herbs', emoji: '💎', maxLevel: 10, baseCost: 100, costMultiplier: 1.6, frostBonus: 15, requiredLevel: 15 },
  { id: 'frost_altar', name: 'Frost Altar', description: 'An ancient altar that boosts frost ability power through vine offerings', emoji: '🏛️', maxLevel: 10, baseCost: 120, costMultiplier: 1.6, frostBonus: 18, requiredLevel: 18 },
  { id: 'glacial_vault', name: 'Glacial Vault', description: 'A vault carved from glacial ice for storing legendary frost elixirs', emoji: '🏦', maxLevel: 10, baseCost: 150, costMultiplier: 1.6, frostBonus: 20, requiredLevel: 22 },
  { id: 'vine_observatory', name: 'Vine Observatory', description: 'A towering vine structure for observing frost creatures and ice spirits', emoji: '🔭', maxLevel: 10, baseCost: 130, costMultiplier: 1.6, frostBonus: 16, requiredLevel: 20 },
  { id: 'permafrost_foundry', name: 'Permafrost Foundry', description: 'A forge powered by permafrost that creates frost vine equipment', emoji: '🔨', maxLevel: 10, baseCost: 160, costMultiplier: 1.7, frostBonus: 22, requiredLevel: 25 },
  { id: 'ancient_vine_tower', name: 'Ancient Vine Tower', description: 'A tower of the oldest living frost vines that channels deep frost magic', emoji: '🗼', maxLevel: 10, baseCost: 180, costMultiplier: 1.7, frostBonus: 25, requiredLevel: 28 },
  { id: 'frost_labyrinth', name: 'Frost Labyrinth', description: 'A maze of living frost vines that protects the inner sanctum', emoji: '🌀', maxLevel: 10, baseCost: 200, costMultiplier: 1.7, frostBonus: 28, requiredLevel: 32 },
  { id: 'ice_crown_spire', name: 'Ice Crown Spire', description: 'The tallest frost vine structure, a beacon visible across all groves', emoji: '🗼', maxLevel: 10, baseCost: 220, costMultiplier: 1.8, frostBonus: 30, requiredLevel: 36 },
  { id: 'frost_sanctum', name: 'Frost Sanctum', description: 'The innermost sanctum where frost vine magic is at its most potent', emoji: '👑', maxLevel: 10, baseCost: 250, costMultiplier: 1.8, frostBonus: 35, requiredLevel: 40 },
  { id: 'vine_garden', name: 'Vine Garden', description: 'A curated garden of the rarest frost vine species', emoji: '🌺', maxLevel: 10, baseCost: 90, costMultiplier: 1.5, frostBonus: 10, requiredLevel: 12 },
  { id: 'root_network_hub', name: 'Root Network Hub', description: 'Central hub connecting all frost vine root networks across groves', emoji: '🕸️', maxLevel: 10, baseCost: 140, costMultiplier: 1.6, frostBonus: 18, requiredLevel: 24 },
  { id: 'ice_spirit_sanctuary', name: 'Ice Spirit Sanctuary', description: 'A sacred sanctuary where the strongest ice spirits congregate', emoji: '🕊️', maxLevel: 10, baseCost: 170, costMultiplier: 1.7, frostBonus: 24, requiredLevel: 30 },
  { id: 'frost_vine_colosseum', name: 'Frost Vine Colosseum', description: 'An arena where frost creatures compete and train within vine walls', emoji: '🏟️', maxLevel: 10, baseCost: 190, costMultiplier: 1.7, frostBonus: 26, requiredLevel: 34 },
  { id: 'eternal_frost_monument', name: 'Eternal Frost Monument', description: 'A monument to all frost vinekeepers, radiating eternal frost power', emoji: '🗿', maxLevel: 10, baseCost: 300, costMultiplier: 1.9, frostBonus: 40, requiredLevel: 45 },
  { id: 'vine_weaving_studio', name: 'Vine Weaving Studio', description: 'A studio for advanced vine weaving techniques and frost pattern creation', emoji: '🎨', maxLevel: 10, baseCost: 110, costMultiplier: 1.5, frostBonus: 14, requiredLevel: 16 },
  { id: 'thaw_control_center', name: 'Thaw Control Center', description: 'A center for managing seasonal thaws and protecting frost ecosystems', emoji: '🌡️', maxLevel: 10, baseCost: 160, costMultiplier: 1.6, frostBonus: 20, requiredLevel: 26 },
  { id: 'world_vine_gateway', name: 'World Vine Gateway', description: 'A gateway connecting to the World Frost Tree vine network', emoji: '🚪', maxLevel: 10, baseCost: 350, costMultiplier: 2.0, frostBonus: 50, requiredLevel: 48 },
  { id: 'crystal_ice_palace', name: 'Crystal Ice Palace', description: 'The ultimate frost structure — a palace of crystal and living frost vines', emoji: '🏰', maxLevel: 10, baseCost: 400, costMultiplier: 2.0, frostBonus: 60, requiredLevel: 50 },
];

export const FV_ICE_SPIRITS: FvIceSpiritDef[] = [
  { id: 'spirit_glacius', name: 'Glacius', element: 'Glacier', description: 'The ancient spirit of glaciers — his slow patience shapes the frozen world', emoji: '🏔️', blessingType: 'defense', blessingPower: 16, giftPreference: 'glacier_moss' },
  { id: 'spirit_vernalis', name: 'Vernalis', element: 'Thaw', description: 'The spirit of seasonal thaw — she brings gentle renewal to frost-damaged vines', emoji: '🌱', blessingType: 'growth', blessingPower: 15, giftPreference: 'frost_blossom' },
  { id: 'spirit_cryogen', name: 'Cryogen', element: 'Deep Freeze', description: 'The spirit of deep freeze — his power preserves all frost botanical life', emoji: '❄️', blessingType: 'durability', blessingPower: 25, giftPreference: 'permafrost_leaf' },
  { id: 'spirit_aurora', name: 'Aurora', element: 'Aurora', description: 'The spirit of aurora — her lights accelerate frost vine growth', emoji: '🌅', blessingType: 'growth', blessingPower: 14, giftPreference: 'ice_fern' },
  { id: 'spirit_ventis', name: 'Ventis', element: 'Blizzard', description: 'The spirit of blizzards — his winds spread frost vine seeds across the forest', emoji: '💨', blessingType: 'speed', blessingPower: 18, giftPreference: 'crystal_vine' },
  { id: 'spirit_radix', name: 'Radix', element: 'Roots', description: 'The spirit of frozen roots — she connects all vine root networks', emoji: '🌍', blessingType: 'durability', blessingPower: 22, giftPreference: 'glacial_root' },
  { id: 'spirit_crystara', name: 'Crystara', element: 'Crystal', description: 'The spirit of crystal — she transforms vines into pure frost crystals', emoji: '💎', blessingType: 'power', blessingPower: 20, giftPreference: 'crystal_vine' },
  { id: 'spirit_floris', name: 'Floris', element: 'Frost Bloom', description: 'The spirit of frost blooms — her touch brings forth frozen flowers', emoji: '🌸', blessingType: 'yield', blessingPower: 20, giftPreference: 'snow_lily' },
  { id: 'spirit_noctis', name: 'Noctis', element: 'Polar Night', description: 'The spirit of polar night — his darkness nurtures shadow frost vines', emoji: '🌑', blessingType: 'adaptability', blessingPower: 16, giftPreference: 'shadow_fern' },
  { id: 'spirit_solidus', name: 'Solidus', element: 'Permafrost', description: 'The spirit of permafrost — he maintains the eternal frozen ground', emoji: '🧊', blessingType: 'defense', blessingPower: 24, giftPreference: 'permafrost_leaf' },
];

export const FV_ELIXIR_RECIPES: FvElixirRecipe[] = [
  { id: 'healing_frost_salve', name: 'Healing Frost Salve', description: 'A soothing salve that restores health with frost energy', emoji: '🧴', ingredients: [{ herbId: 'frostpetal', amount: 2 }, { herbId: 'snowdrop_moss', amount: 1 }], grade: 'frost', effect: 'heal', effectValue: 20, xpReward: 15, requiredLevel: 1 },
  { id: 'vine_growth_elixir', name: 'Vine Growth Elixir', description: 'Accelerates the growth of frost vines and structures', emoji: '🧪', ingredients: [{ herbId: 'ice_fern', amount: 2 }, { herbId: 'rootmint', amount: 1 }], grade: 'frost', effect: 'growth', effectValue: 25, xpReward: 15, requiredLevel: 1 },
  { id: 'shadow_frost_brew', name: 'Shadow Frost Brew', description: 'Grants temporary frost shadow vision and stealth', emoji: '🌑', ingredients: [{ herbId: 'shadow_fern', amount: 2 }, { herbId: 'snowdrop_moss', amount: 1 }], grade: 'frost', effect: 'stealth', effectValue: 15, xpReward: 18, requiredLevel: 5 },
  { id: 'thorn_ice_potion', name: 'Thorn Ice Potion', description: 'Wraps the drinker in protective frost thorn vines', emoji: '🧊', ingredients: [{ herbId: 'thorn_ice_root', amount: 1 }, { herbId: 'winter_sage', amount: 2 }], grade: 'frost', effect: 'attack', effectValue: 20, xpReward: 20, requiredLevel: 5 },
  { id: 'glacier_coolant', name: 'Glacier Coolant', description: 'A refreshing frost drink that clears the mind and boosts focus', emoji: '❄️', ingredients: [{ herbId: 'glacier_moss', amount: 2 }, { herbId: 'ice_fern', amount: 1 }], grade: 'frost', effect: 'focus', effectValue: 15, xpReward: 15, requiredLevel: 5 },
  { id: 'crystal_vine_elixir', name: 'Crystal Vine Elixir', description: 'Crystallizes the skin for incredible frost defense', emoji: '💎', ingredients: [{ herbId: 'crystal_vine', amount: 1 }, { herbId: 'frost_blossom', amount: 2 }], grade: 'glacier', effect: 'defense', effectValue: 35, xpReward: 35, requiredLevel: 12 },
  { id: 'frost_balm', name: 'Frost Balm', description: 'A potent frost healing balm from the finest winter herbs', emoji: '🌿', ingredients: [{ herbId: 'frostpetal', amount: 2 }, { herbId: 'winter_sage', amount: 1 }, { herbId: 'vine_berry', amount: 1 }], grade: 'glacier', effect: 'heal', effectValue: 50, xpReward: 30, requiredLevel: 10 },
  { id: 'beast_charm', name: 'Frost Beast Charm', description: 'Makes frost creatures friendlier and easier to bond with', emoji: '🦊', ingredients: [{ herbId: 'frost_blossom', amount: 2 }, { herbId: 'pine_resin', amount: 2 }], grade: 'glacier', effect: 'bond_boost', effectValue: 30, xpReward: 35, requiredLevel: 12 },
  { id: 'frost_wind_tonic', name: 'Frost Wind Tonic', description: 'Grants incredible frost speed and agility for a short time', emoji: '💨', ingredients: [{ herbId: 'permafrost_leaf', amount: 2 }, { herbId: 'evergreen_extract', amount: 1 }], grade: 'glacier', effect: 'speed', effectValue: 30, xpReward: 30, requiredLevel: 10 },
  { id: 'root_shield_elixir', name: 'Root Shield Elixir', description: 'Creates a living shield of frost roots around the drinker', emoji: '🛡️', ingredients: [{ herbId: 'glacial_root', amount: 1 }, { herbId: 'ancient_vine_bark', amount: 1 }], grade: 'glacier', effect: 'defense', effectValue: 40, xpReward: 40, requiredLevel: 15 },
  { id: 'dragon_frost_strength', name: 'Dragon Frost Strength', description: 'Channel raw frost dragon power into your frost vine network', emoji: '🐉', ingredients: [{ herbId: 'dragonlily', amount: 2 }, { herbId: 'thorn_ice_root', amount: 1 }, { herbId: 'crystal_vine', amount: 1 }], grade: 'permafrost', effect: 'attack', effectValue: 60, xpReward: 60, requiredLevel: 20 },
  { id: 'spirit_frost_tea', name: 'Spirit Frost Tea', description: 'Opens a channel of communication with ice spirits', emoji: '👻', ingredients: [{ herbId: 'void_frost_petal', amount: 1 }, { herbId: 'evergreen_extract', amount: 2 }, { herbId: 'snow_lily', amount: 1 }], grade: 'permafrost', effect: 'spirit_boost', effectValue: 45, xpReward: 55, requiredLevel: 20 },
  { id: 'phoenix_frost_brew', name: 'Phoenix Frost Brew', description: 'Grants the ability to rise from frost wounds with renewed vigor', emoji: '🔥', ingredients: [{ herbId: 'phoenix_frost_fern', amount: 2 }, { herbId: 'frost_berries', amount: 1 }, { herbId: 'ancient_vine_bark', amount: 1 }], grade: 'permafrost', effect: 'revive', effectValue: 70, xpReward: 70, requiredLevel: 25 },
  { id: 'world_frost_elixir', name: 'World Frost Elixir', description: 'Temporary access to the World Frost Tree powers', emoji: '🌍', ingredients: [{ herbId: 'world_tree_sap', amount: 1 }, { herbId: 'starfall_frost_blossom', amount: 1 }, { herbId: 'eternity_root', amount: 1 }], grade: 'eternal', effect: 'ultimate_boost', effectValue: 100, xpReward: 120, requiredLevel: 30 },
  { id: 'permafrost_soul_elixir', name: 'Permafrost Soul Elixir', description: 'Grants eternal frost bonding with a chosen frost creature', emoji: '👻', ingredients: [{ herbId: 'permafrost_soul', amount: 1 }, { herbId: 'glacier_heart_crystal', amount: 1 }, { herbId: 'frostweaver_blood', amount: 1 }], grade: 'eternal', effect: 'eternal_bond', effectValue: 150, xpReward: 200, requiredLevel: 40 },
];

export const FV_DAILY_QUEST_TYPES: { type: FvDailyQuestType; name: string; description: string; target: number; rewardCoins: number; rewardXp: number; emoji: string }[] = [
  { type: 'weave', name: 'Vine Weaving', description: 'Weave frost vines in explored groves', target: 5, rewardCoins: 50, rewardXp: 30, emoji: '🌿' },
  { type: 'brew', name: 'Elixir Crafting', description: 'Brew frost elixirs from gathered herbs', target: 3, rewardCoins: 60, rewardXp: 35, emoji: '🧪' },
  { type: 'bond', name: 'Spirit Bonding', description: 'Visit and bond with ice spirits', target: 2, rewardCoins: 55, rewardXp: 30, emoji: '👻' },
  { type: 'thaw', name: 'Thaw Management', description: 'Manage seasonal thaws in groves', target: 3, rewardCoins: 70, rewardXp: 40, emoji: '☀️' },
  { type: 'wall', name: 'Wall Building', description: 'Build and upgrade frost vine walls', target: 2, rewardCoins: 65, rewardXp: 35, emoji: '🧱' },
  { type: 'explore', name: 'Grove Exploration', description: 'Visit and secure all explored groves', target: 4, rewardCoins: 75, rewardXp: 45, emoji: '🌲' },
];

export const FV_SEASON_EVENTS: { id: string; name: string; description: string; emoji: string; duration: number; rewardCoins: number; rewardXp: number; targetProgress: number }[] = [
  { id: 'great_frost_bloom', name: 'Great Frost Bloom', description: 'The forest erupts in frost bloom — herb gathering yields are doubled', emoji: '🌸', duration: 3600, rewardCoins: 500, rewardXp: 300, targetProgress: 50 },
  { id: 'shadow_frost_invasion', name: 'Shadow Frost Invasion', description: 'Dark frost forces threaten the forest — defend the groves', emoji: '🌑', duration: 3600, rewardCoins: 750, rewardXp: 500, targetProgress: 30 },
  { id: 'solstice_festival', name: 'Solstice Festival', description: 'A winter celebration — ice spirits are more friendly and generous', emoji: '⚖️', duration: 7200, rewardCoins: 400, rewardXp: 400, targetProgress: 20 },
  { id: 'ancient_vine_awakening', name: 'Ancient Vine Awakening', description: 'The oldest vines stir with renewed frost power', emoji: '🪨', duration: 5400, rewardCoins: 600, rewardXp: 600, targetProgress: 15 },
  { id: 'midwinter_night', name: 'Midwinter Night', description: 'Frost magic flows freely — ability power is enhanced', emoji: '🌙', duration: 4800, rewardCoins: 350, rewardXp: 350, targetProgress: 40 },
];

export const FV_ACHIEVEMENTS: FvAchievementDef[] = [
  { id: 'ach_first_grove', name: 'First Steps', description: 'Explore your first frost vine grove', conditionKey: 'totalCreaturesFound', targetValue: 1, rewardCoins: 25, rewardXp: 15, emoji: '👣' },
  { id: 'ach_creature_finder_5', name: 'Creature Finder', description: 'Discover 5 different frost creatures', conditionKey: 'totalCreaturesFound', targetValue: 5, rewardCoins: 100, rewardXp: 50, emoji: '🔍' },
  { id: 'ach_creature_finder_15', name: 'Monster Scholar', description: 'Discover 15 different frost creatures', conditionKey: 'totalCreaturesFound', targetValue: 15, rewardCoins: 300, rewardXp: 150, emoji: '📖' },
  { id: 'ach_creature_finder_35', name: 'Bestiary Master', description: 'Discover all 35 frost creatures', conditionKey: 'totalCreaturesFound', targetValue: 35, rewardCoins: 1000, rewardXp: 500, emoji: '📚' },
  { id: 'ach_herb_gatherer', name: 'Herb Gatherer', description: 'Gather 20 frost herbs in total', conditionKey: 'totalHerbsGathered', targetValue: 20, rewardCoins: 80, rewardXp: 40, emoji: '🌿' },
  { id: 'ach_master_herbalist', name: 'Master Herbalist', description: 'Gather 100 frost herbs in total', conditionKey: 'totalHerbsGathered', targetValue: 100, rewardCoins: 300, rewardXp: 150, emoji: '💐' },
  { id: 'ach_elixir_brewer', name: 'Novice Alchemist', description: 'Brew 5 frost elixirs', conditionKey: 'totalElixirsBrewed', targetValue: 5, rewardCoins: 100, rewardXp: 50, emoji: '🧪' },
  { id: 'ach_master_brewer', name: 'Master Alchemist', description: 'Brew 20 frost elixirs', conditionKey: 'totalElixirsBrewed', targetValue: 20, rewardCoins: 400, rewardXp: 200, emoji: '⚗️' },
  { id: 'ach_spirit_friend', name: 'Spirit Friend', description: 'Befriend 3 ice spirits', conditionKey: 'totalSpiritsBefriended', targetValue: 3, rewardCoins: 150, rewardXp: 75, emoji: '👻' },
  { id: 'ach_spirit_council', name: 'Spirit Council', description: 'Befriend all 10 ice spirits', conditionKey: 'totalSpiritsBefriended', targetValue: 10, rewardCoins: 1000, rewardXp: 500, emoji: '🕊️' },
  { id: 'ach_wall_builder', name: 'Wall Builder', description: 'Build 10 vine wall segments', conditionKey: 'totalWallsBuilt', targetValue: 10, rewardCoins: 200, rewardXp: 100, emoji: '🧱' },
  { id: 'ach_thaw_master', name: 'Thaw Master', description: 'Manage 10 seasonal thaws', conditionKey: 'totalThawsManaged', targetValue: 10, rewardCoins: 200, rewardXp: 100, emoji: '☀️' },
  { id: 'ach_ability_master', name: 'Ability Master', description: 'Cast frost abilities 50 times', conditionKey: 'totalAbilityCasts', targetValue: 50, rewardCoins: 300, rewardXp: 150, emoji: '❄️' },
  { id: 'ach_vine_weaver', name: 'Vine Weaver', description: 'Weave frost vines 25 times', conditionKey: 'totalWeaved', targetValue: 25, rewardCoins: 250, rewardXp: 125, emoji: '🌿' },
  { id: 'ach_dragon_rider', name: 'Dragon Rider', description: 'Bond with and ride a legendary frost creature', conditionKey: 'totalRides', targetValue: 1, rewardCoins: 500, rewardXp: 250, emoji: '🐉' },
  { id: 'ach_grove_explorer', name: 'Grove Explorer', description: 'Explore all 8 frost vine groves', conditionKey: 'level', targetValue: 45, rewardCoins: 500, rewardXp: 250, emoji: '🗺️' },
  { id: 'ach_ancient_guardian', name: 'Ancient Guardian', description: 'Reach the maximum level of 50', conditionKey: 'level', targetValue: 50, rewardCoins: 2000, rewardXp: 1000, emoji: '👑' },
  { id: 'ach_daily_10', name: 'Dedicated Vinekeeper', description: 'Complete 10 daily frost quests', conditionKey: 'totalWeaved', targetValue: 50, rewardCoins: 500, rewardXp: 250, emoji: '🏹' },
];

// ============================================================
// Initial State Factory
// ============================================================

function fvCreateInitialState(seed?: number): FrostVineState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  const creatures: Record<string, FvCreatureState> = {};
  for (const c of FV_CREATURES) {
    creatures[c.id] = { owned: false, count: 0, bonded: false, ridden: false, lastSeen: null };
  }
  const groves: Record<string, FvGroveState> = {};
  for (const g of FV_GROVES) {
    groves[g.id] = {
      explored: g.unlockLevel <= 1,
      level: 1,
      gatheredCount: 0,
      creaturesFound: 0,
      unlockedAt: g.unlockLevel <= 1 ? Date.now() : null,
    };
  }
  const abilities: Record<string, FvAbilityState> = {};
  for (const a of FV_ABILITIES) {
    abilities[a.id] = { learned: a.requiredLevel <= 1, castCount: 0, cooldownEnd: 0 };
  }
  const structures: Record<string, FvStructureState> = {};
  for (const s of FV_STRUCTURES) {
    structures[s.id] = { level: 0, builtAt: null };
  }
  const iceSpirits: Record<string, FvIceSpiritState> = {};
  for (const sp of FV_ICE_SPIRITS) {
    iceSpirits[sp.id] = { befriended: false, friendship: 0, giftsGiven: 0, lastGiftAt: null };
  }
  const achievements: Record<string, FvAchievementState> = {};
  for (const ac of FV_ACHIEVEMENTS) {
    achievements[ac.id] = { unlocked: false, unlockedAt: null };
  }

  return {
    level: 1,
    xp: 0,
    coins: 100,
    title: 'Frost Sprout',
    creatures,
    groves,
    herbs: { frostpetal: 3, ice_fern: 2, snowdrop_moss: 2 },
    elixirs: {},
    abilities,
    structures,
    iceSpirits,
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
    activeSeason: {
      id: null,
      progress: 0,
      startTime: null,
      endTime: null,
      rewardClaimed: false,
    },
    totals: {
      totalWeaved: 0,
      totalCreaturesFound: 0,
      totalElixirsBrewed: 0,
      totalWallsBuilt: 0,
      totalThawsManaged: 0,
      totalAbilityCasts: 0,
      totalSpiritsBefriended: 0,
      totalRides: 0,
      totalHerbsGathered: 0,
    },
    seed: effectiveSeed,
    thawLevel: 0,
    vineWallStrength: 0,
  };
}

// ============================================================
// Hook: useFrostVine
// ============================================================

export default function useFrostVine(initialSeed?: number) {
  const [state, setState] = useState<FrostVineState>(() => fvCreateInitialState(initialSeed));
  const prngRef = useRef<() => number>(fvMulberry32(state.seed));
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- Core State ----

  const fvGetState = useCallback((): Readonly<FrostVineState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const fvResetState = useCallback((newSeed?: number) => {
    const s = fvCreateInitialState(newSeed);
    prngRef.current = fvMulberry32(s.seed);
    setState(s);
  }, []);

  const fvGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const fvGetXp = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const fvGetXPTillNext = useCallback((): number => {
    return fvXpRequired(state.level);
  }, [state.level]);

  const fvAddXp = useCallback((amount: number): FrostVineState => {
    let next = state;
    setState((prev) => {
      let lvl = prev.level;
      let xp = prev.xp + Math.floor(amount);
      while (lvl < FV_MAX_LEVEL && xp >= fvXpRequired(lvl)) {
        xp -= fvXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= FV_MAX_LEVEL) xp = 0;
      next = { ...prev, level: fvClampLevel(lvl), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Coins ----

  const fvGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const fvAddCoins = useCallback((amount: number): FrostVineState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: fvClampCoins(prev.coins + amount) };
      return next;
    });
    return next;
  }, [state]);

  const fvSpendCoins = useCallback((amount: number): { success: boolean; state: FrostVineState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: fvClampCoins(prev.coins - amount) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Title ----

  const fvGetTitle = useCallback((): FvTitleInfo => {
    let current = FV_TITLES[0];
    for (const t of FV_TITLES) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const fvGetAllTitles = useCallback((): FvTitleInfo[] => {
    return [...FV_TITLES];
  }, []);

  const fvGetNextTitle = useCallback((): FvTitleInfo | null => {
    for (const t of FV_TITLES) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const fvGetProgress = useCallback((): number => {
    const needed = fvXpRequired(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const fvGetOverallProgress = useCallback((): number => {
    return state.level / FV_MAX_LEVEL;
  }, [state.level]);

  // ---- Creatures ----

  const fvGetCreatures = useCallback((): FvCreatureDef[] => {
    return [...FV_CREATURES];
  }, []);

  const fvGetCreatureById = useCallback((id: string): FvCreatureDef | null => {
    return FV_CREATURES.find((c) => c.id === id) ?? null;
  }, []);

  const fvGetOwnedCreatures = useCallback((): FvCreatureDef[] => {
    return FV_CREATURES.filter((c) => state.creatures[c.id]?.owned);
  }, [state.creatures]);

  const fvGetCreatureByRarity = useCallback((rarity: FvRarity): FvCreatureDef[] => {
    return FV_CREATURES.filter((c) => c.rarity === rarity);
  }, []);

  const fvDiscoverCreature = useCallback((creatureId: string): { success: boolean; state: FrostVineState } => {
    const def = FV_CREATURES.find((c) => c.id === creatureId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      const existing = prev.creatures[creatureId];
      if (!existing) return prev;
      const wasNew = !existing.owned;
      next = {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: {
            ...existing,
            owned: true,
            count: existing.count + 1,
            lastSeen: Date.now(),
          },
        },
        totals: {
          ...prev.totals,
          totalCreaturesFound: prev.totals.totalCreaturesFound + (wasNew ? 1 : 0),
        },
      };
      if (wasNew && existing.lastSeen === null) {
        const groveState = prev.groves[def.groveId];
        if (groveState) {
          next = {
            ...next,
            groves: {
              ...next.groves,
              [def.groveId]: { ...groveState, creaturesFound: groveState.creaturesFound + 1 },
            },
          };
        }
      }
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvBondCreature = useCallback((creatureId: string): { success: boolean; state: FrostVineState } => {
    const def = FV_CREATURES.find((c) => c.id === creatureId);
    if (!def) return { success: false, state };
    const creatureState = state.creatures[creatureId];
    if (!creatureState || !creatureState.owned) return { success: false, state };
    if (creatureState.bonded) return { success: false, state };

    const rng = prngRef.current();
    const structBoost = Object.entries(state.structures)
      .filter(([, s]) => s.builtAt !== null && s.level > 0)
      .reduce((sum, [structId, s]) => {
        const structDef = FV_STRUCTURES.find((d) => d.id === structId);
        return sum + (structDef?.frostBonus ?? 0) * s.level * 0.002;
      }, 0);
    const chance = def.bondChance + structBoost;

    if (rng > chance) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: { ...prev.creatures[creatureId], bonded: true },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvIsCreatureBonded = useCallback((creatureId: string): boolean => {
    return state.creatures[creatureId]?.bonded ?? false;
  }, [state.creatures]);

  const fvRideCreature = useCallback((creatureId: string): { success: boolean; state: FrostVineState } => {
    const creatureState = state.creatures[creatureId];
    if (!creatureState || !creatureState.owned || !creatureState.bonded) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: { ...prev.creatures[creatureId], ridden: true },
        },
        totals: { ...prev.totals, totalRides: prev.totals.totalRides + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvGetBondedCreatures = useCallback((): FvCreatureDef[] => {
    return FV_CREATURES.filter((c) => state.creatures[c.id]?.bonded);
  }, [state.creatures]);

  const fvGetCreatureInfo = useCallback((creatureId: string): FvCreatureState | null => {
    return state.creatures[creatureId] ?? null;
  }, [state.creatures]);

  // ---- Groves ----

  const fvGetGroves = useCallback((): FvGroveDef[] => {
    return [...FV_GROVES];
  }, []);

  const fvGetGroveById = useCallback((id: string): FvGroveDef | null => {
    return FV_GROVES.find((g) => g.id === id) ?? null;
  }, []);

  const fvExploreGrove = useCallback((groveId: string): { success: boolean; state: FrostVineState } => {
    const def = FV_GROVES.find((g) => g.id === groveId);
    if (!def) return { success: false, state };
    if (state.level < def.unlockLevel) return { success: false, state };
    if (state.groves[groveId]?.explored) return { success: false, state };
    let next = state;
    setState((prev) => {
      const groveState = prev.groves[groveId];
      if (!groveState) return prev;
      next = {
        ...prev,
        groves: {
          ...prev.groves,
          [groveId]: { ...groveState, explored: true, unlockedAt: Date.now() },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvIsGroveExplored = useCallback((groveId: string): boolean => {
    return state.groves[groveId]?.explored ?? false;
  }, [state.groves]);

  const fvGetExploredGroves = useCallback((): FvGroveDef[] => {
    return FV_GROVES.filter((g) => state.groves[g.id]?.explored);
  }, [state.groves]);

  const fvGatherInGrove = useCallback((groveId: string): { success: boolean; herbs: { herbId: string; amount: number }[]; state: FrostVineState } => {
    const def = FV_GROVES.find((g) => g.id === groveId);
    if (!def) return { success: false, herbs: [], state };
    const groveState = state.groves[groveId];
    if (!groveState || !groveState.explored) return { success: false, herbs: [], state };

    const groveLevel = groveState.level;
    const baseRate = def.baseGatherRate + groveLevel * 0.02;
    const seasonBoost = state.activeSeason.id === 'great_frost_bloom' ? 1.5 : 1;
    const rng = prngRef.current();

    const foundHerbs: { herbId: string; amount: number }[] = [];
    const newHerbs: Record<string, number> = { ...state.herbs };

    for (const herbId of def.herbList) {
      if (rng <= baseRate * seasonBoost) {
        const amount = 1 + Math.floor(prngRef.current() * 2);
        newHerbs[herbId] = (newHerbs[herbId] ?? 0) + amount;
        foundHerbs.push({ herbId, amount });
      }
    }

    if (foundHerbs.length === 0) return { success: true, herbs: [], state };

    const totalXp = foundHerbs.reduce((sum, h) => {
      const herbDef = FV_HERBS.find((hd) => hd.id === h.herbId);
      return sum + ((herbDef?.gatherXp ?? 5) * h.amount);
    }, 0);

    let next = state;
    setState((prev) => {
      const gs = prev.groves[groveId];
      next = {
        ...prev,
        herbs: newHerbs,
        groves: {
          ...prev.groves,
          [groveId]: { ...gs!, gatheredCount: gs!.gatheredCount + foundHerbs.length },
        },
        totals: { ...prev.totals, totalHerbsGathered: prev.totals.totalHerbsGathered + foundHerbs.length },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(totalXp);
      while (lvl < FV_MAX_LEVEL && xp >= fvXpRequired(lvl)) {
        xp -= fvXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= FV_MAX_LEVEL) xp = 0;
      next = { ...next, level: fvClampLevel(lvl), xp };
      return next;
    });
    return { success: true, herbs: foundHerbs, state: next };
  }, [state]);

  const fvGetGroveInfo = useCallback((groveId: string): FvGroveState | null => {
    return state.groves[groveId] ?? null;
  }, [state.groves]);

  const fvUpgradeGrove = useCallback((groveId: string): { success: boolean; cost: number; state: FrostVineState } => {
    const def = FV_GROVES.find((g) => g.id === groveId);
    if (!def) return { success: false, cost: 0, state };
    const groveState = state.groves[groveId];
    if (!groveState || !groveState.explored) return { success: false, cost: 0, state };
    const cost = Math.floor(50 * Math.pow(1.5, groveState.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const gs = prev.groves[groveId];
      if (!gs) return prev;
      next = {
        ...prev,
        groves: { ...prev.groves, [groveId]: { ...gs, level: gs.level + 1 } },
        coins: fvClampCoins(prev.coins - cost),
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Herbs ----

  const fvGetHerbs = useCallback((): FvHerbDef[] => {
    return [...FV_HERBS];
  }, []);

  const fvGetHerbById = useCallback((id: string): FvHerbDef | null => {
    return FV_HERBS.find((h) => h.id === id) ?? null;
  }, []);

  const fvGetHerbCount = useCallback((herbId: string): number => {
    return state.herbs[herbId] ?? 0;
  }, [state.herbs]);

  const fvGetAllHerbCounts = useCallback((): Record<string, number> => {
    return { ...state.herbs };
  }, [state.herbs]);

  // ---- Elixirs ----

  const fvGetElixirRecipes = useCallback((): FvElixirRecipe[] => {
    return [...FV_ELIXIR_RECIPES];
  }, []);

  const fvCanBrewElixir = useCallback((elixirId: string): boolean => {
    const recipe = FV_ELIXIR_RECIPES.find((r) => r.id === elixirId);
    if (!recipe) return false;
    if (state.level < recipe.requiredLevel) return false;
    for (const ing of recipe.ingredients) {
      if ((state.herbs[ing.herbId] ?? 0) < ing.amount) return false;
    }
    return true;
  }, [state.herbs, state.level]);

  const fvBrewElixir = useCallback((elixirId: string): { success: boolean; state: FrostVineState } => {
    const recipe = FV_ELIXIR_RECIPES.find((r) => r.id === elixirId);
    if (!recipe) return { success: false, state };
    if (state.level < recipe.requiredLevel) return { success: false, state };
    const newHerbs = { ...state.herbs };
    for (const ing of recipe.ingredients) {
      if ((newHerbs[ing.herbId] ?? 0) < ing.amount) return { success: false, state };
      newHerbs[ing.herbId] -= ing.amount;
      if (newHerbs[ing.herbId] <= 0) delete newHerbs[ing.herbId];
    }
    let next = state;
    setState((prev) => {
      const newElixirs = { ...prev.elixirs, [elixirId]: (prev.elixirs[elixirId] ?? 0) + 1 };
      next = {
        ...prev,
        herbs: newHerbs,
        elixirs: newElixirs,
        totals: { ...prev.totals, totalElixirsBrewed: prev.totals.totalElixirsBrewed + 1 },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(recipe.xpReward);
      while (lvl < FV_MAX_LEVEL && xp >= fvXpRequired(lvl)) {
        xp -= fvXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= FV_MAX_LEVEL) xp = 0;
      next = { ...next, level: fvClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvGetElixirCount = useCallback((elixirId: string): number => {
    return state.elixirs[elixirId] ?? 0;
  }, [state.elixirs]);

  const fvUseElixir = useCallback((elixirId: string): { success: boolean; state: FrostVineState } => {
    const count = state.elixirs[elixirId] ?? 0;
    if (count < 1) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newElixirs = { ...prev.elixirs, [elixirId]: prev.elixirs[elixirId] - 1 };
      if (newElixirs[elixirId] <= 0) delete newElixirs[elixirId];
      next = { ...prev, elixirs: newElixirs };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Abilities ----

  const fvGetAbilities = useCallback((): FvAbilityDef[] => {
    return [...FV_ABILITIES];
  }, []);

  const fvLearnAbility = useCallback((abilityId: string): { success: boolean; state: FrostVineState } => {
    const def = FV_ABILITIES.find((a) => a.id === abilityId);
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

  const fvCastAbility = useCallback((abilityId: string, now: number = Date.now()): { success: boolean; state: FrostVineState } => {
    const def = FV_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return { success: false, state };
    const abilityState = state.abilities[abilityId];
    if (!abilityState || !abilityState.learned) return { success: false, state };
    if (now < abilityState.cooldownEnd) return { success: false, state };
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
        totals: { ...prev.totals, totalAbilityCasts: prev.totals.totalAbilityCasts + 1 },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(def.xpReward);
      while (lvl < FV_MAX_LEVEL && xp >= fvXpRequired(lvl)) {
        xp -= fvXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= FV_MAX_LEVEL) xp = 0;
      next = { ...next, level: fvClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvIsAbilityLearned = useCallback((abilityId: string): boolean => {
    return state.abilities[abilityId]?.learned ?? false;
  }, [state.abilities]);

  const fvGetLearnedAbilities = useCallback((): FvAbilityDef[] => {
    return FV_ABILITIES.filter((a) => state.abilities[a.id]?.learned);
  }, [state.abilities]);

  // ---- Structures ----

  const fvGetStructures = useCallback((): FvStructureDef[] => {
    return [...FV_STRUCTURES];
  }, []);

  const fvBuildStructure = useCallback((structureId: string): { success: boolean; state: FrostVineState } => {
    const def = FV_STRUCTURES.find((s) => s.id === structureId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    const currentLevel = state.structures[structureId]?.level ?? 0;
    if (currentLevel >= def.maxLevel) return { success: false, state };
    const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
    if (state.coins < cost) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newLevel = (prev.structures[structureId]?.level ?? 0) + 1;
      next = {
        ...prev,
        structures: {
          ...prev.structures,
          [structureId]: {
            level: newLevel,
            builtAt: prev.structures[structureId]?.builtAt ?? Date.now(),
          },
        },
        coins: fvClampCoins(prev.coins - cost),
        totals: {
          ...prev.totals,
          totalWallsBuilt: prev.totals.totalWallsBuilt + 1,
        },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(20 + newLevel * 5);
      while (lvl < FV_MAX_LEVEL && xp >= fvXpRequired(lvl)) {
        xp -= fvXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= FV_MAX_LEVEL) xp = 0;
      next = { ...next, level: fvClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvGetStructureLevel = useCallback((structureId: string): number => {
    return state.structures[structureId]?.level ?? 0;
  }, [state.structures]);

  const fvGetStructureInfo = useCallback((structureId: string): FvStructureState | null => {
    return state.structures[structureId] ?? null;
  }, [state.structures]);

  const fvGetStructureUpgradeCost = useCallback((structureId: string): number => {
    const def = FV_STRUCTURES.find((s) => s.id === structureId);
    if (!def) return 0;
    const currentLevel = state.structures[structureId]?.level ?? 0;
    if (currentLevel >= def.maxLevel) return 0;
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
  }, [state.structures]);

  // ---- Ice Spirits ----

  const fvGetIceSpirits = useCallback((): FvIceSpiritDef[] => {
    return [...FV_ICE_SPIRITS];
  }, []);

  const fvBefriendSpirit = useCallback((spiritId: string): { success: boolean; state: FrostVineState } => {
    const def = FV_ICE_SPIRITS.find((s) => s.id === spiritId);
    if (!def) return { success: false, state };
    const spiritState = state.iceSpirits[spiritId];
    if (!spiritState) return { success: false, state };
    if (spiritState.befriended) return { success: false, state };
    let next = state;
    setState((prev) => {
      const ss = prev.iceSpirits[spiritId];
      if (!ss) return prev;
      next = {
        ...prev,
        iceSpirits: {
          ...prev.iceSpirits,
          [spiritId]: { ...ss, befriended: true, friendship: 100 },
        },
        totals: { ...prev.totals, totalSpiritsBefriended: prev.totals.totalSpiritsBefriended + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvGiftSpirit = useCallback((spiritId: string, herbId: string): { success: boolean; friendshipGain: number; state: FrostVineState } => {
    const def = FV_ICE_SPIRITS.find((s) => s.id === spiritId);
    if (!def) return { success: false, friendshipGain: 0, state };
    const spiritState = state.iceSpirits[spiritId];
    if (!spiritState) return { success: false, friendshipGain: 0, state };
    if (state.herbs[herbId] === undefined || state.herbs[herbId] < 1) return { success: false, friendshipGain: 0, state };

    const isFavorite = def.giftPreference === herbId;
    const baseGain = isFavorite ? 15 : 5;
    const seasonBoost = state.activeSeason.id === 'solstice_festival' ? 1.5 : 1;
    const friendshipGain = Math.floor(baseGain * seasonBoost);
    const newFriendship = Math.min(100, spiritState.friendship + friendshipGain);

    let next = state;
    setState((prev) => {
      const newHerbs = { ...prev.herbs };
      newHerbs[herbId] -= 1;
      if (newHerbs[herbId] <= 0) delete newHerbs[herbId];
      const ss = prev.iceSpirits[spiritId];
      next = {
        ...prev,
        herbs: newHerbs,
        iceSpirits: {
          ...prev.iceSpirits,
          [spiritId]: {
            ...ss!,
            friendship: Math.min(100, ss!.friendship + friendshipGain),
            giftsGiven: ss!.giftsGiven + 1,
            lastGiftAt: Date.now(),
            befriended: newFriendship >= 100,
          },
        },
        totals: {
          ...prev.totals,
          totalSpiritsBefriended: prev.totals.totalSpiritsBefriended + (newFriendship >= 100 && !ss!.befriended ? 1 : 0),
        },
      };
      return next;
    });
    return { success: true, friendshipGain, state: next };
  }, [state]);

  const fvIsSpiritBefriended = useCallback((spiritId: string): boolean => {
    return state.iceSpirits[spiritId]?.befriended ?? false;
  }, [state.iceSpirits]);

  const fvGetBefriendedSpirits = useCallback((): FvIceSpiritDef[] => {
    return FV_ICE_SPIRITS.filter((s) => state.iceSpirits[s.id]?.befriended);
  }, [state.iceSpirits]);

  // ---- Vine Weaving ----

  const fvWeaveVine = useCallback((): { success: boolean; xp: number; state: FrostVineState } => {
    const rng = prngRef.current();
    const xpGain = Math.floor(10 + rng * 15 + state.level * 2);
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        totals: { ...prev.totals, totalWeaved: prev.totals.totalWeaved + 1 },
      };
      let lvl = next.level;
      let xp = next.xp + xpGain;
      while (lvl < FV_MAX_LEVEL && xp >= fvXpRequired(lvl)) {
        xp -= fvXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= FV_MAX_LEVEL) xp = 0;
      next = { ...next, level: fvClampLevel(lvl), xp };
      return next;
    });
    return { success: true, xp: xpGain, state: next };
  }, [state]);

  // ---- Thaw Management ----

  const fvManageThaw = useCallback((): { success: boolean; state: FrostVineState } => {
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        thawLevel: Math.min(100, prev.thawLevel + 5),
        totals: { ...prev.totals, totalThawsManaged: prev.totals.totalThawsManaged + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvGetThawLevel = useCallback((): number => {
    return state.thawLevel;
  }, [state.thawLevel]);

  // ---- Vine Wall ----

  const fvBuildVineWall = useCallback((): { success: boolean; state: FrostVineState } => {
    const cost = 10 + state.vineWallStrength * 2;
    if (state.coins < cost) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        vineWallStrength: prev.vineWallStrength + 1,
        coins: fvClampCoins(prev.coins - cost),
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvGetVineWallStrength = useCallback((): number => {
    return state.vineWallStrength;
  }, [state.vineWallStrength]);

  // ---- Daily Quest ----

  const fvGetDailyQuest = useCallback((): FvDailyQuestState => {
    return { ...state.dailyQuest };
  }, [state.dailyQuest]);

  const fvStartDailyQuest = useCallback((): { success: boolean; state: FrostVineState } => {
    const today = fvGenerateDayKey(Date.now());
    if (state.dailyQuest.lastDate === today) return { success: false, state };
    const questIdx = Math.floor(prngRef.current() * FV_DAILY_QUEST_TYPES.length);
    const quest = FV_DAILY_QUEST_TYPES[questIdx];
    const newStreak = state.dailyQuest.lastDate !== null
      ? (fvGenerateDayKey(Date.now() - 86400000) === state.dailyQuest.lastDate ? state.dailyQuest.streak + 1 : 1)
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

  const fvUpdateQuestProgress = useCallback((amount: number = 1): { success: boolean; state: FrostVineState } => {
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
        const quest = FV_DAILY_QUEST_TYPES.find((q) => q.type === prev.dailyQuest.questType);
        if (quest) {
          const streakBonus = Math.floor(quest.rewardCoins * (prev.dailyQuest.streak * 0.1));
          next = {
            ...next,
            coins: fvClampCoins(next.coins + quest.rewardCoins + streakBonus),
          };
          let lvl = next.level;
          let xp = next.xp + Math.floor(quest.rewardXp);
          while (lvl < FV_MAX_LEVEL && xp >= fvXpRequired(lvl)) {
            xp -= fvXpRequired(lvl);
            lvl += 1;
          }
          if (lvl >= FV_MAX_LEVEL) xp = 0;
          next = { ...next, level: fvClampLevel(lvl), xp };
        }
      }
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvGetQuestStreak = useCallback((): number => {
    return state.dailyQuest.streak;
  }, [state.dailyQuest]);

  const fvGetQuestInfo = useCallback((): { type: FvDailyQuestType | null; name: string; description: string; target: number; progress: number; rewardCoins: number; rewardXp: number; emoji: string } | null => {
    const dq = state.dailyQuest;
    if (!dq.questType) return null;
    const questDef = FV_DAILY_QUEST_TYPES.find((q) => q.type === dq.questType);
    if (!questDef) return null;
    return {
      type: dq.questType,
      name: questDef.name,
      description: questDef.description,
      target: dq.questTarget,
      progress: dq.questProgress,
      rewardCoins: questDef.rewardCoins + Math.floor(questDef.rewardCoins * (dq.streak * 0.1)),
      rewardXp: questDef.rewardXp,
      emoji: questDef.emoji,
    };
  }, [state.dailyQuest]);

  // ---- Season Events ----

  const fvGetAllSeasons = useCallback((): typeof FV_SEASON_EVENTS => {
    return [...FV_SEASON_EVENTS];
  }, []);

  const fvGetActiveSeason = useCallback((): { event: typeof FV_SEASON_EVENTS[0] | null; progress: number; timeRemaining: number } => {
    if (!state.activeSeason.id) return { event: null, progress: 0, timeRemaining: 0 };
    const def = FV_SEASON_EVENTS.find((e) => e.id === state.activeSeason.id);
    if (!def) return { event: null, progress: 0, timeRemaining: 0 };
    const remaining = state.activeSeason.endTime ? Math.max(0, state.activeSeason.endTime - Date.now()) : 0;
    return { event: def, progress: state.activeSeason.progress, timeRemaining: remaining };
  }, [state.activeSeason]);

  const fvStartSeason = useCallback((seasonId: string): { success: boolean; state: FrostVineState } => {
    const def = FV_SEASON_EVENTS.find((e) => e.id === seasonId);
    if (!def) return { success: false, state };
    if (state.activeSeason.id) return { success: false, state };
    const now = Date.now();
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        activeSeason: {
          id: seasonId,
          progress: 0,
          startTime: now,
          endTime: now + def.duration * 1000,
          rewardClaimed: false,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const fvEndSeason = useCallback((): { success: boolean; state: FrostVineState } => {
    if (!state.activeSeason.id) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        activeSeason: { id: null, progress: 0, startTime: null, endTime: null, rewardClaimed: false },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Achievements ----

  const fvGetAchievements = useCallback((): FvAchievementDef[] => {
    return [...FV_ACHIEVEMENTS];
  }, []);

  const fvIsAchievementUnlocked = useCallback((id: string): boolean => {
    return state.achievements[id]?.unlocked ?? false;
  }, [state.achievements]);

  const fvGetUnlockedAchievements = useCallback((): FvAchievementDef[] => {
    return FV_ACHIEVEMENTS.filter((a) => state.achievements[a.id]?.unlocked);
  }, [state.achievements]);

  const fvGetLockedAchievements = useCallback((): FvAchievementDef[] => {
    return FV_ACHIEVEMENTS.filter((a) => !state.achievements[a.id]?.unlocked);
  }, [state.achievements]);

  const fvCheckAchievements = useCallback((): { newlyUnlocked: FvAchievementDef[]; state: FrostVineState } => {
    const newlyUnlocked: FvAchievementDef[] = [];
    let next = state;
    setState((prev) => {
      const newAchievements = { ...prev.achievements };
      const totalsMap: Record<string, number> = {
        totalWeaved: prev.totals.totalWeaved,
        totalCreaturesFound: prev.totals.totalCreaturesFound,
        totalElixirsBrewed: prev.totals.totalElixirsBrewed,
        totalWallsBuilt: prev.totals.totalWallsBuilt,
        totalThawsManaged: prev.totals.totalThawsManaged,
        totalAbilityCasts: prev.totals.totalAbilityCasts,
        totalSpiritsBefriended: prev.totals.totalSpiritsBefriended,
        totalRides: prev.totals.totalRides,
        totalHerbsGathered: prev.totals.totalHerbsGathered,
        level: prev.level,
      };
      for (const ach of FV_ACHIEVEMENTS) {
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

  const fvGetAchievementProgress = useCallback((id: string): { current: number; target: number; percentage: number } => {
    const def = FV_ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return { current: 0, target: 0, percentage: 0 };
    const totalsMap: Record<string, number> = {
      totalWeaved: state.totals.totalWeaved,
      totalCreaturesFound: state.totals.totalCreaturesFound,
      totalElixirsBrewed: state.totals.totalElixirsBrewed,
      totalWallsBuilt: state.totals.totalWallsBuilt,
      totalThawsManaged: state.totals.totalThawsManaged,
      totalAbilityCasts: state.totals.totalAbilityCasts,
      totalSpiritsBefriended: state.totals.totalSpiritsBefriended,
      totalRides: state.totals.totalRides,
      totalHerbsGathered: state.totals.totalHerbsGathered,
      level: state.level,
    };
    const current = Math.min(totalsMap[def.conditionKey] ?? 0, def.targetValue);
    return { current, target: def.targetValue, percentage: def.targetValue > 0 ? current / def.targetValue : 0 };
  }, [state]);

  // ---- Stats ----

  const fvGetTotalCreaturesFound = useCallback((): number => {
    return state.totals.totalCreaturesFound;
  }, [state.totals]);

  const fvGetTotalHerbsGathered = useCallback((): number => {
    return state.totals.totalHerbsGathered;
  }, [state.totals]);

  const fvGetTotalElixirsBrewed = useCallback((): number => {
    return state.totals.totalElixirsBrewed;
  }, [state.totals]);

  const fvGetTotalWallsBuilt = useCallback((): number => {
    return state.totals.totalWallsBuilt;
  }, [state.totals]);

  const fvGetTotalThawsManaged = useCallback((): number => {
    return state.totals.totalThawsManaged;
  }, [state.totals]);

  const fvGetTotalAbilityCasts = useCallback((): number => {
    return state.totals.totalAbilityCasts;
  }, [state.totals]);

  // ---- Computed Values ----

  const currentTitle = useMemo((): FvTitleInfo => {
    let current = FV_TITLES[0];
    for (const t of FV_TITLES) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const xpProgress = useMemo((): number => {
    const needed = fvXpRequired(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const overallProgress = useMemo((): number => {
    return state.level / FV_MAX_LEVEL;
  }, [state.level]);

  const ownedCreatureCount = useMemo((): number => {
    return Object.values(state.creatures).filter((c) => c.owned).length;
  }, [state.creatures]);

  const exploredGroveCount = useMemo((): number => {
    return Object.values(state.groves).filter((g) => g.explored).length;
  }, [state.groves]);

  const totalHerbCount = useMemo((): number => {
    return Object.values(state.herbs).reduce((sum, count) => sum + count, 0);
  }, [state.herbs]);

  const totalElixirCount = useMemo((): number => {
    return Object.values(state.elixirs).reduce((sum, count) => sum + count, 0);
  }, [state.elixirs]);

  const befriendedSpiritCount = useMemo((): number => {
    return Object.values(state.iceSpirits).filter((s) => s.befriended).length;
  }, [state.iceSpirits]);

  const unlockedAchievementCount = useMemo((): number => {
    return Object.values(state.achievements).filter((a) => a.unlocked).length;
  }, [state.achievements]);

  const totalStructureLevel = useMemo((): number => {
    return Object.values(state.structures).reduce((sum, s) => sum + s.level, 0);
  }, [state.structures]);

  const bondedCreatureCount = useMemo((): number => {
    return Object.values(state.creatures).filter((c) => c.bonded).length;
  }, [state.creatures]);

  const learnedAbilityCount = useMemo((): number => {
    return Object.values(state.abilities).filter((a) => a.learned).length;
  }, [state.abilities]);

  // ---- Auto Achievement Check ----

  useEffect(() => {
    const checkAndNotify = () => {
      const s = stateRef.current;
      const totalsMap: Record<string, number> = {
        totalWeaved: s.totals.totalWeaved,
        totalCreaturesFound: s.totals.totalCreaturesFound,
        totalElixirsBrewed: s.totals.totalElixirsBrewed,
        totalWallsBuilt: s.totals.totalWallsBuilt,
        totalThawsManaged: s.totals.totalThawsManaged,
        totalAbilityCasts: s.totals.totalAbilityCasts,
        totalSpiritsBefriended: s.totals.totalSpiritsBefriended,
        totalRides: s.totals.totalRides,
        totalHerbsGathered: s.totals.totalHerbsGathered,
        level: s.level,
      };
      let changed = false;
      const newAchievements = { ...s.achievements };
      for (const ach of FV_ACHIEVEMENTS) {
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

  // ---- Color Theme ----

  const fvGetColorTheme = useCallback((): FvColorTheme => {
    return { ...FV_COLOR_THEME };
  }, []);

  // ---- Random Helpers ----

  const fvRandomInt = useCallback((min: number, max: number): number => {
    return min + Math.floor(prngRef.current() * (max - min + 1));
  }, []);

  const fvGetSeed = useCallback((): number => {
    return state.seed;
  }, [state.seed]);

  const fvSetSeed = useCallback((seed: number): void => {
    prngRef.current = fvMulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  // ---- Persist Config ----

  const fvPersistConfig = useMemo(() => ({
    name: 'frost-vine-storage',
    version: 1,
  }), []);

  // ============================================================
  // Return Object
  // ============================================================

  return {
    // State
    fvGetState,
    fvResetState,

    // Level / XP
    fvGetLevel,
    fvGetXp,
    fvGetXPTillNext,
    fvAddXp,

    // Coins
    fvGetCoins,
    fvAddCoins,
    fvSpendCoins,
    fvCanAfford,

    // Title
    fvGetTitle,
    fvGetAllTitles,
    fvGetNextTitle,

    // Progress
    fvGetProgress,
    fvGetOverallProgress,

    // Creatures
    fvGetCreatures,
    fvGetCreatureById,
    fvGetOwnedCreatures,
    fvGetCreatureByRarity,
    fvDiscoverCreature,
    fvBondCreature,
    fvIsCreatureBonded,
    fvRideCreature,
    fvGetBondedCreatures,
    fvGetCreatureInfo,

    // Groves
    fvGetGroves,
    fvGetGroveById,
    fvExploreGrove,
    fvIsGroveExplored,
    fvGetExploredGroves,
    fvGatherInGrove,
    fvGetGroveInfo,
    fvUpgradeGrove,

    // Herbs
    fvGetHerbs,
    fvGetHerbById,
    fvGetHerbCount,
    fvGetAllHerbCounts,

    // Elixirs
    fvGetElixirRecipes,
    fvCanBrewElixir,
    fvBrewElixir,
    fvUseElixir,
    fvGetElixirCount,

    // Abilities
    fvGetAbilities,
    fvLearnAbility,
    fvCastAbility,
    fvIsAbilityLearned,
    fvGetLearnedAbilities,

    // Structures
    fvGetStructures,
    fvBuildStructure,
    fvGetStructureLevel,
    fvGetStructureInfo,
    fvGetStructureUpgradeCost,

    // Ice Spirits
    fvGetIceSpirits,
    fvBefriendSpirit,
    fvGiftSpirit,
    fvIsSpiritBefriended,
    fvGetBefriendedSpirits,

    // Vine Mechanics
    fvWeaveVine,
    fvManageThaw,
    fvGetThawLevel,
    fvBuildVineWall,
    fvGetVineWallStrength,

    // Daily Quest
    fvGetDailyQuest,
    fvStartDailyQuest,
    fvUpdateQuestProgress,
    fvGetQuestStreak,
    fvGetQuestInfo,

    // Season Events
    fvGetAllSeasons,
    fvGetActiveSeason,
    fvStartSeason,
    fvEndSeason,

    // Achievements
    fvGetAchievements,
    fvIsAchievementUnlocked,
    fvGetUnlockedAchievements,
    fvGetLockedAchievements,
    fvCheckAchievements,
    fvGetAchievementProgress,

    // Stats
    fvGetTotalCreaturesFound,
    fvGetTotalHerbsGathered,
    fvGetTotalElixirsBrewed,
    fvGetTotalWallsBuilt,
    fvGetTotalThawsManaged,
    fvGetTotalAbilityCasts,

    // Helpers
    fvGetColorTheme,
    fvRandomInt,
    fvGetSeed,
    fvSetSeed,

    // Persist Config
    fvPersistConfig,

    // Computed values
    currentTitle,
    xpProgress,
    overallProgress,
    ownedCreatureCount,
    exploredGroveCount,
    totalHerbCount,
    totalElixirCount,
    befriendedSpiritCount,
    unlockedAchievementCount,
    totalStructureLevel,
    bondedCreatureCount,
    learnedAbilityCount,
  };
}
