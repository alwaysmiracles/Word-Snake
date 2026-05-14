'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

// =============================================================================
// Velvet Brood Wire — 天鹅绒巢穴 — Spider Brood Management Module
// All constants use VB_ prefix. Hook returns vbAPI object with Pattern A constants.
// Color theme: velvet purple #4B0082, silk white #FFF8DC, venom green #32CD32,
//              shadow black #1a1a2e
// =============================================================================

// === TYPE DEFINITIONS ===

export type VbRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type VbSpiderType =
  | 'velvet_widow'
  | 'silk_weaver'
  | 'venom_fang'
  | 'shadow_spinner'
  | 'crystal_scorpion'
  | 'moon_arachnid'
  | 'ember_tarantula'
export type VbNestId =
  | 'root_cavern'
  | 'moonlit_grotto'
  | 'crystal_den'
  | 'shadow_vault'
  | 'ember_hollow'
  | 'silk_sanctum'
  | 'venom_crypt'
  | 'obsidian_throne'
export type VbMaterialCategory = 'silk' | 'venom' | 'crystal' | 'chitin' | 'amber' | 'shadow_essence'
export type VbStructureType = 'breeding_chamber' | 'silk_farm' | 'venom_lab' | 'guard_tower' | 'storage_vault'
export type VbAbilityElement = 'venom' | 'silk' | 'shadow' | 'crystal' | 'ember' | 'moon' | 'earth'
export type VbEventType =
  | 'brood_migration'
  | 'shadow_surge'
  | 'crystal_bloom'
  | 'moonlit_feast'
  | 'ember_eruption'
  | 'silk_storm'
  | 'venom_plague'
  | 'ancient_awakening'
  | 'queen_summon'
  | 'brood_war'
  | 'void_rift'
  | 'harvest_moon'

export interface VbRarityDef {
  key: VbRarity
  name: string
  color: string
  weight: number
  icon: string
}

export interface VbSpiderDef {
  id: string
  name: string
  icon: string
  type: VbSpiderType
  rarity: VbRarity
  description: string
  power: number
  speed: number
  defense: number
  venomPotency: number
  silkQuality: number
  specialAbility: string
  summonCost: number
  nestPreference: VbNestId
}

export interface VbNestDef {
  id: VbNestId
  name: string
  icon: string
  description: string
  level: number
  resources: Record<VbMaterialCategory, number>
  capacity: number
  unlockLevel: number
  background: string
}

export interface VbMaterialDef {
  id: string
  name: string
  icon: string
  category: VbMaterialCategory
  rarity: VbRarity
  description: string
  value: number
  stackable: boolean
}

export interface VbStructureDef {
  id: string
  name: string
  icon: string
  type: VbStructureType
  description: string
  maxLevel: number
  baseCost: Record<VbMaterialCategory, number>
  levelUpCost: Record<VbMaterialCategory, number>
  effectPerLevel: string
}

export interface VbAbilityDef {
  id: string
  name: string
  icon: string
  element: VbAbilityElement
  description: string
  cooldown: number
  powerCost: number
  damage: number
  effect: string
  unlockLevel: number
}

export interface VbAchievementDef {
  id: string
  name: string
  icon: string
  description: string
  conditionKey: string
  targetValue: number
  rewardXP: number
  rewardCoins: number
}

export interface VbTitleDef {
  id: string
  name: string
  icon: string
  levelRequired: number
  description: string
}

export interface VbArtifactDef {
  id: string
  name: string
  icon: string
  rarity: VbRarity
  description: string
  powerBonus: number
  effect: string
  lore: string
}

export interface VbEventDef {
  id: VbEventType
  name: string
  icon: string
  description: string
  duration: number
  rewards: Record<VbMaterialCategory, number>
  cooldown: number
  unlockLevel: number
}

// === ENTITY INTERFACES ===

export interface VbSpiderEntity {
  id: string
  spiderDefId: string
  nickname: string
  level: number
  xp: number
  health: number
  maxHealth: number
  happiness: number
  assignedNest: VbNestId | null
  summonedAt: number
}

export interface VbNestEntity {
  nestId: VbNestId
  unlocked: boolean
  level: number
  tendCount: number
  lastTended: number
  activeSpiders: number
  resourcesGenerated: number
}

export interface VbInventoryItem {
  materialId: string
  quantity: number
}

export interface VbStructureEntity {
  structureId: string
  built: boolean
  level: number
  placedAtNest: VbNestId | null
}

export interface VbArtifactEntity {
  artifactId: string
  discovered: boolean
  activated: boolean
  discoveredAt: number
  activatedAt: number
}

export interface VbAchievementEntity {
  id: string
  unlocked: boolean
  unlockedAt: number
}

export interface VbEventState {
  eventId: VbEventType
  active: boolean
  startTime: number
  endTime: number
  completionCount: number
  lastCompleted: number
}

// === STATE INTERFACE ===

export interface VelvetBroodState {
  level: number
  xp: number
  totalXp: number
  coins: number
  vbSpiders: VbSpiderEntity[]
  vbNests: VbNestEntity[]
  vbInventory: VbInventoryItem[]
  vbArtifacts: VbArtifactEntity[]
  vbAchievements: VbAchievementEntity[]
  vbStructures: VbStructureEntity[]
  vbTitle: string
  vbEvents: VbEventState[]
  vbStats: VbStats
  tick: number
  initializedAt: number
}

export interface VbStats {
  totalSpidersSummoned: number
  totalNestsTended: number
  totalStructuresBuilt: number
  totalArtifactsActivated: number
  totalEventsTriggered: number
  totalMaterialsCollected: number
  totalXpEarned: number
  totalCoinsSpent: number
  totalVenomHarvested: number
  totalSilkWoven: number
  broodPower: number
  playTicks: number
}

// === COLOR THEME CONSTANTS ===

export const VB_COLOR_VELVET = '#4B0082'
export const VB_COLOR_SILK = '#FFF8DC'
export const VB_COLOR_VENOM = '#32CD32'
export const VB_COLOR_SHADOW = '#1a1a2e'
export const VB_COLOR_AMETHYST = '#9966CC'
export const VB_COLOR_PLUM = '#DDA0DD'
export const VB_COLOR_DEEP_PURPLE = '#301934'
export const VB_COLOR_LAVENDER = '#E6E6FA'
export const VB_COLOR_TOXIC = '#39FF14'
export const VB_COLOR_CRIMSON = '#DC143C'
export const VB_COLOR_GOLD = '#FFD700'
export const VB_COLOR_OBSIDIAN = '#0B0B0B'

// === RARITY DEFINITIONS ===

export const VB_RARITY_COMMON: VbRarityDef = {
  key: 'common', name: 'Common', color: '#A9A9A9', weight: 50, icon: '⬜',
}
export const VB_RARITY_UNCOMMON: VbRarityDef = {
  key: 'uncommon', name: 'Uncommon', color: '#9966CC', weight: 30, icon: '🟪',
}
export const VB_RARITY_RARE: VbRarityDef = {
  key: 'rare', name: 'Rare', color: '#4B0082', weight: 14, icon: '💎',
}
export const VB_RARITY_EPIC: VbRarityDef = {
  key: 'epic', color: '#32CD32', weight: 5, icon: '🔱',
  name: 'Epic',
}
export const VB_RARITY_LEGENDARY: VbRarityDef = {
  key: 'legendary', color: '#FFD700', weight: 1, icon: '👑',
  name: 'Legendary',
}

export const VB_RARITIES: VbRarityDef[] = [
  VB_RARITY_COMMON,
  VB_RARITY_UNCOMMON,
  VB_RARITY_RARE,
  VB_RARITY_EPIC,
  VB_RARITY_LEGENDARY,
]

// === SPIDER TYPE DEFINITIONS ===

export const VB_SPIDER_TYPES: Record<VbSpiderType, { label: string; icon: string }> = {
  velvet_widow: { label: 'Velvet Widow', icon: '🕷️' },
  silk_weaver: { label: 'Silk Weaver', icon: '🕸️' },
  venom_fang: { label: 'Venom Fang', icon: '🦷' },
  shadow_spinner: { label: 'Shadow Spinner', icon: '🌑' },
  crystal_scorpion: { label: 'Crystal Scorpion', icon: '🦂' },
  moon_arachnid: { label: 'Moon Arachnid', icon: '🌙' },
  ember_tarantula: { label: 'Ember Tarantula', icon: '🔥' },
}

// === 35 BROOD SPIDERS (5 rarity tiers × 7 types) ===

