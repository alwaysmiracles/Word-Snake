import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════
// Mythic Abyss — 神话深渊 : Word Snake Game Wire Module
// An ancient abyssal realm of mythic beasts, legendary artifacts,
// forbidden structures, and primordial chaos.
//
// Color Theme:
//   Abyss        #0A0A2E  (deep void background)
//   Mythic Gold  #DAA520  (legendary accent)
//   Hydra Green  #00FF7F  (nature/life energy)
//   Kraken Blue  #1E90FF  (abyssal waters)
//
// Prefix: MX_ constants, mxAPI return object
// Pattern: A — constants directly on API object
// ═══════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────
// MX_ EXPORTED CONSTANTS
// ───────────────────────────────────────────────────────────────────

export const MX_COLOR_ABYSS = '#0A0A2E';
export const MX_COLOR_MYTHIC_GOLD = '#DAA520';
export const MX_COLOR_HYDRA_GREEN = '#00FF7F';
export const MX_COLOR_KRAKEN_BLUE = '#1E90FF';
export const MX_COLOR_SHADOW = '#1A1A3E';
export const MX_COLOR_ELDER_PURPLE = '#7B2D8E';
export const MX_COLOR_FORGE_RED = '#C0392B';
export const MX_COLOR_MYSTIC_TEAL = '#00BFA5';

export const MX_MAX_SOUL_ESSENCE = 100;
export const MX_MAX_MYTHIC_POWER = 100;
export const MX_MAX_CORRUPTION = 9999;
export const MX_MAX_GLORY = 10000;
export const MX_STRUCTURE_MAX_LEVEL = 10;
export const MX_BEAST_TIERS = 5;
export const MX_BEASTS_PER_TIER = 7;
export const MX_TOTAL_BEASTS = MX_BEAST_TIERS * MX_BEASTS_PER_TIER;

export const MX_RARITY_NAMES = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
] as const;

export const MX_RARITY_COLORS = [
  '#78909C',
  '#4DB6AC',
  '#AB47BC',
  '#EF5350',
  '#DAA520',
] as const;

export const MX_RARITY_MULTIPLIERS = [1, 2, 5, 10, 25] as const;

export const MX_TITLES = [
  'Mythic Novice',
  'Beast Whisperer',
  'Abyss Tamer',
  'Layer Walker',
  'Artifact Keeper',
  'Chaos Wielder',
  'Elder Sovereign',
  'Mythic Overlord',
] as const;

export const MX_LAYER_NAMES = [
  'Veil of Shadows',
  'Hydra Depths',
  'Kraken Maw',
  'Basilisk Warren',
  'Minotaur Labyrinth',
  'Griffin Aerie',
  'Phoenix Crucible',
  'Primordial Throne',
] as const;

export const MX_BEAST_TYPES = [
  'Dragon Hydra',
  'Chimera',
  'Kraken',
  'Basilisk',
  'Minotaur',
  'Griffin',
  'Phoenix Serpent',
] as const;

export const MX_STRUCTURE_CATEGORIES = [
  'sanctuary',
  'fortress',
  'forge',
  'library',
  'ritual',
] as const;

export const MX_MATERIAL_TYPES = [
  'essence',
  'fragment',
  'crystal',
  'bone',
  'scale',
  'ember',
] as const;

// ───────────────────────────────────────────────────────────────────
// STATIC DATA DEFINITIONS
// ───────────────────────────────────────────────────────────────────

const RARITY_COMMON = 0;
const RARITY_UNCOMMON = 1;
const RARITY_RARE = 2;
const RARITY_EPIC = 3;
const RARITY_LEGENDARY = 4;

const TYPE_DRAGON_HYDRA = 0;
const TYPE_CHIMERA = 1;
const TYPE_KRAKEN = 2;
const TYPE_BASILISK = 3;
const TYPE_MINOTAUR = 4;
const TYPE_GRIFFIN = 5;
const TYPE_PHOENIX_SERPENT = 6;

const LAYER_VEIL_OF_SHADOWS = 0;
const LAYER_HYDRA_DEPTHS = 1;
const LAYER_KRAKEN_MAW = 2;
const LAYER_BASILISK_WARREN = 3;
const LAYER_MINOTAUR_LABYRINTH = 4;
const LAYER_GRIFFIN_AERIE = 5;
const LAYER_PHOENIX_CRUCIBLE = 6;
const LAYER_PRIMORDIAL_THRONE = 7;

// ── 35 Mythic Beasts (5 tiers × 7 types) ──
// Each tier contains exactly one beast of each of the 7 types.
// Types: Dragon Hydra, Chimera, Kraken, Basilisk, Minotaur, Griffin, Phoenix Serpent
// Tiers: Common, Uncommon, Rare, Epic, Legendary

interface MythicBeastDef {
  id: number;
  name: string;
  rarity: number;
  type: number;
  layer: number;
  emoji: string;
  soulPower: number;
  speed: number;
  description: string;
  auraColor: string;
}

const MYTHIC_BEASTS: MythicBeastDef[] = [
  // ── Common (Tier 0) — 7 beasts ──
  { id: 1, name: 'Drake Wyrmling', rarity: RARITY_COMMON, type: TYPE_DRAGON_HYDRA, layer: LAYER_VEIL_OF_SHADOWS, emoji: '🐉', soulPower: 10, speed: 12, description: 'A young dragon-hydra hatchling with two small heads and iridescent scales', auraColor: '#DAA520' },
  { id: 2, name: 'Lesser Chimera Pup', rarity: RARITY_COMMON, type: TYPE_CHIMERA, layer: LAYER_VEIL_OF_SHADOWS, emoji: '🦁', soulPower: 8, speed: 14, description: 'A small three-part chimera cub: lion head, goat horn, snake tail', auraColor: '#C0392B' },
  { id: 3, name: 'Tide Squid', rarity: RARITY_COMMON, type: TYPE_KRAKEN, layer: LAYER_VEIL_OF_SHADOWS, emoji: '🦑', soulPower: 9, speed: 10, description: 'A juvenile kraken with only four tentacles and a shy disposition', auraColor: '#1E90FF' },
  { id: 4, name: 'Hatchling Basilisk', rarity: RARITY_COMMON, type: TYPE_BASILISK, layer: LAYER_VEIL_OF_SHADOWS, emoji: '🐍', soulPower: 7, speed: 16, description: 'A small basilisk whose gaze can momentarily slow its prey', auraColor: '#7B2D8E' },
  { id: 5, name: 'Calf Minotaur', rarity: RARITY_COMMON, type: TYPE_MINOTAUR, layer: LAYER_HYDRA_DEPTHS, emoji: '🐂', soulPower: 11, speed: 8, description: 'A young minotaur already displaying tremendous raw strength', auraColor: '#A0522D' },
  { id: 6, name: 'Fledgling Griffin', rarity: RARITY_COMMON, type: TYPE_GRIFFIN, layer: LAYER_HYDRA_DEPTHS, emoji: '🦅', soulPower: 12, speed: 22, description: 'A baby griffin with fluffy down feathers and oversized talons', auraColor: '#DAA520' },
  { id: 7, name: 'Ember Worm', rarity: RARITY_COMMON, type: TYPE_PHOENIX_SERPENT, layer: LAYER_VEIL_OF_SHADOWS, emoji: '🔥', soulPower: 13, speed: 18, description: 'A small fire serpent that sheds sparks as it slithers through ash', auraColor: '#FF6B35' },
  // ── Uncommon (Tier 1) — 7 beasts ──
  { id: 8, name: 'Twin-Headed Hydra', rarity: RARITY_UNCOMMON, type: TYPE_DRAGON_HYDRA, layer: LAYER_HYDRA_DEPTHS, emoji: '🐉', soulPower: 25, speed: 20, description: 'A hydra with two fully developed dragon heads that coordinate attacks', auraColor: '#FFD700' },
  { id: 9, name: 'Fire-Maned Chimera', rarity: RARITY_UNCOMMON, type: TYPE_CHIMERA, layer: LAYER_HYDRA_DEPTHS, emoji: '🔥', soulPower: 28, speed: 16, description: 'A chimera whose lion mane blazes with eternal fire that never dims', auraColor: '#FF4500' },
  { id: 10, name: 'Abyssal Octopus', rarity: RARITY_UNCOMMON, type: TYPE_KRAKEN, layer: LAYER_KRAKEN_MAW, emoji: '🐙', soulPower: 22, speed: 14, description: 'A deep-sea kraken relative with bioluminescent ink and crushing arms', auraColor: '#00BFFF' },
  { id: 11, name: 'Stone Gaze Basilisk', rarity: RARITY_UNCOMMON, type: TYPE_BASILISK, layer: LAYER_BASILISK_WARREN, emoji: '👁️', soulPower: 30, speed: 12, description: 'A basilisk whose gaze can petrify flesh to stone in mere seconds', auraColor: '#8B008B' },
  { id: 12, name: 'Bronze-Horn Minotaur', rarity: RARITY_UNCOMMON, type: TYPE_MINOTAUR, layer: LAYER_MINOTAUR_LABYRINTH, emoji: '🐂', soulPower: 32, speed: 15, description: 'A minotaur with bronze-plated horns that can shatter stone walls', auraColor: '#CD7F32' },
  { id: 13, name: 'Storm-Feather Griffin', rarity: RARITY_UNCOMMON, type: TYPE_GRIFFIN, layer: LAYER_GRIFFIN_AERIE, emoji: '⚡', soulPower: 27, speed: 30, description: 'A griffin whose feathers crackle with captured lightning from storms', auraColor: '#DAA520' },
  { id: 14, name: 'Ash Serpent', rarity: RARITY_UNCOMMON, type: TYPE_PHOENIX_SERPENT, layer: LAYER_HYDRA_DEPTHS, emoji: '💨', soulPower: 24, speed: 26, description: 'A serpent made of volcanic ash that reforms endlessly from its own remains', auraColor: '#808080' },
  // ── Rare (Tier 2) — 7 beasts ──
  { id: 15, name: 'Three-Headed Dread Hydra', rarity: RARITY_RARE, type: TYPE_DRAGON_HYDRA, layer: LAYER_KRAKEN_MAW, emoji: '🐲', soulPower: 60, speed: 25, description: 'A massive three-headed hydra that regrows severed heads instantly in battle', auraColor: '#FFD700' },
  { id: 16, name: 'Tri-Element Chimera', rarity: RARITY_RARE, type: TYPE_CHIMERA, layer: LAYER_MINOTAUR_LABYRINTH, emoji: '🌊', soulPower: 65, speed: 22, description: 'A chimera that breathes fire, ice, and lightning from its three mouths', auraColor: '#4169E1' },
  { id: 17, name: 'Leviathan Spawn', rarity: RARITY_RARE, type: TYPE_KRAKEN, layer: LAYER_KRAKEN_MAW, emoji: '🌊', soulPower: 58, speed: 10, description: 'A kraken large enough to create whirlpools with a single tentacle sweep', auraColor: '#1E90FF' },
  { id: 18, name: 'Petrify King Basilisk', rarity: RARITY_RARE, type: TYPE_BASILISK, layer: LAYER_BASILISK_WARREN, emoji: '🗿', soulPower: 70, speed: 8, description: 'The king of basilisks whose gaze turns entire regions to stone forever', auraColor: '#4B0082' },
  { id: 19, name: 'Ironhide Minotaur', rarity: RARITY_RARE, type: TYPE_MINOTAUR, layer: LAYER_MINOTAUR_LABYRINTH, emoji: '🛡️', soulPower: 72, speed: 18, description: 'A minotaur whose hide has naturally hardened to iron-like density', auraColor: '#708090' },
  { id: 20, name: 'Royal Sky Griffin', rarity: RARITY_RARE, type: TYPE_GRIFFIN, layer: LAYER_GRIFFIN_AERIE, emoji: '👑', soulPower: 62, speed: 40, description: 'A griffin of noble bloodline with golden plumage and devastating dive attacks', auraColor: '#FFD700' },
  { id: 21, name: 'Inferno Coil Serpent', rarity: RARITY_RARE, type: TYPE_PHOENIX_SERPENT, layer: LAYER_PHOENIX_CRUCIBLE, emoji: '🔥', soulPower: 68, speed: 35, description: 'A phoenix serpent that burns with the heat of a dying star', auraColor: '#FF2400' },
  // ── Epic (Tier 3) — 7 beasts ──
  { id: 22, name: 'Five-Headed Apocalypse Hydra', rarity: RARITY_EPIC, type: TYPE_DRAGON_HYDRA, layer: LAYER_PHOENIX_CRUCIBLE, emoji: '🐲', soulPower: 130, speed: 28, description: 'A hydra so massive its five dragon heads block out the sun, each breathing a different element', auraColor: '#FFD700' },
  { id: 23, name: 'Omega Chimera', rarity: RARITY_EPIC, type: TYPE_CHIMERA, layer: LAYER_PHOENIX_CRUCIBLE, emoji: '💀', soulPower: 140, speed: 24, description: 'The ultimate chimera fusion: dragon wings, lion body, scorpion tail, all in one being', auraColor: '#DC143C' },
  { id: 24, name: 'Abyssal Kraken Lord', rarity: RARITY_EPIC, type: TYPE_KRAKEN, layer: LAYER_PRIMORDIAL_THRONE, emoji: '🦑', soulPower: 135, speed: 12, description: 'A kraken lord whose tentacles span entire abyssal layers at once', auraColor: '#0047AB' },
  { id: 25, name: 'Eternity Basilisk', rarity: RARITY_EPIC, type: TYPE_BASILISK, layer: LAYER_MINOTAUR_LABYRINTH, emoji: '⏳', soulPower: 128, speed: 14, description: 'A basilisk that freezes time itself with its gaze, trapping victims eternally', auraColor: '#8A2BE2' },
  { id: 26, name: 'Warlord Minotaur King', rarity: RARITY_EPIC, type: TYPE_MINOTAUR, layer: LAYER_MINOTAUR_LABYRINTH, emoji: '⚔️', soulPower: 145, speed: 20, description: 'The supreme minotaur warlord who commands all labyrinth denizens', auraColor: '#B22222' },
  { id: 27, name: 'Celestial Griffin Empress', rarity: RARITY_EPIC, type: TYPE_GRIFFIN, layer: LAYER_GRIFFIN_AERIE, emoji: '✨', soulPower: 138, speed: 45, description: 'A griffin of celestial origin with starlight feathers and divine speed', auraColor: '#FFD700' },
  { id: 28, name: 'Rebirth Phoenix Wyrm', rarity: RARITY_EPIC, type: TYPE_PHOENIX_SERPENT, layer: LAYER_PHOENIX_CRUCIBLE, emoji: '♻️', soulPower: 150, speed: 38, description: 'A phoenix serpent that dies and is reborn stronger with each death cycle', auraColor: '#FF6347' },
  // ── Legendary (Tier 4) — 7 beasts ──
  { id: 29, name: 'World-Ender Hydra', rarity: RARITY_LEGENDARY, type: TYPE_DRAGON_HYDRA, layer: LAYER_PRIMORDIAL_THRONE, emoji: '🐲', soulPower: 300, speed: 35, description: 'The primordial hydra whose seven heads once devoured continents whole', auraColor: '#FFD700' },
  { id: 30, name: 'Mythic Alpha Chimera', rarity: RARITY_LEGENDARY, type: TYPE_CHIMERA, layer: LAYER_PRIMORDIAL_THRONE, emoji: '🧬', soulPower: 280, speed: 30, description: 'The first chimera ever created, containing fragments of every beast species', auraColor: '#FF1493' },
  { id: 31, name: 'Void Kraken Emperor', rarity: RARITY_LEGENDARY, type: TYPE_KRAKEN, layer: LAYER_PRIMORDIAL_THRONE, emoji: '🌊', soulPower: 310, speed: 20, description: 'An emperor kraken that dwells between dimensions, tentacles reaching through reality', auraColor: '#0000CD' },
  { id: 32, name: 'Gorgon Prime Basilisk', rarity: RARITY_LEGENDARY, type: TYPE_BASILISK, layer: LAYER_PRIMORDIAL_THRONE, emoji: '👁️', soulPower: 295, speed: 25, description: 'The original basilisk whose venom flows through the veins of all lesser serpents', auraColor: '#660066' },
  { id: 33, name: 'Labyrinth Architect', rarity: RARITY_LEGENDARY, type: TYPE_MINOTAUR, layer: LAYER_PRIMORDIAL_THRONE, emoji: '🏛️', soulPower: 270, speed: 40, description: 'The minotaur who built the infinite labyrinth, knowing every path eternally', auraColor: '#8B4513' },
  { id: 34, name: 'Dawnbreaker Griffin', rarity: RARITY_LEGENDARY, type: TYPE_GRIFFIN, layer: LAYER_PRIMORDIAL_THRONE, emoji: '🌅', soulPower: 320, speed: 60, description: 'The griffin that carries the dawn itself across the sky each morning', auraColor: '#FF8C00' },
  { id: 35, name: 'Ouroboros Eternal Serpent', rarity: RARITY_LEGENDARY, type: TYPE_PHOENIX_SERPENT, layer: LAYER_PRIMORDIAL_THRONE, emoji: '♾️', soulPower: 350, speed: 50, description: 'The serpent that eats its own tail, symbolizing the infinite cycle of mythic rebirth', auraColor: '#FF4500' },
];

