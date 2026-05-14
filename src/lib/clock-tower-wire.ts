'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// =============================================================================
// Clock Tower — Temporal Clockwork Wire
// Wind clocks, craft gears, manipulate time, explore floors,
// build inventions, manage paradoxes, and ascend the tower.
// All exported functions use `ct` prefix. Constants use `CT_` prefix.
// Color theme: amber / gold / bronze tones.
// =============================================================================

// =============================================================================
// Types
// =============================================================================

export type CTRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type CTGearMaterial = 'brass' | 'silver' | 'crystal' | 'gold' | 'platinum' | 'obsidian' | 'mythril' | 'chronium'
export type CTEnchantmentType = 'none' | 'haste' | 'freeze' | 'reverse' | 'loop' | 'phase'
export type CTFloorId =
  | 'entrance_hall'
  | 'gear_room'
  | 'pendulum_chamber'
  | 'bell_tower'
  | 'time_vault'
  | 'chrono_lab'
  | 'eternity_room'
  | 'apex_observatory'
export type CTInventionCategory = 'tool' | 'weapon' | 'accessory' | 'mount' | 'utility'
export type CTCreatureBehavior = 'patrol' | 'guard' | 'companion' | 'trader' | 'puzzle'
export type CTTimeEffect = 'accelerate' | 'decelerate' | 'freeze' | 'rewind' | 'loop' | 'shift'
export type CTQuestStatus = 'available' | 'active' | 'completed' | 'failed'

export interface CTRarityDef {
  key: CTRarity
  label: string
  color: string
  xpMultiplier: number
}

export interface CTGearDef {
  id: string
  name: string
  rarity: CTRarity
  size: 'tiny' | 'small' | 'medium' | 'large' | 'massive'
  material: CTGearMaterial
  precision: number
  enchantment: CTEnchantmentType
  description: string
  emoji: string
  requiredLevel: number
  craftCost: number
}

export interface CTFloorDef {
  id: CTFloorId
  name: string
  description: string
  emoji: string
  unlockLevel: number
  explorationXp: number
  dangerLevel: number
  floorColor: string
}

export interface CTTimeStoneDef {
  id: string
  name: string
  rarity: CTRarity
  timeEffect: CTTimeEffect
  power: number
  cooldown: number
  description: string
  emoji: string
  requiredLevel: number
}

export interface CTInventionDef {
  id: string
  name: string
  rarity: CTRarity
  category: CTInventionCategory
  requiredGears: { gearId: string; amount: number }[]
  requiredStones: { stoneId: string; amount: number }[]
  buildTime: number
  xpReward: number
  description: string
  emoji: string
  requiredLevel: number
  effect: string
}

export interface CTCreatureDef {
  id: string
  name: string
  rarity: CTRarity
  behavior: CTCreatureBehavior
  health: number
  power: number
  description: string
  emoji: string
  requiredLevel: number
  tamingCost: number
  specialAbility: string
}

export interface CTTitleDef {
  name: string
  levelRequired: number
  description: string
}

export interface CTAchievementDef {
  id: string
  name: string
  description: string
  conditionKey: string
  targetValue: number
  rewardXp: number
  rewardCoins: number
  emoji: string
}

export interface CTClockDef {
  id: string
  name: string
  floorId: CTFloorId
  windXp: number
  windCoins: number
  cooldownMinutes: number
  description: string
  emoji: string
  requiredLevel: number
}

export interface CTQuestDef {
  id: string
  name: string
  description: string
  targetValue: number
  rewardXp: number
  rewardCoins: number
  requiredLevel: number
  emoji: string
  conditionKey: string
}

// State types

export interface CTGearInventory {
  gearId: string
  amount: number
}

export interface CTStoneInventory {
  stoneId: string
  amount: number
}

export interface CTInventionState {
  inventionId: string
  built: boolean
  builtAt: number | null
  upgrades: number
}

export interface CTCreatureState {
  creatureId: string
  tamed: boolean
  tamedAt: number | null
  active: boolean
}

export interface CTFloorState {
  id: CTFloorId
  explored: boolean
  explorationCount: number
  secretsFound: number
  maxSecrets: number
}

export interface CTClockState {
  id: string
  woundAt: number | null
  windCount: number
}

export interface CTAchievementState {
  id: string
  unlocked: boolean
  unlockedAt: number | null
}

export interface CTQuestState {
  id: string
  status: CTQuestStatus
  progress: number
}

export interface CTParadoxEvent {
  id: string
  type: 'minor' | 'major' | 'catastrophic'
  description: string
  occurredAt: number
  resolved: boolean
}

export interface CTClockTowerState {
  level: number
  xp: number
  totalXp: number
  coins: number
  totalCoinsEarned: number
  totalCoinsSpent: number
  gears: Record<string, number>
  stones: Record<string, number>
  inventions: CTInventionState[]
  creatures: CTCreatureState[]
  floors: CTFloorState[]
  clocks: CTClockState[]
  achievements: CTAchievementState[]
  quests: CTQuestState[]
  paradoxes: CTParadoxEvent[]
  title: string
  paradoxMeter: number
  maxParadoxMeter: number
  timeEnergy: number
  maxTimeEnergy: number
  totalClocksWound: number
  totalGearsCrafted: number
  totalInventionsBuilt: number
  totalCreaturesTamed: number
  totalFloorsExplored: number
  totalParadoxesResolved: number
  totalTimeManipulations: number
  totalSecretsFound: number
  streak: number
  bestStreak: number
  lastPlayDate: string | null
  dailyDate: string | null
  dailyClocksWound: number
  activeFloor: CTFloorId
  gearCraftCountByRarity: Record<CTRarity, number>
  inventionBuildCountByRarity: Record<CTRarity, number>
}

// =============================================================================
// XP Curve Helpers
// =============================================================================

export const CT_MAX_LEVEL = 50

function ctXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= CT_MAX_LEVEL) return Infinity
  return Math.floor(110 * level * (1 + level * 0.13))
}

export const CT_XP_TABLE: number[] = []
for (let i = 0; i <= CT_MAX_LEVEL; i++) {
  CT_XP_TABLE.push(ctXpRequiredForLevel(i))
}

function ctClampLevel(lvl: number): number {
  return Math.max(1, Math.min(CT_MAX_LEVEL, lvl))
}

function ctGenerateDayKey(now: number): string {
  const d = new Date(now)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function ctRarityMultiplier(r: CTRarity): number {
  const map: Record<CTRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3.5,
    legendary: 6,
  }
  return map[r] ?? 1
}

// =============================================================================
// Constants: Rarity (amber / gold / bronze tones)
// =============================================================================

export const CT_RARITY_COMMON: CTRarity = 'common'
export const CT_RARITY_UNCOMMON: CTRarity = 'uncommon'
export const CT_RARITY_RARE: CTRarity = 'rare'
export const CT_RARITY_EPIC: CTRarity = 'epic'
export const CT_RARITY_LEGENDARY: CTRarity = 'legendary'

