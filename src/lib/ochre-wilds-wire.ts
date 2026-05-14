import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Ochre Wilds — 赭色荒野 Earth-Toned Beast Taming Wire
// ============================================================

// ============================================================
// Types
// ============================================================

export type OcRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type OcSpeciesKey = 'dust_lion' | 'sand_viper' | 'ochre_bear' | 'canyon_eagle' | 'red_fox' | 'earth_golem' | 'wild_steed';

export type OcTerritoryId = 'ochre_plains' | 'dust_canyon' | 'amber_basin' | 'sunstone_ridge' | 'clay_mesa' | 'sage_hollow' | 'obsidian_gorge' | 'ancient_burrow';

export type OcAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

export interface OcSpeciesDef {
  key: OcSpeciesKey;
  name: string;
  description: string;
  emoji: string;
  basePower: number;
}

export interface OcBeastDef {
  id: string;
  name: string;
  species: OcSpeciesKey;
  rarity: OcRarity;
  description: string;
  emoji: string;
  power: number;
  cost: number;
  xpReward: number;
  requiredLevel: number;
}

export interface OcTerritoryDef {
  id: OcTerritoryId;
  name: string;
  description: string;
  emoji: string;
  level: number;
  resources: string[];
  capacity: number;
  unlockLevel: number;
}

export interface OcMaterialDef {
  id: string;
  name: string;
  rarity: OcRarity;
  description: string;
  emoji: string;
  gatherXp: number;
  stackSize: number;
  coinValue: number;
  territoryId: string;
}

export interface OcStructureDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  requiredLevel: number;
  buildCost: { coins: number; materials: Record<string, number> };
  upgradeCost: { coins: number; materials: Record<string, number> };
  bonusType: string;
  bonusValue: number;
}

export interface OcAbilityDef {
  id: string;
  name: string;
  category: OcAbilityCategory;
  description: string;
  emoji: string;
  cooldownMs: number;
  power: number;
  unlockLevel: number;
}

export interface OcAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardXp: number;
  emoji: string;
}

export interface OcTitleDef {
  name: string;
  levelRequired: number;
  description: string;
  emoji: string;
}

export interface OcArtifactDef {
  id: string;
  name: string;
  rarity: OcRarity;
  description: string;
  emoji: string;
  bonusType: string;
  bonusValue: number;
  unlockLevel: number;
}

export interface OcWildsEventDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  durationMs: number;
  rewardCoins: number;
  rewardXp: number;
  minLevel: number;
}

