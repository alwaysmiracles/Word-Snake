/**
 * Petal Academy Wire — flower magic school feature module for Word Snake
 *
 * A botanical academy management mini-game: enroll 35 flower students across
 * 5 rarity tiers, attend 8 magical classrooms, collect 30 botanical reagents,
 * build 25 garden structures, wield 22 bloom abilities, earn 8 horticultural
 * titles, arrange 15 enchanted bouquets, and celebrate 12 seasonal bloom events
 * — backed by a Zustand store with persist middleware.
 *
 * Storage key: petal-academy-wire
 * Prefix: pa / PA_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type PARarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type PAFlowerSchool = 'Rose' | 'Lily' | 'Sunflower' | 'Orchid' | 'Violet' | 'Tulip' | 'Cherry Blossom'

export interface PAStudentDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly school: PAFlowerSchool
  readonly rarity: PARarity
  readonly basePower: number
  readonly ability: string
}

export interface PAClassroomDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
}

export interface PAReagentDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: PARarity
  readonly source: string
  readonly value: number
}

export interface PAStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
}

export interface PAAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly school: PAFlowerSchool
}

export interface PAAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface PATitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredClassrooms: number
}

export interface PABouquetDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: PARarity
  readonly powerBonus: number
  readonly specialAbility: string
}

export interface PAEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface PAEnrolledStudent {
  readonly id: string
  studentDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  graduated: boolean
  graduationCount: number
  acquiredAt: number
}

export interface PAOwnedStructure {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface PAGardenState {
  health: number
  maxHealth: number
  wiltLevel: number
  lastTendedAt: number | null
}

export interface PAStoreState {
  enrolledStudents: PAEnrolledStudent[]
  collectedReagents: Record<string, number>
  structures: PAOwnedStructure[]
  achievements: string[]
  currentTitle: string
  collectedBouquets: string[]
  unlockedClassrooms: string[]
  academyLevel: number
  academyExp: number
  gold: number
  petalEnergy: number
  totalEnrolled: number
  totalBrewed: number
  totalUpgraded: number
  totalGraduated: number
  totalHybridized: number
  activeEventId: string | null
  eventTimer: number
  garden: PAGardenState
  activeClassroomId: string | null
}

export interface PAStoreActions {
  paEnrollStudent: (studentId: string) => boolean
  paBrewPotion: (reagentId: string) => number
  paUpgradeGarden: (structureId: string) => boolean
  paUseAbility: (abilityId: string) => boolean
  paHandleBloomEvent: (eventId: string) => boolean
  paArrangeBouquet: (bouquetId: string) => boolean
  paPlantGarden: (gardenPlotId: string) => boolean
  paHybridizeFlower: (studentInstanceId: string) => boolean
  paCastSpell: (targetId: string) => boolean
  paGraduateStudent: (instanceId: string) => boolean
}

export type PAFullStore = PAStoreState & PAStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const PA_COLOR_ROSE_RED: string = '#E11D48'
export const PA_COLOR_LILY_WHITE: string = '#FAFAF9'
export const PA_COLOR_SUNFLOWER_GOLD: string = '#F59E0B'
export const PA_COLOR_ORCHID_PURPLE: string = '#A855F7'
export const PA_COLOR_VIOLET_BLUE: string = '#6366F1'
export const PA_COLOR_TULIP_PINK: string = '#EC4899'
export const PA_COLOR_CHERRY_PINK: string = '#FDA4AF'
export const PA_COLOR_LEAF_GREEN: string = '#22C55E'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const PA_MAX_LEVEL = 50
const PA_INITIAL_GOLD = 500
const PA_INITIAL_ENERGY = 100

function paXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= PA_MAX_LEVEL) return Infinity
  return Math.floor(85 * Math.pow(1.13, level) + level * 16)
}

function paLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < PA_MAX_LEVEL) {
    const needed = paXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function paGenerateId(): string {
  return `pa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function paRarityMultiplier(rarity: PARarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function paSchoolColor(school: PAFlowerSchool): string {
  switch (school) {
    case 'Rose': return PA_COLOR_ROSE_RED
    case 'Lily': return PA_COLOR_LILY_WHITE
    case 'Sunflower': return PA_COLOR_SUNFLOWER_GOLD
    case 'Orchid': return PA_COLOR_ORCHID_PURPLE
    case 'Violet': return PA_COLOR_VIOLET_BLUE
    case 'Tulip': return PA_COLOR_TULIP_PINK
    case 'Cherry Blossom': return PA_COLOR_CHERRY_PINK
  }
}

function paRarityColor(rarity: PARarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#818CF8'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: SCHOOL BONUSES & ENROLLMENT CHANCES
// ═══════════════════════════════════════════════════════════════════

const PA_SCHOOL_BONUSES: Record<PAFlowerSchool, { growth: number; fragrance: number; resistBonus: number }> = {
  Rose: { growth: 10, fragrance: 15, resistBonus: 5 },
  Lily: { growth: 5, fragrance: 10, resistBonus: 20 },
  Sunflower: { growth: 20, fragrance: 5, resistBonus: 0 },
  Orchid: { growth: 8, fragrance: 20, resistBonus: 10 },
  Violet: { growth: 5, fragrance: 5, resistBonus: 25 },
  Tulip: { growth: 15, fragrance: 12, resistBonus: 8 },
  'Cherry Blossom': { growth: 12, fragrance: 18, resistBonus: 3 },
}

const PA_ENROLL_CHANCES: Record<PARarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
}

const PA_CLASSROOM_SCHOOL_BONUS: Record<string, PAFlowerSchool[]> = {
  rose_pavilion: ['Rose', 'Cherry Blossom'],
  lily_pond: ['Lily', 'Orchid'],
  sunflower_meadow: ['Sunflower', 'Tulip'],
  orchid_greenhouse: ['Orchid', 'Lily'],
  violet_hollow: ['Violet', 'Rose'],
  tulip_garden: ['Tulip', 'Sunflower'],
  cherry_atrium: ['Cherry Blossom', 'Violet'],
  grand_greenhouse: ['Rose', 'Lily', 'Sunflower', 'Orchid', 'Violet', 'Tulip', 'Cherry Blossom'],
}

function paGetSchoolBonus(school: PAFlowerSchool): { growth: number; fragrance: number; resistBonus: number } {
  return PA_SCHOOL_BONUSES[school]
}

function paGetEnrollChance(rarity: PARarity, activeClassroomId: string | null): number {
  let chance = PA_ENROLL_CHANCES[rarity]
  if (activeClassroomId) {
    const bonusSchools = PA_CLASSROOM_SCHOOL_BONUS[activeClassroomId]
    if (bonusSchools && bonusSchools.length > 2) {
      chance = chance * 1.5
    }
  }
  return Math.min(100, Math.floor(chance))
}

function paGetGraduationBonus(level: number, graduationCount: number): number {
  return Math.floor(level * 15 * (1 + graduationCount * 0.3))
}

function paGetStructureBonus(structureId: string, level: number): number {
  switch (structureId) {
    case 'seedling_bed': return level * 2
    case 'greenhouse_dome': return level * 5
    case 'fountain_garden': return level * 8
    case 'arboretum_tower': return level * 12
    case 'grand_herbarium': return level * 20
    case 'irrigation_well': return level * 3
    case 'botanical_forge': return level * 7
    case 'enchantment_altar': return level * 15
    default: return level * 2
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: PA_STUDENTS — 35 Flower Students (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const PA_STUDENTS: readonly PAStudentDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'rose_sprout',
    name: 'Rose Sprout',
    description:
      'A tiny rosebud just beginning to unfurl its first petals. Its thorns are soft and harmless, and its fragrance carries the innocent promise of spring mornings in the academy courtyard.',
    school: 'Rose',
    rarity: 'common',
    basePower: 15,
    ability: 'Thorn Prickle',
  },
  {
    id: 'lily_pad_ling',
    name: 'Lily Padling',
    description:
      'A small lily nymph who floats on the surface of the academy pond. Its broad leaves provide shelter for water sprites, and its white blossoms open only during lectures on purity magic.',
    school: 'Lily',
    rarity: 'common',
    basePower: 18,
    ability: 'Petal Shield',
  },
  {
    id: 'sunflower_seedling',
    name: 'Sunflower Seedling',
    description:
      'A cheerful sunflower sprout that always turns to face the brightest light source in any room. Its sunny disposition makes it the most popular study partner among common students.',
    school: 'Sunflower',
    rarity: 'common',
    basePower: 16,
    ability: 'Solar Beam',
  },
  {
    id: 'orchid_bud',
    name: 'Orchid Bud',
    description:
      'A delicate orchid student still wrapped in its protective bud scales. It speaks in whispers and prefers the humid corners of the greenhouse where it can practice scent magic undisturbed.',
    school: 'Orchid',
    rarity: 'common',
    basePower: 17,
    ability: 'Fragrant Mist',
  },
  {
    id: 'violet_curl',
    name: 'Violet Curl',
    description:
      'A shy violet student whose petals curl inward when embarrassed. Despite its timidity, it possesses a remarkable talent for camouflage magic, blending seamlessly with any garden background.',
    school: 'Violet',
    rarity: 'common',
    basePower: 20,
    ability: 'Shadow Bloom',
  },
  {
    id: 'tulip_shoot',
    name: 'Tulip Shoot',
    description:
      'A bright-eyed tulip student with petals of vivid pink. It is remarkably organized and keeps meticulous notes on every lesson, sharing its color-changing ink with fellow students.',
    school: 'Tulip',
    rarity: 'common',
    basePower: 14,
    ability: 'Color Splash',
  },
  {
    id: 'cherry_droplet',
    name: 'Cherry Droplet',
    description:
      'A tiny cherry blossom student whose petals flutter like pink snow in even the slightest breeze. It dreams of one day creating a perpetual sakura season that lasts all year round.',
    school: 'Cherry Blossom',
    rarity: 'common',
    basePower: 19,
    ability: 'Petal Storm',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'rose_knight',
    name: 'Rose Knight',
    description:
      'A gallant rose student who has hardened its thorns into formidable weapons. It wears a cape of fallen petals and has sworn to protect all common students from garden pests and wilting spells.',
    school: 'Rose',
    rarity: 'uncommon',
    basePower: 32,
    ability: 'Thorn Barrage',
  },
  {
    id: 'lily_mage',
    name: 'Lily Mage',
    description:
      'An uncommon lily student who has mastered basic water conjuration. It can summon gentle rains to water the entire garden in minutes and uses dew drops as lenses for far-seeing spells.',
    school: 'Lily',
    rarity: 'uncommon',
    basePower: 35,
    ability: 'Dew Conjuration',
  },
  {
    id: 'sunflower_bard',
    name: 'Sunflower Bard',
    description:
      'A melodious sunflower student whose seeds rattle like tiny maracas when it sings. Its songs accelerate plant growth by thirty percent and fill the greenhouse with golden warmth.',
    school: 'Sunflower',
    rarity: 'uncommon',
    basePower: 30,
    ability: 'Growth Anthem',
  },
  {
    id: 'orchid_alchemist',
    name: 'Orchid Alchemist',
    description:
      'A precocious orchid student who spends every free hour in the reagent laboratory. It has already synthesized three new fragrance compounds unknown to the senior professors.',
    school: 'Orchid',
    rarity: 'uncommon',
    basePower: 34,
    ability: 'Scent Synthesis',
  },
  {
    id: 'violet_ranger',
    name: 'Violet Ranger',
    description:
      'A stealthy violet student who moves through the academy gardens without making a sound. It serves as the academy scout, reporting pest invasions and weather changes before anyone else notices.',
    school: 'Violet',
    rarity: 'uncommon',
    basePower: 38,
    ability: 'Phantom Step',
  },
  {
    id: 'tulip_artist',
    name: 'Tulip Artist',
    description:
      'A creative tulip student who paints with its own pigment-shifting petals. Its artwork can change the color of any flower in the garden and is used by professors to teach chromatography.',
    school: 'Tulip',
    rarity: 'uncommon',
    basePower: 36,
    ability: 'Petal Painting',
  },
  {
    id: 'cherry_dancer',
    name: 'Cherry Dancer',
    description:
      'A graceful cherry blossom student whose petals form elegant patterns as it dances through the air. Its dances create localized wind currents that distribute pollen across the entire academy.',
    school: 'Cherry Blossom',
    rarity: 'uncommon',
    basePower: 33,
    ability: 'Blossom Waltz',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'rose_champion',
    name: 'Rose Champion',
    description:
      'A champion-class rose student whose thorns gleam like rubies. It has won the annual Thorn Tournament three years running and can create walls of living brambles that protect entire classrooms.',
    school: 'Rose',
    rarity: 'rare',
    basePower: 58,
    ability: 'Crimson Fortress',
  },
  {
    id: 'lily_scholar',
    name: 'Lily Scholar',
    description:
      'A brilliant lily student who has memorized every text in the botanical library. Its petals open to reveal glowing runes of ancient plant wisdom, and it tutors struggling students after hours.',
    school: 'Lily',
    rarity: 'rare',
    basePower: 62,
    ability: 'Ancient Wisdom',
  },
  {
    id: 'sunflower_sage',
    name: 'Sunflower Sage',
    description:
      'A wise sunflower student whose face tracks not just the sun but all sources of magical energy in the academy. It can channel solar power into devastating beams of concentrated growth energy.',
    school: 'Sunflower',
    rarity: 'rare',
    basePower: 55,
    ability: 'Solar Flare',
  },
  {
    id: 'orchid_perfumer',
    name: 'Orchid Perfumer',
    description:
      'A master orchid student who can distill any emotion into a fragrance. Its perfumes can calm anxious students, energize tired ones, and even temporarily grant magical abilities to non-floral beings.',
    school: 'Orchid',
    rarity: 'rare',
    basePower: 65,
    ability: 'Emotion Extract',
  },
  {
    id: 'violet_shadow',
    name: 'Violet Shadow',
    description:
      'A mysterious violet student who has merged with the shadows of the garden. It can teleport between any two patches of darkness and its petals absorb all light, creating zones of perfect stealth.',
    school: 'Violet',
    rarity: 'rare',
    basePower: 60,
    ability: 'Shadow Garden',
  },
  {
    id: 'tulip_engineer',
    name: 'Tulip Engineer',
    description:
      'An ingenious tulip student who builds mechanical contraptions from petals and stems. Its greatest invention is a self-watering pot that responds to the emotional state of the plant inside it.',
    school: 'Tulip',
    rarity: 'rare',
    basePower: 57,
    ability: 'Petal Machinery',
  },
  {
    id: 'cherry_storm',
    name: 'Cherry Storm',
    description:
      'A powerful cherry blossom student who commands swarms of petal-shaped projectiles. In battle, it creates blizzards of pink petals that obscure vision and drain the energy of opponents.',
    school: 'Cherry Blossom',
    rarity: 'rare',
    basePower: 63,
    ability: 'Sakura Blizzard',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'rose_empress',
    name: 'Rose Empress',
    description:
      'A regal rose student whose crown of thorns has been enchanted by the academy founder. She commands an army of lesser roses and her fragrance can compel obedience from any plant within earshot.',
    school: 'Rose',
    rarity: 'epic',
    basePower: 95,
    ability: 'Thorn Dominion',
  },
  {
    id: 'lily_ancient',
    name: 'Lily Ancient',
    description:
      'An ancient lily spirit that has attended the academy for over a thousand years. Its roots extend through every floor of the building, and it knows secrets about the school that even the headmaster has forgotten.',
    school: 'Lily',
    rarity: 'epic',
    basePower: 100,
    ability: 'Eternal Bloom',
  },
  {
    id: 'sunflower_phoenix',
    name: 'Sunflower Phoenix',
    description:
      'A sunflower student that died during a harsh winter and was reborn from its own seeds with fiery golden petals. It can ignite itself to become a living sun, providing light and warmth to the entire academy.',
    school: 'Sunflower',
    rarity: 'epic',
    basePower: 105,
    ability: 'Solar Rebirth',
  },
  {
    id: 'orchid_queen',
    name: 'Orchid Queen',
    description:
      'The undisputed queen of orchid magic whose fragrance has been classified as a controlled substance. A single breath of her scent can induce visions of the future lasting up to three days.',
    school: 'Orchid',
    rarity: 'epic',
    basePower: 98,
    ability: 'Prophetic Perfume',
  },
  {
    id: 'violet_abyss',
    name: 'Violet Abyss',
    description:
      'A violet student who accidentally fell into the dimensional void beneath the academy and returned transformed. Its petals are now windows into other dimensions, each one showing a different reality.',
    school: 'Violet',
    rarity: 'epic',
    basePower: 92,
    ability: 'Dimensional Bloom',
  },
  {
    id: 'tulip_crafter',
    name: 'Tulip Crafter',
    description:
      'A legendary tulip artisan who can forge magical items from compressed petals. Its creations include swords that cut through magical barriers and shields woven from living flower stems.',
    school: 'Tulip',
    rarity: 'epic',
    basePower: 96,
    ability: 'Petal Forge',
  },
  {
    id: 'cherry_divine',
    name: 'Cherry Divine',
    description:
      'A cherry blossom student touched by divine energy during a celestial alignment. Its petals glow with soft golden light and falling cherry blossoms from its branches grant temporary invincibility to those they touch.',
    school: 'Cherry Blossom',
    rarity: 'epic',
    basePower: 88,
    ability: 'Divine Sakura',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'rose_primordial',
    name: 'Rose Primordial',
    description:
      'The original rose from which all roses in every world descend. Its thorns can pierce reality itself, and its fragrance contains the memory of the first garden ever planted at the dawn of creation.',
    school: 'Rose',
    rarity: 'legendary',
    basePower: 150,
    ability: 'Genesis Thorn',
  },
  {
    id: 'lily_world_bloom',
    name: 'Lily World Bloom',
    description:
      'A lily of such purity that it exists simultaneously in all bodies of water across every world. Wherever there is a calm pond, this lily appears at midnight, and drinking from its nectar grants eternal youth.',
    school: 'Lily',
    rarity: 'legendary',
    basePower: 145,
    ability: 'World Pond',
  },
  {
    id: 'sunflower_eternal',
    name: 'Sunflower Eternal',
    description:
      'A sunflower that has never stopped facing the sun since the day it sprouted millions of years ago. It absorbs solar energy across dimensions and can channel enough power to make an entire planet bloom in seconds.',
    school: 'Sunflower',
    rarity: 'legendary',
    basePower: 140,
    ability: 'Omniversal Growth',
  },
  {
    id: 'orchid_dream',
    name: 'Orchid Dream',
    description:
      'An orchid that blooms only in dreams. Its fragrance exists in the space between waking and sleeping, and those who inhale it gain the ability to enter and shape the dreams of any living being.',
    school: 'Orchid',
    rarity: 'legendary',
    basePower: 148,
    ability: 'Dream Weave',
  },
  {
    id: 'violet_cosmic',
    name: 'Violet Cosmic',
    description:
      'A violet that grew from a seed that drifted through the vacuum of space for eons before landing in the academy garden. Its petals contain the pattern of every constellation, and it draws power from starlight.',
    school: 'Violet',
    rarity: 'legendary',
    basePower: 142,
    ability: 'Star Violet',
  },
  {
    id: 'tulip_rainbow',
    name: 'Tulip Rainbow',
    description:
      'A tulip that cycles through every color ever perceived by any eye in any world, plus colors that exist only in mathematical abstractions. Looking at it directly causes temporary synesthesia and enhanced magical perception.',
    school: 'Tulip',
    rarity: 'legendary',
    basePower: 138,
    ability: 'Spectrum Bloom',
  },
  {
    id: 'cherry_eternal_spring',
    name: 'Cherry Eternal Spring',
    description:
      'The sacred cherry tree whose blossoms have been falling since the academy was founded. It is said that the day the last petal falls, the academy will close forever. Each petal contains a wish waiting to be granted.',
    school: 'Cherry Blossom',
    rarity: 'legendary',
    basePower: 135,
    ability: 'Eternal Sakura Rain',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: PA_CLASSROOMS — 8 Academy Classrooms
// ═══════════════════════════════════════════════════════════════════

export const PA_CLASSROOMS: readonly PAClassroomDef[] = [
  {
    id: 'rose_pavilion',
    name: 'Rose Pavilion',
    description:
      'An elegant open-air pavilion draped in climbing roses of every shade of red. Thorns along the pillars protect against intruders, and the air is thick with the intoxicating scent of a thousand blooms.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['+5% enrollment rate', 'Basic reagent gathering'],
  },
  {
    id: 'lily_pond',
    name: 'Lily Pond Classroom',
    description:
      'A classroom built on a floating platform in the middle of a crystal-clear lily pond. Students sit on lily pads while the professor teaches from the center of a giant water lily. Lessons on water magic are held here.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['+10% lily reagent yield', 'Rare student encounters'],
  },
  {
    id: 'sunflower_meadow',
    name: 'Sunflower Meadow Hall',
    description:
      'A vast open meadow where giant sunflowers serve as natural pillars supporting a living roof of woven vines. The hall is always warm and bright, making it ideal for growth magic and solar enchantment courses.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['+15% student power', 'Sunlight healing aura'],
  },
  {
    id: 'orchid_greenhouse',
    name: 'Orchid Greenhouse',
    description:
      'A humidity-controlled greenhouse filled with rare orchids from every climate zone. The air shimmers with magical mist, and each orchid species whispers its secrets to students who listen closely enough.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['+20% petal energy regeneration', 'Advanced brewing unlocked'],
  },
  {
    id: 'violet_hollow',
    name: 'Violet Hollow',
    description:
      'A mysterious underground chamber illuminated only by bioluminescent violets. The walls pulse with deep purple light, and the silence within enhances concentration for shadow magic and stealth training.',
    minLevel: 22,
    unlockCost: 3000,
    bonuses: ['+25% violet school power', 'Rare reagents available'],
  },
  {
    id: 'tulip_garden',
    name: 'Tulip Garden Amphitheater',
    description:
      'A circular amphitheater carved into a hillside and surrounded by concentric rings of tulips in every imaginable color. The acoustics are perfect for enchantment lectures and group spellcasting practice.',
    minLevel: 30,
    unlockCost: 7500,
    bonuses: ['+30% tulip school power', 'Epic student enrollment unlocked'],
  },
  {
    id: 'cherry_atrium',
    name: 'Cherry Blossom Atrium',
    description:
      'A breathtaking glass atrium where cherry blossom petals fall perpetually from enchanted branches. The petals form patterns that encode ancient floral spells, and the atrium serves as the academy graduation hall.',
    minLevel: 38,
    unlockCost: 15000,
    bonuses: ['+35% cherry blossom power', 'Legendary reagent chance'],
  },
  {
    id: 'grand_greenhouse',
    name: 'Grand Greenhouse',
    description:
      'The heart of the academy, a colossal greenhouse that contains miniature biomes from every world where flowers grow. Time flows differently in each zone, and the combined magical energy here is nearly infinite.',
    minLevel: 45,
    unlockCost: 30000,
    bonuses: ['+50% all school power', 'Legendary student enrollment', 'Grand brewing available'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: PA_REAGENTS — 30 Botanical Reagents
// ═══════════════════════════════════════════════════════════════════

export const PA_REAGENTS: readonly PAReagentDef[] = [
  // Common (6)
  { id: 'rose_petal', name: 'Rose Petal', description: 'A single crimson rose petal dried to preserve its magical properties. Used in basic love potions and protective charm recipes.', rarity: 'common', source: 'rose_pavilion', value: 5 },
  { id: 'lily_nectar', name: 'Lily Nectar', description: 'Sweet golden liquid collected from lily stamens at dawn. Has mild healing properties when dissolved in spring water.', rarity: 'common', source: 'lily_pond', value: 6 },
  { id: 'sunflower_seed', name: 'Sunflower Seed', description: 'A striped seed from a sunflower head that never stops spinning. Contains concentrated solar energy useful in growth spells.', rarity: 'common', source: 'sunflower_meadow', value: 4 },
  { id: 'orchid_pollen', name: 'Orchid Pollen', description: 'Fine purple dust harvested from rare orchid flowers. Enhances the fragrance of any potion it is added to.', rarity: 'common', source: 'orchid_greenhouse', value: 8 },
  { id: 'violet_leaf', name: 'Violet Leaf', description: 'A heart-shaped violet leaf that maintains a constant cool temperature. Used as a base ingredient in cooling salves.', rarity: 'common', source: 'violet_hollow', value: 7 },
  { id: 'tulip_bulb', name: 'Tulip Bulb', description: 'A dormant tulip bulb that pulses with latent color energy. Planting it produces a fully grown tulip within minutes when watered with magic.', rarity: 'common', source: 'tulip_garden', value: 9 },

  // Uncommon (6)
  { id: 'rose_thorn_essence', name: 'Rose Thorn Essence', description: 'Distilled essence from enchanted rose thorns. A single drop can harden any surface to the durability of steel.', rarity: 'uncommon', source: 'rose_pavilion', value: 28 },
  { id: 'lily_root', name: 'Lily Root', description: 'A pale root from a deep-water lily that has absorbed minerals for decades. Enhances the duration of water-based spells by fifty percent.', rarity: 'uncommon', source: 'lily_pond', value: 35 },
  { id: 'sunflower_stem_sap', name: 'Sunflower Stem Sap', description: 'Thick golden sap that flows through sunflower stems. When applied to seeds, it guarantees germination within twenty-four hours.', rarity: 'uncommon', source: 'sunflower_meadow', value: 32 },
  { id: 'orchid_spore', name: 'Orchid Spore', description: 'A luminescent spore from a bioluminescent orchid. It creates a soft glow that lasts for weeks and is used in potion illumination.', rarity: 'uncommon', source: 'orchid_greenhouse', value: 40 },
  { id: 'violet_shadow_dew', name: 'Violet Shadow Dew', description: 'Dew that forms only on violets growing in complete darkness. It is weightless and can be used to make objects temporarily invisible.', rarity: 'uncommon', source: 'violet_hollow', value: 30 },
  { id: 'tulip_pigment', name: 'Tulip Pigment', description: 'Concentrated color extract from rare tulip varieties. A tiny amount can permanently change the hue of any flower or fabric.', rarity: 'uncommon', source: 'tulip_garden', value: 45 },

  // Rare (6)
  { id: 'rose_crown_bloom', name: 'Rose Crown Bloom', description: 'The central bloom from a Rose Champion\'s crown. It radiates protective energy and can create barriers that block all physical harm.', rarity: 'rare', source: 'rose_pavilion', value: 120 },
  { id: 'lily_moonlight_dew', name: 'Lily Moonlight Dew', description: 'Dew collected from lilies blooming only under a full moon. It has powerful regenerative properties and can heal nearly any wound.', rarity: 'rare', source: 'lily_pond', value: 150 },
  { id: 'sunflower_core', name: 'Sunflower Core', description: 'The dense central disc of a giant sunflower containing concentrated solar magic. It generates warmth and light for decades without fading.', rarity: 'rare', source: 'sunflower_meadow', value: 140 },
  { id: 'orchid_venom', name: 'Orchid Venom', description: 'A rare toxin produced by carnivorous orchid species. In tiny doses it enhances magical sensitivity; in large doses it induces deep magical sleep.', rarity: 'rare', source: 'orchid_greenhouse', value: 160 },
  { id: 'violet_crystal', name: 'Violet Crystal', description: 'A violet that has been compressed under magical pressure until it crystallized. It stores shadow energy and can release it as a defensive pulse.', rarity: 'rare', source: 'violet_hollow', value: 135 },
  { id: 'tulip_diamond_petal', name: 'Tulip Diamond Petal', description: 'A petal from a tulip that has been hardened by centuries of magical pressure until it became as hard and clear as diamond.', rarity: 'rare', source: 'tulip_garden', value: 110 },

  // Epic (6)
  { id: 'rose_blood_petal', name: 'Rose Blood Petal', description: 'A petal from the Rose Primordial itself. It contains the essence of all thorn magic and can command any rose in any world to do its bidding.', rarity: 'epic', source: 'cherry_atrium', value: 500 },
  { id: 'lily_world_water', name: 'Lily World Water', description: 'Water drawn from a lily pond that exists in all dimensions simultaneously. Drinking it grants the ability to breathe underwater and communicate with aquatic plants.', rarity: 'epic', source: 'cherry_atrium', value: 550 },
  { id: 'sunflower_ember', name: 'Sunflower Ember', description: 'A seed from the Sunflower Phoenix that still smolders with rebirth energy. Planting it causes a new sunflower to erupt from the ground in a burst of flame.', rarity: 'epic', source: 'tulip_garden', value: 600 },
  { id: 'orchid_dream_fragments', name: 'Orchid Dream Fragments', description: 'Petals from the Orchid Dream that have solidified upon waking. They retain their dream-like properties and can be used to enter others\' dreams.', rarity: 'epic', source: 'cherry_atrium', value: 520 },
  { id: 'violet_void_essence', name: 'Violet Void Essence', description: 'Essence extracted from the Violet Abyss student. It allows temporary passage between dimensions and creates portals in shadow.', rarity: 'epic', source: 'violet_hollow', value: 480 },
  { id: 'cherry_divine_petal', name: 'Cherry Divine Petal', description: 'A single petal from the Cherry Divine student that radiates golden light. It grants temporary invincibility and shields all allies within a ten-foot radius.', rarity: 'epic', source: 'cherry_atrium', value: 570 },

  // Legendary (6)
  { id: 'primordial_seed', name: 'Primordial Seed', description: 'The seed from which the first flower ever grew. It contains the complete blueprint of all botanical life and can sprout any plant species in existence.', rarity: 'legendary', source: 'grand_greenhouse', value: 5000 },
  { id: 'world_root_heart', name: 'World Root Heart', description: 'The central heart of the root system connecting all gardens in the world. It pulses with the combined life force of every living plant.', rarity: 'legendary', source: 'grand_greenhouse', value: 6000 },
  { id: 'eternal_bloom_nectar', name: 'Eternal Bloom Nectar', description: 'Nectar from flowers that bloom eternally without ever wilting. A single sip grants immortality to any plant, preventing decay forever.', rarity: 'legendary', source: 'grand_greenhouse', value: 5500 },
  { id: 'rainbow_petal_matrix', name: 'Rainbow Petal Matrix', description: 'The fundamental pattern from which all flower colors are derived. Studying it reveals the mathematical formula for creating entirely new colors.', rarity: 'legendary', source: 'grand_greenhouse', value: 7000 },
  { id: 'garden_of_eden_sap', name: 'Garden of Eden Sap', description: 'Sap from the original Garden of Eden tree. It contains the purest form of growth magic and can make any barren land fertile within moments.', rarity: 'legendary', source: 'grand_greenhouse', value: 6500 },
  { id: 'bloom_sovereign_crown', name: 'Bloom Sovereign Crown', description: 'A crown woven from every flower species in existence. Wearing it grants absolute authority over all plant life in every world simultaneously.', rarity: 'legendary', source: 'grand_greenhouse', value: 8000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: PA_STRUCTURES — 25 Garden Structures
// ═══════════════════════════════════════════════════════════════════

export const PA_STRUCTURES: readonly PAStructureDef[] = [
  // Cultivation (5)
  { id: 'seedling_bed', name: 'Seedling Bed', description: 'A raised bed of enchanted soil where new flower students take root and begin their studies. Automatically waters and fertilizes its occupants.', baseCost: 100, costMultiplier: 1.5 },
  { id: 'greenhouse_dome', name: 'Greenhouse Dome', description: 'A crystalline dome that maintains perfect growing conditions year-round. Increases the enrollment rate of uncommon flower students significantly.', baseCost: 400, costMultiplier: 1.6 },
  { id: 'fountain_garden', name: 'Fountain Garden', description: 'A magical fountain whose waters carry dissolved petal energy. Students who drink from it gain temporary boosts to their growth speed and fragrance.', baseCost: 1200, costMultiplier: 1.7 },
  { id: 'arboretum_tower', name: 'Arboretum Tower', description: 'A towering structure wrapped in flowering vines that serves as a dormitory for rare and epic students. The height enhances their connection to sunlight and rain.', baseCost: 3000, costMultiplier: 1.8 },
  { id: 'grand_herbarium', name: 'Grand Herbarium', description: 'The ultimate cultivation structure, a living building made entirely of interwoven flowering plants. Legendary students can only be enrolled if this structure exists.', baseCost: 8000, costMultiplier: 2.0 },

  // Production (5)
  { id: 'pollen_collector', name: 'Pollen Collector', description: 'An automated device that gently extracts pollen from flowers without harming them. Produces a steady supply of basic reagents every hour.', baseCost: 80, costMultiplier: 1.4 },
  { id: 'nectar_distillery', name: 'Nectar Distillery', description: 'A copper still heated by enchanted embers that distills raw nectar into concentrated magical reagents. Produces uncommon quality materials.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'petal_press', name: 'Petal Press', description: 'A magical press that flattens and preserves petals while enhancing their magical properties. Essential for creating high-quality potion ingredients.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'root_excavator', name: 'Root Excavator', description: 'A careful digging machine that extracts deep roots without killing the parent plant. Produces rare root-based reagents from mature garden plants.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'botanical_forge', name: 'Botanical Forge', description: 'A forge that uses plant sap instead of metal, combining reagents into powerful magical compounds. Can produce epic-tier reagent combinations.', baseCost: 5000, costMultiplier: 1.8 },

  // Defense (5)
  { id: 'thorn_hedge', name: 'Thorn Hedge Wall', description: 'A living wall of thorny roses that regrows when damaged. Provides basic protection against garden pests and unauthorized visitors to the academy.', baseCost: 120, costMultiplier: 1.4 },
  { id: 'vine_barrier', name: 'Vine Barrier', description: 'A barrier of intertwined magical vines that flex and bend to absorb impacts. Effective against both physical intrusions and minor magical attacks.', baseCost: 500, costMultiplier: 1.5 },
  { id: 'pollen_shield_generator', name: 'Pollen Shield Generator', description: 'Projects a protective dome of dense pollen that repels harmful insects and filters out negative magical energy from the surrounding environment.', baseCost: 1500, costMultiplier: 1.6 },
  { id: 'bloom_turret', name: 'Bloom Turret', description: 'An automated turret that fires concentrated beams of petal energy at approaching threats. Effective against both ground-based and aerial garden invaders.', baseCost: 700, costMultiplier: 1.5 },
  { id: 'garden_fortress', name: 'Garden Fortress', description: 'A massive fortress built from enchanted wood and flowering stone. It generates its own defensive microclimate and blooms with protective flowers during attacks.', baseCost: 4000, costMultiplier: 1.8 },

  // Utility (5)
  { id: 'irrigation_well', name: 'Irrigation Well', description: 'A well that draws magic-infused water from deep underground aquifers. Provides passive petal energy regeneration for all garden operations.', baseCost: 150, costMultiplier: 1.4 },
  { id: 'reagent_vault', name: 'Reagent Vault', description: 'A temperature and humidity-controlled vault that preserves botanical reagents at peak potency indefinitely. No reagent ever degrades inside.', baseCost: 250, costMultiplier: 1.5 },
  { id: 'resting_gazebo', name: 'Resting Gazebo', description: 'A peaceful gazebo surrounded by fragrant flowers where students recover their energy faster. Reduces cooldowns on all bloom abilities.', baseCost: 600, costMultiplier: 1.5 },
  { id: 'wilt_purifier', name: 'Wilt Purifier', description: 'A device that detects and reverses wilting in garden plants. Essential for maintaining garden health during droughts or magical attacks.', baseCost: 1000, costMultiplier: 1.6 },
  { id: 'enchantment_altar', name: 'Enchantment Altar', description: 'A sacred altar where powerful floral enchantments can be cast. Requires immense petal energy but produces extraordinary transformation results.', baseCost: 6000, costMultiplier: 2.0 },

  // Special (5)
  { id: 'butterfly_garden', name: 'Butterfly Garden', description: 'A garden planted specifically to attract magical butterflies whose wing dust serves as a reagent multiplier in brewing recipes.', baseCost: 200, costMultiplier: 1.5 },
  { id: 'botanical_library', name: 'Botanical Library', description: 'Contains scrolls and pressed flower specimens documenting centuries of floral magic research. Studying here unlocks new abilities and improves existing ones.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'bouquet_gallery', name: 'Bouquet Gallery', description: 'A magnificent hall where collected bouquets are displayed in crystal vases. Each displayed bouquet provides a passive bonus to all academy students.', baseCost: 1500, costMultiplier: 1.7 },
  { id: 'garden_gateway', name: 'Garden Gateway', description: 'A portal archway made of living rose vines that allows direct travel between unlocked classrooms without traversing the garden paths.', baseCost: 3500, costMultiplier: 1.8 },
  { id: 'eternal_garden_shrine', name: 'Eternal Garden Shrine', description: 'The pinnacle of garden architecture, a shrine that exists in all seasons simultaneously. Grants permanent blessings to every flower in the academy.', baseCost: 9000, costMultiplier: 2.0 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: PA_ABILITIES — 22 Bloom Abilities
// ═══════════════════════════════════════════════════════════════════

export const PA_ABILITIES: readonly PAAbilityDef[] = [
  // Rose (4)
  { id: 'thorn_lance', name: 'Thorn Lance', description: 'Launch a spear of hardened rose thorns that pierces through targets and injects growth-inhibiting sap into the wound.', cooldown: 5, power: 30, school: 'Rose' },
  { id: 'crimson_mirage', name: 'Crimson Mirage', description: 'Create illusory copies of yourself made from swirling red petals that confuse enemies and absorb damage before dissolving.', cooldown: 12, power: 45, school: 'Rose' },
  { id: 'thorn_prison', name: 'Thorn Prison', description: 'Encase a target in a cage of living rose brambles that grow tighter over time, restricting movement and draining energy.', cooldown: 20, power: 80, school: 'Rose' },
  { id: 'rose_bloom_pulse', name: 'Rose Bloom Pulse', description: 'Release a shockwave of rose-scented energy in all directions that heals allies and damages enemies caught in the blast radius.', cooldown: 30, power: 120, school: 'Rose' },

  // Lily (3)
  { id: 'pure_radiance', name: 'Pure Radiance', description: 'Emit a blinding pulse of white light from lily petals that purifies corruption and heals all allies within range simultaneously.', cooldown: 15, power: 55, school: 'Lily' },
  { id: 'lily_rain', name: 'Lily Rain', description: 'Summon a gentle rain of enchanted lily petals that water and heal all plants in the garden while weakening disease-based effects.', cooldown: 25, power: 90, school: 'Lily' },
  { id: 'water_lily_sanctuary', name: 'Water Lily Sanctuary', description: 'Create a zone of pure water lily energy that provides complete healing and damage immunity to all friendly units inside.', cooldown: 45, power: 150, school: 'Lily' },

  // Sunflower (3)
  { id: 'solar_seed_shot', name: 'Solar Seed Shot', description: 'Fire a barrage of solar-charged sunflower seeds that embed in targets and sprout into tiny sunflowers that drain energy.', cooldown: 8, power: 40, school: 'Sunflower' },
  { id: 'golden_barrier', name: 'Golden Barrier', description: 'Summon a barrier of solidified sunlight that absorbs any single attack and reflects the energy back at the attacker with interest.', cooldown: 18, power: 70, school: 'Sunflower' },
  { id: 'growth_volley', name: 'Growth Volley', description: 'Fire beams of accelerated growth energy through a sunflower prism, creating a rainbow of botanical attacks hitting multiple targets.', cooldown: 35, power: 110, school: 'Sunflower' },

  // Orchid (3)
  { id: 'scent_blind', name: 'Scent Blind', description: 'Release an overwhelming cloud of orchid fragrance that confuses enemies, reducing their accuracy to zero while allies attack freely.', cooldown: 10, power: 35, school: 'Orchid' },
  { id: 'pollen_avalanche', name: 'Pollen Avalanche', description: 'Trigger a massive release of enchanted pollen that sweeps across the battlefield, putting enemies to sleep with its soporific fragrance.', cooldown: 28, power: 100, school: 'Orchid' },
  { id: 'perfume_ground', name: 'Perfume Ground', description: 'Transform the ground into a field of fragrant orchids that slows all enemy movement to a crawl and damages those who try to force through.', cooldown: 22, power: 65, school: 'Orchid' },

  // Violet (3)
  { id: 'shadow_petal', name: 'Shadow Petal', description: 'Throw dark violet petals that phase through physical matter, damaging the internal magical core of whatever they pass through.', cooldown: 16, power: 75, school: 'Violet' },
  { id: 'bloom_bind', name: 'Bloom Bind', description: 'Connect targets with chains of violet energy that restrict movement and drain their magical reserves with every second of contact.', cooldown: 24, power: 85, school: 'Violet' },
  { id: 'void_blossom', name: 'Void Blossom', description: 'Channel the energy of the dimensional void into a single catastrophic bloom that devours everything in a massive radius around the caster.', cooldown: 60, power: 200, school: 'Violet' },

  // Tulip (3)
  { id: 'color_strike', name: 'Color Strike', description: 'Throw a spinning disc of compressed tulip color energy that cuts through anything in its path before returning to the caster.', cooldown: 6, power: 50, school: 'Tulip' },
  { id: 'petal_cocoon', name: 'Petal Cocoon', description: 'Surround an ally with layers of woven tulip petals that provide complete protection from all damage types for a short time.', cooldown: 20, power: 95, school: 'Tulip' },
  { id: 'spectrum_ring', name: 'Spectrum Ring', description: 'Expand your tulip colors into an enormous ring placed on the ground, creating a zone of shifting hues that empowers all friendly units inside.', cooldown: 40, power: 130, school: 'Tulip' },

  // Cherry Blossom (3)
  { id: 'sakura_slash', name: 'Sakura Slash', description: 'Inflict a deep petal-cut that deals damage over time and gradually reduces enemy resistance to all floral magic.', cooldown: 7, power: 42, school: 'Cherry Blossom' },
  { id: 'blossom_grasp', name: 'Blossom Grasp', description: 'Extend hands of cherry wood from the ground that grab and crush enemies. The grip tightens as more petals fall from above.', cooldown: 15, power: 70, school: 'Cherry Blossom' },
  { id: 'eternal_sakura', name: 'Eternal Sakura', description: 'Drain all withering energy from the area, converting it into perpetual bloom energy. All allies within range bloom with enhanced power.', cooldown: 50, power: 180, school: 'Cherry Blossom' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: PA_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const PA_ACHIEVEMENTS: readonly PAAchievementDef[] = [
  { id: 'pa_ach_first_enroll', name: 'First Petal', description: 'Enroll your very first flower student at the Rose Pavilion.', condition: 'Enroll 1 student', reward: '+50 petal energy' },
  { id: 'pa_ach_enroll_10', name: 'Garden Class Full', description: 'Enroll a total of 10 flower students across all classrooms.', condition: 'Enroll 10 students', reward: '+200 gold, rare reagent cache' },
  { id: 'pa_ach_enroll_35', name: 'Full Academy', description: 'Enroll all 35 unique flower students from every school.', condition: 'Enroll 35 unique students', reward: '+5000 gold, legendary bouquet fragment' },
  { id: 'pa_ach_rare_enroll', name: 'Rare Blossom', description: 'Successfully enroll a rare-tier flower student.', condition: 'Own rare student', reward: '+300 petal energy' },
  { id: 'pa_ach_epic_enroll', name: 'Epic Bloom', description: 'Successfully enroll an epic-tier flower student.', condition: 'Own epic student', reward: '+800 petal energy, rare bouquet' },
  { id: 'pa_ach_legendary_enroll', name: 'Legendary Root', description: 'Enroll a legendary flower student, a being of mythic botanical power.', condition: 'Own legendary student', reward: '+3000 gold, epic bouquet' },
  { id: 'pa_ach_first_classroom', name: 'Classroom Explorer', description: 'Unlock your first academy classroom beyond the starting pavilion.', condition: 'Unlock 1 classroom', reward: '+100 petal energy' },
  { id: 'pa_ach_all_classrooms', name: 'Master Gardener', description: 'Unlock and explore all 8 academy classrooms.', condition: 'Unlock 8 classrooms', reward: '+5000 gold, Master Gardener title' },
  { id: 'pa_ach_reagent_100', name: 'Resourceful Botanist', description: 'Accumulate 100 total botanical reagents.', condition: 'Collect 100 reagents', reward: '+150 gold' },
  { id: 'pa_ach_reagent_500', name: 'Reagent Hoarder', description: 'Accumulate 500 total botanical reagents.', condition: 'Collect 500 reagents', reward: '+800 gold' },
  { id: 'pa_ach_structure_5', name: 'Garden Builder', description: 'Build 5 different garden structures.', condition: 'Build 5 structures', reward: '+200 petal energy' },
  { id: 'pa_ach_structure_15', name: 'Landscape Architect', description: 'Build 15 different garden structures.', condition: 'Build 15 structures', reward: '+1500 gold, Architect title' },
  { id: 'pa_ach_structure_25', name: 'Garden Metropolis', description: 'Build all 25 garden structures.', condition: 'Build 25 structures', reward: '+5000 gold, rare bouquet' },
  { id: 'pa_ach_first_graduation', name: 'First Graduate', description: 'Graduate your first flower student to a higher form.', condition: 'Graduate 1 student', reward: '+500 petal energy' },
  { id: 'pa_ach_five_graduations', name: 'Graduation Master', description: 'Graduate 5 flower students total.', condition: 'Graduate 5 students', reward: '+2000 gold' },
  { id: 'pa_ach_first_hybrid', name: 'First Hybrid', description: 'Create your very first hybrid flower through cross-pollination.', condition: 'Hybridize 1 flower', reward: '+1000 petal energy' },
  { id: 'pa_ach_ten_hybrids', name: 'Hybrid Specialist', description: 'Create 10 hybrid flowers total through advanced cross-pollination.', condition: 'Hybridize 10 flowers', reward: '+3000 gold, epic reagent cache' },
  { id: 'pa_ach_max_level', name: 'Grand Bloom Master', description: 'Reach the maximum academy level of 50.', condition: 'Reach level 50', reward: '+10000 gold, legendary reagent set' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: PA_TITLES — 8 Horticultural Titles
// ═══════════════════════════════════════════════════════════════════

export const PA_TITLES: readonly PATitleDef[] = [
  { id: 'pa_title_budding_student', name: 'Budding Student', description: 'One who has just planted their first seed in the academy soil, feeling the awakening of botanical magic for the first time.', requiredLevel: 1, requiredClassrooms: 1 },
  { id: 'pa_title_sprout_scholar', name: 'Sprout Scholar', description: 'A dedicated student who has learned to channel basic growth energy and tends to their first flower with care and devotion.', requiredLevel: 5, requiredClassrooms: 2 },
  { id: 'pa_title_petal_apprentice', name: 'Petal Apprentice', description: 'An intermediate practitioner who understands the language of flowers and can coax blooms from the most reluctant buds.', requiredLevel: 12, requiredClassrooms: 3 },
  { id: 'pa_title_stem_guardian', name: 'Stem Guardian', description: 'A protector of the academy gardens who stands watch over young seedlings and ensures no pest or blight harms the students.', requiredLevel: 18, requiredClassrooms: 4 },
  { id: 'pa_title_bloom_weaver', name: 'Bloom Weaver', description: 'A skilled florist who can weave living flowers into enchantments, creating garlands that carry real magical power.', requiredLevel: 25, requiredClassrooms: 5 },
  { id: 'pa_title_garden_sage', name: 'Garden Sage', description: 'A wise botanist whose knowledge of plant magic is sought by students and professors alike. Their garden never wilts.', requiredLevel: 33, requiredClassrooms: 6 },
  { id: 'pa_title_floral_sovereign', name: 'Floral Sovereign', description: 'A ruler of multiple academy gardens who commands legions of flower students and shapes the seasons through botanical mastery.', requiredLevel: 42, requiredClassrooms: 7 },
  { id: 'pa_title_grand_bloom_master', name: 'Grand Bloom Master', description: 'The ultimate title, one who has achieved perfect harmony with all plant life. Every flower blooms at their command, and no garden is beyond their reach.', requiredLevel: 50, requiredClassrooms: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: PA_BOUQUETS — 15 Enchanted Bouquets
// ═══════════════════════════════════════════════════════════════════

export const PA_BOUQUETS: readonly PABouquetDef[] = [
  { id: 'bouquet_spring_welcome', name: 'Spring Welcome Bouquet', description: 'A cheerful arrangement of daisies, tulips, and cherry blossoms that radiates the energy of new beginnings and fresh growth.', rarity: 'common', powerBonus: 5, specialAbility: 'Minor growth boost' },
  { id: 'bouquet_rose_basic', name: 'Basic Rose Bouquet', description: 'A simple yet elegant bouquet of red roses tied with green ribbon. Its fragrance fills a room with warmth and courage.', rarity: 'common', powerBonus: 6, specialAbility: 'Courage aura' },
  { id: 'bouquet_wildflower', name: 'Wildflower Bouquet', description: 'A carefree mix of wildflowers gathered from the academy meadow. Each flower in it is a different species, creating chaotic but beautiful energy.', rarity: 'common', powerBonus: 7, specialAbility: 'Random element boost' },
  { id: 'bouquet_lily_pond', name: 'Lily Pond Bouquet', description: 'An aquatic arrangement featuring water lilies, lotus flowers, and cattails. It must be kept in a bowl of water to maintain its enchantment.', rarity: 'common', powerBonus: 8, specialAbility: 'Water affinity' },
  { id: 'bouquet_sunset_garden', name: 'Sunset Garden Bouquet', description: 'A warm arrangement of sunflowers, marigolds, and red roses that mimics the colors of a perfect sunset. Generates passive solar energy.', rarity: 'uncommon', powerBonus: 12, specialAbility: 'Solar regeneration' },
  { id: 'bouquet_midnight_violet', name: 'Midnight Violet Bouquet', description: 'A mysterious dark arrangement of violets, night-blooming jasmine, and moonflowers that glows faintly in darkness.', rarity: 'uncommon', powerBonus: 14, specialAbility: 'Night vision aura' },
  { id: 'bouquet_orchid_elegance', name: 'Orchid Elegance Bouquet', description: 'A sophisticated arrangement of rare orchids that enchants with a complex fragrance layering technique developed over centuries.', rarity: 'uncommon', powerBonus: 15, specialAbility: 'Enhanced fragrance control' },
  { id: 'bouquet_imperial_rose', name: 'Imperial Rose Bouquet', description: 'A bouquet of only the most perfect roses from the Rose Pavilion, each one hand-selected by the Rose Champion for its flawless form.', rarity: 'uncommon', powerBonus: 13, specialAbility: 'Imperial authority' },
  { id: 'bouquet_rainbow_tulip', name: 'Rainbow Tulip Bouquet', description: 'A spectacular arrangement containing tulips of every color ever cultivated, including several colors that exist nowhere else in nature.', rarity: 'rare', powerBonus: 25, specialAbility: 'Full spectrum mastery' },
  { id: 'bouquet_crystal_lily', name: 'Crystal Lily Bouquet', description: 'An arrangement of lilies that have been crystallized through an ancient process. They are unbreakable and emit a pure white light.', rarity: 'rare', powerBonus: 28, specialAbility: 'Crystal clarity' },
  { id: 'bouquet_phoenix_sunflower', name: 'Phoenix Sunflower Bouquet', description: 'A burning bouquet of sunflowers that erupted from the ashes of the Sunflower Phoenix. They are always warm to the touch and never wilt.', rarity: 'rare', powerBonus: 30, specialAbility: 'Rebirth flame' },
  { id: 'bouquet_dream_orchid', name: 'Dream Orchid Bouquet', description: 'A bouquet that exists partially in the dream world. Its flowers shift shape when no one is looking directly at them.', rarity: 'rare', powerBonus: 27, specialAbility: 'Dream passage' },
  { id: 'bouquet_cosmic_violet', name: 'Cosmic Violet Bouquet', description: 'A bouquet containing violets from seven different dimensions, each one displaying a unique pattern of stars on its petals.', rarity: 'epic', powerBonus: 50, specialAbility: 'Dimensional resonance' },
  { id: 'bouquet_primordial_garden', name: 'Primordial Garden Bouquet', description: 'A bouquet assembled from clippings of the first garden ever created. Each flower is a direct descendant of the original creation blooms.', rarity: 'epic', powerBonus: 55, specialAbility: 'Genesis memory' },
  { id: 'bouquet_eternal_bloom', name: 'Eternal Bloom Bouquet', description: 'The ultimate bouquet, a perfect arrangement of legendary flowers from every school that blooms eternally without any care or maintenance.', rarity: 'legendary', powerBonus: 100, specialAbility: 'Eternal garden aura' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: PA_EVENTS — 12 Seasonal Bloom Events
// ═══════════════════════════════════════════════════════════════════

export const PA_EVENTS: readonly PAEventDef[] = [
  {
    id: 'event_spring_bloom',
    name: 'Spring Bloom Festival',
    description: 'A massive bloom event where every flower in the academy bursts into simultaneous bloom, releasing waves of petal energy that empower all students.',
    severity: 1,
    duration: 90,
    effects: ['All student power +25%', 'Reagent yield doubled', 'Petal energy regeneration +100%'],
  },
  {
    id: 'event_pollen_storm',
    name: 'Golden Pollen Storm',
    description: 'A magical storm of golden pollen sweeps through the academy, coating every surface in shimmering dust that enhances growth and brewing potency.',
    severity: 1,
    duration: 60,
    effects: ['Growth speed +50%', 'Brewing success rate +30%', 'Rare reagent chance tripled'],
  },
  {
    id: 'event_wilt_plague',
    name: 'Wilt Plague',
    description: 'A mysterious wilt disease spreads through the garden, causing flowers to droop and lose their magical properties until the plague is contained.',
    severity: 4,
    duration: 45,
    effects: ['Garden wilt level increases', 'Student abilities weakened by 40%', 'Reagent quality degrades'],
  },
  {
    id: 'event_fairy_swarm',
    name: 'Fairy Pollination Swarm',
    description: 'Thousands of flower fairies descend upon the academy to pollinate every flower simultaneously, causing rapid growth and unexpected hybrid blooms.',
    severity: 1,
    duration: 120,
    effects: ['Hybridization chance +200%', 'All students gain experience', 'New hybrid flowers may appear'],
  },
  {
    id: 'event_monsoon_season',
    name: 'Magical Monsoon',
    description: 'A torrential rain of magic-infused water floods the academy gardens. While dangerous, the magical rainwater is incredibly beneficial for all water-affinity plants.',
    severity: 3,
    duration: 50,
    effects: ['Lily school power +60%', 'Garden structures may take flood damage', 'Water reagent yield quintupled'],
  },
  {
    id: 'event_root_network',
    name: 'Great Root Awakening',
    description: 'The underground root network connecting all academy plants activates, creating a shared consciousness that boosts cooperation between students.',
    severity: 1,
    duration: 80,
    effects: ['All student synergy +50%', 'Structure output +75%', 'Communication between flowers enabled'],
  },
  {
    id: 'petal_eclipse',
    name: 'Petal Eclipse',
    description: 'An astronomic event causes the moon to pass between the sun and the academy, casting petal-shaped shadows that grant mysterious powers.',
    severity: 1,
    duration: 100,
    effects: ['Shadow abilities +40%', 'Violet school power doubled', 'Night-blooming flowers awaken'],
  },
  {
    id: 'event_frost_bite',
    name: 'Late Frost Warning',
    description: 'An unexpected frost threatens the academy gardens. Students must use their protective abilities to shield delicate blooms from freezing.',
    severity: 3,
    duration: 70,
    effects: ['Sunflower power -40%', 'Frost-vulnerable plants damaged', 'Rose thorn defense enhanced'],
  },
  {
    id: 'event_butterfly_migration',
    name: 'Enchanted Butterfly Migration',
    description: 'Millions of magical butterflies pass through the academy on their annual migration, leaving trails of iridescent dust that empowers all flowers.',
    severity: 1,
    duration: 90,
    effects: ['All abilities enhanced by 20%', 'Butterfly garden bonus tripled', 'Rare butterfly reagents appear'],
  },
  {
    id: 'event_earthquake',
    name: 'Garden Quake',
    description: 'A magical tremor shakes the academy foundations, exposing buried ancient seeds and potentially damaging root structures.',
    severity: 3,
    duration: 50,
    effects: ['Ancient seeds uncovered', 'Root structures may be damaged', 'Underground reagent nodes revealed'],
  },
  {
    id: 'event_cherry_blossom_peak',
    name: 'Peak Cherry Blossom Season',
    description: 'The cherry blossom trees reach their absolute peak bloom, filling the entire academy with a blizzard of pink petals and divine sakura energy.',
    severity: 1,
    duration: 120,
    effects: ['Cherry Blossom school power +100%', 'All petal costs halved', 'Divine sakura reagent available'],
  },
  {
    id: 'event_void_blight',
    name: 'Void Blight Incursion',
    description: 'Dark energy from the dimensional void seeps into the garden through cracks in reality, corrupting flowers and draining magical energy.',
    severity: 5,
    duration: 40,
    effects: ['All flower power halved', 'Garden wilt increases rapidly', 'Must purify corruption to restore'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: SCHOOL INTERACTIONS & GRADUATION DATA
// ═══════════════════════════════════════════════════════════════════

interface PASchoolInteraction {
  attacker: PAFlowerSchool
  defender: PAFlowerSchool
  multiplier: number
  description: string
}

const PA_SCHOOL_INTERACTIONS: PASchoolInteraction[] = [
  { attacker: 'Rose', defender: 'Tulip', multiplier: 1.5, description: 'Rose thorns easily pierce Tulip petals for bonus damage.' },
  { attacker: 'Rose', defender: 'Orchid', multiplier: 0.7, description: 'Orchid fragrance neutralizes Rose thorn toxins.' },
  { attacker: 'Lily', defender: 'Violet', multiplier: 1.8, description: 'Lily purity dissolves Violet shadow energy completely.' },
  { attacker: 'Lily', defender: 'Sunflower', multiplier: 1.3, description: 'Lily water enhances Sunflower growth synergistically.' },
  { attacker: 'Sunflower', defender: 'Rose', multiplier: 1.4, description: 'Solar energy overpowers Rose defensive thorns.' },
  { attacker: 'Sunflower', defender: 'Tulip', multiplier: 1.2, description: 'Sunflower radiance intensifies Tulip color magic.' },
  { attacker: 'Orchid', defender: 'Lily', multiplier: 0.6, description: 'Lily water dilutes Orchid concentrated fragrances.' },
  { attacker: 'Orchid', defender: 'Cherry Blossom', multiplier: 1.5, description: 'Orchid scents overwhelm Cherry Blossom delicate petals.' },
  { attacker: 'Violet', defender: 'Cherry Blossom', multiplier: 1.7, description: 'Violet shadow magic consumes Cherry Blossom light.' },
  { attacker: 'Violet', defender: 'Tulip', multiplier: 1.1, description: 'Violet stealth outmaneuvers Tulip colorful displays.' },
  { attacker: 'Tulip', defender: 'Violet', multiplier: 1.4, description: 'Tulip brilliant colors banish Violet shadows.' },
  { attacker: 'Tulip', defender: 'Sunflower', multiplier: 0.8, description: 'Sunflower intense light washes out Tulip pigments.' },
  { attacker: 'Cherry Blossom', defender: 'Rose', multiplier: 1.3, description: 'Cherry Blossom petals carry enchantments past Rose thorns.' },
  { attacker: 'Cherry Blossom', defender: 'Sunflower', multiplier: 1.6, description: 'Cherry Blossom grace harmonizes with Sunflower warmth.' },
]

interface PAGraduationTier {
  tier: number
  name: string
  requiredGraduations: number
  powerMultiplier: number
  hpMultiplier: number
  visualEffect: string
}

const PA_GRADUATION_TIERS: PAGraduationTier[] = [
  { tier: 0, name: 'Seedling', requiredGraduations: 0, powerMultiplier: 1.0, hpMultiplier: 1.0, visualEffect: 'Normal flower appearance with basic petals and leaves.' },
  { tier: 1, name: 'Budding Scholar', requiredGraduations: 1, powerMultiplier: 1.3, hpMultiplier: 1.2, visualEffect: 'Petals gain golden edges. A small academic cap appears on the flower head.' },
  { tier: 2, name: 'Full Bloom Adept', requiredGraduations: 2, powerMultiplier: 1.7, hpMultiplier: 1.5, visualEffect: 'Flower doubles in size with enhanced color saturation. Magical aura appears.' },
  { tier: 3, name: 'Master Gardener', requiredGraduations: 3, powerMultiplier: 2.2, hpMultiplier: 1.8, visualEffect: 'Multiple blooms appear on a single stem. Petals glow with internal light.' },
  { tier: 4, name: 'Floral Archon', requiredGraduations: 4, powerMultiplier: 2.8, hpMultiplier: 2.2, visualEffect: 'Wings of petals form around the flower. Radiance extends in all directions.' },
  { tier: 5, name: 'Grand Bloom Sovereign', requiredGraduations: 5, powerMultiplier: 3.5, hpMultiplier: 3.0, visualEffect: 'Perfect divine bloom form. Commands all plant life. Exists as pure botanical energy.' },
]

interface PAClassroomReagentMap {
  classroomId: string
  reagentIds: string[]
  bonusReagentIds: string[]
}

const PA_CLASSROOM_REAGENT_MAP: PAClassroomReagentMap[] = [
  { classroomId: 'rose_pavilion', reagentIds: ['rose_petal', 'rose_thorn_essence', 'tulip_bulb', 'violet_leaf'], bonusReagentIds: ['rose_crown_bloom'] },
  { classroomId: 'lily_pond', reagentIds: ['lily_nectar', 'lily_root', 'orchid_pollen', 'violet_shadow_dew'], bonusReagentIds: ['lily_moonlight_dew'] },
  { classroomId: 'sunflower_meadow', reagentIds: ['sunflower_seed', 'sunflower_stem_sap', 'tulip_pigment', 'rose_petal'], bonusReagentIds: ['sunflower_core'] },
  { classroomId: 'orchid_greenhouse', reagentIds: ['orchid_pollen', 'orchid_spore', 'lily_root', 'rose_thorn_essence'], bonusReagentIds: ['orchid_venom'] },
  { classroomId: 'violet_hollow', reagentIds: ['violet_leaf', 'violet_shadow_dew', 'violet_crystal', 'orchid_spore'], bonusReagentIds: ['violet_void_essence'] },
  { classroomId: 'tulip_garden', reagentIds: ['tulip_bulb', 'tulip_pigment', 'tulip_diamond_petal', 'sunflower_seed'], bonusReagentIds: ['tulip_diamond_petal'] },
  { classroomId: 'cherry_atrium', reagentIds: ['rose_blood_petal', 'lily_world_water', 'orchid_dream_fragments', 'cherry_divine_petal'], bonusReagentIds: ['sunflower_ember'] },
  { classroomId: 'grand_greenhouse', reagentIds: ['primordial_seed', 'world_root_heart', 'eternal_bloom_nectar', 'rainbow_petal_matrix', 'garden_of_eden_sap', 'bloom_sovereign_crown'], bonusReagentIds: [] },
]

function paGetSchoolInteraction(attacker: PAFlowerSchool, defender: PAFlowerSchool): PASchoolInteraction | null {
  return PA_SCHOOL_INTERACTIONS.find(
    (i) => i.attacker === attacker && i.defender === defender
  ) ?? null
}

function paGetGraduationTier(graduationCount: number): PAGraduationTier {
  for (let i = PA_GRADUATION_TIERS.length - 1; i >= 0; i--) {
    if (graduationCount >= PA_GRADUATION_TIERS[i].requiredGraduations) {
      return PA_GRADUATION_TIERS[i]
    }
  }
  return PA_GRADUATION_TIERS[0]
}

function paGetClassroomReagents(classroomId: string): PAClassroomReagentMap | null {
  return PA_CLASSROOM_REAGENT_MAP.find((m) => m.classroomId === classroomId) ?? null
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const usePAStore = create<PAFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      enrolledStudents: [] as PAEnrolledStudent[],
      collectedReagents: {} as Record<string, number>,
      structures: [] as PAOwnedStructure[],
      achievements: [] as string[],
      currentTitle: 'pa_title_budding_student',
      collectedBouquets: [] as string[],
      unlockedClassrooms: ['rose_pavilion'] as string[],
      academyLevel: 1,
      academyExp: 0,
      gold: PA_INITIAL_GOLD,
      petalEnergy: PA_INITIAL_ENERGY,
      totalEnrolled: 0,
      totalBrewed: 0,
      totalUpgraded: 0,
      totalGraduated: 0,
      totalHybridized: 0,
      activeEventId: null as string | null,
      eventTimer: 0,
      garden: {
        health: 100,
        maxHealth: 100,
        wiltLevel: 0,
        lastTendedAt: null,
      } as PAGardenState,
      activeClassroomId: 'rose_pavilion' as string | null,

      // ── paEnrollStudent ────────────────────────────────────────
      paEnrollStudent: (studentId: string): boolean => {
        const state = get()
        const studentDef = PA_STUDENTS.find((s) => s.id === studentId)
        if (!studentDef) return false

        const activeClassroom = PA_CLASSROOMS.find((c) => c.id === state.activeClassroomId)
        if (activeClassroom && state.academyLevel < activeClassroom.minLevel) return false

        const enrollCost = Math.floor(10 * paRarityMultiplier(studentDef.rarity))
        if (state.petalEnergy < enrollCost) return false
        if (state.enrolledStudents.some((s) => s.studentDefId === studentId)) return false

        const newXp = state.academyExp + studentDef.basePower
        const newLevel = paLevelFromXp(newXp)

        set((prev) => ({
          enrolledStudents: [
            ...prev.enrolledStudents,
            {
              id: paGenerateId(),
              studentDefId: studentId,
              name: studentDef.name,
              level: 1,
              currentHP: studentDef.basePower * 10,
              maxHP: studentDef.basePower * 10,
              power: studentDef.basePower,
              graduated: false,
              graduationCount: 0,
              acquiredAt: Date.now(),
            },
          ],
          petalEnergy: Math.max(0, prev.petalEnergy - enrollCost),
          academyExp: newXp,
          academyLevel: newLevel,
          gold: prev.gold + Math.floor(studentDef.basePower * 0.5),
          totalEnrolled: prev.totalEnrolled + 1,
        }))
        return true
      },

      // ── paBrewPotion ───────────────────────────────────────────
      paBrewPotion: (reagentId: string): number => {
        const state = get()
        const reagent = PA_REAGENTS.find((r) => r.id === reagentId)
        if (!reagent) return 0
        if (state.petalEnergy < 3) return 0

        const quantity = reagent.rarity === 'common' ? 3 : reagent.rarity === 'uncommon' ? 2 : 1
        set((prev) => ({
          collectedReagents: {
            ...prev.collectedReagents,
            [reagentId]: (prev.collectedReagents[reagentId] || 0) + quantity,
          },
          petalEnergy: Math.max(0, prev.petalEnergy - 3),
          totalBrewed: prev.totalBrewed + quantity,
          gold: prev.gold + reagent.value * quantity,
        }))
        return quantity
      },

      // ── paUpgradeGarden ────────────────────────────────────────
      paUpgradeGarden: (structureId: string): boolean => {
        const state = get()
        const structDef = PA_STRUCTURES.find((s) => s.id === structureId)
        if (!structDef) return false

        const owned = state.structures.find((s) => s.structureDefId === structureId)
        if (!owned) {
          if (state.gold < structDef.baseCost) return false
          const newXp = state.academyExp + 20
          const newLevel = paLevelFromXp(newXp)
          set((prev) => ({
            structures: [
              ...prev.structures,
              {
                id: paGenerateId(),
                structureDefId: structureId,
                level: 1,
                built: true,
              },
            ],
            gold: prev.gold - structDef.baseCost,
            academyExp: newXp,
            academyLevel: newLevel,
            totalUpgraded: prev.totalUpgraded + 1,
          }))
          return true
        }

        if (owned.level >= 10) return false
        const upgradeCost = Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, owned.level))
        if (state.gold < upgradeCost) return false

        const newXp = state.academyExp + 25
        const newLevel = paLevelFromXp(newXp)
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === owned.id ? { ...s, level: s.level + 1 } : s
          ),
          gold: prev.gold - upgradeCost,
          academyExp: newXp,
          academyLevel: newLevel,
          totalUpgraded: prev.totalUpgraded + 1,
        }))
        return true
      },

      // ── paUseAbility ───────────────────────────────────────────
      paUseAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = PA_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (state.petalEnergy < ability.cooldown) return false

        set((prev) => ({
          petalEnergy: Math.max(0, prev.petalEnergy - ability.cooldown),
        }))
        return true
      },

      // ── paHandleBloomEvent ─────────────────────────────────────
      paHandleBloomEvent: (eventId: string): boolean => {
        const state = get()
        const event = PA_EVENTS.find((e) => e.id === eventId)
        if (!event) return false
        if (state.activeEventId !== null) return false

        set((prev) => ({
          activeEventId: eventId,
          eventTimer: event.duration,
          garden: {
            ...prev.garden,
            wiltLevel: event.severity >= 4
              ? Math.min(100, prev.garden.wiltLevel + event.severity * 5)
              : prev.garden.wiltLevel,
            health: event.severity >= 3
              ? Math.max(0, prev.garden.health - event.severity * 3)
              : prev.garden.health,
          },
        }))
        return true
      },

      // ── paArrangeBouquet ───────────────────────────────────────
      paArrangeBouquet: (bouquetId: string): boolean => {
        const state = get()
        const bouquet = PA_BOUQUETS.find((b) => b.id === bouquetId)
        if (!bouquet) return false
        if (state.collectedBouquets.includes(bouquetId)) return false

        const bouquetCost = Math.floor(20 * paRarityMultiplier(bouquet.rarity))
        if (state.gold < bouquetCost) return false

        const newXp = state.academyExp + bouquet.powerBonus
        const newLevel = paLevelFromXp(newXp)
        set((prev) => ({
          collectedBouquets: [...prev.collectedBouquets, bouquetId],
          gold: prev.gold - bouquetCost,
          academyExp: newXp,
          academyLevel: newLevel,
        }))
        return true
      },

      // ── paPlantGarden ──────────────────────────────────────────
      paPlantGarden: (gardenPlotId: string): boolean => {
        const state = get()
        if (state.petalEnergy < 5) return false
        if (state.garden.wiltLevel > 50) return false

        set((prev) => ({
          garden: {
            ...prev.garden,
            health: Math.min(prev.garden.maxHealth, prev.garden.health + 5),
            lastTendedAt: Date.now(),
          },
          petalEnergy: Math.max(0, prev.petalEnergy - 5),
        }))
        return true
      },

      // ── paHybridizeFlower ──────────────────────────────────────
      paHybridizeFlower: (studentInstanceId: string): boolean => {
        const state = get()
        const student = state.enrolledStudents.find((s) => s.id === studentInstanceId)
        if (!student) return false
        if (student.graduationCount >= 5) return false

        const hybridCost = Math.floor(50 * Math.pow(2, student.graduationCount))
        if (state.petalEnergy < hybridCost) return false
        if (state.gold < hybridCost * 2) return false

        const newXp = state.academyExp + 30
        const newLevel = paLevelFromXp(newXp)
        set((prev) => ({
          enrolledStudents: prev.enrolledStudents.map((s) =>
            s.id === studentInstanceId
              ? {
                  ...s,
                  level: s.level + 1,
                  power: Math.floor(s.power * 1.3),
                  maxHP: Math.floor(s.maxHP * 1.2),
                  currentHP: Math.floor(s.maxHP * 1.2),
                  graduated: true,
                  graduationCount: s.graduationCount + 1,
                }
              : s
          ),
          petalEnergy: Math.max(0, prev.petalEnergy - hybridCost),
          gold: prev.gold - hybridCost * 2,
          academyExp: newXp,
          academyLevel: newLevel,
          totalHybridized: prev.totalHybridized + 1,
        }))
        return true
      },

      // ── paCastSpell ────────────────────────────────────────────
      paCastSpell: (targetId: string): boolean => {
        const state = get()
        if (state.petalEnergy < 100) return false

        let xpGain = 50
        let goldGain = 500
        let reagentBonus = 0

        const student = state.enrolledStudents.find((s) => s.id === targetId)
        if (student) {
          xpGain = 100
          goldGain = 1000
          set((prev) => ({
            enrolledStudents: prev.enrolledStudents.map((s) =>
              s.id === targetId
                ? {
                    ...s,
                    power: Math.floor(s.power * 1.5),
                    maxHP: Math.floor(s.maxHP * 1.3),
                    currentHP: Math.floor(s.maxHP * 1.3),
                  }
                : s
            ),
          }))
        }

        const reagent = PA_REAGENTS.find((r) => r.id === targetId)
        if (reagent) {
          reagentBonus = 5
        }

        const newXp = state.academyExp + xpGain
        const newLevel = paLevelFromXp(newXp)
        set((prev) => {
          const updatedReagents = { ...prev.collectedReagents }
          if (reagentBonus > 0 && reagent) {
            updatedReagents[targetId] = (updatedReagents[targetId] || 0) + reagentBonus
          }
          return {
            petalEnergy: Math.max(0, prev.petalEnergy - 100),
            gold: prev.gold + goldGain,
            academyExp: newXp,
            academyLevel: newLevel,
            collectedReagents: updatedReagents,
            totalGraduated: prev.totalGraduated + 1,
            garden: {
              ...prev.garden,
              wiltLevel: Math.max(0, prev.garden.wiltLevel - 20),
              health: Math.min(prev.garden.maxHealth, prev.garden.health + 30),
            },
          }
        })
        return true
      },

      // ── paGraduateStudent ──────────────────────────────────────
      paGraduateStudent: (instanceId: string): boolean => {
        const state = get()
        const student = state.enrolledStudents.find((s) => s.id === instanceId)
        if (!student) return false
        if (student.graduationCount >= 5) return false

        const gradCost = Math.floor(50 * Math.pow(2, student.graduationCount))
        if (state.petalEnergy < gradCost) return false
        if (state.gold < gradCost * 2) return false

        const newXp = state.academyExp + 30
        const newLevel = paLevelFromXp(newXp)
        set((prev) => ({
          enrolledStudents: prev.enrolledStudents.map((s) =>
            s.id === instanceId
              ? {
                  ...s,
                  level: s.level + 1,
                  power: Math.floor(s.power * 1.3),
                  maxHP: Math.floor(s.maxHP * 1.2),
                  currentHP: Math.floor(s.maxHP * 1.2),
                  graduated: true,
                  graduationCount: s.graduationCount + 1,
                }
              : s
          ),
          petalEnergy: Math.max(0, prev.petalEnergy - gradCost),
          gold: prev.gold - gradCost * 2,
          academyExp: newXp,
          academyLevel: newLevel,
          totalGraduated: prev.totalGraduated + 1,
        }))
        return true
      },
    }),
    {
      name: 'petal-academy-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: HOOK — usePetalAcademy
// ═══════════════════════════════════════════════════════════════════

export default function usePetalAcademy() {
  const store = usePAStore()

  // ── Getter: Classroom Details ─────────────────────────────────
  const paGetClassroomDetails = useMemo(() => {
    return PA_CLASSROOMS.map((classroom) => ({
      ...classroom,
      unlocked: store.unlockedClassrooms.includes(classroom.id),
      active: store.activeClassroomId === classroom.id,
      levelMet: store.academyLevel >= classroom.minLevel,
      canAfford: store.gold >= classroom.unlockCost,
    }))
  }, [store])

  // ── Getter: Reagent Inventory ────────────────────────────────
  const paGetReagentInventory = useMemo(() => {
    return PA_REAGENTS.map((reagent) => ({
      ...reagent,
      owned: store.collectedReagents[reagent.id] || 0,
      rarityColor: paRarityColor(reagent.rarity),
    }))
  }, [store])

  // ── Getter: Enrolled Students ────────────────────────────────
  const paGetEnrolledStudents = useMemo(() => {
    return store.enrolledStudents.map((s) => {
      const def = PA_STUDENTS.find((d) => d.id === s.studentDefId)
      return {
        ...s,
        def,
        schoolColor: def ? paSchoolColor(def.school) : PA_COLOR_LEAF_GREEN,
        rarityColor: def ? paRarityColor(def.rarity) : '#9CA3AF',
        totalPower: Math.floor(s.power * (1 + s.level * 0.15) * (1 + s.graduationCount * 0.3)),
      }
    })
  }, [store])

  // ── Getter: Structure List ────────────────────────────────────
  const paGetStructureList = useMemo(() => {
    return PA_STRUCTURES.map((def) => {
      const owned = store.structures.find((s) => s.structureDefId === def.id)
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

  // ── Getter: Total Power ───────────────────────────────────────
  const paGetTotalPower = useMemo(() => {
    let studentPower = 0
    for (const s of store.enrolledStudents) {
      const def = PA_STUDENTS.find((d) => d.id === s.studentDefId)
      if (!def) continue
      const rarityMult = paRarityMultiplier(def.rarity)
      studentPower += Math.floor(
        s.power * rarityMult * (1 + s.level * 0.15) * (1 + s.graduationCount * 0.3)
      )
    }
    const structurePower = store.structures.reduce(
      (sum, s) => sum + s.level * 12,
      0
    )
    const bouquetPower = store.collectedBouquets.reduce((sum, bId) => {
      const bouquet = PA_BOUQUETS.find((b) => b.id === bId)
      return sum + (bouquet ? bouquet.powerBonus : 0)
    }, 0)
    return { studentPower, structurePower, bouquetPower, total: studentPower + structurePower + bouquetPower }
  }, [store])

  // ── Getter: Event Status ──────────────────────────────────────
  const paGetEventStatus = useMemo(() => {
    if (!store.activeEventId) {
      return { active: false, event: null, timer: 0, severity: 0 }
    }
    const event = PA_EVENTS.find((e) => e.id === store.activeEventId)
    return {
      active: true,
      event: event || null,
      timer: store.eventTimer,
      severity: event ? event.severity : 0,
    }
  }, [store.activeEventId, store.eventTimer])

  // ── Getter: Active Event ──────────────────────────────────────
  const paGetActiveEvent = useMemo(() => {
    if (!store.activeEventId) return null
    return PA_EVENTS.find((e) => e.id === store.activeEventId) || null
  }, [store.activeEventId])

  // ── Getter: Next Title ────────────────────────────────────────
  const paGetNextTitle = useMemo(() => {
    const currentTitle = PA_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitle ? PA_TITLES.indexOf(currentTitle) : -1
    if (currentIndex >= PA_TITLES.length - 1) return null
    return PA_TITLES[currentIndex + 1]
  }, [store.currentTitle])

  // ── Getter: Rarity Summary ────────────────────────────────────
  const paGetRaritySummary = useMemo(() => {
    const summary: Record<PARarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const s of store.enrolledStudents) {
      const def = PA_STUDENTS.find((d) => d.id === s.studentDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const bId of store.collectedBouquets) {
      const bouquet = PA_BOUQUETS.find((b) => b.id === bId)
      if (bouquet) {
        summary[bouquet.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Classroom Summary ─────────────────────────────────
  const paGetClassroomSummary = useMemo(() => {
    const totalClassrooms = PA_CLASSROOMS.length
    const unlocked = store.unlockedClassrooms.length
    return {
      totalClassrooms,
      unlocked,
      percent: Math.floor((unlocked / totalClassrooms) * 100),
      allUnlocked: unlocked >= totalClassrooms,
    }
  }, [store.unlockedClassrooms])

  // ── Getter: Unlocked Achievements ─────────────────────────────
  const paGetUnlockedAchievements = useMemo(() => {
    const unlocked: PAAchievementDef[] = []
    for (const ach of PA_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      }
    }
    return { unlocked, total: PA_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ────────────────────────────────────
  const paGetTitleProgress = useMemo(() => {
    return PA_TITLES.map((title) => ({
      ...title,
      unlocked:
        store.academyLevel >= title.requiredLevel &&
        store.unlockedClassrooms.length >= title.requiredClassrooms,
      active: store.currentTitle === title.id,
      levelMet: store.academyLevel >= title.requiredLevel,
      classroomMet: store.unlockedClassrooms.length >= title.requiredClassrooms,
    }))
  }, [store.currentTitle, store.academyLevel, store.unlockedClassrooms])

  // ── Getter: Collected Bouquets Detail ─────────────────────────
  const paGetCollectedBouquets = useMemo(() => {
    return PA_BOUQUETS.map((bouquet) => ({
      ...bouquet,
      collected: store.collectedBouquets.includes(bouquet.id),
      rarityColor: paRarityColor(bouquet.rarity),
      canAfford:
        store.gold >= Math.floor(20 * paRarityMultiplier(bouquet.rarity)) &&
        !store.collectedBouquets.includes(bouquet.id),
    }))
  }, [store])

  // ── Getter: Garden Health ─────────────────────────────────────
  const paGetGardenHealth = useMemo(() => {
    const { health, maxHealth, wiltLevel, lastTendedAt } = store.garden
    return {
      health,
      maxHealth,
      wiltLevel,
      healthPercent: Math.floor((health / maxHealth) * 100),
      isWilted: wiltLevel > 0,
      isCritical: health < maxHealth * 0.25,
      lastTendedAt,
    }
  }, [store.garden])

  // ── Getter: Enrollment Costs ──────────────────────────────────
  const paGetEnrollmentCosts = useMemo(() => {
    return PA_STUDENTS.filter(
      (s) => !store.enrolledStudents.some((e) => e.studentDefId === s.id)
    ).map((student) => ({
      ...student,
      enrollCost: Math.floor(10 * paRarityMultiplier(student.rarity)),
      canAfford:
        store.petalEnergy >= Math.floor(10 * paRarityMultiplier(student.rarity)),
      schoolColor: paSchoolColor(student.school),
      rarityColor: paRarityColor(student.rarity),
    }))
  }, [store])

  // ── Level Progress ────────────────────────────────────────────
  const paLevelProgress = useMemo(() => {
    const current = paXpForLevel(store.academyLevel)
    return {
      level: store.academyLevel,
      currentXp: store.academyExp,
      xpToNext: current,
      maxLevel: store.academyLevel >= PA_MAX_LEVEL,
      progressPercent:
        current > 0 ? Math.min(100, Math.floor((store.academyExp / current) * 100)) : 0,
    }
  }, [store.academyLevel, store.academyExp])

  // ── Getter: Ability List ──────────────────────────────────────
  const paGetAbilityList = useMemo(() => {
    return PA_ABILITIES.map((ability) => ({
      ...ability,
      canUse: store.petalEnergy >= ability.cooldown,
      schoolColor: paSchoolColor(ability.school),
    }))
  }, [store.petalEnergy])

  // ── Getter: Event List ────────────────────────────────────────
  const paGetEventList = useMemo(() => {
    return PA_EVENTS.map((event) => ({
      ...event,
      canTrigger: store.activeEventId === null,
      isActive: store.activeEventId === event.id,
    }))
  }, [store.activeEventId])

  // ── Getter: Stats Summary & School Count (merged) ────────────
  const { paGetStatsSummary, paGetStudentCountBySchool } = useMemo(() => {
    const studentCountBySchool: Record<PAFlowerSchool, number> = {
      Rose: 0,
      Lily: 0,
      Sunflower: 0,
      Orchid: 0,
      Violet: 0,
      Tulip: 0,
      'Cherry Blossom': 0,
    }
    for (const s of store.enrolledStudents) {
      const def = PA_STUDENTS.find((d) => d.id === s.studentDefId)
      if (def) {
        studentCountBySchool[def.school] += 1
      }
    }

    const statsSummary = {
      totalStudents: store.enrolledStudents.length,
      totalReagents: Object.values(store.collectedReagents).reduce((sum, val) => sum + val, 0),
      totalStructures: store.structures.length,
      totalBouquets: store.collectedBouquets.length,
      totalClassrooms: store.unlockedClassrooms.length,
      avgStudentLevel:
        store.enrolledStudents.length > 0
          ? Math.floor(
              store.enrolledStudents.reduce((sum, s) => sum + s.level, 0) / store.enrolledStudents.length
            )
          : 0,
      totalGraduations: store.enrolledStudents.reduce((sum, s) => sum + s.graduationCount, 0),
    }

    return { paGetStatsSummary: statsSummary, paGetStudentCountBySchool: studentCountBySchool }
  }, [store])

  // ── Getter: Upgrade Costs ─────────────────────────────────────
  const paGetUpgradeCosts = useMemo(() => {
    return store.structures.map((s) => {
      const def = PA_STRUCTURES.find((d) => d.id === s.structureDefId)
      if (!def) return { ...s, nextCost: 0, maxed: s.level >= 10 }
      const nextCost = s.level >= 10 ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level))
      return { ...s, def, nextCost, maxed: s.level >= 10 }
    })
  }, [store.structures])

  // ── Getter: Bouquet Bonus ─────────────────────────────────────
  const paGetBouquetBonus = useMemo(() => {
    let totalPowerBonus = 0
    for (const bId of store.collectedBouquets) {
      const bouquet = PA_BOUQUETS.find((b) => b.id === bId)
      if (bouquet) {
        totalPowerBonus += bouquet.powerBonus
      }
    }
    return {
      totalPowerBonus,
      bouquetCount: store.collectedBouquets.length,
      hasLegendaryBouquet: store.collectedBouquets.some((bId) => {
        const bouquet = PA_BOUQUETS.find((b) => b.id === bId)
        return bouquet && bouquet.rarity === 'legendary'
      }),
    }
  }, [store.collectedBouquets])

  // ── Getter: Graduation Tier Details ───────────────────────────
  const paGetGraduationTierDetails = useMemo(() => {
    return store.enrolledStudents.map((s) => {
      const def = PA_STUDENTS.find((d) => d.id === s.studentDefId)
      const graduationTier = paGetGraduationTier(s.graduationCount)
      return {
        ...s,
        def,
        graduationTier,
        nextTier: s.graduationCount < 5 ? paGetGraduationTier(s.graduationCount + 1) : null,
        canGraduate: s.graduationCount < 5,
        graduationCost: Math.floor(50 * Math.pow(2, s.graduationCount)),
        graduationGoldCost: Math.floor(50 * Math.pow(2, s.graduationCount)) * 2,
      }
    })
  }, [store])

  // ── Getter: Classroom Reagents Available ──────────────────────
  const paGetClassroomReagents = useMemo(() => {
    if (!store.activeClassroomId) return { reagents: [], bonusReagents: [] }
    return { reagents: [], bonusReagents: [] }
  }, [store.activeClassroomId])

  // ── Getter: Petal Energy Efficiency ───────────────────────────
  const paGetPetalEfficiency = useMemo(() => {
    const structureBonus = store.structures.reduce((sum, s) => {
      return sum + paGetStructureBonus(s.structureDefId, s.level)
    }, 0)
    const bouquetBonus = store.collectedBouquets.reduce((sum, bId) => {
      const bouquet = PA_BOUQUETS.find((b) => b.id === bId)
      return sum + (bouquet ? Math.floor(bouquet.powerBonus * 0.2) : 0)
    }, 0)
    return {
      baseRegen: 1,
      structureBonus,
      bouquetBonus,
      totalRegen: 1 + structureBonus + bouquetBonus,
    }
  }, [store])

  // ── Getter: School Interaction Matrix ─────────────────────────
  const paGetSchoolInteractions = useMemo(() => {
    return PA_SCHOOL_INTERACTIONS.map((interaction) => ({
      ...interaction,
      attackerColor: paSchoolColor(interaction.attacker),
      defenderColor: paSchoolColor(interaction.defender),
    }))
  }, [])

  // ── Getter: Enrollment Chance by Rarity ───────────────────────
  const paGetEnrollmentChances = useMemo(() => {
    const chances: Record<PARarity, { base: number; modified: number }> = {
      common: { base: PA_ENROLL_CHANCES.common, modified: paGetEnrollChance('common', store.activeClassroomId) },
      uncommon: { base: PA_ENROLL_CHANCES.uncommon, modified: paGetEnrollChance('uncommon', store.activeClassroomId) },
      rare: { base: PA_ENROLL_CHANCES.rare, modified: paGetEnrollChance('rare', store.activeClassroomId) },
      epic: { base: PA_ENROLL_CHANCES.epic, modified: paGetEnrollChance('epic', store.activeClassroomId) },
      legendary: { base: PA_ENROLL_CHANCES.legendary, modified: paGetEnrollChance('legendary', store.activeClassroomId) },
    }
    return chances
  }, [store.activeClassroomId])

  // ── Getter: Hybridization Status ──────────────────────────────
  const paGetHybridizationStatus = useMemo(() => {
    const hybridizable = store.enrolledStudents.filter((s) => s.graduationCount < 5)
    return {
      totalStudents: store.enrolledStudents.length,
      hybridizableCount: hybridizable.length,
      fullyMaxed: store.enrolledStudents.length - hybridizable.length,
      totalHybridized: store.totalHybridized,
    }
  }, [store])

  // ── Getter: Reagent Rarity Breakdown ──────────────────────────
  const paGetReagentBreakdown = useMemo(() => {
    const breakdown: Record<PARarity, { types: number; total: number }> = {
      common: { types: 0, total: 0 },
      uncommon: { types: 0, total: 0 },
      rare: { types: 0, total: 0 },
      epic: { types: 0, total: 0 },
      legendary: { types: 0, total: 0 },
    }
    for (const reagent of PA_REAGENTS) {
      if (store.collectedReagents[reagent.id] > 0) {
        breakdown[reagent.rarity].types += 1
        breakdown[reagent.rarity].total += store.collectedReagents[reagent.id]
      }
    }
    return breakdown
  }, [store.collectedReagents])

  // ── Getter: Graduation Tier List ──────────────────────────────
  const paGetGraduationTiers = useMemo(() => {
    return PA_GRADUATION_TIERS.map((tier) => ({
      ...tier,
      studentCount: store.enrolledStudents.filter(
        (s) => s.graduationCount >= tier.requiredGraduations
      ).length,
    }))
  }, [store])

  // ── Getter: Garden Structure Bonus ────────────────────────────
  const paGetGardenStructureBonus = useMemo(() => {
    let totalBonus = 0
    const breakdown: Record<string, number> = {}
    for (const s of store.structures) {
      const bonus = paGetStructureBonus(s.structureDefId, s.level)
      totalBonus += bonus
      breakdown[s.structureDefId] = bonus
    }
    return { totalBonus, breakdown }
  }, [store.structures])

  // ── Getter: Active Classroom School Bonuses ───────────────────
  const paGetActiveClassroomBonuses = useMemo(() => {
    if (!store.activeClassroomId) return { schools: [], bonuses: [] }
    const bonusSchools = PA_CLASSROOM_SCHOOL_BONUS[store.activeClassroomId] || []
    const bonuses = bonusSchools.map((school) => ({
      school,
      bonus: paGetSchoolBonus(school),
      color: paSchoolColor(school),
    }))
    return { schools: bonusSchools, bonuses }
  }, [store.activeClassroomId])

  // ── Assemble paAPI ────────────────────────────────────────────
  const paAPI = {
    // Constants
    PA_STUDENTS,
    PA_CLASSROOMS,
    PA_REAGENTS,
    PA_STRUCTURES,
    PA_ABILITIES,
    PA_ACHIEVEMENTS,
    PA_TITLES,
    PA_BOUQUETS,
    PA_EVENTS,
    PA_COLOR_ROSE_RED,
    PA_COLOR_LILY_WHITE,
    PA_COLOR_SUNFLOWER_GOLD,
    PA_COLOR_ORCHID_PURPLE,
    PA_COLOR_VIOLET_BLUE,
    PA_COLOR_TULIP_PINK,
    PA_COLOR_CHERRY_PINK,
    PA_COLOR_LEAF_GREEN,

    // State
    enrolledStudents: store.enrolledStudents,
    collectedReagents: store.collectedReagents,
    structures: store.structures,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    collectedBouquets: store.collectedBouquets,
    unlockedClassrooms: store.unlockedClassrooms,
    academyLevel: store.academyLevel,
    academyExp: store.academyExp,
    gold: store.gold,
    petalEnergy: store.petalEnergy,
    totalEnrolled: store.totalEnrolled,
    totalBrewed: store.totalBrewed,
    totalUpgraded: store.totalUpgraded,
    totalGraduated: store.totalGraduated,
    totalHybridized: store.totalHybridized,
    activeEventId: store.activeEventId,
    eventTimer: store.eventTimer,
    garden: store.garden,
    activeClassroomId: store.activeClassroomId,

    // Actions
    paEnrollStudent: store.paEnrollStudent,
    paBrewPotion: store.paBrewPotion,
    paUpgradeGarden: store.paUpgradeGarden,
    paUseAbility: store.paUseAbility,
    paHandleBloomEvent: store.paHandleBloomEvent,
    paArrangeBouquet: store.paArrangeBouquet,
    paPlantGarden: store.paPlantGarden,
    paHybridizeFlower: store.paHybridizeFlower,
    paCastSpell: store.paCastSpell,
    paGraduateStudent: store.paGraduateStudent,

    // Getters
    paGetClassroomDetails,
    paGetReagentInventory,
    paGetEnrolledStudents,
    paGetStructureList,
    paGetTotalPower,
    paGetEventStatus,
    paGetActiveEvent,
    paGetNextTitle,
    paGetRaritySummary,
    paGetClassroomSummary,
    paGetUnlockedAchievements,
    paGetTitleProgress,
    paGetCollectedBouquets,
    paGetGardenHealth,
    paGetEnrollmentCosts,
    paLevelProgress,
    paGetAbilityList,
    paGetEventList,
    paGetStatsSummary,
    paGetStudentCountBySchool,
    paGetUpgradeCosts,
    paGetBouquetBonus,
    paGetGraduationTierDetails,
    paGetClassroomReagents,
    paGetPetalEfficiency,
    paGetSchoolInteractions,
    paGetEnrollmentChances,
    paGetHybridizationStatus,
    paGetReagentBreakdown,
    paGetGraduationTiers,
    paGetGardenStructureBonus,
    paGetActiveClassroomBonuses,
  }

  return paAPI
}
