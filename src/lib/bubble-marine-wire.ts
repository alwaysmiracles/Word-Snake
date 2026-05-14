import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════
// Bubble Marine — 泡泡海洋 : Word Snake Game Wire Module
// Underwater bubble world: explore depths, collect creatures,
// build coral cities, discover secrets.
// ═══════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────
// BM_ EXPORTED CONSTANTS
// ───────────────────────────────────────────────────────────────────

export const BM_AQUA = '#00BCD4';
export const BM_OCEAN_BLUE = '#0277BD';
export const BM_SEAFOAM = '#80CBC4';
export const BM_BUBBLE_WHITE = '#E0F7FA';
export const BM_CORAL_PINK = '#F48FB1';

export const BM_MAX_ENERGY = 100;
export const BM_MAX_OXYGEN = 100;
export const BM_MAX_DEPTH = 9999;
export const BM_MAX_REPUTATION = 10000;
export const BM_STRUCTURE_MAX_LEVEL = 10;
export const BM_CREATURE_TIERS = 5;
export const BM_CREATURES_PER_TIER = 7;
export const BM_TOTAL_CREATURES = BM_CREATURE_TIERS * BM_CREATURES_PER_TIER;

export const BM_RARITY_NAMES = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
] as const;

export const BM_RARITY_COLORS = [
  '#90A4AE',
  '#66BB6A',
  '#42A5F5',
  '#AB47BC',
  '#FFA726',
] as const;

export const BM_RARITY_MULTIPLIERS = [1, 2, 5, 10, 25] as const;

export const BM_TITLES = [
  'Bubble Beginner',
  'Tide Tender',
  'Reef Ranger',
  'Deep Diver',
  'Coral Architect',
  'Abyss Explorer',
  'Leviathan Master',
  'Ocean Sovereign',
] as const;

export const BM_ZONE_NAMES = [
  'Sunlit Shallows',
  'Kelp Forest',
  'Coral Gardens',
  'Twilight Depths',
  'Abyssal Plains',
  'Hydrothermal Vents',
  'Mariana Trench',
  'Bubble Sanctum',
] as const;

// ───────────────────────────────────────────────────────────────────
// STATIC DATA DEFINITIONS
// ───────────────────────────────────────────────────────────────────

const RARITY_COMMON = 0;
const RARITY_UNCOMMON = 1;
const RARITY_RARE = 2;
const RARITY_EPIC = 3;
const RARITY_LEGENDARY = 4;

const ZONE_SUNLIT_SHALLOWS = 0;
const ZONE_KELP_FOREST = 1;
const ZONE_CORAL_GARDENS = 2;
const ZONE_TWILIGHT_DEPTHS = 3;
const ZONE_ABYSSAL_PLAINS = 4;
const ZONE_HYDROTHERMAL_VENTS = 5;
const ZONE_MARIANA_TRENCH = 6;
const ZONE_BUBBLE_SANCTUM = 7;

interface BubbleCreatureDef {
  id: number;
  name: string;
  rarity: number;
  zone: number;
  emoji: string;
  basePower: number;
  description: string;
  bubbleColor: string;
}

const BUBBLE_CREATURES: BubbleCreatureDef[] = [
  // ── Common (Tier 0) ──
  { id: 1, name: 'Puffer Pop', rarity: RARITY_COMMON, zone: ZONE_SUNLIT_SHALLOWS, emoji: '🐡', basePower: 10, description: 'A friendly pufferfish that inflates into a bouncing bubble', bubbleColor: '#A5D6A7' },
  { id: 2, name: 'Shimmer Fin', rarity: RARITY_COMMON, zone: ZONE_SUNLIT_SHALLOWS, emoji: '🐟', basePower: 12, description: 'A tiny fish that leaves sparkle trails in the water', bubbleColor: '#81D4FA' },
  { id: 3, name: 'Bubble Shrimp', rarity: RARITY_COMMON, zone: ZONE_KELP_FOREST, emoji: '🦐', basePower: 11, description: 'A translucent shrimp that lives inside floating bubbles', bubbleColor: '#FFCC80' },
  { id: 4, name: 'Glow Worm', rarity: RARITY_COMMON, zone: ZONE_KELP_FOREST, emoji: '🪱', basePower: 9, description: 'A bioluminescent worm lighting up the dark kelp', bubbleColor: '#CE93D8' },
  { id: 5, name: 'Sand Piper', rarity: RARITY_COMMON, zone: ZONE_SUNLIT_SHALLOWS, emoji: '🐚', basePower: 8, description: 'A shell-dwelling creature that burps tiny bubbles', bubbleColor: '#FFAB91' },
  { id: 6, name: 'Drift Jelly', rarity: RARITY_COMMON, zone: ZONE_CORAL_GARDENS, emoji: '🪸', basePower: 13, description: 'A miniature jellyfish drifting gracefully through coral', bubbleColor: '#80DEEA' },
  { id: 7, name: 'Coral Crab', rarity: RARITY_COMMON, zone: ZONE_CORAL_GARDENS, emoji: '🦀', basePower: 14, description: 'A tiny crab that carries coral fragments on its back', bubbleColor: '#F48FB1' },
  // ── Uncommon (Tier 1) ──
  { id: 8, name: 'Neon Squid', rarity: RARITY_UNCOMMON, zone: ZONE_KELP_FOREST, emoji: '🦑', basePower: 25, description: 'A vividly colored squid that changes patterns rapidly', bubbleColor: '#7E57C2' },
  { id: 9, name: 'Starlight Urchin', rarity: RARITY_UNCOMMON, zone: ZONE_CORAL_GARDENS, emoji: '⭐', basePower: 28, description: 'A sea urchin that reflects light like a prism', bubbleColor: '#FFD54F' },
  { id: 10, name: 'Tide Turtle', rarity: RARITY_UNCOMMON, zone: ZONE_TWILIGHT_DEPTHS, emoji: '🐢', basePower: 30, description: 'An ancient turtle that rides tidal currents effortlessly', bubbleColor: '#66BB6A' },
  { id: 11, name: 'Phantom Ray', rarity: RARITY_UNCOMMON, zone: ZONE_TWILIGHT_DEPTHS, emoji: '🦈', basePower: 32, description: 'A semi-transparent ray that phases through obstacles', bubbleColor: '#90CAF9' },
  { id: 12, name: 'Bubble Seahorse', rarity: RARITY_UNCOMMON, zone: ZONE_CORAL_GARDENS, emoji: '🌊', basePower: 27, description: 'A seahorse that creates bubble spirals to communicate', bubbleColor: '#4DD0E1' },
  { id: 13, name: 'Ember Eel', rarity: RARITY_UNCOMMON, zone: ZONE_HYDROTHERMAL_VENTS, emoji: '🐍', basePower: 35, description: 'A heat-resistant eel that thrives near volcanic vents', bubbleColor: '#FF7043' },
  { id: 14, name: 'Crystal Clam', rarity: RARITY_UNCOMMON, zone: ZONE_CORAL_GARDENS, emoji: '💎', basePower: 29, description: 'A clam that grows crystalline pearls inside bubbles', bubbleColor: '#B39DDB' },
  // ── Rare (Tier 2) ──
  { id: 15, name: 'Storm Whale', rarity: RARITY_RARE, zone: ZONE_TWILIGHT_DEPTHS, emoji: '🐋', basePower: 60, description: 'A massive whale that summons storms with its song', bubbleColor: '#42A5F5' },
  { id: 16, name: 'Abyssal Angler', rarity: RARITY_RARE, zone: ZONE_ABYSSAL_PLAINS, emoji: '🐡', basePower: 65, description: 'A deep anglerfish with a hypnotic glowing lure', bubbleColor: '#26C6DA' },
  { id: 17, name: 'Cloud Octopus', rarity: RARITY_RARE, zone: ZONE_TWILIGHT_DEPTHS, emoji: '🐙', basePower: 58, description: 'An octopus that releases ink clouds shaped like galaxies', bubbleColor: '#7986CB' },
  { id: 18, name: 'Frost Narwhal', rarity: RARITY_RARE, zone: ZONE_ABYSSAL_PLAINS, emoji: '🦄', basePower: 70, description: 'A narwhal whose horn freezes water into bubble sculptures', bubbleColor: '#80DEEA' },
  { id: 19, name: 'Magma Turtle', rarity: RARITY_RARE, zone: ZONE_HYDROTHERMAL_VENTS, emoji: '🌋', basePower: 68, description: 'A volcanic turtle with a shell of cooling magma', bubbleColor: '#FF5722' },
  { id: 20, name: 'Pearl Dragon', rarity: RARITY_RARE, zone: ZONE_ABYSSAL_PLAINS, emoji: '🐉', basePower: 72, description: 'A small dragon that hoards pearls in underwater caves', bubbleColor: '#E1BEE7' },
  { id: 21, name: 'Tidal Phoenix', rarity: RARITY_RARE, zone: ZONE_HYDROTHERMAL_VENTS, emoji: '🔥', basePower: 75, description: 'A bird of flame reborn from underwater geysers', bubbleColor: '#FF8A65' },
  // ── Epic (Tier 3) ──
  { id: 22, name: 'Leviathan Serpent', rarity: RARITY_EPIC, zone: ZONE_ABYSSAL_PLAINS, emoji: '🐍', basePower: 130, description: 'An ancient sea serpent that circles the ocean floor', bubbleColor: '#00695C' },
  { id: 23, name: 'Aurora Kraken', rarity: RARITY_EPIC, zone: ZONE_MARIANA_TRENCH, emoji: '🦑', basePower: 140, description: 'A colossal kraken with bioluminescent aurora tentacles', bubbleColor: '#4A148C' },
  { id: 24, name: 'Void Manta', rarity: RARITY_EPIC, zone: ZONE_MARIANA_TRENCH, emoji: '🦈', basePower: 135, description: 'A manta ray that swims between dimensions', bubbleColor: '#1A237E' },
  { id: 25, name: 'Coral Hydra', rarity: RARITY_EPIC, zone: ZONE_ABYSSAL_PLAINS, emoji: '🪸', basePower: 128, description: 'A multi-headed hydra made of living coral branches', bubbleColor: '#AD1457' },
  { id: 26, name: 'Storm Leviathan', rarity: RARITY_EPIC, zone: ZONE_MARIANA_TRENCH, emoji: '🐋', basePower: 145, description: 'A leviathan that creates whirlpools and typhoons', bubbleColor: '#0D47A1' },
  { id: 27, name: 'Crystal Siren', rarity: RARITY_EPIC, zone: ZONE_HYDROTHERMAL_VENTS, emoji: '💎', basePower: 138, description: 'A mesmerizing siren whose voice crystallizes water', bubbleColor: '#6A1B9A' },
  { id: 28, name: 'Depths Colossus', rarity: RARITY_EPIC, zone: ZONE_MARIANA_TRENCH, emoji: '🌋', basePower: 150, description: 'A gargantuan creature sleeping beneath the deepest trenches', bubbleColor: '#BF360C' },
  // ── Legendary (Tier 4) ──
  { id: 29, name: 'Ocean Sovereign', rarity: RARITY_LEGENDARY, zone: ZONE_BUBBLE_SANCTUM, emoji: '👑', basePower: 300, description: 'The ruler of all seas, master of every current', bubbleColor: '#FFD600' },
  { id: 30, name: 'Bubble Oracle', rarity: RARITY_LEGENDARY, zone: ZONE_BUBBLE_SANCTUM, emoji: '🔮', basePower: 280, description: 'A timeless oracle that sees the future in bubbles', bubbleColor: '#E040FB' },
  { id: 31, name: 'Primordial Whale', rarity: RARITY_LEGENDARY, zone: ZONE_BUBBLE_SANCTUM, emoji: '🐋', basePower: 310, description: 'The first whale, older than the oceans themselves', bubbleColor: '#00E5FF' },
  { id: 32, name: 'Abyssal Phoenix', rarity: RARITY_LEGENDARY, zone: ZONE_BUBBLE_SANCTUM, emoji: '🔥', basePower: 295, description: 'A phoenix of the deep that ignites hydrothermal vents', bubbleColor: '#FF6D00' },
  { id: 33, name: 'Eternal Coral', rarity: RARITY_LEGENDARY, zone: ZONE_BUBBLE_SANCTUM, emoji: '🌸', basePower: 270, description: 'The living heart of all coral, connected to every reef', bubbleColor: '#F50057' },
  { id: 34, name: 'Tide Titan', rarity: RARITY_LEGENDARY, zone: ZONE_BUBBLE_SANCTUM, emoji: '🌊', basePower: 320, description: 'A titan that controls the moon and tides with its will', bubbleColor: '#304FFE' },
  { id: 35, name: 'Void Leviathan', rarity: RARITY_LEGENDARY, zone: ZONE_BUBBLE_SANCTUM, emoji: '🐉', basePower: 350, description: 'The ultimate being of the deep, born from the void between oceans', bubbleColor: '#AA00FF' },
];

