'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

// =============================================================================
// VOLCANO PEAK — Volcano with Magma Creatures Adventure Module
// Color theme: magma red, lava orange, obsidian black, ember yellow, ash gray, volcanic blue
// =============================================================================

// =============================================================================
// SECTION 1: TYPES
// =============================================================================

export type VPRarity = 'ember_sprite' | 'magma_golem' | 'fire_drake' | 'obsidian_titan' | 'volcano_dragon';

export type VPZoneId =
  | 'lava_fields'
  | 'ash_plateau'
  | 'obsidian_cavern'
  | 'magma_river'
  | 'caldera_rim'
  | 'smoke_vents'
  | 'crystal_forge'
  | 'core_chamber';

export type VPEquipmentSlot = 'head' | 'chest' | 'hands' | 'legs' | 'feet' | 'weapon' | 'shield' | 'accessory';

export type VPEventType = 'eruption' | 'magma_surge' | 'obsidian_rain';

export interface VPRarityDef {
  key: VPRarity;
  label: string;
  color: string;
  xpMultiplier: number;
  encounterWeight: number;
}

export interface VPCreatureDef {
  id: string;
  name: string;
  rarity: VPRarity;
  hp: number;
  damage: number;
  speed: number;
  xpReward: number;
  coinReward: number;
  description: string;
  icon: string;
  element: string;
  canTame: boolean;
  tamingDifficulty: number;
  zoneAffinity: VPZoneId[];
}

export interface VPZoneDef {
  id: VPZoneId;
  name: string;
  description: string;
  unlockLevel: number;
  dangerLevel: number;
  baseXp: number;
  baseCoins: number;
  icon: string;
  heatIndex: number;
  hazards: string[];
  bossCreatureId: string | null;
}

export interface VPMiningDef {
  id: string;
  name: string;
  rarity: VPRarity;
  zone: VPZoneId;
  miningTime: number;
  xpReward: number;
  coinValue: number;
  description: string;
  icon: string;
}

export interface VPEquipmentDef {
  id: string;
  name: string;
  slot: VPEquipmentSlot;
  rarity: VPRarity;
  defense: number;
  fireResist: number;
  magmaResist: number;
  description: string;
  icon: string;
  requiredLevel: number;
  craftingMaterials: { mineralId: string; amount: number }[];
}

export interface VPAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  xpReward: number;
  coinReward: number;
  icon: string;
}

export interface VPTitleDef {
  id: string;
  name: string;
  levelReq: number;
  description: string;
  icon: string;
  color: string;
}

export interface VPEventDef {
  id: VPEventType;
  name: string;
  description: string;
  duration: number;
  xpMultiplier: number;
  coinMultiplier: number;
  icon: string;
  color: string;
}

export interface VPTamingState {
  creatureId: string;
  progress: number;
  maxProgress: number;
  startedAt: number | null;
  completed: boolean;
}

export interface VPSurfingSession {
  distance: number;
  maxSpeed: number;
  obstaclesAvoided: number;
  startTime: number;
  endTime: number | null;
  coinsEarned: number;
  xpEarned: number;
}

export interface VPCraftingRecipe {
  id: string;
  name: string;
  outputId: string;
  outputType: 'equipment';
  description: string;
  icon: string;
  requiredMinerals: { mineralId: string; amount: number }[];
  xpReward: number;
  requiredLevel: number;
  forgeZone: VPZoneId;
}

export interface VPCoreExpedition {
  depth: number;
  creaturesDefeated: number;
  mineralsFound: number;
  startedAt: number;
  completedAt: number | null;
  rewardsClaimed: boolean;
  xpEarned: number;
  coinsEarned: number;
}

export interface VPInventoryItem {
  mineralId: string;
  amount: number;
}

export interface VPEquipmentState {
  equipmentId: string;
  equipped: boolean;
  craftedAt: number;
  upgrades: number;
}

export interface VPAchievementState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
  currentValue: number;
}

export interface VPTamedCreature {
  creatureId: string;
  tamedAt: number;
  nickname: string;
  level: number;
  xp: number;
  bondStrength: number;
}

export interface VPEventLogEntry {
  id: string;
  eventType: VPEventType;
  startedAt: number;
  endedAt: number;
  xpGained: number;
  coinsGained: number;
}

export interface VPDailyState {
  date: string;
  coreExpeditionsCompleted: number;
  magmaSurfsCompleted: number;
  creaturesTamed: number;
  mineralsMined: number;
  itemsCrafted: number;
}

// =============================================================================
// SECTION 2: CONSTANTS (all VP_ prefixed)
// =============================================================================

export const VP_MAX_LEVEL = 50;
export const VP_MAX_COINS = 999_999_999;
export const VP_BASE_XP_PER_LEVEL = 100;
export const VP_XP_SCALING_FACTOR = 1.15;
export const VP_DAILY_RESET_MS = 86_400_000;
export const VP_TAMING_COOLDOWN_MS = 30_000;
export const VP_SURFING_BASE_DURATION_MS = 60_000;
export const VP_EVENT_MIN_DURATION_MS = 30_000;
export const VP_EVENT_MAX_DURATION_MS = 120_000;
export const VP_CRAFTING_BASE_TIME_MS = 5_000;
export const VP_EXPEDITION_MAX_DEPTH = 100;
export const VP_CREATURE_BATTLE_DURATION_MS = 30_000;
export const VP_SURFING_OBSTACLE_SPAWN_MS = 3_000;
export const VP_MAX_TAMED_CREATURES = 20;
export const VP_BOND_STRENGTH_MAX = 100;

export const VP_THEME_COLORS = {
  magmaRed: '#FF4500',
  lavaOrange: '#FF6347',
  obsidianBlack: '#1C1C1C',
  emberYellow: '#FFD700',
  ashGray: '#808080',
  volcanicBlue: '#4169E1',
  deepCrimson: '#8B0000',
  moltenGold: '#FFB347',
  smokeCharcoal: '#36454F',
  basaltDark: '#2F4F4F',
  pyroclasticOrange: '#FF8C00',
  sulfurousYellow: '#EEDD82',
  igneousBrown: '#6B3A2A',
  pumiceGray: '#A9A9A9',
  fumaroleWhite: '#F5F5DC',
  coreGlow: '#FF2400',
} as const;

export const VP_RARITY_DEFS: VPRarityDef[] = [
  { key: 'ember_sprite', label: 'Ember Sprite', color: VP_THEME_COLORS.emberYellow, xpMultiplier: 1.0, encounterWeight: 40 },
  { key: 'magma_golem', label: 'Magma Golem', color: VP_THEME_COLORS.ashGray, xpMultiplier: 1.5, encounterWeight: 28 },
  { key: 'fire_drake', label: 'Fire Drake', color: VP_THEME_COLORS.magmaRed, xpMultiplier: 2.5, encounterWeight: 18 },
  { key: 'obsidian_titan', label: 'Obsidian Titan', color: VP_THEME_COLORS.volcanicBlue, xpMultiplier: 4.0, encounterWeight: 10 },
  { key: 'volcano_dragon', label: 'Volcano Dragon', color: VP_THEME_COLORS.coreGlow, xpMultiplier: 7.0, encounterWeight: 4 },
] as const;

// =============================================================================
// SECTION 3: VOLCANIC ZONES (8)
// =============================================================================

export const VP_ZONES: VPZoneDef[] = [
  {
    id: 'lava_fields',
    name: 'Lava Fields',
    description: 'Vast plains of cooling lava where ember sprites dance across molten rock.',
    unlockLevel: 1,
    dangerLevel: 1,
    baseXp: 10,
    baseCoins: 5,
    icon: '🌋',
    heatIndex: 40,
    hazards: ['lava_pool', 'ground_crack', 'ash_cloud'],
    bossCreatureId: null,
  },
  {
    id: 'ash_plateau',
    name: 'Ash Plateau',
    description: 'A windswept plateau blanketed in thick volcanic ash where magma golems lumber.',
    unlockLevel: 5,
    dangerLevel: 2,
    baseXp: 18,
    baseCoins: 10,
    icon: '🏜️',
    heatIndex: 30,
    hazards: ['ash_storm', 'sinking_ground', 'sulfur_fumes'],
    bossCreatureId: 'ash_colossus',
  },
  {
    id: 'obsidian_cavern',
    name: 'Obsidian Cavern',
    description: 'Deep underground tunnels lined with razor-sharp obsidian crystals.',
    unlockLevel: 10,
    dangerLevel: 3,
    baseXp: 30,
    baseCoins: 18,
    icon: '🕳️',
    heatIndex: 50,
    hazards: ['crystal_shards', 'collapsing_ceiling', 'magma_leak'],
    bossCreatureId: 'obsidian_guardian',
  },
  {
    id: 'magma_river',
    name: 'Magma River',
    description: 'A raging river of molten rock that cuts through the volcano\'s heart.',
    unlockLevel: 16,
    dangerLevel: 4,
    baseXp: 45,
    baseCoins: 28,
    icon: '🌊',
    heatIndex: 75,
    hazards: ['magma_wave', 'floating_rocks', 'steam_geyser'],
    bossCreatureId: 'river_serpent',
  },
  {
    id: 'caldera_rim',
    name: 'Caldera Rim',
    description: 'The edge of the great volcanic crater where fire drakes circle overhead.',
    unlockLevel: 22,
    dangerLevel: 5,
    baseXp: 65,
    baseCoins: 40,
    icon: '⛰️',
    heatIndex: 60,
    hazards: ['rock_slide', 'drake_dive', 'thermal_updraft'],
    bossCreatureId: 'caldera_wyrm',
  },
  {
    id: 'smoke_vents',
    name: 'Smoke Vents',
    description: 'A maze of hissing fumaroles and sulfurous vents where visibility is near zero.',
    unlockLevel: 28,
    dangerLevel: 6,
    baseXp: 85,
    baseCoins: 55,
    icon: '💨',
    heatIndex: 65,
    hazards: ['toxic_gas', 'sudden_eruption', 'boiling_mud'],
    bossCreatureId: 'vent_wraith',
  },
  {
    id: 'crystal_forge',
    name: 'Crystal Forge',
    description: 'A natural forge where volcanic crystals grow at impossible speeds in magma heat.',
    unlockLevel: 35,
    dangerLevel: 7,
    baseXp: 120,
    baseCoins: 75,
    icon: '💎',
    heatIndex: 85,
    hazards: ['crystal_explosion', 'magma_splash', 'radiation_burst'],
    bossCreatureId: 'forge_dragon',
  },
  {
    id: 'core_chamber',
    name: 'Core Chamber',
    description: 'The deepest sanctum of the volcano where the planetary core glows with primordial fury.',
    unlockLevel: 42,
    dangerLevel: 8,
    baseXp: 200,
    baseCoins: 120,
    icon: '🔆',
    heatIndex: 100,
    hazards: ['core_flare', 'shockwave', 'gravity_anomaly'],
    bossCreatureId: 'primordial_dragon',
  },
] as const;

// =============================================================================
// SECTION 4: MAGMA CREATURES (35+, 5 rarity tiers)
// =============================================================================

