/**
 * Opal Lagoon Wire — 蛋白石泻湖 (Opal Lagoon) feature module
 *
 * A luminous opal/jewel lagoon collection mini-game: collect 35 opal
 * creatures across 7 gem types, explore 8 lagoon depths, harvest 30
 * gem/mineral materials, build 25 lagoon structures, unlock 22 jewel
 * abilities, discover 15 legendary opal artifacts, face 12 lagoon
 * events, and ascend through 8 titles from Pebble Collector to
 * Opal Deity — backed by a Zustand store with persist middleware.
 *
 * Storage key: opal-lagoon-wire
 * Prefix: ol / OL_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type OlGemType =
  | 'fire_opal'
  | 'australian'
  | 'ethiopian'
  | 'mexican'
  | 'boulder'
  | 'honey'
  | 'water_opal'

export type OlRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type OlTitleId =
  | 'title_pebble_collector'
  | 'title_gem_seeker'
  | 'title_lagoon_explorer'
  | 'title_opal_scholar'
  | 'title_jewel_guardian'
  | 'title_crystal_sovereign'
  | 'title_opal_lord'
  | 'title_opal_deity'

export interface OlGemTypeDef {
  readonly id: OlGemType
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface OlCreatureSpecies {
  readonly id: string
  readonly name: string
  readonly gemType: OlGemType
  readonly rarity: OlRarity
  readonly lusterPower: number
  readonly depthPower: number
  readonly grace: number
  readonly description: string
  readonly abilities: string[]
}

export interface OlCreatureInstance {
  readonly id: string
  speciesId: string
  name: string
  level: number
  xp: number
  lusterPower: number
  depthPower: number
  grace: number
  mood: number
  hunger: number
  collectedAt: number
}

export interface OlDepthDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly dangerLevel: number
  readonly requiredTitle: OlTitleId
  readonly gemType: OlGemType
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface OlMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'shard' | 'dust' | 'core' | 'artifact_shard' | 'essence'
  readonly rarity: OlRarity
  readonly lusterBonus: number
  readonly depthBonus: number
  readonly value: number
  readonly description: string
}

export interface OlStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'lagoon_pool' | 'polish_bench' | 'gem_lab' | 'crystal_altar' | 'artifact_shrine'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface OlStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface OlAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly gemType: OlGemType
  readonly type: 'active' | 'passive'
  readonly rarity: OlRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface OlAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { pearls: number; prestige: number }
}

export interface OlTitleDef {
  readonly id: OlTitleId
  readonly name: string
  readonly emoji: string
  readonly minPrestige: number
  readonly minCreatures: number
  readonly description: string
}

export interface OlRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: OlRarity
  readonly gemType: OlGemType
  readonly lusterBoost: number
  readonly depthBoost: number
  readonly graceBoost: number
  readonly value: number
  readonly description: string
}

export interface OlEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface OlStoreState {
  creatures: OlCreatureInstance[]
  depths: string[]
  materials: { materialId: string; count: number }[]
  structures: OlStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: OlTitleId
  pearls: number
  prestige: number
  totalCollected: number
  totalPolished: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: OlEventDef | null
  eventTurnsRemaining: number
  activeDepth: string | null
}

export interface OlStoreActions {
  olCollectCreature: (speciesId: string) => boolean
  olReleaseCreature: (creatureId: string) => boolean
  olFeedCreature: (creatureId: string) => boolean
  olPolishGem: (creatureId: string) => boolean
  olBuildStructure: (structureDefId: string) => boolean
  olUpgradeStructure: (structureId: string) => boolean
  olExploreDepth: (depthId: string) => OlEventDef | null
  olCollectRelic: (relicId: string) => boolean
  olUnlockAbility: (abilityId: string) => boolean
  olUnlockTitle: (titleId: OlTitleId) => boolean
  olClaimAchievement: (achievementId: string) => boolean
  olTradeMaterial: (materialId: string, count: number) => number
  olEndEvent: () => void
  olResetEvent: () => void
}

export interface OlFullStore extends OlStoreState, OlStoreActions {}

export interface OlAPI {
  // Colors
  OL_OPAL_WHITE: string
  OL_FIRE_OPAL_ORANGE: string
  OL_AUSTRALIAN_BLUE: string
  OL_ETHIOPIAN_GREEN: string
  OL_BOULDER_BROWN: string
  OL_HONEY_AMBER: string
  OL_LAGOON_TEAL: string
  OL_JEWEL_PINK: string
  // Data tables
  OL_GEM_TYPES: readonly OlGemTypeDef[]
  OL_RARITIES: readonly { id: OlRarity; name: string; color: string }[]
  OL_CREATURES: readonly OlCreatureSpecies[]
  OL_DEPTHS: readonly OlDepthDef[]
  OL_MATERIALS: readonly OlMaterialDef[]
  OL_STRUCTURES: readonly OlStructureDef[]
  OL_ABILITIES: readonly OlAbilityDef[]
  OL_ACHIEVEMENTS: readonly OlAchievementDef[]
  OL_TITLES: readonly OlTitleDef[]
  OL_RELICS: readonly OlRelicDef[]
  OL_EVENTS: readonly OlEventDef[]
  // Helpers
  olCheckSynergy: (a: OlGemType, d: OlGemType) => number
  // Store state
  creatures: OlCreatureInstance[]
  depths: string[]
  materials: { materialId: string; count: number }[]
  structures: OlStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: OlTitleId
  pearls: number
  prestige: number
  totalCollected: number
  totalPolished: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: OlEventDef | null
  eventTurnsRemaining: number
  activeDepth: string | null
  // Store actions
  olCollectCreature: (speciesId: string) => boolean
  olReleaseCreature: (creatureId: string) => boolean
  olFeedCreature: (creatureId: string) => boolean
  olPolishGem: (creatureId: string) => boolean
  olBuildStructure: (structureDefId: string) => boolean
  olUpgradeStructure: (structureId: string) => boolean
  olExploreDepth: (depthId: string) => OlEventDef | null
  olCollectRelic: (relicId: string) => boolean
  olUnlockAbility: (abilityId: string) => boolean
  olUnlockTitle: (titleId: OlTitleId) => boolean
  olClaimAchievement: (achievementId: string) => boolean
  olTradeMaterial: (materialId: string, count: number) => number
  olEndEvent: () => void
  olResetEvent: () => void
  // Computed
  olOwnedCreatures: ReturnType<typeof computeOlOwnedCreatures>
  olAvailableSpecies: readonly OlCreatureSpecies[]
  olCurrentTitleDetail: OlTitleDef
  olNextTitle: OlTitleDef | null
  olActiveDepthDetail: OlDepthDef | null
  olUnexploredDepths: readonly OlDepthDef[]
  olBuiltStructures: ReturnType<typeof computeOlBuiltStructures>
  olUnlockableAbilities: readonly OlAbilityDef[]
  olOwnedRelics: readonly OlRelicDef[]
  olUnclaimedAchievements: readonly OlAchievementDef[]
  olInventoryMaterials: ReturnType<typeof computeOlInventoryMaterials>
  olTotalStructureEffect: number
  olAverageCreatureLevel: number
  olTotalCreaturePower: number
  olGemTypeDistribution: Record<OlGemType, number>
  olRarityDistribution: Record<OlRarity, number>
  olCreaturesByRarity: Record<OlRarity, OlCreatureInstance[]>
  olCreaturesByGemType: Record<OlGemType, OlCreatureInstance[]>
  olTitleProgress: { percent: number; prestigeNeeded: number; creaturesNeeded: number }
  olRareMaterialCount: number
  olHungryCreatures: OlCreatureInstance[]
  olUnhappyCreatures: OlCreatureInstance[]
  olTotalRelicBoost: { lusterBoost: number; depthBoost: number; graceBoost: number }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const OL_OPAL_WHITE: string = '#E0F0FF'
export const OL_FIRE_OPAL_ORANGE: string = '#FF6B35'
export const OL_AUSTRALIAN_BLUE: string = '#00B4D8'
export const OL_ETHIOPIAN_GREEN: string = '#2EC4B6'
export const OL_BOULDER_BROWN: string = '#8B6914'
export const OL_HONEY_AMBER: string = '#FFB703'
export const OL_LAGOON_TEAL: string = '#0077B6'
export const OL_JEWEL_PINK: string = '#FF69B4'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: GEM TYPE DEFINITIONS (7 gem types)
// ═══════════════════════════════════════════════════════════════════

export const OL_GEM_TYPES: readonly OlGemTypeDef[] = [
  {
    id: 'fire_opal',
    name: 'Fire Opal',
    color: OL_FIRE_OPAL_ORANGE,
    description:
      'Blazing opals born from volcanic heat. Fire opal creatures radiate warmth and passion, glowing with inner flame.',
  },
  {
    id: 'australian',
    name: 'Australian Opal',
    color: OL_AUSTRALIAN_BLUE,
    description:
      'The most famous opals from the Australian outback. Their creatures shimmer with the full spectrum of the rainbow.',
  },
  {
    id: 'ethiopian',
    name: 'Ethiopian Opal',
    color: OL_ETHIOPIAN_GREEN,
    description:
      'Ancient opals from the Ethiopian highlands. Their creatures channel the vitality of volcanic springs and emerald forests.',
  },
  {
    id: 'mexican',
    name: 'Mexican Opal',
    color: OL_JEWEL_PINK,
    description:
      'Vivid opals from Mexican mines. Their creatures display dazzling pink and cherry flashes, mesmerizing all who gaze upon them.',
  },
  {
    id: 'boulder',
    name: 'Boulder Opal',
    color: OL_BOULDER_BROWN,
    description:
      'Opals embedded in ironstone matrix. Boulder opal creatures are immensely sturdy, carrying the weight of ancient mountains.',
  },
  {
    id: 'honey',
    name: 'Honey Opal',
    color: OL_HONEY_AMBER,
    description:
      'Golden-amber opals that glow like liquid sunlight. Their creatures bring warmth and nourishment to the lagoon depths.',
  },
  {
    id: 'water_opal',
    name: 'Water Opal',
    color: OL_LAGOON_TEAL,
    description:
      'Clear, jelly-like opals with blue-green sheen. Water opal creatures are fluid, graceful, and at one with the lagoon currents.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: OL_RARITIES — 5 Rarity Tiers
// ═══════════════════════════════════════════════════════════════════

export const OL_RARITIES: readonly { id: OlRarity; name: string; color: string }[] = [
  { id: 'common', name: 'Common', color: '#9ca3af' },
  { id: 'uncommon', name: 'Uncommon', color: '#34d399' },
  { id: 'rare', name: 'Rare', color: '#60a5fa' },
  { id: 'epic', name: 'Epic', color: '#a78bfa' },
  { id: 'legendary', name: 'Legendary', color: '#fbbf24' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: GEM TYPE SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const OL_SYNERGY_MAP: Record<OlGemType, OlGemType[]> = {
  fire_opal: ['water_opal', 'honey'],
  australian: ['boulder', 'mexican'],
  ethiopian: ['water_opal', 'australian'],
  mexican: ['fire_opal', 'ethiopian'],
  boulder: ['honey', 'australian'],
  honey: ['ethiopian', 'mexican'],
  water_opal: ['boulder', 'fire_opal'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: OL_CREATURES — 35 Opal Creatures (5 per gem type)
// ═══════════════════════════════════════════════════════════════════

export const OL_CREATURES: readonly OlCreatureSpecies[] = [
  // ── Fire Opal Creatures (5) ───────────────────────────────────
  {
    id: 'fire_opal_sparklet',
    name: 'Sparklet Drake',
    gemType: 'fire_opal',
    rarity: 'common',
    lusterPower: 12,
    depthPower: 8,
    grace: 18,
    description:
      'A tiny drake whose scales flicker like candle flames. It nests near underwater volcanic vents.',
    abilities: ['fire_gleam'],
  },
  {
    id: 'fire_opal_ember_fin',
    name: 'Ember Fin Serpent',
    gemType: 'fire_opal',
    rarity: 'common',
    lusterPower: 18,
    depthPower: 10,
    grace: 22,
    description:
      'A warm-water serpent with fins that glow orange-red. Often seen basking on heated rocks.',
    abilities: ['fire_gleam', 'warm_burst'],
  },
  {
    id: 'fire_opal_magma_turtle',
    name: 'Magma Turtle',
    gemType: 'fire_opal',
    rarity: 'uncommon',
    lusterPower: 8,
    depthPower: 35,
    grace: 15,
    description:
      'A slow but immensely durable turtle with a shell of solidified fire opal. It radiates comforting heat.',
    abilities: ['fire_gleam', 'molten_shell'],
  },
  {
    id: 'fire_opal_blaze_ray',
    name: 'Blaze Ray',
    gemType: 'fire_opal',
    rarity: 'rare',
    lusterPower: 55,
    depthPower: 45,
    grace: 30,
    description:
      'A manta-like creature that trails flames through the water. Its opal patterns shift like flowing lava.',
    abilities: ['fire_gleam', 'warm_burst', 'inferno_sweep'],
  },
  {
    id: 'fire_opal_inferno_whale',
    name: 'Inferno Whale',
    gemType: 'fire_opal',
    rarity: 'epic',
    lusterPower: 80,
    depthPower: 90,
    grace: 25,
    description:
      'A colossal whale whose body is studded with fire opals. When it breaches, the lagoon surface ignites.',
    abilities: ['fire_gleam', 'warm_burst', 'molten_shell', 'volcanic_song'],
  },

  // ── Australian Opal Creatures (5) ─────────────────────────────
  {
    id: 'australian_rainbow_minnow',
    name: 'Rainbow Minnow',
    gemType: 'australian',
    rarity: 'common',
    lusterPower: 14,
    depthPower: 5,
    grace: 20,
    description:
      'A shimmering minnow that displays every color of the spectrum. Schools of them create prismatic light shows.',
    abilities: ['prismatic_shift'],
  },
  {
    id: 'australian_galaxy_frog',
    name: 'Galaxy Tree Frog',
    gemType: 'australian',
    rarity: 'common',
    lusterPower: 20,
    depthPower: 8,
    grace: 24,
    description:
      'A tree frog with skin like a galaxy of stars. Its croak produces a halo of rainbow light.',
    abilities: ['prismatic_shift', 'star_field'],
  },
  {
    id: 'australian_spectral_eel',
    name: 'Spectral Eel',
    gemType: 'australian',
    rarity: 'uncommon',
    lusterPower: 25,
    depthPower: 20,
    grace: 28,
    description:
      'An eel whose body phases between solid and light. It can become invisible in the lagoon shallows.',
    abilities: ['prismatic_shift', 'light_bend'],
  },
  {
    id: 'australian_outback_sturgeon',
    name: 'Outback Sturgeon',
    gemType: 'australian',
    rarity: 'rare',
    lusterPower: 50,
    depthPower: 55,
    grace: 22,
    description:
      'An ancient sturgeon covered in brilliant opal plates. It carries the memory of a billion years of floodwaters.',
    abilities: ['prismatic_shift', 'star_field', 'flood_recall'],
  },
  {
    id: 'australian_dreamtime_serpent',
    name: 'Dreamtime Serpent',
    gemType: 'australian',
    rarity: 'legendary',
    lusterPower: 120,
    depthPower: 130,
    grace: 40,
    description:
      'The Rainbow Serpent of Aboriginal dreamtime, crystallized into opal form. It shaped the lagoon itself.',
    abilities: ['prismatic_shift', 'star_field', 'light_bend', 'flood_recall', 'dreamtime_call'],
  },

  // ── Ethiopian Opal Creatures (5) ──────────────────────────────
  {
    id: 'ethiopian_spring_nymph',
    name: 'Spring Nymph',
    gemType: 'ethiopian',
    rarity: 'common',
    lusterPower: 10,
    depthPower: 12,
    grace: 16,
    description:
      'A delicate water spirit that emerges from volcanic springs. Its body shifts between green and gold.',
    abilities: ['spring_bloom'],
  },
  {
    id: 'ethiopian_emerald_crab',
    name: 'Emerald Crab',
    gemType: 'ethiopian',
    rarity: 'common',
    lusterPower: 16,
    depthPower: 18,
    grace: 14,
    description:
      'A hardy crab with an emerald-green opal shell. It forages along the lagoon floor for mineral deposits.',
    abilities: ['spring_bloom', 'mineral_grip'],
  },
  {
    id: 'ethiopian_volcanic_newt',
    name: 'Volcanic Newt',
    gemType: 'ethiopian',
    rarity: 'uncommon',
    lusterPower: 22,
    depthPower: 28,
    grace: 20,
    description:
      'A fire-resistant newt that thrives in thermal pools. Its skin crackles with geothermal energy.',
    abilities: ['spring_bloom', 'thermal_pulse'],
  },
  {
    id: 'ethiopian_highland_dragon',
    name: 'Highland Dragon',
    gemType: 'ethiopian',
    rarity: 'rare',
    lusterPower: 60,
    depthPower: 50,
    grace: 35,
    description:
      'A small dragon that nests in Ethiopian highland caves. Its opal wings capture and redirect sunlight.',
    abilities: ['spring_bloom', 'thermal_pulse', 'highland_roar'],
  },
  {
    id: 'ethiopian_welo_giant',
    name: 'Welo Giant',
    gemType: 'ethiopian',
    rarity: 'epic',
    lusterPower: 85,
    depthPower: 75,
    grace: 50,
    description:
      'A massive opal golem that rises from the Welo opal fields. Its body contains entire ecosystems within its cracks.',
    abilities: ['spring_bloom', 'mineral_grip', 'thermal_pulse', 'welo_awakening'],
  },

  // ── Mexican Opal Creatures (5) ────────────────────────────────
  {
    id: 'mexican_cherry_shrimp',
    name: 'Cherry Fire Shrimp',
    gemType: 'mexican',
    rarity: 'common',
    lusterPower: 8,
    depthPower: 6,
    grace: 22,
    description:
      'A tiny shrimp with translucent pink opal shells. It dances in the currents leaving trails of pink light.',
    abilities: ['pink_sparkle'],
  },
  {
    id: 'mexican_flamenco_heron',
    name: 'Flamenco Heron',
    gemType: 'mexican',
    rarity: 'common',
    lusterPower: 15,
    depthPower: 10,
    grace: 30,
    description:
      'An elegant heron with feathers that flash pink and red. It performs ritual dances at dawn and dusk.',
    abilities: ['pink_sparkle', 'dance_of_light'],
  },
  {
    id: 'mexican_fire_jelly',
    name: 'Fire Jellyfish',
    gemType: 'mexican',
    rarity: 'uncommon',
    lusterPower: 30,
    depthPower: 15,
    grace: 25,
    description:
      'A jellyfish with tentacles that glow cherry red. Its sting deposits tiny opal crystals in the wound.',
    abilities: ['pink_sparkle', 'crystal_sting'],
  },
  {
    id: 'mexican_quetzal_fish',
    name: 'Quetzal Opal Fish',
    gemType: 'mexican',
    rarity: 'rare',
    lusterPower: 45,
    depthPower: 40,
    grace: 45,
    description:
      'A brilliantly colored fish with iridescent pink-green scales. It can temporarily blind predators with light.',
    abilities: ['pink_sparkle', 'dance_of_light', 'quetzal_flash'],
  },
  {
    id: 'mexican_maya_phantom',
    name: 'Maya Phantom',
    gemType: 'mexican',
    rarity: 'legendary',
    lusterPower: 110,
    depthPower: 100,
    grace: 55,
    description:
      'A spectral jaguar-fish hybrid from Mayan legend. Its body is pure Mexican fire opal that never dims.',
    abilities: ['pink_sparkle', 'dance_of_light', 'crystal_sting', 'quetzal_flash', 'maya_crown'],
  },

  // ── Boulder Opal Creatures (5) ────────────────────────────────
  {
    id: 'boulder_stone_carp',
    name: 'Stone Carp',
    gemType: 'boulder',
    rarity: 'common',
    lusterPower: 12,
    depthPower: 20,
    grace: 8,
    description:
      'A heavily armored carp with brown opal scales. It is nearly indestructible but very slow.',
    abilities: ['iron_scale'],
  },
  {
    id: 'boulder_bedrock_snail',
    name: 'Bedrock Snail',
    gemType: 'boulder',
    rarity: 'common',
    lusterPower: 10,
    depthPower: 22,
    grace: 6,
    description:
      'A massive snail that carries its boulder opal shell like a small mountain. It grinds through solid rock.',
    abilities: ['iron_scale', 'rock_grind'],
  },
  {
    id: 'boulder_canyon_lizard',
    name: 'Canyon Lizard',
    gemType: 'boulder',
    rarity: 'uncommon',
    lusterPower: 18,
    depthPower: 35,
    grace: 18,
    description:
      'A lizard that camouflages perfectly against ironstone walls. It can reshape small rocks with its tail.',
    abilities: ['iron_scale', 'canyon_climb'],
  },
  {
    id: 'boulder_ironstone_golem',
    name: 'Ironstone Golem',
    gemType: 'boulder',
    rarity: 'rare',
    lusterPower: 40,
    depthPower: 70,
    grace: 12,
    description:
      'A hulking golem of ironstone and boulder opal. It guards the deepest lagoon trenches from intruders.',
    abilities: ['iron_scale', 'rock_grind', 'canyon_climb', 'titan_stomp'],
  },
  {
    id: 'boulder_ancient_colossus',
    name: 'Ancient Colossus',
    gemType: 'boulder',
    rarity: 'epic',
    lusterPower: 65,
    depthPower: 95,
    grace: 15,
    description:
      'A titanic being of fused ironstone and precious opal veins. It has slept beneath the lagoon for millennia.',
    abilities: ['iron_scale', 'rock_grind', 'titan_stomp', 'colossus_awaken'],
  },

  // ── Honey Opal Creatures (5) ──────────────────────────────────
  {
    id: 'honey_goldfish',
    name: 'Golden Honey Fish',
    gemType: 'honey',
    rarity: 'common',
    lusterPower: 16,
    depthPower: 8,
    grace: 20,
    description:
      'A plump goldfish with scales like liquid amber. It secretes a sweet substance that attracts other creatures.',
    abilities: ['amber_glow'],
  },
  {
    id: 'honey_sunbeam_otter',
    name: 'Sunbeam Otter',
    gemType: 'honey',
    rarity: 'common',
    lusterPower: 14,
    depthPower: 12,
    grace: 26,
    description:
      'An otter whose fur glows amber in sunlight. It is the most playful and social of all lagoon creatures.',
    abilities: ['amber_glow', 'warm_hug'],
  },
  {
    id: 'honey_amber_fox',
    name: 'Amber Fox',
    gemType: 'honey',
    rarity: 'uncommon',
    lusterPower: 25,
    depthPower: 20,
    grace: 30,
    description:
      'A semi-aquatic fox with honey opal eyes. It can sense warmth across great distances and finds lost treasures.',
    abilities: ['amber_glow', 'treasure_sense'],
  },
  {
    id: 'honey_nectar_whale',
    name: 'Nectar Whale',
    gemType: 'honey',
    rarity: 'rare',
    lusterPower: 55,
    depthPower: 48,
    grace: 35,
    description:
      'A gentle whale whose song makes honey opals glow brighter. It nourishes the entire lagoon ecosystem.',
    abilities: ['amber_glow', 'warm_hug', 'nectar_song'],
  },
  {
    id: 'honey_solar_dragon',
    name: 'Solar Dragon',
    gemType: 'honey',
    rarity: 'legendary',
    lusterPower: 100,
    depthPower: 85,
    grace: 55,
    description:
      'A benevolent dragon of pure honey opal. Its presence makes all lagoon flowers bloom and all creatures healthy.',
    abilities: ['amber_glow', 'warm_hug', 'treasure_sense', 'nectar_song', 'solar_blessing'],
  },

  // ── Water Opal Creatures (5) ──────────────────────────────────
  {
    id: 'water_opal_droplet',
    name: 'Opal Droplet',
    gemType: 'water_opal',
    rarity: 'common',
    lusterPower: 10,
    depthPower: 10,
    grace: 24,
    description:
      'A sentient droplet of water opal that skates across the lagoon surface. It is almost invisible when still.',
    abilities: ['aqua_lace'],
  },
  {
    id: 'water_opal_ripple_frog',
    name: 'Ripple Frog',
    gemType: 'water_opal',
    rarity: 'common',
    lusterPower: 14,
    depthPower: 14,
    grace: 28,
    description:
      'A translucent frog that creates perfect ripples when it leaps. Each ripple contains tiny opal sparkles.',
    abilities: ['aqua_lace', 'ripple_shield'],
  },
  {
    id: 'water_opal_tide_dolphin',
    name: 'Tide Dolphin',
    gemType: 'water_opal',
    rarity: 'uncommon',
    lusterPower: 20,
    depthPower: 25,
    grace: 35,
    description:
      'A dolphin with a body of clear water opal. It can control local tides and always knows when storms approach.',
    abilities: ['aqua_lace', 'tide_call'],
  },
  {
    id: 'water_opal_abyss_leopard',
    name: 'Abyss Leopard Seal',
    gemType: 'water_opal',
    rarity: 'rare',
    lusterPower: 48,
    depthPower: 52,
    grace: 38,
    description:
      'A sleek seal with water opal spots that glow in the deep. It is the apex predator of the lagoon depths.',
    abilities: ['aqua_lace', 'ripple_shield', 'deep_prowl'],
  },
  {
    id: 'water_opal_celestial_kraken',
    name: 'Celestial Kraken',
    gemType: 'water_opal',
    rarity: 'epic',
    lusterPower: 75,
    depthPower: 80,
    grace: 45,
    description:
      'A kraken whose tentacles are made of liquid water opal. It guards the deepest trenches and ancient lagoon secrets.',
    abilities: ['aqua_lace', 'tide_call', 'ripple_shield', 'deep_prowl', 'abyssal_embrace'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: OL_DEPTHS — 8 Lagoon Depths
// ═══════════════════════════════════════════════════════════════════

export const OL_DEPTHS: readonly OlDepthDef[] = [
  {
    id: 'shallow_shores',
    name: 'Shallow Shores',
    description:
      'The sunlit shallows where the lagoon meets the open sea. A gentle nursery for common opal creatures.',
    depth: 0,
    dangerLevel: 1,
    requiredTitle: 'title_pebble_collector',
    gemType: 'water_opal',
    bgGradient: 'linear-gradient(180deg, #E0F0FF 0%, #00B4D8 50%, #0077B6 100%)',
    ambientColor: OL_OPAL_WHITE,
  },
  {
    id: 'opal_meadows',
    name: 'Opal Meadows',
    description:
      'Vast underwater fields of opal grass swaying in the current. Fire opal creatures bask on warm thermal rocks here.',
    depth: 1,
    dangerLevel: 2,
    requiredTitle: 'title_pebble_collector',
    gemType: 'fire_opal',
    bgGradient: 'linear-gradient(180deg, #FF6B35 0%, #FFB703 50%, #E0F0FF 100%)',
    ambientColor: OL_FIRE_OPAL_ORANGE,
  },
  {
    id: 'crystal_caves',
    name: 'Crystal Caves',
    description:
      'Limestone caves glittering with opal formations. Boulder opal creatures hide in the rocky crevices.',
    depth: 2,
    dangerLevel: 3,
    requiredTitle: 'title_gem_seeker',
    gemType: 'boulder',
    bgGradient: 'linear-gradient(180deg, #8B6914 0%, #0077B6 50%, #E0F0FF 100%)',
    ambientColor: OL_BOULDER_BROWN,
  },
  {
    id: 'rainbow_reef',
    name: 'Rainbow Reef',
    description:
      'A spectacular reef where Australian opals grow like coral. Ethiopian opal creatures dart among the branches.',
    depth: 3,
    dangerLevel: 4,
    requiredTitle: 'title_lagoon_explorer',
    gemType: 'australian',
    bgGradient: 'linear-gradient(180deg, #00B4D8 0%, #2EC4B6 50%, #FF69B4 100%)',
    ambientColor: OL_AUSTRALIAN_BLUE,
  },
  {
    id: 'amber_grotto',
    name: 'Amber Grotto',
    description:
      'A warm underwater cave lined with honey opal deposits. The water here is thick with golden particles.',
    depth: 4,
    dangerLevel: 5,
    requiredTitle: 'title_opal_scholar',
    gemType: 'honey',
    bgGradient: 'linear-gradient(180deg, #FFB703 0%, #FF6B35 50%, #0077B6 100%)',
    ambientColor: OL_HONEY_AMBER,
  },
  {
    id: 'cherry_abyss',
    name: 'Cherry Abyss',
    description:
      'A deep trench where Mexican fire opal formations cast red light. Only the bravest divers venture here.',
    depth: 5,
    dangerLevel: 6,
    requiredTitle: 'title_jewel_guardian',
    gemType: 'mexican',
    bgGradient: 'linear-gradient(180deg, #FF69B4 0%, #0077B6 50%, #2EC4B6 100%)',
    ambientColor: OL_JEWEL_PINK,
  },
  {
    id: 'volcanic_deeps',
    name: 'Volcanic Deeps',
    description:
      'Hydrothermal vents spew mineral-rich water. Ethiopian opal creatures thrive in the boiling pools.',
    depth: 6,
    dangerLevel: 7,
    requiredTitle: 'title_crystal_sovereign',
    gemType: 'ethiopian',
    bgGradient: 'linear-gradient(180deg, #2EC4B6 0%, #8B6914 50%, #FF6B35 100%)',
    ambientColor: OL_ETHIOPIAN_GREEN,
  },
  {
    id: 'opals_heart',
    name: "Opal's Heart",
    description:
      'The mythical center of the lagoon where all opal energies converge. The rarest legendary creatures dwell here.',
    depth: 7,
    dangerLevel: 8,
    requiredTitle: 'title_opal_lord',
    gemType: 'water_opal',
    bgGradient: 'linear-gradient(180deg, #E0F0FF 0%, #FF69B4 50%, #FFB703 100%)',
    ambientColor: OL_OPAL_WHITE,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: OL_MATERIALS — 30 Gem/Mineral Materials
// ═══════════════════════════════════════════════════════════════════

export const OL_MATERIALS: readonly OlMaterialDef[] = [
  // Common (8)
  { id: 'mat_opal_dust', name: 'Opal Dust', emoji: '✨', type: 'dust', rarity: 'common', lusterBonus: 2, depthBonus: 1, value: 10, description: 'Fine opal dust collected from the lagoon floor. Glows faintly in the dark.' },
  { id: 'mat_shimmer_scale', name: 'Shimmer Scale', emoji: '🐟', type: 'shard', rarity: 'common', lusterBonus: 3, depthBonus: 2, value: 12, description: 'A small opal scale shed by a common creature. Useful in basic polishing.' },
  { id: 'mat_fire_shard', name: 'Fire Shard', emoji: '🔶', type: 'shard', rarity: 'common', lusterBonus: 4, depthBonus: 1, value: 14, description: 'A warm shard from a fire opal formation. Crackles with residual heat.' },
  { id: 'mat_water_drop', name: 'Water Drop Opal', emoji: '💧', type: 'core', rarity: 'common', lusterBonus: 2, depthBonus: 3, value: 11, description: 'A teardrop-shaped water opal. Clear with blue-green play of color.' },
  { id: 'mat_honey_bead', name: 'Honey Bead', emoji: '🟡', type: 'core', rarity: 'common', lusterBonus: 3, depthBonus: 2, value: 13, description: 'A smooth round bead of honey opal. Warm and sweet-smelling.' },
  { id: 'mat_rock_fragment', name: 'Ironstone Fragment', emoji: '🪨', type: 'shard', rarity: 'common', lusterBonus: 1, depthBonus: 4, value: 8, description: 'A chunk of ironstone matrix containing small boulder opal veins.' },
  { id: 'mat_pink_chip', name: 'Pink Opal Chip', emoji: '💎', type: 'shard', rarity: 'common', lusterBonus: 3, depthBonus: 1, value: 15, description: 'A small chip of Mexican pink opal. Delicate but beautiful.' },
  { id: 'mat_rainbow_fleck', name: 'Rainbow Fleck', emoji: '🌈', type: 'dust', rarity: 'common', lusterBonus: 5, depthBonus: 0, value: 16, description: 'A fleck of Australian opal displaying every color. Prized for polishing.' },

  // Uncommon (7)
  { id: 'mat_fire_opal_nugget', name: 'Fire Opal Nugget', emoji: '🔥', type: 'core', rarity: 'uncommon', lusterBonus: 10, depthBonus: 5, value: 75, description: 'A solid nugget of fire opal. Glows with intense orange inner fire.' },
  { id: 'mat_australian_seam', name: 'Australian Opal Seam', emoji: '🔷', type: 'shard', rarity: 'uncommon', lusterBonus: 8, depthBonus: 8, value: 80, description: 'A strip of Australian opal still embedded in sandstone. Rich play of color.' },
  { id: 'mat_ethiopian_crystal', name: 'Ethiopian Crystal Opal', emoji: '💚', type: 'core', rarity: 'uncommon', lusterBonus: 12, depthBonus: 4, value: 85, description: 'A crystal-clear Ethiopian opal with vivid green flashes. Exceptionally pure.' },
  { id: 'mat_mexican_fire_web', name: 'Mexican Fire Web', emoji: '🕸️', type: 'shard', rarity: 'uncommon', lusterBonus: 7, depthBonus: 10, value: 70, description: 'A web-like pattern of Mexican fire opal. The interlocking structure is incredibly strong.' },
  { id: 'mat_boulder_slab', name: 'Boulder Opal Slab', emoji: '🧱', type: 'shard', rarity: 'uncommon', lusterBonus: 6, depthBonus: 12, value: 65, description: 'A thick slab of boulder opal in ironstone. Immensely heavy and durable.' },
  { id: 'mat_honey_geode', name: 'Honey Opal Geode', emoji: '🍯', type: 'core', rarity: 'uncommon', lusterBonus: 9, depthBonus: 7, value: 72, description: 'A geode filled with honey opal crystals. Cracking it open releases golden light.' },
  { id: 'mat_water_opal_orb', name: 'Water Opal Orb', emoji: '🔮', type: 'core', rarity: 'uncommon', lusterBonus: 11, depthBonus: 6, value: 78, description: 'A perfect sphere of water opal. Looking into it reveals underwater visions.' },

  // Rare (6)
  { id: 'mat_fire_opal_star', name: 'Fire Opal Star', emoji: '⭐', type: 'core', rarity: 'rare', lusterBonus: 30, depthBonus: 15, value: 350, description: 'A star-cut fire opal of exceptional quality. It burns with an eternal inner flame.' },
  { id: 'mat_black_opal_heart', name: 'Black Opal Heart', emoji: '🖤', type: 'core', rarity: 'rare', lusterBonus: 25, depthBonus: 25, value: 400, description: 'A heart-shaped Australian black opal. The most valuable opal variety in existence.' },
  { id: 'mat_emerald_opal_matrix', name: 'Emerald Opal Matrix', emoji: '🌿', type: 'shard', rarity: 'rare', lusterBonus: 20, depthBonus: 20, value: 320, description: 'Ethiopian opal intergrown with emerald crystals. A natural fusion of two gems.' },
  { id: 'mat_cherry_opal_blossom', name: 'Cherry Opal Blossom', emoji: '🌸', type: 'core', rarity: 'rare', lusterBonus: 28, depthBonus: 12, value: 360, description: 'A flower-shaped Mexican cherry opal. It seems to bloom brighter each day.' },
  { id: 'mat_yowah_nut', name: 'Yowah Nut', emoji: '🥜', type: 'core', rarity: 'rare', lusterBonus: 22, depthBonus: 22, value: 340, description: 'A rare boulder opal nodule from Yowah, Australia. Splitting it reveals opal patterns.' },
  { id: 'mat_amber_opal_crown', name: 'Amber Opal Crown', emoji: '👑', type: 'core', rarity: 'rare', lusterBonus: 18, depthBonus: 28, value: 380, description: 'A crown-shaped honey opal of extraordinary warmth. It makes any creature feel loved.' },

  // Epic (5)
  { id: 'mat_fire_opal_sun', name: 'Fire Opal Sun', emoji: '☀️', type: 'core', rarity: 'epic', lusterBonus: 60, depthBonus: 30, value: 1500, description: 'A disc of fire opal that generates its own light. A miniature sun in opal form.' },
  { id: 'mat_olympic_australian', name: 'Olympic Australian', emoji: '🏅', type: 'core', rarity: 'epic', lusterBonus: 50, depthBonus: 50, value: 1800, description: 'The finest Australian opal ever found. It displays the Olympic colors in perfect sequence.' },
  { id: 'mat_welo_crystal_skull', name: 'Welo Crystal Skull', emoji: '💀', type: 'artifact_shard', rarity: 'epic', lusterBonus: 40, depthBonus: 35, value: 1600, description: 'A skull carved from a single Ethiopian crystal opal. Ancient power emanates from its eyes.' },
  { id: 'mat_dragon_opal_vein', name: 'Dragon Opal Vein', emoji: '🐲', type: 'shard', rarity: 'epic', lusterBonus: 55, depthBonus: 40, value: 1700, description: 'A massive vein of honey opal shot through with dragon-scale patterns. Warm to the touch.' },
  { id: 'mat_leviathan_jelly', name: 'Leviathan Jelly Opal', emoji: '🪼', type: 'core', rarity: 'epic', lusterBonus: 45, depthBonus: 55, value: 1900, description: 'A living water opal that pulses with the rhythm of the deep lagoon currents.' },

  // Legendary (4)
  { id: 'mat_eternal_flame_opal', name: 'Eternal Flame Opal', emoji: '🕯️', type: 'essence', rarity: 'legendary', lusterBonus: 80, depthBonus: 60, value: 8000, description: 'A fire opal that has burned for ten thousand years. It can never be extinguished.' },
  { id: 'mat_aurora_opal_matrix', name: 'Aurora Opal Matrix', emoji: '🌌', type: 'essence', rarity: 'legendary', lusterBonus: 70, depthBonus: 70, value: 9000, description: 'An Australian opal that projects actual aurora borealis. Looking at it reveals visions of the cosmos.' },
  { id: 'mat_ophidian_venom_opal', name: 'Ophidian Venom Opal', emoji: '🐍', type: 'essence', rarity: 'legendary', lusterBonus: 90, depthBonus: 50, value: 10000, description: 'A Ethiopian opal infused with primordial serpent venom. It pulses with raw life force.' },
  { id: 'mat_lagoon_origin_shard', name: 'Lagoon Origin Shard', emoji: '💎', type: 'essence', rarity: 'legendary', lusterBonus: 100, depthBonus: 100, value: 12000, description: 'A shard from the original opal that created the lagoon. It contains the memory of creation itself.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: OL_STRUCTURES — 25 Lagoon Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const OL_STRUCTURES: readonly OlStructureDef[] = [
  // ── Lagoon Pools (7) ──────────────────────────────────────────
  { id: 'str_shallow_pool', name: 'Shallow Nursery Pool', emoji: '🏊', category: 'lagoon_pool', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A gentle pool for raising young opal creatures. Warm and safe.' },
  { id: 'str_fire_grotto', name: 'Fire Opal Grotto', emoji: '🔥', category: 'lagoon_pool', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A heated grotto where fire opal creatures thrive and breed.' },
  { id: 'str_rainbow_cove', name: 'Rainbow Cove', emoji: '🌈', category: 'lagoon_pool', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'A cove where Australian opal light creates permanent rainbows across the water.' },
  { id: 'str_thermal_basin', name: 'Thermal Basin', emoji: '♨️', category: 'lagoon_pool', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'A naturally heated basin where Ethiopian opal creatures regenerate rapidly.' },
  { id: 'str_cherry_lagoon', name: 'Cherry Lagoon', emoji: '🍒', category: 'lagoon_pool', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A lagoon inlet tinged pink by Mexican opal deposits. Incredibly beautiful.' },
  { id: 'str_amber_cove', name: 'Amber Sun Cove', emoji: '🌅', category: 'lagoon_pool', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A sun-drenched cove where honey opal creatures bask in golden warmth.' },
  { id: 'str_deep_sanctuary', name: 'Deep Water Sanctuary', emoji: '🌊', category: 'lagoon_pool', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'A pressurized deep-water chamber for water opal creatures of the abyss.' },

  // ── Polish Benches (6) ────────────────────────────────────────
  { id: 'str_basic_polisher', name: 'Basic Gem Polisher', emoji: '🔧', category: 'polish_bench', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A simple polishing wheel for enhancing creature luster. Grinds dust into shine.' },
  { id: 'str_lapidary_studio', name: 'Master Lapidary Studio', emoji: '💎', category: 'polish_bench', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A professional cutting and polishing studio. Can reveal hidden opal patterns.' },
  { id: 'str_spectrum_forge', name: 'Spectrum Forge', emoji: '🌟', category: 'polish_bench', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A magical forge that amplifies the rainbow play of color in any opal creature.' },
  { id: 'str_aurora_chamber', name: 'Aurora Chamber', emoji: '🌌', category: 'polish_bench', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A chamber that bathes creatures in aurora light, permanently boosting their luster.' },
  { id: 'str_celestial_polisher', name: 'Celestial Polisher', emoji: '✨', category: 'polish_bench', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A polisher powered by starlight. It can make any opal shine like a captured star.' },
  { id: 'str_origin_grinder', name: 'Origin Stone Grinder', emoji: '🪨', category: 'polish_bench', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'An ancient grinder made from the lagoon\'s first opal. It reveals hidden depths in any creature.' },

  // ── Gem Labs (5) ──────────────────────────────────────────────
  { id: 'str_basic_lab', name: 'Basic Gem Laboratory', emoji: '🧪', category: 'gem_lab', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A simple lab for analyzing opal compositions and extracting gem dust.' },
  { id: 'str_alchemy_table', name: 'Opal Alchemy Table', emoji: '⚗️', category: 'gem_lab', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'An advanced table for combining opal materials into powerful gem compounds.' },
  { id: 'str_crucible_vault', name: 'Opal Crucible Vault', emoji: '🏺', category: 'gem_lab', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A climate-controlled vault with a magical crucible for synthesizing rare materials.' },
  { id: 'str_pure_extraction', name: 'Pure Opal Extractor', emoji: '🔬', category: 'gem_lab', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A device that extracts pure opal essence from any material sample.' },
  { id: 'str_creation_forge', name: 'Creation Forge', emoji: '🌋', category: 'gem_lab', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate gem laboratory. Can synthesize legendary opal materials from raw elements.' },

  // ── Crystal Altars (4) ────────────────────────────────────────
  { id: 'str_shore_altar', name: 'Shore Crystal Altar', emoji: '🏛️', category: 'crystal_altar', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A stone altar on the shore that amplifies boulder and water opal abilities.' },
  { id: 'str_reef_shrine', name: 'Reef Crystal Shrine', emoji: '🪸', category: 'crystal_altar', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'A living shrine of opal coral that grants wisdom and insight to collectors.' },
  { id: 'str_obelisk_light', name: 'Prism Obelisk', emoji: '🔺', category: 'crystal_altar', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A towering crystal obelisk that splits light into opal spectra, boosting all powers.' },
  { id: 'str_depth_monument', name: 'Depth Monument', emoji: '👑', category: 'crystal_altar', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'A monument at the deepest point. All opal blessings are amplified to their maximum.' },

  // ── Artifact Shrines (3) ──────────────────────────────────────
  { id: 'str_relic_glass', name: 'Relic Display Glass', emoji: '🖼️', category: 'artifact_shrine', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A glass case for displaying opal relics and enhancing their passive effects.' },
  { id: 'str_sacred_vault', name: 'Sacred Artifact Vault', emoji: '🔒', category: 'artifact_shrine', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A magically sealed vault that preserves and amplifies the power of stored artifacts.' },
  { id: 'str_origin_shrine', name: 'Origin Opal Shrine', emoji: '💠', category: 'artifact_shrine', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'A shrine built around a fragment of the original lagoon opal. It can restore and upgrade artifacts.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: OL_ABILITIES — 22 Jewel Abilities
// ═══════════════════════════════════════════════════════════════════

export const OL_ABILITIES: readonly OlAbilityDef[] = [
  { id: 'ab_opal_flash', name: 'Opal Flash', emoji: '✨', gemType: 'water_opal', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Emit a blinding flash of opal light that stuns nearby creatures.' },
  { id: 'ab_fire_gleam', name: 'Fire Gleam', emoji: '🔥', gemType: 'fire_opal', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Ignite your opal scales to burn with inner fire for a short duration.' },
  { id: 'ab_stone_harden', name: 'Stone Harden', emoji: '🪨', gemType: 'boulder', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 10, description: 'Harden your opal scales to ironstone density, gaining immense defense.' },
  { id: 'ab_prismatic_shift', name: 'Prismatic Shift', emoji: '🌈', gemType: 'australian', type: 'active', rarity: 'common', energyCost: 12, cooldown: 90, power: 5, description: 'Shift the colors of your opal body to become nearly invisible.' },
  { id: 'ab_amber_glow', name: 'Amber Glow', emoji: '🟡', gemType: 'honey', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Radiate warm amber light that soothes nearby creatures and heals allies.' },
  { id: 'ab_pink_sparkle', name: 'Pink Sparkle', emoji: '💖', gemType: 'mexican', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 10, description: 'Create dazzling pink sparkles that confuse enemies and charm observers.' },
  { id: 'ab_spring_bloom', name: 'Spring Bloom', emoji: '🌿', gemType: 'ethiopian', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 18, description: 'Rapidly grow opal crystals around you to form protective barriers.' },
  { id: 'ab_aqua_lace', name: 'Aqua Lace', emoji: '🌊', gemType: 'water_opal', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Weave a net of water opal light that traps and calms aggressive creatures.' },
  { id: 'ab_warm_burst', name: 'Warm Burst', emoji: '♨️', gemType: 'fire_opal', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 90, power: 35, description: 'Release a burst of thermal energy that accelerates creature growth.' },
  { id: 'ab_rock_grind', name: 'Rock Grind', emoji: '⛏️', gemType: 'boulder', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Grind nearby rocks into opal dust, creating a blinding mineral cloud.' },
  { id: 'ab_star_field', name: 'Star Field', emoji: '⭐', gemType: 'australian', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 100, power: 32, description: 'Project a field of opal stars that drain energy from hostile creatures.' },
  { id: 'ab_warm_hug', name: 'Warm Hug', emoji: '🤗', gemType: 'honey', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 25, description: 'Embrace a creature with honey opal warmth, fully restoring its mood and health.' },
  { id: 'ab_dance_of_light', name: 'Dance of Light', emoji: '💃', gemType: 'mexican', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 80, power: 22, description: 'Perform a mesmerizing dance that makes all creatures in range peaceful.' },
  { id: 'ab_thermal_pulse', name: 'Thermal Pulse', emoji: '🌡️', gemType: 'ethiopian', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 55, power: 30, description: 'Emit rhythmic pulses of thermal energy that boost all nearby creature stats.' },
  { id: 'ab_tide_call', name: 'Tide Call', emoji: '🌊', gemType: 'water_opal', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Summon the lagoon tide to sweep creatures to safety or push away threats.' },
  { id: 'ab_inferno_sweep', name: 'Inferno Sweep', emoji: '🌋', gemType: 'fire_opal', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Sweep an area with fire opal flames that purify water and reveal hidden materials.' },
  { id: 'ab_canyon_climb', name: 'Canyon Climb', emoji: '🧗', gemType: 'boulder', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Automatically detect rare materials in walls and access hidden lagoon passages.' },
  { id: 'ab_light_bend', name: 'Light Bend', emoji: '🔦', gemType: 'australian', type: 'active', rarity: 'rare', energyCost: 40, cooldown: 180, power: 60, description: 'Bend light itself to create illusions, shields, and focused beams of opal energy.' },
  { id: 'ab_treasure_sense', name: 'Treasure Sense', emoji: '🗺️', gemType: 'honey', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 120, power: 40, description: 'Sense all valuable materials and creatures within a large radius.' },
  { id: 'ab_crystal_sting', name: 'Crystal Sting', emoji: '💎', gemType: 'mexican', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 120, power: 45, description: 'Inject tiny opal crystals into a target that grow and enhance the target over time.' },
  { id: 'ab_deep_prowl', name: 'Deep Prowl', emoji: '🦭', gemType: 'water_opal', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Enter a deep meditation state where you control lagoon currents and pressure.' },
  { id: 'ab_dreamtime_call', name: 'Dreamtime Call', emoji: '🌌', gemType: 'australian', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'Call upon the ancient dreamtime. All creatures in the lagoon become one with the opal.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: OL_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const OL_ACHIEVEMENTS: readonly OlAchievementDef[] = [
  { id: 'ach_first_collect', name: 'First Collection', emoji: '💎', description: 'Collect your first opal creature.', condition: 'collect_1', reward: { pearls: 50, prestige: 10 } },
  { id: 'ach_five_collected', name: 'Collector\'s Hand', emoji: '🤚', description: 'Collect 5 different opal creatures.', condition: 'collect_5', reward: { pearls: 200, prestige: 40 } },
  { id: 'ach_first_polish', name: 'First Polish', emoji: '✨', description: 'Polish a creature for the first time.', condition: 'polish_1', reward: { pearls: 80, prestige: 15 } },
  { id: 'ach_ten_polished', name: 'Master Gemcutter', emoji: '💎', description: 'Polish creatures 10 times.', condition: 'polish_10', reward: { pearls: 300, prestige: 60 } },
  { id: 'ach_first_build', name: 'Groundbreaking', emoji: '🏗️', description: 'Build your first lagoon structure.', condition: 'build_1', reward: { pearls: 100, prestige: 20 } },
  { id: 'ach_five_builds', name: 'Lagoon Architect', emoji: '🏛️', description: 'Build 5 different lagoon structures.', condition: 'build_5', reward: { pearls: 500, prestige: 80 } },
  { id: 'ach_depth_explore', name: 'Depth Explorer', emoji: '🗺️', description: 'Explore 4 different lagoon depths.', condition: 'depth_4', reward: { pearls: 400, prestige: 50 } },
  { id: 'ach_all_depths', name: 'Abyssal Cartographer', emoji: '🌍', description: 'Explore all 8 lagoon depths.', condition: 'depth_8', reward: { pearls: 2000, prestige: 200 } },
  { id: 'ach_rare_collect', name: 'Rare Find', emoji: '💎', description: 'Collect a rare opal creature.', condition: 'rare_collect', reward: { pearls: 500, prestige: 100 } },
  { id: 'ach_epic_collect', name: 'Epic Discovery', emoji: '🌟', description: 'Collect an epic opal creature.', condition: 'epic_collect', reward: { pearls: 1500, prestige: 250 } },
  { id: 'ach_legendary_collect', name: 'Legendary Collector', emoji: '👑', description: 'Collect a legendary opal creature.', condition: 'legendary_collect', reward: { pearls: 5000, prestige: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first opal artifact.', condition: 'relic_1', reward: { pearls: 300, prestige: 60 } },
  { id: 'ach_five_relics', name: 'Relic Hunter', emoji: '🔍', description: 'Collect 5 different artifacts.', condition: 'relic_5', reward: { pearls: 1000, prestige: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first lagoon event.', condition: 'event_1', reward: { pearls: 200, prestige: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 lagoon events.', condition: 'event_10', reward: { pearls: 800, prestige: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { pearls: 2000, prestige: 200 } },
  { id: 'ach_all_gem_types', name: 'Gem Type Master', emoji: '🌈', description: 'Collect at least one creature of each gem type.', condition: 'all_gem_types', reward: { pearls: 3000, prestige: 300 } },
  { id: 'ach_max_prestige', name: 'Opal Deity', emoji: '👑', description: 'Reach the title of Opal Deity.', condition: 'max_title', reward: { pearls: 10000, prestige: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: OL_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const OL_TITLES: readonly OlTitleDef[] = [
  { id: 'title_pebble_collector', name: 'Pebble Collector', emoji: '🪨', minPrestige: 0, minCreatures: 0, description: 'A beginner who has just started collecting opal pebbles from the lagoon shore.' },
  { id: 'title_gem_seeker', name: 'Gem Seeker', emoji: '💎', minPrestige: 50, minCreatures: 3, description: 'An aspiring collector who can identify and care for common opal creatures.' },
  { id: 'title_lagoon_explorer', name: 'Lagoon Explorer', emoji: '🗺️', minPrestige: 200, minCreatures: 7, description: 'A skilled diver who explores the lagoon depths and tames uncommon creatures.' },
  { id: 'title_opal_scholar', name: 'Opal Scholar', emoji: '📜', minPrestige: 500, minCreatures: 12, description: 'An expert in opal lore who commands respect across the lagoon community.' },
  { id: 'title_jewel_guardian', name: 'Jewel Guardian', emoji: '🛡️', minPrestige: 1200, minCreatures: 18, description: 'A guardian of the lagoon\'s rarest treasures, trusted with epic creatures.' },
  { id: 'title_crystal_sovereign', name: 'Crystal Sovereign', emoji: '👑', minPrestige: 2500, minCreatures: 24, description: 'A ruler of the lagoon crystal kingdom, commanding a vast collection.' },
  { id: 'title_opal_lord', name: 'Opal Lord', emoji: '💠', minPrestige: 5000, minCreatures: 30, description: 'A legendary lord whose opal collection is the envy of the entire world.' },
  { id: 'title_opal_deity', name: 'Opal Deity', emoji: '🌟', minPrestige: 10000, minCreatures: 35, description: 'The supreme Opal Deity, master of all gem types and guardian of the lagoon\'s heart.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: OL_RELICS — 15 Legendary Opal Artifacts
// ═══════════════════════════════════════════════════════════════════

export const OL_RELICS: readonly OlRelicDef[] = [
  { id: 'relic_crown_opals', name: 'Crown of Opals', emoji: '👑', rarity: 'epic', gemType: 'honey', lusterBoost: 20, depthBoost: 15, graceBoost: 10, value: 2000, description: 'A golden crown studded with seven perfect opals, one of each gem type.' },
  { id: 'relic_scepter_fire', name: 'Scepter of Inner Fire', emoji: '🪄', rarity: 'epic', gemType: 'fire_opal', lusterBoost: 35, depthBoost: 5, graceBoost: 5, value: 2200, description: 'A scepter with a blazing fire opal at its tip. It channels raw thermal energy.' },
  { id: 'relic_lagoon_pendant', name: 'Lagoon Depth Pendant', emoji: '📿', rarity: 'rare', gemType: 'water_opal', lusterBoost: 10, depthBoost: 10, graceBoost: 15, value: 800, description: 'A pendant containing a water opal that never dries. It grants creatures uncanny grace.' },
  { id: 'relic_ironstone_ring', name: 'Ironstone Guardian Ring', emoji: '💍', rarity: 'rare', gemType: 'boulder', lusterBoost: 5, depthBoost: 20, graceBoost: 10, value: 750, description: 'A ring of ironstone and boulder opal. It hardens creature defenses to stone-like levels.' },
  { id: 'relic_abyss_mask', name: 'Abyssal Mask', emoji: '🎭', rarity: 'epic', gemType: 'water_opal', lusterBoost: 25, depthBoost: 20, graceBoost: 15, value: 2500, description: 'A mask that lets the wearer see through the deepest lagoon waters.' },
  { id: 'relic_aurora_cloak', name: 'Aurora Cloak', emoji: '🧥', rarity: 'epic', gemType: 'australian', lusterBoost: 15, depthBoost: 15, graceBoost: 25, value: 2400, description: 'A cloak woven from Australian opal fibers. It shimmers with aurora patterns.' },
  { id: 'relic_volcanic_hammer', name: 'Volcanic Opal Hammer', emoji: '🔨', rarity: 'epic', gemType: 'ethiopian', lusterBoost: 20, depthBoost: 25, graceBoost: 10, value: 2600, description: 'A hammer forged from Ethiopian volcanic opal. It can crack any mineral barrier.' },
  { id: 'relic_eternal_eye', name: 'Eternal Opal Eye', emoji: '👁️', rarity: 'legendary', gemType: 'honey', lusterBoost: 40, depthBoost: 30, graceBoost: 20, value: 8000, description: 'An eye made of perfect honey opal. It sees all treasures in the lagoon.' },
  { id: 'relic_dreamtime_stone', name: 'Dreamtime Stone', emoji: '🗿', rarity: 'legendary', gemType: 'australian', lusterBoost: 30, depthBoost: 40, graceBoost: 15, value: 7500, description: 'A stone from the original Dreamtime. It grants visions of all lagoon depths.' },
  { id: 'relic_fire_opal_heart', name: 'Heart of Fire Opal', emoji: '❤️', rarity: 'legendary', gemType: 'fire_opal', lusterBoost: 60, depthBoost: 20, graceBoost: 20, value: 10000, description: 'A living heart of fire opal. It beats with the rhythm of the lagoon itself.' },
  { id: 'relic_lagoon_vessel', name: 'Lagoon Origin Vessel', emoji: '🏺', rarity: 'legendary', gemType: 'water_opal', lusterBoost: 25, depthBoost: 35, graceBoost: 30, value: 9000, description: 'A vessel that contains water from the lagoon\'s creation. Infinite nourishment.' },
  { id: 'relic_abyssal_scepter', name: 'Abyssal Depth Scepter', emoji: '⚜️', rarity: 'legendary', gemType: 'boulder', lusterBoost: 35, depthBoost: 35, graceBoost: 25, value: 9500, description: 'A scepter from the deepest trench. It commands the crushing pressure of the abyss.' },
  { id: 'relic_opal_codex', name: 'Opal Codex', emoji: '📖', rarity: 'epic', gemType: 'ethiopian', lusterBoost: 20, depthBoost: 15, graceBoost: 30, value: 2300, description: 'A book whose pages are thin opal sheets. They contain all opal knowledge.' },
  { id: 'relic_jaguar_claw', name: 'Opal Jaguar Claw', emoji: '🐾', rarity: 'legendary', gemType: 'mexican', lusterBoost: 50, depthBoost: 45, graceBoost: 25, value: 11000, description: 'A claw of pure Mexican fire opal. It makes creatures fearless and incredibly fierce.' },
  { id: 'relic_origin_egg', name: 'Origin Opal Egg', emoji: '🥚', rarity: 'legendary', gemType: 'water_opal', lusterBoost: 30, depthBoost: 30, graceBoost: 40, value: 12000, description: 'An egg from the original lagoon creation. If a creature falls, it is reborn from its shell.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: OL_EVENTS — 12 Lagoon Events
// ═══════════════════════════════════════════════════════════════════

export const OL_EVENTS: readonly OlEventDef[] = [
  { id: 'evt_opal_rain', name: 'Opal Rain', emoji: '🌧️', durationTurns: 5, effectType: 'buff', effectDescription: 'Water opal creatures double power. All depths accessible.', description: 'A rare rain of opal shards falls from the sky, enriching the lagoon waters.' },
  { id: 'evt_volcanic_eruption', name: 'Volcanic Eruption', emoji: '🌋', durationTurns: 3, effectType: 'debuff', effectDescription: 'Grace reduced by 30%. Fire opal creatures immune.', description: 'An underwater volcano erupts, superheating parts of the lagoon and creating danger zones.' },
  { id: 'evt_abyssal_awakening', name: 'Abyssal Awakening', emoji: '🕳️', durationTurns: 4, effectType: 'special', effectDescription: 'Water opal creatures gain +50 power. Rare materials appear.', description: 'Ancient creatures stir from the deepest trenches, disturbing long-buried opal deposits.' },
  { id: 'evt_lunar_eclipse', name: 'Lunar Eclipse', emoji: '🌑', durationTurns: 2, effectType: 'special', effectDescription: 'Boulder opal creatures triple power. Honey opal creatures halved.', description: 'The moon turns dark over the lagoon. Deep-water creatures surge while surface creatures retreat.' },
  { id: 'evt_mineral_storm', name: 'Mineral Storm', emoji: '🌪️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Ethiopian creatures lose 25% power. Bonus materials available.', description: 'A storm of mineral-rich sediment sweeps the lagoon, clouding waters and scattering materials.' },
  { id: 'evt_golden_tide', name: 'Golden Tide', emoji: '🌅', durationTurns: 5, effectType: 'buff', effectDescription: 'Pearl rewards doubled. Honey opal creatures gain +30% power.', description: 'The tide turns golden with dissolved opal. A time of abundance and discovery.' },
  { id: 'evt_rainbow_festival', name: 'Rainbow Festival', emoji: '🌈', durationTurns: 4, effectType: 'buff', effectDescription: 'All creatures gain +20% mood. Australian opal creatures enhanced.', description: 'The lagoon erupts in prismatic light. Creatures are unusually cooperative and joyful.' },
  { id: 'evt_tide_pirates', name: 'Tide Pirates', emoji: '🏴‍☠️', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% pearls. Artifact discovery chance increased.', description: 'Opal pirates raid the lagoon! They steal pearls but drop rare artifacts in their wake.' },
  { id: 'evt_phoenix_opal_rising', name: 'Phoenix Opal Rising', emoji: '🔥', durationTurns: 3, effectType: 'buff', effectDescription: 'Fire opal creatures resurrect once. All healing doubled.', description: 'A phoenix of fire opal rises from the depths, blessing all fire creatures with rebirth.' },
  { id: 'evt_lagoon_drought', name: 'Lagoon Drought', emoji: '☀️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Water opal creatures halved. Boulder creatures thrive.', description: 'The lagoon waters recede, exposing ancient opal beds but stranding aquatic creatures.' },
  { id: 'evt_crystal_madness', name: 'Crystal Madness', emoji: '🔮', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus prestige for each exploration. Puzzle rewards doubled.', description: 'The opal formations come alive with shifting patterns that contain ancient secrets.' },
  { id: 'evt_great_migration', name: 'Great Opal Migration', emoji: '🐠', durationTurns: 6, effectType: 'buff', effectDescription: 'Collection chance doubled. New creature species appear.', description: 'Thousands of opal creatures migrate through the lagoon. The perfect time to collect.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const OL_MAX_CREATURE_LEVEL = 50
const OL_MAX_STRUCTURE_LEVEL = 10
const OL_INITIAL_PEARLS = 200
const OL_INITIAL_PRESTIGE = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function olXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function olCalcStats(species: OlCreatureSpecies, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    lusterPower: Math.floor(species.lusterPower * growth),
    depthPower: Math.floor(species.depthPower * growth),
    grace: Math.floor(species.grace * growth),
  }
}

let _olIdCounter = 0
function olGenerateId(): string {
  _olIdCounter += 1
  return `ol_${_olIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function olFindSpecies(id: string): OlCreatureSpecies | undefined {
  return OL_CREATURES.find((s) => s.id === id)
}

function olFindDepth(id: string): OlDepthDef | undefined {
  return OL_DEPTHS.find((z) => z.id === id)
}

function olFindMaterial(id: string): OlMaterialDef | undefined {
  return OL_MATERIALS.find((m) => m.id === id)
}

function olFindStructureDef(id: string): OlStructureDef | undefined {
  return OL_STRUCTURES.find((s) => s.id === id)
}

function olFindAbility(id: string): OlAbilityDef | undefined {
  return OL_ABILITIES.find((a) => a.id === id)
}

function olFindRelic(id: string): OlRelicDef | undefined {
  return OL_RELICS.find((r) => r.id === id)
}

function olFindAchievement(id: string): OlAchievementDef | undefined {
  return OL_ACHIEVEMENTS.find((a) => a.id === id)
}

function olFindTitle(id: OlTitleId): OlTitleDef | undefined {
  return OL_TITLES.find((t) => t.id === id)
}

function olRarityMultiplier(rarity: OlRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function olRarityColor(rarity: OlRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function olGemTypeColor(gemType: OlGemType): string {
  switch (gemType) {
    case 'fire_opal': return OL_FIRE_OPAL_ORANGE
    case 'australian': return OL_AUSTRALIAN_BLUE
    case 'ethiopian': return OL_ETHIOPIAN_GREEN
    case 'mexican': return OL_JEWEL_PINK
    case 'boulder': return OL_BOULDER_BROWN
    case 'honey': return OL_HONEY_AMBER
    case 'water_opal': return OL_LAGOON_TEAL
    default: return '#888888'
  }
}

export function olCheckSynergy(attacker: OlGemType, defender: OlGemType): number {
  const advantages = OL_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = OL_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function olCalcStructureUpgradeCost(def: OlStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function olCalcMaxTitle(prestige: number, creatureCount: number): OlTitleId {
  let bestId: OlTitleId = 'title_pebble_collector'
  for (const title of OL_TITLES) {
    if (prestige >= title.minPrestige && creatureCount >= title.minCreatures) {
      bestId = title.id
    }
  }
  return bestId
}

function olCheckAchievementCondition(
  condition: string,
  state: OlStoreState
): boolean {
  switch (condition) {
    case 'collect_1':
      return state.totalCollected >= 1
    case 'collect_5':
      return state.totalCollected >= 5
    case 'polish_1':
      return state.totalPolished >= 1
    case 'polish_10':
      return state.totalPolished >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'depth_4':
      return state.depths.length >= 4
    case 'depth_8':
      return state.depths.length >= 8
    case 'rare_collect':
      return state.creatures.some((c) => {
        const sp = olFindSpecies(c.speciesId)
        return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'epic_collect':
      return state.creatures.some((c) => {
        const sp = olFindSpecies(c.speciesId)
        return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'legendary_collect':
      return state.creatures.some((c) => {
        const sp = olFindSpecies(c.speciesId)
        return sp && sp.rarity === 'legendary'
      })
    case 'relic_1':
      return state.relics.length >= 1
    case 'relic_5':
      return state.relics.length >= 5
    case 'event_1':
      return state.totalEventsFaced >= 1
    case 'event_10':
      return state.totalEventsFaced >= 10
    case 'upgrade_10':
      return state.structures.some((s) => s.level >= 10)
    case 'all_gem_types': {
      const gemTypes = new Set<OlGemType>()
      for (const c of state.creatures) {
        const sp = olFindSpecies(c.speciesId)
        if (sp) gemTypes.add(sp.gemType)
      }
      return gemTypes.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_opal_deity'
    default:
      return false
  }
}

function olPickRandomEvent(): OlEventDef {
  const idx = Math.floor(Math.random() * OL_EVENTS.length)
  return OL_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: COMPUTED VALUE HELPERS (pure functions)
// ═══════════════════════════════════════════════════════════════════

function computeOlOwnedCreatures(creatures: OlCreatureInstance[]) {
  return creatures.map((c) => {
    const species = olFindSpecies(c.speciesId)
    return {
      ...c,
      species,
      gemTypeColor: species ? olGemTypeColor(species.gemType) : '#888888',
      rarityColor: species ? olRarityColor(species.rarity) : '#888888',
    }
  })
}

function computeOlBuiltStructures(structures: OlStructureInstance[]) {
  return structures.map((s) => {
    const def = olFindStructureDef(s.structureDefId)
    return { ...s, def }
  })
}

function computeOlInventoryMaterials(materials: { materialId: string; count: number }[]) {
  return materials.map((m) => {
    const def = olFindMaterial(m.materialId)
    return { ...m, def }
  })
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useOlStore = create<OlFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      creatures: [] as OlCreatureInstance[],
      depths: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as OlStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_pebble_collector' as OlTitleId,
      pearls: OL_INITIAL_PEARLS,
      prestige: OL_INITIAL_PRESTIGE,
      totalCollected: 0,
      totalPolished: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as OlEventDef | null,
      eventTurnsRemaining: 0,
      activeDepth: null as string | null,

      // ── olCollectCreature ──────────────────────────────────────
      olCollectCreature: (speciesId: string): boolean => {
        const species = olFindSpecies(speciesId)
        if (!species) return false
        const cost = Math.floor(50 * olRarityMultiplier(species.rarity))
        const state = get()
        if (state.pearls < cost) return false
        const stats = olCalcStats(species, 1)
        const newCreature: OlCreatureInstance = {
          id: olGenerateId(),
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          lusterPower: stats.lusterPower,
          depthPower: stats.depthPower,
          grace: stats.grace,
          mood: 80,
          hunger: 70,
          collectedAt: Date.now(),
        }
        set((prev) => {
          const newPrestige = prev.prestige + olRarityMultiplier(species.rarity) * 5
          return {
            creatures: [...prev.creatures, newCreature],
            pearls: prev.pearls - cost,
            totalCollected: prev.totalCollected + 1,
            prestige: newPrestige,
            currentTitle: olCalcMaxTitle(newPrestige, prev.creatures.length + 1),
          }
        })
        return true
      },

      // ── olReleaseCreature ──────────────────────────────────────
      olReleaseCreature: (creatureId: string): boolean => {
        const state = get()
        const exists = state.creatures.find((c) => c.id === creatureId)
        if (!exists) return false
        const species = olFindSpecies(exists.speciesId)
        const refund = species ? Math.floor(25 * olRarityMultiplier(species.rarity)) : 10
        set((prev) => ({
          creatures: prev.creatures.filter((c) => c.id !== creatureId),
          pearls: prev.pearls + refund,
          currentTitle: olCalcMaxTitle(prev.prestige, prev.creatures.length - 1),
        }))
        return true
      },

      // ── olFeedCreature ─────────────────────────────────────────
      olFeedCreature: (creatureId: string): boolean => {
        const feedCost = 10
        const state = get()
        if (state.pearls < feedCost) return false
        set((prev) => {
          const creatures = prev.creatures.map((c) => {
            if (c.id !== creatureId) return c
            const newXp = c.xp + 20
            const xpNeeded = olXpForLevel(c.level)
            let newLevel = c.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && c.level < OL_MAX_CREATURE_LEVEL) {
              newLevel = c.level + 1
              currentXp = newXp - xpNeeded
            }
            const species = olFindSpecies(c.speciesId)
            const stats = species
              ? olCalcStats(species, newLevel)
              : { lusterPower: c.lusterPower, depthPower: c.depthPower, grace: c.grace }
            return {
              ...c,
              level: newLevel,
              xp: currentXp,
              lusterPower: stats.lusterPower,
              depthPower: stats.depthPower,
              grace: stats.grace,
              mood: Math.min(100, c.mood + 10),
              hunger: Math.min(100, c.hunger + 20),
            }
          })
          return { creatures, pearls: prev.pearls - feedCost, prestige: prev.prestige + 2 }
        })
        return true
      },

      // ── olPolishGem ────────────────────────────────────────────
      olPolishGem: (creatureId: string): boolean => {
        const state = get()
        const creature = state.creatures.find((c) => c.id === creatureId)
        if (!creature) return false
        if (creature.hunger < 20) return false
        const species = olFindSpecies(creature.speciesId)
        if (!species) return false
        const materialId = `mat_${species.gemType}_${species.rarity}`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(creature.lusterPower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) =>
                m.materialId === materialId ? { ...m, count: m.count + amount } : m
              )
            : [...prev.materials, { materialId, count: amount }],
          totalPolished: prev.totalPolished + 1,
          prestige: prev.prestige + 3,
          creatures: prev.creatures.map((c) =>
            c.id === creatureId ? { ...c, hunger: Math.max(0, c.hunger - 20) } : c
          ),
        }))
        return true
      },

      // ── olBuildStructure ───────────────────────────────────────
      olBuildStructure: (structureDefId: string): boolean => {
        const def = olFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.pearls < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: OlStructureInstance = {
          id: olGenerateId(),
          structureDefId,
          level: 1,
          builtAt: Date.now(),
        }
        set((prev) => ({
          structures: [...prev.structures, newStructure],
          pearls: prev.pearls - def.baseCost,
          totalBuilt: prev.totalBuilt + 1,
          prestige: prev.prestige + 10,
        }))
        return true
      },

      // ── olUpgradeStructure ─────────────────────────────────────
      olUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= OL_MAX_STRUCTURE_LEVEL) return false
        const def = olFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = olCalcStructureUpgradeCost(def, structure.level)
        if (state.pearls < cost) return false
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === structureId ? { ...s, level: s.level + 1 } : s
          ),
          pearls: prev.pearls - cost,
          prestige: prev.prestige + Math.floor(def.effectPerLevel * 2),
        }))
        return true
      },

      // ── olExploreDepth ─────────────────────────────────────────
      olExploreDepth: (depthId: string): OlEventDef | null => {
        const depth = olFindDepth(depthId)
        if (!depth) return null
        const state = get()
        const requiredTitleIdx = OL_TITLES.findIndex((t) => t.id === depth.requiredTitle)
        const currentTitleIdx = OL_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newDepths = state.depths.includes(depthId) ? state.depths : [...state.depths, depthId]
        const event = olPickRandomEvent()
        set((prev) => ({
          depths: newDepths,
          activeDepth: depthId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          prestige: prev.prestige + 5,
        }))
        return event
      },

      // ── olCollectRelic ─────────────────────────────────────────
      olCollectRelic: (relicId: string): boolean => {
        const relic = olFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        const newPrestige = state.prestige + Math.floor(olRarityMultiplier(relic.rarity) * 20)
        set((prev) => ({
          relics: [...prev.relics, relicId],
          prestige: newPrestige,
          currentTitle: olCalcMaxTitle(newPrestige, prev.creatures.length),
        }))
        return true
      },

      // ── olUnlockAbility ────────────────────────────────────────
      olUnlockAbility: (abilityId: string): boolean => {
        const ability = olFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * olRarityMultiplier(ability.rarity))
        if (state.pearls < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          pearls: prev.pearls - cost,
        }))
        return true
      },

      // ── olUnlockTitle ──────────────────────────────────────────
      olUnlockTitle: (titleId: OlTitleId): boolean => {
        const title = olFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.prestige < title.minPrestige) return false
        if (state.creatures.length < title.minCreatures) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── olClaimAchievement ─────────────────────────────────────
      olClaimAchievement: (achievementId: string): boolean => {
        const achievement = olFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!olCheckAchievementCondition(achievement.condition, state)) return false
        const newPrestige = state.prestige + achievement.reward.prestige
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          pearls: prev.pearls + achievement.reward.pearls,
          prestige: newPrestige,
          currentTitle: olCalcMaxTitle(newPrestige, prev.creatures.length),
        }))
        return true
      },

      // ── olTradeMaterial ────────────────────────────────────────
      olTradeMaterial: (materialId: string, count: number): number => {
        const material = olFindMaterial(materialId)
        if (!material) return 0
        const state = get()
        const owned = state.materials.find((m) => m.materialId === materialId)
        if (!owned || owned.count < count) return 0
        const pearlsEarned = material.value * count
        set((prev) => ({
          materials:
            owned.count - count <= 0
              ? prev.materials.filter((m) => m.materialId !== materialId)
              : prev.materials.map((m) =>
                  m.materialId === materialId ? { ...m, count: m.count - count } : m
                ),
          pearls: prev.pearls + pearlsEarned,
        }))
        return pearlsEarned
      },

      // ── olEndEvent ─────────────────────────────────────────────
      olEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── olResetEvent ───────────────────────────────────────────
      olResetEvent: () => {
        const event = olPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'opal-lagoon-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 19: MAIN HOOK — useOpalLagoon()
// ═══════════════════════════════════════════════════════════════════

export default function useOpalLagoon(): OlAPI {
  const store = useOlStore()

  // ── Computed: Owned creatures with species info ───────────────
  const olOwnedCreatures = useMemo(() => {
    return computeOlOwnedCreatures(store.creatures)
  }, [store])

  // ── Computed: Available species to collect ────────────────────
  const olAvailableSpecies = useMemo(() => {
    return OL_CREATURES.filter((sp) => {
      const cost = Math.floor(50 * olRarityMultiplier(sp.rarity))
      return store.pearls >= cost
    })
  }, [store])

  // ── Computed: Current title details ───────────────────────────
  const olCurrentTitleDetail = useMemo(() => {
    return olFindTitle(store.currentTitle) ?? OL_TITLES[0]
  }, [store])

  // ── Computed: Next title info ─────────────────────────────────
  const olNextTitle = useMemo(() => {
    const currentIdx = OL_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= OL_TITLES.length - 1) return null
    return OL_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active depth details ────────────────────────────
  const olActiveDepthDetail = useMemo(() => {
    if (!store.activeDepth) return null
    return olFindDepth(store.activeDepth) ?? null
  }, [store])

  // ── Computed: Unexplored depths ───────────────────────────────
  const olUnexploredDepths = useMemo(() => {
    return OL_DEPTHS.filter((d) => !store.depths.includes(d.id))
  }, [store])

  // ── Computed: Structures with defs ────────────────────────────
  const olBuiltStructures = useMemo(() => {
    return computeOlBuiltStructures(store.structures)
  }, [store])

  // ── Computed: Unlockable abilities ────────────────────────────
  const olUnlockableAbilities = useMemo(() => {
    return OL_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * olRarityMultiplier(a.rarity))
      return store.pearls >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ──────────────────────────
  const olOwnedRelics = useMemo(() => {
    return store.relics
      .map((rId) => olFindRelic(rId))
      .filter((r): r is OlRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────────
  const olUnclaimedAchievements = useMemo(() => {
    return OL_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return olCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ─────────────────────────────
  const olInventoryMaterials = useMemo(() => {
    return computeOlInventoryMaterials(store.materials)
  }, [store])

  // ── Computed: Total structure effect bonus ────────────────────
  const olTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = olFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average creature level ──────────────────────────
  const olAverageCreatureLevel = useMemo(() => {
    if (store.creatures.length === 0) return 0
    const total = store.creatures.reduce((sum, c) => sum + c.level, 0)
    return Math.floor(total / store.creatures.length)
  }, [store])

  // ── Computed: Total creature power ────────────────────────────
  const olTotalCreaturePower = useMemo(() => {
    return store.creatures.reduce(
      (sum, c) => sum + c.lusterPower + c.depthPower + c.grace,
      0
    )
  }, [store])

  // ── Computed: Gem type distribution ───────────────────────────
  const olGemTypeDistribution = useMemo(() => {
    const counts: Record<OlGemType, number> = {
      fire_opal: 0,
      australian: 0,
      ethiopian: 0,
      mexican: 0,
      boulder: 0,
      honey: 0,
      water_opal: 0,
    }
    for (const c of store.creatures) {
      const sp = olFindSpecies(c.speciesId)
      if (sp) counts[sp.gemType]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ─────────────────────────────
  const olRarityDistribution = useMemo(() => {
    const counts: Record<OlRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const c of store.creatures) {
      const sp = olFindSpecies(c.speciesId)
      if (sp) counts[sp.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Creatures by rarity ─────────────────────────────
  const olCreaturesByRarity = useMemo(() => {
    const groups: Record<OlRarity, OlCreatureInstance[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    }
    for (const c of store.creatures) {
      const sp = olFindSpecies(c.speciesId)
      if (sp) groups[sp.rarity].push(c)
    }
    return groups
  }, [store])

  // ── Computed: Creatures by gem type ───────────────────────────
  const olCreaturesByGemType = useMemo(() => {
    const groups: Record<OlGemType, OlCreatureInstance[]> = {
      fire_opal: [],
      australian: [],
      ethiopian: [],
      mexican: [],
      boulder: [],
      honey: [],
      water_opal: [],
    }
    for (const c of store.creatures) {
      const sp = olFindSpecies(c.speciesId)
      if (sp) groups[sp.gemType].push(c)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ──────────────────────────
  const olTitleProgress = useMemo(() => {
    const currentIdx = OL_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= OL_TITLES.length - 1) {
      return { percent: 100, prestigeNeeded: 0, creaturesNeeded: 0 }
    }
    const next = OL_TITLES[currentIdx + 1]
    const prestigeProgress = Math.min(100, (store.prestige / next.minPrestige) * 100)
    const creatureProgress = Math.min(100, (store.creatures.length / next.minCreatures) * 100)
    return {
      percent: Math.floor((prestigeProgress + creatureProgress) / 2),
      prestigeNeeded: Math.max(0, next.minPrestige - store.prestige),
      creaturesNeeded: Math.max(0, next.minCreatures - store.creatures.length),
    }
  }, [store])

  // ── Computed: Rare materials count ────────────────────────────
  const olRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = olFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Hungry creatures ────────────────────────────────
  const olHungryCreatures = useMemo(() => {
    return store.creatures.filter((c) => c.hunger < 30)
  }, [store])

  // ── Computed: Low mood creatures ──────────────────────────────
  const olUnhappyCreatures = useMemo(() => {
    return store.creatures.filter((c) => c.mood < 30)
  }, [store])

  // ── Computed: Total relic boost ───────────────────────────────
  const olTotalRelicBoost = useMemo(() => {
    let lusterBoost = 0
    let depthBoost = 0
    let graceBoost = 0
    for (const rId of store.relics) {
      const relic = olFindRelic(rId)
      if (relic) {
        lusterBoost += relic.lusterBoost
        depthBoost += relic.depthBoost
        graceBoost += relic.graceBoost
      }
    }
    return { lusterBoost, depthBoost, graceBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return olAPI object
  // ═════════════════════════════════════════════════════════════

  const olAPI: OlAPI = {
    // ── Direct constants ──────────────────────────────────────
    OL_OPAL_WHITE,
    OL_FIRE_OPAL_ORANGE,
    OL_AUSTRALIAN_BLUE,
    OL_ETHIOPIAN_GREEN,
    OL_BOULDER_BROWN,
    OL_HONEY_AMBER,
    OL_LAGOON_TEAL,
    OL_JEWEL_PINK,
    OL_GEM_TYPES,
    OL_RARITIES,
    OL_CREATURES,
    OL_DEPTHS,
    OL_MATERIALS,
    OL_STRUCTURES,
    OL_ABILITIES,
    OL_ACHIEVEMENTS,
    OL_TITLES,
    OL_RELICS,
    OL_EVENTS,
    olCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    creatures: store.creatures,
    depths: store.depths,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    pearls: store.pearls,
    prestige: store.prestige,
    totalCollected: store.totalCollected,
    totalPolished: store.totalPolished,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeDepth: store.activeDepth,

    // ── Store actions ─────────────────────────────────────────
    olCollectCreature: store.olCollectCreature,
    olReleaseCreature: store.olReleaseCreature,
    olFeedCreature: store.olFeedCreature,
    olPolishGem: store.olPolishGem,
    olBuildStructure: store.olBuildStructure,
    olUpgradeStructure: store.olUpgradeStructure,
    olExploreDepth: store.olExploreDepth,
    olCollectRelic: store.olCollectRelic,
    olUnlockAbility: store.olUnlockAbility,
    olUnlockTitle: store.olUnlockTitle,
    olClaimAchievement: store.olClaimAchievement,
    olTradeMaterial: store.olTradeMaterial,
    olEndEvent: store.olEndEvent,
    olResetEvent: store.olResetEvent,

    // ── Computed getters ──────────────────────────────────────
    olOwnedCreatures,
    olAvailableSpecies,
    olCurrentTitleDetail,
    olNextTitle,
    olActiveDepthDetail,
    olUnexploredDepths,
    olBuiltStructures,
    olUnlockableAbilities,
    olOwnedRelics,
    olUnclaimedAchievements,
    olInventoryMaterials,
    olTotalStructureEffect,
    olAverageCreatureLevel,
    olTotalCreaturePower,
    olGemTypeDistribution,
    olRarityDistribution,
    olCreaturesByRarity,
    olCreaturesByGemType,
    olTitleProgress,
    olRareMaterialCount,
    olHungryCreatures,
    olUnhappyCreatures,
    olTotalRelicBoost,
  }

  return olAPI
}