// ── 8 Ocean Zones ──

interface OceanZoneDef {
  id: number;
  name: string;
  depthRange: [number, number];
  requiredTitle: number;
  baseOxygenCost: number;
  description: string;
  ambientColor: string;
  bgGradient: string;
  creaturesAvailable: number[];
}

const OCEAN_ZONES: OceanZoneDef[] = [
  {
    id: 0,
    name: 'Sunlit Shallows',
    depthRange: [0, 200],
    requiredTitle: 0,
    baseOxygenCost: 5,
    description: 'Warm, crystal-clear waters teeming with gentle bubble creatures. Perfect for beginners.',
    ambientColor: '#B2EBF2',
    bgGradient: 'linear-gradient(180deg, #E0F7FA 0%, #80DEEA 50%, #4DD0E1 100%)',
    creaturesAvailable: [1, 2, 5],
  },
  {
    id: 1,
    name: 'Kelp Forest',
    depthRange: [200, 500],
    requiredTitle: 0,
    baseOxygenCost: 10,
    description: 'Towering kelp forests sway in the current, hiding creatures in their leafy embrace.',
    ambientColor: '#A5D6A7',
    bgGradient: 'linear-gradient(180deg, #C8E6C9 0%, #66BB6A 50%, #43A047 100%)',
    creaturesAvailable: [3, 4, 8, 12],
  },
  {
    id: 2,
    name: 'Coral Gardens',
    depthRange: [500, 800],
    requiredTitle: 1,
    baseOxygenCost: 15,
    description: 'A kaleidoscopic reef of living coral, home to the most colorful creatures.',
    ambientColor: '#F48FB1',
    bgGradient: 'linear-gradient(180deg, #FCE4EC 0%, #F48FB1 50%, #EC407A 100%)',
    creaturesAvailable: [6, 7, 9, 12, 14],
  },
  {
    id: 3,
    name: 'Twilight Depths',
    depthRange: [800, 1500],
    requiredTitle: 2,
    baseOxygenCost: 25,
    description: 'Where sunlight fades into perpetual twilight. Strange shadows move in the gloom.',
    ambientColor: '#5C6BC0',
    bgGradient: 'linear-gradient(180deg, #9FA8DA 0%, #5C6BC0 50%, #3949AB 100%)',
    creaturesAvailable: [10, 11, 15, 17],
  },
  {
    id: 4,
    name: 'Abyssal Plains',
    depthRange: [1500, 4000],
    requiredTitle: 3,
    baseOxygenCost: 35,
    description: 'The vast, dark ocean floor. Bioluminescent creatures light the eternal night.',
    ambientColor: '#263238',
    bgGradient: 'linear-gradient(180deg, #37474F 0%, #263238 50%, #1B1B2F 100%)',
    creaturesAvailable: [16, 18, 20, 22, 25],
  },
  {
    id: 5,
    name: 'Hydrothermal Vents',
    depthRange: [4000, 6000],
    requiredTitle: 4,
    baseOxygenCost: 45,
    description: 'Volcanic plumes superheat the water. Only the hardiest creatures survive here.',
    ambientColor: '#FF7043',
    bgGradient: 'linear-gradient(180deg, #FF8A65 0%, #FF5722 50%, #BF360C 100%)',
    creaturesAvailable: [13, 19, 21, 27],
  },
  {
    id: 6,
    name: 'Mariana Trench',
    depthRange: [6000, 9000],
    requiredTitle: 5,
    baseOxygenCost: 60,
    description: 'The deepest known point. Crushing pressure and absolute darkness guard its secrets.',
    ambientColor: '#0D1B2A',
    bgGradient: 'linear-gradient(180deg, #1B2838 0%, #0D1B2A 50%, #050A14 100%)',
    creaturesAvailable: [23, 24, 26, 28],
  },
  {
    id: 7,
    name: 'Bubble Sanctum',
    depthRange: [9000, 9999],
    requiredTitle: 6,
    baseOxygenCost: 80,
    description: 'A mythical realm of pure bubble energy. The legendary creatures dwell here.',
    ambientColor: '#AA00FF',
    bgGradient: 'linear-gradient(180deg, #CE93D8 0%, #AA00FF 50%, #6200EA 100%)',
    creaturesAvailable: [29, 30, 31, 32, 33, 34, 35],
  },
];

// ── 30 Diving Equipment ──

interface EquipmentDef {
  id: number;
  name: string;
  emoji: string;
  type: 'suit' | 'fin' | 'light' | 'tank' | 'scanner' | 'net';
  rarity: number;
  oxygenBonus: number;
  energyBonus: number;
  depthBonus: number;
  collectBonus: number;
  description: string;
  cost: number;
}

const DIVING_EQUIPMENT: EquipmentDef[] = [
  { id: 1, name: 'Bubble Suit', emoji: '🫧', type: 'suit', rarity: 0, oxygenBonus: 5, energyBonus: 0, depthBonus: 0, collectBonus: 0, description: 'A basic wetsuit coated in bubble resin', cost: 50 },
  { id: 2, name: 'Kelp Weave Fins', emoji: '🧜', type: 'fin', rarity: 0, oxygenBonus: 0, energyBonus: 5, depthBonus: 0, collectBonus: 0, description: 'Fins woven from enchanted kelp fibers', cost: 60 },
  { id: 3, name: 'Sea Lantern', emoji: '🔦', type: 'light', rarity: 0, oxygenBonus: 0, energyBonus: 0, depthBonus: 50, collectBonus: 0, description: 'A waterproof lantern powered by bioluminescence', cost: 45 },
  { id: 4, name: 'Oxygen Canister', emoji: '🫙', type: 'tank', rarity: 0, oxygenBonus: 10, energyBonus: 0, depthBonus: 0, collectBonus: 0, description: 'A standard oxygen tank for shallow dives', cost: 55 },
  { id: 5, name: 'Basic Scanner', emoji: '📡', type: 'scanner', rarity: 0, oxygenBonus: 0, energyBonus: 0, depthBonus: 0, collectBonus: 1, description: 'Detects nearby bubble creatures', cost: 40 },
  { id: 6, name: 'Coral Net', emoji: '🕸️', type: 'net', rarity: 0, oxygenBonus: 0, energyBonus: 0, depthBonus: 0, collectBonus: 2, description: 'A net made from flexible coral strands', cost: 70 },
  { id: 7, name: 'Deep Dive Suit', emoji: '🤿', type: 'suit', rarity: 1, oxygenBonus: 12, energyBonus: 5, depthBonus: 100, collectBonus: 0, description: 'Pressurized suit for deeper exploration', cost: 200 },
  { id: 8, name: 'Tidal Fins', emoji: '🦭', type: 'fin', rarity: 1, oxygenBonus: 0, energyBonus: 10, depthBonus: 50, collectBonus: 0, description: 'Fins that harness tidal energy', cost: 180 },
  { id: 9, name: 'Glow Probe', emoji: '💡', type: 'light', rarity: 1, oxygenBonus: 0, energyBonus: 0, depthBonus: 150, collectBonus: 1, description: 'A probe that illuminates dark waters', cost: 160 },
  { id: 10, name: 'Pressure Tank', emoji: '🛢️', type: 'tank', rarity: 1, oxygenBonus: 20, energyBonus: 0, depthBonus: 0, collectBonus: 0, description: 'High-pressure oxygen storage', cost: 220 },
  { id: 11, name: 'Sonar Scanner', emoji: '🔊', type: 'scanner', rarity: 1, oxygenBonus: 0, energyBonus: 0, depthBonus: 100, collectBonus: 3, description: 'Sonar that tracks creature movements', cost: 190 },
  { id: 12, name: 'Silk Net', emoji: '🕸️', type: 'net', rarity: 1, oxygenBonus: 0, energyBonus: 0, depthBonus: 0, collectBonus: 5, description: 'Ultra-fine net for capturing swift creatures', cost: 210 },
  { id: 13, name: 'Abyssal Armor', emoji: '🛡️', type: 'suit', rarity: 2, oxygenBonus: 20, energyBonus: 10, depthBonus: 500, collectBonus: 2, description: 'Armor that withstands crushing deep-sea pressure', cost: 800 },
  { id: 14, name: 'Whale Fins', emoji: '🐋', type: 'fin', rarity: 2, oxygenBonus: 5, energyBonus: 20, depthBonus: 200, collectBonus: 0, description: 'Fins modeled after whale flipper aerodynamics', cost: 750 },
  { id: 15, name: 'Aurora Light', emoji: '🌈', type: 'light', rarity: 2, oxygenBonus: 0, energyBonus: 0, depthBonus: 1000, collectBonus: 2, description: 'Creates aurora-like light in the deepest trenches', cost: 700 },
  { id: 16, name: 'Crystal Tank', emoji: '💎', type: 'tank', rarity: 2, oxygenBonus: 35, energyBonus: 5, depthBonus: 0, collectBonus: 0, description: 'A tank carved from deep-sea crystals', cost: 850 },
  { id: 17, name: 'Psychic Scanner', emoji: '🔮', type: 'scanner', rarity: 2, oxygenBonus: 0, energyBonus: 0, depthBonus: 500, collectBonus: 5, description: 'Reads the thoughts of nearby creatures', cost: 780 },
  { id: 18, name: 'Void Net', emoji: '🌀', type: 'net', rarity: 2, oxygenBonus: 0, energyBonus: 0, depthBonus: 0, collectBonus: 8, description: 'A net that phases through water resistance', cost: 820 },
  { id: 19, name: 'Leviathan Shell', emoji: '🐉', type: 'suit', rarity: 3, oxygenBonus: 30, energyBonus: 20, depthBonus: 2000, collectBonus: 5, description: 'Armor forged from leviathan scales', cost: 3000 },
  { id: 20, name: 'Phoenix Propulsion', emoji: '🔥', type: 'fin', rarity: 3, oxygenBonus: 10, energyBonus: 40, depthBonus: 1000, collectBonus: 0, description: 'Fins powered by hydrothermal phoenix fire', cost: 2800 },
  { id: 21, name: 'Sun Core', emoji: '☀️', type: 'light', rarity: 3, oxygenBonus: 0, energyBonus: 15, depthBonus: 5000, collectBonus: 3, description: 'A miniature sun that illuminates all depths', cost: 3200 },
  { id: 22, name: 'Eternal Flask', emoji: '⚗️', type: 'tank', rarity: 3, oxygenBonus: 50, energyBonus: 10, depthBonus: 500, collectBonus: 0, description: 'A flask that generates oxygen from water', cost: 2900 },
  { id: 23, name: 'Oracle Lens', emoji: '👁️', type: 'scanner', rarity: 3, oxygenBonus: 0, energyBonus: 5, depthBonus: 2000, collectBonus: 10, description: 'Sees through illusions to find hidden creatures', cost: 3100 },
  { id: 24, name: 'Cosmic Web', emoji: '🌌', type: 'net', rarity: 3, oxygenBonus: 0, energyBonus: 0, depthBonus: 0, collectBonus: 15, description: 'A net woven from cosmic threads', cost: 3300 },
  { id: 25, name: 'Bubble Crown Armor', emoji: '👑', type: 'suit', rarity: 4, oxygenBonus: 50, energyBonus: 30, depthBonus: 5000, collectBonus: 10, description: 'The ultimate diving armor, blessed by the Ocean Sovereign', cost: 10000 },
  { id: 26, name: 'Tide Titan Fins', emoji: '🌊', type: 'fin', rarity: 4, oxygenBonus: 20, energyBonus: 60, depthBonus: 3000, collectBonus: 5, description: 'Fins that command the tides themselves', cost: 9500 },
  { id: 27, name: 'Primordial Flame', emoji: '✨', type: 'light', rarity: 4, oxygenBonus: 0, energyBonus: 25, depthBonus: 9999, collectBonus: 5, description: 'The first light ever to shine underwater', cost: 11000 },
  { id: 28, name: 'Void Breather', emoji: '🌀', type: 'tank', rarity: 4, oxygenBonus: 99, energyBonus: 20, depthBonus: 1000, collectBonus: 0, description: 'Breathe the void itself — unlimited oxygen', cost: 9800 },
  { id: 29, name: 'All-Seeing Eye', emoji: '👁️‍🗨️', type: 'scanner', rarity: 4, oxygenBonus: 0, energyBonus: 10, depthBonus: 5000, collectBonus: 20, description: 'Perceives every creature in every ocean', cost: 10500 },
  { id: 30, name: 'Fate Net', emoji: '🕸️', type: 'net', rarity: 4, oxygenBonus: 0, energyBonus: 0, depthBonus: 0, collectBonus: 30, description: 'Catches creatures that were destined to be found', cost: 12000 },
];