export const VP_CREATURES: VPCreatureDef[] = [
  // Ember Sprite (7) — Common tier
  {
    id: 'spark_wisp', name: 'Spark Wisp', rarity: 'ember_sprite', hp: 15, damage: 3, speed: 18,
    xpReward: 8, coinReward: 3, description: 'A tiny flicker of living flame that drifts on thermal currents.',
    icon: '✨', element: 'fire', canTame: true, tamingDifficulty: 1, zoneAffinity: ['lava_fields'],
  },
  {
    id: 'cinder_mouse', name: 'Cinder Mouse', rarity: 'ember_sprite', hp: 10, damage: 2, speed: 22,
    xpReward: 6, coinReward: 2, description: 'A small rodent with fur of smoldering embers.',
    icon: '🐭', element: 'fire', canTame: true, tamingDifficulty: 1, zoneAffinity: ['lava_fields', 'ash_plateau'],
  },
  {
    id: 'flame_imp', name: 'Flame Imp', rarity: 'ember_sprite', hp: 20, damage: 5, speed: 16,
    xpReward: 10, coinReward: 4, description: 'A mischievous imp that delights in starting small fires.',
    icon: '😈', element: 'fire', canTame: true, tamingDifficulty: 2, zoneAffinity: ['lava_fields', 'ash_plateau'],
  },
  {
    id: 'glow_beetle', name: 'Glow Beetle', rarity: 'ember_sprite', hp: 18, damage: 4, speed: 12,
    xpReward: 9, coinReward: 3, description: 'A beetle whose shell pulses with warm orange light.',
    icon: '🪲', element: 'fire', canTame: true, tamingDifficulty: 1, zoneAffinity: ['lava_fields', 'smoke_vents'],
  },
  {
    id: 'ash_moth', name: 'Ash Moth', rarity: 'ember_sprite', hp: 12, damage: 3, speed: 20,
    xpReward: 7, coinReward: 3, description: 'A delicate moth whose wings are made of fine volcanic ash.',
    icon: '🦋', element: 'earth', canTame: true, tamingDifficulty: 1, zoneAffinity: ['ash_plateau', 'smoke_vents'],
  },
  {
    id: 'smoke_bunny', name: 'Smoke Bunny', rarity: 'ember_sprite', hp: 14, damage: 2, speed: 25,
    xpReward: 8, coinReward: 4, description: 'A rabbit that dissolves into smoke when startled.',
    icon: '🐰', element: 'air', canTame: true, tamingDifficulty: 2, zoneAffinity: ['smoke_vents'],
  },
  {
    id: 'coal_pup', name: 'Coal Pup', rarity: 'ember_sprite', hp: 22, damage: 4, speed: 14,
    xpReward: 9, coinReward: 3, description: 'A loyal pup made of compressed coal that burns when excited.',
    icon: '🐕', element: 'earth', canTame: true, tamingDifficulty: 1, zoneAffinity: ['lava_fields', 'obsidian_cavern'],
  },
  // Magma Golem (7) — Uncommon tier
  {
    id: 'basalt_sentinel', name: 'Basalt Sentinel', rarity: 'magma_golem', hp: 80, damage: 12, speed: 4,
    xpReward: 25, coinReward: 10, description: 'A golem of interlocking basalt slabs that guards ancient volcanic paths.',
    icon: '🗿', element: 'earth', canTame: false, tamingDifficulty: 0, zoneAffinity: ['ash_plateau'],
  },
  {
    id: 'slag_crawler', name: 'Slag Crawler', rarity: 'magma_golem', hp: 60, damage: 15, speed: 8,
    xpReward: 22, coinReward: 8, description: 'A six-legged golem that drags itself across cooling slag fields.',
    icon: '🦂', element: 'earth', canTame: false, tamingDifficulty: 0, zoneAffinity: ['lava_fields', 'ash_plateau'],
  },
  {
    id: 'lava_bear', name: 'Lava Bear', rarity: 'magma_golem', hp: 100, damage: 18, speed: 6,
    xpReward: 28, coinReward: 12, description: 'A massive bear whose hide cracks to reveal glowing magma underneath.',
    icon: '🐻', element: 'fire', canTame: true, tamingDifficulty: 5, zoneAffinity: ['lava_fields', 'magma_river'],
  },
  {
    id: 'ash_colossus', name: 'Ash Colossus', rarity: 'magma_golem', hp: 150, damage: 20, speed: 3,
    xpReward: 35, coinReward: 15, description: 'A towering giant formed from centuries of compressed volcanic ash.',
    icon: '👹', element: 'earth', canTame: false, tamingDifficulty: 0, zoneAffinity: ['ash_plateau'],
  },
  {
    id: 'magma_toad', name: 'Magma Toad', rarity: 'magma_golem', hp: 70, damage: 14, speed: 5,
    xpReward: 24, coinReward: 9, description: 'A bloated toad that spits molten globs at intruders.',
    icon: '🐸', element: 'fire', canTame: true, tamingDifficulty: 4, zoneAffinity: ['magma_river'],
  },
  {
    id: 'obsidian_guardian', name: 'Obsidian Guardian', rarity: 'magma_golem', hp: 120, damage: 22, speed: 5,
    xpReward: 32, coinReward: 14, description: 'A crystalline golem of pure obsidian that patrols the deep caverns.',
    icon: '🛡️', element: 'earth', canTame: false, tamingDifficulty: 0, zoneAffinity: ['obsidian_cavern'],
  },
  {
    id: 'pyroclast_hound', name: 'Pyroclast Hound', rarity: 'magma_golem', hp: 90, damage: 16, speed: 10,
    xpReward: 26, coinReward: 11, description: 'A fierce hound that charges in clouds of burning ash.',
    icon: '🐺', element: 'fire', canTame: true, tamingDifficulty: 5, zoneAffinity: ['caldera_rim'],
  },
  // Fire Drake (7) — Rare tier
  {
    id: 'ember_drake', name: 'Ember Drake', rarity: 'fire_drake', hp: 180, damage: 30, speed: 12,
    xpReward: 55, coinReward: 25, description: 'A young drake with scales of cooling lava and eyes of molten gold.',
    icon: '🐲', element: 'fire', canTame: true, tamingDifficulty: 7, zoneAffinity: ['caldera_rim'],
  },
  {
    id: 'river_serpent', name: 'River Serpent', rarity: 'fire_drake', hp: 200, damage: 35, speed: 14,
    xpReward: 60, coinReward: 28, description: 'A serpentine dragon that swims through magma rivers like water.',
    icon: '🐍', element: 'fire', canTame: true, tamingDifficulty: 8, zoneAffinity: ['magma_river'],
  },
  {
    id: 'vent_wraith', name: 'Vent Wraith', rarity: 'fire_drake', hp: 160, damage: 28, speed: 16,
    xpReward: 50, coinReward: 22, description: 'A spectral drake born from sulfurous gas and volcanic heat.',
    icon: '👻', element: 'poison', canTame: false, tamingDifficulty: 0, zoneAffinity: ['smoke_vents'],
  },
  {
    id: 'caldera_wyrm', name: 'Caldera Wyrm', rarity: 'fire_drake', hp: 250, damage: 38, speed: 10,
    xpReward: 70, coinReward: 32, description: 'A massive wyrm that nests in the caldera rim, terrorizing all who approach.',
    icon: '🐉', element: 'fire', canTame: true, tamingDifficulty: 9, zoneAffinity: ['caldera_rim'],
  },
  {
    id: 'crystal_drake', name: 'Crystal Drake', rarity: 'fire_drake', hp: 190, damage: 32, speed: 11,
    xpReward: 58, coinReward: 26, description: 'A drake with scales of volcanic crystal that refract magma light.',
    icon: '💎', element: 'earth', canTame: true, tamingDifficulty: 8, zoneAffinity: ['crystal_forge'],
  },
  {
    id: 'inferno_hawk', name: 'Inferno Hawk', rarity: 'fire_drake', hp: 140, damage: 40, speed: 20,
    xpReward: 52, coinReward: 24, description: 'A raptor wreathed in flame that dives at supersonic speed.',
    icon: '🦅', element: 'fire', canTame: true, tamingDifficulty: 7, zoneAffinity: ['caldera_rim', 'crystal_forge'],
  },
  {
    id: 'magma_manta', name: 'Magma Manta', rarity: 'fire_drake', hp: 220, damage: 26, speed: 15,
    xpReward: 56, coinReward: 27, description: 'A ray-like creature that glides silently through underground magma lakes.',
    icon: '🦈', element: 'fire', canTame: true, tamingDifficulty: 8, zoneAffinity: ['magma_river', 'core_chamber'],
  },
  // Obsidian Titan (7) — Epic tier
  {
    id: 'obsidian_knight', name: 'Obsidian Knight', rarity: 'obsidian_titan', hp: 400, damage: 50, speed: 6,
    xpReward: 100, coinReward: 50, description: 'A humanoid titan encased in plates of enchanted obsidian armor.',
    icon: '🛡️', element: 'earth', canTame: false, tamingDifficulty: 0, zoneAffinity: ['obsidian_cavern', 'crystal_forge'],
  },
  {
    id: 'forge_dragon', name: 'Forge Dragon', rarity: 'obsidian_titan', hp: 500, damage: 60, speed: 8,
    xpReward: 120, coinReward: 60, description: 'A dragon that lives inside the Crystal Forge, its breath creates weapons.',
    icon: '🐲', element: 'fire', canTame: false, tamingDifficulty: 0, zoneAffinity: ['crystal_forge'],
  },
  {
    id: 'basalt_giant', name: 'Basalt Giant', rarity: 'obsidian_titan', hp: 600, damage: 55, speed: 4,
    xpReward: 110, coinReward: 55, description: 'A giant whose body is made of hardened basalt columns.',
    icon: '🗿', element: 'earth', canTame: false, tamingDifficulty: 0, zoneAffinity: ['ash_plateau', 'caldera_rim'],
  },
  {
    id: 'magma_elemental', name: 'Magma Elemental', rarity: 'obsidian_titan', hp: 350, damage: 65, speed: 10,
    xpReward: 115, coinReward: 58, description: 'A being of pure liquid magma that can reshape its form at will.',
    icon: '🔥', element: 'fire', canTame: false, tamingDifficulty: 0, zoneAffinity: ['magma_river', 'core_chamber'],
  },
  {
    id: 'obsidian_wyrm', name: 'Obsidian Wyrm', rarity: 'obsidian_titan', hp: 450, damage: 58, speed: 7,
    xpReward: 118, coinReward: 59, description: 'A massive worm that tunnels through obsidian deposits, leaving trails of glass.',
    icon: '🐛', element: 'earth', canTame: false, tamingDifficulty: 0, zoneAffinity: ['obsidian_cavern'],
  },
  {
    id: 'inferno_titan', name: 'Inferno Titan', rarity: 'obsidian_titan', hp: 550, damage: 70, speed: 5,
    xpReward: 125, coinReward: 62, description: 'A titan wreathed in eternal inferno, leaving footprints of molten glass.',
    icon: '🔥', element: 'fire', canTame: false, tamingDifficulty: 0, zoneAffinity: ['core_chamber'],
  },
  {
    id: 'ash_phantom', name: 'Ash Phantom', rarity: 'obsidian_titan', hp: 380, damage: 72, speed: 14,
    xpReward: 112, coinReward: 56, description: 'A spectral entity formed from the collective ashes of volcanoes past.',
    icon: '👤', element: 'air', canTame: false, tamingDifficulty: 0, zoneAffinity: ['smoke_vents', 'core_chamber'],
  },
  // Volcano Dragon (7) — Legendary tier
  {
    id: 'primordial_dragon', name: 'Primordial Dragon', rarity: 'volcano_dragon', hp: 1000, damage: 100, speed: 10,
    xpReward: 250, coinReward: 120, description: 'The ancient dragon born from the first volcanic eruption on the planet.',
    icon: '🐉', element: 'fire', canTame: false, tamingDifficulty: 0, zoneAffinity: ['core_chamber'],
  },
  {
    id: 'world_mouth', name: 'World Mouth Serpent', rarity: 'volcano_dragon', hp: 800, damage: 90, speed: 12,
    xpReward: 220, coinReward: 100, description: 'A serpentine dragon so large it encircles the entire volcano.',
    icon: '🐍', element: 'earth', canTame: false, tamingDifficulty: 0, zoneAffinity: ['core_chamber'],
  },
  {
    id: 'solar_drake', name: 'Solar Drake', rarity: 'volcano_dragon', hp: 700, damage: 85, speed: 16,
    xpReward: 200, coinReward: 95, description: 'A dragon whose scales absorb solar energy, glowing like a second sun.',
    icon: '☀️', element: 'fire', canTame: true, tamingDifficulty: 15, zoneAffinity: ['caldera_rim'],
  },
  {
    id: 'tectonic_titan', name: 'Tectonic Titan', rarity: 'volcano_dragon', hp: 1200, damage: 110, speed: 3,
    xpReward: 280, coinReward: 130, description: 'A titan of such immense size that its movements cause earthquakes.',
    icon: '⛰️', element: 'earth', canTame: false, tamingDifficulty: 0, zoneAffinity: ['core_chamber'],
  },
  {
    id: 'core_wyrm', name: 'Core Wyrm', rarity: 'volcano_dragon', hp: 900, damage: 95, speed: 8,
    xpReward: 240, coinReward: 110, description: 'A wyrm that feeds directly on the planet\'s molten core.',
    icon: '🔥', element: 'fire', canTame: false, tamingDifficulty: 0, zoneAffinity: ['core_chamber'],
  },
  {
    id: 'obsidian_emperor', name: 'Obsidian Emperor', rarity: 'volcano_dragon', hp: 1100, damage: 105, speed: 5,
    xpReward: 260, coinReward: 125, description: 'The supreme ruler of all obsidian creatures, forged in the deepest darkness.',
    icon: '👑', element: 'earth', canTame: false, tamingDifficulty: 0, zoneAffinity: ['obsidian_cavern', 'core_chamber'],
  },
  {
    id: 'magmacore_behemoth', name: 'Magmacore Behemoth', rarity: 'volcano_dragon', hp: 1500, damage: 120, speed: 2,
    xpReward: 300, coinReward: 150, description: 'The largest magma creature ever recorded, a living volcanic eruption.',
    icon: '🌋', element: 'fire', canTame: false, tamingDifficulty: 0, zoneAffinity: ['core_chamber'],
  },
] as const;

