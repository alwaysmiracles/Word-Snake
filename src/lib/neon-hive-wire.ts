'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

// ============================================================
// Neon Hive Colony — Cyberpunk Insect Management Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// ============================================================

// ============================================================
// Types
// ============================================================

export type NeonRarity = 'common' | 'unusual' | 'rare' | 'epic' | 'legendary';
export type NHQuestType = 'harvest' | 'breed' | 'upgrade' | 'swarm' | 'energy';
export type NHDailyType = 'harvest' | 'breed' | 'upgrade' | 'swarm';
export type NeonType = 'plasma' | 'holo' | 'laser' | 'quantum' | 'neural' | 'photon' | 'cryo';
export type GridStatus = 'stable' | 'overloaded' | 'surging' | 'critical';
export type NeonColor = 'neon_pink' | 'electric_cyan' | 'laser_green' | 'holo_purple' | 'digital_yellow';

export interface CyberInsectDef {
  id: string;
  name: string;
  rarity: NeonRarity;
  neonType: NeonType;
  energyOutput: number;
  speed: number;
  description: string;
  emoji: string;
}

export interface HiveSectorDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseCapacity: number;
  baseEnergyMultiplier: number;
  baseUpgradeCost: number;
}

export interface NectarDef {
  id: string;
  name: string;
  nectarValue: number;
  energyValue: number;
  rarity: NeonRarity;
  neonColor: NeonColor;
  description: string;
  emoji: string;
  requiredLevel: number;
}

export interface StructureDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  category: 'energy' | 'defense' | 'storage' | 'breeding' | 'harvest';
  baseBonusValue: number;
  baseUpgradeCost: number;
}

export interface NeonAbilityDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cooldown: number;
  energyCost: number;
  rarity: NeonRarity;
  effectType: 'boost' | 'shield' | 'drain' | 'heal' | 'special';
  effectValue: number;
  requiredLevel: number;
}

export interface NHQuestDef {
  id: string;
  name: string;
  description: string;
  type: NHQuestType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  requiredLevel: number;
  emoji: string;
}

