import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================================
// Magma Core (熔岩地核) — Deep-Earth Magma Core Expedition Wire Module
// Mine rare minerals, tame magma creatures, build underground facilities,
// and withstand extreme heat on the journey to the planet's molten core.
// ============================================================================

// ============================================================================
// Type Definitions
// ============================================================================

export type MkRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type MkZoneType =
  | 'crust'
  | 'magma_river'
  | 'obsidian_cavern'
  | 'lava_falls'
  | 'pressure_chamber'
  | 'crystal_vein'
  | 'outer_core'
  | 'inner_core';

export interface MkCreatureDef {
  id: string;
  name: string;
  rarity: MkRarity;
  zoneIndex: number;
  description: string;
  emoji: string;
  xpReward: number;
  tameChance: number;
  heatResistance: number;
  mineralDrop: string;
}

export interface MkCreature {
  id: string;
  name: string;
  rarity: MkRarity;
  zoneIndex: number;
  description: string;
  emoji: string;
  xpReward: number;
  tameChance: number;
  heatResistance: number;
  mineralDrop: string;
  discovered: boolean;
  tamed: boolean;
  encounterCount: number;
  lastSeen: number | null;
}

export interface MkZoneDef {
  id: number;
  name: string;
  description: string;
  emoji: string;
  depthMin: number;
  depthMax: number;
  dangerLevel: number;
  heatRate: number;
  baseMineralChance: number;
  creatureIds: string[];
}

export interface MkZone {
  id: number;
  name: string;
  description: string;
  emoji: string;
  depthMin: number;
  depthMax: number;
  dangerLevel: number;
  heatRate: number;
  baseMineralChance: number;
  creatureIds: string[];
  unlocked: boolean;
  explored: boolean;
  expeditionsCompleted: number;
  mineralsDiscovered: number;
  totalHeatGained: number;
  firstEnteredAt: number | null;
}

export interface MkToolDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: MkRarity;
  miningPower: number;
  heatReduction: number;
  maxDurability: number;
  cost: number;
  requiredZone: number;
}

export interface MkTool {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: MkRarity;
  miningPower: number;
  heatReduction: number;
  maxDurability: number;
  cost: number;
  requiredZone: number;
  owned: boolean;
  equipped: boolean;
  durability: number;
  level: number;
  totalMined: number;
}

export interface MkFacilityDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  buildCost: number;
  upgradeBaseCost: number;
  bonusType: string;
  bonusPerLevel: number;
  requiredZone: number;
}

export interface MkFacility {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  buildCost: number;
  upgradeBaseCost: number;
  bonusType: string;
  bonusPerLevel: number;
  requiredZone: number;
  built: boolean;
  level: number;
  active: boolean;
  totalUpgrades: number;
  builtAt: number | null;
}

export interface MkAbilityDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cooldownMs: number;
  energyCost: number;
  heatCost: number;
  unlockLevel: number;
  effectType: string;
  effectValue: number;
}

export interface MkAbility {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cooldownMs: number;
  energyCost: number;
  heatCost: number;
  unlockLevel: number;
  effectType: string;
  effectValue: number;
  unlocked: boolean;
  lastUsed: number;
  totalUses: number;
}

export interface MkAchievementDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  conditionKey: string;
  targetValue: number;
  rewardEnergy: number;
  rewardTitle: string | null;
}

export interface MkAchievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  conditionKey: string;
  targetValue: number;
  rewardEnergy: number;
  rewardTitle: string | null;
  unlocked: boolean;
  unlockedAt: number | null;
  progress: number;
}

export interface MkTitleDef {
  name: string;
  levelRequired: number;
  description: string;
}

export interface MkDailyExpedition {
  date: string;
  zoneIndex: number;
  objective: string;
  progress: number;
  target: number;
  rewardEnergy: number;
  rewardMinerals: number;
  completed: boolean;
  rewardClaimed: boolean;
}

export interface MkStats {
  totalMineralsMined: number;
  totalCreaturesTamed: number;
  totalFacilitiesUpgraded: number;
  totalAbilitiesUsed: number;
  totalZonesExplored: number;
  maxDepthReached: number;
  totalEruptionsTriggered: number;
  totalOreSmelted: number;
  totalShieldDeployments: number;
  totalTimePlayed: number;
  totalEnergyGained: number;
  totalEnergySpent: number;
  totalHeatReduced: number;
}

export interface MkExpeditionLog {
  id: string;
  timestamp: number;
  zoneIndex: number;
  action: string;
  result: 'success' | 'failure' | 'partial';
  mineralsGained: number;
  xpGained: number;
  energySpent: number;
  heatGained: number;
  creaturesEncountered: string[];
}

export interface MkMineralInventory {
  id: string;
  name: string;
  rarity: MkRarity;
  amount: number;
  refined: number;
}

export type MkAlertSeverity = 'info' | 'warning' | 'danger' | 'critical';

export interface MkCoreAlert {
  id: string;
  severity: MkAlertSeverity;
  message: string;
  timestamp: number;
  dismissed: boolean;
}

export interface MkZoneSummary {
  zoneIndex: number;
  name: string;
  unlocked: boolean;
  explored: boolean;
  dangerLevel: number;
  creaturesTotal: number;
  creaturesDiscovered: number;
  creaturesTamed: number;
  expeditionsCompleted: number;
  depthMax: number;
}

export interface MkRarityDistribution {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}

// ============================================================================
// Seeded PRNG (module-level, not exported)
// ============================================================================

function mkMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mkGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function mkRarityXpMultiplier(r: MkRarity): number {
  const map: Record<MkRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
  };
  return map[r] ?? 1;
}

function mkRarityColor(r: MkRarity): string {
  const map: Record<MkRarity, string> = {
    common: '#9CA3AF',
    uncommon: '#34D399',
    rare: '#60A5FA',
    epic: '#A78BFA',
    legendary: '#FFAB00',
  };
  return map[r] ?? '#9CA3AF';
}

// ============================================================================
// Main Hook — useMagmaCore
// ============================================================================