// =============================================================================
// SECTION 5: VOLCANIC MINERALS (22)
// =============================================================================

export const VP_MINERALS: VPMiningDef[] = [
  // Ember Sprite tier (4)
  {
    id: 'coal_nugget', name: 'Coal Nugget', rarity: 'ember_sprite', zone: 'lava_fields', miningTime: 3000,
    xpReward: 3, coinValue: 2, description: 'A small chunk of volcanic coal, warm to the touch.', icon: '⬛',
  },
  {
    id: 'sulfur_crystal', name: 'Sulfur Crystal', rarity: 'ember_sprite', zone: 'smoke_vents', miningTime: 3000,
    xpReward: 3, coinValue: 2, description: 'A bright yellow crystal that smells of matches.', icon: '🟡',
  },
  {
    id: 'pumice_stone', name: 'Pumice Stone', rarity: 'ember_sprite', zone: 'ash_plateau', miningTime: 4000,
    xpReward: 4, coinValue: 3, description: 'Lightweight volcanic rock filled with air bubbles.', icon: '🪨',
  },
  {
    id: 'ash_pearl', name: 'Ash Pearl', rarity: 'ember_sprite', zone: 'lava_fields', miningTime: 3500,
    xpReward: 4, coinValue: 3, description: 'A pearl formed from compressed volcanic ash layers.', icon: '⚪',
  },
  // Magma Golem tier (5)
  {
    id: 'iron_deposit', name: 'Iron Deposit', rarity: 'magma_golem', zone: 'ash_plateau', miningTime: 6000,
    xpReward: 8, coinValue: 6, description: 'A rich vein of volcanic iron ore.', icon: '🟤',
  },
  {
    id: 'basalt_shard', name: 'Basalt Shard', rarity: 'magma_golem', zone: 'lava_fields', miningTime: 7000,
    xpReward: 9, coinValue: 7, description: 'A shard of cooled basalt with mineral veins running through it.', icon: '🖤',
  },
  {
    id: 'lava_glass', name: 'Lava Glass', rarity: 'magma_golem', zone: 'magma_river', miningTime: 8000,
    xpReward: 10, coinValue: 8, description: 'Glass formed naturally from rapidly cooled lava flows.', icon: '🔴',
  },
  {
    id: 'copper_nodule', name: 'Copper Nodule', rarity: 'magma_golem', zone: 'obsidian_cavern', miningTime: 6500,
    xpReward: 9, coinValue: 7, description: 'A rounded nodule of native copper deposits.', icon: '🟠',
  },
  {
    id: 'feldspar_cluster', name: 'Feldspar Cluster', rarity: 'magma_golem', zone: 'ash_plateau', miningTime: 7000,
    xpReward: 8, coinValue: 6, description: 'A cluster of pink feldspar crystals from volcanic rock.', icon: '🩷',
  },
  // Fire Drake tier (5)
  {
    id: 'obsidian_gem', name: 'Obsidian Gem', rarity: 'fire_drake', zone: 'obsidian_cavern', miningTime: 12000,
    xpReward: 18, coinValue: 15, description: 'A perfectly formed gem of pure volcanic obsidian.', icon: '🖤',
  },
  {
    id: 'magma_opal', name: 'Magma Opal', rarity: 'fire_drake', zone: 'magma_river', miningTime: 14000,
    xpReward: 20, coinValue: 18, description: 'A fiery opal with veins of molten color running through it.', icon: '🔶',
  },
  {
    id: 'ruby_heart', name: 'Ruby Heart', rarity: 'fire_drake', zone: 'caldera_rim', miningTime: 13000,
    xpReward: 19, coinValue: 16, description: 'A deep red ruby found near volcanic vents, pulsing with heat.', icon: '❤️‍🔥',
  },
  {
    id: 'peridot_shard', name: 'Peridot Shard', rarity: 'fire_drake', zone: 'smoke_vents', miningTime: 11000,
    xpReward: 17, coinValue: 14, description: 'Olivine crystal formed deep in the volcanic mantle.', icon: '💚',
  },
  {
    id: 'volcanic_topaz', name: 'Volcanic Topaz', rarity: 'fire_drake', zone: 'crystal_forge', miningTime: 15000,
    xpReward: 22, coinValue: 20, description: 'A golden topaz infused with volcanic energy.', icon: '✨',
  },
  // Obsidian Titan tier (4)
  {
    id: 'dragon_fire_opal', name: 'Dragon Fire Opal', rarity: 'obsidian_titan', zone: 'crystal_forge', miningTime: 22000,
    xpReward: 40, coinValue: 35, description: 'An opal that contains the trapped fire breath of an ancient dragon.', icon: '🔥',
  },
  {
    id: 'tectonic_sapphire', name: 'Tectonic Sapphire', rarity: 'obsidian_titan', zone: 'core_chamber', miningTime: 25000,
    xpReward: 45, coinValue: 40, description: 'A blue sapphire formed under immense tectonic pressure.', icon: '💙',
  },
  {
    id: 'infernal_diamond', name: 'Infernal Diamond', rarity: 'obsidian_titan', zone: 'core_chamber', miningTime: 24000,
    xpReward: 42, coinValue: 38, description: 'A diamond born from volcanic carbon under extreme heat and pressure.', icon: '💎',
  },
  {
    id: 'magma_core_crystal', name: 'Magma Core Crystal', rarity: 'obsidian_titan', zone: 'magma_river', miningTime: 20000,
    xpReward: 38, coinValue: 33, description: 'A crystalized fragment of the magma river\'s core energy.', icon: '🔴',
  },
  // Volcano Dragon tier (4)
  {
    id: 'primordial_heartstone', name: 'Primordial Heartstone', rarity: 'volcano_dragon', zone: 'core_chamber', miningTime: 40000,
    xpReward: 80, coinValue: 75, description: 'A stone that contains the heartbeat of the planet itself.', icon: '💗',
  },
  {
    id: 'worldforge_gem', name: 'Worldforge Gem', rarity: 'volcano_dragon', zone: 'core_chamber', miningTime: 45000,
    xpReward: 90, coinValue: 85, description: 'A gem capable of forging or unmaking continents.', icon: '🌍',
  },
  {
    id: 'solar_f shard', name: 'Solar Fire Shard', rarity: 'volcano_dragon', zone: 'caldera_rim', miningTime: 38000,
    xpReward: 75, coinValue: 70, description: 'A fragment of concentrated solar fire trapped in crystal.', icon: '☀️',
  },
  {
    id: 'obsidian_monolith', name: 'Obsidian Monolith', rarity: 'volcano_dragon', zone: 'obsidian_cavern', miningTime: 42000,
    xpReward: 85, coinValue: 80, description: 'A massive piece of sentient obsidian from the deep earth.', icon: '🗿',
  },
] as const;

// =============================================================================
// SECTION 6: OBSIDIAN EQUIPMENT (28 weapons/armor)
// =============================================================================