export const CT_RARITIES: CTRarityDef[] = [
  { key: 'common', label: 'Common', color: '#A1887F', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#FFB74D', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#FFD54F', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#FF8F00', xpMultiplier: 3.5 },
  { key: 'legendary', label: 'Legendary', color: '#FFD700', xpMultiplier: 6 },
]

// =============================================================================
// Constants: Gears (35 clockwork mechanisms)
// =============================================================================

export const CT_GEARS: CTGearDef[] = [
  // Common gears (7)
  { id: 'brass_gear', name: 'Brass Gear', rarity: 'common', size: 'small', material: 'brass', precision: 12, enchantment: 'none', description: 'A standard brass gear, the backbone of any clockwork device', emoji: '⚙️', requiredLevel: 1, craftCost: 10 },
  { id: 'copper_sprocket', name: 'Copper Sprocket', rarity: 'common', size: 'tiny', material: 'brass', precision: 8, enchantment: 'none', description: 'A small copper sprocket that transfers motion between shafts', emoji: '🔩', requiredLevel: 1, craftCost: 8 },
  { id: 'iron_pinion', name: 'Iron Pinion', rarity: 'common', size: 'tiny', material: 'brass', precision: 10, enchantment: 'none', description: 'A pinion gear that meshes with larger wheels to change speed', emoji: '⚙️', requiredLevel: 1, craftCost: 8 },
  { id: 'tin_cog', name: 'Tin Cog', rarity: 'common', size: 'tiny', material: 'brass', precision: 6, enchantment: 'none', description: 'A lightweight tin cog for delicate mechanisms', emoji: '⚙️', requiredLevel: 2, craftCost: 6 },
  { id: 'bronze_ratchet', name: 'Bronze Ratchet', rarity: 'common', size: 'small', material: 'brass', precision: 14, enchantment: 'none', description: 'A ratcheting gear that allows motion in only one direction', emoji: '⚙️', requiredLevel: 2, craftCost: 12 },
  { id: 'steel_crown', name: 'Steel Crown Wheel', rarity: 'common', size: 'medium', material: 'brass', precision: 15, enchantment: 'none', description: 'A crown-shaped gear that engages with a vertical pinion', emoji: '⚙️', requiredLevel: 3, craftCost: 15 },
  { id: 'zinc_worm', name: 'Zinc Worm Gear', rarity: 'common', size: 'small', material: 'brass', precision: 11, enchantment: 'none', description: 'A worm gear that provides high gear reduction in a compact form', emoji: '⚙️', requiredLevel: 3, craftCost: 11 },
  // Uncommon gears (7)
  { id: 'silver_pendulum', name: 'Silver Pendulum', rarity: 'uncommon', size: 'medium', material: 'silver', precision: 22, enchantment: 'none', description: 'A polished silver pendulum that swings with perfect rhythm', emoji: '🕐', requiredLevel: 5, craftCost: 30 },
  { id: 'nickel_escapement', name: 'Nickel Escapement', rarity: 'uncommon', size: 'small', material: 'silver', precision: 25, enchantment: 'none', description: 'A precision escapement that controls the release of energy in a clock', emoji: '⏱️', requiredLevel: 6, craftCost: 35 },
  { id: 'electrum_flywheel', name: 'Electrum Flywheel', rarity: 'uncommon', size: 'large', material: 'silver', precision: 20, enchantment: 'haste', description: 'A gold-silver alloy flywheel enchanted to spin faster than normal', emoji: '⚙️', requiredLevel: 7, craftCost: 40 },
  { id: 'sterling_spring', name: 'Sterling Spring Coil', rarity: 'uncommon', size: 'small', material: 'silver', precision: 24, enchantment: 'none', description: 'A tightly coiled sterling spring that stores mechanical energy', emoji: '🌀', requiredLevel: 8, craftCost: 32 },
  { id: 'pewter_bearing', name: 'Pewter Bearing', rarity: 'uncommon', size: 'tiny', material: 'silver', precision: 18, enchantment: 'none', description: 'A smooth pewter bearing that reduces friction in gear trains', emoji: '⚙️', requiredLevel: 8, craftCost: 28 },
  { id: 'argent_lantern', name: 'Argent Lantern Gear', rarity: 'uncommon', size: 'medium', material: 'silver', precision: 23, enchantment: 'freeze', description: 'A silver gear that emits a chilling light when in motion', emoji: '⚙️', requiredLevel: 9, craftCost: 38 },
  { id: 'moonstone_arbor', name: 'Moonstone Arbor', rarity: 'uncommon', size: 'small', material: 'silver', precision: 21, enchantment: 'none', description: 'An arbor shaft set with tiny moonstones that glow softly at night', emoji: '⚙️', requiredLevel: 10, craftCost: 36 },
  // Rare gears (7)
  { id: 'crystal_escapement', name: 'Crystal Escapement', rarity: 'rare', size: 'medium', material: 'crystal', precision: 38, enchantment: 'reverse', description: 'A crystalline escapement that can briefly reverse the flow of time', emoji: '💎', requiredLevel: 12, craftCost: 80 },
  { id: 'golden_balance', name: 'Golden Balance Wheel', rarity: 'rare', size: 'medium', material: 'gold', precision: 35, enchantment: 'haste', description: 'A golden wheel that balances time forces, accelerating nearby mechanisms', emoji: '🌟', requiredLevel: 14, craftCost: 90 },
  { id: 'sapphire_cylinder', name: 'Sapphire Cylinder', rarity: 'rare', size: 'large', material: 'crystal', precision: 40, enchantment: 'freeze', description: 'A sapphire-encrusted cylinder that can freeze small areas in time', emoji: '💠', requiredLevel: 15, craftCost: 95 },
  { id: 'ruby_piston', name: 'Ruby Piston', rarity: 'rare', size: 'small', material: 'crystal', precision: 36, enchantment: 'none', description: 'A ruby-tipped piston that drives clockwork with incredible force', emoji: '🔴', requiredLevel: 16, craftCost: 85 },
  { id: 'amber_dial', name: 'Amber Dial Mechanism', rarity: 'rare', size: 'medium', material: 'gold', precision: 33, enchantment: 'loop', description: 'A warm amber dial that causes time to repeat within its radius', emoji: '🟠', requiredLevel: 17, craftCost: 88 },
  { id: 'topaz_chime', name: 'Topaz Chime Gear', rarity: 'rare', size: 'medium', material: 'crystal', precision: 34, enchantment: 'none', description: 'A topaz-studded gear that chimes with temporal harmonics', emoji: '🔶', requiredLevel: 18, craftCost: 82 },
  { id: 'jade_turbin', name: 'Jade Turbine', rarity: 'rare', size: 'large', material: 'crystal', precision: 37, enchantment: 'haste', description: 'A jade-carved turbine that harnesses ambient time energy', emoji: '💚', requiredLevel: 19, craftCost: 92 },
  // Epic gears (7)
  { id: 'platinum_mainspring', name: 'Platinum Mainspring', rarity: 'epic', size: 'massive', material: 'platinum', precision: 52, enchantment: 'reverse', description: 'The heart of the tower — a platinum mainspring that can rewind time itself', emoji: '⏳', requiredLevel: 22, craftCost: 250 },
  { id: 'obsidian_chrono', name: 'Obsidian Chrono Gear', rarity: 'epic', size: 'large', material: 'obsidian', precision: 50, enchantment: 'phase', description: 'An obsidian gear that allows mechanisms to phase between moments', emoji: '🖤', requiredLevel: 25, craftCost: 280 },
  { id: 'mythril_harmonic', name: 'Mythril Harmonic Oscillator', rarity: 'epic', size: 'large', material: 'mythril', precision: 55, enchantment: 'loop', description: 'A mythril oscillator that creates stable time loops for energy harvesting', emoji: '💫', requiredLevel: 28, craftCost: 300 },
  { id: 'orichalcum_heart', name: 'Orichalcum Heart Gear', rarity: 'epic', size: 'massive', material: 'platinum', precision: 48, enchantment: 'haste', description: 'A legendary gear from lost Atlantis that pulses with ancient power', emoji: '🫀', requiredLevel: 30, craftCost: 320 },
  { id: 'void_quartz_cog', name: 'Void Quartz Cog', rarity: 'epic', size: 'large', material: 'obsidian', precision: 53, enchantment: 'reverse', description: 'A cog carved from quartz that fell through a rift in spacetime', emoji: '🌀', requiredLevel: 32, craftCost: 310 },
  { id: 'astral_crown', name: 'Astral Crown Wheel', rarity: 'epic', size: 'massive', material: 'platinum', precision: 56, enchantment: 'phase', description: 'A crown wheel inscribed with star charts that align with celestial events', emoji: '👑', requiredLevel: 35, craftCost: 340 },
  { id: 'temporal_arbor', name: 'Temporal Arbor Shaft', rarity: 'epic', size: 'massive', material: 'mythril', precision: 51, enchantment: 'loop', description: 'A shaft that exists in all moments simultaneously, connecting past and future', emoji: '🔗', requiredLevel: 37, craftCost: 350 },
  // Legendary gears (7)
  { id: 'chronium_prime', name: 'Chronium Prime Gear', rarity: 'legendary', size: 'massive', material: 'chronium', precision: 80, enchantment: 'reverse', description: 'The ultimate gear forged from pure chronium — said to turn time itself', emoji: '⚡', requiredLevel: 40, craftCost: 800 },
  { id: 'eternity_axis', name: 'Eternity Axis', rarity: 'legendary', size: 'massive', material: 'chronium', precision: 85, enchantment: 'loop', description: 'An axis around which all of time revolves — the central spindle of reality', emoji: '🌍', requiredLevel: 42, craftCost: 900 },
  { id: 'singularity_nexus', name: 'Singularity Nexus Gear', rarity: 'legendary', size: 'massive', material: 'chronium', precision: 90, enchantment: 'phase', description: 'A gear that contains a micro-singularity, warping time around it', emoji: '🕳️', requiredLevel: 44, craftCost: 1000 },
  { id: 'genesis_spring', name: 'Genesis Spring', rarity: 'legendary', size: 'massive', material: 'chronium', precision: 88, enchantment: 'haste', description: 'The first spring ever wound — it contains the energy of the universe\'s creation', emoji: '✨', requiredLevel: 45, craftCost: 950 },
  { id: 'apex_chrono', name: 'Apex Chrono Wheel', rarity: 'legendary', size: 'massive', material: 'chronium', precision: 92, enchantment: 'reverse', description: 'The wheel at the very top of the tower — the master controller of all clocks', emoji: '🗼', requiredLevel: 47, craftCost: 1100 },
  { id: 'ouroboros_ring', name: 'Ouroboros Ring Gear', rarity: 'legendary', size: 'massive', material: 'chronium', precision: 95, enchantment: 'loop', description: 'A gear shaped like a serpent eating its tail — infinite rotation, infinite time', emoji: '🐍', requiredLevel: 49, craftCost: 1200 },
  { id: 'infinity_pinion', name: 'Infinity Pinion', rarity: 'legendary', size: 'massive', material: 'chronium', precision: 99, enchantment: 'phase', description: 'A pinion with infinite teeth — it meshes with every gear simultaneously', emoji: '♾️', requiredLevel: 50, craftCost: 1500 },
]

// =============================================================================
// Constants: Floors (8 tower floors)
// =============================================================================

export const CT_FLOORS: CTFloorDef[] = [
  { id: 'entrance_hall', name: 'Entrance Hall', description: 'The grand foyer of the Clock Tower, where ancient gears turn beneath marble floors and bronze chandeliers swing with timeless rhythm', emoji: '🚪', unlockLevel: 1, explorationXp: 10, dangerLevel: 1, floorColor: '#8D6E63' },
  { id: 'gear_room', name: 'Gear Room', description: 'A vast chamber filled with interlocking brass and silver gears of every size, humming with mechanical energy', emoji: '⚙️', unlockLevel: 5, explorationXp: 25, dangerLevel: 2, floorColor: '#A1887F' },
  { id: 'pendulum_chamber', name: 'Pendulum Chamber', description: 'A cavernous room where massive golden pendulums swing in hypnotic patterns, each tracking a different temporal current', emoji: '🕐', unlockLevel: 10, explorationXp: 50, dangerLevel: 3, floorColor: '#FFB74D' },
  { id: 'bell_tower', name: 'Bell Tower', description: 'The resonating bells of time ring out across dimensions, each toll marking a cosmic event in the timeline', emoji: '🔔', unlockLevel: 16, explorationXp: 80, dangerLevel: 4, floorColor: '#FFD54F' },
  { id: 'time_vault', name: 'Time Vault', description: 'A reinforced chamber holding captured moments of history within crystalline time capsules', emoji: '🏛️', unlockLevel: 22, explorationXp: 120, dangerLevel: 5, floorColor: '#FFA726' },
  { id: 'chrono_lab', name: 'Chrono Lab', description: 'A laboratory of temporal experiments where time flows in spirals and paradoxes are studied', emoji: '🔬', unlockLevel: 30, explorationXp: 180, dangerLevel: 7, floorColor: '#FF8F00' },
  { id: 'eternity_room', name: 'Eternity Room', description: 'A room outside of time itself — still and silent, where the fabric of reality can be reshaped', emoji: '🌌', unlockLevel: 38, explorationXp: 280, dangerLevel: 9, floorColor: '#FFD700' },
  { id: 'apex_observatory', name: 'Apex Observatory', description: 'The pinnacle of the tower — a domed observatory that views all of time and space simultaneously', emoji: '🔭', unlockLevel: 46, explorationXp: 500, dangerLevel: 10, floorColor: '#FFC107' },
]

// =============================================================================
// Constants: Time Stones (24 time-altering stones)
// =============================================================================

export const CT_TIMESTONES: CTTimeStoneDef[] = [
  // Common stones (5)
  { id: 'hourglass_gem', name: 'Hourglass Gem', rarity: 'common', timeEffect: 'accelerate', power: 5, cooldown: 60, description: 'A small gem shaped like an hourglass that briefly speeds up time around the user', emoji: '⏳', requiredLevel: 1 },
  { id: 'tick_crystal', name: 'Tick Crystal', rarity: 'common', timeEffect: 'accelerate', power: 8, cooldown: 45, description: 'A crystal that pulses with each second, lending temporal momentum to nearby machines', emoji: '💎', requiredLevel: 2 },
  { id: 'sand_agate', name: 'Sand Agate', rarity: 'common', timeEffect: 'decelerate', power: 6, cooldown: 50, description: 'A warm agate that slows the passage of time in a small radius', emoji: '🟤', requiredLevel: 3 },
  { id: 'moment_quartz', name: 'Moment Quartz', rarity: 'common', timeEffect: 'freeze', power: 3, cooldown: 120, description: 'A quartz that can freeze a single moment for a brief second', emoji: '⏸️', requiredLevel: 3 },
  { id: 'dawn_shard', name: 'Dawn Shard', rarity: 'common', timeEffect: 'accelerate', power: 7, cooldown: 55, description: 'A shard that glows with the light of dawn, speeding recovery and repair', emoji: '🌅', requiredLevel: 4 },
  // Uncommon stones (5)
  { id: 'chrono_shard', name: 'Chrono Shard', rarity: 'uncommon', timeEffect: 'rewind', power: 12, cooldown: 90, description: 'A shard that can rewind a few seconds of localized time', emoji: '⏪', requiredLevel: 6 },
  { id: 'temporal_topaz', name: 'Temporal Topaz', rarity: 'uncommon', timeEffect: 'accelerate', power: 15, cooldown: 60, description: 'A golden topaz that accelerates time significantly for clockwork devices', emoji: '🔶', requiredLevel: 7 },
  { id: 'echo_opal', name: 'Echo Opal', rarity: 'uncommon', timeEffect: 'loop', power: 10, cooldown: 120, description: 'An opal that creates a brief time loop, repeating the last few seconds', emoji: '🔄', requiredLevel: 8 },
  { id: 'stillness_jade', name: 'Stillness Jade', rarity: 'uncommon', timeEffect: 'freeze', power: 14, cooldown: 100, description: 'A serene jade that freezes time in a wide area around the user', emoji: '💚', requiredLevel: 9 },
  { id: 'twilight_amber', name: 'Twilight Amber', rarity: 'uncommon', timeEffect: 'decelerate', power: 16, cooldown: 75, description: 'Amber that traps twilight, slowing everything it touches to a crawl', emoji: '🟠', requiredLevel: 10 },
  // Rare stones (5)
  { id: 'paradox_crystal', name: 'Paradox Crystal', rarity: 'rare', timeEffect: 'shift', power: 25, cooldown: 180, description: 'A crystal that exists in contradictory states — it can shift objects between timelines', emoji: '🔮', requiredLevel: 13 },
  { id: 'rewind_sapphire', name: 'Rewind Sapphire', rarity: 'rare', timeEffect: 'rewind', power: 30, cooldown: 150, description: 'A deep blue sapphire that rewinds time up to a full minute', emoji: '💠', requiredLevel: 15 },
  { id: 'frozen_ruby', name: 'Frozen Ruby', rarity: 'rare', timeEffect: 'freeze', power: 28, cooldown: 160, description: 'A ruby so cold it can freeze time for all creatures in its vicinity', emoji: '❄️', requiredLevel: 17 },
  { id: 'circuit_emerald', name: 'Circuit Emerald', rarity: 'rare', timeEffect: 'loop', power: 22, cooldown: 140, description: 'An emerald with circuits of light that create stable time loops', emoji: '💚', requiredLevel: 18 },
  { id: 'drift_pearl', name: 'Drift Pearl', rarity: 'rare', timeEffect: 'shift', power: 20, cooldown: 130, description: 'A luminous pearl that lets the user drift between temporal layers', emoji: '🫧', requiredLevel: 19 },
  // Epic stones (5)
  { id: 'eternity_garnet', name: 'Eternity Garnet', rarity: 'epic', timeEffect: 'loop', power: 45, cooldown: 300, description: 'A massive garnet that creates persistent time loops, sustaining them for hours', emoji: '🔴', requiredLevel: 24 },
  { id: 'void_onyx', name: 'Void Onyx', rarity: 'epic', timeEffect: 'freeze', power: 50, cooldown: 250, description: 'An onyx from beyond time that can freeze everything within a massive radius', emoji: '🖤', requiredLevel: 27 },
  { id: 'nexus_diamond', name: 'Nexus Diamond', rarity: 'epic', timeEffect: 'shift', power: 48, cooldown: 280, description: 'A flawless diamond that serves as a nexus between all temporal planes', emoji: '💎', requiredLevel: 30 },
  { id: 'anomaly_spinel', name: 'Anomaly Spinel', rarity: 'epic', timeEffect: 'rewind', power: 42, cooldown: 200, description: 'A spinel that creates temporal anomalies, unpredictably shifting time', emoji: '🌀', requiredLevel: 33 },
  { id: 'infinity_tourmaline', name: 'Infinity Tourmaline', rarity: 'epic', timeEffect: 'accelerate', power: 55, cooldown: 240, description: 'A tourmaline that channels infinite temporal energy into acceleration', emoji: '🌈', requiredLevel: 36 },
  // Legendary stones (4)
  { id: 'genesis_stone', name: 'Genesis Stone', rarity: 'legendary', timeEffect: 'rewind', power: 100, cooldown: 600, description: 'The first stone ever created — it can rewind time to the dawn of the current era', emoji: '🌍', requiredLevel: 40 },
  { id: 'apocalypse_glass', name: 'Apocalypse Glass', rarity: 'legendary', timeEffect: 'freeze', power: 120, cooldown: 500, description: 'A dark glass that freezes all of time, bringing absolute stillness to everything', emoji: '🌑', requiredLevel: 43 },
  { id: 'omniscient_orb', name: 'Omniscient Orb', rarity: 'legendary', timeEffect: 'shift', power: 110, cooldown: 480, description: 'An orb that shows all possible futures and can shift between them at will', emoji: '🔮', requiredLevel: 46 },
  { id: 'temporal_crown_jewel', name: 'Temporal Crown Jewel', rarity: 'legendary', timeEffect: 'loop', power: 150, cooldown: 900, description: 'The crown jewel of the Lord of Time — it can loop any moment in perpetuity', emoji: '👑', requiredLevel: 50 },
]

// =============================================================================
// Constants: Inventions (18 clockwork inventions)
// =============================================================================

export const CT_INVENTIONS: CTInventionDef[] = [
  // Common inventions (4)
  { id: 'time_turner', name: 'Time Turner', rarity: 'common', category: 'tool', requiredGears: [{ gearId: 'brass_gear', amount: 3 }, { gearId: 'bronze_ratchet', amount: 1 }], requiredStones: [{ stoneId: 'hourglass_gem', amount: 1 }], buildTime: 30, xpReward: 15, description: 'A simple hourglass-based device that lets you turn back a few seconds', emoji: '⏳', requiredLevel: 1, effect: 'Rewind 5 seconds' },
  { id: 'chrono_compass', name: 'Chrono Compass', rarity: 'common', category: 'tool', requiredGears: [{ gearId: 'brass_gear', amount: 2 }, { gearId: 'copper_sprocket', amount: 2 }], requiredStones: [{ stoneId: 'tick_crystal', amount: 1 }], buildTime: 25, xpReward: 12, description: 'A compass that points not north, but toward the nearest temporal disturbance', emoji: '🧭', requiredLevel: 2, effect: 'Detect temporal anomalies' },
  { id: 'gear_lantern', name: 'Gear Lantern', rarity: 'common', category: 'utility', requiredGears: [{ gearId: 'copper_sprocket', amount: 3 }, { gearId: 'iron_pinion', amount: 2 }], requiredStones: [{ stoneId: 'dawn_shard', amount: 1 }], buildTime: 20, xpReward: 10, description: 'A lantern powered by turning gears that illuminates even timeless darkness', emoji: '🏮', requiredLevel: 3, effect: 'Light in dark areas' },
  { id: 'spring_blade', name: 'Spring Blade', rarity: 'common', category: 'weapon', requiredGears: [{ gearId: 'bronze_ratchet', amount: 2 }, { gearId: 'tin_cog', amount: 3 }], requiredStones: [], buildTime: 35, xpReward: 18, description: 'A dagger with a spring-loaded mechanism for rapid strikes', emoji: '🗡️', requiredLevel: 4, effect: '+5 attack speed' },
  // Uncommon inventions (4)
  { id: 'era_viewer', name: 'Era Viewer', rarity: 'uncommon', category: 'tool', requiredGears: [{ gearId: 'silver_pendulum', amount: 2 }, { gearId: 'nickel_escapement', amount: 1 }], requiredStones: [{ stoneId: 'chrono_shard', amount: 1 }], buildTime: 60, xpReward: 35, description: 'A binocular device that lets you peer into different eras of the tower', emoji: '🔭', requiredLevel: 6, effect: 'View past/future of rooms' },
  { id: 'temporal_shield', name: 'Temporal Shield', rarity: 'uncommon', category: 'accessory', requiredGears: [{ gearId: 'steel_crown', amount: 2 }, { gearId: 'pewter_bearing', amount: 3 }], requiredStones: [{ stoneId: 'moment_quartz', amount: 1 }], buildTime: 50, xpReward: 30, description: 'A shield that briefly freezes incoming attacks in time', emoji: '🛡️', requiredLevel: 8, effect: 'Block 1 attack by freezing it' },
  { id: 'speed_spring_boots', name: 'Speed Spring Boots', rarity: 'uncommon', category: 'accessory', requiredGears: [{ gearId: 'sterling_spring', amount: 3 }, { gearId: 'pewter_bearing', amount: 2 }], requiredStones: [{ stoneId: 'temporal_topaz', amount: 1 }], buildTime: 55, xpReward: 32, description: 'Boots with springs that accelerate your movement through time', emoji: '👢', requiredLevel: 9, effect: '+25% movement speed' },
  { id: 'echo_horn', name: 'Echo Horn', rarity: 'uncommon', category: 'utility', requiredGears: [{ gearId: 'moonstone_arbor', amount: 2 }, { gearId: 'argent_lantern', amount: 1 }], requiredStones: [{ stoneId: 'echo_opal', amount: 1 }], buildTime: 45, xpReward: 28, description: 'A horn that creates echo loops, playing sounds from the past', emoji: '📯', requiredLevel: 10, effect: 'Replay past sounds' },
  // Rare inventions (4)
  { id: 'paradox_disruptor', name: 'Paradox Disruptor', rarity: 'rare', category: 'weapon', requiredGears: [{ gearId: 'crystal_escapement', amount: 2 }, { gearId: 'golden_balance', amount: 1 }], requiredStones: [{ stoneId: 'paradox_crystal', amount: 1 }], buildTime: 90, xpReward: 75, description: 'A weapon that disrupts temporal stability, damaging time-based creatures', emoji: '⚡', requiredLevel: 14, effect: 'Double damage to temporal creatures' },
  { id: 'time_anchor', name: 'Time Anchor', rarity: 'rare', category: 'tool', requiredGears: [{ gearId: 'sapphire_cylinder', amount: 2 }, { gearId: 'ruby_piston', amount: 2 }], requiredStones: [{ stoneId: 'rewind_sapphire', amount: 1 }], buildTime: 80, xpReward: 70, description: 'An anchor that pins you to the current timeline, preventing unwanted shifts', emoji: '⚓', requiredLevel: 16, effect: 'Immune to timeline shifts' },
  { id: 'chrono_mech_horse', name: 'Chrono Mech Horse', rarity: 'rare', category: 'mount', requiredGears: [{ gearId: 'golden_balance', amount: 3 }, { gearId: 'amber_dial', amount: 2 }], requiredStones: [{ stoneId: 'twilight_amber', amount: 1 }], buildTime: 120, xpReward: 85, description: 'A mechanical horse that gallops through time, leaving golden hoofprints', emoji: '🐎', requiredLevel: 18, effect: 'Fast travel between floors' },
  { id: 'freeze_ray', name: 'Freeze Ray', rarity: 'rare', category: 'weapon', requiredGears: [{ gearId: 'sapphire_cylinder', amount: 1 }, { gearId: 'topaz_chime', amount: 2 }], requiredStones: [{ stoneId: 'frozen_ruby', amount: 1 }], buildTime: 85, xpReward: 72, description: 'A ray that fires a beam of frozen time, stopping enemies in their tracks', emoji: '❄️', requiredLevel: 19, effect: 'Freeze enemy for 3 seconds' },
  // Epic inventions (3)
  { id: 'omni_clock', name: 'Omni-Clock', rarity: 'epic', category: 'tool', requiredGears: [{ gearId: 'platinum_mainspring', amount: 2 }, { gearId: 'obsidian_chrono', amount: 1 }], requiredStones: [{ stoneId: 'eternity_garnet', amount: 1 }], buildTime: 180, xpReward: 200, description: 'A clock that shows all times at once — past, present, and every possible future', emoji: '🕐', requiredLevel: 25, effect: 'See all timelines' },
  { id: 'chrono_armor', name: 'Chrono Armor', rarity: 'epic', category: 'accessory', requiredGears: [{ gearId: 'mythril_harmonic', amount: 2 }, { gearId: 'orichalcum_heart', amount: 1 }], requiredStones: [{ stoneId: 'void_onyx', amount: 1 }], buildTime: 200, xpReward: 220, description: 'Armor made from time-woven mythril that phases damage through different eras', emoji: '🛡️', requiredLevel: 30, effect: '50% damage reduction' },
  { id: 'epoch_airship', name: 'Epoch Airship', rarity: 'epic', category: 'mount', requiredGears: [{ gearId: 'astral_crown', amount: 2 }, { gearId: 'temporal_arbor', amount: 2 }], requiredStones: [{ stoneId: 'nexus_diamond', amount: 1 }], buildTime: 240, xpReward: 250, description: 'An airship that sails through temporal currents, crossing eras like oceans', emoji: '🚀', requiredLevel: 35, effect: 'Travel to any era' },
  // Legendary inventions (3)
  { id: 'temporal_scepter', name: 'Temporal Scepter', rarity: 'legendary', category: 'weapon', requiredGears: [{ gearId: 'chronium_prime', amount: 2 }, { gearId: 'eternity_axis', amount: 1 }], requiredStones: [{ stoneId: 'genesis_stone', amount: 1 }], buildTime: 360, xpReward: 500, description: 'The scepter of the Lord of Time — commands all temporal forces', emoji: '👑', requiredLevel: 42, effect: 'Control time completely' },
  { id: 'ouroboros_engine', name: 'Ouroboros Engine', rarity: 'legendary', category: 'utility', requiredGears: [{ gearId: 'ouroboros_ring', amount: 1 }, { gearId: 'singularity_nexus', amount: 1 }], requiredStones: [{ stoneId: 'omniscient_orb', amount: 1 }], buildTime: 420, xpReward: 600, description: 'A perpetual engine that generates infinite time energy from its own loop', emoji: '♾️', requiredLevel: 46, effect: 'Infinite time energy' },
  { id: 'crown_of_ages', name: 'Crown of Ages', rarity: 'legendary', category: 'accessory', requiredGears: [{ gearId: 'apex_chrono', amount: 1 }, { gearId: 'infinity_pinion', amount: 1 }], requiredStones: [{ stoneId: 'temporal_crown_jewel', amount: 1 }], buildTime: 480, xpReward: 800, description: 'The legendary crown granting dominion over all time — the ultimate goal of the tower', emoji: '👑', requiredLevel: 50, effect: 'Lord of Time title' },
]

// =============================================================================
// Constants: Clockwork Creatures (14 mechanical beings)
// =============================================================================

export const CT_CLOCKWORK_CREATURES: CTCreatureDef[] = [
  // Common creatures (3)
  { id: 'clockwork_owl', name: 'Clockwork Owl', rarity: 'common', behavior: 'companion', health: 30, power: 8, description: 'A small brass owl with gemstone eyes that hoots on the hour', emoji: '🦉', requiredLevel: 1, tamingCost: 20, specialAbility: 'Reveals hidden gears' },
  { id: 'brass_mouse', name: 'Brass Mouse', rarity: 'common', behavior: 'companion', health: 15, power: 3, description: 'A tiny mechanical mouse that scurries through vents finding lost items', emoji: '🐭', requiredLevel: 2, tamingCost: 15, specialAbility: 'Finds lost materials' },
  { id: 'tin_sparrow', name: 'Tin Sparrow', rarity: 'common', behavior: 'companion', health: 20, power: 5, description: 'A tin songbird that sings melodies synchronized to the tower\'s clocks', emoji: '🐦', requiredLevel: 3, tamingCost: 18, specialAbility: 'Boosts time energy regen' },
  // Uncommon creatures (3)
  { id: 'bronze_sentinel', name: 'Bronze Sentinel', rarity: 'uncommon', behavior: 'guard', health: 100, power: 20, description: 'A tall bronze automaton that guards the lower floors with spear and shield', emoji: '🤖', requiredLevel: 6, tamingCost: 60, specialAbility: 'Blocks 1 enemy per exploration' },
  { id: 'silver_falcon', name: 'Silver Falcon', rarity: 'uncommon', behavior: 'companion', health: 50, power: 15, description: 'A silver falcon that flies between floors carrying messages and small items', emoji: '🦅', requiredLevel: 8, tamingCost: 75, specialAbility: 'Scouts ahead on floors' },
  { id: 'copper_beetle', name: 'Copper Beetle', rarity: 'uncommon', behavior: 'puzzle', health: 40, power: 10, description: 'A copper beetle that solves gear alignment puzzles when guided correctly', emoji: '🪲', requiredLevel: 9, tamingCost: 55, specialAbility: 'Solves floor puzzles' },
  // Rare creatures (3)
  { id: 'golden_lion', name: 'Golden Lion', rarity: 'rare', behavior: 'guard', health: 250, power: 50, description: 'A magnificent golden lion automaton that patrols the Bell Tower', emoji: '🦁', requiredLevel: 14, tamingCost: 200, specialAbility: 'Roar freezes enemies for 2 seconds' },
  { id: 'crystal_spider', name: 'Crystal Spider', rarity: 'rare', behavior: 'companion', health: 80, power: 30, description: 'A spider made of crystal gears that spins webs of frozen time', emoji: '🕷️', requiredLevel: 16, tamingCost: 180, specialAbility: 'Traps enemies in time webs' },
  { id: 'jade_dragon', name: 'Jade Dragon', rarity: 'rare', behavior: 'companion', health: 200, power: 45, description: 'A small jade dragon that breathes temporal fire, aging targets rapidly', emoji: '🐉', requiredLevel: 18, tamingCost: 220, specialAbility: 'Temporal breath ages enemies' },
  // Epic creatures (3)
  { id: 'mythril_phoenix', name: 'Mythril Phoenix', rarity: 'epic', behavior: 'companion', health: 400, power: 80, description: 'A phoenix of mythril gears that can reverse its own destruction', emoji: '🔥', requiredLevel: 26, tamingCost: 600, specialAbility: 'Self-revives once per floor' },
  { id: 'obsidian_golem', name: 'Obsidian Golem', rarity: 'epic', behavior: 'guard', health: 800, power: 100, description: 'A massive obsidian golem that guards the Chrono Lab with immense strength', emoji: '🗿', requiredLevel: 30, tamingCost: 700, specialAbility: 'Earthquake stuns all enemies' },
  { id: 'astral_seraph', name: 'Astral Seraph', rarity: 'epic', behavior: 'trader', health: 300, power: 60, description: 'A winged celestial automaton that trades rare temporal materials', emoji: '👼', requiredLevel: 34, tamingCost: 550, specialAbility: 'Access to rare gear shop' },
  // Legendary creatures (2)
  { id: 'chronium_dragon', name: 'Chronium Dragon', rarity: 'legendary', behavior: 'companion', health: 1500, power: 200, description: 'The legendary dragon of time — a being of pure chronium that exists in all eras', emoji: '🐲', requiredLevel: 42, tamingCost: 2000, specialAbility: 'Controls time on entire floor' },
  { id: 'temporal_titan', name: 'Temporal Titan', rarity: 'legendary', behavior: 'guard', health: 3000, power: 350, description: 'A colossal automaton from the dawn of time that guards the Apex Observatory', emoji: '⚡', requiredLevel: 48, tamingCost: 3000, specialAbility: 'Invulnerability aura for 10 seconds' },
]

// =============================================================================
// Constants: Clocks (10 windable clocks)
// =============================================================================

export const CT_CLOCKS: CTClockDef[] = [
  { id: 'entrance_dial', name: 'Entrance Grandfather Clock', floorId: 'entrance_hall', windXp: 5, windCoins: 3, cooldownMinutes: 1, description: 'A towering grandfather clock in the entrance hall that chimes every hour', emoji: '🕰️', requiredLevel: 1 },
  { id: 'gear_room_timer', name: 'Gear Room Assembly Timer', floorId: 'gear_room', windXp: 12, windCoins: 8, cooldownMinutes: 2, description: 'A large industrial timer that tracks the assembly of the tower\'s gears', emoji: '⏲️', requiredLevel: 5 },
  { id: 'pendulum_master', name: 'Master Pendulum Clock', floorId: 'pendulum_chamber', windXp: 25, windCoins: 15, cooldownMinutes: 3, description: 'The master pendulum that regulates all time in the tower', emoji: '🕐', requiredLevel: 10 },
  { id: 'bell_striker', name: 'Bell Tower Striker Clock', floorId: 'bell_tower', windXp: 40, windCoins: 25, cooldownMinutes: 5, description: 'The clock that controls the great bells, measuring cosmic time', emoji: '🔔', requiredLevel: 16 },
  { id: 'vault_chrono', name: 'Time Vault Chronometer', floorId: 'time_vault', windXp: 60, windCoins: 40, cooldownMinutes: 8, description: 'A sealed chronometer that preserves exact moments within the vault', emoji: '⌚', requiredLevel: 22 },
  { id: 'lab_experiment', name: 'Chrono Lab Experimental Clock', floorId: 'chrono_lab', windXp: 90, windCoins: 60, cooldownMinutes: 12, description: 'An experimental clock that runs experiments in temporal mechanics', emoji: '🔬', requiredLevel: 30 },
  { id: 'eternity_timekeeper', name: 'Eternity Timekeeper', floorId: 'eternity_room', windXp: 140, windCoins: 100, cooldownMinutes: 15, description: 'A clock that exists outside time — winding it grants insight into eternity', emoji: '🌌', requiredLevel: 38 },
  { id: 'apex_orrery', name: 'Apex Celestial Orrery', floorId: 'apex_observatory', windXp: 250, windCoins: 180, cooldownMinutes: 20, description: 'A massive orrery tracking celestial bodies across all of time', emoji: '🔭', requiredLevel: 46 },
  { id: 'whisper_clock', name: 'Clock of Whispers', floorId: 'pendulum_chamber', windXp: 35, windCoins: 20, cooldownMinutes: 4, description: 'A clock that whispers secrets of the past to those who wind it', emoji: '👻', requiredLevel: 12 },
  { id: 'paradox_timer', name: 'Paradox Measurement Timer', floorId: 'chrono_lab', windXp: 100, windCoins: 70, cooldownMinutes: 10, description: 'A timer that measures the stability of local timelines and paradox levels', emoji: '⚠️', requiredLevel: 26 },
]

// =============================================================================
// Constants: Titles (8)
// =============================================================================

export const CT_TITLES: CTTitleDef[] = [
  { name: 'Watchmaker', levelRequired: 1, description: 'A novice watchmaker learning to repair simple timepieces' },
  { name: 'Clockwork Apprentice', levelRequired: 6, description: 'An apprentice who can maintain the tower\'s basic mechanisms' },
  { name: 'Gear Master', levelRequired: 12, description: 'A skilled artisan who crafts precision gears of rare materials' },
  { name: 'Timekeeper', levelRequired: 18, description: 'A keeper of time who understands the flow of temporal currents' },
  { name: 'Chrono Engineer', levelRequired: 25, description: 'An engineer capable of building temporal devices and inventions' },
  { name: 'Paradox Walker', levelRequired: 32, description: 'One who navigates paradoxes without losing their place in time' },
  { name: 'Eternal Artificer', levelRequired: 40, description: 'An artificer whose creations transcend the boundaries of time' },
  { name: 'Lord of Time', levelRequired: 50, description: 'The supreme master of the Clock Tower, commanding all temporal forces' },
]

// =============================================================================
// Constants: Achievements (20)
// =============================================================================

export const CT_ACHIEVEMENTS: CTAchievementDef[] = [
  { id: 'ct_ach_first_wind', name: 'First Wind', description: 'Wind your very first clock in the tower', conditionKey: 'totalClocksWound', targetValue: 1, rewardXp: 10, rewardCoins: 5, emoji: '🕐' },
  { id: 'ct_ach_gear_novice', name: 'Gear Novice', description: 'Craft 10 gears of any type', conditionKey: 'totalGearsCrafted', targetValue: 10, rewardXp: 25, rewardCoins: 15, emoji: '⚙️' },
  { id: 'ct_ach_gear_master', name: 'Gear Master', description: 'Craft 50 gears total', conditionKey: 'totalGearsCrafted', targetValue: 50, rewardXp: 100, rewardCoins: 60, emoji: '🔩' },
  { id: 'ct_ach_floor_explorer', name: 'Floor Explorer', description: 'Explore 5 different tower floors', conditionKey: 'totalFloorsExplored', targetValue: 5, rewardXp: 50, rewardCoins: 30, emoji: '🚪' },
  { id: 'ct_ach_full_explore', name: 'Full Exploration', description: 'Explore all 8 tower floors', conditionKey: 'totalFloorsExplored', targetValue: 8, rewardXp: 300, rewardCoins: 200, emoji: '🏛️' },
  { id: 'ct_ach_secret_hunter', name: 'Secret Hunter', description: 'Find 10 secrets across all floors', conditionKey: 'totalSecretsFound', targetValue: 10, rewardXp: 80, rewardCoins: 50, emoji: '🔍' },
  { id: 'ct_ach_inventor_apprentice', name: 'Inventor Apprentice', description: 'Build your first clockwork invention', conditionKey: 'totalInventionsBuilt', targetValue: 1, rewardXp: 30, rewardCoins: 20, emoji: '🔧' },
  { id: 'ct_ach_prolific_builder', name: 'Prolific Builder', description: 'Build 10 different inventions', conditionKey: 'totalInventionsBuilt', targetValue: 10, rewardXp: 200, rewardCoins: 150, emoji: '🏗️' },
  { id: 'ct_ach_master_inventor', name: 'Master Inventor', description: 'Build all 18 inventions', conditionKey: 'totalInventionsBuilt', targetValue: 18, rewardXp: 1000, rewardCoins: 800, emoji: '👑' },
  { id: 'ct_ach_creature_friend', name: 'Creature Friend', description: 'Tame your first clockwork creature', conditionKey: 'totalCreaturesTamed', targetValue: 1, rewardXp: 25, rewardCoins: 15, emoji: '🦉' },
  { id: 'ct_ach_menagerie', name: 'Mechanical Menagerie', description: 'Tame 7 different clockwork creatures', conditionKey: 'totalCreaturesTamed', targetValue: 7, rewardXp: 250, rewardCoins: 180, emoji: '🦁' },
  { id: 'ct_ach_all_creatures', name: 'Complete Collection', description: 'Tame all 14 clockwork creatures', conditionKey: 'totalCreaturesTamed', targetValue: 14, rewardXp: 800, rewardCoins: 600, emoji: '🐲' },
  { id: 'ct_ach_time_mage', name: 'Time Manipulator', description: 'Use time stones 25 times', conditionKey: 'totalTimeManipulations', targetValue: 25, rewardXp: 75, rewardCoins: 45, emoji: '💎' },
  { id: 'ct_ach_paradox_resolver', name: 'Paradox Resolver', description: 'Resolve 5 temporal paradoxes', conditionKey: 'totalParadoxesResolved', targetValue: 5, rewardXp: 120, rewardCoins: 80, emoji: '🌀' },
  { id: 'ct_ach_clock_addict', name: 'Clock Addict', description: 'Wind clocks 100 times total', conditionKey: 'totalClocksWound', targetValue: 100, rewardXp: 150, rewardCoins: 100, emoji: '⏰' },
  { id: 'ct_ach_daily_7', name: 'Week of Time', description: 'Maintain a 7-day daily streak', conditionKey: 'bestStreak', targetValue: 7, rewardXp: 100, rewardCoins: 70, emoji: '📅' },
  { id: 'ct_ach_daily_30', name: 'Month of Eternity', description: 'Maintain a 30-day daily streak', conditionKey: 'bestStreak', targetValue: 30, rewardXp: 500, rewardCoins: 350, emoji: '🗓️' },
  { id: 'ct_ach_coin_master', name: 'Coin Master', description: 'Earn 10,000 total coins', conditionKey: 'totalCoinsEarned', targetValue: 10000, rewardXp: 200, rewardCoins: 0, emoji: '💰' },
  { id: 'ct_ach_epic_gear', name: 'Epic Crafter', description: 'Craft an epic-tier gear', conditionKey: 'gearCraftCountByRarity_epic', targetValue: 1, rewardXp: 150, rewardCoins: 100, emoji: '💫' },
  { id: 'ct_ach_legendary_gear', name: 'Legendary Artificer', description: 'Craft a legendary-tier gear', conditionKey: 'gearCraftCountByRarity_legendary', targetValue: 1, rewardXp: 500, rewardCoins: 400, emoji: '⚡' },
]

// =============================================================================
// Constants: Quests (12)
// =============================================================================

export const CT_QUESTS: CTQuestDef[] = [
  { id: 'ct_quest_wind_five', name: 'Keeping Time', description: 'Wind 5 clocks to prove your dedication', targetValue: 5, rewardXp: 20, rewardCoins: 10, requiredLevel: 1, emoji: '🕐', conditionKey: 'totalClocksWound' },
  { id: 'ct_quest_craft_gears', name: 'Gear Up', description: 'Craft 15 gears of any quality', targetValue: 15, rewardXp: 50, rewardCoins: 30, requiredLevel: 3, emoji: '⚙️', conditionKey: 'totalGearsCrafted' },
  { id: 'ct_quest_explore_three', name: 'Tower Ascendant', description: 'Explore 3 different tower floors', targetValue: 3, rewardXp: 40, rewardCoins: 25, requiredLevel: 6, emoji: '🚪', conditionKey: 'totalFloorsExplored' },
  { id: 'ct_quest_first_invention', name: 'First Creation', description: 'Build your very first invention', targetValue: 1, rewardXp: 30, rewardCoins: 20, requiredLevel: 5, emoji: '🔧', conditionKey: 'totalInventionsBuilt' },
  { id: 'ct_quest_tame_two', name: 'Mechanical Friends', description: 'Tame 2 clockwork creatures', targetValue: 2, rewardXp: 45, rewardCoins: 30, requiredLevel: 8, emoji: '🦉', conditionKey: 'totalCreaturesTamed' },
  { id: 'ct_quest_use_stones', name: 'Stone Worker', description: 'Use time stones 10 times', targetValue: 10, rewardXp: 60, rewardCoins: 40, requiredLevel: 10, emoji: '💎', conditionKey: 'totalTimeManipulations' },
  { id: 'ct_quest_resolve_paradox', name: 'Paradox Fixer', description: 'Resolve 3 temporal paradoxes', targetValue: 3, rewardXp: 80, rewardCoins: 55, requiredLevel: 14, emoji: '🌀', conditionKey: 'totalParadoxesResolved' },
  { id: 'ct_quest_fifty_gears', name: 'Mass Production', description: 'Craft 50 gears total', targetValue: 50, rewardXp: 150, rewardCoins: 100, requiredLevel: 18, emoji: '🏭', conditionKey: 'totalGearsCrafted' },
  { id: 'ct_quest_five_inventions', name: 'Prolific Inventor', description: 'Build 5 different inventions', targetValue: 5, rewardXp: 120, rewardCoins: 80, requiredLevel: 20, emoji: '🏗️', conditionKey: 'totalInventionsBuilt' },
  { id: 'ct_quest_secrets', name: 'Secret Seeker', description: 'Find 8 secrets across the tower', targetValue: 8, rewardXp: 100, rewardCoins: 65, requiredLevel: 22, emoji: '🔍', conditionKey: 'totalSecretsFound' },
  { id: 'ct_quest_wind_50', name: 'Time Devotee', description: 'Wind clocks 50 times', targetValue: 50, rewardXp: 200, rewardCoins: 130, requiredLevel: 28, emoji: '⏰', conditionKey: 'totalClocksWound' },
  { id: 'ct_quest_master_all', name: 'Tower Master', description: 'Explore all 8 floors, build 10 inventions, and tame 7 creatures', targetValue: 3, rewardXp: 500, rewardCoins: 400, requiredLevel: 35, emoji: '👑', conditionKey: 'masterAll' },
]

// =============================================================================
// Default State Factory
// =============================================================================

function ctCreateDefaultState(): CTClockTowerState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 50,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    gears: {},
    stones: {},
    inventions: CT_INVENTIONS.map((inv) => ({
      inventionId: inv.id,
      built: false,
      builtAt: null,
      upgrades: 0,
    })),
    creatures: CT_CLOCKWORK_CREATURES.map((c) => ({
      creatureId: c.id,
      tamed: false,
      tamedAt: null,
      active: false,
    })),
    floors: CT_FLOORS.map((f) => ({
      id: f.id,
      explored: false,
      explorationCount: 0,
      secretsFound: 0,
      maxSecrets: f.id === 'entrance_hall' ? 2 : f.id === 'gear_room' ? 3 : f.id === 'pendulum_chamber' ? 4 : f.id === 'bell_tower' ? 5 : f.id === 'time_vault' ? 6 : f.id === 'chrono_lab' ? 8 : f.id === 'eternity_room' ? 10 : 12,
    })),
    clocks: CT_CLOCKS.map((c) => ({
      id: c.id,
      woundAt: null,
      windCount: 0,
    })),
    achievements: CT_ACHIEVEMENTS.map((a) => ({
      id: a.id,
      unlocked: false,
      unlockedAt: null,
    })),
    quests: CT_QUESTS.map((q) => ({
      id: q.id,
      status: 'available' as CTQuestStatus,
      progress: 0,
    })),
    paradoxes: [],
    title: 'Watchmaker',
    paradoxMeter: 0,
    maxParadoxMeter: 100,
    timeEnergy: 50,
    maxTimeEnergy: 100,
    totalClocksWound: 0,
    totalGearsCrafted: 0,
    totalInventionsBuilt: 0,
    totalCreaturesTamed: 0,
    totalFloorsExplored: 0,
    totalParadoxesResolved: 0,
    totalTimeManipulations: 0,
    totalSecretsFound: 0,
    streak: 0,
    bestStreak: 0,
    lastPlayDate: null,
    dailyDate: null,
    dailyClocksWound: 0,
    activeFloor: 'entrance_hall',
    gearCraftCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    inventionBuildCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
  }
}

