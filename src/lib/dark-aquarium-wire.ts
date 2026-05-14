/**
 * Dark Aquarium Wire — 深海水族馆 feature module for Word Snake
 *
 * A deep-sea aquarium exploration and management mini-game: collect 35 deep sea
 * creatures across 5 rarity tiers, manage 8 aquarium tanks, gather 30 aquatic
 * materials, place 25 tank decorations, wield 22 aquatic abilities, earn 8
 * deep titles, gather 15 rare specimens, and survive 12 tank events — backed
 * by a Zustand store with persist middleware.
 *
 * Storage key: dark-aquarium-wire
 * Prefix: da / DA_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type DARarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type DASpecies = 'Abyssal' | 'Trench' | 'Bioluminescent' | 'Volcanic Vent' | 'Frozen Deep' | 'Coral Crypt' | 'Kelp Forest'

export interface DACreatureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly species: DASpecies
  readonly rarity: DARarity
  readonly basePower: number
  readonly ability: string
}

export interface DATankDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
}

export interface DAMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: DARarity
  readonly source: string
  readonly value: number
}

export interface DADecorationDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
}

export interface DAAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly species: DASpecies
}

export interface DAAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface DATitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredTanks: number
}

export interface DASpecimenDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: DARarity
  readonly powerBonus: number
  readonly specialAbility: string
}

export interface DAEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface DAAquariumCreature {
  readonly id: string
  creatureDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  fed: boolean
  lastFedAt: number | null
  acquiredAt: number
}

export interface DAOwnedDecoration {
  readonly id: string
  decorationDefId: string
  level: number
  placed: boolean
}

export interface DATankState {
  health: number
  maxHealth: number
  pollution: number
  lastCleanedAt: number | null
  lightingLevel: number
  filterInstalled: boolean
}

export interface DAStoreState {
  aquariumCreatures: DAAquariumCreature[]
  collectedMaterials: Record<string, number>
  decorations: DAOwnedDecoration[]
  achievements: string[]
  currentTitle: string
  collectedSpecimens: string[]
  unlockedTanks: string[]
  aquaristLevel: number
  aquaristExp: number
  pearls: number
  bioEnergy: number
  totalCreaturesAdded: number
  totalFed: number
  totalUpgraded: number
  totalBred: number
  totalCollected: number
  activeEventId: string | null
  eventTimer: number
  tank: DATankState
  activeTankId: string | null
}

export interface DAStoreActions {
  daAddCreature: (creatureId: string) => boolean
  daFeedFish: (creatureId: string) => boolean
  daUpgradeTank: (tankId: string) => boolean
  daUseAbility: (abilityId: string) => boolean
  daHandleTankEvent: (eventId: string) => boolean
  daCollectSpecimen: (specimenId: string) => boolean
  daBreedCreature: (parentA: string, parentB: string) => boolean
  daCleanTank: () => boolean
  daAdjustLighting: (level: number) => boolean
  daInstallFilter: () => boolean
}

export type DAFullStore = DAStoreState & DAStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const DA_COLOR_DEEP_NAVY: string = '#0A1628'
export const DA_COLOR_BIOLUM_CYAN: string = '#00E5FF'
export const DA_COLOR_ABYSSAL_BLACK: string = '#050A12'
export const DA_COLOR_CORAL_PINK: string = '#FF6B9D'
export const DA_COLOR_KELP_GREEN: string = '#2ECC71'
export const DA_COLOR_SAND_BEIGE: string = '#F5DEB3'
export const DA_COLOR_PEARL_WHITE: string = '#F0EAD6'
export const DA_COLOR_MAGMA_ORANGE: string = '#FF6F00'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const DA_MAX_LEVEL = 50
const DA_INITIAL_PEARLS = 500
const DA_INITIAL_ENERGY = 100

function daXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= DA_MAX_LEVEL) return Infinity
  return Math.floor(90 * Math.pow(1.14, level) + level * 18)
}

function daLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < DA_MAX_LEVEL) {
    const needed = daXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function daGenerateId(): string {
  return `da_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function daRarityMultiplier(rarity: DARarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function daSpeciesColor(species: DASpecies): string {
  switch (species) {
    case 'Abyssal': return DA_COLOR_ABYSSAL_BLACK
    case 'Trench': return DA_COLOR_DEEP_NAVY
    case 'Bioluminescent': return DA_COLOR_BIOLUM_CYAN
    case 'Volcanic Vent': return DA_COLOR_MAGMA_ORANGE
    case 'Frozen Deep': return DA_COLOR_PEARL_WHITE
    case 'Coral Crypt': return DA_COLOR_CORAL_PINK
    case 'Kelp Forest': return DA_COLOR_KELP_GREEN
  }
}

function daRarityColor(rarity: DARarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#818CF8'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: SPECIES BONUSES & CAPTURE CHANCES
// ═══════════════════════════════════════════════════════════════════

const DA_SPECIES_BONUSES: Record<DASpecies, { defense: number; speed: number; biolumBonus: number }> = {
  Abyssal: { defense: 15, speed: 5, biolumBonus: 0 },
  Trench: { defense: 5, speed: 10, biolumBonus: 20 },
  Bioluminescent: { defense: 20, speed: 0, biolumBonus: 5 },
  'Volcanic Vent': { defense: 10, speed: 15, biolumBonus: 0 },
  'Frozen Deep': { defense: 5, speed: 20, biolumBonus: 10 },
  'Coral Crypt': { defense: 10, speed: 5, biolumBonus: 25 },
  'Kelp Forest': { defense: 25, speed: 0, biolumBonus: 0 },
}

const DA_CAPTURE_CHANCES: Record<DARarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
}

const DA_TANK_SPECIES_BONUS: Record<string, DASpecies[]> = {
  tide_pool_tank: ['Kelp Forest', 'Coral Crypt'],
  shallow_reef: ['Coral Crypt', 'Bioluminescent'],
  twilight_zone: ['Bioluminescent', 'Trench'],
  midnight_abyss: ['Trench', 'Abyssal'],
  hydrothermal_lab: ['Volcanic Vent', 'Trench'],
  frozen_depths: ['Frozen Deep', 'Abyssal'],
  coral_crypt_vault: ['Coral Crypt', 'Kelp Forest'],
  hadal_sanctuary: ['Abyssal', 'Trench', 'Bioluminescent', 'Volcanic Vent', 'Frozen Deep', 'Coral Crypt', 'Kelp Forest'],
}

function daGetSpeciesBonus(species: DASpecies): { defense: number; speed: number; biolumBonus: number } {
  return DA_SPECIES_BONUSES[species]
}

function daGetCaptureChance(rarity: DARarity, activeTankId: string | null): number {
  let chance = DA_CAPTURE_CHANCES[rarity]
  if (activeTankId) {
    const bonusSpecies = DA_TANK_SPECIES_BONUS[activeTankId]
    if (bonusSpecies && bonusSpecies.length > 2) {
      chance = chance * 1.5
    }
  }
  return Math.min(100, Math.floor(chance))
}

function daGetBreedBonus(level: number, breedCount: number): number {
  return Math.floor(level * 15 * (1 + breedCount * 0.3))
}

function daGetDecorationBonus(decorationId: string, level: number): number {
  switch (decorationId) {
    case 'coral_arch': return level * 2
    case 'deep_rock_formation': return level * 5
    case 'biolum_cluster': return level * 8
    case 'volcanic_bubbler': return level * 12
    case 'hadal_obelisk': return level * 20
    case 'kelp_bed': return level * 3
    case 'pearl_altar': return level * 7
    case 'abyssal_throne': return level * 15
    default: return level * 2
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: DA_FISH — 35 Deep Sea Creatures (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const DA_FISH: readonly DACreatureDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'glow_minnow',
    name: 'Glow Minnow',
    description:
      'A tiny translucent fish that emits a faint bioluminescent pulse when startled. Schools of glow minnows create mesmerizing light shows in shallow reef waters, guiding divers through darkened coral tunnels at night.',
    species: 'Bioluminescent',
    rarity: 'common',
    basePower: 15,
    ability: 'Pulse Glow',
  },
  {
    id: 'kelp_guppy',
    name: 'Kelp Guppy',
    description:
      'A hardy little fish perfectly adapted to life among swaying kelp fronds. Its green coloring provides natural camouflage, and it can anchor itself to kelp stalks with specialized pelvic fins during strong currents.',
    species: 'Kelp Forest',
    rarity: 'common',
    basePower: 18,
    ability: 'Kelp Anchor',
  },
  {
    id: 'tidepool_blenny',
    name: 'Tidepool Blenny',
    description:
      'A resourceful little fish that inhabits the tiny pools left behind by receding tides. It can survive out of water for short periods and uses its googly eyes to spot both predators and tiny crustacean meals.',
    species: 'Coral Crypt',
    rarity: 'common',
    basePower: 16,
    ability: 'Tidal Hop',
  },
  {
    id: 'sand_lance',
    name: 'Sand Lance',
    description:
      'A slender silver fish that buries itself in sandy seabeds with only its eyes exposed. It emerges in a flash to catch passing plankton, then vanishes back into the sand in the blink of an eye.',
    species: 'Abyssal',
    rarity: 'common',
    basePower: 17,
    ability: 'Sand Dive',
  },
  {
    id: 'cold_water_clingfish',
    name: 'Cold Water Clingfish',
    description:
      'A small fish equipped with a suction disc on its belly formed from modified pelvic fins. It clings to rocks in freezing deep waters, resisting currents that would sweep away any other creature its size.',
    species: 'Frozen Deep',
    rarity: 'common',
    basePower: 20,
    ability: 'Frost Grip',
  },
  {
    id: 'vent_wrasse',
    name: 'Vent Wrasse',
    description:
      'A colorful little fish that thrives near volcanic hydrothermal vents. Its scales have adapted to withstand extreme heat, shimmering with iridescent patterns that shift from orange to deep red.',
    species: 'Volcanic Vent',
    rarity: 'common',
    basePower: 14,
    ability: 'Heat Shimmer',
  },
  {
    id: 'trench_sculpin',
    name: 'Trench Sculpin',
    description:
      'A bottom-dwelling fish with a broad, flattened head and enormous pectoral fins. It crawls along trench walls using its fin rays like tiny legs, probing crevices for small invertebrates.',
    species: 'Trench',
    rarity: 'common',
    basePower: 19,
    ability: 'Wall Crawl',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'flashlight_anglerfish',
    name: 'Flashlight Anglerfish',
    description:
      'A small deep-sea predator with a bioluminescent lure dangling from a modified dorsal spine. It waves this living lantern through the darkness, attracting curious prey directly into its expandable jaws.',
    species: 'Bioluminescent',
    rarity: 'uncommon',
    basePower: 32,
    ability: 'Lure Light',
  },
  {
    id: 'giant_kelp_bass',
    name: 'Giant Kelp Bass',
    description:
      'A formidable ambush predator lurking within towering kelp forests. Its mottled green-brown coloring makes it nearly invisible among the fronds, and it strikes passing fish with explosive speed.',
    species: 'Kelp Forest',
    rarity: 'uncommon',
    basePower: 35,
    ability: 'Kelp Ambush',
  },
  {
    id: 'coral_guardian_shrimp_goby',
    name: 'Coral Guardian Goby',
    description:
      'A vigilant little fish that forms symbiotic partnerships with burrowing shrimp. The goby stands watch at the burrow entrance while the shrimp digs, warning its partner of approaching danger with a flick of its tail.',
    species: 'Coral Crypt',
    rarity: 'uncommon',
    basePower: 30,
    ability: 'Sentinel Alert',
  },
  {
    id: 'abyssal_ratfish',
    name: 'Abyssal Ratfish',
    description:
      'A bizarre deep-sea chimera with large rabbit-like eyes, a toothplate instead of teeth, and a whip-like tail. It cruises just above the abyssal seafloor, feeding on mollusks and sea cucumbers in total darkness.',
    species: 'Abyssal',
    rarity: 'uncommon',
    basePower: 34,
    ability: 'Abyssal Cruise',
  },
  {
    id: 'icefish',
    name: 'Transparent Icefish',
    description:
      'A remarkable Antarctic fish whose blood is completely clear, containing no hemoglobin. It survives in sub-zero waters thanks to antifreeze glycoproteins in its bloodstream, making it virtually invisible in its frozen habitat.',
    species: 'Frozen Deep',
    rarity: 'uncommon',
    basePower: 38,
    ability: 'Frozen Veil',
  },
  {
    id: 'pompeii_worm',
    name: 'Pompeii Worm',
    description:
      'Not technically a fish but a deep-sea polychaete that thrives at hydrothermal vents where temperatures exceed 80 degrees Celsius. Its scarlet feathery gills wave in the superheated water, filtering minerals and bacteria.',
    species: 'Volcanic Vent',
    rarity: 'uncommon',
    basePower: 36,
    ability: 'Thermal Shield',
  },
  {
    id: 'hadal_snailfish',
    name: 'Hadal Snailfish',
    description:
      'A gelatinous, translucent fish found in the deepest ocean trenches below 6000 meters. Its body lacks scales and is adapted to withstand crushing pressures that would flatten any other vertebrate.',
    species: 'Trench',
    rarity: 'uncommon',
    basePower: 33,
    ability: 'Pressure Adapt',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'vampire_squid',
    name: 'Vampire Squid',
    description:
      'Neither a true squid nor an octopus, this deep-sea cephalopod dwells in the oxygen minimum zone. When threatened, it inverts its webbed arms to reveal a cloak of spiny filaments, creating a terrifying but harmless defensive display.',
    species: 'Trench',
    rarity: 'rare',
    basePower: 58,
    ability: 'Vampire Cloak',
  },
  {
    id: 'deep_sea_jellyfish',
    name: 'Atolla Jellyfish',
    description:
      'A coronate medusa jellyfish known as the "alarm jelly" for its bioluminescent distress signal. When attacked, it produces a rotating blue light display visible for hundreds of meters, attracting even larger predators to overwhelm its attacker.',
    species: 'Bioluminescent',
    rarity: 'rare',
    basePower: 62,
    ability: 'Alarm Glow',
  },
  {
    id: 'giant_isopod',
    name: 'Giant Isopod',
    description:
      'An enormous deep-sea crustacean resembling a pill bug the size of a small dog. It scuttles across the abyssal plain feeding on whale falls and detritus, capable of surviving years without food in the nutrient-poor deep.',
    species: 'Abyssal',
    rarity: 'rare',
    basePower: 55,
    ability: 'Shell Crush',
  },
  {
    id: 'leafy_seadragon',
    name: 'Leafy Seadragon',
    description:
      'A masterfully camouflaged relative of the seahorse covered in leaf-like appendages. It drifts through kelp forests indistinguishable from floating seaweed, making it one of the ocean\'s most exquisite and elusive creatures.',
    species: 'Kelp Forest',
    rarity: 'rare',
    basePower: 65,
    ability: 'Leaf Disguise',
  },
  {
    id: 'frozen_narwhal',
    name: 'Abyssal Narwhal',
    description:
      'A deep-diving variant of the arctic narwhal that ventures into frozen deep waters beneath polar ice shelves. Its spiral tusk glows with an ethereal cold light and can detect changes in water salinity and temperature.',
    species: 'Frozen Deep',
    rarity: 'rare',
    basePower: 60,
    ability: 'Tusk Pulse',
  },
  {
    id: 'tube_worm_colony',
    name: 'Giant Tube Worm Colony',
    description:
      'A towering colony of vestimentiferan worms that grow up to two meters tall around hydrothermal vents. They have no mouth or digestive system, instead relying on chemosynthetic bacteria within their bodies to convert vent chemicals into energy.',
    species: 'Volcanic Vent',
    rarity: 'rare',
    basePower: 57,
    ability: 'Chemosynthesis',
  },
  {
    id: 'coral_sphinx',
    name: 'Coral Sphinx',
    description:
      'A mysterious reef-dwelling fish with elaborate fin extensions that mimic coral polyps. It can change the color and texture of its skin to blend perfectly with any coral formation, earning its mythical name from divers who rarely spot it.',
    species: 'Coral Crypt',
    rarity: 'rare',
    basePower: 63,
    ability: 'Coral Mimicry',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'colossal_squid',
    name: 'Colossal Squid',
    description:
      'The largest invertebrate on Earth, with eyes the size of dinner plates and rotating hook-lined tentacles. It lurks in the midnight zone of the Southern Ocean, locked in an ancient evolutionary arms race with sperm whales.',
    species: 'Trench',
    rarity: 'epic',
    basePower: 95,
    ability: 'Tentacle Storm',
  },
  {
    id: 'ghost_octopus',
    name: 'Casper Octopus',
    description:
      'A spectral cephalopod discovered in the deep ocean near Hawaii, so pale and translucent that its internal organs are visible. It lacks the pigment cells of other octopuses and seems to exist between the boundaries of the living and the ethereal.',
    species: 'Bioluminescent',
    rarity: 'epic',
    basePower: 100,
    ability: 'Phantom Shift',
  },
  {
    id: 'mariana_sphinx',
    name: 'Mariana Sphinx Fish',
    description:
      'A legendary predator of the Mariana Trench that has never been photographed alive. Sonar readings suggest a creature of immense size with bioluminescent patterns that spell out morse-code-like sequences, as if trying to communicate.',
    species: 'Abyssal',
    rarity: 'epic',
    basePower: 105,
    ability: 'Depth Song',
  },
  {
    id: 'fire_coral_guardian',
    name: 'Fire Coral Guardian',
    description:
      'A sentient-looking coral formation that is actually a colony organism with a distributed nervous system. It defends its territory with stinging nematocyst barrages that glow with intense magenta light, burning anything that ventures too close.',
    species: 'Coral Crypt',
    rarity: 'epic',
    basePower: 98,
    ability: 'Nematocyst Barrage',
  },
  {
    id: 'frozen_leviathan',
    name: 'Frozen Leviathan',
    description:
      'A colossal eel-like creature found in the waters beneath Antarctic ice shelves. Its body generates its own antifreeze and it can freeze seawater solid around itself as a defensive cocoon, emerging centuries later completely unharmed.',
    species: 'Frozen Deep',
    rarity: 'epic',
    basePower: 92,
    ability: 'Cryo Cocoon',
  },
  {
    id: 'magma_angelfish',
    name: 'Magma Angelfish',
    description:
      'A breathtaking angelfish that swims through active volcanic vents unharmed. Its scales contain trace amounts of volcanic glass, and when agitated, its body temperature rises to near-boiling, scalding anything that touches it.',
    species: 'Volcanic Vent',
    rarity: 'epic',
    basePower: 96,
    ability: 'Molten Scales',
  },
  {
    id: 'ancient_kelp_wyrm',
    name: 'Ancient Kelp Wyrm',
    description:
      'A serpentine creature that has evolved to look exactly like a thick kelp stalk, complete with leaf-like fins. When it unwraps, it reveals a body over ten meters long with rows of translucent teeth that filter plankton from the water.',
    species: 'Kelp Forest',
    rarity: 'epic',
    basePower: 88,
    ability: 'Kelp Uncoil',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'kraken',
    name: 'The Kraken',
    description:
      'The legendary sea monster of Norse mythology, confirmed to exist in the deepest trenches. Its body is so large that it could be mistaken for an island, and its tentacles can reach the surface from the ocean floor, dragging entire ships down.',
    species: 'Trench',
    rarity: 'legendary',
    basePower: 150,
    ability: 'Maelstrom',
  },
  {
    id: 'abyssal_phantom',
    name: 'Abyssal Phantom Jelly',
    description:
      'A massive deep-sea jellyfish with a bell over one meter wide and ribbon-like oral arms extending thirty meters below. It moves through the abyss like a living curtain of bioluminescent silk, capturing everything in its ethereal path.',
    species: 'Bioluminescent',
    rarity: 'legendary',
    basePower: 145,
    ability: 'Luminous Veil',
  },
  {
    id: 'deep_origin',
    name: 'Deep Origin Serpent',
    description:
      'A primordial creature believed to be a living fossil from the Cambrian explosion, still thriving in the deepest ocean trenches. Its body plan defies modern taxonomy, featuring characteristics of fish, worms, and mollusks simultaneously.',
    species: 'Abyssal',
    rarity: 'legendary',
    basePower: 140,
    ability: 'Primordial Shift',
  },
  {
    id: 'coral_world_tree',
    name: 'Coral World Tree',
    description:
      'A coral organism of incomprehensible size, its branching structure forming an entire reef ecosystem that spans kilometers. It is said to be the oldest living thing on Earth, its growth rings recording millions of years of ocean history.',
    species: 'Coral Crypt',
    rarity: 'legendary',
    basePower: 148,
    ability: 'Reef Genesis',
  },
  {
    id: 'glacier_whale',
    name: 'Glacier Whale',
    description:
      'A transcendent cetacean that swims through solid ice as easily as water. Its song resonates at frequencies that can shatter glaciers, and it is said to be the guardian of all frozen waters, appearing only during the deepest polar winters.',
    species: 'Frozen Deep',
    rarity: 'legendary',
    basePower: 142,
    ability: 'Glacier Song',
  },
  {
    id: 'volcanic_dragon_eel',
    name: 'Volcanic Dragon Eel',
    description:
      'A monstrous eel that nests inside active underwater volcanoes. Its scales are forged from volcanic obsidian, and it breathes superheated water that boils everything within a ten-meter radius. Only the bravest aquarists dare approach its domain.',
    species: 'Volcanic Vent',
    rarity: 'legendary',
    basePower: 138,
    ability: 'Volcanic Breath',
  },
  {
    id: 'kelp_forest_deity',
    name: 'Kelp Forest Deity',
    description:
      'A mythical being that is one with the concept of underwater forests. It can cause kelp to grow at impossible speeds, creating forests that reach from the ocean floor to the surface in mere hours. All kelp-dwelling creatures recognize it as their sovereign.',
    species: 'Kelp Forest',
    rarity: 'legendary',
    basePower: 135,
    ability: 'Infinite Growth',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: DA_TANKS — 8 Aquarium Tanks
// ═══════════════════════════════════════════════════════════════════

export const DA_TANKS: readonly DATankDef[] = [
  {
    id: 'tide_pool_tank',
    name: 'Tide Pool Tank',
    description:
      'A shallow open-top tank mimicking natural tide pools where waves deposit interesting creatures daily. The water level rises and falls on a timer, creating natural currents that keep inhabitants active and healthy.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['+5% capture rate', 'Basic material gathering'],
  },
  {
    id: 'shallow_reef',
    name: 'Shallow Reef Exhibit',
    description:
      'A vibrant tank showcasing a miniature coral reef teeming with colorful fish and invertebrates. Advanced lighting simulates natural sunlight cycles, encouraging coral growth and natural fish behavior.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['+10% coral material yield', 'Rare creature encounters'],
  },
  {
    id: 'twilight_zone',
    name: 'Twilight Zone Aquarium',
    description:
      'A dimly lit tank replicating the mesopelagic zone where sunlight fades into perpetual twilight. Bioluminescent creatures thrive here, creating an otherworldly display of living lights that pulses with natural rhythm.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['+15% creature power', 'Bioluminescent aura'],
  },
  {
    id: 'midnight_abyss',
    name: 'Midnight Abyss Tank',
    description:
      'A completely dark pressurized tank simulating the bathypelagic zone at 4000 meters depth. Only the hardiest deep-sea creatures survive here, and their bioluminescent flashes are the only light in an ocean of black.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['+20% bio energy regeneration', 'Abyssal upgrades available'],
  },
  {
    id: 'hydrothermal_lab',
    name: 'Hydrothermal Laboratory',
    description:
      'A specialized high-temperature tank equipped with volcanic vent simulators that pump mineral-rich superheated water. Only extremophile creatures from volcanic ecosystems can thrive in these harsh conditions.',
    minLevel: 22,
    unlockCost: 3000,
    bonuses: ['+25% volcanic species power', 'Vent materials available'],
  },
  {
    id: 'frozen_depths',
    name: 'Frozen Depths Chamber',
    description:
      'A sub-zero aquarium kept at constant -2 degrees Celsius using advanced cryogenic systems. Antarctic and deep-frozen creatures swim in crystal-clear water so cold it would kill any tropical fish in seconds.',
    minLevel: 30,
    unlockCost: 7500,
    bonuses: ['+30% frozen species power', 'Epic creature capture unlocked'],
  },
  {
    id: 'coral_crypt_vault',
    name: 'Coral Crypt Vault',
    description:
      'A massive vault-like tank containing ancient coral formations harvested from deep crypt reefs. The water here carries dissolved minerals from thousand-year-old coral skeletons, granting unusual properties to resident creatures.',
    minLevel: 38,
    unlockCost: 15000,
    bonuses: ['+35% coral species power', 'Legendary specimen chance'],
  },
  {
    id: 'hadal_sanctuary',
    name: 'Hadal Sanctuary',
    description:
      'The ultimate deep-sea aquarium, a pressurized sphere simulating conditions at the very bottom of the Mariana Trench. Only legendary deep-sea beings can survive here, and their combined bioluminescence creates a spectacle visible from space.',
    minLevel: 45,
    unlockCost: 30000,
    bonuses: ['+50% all species power', 'Legendary creature capture', 'Deep breeding unlocked'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: DA_MATERIALS — 30 Aquatic Materials
// ═══════════════════════════════════════════════════════════════════

export const DA_MATERIALS: readonly DAMaterialDef[] = [
  // Common (6)
  { id: 'sea_salt_crystal', name: 'Sea Salt Crystal', description: 'Pure crystalline salt harvested from evaporated deep ocean water. Used in basic water conditioning and as a preservative for delicate specimens.', rarity: 'common', source: 'tide_pool_tank', value: 5 },
  { id: 'kelp_fragment', name: 'Kelp Fragment', description: 'A piece of dried giant kelp rich in alginate and minerals. Essential for constructing natural-looking tank environments and feeding herbivorous creatures.', rarity: 'common', source: 'tide_pool_tank', value: 6 },
  { id: 'beach_glass', name: 'Beach Glass Pebble', description: 'A smooth piece of sea glass tumbled by ocean currents for decades. Its frosted surface diffuses light beautifully and is prized as a natural tank decoration.', rarity: 'common', source: 'tide_pool_tank', value: 4 },
  { id: 'small_shell', name: 'Mother-of-Pearl Shell', description: 'A delicate iridescent shell shed by a shallow-water mollusk. Its inner surface shimmers with every color of the rainbow when exposed to light.', rarity: 'common', source: 'tide_pool_tank', value: 8 },
  { id: 'coral_polyp', name: 'Coral Polyp Sample', description: 'A living coral polyp carefully extracted from a reef. It can be grafted onto artificial structures to grow new coral formations in controlled conditions.', rarity: 'common', source: 'shallow_reef', value: 7 },
  { id: 'sea_grass', name: 'Sea Grass Bundle', description: 'A clump of seagrass complete with roots and associated microfauna. Provides natural filtration and hiding places for small tank inhabitants.', rarity: 'common', source: 'tide_pool_tank', value: 9 },

  // Uncommon (6)
  { id: 'biolum_dust', name: 'Bioluminescent Dust', description: 'Fine luminescent particles harvested from deep-sea plankton blooms. When dissolved in water, it creates a mesmerizing blue glow lasting several hours.', rarity: 'uncommon', source: 'shallow_reef', value: 28 },
  { id: 'deep_coral_branch', name: 'Deep Coral Branch', description: 'A branch of deep-water coral that grows without sunlight, using chemical energy instead. Its intricate lattice structure is stronger than bone and glows faintly.', rarity: 'uncommon', source: 'twilight_zone', value: 35 },
  { id: 'abyssal_pearl', name: 'Abyssal Pearl', description: 'A pearl formed in the crushing depths of the ocean floor. The extreme pressure gives it a unique internal luster that shifts between deep blue and black.', rarity: 'uncommon', source: 'midnight_abyss', value: 32 },
  { id: 'vent_mineral', name: 'Vent Mineral Deposit', description: 'A chunk of mineral-rich rock collected from a hydrothermal vent chimney. Contains traces of copper, zinc, and rare earth elements coveted by volcanic creatures.', rarity: 'uncommon', source: 'twilight_zone', value: 40 },
  { id: 'frozen_brine', name: 'Frozen Brine Sample', description: 'Supercooled brine extracted from Antarctic sea ice formations. So cold it can freeze tropical seawater on contact, yet harmless to cold-adapted creatures.', rarity: 'uncommon', source: 'shallow_reef', value: 30 },
  { id: 'crypt_coral_spore', name: 'Crypt Coral Spore', description: 'A spore from the ancient crypt corals found in deep reef caves. When planted in dark, mineral-rich water, it slowly grows into a living coral formation.', rarity: 'uncommon', source: 'midnight_abyss', value: 45 },

  // Rare (6)
  { id: 'hadal_pressure_crystal', name: 'Hadal Pressure Crystal', description: 'A crystal formed under the extreme pressure of the hadal zone. It vibrates at frequencies that can calm agitated deep-sea creatures and promote healthy growth.', rarity: 'rare', source: 'midnight_abyss', value: 120 },
  { id: 'black_coral_skeleton', name: 'Black Coral Skeleton', description: 'The rigid skeleton of a black coral colony that has been growing for over two thousand years. Its dark, lustrous surface contains antimicrobial properties.', rarity: 'rare', source: 'shallow_reef', value: 150 },
  { id: 'thermal_vent_shard', name: 'Thermal Vent Shard', description: 'A fragment of a black smoker chimney that still radiates mild heat. Placed in a tank, it creates a micro-habitat warm enough for volcanic species.', rarity: 'rare', source: 'twilight_zone', value: 140 },
  { id: 'antifreeze_extract', name: 'Antifreeze Protein Extract', description: 'Concentrated antifreeze proteins extracted from icefish blood. A single drop added to tank water can prevent ice crystal formation even at -10 degrees Celsius.', rarity: 'rare', source: 'hydrothermal_lab', value: 160 },
  { id: 'pearl_oyster_nacre', name: 'Pearl Oyster Nacre', description: 'The mother-of-pearl lining from a giant deep-sea oyster. Its surface contains microscopic crystal structures that produce rainbow interference patterns in any light.', rarity: 'rare', source: 'midnight_abyss', value: 135 },
  { id: 'kelp_forest_heart', name: 'Kelp Forest Heart', description: 'The root-like holdfast of an ancient giant kelp plant. It pulses with a slow biological rhythm and can anchor an entire kelp forest ecosystem when replanted.', rarity: 'rare', source: 'hydrothermal_lab', value: 110 },

  // Epic (6)
  { id: 'abyssal_obsidian', name: 'Abyssal Obsidian Orb', description: 'A perfectly spherical obsidian formation found only at the bottom of the deepest trenches. It absorbs all light and radiates a faint gravitational pull that attracts deep creatures.', rarity: 'epic', source: 'coral_crypt_vault', value: 500 },
  { id: 'biolum_marrow', name: 'Bioluminescent Marrow', description: 'The glowing core of an ancient bioluminescent organism. It produces light without any chemical fuel, apparently powered by an unknown biological process that science cannot yet explain.', rarity: 'epic', source: 'frozen_depths', value: 550 },
  { id: 'volcanic_glass_heart', name: 'Volcanic Glass Heart', description: 'A formation of volcanic glass that somehow mimics the beating of a heart. It pulses with heat and light in a slow, rhythmic cycle that soothes all volcanic vent creatures.', rarity: 'epic', source: 'coral_crypt_vault', value: 600 },
  { id: 'frozen_time_amber', name: 'Frozen Time Amber', description: 'Amber formed from ancient tree resin that sank to the frozen seabed millions of years ago. Inside, perfectly preserved prehistoric marine organisms can be seen frozen in lifelike poses.', rarity: 'epic', source: 'frozen_depths', value: 520 },
  { id: 'coral_brain_matrix', name: 'Coral Brain Matrix', description: 'A brain coral formation with an internal neural-like network of channels. Scientists theorize it processes information about water chemistry and communicates with nearby coral colonies.', rarity: 'epic', source: 'coral_crypt_vault', value: 480 },
  { id: 'trench_echo_shell', name: 'Trench Echo Shell', description: 'A massive conch shell found at 9000 meters depth. When held to the ear, it does not produce the sound of the ocean but rather the sound of the deep Earth itself — shifting tectonic plates and magma flows.', rarity: 'epic', source: 'frozen_depths', value: 570 },

  // Legendary (6)
  { id: 'ocean_heart_crystal', name: 'Ocean Heart Crystal', description: 'A crystal formed at the very center of the Earth where magma meets the ocean. It contains the essence of every ocean that has ever existed, and holding it grants understanding of all marine life.', rarity: 'legendary', source: 'hadal_sanctuary', value: 5000 },
  { id: 'leviathan_bone', name: 'Leviathan Bone Fragment', description: 'A fossilized bone from an creature so large it dwarfs even the blue whale. Carbon dating places it at over 200 million years old, from an era when the oceans teemed with impossible giants.', rarity: 'legendary', source: 'hadal_sanctuary', value: 6000 },
  { id: 'primal_vent_core', name: 'Primal Vent Core', description: 'The core of the first hydrothermal vent on Earth, still active after four billion years. It generates heat through an unknown process and its water contains compounds found nowhere else on the planet.', rarity: 'legendary', source: 'hadal_sanctuary', value: 5500 },
  { id: 'coral_origin_seed', name: 'Coral Origin Seed', description: 'The seed from which all coral on Earth is descended. Planted in any ocean water, it would eventually grow into a planetary reef system, but kept in isolation it remains dormant and patient.', rarity: 'legendary', source: 'hadal_sanctuary', value: 7000 },
  { id: 'frozen_ocean_memory', name: 'Frozen Ocean Memory', description: 'A perfectly clear ice crystal containing trapped ancient seawater from the first ocean on Earth. The water inside moves in slow patterns that some scientists believe encode memories of primordial life.', rarity: 'legendary', source: 'hadal_sanctuary', value: 6500 },
  { id: 'hadal_crown', name: 'Hadal Crown', description: 'A crown-shaped formation of compressed abyssal sediment and bioluminescent crystals. It grants its wearer dominion over all hadal zone creatures and the ability to command the deepest ocean currents.', rarity: 'legendary', source: 'hadal_sanctuary', value: 8000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: DA_DECORATIONS — 25 Tank Decorations
// ═══════════════════════════════════════════════════════════════════

export const DA_DECORATIONS: readonly DADecorationDef[] = [
  // Coral (5)
  { id: 'coral_arch', name: 'Coral Arch', description: 'A natural archway formed from fused coral branches. Creatures love to swim through it, and it provides excellent visual depth to any tank display.', baseCost: 100, costMultiplier: 1.5 },
  { id: 'brain_rock', name: 'Brain Rock Formation', description: 'A spherical rock with grooves resembling a brain coral. Its textured surface provides ideal attachment points for beneficial bacteria and small organisms.', baseCost: 400, costMultiplier: 1.6 },
  { id: 'fan_coral_stand', name: 'Gorgonian Fan Stand', description: 'A tall stand holding a preserved sea fan coral that sways gently in the current. Its intricate lattice creates beautiful shadow patterns on the tank floor.', baseCost: 1200, costMultiplier: 1.7 },
  { id: 'staghorn_garden', name: 'Staghorn Coral Garden', description: 'A cluster of branching staghorn coral replicas that create a miniature reef landscape. Fish weave through the branches like birds through a forest canopy.', baseCost: 3000, costMultiplier: 1.8 },
  { id: 'deep_reef_monolith', name: 'Deep Reef Monolith', description: 'A massive coral pillar rising from the tank floor to near the water surface. Its surface teems with micro-organisms and provides habitats for dozens of species simultaneously.', baseCost: 8000, costMultiplier: 2.0 },

  // Rock (5)
  { id: 'lava_rock_stack', name: 'Lava Rock Stack', description: 'A carefully balanced stack of porous volcanic rocks. The holes and tunnels provide perfect hiding spots for shy creatures and beneficial bacteria colonization.', baseCost: 80, costMultiplier: 1.4 },
  { id: 'deep_rock_formation', name: 'Deep Rock Formation', description: 'An arrangement of dark basalt rocks mimicking a deep-sea geological formation. Its angular surfaces create interesting current patterns that stimulate natural fish behavior.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'crystal_cave', name: 'Crystal Cave', description: 'A hollow rock structure lined with mineral crystals that refract tank lighting into prismatic displays. Creatures are drawn to its sparkling interior for rest and shelter.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'trench_wall_replica', name: 'Trench Wall Replica', description: 'A tall curved panel simulating the vertical wall of an ocean trench. Its textured surface allows sessile creatures to attach and creates a dramatic sense of depth in the tank.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'abyssal_throne', name: 'Abyssal Throne', description: 'An elaborate throne-shaped rock formation carved from a single piece of abyssal stone. Legendary deep creatures are instinctively drawn to rest upon it.', baseCost: 5000, costMultiplier: 1.8 },

  // Flora (5)
  { id: 'kelp_bed', name: 'Kelp Bed', description: 'A dense planting of artificial giant kelp that sways realistically in water currents. Provides vertical structure and natural cover for forest-dwelling species.', baseCost: 120, costMultiplier: 1.4 },
  { id: 'sea_grass_meadow', name: 'Sea Grass Meadow', description: 'A carpet of synthetic sea grass that creates a natural meadow effect across the tank floor. Perfect for tide pool and shallow reef themed tanks.', baseCost: 500, costMultiplier: 1.5 },
  { id: 'mangrove_root_system', name: 'Mangrove Root System', description: 'A complex network of artificial mangrove roots extending from the water surface to the tank floor. Creates multiple micro-habitats at different depth levels.', baseCost: 1500, costMultiplier: 1.6 },
  { id: 'deep_sea_garden', name: 'Deep Sea Garden', description: 'A collection of bioluminescent plant replicas that glow softly in blue and green. Creates an enchanting alien landscape that makes the tank feel like another world.', baseCost: 700, costMultiplier: 1.5 },
  { id: 'kelp_forest_tower', name: 'Kelp Forest Tower', description: 'A towering structure of interconnected kelp stalks reaching from floor to ceiling. The ultimate decoration for kelp forest tanks, providing three-dimensional habitat complexity.', baseCost: 4000, costMultiplier: 1.8 },

  // Special (5)
  { id: 'biolum_cluster', name: 'Biolum Cluster', description: 'A cluster of artificial bioluminescent organisms that pulse with soft light. Their rhythm can be synchronized with tank lighting for spectacular night-time displays.', baseCost: 150, costMultiplier: 1.4 },
  { id: 'shipwreck_model', name: 'Shipwreck Model', description: 'A detailed scale model of a sunken sailing ship. Multiple entry points and chambers make it an ideal exploration environment for curious and intelligent species.', baseCost: 250, costMultiplier: 1.5 },
  { id: 'volcanic_bubbler', name: 'Volcanic Bubbler', description: 'A vent replica that releases streams of fine bubbles simulating volcanic activity. The bubbles carry dissolved minerals that benefit vent-dwelling species.', baseCost: 600, costMultiplier: 1.5 },
  { id: 'treasure_chest', name: 'Deep Treasure Chest', description: 'An ornate chest overflowing with artificial pearls and gold coins. Opens and closes on a timer, revealing a glowing pearl inside that attracts attention from all tank inhabitants.', baseCost: 1000, costMultiplier: 1.6 },
  { id: 'pearl_altar', name: 'Pearl Altar', description: 'A sacred-looking stone altar embedded with glowing pearls arranged in ancient aquatic symbols. Creatures near it exhibit calmer behavior and slightly increased health regeneration.', baseCost: 2000, costMultiplier: 1.7 },

  // Legendary (5)
  { id: 'abyssal_gate', name: 'Abyssal Gate', description: 'A massive stone gateway carved with deep-sea glyphs that glow with faint bioluminescence. It serves as a focal point for legendary creature activity and enhances all tank stats.', baseCost: 5000, costMultiplier: 1.8 },
  { id: 'world_ocean_orrery', name: 'World Ocean Orrery', description: 'A mechanical model of ocean currents suspended in the tank. It rotates slowly, generating realistic current patterns that benefit all creatures and promote natural migration behaviors.', baseCost: 8000, costMultiplier: 2.0 },
  { id: 'titan_shell_palace', name: 'Titan Shell Palace', description: 'A palace constructed entirely from shells of extinct giant mollusks. Its chambers are connected by tunnels that create natural water circulation, benefiting every creature inside.', baseCost: 10000, costMultiplier: 2.1 },
  { id: 'leviathan_skeleton', name: 'Leviathan Skeleton', description: 'The reconstructed skeleton of an ancient leviathan suspended in the tank. Swimming through its ribcage gives creatures a temporary power boost and instills a sense of primordial awe.', baseCost: 12000, costMultiplier: 2.2 },
  { id: 'ocean_heart_shrine', name: 'Ocean Heart Shrine', description: 'The ultimate tank decoration — a shrine containing a fragment of the mythical Ocean Heart Crystal. It radiates energy that accelerates creature growth and enhances bioluminescent displays.', baseCost: 20000, costMultiplier: 2.5 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: DA_ABILITIES — 22 Aquatic Abilities
// ═══════════════════════════════════════════════════════════════════

export const DA_ABILITIES: readonly DAAbilityDef[] = [
  { id: 'sonar_pulse', name: 'Sonar Pulse', description: 'Emit a powerful sonar wave that reveals all hidden creatures in the tank and stuns enemies momentarily.', cooldown: 10, power: 25, species: 'Trench' },
  { id: 'biolum_flash', name: 'Bioluminescent Flash', description: 'Create an overwhelming flash of bioluminescent light that blinds predators and heals allies with photoreceptive cells.', cooldown: 15, power: 30, species: 'Bioluminescent' },
  { id: 'coral_shield', name: 'Coral Shield', description: 'Generate a protective barrier of hardening coral polyps that absorbs incoming damage and gradually regenerates.', cooldown: 20, power: 35, species: 'Coral Crypt' },
  { id: 'kelp_grasp', name: 'Kelp Grasp', description: 'Command kelp fronds to entangle a target, restricting movement and dealing nature damage over time.', cooldown: 12, power: 28, species: 'Kelp Forest' },
  { id: 'volcanic_eruption', name: 'Volcanic Eruption', description: 'Trigger a miniature volcanic eruption within the tank, dealing massive fire damage to all hostile entities.', cooldown: 30, power: 50, species: 'Volcanic Vent' },
  { id: 'frozen_current', name: 'Frozen Current', description: 'Unleash a supercooled water current that freezes enemies solid and creates temporary ice walls for defense.', cooldown: 18, power: 38, species: 'Frozen Deep' },
  { id: 'abyssal_drain', name: 'Abyssal Drain', description: 'Open a vortex to the abyss that pulls enemies downward, draining their energy and transferring it to allies.', cooldown: 25, power: 42, species: 'Abyssal' },
  { id: 'tidal_surge', name: 'Tidal Surge', description: 'Summon a massive wave that sweeps across the tank, pushing enemies back and healing all friendly creatures it passes.', cooldown: 20, power: 35, species: 'Kelp Forest' },
  { id: 'depth_pressure', name: 'Depth Pressure Crush', description: 'Increase the ambient pressure in a localized area, crushing enemies with the force of a thousand meters of water.', cooldown: 22, power: 45, species: 'Trench' },
  { id: 'coral_bloom', name: 'Coral Bloom', description: 'Cause coral formations to bloom explosively, releasing healing spores and creating new coral habitats in the process.', cooldown: 16, power: 32, species: 'Coral Crypt' },
  { id: 'phantom_swim', name: 'Phantom Swim', description: 'Become temporarily incorporeal, passing through walls and enemies while immune to all damage.', cooldown: 25, power: 20, species: 'Bioluminescent' },
  { id: 'kelp_whirlpool', name: 'Kelp Whirlpool', description: 'Create a whirlpool of kelp fronds that traps enemies in a spinning vortex of slicing vegetation.', cooldown: 18, power: 40, species: 'Kelp Forest' },
  { id: 'magma_flow', name: 'Magma Flow', description: 'Release a stream of underwater magma that creates new rocky terrain and incinerates anything in its path.', cooldown: 28, power: 48, species: 'Volcanic Vent' },
  { id: 'ice_mirror', name: 'Ice Mirror Shield', description: 'Create a reflective ice barrier that bounces enemy projectiles back at them while protecting allies behind it.', cooldown: 22, power: 38, species: 'Frozen Deep' },
  { id: 'shadow_meld', name: 'Shadow Meld', description: 'Merge with the darkness of the deep ocean, becoming invisible to all detection methods for a duration.', cooldown: 20, power: 15, species: 'Abyssal' },
  { id: 'biolum_hypnosis', name: 'Bioluminescent Hypnosis', description: 'Generate pulsing light patterns that hypnotize enemies, causing them to wander aimlessly or attack each other.', cooldown: 24, power: 35, species: 'Bioluminescent' },
  { id: 'coral_reef_fortress', name: 'Coral Reef Fortress', description: 'Rapidly grow an entire coral reef fortress around allies, providing cover, healing, and defensive turrets made of living coral.', cooldown: 35, power: 55, species: 'Coral Crypt' },
  { id: 'leviathan_call', name: 'Leviathan Call', description: 'Issue a deep resonant call that summons temporary leviathan constructs to fight alongside allies for a short duration.', cooldown: 40, power: 60, species: 'Trench' },
  { id: 'thermal_vent_network', name: 'Thermal Vent Network', description: 'Establish a network of thermal vents across the tank floor, creating zones that damage enemies and heal volcanic allies.', cooldown: 30, power: 45, species: 'Volcanic Vent' },
  { id: 'glacier_advance', name: 'Glacier Advance', description: 'Cause the tank walls to slowly advance with growing ice formations, gradually shrinking the battlefield and trapping enemies.', cooldown: 32, power: 50, species: 'Frozen Deep' },
  { id: 'ocean_origin_wave', name: 'Ocean Origin Wave', description: 'Channel the power of the primordial ocean, unleashing a wave of creation that heals allies and reshapes the entire tank environment.', cooldown: 45, power: 65, species: 'Abyssal' },
  { id: 'world_kelp_song', name: 'World Kelp Song', description: 'All kelp in the tank begins to sing in harmony, generating a pervasive aura that boosts all stats of every friendly creature.', cooldown: 38, power: 55, species: 'Kelp Forest' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: DA_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const DA_ACHIEVEMENTS: readonly DAAchievementDef[] = [
  { id: 'ach_first_catch', name: 'First Catch', description: 'Add your first creature to the aquarium.', condition: 'Add 1 creature', reward: '+50 pearls' },
  { id: 'ach_tide_pool_master', name: 'Tide Pool Master', description: 'Unlock and fully upgrade the Tide Pool Tank.', condition: 'Max level tide_pool_tank', reward: '+200 pearls' },
  { id: 'ach_ten_creatures', name: 'Curator', description: 'Have 10 different creatures in your aquarium.', condition: 'Own 10 creatures', reward: '+300 pearls, uncommon bait' },
  { id: 'ach_biolum_expert', name: 'Bioluminescent Expert', description: 'Own all 5 Bioluminescent creatures from common to rare.', condition: 'Own 3 biolum species', reward: '+500 pearls, biolum bait' },
  { id: 'ach_deep_feeder', name: 'Deep Feeder', description: 'Feed your creatures 50 times total.', condition: 'Feed 50 times', reward: '+400 pearls' },
  { id: 'ach_reef_builder', name: 'Reef Builder', description: 'Place 10 decorations in your tanks.', condition: 'Place 10 decorations', reward: '+350 pearls' },
  { id: 'ach_trench_explorer', name: 'Trench Explorer', description: 'Unlock the Midnight Abyss tank.', condition: 'Unlock midnight_abyss', reward: '+600 pearls, abyssal bait' },
  { id: 'ach_breeder', name: 'Aquatic Breeder', description: 'Successfully breed 5 new creatures.', condition: 'Breed 5 creatures', reward: '+700 pearls' },
  { id: 'ach_specimen_collector', name: 'Specimen Collector', description: 'Collect 5 rare specimens.', condition: 'Collect 5 specimens', reward: '+800 pearls, specimen net' },
  { id: 'ach_volcanic_master', name: 'Volcanic Master', description: 'Own all 5 Volcanic Vent creatures from common to rare.', condition: 'Own 3 volcanic species', reward: '+900 pearls' },
  { id: 'ach_event_survivor', name: 'Event Survivor', description: 'Survive 10 tank events without any creature deaths.', condition: 'Survive 10 events', reward: '+1000 pearls' },
  { id: 'ach_frozen_warden', name: 'Frozen Warden', description: 'Own all 5 Frozen Deep creatures from common to rare.', condition: 'Own 3 frozen species', reward: '+1000 pearls' },
  { id: 'ach_legendary_catch', name: 'Legendary Catch', description: 'Add a legendary creature to your aquarium.', condition: 'Own 1 legendary creature', reward: '+2000 pearls' },
  { id: 'ach_tank_perfectionist', name: 'Tank Perfectionist', description: 'Have all 8 tanks unlocked simultaneously.', condition: 'Unlock all 8 tanks', reward: '+2500 pearls' },
  { id: 'ach_twenty_five_creatures', name: 'Grand Aquarium', description: 'Have 25 different creatures across all tanks.', condition: 'Own 25 creatures', reward: '+3000 pearls' },
  { id: 'ach_all_specimens', name: 'Complete Collection', description: 'Collect all 15 rare specimens.', condition: 'Collect 15 specimens', reward: '+5000 pearls' },
  { id: 'ach_coral_crypt_keeper', name: 'Coral Crypt Keeper', description: 'Own all 5 Coral Crypt creatures from common to rare.', condition: 'Own 3 coral species', reward: '+1500 pearls' },
  { id: 'ach_abyssal_overlord', name: 'Abyssal Overlord', description: 'Reach aquarist level 50 and own at least 3 legendary creatures.', condition: 'Level 50 + 3 legendaries', reward: '+10000 pearls, eternal bait' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: DA_TITLES — 8 Deep Titles
// ═══════════════════════════════════════════════════════════════════

export const DA_TITLES: readonly DATitleDef[] = [
  { id: 'title_tide_pool_novice', name: 'Tide Pool Novice', description: 'A beginner aquarist just starting their journey into the deep.', requiredLevel: 1, requiredTanks: 1 },
  { id: 'title_reef_apprentice', name: 'Reef Apprentice', description: 'An aspiring aquarist learning the secrets of coral reef management.', requiredLevel: 5, requiredTanks: 2 },
  { id: 'title_deep_diver', name: 'Deep Diver', description: 'An experienced aquarist capable of venturing into the midnight zone.', requiredLevel: 12, requiredTanks: 3 },
  { id: 'title_abyssal_keeper', name: 'Abyssal Keeper', description: 'A skilled aquarist who maintains creatures from the deepest trenches.', requiredLevel: 20, requiredTanks: 4 },
  { id: 'title_volcanic_warden', name: 'Volcanic Warden', description: 'A master aquarist who tames the creatures of hydrothermal vents.', requiredLevel: 28, requiredTanks: 5 },
  { id: 'title_frozen_guardian', name: 'Frozen Guardian', description: 'An elite aquarist who protects the inhabitants of the frozen deep.', requiredLevel: 35, requiredTanks: 6 },
  { id: 'title_hadal_sovereign', name: 'Hadal Sovereign', description: 'A supreme aquarist who rules over the hadal sanctuary.', requiredLevel: 42, requiredTanks: 7 },
  { id: 'title_abyssal_overlord', name: 'Abyssal Overlord', description: 'The ultimate aquarist, master of all ocean depths and all who dwell within.', requiredLevel: 48, requiredTanks: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: DA_SPECIMENS — 15 Rare Specimens
// ═══════════════════════════════════════════════════════════════════

export const DA_SPECIMENS: readonly DASpecimenDef[] = [
  // Common Specimens (3)
  { id: 'specimen_glowing_scale', name: 'Glowing Scale', description: 'A single scale from a bioluminescent fish that continues to glow indefinitely after being shed.', rarity: 'common', powerBonus: 5, specialAbility: 'Faint illumination' },
  { id: 'specimen_coral_fragment', name: 'Living Coral Fragment', description: 'A tiny piece of coral that continues to grow slowly when placed in mineral-rich water.', rarity: 'common', powerBonus: 8, specialAbility: 'Slow coral growth' },
  { id: 'specimen_pearl_seed', name: 'Pearl Seed', description: 'A tiny nascent pearl that will eventually grow into a perfect sphere given enough time.', rarity: 'common', powerBonus: 6, specialAbility: 'Gradual pearl formation' },

  // Uncommon Specimens (3)
  { id: 'specimen_vent_worm_cast', name: 'Vent Worm Cast', description: 'The molted shell of a Pompeii worm, still radiating residual heat from hydrothermal vents.', rarity: 'uncommon', powerBonus: 15, specialAbility: 'Ambient warmth aura' },
  { id: 'specimen_frozen_plankton', name: 'Frozen Plankton Sample', description: 'Perfectly preserved Antarctic plankton suspended in clear ice, still displaying bioluminescent patterns.', rarity: 'uncommon', powerBonus: 12, specialAbility: 'Cold light display' },
  { id: 'specimen_kelp_ring', name: 'Kelp Growth Ring', description: 'A cross-section of ancient kelp holdfast showing growth rings spanning over a century.', rarity: 'uncommon', powerBonus: 18, specialAbility: 'Historical insight' },

  // Rare Specimens (3)
  { id: 'specimen_abyssal_feather', name: 'Abyssal Feather Star', description: 'A complete feather star crinoid with all arms intact, frozen in a graceful swimming pose.', rarity: 'rare', powerBonus: 35, specialAbility: 'Arm regeneration boost' },
  { id: 'specimen_volcanic_glass_fish', name: 'Volcanic Glass Fish', description: 'A fish-shaped formation of natural volcanic glass, so perfect it appears to be a living creature.', rarity: 'rare', powerBonus: 40, specialAbility: 'Heat resistance aura' },
  { id: 'specimen_frozen_nautilus', name: 'Frozen Nautilus', description: 'A nautilus preserved in glacial ice with its shell intact, revealing the perfect logarithmic spiral chambers within.', rarity: 'rare', powerBonus: 38, specialAbility: 'Pressure insight' },

  // Epic Specimens (3)
  { id: 'specimen_ghost_shark_embryo', name: 'Ghost Shark Embryo', description: 'A chimaera embryo in a translucent egg case, its undeveloped body glowing with ethereal light.', rarity: 'epic', powerBonus: 70, specialAbility: 'Deep sight enhancement' },
  { id: 'specimen_magma_squid_beak', name: 'Magma Squid Beak', description: 'The fossilized beak of an ancient squid species that lived near volcanic vents. It is warm to the touch.', rarity: 'epic', powerBonus: 75, specialAbility: 'Volcanic command' },
  { id: 'specimen_leviathan_scale', name: 'Leviathan Scale', description: 'A single scale from a creature of impossible size, found embedded in abyssal sediment. It hums with ancient power.', rarity: 'epic', powerBonus: 80, specialAbility: 'Ancient protection' },

  // Legendary Specimens (3)
  { id: 'specimen_ocean_heart_shard', name: 'Ocean Heart Shard', description: 'A fragment of the mythical Ocean Heart Crystal that radiates with the combined energy of all the world\'s oceans.', rarity: 'legendary', powerBonus: 150, specialAbility: 'Ocean dominion' },
  { id: 'specimen_titan_eye', name: 'Titan Eye Lens', description: 'The crystallized lens from the eye of an ocean titan. Looking through it reveals the hidden currents of magic flowing through all water.', rarity: 'legendary', powerBonus: 145, specialAbility: 'True ocean sight' },
  { id: 'specimen_abyssal_crown_gem', name: 'Abyssal Crown Gem', description: 'The central gem from the Hadal Crown, pulsing with dark energy from the deepest point on Earth.', rarity: 'legendary', powerBonus: 160, specialAbility: 'Hadal sovereignty' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: DA_EVENTS — 12 Tank Events
// ═══════════════════════════════════════════════════════════════════

export const DA_EVENTS: readonly DAEventDef[] = [
  {
    id: 'event_algae_bloom',
    name: 'Algae Bloom',
    description: 'A sudden explosion of algae growth turns the tank water bright green, reducing visibility and depleting oxygen.',
    severity: 2,
    duration: 5,
    effects: ['-10% creature health', 'Reduced visibility'],
  },
  {
    id: 'event_coral_bleaching',
    name: 'Coral Bleaching',
    description: 'Water temperature fluctuations cause coral decorations to bleach, losing their color and vitality.',
    severity: 3,
    duration: 8,
    effects: ['-20% decoration effectiveness', 'Stress on coral species'],
  },
  {
    id: 'event_current_shift',
    name: 'Deep Current Shift',
    description: 'An unexpected deep-ocean current enters the tank, rearranging decorations and disorienting creatures.',
    severity: 2,
    duration: 4,
    effects: ['Decoration displacement', '-15% creature speed'],
  },
  {
    id: 'event_biolum_surge',
    name: 'Bioluminescent Surge',
    description: 'All bioluminescent creatures begin glowing intensely, creating a spectacular but overwhelming light display.',
    severity: 1,
    duration: 3,
    effects: ['+20% biolum species power', '+30% bio energy regen'],
  },
  {
    id: 'event_volcanic_tremor',
    name: 'Volcanic Tremor',
    description: 'Seismic activity from nearby vents shakes the tank, cracking glass and terrifying volcanic species.',
    severity: 4,
    duration: 6,
    effects: ['-25% tank health', 'Volcanic creatures flee', '+10% pollution'],
  },
  {
    id: 'event_frozen_leak',
    name: 'Frozen Leak',
    description: 'A crack in the cooling system releases supercooled water into the tank, dropping temperatures dangerously.',
    severity: 3,
    duration: 7,
    effects: ['-20% non-frozen creature health', 'Frozen bonus activated'],
  },
  {
    id: 'event_deep_predator',
    name: 'Deep Predator Incursion',
    description: 'A powerful deep-sea predator enters the tank through the filtration system, threatening smaller creatures.',
    severity: 5,
    duration: 10,
    effects: ['-30% small creature health', 'Emergency lockdown', '-15% tank health'],
  },
  {
    id: 'event_pearl_rain',
    name: 'Pearl Rain',
    description: 'A miraculous event where hundreds of tiny pearls materialize and rain down through the tank water.',
    severity: 0,
    duration: 2,
    effects: ['+500 pearls', '+10% creature happiness'],
  },
  {
    id: 'event_tidal_wave',
    name: 'Mini Tidal Wave',
    description: 'An equipment malfunction generates a powerful internal wave that crashes through all tank zones.',
    severity: 3,
    duration: 5,
    effects: ['-15% all creature health', 'Decorations scattered', '+5% pollution'],
  },
  {
    id: 'event_abyssal_whisper',
    name: 'Abyssal Whisper',
    description: 'Strange sounds emanate from the tank depths, causing creatures to exhibit unusual behavior patterns.',
    severity: 2,
    duration: 8,
    effects: ['Random creature stat changes', '+15% rare capture chance'],
  },
  {
    id: 'event_oxygen_depletion',
    name: 'Oxygen Depletion Zone',
    description: 'A dead zone forms in the tank where oxygen levels plummet, forcing creatures to crowd into remaining habitable areas.',
    severity: 4,
    duration: 6,
    effects: ['-30% creature health in dead zone', 'Population concentration stress'],
  },
  {
    id: 'event_ancient_awakening',
    name: 'Ancient Awakening',
    description: 'Something ancient stirs in the deepest part of the tank. All legendary creatures become significantly more powerful.',
    severity: 1,
    duration: 12,
    effects: ['+50% legendary creature power', '+25% specimen discovery rate'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: TANK MATERIAL MAP & SPECIES INTERACTION
// ═══════════════════════════════════════════════════════════════════

interface DATankMaterialMap {
  tankId: string
  materialIds: string[]
  bonusMaterialIds: string[]
}

const DA_TANK_MATERIAL_MAP: DATankMaterialMap[] = [
  { tankId: 'tide_pool_tank', materialIds: ['sea_salt_crystal', 'kelp_fragment', 'beach_glass', 'small_shell', 'sea_grass'], bonusMaterialIds: ['coral_polyp'] },
  { tankId: 'shallow_reef', materialIds: ['coral_polyp', 'biolum_dust', 'deep_coral_branch', 'crypt_coral_spore'], bonusMaterialIds: ['abyssal_pearl'] },
  { tankId: 'twilight_zone', materialIds: ['biolum_dust', 'deep_coral_branch', 'vent_mineral', 'frozen_brine'], bonusMaterialIds: ['crypt_coral_spore'] },
  { tankId: 'midnight_abyss', materialIds: ['abyssal_pearl', 'crypt_coral_spore', 'hadal_pressure_crystal', 'pearl_oyster_nacre'], bonusMaterialIds: ['kelp_forest_heart'] },
  { tankId: 'hydrothermal_lab', materialIds: ['vent_mineral', 'thermal_vent_shard', 'antifreeze_extract', 'kelp_forest_heart'], bonusMaterialIds: ['hadal_pressure_crystal'] },
  { tankId: 'frozen_depths', materialIds: ['frozen_brine', 'antifreeze_extract', 'frozen_time_amber', 'trench_echo_shell'], bonusMaterialIds: ['biolum_marrow'] },
  { tankId: 'coral_crypt_vault', materialIds: ['crypt_coral_spore', 'abyssal_obsidian', 'coral_brain_matrix', 'black_coral_skeleton'], bonusMaterialIds: ['pearl_oyster_nacre'] },
  { tankId: 'hadal_sanctuary', materialIds: ['ocean_heart_crystal', 'leviathan_bone', 'primal_vent_core', 'coral_origin_seed', 'frozen_ocean_memory', 'hadal_crown'], bonusMaterialIds: [] },
]

interface DASpeciesInteraction {
  attacker: DASpecies
  defender: DASpecies
  damageMultiplier: number
}

const DA_SPECIES_INTERACTIONS: DASpeciesInteraction[] = [
  { attacker: 'Bioluminescent', defender: 'Abyssal', damageMultiplier: 1.4 },
  { attacker: 'Abyssal', defender: 'Trench', damageMultiplier: 1.3 },
  { attacker: 'Trench', defender: 'Kelp Forest', damageMultiplier: 1.35 },
  { attacker: 'Kelp Forest', defender: 'Coral Crypt', damageMultiplier: 1.25 },
  { attacker: 'Coral Crypt', defender: 'Volcanic Vent', damageMultiplier: 1.4 },
  { attacker: 'Volcanic Vent', defender: 'Frozen Deep', damageMultiplier: 1.3 },
  { attacker: 'Frozen Deep', defender: 'Bioluminescent', damageMultiplier: 1.35 },
]

interface DABreedTier {
  requiredLevel: number
  successBonus: number
  materialCost: number
  name: string
}

const DA_BREED_TIERS: DABreedTier[] = [
  { requiredLevel: 1, successBonus: 0, materialCost: 5, name: 'Basic Breeding' },
  { requiredLevel: 10, successBonus: 0.1, materialCost: 15, name: 'Advanced Breeding' },
  { requiredLevel: 20, successBonus: 0.2, materialCost: 30, name: 'Expert Breeding' },
  { requiredLevel: 30, successBonus: 0.3, materialCost: 50, name: 'Master Breeding' },
  { requiredLevel: 40, successBonus: 0.4, materialCost: 80, name: 'Legendary Breeding' },
]

function daGetSpeciesInteraction(attacker: DASpecies, defender: DASpecies): DASpeciesInteraction | null {
  return DA_SPECIES_INTERACTIONS.find(
    (i) => i.attacker === attacker && i.defender === defender
  ) ?? null
}

function daGetBreedTier(level: number): DABreedTier {
  for (let i = DA_BREED_TIERS.length - 1; i >= 0; i--) {
    if (level >= DA_BREED_TIERS[i].requiredLevel) {
      return DA_BREED_TIERS[i]
    }
  }
  return DA_BREED_TIERS[0]
}

function daGetTankMaterials(tankId: string): DATankMaterialMap | null {
  return DA_TANK_MATERIAL_MAP.find((m) => m.tankId === tankId) ?? null
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15a: VALIDATION & UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function daValidateCreatureId(creatureId: string): boolean {
  return DA_FISH.some((f) => f.id === creatureId)
}

function daValidateTankId(tankId: string): boolean {
  return DA_TANKS.some((t) => t.id === tankId)
}

function daValidateMaterialId(materialId: string): boolean {
  return DA_MATERIALS.some((m) => m.id === materialId)
}

function daValidateDecorationId(decorationId: string): boolean {
  return DA_DECORATIONS.some((d) => d.id === decorationId)
}

function daValidateAbilityId(abilityId: string): boolean {
  return DA_ABILITIES.some((a) => a.id === abilityId)
}

function daValidateSpecimenId(specimenId: string): boolean {
  return DA_SPECIMENS.some((s) => s.id === specimenId)
}

function daValidateEventId(eventId: string): boolean {
  return DA_EVENTS.some((e) => e.id === eventId)
}

function daGetCreatureBySpecies(species: DASpecies): DACreatureDef[] {
  return DA_FISH.filter((f) => f.species === species)
}

function daGetCreatureByRarity(rarity: DARarity): DACreatureDef[] {
  return DA_FISH.filter((f) => f.rarity === rarity)
}

function daGetMaterialsByRarity(rarity: DARarity): DAMaterialDef[] {
  return DA_MATERIALS.filter((m) => m.rarity === rarity)
}

function daGetTankByLevel(level: number): DATankDef[] {
  return DA_TANKS.filter((t) => t.minLevel <= level)
}

function daGetAchievementsByReward(rewardType: string): DAAchievementDef[] {
  return DA_ACHIEVEMENTS.filter((a) => a.reward.toLowerCase().includes(rewardType.toLowerCase()))
}

function daGetAbilitiesBySpecies(species: DASpecies): DAAbilityDef[] {
  return DA_ABILITIES.filter((a) => a.species === species)
}

function daGetEventsBySeverity(minSeverity: number): DAEventDef[] {
  return DA_EVENTS.filter((e) => e.severity >= minSeverity)
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const useDAStore = create<DAFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      aquariumCreatures: [] as DAAquariumCreature[],
      collectedMaterials: {} as Record<string, number>,
      decorations: [] as DAOwnedDecoration[],
      achievements: [] as string[],
      currentTitle: 'title_tide_pool_novice',
      collectedSpecimens: [] as string[],
      unlockedTanks: ['tide_pool_tank'] as string[],
      aquaristLevel: 1,
      aquaristExp: 0,
      pearls: DA_INITIAL_PEARLS,
      bioEnergy: DA_INITIAL_ENERGY,
      totalCreaturesAdded: 0,
      totalFed: 0,
      totalUpgraded: 0,
      totalBred: 0,
      totalCollected: 0,
      activeEventId: null as string | null,
      eventTimer: 0,
      tank: {
        health: 100,
        maxHealth: 100,
        pollution: 0,
        lastCleanedAt: null,
        lightingLevel: 50,
        filterInstalled: false,
      } as DATankState,
      activeTankId: 'tide_pool_tank' as string | null,

      // ── daAddCreature ──────────────────────────────────────────
      daAddCreature: (creatureId: string): boolean => {
        const state = get()
        const creatureDef = DA_FISH.find((c) => c.id === creatureId)
        if (!creatureDef) return false
        const activeTank = DA_TANKS.find((t) => t.id === state.activeTankId)
        if (activeTank && state.aquaristLevel < activeTank.minLevel) return false

        const captureCost = Math.floor(10 * daRarityMultiplier(creatureDef.rarity))
        if (state.bioEnergy < captureCost) return false
        if (state.aquariumCreatures.some((c) => c.creatureDefId === creatureId)) return false

        const newXp = state.aquaristExp + creatureDef.basePower
        const newLevel = daLevelFromXp(newXp)

        set((prev) => ({
          aquariumCreatures: [
            ...prev.aquariumCreatures,
            {
              id: daGenerateId(),
              creatureDefId: creatureId,
              name: creatureDef.name,
              level: 1,
              currentHP: creatureDef.basePower * 10,
              maxHP: creatureDef.basePower * 10,
              power: creatureDef.basePower,
              fed: false,
              lastFedAt: null,
              acquiredAt: Date.now(),
            },
          ],
          bioEnergy: Math.max(0, prev.bioEnergy - captureCost),
          aquaristExp: newXp,
          aquaristLevel: newLevel,
          pearls: prev.pearls + Math.floor(creatureDef.basePower * 0.5),
          totalCreaturesAdded: prev.totalCreaturesAdded + 1,
        }))
        return true
      },

      // ── daFeedFish ─────────────────────────────────────────────
      daFeedFish: (creatureId: string): boolean => {
        const state = get()
        const creature = state.aquariumCreatures.find((c) => c.id === creatureId)
        if (!creature) return false
        if (state.bioEnergy < 3) return false
        if (creature.fed) return false

        set((prev) => ({
          aquariumCreatures: prev.aquariumCreatures.map((c) =>
            c.id === creatureId
              ? {
                  ...c,
                  fed: true,
                  lastFedAt: Date.now(),
                  currentHP: Math.min(c.maxHP, c.currentHP + Math.floor(c.maxHP * 0.2)),
                }
              : c
          ),
          bioEnergy: Math.max(0, prev.bioEnergy - 3),
          totalFed: prev.totalFed + 1,
        }))
        return true
      },

      // ── daUpgradeTank ──────────────────────────────────────────
      daUpgradeTank: (decorationId: string): boolean => {
        const state = get()
        const decoDef = DA_DECORATIONS.find((d) => d.id === decorationId)
        if (!decoDef) return false

        const owned = state.decorations.find((d) => d.decorationDefId === decorationId)
        if (!owned) {
          if (state.pearls < decoDef.baseCost) return false
          const newXp = state.aquaristExp + 20
          const newLevel = daLevelFromXp(newXp)
          set((prev) => ({
            decorations: [
              ...prev.decorations,
              {
                id: daGenerateId(),
                decorationDefId: decorationId,
                level: 1,
                placed: true,
              },
            ],
            pearls: prev.pearls - decoDef.baseCost,
            aquaristExp: newXp,
            aquaristLevel: newLevel,
            totalUpgraded: prev.totalUpgraded + 1,
          }))
          return true
        }

        if (owned.level >= 10) return false
        const upgradeCost = Math.floor(decoDef.baseCost * Math.pow(decoDef.costMultiplier, owned.level))
        if (state.pearls < upgradeCost) return false

        const newXp = state.aquaristExp + 25
        const newLevel = daLevelFromXp(newXp)
        set((prev) => ({
          decorations: prev.decorations.map((d) =>
            d.id === owned.id ? { ...d, level: d.level + 1 } : d
          ),
          pearls: prev.pearls - upgradeCost,
          aquaristExp: newXp,
          aquaristLevel: newLevel,
          totalUpgraded: prev.totalUpgraded + 1,
        }))
        return true
      },

      // ── daUseAbility ───────────────────────────────────────────
      daUseAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = DA_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (state.bioEnergy < ability.cooldown) return false

        set((prev) => ({
          bioEnergy: Math.max(0, prev.bioEnergy - ability.cooldown),
        }))
        return true
      },

      // ── daHandleTankEvent ──────────────────────────────────────
      daHandleTankEvent: (eventId: string): boolean => {
        const state = get()
        const event = DA_EVENTS.find((e) => e.id === eventId)
        if (!event) return false
        if (state.activeEventId !== null) return false

        set((prev) => ({
          activeEventId: eventId,
          eventTimer: event.duration,
          tank: {
            ...prev.tank,
            pollution: event.severity >= 4
              ? Math.min(100, prev.tank.pollution + event.severity * 5)
              : prev.tank.pollution,
            health: event.severity >= 3
              ? Math.max(0, prev.tank.health - event.severity * 3)
              : prev.tank.health,
          },
        }))
        return true
      },

      // ── daCollectSpecimen ──────────────────────────────────────
      daCollectSpecimen: (specimenId: string): boolean => {
        const state = get()
        const specimen = DA_SPECIMENS.find((s) => s.id === specimenId)
        if (!specimen) return false
        if (state.collectedSpecimens.includes(specimenId)) return false

        const specimenCost = Math.floor(20 * daRarityMultiplier(specimen.rarity))
        if (state.pearls < specimenCost) return false

        const newXp = state.aquaristExp + specimen.powerBonus
        const newLevel = daLevelFromXp(newXp)
        set((prev) => ({
          collectedSpecimens: [...prev.collectedSpecimens, specimenId],
          pearls: prev.pearls - specimenCost,
          aquaristExp: newXp,
          aquaristLevel: newLevel,
          totalCollected: prev.totalCollected + 1,
        }))
        return true
      },

      // ── daBreedCreature ────────────────────────────────────────
      daBreedCreature: (parentAId: string, parentBId: string): boolean => {
        const state = get()
        const parentA = state.aquariumCreatures.find((c) => c.id === parentAId)
        const parentB = state.aquariumCreatures.find((c) => c.id === parentBId)
        if (!parentA || !parentB) return false
        if (parentA.id === parentB.id) return false
        if (state.aquaristLevel < 10) return false

        const breedTier = daGetBreedTier(state.aquaristLevel)
        const breedCost = breedTier.materialCost
        if (state.pearls < breedCost) return false

        const defA = DA_FISH.find((d) => d.id === parentA.creatureDefId)
        if (!defA) return false

        const newXp = state.aquaristExp + 30
        const newLevel = daLevelFromXp(newXp)
        set((prev) => ({
          aquariumCreatures: [
            ...prev.aquariumCreatures,
            {
              id: daGenerateId(),
              creatureDefId: defA.id,
              name: `${defA.name} Jr.`,
              level: 1,
              currentHP: defA.basePower * 10,
              maxHP: defA.basePower * 10,
              power: Math.floor(defA.basePower * 1.1),
              fed: false,
              lastFedAt: null,
              acquiredAt: Date.now(),
            },
          ],
          pearls: prev.pearls - breedCost,
          aquaristExp: newXp,
          aquaristLevel: newLevel,
          totalBred: prev.totalBred + 1,
        }))
        return true
      },

      // ── daCleanTank ────────────────────────────────────────────
      daCleanTank: (): boolean => {
        const state = get()
        if (state.tank.pollution <= 0) return false
        if (state.bioEnergy < 10) return false

        set((prev) => ({
          tank: {
            ...prev.tank,
            pollution: Math.max(0, prev.tank.pollution - 30),
            lastCleanedAt: Date.now(),
          },
          bioEnergy: Math.max(0, prev.bioEnergy - 10),
        }))
        return true
      },

      // ── daAdjustLighting ───────────────────────────────────────
      daAdjustLighting: (level: number): boolean => {
        const state = get()
        if (level < 0 || level > 100) return false
        if (level === state.tank.lightingLevel) return false

        const energyCost = Math.abs(level - state.tank.lightingLevel)
        if (state.bioEnergy < energyCost) return false

        set((prev) => ({
          tank: {
            ...prev.tank,
            lightingLevel: level,
          },
          bioEnergy: Math.max(0, prev.bioEnergy - energyCost),
        }))
        return true
      },

      // ── daInstallFilter ────────────────────────────────────────
      daInstallFilter: (): boolean => {
        const state = get()
        if (state.tank.filterInstalled) return false
        if (state.pearls < 500) return false

        set((prev) => ({
          tank: {
            ...prev.tank,
            filterInstalled: true,
          },
          pearls: prev.pearls - 500,
        }))
        return true
      },
    }),
    {
      name: 'dark-aquarium-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: HOOK — useDarkAquarium
// ═══════════════════════════════════════════════════════════════════

export default function useDarkAquarium() {
  const store = useDAStore()

  // ── Getter: Tank Details ──────────────────────────────────────
  const daGetTankDetails = useMemo(() => {
    const activeTank = DA_TANKS.find((t) => t.id === store.activeTankId)
    if (!activeTank) {
      return { tank: null, creatures: [], decorations: [], materials: [] }
    }
    const creaturesInTank = store.aquariumCreatures
    const decorationsInTank = store.decorations.filter((d) => d.placed)
    const materialsAvailable = DA_MATERIALS.filter((m) => m.source === store.activeTankId)
    return { tank: activeTank, creatures: creaturesInTank, decorations: decorationsInTank, materials: materialsAvailable }
  }, [store.activeTankId, store.aquariumCreatures, store.decorations])

  // ── Getter: Material Inventory ────────────────────────────────
  const daGetMaterialInventory = useMemo(() => {
    const inventory: { material: DAMaterialDef; quantity: number }[] = []
    for (const mat of DA_MATERIALS) {
      const qty = store.collectedMaterials[mat.id] || 0
      if (qty > 0) {
        inventory.push({ material: mat, quantity: qty })
      }
    }
    return inventory.sort((a, b) => b.material.value - a.material.value)
  }, [store.collectedMaterials])

  // ── Getter: Aquarium Creatures ────────────────────────────────
  const daGetAquariumCreatures = useMemo(() => {
    return store.aquariumCreatures.map((c) => {
      const def = DA_FISH.find((d) => d.id === c.creatureDefId)
      return {
        instance: c,
        definition: def || null,
        speciesColor: def ? daSpeciesColor(def.species) : DA_COLOR_PEARL_WHITE,
        rarityColor: def ? daRarityColor(def.rarity) : '#9CA3AF',
      }
    })
  }, [store.aquariumCreatures])

  // ── Getter: Decoration List ───────────────────────────────────
  const daGetDecorationList = useMemo(() => {
    return store.decorations.map((d) => {
      const def = DA_DECORATIONS.find((dd) => dd.id === d.decorationDefId)
      const upgradeCost = def
        ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, d.level))
        : 0
      return {
        instance: d,
        definition: def || null,
        upgradeCost,
        maxLevel: 10,
        canUpgrade: d.level < 10,
      }
    })
  }, [store.decorations])

  // ── Getter: Total Power ───────────────────────────────────────
  const daGetTotalPower = useMemo(() => {
    let creaturePower = 0
    for (const c of store.aquariumCreatures) {
      const def = DA_FISH.find((d) => d.id === c.creatureDefId)
      if (!def) continue
      const rarityMult = daRarityMultiplier(def.rarity)
      creaturePower += Math.floor(
        c.power * rarityMult * (1 + c.level * 0.15)
      )
    }
    const decorationPower = store.decorations.reduce(
      (sum, d) => sum + daGetDecorationBonus(d.decorationDefId, d.level),
      0
    )
    const specimenPower = store.collectedSpecimens.reduce((sum, sId) => {
      const specimen = DA_SPECIMENS.find((s) => s.id === sId)
      return sum + (specimen ? specimen.powerBonus : 0)
    }, 0)
    return { creaturePower, decorationPower, specimenPower, total: creaturePower + decorationPower + specimenPower }
  }, [store])

  // ── Getter: Event Status ──────────────────────────────────────
  const daGetEventStatus = useMemo(() => {
    if (!store.activeEventId) {
      return { active: false, event: null, timer: 0, severity: 0 }
    }
    const event = DA_EVENTS.find((e) => e.id === store.activeEventId)
    return {
      active: true,
      event: event || null,
      timer: store.eventTimer,
      severity: event ? event.severity : 0,
    }
  }, [store.activeEventId, store.eventTimer])

  // ── Getter: Active Event ──────────────────────────────────────
  const daGetActiveEvent = useMemo(() => {
    if (!store.activeEventId) return null
    return DA_EVENTS.find((e) => e.id === store.activeEventId) || null
  }, [store.activeEventId])

  // ── Getter: Next Title ────────────────────────────────────────
  const daGetNextTitle = useMemo(() => {
    const currentTitle = DA_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitle ? DA_TITLES.indexOf(currentTitle) : -1
    if (currentIndex >= DA_TITLES.length - 1) return null
    return DA_TITLES[currentIndex + 1]
  }, [store.currentTitle])

  // ── Getter: Rarity Summary ────────────────────────────────────
  const daGetRaritySummary = useMemo(() => {
    const summary: Record<DARarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const c of store.aquariumCreatures) {
      const def = DA_FISH.find((d) => d.id === c.creatureDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const sId of store.collectedSpecimens) {
      const specimen = DA_SPECIMENS.find((s) => s.id === sId)
      if (specimen) {
        summary[specimen.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Tank Summary ──────────────────────────────────────
  const daGetTankSummary = useMemo(() => {
    const totalTanks = DA_TANKS.length
    const unlocked = store.unlockedTanks.length
    return {
      totalTanks,
      unlocked,
      percent: Math.floor((unlocked / totalTanks) * 100),
      allUnlocked: unlocked >= totalTanks,
    }
  }, [store.unlockedTanks])

  // ── Getter: Unlocked Achievements ─────────────────────────────
  const daGetUnlockedAchievements = useMemo(() => {
    const unlocked: DAAchievementDef[] = []
    for (const ach of DA_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      }
    }
    return unlocked
  }, [store.achievements])

  // ── Getter: Title Progress ────────────────────────────────────
  const daGetTitleProgress = useMemo(() => {
    const titles: { title: DATitleDef; unlocked: boolean; progress: number }[] = []
    for (const t of DA_TITLES) {
      const unlocked = store.achievements.includes(t.id) || store.currentTitle === t.id
      const levelProgress = Math.min(100, Math.floor((store.aquaristLevel / t.requiredLevel) * 100))
      const tankProgress = Math.min(100, Math.floor((store.unlockedTanks.length / t.requiredTanks) * 100))
      const overallProgress = Math.floor((levelProgress + tankProgress) / 2)
      titles.push({ title: t, unlocked, progress: overallProgress })
    }
    return titles
  }, [store.achievements, store.currentTitle, store.aquaristLevel, store.unlockedTanks])

  // ── Getter: Collected Specimens ───────────────────────────────
  const daGetCollectedSpecimens = useMemo(() => {
    return store.collectedSpecimens.map((sId) => {
      const specimen = DA_SPECIMENS.find((s) => s.id === sId)
      return specimen || null
    }).filter((s): s is DASpecimenDef => s !== null)
  }, [store.collectedSpecimens])

  // ── Getter: Tank Health ───────────────────────────────────────
  const daGetTankHealth = useMemo(() => {
    const tankHealth = store.tank
    return {
      health: tankHealth.health,
      maxHealth: tankHealth.maxHealth,
      healthPercent: Math.floor((tankHealth.health / tankHealth.maxHealth) * 100),
      pollution: tankHealth.pollution,
      pollutionPercent: tankHealth.pollution,
      lastCleanedAt: tankHealth.lastCleanedAt,
      lightingLevel: tankHealth.lightingLevel,
      filterInstalled: tankHealth.filterInstalled,
    }
  }, [store.tank])

  // ── Getter: Capture Costs ─────────────────────────────────────
  const daGetCaptureCosts = useMemo(() => {
    const costs: { creature: DACreatureDef; cost: number }[] = []
    for (const fish of DA_FISH) {
      const cost = Math.floor(10 * daRarityMultiplier(fish.rarity))
      costs.push({ creature: fish, cost })
    }
    return costs
  }, [])

  // ── Getter: Level Progress ────────────────────────────────────
  const daLevelProgress = useMemo(() => {
    const currentLevelXp = daXpForLevel(store.aquaristLevel)
    const nextLevelXp = daXpForLevel(store.aquaristLevel + 1)
    if (nextLevelXp === Infinity) {
      return { currentLevel: store.aquaristLevel, currentXp: store.aquaristExp, nextLevelXp: Infinity, progress: 100 }
    }
    const progress = Math.floor(((store.aquaristExp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
    return {
      currentLevel: store.aquaristLevel,
      currentXp: store.aquaristExp,
      nextLevelXp,
      progress: Math.max(0, Math.min(100, progress)),
    }
  }, [store.aquaristLevel, store.aquaristExp])

  // ── Getter: Ability List ──────────────────────────────────────
  const daGetAbilityList = useMemo(() => {
    return DA_ABILITIES.map((ability) => ({
      ...ability,
      canUse: store.bioEnergy >= ability.cooldown,
      speciesColor: daSpeciesColor(ability.species),
    }))
  }, [store.bioEnergy])

  // ── Getter: Event List ────────────────────────────────────────
  const daGetEventList = useMemo(() => {
    return DA_EVENTS.map((event) => ({
      ...event,
      isActive: store.activeEventId === event.id,
      color: event.severity >= 4 ? DA_COLOR_MAGMA_ORANGE : event.severity >= 2 ? DA_COLOR_CORAL_PINK : DA_COLOR_BIOLUM_CYAN,
    }))
  }, [store.activeEventId])

  // ── Getter: Stats Summary ─────────────────────────────────────
  const daGetStatsSummary = useMemo(() => {
    return {
      totalCreatures: store.aquariumCreatures.length,
      totalMaterials: Object.values(store.collectedMaterials).reduce((a, b) => a + b, 0),
      totalDecorations: store.decorations.length,
      totalSpecimens: store.collectedSpecimens.length,
      totalAchievements: store.achievements.length,
      totalFed: store.totalFed,
      totalBred: store.totalBred,
      totalCollected: store.totalCollected,
    }
  }, [store])

  // ── Getter: Creature Count by Species ─────────────────────────
  const daGetCreatureCountBySpecies = useMemo(() => {
    const counts: Record<DASpecies, number> = {
      Abyssal: 0,
      Trench: 0,
      Bioluminescent: 0,
      'Volcanic Vent': 0,
      'Frozen Deep': 0,
      'Coral Crypt': 0,
      'Kelp Forest': 0,
    }
    for (const c of store.aquariumCreatures) {
      const def = DA_FISH.find((d) => d.id === c.creatureDefId)
      if (def) {
        counts[def.species] += 1
      }
    }
    return counts
  }, [store.aquariumCreatures])

  // ── Getter: Upgrade Costs ─────────────────────────────────────
  const daGetUpgradeCosts = useMemo(() => {
    const costs: { decoration: DADecorationDef; currentLevel: number; cost: number; canUpgrade: boolean }[] = []
    for (const deco of DA_DECORATIONS) {
      const owned = store.decorations.find((d) => d.decorationDefId === deco.id)
      const currentLevel = owned ? owned.level : 0
      const cost = owned
        ? Math.floor(deco.baseCost * Math.pow(deco.costMultiplier, owned.level))
        : deco.baseCost
      const canUpgrade = currentLevel < 10
      costs.push({ decoration: deco, currentLevel, cost, canUpgrade })
    }
    return costs
  }, [store.decorations])

  // ── Getter: Specimen Bonus ────────────────────────────────────
  const daGetSpecimenBonus = useMemo(() => {
    const structureBonus = store.decorations.reduce((sum, d) => {
      return sum + daGetDecorationBonus(d.decorationDefId, d.level)
    }, 0)
    const specimenBonus = store.collectedSpecimens.reduce((sum, sId) => {
      const specimen = DA_SPECIMENS.find((s) => s.id === sId)
      return sum + (specimen ? Math.floor(specimen.powerBonus * 0.2) : 0)
    }, 0)
    return {
      baseRegen: 1,
      decorationBonus: structureBonus,
      specimenBonus,
      totalRegen: 1 + structureBonus + specimenBonus,
    }
  }, [store])

  // ── Getter: Breed Tier Details ────────────────────────────────
  const daGetBreedTierDetails = useMemo(() => {
    const tier = daGetBreedTier(store.aquaristLevel)
    return {
      currentTier: tier,
      nextTier: DA_BREED_TIERS.find((t) => t.requiredLevel > store.aquaristLevel) || null,
      canBreed: store.aquaristLevel >= 10 && store.pearls >= tier.materialCost,
    }
  }, [store.aquaristLevel, store.pearls])

  // ── Getter: Tank Materials ────────────────────────────────────
  const daGetTankMaterialsList = useMemo(() => {
    if (!store.activeTankId) return []
    const map = daGetTankMaterials(store.activeTankId)
    if (!map) return []
    const materials = map.materialIds
      .map((id) => DA_MATERIALS.find((m) => m.id === id))
      .filter((m): m is DAMaterialDef => m !== null)
    const bonusMaterials = map.bonusMaterialIds
      .map((id) => DA_MATERIALS.find((m) => m.id === id))
      .filter((m): m is DAMaterialDef => m !== null)
    return { materials, bonusMaterials }
  }, [store.activeTankId])

  // ── Getter: Bio Energy Efficiency ─────────────────────────────
  const daGetBioEfficiency = useMemo(() => {
    const structureBonus = store.decorations.reduce((sum, d) => {
      return sum + daGetDecorationBonus(d.decorationDefId, d.level)
    }, 0)
    const specimenBonus = store.collectedSpecimens.reduce((sum, sId) => {
      const specimen = DA_SPECIMENS.find((s) => s.id === sId)
      return sum + (specimen ? Math.floor(specimen.powerBonus * 0.2) : 0)
    }, 0)
    return {
      baseRegen: 1,
      structureBonus,
      specimenBonus,
      totalRegen: 1 + structureBonus + specimenBonus,
    }
  }, [store])

  // ── Getter: Species Interactions ──────────────────────────────
  const daGetSpeciesInteractions = useMemo(() => {
    return DA_SPECIES_INTERACTIONS.map((interaction) => ({
      ...interaction,
      attackerColor: daSpeciesColor(interaction.attacker),
      defenderColor: daSpeciesColor(interaction.defender),
    }))
  }, [])

  // ── Getter: Fed Creatures Summary ─────────────────────────────
  const daGetFedSummary = useMemo(() => {
    const totalCreatures = store.aquariumCreatures.length
    const fedCreatures = store.aquariumCreatures.filter((c) => c.fed).length
    const hungryCreatures = totalCreatures - fedCreatures
    return {
      total: totalCreatures,
      fed: fedCreatures,
      hungry: hungryCreatures,
      allFed: hungryCreatures === 0,
      feedPercent: totalCreatures > 0 ? Math.floor((fedCreatures / totalCreatures) * 100) : 100,
    }
  }, [store.aquariumCreatures])

  // ── Assemble daAPI ────────────────────────────────────────────
  const daAPI = {
    // Constants
    DA_FISH,
    DA_TANKS,
    DA_MATERIALS,
    DA_DECORATIONS,
    DA_ABILITIES,
    DA_ACHIEVEMENTS,
    DA_TITLES,
    DA_SPECIMENS,
    DA_EVENTS,
    DA_COLOR_DEEP_NAVY,
    DA_COLOR_BIOLUM_CYAN,
    DA_COLOR_ABYSSAL_BLACK,
    DA_COLOR_CORAL_PINK,
    DA_COLOR_KELP_GREEN,
    DA_COLOR_SAND_BEIGE,
    DA_COLOR_PEARL_WHITE,
    DA_COLOR_MAGMA_ORANGE,

    // State
    aquariumCreatures: store.aquariumCreatures,
    collectedMaterials: store.collectedMaterials,
    decorations: store.decorations,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    collectedSpecimens: store.collectedSpecimens,
    unlockedTanks: store.unlockedTanks,
    aquaristLevel: store.aquaristLevel,
    aquaristExp: store.aquaristExp,
    pearls: store.pearls,
    bioEnergy: store.bioEnergy,
    totalCreaturesAdded: store.totalCreaturesAdded,
    totalFed: store.totalFed,
    totalUpgraded: store.totalUpgraded,
    totalBred: store.totalBred,
    totalCollected: store.totalCollected,
    activeEventId: store.activeEventId,
    eventTimer: store.eventTimer,
    tank: store.tank,
    activeTankId: store.activeTankId,

    // Actions
    daAddCreature: store.daAddCreature,
    daFeedFish: store.daFeedFish,
    daUpgradeTank: store.daUpgradeTank,
    daUseAbility: store.daUseAbility,
    daHandleTankEvent: store.daHandleTankEvent,
    daCollectSpecimen: store.daCollectSpecimen,
    daBreedCreature: store.daBreedCreature,
    daCleanTank: store.daCleanTank,
    daAdjustLighting: store.daAdjustLighting,
    daInstallFilter: store.daInstallFilter,

    // Getters
    daGetTankDetails,
    daGetMaterialInventory,
    daGetAquariumCreatures,
    daGetDecorationList,
    daGetTotalPower,
    daGetEventStatus,
    daGetActiveEvent,
    daGetNextTitle,
    daGetRaritySummary,
    daGetTankSummary,
    daGetUnlockedAchievements,
    daGetTitleProgress,
    daGetCollectedSpecimens,
    daGetTankHealth,
    daGetCaptureCosts,
    daLevelProgress,
    daGetAbilityList,
    daGetEventList,
    daGetStatsSummary,
    daGetCreatureCountBySpecies,
    daGetUpgradeCosts,
    daGetSpecimenBonus,
    daGetBreedTierDetails,
    daGetTankMaterialsList,
    daGetBioEfficiency,
    daGetSpeciesInteractions,
    daGetFedSummary,
  }

  return daAPI
}
