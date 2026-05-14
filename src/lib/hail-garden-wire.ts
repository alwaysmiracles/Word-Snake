/**
 * Hail Garden Wire — 冰雹花园 (Hail Garden) feature module
 *
 * A mystical frozen garden where ice plants bloom amid perpetual hailstorms,
 * tended by frost spirits: cultivate 35 frost blooms across 7 species and
 * 5 rarity tiers, tend 8 frozen garden chambers, collect 30 ice/frost
 * materials, build 25 garden structures, wield 22 frost abilities, earn
 * 18 achievements and 8 titles from Seed Planter to Garden Eternal,
 * discover 15 legendary artifacts, and face 12 garden events — backed
 * by a Zustand store with persist middleware.
 *
 * Storage key: hail-garden-wire
 * Prefix: hg / HG_
 */

import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type HgSpeciesType =
  | 'ice_rose'
  | 'frost_lotus'
  | 'hail_orchid'
  | 'glacial_tulip'
  | 'snow_lily'
  | 'permafrost_sunflower'
  | 'crystal_bonsai'

export type HgRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type HgTitleId =
  | 'title_seed_planter'
  | 'title_frost_sprout'
  | 'title_ice_gardener'
  | 'title_hail_tender'
  | 'title_crystal_cultivator'
  | 'title_glacier_warden'
  | 'title_frost_sovereign'
  | 'title_garden_eternal'

export type HgAbilityType = 'active' | 'passive' | 'ultimate'

export type HgEventEffectType = 'buff' | 'debuff' | 'special'

export interface HgBloomDef {
  readonly id: string
  readonly name: string
  readonly species: HgSpeciesType
  readonly rarity: HgRarity
  readonly frostPower: number
  readonly bloomSpeed: number
  readonly hailResistance: number
  readonly description: string
  readonly traits: string[]
}

export interface HgBloomState {
  owned: boolean
  count: number
  level: number
  xp: number
  plantedAt: number | null
  gardenId: string | null
  health: number
}

export interface HgGardenDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly unlockLevel: number
  readonly capacity: number
  readonly frostBonus: number
  readonly hailIntensity: number
  readonly bgGradient: string
}

export interface HgGardenState {
  claimed: boolean
  level: number
  bloomSlots: string[]
  claimedAt: number | null
}

export interface HgMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'gem' | 'petal' | 'nectar' | 'shard' | 'essence' | 'relic_shard'
  readonly rarity: HgRarity
  readonly frostBonus: number
  readonly value: number
  readonly description: string
}

export interface HgStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'greenhouse' | 'dome' | 'fountain' | 'altar' | 'storage' | 'nursery' | 'monument'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly requiredLevel: number
  readonly description: string
}

export interface HgStructureState {
  level: number
  builtAt: number | null
}

export interface HgAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly species: HgSpeciesType
  readonly type: HgAbilityType
  readonly rarity: HgRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly requiredLevel: number
  readonly description: string
}

export interface HgAbilityState {
  learned: boolean
  castCount: number
  cooldownEnd: number
}

export interface HgAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly targetValue: number
  readonly rewardFrostPower: number
  readonly rewardHailEnergy: number
}

export interface HgTitleDef {
  readonly id: HgTitleId
  readonly name: string
  readonly emoji: string
  readonly minLevel: number
  readonly minBlooms: number
  readonly description: string
}

export interface HgArtifactDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: HgRarity
  readonly species: HgSpeciesType
  readonly frostBoost: number
  readonly energyBoost: number
  readonly bloomBoost: number
  readonly value: number
  readonly description: string
}

export interface HgEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: HgEventEffectType
  readonly effectDescription: string
  readonly description: string
}

export interface HgStats {
  totalBloomsPlanted: number
  totalBloomsHarvested: number
  totalGardensClaimed: number
  totalStructuresBuilt: number
  totalHailStrikes: number
  totalRelicsActivated: number
  totalAbilityCasts: number
  totalEventsFaced: number
  totalMaterialsCollected: number
  totalFrostPowerEarned: number
  totalPlayMinutes: number
}

export interface HgStoreState {
  hgLevel: number
  hgFrostPower: number
  hgHailEnergy: number
  hgBlooms: Record<string, HgBloomState>
  hgGardens: Record<string, HgGardenState>
  hgStructures: Record<string, HgStructureState>
  hgArtifacts: string[]
  hgAchievements: string[]
  hgInventory: Record<string, number>
  hgStats: HgStats
  hgTitle: HgTitleId
  activeEvent: HgEventDef | null
  eventTurnsRemaining: number
}

export interface HgStoreActions {
  hgPlantBloom: (bloomId: string, gardenId: string) => boolean
  hgGardenClaim: (gardenId: string) => boolean
  hgBuildStructure: (structureId: string) => boolean
  hgHailStrike: (targetBloomId: string) => boolean
  hgActivateRelic: (artifactId: string) => boolean
  resetHailGarden: () => void
}

export interface HgFullStore extends HgStoreState, HgStoreActions {}

export interface HgRarityInfo {
  readonly key: HgRarity
  readonly label: string
  readonly color: string
  readonly xpMultiplier: number
}

export interface HgOwnedBloom {
  def: HgBloomDef | undefined
  state: HgBloomState
  rarityColor: string
  speciesColor: string
}

export interface HgBuiltStructure {
  def: HgStructureDef | undefined
  state: HgStructureState
}

export interface HgTitleProgress {
  percent: number
  levelNeeded: number
  bloomsNeeded: number
}