export interface NHDailyQuestPoolDef {
  id: string;
  name: string;
  description: string;
  type: NHDailyType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface NHAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface NHTitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface NHRarityInfo {
  key: NeonRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface SwarmJob {
  id: string;
  sectorId: string;
  insectIds: string[];
  startedAt: number;
  endsAt: number;
  energyYield: number;
  nectarYield: number;
}

export interface SectorState {
  id: string;
  level: number;
  capacity: number;
  insectCount: number;
  activeInsects: string[];
  installedStructures: string[];
  gridStatus: GridStatus;
}

export interface StructureState {
  id: string;
  level: number;
  installedOn: string | null;
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

export interface NHDailyTaskState {
  poolId: string;
  progress: number;
  claimed: boolean;
  dayKey: string;
}

export interface AbilityCooldown {
  abilityId: string;
  lastUsedAt: number;
  readyAt: number;
}

export interface NeonHiveState {
  level: number;
  xp: number;
  coins: number;
  sectors: SectorState[];
  nectars: Record<string, number>;
  swarmQueue: SwarmJob[];
  dailyStreak: number;
  lastDaily: string | null;
  activeQuests: QuestState[];
  completedQuests: string[];
  unlockedAchievements: AchievementState[];
  dailyTask: NHDailyTaskState | null;
  structures: StructureState[];
  seed: number;
  totalEnergyHarvested: number;
  totalNectarCollected: number;
  totalEarned: number;
  totalSpent: number;
  completedBreeds: number;
  completedHarvests: number;
  completedSwarmCommands: number;
  swarmCommandsExecuted: number;
  gridOptimizations: number;
  activeSectorId: string;
  insectCountByRarity: Record<NeonRarity, number>;
  unlockedInsects: string[];
  unlockedAbilities: string[];
  abilityCooldowns: AbilityCooldown[];
  nectarInventory: Record<string, number>;
  energyGridEfficiency: number;
  structureUpgradeCount: number;
  totalInsectsBred: number;
  highestEnergyOutput: number;
  activeAbilities: string[];
}

// ============================================================
// Seeded PRNG (mulberry32 — no Math.random)
// ============================================================

function nhMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function nhHashString(str: string): number {
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

function nhXPRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= NH_MAX_LEVEL) return Infinity;
  return Math.floor(120 * level * (1 + level * 0.15));
}

function nhClampLevel(lvl: number): number {
  return Math.max(1, Math.min(NH_MAX_LEVEL, lvl));
}

function nhClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function nhGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function nhRarityMultiplier(r: NeonRarity): number {
  const map: Record<NeonRarity, number> = {
    common: 1,
    unusual: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
  };
  return map[r] ?? 1;
}

// ============================================================
// Color Theme
// ============================================================

export const NH_COLORS: Record<NeonColor, string> = {
  neon_pink: '#FF00FF',
  electric_cyan: '#00FFFF',
  laser_green: '#39FF14',
  holo_purple: '#BF00FF',
  digital_yellow: '#FFD700',
};

// ============================================================
// Constants
// ============================================================

export const NH_MAX_LEVEL = 50;

export const NH_RARITIES: NHRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'unusual', label: 'Unusual', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#00FFFF', xpMultiplier: 2.5 },
  { key: 'epic', label: 'Epic', color: '#BF00FF', xpMultiplier: 4 },
  { key: 'legendary', label: 'Legendary', color: '#FFD700', xpMultiplier: 7 },
];

export const NH_TITLE_THRESHOLDS: NHTitleInfo[] = [
  { name: 'Drone Recruit', levelRequired: 1, description: 'A fresh recruit in the neon hive network' },
  { name: 'Glow Technician', levelRequired: 6, description: 'You can calibrate basic holographic comb arrays' },
  { name: 'Plasma Overseer', levelRequired: 14, description: 'Commanding plasma chambers with neon precision' },
  { name: 'Swarm Commander', levelRequired: 22, description: 'Leading cyber-insect swarms through digital fields' },
  { name: 'Energy Architect', levelRequired: 30, description: 'Designing energy grids that power entire sectors' },
  { name: 'Holo Breeder', levelRequired: 38, description: 'Master breeder of legendary cyber-insects' },
  { name: 'Quantum Warden', levelRequired: 45, description: 'Guardian of the quantum holo-nexus core' },
  { name: 'Neon Queen', levelRequired: 50, description: 'Supreme ruler of the entire neon hive empire' },
];

export const NH_CYBER_INSECTS: CyberInsectDef[] = [
  // Common (7)
  { id: 'neon_drone', name: 'Neon Drone', rarity: 'common', neonType: 'plasma', energyOutput: 5, speed: 3, description: 'Basic worker unit of the neon hive, glows with faint plasma light', emoji: '🐝' },
  { id: 'circuit_ant', name: 'Circuit Ant', rarity: 'common', neonType: 'laser', energyOutput: 3, speed: 5, description: 'Tiny ants that follow printed circuit trails through the hive', emoji: '🐜' },
  { id: 'pixel_beetle', name: 'Pixel Beetle', rarity: 'common', neonType: 'holo', energyOutput: 4, speed: 2, description: 'Armored beetles with holographic shell displays', emoji: '🪲' },
  { id: 'glow_moth', name: 'Glow Moth', rarity: 'common', neonType: 'photon', energyOutput: 3, speed: 4, description: 'Moths whose wings emit soft bioluminescent photon trails', emoji: '🦋' },
  { id: 'spark_fly', name: 'Spark Fly', rarity: 'common', neonType: 'plasma', energyOutput: 2, speed: 6, description: 'Blazing fast flies that leave electric spark trails', emoji: '✨' },
  { id: 'data_wasp', name: 'Data Wasp', rarity: 'common', neonType: 'neural', energyOutput: 4, speed: 4, description: 'Aggressive wasps that sting with neural data packets', emoji: '🐝' },
  { id: 'byte_bug', name: 'Byte Bug', rarity: 'common', neonType: 'quantum', energyOutput: 3, speed: 3, description: 'Small bugs that process binary data in their mandibles', emoji: '🐛' },
  // Unusual (7)
  { id: 'plasma_bee', name: 'Plasma Bee', rarity: 'unusual', neonType: 'plasma', energyOutput: 8, speed: 5, description: 'Bees wreathed in streaming plasma, supercharged nectar output', emoji: '⚡' },
  { id: 'holo_wasp', name: 'Holo Wasp', rarity: 'unusual', neonType: 'holo', energyOutput: 7, speed: 7, description: 'Semi-transparent wasps projected from holographic emitters', emoji: '🔮' },
  { id: 'laser_hornet', name: 'Laser Hornet', rarity: 'unusual', neonType: 'laser', energyOutput: 10, speed: 4, description: 'Hornets that fire precision laser beams at hive threats', emoji: '🔴' },
  { id: 'neural_beetle', name: 'Neural Beetle', rarity: 'unusual', neonType: 'neural', energyOutput: 6, speed: 3, description: 'Beetles with brain-linked neural processors for hive coordination', emoji: '🧠' },
  { id: 'cryo_fly', name: 'Cryo Fly', rarity: 'unusual', neonType: 'cryo', energyOutput: 5, speed: 8, description: 'Flies that freeze nectar into crystalline energy shards', emoji: '❄️' },
  { id: 'photon_moth', name: 'Photon Moth', rarity: 'unusual', neonType: 'photon', energyOutput: 9, speed: 5, description: 'Moths that convert ambient light directly into pure photon energy', emoji: '💡' },
  { id: 'quantum_ant', name: 'Quantum Ant', rarity: 'unusual', neonType: 'quantum', energyOutput: 7, speed: 6, description: 'Ants that exist in multiple hive sectors simultaneously', emoji: '⚛️' },
  // Rare (7)
  { id: 'arc_lightning_bee', name: 'Arc Lightning Bee', rarity: 'rare', neonType: 'plasma', energyOutput: 15, speed: 8, description: 'Massive bees that generate devastating electrical arcs between comb cells', emoji: '🌩️' },
  { id: 'prism_wasp', name: 'Prism Wasp', rarity: 'rare', neonType: 'holo', energyOutput: 12, speed: 9, description: 'Wasps whose bodies refract light into dazzling prismatic displays', emoji: '🌈' },
  { id: 'railgun_beetle', name: 'Railgun Beetle', rarity: 'rare', neonType: 'laser', energyOutput: 18, speed: 3, description: 'Heavy beetles equipped with electromagnetic railgun defense systems', emoji: '🔫' },
  { id: 'synapse_hornet', name: 'Synapse Hornet', rarity: 'rare', neonType: 'neural', energyOutput: 14, speed: 7, description: 'Hornets that form a collective neural network across the hive', emoji: '🕸️' },
  { id: 'frost_moth', name: 'Frost Moth', rarity: 'rare', neonType: 'cryo', energyOutput: 11, speed: 6, description: 'Moths that lower temperatures to preserve holographic honey quality', emoji: '🧊' },
  { id: 'nova_fly', name: 'Nova Fly', rarity: 'rare', neonType: 'photon', energyOutput: 16, speed: 10, description: 'Blazing flies that trigger miniature stellar novas for energy bursts', emoji: '🌟' },
  { id: 'entangle_ant', name: 'Entangle Ant', rarity: 'rare', neonType: 'quantum', energyOutput: 13, speed: 5, description: 'Ants that quantum-entangle nectar molecules for instant transport', emoji: '🔗' },
  // Epic (7)
  { id: 'storm_sovereign', name: 'Storm Sovereign Bee', rarity: 'epic', neonType: 'plasma', energyOutput: 25, speed: 10, description: 'Legendary bee that commands localized thunderstorms within the hive', emoji: '⛈️' },
  { id: 'hologram_queen', name: 'Hologram Queen', rarity: 'epic', neonType: 'holo', energyOutput: 22, speed: 7, description: 'A perfect holographic duplicate of the hive queen, boosting all nearby insects', emoji: '👑' },
  { id: 'disintegrator_wasp', name: 'Disintegrator Wasp', rarity: 'epic', neonType: 'laser', energyOutput: 30, speed: 6, description: 'Wasps that fire molecular disintegration beams at parasites', emoji: '💀' },
  { id: 'neuro_weaver', name: 'Neuro Weaver Beetle', rarity: 'epic', neonType: 'neural', energyOutput: 20, speed: 8, description: 'Beetles that weave neural threads connecting every sector of the hive', emoji: '🧬' },
  { id: 'absolute_zero_moth', name: 'Absolute Zero Moth', rarity: 'epic', neonType: 'cryo', energyOutput: 24, speed: 9, description: 'Moths that achieve near-absolute zero temperatures, freezing energy in place', emoji: '🥶' },
  { id: 'supernova_fly', name: 'Supernova Fly', rarity: 'epic', neonType: 'photon', energyOutput: 28, speed: 12, description: 'Flies that trigger controlled supernovas, generating massive energy waves', emoji: '💫' },
  { id: 'probability_ant', name: 'Probability Ant', rarity: 'epic', neonType: 'quantum', energyOutput: 21, speed: 11, description: 'Ants that manipulate quantum probabilities to maximize nectar yield', emoji: '🎲' },
  // Legendary (7)
  { id: 'neon_apex', name: 'Neon Apex Empress', rarity: 'legendary', neonType: 'plasma', energyOutput: 50, speed: 15, description: 'The supreme plasma empress — her radiance powers entire hive districts', emoji: '👸' },
  { id: 'omni_hive_mind', name: 'Omni Hive Mind', rarity: 'legendary', neonType: 'holo', energyOutput: 45, speed: 12, description: 'A collective consciousness that manifests as a colossal holographic insect', emoji: '🌌' },
  { id: 'annihilator', name: 'Annihilator Beetle', rarity: 'legendary', neonType: 'laser', energyOutput: 55, speed: 8, description: 'An ancient war beetle whose laser can slice through any material known', emoji: '🗡️' },
  { id: 'nexus_intellect', name: 'Nexus Intellect', rarity: 'legendary', neonType: 'neural', energyOutput: 40, speed: 14, description: 'A hyper-evolved neural insect that thinks in parallel dimensions', emoji: '🧠' },
  { id: 'cryo_titan', name: 'Cryo Titan Moth', rarity: 'legendary', neonType: 'cryo', energyOutput: 48, speed: 10, description: 'A titanic moth that freezes time itself in a localized cryo-field', emoji: '🏔️' },
  { id: 'photon_primordial', name: 'Photon Primordial', rarity: 'legendary', neonType: 'photon', energyOutput: 42, speed: 16, description: 'The original photon insect from which all others descended', emoji: '☀️' },
  { id: 'quantum_god', name: 'Quantum God Ant', rarity: 'legendary', neonType: 'quantum', energyOutput: 60, speed: 13, description: 'An ant that exists across all timelines simultaneously, infinite energy', emoji: '♾️' },
];

export const NH_HIVE_SECTORS: HiveSectorDef[] = [
  { id: 'neon_comb', name: 'Neon Comb', description: 'The primary honeycomb structure pulsing with neon energy', emoji: '🏠', maxLevel: 10, baseCapacity: 50, baseEnergyMultiplier: 1.0, baseUpgradeCost: 100 },
  { id: 'plasma_chamber', name: 'Plasma Chamber', description: 'Superheated chamber where plasma bees refine raw nectar', emoji: '⚡', maxLevel: 10, baseCapacity: 40, baseEnergyMultiplier: 1.3, baseUpgradeCost: 150 },
  { id: 'holo_garden', name: 'Holo Garden', description: 'Holographic flower fields where digital pollen is harvested', emoji: '🌸', maxLevel: 10, baseCapacity: 60, baseEnergyMultiplier: 0.9, baseUpgradeCost: 120 },
  { id: 'quantum_cell', name: 'Quantum Cell', description: 'Stabilized quantum space for breeding rare cyber-insects', emoji: '⚛️', maxLevel: 10, baseCapacity: 20, baseEnergyMultiplier: 1.5, baseUpgradeCost: 200 },
  { id: 'cryo_vault', name: 'Cryo Vault', description: 'Ultra-cold storage preserving holographic honey at peak quality', emoji: '❄️', maxLevel: 10, baseCapacity: 100, baseEnergyMultiplier: 0.5, baseUpgradeCost: 180 },
  { id: 'neural_nexus', name: 'Neural Nexus', description: 'Central intelligence hub coordinating all hive activity', emoji: '🧠', maxLevel: 10, baseCapacity: 30, baseEnergyMultiplier: 1.2, baseUpgradeCost: 250 },
  { id: 'photon_array', name: 'Photon Array', description: 'Massive solar collector converting light into hive energy', emoji: '☀️', maxLevel: 10, baseCapacity: 45, baseEnergyMultiplier: 1.4, baseUpgradeCost: 220 },
  { id: 'laser_forge', name: 'Laser Forge', description: 'High-intensity laser workshop for crafting insect upgrades', emoji: '🔥', maxLevel: 10, baseCapacity: 35, baseEnergyMultiplier: 1.1, baseUpgradeCost: 170 },
];

export const NH_NECTARS: NectarDef[] = [
  { id: 'plasma_dew', name: 'Plasma Dew', nectarValue: 8, energyValue: 5, rarity: 'common', neonColor: 'neon_pink', description: 'Basic plasma-infused dew from neon comb cells', emoji: '💧', requiredLevel: 1 },
  { id: 'data_pollen', name: 'Data Pollen', nectarValue: 6, energyValue: 8, rarity: 'common', neonColor: 'electric_cyan', description: 'Binary-encoded pollen grains from circuit ants', emoji: '🔬', requiredLevel: 1 },
  { id: 'holo_ambrosia', name: 'Holo Ambrosia', nectarValue: 10, energyValue: 6, rarity: 'common', neonColor: 'holo_purple', description: 'Shimmering holographic nectar with prismatic taste', emoji: '🍯', requiredLevel: 1 },
  { id: 'spark_resin', name: 'Spark Resin', nectarValue: 7, energyValue: 4, rarity: 'common', neonColor: 'neon_pink', description: 'Sticky conductive resin used in comb construction', emoji: '🪵', requiredLevel: 1 },
  { id: 'byte_nectar', name: 'Byte Nectar', nectarValue: 5, energyValue: 10, rarity: 'common', neonColor: 'electric_cyan', description: 'Compressed data packets in liquid form', emoji: '💻', requiredLevel: 1 },
  { id: 'glow_sap', name: 'Glow Sap', nectarValue: 9, energyValue: 7, rarity: 'common', neonColor: 'laser_green', description: 'Bioluminescent tree sap harvested by glow moths', emoji: '🌲', requiredLevel: 1 },
  { id: 'neural_essence', name: 'Neural Essence', nectarValue: 12, energyValue: 9, rarity: 'unusual', neonColor: 'holo_purple', description: 'Concentrated neural fluid from hive brain matter', emoji: '🧪', requiredLevel: 5 },
  { id: 'plasma_royal_jelly', name: 'Plasma Royal Jelly', nectarValue: 18, energyValue: 12, rarity: 'unusual', neonColor: 'neon_pink', description: 'Electrified royal jelly used to breed superior insects', emoji: '👑', requiredLevel: 6 },
  { id: 'cryo_extract', name: 'Cryo Extract', nectarValue: 14, energyValue: 15, rarity: 'unusual', neonColor: 'electric_cyan', description: 'Flash-frozen nectar concentrate from cryo vaults', emoji: '🧊', requiredLevel: 7 },
  { id: 'photon_drops', name: 'Photon Drops', nectarValue: 16, energyValue: 11, rarity: 'unusual', neonColor: 'digital_yellow', description: 'Condensed light particles in liquid form', emoji: '✨', requiredLevel: 8 },
  { id: 'quantum_pollen', name: 'Quantum Pollen', nectarValue: 20, energyValue: 14, rarity: 'unusual', neonColor: 'holo_purple', description: 'Pollen that exists in superposition until observed', emoji: '⚛️', requiredLevel: 9 },
  { id: 'laser_crystal_nectar', name: 'Laser Crystal Nectar', nectarValue: 15, energyValue: 18, rarity: 'unusual', neonColor: 'laser_green', description: 'Nectar crystallized by laser forge beams', emoji: '💎', requiredLevel: 10 },
  { id: 'holographic_honey', name: 'Holographic Honey', nectarValue: 25, energyValue: 16, rarity: 'rare', neonColor: 'holo_purple', description: 'Pure holographic honey that shimmers with data patterns', emoji: '🔮', requiredLevel: 12 },
  { id: 'storm_nectar', name: 'Storm Nectar', nectarValue: 30, energyValue: 22, rarity: 'rare', neonColor: 'neon_pink', description: 'Electrically charged nectar harvested during plasma storms', emoji: '⛈️', requiredLevel: 14 },
  { id: 'entangled_dew', name: 'Entangled Dew', nectarValue: 22, energyValue: 28, rarity: 'rare', neonColor: 'electric_cyan', description: 'Quantum-entangled dew drops linked across dimensions', emoji: '🔗', requiredLevel: 15 },
  { id: 'neural_nectar', name: 'Neural Nectar', nectarValue: 28, energyValue: 20, rarity: 'rare', neonColor: 'holo_purple', description: 'Nectar infused with hive collective intelligence', emoji: '🧠', requiredLevel: 16 },
  { id: 'prism_pollen', name: 'Prism Pollen', nectarValue: 20, energyValue: 25, rarity: 'rare', neonColor: 'digital_yellow', description: 'Multi-colored pollen that splits light into energy', emoji: '🌈', requiredLevel: 17 },
  { id: 'cryo_slurry', name: 'Cryo Slurry', nectarValue: 26, energyValue: 30, rarity: 'rare', neonColor: 'electric_cyan', description: 'Ultra-cold energy slurry from deep vault storage', emoji: '🥶', requiredLevel: 18 },
  { id: 'photon_burst_nectar', name: 'Photon Burst Nectar', nectarValue: 32, energyValue: 24, rarity: 'rare', neonColor: 'digital_yellow', description: 'Explosively energetic nectar from photon array surges', emoji: '💥', requiredLevel: 19 },
  { id: 'railgun_resin', name: 'Railgun Resin', nectarValue: 24, energyValue: 35, rarity: 'rare', neonColor: 'laser_green', description: 'Super-dense resin magnetically accelerated to maximum potency', emoji: '🔫', requiredLevel: 20 },
  { id: 'supernova_syrup', name: 'Supernova Syrup', nectarValue: 40, energyValue: 35, rarity: 'epic', neonColor: 'digital_yellow', description: 'Energy-dense syrup from a controlled stellar explosion', emoji: '🌟', requiredLevel: 25 },
  { id: 'neuro_weave_honey', name: 'Neuro Weave Honey', nectarValue: 38, energyValue: 40, rarity: 'epic', neonColor: 'holo_purple', description: 'Honey threaded with neural filaments of pure thought', emoji: '🧬', requiredLevel: 27 },
  { id: 'disintegration_jelly', name: 'Disintegration Jelly', nectarValue: 45, energyValue: 38, rarity: 'epic', neonColor: 'laser_green', description: 'Jelly that destabilizes molecular bonds to release energy', emoji: '💀', requiredLevel: 29 },
  { id: 'absolute_zero_nectar', name: 'Absolute Zero Nectar', nectarValue: 42, energyValue: 50, rarity: 'epic', neonColor: 'electric_cyan', description: 'Nectar at absolute zero, storing infinite potential energy', emoji: '🏔️', requiredLevel: 31 },
  { id: 'storm_sovereign_jelly', name: 'Storm Sovereign Jelly', nectarValue: 50, energyValue: 42, rarity: 'epic', neonColor: 'neon_pink', description: 'Royal jelly produced under a plasma storm sovereign', emoji: '👸', requiredLevel: 33 },
  { id: 'probability_honey', name: 'Probability Honey', nectarValue: 35, energyValue: 55, rarity: 'epic', neonColor: 'holo_purple', description: 'Honey whose properties shift depending on quantum observation', emoji: '🎲', requiredLevel: 35 },
  { id: 'empress_plasma', name: 'Empress Plasma Nectar', nectarValue: 60, energyValue: 55, rarity: 'legendary', neonColor: 'neon_pink', description: 'The rarest plasma nectar, touched by the Neon Apex Empress herself', emoji: '👸', requiredLevel: 40 },
  { id: 'omni_honey', name: 'Omni Honey', nectarValue: 55, energyValue: 60, rarity: 'legendary', neonColor: 'holo_purple', description: 'Honey distilled from the collective consciousness of all hives', emoji: '🌌', requiredLevel: 42 },
  { id: 'annihilation_resin', name: 'Annihilation Resin', nectarValue: 70, energyValue: 65, rarity: 'legendary', neonColor: 'laser_green', description: 'Resin from the Annihilator Beetle, pure destructive energy', emoji: '🗡️', requiredLevel: 44 },
  { id: 'quantum_god_dew', name: 'Quantum God Dew', nectarValue: 80, energyValue: 80, rarity: 'legendary', neonColor: 'electric_cyan', description: 'Dew from beyond spacetime itself, infinite energy potential', emoji: '♾️', requiredLevel: 48 },
];

export const NH_STRUCTURES: StructureDef[] = [
  { id: 'energy_conduit', name: 'Energy Conduit', description: 'Channels raw energy between hive sectors', emoji: '🔌', maxLevel: 10, category: 'energy', baseBonusValue: 5, baseUpgradeCost: 50 },
  { id: 'plasma_turret', name: 'Plasma Turret', description: 'Automated defense turret firing plasma bolts', emoji: '🔫', maxLevel: 10, category: 'defense', baseBonusValue: 8, baseUpgradeCost: 80 },
  { id: 'cryo_tank', name: 'Cryo Tank', description: 'Advanced storage tank for preserving nectar quality', emoji: '🧊', maxLevel: 10, category: 'storage', baseBonusValue: 10, baseUpgradeCost: 60 },
  { id: 'breeding_chamber', name: 'Breeding Chamber', description: 'Accelerated cyber-insect cloning and growth pod', emoji: '🧬', maxLevel: 10, category: 'breeding', baseBonusValue: 6, baseUpgradeCost: 70 },
  { id: 'harvester_drone', name: 'Harvester Drone Bay', description: 'Automated nectar harvesting drone deployment pad', emoji: '🤖', maxLevel: 10, category: 'harvest', baseBonusValue: 7, baseUpgradeCost: 65 },
  { id: 'neural_booster', name: 'Neural Booster', description: 'Enhances insect intelligence via neural link', emoji: '🧠', maxLevel: 10, category: 'breeding', baseBonusValue: 5, baseUpgradeCost: 90 },
  { id: 'shield_generator', name: 'Shield Generator', description: 'Projects a holographic energy shield around sectors', emoji: '🛡️', maxLevel: 10, category: 'defense', baseBonusValue: 10, baseUpgradeCost: 100 },
  { id: 'photon_collector', name: 'Photon Collector', description: 'Gathers ambient photon energy from the environment', emoji: '☀️', maxLevel: 10, category: 'energy', baseBonusValue: 8, baseUpgradeCost: 75 },
  { id: 'nectar_refinery', name: 'Nectar Refinery', description: 'Processes raw nectar into purified energy nectar', emoji: '🏭', maxLevel: 10, category: 'harvest', baseBonusValue: 9, baseUpgradeCost: 85 },
  { id: 'quantum_lock', name: 'Quantum Lock', description: 'Secures storage with quantum encryption protocols', emoji: '🔐', maxLevel: 10, category: 'defense', baseBonusValue: 7, baseUpgradeCost: 95 },
  { id: 'laser_grid', name: 'Laser Grid', description: 'Intricate laser network optimizing energy distribution', emoji: '⚡', maxLevel: 10, category: 'energy', baseBonusValue: 12, baseUpgradeCost: 110 },
  { id: 'cryo_accelerator', name: 'Cryo Accelerator', description: 'Speeds up breeding cycles with cryogenic flash-freezing', emoji: '❄️', maxLevel: 10, category: 'breeding', baseBonusValue: 8, baseUpgradeCost: 105 },
  { id: 'holo_projector', name: 'Holo Projector', description: 'Projects holographic decoys to confuse intruders', emoji: '🔮', maxLevel: 10, category: 'defense', baseBonusValue: 6, baseUpgradeCost: 70 },
  { id: 'energy_battery', name: 'Energy Battery', description: 'Stores excess energy for use during grid surges', emoji: '🔋', maxLevel: 10, category: 'storage', baseBonusValue: 11, baseUpgradeCost: 80 },
  { id: 'swarm_beacon', name: 'Swarm Beacon', description: 'Calls and coordinates swarm insects for mass operations', emoji: '📡', maxLevel: 10, category: 'harvest', baseBonusValue: 8, baseUpgradeCost: 90 },
  { id: 'plasma_injector', name: 'Plasma Injector', description: 'Injects plasma directly into nectar to boost purity', emoji: '💉', maxLevel: 10, category: 'harvest', baseBonusValue: 10, baseUpgradeCost: 100 },
  { id: 'neural_firewall', name: 'Neural Firewall', description: 'Protects hive from data corruption and cyber-attacks', emoji: '🧱', maxLevel: 10, category: 'defense', baseBonusValue: 12, baseUpgradeCost: 120 },
  { id: 'quantum_resonator', name: 'Quantum Resonator', description: 'Tunes energy frequencies for maximum output', emoji: '🎶', maxLevel: 10, category: 'energy', baseBonusValue: 15, baseUpgradeCost: 130 },
  { id: 'cryo_stasis_pod', name: 'Cryo Stasis Pod', description: 'Preserves rare insects indefinitely in cryo-sleep', emoji: '🛌', maxLevel: 10, category: 'storage', baseBonusValue: 9, baseUpgradeCost: 75 },
  { id: 'photon_beam_relay', name: 'Photon Beam Relay', description: 'Relays concentrated photon beams across sectors', emoji: '🔦', maxLevel: 10, category: 'energy', baseBonusValue: 10, baseUpgradeCost: 95 },
  { id: 'breeding_accelerator', name: 'Breeding Accelerator', description: 'Rapid-growth chamber for legendary insect eggs', emoji: '🥚', maxLevel: 10, category: 'breeding', baseBonusValue: 12, baseUpgradeCost: 140 },
  { id: 'neural_amplifier', name: 'Neural Amplifier', description: 'Amplifies the hive mind collective intelligence', emoji: '📣', maxLevel: 10, category: 'breeding', baseBonusValue: 9, baseUpgradeCost: 100 },
  { id: 'mega_storage_core', name: 'Mega Storage Core', description: 'Massive underground storage vault for all resources', emoji: '🏛️', maxLevel: 10, category: 'storage', baseBonusValue: 15, baseUpgradeCost: 150 },
  { id: 'ultimate_harvester', name: 'Ultimate Harvester', description: 'Apex harvesting unit with all nectar types supported', emoji: '🏆', maxLevel: 10, category: 'harvest', baseBonusValue: 14, baseUpgradeCost: 160 },
  { id: 'nexus_core', name: 'Nexus Core', description: 'The heart of the energy grid, connecting all systems', emoji: '💠', maxLevel: 10, category: 'energy', baseBonusValue: 20, baseUpgradeCost: 200 },
];

export const NH_ABILITIES: NeonAbilityDef[] = [
  { id: 'plasma_burst', name: 'Plasma Burst', description: 'Unleash a burst of plasma energy across all sectors', emoji: '💥', cooldown: 120, energyCost: 30, rarity: 'common', effectType: 'boost', effectValue: 1.5, requiredLevel: 1 },
  { id: 'cryo_shield', name: 'Cryo Shield', description: 'Activate a cryo-based defense barrier for 60 seconds', emoji: '🛡️', cooldown: 180, energyCost: 40, rarity: 'common', effectType: 'shield', effectValue: 0.5, requiredLevel: 2 },
  { id: 'neural_scan', name: 'Neural Scan', description: 'Scan all sectors for optimal energy hotspots', emoji: '🔍', cooldown: 60, energyCost: 15, rarity: 'common', effectType: 'special', effectValue: 2.0, requiredLevel: 3 },
  { id: 'photon_rush', name: 'Photon Rush', description: 'Speed up all insects by converting light to kinetic energy', emoji: '⚡', cooldown: 90, energyCost: 25, rarity: 'common', effectType: 'boost', effectValue: 2.0, requiredLevel: 4 },
  { id: 'data_drain', name: 'Data Drain', description: 'Drain energy from surrounding data streams', emoji: '🧲', cooldown: 150, energyCost: 35, rarity: 'unusual', effectType: 'drain', effectValue: 50, requiredLevel: 6 },
  { id: 'laser_focus', name: 'Laser Focus', description: 'Focus all laser insects on a single target for massive output', emoji: '🎯', cooldown: 120, energyCost: 30, rarity: 'unusual', effectType: 'boost', effectValue: 3.0, requiredLevel: 8 },
  { id: 'quantum_tunnel', name: 'Quantum Tunnel', description: 'Instantly transport insects between any two sectors', emoji: '🕳️', cooldown: 200, energyCost: 50, rarity: 'unusual', effectType: 'special', effectValue: 1.0, requiredLevel: 10 },
  { id: 'swarm_command', name: 'Swarm Command', description: 'Issue a mass command to all insects for coordinated action', emoji: '📣', cooldown: 180, energyCost: 45, rarity: 'unusual', effectType: 'boost', effectValue: 2.5, requiredLevel: 12 },
  { id: 'holo_decoy', name: 'Holo Decoy', description: 'Create holographic duplicates to distract threats', emoji: '🎭', cooldown: 90, energyCost: 20, rarity: 'unusual', effectType: 'shield', effectValue: 0.7, requiredLevel: 14 },
  { id: 'plasma_storm', name: 'Plasma Storm', description: 'Trigger a plasma storm that doubles all energy output', emoji: '🌩️', cooldown: 300, energyCost: 60, rarity: 'rare', effectType: 'boost', effectValue: 4.0, requiredLevel: 16 },
  { id: 'cryo_freeze_all', name: 'Cryo Freeze All', description: 'Flash-freeze all nectar to preserve maximum energy', emoji: '🥶', cooldown: 240, energyCost: 55, rarity: 'rare', effectType: 'heal', effectValue: 100, requiredLevel: 18 },
  { id: 'neural_overdrive', name: 'Neural Overdrive', description: 'Push all insects into neural overdrive for triple speed', emoji: '🧠', cooldown: 200, energyCost: 50, rarity: 'rare', effectType: 'boost', effectValue: 3.0, requiredLevel: 20 },
  { id: 'quantum_collapse', name: 'Quantum Collapse', description: 'Collapse quantum states to harvest bonus energy from all sectors', emoji: '🌀', cooldown: 360, energyCost: 70, rarity: 'rare', effectType: 'drain', effectValue: 200, requiredLevel: 22 },
  { id: 'photon_supernova', name: 'Photon Supernova', description: 'Trigger a photon supernova for massive area energy boost', emoji: '🌟', cooldown: 400, energyCost: 80, rarity: 'rare', effectType: 'boost', effectValue: 5.0, requiredLevel: 24 },
  { id: 'laser_maelstrom', name: 'Laser Maelstrom', description: 'Spin up a vortex of laser beams shredding all obstacles', emoji: '🌪️', cooldown: 300, energyCost: 65, rarity: 'rare', effectType: 'boost', effectValue: 4.5, requiredLevel: 26 },
  { id: 'emp_blast', name: 'EMP Blast', description: 'Discharge an electromagnetic pulse that paralyzes threats', emoji: '⚡', cooldown: 250, energyCost: 55, rarity: 'rare', effectType: 'shield', effectValue: 0.9, requiredLevel: 28 },
  { id: 'hive_mind_surge', name: 'Hive Mind Surge', description: 'Surge collective intelligence across the entire hive network', emoji: '🕸️', cooldown: 350, energyCost: 75, rarity: 'epic', effectType: 'boost', effectValue: 6.0, requiredLevel: 30 },
  { id: 'absolute_zero_field', name: 'Absolute Zero Field', description: 'Create a field of absolute zero freezing all activity', emoji: '❄️', cooldown: 300, energyCost: 60, rarity: 'epic', effectType: 'special', effectValue: 10.0, requiredLevel: 34 },
  { id: 'neural_domination', name: 'Neural Domination', description: 'Override neural networks of enemy insects', emoji: '💀', cooldown: 400, energyCost: 90, rarity: 'epic', effectType: 'drain', effectValue: 500, requiredLevel: 38 },
  { id: 'quantum_god_mode', name: 'Quantum God Mode', description: 'Enter a state of quantum omnipotence for 30 seconds', emoji: '♾️', cooldown: 600, energyCost: 100, rarity: 'legendary', effectType: 'boost', effectValue: 10.0, requiredLevel: 45 },
  { id: 'neon_apex_radiance', name: 'Neon Apex Radiance', description: 'Channel the Neon Apex Empress power across all sectors', emoji: '👸', cooldown: 500, energyCost: 80, rarity: 'legendary', effectType: 'boost', effectValue: 8.0, requiredLevel: 47 },
  { id: 'omni_harmony', name: 'Omni Harmony', description: 'Bring all hive systems into perfect harmonic resonance', emoji: '🎵', cooldown: 450, energyCost: 85, rarity: 'legendary', effectType: 'heal', effectValue: 1000, requiredLevel: 50 },
];

export const NH_QUESTS: NHQuestDef[] = [
  { id: 'quest_first_harvest', name: 'First Harvest', description: 'Harvest nectar from your first sector', type: 'harvest', target: 1, rewardCoins: 50, rewardXP: 25, requiredLevel: 1, emoji: '💧' },
  { id: 'quest_breed_5', name: 'Hatchery Online', description: 'Breed 5 cyber-insects', type: 'breed', target: 5, rewardCoins: 100, rewardXP: 50, requiredLevel: 1, emoji: '🧬' },
  { id: 'quest_earn_300', name: 'Energy Credits', description: 'Earn 300 coins total', type: 'harvest', target: 300, rewardCoins: 80, rewardXP: 40, requiredLevel: 2, emoji: '💰' },
  { id: 'quest_upgrade_5', name: 'Grid Expansion', description: 'Upgrade any structure to level 5', type: 'upgrade', target: 5, rewardCoins: 200, rewardXP: 100, requiredLevel: 6, emoji: '🔧' },
  { id: 'quest_swarm_10', name: 'Swarm Tactics', description: 'Execute 10 swarm commands', type: 'swarm', target: 10, rewardCoins: 150, rewardXP: 75, requiredLevel: 8, emoji: '📡' },
  { id: 'quest_harvest_25', name: 'Nectar Factory', description: 'Harvest nectar 25 times', type: 'harvest', target: 25, rewardCoins: 300, rewardXP: 150, requiredLevel: 12, emoji: '🏭' },
  { id: 'quest_energy_1000', name: 'Energy Tycoon', description: 'Generate 1000 total energy', type: 'energy', target: 1000, rewardCoins: 400, rewardXP: 200, requiredLevel: 15, emoji: '⚡' },
  { id: 'quest_rare_breed', name: 'Rare Genome', description: 'Breed a rare cyber-insect', type: 'breed', target: 1, rewardCoins: 350, rewardXP: 175, requiredLevel: 18, emoji: '💎' },
  { id: 'quest_grid_optimize', name: 'Grid Master', description: 'Optimize the energy grid 5 times', type: 'energy', target: 5, rewardCoins: 500, rewardXP: 250, requiredLevel: 22, emoji: '🌐' },
  { id: 'quest_master_swarm', name: 'Hive Mind', description: 'Complete 50 total swarm commands', type: 'swarm', target: 50, rewardCoins: 1000, rewardXP: 500, requiredLevel: 30, emoji: '👑' },
];

export const NH_ACHIEVEMENTS: NHAchievementDef[] = [
  { id: 'ach_first_harvest', name: 'First Drops', description: 'Harvest nectar for the first time', conditionKey: 'completedHarvests', targetValue: 1, rewardCoins: 10, rewardXP: 5, emoji: '💧' },
  { id: 'ach_harvest_25', name: 'Nectar Stream', description: 'Complete 25 nectar harvests', conditionKey: 'completedHarvests', targetValue: 25, rewardCoins: 100, rewardXP: 50, emoji: '🌊' },
  { id: 'ach_harvest_100', name: 'Energy Geyser', description: 'Complete 100 nectar harvests', conditionKey: 'completedHarvests', targetValue: 100, rewardCoins: 500, rewardXP: 250, emoji: '🏆' },
  { id: 'ach_breed_25', name: 'Gene Master', description: 'Breed 25 cyber-insects', conditionKey: 'completedBreeds', targetValue: 25, rewardCoins: 150, rewardXP: 75, emoji: '🧬' },
  { id: 'ach_breed_100', name: 'Cloning Facility', description: 'Breed 100 cyber-insects', conditionKey: 'completedBreeds', targetValue: 100, rewardCoins: 600, rewardXP: 300, emoji: '🏭' },
  { id: 'ach_earn_1000', name: 'Energy Barons', description: 'Earn 1000 coins total', conditionKey: 'totalEarned', targetValue: 1000, rewardCoins: 100, rewardXP: 50, emoji: '💰' },
  { id: 'ach_earn_10000', name: 'Neon Tycoon', description: 'Earn 10000 coins total', conditionKey: 'totalEarned', targetValue: 10000, rewardCoins: 1000, rewardXP: 500, emoji: '🤑' },
  { id: 'ach_level_10', name: 'Double Digits', description: 'Reach level 10', conditionKey: 'level', targetValue: 10, rewardCoins: 100, rewardXP: 50, emoji: '🔟' },
  { id: 'ach_level_25', name: 'Sector Commander', description: 'Reach level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 300, rewardXP: 150, emoji: '🌟' },
  { id: 'ach_level_50', name: 'Neon Supreme', description: 'Reach the maximum level', conditionKey: 'level', targetValue: 50, rewardCoins: 3000, rewardXP: 1500, emoji: '👑' },
  { id: 'ach_streak_7', name: 'Week Warrior', description: 'Maintain a 7-day daily streak', conditionKey: 'dailyStreak', targetValue: 7, rewardCoins: 150, rewardXP: 75, emoji: '📅' },
  { id: 'ach_streak_30', name: 'Monthly Devotee', description: 'Maintain a 30-day daily streak', conditionKey: 'dailyStreak', targetValue: 30, rewardCoins: 1000, rewardXP: 500, emoji: '🗓️' },
  { id: 'ach_swarm_25', name: 'Swarm Master', description: 'Execute 25 swarm commands', conditionKey: 'completedSwarmCommands', targetValue: 25, rewardCoins: 200, rewardXP: 100, emoji: '🐝' },
  { id: 'ach_swarm_100', name: 'Hive Overlord', description: 'Execute 100 swarm commands', conditionKey: 'completedSwarmCommands', targetValue: 100, rewardCoins: 800, rewardXP: 400, emoji: '🏰' },
  { id: 'ach_energy_5000', name: 'Power Surge', description: 'Generate 5000 total energy', conditionKey: 'totalEnergyHarvested', targetValue: 5000, rewardCoins: 400, rewardXP: 200, emoji: '⚡' },
  { id: 'ach_energy_50000', name: 'Energy God', description: 'Generate 50000 total energy', conditionKey: 'totalEnergyHarvested', targetValue: 50000, rewardCoins: 2000, rewardXP: 1000, emoji: '⚡' },
  { id: 'ach_grid_10', name: 'Grid Optimizer', description: 'Optimize the energy grid 10 times', conditionKey: 'gridOptimizations', targetValue: 10, rewardCoins: 300, rewardXP: 150, emoji: '🌐' },
  { id: 'ach_all_nectars', name: 'Nectar Connoisseur', description: 'Collect every type of nectar', conditionKey: 'nectarTypesCollected', targetValue: 30, rewardCoins: 2000, rewardXP: 1000, emoji: '🍯' },
];

export const NH_DAILY_QUEST_POOL: NHDailyQuestPoolDef[] = [
  { id: 'daily_harvest_3', name: 'Morning Harvest', description: 'Harvest nectar 3 times today', type: 'harvest', target: 3, rewardCoins: 30, rewardXP: 15, emoji: '💧' },
  { id: 'daily_harvest_8', name: 'Harvest Blitz', description: 'Harvest nectar 8 times today', type: 'harvest', target: 8, rewardCoins: 60, rewardXP: 30, emoji: '🔥' },
  { id: 'daily_breed_2', name: 'Daily Breeding', description: 'Breed 2 cyber-insects today', type: 'breed', target: 2, rewardCoins: 25, rewardXP: 12, emoji: '🧬' },
  { id: 'daily_breed_5', name: 'Breeding Frenzy', description: 'Breed 5 cyber-insects today', type: 'breed', target: 5, rewardCoins: 50, rewardXP: 25, emoji: '🥚' },
  { id: 'daily_upgrade_2', name: 'Structure Fix', description: 'Upgrade structures 2 times today', type: 'upgrade', target: 2, rewardCoins: 35, rewardXP: 18, emoji: '🔧' },
  { id: 'daily_upgrade_5', name: 'Upgrade Marathon', description: 'Upgrade structures 5 times today', type: 'upgrade', target: 5, rewardCoins: 70, rewardXP: 35, emoji: '🏗️' },
  { id: 'daily_swarm_3', name: 'Swarm Patrol', description: 'Execute 3 swarm commands today', type: 'swarm', target: 3, rewardCoins: 40, rewardXP: 20, emoji: '📡' },
  { id: 'daily_swarm_8', name: 'Swarm Blitz', description: 'Execute 8 swarm commands today', type: 'swarm', target: 8, rewardCoins: 80, rewardXP: 40, emoji: '🐝' },
];

// ============================================================
// Initial State Factory
// ============================================================

function createNeonHiveState(seed?: number): NeonHiveState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  return {
    level: 1,
    xp: 0,
    coins: 150,
    sectors: [
      { id: 'neon_comb', level: 1, capacity: 50, insectCount: 5, activeInsects: ['neon_drone', 'neon_drone', 'circuit_ant', 'pixel_beetle', 'glow_moth'], installedStructures: [], gridStatus: 'stable' },
    ],
    nectars: { plasma_dew: 3, data_pollen: 2, holo_ambrosia: 1, spark_resin: 2, byte_nectar: 1 },
    swarmQueue: [],
    dailyStreak: 0,
    lastDaily: null,
    activeQuests: [],
    completedQuests: [],
    unlockedAchievements: NH_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, unlockedAt: null })),
    dailyTask: null,
    structures: NH_STRUCTURES.map((s) => ({ id: s.id, level: 0, installedOn: null })),
    seed: effectiveSeed,
    totalEnergyHarvested: 0,
    totalNectarCollected: 0,
    totalEarned: 0,
    totalSpent: 0,
    completedBreeds: 0,
    completedHarvests: 0,
    completedSwarmCommands: 0,
    swarmCommandsExecuted: 0,
    gridOptimizations: 0,
    activeSectorId: 'neon_comb',
    insectCountByRarity: { common: 5, unusual: 0, rare: 0, epic: 0, legendary: 0 },
    unlockedInsects: ['neon_drone', 'circuit_ant', 'pixel_beetle', 'glow_moth', 'spark_fly', 'data_wasp', 'byte_bug'],
    unlockedAbilities: ['plasma_burst'],
    abilityCooldowns: [],
    nectarInventory: {},
    energyGridEfficiency: 1.0,
    structureUpgradeCount: 0,
    totalInsectsBred: 0,
    highestEnergyOutput: 0,
    activeAbilities: [],
  };
}