// ── 25 Coral Structures (upgradeable Lv10) ──

interface CoralStructureDef {
  id: number;
  name: string;
  emoji: string;
  category: 'habitat' | 'defense' | 'resource' | 'research' | 'beauty';
  baseEffect: number;
  effectPerLevel: number;
  description: string;
  baseCost: number;
  costMultiplier: number;
}

const CORAL_STRUCTURES: CoralStructureDef[] = [
  { id: 1, name: 'Bubble Nest', emoji: '🫧', category: 'habitat', baseEffect: 2, effectPerLevel: 1, description: 'Shelter for small bubble creatures', baseCost: 30, costMultiplier: 1.5 },
  { id: 2, name: 'Coral Tower', emoji: '🏰', category: 'defense', baseEffect: 5, effectPerLevel: 3, description: 'A tall coral spire that deters predators', baseCost: 80, costMultiplier: 1.6 },
  { id: 3, name: 'Pearl Refinery', emoji: '🐚', category: 'resource', baseEffect: 3, effectPerLevel: 2, description: 'Extracts pearls from oyster beds', baseCost: 60, costMultiplier: 1.5 },
  { id: 4, name: 'Research Pod', emoji: '🔬', category: 'research', baseEffect: 5, effectPerLevel: 3, description: 'Studies bubble creature behavior', baseCost: 100, costMultiplier: 1.7 },
  { id: 5, name: 'Coral Garden', emoji: '🌺', category: 'beauty', baseEffect: 2, effectPerLevel: 1, description: 'A beautiful garden of rare corals', baseCost: 40, costMultiplier: 1.4 },
  { id: 6, name: 'Deep Shelter', emoji: '🕳️', category: 'habitat', baseEffect: 8, effectPerLevel: 4, description: 'Pressurized shelter for deep-sea creatures', baseCost: 200, costMultiplier: 1.8 },
  { id: 7, name: 'Barrier Reef Wall', emoji: '🧱', category: 'defense', baseEffect: 10, effectPerLevel: 5, description: 'A massive reef wall protecting the city', baseCost: 250, costMultiplier: 1.7 },
  { id: 8, name: 'Kelp Biofuel Plant', emoji: '⚡', category: 'resource', baseEffect: 7, effectPerLevel: 3, description: 'Converts kelp into clean energy', baseCost: 150, costMultiplier: 1.6 },
  { id: 9, name: 'Sonar Station', emoji: '📡', category: 'research', baseEffect: 8, effectPerLevel: 4, description: 'Maps the ocean floor with sonar', baseCost: 180, costMultiplier: 1.7 },
  { id: 10, name: 'Bioluminescent Park', emoji: '✨', category: 'beauty', baseEffect: 5, effectPerLevel: 3, description: 'A park glowing with living lights', baseCost: 120, costMultiplier: 1.5 },
  { id: 11, name: 'Leviathan Pen', emoji: '🐋', category: 'habitat', baseEffect: 15, effectPerLevel: 8, description: 'Houses massive sea creatures', baseCost: 500, costMultiplier: 2.0 },
  { id: 12, name: 'Whirlpool Gate', emoji: '🌀', category: 'defense', baseEffect: 20, effectPerLevel: 10, description: 'A controlled whirlpool that blocks intruders', baseCost: 600, costMultiplier: 2.0 },
  { id: 13, name: 'Crystal Mine', emoji: '💎', category: 'resource', baseEffect: 12, effectPerLevel: 6, description: 'Mines deep-sea crystals for resources', baseCost: 450, costMultiplier: 1.8 },
  { id: 14, name: 'Abyssal Lab', emoji: '🧪', category: 'research', baseEffect: 15, effectPerLevel: 7, description: 'Conducts experiments in extreme conditions', baseCost: 550, costMultiplier: 1.9 },
  { id: 15, name: 'Rainbow Reef', emoji: '🌈', category: 'beauty', baseEffect: 10, effectPerLevel: 5, description: 'A reef that displays every color of the spectrum', baseCost: 300, costMultiplier: 1.7 },
  { id: 16, name: 'Phoenix Hatchery', emoji: '🔥', category: 'habitat', baseEffect: 25, effectPerLevel: 12, description: 'Hatches rare creatures from volcanic eggs', baseCost: 1200, costMultiplier: 2.2 },
  { id: 17, name: 'Pressure Shield', emoji: '🛡️', category: 'defense', baseEffect: 30, effectPerLevel: 15, description: 'Generates a shield against water pressure', baseCost: 1000, costMultiplier: 2.1 },
  { id: 18, name: 'Magma Forge', emoji: '🔨', category: 'resource', baseEffect: 20, effectPerLevel: 10, description: 'Forges equipment from volcanic metals', baseCost: 900, costMultiplier: 2.0 },
  { id: 19, name: 'Dimensional Portal', emoji: '🌀', category: 'research', baseEffect: 25, effectPerLevel: 12, description: 'Opens portals to alternate ocean dimensions', baseCost: 1500, costMultiplier: 2.3 },
  { id: 20, name: 'Eternal Aquarium', emoji: '🐠', category: 'beauty', baseEffect: 15, effectPerLevel: 8, description: 'A self-sustaining aquarium of wonders', baseCost: 800, costMultiplier: 1.9 },
  { id: 21, name: 'Bubble Sanctum Core', emoji: '💫', category: 'habitat', baseEffect: 40, effectPerLevel: 20, description: 'The heart of the Bubble Sanctum', baseCost: 3000, costMultiplier: 2.5 },
  { id: 22, name: 'Ocean Sovereign Throne', emoji: '👑', category: 'defense', baseEffect: 50, effectPerLevel: 25, description: 'The seat of oceanic power', baseCost: 5000, costMultiplier: 2.5 },
  { id: 23, name: 'Pearl Genesis Chamber', emoji: '⚪', category: 'resource', baseEffect: 35, effectPerLevel: 18, description: 'Generates pearls from pure bubble energy', baseCost: 4000, costMultiplier: 2.4 },
  { id: 24, name: 'Oracle Temple', emoji: '🏛️', category: 'research', baseEffect: 45, effectPerLevel: 22, description: 'Where the Bubble Oracle shares visions', baseCost: 6000, costMultiplier: 2.6 },
  { id: 25, name: 'Coral World Tree', emoji: '🌳', category: 'beauty', baseEffect: 30, effectPerLevel: 15, description: 'A legendary coral tree that connects all zones', baseCost: 3500, costMultiplier: 2.3 },
];

// ── 22 Sea Abilities ──

interface SeaAbilityDef {
  id: number;
  name: string;
  emoji: string;
  type: 'active' | 'passive';
  rarity: number;
  energyCost: number;
  cooldown: number;
  effect: string;
  description: string;
}

const SEA_ABILITIES: SeaAbilityDef[] = [
  { id: 1, name: 'Bubble Boost', emoji: '🫧', type: 'active', rarity: 0, energyCost: 5, cooldown: 30, effect: 'speed', description: 'Surround yourself with bubbles for a speed boost' },
  { id: 2, name: 'Sonar Ping', emoji: '📡', type: 'active', rarity: 0, energyCost: 8, cooldown: 45, effect: 'reveal', description: 'Send out a sonar pulse to reveal nearby creatures' },
  { id: 3, name: 'Tidal Stream', emoji: '🌊', type: 'active', rarity: 0, energyCost: 10, cooldown: 60, effect: 'transport', description: 'Ride a tidal stream to a random nearby location' },
  { id: 4, name: 'Coral Shield', emoji: '🛡️', type: 'active', rarity: 1, energyCost: 12, cooldown: 60, effect: 'protect', description: 'Generate a coral barrier that absorbs damage' },
  { id: 5, name: 'Ink Cloud', emoji: '🌑', type: 'active', rarity: 1, energyCost: 15, cooldown: 90, effect: 'escape', description: 'Release a cloud of ink to escape danger' },
  { id: 6, name: 'Healing Springs', emoji: '💧', type: 'active', rarity: 1, energyCost: 20, cooldown: 120, effect: 'heal', description: 'Tap into underwater thermal springs to restore health' },
  { id: 7, name: 'Gill Adaptation', emoji: '🫁', type: 'passive', rarity: 0, energyCost: 0, cooldown: 0, effect: 'oxygen_regen', description: 'Passively regenerate oxygen faster' },
  { id: 8, name: 'Pressure Tolerance', emoji: '💎', type: 'passive', rarity: 1, energyCost: 0, cooldown: 0, effect: 'depth_resist', description: 'Resist deeper water pressure naturally' },
  { id: 9, name: 'Bubble Magnetism', emoji: '🧲', type: 'passive', rarity: 1, energyCost: 0, cooldown: 0, effect: 'attract', description: 'Attract nearby bubble creatures toward you' },
  { id: 10, name: 'Deep Sense', emoji: '👁️', type: 'passive', rarity: 2, energyCost: 0, cooldown: 0, effect: 'awareness', description: 'Sense creatures and dangers within a large radius' },
  { id: 11, name: 'Whale Song', emoji: '🎵', type: 'active', rarity: 2, energyCost: 25, cooldown: 180, effect: 'calm', description: 'Sing like a whale to calm aggressive creatures' },
  { id: 12, name: 'Maelstrom', emoji: '🌀', type: 'active', rarity: 2, energyCost: 30, cooldown: 300, effect: 'area_attack', description: 'Create a powerful whirlpool that damages enemies' },
  { id: 13, name: 'Bioluminescence', emoji: '✨', type: 'active', rarity: 2, energyCost: 15, cooldown: 90, effect: 'illuminate', description: 'Light up a massive area with bioluminescent glow' },
  { id: 14, name: 'Current Rider', emoji: '🏄', type: 'passive', rarity: 2, energyCost: 0, cooldown: 0, effect: 'energy_save', description: 'Consume less energy when riding ocean currents' },
  { id: 15, name: 'Abyssal Call', emoji: '📢', type: 'active', rarity: 3, energyCost: 40, cooldown: 600, effect: 'summon', description: 'Call a friendly abyssal creature to aid you' },
  { id: 16, name: 'Kraken Grip', emoji: '🦑', type: 'active', rarity: 3, energyCost: 35, cooldown: 300, effect: 'restrain', description: 'Summon phantom tentacles to restrain targets' },
  { id: 17, name: 'Void Phase', emoji: '👻', type: 'active', rarity: 3, energyCost: 50, cooldown: 600, effect: 'invincible', description: 'Phase into the void, becoming invulnerable briefly' },
  { id: 18, name: 'Leviathan Aura', emoji: '🐋', type: 'passive', rarity: 3, energyCost: 0, cooldown: 0, effect: 'intimidate', description: 'Passive aura that makes creatures more docile' },
  { id: 19, name: 'Sovereign Command', emoji: '👑', type: 'active', rarity: 4, energyCost: 60, cooldown: 1200, effect: 'control', description: 'Command any sea creature to obey temporarily' },
  { id: 20, name: 'Tidal Surge', emoji: '🌊', type: 'active', rarity: 4, energyCost: 55, cooldown: 900, effect: 'devastate', description: 'Unleash a catastrophic tidal wave' },
  { id: 21, name: 'Bubble Resurrection', emoji: '💫', type: 'active', rarity: 4, energyCost: 80, cooldown: 1800, effect: 'revive', description: 'Encase yourself in a bubble and regenerate fully' },
  { id: 22, name: 'Ocean Heartbeat', emoji: '💙', type: 'passive', rarity: 4, energyCost: 0, cooldown: 0, effect: 'all_boost', description: 'Your heartbeat syncs with the ocean, boosting all abilities' },
];