export const VB_SPIDERS: VbSpiderDef[] = [
  // ---- Common (7) ----
  {
    id: 'vw_common_dusk', name: 'Dusk Weaver', icon: '🕷️', type: 'velvet_widow',
    rarity: 'common', description: 'A common velvet widow that weaves delicate webs at twilight.',
    power: 5, speed: 6, defense: 4, venomPotency: 3, silkQuality: 5,
    specialAbility: 'Twilight Cloak', summonCost: 10, nestPreference: 'root_cavern',
  },
  {
    id: 'sw_common_gossamer', name: 'Gossamer Spinner', icon: '🕸️', type: 'silk_weaver',
    rarity: 'common', description: 'Produces fine gossamer threads used for basic nest construction.',
    power: 3, speed: 5, defense: 3, venomPotency: 1, silkQuality: 8,
    specialAbility: 'Gossamer Wrap', summonCost: 10, nestPreference: 'silk_sanctum',
  },
  {
    id: 'vf_common_bite', name: 'Grassland Biter', icon: '🦷', type: 'venom_fang',
    rarity: 'common', description: 'A small venomous spider with a mildly toxic bite.',
    power: 6, speed: 5, defense: 3, venomPotency: 7, silkQuality: 2,
    specialAbility: 'Quick Bite', summonCost: 10, nestPreference: 'root_cavern',
  },
  {
    id: 'ss_common_shade', name: 'Shade Crawler', icon: '🌑', type: 'shadow_spinner',
    rarity: 'common', description: 'A dark spider that blends into shadows beneath the nest.',
    power: 4, speed: 7, defense: 4, venomPotency: 3, silkQuality: 4,
    specialAbility: 'Shadow Meld', summonCost: 10, nestPreference: 'shadow_vault',
  },
  {
    id: 'cs_common_shard', name: 'Shard Scuttler', icon: '🦂', type: 'crystal_scorpion',
    rarity: 'common', description: 'A small scorpion with crystalline pincers that crack weak prey.',
    power: 7, speed: 3, defense: 6, venomPotency: 4, silkQuality: 1,
    specialAbility: 'Shard Pinch', summonCost: 10, nestPreference: 'crystal_den',
  },
  {
    id: 'ma_common_glow', name: 'Glowspinner', icon: '🌙', type: 'moon_arachnid',
    rarity: 'common', description: 'Produces a faint bioluminescent glow during moonlit nights.',
    power: 4, speed: 5, defense: 4, venomPotency: 2, silkQuality: 6,
    specialAbility: 'Moon Glow', summonCost: 10, nestPreference: 'moonlit_grotto',
  },
  {
    id: 'et_common_ash', name: 'Ash Leg', icon: '🔥', type: 'ember_tarantula',
    rarity: 'common', description: 'A hardy tarantula that thrives near warm volcanic vents.',
    power: 6, speed: 3, defense: 5, venomPotency: 5, silkQuality: 2,
    specialAbility: 'Warm Shell', summonCost: 10, nestPreference: 'ember_hollow',
  },
  // ---- Uncommon (7) ----
  {
    id: 'vw_uncommon_crimson', name: 'Crimson Velvet', icon: '🕷️', type: 'velvet_widow',
    rarity: 'uncommon', description: 'A red-hued velvet widow whose silk carries a warning crimson hue.',
    power: 10, speed: 8, defense: 7, venomPotency: 6, silkQuality: 9,
    specialAbility: 'Crimson Web', summonCost: 50, nestPreference: 'root_cavern',
  },
  {
    id: 'sw_uncommon_aurora', name: 'Aurora Weaver', icon: '🕸️', type: 'silk_weaver',
    rarity: 'uncommon', description: 'Spins shimmering silk that reflects ambient light like an aurora.',
    power: 6, speed: 9, defense: 5, venomPotency: 2, silkQuality: 14,
    specialAbility: 'Aurora Silk', summonCost: 50, nestPreference: 'silk_sanctum',
  },
  {
    id: 'vf_uncommon_needle', name: 'Needle Fang', icon: '🦷', type: 'venom_fang',
    rarity: 'uncommon', description: 'Long hollow fangs deliver precision venom strikes to vital points.',
    power: 12, speed: 7, defense: 5, venomPotency: 13, silkQuality: 3,
    specialAbility: 'Precision Strike', summonCost: 50, nestPreference: 'venom_crypt',
  },
  {
    id: 'ss_uncommon_eclipse', name: 'Eclipse Dancer', icon: '🌑', type: 'shadow_spinner',
    rarity: 'uncommon', description: 'Moves through shadows as if dancing, nearly invisible in darkness.',
    power: 9, speed: 12, defense: 7, venomPotency: 5, silkQuality: 7,
    specialAbility: 'Eclipse Step', summonCost: 50, nestPreference: 'shadow_vault',
  },
  {
    id: 'cs_uncommon_quartz', name: 'Quartz Stinger', icon: '🦂', type: 'crystal_scorpion',
    rarity: 'uncommon', description: 'Encrusted with quartz crystals that refract light into blinding flashes.',
    power: 14, speed: 5, defense: 11, venomPotency: 7, silkQuality: 2,
    specialAbility: 'Quartz Flash', summonCost: 50, nestPreference: 'crystal_den',
  },
  {
    id: 'ma_uncommon_silver', name: 'Silver Thread', icon: '🌙', type: 'moon_arachnid',
    rarity: 'uncommon', description: 'Spins pure silver moonlight into delicate threads of living light.',
    power: 8, speed: 10, defense: 6, venomPotency: 4, silkQuality: 13,
    specialAbility: 'Silver Web', summonCost: 50, nestPreference: 'moonlit_grotto',
  },
  {
    id: 'et_uncommon_magma', name: 'Magma Carapace', icon: '🔥', type: 'ember_tarantula',
    rarity: 'uncommon', description: 'Molten rock hardens into a protective shell when threatened.',
    power: 13, speed: 5, defense: 12, venomPotency: 9, silkQuality: 3,
    specialAbility: 'Magma Shield', summonCost: 50, nestPreference: 'ember_hollow',
  },
  // ---- Rare (7) ----
  {
    id: 'vw_rare_midnight', name: 'Midnight Matriarch', icon: '🕷️', type: 'velvet_widow',
    rarity: 'rare', description: 'A commanding widow draped in midnight-purple velvet, ruler of the deep nest.',
    power: 20, speed: 12, defense: 14, venomPotency: 12, silkQuality: 16,
    specialAbility: 'Midnight Command', summonCost: 200, nestPreference: 'root_cavern',
  },
  {
    id: 'sw_rare_stardust', name: 'Stardust Loom', icon: '🕸️', type: 'silk_weaver',
    rarity: 'rare', description: 'Weaves silk from captured starlight, creating fabrics of pure radiance.',
    power: 12, speed: 15, defense: 10, venomPotency: 4, silkQuality: 24,
    specialAbility: 'Stardust Fabric', summonCost: 200, nestPreference: 'silk_sanctum',
  },
  {
    id: 'vf_rare_cobra', name: 'Cobra Strike', icon: '🦷', type: 'venom_fang',
    rarity: 'rare', description: 'Delivers a neurotoxic venom that paralyzes prey within seconds.',
    power: 22, speed: 14, defense: 10, venomPotency: 25, silkQuality: 4,
    specialAbility: 'Neurotoxin Bite', summonCost: 200, nestPreference: 'venom_crypt',
  },
  {
    id: 'ss_rare_voidwalker', name: 'Voidwalker', icon: '🌑', type: 'shadow_spinner',
    rarity: 'rare', description: 'Can phase between shadow dimensions, appearing and disappearing at will.',
    power: 16, speed: 20, defense: 12, venomPotency: 10, silkQuality: 12,
    specialAbility: 'Void Phase', summonCost: 200, nestPreference: 'shadow_vault',
  },
  {
    id: 'cs_rare_amethyst', name: 'Amethyst Claw', icon: '🦂', type: 'crystal_scorpion',
    rarity: 'rare', description: 'Enormous claws made of living amethyst that channel crystal energy.',
    power: 25, speed: 8, defense: 22, venomPotency: 12, silkQuality: 3,
    specialAbility: 'Crystal Surge', summonCost: 200, nestPreference: 'crystal_den',
  },
  {
    id: 'ma_rare_harvest', name: 'Harvest Moon', icon: '🌙', type: 'moon_arachnid',
    rarity: 'rare', description: 'Only appears during harvest moons, empowered by lunar gravitational tides.',
    power: 15, speed: 16, defense: 14, venomPotency: 8, silkQuality: 20,
    specialAbility: 'Tidal Pull', summonCost: 200, nestPreference: 'moonlit_grotto',
  },
  {
    id: 'et_rare_inferno', name: 'Inferno Hairy', icon: '🔥', type: 'ember_tarantula',
    rarity: 'rare', description: 'Igneous bristles ignite when agitated, creating a blazing deterrent.',
    power: 24, speed: 10, defense: 18, venomPotency: 18, silkQuality: 5,
    specialAbility: 'Flare Burst', summonCost: 200, nestPreference: 'ember_hollow',
  },
  // ---- Epic (7) ----
  {
    id: 'vw_epic_empress', name: 'Velvet Empress', icon: '🕷️', type: 'velvet_widow',
    rarity: 'epic', description: 'An empress-class widow whose pheromones command obedience from all spiders.',
    power: 35, speed: 18, defense: 22, venomPotency: 20, silkQuality: 25,
    specialAbility: 'Brood Command', summonCost: 800, nestPreference: 'obsidian_throne',
  },
  {
    id: 'sw_epic_celestial', name: 'Celestial Loom', icon: '🕸️', type: 'silk_weaver',
    rarity: 'epic', description: 'Weaves silk that contains miniature constellations and cosmic patterns.',
    power: 20, speed: 24, defense: 16, venomPotency: 6, silkQuality: 40,
    specialAbility: 'Cosmic Web', summonCost: 800, nestPreference: 'silk_sanctum',
  },
  {
    id: 'vf_epic_plague', name: 'Plague Bringer', icon: '🦷', type: 'venom_fang',
    rarity: 'epic', description: 'Its venom spreads as a contagious mist, afflicting entire areas at once.',
    power: 38, speed: 20, defense: 16, venomPotency: 42, silkQuality: 6,
    specialAbility: 'Venom Mist', summonCost: 800, nestPreference: 'venom_crypt',
  },
  {
    id: 'ss_epic_nightmare', name: 'Nightmare Weaver', icon: '🌑', type: 'shadow_spinner',
    rarity: 'epic', description: 'Creates shadow illusions so vivid they manifest as real threats.',
    power: 30, speed: 28, defense: 20, venomPotency: 18, silkQuality: 22,
    specialAbility: 'Nightmare Illusion', summonCost: 800, nestPreference: 'shadow_vault',
  },
  {
    id: 'cs_epic_diamondback', name: 'Diamondback Scorpion', icon: '🦂', type: 'crystal_scorpion',
    rarity: 'epic', description: 'Armored in crystallized diamond scales, nearly impervious to physical damage.',
    power: 42, speed: 12, defense: 38, venomPotency: 22, silkQuality: 4,
    specialAbility: 'Diamond Fortress', summonCost: 800, nestPreference: 'crystal_den',
  },
  {
    id: 'ma_epic_eclipse', name: 'Lunar Eclipse', icon: '🌙', type: 'moon_arachnid',
    rarity: 'epic', description: 'During eclipses, this arachnid absorbs stellar energy for devastating attacks.',
    power: 28, speed: 22, defense: 24, venomPotency: 15, silkQuality: 32,
    specialAbility: 'Eclipse Beam', summonCost: 800, nestPreference: 'moonlit_grotto',
  },
  {
    id: 'et_epic_volcano', name: 'Volcano Heart', icon: '🔥', type: 'ember_tarantula',
    rarity: 'epic', description: 'Said to nest within active volcanoes, radiating intense geothermal power.',
    power: 40, speed: 16, defense: 30, venomPotency: 35, silkQuality: 8,
    specialAbility: 'Eruption Stomp', summonCost: 800, nestPreference: 'ember_hollow',
  },
  // ---- Legendary (7) ----
  {
    id: 'vw_legendary_queen', name: 'Brood Mother Queen', icon: '🕷️', type: 'velvet_widow',
    rarity: 'legendary', description: 'The ancient queen of all velvet widows. Her silk created the first nest.',
    power: 60, speed: 25, defense: 35, venomPotency: 30, silkQuality: 50,
    specialAbility: 'Brood Awakening', summonCost: 3000, nestPreference: 'obsidian_throne',
  },
  {
    id: 'sw_legendary_norns', name: "Norn's Tapestry", icon: '🕸️', type: 'silk_weaver',
    rarity: 'legendary', description: 'Weaves the threads of fate itself into silk tapestries of prophecy.',
    power: 30, speed: 35, defense: 25, venomPotency: 10, silkQuality: 70,
    specialAbility: 'Fate Weaving', summonCost: 3000, nestPreference: 'silk_sanctum',
  },
  {
    id: 'vf_legendary_leviathan', name: 'Leviathan Fang', icon: '🦷', type: 'venom_fang',
    rarity: 'legendary', description: 'A primordial predator whose venom can dissolve any substance in existence.',
    power: 65, speed: 28, defense: 28, venomPotency: 60, silkQuality: 10,
    specialAbility: 'Dissolution Venom', summonCost: 3000, nestPreference: 'venom_crypt',
  },
  {
    id: 'ss_legendary_abyss', name: 'Abyssal Shadow', icon: '🌑', type: 'shadow_spinner',
    rarity: 'legendary', description: 'Born from the void between dimensions. Its shadows consume light itself.',
    power: 50, speed: 40, defense: 30, venomPotency: 25, silkQuality: 35,
    specialAbility: 'Void Devour', summonCost: 3000, nestPreference: 'shadow_vault',
  },
  {
    id: 'cs_legendary_obelisk', name: 'Obelisk Scorpion', icon: '🦂', type: 'crystal_scorpion',
    rarity: 'legendary', description: 'A living crystal monolith. Its carapace holds the memories of ancient civilizations.',
    power: 70, speed: 18, defense: 55, venomPotency: 35, silkQuality: 5,
    specialAbility: 'Crystal Obliteration', summonCost: 3000, nestPreference: 'crystal_den',
  },
  {
    id: 'ma_legendary_celestial', name: 'Celestial Arachne', icon: '🌙', type: 'moon_arachnid',
    rarity: 'legendary', description: 'An arachnid blessed by celestial moons. Her silk shines with eternal starlight.',
    power: 45, speed: 32, defense: 35, venomPotency: 20, silkQuality: 55,
    specialAbility: 'Celestial Weaver', summonCost: 3000, nestPreference: 'moonlit_grotto',
  },
  {
    id: 'et_legendary_phoenix', name: 'Phoenix Tarantula', icon: '🔥', type: 'ember_tarantula',
    rarity: 'legendary', description: 'Reborn from its own ashes. Each death makes it stronger than before.',
    power: 68, speed: 24, defense: 45, venomPotency: 50, silkQuality: 12,
    specialAbility: 'Ash Rebirth', summonCost: 3000, nestPreference: 'ember_hollow',
  },
]

// === 8 NEST LOCATIONS ===

export const VB_NEST_ROOT_CAVERN: VbNestDef = {
  id: 'root_cavern',
  name: 'Root Cavern',
  icon: '🪨',
  description: 'A vast underground cavern tangled with ancient tree roots, the ancestral home of the brood.',
  level: 1,
  resources: { silk: 5, venom: 2, crystal: 1, chitin: 3, amber: 1, shadow_essence: 0 },
  capacity: 10,
  unlockLevel: 1,
  background: 'linear-gradient(135deg, #1a1a2e, #4B0082)',
}

export const VB_NEST_MOONLIT_GROTTO: VbNestDef = {
  id: 'moonlit_grotto',
  name: 'Moonlit Grotto',
  icon: '🌙',
  description: 'An open-air grotto where moonlight pours through crystalline skylights, illuminating silk strands.',
  level: 1,
  resources: { silk: 4, venom: 1, crystal: 3, chitin: 1, amber: 2, shadow_essence: 1 },
  capacity: 12,
  unlockLevel: 5,
  background: 'linear-gradient(135deg, #2D1B69, #9966CC)',
}

export const VB_NEST_CRYSTAL_DEN: VbNestDef = {
  id: 'crystal_den',
  name: 'Crystal Den',
  icon: '💎',
  description: 'Walls lined with resonating crystals that amplify the brood psychic network.',
  level: 1,
  resources: { silk: 1, venom: 1, crystal: 8, chitin: 2, amber: 3, shadow_essence: 0 },
  capacity: 8,
  unlockLevel: 10,
  background: 'linear-gradient(135deg, #0B0B0B, #9966CC)',
}

export const VB_NEST_SHADOW_VAULT: VbNestDef = {
  id: 'shadow_vault',
  name: 'Shadow Vault',
  icon: '🌑',
  description: 'An impossibly dark chamber where shadows move independently and whisper secrets.',
  level: 1,
  resources: { silk: 2, venom: 3, crystal: 1, chitin: 1, amber: 0, shadow_essence: 6 },
  capacity: 15,
  unlockLevel: 15,
  background: 'linear-gradient(135deg, #0a0a14, #1a1a2e)',
}

export const VB_NEST_EMBER_HOLLOW: VbNestDef = {
  id: 'ember_hollow',
  name: 'Ember Hollow',
  icon: '🔥',
  description: 'A volcanic hollow where magma rivers heat the nest to perfect incubation temperature.',
  level: 1,
  resources: { silk: 1, venom: 4, crystal: 2, chitin: 4, amber: 2, shadow_essence: 0 },
  capacity: 10,
  unlockLevel: 20,
  background: 'linear-gradient(135deg, #4B0082, #DC143C)',
}

export const VB_NEST_SILK_SANCTUM: VbNestDef = {
  id: 'silk_sanctum',
  name: 'Silk Sanctum',
  icon: '🕸️',
  description: 'A sacred chamber where the finest silk is woven into protective talismans.',
  level: 1,
  resources: { silk: 10, venom: 1, crystal: 1, chitin: 1, amber: 1, shadow_essence: 1 },
  capacity: 8,
  unlockLevel: 12,
  background: 'linear-gradient(135deg, #FFF8DC, #DDA0DD)',
}