// ── 8 Abyss Layers ──
// Layers represent increasing depths of the Mythic Abyss.
// Each layer has unique beasts, ambient colors, and corruption thresholds.
// Deeper layers require higher titles and greater corruption to access.

interface AbyssLayerDef {
  id: number;
  name: string;
  corruptionRange: [number, number];
  requiredTitle: number;
  baseSoulCost: number;
  description: string;
  ambientColor: string;
  bgGradient: string;
  beastsAvailable: number[];
}

const ABYSS_LAYERS: AbyssLayerDef[] = [
  {
    id: 0,
    name: 'Veil of Shadows',
    corruptionRange: [0, 200],
    requiredTitle: 0,
    baseSoulCost: 5,
    description: 'A twilight layer where shadows dance and mythic beasts first emerge. Gentle introduction to the abyss.',
    ambientColor: '#1A1A3E',
    bgGradient: 'linear-gradient(180deg, #0A0A2E 0%, #1A1A3E 50%, #0D0D1F 100%)',
    beastsAvailable: [1, 2, 3, 4, 7],
  },
  {
    id: 1,
    name: 'Hydra Depths',
    corruptionRange: [200, 500],
    requiredTitle: 0,
    baseSoulCost: 10,
    description: 'Submerged caverns where hydra spawn multiply endlessly. Pools of soul essence bubble from the floor.',
    ambientColor: '#00FF7F',
    bgGradient: 'linear-gradient(180deg, #0A0A2E 0%, #0D2D0D 50%, #0A0A0F 100%)',
    beastsAvailable: [5, 6, 8, 14],
  },
  {
    id: 2,
    name: 'Kraken Maw',
    corruptionRange: [500, 1000],
    requiredTitle: 1,
    baseSoulCost: 18,
    description: 'A vast underwater chasm within the abyss where kraken tentacles sweep through ink-dark currents.',
    ambientColor: '#1E90FF',
    bgGradient: 'linear-gradient(180deg, #0A0A2E 0%, #0A1A3E 50%, #000020 100%)',
    beastsAvailable: [10, 15, 17],
  },
  {
    id: 3,
    name: 'Basilisk Warren',
    corruptionRange: [1000, 2000],
    requiredTitle: 2,
    baseSoulCost: 28,
    description: 'Labyrinthine tunnels of petrified stone where basilisk gazes have frozen entire ecosystems in time.',
    ambientColor: '#7B2D8E',
    bgGradient: 'linear-gradient(180deg, #0A0A2E 0%, #1A0A2E 50%, #0A0A0F 100%)',
    beastsAvailable: [11, 16, 18],
  },
  {
    id: 4,
    name: 'Minotaur Labyrinth',
    corruptionRange: [2000, 4000],
    requiredTitle: 3,
    baseSoulCost: 40,
    description: 'An ever-shifting maze of colossal stone walls patrolled by the strongest minotaurs in existence.',
    ambientColor: '#A0522D',
    bgGradient: 'linear-gradient(180deg, #0A0A2E 0%, #2E1A0A 50%, #0A0A0F 100%)',
    beastsAvailable: [12, 19, 25, 26],
  },
  {
    id: 5,
    name: 'Griffin Aerie',
    corruptionRange: [4000, 6000],
    requiredTitle: 4,
    baseSoulCost: 55,
    description: 'Floating islands of ancient rock where griffin flocks nest above the abyss, diving for prey below.',
    ambientColor: '#DAA520',
    bgGradient: 'linear-gradient(180deg, #0A0A2E 0%, #2E2A0A 50%, #0A0A0F 100%)',
    beastsAvailable: [13, 20, 27],
  },
  {
    id: 6,
    name: 'Phoenix Crucible',
    corruptionRange: [6000, 9000],
    requiredTitle: 5,
    baseSoulCost: 70,
    description: 'A realm of perpetual fire where phoenix serpents are born and die in endless cycles of rebirth.',
    ambientColor: '#FF4500',
    bgGradient: 'linear-gradient(180deg, #0A0A2E 0%, #2E0A0A 50%, #0A0A0F 100%)',
    beastsAvailable: [21, 22, 23, 28],
  },
  {
    id: 7,
    name: 'Primordial Throne',
    corruptionRange: [9000, 9999],
    requiredTitle: 6,
    baseSoulCost: 90,
    description: 'The deepest layer where the original mythic beings dwell. Reality bends and myth becomes law.',
    ambientColor: '#DAA520',
    bgGradient: 'linear-gradient(180deg, #0A0A2E 0%, #1A0A00 50%, #000000 100%)',
    beastsAvailable: [29, 30, 31, 32, 33, 34, 35],
  },
];

// ── 30 Mythic Materials ──
// Materials are grouped by rarity: 6 per tier (Common through Legendary).
// Types include essence, fragment, crystal, bone, scale, and ember.
// Used for crafting, building, and artifact activation.

interface MythicMaterialDef {
  id: number;
  name: string;
  emoji: string;
  type: 'essence' | 'fragment' | 'crystal' | 'bone' | 'scale' | 'ember';
  rarity: number;
  soulBonus: number;
  powerBonus: number;
  corruptionBonus: number;
  craftBonus: number;
  description: string;
  cost: number;
}

