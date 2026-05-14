import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { persist } from 'zustand/middleware';

// ============================================================
// Enchanted Forest — Magical Woodland Exploration Wire
// ============================================================

// ============================================================
// Types
// ============================================================

export type EfRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type EfExploreAction = 'forage' | 'track' | 'befriend' | 'defend';

export type EfPotionQuality = 'minor' | 'standard' | 'superior' | 'masterwork';

export type EfPatrolQuestType = 'forage' | 'track' | 'defend' | 'befriend' | 'brew' | 'patrol';

export interface EfCreatureDef {
  id: string;
  name: string;
  rarity: EfRarity;
  zoneId: string;
  description: string;
  emoji: string;
  xpReward: number;
  tameChance: number;
  requiredLevel: number;
}

export interface EfZoneDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockLevel: number;
  baseForageRate: number;
  creatureList: string[];
  herbList: string[];
}

export interface EfHerbDef {
  id: string;
  name: string;
  rarity: EfRarity;
  description: string;
  emoji: string;
  gatherXp: number;
  zoneId: string;
}

export interface EfSpellDef {
  id: string;
  name: string;
  rarity: EfRarity;
  description: string;
  emoji: string;
  manaCost: number;
  cooldown: number;
  xpReward: number;
  requiredLevel: number;
  effect: string;
}

export interface EfArtifactDef {
  id: string;
  name: string;
  rarity: EfRarity;
  description: string;
  emoji: string;
  maxDurability: number;
  bonusType: string;
  bonusValue: number;
  requiredLevel: number;
}

export interface EfSpiritDef {
  id: string;
  name: string;
  element: string;
  description: string;
  emoji: string;
  blessingType: string;
  blessingPower: number;
  giftPreference: string;
}

export interface EfPotionRecipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  ingredients: { herbId: string; amount: number }[];
  quality: EfPotionQuality;
  effect: string;
  effectValue: number;
  xpReward: number;
  requiredLevel: number;
}

export interface EfTreeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  growthTime: number;
  maxHealth: number;
  bonusType: string;
  bonusValue: number;
  requiredLevel: number;
}

export interface EfEventDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  duration: number;
  rewardCoins: number;
  rewardXp: number;
  targetProgress: number;
}

export interface EfAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXp: number;
  emoji: string;
}

