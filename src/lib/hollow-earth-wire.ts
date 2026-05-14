/**
 * Hollow Earth Wire — 地心 (Hollow Earth) feature module for Word Snake
 *
 * A subterranean exploration and management mini-game: dig through 8 earth layers,
 * mine 30 minerals, tame 35 underground creatures, build 25 cavern structures,
 * master 22 digging abilities, discover 15 ancient artifacts, and survive 12 seismic
 * events — backed by a Zustand store with persist middleware.
 *
 * Storage key: hollow-earth-wire
 * Prefix: he / HE_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type HERarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type HECreatureSpecies = 'Mole' | 'Salamander' | 'Beetle' | 'Worm' | 'Golem' | 'Bat' | 'Serpent'
export type HEElement = 'earth' | 'rock' | 'crystal' | 'lava' | 'magma' | 'obsidian' | 'mineral' | 'steam'

export interface HELayerDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depthMin: number
  readonly depthMax: number
  readonly dangerLevel: number
  readonly minLevel: number
  readonly resources: string[]
}

export interface HECreatureDef {
  readonly id: string
  readonly name: string
  readonly rarity: HERarity
  readonly species: HECreatureSpecies
  readonly basePower: number
  readonly description: string
  readonly ability: string
}

export interface HECreatureInstance {
  readonly id: string
  creatureDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  attack: number
  defense: number
  tamedCount: number
  acquiredAt: number
}

export interface HEMineralDef {
  readonly id: string
  readonly name: string
  readonly rarity: HERarity
  readonly source: string
  readonly description: string
  readonly value: number
}

export interface HECavernDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
}

export interface HECavernInstance {
  readonly id: string
  cavernDefId: string
  level: number
  built: boolean
}

export interface HEAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: HEElement
}

export interface HEAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface HETitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredDepth: number
}

export interface HEArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: HERarity
  readonly bonus: string
  readonly originLayer: string
}

export interface HESeismicEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface HEStoreState {
  dugLayers: string[]
  minedMinerals: Record<string, number>
  creatures: HECreatureInstance[]
  caverns: HECavernInstance[]
  abilities: string[]
  artifacts: string[]
  achievements: string[]
  currentTitle: string
  earthLevel: number
  earthExp: number
  gold: number
  digEnergy: number
  totalMined: number
  totalTamed: number
  totalDug: number
  totalArtifacts: number
  activeLayerId: string | null
  activeEventId: string | null
  eventTimer: number
  tunnelIntegrity: number
}

export interface HEStoreActions {
  digLayer: (layerId: string) => boolean
  mineMineral: (mineralId: string) => number
  buildCavern: (cavernDefId: string) => boolean
  upgradeCavern: (cavernId: string) => boolean
  demolishCavern: (cavernId: string) => boolean
  useAbility: (abilityId: string) => boolean
  handleSeismicEvent: (eventId: string) => boolean
  discoverArtifact: (artifactId: string) => boolean
  tameCreature: (creatureId: string) => boolean
  releaseCreature: (instanceId: string) => boolean
  trainCreature: (instanceId: string) => boolean
  excavateRuin: (layerId: string) => boolean
  activateGeyser: (layerId: string) => boolean
  reinforceTunnel: () => boolean
  fleeEvent: () => void
  unlockTitle: (titleId: string) => boolean
  claimAchievement: (achievementId: string) => boolean
}

export type HEFullStore = HEStoreState & HEStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const HE_COLOR_EARTH_BROWN: string = '#8B6914'
export const HE_COLOR_CRYSTAL_AMBER: string = '#FFBF00'
export const HE_COLOR_LAVA_ORANGE: string = '#FF6633'
export const HE_COLOR_CAVERN_GRAY: string = '#6B7280'
export const HE_COLOR_GEMSTONE_EMERALD: string = '#50C878'
export const HE_COLOR_OBSIDIAN_BLACK: string = '#0D0D0D'
export const HE_COLOR_MAGMA_RED: string = '#CC2200'
export const HE_COLOR_STALACTITE_WHITE: string = '#F5F5F0'

// ═══════════════════════════════════════════════════════════════════
// SECTION 2.5: GAME BALANCE CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const HE_DIG_ENERGY_COST_BASE = 5
export const HE_DIG_ENERGY_COST_PER_DANGER = 2
export const HE_MINE_ENERGY_COST_BASE = 3
export const HE_TAME_ENERGY_COST_BASE = 12
export const HE_ARTIFACT_ENERGY_COST = 10
export const HE_RUIN_ENERGY_COST = 20
export const HE_GEYSER_ENERGY_COST = 8
export const HE_REINFORCE_GOLD_COST = 30
export const HE_REINFORCE_INTEGRITY_GAIN = 15
export const HE_GEYSER_ENERGY_RESTORE = 30
export const HE_GEYSER_INTEGRITY_GAIN = 5
export const HE_TRAIN_GOLD_COST = 20
export const HE_FLEE_INTEGRITY_PENALTY = 10
export const HE_MAX_TUNNEL_INTEGRITY = 100
export const HE_MAX_CAVERN_LEVEL = 10
export const HE_EARTH_MAX_DEPTH = 6371
export const HE_EVENT_SEVERITY_MULTIPLIER = 5

export const HE_EARTH_RADIUS_KM = 6371
export const HE_CRUST_THICKNESS_KM = 35
export const HE_MANTLE_DEPTH_KM = 2900
export const HE_OUTER_CORE_DEPTH_KM = 5100
export const HE_INNER_CORE_DEPTH_KM = 6371

export const HE_SPECIES_LORE: Record<HECreatureSpecies, string> = {
  Mole: 'Moles are the premier diggers of the underground world. Their powerful claws can excavate through any material, and their sensitivity to seismic vibrations makes them natural early-warning systems for cave-ins.',
  Salamander: 'Underground salamanders have evolved remarkable adaptations to their lightless environment. Many species are blind but navigate using specialized heat and vibration sensors, and some can survive in near-boiling water.',
  Beetle: 'Subterranean beetles are the most diverse group of underground creatures. Their hardened chitin shells often incorporate minerals from their surroundings, creating stunning natural armor that varies by depth and region.',
  Worm: 'Underground worms range from common earthworms that aerate topsoil to colossal bore worms capable of displacing solid rock. They are the architects of the underground world, creating the tunnel systems all other creatures depend on.',
  Golem: 'Golems are not natural creatures but constructs animated by ancient earth magic. They guard the ruins of forgotten underground civilizations, their bodies composed of the very rock they stand upon.',
  Bat: 'Cave bats are the scouts of the underground world. Their echolocation can map entire cavern systems in hours, and some rare species have developed the ability to phase through solid rock or feed on life energy itself.',
  Serpent: 'Underground serpents are apex predators of the deep tunnels. From small root vipers to the legendary Ouroboros that encircles the inner core, they command respect and fear in equal measure.',
}

export const HE_LAYER_AMBIENT_TEMPS: Record<string, number> = {
  topsoil_belt: 15,
  sedimentary_shallows: 18,
  limestone_grotto: 22,
  granite_undercroft: 40,
  basalt_deep: 80,
  mantle_fringe: 500,
  deep_magma_sea: 1200,
  inner_core_sanctum: 5000,
}

export const HE_LAYER_PRESSURE_ATM: Record<string, number> = {
  topsoil_belt: 1,
  sedimentary_shallows: 2,
  limestone_grotto: 5,
  granite_undercroft: 15,
  basalt_deep: 50,
  mantle_fringe: 200,
  deep_magma_sea: 1000,
  inner_core_sanctum: 3600000,
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const HE_MAX_LEVEL = 50
const HE_INITIAL_GOLD = 200
const HE_INITIAL_ENERGY = 100
const HE_MAX_ENERGY = 500

function heXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= HE_MAX_LEVEL) return Infinity
  return Math.floor(75 * Math.pow(1.14, level) + level * 12)
}

function heLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < HE_MAX_LEVEL) {
    const needed = heXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function heGenerateId(): string {
  return `he_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function heRarityPower(rarity: HERarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.4
    case 'rare': return 2.0
    case 'epic': return 3.2
    case 'legendary': return 5.5
  }
}

function heGetRarityColor(rarity: HERarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#A78BFA'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

function heGetSpeciesColor(species: HECreatureSpecies): string {
  switch (species) {
    case 'Mole': return HE_COLOR_EARTH_BROWN
    case 'Salamander': return HE_COLOR_LAVA_ORANGE
    case 'Beetle': return HE_COLOR_CRYSTAL_AMBER
    case 'Worm': return HE_COLOR_GEMSTONE_EMERALD
    case 'Golem': return HE_COLOR_CAVERN_GRAY
    case 'Bat': return HE_COLOR_OBSIDIAN_BLACK
    case 'Serpent': return HE_COLOR_MAGMA_RED
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: HE_LAYERS — 8 Earth Layers (Crust to Core)
// ═══════════════════════════════════════════════════════════════════

export const HE_LAYERS: readonly HELayerDef[] = [
  {
    id: 'topsoil_belt',
    name: 'Topsoil Belt',
    description:
      'The shallowest layer beneath the surface, rich with organic soil and root networks. Worms and burrowing moles dominate this familiar terrain. Easy digging for beginners, but beware of sinkholes and underground springs that can flood tunnels.',
    depthMin: 0,
    depthMax: 50,
    dangerLevel: 1,
    minLevel: 1,
    resources: ['clay_deposit', 'flint_pebble', 'root_fossil', 'copper_nugget'],
  },
  {
    id: 'sedimentary_shallows',
    name: 'Sedimentary Shallows',
    description:
      'Layers of compressed sandstone, limestone, and shale form the first true underground passage. Ancient river beds are preserved in the rock, and fossils of prehistoric fish are common finds. Dripping water echoes through natural caverns.',
    depthMin: 50,
    depthMax: 200,
    dangerLevel: 2,
    minLevel: 3,
    resources: ['sandstone_brick', 'limestone_slab', 'ammonite_fossil', 'iron_ore_chunk'],
  },
  {
    id: 'limestone_grotto',
    name: 'Limestone Grotto',
    description:
      'A vast network of dissolved limestone caverns adorned with stalactites and stalagmites. Underground rivers carve through the rock, creating cathedral-like chambers. Rare cave salamanders make their homes in the crystal-clear pools.',
    depthMin: 200,
    depthMax: 500,
    dangerLevel: 3,
    minLevel: 6,
    resources: ['stalactite_shard', 'cave_pearl', 'onyx_fragment', 'quartz_crystal'],
  },
  {
    id: 'granite_undercroft',
    name: 'Granite Undercroft',
    description:
      'The earth grows hard and unyielding as solid granite replaces softer sedimentary rock. Ancient mining operations from forgotten civilizations dot the walls. Pressure increases noticeably, and the air grows warm. Glow worms illuminate branching passages.',
    depthMin: 500,
    depthMax: 1000,
    dangerLevel: 5,
    minLevel: 10,
    resources: ['granite_block', 'mica_sheet', 'garnet_gem', 'silver_vein'],
  },
  {
    id: 'basalt_deep',
    name: 'Basalt Deep',
    description:
      'Columns of hexagonal basalt stretch into darkness like a petrified forest. Volcanic vents release sulfurous gases, and the temperature rises steadily. Strange beetles with crystalline shells scuttle through cracks in the obsidian-coated walls.',
    depthMin: 1000,
    depthMax: 2000,
    dangerLevel: 6,
    minLevel: 15,
    resources: ['basalt_column', 'obsidian_shard', 'sulfur_crystal', 'gold_vein'],
  },
  {
    id: 'mantle_fringe',
    name: 'Mantle Fringe',
    description:
      'The boundary between crust and mantle, where rock begins to soften and glow with faint heat. Magma channels snake through the walls, and only the hardiest creatures survive here. Ancient golems carved from living stone patrol forgotten passages.',
    depthMin: 2000,
    depthMax: 3500,
    dangerLevel: 7,
    minLevel: 20,
    resources: ['magma_shard', 'fire_opal', 'platinum_nugget', 'rare_earth_element'],
  },
  {
    id: 'deep_magma_sea',
    name: 'Deep Magma Sea',
    description:
      'A vast underground ocean of liquid magma separates the outer earth from the inner world. Floating platforms of cooled basalt provide the only footing. Colossal serpents swim through the molten depths, and the heat is oppressive beyond imagination.',
    depthMin: 3500,
    depthMax: 5000,
    dangerLevel: 8,
    minLevel: 28,
    resources: ['magma_core_fragment', 'dragon_bone_fossil', 'diamond_cluster', 'mythril_ore'],
  },
  {
    id: 'inner_core_sanctum',
    name: 'Inner Core Sanctum',
    description:
      'The very heart of the Hollow Earth, a realm of impossible beauty and terrible danger. Crystals larger than buildings emit their own light, and the air shimmers with raw geothermal energy. This is where the oldest and most powerful artifacts await discovery by the boldest explorers.',
    depthMin: 5000,
    depthMax: 6371,
    dangerLevel: 10,
    minLevel: 35,
    resources: ['core_crystal', 'primordial_gem', 'adamantine_ingot', 'world_seed_crystal'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: HE_CREATURES — 35 Subterranean Creatures (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const HE_CREATURES: readonly HECreatureDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'dirt_mole',
    name: 'Dirt Mole',
    rarity: 'common',
    species: 'Mole',
    basePower: 15,
    description:
      'A small brown mole with oversized digging claws. It tunnels through topsoil with ease, leaving neat little mounds of earth in its wake. Harmless but surprisingly fast.',
    ability: 'rapid_burrow',
  },
  {
    id: 'cave_newt',
    name: 'Cave Newt',
    rarity: 'common',
    species: 'Salamander',
    basePower: 18,
    description:
      'A pale, eyeless salamander that navigates by sensing vibrations in damp rock. Its skin secretes a mild bioluminescent mucus that guides it through absolute darkness.',
    ability: 'vibration_sense',
  },
  {
    id: 'stone_beetle',
    name: 'Stone Beetle',
    rarity: 'common',
    species: 'Beetle',
    basePower: 20,
    description:
      'A beetle with a shell that perfectly mimics surrounding rock. It feeds on mineral deposits and can curl into an impenetrable ball when threatened by predators.',
    ability: 'rock_disguise',
  },
  {
    id: 'earthworm_giant',
    name: 'Giant Earthworm',
    rarity: 'common',
    species: 'Worm',
    basePower: 16,
    description:
      'A two-meter-long earthworm that aerates deep soil layers. Its segmented body can regenerate if cut, and it secretes nutrient-rich slime used by cavern fungi.',
    ability: 'regenerate_segment',
  },
  {
    id: 'pebble_golem',
    name: 'Pebble Golem',
    rarity: 'common',
    species: 'Golem',
    basePower: 22,
    description:
      'A tiny golem assembled from smooth river stones by ancient underground magic. It rolls itself into a ball and navigates tunnels by bouncing off walls.',
    ability: 'stone_roll',
  },
  {
    id: 'dusk_bat',
    name: 'Dusk Bat',
    rarity: 'common',
    species: 'Bat',
    basePower: 17,
    description:
      'A small insectivorous bat that roosts in the upper cave systems. Its echolocation is so precise it can detect a beetle walking on rock from fifty meters away.',
    ability: 'echo_location',
  },
  {
    id: 'root_viper',
    name: 'Root Viper',
    rarity: 'common',
    species: 'Serpent',
    basePower: 19,
    description:
      'A thin green snake that camouflages itself among tree roots in the topsoil layer. Its bite delivers a mild paralytic venom that immobilizes small prey.',
    ability: 'root_camouflage',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'ironclaw_mole',
    name: 'Ironclaw Mole',
    rarity: 'uncommon',
    species: 'Mole',
    basePower: 38,
    description:
      'A larger mole species with claws tipped in natural iron deposits. It can tunnel through solid limestone and has been known to dig networks spanning kilometers.',
    ability: 'iron_dig',
  },
  {
    id: 'fire_belly_newt',
    name: 'Fire Belly Newt',
    rarity: 'uncommon',
    species: 'Salamander',
    basePower: 42,
    description:
      'A vibrant orange salamander with a belly that radiates actual heat. It thrives near geothermal vents and can raise its body temperature to scalding levels as a defense mechanism.',
    ability: 'heat_aura',
  },
  {
    id: 'crystal_carapace_beetle',
    name: 'Crystal Carapace Beetle',
    rarity: 'uncommon',
    species: 'Beetle',
    basePower: 45,
    description:
      'A beetle whose shell has been replaced by crystalline mineral deposits over generations. Light refracts through its carapace in dazzling patterns that confuse predators.',
    ability: 'prism_shell',
  },
  {
    id: 'tunnel_bore_worm',
    name: 'Tunnel Bore Worm',
    rarity: 'uncommon',
    species: 'Worm',
    basePower: 40,
    description:
      'A mechanical-looking worm with ringed segments of hardened chitin. It eats through rock by secreting acidic digestive enzymes, leaving perfectly circular tunnels behind.',
    ability: 'acid_bore',
  },
  {
    id: 'granite_sentinel',
    name: 'Granite Sentinel',
    rarity: 'uncommon',
    species: 'Golem',
    basePower: 50,
    description:
      'A humanoid golem carved from a single block of granite by unknown hands. It stands motionless for decades at a time, then moves with surprising speed to drive away intruders from its territory.',
    ability: 'stone_guard',
  },
  {
    id: 'cavern_fox_bat',
    name: 'Cavern Fox Bat',
    rarity: 'uncommon',
    species: 'Bat',
    basePower: 36,
    description:
      'A bat with the cunning of a fox and wingspan of nearly a meter. It hunts in coordinated packs, using sophisticated echolocation to corner prey in dead-end tunnels.',
    ability: 'pack_sonar',
  },
  {
    id: 'stone_curl_serpent',
    name: 'Stone Curl Serpent',
    rarity: 'uncommon',
    species: 'Serpent',
    basePower: 44,
    description:
      'A thick-bodied snake with scales that perfectly match granite. It can squeeze through impossibly narrow cracks and constricts prey with bone-crushing force.',
    ability: 'crack_squeeze',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'diamond_claw_mole_king',
    name: 'Diamond Claw Mole King',
    rarity: 'rare',
    species: 'Mole',
    basePower: 75,
    description:
      'The patriarch of all underground moles. Its claws are tipped with natural diamond deposits accumulated over centuries of digging through mineral-rich strata. It commands lesser moles through subtle seismic vibrations.',
    ability: 'diamond_dig',
  },
  {
    id: 'magma_salamander',
    name: 'Magma Salamander',
    rarity: 'rare',
    species: 'Salamander',
    basePower: 80,
    description:
      'A foot-long salamander that swims through underground lava channels. Its body temperature exceeds 800 degrees, and it leaves trails of molten rock wherever it crawls. Only found near the mantle fringe.',
    ability: 'lava_swim',
  },
  {
    id: 'emerald_shield_beetle',
    name: 'Emerald Shield Beetle',
    rarity: 'rare',
    species: 'Beetle',
    basePower: 70,
    description:
      'A massive beetle with a carapace composed of natural emerald crystals. The shell is nearly indestructible and glows with a soft green light in dark caverns. Ancient miners considered it a sign of rich mineral deposits nearby.',
    ability: 'emerald_barrier',
  },
  {
    id: 'void_borer_worm',
    name: 'Void Borer Worm',
    rarity: 'rare',
    species: 'Worm',
    basePower: 85,
    description:
      'A colossal worm that creates tunnels by displacing matter itself, rather than eating through it. Its segments absorb all light, making the worm appear as a moving hole in reality.',
    ability: 'void_tunnel',
  },
  {
    id: 'obsidian_golem',
    name: 'Obsidian Golem',
    rarity: 'rare',
    species: 'Golem',
    basePower: 90,
    description:
      'A towering golem of volcanic glass, forged in the intense heat of ancient magma flows. Its crystalline body reflects attacks and its fists strike with shattering force. Remnants of a long-lost underground civilization.',
    ability: 'obsidian_reflect',
  },
  {
    id: 'spectral_bat',
    name: 'Spectral Bat',
    rarity: 'rare',
    species: 'Bat',
    basePower: 72,
    description:
      'A ghostly bat that phases between solid rock and empty air. Its wings emit no sound, and it feeds on the life energy of creatures it brushes past in flight. Entire colonies can drain the warmth from a cavern in minutes.',
    ability: 'phase_shift',
  },
  {
    id: 'basalt_constrictor',
    name: 'Basalt Constrictor',
    rarity: 'rare',
    species: 'Serpent',
    basePower: 78,
    description:
      'A massive snake with scales harder than basalt. It crushes prey by wrapping around them and literally turning its body to stone, grinding victims between immovable coils.',
    ability: 'stone_constrict',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'mythril_mole_emperor',
    name: 'Mythril Mole Emperor',
    rarity: 'epic',
    species: 'Mole',
    basePower: 120,
    description:
      'A mole the size of a horse, with claws forged from mythril ore by generations of mineral accumulation. It has carved the largest tunnel system in the Hollow Earth, a labyrinth spanning hundreds of kilometers.',
    ability: 'mythril_excavation',
  },
  {
    id: 'inferno_salamander_queen',
    name: 'Inferno Salamander Queen',
    rarity: 'epic',
    species: 'Salamander',
    basePower: 115,
    description:
      'A salamander of terrifying size that reigns over the magma channels of the Deep Magma Sea. Her body radiates heat intense enough to melt steel, and she commands legions of lesser fire salamanders.',
    ability: 'inferno_command',
  },
  {
    id: 'adamantine_beetle_titan',
    name: 'Adamantine Beetle Titan',
    rarity: 'epic',
    species: 'Beetle',
    basePower: 130,
    description:
      'A beetle larger than a cart, encased in layers of adamantine-infused chitin. Its mandibles can shear through any known material, and its sheer weight causes minor tremors when it walks.',
    ability: 'adamantine_crush',
  },
  {
    id: 'world_bore_wyrm',
    name: 'World Bore Wyrm',
    rarity: 'epic',
    species: 'Worm',
    basePower: 125,
    description:
      'A legendary worm said to have bored the original tunnels connecting the surface to the inner core. Its body generates its own gravitational field, pulling rock apart as it passes through.',
    ability: 'gravity_bore',
  },
  {
    id: 'deep_earth_golem_colossus',
    name: 'Deep Earth Golem Colossus',
    rarity: 'epic',
    species: 'Golem',
    basePower: 140,
    description:
      'A golem of mountainous proportions, composed of every type of rock and mineral found underground. It is the last guardian of an ancient underground civilization, awakening only when the earth itself is threatened.',
    ability: 'continental_slam',
  },
  {
    id: 'cavern_horror_bat',
    name: 'Cavern Horror Bat',
    rarity: 'epic',
    species: 'Bat',
    basePower: 110,
    description:
      'A bat with a wingspan of ten meters, whose shadow alone can paralyze prey with primal terror. It hunts by emitting a sonic frequency that liquefies internal organs, then drinks its victims through hollow fangs.',
    ability: 'terror_scream',
  },
  {
    id: 'magma_python_elder',
    name: 'Magma Python Elder',
    rarity: 'epic',
    species: 'Serpent',
    basePower: 135,
    description:
      'An ancient python that has lived so long in magma channels that its blood has been replaced by liquid fire. It can raise the temperature of any cavern to volcanic levels simply by coiling within it.',
    ability: 'magma_blood_rage',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'terranarch_mole',
    name: 'Terranarch Mole',
    rarity: 'legendary',
    species: 'Mole',
    basePower: 150,
    description:
      'The first mole to ever dig beneath the earth, a being of primordial soil magic. Its claws can tunnel through any substance, including the boundaries between dimensions. Legend says it created the Hollow Earth itself by digging a sphere out of solid rock.',
    ability: 'world_carve',
  },
  {
    id: 'primordial_fire_salamander',
    name: 'Primordial Fire Salamander',
    rarity: 'legendary',
    species: 'Salamander',
    basePower: 148,
    description:
      'Born from the original magma that filled the young earth, this salamander embodies the living concept of geothermal heat. Its presence ignites spontaneous combustion in all organic material within a hundred meters.',
    ability: 'primordial_flame',
  },
  {
    id: 'world_shell_beetle',
    name: 'World Shell Beetle',
    rarity: 'legendary',
    species: 'Beetle',
    basePower: 145,
    description:
      'A beetle so ancient that its shell has accumulated every mineral and gemstone known to exist. Its carapace is the most valuable object in the underground world, and its shell patterns tell the geological history of the planet.',
    ability: 'mineral_mastery',
  },
  {
    id: 'midgard_serpent_worm',
    name: 'Midgard Serpent Worm',
    rarity: 'legendary',
    species: 'Worm',
    basePower: 150,
    description:
      'A worm so long it encircles the entire inner core of the earth. When it moves, earthquakes ripple across the surface. Its body is composed of compressed tectonic plates, and its appetite for rock is limitless.',
    ability: 'tectonic_wrath',
  },
  {
    id: 'core_golem_sovereign',
    name: 'Core Golem Sovereign',
    rarity: 'legendary',
    species: 'Golem',
    basePower: 150,
    description:
      'A golem assembled from fragments of the planetary core itself. It radiates heat visible from leagues away, and its fists strike with the force of volcanic eruptions. It is the living will of the earth, defending the deepest sanctums from all intruders.',
    ability: 'core_eruption',
  },
  {
    id: 'void_wing_bat_lord',
    name: 'Void Wing Bat Lord',
    rarity: 'legendary',
    species: 'Bat',
    basePower: 142,
    description:
      'The patriarch of all bat species, a creature that exists partially in a dimension of pure darkness. Its wings blot out all light, and its screech creates temporary black holes that consume everything in their radius.',
    ability: 'void_scream',
  },
  {
    id: 'ouroboros_earth_serpent',
    name: 'Ouroboros Earth Serpent',
    rarity: 'legendary',
    species: 'Serpent',
    basePower: 150,
    description:
      'The eternal serpent that encircles the entire Hollow Earth, eating its own tail in an endless cycle of creation and destruction. Where it passes, new tunnels form and old ones collapse. It is the alpha and omega of all underground life.',
    ability: 'ouroboros_cycle',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: HE_MINERALS — 30 Underground Treasures
// ═══════════════════════════════════════════════════════════════════

export const HE_MINERALS: readonly HEMineralDef[] = [
  // Common (6)
  { id: 'clay_deposit', name: 'Clay Deposit', rarity: 'common', source: 'topsoil_belt', description: 'Soft, malleable clay found in the upper soil layers. Used for basic construction and pottery.', value: 5 },
  { id: 'flint_pebble', name: 'Flint Pebble', rarity: 'common', source: 'topsoil_belt', description: 'A smooth stone that sparks when struck. Essential for starting fires and basic toolmaking.', value: 8 },
  { id: 'root_fossil', name: 'Root Fossil', rarity: 'common', source: 'topsoil_belt', description: 'Petrified roots from ancient trees, now turned to stone. Contains trace minerals useful in alchemy.', value: 6 },
  { id: 'copper_nugget', name: 'Copper Nugget', rarity: 'common', source: 'topsoil_belt', description: 'A small nugget of native copper. Soft enough to shape by hand, it is the first metal used by underground civilizations.', value: 10 },
  { id: 'sandstone_brick', name: 'Sandstone Brick', rarity: 'common', source: 'sedimentary_shallows', description: 'A pre-formed brick of compressed sandstone. Useful for reinforcing tunnels and building basic structures.', value: 7 },
  { id: 'limestone_slab', name: 'Limestone Slab', rarity: 'common', source: 'sedimentary_shallows', description: 'A flat slab of pale limestone. Easy to carve and commonly used for cavern construction.', value: 9 },

  // Uncommon (6)
  { id: 'ammonite_fossil', name: 'Ammonite Fossil', rarity: 'uncommon', source: 'sedimentary_shallows', description: 'A spiral fossil of an ancient cephalopod, perfectly preserved in sedimentary rock. Prized by collectors and scholars.', value: 30 },
  { id: 'iron_ore_chunk', name: 'Iron Ore Chunk', rarity: 'uncommon', source: 'sedimentary_shallows', description: 'A chunk of hematite-rich rock. Smelting yields iron, the backbone of underground industry.', value: 35 },
  { id: 'stalactite_shard', name: 'Stalactite Shard', rarity: 'uncommon', source: 'limestone_grotto', description: 'A broken tip of a stalactite, composed of layered calcite deposits. Contains beautiful natural banding patterns.', value: 28 },
  { id: 'cave_pearl', name: 'Cave Pearl', rarity: 'uncommon', source: 'limestone_grotto', description: 'A lustrous pearl formed inside underground mollusks over centuries. Iridescent and surprisingly durable.', value: 40 },
  { id: 'onyx_fragment', name: 'Onyx Fragment', rarity: 'uncommon', source: 'limestone_grotto', description: 'A piece of banded onyx with alternating black and white layers. Used in ornamental construction and basic enchanting.', value: 32 },
  { id: 'quartz_crystal', name: 'Quartz Crystal', rarity: 'uncommon', source: 'limestone_grotto', description: 'A clear crystal of natural quartz. Conducts energy and is used in basic underground technology.', value: 36 },

  // Rare (6)
  { id: 'granite_block', name: 'Granite Block', rarity: 'rare', source: 'granite_undercroft', description: 'A massive block of polished granite, tougher than steel. The primary building material for deep structures.', value: 120 },
  { id: 'mica_sheet', name: 'Mica Sheet', rarity: 'rare', source: 'granite_undercroft', description: 'A translucent sheet of natural mica that splits into perfect, paper-thin layers. Used in underground windows and insulation.', value: 100 },
  { id: 'garnet_gem', name: 'Garnet Gem', rarity: 'rare', source: 'granite_undercroft', description: 'A deep red garnet crystal, flawless and the size of a thumb. Its warm glow provides comfort in cold caverns.', value: 150 },
  { id: 'silver_vein', name: 'Silver Vein', rarity: 'rare', source: 'granite_undercroft', description: 'A sample of silver ore extracted from a rich underground vein. Valuable for crafting and trade.', value: 130 },
  { id: 'basalt_column', name: 'Basalt Column', rarity: 'rare', source: 'basalt_deep', description: 'A hexagonal column of cooled basalt with perfect geometric angles. Used in advanced construction and golem repair.', value: 110 },
  { id: 'obsidian_shard', name: 'Obsidian Shard', rarity: 'rare', source: 'basalt_deep', description: 'A razor-sharp shard of volcanic glass, sharper than any steel blade. Used in weapon crafting and ritual tools.', value: 140 },

  // Epic (6)
  { id: 'sulfur_crystal', name: 'Sulfur Crystal', rarity: 'epic', source: 'basalt_deep', description: 'A bright yellow crystal of pure sulfur that glows with its own faint light. Essential for advanced alchemical formulas.', value: 500 },
  { id: 'gold_vein', name: 'Gold Vein', rarity: 'epic', source: 'basalt_deep', description: 'A rich sample of gold-bearing quartz. The gold within gleams with unnatural purity, untouched by surface corrosion.', value: 600 },
  { id: 'magma_shard', name: 'Magma Shard', rarity: 'epic', source: 'mantle_fringe', description: 'A fragment of semi-solid magma preserved in a crystal shell. It pulses with geothermal energy and radiates constant heat.', value: 550 },
  { id: 'fire_opal', name: 'Fire Opal', rarity: 'epic', source: 'mantle_fringe', description: 'A mesmerizing opal that flashes with all colors of fire. Said to contain the captured essence of ancient underground volcanoes.', value: 700 },
  { id: 'platinum_nugget', name: 'Platinum Nugget', rarity: 'epic', source: 'mantle_fringe', description: 'A nugget of pure platinum, incredibly dense and corrosion-resistant. The rarest surface metal, found only in the deepest excavations.', value: 650 },
  { id: 'rare_earth_element', name: 'Rare Earth Element', rarity: 'epic', source: 'mantle_fringe', description: 'A sample of exotic rare earth minerals with unique magnetic and luminescent properties. Powers the most advanced underground technology.', value: 480 },

  // Legendary (6)
  { id: 'magma_core_fragment', name: 'Magma Core Fragment', rarity: 'legendary', source: 'deep_magma_sea', description: 'A fragment of solidified planetary magma, impossibly dense and warm to the touch. Contains the raw power of the earth itself.', value: 2500 },
  { id: 'dragon_bone_fossil', name: 'Dragon Bone Fossil', rarity: 'legendary', source: 'deep_magma_sea', description: 'A fossilized bone from an earth dragon, petrified by millennia of geological pressure. Radiates primal draconic energy.', value: 2200 },
  { id: 'diamond_cluster', name: 'Diamond Cluster', rarity: 'legendary', source: 'deep_magma_sea', description: 'A cluster of perfect diamonds formed under extreme geological pressure. The largest underground gem discovery ever recorded.', value: 3000 },
  { id: 'mythril_ore', name: 'Mythril Ore', rarity: 'legendary', source: 'deep_magma_sea', description: 'Silvery-blue ore of mythical lightness and incredible strength. When forged, produces weapons and armor that are nearly indestructible.', value: 2800 },
  { id: 'primordial_gem', name: 'Primordial Gem', rarity: 'legendary', source: 'inner_core_sanctum', description: 'A gem that formed at the birth of the planet, containing compressed geological time. Gazing into it reveals visions of earth\'s ancient past.', value: 5000 },
  { id: 'world_seed_crystal', name: 'World Seed Crystal', rarity: 'legendary', source: 'inner_core_sanctum', description: 'A crystal said to contain the original blueprint of the planet. The most valuable mineral in the Hollow Earth, and possibly the world.', value: 6000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: HE_CAVERNS — 25 Upgradeable Cavern Structures (Level 1-10)
// ═══════════════════════════════════════════════════════════════════

export const HE_CAVERNS: readonly HECavernDef[] = [
  // Mining (5)
  { id: 'basic_mine_shaft', name: 'Basic Mine Shaft', description: 'A simple vertical shaft with wooden supports for accessing deeper layers. Essential for any underground operation.', baseCost: 80, costMultiplier: 1.4 },
  { id: 'drill_station', name: 'Drill Station', description: 'A powered drilling platform that accelerates tunnel excavation through harder rock formations.', baseCost: 400, costMultiplier: 1.5 },
  { id: 'ore_processor', name: 'Ore Processing Plant', description: 'Crushes and refines raw ore into usable materials. Increases mineral yield from mining operations.', baseCost: 1000, costMultiplier: 1.6 },
  { id: 'deep_bore_machine', name: 'Deep Bore Machine', description: 'An industrial tunnel-boring machine capable of cutting through granite and basalt at incredible speed.', baseCost: 2500, costMultiplier: 1.7 },
  { id: 'core_access_elevator', name: 'Core Access Elevator', description: 'The ultimate excavation structure, a pressurized elevator system that descends to the inner core without collapsing.', baseCost: 7000, costMultiplier: 2.0 },

  // Housing (5)
  { id: 'dirt_burrow', name: 'Dirt Burrow', description: 'A simple underground shelter dug into the topsoil. Provides basic protection from surface weather and cave-ins.', baseCost: 50, costMultiplier: 1.3 },
  { id: 'stone_quarters', name: 'Stone Quarters', description: 'Solid limestone quarters with proper ventilation and drainage. Comfortable housing for long-term underground living.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'granite_barracks', name: 'Granite Barracks', description: 'Reinforced living quarters carved from solid granite. Houses mining crews and supports extended deep expeditions.', baseCost: 1200, costMultiplier: 1.6 },
  { id: 'crystal_spire_lodge', name: 'Crystal Spire Lodge', description: 'A magnificent lodge built around a natural crystal formation. The crystals provide natural light and warmth.', baseCost: 3500, costMultiplier: 1.7 },
  { id: 'core_sanctum_palace', name: 'Core Sanctum Palace', description: 'A palace at the edge of the inner core, built from every mineral and gemstone available. The ultimate underground residence.', baseCost: 8000, costMultiplier: 2.0 },

  // Storage (5)
  { id: 'root_cellar', name: 'Root Cellar', description: 'A simple underground storage room lined with root fossils. Keeps supplies cool and dry.', baseCost: 60, costMultiplier: 1.3 },
  { id: 'mineral_vault', name: 'Mineral Vault', description: 'A temperature-controlled vault for storing valuable minerals and gems. Prevents degradation of sensitive materials.', baseCost: 350, costMultiplier: 1.5 },
  { id: 'gem_repository', name: 'Gem Repository', description: 'A high-security vault with crystal-lock doors. Protects the rarest and most valuable mineral specimens.', baseCost: 1500, costMultiplier: 1.6 },
  { id: 'artifact_archive', name: 'Artifact Archive', description: 'A specially designed archive that preserves ancient artifacts in their original geological conditions.', baseCost: 4000, costMultiplier: 1.8 },
  { id: 'world_vault', name: 'World Vault', description: 'An impregnable vault at the inner core, capable of storing even the most volatile magical minerals safely.', baseCost: 9000, costMultiplier: 2.0 },

  // Research (5)
  { id: 'rock_analysis_lab', name: 'Rock Analysis Laboratory', description: 'A basic lab for identifying and classifying mineral samples. Provides fundamental geological knowledge.', baseCost: 200, costMultiplier: 1.5 },
  { id: 'geothermal_research_center', name: 'Geothermal Research Center', description: 'Studies underground heat patterns and volcanic activity. Predicts seismic events and magma flows.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'crystal_growth_chamber', name: 'Crystal Growth Chamber', description: 'Cultivates synthetic crystals under controlled pressure and temperature conditions. Produces rare gems on demand.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'ancient_civilization_institute', name: 'Ancient Civilization Institute', description: 'Decodes and studies artifacts from lost underground civilizations. Unlocks knowledge of forgotten technologies.', baseCost: 5000, costMultiplier: 1.8 },
  { id: 'core_energy_reactor', name: 'Core Energy Reactor', description: 'Harnesses geothermal energy from the inner core to power all underground operations. Provides unlimited clean energy.', baseCost: 10000, costMultiplier: 2.0 },

  // Defense (5)
  { id: 'rockfall_barrier', name: 'Rockfall Barrier', description: 'A wall of loose stones designed to collapse and block tunnel intrusions. Basic but effective cave defense.', baseCost: 100, costMultiplier: 1.4 },
  { id: 'stone_fortress', name: 'Stone Fortress', description: 'A fortified structure built from solid limestone blocks. Withstands minor cave-ins and creature attacks.', baseCost: 500, costMultiplier: 1.5 },
  { id: 'obsidian_bastion', name: 'Obsidian Bastion', description: 'A fortress of volcanic glass that reflects energy attacks. Nearly impervious to physical damage.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'tectonic_shield_generator', name: 'Tectonic Shield Generator', description: 'Generates a localized force field that neutralizes seismic waves. Protects structures during earthquakes.', baseCost: 6000, costMultiplier: 1.8 },
  { id: 'planetary_core_bunker', name: 'Planetary Core Bunker', description: 'The ultimate defense structure, built at the inner core. Can survive any geological catastrophe, even planetary-scale events.', baseCost: 15000, costMultiplier: 2.0 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: HE_ABILITIES — 22 Digging Abilities (Earth/Rock/Crystal themed)
// ═══════════════════════════════════════════════════════════════════

export const HE_ABILITIES: readonly HEAbilityDef[] = [
  { id: 'earth_shatter', name: 'Earth Shatter', description: 'Strikes the ground with tremendous force, shattering rock in a wide radius and revealing hidden mineral veins.', cooldown: 20, power: 25, element: 'earth' },
  { id: 'rock_slide', name: 'Rock Slide', description: 'Triggers a controlled cave-in that damages enemies and blocks tunnel passages behind you.', cooldown: 30, power: 35, element: 'rock' },
  { id: 'crystal_spike', name: 'Crystal Spike', description: 'Causes crystal formations to erupt from the ground, impaling enemies and creating natural barricades.', cooldown: 25, power: 30, element: 'crystal' },
  { id: 'lava_stream', name: 'Lava Stream', description: 'Channels a stream of redirected magma from nearby vents, scorching everything in its path.', cooldown: 40, power: 45, element: 'lava' },
  { id: 'magma_burst', name: 'Magma Burst', description: 'Causes a geyser of magma to erupt from the floor, creating a temporary lake of molten rock.', cooldown: 50, power: 55, element: 'magma' },
  { id: 'obsidian_blade', name: 'Obsidian Blade', description: 'Forms a blade of volcanic glass around your arm, capable of cutting through any material.', cooldown: 15, power: 20, element: 'obsidian' },
  { id: 'mineral_sense', name: 'Mineral Sense', description: 'Extends your perception through the rock, detecting nearby minerals, creatures, and structural weaknesses.', cooldown: 10, power: 10, element: 'mineral' },
  { id: 'steam_vent', name: 'Steam Vent', description: 'Opens a pressurized steam vent that blinds enemies and fills tunnels with scalding vapor.', cooldown: 35, power: 30, element: 'steam' },
  { id: 'tunnel_bore', name: 'Tunnel Bore', description: 'Rapidly excavates a tunnel through solid rock in any direction, creating an escape route or shortcut.', cooldown: 45, power: 20, element: 'earth' },
  { id: 'stone_skin', name: 'Stone Skin', description: 'Temporarily transforms your skin into living granite, dramatically increasing defense against physical attacks.', cooldown: 60, power: 40, element: 'rock' },
  { id: 'crystal_prism', name: 'Crystal Prism', description: 'Creates a prism of crystal that refracts light into blinding beams, stunning light-sensitive cave creatures.', cooldown: 25, power: 35, element: 'crystal' },
  { id: 'earthquake_slam', name: 'Earthquake Slam', description: 'Pounds the ground with seismic force, causing a localized earthquake that damages all nearby enemies.', cooldown: 55, power: 65, element: 'earth' },
  { id: 'rock_armor', name: 'Rock Armor', description: 'Surrounds yourself with orbiting boulders that absorb incoming damage and can be launched at enemies.', cooldown: 50, power: 50, element: 'rock' },
  { id: 'gem_resonance', name: 'Gem Resonance', description: 'Causes all nearby gems and crystals to vibrate at resonant frequency, shattering enemy equipment and barriers.', cooldown: 40, power: 45, element: 'crystal' },
  { id: 'magma_armor', name: 'Magma Armor', description: 'Coats your body in a thin layer of flowing magma that burns attackers and provides extreme heat resistance.', cooldown: 70, power: 60, element: 'lava' },
  { id: 'core_breath', name: 'Core Breath', description: 'Exhales a stream of superheated plasma from the planetary core, melting through anything it touches.', cooldown: 80, power: 80, element: 'magma' },
  { id: 'obsidian_mirror', name: 'Obsidian Mirror', description: 'Creates a wall of polished obsidian that reflects energy attacks back at their source with doubled power.', cooldown: 45, power: 55, element: 'obsidian' },
  { id: 'mineral_extraction', name: 'Mineral Extraction', description: 'Draws valuable minerals from surrounding rock through your hands, instantly harvesting nearby deposits.', cooldown: 30, power: 15, element: 'mineral' },
  { id: 'steam_geyser', name: 'Steam Geyser', description: 'Triggers a powerful geyser of superheated steam that launches you upward and scalds enemies below.', cooldown: 35, power: 40, element: 'steam' },
  { id: 'tectonic_upheaval', name: 'Tectonic Upheaval', description: 'Shifts tectonic plates in a wide area, raising rock walls, opening chasms, and reshaping the entire cavern.', cooldown: 90, power: 85, element: 'earth' },
  { id: 'petrifying_gaze', name: 'Petrifying Gaze', description: 'Channels the power of deep earth to slowly turn enemies to stone, rendering them permanently immobile.', cooldown: 100, power: 95, element: 'rock' },
  { id: 'world_forge_hammer', name: 'World Forge Hammer', description: 'Summons a hammer of compressed planetary core material that can forge or destroy anything in a single strike.', cooldown: 120, power: 150, element: 'magma' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: HE_ARTIFACTS — 15 Ancient Artifacts
// ═══════════════════════════════════════════════════════════════════

export const HE_ARTIFACTS: readonly HEArtifactDef[] = [
  {
    id: 'stone_of_depths',
    name: 'Stone of Depths',
    description: 'A smooth, warm stone that always points toward the deepest accessible layer. Ancient miners used it to find the richest veins.',
    rarity: 'common',
    bonus: '+10% mining speed in all layers',
    originLayer: 'topsoil_belt',
  },
  {
    id: 'fossilized_compass',
    name: 'Fossilized Compass',
    description: 'A compass encased in amber that points toward the nearest mineral deposit rather than north.',
    rarity: 'uncommon',
    bonus: 'Reveals hidden mineral veins within 50m',
    originLayer: 'sedimentary_shallows',
  },
  {
    id: 'cave_paintings_tablet',
    name: 'Cave Paintings Tablet',
    description: 'A stone tablet covered in prehistoric paintings that depict the migration routes of ancient underground creatures.',
    rarity: 'uncommon',
    bonus: '+15% creature taming chance',
    originLayer: 'sedimentary_shallows',
  },
  {
    id: 'echo_chamber_shell',
    name: 'Echo Chamber Shell',
    description: 'A spiral shell that amplifies sound through rock, allowing communication across vast underground distances.',
    rarity: 'rare',
    bonus: 'Doubles sonar detection range',
    originLayer: 'limestone_grotto',
  },
  {
    id: 'limestone_codex',
    name: 'Limestone Codex',
    description: 'A book carved into limestone pages, containing the lost geological knowledge of an ancient underground civilization.',
    rarity: 'rare',
    bonus: '+20% XP gain from all digging activities',
    originLayer: 'limestone_grotto',
  },
  {
    id: 'granite_guardian_mask',
    name: 'Granite Guardian Mask',
    description: 'A mask carved from granite that lets the wearer see through solid rock as if it were glass.',
    rarity: 'rare',
    bonus: 'Grants true-sight through 5m of rock',
    originLayer: 'granite_undercroft',
  },
  {
    id: 'ancient_miners_pick',
    name: 'Ancient Miner\'s Pick',
    description: 'A pickaxe of unknown metal that never dulls and strikes with the force of a pneumatic drill.',
    rarity: 'epic',
    bonus: '+50% mining speed, ignores rock hardness',
    originLayer: 'granite_undercroft',
  },
  {
    id: 'basalt_war_drums',
    name: 'Basalt War Drums',
    description: 'Drums carved from basalt that produce seismic vibrations when struck, capable of summoning or repelling underground creatures.',
    rarity: 'epic',
    bonus: 'Control seismic events in nearby tunnels',
    originLayer: 'basalt_deep',
  },
  {
    id: 'obsidian_oracle_sphere',
    name: 'Obsidian Oracle Sphere',
    description: 'A perfect sphere of obsidian that reflects visions of upcoming seismic events and mineral discoveries.',
    rarity: 'epic',
    bonus: 'Predicts earthquakes 24 hours in advance',
    originLayer: 'basalt_deep',
  },
  {
    id: 'magma_heart_amulet',
    name: 'Magma Heart Amulet',
    description: 'An amulet containing a perpetually beating heart of solidified magma. Grants immunity to all heat-based damage.',
    rarity: 'epic',
    bonus: 'Complete fire and heat immunity',
    originLayer: 'mantle_fringe',
  },
  {
    id: 'mantle_civilization_key',
    name: 'Mantle Civilization Key',
    description: 'A key of unknown metal that opens sealed doors found throughout the mantle fringe, revealing ancient chambers.',
    rarity: 'legendary',
    bonus: 'Unlocks all sealed ruins in the mantle fringe',
    originLayer: 'mantle_fringe',
  },
  {
    id: 'magma_sea_chart',
    name: 'Magma Sea Chart',
    description: 'A map of the Deep Magma Sea drawn on fireproof parchment, showing safe routes and hidden islands of solid ground.',
    rarity: 'legendary',
    bonus: 'Reveals all safe paths in the Magma Sea',
    originLayer: 'deep_magma_sea',
  },
  {
    id: 'dragon_skull_crown',
    name: 'Dragon Skull Crown',
    description: 'A crown fashioned from the skull of an ancient earth dragon. Commands respect from all underground creatures.',
    rarity: 'legendary',
    bonus: '+100% creature taming success rate',
    originLayer: 'deep_magma_sea',
  },
  {
    id: 'core_crystal_staff',
    name: 'Core Crystal Staff',
    description: 'A staff topped with a crystal from the inner core that channels geothermal energy into powerful spells.',
    rarity: 'legendary',
    bonus: 'Doubles all ability power and halves cooldowns',
    originLayer: 'inner_core_sanctum',
  },
  {
    id: 'world_seed',
    name: 'World Seed',
    description: 'The most powerful artifact in the Hollow Earth, a crystallized seed containing the potential to create new underground worlds. Its full power is unknown.',
    rarity: 'legendary',
    bonus: 'Unknown cosmic power — potentially world-creating',
    originLayer: 'inner_core_sanctum',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: HE_SEISMIC_EVENTS — 12 Seismic Events
// ═══════════════════════════════════════════════════════════════════

export const HE_SEISMIC_EVENTS: readonly HESeismicEventDef[] = [
  {
    id: 'minor_tremor',
    name: 'Minor Tremor',
    description: 'A slight shaking of the earth, barely noticeable but enough to dislodge loose rocks from tunnel ceilings.',
    severity: 1,
    duration: 10,
    effects: ['-5 tunnel integrity', 'dislodges loose minerals'],
  },
  {
    id: 'cave_in',
    name: 'Cave-In',
    description: 'A section of tunnel collapses, blocking passages and potentially trapping miners. Requires immediate excavation to clear.',
    severity: 3,
    duration: 30,
    effects: ['-15 tunnel integrity', 'blocks random tunnel', 'damages structures'],
  },
  {
    id: 'underground_river_flood',
    name: 'Underground River Flood',
    description: 'An underground river overflows its banks, flooding lower tunnels with rushing water. Can wash away equipment and minerals.',
    severity: 4,
    duration: 45,
    effects: ['-20 tunnel integrity', 'floods lower levels', 'loss of unsecured minerals'],
  },
  {
    id: 'gas_eruption',
    name: 'Gas Eruption',
    description: 'A pocket of toxic or explosive gas is breached, filling tunnels with dangerous fumes. Requires ventilation or evacuation.',
    severity: 3,
    duration: 25,
    effects: ['-10 dig energy per turn', 'damages creatures', 'requires evacuation'],
  },
  {
    id: 'magma_intrusion',
    name: 'Magma Intrusion',
    description: 'A stream of magma breaches through a crack in the tunnel wall, slowly flooding the passage with molten rock.',
    severity: 6,
    duration: 60,
    effects: ['-30 tunnel integrity', 'destroys structures in path', 'creates new mineral deposits'],
  },
  {
    id: 'crystal_resonance',
    name: 'Crystal Resonance',
    description: 'Underground crystal formations begin vibrating at a resonant frequency, creating an oppressive hum that disorients all nearby creatures.',
    severity: 2,
    duration: 20,
    effects: ['disorients creatures', 'reveals hidden crystal deposits', '+10% mining speed'],
  },
  {
    id: 'tectonic_shift',
    name: 'Tectonic Shift',
    description: 'A significant tectonic movement that reshapes tunnel layouts, opening new passages while closing old ones.',
    severity: 5,
    duration: 40,
    effects: ['reshuffles tunnel layout', '-25 tunnel integrity', 'reveals new mineral veins'],
  },
  {
    id: 'geyser_eruption',
    name: 'Geyser Eruption',
    description: 'A pressurized geyser of superheated steam erupts from the floor, creating a temporary obstacle and scalding nearby area.',
    severity: 4,
    duration: 35,
    effects: ['-15 tunnel integrity', 'scalds area', 'can be harnessed for energy'],
  },
  {
    id: 'ancient_ruin_collapse',
    name: 'Ancient Ruin Collapse',
    description: 'An ancient underground structure finally gives way under geological pressure, revealing its contents but also releasing trapped energy.',
    severity: 5,
    duration: 50,
    effects: ['reveals hidden artifact chamber', '-20 tunnel integrity', 'releases trapped creatures'],
  },
  {
    id: 'seismic_surge',
    name: 'Seismic Surge',
    description: 'A sustained period of intense seismic activity that threatens to bring down entire tunnel networks.',
    severity: 7,
    duration: 70,
    effects: ['-40 tunnel integrity', 'cascading cave-ins', 'requires full reinforcement'],
  },
  {
    id: 'core_pressure_wave',
    name: 'Core Pressure Wave',
    description: 'A shockwave of pressure from the inner core ripples outward, affecting every layer of the Hollow Earth simultaneously.',
    severity: 8,
    duration: 90,
    effects: ['-50 tunnel integrity globally', 'activates all dormant golems', 'reveals core access points'],
  },
  {
    id: 'world_quake',
    name: 'World Quake',
    description: 'The most devastating seismic event possible, a planetary-scale earthquake that threatens the structural integrity of the entire Hollow Earth.',
    severity: 10,
    duration: 120,
    effects: ['catastrophic tunnel damage', 'awakens legendary creatures', 'reshapes all layers permanently'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: HE_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const HE_ACHIEVEMENTS: readonly HEAchievementDef[] = [
  { id: 'first_dig', name: 'First Dig', description: 'Complete your first dig into the earth beneath the surface.', condition: 'totalDug >= 1', reward: '50 gold, 10 XP' },
  { id: 'ten_digs', name: 'Seasoned Excavator', description: 'Dig into 10 different earth layers.', condition: 'totalDug >= 10', reward: '200 gold, 50 XP' },
  { id: 'fifty_digs', name: 'Master Miner', description: 'Complete 50 digs across all layers.', condition: 'totalDug >= 50', reward: '800 gold, 200 XP' },
  { id: 'hundred_digs', name: 'Earth Legend', description: 'Complete 100 digs. The earth knows your name.', condition: 'totalDug >= 100', reward: '2000 gold, 500 XP' },
  { id: 'mineral_collector_5', name: 'Rockhound', description: 'Mine 5 different mineral types.', condition: 'uniqueMinerals >= 5', reward: '100 gold, 25 XP' },
  { id: 'mineral_collector_15', name: 'Gem Specialist', description: 'Mine 15 different mineral types.', condition: 'uniqueMinerals >= 15', reward: '400 gold, 100 XP' },
  { id: 'mineral_collector_30', name: 'Master Geologist', description: 'Mine all 30 mineral types.', condition: 'uniqueMinerals >= 30', reward: '3000 gold, 750 XP' },
  { id: 'creature_tamer_5', name: 'Creature Friend', description: 'Tame 5 different underground creatures.', condition: 'uniqueCreatures >= 5', reward: '150 gold, 40 XP' },
  { id: 'creature_tamer_20', name: 'Creature Whisperer', description: 'Tame 20 different underground creatures.', condition: 'uniqueCreatures >= 20', reward: '600 gold, 150 XP' },
  { id: 'cavern_builder_5', name: 'Cavern Architect', description: 'Build 5 different cavern structures.', condition: 'uniqueCaverns >= 5', reward: '200 gold, 50 XP' },
  { id: 'cavern_builder_15', name: 'Underground City Planner', description: 'Build 15 different cavern structures.', condition: 'uniqueCaverns >= 15', reward: '1000 gold, 250 XP' },
  { id: 'first_artifact', name: 'Relic Finder', description: 'Discover your first ancient artifact.', condition: 'totalArtifacts >= 1', reward: '300 gold, 75 XP' },
  { id: 'ten_artifacts', name: 'Artifact Hunter', description: 'Discover 10 ancient artifacts.', condition: 'totalArtifacts >= 10', reward: '1500 gold, 400 XP' },
  { id: 'all_artifacts', name: 'Curator of the Deep', description: 'Discover all 15 ancient artifacts.', condition: 'totalArtifacts >= 15', reward: '5000 gold, 1500 XP' },
  { id: 'survive_earthquake', name: 'Earthquake Survivor', description: 'Survive a seismic event with severity 5 or higher.', condition: 'survivedSevereQuake >= 1', reward: '500 gold, 125 XP' },
  { id: 'depth_1000', name: 'Deep Explorer', description: 'Reach a depth of 1,000 meters.', condition: 'maxDepth >= 1000', reward: '400 gold, 100 XP' },
  { id: 'depth_3500', name: 'Abyss Diver', description: 'Reach a depth of 3,500 meters into the Magma Sea.', condition: 'maxDepth >= 3500', reward: '1500 gold, 400 XP' },
  { id: 'reach_core', name: 'Core Emperor', description: 'Reach the Inner Core Sanctum, the heart of the Hollow Earth.', condition: 'maxDepth >= 5000', reward: '5000 gold, 2000 XP' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: HE_TITLES — 8 Titles (Surface Scout → Core Emperor)
// ═══════════════════════════════════════════════════════════════════

export const HE_TITLES: readonly HETitleDef[] = [
  { id: 'title_surface_scout', name: 'Surface Scout', description: 'A newcomer to the underground world, just beginning to scratch the surface of what lies beneath.', requiredLevel: 1, requiredDepth: 0 },
  { id: 'title_tunnel_digger', name: 'Tunnel Digger', description: 'An experienced digger who has carved their first permanent passages through solid rock.', requiredLevel: 5, requiredDepth: 50 },
  { id: 'title_cavern_explorer', name: 'Cavern Explorer', description: 'A bold explorer who has ventured into the natural cave systems and returned with tales of wonder.', requiredLevel: 10, requiredDepth: 200 },
  { id: 'title_rock_breaker', name: 'Rock Breaker', description: 'A powerful miner capable of shattering granite with bare hands and determination.', requiredLevel: 18, requiredDepth: 500 },
  { id: 'title_depth_delver', name: 'Depth Delver', description: 'An adventurer who has descended into depths where no natural light has ever reached.', requiredLevel: 25, requiredDepth: 1000 },
  { id: 'title_magma_walker', name: 'Magma Walker', description: 'One who walks alongside rivers of liquid fire, unburned and unafraid.', requiredLevel: 33, requiredDepth: 2000 },
  { id: 'title_earth_sovereign', name: 'Earth Sovereign', description: 'A master of the underground realm, commanding creatures, structures, and minerals alike.', requiredLevel: 42, requiredDepth: 3500 },
  { id: 'title_core_emperor', name: 'Core Emperor', description: 'The supreme ruler of the Hollow Earth, one who has touched the heart of the planet and returned transformed.', requiredLevel: 50, requiredDepth: 5000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: ACHIEVEMENT CONDITION CHECKER
// ═══════════════════════════════════════════════════════════════════

function heCheckAchievementCondition(state: HEStoreState, achievementId: string): boolean {
  const uniqueMinerals = Object.keys(state.minedMinerals).filter(
    (k) => state.minedMinerals[k] > 0
  ).length
  const uniqueCreatures = new Set(state.creatures.map((c) => c.creatureDefId)).size
  const uniqueCaverns = new Set(state.caverns.map((c) => c.cavernDefId)).size

  const activeLayer = HE_LAYERS.find((l) => l.id === state.activeLayerId)
  const maxDepth = activeLayer ? activeLayer.depthMax : 0

  switch (achievementId) {
    case 'first_dig': return state.totalDug >= 1
    case 'ten_digs': return state.totalDug >= 10
    case 'fifty_digs': return state.totalDug >= 50
    case 'hundred_digs': return state.totalDug >= 100
    case 'mineral_collector_5': return uniqueMinerals >= 5
    case 'mineral_collector_15': return uniqueMinerals >= 15
    case 'mineral_collector_30': return uniqueMinerals >= 30
    case 'creature_tamer_5': return uniqueCreatures >= 5
    case 'creature_tamer_20': return uniqueCreatures >= 20
    case 'cavern_builder_5': return uniqueCaverns >= 5
    case 'cavern_builder_15': return uniqueCaverns >= 15
    case 'first_artifact': return state.artifacts.length >= 1
    case 'ten_artifacts': return state.artifacts.length >= 10
    case 'all_artifacts': return state.artifacts.length >= 15
    case 'survive_earthquake': return false // tracked externally
    case 'depth_1000': return maxDepth >= 1000
    case 'depth_3500': return maxDepth >= 3500
    case 'reach_core': return maxDepth >= 5000
    default: return false
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const useHEStore = create<HEFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      dugLayers: [] as string[],
      minedMinerals: {} as Record<string, number>,
      creatures: [] as HECreatureInstance[],
      caverns: [] as HECavernInstance[],
      abilities: [] as string[],
      artifacts: [] as string[],
      achievements: [] as string[],
      currentTitle: 'title_surface_scout',
      earthLevel: 1,
      earthExp: 0,
      gold: HE_INITIAL_GOLD,
      digEnergy: HE_INITIAL_ENERGY,
      totalMined: 0,
      totalTamed: 0,
      totalDug: 0,
      totalArtifacts: 0,
      activeLayerId: null,
      activeEventId: null,
      eventTimer: 0,
      tunnelIntegrity: 100,

      // ── digLayer ──────────────────────────────────────────────
      digLayer: (layerId: string): boolean => {
        const state = get()
        const layer = HE_LAYERS.find((l) => l.id === layerId)
        if (!layer) return false
        if (state.dugLayers.includes(layerId)) return false
        if (state.earthLevel < layer.minLevel) return false
        if (state.digEnergy < 5) return false

        set((prev) => {
          const newXp = prev.earthExp + layer.dangerLevel * 15
          const newLevel = heLevelFromXp(newXp)
          return {
            dugLayers: [...prev.dugLayers, layerId],
            activeLayerId: layerId,
            digEnergy: Math.max(0, prev.digEnergy - 5),
            earthExp: newXp,
            earthLevel: newLevel,
            totalDug: prev.totalDug + 1,
          }
        })
        return true
      },

      // ── mineMineral ───────────────────────────────────────────
      mineMineral: (mineralId: string): number => {
        const state = get()
        const mineral = HE_MINERALS.find((m) => m.id === mineralId)
        if (!mineral) return 0
        if (state.digEnergy < 3) return 0

        const quantity = mineral.rarity === 'common' ? 3 : mineral.rarity === 'uncommon' ? 2 : 1
        set((prev) => ({
          minedMinerals: {
            ...prev.minedMinerals,
            [mineralId]: (prev.minedMinerals[mineralId] || 0) + quantity,
          },
          digEnergy: Math.max(0, prev.digEnergy - 3),
          totalMined: prev.totalMined + quantity,
          gold: prev.gold + mineral.value * quantity,
        }))
        return quantity
      },

      // ── buildCavern ───────────────────────────────────────────
      buildCavern: (cavernDefId: string): boolean => {
        const state = get()
        const def = HE_CAVERNS.find((c) => c.id === cavernDefId)
        if (!def) return false
        const alreadyBuilt = state.caverns.some((c) => c.cavernDefId === cavernDefId)
        if (alreadyBuilt) return false
        if (state.gold < def.baseCost) return false

        set((prev) => ({
          caverns: [
            ...prev.caverns,
            {
              id: heGenerateId(),
              cavernDefId: cavernDefId,
              level: 1,
              built: true,
            },
          ],
          gold: prev.gold - def.baseCost,
        }))
        return true
      },

      // ── upgradeCavern ─────────────────────────────────────────
      upgradeCavern: (cavernId: string): boolean => {
        const state = get()
        const cavern = state.caverns.find((c) => c.id === cavernId)
        if (!cavern) return false
        if (cavern.level >= 10) return false
        const def = HE_CAVERNS.find((d) => d.id === cavern.cavernDefId)
        if (!def) return false

        const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, cavern.level))
        if (state.gold < cost) return false

        set((prev) => ({
          caverns: prev.caverns.map((c) =>
            c.id === cavernId ? { ...c, level: c.level + 1 } : c
          ),
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── demolishCavern ────────────────────────────────────────
      demolishCavern: (cavernId: string): boolean => {
        const state = get()
        const cavern = state.caverns.find((c) => c.id === cavernId)
        if (!cavern) return false

        set((prev) => ({
          caverns: prev.caverns.filter((c) => c.id !== cavernId),
          gold: prev.gold + 50,
        }))
        return true
      },

      // ── useAbility ────────────────────────────────────────────
      useAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = HE_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (state.digEnergy < ability.power / 5) return false

        const energyCost = Math.ceil(ability.power / 5)
        if (!state.abilities.includes(abilityId)) {
          set((prev) => ({
            abilities: [...prev.abilities, abilityId],
            digEnergy: Math.max(0, prev.digEnergy - energyCost),
            gold: prev.gold + ability.power * 2,
          }))
          return true
        }

        set((prev) => ({
          digEnergy: Math.max(0, prev.digEnergy - energyCost),
          gold: prev.gold + ability.power,
        }))
        return true
      },

      // ── handleSeismicEvent ────────────────────────────────────
      handleSeismicEvent: (eventId: string): boolean => {
        const state = get()
        const event = HE_SEISMIC_EVENTS.find((e) => e.id === eventId)
        if (!event) return false
        if (state.tunnelIntegrity <= 0) return false

        set((prev) => {
          const integrityLoss = event.severity * 5
          const newIntegrity = Math.max(0, prev.tunnelIntegrity - integrityLoss)
          const goldReward = event.severity * 30
          return {
            activeEventId: eventId,
            eventTimer: event.duration,
            tunnelIntegrity: newIntegrity,
            gold: prev.gold + goldReward,
            digEnergy: Math.max(0, prev.digEnergy - event.severity * 2),
          }
        })
        return true
      },

      // ── discoverArtifact ──────────────────────────────────────
      discoverArtifact: (artifactId: string): boolean => {
        const state = get()
        const artifact = HE_ARTIFACTS.find((a) => a.id === artifactId)
        if (!artifact) return false
        if (state.artifacts.includes(artifactId)) return false
        if (state.digEnergy < 10) return false

        const rarityGold = {
          common: 100,
          uncommon: 250,
          rare: 500,
          epic: 1200,
          legendary: 3000,
        }
        set((prev) => ({
          artifacts: [...prev.artifacts, artifactId],
          digEnergy: Math.max(0, prev.digEnergy - 10),
          gold: prev.gold + rarityGold[artifact.rarity],
          totalArtifacts: prev.totalArtifacts + 1,
          earthExp: prev.earthExp + Math.floor(heRarityPower(artifact.rarity) * 50),
        }))
        return true
      },

      // ── tameCreature ──────────────────────────────────────────
      tameCreature: (creatureId: string): boolean => {
        const state = get()
        const def = HE_CREATURES.find((c) => c.id === creatureId)
        if (!def) return false
        if (state.digEnergy < 12) return false

        const cost = Math.floor(40 * heRarityPower(def.rarity))
        if (state.gold < cost) return false

        const baseHP = Math.floor(def.basePower * 2.5)
        set((prev) => ({
          creatures: [
            ...prev.creatures,
            {
              id: heGenerateId(),
              creatureDefId: creatureId,
              name: def.name,
              level: 1,
              currentHP: baseHP,
              maxHP: baseHP,
              attack: Math.floor(def.basePower * 0.6),
              defense: Math.floor(def.basePower * 0.4),
              tamedCount: 0,
              acquiredAt: Date.now(),
            },
          ],
          gold: prev.gold - cost,
          digEnergy: Math.max(0, prev.digEnergy - 12),
          totalTamed: prev.totalTamed + 1,
        }))
        return true
      },

      // ── releaseCreature ───────────────────────────────────────
      releaseCreature: (instanceId: string): boolean => {
        const state = get()
        const creature = state.creatures.find((c) => c.id === instanceId)
        if (!creature) return false

        set((prev) => ({
          creatures: prev.creatures.filter((c) => c.id !== instanceId),
          digEnergy: Math.min(HE_MAX_ENERGY, prev.digEnergy + 5),
        }))
        return true
      },

      // ── trainCreature ─────────────────────────────────────────
      trainCreature: (instanceId: string): boolean => {
        const state = get()
        const creature = state.creatures.find((c) => c.id === instanceId)
        if (!creature) return false
        if (creature.level >= 50) return false
        if (state.gold < 20) return false

        set((prev) => ({
          creatures: prev.creatures.map((c) => {
            if (c.id !== instanceId) return c
            const newLevel = c.level + 1
            const hpGain = Math.floor(5 * (1 + newLevel * 0.1))
            const atkGain = Math.floor(2 * (1 + newLevel * 0.05))
            const defGain = Math.floor(1.5 * (1 + newLevel * 0.05))
            return {
              ...c,
              level: newLevel,
              currentHP: c.maxHP + hpGain,
              maxHP: c.maxHP + hpGain,
              attack: c.attack + atkGain,
              defense: c.defense + defGain,
              tamedCount: c.tamedCount + 1,
            }
          }),
          gold: prev.gold - 20,
        }))
        return true
      },

      // ── excavateRuin ──────────────────────────────────────────
      excavateRuin: (layerId: string): boolean => {
        const state = get()
        const layer = HE_LAYERS.find((l) => l.id === layerId)
        if (!layer) return false
        if (!state.dugLayers.includes(layerId)) return false
        if (state.digEnergy < 20) return false

        set((prev) => {
          const xpGain = layer.dangerLevel * 25
          const newXp = prev.earthExp + xpGain
          const newLevel = heLevelFromXp(newXp)
          return {
            digEnergy: Math.max(0, prev.digEnergy - 20),
            earthExp: newXp,
            earthLevel: newLevel,
            gold: prev.gold + layer.dangerLevel * 50,
          }
        })
        return true
      },

      // ── activateGeyser ────────────────────────────────────────
      activateGeyser: (layerId: string): boolean => {
        const state = get()
        const layer = HE_LAYERS.find((l) => l.id === layerId)
        if (!layer) return false
        if (!state.dugLayers.includes(layerId)) return false
        if (state.digEnergy < 8) return false

        set((prev) => ({
          digEnergy: Math.min(HE_MAX_ENERGY, prev.digEnergy + 30),
          tunnelIntegrity: Math.min(100, prev.tunnelIntegrity + 5),
          gold: prev.gold - 10,
          earthExp: prev.earthExp + layer.dangerLevel * 10,
        }))
        return true
      },

      // ── reinforceTunnel ───────────────────────────────────────
      reinforceTunnel: (): boolean => {
        const state = get()
        if (state.gold < 30) return false
        if (state.tunnelIntegrity >= 100) return false

        set((prev) => ({
          tunnelIntegrity: Math.min(100, prev.tunnelIntegrity + 15),
          gold: prev.gold - 30,
        }))
        return true
      },

      // ── fleeEvent ─────────────────────────────────────────────
      fleeEvent: (): void => {
        set((prev) => ({
          activeEventId: null,
          eventTimer: 0,
          tunnelIntegrity: Math.max(0, prev.tunnelIntegrity - 10),
        }))
      },

      // ── unlockTitle ───────────────────────────────────────────
      unlockTitle: (titleId: string): boolean => {
        const state = get()
        const title = HE_TITLES.find((t) => t.id === titleId)
        if (!title) return false
        if (state.earthLevel < title.requiredLevel) return false

        const activeLayer = HE_LAYERS.find((l) => l.id === state.activeLayerId)
        const currentDepth = activeLayer ? activeLayer.depthMax : 0
        if (currentDepth < title.requiredDepth) return false

        set((prev) => ({
          currentTitle: titleId,
        }))
        return true
      },

      // ── claimAchievement ──────────────────────────────────────
      claimAchievement: (achievementId: string): boolean => {
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!heCheckAchievementCondition(state, achievementId)) return false

        const achievement = HE_ACHIEVEMENTS.find((a) => a.id === achievementId)
        if (!achievement) return false

        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + 200,
          earthExp: prev.earthExp + 100,
        }))
        return true
      },
    }),
    {
      name: 'hollow-earth-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: DEFAULT EXPORT HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useHollowEarth() {
  const store = useHEStore()

  // ── Getter: Layer Details ────────────────────────────────────
  const heGetLayerDetails = useMemo(() => {
    return HE_LAYERS.map((layer) => ({
      ...layer,
      dug: store.dugLayers.includes(layer.id),
      unlocked: store.earthLevel >= layer.minLevel,
      availableMinerals: layer.resources
        .map((rId) => HE_MINERALS.find((m) => m.id === rId))
        .filter(Boolean) as typeof HE_MINERALS,
    }))
  }, [store])

  // ── Getter: Mineral Inventory ────────────────────────────────
  const heGetMineralInventory = useMemo(() => {
    return HE_MINERALS.map((mat) => ({
      ...mat,
      owned: store.minedMinerals[mat.id] || 0,
      rarityColor: heGetRarityColor(mat.rarity),
    }))
  }, [store])

  // ── Getter: Owned Creatures ──────────────────────────────────
  const heGetOwnedCreatures = useMemo(() => {
    return store.creatures.map((c) => {
      const def = HE_CREATURES.find((d) => d.id === c.creatureDefId)
      return {
        ...c,
        def,
        speciesColor: def ? heGetSpeciesColor(def.species) : HE_COLOR_EARTH_BROWN,
        rarityColor: def ? heGetRarityColor(def.rarity) : '#9CA3AF',
        totalPower: Math.floor((c.attack + c.defense) * (1 + c.level * 0.12)),
      }
    })
  }, [store])

  // ── Getter: Cavern List ──────────────────────────────────────
  const heGetCavernList = useMemo(() => {
    return store.caverns.map((c) => {
      const def = HE_CAVERNS.find((d) => d.id === c.cavernDefId)
      return {
        ...c,
        def,
        upgradeCost: def
          ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, c.level))
          : 0,
        maxed: c.level >= 10,
      }
    })
  }, [store])

  // ── Getter: Total Power ──────────────────────────────────────
  const heGetTotalPower = useMemo(() => {
    let creaturePower = 0
    for (const c of store.creatures) {
      const def = HE_CREATURES.find((d) => d.id === c.creatureDefId)
      if (!def) continue
      const rarityMult = heRarityPower(def.rarity)
      creaturePower += Math.floor(
        (c.attack + c.defense) * rarityMult * (1 + c.level * 0.12)
      )
    }
    const cavernPower = store.caverns.reduce(
      (sum, c) => sum + c.level * 15,
      0
    )
    return { creaturePower, cavernPower, total: creaturePower + cavernPower }
  }, [store])

  // ── Getter: Tunnel Status ────────────────────────────────────
  const heGetTunnelStatus = useMemo(() => {
    const integrityPercent = store.tunnelIntegrity
    return {
      integrity: store.tunnelIntegrity,
      maxIntegrity: 100,
      percent: integrityPercent,
      status: integrityPercent >= 80 ? 'stable' : integrityPercent >= 50 ? 'damaged' : integrityPercent >= 20 ? 'critical' : 'collapsing',
      needsRepair: integrityPercent < 80,
      isCollapsing: integrityPercent < 20,
    }
  }, [store.tunnelIntegrity])

  // ── Getter: Event Status ─────────────────────────────────────
  const heGetEventStatus = useMemo(() => {
    if (!store.activeEventId) return { active: false, event: null, timer: 0 }
    const event = HE_SEISMIC_EVENTS.find((e) => e.id === store.activeEventId)
    return {
      active: true,
      event: event || null,
      timer: store.eventTimer,
      severity: event ? event.severity : 0,
    }
  }, [store.activeEventId, store.eventTimer])

  // ── Getter: Active Event ─────────────────────────────────────
  const heGetActiveEvent = useMemo(() => {
    if (!store.activeEventId) return null
    return HE_SEISMIC_EVENTS.find((e) => e.id === store.activeEventId) || null
  }, [store.activeEventId])

  // ── Getter: Next Title ───────────────────────────────────────
  const heGetNextTitle = useMemo(() => {
    const currentTitle = HE_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitle
      ? HE_TITLES.indexOf(currentTitle)
      : -1
    if (currentIndex >= HE_TITLES.length - 1) return null
    return HE_TITLES[currentIndex + 1]
  }, [store.currentTitle])

  // ── Getter: Rarity Summary ──────────────────────────────────
  const heGetRaritySummary = useMemo(() => {
    const summary: Record<HERarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const c of store.creatures) {
      const def = HE_CREATURES.find((d) => d.id === c.creatureDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const aId of store.artifacts) {
      const def = HE_ARTIFACTS.find((d) => d.id === aId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Layer Summary ────────────────────────────────────
  const heGetLayerSummary = useMemo(() => {
    const totalLayers = HE_LAYERS.length
    const dug = store.dugLayers.length
    return {
      totalLayers,
      dug,
      percent: Math.floor((dug / totalLayers) * 100),
      allDug: dug >= totalLayers,
    }
  }, [store.dugLayers])

  // ── Getter: Unlocked Achievements ────────────────────────────
  const heGetUnlockedAchievements = useMemo(() => {
    const unlocked: HEAchievementDef[] = []
    const claimable: HEAchievementDef[] = []

    for (const ach of HE_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      } else if (heCheckAchievementCondition(store, ach.id)) {
        claimable.push(ach)
      }
    }

    return { unlocked, claimable, total: HE_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ───────────────────────────────────
  const heGetTitleProgress = useMemo(() => {
    const activeLayer = HE_LAYERS.find((l) => l.id === store.activeLayerId)
    const currentDepth = activeLayer ? activeLayer.depthMax : 0

    return HE_TITLES.map((title) => ({
      ...title,
      unlocked: store.earthLevel >= title.requiredLevel && currentDepth >= title.requiredDepth,
      active: store.currentTitle === title.id,
      levelMet: store.earthLevel >= title.requiredLevel,
      depthMet: currentDepth >= title.requiredDepth,
    }))
  }, [store.currentTitle, store.earthLevel, store.activeLayerId])

  // ── Getter: Artifact Collection ──────────────────────────────
  const heGetArtifactCollection = useMemo(() => {
    return HE_ARTIFACTS.map((artifact) => ({
      ...artifact,
      discovered: store.artifacts.includes(artifact.id),
      rarityColor: heGetRarityColor(artifact.rarity),
      layerName: HE_LAYERS.find((l) => l.id === artifact.originLayer)?.name || 'Unknown',
    }))
  }, [store.artifacts])

  // ── Level Progress ───────────────────────────────────────────
  const heLevelProgress = useMemo(() => {
    const current = heXpForLevel(store.earthLevel)
    return {
      level: store.earthLevel,
      currentXp: store.earthExp,
      xpToNext: current,
      maxLevel: store.earthLevel >= HE_MAX_LEVEL,
      progressPercent:
        current > 0 ? Math.min(100, Math.floor((store.earthExp / current) * 100)) : 0,
    }
  }, [store.earthLevel, store.earthExp])

  // ── Getter: Depth Progress ───────────────────────────────────
  const heGetDepthProgress = useMemo(() => {
    const activeLayer = HE_LAYERS.find((l) => l.id === store.activeLayerId)
    const currentDepth = activeLayer ? activeLayer.depthMax : 0
    const maxPossibleDepth = 6371 // Earth's radius in km
    return {
      currentDepth,
      maxDepth: maxPossibleDepth,
      percent: Math.floor((currentDepth / maxPossibleDepth) * 100),
      layerName: activeLayer ? activeLayer.name : 'Surface',
      layerId: store.activeLayerId,
    }
  }, [store.activeLayerId])

  // ── Getter: Unlocked Abilities ───────────────────────────────
  const heGetUnlockedAbilities = useMemo(() => {
    return HE_ABILITIES.map((ability) => ({
      ...ability,
      unlocked: store.abilities.includes(ability.id),
      elementColor: heGetElementColor(ability.element),
    }))
  }, [store.abilities])

  // ── Assemble heAPI ───────────────────────────────────────────
  const heAPI = {
    // Constants
    HE_LAYERS,
    HE_CREATURES,
    HE_MINERALS,
    HE_CAVERNS,
    HE_ABILITIES,
    HE_ARTIFACTS,
    HE_SEISMIC_EVENTS,
    HE_ACHIEVEMENTS,
    HE_TITLES,
    HE_COLOR_EARTH_BROWN,
    HE_COLOR_CRYSTAL_AMBER,
    HE_COLOR_LAVA_ORANGE,
    HE_COLOR_CAVERN_GRAY,
    HE_COLOR_GEMSTONE_EMERALD,
    HE_COLOR_OBSIDIAN_BLACK,
    HE_COLOR_MAGMA_RED,
    HE_COLOR_STALACTITE_WHITE,
    HE_SPECIES_LORE,
    HE_LAYER_AMBIENT_TEMPS,
    HE_LAYER_PRESSURE_ATM,

    // State
    dugLayers: store.dugLayers,
    minedMinerals: store.minedMinerals,
    creatures: store.creatures,
    caverns: store.caverns,
    abilities: store.abilities,
    artifacts: store.artifacts,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    earthLevel: store.earthLevel,
    earthExp: store.earthExp,
    gold: store.gold,
    digEnergy: store.digEnergy,
    totalMined: store.totalMined,
    totalTamed: store.totalTamed,
    totalDug: store.totalDug,
    totalArtifacts: store.totalArtifacts,
    activeLayerId: store.activeLayerId,
    activeEventId: store.activeEventId,
    eventTimer: store.eventTimer,
    tunnelIntegrity: store.tunnelIntegrity,

    // Actions
    digLayer: store.digLayer,
    mineMineral: store.mineMineral,
    buildCavern: store.buildCavern,
    upgradeCavern: store.upgradeCavern,
    demolishCavern: store.demolishCavern,
    useAbility: store.useAbility,
    handleSeismicEvent: store.handleSeismicEvent,
    discoverArtifact: store.discoverArtifact,
    tameCreature: store.tameCreature,
    releaseCreature: store.releaseCreature,
    trainCreature: store.trainCreature,
    excavateRuin: store.excavateRuin,
    activateGeyser: store.activateGeyser,
    reinforceTunnel: store.reinforceTunnel,
    fleeEvent: store.fleeEvent,
    unlockTitle: store.unlockTitle,
    claimAchievement: store.claimAchievement,

    // Getters
    heGetLayerDetails,
    heGetMineralInventory,
    heGetOwnedCreatures,
    heGetCavernList,
    heGetTotalPower,
    heGetTunnelStatus,
    heGetEventStatus,
    heGetActiveEvent,
    heGetNextTitle,
    heGetRaritySummary,
    heGetLayerSummary,
    heGetUnlockedAchievements,
    heGetTitleProgress,
    heGetArtifactCollection,
    heGetDepthProgress,
    heGetUnlockedAbilities,
    heLevelProgress,
  }

  return heAPI
}

// ─── Element Color Helper ────────────────────────────────────────

function heGetElementColor(element: HEElement): string {
  switch (element) {
    case 'earth': return HE_COLOR_EARTH_BROWN
    case 'rock': return HE_COLOR_CAVERN_GRAY
    case 'crystal': return HE_COLOR_CRYSTAL_AMBER
    case 'lava': return HE_COLOR_LAVA_ORANGE
    case 'magma': return HE_COLOR_MAGMA_RED
    case 'obsidian': return HE_COLOR_OBSIDIAN_BLACK
    case 'mineral': return HE_COLOR_GEMSTONE_EMERALD
    case 'steam': return HE_COLOR_STALACTITE_WHITE
  }
}