// =============================================================================
// Hook
// =============================================================================

export default function useClockTower() {
  const stateRef = useRef<CTClockTowerState>(ctCreateDefaultState())
  const [state, setState] = useState<CTClockTowerState>(() => {
    if (typeof window === 'undefined') return ctCreateDefaultState()
    try {
      const saved = localStorage.getItem('clock-tower-save')
      if (saved) {
        const parsed = JSON.parse(saved)
        const fresh = ctCreateDefaultState()
        return {
          ...fresh,
          ...parsed,
          inventions: parsed.inventions ?? fresh.inventions,
          creatures: parsed.creatures ?? fresh.creatures,
          floors: parsed.floors ?? fresh.floors,
          clocks: parsed.clocks ?? fresh.clocks,
          achievements: parsed.achievements ?? fresh.achievements,
          quests: parsed.quests ?? fresh.quests,
          gearCraftCountByRarity: parsed.gearCraftCountByRarity ?? fresh.gearCraftCountByRarity,
          inventionBuildCountByRarity: parsed.inventionBuildCountByRarity ?? fresh.inventionBuildCountByRarity,
        }
      }
    } catch {
      // ignore parse errors
    }
    return ctCreateDefaultState()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('clock-tower-save', JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // ===========================================================================
  // Simple Getters
  // ===========================================================================

  const ctGetLevel = useCallback((): number => stateRef.current.level, [])
  const ctGetXp = useCallback((): number => stateRef.current.xp, [])
  const ctGetTotalXp = useCallback((): number => stateRef.current.totalXp, [])
  const ctGetCoins = useCallback((): number => stateRef.current.coins, [])
  const ctGetTotalCoinsEarned = useCallback((): number => stateRef.current.totalCoinsEarned, [])
  const ctGetTotalCoinsSpent = useCallback((): number => stateRef.current.totalCoinsSpent, [])
  const ctGetGears = useCallback((): Record<string, number> => stateRef.current.gears, [])
  const ctGetStones = useCallback((): Record<string, number> => stateRef.current.stones, [])
  const ctGetInventions = useCallback((): CTInventionState[] => stateRef.current.inventions, [])
  const ctGetCreatures = useCallback((): CTCreatureState[] => stateRef.current.creatures, [])
  const ctGetFloors = useCallback((): CTFloorState[] => stateRef.current.floors, [])
  const ctGetClocks = useCallback((): CTClockState[] => stateRef.current.clocks, [])
  const ctGetAchievements = useCallback((): CTAchievementState[] => stateRef.current.achievements, [])
  const ctGetQuests = useCallback((): CTQuestState[] => stateRef.current.quests, [])
  const ctGetParadoxes = useCallback((): CTParadoxEvent[] => stateRef.current.paradoxes, [])
  const ctGetTitle = useCallback((): string => stateRef.current.title, [])
  const ctGetParadoxMeter = useCallback((): number => stateRef.current.paradoxMeter, [])
  const ctGetMaxParadoxMeter = useCallback((): number => stateRef.current.maxParadoxMeter, [])
  const ctGetTimeEnergy = useCallback((): number => stateRef.current.timeEnergy, [])
  const ctGetMaxTimeEnergy = useCallback((): number => stateRef.current.maxTimeEnergy, [])
  const ctGetTotalClocksWound = useCallback((): number => stateRef.current.totalClocksWound, [])
  const ctGetTotalGearsCrafted = useCallback((): number => stateRef.current.totalGearsCrafted, [])
  const ctGetTotalInventionsBuilt = useCallback((): number => stateRef.current.totalInventionsBuilt, [])
  const ctGetTotalCreaturesTamed = useCallback((): number => stateRef.current.totalCreaturesTamed, [])
  const ctGetTotalFloorsExplored = useCallback((): number => stateRef.current.totalFloorsExplored, [])
  const ctGetTotalParadoxesResolved = useCallback((): number => stateRef.current.totalParadoxesResolved, [])
  const ctGetTotalTimeManipulations = useCallback((): number => stateRef.current.totalTimeManipulations, [])
  const ctGetTotalSecretsFound = useCallback((): number => stateRef.current.totalSecretsFound, [])
  const ctGetStreak = useCallback((): number => stateRef.current.streak, [])
  const ctGetBestStreak = useCallback((): number => stateRef.current.bestStreak, [])
  const ctGetDailyClocksWound = useCallback((): number => stateRef.current.dailyClocksWound, [])
  const ctGetActiveFloor = useCallback((): CTFloorId => stateRef.current.activeFloor, [])
  const ctGetGearCraftCountByRarity = useCallback((): Record<CTRarity, number> => stateRef.current.gearCraftCountByRarity, [])
  const ctGetInventionBuildCountByRarity = useCallback((): Record<CTRarity, number> => stateRef.current.inventionBuildCountByRarity, [])
  const ctGetState = useCallback((): Readonly<CTClockTowerState> => Object.freeze({ ...stateRef.current }), [])
  const ctGetTodayKey = useCallback((): string => ctGenerateDayKey(Date.now()), [])
  const ctGetXpRequired = useCallback((): number => ctXpRequiredForLevel(stateRef.current.level), [])
  const ctGetXpProgress = useCallback((): number => {
    const s = stateRef.current
    const needed = ctXpRequiredForLevel(s.level)
    if (needed <= 0 || needed === Infinity) return 1
    return Math.min(1, s.xp / needed)
  }, [])
  const ctGetOverallProgress = useCallback((): number => {
    const s = stateRef.current
    return Math.min(1, s.totalXp / ctXpRequiredForLevel(CT_MAX_LEVEL))
  }, [])
  const ctGetGearCount = useCallback((gearId: string): number => {
    return stateRef.current.gears[gearId] ?? 0
  }, [])
  const ctGetStoneCount = useCallback((stoneId: string): number => {
    return stateRef.current.stones[stoneId] ?? 0
  }, [])
  const ctGetParadoxPercent = useCallback((): number => {
    const s = stateRef.current
    if (s.maxParadoxMeter <= 0) return 0
    return Math.min(100, Math.floor((s.paradoxMeter / s.maxParadoxMeter) * 100))
  }, [])
  const ctGetTimeEnergyPercent = useCallback((): number => {
    const s = stateRef.current
    if (s.maxTimeEnergy <= 0) return 0
    return Math.min(100, Math.floor((s.timeEnergy / s.maxTimeEnergy) * 100))
  }, [])

  // ===========================================================================
  // Level / XP / Coins Modifiers
  // ===========================================================================

  const ctAddXp = useCallback((amount: number) => {
    setState((prev) => {
      let next = { ...prev, xp: prev.xp + amount, totalXp: prev.totalXp + amount }
      const needed = ctXpRequiredForLevel(next.level)
      while (next.xp >= needed && next.level < CT_MAX_LEVEL) {
        next = { ...next, xp: next.xp - needed, level: ctClampLevel(next.level + 1) }
        const titleDef = [...CT_TITLES].reverse().find((t) => next.level >= t.levelRequired)
        if (titleDef) next = { ...next, title: titleDef.name }
        if (next.level >= CT_MAX_LEVEL || next.xp < ctXpRequiredForLevel(next.level)) break
      }
      if (next.level >= CT_MAX_LEVEL) next.xp = 0
      return next
    })
  }, [])

  const ctSetLevel = useCallback((level: number) => {
    setState((prev) => {
      const clamped = ctClampLevel(level)
      const titleDef = [...CT_TITLES].reverse().find((t) => clamped >= t.levelRequired)
      return { ...prev, level: clamped, xp: 0, title: titleDef?.name ?? prev.title }
    })
  }, [])

  const ctSetXp = useCallback((xp: number) => {
    setState((prev) => ({ ...prev, xp: Math.max(0, xp) }))
  }, [])

  const ctAddCoins = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, coins: prev.coins + amount, totalCoinsEarned: prev.totalCoinsEarned + amount }))
  }, [])

  const ctSpendCoins = useCallback((amount: number): boolean => {
    const s = stateRef.current
    if (s.coins < amount) return false
    setState((prev) => ({ ...prev, coins: prev.coins - amount, totalCoinsSpent: prev.totalCoinsSpent + amount }))
    return true
  }, [])

  const ctSetCoins = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, coins: Math.max(0, amount) }))
  }, [])

  const ctCanAfford = useCallback((amount: number): boolean => {
    return stateRef.current.coins >= amount
  }, [])

  // ===========================================================================
  // Gear Management
  // ===========================================================================

  const ctHasGear = useCallback((gearId: string, amount: number): boolean => {
    return (stateRef.current.gears[gearId] ?? 0) >= amount
  }, [])

  const ctAddGear = useCallback((gearId: string, amount: number) => {
    if (amount <= 0) return
    setState((prev) => ({
      ...prev,
      gears: { ...prev.gears, [gearId]: (prev.gears[gearId] ?? 0) + amount },
    }))
  }, [])

  const ctRemoveGear = useCallback((gearId: string, amount: number): boolean => {
    const current = stateRef.current.gears[gearId] ?? 0
    if (current < amount) return false
    setState((prev) => {
      const next = { ...prev.gears, [gearId]: current - amount }
      if (next[gearId] <= 0) delete next[gearId]
      return { ...prev, gears: next }
    })
    return true
  }, [])

  const ctCraftGear = useCallback((gearId: string): boolean => {
    const gearDef = CT_GEARS.find((g) => g.id === gearId)
    if (!gearDef) return false
    const s = stateRef.current
    if (s.level < gearDef.requiredLevel) return false
    if (s.coins < gearDef.craftCost) return false
    const craftAmount = gearDef.rarity === 'legendary' ? 1 : gearDef.rarity === 'epic' ? 1 : 2
    const xpGain = Math.floor(10 * ctRarityMultiplier(gearDef.rarity))
    setState((prev) => ({
      ...prev,
      coins: prev.coins - gearDef.craftCost,
      totalCoinsSpent: prev.totalCoinsSpent + gearDef.craftCost,
      gears: { ...prev.gears, [gearId]: (prev.gears[gearId] ?? 0) + craftAmount },
      xp: prev.xp + xpGain,
      totalXp: prev.totalXp + xpGain,
      totalGearsCrafted: prev.totalGearsCrafted + craftAmount,
      gearCraftCountByRarity: {
        ...prev.gearCraftCountByRarity,
        [gearDef.rarity]: prev.gearCraftCountByRarity[gearDef.rarity] + craftAmount,
      },
      paradoxMeter: Math.min(prev.maxParadoxMeter, prev.paradoxMeter + (gearDef.enchantment !== 'none' ? 2 : 0)),
    }))
    return true
  }, [])

  const ctCanCraftGear = useCallback((gearId: string): boolean => {
    const gearDef = CT_GEARS.find((g) => g.id === gearId)
    if (!gearDef) return false
    const s = stateRef.current
    return s.level >= gearDef.requiredLevel && s.coins >= gearDef.craftCost
  }, [])

  // ===========================================================================
  // Time Stone Management
  // ===========================================================================

  const ctHasStone = useCallback((stoneId: string, amount: number): boolean => {
    return (stateRef.current.stones[stoneId] ?? 0) >= amount
  }, [])

  const ctAddStone = useCallback((stoneId: string, amount: number) => {
    if (amount <= 0) return
    setState((prev) => ({
      ...prev,
      stones: { ...prev.stones, [stoneId]: (prev.stones[stoneId] ?? 0) + amount },
    }))
  }, [])

  const ctRemoveStone = useCallback((stoneId: string, amount: number): boolean => {
    const current = stateRef.current.stones[stoneId] ?? 0
    if (current < amount) return false
    setState((prev) => {
      const next = { ...prev.stones, [stoneId]: current - amount }
      if (next[stoneId] <= 0) delete next[stoneId]
      return { ...prev, stones: next }
    })
    return true
  }, [])

  const ctUseTimeStone = useCallback((stoneId: string): boolean => {
    const stoneDef = CT_TIMESTONES.find((s) => s.id === stoneId)
    if (!stoneDef) return false
    const s = stateRef.current
    if ((s.stones[stoneId] ?? 0) < 1) return false
    if (s.timeEnergy < 10) return false
    const paradoxIncrease = stoneDef.rarity === 'legendary' ? 15 : stoneDef.rarity === 'epic' ? 10 : stoneDef.rarity === 'rare' ? 5 : 2
    const timeEnergyCost = 10
    const xpGain = Math.floor(8 * ctRarityMultiplier(stoneDef.rarity))
    setState((prev) => {
      const stoneCount = (prev.stones[stoneId] ?? 0) - 1
      const nextStones = { ...prev.stones }
      if (stoneCount <= 0) delete nextStones[stoneId]
      else nextStones[stoneId] = stoneCount
      return {
        ...prev,
        stones: nextStones,
        timeEnergy: Math.max(0, prev.timeEnergy - timeEnergyCost),
        paradoxMeter: Math.min(prev.maxParadoxMeter, prev.paradoxMeter + paradoxIncrease),
        totalTimeManipulations: prev.totalTimeManipulations + 1,
        xp: prev.xp + xpGain,
        totalXp: prev.totalXp + xpGain,
      }
    })
    return true
  }, [])

  // ===========================================================================
  // Clock Winding
  // ===========================================================================

  const ctCanWindClock = useCallback((clockId: string): boolean => {
    const clockDef = CT_CLOCKS.find((c) => c.id === clockId)
    if (!clockDef) return false
    const s = stateRef.current
    if (s.level < clockDef.requiredLevel) return false
    const clockState = s.clocks.find((c) => c.id === clockId)
    if (clockState?.woundAt) {
      const elapsed = Date.now() - clockState.woundAt
      const cooldownMs = clockDef.cooldownMinutes * 60 * 1000
      if (elapsed < cooldownMs) return false
    }
    return true
  }, [])

  const ctWindClock = useCallback((clockId: string): boolean => {
    if (!ctCanWindClock(clockId)) return false
    const clockDef = CT_CLOCKS.find((c) => c.id === clockId)
    if (!clockDef) return false
    const todayKey = ctGenerateDayKey(Date.now())
    const s = stateRef.current
    const isNewDay = s.dailyDate !== todayKey
    setState((prev) => {
      const timeEnergyGain = clockDef.windXp / 2
      return {
        ...prev,
        xp: prev.xp + clockDef.windXp,
        totalXp: prev.totalXp + clockDef.windXp,
        coins: prev.coins + clockDef.windCoins,
        totalCoinsEarned: prev.totalCoinsEarned + clockDef.windCoins,
        timeEnergy: Math.min(prev.maxTimeEnergy, prev.timeEnergy + timeEnergyGain),
        clocks: prev.clocks.map((c) =>
          c.id === clockId ? { ...c, woundAt: Date.now(), windCount: c.windCount + 1 } : c,
        ),
        totalClocksWound: prev.totalClocksWound + 1,
        dailyClocksWound: isNewDay ? 1 : prev.dailyClocksWound + 1,
        dailyDate: todayKey,
      }
    })
    return true
  }, [ctCanWindClock])

  const ctGetClockCooldownRemaining = useCallback((clockId: string): number => {
    const clockDef = CT_CLOCKS.find((c) => c.id === clockId)
    if (!clockDef) return 0
    const clockState = stateRef.current.clocks.find((c) => c.id === clockId)
    if (!clockState?.woundAt) return 0
    const elapsed = Date.now() - clockState.woundAt
    const cooldownMs = clockDef.cooldownMinutes * 60 * 1000
    return Math.max(0, Math.ceil((cooldownMs - elapsed) / 1000))
  }, [])

  // ===========================================================================
  // Floor Exploration
  // ===========================================================================

  const ctCanExploreFloor = useCallback((floorId: CTFloorId): boolean => {
    const floorDef = CT_FLOORS.find((f) => f.id === floorId)
    if (!floorDef) return false
    return stateRef.current.level >= floorDef.unlockLevel
  }, [])

  const ctExploreFloor = useCallback((floorId: CTFloorId): { xpGained: number; secretsFound: number; coinsGained: number } => {
    const floorDef = CT_FLOORS.find((f) => f.id === floorId)
    if (!floorDef || !ctCanExploreFloor(floorId)) {
      return { xpGained: 0, secretsFound: 0, coinsGained: 0 }
    }
    const s = stateRef.current
    const floorState = s.floors.find((f) => f.id === floorId)
    const currentSecrets = floorState?.secretsFound ?? 0
    const maxSecrets = floorState?.maxSecrets ?? 2
    const newSecrets = currentSecrets < maxSecrets ? Math.min(2, maxSecrets - currentSecrets) : 0
    const xpGained = Math.floor(floorDef.explorationXp * (1 + floorState?.explorationCount * 0.1))
    const coinsGained = Math.floor(floorDef.explorationXp * 0.6)
    setState((prev) => ({
      ...prev,
      xp: prev.xp + xpGained,
      totalXp: prev.totalXp + xpGained,
      coins: prev.coins + coinsGained,
      totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
      floors: prev.floors.map((f) => {
        if (f.id !== floorId) return f
        const wasExplored = f.explored
        return {
          ...f,
          explored: true,
          explorationCount: f.explorationCount + 1,
          secretsFound: f.secretsFound + newSecrets,
        }
      }),
      totalFloorsExplored: prev.floors.find((f) => f.id === floorId && !f.explored)
        ? prev.totalFloorsExplored + 1
        : prev.totalFloorsExplored,
      totalSecretsFound: prev.totalSecretsFound + newSecrets,
      timeEnergy: Math.min(prev.maxTimeEnergy, prev.timeEnergy + 5),
      activeFloor: floorId,
    }))
    return { xpGained, secretsFound: newSecrets, coinsGained }
  }, [ctCanExploreFloor])

  const ctSetActiveFloor = useCallback((floorId: CTFloorId) => {
    const floorDef = CT_FLOORS.find((f) => f.id === floorId)
    if (!floorDef) return
    setState((prev) => ({ ...prev, activeFloor: floorId }))
  }, [])

  // ===========================================================================
  // Invention Building
  // ===========================================================================

  const ctCanBuildInvention = useCallback((inventionId: string): boolean => {
    const invDef = CT_INVENTIONS.find((i) => i.id === inventionId)
    if (!invDef) return false
    const s = stateRef.current
    if (s.level < invDef.requiredLevel) return false
    for (const req of invDef.requiredGears) {
      if ((s.gears[req.gearId] ?? 0) < req.amount) return false
    }
    for (const req of invDef.requiredStones) {
      if ((s.stones[req.stoneId] ?? 0) < req.amount) return false
    }
    return true
  }, [])

  const ctBuildInvention = useCallback((inventionId: string): boolean => {
    const invDef = CT_INVENTIONS.find((i) => i.id === inventionId)
    if (!invDef || !ctCanBuildInvention(inventionId)) return false
    const s = stateRef.current
    const existing = s.inventions.find((i) => i.inventionId === inventionId)
    if (existing?.built) return false
    const xpGain = Math.floor(invDef.xpReward * ctRarityMultiplier(invDef.rarity))
    setState((prev) => {
      const gears = { ...prev.gears }
      for (const req of invDef.requiredGears) {
        gears[req.gearId] = (gears[req.gearId] ?? 0) - req.amount
        if (gears[req.gearId] <= 0) delete gears[req.gearId]
      }
      const stones = { ...prev.stones }
      for (const req of invDef.requiredStones) {
        stones[req.stoneId] = (stones[req.stoneId] ?? 0) - req.amount
        if (stones[req.stoneId] <= 0) delete stones[req.stoneId]
      }
      return {
        ...prev,
        gears,
        stones,
        xp: prev.xp + xpGain,
        totalXp: prev.totalXp + xpGain,
        inventions: prev.inventions.map((i) =>
          i.inventionId === inventionId ? { ...i, built: true, builtAt: Date.now() } : i,
        ),
        totalInventionsBuilt: prev.totalInventionsBuilt + 1,
        inventionBuildCountByRarity: {
          ...prev.inventionBuildCountByRarity,
          [invDef.rarity]: prev.inventionBuildCountByRarity[invDef.rarity] + 1,
        },
      }
    })
    return true
  }, [ctCanBuildInvention])

  const ctUpgradeInvention = useCallback((inventionId: string): boolean => {
    const invDef = CT_INVENTIONS.find((i) => i.id === inventionId)
    if (!invDef) return false
    const s = stateRef.current
    const existing = s.inventions.find((i) => i.inventionId === inventionId)
    if (!existing || !existing.built) return false
    if (existing.upgrades >= 5) return false
    const cost = Math.floor(invDef.xpReward * 2 * (existing.upgrades + 1))
    if (s.coins < cost) return false
    const xpGain = Math.floor(invDef.xpReward * 0.5)
    setState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      totalCoinsSpent: prev.totalCoinsSpent + cost,
      xp: prev.xp + xpGain,
      totalXp: prev.totalXp + xpGain,
      inventions: prev.inventions.map((i) =>
        i.inventionId === inventionId ? { ...i, upgrades: i.upgrades + 1 } : i,
      ),
    }))
    return true
  }, [])

  const ctGetInventionUpgradeCost = useCallback((inventionId: string): number => {
    const invDef = CT_INVENTIONS.find((i) => i.id === inventionId)
    if (!invDef) return 0
    const existing = stateRef.current.inventions.find((i) => i.inventionId === inventionId)
    if (!existing || !existing.built || existing.upgrades >= 5) return 0
    return Math.floor(invDef.xpReward * 2 * (existing.upgrades + 1))
  }, [])

  // ===========================================================================
  // Creature Taming
  // ===========================================================================

  const ctCanTameCreature = useCallback((creatureId: string): boolean => {
    const creatureDef = CT_CLOCKWORK_CREATURES.find((c) => c.id === creatureId)
    if (!creatureDef) return false
    const s = stateRef.current
    if (s.level < creatureDef.requiredLevel) return false
    if (s.coins < creatureDef.tamingCost) return false
    const existing = s.creatures.find((c) => c.creatureId === creatureId)
    return !existing?.tamed
  }, [])

  const ctTameCreature = useCallback((creatureId: string): boolean => {
    if (!ctCanTameCreature(creatureId)) return false
    const creatureDef = CT_CLOCKWORK_CREATURES.find((c) => c.id === creatureId)
    if (!creatureDef) return false
    const xpGain = Math.floor(20 * ctRarityMultiplier(creatureDef.rarity))
    setState((prev) => ({
      ...prev,
      coins: prev.coins - creatureDef.tamingCost,
      totalCoinsSpent: prev.totalCoinsSpent + creatureDef.tamingCost,
      creatures: prev.creatures.map((c) =>
        c.creatureId === creatureId ? { ...c, tamed: true, tamedAt: Date.now(), active: true } : c,
      ),
      xp: prev.xp + xpGain,
      totalXp: prev.totalXp + xpGain,
      totalCreaturesTamed: prev.totalCreaturesTamed + 1,
    }))
    return true
  }, [ctCanTameCreature])

  const ctSetActiveCreature = useCallback((creatureId: string, active: boolean) => {
    const s = stateRef.current
    const existing = s.creatures.find((c) => c.creatureId === creatureId)
    if (!existing?.tamed) return
    setState((prev) => ({
      ...prev,
      creatures: prev.creatures.map((c) =>
        c.creatureId === creatureId ? { ...c, active } : c,
      ),
    }))
  }, [])

  // ===========================================================================
  // Paradox Management
  // ===========================================================================

  const ctResolveParadox = useCallback((paradoxId: string): boolean => {
    const s = stateRef.current
    const paradox = s.paradoxes.find((p) => p.id === paradoxId)
    if (!paradox || paradox.resolved) return false
    if (s.timeEnergy < 20) return false
    const reduction = paradox.type === 'catastrophic' ? 30 : paradox.type === 'major' ? 20 : 10
    const xpGain = paradox.type === 'catastrophic' ? 100 : paradox.type === 'major' ? 50 : 20
    const coinsGained = paradox.type === 'catastrophic' ? 80 : paradox.type === 'major' ? 40 : 15
    setState((prev) => ({
      ...prev,
      timeEnergy: Math.max(0, prev.timeEnergy - 20),
      paradoxMeter: Math.max(0, prev.paradoxMeter - reduction),
      paradoxes: prev.paradoxes.map((p) =>
        p.id === paradoxId ? { ...p, resolved: true } : p,
      ),
      totalParadoxesResolved: prev.totalParadoxesResolved + 1,
      xp: prev.xp + xpGain,
      totalXp: prev.totalXp + xpGain,
      coins: prev.coins + coinsGained,
      totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
    }))
    return true
  }, [])

  const ctGenerateParadox = useCallback((): CTParadoxEvent | null => {
    const s = stateRef.current
    if (s.paradoxMeter < 30) return null
    const types: Array<'minor' | 'major' | 'catastrophic'> = ['minor', 'minor', 'minor', 'major', 'major']
    if (s.paradoxMeter >= 80) types.push('catastrophic', 'catastrophic')
    const descriptions = [
      'A gear began turning backwards, disrupting the local timeline',
      'Two moments in time collided, creating a temporal echo',
      'A clock struck thirteen, opening a rift to an alternate timeline',
      'The pendulum stopped, freezing everything in the chamber',
      'Time flowed sideways, causing objects to age and de-age randomly',
      'A shadow from the future appeared, warning of an impending paradox',
      'The clock hands spun wildly, blurring the boundary between past and future',
      'An echo of a previous visit caused a timeline duplication event',
    ]
    const type = types[Math.floor(s.paradoxMeter * 7) % types.length]
    const desc = descriptions[Math.floor(s.paradoxMeter * 13) % descriptions.length]
    const newParadox: CTParadoxEvent = {
      id: `paradox_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      description: desc,
      occurredAt: Date.now(),
      resolved: false,
    }
    setState((prev) => ({
      ...prev,
      paradoxes: [...prev.paradoxes, newParadox],
      paradoxMeter: Math.max(0, prev.paradoxMeter - 20),
    }))
    return newParadox
  }, [])

  const ctReduceParadoxMeter = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      paradoxMeter: Math.max(0, prev.paradoxMeter - amount),
    }))
  }, [])

  const ctAddTimeEnergy = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      timeEnergy: Math.min(prev.maxTimeEnergy, prev.timeEnergy + amount),
    }))
  }, [])

  const ctSpendTimeEnergy = useCallback((amount: number): boolean => {
    const s = stateRef.current
    if (s.timeEnergy < amount) return false
    setState((prev) => ({
      ...prev,
      timeEnergy: Math.max(0, prev.timeEnergy - amount),
    }))
    return true
  }, [])

  // ===========================================================================
  // Streak Management
  // ===========================================================================

  const ctUpdateStreak = useCallback(() => {
    const todayKey = ctGenerateDayKey(Date.now())
    setState((prev) => {
      if (prev.lastPlayDate === todayKey) return prev
      const last = prev.lastPlayDate
      let newStreak = 1
      if (last) {
        const parts = last.split('-').map(Number)
        const lastDate = new Date(parts[0], parts[1] - 1, parts[2])
        const today = new Date()
        const diff = Math.floor((today.getTime() - lastDate.getTime()) / 86400000)
        if (diff === 1) {
          newStreak = prev.streak + 1
        } else if (diff > 1) {
          newStreak = 1
        }
      }
      const newBest = Math.max(prev.bestStreak, newStreak)
      return { ...prev, streak: newStreak, bestStreak: newBest, lastPlayDate: todayKey }
    })
  }, [])

  const ctResetStreak = useCallback(() => {
    setState((prev) => ({ ...prev, streak: 0 }))
  }, [])

  // ===========================================================================
  // Achievement Checking
  // ===========================================================================

  const ctCheckAchievements = useCallback((): CTAchievementDef[] => {
    const s = stateRef.current
    const newlyUnlocked: CTAchievementDef[] = []
    setState((prev) => {
      let updated = prev
      for (const achDef of CT_ACHIEVEMENTS) {
        const existing = updated.achievements.find((a) => a.id === achDef.id)
        if (existing?.unlocked) continue
        let conditionMet = false
        if (achDef.conditionKey === 'totalClocksWound') conditionMet = updated.totalClocksWound >= achDef.targetValue
        else if (achDef.conditionKey === 'totalGearsCrafted') conditionMet = updated.totalGearsCrafted >= achDef.targetValue
        else if (achDef.conditionKey === 'totalFloorsExplored') conditionMet = updated.totalFloorsExplored >= achDef.targetValue
        else if (achDef.conditionKey === 'totalSecretsFound') conditionMet = updated.totalSecretsFound >= achDef.targetValue
        else if (achDef.conditionKey === 'totalInventionsBuilt') conditionMet = updated.totalInventionsBuilt >= achDef.targetValue
        else if (achDef.conditionKey === 'totalCreaturesTamed') conditionMet = updated.totalCreaturesTamed >= achDef.targetValue
        else if (achDef.conditionKey === 'totalTimeManipulations') conditionMet = updated.totalTimeManipulations >= achDef.targetValue
        else if (achDef.conditionKey === 'totalParadoxesResolved') conditionMet = updated.totalParadoxesResolved >= achDef.targetValue
        else if (achDef.conditionKey === 'bestStreak') conditionMet = updated.bestStreak >= achDef.targetValue
        else if (achDef.conditionKey === 'totalCoinsEarned') conditionMet = updated.totalCoinsEarned >= achDef.targetValue
        else if (achDef.conditionKey === 'gearCraftCountByRarity_epic') conditionMet = updated.gearCraftCountByRarity.epic >= achDef.targetValue
        else if (achDef.conditionKey === 'gearCraftCountByRarity_legendary') conditionMet = updated.gearCraftCountByRarity.legendary >= achDef.targetValue
        if (conditionMet) {
          newlyUnlocked.push(achDef)
          updated = {
            ...updated,
            achievements: updated.achievements.map((a) =>
              a.id === achDef.id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a,
            ),
            xp: updated.xp + achDef.rewardXp,
            totalXp: updated.totalXp + achDef.rewardXp,
            coins: updated.coins + achDef.rewardCoins,
            totalCoinsEarned: updated.totalCoinsEarned + achDef.rewardCoins,
          }
        }
      }
      return updated
    })
    return newlyUnlocked
  }, [])

  // ===========================================================================
  // Quest Management
  // ===========================================================================

  const ctAcceptQuest = useCallback((questId: string): boolean => {
    const questDef = CT_QUESTS.find((q) => q.id === questId)
    if (!questDef) return false
    const s = stateRef.current
    if (s.level < questDef.requiredLevel) return false
    const existing = s.quests.find((q) => q.id === questId)
    if (!existing || existing.status !== 'available') return false
    setState((prev) => ({
      ...prev,
      quests: prev.quests.map((q) =>
        q.id === questId ? { ...q, status: 'active' as CTQuestStatus } : q,
      ),
    }))
    return true
  }, [])

  const ctUpdateQuestProgress = useCallback((questId: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      quests: prev.quests.map((q) => {
        if (q.id !== questId || q.status !== 'active') return q
        const newProgress = Math.min(q.progress + delta, CT_QUESTS.find((d) => d.id === questId)?.targetValue ?? q.progress + delta)
        return { ...q, progress: newProgress }
      }),
    }))
  }, [])

  const ctCheckQuestCompletion = useCallback((): CTQuestDef[] => {
    const s = stateRef.current
    const completed: CTQuestDef[] = []
    setState((prev) => {
      let updated = prev
      for (const questDef of CT_QUESTS) {
        const existing = updated.quests.find((q) => q.id === questDef.id)
        if (!existing || existing.status !== 'active') continue
        let currentValue = 0
        if (questDef.conditionKey === 'masterAll') {
          currentValue = [
            updated.totalFloorsExplored >= 8 ? 1 : 0,
            updated.totalInventionsBuilt >= 10 ? 1 : 0,
            updated.totalCreaturesTamed >= 7 ? 1 : 0,
          ].reduce((a, b) => a + b, 0)
        } else if (questDef.conditionKey === 'totalClocksWound') currentValue = updated.totalClocksWound
        else if (questDef.conditionKey === 'totalGearsCrafted') currentValue = updated.totalGearsCrafted
        else if (questDef.conditionKey === 'totalFloorsExplored') currentValue = updated.totalFloorsExplored
        else if (questDef.conditionKey === 'totalInventionsBuilt') currentValue = updated.totalInventionsBuilt
        else if (questDef.conditionKey === 'totalCreaturesTamed') currentValue = updated.totalCreaturesTamed
        else if (questDef.conditionKey === 'totalTimeManipulations') currentValue = updated.totalTimeManipulations
        else if (questDef.conditionKey === 'totalParadoxesResolved') currentValue = updated.totalParadoxesResolved
        else if (questDef.conditionKey === 'totalSecretsFound') currentValue = updated.totalSecretsFound
        if (currentValue >= questDef.targetValue) {
          completed.push(questDef)
          updated = {
            ...updated,
            quests: updated.quests.map((q) =>
              q.id === questDef.id ? { ...q, status: 'completed' as CTQuestStatus, progress: currentValue } : q,
            ),
            xp: updated.xp + questDef.rewardXp,
            totalXp: updated.totalXp + questDef.rewardXp,
            coins: updated.coins + questDef.rewardCoins,
            totalCoinsEarned: updated.totalCoinsEarned + questDef.rewardCoins,
          }
        }
      }
      return updated
    })
    return completed
  }, [])

  // ===========================================================================
  // Query Helpers
  // ===========================================================================

  const ctGetGearDef = useCallback((gearId: string): CTGearDef | undefined => {
    return CT_GEARS.find((g) => g.id === gearId)
  }, [])

  const ctGetFloorDef = useCallback((floorId: CTFloorId): CTFloorDef | undefined => {
    return CT_FLOORS.find((f) => f.id === floorId)
  }, [])

  const ctGetStoneDef = useCallback((stoneId: string): CTTimeStoneDef | undefined => {
    return CT_TIMESTONES.find((s) => s.id === stoneId)
  }, [])

  const ctGetInventionDef = useCallback((inventionId: string): CTInventionDef | undefined => {
    return CT_INVENTIONS.find((i) => i.id === inventionId)
  }, [])

  const ctGetCreatureDef = useCallback((creatureId: string): CTCreatureDef | undefined => {
    return CT_CLOCKWORK_CREATURES.find((c) => c.id === creatureId)
  }, [])

  const ctGetClockDef = useCallback((clockId: string): CTClockDef | undefined => {
    return CT_CLOCKS.find((c) => c.id === clockId)
  }, [])

  const ctGetRarityDef = useCallback((rarity: CTRarity): CTRarityDef | undefined => {
    return CT_RARITIES.find((r) => r.key === rarity)
  }, [])

  const ctGetRarityColor = useCallback((rarity: CTRarity): string => {
    return CT_RARITIES.find((r) => r.key === rarity)?.color ?? '#A1887F'
  }, [])

  const ctGetRarityLabel = useCallback((rarity: CTRarity): string => {
    return CT_RARITIES.find((r) => r.key === rarity)?.label ?? 'Common'
  }, [])

  const ctGetAllGears = useCallback((): CTGearDef[] => CT_GEARS, [])
  const ctGetAllFloors = useCallback((): CTFloorDef[] => CT_FLOORS, [])
  const ctGetAllStones = useCallback((): CTTimeStoneDef[] => CT_TIMESTONES, [])
  const ctGetAllInventions = useCallback((): CTInventionDef[] => CT_INVENTIONS, [])
  const ctGetAllCreatures = useCallback((): CTCreatureDef[] => CT_CLOCKWORK_CREATURES, [])
  const ctGetAllClocks = useCallback((): CTClockDef[] => CT_CLOCKS, [])
  const ctGetAllTitles = useCallback((): CTTitleDef[] => CT_TITLES, [])
  const ctGetAllAchievements = useCallback((): CTAchievementDef[] => CT_ACHIEVEMENTS, [])
  const ctGetAllQuests = useCallback((): CTQuestDef[] => CT_QUESTS, [])
  const ctGetAllRarities = useCallback((): CTRarityDef[] => CT_RARITIES, [])

  const ctGetGearsByRarity = useCallback((rarity: CTRarity): CTGearDef[] => {
    return CT_GEARS.filter((g) => g.rarity === rarity)
  }, [])

  const ctGetGearsByMaterial = useCallback((material: CTGearMaterial): CTGearDef[] => {
    return CT_GEARS.filter((g) => g.material === material)
  }, [])

  const ctGetStonesByEffect = useCallback((effect: CTTimeEffect): CTTimeStoneDef[] => {
    return CT_TIMESTONES.filter((s) => s.timeEffect === effect)
  }, [])

  const ctGetStonesByRarity = useCallback((rarity: CTRarity): CTTimeStoneDef[] => {
    return CT_TIMESTONES.filter((s) => s.rarity === rarity)
  }, [])

  const ctGetInventionsByCategory = useCallback((category: CTInventionCategory): CTInventionDef[] => {
    return CT_INVENTIONS.filter((i) => i.category === category)
  }, [])

  const ctGetInventionsByRarity = useCallback((rarity: CTRarity): CTInventionDef[] => {
    return CT_INVENTIONS.filter((i) => i.rarity === rarity)
  }, [])

  const ctGetCreaturesByBehavior = useCallback((behavior: CTCreatureBehavior): CTCreatureDef[] => {
    return CT_CLOCKWORK_CREATURES.filter((c) => c.behavior === behavior)
  }, [])

  const ctGetCreaturesByRarity = useCallback((rarity: CTRarity): CTCreatureDef[] => {
    return CT_CLOCKWORK_CREATURES.filter((c) => c.rarity === rarity)
  }, [])

  const ctGetClocksByFloor = useCallback((floorId: CTFloorId): CTClockDef[] => {
    return CT_CLOCKS.filter((c) => c.floorId === floorId)
  }, [])

  const ctGetCraftableGears = useCallback((): CTGearDef[] => {
    const s = stateRef.current
    return CT_GEARS.filter((g) => s.level >= g.requiredLevel && s.coins >= g.craftCost)
  }, [])

  const ctGetBuildableInventions = useCallback((): CTInventionDef[] => {
    const s = stateRef.current
    return CT_INVENTIONS.filter((inv) => {
      if (s.level < inv.requiredLevel) return false
      const existing = s.inventions.find((i) => i.inventionId === inv.id)
      if (existing?.built) return false
      for (const req of inv.requiredGears) {
        if ((s.gears[req.gearId] ?? 0) < req.amount) return false
      }
      for (const req of inv.requiredStones) {
        if ((s.stones[req.stoneId] ?? 0) < req.amount) return false
      }
      return true
    })
  }, [])

  const ctGetTameableCreatures = useCallback((): CTCreatureDef[] => {
    const s = stateRef.current
    return CT_CLOCKWORK_CREATURES.filter((c) => {
      if (s.level < c.requiredLevel) return false
      if (s.coins < c.tamingCost) return false
      const existing = s.creatures.find((cs) => cs.creatureId === c.id)
      return !existing?.tamed
    })
  }, [])

  const ctGetUnlockedAchievementDefs = useCallback((): CTAchievementDef[] => {
    const s = stateRef.current
    const unlockedIds = s.achievements.filter((a) => a.unlocked).map((a) => a.id)
    return CT_ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id))
  }, [])

  const ctGetLockedAchievementDefs = useCallback((): CTAchievementDef[] => {
    const s = stateRef.current
    const unlockedIds = s.achievements.filter((a) => a.unlocked).map((a) => a.id)
    return CT_ACHIEVEMENTS.filter((a) => !unlockedIds.includes(a.id))
  }, [])

  const ctGetUnlockedFloors = useCallback((): CTFloorState[] => {
    return stateRef.current.floors.filter((f) => f.explored)
  }, [])

  const ctGetLockedFloors = useCallback((): CTFloorState[] => {
    return stateRef.current.floors.filter((f) => !f.explored)
  }, [])

  const ctGetNextTitle = useCallback((): CTTitleDef | undefined => {
    const s = stateRef.current
    return CT_TITLES.find((t) => t.levelRequired > s.level)
  }, [])

  const ctGetCurrentTitleInfo = useCallback((): CTTitleDef | undefined => {
    const s = stateRef.current
    return [...CT_TITLES].reverse().find((t) => s.level >= t.levelRequired)
  }, [])

  const ctGetBuiltInventions = useCallback((): CTInventionState[] => {
    return stateRef.current.inventions.filter((i) => i.built)
  }, [])

  const ctGetTamedCreatures = useCallback((): CTCreatureState[] => {
    return stateRef.current.creatures.filter((c) => c.tamed)
  }, [])

  const ctGetActiveCreatures = useCallback((): CTCreatureState[] => {
    return stateRef.current.creatures.filter((c) => c.tamed && c.active)
  }, [])

  const ctGetUnresolvedParadoxes = useCallback((): CTParadoxEvent[] => {
    return stateRef.current.paradoxes.filter((p) => !p.resolved)
  }, [])

  const ctIsFloorExplored = useCallback((floorId: CTFloorId): boolean => {
    return stateRef.current.floors.find((f) => f.id === floorId)?.explored ?? false
  }, [])

  const ctIsInventionBuilt = useCallback((inventionId: string): boolean => {
    return stateRef.current.inventions.find((i) => i.inventionId === inventionId)?.built ?? false
  }, [])

  const ctIsCreatureTamed = useCallback((creatureId: string): boolean => {
    return stateRef.current.creatures.find((c) => c.creatureId === creatureId)?.tamed ?? false
  }, [])

  const ctIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return stateRef.current.achievements.find((a) => a.id === achievementId)?.unlocked ?? false
  }, [])

  // ===========================================================================
  // Daily Reward
  // ===========================================================================

  const ctGetDailyReward = useCallback((): { coins: number; xp: number; energy: number; claimed: boolean } => {
    const todayKey = ctGenerateDayKey(Date.now())
    const s = stateRef.current
    const claimed = s.dailyDate === todayKey && s.dailyClocksWound > 0
    const streakBonus = Math.min(s.streak, 7)
    const coins = 15 + streakBonus * 5
    const xp = 25 + streakBonus * 10
    const energy = 10 + streakBonus * 3
    return { coins, xp, energy, claimed }
  }, [])

  const ctClaimDailyReward = useCallback((): { coins: number; xp: number; energy: number } | null => {
    const todayKey = ctGenerateDayKey(Date.now())
    const s = stateRef.current
    const alreadyClaimed = s.dailyDate === todayKey && s.dailyClocksWound > 0
    if (alreadyClaimed) return null
    const reward = ctGetDailyReward()
    setState((prev) => ({
      ...prev,
      coins: prev.coins + reward.coins,
      totalCoinsEarned: prev.totalCoinsEarned + reward.coins,
      xp: prev.xp + reward.xp,
      totalXp: prev.totalXp + reward.xp,
      timeEnergy: Math.min(prev.maxTimeEnergy, prev.timeEnergy + reward.energy),
      dailyDate: todayKey,
      dailyClocksWound: Math.max(prev.dailyClocksWound, 1),
    }))
    return reward
  }, [ctGetDailyReward])

  // ===========================================================================
  // Completion / Stats
  // ===========================================================================

  const ctGetGearCompletionPercent = useCallback((): number => {
    const total = CT_GEARS.length
    if (total === 0) return 0
    const s = stateRef.current
    const ownedTypes = Object.keys(s.gears).filter((k) => (s.gears[k] ?? 0) > 0).length
    return Math.floor((ownedTypes / total) * 100)
  }, [])

  const ctGetInventionCompletionPercent = useCallback((): number => {
    const total = CT_INVENTIONS.length
    if (total === 0) return 0
    const built = stateRef.current.inventions.filter((i) => i.built).length
    return Math.floor((built / total) * 100)
  }, [])

  const ctGetCreatureCompletionPercent = useCallback((): number => {
    const total = CT_CLOCKWORK_CREATURES.length
    if (total === 0) return 0
    const tamed = stateRef.current.creatures.filter((c) => c.tamed).length
    return Math.floor((tamed / total) * 100)
  }, [])

  const ctGetFloorCompletionPercent = useCallback((): number => {
    const total = CT_FLOORS.length
    if (total === 0) return 0
    const explored = stateRef.current.floors.filter((f) => f.explored).length
    return Math.floor((explored / total) * 100)
  }, [])

  const ctGetOverallCompletionPercent = useCallback((): number => {
    const gearPct = ctGetGearCompletionPercent()
    const invPct = ctGetInventionCompletionPercent()
    const creaturePct = ctGetCreatureCompletionPercent()
    const floorPct = ctGetFloorCompletionPercent()
    const achPct = (stateRef.current.achievements.filter((a) => a.unlocked).length / CT_ACHIEVEMENTS.length) * 100
    return Math.floor((gearPct + invPct + creaturePct + floorPct + achPct) / 5)
  }, [ctGetGearCompletionPercent, ctGetInventionCompletionPercent, ctGetCreatureCompletionPercent, ctGetFloorCompletionPercent])

  const ctGetActiveCreaturePower = useCallback((): number => {
    const activeCreatures = stateRef.current.creatures.filter((c) => c.tamed && c.active)
    let totalPower = 0
    for (const cs of activeCreatures) {
      const def = CT_CLOCKWORK_CREATURES.find((c) => c.id === cs.creatureId)
      if (def) totalPower += def.power
    }
    return totalPower
  }, [])

  const ctGetTotalGearInventoryCount = useCallback((): number => {
    const s = stateRef.current
    return Object.values(s.gears).reduce((sum, count) => sum + count, 0)
  }, [])

  const ctGetTotalStoneInventoryCount = useCallback((): number => {
    const s = stateRef.current
    return Object.values(s.stones).reduce((sum, count) => sum + count, 0)
  }, [])

  const ctGetHighestPrecisionGear = useCallback((): CTGearDef | undefined => {
    const s = stateRef.current
    const ownedGearIds = Object.keys(s.gears).filter((k) => (s.gears[k] ?? 0) > 0)
    let best: CTGearDef | undefined
    for (const id of ownedGearIds) {
      const def = CT_GEARS.find((g) => g.id === id)
      if (def && (!best || def.precision > best.precision)) best = def
    }
    return best
  }, [])

  const ctGetBuiltInventionCount = useCallback((): number => {
    return stateRef.current.inventions.filter((i) => i.built).length
  }, [])

  const ctGetTamedCreatureCount = useCallback((): number => {
    return stateRef.current.creatures.filter((c) => c.tamed).length
  }, [])

  const ctGetFloorSecretProgress = useCallback((floorId: CTFloorId): { found: number; max: number } => {
    const floor = stateRef.current.floors.find((f) => f.id === floorId)
    return { found: floor?.secretsFound ?? 0, max: floor?.maxSecrets ?? 0 }
  }, [])

  const ctIsDailyAvailable = useCallback((): boolean => {
    const todayKey = ctGenerateDayKey(Date.now())
    const s = stateRef.current
    return s.dailyDate !== todayKey || s.dailyClocksWound === 0
  }, [])

  const ctGetMaterialLabel = useCallback((material: CTGearMaterial): string => {
    const labels: Record<CTGearMaterial, string> = {
      brass: 'Brass',
      silver: 'Silver',
      crystal: 'Crystal',
      gold: 'Gold',
      platinum: 'Platinum',
      obsidian: 'Obsidian',
      mythril: 'Mythril',
      chronium: 'Chronium',
    }
    return labels[material] ?? 'Unknown'
  }, [])

  const ctGetEnchantmentLabel = useCallback((enchantment: CTEnchantmentType): string => {
    const labels: Record<CTEnchantmentType, string> = {
      none: 'None',
      haste: 'Haste',
      freeze: 'Freeze',
      reverse: 'Reverse',
      loop: 'Loop',
      phase: 'Phase',
    }
    return labels[enchantment] ?? 'None'
  }, [])

  const ctGetSizeLabel = useCallback((size: string): string => {
    const labels: Record<string, string> = {
      tiny: 'Tiny',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      massive: 'Massive',
    }
    return labels[size] ?? size
  }, [])

  const ctGetBehaviorLabel = useCallback((behavior: CTCreatureBehavior): string => {
    const labels: Record<CTCreatureBehavior, string> = {
      patrol: 'Patrol',
      guard: 'Guard',
      companion: 'Companion',
      trader: 'Trader',
      puzzle: 'Puzzle Solver',
    }
    return labels[behavior] ?? behavior
  }, [])

  const ctGetTimeEffectLabel = useCallback((effect: CTTimeEffect): string => {
    const labels: Record<CTTimeEffect, string> = {
      accelerate: 'Accelerate',
      decelerate: 'Decelerate',
      freeze: 'Freeze',
      rewind: 'Rewind',
      loop: 'Loop',
      shift: 'Shift',
    }
    return labels[effect] ?? effect
  }, [])

  // ===========================================================================
  // RESET (NOT wrapped in useCallback — avoids lint warning)
  // ===========================================================================

  function ctResetProgress() {
    const fresh = ctCreateDefaultState()
    setState(fresh)
    stateRef.current = fresh
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('clock-tower-save')
      } catch {
        // ignore
      }
    }
  }

  // ===========================================================================
  // Return All Functions
  // ===========================================================================

  return {
    // Simple Getters
    ctGetLevel,
    ctGetXp,
    ctGetTotalXp,
    ctGetCoins,
    ctGetTotalCoinsEarned,
    ctGetTotalCoinsSpent,
    ctGetGears,
    ctGetStones,
    ctGetInventions,
    ctGetCreatures,
    ctGetFloors,
    ctGetClocks,
    ctGetAchievements,
    ctGetQuests,
    ctGetParadoxes,
    ctGetTitle,
    ctGetParadoxMeter,
    ctGetMaxParadoxMeter,
    ctGetTimeEnergy,
    ctGetMaxTimeEnergy,
    ctGetTotalClocksWound,
    ctGetTotalGearsCrafted,
    ctGetTotalInventionsBuilt,
    ctGetTotalCreaturesTamed,
    ctGetTotalFloorsExplored,
    ctGetTotalParadoxesResolved,
    ctGetTotalTimeManipulations,
    ctGetTotalSecretsFound,
    ctGetStreak,
    ctGetBestStreak,
    ctGetDailyClocksWound,
    ctGetActiveFloor,
    ctGetGearCraftCountByRarity,
    ctGetInventionBuildCountByRarity,
    ctGetState,
    ctGetTodayKey,
    ctGetXpRequired,
    ctGetXpProgress,
    ctGetOverallProgress,
    ctGetGearCount,
    ctGetStoneCount,
    ctGetParadoxPercent,
    ctGetTimeEnergyPercent,
    // Level / XP / Coins Modifiers
    ctAddXp,
    ctSetLevel,
    ctSetXp,
    ctAddCoins,
    ctSpendCoins,
    ctSetCoins,
    ctCanAfford,
    // Gear Management
    ctHasGear,
    ctAddGear,
    ctRemoveGear,
    ctCraftGear,
    ctCanCraftGear,
    // Time Stone Management
    ctHasStone,
    ctAddStone,
    ctRemoveStone,
    ctUseTimeStone,
    // Clock Winding
    ctCanWindClock,
    ctWindClock,
    ctGetClockCooldownRemaining,
    // Floor Exploration
    ctCanExploreFloor,
    ctExploreFloor,
    ctSetActiveFloor,
    // Invention Building
    ctCanBuildInvention,
    ctBuildInvention,
    ctUpgradeInvention,
    ctGetInventionUpgradeCost,
    // Creature Taming
    ctCanTameCreature,
    ctTameCreature,
    ctSetActiveCreature,
    // Paradox Management
    ctResolveParadox,
    ctGenerateParadox,
    ctReduceParadoxMeter,
    ctAddTimeEnergy,
    ctSpendTimeEnergy,
    // Streak Management
    ctUpdateStreak,
    ctResetStreak,
    // Achievement Checking
    ctCheckAchievements,
    // Quest Management
    ctAcceptQuest,
    ctUpdateQuestProgress,
    ctCheckQuestCompletion,
    // Query Helpers
    ctGetGearDef,
    ctGetFloorDef,
    ctGetStoneDef,
    ctGetInventionDef,
    ctGetCreatureDef,
    ctGetClockDef,
    ctGetRarityDef,
    ctGetRarityColor,
    ctGetRarityLabel,
    ctGetAllGears,
    ctGetAllFloors,
    ctGetAllStones,
    ctGetAllInventions,
    ctGetAllCreatures,
    ctGetAllClocks,
    ctGetAllTitles,
    ctGetAllAchievements,
    ctGetAllQuests,
    ctGetAllRarities,
    ctGetGearsByRarity,
    ctGetGearsByMaterial,
    ctGetStonesByEffect,
    ctGetStonesByRarity,
    ctGetInventionsByCategory,
    ctGetInventionsByRarity,
    ctGetCreaturesByBehavior,
    ctGetCreaturesByRarity,
    ctGetClocksByFloor,
    ctGetCraftableGears,
    ctGetBuildableInventions,
    ctGetTameableCreatures,
    ctGetUnlockedAchievementDefs,
    ctGetLockedAchievementDefs,
    ctGetUnlockedFloors,
    ctGetLockedFloors,
    ctGetNextTitle,
    ctGetCurrentTitleInfo,
    ctGetBuiltInventions,
    ctGetTamedCreatures,
    ctGetActiveCreatures,
    ctGetUnresolvedParadoxes,
    ctIsFloorExplored,
    ctIsInventionBuilt,
    ctIsCreatureTamed,
    ctIsAchievementUnlocked,
    // Daily Reward
    ctGetDailyReward,
    ctClaimDailyReward,
    // Completion / Stats
    ctGetGearCompletionPercent,
    ctGetInventionCompletionPercent,
    ctGetCreatureCompletionPercent,
    ctGetFloorCompletionPercent,
    ctGetOverallCompletionPercent,
    ctGetActiveCreaturePower,
    ctGetTotalGearInventoryCount,
    ctGetTotalStoneInventoryCount,
    ctGetHighestPrecisionGear,
    ctGetBuiltInventionCount,
    ctGetTamedCreatureCount,
    ctGetFloorSecretProgress,
    ctIsDailyAvailable,
    ctGetMaterialLabel,
    ctGetEnchantmentLabel,
    ctGetSizeLabel,
    ctGetBehaviorLabel,
    ctGetTimeEffectLabel,
    // Reset (plain function)
    ctResetProgress,
  }
}

// =============================================================================
// Module-level Clock Tower Lore Constants
// =============================================================================

export const CT_TOWER_TIPS: string[] = [
  'Wind clocks daily to earn time energy and coins.',
  'The Gear Room unlocks at level 5 — start crafting silver gears early.',
  'Paradoxes build up when you use enchanted gears or powerful time stones.',
  'Resolve paradoxes before the meter fills to avoid catastrophic events.',
  'Tame clockwork creatures for companionship and combat bonuses.',
  'The Apex Observatory at level 46 offers the greatest rewards.',
  'Legendary gears require chronium — the rarest material in the tower.',
  'Build the Crown of Ages to unlock the Lord of Time title.',
  'Chrono Lab experiments can be dangerous — bring frozen time stones.',
  'Each floor has hidden secrets — explore repeatedly to find them all.',
  'The Ouroboros Engine generates infinite time energy when built.',
  'Clockwork Owls reveal hidden gears during floor exploration.',
  'Maintain your daily streak for increasing reward bonuses.',
  'Time stones with the "shift" effect can move objects between timelines.',
  'The paradox meter increases faster on higher floors — plan carefully.',
  'Gear precision determines invention quality and success rate.',
  'Legendary creatures like the Chronium Dragon can control time itself.',
  'The Eternity Room exists outside of time — nothing ages there.',
  'Build the Temporal Anchor to protect yourself from timeline shifts.',
  'Unlock all 8 floors and build 10 inventions for the Tower Master quest.',
]

export const CT_FLOOR_DESCRIPTIONS: Record<CTFloorId, string> = {
  entrance_hall: 'The grand foyer where visitors first enter the Clock Tower. Bronze statues line the walls, and a massive clock face dominates the ceiling.',
  gear_room: 'A vast industrial chamber filled with thousands of interlocking gears. The air hums with mechanical energy and smells of brass polish.',
  pendulum_chamber: 'Towering golden pendulums swing in complex patterns, each one tracking a different temporal current across the multiverse.',
  bell_tower: 'The resonating bells of time hang here — each toll marks a cosmic event, from star births to timeline convergences.',
  time_vault: 'A reinforced vault containing crystalline capsules that preserve captured moments from every era of history.',
  chrono_lab: 'Where temporal experiments push the boundaries of what time can do. Paradoxes are studied and contained here.',
  eternity_room: 'A place beyond time itself. The silence here is absolute, and reality bends to the will of those who enter.',
  apex_observatory: 'The crown of the tower. A vast domed chamber with a ceiling of living starlight showing all of time and space.',
}

export const CT_ENCHANTMENT_DESCRIPTIONS: Record<CTEnchantmentType, string> = {
  none: 'No enchantment — a standard gear with no temporal properties',
  haste: 'Accelerates nearby mechanisms, making them operate faster than normal',
  freeze: 'Emits a chilling aura that can freeze time in a small area',
  reverse: 'Briefly reverses the flow of time, undoing recent events',
  loop: 'Creates a repeating time loop that sustains energy indefinitely',
  phase: 'Allows mechanisms to phase between different moments in time',
}

export const CT_TIME_EFFECT_DESCRIPTIONS: Record<CTTimeEffect, string> = {
  accelerate: 'Speeds up time in the target area, making processes complete faster',
  decelerate: 'Slows down time, reducing the speed of all movement and processes',
  freeze: 'Completely stops time within the affected area for a duration',
  rewind: 'Reverses time in the area, undoing recent changes and damage',
  loop: 'Traps a moment in an infinite loop, repeating the same events',
  shift: 'Shifts the target between parallel timelines and temporal dimensions',
}