const MYTHIC_MATERIALS: MythicMaterialDef[] = [
  // Common (6)
  { id: 1, name: 'Shadow Essence', emoji: '🌑', type: 'essence', rarity: 0, soulBonus: 5, powerBonus: 0, corruptionBonus: 0, craftBonus: 0, description: 'Drops of condensed shadow gathered from the Veil of Shadows', cost: 50 },
  { id: 2, name: 'Hydra Scale Shard', emoji: '🟢', type: 'scale', rarity: 0, soulBonus: 0, powerBonus: 5, corruptionBonus: 0, craftBonus: 1, description: 'A small iridescent scale shed by a young hydra during growth', cost: 60 },
  { id: 3, name: 'Chimera Fang', emoji: '🦷', type: 'bone', rarity: 0, soulBonus: 3, powerBonus: 3, corruptionBonus: 50, craftBonus: 0, description: 'A sharp fang from a lesser chimera, still humming with mixed energy', cost: 45 },
  { id: 4, name: 'Abyssal Pearl', emoji: '⚪', type: 'crystal', rarity: 0, soulBonus: 0, powerBonus: 0, corruptionBonus: 0, craftBonus: 2, description: 'A luminous pearl formed in the pressure of deep abyssal currents', cost: 55 },
  { id: 5, name: 'Ember Dust', emoji: '✨', type: 'ember', rarity: 0, soulBonus: 4, powerBonus: 0, corruptionBonus: 0, craftBonus: 1, description: 'Fine spark residue left behind by phoenix serpent passage', cost: 40 },
  { id: 6, name: 'Kraken Ink Sac', emoji: '⚫', type: 'fragment', rarity: 0, soulBonus: 0, powerBonus: 2, corruptionBonus: 0, craftBonus: 3, description: 'A sac of dark ink from a juvenile kraken, useful in binding rituals', cost: 70 },
  // Uncommon (6)
  { id: 7, name: 'Basilisk Petrified Tear', emoji: '💧', type: 'crystal', rarity: 1, soulBonus: 12, powerBonus: 5, corruptionBonus: 100, craftBonus: 2, description: 'A tear from a stone gaze basilisk, frozen mid-fall into crystal', cost: 200 },
  { id: 8, name: 'Minotaur Horn Fragment', emoji: '🪨', type: 'bone', rarity: 1, soulBonus: 0, powerBonus: 15, corruptionBonus: 50, craftBonus: 0, description: 'A fragment of bronze-plated minotaur horn, humming with seismic energy', cost: 180 },
  { id: 9, name: 'Griffin Down Feather', emoji: '🪶', type: 'fragment', rarity: 1, soulBonus: 10, powerBonus: 0, corruptionBonus: 0, craftBonus: 5, description: 'A feather from a storm griffin that crackles with static electricity', cost: 160 },
  { id: 10, name: 'Hydra Blood Vial', emoji: '🧪', type: 'essence', rarity: 1, soulBonus: 0, powerBonus: 0, corruptionBonus: 150, craftBonus: 3, description: 'A vial of regenerative blood from a twin-headed hydra', cost: 220 },
  { id: 11, name: 'Phoenix Ash', emoji: '🔥', type: 'ember', rarity: 1, soulBonus: 8, powerBonus: 10, corruptionBonus: 0, craftBonus: 4, description: 'Sacred ash from a phoenix serpent rebirth, radiating residual warmth', cost: 190 },
  { id: 12, name: 'Kraken Beak Shard', emoji: '🦴', type: 'bone', rarity: 1, soulBonus: 0, powerBonus: 12, corruptionBonus: 0, craftBonus: 6, description: 'A razor-sharp fragment of an abyssal octopus beak', cost: 210 },
  // Rare (6)
  { id: 13, name: 'Dread Hydra Heart', emoji: '❤️', type: 'fragment', rarity: 2, soulBonus: 25, powerBonus: 20, corruptionBonus: 500, craftBonus: 5, description: 'A still-beating heart from a three-headed hydra, pulsing with regeneration', cost: 800 },
  { id: 14, name: 'Petrify King Stone Eye', emoji: '👁️', type: 'crystal', rarity: 2, soulBonus: 30, powerBonus: 0, corruptionBonus: 300, craftBonus: 4, description: 'The crystallized eye of a petrify king basilisk, still possessing its gaze', cost: 750 },
  { id: 15, name: 'Ironhide Plate', emoji: '🛡️', type: 'scale', rarity: 2, soulBonus: 0, powerBonus: 25, corruptionBonus: 0, craftBonus: 12, description: 'A massive plate of iron-hard minotaur hide, nearly impervious to damage', cost: 700 },
  { id: 16, name: 'Royal Griffin Talon', emoji: '🦅', type: 'bone', rarity: 2, soulBonus: 15, powerBonus: 15, corruptionBonus: 200, craftBonus: 0, description: 'A golden talon from a royal sky griffin, imbued with wind magic', cost: 850 },
  { id: 17, name: 'Inferno Coil Core', emoji: '☀️', type: 'ember', rarity: 2, soulBonus: 20, powerBonus: 10, corruptionBonus: 400, craftBonus: 8, description: 'The blazing core of an inferno coil serpent, impossibly hot to touch', cost: 780 },
  { id: 18, name: 'Leviathan Tentacle Segment', emoji: '🦑', type: 'fragment', rarity: 2, soulBonus: 0, powerBonus: 30, corruptionBonus: 0, craftBonus: 10, description: 'A severed segment of leviathan spawn tentacle that still twitches with life', cost: 820 },
  // Epic (6)
  { id: 19, name: 'Apocalypse Hydra Fang', emoji: '🐉', type: 'bone', rarity: 3, soulBonus: 50, powerBonus: 40, corruptionBonus: 1000, craftBonus: 15, description: 'A fang from the Apocalypse Hydra capable of shattering dimensional barriers', cost: 3000 },
  { id: 20, name: 'Omega Chimera Soul', emoji: '💀', type: 'essence', rarity: 3, soulBonus: 40, powerBonus: 30, corruptionBonus: 2000, craftBonus: 0, description: 'The pure soul essence of the Omega Chimera, containing all elements', cost: 2800 },
  { id: 21, name: 'Kraken Lord Crown Pearl', emoji: '👑', type: 'crystal', rarity: 3, soulBonus: 35, powerBonus: 0, corruptionBonus: 0, craftBonus: 20, description: 'A pearl from the crown of the Abyssal Kraken Lord, radiating oceanic power', cost: 3200 },
  { id: 22, name: 'Eternity Basilisk Gaze Gem', emoji: '💎', type: 'crystal', rarity: 3, soulBonus: 60, powerBonus: 0, corruptionBonus: 500, craftBonus: 18, description: 'A gem containing the petrifying gaze of the Eternity Basilisk', cost: 2900 },
  { id: 23, name: 'Warlord Minotaur Axe Blade', emoji: '🪓', type: 'bone', rarity: 3, soulBonus: 0, powerBonus: 55, corruptionBonus: 0, craftBonus: 25, description: 'The legendary axe blade of the Minotaur Warlord King', cost: 3100 },
  { id: 24, name: 'Celestial Griffin Star Feather', emoji: '⭐', type: 'fragment', rarity: 3, soulBonus: 45, powerBonus: 20, corruptionBonus: 0, craftBonus: 22, description: 'A feather from the Celestial Griffin Empress made of solid starlight', cost: 3300 },
  // Legendary (6)
  { id: 25, name: 'World-Ender Scale', emoji: '🐲', type: 'scale', rarity: 4, soulBonus: 80, powerBonus: 60, corruptionBonus: 5000, craftBonus: 30, description: 'A single scale from the World-Ender Hydra, large as a castle wall', cost: 10000 },
  { id: 26, name: 'Void Kraken Emperor Heart', emoji: '🌊', type: 'fragment', rarity: 4, soulBonus: 70, powerBonus: 50, corruptionBonus: 9999, craftBonus: 25, description: 'The dimensional heart of the Void Kraken Emperor, pulsing with void energy', cost: 9500 },
  { id: 27, name: 'Ouroboros Ring Scale', emoji: '♾️', type: 'crystal', rarity: 4, soulBonus: 0, powerBonus: 0, corruptionBonus: 0, craftBonus: 50, description: 'A scale from the Ouroboros Eternal Serpent, infinitely looping in on itself', cost: 11000 },
  { id: 28, name: 'Dawnbreaker Griffin Sun Plume', emoji: '🌅', type: 'ember', rarity: 4, soulBonus: 60, powerBonus: 40, corruptionBonus: 3000, craftBonus: 35, description: 'A plume from the Dawnbreaker Griffin radiating pure solar energy', cost: 9800 },
  { id: 29, name: 'Gorgon Prime Venom Gland', emoji: '☠️', type: 'essence', rarity: 4, soulBonus: 90, powerBonus: 30, corruptionBonus: 8000, craftBonus: 40, description: 'The primordial venom gland from which all basilisk venom descends', cost: 10500 },
  { id: 30, name: 'Labyrinth Architect Keystone', emoji: '🏛️', type: 'crystal', rarity: 4, soulBonus: 0, powerBonus: 0, corruptionBonus: 0, craftBonus: 60, description: 'The keystone that holds the infinite labyrinth together across dimensions', cost: 12000 },
];

// ── 25 Structures (upgradeable to Level 10) ──
// Five categories of structures: Sanctuary, Fortress, Forge, Library, Ritual.
// Each can be upgraded from level 1 to level 10 with increasing costs.
// Higher levels provide greater effects for beast taming and abyss survival.

interface MythicStructureDef {
  id: number;
  name: string;
  emoji: string;
  category: 'sanctuary' | 'fortress' | 'forge' | 'library' | 'ritual';
  baseEffect: number;
  effectPerLevel: number;
  description: string;
  baseCost: number;
  costMultiplier: number;
}

const MYTHIC_STRUCTURES: MythicStructureDef[] = [
  // Sanctuary (5)
  { id: 1, name: 'Beast Kennel', emoji: '🏠', category: 'sanctuary', baseEffect: 2, effectPerLevel: 1, description: 'A shelter for housing tamed mythic beasts of common rank', baseCost: 30, costMultiplier: 1.5 },
  { id: 2, name: 'Hydra Pool', emoji: '🌊', category: 'sanctuary', baseEffect: 5, effectPerLevel: 3, description: 'A regenerative pool that heals hydra-type beasts and restores soul essence', baseCost: 80, costMultiplier: 1.6 },
  { id: 3, name: 'Griffin Nest Tower', emoji: '🗼', category: 'sanctuary', baseEffect: 4, effectPerLevel: 2, description: 'A tall tower providing roosting space for griffin-type beasts', baseCost: 60, costMultiplier: 1.5 },
  { id: 4, name: 'Phoenix Ash Pit', emoji: '🔥', category: 'sanctuary', baseEffect: 6, effectPerLevel: 3, description: 'A sacred fire pit where phoenix serpents can undergo rebirth faster', baseCost: 100, costMultiplier: 1.7 },
  { id: 5, name: 'Beast Meditation Grove', emoji: '🌳', category: 'sanctuary', baseEffect: 3, effectPerLevel: 2, description: 'A grove of ancient abyssal trees that calms beasts and boosts taming success', baseCost: 50, costMultiplier: 1.4 },
  // Fortress (5)
  { id: 6, name: 'Abyss Gate', emoji: '🚪', category: 'fortress', baseEffect: 8, effectPerLevel: 4, description: 'A fortified gate that controls access to deeper abyss layers', baseCost: 150, costMultiplier: 1.8 },
  { id: 7, name: 'Minotaur Wall', emoji: '🧱', category: 'fortress', baseEffect: 10, effectPerLevel: 5, description: 'A massive stone wall constructed by minotaur labor, extremely durable', baseCost: 200, costMultiplier: 1.7 },
  { id: 8, name: 'Basilisk Gaze Tower', emoji: '👁️', category: 'fortress', baseEffect: 7, effectPerLevel: 4, description: 'A watchtower projecting a weakened basilisk gaze to slow intruders', baseCost: 250, costMultiplier: 1.8 },
  { id: 9, name: 'Kraken Moat', emoji: '🐙', category: 'fortress', baseEffect: 12, effectPerLevel: 6, description: 'A moat inhabited by tamed kraken tentacles that grab approaching threats', baseCost: 300, costMultiplier: 2.0 },
  { id: 10, name: 'Shadow Ward Barrier', emoji: '🛡️', category: 'fortress', baseEffect: 15, effectPerLevel: 7, description: 'A barrier of solidified shadow energy that absorbs and deflects attacks', baseCost: 350, costMultiplier: 1.9 },
  // Forge (5)
  { id: 11, name: 'Mythic Forge', emoji: '🔨', category: 'forge', baseEffect: 5, effectPerLevel: 3, description: 'A forge that crafts equipment from mythic beast materials', baseCost: 120, costMultiplier: 1.6 },
  { id: 12, name: 'Phoenix Smelter', emoji: '♨️', category: 'forge', baseEffect: 8, effectPerLevel: 4, description: 'Uses phoenix fire to smelt and refine the rarest materials', baseCost: 200, costMultiplier: 1.7 },
  { id: 13, name: 'Chimera Alloy Press', emoji: '⚙️', category: 'forge', baseEffect: 10, effectPerLevel: 5, description: 'Combines multiple materials into powerful hybrid alloys', baseCost: 280, costMultiplier: 1.8 },
  { id: 14, name: 'Dragon Breath Kiln', emoji: '🐉', category: 'forge', baseEffect: 12, effectPerLevel: 6, description: 'A kiln fired by captured dragon breath for extreme-temperature crafting', baseCost: 400, costMultiplier: 2.0 },
  { id: 15, name: 'Artifact Anvil', emoji: '⚒️', category: 'forge', baseEffect: 15, effectPerLevel: 8, description: 'A primordial anvil capable of forging legendary artifacts', baseCost: 600, costMultiplier: 2.2 },
  // Library (5)
  { id: 16, name: 'Myth Codex Shelf', emoji: '📚', category: 'library', baseEffect: 3, effectPerLevel: 2, description: 'Stores scrolls describing common beast weaknesses and behaviors', baseCost: 80, costMultiplier: 1.5 },
  { id: 17, name: 'Beast Lore Archive', emoji: '📜', category: 'library', baseEffect: 6, effectPerLevel: 3, description: 'A vast archive of mythic beast lore gathered across the ages', baseCost: 150, costMultiplier: 1.6 },
  { id: 18, name: 'Runic Translation Chamber', emoji: '🔤', category: 'library', baseEffect: 8, effectPerLevel: 4, description: 'Deciphers ancient runic inscriptions found throughout the abyss', baseCost: 250, costMultiplier: 1.7 },
  { id: 19, name: 'Prophecy Vault', emoji: '🔮', category: 'library', baseEffect: 10, effectPerLevel: 5, description: 'Contains sealed prophecies about mythic beasts and the abyss future', baseCost: 400, costMultiplier: 1.9 },
  { id: 20, name: 'Forbidden Grimoire Stand', emoji: '📕', category: 'library', baseEffect: 14, effectPerLevel: 7, description: 'Holds the most dangerous and powerful spell tomes in existence', baseCost: 600, costMultiplier: 2.1 },
  // Ritual (5)
  { id: 21, name: 'Soul Binding Circle', emoji: '⭕', category: 'ritual', baseEffect: 4, effectPerLevel: 2, description: 'A circle that binds beast souls for taming rituals', baseCost: 100, costMultiplier: 1.5 },
  { id: 22, name: 'Corruption Altar', emoji: '⚰️', category: 'ritual', baseEffect: 7, effectPerLevel: 4, description: 'An altar that channels abyss corruption into useful power', baseCost: 180, costMultiplier: 1.7 },
  { id: 23, name: 'Beast Summoning Pentagram', emoji: '⬡', category: 'ritual', baseEffect: 10, effectPerLevel: 5, description: 'A pentagram for summoning mythic beasts from deeper layers', baseCost: 300, costMultiplier: 1.8 },
  { id: 24, name: 'Artifact Activation Shrine', emoji: '⛩️', category: 'ritual', baseEffect: 12, effectPerLevel: 6, description: 'A shrine providing the energy needed to activate dormant artifacts', baseCost: 500, costMultiplier: 2.0 },
  { id: 25, name: 'Primordial Ritual Nexus', emoji: '🌀', category: 'ritual', baseEffect: 20, effectPerLevel: 10, description: 'The ultimate ritual site for channeling primordial abyss energy', baseCost: 800, costMultiplier: 2.5 },
];