// ── 18 Achievements ──

interface AchievementDef {
  id: number;
  name: string;
  emoji: string;
  description: string;
  conditionType: 'collect' | 'depth' | 'zone' | 'structure' | 'creature_rarity' | 'release' | 'explore' | 'title' | 'reputation';
  conditionValue: number;
  reward: { type: 'energy' | 'oxygen' | 'reputation' | 'title'; amount: number };
}

const ACHIEVEMENTS: AchievementDef[] = [
  { id: 1, name: 'First Bubble', emoji: '🫧', description: 'Collect your first bubble creature', conditionType: 'collect', conditionValue: 1, reward: { type: 'energy', amount: 10 } },
  { id: 2, name: 'Collector Initiate', emoji: '📚', description: 'Collect 5 different bubble creatures', conditionType: 'collect', conditionValue: 5, reward: { type: 'energy', amount: 20 } },
  { id: 3, name: 'Deep Diver', emoji: '🤿', description: 'Reach a depth of 500 meters', conditionType: 'depth', conditionValue: 500, reward: { type: 'oxygen', amount: 15 } },
  { id: 4, name: 'Zone Pioneer', emoji: '🗺️', description: 'Explore 3 different ocean zones', conditionType: 'zone', conditionValue: 3, reward: { type: 'reputation', amount: 50 } },
  { id: 5, name: 'Coral Builder', emoji: '🏗️', description: 'Build your first coral structure', conditionType: 'structure', conditionValue: 1, reward: { type: 'reputation', amount: 30 } },
  { id: 6, name: 'Rare Find', emoji: '💎', description: 'Collect a rare tier creature', conditionType: 'creature_rarity', conditionValue: 2, reward: { type: 'energy', amount: 30 } },
  { id: 7, name: 'Gentle Release', emoji: '🕊️', description: 'Release 10 creatures back to the ocean', conditionType: 'release', conditionValue: 10, reward: { type: 'reputation', amount: 100 } },
  { id: 8, name: 'Abyss Walker', emoji: '🕳️', description: 'Reach a depth of 4000 meters', conditionType: 'depth', conditionValue: 4000, reward: { type: 'oxygen', amount: 30 } },
  { id: 9, name: 'Epic Discovery', emoji: '🌟', description: 'Collect an epic tier creature', conditionType: 'creature_rarity', conditionValue: 3, reward: { type: 'energy', amount: 50 } },
  { id: 10, name: 'Zoned Out', emoji: '🌍', description: 'Explore all 8 ocean zones', conditionType: 'zone', conditionValue: 8, reward: { type: 'title', amount: 3 } },
  { id: 11, name: 'Coral Architect', emoji: '🏛️', description: 'Upgrade a coral structure to level 5', conditionType: 'structure', conditionValue: 5, reward: { type: 'reputation', amount: 200 } },
  { id: 12, name: 'Bestiary Half', emoji: '📖', description: 'Collect 18 different bubble creatures', conditionType: 'collect', conditionValue: 18, reward: { type: 'energy', amount: 50 } },
  { id: 13, name: 'Champion Diver', emoji: '🏅', description: 'Reach a depth of 9000 meters', conditionType: 'depth', conditionValue: 9000, reward: { type: 'oxygen', amount: 50 } },
  { id: 14, name: 'Legendary!', emoji: '👑', description: 'Collect a legendary tier creature', conditionType: 'creature_rarity', conditionValue: 4, reward: { type: 'title', amount: 4 } },
  { id: 15, name: 'Coral Metropolis', emoji: '🏙️', description: 'Build 10 coral structures', conditionType: 'structure', conditionValue: 10, reward: { type: 'reputation', amount: 500 } },
  { id: 16, name: 'Full Bestiary', emoji: '📚', description: 'Collect all 35 bubble creatures', conditionType: 'collect', conditionValue: 35, reward: { type: 'title', amount: 6 } },
  { id: 17, name: 'Ocean Guardian', emoji: '🛡️', description: 'Reach Ocean Sovereign title', conditionType: 'title', conditionValue: 7, reward: { type: 'energy', amount: 100 } },
  { id: 18, name: 'Reef Legend', emoji: '🏆', description: 'Accumulate 5000 coral reputation', conditionType: 'reputation', conditionValue: 5000, reward: { type: 'title', amount: 7 } },
];

// ── 8 Titles ──

const TITLE_THRESHOLDS = [
  { index: 0, name: BM_TITLES[0], minReputation: 0, minDepth: 0, minCreatures: 0 },
  { index: 1, name: BM_TITLES[1], minReputation: 50, minDepth: 200, minCreatures: 3 },
  { index: 2, name: BM_TITLES[2], minReputation: 200, minDepth: 500, minCreatures: 7 },
  { index: 3, name: BM_TITLES[3], minReputation: 500, minDepth: 1500, minCreatures: 12 },
  { index: 4, name: BM_TITLES[4], minReputation: 1200, minDepth: 4000, minCreatures: 18 },
  { index: 5, name: BM_TITLES[5], minReputation: 2500, minDepth: 6000, minCreatures: 24 },
  { index: 6, name: BM_TITLES[6], minReputation: 5000, minDepth: 9000, minCreatures: 30 },
  { index: 7, name: BM_TITLES[7], minReputation: 8000, minDepth: 9999, minCreatures: 35 },
];

// ───────────────────────────────────────────────────────────────────
// INTERNAL TYPES
// ───────────────────────────────────────────────────────────────────

interface CollectedCreature {
  creatureId: number;
  count: number;
  firstCaughtAt: number;
  lastCaughtAt: number;
  released: number;
}

interface OwnedEquipment {
  equipmentId: number;
  equipped: boolean;
  durability: number;
  acquiredAt: number;
}

interface BuiltStructure {
  structureId: number;
  level: number;
  builtAt: number;
  lastUpgradeAt: number;
}

interface UnlockedAbility {
  abilityId: number;
  unlockedAt: number;
  lastUsedAt: number;
  currentCooldown: number;
}

interface EarnedAchievement {
  achievementId: number;
  earnedAt: number;
  claimed: boolean;
}

interface DailyDiveTask {
  id: number;
  description: string;
  target: number;
  progress: number;
  rewardType: 'energy' | 'oxygen' | 'reputation';
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: number;
}

interface BubbleMarineState {
  creatures: CollectedCreature[];
  zones: boolean[]; // explored flags per zone
  equipment: OwnedEquipment[];
  structures: BuiltStructure[];
  abilities: UnlockedAbility[];
  achievements: EarnedAchievement[];
  currentZone: number;
  bubbleEnergy: number;
  oxygenLevel: number;
  depthReached: number;
  currentDepth: number;
  creaturesCollected: number; // unique count
  totalCaught: number;
  totalReleased: number;
  titleIndex: number;
  coralReputation: number;
  waterPressure: number;
  dailyDiveTask: DailyDiveTask | null;
  lastDailyReset: number;
  totalDives: number;
  totalPlayTime: number;
  sessionStart: number;
}

// ───────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS (pure, no hooks, no "use" prefix)
// ───────────────────────────────────────────────────────────────────

function createInitialState(): BubbleMarineState {
  return {
    creatures: [],
    zones: [true, false, false, false, false, false, false, false],
    equipment: [],
    structures: [],
    abilities: [],
    achievements: [],
    currentZone: 0,
    bubbleEnergy: BM_MAX_ENERGY,
    oxygenLevel: BM_MAX_OXYGEN,
    depthReached: 0,
    currentDepth: 0,
    creaturesCollected: 0,
    totalCaught: 0,
    totalReleased: 0,
    titleIndex: 0,
    coralReputation: 0,
    waterPressure: 0,
    dailyDiveTask: null,
    lastDailyReset: 0,
    totalDives: 0,
    totalPlayTime: 0,
    sessionStart: Date.now(),
  };
}

function getCreatureDef(id: number): BubbleCreatureDef | undefined {
  return BUBBLE_CREATURES.find(c => c.id === id);
}

function getZoneDef(id: number): OceanZoneDef | undefined {
  return OCEAN_ZONES.find(z => z.id === id);
}

function getEquipmentDef(id: number): EquipmentDef | undefined {
  return DIVING_EQUIPMENT.find(e => e.id === id);
}

function getStructureDef(id: number): CoralStructureDef | undefined {
  return CORAL_STRUCTURES.find(s => s.id === id);
}

function getAbilityDef(id: number): SeaAbilityDef | undefined {
  return SEA_ABILITIES.find(a => a.id === id);
}

function getAchievementDef(id: number): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

function calculateWaterPressure(depth: number): number {
  return Math.floor(depth * 0.01);
}

function calculateZoneDepthRequirement(zoneId: number): number {
  const zone = getZoneDef(zoneId);
  return zone ? zone.depthRange[0] : 0;
}

function calculateStructureCost(structureId: number, currentLevel: number): number {
  const def = getStructureDef(structureId);
  if (!def) return Infinity;
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
}

function calculateEnergyRegenRate(titleIndex: number): number {
  return 1 + titleIndex * 0.5;
}

function calculateOxygenDrainRate(depth: number, titleIndex: number): number {
  const baseRate = 1 + Math.floor(depth / 500) * 0.5;
  return Math.max(0.1, baseRate - titleIndex * 0.3);
}