export const VB_NEST_VENOM_CRYPT: VbNestDef = {
  id: 'venom_crypt',
  name: 'Venom Crypt',
  icon: '☠️',
  description: 'Alchemical chambers where venom is refined into potent elixirs and deadly poisons.',
  level: 1,
  resources: { silk: 1, venom: 10, crystal: 2, chitin: 2, amber: 1, shadow_essence: 2 },
  capacity: 10,
  unlockLevel: 18,
  background: 'linear-gradient(135deg, #1a1a2e, #32CD32)',
}

export const VB_NEST_OBSIDIAN_THRONE: VbNestDef = {
  id: 'obsidian_throne',
  name: 'Obsidian Throne',
  icon: '👑',
  description: 'The legendary seat of the Brood Mother, carved from a single piece of volcanic obsidian.',
  level: 1,
  resources: { silk: 3, venom: 3, crystal: 5, chitin: 5, amber: 5, shadow_essence: 5 },
  capacity: 20,
  unlockLevel: 30,
  background: 'linear-gradient(135deg, #0B0B0B, #FFD700)',
}

export const VB_NESTS: VbNestDef[] = [
  VB_NEST_ROOT_CAVERN,
  VB_NEST_MOONLIT_GROTTO,
  VB_NEST_CRYSTAL_DEN,
  VB_NEST_SHADOW_VAULT,
  VB_NEST_EMBER_HOLLOW,
  VB_NEST_SILK_SANCTUM,
  VB_NEST_VENOM_CRYPT,
  VB_NEST_OBSIDIAN_THRONE,
]

// === 30 SILK / VENOM MATERIALS ===

export const VB_MATERIALS: VbMaterialDef[] = [
  // Silk materials (6)
  { id: 'raw_silk', name: 'Raw Silk', icon: '🧵', category: 'silk', rarity: 'common', description: 'Basic spider silk, freshly harvested from nest webs.', value: 5, stackable: true },
  { id: 'velvet_thread', name: 'Velvet Thread', icon: '🪡', category: 'silk', rarity: 'common', description: 'Soft purple threads with a velvety texture.', value: 8, stackable: true },
  { id: 'gossamer_strand', name: 'Gossamer Strand', icon: '✨', category: 'silk', rarity: 'uncommon', description: 'Ultra-fine silk strand that floats on air currents.', value: 15, stackable: true },
  { id: 'moonlight_silk', name: 'Moonlight Silk', icon: '银丝', category: 'silk', rarity: 'rare', description: 'Silk imbued with moonlight, glows softly in darkness.', value: 40, stackable: true },
  { id: 'stardust_web', name: 'Stardust Web', icon: '🌟', category: 'silk', rarity: 'epic', description: 'Cosmic silk woven with captured starlight particles.', value: 100, stackable: true },
  { id: 'fate_thread', name: 'Thread of Fate', icon: '🔮', category: 'silk', rarity: 'legendary', description: 'A single thread that connects past, present, and future.', value: 500, stackable: true },
  // Venom materials (6)
  { id: 'dew_venom', name: 'Morning Dew Venom', icon: '💧', category: 'venom', rarity: 'common', description: 'Mild venom collected from common fang spiders at dawn.', value: 5, stackable: true },
  { id: 'crimson_drops', name: 'Crimson Drops', icon: '🩸', category: 'venom', rarity: 'common', description: 'Red-tinged venom with mild paralytic properties.', value: 8, stackable: true },
  { id: 'neuro_toxin', name: 'Neuro Toxin', icon: '🧪', category: 'venom', rarity: 'uncommon', description: 'Potent neurotoxin that disrupts nerve signals.', value: 18, stackable: true },
  { id: 'shadow_venom', name: 'Shadow Venom', icon: '🖤', category: 'venom', rarity: 'rare', description: 'Dark venom that corrupts the mind of the afflicted.', value: 45, stackable: true },
  { id: 'plague_extract', name: 'Plague Extract', icon: '☠️', category: 'venom', rarity: 'epic', description: 'A virulent extract that spreads through the air as toxic mist.', value: 120, stackable: true },
  { id: 'leviathan_ichor', name: 'Leviathan Ichor', icon: '🐉', category: 'venom', rarity: 'legendary', description: 'Primordial venom from the abyss itself, dissolves anything.', value: 600, stackable: true },
  // Crystal materials (5)
  { id: 'quartz_shard', name: 'Quartz Shard', icon: '🔶', category: 'crystal', rarity: 'common', description: 'Common quartz fragments found in crystal dens.', value: 6, stackable: true },
  { id: 'amethyst_gem', name: 'Amethyst Gem', icon: '💜', category: 'crystal', rarity: 'uncommon', description: 'Purple amethyst that resonates with brood telepathy.', value: 20, stackable: true },
  { id: 'obsidian_core', name: 'Obsidian Core', icon: '⬛', category: 'crystal', rarity: 'rare', description: 'A perfectly formed obsidian sphere of immense density.', value: 50, stackable: true },
  { id: 'prism_shard', name: 'Prism Shard', icon: '🌈', category: 'crystal', rarity: 'epic', description: 'A crystal that splits light into a spectrum of power.', value: 130, stackable: true },
  { id: 'eternal_diamond', name: 'Eternal Diamond', icon: '💎', category: 'crystal', rarity: 'legendary', description: 'An unbreakable diamond that holds infinite energy.', value: 700, stackable: true },
  // Chitin materials (5)
  { id: 'soft_chitin', name: 'Soft Chitin', icon: '🛡️', category: 'chitin', rarity: 'common', description: 'Basic exoskeleton fragments shed during molting.', value: 4, stackable: true },
  { id: 'hardened_plate', name: 'Hardened Plate', icon: '🪖', category: 'chitin', rarity: 'uncommon', description: 'Thick chitin plates from mature spider moltings.', value: 16, stackable: true },
  { id: 'venomous_fang', name: 'Venomous Fang', icon: '🦷', category: 'chitin', rarity: 'rare', description: 'A hollow fang still dripping with potent venom.', value: 42, stackable: true },
  { id: 'diamond_carapace', name: 'Diamond Carapace', icon: '💠', category: 'chitin', rarity: 'epic', description: 'Crystal-infused armor plating of legendary scorpions.', value: 110, stackable: true },
  { id: 'elder_shell', name: 'Elder Shell', icon: '🐚', category: 'chitin', rarity: 'legendary', description: 'The fossilized shell of an ancient brood ancestor.', value: 550, stackable: true },
  // Amber materials (4)
  { id: 'tree_amber', name: 'Tree Amber', icon: '🟡', category: 'amber', rarity: 'common', description: 'Fresh amber resin from ancient nest trees.', value: 7, stackable: true },
  { id: 'golden_resin', name: 'Golden Resin', icon: '🟠', category: 'amber', rarity: 'uncommon', description: 'Golden-hued resin with mild magical properties.', value: 22, stackable: true },
  { id: 'ancient_amber', name: 'Ancient Amber', icon: '💛', category: 'amber', rarity: 'rare', description: 'Million-year-old amber containing preserved creatures.', value: 55, stackable: true },
  { id: 'time_capsule', name: 'Time Capsule Amber', icon: '⏳', category: 'amber', rarity: 'epic', description: 'Amber that captures moments in time when shattered.', value: 140, stackable: true },
  // Shadow essence materials (4)
  { id: 'wisp_shadow', name: 'Shadow Wisp', icon: '👻', category: 'shadow_essence', rarity: 'uncommon', description: 'Faint shadow essence that flickers at the edge of vision.', value: 12, stackable: true },
  { id: 'void_fragment', name: 'Void Fragment', icon: '🕳️', category: 'shadow_essence', rarity: 'rare', description: 'A solid piece of void energy, cold to the touch.', value: 48, stackable: true },
  { id: 'nightmare_core', name: 'Nightmare Core', icon: '😈', category: 'shadow_essence', rarity: 'epic', description: 'Concentrated nightmare energy that manifests illusions.', value: 125, stackable: true },
  { id: 'abyssal_heart', name: 'Abyssal Heart', icon: '🖤', category: 'shadow_essence', rarity: 'legendary', description: 'The core of an abyssal entity, pure dark energy.', value: 650, stackable: true },
]

// === 25 NEST STRUCTURES (upgradable to lv10) ===

