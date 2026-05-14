/**
 * Ghost Carnival Wire — 鬼魂嘉年华 feature module for Word Snake
 *
 * A haunted amusement park management and exploration mini-game: summon 35
 * ghosts across 5 rarity tiers (Phantom/Jester/Mime/Fortune Teller/Ride
 * Operator/Food Vendor/Masked Dancer), ride 8 haunted attractions, collect
 * 30 carnival materials, build 25 booth structures, wield 22 spectral
 * abilities, earn 8 titles from Lost Visitor to Carnival Phantom King/Queen,
 * gather 15 cursed prizes, and survive 12 midnight events — backed by a
 * Zustand store with persist middleware.
 *
 * Storage key: ghost-carnival-wire
 * Prefix: gc / GC_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type GCRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type GCGhostType = 'Phantom' | 'Jester' | 'Mime' | 'Fortune Teller' | 'Ride Operator' | 'Food Vendor' | 'Masked Dancer'
export type GCAbilitySchool = 'Haunt' | 'Illusion' | 'Fright'

export interface GCGhostDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly ghostType: GCGhostType
  readonly rarity: GCRarity
  readonly basePower: number
  readonly ability: string
}

export interface GCRideDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
  readonly hauntPower: number
}

export interface GCMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: GCRarity
  readonly source: string
  readonly value: number
}

export interface GCBoothDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
  readonly maxLevel: number
}

export interface GCAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly school: GCAbilitySchool
}

export interface GCAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface GCTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredRides: number
}

export interface GCPrizeDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: GCRarity
  readonly cursePower: number
  readonly specialAbility: string
}

export interface GCEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface GCSummonedGhost {
  readonly id: string
  ghostDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  haunted: boolean
  hauntCount: number
  acquiredAt: number
}

export interface GCOwnedBooth {
  readonly id: string
  boothDefId: string
  level: number
  built: boolean
}

export interface GCCarnivalState {
  reputation: number
  maxReputation: number
  eeriness: number
  lastIlluminatedAt: number | null
}

export interface GCStoreState {
  summonedGhosts: GCSummonedGhost[]
  collectedMaterials: Record<string, number>
  booths: GCOwnedBooth[]
  achievements: string[]
  currentTitle: string
  collectedPrizes: string[]
  unlockedRides: string[]
  ghostLevel: number
  ghostExp: number
  tickets: number
  ectoplasm: number
  totalSummoned: number
  totalScared: number
  totalUpgraded: number
  totalHaunted: number
  totalTricks: number
  activeEventId: string | null
  eventTimer: number
  carnival: GCCarnivalState
  activeRideId: string | null
}

export interface GCStoreActions {
  gcSummonGhost: (ghostId: string) => boolean
  gcScareVisitor: (ghostId: string) => number
  gcBuildBooth: (boothId: string) => boolean
  gcUseAbility: (abilityId: string) => boolean
  gcTriggerMidnightEvent: (eventId: string) => boolean
  gcCollectPrize: (prizeId: string) => boolean
  gcEnterRide: (rideId: string) => boolean
  gcVisitBooth: (boothId: string) => number
  gcPerformTrick: (ghostId: string) => boolean
  gcIlluminateLights: (amount: number) => boolean
}

export type GCFullStore = GCStoreState & GCStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const GC_COLOR_PHANTOM_PURPLE: string = '#7B2D8E'
export const GC_COLOR_MIDNIGHT_BLUE: string = '#191970'
export const GC_COLOR_EERIE_GREEN: string = '#39FF14'
export const GC_COLOR_CARNIVAL_RED: string = '#DC143C'
export const GC_COLOR_GOLDEN_TICKET: string = '#FFD700'
export const GC_COLOR_GHOST_WHITE: string = '#F8F8FF'
export const GC_COLOR_SHADOW_GRAY: string = '#696969'
export const GC_COLOR_NEON_PINK: string = '#FF6EC7'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const GC_MAX_LEVEL = 50
const GC_INITIAL_TICKETS = 500
const GC_INITIAL_ECTOPLASM = 100

function gcXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= GC_MAX_LEVEL) return Infinity
  return Math.floor(85 * Math.pow(1.13, level) + level * 16)
}

function gcLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < GC_MAX_LEVEL) {
    const needed = gcXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function gcGenerateId(): string {
  return `gc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function gcRarityMultiplier(rarity: GCRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function gcGhostTypeColor(ghostType: GCGhostType): string {
  switch (ghostType) {
    case 'Phantom': return GC_COLOR_PHANTOM_PURPLE
    case 'Jester': return GC_COLOR_NEON_PINK
    case 'Mime': return GC_COLOR_GHOST_WHITE
    case 'Fortune Teller': return GC_COLOR_MIDNIGHT_BLUE
    case 'Ride Operator': return GC_COLOR_CARNIVAL_RED
    case 'Food Vendor': return GC_COLOR_EERIE_GREEN
    case 'Masked Dancer': return GC_COLOR_GOLDEN_TICKET
  }
}

function gcRarityColor(rarity: GCRarity): string {
  switch (rarity) {
    case 'common': return GC_COLOR_SHADOW_GRAY
    case 'uncommon': return GC_COLOR_EERIE_GREEN
    case 'rare': return '#818CF8'
    case 'epic': return GC_COLOR_NEON_PINK
    case 'legendary': return GC_COLOR_GOLDEN_TICKET
  }
}

function gcSchoolColor(school: GCAbilitySchool): string {
  switch (school) {
    case 'Haunt': return GC_COLOR_PHANTOM_PURPLE
    case 'Illusion': return GC_COLOR_NEON_PINK
    case 'Fright': return GC_COLOR_CARNIVAL_RED
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: GHOST TYPE BONUSES & SUMMON CHANCES
// ═══════════════════════════════════════════════════════════════════

const GC_GHOST_TYPE_BONUSES: Record<GCGhostType, { scareBonus: number; hauntBonus: number; trickBonus: number }> = {
  Phantom: { scareBonus: 20, hauntBonus: 10, trickBonus: 0 },
  Jester: { scareBonus: 5, hauntBonus: 5, trickBonus: 25 },
  Mime: { scareBonus: 15, hauntBonus: 0, trickBonus: 15 },
  'Fortune Teller': { scareBonus: 0, hauntBonus: 25, trickBonus: 5 },
  'Ride Operator': { scareBonus: 10, hauntBonus: 15, trickBonus: 0 },
  'Food Vendor': { scareBonus: 5, hauntBonus: 5, trickBonus: 20 },
  'Masked Dancer': { scareBonus: 15, hauntBonus: 0, trickBonus: 20 },
}

const GC_SUMMON_CHANCES: Record<GCRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
}

const GC_RIDE_TYPE_BONUS: Record<string, GCGhostType[]> = {
  phantom_coaster: ['Phantom', 'Mime'],
  funhouse_mirrors: ['Jester', 'Masked Dancer'],
  haunted_mansion: ['Phantom', 'Fortune Teller'],
  ghost_ferris_wheel: ['Mime', 'Food Vendor'],
  dark_carousel: ['Masked Dancer', 'Jester'],
  tunnel_of_terror: ['Phantom', 'Ride Operator'],
  spooky_tent: ['Fortune Teller', 'Food Vendor'],
  shadow_big_top: ['Phantom', 'Jester', 'Mime', 'Fortune Teller', 'Ride Operator', 'Food Vendor', 'Masked Dancer'],
}

function gcGetGhostTypeBonus(ghostType: GCGhostType): { scareBonus: number; hauntBonus: number; trickBonus: number } {
  return GC_GHOST_TYPE_BONUSES[ghostType]
}

function gcGetSummonChance(rarity: GCRarity, activeRideId: string | null): number {
  let chance = GC_SUMMON_CHANCES[rarity]
  if (activeRideId) {
    const bonusTypes = GC_RIDE_TYPE_BONUS[activeRideId]
    if (bonusTypes && bonusTypes.length > 3) {
      chance = chance * 1.5
    }
  }
  return Math.min(100, Math.floor(chance))
}

function gcGetHauntBonus(level: number, hauntCount: number): number {
  return Math.floor(level * 12 * (1 + hauntCount * 0.25))
}

function gcGetBoothBonus(boothId: string, level: number): number {
  switch (boothId) {
    case 'ticket_booth': return level * 2
    case 'ectoplasm_stall': return level * 5
    case 'fortune_tent': return level * 8
    case 'prize_alley': return level * 12
    case 'haunted_gate': return level * 20
    case 'ghost_kitchen': return level * 3
    case 'illusion_workshop': return level * 7
    case 'shadow_theater': return level * 15
    default: return level * 2
  }
}

function gcGetHauntTier(count: number): string {
  if (count <= 0) return 'Dormant'
  if (count === 1) return 'Restless'
  if (count === 2) return 'Poltergeist'
  if (count === 3) return 'Wraith'
  if (count === 4) return 'Specter'
  return 'Phantom Lord'
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: GC_GHOSTS — 35 Ghost Entities (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const GC_GHOSTS: readonly GCGhostDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'whisper_phantom',
    name: 'Whisper Phantom',
    description:
      'A faint, barely visible phantom that drifts through the carnival grounds whispering the names of visitors who will leave before dawn. Its voice sounds like wind through cracked glass, and those who hear it feel an inexplicable chill on the backs of their necks.',
    ghostType: 'Phantom',
    rarity: 'common',
    basePower: 14,
    ability: 'Whispering Chill',
  },
  {
    id: 'jester_scraps',
    name: 'Jester Scraps',
    description:
      'A tattered jester ghost that emerged from an old costume trunk backstage. Its bells still ring faintly, producing a dissonant melody that makes visitors laugh nervously while their feet feel rooted to the ground.',
    ghostType: 'Jester',
    rarity: 'common',
    basePower: 16,
    ability: 'Nervous Chuckle',
  },
  {
    id: 'silent_mime',
    name: 'Silent Mime',
    description:
      'A mime who died mid-performance and never stopped acting. It creates invisible walls that visitors can actually feel, trapping them in pantomime prisons from which no applause can free them.',
    ghostType: 'Mime',
    rarity: 'common',
    basePower: 13,
    ability: 'Invisible Box Trap',
  },
  {
    id: 'penny_fortune',
    name: 'Penny Fortune Teller',
    description:
      'A modest fortune teller who reads palms with translucent fingers. Her predictions are unsettling not because they are wrong, but because they are always exactly specific enough to be disturbing.',
    ghostType: 'Fortune Teller',
    rarity: 'common',
    basePower: 17,
    ability: 'Palm Reading',
  },
  {
    id: 'ticket_taker',
    name: 'Ticket Taker Ghost',
    description:
      'The ghost of a ticket taker who still stands at the entrance, demanding tickets from everyone who passes. Those who cannot produce one are followed by the soft sound of tearing paper for hours.',
    ghostType: 'Ride Operator',
    rarity: 'common',
    basePower: 15,
    ability: 'Ticket Check',
  },
  {
    id: 'cotton_spirit',
    name: 'Cotton Candy Spirit',
    description:
      'A food vendor ghost that manifests as a swirling cloud of pink and blue spun sugar. It offers treats to children that taste like their favorite memories, then vanishes when they reach for a second bite.',
    ghostType: 'Food Vendor',
    rarity: 'common',
    basePower: 12,
    ability: 'Sugar Veil',
  },
  {
    id: 'paper_dancer',
    name: 'Paper Dancer',
    description:
      'A masked dancer made entirely of origami and crepe paper streamers. Its movements are impossibly graceful despite its fragile form, and it leaves trails of confetti that glow in the dark.',
    ghostType: 'Masked Dancer',
    rarity: 'common',
    basePower: 18,
    ability: 'Confetti Trail',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'hallway_phantom',
    name: 'Hallway Phantom',
    description:
      'A tall phantom that appears at the far end of long corridors, always just out of reach. Every time you blink, it is closer. When you turn around, it is behind you. When you turn back, it is at the far end again.',
    ghostType: 'Phantom',
    rarity: 'uncommon',
    basePower: 31,
    ability: 'Corridor Creep',
  },
  {
    id: 'jester_gears',
    name: 'Clockwork Jester',
    description:
      'A mechanical jester ghost powered by ghostly energy from a haunted music box. Its movements are jerky and unnatural, and it plays a music box version of a lullaby that causes deep unease.',
    ghostType: 'Jester',
    rarity: 'uncommon',
    basePower: 34,
    ability: 'Music Box Madness',
  },
  {
    id: 'mirror_mime',
    name: 'Mirror Mime',
    description:
      'A mime that exists only in reflections. It copies your movements with a slight delay, and occasionally makes gestures you did not make. Looking away from the mirror does not make it stop.',
    ghostType: 'Mime',
    rarity: 'uncommon',
    basePower: 29,
    ability: 'Reflection Copy',
  },
  {
    id: 'tarot_apparition',
    name: 'Tarot Apparition',
    description:
      'A fortune teller who communicates exclusively through floating tarot cards. The cards rearrange themselves into grim portents, and the air grows cold when the Death card appears face up.',
    ghostType: 'Fortune Teller',
    rarity: 'uncommon',
    basePower: 33,
    ability: 'Grim Tarot',
  },
  {
    id: 'carousel_ghost',
    name: 'Carousel Operator',
    description:
      'The spectral operator of the haunted carousel. He still calls out ride instructions in a hollow voice, and the carousel horses occasionally come alive at midnight, galloping silently through the fog.',
    ghostType: 'Ride Operator',
    rarity: 'uncommon',
    basePower: 36,
    ability: 'Midnight Gallop',
  },
  {
    id: 'popcorn_wraith',
    name: 'Popcorn Wraith',
    description:
      'A food vendor ghost surrounded by a permanent aura of floating popcorn kernels. The popcorn pops spontaneously near visitors, creating a constant barrage of phantom snacks that cannot be eaten.',
    ghostType: 'Food Vendor',
    rarity: 'uncommon',
    basePower: 30,
    ability: 'Kernel Barrage',
  },
  {
    id: 'masquerade_phantom',
    name: 'Masquerade Phantom',
    description:
      'A masked dancer whose mask constantly shifts between expressions — joy, sorrow, rage, terror. Its dance tells the story of every person who ever vanished at the carnival, and watching it stirs deep melancholy.',
    ghostType: 'Masked Dancer',
    rarity: 'uncommon',
    basePower: 35,
    ability: 'Mask Shift Dance',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'void_phantom',
    name: 'Void Phantom',
    description:
      'A phantom made of absolute darkness that absorbs all light within ten feet. It does not need to touch you to scare you — simply knowing it is nearby is enough to make the bravest soul tremble.',
    ghostType: 'Phantom',
    rarity: 'rare',
    basePower: 56,
    ability: 'Light Devour',
  },
  {
    id: 'mad_jester',
    name: 'Mad Jester King',
    description:
      'The king of all carnival jesters, driven mad by an eternity of forced laughter. His jokes are genuinely terrifying, and his laugh echoes through the carnival for hours after he appears, growing louder each time.',
    ghostType: 'Jester',
    rarity: 'rare',
    basePower: 60,
    ability: 'Eternal Laughter',
  },
  {
    id: 'void_mime',
    name: 'Silence Binder',
    description:
      'A mime of such power that it can bind actual sound into invisible boxes. When it performs its act, visitors find themselves unable to speak, scream, or even whisper. Only the mime makes a sound.',
    ghostType: 'Mime',
    rarity: 'rare',
    basePower: 54,
    ability: 'Sound Binding',
  },
  {
    id: 'oracle_specter',
    name: 'Oracle Specter',
    description:
      'A fortune teller who can see the exact moment of everyone she meets. She does not tell you when you will die — instead, she describes the weather on that day, making the knowledge far more unsettling.',
    ghostType: 'Fortune Teller',
    rarity: 'rare',
    basePower: 62,
    ability: 'Death Weather',
  },
  {
    id: 'demon_operator',
    name: 'Demon Ride Operator',
    description:
      'A ride operator who modified every ride to be genuinely dangerous. The rollercoaster goes too fast, the ferris wheel spins in reverse, and the haunted house has real ghosts — because she made them.',
    ghostType: 'Ride Operator',
    rarity: 'rare',
    basePower: 65,
    ability: 'Ride Override',
  },
  {
    id: 'feast_banshee',
    name: 'Feast Banshee',
    description:
      'A food vendor whose spectral cooking produces aromas so intoxicating that visitors follow the scent into the fog, never to return. The food she offers is real, but eating it binds you to the carnival forever.',
    ghostType: 'Food Vendor',
    rarity: 'rare',
    basePower: 57,
    ability: 'Irresistible Aroma',
  },
  {
    id: 'phantom_ballet',
    name: 'Phantom Ballet Dancer',
    description:
      'A masked dancer whose performance reenacts the last moments of the carnival fire. She dances through invisible flames with perfect grace, and real smoke rises from the ground around her feet.',
    ghostType: 'Masked Dancer',
    rarity: 'rare',
    basePower: 58,
    ability: 'Flame Ballet',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'shadow_archphantom',
    name: 'Shadow Archphantom',
    description:
      'A colossal phantom that casts a shadow the size of the entire carnival. When night falls, its shadow detaches and walks among the visitors, whispering their deepest fears in voices they almost recognize.',
    ghostType: 'Phantom',
    rarity: 'epic',
    basePower: 92,
    ability: 'Giant Shadow Walk',
  },
  {
    id: 'harlequin_abyss',
    name: 'Harlequin of the Abyss',
    description:
      'An ancient jester from a carnival that existed before human memory. Its painted smile is a rift into another dimension, and objects thrown into its mouth disappear permanently, along with the memory of them.',
    ghostType: 'Jester',
    rarity: 'epic',
    basePower: 98,
    ability: 'Dimensional Grin',
  },
  {
    id: 'absolute_mime',
    name: 'The Absolute Mime',
    description:
      'The mime who mimes reality itself. When it performs, the world around it changes to match its pantomime — walls become soft, gravity reverses, time slows. It could mime the carnival out of existence if it chose.',
    ghostType: 'Mime',
    rarity: 'epic',
    basePower: 95,
    ability: 'Reality Pantomime',
  },
  {
    id: 'fates_weaver',
    name: 'Fates Weaver',
    description:
      'A fortune teller who does not predict the future — she weaves it. Her spectral loom creates tapestries that show possible futures, and she can pull threads to make specific outcomes more likely.',
    ghostType: 'Fortune Teller',
    rarity: 'epic',
    basePower: 100,
    ability: 'Fate Weaving',
  },
  {
    id: 'nightmare_engineer',
    name: 'Nightmare Engineer',
    description:
      'A ride operator who builds rides from dreams. Each ride is a personalized nightmare crafted from the subconscious of whoever boards it. No two visitors experience the same ride, but all of them emerge changed.',
    ghostType: 'Ride Operator',
    rarity: 'epic',
    basePower: 104,
    ability: 'Dream Ride Construction',
  },
  {
    id: 'starvation_ghoul',
    name: 'Starvation Ghoul Chef',
    description:
      'A food vendor whose hunger is so vast it has become its own entity. It cooks phantom meals that look delicious but induce in the eater an insatiable craving for food they can never find or name.',
    ghostType: 'Food Vendor',
    rarity: 'epic',
    basePower: 88,
    ability: 'Eternal Hunger Curse',
  },
  {
    id: 'soul_dancer',
    name: 'Soul Dancer',
    description:
      'A masked dancer who captures souls through dance. Anyone who watches her performance for more than thirty seconds finds themselves dancing alongside her, unable to stop, as their life force slowly drains away.',
    ghostType: 'Masked Dancer',
    rarity: 'epic',
    basePower: 96,
    ability: 'Soul Capture Dance',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'primordial_phantom',
    name: 'Primordial Phantom',
    description:
      'The first ghost to ever exist, born from the moment the first living creature experienced fear. It is the concept of haunting given form, and every ghost in every carnival draws its power from this ancient being.',
    ghostType: 'Phantom',
    rarity: 'legendary',
    basePower: 148,
    ability: 'Genesis of Fear',
  },
  {
    id: 'cosmic_jester',
    name: 'Cosmic Jester',
    description:
      'A jester who plays jokes on the fabric of reality itself. Once a year it rearranges the stars into a smiley face. Scientists attribute this to pareidolia. Scientists are wrong. The universe is its stage.',
    ghostType: 'Jester',
    rarity: 'legendary',
    basePower: 142,
    ability: 'Cosmic Prank',
  },
  {
    id: 'silence_incarnate',
    name: 'Silence Incarnate',
    description:
      'The mime that mimes the end of all sound. When it performs its final act, a sphere of absolute silence expands from where it stands, consuming all noise. Birds stop singing. Wind stops blowing. Even thoughts go quiet.',
    ghostType: 'Mime',
    rarity: 'legendary',
    basePower: 145,
    ability: 'Ultimate Silence',
  },
  {
    id: 'norn_trinity',
    name: 'Norn Trinity Seer',
    description:
      'Three fortune tellers fused into one being — Past, Present, and Future. Each face reads a different timeline, and together they know every event that has happened, is happening, and will ever happen.',
    ghostType: 'Fortune Teller',
    rarity: 'legendary',
    basePower: 150,
    ability: 'Trinity Vision',
  },
  {
    id: 'cyclone_overlord',
    name: 'Cyclone Overlord',
    description:
      'A ride operator who controls a spectral amusement park that exists in the eye of a perpetual ghost storm. Every ride in the phantom park generates the storm, and the storm generates the park in an infinite loop.',
    ghostType: 'Ride Operator',
    rarity: 'legendary',
    basePower: 152,
    ability: 'Phantom Storm Park',
  },
  {
    id: 'ambrosia_shade',
    name: 'Ambrosia Shade',
    description:
      'A food vendor who serves the food of the dead — ambrosia that grants eternal life to ghosts and immortality to those who eat it. The price is simple: your shadow. Without it, you become a ghost yourself.',
    ghostType: 'Food Vendor',
    rarity: 'legendary',
    basePower: 138,
    ability: 'Ambrosia Feast',
  },
  {
    id: 'dance_of_eternity',
    name: 'Dance of Eternity',
    description:
      'A masked dancer whose dance has been going on since the first sunset. It cannot stop, for stopping would end time itself. Every dancer who has ever lived is reflected in its mask, and its steps shake the earth.',
    ghostType: 'Masked Dancer',
    rarity: 'legendary',
    basePower: 140,
    ability: 'Eternal Dance',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: GC_RIDES — 8 Haunted Rides
// ═══════════════════════════════════════════════════════════════════

export const GC_RIDES: readonly GCRideDef[] = [
  {
    id: 'phantom_coaster',
    name: 'Phantom Rollercoaster',
    description:
      'A rollercoaster that appears solid but becomes translucent as it moves. Riders swear they can see the ground rushing past beneath their feet through the bottom of the cars. The screams come from the rails, not the passengers.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['+5% phantom summon rate', 'Basic material gathering'],
    hauntPower: 10,
  },
  {
    id: 'funhouse_mirrors',
    name: 'Funhouse of Mirrors',
    description:
      'A funhouse where the mirrors show not your reflection, but your deepest insecurities. Each mirror shows a different version of you — older, sadder, forgotten. The exit is always behind you, no matter which way you turn.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['+10% jester and dancer encounters', 'Rare ghost summoning chance'],
    hauntPower: 20,
  },
  {
    id: 'haunted_mansion',
    name: 'Haunted Mansion Ride',
    description:
      'A ride through a full-scale haunted mansion where everything is real. The cobwebs are real spider silk. The portraits have real eyes that follow you. The skeletons in the closets have real stories to tell if you listen.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['+15% haunt power', 'Ectoplasm regeneration aura'],
    hauntPower: 35,
  },
  {
    id: 'ghost_ferris_wheel',
    name: 'Ghost Ferris Wheel',
    description:
      'A ferris wheel that rotates at one revolution per hour. At the top, riders can see the entire carnival as it was on the night of the great fire. The other ghosts wave up at them. They are always waving.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['+20% material yield', 'Fright ability enhancement'],
    hauntPower: 50,
  },
  {
    id: 'dark_carousel',
    name: 'Dark Carousel',
    description:
      'A carousel where every horse is a ghost animal that ran away from the circus. A ghost lion, a phantom elephant, a spectral bear. They gallop in an endless circle, and riders can feel their phantom fur and breath.',
    minLevel: 22,
    unlockCost: 3000,
    bonuses: ['+25% trick power', 'Epic ghost summoning unlocked'],
    hauntPower: 70,
  },
  {
    id: 'tunnel_of_terror',
    name: 'Tunnel of Terror',
    description:
      'A tunnel ride through pure darkness where the only light comes from the eyes of creatures that do not have names. The tunnel is longer on the inside than the outside, and some riders have been in it for decades.',
    minLevel: 30,
    unlockCost: 7500,
    bonuses: ['+30% phantom power', 'Rare prize encounters'],
    hauntPower: 90,
  },
  {
    id: 'spooky_tent',
    name: 'Spooky Fortune Tent',
    description:
      'A tent where a real seance takes place every hour. The spirits that emerge are not carnival ghosts but actual historical figures who wandered into the carnival by accident and can never leave.',
    minLevel: 38,
    unlockCost: 15000,
    bonuses: ['+35% fortune teller power', 'Legendary material chance'],
    hauntPower: 120,
  },
  {
    id: 'shadow_big_top',
    name: 'Shadow Big Top',
    description:
      'The main circus tent, where the phantom ringmaster performs every night at midnight. The show changes based on the audience. No two performances are the same, and no one remembers what happened during the show.',
    minLevel: 45,
    unlockCost: 30000,
    bonuses: ['+50% all ghost power', 'Legendary summoning', 'Midnight events'],
    hauntPower: 200,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: GC_MATERIALS — 30 Carnival Materials
// ═══════════════════════════════════════════════════════════════════

export const GC_MATERIALS: readonly GCMaterialDef[] = [
  // Common (6)
  { id: 'admission_ticket', name: 'Admission Ticket', description: 'A faded paper ticket stub that still smells of cotton candy and fear. Used as basic currency in the carnival and required for summoning common ghosts.', rarity: 'common', source: 'phantom_coaster', value: 5 },
  { id: 'ghost_token', name: 'Ghost Token', description: 'A translucent coin that feels cold to the touch. It bears the image of a laughing skull on one side and a weeping angel on the other.', rarity: 'common', source: 'phantom_coaster', value: 6 },
  { id: 'ectoplasm_drip', name: 'Ectoplasm Drip', description: 'A small vial of glowing green ectoplasm collected from haunted surfaces. Essential for maintaining ghost manifestations and powering spectral abilities.', rarity: 'common', source: 'phantom_coaster', value: 7 },
  { id: 'cotton_candy_wisp', name: 'Cotton Candy Wisp', description: 'A floating wisp of spectral cotton candy. Eating it restores ectoplasm energy and makes the eater slightly transparent for several hours.', rarity: 'common', source: 'phantom_coaster', value: 4 },
  { id: 'carousel_horse_braid', name: 'Carousel Horse Hair', description: 'A strand of mane from a phantom carousel horse. It glows faintly in the dark and hums with the ghostly energy of endless circling.', rarity: 'common', source: 'ghost_ferris_wheel', value: 8 },
  { id: 'cobweb_bundle', name: 'Cobweb Bundle', description: 'A carefully collected bundle of haunted cobwebs. Unlike normal spider silk, these webs vibrate when danger is near and can be woven into protective garments.', rarity: 'common', source: 'phantom_coaster', value: 5 },

  // Uncommon (6)
  { id: 'fortune_card', name: 'Fortune Card', description: 'A tarot card from a spectral deck that shuffles itself. Each card contains a trapped fragment of a prediction that has not yet come true.', rarity: 'uncommon', source: 'spooky_tent', value: 28 },
  { id: 'jester_bell', name: 'Jester Bell', description: 'A small golden bell from a jester costume. When rung, it produces a sound that only ghosts and the soon-to-be-dead can hear. It terrifies both groups equally.', rarity: 'uncommon', source: 'funhouse_mirrors', value: 35 },
  { id: 'mirror_shard', name: 'Haunted Mirror Shard', description: 'A fragment of a funhouse mirror. It does not reflect light but instead shows glimpses of the carnival on the night it burned down.', rarity: 'uncommon', source: 'funhouse_mirrors', value: 32 },
  { id: 'shadow_cloth', name: 'Shadow Cloth', description: 'Fabric woven from living shadows. It can be draped over objects to make them invisible, or over ghosts to make them temporarily solid.', rarity: 'uncommon', source: 'dark_carousel', value: 40 },
  { id: 'midnight_popcorn', name: 'Midnight Popcorn', description: 'Popcorn that appears in bowls at exactly midnight and disappears at dawn. Each kernel contains a tiny burst of frozen time that slows aging.', rarity: 'uncommon', source: 'spooky_tent', value: 30 },
  { id: 'haunted_marble', name: 'Haunted Marble', description: 'A glass marble with a tiny ghost trapped inside. The ghost bangs against the glass when danger approaches and rolls toward the nearest exit when calm.', rarity: 'uncommon', source: 'haunted_mansion', value: 45 },

  // Rare (6)
  { id: 'phantom_scroll', name: 'Phantom Scroll', description: 'A scroll written in ghost ink that is only visible under moonlight. It contains the rules of the carnival, and reading them changes your understanding of reality.', rarity: 'rare', source: 'haunted_mansion', value: 120 },
  { id: 'cursed_mask', name: 'Cursed Mask', description: 'A beautiful mask that compels anyone who wears it to dance without stopping. The dance lasts until the mask is removed, but removing it requires another person to put it on.', rarity: 'rare', source: 'dark_carousel', value: 150 },
  { id: 'dark_ferris_gem', name: 'Dark Ferris Gem', description: 'A gemstone that formed at the apex of the ghost ferris wheel, where the boundary between the living world and the spirit world is thinnest.', rarity: 'rare', source: 'ghost_ferris_wheel', value: 140 },
  { id: 'terror_vial', name: 'Terror Vial', description: 'A vial containing liquid fear distilled from the screams of tunnel of terror riders. A single drop can paralyze a ghost hunter for ten minutes.', rarity: 'rare', source: 'tunnel_of_terror', value: 160 },
  { id: 'ringmaster_whip', name: 'Ringmaster Whip Fragment', description: 'A fragment of the phantom ringmaster whip that can command any spectral beast. It cracks with a sound like breaking bones and leaves a trail of purple sparks.', rarity: 'rare', source: 'shadow_big_top', value: 135 },
  { id: 'carnival_fire_ember', name: 'Carnival Fire Ember', description: 'An ember from the original carnival fire that still burns after decades. It cannot be extinguished by water, wind, or time. Only silence can smother it.', rarity: 'rare', source: 'shadow_big_top', value: 110 },

  // Epic (6)
  { id: 'void_ticket', name: 'Void Ticket', description: 'A ticket to a ride that does not exist. Holding it makes you hear carnival music from nowhere and smell funnel cake in empty rooms. It is an admission to the carnival between worlds.', rarity: 'epic', source: 'tunnel_of_terror', value: 500 },
  { id: 'phantom_crown', name: 'Phantom Crown Shard', description: 'A shard from the crown of the phantom king. It pulses with the authority to command all ghosts within earshot, and ghostly whispers emanate from it constantly.', rarity: 'epic', source: 'shadow_big_top', value: 550 },
  { id: 'midnight_ink', name: 'Midnight Ink Well', description: 'A well of living ink that writes prophecies on any surface it touches. The prophecies are always true, but they are written in a language that takes decades to learn.', rarity: 'epic', source: 'spooky_tent', value: 600 },
  { id: 'shadow_silk', name: 'Shadow Silk Thread', description: 'Thread spun from the shadow of a dying star. Garments woven from it make the wearer completely invisible to both the living and the dead.', rarity: 'epic', source: 'tunnel_of_terror', value: 520 },
  { id: 'cursed_music_box', name: 'Cursed Music Box', description: 'A music box that plays the song the phantom ringmaster hums before every midnight show. Winding it causes every ghost in the carnival to stop and listen in reverent silence.', rarity: 'epic', source: 'shadow_big_top', value: 480 },
  { id: 'soul_lantern', name: 'Soul Lantern', description: 'A lantern that burns captured souls instead of oil. The light it produces reveals the true nature of everything it illuminates — every disguise, every lie, every hidden ghost.', rarity: 'epic', source: 'haunted_mansion', value: 570 },

  // Legendary (6)
  { id: 'genesis_ghost_essence', name: 'Genesis Ghost Essence', description: 'The essence of the very first ghost, distilled into liquid form. A single drop can turn any object into a permanent haunting ground. Two drops can make a person a ghost while they still live.', rarity: 'legendary', source: 'shadow_big_top', value: 5000 },
  { id: 'eternal_ticket', name: 'Eternal Ticket', description: 'A ticket that grants admission to every carnival that has ever existed or will ever exist. It is dated with no year and lists no destination. It can never be torn, lost, or surrendered.', rarity: 'legendary', source: 'shadow_big_top', value: 6000 },
  { id: 'void_ringmaster_mask', name: 'Void Ringmaster Mask', description: 'The mask worn by the phantom ringmaster during the show that never ends. Putting it on grants absolute control over every ride, ghost, and attraction in any haunted carnival across all dimensions.', rarity: 'legendary', source: 'shadow_big_top', value: 5500 },
  { id: 'midnight_carnival_blueprint', name: 'Midnight Carnival Blueprint', description: 'The architectural plan for a carnival that builds itself. The blueprint unfolds at midnight and constructs a full haunted carnival from nothing by dawn, then folds itself away.', rarity: 'legendary', source: 'shadow_big_top', value: 7000 },
  { id: 'soul_weavers_spindle', name: 'Soul Weaver Spindle', description: 'A spindle that can weave souls into any shape. The fortune tellers use it to create fate threads, but in the hands of a skilled user, it can reshape a person entire destiny.', rarity: 'legendary', source: 'spooky_tent', value: 6500 },
  { id: 'phantom_throne_fragment', name: 'Phantom Throne Fragment', description: 'A fragment of the throne of the Primordial Phantom. It contains absolute authority over the concept of fear itself. Those who hold it understand why everyone is afraid.', rarity: 'legendary', source: 'shadow_big_top', value: 8000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: GC_BOOTH — 25 Booth Structures (upgradeable to level 10)
// ═══════════════════════════════════════════════════════════════════

export const GC_BOOTH: readonly GCBoothDef[] = [
  // Summoning (5)
  { id: 'ticket_booth', name: 'Summoning Ticket Booth', description: 'A dilapidated ticket booth that dispenses spectral tickets used for summoning common ghosts. The tickets appear on their own at irregular intervals.', baseCost: 100, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'ectoplasm_stall', name: 'Ectoplasm Collection Stall', description: 'A stall equipped with spectral jars that automatically collect ectoplasm from passing ghosts. Increases the quality of summoned uncommon ghosts.', baseCost: 400, costMultiplier: 1.6, maxLevel: 10 },
  { id: 'fortune_tent', name: 'Fortune Summoning Tent', description: 'A small tent where fortune tellers channel ghost energy into summoning circles. Required for rare ghost summoning rituals.', baseCost: 1200, costMultiplier: 1.7, maxLevel: 10 },
  { id: 'prize_alley', name: 'Prize Alley Beacon', description: 'A beacon of golden ticket energy that attracts powerful ghosts from beyond the carnival. Essential for epic ghost summoning.', baseCost: 3000, costMultiplier: 1.8, maxLevel: 10 },
  { id: 'haunted_gate', name: 'Haunted Gateway Arch', description: 'The ultimate summoning structure — a gateway arch that opens directly into the spirit realm. Capable of calling legendary ghosts.', baseCost: 8000, costMultiplier: 2.0, maxLevel: 10 },

  // Production (5)
  { id: 'ghost_kitchen', name: 'Ghost Kitchen', description: 'A kitchen that cooks spectral food from raw materials, producing a steady supply of basic carnival consumables and ectoplasm-infused treats.', baseCost: 80, costMultiplier: 1.4, maxLevel: 10 },
  { id: 'illusion_workshop', name: 'Illusion Workshop', description: 'A workshop where ghostly artisans craft illusion materials and prank items. Produces rare materials during peak activity hours.', baseCost: 300, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'shadow_workshop', name: 'Shadow Workshop', description: 'A dark workshop that captures and processes shadows into usable materials. Produces shadow cloth and terror vials overnight.', baseCost: 800, costMultiplier: 1.6, maxLevel: 10 },
  { id: 'fortune_forge', name: 'Fortune Forge', description: 'A forge that operates on spectral energy, smelting fear into solid objects. Generates cursed items and phantom scroll fragments.', baseCost: 2000, costMultiplier: 1.7, maxLevel: 10 },
  { id: 'midnight_distillery', name: 'Midnight Distillery', description: 'A distillery that converts raw ectoplasm into potent spectral essences. Can process and combine any carnival material into powerful brews.', baseCost: 5000, costMultiplier: 1.8, maxLevel: 10 },

  // Scare (5)
  { id: 'scream_counter', name: 'Scream Counter', description: 'A booth that measures and records visitor screams, converting fear into usable ectoplasm energy. Provides basic scare bonuses to nearby ghosts.', baseCost: 120, costMultiplier: 1.4, maxLevel: 10 },
  { id: 'jump_booth', name: 'Jump Scare Booth', description: 'A booth that generates automated jump scares using mechanical ghosts and mirror reflections. Effective against both ground visitors and aerial spirits.', baseCost: 500, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'shadow_theater', name: 'Shadow Theater', description: 'A theater that projects terrifying shadow plays onto nearby surfaces. The plays are improvised based on the specific fears of the audience.', baseCost: 1500, costMultiplier: 1.6, maxLevel: 10 },
  { id: 'fog_machine_booth', name: 'Spectral Fog Machine', description: 'An automated fog machine that produces ghostly fog containing microscopic phantoms. Creates an area of heightened fear and reduced visibility.', baseCost: 700, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'haunt_fortress', name: 'Haunted Booth Fortress', description: 'A massive booth complex that serves as the ultimate scare structure. It generates its own localized nightmares and sustains all nearby ghosts.', baseCost: 4000, costMultiplier: 1.8, maxLevel: 10 },

  // Utility (5)
  { id: 'ecto_well', name: 'Ectoplasm Well', description: 'A well that draws raw ectoplasm from deep beneath the carnival grounds. Passive ectoplasm regeneration for all carnival operations.', baseCost: 150, costMultiplier: 1.4, maxLevel: 10 },
  { id: 'material_vault', name: 'Material Vault', description: 'A spectral storage vault that preserves carnival materials at perfect conditions. Materials stored here never decay or lose their ghostly properties.', baseCost: 250, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'ghost_rest_tent', name: 'Ghost Rest Tent', description: 'A quiet tent where ghosts recover their energy faster. Reduces cooldowns on spectral abilities and provides a sanctuary from ghost hunters.', baseCost: 600, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'eeriness_purifier', name: 'Eeriness Purifier', description: 'A device that regulates the eeriness level of the carnival. Prevents over-haunting that could drive all visitors away permanently.', baseCost: 1000, costMultiplier: 1.6, maxLevel: 10 },
  { id: 'midnight_altar', name: 'Midnight Altar', description: 'A sacred altar where midnight events can be triggered and controlled. Requires immense ectoplasm but produces extraordinary spectral phenomena.', baseCost: 3000, costMultiplier: 1.7, maxLevel: 10 },

  // Decoration (5)
  { id: 'jack_o_lantern_row', name: 'Jack-o-Lantern Row', description: 'A row of ghostly jack-o-lanterns that light the carnival paths. Their faces change expression based on the mood of nearby visitors.', baseCost: 100, costMultiplier: 1.3, maxLevel: 10 },
  { id: 'spider_web_archway', name: 'Spider Web Archway', description: 'An archway woven from enchanted spider webs that catches wandering spirits and funnels them toward active rides and booths.', baseCost: 200, costMultiplier: 1.4, maxLevel: 10 },
  { id: 'floating_lanterns', name: 'Floating Lantern Garden', description: 'A garden of ghostly lanterns that float at eye level. They illuminate hidden paths and reveal invisible ghosts when passed underneath.', baseCost: 350, costMultiplier: 1.4, maxLevel: 10 },
  { id: 'bone_chime_grove', name: 'Bone Chime Grove', description: 'A grove of trees hung with bone wind chimes. The chimes play haunting melodies that boost the power of spectral abilities performed nearby.', baseCost: 600, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'phantom_fountain', name: 'Phantom Fountain', description: 'A fountain that pumps liquid ectoplasm instead of water. Ghosts that drink from it gain temporary invulnerability, and visitors who touch it feel their mortality.', baseCost: 1200, costMultiplier: 1.6, maxLevel: 10 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: GC_ABILITIES — 22 Spectral Abilities
// ═══════════════════════════════════════════════════════════════════

export const GC_ABILITIES: readonly GCAbilityDef[] = [
  // Haunt School (8)
  { id: 'whisper_haunt', name: 'Whisper Haunt', description: 'A phantom whispers the name of a target into the ear of every visitor within range, causing a slow-building dread that makes them question their own identity.', cooldown: 5, power: 15, school: 'Haunt' },
  { id: 'cold_spot', name: 'Cold Spot', description: 'Create a localized area of supernatural cold that freezes the ground and causes breath to become visible. Visitors caught in the cold spot report feeling watched.', cooldown: 8, power: 22, school: 'Haunt' },
  { id: 'possession_glimmer', name: 'Possession Glimmer', description: 'Temporarily possess an inanimate object, making it move and speak. Possessed objects develop ghostly personalities and can perform simple tasks.', cooldown: 15, power: 35, school: 'Haunt' },
  { id: 'ecto_bind', name: 'Ecto Bind', description: 'Shoot strands of ectoplasm that bind a target in place. The bindings are invisible to normal sight but feel like cold iron chains to the captured.', cooldown: 12, power: 28, school: 'Haunt' },
  { id: 'spectral_anchor', name: 'Spectral Anchor', description: 'Plant a ghostly anchor at a location that prevents all ghosts within range from being banished. The anchor glows with eerie purple light.', cooldown: 20, power: 45, school: 'Haunt' },
  { id: 'phantom_tether', name: 'Phantom Tether', description: 'Create an invisible tether between two targets. Whatever happens to one is felt by the other, creating a shared experience of haunting.', cooldown: 18, power: 40, school: 'Haunt' },
  { id: 'domain_haunt', name: 'Domain Haunt', description: 'Transform an area into your personal haunting ground. Within this domain, your ghost type bonuses are doubled and visitors cannot leave until dawn.', cooldown: 30, power: 60, school: 'Haunt' },
  { id: 'soul_cage', name: 'Soul Cage', description: 'Construct a cage of pure ghost energy around a target. The cage cannot be broken by physical means and only weakens when the caged entity stops being afraid.', cooldown: 40, power: 80, school: 'Haunt' },

  // Illusion School (7)
  { id: 'phantom_disguise', name: 'Phantom Disguise', description: 'Create a convincing illusion that makes a ghost appear as a living person. The disguise is so perfect that even other ghosts cannot see through it.', cooldown: 6, power: 18, school: 'Illusion' },
  { id: 'mirror_maze', name: 'Mirror Maze', description: 'Generate a maze of ghostly mirrors that disorient everyone who enters. The mirrors show impossible reflections and the exits keep moving.', cooldown: 10, power: 25, school: 'Illusion' },
  { id: 'shadow_puppet', name: 'Shadow Puppet Theater', description: 'Animate shadows into a convincing puppet show that tells stories. The shadows can interact with the physical world while the performance lasts.', cooldown: 14, power: 32, school: 'Illusion' },
  { id: 'phantom_crowd', name: 'Phantom Crowd', description: 'Summon an illusion of a large crowd of ghostly visitors. The crowd noises, footsteps, and conversations are indistinguishable from real ones.', cooldown: 20, power: 42, school: 'Illusion' },
  { id: 'false_dawn', name: 'False Dawn', description: 'Create the illusion of sunrise that causes all ghosts in the area to weaken temporarily, believing night has ended. Lasts until the illusion is shattered.', cooldown: 25, power: 50, school: 'Illusion' },
  { id: 'memory_loop', name: 'Memory Loop', description: 'Trap a target in a loop of their own memories, making them relive the same moment repeatedly. They become confused and unable to distinguish past from present.', cooldown: 22, power: 48, school: 'Illusion' },
  { id: 'grand_illusion', name: 'Grand Illusion', description: 'Reshape the entire appearance of the carnival into any form you desire. Visitors will believe they are in a completely different place until the illusion fades.', cooldown: 35, power: 70, school: 'Illusion' },

  // Fright School (7)
  { id: 'bloodcurdle', name: 'Bloodcurdling Scream', description: 'Let out a scream so terrifying it causes physical fear symptoms — raised heartbeat, sweating, and an overwhelming urge to flee. Effective within a large radius.', cooldown: 5, power: 16, school: 'Fright' },
  { id: 'sudden_appear', name: 'Sudden Appearance', description: 'Instantly appear directly in front of a target from nowhere. The surprise factor is enough to make most visitors stumble backward in pure terror.', cooldown: 7, power: 20, school: 'Fright' },
  { id: 'wall_fade', name: 'Wall Fade', description: 'Reach through a solid wall and grab a target from the other side. The arm appears translucent and freezing cold, and the grip is impossible to break.', cooldown: 12, power: 30, school: 'Fright' },
  { id: 'floor_creak', name: 'Floor Creak Symphony', description: 'Make an entire floor creak and groan as if something heavy is walking across it. The footsteps approach but never arrive, building unbearable tension.', cooldown: 9, power: 24, school: 'Fright' },
  { id: 'eye_glow', name: 'Glowing Eyes', description: 'Make a pair of glowing eyes appear in any dark space. The eyes follow targets and blink at irregular intervals, creating intense paranoia.', cooldown: 8, power: 22, school: 'Fright' },
  { id: 'shadow_figure', name: 'Lurking Shadow Figure', description: 'Summon a shadow figure that stands motionless in the peripheral vision of targets. It disappears when looked at directly but always returns.', cooldown: 16, power: 38, school: 'Fright' },
  { id: 'ultimate_fright', name: 'Carnival Nightmare', description: 'Induce a shared waking nightmare in all visitors within the carnival. They see their worst fears made real while remaining fully conscious and unable to close their eyes.', cooldown: 45, power: 90, school: 'Fright' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: GC_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const GC_ACHIEVEMENTS: readonly GCAchievementDef[] = [
  { id: 'ach_first_ghost', name: 'First Phantom Friend', description: 'Summon your first ghost entity and begin your journey as a carnival master.', condition: 'Summon 1 ghost', reward: '+50 ectoplasm' },
  { id: 'ach_ghost_collector', name: 'Ghost Collector', description: 'Build a collection of spectral beings that would impress even the phantom ringmaster.', condition: 'Summon 10 ghosts', reward: '+200 tickets' },
  { id: 'ach_full_common', name: 'Common Haunt Complete', description: 'Every common ghost has answered your call. The carnival hums with basic spectral energy.', condition: 'Summon all 7 common ghosts', reward: '+500 ectoplasm' },
  { id: 'ach_first_ride', name: 'Ride Enthusiast', description: 'Experience your first haunted ride and survive with your sanity intact.', condition: 'Enter 1 ride', reward: '+100 tickets' },
  { id: 'ach_all_rides', name: 'Haunted Theme Park Connoisseur', description: 'You have experienced every haunted attraction the carnival has to offer.', condition: 'Unlock all 8 rides', reward: '+2000 tickets' },
  { id: 'ach_first_booth', name: 'Booth Builder', description: 'Construct your first booth and begin shaping the carnival to your vision.', condition: 'Build 1 booth', reward: '+100 ectoplasm' },
  { id: 'ach_booth_empire', name: 'Booth Empire', description: 'Build an empire of booths that dominates the carnival skyline.', condition: 'Build 15 booths', reward: '+1000 tickets' },
  { id: 'ach_max_booth', name: 'Master Builder', description: 'Fully upgrade a booth to its maximum potential of level 10.', condition: 'Max out 1 booth to level 10', reward: '+1500 ectoplasm' },
  { id: 'ach_first_scare', name: 'First Scream', description: 'Terrify your first visitor and hear the sweet sound of their fear.', condition: 'Scare 1 visitor', reward: '+75 ectoplasm' },
  { id: 'ach_scream_factory', name: 'Scream Factory', description: 'Your carnival produces so many screams that the sound never fully fades.', condition: 'Scare 100 visitors', reward: '+1000 tickets' },
  { id: 'ach_midnight_survivor', name: 'Midnight Survivor', description: 'Survive your first midnight event and learn the true nature of the carnival.', condition: 'Survive 1 midnight event', reward: '+300 ectoplasm' },
  { id: 'ach_first_prize', name: 'Prize Collector', description: 'Claim your first cursed prize and discover that some rewards come with strings attached.', condition: 'Collect 1 prize', reward: '+100 tickets' },
  { id: 'ach_prize_hoarder', name: 'Cursed Prize Hoarder', description: 'Amass a collection of cursed prizes that any ghost would envy.', condition: 'Collect 10 prizes', reward: '+2000 ectoplasm' },
  { id: 'ach_first_trick', name: 'Trickster', description: 'Perform your first spectral trick and prove that ghosts have a sense of humor.', condition: 'Perform 1 trick', reward: '+50 ectoplasm' },
  { id: 'ach_master_trickster', name: 'Master Trickster', description: 'Your tricks have become legendary, told about by ghosts across all haunted carnivals.', condition: 'Perform 50 tricks', reward: '+1500 tickets' },
  { id: 'ach_epic_ghost', name: 'Epic Summoner', description: 'Summon your first epic ghost, a being of immense spectral power.', condition: 'Summon 1 epic ghost', reward: '+2000 ectoplasm' },
  { id: 'ach_legendary_ghost', name: 'Legendary Summoner', description: 'Summon a legendary ghost, one of the most powerful entities in the spirit realm.', condition: 'Summon 1 legendary ghost', reward: '+5000 tickets' },
  { id: 'ach_carnival_phantom', name: 'Carnival Phantom', description: 'Achieve the rank of Carnival Phantom. The carnival recognizes you as one of its own.', condition: 'Reach ghost level 40', reward: '+10000 tickets' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: GC_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const GC_TITLES: readonly GCTitleDef[] = [
  {
    id: 'title_lost_visitor',
    name: 'Lost Visitor',
    description: 'A confused visitor who stumbled into the ghost carnival by accident. The gates closed behind them, and there is no way out.',
    requiredLevel: 1,
    requiredRides: 0,
  },
  {
    id: 'title_carnival_freak',
    name: 'Carnival Freak',
    description: 'No longer a visitor — now part of the show. Your ghostly companions have accepted you as one of their own, though you are still mostly alive.',
    requiredLevel: 5,
    requiredRides: 1,
  },
  {
    id: 'title_booze_monger',
    name: 'Booze Monger',
    description: 'A purveyor of spectral delights who runs the ghost kitchen with terrifying efficiency. Your phantom cotton candy is the stuff of nightmares and legend.',
    requiredLevel: 10,
    requiredRides: 2,
  },
  {
    id: 'title_spook_show',
    name: 'Spook Show Ringmaster',
    description: 'The assistant ringmaster of the midnight show. You have learned the basics of spectral performance and can make a ghost juggle chains for fun.',
    requiredLevel: 18,
    requiredRides: 3,
  },
  {
    id: 'title_phantom_master',
    name: 'Phantom Master',
    description: 'A master of phantom arts who commands respect from every ghost in the carnival. Even the Void Phantom nods when you pass.',
    requiredLevel: 26,
    requiredRides: 4,
  },
  {
    id: 'title_nightmare_weaver',
    name: 'Nightmare Weaver',
    description: 'You weave nightmares into reality with the skill of a Fates Weaver. Visitors enter your carnival willingly, knowing they may never leave the same.',
    requiredLevel: 34,
    requiredRides: 6,
  },
  {
    id: 'title_carnival_phantom_queen',
    name: 'Carnival Phantom Queen',
    description: 'The spectral queen of the haunted carnival. Every ghost bows to you, every ride operates at your command, and every midnight show is performed in your honor.',
    requiredLevel: 42,
    requiredRides: 7,
  },
  {
    id: 'title_carnival_phantom_king',
    name: 'Carnival Phantom King',
    description: 'The absolute ruler of all haunted carnivals across every dimension. The Primordial Phantom itself recognizes your authority. You are fear incarnate.',
    requiredLevel: 50,
    requiredRides: 8,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: GC_PRIZES — 15 Cursed Prizes
// ═══════════════════════════════════════════════════════════════════

export const GC_PRIZES: readonly GCPrizeDef[] = [
  { id: 'prize_haunted_doll', name: 'Haunted Doll', description: 'A porcelain doll with eyes that follow you around the room. At night, it moves to face whichever door you entered through. It never speaks, but sometimes you hear it breathing.', rarity: 'common', cursePower: 5, specialAbility: 'Warns of approaching ghost hunters' },
  { id: 'prize_ghost_music_box', name: 'Ghost Music Box', description: 'A music box that plays a lullaby you have never heard but somehow know by heart. It winds itself at midnight and cannot be stopped until the song finishes.', rarity: 'common', cursePower: 8, specialAbility: 'Soothes ghosts, reducing their cooldowns' },
  { id: 'prize_shadow_puppet', name: 'Shadow Puppet Set', description: 'A set of jointed shadow puppets that move on their own when placed in moonlight. They perform scenes from the lives of whoever watches them.', rarity: 'common', cursePower: 6, specialAbility: 'Creates minor illusions to scare visitors' },
  { id: 'prize_cursed_compass', name: 'Cursed Compass', description: 'A compass that points toward the nearest ghost instead of north. Following its direction leads to increasingly haunted locations until you reach the carnival.', rarity: 'uncommon', cursePower: 20, specialAbility: 'Reveals hidden ghosts in the vicinity' },
  { id: 'prize_phantom_key', name: 'Phantom Key', description: 'A key that opens doors that should not exist. Each door leads to a different room in the haunted mansion, and some rooms contain doors of their own.', rarity: 'uncommon', cursePower: 25, specialAbility: 'Unlocks hidden areas within rides' },
  { id: 'prize_spectral_candle', name: 'Spectral Candle', description: 'A candle that burns with green flame and never goes out. Its light reveals invisible ghosts and makes ectoplasm glow with intense brightness.', rarity: 'uncommon', cursePower: 18, specialAbility: 'Doubles ectoplasm collection rate' },
  { id: 'prize_mirror_shard_pendant', name: 'Mirror Shard Pendant', description: 'A pendant made from a funhouse mirror shard. Looking into it shows a reflection of you from a parallel dimension where the carnival never burned down.', rarity: 'rare', cursePower: 50, specialAbility: 'Allows brief glimpses into alternate timelines' },
  { id: 'prize_cursed_jester_hat', name: 'Cursed Jester Hat', description: 'A jester hat that forces its wearer to smile constantly. The smile becomes genuine over time, and eventually the wearer forgets they were ever unhappy.', rarity: 'rare', cursePower: 55, specialAbility: 'Boosts jester ghost power by 30%' },
  { id: 'prize_void_marble', name: 'Void Marble', description: 'A perfectly black marble that seems to absorb all light. Staring into it reveals a tiny universe inside, and sometimes a ghost from that universe stares back.', rarity: 'rare', cursePower: 48, specialAbility: 'Stores extra ectoplasm beyond normal capacity' },
  { id: 'prize_haunted_top_hat', name: 'Haunted Top Hat', description: 'A ringmaster top hat that whispers instructions for running the midnight show. Following its advice always leads to spectacular but slightly dangerous results.', rarity: 'epic', cursePower: 100, specialAbility: 'Grants temporary control over phantom rides' },
  { id: 'prize_soul_jar', name: 'Soul Jar', description: 'A delicate glass jar containing what appears to be liquid starlight. It hums with contained energy and occasionally a voice murmurs from within.', rarity: 'epic', cursePower: 110, specialAbility: 'Can capture and store a ghost for later use' },
  { id: 'prize_shadow_cloak', name: 'Shadow Cloak', description: 'A cloak woven from living darkness. When worn, the wearer casts no shadow of their own — because the cloak IS their shadow, stretched into fabric.', rarity: 'epic', cursePower: 95, specialAbility: 'Grants near-invisibility to all ghosts' },
  { id: 'prize_phantom_crown', name: 'Phantom Crown', description: 'A crown that exists in a state of quantum superposition — it is both worn and unworn at the same time. Observing it directly causes it to flicker between states.', rarity: 'legendary', cursePower: 250, specialAbility: 'Commands all phantoms within the carnival' },
  { id: 'prize_eternal_ticket', name: 'Golden Eternal Ticket', description: 'A golden ticket that grants unlimited access to every ride, booth, and attraction in every haunted carnival across all dimensions for eternity.', rarity: 'legendary', cursePower: 300, specialAbility: 'Free entry to all rides, double rewards' },
  { id: 'prize_midnight_hourglass', name: 'Midnight Hourglass', description: 'An hourglass where the sand flows upward. When inverted, time in the immediate area flows backward for exactly one minute. No one remembers the reversal.', rarity: 'legendary', cursePower: 280, specialAbility: 'Can briefly rewind time during midnight events' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: GC_EVENTS — 12 Midnight Events
// ═══════════════════════════════════════════════════════════════════

export const GC_EVENTS: readonly GCEventDef[] = [
  {
    id: 'event_ghost_parade',
    name: 'Ghost Parade',
    description: 'Every ghost in the carnival emerges at midnight to march in a spectral parade. The parade forms whether summoned or not, and participants gain bonus ectoplasm for every ghost that joins.',
    severity: 2,
    duration: 300,
    effects: ['+20% ectoplasm regeneration', 'All ghosts gain temporary power boost', 'Visitor scare rate doubled'],
  },
  {
    id: 'event_midnight_fog',
    name: 'Midnight Fog Roll-In',
    description: 'A thick, unnatural fog rolls in from nowhere, blanketing the entire carnival. Visibility drops to near zero, and the fog carries whispers in languages that predate human speech.',
    severity: 3,
    duration: 600,
    effects: ['Reduced visitor visibility', 'Ghost abilities gain +15% range', 'Material gathering bonus', 'Eeriness increases'],
  },
  {
    id: 'event_carnival_fire',
    name: 'Echo of the Great Fire',
    description: 'The memory of the original carnival fire manifests as phantom flames that dance across every surface. The flames are cold and do not burn, but they reveal hidden paths and secret doors.',
    severity: 5,
    duration: 180,
    effects: ['Hidden areas revealed', 'Cursed prizes glow and can be found', 'Phantom ghosts become visible', 'Ectoplasm cost reduced'],
  },
  {
    id: 'event_shadow_invasion',
    name: 'Shadow Invasion',
    description: 'Living shadows from the world between worlds attempt to invade the carnival. They are hostile to both ghosts and visitors and must be repelled by using fright abilities.',
    severity: 7,
    duration: 900,
    effects: ['Hostile shadow entities appear', 'Fright ability damage tripled', 'Carnival reputation at risk', 'Defeating shadows drops rare materials'],
  },
  {
    id: 'event_fortune_night',
    name: 'Night of a Thousand Fortunes',
    description: 'Every fortune teller in the carnival receives simultaneous visions of the future. The visions are so powerful that prophecies manifest physically as floating text in the air.',
    severity: 3,
    duration: 480,
    effects: ['Fortune teller power doubled', 'Random prophecies grant bonuses', 'Visitor scare bonus', 'Rare material chance increased'],
  },
  {
    id: 'event_jester_rebellion',
    name: 'Jester Night Rebellion',
    description: 'All jester ghosts refuse to perform and instead pull elaborate pranks on the entire carnival. Rides malfunction, booths rearrange themselves, and visitors find their shoes filled with ectoplasm.',
    severity: 4,
    duration: 360,
    effects: ['Jester ghosts become uncontrollable', 'Random prank events occur', 'Trick ability cost halved', 'Visitor amusement increased, fear decreased'],
  },
  {
    id: 'event_silent_hollow',
    name: 'The Silent Hollow',
    description: 'A mime ghost of unimaginable power arrives and silences the entire carnival. No sounds can be made — not screams, not music, not even ghost whispers. The silence lasts exactly one hour.',
    severity: 6,
    duration: 720,
    effects: ['All sound abilities disabled', 'Mime ghosts gain supreme power', 'Illusion abilities strengthened', 'Visitors experience deep existential dread'],
  },
  {
    id: 'event_feast_of_shades',
    name: 'Feast of Shades',
    description: 'Every food vendor ghost simultaneously begins cooking the most elaborate spectral feast in carnival history. The aromas attract visitors from miles around, but the food has unusual effects.',
    severity: 4,
    duration: 420,
    effects: ['Food vendor power doubled', 'Visitor attraction rate tripled', 'Ectoplasm food drops everywhere', 'Eating phantom food grants random buffs'],
  },
  {
    id: 'event_phantom_rain',
    name: 'Phantom Rain',
    description: 'Instead of water, ectoplasm rains from the sky for exactly one hour. Everything it touches becomes slightly haunted — trees whisper, benches groan, and the ground becomes translucent.',
    severity: 3,
    duration: 600,
    effects: ['Ectoplasm collection rate 500%', 'Everything becomes haunted', 'Ghost summoning chances increased', 'Visitors become more suggestible'],
  },
  {
    id: 'event_dance_macabre',
    name: 'Dance Macabre',
    description: 'Every masked dancer ghost begins the Dance Macabre, forcing all visitors and ghosts in the carnival to join in a massive spectral waltz that lasts until dawn approaches.',
    severity: 5,
    duration: 540,
    effects: ['All entities forced to dance', 'Masked dancer power tripled', 'Booth upgrades complete during dance', 'Carnival reputation surges'],
  },
  {
    id: 'event_void_entrance',
    name: 'The Void Opens',
    description: 'A rift to the void opens in the center of the carnival. Primordial phantoms peer through, and the boundary between life and death becomes dangerously thin.',
    severity: 8,
    duration: 180,
    effects: ['Legendary summon chance 10x', 'Void materials appear', 'All ghost power doubled', 'Carnival reputation at extreme risk', 'Rare prizes materialize'],
  },
  {
    id: 'event_midnight_closing',
    name: 'Midnight Closing Ceremony',
    description: 'The phantom ringmaster announces the midnight closing ceremony. Every ghost performs their greatest feat, and visitors who survive until dawn receive legendary rewards.',
    severity: 9,
    duration: 1200,
    effects: ['All ghost abilities empowered', 'Ride rewards tripled', 'Achievement progress accelerated', 'Ectoplasm regeneration maximized', 'Final rewards at dawn'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: RIDE-MATERIAL MAPPING
// ═══════════════════════════════════════════════════════════════════

interface GCRideMaterialMap {
  readonly rideId: string
  readonly materialIds: readonly string[]
  readonly bonusMaterialIds: readonly string[]
}

const GC_RIDE_MATERIAL_MAP: readonly GCRideMaterialMap[] = [
  { rideId: 'phantom_coaster', materialIds: ['admission_ticket', 'ghost_token', 'ectoplasm_drip', 'cotton_candy_wisp', 'cobweb_bundle', 'carousel_horse_braid'], bonusMaterialIds: ['haunted_marble'] },
  { rideId: 'funhouse_mirrors', materialIds: ['jester_bell', 'mirror_shard', 'shadow_cloth', 'fortune_card'], bonusMaterialIds: ['cursed_mask'] },
  { rideId: 'haunted_mansion', materialIds: ['phantom_scroll', 'carnival_fire_ember', 'soul_lantern'], bonusMaterialIds: ['haunted_marble', 'ringmaster_whip'] },
  { rideId: 'ghost_ferris_wheel', materialIds: ['carousel_horse_braid', 'dark_ferris_gem'], bonusMaterialIds: ['cotton_candy_wisp', 'ectoplasm_drip'] },
  { rideId: 'dark_carousel', materialIds: ['shadow_cloth', 'cursed_mask'], bonusMaterialIds: ['midnight_popcorn'] },
  { rideId: 'tunnel_of_terror', materialIds: ['terror_vial', 'void_ticket', 'shadow_silk'], bonusMaterialIds: ['soul_lantern'] },
  { rideId: 'spooky_tent', materialIds: ['fortune_card', 'midnight_popcorn', 'midnight_ink', 'soul_weavers_spindle'], bonusMaterialIds: ['phantom_scroll'] },
  { rideId: 'shadow_big_top', materialIds: ['genesis_ghost_essence', 'eternal_ticket', 'void_ringmaster_mask', 'midnight_carnival_blueprint', 'phantom_throne_fragment', 'cursed_music_box', 'phantom_crown'], bonusMaterialIds: ['ringmaster_whip', 'carnival_fire_ember'] },
]

function gcGetRideMaterialMap(rideId: string): GCRideMaterialMap | null {
  return GC_RIDE_MATERIAL_MAP.find((m) => m.rideId === rideId) ?? null
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const useGCStore = create<GCFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      summonedGhosts: [] as GCSummonedGhost[],
      collectedMaterials: {} as Record<string, number>,
      booths: [] as GCOwnedBooth[],
      achievements: [] as string[],
      currentTitle: 'title_lost_visitor',
      collectedPrizes: [] as string[],
      unlockedRides: ['phantom_coaster'] as string[],
      ghostLevel: 1,
      ghostExp: 0,
      tickets: GC_INITIAL_TICKETS,
      ectoplasm: GC_INITIAL_ECTOPLASM,
      totalSummoned: 0,
      totalScared: 0,
      totalUpgraded: 0,
      totalHaunted: 0,
      totalTricks: 0,
      activeEventId: null as string | null,
      eventTimer: 0,
      carnival: {
        reputation: 100,
        maxReputation: 100,
        eeriness: 0,
        lastIlluminatedAt: null,
      },
      activeRideId: 'phantom_coaster',

      // ── gcSummonGhost ──────────────────────────────────────────
      gcSummonGhost: (ghostId: string): boolean => {
        const state = get()
        const ghostDef = GC_GHOSTS.find((g) => g.id === ghostId)
        if (!ghostDef) return false
        if (state.summonedGhosts.some((g) => g.ghostDefId === ghostId)) return false

        const summonCost = Math.floor(10 * gcRarityMultiplier(ghostDef.rarity))
        if (state.ectoplasm < summonCost) return false

        const newXp = state.ghostExp + Math.floor(ghostDef.basePower * 0.5)
        const newLevel = gcLevelFromXp(newXp)
        set((prev) => ({
          summonedGhosts: [
            ...prev.summonedGhosts,
            {
              id: gcGenerateId(),
              ghostDefId: ghostId,
              name: ghostDef.name,
              level: 1,
              currentHP: 50 + ghostDef.basePower,
              maxHP: 50 + ghostDef.basePower,
              power: ghostDef.basePower,
              haunted: false,
              hauntCount: 0,
              acquiredAt: Date.now(),
            },
          ],
          ectoplasm: Math.max(0, prev.ectoplasm - summonCost),
          ghostExp: newXp,
          ghostLevel: newLevel,
          tickets: prev.tickets + Math.floor(ghostDef.basePower * 0.5),
          totalSummoned: prev.totalSummoned + 1,
        }))
        return true
      },

      // ── gcScareVisitor ─────────────────────────────────────────
      gcScareVisitor: (ghostId: string): number => {
        const state = get()
        const ghost = state.summonedGhosts.find((g) => g.id === ghostId)
        if (!ghost) return 0
        if (ghost.currentHP <= 0) return 0
        if (state.ectoplasm < 3) return 0

        const ghostDef = GC_GHOSTS.find((d) => d.id === ghost.ghostDefId)
        if (!ghostDef) return 0

        const typeBonus = gcGetGhostTypeBonus(ghostDef.ghostType)
        const scarePower = Math.floor(ghost.power * (1 + ghost.level * 0.15) * (1 + typeBonus.scareBonus * 0.01))
        const ticketsEarned = Math.floor(scarePower * gcRarityMultiplier(ghostDef.rarity))

        set((prev) => ({
          ectoplasm: Math.max(0, prev.ectoplasm - 3),
          tickets: prev.tickets + ticketsEarned,
          totalScared: prev.totalScared + 1,
          carnival: {
            ...prev.carnival,
            eeriness: Math.min(100, prev.carnival.eeriness + 1),
          },
        }))
        return ticketsEarned
      },

      // ── gcBuildBooth ───────────────────────────────────────────
      gcBuildBooth: (boothId: string): boolean => {
        const state = get()
        const boothDef = GC_BOOTH.find((b) => b.id === boothId)
        if (!boothDef) return false

        const owned = state.booths.find((b) => b.boothDefId === boothId)
        if (!owned) {
          if (state.tickets < boothDef.baseCost) return false
          const newXp = state.ghostExp + 20
          const newLevel = gcLevelFromXp(newXp)
          set((prev) => ({
            booths: [
              ...prev.booths,
              {
                id: gcGenerateId(),
                boothDefId: boothId,
                level: 1,
                built: true,
              },
            ],
            tickets: prev.tickets - boothDef.baseCost,
            ghostExp: newXp,
            ghostLevel: newLevel,
            totalUpgraded: prev.totalUpgraded + 1,
          }))
          return true
        }

        if (owned.level >= boothDef.maxLevel) return false
        const upgradeCost = Math.floor(boothDef.baseCost * Math.pow(boothDef.costMultiplier, owned.level))
        if (state.tickets < upgradeCost) return false

        const newXp = state.ghostExp + 15
        const newLevel = gcLevelFromXp(newXp)
        set((prev) => ({
          booths: prev.booths.map((b) =>
            b.id === owned.id
              ? { ...b, level: b.level + 1 }
              : b
          ),
          tickets: prev.tickets - upgradeCost,
          ghostExp: newXp,
          ghostLevel: newLevel,
          totalUpgraded: prev.totalUpgraded + 1,
        }))
        return true
      },

      // ── gcUseAbility ───────────────────────────────────────────
      gcUseAbility: (abilityId: string): boolean => {
        const state = get()
        const abilityDef = GC_ABILITIES.find((a) => a.id === abilityId)
        if (!abilityDef) return false
        if (state.ectoplasm < abilityDef.cooldown) return false

        const newXp = state.ghostExp + abilityDef.power
        const newLevel = gcLevelFromXp(newXp)
        set((prev) => ({
          ectoplasm: Math.max(0, prev.ectoplasm - abilityDef.cooldown),
          ghostExp: newXp,
          ghostLevel: newLevel,
          tickets: prev.tickets + Math.floor(abilityDef.power * 2),
        }))
        return true
      },

      // ── gcTriggerMidnightEvent ─────────────────────────────────
      gcTriggerMidnightEvent: (eventId: string): boolean => {
        const state = get()
        const eventDef = GC_EVENTS.find((e) => e.id === eventId)
        if (!eventDef) return false
        if (state.activeEventId !== null) return false
        if (state.ectoplasm < 50) return false

        set((prev) => ({
          activeEventId: eventId,
          eventTimer: eventDef.duration,
          ectoplasm: Math.max(0, prev.ectoplasm - 50),
          carnival: {
            ...prev.carnival,
            eeriness: Math.min(100, prev.carnival.eeriness + eventDef.severity * 5),
          },
        }))
        return true
      },

      // ── gcCollectPrize ─────────────────────────────────────────
      gcCollectPrize: (prizeId: string): boolean => {
        const state = get()
        const prizeDef = GC_PRIZES.find((p) => p.id === prizeId)
        if (!prizeDef) return false
        if (state.collectedPrizes.includes(prizeId)) return false

        const cost = Math.floor(20 * gcRarityMultiplier(prizeDef.rarity))
        if (state.tickets < cost) return false

        set((prev) => ({
          collectedPrizes: [...prev.collectedPrizes, prizeId],
          tickets: prev.tickets - cost,
        }))
        return true
      },

      // ── gcEnterRide ────────────────────────────────────────────
      gcEnterRide: (rideId: string): boolean => {
        const state = get()
        const rideDef = GC_RIDES.find((r) => r.id === rideId)
        if (!rideDef) return false
        if (!state.unlockedRides.includes(rideId)) return false
        if (state.ghostLevel < rideDef.minLevel) return false

        const newXp = state.ghostExp + rideDef.hauntPower * 2
        const newLevel = gcLevelFromXp(newXp)
        set((prev) => ({
          activeRideId: rideId,
          ghostExp: newXp,
          ghostLevel: newLevel,
          tickets: prev.tickets + rideDef.hauntPower,
          ectoplasm: prev.ectoplasm + Math.floor(rideDef.hauntPower * 0.5),
        }))
        return true
      },

      // ── gcVisitBooth ───────────────────────────────────────────
      gcVisitBooth: (boothId: string): number => {
        const state = get()
        const boothDef = GC_BOOTH.find((b) => b.id === boothId)
        if (!boothDef) return 0
        const owned = state.booths.find((b) => b.boothDefId === boothId)
        if (!owned) return 0
        if (state.ectoplasm < 2) return 0

        const materialReward = Math.floor(owned.level * gcRarityMultiplier(boothDef.baseCost > 1000 ? 'rare' : 'common'))
        const randomMaterial = GC_MATERIALS[Math.floor(Math.random() * GC_MATERIALS.length)]

        set((prev) => {
          const updatedMaterials = { ...prev.collectedMaterials }
          updatedMaterials[randomMaterial.id] = (updatedMaterials[randomMaterial.id] || 0) + materialReward
          return {
            ectoplasm: Math.max(0, prev.ectoplasm - 2),
            collectedMaterials: updatedMaterials,
          }
        })
        return materialReward
      },

      // ── gcPerformTrick ─────────────────────────────────────────
      gcPerformTrick: (ghostId: string): boolean => {
        const state = get()
        const ghost = state.summonedGhosts.find((g) => g.id === ghostId)
        if (!ghost) return false
        if (ghost.currentHP <= 0) return false
        if (state.ectoplasm < 5) return false

        const ghostDef = GC_GHOSTS.find((d) => d.id === ghost.ghostDefId)
        if (!ghostDef) return false

        const typeBonus = gcGetGhostTypeBonus(ghostDef.ghostType)
        const trickPower = Math.floor(ghost.power * (1 + ghost.level * 0.15) * (1 + typeBonus.trickBonus * 0.01))
        const ticketBonus = Math.floor(trickPower * 0.3)

        const newXp = state.ghostExp + Math.floor(trickPower * 0.5)
        const newLevel = gcLevelFromXp(newXp)
        set((prev) => ({
          ectoplasm: Math.max(0, prev.ectoplasm - 5),
          tickets: prev.tickets + ticketBonus,
          ghostExp: newXp,
          ghostLevel: newLevel,
          totalTricks: prev.totalTricks + 1,
          carnival: {
            ...prev.carnival,
            reputation: Math.min(prev.carnival.maxReputation, prev.carnival.reputation + 2),
          },
        }))
        return true
      },

      // ── gcIlluminateLights ─────────────────────────────────────
      gcIlluminateLights: (amount: number): boolean => {
        const state = get()
        if (state.carnival.reputation <= 0) return false
        if (state.ectoplasm < 5) return false

        set((prev) => ({
          ectoplasm: Math.max(0, prev.ectoplasm - 5),
          carnival: {
            ...prev.carnival,
            eeriness: Math.max(0, prev.carnival.eeriness - amount),
            reputation: Math.min(prev.carnival.maxReputation, prev.carnival.reputation + Math.floor(amount * 0.5)),
            lastIlluminatedAt: Date.now(),
          },
        }))
        return true
      },
    }),
    {
      name: 'ghost-carnival-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: HOOK — useGhostCarnival
// ═══════════════════════════════════════════════════════════════════

export default function useGhostCarnival() {
  const store = useGCStore()

  // ── Getter: Ride Details, Material Inventory, Summoned Ghosts, Booth List, Total Power ──
  const {
    gcGetRideDetails,
    gcGetMaterialInventory,
    gcGetSummonedGhosts,
    gcGetBoothList,
    gcGetTotalPower,
  } = useMemo(() => {
    const gcGetRideDetails = GC_RIDES.map((ride) => ({
      ...ride,
      unlocked: store.unlockedRides.includes(ride.id),
      active: store.activeRideId === ride.id,
      levelMet: store.ghostLevel >= ride.minLevel,
      canAfford: store.tickets >= ride.unlockCost,
    }))

    const gcGetMaterialInventory = GC_MATERIALS.map((mat) => ({
      ...mat,
      owned: store.collectedMaterials[mat.id] || 0,
      rarityColor: gcRarityColor(mat.rarity),
    }))

    const gcGetSummonedGhosts = store.summonedGhosts.map((g) => {
      const def = GC_GHOSTS.find((d) => d.id === g.ghostDefId)
      return {
        ...g,
        def,
        typeColor: def ? gcGhostTypeColor(def.ghostType) : GC_COLOR_GHOST_WHITE,
        rarityColor: def ? gcRarityColor(def.rarity) : GC_COLOR_SHADOW_GRAY,
        totalPower: Math.floor(g.power * (1 + g.level * 0.15) * (1 + g.hauntCount * 0.25)),
        hauntTier: gcGetHauntTier(g.hauntCount),
      }
    })

    const gcGetBoothList = GC_BOOTH.map((def) => {
      const owned = store.booths.find((b) => b.boothDefId === def.id)
      const level = owned ? owned.level : 0
      return {
        ...def,
        owned: !!owned,
        level,
        upgradeCost: level >= def.maxLevel ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, level)),
        maxed: level >= def.maxLevel,
      }
    })

    let ghostPower = 0
    for (const g of store.summonedGhosts) {
      const def = GC_GHOSTS.find((d) => d.id === g.ghostDefId)
      if (!def) continue
      const rarityMult = gcRarityMultiplier(def.rarity)
      ghostPower += Math.floor(
        g.power * rarityMult * (1 + g.level * 0.15) * (1 + g.hauntCount * 0.25)
      )
    }
    const boothPower = store.booths.reduce(
      (sum, b) => sum + b.level * 10,
      0
    )
    const prizePower = store.collectedPrizes.reduce((sum, pId) => {
      const prize = GC_PRIZES.find((p) => p.id === pId)
      return sum + (prize ? prize.cursePower : 0)
    }, 0)
    const gcGetTotalPower = { ghostPower, boothPower, prizePower, total: ghostPower + boothPower + prizePower }

    return { gcGetRideDetails, gcGetMaterialInventory, gcGetSummonedGhosts, gcGetBoothList, gcGetTotalPower }
  }, [store])

  // ── Getter: Event Status ──────────────────────────────────────
  const gcGetEventStatus = useMemo(() => {
    if (!store.activeEventId) {
      return { active: false, event: null, timer: 0, severity: 0 }
    }
    const event = GC_EVENTS.find((e) => e.id === store.activeEventId)
    return {
      active: true,
      event: event || null,
      timer: store.eventTimer,
      severity: event ? event.severity : 0,
    }
  }, [store.activeEventId, store.eventTimer])

  // ── Getter: Active Event ──────────────────────────────────────
  const gcGetActiveEvent = useMemo(() => {
    if (!store.activeEventId) return null
    return GC_EVENTS.find((e) => e.id === store.activeEventId) || null
  }, [store.activeEventId])

  // ── Getter: Next Title ────────────────────────────────────────
  const gcGetNextTitle = useMemo(() => {
    const currentTitle = GC_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitle ? GC_TITLES.indexOf(currentTitle) : -1
    if (currentIndex >= GC_TITLES.length - 1) return null
    return GC_TITLES[currentIndex + 1]
  }, [store.currentTitle])

  // ── Getter: Rarity Summary ────────────────────────────────────
  const gcGetRaritySummary = useMemo(() => {
    const summary: Record<GCRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const g of store.summonedGhosts) {
      const def = GC_GHOSTS.find((d) => d.id === g.ghostDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const pId of store.collectedPrizes) {
      const prize = GC_PRIZES.find((p) => p.id === pId)
      if (prize) {
        summary[prize.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Ride Summary ──────────────────────────────────────
  const gcGetRideSummary = useMemo(() => {
    const totalRides = GC_RIDES.length
    const unlocked = store.unlockedRides.length
    return {
      totalRides,
      unlocked,
      percent: Math.floor((unlocked / totalRides) * 100),
      allUnlocked: unlocked >= totalRides,
    }
  }, [store.unlockedRides])

  // ── Getter: Unlocked Achievements ─────────────────────────────
  const gcGetUnlockedAchievements = useMemo(() => {
    const unlocked: GCAchievementDef[] = []
    for (const ach of GC_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      }
    }
    return { unlocked, total: GC_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ────────────────────────────────────
  const gcGetTitleProgress = useMemo(() => {
    return GC_TITLES.map((title) => ({
      ...title,
      unlocked:
        store.ghostLevel >= title.requiredLevel &&
        store.unlockedRides.length >= title.requiredRides,
      active: store.currentTitle === title.id,
      levelMet: store.ghostLevel >= title.requiredLevel,
      ridesMet: store.unlockedRides.length >= title.requiredRides,
    }))
  }, [store.currentTitle, store.ghostLevel, store.unlockedRides])

  // ── Getter: Collected Prizes Detail ───────────────────────────
  const gcGetCollectedPrizes = useMemo(() => {
    return GC_PRIZES.map((prize) => ({
      ...prize,
      collected: store.collectedPrizes.includes(prize.id),
      rarityColor: gcRarityColor(prize.rarity),
      canAfford:
        store.tickets >= Math.floor(20 * gcRarityMultiplier(prize.rarity)) &&
        !store.collectedPrizes.includes(prize.id),
    }))
  }, [store])

  // ── Getter: Carnival Health ───────────────────────────────────
  const gcGetCarnivalHealth = useMemo(() => {
    const { reputation, maxReputation, eeriness, lastIlluminatedAt } = store.carnival
    return {
      reputation,
      maxReputation,
      eeriness,
      reputationPercent: Math.floor((reputation / maxReputation) * 100),
      isSpooky: eeriness > 50,
      isOverwhelming: eeriness > 80,
      lastIlluminatedAt,
    }
  }, [store.carnival])

  // ── Getter: Ghost Summoning Costs ─────────────────────────────
  const gcGetSummoningCosts = useMemo(() => {
    return GC_GHOSTS.filter(
      (g) => !store.summonedGhosts.some((s) => s.ghostDefId === g.id)
    ).map((ghost) => ({
      ...ghost,
      summonCost: Math.floor(10 * gcRarityMultiplier(ghost.rarity)),
      canAfford:
        store.ectoplasm >= Math.floor(10 * gcRarityMultiplier(ghost.rarity)),
      typeColor: gcGhostTypeColor(ghost.ghostType),
      rarityColor: gcRarityColor(ghost.rarity),
    }))
  }, [store])

  // ── Level Progress ────────────────────────────────────────────
  const gcLevelProgress = useMemo(() => {
    const current = gcXpForLevel(store.ghostLevel)
    return {
      level: store.ghostLevel,
      currentXp: store.ghostExp,
      xpToNext: current,
      maxLevel: store.ghostLevel >= GC_MAX_LEVEL,
      progressPercent:
        current > 0 ? Math.min(100, Math.floor((store.ghostExp / current) * 100)) : 0,
    }
  }, [store.ghostLevel, store.ghostExp])

  // ── Getter: Ability List ──────────────────────────────────────
  const gcGetAbilityList = useMemo(() => {
    return GC_ABILITIES.map((ability) => ({
      ...ability,
      canUse: store.ectoplasm >= ability.cooldown,
      schoolColor: gcSchoolColor(ability.school),
    }))
  }, [store.ectoplasm])

  // ── Getter: Event List ────────────────────────────────────────
  const gcGetEventList = useMemo(() => {
    return GC_EVENTS.map((event) => ({
      ...event,
      canTrigger: store.activeEventId === null && store.ectoplasm >= 50,
      isActive: store.activeEventId === event.id,
    }))
  }, [store.activeEventId, store.ectoplasm])

  // ── Getter: Stats Summary & Ghost Count by Type ───────────────
  const { gcGetStatsSummary, gcGetGhostCountByType } = useMemo(() => {
    const ghostCountByType: Record<GCGhostType, number> = {
      Phantom: 0,
      Jester: 0,
      Mime: 0,
      'Fortune Teller': 0,
      'Ride Operator': 0,
      'Food Vendor': 0,
      'Masked Dancer': 0,
    }
    for (const g of store.summonedGhosts) {
      const def = GC_GHOSTS.find((d) => d.id === g.ghostDefId)
      if (def) {
        ghostCountByType[def.ghostType] += 1
      }
    }

    const statsSummary = {
      totalGhosts: store.summonedGhosts.length,
      totalMaterials: Object.values(store.collectedMaterials).reduce((s, v) => s + v, 0),
      totalBooths: store.booths.length,
      totalPrizes: store.collectedPrizes.length,
      totalRides: store.unlockedRides.length,
      avgGhostLevel:
        store.summonedGhosts.length > 0
          ? Math.floor(
              store.summonedGhosts.reduce((s, g) => s + g.level, 0) / store.summonedGhosts.length
            )
          : 0,
      totalHaunts: store.summonedGhosts.reduce((s, g) => s + g.hauntCount, 0),
    }

    return { gcGetStatsSummary: statsSummary, gcGetGhostCountByType: ghostCountByType }
  }, [store])

  // ── Getter: Upgrade Costs ─────────────────────────────────────
  const gcGetUpgradeCosts = useMemo(() => {
    return store.booths.map((b) => {
      const def = GC_BOOTH.find((d) => d.id === b.boothDefId)
      if (!def) return { ...b, nextCost: 0, maxed: b.level >= def.maxLevel }
      const nextCost = b.level >= def.maxLevel ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, b.level))
      return { ...b, def, nextCost, maxed: b.level >= def.maxLevel }
    })
  }, [store.booths])

  // ── Getter: Prize Curse Bonus ─────────────────────────────────
  const gcGetPrizeCurseBonus = useMemo(() => {
    let totalCursePower = 0
    for (const pId of store.collectedPrizes) {
      const prize = GC_PRIZES.find((p) => p.id === pId)
      if (prize) {
        totalCursePower += prize.cursePower
      }
    }
    return {
      totalCursePower,
      prizeCount: store.collectedPrizes.length,
      hasLegendaryPrize: store.collectedPrizes.some((pId) => {
        const prize = GC_PRIZES.find((p) => p.id === pId)
        return prize && prize.rarity === 'legendary'
      }),
    }
  }, [store.collectedPrizes])

  // ── Getter: Haunt Tier Details ────────────────────────────────
  const gcGetHauntTierDetails = useMemo(() => {
    return store.summonedGhosts.map((g) => {
      const def = GC_GHOSTS.find((d) => d.id === g.ghostDefId)
      const hauntTier = gcGetHauntTier(g.hauntCount)
      return {
        ...g,
        def,
        hauntTier,
        nextTier: g.hauntCount < 5 ? gcGetHauntTier(g.hauntCount + 1) : null,
        canHaunt: g.hauntCount < 5,
        hauntCost: Math.floor(50 * Math.pow(2, g.hauntCount)),
        hauntEctoCost: Math.floor(50 * Math.pow(2, g.hauntCount)) * 2,
      }
    })
  }, [store])

  // ── Getter: Ride Materials Available ──────────────────────────
  const gcGetRideMaterials = useMemo(() => {
    if (!store.activeRideId) return { materials: [], bonusMaterials: [] }
    const rideMap = gcGetRideMaterialMap(store.activeRideId)
    if (!rideMap) return { materials: [], bonusMaterials: [] }

    const materials = rideMap.materialIds
      .map((mId: string) => GC_MATERIALS.find((m) => m.id === mId))
      .filter((m): m is GCMaterialDef => m !== undefined)

    const bonusMaterials = rideMap.bonusMaterialIds
      .map((mId: string) => GC_MATERIALS.find((m) => m.id === mId))
      .filter((m): m is GCMaterialDef => m !== undefined)

    return { materials, bonusMaterials }
  }, [store.activeRideId])

  // ── Getter: Ectoplasm Efficiency, Ghost Type Summary, Reputation Details ──
  const {
    gcGetEctoplasmEfficiency,
    gcGetGhostTypeSummary,
    gcGetReputationDetails,
  } = useMemo(() => {
    const ectoBoothBonus = store.booths.reduce((sum, b) => {
      return sum + gcGetBoothBonus(b.boothDefId, b.level)
    }, 0)
    const ectoPrizeBonus = store.collectedPrizes.reduce((sum, pId) => {
      const prize = GC_PRIZES.find((p) => p.id === pId)
      return sum + (prize ? Math.floor(prize.cursePower * 0.2) : 0)
    }, 0)
    const gcGetEctoplasmEfficiency = {
      baseRegen: 1,
      boothBonus: ectoBoothBonus,
      prizeBonus: ectoPrizeBonus,
      totalRegen: 1 + ectoBoothBonus + ectoPrizeBonus,
    }

    const typeList = Object.keys(GC_GHOST_TYPE_BONUSES) as GCGhostType[]
    const gcGetGhostTypeSummary = typeList.map((type) => {
      const ghostsOfType = store.summonedGhosts.filter((g) => {
        const def = GC_GHOSTS.find((d) => d.id === g.ghostDefId)
        return def && def.ghostType === type
      })
      const bonus = gcGetGhostTypeBonus(type)
      return {
        type,
        count: ghostsOfType.length,
        color: gcGhostTypeColor(type),
        scareBonus: bonus.scareBonus,
        hauntBonus: bonus.hauntBonus,
        trickBonus: bonus.trickBonus,
      }
    })

    const { reputation, maxReputation, eeriness } = store.carnival
    const repRideBonus = store.unlockedRides.length * 5
    const repGhostBonus = store.summonedGhosts.length * 2
    const repBoothBonus = store.booths.reduce((sum, b) => sum + b.level, 0)
    const gcGetReputationDetails = {
      reputation,
      maxReputation,
      eeriness,
      rideBonus: repRideBonus,
      ghostBonus: repGhostBonus,
      boothBonus: repBoothBonus,
      totalBonus: repRideBonus + repGhostBonus + repBoothBonus,
      isHealthy: reputation > eeriness,
      needsIllumination: eeriness > reputation * 0.8,
    }

    return { gcGetEctoplasmEfficiency, gcGetGhostTypeSummary, gcGetReputationDetails }
  }, [store])

  // ── Assemble gcAPI ────────────────────────────────────────────
  const gcAPI = {
    // Constants
    GC_GHOSTS,
    GC_RIDES,
    GC_MATERIALS,
    GC_BOOTH,
    GC_ABILITIES,
    GC_ACHIEVEMENTS,
    GC_TITLES,
    GC_PRIZES,
    GC_EVENTS,
    GC_COLOR_PHANTOM_PURPLE,
    GC_COLOR_MIDNIGHT_BLUE,
    GC_COLOR_EERIE_GREEN,
    GC_COLOR_CARNIVAL_RED,
    GC_COLOR_GOLDEN_TICKET,
    GC_COLOR_GHOST_WHITE,
    GC_COLOR_SHADOW_GRAY,
    GC_COLOR_NEON_PINK,

    // State
    summonedGhosts: store.summonedGhosts,
    collectedMaterials: store.collectedMaterials,
    booths: store.booths,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    collectedPrizes: store.collectedPrizes,
    unlockedRides: store.unlockedRides,
    ghostLevel: store.ghostLevel,
    ghostExp: store.ghostExp,
    tickets: store.tickets,
    ectoplasm: store.ectoplasm,
    totalSummoned: store.totalSummoned,
    totalScared: store.totalScared,
    totalUpgraded: store.totalUpgraded,
    totalHaunted: store.totalHaunted,
    totalTricks: store.totalTricks,
    activeEventId: store.activeEventId,
    eventTimer: store.eventTimer,
    carnival: store.carnival,
    activeRideId: store.activeRideId,

    // Actions
    gcSummonGhost: store.gcSummonGhost,
    gcScareVisitor: store.gcScareVisitor,
    gcBuildBooth: store.gcBuildBooth,
    gcUseAbility: store.gcUseAbility,
    gcTriggerMidnightEvent: store.gcTriggerMidnightEvent,
    gcCollectPrize: store.gcCollectPrize,
    gcEnterRide: store.gcEnterRide,
    gcVisitBooth: store.gcVisitBooth,
    gcPerformTrick: store.gcPerformTrick,
    gcIlluminateLights: store.gcIlluminateLights,

    // Getters
    gcGetRideDetails,
    gcGetMaterialInventory,
    gcGetSummonedGhosts,
    gcGetBoothList,
    gcGetTotalPower,
    gcGetEventStatus,
    gcGetActiveEvent,
    gcGetNextTitle,
    gcGetRaritySummary,
    gcGetRideSummary,
    gcGetUnlockedAchievements,
    gcGetTitleProgress,
    gcGetCollectedPrizes,
    gcGetCarnivalHealth,
    gcGetSummoningCosts,
    gcLevelProgress,
    gcGetAbilityList,
    gcGetEventList,
    gcGetStatsSummary,
    gcGetGhostCountByType,
    gcGetUpgradeCosts,
    gcGetPrizeCurseBonus,
    gcGetHauntTierDetails,
    gcGetRideMaterials,
    gcGetEctoplasmEfficiency,
    gcGetGhostTypeSummary,
    gcGetReputationDetails,
  }

  return gcAPI
}
