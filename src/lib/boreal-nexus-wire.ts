/**
 * Boreal Nexus Wire — 极北枢纽 (Boreal Nexus / Frozen Crossroads) feature module
 *
 * An ancient frozen crossroads at the top of the world where aurora spirits
 * gather and ice civilizations converge. Summon 35 aurora entities across
 * 5 rarity tiers and 7 species, claim 8 nexus locations, collect 30
 * ice/aurora materials, build 25 nexus structures, wield 22 aurora abilities,
 * earn 8 titles from Frost Wanderer to Boreal Emperor, gather 15 legendary
 * artifacts, and endure 12 nexus events — backed by a Zustand store with
 * persist middleware.
 *
 * Storage key: boreal-nexus-wire
 * Prefix: bn / BN_
 */

import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type BNRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type BNSpecies =
  | 'frost_spirit'
  | 'aurora_walker'
  | 'north_wind'
  | 'ice_phoenix'
  | 'permafrost_dragon'
  | 'snow_nymph'
  | 'boreal_titan'

export interface BNEntityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly species: BNSpecies
  readonly rarity: BNRarity
  readonly auroraPower: number
  readonly summonCost: number
  readonly abilities: string[]
  readonly lore: string
  readonly stats: {
    attack: number
    defense: number
    speed: number
    magic: number
    hp: number
  }
}

export interface BNSpeciesDef {
  readonly id: BNSpecies
  readonly name: string
  readonly description: string
  readonly color: string
  readonly passiveBonus: string
  readonly passiveValue: number
  readonly preferredNexus: string
}

export interface BNNexusDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
  readonly element: BNSpecies
}

export interface BNMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: BNRarity
  readonly source: string
  readonly value: number
  readonly category: 'aurora' | 'frost' | 'permafrost' | 'crystal' | 'wind' | 'nexus'
}

export interface BNStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
  readonly maxLevel: number
  readonly category: 'defense' | 'production' | 'enchantment' | 'storage' | 'summoning'
}

export interface BNAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: BNSpecies
  readonly energyCost: number
}

export interface BNAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
  readonly icon: string
}

export interface BNTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredNexuses: number
}

export interface BNArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: BNRarity
  readonly powerBonus: number
  readonly specialAbility: string
  readonly forgeCost: number
}

export interface BNEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
  readonly element: BNSpecies
}

export interface BNEntityEntity {
  readonly id: string
  entityDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  summonedAt: number
  nexusesDefended: number
}

export interface BNStructureEntity {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface BNStoreState {
  bnLevel: number
  bnAuroraPower: number
  bnFrostEnergy: number
  bnEntities: Record<string, BNEntityEntity>
  bnNexuses: Record<string, { claimed: boolean; claimedAt: number | null; defenseBonus: number }>
  bnStructures: Record<string, BNStructureEntity>
  bnArtifacts: string[]
  bnAchievements: string[]
  bnInventory: Record<string, number>
  bnStats: {
    totalEntitiesSummoned: number
    totalNexusesClaimed: number
    totalStructuresBuilt: number
    totalArtifactsActivated: number
    totalAuroraStrikes: number
    totalAuroraPowerEarned: number
    totalFrostEnergyGained: number
    totalRelicsActivated: number
  }
  bnTitle: string
  bnActiveEventId: string | null
  bnEventTimer: number
  bnGold: number
  bnIceCrystals: number
  bnActiveNexusId: string | null
}

export interface BNStoreActions {
  bnSummonEntity: (entityId: string) => boolean
  bnNexusClaim: (nexusId: string) => boolean
  bnBuildStructure: (structureId: string) => boolean
  bnAuroraStrike: (targetNexusId: string) => boolean
  bnActivateRelic: (artifactId: string) => boolean
  resetBorealNexus: () => void
}

export type BNFullStore = BNStoreState & BNStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const BN_COLOR_AURORA_GREEN: string = '#27AE60'
export const BN_COLOR_ICE_BLUE: string = '#3498DB'
export const BN_COLOR_FROST_WHITE: string = '#ECF0F1'
export const BN_COLOR_POLAR_NIGHT: string = '#1B2631'
export const BN_COLOR_BOREAL_TEAL: string = '#16A085'
export const BN_COLOR_NORTHERN_VIOLET: string = '#8E44AD'
export const BN_COLOR_SNOW_SILVER: string = '#BDC3C7'
export const BN_COLOR_GLACIER_CYAN: string = '#1ABC9C'
export const BN_COLOR_AURORA_CORAL: string = '#E74C3C'
export const BN_COLOR_FROZEN_GOLD: string = '#F39C12'

export const BN_RARITY_COLORS: Record<BNRarity, string> = {
  common: '#BDC3C7',
  uncommon: '#3498DB',
  rare: '#27AE60',
  epic: '#8E44AD',
  legendary: '#F39C12',
}

export const BN_RARITY_ICONS: Record<BNRarity, string> = {
  common: '✦',
  uncommon: '❄',
  rare: '✧',
  epic: '◆',
  legendary: '♛',
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════

const BN_MAX_LEVEL = 50
const BN_INITIAL_GOLD = 500
const BN_INITIAL_AURORA_POWER = 100
const BN_INITIAL_FROST_ENERGY = 50
const BN_INITIAL_ICE_CRYSTALS = 0

function bnXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= BN_MAX_LEVEL) return Infinity
  return Math.floor(85 * Math.pow(1.13, level) + level * 20)
}

function bnLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < BN_MAX_LEVEL) {
    const needed = bnXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function bnGenerateId(): string {
  return `bn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function bnRarityMultiplier(rarity: BNRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.5
    case 'epic': return 4.0
    case 'legendary': return 7.0
  }
}

function bnSpeciesColor(species: BNSpecies): string {
  switch (species) {
    case 'frost_spirit': return BN_COLOR_ICE_BLUE
    case 'aurora_walker': return BN_COLOR_AURORA_GREEN
    case 'north_wind': return BN_COLOR_BOREAL_TEAL
    case 'ice_phoenix': return BN_COLOR_AURORA_CORAL
    case 'permafrost_dragon': return BN_COLOR_NORTHERN_VIOLET
    case 'snow_nymph': return BN_COLOR_FROST_WHITE
    case 'boreal_titan': return BN_COLOR_FROZEN_GOLD
  }
}

function bnRarityColor(rarity: BNRarity): string {
  return BN_RARITY_COLORS[rarity]
}

function bnClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: BN_SPECIES — 7 Aurora Entity Species
// ═══════════════════════════════════════════════════════════════════

export const BN_SPECIES: readonly BNSpeciesDef[] = [
  {
    id: 'frost_spirit',
    name: 'Frost Spirit',
    description:
      'Ethereal beings born from the breath of glaciers, frost spirits drift through the polar landscape leaving trails of shimmering ice crystals. They are the oldest inhabitants of the boreal nexus, having witnessed every aurora since the dawn of the world. Their touch can freeze time itself for brief moments.',
    color: BN_COLOR_ICE_BLUE,
    passiveBonus: '+12% frost magic amplification',
    passiveValue: 12,
    preferredNexus: 'glacial_convergence',
  },
  {
    id: 'aurora_walker',
    name: 'Aurora Walker',
    description:
      'Luminous entities that tread along aurora paths invisible to the naked eye. Aurora Walkers are the messengers of the boreal nexus, carrying information between nexus locations at the speed of light. Their bodies shift colors in real-time, matching the aurora spectrum of wherever they currently walk.',
    color: BN_COLOR_AURORA_GREEN,
    passiveBonus: '+18% speed and pathfinding range',
    passiveValue: 18,
    preferredNexus: 'aurora_crossing',
  },
  {
    id: 'north_wind',
    name: 'North Wind',
    description:
      'Intelligent air currents that have achieved sentience through centuries of circulating the polar atmosphere. North Winds serve as the scouts and swift strikers of the boreal nexus, capable of concentrating their vast volume into razor-thin cutting edges or expanding to fill entire valleys with their presence.',
    color: BN_COLOR_BOREAL_TEAL,
    passiveBonus: '+15% evasion and reconnaissance',
    passiveValue: 15,
    preferredNexus: 'wind_gate',
  },
  {
    id: 'ice_phoenix',
    name: 'Ice Phoenix',
    description:
      'Legendary birds of frozen flame that are reborn from their own melting ice every century. Ice Phoenixes radiate cold fire — a paradoxical energy that freezes what it illuminates. Their feathers are made of living aurora light, and their song can crack mountains with harmonic resonance.',
    color: BN_COLOR_AURORA_CORAL,
    passiveBonus: '+20% rebirth and resilience aura',
    passiveValue: 20,
    preferredNexus: 'phoenix_peak',
  },
  {
    id: 'permafrost_dragon',
    name: 'Permafrost Dragon',
    description:
      'Ancient wyrms that have burrowed through permafrost for millennia, their scales fused with the eternal ice. Permafrost Dragons are the guardians of deep boreal secrets, their tunnel networks forming the underground skeleton of the nexus. Their breath is liquid nitrogen, and their blood flows with aurora energy.',
    color: BN_COLOR_NORTHERN_VIOLET,
    passiveBonus: '+22% defense and tunnel control',
    passiveValue: 22,
    preferredNexus: 'dragon_permafrost',
  },
  {
    id: 'snow_nymph',
    name: 'Snow Nymph',
    description:
      'Graceful nature spirits that tend to the ice gardens and crystal groves of the boreal nexus. Snow Nymphs possess unparalleled control over the growth patterns of ice crystals, cultivating elaborate frozen flora that serves both decorative and defensive purposes. Their enchantments can make even stone bloom with frost.',
    color: BN_COLOR_FROST_WHITE,
    passiveBonus: '+16% production and enchantment speed',
    passiveValue: 16,
    preferredNexus: 'nymph_garden',
  },
  {
    id: 'boreal_titan',
    name: 'Boreal Titan',
    description:
      'Colossal entities made of compacted aurora light and ancient ice, standing taller than the tallest glaciers. Boreal Titans are the living pillars of the nexus, each one anchoring a section of the aurora network to the physical world. When a titan moves, the auroras above shift to follow.',
    color: BN_COLOR_FROZEN_GOLD,
    passiveBonus: '+25% raw power in aurora conditions',
    passiveValue: 25,
    preferredNexus: 'titan_forge',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: BN_ENTITIES — 35 Aurora Entities (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const BN_ENTITIES: readonly BNEntityDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'frost_whisper',
    name: 'Frost Whisper',
    description:
      'A tiny frost spirit no larger than a snowflake that carries whispered secrets between ice crystals.',
    species: 'frost_spirit',
    rarity: 'common',
    auroraPower: 14,
    summonCost: 10,
    abilities: ['Frost Touch', 'Ice Whisper'],
    lore: 'Frost Whispers are so small that a thousand could dance on the head of an icicle.',
    stats: { attack: 6, defense: 5, speed: 18, magic: 12, hp: 25 },
  },
  {
    id: 'aurora_scout',
    name: 'Aurora Scout',
    description:
      'A young aurora walker still learning the paths between nexus locations.',
    species: 'aurora_walker',
    rarity: 'common',
    auroraPower: 12,
    summonCost: 8,
    abilities: ['Glow Step', 'Path Sense'],
    lore: 'Every Aurora Scout must memorize the seven paths before they can walk alone.',
    stats: { attack: 5, defense: 4, speed: 22, magic: 8, hp: 20 },
  },
  {
    id: 'wind_breeze',
    name: 'Wind Breeze',
    description:
      'A gentle north wind current that has just awakened to consciousness.',
    species: 'north_wind',
    rarity: 'common',
    auroraPower: 13,
    summonCost: 9,
    abilities: ['Gust', 'Chill Blow'],
    lore: 'Wind Breezes are the newest sentient winds, still learning which way is north.',
    stats: { attack: 8, defense: 3, speed: 24, magic: 6, hp: 18 },
  },
  {
    id: 'ember_chick',
    name: 'Ember Chick',
    description:
      'A baby ice phoenix whose cold fire is barely visible, flickering like a blue candle.',
    species: 'ice_phoenix',
    rarity: 'common',
    auroraPower: 15,
    summonCost: 11,
    abilities: ['Cold Spark', 'Fluff Shield'],
    lore: 'Ember Chicks hatch from eggs made of aurora light during the winter solstice.',
    stats: { attack: 9, defense: 6, speed: 14, magic: 10, hp: 28 },
  },
  {
    id: 'permafrost_drake',
    name: 'Permafrost Drake',
    description:
      'A small dragon that burrows just beneath the surface ice, leaving frost trails behind.',
    species: 'permafrost_dragon',
    rarity: 'common',
    auroraPower: 18,
    summonCost: 14,
    abilities: ['Ice Fang', 'Shallow Tunnel'],
    lore: 'Permafrost Drakes are often mistaken for unusually bold frost weasels.',
    stats: { attack: 12, defense: 10, speed: 10, magic: 6, hp: 40 },
  },
  {
    id: 'frost_bloom',
    name: 'Frost Bloom',
    description:
      'A snow nymph tending their first ice flower garden.',
    species: 'snow_nymph',
    rarity: 'common',
    auroraPower: 11,
    summonCost: 7,
    abilities: ['Ice Sprout', 'Frost Petal'],
    lore: 'Frost Blooms can make a single ice rose in under three seconds.',
    stats: { attack: 4, defense: 7, speed: 12, magic: 16, hp: 30 },
  },
  {
    id: 'titan_shard',
    name: 'Titan Shard',
    description:
      'A fragment of a boreal titan that has achieved independent consciousness.',
    species: 'boreal_titan',
    rarity: 'common',
    auroraPower: 20,
    summonCost: 15,
    abilities: ['Ground Pound', 'Frost Pulse'],
    lore: 'Titan Shards believe they are complete titans, unaware of how small they are.',
    stats: { attack: 14, defense: 12, speed: 3, magic: 8, hp: 55 },
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'frost_sentinel',
    name: 'Frost Sentinel',
    description:
      'A frost spirit that has learned to condense itself into a solid sentinel form.',
    species: 'frost_spirit',
    rarity: 'uncommon',
    auroraPower: 34,
    summonCost: 50,
    abilities: ['Sentinel Form', 'Frost Lance', 'Ice Ward'],
    lore: 'Frost Sentinels guard the borders of the boreal nexus, standing motionless for decades.',
    stats: { attack: 24, defense: 20, speed: 14, magic: 28, hp: 80 },
  },
  {
    id: 'aurora_pathfinder',
    name: 'Aurora Pathfinder',
    description:
      'An aurora walker who has mapped every hidden path between nexus locations.',
    species: 'aurora_walker',
    rarity: 'uncommon',
    auroraPower: 32,
    summonCost: 48,
    abilities: ['Phase Walk', 'Aurora Bridge', 'Color Shift'],
    lore: 'Pathfinders can traverse the entire nexus network in the time it takes to blink.',
    stats: { attack: 18, defense: 14, speed: 36, magic: 26, hp: 65 },
  },
  {
    id: 'north_wind_scout',
    name: 'North Wind Scout',
    description:
      'A north wind that has refined itself into a sharp scouting instrument.',
    species: 'north_wind',
    rarity: 'uncommon',
    auroraPower: 30,
    summonCost: 45,
    abilities: ['Wind Blade', 'Storm Sense', 'Rapid Circulation'],
    lore: 'North Wind Scouts can detect changes in barometric pressure from a thousand miles.',
    stats: { attack: 22, defense: 10, speed: 38, magic: 18, hp: 55 },
  },
  {
    id: 'ice_phoenix_fledgling',
    name: 'Ice Phoenix Fledgling',
    description:
      'A young phoenix whose cold fire has grown strong enough to freeze small lakes.',
    species: 'ice_phoenix',
    rarity: 'uncommon',
    auroraPower: 36,
    summonCost: 55,
    abilities: ['Cold Flame', 'Frost Dive', 'Rebirth Spark'],
    lore: 'Fledglings molt their feathers once a year, and each feather becomes a minor artifact.',
    stats: { attack: 28, defense: 16, speed: 26, magic: 22, hp: 75 },
  },
  {
    id: 'permafrost_drake_lord',
    name: 'Permafrost Drake Lord',
    description:
      'A drake that has claimed a section of the underground tunnel network.',
    species: 'permafrost_dragon',
    rarity: 'uncommon',
    auroraPower: 38,
    summonCost: 58,
    abilities: ['Drake Breath', 'Permafrost Armor', 'Tunnel Rush'],
    lore: 'Drake Lords mark their territory with frozen runes only other dragons can read.',
    stats: { attack: 30, defense: 28, speed: 14, magic: 14, hp: 100 },
  },
  {
    id: 'snow_nymph_enchantress',
    name: 'Snow Nymph Enchantress',
    description:
      'A nymph who has mastered ice crystal enchantments, growing living ice sculptures.',
    species: 'snow_nymph',
    rarity: 'uncommon',
    auroraPower: 33,
    summonCost: 52,
    abilities: ['Crystal Bloom', 'Frost Weave', 'Ice Garden'],
    lore: 'Enchantresses grow ice trees that produce edible frost fruit.',
    stats: { attack: 14, defense: 18, speed: 16, magic: 34, hp: 70 },
  },
  {
    id: 'titan_fragment',
    name: 'Titan Fragment',
    description:
      'A larger piece of a boreal titan that commands respect from lesser entities.',
    species: 'boreal_titan',
    rarity: 'uncommon',
    auroraPower: 40,
    summonCost: 60,
    abilities: ['Titan Fist', 'Aurora Shield', 'Ground Shake'],
    lore: 'Titan Fragments glow with a faint golden aurora that pulses like a heartbeat.',
    stats: { attack: 32, defense: 30, speed: 4, magic: 16, hp: 130 },
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'frost_specter',
    name: 'Frost Specter',
    description:
      'A frost spirit of immense age that has learned to exist in multiple places simultaneously.',
    species: 'frost_spirit',
    rarity: 'rare',
    auroraPower: 65,
    summonCost: 200,
    abilities: ['Phantom Form', 'Frost Domain', 'Absolute Chill', 'Ice Mirror'],
    lore: 'Frost Specters cannot be destroyed, only dispersed — and they always reform.',
    stats: { attack: 45, defense: 36, speed: 30, magic: 60, hp: 200 },
  },
  {
    id: 'aurora_sage',
    name: 'Aurora Sage',
    description:
      'An aurora walker who has walked every path and knows every secret of the nexus.',
    species: 'aurora_walker',
    rarity: 'rare',
    auroraPower: 62,
    summonCost: 190,
    abilities: ['Sage Step', 'Path Mastery', 'Aurora Storm', 'Dimensional Fold'],
    lore: 'Aurora Sages can open temporary doorways between any two nexus locations.',
    stats: { attack: 36, defense: 28, speed: 50, magic: 48, hp: 160 },
  },
  {
    id: 'gale_sovereign',
    name: 'Gale Sovereign',
    description:
      'A north wind that commands all lesser winds within a hundred-mile radius.',
    species: 'north_wind',
    rarity: 'rare',
    auroraPower: 68,
    summonCost: 210,
    abilities: ['Gale Force', 'Wind Wall', 'Cyclone Eye', 'Arctic Howl'],
    lore: 'When the Gale Sovereign speaks, every wind in the north falls silent to listen.',
    stats: { attack: 50, defense: 24, speed: 52, magic: 32, hp: 180 },
  },
  {
    id: 'winter_phoenix',
    name: 'Winter Phoenix',
    description:
      'An ice phoenix that has died and been reborn at least once, gaining immortal wisdom.',
    species: 'ice_phoenix',
    rarity: 'rare',
    auroraPower: 70,
    summonCost: 220,
    abilities: ['Cold Inferno', 'Phoenix Rebirth', 'Frost Wings', 'Aurora Song'],
    lore: 'The song of a Winter Phoenix can freeze fire and extinguish heat itself.',
    stats: { attack: 52, defense: 38, speed: 36, magic: 44, hp: 220 },
  },
  {
    id: 'permafrost_wyrm',
    name: 'Permafrost Wyrm',
    description:
      'A fully mature dragon whose tunnels form the backbone of the nexus underground.',
    species: 'permafrost_dragon',
    rarity: 'rare',
    auroraPower: 72,
    summonCost: 240,
    abilities: ['Nitrogen Breath', 'Glacier Devour', 'Tunnel Network', 'Permafrost Spike'],
    lore: 'There are only seven Permafrost Wyrms, one for each major nexus axis.',
    stats: { attack: 58, defense: 44, speed: 22, magic: 30, hp: 300 },
  },
  {
    id: 'crystal_nymph',
    name: 'Crystal Nymph',
    description:
      'A snow nymph who has merged with the crystal lattice of the boreal nexus itself.',
    species: 'snow_nymph',
    rarity: 'rare',
    auroraPower: 64,
    summonCost: 195,
    abilities: ['Crystal Growth', 'Lattice Command', 'Ice Blossom', 'Frost Sanctuary'],
    lore: 'Crystal Nymphs can feel every crystal in the nexus vibrating in harmony.',
    stats: { attack: 28, defense: 34, speed: 20, magic: 62, hp: 170 },
  },
  {
    id: 'titan_guardian',
    name: 'Titan Guardian',
    description:
      'A boreal titan fragment that has absorbed enough aurora light to become self-sustaining.',
    species: 'boreal_titan',
    rarity: 'rare',
    auroraPower: 75,
    summonCost: 250,
    abilities: ['Titan Slam', 'Aurora Armor', 'Eternal Guard', 'Ground Break'],
    lore: 'Titan Guardians can stand perfectly still for a century, then move faster than thought.',
    stats: { attack: 60, defense: 50, speed: 8, magic: 28, hp: 350 },
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'frost_revenant',
    name: 'Frost Revenant',
    description:
      'A frost spirit that has absorbed the memories of every entity that ever dissolved into mist.',
    species: 'frost_spirit',
    rarity: 'epic',
    auroraPower: 110,
    summonCost: 800,
    abilities: ['Memory Frost', 'Legion of Mists', 'Absolute Zero', 'Revenant Domain', 'Eternal Chill'],
    lore: 'The Frost Revenant remembers the first snowfall and will remember the last.',
    stats: { attack: 75, defense: 58, speed: 40, magic: 95, hp: 400 },
  },
  {
    id: 'aurora_monarch',
    name: 'Aurora Monarch',
    description:
      'An aurora walker who can reshape the aurora paths themselves, creating new connections.',
    species: 'aurora_walker',
    rarity: 'epic',
    auroraPower: 108,
    summonCost: 780,
    abilities: ['Path Creation', 'Spectrum Command', 'Aurora Crown', 'Dimension Walk', 'Light Step'],
    lore: 'The Aurora Monarch walks between worlds, leaving trails of living color.',
    stats: { attack: 60, defense: 48, speed: 80, magic: 85, hp: 360 },
  },
  {
    id: 'storm_warden',
    name: 'Storm Warden',
    description:
      'A north wind that has ascended to control the entire polar storm system.',
    species: 'north_wind',
    rarity: 'epic',
    auroraPower: 105,
    summonCost: 750,
    abilities: ['Storm Command', 'Wind God', 'Arctic Tempest', 'Vacuum Strike', 'Polar Howl'],
    lore: 'The Storm Warden can silence the wind itself, creating pockets of absolute stillness.',
    stats: { attack: 80, defense: 40, speed: 70, magic: 60, hp: 340 },
  },
  {
    id: 'glacial_phoenix',
    name: 'Glacial Phoenix',
    description:
      'An ice phoenix that has died and been reborn seven times, now radiating eternal cold fire.',
    species: 'ice_phoenix',
    rarity: 'epic',
    auroraPower: 115,
    summonCost: 850,
    abilities: ['Eternal Flame', 'Seventh Rebirth', 'Cold Supernova', 'Frost Immortality', 'Aurora Wings'],
    lore: 'The Glacial Phoenix carries the cold fire that will one day freeze the sun.',
    stats: { attack: 88, defense: 65, speed: 55, magic: 70, hp: 420 },
  },
  {
    id: 'ancient_permafrost_dragon',
    name: 'Ancient Permafrost Dragon',
    description:
      'A dragon so old its scales have become part of the geological strata of the north.',
    species: 'permafrost_dragon',
    rarity: 'epic',
    auroraPower: 118,
    summonCost: 900,
    abilities: ['Earth Shatter', 'Nitrogen Storm', 'Glacier Ride', 'Dragon Sovereign', 'Permafrost Tomb'],
    lore: 'The Ancient Dragon sleeps beneath the North Pole, dreaming the ice ages into existence.',
    stats: { attack: 92, defense: 72, speed: 30, magic: 55, hp: 550 },
  },
  {
    id: 'frost_queen_nymph',
    name: 'Frost Queen Nymph',
    description:
      'A snow nymph who has grown an ice crown and rules an entire crystal forest.',
    species: 'snow_nymph',
    rarity: 'epic',
    auroraPower: 112,
    summonCost: 820,
    abilities: ['Crown Bloom', 'Forest Awakening', 'Absolute Enchantment', 'Crystal Throne', 'Eternal Garden'],
    lore: 'The Frost Queen\'s garden contains flowers that have not wilted in ten thousand years.',
    stats: { attack: 50, defense: 60, speed: 28, magic: 100, hp: 380 },
  },
  {
    id: 'boreal_colossus',
    name: 'Boreal Colossus',
    description:
      'A boreal titan nearly complete, standing taller than the clouds, anchoring a nexus axis.',
    species: 'boreal_titan',
    rarity: 'epic',
    auroraPower: 120,
    summonCost: 950,
    abilities: ['Colossus Step', 'Aurora Anchor', 'World Shake', 'Titan Will', 'Eternal Monument'],
    lore: 'When the Boreal Colossus stamps its foot, auroras ripple across the entire hemisphere.',
    stats: { attack: 100, defense: 85, speed: 5, magic: 50, hp: 600 },
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'spectral_frost_sovereign',
    name: 'Spectral Frost Sovereign',
    description:
      'The primordial frost spirit that existed before the concept of cold was defined.',
    species: 'frost_spirit',
    rarity: 'legendary',
    auroraPower: 170,
    summonCost: 3000,
    abilities: ['Absolute Domain', 'Time Freeze', 'Spectral Army', 'Eternal Frost', 'Memory Crown', 'Frost Apex'],
    lore: 'The Spectral Frost Sovereign invented the concept of cold. Before it, there was only heat.',
    stats: { attack: 120, defense: 90, speed: 50, magic: 150, hp: 800 },
  },
  {
    id: 'aurora_god_walker',
    name: 'Aurora God Walker',
    description:
      'The first aurora walker, who drew the original paths between all nexus locations.',
    species: 'aurora_walker',
    rarity: 'legendary',
    auroraPower: 165,
    summonCost: 2800,
    abilities: ['Original Path', 'Creation Walk', 'Color Infinity', 'Dimension Rend', 'Light Speed', 'Aurora Apex'],
    lore: 'The God Walker\'s first footstep created the boreal nexus. Every subsequent step created a path.',
    stats: { attack: 90, defense: 80, speed: 120, magic: 140, hp: 600 },
  },
  {
    id: 'polar_wind_emperor',
    name: 'Polar Wind Emperor',
    description:
      'The sentient core of the polar vortex itself, commanding every wind on Earth.',
    species: 'north_wind',
    rarity: 'legendary',
    auroraPower: 175,
    summonCost: 3200,
    abilities: ['Vortex Command', 'World Wind', 'Absolute Vacuum', 'Storm Genesis', 'Wind Domain', 'Polar Apex'],
    lore: 'The Polar Wind Emperor breathes once per year. Each breath is the winter.',
    stats: { attack: 140, defense: 70, speed: 100, magic: 110, hp: 700 },
  },
  {
    id: 'omega_ice_phoenix',
    name: 'Omega Ice Phoenix',
    description:
      'The final ice phoenix, whose death and rebirth cycle powers the aurora itself.',
    species: 'ice_phoenix',
    rarity: 'legendary',
    auroraPower: 180,
    summonCost: 3500,
    abilities: ['Cold Supernova', 'Infinite Rebirth', 'Eternal Flame', 'Phoenix Dominion', 'World Freeze', 'Phoenix Apex'],
    lore: 'When the Omega Phoenix dies, the auroras go dark. When it is reborn, they shine brighter than ever.',
    stats: { attack: 130, defense: 100, speed: 80, magic: 135, hp: 900 },
  },
  {
    id: 'primordial_ice_dragon',
    name: 'Primordial Ice Dragon',
    description:
      'The dragon from whose scales the first permafrost was formed. It encircles the world.',
    species: 'permafrost_dragon',
    rarity: 'legendary',
    auroraPower: 185,
    summonCost: 3800,
    abilities: ['World Devour', 'Absolute Nitrogen', 'Glacier Creation', 'Dragon Reality', 'Permafrost Domain', 'Dragon Apex'],
    lore: 'The Primordial Dragon\'s heartbeat causes the tides. Its breathing causes the seasons.',
    stats: { attack: 160, defense: 120, speed: 40, magic: 100, hp: 1200 },
  },
  {
    id: 'eternal_snow_matriarch',
    name: 'Eternal Snow Matriarch',
    description:
      'The first snow nymph, from whose tears every snowflake in existence was born.',
    species: 'snow_nymph',
    rarity: 'legendary',
    auroraPower: 168,
    summonCost: 2900,
    abilities: ['Snow Creation', 'Crystal World', 'Eternal Bloom', 'Nature Dominion', 'Frost Perfection', 'Nymph Apex'],
    lore: 'Every snowflake is a tiny portrait of the Matriarch, and no two are alike because she is infinitely beautiful.',
    stats: { attack: 70, defense: 90, speed: 40, magic: 160, hp: 750 },
  },
  {
    id: 'world_anchor_titan',
    name: 'World Anchor Titan',
    description:
      'The largest boreal titan, whose body IS the boreal nexus — every path, every crossroads, every convergence.',
    species: 'boreal_titan',
    rarity: 'legendary',
    auroraPower: 190,
    summonCost: 4000,
    abilities: ['World Anchor', 'Nexus Creation', 'Reality Foundation', 'Aurora Engine', 'Eternal Monument', 'Titan Apex'],
    lore: 'The World Anchor Titan does not stand on the earth. The earth stands on it.',
    stats: { attack: 170, defense: 150, speed: 2, magic: 120, hp: 1500 },
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: BN_NEXUSES — 8 Nexus Locations
// ═══════════════════════════════════════════════════════════════════

export const BN_NEXUSES: readonly BNNexusDef[] = [
  {
    id: 'glacial_convergence',
    name: 'Glacial Convergence',
    description:
      'The outermost nexus point where three great glaciers meet, their ice walls rising like cathedral arches. The Glacial Convergence is the first stop for any traveler entering the boreal realm, marked by a massive ice gate carved with aurora runes that glow green when the nexus is active. Frost spirits gather here in the thousands, their whispers harmonizing into an ethereal chorus.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['Basic entity summoning', 'Aurora shard gathering', 'Frost spirit commune'],
    element: 'frost_spirit',
  },
  {
    id: 'aurora_crossing',
    name: 'Aurora Crossing',
    description:
      'A vast open plateau where seven aurora paths intersect overhead, creating a permanent dome of shifting green and blue light. The Aurora Crossing is the primary hub of the boreal nexus, where aurora walkers converge to share information and trade aurora-infused materials. The ground here is made of compressed aurora light, soft and warm despite the freezing temperatures.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['Aurora walker enhancement', 'Path network access', 'Color spectrum harvesting'],
    element: 'aurora_walker',
  },
  {
    id: 'wind_gate',
    name: 'Wind Gate',
    description:
      'A natural mountain pass shaped by the north wind over millennia into a perfect arch. The Wind Gate channels all polar air currents through a single narrow opening, creating wind speeds that can strip bark from trees. North winds congregate here, their collective consciousness forming a temporary intelligence that guards the pass.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['Wind energy harvesting', 'Speed enhancement', 'Atmospheric control'],
    element: 'north_wind',
  },
  {
    id: 'phoenix_peak',
    name: 'Phoenix Peak',
    description:
      'A volcanic mountain capped with eternal ice, where ice phoenixes nest in the caldera. The paradox of fire and ice creates a perpetual aurora above the peak, visible for hundreds of miles. The Phoenix Peak is the only place in the boreal realm where cold fire burns openly, and phoenix eggs can be found in the frozen lava tubes.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['Phoenix summoning bonus', 'Cold fire access', 'Rebirth energy harvest'],
    element: 'ice_phoenix',
  },
  {
    id: 'dragon_permafrost',
    name: 'Dragon Permafrost',
    description:
      'An underground chamber system carved by permafrost dragons over eons, where the ice glows with violet aurora light from embedded crystals. The Dragon Permafrost contains the deepest tunnels in the nexus, some extending miles below the surface. Ancient dragon runes line every corridor, and the temperature here is so cold that even thoughts freeze.',
    minLevel: 20,
    unlockCost: 2000,
    bonuses: ['Dragon tunnel access', 'Permafrost ore mining', 'Underground defense bonus'],
    element: 'permafrost_dragon',
  },
  {
    id: 'nymph_garden',
    name: 'Nymph Garden',
    description:
      'A vast frozen botanical garden tended by snow nymphs, where ice flowers bloom in impossible colors and crystal trees grow to impossible heights. The Nymph Garden is the most beautiful location in the boreal nexus, a place of serene beauty where even enemies lay down their weapons. The air here smells of frozen roses and ozone.',
    minLevel: 25,
    unlockCost: 3000,
    bonuses: ['Material production bonus', 'Enchantment speed boost', 'Crystal flower harvest'],
    element: 'snow_nymph',
  },
  {
    id: 'titan_forge',
    name: 'Titan Forge',
    description:
      'A massive forge built inside the body of a dormant boreal titan, where aurora energy is refined into usable power. The Titan Forge is the industrial heart of the boreal nexus, where weapons, tools, and artifacts are crafted from aurora-infused materials. The forge fires burn with golden cold light, hot enough to shape even the hardest ice.',
    minLevel: 30,
    unlockCost: 5000,
    bonuses: ['Artifact forging', 'Aurora energy refinement', 'Structure cost reduction'],
    element: 'boreal_titan',
  },
  {
    id: 'polar_zenith',
    name: 'Polar Zenith',
    description:
      'The exact center of the boreal nexus, located at the magnetic north pole where all aurora paths converge into a single blinding point of light. The Polar Zenith is the most sacred and most dangerous location in the boreal realm. Standing here, one can see every nexus location simultaneously and hear the combined voice of every entity ever summoned.',
    minLevel: 40,
    unlockCost: 10000,
    bonuses: ['Omniscient nexus awareness', 'Legendary material access', 'Reality manipulation'],
    element: 'aurora_walker',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: BN_MATERIALS — 30 Ice/Aurora Materials
// ═══════════════════════════════════════════════════════════════════

export const BN_MATERIALS: readonly BNMaterialDef[] = [
  { id: 'aurora_shard', name: 'Aurora Shard', description: 'A crystalline fragment of solidified aurora light, shimmering with green and blue hues.', rarity: 'common', source: 'Aurora Crossing', value: 5, category: 'aurora' },
  { id: 'frost_dust', name: 'Frost Dust', description: 'Fine particles of frozen moisture that sparkle in aurora light.', rarity: 'common', source: 'Glacial Convergence', value: 3, category: 'frost' },
  { id: 'ice_pebble', name: 'Ice Pebble', description: 'A smooth stone of clear ice worn round by centuries of wind.', rarity: 'common', source: 'Wind Gate', value: 2, category: 'frost' },
  { id: 'snow_crystal', name: 'Snow Crystal', description: 'A perfectly formed snowflake preserved in eternal stasis.', rarity: 'common', source: 'Nymph Garden', value: 4, category: 'crystal' },
  { id: 'wind_essence', name: 'Wind Essence', description: 'Bottled north wind that hums with kinetic energy.', rarity: 'common', source: 'Wind Gate', value: 4, category: 'wind' },
  { id: 'nexus_dust', name: 'Nexus Dust', description: 'Residue left behind when aurora paths are walked by entities.', rarity: 'common', source: 'All nexus locations', value: 3, category: 'nexus' },
  { id: 'north_wind_essence', name: 'North Wind Essence', description: 'Concentrated polar wind energy captured during a gale.', rarity: 'uncommon', source: 'Wind Gate', value: 22, category: 'wind' },
  { id: 'permafrost_crystal', name: 'Permafrost Crystal', description: 'A crystal grown in permafrost over thousands of years.', rarity: 'uncommon', source: 'Dragon Permafrost', value: 25, category: 'crystal' },
  { id: 'aurora_silk', name: 'Aurora Silk', description: 'Luminescent threads harvested from aurora walker trails.', rarity: 'uncommon', source: 'Aurora Crossing', value: 20, category: 'aurora' },
  { id: 'frost_ore', name: 'Frost Ore', description: 'Metallic ore infused with frost energy, cold to the touch.', rarity: 'uncommon', source: 'Titan Forge', value: 24, category: 'frost' },
  { id: 'phoenix_down', name: 'Phoenix Down', description: 'A feather shed by an ice phoenix, radiating cold fire.', rarity: 'uncommon', source: 'Phoenix Peak', value: 28, category: 'aurora' },
  { id: 'nymph_pollen', name: 'Nymph Pollen', description: 'Sparkling pollen from ice flowers in the Nymph Garden.', rarity: 'uncommon', source: 'Nymph Garden', value: 18, category: 'frost' },
  { id: 'aurora_gem', name: 'Aurora Gem', description: 'A large gemstone infused with aurora energy, pulsing with light.', rarity: 'rare', source: 'Aurora Crossing', value: 75, category: 'aurora' },
  { id: 'glacier_heart', name: 'Glacier Heart', description: 'The core of an ancient glacier, still beating with cold energy.', rarity: 'rare', source: 'Glacial Convergence', value: 80, category: 'frost' },
  { id: 'dragon_scale', name: 'Dragon Scale', description: 'A scale shed by a permafrost dragon, nearly indestructible.', rarity: 'rare', source: 'Dragon Permafrost', value: 85, category: 'crystal' },
  { id: 'phoenix_ash', name: 'Phoenix Ash', description: 'Ash from an ice phoenix rebirth, containing concentrated cold fire.', rarity: 'rare', source: 'Phoenix Peak', value: 78, category: 'aurora' },
  { id: 'titan_bone', name: 'Titan Bone', description: 'A fragment of boreal titan bone, impossibly dense and cold.', rarity: 'rare', source: 'Titan Forge', value: 90, category: 'nexus' },
  { id: 'frost_diamond', name: 'Frost Diamond', description: 'A diamond formed under permafrost pressure, harder than steel.', rarity: 'rare', source: 'Dragon Permafrost', value: 70, category: 'crystal' },
  { id: 'polar_crown_shard', name: 'Polar Crown Shard', description: 'A fragment of the aurora crown that hovers above the Polar Zenith.', rarity: 'epic', source: 'Polar Zenith', value: 220, category: 'aurora' },
  { id: 'eternal_frost_ingot', name: 'Eternal Frost Ingot', description: 'Refined permafrost ore that will never thaw under any conditions.', rarity: 'epic', source: 'Titan Forge', value: 250, category: 'frost' },
  { id: 'dragon_heart_crystal', name: 'Dragon Heart Crystal', description: 'A crystal formed around a permafrost dragon heart, pulsing with violet light.', rarity: 'epic', source: 'Dragon Permafrost', value: 240, category: 'crystal' },
  { id: 'aurora_pearl', name: 'Aurora Pearl', description: 'A luminous pearl formed when aurora light solidifies in a frozen oyster.', rarity: 'epic', source: 'Nymph Garden', value: 210, category: 'aurora' },
  { id: 'wind_god_breath', name: 'Wind God Breath', description: 'Captured breath of the north wind, a potent magical reagent.', rarity: 'epic', source: 'Wind Gate', value: 200, category: 'wind' },
  { id: 'phoenix_crown_gem', name: 'Phoenix Crown Gem', description: 'A gem from the crown of a legendary ice phoenix.', rarity: 'epic', source: 'Phoenix Peak', value: 230, category: 'aurora' },
  { id: 'cosmic_aurora_core', name: 'Cosmic Aurora Core', description: 'Aurora light from beyond the atmosphere, containing stellar energy.', rarity: 'legendary', source: 'Polar Zenith', value: 600, category: 'aurora' },
  { id: 'world_ice_seed', name: 'World Ice Seed', description: 'A seed that grows into a glacier when planted in permafrost.', rarity: 'legendary', source: 'Glacial Convergence', value: 700, category: 'frost' },
  { id: 'dragon_soul_crystal', name: 'Dragon Soul Crystal', description: 'The crystallized soul of an ancient permafrost dragon.', rarity: 'legendary', source: 'Dragon Permafrost', value: 800, category: 'crystal' },
  { id: 'zenith_star_shard', name: 'Zenith Star Shard', description: 'A shard of the star that hovers above the Polar Zenith.', rarity: 'legendary', source: 'Polar Zenith', value: 900, category: 'nexus' },
  { id: 'phoenix_eternal_flame', name: 'Phoenix Eternal Flame', description: 'Cold fire that burns forever, the essence of immortality.', rarity: 'legendary', source: 'Phoenix Peak', value: 750, category: 'aurora' },
  { id: 'boreal_nexus_key', name: 'Boreal Nexus Key', description: 'The key that unlocks the true power of every nexus location.', rarity: 'legendary', source: 'Polar Zenith', value: 1000, category: 'nexus' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: BN_STRUCTURES — 25 Nexus Structures
// ═══════════════════════════════════════════════════════════════════

export const BN_STRUCTURES: readonly BNStructureDef[] = [
  { id: 'aurora_gate', name: 'Aurora Gate', description: 'A gateway made of solidified aurora light that connects nexus locations.', baseCost: 50, costMultiplier: 1.5, maxLevel: 10, category: 'defense' },
  { id: 'ice_bridge', name: 'Ice Bridge', description: 'A crystalline bridge spanning frozen chasms between nexus paths.', baseCost: 80, costMultiplier: 1.4, maxLevel: 8, category: 'defense' },
  { id: 'boreal_tower', name: 'Boreal Tower', description: 'A tower of aurora-infused ice that amplifies signal across the nexus.', baseCost: 200, costMultiplier: 1.8, maxLevel: 10, category: 'enchantment' },
  { id: 'frost_quarry', name: 'Frost Quarry', description: 'A mining operation extracting permafrost crystals and frost ore.', baseCost: 100, costMultiplier: 1.4, maxLevel: 12, category: 'production' },
  { id: 'aurora_forge', name: 'Aurora Forge', description: 'A forge powered by aurora energy that shapes frozen materials.', baseCost: 150, costMultiplier: 1.7, maxLevel: 10, category: 'production' },
  { id: 'nexus_archive', name: 'Nexus Archive', description: 'A library storing knowledge in aurora crystals readable by touch.', baseCost: 120, costMultiplier: 1.5, maxLevel: 8, category: 'storage' },
  { id: 'permafrost_vault', name: 'Permafrost Vault', description: 'A secure vault carved into permafrost for preserving rare items.', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, category: 'storage' },
  { id: 'aurora_beacon', name: 'Aurora Beacon', description: 'A beacon that projects aurora light to mark nexus boundaries.', baseCost: 250, costMultiplier: 2.0, maxLevel: 8, category: 'defense' },
  { id: 'crystal_greenhouse', name: 'Crystal Greenhouse', description: 'A greenhouse cultivating frost-resistant crystal plants.', baseCost: 160, costMultiplier: 1.5, maxLevel: 10, category: 'production' },
  { id: 'wind_channel', name: 'Wind Channel', description: 'A carved channel directing north wind for energy generation.', baseCost: 220, costMultiplier: 1.7, maxLevel: 6, category: 'enchantment' },
  { id: 'phoenix_nest', name: 'Phoenix Nest', description: 'A nesting platform for ice phoenixes, providing cold fire energy.', baseCost: 300, costMultiplier: 1.9, maxLevel: 6, category: 'summoning' },
  { id: 'dragon_gate', name: 'Dragon Gate', description: 'An entrance to the permafrost dragon tunnel network.', baseCost: 200, costMultiplier: 1.7, maxLevel: 6, category: 'defense' },
  { id: 'nymph_sanctuary', name: 'Nymph Sanctuary', description: 'A protected grove where snow nymphs rest and regenerate.', baseCost: 140, costMultiplier: 1.5, maxLevel: 8, category: 'production' },
  { id: 'titan_pedestal', name: 'Titan Pedestal', description: 'A platform channeling boreal titan power into the nexus.', baseCost: 280, costMultiplier: 1.8, maxLevel: 8, category: 'enchantment' },
  { id: 'frost_labyrinth', name: 'Frost Labyrinth', description: 'A maze of ice walls that confuses and traps intruders.', baseCost: 260, costMultiplier: 1.8, maxLevel: 5, category: 'defense' },
  { id: 'aurora_observatory', name: 'Aurora Observatory', description: 'An observation platform monitoring aurora activity for predictions.', baseCost: 350, costMultiplier: 2.0, maxLevel: 4, category: 'enchantment' },
  { id: 'ice_infirmary', name: 'Ice Infirmary', description: 'A healing facility using cryogenic therapy to restore entities.', baseCost: 140, costMultiplier: 1.5, maxLevel: 8, category: 'production' },
  { id: 'nexus_armory', name: 'Nexus Armory', description: 'An armory storing frost weapons and aurora-infused armor.', baseCost: 320, costMultiplier: 1.9, maxLevel: 8, category: 'storage' },
  { id: 'glacier_dock', name: 'Glacier Dock', description: 'A docking platform on a frozen lake for ice transport.', baseCost: 110, costMultiplier: 1.4, maxLevel: 6, category: 'production' },
  { id: 'cryo_chamber', name: 'Cryo Chamber', description: 'A deep-freeze chamber for storing legendary artifacts.', baseCost: 450, costMultiplier: 2.0, maxLevel: 5, category: 'storage' },
  { id: 'aurora_panopticon', name: 'Aurora Panopticon', description: 'A watchtower granting visibility across all claimed nexus locations.', baseCost: 380, costMultiplier: 2.1, maxLevel: 4, category: 'enchantment' },
  { id: 'frost_barracks', name: 'Frost Barracks', description: 'Housing for entity forces stationed at the nexus.', baseCost: 100, costMultiplier: 1.6, maxLevel: 8, category: 'summoning' },
  { id: 'nexus_core_relay', name: 'Nexus Core Relay', description: 'A relay station amplifying power flow between nexus points.', baseCost: 500, costMultiplier: 2.5, maxLevel: 4, category: 'enchantment' },
  { id: 'eternal_guard_post', name: 'Eternal Guard Post', description: 'A permanent guard station powered by ambient aurora energy.', baseCost: 200, costMultiplier: 1.6, maxLevel: 10, category: 'defense' },
  { id: 'polar_monument', name: 'Polar Monument', description: 'A monument commemorating boreal achievements with realm-wide bonuses.', baseCost: 600, costMultiplier: 3.0, maxLevel: 3, category: 'enchantment' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: BN_ABILITIES — 22 Aurora Abilities
// ═══════════════════════════════════════════════════════════════════

export const BN_ABILITIES: readonly BNAbilityDef[] = [
  { id: 'aurora_beam', name: 'Aurora Beam', description: 'Fire a concentrated beam of aurora light that damages and illuminates enemies.', cooldown: 3, power: 20, element: 'aurora_walker', energyCost: 5 },
  { id: 'frost_nova', name: 'Frost Nova', description: 'Release a burst of frost energy in all directions, freezing nearby targets.', cooldown: 8, power: 35, element: 'frost_spirit', energyCost: 10 },
  { id: 'north_wind_gust', name: 'North Wind Gust', description: 'Summon a powerful gust of arctic wind that knocks back and chills enemies.', cooldown: 6, power: 25, element: 'north_wind', energyCost: 8 },
  { id: 'cold_flame_burst', name: 'Cold Flame Burst', description: 'Erupt with cold fire that freezes everything it touches.', cooldown: 10, power: 40, element: 'ice_phoenix', energyCost: 12 },
  { id: 'dragon_frost_breath', name: 'Dragon Frost Breath', description: 'Exhale a stream of liquid nitrogen that instantly freezes targets.', cooldown: 12, power: 45, element: 'permafrost_dragon', energyCost: 14 },
  { id: 'crystal_bloom', name: 'Crystal Bloom', description: 'Cause ice crystals to grow rapidly, creating barriers and traps.', cooldown: 7, power: 30, element: 'snow_nymph', energyCost: 9 },
  { id: 'titan_stomp', name: 'Titan Stomp', description: 'Stamp the ground, creating a shockwave of aurora energy.', cooldown: 15, power: 55, element: 'boreal_titan', energyCost: 18 },
  { id: 'spectral_freeze', name: 'Spectral Freeze', description: 'Phase into the spectral plane and freeze targets from within.', cooldown: 10, power: 38, element: 'frost_spirit', energyCost: 11 },
  { id: 'aurora_cloak', name: 'Aurora Cloak', description: 'Wrap yourself in aurora light, becoming invisible and intangible.', cooldown: 14, power: 28, element: 'aurora_walker', energyCost: 12 },
  { id: 'wind_shear', name: 'Wind Shear', description: 'Create razor-thin air currents that slice through solid ice.', cooldown: 5, power: 22, element: 'north_wind', energyCost: 7 },
  { id: 'phoenix_rebirth', name: 'Phoenix Rebirth', description: 'Die and be reborn at full power with enhanced cold fire.', cooldown: 30, power: 70, element: 'ice_phoenix', energyCost: 25 },
  { id: 'glacier_surge', name: 'Glacier Surge', description: 'Cause a glacier to advance rapidly, crushing everything in its path.', cooldown: 20, power: 60, element: 'permafrost_dragon', energyCost: 20 },
  { id: 'ice_maze', name: 'Ice Maze', description: 'Grow an elaborate maze of ice walls that confuses and traps enemies.', cooldown: 16, power: 42, element: 'snow_nymph', energyCost: 15 },
  { id: 'aurora_storm', name: 'Aurora Storm', description: 'Summon a massive aurora storm that damages and disorients all enemies.', cooldown: 18, power: 58, element: 'aurora_walker', energyCost: 18 },
  { id: 'absolute_cold', name: 'Absolute Cold', description: 'Drop the temperature to absolute zero in a targeted area.', cooldown: 22, power: 65, element: 'frost_spirit', energyCost: 22 },
  { id: 'wind_vortex', name: 'Wind Vortex', description: 'Create a spinning vortex of wind that lifts and throws enemies.', cooldown: 12, power: 48, element: 'north_wind', energyCost: 14 },
  { id: 'cold_inferno', name: 'Cold Inferno', description: 'Unleash a massive cold fire explosion that freezes a wide area.', cooldown: 25, power: 75, element: 'ice_phoenix', energyCost: 24 },
  { id: 'dragon_rage', name: 'Dragon Rage', description: 'Enter a berserk state where frost breath power triples.', cooldown: 20, power: 62, element: 'permafrost_dragon', energyCost: 20 },
  { id: 'nexus_warp', name: 'Nexus Warp', description: 'Teleport instantly to any claimed nexus location.', cooldown: 30, power: 45, element: 'aurora_walker', energyCost: 20 },
  { id: 'titan_awakening', name: 'Titan Awakening', description: 'Awaken dormant titan power, doubling all stats temporarily.', cooldown: 60, power: 90, element: 'boreal_titan', energyCost: 40 },
  { id: 'frost_requiem', name: 'Frost Requiem', description: 'Sing a song of eternal winter that gradually freezes the entire battlefield.', cooldown: 40, power: 80, element: 'frost_spirit', energyCost: 30 },
  { id: 'boreal_domination', name: 'Boreal Domination', description: 'Assert control over the boreal nexus, gaining power from all connected locations.', cooldown: 60, power: 100, element: 'boreal_titan', energyCost: 50 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: BN_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const BN_ACHIEVEMENTS: readonly BNAchievementDef[] = [
  { id: 'bn_first_summon', name: 'First Light', description: 'Summon your first aurora entity.', condition: 'Summon 1 entity', reward: '+50 aurora power', icon: '✦' },
  { id: 'bn_five_summons', name: 'Aurora Collection', description: 'Summon 5 different entities.', condition: 'Summon 5 unique entities', reward: '+200 aurora power', icon: '❄' },
  { id: 'bn_ten_summons', name: 'Boreal Legion', description: 'Summon 10 different entities.', condition: 'Summon 10 unique entities', reward: '+500 aurora power', icon: '✧' },
  { id: 'bn_first_nexus', name: 'Nexus Claimant', description: 'Claim your first nexus location.', condition: 'Claim 1 nexus', reward: '+100 frost energy', icon: '◆' },
  { id: 'bn_four_nexuses', name: 'Quad-Nexus Lord', description: 'Claim 4 different nexus locations.', condition: 'Claim 4 nexuses', reward: '+300 frost energy', icon: '♛' },
  { id: 'bn_all_nexuses', name: 'Supreme Convergence', description: 'Claim all 8 nexus locations.', condition: 'Claim all nexuses', reward: '+1000 aurora power', icon: '✦' },
  { id: 'bn_first_structure', name: 'Ice Architect', description: 'Build your first nexus structure.', condition: 'Build 1 structure', reward: '+100 gold', icon: '🏗' },
  { id: 'bn_ten_structures', name: 'Boreal Engineer', description: 'Build 10 structures.', condition: 'Build 10 structures', reward: '+500 gold', icon: '🏗' },
  { id: 'bn_first_strike', name: 'Aurora Striker', description: 'Perform your first aurora strike.', condition: 'Execute 1 aurora strike', reward: '+150 aurora power', icon: '⚡' },
  { id: 'bn_hundred_strikes', name: 'Boreal Storm', description: 'Perform 100 aurora strikes.', condition: 'Execute 100 strikes', reward: '+2000 aurora power', icon: '✧' },
  { id: 'bn_first_artifact', name: 'Relic Finder', description: 'Activate your first artifact.', condition: 'Activate 1 artifact', reward: '+200 gold', icon: '💎' },
  { id: 'bn_five_artifacts', name: 'Artifact Collector', description: 'Activate 5 artifacts.', condition: 'Activate 5 artifacts', reward: '+1000 gold', icon: '♛' },
  { id: 'bn_legendary_entity', name: 'Legendary Aurora', description: 'Summon a legendary entity.', condition: 'Summon 1 legendary entity', reward: '+3000 aurora power', icon: '⭐' },
  { id: 'bn_max_level', name: 'Eternal Boreal', description: 'Reach maximum level.', condition: 'Reach level 50', reward: '+5000 aurora power', icon: '✦' },
  { id: 'bn_all_species', name: 'Complete Convergence', description: 'Have at least one entity of each species.', condition: 'Own 1 of each species', reward: '+1500 aurora power', icon: '◆' },
  { id: 'bn_thousand_power', name: 'Aurora Sovereign', description: 'Accumulate 1000 total aurora power.', condition: 'Reach 1000 aurora power', reward: 'Title: Aurora Sovereign', icon: '♛' },
  { id: 'bn_ten_thousand_energy', name: 'Boreal Emperor', description: 'Accumulate 10000 total frost energy.', condition: 'Reach 10000 energy', reward: '+5000 gold', icon: '⚡' },
  { id: 'bn_survive_event', name: 'Nexus Survivor', description: 'Survive a nexus event.', condition: 'Survive 1 event', reward: '+500 aurora power', icon: '✧' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: BN_TITLES — 8 Titles (Frost Wanderer → Boreal Emperor)
// ═══════════════════════════════════════════════════════════════════

export const BN_TITLES: readonly BNTitleDef[] = [
  { id: 'frost_wanderer', name: 'Frost Wanderer', description: 'A beginner exploring the frozen crossroads of the boreal nexus.', requiredLevel: 1, requiredNexuses: 0 },
  { id: 'aurora_seeker', name: 'Aurora Seeker', description: 'One who has begun following the aurora paths between nexus locations.', requiredLevel: 5, requiredNexuses: 1 },
  { id: 'north_wind_ranger', name: 'North Wind Ranger', description: 'A seasoned traveler who rides the north wind across the polar landscape.', requiredLevel: 10, requiredNexuses: 2 },
  { id: 'glacial_knight', name: 'Glacial Knight', description: 'A warrior who has proven their worth defending the nexus crossroads.', requiredLevel: 15, requiredNexuses: 3 },
  { id: 'aurora_commander', name: 'Aurora Commander', description: 'A leader who commands aurora walkers and controls nexus pathways.', requiredLevel: 20, requiredNexuses: 4 },
  { id: 'permafrost_lord', name: 'Permafrost Lord', description: 'A ruler who has claimed the ancient permafrost chambers as their domain.', requiredLevel: 30, requiredNexuses: 5 },
  { id: 'boreal_sovereign', name: 'Boreal Sovereign', description: 'A monarch who rules over the frozen crossroads with absolute authority.', requiredLevel: 40, requiredNexuses: 6 },
  { id: 'boreal_emperor', name: 'Boreal Emperor', description: 'The supreme ruler of the boreal nexus, master of all aurora and ice.', requiredLevel: 50, requiredNexuses: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: BN_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const BN_ARTIFACTS: readonly BNArtifactDef[] = [
  { id: 'aurora_compass', name: 'Aurora Compass', description: 'A compass that points toward the nearest nexus location using aurora fields.', rarity: 'common', powerBonus: 10, specialAbility: '+5% entity aurora power', forgeCost: 100 },
  { id: 'frost_lantern', name: 'Frost Lantern', description: 'A lantern that burns with cold fire, illuminating hidden aurora paths.', rarity: 'common', powerBonus: 8, specialAbility: '+3% pathfinding range', forgeCost: 80 },
  { id: 'wind_charm', name: 'Wind Charm', description: 'A charm that whistles with the north wind, granting swiftness.', rarity: 'uncommon', powerBonus: 25, specialAbility: '+10% entity speed', forgeCost: 300 },
  { id: 'aurora_blade', name: 'Aurora Blade', description: 'A sword forged from solidified aurora light, cutting through dimensions.', rarity: 'uncommon', powerBonus: 30, specialAbility: '+15% attack power', forgeCost: 350 },
  { id: 'frost_crown_fragment', name: 'Frost Crown Fragment', description: 'A shard of an ancient crown, pulsing with boreal authority.', rarity: 'uncommon', powerBonus: 28, specialAbility: '+12% nexus defense bonus', forgeCost: 320 },
  { id: 'dragon_scale_shield', name: 'Dragon Scale Shield', description: 'A shield made from permafrost dragon scales, nearly indestructible.', rarity: 'rare', powerBonus: 50, specialAbility: '+25% structure defense', forgeCost: 800 },
  { id: 'phoenix_talisman', name: 'Phoenix Talisman', description: 'A talisman containing a spark of eternal cold fire.', rarity: 'rare', powerBonus: 45, specialAbility: '+20% entity resilience', forgeCost: 750 },
  { id: 'aurora_orb', name: 'Aurora Orb', description: 'An orb that captures aurora light and converts it to usable energy.', rarity: 'rare', powerBonus: 55, specialAbility: '+10% energy regeneration', forgeCost: 900 },
  { id: 'north_wind_ring', name: 'North Wind Ring', description: 'A ring that allows the wearer to communicate with the north wind.', rarity: 'rare', powerBonus: 48, specialAbility: '+15% evasion in storms', forgeCost: 820 },
  { id: 'boreal_scepter', name: 'Boreal Scepter', description: 'A scepter of ice and aurora that commands frost spirits.', rarity: 'epic', powerBonus: 80, specialAbility: '+30% frost spirit power', forgeCost: 2000 },
  { id: 'aurora_monarch_crown', name: 'Aurora Monarch Crown', description: 'A crown of living aurora light that grants dominion over paths.', rarity: 'epic', powerBonus: 90, specialAbility: '+25% all damage', forgeCost: 2500 },
  { id: 'permafrost_key', name: 'Permafrost Key', description: 'A key that unlocks hidden chambers in any permafrost wall.', rarity: 'epic', powerBonus: 85, specialAbility: '+20% resource production', forgeCost: 2200 },
  { id: 'polar_star_amulet', name: 'Polar Star Amulet', description: 'An amulet containing the light of the polar star itself.', rarity: 'legendary', powerBonus: 150, specialAbility: '+50% all aurora abilities', forgeCost: 6000 },
  { id: 'world_anchor_gem', name: 'World Anchor Gem', description: 'A gem from the heart of a boreal titan, anchoring reality itself.', rarity: 'legendary', powerBonus: 160, specialAbility: '+40% defense and hp', forgeCost: 7000 },
  { id: 'nexus_core_shard', name: 'Nexus Core Shard', description: 'A shard of the original nexus core, granting access to its full power.', rarity: 'legendary', powerBonus: 200, specialAbility: 'Unlock hidden nexus bonuses', forgeCost: 10000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: BN_EVENTS — 12 Nexus Events
// ═══════════════════════════════════════════════════════════════════

export const BN_EVENTS: readonly BNEventDef[] = [
  { id: 'aurora_surge', name: 'Aurora Surge', description: 'An exceptionally powerful aurora floods all nexus paths with energy.', severity: 1, duration: 180, effects: ['Double aurora drops', 'Enhanced entity power'], element: 'aurora_walker' },
  { id: 'permafrost_thaw', name: 'Permafrost Thaw', description: 'A sudden warming threatens to destabilize nexus foundations.', severity: 4, duration: 300, effects: ['Reduced defense', 'Entity fatigue'], element: 'permafrost_dragon' },
  { id: 'dragon_migration', name: 'Dragon Migration', description: 'Permafrost dragons emerge from tunnels in massive numbers.', severity: 3, duration: 240, effects: ['Bonus dragon materials', 'Tunnel network expansion'], element: 'permafrost_dragon' },
  { id: 'wind_storm', name: 'Polar Wind Storm', description: 'The north wind rages across all nexus locations simultaneously.', severity: 3, duration: 200, effects: ['Speed enhancement', 'Wind material surge'], element: 'north_wind' },
  { id: 'phoenix_rebirth_cycle', name: 'Phoenix Rebirth Cycle', description: 'Multiple ice phoenixes die and are reborn simultaneously.', severity: 1, duration: 150, effects: ['Cold fire bonus', 'Phoenix feather shower'], element: 'ice_phoenix' },
  { id: 'nexus_convergence', name: 'Nexus Convergence', description: 'All nexus points align, creating temporary pathways between all locations.', severity: 2, duration: 360, effects: ['All nexus bonuses active', 'Travel time zero'], element: 'aurora_walker' },
  { id: 'frost_spirit_awakening', name: 'Frost Spirit Awakening', description: 'Dormant frost spirits across the realm awaken simultaneously.', severity: 1, duration: 120, effects: ['Free entity summoning', 'Spirit material bonus'], element: 'frost_spirit' },
  { id: 'nymph_bloom_festival', name: 'Nymph Bloom Festival', description: 'All ice flowers in the nexus bloom at once, a breathtaking spectacle.', severity: 1, duration: 480, effects: ['Double material production', 'Enchantment bonus'], element: 'snow_nymph' },
  { id: 'titan_tremor', name: 'Titan Tremor', description: 'A boreal titan shifts in its sleep, causing massive aurora disturbances.', severity: 5, duration: 200, effects: ['Structure damage', 'Rare material exposure'], element: 'boreal_titan' },
  { id: 'polar_night_descent', name: 'Polar Night Descent', description: 'The polar night deepens, strengthening all frost entities.', severity: 1, duration: 100, effects: ['Entity power boost', 'Frost energy surge'], element: 'frost_spirit' },
  { id: 'aurora_corona', name: 'Aurora Corona', description: 'The aurora forms a perfect corona around the polar zenith.', severity: 2, duration: 600, effects: ['Diplomacy rewards', 'Title advancement chance'], element: 'aurora_walker' },
  { id: 'ice_age_echo', name: 'Ice Age Echo', description: 'An echo of a primordial ice age reverberates through the nexus.', severity: 4, duration: 400, effects: ['Massive aurora power gain', 'Ancient material discovery'], element: 'boreal_titan' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: LOOKUP MAPS — Pre-built indexes for fast access
// ═══════════════════════════════════════════════════════════════════

export const BN_ENTITY_MAP: ReadonlyMap<string, BNEntityDef> = new Map(
  BN_ENTITIES.map((e) => [e.id, e])
)

export const BN_NEXUS_MAP: ReadonlyMap<string, BNNexusDef> = new Map(
  BN_NEXUSES.map((n) => [n.id, n])
)

export const BN_MATERIAL_MAP: ReadonlyMap<string, BNMaterialDef> = new Map(
  BN_MATERIALS.map((m) => [m.id, m])
)

export const BN_STRUCTURE_MAP: ReadonlyMap<string, BNStructureDef> = new Map(
  BN_STRUCTURES.map((s) => [s.id, s])
)

export const BN_ABILITY_MAP: ReadonlyMap<string, BNAbilityDef> = new Map(
  BN_ABILITIES.map((a) => [a.id, a])
)

export const BN_ARTIFACT_MAP: ReadonlyMap<string, BNArtifactDef> = new Map(
  BN_ARTIFACTS.map((a) => [a.id, a])
)

export const BN_EVENT_MAP: ReadonlyMap<string, BNEventDef> = new Map(
  BN_EVENTS.map((e) => [e.id, e])
)

export const BN_ACHIEVEMENT_MAP: ReadonlyMap<string, BNAchievementDef> = new Map(
  BN_ACHIEVEMENTS.map((a) => [a.id, a])
)

export const BN_TITLE_MAP: ReadonlyMap<string, BNTitleDef> = new Map(
  BN_TITLES.map((t) => [t.id, t])
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: RARITY-BASED ENTITY LISTS
// ═══════════════════════════════════════════════════════════════════

export const BN_ENTITIES_BY_RARITY: Record<BNRarity, readonly BNEntityDef[]> = {
  common: BN_ENTITIES.filter((e) => e.rarity === 'common'),
  uncommon: BN_ENTITIES.filter((e) => e.rarity === 'uncommon'),
  rare: BN_ENTITIES.filter((e) => e.rarity === 'rare'),
  epic: BN_ENTITIES.filter((e) => e.rarity === 'epic'),
  legendary: BN_ENTITIES.filter((e) => e.rarity === 'legendary'),
}

export const BN_ENTITIES_BY_SPECIES: Record<BNSpecies, readonly BNEntityDef[]> = {
  frost_spirit: BN_ENTITIES.filter((e) => e.species === 'frost_spirit'),
  aurora_walker: BN_ENTITIES.filter((e) => e.species === 'aurora_walker'),
  north_wind: BN_ENTITIES.filter((e) => e.species === 'north_wind'),
  ice_phoenix: BN_ENTITIES.filter((e) => e.species === 'ice_phoenix'),
  permafrost_dragon: BN_ENTITIES.filter((e) => e.species === 'permafrost_dragon'),
  snow_nymph: BN_ENTITIES.filter((e) => e.species === 'snow_nymph'),
  boreal_titan: BN_ENTITIES.filter((e) => e.species === 'boreal_titan'),
}

export const BN_MATERIALS_BY_CATEGORY: Record<string, readonly BNMaterialDef[]> = {
  aurora: BN_MATERIALS.filter((m) => m.category === 'aurora'),
  frost: BN_MATERIALS.filter((m) => m.category === 'frost'),
  permafrost: BN_MATERIALS.filter((m) => m.category === 'permafrost'),
  crystal: BN_MATERIALS.filter((m) => m.category === 'crystal'),
  wind: BN_MATERIALS.filter((m) => m.category === 'wind'),
  nexus: BN_MATERIALS.filter((m) => m.category === 'nexus'),
}

export const BN_ARTIFACTS_BY_RARITY: Record<BNRarity, readonly BNArtifactDef[]> = {
  common: BN_ARTIFACTS.filter((a) => a.rarity === 'common'),
  uncommon: BN_ARTIFACTS.filter((a) => a.rarity === 'uncommon'),
  rare: BN_ARTIFACTS.filter((a) => a.rarity === 'rare'),
  epic: BN_ARTIFACTS.filter((a) => a.rarity === 'epic'),
  legendary: BN_ARTIFACTS.filter((a) => a.rarity === 'legendary'),
}

export const BN_STRUCTURES_BY_CATEGORY: Record<string, readonly BNStructureDef[]> = {
  defense: BN_STRUCTURES.filter((s) => s.category === 'defense'),
  production: BN_STRUCTURES.filter((s) => s.category === 'production'),
  enchantment: BN_STRUCTURES.filter((s) => s.category === 'enchantment'),
  storage: BN_STRUCTURES.filter((s) => s.category === 'storage'),
  summoning: BN_STRUCTURES.filter((s) => s.category === 'summoning'),
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ADDITIONAL UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function bnTotalEntityPower(entities: Record<string, BNEntityEntity>): number {
  return Object.values(entities).reduce((sum, e) => sum + e.power, 0)
}

export function bnTotalNexusDefense(nexuses: Record<string, { claimed: boolean; defenseBonus: number }>): number {
  return Object.values(nexuses).filter((n) => n.claimed).reduce((sum, n) => sum + n.defenseBonus, 0)
}

export function bnTotalStructureDefense(structures: Record<string, BNStructureEntity>): number {
  return Object.values(structures).filter((s) => s.built).reduce((sum) => sum + 1, 0)
}

export function bnEntitiesByRarityForState(
  entities: Record<string, BNEntityEntity>
): Record<BNRarity, BNEntityEntity[]> {
  const result: Record<BNRarity, BNEntityEntity[]> = {
    common: [],
    uncommon: [],
    rare: [],
    epic: [],
    legendary: [],
  }
  for (const entity of Object.values(entities)) {
    const def = BN_ENTITY_MAP.get(entity.entityDefId)
    if (def) {
      result[def.rarity].push(entity)
    }
  }
  return result
}

export function bnUnlockedAbilities(entities: Record<string, BNEntityEntity>): string[] {
  const abilitySet = new Set<string>()
  for (const entity of Object.values(entities)) {
    const def = BN_ENTITY_MAP.get(entity.entityDefId)
    if (def) {
      for (const ability of def.abilities) {
        abilitySet.add(ability)
      }
    }
  }
  return Array.from(abilitySet)
}

export function bnCheckAchievement(
  achievementId: string,
  state: BNStoreState
): boolean {
  switch (achievementId) {
    case 'bn_first_summon':
      return state.bnStats.totalEntitiesSummoned >= 1
    case 'bn_five_summons':
      return Object.keys(state.bnEntities).length >= 5
    case 'bn_ten_summons':
      return Object.keys(state.bnEntities).length >= 10
    case 'bn_first_nexus':
      return state.bnStats.totalNexusesClaimed >= 1
    case 'bn_four_nexuses':
      return state.bnStats.totalNexusesClaimed >= 4
    case 'bn_all_nexuses':
      return state.bnStats.totalNexusesClaimed >= 8
    case 'bn_first_structure':
      return state.bnStats.totalStructuresBuilt >= 1
    case 'bn_ten_structures':
      return state.bnStats.totalStructuresBuilt >= 10
    case 'bn_first_strike':
      return state.bnStats.totalAuroraStrikes >= 1
    case 'bn_hundred_strikes':
      return state.bnStats.totalAuroraStrikes >= 100
    case 'bn_first_artifact':
      return state.bnStats.totalArtifactsActivated >= 1
    case 'bn_five_artifacts':
      return state.bnArtifacts.length >= 5
    case 'bn_legendary_entity':
      return Object.values(state.bnEntities).some((e) => {
        const def = BN_ENTITY_MAP.get(e.entityDefId)
        return def?.rarity === 'legendary'
      })
    case 'bn_max_level':
      return state.bnLevel >= BN_MAX_LEVEL
    case 'bn_all_species': {
      const speciesSet = new Set<string>()
      for (const entity of Object.values(state.bnEntities)) {
        const def = BN_ENTITY_MAP.get(entity.entityDefId)
        if (def) speciesSet.add(def.species)
      }
      return speciesSet.size >= 7
    }
    case 'bn_thousand_power':
      return state.bnAuroraPower >= 1000
    case 'bn_ten_thousand_energy':
      return state.bnStats.totalFrostEnergyGained >= 10000
    case 'bn_survive_event':
      return state.bnStats.totalAuroraStrikes >= 5
    default:
      return false
  }
}

export function bnGetNextTitle(state: BNStoreState): BNTitleDef {
  const nexusesClaimed = Object.values(state.bnNexuses).filter((n) => n.claimed).length
  for (let i = BN_TITLES.length - 1; i >= 0; i--) {
    const title = BN_TITLES[i]
    if (state.bnLevel >= title.requiredLevel && nexusesClaimed >= title.requiredNexuses) {
      return title
    }
  }
  return BN_TITLES[0]
}

export function bnEntityPowerAtLevel(basePower: number, level: number): number {
  return Math.floor(basePower * (1 + (level - 1) * 0.15))
}

export function bnStructureCostAtLevel(structureId: string, currentLevel: number): number {
  const def = BN_STRUCTURE_MAP.get(structureId)
  if (!def) return Infinity
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

export function bnCanSummonEntity(entityId: string, state: BNStoreState): { canSummon: boolean; reason: string } {
  const def = BN_ENTITY_MAP.get(entityId)
  if (!def) return { canSummon: false, reason: 'Unknown entity' }
  const existing = Object.values(state.bnEntities).some((e) => e.entityDefId === entityId)
  if (existing) return { canSummon: false, reason: 'Already owned' }
  if (state.bnFrostEnergy < def.summonCost) return { canSummon: false, reason: 'Insufficient frost energy' }
  return { canSummon: true, reason: 'Ready' }
}

export function bnCanClaimNexus(nexusId: string, state: BNStoreState): { canClaim: boolean; reason: string } {
  const def = BN_NEXUS_MAP.get(nexusId)
  if (!def) return { canClaim: false, reason: 'Unknown nexus' }
  if (state.bnNexuses[nexusId]?.claimed) return { canClaim: false, reason: 'Already claimed' }
  if (state.bnLevel < def.minLevel) return { canClaim: false, reason: `Requires level ${def.minLevel}` }
  if (state.bnGold < def.unlockCost) return { canClaim: false, reason: 'Insufficient gold' }
  return { canClaim: true, reason: 'Ready' }
}

export function bnCanBuildStructure(structureId: string, state: BNStoreState): { canBuild: boolean; reason: string } {
  const def = BN_STRUCTURE_MAP.get(structureId)
  if (!def) return { canBuild: false, reason: 'Unknown structure' }
  const existing = state.bnStructures[structureId]
  const currentLevel = existing?.level ?? 0
  if (currentLevel >= def.maxLevel) return { canBuild: false, reason: 'Already max level' }
  const cost = bnStructureCostAtLevel(structureId, currentLevel)
  if (state.bnGold < cost) return { canBuild: false, reason: 'Insufficient gold' }
  return { canBuild: true, reason: 'Ready' }
}

export function bnCanActivateRelic(artifactId: string, state: BNStoreState): { canActivate: boolean; reason: string } {
  const def = BN_ARTIFACT_MAP.get(artifactId)
  if (!def) return { canActivate: false, reason: 'Unknown artifact' }
  if (state.bnArtifacts.includes(artifactId)) return { canActivate: false, reason: 'Already activated' }
  if (state.bnIceCrystals < def.forgeCost) return { canActivate: false, reason: 'Insufficient ice crystals' }
  return { canActivate: true, reason: 'Ready' }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: THEME PALETTE & GRADIENT HELPERS
// ═══════════════════════════════════════════════════════════════════

export const BN_THEME_PALETTES: Record<string, readonly string[]> = {
  aurora: [BN_COLOR_AURORA_GREEN, BN_COLOR_ICE_BLUE, BN_COLOR_BOREAL_TEAL, BN_COLOR_GLACIER_CYAN],
  frost: [BN_COLOR_ICE_BLUE, BN_COLOR_FROST_WHITE, BN_COLOR_SNOW_SILVER, BN_COLOR_BOREAL_TEAL],
  polar: [BN_COLOR_POLAR_NIGHT, BN_COLOR_NORTHERN_VIOLET, BN_COLOR_ICE_BLUE, BN_COLOR_AURORA_GREEN],
  golden: [BN_COLOR_FROZEN_GOLD, BN_COLOR_AURORA_GREEN, BN_COLOR_FROST_WHITE, BN_COLOR_BOREAL_TEAL],
  phoenix: [BN_COLOR_AURORA_CORAL, BN_COLOR_FROZEN_GOLD, BN_COLOR_NORTHERN_VIOLET, BN_COLOR_ICE_BLUE],
}

export function bnAuroraGradient(direction: 'to-right' | 'to-bottom' | 'radial' = 'to-right'): string {
  const colors = BN_THEME_PALETTES.aurora
  if (direction === 'radial') {
    return `radial-gradient(circle, ${colors.join(', ')})`
  }
  const dir = direction === 'to-bottom' ? 'to bottom' : 'to right'
  return `linear-gradient(${dir}, ${colors.join(', ')})`
}

export function bnFrostGradient(direction: 'to-right' | 'to-bottom' | 'radial' = 'to-right'): string {
  const colors = BN_THEME_PALETTES.frost
  if (direction === 'radial') {
    return `radial-gradient(circle, ${colors.join(', ')})`
  }
  const dir = direction === 'to-bottom' ? 'to bottom' : 'to right'
  return `linear-gradient(${dir}, ${colors.join(', ')})`
}

export function bnPolarGradient(direction: 'to-right' | 'to-bottom' | 'radial' = 'to-right'): string {
  const colors = BN_THEME_PALETTES.polar
  if (direction === 'radial') {
    return `radial-gradient(circle, ${colors.join(', ')})`
  }
  const dir = direction === 'to-bottom' ? 'to bottom' : 'to right'
  return `linear-gradient(${dir}, ${colors.join(', ')})`
}

export function bnSpeciesGradient(species: BNSpecies): string {
  const baseColor = bnSpeciesColor(species)
  const darker = BN_COLOR_POLAR_NIGHT
  return `linear-gradient(135deg, ${darker} 0%, ${baseColor} 50%, ${BN_COLOR_FROST_WHITE} 100%)`
}

export function bnRarityGradient(rarity: BNRarity): string {
  const baseColor = BN_RARITY_COLORS[rarity]
  return `linear-gradient(135deg, ${BN_COLOR_POLAR_NIGHT} 0%, ${baseColor} 100%)`
}

export function bnRarityLabel(rarity: BNRarity): string {
  switch (rarity) {
    case 'common': return 'Common'
    case 'uncommon': return 'Uncommon'
    case 'rare': return 'Rare'
    case 'epic': return 'Epic'
    case 'legendary': return 'Legendary'
  }
}

export function bnRarityNumericValue(rarity: BNRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 3
    case 'epic': return 4
    case 'legendary': return 5
  }
}

export function bnSpeciesLabel(species: BNSpecies): string {
  switch (species) {
    case 'frost_spirit': return 'Frost Spirit'
    case 'aurora_walker': return 'Aurora Walker'
    case 'north_wind': return 'North Wind'
    case 'ice_phoenix': return 'Ice Phoenix'
    case 'permafrost_dragon': return 'Permafrost Dragon'
    case 'snow_nymph': return 'Snow Nymph'
    case 'boreal_titan': return 'Boreal Titan'
  }
}

export function bnStructureCategoryLabel(category: string): string {
  switch (category) {
    case 'defense': return 'Defense'
    case 'production': return 'Production'
    case 'enchantment': return 'Enchantment'
    case 'storage': return 'Storage'
    case 'summoning': return 'Summoning'
    default: return category
  }
}

export function bnMaterialCategoryLabel(category: string): string {
  switch (category) {
    case 'aurora': return 'Aurora'
    case 'frost': return 'Frost'
    case 'permafrost': return 'Permafrost'
    case 'crystal': return 'Crystal'
    case 'wind': return 'Wind'
    case 'nexus': return 'Nexus'
    default: return category
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17b: EVENT RESOLUTION & EFFECT HELPERS
// ═══════════════════════════════════════════════════════════════════

export interface BNEventEffect {
  readonly type: 'buff' | 'debuff' | 'reward' | 'hazard'
  readonly stat: string
  readonly multiplier: number
  readonly description: string
}

export function bnGetEventEffects(eventId: string): BNEventEffect[] {
  const eventDef = BN_EVENT_MAP.get(eventId)
  if (!eventDef) return []

  const effects: BNEventEffect[] = []

  for (const effect of eventDef.effects) {
    const lowerEffect = effect.toLowerCase()

    if (lowerEffect.includes('double') || lowerEffect.includes('enhanced')) {
      effects.push({
        type: 'buff',
        stat: lowerEffect.includes('aurora') ? 'bnAuroraPower' : 'bnFrostEnergy',
        multiplier: 2.0,
        description: effect,
      })
    } else if (lowerEffect.includes('bonus') || lowerEffect.includes('boost') || lowerEffect.includes('surge')) {
      effects.push({
        type: 'reward',
        stat: lowerEffect.includes('material') ? 'bnInventory' : 'bnAuroraPower',
        multiplier: 1.5,
        description: effect,
      })
    } else if (lowerEffect.includes('reduced') || lowerEffect.includes('fatigue') || lowerEffect.includes('damage')) {
      effects.push({
        type: 'debuff',
        stat: lowerEffect.includes('defense') ? 'defense' : 'bnFrostEnergy',
        multiplier: 0.5,
        description: effect,
      })
    } else {
      effects.push({
        type: 'buff',
        stat: 'bnAuroraPower',
        multiplier: 1.25,
        description: effect,
      })
    }
  }

  return effects
}

export function bnEventSeverityLabel(severity: number): string {
  if (severity <= 1) return 'Minor'
  if (severity <= 2) return 'Moderate'
  if (severity <= 3) return 'Major'
  if (severity <= 4) return 'Severe'
  return 'Catastrophic'
}

export function bnEventSeverityColor(severity: number): string {
  if (severity <= 1) return BN_COLOR_AURORA_GREEN
  if (severity <= 2) return BN_COLOR_ICE_BLUE
  if (severity <= 3) return BN_COLOR_FROZEN_GOLD
  if (severity <= 4) return BN_COLOR_AURORA_CORAL
  return BN_COLOR_NORTHERN_VIOLET
}

export function bnFormatEventDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17c: ENTITY SORTING & FILTERING UTILITIES
// ═══════════════════════════════════════════════════════════════════

export type BNSortField = 'name' | 'power' | 'level' | 'summonedAt' | 'species' | 'rarity'
export type BNSortDirection = 'asc' | 'desc'

export interface BNSortConfig {
  field: BNSortField
  direction: BNSortDirection
}

export function bnSortEntities(
  entities: Record<string, BNEntityEntity>,
  config: BNSortConfig
): BNEntityEntity[] {
  const sorted = Object.values(entities).slice()

  sorted.sort((a, b) => {
    let comparison = 0

    switch (config.field) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'power':
        comparison = a.power - b.power
        break
      case 'level':
        comparison = a.level - b.level
        break
      case 'summonedAt':
        comparison = a.summonedAt - b.summonedAt
        break
      case 'species': {
        const defA = BN_ENTITY_MAP.get(a.entityDefId)
        const defB = BN_ENTITY_MAP.get(b.entityDefId)
        comparison = (defA?.species ?? '').localeCompare(defB?.species ?? '')
        break
      }
      case 'rarity': {
        const defA = BN_ENTITY_MAP.get(a.entityDefId)
        const defB = BN_ENTITY_MAP.get(b.entityDefId)
        const valA = defA ? bnRarityNumericValue(defA.rarity) : 0
        const valB = defB ? bnRarityNumericValue(defB.rarity) : 0
        comparison = valA - valB
        break
      }
    }

    return config.direction === 'asc' ? comparison : -comparison
  })

  return sorted
}

export function bnFilterEntitiesBySpecies(
  entities: Record<string, BNEntityEntity>,
  species: BNSpecies
): BNEntityEntity[] {
  return Object.values(entities).filter((e) => {
    const def = BN_ENTITY_MAP.get(e.entityDefId)
    return def?.species === species
  })
}

export function bnFilterEntitiesByRarity(
  entities: Record<string, BNEntityEntity>,
  rarity: BNRarity
): BNEntityEntity[] {
  return Object.values(entities).filter((e) => {
    const def = BN_ENTITY_MAP.get(e.entityDefId)
    return def?.rarity === rarity
  })
}

export function bnSearchEntities(
  entities: Record<string, BNEntityEntity>,
  query: string
): BNEntityEntity[] {
  const lowerQuery = query.toLowerCase()
  return Object.values(entities).filter((e) => {
    const def = BN_ENTITY_MAP.get(e.entityDefId)
    if (!def) return false
    return (
      e.name.toLowerCase().includes(lowerQuery) ||
      def.description.toLowerCase().includes(lowerQuery) ||
      def.species.toLowerCase().includes(lowerQuery) ||
      def.rarity.toLowerCase().includes(lowerQuery)
    )
  })
}

export function bnSearchDefinitions(query: string): {
  entities: BNEntityDef[]
  nexuses: BNNexusDef[]
  materials: BNMaterialDef[]
  structures: BNStructureDef[]
  abilities: BNAbilityDef[]
  artifacts: BNArtifactDef[]
} {
  const lowerQuery = query.toLowerCase()

  return {
    entities: BN_ENTITIES.filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQuery) ||
        e.description.toLowerCase().includes(lowerQuery)
    ),
    nexuses: BN_NEXUSES.filter(
      (n) =>
        n.name.toLowerCase().includes(lowerQuery) ||
        n.description.toLowerCase().includes(lowerQuery)
    ),
    materials: BN_MATERIALS.filter(
      (m) =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery)
    ),
    structures: BN_STRUCTURES.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery)
    ),
    abilities: BN_ABILITIES.filter(
      (a) =>
        a.name.toLowerCase().includes(lowerQuery) ||
        a.description.toLowerCase().includes(lowerQuery)
    ),
    artifacts: BN_ARTIFACTS.filter(
      (a) =>
        a.name.toLowerCase().includes(lowerQuery) ||
        a.description.toLowerCase().includes(lowerQuery)
    ),
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17d: PROGRESSION & STATISTICS HELPERS
// ═══════════════════════════════════════════════════════════════════

export interface BNProgressionSummary {
  level: number
  levelProgress: number
  entitiesCollected: number
  totalEntities: number
  nexusesClaimed: number
  totalNexuses: number
  structuresBuilt: number
  totalStructures: number
  artifactsFound: number
  totalArtifacts: number
  achievementsUnlocked: number
  totalAchievements: number
  completionPercentage: number
}

export function bnGetProgressionSummary(state: BNStoreState): BNProgressionSummary {
  const entitiesCollected = Object.keys(state.bnEntities).length
  const nexusesClaimed = Object.values(state.bnNexuses).filter((n) => n.claimed).length
  const structuresBuilt = Object.values(state.bnStructures).filter((s) => s.built).length
  const artifactsFound = state.bnArtifacts.length
  const achievementsUnlocked = state.bnAchievements.length

  const totalPossible =
    entitiesCollected / BN_ENTITIES.length +
    nexusesClaimed / BN_NEXUSES.length +
    structuresBuilt / BN_STRUCTURES.length +
    artifactsFound / BN_ARTIFACTS.length +
    achievementsUnlocked / BN_ACHIEVEMENTS.length +
    (state.bnLevel / BN_MAX_LEVEL)

  const completionPercentage = Math.min(100, Math.floor((totalPossible / 6) * 100))

  return {
    level: state.bnLevel,
    levelProgress: (state.bnLevel / BN_MAX_LEVEL) * 100,
    entitiesCollected,
    totalEntities: BN_ENTITIES.length,
    nexusesClaimed,
    totalNexuses: BN_NEXUSES.length,
    structuresBuilt,
    totalStructures: BN_STRUCTURES.length,
    artifactsFound,
    totalArtifacts: BN_ARTIFACTS.length,
    achievementsUnlocked,
    totalAchievements: BN_ACHIEVEMENTS.length,
    completionPercentage,
  }
}

export interface BNPowerBreakdown {
  baseAuroraPower: number
  entityPowerContribution: number
  artifactPowerContribution: number
  structureDefenseContribution: number
  nexusDefenseContribution: number
  totalEffectivePower: number
}

export function bnGetPowerBreakdown(state: BNStoreState): BNPowerBreakdown {
  const entityPower = bnTotalEntityPower(state.bnEntities)
  const artifactPower = state.bnArtifacts.reduce((sum, artifactId) => {
    const def = BN_ARTIFACT_MAP.get(artifactId)
    return sum + (def?.powerBonus ?? 0)
  }, 0)
  const nexusDefense = bnTotalNexusDefense(state.bnNexuses)
  const structureDefense = bnTotalStructureDefense(state.bnStructures) * 10

  return {
    baseAuroraPower: state.bnAuroraPower,
    entityPowerContribution: entityPower,
    artifactPowerContribution: artifactPower,
    structureDefenseContribution: structureDefense,
    nexusDefenseContribution: nexusDefense,
    totalEffectivePower: state.bnAuroraPower + entityPower + artifactPower + nexusDefense + structureDefense,
  }
}

export interface BNSpeciesBreakdown {
  species: BNSpecies
  count: number
  totalPower: number
  averageLevel: number
  hasEntity: boolean
}

export function bnGetSpeciesBreakdown(state: BNStoreState): BNSpeciesBreakdown[] {
  const breakdown: BNSpeciesBreakdown[] = BN_SPECIES.map((speciesDef) => {
    const speciesEntities = Object.values(state.bnEntities).filter((e) => {
      const def = BN_ENTITY_MAP.get(e.entityDefId)
      return def?.species === speciesDef.id
    })

    return {
      species: speciesDef.id,
      count: speciesEntities.length,
      totalPower: speciesEntities.reduce((sum, e) => sum + e.power, 0),
      averageLevel:
        speciesEntities.length > 0
          ? speciesEntities.reduce((sum, e) => sum + e.level, 0) / speciesEntities.length
          : 0,
      hasEntity: speciesEntities.length > 0,
    }
  })

  return breakdown
}

export function bnGetInventoryValue(inventory: Record<string, number>): number {
  let totalValue = 0
  for (const [materialId, quantity] of Object.entries(inventory)) {
    const def = BN_MATERIAL_MAP.get(materialId)
    if (def) {
      totalValue += def.value * quantity
    }
  }
  return totalValue
}

export function bnGetInventoryCount(inventory: Record<string, number>): number {
  return Object.values(inventory).reduce((sum, qty) => sum + qty, 0)
}

export function bnGetMaterialsNeededForStructure(structureId: string, currentLevel: number): number {
  const def = BN_STRUCTURE_MAP.get(structureId)
  if (!def) return 0
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

export function bnGetNexusUnlockRequirements(nexusId: string): { level: number; gold: number } | null {
  const def = BN_NEXUS_MAP.get(nexusId)
  if (!def) return null
  return { level: def.minLevel, gold: def.unlockCost }
}

export function bnGetTitleProgress(state: BNStoreState): { current: BNTitleDef; next: BNTitleDef; progress: number } {
  const nexusesClaimed = Object.values(state.bnNexuses).filter((n) => n.claimed).length
  const current = BN_TITLES.find((t) => t.id === state.bnTitle) ?? BN_TITLES[0]
  const next = bnGetNextTitle(state)

  if (current.id === next.id) {
    return { current, next, progress: 100 }
  }

  const levelProgress = (state.bnLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)
  const nexusProgress = (nexusesClaimed - current.requiredNexuses) / Math.max(1, next.requiredNexuses - current.requiredNexuses)
  const progress = Math.min(100, Math.floor(((levelProgress + nexusProgress) / 2) * 100))

  return { current, next, progress }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17e: ACHIEVEMENT AUTO-CHECK ENGINE
// ═══════════════════════════════════════════════════════════════════

export function bnGetNewlyUnlockedAchievements(state: BNStoreState): BNAchievementDef[] {
  const newlyUnlocked: BNAchievementDef[] = []

  for (const achievement of BN_ACHIEVEMENTS) {
    if (state.bnAchievements.includes(achievement.id)) continue
    if (bnCheckAchievement(achievement.id, state)) {
      newlyUnlocked.push(achievement)
    }
  }

  return newlyUnlocked
}

export function bnGetLockedAchievements(state: BNStoreState): BNAchievementDef[] {
  return BN_ACHIEVEMENTS.filter(
    (a) => !state.bnAchievements.includes(a.id) && !bnCheckAchievement(a.id, state)
  )
}

export function bnGetUnlockableAchievements(state: BNStoreState): BNAchievementDef[] {
  return BN_ACHIEVEMENTS.filter(
    (a) => !state.bnAchievements.includes(a.id) && bnCheckAchievement(a.id, state)
  )
}

export function bnGetCompletedAchievements(state: BNStoreState): BNAchievementDef[] {
  return BN_ACHIEVEMENTS.filter((a) => state.bnAchievements.includes(a.id))
}

export function bnGetAchievementProgress(achievementId: string, state: BNStoreState): number {
  switch (achievementId) {
    case 'bn_first_summon':
      return Math.min(1, state.bnStats.totalEntitiesSummoned / 1)
    case 'bn_five_summons':
      return Math.min(1, Object.keys(state.bnEntities).length / 5)
    case 'bn_ten_summons':
      return Math.min(1, Object.keys(state.bnEntities).length / 10)
    case 'bn_first_nexus':
      return Math.min(1, state.bnStats.totalNexusesClaimed / 1)
    case 'bn_four_nexuses':
      return Math.min(1, state.bnStats.totalNexusesClaimed / 4)
    case 'bn_all_nexuses':
      return Math.min(1, state.bnStats.totalNexusesClaimed / 8)
    case 'bn_first_structure':
      return Math.min(1, state.bnStats.totalStructuresBuilt / 1)
    case 'bn_ten_structures':
      return Math.min(1, state.bnStats.totalStructuresBuilt / 10)
    case 'bn_first_strike':
      return Math.min(1, state.bnStats.totalAuroraStrikes / 1)
    case 'bn_hundred_strikes':
      return Math.min(1, state.bnStats.totalAuroraStrikes / 100)
    case 'bn_first_artifact':
      return Math.min(1, state.bnStats.totalArtifactsActivated / 1)
    case 'bn_five_artifacts':
      return Math.min(1, state.bnArtifacts.length / 5)
    case 'bn_legendary_entity':
      return Math.min(1, Object.values(state.bnEntities).some((e) => {
        const def = BN_ENTITY_MAP.get(e.entityDefId)
        return def?.rarity === 'legendary'
      }) ? 1 : 0)
    case 'bn_max_level':
      return Math.min(1, state.bnLevel / BN_MAX_LEVEL)
    case 'bn_all_species': {
      const speciesSet = new Set<string>()
      for (const entity of Object.values(state.bnEntities)) {
        const def = BN_ENTITY_MAP.get(entity.entityDefId)
        if (def) speciesSet.add(def.species)
      }
      return Math.min(1, speciesSet.size / 7)
    }
    case 'bn_thousand_power':
      return Math.min(1, state.bnAuroraPower / 1000)
    case 'bn_ten_thousand_energy':
      return Math.min(1, state.bnStats.totalFrostEnergyGained / 10000)
    case 'bn_survive_event':
      return Math.min(1, state.bnStats.totalAuroraStrikes / 5)
    default:
      return 0
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17f: NEXUS PATH CALCULATIONS
// ═══════════════════════════════════════════════════════════════════

export interface BNNexusPath {
  readonly from: string
  readonly to: string
  readonly distance: number
  readonly auroraIntensity: number
  readonly isActive: boolean
}

export const BN_NEXUS_PATHS: readonly BNNexusPath[] = [
  { from: 'glacial_convergence', to: 'aurora_crossing', distance: 120, auroraIntensity: 0.8, isActive: true },
  { from: 'glacial_convergence', to: 'wind_gate', distance: 180, auroraIntensity: 0.6, isActive: true },
  { from: 'aurora_crossing', to: 'phoenix_peak', distance: 200, auroraIntensity: 0.9, isActive: true },
  { from: 'aurora_crossing', to: 'nymph_garden', distance: 150, auroraIntensity: 0.7, isActive: true },
  { from: 'wind_gate', to: 'dragon_permafrost', distance: 250, auroraIntensity: 0.5, isActive: true },
  { from: 'phoenix_peak', to: 'dragon_permafrost', distance: 300, auroraIntensity: 0.4, isActive: true },
  { from: 'dragon_permafrost', to: 'titan_forge', distance: 220, auroraIntensity: 0.6, isActive: true },
  { from: 'nymph_garden', to: 'titan_forge', distance: 180, auroraIntensity: 0.7, isActive: true },
  { from: 'titan_forge', to: 'polar_zenith', distance: 350, auroraIntensity: 1.0, isActive: true },
  { from: 'polar_zenith', to: 'glacial_convergence', distance: 400, auroraIntensity: 1.0, isActive: true },
  { from: 'polar_zenith', to: 'aurora_crossing', distance: 380, auroraIntensity: 0.9, isActive: true },
  { from: 'polar_zenith', to: 'phoenix_peak', distance: 320, auroraIntensity: 0.8, isActive: true },
]

export function bnGetConnectedNexuses(nexusId: string, state: BNStoreState): string[] {
  const connected: string[] = []
  for (const path of BN_NEXUS_PATHS) {
    if (!path.isActive) continue
    if (path.from === nexusId && state.bnNexuses[path.to]?.claimed) {
      connected.push(path.to)
    }
    if (path.to === nexusId && state.bnNexuses[path.from]?.claimed) {
      connected.push(path.from)
    }
  }
  return connected
}

export function bnGetPathBetweenNexuses(fromId: string, toId: string): BNNexusPath | null {
  return BN_NEXUS_PATHS.find(
    (p) =>
      (p.from === fromId && p.to === toId) ||
      (p.from === toId && p.to === fromId)
  ) ?? null
}

export function bnGetNexusConnectivity(state: BNStoreState): number {
  const claimedNexuses = Object.entries(state.bnNexuses)
    .filter(([, n]) => n.claimed)
    .map(([id]) => id)

  if (claimedNexuses.length === 0) return 0

  let activePaths = 0
  for (const path of BN_NEXUS_PATHS) {
    if (!path.isActive) continue
    if (claimedNexuses.includes(path.from) && claimedNexuses.includes(path.to)) {
      activePaths++
    }
  }

  return Math.floor((activePaths / BN_NEXUS_PATHS.length) * 100)
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17g: CONSTANT VERIFICATION COUNTS (for debugging)
// ═══════════════════════════════════════════════════════════════════

export const BN_CONSTANTS_SUMMARY: {
  entities: number
  species: number
  nexuses: number
  materials: number
  structures: number
  abilities: number
  achievements: number
  titles: number
  artifacts: number
  events: number
  paths: number
} = {
  entities: BN_ENTITIES.length,
  species: BN_SPECIES.length,
  nexuses: BN_NEXUSES.length,
  materials: BN_MATERIALS.length,
  structures: BN_STRUCTURES.length,
  abilities: BN_ABILITIES.length,
  achievements: BN_ACHIEVEMENTS.length,
  titles: BN_TITLES.length,
  artifacts: BN_ARTIFACTS.length,
  events: BN_EVENTS.length,
  paths: BN_NEXUS_PATHS.length,
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: STORE INITIAL STATE
// ═══════════════════════════════════════════════════════════════════

const BN_INITIAL_STATE: BNStoreState = {
  bnLevel: 1,
  bnAuroraPower: BN_INITIAL_AURORA_POWER,
  bnFrostEnergy: BN_INITIAL_FROST_ENERGY,
  bnEntities: {},
  bnNexuses: {},
  bnStructures: {},
  bnArtifacts: [],
  bnAchievements: [],
  bnInventory: {},
  bnStats: {
    totalEntitiesSummoned: 0,
    totalNexusesClaimed: 0,
    totalStructuresBuilt: 0,
    totalArtifactsActivated: 0,
    totalAuroraStrikes: 0,
    totalAuroraPowerEarned: 0,
    totalFrostEnergyGained: 0,
    totalRelicsActivated: 0,
  },
  bnTitle: 'frost_wanderer',
  bnActiveEventId: null,
  bnEventTimer: 0,
  bnGold: BN_INITIAL_GOLD,
  bnIceCrystals: BN_INITIAL_ICE_CRYSTALS,
  bnActiveNexusId: null,
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

export const useBorealNexusStore = create<BNFullStore>()(
  persist(
    (set, get) => ({
      ...BN_INITIAL_STATE,

      bnSummonEntity: (entityId: string): boolean => {
        const state = get()
        const entityDef = BN_ENTITIES.find((e) => e.id === entityId)
        if (!entityDef) return false

        // Check if already owned
        const existingKeys = Object.keys(state.bnEntities)
        if (existingKeys.some((k) => state.bnEntities[k].entityDefId === entityId)) return false

        // Check cost
        if (state.bnFrostEnergy < entityDef.summonCost) return false

        const entity: BNEntityEntity = {
          id: bnGenerateId(),
          entityDefId: entityDef.id,
          name: entityDef.name,
          level: 1,
          currentHP: entityDef.stats.hp,
          maxHP: entityDef.stats.hp,
          power: entityDef.auroraPower,
          summonedAt: Date.now(),
          nexusesDefended: 0,
        }

        const newEntities = { ...state.bnEntities, [entity.id]: entity }
        const xpGain = entityDef.auroraPower * bnRarityMultiplier(entityDef.rarity)
        const newLevel = bnLevelFromXp((state.bnLevel - 1) * 100 + xpGain)

        set({
          bnEntities: newEntities,
          bnFrostEnergy: state.bnFrostEnergy - entityDef.summonCost,
          bnAuroraPower: state.bnAuroraPower + Math.floor(xpGain),
          bnLevel: newLevel,
          bnStats: {
            ...state.bnStats,
            totalEntitiesSummoned: state.bnStats.totalEntitiesSummoned + 1,
            totalAuroraPowerEarned: state.bnStats.totalAuroraPowerEarned + Math.floor(xpGain),
          },
        })

        return true
      },

      bnNexusClaim: (nexusId: string): boolean => {
        const state = get()
        const nexusDef = BN_NEXUSES.find((n) => n.id === nexusId)
        if (!nexusDef) return false

        // Check if already claimed
        if (state.bnNexuses[nexusId]?.claimed) return false

        // Check level requirement
        if (state.bnLevel < nexusDef.minLevel) return false

        // Check cost
        if (state.bnGold < nexusDef.unlockCost) return false

        const newNexuses = {
          ...state.bnNexuses,
          [nexusId]: {
            claimed: true,
            claimedAt: Date.now(),
            defenseBonus: nexusDef.minLevel * 5,
          },
        }

        const xpGain = nexusDef.minLevel * 20
        const newLevel = bnLevelFromXp((state.bnLevel - 1) * 100 + xpGain)

        set({
          bnNexuses: newNexuses,
          bnGold: state.bnGold - nexusDef.unlockCost,
          bnAuroraPower: state.bnAuroraPower + Math.floor(xpGain),
          bnLevel: newLevel,
          bnActiveNexusId: nexusId,
          bnStats: {
            ...state.bnStats,
            totalNexusesClaimed: state.bnStats.totalNexusesClaimed + 1,
            totalAuroraPowerEarned: state.bnStats.totalAuroraPowerEarned + Math.floor(xpGain),
          },
        })

        // Check title advancement
        const updatedState = get()
        const nexusesClaimed = Object.values(updatedState.bnNexuses).filter((n) => n.claimed).length
        for (let i = BN_TITLES.length - 1; i >= 0; i--) {
          const title = BN_TITLES[i]
          if (updatedState.bnLevel >= title.requiredLevel && nexusesClaimed >= title.requiredNexuses) {
            if (updatedState.bnTitle !== title.id) {
              set({ bnTitle: title.id })
            }
            break
          }
        }

        return true
      },

      bnBuildStructure: (structureId: string): boolean => {
        const state = get()
        const structDef = BN_STRUCTURES.find((s) => s.id === structureId)
        if (!structDef) return false

        const existing = state.bnStructures[structureId]
        const currentLevel = existing?.level ?? 0

        if (currentLevel >= structDef.maxLevel) return false

        const cost = Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, currentLevel))
        if (state.bnGold < cost) return false

        const newStructures = {
          ...state.bnStructures,
          [structureId]: {
            id: bnGenerateId(),
            structureDefId: structureId,
            level: currentLevel + 1,
            built: true,
          },
        }

        const xpGain = structDef.baseCost / 5
        const newLevel = bnLevelFromXp((state.bnLevel - 1) * 100 + xpGain)

        set({
          bnStructures: newStructures,
          bnGold: state.bnGold - cost,
          bnAuroraPower: state.bnAuroraPower + Math.floor(xpGain),
          bnLevel: newLevel,
          bnStats: {
            ...state.bnStats,
            totalStructuresBuilt: state.bnStats.totalStructuresBuilt + 1,
            totalAuroraPowerEarned: state.bnStats.totalAuroraPowerEarned + Math.floor(xpGain),
          },
        })

        return true
      },

      bnAuroraStrike: (targetNexusId: string): boolean => {
        const state = get()
        const nexus = state.bnNexuses[targetNexusId]
        if (!nexus?.claimed) return false
        if (state.bnFrostEnergy < 10) return false

        const damage = Math.floor(20 + state.bnLevel * 5 + Object.keys(state.bnEntities).length * 3)
        const xpGain = damage / 2
        const energyGain = Math.floor(damage / 10)
        const newLevel = bnLevelFromXp((state.bnLevel - 1) * 100 + xpGain)

        set({
          bnFrostEnergy: Math.min(9999, state.bnFrostEnergy - 10 + energyGain),
          bnAuroraPower: state.bnAuroraPower + Math.floor(xpGain),
          bnLevel: newLevel,
          bnGold: state.bnGold + Math.floor(damage / 4),
          bnStats: {
            ...state.bnStats,
            totalAuroraStrikes: state.bnStats.totalAuroraStrikes + 1,
            totalAuroraPowerEarned: state.bnStats.totalAuroraPowerEarned + Math.floor(xpGain),
            totalFrostEnergyGained: state.bnStats.totalFrostEnergyGained + energyGain,
          },
        })

        return true
      },

      bnActivateRelic: (artifactId: string): boolean => {
        const state = get()
        const artifactDef = BN_ARTIFACTS.find((a) => a.id === artifactId)
        if (!artifactDef) return false
        if (state.bnArtifacts.includes(artifactId)) return false
        if (state.bnIceCrystals < artifactDef.forgeCost) return false

        set({
          bnArtifacts: [...state.bnArtifacts, artifactId],
          bnIceCrystals: state.bnIceCrystals - artifactDef.forgeCost,
          bnAuroraPower: state.bnAuroraPower + artifactDef.powerBonus,
          bnStats: {
            ...state.bnStats,
            totalArtifactsActivated: state.bnStats.totalArtifactsActivated + 1,
            totalRelicsActivated: state.bnStats.totalRelicsActivated + 1,
          },
        })

        return true
      },

      resetBorealNexus: () => {
        set(BN_INITIAL_STATE)
      },
    }),
    {
      name: 'boreal-nexus-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 22: REACT HOOK — useBorealNexus
// ═══════════════════════════════════════════════════════════════════

export default function useBorealNexus() {
  const state = useBorealNexusStore()
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  return {
    // ── Constants ──────────────────────────────────────────────
    BN_SPECIES,
    BN_ENTITIES,
    BN_NEXUSES,
    BN_MATERIALS,
    BN_STRUCTURES,
    BN_ABILITIES,
    BN_ACHIEVEMENTS,
    BN_TITLES,
    BN_ARTIFACTS,
    BN_EVENTS,
    BN_NEXUS_PATHS,

    BN_COLOR_AURORA_GREEN,
    BN_COLOR_ICE_BLUE,
    BN_COLOR_FROST_WHITE,
    BN_COLOR_POLAR_NIGHT,
    BN_COLOR_BOREAL_TEAL,
    BN_COLOR_NORTHERN_VIOLET,
    BN_COLOR_SNOW_SILVER,
    BN_COLOR_GLACIER_CYAN,
    BN_COLOR_AURORA_CORAL,
    BN_COLOR_FROZEN_GOLD,

    BN_RARITY_COLORS,
    BN_RARITY_ICONS,
    BN_THEME_PALETTES,
    BN_CONSTANTS_SUMMARY,

    // ── Lookup Maps ────────────────────────────────────────────
    BN_ENTITY_MAP,
    BN_NEXUS_MAP,
    BN_MATERIAL_MAP,
    BN_STRUCTURE_MAP,
    BN_ABILITY_MAP,
    BN_ARTIFACT_MAP,
    BN_EVENT_MAP,
    BN_ACHIEVEMENT_MAP,
    BN_TITLE_MAP,

    // ── Filtered Lists ─────────────────────────────────────────
    BN_ENTITIES_BY_RARITY,
    BN_ENTITIES_BY_SPECIES,
    BN_MATERIALS_BY_CATEGORY,
    BN_ARTIFACTS_BY_RARITY,
    BN_STRUCTURES_BY_CATEGORY,

    // ── State accessors ────────────────────────────────────────
    bnLevel: state.bnLevel,
    bnAuroraPower: state.bnAuroraPower,
    bnFrostEnergy: state.bnFrostEnergy,
    bnEntities: state.bnEntities,
    bnNexuses: state.bnNexuses,
    bnStructures: state.bnStructures,
    bnArtifacts: state.bnArtifacts,
    bnAchievements: state.bnAchievements,
    bnInventory: state.bnInventory,
    bnStats: state.bnStats,
    bnTitle: state.bnTitle,
    bnActiveEventId: state.bnActiveEventId,
    bnEventTimer: state.bnEventTimer,
    bnGold: state.bnGold,
    bnIceCrystals: state.bnIceCrystals,
    bnActiveNexusId: state.bnActiveNexusId,

    // ── Actions ────────────────────────────────────────────────
    bnSummonEntity: state.bnSummonEntity,
    bnNexusClaim: state.bnNexusClaim,
    bnBuildStructure: state.bnBuildStructure,
    bnAuroraStrike: state.bnAuroraStrike,
    bnActivateRelic: state.bnActivateRelic,
    resetBorealNexus: state.resetBorealNexus,

    // ── Derived helpers ────────────────────────────────────────
    bnEntityCount: Object.keys(state.bnEntities).length,
    bnNexusCount: Object.values(state.bnNexuses).filter((n) => n.claimed).length,
    bnStructureCount: Object.values(state.bnStructures).filter((s) => s.built).length,
    bnArtifactCount: state.bnArtifacts.length,
    bnAchievementCount: state.bnAchievements.length,
    bnCurrentTitleDef: BN_TITLES.find((t) => t.id === state.bnTitle) ?? BN_TITLES[0],
    bnNextTitle: bnGetNextTitle(state),
    bnTotalEntityPower: bnTotalEntityPower(state.bnEntities),
    bnTotalNexusDefense: bnTotalNexusDefense(state.bnNexuses),
    bnTotalStructureDefense: bnTotalStructureDefense(state.bnStructures),
    bnEntitiesByRarityState: bnEntitiesByRarityForState(state.bnEntities),
    bnUnlockedAbilities: bnUnlockedAbilities(state.bnEntities),

    // ── Progression helpers ───────────────────────────────────
    bnProgressionSummary: bnGetProgressionSummary(state),
    bnPowerBreakdown: bnGetPowerBreakdown(state),
    bnSpeciesBreakdown: bnGetSpeciesBreakdown(state),
    bnTitleProgress: bnGetTitleProgress(state),
    bnNexusConnectivity: bnGetNexusConnectivity(state),
    bnNewlyUnlockedAchievements: bnGetNewlyUnlockedAchievements(state),
    bnUnlockableAchievements: bnGetUnlockableAchievements(state),
    bnCompletedAchievements: bnGetCompletedAchievements(state),
    bnLockedAchievements: bnGetLockedAchievements(state),
    bnInventoryValue: bnGetInventoryValue(state.bnInventory),
    bnInventoryCount: bnGetInventoryCount(state.bnInventory),

    // ── Validation helpers ────────────────────────────────────
    bnCanSummonEntity: (entityId: string) => bnCanSummonEntity(entityId, state),
    bnCanClaimNexus: (nexusId: string) => bnCanClaimNexus(nexusId, state),
    bnCanBuildStructure: (structureId: string) => bnCanBuildStructure(structureId, state),
    bnCanActivateRelic: (artifactId: string) => bnCanActivateRelic(artifactId, state),
    bnCheckAchievement: (achievementId: string) => bnCheckAchievement(achievementId, state),
    bnGetAchievementProgress: (achievementId: string) => bnGetAchievementProgress(achievementId, state),
    bnEntityPowerAtLevel: bnEntityPowerAtLevel,
    bnStructureCostAtLevel: bnStructureCostAtLevel,

    // ── Sorting & filtering helpers ────────────────────────────
    bnSortEntities: (config: BNSortConfig) => bnSortEntities(state.bnEntities, config),
    bnFilterEntitiesBySpecies: (species: BNSpecies) => bnFilterEntitiesBySpecies(state.bnEntities, species),
    bnFilterEntitiesByRarity: (rarity: BNRarity) => bnFilterEntitiesByRarity(state.bnEntities, rarity),
    bnSearchEntities: (query: string) => bnSearchEntities(state.bnEntities, query),
    bnSearchDefinitions: bnSearchDefinitions,

    // ── Nexus path helpers ────────────────────────────────────
    bnGetConnectedNexuses: (nexusId: string) => bnGetConnectedNexuses(nexusId, state),
    bnGetPathBetweenNexuses: bnGetPathBetweenNexuses,
    bnGetNexusUnlockRequirements: bnGetNexusUnlockRequirements,
    bnGetMaterialsNeededForStructure: bnGetMaterialsNeededForStructure,

    // ── Event helpers ─────────────────────────────────────────
    bnGetEventEffects: bnGetEventEffects,
    bnEventSeverityLabel: bnEventSeverityLabel,
    bnEventSeverityColor: bnEventSeverityColor,
    bnFormatEventDuration: bnFormatEventDuration,

    // ── Helper functions ───────────────────────────────────────
    bnGetEntityDef: (id: string) => BN_ENTITY_MAP.get(id) ?? null,
    bnGetNexusDef: (id: string) => BN_NEXUS_MAP.get(id) ?? null,
    bnGetStructureDef: (id: string) => BN_STRUCTURE_MAP.get(id) ?? null,
    bnGetArtifactDef: (id: string) => BN_ARTIFACT_MAP.get(id) ?? null,
    bnGetMaterialDef: (id: string) => BN_MATERIAL_MAP.get(id) ?? null,
    bnGetSpeciesDef: (id: string) => BN_SPECIES.find((s) => s.id === id) ?? null,
    bnGetAbilityDef: (id: string) => BN_ABILITY_MAP.get(id) ?? null,
    bnGetEventDef: (id: string) => BN_EVENT_MAP.get(id) ?? null,
    bnGetAchievementDef: (id: string) => BN_ACHIEVEMENT_MAP.get(id) ?? null,
    bnGetTitleDef: (id: string) => BN_TITLE_MAP.get(id) ?? null,

    // ── Theme & display helpers ────────────────────────────────
    bnRarityColor,
    bnSpeciesColor,
    bnRarityMultiplier,
    bnRarityIcon: (rarity: BNRarity) => BN_RARITY_ICONS[rarity],
    bnRarityLabel,
    bnSpeciesLabel,
    bnStructureCategoryLabel,
    bnMaterialCategoryLabel,
    bnAuroraGradient,
    bnFrostGradient,
    bnPolarGradient,
    bnSpeciesGradient,
    bnRarityGradient,
    bnClamp,

    // ── Ref for callbacks ──────────────────────────────────────
    stateRef,
  }
}