// ── 22 Abilities ──
// Split between active abilities (cost soul essence, have cooldowns)
// and passive abilities (always active, no cost).
// Higher rarity abilities are significantly more powerful.
// Abilities are themed after the 7 mythic beast types.

interface MythicAbilityDef {
  id: number;
  name: string;
  emoji: string;
  type: 'active' | 'passive';
  rarity: number;
  soulCost: number;
  cooldown: number;
  effect: string;
  description: string;
}

const MYTHIC_ABILITIES: MythicAbilityDef[] = [
  // Common active (4)
  { id: 1, name: 'Shadow Step', emoji: '👤', type: 'active', rarity: 0, soulCost: 5, cooldown: 30, effect: 'stealth', description: 'Meld into shadows for a brief moment, becoming invisible to beasts' },
  { id: 2, name: 'Beast Whisper', emoji: '🎵', type: 'active', rarity: 0, soulCost: 8, cooldown: 45, effect: 'tame_boost', description: 'Project calming thoughts that increase taming success chance' },
  { id: 3, name: 'Soul Siphon', emoji: '🔋', type: 'active', rarity: 0, soulCost: 10, cooldown: 60, effect: 'drain', description: 'Drain soul essence from a nearby mythic beast to restore your own' },
  { id: 4, name: 'Abyss Bolt', emoji: '⚡', type: 'active', rarity: 0, soulCost: 7, cooldown: 40, effect: 'damage', description: 'Fire a bolt of concentrated abyss energy at a target beast' },
  // Common passive (1)
  { id: 5, name: 'Abyssal Sight', emoji: '👁️', type: 'passive', rarity: 0, soulCost: 0, cooldown: 0, effect: 'awareness', description: 'See hidden beasts and materials in the surrounding abyss automatically' },
  // Uncommon active (5)
  { id: 6, name: 'Kraken Grip', emoji: '🦑', type: 'active', rarity: 1, soulCost: 15, cooldown: 90, effect: 'restrain', description: 'Summon spectral kraken tentacles to restrain a beast in place' },
  { id: 7, name: 'Basilisk Daze', emoji: '😵', type: 'active', rarity: 1, soulCost: 12, cooldown: 60, effect: 'stun', description: 'Channel a weakened basilisk gaze that dazes beasts briefly' },
  { id: 8, name: 'Minotaur Charge', emoji: '🐂', type: 'active', rarity: 1, soulCost: 18, cooldown: 120, effect: 'charge', description: 'Channel minotaur strength for a devastating forward charge attack' },
  { id: 9, name: 'Griffin Dive', emoji: '🦅', type: 'active', rarity: 1, soulCost: 14, cooldown: 80, effect: 'aerial_strike', description: 'Leap from above with griffin-like dive attack force' },
  { id: 10, name: 'Chimera Fang Strike', emoji: '🦁', type: 'active', rarity: 1, soulCost: 16, cooldown: 70, effect: 'multi_hit', description: 'Strike with three different beast energies in rapid succession' },
  // Uncommon passive (1)
  { id: 11, name: 'Hydra Regeneration', emoji: '💚', type: 'passive', rarity: 1, soulCost: 0, cooldown: 0, effect: 'regen', description: 'Passively regenerate soul essence at an accelerated rate' },
  // Rare active (4)
  { id: 12, name: 'Phoenix Rebirth', emoji: '🔥', type: 'active', rarity: 2, soulCost: 25, cooldown: 300, effect: 'revive', description: 'Once per session, resurrect from defeat surrounded by phoenix fire' },
  { id: 13, name: 'Chimera Breath', emoji: '🌊', type: 'active', rarity: 2, soulCost: 20, cooldown: 180, effect: 'area_damage', description: 'Exhale a triple-element breath attack of fire, ice, and lightning' },
  { id: 14, name: 'Mythic Roar', emoji: '📢', type: 'active', rarity: 2, soulCost: 22, cooldown: 150, effect: 'fear', description: 'Release a terrifying roar that intimidates all nearby beasts' },
  { id: 15, name: 'Shadow Clone', emoji: '👤', type: 'active', rarity: 2, soulCost: 20, cooldown: 200, effect: 'decoy', description: 'Create a shadow clone to distract beasts while you tame them' },
  // Rare passive (2)
  { id: 16, name: 'Corruption Resistance', emoji: '🛡️', type: 'passive', rarity: 2, soulCost: 0, cooldown: 0, effect: 'resist', description: 'Passively reduce corruption accumulation from abyss exposure' },
  { id: 17, name: 'Artifact Sense', emoji: '🔍', type: 'passive', rarity: 2, soulCost: 0, cooldown: 0, effect: 'detect', description: 'Sense the presence of hidden artifacts within a wide radius' },
  // Epic active (3)
  { id: 18, name: 'Dragon Fury', emoji: '🐲', type: 'active', rarity: 3, soulCost: 40, cooldown: 600, effect: 'devastate', description: 'Unleash the fury of an elder dragon in a devastating area attack' },
  { id: 19, name: 'Time Stop Gaze', emoji: '⏸️', type: 'active', rarity: 3, soulCost: 50, cooldown: 900, effect: 'freeze_time', description: 'Channel the Eternity Basilisk power to briefly stop time around you' },
  { id: 20, name: 'Labyrinth Shift', emoji: '🔮', type: 'active', rarity: 3, soulCost: 45, cooldown: 600, effect: 'teleport', description: 'Shift through the labyrinth dimension to teleport anywhere' },
  // Epic passive (1)
  { id: 21, name: 'Celestial Flight', emoji: '✈️', type: 'passive', rarity: 3, soulCost: 0, cooldown: 0, effect: 'flight', description: 'Sprout celestial griffin wings enabling permanent flight over obstacles' },
  // Legendary active (1)
  { id: 22, name: 'Primordial Command', emoji: '👑', type: 'active', rarity: 4, soulCost: 60, cooldown: 1200, effect: 'dominate', description: 'Command any mythic beast to temporarily obey your will absolutely' },
];

// ── 18 Achievements ──
// Achievements track milestones across taming, exploration, building,
// artifact activation, and glory accumulation.
// Each achievement provides a reward of soul, power, glory, or title progress.

interface MythicAchievementDef {
  id: number;
  name: string;
  emoji: string;
  description: string;
  conditionType: 'tame' | 'corruption' | 'layer' | 'structure' | 'beast_rarity' | 'artifact' | 'craft' | 'title' | 'glory';
  conditionValue: number;
  reward: { type: 'soul' | 'power' | 'glory' | 'title'; amount: number };
}

const MYTHIC_ACHIEVEMENTS: MythicAchievementDef[] = [
  { id: 1, name: 'First Whisper', emoji: '🐉', description: 'Tame your first mythic beast', conditionType: 'tame', conditionValue: 1, reward: { type: 'soul', amount: 10 } },
  { id: 2, name: 'Beast Collector', emoji: '🦁', description: 'Tame 5 different mythic beasts', conditionType: 'tame', conditionValue: 5, reward: { type: 'soul', amount: 20 } },
  { id: 3, name: 'Corruption Initiate', emoji: '🕳️', description: 'Reach a corruption depth of 500', conditionType: 'corruption', conditionValue: 500, reward: { type: 'power', amount: 15 } },
  { id: 4, name: 'Layer Explorer', emoji: '🗺️', description: 'Explore 3 different abyss layers', conditionType: 'layer', conditionValue: 3, reward: { type: 'glory', amount: 50 } },
  { id: 5, name: 'Foundation Stone', emoji: '🏗️', description: 'Build your first mythic structure', conditionType: 'structure', conditionValue: 1, reward: { type: 'glory', amount: 30 } },
  { id: 6, name: 'Rare Conquest', emoji: '💎', description: 'Tame a rare tier mythic beast', conditionType: 'beast_rarity', conditionValue: 2, reward: { type: 'soul', amount: 30 } },
  { id: 7, name: 'Artifact Curator', emoji: '🏺', description: 'Activate 5 different artifacts', conditionType: 'artifact', conditionValue: 5, reward: { type: 'glory', amount: 100 } },
  { id: 8, name: 'Deep Corruption', emoji: '💀', description: 'Reach a corruption depth of 4000', conditionType: 'corruption', conditionValue: 4000, reward: { type: 'power', amount: 30 } },
  { id: 9, name: 'Epic Beast Tamer', emoji: '🌟', description: 'Tame an epic tier mythic beast', conditionType: 'beast_rarity', conditionValue: 3, reward: { type: 'soul', amount: 50 } },
  { id: 10, name: 'Abyss Cartographer', emoji: '🌍', description: 'Explore all 8 abyss layers', conditionType: 'layer', conditionValue: 8, reward: { type: 'title', amount: 3 } },
  { id: 11, name: 'Structure Architect', emoji: '🏛️', description: 'Upgrade a structure to level 5', conditionType: 'structure', conditionValue: 5, reward: { type: 'glory', amount: 200 } },
  { id: 12, name: 'Half Bestiary', emoji: '📖', description: 'Tame 18 different mythic beasts', conditionType: 'tame', conditionValue: 18, reward: { type: 'soul', amount: 50 } },
  { id: 13, name: 'Corruption Champion', emoji: '🏅', description: 'Reach a corruption depth of 9000', conditionType: 'corruption', conditionValue: 9000, reward: { type: 'power', amount: 50 } },
  { id: 14, name: 'Legendary Tamer', emoji: '👑', description: 'Tame a legendary tier mythic beast', conditionType: 'beast_rarity', conditionValue: 4, reward: { type: 'title', amount: 4 } },
  { id: 15, name: 'Structure Metropolis', emoji: '🏙️', description: 'Build 10 mythic structures', conditionType: 'structure', conditionValue: 10, reward: { type: 'glory', amount: 500 } },
  { id: 16, name: 'Complete Bestiary', emoji: '📚', description: 'Tame all 35 mythic beasts', conditionType: 'tame', conditionValue: 35, reward: { type: 'title', amount: 6 } },
  { id: 17, name: 'Elder Sovereign', emoji: '🛡️', description: 'Reach Mythic Overlord title', conditionType: 'title', conditionValue: 7, reward: { type: 'soul', amount: 100 } },
  { id: 18, name: 'Glory Legend', emoji: '🏆', description: 'Accumulate 5000 glory', conditionType: 'glory', conditionValue: 5000, reward: { type: 'title', amount: 7 } },
];

// ── 8 Titles ──
// Titles represent progression milestones in the Mythic Abyss.
// Each title requires meeting thresholds of glory, corruption, and beasts tamed.
// Higher titles unlock access to deeper, more dangerous layers.

const TITLE_THRESHOLDS = [
  { index: 0, name: MX_TITLES[0], minGlory: 0, minCorruption: 0, minBeasts: 0 },
  { index: 1, name: MX_TITLES[1], minGlory: 50, minCorruption: 200, minBeasts: 3 },
  { index: 2, name: MX_TITLES[2], minGlory: 200, minCorruption: 500, minBeasts: 7 },
  { index: 3, name: MX_TITLES[3], minGlory: 500, minCorruption: 1500, minBeasts: 12 },
  { index: 4, name: MX_TITLES[4], minGlory: 1200, minCorruption: 4000, minBeasts: 18 },
  { index: 5, name: MX_TITLES[5], minGlory: 2500, minCorruption: 6000, minBeasts: 24 },
  { index: 6, name: MX_TITLES[6], minGlory: 5000, minCorruption: 9000, minBeasts: 30 },
  { index: 7, name: MX_TITLES[7], minGlory: 8000, minCorruption: 9999, minBeasts: 35 },
];