export const VP_EQUIPMENT: VPEquipmentDef[] = [
  // Ember Sprite tier — Common (6)
  {
    id: 'coal_blade', name: 'Coal Blade', slot: 'weapon', rarity: 'ember_sprite', defense: 0, fireResist: 2,
    magmaResist: 1, description: 'A crude but effective blade forged from compressed volcanic coal.',
    icon: '🗡️', requiredLevel: 1, craftingMaterials: [{ mineralId: 'coal_nugget', amount: 5 }],
  },
  {
    id: 'ash_vest', name: 'Ash Vest', slot: 'chest', rarity: 'ember_sprite', defense: 5, fireResist: 3,
    magmaResist: 2, description: 'A lightweight vest woven from fire-resistant volcanic ash fibers.',
    icon: '🧥', requiredLevel: 1, craftingMaterials: [{ mineralId: 'ash_pearl', amount: 3 }, { mineralId: 'pumice_stone', amount: 2 }],
  },
  {
    id: 'sulfur_ring', name: 'Sulfur Ring', slot: 'accessory', rarity: 'ember_sprite', defense: 1, fireResist: 5,
    magmaResist: 1, description: 'A ring that emits a faint sulfurous glow, deterring small creatures.',
    icon: '💍', requiredLevel: 2, craftingMaterials: [{ mineralId: 'sulfur_crystal', amount: 4 }],
  },
  {
    id: 'pumice_helm', name: 'Pumice Helm', slot: 'head', rarity: 'ember_sprite', defense: 4, fireResist: 4,
    magmaResist: 2, description: 'A lightweight helmet carved from porous volcanic pumice.',
    icon: '⛑️', requiredLevel: 2, craftingMaterials: [{ mineralId: 'pumice_stone', amount: 4 }, { mineralId: 'coal_nugget', amount: 2 }],
  },
  {
    id: 'slag_gauntlets', name: 'Slag Gauntlets', slot: 'hands', rarity: 'ember_sprite', defense: 3, fireResist: 3,
    magmaResist: 3, description: 'Gauntlets cast from cooling slag that harden on impact.',
    icon: '🧤', requiredLevel: 3, craftingMaterials: [{ mineralId: 'ash_pearl', amount: 3 }, { mineralId: 'sulfur_crystal', amount: 2 }],
  },
  {
    id: 'cinder_boots', name: 'Cinder Boots', slot: 'feet', rarity: 'ember_sprite', defense: 3, fireResist: 6,
    magmaResist: 2, description: 'Boots with soles of compressed cinder that insulate against hot ground.',
    icon: '👢', requiredLevel: 3, craftingMaterials: [{ mineralId: 'coal_nugget', amount: 4 }, { mineralId: 'pumice_stone', amount: 2 }],
  },
  // Magma Golem tier — Uncommon (6)
  {
    id: 'basalt_warhammer', name: 'Basalt Warhammer', slot: 'weapon', rarity: 'magma_golem', defense: 0, fireResist: 5,
    magmaResist: 4, description: 'A devastating hammer of dense basalt that shatters obsidian on impact.',
    icon: '🔨', requiredLevel: 6, craftingMaterials: [{ mineralId: 'basalt_shard', amount: 5 }, { mineralId: 'iron_deposit', amount: 3 }],
  },
  {
    id: 'iron_plate', name: 'Iron Volcanic Plate', slot: 'chest', rarity: 'magma_golem', defense: 12, fireResist: 8,
    magmaResist: 5, description: 'Heavy plate armor forged from volcanic iron deposits.',
    icon: '🛡️', requiredLevel: 7, craftingMaterials: [{ mineralId: 'iron_deposit', amount: 6 }, { mineralId: 'basalt_shard', amount: 2 }],
  },
  {
    id: 'lava_glass_dagger', name: 'Lava Glass Dagger', slot: 'weapon', rarity: 'magma_golem', defense: 0, fireResist: 3,
    magmaResist: 8, description: 'A dagger of razor-sharp lava glass that cuts through anything.',
    icon: '🔪', requiredLevel: 8, craftingMaterials: [{ mineralId: 'lava_glass', amount: 4 }, { mineralId: 'copper_nodule', amount: 2 }],
  },
  {
    id: 'copper_crown', name: 'Copper Crown', slot: 'head', rarity: 'magma_golem', defense: 8, fireResist: 6,
    magmaResist: 4, description: 'A crown of polished volcanic copper that radiates warmth.',
    icon: '👑', requiredLevel: 9, craftingMaterials: [{ mineralId: 'copper_nodule', amount: 5 }, { mineralId: 'feldspar_cluster', amount: 2 }],
  },
  {
    id: 'feldspar_bracers', name: 'Feldspar Bracers', slot: 'hands', rarity: 'magma_golem', defense: 7, fireResist: 5,
    magmaResist: 6, description: 'Bracers studded with volcanic feldspar that absorb kinetic energy.',
    icon: '💪', requiredLevel: 10, craftingMaterials: [{ mineralId: 'feldspar_cluster', amount: 4 }, { mineralId: 'basalt_shard', amount: 3 }],
  },
  {
    id: 'iron_greaves', name: 'Iron Volcanic Greaves', slot: 'legs', rarity: 'magma_golem', defense: 9, fireResist: 7,
    magmaResist: 5, description: 'Leg armor of volcanic iron that withstands the hottest terrain.',
    icon: '🦿', requiredLevel: 11, craftingMaterials: [{ mineralId: 'iron_deposit', amount: 5 }, { mineralId: 'lava_glass', amount: 2 }],
  },
  // Fire Drake tier — Rare (6)
  {
    id: 'obsidian_sword', name: 'Obsidian Sword', slot: 'weapon', rarity: 'fire_drake', defense: 0, fireResist: 8,
    magmaResist: 10, description: 'A legendary sword of perfectly forged obsidian, sharper than steel.',
    icon: '⚔️', requiredLevel: 14, craftingMaterials: [{ mineralId: 'obsidian_gem', amount: 5 }, { mineralId: 'magma_opal', amount: 2 }],
  },
  {
    id: 'ruby_plate_armor', name: 'Ruby Plate Armor', slot: 'chest', rarity: 'fire_drake', defense: 22, fireResist: 15,
    magmaResist: 10, description: 'Armor inlaid with volcanic rubies that glow in the presence of heat.',
    icon: '🛡️', requiredLevel: 16, craftingMaterials: [{ mineralId: 'ruby_heart', amount: 4 }, { mineralId: 'obsidian_gem', amount: 3 }],
  },
  {
    id: 'magma_opal_staff', name: 'Magma Opal Staff', slot: 'weapon', rarity: 'fire_drake', defense: 0, fireResist: 10,
    magmaResist: 12, description: 'A staff topped with a magma opal that channels volcanic energy.',
    icon: '🪄', requiredLevel: 18, craftingMaterials: [{ mineralId: 'magma_opal', amount: 5 }, { mineralId: 'peridot_shard', amount: 3 }],
  },
  {
    id: 'topaz_crown', name: 'Volcanic Topaz Crown', slot: 'head', rarity: 'fire_drake', defense: 15, fireResist: 12,
    magmaResist: 8, description: 'A crown of golden topaz that grants resistance to all volcanic hazards.',
    icon: '👑', requiredLevel: 20, craftingMaterials: [{ mineralId: 'volcanic_topaz', amount: 4 }, { mineralId: 'ruby_heart', amount: 2 }],
  },
  {
    id: 'peridot_shield', name: 'Peridot Tower Shield', slot: 'shield', rarity: 'fire_drake', defense: 18, fireResist: 14,
    magmaResist: 10, description: 'A massive shield of polished peridot that deflects magma streams.',
    icon: '🛡️', requiredLevel: 21, craftingMaterials: [{ mineralId: 'peridot_shard', amount: 6 }, { mineralId: 'obsidian_gem', amount: 2 }],
  },
  {
    id: 'drake_scale_boots', name: 'Drake Scale Boots', slot: 'feet', rarity: 'fire_drake', defense: 12, fireResist: 18,
    magmaResist: 12, description: 'Boots lined with fire drake scales, allowing passage over lava.',
    icon: '👢', requiredLevel: 22, craftingMaterials: [{ mineralId: 'volcanic_topaz', amount: 3 }, { mineralId: 'magma_opal', amount: 3 }],
  },
  // Obsidian Titan tier — Epic (5)
  {
    id: 'dragon_fire_blade', name: 'Dragon Fire Blade', slot: 'weapon', rarity: 'obsidian_titan', defense: 0, fireResist: 15,
    magmaResist: 20, description: 'A blade that burns with captured dragon fire, melting anything it touches.',
    icon: '🗡️', requiredLevel: 26, craftingMaterials: [{ mineralId: 'dragon_fire_opal', amount: 4 }, { mineralId: 'infernal_diamond', amount: 2 }],
  },
  {
    id: 'tectonic_plate', name: 'Tectonic Plate Armor', slot: 'chest', rarity: 'obsidian_titan', defense: 35, fireResist: 25,
    magmaResist: 20, description: 'Armor forged from tectonic plates, capable of withstanding any volcanic force.',
    icon: '🛡️', requiredLevel: 30, craftingMaterials: [{ mineralId: 'tectonic_sapphire', amount: 4 }, { mineralId: 'magma_core_crystal', amount: 3 }],
  },
  {
    id: 'infernal_helm', name: 'Infernal Helm', slot: 'head', rarity: 'obsidian_titan', defense: 25, fireResist: 22,
    magmaResist: 18, description: 'A helmet that burns with infernal fire, illuminating darkness.',
    icon: '⛑️', requiredLevel: 32, craftingMaterials: [{ mineralId: 'infernal_diamond', amount: 3 }, { mineralId: 'dragon_fire_opal', amount: 3 }],
  },
  {
    id: 'magma_core_gauntlets', name: 'Magma Core Gauntlets', slot: 'hands', rarity: 'obsidian_titan', defense: 20, fireResist: 20,
    magmaResist: 22, description: 'Gauntlets containing crystallized magma core energy.',
    icon: '🧤', requiredLevel: 34, craftingMaterials: [{ mineralId: 'magma_core_crystal', amount: 5 }, { mineralId: 'tectonic_sapphire', amount: 2 }],
  },
  {
    id: 'diamond_obsidian_greaves', name: 'Diamond Obsidian Greaves', slot: 'legs', rarity: 'obsidian_titan', defense: 28, fireResist: 20,
    magmaResist: 18, description: 'Greaves of obsidian inlaid with infernal diamonds.',
    icon: '🦿', requiredLevel: 36, craftingMaterials: [{ mineralId: 'infernal_diamond', amount: 4 }, { mineralId: 'magma_core_crystal', amount: 3 }],
  },
  // Volcano Dragon tier — Legendary (5)
  {
    id: 'primordial_greatsword', name: 'Primordial Greatsword', slot: 'weapon', rarity: 'volcano_dragon', defense: 0, fireResist: 30,
    magmaResist: 35, description: 'The ultimate weapon forged from the primordial heartstone itself.',
    icon: '⚔️', requiredLevel: 40, craftingMaterials: [{ mineralId: 'primordial_heartstone', amount: 3 }, { mineralId: 'worldforge_gem', amount: 2 }],
  },
  {
    id: 'worldforge_armor', name: 'Worldforge Armor', slot: 'chest', rarity: 'volcano_dragon', defense: 55, fireResist: 40,
    magmaResist: 35, description: 'Armor that can reshape the earth itself, forged from a worldforge gem.',
    icon: '🛡️', requiredLevel: 43, craftingMaterials: [{ mineralId: 'worldforge_gem', amount: 3 }, { mineralId: 'primordial_heartstone', amount: 2 }],
  },
  {
    id: 'solar_fire_crown', name: 'Solar Fire Crown', slot: 'head', rarity: 'volcano_dragon', defense: 40, fireResist: 35,
    magmaResist: 30, description: 'A crown of solar fire shards that makes the wearer radiate heat like a star.',
    icon: '👑', requiredLevel: 45, craftingMaterials: [{ mineralId: 'solar_f shard', amount: 4 }, { mineralId: 'primordial_heartstone', amount: 2 }],
  },
  {
    id: 'obsidian_monolith_shield', name: 'Obsidian Monolith Shield', slot: 'shield', rarity: 'volcano_dragon', defense: 50, fireResist: 38,
    magmaResist: 32, description: 'A massive shield carved from a sentient obsidian monolith.',
    icon: '🔰', requiredLevel: 47, craftingMaterials: [{ mineralId: 'obsidian_monolith', amount: 4 }, { mineralId: 'worldforge_gem', amount: 2 }],
  },
  {
    id: 'magmacore_sovereign_boots', name: 'Magmacore Sovereign Boots', slot: 'feet', rarity: 'volcano_dragon', defense: 35, fireResist: 42,
    magmaResist: 40, description: 'Boots that allow walking on liquid magma as if it were solid ground.',
    icon: '👢', requiredLevel: 49, craftingMaterials: [{ mineralId: 'primordial_heartstone', amount: 3 }, { mineralId: 'obsidian_monolith', amount: 3 }],
  },
] as const;

// =============================================================================
// SECTION 7: CRAFTING RECIPES
// =============================================================================

export const VP_CRAFTING_RECIPES: VPCraftingRecipe[] = VP_EQUIPMENT.map((eq) => ({
  id: `recipe_${eq.id}`,
  name: `Craft ${eq.name}`,
  outputId: eq.id,
  outputType: 'equipment' as const,
  description: eq.description,
  icon: eq.icon,
  requiredMinerals: eq.craftingMaterials,
  xpReward: Math.floor(eq.defense * 2 + eq.fireResist * 1.5 + eq.magmaResist * 1.5),
  requiredLevel: eq.requiredLevel,
  forgeZone: VP_ZONES.find((z) => z.unlockLevel <= eq.requiredLevel)?.id ?? 'lava_fields',
})).sort((a, b) => a.requiredLevel - b.requiredLevel) as VPCraftingRecipe[];

// =============================================================================
// SECTION 8: ACHIEVEMENTS (15+)
// =============================================================================