export interface HgAPI {
  // Color constants
  HG_FROST_PINK: string
  HG_ICE_BLUE: string
  HG_HAIL_WHITE: string
  HG_GARDEN_GREEN: string
  HG_DEEP_FROST: string
  HG_CRYSTAL_PURPLE: string
  HG_AURORA_GLOW: string
  HG_SHADOW_ICE: string
  // Data constants
  HG_SPECIES: readonly HgSpeciesType[]
  HG_RARITIES: readonly HgRarityInfo[]
  HG_BLOOMS: readonly HgBloomDef[]
  HG_GARDENS: readonly HgGardenDef[]
  HG_MATERIALS: readonly HgMaterialDef[]
  HG_STRUCTURES: readonly HgStructureDef[]
  HG_ABILITIES: readonly HgAbilityDef[]
  HG_ACHIEVEMENTS: readonly HgAchievementDef[]
  HG_TITLES: readonly HgTitleDef[]
  HG_ARTIFACTS: readonly HgArtifactDef[]
  HG_EVENTS: readonly HgEventDef[]
  HG_SPECIES_INFO: readonly HgSpeciesInfo[]
  hgCalcBloomFrostPower: (bloomId: string, level: number) => number
  hgCalcBloomSpeed: (bloomId: string, level: number) => number
  hgCalcBloomResistance: (bloomId: string, level: number) => number
  hgCalcBloomTotalPower: (bloomId: string, level: number) => number
  hgCalcGardenTotalFrost: (gardenId: string, gardens: Record<string, HgGardenState>, blooms: Record<string, HgBloomState>) => number
  hgCalcStructureUpgradeCost: (structureId: string, currentLevel: number) => number
  hgCalcStructureEffect: (structureId: string, level: number) => number
  hgSpeciesSynergyBonus: (speciesA: HgSpeciesType, speciesB: HgSpeciesType) => number
  hgCalcTotalArtifactBoost: (artifactIds: string[]) => { frostBoost: number; energyBoost: number; bloomBoost: number }
  hgGetRandomEvent: () => HgEventDef
  hgCheckTitleEligibility: (level: number, bloomCount: number) => HgTitleDef
  hgGetBloomsByRarityFilter: (blooms: HgOwnedBloom[], rarity: HgRarity) => HgOwnedBloom[]
  hgGetBloomsBySpeciesFilter: (blooms: HgOwnedBloom[], species: HgSpeciesType) => HgOwnedBloom[]
  hgGetMaterialsByType: (inventory: Record<string, number>, type: HgMaterialDef['type']) => { id: string; count: number; def: HgMaterialDef | undefined }[]
  hgGetInventoryValue: (inventory: Record<string, number>) => number
  hgFormatHailEnergy: (energy: number) => string
  // Store state
  hgLevel: number
  hgFrostPower: number
  hgHailEnergy: number
  hgBlooms: Record<string, HgBloomState>
  hgGardens: Record<string, HgGardenState>
  hgStructures: Record<string, HgStructureState>
  hgArtifacts: string[]
  hgAchievements: string[]
  hgInventory: Record<string, number>
  hgStats: HgStats
  hgTitle: HgTitleId
  activeEvent: HgEventDef | null
  eventTurnsRemaining: number
  // Store actions
  hgPlantBloom: (bloomId: string, gardenId: string) => boolean
  hgGardenClaim: (gardenId: string) => boolean
  hgBuildStructure: (structureId: string) => boolean
  hgHailStrike: (targetBloomId: string) => boolean
  hgActivateRelic: (artifactId: string) => boolean
  resetHailGarden: () => void
  // Computed getters
  hgOwnedBlooms: HgOwnedBloom[]
  hgUnownedBlooms: HgBloomDef[]
  hgClaimedGardens: HgGardenDef[]
  hgUnclaimedGardens: HgGardenDef[]
  hgBuiltStructures: HgBuiltStructure[]
  hgOwnedArtifacts: HgArtifactDef[]
  hgUnclaimedAchievements: HgAchievementDef[]
  hgCurrentTitleDetail: HgTitleDef
  hgNextTitle: HgTitleDef | null
  hgTitleProgress: HgTitleProgress
  hgBloomCount: number
  hgGardenCount: number
  hgStructureCount: number
  hgArtifactCount: number
  hgRareMaterialCount: number
  hgTotalStructureEffect: number
  hgBloomsByRarity: Record<HgRarity, HgOwnedBloom[]>
  hgBloomsBySpecies: Record<HgSpeciesType, HgOwnedBloom[]>
  hgRarityDistribution: Record<HgRarity, number>
  hgSpeciesDistribution: Record<HgSpeciesType, number>
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const HG_FROST_PINK: string = '#F48FB1'
export const HG_ICE_BLUE: string = '#81D4FA'
export const HG_HAIL_WHITE: string = '#E3F2FD'
export const HG_GARDEN_GREEN: string = '#A5D6A7'
export const HG_DEEP_FROST: string = '#4DD0E1'
export const HG_CRYSTAL_PURPLE: string = '#CE93D8'
export const HG_AURORA_GLOW: string = '#80CBC4'
export const HG_SHADOW_ICE: string = '#90CAF9'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: SPECIES & RARITY CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const HG_SPECIES: readonly HgSpeciesType[] = [
  'ice_rose',
  'frost_lotus',
  'hail_orchid',
  'glacial_tulip',
  'snow_lily',
  'permafrost_sunflower',
  'crystal_bonsai',
]

export const HG_RARITIES: readonly HgRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: HG_BLOOMS — 35 Frost Blooms (7 species × 5 rarities)
// ═══════════════════════════════════════════════════════════════════

export const HG_BLOOMS: readonly HgBloomDef[] = [
  // ── Ice Rose (7) ─────────────────────────────────────────────
  {
    id: 'ice_rose_common',
    name: 'Shivering Ice Rose',
    species: 'ice_rose',
    rarity: 'common',
    frostPower: 8,
    bloomSpeed: 12,
    hailResistance: 6,
    description: 'A delicate rose with petals of frozen dew. It shivers in the wind but never wilts.',
    traits: ['hail_tolerance', 'frost_bloom'],
  },
  {
    id: 'ice_rose_uncommon',
    name: 'Frostpetal Rose',
    species: 'ice_rose',
    rarity: 'uncommon',
    frostPower: 18,
    bloomSpeed: 20,
    hailResistance: 12,
    description: 'Rose petals rimmed with silver frost that sparkle under the pale moonlight.',
    traits: ['hail_tolerance', 'frost_bloom', 'silver_glow'],
  },
  {
    id: 'ice_rose_rare',
    name: 'Glacial Ice Rose',
    species: 'ice_rose',
    rarity: 'rare',
    frostPower: 35,
    bloomSpeed: 30,
    hailResistance: 25,
    description: 'A rose carved from ancient glacial ice, its thorns sharper than tempered steel.',
    traits: ['hail_tolerance', 'frost_bloom', 'silver_glow', 'crystal_thorns'],
  },
  {
    id: 'ice_rose_epic',
    name: 'Crystal Rose of Eternity',
    species: 'ice_rose',
    rarity: 'epic',
    frostPower: 60,
    bloomSpeed: 45,
    hailResistance: 45,
    description: 'A living crystal rose that pulses with frozen light. Its bloom never fades.',
    traits: ['hail_tolerance', 'frost_bloom', 'silver_glow', 'crystal_thorns', 'eternal_bloom'],
  },
  {
    id: 'ice_rose_legendary',
    name: 'Frozen Heart Rose',
    species: 'ice_rose',
    rarity: 'legendary',
    frostPower: 110,
    bloomSpeed: 70,
    hailResistance: 80,
    description: 'The original ice rose from which all frost flora descended. A frozen heart beats within its crystal core.',
    traits: ['hail_tolerance', 'frost_bloom', 'silver_glow', 'crystal_thorns', 'eternal_bloom', 'heart_frost'],
  },

  // ── Frost Lotus (7) ──────────────────────────────────────────
  {
    id: 'frost_lotus_common',
    name: 'Frost Bud Lotus',
    species: 'frost_lotus',
    rarity: 'common',
    frostPower: 7,
    bloomSpeed: 10,
    hailResistance: 10,
    description: 'A small lotus that grows in frozen ponds, its buds tipped with morning frost.',
    traits: ['water_frost', 'calm_bloom'],
  },
  {
    id: 'frost_lotus_uncommon',
    name: 'Silver Scale Lotus',
    species: 'frost_lotus',
    rarity: 'uncommon',
    frostPower: 16,
    bloomSpeed: 18,
    hailResistance: 16,
    description: 'Lotus petals arranged in perfect silver scales that reflect rainbow halos in ice light.',
    traits: ['water_frost', 'calm_bloom', 'prismatic_ice'],
  },
  {
    id: 'frost_lotus_rare',
    name: 'Permafrost Lotus',
    species: 'frost_lotus',
    rarity: 'rare',
    frostPower: 32,
    bloomSpeed: 28,
    hailResistance: 30,
    description: 'A lotus rooted deep in permafrost, its flowers blooming upward through layers of eternal ice.',
    traits: ['water_frost', 'calm_bloom', 'prismatic_ice', 'deep_root'],
  },
  {
    id: 'frost_lotus_epic',
    name: 'Blizzard Lotus',
    species: 'frost_lotus',
    rarity: 'epic',
    frostPower: 55,
    bloomSpeed: 42,
    hailResistance: 50,
    description: 'A lotus that summons miniature blizzards when it blooms, shielding nearby flora from hail.',
    traits: ['water_frost', 'calm_bloom', 'prismatic_ice', 'deep_root', 'blizzard_aura'],
  },
  {
    id: 'frost_lotus_legendary',
    name: 'Eternal Frost Lotus',
    species: 'frost_lotus',
    rarity: 'legendary',
    frostPower: 105,
    bloomSpeed: 65,
    hailResistance: 85,
    description: 'The mythic lotus said to have bloomed at the dawn of the first ice age. Its petals hold the memory of every snowfall.',
    traits: ['water_frost', 'calm_bloom', 'prismatic_ice', 'deep_root', 'blizzard_aura', 'time_frost'],
  },

  // ── Hail Orchid (7) ──────────────────────────────────────────
  {
    id: 'hail_orchid_common',
    name: 'Hailstone Orchid',
    species: 'hail_orchid',
    rarity: 'common',
    frostPower: 10,
    bloomSpeed: 8,
    hailResistance: 14,
    description: 'A stubborn orchid that feeds on hailstone impacts, converting kinetic energy into frost bloom.',
    traits: ['hail_feeder', 'kinetic_frost'],
  },
  {
    id: 'hail_orchid_uncommon',
    name: 'Ice Vein Orchid',
    species: 'hail_orchid',
    rarity: 'uncommon',
    frostPower: 20,
    bloomSpeed: 16,
    hailResistance: 22,
    description: 'Translucent roots visible through ice, channeling frost from deep veins of permafrost.',
    traits: ['hail_feeder', 'kinetic_frost', 'vein_network'],
  },
  {
    id: 'hail_orchid_rare',
    name: 'Thunder Hail Orchid',
    species: 'hail_orchid',
    rarity: 'rare',
    frostPower: 38,
    bloomSpeed: 26,
    hailResistance: 35,
    description: 'An orchid that crackles with static electricity during hailstorms, charging its frost blooms with lightning.',
    traits: ['hail_feeder', 'kinetic_frost', 'vein_network', 'storm_charge'],
  },
  {
    id: 'hail_orchid_epic',
    name: 'Avalanche Orchid',
    species: 'hail_orchid',
    rarity: 'epic',
    frostPower: 58,
    bloomSpeed: 40,
    hailResistance: 55,
    description: 'Its bloom triggers controlled avalanches that reshape frozen terrain, creating new garden beds.',
    traits: ['hail_feeder', 'kinetic_frost', 'vein_network', 'storm_charge', 'terrain_shift'],
  },
  {
    id: 'hail_orchid_legendary',
    name: 'Skyshatter Orchid',
    species: 'hail_orchid',
    rarity: 'legendary',
    frostPower: 108,
    bloomSpeed: 62,
    hailResistance: 95,
    description: 'The most hail-resistant bloom in existence. When it fully blooms, the sky itself cracks open and rains eternal frost.',
    traits: ['hail_feeder', 'kinetic_frost', 'vein_network', 'storm_charge', 'terrain_shift', 'sky_frost'],
  },

  // ── Glacial Tulip (7) ────────────────────────────────────────
  {
    id: 'glacial_tulip_common',
    name: 'Glacier Tulip',
    species: 'glacial_tulip',
    rarity: 'common',
    frostPower: 9,
    bloomSpeed: 14,
    hailResistance: 8,
    description: 'A hardy tulip with petals of pale blue ice found at the edges of retreating glaciers.',
    traits: ['ice_bloom', 'cold_snap'],
  },
  {
    id: 'glacial_tulip_uncommon',
    name: 'Ice Crystal Tulip',
    species: 'glacial_tulip',
    rarity: 'uncommon',
    frostPower: 19,
    bloomSpeed: 22,
    hailResistance: 15,
    description: 'Each petal is a perfect ice crystal, refracting light into dazzling frozen spectra.',
    traits: ['ice_bloom', 'cold_snap', 'crystal_refraction'],
  },
  {
    id: 'glacial_tulip_rare',
    name: 'Frozen Crown Tulip',
    species: 'glacial_tulip',
    rarity: 'rare',
    frostPower: 36,
    bloomSpeed: 32,
    hailResistance: 28,
    description: 'Tulips that grow in crown-shaped clusters, each one a tiny kingdom of frozen beauty.',
    traits: ['ice_bloom', 'cold_snap', 'crystal_refraction', 'crown_formation'],
  },
  {
    id: 'glacial_tulip_epic',
    name: 'Ice Age Tulip',
    species: 'glacial_tulip',
    rarity: 'epic',
    frostPower: 56,
    bloomSpeed: 44,
    hailResistance: 48,
    description: 'An ancient tulip species from the last ice age. Its bloom temporarily freezes time in a small radius.',
    traits: ['ice_bloom', 'cold_snap', 'crystal_refraction', 'crown_formation', 'time_freeze'],
  },
  {
    id: 'glacial_tulip_legendary',
    name: 'Primordial Glacier Tulip',
    species: 'glacial_tulip',
    rarity: 'legendary',
    frostPower: 106,
    bloomSpeed: 68,
    hailResistance: 82,
    description: 'The first tulip ever to bloom on Earth, preserved in primordial glacier ice for millions of years.',
    traits: ['ice_bloom', 'cold_snap', 'crystal_refraction', 'crown_formation', 'time_freeze', 'primordial_ice'],
  },

  // ── Snow Lily (7) ────────────────────────────────────────────
  {
    id: 'snow_lily_common',
    name: 'Snowdrop Lily',
    species: 'snow_lily',
    rarity: 'common',
    frostPower: 6,
    bloomSpeed: 16,
    hailResistance: 5,
    description: 'A pure white lily that pushes through fresh snow, signaling the start of frost bloom season.',
    traits: ['snow_bloom', 'gentle_frost'],
  },
  {
    id: 'snow_lily_uncommon',
    name: 'Winter Star Lily',
    species: 'snow_lily',
    rarity: 'uncommon',
    frostPower: 15,
    bloomSpeed: 24,
    hailResistance: 10,
    description: 'Petals arranged in a star pattern that captures and stores starlight within frozen cells.',
    traits: ['snow_bloom', 'gentle_frost', 'starlight_storage'],
  },
  {
    id: 'snow_lily_rare',
    name: 'Aurora Lily',
    species: 'snow_lily',
    rarity: 'rare',
    frostPower: 30,
    bloomSpeed: 34,
    hailResistance: 22,
    description: 'A lily that absorbs aurora borealis energy, glowing with shifting colors through the frozen night.',
    traits: ['snow_bloom', 'gentle_frost', 'starlight_storage', 'aurora_absorb'],
  },
  {
    id: 'snow_lily_epic',
    name: 'Midnight Snow Lily',
    species: 'snow_lily',
    rarity: 'epic',
    frostPower: 52,
    bloomSpeed: 46,
    hailResistance: 40,
    description: 'Blooms only at midnight during the winter solstice. Its frost heals all nearby ice plants.',
    traits: ['snow_bloom', 'gentle_frost', 'starlight_storage', 'aurora_absorb', 'midnight_heal'],
  },
  {
    id: 'snow_lily_legendary',
    name: 'Everwhite Lily',
    species: 'snow_lily',
    rarity: 'legendary',
    frostPower: 100,
    bloomSpeed: 72,
    hailResistance: 78,
    description: 'A lily of pure whiteness so perfect it blinds hail itself. Said to bloom only once every thousand years.',
    traits: ['snow_bloom', 'gentle_frost', 'starlight_storage', 'aurora_absorb', 'midnight_heal', 'purity_frost'],
  },

  // ── Permafrost Sunflower (7) ─────────────────────────────────
  {
    id: 'permafrost_sunflower_common',
    name: 'Permafrost Bloom',
    species: 'permafrost_sunflower',
    rarity: 'common',
    frostPower: 11,
    bloomSpeed: 9,
    hailResistance: 12,
    description: 'A small sunflower that generates warmth from permafrost minerals, creating tiny oases of melted ice.',
    traits: ['thermal_frost', 'root_heat'],
  },
  {
    id: 'permafrost_sunflower_uncommon',
    name: 'Ice Cap Sunflower',
    species: 'permafrost_sunflower',
    rarity: 'uncommon',
    frostPower: 22,
    bloomSpeed: 17,
    hailResistance: 18,
    description: 'Its frozen face tracks the faint winter sun, concentrating pale warmth into its frost core.',
    traits: ['thermal_frost', 'root_heat', 'sun_tracking'],
  },
  {
    id: 'permafrost_sunflower_rare',
    name: 'Frozen Flame Sunflower',
    species: 'permafrost_sunflower',
    rarity: 'rare',
    frostPower: 40,
    bloomSpeed: 27,
    hailResistance: 32,
    description: 'A paradox of frost and flame — it burns with cold fire that freezes hail mid-flight.',
    traits: ['thermal_frost', 'root_heat', 'sun_tracking', 'cold_flame'],
  },
  {
    id: 'permafrost_sunflower_epic',
    name: 'Polar Night Sunflower',
    species: 'permafrost_sunflower',
    rarity: 'epic',
    frostPower: 62,
    bloomSpeed: 38,
    hailResistance: 52,
    description: 'Blooms during the polar night, generating its own light to sustain surrounding ice plants.',
    traits: ['thermal_frost', 'root_heat', 'sun_tracking', 'cold_flame', 'self_luminescence'],
  },
  {
    id: 'permafrost_sunflower_legendary',
    name: 'Eternal Frost Sunflower',
    species: 'permafrost_sunflower',
    rarity: 'legendary',
    frostPower: 112,
    bloomSpeed: 60,
    hailResistance: 88,
    description: 'The original sunflower of the ice world. Its frost warmth sustained the first frost spirits through the Great Freeze.',
    traits: ['thermal_frost', 'root_heat', 'sun_tracking', 'cold_flame', 'self_luminescence', 'origin_warmth'],
  },

  // ── Crystal Bonsai (7) ───────────────────────────────────────
  {
    id: 'crystal_bonsai_common',
    name: 'Crystal Sprout',
    species: 'crystal_bonsai',
    rarity: 'common',
    frostPower: 5,
    bloomSpeed: 6,
    hailResistance: 18,
    description: 'A tiny bonsai with crystalline leaves that grow at glacial pace but endure any hailstorm.',
    traits: ['crystal_growth', 'slow_eternal'],
  },
  {
    id: 'crystal_bonsai_uncommon',
    name: 'Frost Bonsai',
    species: 'crystal_bonsai',
    rarity: 'uncommon',
    frostPower: 14,
    bloomSpeed: 10,
    hailResistance: 28,
    description: 'A miniature tree sculpted by frost spirits, its branches forming elegant frozen patterns.',
    traits: ['crystal_growth', 'slow_eternal', 'spirit_shaped'],
  },
  {
    id: 'crystal_bonsai_rare',
    name: 'Diamond Branch Bonsai',
    species: 'crystal_bonsai',
    rarity: 'rare',
    frostPower: 28,
    bloomSpeed: 18,
    hailResistance: 42,
    description: 'Branches of pure diamond-hard ice that ring like crystal chimes in the frozen wind.',
    traits: ['crystal_growth', 'slow_eternal', 'spirit_shaped', 'diamond_ice'],
  },
  {
    id: 'crystal_bonsai_epic',
    name: 'Living Crystal Bonsai',
    species: 'crystal_bonsai',
    rarity: 'epic',
    frostPower: 48,
    bloomSpeed: 28,
    hailResistance: 58,
    description: 'A sentient crystal tree that slowly moves its branches to shelter smaller plants from hail.',
    traits: ['crystal_growth', 'slow_eternal', 'spirit_shaped', 'diamond_ice', 'sentient_shelter'],
  },
  {
    id: 'crystal_bonsai_legendary',
    name: 'World Ice Bonsai',
    species: 'crystal_bonsai',
    rarity: 'legendary',
    frostPower: 95,
    bloomSpeed: 50,
    hailResistance: 100,
    description: 'A miniature world tree made of living crystal ice. It contains an entire frozen ecosystem within its roots.',
    traits: ['crystal_growth', 'slow_eternal', 'spirit_shaped', 'diamond_ice', 'sentient_shelter', 'world_root'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: HG_SPECIES_INFO — Species lore and stat profiles
// ═══════════════════════════════════════════════════════════════════

export interface HgSpeciesInfo {
  readonly id: HgSpeciesType
  readonly name: string
  readonly chineseName: string
  readonly description: string
  readonly baseFrostPower: number
  readonly baseBloomSpeed: number
  readonly baseHailResist: number
  readonly color: string
  readonly emoji: string
  readonly frostSpiritAffinity: number
}

export const HG_SPECIES_INFO: readonly HgSpeciesInfo[] = [
  {
    id: 'ice_rose',
    name: 'Ice Rose',
    chineseName: '冰玫瑰',
    description: 'The foundational frost bloom. Ice roses channel raw frost energy through crystalline petals, making them essential for any Hail Garden. Their thorns can cut through hailstones.',
    baseFrostPower: 10,
    baseBloomSpeed: 12,
    baseHailResist: 8,
    color: HG_FROST_PINK,
    emoji: '🌹',
    frostSpiritAffinity: 0.8,
  },
  {
    id: 'frost_lotus',
    name: 'Frost Lotus',
    chineseName: '霜莲',
    description: 'Sacred bloom of frozen waters. Frost lotuses grow in the coldest ponds and radiate calming frost energy. They are prized by frost spirits for their meditative properties.',
    baseFrostPower: 8,
    baseBloomSpeed: 14,
    baseHailResist: 10,
    color: HG_ICE_BLUE,
    emoji: '🪷',
    frostSpiritAffinity: 1.0,
  },
  {
    id: 'hail_orchid',
    name: 'Hail Orchid',
    chineseName: '雹兰',
    description: 'The most hail-resistant species. Hail orchids feed on impact energy, converting destruction into growth. Their roots form networks that strengthen garden foundations.',
    baseFrostPower: 12,
    baseBloomSpeed: 8,
    baseHailResist: 18,
    color: HG_SHADOW_ICE,
    emoji: '🪻',
    frostSpiritAffinity: 0.6,
  },
  {
    id: 'glacial_tulip',
    name: 'Glacial Tulip',
    chineseName: '冰川郁金香',
    description: 'Blooms at the edges of glaciers. Glacial tulips channel ancient ice memories through their crystal petals, granting nearby blooms wisdom of past ice ages.',
    baseFrostPower: 9,
    baseBloomSpeed: 15,
    baseHailResist: 7,
    color: HG_DEEP_FROST,
    emoji: '🌷',
    frostSpiritAffinity: 0.7,
  },
  {
    id: 'snow_lily',
    name: 'Snow Lily',
    chineseName: '雪百合',
    description: 'The healer of the frost garden. Snow lilies emit a gentle aura that restores health to all nearby blooms. Their starlight absorption makes them glow at night.',
    baseFrostPower: 6,
    baseBloomSpeed: 18,
    baseHailResist: 5,
    color: HG_HAIL_WHITE,
    emoji: '💮',
    frostSpiritAffinity: 0.9,
  },
  {
    id: 'permafrost_sunflower',
    name: 'Permafrost Sunflower',
    chineseName: '永冻向日葵',
    description: 'Paradoxical warmth from eternal cold. Permafrost sunflowers generate thermal frost energy that creates tiny oases where other plants can thrive alongside ice flora.',
    baseFrostPower: 11,
    baseBloomSpeed: 10,
    baseHailResist: 14,
    color: HG_GARDEN_GREEN,
    emoji: '🌻',
    frostSpiritAffinity: 0.5,
  },
  {
    id: 'crystal_bonsai',
    name: 'Crystal Bonsai',
    chineseName: '水晶盆景',
    description: 'Living sculptures of crystal ice. Crystal bonsais grow at glacial pace but achieve extraordinary hail resistance. Ancient specimens are considered sentient by frost spirits.',
    baseFrostPower: 5,
    baseBloomSpeed: 4,
    baseHailResist: 22,
    color: HG_CRYSTAL_PURPLE,
    emoji: '🌲',
    frostSpiritAffinity: 1.2,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: HG_GARDENS — 8 Frozen Garden Chambers
// ═══════════════════════════════════════════════════════════════════

export const HG_GARDENS: readonly HgGardenDef[] = [
  {
    id: 'garden_crystalline_entrance',
    name: 'Crystalline Entrance Hall',
    description: 'The grand entrance to the Hail Garden, where ice columns frame paths of frosted marble and perpetual light snow drifts.',
    unlockLevel: 1,
    capacity: 4,
    frostBonus: 5,
    hailIntensity: 1,
    bgGradient: 'linear-gradient(180deg, #E3F2FD 0%, #81D4FA 50%, #F48FB1 100%)',
  },
  {
    id: 'garden_frost_veil_greenhouse',
    name: 'Frost Veil Greenhouse',
    description: 'A greenhouse enclosed in shimmering frost veils that filter hail while letting nourishing frost light reach the blooms.',
    unlockLevel: 3,
    capacity: 6,
    frostBonus: 12,
    hailIntensity: 2,
    bgGradient: 'linear-gradient(180deg, #81D4FA 0%, #A5D6A7 50%, #E3F2FD 100%)',
  },
  {
    id: 'garden_hailstone_terrace',
    name: 'Hailstone Terrace',
    description: 'An open-air terrace where hailstones are cultivated as nutrients. Hardy blooms thrive in the constant bombardment.',
    unlockLevel: 6,
    capacity: 5,
    frostBonus: 8,
    hailIntensity: 5,
    bgGradient: 'linear-gradient(180deg, #E3F2FD 0%, #90CAF9 50%, #4DD0E1 100%)',
  },
  {
    id: 'garden_permafrost_root_cellar',
    name: 'Permafrost Root Cellar',
    description: 'A deep cellar carved from ancient permafrost, where the most delicate frost blooms are preserved in suspended animation.',
    unlockLevel: 10,
    capacity: 8,
    frostBonus: 20,
    hailIntensity: 0,
    bgGradient: 'linear-gradient(180deg, #4DD0E1 0%, #81D4FA 50%, #CE93D8 100%)',
  },
  {
    id: 'garden_ice_bloom_conservatory',
    name: 'Ice Bloom Conservatory',
    description: 'A soaring glass-domed conservatory where rare ice blooms from every frozen corner of the world are displayed in perpetual bloom.',
    unlockLevel: 15,
    capacity: 10,
    frostBonus: 25,
    hailIntensity: 1,
    bgGradient: 'linear-gradient(180deg, #F48FB1 0%, #E3F2FD 50%, #A5D6A7 100%)',
  },
  {
    id: 'garden_glacier_crystal_grotto',
    name: 'Glacier Crystal Grotto',
    description: 'A hidden grotto within a living glacier, where crystal formations amplify frost power to extraordinary levels.',
    unlockLevel: 22,
    capacity: 12,
    frostBonus: 35,
    hailIntensity: 3,
    bgGradient: 'linear-gradient(180deg, #CE93D8 0%, #4DD0E1 50%, #81D4FA 100%)',
  },
  {
    id: 'garden_eternal_frost_sanctuary',
    name: 'Eternal Frost Sanctuary',
    description: 'The sacred heart of the garden, where frost spirits commune and the oldest blooms have grown for millennia.',
    unlockLevel: 30,
    capacity: 15,
    frostBonus: 50,
    hailIntensity: 2,
    bgGradient: 'linear-gradient(180deg, #80CBC4 0%, #CE93D8 50%, #F48FB1 100%)',
  },
  {
    id: 'garden_frozen_heart_throne',
    name: 'Frozen Heart Throne Room',
    description: 'The innermost chamber where the Frozen Heart Rose once bloomed. Only Garden Eternal may enter and tend this sacred ground.',
    unlockLevel: 40,
    capacity: 20,
    frostBonus: 80,
    hailIntensity: 0,
    bgGradient: 'linear-gradient(180deg, #F48FB1 0%, #CE93D8 25%, #81D4FA 50%, #A5D6A7 75%, #E3F2FD 100%)',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: HG_MATERIALS — 30 Ice/Frost Materials
// ═══════════════════════════════════════════════════════════════════

export const HG_MATERIALS: readonly HgMaterialDef[] = [
  // Common (8)
  { id: 'mat_hail_gem', name: 'Hail Gem', emoji: '💎', type: 'gem', rarity: 'common', frostBonus: 2, value: 10, description: 'A small gem formed by compressed hailstones under glacial pressure.' },
  { id: 'mat_frost_petal', name: 'Frost Petal', emoji: '🌸', type: 'petal', rarity: 'common', frostBonus: 1, value: 8, description: 'A petal from a common frost bloom, still cold to the touch.' },
  { id: 'mat_ice_nectar', name: 'Ice Nectar', emoji: '🍯', type: 'nectar', rarity: 'common', frostBonus: 3, value: 12, description: 'Sweet liquid extracted from frozen flower centers. Popular with frost spirits.' },
  { id: 'mat_snowdust', name: 'Snowdust', emoji: '✨', type: 'shard', rarity: 'common', frostBonus: 1, value: 6, description: 'Fine crystalline powder harvested from fresh snowfall.' },
  { id: 'mat_glacier_shard', name: 'Glacier Shard', emoji: '🧊', type: 'shard', rarity: 'common', frostBonus: 2, value: 11, description: 'A shard of blue glacial ice with trapped ancient air bubbles.' },
  { id: 'mat_crystal_dew', name: 'Crystal Dew', emoji: '💧', type: 'nectar', rarity: 'common', frostBonus: 2, value: 9, description: 'Dewdrops that crystallize at dawn on frost bloom petals.' },
  { id: 'mat_frost_thread', name: 'Frost Thread', emoji: '🧵', type: 'petal', rarity: 'common', frostBonus: 1, value: 7, description: 'Delicate threads of ice spun by frost spiders in the greenhouse rafters.' },
  { id: 'mat_permafrost_pebble', name: 'Permafrost Pebble', emoji: '⚫', type: 'shard', rarity: 'common', frostBonus: 3, value: 13, description: 'A smooth pebble from deep permafrost, radiating ancient cold.' },

  // Uncommon (7)
  { id: 'mat_frozen_rose_petal', name: 'Frozen Rose Petal', emoji: '🌹', type: 'petal', rarity: 'uncommon', frostBonus: 5, value: 65, description: 'A perfect rose petal preserved in eternal frost. Glows faint pink in moonlight.' },
  { id: 'mat_frost_lotus_seed', name: 'Frost Lotus Seed', emoji: '🌱', type: 'gem', rarity: 'uncommon', frostBonus: 6, value: 70, description: 'A seed from the frost lotus, capable of growing in any frozen water.' },
  { id: 'mat_ice_orchid_spore', name: 'Ice Orchid Spore', emoji: '🍄', type: 'petal', rarity: 'uncommon', frostBonus: 4, value: 60, description: 'Spores that germinate during hailstorms, turning impacts into new blooms.' },
  { id: 'mat_glacial_bulb', name: 'Glacial Tulip Bulb', emoji: '🪩', type: 'gem', rarity: 'uncommon', frostBonus: 7, value: 75, description: 'A bulb from a glacial tulip containing concentrated ice crystal energy.' },
  { id: 'mat_snow_lily_extract', name: 'Snow Lily Extract', emoji: '🧪', type: 'nectar', rarity: 'uncommon', frostBonus: 8, value: 80, description: 'A purified extract with gentle healing properties for damaged ice plants.' },
  { id: 'mat_permafrost_core', name: 'Permafrost Core', emoji: '🔵', type: 'shard', rarity: 'uncommon', frostBonus: 6, value: 72, description: 'The dense core of permafrost, rich in mineralized frost energy.' },
  { id: 'mat_crystal_bonsai_sapling', name: 'Crystal Bonsai Sapling', emoji: '🌳', type: 'gem', rarity: 'uncommon', frostBonus: 5, value: 68, description: 'A tiny living crystal sapling that can be trained into a bonsai over decades.' },

  // Rare (6)
  { id: 'mat_hailstorm_essence', name: 'Hailstorm Essence', emoji: '⛈️', type: 'essence', rarity: 'rare', frostBonus: 15, value: 300, description: 'Bottled energy from a raging hailstorm. Extremely potent frost catalyst.' },
  { id: 'mat_glacier_heart_crystal', name: 'Glacier Heart Crystal', emoji: '💠', type: 'gem', rarity: 'rare', frostBonus: 18, value: 350, description: 'A crystal harvested from the very heart of a living glacier.' },
  { id: 'mat_frost_weaver_silk', name: 'Frost Weaver Silk', emoji: '🕸️', type: 'petal', rarity: 'rare', frostBonus: 12, value: 280, description: 'Silk woven by frost weaver spirits. Used to bind frost enchantments.' },
  { id: 'mat_eternal_ice_fang', name: 'Eternal Ice Fang', emoji: '🦷', type: 'shard', rarity: 'rare', frostBonus: 16, value: 320, description: 'A fang of unmelting ice from an ancient frost guardian.' },
  { id: 'mat_blizzard_soul_shard', name: 'Blizzard Soul Shard', emoji: '❄️', type: 'essence', rarity: 'rare', frostBonus: 14, value: 340, description: 'A fragment of a blizzard spirit, pulsing with chaotic frozen energy.' },
  { id: 'mat_permafrost_amber', name: 'Permafrost Amber', emoji: '🟠', type: 'relic_shard', rarity: 'rare', frostBonus: 20, value: 400, description: 'Ancient amber preserved in permafrost for eons. Contains fossilized frost magic.' },

  // Epic (5)
  { id: 'mat_crystal_tree_sap', name: 'Crystal Tree Sap', emoji: '🌳', type: 'essence', rarity: 'epic', frostBonus: 30, value: 1200, description: 'Living sap from the World Ice Bonsai. Each drop contains a miniature frozen ecosystem.' },
  { id: 'mat_aurora_ice_blossom', name: 'Aurora Ice Blossom', emoji: '🌌', type: 'petal', rarity: 'epic', frostBonus: 28, value: 1400, description: 'A bloom that has absorbed aurora energy. Shifts colors constantly.' },
  { id: 'mat_frozen_time_dew', name: 'Frozen Time Dew', emoji: '⏳', type: 'nectar', rarity: 'epic', frostBonus: 35, value: 1500, description: 'Dewdrops in which time itself has frozen. A single drop can age a bloom millennia in seconds.' },
  { id: 'mat_hail_god_tear', name: 'Hail God Tear', emoji: '💧', type: 'relic_shard', rarity: 'epic', frostBonus: 32, value: 1600, description: 'A crystalline tear from the Hail God. Radiates overwhelming frost power.' },
  { id: 'mat_ice_spirit_essence', name: 'Ice Spirit Essence', emoji: '👻', type: 'essence', rarity: 'epic', frostBonus: 25, value: 1300, description: 'Pure essence distilled from a frost spirit. Grants temporary sentience to ice structures.' },

  // Legendary (4)
  { id: 'mat_world_frost_seed', name: 'World Frost Seed', emoji: '🌍', type: 'relic_shard', rarity: 'legendary', frostBonus: 60, value: 8000, description: 'The seed from which the first frost flora grew. Contains the blueprint of all ice life.' },
  { id: 'mat_eternal_garden_heart', name: 'Eternal Garden Heart', emoji: '💚', type: 'relic_shard', rarity: 'legendary', frostBonus: 70, value: 10000, description: 'The crystallized heart of the Hail Garden itself. It beats once every century.' },
  { id: 'mat_primeval_hail_crystal', name: 'Primeval Hail Crystal', emoji: '🔶', type: 'gem', rarity: 'legendary', frostBonus: 55, value: 9000, description: 'A crystal from the first hailstorm ever to fall on Earth. Still crackling with creation energy.' },
  { id: 'mat_genesis_ice_flower', name: 'Genesis Ice Flower', emoji: '🌺', type: 'relic_shard', rarity: 'legendary', frostBonus: 65, value: 11000, description: 'The flower that created ice. Its petals are the reason the world knows cold.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: HG_STRUCTURES — 25 Garden Structures
// ═══════════════════════════════════════════════════════════════════

export const HG_STRUCTURES: readonly HgStructureDef[] = [
  // ── Greenhouses (5) ──────────────────────────────────────────
  { id: 'str_frost_greenhouse', name: 'Frost Greenhouse', emoji: '🏡', category: 'greenhouse', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 50, costMultiplier: 1.4, requiredLevel: 1, description: 'A basic frost-pane greenhouse that accelerates bloom growth by filtering hail.' },
  { id: 'str_crystal_greenhouse', name: 'Crystal Greenhouse', emoji: '💎', category: 'greenhouse', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, requiredLevel: 5, description: 'Greenhouse walls of living crystal that amplify ambient frost light for faster blooming.' },
  { id: 'str_glacier_greenhouse', name: 'Glacier Greenhouse', emoji: '🏔️', category: 'greenhouse', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, requiredLevel: 12, description: 'Carved from a glacier, this greenhouse maintains perfect sub-zero conditions year-round.' },
  { id: 'str_eternal_greenhouse', name: 'Eternal Greenhouse', emoji: '♾️', category: 'greenhouse', maxLevel: 10, baseEffect: 12, effectPerLevel: 5, baseCost: 500, costMultiplier: 1.7, requiredLevel: 22, description: 'A greenhouse that exists outside time. Blooms inside age neither forward nor backward.' },
  { id: 'str_world_ice_greenhouse', name: 'World Ice Greenhouse', emoji: '🌍', category: 'greenhouse', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 1000, costMultiplier: 1.8, requiredLevel: 35, description: 'The ultimate greenhouse. Its ice walls connect to every frozen biome on Earth simultaneously.' },

  // ── Domes (3) ────────────────────────────────────────────────
  { id: 'str_hail_dome', name: 'Hail Dome', emoji: '⛲', category: 'dome', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 80, costMultiplier: 1.5, requiredLevel: 3, description: 'A dome that converts incoming hail into nourishing frost energy for your garden.' },
  { id: 'str_blizzard_dome', name: 'Blizzard Dome', emoji: '🌪️', category: 'dome', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 200, costMultiplier: 1.6, requiredLevel: 10, description: 'Channels blizzard energy into the garden, dramatically boosting hail resistance of all blooms.' },
  { id: 'str_aurora_dome', name: 'Aurora Dome', emoji: '🌌', category: 'dome', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 400, costMultiplier: 1.7, requiredLevel: 20, description: 'A shimmering dome that captures aurora energy, providing spectral light for legendary blooms.' },

  // ── Fountains (3) ────────────────────────────────────────────
  { id: 'str_crystal_fountain', name: 'Crystal Fountain', emoji: '⛲', category: 'fountain', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 60, costMultiplier: 1.4, requiredLevel: 2, description: 'A fountain of liquid crystal that waters frost blooms with mineral-rich frozen droplets.' },
  { id: 'str_frost_fountain', name: 'Frost Fountain', emoji: '🧊', category: 'fountain', maxLevel: 10, baseEffect: 7, effectPerLevel: 3, baseCost: 150, costMultiplier: 1.5, requiredLevel: 8, description: 'Sprays a fine mist of supercooled water that accelerates bloom growth by 50%.' },
  { id: 'str_eternal_frost_fountain', name: 'Eternal Frost Fountain', emoji: '💧', category: 'fountain', maxLevel: 10, baseEffect: 14, effectPerLevel: 6, baseCost: 350, costMultiplier: 1.7, requiredLevel: 18, description: 'Draws water from an infinite permafrost aquifer. Never runs dry, never thaws.' },

  // ── Altars (3) ───────────────────────────────────────────────
  { id: 'str_ice_altar', name: 'Ice Altar', emoji: '⛩️', category: 'altar', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, requiredLevel: 4, description: 'An altar where frost spirits gather to bless new plantings with increased frost power.' },
  { id: 'str_crystal_altar', name: 'Crystal Altar', emoji: '💠', category: 'altar', maxLevel: 10, baseEffect: 9, effectPerLevel: 4, baseCost: 220, costMultiplier: 1.6, requiredLevel: 12, description: 'A crystalline altar that resonates with ice plant frequencies, boosting bloom quality.' },
  { id: 'str_hail_god_altar', name: 'Hail God Altar', emoji: '⚡', category: 'altar', maxLevel: 10, baseEffect: 16, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.8, requiredLevel: 28, description: 'The sacred altar of the Hail God. Offerings here grant divine frost protection to all gardens.' },

  // ── Storage (3) ──────────────────────────────────────────────
  { id: 'str_permafrost_storage', name: 'Permafrost Storage', emoji: '🗄️', category: 'storage', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 40, costMultiplier: 1.3, requiredLevel: 1, description: 'A frozen vault for storing harvested materials and frost essences at perfect preservation temperature.' },
  { id: 'str_glacier_vault', name: 'Glacier Vault', emoji: '🏦', category: 'storage', maxLevel: 10, baseEffect: 20, effectPerLevel: 8, baseCost: 180, costMultiplier: 1.5, requiredLevel: 14, description: 'A vast vault within a glacier that can store unlimited frost materials without degradation.' },
  { id: 'str_eternal_vault', name: 'Eternal Vault', emoji: '🔐', category: 'storage', maxLevel: 10, baseEffect: 35, effectPerLevel: 12, baseCost: 450, costMultiplier: 1.7, requiredLevel: 25, description: 'A vault existing in a pocket of frozen time. Items stored here are preserved forever.' },

  // ── Nurseries (3) ────────────────────────────────────────────
  { id: 'str_frost_nursery', name: 'Frost Nursery', emoji: '🌱', category: 'nursery', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 70, costMultiplier: 1.4, requiredLevel: 2, description: 'A sheltered nursery where seedlings are nurtured until strong enough for the garden.' },
  { id: 'str_crystal_nursery', name: 'Crystal Nursery', emoji: '💎', category: 'nursery', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 160, costMultiplier: 1.6, requiredLevel: 10, description: 'Crystal walls provide perfect growing conditions for rare and epic frost bloom seedlings.' },
  { id: 'str_legendary_nursery', name: 'Legendary Nursery', emoji: '🌟', category: 'nursery', maxLevel: 10, baseEffect: 14, effectPerLevel: 6, baseCost: 400, costMultiplier: 1.7, requiredLevel: 22, description: 'Only legendary seedlings can survive in this nursery. Its conditions cannot be replicated elsewhere.' },

  // ── Monuments (5) ────────────────────────────────────────────
  { id: 'str_frost_beacon', name: 'Frost Beacon', emoji: '📡', category: 'monument', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 90, costMultiplier: 1.5, requiredLevel: 5, description: 'A beacon of frost light that guides lost frost spirits back to the garden.' },
  { id: 'str_ice_sculpture_garden', name: 'Ice Sculpture Garden', emoji: '🗿', category: 'monument', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 180, costMultiplier: 1.5, requiredLevel: 10, description: 'Magnificent ice sculptures that inspire blooms to grow stronger and more beautiful.' },
  { id: 'str_hailstone_tower', name: 'Hailstone Watchtower', emoji: '🗼', category: 'monument', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, requiredLevel: 18, description: 'A tall tower from which you can observe incoming hail patterns and prepare your garden.' },
  { id: 'str_eternal_frost_monument', name: 'Eternal Frost Monument', emoji: '🏛️', category: 'monument', maxLevel: 10, baseEffect: 20, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.8, requiredLevel: 30, description: 'A monument to all who have tended the Hail Garden. Radiates permanent frost blessing.' },
  { id: 'str_garden_eternal_sanctuary', name: 'Garden Eternal Sanctuary', emoji: '👑', category: 'monument', maxLevel: 10, baseEffect: 30, effectPerLevel: 12, baseCost: 1000, costMultiplier: 2.0, requiredLevel: 40, description: 'The ultimate structure. A sanctuary so powerful it transforms the entire garden into an eternal paradise of frost.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: HG_ABILITIES — 22 Frost Abilities
// ═══════════════════════════════════════════════════════════════════

export const HG_ABILITIES: readonly HgAbilityDef[] = [
  // ── Active Abilities (10) ────────────────────────────────────
  { id: 'ability_hail_barrage', name: 'Hail Barrage', emoji: '⛈️', species: 'hail_orchid', type: 'active', rarity: 'common', energyCost: 10, cooldown: 5, power: 15, requiredLevel: 1, description: 'Launch a barrage of ice hailstones at a target, dealing frost damage.' },
  { id: 'ability_frost_bloom', name: 'Frost Bloom', emoji: '🌸', species: 'ice_rose', type: 'active', rarity: 'common', energyCost: 8, cooldown: 8, power: 12, requiredLevel: 1, description: 'Trigger rapid blooming in a target ice plant, boosting its frost power temporarily.' },
  { id: 'ability_ice_shield', name: 'Ice Shield', emoji: '🛡️', species: 'crystal_bonsai', type: 'active', rarity: 'common', energyCost: 12, cooldown: 15, power: 20, requiredLevel: 1, description: 'Encase a bloom in a protective ice shield, doubling its hail resistance for a time.' },
  { id: 'ability_glacier_crush', name: 'Glacier Crush', emoji: '🏔️', species: 'glacial_tulip', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 10, power: 35, requiredLevel: 5, description: 'Summon a massive glacier chunk to crush threats and fertilize garden soil with mineral ice.' },
  { id: 'ability_blizzard_call', name: 'Blizzard Call', emoji: '🌬️', species: 'hail_orchid', type: 'active', rarity: 'uncommon', energyCost: 25, cooldown: 20, power: 40, requiredLevel: 8, description: 'Call forth a localized blizzard that accelerates all bloom growth in one garden.' },
  { id: 'ability_frost_tendril', name: 'Frost Tendril', emoji: '🌿', species: 'frost_lotus', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 8, power: 28, requiredLevel: 5, description: 'Extend frost tendrils from lotus roots to connect and share nutrients between blooms.' },
  { id: 'ability_ice_nova', name: 'Ice Nova', emoji: '💥', species: 'ice_rose', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 15, power: 55, requiredLevel: 12, description: 'Release an expanding ring of ice crystals that heals friendly blooms and freezes threats.' },
  { id: 'ability_crystal_growth', name: 'Crystal Growth', emoji: '💎', species: 'crystal_bonsai', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 25, power: 50, requiredLevel: 15, description: 'Accelerate crystal bonsai growth by decades in seconds, instantly upgrading a bonsai bloom.' },
  { id: 'ability_permafrost_wall', name: 'Permafrost Wall', emoji: '🧱', species: 'permafrost_sunflower', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 30, power: 48, requiredLevel: 15, description: 'Raise an impenetrable wall of permafrost to protect an entire garden from hailstorms.' },
  { id: 'ability_frozen_lance', name: 'Frozen Lance', emoji: '🔱', species: 'glacial_tulip', type: 'active', rarity: 'rare', energyCost: 32, cooldown: 12, power: 52, requiredLevel: 12, description: 'Form a lance of pure ice and launch it with pinpoint accuracy at any threat.' },

  // ── Passive Abilities (8) ────────────────────────────────────
  { id: 'ability_frost_heal', name: 'Frost Heal', emoji: '💚', species: 'snow_lily', type: 'passive', rarity: 'common', energyCost: 0, cooldown: 0, power: 5, requiredLevel: 1, description: 'Snow lilies passively regenerate the health of all nearby frost blooms over time.' },
  { id: 'ability_hail_resonance', name: 'Hail Resonance', emoji: '〰️', species: 'hail_orchid', type: 'passive', rarity: 'uncommon', energyCost: 0, cooldown: 0, power: 10, requiredLevel: 5, description: 'Hail orchids convert ambient hail impact vibrations into a permanent frost power bonus.' },
  { id: 'ability_aurora_glow', name: 'Aurora Glow', emoji: '🌈', species: 'snow_lily', type: 'passive', rarity: 'uncommon', energyCost: 0, cooldown: 0, power: 12, requiredLevel: 8, description: 'Snow lilies emit aurora light that increases bloom speed of all garden plants.' },
  { id: 'ability_crystal_resonance', name: 'Crystal Resonance', emoji: '🔔', species: 'crystal_bonsai', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 20, requiredLevel: 12, description: 'Crystal bonsais emit harmonic frequencies that boost hail resistance of all nearby blooms.' },
  { id: 'ability_frost_spirit_bond', name: 'Frost Spirit Bond', emoji: '👻', species: 'ice_rose', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 18, requiredLevel: 15, description: 'Ice roses attract friendly frost spirits that passively tend your garden.' },
  { id: 'ability_glacial_memory', name: 'Glacial Memory', emoji: '🧠', species: 'glacial_tulip', type: 'passive', rarity: 'epic', energyCost: 0, cooldown: 0, power: 30, requiredLevel: 22, description: 'Glacial tulips remember the optimal growing conditions and share this knowledge with all blooms.' },
  { id: 'ability_eternal_bloom_aura', name: 'Eternal Bloom Aura', emoji: '✨', species: 'frost_lotus', type: 'passive', rarity: 'epic', energyCost: 0, cooldown: 0, power: 35, requiredLevel: 25, description: 'Frost lotuses radiate an aura that prevents any bloom from withering or losing health.' },
  { id: 'ability_world_ice_connection', name: 'World Ice Connection', emoji: '🌐', species: 'permafrost_sunflower', type: 'passive', rarity: 'epic', energyCost: 0, cooldown: 0, power: 28, requiredLevel: 28, description: 'Permafrost sunflowers connect to the planet\'s ice network, drawing global frost energy to your garden.' },

  // ── Ultimate Abilities (4) ───────────────────────────────────
  { id: 'ability_frost_spirit_summon', name: 'Frost Spirit Summon', emoji: '👁️', species: 'ice_rose', type: 'ultimate', rarity: 'epic', energyCost: 60, cooldown: 120, power: 80, requiredLevel: 20, description: 'Summon a powerful frost spirit to tend your entire garden for a limited time, boosting all stats.' },
  { id: 'ability_eternal_freeze', name: 'Eternal Freeze', emoji: '❄️', species: 'snow_lily', type: 'ultimate', rarity: 'epic', energyCost: 70, cooldown: 150, power: 90, requiredLevel: 25, description: 'Freeze an entire garden chamber in perfect stasis. Blooms are preserved at peak bloom indefinitely.' },
  { id: 'ability_hail_judgment', name: 'Hail Judgment', emoji: '⚖️', species: 'hail_orchid', type: 'ultimate', rarity: 'legendary', energyCost: 100, cooldown: 300, power: 150, requiredLevel: 35, description: 'Call upon the Hail God to unleash the ultimate hailstorm, reshaping the garden and empowering every bloom.' },
  { id: 'ability_ice_age_ultimatum', name: 'Ice Age Ultimatum', emoji: '🌍', species: 'permafrost_sunflower', type: 'ultimate', rarity: 'legendary', energyCost: 120, cooldown: 600, power: 200, requiredLevel: 45, description: 'Trigger a miniature ice age centered on your garden. All blooms reach legendary status for a brief, glorious moment.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: HG_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const HG_ACHIEVEMENTS: readonly HgAchievementDef[] = [
  { id: 'ach_first_frost_bloom', name: 'First Frost Bloom', emoji: '🌱', description: 'Plant your very first frost bloom in the Hail Garden.', condition: 'totalBloomsPlanted', targetValue: 1, rewardFrostPower: 10, rewardHailEnergy: 5 },
  { id: 'ach_garden_sprout', name: 'Garden Sprout', emoji: '🌿', description: 'Claim your first frozen garden chamber.', condition: 'totalGardensClaimed', targetValue: 1, rewardFrostPower: 15, rewardHailEnergy: 10 },
  { id: 'ach_hail_survivor', name: 'Hail Survivor', emoji: '⛈️', description: 'Survive 10 hail strikes without losing any blooms.', condition: 'totalHailStrikes', targetValue: 10, rewardFrostPower: 25, rewardHailEnergy: 15 },
  { id: 'ach_crystal_collector', name: 'Crystal Collector', emoji: '💎', description: 'Collect 50 ice/frost materials from the garden.', condition: 'totalMaterialsCollected', targetValue: 50, rewardFrostPower: 30, rewardHailEnergy: 20 },
  { id: 'ach_frost_master', name: 'Frost Master', emoji: '❄️', description: 'Reach level 10 in the Hail Garden.', condition: 'level', targetValue: 10, rewardFrostPower: 50, rewardHailEnergy: 30 },
  { id: 'ach_permafrost_pioneer', name: 'Permafrost Pioneer', emoji: '🏔️', description: 'Claim the Permafrost Root Cellar garden chamber.', condition: 'gardenClaimed', targetValue: 1, rewardFrostPower: 40, rewardHailEnergy: 25 },
  { id: 'ach_blizzard_tamer', name: 'Blizzard Tamer', emoji: '🌪️', description: 'Use 20 frost abilities during blizzard events.', condition: 'totalAbilityCasts', targetValue: 20, rewardFrostPower: 45, rewardHailEnergy: 30 },
  { id: 'ach_ice_architect', name: 'Ice Architect', emoji: '🏛️', description: 'Build 10 garden structures across all categories.', condition: 'totalStructuresBuilt', targetValue: 10, rewardFrostPower: 60, rewardHailEnergy: 35 },
  { id: 'ach_garden_expansion', name: 'Garden Expansion', emoji: '🗺️', description: 'Claim 5 different garden chambers.', condition: 'totalGardensClaimed', targetValue: 5, rewardFrostPower: 55, rewardHailEnergy: 40 },
  { id: 'ach_material_hoarder', name: 'Material Hoarder', emoji: '🗄️', description: 'Accumulate 200 total materials in your inventory.', condition: 'totalInventoryCount', targetValue: 200, rewardFrostPower: 35, rewardHailEnergy: 25 },
  { id: 'ach_hail_connoisseur', name: 'Hail Connoisseur', emoji: ' knows:', description: 'Own frost blooms from all 7 species.', condition: 'uniqueSpeciesOwned', targetValue: 7, rewardFrostPower: 80, rewardHailEnergy: 50 },
  { id: 'ach_frost_spirit_friend', name: 'Frost Spirit Friend', emoji: '👻', description: 'Activate 5 legendary relics to befriend frost spirits.', condition: 'totalRelicsActivated', targetValue: 5, rewardFrostPower: 70, rewardHailEnergy: 45 },
  { id: 'ach_artifact_hunter', name: 'Artifact Hunter', emoji: '🔍', description: 'Discover and collect 10 legendary artifacts.', condition: 'artifactCount', targetValue: 10, rewardFrostPower: 90, rewardHailEnergy: 55 },
  { id: 'ach_crystal_garden_master', name: 'Crystal Garden Master', emoji: '👑', description: 'Have 20 frost blooms growing simultaneously across all gardens.', condition: 'activeBloomCount', targetValue: 20, rewardFrostPower: 100, rewardHailEnergy: 60 },
  { id: 'ach_eternal_frost_guardian', name: 'Eternal Frost Guardian', emoji: '🛡️', description: 'Reach level 30 and protect your garden through 50 hail events.', condition: 'levelAndEvents', targetValue: 50, rewardFrostPower: 150, rewardHailEnergy: 80 },
  { id: 'ach_hail_god_favor', name: 'Hail God\'s Favor', emoji: '⚡', description: 'Obtain the Hail God\'s Chalice artifact.', condition: 'specificArtifact', targetValue: 1, rewardFrostPower: 200, rewardHailEnergy: 100 },
  { id: 'ach_all_species_bloomed', name: 'All Species Bloomed', emoji: '🌺', description: 'Plant at least one bloom of every species at rare rarity or above.', condition: 'allSpeciesRare', targetValue: 7, rewardFrostPower: 180, rewardHailEnergy: 90 },
  { id: 'ach_garden_eternal', name: 'Garden Eternal', emoji: '🌟', description: 'Achieve the title of Garden Eternal. You have mastered the Hail Garden completely.', condition: 'maxTitle', targetValue: 1, rewardFrostPower: 500, rewardHailEnergy: 250 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: HG_TITLES — 8 Titles (Seed Planter → Garden Eternal)
// ═══════════════════════════════════════════════════════════════════

export const HG_TITLES: readonly HgTitleDef[] = [
  { id: 'title_seed_planter', name: 'Seed Planter', emoji: '🌱', minLevel: 1, minBlooms: 0, description: 'A newcomer to the Hail Garden. You have planted your first frost seed in frozen soil.' },
  { id: 'title_frost_sprout', name: 'Frost Sprout', emoji: '🌿', minLevel: 5, minBlooms: 3, description: 'Your first blooms have sprouted. The frost spirits have taken notice of your dedication.' },
  { id: 'title_ice_gardener', name: 'Ice Gardener', emoji: '❄️', minLevel: 10, minBlooms: 8, description: 'A skilled tender of ice flora. Your garden blooms even in the fiercest hailstorms.' },
  { id: 'title_hail_tender', name: 'Hail Tender', emoji: '⛈️', minLevel: 18, minBlooms: 15, description: 'You have learned to coax beauty from hail itself. The garden thrives under your care.' },
  { id: 'title_crystal_cultivator', name: 'Crystal Cultivator', emoji: '💎', minLevel: 25, minBlooms: 22, description: 'Master of crystal bonsai and frost architecture. Your garden is a wonder of frozen art.' },
  { id: 'title_glacier_warden', name: 'Glacier Warden', emoji: '🏔️', minLevel: 32, minBlooms: 28, description: 'Guardian of the glacier chambers. Ancient frost spirits bow to your authority.' },
  { id: 'title_frost_sovereign', name: 'Frost Sovereign', emoji: '👑', minLevel: 40, minBlooms: 33, description: 'Ruler of all frozen gardens. Your word shapes the very ice that sustains this world.' },
  { id: 'title_garden_eternal', name: 'Garden Eternal', emoji: '🌟', minLevel: 50, minBlooms: 35, description: 'The ultimate title. You have achieved what frost spirits whisper of: a garden that will bloom for all eternity.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: HG_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const HG_ARTIFACTS: readonly HgArtifactDef[] = [
  { id: 'art_frozen_heart_scepter', name: 'Frozen Heart Scepter', emoji: '🪄', rarity: 'rare', species: 'ice_rose', frostBoost: 15, energyBoost: 10, bloomBoost: 5, value: 400, description: 'A scepter with a frozen heart crystal at its tip. Channels rose frost into all garden blooms.' },
  { id: 'art_crystal_frost_crown', name: 'Crystal Frost Crown', emoji: '👑', rarity: 'epic', species: 'crystal_bonsai', frostBoost: 25, energyBoost: 15, bloomBoost: 10, value: 1200, description: 'A crown of living crystal that resonates with every ice plant in your garden.' },
  { id: 'art_hail_god_chalice', name: 'Hail God\'s Chalice', emoji: '🏆', rarity: 'legendary', species: 'hail_orchid', frostBoost: 50, energyBoost: 30, bloomBoost: 20, value: 5000, description: 'The sacred chalice of the Hail God. Drinking from it grants divine frost power.' },
  { id: 'art_eternal_ice_seed', name: 'Eternal Ice Seed', emoji: '🌱', rarity: 'epic', species: 'frost_lotus', frostBoost: 20, energyBoost: 20, bloomBoost: 15, value: 1000, description: 'A seed that never dies and never stops growing. Planting it empowers all lotus species.' },
  { id: 'art_permafrost_key', name: 'Permafrost Key', emoji: '🗝️', rarity: 'rare', species: 'permafrost_sunflower', frostBoost: 12, energyBoost: 8, bloomBoost: 8, value: 350, description: 'An ancient key carved from permafrost that unlocks hidden garden chambers.' },
  { id: 'art_blizzard_breath_amulet', name: 'Blizzard\'s Breath Amulet', emoji: '📿', rarity: 'rare', species: 'hail_orchid', frostBoost: 14, energyBoost: 12, bloomBoost: 6, value: 380, description: 'An amulet containing the captured breath of a blizzard. Wards off extreme hail.' },
  { id: 'art_crystal_garden_blueprints', name: 'Crystal Garden Blueprints', emoji: '📜', rarity: 'uncommon', species: 'crystal_bonsai', frostBoost: 8, energyBoost: 5, bloomBoost: 10, value: 180, description: 'Blueprints for building crystal structures of extraordinary beauty and function.' },
  { id: 'art_frost_spirit_lantern', name: 'Frost Spirit Lantern', emoji: '🏮', rarity: 'uncommon', species: 'snow_lily', frostBoost: 6, energyBoost: 8, bloomBoost: 4, value: 150, description: 'A lantern that attracts friendly frost spirits to illuminate and tend your garden.' },
  { id: 'art_glacier_timepiece', name: 'Glacier Timepiece', emoji: '⌚', rarity: 'epic', species: 'glacial_tulip', frostBoost: 22, energyBoost: 18, bloomBoost: 12, value: 1100, description: 'A watch made from glacial ice that runs backward. Slows bloom aging dramatically.' },
  { id: 'art_ice_age_relic', name: 'Ice Age Relic', emoji: '🏺', rarity: 'legendary', species: 'glacial_tulip', frostBoost: 45, energyBoost: 25, bloomBoost: 18, value: 4500, description: 'A relic from the last ice age containing the compressed frost power of millennia.' },
  { id: 'art_aurora_ice_crown', name: 'Aurora Ice Crown', emoji: '🌈', rarity: 'legendary', species: 'snow_lily', frostBoost: 48, energyBoost: 28, bloomBoost: 22, value: 4800, description: 'A crown woven from aurora light and eternal ice. Grants sight of all frost spectra.' },
  { id: 'art_hailstone_compass', name: 'Hailstone Compass', emoji: '🧭', rarity: 'uncommon', species: 'hail_orchid', frostBoost: 7, energyBoost: 6, bloomBoost: 5, value: 120, description: 'A compass that points toward the richest hail deposits and rare bloom locations.' },
  { id: 'art_frozen_world_seed', name: 'Frozen World Seed', emoji: '🌍', rarity: 'legendary', species: 'permafrost_sunflower', frostBoost: 55, energyBoost: 35, bloomBoost: 25, value: 6000, description: 'A seed containing an entire frozen world. Planting it transforms one garden chamber into a paradise.' },
  { id: 'art_crystal_bonsai_of_ages', name: 'Crystal Bonsai of Ages', emoji: '🌳', rarity: 'legendary', species: 'crystal_bonsai', frostBoost: 52, energyBoost: 32, bloomBoost: 20, value: 5500, description: 'A bonsai that has been growing since the world began. Its wisdom sustains all garden life.' },
  { id: 'art_garden_eternal_emblem', name: 'Garden Eternal Emblem', emoji: '🌟', rarity: 'legendary', species: 'ice_rose', frostBoost: 60, energyBoost: 40, bloomBoost: 30, value: 10000, description: 'The emblem of Garden Eternal. It radiates the combined frost power of every bloom that ever lived.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: HG_EVENTS — 12 Garden Events
// ═══════════════════════════════════════════════════════════════════

export const HG_EVENTS: readonly HgEventDef[] = [
  { id: 'evt_hailstorm_surge', name: 'Hailstorm Surge', emoji: '⛈️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Hail intensity doubled. All blooms lose 10% health per turn.', description: 'A massive hailstorm engulfs the garden, testing the resilience of every frost bloom.' },
  { id: 'evt_frost_bloom_festival', name: 'Frost Bloom Festival', emoji: '🎊', durationTurns: 5, effectType: 'buff', effectDescription: 'All bloom speeds tripled. Double material drops from harvesting.', description: 'The frost spirits celebrate with a grand festival. Every bloom bursts with extra frost energy.' },
  { id: 'evt_crystal_thaw_warning', name: 'Crystal Thaw Warning', emoji: '🌡️', durationTurns: 4, effectType: 'debuff', effectDescription: 'Temperatures rise. Crystal bonsais lose 20% hail resistance per turn.', description: 'An unnatural warmth threatens the crystal structures. Act fast to protect your garden.' },
  { id: 'evt_blizzard_night', name: 'Blizzard Night', emoji: '🌨️', durationTurns: 3, effectType: 'special', effectDescription: 'All abilities cost 50% less energy. Blizzard-type blooms gain 30% frost power.', description: 'The blizzard spirits descend. A night of incredible power — if you can harness it.' },
  { id: 'evt_aurora_garden_glow', name: 'Aurora Garden Glow', emoji: '🌌', durationTurns: 6, effectType: 'buff', effectDescription: 'Snow lilies generate double nectar. All blooms gain +5 health per turn.', description: 'A magnificent aurora bathes the garden in spectral light. Every bloom thrives.' },
  { id: 'evt_ice_spirit_visit', name: 'Ice Spirit Visit', emoji: '👻', durationTurns: 2, effectType: 'buff', effectDescription: 'A friendly ice spirit tends your garden. Random blooms are healed to full health.', description: 'A frost spirit visits from the Eternal Frost Sanctuary to bless your garden.' },
  { id: 'evt_permafrost_quake', name: 'Permafrost Quake', emoji: '💪', durationTurns: 3, effectType: 'debuff', effectDescription: 'Ground instability. Permafrost sunflowers cannot bloom. Garden structures lose 1 level.', description: 'Deep permafrost shifts destabilize the garden. Structures and sunflowers are affected.' },
  { id: 'evt_frozen_rain', name: 'Frozen Rain', emoji: '🌧️', durationTurns: 4, effectType: 'buff', effectDescription: 'Gentle frozen rain waters all gardens. Bloom health regeneration doubled.', description: 'A gentle rain of frozen droplets nourishes every corner of the Hail Garden.' },
  { id: 'evt_hail_god_blessing', name: 'Hail God\'s Blessing', emoji: '⚡', durationTurns: 5, effectType: 'buff', effectDescription: 'Hail energy generation +200%. Hail strikes grant bonus materials.', description: 'The Hail God smiles upon your garden. Hail itself becomes a blessing rather than a threat.' },
  { id: 'evt_crystal_growth_spurt', name: 'Crystal Growth Spurt', emoji: '💎', durationTurns: 3, effectType: 'buff', effectDescription: 'Crystal bonsais grow 10x faster. New bonsai sprouts appear in empty slots.', description: 'The crystal resonance reaches a harmonic peak. All crystal life surges with growth energy.' },
  { id: 'evt_frost_migration', name: 'Frost Migration', emoji: '🦋', durationTurns: 4, effectType: 'special', effectDescription: 'Rare frost butterflies visit. Each turn has a chance to discover a new material.', description: 'Frost butterflies migrate through the garden, carrying rare materials from distant frozen lands.' },
  { id: 'evt_eternal_night_freeze', name: 'Eternal Night Freeze', emoji: '🌑', durationTurns: 5, effectType: 'special', effectDescription: 'Permanent night. Midnight Snow Lilies bloom. All frost power doubled. But hail is relentless.', description: 'The longest night of the year brings both extraordinary power and extraordinary danger.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: FROST CALCULATIONS & UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function hgCalcBloomFrostPower(bloomId: string, level: number): number {
  const def = hgFindBloom(bloomId)
  if (!def) return 0
  return Math.floor(def.frostPower * (1 + (level - 1) * 0.15))
}

export function hgCalcBloomSpeed(bloomId: string, level: number): number {
  const def = hgFindBloom(bloomId)
  if (!def) return 0
  return Math.floor(def.bloomSpeed * (1 + (level - 1) * 0.1))
}

export function hgCalcBloomResistance(bloomId: string, level: number): number {
  const def = hgFindBloom(bloomId)
  if (!def) return 0
  return Math.floor(def.hailResistance * (1 + (level - 1) * 0.12))
}

export function hgCalcBloomTotalPower(bloomId: string, level: number): number {
  return hgCalcBloomFrostPower(bloomId, level)
    + hgCalcBloomSpeed(bloomId, level)
    + hgCalcBloomResistance(bloomId, level)
}

export function hgCalcGardenTotalFrost(
  gardenId: string,
  gardens: Record<string, HgGardenState>,
  blooms: Record<string, HgBloomState>
): number {
  const gardenDef = hgFindGarden(gardenId)
  const gardenState = gardens[gardenId]
  if (!gardenDef || !gardenState || !gardenState.claimed) return 0

  let totalFrost = gardenDef.frostBonus * gardenState.level
  for (const slotBloomId of gardenState.bloomSlots) {
    const bs = blooms[slotBloomId]
    if (bs) {
      totalFrost += hgCalcBloomFrostPower(slotBloomId, bs.level)
    }
  }
  return totalFrost
}

export function hgCalcStructureUpgradeCost(structureId: string, currentLevel: number): number {
  const def = hgFindStructure(structureId)
  if (!def) return Infinity
  if (currentLevel <= 0) return def.baseCost
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

export function hgCalcStructureEffect(structureId: string, level: number): number {
  const def = hgFindStructure(structureId)
  if (!def || level <= 0) return 0
  return def.baseEffect + def.effectPerLevel * (level - 1)
}

export function hgSpeciesSynergyBonus(speciesA: HgSpeciesType, speciesB: HgSpeciesType): number {
  const synergyMap: Partial<Record<HgSpeciesType, HgSpeciesType[]>> = {
    ice_rose: ['snow_lily', 'frost_lotus'],
    frost_lotus: ['snow_lily', 'ice_rose'],
    hail_orchid: ['crystal_bonsai', 'permafrost_sunflower'],
    glacial_tulip: ['ice_rose', 'snow_lily'],
    snow_lily: ['ice_rose', 'frost_lotus', 'glacial_tulip'],
    permafrost_sunflower: ['hail_orchid', 'crystal_bonsai'],
    crystal_bonsai: ['hail_orchid', 'permafrost_sunflower'],
  }
  const partners = synergyMap[speciesA]
  if (!partners) return 0
  if (partners.includes(speciesB)) return 0.15
  return 0
}

export function hgCalcGardenCapacity(gardenId: string): number {
  const gardenDef = hgFindGarden(gardenId)
  if (!gardenDef) return 0
  return gardenDef.capacity
}

export function hgCalcTotalArtifactBoost(artifactIds: string[]): { frostBoost: number; energyBoost: number; bloomBoost: number } {
  let frostBoost = 0
  let energyBoost = 0
  let bloomBoost = 0
  for (const aId of artifactIds) {
    const artifact = hgFindArtifact(aId)
    if (artifact) {
      frostBoost += artifact.frostBoost
      energyBoost += artifact.energyBoost
      bloomBoost += artifact.bloomBoost
    }
  }
  return { frostBoost, energyBoost, bloomBoost }
}

export function hgGetRandomEvent(): HgEventDef {
  const idx = Math.floor(Math.random() * HG_EVENTS.length)
  return HG_EVENTS[idx]
}

export function hgCheckTitleEligibility(level: number, bloomCount: number): HgTitleDef {
  for (let i = HG_TITLES.length - 1; i >= 0; i--) {
    const title = HG_TITLES[i]
    if (level >= title.minLevel && bloomCount >= title.minBlooms) {
      return title
    }
  }
  return HG_TITLES[0]
}

export function hgGetBloomsByRarityFilter(blooms: HgOwnedBloom[], rarity: HgRarity): HgOwnedBloom[] {
  return blooms.filter((b) => b.def && b.def.rarity === rarity)
}

export function hgGetBloomsBySpeciesFilter(blooms: HgOwnedBloom[], species: HgSpeciesType): HgOwnedBloom[] {
  return blooms.filter((b) => b.def && b.def.species === species)
}

export function hgGetMaterialsByType(inventory: Record<string, number>, type: HgMaterialDef['type']): { id: string; count: number; def: HgMaterialDef | undefined }[] {
  const filteredMaterials = HG_MATERIALS.filter((m) => m.type === type)
  return filteredMaterials.map((def) => ({
    id: def.id,
    count: inventory[def.id] ?? 0,
    def,
  }))
}

export function hgGetInventoryValue(inventory: Record<string, number>): number {
  let total = 0
  for (const mat of HG_MATERIALS) {
    const count = inventory[mat.id] ?? 0
    total += count * mat.value
  }
  return total
}

export function hgFormatHailEnergy(energy: number): string {
  if (energy >= 10000) {
    return `${(energy / 1000).toFixed(1)}k`
  }
  return energy.toString()
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (Store Initialization)
// ═══════════════════════════════════════════════════════════════════

const HG_MAX_LEVEL = 50

function hgXpRequired(level: number): number {
  if (level <= 0) return 0
  if (level >= HG_MAX_LEVEL) return Infinity
  return Math.floor(80 * level * (1 + level * 0.15))
}

function hgRarityMultiplier(r: HgRarity): number {
  const map: Record<HgRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
  }
  return map[r] ?? 1
}

function hgRarityColor(r: HgRarity): string {
  const info = HG_RARITIES.find((ri) => ri.key === r)
  return info?.color ?? '#9CA3AF'
}

function hgSpeciesColor(s: HgSpeciesType): string {
  const map: Record<HgSpeciesType, string> = {
    ice_rose: HG_FROST_PINK,
    frost_lotus: HG_ICE_BLUE,
    hail_orchid: HG_SHADOW_ICE,
    glacial_tulip: HG_DEEP_FROST,
    snow_lily: HG_HAIL_WHITE,
    permafrost_sunflower: HG_GARDEN_GREEN,
    crystal_bonsai: HG_CRYSTAL_PURPLE,
  }
  return map[s] ?? '#888888'
}

function hgFindBloom(id: string): HgBloomDef | undefined {
  return HG_BLOOMS.find((b) => b.id === id)
}

function hgFindGarden(id: string): HgGardenDef | undefined {
  return HG_GARDENS.find((g) => g.id === id)
}

function hgFindStructure(id: string): HgStructureDef | undefined {
  return HG_STRUCTURES.find((s) => s.id === id)
}

function hgFindArtifact(id: string): HgArtifactDef | undefined {
  return HG_ARTIFACTS.find((a) => a.id === id)
}

function hgFindTitle(id: HgTitleId): HgTitleDef | undefined {
  return HG_TITLES.find((t) => t.id === id)
}

function hgGenerateId(): string {
  return `hg_${Date.now()}_${Math.floor(Math.random() * 100000)}`
}

function hgEmptyBloomState(): HgBloomState {
  return {
    owned: false,
    count: 0,
    level: 1,
    xp: 0,
    plantedAt: null,
    gardenId: null,
    health: 100,
  }
}

function hgEmptyGardenState(): HgGardenState {
  return {
    claimed: false,
    level: 1,
    bloomSlots: [],
    claimedAt: null,
  }
}

function hgEmptyStructureState(): HgStructureState {
  return {
    level: 0,
    builtAt: null,
  }
}

function hgEmptyStats(): HgStats {
  return {
    totalBloomsPlanted: 0,
    totalBloomsHarvested: 0,
    totalGardensClaimed: 0,
    totalStructuresBuilt: 0,
    totalHailStrikes: 0,
    totalRelicsActivated: 0,
    totalAbilityCasts: 0,
    totalEventsFaced: 0,
    totalMaterialsCollected: 0,
    totalFrostPowerEarned: 0,
    totalPlayMinutes: 0,
  }
}

function hgEmptyInventory(): Record<string, number> {
  const inv: Record<string, number> = {}
  for (const mat of HG_MATERIALS) {
    inv[mat.id] = 0
  }
  return inv
}

function hgInitBlooms(): Record<string, HgBloomState> {
  const blooms: Record<string, HgBloomState> = {}
  for (const bloom of HG_BLOOMS) {
    blooms[bloom.id] = hgEmptyBloomState()
  }
  return blooms
}

function hgInitGardens(): Record<string, HgGardenState> {
  const gardens: Record<string, HgGardenState> = {}
  for (const garden of HG_GARDENS) {
    gardens[garden.id] = hgEmptyGardenState()
  }
  return gardens
}

function hgInitStructures(): Record<string, HgStructureState> {
  const structures: Record<string, HgStructureState> = {}
  for (const structure of HG_STRUCTURES) {
    structures[structure.id] = hgEmptyStructureState()
  }
  return structures
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useHgStore = create<HgFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ────────────────────────────────────────
      hgLevel: 1,
      hgFrostPower: 0,
      hgHailEnergy: 100,
      hgBlooms: hgInitBlooms(),
      hgGardens: hgInitGardens(),
      hgStructures: hgInitStructures(),
      hgArtifacts: [] as string[],
      hgAchievements: [] as string[],
      hgInventory: hgEmptyInventory(),
      hgStats: hgEmptyStats(),
      hgTitle: 'title_seed_planter' as HgTitleId,
      activeEvent: null as HgEventDef | null,
      eventTurnsRemaining: 0,

      // ── hgPlantBloom ─────────────────────────────────────────
      hgPlantBloom: (bloomId: string, gardenId: string): boolean => {
        const bloomDef = hgFindBloom(bloomId)
        const gardenDef = hgFindGarden(gardenId)
        if (!bloomDef || !gardenDef) return false

        const state = get()
        const gardenState = state.hgGardens[gardenId]
        if (!gardenState || !gardenState.claimed) return false

        const availableSlots = gardenDef.capacity - gardenState.bloomSlots.length
        if (availableSlots <= 0) return false

        const energyCost = Math.floor(10 * hgRarityMultiplier(bloomDef.rarity))
        if (state.hgHailEnergy < energyCost) return false

        set((prev) => {
          const newBlooms = { ...prev.hgBlooms }
          const bloomState = { ...newBlooms[bloomId] }
          bloomState.owned = true
          bloomState.count += 1
          bloomState.plantedAt = Date.now()
          bloomState.gardenId = gardenId
          bloomState.health = 100
          newBlooms[bloomId] = bloomState

          const newGardens = { ...prev.hgGardens }
          const gState = { ...newGardens[gardenId] }
          gState.bloomSlots = [...gState.bloomSlots, bloomId]
          newGardens[gardenId] = gState

          const xpGain = Math.floor(20 * hgRarityMultiplier(bloomDef.rarity))
          const newStats = { ...prev.hgStats, totalBloomsPlanted: prev.hgStats.totalBloomsPlanted + 1 }
          const newXp = prev.hgFrostPower + xpGain

          let newLevel = prev.hgLevel
          let remainingXp = newXp
          while (remainingXp >= hgXpRequired(newLevel) && newLevel < HG_MAX_LEVEL) {
            remainingXp -= hgXpRequired(newLevel)
            newLevel += 1
          }

          return {
            hgBlooms: newBlooms,
            hgGardens: newGardens,
            hgHailEnergy: prev.hgHailEnergy - energyCost,
            hgFrostPower: remainingXp,
            hgLevel: newLevel,
            hgStats: newStats,
          }
        })
        return true
      },

      // ── hgGardenClaim ────────────────────────────────────────
      hgGardenClaim: (gardenId: string): boolean => {
        const gardenDef = hgFindGarden(gardenId)
        if (!gardenDef) return false

        const state = get()
        if (state.hgLevel < gardenDef.unlockLevel) return false

        const gardenState = state.hgGardens[gardenId]
        if (gardenState && gardenState.claimed) return false

        const energyCost = gardenDef.unlockLevel * 5
        if (state.hgHailEnergy < energyCost) return false

        set((prev) => {
          const newGardens = { ...prev.hgGardens }
          newGardens[gardenId] = {
            claimed: true,
            level: 1,
            bloomSlots: [],
            claimedAt: Date.now(),
          }

          const newStats = { ...prev.hgStats, totalGardensClaimed: prev.hgStats.totalGardensClaimed + 1 }
          const xpGain = gardenDef.frostBonus * 3

          return {
            hgGardens: newGardens,
            hgHailEnergy: prev.hgHailEnergy - energyCost,
            hgFrostPower: prev.hgFrostPower + xpGain,
            hgStats: newStats,
          }
        })
        return true
      },

      // ── hgBuildStructure ─────────────────────────────────────
      hgBuildStructure: (structureId: string): boolean => {
        const structDef = hgFindStructure(structureId)
        if (!structDef) return false

        const state = get()
        if (state.hgLevel < structDef.requiredLevel) return false

        const structState = state.hgStructures[structureId]
        if (!structState) return false

        const currentLevel = structState.level
        const isNewBuild = currentLevel === 0
        if (isNewBuild) {
          const energyCost = structDef.baseCost
          if (state.hgHailEnergy < energyCost) return false

          set((prev) => {
            const newStructures = { ...prev.hgStructures }
            newStructures[structureId] = { level: 1, builtAt: Date.now() }

            const newStats = { ...prev.hgStats, totalStructuresBuilt: prev.hgStats.totalStructuresBuilt + 1 }

            return {
              hgStructures: newStructures,
              hgHailEnergy: prev.hgHailEnergy - energyCost,
              hgFrostPower: prev.hgFrostPower + structDef.baseEffect,
              hgStats: newStats,
            }
          })
        } else {
          if (currentLevel >= structDef.maxLevel) return false
          const upgradeCost = Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, currentLevel))
          if (state.hgHailEnergy < upgradeCost) return false

          set((prev) => {
            const newStructures = { ...prev.hgStructures }
            newStructures[structureId] = {
              level: currentLevel + 1,
              builtAt: structState.builtAt,
            }

            const effectGain = structDef.effectPerLevel

            return {
              hgStructures: newStructures,
              hgHailEnergy: prev.hgHailEnergy - upgradeCost,
              hgFrostPower: prev.hgFrostPower + effectGain,
            }
          })
        }
        return true
      },

      // ── hgHailStrike ─────────────────────────────────────────
      hgHailStrike: (targetBloomId: string): boolean => {
        const bloomDef = hgFindBloom(targetBloomId)
        if (!bloomDef) return false

        const state = get()
        const bloomState = state.hgBlooms[targetBloomId]
        if (!bloomState || !bloomState.owned) return false

        set((prev) => {
          const newBlooms = { ...prev.hgBlooms }
          const bs = { ...newBlooms[targetBloomId] }

          const damage = 15 - Math.floor(bloomDef.hailResistance * 0.5)
          const actualDamage = Math.max(1, damage)
          bs.health = Math.max(0, bs.health - actualDamage)
          newBlooms[targetBloomId] = bs

          const energyReward = Math.floor(5 * hgRarityMultiplier(bloomDef.rarity))
          const newStats = { ...prev.hgStats, totalHailStrikes: prev.hgStats.totalHailStrikes + 1 }

          // Award random material on strike
          const newInventory = { ...prev.hgInventory }
          const commonMaterials = HG_MATERIALS.filter((m) => m.rarity === 'common')
          if (commonMaterials.length > 0) {
            const randomMat = commonMaterials[Math.floor(Math.random() * commonMaterials.length)]
            newInventory[randomMat.id] = (newInventory[randomMat.id] ?? 0) + 1
          }

          const updatedStats: HgStats = {
            ...newStats,
            totalMaterialsCollected: newStats.totalMaterialsCollected + 1,
          }

          return {
            hgBlooms: newBlooms,
            hgHailEnergy: prev.hgHailEnergy + energyReward,
            hgInventory: newInventory,
            hgStats: updatedStats,
          }
        })
        return true
      },

      // ── hgActivateRelic ──────────────────────────────────────
      hgActivateRelic: (artifactId: string): boolean => {
        const artifactDef = hgFindArtifact(artifactId)
        if (!artifactDef) return false

        const state = get()
        if (state.hgArtifacts.includes(artifactId)) return false

        const energyCost = Math.floor(artifactDef.value * 0.1)
        if (state.hgHailEnergy < energyCost) return false

        set((prev) => {
          const newArtifacts = [...prev.hgArtifacts, artifactId]
          const newStats = { ...prev.hgStats, totalRelicsActivated: prev.hgStats.totalRelicsActivated + 1 }

          return {
            hgArtifacts: newArtifacts,
            hgHailEnergy: prev.hgHailEnergy - energyCost,
            hgFrostPower: prev.hgFrostPower + artifactDef.frostBoost,
            hgStats: newStats,
          }
        })
        return true
      },

      // ── resetHailGarden ──────────────────────────────────────
      resetHailGarden: () => {
        set({
          hgLevel: 1,
          hgFrostPower: 0,
          hgHailEnergy: 100,
          hgBlooms: hgInitBlooms(),
          hgGardens: hgInitGardens(),
          hgStructures: hgInitStructures(),
          hgArtifacts: [],
          hgAchievements: [],
          hgInventory: hgEmptyInventory(),
          hgStats: hgEmptyStats(),
          hgTitle: 'title_seed_planter' as HgTitleId,
          activeEvent: null,
          eventTurnsRemaining: 0,
        })
      },
    }),
    {
      name: 'hail-garden-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useHailGarden()
// ═══════════════════════════════════════════════════════════════════

export default function useHailGarden(): HgAPI {
  const store = useHgStore()
  const stateRef = useRef(store)

  useEffect(() => {
    stateRef.current = store
  }, [store])

  // ── Computed: Owned blooms with defs ─────────────────────────
  const hgOwnedBlooms: HgOwnedBloom[] = []
  for (const bloomDef of HG_BLOOMS) {
    const bs = store.hgBlooms[bloomDef.id]
    if (bs && bs.owned) {
      hgOwnedBlooms.push({
        def: bloomDef,
        state: bs,
        rarityColor: hgRarityColor(bloomDef.rarity),
        speciesColor: hgSpeciesColor(bloomDef.species),
      })
    }
  }

  // ── Computed: Unowned blooms ─────────────────────────────────
  const hgUnownedBlooms: HgBloomDef[] = HG_BLOOMS.filter((b) => {
    const bs = store.hgBlooms[b.id]
    return !bs || !bs.owned
  })

  // ── Computed: Claimed gardens ────────────────────────────────
  const hgClaimedGardens: HgGardenDef[] = HG_GARDENS.filter((g) => {
    const gs = store.hgGardens[g.id]
    return gs && gs.claimed
  })

  // ── Computed: Unclaimed gardens ──────────────────────────────
  const hgUnclaimedGardens: HgGardenDef[] = HG_GARDENS.filter((g) => {
    if (store.hgLevel < g.unlockLevel) return false
    const gs = store.hgGardens[g.id]
    return !gs || !gs.claimed
  })

  // ── Computed: Built structures ───────────────────────────────
  const hgBuiltStructures: HgBuiltStructure[] = []
  for (const sDef of HG_STRUCTURES) {
    const ss = store.hgStructures[sDef.id]
    if (ss && ss.level > 0) {
      hgBuiltStructures.push({ def: sDef, state: ss })
    }
  }

  // ── Computed: Owned artifacts ────────────────────────────────
  const hgOwnedArtifacts: HgArtifactDef[] = store.hgArtifacts
    .map((aId) => hgFindArtifact(aId))
    .filter((a): a is HgArtifactDef => a !== undefined)

  // ── Computed: Unclaimed achievements ─────────────────────────
  const hgUnclaimedAchievements: HgAchievementDef[] = HG_ACHIEVEMENTS.filter(
    (a) => !store.hgAchievements.includes(a.id)
  )

  // ── Computed: Current title ──────────────────────────────────
  const hgCurrentTitleDetail: HgTitleDef = hgFindTitle(store.hgTitle) ?? HG_TITLES[0]

  // ── Computed: Next title ─────────────────────────────────────
  let hgNextTitle: HgTitleDef | null = null
  {
    const currentIdx = HG_TITLES.findIndex((t) => t.id === store.hgTitle)
    if (currentIdx >= 0 && currentIdx < HG_TITLES.length - 1) {
      hgNextTitle = HG_TITLES[currentIdx + 1]
    }
  }

  // ── Computed: Title progress ─────────────────────────────────
  const hgTitleProgress: HgTitleProgress = (() => {
    if (!hgNextTitle) {
      return { percent: 100, levelNeeded: 0, bloomsNeeded: 0 }
    }
    const levelPercent = Math.min(100, (store.hgLevel / hgNextTitle.minLevel) * 100)
    const ownedBloomCount = Object.values(store.hgBlooms).filter((b) => b.owned).length
    const bloomPercent = Math.min(100, (ownedBloomCount / hgNextTitle.minBlooms) * 100)
    return {
      percent: Math.floor((levelPercent + bloomPercent) / 2),
      levelNeeded: Math.max(0, hgNextTitle.minLevel - store.hgLevel),
      bloomsNeeded: Math.max(0, hgNextTitle.minBlooms - ownedBloomCount),
    }
  })()

  // ── Computed: Counts ─────────────────────────────────────────
  const hgBloomCount: number = Object.values(store.hgBlooms).filter((b) => b.owned).length
  const hgGardenCount: number = Object.values(store.hgGardens).filter((g) => g.claimed).length
  const hgStructureCount: number = Object.values(store.hgStructures).filter((s) => s.level > 0).length
  const hgArtifactCount: number = store.hgArtifacts.length

  // ── Computed: Rare material count ────────────────────────────
  let hgRareMaterialCount = 0
  for (const mat of HG_MATERIALS) {
    if (mat.rarity === 'rare' || mat.rarity === 'epic' || mat.rarity === 'legendary') {
      const count = store.hgInventory[mat.id] ?? 0
      hgRareMaterialCount += count
    }
  }

  // ── Computed: Total structure effect ─────────────────────────
  let hgTotalStructureEffect = 0
  for (const sDef of HG_STRUCTURES) {
    const ss = store.hgStructures[sDef.id]
    if (ss && ss.level > 0) {
      hgTotalStructureEffect += sDef.baseEffect + sDef.effectPerLevel * (ss.level - 1)
    }
  }

  // ── Computed: Blooms by rarity ───────────────────────────────
  const hgBloomsByRarity: Record<HgRarity, HgOwnedBloom[]> = {
    common: [],
    uncommon: [],
    rare: [],
    epic: [],
    legendary: [],
  }
  for (const owned of hgOwnedBlooms) {
    if (owned.def) {
      hgBloomsByRarity[owned.def.rarity].push(owned)
    }
  }

  // ── Computed: Blooms by species ──────────────────────────────
  const hgBloomsBySpecies: Record<HgSpeciesType, HgOwnedBloom[]> = {
    ice_rose: [],
    frost_lotus: [],
    hail_orchid: [],
    glacial_tulip: [],
    snow_lily: [],
    permafrost_sunflower: [],
    crystal_bonsai: [],
  }
  for (const owned of hgOwnedBlooms) {
    if (owned.def) {
      hgBloomsBySpecies[owned.def.species].push(owned)
    }
  }

  // ── Computed: Rarity distribution ────────────────────────────
  const hgRarityDistribution: Record<HgRarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  }
  for (const owned of hgOwnedBlooms) {
    if (owned.def) {
      hgRarityDistribution[owned.def.rarity]++
    }
  }

  // ── Computed: Species distribution ───────────────────────────
  const hgSpeciesDistribution: Record<HgSpeciesType, number> = {
    ice_rose: 0,
    frost_lotus: 0,
    hail_orchid: 0,
    glacial_tulip: 0,
    snow_lily: 0,
    permafrost_sunflower: 0,
    crystal_bonsai: 0,
  }
  for (const owned of hgOwnedBlooms) {
    if (owned.def) {
      hgSpeciesDistribution[owned.def.species]++
    }
  }

  // ═════════════════════════════════════════════════════════════
  // Return plain HG_API object
  // ═════════════════════════════════════════════════════════════

  return {
    // ── Color constants ──────────────────────────────────────
    HG_FROST_PINK,
    HG_ICE_BLUE,
    HG_HAIL_WHITE,
    HG_GARDEN_GREEN,
    HG_DEEP_FROST,
    HG_CRYSTAL_PURPLE,
    HG_AURORA_GLOW,
    HG_SHADOW_ICE,

    // ── Data constants ───────────────────────────────────────
    HG_SPECIES,
    HG_RARITIES,
    HG_BLOOMS,
    HG_GARDENS,
    HG_MATERIALS,
    HG_STRUCTURES,
    HG_ABILITIES,
    HG_ACHIEVEMENTS,
    HG_TITLES,
    HG_ARTIFACTS,
    HG_EVENTS,
    HG_SPECIES_INFO,

    // ── Utility functions ──────────────────────────────────────
    hgCalcBloomFrostPower,
    hgCalcBloomSpeed,
    hgCalcBloomResistance,
    hgCalcBloomTotalPower,
    hgCalcGardenTotalFrost,
    hgCalcStructureUpgradeCost,
    hgCalcStructureEffect,
    hgSpeciesSynergyBonus,
    hgCalcTotalArtifactBoost,
    hgGetRandomEvent,
    hgCheckTitleEligibility,
    hgGetBloomsByRarityFilter,
    hgGetBloomsBySpeciesFilter,
    hgGetMaterialsByType,
    hgGetInventoryValue,
    hgFormatHailEnergy,

    // ── Store state ──────────────────────────────────────────
    hgLevel: store.hgLevel,
    hgFrostPower: store.hgFrostPower,
    hgHailEnergy: store.hgHailEnergy,
    hgBlooms: store.hgBlooms,
    hgGardens: store.hgGardens,
    hgStructures: store.hgStructures,
    hgArtifacts: store.hgArtifacts,
    hgAchievements: store.hgAchievements,
    hgInventory: store.hgInventory,
    hgStats: store.hgStats,
    hgTitle: store.hgTitle,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,

    // ── Store actions ────────────────────────────────────────
    hgPlantBloom: store.hgPlantBloom,
    hgGardenClaim: store.hgGardenClaim,
    hgBuildStructure: store.hgBuildStructure,
    hgHailStrike: store.hgHailStrike,
    hgActivateRelic: store.hgActivateRelic,
    resetHailGarden: store.resetHailGarden,

    // ── Computed getters ─────────────────────────────────────
    hgOwnedBlooms,
    hgUnownedBlooms,
    hgClaimedGardens,
    hgUnclaimedGardens,
    hgBuiltStructures,
    hgOwnedArtifacts,
    hgUnclaimedAchievements,
    hgCurrentTitleDetail,
    hgNextTitle,
    hgTitleProgress,
    hgBloomCount,
    hgGardenCount,
    hgStructureCount,
    hgArtifactCount,
    hgRareMaterialCount,
    hgTotalStructureEffect,
    hgBloomsByRarity,
    hgBloomsBySpecies,
    hgRarityDistribution,
    hgSpeciesDistribution,
  }
}