// ── 15 Artifacts ──
// Artifacts are powerful mythic items that can be activated for a cost.
// Each artifact is linked to a specific beast type for synergy bonuses.
// Higher rarity artifacts provide dramatically more powerful effects.

interface MythicArtifactDef {
  id: number;
  name: string;
  emoji: string;
  rarity: number;
  activationCost: number;
  power: number;
  effect: string;
  description: string;
  beastType: number;
}

const MYTHIC_ARTIFACTS: MythicArtifactDef[] = [
  { id: 1, name: 'Shadow Cloak', emoji: '🧥', rarity: 0, activationCost: 20, power: 10, effect: 'stealth_boost', description: 'A cloak woven from abyssal shadows, enhancing stealth abilities', beastType: -1 },
  { id: 2, name: 'Hydra Fang Amulet', emoji: '📿', rarity: 0, activationCost: 25, power: 12, effect: 'regen_boost', description: 'An amulet containing a hydra fang, granting passive regeneration', beastType: TYPE_DRAGON_HYDRA },
  { id: 3, name: 'Chimera Tri-Orb', emoji: '🔮', rarity: 0, activationCost: 30, power: 15, effect: 'elemental_resist', description: 'A three-colored orb granting resistance to fire, ice, and lightning', beastType: TYPE_CHIMERA },
  { id: 4, name: 'Kraken Ink Lens', emoji: '🔍', rarity: 1, activationCost: 50, power: 20, effect: 'vision_enhance', description: 'A lens of solidified kraken ink that reveals hidden truths', beastType: TYPE_KRAKEN },
  { id: 5, name: 'Basilisk Stone Shield', emoji: '🛡️', rarity: 1, activationCost: 55, power: 22, effect: 'petrify_aura', description: 'A shield of petrified basilisk scales that slows nearby enemies', beastType: TYPE_BASILISK },
  { id: 6, name: 'Minotaur War Horn', emoji: '📯', rarity: 1, activationCost: 60, power: 25, effect: 'intimidate', description: 'A horn carved from a minotaur skull that demoralizes all enemies', beastType: TYPE_MINOTAUR },
  { id: 7, name: 'Griffin Wind Talon', emoji: '🦅', rarity: 1, activationCost: 65, power: 28, effect: 'speed_boost', description: 'A griffin talon channeling wind energy for incredible speed', beastType: TYPE_GRIFFIN },
  { id: 8, name: 'Phoenix Ember Heart', emoji: '❤️', rarity: 1, activationCost: 70, power: 30, effect: 'fire_shield', description: 'A crystallized phoenix heart projecting a protective fire barrier', beastType: TYPE_PHOENIX_SERPENT },
  { id: 9, name: 'Apocalypse Hydra Crown', emoji: '👑', rarity: 2, activationCost: 150, power: 45, effect: 'multi_head', description: 'A crown from the Apocalypse Hydra granting multi-target attacks', beastType: TYPE_DRAGON_HYDRA },
  { id: 10, name: 'Omega Chimera Core', emoji: '💎', rarity: 2, activationCost: 160, power: 50, effect: 'elemental_mastery', description: 'The core of the Omega Chimera, granting mastery over all elements', beastType: TYPE_CHIMERA },
  { id: 11, name: 'Kraken Lord Trident', emoji: '🔱', rarity: 2, activationCost: 170, power: 55, effect: 'tidal_control', description: 'The trident of the Kraken Lord, commanding the abyssal tides', beastType: TYPE_KRAKEN },
  { id: 12, name: 'Eternity Basilisk Eye', emoji: '👁️', rarity: 3, activationCost: 400, power: 80, effect: 'time_slow', description: 'The eye of the Eternity Basilisk that slows time in a wide radius', beastType: TYPE_BASILISK },
  { id: 13, name: 'Warlord Axe of the Labyrinth', emoji: '🪓', rarity: 3, activationCost: 450, power: 90, effect: 'wall_break', description: 'The Warlord Minotaur axe that shatters any barrier or defense', beastType: TYPE_MINOTAUR },
  { id: 14, name: 'Celestial Griffin Wings', emoji: '🪽', rarity: 3, activationCost: 500, power: 100, effect: 'permanent_flight', description: 'Wings from the Celestial Griffin Empress granting eternal flight', beastType: TYPE_GRIFFIN },
  { id: 15, name: 'Ouroboros Eternal Ring', emoji: '💍', rarity: 4, activationCost: 1000, power: 200, effect: 'infinite_cycle', description: 'The ring of the Ouroboros granting the power of infinite rebirth', beastType: TYPE_PHOENIX_SERPENT },
];

// ── 12 Abyss Events ──
// Events are temporary modifiers that alter the abyss environment.
// They last for a limited duration and provide various bonuses.
// Only one event can be active at a time.
// Events include beast surges, material rains, corruption waves, and more.

interface MythicEventDef {
  id: number;
  name: string;
  emoji: string;
  description: string;
  duration: number;
  effectType: 'beast_surge' | 'material_rain' | 'corruption_wave' | 'artifact_discovery' | 'layer_shift' | 'glory_festival' | 'beast_rage' | 'mythic_eclipse' | 'soul_storm' | 'ancient_awakening' | 'abyss_bloom' | 'primordial_echo';
  magnitude: number;
}

const MYTHIC_EVENTS: MythicEventDef[] = [
  { id: 1, name: 'Beast Surge', emoji: '🐉', description: 'A surge of mythic energy causes beasts to appear more frequently for a limited time.', duration: 300, effectType: 'beast_surge', magnitude: 2 },
  { id: 2, name: 'Material Rain', emoji: '✨', description: 'Mythic materials rain down from the abyss ceiling, increasing harvest rates greatly.', duration: 240, effectType: 'material_rain', magnitude: 3 },
  { id: 3, name: 'Corruption Wave', emoji: '💀', description: 'A wave of corruption sweeps through, increasing danger but also increasing all rewards.', duration: 180, effectType: 'corruption_wave', magnitude: 2 },
  { id: 4, name: 'Artifact Discovery', emoji: '🏺', description: 'An ancient cache of artifacts has been unearthed, revealing hidden relics in all layers.', duration: 120, effectType: 'artifact_discovery', magnitude: 1 },
  { id: 5, name: 'Layer Shift', emoji: '🌀', description: 'The abyss layers shift and blur, temporarily allowing access to deeper layer beasts.', duration: 360, effectType: 'layer_shift', magnitude: 2 },
  { id: 6, name: 'Glory Festival', emoji: '🏆', description: 'A festival in the abyss doubles all glory earned from every activity.', duration: 300, effectType: 'glory_festival', magnitude: 2 },
  { id: 7, name: 'Beast Rage', emoji: '😠', description: 'Mythic beasts enter a rage state, becoming harder to tame but offering greater rewards.', duration: 200, effectType: 'beast_rage', magnitude: 3 },
  { id: 8, name: 'Mythic Eclipse', emoji: '🌑', description: 'An eclipse darkens the abyss, strengthening shadow-type beasts and abilities.', duration: 250, effectType: 'mythic_eclipse', magnitude: 2 },
  { id: 9, name: 'Soul Storm', emoji: '⚡', description: 'A storm of soul essence sweeps through, boosting soul regeneration massively.', duration: 180, effectType: 'soul_storm', magnitude: 3 },
  { id: 10, name: 'Ancient Awakening', emoji: '🗿', description: 'Ancient mythic beings stir from slumber, making legendary beasts briefly tamable.', duration: 150, effectType: 'ancient_awakening', magnitude: 1 },
  { id: 11, name: 'Abyss Bloom', emoji: '🌺', description: 'Bioluminescent flora blooms across the abyss, increasing material drop rates.', duration: 280, effectType: 'abyss_bloom', magnitude: 2 },
  { id: 12, name: 'Primordial Echo', emoji: '👁️', description: 'Echoes of the primordial throne reverberate, boosting all mythic power temporarily.', duration: 200, effectType: 'primordial_echo', magnitude: 3 },
];

// ───────────────────────────────────────────────────────────────────
// INTERNAL TYPES
// ───────────────────────────────────────────────────────────────────
// These types define the shape of player state and tracked entities.
// All state is managed via React useState within the hook.

interface TamedBeast {
  beastId: number;
  count: number;
  firstTamedAt: number;
  lastTamedAt: number;
  released: number;
}

interface MaterialStack {
  materialId: number;
  quantity: number;
  acquiredAt: number;
}

interface BuiltStructure {
  structureId: number;
  level: number;
  builtAt: number;
  lastUpgradeAt: number;
}

interface ActivatedArtifact {
  artifactId: number;
  activatedAt: number;
  charges: number;
  lastUsedAt: number;
}

interface EarnedAchievement {
  achievementId: number;
  earnedAt: number;
  claimed: boolean;
}

interface ActiveEvent {
  eventId: number;
  startedAt: number;
  endsAt: number;
}

interface MythicAbyssState {
  beasts: TamedBeast[];
  layers: boolean[];
  inventory: MaterialStack[];
  structures: BuiltStructure[];
  artifacts: ActivatedArtifact[];
  achievements: EarnedAchievement[];
  currentLayer: number;
  soulEssence: number;
  mythicPower: number;
  corruptionReached: number;
  currentCorruption: number;
  beastsTamed: number;
  totalTames: number;
  totalReleases: number;
  totalCrafts: number;
  totalArtifactActivations: number;
  titleIndex: number;
  glory: number;
  activeEvent: ActiveEvent | null;
  totalEventsTriggered: number;
  totalExpeditions: number;
  totalPlayTime: number;
  sessionStart: number;
}

// ───────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS (pure, no hooks, no "use" prefix)
// ───────────────────────────────────────────────────────────────────
// These are pure functions used throughout the module for lookups,
// calculations, and data transformations. They do NOT use React hooks.

function createInitialState(): MythicAbyssState {
  return {
    beasts: [],
    layers: [true, false, false, false, false, false, false, false],
    inventory: [],
    structures: [],
    artifacts: [],
    achievements: [],
    currentLayer: 0,
    soulEssence: MX_MAX_SOUL_ESSENCE,
    mythicPower: MX_MAX_MYTHIC_POWER,
    corruptionReached: 0,
    currentCorruption: 0,
    beastsTamed: 0,
    totalTames: 0,
    totalReleases: 0,
    totalCrafts: 0,
    totalArtifactActivations: 0,
    titleIndex: 0,
    glory: 0,
    activeEvent: null,
    totalEventsTriggered: 0,
    totalExpeditions: 0,
    totalPlayTime: 0,
    sessionStart: Date.now(),
  };
}

function getBeastDef(id: number): MythicBeastDef | undefined {
  return MYTHIC_BEASTS.find(b => b.id === id);
}

function getLayerDef(id: number): AbyssLayerDef | undefined {
  return ABYSS_LAYERS.find(l => l.id === id);
}

function getMaterialDef(id: number): MythicMaterialDef | undefined {
  return MYTHIC_MATERIALS.find(m => m.id === id);
}

function getStructureDef(id: number): MythicStructureDef | undefined {
  return MYTHIC_STRUCTURES.find(s => s.id === id);
}

function getAbilityDef(id: number): MythicAbilityDef | undefined {
  return MYTHIC_ABILITIES.find(a => a.id === id);
}

function getAchievementDef(id: number): MythicAchievementDef | undefined {
  return MYTHIC_ACHIEVEMENTS.find(a => a.id === id);
}

function getArtifactDef(id: number): MythicArtifactDef | undefined {
  return MYTHIC_ARTIFACTS.find(a => a.id === id);
}

function getEventDef(id: number): MythicEventDef | undefined {
  return MYTHIC_EVENTS.find(e => e.id === id);
}

function getBeastsByType(typeIdx: number): MythicBeastDef[] {
  return MYTHIC_BEASTS.filter(b => b.type === typeIdx);
}

function getBeastsByRarity(rarityIdx: number): MythicBeastDef[] {
  return MYTHIC_BEASTS.filter(b => b.rarity === rarityIdx);
}

function getBeastsByLayer(layerIdx: number): MythicBeastDef[] {
  return MYTHIC_BEASTS.filter(b => b.layer === layerIdx);
}

function getMaterialsByRarity(rarityIdx: number): MythicMaterialDef[] {
  return MYTHIC_MATERIALS.filter(m => m.rarity === rarityIdx);
}

function getMaterialsByType(type: string): MythicMaterialDef[] {
  return MYTHIC_MATERIALS.filter(m => m.type === type);
}