export const VP_ACHIEVEMENTS: VPAchievementDef[] = [
  {
    id: 'first_step', name: 'First Step', description: 'Enter the Lava Fields for the first time.',
    conditionKey: 'zones_entered', targetValue: 1, xpReward: 20, coinReward: 10, icon: '👣',
  },
  {
    id: 'zone_explorer', name: 'Zone Explorer', description: 'Visit all 8 volcanic zones at least once.',
    conditionKey: 'zones_entered', targetValue: 8, xpReward: 200, coinReward: 100, icon: '🗺️',
  },
  {
    id: 'creature_slayer_10', name: 'Creature Slayer', description: 'Defeat 10 magma creatures in battle.',
    conditionKey: 'creatures_defeated', targetValue: 10, xpReward: 50, coinReward: 25, icon: '⚔️',
  },
  {
    id: 'creature_slayer_100', name: 'Massacre', description: 'Defeat 100 magma creatures.',
    conditionKey: 'creatures_defeated', targetValue: 100, xpReward: 300, coinReward: 150, icon: '💀',
  },
  {
    id: 'first_tame', name: 'First Companion', description: 'Successfully tame your first magma creature.',
    conditionKey: 'creatures_tamed', targetValue: 1, xpReward: 80, coinReward: 40, icon: '🐾',
  },
  {
    id: 'tame_master', name: 'Taming Master', description: 'Tame 10 different magma creatures.',
    conditionKey: 'creatures_tamed', targetValue: 10, xpReward: 400, coinReward: 200, icon: '🦎',
  },
  {
    id: 'surfer_500', name: 'Magma Surfer', description: 'Surf a total distance of 500 meters on magma flows.',
    conditionKey: 'surf_distance', targetValue: 500, xpReward: 120, coinReward: 60, icon: '🏄',
  },
  {
    id: 'surfer_5000', name: 'Lava Legend', description: 'Surf a total distance of 5,000 meters.',
    conditionKey: 'surf_distance', targetValue: 5000, xpReward: 500, coinReward: 250, icon: '🌊',
  },
  {
    id: 'miner_50', name: 'Amateur Miner', description: 'Mine 50 volcanic minerals.',
    conditionKey: 'minerals_mined', targetValue: 50, xpReward: 100, coinReward: 50, icon: '⛏️',
  },
  {
    id: 'miner_500', name: 'Master Miner', description: 'Mine 500 volcanic minerals.',
    conditionKey: 'minerals_mined', targetValue: 500, xpReward: 600, coinReward: 300, icon: '💎',
  },
  {
    id: 'craft_first', name: 'Apprentice Smith', description: 'Craft your first piece of obsidian equipment.',
    conditionKey: 'items_crafted', targetValue: 1, xpReward: 60, coinReward: 30, icon: '🔨',
  },
  {
    id: 'craft_20', name: 'Master Smith', description: 'Craft 20 pieces of obsidian equipment.',
    conditionKey: 'items_crafted', targetValue: 20, xpReward: 500, coinReward: 250, icon: '⚒️',
  },
  {
    id: 'eruption_veteran', name: 'Eruption Veteran', description: 'Survive 5 volcanic eruption events.',
    conditionKey: 'events_survived', targetValue: 5, xpReward: 150, coinReward: 75, icon: '🌋',
  },
  {
    id: 'expedition_deep', name: 'Deep Diver', description: 'Reach depth 50 in a core expedition.',
    conditionKey: 'max_expedition_depth', targetValue: 50, xpReward: 200, coinReward: 100, icon: '🔽',
  },
  {
    id: 'level_25', name: 'Volcanic Adept', description: 'Reach level 25.',
    conditionKey: 'level', targetValue: 25, xpReward: 250, coinReward: 100, icon: '📈',
  },
  {
    id: 'level_50', name: 'Volcano God', description: 'Reach the maximum level of 50.',
    conditionKey: 'level', targetValue: 50, xpReward: 1000, coinReward: 500, icon: '👑',
  },
  {
    id: 'coin_master', name: 'Molten Fortune', description: 'Accumulate 100,000 coins.',
    conditionKey: 'total_coins_earned', targetValue: 100000, xpReward: 300, coinReward: 150, icon: '💰',
  },
  {
    id: 'dragon_slayer', name: 'Dragon Slayer', description: 'Defeat a Volcano Dragon tier creature.',
    conditionKey: 'dragon_kills', targetValue: 1, xpReward: 400, coinReward: 200, icon: '🐉',
  },
] as const;

// =============================================================================
// SECTION 9: TITLES (8)
// =============================================================================

export const VP_TITLES: VPTitleDef[] = [
  {
    id: 'ash_walker', name: 'Ash Walker', levelReq: 1,
    description: 'A newcomer who walks barefoot across cooling volcanic ash.',
    icon: '👣', color: VP_THEME_COLORS.ashGray,
  },
  {
    id: 'ember_keeper', name: 'Ember Keeper', levelReq: 7,
    description: 'One who tends the eternal embers of the volcano\'s edge.',
    icon: '🔥', color: VP_THEME_COLORS.magmaRed,
  },
  {
    id: 'magma_wader', name: 'Magma Wader', levelReq: 14,
    description: 'A brave soul who wades through shallow magma flows.',
    icon: '🌊', color: VP_THEME_COLORS.lavaOrange,
  },
  {
    id: 'obsidian_scholar', name: 'Obsidian Scholar', levelReq: 21,
    description: 'A student of volcanic glass and its hidden properties.',
    icon: '📖', color: VP_THEME_COLORS.volcanicBlue,
  },
  {
    id: 'drake_rider', name: 'Drake Rider', levelReq: 28,
    description: 'A warrior who has earned the trust of fire drakes.',
    icon: '🐉', color: VP_THEME_COLORS.magmaRed,
  },
  {
    id: 'caldera_lord', name: 'Caldera Lord', levelReq: 35,
    description: 'The ruler of the great volcanic caldera and its creatures.',
    icon: '👑', color: VP_THEME_COLORS.emberYellow,
  },
  {
    id: 'core_seeker', name: 'Core Seeker', levelReq: 42,
    description: 'One who dares to seek the planet\'s burning heart.',
    icon: '🔆', color: VP_THEME_COLORS.coreGlow,
  },
  {
    id: 'volcano_god', name: 'Volcano God', levelReq: 50,
    description: 'The supreme master of all volcanic power and magma creatures.',
    icon: '🌋', color: VP_THEME_COLORS.obsidianBlack,
  },
] as const;

// =============================================================================
// SECTION 10: EVENTS
// =============================================================================

export const VP_EVENTS: VPEventDef[] = [
  {
    id: 'eruption',
    name: 'Volcanic Eruption',
    description: 'The volcano erupts violently! All zones become more dangerous but reward double XP and coins.',
    duration: 90_000,
    xpMultiplier: 2.0,
    coinMultiplier: 2.0,
    icon: '🌋',
    color: VP_THEME_COLORS.magmaRed,
  },
  {
    id: 'magma_surge',
    name: 'Magma Surge',
    description: 'A surge of magma rises from below, flooding lower zones with new creatures to battle.',
    duration: 60_000,
    xpMultiplier: 1.5,
    coinMultiplier: 1.5,
    icon: '🌊',
    color: VP_THEME_COLORS.lavaOrange,
  },
  {
    id: 'obsidian_rain',
    name: 'Obsidian Rain',
    description: 'Fragments of obsidian rain from the sky, granting bonus mining yields and rare mineral drops.',
    duration: 75_000,
    xpMultiplier: 1.25,
    coinMultiplier: 1.75,
    icon: '🌧️',
    color: VP_THEME_COLORS.volcanicBlue,
  },
] as const;

// =============================================================================
// SECTION 11: XP CURVE HELPERS
// =============================================================================

function vpXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= VP_MAX_LEVEL) return Infinity;
  return Math.floor(VP_BASE_XP_PER_LEVEL * Math.pow(level, VP_XP_SCALING_FACTOR));
}

export const VP_XP_TABLE: number[] = [];
for (let i = 0; i <= VP_MAX_LEVEL; i++) {
  VP_XP_TABLE.push(vpXpRequiredForLevel(i));
}

function vpClampLevel(lvl: number): number {
  return Math.max(1, Math.min(VP_MAX_LEVEL, lvl));
}

function vpGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function vpGenerateId(): string {
  return `vp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function vpGetRarityDef(rarity: VPRarity): VPRarityDef {
  return VP_RARITY_DEFS.find((r) => r.key === rarity) ?? VP_RARITY_DEFS[0];
}

function vpRandomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function vpRandomWeightedCreature(creaturePool: readonly VPCreatureDef[]): VPCreatureDef {
  const totalWeight = creaturePool.reduce((sum, c) => sum + vpGetRarityDef(c.rarity).encounterWeight, 0);
  let roll = Math.random() * totalWeight;
  for (const creature of creaturePool) {
    roll -= vpGetRarityDef(creature.rarity).encounterWeight;
    if (roll <= 0) return creature;
  }
  return creaturePool[creaturePool.length - 1];
}

// =============================================================================
// SECTION 12: INITIAL STATE
// =============================================================================

function vpCreateInitialState(): VPDailyState {
  return {
    date: vpGenerateDayKey(Date.now()),
    coreExpeditionsCompleted: 0,
    magmaSurfsCompleted: 0,
    creaturesTamed: 0,
    mineralsMined: 0,
    itemsCrafted: 0,
  };
}

function vpCreateDefaultAchievements(): VPAchievementState[] {
  return VP_ACHIEVEMENTS.map((a) => ({
    id: a.id,
    unlocked: false,
    unlockedAt: null,
    currentValue: 0,
  }));
}

// =============================================================================
// SECTION 13: HOOK — useVolcanoPeak
// =============================================================================

export default function useVolcanoPeak() {
  // --- Core State ---
  const [level, setLevel] = useState<number>(1);
  const [xp, setXp] = useState<number>(0);
  const [totalXp, setTotalXp] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState<number>(0);
  const [totalCoinsSpent, setTotalCoinsSpent] = useState<number>(0);

  // --- Zone & Exploration ---
  const [currentZoneId, setCurrentZoneId] = useState<VPZoneId>('lava_fields');
  const [zonesEntered, setZonesEntered] = useState<Set<VPZoneId>>(new Set<VPZoneId>(['lava_fields']));
  const [currentZone, setCurrentZone] = useState<VPZoneDef>(VP_ZONES[0]);

  // --- Creatures ---
  const [creaturesDefeated, setCreaturesDefeated] = useState<number>(0);
  const [dragonKills, setDragonKills] = useState<number>(0);
  const [tamedCreatures, setTamedCreatures] = useState<VPTamedCreature[]>([]);
  const [activeTaming, setActiveTaming] = useState<VPTamingState | null>(null);
  const [tamingCooldownEnd, setTamingCooldownEnd] = useState<number>(0);

  // --- Mining & Inventory ---
  const [mineralsMined, setMineralsMined] = useState<number>(0);
  const [inventory, setInventory] = useState<Record<string, number>>({});

  // --- Equipment & Crafting ---
  const [equipmentOwned, setEquipmentOwned] = useState<VPEquipmentState[]>([]);
  const [equippedItems, setEquippedItems] = useState<Record<VPEquipmentSlot, string | null>>({
    head: null, chest: null, hands: null, legs: null, feet: null, weapon: null, shield: null, accessory: null,
  });
  const [itemsCrafted, setItemsCrafted] = useState<number>(0);

  // --- Magma Surfing ---
  const [surfingSession, setSurfingSession] = useState<VPSurfingSession | null>(null);
  const [totalSurfDistance, setTotalSurfDistance] = useState<number>(0);
  const [totalSurfsCompleted, setTotalSurfsCompleted] = useState<number>(0);

  // --- Events ---
  const [activeEvent, setActiveEvent] = useState<VPEventDef | null>(null);
  const [eventTimeRemaining, setEventTimeRemaining] = useState<number>(0);
  const [eventsSurvived, setEventsSurvived] = useState<number>(0);
  const [eventLog, setEventLog] = useState<VPEventLogEntry[]>([]);

  // --- Core Expedition ---
  const [activeExpedition, setActiveExpedition] = useState<VPCoreExpedition | null>(null);
  const [maxExpeditionDepth, setMaxExpeditionDepth] = useState<number>(0);

  // --- Achievements ---
  const [achievements, setAchievements] = useState<VPAchievementState[]>(vpCreateDefaultAchievements);

  // --- Daily ---
  const [dailyState, setDailyState] = useState<VPDailyState>(vpCreateInitialState());
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [lastPlayDate, setLastPlayDate] = useState<string | null>(null);

  // --- Refs ---
  const stateRef = useRef({
    level, xp, totalXp, coins, totalCoinsEarned, totalCoinsSpent,
    creaturesDefeated, dragonKills, mineralsMined, itemsCrafted,
    totalSurfDistance, eventsSurvived, maxExpeditionDepth, zonesEntered,
  });
  const eventTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync refs to state in useEffect
  useEffect(() => {
    stateRef.current = {
      level, xp, totalXp, coins, totalCoinsEarned, totalCoinsSpent,
      creaturesDefeated, dragonKills, mineralsMined, itemsCrafted,
      totalSurfDistance, eventsSurvived, maxExpeditionDepth, zonesEntered,
    };
  }, [level, xp, totalXp, coins, totalCoinsEarned, totalCoinsSpent, creaturesDefeated, dragonKills, mineralsMined, itemsCrafted, totalSurfDistance, eventsSurvived, maxExpeditionDepth, zonesEntered]);

  // --- Daily Reset ---
  useEffect(() => {
    const todayKey = vpGenerateDayKey(Date.now());
    if (dailyState.date !== todayKey) {
      const yesterdayKey = vpGenerateDayKey(Date.now() - VP_DAILY_RESET_MS);
      if (lastPlayDate === yesterdayKey) {
        setStreak((s) => {
          const newStreak = s + 1;
          setBestStreak((b) => Math.max(b, newStreak));
          return newStreak;
        });
      } else if (lastPlayDate !== todayKey && lastPlayDate !== null) {
        setStreak(0);
      }
      setLastPlayDate(todayKey);
      setDailyState(vpCreateInitialState());
    }
  }, [dailyState.date, lastPlayDate]);

  // --- Event Timer ---
  useEffect(() => {
    if (activeEvent && eventTimeRemaining > 0) {
      if (eventTimerRef.current) clearInterval(eventTimerRef.current);
      eventTimerRef.current = setInterval(() => {
        setEventTimeRemaining((prev) => {
          if (prev <= 1000) {
            if (eventTimerRef.current) clearInterval(eventTimerRef.current);
            eventTimerRef.current = null;
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    } else if (!activeEvent || eventTimeRemaining <= 0) {
      if (eventTimerRef.current) {
        clearInterval(eventTimerRef.current);
        eventTimerRef.current = null;
      }
      if (activeEvent && eventTimeRemaining <= 0) {
        setActiveEvent(null);
        setEventsSurvived((s) => s + 1);
      }
    }
    return () => {
      if (eventTimerRef.current) {
        clearInterval(eventTimerRef.current);
        eventTimerRef.current = null;
      }
    };
  }, [activeEvent, eventTimeRemaining]);

  // --- Computed: Current Title ---
  const currentTitle = useMemo((): VPTitleDef => {
    let title = VP_TITLES[0];
    for (const t of VP_TITLES) {
      if (level >= t.levelReq) title = t;
    }
    return title;
  }, [level]);

  // --- Computed: XP Progress ---
  const xpProgress = useMemo(() => {
    const needed = VP_XP_TABLE[level] ?? Infinity;
    const prevTotal = VP_XP_TABLE.slice(0, level).reduce((a, b) => a + b, 0);
    return {
      current: xp,
      needed,
      percentage: needed === Infinity ? 100 : Math.min(100, (xp / needed) * 100),
      totalForNextLevel: prevTotal + needed,
    };
  }, [level, xp]);

  // --- Computed: Available Zones ---
  const availableZones = useMemo(() => {
    return VP_ZONES.filter((z) => z.unlockLevel <= level);
  }, [level]);

  // --- Computed: Creatures in Current Zone ---
  const creaturesInZone = useMemo(() => {
    return VP_CREATURES.filter((c) => c.zoneAffinity.includes(currentZoneId));
  }, [currentZoneId]);

  // --- Computed: Craftable Recipes ---
  const craftableRecipes = useMemo(() => {
    return VP_CRAFTING_RECIPES.filter((r) => r.requiredLevel <= level);
  }, [level]);

  // --- Computed: Can Craft Recipe ---
  const canCraftRecipe = useCallback((recipeId: string): boolean => {
    const recipe = VP_CRAFTING_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return false;
    if (recipe.requiredLevel > level) return false;
    for (const req of recipe.requiredMinerals) {
      if ((inventory[req.mineralId] ?? 0) < req.amount) return false;
    }
    const alreadyOwned = equipmentOwned.some((e) => e.equipmentId === recipe.outputId);
    if (alreadyOwned) return false;
    return true;
  }, [level, inventory, equipmentOwned]);

  // --- Computed: Tameable Creatures ---
  const tameableCreatures = useMemo(() => {
    return VP_CREATURES.filter((c) => c.canTame && tamedCreatures.every((t) => t.creatureId !== c.id));
  }, [tamedCreatures]);

  // --- Computed: Total Defense ---
  const totalDefense = useMemo(() => {
    let def = 0;
    for (const slotId of Object.keys(equippedItems) as VPEquipmentSlot[]) {
      const eqId = equippedItems[slotId];
      if (!eqId) continue;
      const eq = VP_EQUIPMENT.find((e) => e.id === eqId);
      if (eq) def += eq.defense;
    }
    return def;
  }, [equippedItems]);

  // --- Computed: Total Fire Resist ---
  const totalFireResist = useMemo(() => {
    let resist = 0;
    for (const slotId of Object.keys(equippedItems) as VPEquipmentSlot[]) {
      const eqId = equippedItems[slotId];
      if (!eqId) continue;
      const eq = VP_EQUIPMENT.find((e) => e.id === eqId);
      if (eq) resist += eq.fireResist;
    }
    return resist;
  }, [equippedItems]);

  // --- Computed: Total Magma Resist ---
  const totalMagmaResist = useMemo(() => {
    let resist = 0;
    for (const slotId of Object.keys(equippedItems) as VPEquipmentSlot[]) {
      const eqId = equippedItems[slotId];
      if (!eqId) continue;
      const eq = VP_EQUIPMENT.find((e) => e.id === eqId);
      if (eq) resist += eq.magmaResist;
    }
    return resist;
  }, [equippedItems]);

  // --- Computed: Event Multiplier ---
  const activeMultiplier = useMemo(() => {
    if (!activeEvent) return { xp: 1, coins: 1 };
    return { xp: activeEvent.xpMultiplier, coins: activeEvent.coinMultiplier };
  }, [activeEvent]);

  // =========================================================================
  // ACTIONS
  // =========================================================================

  // --- Add XP with Level Up ---
  const addXp = useCallback((amount: number) => {
    const multiplied = Math.floor(amount * stateRef.current.level > 0 ? 1 : 1);
    const finalAmount = Math.floor(multiplied * (activeEvent?.xpMultiplier ?? 1));
    setXp((prev) => prev + finalAmount);
    setTotalXp((prev) => prev + finalAmount);
  }, [activeEvent]);

  const processLevelUp = useCallback(() => {
    setXp((prevXp) => {
      setLevel((prevLevel) => {
        let currentLevel = prevLevel;
        let currentXp = prevXp;
        while (currentLevel < VP_MAX_LEVEL) {
          const needed = VP_XP_TABLE[currentLevel] ?? Infinity;
          if (currentXp >= needed) {
            currentXp -= needed;
            currentLevel += 1;
          } else {
            break;
          }
        }
        if (currentLevel !== prevLevel) {
          void currentLevel;
        }
        return vpClampLevel(currentLevel);
      });
      return prevXp;
    });
  }, []);

  // Check level ups whenever XP changes
  useEffect(() => {
    const needed = VP_XP_TABLE[level] ?? Infinity;
    if (xp >= needed && level < VP_MAX_LEVEL) {
      processLevelUp();
    }
  }, [xp, level, processLevelUp]);

  // --- Add Coins ---
  const addCoins = useCallback((amount: number) => {
    const multiplied = Math.floor(amount * (activeEvent?.coinMultiplier ?? 1));
    const clamped = Math.min(VP_MAX_COINS, multiplied);
    setCoins((prev) => Math.min(VP_MAX_COINS, prev + clamped));
    setTotalCoinsEarned((prev) => prev + clamped);
  }, [activeEvent]);

  // --- Spend Coins ---
  const spendCoins = useCallback((amount: number) => {
    setCoins((prev) => {
      if (prev < amount) return prev;
      const newAmount = prev - amount;
      setTotalCoinsSpent((s) => s + amount);
      return newAmount;
    });
  }, []);

  // --- Enter Zone ---
  const enterZone = useCallback((zoneId: VPZoneId) => {
    const zone = VP_ZONES.find((z) => z.id === zoneId);
    if (!zone) return;
    if (zone.unlockLevel > level) return;
    setCurrentZoneId(zoneId);
    setCurrentZone(zone);
    setZonesEntered((prev) => {
      const next = new Set(prev);
      next.add(zoneId);
      return next;
    });
  }, [level]);

  // --- Defeat Creature ---
  const defeatCreature = useCallback((creatureId: string) => {
    const creature = VP_CREATURES.find((c) => c.id === creatureId);
    if (!creature) return;
    const rarityDef = vpGetRarityDef(creature.rarity);
    const xpGained = Math.floor(creature.xpReward * rarityDef.xpMultiplier);
    const coinsGained = creature.coinReward;
    addXp(xpGained);
    addCoins(coinsGained);
    setCreaturesDefeated((c) => c + 1);
    if (creature.rarity === 'volcano_dragon') {
      setDragonKills((d) => d + 1);
    }
  }, [addXp, addCoins]);

  // --- Start Taming ---
  const startTaming = useCallback((creatureId: string) => {
    const creature = VP_CREATURES.find((c) => c.id === creatureId);
    if (!creature) return;
    if (!creature.canTame) return;
    if (tamedCreatures.length >= VP_MAX_TAMED_CREATURES) return;
    if (tamedCreatures.some((t) => t.creatureId === creatureId)) return;
    if (Date.now() < tamingCooldownEnd) return;
    setActiveTaming({
      creatureId,
      progress: 0,
      maxProgress: creature.tamingDifficulty * 100,
      startedAt: Date.now(),
      completed: false,
    });
  }, [tamedCreatures, tamingCooldownEnd]);

  // --- Feed During Taming ---
  const feedTaming = useCallback((amount: number) => {
    if (!activeTaming) return;
    setActiveTaming((prev) => {
      if (!prev || prev.completed) return prev;
      const newProgress = prev.progress + amount;
      if (newProgress >= prev.maxProgress) {
        return { ...prev, progress: prev.maxProgress, completed: true };
      }
      return { ...prev, progress: newProgress };
    });
  }, [activeTaming]);

  // --- Complete Taming ---
  const completeTaming = useCallback(() => {
    if (!activeTaming || !activeTaming.completed) return;
    const creature = VP_CREATURES.find((c) => c.id === activeTaming.creatureId);
    if (!creature) return;
    const newTamed: VPTamedCreature = {
      creatureId: activeTaming.creatureId,
      tamedAt: Date.now(),
      nickname: creature.name,
      level: 1,
      xp: 0,
      bondStrength: 10,
    };
    setTamedCreatures((prev) => [...prev, newTamed]);
    setTamingCooldownEnd(Date.now() + VP_TAMING_COOLDOWN_MS);
    setActiveTaming(null);
    setCreaturesTamed((prev) => prev + 1);
  }, [activeTaming]);

  // Alias for daily tracking
  const setCreaturesTamed = useCallback((updater: number | ((prev: number) => number)) => {
    setDailyState((prev) => ({
      ...prev,
      creaturesTamed: typeof updater === 'function' ? updater(prev.creaturesTamed) : updater,
    }));
  }, []);

  // --- Level Up Tamed Creature ---
  const levelUpTamed = useCallback((creatureId: string) => {
    setTamedCreatures((prev) =>
      prev.map((tc) => {
        if (tc.creatureId !== creatureId) return tc;
        const xpNeeded = tc.level * 50;
        if (tc.xp < xpNeeded) return tc;
        return {
          ...tc,
          xp: tc.xp - xpNeeded,
          level: Math.min(50, tc.level + 1),
          bondStrength: Math.min(VP_BOND_STRENGTH_MAX, tc.bondStrength + 5),
        };
      })
    );
  }, []);

  // --- Add XP to Tamed Creature ---
  const addTamedXp = useCallback((creatureId: string, amount: number) => {
    setTamedCreatures((prev) =>
      prev.map((tc) => {
        if (tc.creatureId !== creatureId) return tc;
        return { ...tc, xp: tc.xp + amount };
      })
    );
  }, []);

  // --- Bond With Tamed Creature ---
  const bondWithCreature = useCallback((creatureId: string, amount: number) => {
    setTamedCreatures((prev) =>
      prev.map((tc) => {
        if (tc.creatureId !== creatureId) return tc;
        return { ...tc, bondStrength: Math.min(VP_BOND_STRENGTH_MAX, tc.bondStrength + amount) };
      })
    );
  }, []);

  // --- Release Tamed Creature ---
  const releaseCreature = useCallback((creatureId: string) => {
    setTamedCreatures((prev) => prev.filter((tc) => tc.creatureId !== creatureId));
  }, []);

  // --- Rename Tamed Creature ---
  const renameCreature = useCallback((creatureId: string, nickname: string) => {
    setTamedCreatures((prev) =>
      prev.map((tc) => {
        if (tc.creatureId !== creatureId) return tc;
        return { ...tc, nickname };
      })
    );
  }, []);

  // --- Mine Mineral ---
  const mineMineral = useCallback((mineralId: string) => {
    const mineral = VP_MINERALS.find((m) => m.id === mineralId);
    if (!mineral) return;
    addXp(mineral.xpReward);
    addCoins(mineral.coinValue);
    setInventory((prev) => ({
      ...prev,
      [mineralId]: (prev[mineralId] ?? 0) + 1,
    }));
    setMineralsMined((m) => m + 1);
    setDailyState((prev) => ({
      ...prev,
      mineralsMined: prev.mineralsMined + 1,
    }));
  }, [addXp, addCoins]);

  // --- Mine Multiple ---
  const mineMinerals = useCallback((mineralEntries: { mineralId: string; amount: number }[]) => {
    let totalXpGain = 0;
    let totalCoinGain = 0;
    const newInventory: Record<string, number> = {};
    for (const entry of mineralEntries) {
      const mineral = VP_MINERALS.find((m) => m.id === entry.mineralId);
      if (!mineral) continue;
      totalXpGain += mineral.xpReward * entry.amount;
      totalCoinGain += mineral.coinValue * entry.amount;
      newInventory[entry.mineralId] = (newInventory[entry.mineralId] ?? 0) + entry.amount;
    }
    addXp(totalXpGain);
    addCoins(totalCoinGain);
    setInventory((prev) => {
      const next = { ...prev };
      for (const [id, amt] of Object.entries(newInventory)) {
        next[id] = (next[id] ?? 0) + amt;
      }
      return next;
    });
    const totalMined = mineralEntries.reduce((s, e) => s + e.amount, 0);
    setMineralsMined((m) => m + totalMined);
    setDailyState((prev) => ({
      ...prev,
      mineralsMined: prev.mineralsMined + totalMined,
    }));
  }, [addXp, addCoins]);

  // --- Craft Equipment ---
  const craftEquipment = useCallback((recipeId: string) => {
    const recipe = VP_CRAFTING_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return false;
    if (recipe.requiredLevel > level) return false;
    for (const req of recipe.requiredMinerals) {
      if ((inventory[req.mineralId] ?? 0) < req.amount) return false;
    }
    const alreadyOwned = equipmentOwned.some((e) => e.equipmentId === recipe.outputId);
    if (alreadyOwned) return false;
    const newInventory = { ...inventory };
    for (const req of recipe.requiredMinerals) {
      newInventory[req.mineralId] = (newInventory[req.mineralId] ?? 0) - req.amount;
    }
    setInventory(newInventory);
    const newEquipment: VPEquipmentState = {
      equipmentId: recipe.outputId,
      equipped: false,
      craftedAt: Date.now(),
      upgrades: 0,
    };
    setEquipmentOwned((prev) => [...prev, newEquipment]);
    setItemsCrafted((c) => c + 1);
    addXp(recipe.xpReward);
    setDailyState((prev) => ({
      ...prev,
      itemsCrafted: prev.itemsCrafted + 1,
    }));
    return true;
  }, [level, inventory, equipmentOwned, addXp]);

  // --- Equip Item ---
  const equipItem = useCallback((equipmentId: string) => {
    const eq = VP_EQUIPMENT.find((e) => e.id === equipmentId);
    if (!eq) return;
    const owned = equipmentOwned.find((e) => e.equipmentId === equipmentId);
    if (!owned) return;
    setEquippedItems((prev) => {
      const next = { ...prev };
      const prevInSlot = next[eq.slot];
      if (prevInSlot) {
        setEquipmentOwned((eo) =>
          eo.map((e) => (e.equipmentId === prevInSlot ? { ...e, equipped: false } : e))
        );
      }
      next[eq.slot] = equipmentId;
      setEquipmentOwned((eo) =>
        eo.map((e) => (e.equipmentId === equipmentId ? { ...e, equipped: true } : e))
      );
      return next;
    });
  }, [equipmentOwned]);

  // --- Unequip Item ---
  const unequipItem = useCallback((slot: VPEquipmentSlot) => {
    const currentId = equippedItems[slot];
    if (!currentId) return;
    setEquippedItems((prev) => ({ ...prev, [slot]: null }));
    setEquipmentOwned((eo) =>
      eo.map((e) => (e.equipmentId === currentId ? { ...e, equipped: false } : e))
    );
  }, [equippedItems]);

  // --- Upgrade Equipment ---
  const upgradeEquipment = useCallback((equipmentId: string) => {
    const owned = equipmentOwned.find((e) => e.equipmentId === equipmentId);
    if (!owned) return false;
    const eq = VP_EQUIPMENT.find((e) => e.id === equipmentId);
    if (!eq) return false;
    const upgradeCost = Math.floor((eq.defense + eq.fireResist + eq.magmaResist) * (owned.upgrades + 1) * 10);
    if (coins < upgradeCost) return false;
    spendCoins(upgradeCost);
    setEquipmentOwned((prev) =>
      prev.map((e) => (e.equipmentId === equipmentId ? { ...e, upgrades: e.upgrades + 1 } : e))
    );
    addXp(Math.floor(upgradeCost / 2));
    return true;
  }, [equipmentOwned, coins, spendCoins, addXp]);

  // --- Magma Surfing ---
  const startSurfing = useCallback(() => {
    setSurfingSession({
      distance: 0,
      maxSpeed: 0,
      obstaclesAvoided: 0,
      startTime: Date.now(),
      endTime: null,
      coinsEarned: 0,
      xpEarned: 0,
    });
  }, []);

  const updateSurfing = useCallback((distance: number, speed: number, obstacles: number) => {
    setSurfingSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        distance: prev.distance + distance,
        maxSpeed: Math.max(prev.maxSpeed, speed),
        obstaclesAvoided: prev.obstaclesAvoided + obstacles,
      };
    });
  }, []);

  const endSurfing = useCallback(() => {
    setSurfingSession((prev) => {
      if (!prev) return prev;
      const distanceBonus = Math.floor(prev.distance / 10);
      const obstacleBonus = prev.obstaclesAvoided * 5;
      const speedBonus = Math.floor(prev.maxSpeed * 2);
      const totalCoins = distanceBonus + obstacleBonus + speedBonus;
      const totalXp = Math.floor(totalCoins * 1.5);
      addCoins(totalCoins);
      addXp(totalXp);
      setTotalSurfDistance((d) => d + prev.distance);
      setTotalSurfsCompleted((c) => c + 1);
      setDailyState((ds) => ({
        ...ds,
        magmaSurfsCompleted: ds.magmaSurfsCompleted + 1,
      }));
      return {
        ...prev,
        endTime: Date.now(),
        coinsEarned: totalCoins,
        xpEarned: totalXp,
      };
    });
  }, [addCoins, addXp]);

  // --- Events ---
  const triggerEvent = useCallback((eventType: VPEventType) => {
    const eventDef = VP_EVENTS.find((e) => e.id === eventType);
    if (!eventDef) return;
    const duration = eventDef.duration + Math.floor(Math.random() * 30_000);
    setActiveEvent(eventDef);
    setEventTimeRemaining(duration);
  }, []);

  const endEventEarly = useCallback(() => {
    setActiveEvent(null);
    setEventTimeRemaining(0);
    setEventsSurvived((s) => s + 1);
  }, []);

  const triggerRandomEvent = useCallback(() => {
    const event = vpRandomChoice(VP_EVENTS);
    triggerEvent(event.id);
  }, [triggerEvent]);

  // --- Core Expedition ---
  const startExpedition = useCallback(() => {
    if (activeExpedition) return;
    if (dailyState.coreExpeditionsCompleted >= 3) return;
    setActiveExpedition({
      depth: 0,
      creaturesDefeated: 0,
      mineralsFound: 0,
      startedAt: Date.now(),
      completedAt: null,
      rewardsClaimed: false,
      xpEarned: 0,
      coinsEarned: 0,
    });
  }, [activeExpedition, dailyState.coreExpeditionsCompleted]);

  const advanceExpedition = useCallback((depthGained: number, creaturesDefeated: number, mineralsFound: number) => {
    setActiveExpedition((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        depth: Math.min(VP_EXPEDITION_MAX_DEPTH, prev.depth + depthGained),
        creaturesDefeated: prev.creaturesDefeated + creaturesDefeated,
        mineralsFound: prev.mineralsFound + mineralsFound,
      };
    });
  }, []);

  const completeExpedition = useCallback(() => {
    setActiveExpedition((prev) => {
      if (!prev || prev.completedAt) return prev;
      const depthBonus = prev.depth * 5;
      const creatureBonus = prev.creaturesDefeated * 15;
      const mineralBonus = prev.mineralsFound * 10;
      const totalXp = depthBonus + creatureBonus + mineralBonus;
      const totalCoins = Math.floor(totalXp * 0.8);
      addXp(totalXp);
      addCoins(totalCoins);
      setMaxExpeditionDepth((m) => Math.max(m, prev.depth));
      setDailyState((ds) => ({
        ...ds,
        coreExpeditionsCompleted: ds.coreExpeditionsCompleted + 1,
      }));
      return {
        ...prev,
        completedAt: Date.now(),
        rewardsClaimed: true,
        xpEarned: totalXp,
        coinsEarned: totalCoins,
      };
    });
  }, [addXp, addCoins]);

  const abandonExpedition = useCallback(() => {
    setActiveExpedition(null);
  }, []);

  // --- Achievement Checking ---
  const checkAchievements = useCallback(() => {
    setAchievements((prev) => {
      let changed = false;
      const updated = prev.map((a) => {
        if (a.unlocked) return a;
        const def = VP_ACHIEVEMENTS.find((d) => d.id === a.id);
        if (!def) return a;
        let currentValue = a.currentValue;
        switch (def.conditionKey) {
          case 'zones_entered': currentValue = stateRef.current.zonesEntered.size; break;
          case 'creatures_defeated': currentValue = stateRef.current.creaturesDefeated; break;
          case 'creatures_tamed': currentValue = stateRef.current.dragonKills; break;
          case 'surf_distance': currentValue = stateRef.current.totalSurfDistance; break;
          case 'minerals_mined': currentValue = stateRef.current.mineralsMined; break;
          case 'items_crafted': currentValue = stateRef.current.itemsCrafted; break;
          case 'events_survived': currentValue = stateRef.current.eventsSurvived; break;
          case 'max_expedition_depth': currentValue = stateRef.current.maxExpeditionDepth; break;
          case 'level': currentValue = stateRef.current.level; break;
          case 'total_coins_earned': currentValue = stateRef.current.totalCoinsEarned; break;
          case 'dragon_kills': currentValue = stateRef.current.dragonKills; break;
          default: break;
        }
        if (currentValue >= def.targetValue) {
          changed = true;
          return { ...a, unlocked: true, unlockedAt: Date.now(), currentValue };
        }
        return { ...a, currentValue };
      });
      return changed ? updated : prev;
    });
  }, []);

  // Check achievements periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkAchievements();
    }, 5000);
    return () => clearInterval(interval);
  }, [checkAchievements]);

  // --- Claim Achievement Rewards ---
  const claimAchievementReward = useCallback((achievementId: string) => {
    const achState = achievements.find((a) => a.id === achievementId);
    if (!achState || !achState.unlocked || achState.unlockedAt === null) return false;
    const def = VP_ACHIEVEMENTS.find((d) => d.id === achievementId);
    if (!def) return false;
    addXp(def.xpReward);
    addCoins(def.coinReward);
    setAchievements((prev) => prev.filter((a) => a.id !== achievementId));
    return true;
  }, [achievements, addXp, addCoins]);

  // --- Get Creature by ID ---
  const getCreatureDef = useCallback((creatureId: string): VPCreatureDef | undefined => {
    return VP_CREATURES.find((c) => c.id === creatureId);
  }, []);

  // --- Get Equipment by ID ---
  const getEquipmentDef = useCallback((equipmentId: string): VPEquipmentDef | undefined => {
    return VP_EQUIPMENT.find((e) => e.id === equipmentId);
  }, []);

  // --- Get Zone by ID ---
  const getZoneDef = useCallback((zoneId: string): VPZoneDef | undefined => {
    return VP_ZONES.find((z) => z.id === zoneId);
  }, []);

  // --- Get Mineral by ID ---
  const getMineralDef = useCallback((mineralId: string): VPMiningDef | undefined => {
    return VP_MINERALS.find((m) => m.id === mineralId);
  }, []);

  // --- Encounter Random Creature ---
  const encounterCreature = useCallback((): VPCreatureDef => {
    const zoneCreatures = VP_CREATURES.filter((c) => c.zoneAffinity.includes(currentZoneId));
    if (zoneCreatures.length === 0) return VP_CREATURES[0];
    return vpRandomWeightedCreature(zoneCreatures);
  }, [currentZoneId]);

  // --- Simulate Battle ---
  const simulateBattle = useCallback((playerPower: number, creatureId: string): { won: boolean; damageTaken: number; xpGained: number; coinsGained: number } => {
    const creature = VP_CREATURES.find((c) => c.id === creatureId);
    if (!creature) return { won: false, damageTaken: 0, xpGained: 0, coinsGained: 0 };
    const playerAttack = playerPower + totalDefense * 0.5;
    const creatureAttack = creature.damage * (1 - totalFireResist * 0.005);
    const turnsToKillCreature = Math.ceil(creature.hp / Math.max(1, playerAttack));
    const turnsToKillPlayer = Math.ceil(100 / Math.max(1, creatureAttack));
    const won = turnsToKillCreature <= turnsToKillPlayer;
    const damageTaken = won
      ? Math.floor(creatureAttack * turnsToKillCreature * 0.6)
      : 100;
    const rarityDef = vpGetRarityDef(creature.rarity);
    const xpGained = won ? Math.floor(creature.xpReward * rarityDef.xpMultiplier) : 0;
    const coinsGained = won ? creature.coinReward : 0;
    return { won, damageTaken, xpGained, coinsGained };
  }, [totalDefense, totalFireResist]);

  // --- Battle and Apply Results ---
  const battleCreature = useCallback((playerPower: number, creatureId: string) => {
    const result = simulateBattle(playerPower, creatureId);
    if (result.won) {
      defeatCreature(creatureId);
    }
    return result;
  }, [simulateBattle, defeatCreature]);

  // --- Mining Simulation ---
  const simulateMining = useCallback((mineralId: string): { success: boolean; xpGained: number; coinsGained: number } => {
    const mineral = VP_MINERALS.find((m) => m.id === mineralId);
    if (!mineral) return { success: false, xpGained: 0, coinsGained: 0 };
    const bonusChance = activeEvent?.id === 'obsidian_rain' ? 0.3 : 0;
    const success = Math.random() < (0.8 + bonusChance);
    if (success) {
      mineMineral(mineralId);
    }
    return {
      success,
      xpGained: success ? mineral.xpReward : 0,
      coinsGained: success ? mineral.coinValue : 0,
    };
  }, [activeEvent, mineMineral]);

  // --- Sell Mineral ---
  const sellMineral = useCallback((mineralId: string, amount: number) => {
    const currentAmount = inventory[mineralId] ?? 0;
    if (currentAmount < amount) return 0;
    const mineral = VP_MINERALS.find((m) => m.id === mineralId);
    if (!mineral) return 0;
    const totalValue = mineral.coinValue * amount;
    setInventory((prev) => ({
      ...prev,
      [mineralId]: prev[mineralId] - amount,
    }));
    addCoins(totalValue);
    return totalValue;
  }, [inventory, addCoins]);

  // --- Sell All Minerals ---
  const sellAllMinerals = useCallback((): number => {
    let totalValue = 0;
    const newInventory = { ...inventory };
    for (const [mineralId, amount] of Object.entries(newInventory)) {
      if (amount <= 0) continue;
      const mineral = VP_MINERALS.find((m) => m.id === mineralId);
      if (!mineral) continue;
      totalValue += mineral.coinValue * amount;
      newInventory[mineralId] = 0;
    }
    setInventory(newInventory);
    addCoins(totalValue);
    return totalValue;
  }, [inventory, addCoins]);

  // --- Equip Best Available ---
  const equipBestAvailable = useCallback(() => {
    const slots: VPEquipmentSlot[] = ['head', 'chest', 'hands', 'legs', 'feet', 'weapon', 'shield', 'accessory'];
    for (const slot of slots) {
      const slotItems = equipmentOwned.filter((e) => {
        const eq = VP_EQUIPMENT.find((def) => def.id === e.equipmentId);
        return eq && eq.slot === slot;
      });
      if (slotItems.length === 0) continue;
      slotItems.sort((a, b) => {
        const eqA = VP_EQUIPMENT.find((e) => e.id === a.equipmentId);
        const eqB = VP_EQUIPMENT.find((e) => e.id === b.equipmentId);
        if (!eqA || !eqB) return 0;
        const scoreA = (eqA.defense + eqA.fireResist + eqA.magmaResist) * 10 + a.upgrades * 5;
        const scoreB = (eqB.defense + eqB.fireResist + eqB.magmaResist) * 10 + b.upgrades * 5;
        return scoreB - scoreA;
      });
      equipItem(slotItems[0].equipmentId);
    }
  }, [equipmentOwned, equipItem]);

  // --- Unequip All ---
  const unequipAll = useCallback(() => {
    const slots: VPEquipmentSlot[] = ['head', 'chest', 'hands', 'legs', 'feet', 'weapon', 'shield', 'accessory'];
    for (const slot of slots) {
      unequipItem(slot);
    }
  }, [unequipItem]);

  // --- Reset All Progress ---
  const resetProgress = useCallback(() => {
    setLevel(1);
    setXp(0);
    setTotalXp(0);
    setCoins(0);
    setTotalCoinsEarned(0);
    setTotalCoinsSpent(0);
    setCurrentZoneId('lava_fields');
    setCurrentZone(VP_ZONES[0]);
    setZonesEntered(new Set<VPZoneId>(['lava_fields']));
    setCreaturesDefeated(0);
    setDragonKills(0);
    setTamedCreatures([]);
    setActiveTaming(null);
    setTamingCooldownEnd(0);
    setMineralsMined(0);
    setInventory({});
    setEquipmentOwned([]);
    setEquippedItems({
      head: null, chest: null, hands: null, legs: null, feet: null,
      weapon: null, shield: null, accessory: null,
    });
    setItemsCrafted(0);
    setSurfingSession(null);
    setTotalSurfDistance(0);
    setTotalSurfsCompleted(0);
    setActiveEvent(null);
    setEventTimeRemaining(0);
    setEventsSurvived(0);
    setEventLog([]);
    setActiveExpedition(null);
    setMaxExpeditionDepth(0);
    setAchievements(vpCreateDefaultAchievements());
    setDailyState(vpCreateInitialState());
    setStreak(0);
    setBestStreak(0);
    setLastPlayDate(null);
  }, []);

  // =========================================================================
  // RETURN
  // =========================================================================

  return {
    // State
    level,
    xp,
    totalXp,
    coins,
    totalCoinsEarned,
    totalCoinsSpent,
    currentZoneId,
    currentZone,
    zonesEntered,
    creaturesDefeated,
    dragonKills,
    tamedCreatures,
    activeTaming,
    tamingCooldownEnd,
    mineralsMined,
    inventory,
    equipmentOwned,
    equippedItems,
    itemsCrafted,
    surfingSession,
    totalSurfDistance,
    totalSurfsCompleted,
    activeEvent,
    eventTimeRemaining,
    eventsSurvived,
    eventLog,
    activeExpedition,
    maxExpeditionDepth,
    achievements,
    dailyState,
    streak,
    bestStreak,
    lastPlayDate,

    // Computed
    currentTitle,
    xpProgress,
    availableZones,
    creaturesInZone,
    craftableRecipes,
    canCraftRecipe,
    tameableCreatures,
    totalDefense,
    totalFireResist,
    totalMagmaResist,
    activeMultiplier,

    // Actions
    addXp,
    addCoins,
    spendCoins,
    enterZone,
    defeatCreature,
    startTaming,
    feedTaming,
    completeTaming,
    levelUpTamed,
    addTamedXp,
    bondWithCreature,
    releaseCreature,
    renameCreature,
    mineMineral,
    mineMinerals,
    craftEquipment,
    equipItem,
    unequipItem,
    upgradeEquipment,
    startSurfing,
    updateSurfing,
    endSurfing,
    triggerEvent,
    endEventEarly,
    triggerRandomEvent,
    startExpedition,
    advanceExpedition,
    completeExpedition,
    abandonExpedition,
    checkAchievements,
    claimAchievementReward,
    getCreatureDef,
    getEquipmentDef,
    getZoneDef,
    getMineralDef,
    encounterCreature,
    simulateBattle,
    battleCreature,
    simulateMining,
    sellMineral,
    sellAllMinerals,
    equipBestAvailable,
    unequipAll,
    resetProgress,
  };
}