function pickRandomCreatureForZone(zoneId: number): BubbleCreatureDef | undefined {
  const zone = getZoneDef(zoneId);
  if (!zone || zone.creaturesAvailable.length === 0) return undefined;
  const pool = zone.creaturesAvailable
    .map(cid => getCreatureDef(cid))
    .filter((c): c is BubbleCreatureDef => c !== undefined);
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateDailyTask(): DailyDiveTask {
  const tasks = [
    { description: 'Collect {target} creatures', targetRange: [3, 8], rewardType: 'energy' as const, rewardRange: [10, 30] },
    { description: 'Dive to {target}m depth', targetRange: [300, 2000], rewardType: 'oxygen' as const, rewardRange: [10, 25] },
    { description: 'Explore {target} different zones', targetRange: [1, 3], rewardType: 'reputation' as const, rewardRange: [20, 60] },
    { description: 'Upgrade {target} coral structures', targetRange: [1, 3], rewardType: 'energy' as const, rewardRange: [15, 35] },
    { description: 'Release {target} creatures', targetRange: [2, 5], rewardType: 'reputation' as const, rewardRange: [30, 80] },
  ];
  const template = tasks[Math.floor(Math.random() * tasks.length)];
  const target = template.targetRange[0] + Math.floor(Math.random() * (template.targetRange[1] - template.targetRange[0] + 1));
  const rewardAmount = template.rewardRange[0] + Math.floor(Math.random() * (template.rewardRange[1] - template.rewardRange[0] + 1));
  const desc = template.description.replace('{target}', String(target));
  const now = Date.now();
  return {
    id: now,
    description: desc,
    target,
    progress: 0,
    rewardType: template.rewardType,
    rewardAmount,
    completed: false,
    claimed: false,
    expiresAt: now + 24 * 60 * 60 * 1000,
  };
}

function computeTitleIndex(
  reputation: number,
  maxDepth: number,
  uniqueCreatures: number,
  currentTitle: number,
): number {
  let bestIndex = 0;
  for (let i = TITLE_THRESHOLDS.length - 1; i >= 0; i--) {
    const t = TITLE_THRESHOLDS[i];
    if (reputation >= t.minReputation && maxDepth >= t.minDepth && uniqueCreatures >= t.minCreatures) {
      bestIndex = i;
      break;
    }
  }
  return Math.max(currentTitle, bestIndex);
}

// ───────────────────────────────────────────────────────────────────
// MAIN HOOK
// ───────────────────────────────────────────────────────────────────

export default function useBubbleMarine() {
  const [state, setState] = useState<BubbleMarineState>(createInitialState);
  const stateRef = useRef(state);

  // Keep ref in sync with state (read stateRef in callbacks/effects, never in useMemo)
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Energy regeneration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const regenRate = calculateEnergyRegenRate(prev.titleIndex);
        const newEnergy = Math.min(BM_MAX_ENERGY, prev.bubbleEnergy + regenRate * 0.1);
        const newOxygen = Math.max(0, prev.oxygenLevel - calculateOxygenDrainRate(prev.currentDepth, prev.titleIndex) * 0.05);
        const newPressure = calculateWaterPressure(prev.currentDepth);
        const newPlayTime = prev.totalPlayTime + 0.1;
        return {
          ...prev,
          bubbleEnergy: newEnergy,
          oxygenLevel: newOxygen,
          waterPressure: newPressure,
          totalPlayTime: newPlayTime,
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Daily task reset
  useEffect(() => {
    const now = Date.now();
    setState(prev => {
      const lastReset = prev.lastDailyReset;
      const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
      if (hoursSinceReset >= 24 || prev.dailyDiveTask === null) {
        return {
          ...prev,
          dailyDiveTask: generateDailyTask(),
          lastDailyReset: now,
        };
      }
      return prev;
    });
  }, []);

  // ── MEMOIZED COMPUTED VALUES (never read stateRef here) ──

  const creatureCatalog = useMemo(() => BUBBLE_CREATURES, []);

  const zoneCatalog = useMemo(() => OCEAN_ZONES, []);

  const equipmentCatalog = useMemo(() => DIVING_EQUIPMENT, []);

  const structureCatalog = useMemo(() => CORAL_STRUCTURES, []);

  const abilityCatalog = useMemo(() => SEA_ABILITIES, []);

  const achievementCatalog = useMemo(() => ACHIEVEMENTS, []);

  const titleCatalog = useMemo(() => TITLE_THRESHOLDS, []);

  const equippedItems = useMemo(() => {
    return state.equipment.filter(e => e.equipped);
  }, [state.equipment]);

  const totalEquipmentBonuses = useMemo(() => {
    const bonuses = { oxygen: 0, energy: 0, depth: 0, collect: 0 };
    for (const item of equippedItems) {
      const def = getEquipmentDef(item.equipmentId);
      if (def) {
        bonuses.oxygen += def.oxygenBonus;
        bonuses.energy += def.energyBonus;
        bonuses.depth += def.depthBonus;
        bonuses.collect += def.collectBonus;
      }
    }
    return bonuses;
  }, [equippedItems]);

  const creatureCollectionSummary = useMemo(() => {
    const byRarity: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    let maxRarity = 0;
    for (const entry of state.creatures) {
      const def = getCreatureDef(entry.creatureId);
      if (def) {
        byRarity[def.rarity] = (byRarity[def.rarity] || 0) + entry.count;
        if (def.rarity > maxRarity) maxRarity = def.rarity;
      }
    }
    return { byRarity, maxRarity, totalEntries: state.creatures.length };
  }, [state.creatures]);

  const exploredZoneCount = useMemo(() => {
    return state.zones.filter(Boolean).length;
  }, [state.zones]);

  const activeAbilityIds = useMemo(() => {
    return state.abilities.map(a => a.abilityId);
  }, [state.abilities]);

  const maxStructureLevel = useMemo(() => {
    if (state.structures.length === 0) return 0;
    return Math.max(...state.structures.map(s => s.level));
  }, [state.structures]);

  const structureCount = useMemo(() => {
    return state.structures.length;
  }, [state.structures]);

  const highestRareCollected = useMemo(() => {
    return creatureCollectionSummary.maxRarity;
  }, [creatureCollectionSummary]);

  const isTitleMax = useMemo(() => {
    return state.titleIndex >= BM_TITLES.length - 1;
  }, [state.titleIndex]);

  const effectiveMaxDepth = useMemo(() => {
    return BM_MAX_DEPTH + totalEquipmentBonuses.depth;
  }, [totalEquipmentBonuses]);

  const effectiveMaxOxygen = useMemo(() => {
    return BM_MAX_OXYGEN + totalEquipmentBonuses.oxygen;
  }, [totalEquipmentBonuses]);

  const effectiveMaxEnergy = useMemo(() => {
    return BM_MAX_ENERGY + totalEquipmentBonuses.energy;
  }, [totalEquipmentBonuses]);

  const currentZoneDef = useMemo(() => {
    return OCEAN_ZONES[state.currentZone] ?? OCEAN_ZONES[0];
  }, [state.currentZone]);

  const nextTitleDef = useMemo(() => {
    const nextIdx = state.titleIndex + 1;
    if (nextIdx >= TITLE_THRESHOLDS.length) return null;
    return TITLE_THRESHOLDS[nextIdx];
  }, [state.titleIndex]);

  const zonesUnlocked = useMemo(() => {
    return state.zones;
  }, [state.zones]);

  const achievementsProgress = useMemo(() => {
    const progress: Array<{ def: AchievementDef; earned: boolean; progress: number; target: number }> = [];
    for (const aDef of ACHIEVEMENTS) {
      const earned = state.achievements.some(ea => ea.achievementId === aDef.id);
      let currentProgress = 0;
      let target = aDef.conditionValue;
      switch (aDef.conditionType) {
        case 'collect':
          currentProgress = state.creaturesCollected;
          break;
        case 'depth':
          currentProgress = state.depthReached;
          break;
        case 'zone':
          currentProgress = exploredZoneCount;
          break;
        case 'structure':
          currentProgress = Math.max(structureCount, maxStructureLevel >= 5 ? 5 : maxStructureLevel);
          break;
        case 'creature_rarity':
          currentProgress = highestRareCollected;
          break;
        case 'release':
          currentProgress = state.totalReleased;
          break;
        case 'explore':
          currentProgress = state.totalDives;
          break;
        case 'title':
          currentProgress = state.titleIndex;
          break;
        case 'reputation':
          currentProgress = state.coralReputation;
          break;
      }
      progress.push({ def: aDef, earned, progress: currentProgress, target });
    }
    return progress;
  }, [state, exploredZoneCount, structureCount, maxStructureLevel, highestRareCollected]);

  // ── CALLBACKS ──

  const collectBubble = useCallback((creatureId: number | null): boolean => {
    const targetCreature = creatureId !== null
      ? getCreatureDef(creatureId)
      : pickRandomCreatureForZone(stateRef.current.currentZone);

    if (!targetCreature) return false;

    const energyCost = 5 + targetCreature.rarity * 3;
    if (stateRef.current.bubbleEnergy < energyCost) return false;

    setState(prev => {
      const existing = prev.creatures.find(c => c.creatureId === targetCreature.id);
      const now = Date.now();
      let updatedCreatures: CollectedCreature[];
      let newUniqueCount = prev.creaturesCollected;

      if (existing) {
        updatedCreatures = prev.creatures.map(c =>
          c.creatureId === targetCreature.id
            ? { ...c, count: c.count + 1, lastCaughtAt: now }
            : c,
        );
      } else {
        updatedCreatures = [
          ...prev.creatures,
          { creatureId: targetCreature.id, count: 1, firstCaughtAt: now, lastCaughtAt: now, released: 0 },
        ];
        newUniqueCount += 1;
      }

      const newRep = prev.coralReputation + BM_RARITY_MULTIPLIERS[targetCreature.rarity] * 2;
      const newEnergy = Math.max(0, prev.bubbleEnergy - energyCost);

      const newDailyTask = prev.dailyDiveTask && !prev.dailyDiveTask.completed
        ? {
            ...prev.dailyDiveTask,
            progress: prev.dailyDiveTask.description.includes('Collect')
              ? prev.dailyDiveTask.progress + 1
              : prev.dailyDiveTask.progress,
            completed: prev.dailyDiveTask.description.includes('Collect')
              && prev.dailyDiveTask.progress + 1 >= prev.dailyDiveTask.target,
          }
        : prev.dailyDiveTask;

      const newTitleIndex = computeTitleIndex(newRep, prev.depthReached, newUniqueCount, prev.titleIndex);

      return {
        ...prev,
        creatures: updatedCreatures,
        creaturesCollected: newUniqueCount,
        totalCaught: prev.totalCaught + 1,
        coralReputation: newRep,
        bubbleEnergy: newEnergy,
        titleIndex: newTitleIndex,
        dailyDiveTask: newDailyTask,
      };
    });
    return true;
  }, []);

  const exploreZone = useCallback((zoneId: number): boolean => {
    if (zoneId < 0 || zoneId >= OCEAN_ZONES.length) return false;
    const zone = OCEAN_ZONES[zoneId];
    const titleReq = TITLE_THRESHOLDS[zone.requiredTitle];
    if (stateRef.current.titleIndex < zone.requiredTitle && !(titleReq.minReputation <= stateRef.current.coralReputation)) {
      return false;
    }
    const depthReq = calculateZoneDepthRequirement(zoneId);
    if (stateRef.current.depthReached < depthReq && zone.requiredTitle > 0) return false;

    const energyCost = zone.baseOxygenCost;
    if (stateRef.current.bubbleEnergy < energyCost) return false;

    setState(prev => {
      const updatedZones = [...prev.zones];
      updatedZones[zoneId] = true;
      const oxygenCost = Math.floor(zone.baseOxygenCost * (1 - prev.titleIndex * 0.05));
      return {
        ...prev,
        zones: updatedZones,
        currentZone: zoneId,
        currentDepth: zone.depthRange[0],
        bubbleEnergy: Math.max(0, prev.bubbleEnergy - energyCost),
        oxygenLevel: Math.max(0, prev.oxygenLevel - oxygenCost),
        totalDives: prev.totalDives + 1,
        dailyDiveTask: prev.dailyDiveTask && !prev.dailyDiveTask.completed
          && prev.dailyDiveTask.description.includes('Explore')
          ? {
              ...prev.dailyDiveTask,
              progress: prev.dailyDiveTask.progress + 1,
              completed: prev.dailyDiveTask.progress + 1 >= prev.dailyDiveTask.target,
            }
          : prev.dailyDiveTask,
      };
    });
    return true;
  }, []);

  const upgradeStructure = useCallback((structureId: number): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;

    const current = stateRef.current.structures.find(s => s.structureId === structureId);
    const currentLevel = current ? current.level : 0;
    if (currentLevel >= BM_STRUCTURE_MAX_LEVEL) return false;

    const cost = calculateStructureCost(structureId, currentLevel);
    if (stateRef.current.coralReputation < cost) return false;
    if (stateRef.current.bubbleEnergy < 10) return false;

    setState(prev => {
      const now = Date.now();
      let updatedStructures: BuiltStructure[];
      if (current) {
        updatedStructures = prev.structures.map(s =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, lastUpgradeAt: now }
            : s,
        );
      } else {
        updatedStructures = [
          ...prev.structures,
          { structureId, level: 1, builtAt: now, lastUpgradeAt: now },
        ];
      }

      const newLevel = currentLevel + 1;
      const newDailyTask = prev.dailyDiveTask && !prev.dailyDiveTask.completed
        && prev.dailyDiveTask.description.includes('Upgrade')
        ? {
            ...prev.dailyDiveTask,
            progress: prev.dailyDiveTask.progress + 1,
            completed: prev.dailyDiveTask.progress + 1 >= prev.dailyDiveTask.target,
          }
        : prev.dailyDiveTask;

      const newTitleIndex = computeTitleIndex(
        prev.coralReputation - cost,
        prev.depthReached,
        prev.creaturesCollected,
        prev.titleIndex,
      );

      return {
        ...prev,
        structures: updatedStructures,
        coralReputation: prev.coralReputation - cost,
        bubbleEnergy: Math.max(0, prev.bubbleEnergy - 10),
        titleIndex: newTitleIndex,
        dailyDiveTask: newDailyTask,
      };
    });
    return true;
  }, []);

  const activateAbility = useCallback((abilityId: number): boolean => {
    const def = getAbilityDef(abilityId);
    if (!def) return false;

    const owned = stateRef.current.abilities.find(a => a.abilityId === abilityId);
    if (!owned) return false;
    if (owned.currentCooldown > 0) return false;
    if (def.type === 'active' && stateRef.current.bubbleEnergy < def.energyCost) return false;

    setState(prev => {
      const now = Date.now();
      const updatedAbilities = prev.abilities.map(a =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, currentCooldown: def.cooldown }
          : a,
      );
      const energyDeduction = def.type === 'active' ? def.energyCost : 0;
      return {
        ...prev,
        abilities: updatedAbilities,
        bubbleEnergy: Math.max(0, prev.bubbleEnergy - energyDeduction),
      };
    });
    return true;
  }, []);

  const diveDeeper = useCallback((meters: number = 100): boolean => {
    if (meters <= 0) return false;
    if (stateRef.current.bubbleEnergy < 2) return false;
    if (stateRef.current.oxygenLevel <= 5) return false;

    setState(prev => {
      const newDepth = Math.min(
        BM_MAX_DEPTH + totalEquipmentBonuses.depth,
        prev.currentDepth + meters,
      );
      const newPressure = calculateWaterPressure(newDepth);
      const oxygenDrain = Math.floor(meters * 0.05 * (1 + newPressure * 0.001));
      const newDepthReached = Math.max(prev.depthReached, newDepth);

      const newDailyTask = prev.dailyDiveTask && !prev.dailyDiveTask.completed
        && prev.dailyDiveTask.description.includes('depth')
        ? {
            ...prev.dailyDiveTask,
            progress: Math.max(prev.dailyDiveTask.progress, newDepth),
            completed: newDepth >= prev.dailyDiveTask.target,
          }
        : prev.dailyDiveTask;

      const newTitleIndex = computeTitleIndex(prev.coralReputation, newDepthReached, prev.creaturesCollected, prev.titleIndex);

      return {
        ...prev,
        currentDepth: newDepth,
        depthReached: newDepthReached,
        waterPressure: newPressure,
        oxygenLevel: Math.max(0, prev.oxygenLevel - oxygenDrain),
        bubbleEnergy: Math.max(0, prev.bubbleEnergy - 2),
        titleIndex: newTitleIndex,
        dailyDiveTask: newDailyTask,
      };
    });
    return true;
  }, [totalEquipmentBonuses]);

  const surfaceRise = useCallback((meters: number = 100): boolean => {
    if (meters <= 0) return false;

    setState(prev => {
      const newDepth = Math.max(0, prev.currentDepth - meters);
      const oxygenRecover = Math.floor(meters * 0.03);
      return {
        ...prev,
        currentDepth: newDepth,
        oxygenLevel: Math.min(effectiveMaxOxygen, prev.oxygenLevel + oxygenRecover),
        waterPressure: calculateWaterPressure(newDepth),
      };
    });
    return true;
  }, [effectiveMaxOxygen]);

  const buildCoral = useCallback((structureId: number): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = stateRef.current.structures.find(s => s.structureId === structureId);
    if (existing) return false;

    const cost = def.baseCost;
    if (stateRef.current.coralReputation < cost) return false;

    setState(prev => {
      const now = Date.now();
      return {
        ...prev,
        structures: [
          ...prev.structures,
          { structureId, level: 1, builtAt: now, lastUpgradeAt: now },
        ],
        coralReputation: prev.coralReputation - cost,
      };
    });
    return true;
  }, []);

  const craftPotion = useCallback((potionType: 'energy' | 'oxygen' | 'depth'): boolean => {
    const costs: Record<string, number> = { energy: 30, oxygen: 30, depth: 50 };
    const cost = costs[potionType] || 999;

    if (stateRef.current.coralReputation < cost) return false;

    setState(prev => {
      switch (potionType) {
        case 'energy':
          return { ...prev, bubbleEnergy: Math.min(effectiveMaxEnergy, prev.bubbleEnergy + 25), coralReputation: prev.coralReputation - cost };
        case 'oxygen':
          return { ...prev, oxygenLevel: Math.min(effectiveMaxOxygen, prev.oxygenLevel + 30), coralReputation: prev.coralReputation - cost };
        case 'depth':
          return { ...prev, depthReached: Math.min(BM_MAX_DEPTH, prev.depthReached + 500), coralReputation: prev.coralReputation - cost };
        default:
          return prev;
      }
    });
    return true;
  }, [effectiveMaxEnergy, effectiveMaxOxygen]);

  const releaseBubble = useCallback((creatureId: number): boolean => {
    const entry = stateRef.current.creatures.find(c => c.creatureId === creatureId);
    if (!entry || entry.count <= entry.released) return false;

    setState(prev => {
      const def = getCreatureDef(creatureId);
      const repReward = def ? def.basePower : 5;
      const updatedCreatures = prev.creatures.map(c =>
        c.creatureId === creatureId ? { ...c, released: c.released + 1 } : c,
      );
      const newRep = prev.coralReputation + repReward;

      const newDailyTask = prev.dailyDiveTask && !prev.dailyDiveTask.completed
        && prev.dailyDiveTask.description.includes('Release')
        ? {
            ...prev.dailyDiveTask,
            progress: prev.dailyDiveTask.progress + 1,
            completed: prev.dailyDiveTask.progress + 1 >= prev.dailyDiveTask.target,
          }
        : prev.dailyDiveTask;

      return {
        ...prev,
        creatures: updatedCreatures,
        coralReputation: newRep,
        totalReleased: prev.totalReleased + 1,
        dailyDiveTask: newDailyTask,
      };
    });
    return true;
  }, []);

  const checkAchievements = useCallback((): number[] => {
    const newAchievementIds: number[] = [];
    setState(prev => {
      const earnedIds = new Set(prev.achievements.map(a => a.achievementId));
      const now = Date.now();
      const newEarned: EarnedAchievement[] = [];

      for (const aDef of ACHIEVEMENTS) {
        if (earnedIds.has(aDef.id)) continue;
        let conditionMet = false;

        switch (aDef.conditionType) {
          case 'collect':
            conditionMet = prev.creaturesCollected >= aDef.conditionValue;
            break;
          case 'depth':
            conditionMet = prev.depthReached >= aDef.conditionValue;
            break;
          case 'zone': {
            const exploredCount = prev.zones.filter(Boolean).length;
            conditionMet = exploredCount >= aDef.conditionValue;
            break;
          }
          case 'structure': {
            const maxLv = prev.structures.length > 0 ? Math.max(...prev.structures.map(s => s.level)) : 0;
            conditionMet = maxLv >= aDef.conditionValue || prev.structures.length >= aDef.conditionValue;
            break;
          }
          case 'creature_rarity': {
            let maxRarity = 0;
            for (const c of prev.creatures) {
              const cDef = getCreatureDef(c.creatureId);
              if (cDef && cDef.rarity > maxRarity) maxRarity = cDef.rarity;
            }
            conditionMet = maxRarity >= aDef.conditionValue;
            break;
          }
          case 'release':
            conditionMet = prev.totalReleased >= aDef.conditionValue;
            break;
          case 'explore':
            conditionMet = prev.totalDives >= aDef.conditionValue;
            break;
          case 'title':
            conditionMet = prev.titleIndex >= aDef.conditionValue;
            break;
          case 'reputation':
            conditionMet = prev.coralReputation >= aDef.conditionValue;
            break;
        }

        if (conditionMet) {
          newAchievementIds.push(aDef.id);
          newEarned.push({ achievementId: aDef.id, earnedAt: now, claimed: false });
        }
      }

      if (newEarned.length === 0) return prev;

      // Auto-claim reward for title achievements
      let updatedTitle = prev.titleIndex;
      for (const ea of newEarned) {
        const aDef = getAchievementDef(ea.achievementId);
        if (aDef && aDef.reward.type === 'title') {
          updatedTitle = Math.min(BM_TITLES.length - 1, Math.max(updatedTitle, aDef.reward.amount));
        }
      }

      return {
        ...prev,
        achievements: [...prev.achievements, ...newEarned],
        titleIndex: updatedTitle,
      };
    });
    return newAchievementIds;
  }, []);

  const claimAchievementReward = useCallback((achievementId: number): boolean => {
    const earned = stateRef.current.achievements.find(a => a.achievementId === achievementId);
    if (!earned || earned.claimed) return false;

    const def = getAchievementDef(achievementId);
    if (!def) return false;

    setState(prev => {
      const updatedAchievements = prev.achievements.map(a =>
        a.achievementId === achievementId ? { ...a, claimed: true } : a,
      );

      let updatedEnergy = prev.bubbleEnergy;
      let updatedOxygen = prev.oxygenLevel;
      let updatedRep = prev.coralReputation;
      let updatedTitle = prev.titleIndex;

      switch (def.reward.type) {
        case 'energy':
          updatedEnergy = Math.min(effectiveMaxEnergy, updatedEnergy + def.reward.amount);
          break;
        case 'oxygen':
          updatedOxygen = Math.min(effectiveMaxOxygen, updatedOxygen + def.reward.amount);
          break;
        case 'reputation':
          updatedRep += def.reward.amount;
          break;
        case 'title':
          updatedTitle = Math.min(BM_TITLES.length - 1, Math.max(updatedTitle, def.reward.amount));
          break;
      }

      const newTitleIndex = computeTitleIndex(updatedRep, prev.depthReached, prev.creaturesCollected, updatedTitle);

      return {
        ...prev,
        achievements: updatedAchievements,
        bubbleEnergy: updatedEnergy,
        oxygenLevel: updatedOxygen,
        coralReputation: updatedRep,
        titleIndex: newTitleIndex,
      };
    });
    return true;
  }, [effectiveMaxEnergy, effectiveMaxOxygen]);

  const claimDailyTask = useCallback((): boolean => {
    const task = stateRef.current.dailyDiveTask;
    if (!task || !task.completed || task.claimed) return false;

    setState(prev => {
      if (!prev.dailyDiveTask || !prev.dailyDiveTask.completed || prev.dailyDiveTask.claimed) return prev;

      const updatedTask = { ...prev.dailyDiveTask, claimed: true };
      let updatedEnergy = prev.bubbleEnergy;
      let updatedOxygen = prev.oxygenLevel;
      let updatedRep = prev.coralReputation;

      switch (prev.dailyDiveTask.rewardType) {
        case 'energy':
          updatedEnergy = Math.min(BM_MAX_ENERGY, updatedEnergy + prev.dailyDiveTask.rewardAmount);
          break;
        case 'oxygen':
          updatedOxygen = Math.min(BM_MAX_OXYGEN, updatedOxygen + prev.dailyDiveTask.rewardAmount);
          break;
        case 'reputation':
          updatedRep += prev.dailyDiveTask.rewardAmount;
          break;
      }

      return {
        ...prev,
        dailyDiveTask: updatedTask,
        bubbleEnergy: updatedEnergy,
        oxygenLevel: updatedOxygen,
        coralReputation: updatedRep,
      };
    });
    return true;
  }, []);

  const acquireEquipment = useCallback((equipmentId: number): boolean => {
    const def = getEquipmentDef(equipmentId);
    if (!def) return false;
    if (stateRef.current.equipment.some(e => e.equipmentId === equipmentId)) return false;
    if (stateRef.current.coralReputation < def.cost) return false;

    setState(prev => {
      const now = Date.now();
      return {
        ...prev,
        equipment: [
          ...prev.equipment,
          { equipmentId, equipped: false, durability: 100, acquiredAt: now },
        ],
        coralReputation: prev.coralReputation - def.cost,
      };
    });
    return true;
  }, []);

  const toggleEquipment = useCallback((equipmentId: number): boolean => {
    const def = getEquipmentDef(equipmentId);
    if (!def) return false;
    if (!stateRef.current.equipment.some(e => e.equipmentId === equipmentId)) return false;

    setState(prev => {
      return {
        ...prev,
        equipment: prev.equipment.map(e =>
          e.equipmentId === equipmentId ? { ...e, equipped: !e.equipped } : e,
        ),
      };
    });
    return true;
  }, []);

  const unlockAbility = useCallback((abilityId: number): boolean => {
    const def = getAbilityDef(abilityId);
    if (!def) return false;
    if (stateRef.current.abilities.some(a => a.abilityId === abilityId)) return false;

    const unlockCost = (def.rarity + 1) * 100;
    if (stateRef.current.coralReputation < unlockCost) return false;

    setState(prev => {
      const now = Date.now();
      return {
        ...prev,
        abilities: [
          ...prev.abilities,
          { abilityId, unlockedAt: now, lastUsedAt: 0, currentCooldown: 0 },
        ],
        coralReputation: prev.coralReputation - unlockCost,
      };
    });
    return true;
  }, []);

  const getTitle = useCallback((): string => {
    return BM_TITLES[stateRef.current.titleIndex] ?? BM_TITLES[0];
  }, []);

  const getProgress = useCallback((): {
    creaturesPercent: number;
    zonesPercent: number;
    achievementsPercent: number;
    depthPercent: number;
    reputationPercent: number;
    overallPercent: number;
  } => {
    const s = stateRef.current;
    const creaturesPercent = Math.min(100, (s.creaturesCollected / BM_TOTAL_CREATURES) * 100);
    const zonesPercent = Math.min(100, (exploredZoneCount / OCEAN_ZONES.length) * 100);
    const achievementsPercent = Math.min(100, (s.achievements.length / ACHIEVEMENTS.length) * 100);
    const depthPercent = Math.min(100, (s.depthReached / BM_MAX_DEPTH) * 100);
    const reputationPercent = Math.min(100, (s.coralReputation / BM_MAX_REPUTATION) * 100);
    const overallPercent = (creaturesPercent + zonesPercent + achievementsPercent + depthPercent + reputationPercent) / 5;
    return {
      creaturesPercent,
      zonesPercent,
      achievementsPercent,
      depthPercent,
      reputationPercent,
      overallPercent,
    };
  }, [exploredZoneCount]);

  const getStats = useCallback((): {
    totalCreatures: number;
    uniqueCreatures: number;
    totalCaught: number;
    totalReleased: number;
    zonesExplored: number;
    totalZones: number;
    equipmentOwned: number;
    equipmentEquipped: number;
    structuresBuilt: number;
    maxStructureLevel: number;
    abilitiesUnlocked: number;
    achievementsEarned: number;
    totalAchievements: number;
    depthReached: number;
    maxPossibleDepth: number;
    reputation: number;
    title: string;
    titleIndex: number;
    totalDives: number;
    playTimeMinutes: number;
    currentEnergy: number;
    currentOxygen: number;
    waterPressure: number;
    currentDepth: number;
  } => {
    const s = stateRef.current;
    return {
      totalCreatures: BM_TOTAL_CREATURES,
      uniqueCreatures: s.creaturesCollected,
      totalCaught: s.totalCaught,
      totalReleased: s.totalReleased,
      zonesExplored: exploredZoneCount,
      totalZones: OCEAN_ZONES.length,
      equipmentOwned: s.equipment.length,
      equipmentEquipped: s.equipment.filter(e => e.equipped).length,
      structuresBuilt: s.structures.length,
      maxStructureLevel: maxStructureLevel,
      abilitiesUnlocked: s.abilities.length,
      achievementsEarned: s.achievements.length,
      totalAchievements: ACHIEVEMENTS.length,
      depthReached: s.depthReached,
      maxPossibleDepth: BM_MAX_DEPTH,
      reputation: s.coralReputation,
      title: BM_TITLES[s.titleIndex],
      titleIndex: s.titleIndex,
      totalDives: s.totalDives,
      playTimeMinutes: Math.floor(s.totalPlayTime / 60),
      currentEnergy: Math.floor(s.bubbleEnergy),
      currentOxygen: Math.floor(s.oxygenLevel),
      waterPressure: s.waterPressure,
      currentDepth: s.currentDepth,
    };
  }, [exploredZoneCount, maxStructureLevel]);

  const resetState = useCallback(() => {
    setState(createInitialState());
  }, []);

  const restoreOxygen = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      oxygenLevel: Math.min(effectiveMaxOxygen, prev.oxygenLevel + amount),
    }));
  }, [effectiveMaxOxygen]);

  const restoreEnergy = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      bubbleEnergy: Math.min(effectiveMaxEnergy, prev.bubbleEnergy + amount),
    }));
  }, [effectiveMaxEnergy]);

  const addReputation = useCallback((amount: number) => {
    setState(prev => {
      const newRep = prev.coralReputation + amount;
      const newTitleIndex = computeTitleIndex(newRep, prev.depthReached, prev.creaturesCollected, prev.titleIndex);
      return { ...prev, coralReputation: newRep, titleIndex: newTitleIndex };
    });
  }, []);

  const getCreatureInfo = useCallback((creatureId: number): {
    def: BubbleCreatureDef | undefined;
    collected: boolean;
    count: number;
    released: number;
  } => {
    const def = getCreatureDef(creatureId);
    const entry = stateRef.current.creatures.find(c => c.creatureId === creatureId);
    return {
      def,
      collected: !!entry,
      count: entry?.count ?? 0,
      released: entry?.released ?? 0,
    };
  }, []);

  const getStructureInfo = useCallback((structureId: number): {
    def: CoralStructureDef | undefined;
    built: boolean;
    level: number;
    upgradeCost: number;
    currentEffect: number;
    maxLevel: boolean;
  } => {
    const def = getStructureDef(structureId);
    const entry = stateRef.current.structures.find(s => s.structureId === structureId);
    const level = entry?.level ?? 0;
    const maxLevel = level >= BM_STRUCTURE_MAX_LEVEL;
    return {
      def,
      built: !!entry,
      level,
      upgradeCost: maxLevel ? Infinity : calculateStructureCost(structureId, level),
      currentEffect: def ? def.baseEffect + def.effectPerLevel * level : 0,
      maxLevel,
    };
  }, []);

  const getZoneInfo = useCallback((zoneId: number): {
    def: OceanZoneDef | undefined;
    explored: boolean;
    unlocked: boolean;
    accessible: boolean;
  } => {
    const def = getZoneDef(zoneId);
    if (!def) return { def: undefined, explored: false, unlocked: false, accessible: false };
    const s = stateRef.current;
    const explored = s.zones[zoneId] ?? false;
    const titleMet = s.titleIndex >= def.requiredTitle;
    const depthMet = s.depthReached >= def.depthRange[0] || def.requiredTitle === 0;
    return {
      def,
      explored,
      unlocked: titleMet,
      accessible: titleMet && (depthMet || def.requiredTitle === 0),
    };
  }, []);

  const getEquipmentInfo = useCallback((equipmentId: number): {
    def: EquipmentDef | undefined;
    owned: boolean;
    equipped: boolean;
    durability: number;
  } => {
    const def = getEquipmentDef(equipmentId);
    const entry = stateRef.current.equipment.find(e => e.equipmentId === equipmentId);
    return {
      def,
      owned: !!entry,
      equipped: entry?.equipped ?? false,
      durability: entry?.durability ?? 0,
    };
  }, []);

  const getAbilityInfo = useCallback((abilityId: number): {
    def: SeaAbilityDef | undefined;
    unlocked: boolean;
    onCooldown: boolean;
    cooldownRemaining: number;
  } => {
    const def = getAbilityDef(abilityId);
    const entry = stateRef.current.abilities.find(a => a.abilityId === abilityId);
    return {
      def,
      unlocked: !!entry,
      onCooldown: (entry?.currentCooldown ?? 0) > 0,
      cooldownRemaining: entry?.currentCooldown ?? 0,
    };
  }, []);

  // ── ADDITIONAL MEMOIZED COMPUTED VALUES ──

  const environmentalEffects = useMemo(() => {
    const depth = state.currentDepth;
    const zone = OCEAN_ZONES[state.currentZone];
    const effects: Array<{
      name: string;
      emoji: string;
      intensity: number;
      description: string;
    }> = [];

    if (depth >= 800) {
      effects.push({
        name: 'Twilight Dimming',
        emoji: '🌑',
        intensity: Math.min(1, (depth - 800) / 1200),
        description: 'Sunlight fades. Visibility decreases with depth.',
      });
    }
    if (depth >= 1500) {
      effects.push({
        name: 'Crushing Pressure',
        emoji: '💎',
        intensity: Math.min(1, (depth - 1500) / 5000),
        description: 'Immense water pressure slows movement and drains resources.',
      });
    }
    if (depth >= 4000) {
      effects.push({
        name: 'Volcanic Warmth',
        emoji: '🌋',
        intensity: Math.min(1, (depth - 4000) / 2000),
        description: 'Geothermal heat warms the surrounding water.',
      });
    }
    if (depth >= 6000) {
      effects.push({
        name: 'Abyssal Cold',
        emoji: '❄️',
        intensity: Math.min(1, (depth - 6000) / 3000),
        description: 'Near-freezing temperatures in the deep trench.',
      });
    }
    if (depth >= 9000) {
      effects.push({
        name: 'Bubble Energy Field',
        emoji: '✨',
        intensity: Math.min(1, (depth - 9000) / 999),
        description: 'Pure bubble energy permeates the Sanctum, enhancing all abilities.',
      });
    }
    if (zone && zone.id === ZONE_HYDROTHERMAL_VENTS) {
      effects.push({
        name: 'Thermal Activity',
        emoji: '♨️',
        intensity: 0.7,
        description: 'Volcanic vents release superheated plumes of minerals.',
      });
    }
    if (zone && zone.id === ZONE_CORAL_GARDENS) {
      effects.push({
        name: 'Coral Bloom',
        emoji: '🌸',
        intensity: 0.4,
        description: 'Coral polyps release spawning clouds, attracting creatures.',
      });
    }
    if (state.bubbleEnergy < 20) {
      effects.push({
        name: 'Exhaustion',
        emoji: '😰',
        intensity: 1 - state.bubbleEnergy / 20,
        description: 'Low energy. Actions cost more and yield less.',
      });
    }
    if (state.oxygenLevel < 15) {
      effects.push({
        name: 'Suffocation Warning',
        emoji: '🫁',
        intensity: 1 - state.oxygenLevel / 15,
        description: 'Oxygen critically low! Surface immediately.',
      });
    }

    return effects;
  }, [state.currentDepth, state.currentZone, state.bubbleEnergy, state.oxygenLevel]);

  const creaturePowerRanking = useMemo(() => {
    const ranking = state.creatures
      .map(entry => {
        const def = getCreatureDef(entry.creatureId);
        if (!def) return null;
        return {
          creatureId: entry.creatureId,
          name: def.name,
          emoji: def.emoji,
          rarity: def.rarity,
          totalPower: def.basePower * entry.count * BM_RARITY_MULTIPLIERS[def.rarity],
          count: entry.count,
          released: entry.released,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => b.totalPower - a.totalPower);
    return ranking;
  }, [state.creatures]);

  const coralCityStats = useMemo(() => {
    const stats = {
      habitatLevel: 0,
      defenseLevel: 0,
      resourceLevel: 0,
      researchLevel: 0,
      beautyLevel: 0,
      totalLevel: 0,
      categoryCounts: { habitat: 0, defense: 0, resource: 0, research: 0, beauty: 0 },
    };
    for (const built of state.structures) {
      const def = getStructureDef(built.structureId);
      if (!def) continue;
      stats.categoryCounts[def.category]++;
      switch (def.category) {
        case 'habitat': stats.habitatLevel += built.level; break;
        case 'defense': stats.defenseLevel += built.level; break;
        case 'resource': stats.resourceLevel += built.level; break;
        case 'research': stats.researchLevel += built.level; break;
        case 'beauty': stats.beautyLevel += built.level; break;
      }
      stats.totalLevel += built.level;
    }
    return stats;
  }, [state.structures]);

  const equipmentRaritySummary = useMemo(() => {
    const byRarity: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const eq of state.equipment) {
      const def = getEquipmentDef(eq.equipmentId);
      if (def) byRarity[def.rarity]++;
    }
    return byRarity;
  }, [state.equipment]);

  const abilityPowerSummary = useMemo(() => {
    const activeAbilities = state.abilities.filter(a => {
      const def = getAbilityDef(a.abilityId);
      return def && def.type === 'active';
    });
    const passiveAbilities = state.abilities.filter(a => {
      const def = getAbilityDef(a.abilityId);
      return def && def.type === 'passive';
    });
    const onCooldown = state.abilities.filter(a => a.currentCooldown > 0);
    return {
      totalUnlocked: state.abilities.length,
      activeCount: activeAbilities.length,
      passiveCount: passiveAbilities.length,
      onCooldownCount: onCooldown.length,
      cooldownList: onCooldown.map(a => {
        const def = getAbilityDef(a.abilityId);
        return { abilityId: a.abilityId, name: def?.name ?? '', remaining: a.currentCooldown };
      }),
    };
  }, [state.abilities]);

  const depthZoneProgress = useMemo(() => {
    const depth = state.depthReached;
    const progress: Array<{
      zoneId: number;
      zoneName: string;
      minDepth: number;
      maxDepth: number;
      explored: boolean;
      depthProgress: number;
    }> = [];
    for (const zone of OCEAN_ZONES) {
      const explored = state.zones[zone.id] ?? false;
      const [minD, maxD] = zone.depthRange;
      const depthProgress = Math.min(1, Math.max(0, (depth - minD) / (maxD - minD)));
      progress.push({
        zoneId: zone.id,
        zoneName: zone.name,
        minDepth: minD,
        maxDepth: maxD,
        explored,
        depthProgress,
      });
    }
    return progress;
  }, [state.depthReached, state.zones]);

  const titleProgressDetails = useMemo(() => {
    const next = nextTitleDef;
    if (!next) {
      return { maxTitleReached: true, reputationProgress: 100, depthProgress: 100, creatureProgress: 100 };
    }
    const current = TITLE_THRESHOLDS[state.titleIndex];
    const repRange = next.minReputation - current.minReputation;
    const depRange = next.minDepth - current.minDepth;
    const creRange = next.minCreatures - current.minCreatures;
    return {
      maxTitleReached: false,
      reputationProgress: repRange > 0 ? Math.min(100, ((state.coralReputation - current.minReputation) / repRange) * 100) : 100,
      depthProgress: depRange > 0 ? Math.min(100, ((state.depthReached - current.minDepth) / depRange) * 100) : 100,
      creatureProgress: creRange > 0 ? Math.min(100, ((state.creaturesCollected - current.minCreatures) / creRange) * 100) : 100,
    };
  }, [state.titleIndex, state.coralReputation, state.depthReached, state.creaturesCollected, nextTitleDef]);

  const dailyTaskStatus = useMemo(() => {
    if (!state.dailyDiveTask) return null;
    const task = state.dailyDiveTask;
    const now = Date.now();
    const timeRemaining = Math.max(0, task.expiresAt - now);
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const progressPercent = task.target > 0 ? Math.min(100, (task.progress / task.target) * 100) : 0;
    return {
      ...task,
      timeRemaining,
      hoursRemaining,
      minutesRemaining,
      progressPercent,
      expired: now > task.expiresAt,
    };
  }, [state.dailyDiveTask]);

  // ── POTION RECIPES DATA ──

  const potionRecipes = useMemo(() => {
    return [
      { id: 1, name: 'Bubble Burst Elixir', emoji: '🫧', type: 'energy', potency: 15, cost: 20, description: 'Bursts of bubble energy invigorate the diver', ingredients: ['Bubble Resin', 'Sea Salt'] },
      { id: 2, name: 'Deep Breath Tonic', emoji: '💨', type: 'oxygen', potency: 20, cost: 25, description: 'Expands lung capacity with dissolved oxygen', ingredients: ['Kelp Extract', 'Dissolved Minerals'] },
      { id: 3, name: 'Pressure Adaptation Serum', emoji: '💎', type: 'depth', potency: 300, cost: 40, description: 'Temporarily increases pressure tolerance', ingredients: ['Abyssal Crystal', 'Volcanic Ash'] },
      { id: 4, name: 'Coral Bloom Draught', emoji: '🌺', type: 'reputation', potency: 50, cost: 30, description: 'Accelerates coral growth for reputation gain', ingredients: ['Coral Spores', 'Pearl Dust'] },
      { id: 5, name: 'Leviathan Strength Brew', emoji: '🐋', type: 'energy', potency: 40, cost: 80, description: 'Channel the power of ancient leviathans', ingredients: ['Leviathan Scale', 'Deep Sea Moss'] },
      { id: 6, name: 'Eternal Oxygen Flask', emoji: '⚗️', type: 'oxygen', potency: 50, cost: 90, description: 'Pure oxygen extracted from hydrothermal vents', ingredients: ['Vent Minerals', 'Pressure Crystal'] },
      { id: 7, name: 'Abyssal Descent Pill', emoji: '🕳️', type: 'depth', potency: 1000, cost: 150, description: 'Compresses the body to withstand extreme depths', ingredients: ['Mariana Shard', 'Void Essence'] },
      { id: 8, name: 'Oracle Vision Drops', emoji: '👁️', type: 'reputation', potency: 150, cost: 120, description: 'See hidden secrets and gain deep wisdom', ingredients: ['Oracle Bubble', 'Eternal Coral Fragment'] },
      { id: 9, name: 'Phoenix Fire Elixir', emoji: '🔥', type: 'energy', potency: 60, cost: 200, description: 'Burns with the fire of underwater phoenixes', ingredients: ['Phoenix Ash', 'Magma Essence'] },
      { id: 10, name: 'Tide Surge Potion', emoji: '🌊', type: 'oxygen', potency: 80, cost: 180, description: 'Ride the tides with unlimited breath', ingredients: ['Tidal Essence', 'Moonstone'] },
    ];
  }, []);

  const getCreatureSynergyScore = useCallback((creatureIds: number[]): number => {
    if (creatureIds.length < 2) return 0;
    let synergyScore = 0;
    const defs = creatureIds.map(cid => getCreatureDef(cid)).filter((d): d is BubbleCreatureDef => d !== undefined);
    for (let i = 0; i < defs.length; i++) {
      for (let j = i + 1; j < defs.length; j++) {
        if (defs[i].zone === defs[j].zone) synergyScore += 5;
        if (defs[i].rarity === defs[j].rarity) synergyScore += 3;
        if (defs[i].bubbleColor === defs[j].bubbleColor) synergyScore += 2;
        const powerDiff = Math.abs(defs[i].basePower - defs[j].basePower);
        if (powerDiff < 10) synergyScore += 4;
      }
    }
    return synergyScore;
  }, []);

  const getBestCreatureForZone = useCallback((zoneId: number): BubbleCreatureDef | undefined => {
    const zone = getZoneDef(zoneId);
    if (!zone) return undefined;
    let best: BubbleCreatureDef | undefined;
    let bestScore = -1;
    for (const cid of zone.creaturesAvailable) {
      const def = getCreatureDef(cid);
      if (!def) continue;
      const score = def.basePower * BM_RARITY_MULTIPLIERS[def.rarity];
      if (score > bestScore) {
        bestScore = score;
        best = def;
      }
    }
    return best;
  }, []);

  const getRarestUncollected = useCallback((): BubbleCreatureDef | undefined => {
    const collectedIds = new Set(stateRef.current.creatures.map(c => c.creatureId));
    for (let rarity = RARITY_LEGENDARY; rarity >= RARITY_COMMON; rarity--) {
      const uncollected = BUBBLE_CREATURES.find(c => c.rarity === rarity && !collectedIds.has(c.id));
      if (uncollected) return uncollected;
    }
    return undefined;
  }, []);

  const getCollectionCompletionBonus = useCallback((): {
    rarityBonuses: Array<{ rarity: string; collected: number; total: number; bonusApplied: boolean }>;
    totalBonusPower: number;
  } => {
    const s = stateRef.current;
    const collectedIds = new Set(s.creatures.map(c => c.creatureId));
    const rarityBonuses = BM_RARITY_NAMES.map((name, idx) => {
      const total = BUBBLE_CREATURES.filter(c => c.rarity === idx).length;
      const collected = BUBBLE_CREATURES.filter(c => c.rarity === idx && collectedIds.has(c.id)).length;
      return { rarity: name, collected, total, bonusApplied: collected === total };
    });
    const totalBonusPower = rarityBonuses
      .filter(b => b.bonusApplied)
      .reduce((sum, _, idx) => sum + (idx + 1) * 50, 0);
    return { rarityBonuses, totalBonusPower };
  }, []);

  const simulateDive = useCallback((targetDepth: number): {
    oxygenNeeded: number;
    energyNeeded: number;
    timeEstimate: number;
    pressureAtTarget: number;
    survivable: boolean;
    warnings: string[];
  } => {
    const s = stateRef.current;
    const oxygenNeeded = Math.floor(targetDepth * 0.05 * (1 + calculateWaterPressure(targetDepth) * 0.001));
    const energyNeeded = Math.floor(targetDepth * 0.02 + 5);
    const timeEstimate = Math.floor(targetDepth / 50);
    const pressureAtTarget = calculateWaterPressure(targetDepth);
    const survivable = s.oxygenLevel >= oxygenNeeded * 0.3 && s.bubbleEnergy >= energyNeeded * 0.3;

    const warnings: string[] = [];
    if (oxygenNeeded > effectiveMaxOxygen) warnings.push('Insufficient max oxygen capacity for this depth.');
    if (pressureAtTarget > 50 && s.titleIndex < 3) warnings.push('Extreme pressure — better equipment recommended.');
    if (targetDepth > s.depthReached + 500) warnings.push('Diving significantly deeper than previous records.');
    if (energyNeeded > s.bubbleEnergy) warnings.push('Not enough energy for the full dive.');
    if (targetDepth >= 9000 && s.titleIndex < 6) warnings.push('Bubble Sanctum requires Abyss Explorer title or higher.');

    return { oxygenNeeded, energyNeeded, timeEstimate, pressureAtTarget, survivable, warnings };
  }, [effectiveMaxOxygen]);

  const getCreatureHabitatMap = useCallback((): Array<{
    zoneName: string;
    zoneId: number;
    creatures: Array<{ id: number; name: string; emoji: string; rarity: number; collected: boolean; count: number }>;
  }> => {
    const s = stateRef.current;
    const collectedMap = new Map(s.creatures.map(c => [c.creatureId, c.count]));
    return OCEAN_ZONES.map(zone => ({
      zoneName: zone.name,
      zoneId: zone.id,
      creatures: zone.creaturesAvailable.map(cid => {
        const def = getCreatureDef(cid);
        return {
          id: cid,
          name: def?.name ?? 'Unknown',
          emoji: def?.emoji ?? '❓',
          rarity: def?.rarity ?? 0,
          collected: collectedMap.has(cid),
          count: collectedMap.get(cid) ?? 0,
        };
      }),
    }));
  }, []);

  const getStructureUpgradePath = useCallback((structureId: number): Array<{
    level: number;
    cost: number;
    effect: number;
    cumulativeCost: number;
  }> => {
    const def = getStructureDef(structureId);
    if (!def) return [];
    const path: Array<{ level: number; cost: number; effect: number; cumulativeCost: number }> = [];
    let cumulative = 0;
    for (let lvl = 1; lvl <= BM_STRUCTURE_MAX_LEVEL; lvl++) {
      const cost = calculateStructureCost(structureId, lvl - 1);
      cumulative += cost;
      path.push({
        level: lvl,
        cost,
        effect: def.baseEffect + def.effectPerLevel * lvl,
        cumulativeCost: cumulative,
      });
    }
    return path;
  }, []);

  // ── RETURN API ──

  return {
    // Raw state
    ...state,

    // Catalogs
    creatureCatalog,
    zoneCatalog,
    equipmentCatalog,
    structureCatalog,
    abilityCatalog,
    achievementCatalog,
    titleCatalog,

    // Computed values
    equippedItems,
    totalEquipmentBonuses,
    creatureCollectionSummary,
    exploredZoneCount,
    activeAbilityIds,
    maxStructureLevel,
    structureCount,
    highestRareCollected,
    isTitleMax,
    effectiveMaxDepth,
    effectiveMaxOxygen,
    effectiveMaxEnergy,
    currentZoneDef,
    nextTitleDef,
    zonesUnlocked,
    achievementsProgress,

    // Actions
    collectBubble,
    exploreZone,
    upgradeStructure,
    activateAbility,
    diveDeeper,
    surfaceRise,
    buildCoral,
    craftPotion,
    releaseBubble,
    checkAchievements,
    claimAchievementReward,
    claimDailyTask,
    acquireEquipment,
    toggleEquipment,
    unlockAbility,
    resetState,
    restoreOxygen,
    restoreEnergy,
    addReputation,

    // Queries
    getTitle,
    getProgress,
    getStats,
    getCreatureInfo,
    getStructureInfo,
    getZoneInfo,
    getEquipmentInfo,
    getAbilityInfo,

    // Extended computed values
    environmentalEffects,
    creaturePowerRanking,
    coralCityStats,
    equipmentRaritySummary,
    abilityPowerSummary,
    depthZoneProgress,
    titleProgressDetails,
    dailyTaskStatus,
    potionRecipes,

    // Extended query callbacks
    getCreatureSynergyScore,
    getBestCreatureForZone,
    getRarestUncollected,
    getCollectionCompletionBonus,
    simulateDive,
    getCreatureHabitatMap,
    getStructureUpgradePath,
  };
}