function getStructuresByCategory(category: string): MythicStructureDef[] {
  return MYTHIC_STRUCTURES.filter(s => s.category === category);
}

function getAbilitiesByRarity(rarityIdx: number): MythicAbilityDef[] {
  return MYTHIC_ABILITIES.filter(a => a.rarity === rarityIdx);
}

function getArtifactsByRarity(rarityIdx: number): MythicArtifactDef[] {
  return MYTHIC_ARTIFACTS.filter(a => a.rarity === rarityIdx);
}

function getArtifactsByBeastType(beastType: number): MythicArtifactDef[] {
  return MYTHIC_ARTIFACTS.filter(a => a.beastType === beastType);
}

function calculateBeastPower(beastId: number, count: number): number {
  const def = getBeastDef(beastId);
  if (!def) return 0;
  const rarityMult = MX_RARITY_MULTIPLIERS[def.rarity] ?? 1;
  return def.soulPower * count * rarityMult;
}

function calculateStructureTotalValue(structures: BuiltStructure[]): number {
  let total = 0;
  for (const entry of structures) {
    const def = getStructureDef(entry.structureId);
    if (def) {
      const cost = calculateStructureCost(entry.structureId, entry.level - 1);
      total += cost;
    }
  }
  return total;
}

function calculateArtifactTotalPower(artifacts: ActivatedArtifact[]): number {
  let total = 0;
  for (const entry of artifacts) {
    const def = getArtifactDef(entry.artifactId);
    if (def) {
      total += def.power * entry.charges;
    }
  }
  return total;
}

function getLayerColor(layerId: number): string {
  const colors = ['#1A1A3E', '#00FF7F', '#1E90FF', '#7B2D8E', '#A0522D', '#DAA520', '#FF4500', '#DAA520'];
  return colors[layerId] ?? '#0A0A2E';
}

function getRarityColor(rarity: number): string {
  return MX_RARITY_COLORS[rarity] ?? '#78909C';
}

function calculateStructureCost(structureId: number, currentLevel: number): number {
  const def = getStructureDef(structureId);
  if (!def) return Infinity;
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
}

function calculateCorruptionPressure(corruption: number): number {
  return Math.floor(corruption * 0.01);
}

function calculateGloryForBeast(rarity: number): number {
  const multipliers = [5, 15, 50, 150, 500];
  return multipliers[rarity] ?? 5;
}

function calculateHighestBeastRarity(beasts: TamedBeast[]): number {
  let highest = -1;
  for (const entry of beasts) {
    const def = getBeastDef(entry.beastId);
    if (def && def.rarity > highest) {
      highest = def.rarity;
    }
  }
  return highest;
}

function calculateHighestStructureLevel(structures: BuiltStructure[]): number {
  let highest = 0;
  for (const entry of structures) {
    if (entry.level > highest) {
      highest = entry.level;
    }
  }
  return highest;
}

function calculateTotalMaterials(inventory: MaterialStack[]): number {
  let total = 0;
  for (const stack of inventory) {
    total += stack.quantity;
  }
  return total;
}

function calculateTotalStructureEffect(structures: BuiltStructure[]): number {
  let total = 0;
  for (const entry of structures) {
    const def = getStructureDef(entry.structureId);
    if (def) {
      total += def.baseEffect + def.effectPerLevel * entry.level;
    }
  }
  return total;
}

// ───────────────────────────────────────────────────────────────────
// THE HOOK
// ───────────────────────────────────────────────────────────────────