export interface EfTitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface EfRarityInfo {
  key: EfRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface EfColorTheme {
  forestGreen: string;
  emerald: string;
  goldenAmber: string;
  moonlightSilver: string;
  moss: string;
  twilightPurple: string;
}

export interface EfCreatureState {
  owned: boolean;
  count: number;
  tamed: boolean;
  ridden: boolean;
  lastSeen: number | null;
}

export interface EfZoneState {
  explored: boolean;
  level: number;
  foragedCount: number;
  defendedCount: number;
  creaturesFound: number;
  unlockedAt: number | null;
}

export interface EfSpellState {
  learned: boolean;
  castCount: number;
  cooldownEnd: number;
}

export interface EfArtifactState {
  owned: boolean;
  equipped: boolean;
  durability: number;
  foundAt: number | null;
}

export interface EfSpiritState {
  befriended: boolean;
  friendship: number;
  giftsGiven: number;
  lastGiftAt: number | null;
}

export interface EfPlantedTree {
  id: string;
  species: string;
  plantedAt: number;
  growth: number;
  health: number;
  watered: boolean;
  lastWateredAt: number | null;
}

export interface EfAchievementState {
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface EfDailyPatrolState {
  lastDate: string | null;
  streak: number;
  completed: boolean;
  questType: EfPatrolQuestType | null;
  questProgress: number;
  questTarget: number;
  rewardClaimed: boolean;
}

export interface EfEventState {
  id: string | null;
  progress: number;
  startTime: number | null;
  endTime: number | null;
  rewardClaimed: boolean;
}

export interface EfTotals {
  totalForaged: number;
  totalCreaturesFound: number;
  totalPotionsBrewed: number;
  totalTreesPlanted: number;
  totalDefended: number;
  totalSpellCasts: number;
  totalSpiritsBefriended: number;
  totalRides: number;
  totalArtifactFinds: number;
}

export interface EnchantedForestState {
  level: number;
  xp: number;
  coins: number;
  title: string;
  creatures: Record<string, EfCreatureState>;
  zones: Record<string, EfZoneState>;
  herbs: Record<string, number>;
  potions: Record<string, number>;
  spells: Record<string, EfSpellState>;
  artifacts: Record<string, EfArtifactState>;
  spirits: Record<string, EfSpiritState>;
  plantedTrees: EfPlantedTree[];
  achievements: Record<string, EfAchievementState>;
  dailyPatrol: EfDailyPatrolState;
  activeEvent: EfEventState;
  totals: EfTotals;
  seed: number;
}

// ============================================================
// Seeded PRNG
// ============================================================

function efMulberry32(seed: number): () => number {
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

export const EF_MAX_LEVEL = 50;

function efXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= EF_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function efClampLevel(lvl: number): number {
  return Math.max(1, Math.min(EF_MAX_LEVEL, lvl));
}

function efClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function efGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function efRarityMultiplier(r: EfRarity): number {
  const map: Record<EfRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
  };
  return map[r] ?? 1;
}

function efMakeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// ============================================================
// Constants
// ============================================================

export const EF_COLOR_THEME: EfColorTheme = {
  forestGreen: '#228B22',
  emerald: '#50C878',
  goldenAmber: '#DAA520',
  moonlightSilver: '#C0C0C0',
  moss: '#8B4513',
  twilightPurple: '#9370DB',
};

export const EF_RARITIES: EfRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
];

export const EF_TITLES: EfTitleInfo[] = [
  { name: 'Forest Visitor', levelRequired: 1, description: 'A newcomer stepping into the ancient woods for the first time' },
  { name: 'Path Finder', levelRequired: 5, description: 'You have learned to navigate the twisting forest trails' },
  { name: 'Grove Tender', levelRequired: 10, description: 'The groves respond to your gentle care and devotion' },
  { name: 'Creature Friend', levelRequired: 18, description: 'Magical creatures trust you enough to approach willingly' },
  { name: 'Herbalist', levelRequired: 25, description: 'Your knowledge of magical herbs is renowned throughout the forest' },
  { name: 'Grove Keeper', levelRequired: 33, description: 'Guardian of sacred groves — the forest flourishes under your watch' },
  { name: 'Druid Adept', levelRequired: 42, description: 'You wield ancient druidic magic with skill and reverence' },
  { name: 'Ancient Forest Guardian', levelRequired: 50, description: 'The forest itself has chosen you as its eternal protector' },
];

export const EF_ZONES: EfZoneDef[] = [
  {
    id: 'whispering_glade',
    name: 'Whispering Glade',
    description: 'A serene clearing where trees murmur forgotten secrets to those who listen',
    emoji: '🍃',
    unlockLevel: 1,
    baseForageRate: 0.7,
    creatureList: ['moss_sprite', 'thorn_rabbit', 'glow_worm', 'twig_beetle', 'fern_fox'],
    herbList: ['moonpetal', 'sweetfern', 'dewdrop_moss'],
  },
  {
    id: 'ancient_oak_circle',
    name: 'Ancient Oak Circle',
    description: 'Seven colossal oaks form a sacred ring of druidic power',
    emoji: '🌳',
    unlockLevel: 5,
    baseForageRate: 0.65,
    creatureList: ['bark_owl', 'root_badger', 'moss_sprite', 'crystal_toad', 'seed_squirrel'],
    herbList: ['sageleaf', 'brambleberry', 'mossflower'],
  },
  {
    id: 'mushroom_hollow',
    name: 'Mushroom Hollow',
    description: 'A misty valley of bioluminescent mushrooms and fairy circles',
    emoji: '🍄',
    unlockLevel: 10,
    baseForageRate: 0.75,
    creatureList: ['glow_worm', 'crystal_toad', 'moon_moth', 'twig_beetle', 'stone_beetle'],
    herbList: ['glowcap', 'thistle_bloom', 'shadowroot'],
  },
  {
    id: 'moonlit_stream',
    name: 'Moonlit Stream',
    description: 'A crystal-clear stream that glows under moonlight with ancient magic',
    emoji: '🌙',
    unlockLevel: 15,
    baseForageRate: 0.7,
    creatureList: ['moon_moth', 'river_nymph', 'fern_fox', 'wind_weasel', 'dew_ant'],
    herbList: ['river_mint', 'moonflower_vine', 'starfern'],
  },
  {
    id: 'fairy_ring',
    name: 'Fairy Ring',
    description: 'A perfect circle of toadstools where the veil between worlds is thinnest',
    emoji: '🧚',
    unlockLevel: 20,
    baseForageRate: 0.6,
    creatureList: ['moss_sprite', 'moon_moth', 'crystal_toad', 'owl_sage', 'fairy_dragon'],
    herbList: ['spirit_reed', 'crystal_seed', 'glowcap'],
  },
  {
    id: 'druids_sanctuary',
    name: "Druid's Sanctuary",
    description: 'The hidden heart of the forest where ancient druids once trained',
    emoji: '🏛️',
    unlockLevel: 30,
    baseForageRate: 0.55,
    creatureList: ['owl_sage', 'ancient_treant', 'spirit_bear', 'thorn_wolf', 'emerald_basilisk'],
    herbList: ['ancient_bark', 'phoenix_fern', 'void_petal'],
  },
  {
    id: 'dark_thicket',
    name: 'Dark Thicket',
    description: 'A shadowy maze of thorns and twisted branches hiding rare dangers',
    emoji: '🌑',
    unlockLevel: 35,
    baseForageRate: 0.5,
    creatureList: ['shadow_panther', 'thorn_wolf', 'vine_serpent', 'bramble_boar', 'frost_wyrm'],
    herbList: ['ember_root', 'shadowroot', 'dragonlily'],
  },
  {
    id: 'world_tree',
    name: 'World Tree',
    description: 'The legendary tree that connects all realms — source of all forest magic',
    emoji: '🌍',
    unlockLevel: 45,
    baseForageRate: 0.45,
    creatureList: ['forest_dragon', 'world_tree_guardian', 'moon_stag', 'elder_phoenix', 'night_mare', 'verdant_hydra'],
    herbList: ['world_tree_sap', 'starfall_blossom', 'eternity_root'],
  },
];

export const EF_CREATURES: EfCreatureDef[] = [
  // Common (8)
  { id: 'moss_sprite', name: 'Moss Sprite', rarity: 'common', zoneId: 'whispering_glade', description: 'A tiny being made of living moss that tends to forest floors', emoji: '🧚', xpReward: 10, tameChance: 0.5, requiredLevel: 1 },
  { id: 'thorn_rabbit', name: 'Thorn Rabbit', rarity: 'common', zoneId: 'whispering_glade', description: 'A rabbit with thorny fur that protects itself from predators', emoji: '🐰', xpReward: 10, tameChance: 0.55, requiredLevel: 1 },
  { id: 'glow_worm', name: 'Glow Worm', rarity: 'common', zoneId: 'mushroom_hollow', description: 'Bioluminescent worms that light the forest paths at night', emoji: '🪱', xpReward: 8, tameChance: 0.6, requiredLevel: 1 },
  { id: 'twig_beetle', name: 'Twig Beetle', rarity: 'common', zoneId: 'mushroom_hollow', description: 'A beetle disguised as a twig that carries messages between trees', emoji: '🪲', xpReward: 8, tameChance: 0.6, requiredLevel: 1 },
  { id: 'fern_fox', name: 'Fern Fox', rarity: 'common', zoneId: 'whispering_glade', description: 'A fox with leaves for fur that can blend into any foliage', emoji: '🦊', xpReward: 12, tameChance: 0.45, requiredLevel: 1 },
  { id: 'dew_ant', name: 'Dew Ant', rarity: 'common', zoneId: 'moonlit_stream', description: 'Hardworking ants that build elaborate underground crystal cities', emoji: '🐜', xpReward: 6, tameChance: 0.65, requiredLevel: 1 },
  { id: 'berry_robin', name: 'Berry Robin', rarity: 'common', zoneId: 'whispering_glade', description: 'A robin that sings enchanting melodies to ripen forest berries', emoji: '🐦', xpReward: 10, tameChance: 0.5, requiredLevel: 1 },
  { id: 'seed_squirrel', name: 'Seed Squirrel', rarity: 'common', zoneId: 'ancient_oak_circle', description: 'A squirrel that plants enchanted seeds wherever it buries them', emoji: '🐿️', xpReward: 10, tameChance: 0.55, requiredLevel: 1 },
  // Uncommon (8)
  { id: 'bramble_boar', name: 'Bramble Boar', rarity: 'uncommon', zoneId: 'dark_thicket', description: 'A fierce boar covered in magical brambles that regrow instantly', emoji: '🐗', xpReward: 25, tameChance: 0.35, requiredLevel: 5 },
  { id: 'moon_moth', name: 'Moon Moth', rarity: 'uncommon', zoneId: 'mushroom_hollow', description: 'A majestic moth whose wings hold the phases of the moon', emoji: '🦋', xpReward: 22, tameChance: 0.4, requiredLevel: 5 },
  { id: 'crystal_toad', name: 'Crystal Toad', rarity: 'uncommon', zoneId: 'mushroom_hollow', description: 'A translucent toad that predicts weather by changing color', emoji: '🐸', xpReward: 20, tameChance: 0.4, requiredLevel: 5 },
  { id: 'wind_weasel', name: 'Wind Weasel', rarity: 'uncommon', zoneId: 'moonlit_stream', description: 'A weasel that rides wind currents faster than any bird', emoji: '🦡', xpReward: 24, tameChance: 0.35, requiredLevel: 5 },
  { id: 'root_badger', name: 'Root Badger', rarity: 'uncommon', zoneId: 'ancient_oak_circle', description: 'A badger that digs through magical roots without harming them', emoji: '🦦', xpReward: 22, tameChance: 0.38, requiredLevel: 5 },
  { id: 'bark_owl', name: 'Bark Owl', rarity: 'uncommon', zoneId: 'ancient_oak_circle', description: 'An owl with bark-like plumage that speaks in riddles', emoji: '🦉', xpReward: 25, tameChance: 0.3, requiredLevel: 8 },
  { id: 'river_nymph', name: 'River Nymph', rarity: 'uncommon', zoneId: 'moonlit_stream', description: 'A water spirit in humanoid form who guards magical pools', emoji: '🧜', xpReward: 28, tameChance: 0.25, requiredLevel: 8 },
  { id: 'stone_beetle', name: 'Stone Beetle', rarity: 'uncommon', zoneId: 'mushroom_hollow', description: 'A beetle with a shell of living stone that grows harder with age', emoji: '🪨', xpReward: 20, tameChance: 0.4, requiredLevel: 5 },
  // Rare (7)
  { id: 'owl_sage', name: 'Owl Sage', rarity: 'rare', zoneId: 'fairy_ring', description: 'An ancient owl of immense wisdom that has watched over the forest for centuries', emoji: '🦉', xpReward: 50, tameChance: 0.2, requiredLevel: 12 },
  { id: 'thorn_wolf', name: 'Thorn Wolf', rarity: 'rare', zoneId: 'dark_thicket', description: 'A wolf with thorn-covered fur that commands packs of lesser creatures', emoji: '🐺', xpReward: 55, tameChance: 0.18, requiredLevel: 15 },
  { id: 'forest_phoenix', name: 'Forest Phoenix', rarity: 'rare', zoneId: 'fairy_ring', description: 'A phoenix that rises from burning leaves, radiating renewal energy', emoji: '🔥', xpReward: 60, tameChance: 0.15, requiredLevel: 18 },
  { id: 'starlight_stag', name: 'Starlight Stag', rarity: 'rare', zoneId: 'moonlit_stream', description: 'A stag whose antlers are made of solidified starlight', emoji: '🦌', xpReward: 55, tameChance: 0.18, requiredLevel: 15 },
  { id: 'vine_serpent', name: 'Vine Serpent', rarity: 'rare', zoneId: 'dark_thicket', description: 'A serpent made of living vines that can squeeze through any gap', emoji: '🐍', xpReward: 50, tameChance: 0.2, requiredLevel: 15 },
  { id: 'shadow_panther', name: 'Shadow Panther', rarity: 'rare', zoneId: 'dark_thicket', description: 'A panther that moves between shadows, impossible to track', emoji: '🐈‍⬛', xpReward: 60, tameChance: 0.15, requiredLevel: 18 },
  { id: 'crystal_deer', name: 'Crystal Deer', rarity: 'rare', zoneId: 'fairy_ring', description: 'A deer with crystalline antlers that refract light into rainbows', emoji: '✨', xpReward: 55, tameChance: 0.18, requiredLevel: 15 },
  // Epic (7)
  { id: 'moon_stag', name: 'Moon Stag', rarity: 'epic', zoneId: 'world_tree', description: 'The legendary stag that carries the moon across the night sky', emoji: '🌙', xpReward: 120, tameChance: 0.1, requiredLevel: 28 },
  { id: 'ancient_treant', name: 'Ancient Treant', rarity: 'epic', zoneId: 'druids_sanctuary', description: 'A sentient tree of immense age and power, keeper of forest secrets', emoji: '🌳', xpReward: 130, tameChance: 0.08, requiredLevel: 30 },
  { id: 'fairy_dragon', name: 'Fairy Dragon', rarity: 'epic', zoneId: 'fairy_ring', description: 'A tiny but powerful dragon that befriends fairies and guards the fairy ring', emoji: '🐉', xpReward: 110, tameChance: 0.1, requiredLevel: 25 },
  { id: 'storm_gryphon', name: 'Storm Gryphon', rarity: 'epic', zoneId: 'druids_sanctuary', description: 'A gryphon that summons thunderstorms to protect the forest canopy', emoji: '🦅', xpReward: 125, tameChance: 0.09, requiredLevel: 30 },
  { id: 'emerald_basilisk', name: 'Emerald Basilisk', rarity: 'epic', zoneId: 'druids_sanctuary', description: 'A basilisk with emerald scales whose gaze turns intruders to jade', emoji: '💚', xpReward: 120, tameChance: 0.08, requiredLevel: 30 },
  { id: 'spirit_bear', name: 'Spirit Bear', rarity: 'epic', zoneId: 'druids_sanctuary', description: 'A spectral bear that walks between the living world and the spirit realm', emoji: '🐻', xpReward: 130, tameChance: 0.08, requiredLevel: 30 },
  { id: 'frost_wyrm', name: 'Frost Wyrm', rarity: 'epic', zoneId: 'dark_thicket', description: 'A serpentine ice dragon that freezes threats in crystalline shells', emoji: '🧊', xpReward: 115, tameChance: 0.09, requiredLevel: 28 },
  // Legendary (5)
  { id: 'forest_dragon', name: 'Forest Dragon', rarity: 'legendary', zoneId: 'world_tree', description: 'The supreme dragon of the enchanted forest, master of all woodland magic', emoji: '🐲', xpReward: 300, tameChance: 0.03, requiredLevel: 45 },
  { id: 'world_tree_guardian', name: 'World Tree Guardian', rarity: 'legendary', zoneId: 'world_tree', description: 'An immortal being born from the World Tree to protect all realms', emoji: '🛡️', xpReward: 350, tameChance: 0.02, requiredLevel: 48 },
  { id: 'elder_phoenix', name: 'Elder Phoenix', rarity: 'legendary', zoneId: 'world_tree', description: 'The original phoenix whose flames created the first enchanted forest', emoji: '🔥', xpReward: 320, tameChance: 0.03, requiredLevel: 45 },
  { id: 'night_mare', name: 'Night Mare', rarity: 'legendary', zoneId: 'world_tree', description: 'A spectral horse that gallops through dreams, guarding sleepers from nightmares', emoji: '🐎', xpReward: 280, tameChance: 0.04, requiredLevel: 45 },
  { id: 'verdant_hydra', name: 'Verdant Hydra', rarity: 'legendary', zoneId: 'world_tree', description: 'A many-headed plant dragon that regrows two heads for every one severed', emoji: '🌿', xpReward: 340, tameChance: 0.02, requiredLevel: 50 },
];

export const EF_HERBS: EfHerbDef[] = [
  // Common (7)
  { id: 'moonpetal', name: 'Moonpetal', rarity: 'common', description: 'A luminous petal that glows softly under moonlight, used in basic healing', emoji: '🌸', gatherXp: 8, zoneId: 'whispering_glade' },
  { id: 'sweetfern', name: 'Sweetfern', rarity: 'common', description: 'Fragrant fern leaves that calm the mind and soothe minor wounds', emoji: '🌿', gatherXp: 7, zoneId: 'whispering_glade' },
  { id: 'dewdrop_moss', name: 'Dewdrop Moss', rarity: 'common', description: 'Soft moss that perpetually produces healing dew drops', emoji: '💧', gatherXp: 6, zoneId: 'whispering_glade' },
  { id: 'brambleberry', name: 'Brambleberry', rarity: 'common', description: 'Sweet dark berries packed with restorative nutrients', emoji: '🫐', gatherXp: 8, zoneId: 'ancient_oak_circle' },
  { id: 'honeygrass', name: 'Honeygrass', rarity: 'common', description: 'Golden grass blades that secrete a natural healing honey', emoji: '🌾', gatherXp: 7, zoneId: 'whispering_glade' },
  { id: 'thistle_bloom', name: 'Thistle Bloom', rarity: 'common', description: 'Prickly flowers whose thorns carry a potent numbing agent', emoji: '💜', gatherXp: 7, zoneId: 'mushroom_hollow' },
  { id: 'sageleaf', name: 'Sage Leaf', rarity: 'common', description: 'Ancient sage leaves used by druids for wisdom-enhancing teas', emoji: '🍃', gatherXp: 8, zoneId: 'ancient_oak_circle' },
  // Uncommon (7)
  { id: 'starfern', name: 'Starfern', rarity: 'uncommon', description: 'Fern fronds dusted with tiny sparkles that boost magical energy', emoji: '⭐', gatherXp: 15, zoneId: 'moonlit_stream' },
  { id: 'shadowroot', name: 'Shadowroot', rarity: 'uncommon', description: 'Dark roots that grow in complete darkness with shadow-absorbing properties', emoji: '🌑', gatherXp: 16, zoneId: 'mushroom_hollow' },
  { id: 'glowcap', name: 'Glowcap Mushroom', rarity: 'uncommon', description: 'Bioluminescent mushrooms that provide light and magical sustenance', emoji: '🍄', gatherXp: 14, zoneId: 'mushroom_hollow' },
  { id: 'river_mint', name: 'River Mint', rarity: 'uncommon', description: 'Cool mint that grows only in magical streams, refreshing and purifying', emoji: '🌿', gatherXp: 15, zoneId: 'moonlit_stream' },
  { id: 'sunleaf', name: 'Sunleaf', rarity: 'uncommon', description: 'Leaves that store sunlight and release it as warmth and energy', emoji: '☀️', gatherXp: 16, zoneId: 'moonlit_stream' },
  { id: 'thornblossom', name: 'Thornblossom', rarity: 'uncommon', description: 'Beautiful but dangerous flowers whose nectar is a powerful catalyst', emoji: '🌹', gatherXp: 15, zoneId: 'ancient_oak_circle' },
  { id: 'mossflower', name: 'Mossflower', rarity: 'uncommon', description: 'Tiny flowers that grow on moss and attract friendly forest creatures', emoji: '🌺', gatherXp: 14, zoneId: 'ancient_oak_circle' },
  // Rare (5)
  { id: 'dragonlily', name: 'Dragonlily', rarity: 'rare', description: 'A fierce flower with dragon-scale petals that radiate heat', emoji: '🐉', gatherXp: 30, zoneId: 'dark_thicket' },
  { id: 'moonflower_vine', name: 'Moonflower Vine', rarity: 'rare', description: 'A climbing vine that produces flowers only during full moons', emoji: '🌙', gatherXp: 32, zoneId: 'moonlit_stream' },
  { id: 'crystal_seed', name: 'Crystal Seed', rarity: 'rare', description: 'Seeds made of pure crystal that contain compressed magical energy', emoji: '💎', gatherXp: 35, zoneId: 'fairy_ring' },
  { id: 'spirit_reed', name: 'Spirit Reed', rarity: 'rare', description: 'Hollow reeds through which the voices of spirits can be heard', emoji: '🎋', gatherXp: 30, zoneId: 'fairy_ring' },
  { id: 'ember_root', name: 'Ember Root', rarity: 'rare', description: 'Fiery roots that smolder endlessly, used in powerful fire potions', emoji: '🔥', gatherXp: 35, zoneId: 'dark_thicket' },
  // Epic (3)
  { id: 'ancient_bark', name: 'Ancient Bark', rarity: 'epic', description: 'Bark from the oldest trees, containing centuries of accumulated magic', emoji: '🪵', gatherXp: 70, zoneId: 'druids_sanctuary' },
  { id: 'phoenix_fern', name: 'Phoenix Feather Fern', rarity: 'epic', description: 'Ferns tipped with phoenix feathers that never burn and always regenerate', emoji: '🪶', gatherXp: 75, zoneId: 'druids_sanctuary' },
  { id: 'void_petal', name: 'Void Petal', rarity: 'epic', description: 'Petals from flowers that grow in the spaces between dimensions', emoji: '🕳️', gatherXp: 80, zoneId: 'druids_sanctuary' },
  // Legendary (3)
  { id: 'world_tree_sap', name: 'World Tree Sap', rarity: 'legendary', description: 'Liquid magic distilled from the World Tree itself, the most potent substance known', emoji: '🌍', gatherXp: 200, zoneId: 'world_tree' },
  { id: 'starfall_blossom', name: 'Starfall Blossom', rarity: 'legendary', description: 'Flowers that bloom only when stars fall, capturing their cosmic energy', emoji: '⭐', gatherXp: 220, zoneId: 'world_tree' },
  { id: 'eternity_root', name: 'Eternity Root', rarity: 'legendary', description: 'A root that exists outside of time, granting those who consume it temporal awareness', emoji: '♾️', gatherXp: 250, zoneId: 'world_tree' },
];

export const EF_SPELLS: EfSpellDef[] = [
  // Common (5)
  { id: 'entangle', name: 'Entangle', rarity: 'common', description: 'Summon grasping vines to immobilize a target', emoji: '🌿', manaCost: 10, cooldown: 5, xpReward: 15, requiredLevel: 1, effect: 'cc' },
  { id: 'growth_surge', name: 'Growth Surge', rarity: 'common', description: 'Accelerate the growth of plants in the surrounding area', emoji: '🌱', manaCost: 8, cooldown: 10, xpReward: 12, requiredLevel: 1, effect: 'growth' },
  { id: 'bark_armor', name: 'Bark Armor', rarity: 'common', description: 'Harden your skin like tree bark for temporary protection', emoji: '🛡️', manaCost: 12, cooldown: 15, xpReward: 15, requiredLevel: 1, effect: 'defense' },
  { id: 'spark_seed', name: 'Spark Seed', rarity: 'common', description: 'Launch explosive seeds that burst into light on impact', emoji: '✨', manaCost: 10, cooldown: 3, xpReward: 10, requiredLevel: 1, effect: 'damage' },
  { id: 'gentle_rain', name: 'Gentle Rain', rarity: 'common', description: 'Summon a nourishing rain that heals plants and creatures', emoji: '🌧️', manaCost: 8, cooldown: 20, xpReward: 12, requiredLevel: 1, effect: 'heal' },
  // Uncommon (5)
  { id: 'moonbeam', name: 'Moonbeam', rarity: 'uncommon', description: 'Channel concentrated moonlight into a powerful beam of energy', emoji: '🌙', manaCost: 20, cooldown: 8, xpReward: 25, requiredLevel: 8, effect: 'damage' },
  { id: 'forest_shield', name: 'Forest Shield', rarity: 'uncommon', description: 'Create a barrier of woven branches that deflects attacks', emoji: '🌲', manaCost: 25, cooldown: 30, xpReward: 30, requiredLevel: 8, effect: 'defense' },
  { id: 'vine_whip', name: 'Vine Whip', rarity: 'uncommon', description: 'Extend a razor-sharp vine to strike at range', emoji: '🐍', manaCost: 18, cooldown: 4, xpReward: 20, requiredLevel: 8, effect: 'damage' },
  { id: 'natures_gift', name: "Nature's Gift", rarity: 'uncommon', description: 'Bless a creature with enhanced abilities for a short time', emoji: '🎁', manaCost: 22, cooldown: 60, xpReward: 28, requiredLevel: 10, effect: 'buff' },
  { id: 'wind_caller', name: 'Wind Caller', rarity: 'uncommon', description: 'Command the winds to carry seeds, messages, or creatures', emoji: '💨', manaCost: 15, cooldown: 15, xpReward: 22, requiredLevel: 8, effect: 'utility' },
  // Rare (4)
  { id: 'thorn_storm', name: 'Thorn Storm', rarity: 'rare', description: 'Unleash a devastating whirlwind of enchanted thorns', emoji: '🌪️', manaCost: 40, cooldown: 20, xpReward: 50, requiredLevel: 18, effect: 'damage' },
  { id: 'life_drain', name: 'Life Drain', rarity: 'rare', description: 'Draw life energy from enemies to restore your own vitality', emoji: '💀', manaCost: 35, cooldown: 25, xpReward: 45, requiredLevel: 20, effect: 'heal' },
  { id: 'beast_call', name: 'Beast Call', rarity: 'rare', description: 'Send a magical call that summons friendly creatures to your aid', emoji: '🦁', manaCost: 30, cooldown: 45, xpReward: 40, requiredLevel: 18, effect: 'summon' },
  { id: 'root_network', name: 'Root Network', rarity: 'rare', description: 'Connect with all tree roots in the area for awareness and travel', emoji: '🕸️', manaCost: 25, cooldown: 30, xpReward: 35, requiredLevel: 18, effect: 'utility' },
  // Epic (3)
  { id: 'ancient_awakening', name: 'Ancient Awakening', rarity: 'epic', description: 'Awaken the dormant power of the ancient forest itself', emoji: '🌋', manaCost: 60, cooldown: 120, xpReward: 100, requiredLevel: 32, effect: 'ultimate' },
  { id: 'spirit_walk', name: 'Spirit Walk', rarity: 'epic', description: 'Phase into the spirit realm, becoming invisible and intangible', emoji: '👻', manaCost: 50, cooldown: 90, xpReward: 80, requiredLevel: 35, effect: 'utility' },
  { id: 'world_tree_blessing', name: "World Tree's Blessing", rarity: 'epic', description: 'Channel the World Tree to grant massive regeneration to all allies', emoji: '🌍', manaCost: 70, cooldown: 180, xpReward: 120, requiredLevel: 38, effect: 'heal' },
  // Legendary (3)
  { id: 'forests_wrath', name: "Forest's Wrath", rarity: 'legendary', description: 'Unleash the full fury of the enchanted forest upon your enemies', emoji: '⚔️', manaCost: 100, cooldown: 300, xpReward: 250, requiredLevel: 45, effect: 'ultimate' },
  { id: 'time_of_seasons', name: 'Time of Seasons', rarity: 'legendary', description: 'Accelerate or reverse time in a localized area, changing seasons at will', emoji: '⏳', manaCost: 80, cooldown: 240, xpReward: 200, requiredLevel: 45, effect: 'utility' },
  { id: 'natures_rebirth', name: "Nature's Rebirth", rarity: 'legendary', description: 'The ultimate druidic spell — resurrect fallen allies and restore devastated land', emoji: '🔄', manaCost: 120, cooldown: 600, xpReward: 300, requiredLevel: 50, effect: 'ultimate' },
];

export const EF_ARTIFACTS: EfArtifactDef[] = [
  { id: 'ancient_druid_staff', name: 'Ancient Druid Staff', rarity: 'rare', description: 'A gnarled staff of petrified wood that pulses with ancient druidic energy', emoji: '🪄', maxDurability: 100, bonusType: 'spell_power', bonusValue: 15, requiredLevel: 8 },
  { id: 'forest_crown', name: 'Forest Crown', rarity: 'epic', description: 'A living crown of woven branches and enchanted leaves', emoji: '👑', maxDurability: 150, bonusType: 'xp_boost', bonusValue: 20, requiredLevel: 20 },
  { id: 'druid_stone', name: 'Druid Stone', rarity: 'uncommon', description: 'A smooth stone etched with druidic runes that glows with earth magic', emoji: '🪨', maxDurability: 80, bonusType: 'forage_boost', bonusValue: 10, requiredLevel: 5 },
  { id: 'vine_armor', name: 'Vine Armor', rarity: 'rare', description: 'Living armor made of enchanted vines that hardens on impact', emoji: '🛡️', maxDurability: 120, bonusType: 'defense', bonusValue: 20, requiredLevel: 12 },
  { id: 'moon_pendant', name: 'Moon Pendant', rarity: 'uncommon', description: 'A silver pendant that captures moonlight for nocturnal exploration', emoji: '🌙', maxDurability: 90, bonusType: 'night_vision', bonusValue: 25, requiredLevel: 5 },
  { id: 'emerald_compass', name: 'Emerald Compass', rarity: 'rare', description: 'A compass that points toward magical treasures and hidden paths', emoji: '🧭', maxDurability: 100, bonusType: 'discovery', bonusValue: 15, requiredLevel: 10 },
  { id: 'shadow_cloak', name: 'Shadow Cloak', rarity: 'epic', description: 'A cloak woven from captured shadows that renders the wearer nearly invisible', emoji: '🧥', maxDurability: 130, bonusType: 'stealth', bonusValue: 30, requiredLevel: 25 },
  { id: 'root_shield', name: 'Root Shield', rarity: 'uncommon', description: 'A shield made from entangled ancient roots of immense strength', emoji: '🛡️', maxDurability: 100, bonusType: 'defense', bonusValue: 15, requiredLevel: 8 },
  { id: 'fairy_lantern', name: 'Fairy Lantern', rarity: 'rare', description: 'A lantern that houses a friendly fairy who guides the way through dark forests', emoji: '🏮', maxDurability: 110, bonusType: 'creature_attraction', bonusValue: 20, requiredLevel: 10 },
  { id: 'beast_horn', name: 'Beast Horn', rarity: 'epic', description: 'A horn carved from the antler of the legendary Moon Stag', emoji: '📯', maxDurability: 140, bonusType: 'tame_boost', bonusValue: 25, requiredLevel: 28 },
  { id: 'spirit_bowl', name: 'Spirit Bowl', rarity: 'rare', description: 'A stone bowl that allows communication with forest spirits', emoji: '🏺', maxDurability: 90, bonusType: 'spirit_friendship', bonusValue: 20, requiredLevel: 15 },
  { id: 'ancient_tome', name: 'Ancient Tome', rarity: 'epic', description: 'A crumbling book of druidic knowledge that teaches forgotten spells', emoji: '📖', maxDurability: 120, bonusType: 'spell_learning', bonusValue: 15, requiredLevel: 25 },
  { id: 'natures_ring', name: "Nature's Ring", rarity: 'legendary', description: 'A ring of living wood set with gems representing all forest elements', emoji: '💍', maxDurability: 200, bonusType: 'all_bonuses', bonusValue: 10, requiredLevel: 40 },
  { id: 'thorn_gauntlets', name: 'Thorn Gauntlets', rarity: 'rare', description: 'Gauntlets covered in magical thorns that enhance unarmed combat', emoji: '🧤', maxDurability: 110, bonusType: 'attack', bonusValue: 18, requiredLevel: 12 },
  { id: 'world_seed', name: 'World Seed', rarity: 'legendary', description: 'A seed from the World Tree containing the essence of creation itself', emoji: '🌱', maxDurability: 250, bonusType: 'growth_boost', bonusValue: 30, requiredLevel: 45 },
];

export const EF_SPIRITS: EfSpiritDef[] = [
  { id: 'spirit_verdantia', name: 'Verdantia', element: 'Spring', description: 'The spirit of rebirth — new growth springs wherever she walks', emoji: '🌱', blessingType: 'growth', blessingPower: 15, giftPreference: 'moonpetal' },
  { id: 'spirit_solstice', name: 'Solstice', element: 'Summer', description: 'The spirit of abundance — plants under her care produce bountiful harvests', emoji: '☀️', blessingType: 'yield', blessingPower: 20, giftPreference: 'sunleaf' },
  { id: 'spirit_equinox', name: 'Equinox', element: 'Autumn', description: 'The spirit of harvest — ensures all living things reach their full potential', emoji: '🍂', blessingType: 'quality', blessingPower: 18, giftPreference: 'brambleberry' },
  { id: 'spirit_frostfall', name: 'Frostfall', element: 'Winter', description: 'The spirit of rest — protects dormant life through the coldest seasons', emoji: '❄️', blessingType: 'defense', blessingPower: 16, giftPreference: 'sweetfern' },
  { id: 'spirit_auroriel', name: 'Auroriel', element: 'Dawn', description: 'The spirit of new beginnings — her light accelerates all forms of growth', emoji: '🌅', blessingType: 'growth', blessingPower: 14, giftPreference: 'starfern' },
  { id: 'spirit_twilighta', name: 'Twilighta', element: 'Dusk', description: 'The spirit of transitions — helps creatures adapt to new environments', emoji: '🌆', blessingType: 'adaptability', blessingPower: 16, giftPreference: 'shadowroot' },
  { id: 'spirit_pluviel', name: 'Pluviel', element: 'Rain', description: 'The spirit of waters — her gentle rains nourish every root and branch', emoji: '🌧️', blessingType: 'heal', blessingPower: 22, giftPreference: 'river_mint' },
  { id: 'spirit_zephyrius', name: 'Zephyrius', element: 'Wind', description: 'The spirit of the breeze — spreads pollen and carries messages on the wind', emoji: '💨', blessingType: 'speed', blessingPower: 18, giftPreference: 'glowcap' },
  { id: 'spirit_terramantus', name: 'Terramantus', element: 'Earth', description: 'The spirit of soil — enriches the ground with ancient minerals and magic', emoji: '🌍', blessingType: 'durability', blessingPower: 25, giftPreference: 'ancient_bark' },
  { id: 'spirit_stellaria', name: 'Stellaria', element: 'Stars', description: 'The spirit of the cosmos — aligns starlight to feed celestial plants', emoji: '⭐', blessingType: 'wisdom', blessingPower: 20, giftPreference: 'crystal_seed' },
  { id: 'spirit_ignara', name: 'Ignara', element: 'Fire', description: 'The spirit of flame — controls the cleansing fires of forest renewal', emoji: '🔥', blessingType: 'power', blessingPower: 22, giftPreference: 'ember_root' },
  { id: 'spirit_aquaria', name: 'Aquaria', element: 'Rivers', description: 'The spirit of flowing water — purifies streams and guides lost travelers', emoji: '🌊', blessingType: 'purification', blessingPower: 20, giftPreference: 'moonflower_vine' },
];

export const EF_POTION_RECIPES: EfPotionRecipe[] = [
  { id: 'healing_salve', name: 'Healing Salve', description: 'A soothing salve that restores health and vitality', emoji: '🧴', ingredients: [{ herbId: 'moonpetal', amount: 2 }, { herbId: 'dewdrop_moss', amount: 1 }], quality: 'minor', effect: 'heal', effectValue: 20, xpReward: 15, requiredLevel: 1 },
  { id: 'growth_tonic', name: 'Growth Tonic', description: 'Accelerates the growth of plants and trees', emoji: '🧪', ingredients: [{ herbId: 'sweetfern', amount: 2 }, { herbId: 'honeygrass', amount: 1 }], quality: 'minor', effect: 'growth', effectValue: 25, xpReward: 15, requiredLevel: 1 },
  { id: 'shadow_brew', name: 'Shadow Brew', description: 'Grants temporary shadow vision and stealth', emoji: '🌑', ingredients: [{ herbId: 'shadowroot', amount: 2 }, { herbId: 'thistle_bloom', amount: 1 }], quality: 'minor', effect: 'stealth', effectValue: 15, xpReward: 18, requiredLevel: 5 },
  { id: 'fire_potion', name: 'Fire Potion', description: 'Engulfs the drinker in protective magical flames', emoji: '🔥', ingredients: [{ herbId: 'ember_root', amount: 1 }, { herbId: 'thornblossom', amount: 2 }], quality: 'minor', effect: 'attack', effectValue: 20, xpReward: 20, requiredLevel: 5 },
  { id: 'cool_draught', name: 'Cool Draught', description: 'A refreshing drink that clears the mind and boosts focus', emoji: '🧊', ingredients: [{ herbId: 'river_mint', amount: 2 }, { herbId: 'glowcap', amount: 1 }], quality: 'minor', effect: 'focus', effectValue: 15, xpReward: 15, requiredLevel: 5 },
  { id: 'crystal_elixir', name: 'Crystal Elixir', description: 'Temporarily crystallizes the skin for incredible defense', emoji: '💎', ingredients: [{ herbId: 'crystal_seed', amount: 1 }, { herbId: 'glowcap', amount: 2 }], quality: 'standard', effect: 'defense', effectValue: 35, xpReward: 35, requiredLevel: 12 },
  { id: 'forest_balm', name: 'Forest Balm', description: 'A potent healing balm made from the forest finest herbs', emoji: '🌿', ingredients: [{ herbId: 'moonpetal', amount: 2 }, { herbId: 'sageleaf', amount: 1 }, { herbId: 'honeygrass', amount: 1 }], quality: 'standard', effect: 'heal', effectValue: 50, xpReward: 30, requiredLevel: 10 },
  { id: 'beast_charm', name: 'Beast Charm', description: 'Makes wild creatures friendlier and easier to approach', emoji: '🦊', ingredients: [{ herbId: 'mossflower', amount: 2 }, { herbId: 'honeygrass', amount: 2 }], quality: 'standard', effect: 'tame_boost', effectValue: 30, xpReward: 35, requiredLevel: 12 },
  { id: 'wind_tonic', name: 'Wind Tonic', description: 'Grants incredible speed and agility for a short time', emoji: '💨', ingredients: [{ herbId: 'starfern', amount: 2 }, { herbId: 'sunleaf', amount: 1 }], quality: 'standard', effect: 'speed', effectValue: 30, xpReward: 30, requiredLevel: 10 },
  { id: 'root_shield_elixir', name: 'Root Shield Elixir', description: 'Creates a living shield of roots around the drinker', emoji: '🛡️', ingredients: [{ herbId: 'shadowroot', amount: 1 }, { herbId: 'ancient_bark', amount: 1 }], quality: 'standard', effect: 'defense', effectValue: 40, xpReward: 40, requiredLevel: 15 },
  { id: 'dragon_strength', name: 'Dragon Strength', description: 'Channel the raw power of a dragon into your body', emoji: '🐉', ingredients: [{ herbId: 'dragonlily', amount: 2 }, { herbId: 'ember_root', amount: 1 }, { herbId: 'moonflower_vine', amount: 1 }], quality: 'superior', effect: 'attack', effectValue: 60, xpReward: 60, requiredLevel: 20 },
  { id: 'spirit_tea', name: 'Spirit Tea', description: 'Opens a channel of communication with the spirit world', emoji: '🍵', ingredients: [{ herbId: 'spirit_reed', amount: 2 }, { herbId: 'moonflower_vine', amount: 1 }], quality: 'superior', effect: 'spirit_boost', effectValue: 50, xpReward: 55, requiredLevel: 22 },
  { id: 'phoenix_elixir', name: 'Phoenix Elixir', description: 'Grants the ability to recover from near-fatal wounds', emoji: '🔥', ingredients: [{ herbId: 'phoenix_fern', amount: 2 }, { herbId: 'sunleaf', amount: 1 }], quality: 'superior', effect: 'revive', effectValue: 55, xpReward: 65, requiredLevel: 25 },
  { id: 'elixir_of_life', name: 'Elixir of Life', description: 'The greatest healing potion — restores all vitality completely', emoji: '💚', ingredients: [{ herbId: 'world_tree_sap', amount: 1 }, { herbId: 'eternity_root', amount: 1 }, { herbId: 'moonpetal', amount: 2 }], quality: 'masterwork', effect: 'full_heal', effectValue: 100, xpReward: 150, requiredLevel: 40 },
  { id: 'world_tree_nectar', name: 'World Tree Nectar', description: 'Ambrosia from the World Tree — grants temporary godlike power', emoji: '🌟', ingredients: [{ herbId: 'starfall_blossom', amount: 1 }, { herbId: 'void_petal', amount: 1 }, { herbId: 'crystal_seed', amount: 2 }], quality: 'masterwork', effect: 'ultimate_boost', effectValue: 100, xpReward: 200, requiredLevel: 45 },
];

export const EF_TREE_SPECIES: EfTreeDef[] = [
  { id: 'silver_birch', name: 'Silver Birch', description: 'A graceful birch with shimmering white bark', emoji: '🌳', growthTime: 300, maxHealth: 100, bonusType: 'forage', bonusValue: 5, requiredLevel: 1 },
  { id: 'ancient_oak', name: 'Ancient Oak', description: 'A mighty oak that anchors the forest ecosystem', emoji: '🌲', growthTime: 600, maxHealth: 200, bonusType: 'defense', bonusValue: 10, requiredLevel: 5 },
  { id: 'weeping_willow', name: 'Weeping Willow', description: 'A melancholy willow whose branches reach into the spirit world', emoji: '🌿', growthTime: 500, maxHealth: 150, bonusType: 'spirit', bonusValue: 8, requiredLevel: 8 },
  { id: 'pine_sentinel', name: 'Pine Sentinel', description: 'A towering pine that watches over the forest borders', emoji: '🎄', growthTime: 450, maxHealth: 180, bonusType: 'defense', bonusValue: 12, requiredLevel: 10 },
  { id: 'fire_maple', name: 'Fire Maple', description: 'A maple with leaves that blaze crimson and orange', emoji: '🍁', growthTime: 400, maxHealth: 160, bonusType: 'attack', bonusValue: 10, requiredLevel: 12 },
  { id: 'iron_ash', name: 'Iron Ash', description: 'An ash tree with wood harder than steel', emoji: '🪵', growthTime: 700, maxHealth: 250, bonusType: 'durability', bonusValue: 15, requiredLevel: 18 },
  { id: 'wise_elder', name: 'Wise Elder', description: 'An elder tree whose branches hold centuries of forest knowledge', emoji: '📚', growthTime: 800, maxHealth: 220, bonusType: 'wisdom', bonusValue: 12, requiredLevel: 22 },
  { id: 'ancient_yew', name: 'Ancient Yew', description: 'A mystical yew associated with death and rebirth', emoji: '♻️', growthTime: 550, maxHealth: 170, bonusType: 'revive', bonusValue: 10, requiredLevel: 15 },
  { id: 'blessed_holly', name: 'Blessed Holly', description: 'A holly tree that protects against dark magic', emoji: '🎄', growthTime: 350, maxHealth: 140, bonusType: 'magic_resist', bonusValue: 10, requiredLevel: 10 },
  { id: 'red_rowan', name: 'Red Rowan', description: 'A rowan tree bearing berries of protection and luck', emoji: '🍎', growthTime: 300, maxHealth: 130, bonusType: 'luck', bonusValue: 12, requiredLevel: 8 },
];

export const EF_EVENTS: EfEventDef[] = [
  { id: 'great_bloom', name: 'Great Bloom', description: 'The forest erupts in magical bloom — herb gathering yields are doubled', emoji: '🌸', duration: 3600, rewardCoins: 500, rewardXp: 300, targetProgress: 50 },
  { id: 'shadow_invasion', name: 'Shadow Invasion', description: 'Dark forces threaten the forest — defend the groves from shadow creatures', emoji: '🌑', duration: 3600, rewardCoins: 750, rewardXp: 500, targetProgress: 30 },
  { id: 'equinox_festival', name: 'Equinox Festival', description: 'A celebration of balance — all spirits are more friendly and generous', emoji: '⚖️', duration: 7200, rewardCoins: 400, rewardXp: 400, targetProgress: 20 },
  { id: 'ancient_awakening', name: 'Ancient Awakening', description: 'The oldest trees stir with renewed power — tree growth is accelerated', emoji: '🪨', duration: 5400, rewardCoins: 600, rewardXp: 600, targetProgress: 15 },
  { id: 'midsummer_night', name: 'Midsummer Night', description: 'Magic flows freely under the longest day — spell power is enhanced', emoji: '☀️', duration: 4800, rewardCoins: 350, rewardXp: 350, targetProgress: 40 },
];

export const EF_ACHIEVEMENTS: EfAchievementDef[] = [
  { id: 'ach_first_zone', name: 'First Steps', description: 'Explore your first forest zone', conditionKey: 'totalCreaturesFound', targetValue: 1, rewardCoins: 25, rewardXp: 15, emoji: '👣' },
  { id: 'ach_creature_finder_5', name: 'Creature Finder', description: 'Discover 5 different creatures', conditionKey: 'totalCreaturesFound', targetValue: 5, rewardCoins: 100, rewardXp: 50, emoji: '🔍' },
  { id: 'ach_creature_finder_15', name: 'Monster Scholar', description: 'Discover 15 different creatures', conditionKey: 'totalCreaturesFound', targetValue: 15, rewardCoins: 300, rewardXp: 150, emoji: '📖' },
  { id: 'ach_creature_finder_35', name: 'Bestiary Master', description: 'Discover all 35 forest creatures', conditionKey: 'totalCreaturesFound', targetValue: 35, rewardCoins: 1000, rewardXp: 500, emoji: '📚' },
  { id: 'ach_herbalist', name: 'Herbalist Apprentice', description: 'Gather 20 herbs in total', conditionKey: 'totalForaged', targetValue: 20, rewardCoins: 80, rewardXp: 40, emoji: '🌿' },
  { id: 'ach_master_herbalist', name: 'Master Herbalist', description: 'Gather 100 herbs in total', conditionKey: 'totalForaged', targetValue: 100, rewardCoins: 300, rewardXp: 150, emoji: '💐' },
  { id: 'ach_potion_brewer', name: 'Novice Alchemist', description: 'Brew 5 potions', conditionKey: 'totalPotionsBrewed', targetValue: 5, rewardCoins: 100, rewardXp: 50, emoji: '🧪' },
  { id: 'ach_master_brewer', name: 'Master Alchemist', description: 'Brew 20 potions', conditionKey: 'totalPotionsBrewed', targetValue: 20, rewardCoins: 400, rewardXp: 200, emoji: '⚗️' },
  { id: 'ach_spirit_friend', name: 'Spirit Friend', description: 'Befriend 3 forest spirits', conditionKey: 'totalSpiritsBefriended', targetValue: 3, rewardCoins: 150, rewardXp: 75, emoji: '👻' },
  { id: 'ach_spirit_council', name: 'Spirit Council', description: 'Befriend all 12 forest spirits', conditionKey: 'totalSpiritsBefriended', targetValue: 12, rewardCoins: 1000, rewardXp: 500, emoji: '🕊️' },
  { id: 'ach_zone_explorer', name: 'Zone Explorer', description: 'Explore all 8 forest zones', conditionKey: 'level', targetValue: 45, rewardCoins: 500, rewardXp: 250, emoji: '🗺️' },
  { id: 'ach_tree_planter', name: 'Tree Planter', description: 'Plant 10 trees in the forest', conditionKey: 'totalTreesPlanted', targetValue: 10, rewardCoins: 200, rewardXp: 100, emoji: '🌳' },
  { id: 'ach_forest_defender', name: 'Forest Defender', description: 'Defend the forest 5 times', conditionKey: 'totalDefended', targetValue: 5, rewardCoins: 200, rewardXp: 100, emoji: '🛡️' },
  { id: 'ach_spell_caster', name: 'Spell Caster', description: 'Cast 25 spells total', conditionKey: 'totalSpellCasts', targetValue: 25, rewardCoins: 150, rewardXp: 75, emoji: '✨' },
  { id: 'ach_creature_tamer', name: 'Creature Tamer', description: 'Tame 3 wild creatures', conditionKey: 'totalCreaturesFound', targetValue: 15, rewardCoins: 250, rewardXp: 125, emoji: '🦊' },
  { id: 'ach_dragon_rider', name: 'Dragon Rider', description: 'Ride a legendary creature', conditionKey: 'totalRides', targetValue: 1, rewardCoins: 500, rewardXp: 250, emoji: '🐉' },
  { id: 'ach_artifact_collector', name: 'Artifact Collector', description: 'Find and own 5 mystical artifacts', conditionKey: 'totalArtifactFinds', targetValue: 5, rewardCoins: 300, rewardXp: 150, emoji: '🏺' },
  { id: 'ach_ancient_guardian', name: 'Ancient Guardian', description: 'Reach the maximum level of 50', conditionKey: 'level', targetValue: 50, rewardCoins: 2000, rewardXp: 1000, emoji: '👑' },
  { id: 'ach_patrol_10', name: 'Dedicated Ranger', description: 'Complete 10 daily forest patrols', conditionKey: 'totalDefended', targetValue: 10, rewardCoins: 500, rewardXp: 250, emoji: '🏹' },
];

export const EF_PATROL_QUEST_TYPES: { type: EfPatrolQuestType; name: string; description: string; target: number; rewardCoins: number; rewardXp: number; emoji: string }[] = [
  { type: 'forage', name: 'Herb Gathering', description: 'Gather herbs from explored zones', target: 5, rewardCoins: 50, rewardXp: 30, emoji: '🌿' },
  { type: 'track', name: 'Creature Tracking', description: 'Track and discover creatures in the forest', target: 3, rewardCoins: 60, rewardXp: 35, emoji: '🐾' },
  { type: 'defend', name: 'Forest Defense', description: 'Defend the forest from shadow intruders', target: 3, rewardCoins: 70, rewardXp: 40, emoji: '🛡️' },
  { type: 'befriend', name: 'Spirit Visit', description: 'Visit and befriend forest spirits', target: 2, rewardCoins: 55, rewardXp: 30, emoji: '👻' },
  { type: 'brew', name: 'Potion Crafting', description: 'Brew potions from gathered herbs', target: 2, rewardCoins: 65, rewardXp: 35, emoji: '🧪' },
  { type: 'patrol', name: 'Zone Patrol', description: 'Visit and secure all explored zones', target: 4, rewardCoins: 75, rewardXp: 45, emoji: '🗺️' },
];

// ============================================================
// Initial State Factory
// ============================================================

function efCreateInitialState(seed?: number): EnchantedForestState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  const creatures: Record<string, EfCreatureState> = {};
  for (const c of EF_CREATURES) {
    creatures[c.id] = { owned: false, count: 0, tamed: false, ridden: false, lastSeen: null };
  }
  const zones: Record<string, EfZoneState> = {};
  for (const z of EF_ZONES) {
    zones[z.id] = {
      explored: z.unlockLevel <= 1,
      level: 1,
      foragedCount: 0,
      defendedCount: 0,
      creaturesFound: 0,
      unlockedAt: z.unlockLevel <= 1 ? Date.now() : null,
    };
  }
  const spells: Record<string, EfSpellState> = {};
  for (const s of EF_SPELLS) {
    spells[s.id] = { learned: s.requiredLevel <= 1, castCount: 0, cooldownEnd: 0 };
  }
  const artifacts: Record<string, EfArtifactState> = {};
  for (const a of EF_ARTIFACTS) {
    artifacts[a.id] = { owned: false, equipped: false, durability: 0, foundAt: null };
  }
  const spirits: Record<string, EfSpiritState> = {};
  for (const sp of EF_SPIRITS) {
    spirits[sp.id] = { befriended: false, friendship: 0, giftsGiven: 0, lastGiftAt: null };
  }
  const achievements: Record<string, EfAchievementState> = {};
  for (const ac of EF_ACHIEVEMENTS) {
    achievements[ac.id] = { unlocked: false, unlockedAt: null };
  }

