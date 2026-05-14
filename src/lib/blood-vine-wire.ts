/**
 * Blood Vine Wire — 血藤 (Blood Vine) feature module
 *
 * Vampiric vines that drain life force from the earth and creatures:
 * nurture 35 thorned creatures across 5 rarity tiers and 7 species,
 * explore 8 dark groves, collect 30 blood materials, build 25 vine
 * structures, wield 22 vine abilities, earn 18 achievements, claim 8
 * titles from Seedling to Blood Emperor, gather 15 legendary artifacts,
 * and survive 12 blood events — backed by a Zustand store with persist
 * middleware.
 *
 * Storage key: blood-vine-wire
 * Prefix: bv / BV_
 */

import { useMemo, useEffect, useRef, useCallback } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type BvRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type BvSpecies =
  | 'blood_vine'
  | 'thorn_drake'
  | 'root_leech'
  | 'crimson_willow'
  | 'scarlet_mantis'
  | 'venom_ivy'
  | 'ember_bramble'

export type BvElement =
  | 'sanguine'
  | 'thorned'
  | 'necrotic'
  | 'verdant'
  | 'blazing'
  | 'toxic'
  | 'ember'

export interface BvCreatureDef {
  readonly id: string
  readonly name: string
  readonly species: BvSpecies
  readonly rarity: BvRarity
  readonly description: string
  readonly basePower: number
  readonly drainRate: number
  readonly ability: string
}

export interface BvGroveDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
}

export interface BvMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: BvRarity
  readonly source: string
  readonly value: number
}

export interface BvStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
}

export interface BvAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: BvElement
}

export interface BvAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface BvTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredGroves: number
}

export interface BvArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: BvRarity
  readonly powerBonus: number
  readonly specialAbility: string
}

export interface BvEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface BvOwnedCreature {
  readonly id: string
  creatureDefId: string
  level: number
  drainCount: number
  power: number
  awakened: boolean
  acquiredAt: number
}

export interface BvOwnedStructure {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface BvVineState {
  bloodEssence: number
  maxBloodEssence: number
  corruption: number
  lastDrainAt: number | null
}

export interface BvStoreState {
  ownedCreatures: BvOwnedCreature[]
  collectedMaterials: Record<string, number>
  structures: BvOwnedStructure[]
  achievements: string[]
  currentTitle: string
  collectedArtifacts: string[]
  unlockedGroves: string[]
  bvLevel: number
  bvExp: number
  bvBloodEssence: number
  bvVineSpread: number
  gold: number
  totalDrained: number
  totalCollected: number
  totalUpgraded: number
  totalThornsPlanted: number
  totalBloomed: number
  totalEntangled: number
  activeEventId: string | null
  eventTimer: number
  vineSanctuary: BvVineState
  activeGroveId: string | null
}

export interface BvStoreActions {
  bvDrain: (creatureId: string) => boolean
  bvPlantThorn: (structureId: string) => boolean
  bvEntangle: (targetId: string) => boolean
  bvBloomBlood: (targetId: string) => boolean
  bvCollectMaterial: (materialId: string) => number
  bvUpgradeStructure: (structureId: string) => boolean
  bvUseAbility: (abilityId: string) => boolean
  bvTriggerEvent: (eventId: string) => boolean
  bvAcquireArtifact: (artifactId: string) => boolean
  bvAwakenThorned: (instanceId: string) => boolean
}

export type BvFullStore = BvStoreState & BvStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const BV_COLOR_BLOOD_RED: string = '#8B0000'
export const BV_COLOR_VINE_GREEN: string = '#228B22'
export const BV_COLOR_THORN_CRIMSON: string = '#DC143C'
export const BV_COLOR_PETAL_BURGUNDY: string = '#800020'
export const BV_COLOR_DARK_SOIL: string = '#1A0A0A'
export const BV_COLOR_SAP_GOLD: string = '#B8860B'
export const BV_COLOR_MIST_VIOLET: string = '#4B0082'
export const BV_COLOR_EMBER_ORANGE: string = '#CC5500'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const BV_MAX_LEVEL = 50
const BV_INITIAL_GOLD = 500

function bvXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= BV_MAX_LEVEL) return Infinity
  return Math.floor(90 * Math.pow(1.12, level) + level * 18)
}

function bvLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < BV_MAX_LEVEL) {
    const needed = bvXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function bvGenerateId(): string {
  return `bv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function bvRarityMultiplier(rarity: BvRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function bvSpeciesColor(species: BvSpecies): string {
  switch (species) {
    case 'blood_vine': return BV_COLOR_BLOOD_RED
    case 'thorn_drake': return BV_COLOR_THORN_CRIMSON
    case 'root_leech': return BV_COLOR_PETAL_BURGUNDY
    case 'crimson_willow': return BV_COLOR_VINE_GREEN
    case 'scarlet_mantis': return BV_COLOR_SAP_GOLD
    case 'venom_ivy': return BV_COLOR_MIST_VIOLET
    case 'ember_bramble': return BV_COLOR_EMBER_ORANGE
  }
}

function bvElementColor(element: BvElement): string {
  switch (element) {
    case 'sanguine': return BV_COLOR_BLOOD_RED
    case 'thorned': return BV_COLOR_THORN_CRIMSON
    case 'necrotic': return BV_COLOR_PETAL_BURGUNDY
    case 'verdant': return BV_COLOR_VINE_GREEN
    case 'blazing': return BV_COLOR_EMBER_ORANGE
    case 'toxic': return BV_COLOR_MIST_VIOLET
    case 'ember': return BV_COLOR_SAP_GOLD
  }
}

function bvRarityColor(rarity: BvRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#A855F7'
    case 'rare': return '#DC2626'
    case 'epic': return '#7C3AED'
    case 'legendary': return '#FBBF24'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: SPECIES BONUSES & DRAIN CHANCES
// ═══════════════════════════════════════════════════════════════════

const BV_SPECIES_BONUSES: Record<BvSpecies, { strength: number; drainBonus: number; defense: number }> = {
  blood_vine: { strength: 15, drainBonus: 20, defense: 5 },
  thorn_drake: { strength: 25, drainBonus: 5, defense: 15 },
  root_leech: { strength: 10, drainBonus: 30, defense: 0 },
  crimson_willow: { strength: 8, drainBonus: 10, defense: 25 },
  scarlet_mantis: { strength: 22, drainBonus: 8, defense: 12 },
  venom_ivy: { strength: 12, drainBonus: 15, defense: 18 },
  ember_bramble: { strength: 20, drainBonus: 12, defense: 10 },
}

const BV_DRAIN_CHANCES: Record<BvRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
}

const BV_GROVE_SPECIES_BONUS: Record<string, BvSpecies[]> = {
  bleeding_heart_garden: ['blood_vine', 'crimson_willow'],
  crimson_canopy: ['thorn_drake', 'scarlet_mantis'],
  thorn_labyrinth: ['thorn_drake', 'ember_bramble'],
  blood_root_hollow: ['root_leech', 'blood_vine'],
  sanguine_terrace: ['crimson_willow', 'venom_ivy'],
  ember_bramble_maze: ['ember_bramble', 'scarlet_mantis'],
  scarlet_depths: ['venom_ivy', 'root_leech'],
  vampire_orchard: ['blood_vine', 'thorn_drake', 'root_leech', 'crimson_willow', 'scarlet_mantis', 'venom_ivy', 'ember_bramble'],
}

function bvGetSpeciesBonus(species: BvSpecies): { strength: number; drainBonus: number; defense: number } {
  return BV_SPECIES_BONUSES[species]
}

function bvGetDrainChance(rarity: BvRarity, activeGroveId: string | null): number {
  let chance = BV_DRAIN_CHANCES[rarity]
  if (activeGroveId) {
    const bonusSpecies = BV_GROVE_SPECIES_BONUS[activeGroveId]
    if (bonusSpecies && bonusSpecies.length > 2) {
      chance = chance * 1.5
    }
  }
  return Math.min(100, Math.floor(chance))
}

function bvGetDrainBonus(level: number, drainCount: number): number {
  return Math.floor(level * 12 * (1 + drainCount * 0.25))
}

function bvGetStructureBonus(structureId: string, level: number): number {
  switch (structureId) {
    case 'blood_vine_altar': return level * 2
    case 'thorn_summoning_circle': return level * 5
    case 'crimson_conduit': return level * 8
    case 'sanguine_beacon': return level * 12
    case 'vine_emperor_gate': return level * 20
    case 'blood_sap_well': return level * 3
    case 'ember_forge': return level * 7
    case 'root_ritual_altar': return level * 15
    default: return level * 2
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4b: SPECIES SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

interface BvSynergyPair {
  drainBonus: number
  defenseBonus: number
}

const _BV_SPECIES_SYNERGY_DATA = {
  blood_vine_thorn_drake: { drainBonus: 10, defenseBonus: 5 },
  blood_vine_root_leech: { drainBonus: 25, defenseBonus: 0 },
  blood_vine_crimson_willow: { drainBonus: 5, defenseBonus: 15 },
  blood_vine_scarlet_mantis: { drainBonus: 8, defenseBonus: 8 },
  blood_vine_venom_ivy: { drainBonus: 12, defenseBonus: 10 },
  blood_vine_ember_bramble: { drainBonus: 7, defenseBonus: 3 },
  thorn_drake_root_leech: { drainBonus: 5, defenseBonus: 10 },
  thorn_drake_crimson_willow: { drainBonus: 3, defenseBonus: 20 },
  thorn_drake_scarlet_mantis: { drainBonus: 5, defenseBonus: 15 },
  thorn_drake_venom_ivy: { drainBonus: 8, defenseBonus: 12 },
  thorn_drake_ember_bramble: { drainBonus: 10, defenseBonus: 5 },
  root_leech_crimson_willow: { drainBonus: 15, defenseBonus: 12 },
  root_leech_scarlet_mantis: { drainBonus: 10, defenseBonus: 5 },
  root_leech_venom_ivy: { drainBonus: 20, defenseBonus: 8 },
  root_leech_ember_bramble: { drainBonus: 8, defenseBonus: 2 },
  crimson_willow_scarlet_mantis: { drainBonus: 3, defenseBonus: 18 },
  crimson_willow_venom_ivy: { drainBonus: 5, defenseBonus: 22 },
  crimson_willow_ember_bramble: { drainBonus: 4, defenseBonus: 15 },
  scarlet_mantis_venom_ivy: { drainBonus: 10, defenseBonus: 15 },
  scarlet_mantis_ember_bramble: { drainBonus: 6, defenseBonus: 10 },
  venom_ivy_ember_bramble: { drainBonus: 12, defenseBonus: 5 },
} as const

const BV_SPECIES_SYNERGY: Record<string, BvSynergyPair> = _BV_SPECIES_SYNERGY_DATA as unknown as Record<string, BvSynergyPair>

export function bvGetSynergyBonus(speciesA: BvSpecies, speciesB: BvSpecies): { drainBonus: number; defenseBonus: number } {
  const keyA = `${speciesA}_${speciesB}`
  const keyB = `${speciesB}_${speciesA}`
  const result = BV_SPECIES_SYNERGY[keyA] || BV_SPECIES_SYNERGY[keyB]
  if (result) {
    return { drainBonus: result.drainBonus, defenseBonus: result.defenseBonus }
  }
  return { drainBonus: 0, defenseBonus: 0 }
}

const BV_DRAIN_EFFICIENCY_TABLE: Record<BvRarity, { minLevel: number; baseEfficiency: number; maxEfficiency: number }> = {
  common: { minLevel: 1, baseEfficiency: 10, maxEfficiency: 50 },
  uncommon: { minLevel: 5, baseEfficiency: 20, maxEfficiency: 80 },
  rare: { minLevel: 12, baseEfficiency: 35, maxEfficiency: 120 },
  epic: { minLevel: 25, baseEfficiency: 60, maxEfficiency: 200 },
  legendary: { minLevel: 40, baseEfficiency: 100, maxEfficiency: 400 },
}

export function bvGetDrainEfficiency(rarity: BvRarity, level: number): number {
  const entry = BV_DRAIN_EFFICIENCY_TABLE[rarity]
  if (!entry) return 0
  if (level < entry.minLevel) return 0
  const progress = Math.min(1, (level - entry.minLevel) / (BV_MAX_LEVEL - entry.minLevel))
  return Math.floor(entry.baseEfficiency + (entry.maxEfficiency - entry.baseEfficiency) * progress)
}

type BvElementKey = BvElement | 'sanguine' | 'thorned' | 'necrotic' | 'verdant' | 'blazing' | 'toxic' | 'ember'

const BV_ELEMENT_SYNERGY: Record<string, Record<string, number>> = {
  sanguine: { sanguine: 1.0, thorned: 1.2, necrotic: 0.8, verdant: 1.5, blazing: 0.5, toxic: 1.0, ember: 0.7 },
  thorned: { sanguine: 1.2, thorned: 1.0, necrotic: 1.1, verdant: 0.6, blazing: 0.9, toxic: 0.8, ember: 1.3 },
  necrotic: { sanguine: 0.8, thorned: 1.1, necrotic: 1.0, verdant: 1.3, blazing: 0.3, toxic: 1.5, ember: 0.2 },
  verdant: { sanguine: 1.5, thorned: 0.6, necrotic: 1.3, verdant: 1.0, blazing: 0.4, toxic: 0.7, ember: 0.5 },
  blazing: { sanguine: 0.5, thorned: 0.9, necrotic: 0.3, verdant: 0.4, toxic: 0.6, ember: 1.8 },
  toxic: { sanguine: 1.0, thorned: 0.8, necrotic: 1.5, verdant: 0.7, blazing: 0.6, toxic: 1.0, ember: 0.4 },
  ember: { sanguine: 0.7, thorned: 1.3, necrotic: 0.2, verdant: 0.5, toxic: 0.4, blazing: 1.8, ember: 1.0 },
}

export function bvGetElementSynergy(elementA: BvElement, elementB: BvElement): number {
  const row = BV_ELEMENT_SYNERGY[elementA]
  if (!row) return 1.0
  return row[elementB] || 1.0
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4c: RARITY INFO TABLE
// ═══════════════════════════════════════════════════════════════════

export interface BvRarityInfo {
  readonly key: BvRarity
  readonly label: string
  readonly color: string
  readonly xpMultiplier: number
  readonly drainChance: number
  readonly description: string
}

export const BV_RARITY_INFO: readonly BvRarityInfo[] = [
  {
    key: 'common',
    label: 'Common',
    color: BV_COLOR_DARK_SOIL,
    xpMultiplier: 1.0,
    drainChance: 60,
    description: 'The most abundant thorned creatures, found in every grove. Easy to drain but offer modest power.',
  },
  {
    key: 'uncommon',
    label: 'Uncommon',
    color: '#A855F7',
    xpMultiplier: 1.5,
    drainChance: 25,
    description: 'Stronger creatures with improved abilities. Found in groves unlocked at level 5 or higher.',
  },
  {
    key: 'rare',
    label: 'Rare',
    color: '#DC2626',
    xpMultiplier: 2.2,
    drainChance: 10,
    description: 'Powerful thorned creatures with unique abilities. Require specific groves to encounter.',
  },
  {
    key: 'epic',
    label: 'Epic',
    color: '#7C3AED',
    xpMultiplier: 3.5,
    drainChance: 4,
    description: 'Elite thorned creatures with devastating power. Found only in the deepest groves.',
  },
  {
    key: 'legendary',
    label: 'Legendary',
    color: '#FBBF24',
    xpMultiplier: 6.0,
    drainChance: 1,
    description: 'Mythic thorned creatures of immense power. The apex predators of the vine network.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4d: GROVE AMBIENT COLORS
// ═══════════════════════════════════════════════════════════════════

export const BV_GROVE_COLORS: Record<string, string> = {
  bleeding_heart_garden: '#8B0000',
  crimson_canopy: '#A52A2A',
  thorn_labyrinth: '#660000',
  blood_root_hollow: '#1A0A0A',
  sanguine_terrace: '#800020',
  ember_bramble_maze: '#CC5500',
  scarlet_depths: '#4B0082',
  vampire_orchard: '#228B22',
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4e: ELEMENT DESCRIPTION TABLE
// ═══════════════════════════════════════════════════════════════════

export const BV_ELEMENT_DESCRIPTIONS: Record<BvElement, string> = {
  sanguine: 'Vampiric life-force energy that courses through blood vines, granting enhanced drain abilities and regeneration.',
  thorned: 'Sharp, piercing damage focused energy that empowers thorn-based attacks and defensive structures.',
  necrotic: 'Death and decay energy that weakens enemies over time, ideal for sustained drain strategies.',
  verdant: 'Living plant energy that strengthens vine growth, healing, and natural defenses.',
  blazing: 'Fire and heat energy that cauterizes wounds while simultaneously draining blood essence.',
  toxic: 'Poison and venom energy that weakens targets through persistent toxin damage.',
  ember: 'Smoldering combustion energy that combines warmth with vampiric hunger for dual-effect attacks.',
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: BV_SPECIES — 7 Species Definitions
// ═════════════════════════════════════════════════════════════════════

export interface BvSpeciesDef {
  readonly id: BvSpecies
  readonly name: string
  readonly description: string
  readonly color: string
  readonly passiveAbility: string
  readonly combatBonus: string
}

export const BV_SPECIES: readonly BvSpeciesDef[] = [
  {
    id: 'blood_vine',
    name: 'Blood Vine',
    description: 'Sentient vampiric vines that wrap around living creatures and slowly drain their life force through thorned tendrils.',
    color: BV_COLOR_BLOOD_RED,
    passiveAbility: 'Life Siphon — drains 5% HP per turn from adjacent enemies',
    combatBonus: '+20% drain rate in groves with active blood pools',
  },
  {
    id: 'thorn_drake',
    name: 'Thorn Drake',
    description: 'Small dragon-like creatures covered in razor-sharp thorned scales. They nest in dead trees and hunt at dusk.',
    color: BV_COLOR_THORN_CRIMSON,
    passiveAbility: 'Thorn Barrage — launches volleys of explosive thorns at range',
    combatBonus: '+15% attack power when above 50% HP',
  },
  {
    id: 'root_leech',
    name: 'Root Leech',
    description: 'Underground parasites that attach to the roots of ancient trees, draining nutrients and converting them to blood essence.',
    color: BV_COLOR_PETAL_BURGUNDY,
    passiveAbility: 'Subterranean Drain — absorbs resources through root networks',
    combatBonus: '+25% drain efficiency against rooted targets',
  },
  {
    id: 'crimson_willow',
    name: 'Crimson Willow',
    description: 'Weeping willow trees whose branches drip with blood-red sap. Their roots spread for miles underground.',
    color: BV_COLOR_VINE_GREEN,
    passiveAbility: 'Sap Shield — generates a protective barrier from coagulated sap',
    combatBonus: '+20% defense when near water sources',
  },
  {
    id: 'scarlet_mantis',
    name: 'Scarlet Mantis',
    description: 'Insectoid predators with scythe-like forelimbs that glow red with absorbed blood. They camouflage among vines.',
    color: BV_COLOR_SAP_GOLD,
    passiveAbility: 'Vine Ambush — invisible while standing on blood vines',
    combatBonus: '+30% critical strike from stealth',
  },
  {
    id: 'venom_ivy',
    name: 'Venom Ivy',
    description: 'Poisonous ivy strains that produce paralytic toxins. Their leaves shimmer with an oily iridescent sheen.',
    color: BV_COLOR_MIST_VIOLET,
    passiveAbility: 'Toxic Spores — releases paralytic pollen clouds on contact',
    combatBonus: '+15% poison duration on all attacks',
  },
  {
    id: 'ember_bramble',
    name: 'Ember Bramble',
    description: 'Thorny brambles that smolder with internal fire. Their thorns cauterize wounds while draining blood simultaneously.',
    color: BV_COLOR_EMBER_ORANGE,
    passiveAbility: 'Burning Thorns — fire damage on every thorn strike',
    combatBonus: '+10% fire damage and life drain combined',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: BV_THORNS — 35 Thorned Creatures (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const BV_THORNS: readonly BvCreatureDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'sapling_strangler',
    name: 'Sapling Strangler',
    description:
      'A young blood vine barely strong enough to wrap around a mouse. Its thorns are soft and its drain rate is negligible, but it grows stronger with every drop of blood it consumes. Given time, it will become a lethal predator of the undergrowth.',
    species: 'blood_vine',
    rarity: 'common',
    basePower: 12,
    drainRate: 3,
    ability: 'Root Grasp',
  },
  {
    id: 'thorn_hatchling',
    name: 'Thorn Hatchling',
    description:
      'A baby thorn drake no larger than a cat, covered in tiny needle-like scales. It cannot yet fly and its thorn barrages consist of a single thorn at a time. Despite its size, its temper is fierce.',
    species: 'thorn_drake',
    rarity: 'common',
    basePower: 15,
    drainRate: 2,
    ability: 'Needle Prick',
  },
  {
    id: 'root_tapeworm',
    name: 'Root Tapeworm',
    description:
      'A segmented root leech that burrows through soil seeking tree roots. Its mouth is a circular ring of tiny thorns that inject a numbing agent before draining sap. Gardens infested with these creatures slowly yellow and die.',
    species: 'root_leech',
    rarity: 'common',
    basePower: 10,
    drainRate: 5,
    ability: 'Soil Burrow',
  },
  {
    id: 'weeping_sapling',
    name: 'Weeping Sapling',
    description:
      'A crimson willow sapling whose branches already drip with blood-red sap. Its roots extend surprisingly deep for its size, tapping into underground water veins that carry trace minerals from ancient battlefields.',
    species: 'crimson_willow',
    rarity: 'common',
    basePower: 8,
    drainRate: 4,
    ability: 'Sap Drip',
  },
  {
    id: 'cricket_mantis',
    name: 'Cricket Mantis',
    description:
      'A tiny scarlet mantis that hides among fallen leaves. Its forelimbs are too small to be lethal, but they can inject a mild paralytic that causes drowsiness. It chirps in a frequency that attracts blood vines.',
    species: 'scarlet_mantis',
    rarity: 'common',
    basePower: 11,
    drainRate: 2,
    ability: 'Leaf Camouflage',
  },
  {
    id: 'poison_ivy_sprout',
    name: 'Poison Ivy Sprout',
    description:
      'A young venom ivy plant with only three leaves. Touching it causes a mild rash and dizziness as it attempts to feed through skin contact. Its toxin is too weak to be dangerous, merely annoying.',
    species: 'venom_ivy',
    rarity: 'common',
    basePower: 9,
    drainRate: 3,
    ability: 'Itch Spore',
  },
  {
    id: 'spark_bramble',
    name: 'Spark Bramble',
    description:
      'A small ember bramble that smolders quietly, its thorns glowing faintly orange. When disturbed, it releases a puff of warm smoke and a single burning thorn. It thrives near volcanic vents and campfire remains.',
    species: 'ember_bramble',
    rarity: 'common',
    basePower: 14,
    drainRate: 2,
    ability: 'Smoke Puff',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'vine_constrictor',
    name: 'Vine Constrictor',
    description:
      'A mature blood vine that can squeeze the life from creatures as large as deer. Its thorns have hardened into steel-like points, and it moves with surprising speed for a plant. It leaves skeletal remains hanging from tree branches as warnings.',
    species: 'blood_vine',
    rarity: 'uncommon',
    basePower: 28,
    drainRate: 8,
    ability: 'Constrict',
  },
  {
    id: 'thorn_scout',
    name: 'Thorn Scout',
    description:
      'A juvenile thorn drake that has learned to fly short distances. It performs aerial reconnaissance for the vine network, spotting prey from above and signaling to ground-based vines with high-pitched screeches.',
    species: 'thorn_drake',
    rarity: 'uncommon',
    basePower: 32,
    drainRate: 5,
    ability: 'Aerial Dive',
  },
  {
    id: 'depth_leech',
    name: 'Depth Leech',
    description:
      'A root leech that has burrowed deep enough to reach the water table. It drains nutrients from underground rivers, growing bloated and powerful. Its thorns inject a dark ichor that causes nightmares.',
    species: 'root_leech',
    rarity: 'uncommon',
    basePower: 25,
    drainRate: 12,
    ability: 'Nightmare Ichor',
  },
  {
    id: 'crimson_guardian',
    name: 'Crimson Guardian',
    description:
      'A crimson willow that has grown to the size of a small tree. Its branches form a protective canopy that drips healing sap on allies and corrosive sap on enemies. Birds nest in its crown, unwittingly spreading its seeds.',
    species: 'crimson_willow',
    rarity: 'uncommon',
    basePower: 22,
    drainRate: 6,
    ability: 'Sap Rain',
  },
  {
    id: 'blade_mantis',
    name: 'Blade Mantis',
    description:
      'A scarlet mantis whose forelimbs have hardened into razor-sharp scythes capable of cutting through leather armor. It fights with calculated precision, targeting arteries to maximize blood loss. Its eyes glow with predatory intelligence.',
    species: 'scarlet_mantis',
    rarity: 'uncommon',
    basePower: 35,
    drainRate: 4,
    ability: 'Artery Strike',
  },
  {
    id: 'toxic_creeper',
    name: 'Toxic Creeper',
    description:
      'A venom ivy strain that has learned to climb walls and trees, covering entire structures in its poisonous embrace. Its leaves release a persistent neurotoxin that weakens anything breathing nearby air.',
    species: 'venom_ivy',
    rarity: 'uncommon',
    basePower: 20,
    drainRate: 10,
    ability: 'Neurotoxin Cloud',
  },
  {
    id: 'flame_bramble',
    name: 'Flame Bramble',
    description:
      'An ember bramble whose internal fire has intensified to visible flames. Its thorns cauterize as they pierce, sealing wounds while simultaneously draining blood through the burn channel. The smell of burning flesh follows it.',
    species: 'ember_bramble',
    rarity: 'uncommon',
    basePower: 30,
    drainRate: 7,
    ability: 'Cauterizing Strike',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'ancient_strangler',
    name: 'Ancient Strangler',
    description:
      'A centuries-old blood vine as thick as a man\'s torso. It has consumed thousands of creatures and its thorns are stained permanently red. It can extend tendrils hundreds of feet in any direction, sensing vibrations through the earth.',
    species: 'blood_vine',
    rarity: 'rare',
    basePower: 55,
    drainRate: 18,
    ability: 'Grasping Doom',
  },
  {
    id: 'thorn_wyrm',
    name: 'Thorn Wyrm',
    description:
      'A fully grown thorn drake with wingspan of thirty feet. Its scales are interlocking thorn plates that can be launched as a devastating barrage. When it roars, thorns vibrate loose from nearby vines and fly toward its enemies.',
    species: 'thorn_drake',
    rarity: 'rare',
    basePower: 62,
    drainRate: 12,
    ability: 'Thorn Storm Breath',
  },
  {
    id: 'blood_root_worm',
    name: 'Blood Root Worm',
    description:
      'A massive root leech the size of a python that has merged with the root systems of entire forests. It IS the root network now, feeling every vibration, tasting every creature that walks above. It can erupt from the ground anywhere.',
    species: 'root_leech',
    rarity: 'rare',
    basePower: 48,
    drainRate: 25,
    ability: 'Ground Eruption',
  },
  {
    id: 'weeping_bloodwood',
    name: 'Weeping Bloodwood',
    description:
      'A crimson willow of immense age whose sap has thickened into actual blood. It bleeds from its bark when struck and the blood coagulates into armor-like plates. Its canopy covers a quarter acre and shelters an ecosystem of blood-fed creatures.',
    species: 'crimson_willow',
    rarity: 'rare',
    basePower: 45,
    drainRate: 15,
    ability: 'Blood Armor',
  },
  {
    id: 'crimson_executioner',
    name: 'Crimson Executioner',
    description:
      'A scarlet mantis that stands eight feet tall, its scythe-arms curved into perfect execution blades. It has developed a taste for the blood of apex predators and actively hunts the hunters. Its movements are faster than the eye can follow.',
    species: 'scarlet_mantis',
    rarity: 'rare',
    basePower: 58,
    drainRate: 10,
    ability: 'Decapitation Strike',
  },
  {
    id: 'death_ivy',
    name: 'Death Ivy',
    description:
      'A venom ivy strain whose toxin has evolved to be lethal within minutes. It forms dense curtains of poisoned leaves that release invisible spore clouds. Entire villages have been found empty, their inhabitants paralyzed and drained beneath blankets of death ivy.',
    species: 'venom_ivy',
    rarity: 'rare',
    basePower: 42,
    drainRate: 20,
    ability: 'Lethal Spore Cloud',
  },
  {
    id: 'inferno_bramble',
    name: 'Inferno Bramble',
    description:
      'An ember bramble that burns with the intensity of a forge fire. Its thorns are molten metal and its brambles create walls of flame. Creatures that approach too closely are simultaneously burned and drained, the heat preventing their blood from coagulating.',
    species: 'ember_bramble',
    rarity: 'rare',
    basePower: 52,
    drainRate: 14,
    ability: 'Wall of Flame',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'world_vine_serpent',
    name: 'World Vine Serpent',
    description:
      'A blood vine so massive it spans entire mountain ranges, moving through the earth like a subterranean serpent. Its thorns can pierce bedrock and its drain rate has desiccated entire lakes. It is the nervous system of the blood vine network.',
    species: 'blood_vine',
    rarity: 'epic',
    basePower: 95,
    drainRate: 35,
    ability: 'Continental Drain',
  },
  {
    id: 'thorn_dragon',
    name: 'Thorn Dragon',
    description:
      'An ancient thorn drake that has grown to true dragon size. Its body is a living fortress of interlocking thorn scales, and it can create thunderstorms of thorns that devastate everything beneath. When it sleeps, thorns grow from its body into the earth.',
    species: 'thorn_drake',
    rarity: 'epic',
    basePower: 105,
    drainRate: 22,
    ability: 'Thorn Tempest',
  },
  {
    id: 'heart_leech',
    name: 'Heart Leech',
    description:
      'A root leech that has burrowed into the very heart of the world, tapping into the planet\'s core energy. It is the largest single organism in existence, its body threaded through every continent. It drains the earth itself, causing subtle but measurable geological changes.',
    species: 'root_leech',
    rarity: 'epic',
    basePower: 88,
    drainRate: 45,
    ability: 'Planetary Tap',
  },
  {
    id: 'blood_mother_willow',
    name: 'Blood Mother Willow',
    description:
      'The oldest crimson willow, believed to be the first of her kind. Her trunk is as wide as a castle and her roots extend to the center of the earth. She bleeds willingly, creating pools of healing blood that birth new crimson willows from the soil.',
    species: 'crimson_willow',
    rarity: 'epic',
    basePower: 80,
    drainRate: 28,
    ability: 'Genesis Pool',
  },
  {
    id: 'scarlet_phantom',
    name: 'Scarlet Phantom',
    description:
      'A scarlet mantis that has achieved perfect invisibility among vines. It exists in a quantum state between visible and invisible, striking from dimensions that overlap with the vine network. Its victims never see what killed them, only a flash of crimson.',
    species: 'scarlet_mantis',
    rarity: 'epic',
    basePower: 100,
    drainRate: 18,
    ability: 'Dimensional Strike',
  },
  {
    id: 'plague_ivy',
    name: 'Plague Ivy',
    description:
      'A venom ivy that has evolved its toxin into a full plague pathogen. Entire ecosystems collapse when plague ivy takes root, as every plant and animal in the vicinity becomes a vector for its drain. It is the biological weapon of the vine network.',
    species: 'venom_ivy',
    rarity: 'epic',
    basePower: 85,
    drainRate: 38,
    ability: 'Plague Bloom',
  },
  {
    id: 'volcano_bramble',
    name: 'Volcano Bramble',
    description:
      'An ember bramble that has grown into an active volcano, merging with the magma chamber. It erupts periodically, launching burning thorns that embed themselves in the ground and grow into new ember brambles wherever they land.',
    species: 'ember_bramble',
    rarity: 'epic',
    basePower: 92,
    drainRate: 25,
    ability: 'Volcanic Eruption',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'blood_vine_titan',
    name: 'Blood Vine Titan',
    description:
      'The original blood vine, the first plant to taste blood and hunger for more. Its body wraps around the planet\'s core, and every blood vine in existence is an extension of its will. It dreams of a world covered entirely in its children.',
    species: 'blood_vine',
    rarity: 'legendary',
    basePower: 160,
    drainRate: 60,
    ability: 'World Entwine',
  },
  {
    id: 'thorn_empyrean',
    name: 'Thorn Empyrean',
    description:
      'The primordial thorn drake from whose scales all thorns descended. It flies through thunderstorms, its body a lightning rod that charges its thorn barrages with electrical energy. When it dies, it will reform from a single surviving thorn.',
    species: 'thorn_drake',
    rarity: 'legendary',
    basePower: 155,
    drainRate: 45,
    ability: 'Lightning Thorns',
  },
  {
    id: 'primordial_root',
    name: 'Primordial Root',
    description:
      'The first root leech, born when the first drop of blood touched the first root. It exists outside of time, simultaneously in every root on Earth. It has drained the blood of gods and titans, and its ichor flows through the deepest caves.',
    species: 'root_leech',
    rarity: 'legendary',
    basePower: 150,
    drainRate: 80,
    ability: 'Temporal Drain',
  },
  {
    id: 'crimson_world_tree',
    name: 'Crimson World Tree',
    description:
      'A crimson willow that has grown to the size of a world tree, its canopy visible from orbit. Its sap flows like rivers across the land, creating seas of blood that nourish entire ecosystems of vampiric life. It is both mother and goddess to all crimson willows.',
    species: 'crimson_willow',
    rarity: 'legendary',
    basePower: 145,
    drainRate: 50,
    ability: 'Sap Ocean',
  },
  {
    id: 'scarlet_god_mantis',
    name: 'Scarlet God Mantis',
    description:
      'The ultimate predator of the vine network, a scarlet mantis that exists in all dimensions simultaneously. It can strike anything, anywhere, at any time. Its scythes cut through reality itself, and its victims are erased from existence rather than merely killed.',
    species: 'scarlet_mantis',
    rarity: 'legendary',
    basePower: 170,
    drainRate: 40,
    ability: 'Reality Scythe',
  },
  {
    id: 'void_venom_ivy',
    name: 'Void Venom Ivy',
    description:
      'A venom ivy that has grown into the spaces between dimensions, its leaves absorbing entropy itself. Its toxin is the concept of decay made manifest, and anything it touches begins to unravel at a fundamental level. It drains not blood but existence.',
    species: 'venom_ivy',
    rarity: 'legendary',
    basePower: 140,
    drainRate: 70,
    ability: 'Existence Unravel',
  },
  {
    id: 'ember_bramble_colossus',
    name: 'Ember Bramble Colossus',
    description:
      'A walking mountain of burning brambles, the ember bramble equivalent of a titan. Its body generates its own weather system of ash clouds and lightning, and its thorns rain like meteorites upon the land. It leaves scorched, fertile earth in its wake.',
    species: 'ember_bramble',
    rarity: 'legendary',
    basePower: 165,
    drainRate: 55,
    ability: 'Burning Apocalypse',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: BV_GROVES — 8 Blood Groves
// ═══════════════════════════════════════════════════════════════════

export const BV_GROVES: readonly BvGroveDef[] = [
  {
    id: 'bleeding_heart_garden',
    name: 'Bleeding Heart Garden',
    description:
      'A garden where heart-shaped flowers bloom in shades of deep crimson, their petals constantly dripping with blood-red nectar. Blood vines weave between the flowers like living fences, and the soil is dark and moist with centuries of accumulated life force.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['+5% drain rate', 'Basic material gathering'],
  },
  {
    id: 'crimson_canopy',
    name: 'Crimson Canopy',
    description:
      'A dense forest where the treetops form a unbroken ceiling of blood-red leaves. Sunlight filters through as a dim crimson glow, and thorn drakes nest in the upper branches. The ground is carpeted with fallen thorns that regenerate overnight.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['+10% thorn damage', 'Uncommon creature encounters'],
  },
  {
    id: 'thorn_labyrinth',
    name: 'Thorn Labyrinth',
    description:
      'A living maze of interlocking thorn hedges that shifts its paths daily. Those who enter without guidance are trapped forever, their life force slowly absorbed by the walls. Only root leeches can navigate it safely through underground tunnels.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['+15% trap effectiveness', 'Structure upgrades available'],
  },
  {
    id: 'blood_root_hollow',
    name: 'Blood Root Hollow',
    description:
      'A vast underground cavern where root leeches have created a subterranean kingdom. Bioluminescent fungi provide eerie red light, and pools of concentrated blood essence dot the cave floor like underground lakes. The air tastes of iron.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['+20% underground drain efficiency', 'Rare material discovery'],
  },
  {
    id: 'sanguine_terrace',
    name: 'Sanguine Terrace',
    description:
      'A series of terraced gardens carved into a cliff face, each level overflowing with venom ivy and crimson willows. Blood-watered irrigation channels cascade from terrace to terrace, creating waterfalls of diluted blood essence.',
    minLevel: 22,
    unlockCost: 3000,
    bonuses: ['+25% material yield', 'Epic creature summoning unlocked'],
  },
  {
    id: 'ember_bramble_maze',
    name: 'Ember Bramble Maze',
    description:
      'A maze of smoldering brambles where the walls glow with internal fire. Navigation requires endurance against constant heat and burning thorn strikes. At the center burns a permanent flame that grants power to those who reach it.',
    minLevel: 30,
    unlockCost: 7500,
    bonuses: ['+30% fire and drain combined', 'Epic creature encounters'],
  },
  {
    id: 'scarlet_depths',
    name: 'Scarlet Depths',
    description:
      'The deepest layer of the blood vine root network, where ancient leeches have drained prehistoric creatures for millions of years. The pressure here is immense, and the blood essence concentration is so high it forms crystalline veins in the rock.',
    minLevel: 38,
    unlockCost: 15000,
    bonuses: ['+35% rare creature chance', 'Legendary essence discovery'],
  },
  {
    id: 'vampire_orchard',
    name: 'Vampire Orchard',
    description:
      'A sacred grove where the Blood Vine Titan first tasted blood. Trees here produce fruit that bleeds when picked, and the entire grove pulses with a heartbeat audible for miles. All seven species coexist here in perfect predatory harmony.',
    minLevel: 45,
    unlockCost: 30000,
    bonuses: ['+50% all species power', 'Legendary creature summoning', 'Ancient awakening rituals'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: BV_MATERIALS — 30 Blood Materials
// ═══════════════════════════════════════════════════════════════════

export const BV_MATERIALS: readonly BvMaterialDef[] = [
  // Common (6)
  { id: 'blood_sap', name: 'Blood Sap', description: 'Thick red sap harvested from bleeding heart flowers. Warm and slightly sweet, used in basic vine strengthening rituals.', rarity: 'common', source: 'bleeding_heart_garden', value: 5 },
  { id: 'crimson_thorn', name: 'Crimson Thorn', description: 'A single thorn shed by a blood vine. Sharp enough to draw blood through leather gloves. Essential for crafting vine weapons.', rarity: 'common', source: 'crimson_canopy', value: 6 },
  { id: 'vampire_pollen', name: 'Vampire Pollen', description: 'Red pollen collected from blood-fed flowers. Causes mild drowsiness when inhaled and attracts blood vines when scattered.', rarity: 'common', source: 'bleeding_heart_garden', value: 4 },
  { id: 'root_fiber', name: 'Root Fiber', description: 'Tough fibers extracted from root leech tunnels. Remarkably strong for their thinness, used for binding and rope-making.', rarity: 'common', source: 'blood_root_hollow', value: 8 },
  { id: 'willow_bark_scrap', name: 'Willow Bark Scrap', description: 'Bark peeled from young crimson willows. Contains trace amounts of healing sap and is used in basic poultices.', rarity: 'common', source: 'sanguine_terrace', value: 7 },
  { id: 'mantis_shell', name: 'Mantis Shell Fragment', description: 'A piece of shed scarlet mantis exoskeleton. Lightweight and surprisingly durable, it can be fashioned into small shields.', rarity: 'common', source: 'crimson_canopy', value: 9 },

  // Uncommon (6)
  { id: 'coagulated_blooddrop', name: 'Coagulated Blooddrop', description: 'A drop of blood essence that has solidified into a ruby-like bead. Pulsates faintly when near living creatures.', rarity: 'uncommon', source: 'crimson_canopy', value: 28 },
  { id: 'thorn_drake_scale', name: 'Thorn Drake Scale', description: 'A scale from a juvenile thorn drake, still warm with internal heat. Can be embedded into vine armor for fire resistance.', rarity: 'uncommon', source: 'crimson_canopy', value: 35 },
  { id: 'deep_root_ichor', name: 'Deep Root Ichor', description: 'Black fluid extracted from deep root leech burrows. A single drop causes vivid nightmares for a week but doubles drain rates temporarily.', rarity: 'uncommon', source: 'blood_root_hollow', value: 32 },
  { id: 'crimson_willow_leaf', name: 'Crimson Willow Leaf', description: 'A single preserved leaf from a mature crimson willow. When steeped in blood, it creates a tea that enhances vine growth by 50%.', rarity: 'uncommon', source: 'sanguine_terrace', value: 40 },
  { id: 'mantis_blade_chip', name: 'Mantis Blade Chip', description: 'A fragment of a scarlet mantis scythe. Incredibly sharp and retains a faint blood-lust aura that sharpens nearby weapons.', rarity: 'uncommon', source: 'crimson_canopy', value: 30 },
  { id: 'poison_ivy_extract', name: 'Poison Ivy Extract', description: 'Concentrated venom ivy toxin distilled from a hundred leaves. Lethal in large doses, paralytic in small ones.', rarity: 'uncommon', source: 'sanguine_terrace', value: 45 },

  // Rare (6)
  { id: 'sanguine_crystal', name: 'Sanguine Crystal', description: 'A crystal formed from millennia of compressed blood essence in underground caves. It glows with a deep red inner light and resonates with vampire pulses.', rarity: 'rare', source: 'blood_root_hollow', value: 120 },
  { id: 'dragon_thorn_cluster', name: 'Dragon Thorn Cluster', description: 'A burst of interlocking thorns from an adult thorn drake. When scattered, they grow into defensive thorn walls within minutes.', rarity: 'rare', source: 'thorn_labyrinth', value: 150 },
  { id: 'world_root_fragment', name: 'World Root Fragment', description: 'A chunk of root from the planetary root network. Impossibly old and dense with absorbed life force, it hums with power.', rarity: 'rare', source: 'scarlet_depths', value: 140 },
  { id: 'bloodwood_heart', name: 'Bloodwood Heart', description: 'The calcified heart of an ancient crimson willow. It beats once per day, releasing a pulse of healing blood that affects everything within a mile.', rarity: 'rare', source: 'sanguine_terrace', value: 160 },
  { id: 'executioner_blade', name: 'Executioner Blade', description: 'A complete scythe from a deceased crimson executioner mantis. It thirsts for blood and sharpens itself on bone.', rarity: 'rare', source: 'thorn_labyrinth', value: 135 },
  { id: 'plague_spore_vial', name: 'Plague Spore Vial', description: 'A sealed vial containing the dormant spores of a death ivy plant. If released, the spores would infect an entire region within days.', rarity: 'rare', source: 'scarlet_depths', value: 110 },

  // Epic (6)
  { id: 'blood_vine_heartstring', name: 'Blood Vine Heartstring', description: 'A living fiber from the heart of the World Vine Serpent. It contracts when near blood, allowing its wielder to sense prey at great distances.', rarity: 'epic', source: 'vampire_orchard', value: 500 },
  { id: 'thorn_dragon_fang', name: 'Thorn Dragon Fang', description: 'A massive fang from a thorn dragon, still crackling with residual electrical energy. It can summon thorn storms when planted in blood-soaked soil.', rarity: 'epic', source: 'ember_bramble_maze', value: 550 },
  { id: 'primordial_root_marrow', name: 'Primordial Root Marrow', description: 'Bone marrow from the planetary core, transformed by millions of years of root leech contact into something neither bone nor plant but both.', rarity: 'epic', source: 'scarlet_depths', value: 600 },
  { id: 'world_tree_sap_vial', name: 'World Tree Sap Vial', description: 'A vial of sap from the Crimson World Tree itself. A single drop can regrow a severed limb or resurrect a recently deceased creature.', rarity: 'epic', source: 'vampire_orchard', value: 520 },
  { id: 'phantom_mantis_essence', name: 'Phantom Mantis Essence', description: 'The distilled essence of a Scarlet Phantom\'s dimensional existence. Drinking it grants temporary ability to phase between vine network dimensions.', rarity: 'epic', source: 'ember_bramble_maze', value: 480 },
  { id: 'ember_bramble_core', name: 'Ember Bramble Core', description: 'The molten heart of a Volcano Bramble, containing concentrated geothermal and blood energy in equal measure. It burns forever and cannot be extinguished.', rarity: 'epic', source: 'ember_bramble_maze', value: 570 },

  // Legendary (6)
  { id: 'blood_vine_titan_seed', name: 'Blood Vine Titan Seed', description: 'A seed from the original blood vine. Planting it would create a new World Vine Serpent, an act of world-changing magnitude. It pulses with planetary hunger.', rarity: 'legendary', source: 'vampire_orchard', value: 5000 },
  { id: 'thorn_empyrean_scale', name: 'Thorn Empyrean Scale', description: 'A single scale from the primordial thorn drake. It crackles with permanent lightning and repels all physical attacks. Holding it makes you feel invincible.', rarity: 'legendary', source: 'vampire_orchard', value: 6000 },
  { id: 'primordial_root_heart', name: 'Primordial Root Heart', description: 'The calcified heart of the first root leech. It exists in all moments simultaneously and grants knowledge of every root system on Earth.', rarity: 'legendary', source: 'vampire_orchard', value: 5500 },
  { id: 'crimson_world_tree_bark', name: 'Crimson World Tree Bark', description: 'A sheet of bark from the Crimson World Tree. It is large enough to roof a castle and bleeds healing blood continuously from its inner surface.', rarity: 'legendary', source: 'vampire_orchard', value: 7000 },
  { id: 'reality_scythe', name: 'Reality Scythe', description: 'One of the Scarlet God Mantis\'s dimension-cutting scythes. It exists in multiple realities at once and can cut through any material, concept, or law of physics.', rarity: 'legendary', source: 'vampire_orchard', value: 6500 },
  { id: 'blood_moon_bramble_seed', name: 'Blood Moon Bramble Seed', description: 'A seed that grows only under the light of a blood moon. When planted, it creates an ember bramble that burns with cold fire, draining heat instead of providing it.', rarity: 'legendary', source: 'vampire_orchard', value: 8000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: BV_STRUCTURES — 25 Vine Structures
// ═══════════════════════════════════════════════════════════════════

export const BV_STRUCTURES: readonly BvStructureDef[] = [
  // Summoning (5)
  { id: 'blood_vine_altar', name: 'Blood Vine Altar', description: 'A stone altar wrapped in blood vines that pulses with absorbed life force. Used for draining new creatures and performing basic vine rituals.', baseCost: 100, costMultiplier: 1.5 },
  { id: 'thorn_summoning_circle', name: 'Thorn Summoning Circle', description: 'A circle of sharp thorns embedded in blood-soaked earth. It amplifies drain signals and increases the chance of attracting uncommon creatures.', baseCost: 400, costMultiplier: 1.6 },
  { id: 'crimson_conduit', name: 'Crimson Conduit', description: 'A crystalline pipe that channels raw blood essence from deep underground. Required for rare creature summoning.', baseCost: 1200, costMultiplier: 1.7 },
  { id: 'sanguine_beacon', name: 'Sanguine Beacon', description: 'A blood-red beacon that emits a pulsing crimson light visible across the vine network, attracting powerful creatures from distant groves.', baseCost: 3000, costMultiplier: 1.8 },
  { id: 'vine_emperor_gate', name: 'Vine Emperor Gate', description: 'A massive gate of living blood vines inscribed with the true names of all seven species. Capable of calling legendary creatures.', baseCost: 8000, costMultiplier: 2.0 },

  // Production (5)
  { id: 'blood_sap_well', name: 'Blood Sap Well', description: 'A well dug into blood-soaked soil that fills with usable blood sap overnight. Produces a steady supply of basic materials.', baseCost: 80, costMultiplier: 1.4 },
  { id: 'thorn_distillery', name: 'Thorn Distillery', description: 'A device that crushes and processes thorns into concentrated drain essence. Produces thorn-themed materials at an enhanced rate.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'essence_condenser', name: 'Essence Condenser', description: 'Captures and condenses blood mist that rises from ancient battlefields. Produces rare essences during peak activity.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'root_collector', name: 'Root Collector', description: 'An array of root taps that siphon nutrients from underground root networks. Generates materials passively.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'ember_forge', name: 'Ember Forge', description: 'A forge fueled by blood essence and ember bramble fire. It can process and combine any blood material into powerful artifacts.', baseCost: 5000, costMultiplier: 1.8 },

  // Defense (5)
  { id: 'thorn_wall', name: 'Thorn Wall', description: 'A wall of living thorned vines that regenerates when damaged. Provides basic protection against intruders and herbivores.', baseCost: 120, costMultiplier: 1.4 },
  { id: 'root_barricade', name: 'Root Barricade', description: 'A barricade of reinforced root leech tunnels that can collapse to trap attackers. Beautifully terrifying in its organic complexity.', baseCost: 500, costMultiplier: 1.5 },
  { id: 'blood_mist_generator', name: 'Blood Mist Generator', description: 'Projects a protective dome of thick blood mist. The mist carries a mild paralytic that slows any creature breathing it.', baseCost: 1500, costMultiplier: 1.6 },
  { id: 'mantis_sentry_post', name: 'Mantis Sentry Post', description: 'An elevated post where scarlet mantises perch and watch for intruders. Effective against both ground and aerial threats.', baseCost: 700, costMultiplier: 1.5 },
  { id: 'vine_fortress', name: 'Vine Fortress', description: 'A massive fortress woven entirely from blood vines, thorn drake scales, and crimson willow trunks. Nearly impregnable.', baseCost: 6000, costMultiplier: 1.9 },

  // Utility (5)
  { id: 'root_network_hub', name: 'Root Network Hub', description: 'A central hub that connects to the underground root network, allowing instant travel between any two connected groves.', baseCost: 250, costMultiplier: 1.5 },
  { id: 'blood_potion_lab', name: 'Blood Potion Lab', description: 'A laboratory for processing blood materials into potent potions. Increases material conversion efficiency by level percentage.', baseCost: 600, costMultiplier: 1.5 },
  { id: 'thorn_armory', name: 'Thorn Armory', description: 'An armory that crafts weapons from thorns and blood steel. Provides combat bonuses to all creatures in the grove.', baseCost: 1500, costMultiplier: 1.6 },
  { id: 'vine_library', name: 'Vine Library', description: 'A library of living books made from crimson willow leaves. Contains the accumulated knowledge of every blood vine in history.', baseCost: 3000, costMultiplier: 1.7 },
  { id: 'blood_oracle_pool', name: 'Blood Oracle Pool', description: 'A pool of pure blood essence that reveals glimpses of the future. Provides event warnings and discovery bonuses.', baseCost: 7000, costMultiplier: 1.9 },

  // Grand (5)
  { id: 'root_ritual_altar', name: 'Root Ritual Altar', description: 'A massive altar of intertwined roots used for awakening legendary creatures. Requires significant blood essence to activate.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'sanguine_cathedral', name: 'Sanguine Cathedral', description: 'A cathedral built from petrified blood vines where all species gather under a truce. Boosts all drain and defense bonuses.', baseCost: 4000, costMultiplier: 1.8 },
  { id: 'ember_coliseum', name: 'Ember Coliseum', description: 'An arena surrounded by burning ember brambles where creatures compete and train. Winning grants massive experience bonuses.', baseCost: 5500, costMultiplier: 1.8 },
  { id: 'blood_garden_terrace', name: 'Blood Garden Terrace', description: 'A terraced garden that auto-generates all material types based on structure level. The ultimate passive production building.', baseCost: 9000, costMultiplier: 2.0 },
  { id: 'vine_emperor_palace', name: 'Vine Emperor Palace', description: 'The ultimate blood vine structure — a living palace of the Blood Vine Titan. Provides maximum bonuses to all aspects of vine management.', baseCost: 15000, costMultiplier: 2.0 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: BV_ABILITIES — 22 Vine Abilities
// ═══════════════════════════════════════════════════════════════════

export const BV_ABILITIES: readonly BvAbilityDef[] = [
  // Common (5)
  { id: 'vine_grasp', name: 'Vine Grasp', description: 'Command blood vines to ensnare a target in thorned tendrils, draining their life force.', cooldown: 5, power: 15, element: 'sanguine' },
  { id: 'thorn_lash', name: 'Thorn Lash', description: 'Extend a razor-sharp blood vine to strike at range, leaving bleeding wounds.', cooldown: 3, power: 12, element: 'thorned' },
  { id: 'root_bind', name: 'Root Bind', description: 'Summon underground roots to erupt and bind a target in place.', cooldown: 8, power: 10, element: 'necrotic' },
  { id: 'sap_shield', name: 'Sap Shield', description: 'Wrap yourself in hardened blood sap for temporary protection.', cooldown: 15, power: 20, element: 'verdant' },
  { id: 'ember_spark', name: 'Ember Spark', description: 'Launch a burning thorn that ignites on impact.', cooldown: 4, power: 14, element: 'blazing' },

  // Uncommon (5)
  { id: 'blood_drain', name: 'Blood Drain', description: 'Draw life force directly from the earth, restoring blood essence.', cooldown: 10, power: 30, element: 'sanguine' },
  { id: 'thorn_barrage', name: 'Thorn Barrage', description: 'Unleash a volley of explosive thorns in a wide arc.', cooldown: 8, power: 35, element: 'thorned' },
  { id: 'root_network_travel', name: 'Root Network Travel', description: 'Travel instantly through underground root networks to any connected grove.', cooldown: 30, power: 0, element: 'necrotic' },
  { id: 'willow_healing_rain', name: 'Willow Healing Rain', description: 'Command crimson willows to release healing sap rain over an area.', cooldown: 25, power: 40, element: 'verdant' },
  { id: 'mantis_ambush', name: 'Mantis Ambush', description: 'Become invisible among vines and strike with devastating surprise.', cooldown: 20, power: 50, element: 'toxic' },

  // Rare (5)
  { id: 'vine_tsunami', name: 'Vine Tsunami', description: 'Send a massive wave of blood vines crashing across the battlefield.', cooldown: 20, power: 65, element: 'sanguine' },
  { id: 'thorn_whirlwind', name: 'Thorn Whirlwind', description: 'Create a spinning vortex of thorns that damages everything nearby.', cooldown: 25, power: 70, element: 'thorned' },
  { id: 'depth_drain', name: 'Depth Drain', description: 'Tap into the planetary root network for massive blood essence extraction.', cooldown: 40, power: 60, element: 'necrotic' },
  { id: 'bloodwood_blessing', name: 'Bloodwood Blessing', description: 'Channel the Crimson World Tree\'s power to heal all allies fully.', cooldown: 45, power: 75, element: 'verdant' },
  { id: 'inferno_bramble_wall', name: 'Inferno Bramble Wall', description: 'Raise a wall of burning brambles that deals continuous fire and drain damage.', cooldown: 30, power: 80, element: 'blazing' },

  // Epic (4)
  { id: 'world_vine_entangle', name: 'World Vine Entangle', description: 'The planet\'s blood vines erupt from the ground everywhere simultaneously.', cooldown: 60, power: 120, element: 'sanguine' },
  { id: 'thorn_dragon_summon', name: 'Thorn Dragon Summon', description: 'Summon a thorn dragon for devastating aerial thorn bombardment.', cooldown: 90, power: 130, element: 'thorned' },
  { id: 'plague_bloom', name: 'Plague Bloom', description: 'Trigger a massive toxic bloom that poisons everything in a wide radius.', cooldown: 120, power: 110, element: 'toxic' },
  { id: 'volcanic_eruption', name: 'Volcanic Eruption', description: 'Command ember brambles to trigger a volcanic eruption centered on the target.', cooldown: 100, power: 140, element: 'blazing' },

  // Legendary (3)
  { id: 'blood_vine_apocalypse', name: 'Blood Vine Apocalypse', description: 'The Blood Vine Titan awakens and entangles the entire world in vampiric vines.', cooldown: 300, power: 250, element: 'sanguine' },
  { id: 'thorn_empyrean_storm', name: 'Thorn Empyrean Storm', description: 'A permanent thunderstorm of lightning-charged thorns that devastates continents.', cooldown: 240, power: 220, element: 'thorned' },
  { id: 'reality_unravel', name: 'Reality Unravel', description: 'The Void Venom Ivy tears a hole in reality, draining existence itself.', cooldown: 360, power: 300, element: 'toxic' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: BV_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const BV_ACHIEVEMENTS: readonly BvAchievementDef[] = [
  { id: 'first_drain', name: 'First Taste', description: 'Drain life force from a creature for the first time.', condition: 'totalDrained >= 1', reward: '50 gold' },
  { id: 'ten_drains', name: 'Voracious', description: 'Drain life force from 10 creatures.', condition: 'totalDrained >= 10', reward: '200 gold, 5 blood sap' },
  { id: 'hundred_drains', name: 'Life Eater', description: 'Drain life force from 100 creatures.', condition: 'totalDrained >= 100', reward: '1000 gold, uncommon material pack' },
  { id: 'thousand_drains', name: 'Apex Predator', description: 'Drain life force from 1000 creatures.', condition: 'totalDrained >= 1000', reward: '5000 gold, rare material pack' },
  { id: 'first_thorn', name: 'First Planting', description: 'Plant your first thorn structure.', condition: 'totalThornsPlanted >= 1', reward: '30 gold' },
  { id: 'ten_structures', name: 'Vine Architect', description: 'Build 10 structures.', condition: 'totalThornsPlanted >= 10', reward: '500 gold, thorn upgrade' },
  { id: 'max_structure', name: 'Master Builder', description: 'Upgrade any structure to maximum level.', condition: 'totalUpgraded >= 10', reward: '2000 gold, epic material' },
  { id: 'first_bloom', name: 'Blood Bloom', description: 'Trigger a blood bloom for the first time.', condition: 'totalBloomed >= 1', reward: '100 gold' },
  { id: 'fifty_blooms', name: 'Bloom Master', description: 'Trigger 50 blood blooms.', condition: 'totalBloomed >= 50', reward: '1500 gold, legendary material shard' },
  { id: 'first_entangle', name: 'Vine Grasp', description: 'Entangle a target for the first time.', condition: 'totalEntangled >= 1', reward: '50 gold' },
  { id: 'grove_unlocker', name: 'Explorer', description: 'Unlock 3 groves.', condition: 'unlockedGroves >= 3', reward: '300 gold' },
  { id: 'all_groves', name: 'Grove Master', description: 'Unlock all 8 groves.', condition: 'unlockedGroves >= 8', reward: '10000 gold, legendary artifact chance' },
  { id: 'first_legendary', name: 'Mythic Drainer', description: 'Acquire your first legendary creature.', condition: 'legendaryOwned >= 1', reward: '2000 gold, title upgrade' },
  { id: 'five_legendaries', name: 'Legend Collector', description: 'Acquire 5 legendary creatures.', condition: 'legendaryOwned >= 5', reward: '10000 gold, exclusive artifact' },
  { id: 'first_artifact', name: 'Relic Finder', description: 'Collect your first artifact.', condition: 'artifactsOwned >= 1', reward: '500 gold' },
  { id: 'ten_artifacts', name: 'Artifact Hoarder', description: 'Collect 10 artifacts.', condition: 'artifactsOwned >= 10', reward: '5000 gold, legendary material' },
  { id: 'level_25', name: 'Vine Lord', description: 'Reach vine level 25.', condition: 'bvLevel >= 25', reward: '3000 gold, epic creature unlock' },
  { id: 'level_50', name: 'Blood Emperor', description: 'Reach the maximum vine level 50.', condition: 'bvLevel >= 50', reward: '50000 gold, Blood Emperor title, legendary artifact' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: BV_TITLES — 8 Titles (Seedling → Blood Emperor)
// ═══════════════════════════════════════════════════════════════════

export const BV_TITLES: readonly BvTitleDef[] = [
  { id: 'seedling', name: 'Seedling', description: 'A tender blood vine sprout just beginning to taste the earth\'s life force.', requiredLevel: 1, requiredGroves: 0 },
  { id: 'thorn_sprout', name: 'Thorn Sprout', description: 'Your first thorns have hardened, and you hunger for more than soil nutrients.', requiredLevel: 6, requiredGroves: 1 },
  { id: 'root_tendril', name: 'Root Tendril', description: 'Your roots have reached deep underground, tapping into hidden blood veins.', requiredLevel: 12, requiredGroves: 2 },
  { id: 'vine_stalker', name: 'Vine Stalker', description: 'You move through the vine network like a predator, unseen and hungry.', requiredLevel: 18, requiredGroves: 3 },
  { id: 'blood_weaver', name: 'Blood Weaver', description: 'You weave blood vines into weapons, armor, and living architecture.', requiredLevel: 25, requiredGroves: 4 },
  { id: 'thorn_sovereign', name: 'Thorn Sovereign', description: 'Your thorn domains stretch for miles, and lesser creatures flee at your approach.', requiredLevel: 33, requiredGroves: 5 },
  { id: 'crimson_lord', name: 'Crimson Lord', description: 'You command legions of blood-fed creatures and the earth itself sustains your domain.', requiredLevel: 42, requiredGroves: 6 },
  { id: 'blood_emperor', name: 'Blood Emperor', description: 'The Blood Vine Titan recognizes you as its equal. You are the apex predator of all plant life.', requiredLevel: 50, requiredGroves: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: BV_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const BV_ARTIFACTS: readonly BvArtifactDef[] = [
  { id: 'blood_vine_tiara', name: 'Blood Vine Tiara', description: 'A crown of living blood vines that wraps around the wearer\'s head, connecting them directly to the vine network. Grants telepathic communication with all blood vines.', rarity: 'common', powerBonus: 15, specialAbility: 'Vine Network Telepathy' },
  { id: 'thorn_drake_claw', name: 'Thorn Drake Claw', description: 'A massive claw from a juvenile thorn drake, still crackling with residual electricity. Can be wielded as a weapon or embedded in structures for defense.', rarity: 'common', powerBonus: 20, specialAbility: 'Static Shock' },
  { id: 'root_leech_fang', name: 'Root Leech Fang', description: 'A curved fang from a large root leech. It hums with subterranean energy and can detect underground water sources and root networks.', rarity: 'uncommon', powerBonus: 35, specialAbility: 'Underground Detection' },
  { id: 'willow_sap_amulet', name: 'Willow Sap Amulet', description: 'An amulet containing a drop of solidified crimson willow sap. It glows when healing is needed and accelerates natural regeneration.', rarity: 'uncommon', powerBonus: 25, specialAbility: 'Regeneration Aura' },
  { id: 'mantis_wing_blade', name: 'Mantis Wing Blade', description: 'A sharpened wing from a scarlet mantis, forged into a deadly blade. It vibrates at high frequency, cutting through most materials with ease.', rarity: 'uncommon', powerBonus: 40, specialAbility: 'High Frequency Cut' },
  { id: 'poison_ivy_ring', name: 'Poison Ivy Ring', description: 'A ring grown from living venom ivy. It secretes a constant stream of diluted toxin that grants poison resistance to the wearer.', rarity: 'rare', powerBonus: 60, specialAbility: 'Poison Immunity' },
  { id: 'ember_bramble_torch', name: 'Ember Bramble Torch', description: 'A torch made from a living ember bramble branch. It burns with cold fire that drains heat from enemies while illuminating with a warm orange glow.', rarity: 'rare', powerBonus: 55, specialAbility: 'Cold Fire Illumination' },
  { id: 'sanguine_crystal_shard', name: 'Sanguine Crystal Shard', description: 'A fragment of a massive underground sanguine crystal. It pulses with a heartbeat and increases drain rates for all nearby creatures.', rarity: 'rare', powerBonus: 70, specialAbility: 'Drain Amplification' },
  { id: 'world_root_heart', name: 'World Root Heart', description: 'The calcified heart of an ancient root leech the size of a boulder. It beats once per hour, releasing a shockwave of life-draining energy.', rarity: 'epic', powerBonus: 120, specialAbility: 'Hourly Drain Pulse' },
  { id: 'thorn_dragon_skull', name: 'Thorn Dragon Skull', description: 'The intact skull of a thorn dragon, its teeth still sharp and crackling with lightning. When mounted, it summons thorn storms during combat.', rarity: 'epic', powerBonus: 130, specialAbility: 'Passive Thorn Storm' },
  { id: 'crimson_willow_branch', name: 'Crimson Willow Branch', description: 'A branch from the Blood Mother Willow herself. When planted, it grows into a new crimson willow that provides passive healing and material generation.', rarity: 'epic', powerBonus: 100, specialAbility: 'Living Branch Growth' },
  { id: 'plague_ivy_mask', name: 'Plague Ivy Mask', description: 'A mask woven from living plague ivy. The wearer becomes immune to all toxins and can exhale clouds of paralytic spore at will.', rarity: 'epic', powerBonus: 140, specialAbility: 'Spore Breath' },
  { id: 'blood_vine_titan_sapling', name: 'Blood Vine Titan Sapling', description: 'A living cutting from the Blood Vine Titan. It grows slowly but connects the wearer to the planetary vine consciousness, granting omniscience within the network.', rarity: 'legendary', powerBonus: 250, specialAbility: 'Planetary Vine Sight' },
  { id: 'thorn_empyrean_heart', name: 'Thorn Empyrean Heart', description: 'The crystallized heart of the primordial thorn drake. It generates its own electrical field and can summon thorn lightning storms on command.', rarity: 'legendary', powerBonus: 280, specialAbility: 'Thorn Lightning Command' },
  { id: 'reality_scythe_fragment', name: 'Reality Scythe Fragment', description: 'A fragment of the Scarlet God Mantis\'s dimension-cutting scythe. It exists partially outside reality and can cut through the fabric of space-time.', rarity: 'legendary', powerBonus: 350, specialAbility: 'Dimension Cut' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: BV_EVENTS — 12 Blood Events
// ═══════════════════════════════════════════════════════════════════

export const BV_EVENTS: readonly BvEventDef[] = [
  { id: 'blood_moon_rise', name: 'Blood Moon Rise', description: 'The moon turns blood red, amplifying all vampiric vine abilities for the duration of the event.', severity: 3, duration: 3600, effects: ['+50% drain rate', '+30% creature power', 'Rare creature encounters doubled'] },
  { id: 'root_surge', name: 'Root Surge', description: 'The underground root network expands rapidly, uncovering hidden chambers and materials.', severity: 2, duration: 7200, effects: ['+100% material discovery rate', 'New grove paths revealed', '+20% root leech power'] },
  { id: 'thorn_bloom_festival', name: 'Thorn Bloom Festival', description: 'Blood vines across all groves bloom simultaneously, releasing clouds of vampire pollen.', severity: 1, duration: 5400, effects: ['+40% material yield', 'Double bloom rewards', 'All creatures gain bloom bonus'] },
  { id: 'ember_outbreak', name: 'Ember Outbreak', description: 'Ember brambles ignite simultaneously across the network, creating temporary fire barriers.', severity: 4, duration: 1800, effects: ['+60% fire damage', 'Defensive fire barriers active', '+25% ember bramble power'] },
  { id: 'vampire_migration', name: 'Vampire Migration', description: 'Creatures from distant vine networks migrate through your groves, bringing rare specimens.', severity: 2, duration: 10800, effects: ['Rare creature encounters tripled', 'New species variants available', 'Migration material drops'] },
  { id: 'blood_rain', name: 'Blood Rain', description: 'It literally rains blood. The soil absorbs it, causing explosive vine growth everywhere.', severity: 3, duration: 3600, effects: ['+200% vine growth rate', 'All structures gain temporary levels', 'Blood essence regeneration doubled'] },
  { id: 'thorn_gale', name: 'Thorn Gale', description: 'A violent storm of flying thorns sweeps through all groves, damaging enemies but strengthening vines.', severity: 4, duration: 2400, effects: ['+80% thorn damage', 'Enemy creatures take damage', 'Thorn structures reinforced'] },
  { id: 'root_decay', name: 'Root Decay', description: 'A mysterious affliction causes some root networks to decay, reducing drain efficiency temporarily.', severity: 3, duration: 7200, effects: ['-30% drain rate', 'Root leech power halved', 'Emergency healing materials available'] },
  { id: 'crimson_eclipse', name: 'Crimson Eclipse', description: 'The sun is blotted out by blood-red clouds, creating a state of perpetual crimson twilight.', severity: 5, duration: 1800, effects: ['All vampiric abilities doubled', 'Legendary creature chance increased', 'Night-only creatures appear during day'] },
  { id: 'ancient_awakening', name: 'Ancient Awakening', description: 'Dormant creatures in the deepest groves stir from millennia of sleep, hungry and powerful.', severity: 5, duration: 7200, effects: ['Legendary creature encounters guaranteed', 'Ancient material discovery', 'Awakening ritual costs reduced'] },
  { id: 'vine_war', name: 'Vine War', description: 'Rival vine networks clash for territory. Your creatures must defend and expand their groves.', severity: 4, duration: 10800, effects: ['Combat rewards tripled', 'Enemy vine incursions', 'Territory control bonuses'] },
  { id: 'blood_harvest', name: 'Blood Harvest', description: 'The annual convergence when blood essence peaks across all groves simultaneously.', severity: 2, duration: 14400, effects: ['+100% blood essence generation', 'All material values doubled', 'Special harvest achievements unlock'] },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const BV_INITIAL_STATE: BvStoreState = {
  ownedCreatures: [],
  collectedMaterials: {},
  structures: [],
  achievements: [],
  currentTitle: 'seedling',
  collectedArtifacts: [],
  unlockedGroves: ['bleeding_heart_garden'],
  bvLevel: 1,
  bvExp: 0,
  bvBloodEssence: 100,
  bvVineSpread: 1,
  gold: BV_INITIAL_GOLD,
  totalDrained: 0,
  totalCollected: 0,
  totalUpgraded: 0,
  totalThornsPlanted: 0,
  totalBloomed: 0,
  totalEntangled: 0,
  activeEventId: null,
  eventTimer: 0,
  vineSanctuary: {
    bloodEssence: 100,
    maxBloodEssence: 500,
    corruption: 0,
    lastDrainAt: null,
  },
  activeGroveId: 'bleeding_heart_garden',
}

export const useBVStore = create<BvFullStore>()(
  persist(
    (set, get) => ({
      ...BV_INITIAL_STATE,

      bvDrain: (creatureId: string): boolean => {
        const state = get()
        const def = BV_THORNS.find((c) => c.id === creatureId)
        if (!def) return false

        const speciesBonus = bvGetSpeciesBonus(def.species)
        const drainChance = bvGetDrainChance(def.rarity, state.activeGroveId)
        if (Math.random() * 100 > drainChance) return false

        const drainAmount = Math.floor(def.drainRate * speciesBonus.drainBonus * bvRarityMultiplier(def.rarity))
        const xpGain = Math.floor(def.basePower * bvRarityMultiplier(def.rarity))

        const newExp = state.bvExp + xpGain
        const newLevel = bvLevelFromXp(newExp)
        const essenceGain = Math.floor(drainAmount * 0.5)

        const newCreature: BvOwnedCreature = {
          id: bvGenerateId(),
          creatureDefId: creatureId,
          level: 1,
          drainCount: 1,
          power: def.basePower + speciesBonus.strength,
          awakened: false,
          acquiredAt: Date.now(),
        }

        set((prev) => ({
          ownedCreatures: [...prev.ownedCreatures, newCreature],
          bvExp: newExp,
          bvLevel: newLevel,
          bvBloodEssence: prev.bvBloodEssence + essenceGain,
          bvVineSpread: prev.bvVineSpread + 1,
          gold: prev.gold + Math.floor(drainAmount * 0.3),
          totalDrained: prev.totalDrained + 1,
          vineSanctuary: {
            ...prev.vineSanctuary,
            bloodEssence: Math.min(prev.vineSanctuary.maxBloodEssence, prev.vineSanctuary.bloodEssence + essenceGain),
            lastDrainAt: Date.now(),
          },
        }))
        return true
      },

      bvPlantThorn: (structureId: string): boolean => {
        const state = get()
        const def = BV_STRUCTURES.find((s) => s.id === structureId)
        if (!def) return false

        const existing = state.structures.find((s) => s.structureDefId === structureId)
        if (existing && existing.level >= 10) return false

        const currentLevel = existing ? existing.level : 0
        const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
        if (state.gold < cost) return false

        set((prev) => {
          const structures = [...prev.structures]
          const idx = structures.findIndex((s) => s.structureDefId === structureId)
          if (idx >= 0) {
            structures[idx] = { ...structures[idx], level: structures[idx].level + 1, built: true }
          } else {
            structures.push({ id: bvGenerateId(), structureDefId: structureId, level: 1, built: true })
          }
          return {
            structures,
            gold: prev.gold - cost,
            totalUpgraded: prev.totalUpgraded + 1,
            totalThornsPlanted: prev.totalThornsPlanted + 1,
          }
        })
        return true
      },

      bvEntangle: (targetId: string): boolean => {
        const state = get()
        if (state.ownedCreatures.length === 0) return false

        const xpGain = 20 + state.bvLevel * 2
        const essenceGain = Math.floor(10 * bvRarityMultiplier('common'))

        set((prev) => ({
          bvExp: prev.bvExp + xpGain,
          bvLevel: bvLevelFromXp(prev.bvExp + xpGain),
          bvBloodEssence: prev.bvBloodEssence + essenceGain,
          gold: prev.gold + Math.floor(essenceGain * 0.5),
          totalEntangled: prev.totalEntangled + 1,
        }))
        return true
      },

      bvBloomBlood: (targetId: string): boolean => {
        const state = get()
        if (state.bvBloodEssence < 20) return false

        const xpGain = 30 + state.bvLevel * 3
        const essenceCost = 20

        set((prev) => ({
          bvExp: prev.bvExp + xpGain,
          bvLevel: bvLevelFromXp(prev.bvExp + xpGain),
          bvBloodEssence: prev.bvBloodEssence - essenceCost,
          totalBloomed: prev.totalBloomed + 1,
          gold: prev.gold + 50,
        }))
        return true
      },

      bvCollectMaterial: (materialId: string): number => {
        const state = get()
        const def = BV_MATERIALS.find((m) => m.id === materialId)
        if (!def) return 0

        const quantity = Math.max(1, Math.floor(bvRarityMultiplier(def.rarity) * (1 + state.bvLevel * 0.05)))

        set((prev) => ({
          collectedMaterials: {
            ...prev.collectedMaterials,
            [materialId]: (prev.collectedMaterials[materialId] || 0) + quantity,
          },
          totalCollected: prev.totalCollected + quantity,
          gold: prev.gold + Math.floor(def.value * quantity * 0.1),
        }))
        return quantity
      },

      bvUpgradeStructure: (structureId: string): boolean => {
        return get().bvPlantThorn(structureId)
      },

      bvUseAbility: (abilityId: string): boolean => {
        const state = get()
        const def = BV_ABILITIES.find((a) => a.id === abilityId)
        if (!def) return false
        if (state.bvBloodEssence < def.power * 0.1) return false

        const cost = Math.floor(def.power * 0.1)
        const xpGain = Math.floor(def.power * 0.5)

        set((prev) => ({
          bvExp: prev.bvExp + xpGain,
          bvLevel: bvLevelFromXp(prev.bvExp + xpGain),
          bvBloodEssence: prev.bvBloodEssence - cost,
        }))
        return true
      },

      bvTriggerEvent: (eventId: string): boolean => {
        const def = BV_EVENTS.find((e) => e.id === eventId)
        if (!def) return false

        set((prev) => ({
          activeEventId: eventId,
          eventTimer: Date.now() + def.duration * 1000,
        }))
        return true
      },

      bvAcquireArtifact: (artifactId: string): boolean => {
        const state = get()
        if (state.collectedArtifacts.includes(artifactId)) return false
        const def = BV_ARTIFACTS.find((a) => a.id === artifactId)
        if (!def) return false

        const cost = Math.floor(20 * bvRarityMultiplier(def.rarity))
        if (state.gold < cost) return false

        set((prev) => ({
          collectedArtifacts: [...prev.collectedArtifacts, artifactId],
          gold: prev.gold - cost,
        }))
        return true
      },

      bvAwakenThorned: (instanceId: string): boolean => {
        const state = get()
        const creature = state.ownedCreatures.find((c) => c.id === instanceId)
        if (!creature) return false
        if (creature.awakened) return false
        if (creature.level < 10) return false

        const bonus = bvGetDrainBonus(creature.level, creature.drainCount)

        set((prev) => ({
          ownedCreatures: prev.ownedCreatures.map((c) =>
            c.id === instanceId
              ? { ...c, awakened: true, power: c.power + bonus }
              : c
          ),
          bvBloodEssence: prev.bvBloodEssence + bonus,
        }))
        return true
      },
    }),
    {
      name: 'blood-vine-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: HOOK — useBloodVine
// ═══════════════════════════════════════════════════════════════════

export default function useBloodVine() {
  const store = useBVStore()
  const stateRef = useRef(store)
  useEffect(() => {
    stateRef.current = store
  }, [store])

  // ── State values ──────────────────────────────────────────────
  const bvLevel = store.bvLevel
  const bvBloodEssence = store.bvBloodEssence
  const bvVineSpread = store.bvVineSpread

  // ── Helper: bvDrain ───────────────────────────────────────────
  const bvDrain = useCallback((creatureId: string): boolean => {
    return stateRef.current.bvDrain(creatureId)
  }, [])

  // ── Helper: bvPlantThorn ──────────────────────────────────────
  const bvPlantThorn = useCallback((structureId: string): boolean => {
    return stateRef.current.bvPlantThorn(structureId)
  }, [])

  // ── Helper: bvEntangle ────────────────────────────────────────
  const bvEntangle = useCallback((targetId: string): boolean => {
    return stateRef.current.bvEntangle(targetId)
  }, [])

  // ── Helper: bvBloomBlood ──────────────────────────────────────
  const bvBloomBlood = useCallback((targetId: string): boolean => {
    return stateRef.current.bvBloomBlood(targetId)
  }, [])

  // ── Getter: Active Grove Details ──────────────────────────────
  const bvGetGroveDetails = useMemo(() => {
    if (!store.activeGroveId) return null
    const grove = BV_GROVES.find((g) => g.id === store.activeGroveId)
    if (!grove) return null
    const bonusSpecies = BV_GROVE_SPECIES_BONUS[store.activeGroveId] || []
    return { ...grove, bonusSpecies, isActive: true }
  }, [store])

  // ── Getter: Material Inventory ────────────────────────────────
  const bvGetMaterialInventory = useMemo(() => {
    const inventory: { material: BvMaterialDef; quantity: number; totalValue: number }[] = []
    for (const [materialId, quantity] of Object.entries(store.collectedMaterials)) {
      const material = BV_MATERIALS.find((m) => m.id === materialId)
      if (material && quantity > 0) {
        inventory.push({ material, quantity, totalValue: material.value * quantity })
      }
    }
    inventory.sort((a, b) => b.totalValue - a.totalValue)
    return inventory
  }, [store])

  // ── Getter: Owned Creatures ───────────────────────────────────
  const bvGetOwnedCreatures = useMemo(() => {
    return store.ownedCreatures.map((c) => {
      const def = BV_THORNS.find((d) => d.id === c.creatureDefId)
      return {
        ...c,
        def,
        speciesColor: def ? bvSpeciesColor(def.species) : BV_COLOR_DARK_SOIL,
        rarityColor: def ? bvRarityColor(def.rarity) : '#9CA3AF',
      }
    })
  }, [store])

  // ── Getter: Structure List ────────────────────────────────────
  const bvGetStructureList = useMemo(() => {
    return store.structures.map((s) => {
      const def = BV_STRUCTURES.find((d) => d.id === s.structureDefId)
      if (!def) return { ...s, def: null, nextCost: 0, maxed: s.level >= 10 }
      const nextCost = s.level >= 10 ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level))
      return { ...s, def, nextCost, maxed: s.level >= 10 }
    })
  }, [store])

  // ── Getter: Total Power ───────────────────────────────────────
  const bvGetTotalPower = useMemo(() => {
    let total = 0
    for (const c of store.ownedCreatures) {
      total += c.power
    }
    for (const aId of store.collectedArtifacts) {
      const artifact = BV_ARTIFACTS.find((a) => a.id === aId)
      if (artifact) {
        total += artifact.powerBonus
      }
    }
    total += store.structures.reduce((sum, s) => {
      return sum + bvGetStructureBonus(s.structureDefId, s.level)
    }, 0)
    return total
  }, [store])

  // ── Getter: Event Status ──────────────────────────────────────
  const bvGetEventStatus = useMemo(() => {
    return {
      hasActiveEvent: store.activeEventId !== null,
      activeEventId: store.activeEventId,
      eventTimer: store.eventTimer,
    }
  }, [store])

  // ── Getter: Active Event ──────────────────────────────────────
  const bvGetActiveEvent = useMemo(() => {
    if (!store.activeEventId) return null
    return BV_EVENTS.find((e) => e.id === store.activeEventId) || null
  }, [store])

  // ── Getter: Next Title ────────────────────────────────────────
  const bvGetNextTitle = useMemo(() => {
    const nextTitle = BV_TITLES.find(
      (t) => t.requiredLevel > store.bvLevel || t.requiredGroves > store.unlockedGroves.length
    )
    if (!nextTitle) return null
    return {
      ...nextTitle,
      levelGap: Math.max(0, nextTitle.requiredLevel - store.bvLevel),
      groveGap: Math.max(0, nextTitle.requiredGroves - store.unlockedGroves.length),
    }
  }, [store])

  // ── Getter: Rarity Summary ────────────────────────────────────
  const bvGetRaritySummary = useMemo(() => {
    const summary: Record<BvRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 }
    for (const c of store.ownedCreatures) {
      const def = BV_THORNS.find((d) => d.id === c.creatureDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const aId of store.collectedArtifacts) {
      const artifact = BV_ARTIFACTS.find((a) => a.id === aId)
      if (artifact) {
        summary[artifact.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Grove Summary ─────────────────────────────────────
  const bvGetGroveSummary = useMemo(() => {
    const totalGroves = BV_GROVES.length
    const unlocked = store.unlockedGroves.length
    return {
      totalGroves,
      unlocked,
      percent: Math.floor((unlocked / totalGroves) * 100),
      allUnlocked: unlocked >= totalGroves,
    }
  }, [store])

  // ── Getter: Unlocked Achievements ─────────────────────────────
  const bvGetUnlockedAchievements = useMemo(() => {
    const unlocked: BvAchievementDef[] = []
    for (const ach of BV_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      }
    }
    return { unlocked, total: BV_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ────────────────────────────────────
  const bvGetTitleProgress = useMemo(() => {
    return BV_TITLES.map((title) => ({
      ...title,
      unlocked: store.bvLevel >= title.requiredLevel && store.unlockedGroves.length >= title.requiredGroves,
      active: store.currentTitle === title.id,
      levelMet: store.bvLevel >= title.requiredLevel,
      groveMet: store.unlockedGroves.length >= title.requiredGroves,
    }))
  }, [store])

  // ── Getter: Collected Artifacts Detail ────────────────────────
  const bvGetCollectedArtifacts = useMemo(() => {
    return BV_ARTIFACTS.map((artifact) => ({
      ...artifact,
      collected: store.collectedArtifacts.includes(artifact.id),
      rarityColor: bvRarityColor(artifact.rarity),
      canAfford:
        store.gold >= Math.floor(20 * bvRarityMultiplier(artifact.rarity)) &&
        !store.collectedArtifacts.includes(artifact.id),
    }))
  }, [store])

  // ── Getter: Vine Sanctuary Health ─────────────────────────────
  const { bvGetVineHealth, bvGetEssenceEfficiency } = useMemo(() => {
    const { bloodEssence, maxBloodEssence, corruption, lastDrainAt } = store.vineSanctuary
    const vineHealth = {
      bloodEssence,
      maxBloodEssence,
      corruption,
      bloodEssencePercent: maxBloodEssence > 0 ? Math.floor((bloodEssence / maxBloodEssence) * 100) : 0,
      isCorrupted: corruption > 0,
      isCritical: bloodEssence < maxBloodEssence * 0.25,
      lastDrainAt,
    }

    const structureBonus = store.structures.reduce((sum, s) => {
      return sum + bvGetStructureBonus(s.structureDefId, s.level)
    }, 0)
    const artifactBonus = store.collectedArtifacts.reduce((sum, aId) => {
      const artifact = BV_ARTIFACTS.find((a) => a.id === aId)
      return sum + (artifact ? Math.floor(artifact.powerBonus * 0.2) : 0)
    }, 0)
    const essenceEfficiency = {
      baseRegen: 1,
      structureBonus,
      artifactBonus,
      totalBonus: 1 + structureBonus + artifactBonus,
      corruptionPenalty: corruption > 0 ? Math.floor(corruption * 0.5) : 0,
      netEfficiency: Math.max(0, 1 + structureBonus + artifactBonus - (corruption > 0 ? Math.floor(corruption * 0.5) : 0)),
    }

    return { bvGetVineHealth: vineHealth, bvGetEssenceEfficiency: essenceEfficiency }
  }, [store])

  // ── Getter: Species Summary ───────────────────────────────────
  const bvGetSpeciesSummary = useMemo(() => {
    const summary: Record<BvSpecies, number> = {
      blood_vine: 0,
      thorn_drake: 0,
      root_leech: 0,
      crimson_willow: 0,
      scarlet_mantis: 0,
      venom_ivy: 0,
      ember_bramble: 0,
    }
    for (const c of store.ownedCreatures) {
      const def = BV_THORNS.find((d) => d.id === c.creatureDefId)
      if (def) {
        summary[def.species] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Drain Stats ───────────────────────────────────────
  const bvGetDrainStats = useMemo(() => {
    return {
      totalDrained: store.totalDrained,
      totalCollected: store.totalCollected,
      totalUpgraded: store.totalUpgraded,
      totalThornsPlanted: store.totalThornsPlanted,
      totalBloomed: store.totalBloomed,
      totalEntangled: store.totalEntangled,
      drainRate: store.totalDrained > 0 ? Math.floor(store.bvVineSpread / Math.max(1, store.totalDrained) * 100) : 0,
      collectionRate: store.totalCollected > 0 ? Math.floor(store.totalCollected / Math.max(1, store.ownedCreatures.length)) : 0,
    }
  }, [store])

  // ── Getter: Power by Species ──────────────────────────────────
  const bvGetPowerBySpecies = useMemo(() => {
    const powerBySpecies: Record<BvSpecies, number> = {
      blood_vine: 0,
      thorn_drake: 0,
      root_leech: 0,
      crimson_willow: 0,
      scarlet_mantis: 0,
      venom_ivy: 0,
      ember_bramble: 0,
    }
    for (const c of store.ownedCreatures) {
      const def = BV_THORNS.find((d) => d.id === c.creatureDefId)
      if (def) {
        powerBySpecies[def.species] += c.power
      }
    }
    return powerBySpecies
  }, [store])

  // ── Getter: XP Progress ───────────────────────────────────────
  const bvGetXpProgress = useMemo(() => {
    const currentLevelXp = bvXpForLevel(store.bvLevel)
    const nextLevelXp = bvXpForLevel(store.bvLevel + 1)
    const xpInCurrentLevel = store.bvExp - currentLevelXp
    const xpNeededForNext = nextLevelXp - currentLevelXp
    const percent = xpNeededForNext > 0 ? Math.floor((xpInCurrentLevel / xpNeededForNext) * 100) : 100
    return {
      currentLevel: store.bvLevel,
      totalXp: store.bvExp,
      xpInCurrentLevel,
      xpNeededForNext,
      percent,
      isMaxLevel: store.bvLevel >= BV_MAX_LEVEL,
    }
  }, [store])

  // ── Getter: Material Summary ──────────────────────────────────
  const bvGetMaterialSummary = useMemo(() => {
    const summary: Record<BvRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 }
    for (const [materialId, quantity] of Object.entries(store.collectedMaterials)) {
      const def = BV_MATERIALS.find((m) => m.id === materialId)
      if (def && quantity > 0) {
        summary[def.rarity] += quantity
      }
    }
    return summary
  }, [store])

  // ── Getter: Top Creatures by Power ────────────────────────────
  const bvGetTopCreatures = useMemo(() => {
    const sorted = [...store.ownedCreatures].sort((a, b) => b.power - a.power)
    return sorted.slice(0, 10).map((c) => {
      const def = BV_THORNS.find((d) => d.id === c.creatureDefId)
      return {
        ...c,
        def,
        speciesColor: def ? bvSpeciesColor(def.species) : BV_COLOR_DARK_SOIL,
        rarityColor: def ? bvRarityColor(def.rarity) : '#9CA3AF',
      }
    })
  }, [store])

  // ── Getter: Event History ─────────────────────────────────────
  const bvGetEventHistory = useMemo(() => {
    const recentEvents = BV_EVENTS.map((event) => ({
      ...event,
      isActive: store.activeEventId === event.id,
      severityLabel: event.severity >= 5 ? 'Catastrophic' : event.severity >= 4 ? 'Severe' : event.severity >= 3 ? 'Moderate' : event.severity >= 2 ? 'Minor' : 'Trivial',
    }))
    return recentEvents
  }, [store])

  // ── Getter: Structure Costs ───────────────────────────────────
  const bvGetStructureCosts = useMemo(() => {
    return BV_STRUCTURES.map((def) => {
      const existing = store.structures.find((s) => s.structureDefId === def.id)
      const currentLevel = existing ? existing.level : 0
      const nextCost = currentLevel >= 10 ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
      const maxed = currentLevel >= 10
      const built = existing !== undefined
      return {
        ...def,
        currentLevel,
        nextCost,
        maxed,
        built,
      }
    })
  }, [store])

  // ── Getter: Ability List with Readiness ───────────────────────
  const bvGetAbilities = useMemo(() => {
    return BV_ABILITIES.map((ability) => {
      const essenceCost = Math.floor(ability.power * 0.1)
      return {
        ...ability,
        essenceCost,
        canAfford: store.bvBloodEssence >= essenceCost,
        elementColor: bvElementColor(ability.element),
      }
    })
  }, [store])

  // ── Getter: Creatures by Rarity ───────────────────────────────
  const bvGetCreaturesByRarity = useMemo(() => {
    const grouped: Record<BvRarity, BvCreatureDef[]> = { common: [], uncommon: [], rare: [], epic: [], legendary: [] }
    for (const creature of BV_THORNS) {
      grouped[creature.rarity].push(creature)
    }
    return grouped
  }, [])

  // ── Getter: Creatures by Species ──────────────────────────────
  const bvGetCreaturesBySpecies = useMemo(() => {
    const grouped: Record<BvSpecies, BvCreatureDef[]> = {
      blood_vine: [],
      thorn_drake: [],
      root_leech: [],
      crimson_willow: [],
      scarlet_mantis: [],
      venom_ivy: [],
      ember_bramble: [],
    }
    for (const creature of BV_THORNS) {
      grouped[creature.species].push(creature)
    }
    return grouped
  }, [])

  // ── Getter: Materials by Rarity ───────────────────────────────
  const bvGetMaterialsByRarity = useMemo(() => {
    const grouped: Record<BvRarity, BvMaterialDef[]> = { common: [], uncommon: [], rare: [], epic: [], legendary: [] }
    for (const material of BV_MATERIALS) {
      grouped[material.rarity].push(material)
    }
    return grouped
  }, [])

  // ── Getter: Artifacts by Rarity ───────────────────────────────
  const bvGetArtifactsByRarity = useMemo(() => {
    const grouped: Record<BvRarity, BvArtifactDef[]> = { common: [], uncommon: [], rare: [], epic: [], legendary: [] }
    for (const artifact of BV_ARTIFACTS) {
      grouped[artifact.rarity].push(artifact)
    }
    return grouped
  }, [])

  // ── Return everything ─────────────────────────────────────────
  return {
    // BV_ constants
    BV_SPECIES,
    BV_THORNS,
    BV_GROVES,
    BV_MATERIALS,
    BV_STRUCTURES,
    BV_ABILITIES,
    BV_ACHIEVEMENTS,
    BV_TITLES,
    BV_ARTIFACTS,
    BV_EVENTS,

    // Color constants
    BV_COLOR_BLOOD_RED,
    BV_COLOR_VINE_GREEN,
    BV_COLOR_THORN_CRIMSON,
    BV_COLOR_PETAL_BURGUNDY,
    BV_COLOR_DARK_SOIL,
    BV_COLOR_SAP_GOLD,
    BV_COLOR_MIST_VIOLET,
    BV_COLOR_EMBER_ORANGE,

    // State management
    bvLevel,
    bvBloodEssence,
    bvVineSpread,
    store,

    // Helper functions
    bvDrain,
    bvPlantThorn,
    bvEntangle,
    bvBloomBlood,

    // Getters
    bvGetGroveDetails,
    bvGetMaterialInventory,
    bvGetOwnedCreatures,
    bvGetStructureList,
    bvGetTotalPower,
    bvGetEventStatus,
    bvGetActiveEvent,
    bvGetNextTitle,
    bvGetRaritySummary,
    bvGetGroveSummary,
    bvGetUnlockedAchievements,
    bvGetTitleProgress,
    bvGetCollectedArtifacts,
    bvGetVineHealth,
    bvGetEssenceEfficiency,
    bvGetSpeciesSummary,
    bvGetDrainStats,
    bvGetPowerBySpecies,
    bvGetXpProgress,
    bvGetMaterialSummary,
    bvGetTopCreatures,
    bvGetEventHistory,
    bvGetStructureCosts,
    bvGetAbilities,
    bvGetCreaturesByRarity,
    bvGetCreaturesBySpecies,
    bvGetMaterialsByRarity,
    bvGetArtifactsByRarity,

    // Utility functions
    bvRarityColor,
    bvSpeciesColor,
    bvElementColor,
    bvRarityMultiplier,
    bvGetSpeciesBonus,
    bvGetDrainChance,

    // ── Additional computed helpers ─────────────────────────────

    // Getter: Grove Creatures Table
    bvGetGroveCreaturesTable: useMemo(() => {
      const table: Record<string, BvCreatureDef[]> = {}
      for (const grove of BV_GROVES) {
        const bonusSpecies = BV_GROVE_SPECIES_BONUS[grove.id] || []
        const creatures = BV_THORNS.filter(
          (c) => c.rarity === 'common' || bonusSpecies.includes(c.species)
        )
        table[grove.id] = creatures
      }
      return table
    }, []),

    // Getter: Creature Count
    bvGetCreatureCount: useMemo(() => {
      return store.ownedCreatures.length
    }, [store]),

    // Getter: Average Power
    bvGetAveragePower: useMemo(() => {
      if (store.ownedCreatures.length === 0) return 0
      const total = store.ownedCreatures.reduce((sum, c) => sum + c.power, 0)
      return Math.floor(total / store.ownedCreatures.length)
    }, [store]),

    // Getter: Total Materials Count
    bvGetTotalMaterialsCount: useMemo(() => {
      let total = 0
      for (const quantity of Object.values(store.collectedMaterials)) {
        total += quantity
      }
      return total
    }, [store]),

    // Getter: Total Structures Built
    bvGetTotalStructuresBuilt: useMemo(() => {
      return store.structures.filter((s) => s.built).length
    }, [store]),

    // Getter: Max Structure Level
    bvGetMaxStructureLevel: useMemo(() => {
      if (store.structures.length === 0) return 0
      return Math.max(...store.structures.map((s) => s.level))
    }, [store]),

    // Getter: Collection Completion
    bvGetCollectionCompletion: useMemo(() => {
      const creatureCompletion = Math.floor((store.ownedCreatures.length / BV_THORNS.length) * 100)
      const artifactCompletion = Math.floor((store.collectedArtifacts.length / BV_ARTIFACTS.length) * 100)
      const groveCompletion = Math.floor((store.unlockedGroves.length / BV_GROVES.length) * 100)
      const achievementCompletion = Math.floor((store.achievements.length / BV_ACHIEVEMENTS.length) * 100)
      const overallCompletion = Math.floor(
        (creatureCompletion + artifactCompletion + groveCompletion + achievementCompletion) / 4
      )
      return {
        creatureCompletion,
        artifactCompletion,
        groveCompletion,
        achievementCompletion,
        overallCompletion,
      }
    }, [store]),

    // Getter: Awakening Tier for a creature
    bvGetAwakeningTier: useMemo(() => {
      return (drainCount: number): string => {
        if (drainCount >= 100) return 'Transcendent'
        if (drainCount >= 50) return 'Mythic'
        if (drainCount >= 25) return 'Ancient'
        if (drainCount >= 10) return 'Empowered'
        if (drainCount >= 5) return 'Awakened'
        if (drainCount >= 1) return 'Wakening'
        return 'Dormant'
      }
    }, []),
  }
}