// ============================================================
// Quest Progress Helper
// ============================================================

function nhProcessQuestProgress(state: NeonHiveState, type: NHQuestType, amount: number): NeonHiveState {
  let updated = state;
  for (const aq of updated.activeQuests) {
    if (aq.completed) continue;
    const def = NH_QUESTS.find((q) => q.id === aq.id);
    if (!def || def.type !== type) continue;
    const newProgress = aq.progress + amount;
    if (newProgress >= def.target) {
      updated = {
        ...updated,
        activeQuests: updated.activeQuests.map((q) =>
          q.id === aq.id ? { ...q, progress: Math.min(newProgress, def.target), completed: true } : q
        ),
      };
    } else {
      updated = {
        ...updated,
        activeQuests: updated.activeQuests.map((q) =>
          q.id === aq.id ? { ...q, progress: newProgress } : q
        ),
      };
    }
  }
  return updated;
}

// ============================================================
// Achievement Checker
// ============================================================

function nhCheckAchievementConditions(state: NeonHiveState): string[] {
  const fresh: string[] = [];
  for (const ach of NH_ACHIEVEMENTS) {
    const existing = state.unlockedAchievements.find(a => a.id === ach.id);
    if (existing && existing.unlocked) {
      continue;
    }
    let met = false;
    if (ach.conditionKey === 'completedHarvests' && state.completedHarvests >= ach.targetValue) {
      met = true;
    }
    if (ach.conditionKey === 'completedBreeds' && state.completedBreeds >= ach.targetValue) {
      met = true;
    }
    if (ach.conditionKey === 'totalEarned' && state.totalEarned >= ach.targetValue) {
      met = true;
    }
    if (ach.conditionKey === 'level' && state.level >= ach.targetValue) {
      met = true;
    }
    if (ach.conditionKey === 'dailyStreak' && state.dailyStreak >= ach.targetValue) {
      met = true;
    }
    if (ach.conditionKey === 'completedSwarmCommands' && state.completedSwarmCommands >= ach.targetValue) {
      met = true;
    }
    if (ach.conditionKey === 'totalEnergyHarvested' && state.totalEnergyHarvested >= ach.targetValue) {
      met = true;
    }
    if (ach.conditionKey === 'gridOptimizations' && state.gridOptimizations >= ach.targetValue) {
      met = true;
    }
    if (ach.conditionKey === 'nectarTypesCollected') {
      const types = Object.entries(state.nectarInventory).filter(([, v]) => v > 0).length;
      if (types >= ach.targetValue) {
        met = true;
      }
    }
    if (met) {
      fresh.push(ach.id);
    }
  }
  return fresh;
}