export const VB_STRUCTURES: VbStructureDef[] = [
  // Breeding Chambers (5)
  {
    id: 'brood_chamber', name: 'Brood Chamber', icon: '🥚', type: 'breeding_chamber',
    description: 'A nurturing chamber for incubating spider eggs and raising hatchlings.',
    maxLevel: 10,
    baseCost: { silk: 10, venom: 5, crystal: 3, chitin: 8, amber: 2, shadow_essence: 0 },
    levelUpCost: { silk: 5, venom: 3, crystal: 2, chitin: 4, amber: 1, shadow_essence: 0 },
    effectPerLevel: '+1 spider capacity per level',
  },
  {
    id: 'royal_nursery', name: 'Royal Nursery', icon: '👶', type: 'breeding_chamber',
    description: 'Premium incubation suite reserved for rare and legendary spiderlings.',
    maxLevel: 10,
    baseCost: { silk: 20, venom: 10, crystal: 15, chitin: 12, amber: 8, shadow_essence: 0 },
    levelUpCost: { silk: 10, venom: 5, crystal: 8, chitin: 6, amber: 4, shadow_essence: 0 },
    effectPerLevel: '+5% rare summon chance per level',
  },
  {
    id: 'mutation_vat', name: 'Mutation Vat', icon: '🧬', type: 'breeding_chamber',
    description: 'Alchemical vat for enhancing spider traits through controlled mutation.',
    maxLevel: 10,
    baseCost: { silk: 15, venom: 20, crystal: 5, chitin: 10, amber: 5, shadow_essence: 3 },
    levelUpCost: { silk: 8, venom: 10, crystal: 3, chitin: 5, amber: 3, shadow_essence: 2 },
    effectPerLevel: '+3% power gain per level',
  },
  {
    id: 'cocoon_room', name: 'Cocoon Room', icon: '🫘', type: 'breeding_chamber',
    description: 'Silk-wrapped cocoons where spiders safely molt and grow stronger.',
    maxLevel: 10,
    baseCost: { silk: 25, venom: 3, crystal: 5, chitin: 5, amber: 10, shadow_essence: 0 },
    levelUpCost: { silk: 12, venom: 2, crystal: 3, chitin: 3, amber: 5, shadow_essence: 0 },
    effectPerLevel: '+10% XP gain per level',
  },
  {
    id: 'gene_archive', name: 'Gene Archive', icon: '📚', type: 'breeding_chamber',
    description: 'Stores genetic blueprints of every spider ever summoned by the brood.',
    maxLevel: 10,
    baseCost: { silk: 10, venom: 15, crystal: 10, chitin: 5, amber: 5, shadow_essence: 5 },
    levelUpCost: { silk: 5, venom: 8, crystal: 5, chitin: 3, amber: 3, shadow_essence: 3 },
    effectPerLevel: '-5% summon cost per level',
  },
  // Silk Farms (5)
  {
    id: 'silk_mill', name: 'Silk Mill', icon: '🏭', type: 'silk_farm',
    description: 'Automated silk harvesting machinery powered by spider energy.',
    maxLevel: 10,
    baseCost: { silk: 5, venom: 3, crystal: 5, chitin: 10, amber: 3, shadow_essence: 0 },
    levelUpCost: { silk: 3, venom: 2, crystal: 3, chitin: 5, amber: 2, shadow_essence: 0 },
    effectPerLevel: '+2 silk per tend per level',
  },
  {
    id: 'velvet_loom', name: 'Velvet Loom', icon: '🪡', type: 'silk_farm',
    description: 'A masterwork loom that transforms raw silk into premium velvet fabric.',
    maxLevel: 10,
    baseCost: { silk: 30, venom: 2, crystal: 8, chitin: 5, amber: 10, shadow_essence: 0 },
    levelUpCost: { silk: 15, venom: 1, crystal: 4, chitin: 3, amber: 5, shadow_essence: 0 },
    effectPerLevel: '+15% silk quality per level',
  },
  {
    id: 'thread_spire', name: 'Thread Spire', icon: '🗼', type: 'silk_farm',
    description: 'A towering spire that channels wind energy to spin ultra-fine threads.',
    maxLevel: 10,
    baseCost: { silk: 20, venom: 5, crystal: 15, chitin: 8, amber: 5, shadow_essence: 0 },
    levelUpCost: { silk: 10, venom: 3, crystal: 8, chitin: 4, amber: 3, shadow_essence: 0 },
    effectPerLevel: '+3 rare silk chance per level',
  },
  {
    id: 'weave_sanctuary', name: 'Weave Sanctuary', icon: '🏛️', type: 'silk_farm',
    description: 'A sacred space where master weavers create silk tapestries of power.',
    maxLevel: 10,
    baseCost: { silk: 40, venom: 8, crystal: 20, chitin: 10, amber: 15, shadow_essence: 5 },
    levelUpCost: { silk: 20, venom: 4, crystal: 10, chitin: 5, amber: 8, shadow_essence: 3 },
    effectPerLevel: '+1 legendary silk per tend at max level',
  },
  {
    id: 'spider_road', name: 'Spider Road', icon: '🛤️', type: 'silk_farm',
    description: 'Silk bridges connecting all nests, enabling rapid resource transport.',
    maxLevel: 10,
    baseCost: { silk: 50, venom: 5, crystal: 10, chitin: 5, amber: 5, shadow_essence: 0 },
    levelUpCost: { silk: 25, venom: 3, crystal: 5, chitin: 3, amber: 3, shadow_essence: 0 },
    effectPerLevel: '+8% transport speed per level',
  },
  // Venom Labs (5)
  {
    id: 'venom_gland', name: 'Venom Gland Extractor', icon: '💉', type: 'venom_lab',
    description: 'Safely extracts venom from fang spiders without harming them.',
    maxLevel: 10,
    baseCost: { silk: 5, venom: 3, crystal: 5, chitin: 8, amber: 3, shadow_essence: 0 },
    levelUpCost: { silk: 3, venom: 2, crystal: 3, chitin: 4, amber: 2, shadow_essence: 0 },
    effectPerLevel: '+2 venom per tend per level',
  },
  {
    id: 'toxic_furnace', name: 'Toxic Furnace', icon: '⚗️', type: 'venom_lab',
    description: 'Refines raw venom into concentrated toxins of greater potency.',
    maxLevel: 10,
    baseCost: { silk: 5, venom: 20, crystal: 8, chitin: 5, amber: 3, shadow_essence: 2 },
    levelUpCost: { silk: 3, venom: 10, crystal: 4, chitin: 3, amber: 2, shadow_essence: 1 },
    effectPerLevel: '+12% venom potency per level',
  },
  {
    id: 'antidote_vat', name: 'Antidote Vat', icon: '💊', type: 'venom_lab',
    description: 'Creates antidotes from venom samples, improving brood resilience.',
    maxLevel: 10,
    baseCost: { silk: 8, venom: 15, crystal: 10, chitin: 5, amber: 5, shadow_essence: 0 },
    levelUpCost: { silk: 4, venom: 8, crystal: 5, chitin: 3, amber: 3, shadow_essence: 0 },
    effectPerLevel: '+5% defense per level',
  },
  {
    id: 'plague_brewery', name: 'Plague Brewery', icon: '🍺', type: 'venom_lab',
    description: 'Brews devastating plague concoctions for area-wide effects.',
    maxLevel: 10,
    baseCost: { silk: 10, venom: 30, crystal: 15, chitin: 10, amber: 5, shadow_essence: 8 },
    levelUpCost: { silk: 5, venom: 15, crystal: 8, chitin: 5, amber: 3, shadow_essence: 4 },
    effectPerLevel: '+1 area damage per level',
  },
  {
    id: 'elixir_stand', name: 'Elixir Stand', icon: '🧪', type: 'venom_lab',
    description: 'Converts venom into healing elixirs that restore spider health.',
    maxLevel: 10,
    baseCost: { silk: 5, venom: 12, crystal: 5, chitin: 3, amber: 8, shadow_essence: 0 },
    levelUpCost: { silk: 3, venom: 6, crystal: 3, chitin: 2, amber: 4, shadow_essence: 0 },
    effectPerLevel: '+10 HP recovery per tend per level',
  },
  // Guard Towers (5)
  {
    id: 'watchtower', name: 'Spider Watchtower', icon: '🗼', type: 'guard_tower',
    description: 'Tall tower with sentry spiders that detect approaching threats.',
    maxLevel: 10,
    baseCost: { silk: 8, venom: 5, crystal: 3, chitin: 15, amber: 3, shadow_essence: 0 },
    levelUpCost: { silk: 4, venom: 3, crystal: 2, chitin: 8, amber: 2, shadow_essence: 0 },
    effectPerLevel: '+8% detection range per level',
  },
  {
    id: 'trap_door', name: 'Trap Door Network', icon: '🚪', type: 'guard_tower',
    description: 'A system of hidden trap doors that capture intruders automatically.',
    maxLevel: 10,
    baseCost: { silk: 15, venom: 10, crystal: 5, chitin: 12, amber: 3, shadow_essence: 3 },
    levelUpCost: { silk: 8, venom: 5, crystal: 3, chitin: 6, amber: 2, shadow_essence: 2 },
    effectPerLevel: '+1 trap captured per level',
  },
  {
    id: 'venom_cannon', name: 'Venom Cannon', icon: '💣', type: 'guard_tower',
    description: 'Launches concentrated venom projectiles at approaching enemies.',
    maxLevel: 10,
    baseCost: { silk: 5, venom: 25, crystal: 10, chitin: 15, amber: 3, shadow_essence: 0 },
    levelUpCost: { silk: 3, venom: 12, crystal: 5, chitin: 8, amber: 2, shadow_essence: 0 },
    effectPerLevel: '+15 damage per level',
  },
  {
    id: 'crystal_wall', name: 'Crystal Barrier', icon: '🧱', type: 'guard_tower',
    description: 'Crystalline walls that reflect attacks back at the assailant.',
    maxLevel: 10,
    baseCost: { silk: 10, venom: 5, crystal: 30, chitin: 10, amber: 5, shadow_essence: 0 },
    levelUpCost: { silk: 5, venom: 3, crystal: 15, chitin: 5, amber: 3, shadow_essence: 0 },
    effectPerLevel: '+10% damage reflection per level',
  },
  {
    id: 'shadow_gate', name: 'Shadow Gate', icon: '🚪', type: 'guard_tower',
    description: 'A gate of living shadow that only brood members can pass through.',
    maxLevel: 10,
    baseCost: { silk: 10, venom: 5, crystal: 5, chitin: 5, amber: 3, shadow_essence: 20 },
    levelUpCost: { silk: 5, venom: 3, crystal: 3, chitin: 3, amber: 2, shadow_essence: 10 },
    effectPerLevel: '+12% stealth defense per level',
  },
  // Storage Vaults (5)
  {
    id: 'silk_vault', name: 'Silk Vault', icon: '🗄️', type: 'storage_vault',
    description: 'Climate-controlled vault for preserving precious silk materials.',
    maxLevel: 10,
    baseCost: { silk: 20, venom: 3, crystal: 5, chitin: 8, amber: 5, shadow_essence: 0 },
    levelUpCost: { silk: 10, venom: 2, crystal: 3, chitin: 4, amber: 3, shadow_essence: 0 },
    effectPerLevel: '+50 silk storage per level',
  },
  {
    id: 'venom_cellar', name: 'Venom Cellar', icon: ' underground', type: 'storage_vault',
    description: 'Cool underground cellar that keeps venom fresh and potent.',
    maxLevel: 10,
    baseCost: { silk: 5, venom: 15, crystal: 5, chitin: 8, amber: 5, shadow_essence: 0 },
    levelUpCost: { silk: 3, venom: 8, crystal: 3, chitin: 4, amber: 3, shadow_essence: 0 },
    effectPerLevel: '+50 venom storage per level',
  },
  {
    id: 'gem_repository', name: 'Gem Repository', icon: '🏦', type: 'storage_vault',
    description: 'A reinforced vault with crystal-lattice security for valuable gems.',
    maxLevel: 10,
    baseCost: { silk: 5, venom: 5, crystal: 20, chitin: 5, amber: 10, shadow_essence: 0 },
    levelUpCost: { silk: 3, venom: 3, crystal: 10, chitin: 3, amber: 5, shadow_essence: 0 },
    effectPerLevel: '+50 crystal storage per level',
  },
  {
    id: 'unified_warehouse', name: 'Unified Warehouse', icon: '🏗️', type: 'storage_vault',
    description: 'Centralized storage that boosts all resource capacities simultaneously.',
    maxLevel: 10,
    baseCost: { silk: 15, venom: 15, crystal: 15, chitin: 15, amber: 15, shadow_essence: 5 },
    levelUpCost: { silk: 8, venom: 8, crystal: 8, chitin: 8, amber: 8, shadow_essence: 3 },
    effectPerLevel: '+20 all resources per level',
  },
  {
    id: 'shadow_pocket', name: 'Shadow Pocket Dimension', icon: '🌀', type: 'storage_vault',
    description: 'A pocket dimension of pure shadow with seemingly infinite storage.',
    maxLevel: 10,
    baseCost: { silk: 10, venom: 10, crystal: 10, chitin: 10, amber: 10, shadow_essence: 30 },
    levelUpCost: { silk: 5, venom: 5, crystal: 5, chitin: 5, amber: 5, shadow_essence: 15 },
    effectPerLevel: '+100 all resources per level',
  },
]

// === 22 BROOD ABILITIES ===

export const VB_ABILITIES: VbAbilityDef[] = [
  // Venom abilities (4)
  { id: 'venom_spit', name: 'Venom Spit', icon: '🤮', element: 'venom', description: 'Spits corrosive venom at a target, dealing damage over time.', cooldown: 3, powerCost: 10, damage: 15, effect: 'Poison DoT 3 turns', unlockLevel: 1 },
  { id: 'toxic_cloud', name: 'Toxic Cloud', icon: '☁️', element: 'venom', description: 'Releases a cloud of toxic gas that damages all enemies in range.', cooldown: 5, powerCost: 25, damage: 20, effect: 'AoE poison 5 turns', unlockLevel: 5 },
  { id: 'plague_breath', name: 'Plague Breath', icon: '💨', element: 'venom', description: 'Exhales concentrated plague venom that weakens enemies.', cooldown: 8, powerCost: 50, damage: 35, effect: 'Reduce enemy defense 30%', unlockLevel: 15 },
  { id: 'apocalypse_bite', name: 'Apocalypse Bite', icon: '💀', element: 'venom', description: 'A legendary bite that channels all venom into one lethal strike.', cooldown: 12, powerCost: 100, damage: 80, effect: 'Instant kill if < 20% HP', unlockLevel: 30 },
  // Silk abilities (4)
  { id: 'silk_bind', name: 'Silk Bind', icon: '🪢', element: 'silk', description: 'Shoots silk threads that immobilize the target.', cooldown: 2, powerCost: 8, damage: 5, effect: 'Stun 1 turn', unlockLevel: 1 },
  { id: 'web_trap', name: 'Web Trap', icon: '🕸️', element: 'silk', description: 'Creates a sticky web that slows all enemies in an area.', cooldown: 4, powerCost: 20, damage: 10, effect: 'Slow 50% for 3 turns', unlockLevel: 8 },
  { id: 'silk_shield', name: 'Silk Shield', icon: '🛡️', element: 'silk', description: 'Wraps allies in protective silk, absorbing incoming damage.', cooldown: 6, powerCost: 30, damage: 0, effect: 'Shield 30 damage for 3 turns', unlockLevel: 12 },
  { id: 'cocoon_prison', name: 'Cocoon Prison', icon: '🫘', element: 'silk', description: 'Encases a target in an impenetrable silk cocoon.', cooldown: 10, powerCost: 60, damage: 15, effect: 'Full disable 2 turns', unlockLevel: 25 },
  // Shadow abilities (3)
  { id: 'shadow_step', name: 'Shadow Step', icon: '👤', element: 'shadow', description: 'Teleports through shadows to reposition behind enemies.', cooldown: 2, powerCost: 5, damage: 0, effect: 'Teleport + next attack crits', unlockLevel: 1 },
  { id: 'darkness_swarm', name: 'Darkness Swarm', icon: '🦇', element: 'shadow', description: 'Summons shadow spiders that swarm and disorient enemies.', cooldown: 6, powerCost: 35, damage: 25, effect: 'Blind 2 turns', unlockLevel: 10 },
  { id: 'void_consume', name: 'Void Consume', icon: '🕳️', element: 'shadow', description: 'Opens a void rift that pulls enemies into darkness.', cooldown: 15, powerCost: 120, damage: 60, effect: 'Remove from battle 1 turn', unlockLevel: 35 },
  // Crystal abilities (3)
  { id: 'crystal_shard', name: 'Crystal Shard', icon: '🔶', element: 'crystal', description: 'Launches a sharp crystal shard at high velocity.', cooldown: 2, powerCost: 8, damage: 18, effect: 'Armor pierce', unlockLevel: 3 },
  { id: 'prism_beam', name: 'Prism Beam', icon: '🌈', element: 'crystal', description: 'Fires a beam of refracted light through a crystal prism.', cooldown: 7, powerCost: 40, damage: 45, effect: 'True damage ignores defense', unlockLevel: 18 },
  { id: 'diamond_storm', name: 'Diamond Storm', icon: '💎', element: 'crystal', description: 'Conjures a devastating storm of razor-sharp diamond shards.', cooldown: 12, powerCost: 90, damage: 70, effect: 'Hits all enemies 3 times', unlockLevel: 28 },
  // Ember abilities (3)
  { id: 'ember_crawl', name: 'Ember Crawl', icon: '🔥', element: 'ember', description: 'Sets the ground ablaze, damaging enemies who walk through.', cooldown: 3, powerCost: 12, damage: 12, effect: 'Ground fire DoT 4 turns', unlockLevel: 2 },
  { id: 'inferno_wave', name: 'Inferno Wave', icon: '🌊', element: 'ember', description: 'Sends a wave of intense heat radiating outward.', cooldown: 8, powerCost: 45, damage: 40, effect: 'Burn + 15% max HP', unlockLevel: 16 },
  { id: 'supernova', name: 'Supernova', icon: '💥', element: 'ember', description: 'Detonates in a blinding explosion of solar energy.', cooldown: 15, powerCost: 110, damage: 90, effect: 'AoE 50% splash damage', unlockLevel: 32 },
  // Moon abilities (3)
  { id: 'moon_beam', name: 'Moon Beam', icon: '🌙', element: 'moon', description: 'Channels concentrated moonlight into a piercing beam.', cooldown: 3, powerCost: 10, damage: 14, effect: 'Heals self for 50% damage', unlockLevel: 1 },
  { id: 'lunar_blessing', name: 'Lunar Blessing', icon: '✨', element: 'moon', description: 'Blesses all brood spiders with lunar energy.', cooldown: 8, powerCost: 30, damage: 0, effect: 'All allies +20% stats 3 turns', unlockLevel: 14 },
  { id: 'eclipse_ultimatum', name: 'Eclipse Ultimatum', icon: '🌓', element: 'moon', description: 'Causes a total eclipse, empowering the brood to maximum.', cooldown: 18, powerCost: 150, damage: 50, effect: 'All allies empowered 5 turns', unlockLevel: 40 },
  // Earth abilities (2)
  { id: 'earthquake_stomp', name: 'Earthquake Stomp', icon: '🌋', element: 'earth', description: 'Slams the ground with massive force, shaking the entire area.', cooldown: 5, powerCost: 20, damage: 30, effect: 'AoE knockdown 1 turn', unlockLevel: 7 },
  { id: 'titan_rise', name: 'Titan Rise', icon: '⛰️', element: 'earth', description: 'Channels earth energy to grow to enormous size temporarily.', cooldown: 14, powerCost: 80, damage: 50, effect: 'Self +100% size and HP for 3 turns', unlockLevel: 22 },
]