export default function useMythicAbyss() {
  const [state, setState] = useState<MythicAbyssState>(createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Side effect: expiring active events ──

  useEffect(() => {
    if (!state.activeEvent) return;
    const now = Date.now();
    if (now >= state.activeEvent.endsAt) {
      setState(prev => ({ ...prev, activeEvent: null }));
    }
  }, [state.activeEvent]);

  // ── Side effect: passive soul essence regeneration ──

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.soulEssence >= MX_MAX_SOUL_ESSENCE) return prev;
        return { ...prev, soulEssence: Math.min(MX_MAX_SOUL_ESSENCE, prev.soulEssence + 1) };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // useMemo COMPUTED VALUES (using state parameter, never stateRef.current)
  // ─────────────────────────────────────────────────────────────────

  const beastCatalog = useMemo(() => {
    const s = state;
    const byRarity: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const byType: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const entry of s.beasts) {
      const def = getBeastDef(entry.beastId);
      if (def) {
        byRarity[def.rarity] = (byRarity[def.rarity] ?? 0) + 1;
        byType[def.type] = (byType[def.type] ?? 0) + 1;
      }
    }
    const maxRarity = calculateHighestBeastRarity(s.beasts);
    return { byRarity, byType, maxRarity, totalEntries: s.beasts.length };
  }, [state]);

  const exploredLayerCount = useMemo(() => {
    return state.layers.filter(Boolean).length;
  }, [state.layers]);

  const structureCatalog = useMemo(() => {
    const s = state;
    const byCategory: Record<string, number> = {};
    const built: Array<{ id: number; level: number; name: string; category: string }> = [];
    for (const entry of s.structures) {
      const def = getStructureDef(entry.structureId);
      if (def) {
        built.push({ id: entry.structureId, level: entry.level, name: def.name, category: def.category });
        byCategory[def.category] = (byCategory[def.category] ?? 0) + 1;
      }
    }
    const highestLevel = calculateHighestStructureLevel(s.structures);
    const totalEffect = calculateTotalStructureEffect(s.structures);
    return { built, highestLevel, totalStructures: s.structures.length, byCategory, totalEffect };
  }, [state]);

  const artifactCatalog = useMemo(() => {
    const s = state;
    const activated: Array<{ id: number; charges: number; name: string; rarity: number }> = [];
    for (const entry of s.artifacts) {
      const def = getArtifactDef(entry.artifactId);
      if (def) {
        activated.push({ id: entry.artifactId, charges: entry.charges, name: def.name, rarity: def.rarity });
      }
    }
    const totalCharges = s.artifacts.reduce((sum, a) => sum + a.charges, 0);
    return { activated, totalActivated: s.artifacts.length, totalCharges };
  }, [state]);

  const achievementCatalog = useMemo(() => {
    const s = state;
    const earned: Array<{ id: number; name: string; claimed: boolean }> = [];
    for (const entry of s.achievements) {
      const def = getAchievementDef(entry.achievementId);
      if (def) {
        earned.push({ id: entry.achievementId, name: def.name, claimed: entry.claimed });
      }
    }
    const totalEarned = s.achievements.length;
    const unclaimedCount = s.achievements.filter(a => !a.claimed).length;
    return { earned, totalEarned, unclaimedCount };
  }, [state]);

  const inventorySummary = useMemo(() => {
    const s = state;
    const materials: Array<{ id: number; name: string; quantity: number; rarity: number; type: string }> = [];
    for (const stack of s.inventory) {
      const def = getMaterialDef(stack.materialId);
      if (def) {
        materials.push({ id: stack.materialId, name: def.name, quantity: stack.quantity, rarity: def.rarity, type: def.type });
      }
    }
    const totalItems = calculateTotalMaterials(s.inventory);
    const uniqueMaterials = s.inventory.length;
    return { materials, totalItems, uniqueMaterials };
  }, [state]);

  const activeEventInfo = useMemo(() => {
    const s = state;
    if (!s.activeEvent) return null;
    const def = getEventDef(s.activeEvent.eventId);
    if (!def) return null;
    const now = Date.now();
    const remaining = Math.max(0, s.activeEvent.endsAt - now);
    const minutesRemaining = Math.floor(remaining / 60000);
    const secondsRemaining = Math.floor((remaining % 60000) / 1000);
    const progressPercent = Math.max(0, Math.min(100, ((def.duration * 1000 - remaining) / (def.duration * 1000)) * 100));
    return {
      def,
      remaining,
      minutesRemaining,
      secondsRemaining,
      progressPercent,
      startedAt: s.activeEvent.startedAt,
      endsAt: s.activeEvent.endsAt,
    };
  }, [state.activeEvent]);

  const titleInfo = useMemo(() => {
    const s = state;
    const currentTitle = TITLE_THRESHOLDS[s.titleIndex];
    if (!currentTitle) return { current: null, next: null, maxReached: false };
    const nextThreshold = TITLE_THRESHOLDS[s.titleIndex + 1];
    if (!nextThreshold) return { current: currentTitle, next: null, maxReached: true };
    return { current: currentTitle, next: nextThreshold, maxReached: false };
  }, [state.titleIndex]);

  const corruptionZoneProgress = useMemo(() => {
    const total = MX_MAX_CORRUPTION;
    return Math.min(100, (state.corruptionReached / total) * 100);
  }, [state.corruptionReached]);

  const gloryProgress = useMemo(() => {
    const total = MX_MAX_GLORY;
    return Math.min(100, (state.glory / total) * 100);
  }, [state.glory]);

  const beastCompletionPercent = useMemo(() => {
    return Math.floor((state.beastsTamed / MX_TOTAL_BEASTS) * 100);
  }, [state.beastsTamed]);

  const layerCompletionPercent = useMemo(() => {
    return Math.floor((exploredLayerCount / ABYSS_LAYERS.length) * 100);
  }, [exploredLayerCount]);

  const achievementCompletionPercent = useMemo(() => {
    return Math.floor((achievementCatalog.totalEarned / MYTHIC_ACHIEVEMENTS.length) * 100);
  }, [achievementCatalog.totalEarned]);

  const overallProgress = useMemo(() => {
    const bp = beastCompletionPercent;
    const lp = layerCompletionPercent;
    const ap = achievementCompletionPercent;
    const cp = corruptionZoneProgress;
    return Math.floor((bp + lp + ap + cp) / 4);
  }, [beastCompletionPercent, layerCompletionPercent, achievementCompletionPercent, corruptionZoneProgress]);

  const titleProgress = useMemo(() => {
    const s = state;
    const ti = s.titleIndex;
    if (ti >= TITLE_THRESHOLDS.length - 1) {
      return { maxTitleReached: true, gloryProgress: 100, corruptionProgress: 100, beastProgress: 100 };
    }
    const current = TITLE_THRESHOLDS[ti];
    const next = TITLE_THRESHOLDS[ti + 1];
    if (!current || !next) {
      return { maxTitleReached: true, gloryProgress: 100, corruptionProgress: 100, beastProgress: 100 };
    }
    const gloryRange = next.minGlory - current.minGlory;
    const corruptionRange = next.minCorruption - current.minCorruption;
    const beastRange = next.minBeasts - current.minBeasts;
    return {
      maxTitleReached: false,
      gloryProgress: gloryRange > 0 ? Math.min(100, ((s.glory - current.minGlory) / gloryRange) * 100) : 100,
      corruptionProgress: corruptionRange > 0 ? Math.min(100, ((s.corruptionReached - current.minCorruption) / corruptionRange) * 100) : 100,
      beastProgress: beastRange > 0 ? Math.min(100, ((s.beastsTamed - current.minBeasts) / beastRange) * 100) : 100,
    };
  }, [state]);

  const rarityBeastBonus = useMemo(() => {
    const s = state;
    const rarityBonuses = MX_RARITY_NAMES.map((name, idx) => {
      const beastsOfRarity = MYTHIC_BEASTS.filter(b => b.rarity === idx);
      const collected = s.beasts.filter(entry => {
        const bd = getBeastDef(entry.beastId);
        return bd && bd.rarity === idx;
      }).length;
      const total = beastsOfRarity.length;
      return { rarity: name, collected, total, bonusApplied: collected === total };
    });
    const totalBonusPower = rarityBonuses
      .filter(b => b.bonusApplied)
      .reduce((sum, _, idx) => sum + (idx + 1) * 50, 0);
    return { rarityBonuses, totalBonusPower };
  }, [state]);

  const layerDangerStats = useMemo(() => {
    const s = state;
    const stats = ABYSS_LAYERS.map(layer => {
      const unlocked = layer.requiredTitle <= s.titleIndex;
      const corruptionMet = s.corruptionReached >= layer.corruptionRange[0] || layer.requiredTitle === 0;
      const accessible = unlocked && (corruptionMet || layer.requiredTitle === 0);
      const explored = s.layers[layer.id] ?? false;
      const beastsFound = layer.beastsAvailable.filter(bId =>
        s.beasts.some(b => b.beastId === bId),
      ).length;
      return {
        layerId: layer.id,
        name: layer.name,
        unlocked,
        accessible,
        explored,
        dangerLevel: layer.corruptionRange[1] - layer.corruptionRange[0],
        beastsTotal: layer.beastsAvailable.length,
        beastsFound,
      };
    });
    return stats;
  }, [state]);

  const materialRaritySummary = useMemo(() => {
    const s = state;
    const summary = MX_RARITY_NAMES.map((rarityName, rarityIdx) => {
      const allOfRarity = getMaterialsByRarity(rarityIdx);
      const owned = s.inventory.filter(entry => {
        const def = getMaterialDef(entry.materialId);
        return def && def.rarity === rarityIdx;
      }).reduce((sum, entry) => sum + entry.quantity, 0);
      return {
        rarity: rarityName,
        rarityIndex: rarityIdx,
        totalTypes: allOfRarity.length,
        ownedQuantity: owned,
        color: getRarityColor(rarityIdx),
      };
    });
    return summary;
  }, [state]);

  const structureCategorySummary = useMemo(() => {
    const s = state;
    const summary = MX_STRUCTURE_CATEGORIES.map(category => {
      const allInCategory = getStructuresByCategory(category);
      const built = allInCategory.filter(def =>
        s.structures.some(st => st.structureId === def.id),
      ).length;
      const totalEffect = allInCategory.reduce((sum, def) => {
        const entry = s.structures.find(st => st.structureId === def.id);
        if (!entry) return sum;
        return sum + def.baseEffect + def.effectPerLevel * entry.level;
      }, 0);
      return {
        category,
        totalStructures: allInCategory.length,
        built,
        totalEffect,
        completionPercent: allInCategory.length > 0 ? Math.floor((built / allInCategory.length) * 100) : 0,
      };
    });
    return summary;
  }, [state]);

  const artifactRaritySummary = useMemo(() => {
    const s = state;
    const summary = MX_RARITY_NAMES.map((rarityName, rarityIdx) => {
      const allOfRarity = getArtifactsByRarity(rarityIdx);
      const activated = allOfRarity.filter(def =>
        s.artifacts.some(a => a.artifactId === def.id),
      ).length;
      const totalCharges = allOfRarity.reduce((sum, def) => {
        const entry = s.artifacts.find(a => a.artifactId === def.id);
        if (!entry) return sum;
        return sum + entry.charges;
      }, 0);
      return {
        rarity: rarityName,
        rarityIndex: rarityIdx,
        totalArtifacts: allOfRarity.length,
        activated,
        totalCharges,
        color: getRarityColor(rarityIdx),
      };
    });
    return summary;
  }, [state]);

  const beastPowerBreakdown = useMemo(() => {
    const s = state;
    const breakdown = s.beasts.map(entry => {
      const def = getBeastDef(entry.beastId);
      if (!def) return null;
      return {
        beastId: entry.beastId,
        name: def.name,
        emoji: def.emoji,
        rarity: def.rarity,
        rarityName: MX_RARITY_NAMES[def.rarity],
        typeName: MX_BEAST_TYPES[def.type],
        count: entry.count,
        individualPower: def.soulPower,
        totalPower: calculateBeastPower(entry.beastId, entry.count),
        auraColor: def.auraColor,
      };
    }).filter((b): b is NonNull<typeof b> => b !== null);

type NonNull<T> = T extends infer U ? NonNullable<U> : never;
    const grandTotal = breakdown.reduce((sum, b) => sum + b.totalPower, 0);
    return { breakdown, grandTotal };
  }, [state]);

  const explorationSummary = useMemo(() => {
    const s = state;
    const layers = ABYSS_LAYERS.map(layer => {
      const explored = s.layers[layer.id] ?? false;
      const beastsFound = layer.beastsAvailable.filter(bId =>
        s.beasts.some(b => b.beastId === bId),
      ).length;
      return {
        layerId: layer.id,
        name: layer.name,
        explored,
        totalBeasts: layer.beastsAvailable.length,
        beastsFound,
        completionPercent: layer.beastsAvailable.length > 0
          ? Math.floor((beastsFound / layer.beastsAvailable.length) * 100)
          : 0,
        ambientColor: layer.ambientColor,
      };
    });
    const totalBeastsFound = layers.reduce((sum, l) => sum + l.beastsFound, 0);
    return { layers, totalBeastsFound };
  }, [state]);

  // Computed: session duration tracker

  const sessionDuration = useMemo(() => {
    const s = state;
    const elapsed = Date.now() - s.sessionStart;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    return { elapsed, hours, minutes };
  }, [state.sessionStart]);

  // Computed: overall combat power rating

  const combatPowerRating = useMemo(() => {
    const s = state;
    const beastPower = s.beasts.reduce((sum, entry) => {
      return sum + calculateBeastPower(entry.beastId, entry.count);
    }, 0);
    const artifactPower = calculateArtifactTotalPower(s.artifacts);
    const structurePower = calculateTotalStructureEffect(s.structures) * 10;
    return {
      beastPower,
      artifactPower,
      structurePower,
      totalPower: beastPower + artifactPower + structurePower,
    };
  }, [state]);

  // Computed: active event bonus multiplier

  const eventBonusMultiplier = useMemo(() => {
    const info = activeEventInfo;
    if (!info) return { beastSurge: 1, materialBonus: 1, gloryBonus: 1, corruptionBonus: 1 };
    const et = info.def.effectType;
    return {
      beastSurge: et === 'beast_surge' ? info.def.magnitude : 1,
      materialBonus: et === 'material_rain' ? info.def.magnitude : 1,
      gloryBonus: et === 'glory_festival' ? info.def.magnitude : 1,
      corruptionBonus: et === 'corruption_wave' ? info.def.magnitude : 1,
    };
  }, [activeEventInfo]);

  const beastTypeSummary = useMemo(() => {
    const s = state;
    const summary = MX_BEAST_TYPES.map((typeName, typeIdx) => {
      const allOfType = MYTHIC_BEASTS.filter(b => b.type === typeIdx);
      const tamed = s.beasts.filter(entry => {
        const bd = getBeastDef(entry.beastId);
        return bd && bd.type === typeIdx;
      }).length;
      return { typeIndex: typeIdx, typeName, total: allOfType.length, tamed, percent: allOfType.length > 0 ? Math.floor((tamed / allOfType.length) * 100) : 0 };
    });
    return summary;
  }, [state]);

  // ─────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────

  const tameBeast = useCallback((beastId: number): boolean => {
    const def = getBeastDef(beastId);
    if (!def) return false;
    const layerDef = getLayerDef(def.layer);
    if (!layerDef) return false;

    const s = stateRef.current;
    if (s.soulEssence < layerDef.baseSoulCost) return false;

    const rarityMult = MX_RARITY_MULTIPLIERS[def.rarity] ?? 1;
    const gloryGain = calculateGloryForBeast(def.rarity);
    const soulCost = layerDef.baseSoulCost * rarityMult;

    const existing = s.beasts.find(b => b.beastId === beastId);
    const newUniqueCount = existing ? s.beastsTamed : s.beastsTamed + 1;
    const newGlory = s.glory + gloryGain;

    setState(prev => {
      const existingEntry = prev.beasts.find(b => b.beastId === beastId);
      const now = Date.now();
      let updatedBeasts: TamedBeast[];
      if (existingEntry) {
        updatedBeasts = prev.beasts.map(b =>
          b.beastId === beastId ? { ...b, count: b.count + 1, lastTamedAt: now } : b,
        );
      } else {
        updatedBeasts = [...prev.beasts, { beastId, count: 1, firstTamedAt: now, lastTamedAt: now, released: 0 }];
      }
      return {
        ...prev,
        beasts: updatedBeasts,
        beastsTamed: newUniqueCount,
        totalTames: prev.totalTames + 1,
        soulEssence: Math.max(0, prev.soulEssence - soulCost),
        glory: newGlory,
        currentCorruption: Math.min(MX_MAX_CORRUPTION, prev.currentCorruption + def.soulPower),
        corruptionReached: Math.max(prev.corruptionReached, Math.min(MX_MAX_CORRUPTION, prev.currentCorruption + def.soulPower)),
      };
    });

    if (!existing) {
      setState(prev => {
        const newTitle = TITLE_THRESHOLDS.findIndex(
          t => prev.glory >= t.minGlory && prev.corruptionReached >= t.minCorruption && prev.beastsTamed >= t.minBeasts,
        );
        if (newTitle > prev.titleIndex) {
          return { ...prev, titleIndex: newTitle };
        }
        return prev;
      });
    }
    return true;
  }, []);

  const exploreLayer = useCallback((layerId: number): boolean => {
    const def = getLayerDef(layerId);
    if (!def) return false;

    const s = stateRef.current;
    if (s.soulEssence < def.baseSoulCost) return false;
    if (def.requiredTitle > s.titleIndex) return false;
    if (s.corruptionReached < def.corruptionRange[0]) return false;

    setState(prev => {
      const updatedLayers = [...prev.layers];
      if (!updatedLayers[layerId]) {
        updatedLayers[layerId] = true;
      }
      return {
        ...prev,
        layers: updatedLayers,
        currentLayer: layerId,
        currentCorruption: def.corruptionRange[0],
        soulEssence: Math.max(0, prev.soulEssence - def.baseSoulCost),
        corruptionReached: Math.max(prev.corruptionReached, def.corruptionRange[1]),
        mythicPower: Math.max(0, prev.mythicPower - 5),
        totalExpeditions: prev.totalExpeditions + 1,
      };
    });
    return true;
  }, []);

  const buildStructure = useCallback((structureId: number): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;

    const s = stateRef.current;
    const existing = s.structures.find(st => st.structureId === structureId);

    if (existing) {
      if (existing.level >= MX_STRUCTURE_MAX_LEVEL) return false;
      const cost = calculateStructureCost(structureId, existing.level);
      if (s.glory < cost) return false;

      setState(prev => {
        const updatedStructures = prev.structures.map(st =>
          st.structureId === structureId
            ? { ...st, level: st.level + 1, lastUpgradeAt: Date.now() }
            : st,
        );
        const newGlory = prev.glory - cost;
        const newTitle = TITLE_THRESHOLDS.findIndex(
          t => newGlory >= t.minGlory && prev.corruptionReached >= t.minCorruption && prev.beastsTamed >= t.minBeasts,
        );
        return {
          ...prev,
          structures: updatedStructures,
          glory: newGlory,
          titleIndex: Math.max(prev.titleIndex, newTitle),
        };
      });
    } else {
      if (s.glory < def.baseCost) return false;

      setState(prev => {
        const now = Date.now();
        return {
          ...prev,
          structures: [
            ...prev.structures,
            { structureId, level: 1, builtAt: now, lastUpgradeAt: now },
          ],
          glory: prev.glory - def.baseCost,
          soulEssence: Math.max(0, prev.soulEssence - 10),
        };
      });
    }
    return true;
  }, []);

  const activateArtifact = useCallback((artifactId: number): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;

    const s = stateRef.current;
    if (s.soulEssence < def.activationCost) return false;
    if (s.mythicPower < Math.floor(def.power * 0.1)) return false;

    setState(prev => {
      const existing = prev.artifacts.find(a => a.artifactId === artifactId);
      const now = Date.now();
      let updatedArtifacts;
      if (existing) {
        updatedArtifacts = prev.artifacts.map(a =>
          a.artifactId === artifactId
            ? { ...a, charges: a.charges + 3, lastUsedAt: now }
            : a,
        );
      } else {
        updatedArtifacts = [...prev.artifacts, { artifactId, activatedAt: now, charges: 3, lastUsedAt: now }];
      }
      return {
        ...prev,
        artifacts: updatedArtifacts,
        soulEssence: Math.max(0, prev.soulEssence - def.activationCost),
        mythicPower: Math.max(0, prev.mythicPower - Math.floor(def.power * 0.1)),
        totalArtifactActivations: prev.totalArtifactActivations + 1,
      };
    });
    return true;
  }, []);

  const triggerAbyssEvent = useCallback((): boolean => {
    const s = stateRef.current;
    if (s.activeEvent) return false;
    if (s.soulEssence < 15) return false;

    const randomIndex = Math.floor(Math.random() * MYTHIC_EVENTS.length);
    const eventDef = MYTHIC_EVENTS[randomIndex];
    const now = Date.now();

    setState(prev => ({
      ...prev,
      activeEvent: {
        eventId: eventDef.id,
        startedAt: now,
        endsAt: now + eventDef.duration * 1000,
      },
      soulEssence: Math.max(0, prev.soulEssence - 15),
      totalEventsTriggered: prev.totalEventsTriggered + 1,
      glory: prev.glory + 10,
    }));
    return true;
  }, []);

  const resetMythicAbyss = useCallback((): void => {
    setState(createInitialState());
  }, []);

  // ── Utility actions ──

  const advanceCorruption = useCallback((amount: number): void => {
    setState(prev => {
      const newCorruption = Math.min(MX_MAX_CORRUPTION, prev.currentCorruption + amount);
      return {
        ...prev,
        currentCorruption: newCorruption,
        corruptionReached: Math.max(prev.corruptionReached, newCorruption),
        mythicPower: Math.max(0, prev.mythicPower - Math.floor(amount * 0.02)),
      };
    });
  }, []);

  const recoverSoulEssence = useCallback((amount: number): void => {
    setState(prev => ({
      ...prev,
      soulEssence: Math.min(MX_MAX_SOUL_ESSENCE, prev.soulEssence + amount),
    }));
  }, []);

  const recoverMythicPower = useCallback((amount: number): void => {
    setState(prev => ({
      ...prev,
      mythicPower: Math.min(MX_MAX_MYTHIC_POWER, prev.mythicPower + amount),
    }));
  }, []);

  const releaseBeast = useCallback((beastId: number): boolean => {
    const s = stateRef.current;
    const entry = s.beasts.find(b => b.beastId === beastId);
    if (!entry || entry.count <= 0) return false;

    const def = getBeastDef(beastId);
    const refundGlory = def ? Math.floor(calculateGloryForBeast(def.rarity) * 0.5) : 0;

    setState(prev => {
      const updatedBeasts = prev.beasts.map(b => {
        if (b.beastId !== beastId) return b;
        const newCount = b.count - 1;
        if (newCount <= 0) return { ...b, count: 0, released: b.released + 1 };
        return { ...b, count: newCount };
      }).filter(b => b.count > 0 || b.released > 0);
      return {
        ...prev,
        beasts: updatedBeasts,
        totalReleases: prev.totalReleases + 1,
        soulEssence: Math.min(MX_MAX_SOUL_ESSENCE, prev.soulEssence + 5),
        glory: Math.max(0, prev.glory + refundGlory),
      };
    });
    return true;
  }, []);

  const addMaterial = useCallback((materialId: number, quantity: number): boolean => {
    if (quantity <= 0) return false;
    const def = getMaterialDef(materialId);
    if (!def) return false;

    setState(prev => {
      const existing = prev.inventory.find(m => m.materialId === materialId);
      const now = Date.now();
      if (existing) {
        return {
          ...prev,
          inventory: prev.inventory.map(m =>
            m.materialId === materialId ? { ...m, quantity: m.quantity + quantity } : m,
          ),
        };
      }
      return {
        ...prev,
        inventory: [...prev.inventory, { materialId, quantity, acquiredAt: now }],
      };
    });
    return true;
  }, []);

  const removeMaterial = useCallback((materialId: number, quantity: number): boolean => {
    if (quantity <= 0) return false;

    setState(prev => {
      const existing = prev.inventory.find(m => m.materialId === materialId);
      if (!existing || existing.quantity < quantity) return prev;
      const updatedInventory = prev.inventory.map(m => {
        if (m.materialId !== materialId) return m;
        const newQty = m.quantity - quantity;
        if (newQty <= 0) return { ...m, quantity: 0 };
        return { ...m, quantity: newQty };
      }).filter(m => m.quantity > 0);
      return { ...prev, inventory: updatedInventory, totalCrafts: prev.totalCrafts + 1 };
    });
    return true;
  }, []);

  const spendGlory = useCallback((amount: number, rewardType: string, rewardAmount: number): boolean => {
    if (amount <= 0) return false;

    setState(prev => {
      if (prev.glory < amount) return prev;
      const newGlory = prev.glory - amount;
      if (rewardType === 'soul') {
        return { ...prev, glory: newGlory, soulEssence: Math.min(MX_MAX_SOUL_ESSENCE, prev.soulEssence + rewardAmount) };
      }
      if (rewardType === 'power') {
        return { ...prev, glory: newGlory, mythicPower: Math.min(MX_MAX_MYTHIC_POWER, prev.mythicPower + rewardAmount) };
      }
      if (rewardType === 'corruption') {
        return { ...prev, glory: newGlory, corruptionReached: Math.min(MX_MAX_CORRUPTION, prev.corruptionReached + rewardAmount) };
      }
      return { ...prev, glory: newGlory };
    });
    return true;
  }, []);

  const claimAchievement = useCallback((achievementId: number): boolean => {
    const def = getAchievementDef(achievementId);
    if (!def) return false;

    setState(prev => {
      const entry = prev.achievements.find(a => a.achievementId === achievementId);
      if (!entry || entry.claimed) return prev;

      const updatedAchievements = prev.achievements.map(a =>
        a.achievementId === achievementId ? { ...a, claimed: true } : a,
      );
      let updatedSoul = prev.soulEssence;
      let updatedPower = prev.mythicPower;
      let updatedGlory = prev.glory;
      let updatedTitle = prev.titleIndex;

      if (def.reward.type === 'soul') updatedSoul = Math.min(MX_MAX_SOUL_ESSENCE, prev.soulEssence + def.reward.amount);
      if (def.reward.type === 'power') updatedPower = Math.min(MX_MAX_MYTHIC_POWER, prev.mythicPower + def.reward.amount);
      if (def.reward.type === 'glory') updatedGlory = prev.glory + def.reward.amount;
      if (def.reward.type === 'title') updatedTitle = Math.min(TITLE_THRESHOLDS.length - 1, prev.titleIndex + def.reward.amount);

      return {
        ...prev,
        achievements: updatedAchievements,
        soulEssence: updatedSoul,
        mythicPower: updatedPower,
        glory: updatedGlory,
        titleIndex: updatedTitle,
      };
    });
    return true;
  }, []);

  // ── Info getters ──

  const getBeastInfo = useCallback((beastId: number) => {
    const def = getBeastDef(beastId);
    const entry = stateRef.current.beasts.find(b => b.beastId === beastId);
    return {
      def,
      tamed: !!entry,
      count: entry?.count ?? 0,
      released: entry?.released ?? 0,
    };
  }, []);

  const getStructureInfo = useCallback((structureId: number) => {
    const def = getStructureDef(structureId);
    const entry = stateRef.current.structures.find(s => s.structureId === structureId);
    const level = entry?.level ?? 0;
    const maxLevel = level >= MX_STRUCTURE_MAX_LEVEL;
    return {
      def,
      built: !!entry,
      level,
      maxLevel,
      upgradeCost: maxLevel ? Infinity : calculateStructureCost(structureId, level),
      currentEffect: def ? def.baseEffect + def.effectPerLevel * level : 0,
    };
  }, []);

  const getLayerInfo = useCallback((layerId: number) => {
    const def = getLayerDef(layerId);
    if (!def) return { def: undefined, explored: false, unlocked: false, accessible: false };
    const s = stateRef.current;
    const explored = s.layers[layerId] ?? false;
    const titleMet = s.titleIndex >= def.requiredTitle;
    const corruptionMet = s.corruptionReached >= def.corruptionRange[0] || def.requiredTitle === 0;
    return {
      def,
      explored,
      unlocked: titleMet,
      accessible: titleMet && (corruptionMet || def.requiredTitle === 0),
    };
  }, []);

  const getMaterialInfo = useCallback((materialId: number) => {
    const def = getMaterialDef(materialId);
    const entry = stateRef.current.inventory.find(m => m.materialId === materialId);
    return {
      def,
      owned: !!entry,
      quantity: entry?.quantity ?? 0,
    };
  }, []);

  const getArtifactInfo = useCallback((artifactId: number) => {
    const def = getArtifactDef(artifactId);
    const entry = stateRef.current.artifacts.find(a => a.artifactId === artifactId);
    return {
      def,
      activated: !!entry,
      charges: entry?.charges ?? 0,
      lastUsedAt: entry?.lastUsedAt ?? null,
    };
  }, []);

  const getAchievementInfo = useCallback((achievementId: number) => {
    const def = getAchievementDef(achievementId);
    const entry = stateRef.current.achievements.find(a => a.achievementId === achievementId);
    return {
      def,
      earned: !!entry,
      claimed: entry?.claimed ?? false,
      earnedAt: entry?.earnedAt ?? null,
    };
  }, []);

  const getEventInfo = useCallback((eventId: number) => {
    const def = getEventDef(eventId);
    return { def };
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // RETURN: mxAPI object with Pattern A (constants directly on object)
  // ─────────────────────────────────────────────────────────────────

  return {
    // ── Raw state ──
    mxBeasts: state.beasts,
    mxLayers: state.layers,
    mxInventory: state.inventory,
    mxStructures: state.structures,
    mxArtifacts: state.artifacts,
    mxAchievements: state.achievements,
    mxTitle: state.titleIndex,
    mxEvents: state.activeEvent,
    mxStats: {
      currentLayer: state.currentLayer,
      soulEssence: state.soulEssence,
      mythicPower: state.mythicPower,
      corruptionReached: state.corruptionReached,
      currentCorruption: state.currentCorruption,
      beastsTamed: state.beastsTamed,
      totalTames: state.totalTames,
      totalReleases: state.totalReleases,
      totalCrafts: state.totalCrafts,
      totalArtifactActivations: state.totalArtifactActivations,
      glory: state.glory,
      totalEventsTriggered: state.totalEventsTriggered,
      totalExpeditions: state.totalExpeditions,
      sessionStart: state.sessionStart,
    },

    // ── MX_ Constants (Pattern A) ──
    MX_COLOR_ABYSS,
    MX_COLOR_MYTHIC_GOLD,
    MX_COLOR_HYDRA_GREEN,
    MX_COLOR_KRAKEN_BLUE,
    MX_COLOR_SHADOW,
    MX_COLOR_ELDER_PURPLE,
    MX_COLOR_FORGE_RED,
    MX_COLOR_MYSTIC_TEAL,
    MX_MAX_SOUL_ESSENCE,
    MX_MAX_MYTHIC_POWER,
    MX_MAX_CORRUPTION,
    MX_MAX_GLORY,
    MX_STRUCTURE_MAX_LEVEL,
    MX_BEAST_TIERS,
    MX_BEASTS_PER_TIER,
    MX_TOTAL_BEASTS,
    MX_RARITY_NAMES,
    MX_RARITY_COLORS,
    MX_RARITY_MULTIPLIERS,
    MX_TITLES,
    MX_LAYER_NAMES,
    MX_BEAST_TYPES,
    MX_STRUCTURE_CATEGORIES,
    MX_MATERIAL_TYPES,

    // ── Catalog data ──
    MX_BEASTS: MYTHIC_BEASTS,
    MX_LAYERS: ABYSS_LAYERS,
    MX_MATERIALS: MYTHIC_MATERIALS,
    MX_STRUCTURES: MYTHIC_STRUCTURES,
    MX_ABILITIES: MYTHIC_ABILITIES,
    MX_ACHIEVEMENTS: MYTHIC_ACHIEVEMENTS,
    MX_ARTIFACTS: MYTHIC_ARTIFACTS,
    MX_EVENTS: MYTHIC_EVENTS,
    MX_TITLE_THRESHOLDS: TITLE_THRESHOLDS,

    // ── Computed catalogs ──
    beastCatalog,
    structureCatalog,
    artifactCatalog,
    achievementCatalog,
    inventorySummary,
    activeEventInfo,
    layerDangerStats,
    beastTypeSummary,

    // ── Progress ──
    corruptionZoneProgress,
    gloryProgress,
    beastCompletionPercent,
    layerCompletionPercent,
    achievementCompletionPercent,
    overallProgress,
    titleInfo,
    titleProgress,
    rarityBeastBonus,
    exploredLayerCount,

    // ── Core actions ──
    tameBeast,
    exploreLayer,
    buildStructure,
    activateArtifact,
    triggerAbyssEvent,
    resetMythicAbyss,

    // ── Utility actions ──
    advanceCorruption,
    recoverSoulEssence,
    recoverMythicPower,
    releaseBeast,
    addMaterial,
    removeMaterial,
    spendGlory,
    claimAchievement,

    // ── Info getters ──
    getBeastInfo,
    getStructureInfo,
    getLayerInfo,
    getMaterialInfo,
    getArtifactInfo,
    getAchievementInfo,
    getEventInfo,

    // ── Filtered catalog helpers ──
    getBeastsByType,
    getBeastsByRarity,
    getBeastsByLayer,
    getMaterialsByRarity,
    getMaterialsByType,
    getStructuresByCategory,
    getAbilitiesByRarity,
    getArtifactsByRarity,
    getArtifactsByBeastType,
    calculateBeastPower,
    getLayerColor,
    getRarityColor,

    // ── Extended computed summaries ──
    materialRaritySummary,
    structureCategorySummary,
    artifactRaritySummary,
    beastPowerBreakdown,
    explorationSummary,
    sessionDuration,
    combatPowerRating,
    eventBonusMultiplier,
  };
}