// ============================================================
// Hook: useNeonHive
// ============================================================

export default function useNeonHive(initialSeed?: number) {
  const [state, setState] = useState<NeonHiveState>(() => createNeonHiveState(initialSeed));
  const prngRef = useRef<() => number>(nhMulberry32(state.seed));
  const stateRef = useRef(state);

  // Sync stateRef inside useEffect, not in render phase
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- Computed data via useMemo ----

  const nhTitle = useMemo((): string => {
    let current = NH_TITLE_THRESHOLDS[0].name;
    for (const t of NH_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) current = t.name;
    }
    return current;
  }, [state.level]);

  const nhProgress = useMemo((): number => {
    const needed = nhXPRequired(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const nhOverallProgress = useMemo((): number => {
    return state.level / NH_MAX_LEVEL;
  }, [state.level]);

  const nhTotalInsectCount = useMemo((): number => {
    let count = 0;
    for (const sector of state.sectors) {
      count += sector.insectCount;
    }
    return count;
  }, [state.sectors]);

  const nhEnergyPerTick = useMemo((): number => {
    let total = 0;
    for (const sector of state.sectors) {
      const sectorDef = NH_HIVE_SECTORS.find((s) => s.id === sector.id);
      if (!sectorDef) continue;
      const energyMult = sectorDef.baseEnergyMultiplier * (1 + (sector.level - 1) * 0.15);
      for (const insectId of sector.activeInsects) {
        const insectDef = NH_CYBER_INSECTS.find((i) => i.id === insectId);
        if (insectDef) {
          total += insectDef.energyOutput * energyMult;
        }
      }
    }
    return Math.floor(total * state.energyGridEfficiency);
  }, [state.sectors, state.energyGridEfficiency]);

  const nhActiveInsectsInSector = useMemo((): CyberInsectDef[] => {
    const sector = state.sectors.find((s) => s.id === state.activeSectorId);
    if (!sector) return [];
    const insects: CyberInsectDef[] = [];
    for (const insectId of sector.activeInsects) {
      const def = NH_CYBER_INSECTS.find((i) => i.id === insectId);
      if (def && !insects.find((existing) => existing.id === insectId)) {
        insects.push(def);
      }
    }
    return insects;
  }, [state.sectors, state.activeSectorId]);

  const nhUnlockedInsectDefs = useMemo((): CyberInsectDef[] => {
    return NH_CYBER_INSECTS.filter((s) => state.unlockedInsects.includes(s.id));
  }, [state.unlockedInsects]);

  const nhLockedInsectDefs = useMemo((): CyberInsectDef[] => {
    return NH_CYBER_INSECTS.filter((s) => !state.unlockedInsects.includes(s.id));
  }, [state.unlockedInsects]);

  // ---- Achievement auto-check via useEffect ----

  useEffect(() => {
    const newAchIds = nhCheckAchievementConditions(state);
    if (newAchIds.length === 0) return;
    setState((prev) => {
      const existing = new Set(prev.unlockedAchievements.filter(a => a.unlocked).map(a => a.id));
      const fresh = newAchIds.filter(id => !existing.has(id));
      if (fresh.length === 0) return prev;
      let bonusCoins = 0;
      let bonusXP = 0;
      for (const id of fresh) {
        const def = NH_ACHIEVEMENTS.find(a => a.id === id);
        if (def) {
          bonusCoins += def.rewardCoins;
          bonusXP += def.rewardXP;
        }
      }
      return {
        ...prev,
        unlockedAchievements: prev.unlockedAchievements.map(a =>
          fresh.includes(a.id) ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
        ),
        coins: nhClampCoins(prev.coins + bonusCoins),
        totalEarned: prev.totalEarned + bonusCoins,
      };
    });
  }, [state.level, state.completedHarvests, state.completedBreeds, state.totalEarned, state.dailyStreak, state.completedSwarmCommands, state.totalEnergyHarvested, state.gridOptimizations, state.nectarInventory]);

  // ---- Core State ----

  const nhGetState = useCallback((): Readonly<NeonHiveState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const nhResetState = useCallback((newSeed?: number) => {
    const s = createNeonHiveState(newSeed);
    prngRef.current = nhMulberry32(s.seed);
    setState(s);
  }, []);

  const nhSeed = useCallback((seed: number) => {
    prngRef.current = nhMulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const nhRandom = useCallback((): number => {
    return prngRef.current();
  }, []);

  const nhRandomInt = useCallback((min: number, max: number): number => {
    const rng = prngRef.current();
    return min + Math.floor(rng * (max - min + 1));
  }, []);

  const nhRandomChoice = useCallback(<T,>(arr: readonly T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(prngRef.current() * arr.length)];
  }, []);

  // ---- Level / XP ----

  const nhGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const nhGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const nhGetXPTillNext = useCallback((): number => {
    return nhXPRequired(state.level);
  }, [state.level]);

  const nhAddXP = useCallback((amount: number): NeonHiveState => {
    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += Math.floor(amount);
      while (level < NH_MAX_LEVEL && xp >= nhXPRequired(level)) {
        xp -= nhXPRequired(level);
        level += 1;
      }
      if (level >= NH_MAX_LEVEL) xp = 0;
      next = { ...prev, level: nhClampLevel(level), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Title ----

  const nhGetTitle = useCallback((): string => {
    return nhTitle;
  }, [nhTitle]);

  const nhGetAllTitles = useCallback((): NHTitleInfo[] => {
    return [...NH_TITLE_THRESHOLDS];
  }, []);

  const nhGetNextTitle = useCallback((): NHTitleInfo | null => {
    for (const t of NH_TITLE_THRESHOLDS) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const nhGetProgress = useCallback((): number => {
    return nhProgress;
  }, [nhProgress]);

  const nhGetOverallProgress = useCallback((): number => {
    return nhOverallProgress;
  }, [nhOverallProgress]);

  // ---- Coins ----

  const nhGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const nhAddCoins = useCallback((amount: number): NeonHiveState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: nhClampCoins(prev.coins + amount), totalEarned: prev.totalEarned + Math.max(0, amount) };
      return next;
    });
    return next;
  }, [state]);

  const nhSpendCoins = useCallback((amount: number): { success: boolean; state: NeonHiveState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: nhClampCoins(prev.coins - amount), totalSpent: prev.totalSpent + amount };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const nhCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Cyber Insects ----

  const nhGetAllInsects = useCallback((): CyberInsectDef[] => {
    return [...NH_CYBER_INSECTS];
  }, []);

  const nhGetInsectById = useCallback((id: string): CyberInsectDef | null => {
    return NH_CYBER_INSECTS.find((i) => i.id === id) ?? null;
  }, []);

  const nhGetUnlockedInsects = useCallback((): CyberInsectDef[] => {
    return [...nhUnlockedInsectDefs];
  }, [nhUnlockedInsectDefs]);

  const nhGetLockedInsects = useCallback((): CyberInsectDef[] => {
    return [...nhLockedInsectDefs];
  }, [nhLockedInsectDefs]);

  const nhUnlockInsect = useCallback((insectId: string, cost: number): { success: boolean; state: NeonHiveState } => {
    const def = NH_CYBER_INSECTS.find((i) => i.id === insectId);
    if (!def) return { success: false, state };
    if (state.unlockedInsects.includes(insectId)) return { success: false, state };
    if (state.coins < cost) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        unlockedInsects: [...prev.unlockedInsects, insectId],
        coins: nhClampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const nhGetInsectsInSector = useCallback((sectorId: string): CyberInsectDef[] => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    if (!sector) return [];
    const insects: CyberInsectDef[] = [];
    for (const insectId of sector.activeInsects) {
      const def = NH_CYBER_INSECTS.find((i) => i.id === insectId);
      if (def && !insects.find((existing) => existing.id === insectId)) {
        insects.push(def);
      }
    }
    return insects;
  }, [state.sectors]);

  const nhGetTotalInsectCount = useCallback((): number => {
    return nhTotalInsectCount;
  }, [nhTotalInsectCount]);

  const nhGetInsectCountByRarity = useCallback((): Record<NeonRarity, number> => {
    return { ...state.insectCountByRarity };
  }, [state.insectCountByRarity]);

  // ---- Hive Sectors ----

  const nhGetSectors = useCallback((): HiveSectorDef[] => {
    return [...NH_HIVE_SECTORS];
  }, []);

  const nhGetSectorStates = useCallback((): SectorState[] => {
    return [...state.sectors];
  }, [state.sectors]);

  const nhGetActiveSector = useCallback((): SectorState | null => {
    return state.sectors.find((s) => s.id === state.activeSectorId) ?? null;
  }, [state.sectors, state.activeSectorId]);

  const nhSetActiveSector = useCallback((sectorId: string): NeonHiveState => {
    if (!state.sectors.find((s) => s.id === sectorId)) return state;
    let next = state;
    setState((prev) => {
      next = { ...prev, activeSectorId: sectorId };
      return next;
    });
    return next;
  }, [state]);

  const nhGetSectorLevel = useCallback((sectorId: string): number => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    return sector?.level ?? 0;
  }, [state.sectors]);

  const nhGetSectorCapacity = useCallback((sectorId: string): number => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    if (!sector) return 0;
    const def = NH_HIVE_SECTORS.find((d) => d.id === sectorId);
    if (!def) return sector.capacity;
    return def.baseCapacity + (sector.level - 1) * 10;
  }, [state.sectors]);

  const nhGetSectorEnergyMultiplier = useCallback((sectorId: string): number => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    if (!sector) return 1;
    const def = NH_HIVE_SECTORS.find((d) => d.id === sectorId);
    if (!def) return 1;
    return def.baseEnergyMultiplier * (1 + (sector.level - 1) * 0.15);
  }, [state.sectors]);

  const nhAddSector = useCallback((sectorTypeId: string): { success: boolean; state: NeonHiveState } => {
    const def = NH_HIVE_SECTORS.find((s) => s.id === sectorTypeId);
    if (!def) return { success: false, state };
    if (state.sectors.find((s) => s.id === sectorTypeId)) return { success: false, state };
    if (state.coins < def.baseUpgradeCost) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newSector: SectorState = {
        id: sectorTypeId,
        level: 1,
        capacity: def.baseCapacity,
        insectCount: 0,
        activeInsects: [],
        installedStructures: [],
        gridStatus: 'stable',
      };
      next = {
        ...prev,
        sectors: [...prev.sectors, newSector],
        coins: nhClampCoins(prev.coins - def.baseUpgradeCost),
        totalSpent: prev.totalSpent + def.baseUpgradeCost,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const nhUpgradeSector = useCallback((sectorId: string): { success: boolean; cost: number; state: NeonHiveState } => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    const def = NH_HIVE_SECTORS.find((d) => d.id === sectorId);
    if (!def || !sector) return { success: false, cost: 0, state };
    if (sector.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.4, sector.level));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const newCapacity = def.baseCapacity + (sector.level) * 10;
      next = {
        ...prev,
        sectors: prev.sectors.map((s) =>
          s.id === sectorId ? { ...s, level: s.level + 1, capacity: newCapacity } : s
        ),
        coins: nhClampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Nectar ----

  const nhGetNectars = useCallback((): NectarDef[] => {
    return [...NH_NECTARS];
  }, []);

  const nhGetNectarById = useCallback((id: string): NectarDef | null => {
    return NH_NECTARS.find((n) => n.id === id) ?? null;
  }, []);

  const nhGetNectarInventory = useCallback((): Record<string, number> => {
    return { ...state.nectarInventory };
  }, [state.nectarInventory]);

  const nhGetNectarCount = useCallback((): number => {
    return Object.values(state.nectarInventory).reduce((sum, v) => sum + v, 0);
  }, [state.nectarInventory]);

  const nhGetAvailableNectars = useCallback((): NectarDef[] => {
    return NH_NECTARS.filter((n) => n.requiredLevel <= state.level);
  }, [state.level]);

  const nhBuyNectar = useCallback((nectarId: string, qty: number): { success: boolean; totalCost: number; state: NeonHiveState } => {
    const def = NH_NECTARS.find((n) => n.id === nectarId);
    if (!def) return { success: false, totalCost: 0, state };
    if (def.requiredLevel > state.level) return { success: false, totalCost: 0, state };
    const unitCost = Math.floor(def.nectarValue * 1.2);
    const totalCost = unitCost * qty;
    if (state.coins < totalCost) return { success: false, totalCost, state };
    let next = state;
    setState((prev) => {
      const currentQty = prev.nectarInventory[nectarId] ?? 0;
      next = {
        ...prev,
        nectarInventory: { ...prev.nectarInventory, [nectarId]: currentQty + qty },
        coins: nhClampCoins(prev.coins - totalCost),
        totalSpent: prev.totalSpent + totalCost,
      };
      return next;
    });
    return { success: true, totalCost, state: next };
  }, [state]);

  // ---- Harvesting ----

  const nhHarvest = useCallback((sectorId: string, nectarId: string): { success: boolean; energy: number; nectarQty: number; coinsEarned: number; xpEarned: number; state: NeonHiveState } => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    const nectarDef = NH_NECTARS.find((n) => n.id === nectarId);
    if (!sector || !nectarDef) return { success: false, energy: 0, nectarQty: 0, coinsEarned: 0, xpEarned: 0, state };
    if (sector.insectCount === 0) return { success: false, energy: 0, nectarQty: 0, coinsEarned: 0, xpEarned: 0, state };
    const have = state.nectarInventory[nectarId] ?? 0;
    if (have < 1) return { success: false, energy: 0, nectarQty: 0, coinsEarned: 0, xpEarned: 0, state };

    const energyMult = nhGetSectorEnergyMultiplier(sectorId);
    let totalEnergy = 0;
    for (const insectId of sector.activeInsects) {
      const insectDef = NH_CYBER_INSECTS.find((i) => i.id === insectId);
      if (insectDef) {
        totalEnergy += insectDef.energyOutput * energyMult;
      }
    }
    totalEnergy = Math.floor(totalEnergy * state.energyGridEfficiency);
    const nectarQty = Math.max(1, Math.floor(totalEnergy / 20));
    const coinsEarned = Math.floor(totalEnergy * 0.5);
    const xpEarned = Math.floor(totalEnergy * nhRarityMultiplier(nectarDef.rarity) * 0.3);

    let next = state;
    setState((prev) => {
      const newNectar = (prev.nectarInventory[nectarId] ?? 1) - 1;
      const updated = {
        ...prev,
        nectarInventory: { ...prev.nectarInventory, [nectarId]: newNectar },
        coins: nhClampCoins(prev.coins + coinsEarned),
        totalEarned: prev.totalEarned + coinsEarned,
        totalEnergyHarvested: prev.totalEnergyHarvested + totalEnergy,
        totalNectarCollected: prev.totalNectarCollected + nectarQty,
        completedHarvests: prev.completedHarvests + 1,
        highestEnergyOutput: Math.max(prev.highestEnergyOutput, totalEnergy),
      };
      next = nhProcessQuestProgress(updated, 'harvest', 1);
      return next;
    });
    return { success: true, energy: totalEnergy, nectarQty, coinsEarned, xpEarned, state: next };
  }, [state, nhGetSectorEnergyMultiplier]);

  // ---- Breeding ----

  const nhBreedInsect = useCallback((parentAId: string, parentBId: string): { success: boolean; offspring: CyberInsectDef | null; state: NeonHiveState } => {
    if (!state.unlockedInsects.includes(parentAId)) return { success: false, offspring: null, state };
    if (!state.unlockedInsects.includes(parentBId)) return { success: false, offspring: null, state };
    const parentA = NH_CYBER_INSECTS.find((i) => i.id === parentAId);
    const parentB = NH_CYBER_INSECTS.find((i) => i.id === parentBId);
    if (!parentA || !parentB) return { success: false, offspring: null, state };

    const breedCost = Math.floor(50 * nhRarityMultiplier(parentA.rarity) + 50 * nhRarityMultiplier(parentB.rarity));
    if (state.coins < breedCost) return { success: false, offspring: null, state };

    // Determine offspring rarity
    const roll = prngRef.current();
    let offspringRarity: NeonRarity = 'common';
    if (roll < 0.02) offspringRarity = 'legendary';
    else if (roll < 0.08) offspringRarity = 'epic';
    else if (roll < 0.22) offspringRarity = 'rare';
    else if (roll < 0.50) offspringRarity = 'unusual';

    // Determine neon type based on parents
    const parentTypes: NeonType[] = [parentA.neonType, parentB.neonType];
    const rng = prngRef.current();
    const offspringType = rng < 0.5 ? parentTypes[0] : parentTypes[1];

    // Pick a random insect of that rarity/type combination
    const candidates = NH_CYBER_INSECTS.filter(
      (i) => i.rarity === offspringRarity && i.neonType === offspringType
    );
    let offspring: CyberInsectDef;
    if (candidates.length > 0) {
      const idx = Math.floor(prngRef.current() * candidates.length);
      offspring = candidates[idx];
    } else {
      const fallback = NH_CYBER_INSECTS.filter((i) => i.rarity === offspringRarity);
      if (fallback.length > 0) {
        const idx = Math.floor(prngRef.current() * fallback.length);
        offspring = fallback[idx];
      } else {
        offspring = NH_CYBER_INSECTS[0];
      }
    }

    const wasNew = !state.unlockedInsects.includes(offspring.id);
    const sector = state.sectors.find((s) => s.id === state.activeSectorId);
    const capacity = nhGetSectorCapacity(state.activeSectorId);
    if (sector && sector.insectCount < capacity) {
      let next = state;
      setState((prev) => {
        const newUnlocked = wasNew ? [...prev.unlockedInsects, offspring.id] : prev.unlockedInsects;
        const newCountByRarity = { ...prev.insectCountByRarity };
        newCountByRarity[offspring.rarity] = (newCountByRarity[offspring.rarity] ?? 0) + 1;
        const updated = {
          ...prev,
          unlockedInsects: newUnlocked,
          insectCountByRarity: newCountByRarity,
          coins: nhClampCoins(prev.coins - breedCost),
          totalSpent: prev.totalSpent + breedCost,
          completedBreeds: prev.completedBreeds + 1,
          totalInsectsBred: prev.totalInsectsBred + 1,
          sectors: prev.sectors.map((s) =>
            s.id === prev.activeSectorId
              ? { ...s, insectCount: s.insectCount + 1, activeInsects: [...s.activeInsects, offspring.id] }
              : s
          ),
        };
        next = nhProcessQuestProgress(updated, 'breed', 1);
        return next;
      });
      return { success: true, offspring, state: next };
    }

    // No capacity - unlock but don't place
    let next = state;
    setState((prev) => {
      const newUnlocked = wasNew ? [...prev.unlockedInsects, offspring.id] : prev.unlockedInsects;
      const newCountByRarity = { ...prev.insectCountByRarity };
      newCountByRarity[offspring.rarity] = (newCountByRarity[offspring.rarity] ?? 0) + 1;
      const updated = {
        ...prev,
        unlockedInsects: newUnlocked,
        insectCountByRarity: newCountByRarity,
        coins: nhClampCoins(prev.coins - breedCost),
        totalSpent: prev.totalSpent + breedCost,
        completedBreeds: prev.completedBreeds + 1,
        totalInsectsBred: prev.totalInsectsBred + 1,
      };
      next = nhProcessQuestProgress(updated, 'breed', 1);
      return next;
    });
    return { success: true, offspring, state: next };
  }, [state, nhGetSectorCapacity]);

  // ---- Swarm Command ----

  const nhDeploySwarm = useCallback((sectorId: string, insectIds: string[], duration: number): { success: boolean; job: SwarmJob | null; state: NeonHiveState } => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    if (!sector) return { success: false, job: null, state };
    if (sector.insectCount === 0) return { success: false, job: null, state };
    if (state.swarmQueue.length >= 5) return { success: false, job: null, state };
    const alreadyActive = state.swarmQueue.some((j) => j.sectorId === sectorId);
    if (alreadyActive) return { success: false, job: null, state };

    const energyMult = nhGetSectorEnergyMultiplier(sectorId);
    let energyYield = 0;
    let nectarYield = 0;
    for (const id of insectIds) {
      const def = NH_CYBER_INSECTS.find((i) => i.id === id);
      if (def) {
        energyYield += def.energyOutput * energyMult * duration;
        nectarYield += Math.floor(def.speed * duration * 0.5);
      }
    }
    energyYield = Math.floor(energyYield * state.energyGridEfficiency);
    nectarYield = Math.floor(nectarYield);

    const now = Date.now();
    const job: SwarmJob = {
      id: `swarm_${sectorId}_${now}`,
      sectorId,
      insectIds,
      startedAt: now,
      endsAt: now + duration * 1000,
      energyYield,
      nectarYield,
    };

    let next = state;
    setState((prev) => ({
      ...prev,
      swarmQueue: [...prev.swarmQueue, job],
    }));
    return { success: true, job, state: next };
  }, [state, nhGetSectorEnergyMultiplier]);

  const nhGetSwarmQueue = useCallback((): SwarmJob[] => {
    return [...state.swarmQueue];
  }, [state.swarmQueue]);

  const nhCollectSwarm = useCallback((jobId: string, now: number): { success: boolean; energy: number; nectar: number; xpEarned: number; state: NeonHiveState } => {
    const job = state.swarmQueue.find((j) => j.id === jobId);
    if (!job) return { success: false, energy: 0, nectar: 0, xpEarned: 0, state };
    if (now < job.endsAt) return { success: false, energy: 0, nectar: 0, xpEarned: 0, state };

    const xpEarned = Math.floor(job.energyYield * 0.2 + job.nectarYield * 0.1);
    let next = state;
    setState((prev) => {
      const updated = {
        ...prev,
        swarmQueue: prev.swarmQueue.filter((j) => j.id !== jobId),
        coins: nhClampCoins(prev.coins + Math.floor(job.energyYield * 0.3)),
        totalEarned: prev.totalEarned + Math.floor(job.energyYield * 0.3),
        totalEnergyHarvested: prev.totalEnergyHarvested + job.energyYield,
        totalNectarCollected: prev.totalNectarCollected + job.nectarYield,
        completedSwarmCommands: prev.completedSwarmCommands + 1,
        swarmCommandsExecuted: prev.swarmCommandsExecuted + 1,
      };
      next = nhProcessQuestProgress(updated, 'swarm', 1);
      return next;
    });
    return { success: true, energy: job.energyYield, nectar: job.nectarYield, xpEarned, state: next };
  }, [state]);

  const nhCancelSwarm = useCallback((jobId: string): { success: boolean; state: NeonHiveState } => {
    const idx = state.swarmQueue.findIndex((j) => j.id === jobId);
    if (idx === -1) return { success: false, state };
    let next = state;
    setState((prev) => ({
      ...prev,
      swarmQueue: prev.swarmQueue.filter((j) => j.id !== jobId),
    }));
    return { success: true, state: next };
  }, [state]);

  // ---- Structures ----

  const nhGetStructures = useCallback((): StructureDef[] => {
    return [...NH_STRUCTURES];
  }, []);

  const nhGetStructureStates = useCallback((): StructureState[] => {
    return [...state.structures];
  }, [state.structures]);

  const nhGetStructureLevel = useCallback((structureId: string): number => {
    const st = state.structures.find((s) => s.id === structureId);
    return st?.level ?? 0;
  }, [state.structures]);

  const nhGetStructureBonus = useCallback((structureId: string): number => {
    const st = state.structures.find((s) => s.id === structureId);
    const def = NH_STRUCTURES.find((d) => d.id === structureId);
    if (!def || !st) return 0;
    return def.baseBonusValue * st.level;
  }, [state.structures]);

  const nhUpgradeStructure = useCallback((structureId: string): { success: boolean; cost: number; state: NeonHiveState } => {
    const def = NH_STRUCTURES.find((d) => d.id === structureId);
    const st = state.structures.find((s) => s.id === structureId);
    if (!def || !st) return { success: false, cost: 0, state };
    if (st.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, st.level));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const updated = {
        ...prev,
        structures: prev.structures.map((s) =>
          s.id === structureId ? { ...s, level: s.level + 1, installedOn: prev.activeSectorId } : s
        ),
        coins: nhClampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
        structureUpgradeCount: prev.structureUpgradeCount + 1,
      };
      next = nhProcessQuestProgress(updated, 'upgrade', 1);
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Energy Grid ----

  const nhGetEnergyGridEfficiency = useCallback((): number => {
    return state.energyGridEfficiency;
  }, [state.energyGridEfficiency]);

  const nhOptimizeGrid = useCallback((): { efficiency: number; state: NeonHiveState } => {
    const boost = 0.05 + prngRef.current() * 0.1;
    const newEff = Math.min(3.0, state.energyGridEfficiency + boost);
    let next = state;
    setState((prev) => {
      const updated = {
        ...prev,
        energyGridEfficiency: newEff,
        gridOptimizations: prev.gridOptimizations + 1,
      };
      next = nhProcessQuestProgress(updated, 'energy', 1);
      return next;
    });
    return { efficiency: newEff, state: next };
  }, [state]);

  const nhGetEnergyPerTick = useCallback((): number => {
    return nhEnergyPerTick;
  }, [nhEnergyPerTick]);

  const nhGetGridStatus = useCallback((sectorId: string): GridStatus => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    if (!sector) return 'stable';
    if (sector.gridStatus === 'critical') return 'critical';
    if (sector.gridStatus === 'surging') return 'surging';
    if (sector.gridStatus === 'overloaded') return 'overloaded';
    return 'stable';
  }, [state.sectors]);

  const nhSetGridStatus = useCallback((sectorId: string, status: GridStatus): { success: boolean; state: NeonHiveState } => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    if (!sector) return { success: false, state };
    let next = state;
    setState((prev) => ({
      ...prev,
      sectors: prev.sectors.map((s) =>
        s.id === sectorId ? { ...s, gridStatus: status } : s
      ),
    }));
    return { success: true, state: next };
  }, [state]);

  // ---- Neon Abilities ----

  const nhGetAbilities = useCallback((): NeonAbilityDef[] => {
    return [...NH_ABILITIES];
  }, []);

  const nhGetAbilityById = useCallback((id: string): NeonAbilityDef | null => {
    return NH_ABILITIES.find((a) => a.id === id) ?? null;
  }, []);

  const nhGetUnlockedAbilities = useCallback((): NeonAbilityDef[] => {
    return NH_ABILITIES.filter((a) => state.unlockedAbilities.includes(a.id));
  }, [state.unlockedAbilities]);

  const nhGetLockedAbilities = useCallback((): NeonAbilityDef[] => {
    return NH_ABILITIES.filter((a) => !state.unlockedAbilities.includes(a.id) && a.requiredLevel <= state.level);
  }, [state.unlockedAbilities, state.level]);

  const nhUnlockAbility = useCallback((abilityId: string): { success: boolean; state: NeonHiveState } => {
    const def = NH_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return { success: false, state };
    if (state.unlockedAbilities.includes(abilityId)) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => ({
      ...prev,
      unlockedAbilities: [...prev.unlockedAbilities, abilityId],
    }));
    return { success: true, state: next };
  }, [state]);

  const nhActivateAbility = useCallback((abilityId: string, now: number): { success: boolean; effectValue: number; state: NeonHiveState } => {
    const def = NH_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return { success: false, effectValue: 0, state };
    if (!state.unlockedAbilities.includes(abilityId)) return { success: false, effectValue: 0, state };

    const cooldown = state.abilityCooldowns.find((c) => c.abilityId === abilityId);
    if (cooldown && now < cooldown.readyAt) return { success: false, effectValue: 0, state };

    let next = state;
    setState((prev) => {
      const newCooldown: AbilityCooldown = {
        abilityId,
        lastUsedAt: now,
        readyAt: now + def.cooldown * 1000,
      };
      const existing = prev.abilityCooldowns.filter((c) => c.abilityId !== abilityId);
      return {
        ...prev,
        abilityCooldowns: [...existing, newCooldown],
        activeAbilities: [...prev.activeAbilities, abilityId],
      };
    });
    return { success: true, effectValue: def.effectValue, state: next };
  }, [state]);

  const nhGetAbilityCooldown = useCallback((abilityId: string, now: number): number => {
    const cd = state.abilityCooldowns.find((c) => c.abilityId === abilityId);
    if (!cd) return 0;
    if (now >= cd.readyAt) return 0;
    return Math.ceil((cd.readyAt - now) / 1000);
  }, [state.abilityCooldowns]);

  const nhIsAbilityReady = useCallback((abilityId: string, now: number): boolean => {
    const cd = state.abilityCooldowns.find((c) => c.abilityId === abilityId);
    if (!cd) return true;
    return now >= cd.readyAt;
  }, [state.abilityCooldowns]);

  // ---- Quests ----

  const nhGetQuests = useCallback((): NHQuestDef[] => {
    return [...NH_QUESTS];
  }, []);

  const nhGetActiveQuests = useCallback((): (QuestState & NHQuestDef)[] => {
    return state.activeQuests.map((aq) => {
      const def = NH_QUESTS.find((q) => q.id === aq.id);
      if (!def) return { ...aq, name: '', description: '', type: 'harvest' as NHQuestType, target: 0, rewardCoins: 0, rewardXP: 0, requiredLevel: 0, emoji: '' };
      return { ...aq, ...def };
    });
  }, [state.activeQuests]);

  const nhGetAvailableQuests = useCallback((): NHQuestDef[] => {
    return NH_QUESTS.filter(
      (q) => q.requiredLevel <= state.level
        && !state.activeQuests.some((aq) => aq.id === q.id)
        && !state.completedQuests.includes(q.id)
    );
  }, [state.activeQuests, state.completedQuests, state.level]);

  const nhGetCompletedQuests = useCallback((): NHQuestDef[] => {
    return NH_QUESTS.filter((q) => state.completedQuests.includes(q.id));
  }, [state.completedQuests]);

  const nhAcceptQuest = useCallback((questId: string): { success: boolean; state: NeonHiveState } => {
    const def = NH_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.activeQuests.some((q) => q.id === questId)) return { success: false, state };
    if (state.completedQuests.includes(questId)) return { success: false, state };
    if (state.activeQuests.length >= 5) return { success: false, state };
    let next = state;
    setState((prev) => ({
      ...prev,
      activeQuests: [...prev.activeQuests, { id: questId, accepted: true, completed: false, progress: 0 }],
    }));
    return { success: true, state: next };
  }, [state]);

  const nhCompleteQuest = useCallback((questId: string): { success: boolean; rewardCoins: number; rewardXP: number; state: NeonHiveState } => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    const def = NH_QUESTS.find((q) => q.id === questId);
    if (!aq || !def || !aq.completed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        activeQuests: prev.activeQuests.filter((q) => q.id !== questId),
        completedQuests: [...prev.completedQuests, questId],
        coins: nhClampCoins(prev.coins + def.rewardCoins),
        totalEarned: prev.totalEarned + def.rewardCoins,
      };
      return next;
    });
    nhAddXP(def.rewardXP);
    return { success: true, rewardCoins: def.rewardCoins, rewardXP: def.rewardXP, state: next };
  }, [state, nhAddXP]);

  const nhAbandonQuest = useCallback((questId: string): { success: boolean; state: NeonHiveState } => {
    const idx = state.activeQuests.findIndex((q) => q.id === questId);
    if (idx === -1) return { success: false, state };
    let next = state;
    setState((prev) => ({
      ...prev,
      activeQuests: prev.activeQuests.filter((q) => q.id !== questId),
    }));
    return { success: true, state: next };
  }, [state]);

  // ---- Achievements ----

  const nhGetAchievements = useCallback((): NHAchievementDef[] => {
    return [...NH_ACHIEVEMENTS];
  }, []);

  const nhGetUnlockedAchievements = useCallback((): NHAchievementDef[] => {
    return NH_ACHIEVEMENTS.filter((a) =>
      state.unlockedAchievements.find((ua) => ua.id === a.id && ua.unlocked)
    );
  }, [state.unlockedAchievements]);

  const nhIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    const ach = state.unlockedAchievements.find((a) => a.id === achievementId);
    if (!ach) return false;
    return ach.unlocked;
  }, [state.unlockedAchievements]);

  // ---- Daily Tasks ----

  const nhGetDailyTask = useCallback((): NHDailyTaskState | null => {
    return state.dailyTask;
  }, [state.dailyTask]);

  const nhRefreshDailyTask = useCallback((now: number): { dailyTask: NHDailyTaskState | null; state: NeonHiveState } => {
    const dayKey = nhGenerateDayKey(now);
    if (state.dailyTask && state.dailyTask.dayKey === dayKey) {
      return { dailyTask: state.dailyTask, state };
    }
    const poolIdx = Math.floor(prngRef.current() * NH_DAILY_QUEST_POOL.length);
    const pool = NH_DAILY_QUEST_POOL[poolIdx];
    if (!pool) return { dailyTask: null, state };
    const task: NHDailyTaskState = { poolId: pool.id, progress: 0, claimed: false, dayKey };
    let next = state;
    setState((prev) => {
      let newStreak = prev.dailyStreak;
      if (prev.lastDaily && prev.lastDaily !== dayKey) {
        const lastDate = new Date(parseInt(prev.lastDaily.replace(/-/g, ','))).getTime();
        const dayDiff = Math.floor((now - lastDate) / 86400000);
        if (dayDiff <= 1) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      } else if (!prev.lastDaily) {
        newStreak = 1;
      }
      next = { ...prev, dailyTask: task, lastDaily: dayKey, dailyStreak: newStreak };
      return next;
    });
    return { dailyTask: task, state: next };
  }, [state]);

  const nhClaimDailyReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: NeonHiveState } => {
    if (!state.dailyTask || state.dailyTask.claimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const poolDef = NH_DAILY_QUEST_POOL.find((p) => p.id === state.dailyTask.poolId);
    if (!poolDef) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    if (state.dailyTask.progress < poolDef.target) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        dailyTask: prev.dailyTask ? { ...prev.dailyTask, claimed: true } : null,
        coins: nhClampCoins(prev.coins + poolDef.rewardCoins),
        totalEarned: prev.totalEarned + poolDef.rewardCoins,
      };
      return next;
    });
    nhAddXP(poolDef.rewardXP);
    return { success: true, rewardCoins: poolDef.rewardCoins, rewardXP: poolDef.rewardXP, state: next };
  }, [state, nhAddXP]);

  const nhProgressDailyTask = useCallback((amount: number): NeonHiveState => {
    if (!state.dailyTask || state.dailyTask.claimed) return state;
    let next = state;
    setState((prev) => {
      if (!prev.dailyTask) return prev;
      next = {
        ...prev,
        dailyTask: { ...prev.dailyTask, progress: prev.dailyTask.progress + amount },
      };
      return next;
    });
    return next;
  }, [state]);

  const nhGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  const nhGetLastDaily = useCallback((): string | null => {
    return state.lastDaily;
  }, [state.lastDaily]);

  const nhGetDailyQuestPool = useCallback((): NHDailyQuestPoolDef[] => {
    return [...NH_DAILY_QUEST_POOL];
  }, []);

  // ---- Stats ----

  const nhGetStats = useCallback((): Record<string, number> => {
    return {
      level: state.level,
      xp: state.xp,
      coins: state.coins,
      totalEnergyHarvested: state.totalEnergyHarvested,
      totalNectarCollected: state.totalNectarCollected,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      completedBreeds: state.completedBreeds,
      completedHarvests: state.completedHarvests,
      completedSwarmCommands: state.completedSwarmCommands,
      swarmCommandsExecuted: state.swarmCommandsExecuted,
      gridOptimizations: state.gridOptimizations,
      structureUpgradeCount: state.structureUpgradeCount,
      totalInsectsBred: state.totalInsectsBred,
      highestEnergyOutput: state.highestEnergyOutput,
      sectorCount: state.sectors.length,
      activeAbilityCount: state.activeAbilities.length,
      unlockedInsectCount: state.unlockedInsects.length,
      unlockedAbilityCount: state.unlockedAbilities.length,
      nectarTypesOwned: Object.values(state.nectarInventory).filter((v) => v > 0).length,
      energyGridEfficiency: Math.floor(state.energyGridEfficiency * 100),
    };
  }, [state]);

  // ---- Insect Placement ----

  const nhAddInsectToSector = useCallback((insectId: string, sectorId: string): { success: boolean; state: NeonHiveState } => {
    const def = NH_CYBER_INSECTS.find((i) => i.id === insectId);
    const sector = state.sectors.find((s) => s.id === sectorId);
    if (!def || !sector) return { success: false, state };
    if (!state.unlockedInsects.includes(insectId)) return { success: false, state };
    const capacity = nhGetSectorCapacity(sectorId);
    if (sector.insectCount >= capacity) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newCountByRarity = { ...prev.insectCountByRarity };
      newCountByRarity[def.rarity] = (newCountByRarity[def.rarity] ?? 0) + 1;
      next = {
        ...prev,
        insectCountByRarity: newCountByRarity,
        sectors: prev.sectors.map((s) =>
          s.id === sectorId
            ? { ...s, insectCount: s.insectCount + 1, activeInsects: [...s.activeInsects, insectId] }
            : s
        ),
      };
      return next;
    });
    return { success: true, state: next };
  }, [state, nhGetSectorCapacity]);

  const nhRemoveInsectFromSector = useCallback((insectId: string, sectorId: string): { success: boolean; state: NeonHiveState } => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    if (!sector) return { success: false, state };
    const idx = sector.activeInsects.indexOf(insectId);
    if (idx === -1) return { success: false, state };
    const def = NH_CYBER_INSECTS.find((i) => i.id === insectId);
    let next = state;
    setState((prev) => {
      const newInsects = [...sector.activeInsects];
      newInsects.splice(idx, 1);
      const newCountByRarity = { ...prev.insectCountByRarity };
      if (def) {
        newCountByRarity[def.rarity] = Math.max(0, (newCountByRarity[def.rarity] ?? 0) - 1);
      }
      next = {
        ...prev,
        insectCountByRarity: newCountByRarity,
        sectors: prev.sectors.map((s) =>
          s.id === sectorId
            ? { ...s, insectCount: s.insectCount - 1, activeInsects: newInsects }
            : s
        ),
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const nhTransferInsect = useCallback((insectId: string, fromSectorId: string, toSectorId: string): { success: boolean; state: NeonHiveState } => {
    if (fromSectorId === toSectorId) return { success: false, state };
    const fromSector = state.sectors.find((s) => s.id === fromSectorId);
    const toSector = state.sectors.find((s) => s.id === toSectorId);
    if (!fromSector || !toSector) return { success: false, state };
    if (!fromSector.activeInsects.includes(insectId)) return { success: false, state };
    const toCapacity = nhGetSectorCapacity(toSectorId);
    if (toSector.insectCount >= toCapacity) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        sectors: prev.sectors.map((s) => {
          if (s.id === fromSectorId) {
            return { ...s, insectCount: s.insectCount - 1, activeInsects: s.activeInsects.filter((id) => id !== insectId) };
          }
          if (s.id === toSectorId) {
            return { ...s, insectCount: s.insectCount + 1, activeInsects: [...s.activeInsects, insectId] };
          }
          return s;
        }),
      };
      return next;
    });
    return { success: true, state: next };
  }, [state, nhGetSectorCapacity]);

  // ---- Sell Nectar ----

  const nhSellNectar = useCallback((nectarId: string, amount: number): { success: boolean; coinsEarned: number; state: NeonHiveState } => {
    const def = NH_NECTARS.find((n) => n.id === nectarId);
    if (!def) return { success: false, coinsEarned: 0, state };
    const have = state.nectarInventory[nectarId] ?? 0;
    if (have < amount) return { success: false, coinsEarned: 0, state };
    const coinsEarned = Math.floor(def.nectarValue * amount * nhRarityMultiplier(def.rarity) * 0.8);
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        nectarInventory: { ...prev.nectarInventory, [nectarId]: have - amount },
        coins: nhClampCoins(prev.coins + coinsEarned),
        totalEarned: prev.totalEarned + coinsEarned,
      };
      return next;
    });
    return { success: true, coinsEarned, state: next };
  }, [state]);

  // ---- Sector Inspection ----

  const nhInspectSector = useCallback((sectorId: string): { sectorId: string; level: number; capacity: number; insectCount: number; gridStatus: GridStatus; energyMultiplier: number; installedStructures: string[]; insects: CyberInsectDef[] } | null => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    if (!sector) return null;
    const sectorDef = NH_HIVE_SECTORS.find((d) => d.id === sectorId);
    const energyMultiplier = sectorDef
      ? sectorDef.baseEnergyMultiplier * (1 + (sector.level - 1) * 0.15)
      : 1;
    const insects: CyberInsectDef[] = [];
    for (const insectId of sector.activeInsects) {
      const def = NH_CYBER_INSECTS.find((i) => i.id === insectId);
      if (def && !insects.find((existing) => existing.id === insectId)) {
        insects.push(def);
      }
    }
    return {
      sectorId: sector.id,
      level: sector.level,
      capacity: sector.capacity,
      insectCount: sector.insectCount,
      gridStatus: sector.gridStatus,
      energyMultiplier,
      installedStructures: sector.installedStructures,
      insects,
    };
  }, [state.sectors]);

  // ---- Mass Operations ----

  const nhCollectAllSwarms = useCallback((now: number): { results: { jobId: string; success: boolean; energy: number; nectar: number; xpEarned: number }[]; state: NeonHiveState } => {
    const results: { jobId: string; success: boolean; energy: number; nectar: number; xpEarned: number }[] = [];
    let currentState = state;
    for (const job of currentState.swarmQueue) {
      if (now < job.endsAt) {
        results.push({ jobId: job.id, success: false, energy: 0, nectar: 0, xpEarned: 0 });
        continue;
      }
      const xpEarned = Math.floor(job.energyYield * 0.2 + job.nectarYield * 0.1);
      results.push({ jobId: job.id, success: true, energy: job.energyYield, nectar: job.nectarYield, xpEarned });
      currentState = {
        ...currentState,
        swarmQueue: currentState.swarmQueue.filter((j) => j.id !== job.id),
        coins: nhClampCoins(currentState.coins + Math.floor(job.energyYield * 0.3)),
        totalEarned: currentState.totalEarned + Math.floor(job.energyYield * 0.3),
        totalEnergyHarvested: currentState.totalEnergyHarvested + job.energyYield,
        totalNectarCollected: currentState.totalNectarCollected + job.nectarYield,
        completedSwarmCommands: currentState.completedSwarmCommands + 1,
        swarmCommandsExecuted: currentState.swarmCommandsExecuted + 1,
      };
    }
    setState(currentState);
    return { results, state: currentState };
  }, [state]);

  const nhOptimizeAllGrids = useCallback((): { improvements: { sectorId: string; oldStatus: GridStatus; newStatus: GridStatus }[]; state: NeonHiveState } => {
    const improvements: { sectorId: string; oldStatus: GridStatus; newStatus: GridStatus }[] = [];
    let next = state;
    setState((prev) => {
      const newSectors = prev.sectors.map((sector) => {
        let newStatus = sector.gridStatus;
        if (sector.gridStatus === 'critical') newStatus = 'surging';
        else if (sector.gridStatus === 'surging') newStatus = 'overloaded';
        else if (sector.gridStatus === 'overloaded') newStatus = 'stable';
        if (newStatus !== sector.gridStatus) {
          improvements.push({ sectorId: sector.id, oldStatus: sector.gridStatus, newStatus });
          return { ...sector, gridStatus: newStatus };
        }
        return sector;
      });
      const effBoost = improvements.length * 0.02;
      next = {
        ...prev,
        sectors: newSectors,
        energyGridEfficiency: Math.min(3.0, prev.energyGridEfficiency + effBoost),
        gridOptimizations: prev.gridOptimizations + improvements.length,
      };
      return next;
    });
    return { improvements, state: next };
  }, [state]);

  // ---- Breed Cost Calculator ----

  const nhGetBreedCost = useCallback((parentAId: string, parentBId: string): number => {
    const parentA = NH_CYBER_INSECTS.find((i) => i.id === parentAId);
    const parentB = NH_CYBER_INSECTS.find((i) => i.id === parentBId);
    if (!parentA || !parentB) return 0;
    return Math.floor(50 * nhRarityMultiplier(parentA.rarity) + 50 * nhRarityMultiplier(parentB.rarity));
  }, []);

  // ---- Sector Upgrade Cost Calculator ----

  const nhGetSectorUpgradeCost = useCallback((sectorId: string): number => {
    const sector = state.sectors.find((s) => s.id === sectorId);
    const def = NH_HIVE_SECTORS.find((d) => d.id === sectorId);
    if (!def || !sector) return 0;
    if (sector.level >= def.maxLevel) return 0;
    return Math.floor(def.baseUpgradeCost * Math.pow(1.4, sector.level));
  }, [state.sectors]);

  // ---- Structure Upgrade Cost Calculator ----

  const nhGetStructureUpgradeCost = useCallback((structureId: string): number => {
    const def = NH_STRUCTURES.find((d) => d.id === structureId);
    const st = state.structures.find((s) => s.id === structureId);
    if (!def || !st) return 0;
    if (st.level >= def.maxLevel) return 0;
    return Math.floor(def.baseUpgradeCost * Math.pow(1.5, st.level));
  }, [state.structures]);

  // ---- Total Grid Power ----

  const nhGetTotalGridPower = useCallback((): number => {
    let total = 0;
    for (const sector of state.sectors) {
      const def = NH_HIVE_SECTORS.find((d) => d.id === sector.id);
      if (!def) continue;
      total += def.baseEnergyMultiplier * (1 + (sector.level - 1) * 0.15) * 100;
    }
    return Math.floor(total * state.energyGridEfficiency);
  }, [state.sectors, state.energyGridEfficiency]);

  // ---- Insects by Neon Type ----

  const nhGetInsectsByNeonType = useCallback((neonType: NeonType): CyberInsectDef[] => {
    return NH_CYBER_INSECTS.filter((i) => i.neonType === neonType);
  }, []);

  // ---- Insects by Rarity ----

  const nhGetInsectsByRarity = useCallback((rarity: NeonRarity): CyberInsectDef[] => {
    return NH_CYBER_INSECTS.filter((i) => i.rarity === rarity);
  }, []);

  // ---- Structures by Category ----

  const nhGetStructuresByCategory = useCallback((category: StructureDef['category']): StructureDef[] => {
    return NH_STRUCTURES.filter((s) => s.category === category);
  }, []);

  // ---- Abilities by Effect Type ----

  const nhGetAbilitiesByEffect = useCallback((effectType: NeonAbilityDef['effectType']): NeonAbilityDef[] => {
    return NH_ABILITIES.filter((a) => a.effectType === effectType);
  }, []);

  // ---- Abilities by Rarity ----

  const nhGetAbilitiesByRarity = useCallback((rarity: NeonRarity): NeonAbilityDef[] => {
    return NH_ABILITIES.filter((a) => a.rarity === rarity);
  }, []);

  // ---- Nectars by Color ----

  const nhGetNectarsByColor = useCallback((color: NeonColor): NectarDef[] => {
    return NH_NECTARS.filter((n) => n.neonColor === color);
  }, []);

  // ---- Color Theme ----

  const nhGetColors = useCallback((): Record<NeonColor, string> => {
    return { ...NH_COLORS };
  }, []);

  const nhGetRarityColor = useCallback((rarity: NeonRarity): string => {
    const info = NH_RARITIES.find((r) => r.key === rarity);
    return info?.color ?? '#9CA3AF';
  }, []);

  // ---- Return API ----

  return {
    // Core
    nhGetState,
    nhResetState,
    nhSeed,
    nhRandom,
    nhRandomInt,
    nhRandomChoice,
    // Level / XP
    nhGetLevel,
    nhGetXP,
    nhGetXPTillNext,
    nhAddXP,
    // Title
    nhGetTitle,
    nhGetAllTitles,
    nhGetNextTitle,
    // Progress
    nhGetProgress,
    nhGetOverallProgress,
    // Coins
    nhGetCoins,
    nhAddCoins,
    nhSpendCoins,
    nhCanAfford,
    // Cyber Insects
    nhGetAllInsects,
    nhGetInsectById,
    nhGetUnlockedInsects,
    nhGetLockedInsects,
    nhUnlockInsect,
    nhGetInsectsInSector,
    nhGetTotalInsectCount,
    nhGetInsectCountByRarity,
    // Hive Sectors
    nhGetSectors,
    nhGetSectorStates,
    nhGetActiveSector,
    nhSetActiveSector,
    nhGetSectorLevel,
    nhGetSectorCapacity,
    nhGetSectorEnergyMultiplier,
    nhAddSector,
    nhUpgradeSector,
    // Nectar
    nhGetNectars,
    nhGetNectarById,
    nhGetNectarInventory,
    nhGetNectarCount,
    nhGetAvailableNectars,
    nhBuyNectar,
    // Harvesting
    nhHarvest,
    // Breeding
    nhBreedInsect,
    // Swarm Command
    nhDeploySwarm,
    nhGetSwarmQueue,
    nhCollectSwarm,
    nhCancelSwarm,
    // Structures
    nhGetStructures,
    nhGetStructureStates,
    nhGetStructureLevel,
    nhGetStructureBonus,
    nhUpgradeStructure,
    // Energy Grid
    nhGetEnergyGridEfficiency,
    nhOptimizeGrid,
    nhGetEnergyPerTick,
    nhGetGridStatus,
    nhSetGridStatus,
    // Neon Abilities
    nhGetAbilities,
    nhGetAbilityById,
    nhGetUnlockedAbilities,
    nhGetLockedAbilities,
    nhUnlockAbility,
    nhActivateAbility,
    nhGetAbilityCooldown,
    nhIsAbilityReady,
    // Quests
    nhGetQuests,
    nhGetActiveQuests,
    nhGetAvailableQuests,
    nhGetCompletedQuests,
    nhAcceptQuest,
    nhCompleteQuest,
    nhAbandonQuest,
    // Achievements
    nhGetAchievements,
    nhGetUnlockedAchievements,
    nhIsAchievementUnlocked,
    // Daily Tasks
    nhGetDailyTask,
    nhRefreshDailyTask,
    nhClaimDailyReward,
    nhProgressDailyTask,
    nhGetDailyStreak,
    nhGetLastDaily,
    nhGetDailyQuestPool,
    // Stats
    nhGetStats,
    // Color Theme
    nhGetColors,
    nhGetRarityColor,
    // Insect Placement
    nhAddInsectToSector,
    nhRemoveInsectFromSector,
    nhTransferInsect,
    // Sell Nectar
    nhSellNectar,
    // Sector Inspection
    nhInspectSector,
    // Mass Operations
    nhCollectAllSwarms,
    nhOptimizeAllGrids,
    // Calculators
    nhGetBreedCost,
    nhGetSectorUpgradeCost,
    nhGetStructureUpgradeCost,
    // Grid Power
    nhGetTotalGridPower,
    // Filtered Data
    nhGetInsectsByNeonType,
    nhGetInsectsByRarity,
    nhGetStructuresByCategory,
    nhGetAbilitiesByEffect,
    nhGetAbilitiesByRarity,
    nhGetNectarsByColor,
    // Computed
    nhTitle,
    nhProgress,
    nhOverallProgress,
    nhTotalInsectCount,
    nhEnergyPerTick,
    nhActiveInsectsInSector,
    nhUnlockedInsectDefs,
    nhLockedInsectDefs,
  };
}