// === 18 ACHIEVEMENTS ===

export const VB_ACHIEVEMENTS: VbAchievementDef[] = [
  { id: 'ach_first_spider', name: 'First Hatchling', icon: '🥚', description: 'Summon your first brood spider.', conditionKey: 'totalSpidersSummoned', targetValue: 1, rewardXP: 20, rewardCoins: 25 },
  { id: 'ach_10_spiders', name: 'Growing Brood', icon: '🕷️', description: 'Summon a total of 10 spiders.', conditionKey: 'totalSpidersSummoned', targetValue: 10, rewardXP: 100, rewardCoins: 100 },
  { id: 'ach_50_spiders', name: 'Spider Army', icon: '⚔️', description: 'Summon a total of 50 spiders.', conditionKey: 'totalSpidersSummoned', targetValue: 50, rewardXP: 500, rewardCoins: 500 },
  { id: 'ach_100_spiders', name: 'Innumerable Horde', icon: '👥', description: 'Summon a total of 100 spiders.', conditionKey: 'totalSpidersSummoned', targetValue: 100, rewardXP: 1500, rewardCoins: 1500 },
  { id: 'ach_first_nest', name: 'Nest Builder', icon: '🪨', description: 'Tend your first nest for resources.', conditionKey: 'totalNestsTended', targetValue: 1, rewardXP: 30, rewardCoins: 30 },
  { id: 'ach_100_tends', name: 'Diligent Keeper', icon: '🔍', description: 'Tend nests 100 times total.', conditionKey: 'totalNestsTended', targetValue: 100, rewardXP: 400, rewardCoins: 400 },
  { id: 'ach_all_nests', name: 'Domain Expanded', icon: '🗺️', description: 'Unlock all 8 nest locations.', conditionKey: 'nestsUnlocked', targetValue: 8, rewardXP: 800, rewardCoins: 800 },
  { id: 'ach_first_structure', name: 'Architect', icon: '🏗️', description: 'Build your first nest structure.', conditionKey: 'totalStructuresBuilt', targetValue: 1, rewardXP: 50, rewardCoins: 50 },
  { id: 'ach_10_structures', name: 'Master Builder', icon: '🏰', description: 'Build 10 nest structures total.', conditionKey: 'totalStructuresBuilt', targetValue: 10, rewardXP: 300, rewardCoins: 300 },
  { id: 'ach_first_artifact', name: 'Artifact Hunter', icon: '🏺', description: 'Discover your first legendary artifact.', conditionKey: 'totalArtifactsActivated', targetValue: 1, rewardXP: 200, rewardCoins: 200 },
  { id: 'ach_5_artifacts', name: 'Relic Collector', icon: '💎', description: 'Activate 5 legendary artifacts.', conditionKey: 'totalArtifactsActivated', targetValue: 5, rewardXP: 1000, rewardCoins: 1000 },
  { id: 'ach_all_artifacts', name: 'Brood Historian', icon: '📜', description: 'Activate all 15 legendary artifacts.', conditionKey: 'totalArtifactsActivated', targetValue: 15, rewardXP: 5000, rewardCoins: 5000 },
  { id: 'ach_first_event', name: 'Eventful', icon: '🎉', description: 'Trigger your first brood event.', conditionKey: 'totalEventsTriggered', targetValue: 1, rewardXP: 30, rewardCoins: 30 },
  { id: 'ach_50_materials', name: 'Resource Baron', icon: '💰', description: 'Collect 50 total materials.', conditionKey: 'totalMaterialsCollected', targetValue: 50, rewardXP: 200, rewardCoins: 200 },
  { id: 'ach_venom_master', name: 'Venom Master', icon: '☠️', description: 'Harvest 100 total venom materials.', conditionKey: 'totalVenomHarvested', targetValue: 100, rewardXP: 600, rewardCoins: 600 },
  { id: 'ach_silk_master', name: 'Silk Master', icon: '🧵', description: 'Weave 100 total silk materials.', conditionKey: 'totalSilkWoven', targetValue: 100, rewardXP: 600, rewardCoins: 600 },
  { id: 'ach_level_20', name: 'Brood Rising', icon: '📈', description: 'Reach brood level 20.', conditionKey: 'level', targetValue: 20, rewardXP: 1000, rewardCoins: 1000 },
  { id: 'ach_level_50', name: 'Apex Brood', icon: '👑', description: 'Reach the maximum brood level.', conditionKey: 'level', targetValue: 50, rewardXP: 5000, rewardCoins: 5000 },
]

// === 8 TITLES ===

export const VB_TITLES: VbTitleDef[] = [
  { id: 'title_hatchling', name: 'Hatchling Keeper', icon: '🥚', levelRequired: 1, description: 'A novice keeper tending to their first spiderlings.' },
  { id: 'title_weaver', name: 'Novice Weaver', icon: '🕸️', levelRequired: 5, description: 'Learning the ancient arts of silk weaving and venom extraction.' },
  { id: 'title_keeper', name: 'Brood Keeper', icon: '🕷️', levelRequired: 10, description: 'A trusted keeper with a growing brood of loyal spiders.' },
  { id: 'title_master', name: 'Nest Master', icon: '🏰', levelRequired: 18, description: 'Commands multiple nests and structures with efficiency.' },
  { id: 'title_chancellor', name: 'Shadow Chancellor', icon: '🌑', levelRequired: 25, description: 'Wields shadow and venom with deadly precision.' },
  { id: 'title_elder', name: 'Crystal Elder', icon: '💎', levelRequired: 33, description: 'An elder who channels crystal and moon energy to empower the brood.' },
  { id: 'title_sovereign', name: 'Velvet Sovereign', icon: '👑', levelRequired: 42, description: 'Sovereign ruler of a vast spider domain spanning multiple nests.' },
  { id: 'title_matriarch', name: 'Brood Matriarch', icon: '🔮', levelRequired: 50, description: 'The supreme matriarch, commanding the most powerful brood in existence.' },
]

// === 15 LEGENDARY ARTIFACTS ===

export const VB_ARTIFACTS: VbArtifactDef[] = [
  { id: 'art_queens_crown', name: "Brood Mother's Crown", icon: '👑', rarity: 'legendary', description: 'The ancient crown worn by the first Brood Mother, radiating command aura.', powerBonus: 50, effect: '+20% all spider stats', lore: 'Forged from the silk of a thousand queens, it hums with the collective will of all broods.' },
  { id: 'art_shadow_cloak', name: 'Cloak of Endless Shadow', icon: '🧥', rarity: 'legendary', description: 'A cloak woven from living shadow that renders the wearer invisible.', powerBonus: 30, effect: '+50% stealth defense', lore: 'It was cut from the shadow of the dying moon during the first eclipse.' },
  { id: 'art_venom_chalice', name: 'Chalice of Pure Venom', icon: '🍷', rarity: 'legendary', description: 'A crystalline chalice containing the essence of perfect venom.', powerBonus: 35, effect: '+40% venom damage', lore: 'The last drop of venom from the Leviathan Fang was sealed within this vessel.' },
  { id: 'art_silk_of_fates', name: 'Silk of Fates', icon: '🧶', rarity: 'legendary', description: 'A spool of silk that reveals the future when woven into patterns.', powerBonus: 25, effect: '+30% silk quality', lore: 'The Norn spider wove destiny itself into these threads.' },
  { id: 'art_crystal_heart', name: 'Crystal Heart', icon: '💎', rarity: 'legendary', description: 'A beating heart made of pure crystal, source of infinite energy.', powerBonus: 60, effect: '+25% max HP all spiders', lore: 'It was discovered deep within the Crystal Den, pulsing with ancient power.' },
  { id: 'art_moon_pendant', name: 'Pendant of the Blood Moon', icon: '🌙', rarity: 'legendary', description: 'A pendant that glows red during blood moons, amplifying moon abilities.', powerBonus: 40, effect: '+35% moon ability power', lore: 'Crafted during a convergence of three moons over a sacred grotto.' },
  { id: 'art_ember_core', name: 'Core of Eternal Embers', icon: '🔥', rarity: 'legendary', description: 'A perpetually burning ember core that never extinguishes.', powerBonus: 45, effect: '+30% ember damage', lore: 'Said to contain the original fire that forged the first spider from clay.' },
  { id: 'art_obsidian_mirror', name: 'Obsidian Mirror', icon: '🪞', rarity: 'legendary', description: 'A mirror of polished obsidian that reflects the true form of any creature.', powerBonus: 20, effect: 'Reveal hidden enemies', lore: 'In its depths, the shadows show truths that daylight conceals.' },
  { id: 'art_spider_idol', name: 'Ancient Spider Idol', icon: '🗿', rarity: 'legendary', description: 'A stone idol depicting the primordial spider that created all arachnids.', powerBonus: 55, effect: '+15% all stats', lore: 'Carved by the first brood from a meteorite that fell in the age of legends.' },
  { id: 'art_amber_scepter', name: 'Scepter of Golden Amber', icon: '🔮', rarity: 'legendary', description: 'A scepter encased in golden amber that controls time around the brood.', powerBonus: 35, effect: 'Slow time in battle', lore: 'Trapped within the amber is a moment from the dawn of the brood.' },
  { id: 'art_void_key', name: 'Key to the Void', icon: '🗝️', rarity: 'legendary', description: 'Opens gateways to the void dimension for rapid troop deployment.', powerBonus: 30, effect: '+40% movement speed', lore: 'Forged from shadow essence extracted from the edge of reality.' },
  { id: 'art_weavers_lantern', name: "Weaver's Spirit Lantern", icon: '🏮', rarity: 'legendary', description: 'A lantern that guides lost spiders back to the nest safely.', powerBonus: 25, effect: 'Prevent spider loss', lore: 'The flame inside is fed by the gratitude of every spider it has guided home.' },
  { id: 'art_plague_mask', name: 'Mask of the Plague Doctor', icon: '🎭', rarity: 'legendary', description: 'An ancient mask that grants immunity to all known venoms and toxins.', powerBonus: 40, effect: 'Full venom immunity', lore: 'Worn by the first Plague Bringer to protect themselves from their own creation.' },
  { id: 'art_silk_rose', name: 'Rose of Living Silk', icon: '🌹', rarity: 'legendary', description: 'A rose that never wilts, its petals made of enchanted velvet silk.', powerBonus: 20, effect: '+50% silk production', lore: 'It blooms in the presence of strong broods, fed by the collective joy of the spiders.' },
  { id: 'art_brood_scepter', name: 'Scepter of the Matriarch', icon: '⚡', rarity: 'legendary', description: 'The ultimate symbol of brood authority, it commands obedience from all spiders.', powerBonus: 70, effect: '+10% all brood stats', lore: 'Only the true Matriarch can wield it without being consumed by its power.' },
]

// === 12 EVENTS ===