export default function useMagmaCore(initialSeed: number = 42) {
  // ---------------------------------------------------------------------------
  // Constants (MK_ prefix)
  // ---------------------------------------------------------------------------

  const MK_MAX_ENERGY = 200;
  const MK_CREATURE_COUNT = 35;
  const MK_ZONE_COUNT = 8;
  const MK_TOOL_COUNT = 30;
  const MK_FACILITY_COUNT = 25;
  const MK_ABILITY_COUNT = 22;
  const MK_ACHIEVEMENT_COUNT = 18;
  const MK_TITLE_COUNT = 8;
  const MK_MAX_SHIELD = 100;
  const MK_MAX_HEAT = 100;
  const MK_MIN_HEAT = 0;
  const MK_STARTING_ENERGY = 100;
  const MK_STARTING_HEAT = 50;
  const MK_MINE_BASE_COST = 10;
  const MK_TAME_BASE_COST = 15;
  const MK_SHIELD_COOLDOWN_MS = 30000;
  const MK_ERUPTION_COOLDOWN_MS = 60000;
  const MK_COOL_COST = 5;
  const MK_HEAT_PER_MINE = 3;
  const MK_HEAT_PER_TAME = 5;
  const MK_HEAT_PER_ZONE = 8;
  const MK_ENERGY_REGEN_RATE = 2;
  const MK_DEPTH_PER_ZONE = 5000;

  // Color theme
  const MK_COLORS = {
    crimson: '#B71C1C',
    black: '#1A0A00',
    lavaOrange: '#FF6D00',
    moltenGold: '#FFAB00',
    ashGray: '#424242',
    background: '#1A0A00',
    surface: '#2D1500',
    text: '#FFF3E0',
    textMuted: '#8D6E63',
    danger: '#FF1744',
    success: '#00E676',
    warning: '#FFD600',
    info: '#448AFF',
  };

  // ---------------------------------------------------------------------------
  // Static Data Definitions (memoized)
  // ---------------------------------------------------------------------------

  const creatureDefs = useMemo<MkCreatureDef[]>(() => [
    // ---- Common (7) ----
    { id: 'magma_slug', name: 'Magma Slug', rarity: 'common', zoneIndex: 0, description: 'A slow but resilient slug that leaves trails of cooled magma behind it', emoji: '🐛', xpReward: 10, tameChance: 0.55, heatResistance: 20, mineralDrop: 'iron_ore' },
    { id: 'ember_beetle', name: 'Ember Beetle', rarity: 'common', zoneIndex: 0, description: 'A beetle whose shell glows with a warm orange ember light', emoji: '🪲', xpReward: 8, tameChance: 0.60, heatResistance: 15, mineralDrop: 'coal_chunk' },
    { id: 'ash_crawler', name: 'Ash Crawler', rarity: 'common', zoneIndex: 0, description: 'A multi-legged arthropod that thrives in thick volcanic ash deposits', emoji: '🕷️', xpReward: 9, tameChance: 0.58, heatResistance: 18, mineralDrop: 'sulfur_deposit' },
    { id: 'coal_ant', name: 'Coal Ant', rarity: 'common', zoneIndex: 1, description: 'Industrious ants that build sprawling colonies from compressed coal', emoji: '🐜', xpReward: 7, tameChance: 0.62, heatResistance: 12, mineralDrop: 'coal_chunk' },
    { id: 'soot_moth', name: 'Soot Moth', rarity: 'common', zoneIndex: 1, description: 'Delicate moths with wings coated in fine carbon soot that absorbs heat', emoji: '🦋', xpReward: 8, tameChance: 0.56, heatResistance: 10, mineralDrop: 'copper_ore' },
    { id: 'spark_crab', name: 'Spark Crab', rarity: 'common', zoneIndex: 1, description: 'A crab that generates electric sparks when it snaps its obsidian claws', emoji: '🦀', xpReward: 11, tameChance: 0.52, heatResistance: 22, mineralDrop: 'iron_ore' },
    { id: 'cinder_worm', name: 'Cinder Worm', rarity: 'common', zoneIndex: 2, description: 'Segmented worms that burrow through cooling cinder beds seeking warmth', emoji: '🪱', xpReward: 9, tameChance: 0.54, heatResistance: 25, mineralDrop: 'tin_ore' },
    // ---- Uncommon (7) ----
    { id: 'flame_lizard', name: 'Flame Lizard', rarity: 'uncommon', zoneIndex: 1, description: 'A swift lizard that darts through lava streams, leaving a trail of blue flame', emoji: '🦎', xpReward: 25, tameChance: 0.35, heatResistance: 35, mineralDrop: 'copper_ore' },
    { id: 'obsidian_snail', name: 'Obsidian Snail', rarity: 'uncommon', zoneIndex: 2, description: 'A snail with a shell of polished obsidian that reflects magma light beautifully', emoji: '🐌', xpReward: 22, tameChance: 0.38, heatResistance: 40, mineralDrop: 'obsidian_shard' },
    { id: 'heat_viper', name: 'Heat Viper', rarity: 'uncommon', zoneIndex: 2, description: 'A venomous snake whose fangs inject superheated venom into prey', emoji: '🐍', xpReward: 28, tameChance: 0.30, heatResistance: 32, mineralDrop: 'sulfur_deposit' },
    { id: 'smoldering_bat', name: 'Smoldering Bat', rarity: 'uncommon', zoneIndex: 2, description: 'A bat with smoldering wing membranes that navigates by thermal sensing', emoji: '🦇', xpReward: 20, tameChance: 0.40, heatResistance: 28, mineralDrop: 'copper_ore' },
    { id: 'lava_fisher', name: 'Lava Fisher', rarity: 'uncommon', zoneIndex: 3, description: 'A bizarre creature that fishes for minerals in molten lava rivers', emoji: '🐟', xpReward: 26, tameChance: 0.33, heatResistance: 45, mineralDrop: 'silver_ore' },
    { id: 'basalt_beetle', name: 'Basalt Beetle', rarity: 'uncommon', zoneIndex: 3, description: 'A heavy beetle encased in basalt armor plating nearly impenetrable to tools', emoji: '🪲', xpReward: 24, tameChance: 0.36, heatResistance: 50, mineralDrop: 'iron_ore' },
    { id: 'thermal_toad', name: 'Thermal Toad', rarity: 'uncommon', zoneIndex: 3, description: 'A bloated toad that absorbs thermal energy and stores it in expanding glands', emoji: '🐸', xpReward: 23, tameChance: 0.37, heatResistance: 42, mineralDrop: 'gold_nugget' },
    // ---- Rare (7) ----
    { id: 'magma_serpent', name: 'Magma Serpent', rarity: 'rare', zoneIndex: 3, description: 'A massive serpent that swims through underground magma channels like water', emoji: '🐍', xpReward: 60, tameChance: 0.15, heatResistance: 65, mineralDrop: 'gold_nugget' },
    { id: 'ember_fox', name: 'Ember Fox', rarity: 'rare', zoneIndex: 4, description: 'A clever fox with nine tails of living flame that illuminate dark caverns', emoji: '🦊', xpReward: 55, tameChance: 0.18, heatResistance: 55, mineralDrop: 'ruby_gem' },
    { id: 'obsidian_golem', name: 'Obsidian Golem', rarity: 'rare', zoneIndex: 4, description: 'A lumbering construct of pure obsidian animated by geothermal energy', emoji: '🗿', xpReward: 70, tameChance: 0.10, heatResistance: 80, mineralDrop: 'obsidian_shard' },
    { id: 'lava_eel', name: 'Lava Eel', rarity: 'rare', zoneIndex: 4, description: 'A bioluminescent eel that generates electricity in molten rock environments', emoji: '🪱', xpReward: 50, tameChance: 0.20, heatResistance: 60, mineralDrop: 'silver_ore' },
    { id: 'fire_scorpion', name: 'Fire Scorpion', rarity: 'rare', zoneIndex: 5, description: 'A giant scorpion with a stinger that melts steel on contact', emoji: '🦂', xpReward: 65, tameChance: 0.12, heatResistance: 72, mineralDrop: 'ruby_gem' },
    { id: 'crystal_spider', name: 'Crystal Spider', rarity: 'rare', zoneIndex: 5, description: 'A spider that weaves webs of molten crystal in geode chambers', emoji: '🕷️', xpReward: 58, tameChance: 0.16, heatResistance: 58, mineralDrop: 'emerald_shard' },
    { id: 'molten_turtle', name: 'Molten Turtle', rarity: 'rare', zoneIndex: 5, description: 'An ancient turtle with a shell of flowing magma that never cools', emoji: '🐢', xpReward: 62, tameChance: 0.14, heatResistance: 78, mineralDrop: 'gold_nugget' },
    // ---- Epic (7) ----
    { id: 'lava_wyrm', name: 'Lava Wyrm', rarity: 'epic', zoneIndex: 5, description: 'A wingless dragon that tunnels through solid rock with superheated breath', emoji: '🐉', xpReward: 150, tameChance: 0.06, heatResistance: 90, mineralDrop: 'diamond_crystal' },
    { id: 'inferno_hawk', name: 'Inferno Hawk', rarity: 'epic', zoneIndex: 6, description: 'A raptor wreathed in supernatural flames that can see through solid stone', emoji: '🦅', xpReward: 140, tameChance: 0.07, heatResistance: 85, mineralDrop: 'emerald_shard' },
    { id: 'magma_basilisk', name: 'Magma Basilisk', rarity: 'epic', zoneIndex: 6, description: 'A serpentine beast whose gaze turns rock to molten slag', emoji: '🐉', xpReward: 160, tameChance: 0.05, heatResistance: 95, mineralDrop: 'diamond_crystal' },
    { id: 'obsidian_drake', name: 'Obsidian Drake', rarity: 'epic', zoneIndex: 6, description: 'A young dragon with scales of living obsidian that reflect inner firelight', emoji: '🐲', xpReward: 145, tameChance: 0.06, heatResistance: 88, mineralDrop: 'obsidian_shard' },
    { id: 'flame_wraith', name: 'Flame Wraith', rarity: 'epic', zoneIndex: 6, description: 'A spectral entity born from ancient volcanic eruptions, neither alive nor dead', emoji: '👻', xpReward: 135, tameChance: 0.08, heatResistance: 100, mineralDrop: 'ruby_gem' },
    { id: 'volcanic_hydra', name: 'Volcanic Hydra', rarity: 'epic', zoneIndex: 7, description: 'A multi-headed serpent that feeds on geothermal pressure and regrows heads', emoji: '🐲', xpReward: 155, tameChance: 0.05, heatResistance: 92, mineralDrop: 'diamond_crystal' },
    { id: 'cinder_phoenix', name: 'Cinder Phoenix', rarity: 'epic', zoneIndex: 7, description: 'A phoenix that rises from cooling volcanic ash, trailing sparks and embers', emoji: '🔥', xpReward: 165, tameChance: 0.04, heatResistance: 98, mineralDrop: 'emerald_shard' },
    // ---- Legendary (7) ----
    { id: 'molten_phoenix', name: 'Molten Phoenix', rarity: 'legendary', zoneIndex: 7, description: 'The immortal phoenix of magma — when it dies, its body fuels a new volcano', emoji: '🔥', xpReward: 500, tameChance: 0.02, heatResistance: 100, mineralDrop: 'primordial_core' },
    { id: 'core_dragon', name: 'Core Dragon', rarity: 'legendary', zoneIndex: 7, description: 'An ancient dragon that nests in the inner core, its heartbeat causes earthquakes', emoji: '🐉', xpReward: 550, tameChance: 0.015, heatResistance: 100, mineralDrop: 'primordial_core' },
    { id: 'plasma_wurm', name: 'Plasma Wurm', rarity: 'legendary', zoneIndex: 7, description: 'A being of pure plasma that exists between states of matter near the core', emoji: '⚡', xpReward: 520, tameChance: 0.018, heatResistance: 100, mineralDrop: 'starfall_crystal' },
    { id: 'diamond_tortoise', name: 'Diamond Tortoise', rarity: 'legendary', zoneIndex: 6, description: 'A tortoise with a shell of compressed diamond, aged since the planet formed', emoji: '🐢', xpReward: 480, tameChance: 0.022, heatResistance: 100, mineralDrop: 'diamond_crystal' },
    { id: 'primordial_titan', name: 'Primordial Titan', rarity: 'legendary', zoneIndex: 7, description: 'A colossus forged from the first magma that ever flowed on this world', emoji: '🗿', xpReward: 600, tameChance: 0.01, heatResistance: 100, mineralDrop: 'primordial_core' },
    { id: 'ember_colossus', name: 'Ember Colossus', rarity: 'legendary', zoneIndex: 7, description: 'A walking mountain of ember and obsidian, taller than the deepest caverns', emoji: '🏔️', xpReward: 580, tameChance: 0.012, heatResistance: 100, mineralDrop: 'primordial_core' },
    { id: 'magma_leviathan', name: 'Magma Leviathan', rarity: 'legendary', zoneIndex: 7, description: 'The supreme predator of the deep earth — a sea serpent of liquid fire', emoji: '🌊', xpReward: 650, tameChance: 0.008, heatResistance: 100, mineralDrop: 'primordial_core' },
  ], []);

  const zoneDefs = useMemo<MkZoneDef[]>(() => [
    { id: 0, name: 'Crust Entrance', description: 'The surface-level entry point where bedrock gives way to volcanic tunnels, warm but manageable', emoji: '⛏️', depthMin: 0, depthMax: 500, dangerLevel: 1, heatRate: 0.5, baseMineralChance: 0.85, creatureIds: ['magma_slug', 'ember_beetle', 'ash_crawler'] },
    { id: 1, name: 'Magma River', description: 'A vast underground river of flowing magma that illuminates the caverns in deep orange', emoji: '🌋', depthMin: 500, depthMax: 2000, dangerLevel: 2, heatRate: 1.2, baseMineralChance: 0.70, creatureIds: ['coal_ant', 'soot_moth', 'spark_crab', 'flame_lizard'] },
    { id: 2, name: 'Obsidian Cavern', description: 'Enormous caverns with walls of polished obsidian where rare crystals grow in the heat', emoji: '💎', depthMin: 2000, depthMax: 5000, dangerLevel: 3, heatRate: 1.8, baseMineralChance: 0.60, creatureIds: ['cinder_worm', 'flame_lizard', 'obsidian_snail', 'heat_viper', 'smoldering_bat'] },
    { id: 3, name: 'Lava Falls', description: 'Cascading waterfalls of molten rock that thunder into bottomless magma pools', emoji: '🏞️', depthMin: 5000, depthMax: 10000, dangerLevel: 5, heatRate: 2.5, baseMineralChance: 0.50, creatureIds: ['lava_fisher', 'basalt_beetle', 'thermal_toad', 'magma_serpent'] },
    { id: 4, name: 'Pressure Chamber', description: 'A hellish zone of immense tectonic pressure where rock itself begins to flow', emoji: '⚗️', depthMin: 10000, depthMax: 20000, dangerLevel: 7, heatRate: 3.5, baseMineralChance: 0.40, creatureIds: ['ember_fox', 'obsidian_golem', 'lava_eel'] },
    { id: 5, name: 'Crystal Vein', description: 'The richest mineral deposits on Earth, guarded by fearsome creatures in crystalline tunnels', emoji: '💠', depthMin: 20000, depthMax: 35000, dangerLevel: 8, heatRate: 4.0, baseMineralChance: 0.35, creatureIds: ['fire_scorpion', 'crystal_spider', 'molten_turtle', 'lava_wyrm'] },
    { id: 6, name: 'Outer Core', description: 'The boundary between solid mantle and liquid core — a realm of semi-molten wonder', emoji: '🔥', depthMin: 35000, depthMax: 50000, dangerLevel: 9, heatRate: 5.0, baseMineralChance: 0.25, creatureIds: ['inferno_hawk', 'magma_basilisk', 'obsidian_drake', 'flame_wraith', 'diamond_tortoise'] },
    { id: 7, name: 'Inner Core', description: 'The blazing heart of the planet itself — impossibly hot, impossibly rewarding', emoji: '☀️', depthMin: 50000, depthMax: 6371000, dangerLevel: 10, heatRate: 7.0, baseMineralChance: 0.15, creatureIds: ['volcanic_hydra', 'cinder_phoenix', 'molten_phoenix', 'core_dragon', 'plasma_wurm', 'primordial_titan', 'ember_colossus', 'magma_leviathan'] },
  ], []);

  const toolDefs = useMemo<MkToolDef[]>(() => [
    // Common (6)
    { id: 'iron_drill', name: 'Iron Drill', description: 'A basic hand-crank drill for breaking through surface rock', emoji: '🔩', rarity: 'common', miningPower: 5, heatReduction: 2, maxDurability: 50, cost: 0, requiredZone: 0 },
    { id: 'magma_bucket', name: 'Magma Bucket', description: 'A reinforced bucket for scooping and transporting liquid magma samples', emoji: '🪣', rarity: 'common', miningPower: 3, heatReduction: 5, maxDurability: 40, cost: 50, requiredZone: 0 },
    { id: 'coal_pick', name: 'Coal Pickaxe', description: 'A sturdy pickaxe designed for mining coal and basic ores', emoji: '⛏️', rarity: 'common', miningPower: 7, heatReduction: 1, maxDurability: 60, cost: 30, requiredZone: 0 },
    { id: 'cooling_pack', name: 'Cooling Pack', description: 'A portable ice pack that reduces heat buildup during expeditions', emoji: '🧊', rarity: 'common', miningPower: 2, heatReduction: 8, maxDurability: 30, cost: 40, requiredZone: 0 },
    { id: 'stone_hammer', name: 'Stone Hammer', description: 'A heavy volcanic stone hammer for breaking tough rock formations', emoji: '🔨', rarity: 'common', miningPower: 6, heatReduction: 0, maxDurability: 45, cost: 25, requiredZone: 0 },
    { id: 'basic_scanner', name: 'Basic Scanner', description: 'A simple sonar device that detects mineral deposits within 5 meters', emoji: '📡', rarity: 'common', miningPower: 1, heatReduction: 3, maxDurability: 35, cost: 60, requiredZone: 0 },
    // Uncommon (6)
    { id: 'steel_drill', name: 'Steel Drill', description: 'An industrial-grade steel drill with enhanced boring capability', emoji: '🔩', rarity: 'uncommon', miningPower: 12, heatReduction: 4, maxDurability: 80, cost: 200, requiredZone: 1 },
    { id: 'thermal_suit', name: 'Thermal Scanner', description: 'Advanced thermal imaging equipment that reveals hidden ore veins', emoji: '🌡️', rarity: 'uncommon', miningPower: 8, heatReduction: 10, maxDurability: 60, cost: 180, requiredZone: 1 },
    { id: 'diamond_chisel', name: 'Obsidian Chisel', description: 'A chisel tipped with obsidian shards for precision mineral extraction', emoji: '🔧', rarity: 'uncommon', miningPower: 10, heatReduction: 3, maxDurability: 70, cost: 150, requiredZone: 2 },
    { id: 'reinforced_shovel', name: 'Reinforced Shovel', description: 'A titanium-reinforced shovel for excavating large quantities of ore', emoji: '🪣', rarity: 'uncommon', miningPower: 14, heatReduction: 2, maxDurability: 75, cost: 220, requiredZone: 2 },
    { id: 'geo_hammer', name: 'Geologist Hammer', description: 'A specialized hammer for identifying and extracting rare mineral specimens', emoji: '🔨', rarity: 'uncommon', miningPower: 9, heatReduction: 5, maxDurability: 65, cost: 170, requiredZone: 1 },
    { id: 'lava_scoop', name: 'Lava Scoop', description: 'A ceramic-coated scoop for collecting magma samples safely', emoji: '🥄', rarity: 'uncommon', miningPower: 6, heatReduction: 12, maxDurability: 50, cost: 190, requiredZone: 2 },
    // Rare (6)
    { id: 'core_sampler', name: 'Core Sample Taker', description: 'Extracts cylindrical core samples from rock, revealing geological history', emoji: '🧪', rarity: 'rare', miningPower: 18, heatReduction: 6, maxDurability: 100, cost: 500, requiredZone: 3 },
    { id: 'mining_laser', name: 'Mining Laser', description: 'A cutting laser that slices through rock and ore with precision beams', emoji: '⚡', rarity: 'rare', miningPower: 22, heatReduction: 4, maxDurability: 80, cost: 600, requiredZone: 3 },
    { id: 'thermal_drill', name: 'Thermal Drill', description: 'Uses concentrated heat to bore through the toughest volcanic rock', emoji: '🔩', rarity: 'rare', miningPower: 20, heatReduction: 8, maxDurability: 90, cost: 550, requiredZone: 4 },
    { id: 'crystal_extractor', name: 'Crystal Extractor', description: 'Delicately removes intact crystal formations from geode chambers', emoji: '💎', rarity: 'rare', miningPower: 16, heatReduction: 10, maxDurability: 70, cost: 480, requiredZone: 4 },
    { id: 'heavy_excavator', name: 'Heavy Excavator', description: 'A powerful machine that clears massive amounts of rock in a single pass', emoji: '🚜', rarity: 'rare', miningPower: 25, heatReduction: 2, maxDurability: 110, cost: 650, requiredZone: 3 },
    { id: 'pressure_suit', name: 'Pressure Suit', description: 'An armored suit that protects against extreme pressure and heat', emoji: '🥼', rarity: 'rare', miningPower: 5, heatReduction: 20, maxDurability: 60, cost: 700, requiredZone: 4 },
    // Epic (6)
    { id: 'plasma_cutter', name: 'Plasma Cutter', description: 'Cuts through any material using superheated plasma arcs', emoji: '⚡', rarity: 'epic', miningPower: 32, heatReduction: 12, maxDurability: 120, cost: 1500, requiredZone: 5 },
    { id: 'diamond_pickaxe', name: 'Diamond Pickaxe', description: 'The ultimate mining tool — diamond tips that never dull', emoji: '⛏️', rarity: 'epic', miningPower: 28, heatReduction: 8, maxDurability: 200, cost: 1200, requiredZone: 5 },
    { id: 'deep_core_drill', name: 'Deep Core Extractor', description: 'Penetrates to the deepest layers to extract primordial materials', emoji: '🔩', rarity: 'epic', miningPower: 35, heatReduction: 15, maxDurability: 150, cost: 1800, requiredZone: 6 },
    { id: 'thermal_goggles', name: 'Thermal Imaging Goggles', description: 'See through rock and detect minerals, creatures, and dangers', emoji: '👓', rarity: 'epic', miningPower: 15, heatReduction: 18, maxDurability: 80, cost: 1400, requiredZone: 5 },
    { id: 'radiation_shield', name: 'Radiation Shield', description: 'Generates a protective field against core radiation and heat', emoji: '🛡️', rarity: 'epic', miningPower: 8, heatReduction: 30, maxDurability: 100, cost: 1600, requiredZone: 6 },
    { id: 'energy_harvester', name: 'Core Energy Harvester', description: 'Directly converts core heat into usable energy for the expedition', emoji: '🔋', rarity: 'epic', miningPower: 20, heatReduction: 25, maxDurability: 90, cost: 2000, requiredZone: 6 },
    // Legendary (6)
    { id: 'primordial_drill', name: 'Primordial Drill', description: 'A drill forged in the first volcanic eruption, capable of boring through anything', emoji: '🌋', rarity: 'legendary', miningPower: 50, heatReduction: 20, maxDurability: 300, cost: 5000, requiredZone: 7 },
    { id: 'titan_exosuit', name: 'Titan Exosuit', description: 'A full-body mechanical suit granting immense strength and near-total heat immunity', emoji: '🤖', rarity: 'legendary', miningPower: 40, heatReduction: 40, maxDurability: 250, cost: 6000, requiredZone: 7 },
    { id: 'starfall_saw', name: 'Starfall Diamond Saw', description: 'A circular saw with a blade of meteoric diamond, sharper than any earthly tool', emoji: '☄️', rarity: 'legendary', miningPower: 45, heatReduction: 15, maxDurability: 280, cost: 5500, requiredZone: 7 },
    { id: 'void_extractor', name: 'Void Matter Extractor', description: 'Extracts exotic materials from the boundary between matter and energy', emoji: '🕳️', rarity: 'legendary', miningPower: 55, heatReduction: 25, maxDurability: 200, cost: 7000, requiredZone: 7 },
    { id: 'core_tap', name: 'Core Tap Device', description: 'A mythical device that can directly tap into the planetary core energy', emoji: '🔧', rarity: 'legendary', miningPower: 60, heatReduction: 35, maxDurability: 350, cost: 8000, requiredZone: 7 },
    { id: 'world_forge_hammer', name: 'World Forge Hammer', description: 'The hammer said to have forged the planet itself, returned from deep time', emoji: '🔨', rarity: 'legendary', miningPower: 48, heatReduction: 30, maxDurability: 999, cost: 10000, requiredZone: 7 },
  ], []);

  const facilityDefs = useMemo<MkFacilityDef[]>(() => [
    { id: 'cooling_station', name: 'Cooling Station', description: 'A network of coolant pipes and fans that reduce ambient heat in the base', emoji: '❄️', maxLevel: 10, buildCost: 100, upgradeBaseCost: 80, bonusType: 'heat_reduction', bonusPerLevel: 3, requiredZone: 0 },
    { id: 'smelting_forge', name: 'Smelting Forge', description: 'A forge that processes raw ores into refined metals and alloys', emoji: '🔥', maxLevel: 10, buildCost: 150, upgradeBaseCost: 100, bonusType: 'smelt_bonus', bonusPerLevel: 5, requiredZone: 0 },
    { id: 'research_lab', name: 'Research Lab', description: 'A laboratory for analyzing minerals and developing new technologies', emoji: '🔬', maxLevel: 10, buildCost: 200, upgradeBaseCost: 120, bonusType: 'analysis_speed', bonusPerLevel: 4, requiredZone: 0 },
    { id: 'bunker', name: 'Underground Bunker', description: 'A fortified shelter that protects against eruptions and cave-ins', emoji: '🏚️', maxLevel: 10, buildCost: 120, upgradeBaseCost: 90, bonusType: 'eruption_resist', bonusPerLevel: 5, requiredZone: 0 },
    { id: 'energy_generator', name: 'Energy Generator', description: 'Converts geothermal heat into usable energy for all facilities', emoji: '⚡', maxLevel: 10, buildCost: 250, upgradeBaseCost: 130, bonusType: 'energy_regen', bonusPerLevel: 3, requiredZone: 1 },
    { id: 'mining_shaft', name: 'Deep Mining Shaft', description: 'An excavated vertical shaft for reaching deeper zones faster', emoji: '🕳️', maxLevel: 10, buildCost: 180, upgradeBaseCost: 110, bonusType: 'mining_speed', bonusPerLevel: 4, requiredZone: 1 },
    { id: 'storage_vault', name: 'Mineral Storage Vault', description: 'A reinforced vault for storing mined minerals safely', emoji: '🏦', maxLevel: 10, buildCost: 100, upgradeBaseCost: 70, bonusType: 'storage_capacity', bonusPerLevel: 10, requiredZone: 0 },
    { id: 'medical_bay', name: 'Medical Bay', description: 'Treats heat exhaustion, burns, and other expedition injuries', emoji: '🏥', maxLevel: 10, buildCost: 160, upgradeBaseCost: 100, bonusType: 'heal_rate', bonusPerLevel: 5, requiredZone: 0 },
    { id: 'comm_tower', name: 'Communication Tower', description: 'Maintains contact with the surface team for supply drops and evacuation', emoji: '📡', maxLevel: 10, buildCost: 200, upgradeBaseCost: 120, bonusType: 'supply_bonus', bonusPerLevel: 3, requiredZone: 0 },
    { id: 'refinery', name: 'Ore Refinery', description: 'Processes raw ore into high-purity refined materials', emoji: '⚙️', maxLevel: 10, buildCost: 220, upgradeBaseCost: 140, bonusType: 'refine_yield', bonusPerLevel: 5, requiredZone: 2 },
    { id: 'creature_pen', name: 'Creature Containment', description: 'A heat-proof enclosure for studying and housing tamed magma creatures', emoji: '🐾', maxLevel: 10, buildCost: 300, upgradeBaseCost: 150, bonusType: 'tame_bonus', bonusPerLevel: 3, requiredZone: 1 },
    { id: 'training_ground', name: 'Training Ground', description: 'An arena for training tamed creatures and improving their abilities', emoji: '🏟️', maxLevel: 10, buildCost: 280, upgradeBaseCost: 140, bonusType: 'creature_power', bonusPerLevel: 4, requiredZone: 2 },
    { id: 'shield_array', name: 'Thermal Shield Array', description: 'Generates a thermal barrier protecting nearby facilities from extreme heat', emoji: '🛡️', maxLevel: 10, buildCost: 350, upgradeBaseCost: 180, bonusType: 'shield_strength', bonusPerLevel: 4, requiredZone: 3 },
    { id: 'observatory', name: 'Seismic Observatory', description: 'Monitors seismic activity and predicts eruptions before they happen', emoji: '🔭', maxLevel: 10, buildCost: 250, upgradeBaseCost: 130, bonusType: 'eruption_warning', bonusPerLevel: 5, requiredZone: 1 },
    { id: 'assembly_line', name: 'Assembly Line', description: 'Automates the production of tools and equipment from refined materials', emoji: '🏭', maxLevel: 10, buildCost: 400, upgradeBaseCost: 200, bonusType: 'craft_speed', bonusPerLevel: 5, requiredZone: 3 },
    { id: 'hydroponics', name: 'Hydroponics Bay', description: 'Grows food and medicinal plants using geothermal energy and mineral water', emoji: '🌱', maxLevel: 10, buildCost: 180, upgradeBaseCost: 100, bonusType: 'food_production', bonusPerLevel: 4, requiredZone: 0 },
    { id: 'water_recycler', name: 'Water Recycler', description: 'Purifies and recycles water from geothermal sources for all operations', emoji: '💧', maxLevel: 10, buildCost: 150, upgradeBaseCost: 90, bonusType: 'water_supply', bonusPerLevel: 5, requiredZone: 0 },
    { id: 'armory', name: 'Equipment Armory', description: 'Stores, repairs, and upgrades all mining and exploration equipment', emoji: '⚔️', maxLevel: 10, buildCost: 300, upgradeBaseCost: 150, bonusType: 'repair_speed', bonusPerLevel: 4, requiredZone: 1 },
    { id: 'scanner_array', name: 'Deep Scanner Array', description: 'An array of sensors that maps mineral deposits across wide areas', emoji: '📡', maxLevel: 10, buildCost: 350, upgradeBaseCost: 170, bonusType: 'scan_range', bonusPerLevel: 5, requiredZone: 3 },
    { id: 'workshop', name: 'Engineering Workshop', description: 'A workshop for inventing new tools and upgrading existing equipment', emoji: '🔧', maxLevel: 10, buildCost: 280, upgradeBaseCost: 140, bonusType: 'upgrade_discount', bonusPerLevel: 3, requiredZone: 2 },
    { id: 'supply_depot', name: 'Supply Depot', description: 'Stores emergency supplies and manages incoming resource deliveries', emoji: '📦', maxLevel: 10, buildCost: 120, upgradeBaseCost: 80, bonusType: 'supply_efficiency', bonusPerLevel: 4, requiredZone: 0 },
    { id: 'decon_chamber', name: 'Decontamination Chamber', description: 'Removes hazardous substances from equipment and specimens', emoji: '🧹', maxLevel: 10, buildCost: 200, upgradeBaseCost: 100, bonusType: 'decontam_speed', bonusPerLevel: 5, requiredZone: 2 },
    { id: 'thermal_regulator', name: 'Thermal Regulator', description: 'Fine-tunes the temperature balance across all underground facilities', emoji: '🌡️', maxLevel: 10, buildCost: 320, upgradeBaseCost: 160, bonusType: 'thermal_balance', bonusPerLevel: 6, requiredZone: 4 },
    { id: 'core_tap_station', name: 'Core Tap Station', description: 'The ultimate facility — directly channels energy from the planetary core', emoji: '☀️', maxLevel: 10, buildCost: 1000, upgradeBaseCost: 500, bonusType: 'core_power', bonusPerLevel: 10, requiredZone: 7 },
    { id: 'command_center', name: 'Command Center', description: 'The nerve center coordinating all expedition operations and research', emoji: '🏛️', maxLevel: 10, buildCost: 500, upgradeBaseCost: 250, bonusType: 'all_bonus', bonusPerLevel: 2, requiredZone: 0 },
  ], []);

  const abilityDefs = useMemo<MkAbilityDef[]>(() => [
    // Defensive (6)
    { id: 'magma_shield', name: 'Magma Shield', description: 'Encases you in a protective shell of cooled magma for 10 seconds', emoji: '🛡️', cooldownMs: 30000, energyCost: 20, heatCost: 5, unlockLevel: 1, effectType: 'shield', effectValue: 30 },
    { id: 'crystal_barrier', name: 'Crystal Barrier', description: 'Summons a wall of volcanic crystals that blocks incoming damage', emoji: '💎', cooldownMs: 45000, energyCost: 25, heatCost: 8, unlockLevel: 8, effectType: 'barrier', effectValue: 50 },
    { id: 'molten_armor', name: 'Molten Armor', description: 'Coats your body in liquid magma that hardens on impact', emoji: '🛡️', cooldownMs: 60000, energyCost: 30, heatCost: 10, unlockLevel: 15, effectType: 'armor', effectValue: 40 },
    { id: 'obsidian_wall', name: 'Obsidian Wall', description: 'Raises a wall of volcanic glass between you and danger', emoji: '🧱', cooldownMs: 40000, energyCost: 22, heatCost: 7, unlockLevel: 5, effectType: 'wall', effectValue: 35 },
    { id: 'heat_mirage', name: 'Heat Mirage', description: 'Creates illusions from heat shimmer to confuse enemies', emoji: '🌀', cooldownMs: 25000, energyCost: 15, heatCost: 3, unlockLevel: 3, effectType: 'evasion', effectValue: 25 },
    { id: 'thermal_absorb', name: 'Magma Absorb', description: 'Absorbs ambient heat to restore energy and reduce temperature', emoji: '🔋', cooldownMs: 20000, energyCost: 5, heatCost: -15, unlockLevel: 2, effectType: 'absorb', effectValue: 20 },
    // Offensive (8)
    { id: 'heat_wave', name: 'Heat Wave', description: 'Releases a devastating wave of superheated air in all directions', emoji: '🌡️', cooldownMs: 15000, energyCost: 15, heatCost: 8, unlockLevel: 2, effectType: 'aoe_damage', effectValue: 20 },
    { id: 'eruption_blast', name: 'Eruption Blast', description: 'Channels volcanic pressure into a focused explosive blast', emoji: '💥', cooldownMs: 30000, energyCost: 25, heatCost: 12, unlockLevel: 10, effectType: 'blast', effectValue: 45 },
    { id: 'flame_burst', name: 'Flame Burst', description: 'Ignites the air around you in a sudden sphere of fire', emoji: '🔥', cooldownMs: 12000, energyCost: 12, heatCost: 6, unlockLevel: 1, effectType: 'burst', effectValue: 15 },
    { id: 'lava_flow', name: 'Lava Flow', description: 'Summons a river of lava that sweeps enemies away', emoji: '🌊', cooldownMs: 35000, energyCost: 28, heatCost: 15, unlockLevel: 12, effectType: 'flow', effectValue: 40 },
    { id: 'inferno_beam', name: 'Inferno Beam', description: 'Fires a concentrated beam of white-hot infernal energy', emoji: '⚡', cooldownMs: 50000, energyCost: 35, heatCost: 18, unlockLevel: 20, effectType: 'beam', effectValue: 60 },
    { id: 'flame_whip', name: 'Flame Whip', description: 'Cracks a whip of living fire that lashes at extreme range', emoji: '🔥', cooldownMs: 18000, energyCost: 18, heatCost: 9, unlockLevel: 7, effectType: 'whip', effectValue: 25 },
    { id: 'seismic_slam', name: 'Seismic Slam', description: 'Strikes the ground with tremendous force, causing localized tremors', emoji: '💥', cooldownMs: 40000, energyCost: 30, heatCost: 14, unlockLevel: 14, effectType: 'slam', effectValue: 50 },
    { id: 'heat_nova', name: 'Heat Nova', description: 'Detonates all stored thermal energy in a catastrophic explosion', emoji: '☄️', cooldownMs: 90000, energyCost: 50, heatCost: 25, unlockLevel: 30, effectType: 'nova', effectValue: 80 },
    // Utility (8)
    { id: 'thermal_vision', name: 'Thermal Vision', description: 'See through rock and detect creatures, minerals, and heat sources', emoji: '👁️', cooldownMs: 20000, energyCost: 10, heatCost: 2, unlockLevel: 1, effectType: 'vision', effectValue: 30 },
    { id: 'core_resonance', name: 'Core Resonance', description: 'Taps into the planet core frequency to reveal hidden deposits', emoji: '📡', cooldownMs: 60000, energyCost: 20, heatCost: 5, unlockLevel: 18, effectType: 'detect', effectValue: 50 },
    { id: 'thermal_dash', name: 'Thermal Dash', description: 'Propels yourself forward on a jet of superheated steam', emoji: '💨', cooldownMs: 10000, energyCost: 8, heatCost: 4, unlockLevel: 4, effectType: 'dash', effectValue: 20 },
    { id: 'eruption_sense', name: 'Eruption Sense', description: 'Sense approaching eruptions and cave-ins before they occur', emoji: '👻', cooldownMs: 30000, energyCost: 5, heatCost: 0, unlockLevel: 6, effectType: 'warning', effectValue: 40 },
    { id: 'core_pulse', name: 'Core Pulse', description: 'Sends a pulse of energy into the ground to map the surrounding area', emoji: '📡', cooldownMs: 45000, energyCost: 18, heatCost: 3, unlockLevel: 16, effectType: 'pulse', effectValue: 35 },
    { id: 'thermal_overload', name: 'Thermal Overload', description: 'Temporarily boosts all abilities at the cost of extreme heat buildup', emoji: '⚡', cooldownMs: 120000, energyCost: 10, heatCost: 30, unlockLevel: 25, effectType: 'boost', effectValue: 50 },
    { id: 'core_drain', name: 'Core Drain', description: 'Drains energy directly from the planetary core to restore reserves', emoji: '🔋', cooldownMs: 90000, energyCost: 0, heatCost: -20, unlockLevel: 22, effectType: 'energy_drain', effectValue: 60 },
    { id: 'magma_eruption', name: 'Magma Eruption', description: 'Trigger a controlled magma eruption to clear obstacles and reveal veins', emoji: '🌋', cooldownMs: 120000, energyCost: 40, heatCost: 20, unlockLevel: 28, effectType: 'eruption', effectValue: 70 },
  ], []);

  const achievementDefs = useMemo<MkAchievementDef[]>(() => [
    { id: 'first_descent', name: 'First Descent', description: 'Enter the Crust Entrance for the first time', emoji: '⛏️', conditionKey: 'zones_explored', targetValue: 1, rewardEnergy: 10, rewardTitle: null },
    { id: 'mineral_hunter', name: 'Mineral Hunter', description: 'Mine 50 minerals in total', emoji: '💎', conditionKey: 'minerals_mined', targetValue: 50, rewardEnergy: 25, rewardTitle: null },
    { id: 'creature_tamer', name: 'Creature Tamer', description: 'Successfully tame 5 magma creatures', emoji: '🐾', conditionKey: 'creatures_tamed', targetValue: 5, rewardEnergy: 30, rewardTitle: null },
    { id: 'deep_explorer', name: 'Deep Explorer', description: 'Reach the Lava Falls zone', emoji: '🏞️', conditionKey: 'depth_reached', targetValue: 5000, rewardEnergy: 40, rewardTitle: null },
    { id: 'heat_master', name: 'Heat Master', description: 'Survive with heat level above 90 for 10 actions', emoji: '🌡️', conditionKey: 'heat_survived', targetValue: 10, rewardEnergy: 35, rewardTitle: null },
    { id: 'facility_architect', name: 'Facility Architect', description: 'Build 5 different facilities', emoji: '🏗️', conditionKey: 'facilities_built', targetValue: 5, rewardEnergy: 30, rewardTitle: null },
    { id: 'shield_guardian', name: 'Shield Guardian', description: 'Deploy the thermal shield 20 times', emoji: '🛡️', conditionKey: 'shields_deployed', targetValue: 20, rewardEnergy: 25, rewardTitle: null },
    { id: 'core_pioneer', name: 'Core Pioneer', description: 'Reach the Outer Core zone', emoji: '🔥', conditionKey: 'depth_reached', targetValue: 35000, rewardEnergy: 80, rewardTitle: null },
    { id: 'legendary_finder', name: 'Legendary Finder', description: 'Discover and tame a legendary creature', emoji: '🌟', conditionKey: 'legendary_tamed', targetValue: 1, rewardEnergy: 100, rewardTitle: null },
    { id: 'master_miner', name: 'Master Miner', description: 'Mine 500 minerals in total', emoji: '⛏️', conditionKey: 'minerals_mined', targetValue: 500, rewardEnergy: 60, rewardTitle: null },
    { id: 'eruption_survivor', name: 'Eruption Survivor', description: 'Survive 5 triggered eruptions', emoji: '🌋', conditionKey: 'eruptions_survived', targetValue: 5, rewardEnergy: 50, rewardTitle: null },
    { id: 'bunker_builder', name: 'Bunker Builder', description: 'Upgrade the bunker facility to level 10', emoji: '🏚️', conditionKey: 'bunker_maxed', targetValue: 1, rewardEnergy: 45, rewardTitle: null },
    { id: 'energy_harvest', name: 'Energy Harvest', description: 'Accumulate 10,000 total core energy gained', emoji: '⚡', conditionKey: 'total_energy_gained', targetValue: 10000, rewardEnergy: 75, rewardTitle: null },
    { id: 'creature_collection', name: 'Creature Collection', description: 'Tame 15 different magma creatures', emoji: '📚', conditionKey: 'creatures_tamed', targetValue: 15, rewardEnergy: 55, rewardTitle: null },
    { id: 'smelting_expert', name: 'Smelting Expert', description: 'Smelt 200 ore batches in total', emoji: '🔥', conditionKey: 'ore_smelted', targetValue: 200, rewardEnergy: 50, rewardTitle: null },
    { id: 'zone_conqueror', name: 'Zone Conqueror', description: 'Explore and complete expeditions in all 8 zones', emoji: '🗺️', conditionKey: 'zones_explored', targetValue: 8, rewardEnergy: 90, rewardTitle: null },
    { id: 'core_sovereign', name: 'Core Sovereign', description: 'Reach the Inner Core — the heart of the planet', emoji: '☀️', conditionKey: 'depth_reached', targetValue: 50000, rewardEnergy: 200, rewardTitle: 'Core Sovereign' },
    { id: 'magma_legend', name: 'Magma Legend', description: 'Upgrade all 25 facilities to at least level 5', emoji: '🏆', conditionKey: 'facilities_level5', targetValue: 25, rewardEnergy: 150, rewardTitle: null },
  ], []);

  const titleDefs = useMemo<MkTitleDef[]>(() => [
    { name: 'Surface Driller', levelRequired: 1, description: 'A newcomer to the depths, learning to handle basic drills and tools' },
    { name: 'Tunnel Digger', levelRequired: 5, description: 'Experienced enough to excavate tunnels through solid volcanic rock' },
    { name: 'Deep Diver', levelRequired: 10, description: 'Ventures confidently into magma rivers and obsidian caverns' },
    { name: 'Magma Walker', levelRequired: 18, description: 'Walks through lava falls and pressure chambers without flinching' },
    { name: 'Core Seeker', levelRequired: 25, description: 'Dedicated to reaching the planetary core, no matter the cost' },
    { name: 'Heat Master', levelRequired: 33, description: 'Has mastered the art of thermal management in extreme conditions' },
    { name: 'Inferno Commander', levelRequired: 42, description: 'Commands respect from all magma creatures and core entities' },
    { name: 'Core Sovereign', levelRequired: 50, description: 'The supreme ruler of the deep earth — master of all magma and fire' },
  ], []);

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [creatures, setCreatures] = useState<MkCreature[]>([]);
  const [zones, setZones] = useState<MkZone[]>([]);
  const [tools, setTools] = useState<MkTool[]>([]);
  const [facilities, setFacilities] = useState<MkFacility[]>([]);
  const [abilities, setAbilities] = useState<MkAbility[]>([]);
  const [achievements, setAchievements] = useState<MkAchievement[]>([]);
  const [currentZone, setCurrentZone] = useState<number>(0);
  const [heatLevel, setHeatLevel] = useState<number>(MK_STARTING_HEAT);
  const [coreEnergy, setCoreEnergy] = useState<number>(MK_STARTING_ENERGY);
  const [mineralsMined, setMineralsMined] = useState<number>(0);
  const [creaturesTamed, setCreaturesTamed] = useState<number>(0);
  const [depthReached, setDepthReached] = useState<number>(0);
  const [titleIndex, setTitleIndex] = useState<number>(0);
  const [shieldIntegrity, setShieldIntegrity] = useState<number>(MK_MAX_SHIELD);
  const [dailyExpedition, setDailyExpedition] = useState<MkDailyExpedition | null>(null);

  // Additional tracking state
  const [totalOreSmelted, setTotalOreSmelted] = useState<number>(0);
  const [totalShieldsDeployed, setTotalShieldsDeployed] = useState<number>(0);
  const [totalEruptionsTriggered, setTotalEruptionsTriggered] = useState<number>(0);
  const [totalEruptionsSurvived, setTotalEruptionsSurvived] = useState<number>(0);
  const [totalFacilitiesUpgraded, setTotalFacilitiesUpgraded] = useState<number>(0);
  const [totalAbilitiesUsed, setTotalAbilitiesUsed] = useState<number>(0);
  const [totalEnergyGained, setTotalEnergyGained] = useState<number>(0);
  const [totalEnergySpent, setTotalEnergySpent] = useState<number>(0);
  const [totalHeatReduced, setTotalHeatReduced] = useState<number>(0);
  const [heatSurvivedHigh, setHeatSurvivedHigh] = useState<number>(0);
  const [legendaryTamed, setLegendaryTamed] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [xp, setXp] = useState<number>(0);
  const [coins, setCoins] = useState<number>(200);
  const [shieldLastDeployed, setShieldLastDeployed] = useState<number>(0);
  const [lastEruptionTime, setLastEruptionTime] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------

  const stateRef = useRef({ creatures, zones, tools, facilities, abilities, achievements, currentZone, heatLevel, coreEnergy, mineralsMined, creaturesTamed, depthReached, titleIndex, shieldIntegrity, dailyExpedition, totalOreSmelted, totalShieldsDeployed, totalEruptionsTriggered, totalEruptionsSurvived, totalFacilitiesUpgraded, totalAbilitiesUsed, totalEnergyGained, totalEnergySpent, totalHeatReduced, heatSurvivedHigh, legendaryTamed, level, xp, coins, shieldLastDeployed, lastEruptionTime });
  const prngRef = useRef<() => number>(mkMulberry32(initialSeed));

  useEffect(() => {
    stateRef.current = { creatures, zones, tools, facilities, abilities, achievements, currentZone, heatLevel, coreEnergy, mineralsMined, creaturesTamed, depthReached, titleIndex, shieldIntegrity, dailyExpedition, totalOreSmelted, totalShieldsDeployed, totalEruptionsTriggered, totalEruptionsSurvived, totalFacilitiesUpgraded, totalAbilitiesUsed, totalEnergyGained, totalEnergySpent, totalHeatReduced, heatSurvivedHigh, legendaryTamed, level, xp, coins, shieldLastDeployed, lastEruptionTime };
  }, [creatures, zones, tools, facilities, abilities, achievements, currentZone, heatLevel, coreEnergy, mineralsMined, creaturesTamed, depthReached, titleIndex, shieldIntegrity, dailyExpedition, totalOreSmelted, totalShieldsDeployed, totalEruptionsTriggered, totalEruptionsSurvived, totalFacilitiesUpgraded, totalAbilitiesUsed, totalEnergyGained, totalEnergySpent, totalHeatReduced, heatSurvivedHigh, legendaryTamed, level, xp, coins, shieldLastDeployed, lastEruptionTime]);

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const now = Date.now();

    const initCreatures: MkCreature[] = creatureDefs.map((d) => ({
      ...d,
      discovered: false,
      tamed: false,
      encounterCount: 0,
      lastSeen: null,
    }));

    const initZones: MkZone[] = zoneDefs.map((d, i) => ({
      ...d,
      unlocked: i === 0,
      explored: false,
      expeditionsCompleted: 0,
      mineralsDiscovered: 0,
      totalHeatGained: 0,
      firstEnteredAt: i === 0 ? now : null,
    }));

    const initTools: MkTool[] = toolDefs.map((d) => ({
      ...d,
      owned: d.cost === 0,
      equipped: d.cost === 0,
      durability: d.maxDurability,
      level: 1,
      totalMined: 0,
    }));

    const initFacilities: MkFacility[] = facilityDefs.map((d) => ({
      ...d,
      built: false,
      level: 0,
      active: false,
      totalUpgrades: 0,
      builtAt: null,
    }));

    const initAbilities: MkAbility[] = abilityDefs.map((d) => ({
      ...d,
      unlocked: d.unlockLevel <= 1,
      lastUsed: 0,
      totalUses: 0,
    }));

    const initAchievements: MkAchievement[] = achievementDefs.map((d) => ({
      ...d,
      unlocked: false,
      unlockedAt: null,
      progress: 0,
    }));

    const dayKey = mkGenerateDayKey(now);
    const rng = mkMulberry32(now);
    const dailyZone = Math.floor(rng() * MK_ZONE_COUNT);
    const objectives = ['mine_minerals', 'tame_creatures', 'scan_zone', 'smelt_ore', 'explore_depth'];
    const obj = objectives[Math.floor(rng() * objectives.length)];
    const initDaily: MkDailyExpedition = {
      date: dayKey,
      zoneIndex: dailyZone,
      objective: obj,
      progress: 0,
      target: Math.floor(rng() * 10) + 5,
      rewardEnergy: Math.floor(rng() * 30) + 20,
      rewardMinerals: Math.floor(rng() * 20) + 10,
      completed: false,
      rewardClaimed: false,
    };

    setCreatures(initCreatures);
    setZones(initZones);
    setTools(initTools);
    setFacilities(initFacilities);
    setAbilities(initAbilities);
    setAchievements(initAchievements);
    setDailyExpedition(initDaily);
    prngRef.current = mkMulberry32(initialSeed);
  }, [creatureDefs, zoneDefs, toolDefs, facilityDefs, abilityDefs, achievementDefs]);

  // ---------------------------------------------------------------------------
  // XP Helper
  // ---------------------------------------------------------------------------

  const xpForLevel = useCallback((lvl: number): number => {
    if (lvl <= 0) return 0;
    if (lvl >= 50) return Infinity;
    return Math.floor(100 * lvl * (1 + lvl * 0.12));
  }, []);

  const addXp = useCallback((amount: number) => {
    setXp((prevXp) => {
      setLevel((prevLvl) => {
        let lvl = prevLvl;
        let currentXp = prevXp + Math.floor(amount);
        while (lvl < 50 && currentXp >= xpForLevel(lvl)) {
          currentXp -= xpForLevel(lvl);
          lvl += 1;
        }
        if (lvl >= 50) currentXp = 0;
        // Update title based on new level
        setTitleIndex((prev) => {
          let idx = prev;
          for (let i = titleDefs.length - 1; i >= 0; i--) {
            if (lvl >= titleDefs[i].levelRequired) {
              idx = i;
              break;
            }
          }
          return idx;
        });
        // Unlock abilities at new level
        setAbilities((prevAbilities) =>
          prevAbilities.map((a) => ({
            ...a,
            unlocked: a.unlockLevel <= lvl,
          }))
        );
        return lvl;
      });
      return prevXp + Math.floor(amount);
    });
  }, [xpForLevel, titleDefs]);

  // ---------------------------------------------------------------------------
  // Computed Values (useMemo)
  // ---------------------------------------------------------------------------

  const discoveredCreatures = useMemo(() => creatures.filter((c) => c.discovered), [creatures]);
  const tamedCreatures = useMemo(() => creatures.filter((c) => c.tamed), [creatures]);
  const unlockedZones = useMemo(() => zones.filter((z) => z.unlocked), [zones]);
  const exploredZones = useMemo(() => zones.filter((z) => z.explored), [zones]);
  const ownedTools = useMemo(() => tools.filter((t) => t.owned), [tools]);
  const equippedTool = useMemo(() => tools.find((t) => t.equipped) ?? null, [tools]);
  const builtFacilities = useMemo(() => facilities.filter((f) => f.built), [facilities]);
  const activeFacilities = useMemo(() => facilities.filter((f) => f.built && f.active), [facilities]);
  const unlockedAbilities = useMemo(() => abilities.filter((a) => a.unlocked), [abilities]);
  const unlockedAchievements = useMemo(() => achievements.filter((a) => a.unlocked), [achievements]);
  const lockedAchievements = useMemo(() => achievements.filter((a) => !a.unlocked), [achievements]);

  const currentZoneData = useMemo(() => zones[currentZone] ?? null, [zones, currentZone]);
  const currentZoneCreatures = useMemo(() => {
    if (!currentZoneData) return [];
    return creatures.filter((c) => currentZoneData.creatureIds.includes(c.id));
  }, [creatures, currentZoneData]);

  const heatStatus = useMemo(() => {
    if (heatLevel >= 90) return 'critical';
    if (heatLevel >= 70) return 'high';
    if (heatLevel >= 40) return 'moderate';
    if (heatLevel >= 20) return 'low';
    return 'safe';
  }, [heatLevel]);

  const energyStatus = useMemo(() => {
    if (coreEnergy <= 10) return 'depleted';
    if (coreEnergy <= 30) return 'low';
    if (coreEnergy <= 60) return 'moderate';
    return 'healthy';
  }, [coreEnergy]);

  const facilityBonusTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const f of builtFacilities) {
      const key = f.bonusType;
      totals[key] = (totals[key] ?? 0) + f.bonusPerLevel * f.level;
    }
    return totals;
  }, [builtFacilities]);

  const effectiveMiningPower = useMemo(() => {
    let base = equippedTool?.miningPower ?? 5;
    const miningSpeedBonus = facilityBonusTotals['mining_speed'] ?? 0;
    return base + miningSpeedBonus;
  }, [equippedTool, facilityBonusTotals]);

  const effectiveHeatReduction = useMemo(() => {
    let base = equippedTool?.heatReduction ?? 0;
    const heatReductionBonus = facilityBonusTotals['heat_reduction'] ?? 0;
    const shieldBonus = shieldIntegrity > 0 ? shieldIntegrity * 0.1 : 0;
    return base + heatReductionBonus + shieldBonus;
  }, [equippedTool, facilityBonusTotals, shieldIntegrity]);

  const xpProgress = useMemo(() => {
    const needed = xpForLevel(level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, xp / needed);
  }, [xp, level, xpForLevel]);

  const overallProgress = useMemo(() => {
    const zoneProg = exploredZones.length / MK_ZONE_COUNT;
    const creatureProg = tamedCreatures.length / MK_CREATURE_COUNT;
    const facilityProg = builtFacilities.length / MK_FACILITY_COUNT;
    const achievementProg = unlockedAchievements.length / MK_ACHIEVEMENT_COUNT;
    return (zoneProg + creatureProg + facilityProg + achievementProg) / 4;
  }, [exploredZones, tamedCreatures, builtFacilities, unlockedAchievements]);

  const creaturesByRarity = useMemo(() => {
    const map: Record<MkRarity, MkCreature[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    };
    for (const c of creatures) {
      map[c.rarity].push(c);
    }
    return map;
  }, [creatures]);

  // ---------------------------------------------------------------------------
  // Action Functions (useCallback)
  // ---------------------------------------------------------------------------

  const enterZone = useCallback((zoneIndex: number): { success: boolean; message: string } => {
    if (zoneIndex < 0 || zoneIndex >= MK_ZONE_COUNT) {
      return { success: false, message: 'Invalid zone index' };
    }
    const z = stateRef.current.zones[zoneIndex];
    if (!z || !z.unlocked) {
      return { success: false, message: 'Zone is locked' };
    }
    setCurrentZone(zoneIndex);
    setHeatLevel((prev) => {
      const heatGain = Math.max(0, z.heatRate * MK_HEAT_PER_ZONE - effectiveHeatReduction);
      return Math.min(MK_MAX_HEAT, prev + heatGain);
    });
    if (!z.explored) {
      setZones((prev) =>
        prev.map((zone) =>
          zone.id === zoneIndex
            ? { ...zone, explored: true, firstEnteredAt: zone.firstEnteredAt ?? Date.now() }
            : zone
        )
      );
    }
    const newDepth = zoneDefs[zoneIndex]?.depthMax ?? 0;
    setDepthReached((prev) => Math.max(prev, newDepth));
    return { success: true, message: `Entered ${zoneDefs[zoneIndex]?.name ?? 'Unknown Zone'}` };
  }, [zoneDefs]);

  const unlockZone = useCallback((zoneIndex: number): { success: boolean; message: string } => {
    if (zoneIndex <= 0 || zoneIndex >= MK_ZONE_COUNT) {
      return { success: false, message: 'Cannot unlock this zone' };
    }
    const prevZone = stateRef.current.zones[zoneIndex - 1];
    if (!prevZone || !prevZone.explored) {
      return { success: false, message: 'Previous zone must be explored first' };
    }
    if (stateRef.current.coreEnergy < 20) {
      return { success: false, message: 'Not enough core energy to unlock zone' };
    }
    setCoreEnergy((prev) => Math.max(0, prev - 20));
    setTotalEnergySpent((prev) => prev + 20);
    setZones((prev) =>
      prev.map((z) => (z.id === zoneIndex ? { ...z, unlocked: true } : z))
    );
    return { success: true, message: `${zoneDefs[zoneIndex]?.name ?? 'Zone'} unlocked!` };
  }, [zoneDefs]);

  const mineMineral = useCallback((toolId?: string): { success: boolean; mineralsGained: number; xpGained: number; message: string } => {
    const s = stateRef.current;
    if (s.heatLevel >= MK_MAX_HEAT) {
      return { success: false, mineralsGained: 0, xpGained: 0, message: 'Heat too high! Cool down first.' };
    }
    if (s.coreEnergy < MK_MINE_BASE_COST) {
      return { success: false, mineralsGained: 0, xpGained: 0, message: 'Not enough core energy.' };
    }

    const tool = toolId ? s.tools.find((t) => t.id === toolId && t.owned) : s.tools.find((t) => t.equipped);
    if (!tool || tool.durability <= 0) {
      return { success: false, mineralsGained: 0, xpGained: 0, message: 'No usable tool available.' };
    }

    const rng = prngRef.current();
    const zone = s.zones[s.currentZone];
    const mineChance = (zone?.baseMineralChance ?? 0.5) + (tool.miningPower / 100);
    if (rng > mineChance) {
      setCoreEnergy((prev) => Math.max(0, prev - MK_MINE_BASE_COST));
      setTotalEnergySpent((prev) => prev + MK_MINE_BASE_COST);
      const heatGain = Math.max(1, MK_HEAT_PER_MINE - effectiveHeatReduction);
      setHeatLevel((prev) => Math.min(MK_MAX_HEAT, prev + heatGain));
      return { success: false, mineralsGained: 0, xpGained: 0, message: 'Mining attempt failed — no mineral vein found.' };
    }

    const mineralCount = Math.floor(rng * 3) + 1 + Math.floor(tool.miningPower / 10);
    const rarityRoll = rng;
    let minedRarity: MkRarity = 'common';
    if (rarityRoll > 0.95) minedRarity = 'legendary';
    else if (rarityRoll > 0.85) minedRarity = 'epic';
    else if (rarityRoll > 0.65) minedRarity = 'rare';
    else if (rarityRoll > 0.40) minedRarity = 'uncommon';

    const xpGained = Math.floor(mineralCount * 5 * mkRarityXpMultiplier(minedRarity) * (1 + (zone?.dangerLevel ?? 1) * 0.1));
    const energyCost = MK_MINE_BASE_COST + Math.floor(zone?.dangerLevel ?? 1);
    const heatGain = Math.max(1, MK_HEAT_PER_MINE - effectiveHeatReduction);

    setMineralsMined((prev) => prev + mineralCount);
    setCoreEnergy((prev) => Math.max(0, prev - energyCost));
    setTotalEnergySpent((prev) => prev + energyCost);
    setHeatLevel((prev) => Math.min(MK_MAX_HEAT, prev + heatGain));
    setCoins((prev) => prev + mineralCount * Math.floor(2 * mkRarityXpMultiplier(minedRarity)));
    setTools((prev) =>
      prev.map((t) => (t.id === tool.id ? { ...t, durability: Math.max(0, t.durability - 1), totalMined: t.totalMined + mineralCount } : t))
    );

    if (heatLevel >= 90) {
      setHeatSurvivedHigh((prev) => prev + 1);
    }

    return {
      success: true,
      mineralsGained: mineralCount,
      xpGained,
      message: `Mined ${mineralCount} ${minedRarity} minerals! (+${xpGained} XP)`,
    };
  }, [effectiveHeatReduction, heatLevel]);

  const tameCreature = useCallback((creatureId: string): { success: boolean; tamed: boolean; xpGained: number; message: string } => {
    const s = stateRef.current;
    const creature = s.creatures.find((c) => c.id === creatureId);
    if (!creature || !creature.discovered) {
      return { success: false, tamed: false, xpGained: 0, message: 'Creature not found or not yet discovered.' };
    }
    if (creature.tamed) {
      return { success: false, tamed: false, xpGained: 0, message: 'Creature is already tamed.' };
    }
    if (s.coreEnergy < MK_TAME_BASE_COST) {
      return { success: false, tamed: false, xpGained: 0, message: 'Not enough core energy to tame.' };
    }

    const rng = prngRef.current();
    const tameBonus = facilityBonusTotals['tame_bonus'] ?? 0;
    const finalChance = Math.min(0.99, creature.tameChance + tameBonus / 100);
    const success = rng <= finalChance;

    setCoreEnergy((prev) => Math.max(0, prev - MK_TAME_BASE_COST));
    setTotalEnergySpent((prev) => prev + MK_TAME_BASE_COST);
    const heatGain = Math.max(1, MK_HEAT_PER_TAME - effectiveHeatReduction * 0.5);
    setHeatLevel((prev) => Math.min(MK_MAX_HEAT, prev + heatGain));

    if (success) {
      setCreatures((prev) =>
        prev.map((c) => (c.id === creatureId ? { ...c, tamed: true } : c))
      );
      setCreaturesTamed((prev) => prev + 1);
      if (creature.rarity === 'legendary') {
        setLegendaryTamed((prev) => prev + 1);
      }
      const xpGained = creature.xpReward * mkRarityXpMultiplier(creature.rarity);
      return { success: true, tamed: true, xpGained, message: `Successfully tamed ${creature.name}! (+${xpGained} XP)` };
    }

    return { success: true, tamed: false, xpGained: 0, message: `Failed to tame ${creature.name}. Try again!` };
  }, [facilityBonusTotals, effectiveHeatReduction]);

  const discoverCreature = useCallback((creatureId: string): { success: boolean; creature: MkCreature | null } => {
    const creature = stateRef.current.creatures.find((c) => c.id === creatureId) ?? null;
    if (!creature || creature.discovered) {
      return { success: false, creature };
    }
    setCreatures((prev) =>
      prev.map((c) =>
        c.id === creatureId
          ? { ...c, discovered: true, encounterCount: c.encounterCount + 1, lastSeen: Date.now() }
          : c
      )
    );
    const updated = { ...creature, discovered: true, encounterCount: creature.encounterCount + 1, lastSeen: Date.now() };
    return { success: true, creature: updated };
  }, []);

  const encounterRandomCreature = useCallback((): { creature: MkCreature | null; discovered: boolean } => {
    const s = stateRef.current;
    const zone = s.zones[s.currentZone];
    if (!zone) return { creature: null, discovered: false };

    const rng = prngRef.current();
    const available = zone.creatureIds;
    if (available.length === 0) return { creature: null, discovered: false };

    const selectedId = available[Math.floor(rng * available.length)];
    const creature = s.creatures.find((c) => c.id === selectedId);
    if (!creature) return { creature: null, discovered: false };

    const wasDiscovered = creature.discovered;
    if (!wasDiscovered) {
      setCreatures((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, discovered: true, encounterCount: c.encounterCount + 1, lastSeen: Date.now() }
            : c
        )
      );
      const updated = { ...creature, discovered: true, encounterCount: creature.encounterCount + 1, lastSeen: Date.now() };
      return { creature: updated, discovered: true };
    }

    setCreatures((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, encounterCount: c.encounterCount + 1, lastSeen: Date.now() }
          : c
      )
    );

    return { creature: { ...creature, encounterCount: creature.encounterCount + 1, lastSeen: Date.now() }, discovered: false };
  }, []);

  const purchaseTool = useCallback((toolId: string): { success: boolean; message: string } => {
    const tool = stateRef.current.tools.find((t) => t.id === toolId);
    if (!tool) return { success: false, message: 'Tool not found.' };
    if (tool.owned) return { success: false, message: 'Tool already owned.' };
    if (stateRef.current.coins < tool.cost) return { success: false, message: 'Not enough coins.' };

    setCoins((prev) => prev - tool.cost);
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, owned: true } : t))
    );
    return { success: true, message: `Purchased ${tool.name}!` };
  }, []);

  const equipTool = useCallback((toolId: string): { success: boolean; message: string } => {
    const tool = stateRef.current.tools.find((t) => t.id === toolId);
    if (!tool || !tool.owned) return { success: false, message: 'Tool not found or not owned.' };

    setTools((prev) =>
      prev.map((t) => ({
        ...t,
        equipped: t.id === toolId,
      }))
    );
    return { success: true, message: `Equipped ${tool.name}!` };
  }, []);

  const repairTool = useCallback((toolId: string): { success: boolean; message: string } => {
    const tool = stateRef.current.tools.find((t) => t.id === toolId);
    if (!tool || !tool.owned) return { success: false, message: 'Tool not found or not owned.' };
    if (tool.durability >= tool.maxDurability) return { success: false, message: 'Tool is already at full durability.' };

    const repairCost = Math.floor((tool.maxDurability - tool.durability) * 2);
    if (stateRef.current.coins < repairCost) return { success: false, message: `Need ${repairCost} coins to repair.` };

    setCoins((prev) => prev - repairCost);
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, durability: t.maxDurability } : t))
    );
    return { success: true, message: `Repaired ${tool.name} for ${repairCost} coins!` };
  }, []);

  const upgradeFacility = useCallback((facilityId: string): { success: boolean; message: string } => {
    const facility = stateRef.current.facilities.find((f) => f.id === facilityId);
    if (!facility) return { success: false, message: 'Facility not found.' };
    if (!facility.built) return { success: false, message: 'Facility must be built first. Use buildFacility().' };

    const newLevel = facility.level + 1;
    if (newLevel > facility.maxLevel) return { success: false, message: 'Facility is already at max level.' };

    const discount = facilityBonusTotals['upgrade_discount'] ?? 0;
    const cost = Math.max(1, Math.floor(facility.upgradeBaseCost * newLevel * (1 - discount / 100)));
    if (stateRef.current.coins < cost) return { success: false, message: `Need ${cost} coins to upgrade.` };

    setCoins((prev) => prev - cost);
    setFacilities((prev) =>
      prev.map((f) =>
        f.id === facilityId ? { ...f, level: newLevel, totalUpgrades: f.totalUpgrades + 1 } : f
      )
    );
    setTotalFacilitiesUpgraded((prev) => prev + 1);
    return { success: true, message: `Upgraded ${facility.name} to level ${newLevel}!` };
  }, [facilityBonusTotals]);

  const buildFacility = useCallback((facilityId: string): { success: boolean; message: string } => {
    const facility = stateRef.current.facilities.find((f) => f.id === facilityId);
    if (!facility) return { success: false, message: 'Facility not found.' };
    if (facility.built) return { success: false, message: 'Facility already built.' };

    const zone = stateRef.current.zones[facility.requiredZone];
    if (!zone || !zone.unlocked) return { success: false, message: 'Required zone not unlocked yet.' };

    if (stateRef.current.coins < facility.buildCost) return { success: false, message: `Need ${facility.buildCost} coins to build.` };

    setCoins((prev) => prev - facility.buildCost);
    setFacilities((prev) =>
      prev.map((f) =>
        f.id === facilityId
          ? { ...f, built: true, level: 1, active: true, builtAt: Date.now() }
          : f
      )
    );
    return { success: true, message: `Built ${facility.name}!` };
  }, []);

  const activateAbility = useCallback((abilityId: string): { success: boolean; message: string } => {
    const s = stateRef.current;
    const ability = s.abilities.find((a) => a.id === abilityId);
    if (!ability || !ability.unlocked) return { success: false, message: 'Ability not found or not unlocked.' };

    const now = Date.now();
    if (now - ability.lastUsed < ability.cooldownMs) {
      const remaining = Math.ceil((ability.cooldownMs - (now - ability.lastUsed)) / 1000);
      return { success: false, message: `Ability on cooldown. ${remaining}s remaining.` };
    }

    if (s.coreEnergy < ability.energyCost) return { success: false, message: 'Not enough core energy.' };
    if (ability.heatCost > 0 && s.heatLevel + ability.heatCost > MK_MAX_HEAT) {
      return { success: false, message: 'Activating would overheat!' };
    }

    setCoreEnergy((prev) => Math.max(0, prev - ability.energyCost));
    setTotalEnergySpent((prev) => prev + ability.energyCost);
    setHeatLevel((prev) => {
      if (ability.heatCost < 0) {
        setTotalHeatReduced((hr) => hr + Math.abs(ability.heatCost));
      }
      return Math.max(MK_MIN_HEAT, Math.min(MK_MAX_HEAT, prev + ability.heatCost));
    });
    setAbilities((prev) =>
      prev.map((a) =>
        a.id === abilityId
          ? { ...a, lastUsed: now, totalUses: a.totalUses + 1 }
          : a
      )
    );
    setTotalAbilitiesUsed((prev) => prev + 1);

    // Special effects
    if (ability.effectType === 'shield') {
      setShieldIntegrity(Math.min(MK_MAX_SHIELD, s.shieldIntegrity + ability.effectValue));
    }
    if (ability.effectType === 'absorb' || ability.effectType === 'core_drain' || ability.effectType === 'energy_drain') {
      const energyGain = ability.effectValue;
      setCoreEnergy((prev) => Math.min(MK_MAX_ENERGY, prev + energyGain));
      setTotalEnergyGained((prev) => prev + energyGain);
    }

    return { success: true, message: `Activated ${ability.name}!` };
  }, []);

  const deployShield = useCallback((): { success: boolean; message: string } => {
    const now = Date.now();
    const s = stateRef.current;
    if (now - s.shieldLastDeployed < MK_SHIELD_COOLDOWN_MS) {
      const remaining = Math.ceil((MK_SHIELD_COOLDOWN_MS - (now - s.shieldLastDeployed)) / 1000);
      return { success: false, message: `Shield on cooldown. ${remaining}s remaining.` };
    }
    if (s.coreEnergy < 15) {
      return { success: false, message: 'Not enough core energy for shield deployment.' };
    }

    setShieldIntegrity(MK_MAX_SHIELD);
    setCoreEnergy((prev) => Math.max(0, prev - 15));
    setTotalEnergySpent((prev) => prev + 15);
    setTotalShieldsDeployed((prev) => prev + 1);
    setShieldLastDeployed(now);
    return { success: true, message: 'Thermal shield deployed! Integrity restored to 100%.' };
  }, []);

  const scanZone = useCallback((zoneIndex?: number): { success: boolean; creatures: MkCreature[]; minerals: MkRarity[]; message: string } => {
    const targetZone = zoneIndex ?? stateRef.current.currentZone;
    const zone = stateRef.current.zones[targetZone];
    if (!zone || !zone.unlocked) {
      return { success: false, creatures: [], minerals: [], message: 'Zone not accessible.' };
    }

    const rng = prngRef.current();
    const scanPower = 0.5 + (facilityBonusTotals['scan_range'] ?? 0) / 50;

    const foundCreatures: MkCreature[] = [];
    for (const cid of zone.creatureIds) {
      if (rng < scanPower) {
        const c = stateRef.current.creatures.find((cr) => cr.id === cid);
        if (c) {
          if (!c.discovered) {
            setCreatures((prev) =>
              prev.map((cr) =>
                cr.id === cid ? { ...cr, discovered: true, encounterCount: cr.encounterCount + 1, lastSeen: Date.now() } : cr
              )
            );
            foundCreatures.push({ ...c, discovered: true });
          } else {
            foundCreatures.push(c);
          }
        }
      }
    }

    const mineralRarities: MkRarity[] = [];
    const mineralChance = zone.baseMineralChance * scanPower;
    if (rng < mineralChance) mineralRarities.push('common');
    if (rng < mineralChance * 0.6) mineralRarities.push('uncommon');
    if (rng < mineralChance * 0.3) mineralRarities.push('rare');
    if (rng < mineralChance * 0.1) mineralRarities.push('epic');
    if (rng < mineralChance * 0.02) mineralRarities.push('legendary');

    setCoreEnergy((prev) => Math.max(0, prev - 5));
    setTotalEnergySpent((prev) => prev + 5);
    setZones((prev) =>
      prev.map((z) => z.id === targetZone ? { ...z, mineralsDiscovered: z.mineralsDiscovered + mineralRarities.length } : z)
    );

    return {
      success: true,
      creatures: foundCreatures,
      minerals: mineralRarities,
      message: `Scan complete: ${foundCreatures.length} creatures, ${mineralRarities.length} mineral veins detected.`,
    };
  }, [facilityBonusTotals]);

  const smeltOre = useCallback((count: number = 1): { success: boolean; refined: number; xpGained: number; message: string } => {
    if (count <= 0) return { success: false, refined: 0, xpGained: 0, message: 'Invalid count.' };
    const s = stateRef.current;
    if (s.mineralsMined < count) return { success: false, refined: 0, xpGained: 0, message: 'Not enough minerals to smelt.' };
    if (s.coreEnergy < 5 * count) return { success: false, refined: 0, xpGained: 0, message: 'Not enough energy for smelting.' };

    const smeltBonus = 1 + (facilityBonusTotals['smelt_bonus'] ?? 0) / 100;
    const refineBonus = 1 + (facilityBonusTotals['refine_yield'] ?? 0) / 100;
    const refined = Math.floor(count * smeltBonus * refineBonus);
    const xpGained = Math.floor(count * 3 * smeltBonus);

    setMineralsMined((prev) => prev - count);
    setTotalOreSmelted((prev) => prev + refined);
    setCoreEnergy((prev) => Math.max(0, prev - 5 * count));
    setTotalEnergySpent((prev) => prev + 5 * count);
    setCoins((prev) => prev + refined * 5);
    const heatGain = Math.max(0, 2 * count - (facilityBonusTotals['heat_reduction'] ?? 0) * 0.5);
    setHeatLevel((prev) => Math.min(MK_MAX_HEAT, prev + heatGain));

    return {
      success: true,
      refined,
      xpGained,
      message: `Smelted ${count} ore into ${refined} refined materials. (+${xpGained} XP)`,
    };
  }, [facilityBonusTotals]);

  const reinforceBunker = useCallback((): { success: boolean; message: string } => {
    const bunker = stateRef.current.facilities.find((f) => f.id === 'bunker');
    if (!bunker || !bunker.built) {
      return { success: false, message: 'Bunker not built yet.' };
    }
    const bonus = bunker.bonusPerLevel * bunker.level;
    const energyCost = Math.max(5, 20 - bonus);
    if (stateRef.current.coreEnergy < energyCost) {
      return { success: false, message: 'Not enough energy to reinforce bunker.' };
    }

    setShieldIntegrity(MK_MAX_SHIELD);
    setCoreEnergy((prev) => Math.max(0, prev - energyCost));
    setTotalEnergySpent((prev) => prev + energyCost);
    setHeatLevel((prev) => Math.max(MK_MIN_HEAT, prev - 10));
    setTotalHeatReduced((prev) => prev + 10);
    return { success: true, message: `Bunker reinforced! Shield restored, heat reduced by 10.` };
  }, []);

  const triggerEruption = useCallback((): { success: boolean; damage: number; rewards: string; message: string } => {
    const now = Date.now();
    const s = stateRef.current;
    if (now - s.lastEruptionTime < MK_ERUPTION_COOLDOWN_MS) {
      const remaining = Math.ceil((MK_ERUPTION_COOLDOWN_MS - (now - s.lastEruptionTime)) / 1000);
      return { success: false, damage: 0, rewards: '', message: `Eruption cooldown active. ${remaining}s remaining.` };
    }
    if (s.heatLevel < 60) {
      return { success: false, damage: 0, rewards: '', message: 'Heat level must be at least 60 to trigger eruption.' };
    }

    const bunkerBonus = facilityBonusTotals['eruption_resist'] ?? 0;
    const warningBonus = facilityBonusTotals['eruption_warning'] ?? 0;
    const shieldBonus = s.shieldIntegrity * 0.5;

    const baseDamage = 20 + (s.heatLevel * 0.5);
    const mitigatedDamage = Math.max(0, Math.floor(baseDamage - bunkerBonus - warningBonus - shieldBonus));

    const rng = prngRef.current();
    const energyReward = Math.floor(rng * 30 + 20 + s.heatLevel * 0.3);
    const mineralReward = Math.floor(rng * 10 + 5);
    const coinReward = Math.floor(rng * 50 + 30);

    setHeatLevel((prev) => Math.max(MK_MIN_HEAT, prev - 30));
    setShieldIntegrity((prev) => Math.max(0, prev - mitigatedDamage * 0.3));
    setCoreEnergy((prev) => Math.min(MK_MAX_ENERGY, prev + energyReward));
    setTotalEnergyGained((prev) => prev + energyReward);
    setMineralsMined((prev) => prev + mineralReward);
    setCoins((prev) => prev + coinReward);
    setTotalEruptionsTriggered((prev) => prev + 1);
    setLastEruptionTime(now);

    if (mitigatedDamage < 10) {
      setTotalEruptionsSurvived((prev) => prev + 1);
    }

    return {
      success: true,
      damage: mitigatedDamage,
      rewards: `+${energyReward} energy, +${mineralReward} minerals, +${coinReward} coins`,
      message: mitigatedDamage < 10
        ? 'Eruption triggered successfully with minimal damage!'
        : `Eruption triggered! ${mitigatedDamage} damage taken. Rewards: ${energyReward} energy, ${mineralReward} minerals, ${coinReward} coins.`,
    };
  }, [facilityBonusTotals]);

  const coolSystem = useCallback((amount?: number): { success: boolean; cooled: number; message: string } => {
    const s = stateRef.current;
    const coolingBonus = 1 + (facilityBonusTotals['heat_reduction'] ?? 0) / 50;
    const effectiveCool = Math.floor((amount ?? MK_COOL_COST) * coolingBonus);
    const energyCost = MK_COOL_COST;

    if (s.coreEnergy < energyCost) {
      return { success: false, cooled: 0, message: 'Not enough energy for cooling.' };
    }
    if (s.heatLevel <= MK_MIN_HEAT) {
      return { success: false, cooled: 0, message: 'System already at minimum heat.' };
    }

    const actualCool = Math.min(effectiveCool, s.heatLevel);
    setHeatLevel((prev) => Math.max(MK_MIN_HEAT, prev - actualCool));
    setCoreEnergy((prev) => Math.max(0, prev - energyCost));
    setTotalEnergySpent((prev) => prev + energyCost);
    setTotalHeatReduced((prev) => prev + actualCool);
    return { success: true, cooled: actualCool, message: `System cooled by ${actualCool}. Heat: ${Math.max(MK_MIN_HEAT, s.heatLevel - actualCool)}.` };
  }, [facilityBonusTotals]);

  const checkAchievements = useCallback((): MkAchievement[] => {
    const s = stateRef.current;
    const newlyUnlocked: MkAchievement[] = [];
    const conditions: Record<string, number> = {
      minerals_mined: s.mineralsMined,
      creatures_tamed: s.creaturesTamed,
      depth_reached: s.depthReached,
      heat_survived: s.heatSurvivedHigh,
      facilities_built: s.facilities.filter((f) => f.built).length,
      shields_deployed: s.totalShieldsDeployed,
      eruptions_survived: s.totalEruptionsSurvived,
      legendary_tamed: s.legendaryTamed,
      ore_smelted: s.totalOreSmelted,
      total_energy_gained: s.totalEnergyGained,
      zones_explored: s.zones.filter((z) => z.explored).length,
      facilities_level5: s.facilities.filter((f) => f.built && f.level >= 5).length,
      bunker_maxed: s.facilities.find((f) => f.id === 'bunker' && f.level >= 10) ? 1 : 0,
    };

    setAchievements((prev) =>
      prev.map((a) => {
        if (a.unlocked) return a;
        const value = conditions[a.conditionKey] ?? 0;
        if (value >= a.targetValue) {
          newlyUnlocked.push({ ...a, unlocked: true, unlockedAt: Date.now(), progress: a.targetValue });
          return { ...a, unlocked: true, unlockedAt: Date.now(), progress: a.targetValue };
        }
        return { ...a, progress: Math.min(a.progress, value) };
      })
    );

    // Award rewards
    for (const a of newlyUnlocked) {
      setCoreEnergy((prev) => Math.min(MK_MAX_ENERGY, prev + a.rewardEnergy));
      setTotalEnergyGained((prev) => prev + a.rewardEnergy);
      if (a.rewardTitle) {
        setTitleIndex((prev) => {
          const idx = titleDefs.findIndex((t) => t.name === a.rewardTitle);
          return idx > prev ? idx : prev;
        });
      }
    }

    return newlyUnlocked;
  }, [titleDefs]);

  const claimDailyReward = useCallback((): { success: boolean; energy: number; minerals: number; message: string } => {
    const daily = stateRef.current.dailyExpedition;
    if (!daily || !daily.completed || daily.rewardClaimed) {
      return { success: false, energy: 0, minerals: 0, message: 'No completed daily expedition reward to claim.' };
    }
    setDailyExpedition((prev) => prev ? { ...prev, rewardClaimed: true } : null);
    setCoreEnergy((prev) => Math.min(MK_MAX_ENERGY, prev + daily.rewardEnergy));
    setTotalEnergyGained((prev) => prev + daily.rewardEnergy);
    setMineralsMined((prev) => prev + daily.rewardMinerals);
    return {
      success: true,
      energy: daily.rewardEnergy,
      minerals: daily.rewardMinerals,
      message: `Claimed daily reward: +${daily.rewardEnergy} energy, +${daily.rewardMinerals} minerals!`,
    };
  }, []);

  const progressDailyExpedition = useCallback((amount: number = 1): { success: boolean; completed: boolean; message: string } => {
    const daily = stateRef.current.dailyExpedition;
    if (!daily || daily.completed) {
      return { success: false, completed: daily?.completed ?? false, message: 'No active daily expedition or already completed.' };
    }

    const newProgress = Math.min(daily.target, daily.progress + amount);
    const completed = newProgress >= daily.target;

    setDailyExpedition((prev) => prev ? { ...prev, progress: newProgress, completed } : null);
    return {
      success: true,
      completed,
      message: completed ? 'Daily expedition completed! Claim your reward!' : `Daily progress: ${newProgress}/${daily.target}`,
    };
  }, []);

  const getTitle = useCallback((): MkTitleDef => {
    return titleDefs[titleIndex] ?? titleDefs[0];
  }, [titleDefs, titleIndex]);

  const getAllTitles = useCallback((): MkTitleDef[] => {
    return [...titleDefs];
  }, [titleDefs]);

  const getNextTitle = useCallback((): MkTitleDef | null => {
    for (let i = titleIndex + 1; i < titleDefs.length; i++) {
      return titleDefs[i];
    }
    return null;
  }, [titleDefs, titleIndex]);

  const getProgress = useCallback((): { xpProgress: number; overallProgress: number; levelProgress: number } => {
    return {
      xpProgress,
      overallProgress,
      levelProgress: level / 50,
    };
  }, [xpProgress, overallProgress, level]);

  const getStats = useCallback((): MkStats => {
    const s = stateRef.current;
    return {
      totalMineralsMined: s.mineralsMined,
      totalCreaturesTamed: s.creaturesTamed,
      totalFacilitiesUpgraded: s.totalFacilitiesUpgraded,
      totalAbilitiesUsed: s.totalAbilitiesUsed,
      totalZonesExplored: s.zones.filter((z) => z.explored).length,
      maxDepthReached: s.depthReached,
      totalEruptionsTriggered: s.totalEruptionsTriggered,
      totalOreSmelted: s.totalOreSmelted,
      totalShieldDeployments: s.totalShieldsDeployed,
      totalTimePlayed: Math.floor((Date.now() - (s.zones[0]?.firstEnteredAt ?? Date.now())) / 60000),
      totalEnergyGained: s.totalEnergyGained,
      totalEnergySpent: s.totalEnergySpent,
      totalHeatReduced: s.totalHeatReduced,
    };
  }, []);

  const getRarityColor = useCallback((rarity: MkRarity): string => {
    return mkRarityColor(rarity);
  }, []);

  const getZoneCreatures = useCallback((zoneIndex: number): MkCreature[] => {
    return stateRef.current.creatures.filter((c) => c.zoneIndex === zoneIndex);
  }, []);

  const getCreatureById = useCallback((id: string): MkCreature | null => {
    return stateRef.current.creatures.find((c) => c.id === id) ?? null;
  }, []);

  const getToolById = useCallback((id: string): MkTool | null => {
    return stateRef.current.tools.find((t) => t.id === id) ?? null;
  }, []);

  const getFacilityById = useCallback((id: string): MkFacility | null => {
    return stateRef.current.facilities.find((f) => f.id === id) ?? null;
  }, []);

  const getAbilityById = useCallback((id: string): MkAbility | null => {
    return stateRef.current.abilities.find((a) => a.id === id) ?? null;
  }, []);

  const canAfford = useCallback((cost: number): boolean => {
    return stateRef.current.coins >= cost;
  }, []);

  const spendCoins = useCallback((amount: number): { success: boolean; remaining: number } => {
    const s = stateRef.current;
    if (s.coins < amount) return { success: false, remaining: s.coins };
    setCoins((prev) => prev - amount);
    return { success: true, remaining: s.coins - amount };
  }, []);

  const addCoins = useCallback((amount: number): number => {
    setCoins((prev) => prev + Math.floor(amount));
    return stateRef.current.coins + Math.floor(amount);
  }, []);

  const addEnergy = useCallback((amount: number): number => {
    setCoreEnergy((prev) => Math.min(MK_MAX_ENERGY, prev + amount));
    setTotalEnergyGained((prev) => prev + amount);
    return Math.min(MK_MAX_ENERGY, stateRef.current.coreEnergy + amount);
  }, []);

  const isAbilityOnCooldown = useCallback((abilityId: string): boolean => {
    const ability = stateRef.current.abilities.find((a) => a.id === abilityId);
    if (!ability) return false;
    return Date.now() - ability.lastUsed < ability.cooldownMs;
  }, []);

  const getAbilityCooldownRemaining = useCallback((abilityId: string): number => {
    const ability = stateRef.current.abilities.find((a) => a.id === abilityId);
    if (!ability) return 0;
    const remaining = ability.cooldownMs - (Date.now() - ability.lastUsed);
    return Math.max(0, remaining);
  }, []);

  const isShieldOnCooldown = useCallback((): boolean => {
    return Date.now() - stateRef.current.shieldLastDeployed < MK_SHIELD_COOLDOWN_MS;
  }, []);

  const getShieldCooldownRemaining = useCallback((): number => {
    const remaining = MK_SHIELD_COOLDOWN_MS - (Date.now() - stateRef.current.shieldLastDeployed);
    return Math.max(0, remaining);
  }, []);

  const isEruptionOnCooldown = useCallback((): boolean => {
    return Date.now() - stateRef.current.lastEruptionTime < MK_ERUPTION_COOLDOWN_MS;
  }, []);

  const getEruptionCooldownRemaining = useCallback((): number => {
    const remaining = MK_ERUPTION_COOLDOWN_MS - (Date.now() - stateRef.current.lastEruptionTime);
    return Math.max(0, remaining);
  }, []);

  const getFacilityUpgradeCost = useCallback((facilityId: string): number => {
    const facility = stateRef.current.facilities.find((f) => f.id === facilityId);
    if (!facility || !facility.built) return 0;
    const newLevel = facility.level + 1;
    if (newLevel > facility.maxLevel) return 0;
    const discount = facilityBonusTotals['upgrade_discount'] ?? 0;
    return Math.max(1, Math.floor(facility.upgradeBaseCost * newLevel * (1 - discount / 100)));
  }, [facilityBonusTotals]);

  const getFacilityBonus = useCallback((bonusType: string): number => {
    return facilityBonusTotals[bonusType] ?? 0;
  }, [facilityBonusTotals]);

  const toggleFacilityActive = useCallback((facilityId: string): { success: boolean; active: boolean } => {
    const facility = stateRef.current.facilities.find((f) => f.id === facilityId);
    if (!facility || !facility.built) return { success: false, active: false };
    setFacilities((prev) =>
      prev.map((f) => f.id === facilityId ? { ...f, active: !f.active } : f)
    );
    return { success: true, active: !facility.active };
  }, []);

  const getHeatThreshold = useCallback((): number => {
    const bunker = stateRef.current.facilities.find((f) => f.id === 'bunker');
    const bunkerBonus = bunker?.built ? bunker.bonusPerLevel * bunker.level : 0;
    const shieldBonus = stateRef.current.shieldIntegrity * 0.2;
    return Math.floor(100 + bunkerBonus + shieldBonus);
  }, []);

  const getEffectiveMiningPower = useCallback((): number => {
    return effectiveMiningPower;
  }, [effectiveMiningPower]);

  const getEffectiveHeatReduction = useCallback((): number => {
    return effectiveHeatReduction;
  }, [effectiveHeatReduction]);

  // ---------------------------------------------------------------------------
  // Extended Computed Values
  // ---------------------------------------------------------------------------

  const zoneSummaries = useMemo<MkZoneSummary[]>(() => {
    return zones.map((z) => {
      const zoneCreatures = creatures.filter((c) => c.zoneIndex === z.id);
      return {
        zoneIndex: z.id,
        name: z.name,
        unlocked: z.unlocked,
        explored: z.explored,
        dangerLevel: z.dangerLevel,
        creaturesTotal: z.creatureIds.length,
        creaturesDiscovered: zoneCreatures.filter((c) => c.discovered).length,
        creaturesTamed: zoneCreatures.filter((c) => c.tamed).length,
        expeditionsCompleted: z.expeditionsCompleted,
        depthMax: z.depthMax,
      };
    });
  }, [zones, creatures]);

  const rarityDistribution = useMemo<MkRarityDistribution>(() => {
    return {
      common: creatures.filter((c) => c.rarity === 'common' && c.tamed).length,
      uncommon: creatures.filter((c) => c.rarity === 'uncommon' && c.tamed).length,
      rare: creatures.filter((c) => c.rarity === 'rare' && c.tamed).length,
      epic: creatures.filter((c) => c.rarity === 'epic' && c.tamed).length,
      legendary: creatures.filter((c) => c.rarity === 'legendary' && c.tamed).length,
    };
  }, [creatures]);

  const discoveryRate = useMemo(() => {
    if (creatures.length === 0) return 0;
    return discoveredCreatures.length / creatures.length;
  }, [creatures, discoveredCreatures]);

  const tamingRate = useMemo(() => {
    if (discoveredCreatures.length === 0) return 0;
    return tamedCreatures.length / discoveredCreatures.length;
  }, [discoveredCreatures, tamedCreatures]);

  const facilityUtilization = useMemo(() => {
    if (builtFacilities.length === 0) return 0;
    return activeFacilities.length / builtFacilities.length;
  }, [builtFacilities, activeFacilities]);

  const averageFacilityLevel = useMemo(() => {
    if (builtFacilities.length === 0) return 0;
    const total = builtFacilities.reduce((sum, f) => sum + f.level, 0);
    return total / builtFacilities.length;
  }, [builtFacilities]);

  const toolDurabilitySummary = useMemo(() => {
    const owned = ownedTools;
    if (owned.length === 0) return { total: 0, current: 0, percent: 100 };
    const total = owned.reduce((sum, t) => sum + t.maxDurability, 0);
    const current = owned.reduce((sum, t) => sum + t.durability, 0);
    return { total, current, percent: total > 0 ? Math.floor((current / total) * 100) : 100 };
  }, [ownedTools]);

  const coreAlerts = useMemo<MkCoreAlert[]>(() => {
    const alerts: MkCoreAlert[] = [];
    const now = Date.now();

    if (heatLevel >= 90) {
      alerts.push({
        id: 'heat_critical',
        severity: 'critical',
        message: 'Critical heat level! Deploy shield or cool system immediately!',
        timestamp: now,
        dismissed: false,
      });
    } else if (heatLevel >= 70) {
      alerts.push({
        id: 'heat_high',
        severity: 'danger',
        message: 'Heat level dangerously high. Consider cooling down.',
        timestamp: now,
        dismissed: false,
      });
    }

    if (coreEnergy <= 10) {
      alerts.push({
        id: 'energy_depleted',
        severity: 'critical',
        message: 'Core energy nearly depleted! Use Core Drain or Thermal Absorb abilities.',
        timestamp: now,
        dismissed: false,
      });
    } else if (coreEnergy <= 30) {
      alerts.push({
        id: 'energy_low',
        severity: 'warning',
        message: 'Core energy running low. Conserve energy or find an energy source.',
        timestamp: now,
        dismissed: false,
      });
    }

    if (shieldIntegrity <= 20) {
      alerts.push({
        id: 'shield_low',
        severity: 'warning',
        message: 'Shield integrity critical. Reinforce bunker or deploy new shield.',
        timestamp: now,
        dismissed: false,
      });
    }

    const brokenTools = ownedTools.filter((t) => t.durability <= 0);
    if (brokenTools.length > 0) {
      alerts.push({
        id: 'tools_broken',
        severity: 'info',
        message: `${brokenTools.length} tool(s) need repair.`,
        timestamp: now,
        dismissed: false,
      });
    }

    const completedDaily = dailyExpedition?.completed && !dailyExpedition?.rewardClaimed;
    if (completedDaily) {
      alerts.push({
        id: 'daily_ready',
        severity: 'info',
        message: 'Daily expedition reward ready to claim!',
        timestamp: now,
        dismissed: false,
      });
    }

    return alerts;
  }, [heatLevel, coreEnergy, shieldIntegrity, ownedTools, dailyExpedition]);

  const energyRegenRate = useMemo(() => {
    const base = MK_ENERGY_REGEN_RATE;
    const genBonus = facilityBonusTotals['energy_regen'] ?? 0;
    const coreBonus = facilityBonusTotals['core_power'] ?? 0;
    return base + genBonus + coreBonus;
  }, [facilityBonusTotals]);

  const dailyObjectiveDescription = useMemo(() => {
    if (!dailyExpedition) return 'No active expedition';
    const descriptions: Record<string, string> = {
      mine_minerals: `Mine ${dailyExpedition.target} minerals in ${zoneDefs[dailyExpedition.zoneIndex]?.name ?? 'the target zone'}`,
      tame_creatures: `Tame ${dailyExpedition.target} creatures in ${zoneDefs[dailyExpedition.zoneIndex]?.name ?? 'the target zone'}`,
      scan_zone: `Scan ${dailyExpedition.target} times in ${zoneDefs[dailyExpedition.zoneIndex]?.name ?? 'the target zone'}`,
      smelt_ore: `Smelt ${dailyExpedition.target} batches of ore`,
      explore_depth: `Reach depth ${dailyExpedition.target * 1000}m`,
    };
    return descriptions[dailyExpedition.objective] ?? dailyExpedition.objective;
  }, [dailyExpedition, zoneDefs]);

  // ---------------------------------------------------------------------------
  // Extended Action Functions
  // ---------------------------------------------------------------------------

  const quickMine = useCallback((): { success: boolean; minerals: number; xp: number } => {
    const result = mineMineral();
    if (result.success && result.xpGained > 0) {
      addXp(result.xpGained);
    }
    return { success: result.success, minerals: result.mineralsGained, xp: result.xpGained };
  }, [mineMineral, addXp]);

  const deepScan = useCallback((): { success: boolean; creatures: MkCreature[]; rarities: MkRarity[]; depth: number } => {
    const result = scanZone();
    const zone = stateRef.current.zones[stateRef.current.currentZone];
    const depth = zone?.depthMax ?? 0;
    const rarities: MkRarity[] = result.minerals as MkRarity[];
    return { success: result.success, creatures: result.creatures, rarities, depth };
  }, [scanZone]);

  const quickTame = useCallback((creatureId: string): { success: boolean; tamed: boolean; xp: number } => {
    const result = tameCreature(creatureId);
    if (result.tamed && result.xpGained > 0) {
      addXp(result.xpGained);
    }
    return { success: result.success, tamed: result.tamed, xp: result.xpGained };
  }, [tameCreature, addXp]);

  const massMine = useCallback((iterations: number = 5): { totalMinerals: number; totalXp: number; successes: number; failures: number } => {
    let totalMinerals = 0;
    let totalXp = 0;
    let successes = 0;
    let failures = 0;
    for (let i = 0; i < iterations; i++) {
      const result = mineMineral();
      if (result.success) {
        totalMinerals += result.mineralsGained;
        totalXp += result.xpGained;
        successes++;
      } else {
        failures++;
      }
    }
    if (totalXp > 0) addXp(totalXp);
    return { totalMinerals, totalXp, successes, failures };
  }, [mineMineral, addXp]);

  const expediteZone = useCallback((zoneIndex: number): { success: boolean; discovered: number; tamed: number; minerals: number; xp: number; message: string } => {
    const enterResult = enterZone(zoneIndex);
    if (!enterResult.success) {
      return { success: false, discovered: 0, tamed: 0, minerals: 0, xp: 0, message: enterResult.message };
    }

    let discovered = 0;
    let tamed = 0;
    let minerals = 0;
    let totalXp = 0;

    const scanResult = scanZone(zoneIndex);
    discovered = scanResult.creatures.filter((c) => c.discovered).length;

    const mineResult = mineMineral();
    if (mineResult.success) {
      minerals = mineResult.mineralsGained;
      totalXp += mineResult.xpGained;
    }

    for (const c of scanResult.creatures) {
      if (!c.tamed && c.tameChance > 0.3) {
        const tameResult = tameCreature(c.id);
        if (tameResult.tamed) {
          tamed++;
          totalXp += tameResult.xpGained;
        }
      }
    }

    if (totalXp > 0) addXp(totalXp);

    setZones((prev) =>
      prev.map((z) => z.id === zoneIndex ? { ...z, expeditionsCompleted: z.expeditionsCompleted + 1 } : z)
    );

    return {
      success: true,
      discovered,
      tamed,
      minerals,
      xp: totalXp,
      message: `Expedition to ${zoneDefs[zoneIndex]?.name ?? 'zone'} complete!`,
    };
  }, [enterZone, scanZone, mineMineral, tameCreature, addXp, zoneDefs]);

  const emergencyCool = useCallback((): { success: boolean; cooled: number; energyUsed: number; message: string } => {
    const s = stateRef.current;
    if (s.heatLevel < 70) {
      return { success: false, cooled: 0, energyUsed: 0, message: 'Heat is not critical enough for emergency cooling.' };
    }
    const energyAvailable = s.coreEnergy;
    const maxCoolCycles = Math.floor(energyAvailable / MK_COOL_COST);
    if (maxCoolCycles <= 0) {
      return { success: false, cooled: 0, energyUsed: 0, message: 'Not enough energy for emergency cooling.' };
    }

    let totalCooled = 0;
    let totalEnergyUsed = 0;
    const cycles = Math.min(maxCoolCycles, 5);

    for (let i = 0; i < cycles; i++) {
      const currentHeat = stateRef.current.heatLevel;
      if (currentHeat <= 30) break;
      const result = coolSystem();
      if (result.success) {
        totalCooled += result.cooled;
        totalEnergyUsed += MK_COOL_COST;
      } else {
        break;
      }
    }

    return {
      success: totalCooled > 0,
      cooled: totalCooled,
      energyUsed: totalEnergyUsed,
      message: totalCooled > 0
        ? `Emergency cooling applied! Reduced heat by ${totalCooled}.`
        : 'Emergency cooling failed.',
    };
  }, [coolSystem]);

  const autoRepair = useCallback((): { repaired: number; cost: number; message: string } => {
    let repaired = 0;
    let totalCost = 0;
    const s = stateRef.current;

    const brokenTools = s.tools.filter((t) => t.owned && t.durability <= 0);
    for (const tool of brokenTools) {
      const cost = Math.floor(tool.maxDurability * 2);
      if (s.coins >= totalCost + cost) {
        repairTool(tool.id);
        totalCost += cost;
        repaired++;
      }
    }

    return {
      repaired,
      cost: totalCost,
      message: repaired > 0 ? `Repaired ${repaired} tool(s) for ${totalCost} coins.` : 'No tools needed repair.',
    };
  }, [repairTool]);

  const maximizeEnergy = useCallback((): { energyGained: number; message: string } => {
    const absAbility = stateRef.current.abilities.find((a) => a.id === 'thermal_absorb');
    const drainAbility = stateRef.current.abilities.find((a) => a.id === 'core_drain');
    let totalGained = 0;

    if (absAbility && absAbility.unlocked) {
      const result = activateAbility('thermal_absorb');
      if (result.success) totalGained += absAbility.effectValue;
    }
    if (drainAbility && drainAbility.unlocked) {
      const result = activateAbility('core_drain');
      if (result.success) totalGained += drainAbility.effectValue;
    }

    return {
      energyGained: totalGained,
      message: totalGained > 0 ? `Gained ${totalGained} energy from abilities.` : 'No energy abilities available or on cooldown.',
    };
  }, [activateAbility]);

  const evaluateZoneReadiness = useCallback((zoneIndex: number): { ready: boolean; score: number; recommendations: string[] } => {
    const s = stateRef.current;
    const zone = zoneDefs[zoneIndex];
    if (!zone) return { ready: false, score: 0, recommendations: ['Invalid zone'] };

    let score = 0;
    const recommendations: string[] = [];

    // Heat readiness
    const heatMargin = MK_MAX_HEAT - s.heatLevel;
    if (heatMargin > zone.heatRate * 10) {
      score += 25;
    } else {
      recommendations.push('Heat level too high for this zone. Cool down first.');
      score += Math.floor((heatMargin / (zone.heatRate * 10)) * 25);
    }

    // Energy readiness
    const energyRatio = s.coreEnergy / MK_MAX_ENERGY;
    if (energyRatio > 0.5) {
      score += 25;
    } else {
      recommendations.push('Core energy is low. Conserve or regenerate energy.');
      score += Math.floor(energyRatio * 50);
    }

    // Tool readiness
    const bestTool = s.tools.find((t) => t.owned && t.equipped);
    const toolPower = bestTool?.miningPower ?? 5;
    if (toolPower >= zone.dangerLevel * 3) {
      score += 25;
    } else {
      recommendations.push('Equip a stronger tool for this zone danger level.');
      score += Math.floor((toolPower / (zone.dangerLevel * 3)) * 25);
    }

    // Shield readiness
    if (s.shieldIntegrity > 50) {
      score += 25;
    } else {
      recommendations.push('Deploy or reinforce your thermal shield before entering.');
      score += Math.floor((s.shieldIntegrity / 50) * 25);
    }

    return {
      ready: score >= 75,
      score,
      recommendations,
    };
  }, [zoneDefs]);

  const getCreatureTameStrategy = useCallback((creatureId: string): { chance: number; recommended: string; tools: string[] } => {
    const creature = stateRef.current.creatures.find((c) => c.id === creatureId);
    if (!creature) return { chance: 0, recommended: 'Creature not found.', tools: [] };

    const baseChance = creature.tameChance;
    const facilityBonus = facilityBonusTotals['tame_bonus'] ?? 0;
    const finalChance = Math.min(0.99, baseChance + facilityBonus / 100);

    const recommendedTools = stateRef.current.tools
      .filter((t) => t.owned && t.heatReduction > creature.heatResistance * 0.1)
      .map((t) => t.name)
      .slice(0, 3);

    let recommendation = '';
    if (finalChance >= 0.5) {
      recommendation = 'High tame chance — go for it!';
    } else if (finalChance >= 0.3) {
      recommendation = 'Moderate chance. Consider using abilities to improve odds.';
    } else if (finalChance >= 0.15) {
      recommendation = 'Low chance. Build creature pen facility first for bonus.';
    } else {
      recommendation = 'Very low chance. Maximize tame bonuses and try during favorable conditions.';
    }

    return { chance: finalChance, recommended: recommendation, tools: recommendedTools };
  }, [facilityBonusTotals]);

  const getMiningEfficiency = useCallback((): { power: number; reduction: number; netGain: number; rating: string } => {
    const power = effectiveMiningPower;
    const reduction = effectiveHeatReduction;
    const zone = stateRef.current.zones[stateRef.current.currentZone];
    const heatCost = Math.max(1, MK_HEAT_PER_MINE - reduction);
    const mineralChance = (zone?.baseMineralChance ?? 0.5) + power / 100;
    const expectedMinerals = mineralChance * (1 + power / 10);
    const netGain = expectedMinerals - heatCost * 0.1;

    let rating = 'F';
    if (netGain > 5) rating = 'S';
    else if (netGain > 3) rating = 'A';
    else if (netGain > 2) rating = 'B';
    else if (netGain > 1) rating = 'C';
    else if (netGain > 0) rating = 'D';

    return { power, reduction, netGain, rating };
  }, [effectiveMiningPower, effectiveHeatReduction]);

  const getFacilityRecommendation = useCallback((): { facilityId: string; reason: string; priority: 'high' | 'medium' | 'low' } | null => {
    const s = stateRef.current;
    const unbuilt = s.facilities.filter((f) => !f.built);
    if (unbuilt.length === 0) {
      const upgradable = s.facilities.filter((f) => f.built && f.level < f.maxLevel);
      if (upgradable.length === 0) return null;
      const sorted = [...upgradable].sort((a, b) => b.level - a.level);
      return { facilityId: sorted[0].id, reason: 'All facilities built — focus on upgrades.', priority: 'low' };
    }

    if (s.heatLevel > 60) {
      const cooling = unbuilt.find((f) => f.bonusType === 'heat_reduction');
      if (cooling) return { facilityId: cooling.id, reason: 'Build cooling to manage high heat levels.', priority: 'high' };
    }

    if (s.coreEnergy < 50) {
      const generator = unbuilt.find((f) => f.bonusType === 'energy_regen');
      if (generator) return { facilityId: generator.id, reason: 'Build energy generator to increase energy regeneration.', priority: 'high' };
    }

    const mining = unbuilt.find((f) => f.bonusType === 'mining_speed');
    if (mining) return { facilityId: mining.id, reason: 'Build mining shaft to increase mining output.', priority: 'medium' };

    const bunker = unbuilt.find((f) => f.id === 'bunker');
    if (bunker) return { facilityId: bunker.id, reason: 'Build bunker for eruption protection.', priority: 'medium' };

    return { facilityId: unbuilt[0].id, reason: `Build ${unbuilt[0].name} to expand operations.`, priority: 'low' };
  }, []);

  const simulateMiningSession = useCallback((toolId: string, iterations: number = 10): { avgMinerals: number; avgXp: number; successRate: number; heatCost: number; energyCost: number } => {
    const tool = stateRef.current.tools.find((t) => t.id === toolId && t.owned);
    if (!tool) {
      return { avgMinerals: 0, avgXp: 0, successRate: 0, heatCost: 0, energyCost: 0 };
    }

    const zone = stateRef.current.zones[stateRef.current.currentZone];
    const mineChance = (zone?.baseMineralChance ?? 0.5) + tool.miningPower / 100;
    const heatGain = Math.max(1, MK_HEAT_PER_MINE - effectiveHeatReduction);
    const energyCost = MK_MINE_BASE_COST + Math.floor(zone?.dangerLevel ?? 1);

    let totalMinerals = 0;
    let successes = 0;
    const rng = mkMulberry32(Date.now());

    for (let i = 0; i < iterations; i++) {
      if (rng() <= mineChance) {
        totalMinerals += Math.floor(rng() * 3) + 1 + Math.floor(tool.miningPower / 10);
        successes++;
      }
    }

    return {
      avgMinerals: Math.floor(totalMinerals / iterations * 10) / 10,
      avgXp: Math.floor((totalMinerals * 5) / iterations * 10) / 10,
      successRate: Math.floor((successes / iterations) * 100),
      heatCost: heatGain * iterations,
      energyCost: energyCost * iterations,
    };
  }, [effectiveHeatReduction]);

  const resetAllProgress = useCallback(() => {
    const now = Date.now();

    setCreatures(creatureDefs.map((d) => ({ ...d, discovered: false, tamed: false, encounterCount: 0, lastSeen: null })));
    setZones(zoneDefs.map((d, i) => ({ ...d, unlocked: i === 0, explored: false, expeditionsCompleted: 0, mineralsDiscovered: 0, totalHeatGained: 0, firstEnteredAt: i === 0 ? now : null })));
    setTools(toolDefs.map((d) => ({ ...d, owned: d.cost === 0, equipped: d.cost === 0, durability: d.maxDurability, level: 1, totalMined: 0 })));
    setFacilities(facilityDefs.map((d) => ({ ...d, built: false, level: 0, active: false, totalUpgrades: 0, builtAt: null })));
    setAbilities(abilityDefs.map((d) => ({ ...d, unlocked: d.unlockLevel <= 1, lastUsed: 0, totalUses: 0 })));
    setAchievements(achievementDefs.map((d) => ({ ...d, unlocked: false, unlockedAt: null, progress: 0 })));

    setCurrentZone(0);
    setHeatLevel(MK_STARTING_HEAT);
    setCoreEnergy(MK_STARTING_ENERGY);
    setMineralsMined(0);
    setCreaturesTamed(0);
    setDepthReached(0);
    setTitleIndex(0);
    setShieldIntegrity(MK_MAX_SHIELD);
    setTotalOreSmelted(0);
    setTotalShieldsDeployed(0);
    setTotalEruptionsTriggered(0);
    setTotalEruptionsSurvived(0);
    setTotalFacilitiesUpgraded(0);
    setTotalAbilitiesUsed(0);
    setTotalEnergyGained(0);
    setTotalEnergySpent(0);
    setTotalHeatReduced(0);
    setHeatSurvivedHigh(0);
    setLegendaryTamed(0);
    setLevel(1);
    setXp(0);
    setCoins(200);
    setShieldLastDeployed(0);
    setLastEruptionTime(0);

    prngRef.current = mkMulberry32(Date.now());
  }, [creatureDefs, zoneDefs, toolDefs, facilityDefs, abilityDefs, achievementDefs]);

  // ---------------------------------------------------------------------------
  // Return Everything
  // ---------------------------------------------------------------------------

  return {
    // Constants
    MK_MAX_ENERGY,
    MK_CREATURE_COUNT,
    MK_ZONE_COUNT,
    MK_TOOL_COUNT,
    MK_FACILITY_COUNT,
    MK_ABILITY_COUNT,
    MK_ACHIEVEMENT_COUNT,
    MK_TITLE_COUNT,
    MK_MAX_SHIELD,
    MK_MAX_HEAT,
    MK_MIN_HEAT,
    MK_STARTING_ENERGY,
    MK_STARTING_HEAT,
    MK_COLORS,

    // State
    creatures,
    zones,
    tools,
    facilities,
    abilities,
    achievements,
    currentZone,
    heatLevel,
    coreEnergy,
    mineralsMined,
    creaturesTamed,
    depthReached,
    titleIndex,
    shieldIntegrity,
    dailyExpedition,
    level,
    xp,
    coins,
    totalOreSmelted,
    totalShieldsDeployed,
    totalEruptionsTriggered,
    totalEruptionsSurvived,
    totalFacilitiesUpgraded,
    totalAbilitiesUsed,
    totalEnergyGained,
    totalEnergySpent,
    totalHeatReduced,
    heatSurvivedHigh,
    legendaryTamed,

    // Computed
    discoveredCreatures,
    tamedCreatures,
    unlockedZones,
    exploredZones,
    ownedTools,
    equippedTool,
    builtFacilities,
    activeFacilities,
    unlockedAbilities,
    unlockedAchievements,
    lockedAchievements,
    currentZoneData,
    currentZoneCreatures,
    heatStatus,
    energyStatus,
    facilityBonusTotals,
    effectiveMiningPower,
    effectiveHeatReduction,
    xpProgress,
    overallProgress,
    creaturesByRarity,

    // Static data accessors
    creatureDefs,
    zoneDefs,
    toolDefs,
    facilityDefs,
    abilityDefs,
    achievementDefs,
    titleDefs,

    // Zone actions
    enterZone,
    unlockZone,
    scanZone,

    // Mining actions
    mineMineral,
    smeltOre,

    // Creature actions
    tameCreature,
    discoverCreature,
    encounterRandomCreature,

    // Tool actions
    purchaseTool,
    equipTool,
    repairTool,

    // Facility actions
    buildFacility,
    upgradeFacility,
    toggleFacilityActive,
    reinforceBunker,

    // Ability actions
    activateAbility,
    isAbilityOnCooldown,
    getAbilityCooldownRemaining,

    // Shield actions
    deployShield,
    isShieldOnCooldown,
    getShieldCooldownRemaining,

    // Eruption actions
    triggerEruption,
    isEruptionOnCooldown,
    getEruptionCooldownRemaining,

    // System actions
    coolSystem,
    checkAchievements,

    // Title actions
    getTitle,
    getAllTitles,
    getNextTitle,

    // Progress & Stats
    getProgress,
    getStats,

    // Economy
    canAfford,
    spendCoins,
    addCoins,
    addEnergy,

    // Daily
    claimDailyReward,
    progressDailyExpedition,

    // Utility
    getRarityColor,
    getZoneCreatures,
    getCreatureById,
    getToolById,
    getFacilityById,
    getAbilityById,
    getFacilityUpgradeCost,
    getFacilityBonus,
    getHeatThreshold,
    getEffectiveMiningPower,
    getEffectiveHeatReduction,

    // Extended Computed Values
    zoneSummaries,
    rarityDistribution,
    discoveryRate,
    tamingRate,
    facilityUtilization,
    averageFacilityLevel,
    toolDurabilitySummary,
    coreAlerts,
    energyRegenRate,
    dailyObjectiveDescription,

    // Extended Actions
    quickMine,
    deepScan,
    quickTame,
    massMine,
    expediteZone,
    emergencyCool,
    autoRepair,
    maximizeEnergy,
    evaluateZoneReadiness,
    getCreatureTameStrategy,
    getMiningEfficiency,
    getFacilityRecommendation,
    simulateMiningSession,
    resetAllProgress,
  };
}