  return {
    level: 1,
    xp: 0,
    coins: 100,
    title: 'Forest Visitor',
    creatures,
    zones,
    herbs: { moonpetal: 3, sweetfern: 2, dewdrop_moss: 2 },
    potions: {},
    spells,
    artifacts,
    spirits,
    plantedTrees: [],
    achievements,
    dailyPatrol: {
      lastDate: null,
      streak: 0,
      completed: false,
      questType: null,
      questProgress: 0,
      questTarget: 0,
      rewardClaimed: false,
    },
    activeEvent: {
      id: null,
      progress: 0,
      startTime: null,
      endTime: null,
      rewardClaimed: false,
    },
    totals: {
      totalForaged: 0,
      totalCreaturesFound: 0,
      totalPotionsBrewed: 0,
      totalTreesPlanted: 0,
      totalDefended: 0,
      totalSpellCasts: 0,
      totalSpiritsBefriended: 0,
      totalRides: 0,
      totalArtifactFinds: 0,
    },
    seed: effectiveSeed,
  };
}

// ============================================================
// Hook: useEnchantedForest
// ============================================================

export default function useEnchantedForest(initialSeed?: number) {
  const [state, setState] = useState<EnchantedForestState>(() => efCreateInitialState(initialSeed));
  const prngRef = useRef<() => number>(efMulberry32(state.seed));
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- Core State ----

  const efGetState = useCallback((): Readonly<EnchantedForestState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const efResetState = useCallback((newSeed?: number) => {
    const s = efCreateInitialState(newSeed);
    prngRef.current = efMulberry32(s.seed);
    setState(s);
  }, []);

  const efGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const efGetXp = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const efGetXPTillNext = useCallback((): number => {
    return efXpRequired(state.level);
  }, [state.level]);

  const efAddXp = useCallback((amount: number): EnchantedForestState => {
    let next = state;
    setState((prev) => {
      let lvl = prev.level;
      let xp = prev.xp + Math.floor(amount);
      while (lvl < EF_MAX_LEVEL && xp >= efXpRequired(lvl)) {
        xp -= efXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= EF_MAX_LEVEL) xp = 0;
      next = { ...prev, level: efClampLevel(lvl), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Coins ----

  const efGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const efAddCoins = useCallback((amount: number): EnchantedForestState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: efClampCoins(prev.coins + amount) };
      return next;
    });
    return next;
  }, [state]);

  const efSpendCoins = useCallback((amount: number): { success: boolean; state: EnchantedForestState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: efClampCoins(prev.coins - amount) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Title ----

  const efGetTitle = useCallback((): EfTitleInfo => {
    let current = EF_TITLES[0];
    for (const t of EF_TITLES) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const efGetAllTitles = useCallback((): EfTitleInfo[] => {
    return [...EF_TITLES];
  }, []);

  const efGetNextTitle = useCallback((): EfTitleInfo | null => {
    for (const t of EF_TITLES) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const efGetProgress = useCallback((): number => {
    const needed = efXpRequired(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const efGetOverallProgress = useCallback((): number => {
    return state.level / EF_MAX_LEVEL;
  }, [state.level]);

  // ---- Creatures ----

  const efGetCreatures = useCallback((): EfCreatureDef[] => {
    return [...EF_CREATURES];
  }, []);

  const efGetCreatureById = useCallback((id: string): EfCreatureDef | null => {
    return EF_CREATURES.find((c) => c.id === id) ?? null;
  }, []);

  const efGetOwnedCreatures = useCallback((): EfCreatureDef[] => {
    return EF_CREATURES.filter((c) => state.creatures[c.id]?.owned);
  }, [state.creatures]);

  const efGetCreatureByRarity = useCallback((rarity: EfRarity): EfCreatureDef[] => {
    return EF_CREATURES.filter((c) => c.rarity === rarity);
  }, []);

  const efDiscoverCreature = useCallback((creatureId: string): { success: boolean; state: EnchantedForestState } => {
    const def = EF_CREATURES.find((c) => c.id === creatureId);
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
        const zoneState = prev.zones[def.zoneId];
        if (zoneState) {
          next = {
            ...next,
            zones: {
              ...next.zones,
              [def.zoneId]: { ...zoneState, creaturesFound: zoneState.creaturesFound + 1 },
            },
          };
        }
      }
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efGetCreatureDiscoveryCount = useCallback((): number => {
    return Object.values(state.creatures).filter((c) => c.owned).length;
  }, [state.creatures]);

  const efIsCreatureOwned = useCallback((creatureId: string): boolean => {
    return state.creatures[creatureId]?.owned ?? false;
  }, [state.creatures]);

  const efGetCreatureCount = useCallback((creatureId: string): number => {
    return state.creatures[creatureId]?.count ?? 0;
  }, [state.creatures]);

  const efTameCreature = useCallback((creatureId: string): { success: boolean; state: EnchantedForestState } => {
    const def = EF_CREATURES.find((c) => c.id === creatureId);
    if (!def) return { success: false, state };
    const creatureState = state.creatures[creatureId];
    if (!creatureState || !creatureState.owned) return { success: false, state };
    if (creatureState.tamed) return { success: false, state };

    const rng = prngRef.current();
    const equippedBoost = Object.entries(state.artifacts)
      .filter(([, a]) => a.equipped && a.owned)
      .reduce((sum, [artId, a]) => {
        const artDef = EF_ARTIFACTS.find((d) => d.id === artId);
        return sum + (artDef?.bonusType === 'tame_boost' ? artDef.bonusValue : 0);
      }, 0);
    const chance = def.tameChance + equippedBoost * 0.01;

    if (rng > chance) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: { ...prev.creatures[creatureId], tamed: true },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efIsCreatureTamed = useCallback((creatureId: string): boolean => {
    return state.creatures[creatureId]?.tamed ?? false;
  }, [state.creatures]);

  const efRideCreature = useCallback((creatureId: string): { success: boolean; state: EnchantedForestState } => {
    const creatureState = state.creatures[creatureId];
    if (!creatureState || !creatureState.owned || !creatureState.tamed) return { success: false, state };
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

  const efGetTamedCreatures = useCallback((): EfCreatureDef[] => {
    return EF_CREATURES.filter((c) => state.creatures[c.id]?.tamed);
  }, [state.creatures]);

  const efGetRiddenCreatures = useCallback((): EfCreatureDef[] => {
    return EF_CREATURES.filter((c) => state.creatures[c.id]?.ridden);
  }, [state.creatures]);

  const efGetCreatureInfo = useCallback((creatureId: string): EfCreatureState | null => {
    return state.creatures[creatureId] ?? null;
  }, [state.creatures]);

  // ---- Zones ----

  const efGetZones = useCallback((): EfZoneDef[] => {
    return [...EF_ZONES];
  }, []);

  const efGetZoneById = useCallback((id: string): EfZoneDef | null => {
    return EF_ZONES.find((z) => z.id === id) ?? null;
  }, []);

  const efExploreZone = useCallback((zoneId: string): { success: boolean; state: EnchantedForestState } => {
    const def = EF_ZONES.find((z) => z.id === zoneId);
    if (!def) return { success: false, state };
    if (state.level < def.unlockLevel) return { success: false, state };
    if (state.zones[zoneId]?.explored) return { success: false, state };
    let next = state;
    setState((prev) => {
      const zoneState = prev.zones[zoneId];
      if (!zoneState) return prev;
      next = {
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zoneState, explored: true, unlockedAt: Date.now() },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efIsZoneExplored = useCallback((zoneId: string): boolean => {
    return state.zones[zoneId]?.explored ?? false;
  }, [state.zones]);

  const efGetZoneLevel = useCallback((zoneId: string): number => {
    return state.zones[zoneId]?.level ?? 1;
  }, [state.zones]);

  const efUpgradeZone = useCallback((zoneId: string): { success: boolean; cost: number; state: EnchantedForestState } => {
    const def = EF_ZONES.find((z) => z.id === zoneId);
    if (!def) return { success: false, cost: 0, state };
    const zoneState = state.zones[zoneId];
    if (!zoneState || !zoneState.explored) return { success: false, cost: 0, state };
    const cost = Math.floor(50 * Math.pow(1.5, zoneState.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const zs = prev.zones[zoneId];
      if (!zs) return prev;
      next = {
        ...prev,
        zones: { ...prev.zones, [zoneId]: { ...zs, level: zs.level + 1 } },
        coins: efClampCoins(prev.coins - cost),
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  const efGetExploredZones = useCallback((): EfZoneDef[] => {
    return EF_ZONES.filter((z) => state.zones[z.id]?.explored);
  }, [state.zones]);

  const efGetUnexploredZones = useCallback((): EfZoneDef[] => {
    return EF_ZONES.filter((z) => !state.zones[z.id]?.explored);
  }, [state.zones]);

  const efGetZoneForageCount = useCallback((zoneId: string): number => {
    return state.zones[zoneId]?.foragedCount ?? 0;
  }, [state.zones]);

  const efForageInZone = useCallback((zoneId: string): { success: boolean; herbs: { herbId: string; amount: number }[]; state: EnchantedForestState } => {
    const def = EF_ZONES.find((z) => z.id === zoneId);
    if (!def) return { success: false, herbs: [], state };
    const zoneState = state.zones[zoneId];
    if (!zoneState || !zoneState.explored) return { success: false, herbs: [], state };

    const zoneLevel = zoneState.level;
    const baseRate = def.baseForageRate + zoneLevel * 0.02;
    const eventBoost = state.activeEvent.id === 'great_bloom' ? 1.5 : 1;
    const rng = prngRef.current();

    const foundHerbs: { herbId: string; amount: number }[] = [];
    const newHerbs: Record<string, number> = { ...state.herbs };

    for (const herbId of def.herbList) {
      if (rng <= baseRate * eventBoost) {
        const amount = 1 + Math.floor(prngRef.current() * 2);
        newHerbs[herbId] = (newHerbs[herbId] ?? 0) + amount;
        foundHerbs.push({ herbId, amount });
      }
    }

    if (foundHerbs.length === 0) return { success: true, herbs: [], state };

    const totalXp = foundHerbs.reduce((sum, h) => {
      const herbDef = EF_HERBS.find((hd) => hd.id === h.herbId);
      return sum + ((herbDef?.gatherXp ?? 5) * h.amount);
    }, 0);

    let next = state;
    setState((prev) => {
      const zs = prev.zones[zoneId];
      next = {
        ...prev,
        herbs: newHerbs,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zs!, foragedCount: zs!.foragedCount + foundHerbs.length },
        },
        totals: { ...prev.totals, totalForaged: prev.totals.totalForaged + foundHerbs.length },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(totalXp);
      while (lvl < EF_MAX_LEVEL && xp >= efXpRequired(lvl)) {
        xp -= efXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= EF_MAX_LEVEL) xp = 0;
      next = { ...next, level: efClampLevel(lvl), xp };
      return next;
    });
    return { success: true, herbs: foundHerbs, state: next };
  }, [state]);

  const efGetZoneInfo = useCallback((zoneId: string): EfZoneState | null => {
    return state.zones[zoneId] ?? null;
  }, [state.zones]);

  // ---- Herbs ----

  const efGetHerbs = useCallback((): EfHerbDef[] => {
    return [...EF_HERBS];
  }, []);

  const efGetHerbById = useCallback((id: string): EfHerbDef | null => {
    return EF_HERBS.find((h) => h.id === id) ?? null;
  }, []);

  const efGetHerbCount = useCallback((herbId: string): number => {
    return state.herbs[herbId] ?? 0;
  }, [state.herbs]);

  const efGetAllHerbCounts = useCallback((): Record<string, number> => {
    return { ...state.herbs };
  }, [state.herbs]);

  const efGatherHerb = useCallback((herbId: string, amount: number = 1): { success: boolean; state: EnchantedForestState } => {
    const def = EF_HERBS.find((h) => h.id === herbId);
    if (!def) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newHerbs = { ...prev.herbs, [herbId]: (prev.herbs[herbId] ?? 0) + amount };
      const newXp = def.gatherXp * amount;
      next = {
        ...prev,
        herbs: newHerbs,
        totals: { ...prev.totals, totalForaged: prev.totals.totalForaged + amount },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(newXp);
      while (lvl < EF_MAX_LEVEL && xp >= efXpRequired(lvl)) {
        xp -= efXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= EF_MAX_LEVEL) xp = 0;
      next = { ...next, level: efClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efCanGatherHerb = useCallback((herbId: string): boolean => {
    const def = EF_HERBS.find((h) => h.id === herbId);
    if (!def) return false;
    return state.level >= (EF_ZONES.find((z) => z.id === def.zoneId)?.unlockLevel ?? 1);
  }, [state.level]);

  const efGetHerbsByRarity = useCallback((rarity: EfRarity): EfHerbDef[] => {
    return EF_HERBS.filter((h) => h.rarity === rarity);
  }, []);

  const efGetTotalHerbsGathered = useCallback((): number => {
    return Object.values(state.herbs).reduce((sum, count) => sum + count, 0);
  }, [state.herbs]);

  const efGetHerbInfo = useCallback((herbId: string): { count: number; def: EfHerbDef | null } => {
    return { count: state.herbs[herbId] ?? 0, def: EF_HERBS.find((h) => h.id === herbId) ?? null };
  }, [state.herbs]);

  // ---- Potions ----

  const efGetPotions = useCallback((): EfPotionRecipe[] => {
    return [...EF_POTION_RECIPES];
  }, []);

  const efGetPotionById = useCallback((id: string): EfPotionRecipe | null => {
    return EF_POTION_RECIPES.find((p) => p.id === id) ?? null;
  }, []);

  const efCanBrewPotion = useCallback((potionId: string): boolean => {
    const recipe = EF_POTION_RECIPES.find((p) => p.id === potionId);
    if (!recipe) return false;
    if (state.level < recipe.requiredLevel) return false;
    for (const ing of recipe.ingredients) {
      if ((state.herbs[ing.herbId] ?? 0) < ing.amount) return false;
    }
    return true;
  }, [state.herbs, state.level]);

  const efBrewPotion = useCallback((potionId: string): { success: boolean; state: EnchantedForestState } => {
    const recipe = EF_POTION_RECIPES.find((p) => p.id === potionId);
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
      const newPotions = { ...prev.potions, [potionId]: (prev.potions[potionId] ?? 0) + 1 };
      next = {
        ...prev,
        herbs: newHerbs,
        potions: newPotions,
        totals: { ...prev.totals, totalPotionsBrewed: prev.totals.totalPotionsBrewed + 1 },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(recipe.xpReward);
      while (lvl < EF_MAX_LEVEL && xp >= efXpRequired(lvl)) {
        xp -= efXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= EF_MAX_LEVEL) xp = 0;
      next = { ...next, level: efClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efUsePotion = useCallback((potionId: string): { success: boolean; state: EnchantedForestState } => {
    const count = state.potions[potionId] ?? 0;
    if (count < 1) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newPotions = { ...prev.potions, [potionId]: prev.potions[potionId] - 1 };
      if (newPotions[potionId] <= 0) delete newPotions[potionId];
      next = { ...prev, potions: newPotions };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efGetPotionCount = useCallback((potionId: string): number => {
    return state.potions[potionId] ?? 0;
  }, [state.potions]);

  const efGetAllPotionCounts = useCallback((): Record<string, number> => {
    return { ...state.potions };
  }, [state.potions]);

  const efGetBrewablePotions = useCallback((): EfPotionRecipe[] => {
    return EF_POTION_RECIPES.filter((recipe) => {
      if (stateRef.current.level < recipe.requiredLevel) return false;
      for (const ing of recipe.ingredients) {
        if ((stateRef.current.herbs[ing.herbId] ?? 0) < ing.amount) return false;
      }
      return true;
    });
  }, []);

  const efGetPotionRecipe = useCallback((potionId: string): EfPotionRecipe | null => {
    return EF_POTION_RECIPES.find((p) => p.id === potionId) ?? null;
  }, []);

  // ---- Spells ----

  const efGetSpells = useCallback((): EfSpellDef[] => {
    return [...EF_SPELLS];
  }, []);

  const efGetSpellById = useCallback((id: string): EfSpellDef | null => {
    return EF_SPELLS.find((s) => s.id === id) ?? null;
  }, []);

  const efLearnSpell = useCallback((spellId: string): { success: boolean; state: EnchantedForestState } => {
    const def = EF_SPELLS.find((s) => s.id === spellId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.spells[spellId]?.learned) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        spells: {
          ...prev.spells,
          [spellId]: { ...prev.spells[spellId], learned: true },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efCastSpell = useCallback((spellId: string, now: number = Date.now()): { success: boolean; state: EnchantedForestState } => {
    const def = EF_SPELLS.find((s) => s.id === spellId);
    if (!def) return { success: false, state };
    const spellState = state.spells[spellId];
    if (!spellState || !spellState.learned) return { success: false, state };
    if (now < spellState.cooldownEnd) return { success: false, state };
    let next = state;
    setState((prev) => {
      const ss = prev.spells[spellId];
      next = {
        ...prev,
        spells: {
          ...prev.spells,
          [spellId]: {
            ...ss!,
            castCount: ss!.castCount + 1,
            cooldownEnd: now + def.cooldown * 1000,
          },
        },
        totals: { ...prev.totals, totalSpellCasts: prev.totals.totalSpellCasts + 1 },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(def.xpReward);
      while (lvl < EF_MAX_LEVEL && xp >= efXpRequired(lvl)) {
        xp -= efXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= EF_MAX_LEVEL) xp = 0;
      next = { ...next, level: efClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efIsSpellLearned = useCallback((spellId: string): boolean => {
    return state.spells[spellId]?.learned ?? false;
  }, [state.spells]);

  const efGetLearnedSpells = useCallback((): EfSpellDef[] => {
    return EF_SPELLS.filter((s) => state.spells[s.id]?.learned);
  }, [state.spells]);

  const efGetSpellCooldown = useCallback((spellId: string, now: number = Date.now()): number => {
    const ss = state.spells[spellId];
    if (!ss) return 0;
    return Math.max(0, Math.ceil((ss.cooldownEnd - now) / 1000));
  }, [state.spells]);

  const efGetSpellCastCount = useCallback((spellId: string): number => {
    return state.spells[spellId]?.castCount ?? 0;
  }, [state.spells]);

  const efCanCastSpell = useCallback((spellId: string, now: number = Date.now()): boolean => {
    const def = EF_SPELLS.find((s) => s.id === spellId);
    if (!def) return false;
    const ss = state.spells[spellId];
    if (!ss || !ss.learned) return false;
    return now >= ss.cooldownEnd;
  }, [state.spells]);

  const efGetSpellsByRarity = useCallback((rarity: EfRarity): EfSpellDef[] => {
    return EF_SPELLS.filter((s) => s.rarity === rarity);
  }, []);

  // ---- Artifacts ----

  const efGetArtifacts = useCallback((): EfArtifactDef[] => {
    return [...EF_ARTIFACTS];
  }, []);

  const efGetArtifactById = useCallback((id: string): EfArtifactDef | null => {
    return EF_ARTIFACTS.find((a) => a.id === id) ?? null;
  }, []);

  const efFindArtifact = useCallback((artifactId: string): { success: boolean; state: EnchantedForestState } => {
    const def = EF_ARTIFACTS.find((a) => a.id === artifactId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.artifacts[artifactId]?.owned) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        artifacts: {
          ...prev.artifacts,
          [artifactId]: { owned: true, equipped: false, durability: def.maxDurability, foundAt: Date.now() },
        },
        totals: { ...prev.totals, totalArtifactFinds: prev.totals.totalArtifactFinds + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efEquipArtifact = useCallback((artifactId: string): { success: boolean; state: EnchantedForestState } => {
    const artState = state.artifacts[artifactId];
    if (!artState || !artState.owned) return { success: false, state };
    if (artState.equipped) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        artifacts: {
          ...prev.artifacts,
          [artifactId]: { ...prev.artifacts[artifactId], equipped: true },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efUnequipArtifact = useCallback((artifactId: string): { success: boolean; state: EnchantedForestState } => {
    const artState = state.artifacts[artifactId];
    if (!artState || !artState.equipped) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        artifacts: {
          ...prev.artifacts,
          [artifactId]: { ...prev.artifacts[artifactId], equipped: false },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efIsArtifactEquipped = useCallback((artifactId: string): boolean => {
    return state.artifacts[artifactId]?.equipped ?? false;
  }, [state.artifacts]);

  const efGetEquippedArtifacts = useCallback((): EfArtifactDef[] => {
    return EF_ARTIFACTS.filter((a) => state.artifacts[a.id]?.equipped);
  }, [state.artifacts]);

  const efGetOwnedArtifacts = useCallback((): EfArtifactDef[] => {
    return EF_ARTIFACTS.filter((a) => state.artifacts[a.id]?.owned);
  }, [state.artifacts]);

  const efGetArtifactDurability = useCallback((artifactId: string): number => {
    return state.artifacts[artifactId]?.durability ?? 0;
  }, [state.artifacts]);

  const efRepairArtifact = useCallback((artifactId: string): { success: boolean; cost: number; state: EnchantedForestState } => {
    const def = EF_ARTIFACTS.find((a) => a.id === artifactId);
    if (!def) return { success: false, cost: 0, state };
    const artState = state.artifacts[artifactId];
    if (!artState || !artState.owned) return { success: false, cost: 0, state };
    const missing = def.maxDurability - artState.durability;
    if (missing <= 0) return { success: false, cost: 0, state };
    const cost = Math.ceil(missing * 0.5);
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        artifacts: {
          ...prev.artifacts,
          [artifactId]: { ...prev.artifacts[artifactId], durability: def.maxDurability },
        },
        coins: efClampCoins(prev.coins - cost),
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  const efGetArtifactInfo = useCallback((artifactId: string): EfArtifactState | null => {
    return state.artifacts[artifactId] ?? null;
  }, [state.artifacts]);

  // ---- Spirits ----

  const efGetSpirits = useCallback((): EfSpiritDef[] => {
    return [...EF_SPIRITS];
  }, []);

  const efGetSpiritById = useCallback((id: string): EfSpiritDef | null => {
    return EF_SPIRITS.find((s) => s.id === id) ?? null;
  }, []);

  const efBefriendSpirit = useCallback((spiritId: string): { success: boolean; state: EnchantedForestState } => {
    const def = EF_SPIRITS.find((s) => s.id === spiritId);
    if (!def) return { success: false, state };
    const spiritState = state.spirits[spiritId];
    if (!spiritState) return { success: false, state };
    if (spiritState.befriended) return { success: false, state };
    let next = state;
    setState((prev) => {
      const ss = prev.spirits[spiritId];
      if (!ss) return prev;
      next = {
        ...prev,
        spirits: {
          ...prev.spirits,
          [spiritId]: { ...ss, befriended: true, friendship: 100 },
        },
        totals: { ...prev.totals, totalSpiritsBefriended: prev.totals.totalSpiritsBefriended + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efIsSpiritBefriended = useCallback((spiritId: string): boolean => {
    return state.spirits[spiritId]?.befriended ?? false;
  }, [state.spirits]);

  const efGetSpiritFriendship = useCallback((spiritId: string): number => {
    return state.spirits[spiritId]?.friendship ?? 0;
  }, [state.spirits]);

  const efGiftSpirit = useCallback((spiritId: string, herbId: string): { success: boolean; friendshipGain: number; state: EnchantedForestState } => {
    const def = EF_SPIRITS.find((s) => s.id === spiritId);
    if (!def) return { success: false, friendshipGain: 0, state };
    const spiritState = state.spirits[spiritId];
    if (!spiritState) return { success: false, friendshipGain: 0, state };
    if (state.herbs[herbId] === undefined || state.herbs[herbId] < 1) return { success: false, friendshipGain: 0, state };

    const isFavorite = def.giftPreference === herbId;
    const baseGain = isFavorite ? 15 : 5;
    const eventBoost = state.activeEvent.id === 'equinox_festival' ? 1.5 : 1;
    const friendshipGain = Math.floor(baseGain * eventBoost);
    const newFriendship = Math.min(100, spiritState.friendship + friendshipGain);

    let next = state;
    setState((prev) => {
      const newHerbs = { ...prev.herbs };
      newHerbs[herbId] -= 1;
      if (newHerbs[herbId] <= 0) delete newHerbs[herbId];
      const ss = prev.spirits[spiritId];
      next = {
        ...prev,
        herbs: newHerbs,
        spirits: {
          ...prev.spirits,
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

  const efGetBefriendedSpirits = useCallback((): EfSpiritDef[] => {
    return EF_SPIRITS.filter((s) => state.spirits[s.id]?.befriended);
  }, [state.spirits]);

  const efGetSpiritInfo = useCallback((spiritId: string): EfSpiritState | null => {
    return state.spirits[spiritId] ?? null;
  }, [state.spirits]);

  const efGetSpiritBlessing = useCallback((spiritId: string): { type: string; power: number } | null => {
    const spiritState = state.spirits[spiritId];
    if (!spiritState || !spiritState.befriended) return null;
    const def = EF_SPIRITS.find((s) => s.id === spiritId);
    if (!def) return null;
    return { type: def.blessingType, power: Math.floor(def.blessingPower * (spiritState.friendship / 100)) };
  }, [state.spirits]);

  const efGetAllSpiritFriendships = useCallback((): Record<string, number> => {
    const result: Record<string, number> = {};
    for (const s of EF_SPIRITS) {
      result[s.id] = state.spirits[s.id]?.friendship ?? 0;
    }
    return result;
  }, [state.spirits]);

  // ---- Trees ----

  const efGetTreeSpecies = useCallback((): EfTreeDef[] => {
    return [...EF_TREE_SPECIES];
  }, []);

  const efPlantTree = useCallback((species: string): { success: boolean; treeId: string; state: EnchantedForestState } => {
    const def = EF_TREE_SPECIES.find((t) => t.id === species);
    if (!def) return { success: false, treeId: '', state };
    if (state.level < def.requiredLevel) return { success: false, treeId: '', state };
    const cost = Math.floor(20 * (1 + EF_TREE_SPECIES.indexOf(def) * 0.5));
    if (state.coins < cost) return { success: false, treeId: '', state };
    const treeId = efMakeId('tree');
    const newTree: EfPlantedTree = {
      id: treeId,
      species,
      plantedAt: Date.now(),
      growth: 0,
      health: def.maxHealth,
      watered: false,
      lastWateredAt: null,
    };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        plantedTrees: [...prev.plantedTrees, newTree],
        coins: efClampCoins(prev.coins - cost),
        totals: { ...prev.totals, totalTreesPlanted: prev.totals.totalTreesPlanted + 1 },
      };
      return next;
    });
    return { success: true, treeId, state: next };
  }, [state]);

  const efGetPlantedTrees = useCallback((): EfPlantedTree[] => {
    return [...state.plantedTrees];
  }, [state.plantedTrees]);

  const efGetTreeGrowth = useCallback((treeId: string): number => {
    const tree = state.plantedTrees.find((t) => t.id === treeId);
    if (!tree) return 0;
    const def = EF_TREE_SPECIES.find((s) => s.id === tree.species);
    if (!def) return 0;
    const elapsed = Date.now() - tree.plantedAt;
    const eventBoost = state.activeEvent.id === 'ancient_awakening' ? 1.5 : 1;
    return Math.min(100, (elapsed / (def.growthTime * 1000)) * 100 * eventBoost);
  }, [state.plantedTrees, state.activeEvent.id]);

  const efWaterTree = useCallback((treeId: string): { success: boolean; state: EnchantedForestState } => {
    const treeIdx = state.plantedTrees.findIndex((t) => t.id === treeId);
    if (treeIdx === -1) return { success: false, state };
    const tree = state.plantedTrees[treeIdx];
    if (tree.watered) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newTrees = [...prev.plantedTrees];
      newTrees[treeIdx] = {
        ...newTrees[treeIdx],
        watered: true,
        lastWateredAt: Date.now(),
        growth: Math.min(100, newTrees[treeIdx].growth + 10),
      };
      next = { ...prev, plantedTrees: newTrees };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efRemoveTree = useCallback((treeId: string): { success: boolean; state: EnchantedForestState } => {
    const treeIdx = state.plantedTrees.findIndex((t) => t.id === treeId);
    if (treeIdx === -1) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, plantedTrees: prev.plantedTrees.filter((t) => t.id !== treeId) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efGetForestHealth = useCallback((): number => {
    if (state.plantedTrees.length === 0) return 0;
    const totalHealth = state.plantedTrees.reduce((sum, t) => sum + (t.health / (EF_TREE_SPECIES.find((s) => s.id === t.species)?.maxHealth ?? 100)) * 100, 0);
    return Math.round(totalHealth / state.plantedTrees.length);
  }, [state.plantedTrees]);

  const efGetTotalTreesPlanted = useCallback((): number => {
    return state.plantedTrees.length;
  }, [state.plantedTrees]);

  const efGetTreeById = useCallback((treeId: string): EfPlantedTree | null => {
    return state.plantedTrees.find((t) => t.id === treeId) ?? null;
  }, [state.plantedTrees]);

  // ---- Daily Patrol ----

  const efGetDailyPatrol = useCallback((): EfDailyPatrolState => {
    return { ...state.dailyPatrol };
  }, [state.dailyPatrol]);

  const efStartDailyPatrol = useCallback((): { success: boolean; state: EnchantedForestState } => {
    const today = efGenerateDayKey(Date.now());
    if (state.dailyPatrol.lastDate === today) return { success: false, state };
    const questIdx = Math.floor(prngRef.current() * EF_PATROL_QUEST_TYPES.length);
    const quest = EF_PATROL_QUEST_TYPES[questIdx];
    const newStreak = state.dailyPatrol.lastDate !== null
      ? (efGenerateDayKey(Date.now() - 86400000) === state.dailyPatrol.lastDate ? state.dailyPatrol.streak + 1 : 1)
      : 1;
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        dailyPatrol: {
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

  const efUpdatePatrolProgress = useCallback((amount: number = 1): { success: boolean; state: EnchantedForestState } => {
    const dp = state.dailyPatrol;
    if (!dp.questType) return { success: false, state };
    if (dp.completed) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newProgress = Math.min(prev.dailyPatrol.questTarget, prev.dailyPatrol.questProgress + amount);
      const completed = newProgress >= prev.dailyPatrol.questTarget;
      next = {
        ...prev,
        dailyPatrol: {
          ...prev.dailyPatrol,
          questProgress: newProgress,
          completed,
        },
      };
      if (completed) {
        const quest = EF_PATROL_QUEST_TYPES.find((q) => q.type === prev.dailyPatrol.questType);
        if (quest) {
          const streakBonus = Math.floor(quest.rewardCoins * (prev.dailyPatrol.streak * 0.1));
          next = {
            ...next,
            coins: efClampCoins(next.coins + quest.rewardCoins + streakBonus),
          };
          let lvl = next.level;
          let xp = next.xp + Math.floor(quest.rewardXp);
          while (lvl < EF_MAX_LEVEL && xp >= efXpRequired(lvl)) {
            xp -= efXpRequired(lvl);
            lvl += 1;
          }
          if (lvl >= EF_MAX_LEVEL) xp = 0;
          next = { ...next, level: efClampLevel(lvl), xp };
        }
      }
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efGetPatrolStreak = useCallback((): number => {
    return state.dailyPatrol.streak;
  }, [state.dailyPatrol]);

  const efGetPatrolQuest = useCallback((): { type: EfPatrolQuestType | null; name: string; description: string; target: number; progress: number; rewardCoins: number; rewardXp: number; emoji: string } | null => {
    const dp = state.dailyPatrol;
    if (!dp.questType) return null;
    const questDef = EF_PATROL_QUEST_TYPES.find((q) => q.type === dp.questType);
    if (!questDef) return null;
    return {
      type: dp.questType,
      name: questDef.name,
      description: questDef.description,
      target: dp.questTarget,
      progress: dp.questProgress,
      rewardCoins: questDef.rewardCoins + Math.floor(questDef.rewardCoins * (dp.streak * 0.1)),
      rewardXp: questDef.rewardXp,
      emoji: questDef.emoji,
    };
  }, [state.dailyPatrol]);

  const efIsPatrolComplete = useCallback((): boolean => {
    return state.dailyPatrol.completed;
  }, [state.dailyPatrol]);

  const efClaimPatrolReward = useCallback((): { success: boolean; state: EnchantedForestState } => {
    if (!state.dailyPatrol.completed || state.dailyPatrol.rewardClaimed) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        dailyPatrol: { ...prev.dailyPatrol, rewardClaimed: true },
        totals: { ...prev.totals, totalDefended: prev.totals.totalDefended + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Events ----

  const efGetAllEvents = useCallback((): EfEventDef[] => {
    return [...EF_EVENTS];
  }, []);

  const efGetEventById = useCallback((id: string): EfEventDef | null => {
    return EF_EVENTS.find((e) => e.id === id) ?? null;
  }, []);

  const efGetActiveEvent = useCallback((): { event: EfEventDef | null; progress: number; timeRemaining: number } => {
    if (!state.activeEvent.id) return { event: null, progress: 0, timeRemaining: 0 };
    const def = EF_EVENTS.find((e) => e.id === state.activeEvent.id);
    if (!def) return { event: null, progress: 0, timeRemaining: 0 };
    const remaining = state.activeEvent.endTime ? Math.max(0, state.activeEvent.endTime - Date.now()) : 0;
    return { event: def, progress: state.activeEvent.progress, timeRemaining: remaining };
  }, [state.activeEvent]);

  const efStartEvent = useCallback((eventId: string): { success: boolean; state: EnchantedForestState } => {
    const def = EF_EVENTS.find((e) => e.id === eventId);
    if (!def) return { success: false, state };
    if (state.activeEvent.id) return { success: false, state };
    const now = Date.now();
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        activeEvent: {
          id: eventId,
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

  const efUpdateEventProgress = useCallback((amount: number = 1): { success: boolean; state: EnchantedForestState } => {
    if (!state.activeEvent.id) return { success: false, state };
    let next = state;
    setState((prev) => {
      if (!prev.activeEvent.id) return prev;
      next = {
        ...prev,
        activeEvent: {
          ...prev.activeEvent,
          progress: prev.activeEvent.progress + amount,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const efIsEventActive = useCallback((): boolean => {
    if (!state.activeEvent.id || !state.activeEvent.endTime) return false;
    return Date.now() < state.activeEvent.endTime;
  }, [state.activeEvent]);

  const efGetEventReward = useCallback((): { success: boolean; coins: number; xp: number; state: EnchantedForestState } => {
    if (!state.activeEvent.id || state.activeEvent.rewardClaimed) return { success: false, coins: 0, xp: 0, state };
    const def = EF_EVENTS.find((e) => e.id === state.activeEvent.id);
    if (!def) return { success: false, coins: 0, xp: 0, state };
    if (state.activeEvent.progress < def.targetProgress) return { success: false, coins: 0, xp: 0, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        activeEvent: { ...prev.activeEvent, rewardClaimed: true },
        coins: efClampCoins(prev.coins + def.rewardCoins),
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(def.rewardXp);
      while (lvl < EF_MAX_LEVEL && xp >= efXpRequired(lvl)) {
        xp -= efXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= EF_MAX_LEVEL) xp = 0;
      next = { ...next, level: efClampLevel(lvl), xp };
      return next;
    });
    return { success: true, coins: def.rewardCoins, xp: def.rewardXp, state: next };
  }, [state]);

  const efEndEvent = useCallback((): { success: boolean; state: EnchantedForestState } => {
    if (!state.activeEvent.id) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        activeEvent: { id: null, progress: 0, startTime: null, endTime: null, rewardClaimed: false },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Achievements ----

  const efGetAchievements = useCallback((): EfAchievementDef[] => {
    return [...EF_ACHIEVEMENTS];
  }, []);

  const efGetAchievementById = useCallback((id: string): EfAchievementDef | null => {
    return EF_ACHIEVEMENTS.find((a) => a.id === id) ?? null;
  }, []);

  const efIsAchievementUnlocked = useCallback((id: string): boolean => {
    return state.achievements[id]?.unlocked ?? false;
  }, [state.achievements]);

  const efGetUnlockedAchievements = useCallback((): EfAchievementDef[] => {
    return EF_ACHIEVEMENTS.filter((a) => state.achievements[a.id]?.unlocked);
  }, [state.achievements]);

  const efGetLockedAchievements = useCallback((): EfAchievementDef[] => {
    return EF_ACHIEVEMENTS.filter((a) => !state.achievements[a.id]?.unlocked);
  }, [state.achievements]);

  const efCheckAchievements = useCallback((): { newlyUnlocked: EfAchievementDef[]; state: EnchantedForestState } => {
    const newlyUnlocked: EfAchievementDef[] = [];
    let next = state;
    setState((prev) => {
      const newAchievements = { ...prev.achievements };
      const totalsMap: Record<string, number> = {
        totalForaged: prev.totals.totalForaged,
        totalCreaturesFound: prev.totals.totalCreaturesFound,
        totalPotionsBrewed: prev.totals.totalPotionsBrewed,
        totalTreesPlanted: prev.totals.totalTreesPlanted,
        totalDefended: prev.totals.totalDefended,
        totalSpellCasts: prev.totals.totalSpellCasts,
        totalSpiritsBefriended: prev.totals.totalSpiritsBefriended,
        totalRides: prev.totals.totalRides,
        totalArtifactFinds: prev.totals.totalArtifactFinds,
        level: prev.level,
      };
      for (const ach of EF_ACHIEVEMENTS) {
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

  const efGetAchievementProgress = useCallback((id: string): { current: number; target: number; percentage: number } => {
    const def = EF_ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return { current: 0, target: 0, percentage: 0 };
    const totalsMap: Record<string, number> = {
      totalForaged: state.totals.totalForaged,
      totalCreaturesFound: state.totals.totalCreaturesFound,
      totalPotionsBrewed: state.totals.totalPotionsBrewed,
      totalTreesPlanted: state.totals.totalTreesPlanted,
      totalDefended: state.totals.totalDefended,
      totalSpellCasts: state.totals.totalSpellCasts,
      totalSpiritsBefriended: state.totals.totalSpiritsBefriended,
      totalRides: state.totals.totalRides,
      totalArtifactFinds: state.totals.totalArtifactFinds,
      level: state.level,
    };
    const current = Math.min(totalsMap[def.conditionKey] ?? 0, def.targetValue);
    return { current, target: def.targetValue, percentage: def.targetValue > 0 ? current / def.targetValue : 0 };
  }, [state]);

  const efGetAchievementCount = useCallback((): number => {
    return Object.values(state.achievements).filter((a) => a.unlocked).length;
  }, [state.achievements]);

  const efGetAchievementInfo = useCallback((id: string): EfAchievementState | null => {
    return state.achievements[id] ?? null;
  }, [state.achievements]);

  // ---- Defend Mechanic ----

  const efDefendForest = useCallback((now: number = Date.now()): { success: boolean; defended: boolean; state: EnchantedForestState } => {
    const rng = prngRef.current();
    const defendChance = 0.4 + state.level * 0.01;
    const defended = rng <= defendChance;
    let next = state;
    setState((prev) => {
      const xpGain = defended ? 30 : 10;
      const coinGain = defended ? 20 : 5;
      next = {
        ...prev,
        coins: efClampCoins(prev.coins + coinGain),
        totals: { ...prev.totals, totalDefended: prev.totals.totalDefended + 1 },
      };
      if (prev.activeEvent.id === 'shadow_invasion') {
        next = {
          ...next,
          activeEvent: { ...next.activeEvent, progress: next.activeEvent.progress + 1 },
        };
      }
      let lvl = next.level;
      let xp = next.xp + xpGain;
      while (lvl < EF_MAX_LEVEL && xp >= efXpRequired(lvl)) {
        xp -= efXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= EF_MAX_LEVEL) xp = 0;
      next = { ...next, level: efClampLevel(lvl), xp };
      return next;
    });
    return { success: true, defended, state: next };
  }, [state]);

  // ---- Stats / Computed ----

  const efGetTotalForaged = useCallback((): number => {
    return state.totals.totalForaged;
  }, [state.totals]);

  const efGetTotalCreaturesFound = useCallback((): number => {
    return state.totals.totalCreaturesFound;
  }, [state.totals]);

  const efGetTotalPotionsBrewed = useCallback((): number => {
    return state.totals.totalPotionsBrewed;
  }, [state.totals]);

  const efGetTotalDefended = useCallback((): number => {
    return state.totals.totalDefended;
  }, [state.totals]);

  const efGetTotalSpellCasts = useCallback((): number => {
    return state.totals.totalSpellCasts;
  }, [state.totals]);

  const efGetOverallStats = useCallback((): EfTotals => {
    return { ...state.totals };
  }, [state.totals]);

  // ---- Computed Values (useMemo) ----

  const currentTitle = useMemo((): EfTitleInfo => {
    let current = EF_TITLES[0];
    for (const t of EF_TITLES) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const xpProgress = useMemo((): number => {
    const needed = efXpRequired(state.level);
    if (needed === Infinity || needed <= 0) return 1;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const overallProgress = useMemo((): number => {
    return state.level / EF_MAX_LEVEL;
  }, [state.level]);

  const ownedCreatureCount = useMemo((): number => {
    return Object.values(state.creatures).filter((c) => c.owned).length;
  }, [state.creatures]);

  const exploredZoneCount = useMemo((): number => {
    return Object.values(state.zones).filter((z) => z.explored).length;
  }, [state.zones]);

  const totalHerbCount = useMemo((): number => {
    return Object.values(state.herbs).reduce((sum, count) => sum + count, 0);
  }, [state.herbs]);

  const totalPotionCount = useMemo((): number => {
    return Object.values(state.potions).reduce((sum, count) => sum + count, 0);
  }, [state.potions]);

  const befriendedSpiritCount = useMemo((): number => {
    return Object.values(state.spirits).filter((s) => s.befriended).length;
  }, [state.spirits]);

  const unlockedAchievementCount = useMemo((): number => {
    return Object.values(state.achievements).filter((a) => a.unlocked).length;
  }, [state.achievements]);

  const equippedArtifactCount = useMemo((): number => {
    return Object.values(state.artifacts).filter((a) => a.equipped).length;
  }, [state.artifacts]);

  const tamedCreatureCount = useMemo((): number => {
    return Object.values(state.creatures).filter((c) => c.tamed).length;
  }, [state.creatures]);

  const learnedSpellCount = useMemo((): number => {
    return Object.values(state.spells).filter((s) => s.learned).length;
  }, [state.spells]);

  const forestHealthScore = useMemo((): number => {
    if (state.plantedTrees.length === 0) return 0;
    const totalHealth = state.plantedTrees.reduce((sum, t) => {
      const def = EF_TREE_SPECIES.find((s) => s.id === t.species);
      const maxH = def?.maxHealth ?? 100;
      return sum + (t.health / maxH) * 100;
    }, 0);
    return Math.round(totalHealth / state.plantedTrees.length);
  }, [state.plantedTrees]);

  const totalBonusPower = useMemo((): Record<string, number> => {
    const bonuses: Record<string, number> = {};
    for (const [id, artState] of Object.entries(state.artifacts)) {
      if (artState.equipped && artState.owned) {
        const def = EF_ARTIFACTS.find((a) => a.id === id);
        if (def) {
          bonuses[def.bonusType] = (bonuses[def.bonusType] ?? 0) + def.bonusValue;
        }
      }
    }
    return bonuses;
  }, [state.artifacts]);

  // ---- Auto Achievement Check ----

  useEffect(() => {
    const checkAndNotify = () => {
      const s = stateRef.current;
      const totalsMap: Record<string, number> = {
        totalForaged: s.totals.totalForaged,
        totalCreaturesFound: s.totals.totalCreaturesFound,
        totalPotionsBrewed: s.totals.totalPotionsBrewed,
        totalTreesPlanted: s.totals.totalTreesPlanted,
        totalDefended: s.totals.totalDefended,
        totalSpellCasts: s.totals.totalSpellCasts,
        totalSpiritsBefriended: s.totals.totalSpiritsBefriended,
        totalRides: s.totals.totalRides,
        totalArtifactFinds: s.totals.totalArtifactFinds,
        level: s.level,
      };
      let changed = false;
      const newAchievements = { ...s.achievements };
      for (const ach of EF_ACHIEVEMENTS) {
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

  const efGetColorTheme = useCallback((): EfColorTheme => {
    return { ...EF_COLOR_THEME };
  }, []);

  // ---- Random Helpers ----

  const efRandomInt = useCallback((min: number, max: number): number => {
    return min + Math.floor(prngRef.current() * (max - min + 1));
  }, []);

  const efGetSeed = useCallback((): number => {
    return state.seed;
  }, [state.seed]);

  const efSetSeed = useCallback((seed: number): void => {
    prngRef.current = efMulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  // ---- Compat alias for persist middleware (placeholder) ----

  const efPersistConfig = useMemo(() => ({
    name: 'enchanted-forest-storage',
    version: 1,
  }), []);

  // ============================================================
  // Return Object
  // ============================================================

  return {
    // State
    efGetState,
    efResetState,

    // Level / XP
    efGetLevel,
    efGetXp,
    efGetXPTillNext,
    efAddXp,

    // Coins
    efGetCoins,
    efAddCoins,
    efSpendCoins,
    efCanAfford,

    // Title
    efGetTitle,
    efGetAllTitles,
    efGetNextTitle,

    // Progress
    efGetProgress,
    efGetOverallProgress,

    // Creatures
    efGetCreatures,
    efGetCreatureById,
    efGetOwnedCreatures,
    efGetCreatureByRarity,
    efDiscoverCreature,
    efGetCreatureDiscoveryCount,
    efIsCreatureOwned,
    efGetCreatureCount,
    efTameCreature,
    efIsCreatureTamed,
    efRideCreature,
    efGetTamedCreatures,
    efGetRiddenCreatures,
    efGetCreatureInfo,

    // Zones
    efGetZones,
    efGetZoneById,
    efExploreZone,
    efIsZoneExplored,
    efGetZoneLevel,
    efUpgradeZone,
    efGetExploredZones,
    efGetUnexploredZones,
    efGetZoneForageCount,
    efForageInZone,
    efGetZoneInfo,

    // Herbs
    efGetHerbs,
    efGetHerbById,
    efGetHerbCount,
    efGetAllHerbCounts,
    efGatherHerb,
    efCanGatherHerb,
    efGetHerbsByRarity,
    efGetTotalHerbsGathered,
    efGetHerbInfo,

    // Potions
    efGetPotions,
    efGetPotionById,
    efCanBrewPotion,
    efBrewPotion,
    efUsePotion,
    efGetPotionCount,
    efGetAllPotionCounts,
    efGetBrewablePotions,
    efGetPotionRecipe,

    // Spells
    efGetSpells,
    efGetSpellById,
    efLearnSpell,
    efCastSpell,
    efIsSpellLearned,
    efGetLearnedSpells,
    efGetSpellCooldown,
    efGetSpellCastCount,
    efCanCastSpell,
    efGetSpellsByRarity,

    // Artifacts
    efGetArtifacts,
    efGetArtifactById,
    efFindArtifact,
    efEquipArtifact,
    efUnequipArtifact,
    efIsArtifactEquipped,
    efGetEquippedArtifacts,
    efGetOwnedArtifacts,
    efGetArtifactDurability,
    efRepairArtifact,
    efGetArtifactInfo,

    // Spirits
    efGetSpirits,
    efGetSpiritById,
    efBefriendSpirit,
    efIsSpiritBefriended,
    efGetSpiritFriendship,
    efGiftSpirit,
    efGetBefriendedSpirits,
    efGetSpiritInfo,
    efGetSpiritBlessing,
    efGetAllSpiritFriendships,

    // Trees
    efGetTreeSpecies,
    efPlantTree,
    efGetPlantedTrees,
    efGetTreeGrowth,
    efWaterTree,
    efRemoveTree,
    efGetForestHealth,
    efGetTotalTreesPlanted,
    efGetTreeById,

    // Daily Patrol
    efGetDailyPatrol,
    efStartDailyPatrol,
    efUpdatePatrolProgress,
    efGetPatrolStreak,
    efGetPatrolQuest,
    efIsPatrolComplete,
    efClaimPatrolReward,

    // Events
    efGetAllEvents,
    efGetEventById,
    efGetActiveEvent,
    efStartEvent,
    efUpdateEventProgress,
    efIsEventActive,
    efGetEventReward,
    efEndEvent,

    // Achievements
    efGetAchievements,
    efGetAchievementById,
    efIsAchievementUnlocked,
    efGetUnlockedAchievements,
    efGetLockedAchievements,
    efCheckAchievements,
    efGetAchievementProgress,
    efGetAchievementCount,
    efGetAchievementInfo,

    // Defense
    efDefendForest,

    // Stats
    efGetTotalForaged,
    efGetTotalCreaturesFound,
    efGetTotalPotionsBrewed,
    efGetTotalDefended,
    efGetTotalSpellCasts,
    efGetOverallStats,

    // Helpers
    efGetColorTheme,
    efRandomInt,
    efGetSeed,
    efSetSeed,

    // Persist config
    efPersistConfig,

    // Computed values
    currentTitle,
    xpProgress,
    overallProgress,
    ownedCreatureCount,
    exploredZoneCount,
    totalHerbCount,
    totalPotionCount,
    befriendedSpiritCount,
    unlockedAchievementCount,
    equippedArtifactCount,
    tamedCreatureCount,
    learnedSpellCount,
    forestHealthScore,
    totalBonusPower,
  };
}