export const VB_EVENTS: VbEventDef[] = [
  {
    id: 'brood_migration', name: 'Brood Migration', icon: '🚀',
    description: 'Wild spider broods migrate through the area, bringing rare species.',
    duration: 300, rewards: { silk: 20, venom: 10, crystal: 5, chitin: 15, amber: 5, shadow_essence: 3 },
    cooldown: 600, unlockLevel: 1,
  },
  {
    id: 'shadow_surge', name: 'Shadow Surge', icon: '🌑',
    description: 'A surge of dark energy empowers shadow-type spiders and materials.',
    duration: 240, rewards: { silk: 5, venom: 5, crystal: 3, chitin: 3, amber: 2, shadow_essence: 30 },
    cooldown: 900, unlockLevel: 8,
  },
  {
    id: 'crystal_bloom', name: 'Crystal Bloom', icon: '💎',
    description: 'Crystals in the den bloom with energy, doubling crystal yields.',
    duration: 300, rewards: { silk: 5, venom: 5, crystal: 40, chitin: 5, amber: 10, shadow_essence: 2 },
    cooldown: 800, unlockLevel: 5,
  },
  {
    id: 'moonlit_feast', name: 'Moonlit Feast', icon: '🍽️',
    description: 'A feast under the full moon that boosts spider happiness and XP.',
    duration: 180, rewards: { silk: 15, venom: 8, crystal: 8, chitin: 8, amber: 8, shadow_essence: 5 },
    cooldown: 700, unlockLevel: 3,
  },
  {
    id: 'ember_eruption', name: 'Ember Eruption', icon: '🌋',
    description: 'Volcanic activity boosts ember spider power and provides rare materials.',
    duration: 240, rewards: { silk: 3, venom: 20, crystal: 10, chitin: 25, amber: 5, shadow_essence: 2 },
    cooldown: 1000, unlockLevel: 10,
  },
  {
    id: 'silk_storm', name: 'Silk Storm', icon: '🌪️',
    description: 'A massive silk-spinning event floods all nests with abundant silk.',
    duration: 200, rewards: { silk: 60, venom: 5, crystal: 5, chitin: 5, amber: 10, shadow_essence: 3 },
    cooldown: 750, unlockLevel: 7,
  },
  {
    id: 'venom_plague', name: 'Venom Plague', icon: '☠️',
    description: 'A venom outbreak creates rare toxins but threatens nest health.',
    duration: 300, rewards: { silk: 5, venom: 50, crystal: 5, chitin: 5, amber: 3, shadow_essence: 10 },
    cooldown: 1200, unlockLevel: 15,
  },
  {
    id: 'ancient_awakening', name: 'Ancient Awakening', icon: '🗿',
    description: 'Ancient artifacts resonate with energy, revealing hidden powers.',
    duration: 360, rewards: { silk: 10, venom: 10, crystal: 15, chitin: 10, amber: 15, shadow_essence: 10 },
    cooldown: 1500, unlockLevel: 20,
  },
  {
    id: 'queen_summon', name: 'Queen Summoning', icon: '👑',
    description: 'The Brood Mother calls all spiders home for a grand gathering.',
    duration: 420, rewards: { silk: 25, venom: 25, crystal: 25, chitin: 25, amber: 25, shadow_essence: 25 },
    cooldown: 2000, unlockLevel: 25,
  },
  {
    id: 'brood_war', name: 'Brood War', icon: '⚔️',
    description: 'Rival broods attack! Defend your nests for massive rewards.',
    duration: 480, rewards: { silk: 30, venom: 30, crystal: 20, chitin: 30, amber: 20, shadow_essence: 20 },
    cooldown: 1800, unlockLevel: 18,
  },
  {
    id: 'void_rift', name: 'Void Rift', icon: '🌀',
    description: 'A rift to the void opens, leaking rare shadow essence and creatures.',
    duration: 240, rewards: { silk: 5, venom: 5, crystal: 5, chitin: 5, amber: 5, shadow_essence: 50 },
    cooldown: 1400, unlockLevel: 22,
  },
  {
    id: 'harvest_moon', name: 'Harvest Moon Festival', icon: '🌕',
    description: 'The harvest moon empowers all nests with triple resource generation.',
    duration: 600, rewards: { silk: 40, venom: 40, crystal: 40, chitin: 40, amber: 40, shadow_essence: 40 },
    cooldown: 3000, unlockLevel: 30,
  },
]

// === MAX LEVEL ===

export const VB_MAX_LEVEL = 50

// === XP TABLE ===

export const VB_XP_TABLE: number[] = (() => {
  const table: number[] = [0]
  for (let i = 1; i <= VB_MAX_LEVEL; i++) {
    table.push(Math.floor(100 * i * (1 + i * 0.18)))
  }
  return table
})()

// === HELPER FUNCTIONS ===