export interface OcRarityInfo {
  key: OcRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface OcColorTheme {
  ochre: string;
  dustBrown: string;
  sunsetOrange: string;
  sageGreen: string;
  sky: string;
  darkEarth: string;
}

export interface OcBeastState {
  tamed: boolean;
  bondLevel: number;
  tamedAt: number | null;
  encounterCount: number;
}

export interface OcTerritoryState {
  discovered: boolean;
  explored: boolean;
  exploreCount: number;
  beastsFound: number;
  lastExplored: number | null;
}

export interface OcStructureState {
  built: boolean;
  level: number;
  builtAt: number | null;
  lastUpgradedAt: number | null;
}

export interface OcAchievementState {
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface OcArtifactState {
  activated: boolean;
  activatedAt: number | null;
  charges: number;
}

export interface OcAbilityState {
  unlocked: boolean;
  lastUsedAt: number | null;
  useCount: number;
}

export interface OcStats {
  totalTamed: number;
  totalExplored: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

export interface OcWildsEventLogEntry {
  eventId: string;
  triggeredAt: number;
  rewardClaimed: boolean;
}

// ============================================================
// Seeded PRNG
// ============================================================

function ocMulberry32(seed: number): () => number {
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

export const OC_MAX_LEVEL = 50;

function ocXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= OC_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function ocClampLevel(lvl: number): number {
  return Math.max(1, Math.min(OC_MAX_LEVEL, lvl));
}

function ocClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function ocRarityMultiplier(r: OcRarity): number {
  const map: Record<OcRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
  };
  return map[r] ?? 1;
}

function ocGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ============================================================
// Constants
// ============================================================

// ─── Color Theme ─────────────────────────────────────────────────────────

export const OC_COLOR_THEME: OcColorTheme = {
  ochre: '#CC7722',
  dustBrown: '#8B6914',
  sunsetOrange: '#FF6B35',
  sageGreen: '#87AE73',
  sky: '#C4A35A',
  darkEarth: '#2D1B0E',
};

// ─── Species (7 earth-toned creature types) ───────────────────────────────

export const OC_SPECIES: OcSpeciesDef[] = [
  { key: 'dust_lion', name: 'Dust Lion', description: 'A proud feline with a mane of swirling desert dust and sand-colored fur', emoji: '🦁', basePower: 15 },
  { key: 'sand_viper', name: 'Sand Viper', description: 'A venomous serpent that burrows beneath ochre dunes, striking without warning', emoji: '🐍', basePower: 12 },
  { key: 'ochre_bear', name: 'Ochre Bear', description: 'A massive bear with fur the color of dried earth, fiercely territorial', emoji: '🐻', basePower: 20 },
  { key: 'canyon_eagle', name: 'Canyon Eagle', description: 'A raptor that rides thermals above deep canyons with eyes of burnished gold', emoji: '🦅', basePower: 14 },
  { key: 'red_fox', name: 'Red Fox', description: 'A cunning fox with russet fur that blends perfectly with autumn brush', emoji: '🦊', basePower: 10 },
  { key: 'earth_golem', name: 'Earth Golem', description: 'A hulking construct of packed earth and stone, animated by ancient wild magic', emoji: '🗿', basePower: 25 },
  { key: 'wild_steed', name: 'Wild Steed', description: 'A free-roaming horse with a coat of burnished copper, swift as the desert wind', emoji: '🐎', basePower: 13 },
];

// ─── Rarity Tiers ────────────────────────────────────────────────────────

export const OC_RARITIES: OcRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#A0937D', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#87AE73', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#C4A35A', xpMultiplier: 2.5 },
  { key: 'epic', label: 'Epic', color: '#FF6B35', xpMultiplier: 4 },
  { key: 'legendary', label: 'Legendary', color: '#CC7722', xpMultiplier: 7 },
];

// ─── Titles (8 progression titles) ───────────────────────────────────────

export const OC_TITLES: OcTitleDef[] = [
  { name: 'Dust Strider', levelRequired: 1, description: 'A humble wanderer setting foot into the ochre wilds for the first time', emoji: '👣' },
  { name: 'Sand Tracker', levelRequired: 5, description: 'You can read the desert floor like a book, tracing every creature that passes', emoji: '🔍' },
  { name: 'Canyon Scout', levelRequired: 10, description: 'Your scouting skills earn respect from every outpost in the wilds', emoji: '🧭' },
  { name: 'Beast Whisperer', levelRequired: 18, description: 'Wild creatures approach you willingly, sensing your gentle spirit', emoji: '🤫' },
  { name: 'Earth Warden', levelRequired: 25, description: 'You protect the balance between civilization and the untamed land', emoji: '🌿' },
  { name: 'Ochre Sage', levelRequired: 33, description: 'Your knowledge of the wilds rivals the ancients who first walked here', emoji: '📜' },
  { name: 'Desert Monarch', levelRequired: 42, description: 'You command the loyalty of beasts and the respect of every territory', emoji: '👑' },
  { name: 'Sovereign of the Wilds', levelRequired: 50, description: 'The ochre earth itself answers to your will — master of all the wilds', emoji: '🏔️' },
];

// ─── Territories (8 ochre wilderness regions) ────────────────────────────

export const OC_TERRITORIES: OcTerritoryDef[] = [
  {
    id: 'ochre_plains',
    name: 'Ochre Plains',
    description: 'Sweeping golden grasslands where dust lions roam and wild steeds gallop under vast skies',
    emoji: '🌾',
    level: 1,
    resources: ['dust_clump', 'dry_grass', 'ochre_stone', 'wild_grain'],
    capacity: 20,
    unlockLevel: 1,
  },
  {
    id: 'dust_canyon',
    name: 'Dust Canyon',
    description: 'A winding canyon carved by ancient rivers where sand vipers lurk in every crevice',
    emoji: '🏜️',
    level: 5,
    resources: ['canyon_quartz', 'dry_twig', 'sand_pearl', 'sunbaked_clay'],
    capacity: 25,
    unlockLevel: 5,
  },
  {
    id: 'amber_basin',
    name: 'Amber Basin',
    description: 'A sunken valley rich with amber deposits and rare earth minerals',
    emoji: '🟠',
    level: 10,
    resources: ['raw_amber', 'earth_crystal', 'basin_moss', 'clay_pottery'],
    capacity: 30,
    unlockLevel: 10,
  },
  {
    id: 'sunstone_ridge',
    name: 'Sunstone Ridge',
    description: 'A mountain ridge where sunstone formations glow with trapped sunlight at dawn',
    emoji: '⛰️',
    level: 15,
    resources: ['sunstone_shard', 'ridge_iron', 'eagle_feather', 'warm_quartz'],
    capacity: 35,
    unlockLevel: 15,
  },
  {
    id: 'clay_mesa',
    name: 'Clay Mesa',
    description: 'Towering mesa formations of layered red and ochre clay, home to earth golems',
    emoji: '🏜️',
    level: 20,
    resources: ['mesa_clay', 'iron_ore', 'golem_shard', 'terracotta'],
    capacity: 40,
    unlockLevel: 20,
  },
  {
    id: 'sage_hollow',
    name: 'Sage Hollow',
    description: 'A sheltered grove where sage grows wild and foxes dens are hidden among roots',
    emoji: '🌿',
    level: 28,
    resources: ['sage_bundle', 'fox_pelt', 'root_tuber', 'hollow_amber'],
    capacity: 45,
    unlockLevel: 28,
  },
  {
    id: 'obsidian_gorge',
    name: 'Obsidian Gorge',
    description: 'A dark gorge where volcanic glass lines the walls and only the bravest dare enter',
    emoji: '🖤',
    level: 35,
    resources: ['obsidian_shard', 'volcanic_ash', 'rare_gem', 'lava_core'],
    capacity: 50,
    unlockLevel: 35,
  },
  {
    id: 'ancient_burrow',
    name: 'Ancient Burrow',
    description: 'A vast underground network of tunnels built by forgotten civilizations long ago',
    emoji: '🕳️',
    level: 45,
    resources: ['ancient_relic', 'burrow_crystal', 'fossil_bone', 'deep_earth_gem'],
    capacity: 60,
    unlockLevel: 45,
  },
];

// ─── Beasts (35 creatures: 7 species × 5 rarity tiers) ───────────────────

export const OC_BEASTS: OcBeastDef[] = [
  // Common (7)
  {
    id: 'dust_lion_common',
    name: 'Plains Dust Lion',
    species: 'dust_lion',
    rarity: 'common',
    description: 'A young dust lion learning to hunt across the ochre plains',
    emoji: '🦁',
    power: 18,
    cost: 50,
    xpReward: 12,
    requiredLevel: 1,
  },
  {
    id: 'sand_viper_common',
    name: 'Common Sand Viper',
    species: 'sand_viper',
    rarity: 'common',
    description: 'A small but quick viper that hides beneath loose sand',
    emoji: '🐍',
    power: 14,
    cost: 40,
    xpReward: 10,
    requiredLevel: 1,
  },
  {
    id: 'ochre_bear_common',
    name: 'Young Ochre Bear',
    species: 'ochre_bear',
    rarity: 'common',
    description: 'A bear cub with fur already the color of dry earth',
    emoji: '🐻',
    power: 22,
    cost: 60,
    xpReward: 14,
    requiredLevel: 1,
  },
  {
    id: 'canyon_eagle_common',
    name: 'Canyon Kestrel',
    species: 'canyon_eagle',
    rarity: 'common',
    description: 'A small eagle that patrols the lower canyon walls for prey',
    emoji: '🦅',
    power: 16,
    cost: 45,
    xpReward: 11,
    requiredLevel: 1,
  },
  {
    id: 'red_fox_common',
    name: 'Brush Red Fox',
    species: 'red_fox',
    rarity: 'common',
    description: 'A common fox that hunts in the brush at dawn and dusk',
    emoji: '🦊',
    power: 12,
    cost: 35,
    xpReward: 9,
    requiredLevel: 1,
  },
  {
    id: 'earth_golem_common',
    name: 'Pebble Golem',
    species: 'earth_golem',
    rarity: 'common',
    description: 'A small golem made of river stones, harmless but sturdy',
    emoji: '🗿',
    power: 26,
    cost: 70,
    xpReward: 16,
    requiredLevel: 2,
  },
  {
    id: 'wild_steed_common',
    name: 'Wild Mustang',
    species: 'wild_steed',
    rarity: 'common',
    description: 'A free-roaming horse found in small herds across the plains',
    emoji: '🐎',
    power: 15,
    cost: 55,
    xpReward: 10,
    requiredLevel: 1,
  },
  // Uncommon (7)
  {
    id: 'dust_lion_uncommon',
    name: 'Dune Mane Lion',
    species: 'dust_lion',
    rarity: 'uncommon',
    description: 'A mature lion whose mane swirls with actual desert dust during hunts',
    emoji: '🦁',
    power: 35,
    cost: 200,
    xpReward: 28,
    requiredLevel: 5,
  },
  {
    id: 'sand_viper_uncommon',
    name: 'Sidewinder Asp',
    species: 'sand_viper',
    rarity: 'uncommon',
    description: 'A venomous asp that moves in a distinctive sidewinding pattern',
    emoji: '🐍',
    power: 30,
    cost: 180,
    xpReward: 25,
    requiredLevel: 5,
  },
  {
    id: 'ochre_bear_uncommon',
    name: 'Territorial Earth Bear',
    species: 'ochre_bear',
    rarity: 'uncommon',
    description: 'A full-grown bear that claims large swaths of territory in the basin',
    emoji: '🐻',
    power: 42,
    cost: 250,
    xpReward: 32,
    requiredLevel: 6,
  },
  {
    id: 'canyon_eagle_uncommon',
    name: 'Golden Ridge Eagle',
    species: 'canyon_eagle',
    rarity: 'uncommon',
    description: 'An eagle with golden-tipped feathers that soars above the ridge at noon',
    emoji: '🦅',
    power: 33,
    cost: 210,
    xpReward: 27,
    requiredLevel: 5,
  },
  {
    id: 'red_fox_uncommon',
    name: 'Crimson Shadow Fox',
    species: 'red_fox',
    rarity: 'uncommon',
    description: 'An unusually large fox with deep crimson fur that moves like a shadow',
    emoji: '🦊',
    power: 28,
    cost: 170,
    xpReward: 23,
    requiredLevel: 5,
  },
  {
    id: 'earth_golem_uncommon',
    name: 'Clay Sentinel',
    species: 'earth_golem',
    rarity: 'uncommon',
    description: 'A humanoid golem of packed clay that guards ancient structures',
    emoji: '🗿',
    power: 48,
    cost: 300,
    xpReward: 35,
    requiredLevel: 7,
  },
  {
    id: 'wild_steed_uncommon',
    name: 'Copper Windrunner',
    species: 'wild_steed',
    rarity: 'uncommon',
    description: 'A swift steed with a metallic copper sheen, faster than any mustang',
    emoji: '🐎',
    power: 31,
    cost: 190,
    xpReward: 24,
    requiredLevel: 5,
  },
  // Rare (7)
  {
    id: 'dust_lion_rare',
    name: 'King of the Dunes',
    species: 'dust_lion',
    rarity: 'rare',
    description: 'A legendary lion whose roar creates sandstorms across entire dune fields',
    emoji: '🦁',
    power: 72,
    cost: 800,
    xpReward: 65,
    requiredLevel: 15,
  },
  {
    id: 'sand_viper_rare',
    name: 'Amber Fang Serpent',
    species: 'sand_viper',
    rarity: 'rare',
    description: 'A massive viper with fangs of hardened amber, twice as venomous as any other',
    emoji: '🐍',
    power: 65,
    cost: 720,
    xpReward: 58,
    requiredLevel: 15,
  },
  {
    id: 'ochre_bear_rare',
    name: 'Ursine Earthshaker',
    species: 'ochre_bear',
    rarity: 'rare',
    description: 'An enormous bear whose footsteps cause minor tremors in the earth',
    emoji: '🐻',
    power: 85,
    cost: 950,
    xpReward: 75,
    requiredLevel: 18,
  },
  {
    id: 'canyon_eagle_rare',
    name: 'Stormcaller Raptor',
    species: 'canyon_eagle',
    rarity: 'rare',
    description: 'An eagle that summons dust storms with a single piercing cry',
    emoji: '🦅',
    power: 68,
    cost: 760,
    xpReward: 62,
    requiredLevel: 15,
  },
  {
    id: 'red_fox_rare',
    name: 'Kitsune Ember Fox',
    species: 'red_fox',
    rarity: 'rare',
    description: 'A mystical fox with multiple tail tips that glow like embers at night',
    emoji: '🦊',
    power: 60,
    cost: 680,
    xpReward: 55,
    requiredLevel: 15,
  },
  {
    id: 'earth_golem_rare',
    name: 'Bedrock Colossus',
    species: 'earth_golem',
    rarity: 'rare',
    description: 'A towering golem formed from bedrock and ancient mineral deposits',
    emoji: '🗿',
    power: 95,
    cost: 1100,
    xpReward: 82,
    requiredLevel: 18,
  },
  {
    id: 'wild_steed_rare',
    name: 'Phantom Bronco',
    species: 'wild_steed',
    rarity: 'rare',
    description: 'A ghostly steed that leaves a trail of golden dust as it gallops',
    emoji: '🐎',
    power: 63,
    cost: 740,
    xpReward: 60,
    requiredLevel: 15,
  },
  // Epic (7)
  {
    id: 'dust_lion_epic',
    name: 'Apostle of Dust',
    species: 'dust_lion',
    rarity: 'epic',
    description: 'An ancient lion spirit wreathed in perpetual sandstorm, master of the dunes',
    emoji: '🦁',
    power: 150,
    cost: 3000,
    xpReward: 140,
    requiredLevel: 30,
  },
  {
    id: 'sand_viper_epic',
    name: 'Serpent of the Deep Sands',
    species: 'sand_viper',
    rarity: 'epic',
    description: 'A colossal viper that lives beneath the desert, swallowing entire caravans whole',
    emoji: '🐍',
    power: 138,
    cost: 2800,
    xpReward: 130,
    requiredLevel: 28,
  },
  {
    id: 'ochre_bear_epic',
    name: 'Titan of the Ochre',
    species: 'ochre_bear',
    rarity: 'epic',
    description: 'A bear so massive it is mistaken for a hill, its roar splits the earth itself',
    emoji: '🐻',
    power: 175,
    cost: 3500,
    xpReward: 160,
    requiredLevel: 32,
  },
  {
    id: 'canyon_eagle_epic',
    name: 'Sunforged Phoenix Eagle',
    species: 'canyon_eagle',
    rarity: 'epic',
    description: 'An eagle reborn in sunfire, its feathers burn with the light of a thousand suns',
    emoji: '🦅',
    power: 142,
    cost: 2900,
    xpReward: 135,
    requiredLevel: 30,
  },
  {
    id: 'red_fox_epic',
    name: 'Nine-Tailed Ember Spirit',
    species: 'red_fox',
    rarity: 'epic',
    description: 'A legendary fox spirit with nine tails of living flame, trickster of the wilds',
    emoji: '🦊',
    power: 130,
    cost: 2600,
    xpReward: 125,
    requiredLevel: 28,
  },
  {
    id: 'earth_golem_epic',
    name: 'Primordial Mountain Guardian',
    species: 'earth_golem',
    rarity: 'epic',
    description: 'A golem that is literally a small mountain, animated by the planet\'s core energy',
    emoji: '🗿',
    power: 195,
    cost: 3800,
    xpReward: 175,
    requiredLevel: 35,
  },
  {
    id: 'wild_steed_epic',
    name: 'Solar Charger',
    species: 'wild_steed',
    rarity: 'epic',
    description: 'A horse of pure solar energy that gallops across the sky leaving aurora trails',
    emoji: '🐎',
    power: 135,
    cost: 2700,
    xpReward: 128,
    requiredLevel: 28,
  },
  // Legendary (7)
  {
    id: 'dust_lion_legendary',
    name: 'Sahara Incarnation',
    species: 'dust_lion',
    rarity: 'legendary',
    description: 'The living embodiment of the desert — a lion that commands all sand and dust across the world',
    emoji: '🦁',
    power: 350,
    cost: 12000,
    xpReward: 400,
    requiredLevel: 45,
  },
  {
    id: 'sand_viper_legendary',
    name: 'Ouroboros of the Sands',
    species: 'sand_viper',
    rarity: 'legendary',
    description: 'The eternal serpent that encircles the desert, swallowing its own tail at the world\'s edge',
    emoji: '🐍',
    power: 320,
    cost: 11000,
    xpReward: 380,
    requiredLevel: 45,
  },
  {
    id: 'ochre_bear_legendary',
    name: 'Colossus of Earthblood',
    species: 'ochre_bear',
    rarity: 'legendary',
    description: 'The first bear ever born from the earth itself, its blood is liquid ore and its breath is magma',
    emoji: '🐻',
    power: 400,
    cost: 15000,
    xpReward: 450,
    requiredLevel: 48,
  },
  {
    id: 'canyon_eagle_legendary',
    name: 'Celestial Canyon Lord',
    species: 'canyon_eagle',
    rarity: 'legendary',
    description: 'An eagle that has touched the stars, its wings span entire canyons and blot out the sun',
    emoji: '🦅',
    power: 340,
    cost: 13000,
    xpReward: 420,
    requiredLevel: 45,
  },
  {
    id: 'red_fox_legendary',
    name: 'Inari\'s Earthly Vessel',
    species: 'red_fox',
    rarity: 'legendary',
    description: 'The physical incarnation of the fox deity Inari, granting wisdom and fortune to its tamer',
    emoji: '🦊',
    power: 310,
    cost: 10000,
    xpReward: 360,
    requiredLevel: 45,
  },
  {
    id: 'earth_golem_legendary',
    name: 'World Titan',
    species: 'earth_golem',
    rarity: 'legendary',
    description: 'A titan so vast it forms the terrain itself — mountains are its shoulders, rivers its veins',
    emoji: '🗿',
    power: 450,
    cost: 18000,
    xpReward: 500,
    requiredLevel: 50,
  },
  {
    id: 'wild_steed_legendary',
    name: 'Equinox Rider',
    species: 'wild_steed',
    rarity: 'legendary',
    description: 'A horse that exists between day and night, its rider can traverse time itself',
    emoji: '🐎',
    power: 330,
    cost: 12500,
    xpReward: 390,
    requiredLevel: 45,
  },
];

// ─── Materials (30 materials: 6 per rarity tier) ─────────────────────────

export const OC_MATERIALS: OcMaterialDef[] = [
  // Common (6)
  {
    id: 'dust_clump',
    name: 'Dust Clump',
    rarity: 'common',
    description: 'A handful of fine desert dust, useful as a basic building material',
    emoji: '🟤',
    gatherXp: 5,
    stackSize: 99,
    coinValue: 1,
    territoryId: 'ochre_plains',
  },
  {
    id: 'dry_grass',
    name: 'Dry Grass',
    rarity: 'common',
    description: 'Sun-baked grass from the plains, used for weaving and thatching',
    emoji: '🌾',
    gatherXp: 5,
    stackSize: 99,
    coinValue: 1,
    territoryId: 'ochre_plains',
  },
  {
    id: 'ochre_stone',
    name: 'Ochre Stone',
    rarity: 'common',
    description: 'A stone tinted with natural ochre pigment, used in dyes and construction',
    emoji: '🪨',
    gatherXp: 6,
    stackSize: 99,
    coinValue: 2,
    territoryId: 'ochre_plains',
  },
  {
    id: 'wild_grain',
    name: 'Wild Grain',
    rarity: 'common',
    description: 'Hardy grain that grows in the plains, a staple food for travelers',
    emoji: '🌾',
    gatherXp: 5,
    stackSize: 99,
    coinValue: 1,
    territoryId: 'ochre_plains',
  },
  {
    id: 'dry_twig',
    name: 'Dry Twig',
    rarity: 'common',
    description: 'Twigs from dead brush, essential for starting campfires',
    emoji: '🌿',
    gatherXp: 4,
    stackSize: 99,
    coinValue: 1,
    territoryId: 'dust_canyon',
  },
  {
    id: 'sunbaked_clay',
    name: 'Sunbaked Clay',
    rarity: 'common',
    description: 'Clay hardened by the desert sun, used in basic pottery',
    emoji: '🏺',
    gatherXp: 6,
    stackSize: 99,
    coinValue: 2,
    territoryId: 'dust_canyon',
  },
  // Uncommon (6)
  {
    id: 'canyon_quartz',
    name: 'Canyon Quartz',
    rarity: 'uncommon',
    description: 'Clear quartz found in canyon walls, warm to the touch',
    emoji: '💎',
    gatherXp: 15,
    stackSize: 50,
    coinValue: 8,
    territoryId: 'dust_canyon',
  },
  {
    id: 'sand_pearl',
    name: 'Sand Pearl',
    rarity: 'uncommon',
    description: 'A smooth pearl-like stone formed by desert wind erosion',
    emoji: '⚪',
    gatherXp: 16,
    stackSize: 40,
    coinValue: 10,
    territoryId: 'dust_canyon',
  },
  {
    id: 'raw_amber',
    name: 'Raw Amber',
    rarity: 'uncommon',
    description: 'Uncut amber with prehistoric insects trapped inside',
    emoji: '🟠',
    gatherXp: 18,
    stackSize: 30,
    coinValue: 12,
    territoryId: 'amber_basin',
  },
  {
    id: 'earth_crystal',
    name: 'Earth Crystal',
    rarity: 'uncommon',
    description: 'A brown crystal humming with geothermal energy',
    emoji: '💎',
    gatherXp: 17,
    stackSize: 30,
    coinValue: 11,
    territoryId: 'amber_basin',
  },
  {
    id: 'basin_moss',
    name: 'Basin Moss',
    rarity: 'uncommon',
    description: 'Thick green moss that grows in the shade of basin cliffs, good for healing',
    emoji: '🌿',
    gatherXp: 14,
    stackSize: 50,
    coinValue: 7,
    territoryId: 'amber_basin',
  },
  {
    id: 'clay_pottery',
    name: 'Clay Pottery',
    rarity: 'uncommon',
    description: 'Fired pottery crafted from sunbaked clay, used for storage and trade',
    emoji: '🏺',
    gatherXp: 13,
    stackSize: 40,
    coinValue: 6,
    territoryId: 'amber_basin',
  },
  // Rare (6)
  {
    id: 'sunstone_shard',
    name: 'Sunstone Shard',
    rarity: 'rare',
    description: 'A fragment of sunstone that glows with captured dawn light',
    emoji: '☀️',
    gatherXp: 40,
    stackSize: 20,
    coinValue: 35,
    territoryId: 'sunstone_ridge',
  },
  {
    id: 'ridge_iron',
    name: 'Ridge Iron',
    rarity: 'rare',
    description: 'High-quality iron ore mined from the sunstone ridge',
    emoji: '⚙️',
    gatherXp: 38,
    stackSize: 20,
    coinValue: 30,
    territoryId: 'sunstone_ridge',
  },
  {
    id: 'mesa_clay',
    name: 'Mesa Clay',
    rarity: 'rare',
    description: 'Rich red clay from the mesa, used in advanced ceramics and pigments',
    emoji: '🏺',
    gatherXp: 35,
    stackSize: 25,
    coinValue: 28,
    territoryId: 'clay_mesa',
  },
  {
    id: 'iron_ore',
    name: 'Iron Ore',
    rarity: 'rare',
    description: 'Purified iron ore from deep mesa deposits',
    emoji: '🔩',
    gatherXp: 42,
    stackSize: 15,
    coinValue: 38,
    territoryId: 'clay_mesa',
  },
  {
    id: 'golem_shard',
    name: 'Golem Shard',
    rarity: 'rare',
    description: 'A fragment of a destroyed earth golem, pulsing with residual magic',
    emoji: '✨',
    gatherXp: 45,
    stackSize: 10,
    coinValue: 40,
    territoryId: 'clay_mesa',
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    rarity: 'rare',
    description: 'Fired terracotta with beautiful ochre patterns, prized by artisans',
    emoji: '🏺',
    gatherXp: 36,
    stackSize: 20,
    coinValue: 32,
    territoryId: 'clay_mesa',
  },
  // Epic (6)
  {
    id: 'sage_bundle',
    name: 'Sacred Sage Bundle',
    rarity: 'epic',
    description: 'Wild sage bundled with ancient rituals, purifies any corruption it touches',
    emoji: '🪶',
    gatherXp: 100,
    stackSize: 5,
    coinValue: 120,
    territoryId: 'sage_hollow',
  },
  {
    id: 'fox_pelt',
    name: 'Shadow Fox Pelt',
    rarity: 'epic',
    description: 'The pelt of a shadow fox, said to grant stealth to whoever wears it',
    emoji: '🦊',
    gatherXp: 110,
    stackSize: 5,
    coinValue: 150,
    territoryId: 'sage_hollow',
  },
  {
    id: 'root_tuber',
    name: 'Ancient Root Tuber',
    rarity: 'epic',
    description: 'A tuber from roots as old as the wilds, eating it grants great vitality',
    emoji: '🥔',
    gatherXp: 95,
    stackSize: 5,
    coinValue: 110,
    territoryId: 'sage_hollow',
  },
  {
    id: 'hollow_amber',
    name: 'Hollow Amber',
    rarity: 'epic',
    description: 'Amber with a hollow center containing pure liquid sunlight',
    emoji: '🟡',
    gatherXp: 105,
    stackSize: 5,
    coinValue: 130,
    territoryId: 'sage_hollow',
  },
  {
    id: 'obsidian_shard',
    name: 'Obsidian Shard',
    rarity: 'epic',
    description: 'A razor-sharp shard of volcanic obsidian from the gorge depths',
    emoji: '🖤',
    gatherXp: 115,
    stackSize: 5,
    coinValue: 160,
    territoryId: 'obsidian_gorge',
  },
  {
    id: 'lava_core',
    name: 'Lava Core Fragment',
    rarity: 'epic',
    description: 'A cooling fragment from the earth\'s molten core, radiates immense heat',
    emoji: '🔴',
    gatherXp: 120,
    stackSize: 3,
    coinValue: 180,
    territoryId: 'obsidian_gorge',
  },
  // Legendary (6)
  {
    id: 'ancient_relic',
    name: 'Ancient Burrow Relic',
    rarity: 'legendary',
    description: 'A relic from the civilization that built the ancient burrow, pulsing with forgotten power',
    emoji: '🏺',
    gatherXp: 300,
    stackSize: 1,
    coinValue: 600,
    territoryId: 'ancient_burrow',
  },
  {
    id: 'burrow_crystal',
    name: 'Deep Burrow Crystal',
    rarity: 'legendary',
    description: 'A crystal that grew over millennia in the burrow\'s deepest chamber',
    emoji: '💎',
    gatherXp: 320,
    stackSize: 1,
    coinValue: 650,
    territoryId: 'ancient_burrow',
  },
  {
    id: 'fossil_bone',
    name: 'Titan Fossil Bone',
    rarity: 'legendary',
    description: 'A bone from a creature so ancient it predates the wilds themselves',
    emoji: '🦴',
    gatherXp: 280,
    stackSize: 1,
    coinValue: 500,
    territoryId: 'ancient_burrow',
  },
  {
    id: 'deep_earth_gem',
    name: 'Heart of the Earth',
    rarity: 'legendary',
    description: 'A gem formed at the planet\'s core — the rarest substance in the ochre wilds',
    emoji: '💚',
    gatherXp: 400,
    stackSize: 1,
    coinValue: 800,
    territoryId: 'ancient_burrow',
  },
  {
    id: 'volcanic_ash',
    name: 'Primordial Volcanic Ash',
    rarity: 'legendary',
    description: 'Ash from the first volcanic eruption that created the obsidian gorge',
    emoji: '🌫️',
    gatherXp: 260,
    stackSize: 1,
    coinValue: 450,
    territoryId: 'obsidian_gorge',
  },
  {
    id: 'rare_gem',
    name: 'Ochre Star Gem',
    rarity: 'legendary',
    description: 'A gemstone that captures starlight and radiates it as warm ochre light',
    emoji: '⭐',
    gatherXp: 340,
    stackSize: 1,
    coinValue: 700,
    territoryId: 'sunstone_ridge',
  },
];

// ─── Structures (25 buildings, upgradeable to level 10) ───────────────────

export const OC_STRUCTURES: OcStructureDef[] = [
  {
    id: 'dust_watchtower',
    name: 'Dust Watchtower',
    description: 'A tall stone tower for surveying the ochre plains and detecting approaching dust storms',
    emoji: '🗼',
    maxLevel: 10,
    requiredLevel: 1,
    buildCost: { coins: 150, materials: { ochre_stone: 10, dry_grass: 15 } },
    upgradeCost: { coins: 400, materials: { ochre_stone: 20, canyon_quartz: 5 } },
    bonusType: 'scout_range',
    bonusValue: 12,
  },
  {
    id: 'earth_forge',
    name: 'Earth Forge',
    description: 'A forge fueled by geothermal heat for crafting earth-toned weapons and armor',
    emoji: '🔨',
    maxLevel: 10,
    requiredLevel: 3,
    buildCost: { coins: 250, materials: { ochre_stone: 15, iron_ore: 8 } },
    upgradeCost: { coins: 600, materials: { iron_ore: 15, earth_crystal: 5 } },
    bonusType: 'craft_speed',
    bonusValue: 15,
  },
  {
    id: 'beast_enclosure',
    name: 'Beast Enclosure',
    description: 'A reinforced enclosure for housing and training tamed beasts',
    emoji: '🐾',
    maxLevel: 10,
    requiredLevel: 3,
    buildCost: { coins: 200, materials: { ochre_stone: 12, dry_grass: 20 } },
    upgradeCost: { coins: 500, materials: { ochre_stone: 25, raw_amber: 5 } },
    bonusType: 'tame_bonus',
    bonusValue: 8,
  },
  {
    id: 'herb_garden',
    name: 'Wild Herb Garden',
    description: 'A garden growing medicinal herbs and sage in fertile ochre soil',
    emoji: '🌿',
    maxLevel: 10,
    requiredLevel: 2,
    buildCost: { coins: 120, materials: { dry_grass: 15, basin_moss: 10 } },
    upgradeCost: { coins: 350, materials: { basin_moss: 20, sage_bundle: 3 } },
    bonusType: 'herb_yield',
    bonusValue: 10,
  },
  {
    id: 'clay_armory',
    name: 'Terracotta Armory',
    description: 'Stores earth-resistant armor and weapons forged from ochre metals',
    emoji: '🛡️',
    maxLevel: 10,
    requiredLevel: 5,
    buildCost: { coins: 350, materials: { ochre_stone: 20, mesa_clay: 12 } },
    upgradeCost: { coins: 750, materials: { mesa_clay: 25, ridge_iron: 8 } },
    bonusType: 'defense',
    bonusValue: 18,
  },
  {
    id: 'trading_post',
    name: 'Desert Trading Post',
    description: 'A bustling trading hub where travelers exchange rare desert goods',
    emoji: '🏪',
    maxLevel: 10,
    requiredLevel: 5,
    buildCost: { coins: 300, materials: { ochre_stone: 15, clay_pottery: 10 } },
    upgradeCost: { coins: 650, materials: { terracotta: 10, raw_amber: 5 } },
    bonusType: 'trade_bonus',
    bonusValue: 12,
  },
  {
    id: 'water_cistern',
    name: 'Stone Water Cistern',
    description: 'A deep cistern that collects and purifies scarce desert water',
    emoji: '💧',
    maxLevel: 10,
    requiredLevel: 4,
    buildCost: { coins: 200, materials: { ochre_stone: 25, sunbaked_clay: 15 } },
    upgradeCost: { coins: 500, materials: { ochre_stone: 30, mesa_clay: 10 } },
    bonusType: 'water_supply',
    bonusValue: 20,
  },
  {
    id: 'ore_refinery',
    name: 'Earth Ore Refinery',
    description: 'Refines raw earth ores into pure metals using geothermal heat',
    emoji: '⚙️',
    maxLevel: 10,
    requiredLevel: 8,
    buildCost: { coins: 500, materials: { iron_ore: 20, ridge_iron: 10 } },
    upgradeCost: { coins: 1000, materials: { ridge_iron: 20, earth_crystal: 8 } },
    bonusType: 'refine_speed',
    bonusValue: 15,
  },
  {
    id: 'scout_camp',
    name: 'Forward Scout Camp',
    description: 'A hidden camp for scouts monitoring distant territories',
    emoji: '⛺',
    maxLevel: 10,
    requiredLevel: 2,
    buildCost: { coins: 100, materials: { dry_grass: 20, dry_twig: 15 } },
    upgradeCost: { coins: 300, materials: { dry_grass: 30, canyon_quartz: 5 } },
    bonusType: 'scout_stealth',
    bonusValue: 10,
  },
  {
    id: 'amber_workshop',
    name: 'Amber Crafting Workshop',
    description: 'A workshop specializing in amber jewelry and enchanted trinkets',
    emoji: '🔧',
    maxLevel: 10,
    requiredLevel: 10,
    buildCost: { coins: 450, materials: { raw_amber: 15, earth_crystal: 8 } },
    upgradeCost: { coins: 900, materials: { raw_amber: 25, sunstone_shard: 5 } },
    bonusType: 'craft_quality',
    bonusValue: 18,
  },
  {
    id: 'earth_barracks',
    name: 'Ochre Barracks',
    description: 'Housing for wilderness defenders, boosting patrol and guard efficiency',
    emoji: '🏰',
    maxLevel: 10,
    requiredLevel: 10,
    buildCost: { coins: 600, materials: { ochre_stone: 30, mesa_clay: 15 } },
    upgradeCost: { coins: 1200, materials: { ochre_stone: 40, iron_ore: 12 } },
    bonusType: 'patrol_speed',
    bonusValue: 14,
  },
  {
    id: 'smokehouse',
    name: 'Dust Smokehouse',
    description: 'Preserves food and materials using natural desert smoke processes',
    emoji: '🏚️',
    maxLevel: 10,
    requiredLevel: 3,
    buildCost: { coins: 150, materials: { ochre_stone: 10, dry_twig: 20 } },
    upgradeCost: { coins: 400, materials: { ochre_stone: 20, dry_grass: 25 } },
    bonusType: 'preservation',
    bonusValue: 10,
  },
  {
    id: 'crystal_lab',
    name: 'Earth Crystal Laboratory',
    description: 'Studies earth crystals and minerals for advanced crafting recipes',
    emoji: '🔬',
    maxLevel: 10,
    requiredLevel: 15,
    buildCost: { coins: 700, materials: { earth_crystal: 15, canyon_quartz: 20 } },
    upgradeCost: { coins: 1400, materials: { earth_crystal: 25, golem_shard: 5 } },
    bonusType: 'crystal_power',
    bonusValue: 20,
  },
  {
    id: 'grain_silo',
    name: 'Wild Grain Silo',
    description: 'Stores harvested grain and food supplies for long expeditions',
    emoji: '🏠',
    maxLevel: 10,
    requiredLevel: 2,
    buildCost: { coins: 130, materials: { ochre_stone: 15, wild_grain: 20 } },
    upgradeCost: { coins: 350, materials: { ochre_stone: 25, clay_pottery: 15 } },
    bonusType: 'food_storage',
    bonusValue: 15,
  },
  {
    id: 'sunstone_beacon',
    name: 'Sunstone Beacon',
    description: 'A beacon tower powered by sunstone that illuminates the entire territory',
    emoji: '🔔',
    maxLevel: 10,
    requiredLevel: 15,
    buildCost: { coins: 550, materials: { sunstone_shard: 10, ochre_stone: 25 } },
    upgradeCost: { coins: 1100, materials: { sunstone_shard: 18, raw_amber: 8 } },
    bonusType: 'warning_range',
    bonusValue: 16,
  },
  {
    id: 'medic_station',
    name: 'Desert Medic Station',
    description: 'A medical station equipped with sage remedies and earth crystal healing',
    emoji: '🏥',
    maxLevel: 10,
    requiredLevel: 8,
    buildCost: { coins: 400, materials: { basin_moss: 20, sage_bundle: 5 } },
    upgradeCost: { coins: 800, materials: { sage_bundle: 10, root_tuber: 5 } },
    bonusType: 'heal_speed',
    bonusValue: 18,
  },
  {
    id: 'rune_forge',
    name: 'Ancient Rune Forge',
    description: 'Engraves earth runes onto weapons and armor using golem energy',
    emoji: '🪄',
    maxLevel: 10,
    requiredLevel: 20,
    buildCost: { coins: 900, materials: { golem_shard: 12, earth_crystal: 15 } },
    upgradeCost: { coins: 1800, materials: { golem_shard: 20, obsidian_shard: 5 } },
    bonusType: 'enchant_power',
    bonusValue: 25,
  },
  {
    id: 'war_room',
    name: 'Desert War Room',
    description: 'A strategic command center with maps and models of the entire ochre territory',
    emoji: '🗺️',
    maxLevel: 10,
    requiredLevel: 18,
    buildCost: { coins: 750, materials: { terracotta: 15, iron_ore: 18 } },
    upgradeCost: { coins: 1500, materials: { terracotta: 25, ridge_iron: 10 } },
    bonusType: 'strategy_bonus',
    bonusValue: 22,
  },
  {
    id: 'windmill',
    name: 'Desert Windmill',
    description: 'Harnesses the constant desert wind to grind grain and power machinery',
    emoji: '🌀',
    maxLevel: 10,
    requiredLevel: 4,
    buildCost: { coins: 280, materials: { ochre_stone: 18, dry_grass: 15 } },
    upgradeCost: { coins: 600, materials: { ochre_stone: 25, clay_pottery: 10 } },
    bonusType: 'power_output',
    bonusValue: 14,
  },
  {
    id: 'artifact_vault',
    name: 'Artifact Vault',
    description: 'A secure underground vault for storing and studying rare artifacts',
    emoji: '🗝️',
    maxLevel: 10,
    requiredLevel: 25,
    buildCost: { coins: 1000, materials: { obsidian_shard: 10, golem_shard: 15 } },
    upgradeCost: { coins: 2000, materials: { obsidian_shard: 18, ancient_relic: 3 } },
    bonusType: 'artifact_power',
    bonusValue: 30,
  },
  {
    id: 'sky_observatory',
    name: 'Sky Observatory',
    description: 'An observatory atop the mesa for reading celestial omens and star patterns',
    emoji: '🔭',
    maxLevel: 10,
    requiredLevel: 22,
    buildCost: { coins: 850, materials: { sunstone_shard: 12, terracotta: 20 } },
    upgradeCost: { coins: 1700, materials: { sunstone_shard: 20, rare_gem: 3 } },
    bonusType: 'foresight',
    bonusValue: 20,
  },
  {
    id: 'sage_sanctum',
    name: 'Sage Sanctum',
    description: 'A peaceful sanctuary where sages meditate and brew powerful elixirs',
    emoji: '🧘',
    maxLevel: 10,
    requiredLevel: 28,
    buildCost: { coins: 1100, materials: { sage_bundle: 15, hollow_amber: 8 } },
    upgradeCost: { coins: 2200, materials: { sage_bundle: 25, deep_earth_gem: 3 } },
    bonusType: 'wisdom_bonus',
    bonusValue: 28,
  },
  {
    id: 'trap_workshop',
    name: 'Earth Trap Workshop',
    description: 'Crafts cunning traps using natural terrain features and golem shards',
    emoji: '⚡',
    maxLevel: 10,
    requiredLevel: 12,
    buildCost: { coins: 500, materials: { golem_shard: 8, dry_twig: 25 } },
    upgradeCost: { coins: 1000, materials: { golem_shard: 15, mesa_clay: 12 } },
    bonusType: 'trap_damage',
    bonusValue: 16,
  },
  {
    id: 'ancient_ruin',
    name: 'Restored Ancient Ruin',
    description: 'An ancient structure from a lost desert civilization, slowly being restored',
    emoji: '🏛️',
    maxLevel: 10,
    requiredLevel: 35,
    buildCost: { coins: 1500, materials: { ancient_relic: 5, fossil_bone: 8 } },
    upgradeCost: { coins: 3000, materials: { ancient_relic: 10, deep_earth_gem: 5 } },
    bonusType: 'ancient_knowledge',
    bonusValue: 35,
  },
  {
    id: 'desert_stable',
    name: 'Wild Steed Stable',
    description: 'A spacious stable where wild steeds are trained and bonded with their riders',
    emoji: '🐴',
    maxLevel: 10,
    requiredLevel: 6,
    buildCost: { coins: 220, materials: { ochre_stone: 15, dry_grass: 25 } },
    upgradeCost: { coins: 550, materials: { ochre_stone: 25, mesa_clay: 10 } },
    bonusType: 'mount_speed',
    bonusValue: 12,
  },
];

// ─── Abilities (22 abilities: 6 offensive, 5 defensive, 6 utility, 5 summon) ──

export const OC_ABILITIES: OcAbilityDef[] = [
  // Offensive (6)
  {
    id: 'sandstorm_blast',
    name: 'Sandstorm Blast',
    category: 'offensive',
    description: 'Unleash a concentrated sandstorm that damages and blinds all enemies in range',
    emoji: '🌪️',
    cooldownMs: 8000,
    power: 45,
    unlockLevel: 1,
  },
  {
    id: 'ochre_strike',
    name: 'Ochre Strike',
    category: 'offensive',
    description: 'A powerful earth-infused melee attack that sends shockwaves through the ground',
    emoji: '👊',
    cooldownMs: 5000,
    power: 35,
    unlockLevel: 3,
  },
  {
    id: 'eagle_dive',
    name: 'Eagle Dive',
    category: 'offensive',
    description: 'Command your eagle to perform a devastating dive-bomb attack from above',
    emoji: '🦅',
    cooldownMs: 10000,
    power: 60,
    unlockLevel: 8,
  },
  {
    id: 'viper_venom',
    name: 'Viper Venom Spit',
    category: 'offensive',
    description: 'Project corrosive viper venom that melts through enemy defenses',
    emoji: '🐍',
    cooldownMs: 7000,
    power: 50,
    unlockLevel: 12,
  },
  {
    id: 'golem_slam',
    name: 'Golem Earth Slam',
    category: 'offensive',
    description: 'Your golem smashes the ground, creating a devastating crater and shockwave',
    emoji: '🗿',
    cooldownMs: 15000,
    power: 85,
    unlockLevel: 20,
  },
  {
    id: 'lion_roar',
    name: 'Dust Lion Roar',
    category: 'offensive',
    description: 'Your lion unleashes a terrifying roar that damages and stuns all nearby foes',
    emoji: '🦁',
    cooldownMs: 12000,
    power: 70,
    unlockLevel: 15,
  },
  // Defensive (5)
  {
    id: 'earth_shield',
    name: 'Earth Shield',
    category: 'defensive',
    description: 'Raise a wall of packed earth that absorbs incoming damage for a duration',
    emoji: '🛡️',
    cooldownMs: 10000,
    power: 40,
    unlockLevel: 2,
  },
  {
    id: 'sand_veil',
    name: 'Sand Veil',
    category: 'defensive',
    description: 'Wrap yourself in a cloud of blinding sand, greatly increasing evasion',
    emoji: '🌫️',
    cooldownMs: 12000,
    power: 30,
    unlockLevel: 5,
  },
  {
    id: 'bear_fortress',
    name: 'Bear Fortress Stance',
    category: 'defensive',
    description: 'Your bear enters a defensive stance, reducing all damage taken by allies',
    emoji: '🐻',
    cooldownMs: 15000,
    power: 55,
    unlockLevel: 10,
  },
  {
    id: 'clay_armor',
    name: 'Clay Armor Plating',
    category: 'defensive',
    description: 'Encase yourself in hardened clay armor that shatters on impact, absorbing damage',
    emoji: '🏺',
    cooldownMs: 18000,
    power: 65,
    unlockLevel: 18,
  },
  {
    id: 'ancient_ward',
    name: 'Ancient Earth Ward',
    category: 'defensive',
    description: 'Activate an ancient ward glyph that protects a large area from all damage',
    emoji: '🔮',
    cooldownMs: 25000,
    power: 80,
    unlockLevel: 28,
  },
  // Utility (6)
  {
    id: 'track_scent',
    name: 'Track Scent',
    category: 'utility',
    description: 'Detect the trail of any creature or resource within a large radius',
    emoji: '👃',
    cooldownMs: 6000,
    power: 20,
    unlockLevel: 1,
  },
  {
    id: 'dust_camouflage',
    name: 'Dust Camouflage',
    category: 'utility',
    description: 'Blend into the surrounding desert terrain, becoming nearly invisible',
    emoji: '🥷',
    cooldownMs: 8000,
    power: 25,
    unlockLevel: 4,
  },
  {
    id: 'swift_gallop',
    name: 'Swift Gallop',
    category: 'utility',
    description: 'Your steed bursts into incredible speed, traveling great distances instantly',
    emoji: '🐎',
    cooldownMs: 20000,
    power: 35,
    unlockLevel: 6,
  },
  {
    id: 'earth_sense',
    name: 'Earth Sense',
    category: 'utility',
    description: 'Feel vibrations through the ground, revealing hidden passages and resources',
    emoji: '🌍',
    cooldownMs: 15000,
    power: 30,
    unlockLevel: 10,
  },
  {
    id: 'sage_blessing',
    name: 'Sage Blessing',
    category: 'utility',
    description: 'Channel the power of sacred sage to heal wounds and cure ailments',
    emoji: '🌿',
    cooldownMs: 18000,
    power: 45,
    unlockLevel: 15,
  },
  {
    id: 'sunstone_light',
    name: 'Sunstone Light',
    category: 'utility',
    description: 'Activate a sunstone to illuminate dark areas and reveal invisible entities',
    emoji: '☀️',
    cooldownMs: 12000,
    power: 28,
    unlockLevel: 8,
  },
  // Summon (5)
  {
    id: 'summon_vipers',
    name: 'Summon Viper Swarm',
    category: 'summon',
    description: 'Call forth a swarm of sand vipers to overwhelm enemies with numbers',
    emoji: '🐍',
    cooldownMs: 20000,
    power: 50,
    unlockLevel: 5,
  },
  {
    id: 'summon_golem',
    name: 'Summon Earth Golem',
    category: 'summon',
    description: 'Raise a lesser earth goolem from the ground to fight alongside you',
    emoji: '🗿',
    cooldownMs: 30000,
    power: 70,
    unlockLevel: 15,
  },
  {
    id: 'summon_eagle',
    name: 'Summon Canyon Eagle',
    category: 'summon',
    description: 'Call a canyon eagle to provide aerial reconnaissance and dive attacks',
    emoji: '🦅',
    cooldownMs: 25000,
    power: 55,
    unlockLevel: 10,
  },
  {
    id: 'summon_lion',
    name: 'Summon Dust Lion',
    category: 'summon',
    description: 'Summon a spectral dust lion that charges into battle with devastating force',
    emoji: '🦁',
    cooldownMs: 35000,
    power: 85,
    unlockLevel: 25,
  },
  {
    id: 'summon_steed',
    name: 'Summon Phantom Steed',
    category: 'summon',
    description: 'Summon a phantom steed that can carry you through dangerous terrain safely',
    emoji: '🐎',
    cooldownMs: 22000,
    power: 40,
    unlockLevel: 8,
  },
];

// ─── Achievements (18 achievements) ──────────────────────────────────────

export const OC_ACHIEVEMENTS: OcAchievementDef[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Tame your very first beast in the ochre wilds',
    conditionKey: 'totalTamed',
    targetValue: 1,
    rewardXp: 20,
    emoji: '👣',
  },
  {
    id: 'trailblazer',
    name: 'Trailblazer',
    description: 'Explore your first territory',
    conditionKey: 'totalExplored',
    targetValue: 1,
    rewardXp: 25,
    emoji: '🧭',
  },
  {
    id: 'foundation_stone',
    name: 'Foundation Stone',
    description: 'Build your first structure',
    conditionKey: 'totalStructuresBuilt',
    targetValue: 1,
    rewardXp: 30,
    emoji: '🧱',
  },
  {
    id: 'beast_herd',
    name: 'Beast Herd',
    description: 'Tame 10 beasts across the wilds',
    conditionKey: 'totalTamed',
    targetValue: 10,
    rewardXp: 100,
    emoji: '🐾',
  },
  {
    id: 'cartographer',
    name: 'Cartographer',
    description: 'Discover all 8 territories',
    conditionKey: 'totalExplored',
    targetValue: 8,
    rewardXp: 200,
    emoji: '🗺️',
  },
  {
    id: 'master_builder',
    name: 'Master Builder',
    description: 'Build 10 structures',
    conditionKey: 'totalStructuresBuilt',
    targetValue: 10,
    rewardXp: 150,
    emoji: '🔨',
  },
  {
    id: 'rare_find',
    name: 'Rare Find',
    description: 'Tame your first rare beast',
    conditionKey: 'totalTamed',
    targetValue: 8,
    rewardXp: 120,
    emoji: '💎',
  },
  {
    id: 'epic_tamer',
    name: 'Epic Tamer',
    description: 'Tame your first epic beast',
    conditionKey: 'totalTamed',
    targetValue: 15,
    rewardXp: 250,
    emoji: '🌟',
  },
  {
    id: 'legend_seekr',
    name: 'Legend Seeker',
    description: 'Tame your first legendary beast',
    conditionKey: 'totalTamed',
    targetValue: 21,
    rewardXp: 500,
    emoji: '👑',
  },
  {
    id: 'artifact_hunter',
    name: 'Artifact Hunter',
    description: 'Activate your first artifact',
    conditionKey: 'totalArtifacts',
    targetValue: 1,
    rewardXp: 80,
    emoji: '🏺',
  },
  {
    id: 'collector',
    name: 'Relic Collector',
    description: 'Activate 4 artifacts',
    conditionKey: 'totalArtifacts',
    targetValue: 4,
    rewardXp: 300,
    emoji: '🏺',
  },
  {
    id: 'event_survivor',
    name: 'Wilds Survivor',
    description: 'Survive 5 wilds events',
    conditionKey: 'totalEvents',
    targetValue: 5,
    rewardXp: 150,
    emoji: '🌪️',
  },
  {
    id: 'event_master',
    name: 'Event Master',
    description: 'Survive 15 wilds events',
    conditionKey: 'totalEvents',
    targetValue: 15,
    rewardXp: 400,
    emoji: '⚡',
  },
  {
    id: 'all_species',
    name: 'Complete Bestiary',
    description: 'Tame at least one beast of every species',
    conditionKey: 'totalTamed',
    targetValue: 7,
    rewardXp: 180,
    emoji: '📖',
  },
  {
    id: 'fortress',
    name: 'Desert Fortress',
    description: 'Upgrade any structure to level 10',
    conditionKey: 'totalStructuresBuilt',
    targetValue: 15,
    rewardXp: 350,
    emoji: '🏰',
  },
  {
    id: 'coin_hoarder',
    name: 'Coin Hoarder',
    description: 'Earn 5000 total coins',
    conditionKey: 'totalCoins',
    targetValue: 5000,
    rewardXp: 200,
    emoji: '💰',
  },
  {
    id: 'xp_sage',
    name: 'Sage of Experience',
    description: 'Earn 10000 total XP',
    conditionKey: 'totalXp',
    targetValue: 10000,
    rewardXp: 500,
    emoji: '✨',
  },
  {
    id: 'apex_warden',
    name: 'Apex Warden',
    description: 'Tame all 35 beasts in the ochre wilds',
    conditionKey: 'totalTamed',
    targetValue: 35,
    rewardXp: 1000,
    emoji: '🏆',
  },
];

// ─── Artifacts (6 artifacts: rare/epic/legendary) ────────────────────────

export const OC_ARTIFACTS: OcArtifactDef[] = [
  {
    id: 'ochre_amulet',
    name: 'Ochre Heart Amulet',
    rarity: 'rare',
    description: 'An amulet with a beating ochre stone at its center, strengthening bonds with tamed beasts',
    emoji: '📿',
    bonusType: 'bond_bonus',
    bonusValue: 15,
    unlockLevel: 15,
  },
  {
    id: 'sand_glass',
    name: 'Hourglass of Sands',
    rarity: 'rare',
    description: 'An hourglass filled with enchanted desert sand that slows time briefly',
    emoji: '⏳',
    bonusType: 'time_slow',
    bonusValue: 20,
    unlockLevel: 15,
  },
  {
    id: 'eagle_crest',
    name: 'Crest of the Canyon Eagle',
    rarity: 'rare',
    description: 'A golden crest feather that grants enhanced vision and awareness',
    emoji: '🪶',
    bonusType: 'vision_range',
    bonusValue: 25,
    unlockLevel: 18,
  },
  {
    id: 'golem_core',
    name: 'Primordial Golem Core',
    rarity: 'epic',
    description: 'The still-beating core of an ancient earth golem, radiating immense power',
    emoji: '💎',
    bonusType: 'power_boost',
    bonusValue: 40,
    unlockLevel: 30,
  },
  {
    id: 'sage_staff',
    name: 'Staff of the Ochre Sage',
    rarity: 'epic',
    description: 'A staff carved from ancient wood, topped with a sacred sage crystal',
    emoji: '🪄',
    bonusType: 'wisdom_boost',
    bonusValue: 35,
    unlockLevel: 28,
  },
  {
    id: 'world_heart',
    name: 'Heart of the Ochre Wilds',
    rarity: 'legendary',
    description: 'The crystallized essence of the ochre wilds itself — grants mastery over earth and beast alike',
    emoji: '❤️‍🔥',
    bonusType: 'ultimate_power',
    bonusValue: 100,
    unlockLevel: 45,
  },
];

// ─── Wilds Events (8 random events) ──────────────────────────────────────

export const OC_EVENTS: OcWildsEventDef[] = [
  {
    id: 'dust_storm',
    name: 'Great Dust Storm',
    description: 'A massive dust storm sweeps across the plains, obscuring vision and scattering wildlife',
    emoji: '🌪️',
    durationMs: 60000,
    rewardCoins: 50,
    rewardXp: 40,
    minLevel: 1,
  },
  {
    id: 'beast_migration',
    name: 'Beast Migration',
    description: 'A great migration of wild beasts passes through the territory, offering rare taming chances',
    emoji: '🦬',
    durationMs: 90000,
    rewardCoins: 100,
    rewardXp: 80,
    minLevel: 5,
  },
  {
    id: 'amber_discovery',
    name: 'Amber Vein Discovery',
    description: 'Miners discover a rich amber vein, providing bonus materials for a limited time',
    emoji: '🟠',
    durationMs: 120000,
    rewardCoins: 200,
    rewardXp: 120,
    minLevel: 10,
  },
  {
    id: 'ancient_earthquake',
    name: 'Ancient Earthquake',
    description: 'A deep earthquake shakes the territory, revealing hidden underground passages',
    emoji: '🌍',
    durationMs: 45000,
    rewardCoins: 75,
    rewardXp: 60,
    minLevel: 8,
  },
  {
    id: 'eclipse_hunt',
    name: 'Eclipse Hunt',
    description: 'A solar eclipse drives nocturnal beasts into a frenzy, making them aggressive but rewarding',
    emoji: '🌑',
    durationMs: 75000,
    rewardCoins: 150,
    rewardXp: 100,
    minLevel: 15,
  },
  {
    id: 'sage_bloom',
    name: 'Sacred Sage Bloom',
    description: 'The rare sacred sage blooms all at once, flooding the territory with healing energy',
    emoji: '🌺',
    durationMs: 100000,
    rewardCoins: 120,
    rewardXp: 90,
    minLevel: 12,
  },
  {
    id: 'golem_awakening',
    name: 'Golem Awakening',
    description: 'Dormant earth golems stir beneath the mesa, emerging in massive numbers',
    emoji: '🗿',
    durationMs: 80000,
    rewardCoins: 250,
    rewardXp: 150,
    minLevel: 20,
  },
  {
    id: 'desert_mirage',
    name: 'Desert Mirage',
    description: 'A shimmering mirage reveals the ghostly image of a lost oasis with legendary rewards',
    emoji: '🏜️',
    durationMs: 50000,
    rewardCoins: 300,
    rewardXp: 200,
    minLevel: 25,
  },
];

// ============================================================
// Initial State Factory
// ============================================================

function createInitialBeastState(): Record<string, OcBeastState> {
  const map: Record<string, OcBeastState> = {};
  for (const b of OC_BEASTS) {
    map[b.id] = { tamed: false, bondLevel: 0, tamedAt: null, encounterCount: 0 };
  }
  return map;
}

function createInitialTerritoryState(): Record<string, OcTerritoryState> {
  const map: Record<string, OcTerritoryState> = {};
  for (const t of OC_TERRITORIES) {
    map[t.id] = { discovered: false, explored: false, exploreCount: 0, beastsFound: 0, lastExplored: null };
  }
  return map;
}

function createInitialStructureState(): Record<string, OcStructureState> {
  const map: Record<string, OcStructureState> = {};
  for (const s of OC_STRUCTURES) {
    map[s.id] = { built: false, level: 0, builtAt: null, lastUpgradedAt: null };
  }
  return map;
}

function createInitialAchievementState(): Record<string, OcAchievementState> {
  const map: Record<string, OcAchievementState> = {};
  for (const a of OC_ACHIEVEMENTS) {
    map[a.id] = { unlocked: false, unlockedAt: null };
  }
  return map;
}

function createInitialArtifactState(): Record<string, OcArtifactState> {
  const map: Record<string, OcArtifactState> = {};
  for (const ar of OC_ARTIFACTS) {
    map[ar.id] = { activated: false, activatedAt: null, charges: 3 };
  }
  return map;
}

function createInitialAbilityState(): Record<string, OcAbilityState> {
  const map: Record<string, OcAbilityState> = {};
  for (const ab of OC_ABILITIES) {
    map[ab.id] = { unlocked: false, lastUsedAt: null, useCount: 0 };
  }
  return map;
}

// ============================================================
// Hook: useOchreWilds
// ============================================================

export default function useOchreWilds(initialSeed?: number) {
  // ─── Core State ────────────────────────────────────────────────────────
  const [ocLevel, setOcLevel] = useState(1);
  const [ocXp, setOcXp] = useState(0);
  const [ocCoins, setOcCoins] = useState(100);
  const [ocBeasts, setOcBeasts] = useState<Record<string, OcBeastState>>(createInitialBeastState);
  const [ocTerritories, setOcTerritories] = useState<Record<string, OcTerritoryState>>(createInitialTerritoryState);
  const [ocStructures, setOcStructures] = useState<Record<string, OcStructureState>>(createInitialStructureState);
  const [ocAchievements, setOcAchievements] = useState<Record<string, OcAchievementState>>(createInitialAchievementState);
  const [ocArtifacts, setOcArtifacts] = useState<Record<string, OcArtifactState>>(createInitialArtifactState);
  const [ocAbilities, setOcAbilities] = useState<Record<string, OcAbilityState>>(createInitialAbilityState);
  const [ocMaterials, setOcMaterials] = useState<Record<string, number>>({});
  const [ocStats, setOcStats] = useState<OcStats>({
    totalTamed: 0,
    totalExplored: 0,
    totalStructuresBuilt: 0,
    totalArtifacts: 0,
    totalEvents: 0,
    totalCoins: 0,
    totalXp: 0,
  });
  const [ocEventLog, setOcEventLog] = useState<OcWildsEventLogEntry[]>([]);
  const [ocSeed] = useState(() => initialSeed ?? Math.floor(Math.random() * 1000000));
  const rngRef = useRef(ocMulberry32(ocSeed));

  // ─── Internal helpers ──────────────────────────────────────────────────

  const addXp = useCallback((amount: number) => {
    const mult = 1;
    const finalXp = Math.floor(amount * mult);
    setOcXp(prev => {
      let xp = prev + finalXp;
      let lvl = ocLevel;
      let needed = ocXpRequired(lvl);
      while (xp >= needed && lvl < OC_MAX_LEVEL) {
        xp -= needed;
        lvl++;
        needed = ocXpRequired(lvl);
      }
      if (lvl > ocLevel) setOcLevel(lvl);
      return lvl >= OC_MAX_LEVEL ? 0 : xp;
    });
    setOcStats(prev => ({ ...prev, totalXp: prev.totalXp + finalXp }));
  }, [ocLevel]);

  const addCoins = useCallback((amount: number) => {
    setOcCoins(prev => ocClampCoins(prev + amount));
    setOcStats(prev => ({ ...prev, totalCoins: prev.totalCoins + amount }));
  }, []);

  // ─── Core Actions ──────────────────────────────────────────────────────

  const tameBeast = useCallback((beastId: string): boolean => {
    const def = OC_BEASTS.find(b => b.id === beastId);
    if (!def) return false;
    if (ocLevel < def.requiredLevel) return false;
    if (ocCoins < def.cost) return false;

    const state = ocBeasts[beastId];
    if (state?.tamed) return false;

    const success = rngRef.current() < 0.3 + ocLevel * 0.01;
    if (!success) {
      setOcCoins(prev => ocClampCoins(prev - Math.floor(def.cost * 0.1)));
      setOcBeasts(prev => ({
        ...prev,
        [beastId]: { ...prev[beastId], encounterCount: prev[beastId].encounterCount + 1 },
      }));
      return false;
    }

    setOcCoins(prev => ocClampCoins(prev - def.cost));
    const tamedAt = Date.now();
    setOcBeasts(prev => ({
      ...prev,
      [beastId]: {
        tamed: true,
        bondLevel: 1,
        tamedAt,
        encounterCount: prev[beastId].encounterCount + 1,
      },
    }));
    addXp(def.xpReward);
    setOcStats(prev => ({ ...prev, totalTamed: prev.totalTamed + 1 }));
    return true;
  }, [ocLevel, ocCoins, ocBeasts, addXp]);

  const exploreTerritory = useCallback((territoryId: string): boolean => {
    const def = OC_TERRITORIES.find(t => t.id === territoryId);
    if (!def) return false;
    if (ocLevel < def.unlockLevel) return false;

    const state = ocTerritories[territoryId];
    if (!state) return false;

    const now = Date.now();
    setOcTerritories(prev => ({
      ...prev,
      [territoryId]: {
        discovered: true,
        explored: true,
        exploreCount: prev[territoryId].exploreCount + 1,
        beastsFound: prev[territoryId].beastsFound + Math.floor(rngRef.current() * 3) + 1,
        lastExplored: now,
      },
    }));

    const baseXp = def.level * 10 + 5;
    addXp(baseXp);

    // Random material drops
    const materialsInTerritory = OC_MATERIALS.filter(m => m.territoryId === territoryId);
    if (materialsInTerritory.length > 0) {
      const dropCount = Math.floor(rngRef.current() * 3) + 1;
      for (let i = 0; i < dropCount; i++) {
        const mat = materialsInTerritory[Math.floor(rngRef.current() * materialsInTerritory.length)];
        if (mat) {
          const qty = Math.floor(rngRef.current() * 3) + 1;
          setOcMaterials(prev => ({ ...prev, [mat.id]: (prev[mat.id] || 0) + qty }));
          addXp(mat.gatherXp);
        }
      }
    }

    if (!state.discovered) {
      setOcStats(prev => ({ ...prev, totalExplored: prev.totalExplored + 1 }));
    }

    addCoins(Math.floor(rngRef.current() * 20) + 5);
    return true;
  }, [ocLevel, ocTerritories, addXp, addCoins]);

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = OC_STRUCTURES.find(s => s.id === structureId);
    if (!def) return false;
    if (ocLevel < def.requiredLevel) return false;

    const state = ocStructures[structureId];
    if (!state) return false;

    const now = Date.now();

    if (!state.built) {
      // Build new
      if (ocCoins < def.buildCost.coins) return false;
      setOcCoins(prev => ocClampCoins(prev - def.buildCost.coins));
      // Deduct materials
      setOcMaterials(prev => {
        const next = { ...prev };
        for (const [matId, qty] of Object.entries(def.buildCost.materials)) {
          next[matId] = Math.max(0, (next[matId] || 0) - qty);
        }
        return next;
      });
      setOcStructures(prev => ({
        ...prev,
        [structureId]: { built: true, level: 1, builtAt: now, lastUpgradedAt: now },
      }));
      addXp(def.requiredLevel * 5 + 20);
      setOcStats(prev => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
      return true;
    }

    // Upgrade existing
    if (state.level >= def.maxLevel) return false;
    const mult = state.level;
    const coinCost = Math.floor(def.upgradeCost.coins * (1 + mult * 0.3));
    if (ocCoins < coinCost) return false;

    setOcCoins(prev => ocClampCoins(prev - coinCost));
    setOcMaterials(prev => {
      const next = { ...prev };
      for (const [matId, qty] of Object.entries(def.upgradeCost.materials)) {
        next[matId] = Math.max(0, (next[matId] || 0) - Math.floor(qty * (1 + mult * 0.2)));
      }
      return next;
    });
    setOcStructures(prev => ({
      ...prev,
      [structureId]: { ...prev[structureId], level: prev[structureId].level + 1, lastUpgradedAt: now },
    }));
    addXp(def.requiredLevel * 3 + state.level * 10);
    return true;
  }, [ocLevel, ocCoins, ocStructures, ocMaterials, addXp]);

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = OC_ARTIFACTS.find(a => a.id === artifactId);
    if (!def) return false;
    if (ocLevel < def.unlockLevel) return false;

