/**
 * Moss Garden Wire — 苔藓花园 (Moss Garden) feature module
 *
 * A tranquil moss garden plant cultivation mini-game: cultivate 35 moss/fungi
 * species across 7 biome types, tend 8 garden plots, collect 30 spore/bloom
 * materials, build 25 garden structures, discover 15 legendary nature
 * artifacts, face 12 garden events, and ascend through 8 titles from
 * Seedling Tender to Verdant Deity — backed by a Zustand store with
 * persist middleware.
 *
 * Storage key: moss-garden-wire
 * Prefix: mo / MO_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type MoBiomeType =
  | 'forest'
  | 'cave'
  | 'waterfall'
  | 'mountain'
  | 'marsh'
  | 'tundra'
  | 'volcanic'

export type MoRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type MoTitleId =
  | 'title_seedling'
  | 'title_gardener'
  | 'title_cultivator'
  | 'title_botanist'
  | 'title_warden'
  | 'title_keeper'
  | 'title_sage'
  | 'title_deity'

export interface MoBiomeDef {
  readonly id: MoBiomeType
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface MoSpeciesDef {
  readonly id: string
  readonly name: string
  readonly biome: MoBiomeType
  readonly rarity: MoRarity
  readonly growthPower: number
  readonly resiliencePower: number
  readonly spreadRate: number
  readonly description: string
  readonly traits: string[]
}

export interface MoSpeciesInstance {
  readonly id: string
  speciesId: string
  name: string
  level: number
  xp: number
  growthPower: number
  resiliencePower: number
  spreadRate: number
  health: number
  hydration: number
  plantedAt: number
}

export interface MoPlotDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly plotIndex: number
  readonly fertility: number
  readonly requiredTitle: MoTitleId
  readonly biome: MoBiomeType
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface MoMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'spore' | 'bloom' | 'bark' | 'relic_shard' | 'essence'
  readonly rarity: MoRarity
  readonly growthBonus: number
  readonly resilienceBonus: number
  readonly value: number
  readonly description: string
}

export interface MoStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'garden_bed' | 'fountain' | 'spore_lab' | 'stone_altar' | 'nature_shrine'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface MoStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface MoAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly biome: MoBiomeType
  readonly type: 'active' | 'passive'
  readonly rarity: MoRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface MoAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface MoTitleDef {
  readonly id: MoTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minSpecies: number
  readonly description: string
}

export interface MoRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: MoRarity
  readonly biome: MoBiomeType
  readonly growthBoost: number
  readonly resilienceBoost: number
  readonly spreadBoost: number
  readonly value: number
  readonly description: string
}

export interface MoEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface MoStoreState {
  specimens: MoSpeciesInstance[]
  plots: string[]
  materials: { materialId: string; count: number }[]
  structures: MoStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: MoTitleId
  gold: number
  renown: number
  totalPlanted: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: MoEventDef | null
  eventTurnsRemaining: number
  activePlot: string | null
}

export interface MoStoreActions {
  moPlantSpecies: (speciesId: string) => boolean
  moRemoveSpecies: (specimenId: string) => boolean
  moWaterSpecies: (specimenId: string) => boolean
  moHarvestSpore: (specimenId: string) => boolean
  moBuildStructure: (structureDefId: string) => boolean
  moUpgradeStructure: (structureId: string) => boolean
  moTendPlot: (plotId: string) => MoEventDef | null
  moCollectRelic: (relicId: string) => boolean
  moUnlockAbility: (abilityId: string) => boolean
  moUnlockTitle: (titleId: MoTitleId) => boolean
  moClaimAchievement: (achievementId: string) => boolean
  moTradeMaterial: (materialId: string, count: number) => number
  moEndEvent: () => void
  moResetEvent: () => void
}

export interface MoFullStore extends MoStoreState, MoStoreActions {}

export interface MoOwnedSpecimen extends MoSpeciesInstance {
  species: MoSpeciesDef | undefined
  biomeColor: string
  rarityColor: string
}

export interface MoBuiltStructure extends MoStructureInstance {
  def: MoStructureDef | undefined
}

export interface MoInventoryMaterial {
  materialId: string
  count: number
  def: MoMaterialDef | undefined
}

export interface MoTitleProgress {
  percent: number
  renownNeeded: number
  speciesNeeded: number
}

export interface MoTotalRelicBoost {
  growthBoost: number
  resilienceBoost: number
  spreadBoost: number
}

export interface MoAPI {
  // Direct constants
  MO_MOSS_GREEN: string
  MO_EMERALD: string
  MO_LICHEN_GRAY: string
  MO_SPORE_GOLD: string
  MO_MUSHROOM_BROWN: string
  MO_DEWDROP_BLUE: string
  MO_BLOSSOM_PINK: string
  MO_BARK_BROWN: string
  MO_SPECIES: readonly MoSpeciesDef[]
  MO_PLOTS: readonly MoPlotDef[]
  MO_MATERIALS: readonly MoMaterialDef[]
  MO_STRUCTURES: readonly MoStructureDef[]
  MO_ABILITIES: readonly MoAbilityDef[]
  MO_ACHIEVEMENTS: readonly MoAchievementDef[]
  MO_TITLES: readonly MoTitleDef[]
  MO_RELICS: readonly MoRelicDef[]
  MO_EVENTS: readonly MoEventDef[]
  MO_BIOMES: readonly MoBiomeDef[]
  moCheckBiomeSynergy: (attacker: MoBiomeType, defender: MoBiomeType) => number
  // Store state
  specimens: MoSpeciesInstance[]
  plots: string[]
  materials: { materialId: string; count: number }[]
  structures: MoStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: MoTitleId
  gold: number
  renown: number
  totalPlanted: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: MoEventDef | null
  eventTurnsRemaining: number
  activePlot: string | null
  // Store actions
  moPlantSpecies: (speciesId: string) => boolean
  moRemoveSpecies: (specimenId: string) => boolean
  moWaterSpecies: (specimenId: string) => boolean
  moHarvestSpore: (specimenId: string) => boolean
  moBuildStructure: (structureDefId: string) => boolean
  moUpgradeStructure: (structureId: string) => boolean
  moTendPlot: (plotId: string) => MoEventDef | null
  moCollectRelic: (relicId: string) => boolean
  moUnlockAbility: (abilityId: string) => boolean
  moUnlockTitle: (titleId: MoTitleId) => boolean
  moClaimAchievement: (achievementId: string) => boolean
  moTradeMaterial: (materialId: string, count: number) => number
  moEndEvent: () => void
  moResetEvent: () => void
  // Computed getters
  moOwnedSpecimens: MoOwnedSpecimen[]
  moAvailableSpecies: MoSpeciesDef[]
  moCurrentTitleDetail: MoTitleDef
  moNextTitle: MoTitleDef | null
  moActivePlotDetail: MoPlotDef | null
  moUntendedPlots: MoPlotDef[]
  moBuiltStructures: MoBuiltStructure[]
  moUnlockableAbilities: MoAbilityDef[]
  moOwnedRelics: MoRelicDef[]
  moUnclaimedAchievements: MoAchievementDef[]
  moInventoryMaterials: MoInventoryMaterial[]
  moTotalStructureEffect: number
  moAverageSpecimenLevel: number
  moTotalSpecimenPower: number
  moBiomeDistribution: Record<MoBiomeType, number>
  moRarityDistribution: Record<MoRarity, number>
  moSpecimensByRarity: Record<MoRarity, MoSpeciesInstance[]>
  moSpecimensByBiome: Record<MoBiomeType, MoSpeciesInstance[]>
  moTitleProgress: MoTitleProgress
  moRareMaterialCount: number
  moDehydratedSpecimens: MoSpeciesInstance[]
  moUnhealthySpecimens: MoSpeciesInstance[]
  moTotalRelicBoost: MoTotalRelicBoost
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const MO_MOSS_GREEN: string = '#4CAF50'
export const MO_EMERALD: string = '#2E7D32'
export const MO_LICHEN_GRAY: string = '#9E9E9E'
export const MO_SPORE_GOLD: string = '#FFC107'
export const MO_MUSHROOM_BROWN: string = '#795548'
export const MO_DEWDROP_BLUE: string = '#64B5F6'
export const MO_BLOSSOM_PINK: string = '#E91E63'
export const MO_BARK_BROWN: string = '#5D4037'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: BIOME DEFINITIONS (7 biomes)
// ═══════════════════════════════════════════════════════════════════

export const MO_BIOMES: readonly MoBiomeDef[] = [
  {
    id: 'forest',
    name: 'Forest',
    color: MO_EMERALD,
    description:
      'Lush temperate forests where moss carpets the ground and fungi bloom on every fallen log.',
  },
  {
    id: 'cave',
    name: 'Cave',
    color: MO_LICHEN_GRAY,
    description:
      'Deep underground caverns where bioluminescent fungi illuminate the eternal darkness.',
  },
  {
    id: 'waterfall',
    name: 'Waterfall',
    color: MO_DEWDROP_BLUE,
    description:
      'Mist-shrouded cliffs where water-loving mosses thrive in constant humidity.',
  },
  {
    id: 'mountain',
    name: 'Mountain',
    color: MO_BARK_BROWN,
    description:
      'Rocky alpine slopes above the treeline where only the hardiest lichens survive.',
  },
  {
    id: 'marsh',
    name: 'Marsh',
    color: MO_MOSS_GREEN,
    description:
      'Peat-rich wetlands teeming with sphagnum moss, carnivorous fungi, and ancient bog flora.',
  },
  {
    id: 'tundra',
    name: 'Tundra',
    color: MO_SPORE_GOLD,
    description:
      'Frozen arctic expanses where reindeer lichen and frost-resistant mosses endure extreme cold.',
  },
  {
    id: 'volcanic',
    name: 'Volcanic',
    color: MO_MUSHROOM_BROWN,
    description:
      'Scorched volcanic terrain where extremophile fungi colonize fresh lava and ash.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: BIOME SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const MO_BIOME_SYNERGY_MAP: Record<MoBiomeType, MoBiomeType[]> = {
  forest: ['waterfall', 'marsh'],
  cave: ['mountain', 'volcanic'],
  waterfall: ['forest', 'tundra'],
  mountain: ['cave', 'tundra'],
  marsh: ['forest', 'volcanic'],
  tundra: ['waterfall', 'mountain'],
  volcanic: ['cave', 'marsh'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: MO_SPECIES — 35 Moss/Fungi Species (5 per biome × 7)
// ═══════════════════════════════════════════════════════════════════

export const MO_SPECIES: readonly MoSpeciesDef[] = [
  // ── Forest Species (5) ──────────────────────────────────────
  {
    id: 'forest_carpet_moss',
    name: 'Common Carpet Moss',
    biome: 'forest',
    rarity: 'common',
    growthPower: 12,
    resiliencePower: 18,
    spreadRate: 22,
    description:
      'A soft, velvety moss that blankets the forest floor in emerald green. The foundation of every garden.',
    traits: ['rapid_spread', 'shade_tolerance'],
  },
  {
    id: 'forest_golden_thread',
    name: 'Golden Thread Moss',
    biome: 'forest',
    rarity: 'uncommon',
    growthPower: 20,
    resiliencePower: 25,
    spreadRate: 18,
    description:
      'Delicate golden-green threads that shimmer in dappled sunlight. Prized for its luminous quality.',
    traits: ['shade_tolerance', 'light_refraction'],
  },
  {
    id: 'forest_oak_polypore',
    name: 'Ancient Oak Polypore',
    biome: 'forest',
    rarity: 'rare',
    growthPower: 45,
    resiliencePower: 55,
    spreadRate: 8,
    description:
      'A massive shelf fungus found only on thousand-year-old oaks. Its mycelium network spans entire groves.',
    traits: ['deep_roots', 'mycelium_network', 'symbiotic_bond'],
  },
  {
    id: 'forest_heartwood_vine',
    name: 'Heartwood Vine',
    biome: 'forest',
    rarity: 'epic',
    growthPower: 70,
    resiliencePower: 80,
    spreadRate: 25,
    description:
      'A semi-sentient vine-moss hybrid that connects trees through underground fungal networks, sharing nutrients.',
    traits: ['deep_roots', 'mycelium_network', 'symbiotic_bond', 'regeneration'],
  },
  {
    id: 'forest_world_tree_moss',
    name: 'World Tree Moss',
    biome: 'forest',
    rarity: 'legendary',
    growthPower: 110,
    resiliencePower: 120,
    spreadRate: 40,
    description:
      'Mythical moss said to grow only on the roots of Yggdrasil itself. A single spore can seed an entire forest.',
    traits: ['deep_roots', 'mycelium_network', 'symbiotic_bond', 'regeneration', 'ancient_grove'],
  },

  // ── Cave Species (5) ────────────────────────────────────────
  {
    id: 'cave_glow_mushroom',
    name: 'Glow Cap Mushroom',
    biome: 'cave',
    rarity: 'common',
    growthPower: 10,
    resiliencePower: 22,
    spreadRate: 15,
    description:
      'A bioluminescent mushroom that lights dark cave passages with soft blue-green light.',
    traits: ['bioluminescence'],
  },
  {
    id: 'cave_pearl_moss',
    name: 'Pearl Cave Moss',
    biome: 'cave',
    rarity: 'uncommon',
    growthPower: 18,
    resiliencePower: 30,
    spreadRate: 12,
    description:
      'Rare moss forming iridescent pearl-like clusters in humid caves. Glows faintly in the dark.',
    traits: ['bioluminescence', 'moisture_absorb'],
  },
  {
    id: 'cave_shadow_toadstool',
    name: 'Shadow Toadstool',
    biome: 'cave',
    rarity: 'rare',
    growthPower: 50,
    resiliencePower: 40,
    spreadRate: 20,
    description:
      'A dark purple fungus that absorbs ambient light, creating fields of living shadow.',
    traits: ['shadow_absorb', 'underground_network', 'spore_cloud'],
  },
  {
    id: 'cave_abyss_mycelium',
    name: 'Abyssal Mycelium',
    biome: 'cave',
    rarity: 'epic',
    growthPower: 75,
    resiliencePower: 90,
    spreadRate: 35,
    description:
      'A vast underground fungus network spanning miles of caverns. It senses vibrations through rock.',
    traits: ['underground_network', 'deep_roots', 'bioluminescence', 'crystal_form'],
  },
  {
    id: 'cave_crystal_heart',
    name: 'Crystal Heart Fungus',
    biome: 'cave',
    rarity: 'legendary',
    growthPower: 120,
    resiliencePower: 100,
    spreadRate: 30,
    description:
      'A living geode — fungus that grows crystalline structures from consumed minerals. The rarest cave organism.',
    traits: ['crystal_form', 'deep_roots', 'underground_network', 'bioluminescence', 'ancient_grove'],
  },

  // ── Waterfall Species (5) ───────────────────────────────────
  {
    id: 'waterfall_mist_fern',
    name: 'Mist Fern',
    biome: 'waterfall',
    rarity: 'common',
    growthPower: 15,
    resiliencePower: 14,
    spreadRate: 20,
    description:
      'A delicate fern that thrives in the constant mist of waterfalls. Its fronds are perpetually damp.',
    traits: ['moisture_absorb'],
  },
  {
    id: 'waterfall_river_lichen',
    name: 'River Splash Lichen',
    biome: 'waterfall',
    rarity: 'uncommon',
    growthPower: 22,
    resiliencePower: 28,
    spreadRate: 16,
    description:
      'Blue-green lichen found on spray-soaked boulders near waterfalls. Rich in minerals.',
    traits: ['moisture_absorb', 'nutrient_cycle'],
  },
  {
    id: 'waterfall_dewdrop_fungus',
    name: 'Dewdrop Cup Fungus',
    biome: 'waterfall',
    rarity: 'rare',
    growthPower: 40,
    resiliencePower: 50,
    spreadRate: 14,
    description:
      'Cup-shaped fungi that collect pristine waterfall water. The dew within has healing properties.',
    traits: ['moisture_absorb', 'nutrient_cycle', 'regeneration'],
  },
  {
    id: 'waterfall_rainbow_moss',
    name: 'Rainbow Cascade Moss',
    biome: 'waterfall',
    rarity: 'epic',
    growthPower: 65,
    resiliencePower: 75,
    spreadRate: 28,
    description:
      'Iridescent moss that refracts waterfall light into brilliant rainbow colors. Hypnotic to behold.',
    traits: ['light_refraction', 'moisture_absorb', 'aerial_spores', 'rapid_spread'],
  },
  {
    id: 'waterfall_eternal_spring',
    name: 'Eternal Spring Moss',
    biome: 'waterfall',
    rarity: 'legendary',
    growthPower: 105,
    resiliencePower: 115,
    spreadRate: 38,
    description:
      'Moss of pure living water. It perpetually generates clean water and can restore any withered garden.',
    traits: ['moisture_absorb', 'regeneration', 'nutrient_cycle', 'light_refraction', 'ancient_grove'],
  },

  // ── Mountain Species (5) ────────────────────────────────────
  {
    id: 'mountain_alpine_cushion',
    name: 'Alpine Cushion Moss',
    biome: 'mountain',
    rarity: 'common',
    growthPower: 8,
    resiliencePower: 25,
    spreadRate: 10,
    description:
      'Dense moss forming soft green cushions above the treeline. Survives brutal winds and frost.',
    traits: ['frost_resistance'],
  },
  {
    id: 'mountain_glacier_frost',
    name: 'Glacier Frost Lichen',
    biome: 'mountain',
    rarity: 'uncommon',
    growthPower: 15,
    resiliencePower: 35,
    spreadRate: 8,
    description:
      'Frost-white lichen growing near glacial edges. Contains natural antifreeze compounds.',
    traits: ['frost_resistance', 'deep_roots'],
  },
  {
    id: 'mountain_summit_cap',
    name: 'Summit Cap Mushroom',
    biome: 'mountain',
    rarity: 'rare',
    growthPower: 42,
    resiliencePower: 60,
    spreadRate: 12,
    description:
      'A rare mushroom found only on the highest peaks. Its cap is shaped like a miniature mountain.',
    traits: ['frost_resistance', 'deep_roots', 'aerial_spores'],
  },
  {
    id: 'mountain_sky_meadow',
    name: 'Sky Meadow Moss',
    biome: 'mountain',
    rarity: 'epic',
    growthPower: 60,
    resiliencePower: 85,
    spreadRate: 30,
    description:
      'Ethereal moss that seems to glow at high altitude. Creates floating spore clouds like miniature clouds.',
    traits: ['aerial_spores', 'frost_resistance', 'light_refraction', 'rapid_spread'],
  },
  {
    id: 'mountain_cloud_crown',
    name: 'Cloud Crown Lichen',
    biome: 'mountain',
    rarity: 'legendary',
    growthPower: 100,
    resiliencePower: 130,
    spreadRate: 22,
    description:
      'Lichen that grows at the boundary of earth and sky. It absorbs clouds and releases rain on command.',
    traits: ['frost_resistance', 'aerial_spores', 'deep_roots', 'nutrient_cycle', 'ancient_grove'],
  },

  // ── Marsh Species (5) ───────────────────────────────────────
  {
    id: 'marsh_bog_cotton',
    name: 'Bog Cotton Moss',
    biome: 'marsh',
    rarity: 'common',
    growthPower: 14,
    resiliencePower: 16,
    spreadRate: 25,
    description:
      'Soft white-topped moss found in boggy wetlands. Excellent for filtering and purifying water.',
    traits: ['rapid_spread', 'moisture_absorb'],
  },
  {
    id: 'marsh_sundew_fungus',
    name: 'Sundew Fungus',
    biome: 'marsh',
    rarity: 'uncommon',
    growthPower: 25,
    resiliencePower: 20,
    spreadRate: 18,
    description:
      'Carnivorous fungus with sticky tendrils for catching insects. Supplements its nutrient intake actively.',
    traits: ['nutrient_cycle', 'spore_cloud'],
  },
  {
    id: 'marsh_cattail_fern',
    name: 'Cattail Fern',
    biome: 'marsh',
    rarity: 'rare',
    growthPower: 48,
    resiliencePower: 45,
    spreadRate: 22,
    description:
      'Tall marsh fern resembling cattails with spore-rich fronds that burst in spectacular displays.',
    traits: ['spore_cloud', 'rapid_spread', 'moisture_absorb'],
  },
  {
    id: 'marsh_mire_blossom',
    name: 'Mire Nightbloom',
    biome: 'marsh',
    rarity: 'epic',
    growthPower: 68,
    resiliencePower: 70,
    spreadRate: 26,
    description:
      'Bioluminescent flowering fungus that blooms only at night, filling the marsh with ethereal light.',
    traits: ['bioluminescence', 'spore_cloud', 'nutrient_cycle', 'regeneration'],
  },
  {
    id: 'marsh_ancient_bog',
    name: 'Ancient Bog Spirit',
    biome: 'marsh',
    rarity: 'legendary',
    growthPower: 115,
    resiliencePower: 105,
    spreadRate: 42,
    description:
      'A sentient peat-moss organism that has lived for millennia. It remembers everything that has ever grown in its domain.',
    traits: ['deep_roots', 'mycelium_network', 'regeneration', 'nutrient_cycle', 'ancient_grove'],
  },

  // ── Tundra Species (5) ──────────────────────────────────────
  {
    id: 'tundra_reindeer_lichen',
    name: 'Reindeer Lichen',
    biome: 'tundra',
    rarity: 'common',
    growthPower: 6,
    resiliencePower: 28,
    spreadRate: 12,
    description:
      'Branching lichen that is a primary food source for caribou. Survives extreme Arctic conditions.',
    traits: ['frost_resistance'],
  },
  {
    id: 'tundra_snow_fungus',
    name: 'Snowbank Fungus',
    biome: 'tundra',
    rarity: 'uncommon',
    growthPower: 12,
    resiliencePower: 38,
    spreadRate: 10,
    description:
      'Remarkable fungi that push through snow in early spring, melting ice with gentle biochemical warmth.',
    traits: ['frost_resistance', 'regeneration'],
  },
  {
    id: 'tundra_permafrost_cap',
    name: 'Permafrost Mushroom',
    biome: 'tundra',
    rarity: 'rare',
    growthPower: 35,
    resiliencePower: 65,
    spreadRate: 8,
    description:
      'Mushrooms growing in permafrost cracks with ancient mycelium networks dating back to the ice age.',
    traits: ['frost_resistance', 'deep_roots', 'underground_network'],
  },
  {
    id: 'tundra_polar_cushion',
    name: 'Polar Crystal Moss',
    biome: 'tundra',
    rarity: 'epic',
    growthPower: 55,
    resiliencePower: 95,
    spreadRate: 15,
    description:
      'Glass-like moss formation found only in polar regions. Its crystalline cells store light for the long winter.',
    traits: ['frost_resistance', 'crystal_form', 'light_refraction', 'deep_roots'],
  },
  {
    id: 'tundra_aurora_moss',
    name: 'Aurora Moss',
    biome: 'tundra',
    rarity: 'legendary',
    growthPower: 95,
    resiliencePower: 125,
    spreadRate: 35,
    description:
      'Moss that absorbs the aurora borealis and stores solar wind energy. Glows with dancing northern lights.',
    traits: ['frost_resistance', 'bioluminescence', 'light_refraction', 'regeneration', 'ancient_grove'],
  },

  // ── Volcanic Species (5) ────────────────────────────────────
  {
    id: 'volcanic_cinder_lichen',
    name: 'Cinder Crust Lichen',
    biome: 'volcanic',
    rarity: 'common',
    growthPower: 10,
    resiliencePower: 20,
    spreadRate: 18,
    description:
      'The first organism to colonize cooled lava flows. Its crust helps break rock into fertile soil.',
    traits: ['heat_tolerance'],
  },
  {
    id: 'volcanic_ash_cap',
    name: 'Ash Cap Mushroom',
    biome: 'volcanic',
    rarity: 'uncommon',
    growthPower: 20,
    resiliencePower: 35,
    spreadRate: 14,
    description:
      'Mushroom that thrives in volcanic ash soil. Its cap is coated in mineral-rich gray powder.',
    traits: ['heat_tolerance', 'nutrient_cycle'],
  },
  {
    id: 'volcanic_lava_fern',
    name: 'Lava Fern',
    biome: 'volcanic',
    rarity: 'rare',
    growthPower: 45,
    resiliencePower: 55,
    spreadRate: 20,
    description:
      'Heat-resistant fern found near active volcanic vents. Its fronds are warm to the touch.',
    traits: ['heat_tolerance', 'rapid_spread', 'deep_roots'],
  },
  {
    id: 'volcanic_magma_bloom',
    name: 'Magma Bloom',
    biome: 'volcanic',
    rarity: 'epic',
    growthPower: 72,
    resiliencePower: 80,
    spreadRate: 24,
    description:
      'Rare flowering fungus that draws nutrients directly from magma channels. Blooms in brilliant orange.',
    traits: ['heat_tolerance', 'deep_roots', 'nutrient_cycle', 'spore_cloud'],
  },
  {
    id: 'volcanic_inferno_fungus',
    name: 'Inferno Crown Fungus',
    biome: 'volcanic',
    rarity: 'legendary',
    growthPower: 130,
    resiliencePower: 110,
    spreadRate: 28,
    description:
      'The ultimate extremophile — a living organism of pure fire and mycelium. It feeds on magma and exhales steam.',
    traits: ['heat_tolerance', 'deep_roots', 'regeneration', 'nutrient_cycle', 'ancient_grove'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: MO_PLOTS — 8 Garden Plots
// ═══════════════════════════════════════════════════════════════════

export const MO_PLOTS: readonly MoPlotDef[] = [
  {
    id: 'plot_mossy_clearing',
    name: 'Mossy Clearing',
    description:
      'A sun-dappled clearing in the forest, carpeted with soft green moss. Perfect for beginners.',
    plotIndex: 0,
    fertility: 1,
    requiredTitle: 'title_seedling',
    biome: 'forest',
    bgGradient: 'linear-gradient(180deg, #4CAF50 0%, #2E7D32 50%, #5D4037 100%)',
    ambientColor: MO_MOSS_GREEN,
  },
  {
    id: 'plot_crystal_grotto',
    name: 'Crystal Grotto',
    description:
      'A damp underground grotto where cave fungi thrive in the gentle glow of embedded crystals.',
    plotIndex: 1,
    fertility: 2,
    requiredTitle: 'title_seedling',
    biome: 'cave',
    bgGradient: 'linear-gradient(180deg, #9E9E9E 0%, #5D4037 50%, #64B5F6 100%)',
    ambientColor: MO_LICHEN_GRAY,
  },
  {
    id: 'plot_mist_terrace',
    name: 'Mist Terrace',
    description:
      'Stepped terraces beside a roaring waterfall, perpetually wreathed in cool, nutrient-rich mist.',
    plotIndex: 2,
    fertility: 3,
    requiredTitle: 'title_gardener',
    biome: 'waterfall',
    bgGradient: 'linear-gradient(180deg, #64B5F6 0%, #4CAF50 50%, #9E9E9E 100%)',
    ambientColor: MO_DEWDROP_BLUE,
  },
  {
    id: 'plot_alpine_ledge',
    name: 'Alpine Ledge',
    description:
      'A rocky ledge high on the mountain where only the hardiest lichens and mosses take root.',
    plotIndex: 3,
    fertility: 4,
    requiredTitle: 'title_cultivator',
    biome: 'mountain',
    bgGradient: 'linear-gradient(180deg, #5D4037 0%, #9E9E9E 50%, #FFC107 100%)',
    ambientColor: MO_BARK_BROWN,
  },
  {
    id: 'plot_peat_basin',
    name: 'Peat Basin',
    description:
      'A rich peat basin where sphagnum moss and carnivorous fungi flourish in the dark, fertile water.',
    plotIndex: 4,
    fertility: 5,
    requiredTitle: 'title_botanist',
    biome: 'marsh',
    bgGradient: 'linear-gradient(180deg, #4CAF50 0%, #795548 50%, #2E7D32 100%)',
    ambientColor: MO_EMERALD,
  },
  {
    id: 'plot_frost_garden',
    name: 'Frost Garden',
    description:
      'An ice-encrusted garden plot where Arctic species survive thanks to ancient permafrost magic.',
    plotIndex: 5,
    fertility: 6,
    requiredTitle: 'title_warden',
    biome: 'tundra',
    bgGradient: 'linear-gradient(180deg, #FFC107 0%, #64B5F6 50%, #9E9E9E 100%)',
    ambientColor: MO_SPORE_GOLD,
  },
  {
    id: 'plot_ash_field',
    name: 'Ash Field',
    description:
      'A volcanic field of cooled lava and ash where extremophile fungi thrive in geothermal warmth.',
    plotIndex: 6,
    fertility: 7,
    requiredTitle: 'title_keeper',
    biome: 'volcanic',
    bgGradient: 'linear-gradient(180deg, #795548 0%, #5D4037 50%, #E91E63 100%)',
    ambientColor: MO_MUSHROOM_BROWN,
  },
  {
    id: 'plot_heart_of_garden',
    name: 'Heart of the Garden',
    description:
      'The legendary central plot where all biomes converge. Only a Verdant Deity may tend this sacred ground.',
    plotIndex: 7,
    fertility: 8,
    requiredTitle: 'title_sage',
    biome: 'forest',
    bgGradient: 'linear-gradient(180deg, #2E7D32 0%, #FFC107 50%, #64B5F6 100%)',
    ambientColor: MO_BLOSSOM_PINK,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: MO_MATERIALS — 30 Spore/Bloom Materials
// ═══════════════════════════════════════════════════════════════════

export const MO_MATERIALS: readonly MoMaterialDef[] = [
  // Common (8)
  { id: 'mat_carpet_spore', name: 'Carpet Moss Spore', emoji: '🌱', type: 'spore', rarity: 'common', growthBonus: 2, resilienceBonus: 1, value: 10, description: 'Tiny spores from common carpet moss. Excellent starter material.' },
  { id: 'mat_glow_powder', name: 'Glow Cap Powder', emoji: '✨', type: 'spore', rarity: 'common', growthBonus: 5, resilienceBonus: 0, value: 15, description: 'Bioluminescent powder harvested from glow cap mushrooms.' },
  { id: 'mat_mist_frond', name: 'Mist Fern Frond', emoji: '🍃', type: 'bloom', rarity: 'common', growthBonus: 1, resilienceBonus: 3, value: 12, description: 'A damp frond from a waterfall mist fern, still dripping fresh water.' },
  { id: 'mat_cushion_sample', name: 'Alpine Cushion Sample', emoji: '🟢', type: 'bark', rarity: 'common', growthBonus: 3, resilienceBonus: 2, value: 14, description: 'A dense sample of alpine cushion moss, compacted from mountain winds.' },
  { id: 'mat_bog_fiber', name: 'Bog Cotton Fiber', emoji: '🧵', type: 'bark', rarity: 'common', growthBonus: 2, resilienceBonus: 2, value: 11, description: 'Soft fibrous material from bog cotton moss. Used in traditional weaving.' },
  { id: 'mat_reindeer_piece', name: 'Reindeer Lichen Piece', emoji: '🫎', type: 'bark', rarity: 'common', growthBonus: 4, resilienceBonus: 1, value: 16, description: 'A branch of reindeer lichen, still carrying faint Arctic cold.' },
  { id: 'mat_cinder_scrape', name: 'Cinder Crust Scraping', emoji: '⬛', type: 'bark', rarity: 'common', growthBonus: 3, resilienceBonus: 3, value: 13, description: 'Mineral-rich crust scraped from fresh lava rock.' },
  { id: 'mat_pearl_dust', name: 'Pearl Moss Dust', emoji: '🤍', type: 'spore', rarity: 'common', growthBonus: 6, resilienceBonus: 0, value: 18, description: 'Iridescent dust from pearl cave moss. Shimmers in any light.' },

  // Uncommon (7)
  { id: 'mat_golden_thread', name: 'Golden Thread Sample', emoji: '🧶', type: 'spore', rarity: 'uncommon', growthBonus: 8, resilienceBonus: 5, value: 80, description: 'Luminous threads from golden thread moss, used in rare potions.' },
  { id: 'mat_shadow_spore', name: 'Shadow Toadstool Spore', emoji: '🌑', type: 'spore', rarity: 'uncommon', growthBonus: 10, resilienceBonus: 8, value: 90, description: 'Dark spores that absorb light. Used in shadow-based cultivation.' },
  { id: 'mat_river_lichen', name: 'River Splash Lichen', emoji: '💧', type: 'bloom', rarity: 'uncommon', growthBonus: 6, resilienceBonus: 10, value: 85, description: 'Mineral-rich lichen from waterfall spray zones.' },
  { id: 'mat_glacier_extract', name: 'Glacier Frost Extract', emoji: '❄️', type: 'essence', rarity: 'uncommon', growthBonus: 5, resilienceBonus: 12, value: 75, description: 'Concentrated antifreeze compounds from glacier frost lichen.' },
  { id: 'mat_sundew_dew', name: 'Sundew Fungus Dew', emoji: '🍯', type: 'essence', rarity: 'uncommon', growthBonus: 12, resilienceBonus: 4, value: 88, description: 'Sweet, enzyme-rich dew from carnivorous sundew fungus.' },
  { id: 'mat_snow_puff', name: 'Snowbank Fungus Puff', emoji: '🍄', type: 'spore', rarity: 'uncommon', growthBonus: 7, resilienceBonus: 11, value: 82, description: 'Dense spore puff from snowbank fungus. Surprisingly warm to hold.' },
  { id: 'mat_ash_cap_powder', name: 'Ash Cap Mineral Powder', emoji: '🟤', type: 'bark', rarity: 'uncommon', growthBonus: 9, resilienceBonus: 7, value: 78, description: 'Finely ground mineral powder from volcanic ash cap mushrooms.' },

  // Rare (6)
  { id: 'mat_polypore_slice', name: 'Oak Polypore Slice', emoji: '🪵', type: 'bark', rarity: 'rare', growthBonus: 15, resilienceBonus: 20, value: 350, description: 'A thick slice of ancient oak polypore. Radiates deep forest energy.' },
  { id: 'mat_dewdrop_essence', name: 'Dewdrop Cup Essence', emoji: '💎', type: 'essence', rarity: 'rare', growthBonus: 20, resilienceBonus: 15, value: 380, description: 'Pure healing essence collected from dewdrop cup fungi.' },
  { id: 'mat_summit_spore', name: 'Summit Cap Spore', emoji: '🏔️', type: 'spore', rarity: 'rare', growthBonus: 10, resilienceBonus: 25, value: 320, description: 'Spores from the summit cap mushroom, carrying altitude energy.' },
  { id: 'mat_cattail_pollen', name: 'Cattail Fern Pollen', emoji: '🌸', type: 'bloom', rarity: 'rare', growthBonus: 22, resilienceBonus: 12, value: 340, description: 'Golden pollen from marsh cattail fern, bursting with life force.' },
  { id: 'mat_permafrost_core', name: 'Permafrost Core Sample', emoji: '🧊', type: 'relic_shard', rarity: 'rare', growthBonus: 8, resilienceBonus: 28, value: 400, description: 'Ancient frozen mycelium core from permafrost depths.' },
  { id: 'mat_lava_fern_leaf', name: 'Lava Fern Leaf', emoji: '🔥', type: 'bloom', rarity: 'rare', growthBonus: 18, resilienceBonus: 18, value: 360, description: 'A warm, fire-resistant leaf from volcanic lava fern.' },

  // Epic (5)
  { id: 'mat_heartwood_sap', name: 'Heartwood Vine Sap', emoji: '💚', type: 'essence', rarity: 'epic', growthBonus: 30, resilienceBonus: 25, value: 1500, description: 'Living sap from the heartwood vine. Pulsates with network energy.' },
  { id: 'mat_abyss_crystal', name: 'Abyssal Crystal Fragment', emoji: '💠', type: 'relic_shard', rarity: 'epic', growthBonus: 25, resilienceBonus: 35, value: 1600, description: 'A crystal grown by abyssal mycelium. Contains encoded cave memories.' },
  { id: 'mat_rainbow_spore', name: 'Rainbow Spore Cluster', emoji: '🌈', type: 'spore', rarity: 'epic', growthBonus: 35, resilienceBonus: 20, value: 1700, description: 'Prismatic spores that refract all wavelengths of light.' },
  { id: 'mat_nightbloom_nectar', name: 'Mire Nightbloom Nectar', emoji: '🌙', type: 'essence', rarity: 'epic', growthBonus: 20, resilienceBonus: 30, value: 1400, description: 'Luminous nectar from nightbloom fungi with potent healing properties.' },
  { id: 'mat_magma_extract', name: 'Magma Bloom Extract', emoji: '🌋', type: 'essence', rarity: 'epic', growthBonus: 28, resilienceBonus: 28, value: 1800, description: 'Superheated extract from magma bloom. Channels volcanic energy.' },

  // Legendary (4)
  { id: 'mat_world_tree_seed', name: 'World Tree Seed Moss', emoji: '🌳', type: 'relic_shard', rarity: 'legendary', growthBonus: 50, resilienceBonus: 50, value: 8000, description: 'A fragment of moss from Yggdrasil\'s roots. Contains the memory of all forests.' },
  { id: 'mat_crystal_heart_gem', name: 'Crystal Heart Gem', emoji: '💍', type: 'relic_shard', rarity: 'legendary', growthBonus: 40, resilienceBonus: 60, value: 9500, description: 'A living crystal heart grown by the crystal heart fungus. Priceless.' },
  { id: 'mat_eternal_dew', name: 'Eternal Spring Dew', emoji: '💧', type: 'essence', rarity: 'legendary', growthBonus: 60, resilienceBonus: 40, value: 10000, description: 'A single drop of dew from eternal spring moss. Can resurrect any dead plant.' },
  { id: 'mat_aurora_pollen', name: 'Aurora Spore Cloud', emoji: '🌌', type: 'relic_shard', rarity: 'legendary', growthBonus: 45, resilienceBonus: 55, value: 12000, description: 'Captured aurora energy in spore form. Glows with dancing northern lights.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: MO_STRUCTURES — 25 Garden Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const MO_STRUCTURES: readonly MoStructureDef[] = [
  // ── Garden Beds (7) ─────────────────────────────────────────
  { id: 'str_forest_bed', name: 'Forest Moss Bed', emoji: '🟩', category: 'garden_bed', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A simple raised bed lined with forest loam for cultivating common mosses.' },
  { id: 'str_cave_bed', name: 'Cave Terrarium', emoji: '🕳️', category: 'garden_bed', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A sealed terrarium replicating cave conditions for subterranean fungi.' },
  { id: 'str_waterfall_bed', name: 'Mist Nursery', emoji: '💨', category: 'garden_bed', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'A mist-filled nursery bed for cultivating waterfall species.' },
  { id: 'str_mountain_bed', name: 'Alpine Rock Garden', emoji: '⛰️', category: 'garden_bed', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'A stone-based garden replicating alpine conditions at any altitude.' },
  { id: 'str_marsh_bed', name: 'Peat Bog Planter', emoji: '🌿', category: 'garden_bed', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A waterlogged planter for marsh and bog species cultivation.' },
  { id: 'str_tundra_bed', name: 'Frost Frame', emoji: '🧊', category: 'garden_bed', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A refrigerated frame that maintains Arctic temperatures for tundra species.' },
  { id: 'str_volcanic_bed', name: 'Magma Hearth Bed', emoji: '🔥', category: 'garden_bed', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'A heated bed with volcanic minerals for extremophile fungi.' },

  // ── Fountains (6) ───────────────────────────────────────────
  { id: 'str_dewdrop_fountain', name: 'Dewdrop Fountain', emoji: '⛲', category: 'fountain', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A gentle fountain that provides constant hydration to nearby plants.' },
  { id: 'str_spring_well', name: 'Spring Well', emoji: '🪣', category: 'fountain', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'An enchanted well that draws pure groundwater to nourish the garden.' },
  { id: 'str_rain_basin', name: 'Rain Basin', emoji: '🌧️', category: 'fountain', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A basin that collects magical rainwater with enhanced growth properties.' },
  { id: 'str_ancient_pool', name: 'Ancient Moss Pool', emoji: '🌊', category: 'fountain', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A pool lined with living moss that purifies and empowers water.' },
  { id: 'str_crystal_spring', name: 'Crystal Spring', emoji: '💎', category: 'fountain', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A spring flowing through enchanted crystals. The water glows with vitality.' },
  { id: 'str_world_tree_root', name: 'World Tree Root Well', emoji: '🌳', category: 'fountain', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'A well fed by roots connected to the ancient World Tree. Infinite nourishment.' },

  // ── Spore Labs (5) ──────────────────────────────────────────
  { id: 'str_basic_lab', name: 'Basic Spore Lab', emoji: '🔬', category: 'spore_lab', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A simple workstation for collecting and analyzing common spores.' },
  { id: 'str_hybrid_bench', name: 'Hybrid Cultivation Bench', emoji: '🧫', category: 'spore_lab', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'An advanced bench for cross-pollinating moss species to create hybrids.' },
  { id: 'str_spore_vault', name: 'Spore Preservation Vault', emoji: '🏭', category: 'spore_lab', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A climate-controlled vault that preserves spore viability indefinitely.' },
  { id: 'str_essence_extractor', name: 'Essence Extractor', emoji: '⚗️', category: 'spore_lab', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A magical device that extracts pure botanical essence from any specimen.' },
  { id: 'str_genesis_chamber', name: 'Genesis Chamber', emoji: '🧬', category: 'spore_lab', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate cultivation lab. Can synthesize legendary-grade spores from raw material.' },

  // ── Stone Altars (4) ────────────────────────────────────────
  { id: 'str_moss_altar', name: 'Moss Stone Altar', emoji: '🪨', category: 'stone_altar', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A moss-covered stone altar that amplifies forest species growth.' },
  { id: 'str_ancient_standing', name: 'Ancient Standing Stone', emoji: '🗿', category: 'stone_altar', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'A mysterious standing stone inscribed with ancient botanical glyphs.' },
  { id: 'str_geode_shrine', name: 'Geode Shrine', emoji: '💎', category: 'stone_altar', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A hollow geode shrine that resonates with crystal frequencies.' },
  { id: 'str_monolith', name: 'Garden Monolith', emoji: '🔺', category: 'stone_altar', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'The central monolith of the garden. All growth bonuses are amplified here.' },

  // ── Nature Shrines (3) ──────────────────────────────────────
  { id: 'str_green_shrine', name: 'Green Man Shrine', emoji: '🙏', category: 'nature_shrine', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A shrine to the Green Man that boosts passive specimen regeneration.' },
  { id: 'str_sacred_grove', name: 'Sacred Grove Shrine', emoji: '🌲', category: 'nature_shrine', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A grove of sacred trees that channel natural energy to all garden plots.' },
  { id: 'str_verdant_sanctum', name: 'Verdant Sanctum', emoji: '🌿', category: 'nature_shrine', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'The most sacred structure in the garden. It can accelerate time for a single species.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: MO_ABILITIES — 22 Botanical Abilities
// ═══════════════════════════════════════════════════════════════════

export const MO_ABILITIES: readonly MoAbilityDef[] = [
  { id: 'ab_rapid_spread', name: 'Rapid Spread', emoji: '🌿', biome: 'forest', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Cause moss to spread rapidly across a target area.' },
  { id: 'ab_moisture_absorb', name: 'Moisture Absorb', emoji: '💧', biome: 'waterfall', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Draw moisture from the air to hydrate all specimens at once.' },
  { id: 'ab_frost_resistance', name: 'Frost Resistance', emoji: '❄️', biome: 'tundra', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 10, description: 'Shield specimens from cold damage for a short duration.' },
  { id: 'ab_heat_tolerance', name: 'Heat Tolerance', emoji: '🔥', biome: 'volcanic', type: 'active', rarity: 'common', energyCost: 12, cooldown: 90, power: 5, description: 'Protect specimens from extreme heat and volcanic conditions.' },
  { id: 'ab_bioluminescence', name: 'Bioluminescence', emoji: '✨', biome: 'cave', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Emit a burst of bioluminescent light that boosts cave species growth.' },
  { id: 'ab_nutrient_cycle', name: 'Nutrient Cycle', emoji: '♻️', biome: 'marsh', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 10, description: 'Accelerate the nutrient cycle to enrich all garden soil.' },
  { id: 'ab_deep_roots', name: 'Deep Roots', emoji: '🌱', biome: 'mountain', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 18, description: 'Force roots deep into bedrock for enhanced stability and nutrient access.' },
  { id: 'ab_shade_tolerance', name: 'Shade Tolerance', emoji: '🌳', biome: 'forest', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Create a canopy of shade that benefits all shade-loving species.' },
  { id: 'ab_spore_cloud', name: 'Spore Cloud', emoji: '☁️', biome: 'marsh', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 90, power: 35, description: 'Release a massive cloud of beneficial spores across the garden.' },
  { id: 'ab_aerial_spores', name: 'Aerial Spores', emoji: '🌬️', biome: 'mountain', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Launch spores into the wind to colonize distant garden plots.' },
  { id: 'ab_shadow_absorb', name: 'Shadow Absorb', emoji: '🌑', biome: 'cave', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 100, power: 32, description: 'Absorb shadows to boost cave species resilience dramatically.' },
  { id: 'ab_light_refraction', name: 'Light Refraction', emoji: '🌈', biome: 'waterfall', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 25, description: 'Refract available light to illuminate shaded areas of the garden.' },
  { id: 'ab_crystal_form', name: 'Crystal Form', emoji: '💎', biome: 'cave', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 55, power: 30, description: 'Encourage specimens to form protective crystalline structures.' },
  { id: 'ab_mycelium_network', name: 'Mycelium Network', emoji: '🕸️', biome: 'forest', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Link all forest specimens through a shared mycelium network for shared growth.' },
  { id: 'ab_regeneration', name: 'Regeneration', emoji: '💚', biome: 'waterfall', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Trigger rapid regeneration in damaged or unhealthy specimens.' },
  { id: 'ab_underground_network', name: 'Underground Network', emoji: '🕳️', biome: 'cave', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Passively boost all cave species through underground fungal connections.' },
  { id: 'ab_symbiotic_bond', name: 'Symbiotic Bond', emoji: '🤝', biome: 'forest', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 110, power: 45, description: 'Create symbiotic bonds between paired specimens for mutual growth bonuses.' },
  { id: 'ab_ancient_grove', name: 'Ancient Grove', emoji: '🌳', biome: 'forest', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Summon the spirit of an ancient grove to massively boost all species temporarily.' },
  { id: 'ab_primal_force', name: 'Primal Force', emoji: '🌋', biome: 'volcanic', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'Channel the raw primal force of nature. All growth is multiplied for a brief moment.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: MO_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const MO_ACHIEVEMENTS: readonly MoAchievementDef[] = [
  { id: 'ach_first_plant', name: 'First Planting', emoji: '🌱', description: 'Plant your first moss species.', condition: 'plant_1', reward: { gold: 50, renown: 10 } },
  { id: 'ach_five_planted', name: 'Apprentice Gardener', emoji: '🤚', description: 'Plant 5 different moss species.', condition: 'plant_5', reward: { gold: 200, renown: 40 } },
  { id: 'ach_first_harvest', name: 'Spore Collector', emoji: '💧', description: 'Harvest spores for the first time.', condition: 'harvest_1', reward: { gold: 80, renown: 15 } },
  { id: 'ach_ten_harvests', name: 'Master Harvester', emoji: '⚗️', description: 'Harvest spores 10 times.', condition: 'harvest_10', reward: { gold: 300, renown: 60 } },
  { id: 'ach_first_build', name: 'Groundbreaking', emoji: '🏗️', description: 'Build your first garden structure.', condition: 'build_1', reward: { gold: 100, renown: 20 } },
  { id: 'ach_five_builds', name: 'Garden Architect', emoji: '🏛️', description: 'Build 5 different garden structures.', condition: 'build_5', reward: { gold: 500, renown: 80 } },
  { id: 'ach_plot_tend', name: 'Plot Tender', emoji: '🗺️', description: 'Tend 4 different garden plots.', condition: 'plot_4', reward: { gold: 400, renown: 50 } },
  { id: 'ach_all_plots', name: 'Master Gardener', emoji: '🌍', description: 'Tend all 8 garden plots.', condition: 'plot_8', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_rare_plant', name: 'Rare Cultivation', emoji: '💎', description: 'Plant a rare moss species.', condition: 'rare_plant', reward: { gold: 500, renown: 100 } },
  { id: 'ach_epic_plant', name: 'Epic Discovery', emoji: '🌟', description: 'Plant an epic moss species.', condition: 'epic_plant', reward: { gold: 1500, renown: 250 } },
  { id: 'ach_legendary_plant', name: 'Legendary Cultivator', emoji: '👑', description: 'Plant a legendary moss species.', condition: 'legendary_plant', reward: { gold: 5000, renown: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first nature artifact.', condition: 'relic_1', reward: { gold: 300, renown: 60 } },
  { id: 'ach_five_relics', name: 'Relic Collector', emoji: '🔍', description: 'Collect 5 different nature artifacts.', condition: 'relic_5', reward: { gold: 1000, renown: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first garden event.', condition: 'event_1', reward: { gold: 200, renown: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 garden events.', condition: 'event_10', reward: { gold: 800, renown: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_all_biomes', name: 'Biome Master', emoji: '🌈', description: 'Plant species from all 7 biome types.', condition: 'all_biomes', reward: { gold: 3000, renown: 300 } },
  { id: 'ach_max_title', name: 'Verdant Deity', emoji: '👑', description: 'Reach the title of Verdant Deity.', condition: 'max_title', reward: { gold: 10000, renown: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: MO_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const MO_TITLES: readonly MoTitleDef[] = [
  { id: 'title_seedling', name: 'Seedling Tender', emoji: '🌱', minRenown: 0, minSpecies: 0, description: 'A novice who has just begun their journey with moss cultivation.' },
  { id: 'title_gardener', name: 'Moss Gardener', emoji: '🌿', minRenown: 50, minSpecies: 3, description: 'A competent gardener who can cultivate common moss species with ease.' },
  { id: 'title_cultivator', name: 'Spore Cultivator', emoji: '🍄', minRenown: 200, minSpecies: 7, description: 'A skilled cultivator who works with rare fungal spores and delicate mosses.' },
  { id: 'title_botanist', name: 'Verdant Botanist', emoji: '🔬', minRenown: 500, minSpecies: 12, description: 'An expert botanist who commands deep knowledge of all biome ecosystems.' },
  { id: 'title_warden', name: 'Garden Warden', emoji: '🏰', minRenown: 1200, minSpecies: 18, description: 'A warden of the ancient garden, entrusted with the rarest living specimens.' },
  { id: 'title_keeper', name: 'Nature Keeper', emoji: '🌿', minRenown: 2500, minSpecies: 24, description: 'A keeper of nature\'s balance, maintaining harmony across all garden biomes.' },
  { id: 'title_sage', name: 'Moss Sage', emoji: '🧙', minRenown: 5000, minSpecies: 30, description: 'A legendary sage whose garden is whispered about in botanical circles worldwide.' },
  { id: 'title_deity', name: 'Verdant Deity', emoji: '👑', minRenown: 10000, minSpecies: 35, description: 'The Verdant Deity — master of all moss and fungi, guardian of the World Garden.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: MO_RELICS — 15 Legendary Nature Artifacts
// ═══════════════════════════════════════════════════════════════════

export const MO_RELICS: readonly MoRelicDef[] = [
  { id: 'relic_green_scepter', name: 'Green Man Scepter', emoji: '🪄', rarity: 'epic', biome: 'forest', growthBoost: 20, resilienceBoost: 15, spreadBoost: 10, value: 2000, description: 'A wooden scepter entwined with living moss. It grants authority over all forest growth.' },
  { id: 'relic_crystal_shard', name: 'Crystal Heart Shard', emoji: '💠', rarity: 'epic', biome: 'cave', growthBoost: 15, resilienceBoost: 20, spreadBoost: 15, value: 2200, description: 'A shard from the legendary crystal heart fungus. It pulses with underground energy.' },
  { id: 'relic_raindrop_vial', name: 'Raindrop Vial', emoji: '💧', rarity: 'rare', biome: 'waterfall', growthBoost: 10, resilienceBoost: 10, spreadBoost: 15, value: 800, description: 'A vial containing eternal waterfall mist. Enhances growth of all moisture-loving species.' },
  { id: 'relic_summit_stone', name: 'Summit Stone', emoji: '🪨', rarity: 'rare', biome: 'mountain', growthBoost: 5, resilienceBoost: 20, spreadBoost: 10, value: 750, description: 'A stone from the highest peak. Species near it gain incredible resilience.' },
  { id: 'relic_bog_amber', name: 'Bog Amber', emoji: '🟤', rarity: 'epic', biome: 'marsh', growthBoost: 18, resilienceBoost: 12, spreadBoost: 20, value: 2500, description: 'Ancient amber from a primordial bog containing perfectly preserved spores.' },
  { id: 'relic_frost_gem', name: 'Permafrost Gem', emoji: '❄️', rarity: 'epic', biome: 'tundra', growthBoost: 12, resilienceBoost: 25, spreadBoost: 15, value: 2400, description: 'A gem formed by millennia of permafrost pressure. Radiates gentle cold energy.' },
  { id: 'relic_lava_core', name: 'Lava Core Fragment', emoji: '🌋', rarity: 'epic', biome: 'volcanic', growthBoost: 25, resilienceBoost: 18, spreadBoost: 10, value: 2600, description: 'A fragment of solidified magma core. It warms the soil and accelerates volcanic species.' },
  { id: 'relic_world_root', name: 'World Tree Root', emoji: '🌳', rarity: 'legendary', biome: 'forest', growthBoost: 40, resilienceBoost: 30, spreadBoost: 20, value: 8000, description: 'A living root from Yggdrasil. Connected to every forest on earth through mycelium.' },
  { id: 'relic_depth_crystal', name: 'Depth Crystal', emoji: '💎', rarity: 'legendary', biome: 'cave', growthBoost: 30, resilienceBoost: 40, spreadBoost: 15, value: 7500, description: 'A crystal formed at the deepest point of the underworld. Contains primordial earth energy.' },
  { id: 'relic_eternal_droplet', name: 'Eternal Droplet', emoji: '💧', rarity: 'legendary', biome: 'waterfall', growthBoost: 35, resilienceBoost: 25, spreadBoost: 30, value: 9000, description: 'A single drop of water that has been cycling through waterfalls since the dawn of time.' },
  { id: 'relic_cloud_seed', name: 'Cloud Crown Seed', emoji: '☁️', rarity: 'rare', biome: 'mountain', growthBoost: 15, resilienceBoost: 15, spreadBoost: 20, value: 700, description: 'A seed that fell from a cloud. Planting it summons localized rainfall.' },
  { id: 'relic_mire_heart', name: 'Mire Heart', emoji: '💚', rarity: 'legendary', biome: 'marsh', growthBoost: 25, resilienceBoost: 35, spreadBoost: 25, value: 9500, description: 'The living heart of the ancient bog spirit. It remembers every plant that ever lived.' },
  { id: 'relic_aurora_crystal', name: 'Aurora Crystal', emoji: '🌌', rarity: 'legendary', biome: 'tundra', growthBoost: 35, resilienceBoost: 35, spreadBoost: 25, value: 10000, description: 'A crystal that has absorbed centuries of aurora borealis. Glows with perpetual northern lights.' },
  { id: 'relic_inferno_seed', name: 'Inferno Seed', emoji: '🔥', rarity: 'legendary', biome: 'volcanic', growthBoost: 50, resilienceBoost: 45, spreadBoost: 25, value: 11000, description: 'A seed born in magma that cannot be destroyed by any heat. The source of all volcanic life.' },
  { id: 'relic_evergreen_crown', name: 'Evergreen Crown', emoji: '👑', rarity: 'legendary', biome: 'forest', growthBoost: 30, resilienceBoost: 30, spreadBoost: 40, value: 12000, description: 'The crown of the Verdant Deity. Wearing it makes any garden eternally lush and fertile.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: MO_EVENTS — 12 Garden Events
// ═══════════════════════════════════════════════════════════════════

export const MO_EVENTS: readonly MoEventDef[] = [
  { id: 'evt_spring_rain', name: 'Spring Rain', emoji: '🌧️', durationTurns: 5, effectType: 'buff', effectDescription: 'All species hydration restored. Growth rate doubled.', description: 'Gentle spring rains nourish the entire garden. Every species thrives.' },
  { id: 'evt_drought', name: 'Great Drought', emoji: '☀️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Hydration drains 30% faster. Waterfall species immune.', description: 'A scorching drought dries the soil. Only waterfall species remain unaffected.' },
  { id: 'evt_fungal_bloom', name: 'Fungal Bloom', emoji: '🍄', durationTurns: 4, effectType: 'special', effectDescription: 'Cave species gain +50 growth. Rare spores appear.', description: 'An explosive fungal bloom in the cave plots produces rare spores everywhere.' },
  { id: 'evt_frost_morning', name: 'Killing Frost', emoji: '🥶', durationTurns: 2, effectType: 'debuff', effectDescription: 'Forest species lose 25% health. Tundra species enhanced.', description: 'An unexpected overnight frost threatens delicate species. Tundra mosses thrive.' },
  { id: 'evt_spore_storm', name: 'Spore Storm', emoji: '🌪️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Harvest yields reduced. Marsh species immune.', description: 'A massive storm of wild spores overwhelms the garden, disrupting cultivation.' },
  { id: 'evt_golden_hour', name: 'Golden Hour', emoji: '🌅', durationTurns: 5, effectType: 'buff', effectDescription: 'Gold rewards doubled. All species gain +20% health.', description: 'The perfect golden hour illuminates the garden, boosting morale and rewards.' },
  { id: 'evt_mycelium_surge', name: 'Mycelium Surge', emoji: '🕸️', durationTurns: 4, effectType: 'buff', effectDescription: 'All species spread rate increased. Forest species enhanced.', description: 'An underground mycelium network surge connects the entire garden in symbiosis.' },
  { id: 'evt_blight', name: 'Garden Blight', emoji: '🦠', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% gold. Relic discovery chance increased.', description: 'A mysterious blight strikes but leaves behind traces of ancient artifacts.' },
  { id: 'evt_lunar_bloom', name: 'Lunar Bloom', emoji: '🌙', durationTurns: 3, effectType: 'buff', effectDescription: 'Cave bioluminescent species triple power. All healing doubled.', description: 'Under the full moon, bioluminescent species bloom brilliantly and heal others.' },
  { id: 'evt_monsoon', name: 'Garden Monsoon', emoji: '⛈️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Mountain species health halved. Marsh and waterfall species thrive.', description: 'Torrential monsoon rains flood the garden. Only water-loving species benefit.' },
  { id: 'evt_ancient_awakening', name: 'Ancient Awakening', emoji: '🗿', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus renown for tending. Legendary material chance doubled.', description: 'Ancient stones in the garden begin to glow, awakening long-dormant energies.' },
  { id: 'evt_migration', name: 'Great Spore Migration', emoji: '🦋', durationTurns: 6, effectType: 'buff', effectDescription: 'Planting costs halved. New species available temporarily.', description: 'Millions of spores migrate through the garden. The perfect time to plant rare species.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const MO_MAX_SPECIMEN_LEVEL = 50
const MO_MAX_STRUCTURE_LEVEL = 10
const MO_INITIAL_GOLD = 200
const MO_INITIAL_RENOWN = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function moXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function moCalcStats(species: MoSpeciesDef, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    growthPower: Math.floor(species.growthPower * growth),
    resiliencePower: Math.floor(species.resiliencePower * growth),
    spreadRate: Math.floor(species.spreadRate * growth),
  }
}

let _moIdCounter = 0
function moGenerateId(): string {
  _moIdCounter += 1
  return `mo_${_moIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function moFindSpecies(id: string): MoSpeciesDef | undefined {
  return MO_SPECIES.find((s) => s.id === id)
}

function moFindPlot(id: string): MoPlotDef | undefined {
  return MO_PLOTS.find((p) => p.id === id)
}

function moFindMaterial(id: string): MoMaterialDef | undefined {
  return MO_MATERIALS.find((m) => m.id === id)
}

function moFindStructureDef(id: string): MoStructureDef | undefined {
  return MO_STRUCTURES.find((s) => s.id === id)
}

function moFindAbility(id: string): MoAbilityDef | undefined {
  return MO_ABILITIES.find((a) => a.id === id)
}

function moFindRelic(id: string): MoRelicDef | undefined {
  return MO_RELICS.find((r) => r.id === id)
}

function moFindAchievement(id: string): MoAchievementDef | undefined {
  return MO_ACHIEVEMENTS.find((a) => a.id === id)
}

function moFindTitle(id: MoTitleId): MoTitleDef | undefined {
  return MO_TITLES.find((t) => t.id === id)
}

function moRarityMultiplier(rarity: MoRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function moRarityColor(rarity: MoRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function moBiomeColor(biome: MoBiomeType): string {
  switch (biome) {
    case 'forest': return MO_MOSS_GREEN
    case 'cave': return MO_LICHEN_GRAY
    case 'waterfall': return MO_DEWDROP_BLUE
    case 'mountain': return MO_BARK_BROWN
    case 'marsh': return MO_EMERALD
    case 'tundra': return MO_SPORE_GOLD
    case 'volcanic': return MO_MUSHROOM_BROWN
    default: return '#888888'
  }
}

export function moCheckBiomeSynergy(attacker: MoBiomeType, defender: MoBiomeType): number {
  const advantages = MO_BIOME_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = MO_BIOME_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function moCalcStructureUpgradeCost(def: MoStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function moCalcMaxTitle(renown: number, speciesCount: number): MoTitleId {
  let bestId: MoTitleId = 'title_seedling'
  for (const title of MO_TITLES) {
    if (renown >= title.minRenown && speciesCount >= title.minSpecies) {
      bestId = title.id
    }
  }
  return bestId
}

function moCheckAchievementCondition(
  condition: string,
  state: MoStoreState
): boolean {
  switch (condition) {
    case 'plant_1':
      return state.totalPlanted >= 1
    case 'plant_5':
      return state.totalPlanted >= 5
    case 'harvest_1':
      return state.totalHarvested >= 1
    case 'harvest_10':
      return state.totalHarvested >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'plot_4':
      return state.plots.length >= 4
    case 'plot_8':
      return state.plots.length >= 8
    case 'rare_plant':
      return state.specimens.some((s) => {
        const sp = moFindSpecies(s.speciesId)
        return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'epic_plant':
      return state.specimens.some((s) => {
        const sp = moFindSpecies(s.speciesId)
        return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'legendary_plant':
      return state.specimens.some((s) => {
        const sp = moFindSpecies(s.speciesId)
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
    case 'all_biomes': {
      const biomes = new Set<MoBiomeType>()
      for (const s of state.specimens) {
        const sp = moFindSpecies(s.speciesId)
        if (sp) biomes.add(sp.biome)
      }
      return biomes.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_deity'
    default:
      return false
  }
}

function moPickRandomEvent(): MoEventDef {
  const idx = Math.floor(Math.random() * MO_EVENTS.length)
  return MO_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useMoStore = create<MoFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      specimens: [] as MoSpeciesInstance[],
      plots: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as MoStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_seedling' as MoTitleId,
      gold: MO_INITIAL_GOLD,
      renown: MO_INITIAL_RENOWN,
      totalPlanted: 0,
      totalHarvested: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as MoEventDef | null,
      eventTurnsRemaining: 0,
      activePlot: null as string | null,

      // ── moPlantSpecies ────────────────────────────────────────
      moPlantSpecies: (speciesId: string): boolean => {
        const species = moFindSpecies(speciesId)
        if (!species) return false
        const cost = Math.floor(50 * moRarityMultiplier(species.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = moCalcStats(species, 1)
        const newSpecimen: MoSpeciesInstance = {
          id: moGenerateId(),
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          growthPower: stats.growthPower,
          resiliencePower: stats.resiliencePower,
          spreadRate: stats.spreadRate,
          health: 80,
          hydration: 70,
          plantedAt: Date.now(),
        }
        set((prev) => {
          const newRenown = prev.renown + moRarityMultiplier(species.rarity) * 5
          return {
            specimens: [...prev.specimens, newSpecimen],
            gold: prev.gold - cost,
            totalPlanted: prev.totalPlanted + 1,
            renown: newRenown,
            currentTitle: moCalcMaxTitle(newRenown, prev.specimens.length + 1),
          }
        })
        return true
      },

      // ── moRemoveSpecies ───────────────────────────────────────
      moRemoveSpecies: (specimenId: string): boolean => {
        const state = get()
        const exists = state.specimens.find((s) => s.id === specimenId)
        if (!exists) return false
        const species = moFindSpecies(exists.speciesId)
        const refund = species ? Math.floor(25 * moRarityMultiplier(species.rarity)) : 10
        set((prev) => ({
          specimens: prev.specimens.filter((s) => s.id !== specimenId),
          gold: prev.gold + refund,
          currentTitle: moCalcMaxTitle(prev.renown, prev.specimens.length - 1),
        }))
        return true
      },

      // ── moWaterSpecies ────────────────────────────────────────
      moWaterSpecies: (specimenId: string): boolean => {
        const waterCost = 10
        const state = get()
        if (state.gold < waterCost) return false
        set((prev) => {
          const specimens = prev.specimens.map((s) => {
            if (s.id !== specimenId) return s
            const newXp = s.xp + 20
            const xpNeeded = moXpForLevel(s.level)
            let newLevel = s.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && s.level < MO_MAX_SPECIMEN_LEVEL) {
              newLevel = s.level + 1
              currentXp = newXp - xpNeeded
            }
            const species = moFindSpecies(s.speciesId)
            const stats = species
              ? moCalcStats(species, newLevel)
              : { growthPower: s.growthPower, resiliencePower: s.resiliencePower, spreadRate: s.spreadRate }
            return {
              ...s,
              level: newLevel,
              xp: currentXp,
              growthPower: stats.growthPower,
              resiliencePower: stats.resiliencePower,
              spreadRate: stats.spreadRate,
              health: Math.min(100, s.health + 10),
              hydration: Math.min(100, s.hydration + 20),
            }
          })
          return { specimens, gold: prev.gold - waterCost, renown: prev.renown + 2 }
        })
        return true
      },

      // ── moHarvestSpore ────────────────────────────────────────
      moHarvestSpore: (specimenId: string): boolean => {
        const state = get()
        const specimen = state.specimens.find((s) => s.id === specimenId)
        if (!specimen) return false
        if (specimen.hydration < 20) return false
        const species = moFindSpecies(specimen.speciesId)
        if (!species) return false
        const materialId = `mat_${species.biome}_${species.rarity}_spore`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(specimen.growthPower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) =>
                m.materialId === materialId ? { ...m, count: m.count + amount } : m
              )
            : [...prev.materials, { materialId, count: amount }],
          totalHarvested: prev.totalHarvested + 1,
          renown: prev.renown + 3,
          specimens: prev.specimens.map((s) =>
            s.id === specimenId ? { ...s, hydration: Math.max(0, s.hydration - 20) } : s
          ),
        }))
        return true
      },

      // ── moBuildStructure ──────────────────────────────────────
      moBuildStructure: (structureDefId: string): boolean => {
        const def = moFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: MoStructureInstance = {
          id: moGenerateId(),
          structureDefId,
          level: 1,
          builtAt: Date.now(),
        }
        set((prev) => ({
          structures: [...prev.structures, newStructure],
          gold: prev.gold - def.baseCost,
          totalBuilt: prev.totalBuilt + 1,
          renown: prev.renown + 10,
        }))
        return true
      },

      // ── moUpgradeStructure ────────────────────────────────────
      moUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= MO_MAX_STRUCTURE_LEVEL) return false
        const def = moFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = moCalcStructureUpgradeCost(def, structure.level)
        if (state.gold < cost) return false
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === structureId ? { ...s, level: s.level + 1 } : s
          ),
          gold: prev.gold - cost,
          renown: prev.renown + Math.floor(def.effectPerLevel * 2),
        }))
        return true
      },

      // ── moTendPlot ────────────────────────────────────────────
      moTendPlot: (plotId: string): MoEventDef | null => {
        const plot = moFindPlot(plotId)
        if (!plot) return null
        const state = get()
        const requiredTitleIdx = MO_TITLES.findIndex((t) => t.id === plot.requiredTitle)
        const currentTitleIdx = MO_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newPlots = state.plots.includes(plotId) ? state.plots : [...state.plots, plotId]
        const event = moPickRandomEvent()
        set((prev) => ({
          plots: newPlots,
          activePlot: plotId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          renown: prev.renown + 5,
        }))
        return event
      },

      // ── moCollectRelic ────────────────────────────────────────
      moCollectRelic: (relicId: string): boolean => {
        const relic = moFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        const renownGain = Math.floor(moRarityMultiplier(relic.rarity) * 20)
        set((prev) => ({
          relics: [...prev.relics, relicId],
          renown: prev.renown + renownGain,
          currentTitle: moCalcMaxTitle(prev.renown + renownGain, prev.specimens.length),
        }))
        return true
      },

      // ── moUnlockAbility ───────────────────────────────────────
      moUnlockAbility: (abilityId: string): boolean => {
        const ability = moFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * moRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── moUnlockTitle ────────────────────────────────────────
      moUnlockTitle: (titleId: MoTitleId): boolean => {
        const title = moFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.renown < title.minRenown) return false
        if (state.specimens.length < title.minSpecies) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── moClaimAchievement ────────────────────────────────────
      moClaimAchievement: (achievementId: string): boolean => {
        const achievement = moFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!moCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => {
          const newRenown = prev.renown + achievement.reward.renown
          return {
            achievements: [...prev.achievements, achievementId],
            gold: prev.gold + achievement.reward.gold,
            renown: newRenown,
            currentTitle: moCalcMaxTitle(newRenown, prev.specimens.length),
          }
        })
        return true
      },

      // ── moTradeMaterial ───────────────────────────────────────
      moTradeMaterial: (materialId: string, count: number): number => {
        const material = moFindMaterial(materialId)
        if (!material) return 0
        const state = get()
        const owned = state.materials.find((m) => m.materialId === materialId)
        if (!owned || owned.count < count) return 0
        const goldEarned = material.value * count
        set((prev) => ({
          materials:
            owned.count - count <= 0
              ? prev.materials.filter((m) => m.materialId !== materialId)
              : prev.materials.map((m) =>
                  m.materialId === materialId ? { ...m, count: m.count - count } : m
                ),
          gold: prev.gold + goldEarned,
        }))
        return goldEarned
      },

      // ── moEndEvent ────────────────────────────────────────────
      moEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── moResetEvent ──────────────────────────────────────────
      moResetEvent: () => {
        const event = moPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'moss-garden-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useMossGarden()
// ═══════════════════════════════════════════════════════════════════

export default function useMossGarden(): MoAPI {
  const store = useMoStore()

  // ── Computed: Owned specimens with species info ──────────────
  const moOwnedSpecimens = useMemo(() => {
    return store.specimens.map((s) => {
      const species = moFindSpecies(s.speciesId)
      return {
        ...s,
        species,
        biomeColor: species ? moBiomeColor(species.biome) : '#888888',
        rarityColor: species ? moRarityColor(species.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available species to plant ─────────────────────
  const moAvailableSpecies = useMemo(() => {
    return MO_SPECIES.filter((sp) => {
      const cost = Math.floor(50 * moRarityMultiplier(sp.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ──────────────────────────
  const moCurrentTitleDetail = useMemo(() => {
    return moFindTitle(store.currentTitle) ?? MO_TITLES[0]
  }, [store])

  // ── Computed: Next title info ────────────────────────────────
  const moNextTitle = useMemo(() => {
    const currentIdx = MO_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= MO_TITLES.length - 1) return null
    return MO_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active plot details ────────────────────────────
  const moActivePlotDetail = useMemo(() => {
    if (!store.activePlot) return null
    return moFindPlot(store.activePlot) ?? null
  }, [store])

  // ── Computed: Untended plots ─────────────────────────────────
  const moUntendedPlots = useMemo(() => {
    return MO_PLOTS.filter((p) => !store.plots.includes(p.id))
  }, [store])

  // ── Computed: Structures with defs ───────────────────────────
  const moBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = moFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ───────────────────────────
  const moUnlockableAbilities = useMemo(() => {
    return MO_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * moRarityMultiplier(a.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ─────────────────────────
  const moOwnedRelics = useMemo(() => {
    return store.relics
      .map((rId) => {
        const def = moFindRelic(rId)
        return def ?? null
      })
      .filter((r): r is MoRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ─────────────────────────
  const moUnclaimedAchievements = useMemo(() => {
    return MO_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return moCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ────────────────────────────
  const moInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = moFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect bonus ──────────────────
  const moTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = moFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average specimen level ─────────────────────────
  const moAverageSpecimenLevel = useMemo(() => {
    if (store.specimens.length === 0) return 0
    const total = store.specimens.reduce((sum, s) => sum + s.level, 0)
    return Math.floor(total / store.specimens.length)
  }, [store])

  // ── Computed: Total specimen power ───────────────────────────
  const moTotalSpecimenPower = useMemo(() => {
    return store.specimens.reduce(
      (sum, s) => sum + s.growthPower + s.resiliencePower + s.spreadRate,
      0
    )
  }, [store])

  // ── Computed: Biome distribution ─────────────────────────────
  const moBiomeDistribution = useMemo(() => {
    const counts: Record<MoBiomeType, number> = {
      forest: 0, cave: 0, waterfall: 0, mountain: 0, marsh: 0, tundra: 0, volcanic: 0,
    }
    for (const s of store.specimens) {
      const sp = moFindSpecies(s.speciesId)
      if (sp) counts[sp.biome]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ────────────────────────────
  const moRarityDistribution = useMemo(() => {
    const counts: Record<MoRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const s of store.specimens) {
      const sp = moFindSpecies(s.speciesId)
      if (sp) counts[sp.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Specimens by rarity ────────────────────────────
  const moSpecimensByRarity = useMemo(() => {
    const groups: Record<MoRarity, MoSpeciesInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const s of store.specimens) {
      const sp = moFindSpecies(s.speciesId)
      if (sp) groups[sp.rarity].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Specimens by biome ─────────────────────────────
  const moSpecimensByBiome = useMemo(() => {
    const groups: Record<MoBiomeType, MoSpeciesInstance[]> = {
      forest: [], cave: [], waterfall: [], mountain: [], marsh: [], tundra: [], volcanic: [],
    }
    for (const s of store.specimens) {
      const sp = moFindSpecies(s.speciesId)
      if (sp) groups[sp.biome].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ─────────────────────────
  const moTitleProgress = useMemo(() => {
    const currentIdx = MO_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= MO_TITLES.length - 1) {
      return { percent: 100, renownNeeded: 0, speciesNeeded: 0 }
    }
    const next = MO_TITLES[currentIdx + 1]
    const renownProgress = Math.min(100, (store.renown / next.minRenown) * 100)
    const speciesProgress = Math.min(100, (store.specimens.length / next.minSpecies) * 100)
    return {
      percent: Math.floor((renownProgress + speciesProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - store.renown),
      speciesNeeded: Math.max(0, next.minSpecies - store.specimens.length),
    }
  }, [store])

  // ── Computed: Rare materials count ───────────────────────────
  const moRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = moFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Dehydrated specimens ───────────────────────────
  const moDehydratedSpecimens = useMemo(() => {
    return store.specimens.filter((s) => s.hydration < 30)
  }, [store])

  // ── Computed: Unhealthy specimens ────────────────────────────
  const moUnhealthySpecimens = useMemo(() => {
    return store.specimens.filter((s) => s.health < 30)
  }, [store])

  // ── Computed: Total relic boost ──────────────────────────────
  const moTotalRelicBoost = useMemo(() => {
    let growthBoost = 0
    let resilienceBoost = 0
    let spreadBoost = 0
    for (const rId of store.relics) {
      const relic = moFindRelic(rId)
      if (relic) {
        growthBoost += relic.growthBoost
        resilienceBoost += relic.resilienceBoost
        spreadBoost += relic.spreadBoost
      }
    }
    return { growthBoost, resilienceBoost, spreadBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return moAPI object
  // ═════════════════════════════════════════════════════════════

  const moAPI: MoAPI = {
    // ── Direct constants ──────────────────────────────────────
    MO_MOSS_GREEN,
    MO_EMERALD,
    MO_LICHEN_GRAY,
    MO_SPORE_GOLD,
    MO_MUSHROOM_BROWN,
    MO_DEWDROP_BLUE,
    MO_BLOSSOM_PINK,
    MO_BARK_BROWN,
    MO_SPECIES,
    MO_PLOTS,
    MO_MATERIALS,
    MO_STRUCTURES,
    MO_ABILITIES,
    MO_ACHIEVEMENTS,
    MO_TITLES,
    MO_RELICS,
    MO_EVENTS,
    MO_BIOMES,
    moCheckBiomeSynergy,

    // ── Store state ───────────────────────────────────────────
    specimens: store.specimens,
    plots: store.plots,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    gold: store.gold,
    renown: store.renown,
    totalPlanted: store.totalPlanted,
    totalHarvested: store.totalHarvested,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activePlot: store.activePlot,

    // ── Store actions ─────────────────────────────────────────
    moPlantSpecies: store.moPlantSpecies,
    moRemoveSpecies: store.moRemoveSpecies,
    moWaterSpecies: store.moWaterSpecies,
    moHarvestSpore: store.moHarvestSpore,
    moBuildStructure: store.moBuildStructure,
    moUpgradeStructure: store.moUpgradeStructure,
    moTendPlot: store.moTendPlot,
    moCollectRelic: store.moCollectRelic,
    moUnlockAbility: store.moUnlockAbility,
    moUnlockTitle: store.moUnlockTitle,
    moClaimAchievement: store.moClaimAchievement,
    moTradeMaterial: store.moTradeMaterial,
    moEndEvent: store.moEndEvent,
    moResetEvent: store.moResetEvent,

    // ── Computed getters ──────────────────────────────────────
    moOwnedSpecimens,
    moAvailableSpecies,
    moCurrentTitleDetail,
    moNextTitle,
    moActivePlotDetail,
    moUntendedPlots,
    moBuiltStructures,
    moUnlockableAbilities,
    moOwnedRelics,
    moUnclaimedAchievements,
    moInventoryMaterials,
    moTotalStructureEffect,
    moAverageSpecimenLevel,
    moTotalSpecimenPower,
    moBiomeDistribution,
    moRarityDistribution,
    moSpecimensByRarity,
    moSpecimensByBiome,
    moTitleProgress,
    moRareMaterialCount,
    moDehydratedSpecimens,
    moUnhealthySpecimens,
    moTotalRelicBoost,
  }

  return moAPI
}