function vbGenerateId(): string {
  return `vb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function vbGetTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function vbGetXpRequired(level: number): number {
  if (level <= 0) return 0
  if (level >= VB_MAX_LEVEL) return Infinity
  return VB_XP_TABLE[level] ?? 120
}

function vbGetTitleForLevel(level: number): string {
  let title = VB_TITLES[0].name
  for (const t of VB_TITLES) {
    if (level >= t.levelRequired) title = t.name
  }
  return title
}

function vbRollRarity(weights: Record<VbRarity, number>): VbRarity {
  const total = Object.values(weights).reduce((s, w) => s + w, 0)
  let roll = Math.random() * total
  for (const rarity of VB_RARITIES) {
    roll -= weights[rarity.key]
    if (roll <= 0) return rarity.key
  }
  return 'common'
}

function vbGetSpiderByTypeAndRarity(type: VbSpiderType, rarity: VbRarity): VbSpiderDef | null {
  const eligible = VB_SPIDERS.filter((s) => s.type === type && s.rarity === rarity)
  if (eligible.length === 0) return null
  return eligible[Math.floor(Math.random() * eligible.length)]
}

function vbCheckAchievements(state: VelvetBroodState): VbAchievementEntity[] {
  const checks: Record<string, number> = {
    totalSpidersSummoned: state.vbStats.totalSpidersSummoned,
    totalNestsTended: state.vbStats.totalNestsTended,
    totalStructuresBuilt: state.vbStats.totalStructuresBuilt,
    totalArtifactsActivated: state.vbStats.totalArtifactsActivated,
    totalEventsTriggered: state.vbStats.totalEventsTriggered,
    totalMaterialsCollected: state.vbStats.totalMaterialsCollected,
    totalVenomHarvested: state.vbStats.totalVenomHarvested,
    totalSilkWoven: state.vbStats.totalSilkWoven,
    level: state.level,
    nestsUnlocked: state.vbNests.filter((n) => n.unlocked).length,
  }
  return state.vbAchievements.map((a) => {
    if (a.unlocked) return a
    const def = VB_ACHIEVEMENTS.find((d) => d.id === a.id)
    if (!def) return a
    const current = checks[def.conditionKey] ?? 0
    if (current >= def.targetValue) {
      return { ...a, unlocked: true, unlockedAt: Date.now() }
    }
    return a
  })
}

function vbCalculateBroodPower(state: VelvetBroodState): number {
  let power = 0
  for (const spider of state.vbSpiders) {
    const def = VB_SPIDERS.find((s) => s.id === spider.spiderDefId)
    if (def) {
      power += def.power + spider.level * 2
    }
  }
  for (const artifact of state.vbArtifacts) {
    if (artifact.activated) {
      const def = VB_ARTIFACTS.find((a) => a.id === artifact.artifactId)
      if (def) power += def.powerBonus
    }
  }
  return power
}

// === DEFAULT STATE ===

function vbCreateDefaultState(): VelvetBroodState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 100,
    vbSpiders: [],
    vbNests: VB_NESTS.map((n) => ({
      nestId: n.id,
      unlocked: n.unlockLevel <= 1,
      level: 1,
      tendCount: 0,
      lastTended: 0,
      activeSpiders: 0,
      resourcesGenerated: 0,
    })),
    vbInventory: [],
    vbArtifacts: VB_ARTIFACTS.map((a) => ({
      artifactId: a.id,
      discovered: false,
      activated: false,
      discoveredAt: 0,
      activatedAt: 0,
    })),
    vbAchievements: VB_ACHIEVEMENTS.map((a) => ({
      id: a.id,
      unlocked: false,
      unlockedAt: 0,
    })),
    vbStructures: VB_STRUCTURES.map((s) => ({
      structureId: s.id,
      built: false,
      level: 0,
      placedAtNest: null,
    })),
    vbTitle: VB_TITLES[0].name,
    vbEvents: VB_EVENTS.map((e) => ({
      eventId: e.id,
      active: false,
      startTime: 0,
      endTime: 0,
      completionCount: 0,
      lastCompleted: 0,
    })),
    vbStats: {
      totalSpidersSummoned: 0,
      totalNestsTended: 0,
      totalStructuresBuilt: 0,
      totalArtifactsActivated: 0,
      totalEventsTriggered: 0,
      totalMaterialsCollected: 0,
      totalXpEarned: 0,
      totalCoinsSpent: 0,
      totalVenomHarvested: 0,
      totalSilkWoven: 0,
      broodPower: 0,
      playTicks: 0,
    },
    tick: 0,
    initializedAt: Date.now(),
  }
}

// === HOOK ===

export default function useVelvetBrood() {
  const stateRef = useRef<VelvetBroodState>(vbCreateDefaultState())
  const [state, setState] = useState<VelvetBroodState>(() => {
    if (typeof window === 'undefined') return vbCreateDefaultState()
    try {
      const saved = localStorage.getItem('velvet-brood-save')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...vbCreateDefaultState(), ...parsed }
      }
    } catch {
      // ignore parse errors
    }
    return vbCreateDefaultState()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('velvet-brood-save', JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // === COMPUTED VALUES ===

  const vbXpRequired = useMemo((): number => vbGetXpRequired(state.level), [state.level])
  const vbXpProgress = useMemo((): number => {
    if (vbXpRequired <= 0 || vbXpRequired === Infinity) return 1
    return Math.min(1, state.xp / vbXpRequired)
  }, [state.xp, vbXpRequired])
  const vbOverallProgress = useMemo((): number => state.level / VB_MAX_LEVEL, [state.level])
  const vbBroodPower = useMemo((): number => vbCalculateBroodPower(state), [state])
  const vbUnlockedNestCount = useMemo((): number => state.vbNests.filter((n) => n.unlocked).length, [state.vbNests])
  const vbSpiderCount = useMemo((): number => state.vbSpiders.length, [state.vbSpiders])
  const vbUnlockedAchievementCount = useMemo((): number => state.vbAchievements.filter((a) => a.unlocked).length, [state.vbAchievements])
  const vbActivatedArtifactCount = useMemo((): number => state.vbArtifacts.filter((a) => a.activated).length, [state.vbArtifacts])
  const vbBuiltStructureCount = useMemo((): number => state.vbStructures.filter((s) => s.built).length, [state.vbStructures])
  const vbActiveEventCount = useMemo((): number => state.vbEvents.filter((e) => e.active).length, [state.vbEvents])

  // === SIMPLE GETTERS ===

  const vbGetLevel = useCallback((): number => state.level, [state.level])
  const vbGetXp = useCallback((): number => state.xp, [state.xp])
  const vbGetTotalXp = useCallback((): number => state.totalXp, [state.totalXp])
  const vbGetCoins = useCallback((): number => state.coins, [state.coins])
  const vbGetTitle = useCallback((): string => state.vbTitle, [state.vbTitle])
  const vbGetTick = useCallback((): number => state.tick, [state.tick])

  const vbGetSpiders = useCallback((): VbSpiderEntity[] => state.vbSpiders, [state.vbSpiders])
  const vbGetNests = useCallback((): VbNestEntity[] => state.vbNests, [state.vbNests])
  const vbGetInventory = useCallback((): VbInventoryItem[] => state.vbInventory, [state.vbInventory])
  const vbGetArtifacts = useCallback((): VbArtifactEntity[] => state.vbArtifacts, [state.vbArtifacts])
  const vbGetAchievements = useCallback((): VbAchievementEntity[] => state.vbAchievements, [state.vbAchievements])
  const vbGetStructures = useCallback((): VbStructureEntity[] => state.vbStructures, [state.vbStructures])
  const vbGetEvents = useCallback((): VbEventState[] => state.vbEvents, [state.vbEvents])
  const vbGetStats = useCallback((): VbStats => state.vbStats, [state.vbStats])

  const vbGetSpiderById = useCallback((id: string): VbSpiderEntity | null => {
    return state.vbSpiders.find((s) => s.id === id) ?? null
  }, [state.vbSpiders])

  const vbGetSpidersByType = useCallback((type: VbSpiderType): VbSpiderEntity[] => {
    return state.vbSpiders.filter((s) => {
      const def = VB_SPIDERS.find((d) => d.id === s.spiderDefId)
      return def?.type === type
    })
  }, [state.vbSpiders])

  const vbGetSpidersByNest = useCallback((nestId: VbNestId): VbSpiderEntity[] => {
    return state.vbSpiders.filter((s) => s.assignedNest === nestId)
  }, [state.vbSpiders])

  const vbGetNestById = useCallback((nestId: VbNestId): VbNestEntity | null => {
    return state.vbNests.find((n) => n.nestId === nestId) ?? null
  }, [state.vbNests])

  const vbGetInventoryQuantity = useCallback((materialId: string): number => {
    const item = state.vbInventory.find((i) => i.materialId === materialId)
    return item?.quantity ?? 0
  }, [state.vbInventory])

  const vbGetStructureById = useCallback((structureId: string): VbStructureEntity | null => {
    return state.vbStructures.find((s) => s.structureId === structureId) ?? null
  }, [state.vbStructures])

  const vbGetStructuresByNest = useCallback((nestId: VbNestId): VbStructureEntity[] => {
    return state.vbStructures.filter((s) => s.placedAtNest === nestId)
  }, [state.vbStructures])

  // === XP & COINS ===

  const vbAddXp = useCallback((amount: number) => {
    setState((prev) => {
      let xp = prev.xp + Math.floor(amount)
      let level = prev.level
      let totalXp = prev.totalXp + Math.floor(amount)
      while (level < VB_MAX_LEVEL && xp >= vbGetXpRequired(level)) {
        xp -= vbGetXpRequired(level)
        level += 1
      }
      if (level >= VB_MAX_LEVEL) {
        xp = 0
      }
      const title = vbGetTitleForLevel(level)
      return { ...prev, level, xp, totalXp, vbTitle: title }
    })
  }, [])

  const vbAddCoins = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + Math.floor(amount),
    }))
  }, [])

  const vbSpendCoins = useCallback((amount: number): boolean => {
    let success = false
    setState((prev) => {
      if (prev.coins < amount) return prev
      success = true
      return {
        ...prev,
        coins: prev.coins - Math.floor(amount),
        vbStats: { ...prev.vbStats, totalCoinsSpent: prev.vbStats.totalCoinsSpent + Math.floor(amount) },
      }
    })
    return success
  }, [])

  // === SPIDER ACTIONS ===

  const vbSummonSpider = useCallback((spiderDefId: string): VbSpiderEntity | null => {
    const def = VB_SPIDERS.find((s) => s.id === spiderDefId)
    if (!def) return null

    let spawned: VbSpiderEntity | null = null
    setState((prev) => {
      if (prev.coins < def.summonCost) return prev
      const spider: VbSpiderEntity = {
        id: vbGenerateId(),
        spiderDefId: def.id,
        nickname: def.name,
        level: 1,
        xp: 0,
        health: def.defense * 10 + 50,
        maxHealth: def.defense * 10 + 50,
        happiness: 80,
        assignedNest: def.nestPreference,
        summonedAt: Date.now(),
      }
      spawned = spider
      const updatedSpiders = [...prev.vbSpiders, spider]
      const updatedNests = prev.vbNests.map((n) =>
        n.nestId === def.nestPreference ? { ...n, activeSpiders: n.activeSpiders + 1 } : n
      )
      return {
        ...prev,
        coins: prev.coins - def.summonCost,
        vbSpiders: updatedSpiders,
        vbNests: updatedNests,
        vbStats: {
          ...prev.vbStats,
          totalSpidersSummoned: prev.vbStats.totalSpidersSummoned + 1,
          broodPower: vbCalculateBroodPower({ ...prev, vbSpiders: updatedSpiders, vbArtifacts: prev.vbArtifacts }),
        },
        vbAchievements: vbCheckAchievements({
          ...prev,
          vbSpiders: updatedSpiders,
          vbStats: {
            ...prev.vbStats,
            totalSpidersSummoned: prev.vbStats.totalSpidersSummoned + 1,
          },
        }),
      }
    })
    return spawned
  }, [])

  const vbRandomSummon = useCallback((): VbSpiderEntity | null => {
    const types: VbSpiderType[] = ['velvet_widow', 'silk_weaver', 'venom_fang', 'shadow_spinner', 'crystal_scorpion', 'moon_arachnid', 'ember_tarantula']
    const type = types[Math.floor(Math.random() * types.length)]
    const weights: Record<VbRarity, number> = { common: 50, uncommon: 30, rare: 14, epic: 5, legendary: 1 }
    const rarity = vbRollRarity(weights)
    const def = vbGetSpiderByTypeAndRarity(type, rarity)
    if (!def) return null
    return vbSummonSpider(def.id)
  }, [vbSummonSpider])

  const vbTrainSpider = useCallback((spiderId: string) => {
    setState((prev) => ({
      ...prev,
      vbSpiders: prev.vbSpiders.map((s) => {
        if (s.id !== spiderId) return s
        const newXp = s.xp + 15
        let newLevel = s.level
        let remainingXp = newXp
        while (newLevel < 30 && remainingXp >= newLevel * 50) {
          remainingXp -= newLevel * 50
          newLevel += 1
        }
        const def = VB_SPIDERS.find((d) => d.id === s.spiderDefId)
        const newMaxHealth = def ? (def.defense * 10 + 50) + newLevel * 5 : s.maxHealth
        return { ...s, xp: remainingXp, level: newLevel, maxHealth: newMaxHealth, health: newMaxHealth }
      }),
    }))
  }, [])

  const vbHealSpider = useCallback((spiderId: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      vbSpiders: prev.vbSpiders.map((s) => {
        if (s.id !== spiderId) return s
        return { ...s, health: Math.min(s.maxHealth, s.health + amount) }
      }),
    }))
  }, [])

  const vbReleaseSpider = useCallback((spiderId: string): boolean => {
    let released = false
    let nestId: VbNestId | null = null
    setState((prev) => {
      const spider = prev.vbSpiders.find((s) => s.id === spiderId)
      if (!spider) return prev
      released = true
      nestId = spider.assignedNest
      const updatedSpiders = prev.vbSpiders.filter((s) => s.id !== spiderId)
      const updatedNests = spider.assignedNest
        ? prev.vbNests.map((n) => n.nestId === spider.assignedNest ? { ...n, activeSpiders: Math.max(0, n.activeSpiders - 1) } : n)
        : prev.vbNests
      return { ...prev, vbSpiders: updatedSpiders, vbNests: updatedNests }
    })
    return released
  }, [])

  const vbAssignSpiderToNest = useCallback((spiderId: string, nestId: VbNestId | null) => {
    setState((prev) => {
      const spider = prev.vbSpiders.find((s) => s.id === spiderId)
      if (!spider) return prev
      const oldNest = spider.assignedNest
      const updatedSpiders = prev.vbSpiders.map((s) =>
        s.id === spiderId ? { ...s, assignedNest: nestId } : s
      )
      const updatedNests = prev.vbNests.map((n) => {
        if (n.nestId === oldNest) return { ...n, activeSpiders: Math.max(0, n.activeSpiders - 1) }
        if (n.nestId === nestId) return { ...n, activeSpiders: n.activeSpiders + 1 }
        return n
      })
      return { ...prev, vbSpiders: updatedSpiders, vbNests: updatedNests }
    })
  }, [])

  // === NEST ACTIONS ===

  const vbTendNest = useCallback((nestId: VbNestId): boolean => {
    let tended = false
    setState((prev) => {
      const nest = prev.vbNests.find((n) => n.nestId === nestId)
      if (!nest || !nest.unlocked) return prev
      tended = true

      const nestDef = VB_NESTS.find((d) => d.id === nestId)
      if (!nestDef) return prev

      // Calculate resource bonus from structures placed at this nest
      let silkBonus = 0
      let venomBonus = 0
      for (const struct of prev.vbStructures) {
        if (struct.placedAtNest === nestId && struct.built) {
          const structDef = VB_STRUCTURES.find((d) => d.id === struct.structureId)
          if (structDef) {
            if (structDef.type === 'silk_farm') silkBonus += struct.level * 2
            if (structDef.type === 'venom_lab') venomBonus += struct.level * 2
          }
        }
      }

      // Generate materials
      const newItems: VbInventoryItem[] = []
      const resources = { ...nestDef.resources }
      resources.silk += silkBonus
      resources.venom += venomBonus

      const categoryToMaterialIds: Record<VbMaterialCategory, string[]> = {
        silk: ['raw_silk', 'velvet_thread', 'gossamer_strand', 'moonlight_silk', 'stardust_web', 'fate_thread'],
        venom: ['dew_venom', 'crimson_drops', 'neuro_toxin', 'shadow_venom', 'plague_extract', 'leviathan_ichor'],
        crystal: ['quartz_shard', 'amethyst_gem', 'obsidian_core', 'prism_shard', 'eternal_diamond'],
        chitin: ['soft_chitin', 'hardened_plate', 'venomous_fang', 'diamond_carapace', 'elder_shell'],
        amber: ['tree_amber', 'golden_resin', 'ancient_amber', 'time_capsule'],
        shadow_essence: ['wisp_shadow', 'void_fragment', 'nightmare_core', 'abyssal_heart'],
      }

      let totalMaterialsGained = 0
      let totalVenomGained = 0
      let totalSilkGained = 0

      for (const [cat, amount] of Object.entries(resources)) {
        if (amount <= 0) continue
        const catKey = cat as VbMaterialCategory
        const materialIds = categoryToMaterialIds[catKey]
        if (!materialIds || materialIds.length === 0) continue
        const materialId = materialIds[Math.floor(Math.random() * materialIds.length)]
        newItems.push({ materialId, quantity: amount })
        totalMaterialsGained += amount
        if (catKey === 'venom') totalVenomGained += amount
        if (catKey === 'silk') totalSilkGained += amount
      }

      const updatedInventory = [...prev.vbInventory]
      for (const item of newItems) {
        const existing = updatedInventory.find((i) => i.materialId === item.materialId)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          updatedInventory.push({ ...item })
        }
      }

      const xpGained = 10 + nest.level * 2
      const coinGained = 5 + nest.level

      return {
        ...prev,
        vbNests: prev.vbNests.map((n) =>
          n.nestId === nestId ? { ...n, tendCount: n.tendCount + 1, lastTended: Date.now(), resourcesGenerated: n.resourcesGenerated + totalMaterialsGained } : n
        ),
        vbInventory: updatedInventory,
        xp: prev.xp + xpGained,
        totalXp: prev.totalXp + xpGained,
        coins: prev.coins + coinGained,
        vbStats: {
          ...prev.vbStats,
          totalNestsTended: prev.vbStats.totalNestsTended + 1,
          totalMaterialsCollected: prev.vbStats.totalMaterialsCollected + totalMaterialsGained,
          totalVenomHarvested: prev.vbStats.totalVenomHarvested + totalVenomGained,
          totalSilkWoven: prev.vbStats.totalSilkWoven + totalSilkGained,
          totalXpEarned: prev.vbStats.totalXpEarned + xpGained,
        },
        vbAchievements: vbCheckAchievements({
          ...prev,
          vbStats: {
            ...prev.vbStats,
            totalNestsTended: prev.vbStats.totalNestsTended + 1,
            totalMaterialsCollected: prev.vbStats.totalMaterialsCollected + totalMaterialsGained,
            totalVenomHarvested: prev.vbStats.totalVenomHarvested + totalVenomGained,
            totalSilkWoven: prev.vbStats.totalSilkWoven + totalSilkGained,
          },
          vbNests: prev.vbNests.map((n) =>
            n.nestId === nestId ? { ...n, tendCount: n.tendCount + 1 } : n
          ),
        }),
      }
    })
    return tended
  }, [])

  const vbUnlockNest = useCallback((nestId: VbNestId): boolean => {
    let unlocked = false
    setState((prev) => {
      const nestDef = VB_NESTS.find((n) => n.id === nestId)
      if (!nestDef) return prev
      if (prev.level < nestDef.unlockLevel) return prev
      const alreadyUnlocked = prev.vbNests.find((n) => n.nestId === nestId && n.unlocked)
      if (alreadyUnlocked) return prev
      unlocked = true
      const updatedNests = prev.vbNests.map((n) =>
        n.nestId === nestId ? { ...n, unlocked: true } : n
      )
      return {
        ...prev,
        vbNests: updatedNests,
        vbAchievements: vbCheckAchievements({ ...prev, vbNests: updatedNests }),
      }
    })
    return unlocked
  }, [])

  const vbUpgradeNest = useCallback((nestId: VbNestId) => {
    setState((prev) => ({
      ...prev,
      vbNests: prev.vbNests.map((n) =>
        n.nestId === nestId && n.unlocked ? { ...n, level: n.level + 1 } : n
      ),
    }))
  }, [])

  // === STRUCTURE ACTIONS ===

  const vbBuildStructure = useCallback((structureId: string, nestId: VbNestId | null): boolean => {
    let built = false
    setState((prev) => {
      const def = VB_STRUCTURES.find((s) => s.id === structureId)
      if (!def) return prev
      const existing = prev.vbStructures.find((s) => s.structureId === structureId)
      if (existing && existing.built) return prev

      // Check if player has enough materials
      const tempInventory = [...prev.vbInventory]
      for (const [cat, cost] of Object.entries(def.baseCost)) {
        const catKey = cat as VbMaterialCategory
        const materialIds: string[] = {
          silk: ['raw_silk'], venom: ['dew_venom'], crystal: ['quartz_shard'],
          chitin: ['soft_chitin'], amber: ['tree_amber'], shadow_essence: ['wisp_shadow'],
        }[catKey] ?? []
        let remaining = cost
        for (const matId of materialIds) {
          const invItem = tempInventory.find((i) => i.materialId === matId)
          if (invItem && invItem.quantity >= remaining) {
            invItem.quantity -= remaining
            remaining = 0
            break
          } else if (invItem) {
            remaining -= invItem.quantity
            invItem.quantity = 0
          }
        }
        if (remaining > 0) return prev
      }

      built = true
      const updatedStructures = prev.vbStructures.map((s) =>
        s.structureId === structureId ? { ...s, built: true, level: 1, placedAtNest: nestId } : s
      )
      return {
        ...prev,
        vbInventory: tempInventory.filter((i) => i.quantity > 0),
        vbStructures: updatedStructures,
        vbStats: {
          ...prev.vbStats,
          totalStructuresBuilt: prev.vbStats.totalStructuresBuilt + 1,
        },
        vbAchievements: vbCheckAchievements({
          ...prev,
          vbStats: {
            ...prev.vbStats,
            totalStructuresBuilt: prev.vbStats.totalStructuresBuilt + 1,
          },
        }),
      }
    })
    return built
  }, [])

  const vbUpgradeStructure = useCallback((structureId: string): boolean => {
    let upgraded = false
    setState((prev) => {
      const struct = prev.vbStructures.find((s) => s.structureId === structureId)
      if (!struct || !struct.built) return prev
      const def = VB_STRUCTURES.find((d) => d.id === structureId)
      if (!def || struct.level >= def.maxLevel) return prev

      // Check materials for level up
      const tempInventory = [...prev.vbInventory]
      for (const [cat, cost] of Object.entries(def.levelUpCost)) {
        const catKey = cat as VbMaterialCategory
        const materialIds: string[] = {
          silk: ['raw_silk'], venom: ['dew_venom'], crystal: ['quartz_shard'],
          chitin: ['soft_chitin'], amber: ['tree_amber'], shadow_essence: ['wisp_shadow'],
        }[catKey] ?? []
        let remaining = cost
        for (const matId of materialIds) {
          const invItem = tempInventory.find((i) => i.materialId === matId)
          if (invItem && invItem.quantity >= remaining) {
            invItem.quantity -= remaining
            remaining = 0
            break
          } else if (invItem) {
            remaining -= invItem.quantity
            invItem.quantity = 0
          }
        }
        if (remaining > 0) return prev
      }

      upgraded = true
      const updatedStructures = prev.vbStructures.map((s) =>
        s.structureId === structureId ? { ...s, level: s.level + 1 } : s
      )
      return {
        ...prev,
        vbInventory: tempInventory.filter((i) => i.quantity > 0),
        vbStructures: updatedStructures,
      }
    })
    return upgraded
  }, [])

  // === ARTIFACT ACTIONS ===

  const vbActivateArtifact = useCallback((artifactId: string): boolean => {
    let activated = false
    setState((prev) => {
      const artifact = prev.vbArtifacts.find((a) => a.artifactId === artifactId)
      if (!artifact || !artifact.discovered) return prev
      if (artifact.activated) return prev
      activated = true
      const updatedArtifacts = prev.vbArtifacts.map((a) =>
        a.artifactId === artifactId ? { ...a, activated: true, activatedAt: Date.now() } : a
      )
      return {
        ...prev,
        vbArtifacts: updatedArtifacts,
        vbStats: {
          ...prev.vbStats,
          totalArtifactsActivated: prev.vbStats.totalArtifactsActivated + 1,
        },
        vbAchievements: vbCheckAchievements({
          ...prev,
          vbStats: {
            ...prev.vbStats,
            totalArtifactsActivated: prev.vbStats.totalArtifactsActivated + 1,
          },
        }),
      }
    })
    return activated
  }, [])

  const vbDiscoverArtifact = useCallback((artifactId: string): boolean => {
    let discovered = false
    setState((prev) => {
      const artifact = prev.vbArtifacts.find((a) => a.artifactId === artifactId)
      if (!artifact || artifact.discovered) return prev
      discovered = true
      const updatedArtifacts = prev.vbArtifacts.map((a) =>
        a.artifactId === artifactId ? { ...a, discovered: true, discoveredAt: Date.now() } : a
      )
      return { ...prev, vbArtifacts: updatedArtifacts }
    })
    return discovered
  }, [])

  // === EVENT ACTIONS ===

  const vbTriggerBroodEvent = useCallback((): VbEventDef | null => {
    let triggeredEvent: VbEventDef | null = null
    setState((prev) => {
      const now = Date.now()
      const eligibleEvents = VB_EVENTS.filter((e) => {
        if (prev.level < e.unlockLevel) return false
        const eventState = prev.vbEvents.find((es) => es.eventId === e.id)
        if (!eventState) return false
        if (eventState.active) return false
        if (now - eventState.lastCompleted < e.cooldown * 1000) return false
        return true
      })
      if (eligibleEvents.length === 0) return prev

      const eventDef = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)]
      triggeredEvent = eventDef

      const updatedEvents = prev.vbEvents.map((e) =>
        e.eventId === eventDef.id ? { ...e, active: true, startTime: now, endTime: now + eventDef.duration * 1000 } : e
      )

      // Grant event rewards immediately
      const newItems: VbInventoryItem[] = []
      const categoryToMaterialIds: Record<VbMaterialCategory, string[]> = {
        silk: ['raw_silk', 'velvet_thread', 'gossamer_strand'],
        venom: ['dew_venom', 'crimson_drops', 'neuro_toxin'],
        crystal: ['quartz_shard', 'amethyst_gem', 'obsidian_core'],
        chitin: ['soft_chitin', 'hardened_plate', 'venomous_fang'],
        amber: ['tree_amber', 'golden_resin', 'ancient_amber'],
        shadow_essence: ['wisp_shadow', 'void_fragment', 'nightmare_core'],
      }

      for (const [cat, amount] of Object.entries(eventDef.rewards)) {
        if (amount <= 0) continue
        const catKey = cat as VbMaterialCategory
        const matIds = categoryToMaterialIds[catKey]
        if (!matIds || matIds.length === 0) continue
        const matId = matIds[Math.floor(Math.random() * matIds.length)]
        newItems.push({ materialId: matId, quantity: amount })
      }

      const updatedInventory = [...prev.vbInventory]
      let totalMaterialsGained = 0
      for (const item of newItems) {
        const existing = updatedInventory.find((i) => i.materialId === item.materialId)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          updatedInventory.push({ ...item })
        }
        totalMaterialsGained += item.quantity
      }

      // Random artifact discovery chance
      let updatedArtifacts = prev.vbArtifacts
      if (Math.random() < 0.15) {
        const undiscovered = prev.vbArtifacts.filter((a) => !a.discovered)
        if (undiscovered.length > 0) {
          const toDiscover = undiscovered[Math.floor(Math.random() * undiscovered.length)]
          updatedArtifacts = prev.vbArtifacts.map((a) =>
            a.artifactId === toDiscover.artifactId ? { ...a, discovered: true, discoveredAt: now } : a
          )
        }
      }

      return {
        ...prev,
        vbEvents: updatedEvents,
        vbInventory: updatedInventory,
        vbArtifacts: updatedArtifacts,
        vbStats: {
          ...prev.vbStats,
          totalEventsTriggered: prev.vbStats.totalEventsTriggered + 1,
          totalMaterialsCollected: prev.vbStats.totalMaterialsCollected + totalMaterialsGained,
        },
      }
    })
    return triggeredEvent
  }, [])

  const vbEndEvent = useCallback((eventId: VbEventType) => {
    setState((prev) => ({
      ...prev,
      vbEvents: prev.vbEvents.map((e) =>
        e.eventId === eventId ? { ...e, active: false, completionCount: e.completionCount + 1, lastCompleted: Date.now() } : e
      ),
    }))
  }, [])

  // === INVENTORY ACTIONS ===

  const vbAddMaterial = useCallback((materialId: string, quantity: number) => {
    setState((prev) => {
      const existing = prev.vbInventory.find((i) => i.materialId === materialId)
      if (existing) {
        return {
          ...prev,
          vbInventory: prev.vbInventory.map((i) =>
            i.materialId === materialId ? { ...i, quantity: i.quantity + quantity } : i
          ),
        }
      }
      return {
        ...prev,
        vbInventory: [...prev.vbInventory, { materialId, quantity }],
      }
    })
  }, [])

  const vbRemoveMaterial = useCallback((materialId: string, quantity: number): boolean => {
    let removed = false
    setState((prev) => {
      const existing = prev.vbInventory.find((i) => i.materialId === materialId)
      if (!existing || existing.quantity < quantity) return prev
      removed = true
      const newQuantity = existing.quantity - quantity
      if (newQuantity <= 0) {
        return { ...prev, vbInventory: prev.vbInventory.filter((i) => i.materialId !== materialId) }
      }
      return {
        ...prev,
        vbInventory: prev.vbInventory.map((i) =>
          i.materialId === materialId ? { ...i, quantity: newQuantity } : i
        ),
      }
    })
    return removed
  }, [])

  // === RESET ===

  const vbResetVelvetBrood = useCallback(() => {
    const fresh = vbCreateDefaultState()
    setState(fresh)
    stateRef.current = fresh
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('velvet-brood-save')
      } catch {
        // ignore
      }
    }
  }, [])

  // === MISC ===

  const vbBoostAllHappiness = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      vbSpiders: prev.vbSpiders.map((s) => ({
        ...s,
        happiness: Math.min(100, Math.max(0, s.happiness + amount)),
      })),
    }))
  }, [])

  const vbSetLevel = useCallback((newLevel: number) => {
    setState((prev) => {
      const clamped = Math.max(1, Math.min(VB_MAX_LEVEL, Math.floor(newLevel)))
      const title = vbGetTitleForLevel(clamped)
      return { ...prev, level: clamped, vbTitle: title }
    })
  }, [])

  const vbSetCoins = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, coins: Math.max(0, Math.floor(amount)) }))
  }, [])

  // === RETURN vbAPI ===

  const vbAPI = useMemo(() => ({
    // --- Constants (Pattern A: directly on API object) ---
    VB_COLOR_VELVET,
    VB_COLOR_SILK,
    VB_COLOR_VENOM,
    VB_COLOR_SHADOW,
    VB_COLOR_AMETHYST,
    VB_COLOR_PLUM,
    VB_COLOR_DEEP_PURPLE,
    VB_COLOR_LAVENDER,
    VB_COLOR_TOXIC,
    VB_COLOR_CRIMSON,
    VB_COLOR_GOLD,
    VB_COLOR_OBSIDIAN,
    VB_SPIDERS,
    VB_SPIDER_TYPES,
    VB_NESTS,
    VB_NEST_ROOT_CAVERN,
    VB_NEST_MOONLIT_GROTTO,
    VB_NEST_CRYSTAL_DEN,
    VB_NEST_SHADOW_VAULT,
    VB_NEST_EMBER_HOLLOW,
    VB_NEST_SILK_SANCTUM,
    VB_NEST_VENOM_CRYPT,
    VB_NEST_OBSIDIAN_THRONE,
    VB_MATERIALS,
    VB_STRUCTURES,
    VB_ABILITIES,
    VB_ACHIEVEMENTS,
    VB_TITLES,
    VB_ARTIFACTS,
    VB_EVENTS,
    VB_RARITIES,
    VB_RARITY_COMMON,
    VB_RARITY_UNCOMMON,
    VB_RARITY_RARE,
    VB_RARITY_EPIC,
    VB_RARITY_LEGENDARY,
    VB_MAX_LEVEL,
    VB_XP_TABLE,
    // --- Computed ---
    vbXpRequired,
    vbXpProgress,
    vbOverallProgress,
    vbBroodPower,
    vbUnlockedNestCount,
    vbSpiderCount,
    vbUnlockedAchievementCount,
    vbActivatedArtifactCount,
    vbBuiltStructureCount,
    vbActiveEventCount,
    // --- State ---
    state,
    // --- Simple Getters ---
    vbGetLevel,
    vbGetXp,
    vbGetTotalXp,
    vbGetCoins,
    vbGetTitle,
    vbGetTick,
    vbGetSpiders,
    vbGetNests,
    vbGetInventory,
    vbGetArtifacts,
    vbGetAchievements,
    vbGetStructures,
    vbGetEvents,
    vbGetStats,
    vbGetSpiderById,
    vbGetSpidersByType,
    vbGetSpidersByNest,
    vbGetNestById,
    vbGetInventoryQuantity,
    vbGetStructureById,
    vbGetStructuresByNest,
    // --- XP & Coins ---
    vbAddXp,
    vbAddCoins,
    vbSpendCoins,
    vbSetLevel,
    vbSetCoins,
    // --- Spider Actions ---
    vbSummonSpider,
    vbRandomSummon,
    vbTrainSpider,
    vbHealSpider,
    vbReleaseSpider,
    vbAssignSpiderToNest,
    vbBoostAllHappiness,
    // --- Nest Actions ---
    vbTendNest,
    vbUnlockNest,
    vbUpgradeNest,
    // --- Structure Actions ---
    vbBuildStructure,
    vbUpgradeStructure,
    // --- Artifact Actions ---
    vbActivateArtifact,
    vbDiscoverArtifact,
    // --- Event Actions ---
    vbTriggerBroodEvent,
    vbEndEvent,
    // --- Inventory Actions ---
    vbAddMaterial,
    vbRemoveMaterial,
    // --- Reset ---
    vbResetVelvetBrood,
  }), [
    // Constants are stable references, no deps needed
    // Computed values
    vbXpRequired, vbXpProgress, vbOverallProgress, vbBroodPower,
    vbUnlockedNestCount, vbSpiderCount, vbUnlockedAchievementCount,
    vbActivatedArtifactCount, vbBuiltStructureCount, vbActiveEventCount,
    // State
    state,
    // Getters
    vbGetLevel, vbGetXp, vbGetTotalXp, vbGetCoins, vbGetTitle, vbGetTick,
    vbGetSpiders, vbGetNests, vbGetInventory, vbGetArtifacts, vbGetAchievements,
    vbGetStructures, vbGetEvents, vbGetStats, vbGetSpiderById, vbGetSpidersByType,
    vbGetSpidersByNest, vbGetNestById, vbGetInventoryQuantity, vbGetStructureById,
    vbGetStructuresByNest,
    // Actions
    vbAddXp, vbAddCoins, vbSpendCoins, vbSetLevel, vbSetCoins,
    vbSummonSpider, vbRandomSummon, vbTrainSpider, vbHealSpider,
    vbReleaseSpider, vbAssignSpiderToNest, vbBoostAllHappiness,
    vbTendNest, vbUnlockNest, vbUpgradeNest,
    vbBuildStructure, vbUpgradeStructure,
    vbActivateArtifact, vbDiscoverArtifact,
    vbTriggerBroodEvent, vbEndEvent,
    vbAddMaterial, vbRemoveMaterial,
    vbResetVelvetBrood,
  ])

  return vbAPI
}