    const state = ocArtifacts[artifactId];
    if (!state || state.activated || state.charges <= 0) return false;

    setOcArtifacts(prev => ({
      ...prev,
      [artifactId]: { ...prev[artifactId], activated: true, activatedAt: Date.now(), charges: prev[artifactId].charges - 1 },
    }));
    addXp(def.unlockLevel * 8 + 50);
    setOcStats(prev => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [ocLevel, ocArtifacts, addXp]);

  const triggerWildsEvent = useCallback((eventId?: string): OcWildsEventDef | null => {
    const event = eventId
      ? OC_EVENTS.find(e => e.id === eventId)
      : OC_EVENTS.filter(e => e.minLevel <= ocLevel)[Math.floor(rngRef.current() * OC_EVENTS.filter(e => e.minLevel <= ocLevel).length)];

    if (!event) return null;
    if (ocLevel < event.minLevel) return null;

    const entry: OcWildsEventLogEntry = {
      eventId: event.id,
      triggeredAt: Date.now(),
      rewardClaimed: false,
    };
    setOcEventLog(prev => [...prev.slice(-49), entry]);

    // Simulate event reward after a brief logic pass
    addCoins(event.rewardCoins);
    addXp(event.rewardXp);
    setOcStats(prev => ({ ...prev, totalEvents: prev.totalEvents + 1 }));

    return event;
  }, [ocLevel, addCoins, addXp]);

