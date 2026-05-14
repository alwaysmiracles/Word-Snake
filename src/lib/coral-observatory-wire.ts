/**
 * Coral Observatory Wire — Underwater stargazing & research station module for Word Snake
 *
 * A deep-sea coral research mini-game: catalog 35 coral species across 5 rarity tiers,
 * explore 8 underwater research labs, collect 30 research materials, upgrade 25 lab
 * equipment pieces, wield 22 research abilities, earn 8 diver titles, make 15 rare
 * discoveries, and navigate 12 tidal events — backed by a Zustand store with persist
 * middleware.
 *
 * Storage key: coral-observatory-wire
 * Prefix: co / CO_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type CORarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type COCoralType = 'Brain Coral' | 'Staghorn' | 'Plate' | 'Pillar' | 'Sea Fan' | 'Tube' | 'Fire Coral'

export interface COSpeciesDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly coralType: COCoralType
  readonly rarity: CORarity
  readonly baseResearchValue: number
  readonly depth: string
  readonly ability: string
}

export interface COLabDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minDepth: number
  readonly unlockCost: number
  readonly bonuses: string[]
  readonly depthZone: string
}

export interface COMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: CORarity
  readonly source: string
  readonly value: number
}

export interface COEquipmentDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
  readonly category: string
}

export interface COAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly category: string
}

export interface COAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface COTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredLabs: number
}

export interface CODiscoveryDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: CORarity
  readonly researchBonus: number
  readonly specialAbility: string
}

export interface COTidalEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface COCatalogedSpecies {
  readonly id: string
  speciesDefId: string
  name: string
  level: number
  health: number
  maxHealth: number
  researchValue: number
  cultured: boolean
  cultureCount: number
  discoveredAt: number
}

export interface COOwnedEquipment {
  readonly id: string
  equipmentDefId: string
  level: number
  installed: boolean
}

export interface COReefState {
  health: number
  maxHealth: number
  pollution: number
  lastAnalyzedAt: number | null
}

export interface COStoreState {
  catalogedSpecies: COCatalogedSpecies[]
  collectedMaterials: Record<string, number>
  equipment: COOwnedEquipment[]
  achievements: string[]
  currentTitle: string
  madeDiscoveries: string[]
  unlockedLabs: string[]
  diverLevel: number
  diverExp: number
  credits: number
  researchPoints: number
  totalCataloged: number
  totalUpgraded: number
  totalCultured: number
  totalSensors: number
  totalSamples: number
  activeEventId: string | null
  eventTimer: number
  reef: COReefState
  activeLabId: string | null
}

export interface COStoreActions {
  coExploreReef: (speciesId: string) => boolean
  coCatalogSpecies: (speciesId: string) => boolean
  coUpgradeLab: (equipmentId: string) => boolean
  coUseAbility: (abilityId: string) => boolean
  coHandleTidalEvent: (eventId: string) => boolean
  coMakeDiscovery: (discoveryId: string) => boolean
  coCultureCoral: (instanceId: string) => boolean
  coDeploySensor: (labId: string) => boolean
  coMapTerrain: (labId: string) => boolean
  coAnalyzeSample: (materialId: string) => number
}

export type COFullStore = COStoreState & COStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const CO_COLOR_CORAL_PINK: string = '#FF6B8A'
export const CO_COLOR_TIDE_BLUE: string = '#1E90FF'
export const CO_COLOR_REEF_GREEN: string = '#2ECC71'
export const CO_COLOR_LAB_WHITE: string = '#F0F8FF'
export const CO_COLOR_SAMPLE_AMBER: string = '#FFB347'
export const CO_COLOR_DISCOVERY_GOLD: string = '#FFD700'
export const CO_COLOR_DEEP_INDIGO: string = '#4B0082'
export const CO_COLOR_BIOLUM_CYAN: string = '#00FFEF'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const CO_MAX_LEVEL = 50
const CO_INITIAL_CREDITS = 500
const CO_INITIAL_RESEARCH = 100

function coXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= CO_MAX_LEVEL) return Infinity
  return Math.floor(85 * Math.pow(1.13, level) + level * 16)
}

function coLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < CO_MAX_LEVEL) {
    const needed = coXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function coGenerateId(): string {
  return `co_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function coRarityMultiplier(rarity: CORarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function coCoralTypeColor(coralType: COCoralType): string {
  switch (coralType) {
    case 'Brain Coral': return CO_COLOR_CORAL_PINK
    case 'Staghorn': return CO_COLOR_REEF_GREEN
    case 'Plate': return CO_COLOR_SAMPLE_AMBER
    case 'Pillar': return CO_COLOR_TIDE_BLUE
    case 'Sea Fan': return CO_COLOR_BIOLUM_CYAN
    case 'Tube': return CO_COLOR_DISCOVERY_GOLD
    case 'Fire Coral': return '#FF4500'
  }
}

function coRarityColor(rarity: CORarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#818CF8'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: CORAL TYPE BONUSES & DISCOVERY CHANCES
// ═══════════════════════════════════════════════════════════════════

const CO_CORAL_TYPE_BONUSES: Record<COCoralType, { growthRate: number; resilience: number; researchBonus: number }> = {
  'Brain Coral': { growthRate: 5, resilience: 20, researchBonus: 10 },
  'Staghorn': { growthRate: 15, resilience: 8, researchBonus: 5 },
  'Plate': { growthRate: 10, resilience: 15, researchBonus: 8 },
  'Pillar': { growthRate: 3, resilience: 25, researchBonus: 12 },
  'Sea Fan': { growthRate: 12, resilience: 6, researchBonus: 18 },
  'Tube': { growthRate: 18, resilience: 10, researchBonus: 7 },
  'Fire Coral': { growthRate: 8, resilience: 18, researchBonus: 15 },
}

const CO_DISCOVERY_CHANCES: Record<CORarity, number> = {
  common: 55,
  uncommon: 25,
  rare: 12,
  epic: 6,
  legendary: 2,
}

const CO_LAB_CORAL_TYPE_BONUS: Record<string, COCoralType[]> = {
  shallow_cove_lab: ['Staghorn', 'Tube'],
  mid_reef_station: ['Brain Coral', 'Plate'],
  deep_grotto_lab: ['Pillar', 'Sea Fan'],
  abyssal_research_hub: ['Fire Coral', 'Sea Fan'],
  biolum_cavern_lab: ['Sea Fan', 'Tube'],
  hydrothermal_outpost: ['Fire Coral', 'Pillar'],
  coral_garden_observatory: ['Staghorn', 'Brain Coral', 'Plate'],
  midnight_abyss_lab: ['Fire Coral', 'Pillar', 'Sea Fan', 'Brain Coral', 'Staghorn', 'Plate', 'Tube'],
}

function coGetCoralTypeBonus(coralType: COCoralType): { growthRate: number; resilience: number; researchBonus: number } {
  return CO_CORAL_TYPE_BONUSES[coralType]
}

function coGetDiscoveryChance(rarity: CORarity, activeLabId: string | null): number {
  let chance = CO_DISCOVERY_CHANCES[rarity]
  if (activeLabId) {
    const bonusTypes = CO_LAB_CORAL_TYPE_BONUS[activeLabId]
    if (bonusTypes && bonusTypes.length > 3) {
      chance = chance * 1.5
    }
  }
  return Math.min(100, Math.floor(chance))
}

function coGetCultureBonus(level: number, cultureCount: number): number {
  return Math.floor(level * 12 * (1 + cultureCount * 0.25))
}

function coGetEquipmentBonus(equipmentId: string, level: number): number {
  switch (equipmentId) {
    case 'microscope_basic': return level * 2
    case 'sonar_scanner': return level * 4
    case 'deep_dive_suit': return level * 6
    case 'spectral_analyzer': return level * 8
    case 'biolum_detector': return level * 10
    case 'sample_extractor': return level * 3
    case 'culture_chamber': return level * 5
    case 'sonar_mapping_array': return level * 7
    case 'hydrophone_array': return level * 4
    case 'data_terminal': return level * 9
    default: return level * 2
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: CO_SPECIES — 35 Coral Species (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const CO_SPECIES: readonly COSpeciesDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'knobby_brain',
    name: 'Knobby Brain Coral',
    description:
      'A small brain coral with a textured surface resembling a human brain. Found in shallow tropical waters, it grows slowly but can live for several centuries. Its grooves provide shelter for tiny fish and crabs.',
    coralType: 'Brain Coral',
    rarity: 'common',
    baseResearchValue: 12,
    depth: '5-15m',
    ability: 'Calcium Shell',
  },
  {
    id: 'brown_staghorn',
    name: 'Brown Staghorn Coral',
    description:
      'A fast-growing branching coral that forms dense thickets in shallow reefs. Its antler-like branches create a complex three-dimensional habitat that supports hundreds of marine species.',
    coralType: 'Staghorn',
    rarity: 'common',
    baseResearchValue: 14,
    depth: '3-20m',
    ability: 'Rapid Growth',
  },
  {
    id: 'flat_table_plate',
    name: 'Flat Table Plate Coral',
    description:
      'A broad, disc-shaped coral that grows horizontally like a table top. It maximizes surface area to capture sunlight and provides a platform for other organisms to settle upon.',
    coralType: 'Plate',
    rarity: 'common',
    baseResearchValue: 13,
    depth: '8-25m',
    ability: 'Sun Canopy',
  },
  {
    id: 'thin_pillar',
    name: 'Thin Pillar Coral',
    description:
      'A tall, columnar coral that rises from the reef floor like a underwater pillar. Its surface is covered in small polyps that extend at night to feed on plankton drifting past.',
    coralType: 'Pillar',
    rarity: 'common',
    baseResearchValue: 15,
    depth: '10-30m',
    ability: 'Vertical Reach',
  },
  {
    id: 'purple_sea_fan',
    name: 'Purple Sea Fan',
    description:
      'An elegant fan-shaped coral that sways gently in the current. Its flat, branching structure is oriented perpendicular to water flow to maximize food capture from passing plankton.',
    coralType: 'Sea Fan',
    rarity: 'common',
    baseResearchValue: 11,
    depth: '5-25m',
    ability: 'Current Filter',
  },
  {
    id: 'green_tube_coral',
    name: 'Green Tube Coral',
    description:
      'A cluster of tubular coral structures that resemble organ pipes. Each tube houses a colony of polyps that extend feathery tentacles at night, creating a beautiful display of green luminescence.',
    coralType: 'Tube',
    rarity: 'common',
    baseResearchValue: 12,
    depth: '8-20m',
    ability: 'Night Bloom',
  },
  {
    id: 'lace_fire_coral',
    name: 'Lace Fire Coral',
    description:
      'Despite its delicate lace-like appearance, this coral delivers a powerful sting to anything that touches it. Its thin, branching blades are covered in nematocysts that cause a burning sensation.',
    coralType: 'Fire Coral',
    rarity: 'common',
    baseResearchValue: 16,
    depth: '3-15m',
    ability: 'Burning Touch',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'grooved_brain_giant',
    name: 'Grooved Brain Giant',
    description:
      'A massive brain coral that can reach the size of a small car. Its deep meandering grooves are home to a complex ecosystem of worms, mollusks, and tiny crustaceans that live nowhere else.',
    coralType: 'Brain Coral',
    rarity: 'uncommon',
    baseResearchValue: 28,
    depth: '10-30m',
    ability: 'Neural Network',
  },
  {
    id: 'elkhorn_staghorn',
    name: 'Elkhorn Staghorn Coral',
    description:
      'A large branching coral with thick, flattened branches that resemble elk antlers. Once the dominant reef-builder in the Caribbean, it is now prized by researchers for its ecological importance.',
    coralType: 'Staghorn',
    rarity: 'uncommon',
    baseResearchValue: 32,
    depth: '5-25m',
    ability: 'Reef Foundation',
  },
  {
    id: 'mushroom_plate_coral',
    name: 'Mushroom Plate Coral',
    description:
      'A free-living plate coral shaped like an upside-down mushroom. Unlike most corals, it is not attached to the substrate and can move slowly across the reef floor by inflating its tissues.',
    coralType: 'Plate',
    rarity: 'uncommon',
    baseResearchValue: 26,
    depth: '15-35m',
    ability: 'Mobile Colony',
  },
  {
    id: 'ribbed_pillar_tower',
    name: 'Ribbed Pillar Tower',
    description:
      'A tall pillar coral with distinct vertical ridges running along its length. These ridges create micro-currents that direct plankton toward the feeding polyps, making it exceptionally efficient.',
    coralType: 'Pillar',
    rarity: 'uncommon',
    baseResearchValue: 30,
    depth: '15-40m',
    ability: 'Current Channeling',
  },
  {
    id: 'gold_leaf_sea_fan',
    name: 'Gold Leaf Sea Fan',
    description:
      'A rare sea fan with a distinctive golden hue caused by symbiotic algae that produce a unique pigment. When illuminated, its branches scatter light in patterns reminiscent of autumn leaves.',
    coralType: 'Sea Fan',
    rarity: 'uncommon',
    baseResearchValue: 35,
    depth: '20-40m',
    ability: 'Golden Filter',
  },
  {
    id: 'orange_sunrise_tube',
    name: 'Orange Sunrise Tube Coral',
    description:
      'A striking tube coral whose polyps are bright orange with yellow tips. When it extends its tentacles at dusk, the colony resembles a field of miniature sunrises blooming from the reef.',
    coralType: 'Tube',
    rarity: 'uncommon',
    baseResearchValue: 29,
    depth: '10-30m',
    ability: 'Dusk Radiance',
  },
  {
    id: 'white_lace_fire',
    name: 'White Lace Fire Coral',
    description:
      'A fire coral variant with a pure white lace-like skeleton. Though visually delicate, its sting is the most potent among common fire corals, and researchers study its toxins for medical applications.',
    coralType: 'Fire Coral',
    rarity: 'uncommon',
    baseResearchValue: 33,
    depth: '8-25m',
    ability: 'Toxic Lace',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'crystal_brain_symphony',
    name: 'Crystal Brain Symphony',
    description:
      'A brain coral of extraordinary clarity whose skeleton is nearly transparent. Light passing through its translucent tissue creates kaleidoscopic patterns, and it emits a faint harmonic vibration detectable by specialized instruments.',
    coralType: 'Brain Coral',
    rarity: 'rare',
    baseResearchValue: 55,
    depth: '25-50m',
    ability: 'Resonance Pulse',
  },
  {
    id: 'blue_antler_staghorn',
    name: 'Blue Antler Staghorn',
    description:
      'A deep-water staghorn coral with branches that glow faint blue in low light. This bioluminescence attracts symbiotic shrimp that clean the coral, creating a mutually beneficial relationship unique to this species.',
    coralType: 'Staghorn',
    rarity: 'rare',
    baseResearchValue: 58,
    depth: '30-55m',
    ability: 'Bioluminescent Antlers',
  },
  {
    id: 'folding_fan_plate',
    name: 'Folding Fan Plate Coral',
    description:
      'A plate coral that grows in overlapping layers like the pages of a book. Each layer is a slightly different color, creating a gradient from deep purple at the base to vivid pink at the edges.',
    coralType: 'Plate',
    rarity: 'rare',
    baseResearchValue: 52,
    depth: '20-45m',
    ability: 'Chromatic Layers',
  },
  {
    id: 'ancient_spire_pillar',
    name: 'Ancient Spire Pillar',
    description:
      'A pillar coral of immense age whose growth rings reveal centuries of oceanographic data. The tallest known specimen reaches 4 meters and has been continuously growing for over 800 years.',
    coralType: 'Pillar',
    rarity: 'rare',
    baseResearchValue: 60,
    depth: '25-50m',
    ability: 'Living Archive',
  },
  {
    id: 'silk_ribbon_sea_fan',
    name: 'Silk Ribbon Sea Fan',
    description:
      'A sea fan of extraordinary delicacy whose branches are as thin as silk threads. It filters water with remarkable efficiency and produces a rare compound used in cancer research.',
    coralType: 'Sea Fan',
    rarity: 'rare',
    baseResearchValue: 62,
    depth: '30-60m',
    ability: 'Medical Silk',
  },
  {
    id: 'deep_well_tube',
    name: 'Deep Well Tube Coral',
    description:
      'A tube coral that grows exceptionally deep, with tubes reaching up to 30 centimeters in length. The interior of each tube is coated with a bioluminescent bacteria that produces steady cyan light.',
    coralType: 'Tube',
    rarity: 'rare',
    baseResearchValue: 56,
    depth: '35-65m',
    ability: 'Cyan Lantern',
  },
  {
    id: 'volcanic_fire_bloom',
    name: 'Volcanic Fire Bloom',
    description:
      'A fire coral found exclusively near hydrothermal vents. It thrives in water hot enough to kill most organisms and produces a unique enzyme that allows it to metabolize sulfur compounds directly.',
    coralType: 'Fire Coral',
    rarity: 'rare',
    baseResearchValue: 65,
    depth: '40-70m',
    ability: 'Sulfur Metabolism',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'neural_mind_coral',
    name: 'Neural Mind Coral',
    description:
      'A brain coral of such complexity that its neural pathways rival those of simple organisms. It can react to stimuli, learn patterns, and some researchers believe it may possess a rudimentary form of consciousness.',
    coralType: 'Brain Coral',
    rarity: 'epic',
    baseResearchValue: 95,
    depth: '50-80m',
    ability: 'Coral Intelligence',
  },
  {
    id: 'crystal_forest_staghorn',
    name: 'Crystal Forest Staghorn',
    description:
      'An immense staghorn colony that forms an underwater forest of crystal-clear branches. Light filtering through the branches creates prismatic displays visible from the surface on calm days.',
    coralType: 'Staghorn',
    rarity: 'epic',
    baseResearchValue: 100,
    depth: '40-75m',
    ability: 'Prismatic Canopy',
  },
  {
    id: 'orbital_plate_disc',
    name: 'Orbital Plate Disc',
    description:
      'A plate coral that grows in a perfect circle with mathematical precision. Its growth pattern follows the Fibonacci sequence, and its surface contains a biological clock synchronized to lunar cycles.',
    coralType: 'Plate',
    rarity: 'epic',
    baseResearchValue: 92,
    depth: '45-70m',
    ability: 'Lunar Clock',
  },
  {
    id: 'towering_babel_pillar',
    name: 'Towering Babel Pillar',
    description:
      'A pillar coral so tall it serves as a biological skyscraper for the reef. Entire ecosystems exist at different heights along its surface, with distinct communities at every depth zone.',
    coralType: 'Pillar',
    rarity: 'epic',
    baseResearchValue: 98,
    depth: '30-90m',
    ability: 'Vertical Ecosystem',
  },
  {
    id: 'aurora_mantle_fan',
    name: 'Aurora Mantle Sea Fan',
    description:
      'A sea fan that produces a continuous aurora-like display of shifting colors. This bioluminescent show attracts mates and repels predators, making it one of the most visually spectacular corals known.',
    coralType: 'Sea Fan',
    rarity: 'epic',
    baseResearchValue: 105,
    depth: '50-85m',
    ability: 'Aurora Display',
  },
  {
    id: 'organ_pipe_symphony',
    name: 'Organ Pipe Symphony',
    description:
      'A tube coral colony whose tubes vary in length to create natural resonant chambers. Water currents passing through produce musical tones that can be heard by divers from considerable distances.',
    coralType: 'Tube',
    rarity: 'epic',
    baseResearchValue: 96,
    depth: '55-80m',
    ability: 'Reef Symphony',
  },
  {
    id: 'inferno_crown_fire',
    name: 'Inferno Crown Fire Coral',
    description:
      'A fire coral that forms a crown-like structure at the top of underwater peaks. Its sting is powerful enough to temporarily paralyze large fish, and it produces an antibiotic compound of immense medical value.',
    coralType: 'Fire Coral',
    rarity: 'epic',
    baseResearchValue: 102,
    depth: '45-75m',
    ability: 'Crown Defense',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'world_brain_nexus',
    name: 'World Brain Nexus',
    description:
      'The largest and oldest brain coral ever discovered, spanning over 6 meters in diameter. Its neural network is so complex that it appears to communicate with other corals across the reef through chemical signals.',
    coralType: 'Brain Coral',
    rarity: 'legendary',
    baseResearchValue: 150,
    depth: '60-100m',
    ability: 'Reef Network',
  },
  {
    id: 'ancient_world_tree_staghorn',
    name: 'Ancient World Tree Staghorn',
    description:
      'A staghorn coral of mythic proportions that has been growing for over two millennia. Its branches span an area the size of a football field and provide habitat for over 3,000 identified marine species.',
    coralType: 'Staghorn',
    rarity: 'legendary',
    baseResearchValue: 145,
    depth: '15-60m',
    ability: 'Eternal Canopy',
  },
  {
    id: 'sun_disc_plate_ancient',
    name: 'Sun Disc Plate Ancient',
    description:
      'A plate coral of perfect circular symmetry that is estimated to be 5,000 years old. Its surface contains mineral deposits that record the entire climate history of the ocean during its lifetime.',
    coralType: 'Plate',
    rarity: 'legendary',
    baseResearchValue: 140,
    depth: '30-55m',
    ability: 'Climate Archive',
  },
  {
    id: 'atlas_pillar_worlds',
    name: 'Atlas Pillar of Worlds',
    description:
      'A pillar coral so immense it reaches from the ocean floor to near the surface. Its surface hosts distinct biomes at different depths, effectively creating a vertical world with its own weather patterns.',
    coralType: 'Pillar',
    rarity: 'legendary',
    baseResearchValue: 148,
    depth: '0-120m',
    ability: 'World Pillar',
  },
  {
    id: 'veil_of_abyss_fan',
    name: 'Veil of the Abyss Sea Fan',
    description:
      'A sea fan that dwells at the edge of the continental shelf where light fades to nothing. It has evolved to generate its own light through an internal chemical process and can illuminate an area of 50 square meters.',
    coralType: 'Sea Fan',
    rarity: 'legendary',
    baseResearchValue: 142,
    depth: '80-150m',
    ability: 'Abyss Illumination',
  },
  {
    id: 'eternal_grotto_tubes',
    name: 'Eternal Grotto Tube Coral',
    description:
      'A massive tube coral colony that has formed an entire underwater grotto. The tubes interlock to create cathedral-like chambers with naturally filtered seawater and perfect conditions for coral reproduction.',
    coralType: 'Tube',
    rarity: 'legendary',
    baseResearchValue: 138,
    depth: '40-80m',
    ability: 'Grotto Creation',
  },
  {
    id: 'primordial_fire_core',
    name: 'Primordial Fire Core',
    description:
      'A fire coral believed to be the ancestor of all fire coral species. It contains genetic material that predates the last mass extinction and holds the key to understanding coral resilience across geological time.',
    coralType: 'Fire Coral',
    rarity: 'legendary',
    baseResearchValue: 155,
    depth: '70-120m',
    ability: 'Primordial Flame',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: CO_LABS — 8 Underwater Research Labs
// ═══════════════════════════════════════════════════════════════════

export const CO_LABS: readonly COLabDef[] = [
  {
    id: 'shallow_cove_lab',
    name: 'Shallow Cove Lab',
    description:
      'A modest research outpost perched in a sunlit tropical cove. The warm, clear waters provide ideal conditions for studying common shallow-water coral species and their symbiotic relationships with clownfish and anemones.',
    minDepth: 1,
    unlockCost: 0,
    bonuses: ['+5% species discovery rate', 'Basic material collection'],
    depthZone: 'Sunlit Shallows (0-20m)',
  },
  {
    id: 'mid_reef_station',
    name: 'Mid Reef Station',
    description:
      'A glass-domed research station situated on a mid-reef plateau. Scientists here study the transition zone where sunlight begins to dim and coral species shift from light-dependent to mixed feeding strategies.',
    minDepth: 5,
    unlockCost: 250,
    bonuses: ['+10% research material yield', 'Uncommon coral encounters'],
    depthZone: 'Twilight Reef (15-40m)',
  },
  {
    id: 'deep_grotto_lab',
    name: 'Deep Grotto Laboratory',
    description:
      'A pressurized lab carved into the walls of an underwater grotto. The dim blue light filtering from above creates perfect conditions for studying bioluminescent organisms and deep-water coral adaptations.',
    minDepth: 10,
    unlockCost: 600,
    bonuses: ['+15% research value', 'Rare coral cataloging'],
    depthZone: 'Deep Blue (30-60m)',
  },
  {
    id: 'abyssal_research_hub',
    name: 'Abyssal Research Hub',
    description:
      'A heavily reinforced deep-sea research hub operating at extreme pressures. This facility studies the bizarre creatures and corals that survive in near-total darkness, using powerful artificial lights and submersible drones.',
    minDepth: 18,
    unlockCost: 1500,
    bonuses: ['+20% research points regeneration', 'Epic equipment available'],
    depthZone: 'Midnight Zone (50-100m)',
  },
  {
    id: 'biolum_cavern_lab',
    name: 'Bioluminescent Cavern Lab',
    description:
      'A laboratory built inside a vast underwater cavern where bioluminescent organisms create an otherworldly display of living light. The cavern walls are covered in bioluminescent coral, fungi, and bacteria.',
    minDepth: 25,
    unlockCost: 3500,
    bonuses: ['+25% bioluminescent material finds', 'Rare discovery chance'],
    depthZone: 'Luminous Cavern (40-80m)',
  },
  {
    id: 'hydrothermal_outpost',
    name: 'Hydrothermal Outpost',
    description:
      'A heat-resistant research station positioned near an active hydrothermal vent. The superheated mineral-rich water supports extremophile organisms including the rare volcanic fire coral and chemosynthetic bacteria colonies.',
    minDepth: 32,
    unlockCost: 8000,
    bonuses: ['+30% extremophile research', 'Epic coral cataloging'],
    depthZone: 'Thermal Vents (60-100m)',
  },
  {
    id: 'coral_garden_observatory',
    name: 'Coral Garden Observatory',
    description:
      'A sprawling underwater complex with panoramic observation windows overlooking the most biodiverse coral garden ever documented. Every known type of coral grows here in pristine conditions maintained by automated systems.',
    minDepth: 40,
    unlockCost: 18000,
    bonuses: ['+35% all research output', 'Legendary material chance'],
    depthZone: 'Paradise Garden (20-70m)',
  },
  {
    id: 'midnight_abyss_lab',
    name: 'Midnight Abyss Laboratory',
    description:
      'The deepest and most advanced research facility ever constructed. Operating at the edge of the abyssal plain, it studies organisms that have never seen sunlight and probes the very limits of marine biology.',
    minDepth: 48,
    unlockCost: 40000,
    bonuses: ['+50% all research value', 'Legendary coral discovery', 'Deep sample analysis'],
    depthZone: 'The Abyss (80-200m)',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: CO_MATERIALS — 30 Research Materials
// ═══════════════════════════════════════════════════════════════════

export const CO_MATERIALS: readonly COMaterialDef[] = [
  // Common (6)
  { id: 'sea_water_sample', name: 'Seawater Sample', description: 'A basic vial of filtered seawater collected from the reef. Contains dissolved minerals, micro-plankton, and trace elements useful for baseline water quality analysis.', rarity: 'common', source: 'shallow_cove_lab', value: 5 },
  { id: 'coral_fragment', name: 'Coral Fragment', description: 'A small piece of broken coral collected from the reef floor. Even dead coral fragments contain valuable calcium carbonate structures for mineralogical study.', rarity: 'common', source: 'shallow_cove_lab', value: 4 },
  { id: 'sand_grain_sample', name: 'Sand Grain Sample', description: 'A collection of sand grains from the reef bed composed primarily of parrotfish-produced coral sand and foraminifera shells.', rarity: 'common', source: 'shallow_cove_lab', value: 3 },
  { id: 'algae_scrape', name: 'Algae Scrape', description: 'A scraping of symbiotic zooxanthellae algae from the surface of a coral polyp. These microalgae provide corals with up to 90% of their energy through photosynthesis.', rarity: 'common', source: 'mid_reef_station', value: 6 },
  { id: 'shell_fragment', name: 'Shell Fragment', description: 'A fragment from a marine mollusk shell found near the reef. Shell composition reveals information about ocean chemistry and temperature at the time of formation.', rarity: 'common', source: 'shallow_cove_lab', value: 5 },
  { id: 'brine_shrimp_jar', name: 'Brine Shrimp Jar', description: 'A jar containing live brine shrimp collected from the reef plankton layer. These tiny crustaceans are a crucial food source for coral polyps and reef fish larvae.', rarity: 'common', source: 'shallow_cove_lab', value: 7 },

  // Uncommon (6)
  { id: 'bioluminescence_vial', name: 'Bioluminescence Vial', description: 'A sealed vial containing a culture of bioluminescent dinoflagellates that glow blue-green when disturbed. Used in light-based research and bio-imaging.', rarity: 'uncommon', source: 'biolum_cavern_lab', value: 30 },
  { id: 'deep_water_extract', name: 'Deep Water Extract', description: 'A concentrated extract of deep ocean water rich in minerals and trace elements not found in surface waters. Enhances coral growth in laboratory cultures.', rarity: 'uncommon', source: 'deep_grotto_lab', value: 35 },
  { id: 'coral_spawn_sample', name: 'Coral Spawn Sample', description: 'A carefully collected sample of coral eggs and sperm bundles gathered during a mass spawning event. Essential for coral reproduction research and assisted fertilization.', rarity: 'uncommon', source: 'mid_reef_station', value: 40 },
  { id: 'sponge_tissue_slice', name: 'Sponge Tissue Slice', description: 'A thin slice of marine sponge tissue containing symbiotic bacteria that produce powerful antibiotics. Medical researchers prize these compounds for drug development.', rarity: 'uncommon', source: 'mid_reef_station', value: 28 },
  { id: 'vent_mineral_crystal', name: 'Vent Mineral Crystal', description: 'A crystalline mineral formation collected from a hydrothermal vent chimney. Contains rare earth elements and novel compounds formed under extreme heat and pressure.', rarity: 'uncommon', source: 'hydrothermal_outpost', value: 45 },
  { id: 'sediment_core_sample', name: 'Sediment Core Sample', description: 'A cylindrical core of ocean floor sediment preserving layers of geological history. Each layer contains microfossils, chemical signatures, and climate data from different eras.', rarity: 'uncommon', source: 'deep_grotto_lab', value: 32 },

  // Rare (6)
  { id: 'ancient_coral_core', name: 'Ancient Coral Core', description: 'A core sample drilled from a thousand-year-old massive coral. Its growth rings preserve a detailed annual record of ocean temperature, salinity, and storm frequency spanning centuries.', rarity: 'rare', source: 'deep_grotto_lab', value: 130 },
  { id: 'glowing_polyp_cluster', name: 'Glowing Polyp Cluster', description: 'A living cluster of deep-water coral polyps that produce sustained bioluminescence without any external stimulus. The biochemical pathway of this light production remains poorly understood.', rarity: 'rare', source: 'biolum_cavern_lab', value: 150 },
  { id: 'abyssal_sediment_slab', name: 'Abyssal Sediment Slab', description: 'A thick slab of sediment from the abyssal plain containing fossils of extinct deep-sea organisms and chemical evidence of ancient ocean circulation patterns.', rarity: 'rare', source: 'abyssal_research_hub', value: 140 },
  { id: 'thermal_vent_biofilm', name: 'Thermal Vent Biofilm', description: 'A biofilm sample from the surface of a black smoker chimney containing thermophilic archaea that thrive at temperatures above 100 degrees Celsius.', rarity: 'rare', source: 'hydrothermal_outpost', value: 160 },
  { id: 'rare_zooxanthellae_strain', name: 'Rare Zooxanthellae Strain', description: 'A genetically distinct strain of symbiotic algae found only in deep-water corals. This strain can photosynthesize at extremely low light levels, potentially useful for coral conservation.', rarity: 'rare', source: 'coral_garden_observatory', value: 135 },
  { id: 'pearl_essence_extract', name: 'Pearl Essence Extract', description: 'A concentrated extract of the organic compound that gives pearls their iridescence. Marine biology researchers use it to study biomineralization processes.', rarity: 'rare', source: 'mid_reef_station', value: 120 },

  // Epic (6)
  { id: 'living_fossil_coral', name: 'Living Fossil Coral', description: 'A specimen of a coral species thought to be extinct for 50 million years, found alive in a deep-sea trench. Its DNA contains genetic sequences from before the last great extinction.', rarity: 'epic', source: 'midnight_abyss_lab', value: 500 },
  { id: 'primordial_soup_sample', name: 'Primordial Soup Sample', description: 'A sample of organic-rich fluid from a deep hydrothermal vent that closely replicates the conditions believed to have given rise to the first life on Earth.', rarity: 'epic', source: 'hydrothermal_outpost', value: 550 },
  { id: 'quantum_bioluminescence', name: 'Quantum Bioluminescence Sample', description: 'A bioluminescent organism that produces light through a quantum mechanical process rather than conventional chemical reactions. This challenges fundamental assumptions about biological energy transfer.', rarity: 'epic', source: 'midnight_abyss_lab', value: 600 },
  { id: 'genome_complete_coral', name: 'Complete Coral Genome Sample', description: 'A perfectly preserved tissue sample containing the complete genome of an ancient coral species. Sequencing it would reveal the evolutionary history of all modern reef-building corals.', rarity: 'epic', source: 'coral_garden_observatory', value: 520 },
  { id: 'deep_ocean_water_core', name: 'Deep Ocean Water Core', description: 'A pristine sample of water from the deepest part of the ocean that has been isolated for thousands of years. It contains dissolved gases and minerals from the Earth\'s mantle.', rarity: 'epic', source: 'midnight_abyss_lab', value: 480 },
  { id: 'coral_neural_tissue', name: 'Coral Neural Tissue Sample', description: 'Tissue from a brain coral that exhibits organized electrical signaling patterns. This suggests corals may possess a form of distributed intelligence far more complex than previously imagined.', rarity: 'epic', source: 'biolum_cavern_lab', value: 570 },

  // Legendary (6)
  { id: 'genesis_coral_spore', name: 'Genesis Coral Spore', description: 'A theoretical "first coral" spore preserved in amber-like resin within an ancient reef formation. If successfully cultured, it could produce a coral species with unparalleled resilience to climate change.', rarity: 'legendary', source: 'midnight_abyss_lab', value: 5000 },
  { id: 'world_reef_heartstone', name: 'World Reef Heartstone', description: 'A massive crystalline formation at the geometric center of the Great Barrier Reef that pulses with a rhythmic energy matching the tidal cycle. Its origin and purpose are unknown.', rarity: 'legendary', source: 'coral_garden_observatory', value: 6000 },
  { id: 'abyssal_origin_organism', name: 'Abyssal Origin Organism', description: 'A living organism recovered from the deepest ocean trench that does not match any known branch of the tree of life. It may represent an entirely separate evolutionary lineage.', rarity: 'legendary', source: 'midnight_abyss_lab', value: 5500 },
  { id: 'coral_consciousness_matrix', name: 'Coral Consciousness Matrix', description: 'A network of interconnected coral colonies that appear to share information through chemical and electrical signals across distances of several kilometers, suggesting a form of collective intelligence.', rarity: 'legendary', source: 'coral_garden_observatory', value: 7000 },
  { id: 'primordial_ocean_sample', name: 'Primordial Ocean Sample', description: 'A sealed pocket of seawater trapped in a mineral formation 3.5 billion years old. Analysis reveals it contains the exact chemical composition of Earth\'s primordial ocean.', rarity: 'legendary', source: 'midnight_abyss_lab', value: 6500 },
  { id: 'eternal_coral_seed', name: 'Eternal Coral Seed', description: 'A seed-like structure produced by the World Brain Nexus coral that, when planted, begins growing into a new reef at an accelerated rate. It is believed to be the mechanism by which coral reefs first colonized Earth\'s oceans.', rarity: 'legendary', source: 'coral_garden_observatory', value: 8000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: CO_EQUIPMENT — 25 Lab Equipment (upgradeable to level 10)
// ═══════════════════════════════════════════════════════════════════

export const CO_EQUIPMENT: readonly COEquipmentDef[] = [
  // Observation (5)
  { id: 'microscope_basic', name: 'Basic Underwater Microscope', description: 'A waterproof microscope for examining coral polyps, tissue samples, and microorganisms in their natural aquatic environment. Essential for species identification.', baseCost: 100, costMultiplier: 1.5, category: 'Observation' },
  { id: 'sonar_scanner', name: 'Sonar Scanner Array', description: 'A high-frequency sonar system that maps reef structures in three dimensions, revealing hidden caves, overhangs, and coral formations invisible to divers.', baseCost: 400, costMultiplier: 1.6, category: 'Observation' },
  { id: 'deep_dive_suit', name: 'Deep Dive Research Suit', description: 'A reinforced diving suit rated for depths up to 200 meters with built-in communications, heating, and a heads-up display showing real-time water chemistry data.', baseCost: 1200, costMultiplier: 1.7, category: 'Observation' },
  { id: 'spectral_analyzer', name: 'Spectral Coral Analyzer', description: 'An advanced device that uses spectrometry to analyze coral pigments, symbiotic algae composition, and tissue health without physical contact.', baseCost: 3000, costMultiplier: 1.8, category: 'Observation' },
  { id: 'biolum_detector', name: 'Bioluminescence Detector', description: 'An ultra-sensitive photon detector that can identify and classify bioluminescent organisms from up to 100 meters away in complete darkness.', baseCost: 8000, costMultiplier: 2.0, category: 'Observation' },

  // Collection (5)
  { id: 'sample_extractor', name: 'Precision Sample Extractor', description: 'A robotic arm attachment for collecting tiny coral and tissue samples with minimal damage to the host organism. Essential for non-destructive research.', baseCost: 80, costMultiplier: 1.4, category: 'Collection' },
  { id: 'plankton_trawl', name: 'Micro-Plankton Trawl Net', description: 'A fine-mesh trawl system for collecting plankton, larvae, and microorganisms from the water column. Captures specimens as small as 50 micrometers.', baseCost: 300, costMultiplier: 1.5, category: 'Collection' },
  { id: 'sediment_corer', name: 'Sediment Core Drill', description: 'A specialized drill that extracts cylindrical cores from the ocean floor, preserving layered sediment structures that record geological and climate history.', baseCost: 800, costMultiplier: 1.6, category: 'Collection' },
  { id: 'culture_chamber', name: 'Coral Culture Chamber', description: 'A climate-controlled chamber for growing and studying coral fragments in controlled conditions. Maintains precise temperature, salinity, and light parameters.', baseCost: 2000, costMultiplier: 1.7, category: 'Collection' },
  { id: 'gene_sequencer', name: 'Portable Gene Sequencer', description: 'A compact DNA sequencing device that can decode coral genomes directly from tissue samples in the field, providing immediate taxonomic and evolutionary data.', baseCost: 5000, costMultiplier: 1.8, category: 'Collection' },

  // Analysis (5)
  { id: 'water_quality_probe', name: 'Water Quality Probe', description: 'A multi-sensor probe that measures temperature, salinity, pH, dissolved oxygen, turbidity, and nutrient levels in real time across multiple depth zones.', baseCost: 120, costMultiplier: 1.4, category: 'Analysis' },
  { id: 'chemical_tester', name: 'Marine Chemical Tester', description: 'An automated chemical analysis station that performs tests on seawater and tissue samples for heavy metals, pesticides, microplastics, and organic pollutants.', baseCost: 500, costMultiplier: 1.5, category: 'Analysis' },
  { id: 'thermal_imager', name: 'Thermal Reef Imager', description: 'An infrared imaging system that creates heat maps of the reef, identifying thermal stress zones and areas at risk of coral bleaching before visible symptoms appear.', baseCost: 1500, costMultiplier: 1.6, category: 'Analysis' },
  { id: 'acoustic_monitor', name: 'Acoustic Reef Monitor', description: 'An underwater microphone array that records and analyzes the soundscape of the reef. A healthy reef produces a characteristic symphony of snaps, clicks, and pops.', baseCost: 700, costMultiplier: 1.5, category: 'Analysis' },
  { id: 'pollution_scrubber', name: 'Pollution Analysis Scrubber', description: 'A filtration device that captures and concentrates waterborne pollutants for detailed laboratory analysis. Can process 100 liters of seawater per hour.', baseCost: 4000, costMultiplier: 1.8, category: 'Analysis' },

  // Mapping (5)
  { id: 'sonar_mapping_array', name: 'Sonar Mapping Array', description: 'A multibeam echosounder that creates high-resolution bathymetric maps of the ocean floor. Essential for discovering new reef formations and charting exploration routes.', baseCost: 150, costMultiplier: 1.4, category: 'Mapping' },
  { id: 'hydrophone_array', name: 'Hydrophone Tracking Array', description: 'A network of underwater microphones used to track marine animal movements and map ocean current patterns through sound propagation analysis.', baseCost: 250, costMultiplier: 1.5, category: 'Mapping' },
  { id: 'depth_charting_unit', name: 'Depth Charting Unit', description: 'A pressure-sensing device that creates detailed depth profiles of the water column, mapping thermoclines, haloclines, and other stratification layers.', baseCost: 600, costMultiplier: 1.5, category: 'Mapping' },
  { id: 'reef_mapper_drone', name: 'Reef Mapper Drone', description: 'An autonomous underwater vehicle equipped with cameras and sonar that systematically photographs and maps reef structures over large areas without human intervention.', baseCost: 3500, costMultiplier: 1.8, category: 'Mapping' },
  { id: 'current_flow_analyzer', name: 'Current Flow Analyzer', description: 'A Doppler current profiler that maps three-dimensional water movement patterns around the reef, identifying upwelling zones, eddies, and longshore currents.', baseCost: 1000, costMultiplier: 1.6, category: 'Mapping' },

  // Utility (5)
  { id: 'data_terminal', name: 'Marine Data Terminal', description: 'A waterproof computer terminal for recording, analyzing, and transmitting research data. Includes satellite uplink for real-time collaboration with surface laboratories.', baseCost: 200, costMultiplier: 1.5, category: 'Utility' },
  { id: 'storage_vault', name: 'Specimen Storage Vault', description: 'A pressurized, temperature-controlled storage unit for preserving coral samples, tissue specimens, and collected materials at optimal conditions indefinitely.', baseCost: 800, costMultiplier: 1.6, category: 'Utility' },
  { id: 'oxygen_generator', name: 'Dive Oxygen Generator', description: 'A rebreather system that recycles exhaled breath, extending dive times from 60 minutes to over 8 hours. Essential for deep research expeditions.', baseCost: 600, costMultiplier: 1.5, category: 'Utility' },
  { id: 'emergency_beacon', name: 'Emergency Sonar Beacon', description: 'A powerful sonar beacon that can be activated in emergencies to signal the surface research vessel. Range exceeds 5 kilometers in clear water conditions.', baseCost: 1500, costMultiplier: 1.7, category: 'Utility' },
  { id: 'research_submersible', name: 'Mini Research Submersible', description: 'A two-person submersible rated for depths up to 500 meters with mechanical arms, external lights, and a panoramic acrylic observation dome for deep exploration.', baseCost: 9000, costMultiplier: 2.0, category: 'Utility' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: CO_ABILITIES — 22 Research Abilities
// ═══════════════════════════════════════════════════════════════════

export const CO_ABILITIES: readonly COAbilityDef[] = [
  // Observation (4)
  { id: 'sharp_eye_observe', name: 'Sharp Eye Observation', description: 'Enhance your visual acuity to spot rare coral species hidden among common growths. Reveals camouflaged organisms within the reef structure.', cooldown: 5, power: 25, category: 'Observe' },
  { id: 'deep_vision_scan', name: 'Deep Vision Scan', description: 'Activate a sonar pulse that penetrates the reef structure, revealing hidden caves, internal coral formations, and organisms concealed within the reef matrix.', cooldown: 15, power: 55, category: 'Observe' },
  { id: 'time_lapse_record', name: 'Time Lapse Recording', description: 'Deploy a camera that records coral growth and behavior over extended periods. Playback reveals patterns invisible to real-time observation.', cooldown: 25, power: 85, category: 'Observe' },
  { id: 'quantum_perception', name: 'Quantum Perception', description: 'Achieve a state of enhanced awareness that lets you perceive subtle biological signals from corals, sensing their health, stress levels, and communication patterns.', cooldown: 45, power: 130, category: 'Observe' },

  // Culture (4)
  { id: 'tissue_culture', name: 'Tissue Culture Propagation', description: 'Extract a tiny coral fragment and culture it into a viable colony in the laboratory. Each successful culture provides sustainable research material without harming wild populations.', cooldown: 8, power: 35, category: 'Culture' },
  { id: 'spawn_acceleration', name: 'Spawn Acceleration', description: 'Use hormonal triggers to induce coral spawning outside the natural cycle. Enables year-round reproduction research and emergency reef restoration efforts.', cooldown: 20, power: 70, category: 'Culture' },
  { id: 'genetic_strengthening', name: 'Genetic Strengthening', description: 'Apply selective breeding principles to cultured coral colonies, enhancing traits like heat tolerance, disease resistance, and growth rate over successive generations.', cooldown: 30, power: 100, category: 'Culture' },
  { id: 'reef_resurrection', name: 'Reef Resurrection Protocol', description: 'Deploy cultured coral colonies en masse to restore damaged reef sections. The most powerful ability available to coral researchers, capable of reviving dead reef zones.', cooldown: 60, power: 180, category: 'Culture' },

  // Mapping (4)
  { id: 'sonar_ping', name: 'Sonar Ping Mapping', description: 'Emit a focused sonar pulse that creates a detailed map of the immediate surroundings, revealing reef topography and potential navigation hazards within 200 meters.', cooldown: 6, power: 30, category: 'Map' },
  { id: 'drone_sweep', name: 'Drone Mapping Sweep', description: 'Deploy a fleet of mini-drones that systematically survey a large area of reef, compiling a comprehensive map of all coral formations, species, and structural features.', cooldown: 22, power: 80, category: 'Map' },
  { id: 'current_tracer', name: 'Current Tracer Deployment', description: 'Release biodegradable tracer particles into the water that map three-dimensional current patterns around the reef, identifying nutrient upwelling zones.', cooldown: 18, power: 65, category: 'Map' },
  { id: 'bathymetric_deep_scan', name: 'Bathymetric Deep Scan', description: 'Conduct a full bathymetric survey of the ocean floor beneath and around the reef, discovering new formations, trenches, and potential research sites.', cooldown: 50, power: 150, category: 'Map' },

  // Sample (4)
  { id: 'quick_sample_dip', name: 'Quick Sample Dip', description: 'Rapidly collect a surface water sample from the current location. Provides immediate data on water quality, plankton density, and dissolved minerals.', cooldown: 4, power: 20, category: 'Sample' },
  { id: 'core_extraction', name: 'Core Extraction Drill', description: 'Use a specialized drill to extract a core sample from the reef substrate, preserving geological layers that contain climate and ecological history data.', cooldown: 16, power: 60, category: 'Sample' },
  { id: 'biochemical_analysis', name: 'Biochemical Analysis', description: 'Perform a comprehensive biochemical analysis of a collected sample, identifying all compounds, organisms, and chemical signatures present.', cooldown: 28, power: 95, category: 'Sample' },
  { id: 'genome_decoding', name: 'Genome Decoding', description: 'Decode the complete genetic sequence of a coral sample in the field, revealing evolutionary relationships, adaptation genes, and potential vulnerabilities.', cooldown: 55, power: 170, category: 'Sample' },

  // Deploy (3)
  { id: 'sensor_buoy', name: 'Sensor Buoy Deployment', description: 'Deploy a permanent sensor buoy that continuously monitors water conditions at a fixed location, transmitting data to the research lab in real time.', cooldown: 10, power: 40, category: 'Deploy' },
  { id: 'camera_trap', name: 'Underwater Camera Trap', description: 'Install a motion-activated camera at a strategic reef location to document elusive species behavior, spawning events, and predator-prey interactions.', cooldown: 14, power: 50, category: 'Deploy' },
  { id: 'reef_restoration_frame', name: 'Reef Restoration Frame', description: 'Deploy an artificial reef structure designed to serve as a substrate for coral larvae settlement, accelerating the natural reef-building process in degraded areas.', cooldown: 40, power: 120, category: 'Deploy' },

  // Special (3)
  { id: 'biolum_pulse', name: 'Bioluminescence Pulse', description: 'Generate a pulse of light that mimics natural bioluminescent patterns, attracting deep-sea organisms toward observation points for study.', cooldown: 12, power: 45, category: 'Special' },
  { id: 'thermal_shield', name: 'Thermal Shield Generator', description: 'Activate a localized thermal regulation field that protects a section of reef from temperature extremes, preventing bleaching during heat wave events.', cooldown: 35, power: 110, category: 'Special' },
  { id: 'ocean_song', name: 'Ocean Song Communication', description: 'Transmit complex acoustic patterns that mimic reef sounds, attracting marine life and apparently "communicating" with coral colonies in ways not fully understood.', cooldown: 48, power: 140, category: 'Special' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: CO_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const CO_ACHIEVEMENTS: readonly COAchievementDef[] = [
  { id: 'ach_first_catalog', name: 'First Classification', description: 'Catalog your very first coral species from the Shallow Cove Lab waters.', condition: 'Catalog 1 species', reward: '+50 research points' },
  { id: 'ach_catalog_10', name: 'Reef Cartographer', description: 'Catalog a total of 10 coral species across all research labs.', condition: 'Catalog 10 species', reward: '+200 credits, uncommon material cache' },
  { id: 'ach_catalog_35', name: 'Complete Reef Compendium', description: 'Catalog all 35 unique coral species from every depth zone.', condition: 'Catalog 35 unique species', reward: '+5000 credits, legendary discovery fragment' },
  { id: 'ach_rare_catalog', name: 'Rare Find', description: 'Successfully catalog a rare-tier coral species from the deep reef.', condition: 'Catalog rare species', reward: '+300 research points' },
  { id: 'ach_epic_catalog', name: 'Epic Discovery', description: 'Successfully catalog an epic-tier coral species from abyssal depths.', condition: 'Catalog epic species', reward: '+800 research points, rare discovery' },
  { id: 'ach_legendary_catalog', name: 'Legend of the Deep', description: 'Catalog a legendary coral species — a being of mythic biological significance.', condition: 'Catalog legendary species', reward: '+3000 credits, epic discovery' },
  { id: 'ach_first_lab', name: 'Lab Pioneer', description: 'Unlock your first underwater research lab beyond the starting cove.', condition: 'Unlock 1 lab', reward: '+100 research points' },
  { id: 'ach_all_labs', name: 'Master Oceanographer', description: 'Unlock and explore all 8 underwater research laboratories.', condition: 'Unlock 8 labs', reward: '+5000 credits, Deep Explorer title' },
  { id: 'ach_material_100', name: 'Resourceful Diver', description: 'Accumulate 100 total research materials in your inventory.', condition: 'Collect 100 materials', reward: '+150 credits' },
  { id: 'ach_material_500', name: 'Hoarder of the Deep', description: 'Accumulate 500 total research materials from all depth zones.', condition: 'Collect 500 materials', reward: '+800 credits' },
  { id: 'ach_equipment_5', name: 'Lab Technician', description: 'Install and upgrade 5 different pieces of lab equipment.', condition: 'Install 5 equipment', reward: '+200 research points' },
  { id: 'ach_equipment_15', name: 'Chief Engineer', description: 'Install and upgrade 15 different pieces of lab equipment.', condition: 'Install 15 equipment', reward: '+1500 credits, Engineer title' },
  { id: 'ach_equipment_25', name: 'Fully Equipped Lab', description: 'Install all 25 pieces of lab equipment across every category.', condition: 'Install 25 equipment', reward: '+5000 credits, rare discovery' },
  { id: 'ach_first_culture', name: 'First Successful Culture', description: 'Successfully culture your first coral specimen in the laboratory.', condition: 'Culture 1 coral', reward: '+500 research points' },
  { id: 'ach_five_cultures', name: 'Coral Cultivation Expert', description: 'Successfully culture 5 coral specimens total.', condition: 'Culture 5 corals', reward: '+2000 credits' },
  { id: 'ach_first_discovery', name: 'Groundbreaking Discovery', description: 'Make your very first rare discovery in the research station.', condition: 'Make 1 discovery', reward: '+1000 research points' },
  { id: 'ach_ten_discoveries', name: 'Prolific Researcher', description: 'Accumulate 10 total discoveries across all depth zones.', condition: 'Make 10 discoveries', reward: '+3000 credits, epic material cache' },
  { id: 'ach_max_level', name: 'Ocean Archivist', description: 'Reach the maximum diver level of 50 and unlock all research capabilities.', condition: 'Reach level 50', reward: '+10000 credits, legendary discovery set' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: CO_TITLES — 8 Diver Titles (Junior Diver → Ocean Archivist)
// ═══════════════════════════════════════════════════════════════════

export const CO_TITLES: readonly COTitleDef[] = [
  { id: 'title_junior_diver', name: 'Junior Diver', description: 'A novice ocean explorer taking their first steps into the underwater world of coral research. The vast reef stretches before them, full of wonder and mystery.', requiredLevel: 1, requiredLabs: 1 },
  { id: 'title_reef_apprentice', name: 'Reef Apprentice', description: 'A dedicated student of marine biology who has learned to identify common coral species and operate basic research equipment in shallow waters.', requiredLevel: 5, requiredLabs: 2 },
  { id: 'title_deep_explorer', name: 'Deep Explorer', description: 'An experienced diver capable of navigating mid-depth reefs and operating advanced equipment. The transition from sunlit shallows to blue twilight marks a true milestone.', requiredLevel: 12, requiredLabs: 3 },
  { id: 'title_coral_specialist', name: 'Coral Specialist', description: 'A marine biologist with expertise in coral taxonomy, ecology, and conservation. Their research contributes to the global understanding of reef ecosystems.', requiredLevel: 18, requiredLabs: 4 },
  { id: 'title_abyssal_researcher', name: 'Abyssal Researcher', description: 'A scientist who ventures into the deepest ocean trenches to study organisms that exist in perpetual darkness under crushing pressures.', requiredLevel: 25, requiredLabs: 5 },
  { id: 'title_marine_professor', name: 'Marine Professor', description: 'An accomplished academic whose published research has advanced the field of marine biology. Students and colleagues seek their expertise on all matters of ocean science.', requiredLevel: 33, requiredLabs: 6 },
  { id: 'title_ocean_sage', name: 'Ocean Sage', description: 'A legendary figure whose decades of underwater research have revealed secrets of the deep that most scientists can only dream of discovering.', requiredLevel: 42, requiredLabs: 7 },
  { id: 'title_ocean_archivist', name: 'Ocean Archivist', description: 'The ultimate title — one who has cataloged every coral species, explored every depth zone, and compiled the definitive record of ocean life for future generations.', requiredLevel: 50, requiredLabs: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: CO_DISCOVERIES — 15 Rare Discoveries
// ═══════════════════════════════════════════════════════════════════

export const CO_DISCOVERIES: readonly CODiscoveryDef[] = [
  { id: 'disc_phosphorescent_polyps', name: 'Phosphorescent Polyp Colony', description: 'A colony of polyps that emit steady green phosphorescence visible from 50 meters away. Their light provides a natural beacon for nocturnal reef navigation.', rarity: 'common', researchBonus: 8, specialAbility: 'Green glow beacon' },
  { id: 'disc_singing_reef', name: 'Singing Reef Formation', description: 'A section of reef that produces harmonic tones when ocean currents pass through its porous structure. The "song" changes with the tides and has a calming effect on nearby marine life.', rarity: 'common', researchBonus: 10, specialAbility: 'Tidal harmonic tones' },
  { id: 'disc_rainbow_coral_grove', name: 'Rainbow Coral Grove', description: 'A dense grove of corals in every color of the spectrum, each species containing a unique pigment that is not found in any other reef system on Earth.', rarity: 'common', researchBonus: 12, specialAbility: 'Full spectrum pigments' },
  { id: 'disc_crystal_cave_reef', name: 'Crystal Cave Reef System', description: 'A reef growing entirely inside a submerged crystal cave. The coral polyps have incorporated crystalline structures into their skeletons, creating living gemstones.', rarity: 'uncommon', researchBonus: 18, specialAbility: 'Biocrystalline integration' },
  { id: 'disc_fossil_reef_layers', name: 'Ancient Fossil Reef Layers', description: 'Exposed cross-sections of fossilized reef dating back 200 million years, preserving organisms from the age of dinosaurs in perfect three-dimensional detail.', rarity: 'uncommon', researchBonus: 22, specialAbility: 'Paleontological data mine' },
  { id: 'disc_symbiotic_web', name: 'Perfect Symbiotic Web', description: 'A section of reef where six different species have formed a perfect mutualistic network, each providing exactly what the others need with zero waste.', rarity: 'uncommon', researchBonus: 25, specialAbility: 'Symbiosis blueprint' },
  { id: 'disc_magnetic_reef', name: 'Magnetic Coral Formation', description: 'A coral colony that has accumulated enough iron in its skeleton to generate a detectable magnetic field. Diving compasses are disrupted within 10 meters of it.', rarity: 'uncommon', researchBonus: 28, specialAbility: 'Biological magnetism' },
  { id: 'disc_underwater_library', name: 'Underwater Geological Library', description: 'A series of rock formations containing perfectly preserved chemical records of every major ocean event for the past 500 million years, readable like pages in a book.', rarity: 'rare', researchBonus: 45, specialAbility: 'Historical climate archive' },
  { id: 'disc_invisible_coral', name: 'Invisible Coral Species', description: 'A coral species with a refractive index identical to seawater, making it effectively invisible. It was discovered only when a researcher accidentally bumped into it.', rarity: 'rare', researchBonus: 50, specialAbility: 'Optical invisibility' },
  { id: 'disc_coral_code', name: 'Coral Communication Code', description: 'Evidence of structured chemical communication between different coral colonies, suggesting a language-like system of information exchange across the reef.', rarity: 'rare', researchBonus: 55, specialAbility: 'Cross-colony communication' },
  { id: 'disc_time_capsule_reef', name: 'Time Capsule Reef', description: 'A reef preserved in anoxic conditions inside an underwater cave, keeping 10,000-year-old corals alive in a state of suspended animation.', rarity: 'rare', researchBonus: 60, specialAbility: 'Ancient living corals' },
  { id: 'disc_quantum_reef', name: 'Quantum Coral Phenomenon', description: 'A coral formation that appears to exist in two states simultaneously, observable only through specialized quantum measurement techniques. Defies conventional biology.', rarity: 'epic', researchBonus: 90, specialAbility: 'Quantum biological state' },
  { id: 'disc_origin_pool', name: 'Pool of Origins', description: 'A warm, mineral-rich pool on the ocean floor where new coral species are spontaneously appearing. Scientists believe it replicates the exact conditions of the first coral evolution.', rarity: 'epic', researchBonus: 100, specialAbility: 'De novo coral evolution' },
  { id: 'disc_conscious_reef', name: 'Conscious Reef Network', description: 'A network spanning 4 square kilometers where corals appear to exhibit coordinated behavior, responding to stimuli as a unified organism rather than individual colonies.', rarity: 'epic', researchBonus: 110, specialAbility: 'Distributed coral intelligence' },
  { id: 'disc_world_seed', name: 'World Coral Seed', description: 'A single massive coral formation that genetic analysis reveals is the common ancestor of every reef-building coral species alive today. The mother of all reefs.', rarity: 'legendary', researchBonus: 200, specialAbility: 'Universal coral ancestor' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: CO_TIDAL_EVENTS — 12 Tidal Events
// ═══════════════════════════════════════════════════════════════════

export const CO_TIDAL_EVENTS: readonly COTidalEventDef[] = [
  {
    id: 'event_spring_tide',
    name: 'Spring Tide Surge',
    description: 'An exceptionally high spring tide exposes new reef sections that are normally submerged, granting temporary access to rare shallow-water coral colonies.',
    severity: 1,
    duration: 60,
    effects: ['New reef sections accessible', 'Shallow coral discovery rate +50%', 'Equipment durability unaffected'],
  },
  {
    id: 'event_coral_bleaching',
    name: 'Coral Bleaching Event',
    description: 'Rising water temperatures trigger a mass coral bleaching event, stressing corals across all depth zones and reducing research output.',
    severity: 4,
    duration: 90,
    effects: ['Reef health decreases rapidly', 'Research value reduced by 30%', 'Rare species may become temporarily unavailable'],
  },
  {
    id: 'event_mass_spawning',
    name: 'Mass Coral Spawning',
    description: 'A synchronized mass spawning event floods the water with coral eggs and sperm bundles, creating an extraordinary opportunity for reproduction research and culture collection.',
    severity: 1,
    duration: 120,
    effects: ['Coral spawn samples abundant', 'Culture success rate doubled', 'New coral species may appear'],
  },
  {
    id: 'event_pollution_plume',
    name: 'Pollution Plume Arrival',
    description: 'A plume of agricultural runoff and microplastics reaches the reef, degrading water quality and threatening coral health across all research zones.',
    severity: 4,
    duration: 80,
    effects: ['Water quality degraded', 'Coral health declining', 'Pollution-sensitive species retreat'],
  },
  {
    id: 'event_upwelling_nutrients',
    name: 'Deep Upwelling Event',
    description: 'A strong deep-water upwelling brings cold, nutrient-rich water to the reef surface, triggering a plankton bloom that feeds corals and boosts their growth rates.',
    severity: 1,
    duration: 100,
    effects: ['Nutrient levels doubled', 'Coral growth rate +60%', 'Material collection yield +75%'],
  },
  {
    id: 'event_storm_surge',
    name: 'Tropical Storm Surge',
    description: 'A powerful tropical storm generates massive waves and strong currents that damage reef structures, displace equipment, and disrupt research operations.',
    severity: 3,
    duration: 50,
    effects: ['Equipment may be damaged', 'Reef structures broken', 'Research temporarily suspended in affected zones'],
  },
  {
    id: 'event_biolum_bloom',
    name: 'Bioluminescent Bloom',
    description: 'A massive bloom of bioluminescent organisms transforms the entire reef into a glowing wonderland, creating unprecedented opportunities for bioluminescence research.',
    severity: 1,
    duration: 110,
    effects: ['Bioluminescent materials abundant', 'Night observation bonus +100%', 'Rare glowing species appear'],
  },
  {
    id: 'event_red_tide',
    name: 'Red Tide Outbreak',
    description: 'A toxic algal bloom discolors the water red and produces toxins harmful to marine life, forcing coral polyps to retract and halting feeding.',
    severity: 3,
    duration: 70,
    effects: ['Water toxicity increased', 'Coral polyps retracted', 'Research output reduced by 40%'],
  },
  {
    id: 'event_el_nino_warming',
    name: 'El Nino Warming Phase',
    description: 'An El Nino event raises ocean temperatures across the region, stressing heat-sensitive corals while creating conditions favorable for warm-water species migration.',
    severity: 3,
    duration: 90,
    effects: ['Temperature above normal range', 'Cool-water species stressed', 'Warm-water species discoveries possible'],
  },
  {
    id: 'event_deep_current_shift',
    name: 'Deep Current Shift',
    description: 'A major shift in deep ocean currents brings water from previously unexplored regions, carrying with it undiscovered organisms and novel chemical compounds.',
    severity: 2,
    duration: 80,
    effects: ['New species encounters possible', 'Novel materials available', 'Deep lab research bonus +50%'],
  },
  {
    id: 'event_moon_jelly_migration',
    name: 'Moon Jellyfish Migration',
    description: 'Millions of moon jellyfish migrate through the reef in a spectacular display. While harmless, their sheer numbers temporarily cloud the water and interfere with equipment.',
    severity: 2,
    duration: 60,
    effects: ['Visibility reduced', 'Sensor readings disrupted', 'Jellyfish tissue samples abundant'],
  },
  {
    id: 'event_tsunami_warning',
    name: 'Tsunami Warning',
    description: 'Seismic activity triggers a tsunami warning. Research operations must be suspended immediately as massive underwater pressure waves approach the reef.',
    severity: 5,
    duration: 40,
    effects: ['All operations suspended', 'Structures may be destroyed', 'Emergency evacuation initiated'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: CORAL TYPE INTERACTIONS & CULTURE DATA
// ═══════════════════════════════════════════════════════════════════

interface COTypeInteraction {
  primary: COCoralType
  secondary: COCoralType
  synergyMultiplier: number
  description: string
}

const CO_TYPE_INTERACTIONS: COTypeInteraction[] = [
  { primary: 'Brain Coral', secondary: 'Sea Fan', synergyMultiplier: 1.5, description: 'Brain coral provides stable substrate for sea fan attachment, enhancing filter feeding efficiency.' },
  { primary: 'Staghorn', secondary: 'Plate', synergyMultiplier: 1.4, description: 'Staghorn branches create sheltered zones where plate corals can grow without wave damage.' },
  { primary: 'Pillar', secondary: 'Tube', synergyMultiplier: 1.6, description: 'Pillar corals redirect currents toward tube coral colonies, increasing their food supply.' },
  { primary: 'Sea Fan', secondary: 'Tube', synergyMultiplier: 1.3, description: 'Sea fan filtration clears the water column, improving light penetration for adjacent tube corals.' },
  { primary: 'Fire Coral', secondary: 'Pillar', synergyMultiplier: 1.7, description: 'Fire coral defense perimeter protects pillar corals from predation by coral-eating fish.' },
  { primary: 'Plate', secondary: 'Brain Coral', synergyMultiplier: 1.2, description: 'Plate coral canopy provides shade that benefits shade-adapted brain coral species.' },
  { primary: 'Staghorn', secondary: 'Sea Fan', synergyMultiplier: 1.1, description: 'Staghorn thickets reduce wave energy, allowing delicate sea fans to thrive in otherwise turbulent zones.' },
  { primary: 'Tube', secondary: 'Fire Coral', synergyMultiplier: 1.5, description: 'Tube corals channel nutrient-rich water toward fire coral colonies, boosting their growth.' },
  { primary: 'Brain Coral', secondary: 'Pillar', synergyMultiplier: 1.3, description: 'Brain coral chemical signals may coordinate growth patterns with nearby pillar coral colonies.' },
  { primary: 'Plate', secondary: 'Sea Fan', synergyMultiplier: 1.4, description: 'Plate coral platforms create elevated positions for sea fans, maximizing their exposure to passing currents.' },
]

interface COCultureTier {
  tier: number
  name: string
  requiredCultures: number
  growthMultiplier: number
  healthMultiplier: number
  visualEffect: string
}

const CO_CULTURE_TIERS: COCultureTier[] = [
  { tier: 0, name: 'Wild Specimen', requiredCultures: 0, growthMultiplier: 1.0, healthMultiplier: 1.0, visualEffect: 'Standard coral appearance in its natural reef environment.' },
  { tier: 1, name: 'Lab Adapted', requiredCultures: 1, growthMultiplier: 1.3, healthMultiplier: 1.2, visualEffect: 'Coral shows slight color enhancement from optimized lab lighting conditions.' },
  { tier: 2, name: 'Stable Culture', requiredCultures: 2, growthMultiplier: 1.7, healthMultiplier: 1.5, visualEffect: 'Coral polyps are larger and more extended than wild counterparts, indicating excellent health.' },
  { tier: 3, name: 'Enhanced Strain', requiredCultures: 3, growthMultiplier: 2.2, healthMultiplier: 1.8, visualEffect: 'Coral exhibits vibrant coloration and rapid polyp extension. Visible improvement over wild specimens.' },
  { tier: 4, name: 'Super Culture', requiredCultures: 4, growthMultiplier: 2.8, healthMultiplier: 2.2, visualEffect: 'Coral colony is noticeably larger and healthier than any wild specimen. A true laboratory success.' },
  { tier: 5, name: 'Perfect Specimen', requiredCultures: 5, growthMultiplier: 3.5, healthMultiplier: 3.0, visualEffect: 'The coral is a masterpiece of aquaculture — perfect form, vibrant colors, and extraordinary vitality.' },
]

interface COLabMaterialMap {
  labId: string
  materialIds: string[]
  bonusMaterialIds: string[]
}

const CO_LAB_MATERIAL_MAP: COLabMaterialMap[] = [
  { labId: 'shallow_cove_lab', materialIds: ['sea_water_sample', 'coral_fragment', 'sand_grain_sample', 'algae_scrape', 'shell_fragment', 'brine_shrimp_jar'], bonusMaterialIds: ['bioluminescence_vial'] },
  { labId: 'mid_reef_station', materialIds: ['algae_scrape', 'coral_spawn_sample', 'sponge_tissue_slice', 'bioluminescence_vial', 'pearl_essence_extract'], bonusMaterialIds: ['deep_water_extract'] },
  { labId: 'deep_grotto_lab', materialIds: ['deep_water_extract', 'sediment_core_sample', 'ancient_coral_core', 'glowing_polyp_cluster'], bonusMaterialIds: ['coral_spawn_sample'] },
  { labId: 'abyssal_research_hub', materialIds: ['glowing_polyp_cluster', 'abyssal_sediment_slab', 'rare_zooxanthellae_strain', 'genome_complete_coral', 'coral_neural_tissue'], bonusMaterialIds: ['living_fossil_coral'] },
  { labId: 'biolum_cavern_lab', materialIds: ['bioluminescence_vial', 'glowing_polyp_cluster', 'coral_neural_tissue', 'quantum_bioluminescence'], bonusMaterialIds: ['deep_water_extract'] },
  { labId: 'hydrothermal_outpost', materialIds: ['vent_mineral_crystal', 'thermal_vent_biofilm', 'primordial_soup_sample', 'deep_ocean_water_core'], bonusMaterialIds: ['coral_spawn_sample'] },
  { labId: 'coral_garden_observatory', materialIds: ['rare_zooxanthellae_strain', 'genome_complete_coral', 'world_reef_heartstone', 'coral_consciousness_matrix', 'eternal_coral_seed'], bonusMaterialIds: [] },
  { labId: 'midnight_abyss_lab', materialIds: ['living_fossil_coral', 'primordial_soup_sample', 'quantum_bioluminescence', 'deep_ocean_water_core', 'genesis_coral_spore', 'abyssal_origin_organism', 'primordial_ocean_sample'], bonusMaterialIds: [] },
]

function coGetTypeInteraction(primary: COCoralType, secondary: COCoralType): COTypeInteraction | null {
  return CO_TYPE_INTERACTIONS.find(
    (i) => i.primary === primary && i.secondary === secondary
  ) ?? null
}

function coGetCultureTier(cultureCount: number): COCultureTier {
  for (let i = CO_CULTURE_TIERS.length - 1; i >= 0; i--) {
    if (cultureCount >= CO_CULTURE_TIERS[i].requiredCultures) {
      return CO_CULTURE_TIERS[i]
    }
  }
  return CO_CULTURE_TIERS[0]
}

function coGetLabMaterials(labId: string): COLabMaterialMap | null {
  return CO_LAB_MATERIAL_MAP.find((m) => m.labId === labId) ?? null
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const useCOStore = create<COFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      catalogedSpecies: [] as COCatalogedSpecies[],
      collectedMaterials: {} as Record<string, number>,
      equipment: [] as COOwnedEquipment[],
      achievements: [] as string[],
      currentTitle: 'title_junior_diver',
      madeDiscoveries: [] as string[],
      unlockedLabs: ['shallow_cove_lab'] as string[],
      diverLevel: 1,
      diverExp: 0,
      credits: CO_INITIAL_CREDITS,
      researchPoints: CO_INITIAL_RESEARCH,
      totalCataloged: 0,
      totalUpgraded: 0,
      totalCultured: 0,
      totalSensors: 0,
      totalSamples: 0,
      activeEventId: null as string | null,
      eventTimer: 0,
      reef: {
        health: 100,
        maxHealth: 100,
        pollution: 0,
        lastAnalyzedAt: null,
      } as COReefState,
      activeLabId: 'shallow_cove_lab' as string | null,

      // ── coExploreReef ──────────────────────────────────────────
      coExploreReef: (speciesId: string): boolean => {
        const state = get()
        const speciesDef = CO_SPECIES.find((s) => s.id === speciesId)
        if (!speciesDef) return false

        const lab = CO_LABS.find((l) => l.id === state.activeLabId)
        if (!lab) return false
        if (state.diverLevel < lab.minDepth) return false

        const cost = Math.floor(8 * coRarityMultiplier(speciesDef.rarity))
        if (state.researchPoints < cost) return false

        const newXp = state.diverExp + Math.floor(speciesDef.baseResearchValue * 0.3)
        const newLevel = coLevelFromXp(newXp)

        set((prev) => ({
          researchPoints: Math.max(0, prev.researchPoints - cost),
          diverExp: newXp,
          diverLevel: newLevel,
          credits: prev.credits + Math.floor(speciesDef.baseResearchValue * 0.2),
        }))
        return true
      },

      // ── coCatalogSpecies ────────────────────────────────────────
      coCatalogSpecies: (speciesId: string): boolean => {
        const state = get()
        const speciesDef = CO_SPECIES.find((s) => s.id === speciesId)
        if (!speciesDef) return false
        if (state.catalogedSpecies.some((s) => s.speciesDefId === speciesId)) return false

        const lab = CO_LABS.find((l) => l.id === state.activeLabId)
        if (!lab) return false
        if (state.diverLevel < lab.minDepth) return false

        const catalogCost = Math.floor(15 * coRarityMultiplier(speciesDef.rarity))
        if (state.researchPoints < catalogCost) return false

        const newXp = state.diverExp + speciesDef.baseResearchValue
        const newLevel = coLevelFromXp(newXp)

        set((prev) => ({
          catalogedSpecies: [
            ...prev.catalogedSpecies,
            {
              id: coGenerateId(),
              speciesDefId: speciesId,
              name: speciesDef.name,
              level: 1,
              health: speciesDef.baseResearchValue * 10,
              maxHealth: speciesDef.baseResearchValue * 10,
              researchValue: speciesDef.baseResearchValue,
              cultured: false,
              cultureCount: 0,
              discoveredAt: Date.now(),
            },
          ],
          researchPoints: Math.max(0, prev.researchPoints - catalogCost),
          diverExp: newXp,
          diverLevel: newLevel,
          credits: prev.credits + Math.floor(speciesDef.baseResearchValue * 0.5),
          totalCataloged: prev.totalCataloged + 1,
        }))
        return true
      },

      // ── coUpgradeLab ───────────────────────────────────────────
      coUpgradeLab: (equipmentId: string): boolean => {
        const state = get()
        const equipDef = CO_EQUIPMENT.find((e) => e.id === equipmentId)
        if (!equipDef) return false

        const owned = state.equipment.find((e) => e.equipmentDefId === equipmentId)
        if (!owned) {
          if (state.credits < equipDef.baseCost) return false
          const newXp = state.diverExp + 20
          const newLevel = coLevelFromXp(newXp)
          set((prev) => ({
            equipment: [
              ...prev.equipment,
              {
                id: coGenerateId(),
                equipmentDefId: equipmentId,
                level: 1,
                installed: true,
              },
            ],
            credits: prev.credits - equipDef.baseCost,
            diverExp: newXp,
            diverLevel: newLevel,
            totalUpgraded: prev.totalUpgraded + 1,
          }))
          return true
        }

        if (owned.level >= 10) return false
        const upgradeCost = Math.floor(equipDef.baseCost * Math.pow(equipDef.costMultiplier, owned.level))
        if (state.credits < upgradeCost) return false

        const newXp = state.diverExp + 25
        const newLevel = coLevelFromXp(newXp)
        set((prev) => ({
          equipment: prev.equipment.map((e) =>
            e.id === owned.id ? { ...e, level: e.level + 1 } : e
          ),
          credits: prev.credits - upgradeCost,
          diverExp: newXp,
          diverLevel: newLevel,
          totalUpgraded: prev.totalUpgraded + 1,
        }))
        return true
      },

      // ── coUseAbility ───────────────────────────────────────────
      coUseAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = CO_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (state.researchPoints < ability.cooldown) return false

        set((prev) => ({
          researchPoints: Math.max(0, prev.researchPoints - ability.cooldown),
          credits: prev.credits + ability.power,
        }))
        return true
      },

      // ── coHandleTidalEvent ─────────────────────────────────────
      coHandleTidalEvent: (eventId: string): boolean => {
        const state = get()
        const event = CO_TIDAL_EVENTS.find((e) => e.id === eventId)
        if (!event) return false
        if (state.activeEventId !== null) return false

        set((prev) => ({
          activeEventId: eventId,
          eventTimer: event.duration,
          reef: {
            ...prev.reef,
            pollution: event.severity >= 4
              ? Math.min(100, prev.reef.pollution + event.severity * 5)
              : prev.reef.pollution,
            health: event.severity >= 3
              ? Math.max(0, prev.reef.health - event.severity * 3)
              : prev.reef.health,
          },
        }))
        return true
      },

      // ── coMakeDiscovery ────────────────────────────────────────
      coMakeDiscovery: (discoveryId: string): boolean => {
        const state = get()
        const discovery = CO_DISCOVERIES.find((d) => d.id === discoveryId)
        if (!discovery) return false
        if (state.madeDiscoveries.includes(discoveryId)) return false

        const discoveryCost = Math.floor(25 * coRarityMultiplier(discovery.rarity))
        if (state.researchPoints < discoveryCost) return false

        const newXp = state.diverExp + discovery.researchBonus
        const newLevel = coLevelFromXp(newXp)
        set((prev) => ({
          madeDiscoveries: [...prev.madeDiscoveries, discoveryId],
          researchPoints: Math.max(0, prev.researchPoints - discoveryCost),
          diverExp: newXp,
          diverLevel: newLevel,
          credits: prev.credits + Math.floor(discovery.researchBonus * 5),
        }))
        return true
      },

      // ── coCultureCoral ─────────────────────────────────────────
      coCultureCoral: (instanceId: string): boolean => {
        const state = get()
        const coral = state.catalogedSpecies.find((c) => c.id === instanceId)
        if (!coral) return false
        if (coral.cultureCount >= 5) return false

        const cultureCost = Math.floor(40 * Math.pow(2, coral.cultureCount))
        if (state.researchPoints < cultureCost) return false
        if (state.credits < cultureCost * 2) return false

        const newXp = state.diverExp + 30
        const newLevel = coLevelFromXp(newXp)
        set((prev) => ({
          catalogedSpecies: prev.catalogedSpecies.map((c) =>
            c.id === instanceId
              ? {
                  ...c,
                  level: c.level + 1,
                  researchValue: Math.floor(c.researchValue * 1.3),
                  maxHealth: Math.floor(c.maxHealth * 1.2),
                  health: Math.floor(c.maxHealth * 1.2),
                  cultured: true,
                  cultureCount: c.cultureCount + 1,
                }
              : c
          ),
          researchPoints: Math.max(0, prev.researchPoints - cultureCost),
          credits: prev.credits - cultureCost * 2,
          diverExp: newXp,
          diverLevel: newLevel,
          totalCultured: prev.totalCultured + 1,
        }))
        return true
      },

      // ── coDeploySensor ─────────────────────────────────────────
      coDeploySensor: (labId: string): boolean => {
        const state = get()
        const lab = CO_LABS.find((l) => l.id === labId)
        if (!lab) return false
        if (!state.unlockedLabs.includes(labId)) return false
        if (state.researchPoints < 15) return false

        const newXp = state.diverExp + 20
        const newLevel = coLevelFromXp(newXp)
        set((prev) => ({
          researchPoints: Math.max(0, prev.researchPoints - 15),
          credits: prev.credits + 50,
          diverExp: newXp,
          diverLevel: newLevel,
          totalSensors: prev.totalSensors + 1,
        }))
        return true
      },

      // ── coMapTerrain ───────────────────────────────────────────
      coMapTerrain: (labId: string): boolean => {
        const state = get()
        const lab = CO_LABS.find((l) => l.id === labId)
        if (!lab) return false
        if (!state.unlockedLabs.includes(labId)) return false
        if (state.researchPoints < 20) return false

        const newXp = state.diverExp + lab.minDepth * 3
        const newLevel = coLevelFromXp(newXp)
        set((prev) => ({
          researchPoints: Math.max(0, prev.researchPoints - 20),
          diverExp: newXp,
          diverLevel: newLevel,
          credits: prev.credits + 75,
        }))
        return true
      },

      // ── coAnalyzeSample ────────────────────────────────────────
      coAnalyzeSample: (materialId: string): number => {
        const state = get()
        const mat = CO_MATERIALS.find((m) => m.id === materialId)
        if (!mat) return 0
        if (state.researchPoints < 5) return 0

        const quantity = mat.rarity === 'common' ? 3 : mat.rarity === 'uncommon' ? 2 : 1
        set((prev) => ({
          collectedMaterials: {
            ...prev.collectedMaterials,
            [materialId]: (prev.collectedMaterials[materialId] || 0) + quantity,
          },
          researchPoints: Math.max(0, prev.researchPoints - 5),
          credits: prev.credits + mat.value * quantity,
          totalSamples: prev.totalSamples + quantity,
        }))
        return quantity
      },
    }),
    {
      name: 'coral-observatory-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: HOOK — useCoralObservatory
// ═══════════════════════════════════════════════════════════════════

export default function useCoralObservatory() {
  const store = useCOStore()

  // ── Getter: Lab Details ───────────────────────────────────────
  const coGetLabDetails = useMemo(() => {
    return CO_LABS.map((lab) => ({
      ...lab,
      unlocked: store.unlockedLabs.includes(lab.id),
      active: store.activeLabId === lab.id,
      depthMet: store.diverLevel >= lab.minDepth,
      canAfford: store.credits >= lab.unlockCost,
    }))
  }, [store])

  // ── Getter: Material Inventory ────────────────────────────────
  const coGetMaterialInventory = useMemo(() => {
    return CO_MATERIALS.map((mat) => ({
      ...mat,
      owned: store.collectedMaterials[mat.id] || 0,
      rarityColor: coRarityColor(mat.rarity),
    }))
  }, [store])

  // ── Getter: Cataloged Species ─────────────────────────────────
  const coGetCatalogedSpecies = useMemo(() => {
    return store.catalogedSpecies.map((c) => {
      const def = CO_SPECIES.find((d) => d.id === c.speciesDefId)
      return {
        ...c,
        def,
        coralTypeColor: def ? coCoralTypeColor(def.coralType) : CO_COLOR_CORAL_PINK,
        rarityColor: def ? coRarityColor(def.rarity) : '#9CA3AF',
        totalResearchValue: Math.floor(c.researchValue * (1 + c.level * 0.15) * (1 + c.cultureCount * 0.25)),
      }
    })
  }, [store])

  // ── Getter: Equipment List ────────────────────────────────────
  const coGetEquipmentList = useMemo(() => {
    return CO_EQUIPMENT.map((def) => {
      const owned = store.equipment.find((e) => e.equipmentDefId === def.id)
      const level = owned ? owned.level : 0
      return {
        ...def,
        owned: !!owned,
        level,
        upgradeCost: Math.floor(def.baseCost * Math.pow(def.costMultiplier, level)),
        maxed: level >= 10,
      }
    })
  }, [store])

  // ── Getter: Total Research Power ──────────────────────────────
  const coGetTotalPower = useMemo(() => {
    let speciesPower = 0
    for (const c of store.catalogedSpecies) {
      const def = CO_SPECIES.find((d) => d.id === c.speciesDefId)
      if (!def) continue
      const rarityMult = coRarityMultiplier(def.rarity)
      speciesPower += Math.floor(
        c.researchValue * rarityMult * (1 + c.level * 0.15) * (1 + c.cultureCount * 0.25)
      )
    }
    const equipmentPower = store.equipment.reduce(
      (sum, e) => sum + e.level * 12,
      0
    )
    const discoveryPower = store.madeDiscoveries.reduce((sum, dId) => {
      const disc = CO_DISCOVERIES.find((d) => d.id === dId)
      return sum + (disc ? disc.researchBonus : 0)
    }, 0)
    return { speciesPower, equipmentPower, discoveryPower, total: speciesPower + equipmentPower + discoveryPower }
  }, [store])

  // ── Getter: Event Status ──────────────────────────────────────
  const coGetEventStatus = useMemo(() => {
    if (!store.activeEventId) {
      return { active: false, event: null, timer: 0, severity: 0 }
    }
    const event = CO_TIDAL_EVENTS.find((e) => e.id === store.activeEventId)
    return {
      active: true,
      event: event || null,
      timer: store.eventTimer,
      severity: event ? event.severity : 0,
    }
  }, [store.activeEventId, store.eventTimer])

  // ── Getter: Active Event ──────────────────────────────────────
  const coGetActiveEvent = useMemo(() => {
    if (!store.activeEventId) return null
    return CO_TIDAL_EVENTS.find((e) => e.id === store.activeEventId) || null
  }, [store.activeEventId])

  // ── Getter: Next Title ────────────────────────────────────────
  const coGetNextTitle = useMemo(() => {
    const currentTitle = CO_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitle ? CO_TITLES.indexOf(currentTitle) : -1
    if (currentIndex >= CO_TITLES.length - 1) return null
    return CO_TITLES[currentIndex + 1]
  }, [store.currentTitle])

  // ── Getter: Rarity Summary ────────────────────────────────────
  const coGetRaritySummary = useMemo(() => {
    const summary: Record<CORarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const c of store.catalogedSpecies) {
      const def = CO_SPECIES.find((d) => d.id === c.speciesDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const dId of store.madeDiscoveries) {
      const disc = CO_DISCOVERIES.find((d) => d.id === dId)
      if (disc) {
        summary[disc.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Lab Summary ───────────────────────────────────────
  const coGetLabSummary = useMemo(() => {
    const totalLabs = CO_LABS.length
    const unlocked = store.unlockedLabs.length
    return {
      totalLabs,
      unlocked,
      percent: Math.floor((unlocked / totalLabs) * 100),
      allUnlocked: unlocked >= totalLabs,
    }
  }, [store.unlockedLabs])

  // ── Getter: Unlocked Achievements ─────────────────────────────
  const coGetUnlockedAchievements = useMemo(() => {
    const unlocked: COAchievementDef[] = []
    for (const ach of CO_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      }
    }
    return { unlocked, total: CO_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ────────────────────────────────────
  const coGetTitleProgress = useMemo(() => {
    return CO_TITLES.map((title) => ({
      ...title,
      unlocked:
        store.diverLevel >= title.requiredLevel &&
        store.unlockedLabs.length >= title.requiredLabs,
      active: store.currentTitle === title.id,
      levelMet: store.diverLevel >= title.requiredLevel,
      labMet: store.unlockedLabs.length >= title.requiredLabs,
    }))
  }, [store.currentTitle, store.diverLevel, store.unlockedLabs])

  // ── Getter: Made Discoveries Detail ───────────────────────────
  const coGetMadeDiscoveries = useMemo(() => {
    return CO_DISCOVERIES.map((disc) => ({
      ...disc,
      discovered: store.madeDiscoveries.includes(disc.id),
      rarityColor: coRarityColor(disc.rarity),
      canAfford:
        store.researchPoints >= Math.floor(25 * coRarityMultiplier(disc.rarity)) &&
        !store.madeDiscoveries.includes(disc.id),
    }))
  }, [store])

  // ── Getter: Reef Health ───────────────────────────────────────
  const coGetReefHealth = useMemo(() => {
    const { health, maxHealth, pollution, lastAnalyzedAt } = store.reef
    return {
      health,
      maxHealth,
      pollution,
      healthPercent: Math.floor((health / maxHealth) * 100),
      isPolluted: pollution > 0,
      isCritical: health < maxHealth * 0.25,
      lastAnalyzedAt,
    }
  }, [store.reef])

  // ── Getter: Species Cataloging Costs ──────────────────────────
  const coGetCatalogingCosts = useMemo(() => {
    return CO_SPECIES.filter(
      (s) => !store.catalogedSpecies.some((c) => c.speciesDefId === s.id)
    ).map((species) => ({
      ...species,
      catalogCost: Math.floor(15 * coRarityMultiplier(species.rarity)),
      canAfford:
        store.researchPoints >= Math.floor(15 * coRarityMultiplier(species.rarity)),
      coralTypeColor: coCoralTypeColor(species.coralType),
      rarityColor: coRarityColor(species.rarity),
    }))
  }, [store])

  // ── Level Progress ────────────────────────────────────────────
  const coLevelProgress = useMemo(() => {
    const current = coXpForLevel(store.diverLevel)
    return {
      level: store.diverLevel,
      currentXp: store.diverExp,
      xpToNext: current,
      maxLevel: store.diverLevel >= CO_MAX_LEVEL,
      progressPercent:
        current > 0 ? Math.min(100, Math.floor((store.diverExp / current) * 100)) : 0,
    }
  }, [store.diverLevel, store.diverExp])

  // ── Getter: Ability List ──────────────────────────────────────
  const coGetAbilityList = useMemo(() => {
    return CO_ABILITIES.map((ability) => ({
      ...ability,
      canUse: store.researchPoints >= ability.cooldown,
    }))
  }, [store.researchPoints])

  // ── Getter: Event List ────────────────────────────────────────
  const coGetEventList = useMemo(() => {
    return CO_TIDAL_EVENTS.map((event) => ({
      ...event,
      canTrigger: store.activeEventId === null,
      isActive: store.activeEventId === event.id,
    }))
  }, [store.activeEventId])

  // ── Getter: Stats Summary ─────────────────────────────────────
  const { coGetStatsSummary, coGetSpeciesCountByType } = useMemo(() => {
    const speciesCountByType: Record<COCoralType, number> = {
      'Brain Coral': 0,
      'Staghorn': 0,
      'Plate': 0,
      'Pillar': 0,
      'Sea Fan': 0,
      'Tube': 0,
      'Fire Coral': 0,
    }
    for (const c of store.catalogedSpecies) {
      const def = CO_SPECIES.find((d) => d.id === c.speciesDefId)
      if (def) {
        speciesCountByType[def.coralType] += 1
      }
    }

    const statsSummary = {
      totalSpecies: store.catalogedSpecies.length,
      totalMaterials: Object.values(store.collectedMaterials).reduce((s, v) => s + v, 0),
      totalEquipment: store.equipment.length,
      totalDiscoveries: store.madeDiscoveries.length,
      totalLabs: store.unlockedLabs.length,
      avgSpeciesLevel:
        store.catalogedSpecies.length > 0
          ? Math.floor(
              store.catalogedSpecies.reduce((s, c) => s + c.level, 0) / store.catalogedSpecies.length
            )
          : 0,
      totalCultures: store.catalogedSpecies.reduce((s, c) => s + c.cultureCount, 0),
      totalSensorsDeployed: store.totalSensors,
      totalSamplesCollected: store.totalSamples,
    }

    return { coGetStatsSummary: statsSummary, coGetSpeciesCountByType: speciesCountByType }
  }, [store])

  // ── Getter: Upgrade Costs ─────────────────────────────────────
  const coGetUpgradeCosts = useMemo(() => {
    return store.equipment.map((e) => {
      const def = CO_EQUIPMENT.find((d) => d.id === e.equipmentDefId)
      if (!def) return { ...e, nextCost: 0, maxed: e.level >= 10 }
      const nextCost = e.level >= 10 ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, e.level))
      return { ...e, def, nextCost, maxed: e.level >= 10 }
    })
  }, [store.equipment])

  // ── Getter: Discovery Bonus ───────────────────────────────────
  const coGetDiscoveryBonus = useMemo(() => {
    let totalResearchBonus = 0
    for (const dId of store.madeDiscoveries) {
      const disc = CO_DISCOVERIES.find((d) => d.id === dId)
      if (disc) {
        totalResearchBonus += disc.researchBonus
      }
    }
    return {
      totalResearchBonus,
      discoveryCount: store.madeDiscoveries.length,
      hasLegendaryDiscovery: store.madeDiscoveries.some((dId) => {
        const disc = CO_DISCOVERIES.find((d) => d.id === dId)
        return disc !== null && disc.rarity === 'legendary'
      }),
    }
  }, [store.madeDiscoveries])

  // ── Getter: Culture Tier Details ──────────────────────────────
  const coGetCultureTierDetails = useMemo(() => {
    return store.catalogedSpecies.map((c) => {
      const def = CO_SPECIES.find((d) => d.id === c.speciesDefId)
      const cultureTier = coGetCultureTier(c.cultureCount)
      return {
        ...c,
        def,
        cultureTier,
        nextTier: c.cultureCount < 5 ? coGetCultureTier(c.cultureCount + 1) : null,
        canCulture: c.cultureCount < 5,
        cultureCost: Math.floor(40 * Math.pow(2, c.cultureCount)),
        cultureCreditCost: Math.floor(40 * Math.pow(2, c.cultureCount)) * 2,
      }
    })
  }, [store])

  // ── Getter: Lab Materials Available ───────────────────────────
  const coGetLabMaterials = useMemo(() => {
    if (!store.activeLabId) return { materials: [], bonusMaterials: [] }
    const lab = CO_LABS.find((l) => l.id === store.activeLabId)
    if (!lab) return { materials: [], bonusMaterials: [] }
    return { materials: [], bonusMaterials: [] }
  }, [store.activeLabId])

  // ── Getter: Research Efficiency ───────────────────────────────
  const coGetResearchEfficiency = useMemo(() => {
    const equipmentBonus = store.equipment.reduce((sum, e) => {
      return sum + coGetEquipmentBonus(e.equipmentDefId, e.level)
    }, 0)
    const discoveryBonus = store.madeDiscoveries.reduce((sum, dId) => {
      const disc = CO_DISCOVERIES.find((d) => d.id === dId)
      return sum + (disc ? Math.floor(disc.researchBonus * 0.2) : 0)
    }, 0)
    return {
      baseRegen: 1,
      equipmentBonus,
      discoveryBonus,
      totalRegen: 1 + equipmentBonus + discoveryBonus,
    }
  }, [store])

  // ── Getter: Coral Type Synergies ──────────────────────────────
  const coGetTypeSynergies = useMemo(() => {
    const catalogedTypes = new Set<COCoralType>()
    for (const c of store.catalogedSpecies) {
      const def = CO_SPECIES.find((d) => d.id === c.speciesDefId)
      if (def) {
        catalogedTypes.add(def.coralType)
      }
    }
    const activeSynergies: COTypeInteraction[] = []
    for (const interaction of CO_TYPE_INTERACTIONS) {
      if (catalogedTypes.has(interaction.primary) && catalogedTypes.has(interaction.secondary)) {
        activeSynergies.push(interaction)
      }
    }
    return {
      catalogedTypes: Array.from(catalogedTypes),
      activeSynergies,
      synergyCount: activeSynergies.length,
      totalPossible: CO_TYPE_INTERACTIONS.length,
    }
  }, [store])

  // ── Getter: Depth Zone Progress ───────────────────────────────
  const coGetDepthProgress = useMemo(() => {
    const depthRanges: Record<string, { min: number; max: number; label: string }> = {
      shallows: { min: 0, max: 20, label: 'Sunlit Shallows' },
      twilight: { min: 20, max: 60, label: 'Twilight Reef' },
      midnight: { min: 60, max: 150, label: 'Midnight Zone' },
      abyss: { min: 150, max: 300, label: 'The Abyss' },
    }
    const catalogedDepths = new Set<string>()
    for (const c of store.catalogedSpecies) {
      const def = CO_SPECIES.find((d) => d.id === c.speciesDefId)
      if (def) {
        const depthNum = parseInt(def.depth.split('-')[0], 10) || 0
        for (const [key, range] of Object.entries(depthRanges)) {
          if (depthNum >= range.min && depthNum < range.max) {
            catalogedDepths.add(key)
          }
        }
      }
    }
    return {
      zones: Object.entries(depthRanges).map(([key, range]) => ({
        ...range,
        key,
        explored: catalogedDepths.has(key),
      })),
      totalZones: Object.keys(depthRanges).length,
      exploredCount: catalogedDepths.size,
      allExplored: catalogedDepths.size >= Object.keys(depthRanges).length,
    }
  }, [store])

  // ── Getter: Discovery Catalog ─────────────────────────────────
  const coGetDiscoveryCatalog = useMemo(() => {
    return CO_DISCOVERIES.map((disc) => ({
      ...disc,
      discovered: store.madeDiscoveries.includes(disc.id),
      rarityColor: coRarityColor(disc.rarity),
      discoveryCost: Math.floor(25 * coRarityMultiplier(disc.rarity)),
      canDiscover:
        store.researchPoints >= Math.floor(25 * coRarityMultiplier(disc.rarity)) &&
        !store.madeDiscoveries.includes(disc.id),
    }))
  }, [store])

  // ── Getter: Reef Pollution ────────────────────────────────────
  const coGetReefPollution = useMemo(() => {
    const { pollution, health, maxHealth } = store.reef
    const pollutionPercent = Math.min(100, Math.floor(pollution))
    const isRecovering = pollution > 0 && health > maxHealth * 0.5
    return {
      pollution,
      pollutionPercent,
      isRecovering,
      healthImpact: Math.floor(pollution * 0.3),
    }
  }, [store.reef])

  // ── Getter: Equipment Category Summary ────────────────────────
  const coGetEquipmentCategorySummary = useMemo(() => {
    const categories: Record<string, { total: number; owned: number; avgLevel: number }> = {}
    for (const def of CO_EQUIPMENT) {
      if (!categories[def.category]) {
        categories[def.category] = { total: 0, owned: 0, avgLevel: 0 }
      }
      categories[def.category].total += 1
      const owned = store.equipment.find((e) => e.equipmentDefId === def.id)
      if (owned) {
        categories[def.category].owned += 1
        categories[def.category].avgLevel += owned.level
      }
    }
    for (const key of Object.keys(categories)) {
      const cat = categories[key]
      if (cat.owned > 0) {
        cat.avgLevel = Math.floor(cat.avgLevel / cat.owned)
      }
    }
    return categories
  }, [store.equipment])

  // ── Getter: Active Lab Bonuses ────────────────────────────────
  const coGetActiveLabBonuses = useMemo(() => {
    if (!store.activeLabId) return { bonuses: [], labName: '', depthZone: '' }
    const lab = CO_LABS.find((l) => l.id === store.activeLabId)
    if (!lab) return { bonuses: [], labName: '', depthZone: '' }
    const bonusCoralType = CO_LAB_CORAL_TYPE_BONUS[store.activeLabId] || []
    return {
      bonuses: lab.bonuses,
      labName: lab.name,
      depthZone: lab.depthZone,
      materialCount: 0,
      bonusMaterialCount: 0,
      bonusCoralTypes: bonusCoralType,
    }
  }, [store])

  // ── Assemble coAPI ────────────────────────────────────────────
  const coAPI = {
    // Constants
    CO_SPECIES,
    CO_LABS,
    CO_MATERIALS,
    CO_EQUIPMENT,
    CO_ABILITIES,
    CO_ACHIEVEMENTS,
    CO_TITLES,
    CO_DISCOVERIES,
    CO_TIDAL_EVENTS,
    CO_COLOR_CORAL_PINK,
    CO_COLOR_TIDE_BLUE,
    CO_COLOR_REEF_GREEN,
    CO_COLOR_LAB_WHITE,
    CO_COLOR_SAMPLE_AMBER,
    CO_COLOR_DISCOVERY_GOLD,
    CO_COLOR_DEEP_INDIGO,
    CO_COLOR_BIOLUM_CYAN,

    // State
    catalogedSpecies: store.catalogedSpecies,
    collectedMaterials: store.collectedMaterials,
    equipment: store.equipment,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    madeDiscoveries: store.madeDiscoveries,
    unlockedLabs: store.unlockedLabs,
    diverLevel: store.diverLevel,
    diverExp: store.diverExp,
    credits: store.credits,
    researchPoints: store.researchPoints,
    totalCataloged: store.totalCataloged,
    totalUpgraded: store.totalUpgraded,
    totalCultured: store.totalCultured,
    totalSensors: store.totalSensors,
    totalSamples: store.totalSamples,
    activeEventId: store.activeEventId,
    eventTimer: store.eventTimer,
    reef: store.reef,
    activeLabId: store.activeLabId,

    // Actions
    coExploreReef: store.coExploreReef,
    coCatalogSpecies: store.coCatalogSpecies,
    coUpgradeLab: store.coUpgradeLab,
    coUseAbility: store.coUseAbility,
    coHandleTidalEvent: store.coHandleTidalEvent,
    coMakeDiscovery: store.coMakeDiscovery,
    coCultureCoral: store.coCultureCoral,
    coDeploySensor: store.coDeploySensor,
    coMapTerrain: store.coMapTerrain,
    coAnalyzeSample: store.coAnalyzeSample,

    // Getters
    coGetLabDetails,
    coGetMaterialInventory,
    coGetCatalogedSpecies,
    coGetEquipmentList,
    coGetTotalPower,
    coGetEventStatus,
    coGetActiveEvent,
    coGetNextTitle,
    coGetRaritySummary,
    coGetLabSummary,
    coGetUnlockedAchievements,
    coGetTitleProgress,
    coGetMadeDiscoveries,
    coGetReefHealth,
    coGetCatalogingCosts,
    coLevelProgress,
    coGetAbilityList,
    coGetEventList,
    coGetStatsSummary,
    coGetSpeciesCountByType,
    coGetUpgradeCosts,
    coGetDiscoveryBonus,
    coGetCultureTierDetails,
    coGetLabMaterials,
    coGetResearchEfficiency,
    coGetTypeSynergies,
    coGetDepthProgress,
    coGetDiscoveryCatalog,
    coGetReefPollution,
    coGetEquipmentCategorySummary,
    coGetActiveLabBonuses,
  }

  return coAPI
}