  const resetOchreWilds = useCallback(() => {
    setOcLevel(1);
    setOcXp(0);
    setOcCoins(100);
    setOcBeasts(createInitialBeastState());
    setOcTerritories(createInitialTerritoryState());
    setOcStructures(createInitialStructureState());
    setOcAchievements(createInitialAchievementState());
    setOcArtifacts(createInitialArtifactState());
    setOcAbilities(createInitialAbilityState());
    setOcMaterials({});
    setOcStats({
      totalTamed: 0,
      totalExplored: 0,
      totalStructuresBuilt: 0,
      totalArtifacts: 0,
      totalEvents: 0,
      totalCoins: 0,
      totalXp: 0,
    });
    setOcEventLog([]);
    rngRef.current = ocMulberry32(Math.floor(Math.random() * 1000000));
  }, []);

  // ─── Extended Actions ──────────────────────────────────────────────────

  const discoverTerritory = useCallback((territoryId: string): boolean => {
    const def = OC_TERRITORIES.find(t => t.id === territoryId);
    if (!def || ocLevel < def.unlockLevel) return false;

    const state = ocTerritories[territoryId];
    if (state?.discovered) return false;

    setOcTerritories(prev => ({
      ...prev,
      [territoryId]: { ...prev[territoryId], discovered: true },
    }));
    setOcStats(prev => ({ ...prev, totalExplored: prev.totalExplored + 1 }));
    addXp(def.level * 8);
    return true;
  }, [ocLevel, ocTerritories, addXp]);

  const checkAndClaimAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];

    setOcAchievements(prev => {
      const next = { ...prev };
      for (const ach of OC_ACHIEVEMENTS) {
        if (next[ach.id].unlocked) continue;
        let current = 0;
        switch (ach.conditionKey) {
          case 'totalTamed': current = ocStats.totalTamed; break;
          case 'totalExplored': current = ocStats.totalExplored; break;
          case 'totalStructuresBuilt': current = ocStats.totalStructuresBuilt; break;
          case 'totalArtifacts': current = ocStats.totalArtifacts; break;
          case 'totalEvents': current = ocStats.totalEvents; break;
          case 'totalCoins': current = ocStats.totalCoins; break;
          case 'totalXp': current = ocStats.totalXp; break;
        }
        if (current >= ach.targetValue) {
          next[ach.id] = { unlocked: true, unlockedAt: Date.now() };
          newlyUnlocked.push(ach.id);
          addXp(ach.rewardXp);
        }
      }
      return next;
    });

    return newlyUnlocked;
  }, [ocStats, addXp]);

  const useAbility = useCallback((abilityId: string): boolean => {
    const def = OC_ABILITIES.find(a => a.id === abilityId);
    if (!def) return false;
    if (ocLevel < def.unlockLevel) return false;

    const state = ocAbilities[abilityId];
    if (!state) return false;

    const now = Date.now();
    if (state.lastUsedAt && now - state.lastUsedAt < def.cooldownMs) return false;

    setOcAbilities(prev => ({
      ...prev,
      [abilityId]: {
        unlocked: true,
        lastUsedAt: now,
        useCount: prev[abilityId].useCount + 1,
      },
    }));
    addXp(Math.floor(def.power * 0.5) + 5);
    return true;
  }, [ocLevel, ocAbilities, addXp]);

  // ─── Auto-unlock abilities based on level ──────────────────────────────

  useEffect(() => {
    setOcAbilities(prev => {
      const next = { ...prev };
      let changed = false;
      for (const ab of OC_ABILITIES) {
        if (!next[ab.id].unlocked && ocLevel >= ab.unlockLevel) {
          next[ab.id] = { ...next[ab.id], unlocked: true };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [ocLevel]);

  // ─── Title System ──────────────────────────────────────────────────────

  const currentTitleInfo = useMemo(() => {
    let current = OC_TITLES[0];
    for (const title of OC_TITLES) {
      if (ocLevel >= title.levelRequired) current = title;
    }
    return current;
  }, [ocLevel]);

  const nextTitleInfo = useMemo(() => {
    const idx = OC_TITLES.findIndex(t => t.levelRequired > ocLevel);
    return idx >= 0 ? OC_TITLES[idx] : null;
  }, [ocLevel]);

  const titleProgress = useMemo(() => {
    if (!nextTitleInfo) return 1;
    const prevTitle = [...OC_TITLES].reverse().find(t => t.levelRequired <= ocLevel) ?? OC_TITLES[0];
    const range = nextTitleInfo.levelRequired - prevTitle.levelRequired;
    const progress = ocLevel - prevTitle.levelRequired;
    return range > 0 ? Math.min(1, progress / range) : 1;
  }, [ocLevel, nextTitleInfo]);

  // ─── Stats Summary ────────────────────────────────────────────────────

  const statsSummary = useMemo(() => {
    const tamedCount = Object.values(ocBeasts).filter(b => b.tamed).length;
    const discoveredCount = Object.values(ocTerritories).filter(t => t.discovered).length;
    const builtCount = Object.values(ocStructures).filter(s => s.built).length;
    const activatedArtifacts = Object.values(ocArtifacts).filter(a => a.activated).length;
    const unlockedAchievements = Object.values(ocAchievements).filter(a => a.unlocked).length;

    return {
      tamedCount,
      discoveredCount,
      builtCount,
      activatedArtifacts,
      unlockedAchievements,
      totalBeasts: OC_BEASTS.length,
      totalTerritories: OC_TERRITORIES.length,
      totalStructures: OC_STRUCTURES.length,
      totalArtifacts: OC_ARTIFACTS.length,
      totalAchievements: OC_ACHIEVEMENTS.length,
    };
  }, [ocBeasts, ocTerritories, ocStructures, ocArtifacts, ocAchievements]);

  const completionStats = useMemo(() => {
    const { tamedCount, discoveredCount, builtCount, activatedArtifacts, unlockedAchievements } = statsSummary;
    const beastPct = (tamedCount / OC_BEASTS.length) * 100;
    const territoryPct = (discoveredCount / OC_TERRITORIES.length) * 100;
    const structurePct = (builtCount / OC_STRUCTURES.length) * 100;
    const artifactPct = (activatedArtifacts / OC_ARTIFACTS.length) * 100;
    const achievementPct = (unlockedAchievements / OC_ACHIEVEMENTS.length) * 100;
    const overallPct = (beastPct + territoryPct + structurePct + artifactPct + achievementPct) / 5;
    return {
      beastPct: Math.round(beastPct),
      territoryPct: Math.round(territoryPct),
      structurePct: Math.round(structurePct),
      artifactPct: Math.round(artifactPct),
      achievementPct: Math.round(achievementPct),
      overallPct: Math.round(overallPct),
    };
  }, [statsSummary]);

  // ─── Enriched Data ────────────────────────────────────────────────────

  const enrichedBeasts = useMemo(() => {
    return OC_BEASTS.map(b => ({
      ...b,
      speciesDef: OC_SPECIES.find(s => s.key === b.species),
      state: ocBeasts[b.id] ?? { tamed: false, bondLevel: 0, tamedAt: null, encounterCount: 0 },
      rarityInfo: OC_RARITIES.find(r => r.key === b.rarity),
    }));
  }, [ocBeasts]);

  const enrichedTerritories = useMemo(() => {
    return OC_TERRITORIES.map(t => ({
      ...t,
      state: ocTerritories[t.id] ?? { discovered: false, explored: false, exploreCount: 0, beastsFound: 0, lastExplored: null },
      materialsInTerritory: OC_MATERIALS.filter(m => m.territoryId === t.id),
      beastsInTerritory: OC_BEASTS.filter(b => b.requiredLevel <= ocLevel && Math.abs(b.requiredLevel - t.unlockLevel) <= 15),
    }));
  }, [ocTerritories, ocLevel]);

  const enrichedStructures = useMemo(() => {
    return OC_STRUCTURES.map(s => ({
      ...s,
      state: ocStructures[s.id] ?? { built: false, level: 0, builtAt: null, lastUpgradedAt: null },
      isMaxLevel: (ocStructures[s.id]?.level ?? 0) >= s.maxLevel,
      currentBonus: (ocStructures[s.id]?.level ?? 0) * s.bonusValue,
    }));
  }, [ocStructures]);

  const enrichedInventory = useMemo(() => {
    return Object.entries(ocMaterials)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const def = OC_MATERIALS.find(m => m.id === id);
        return def ? { ...def, quantity: qty, rarityInfo: OC_RARITIES.find(r => r.key === def.rarity) } : null;
      })
      .filter(Boolean) as (OcMaterialDef & { quantity: number; rarityInfo: OcRarityInfo | undefined })[];
  }, [ocMaterials]);

  // ─── Computed Groupings ────────────────────────────────────────────────

  const beastsByType = useMemo(() => {
    const map: Record<string, typeof enrichedBeasts> = {};
    for (const b of enrichedBeasts) {
      if (!map[b.species]) map[b.species] = [];
      map[b.species].push(b);
    }
    return map;
  }, [enrichedBeasts]);

  const beastsByRarity = useMemo(() => {
    const map: Record<OcRarity, typeof enrichedBeasts> = { common: [], uncommon: [], rare: [], epic: [], legendary: [] };
    for (const b of enrichedBeasts) {
      map[b.rarity].push(b);
    }
    return map;
  }, [enrichedBeasts]);

  const availableCandidates = useMemo(() => {
    return OC_BEASTS.filter(b => b.requiredLevel <= ocLevel && !ocBeasts[b.id]?.tamed);
  }, [ocLevel, ocBeasts]);

  const pendingAchievements = useMemo(() => {
    return OC_ACHIEVEMENTS.filter(a => {
      if (ocAchievements[a.id]?.unlocked) return false;
      let current = 0;
      switch (a.conditionKey) {
        case 'totalTamed': current = ocStats.totalTamed; break;
        case 'totalExplored': current = ocStats.totalExplored; break;
        case 'totalStructuresBuilt': current = ocStats.totalStructuresBuilt; break;
        case 'totalArtifacts': current = ocStats.totalArtifacts; break;
        case 'totalEvents': current = ocStats.totalEvents; break;
        case 'totalCoins': current = ocStats.totalCoins; break;
        case 'totalXp': current = ocStats.totalXp; break;
      }
      return current >= a.targetValue * 0.75;
    });
  }, [ocAchievements, ocStats]);

  const recentEventLog = useMemo(() => {
    return [...ocEventLog].reverse().slice(0, 10).map(entry => {
      const def = OC_EVENTS.find(e => e.id === entry.eventId);
      return { ...entry, eventDef: def ?? null };
    });
  }, [ocEventLog]);

  // ─── Return (Pattern A — all constants directly on the API object) ─────

  return {
    // Constants
    OC_SPECIES,
    OC_RARITIES,
    OC_TITLES,
    OC_TERRITORIES,
    OC_BEASTS,
    OC_MATERIALS,
    OC_STRUCTURES,
    OC_ABILITIES,
    OC_ACHIEVEMENTS,
    OC_ARTIFACTS,
    OC_EVENTS,
    OC_COLOR_THEME,
    OC_MAX_LEVEL,

    // State
    ocLevel,
    ocXp,
    ocCoins,
    ocBeasts,
    ocTerritories,
    ocStructures,
    ocAchievements,
    ocArtifacts,
    ocAbilities,
    ocMaterials,
    ocStats,
    ocEventLog,

    // Core Actions
    tameBeast,
    exploreTerritory,
    buildStructure,
    activateArtifact,
    triggerWildsEvent,
    resetOchreWilds,

    // Extended Actions
    discoverTerritory,
    checkAndClaimAchievements,
    useAbility,

    // Title System
    currentTitleInfo,
    nextTitleInfo,
    titleProgress,

    // Stats
    statsSummary,
    completionStats,

    // Enriched Data
    enrichedBeasts,
    enrichedTerritories,
    enrichedStructures,
    enrichedInventory,

    // Computed
    beastsByType,
    beastsByRarity,
    availableCandidates,
    pendingAchievements,
    recentEventLog,
  };
}
