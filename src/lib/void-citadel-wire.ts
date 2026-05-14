/**
 * Void Citadel Wire — Void Citadel (虚空堡垒) feature module
 *
 * A dark interdimensional fortress floating in the void. Players command 35 void
 * wardens across 5 rarity tiers and 7 species, claim 8 citadel locations,
 * collect 30 void materials, build 25 citadel structures, master 22 void abilities,
 * earn 18 achievements, unlock 8 progression titles (Void Initiate → Dimension
 * Overlord), activate 15 legendary artifacts, and respond to 12 random void events
 * — backed by a Zustand store with persist middleware.
 *
 * Storage key: void-citadel-wire
 * Prefix: vc / VC_
 * Color theme: void purple #6C3483, abyss black #1C1C1C, rift teal #1ABC9C, entropy red #E74C3C
 */

import { useEffect, useMemo, useRef } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type VcRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type VcSpecies =
  | 'shadow_wraith'
  | 'void_phantom'
  | 'abyss_knight'
  | 'null_walker'
  | 'dimension_hunter'
  | 'rift_keeper'
  | 'entropy_spirit'

export type VcAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon'

export type VcStructureBonusType =
  | 'summonBonus'
  | 'powerBonus'
  | 'energyRegen'
  | 'materialBonus'
  | 'defenseBonus'
  | 'capacityBonus'
  | 'citadelBonus'
  | 'abilityBonus'

export type VcMaterialCategory =
  | 'void'
  | 'shadow'
  | 'abyss'
  | 'rift'
  | 'dimension'
  | 'entropy'
  | 'null'

// ---- Warden Definition ----

export interface VcWardenDef {
  readonly id: string
  readonly name: string
  readonly species: VcSpecies
  readonly rarity: VcRarity
  readonly power: number
  readonly defense: number
  readonly cost: number
  readonly description: string
  readonly lore: string
}

// ---- Citadel Definition ----

export interface VcCitadelDef {
  readonly id: string
  readonly name: string
  readonly level: number
  readonly resources: string[]
  readonly capacity: number
  readonly description: string
  readonly lore: string
}

// ---- Material Definition ----

export interface VcMaterialDef {
  readonly id: string
  readonly name: string
  readonly rarity: VcRarity
  readonly description: string
  readonly lore: string
  readonly value: number
  readonly category: VcMaterialCategory
}

// ---- Structure Definition ----

export interface VcStructureDef {
  readonly id: string
  readonly name: string
  readonly maxLevel: number
  readonly description: string
  readonly lore: string
  readonly costPerLevel: number
  readonly bonusType: VcStructureBonusType
  readonly bonusPerLevel: number
}

// ---- Ability Definition ----

export interface VcAbilityDef {
  readonly id: string
  readonly name: string
  readonly category: VcAbilityCategory
  readonly power: number
  readonly cooldown: number
  readonly description: string
  readonly lore: string
  readonly requiredLevel: number
}

// ---- Achievement Definition ----

export interface VcAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly lore: string
  readonly condition: string
  readonly targetValue: number
  readonly rewardXp: number
  readonly rewardPower: number
}

// ---- Title Definition ----

export interface VcTitleDef {
  readonly id: string
  readonly name: string
  readonly requirement: string
  readonly lore: string
  readonly bonusPercent: number
}

// ---- Artifact Definition ----

export interface VcArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly lore: string
  readonly bonus: string
  readonly power: number
  readonly rarity: VcRarity
}

// ---- Event Definition ----

export interface VcEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly lore: string
  readonly effect: string
  readonly severity: number
  readonly rewardMaterialId: string | null
  readonly rewardMaterialCount: number
}

// ---- Runtime State Types ----

export interface VcWardenState {
  summoned: boolean
  level: number
  exp: number
  nickname: string
  timesUsed: number
}

export interface VcCitadelState {
  claimed: boolean
  level: number
  garrisonCount: number
  explorationPercent: number
  lastVisitedAt: number
  totalResourcesGathered: number
}

export interface VcAbilityState {
  unlocked: boolean
  timesUsed: number
  lastUsedAt: number
  cooldownEnd: number
}

export interface VcEventLogEntry {
  eventId: string
  triggeredAt: number
  resolved: boolean
  rewardGained: number
}

export interface VcStats {
  totalSummoned: number
  totalCitadelsClaimed: number
  totalStructuresBuilt: number
  totalVoidStrikes: number
  totalRelicsActivated: number
  totalEventsFaced: number
  totalAbilitiesCast: number
  totalMaterialGathered: number
  totalDamageDealt: number
}

export interface VcTitleProgress {
  current: VcTitleDef
  next: VcTitleDef | null
  percent: number
}

export interface VoidCitadelState {
  vcLevel: number
  vcVoidPower: number
  vcRiftEnergy: number
  vcWardens: Record<string, VcWardenState>
  vcCitadels: Record<string, VcCitadelState>
  vcStructures: Record<string, number>
  vcArtifacts: string[]
  vcAchievements: string[]
  vcInventory: Record<string, number>
  vcStats: VcStats
  vcTitle: string
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME & CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const VC_VOID_PURPLE: string = '#6C3483'
export const VC_ABYSS_BLACK: string = '#1C1C1C'
export const VC_RIFT_TEAL: string = '#1ABC9C'
export const VC_ENTROPY_RED: string = '#E74C3C'
export const VC_SHADOW_VIOLET: string = '#4A235A'
export const VC_NULL_SILVER: string = '#AAB7B8'
export const VC_DIMENSION_GOLD: string = '#F1C40F'
export const VC_ABYSS_INDIGO: string = '#2C3E6B'
export const VC_RIFT_STEEL: string = '#5D6D7E'
export const VC_ENTROPY_CRIMSON: string = '#C0392B'
export const VC_CITADEL_DARK: string = '#17202A'
export const VC_VOID_GLOW: string = '#D2B4DE'
export const VC_VOID_DEEP: string = '#4A148C'
export const VC_ABYSS_MIST: string = '#1A1A2E'
export const VC_RIFT_BRIGHT: string = '#48C9B0'
export const VC_ENTROPY_GLOW: string = '#E74C3C'

export const VC_THEME = {
  primary: VC_VOID_PURPLE,
  secondary: VC_ABYSS_BLACK,
  accent: VC_RIFT_TEAL,
  danger: VC_ENTROPY_RED,
} as const

export const VC_SAVE_KEY = 'void-citadel-wire'
export const VC_MAX_LEVEL = 50
export const VC_MAX_STRUCTURE_LEVEL = 10
export const VC_SPECIES_COUNT = 7
export const VC_RARITY_TIER_COUNT = 5
export const VC_WARDEN_COUNT = 35
export const VC_CITADEL_COUNT = 8
export const VC_MATERIAL_COUNT = 30
export const VC_STRUCTURE_COUNT = 25
export const VC_ABILITY_COUNT = 22
export const VC_ACHIEVEMENT_COUNT = 18
export const VC_TITLE_COUNT = 8
export const VC_ARTIFACT_COUNT = 15
export const VC_EVENT_COUNT = 12
export const VC_STARTING_RIFT_ENERGY = 50
export const VC_STARTING_VOID_POWER = 0
export const VC_XP_PER_LEVEL = 100
export const VC_XP_SCALE = 1.5
export const VC_MAX_INVENTORY_ITEM = 9999
export const VC_MAX_OWNED_WARDENS = 100
export const VC_COOLDOWN_TICK_MS = 1000

export const VC_ALL_COLORS: string[] = [
  VC_VOID_PURPLE,
  VC_ABYSS_BLACK,
  VC_RIFT_TEAL,
  VC_ENTROPY_RED,
  VC_SHADOW_VIOLET,
  VC_NULL_SILVER,
  VC_DIMENSION_GOLD,
  VC_ABYSS_INDIGO,
  VC_RIFT_STEEL,
  VC_ENTROPY_CRIMSON,
  VC_CITADEL_DARK,
  VC_VOID_GLOW,
  VC_VOID_DEEP,
  VC_ABYSS_MIST,
  VC_RIFT_BRIGHT,
  VC_ENTROPY_GLOW,
]

export const VC_RARITIES: readonly {
  id: VcRarity
  name: string
  nameCn: string
  color: string
  multiplier: number
}[] = [
  { id: 'common', name: 'Common', nameCn: '普通', color: '#7F8C8D', multiplier: 1 },
  { id: 'uncommon', name: 'Uncommon', nameCn: '稀有', color: '#2ECC71', multiplier: 1.5 },
  { id: 'rare', name: 'Rare', nameCn: '精良', color: VC_RIFT_TEAL, multiplier: 2 },
  { id: 'epic', name: 'Epic', nameCn: '史诗', color: VC_VOID_PURPLE, multiplier: 3 },
  { id: 'legendary', name: 'Legendary', nameCn: '传说', color: VC_ENTROPY_RED, multiplier: 5 },
]

export const VC_SPECIES: readonly {
  id: VcSpecies
  name: string
  nameCn: string
  description: string
  lore: string
  color: string
  basePower: number
}[] = [
  {
    id: 'shadow_wraith',
    name: 'Shadow Wraith',
    nameCn: '暗影幽灵',
    description: 'Spectral entities woven from condensed darkness that drift between dimensions, feeding on the absence of light and the fading memories of dying stars.',
    lore: 'Shadow Wraiths were born in the instant the first shadow was cast — the moment light first encountered matter and created darkness. They have existed ever since, multiplying with every shadow ever made. Their collective consciousness spans every shadow in every dimension, a vast intelligence of pure darkness that observes all but intervenes rarely.',
    color: VC_SHADOW_VIOLET,
    basePower: 10,
  },
  {
    id: 'void_phantom',
    name: 'Void Phantom',
    nameCn: '虚空幻影',
    description: 'Ethereal beings formed from the raw void itself, capable of phasing through solid matter and existing in multiple dimensions at once.',
    lore: 'Void Phantoms are the purest expression of the void — entities that exist because reality has gaps in it, and something must fill those gaps. They are neither alive nor dead, neither real nor imaginary. They simply ARE, in the spaces where existence is uncertain.',
    color: VC_VOID_PURPLE,
    basePower: 8,
  },
  {
    id: 'abyss_knight',
    name: 'Abyss Knight',
    nameCn: '深渊骑士',
    description: 'Heavily armored guardians sworn to protect the deepest reaches of the interdimensional abyss, clad in armor forged under infinite dimensional pressure.',
    lore: 'Abyss Knights take their oaths in the deepest trenches of the interdimensional abyss, where the pressure of infinite dimensions compresses reality into its densest form. Their armor is forged from this compressed matter — a material harder than anything found in any single dimension. Once sworn, an Abyss Knight never breaks their oath.',
    color: VC_ABYSS_INDIGO,
    basePower: 12,
  },
  {
    id: 'null_walker',
    name: 'Null Walker',
    nameCn: '虚空行者',
    description: 'Mysterious entities that traverse the null spaces between dimensions, erasing anomalies and maintaining the void\'s pristine emptiness.',
    lore: 'Null Walkers exist in the spaces between spaces — the quantum void that separates atoms, the dimensional gaps between realities, the silence between thoughts. They are the custodians of emptiness, ensuring that nothing unwanted accumulates in the void. Their presence is felt as a gentle emptiness, a peaceful absence.',
    color: VC_NULL_SILVER,
    basePower: 7,
  },
  {
    id: 'dimension_hunter',
    name: 'Dimension Hunter',
    nameCn: '维度猎手',
    description: 'Predatory wardens that track and capture rogue dimensional breaches across the void, using enhanced senses that span multiple realities.',
    lore: 'Dimension Hunters are the apex predators of the void. They can perceive the distinctive dimensional signature of any breach from across the void network and can track it across realities with unerring accuracy. Their hunting grounds span every dimension, and their prey — rogue entities, corrupted wardens, dimensional parasites — have nowhere to hide.',
    color: VC_DIMENSION_GOLD,
    basePower: 11,
  },
  {
    id: 'rift_keeper',
    name: 'Rift Keeper',
    nameCn: '裂隙守卫',
    description: 'Sentinels who maintain the integrity of dimensional rifts, sealing tears in reality and ensuring safe passage between dimensions.',
    lore: 'Rift Keepers are the engineers and guardians of the dimensional network. Every rift, every passage, every gateway between dimensions is their responsibility. They weave threads of rift energy into barriers, seal tears before they widen into breaches, and maintain the intricate network that allows citadels to communicate and trade across realities.',
    color: VC_RIFT_TEAL,
    basePower: 6,
  },
  {
    id: 'entropy_spirit',
    name: 'Entropy Spirit',
    nameCn: '熵之精灵',
    description: 'Chaotic entities born from the decay of dying dimensions, spreading entropy wherever they drift — beautiful and terrible in equal measure.',
    lore: 'Entropy Spirits are the children of dying dimensions. When a dimension reaches the end of its existence and begins to unravel, the released energy coalesces into these chaotic spirits. They carry within them the memory of their home dimension\'s death, and they spread the same entropy that destroyed their birthplace.',
    color: VC_ENTROPY_RED,
    basePower: 14,
  },
]

export const VC_SPECIES_COLORS: Record<VcSpecies, string> = {
  shadow_wraith: VC_SHADOW_VIOLET,
  void_phantom: VC_VOID_PURPLE,
  abyss_knight: VC_ABYSS_INDIGO,
  null_walker: VC_NULL_SILVER,
  dimension_hunter: VC_DIMENSION_GOLD,
  rift_keeper: VC_RIFT_TEAL,
  entropy_spirit: VC_ENTROPY_RED,
}

export const VC_RARITY_COLORS: Record<VcRarity, string> = {
  common: '#7F8C8D',
  uncommon: '#2ECC71',
  rare: VC_RIFT_TEAL,
  epic: VC_VOID_PURPLE,
  legendary: VC_ENTROPY_RED,
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: VC_WARDENS — 35 Wardens (7 species × 5 rarity tiers)
// ═══════════════════════════════════════════════════════════════════

export const VC_WARDENS: readonly VcWardenDef[] = [
  // ── Shadow Wraith (shadow_wraith) — 5 tiers ──────────────────
  {
    id: 'shadow_wraith_whisper', name: 'Shadow Whisper', species: 'shadow_wraith', rarity: 'common',
    power: 8, defense: 6, cost: 40,
    description: 'A faint wisp of darkness that follows silently, whispering secrets from the void between dimensions. Its form shifts like smoke in wind.',
    lore: 'Shadow Whispers are the most basic form of shadow wraith, barely more than an afterimage cast by forgotten dreams. They speak in frequencies only the void-touched can hear, revealing secrets stolen from the shadows of sleeping gods.',
  },
  {
    id: 'shadow_wraith_stalker', name: 'Shadow Stalker', species: 'shadow_wraith', rarity: 'uncommon',
    power: 20, defense: 16, cost: 160,
    description: 'A predatory wraith that stalks its prey through multiple shadow dimensions simultaneously, striking from angles that do not exist.',
    lore: 'Shadow Stalkers have learned to exist in three shadow dimensions at once, making them nearly impossible to detect until their cold grip closes around you. Their victims never see them coming — they simply notice that their shadow has moved on its own.',
  },
  {
    id: 'shadow_wraith_revenant', name: 'Shadow Revenant', species: 'shadow_wraith', rarity: 'rare',
    power: 45, defense: 38, cost: 650,
    description: 'A powerful revenant of pure darkness that can blot out the light of an entire citadel chamber, plunging it into absolute shadow.',
    lore: 'Shadow Revenants were once mortals who willingly dissolved into shadow to escape a dying dimension. Their loyalty is absolute, as you gave them form when the void offered only oblivion. Their presence dims all nearby light sources.',
  },
  {
    id: 'shadow_wraith_sovereign', name: 'Shadow Sovereign', species: 'shadow_wraith', rarity: 'epic',
    power: 100, defense: 85, cost: 2800,
    description: 'A regal wraith commanding legions of lesser shadows, master of the dark dimension. Its crown is made from the shadow of a dead star.',
    lore: 'The Shadow Sovereign rules a shadow dimension that exists as a mirror to our own. Every shadow you cast has a counterpart in their realm, and the Sovereign can pull them through at will. Their army of shadows numbers in the trillions.',
  },
  {
    id: 'shadow_wraith_eclipse', name: 'Eternal Eclipse', species: 'shadow_wraith', rarity: 'legendary',
    power: 220, defense: 190, cost: 12000,
    description: 'The embodiment of perfect darkness — a wraith whose shadow consumes all light across dimensions, casting the void into eternal night.',
    lore: 'The Eternal Eclipse is said to be the shadow that was cast when the first dimension was born. It has been growing in power ever since, and now it can extinguish stars with a single gesture. When the Eclipse passes, even void wraiths retreat into deeper darkness.',
  },

  // ── Void Phantom (void_phantom) — 5 tiers ───────────────────
  {
    id: 'void_phantom_flicker', name: 'Void Flicker', species: 'void_phantom', rarity: 'common',
    power: 6, defense: 10, cost: 35,
    description: 'A ghostly apparition that phases in and out of visibility, barely tethered to reality. It flickers like a dying candle in the void wind.',
    lore: 'Void Flickers are the weakest void phantoms, their connection to the material plane so tenuous that they flicker like dying stars. Yet their phase ability makes them excellent scouts, able to pass through any barrier undetected.',
  },
  {
    id: 'void_phantom_specter', name: 'Void Specter', species: 'void_phantom', rarity: 'uncommon',
    power: 18, defense: 22, cost: 150,
    description: 'A stable phantom that can pass through walls and materialize weapons from void energy, wielding blades of pure nothingness.',
    lore: 'Void Specters have learned to condense void energy into solid constructs — weapons, shields, even temporary fortifications. Their ability to phase through matter makes them ideal citadel infiltrators and assassins.',
  },
  {
    id: 'void_phantom_wraithlord', name: 'Phantom Wraithlord', species: 'void_phantom', rarity: 'rare',
    power: 42, defense: 50, cost: 700,
    description: 'A towering phantom that commands the boundary between the void and physical reality, opening gates for armies of lesser phantoms.',
    lore: 'Phantom Wraithlords can open temporary void gates, allowing entire squads of lesser phantoms to phase into battle simultaneously. They are the generals of the phantom army, their strategic brilliance honed across millennia of interdimensional warfare.',
  },
  {
    id: 'void_phantom_sovereign', name: 'Void Sovereign', species: 'void_phantom', rarity: 'epic',
    power: 95, defense: 110, cost: 3000,
    description: 'An omnipresent phantom that exists in all void-connected dimensions at once, perceiving everything through its thousand phantom eyes.',
    lore: 'The Void Sovereign does not move between dimensions — it exists in all of them simultaneously. Its awareness spans the entire void network, making it the perfect guardian for citadel intelligence and the most feared entity in the phantom hierarchy.',
  },
  {
    id: 'void_phantom_abyss', name: 'Abyssal Mind', species: 'void_phantom', rarity: 'legendary',
    power: 200, defense: 240, cost: 13000,
    description: 'A phantom of infinite consciousness that perceives every dimension simultaneously. Its thoughts are too vast for mortal comprehension.',
    lore: 'The Abyssal Mind was the first phantom ever to achieve multi-dimensional consciousness. It can predict attacks before they happen, phase entire citadels between dimensions, and see through every deception. To look into its eyes is to see every dimension at once.',
  },

  // ── Abyss Knight (abyss_knight) — 5 tiers ────────────────────
  {
    id: 'abyss_knight_squire', name: 'Abyss Squire', species: 'abyss_knight', rarity: 'common',
    power: 12, defense: 14, cost: 50,
    description: 'A young knight clad in abyss-forged armor that absorbs ambient void energy. Their resolve is tested in the crushing depths.',
    lore: 'Abyss Squires train in the deepest trenches of the abyss, where the pressure of interdimensional forces forges their armor and hardens their resolve. Their first oath is to the citadel, and their last will be the same.',
  },
  {
    id: 'abyss_knight_sentinel', name: 'Abyss Sentinel', species: 'abyss_knight', rarity: 'uncommon',
    power: 28, defense: 32, cost: 200,
    description: 'A steadfast sentinel whose abyss-steel shield can withstand direct void energy blasts. They stand resolute against any dimensional assault.',
    lore: 'Abyss Sentinels are the backbone of any citadel defense. Their shields, forged from abyss iron cooled in null water, can absorb energy that would vaporize ordinary matter. They do not retreat. They do not fall.',
  },
  {
    id: 'abyss_knight_champion', name: 'Abyss Champion', species: 'abyss_knight', rarity: 'rare',
    power: 58, defense: 65, cost: 850,
    description: 'An elite warrior whose strikes cleave through dimensional barriers, leaving trails of abyssal energy in their wake.',
    lore: 'Abyss Champions have mastered the Dimensional Slash, a technique that cuts through the fabric of space itself. Their greatswords are forged from collapsed dwarf-star matter and weigh more than mountains, yet they wield them with graceful precision.',
  },
  {
    id: 'abyss_knight_warden', name: 'Abyss Warden', species: 'abyss_knight', rarity: 'epic',
    power: 120, defense: 135, cost: 3500,
    description: 'A legendary knight whose oath of protection extends across all connected dimensions. No citadel they guard has ever fallen.',
    lore: 'The Abyss Warden has sworn an unbreakable oath to protect a citadel across every dimension it exists in. They can summon barriers that span dimensional boundaries, and their armor has never been breached. They are the wall against which the void breaks.',
  },
  {
    id: 'abyss_knight_omniscient', name: 'Omniscient Guardian', species: 'abyss_knight', rarity: 'legendary',
    power: 250, defense: 280, cost: 15000,
    description: 'The supreme guardian of the abyss whose awareness encompasses all possible threats across all timelines and dimensions.',
    lore: 'The Omniscient Guardian perceives threats across all timelines and dimensions. They move to intercept attacks before the attacker has even decided to strike. In their presence, no citadel has ever fallen. They are the final word in defense.',
  },

  // ── Null Walker (null_walker) — 5 tiers ──────────────────────
  {
    id: 'null_walker_trace', name: 'Null Trace', species: 'null_walker', rarity: 'common',
    power: 5, defense: 8, cost: 30,
    description: 'A small entity that walks the null spaces between atoms, erasing corrupted data and dimensional debris with quiet efficiency.',
    lore: 'Null Traces are the sanitation workers of the void. They patrol the quantum void between particles, eliminating corrupted dimensional signatures that could destabilize local reality. Their work is invisible but essential.',
  },
  {
    id: 'null_walker_erasure', name: 'Null Erasure', species: 'null_walker', rarity: 'uncommon',
    power: 15, defense: 20, cost: 140,
    description: 'A walker that can erase small dimensional anomalies and seal micro-rifts with a touch of its null-infused hand.',
    lore: 'Null Erasures carry the Null Blade — a weapon that cuts not through matter, but through the concept of existence itself. Whatever it touches simply ceases to be. They are both healers and executioners, depending on the need.',
  },
  {
    id: 'null_walker_voidhand', name: 'Void Hand', species: 'null_walker', rarity: 'rare',
    power: 38, defense: 45, cost: 600,
    description: 'A powerful walker whose touch can nullify any form of energy or magic, rendering the most powerful abilities useless.',
    lore: 'Void Hands are the most feared null walkers in the citadel arsenals. Their touch cancels kinetic energy, magical forces, and even the fundamental forces of nature within a localized area. They are the ultimate equalizer in any conflict.',
  },
  {
    id: 'null_walker_annihilator', name: 'Null Annihilator', species: 'null_walker', rarity: 'epic',
    power: 88, defense: 100, cost: 3200,
    description: 'An annihilator capable of erasing entire dimensional pockets from existence with its devastating Null Sphere technique.',
    lore: 'Null Annihilators are deployed only in the most extreme circumstances. Their Null Sphere technique can erase a volume of space up to a kilometer in radius, removing everything within from all dimensions simultaneously. No defense exists against erasure.',
  },
  {
    id: 'null_walker_terminus', name: 'Terminus Walker', species: 'null_walker', rarity: 'legendary',
    power: 190, defense: 220, cost: 11000,
    description: 'The walker of the final null — the end of all things made manifest. Its presence causes reality to grow thin and fragile.',
    lore: 'The Terminus Walker exists at the edge of universal entropy. They have witnessed the death of dimensions and carry the null essence of billions of erased realities within them. When they walk, reality itself grows thin, and existence becomes uncertain.',
  },

  // ── Dimension Hunter (dimension_hunter) — 5 tiers ────────────
  {
    id: 'dimension_hunter_tracker', name: 'Dimension Tracker', species: 'dimension_hunter', rarity: 'common',
    power: 10, defense: 5, cost: 45,
    description: 'A keen-eyed hunter that tracks interdimensional signatures across the void, smelling breaches from across light-years.',
    lore: 'Dimension Trackers can smell the distinctive ozone scent of a dimensional breach from light-years away. They are the first to arrive at any rift event, assessing the threat before the citadel responds. Their senses span dimensions like a shark senses blood.',
  },
  {
    id: 'dimension_hunter_striker', name: 'Dimension Striker', species: 'dimension_hunter', rarity: 'uncommon',
    power: 25, defense: 12, cost: 170,
    description: 'A swift hunter that strikes through dimensional folds to ambush prey, emerging from angles that defy geometry.',
    lore: 'Dimension Strikers have developed the Fold Strike — an attack that emerges from one dimension, strikes, and retreats into another in a fraction of a nanosecond. The target never sees it coming. It is already dead before it realizes it was attacked.',
  },
  {
    id: 'dimension_hunter_predator', name: 'Dimension Predator', species: 'dimension_hunter', rarity: 'rare',
    power: 52, defense: 28, cost: 750,
    description: 'An apex predator that hunts rogue entities across multiple dimensions, creating dimensional traps that span realities.',
    lore: 'Dimension Predators are the apex hunters of the void. They create elaborate dimensional traps — pocket dimensions that lure in rogue entities, then collapse around them, digesting the trapped energy. Nothing escapes a Dimension Predator\'s hunt.',
  },
  {
    id: 'dimension_hunter_sovereign', name: 'Sovereign Hunter', species: 'dimension_hunter', rarity: 'epic',
    power: 110, defense: 60, cost: 3300,
    description: 'A hunter so skilled they can track prey across every dimension simultaneously, never losing a target across infinite realities.',
    lore: 'The Sovereign Hunter has never lost a quarry. They can simultaneously track a thousand targets across every dimension in the void network, and their Dimensional Harpoon can pull entities through dimensional barriers like fish on a line.',
  },
  {
    id: 'dimension_hunter_omega', name: 'Omega Predator', species: 'dimension_hunter', rarity: 'legendary',
    power: 240, defense: 130, cost: 14000,
    description: 'The ultimate hunter — nothing exists that can escape its pursuit across all realities and timelines. Even entropy fears the hunt.',
    lore: 'The Omega Predator has hunted since before the first dimension formed. It is said that entropy itself flees from the Omega Predator, and that entire dimensions have surrendered rather than face its pursuit. It has never failed, because failure is not a concept it recognizes.',
  },

  // ── Rift Keeper (rift_keeper) — 5 tiers ──────────────────────
  {
    id: 'rift_keeper_mender', name: 'Rift Mender', species: 'rift_keeper', rarity: 'common',
    power: 4, defense: 12, cost: 35,
    description: 'A gentle keeper who mends small dimensional tears with shimmering threads of rift energy, healing reality\'s wounds.',
    lore: 'Rift Menders are the healers of the dimensional fabric. They weave shimmering threads of rift energy into damaged barriers, sealing tears before they can widen into dangerous breaches. Their work is delicate, patient, and utterly essential.',
  },
  {
    id: 'rift_keeper_weaver', name: 'Rift Weaver', species: 'rift_keeper', rarity: 'uncommon',
    power: 10, defense: 28, cost: 150,
    description: 'A skilled weaver who can reinforce dimensional barriers and create stable rift passages for citadel travel.',
    lore: 'Rift Weavers can not only repair but strengthen dimensional barriers. Their reinforced rift threads are stronger than the original fabric, and they can weave temporary passages for citadel forces that rival the permanence of natural rifts.',
  },
  {
    id: 'rift_keeper_architect', name: 'Rift Architect', species: 'rift_keeper', rarity: 'rare',
    power: 22, defense: 55, cost: 700,
    description: 'An architect who designs and constructs permanent dimensional gateways connecting citadels across the void network.',
    lore: 'Rift Architects design the permanent gateways that connect citadels across the void. Their constructions are marvels of dimensional engineering — stable passages that can withstand the immense pressure of inter-dimensional forces for millennia.',
  },
  {
    id: 'rift_keeper_guardian', name: 'Rift Guardian', species: 'rift_keeper', rarity: 'epic',
    power: 50, defense: 130, cost: 3400,
    description: 'A guardian who can seal massive dimensional breaches with impenetrable rift barriers, protecting entire dimensions from collapse.',
    lore: 'Rift Guardians are deployed when a breach threatens to consume an entire dimension. Their Grand Seal technique creates barriers so strong that not even the void itself can penetrate them. A single Guardian can save a billion realities.',
  },
  {
    id: 'rift_keeper_ancient', name: 'Ancient Sealer', species: 'rift_keeper', rarity: 'legendary',
    power: 100, defense: 300, cost: 10000,
    description: 'The oldest rift keeper, whose seals have held for eons across countless dimensions. Their barriers will outlast time itself.',
    lore: 'The Ancient Sealer was present when the first rift was torn in reality, and their original seal still holds at the edge of the void. They have sealed more breaches than there are stars, and their barriers will outlast the universe itself.',
  },

  // ── Entropy Spirit (entropy_spirit) — 5 tiers ───────────────
  {
    id: 'entropy_spirit_ember', name: 'Entropy Ember', species: 'entropy_spirit', rarity: 'common',
    power: 14, defense: 4, cost: 40,
    description: 'A small spirit of decay that accelerates the breakdown of matter and energy, leaving a trail of dissolution in its wake.',
    lore: 'Entropy Embers are the sparks of dying dimensions. Each one carries a fragment of the decay that consumed its home reality, and they spread that decay wherever they drift. Their glow is beautiful but deadly — a candle flame of universal decay.',
  },
  {
    id: 'entropy_spirit_blaze', name: 'Entropy Blaze', species: 'entropy_spirit', rarity: 'uncommon',
    power: 32, defense: 10, cost: 180,
    description: 'A raging spirit that consumes energy and matter, converting them into raw entropy that accelerates the decay of everything nearby.',
    lore: 'Entropy Blazes feed on organized systems — technology, magic, even living tissue. Their touch accelerates time locally, causing centuries of decay in seconds. Under their influence, fortresses crumble to dust and weapons rust to nothing.',
  },
  {
    id: 'entropy_spirit_tempest', name: 'Entropy Tempest', species: 'entropy_spirit', rarity: 'rare',
    power: 65, defense: 18, cost: 800,
    description: 'A swirling storm of chaotic energy that destabilizes dimensional integrity, making travel between dimensions extremely hazardous.',
    lore: 'Entropy Tempests are mobile disasters. Their presence causes dimensional barriers to ripple and warp, making travel between dimensions hazardous. Controlled and channeled, they are devastating citadel weapons that can deny an entire region to enemies.',
  },
  {
    id: 'entropy_spirit_cataclysm', name: 'Entropy Cataclysm', species: 'entropy_spirit', rarity: 'epic',
    power: 140, defense: 35, cost: 3600,
    description: 'A cataclysmic spirit capable of accelerating a dimension toward heat death, unraveling the fabric of reality itself.',
    lore: 'Entropy Cataclysms are weapons of last resort. Their Entropy Field can accelerate an entire region toward maximum entropy, causing all energy to disperse and all structure to collapse. Only the strongest citadels can contain them, and even then, containment is temporary.',
  },
  {
    id: 'entropy_spirit_omega', name: 'Omega Decay', species: 'entropy_spirit', rarity: 'legendary',
    power: 280, defense: 60, cost: 16000,
    description: 'The spirit of universal entropy — the inevitable end of all things given consciousness and terrible purpose.',
    lore: 'Omega Decay is entropy itself, aware and purposeful. It does not destroy out of malice but out of cosmic inevitability. In its presence, even time itself begins to slow and decay. The citadel channels its power through ancient containment seals, binding apocalypse itself to their will.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: VC_CITADELS — 8 Citadel Locations
// ═══════════════════════════════════════════════════════════════════

export const VC_CITADELS: readonly VcCitadelDef[] = [
  {
    id: 'whispering_threshold',
    name: 'Whispering Threshold',
    level: 1,
    resources: ['void_shard', 'shadow_dust', 'null_pebble'],
    capacity: 20,
    description: 'The outermost citadel, perched at the edge of the void where reality frays into nothingness and new dimensions are born.',
    lore: 'The Whispering Threshold is where new void commanders take their first steps. The walls murmur with the voices of a billion lost dimensions, each one a warning and a promise of the power that lies within. The threshold itself is a thin line between existence and void — step too far and you cease to be.',
  },
  {
    id: 'obsidian_bastion',
    name: 'Obsidian Bastion',
    level: 3,
    resources: ['shadow_dust', 'abyss_crystal', 'void_shard'],
    capacity: 30,
    description: 'A fortress carved from living obsidian that pulses with absorbed void energy, growing stronger with every attack it endures.',
    lore: 'Obsidian Bastion was formed when a dying star was compressed by the void into a single perfect cube of glass-dark stone. The citadel grew organically around it, its walls absorbing energy from every dimension it touches. It has never been breached — because every attack only makes it stronger.',
  },
  {
    id: 'null_sanctum',
    name: 'Null Sanctum',
    level: 6,
    resources: ['null_pebble', 'rift_essence', 'dimensional_mote'],
    capacity: 40,
    description: 'A serene sanctuary built in a pocket of perfect nothingness between dimensions — the quietest place in the multiverse.',
    lore: 'The Null Sanctum exists in a space where no dimension has laid claim. It is perfectly still, perfectly silent, and perfectly empty — except for the citadel itself, which floats in this pristine void like a jewel in black velvet. Wounded wardens come here to heal in the perfect null.',
  },
  {
    id: 'rift_spire',
    name: 'Rift Spire',
    level: 10,
    resources: ['rift_essence', 'entropy_residue', 'shadow_crystal'],
    capacity: 50,
    description: 'A towering spire built atop a stable dimensional rift, channeling cross-dimensional energy into raw citadel power.',
    lore: 'The Rift Spire draws power from the dimensional breach upon which it stands. Its crystalline structure focuses and amplifies rift energy, providing unlimited power to all connected citadels. The view from its apex shows every dimension simultaneously — a breathtaking and terrifying sight.',
  },
  {
    id: 'entropy_cradle',
    name: 'Entropy Cradle',
    level: 15,
    resources: ['entropy_residue', 'abyss_crystal', 'null_core_fragment'],
    capacity: 60,
    description: 'A citadel built within the decaying shell of a collapsed dimension, harnessing the residual decay as an energy source.',
    lore: 'The Entropy Cradle occupies the hollow remains of a dimension that reached heat death three billion years ago. Within its slowly decaying boundaries, entropy spirits thrive, and the citadel harnesses the residual decay as a seemingly inexhaustible energy source.',
  },
  {
    id: 'dimensional_nexus',
    name: 'Dimensional Nexus',
    level: 20,
    resources: ['dimensional_mote', 'null_core_fragment', 'rift_essence'],
    capacity: 75,
    description: 'The central hub connecting all citadel networks across every known dimension — the nerve center of the void.',
    lore: 'The Dimensional Nexus is the most strategically important citadel in the void. Every dimensional pathway converges here, and its control room displays a real-time map of all connected realities. Whoever controls the Nexus controls the void itself.',
  },
  {
    id: 'phantom_depths',
    name: 'Phantom Depths',
    level: 28,
    resources: ['phantom_tear', 'void_heart_fragment', 'entropy_residue'],
    capacity: 90,
    description: 'A citadel that exists partially in the phantom dimension, shifting between realities like a flickering ghost.',
    lore: 'The Phantom Depths flickers between dimensions like a candle in the wind. One moment it is fully material, the next it is ghost-like and intangible. This dimensional instability makes it nearly impossible to attack but requires constant maintenance by rift keepers.',
  },
  {
    id: 'eternal_throne',
    name: 'Eternal Throne',
    level: 36,
    resources: ['void_heart_fragment', 'entropy_prism', 'dimensional_mote'],
    capacity: 120,
    description: 'The ultimate citadel at the center of the void — seat of the Dimension Overlord and the heart of all void power.',
    lore: 'The Eternal Throne exists at the precise center of all dimensions — equidistant from every point in reality. Time flows differently here, and the citadel has existed since before the first dimension was born. It will exist after the last one dies. Only the Dimension Overlord may sit upon its throne.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: VC_MATERIALS — 30 Void Materials
// ═══════════════════════════════════════════════════════════════════

export const VC_MATERIALS: readonly VcMaterialDef[] = [
  // Void (6)
  {
    id: 'void_shard', name: 'Void Shard', rarity: 'common',
    description: 'A crystallized fragment of raw void energy, cold to the touch and humming with dark potential.',
    lore: 'Void Shards form when concentrated void energy encounters a sufficiently cold surface. They are the most basic building block of void technology and the first material every new void commander learns to handle.',
    value: 5, category: 'void',
  },
  {
    id: 'void_crystal', name: 'Void Crystal', rarity: 'rare',
    description: 'A large, flawless crystal formed from concentrated void energy over millennia of slow dimensional compression.',
    lore: 'Void Crystals take thousands of years to form naturally, as void energy slowly crystallizes under the immense pressure between dimensions. Each one is unique, containing a swirl pattern that maps the dimensional currents at the time of its formation.',
    value: 120, category: 'void',
  },
  {
    id: 'void_heart_fragment', name: 'Void Heart Fragment', rarity: 'legendary',
    description: 'A fragment of the Void Heart — the theoretical center of the void itself. It radiates power that bends nearby space.',
    lore: 'The Void Heart is said to be the core of the void, the point from which all void energy emanates. Fragments of it are impossibly rare and impossibly powerful. To hold one is to hold a piece of nothingness made solid — a paradox that drives lesser minds to madness.',
    value: 1500, category: 'void',
  },
  {
    id: 'void_thread', name: 'Void Thread', rarity: 'uncommon',
    description: 'Silken thread spun from void energy, used to weave dimensional barriers and repair rift damage.',
    lore: 'Void Thread is produced by specialized void spiders — creatures that live in the space between dimensions and spin their webs from ambient void energy. A single strand can hold back a dimensional breach for centuries.',
    value: 25, category: 'void',
  },
  {
    id: 'void_ash', name: 'Void Ash', rarity: 'common',
    description: 'Fine gray ash left behind when void energy dissipates, still faintly radioactive with residual dark power.',
    lore: 'Void Ash is the residue of spent void energy. While it has lost most of its potency, it retains enough charge to be useful in basic alchemical processes and as a catalyst for minor summoning rituals.',
    value: 4, category: 'void',
  },
  {
    id: 'void_mirror_shard', name: 'Void Mirror Shard', rarity: 'epic',
    description: 'A shard of reflective material that shows not your reflection, but your dimensional echo — who you are in other realities.',
    lore: 'Void Mirrors were created by the first Dimension Overlord as surveillance tools. Each shard reflects a different dimension, allowing the viewer to observe parallel realities. Looking into one for too long can cause dimensional identity crisis.',
    value: 400, category: 'void',
  },

  // Shadow (4)
  {
    id: 'shadow_dust', name: 'Shadow Dust', rarity: 'common',
    description: 'Fine powder harvested from condensed shadow, used in wraith summoning rituals and shadow barrier construction.',
    lore: 'Shadow Dust is collected from the deepest, darkest corners of every dimension. It is the raw material from which all shadow wraiths are formed, and a handful of it can summon a Shadow Whisper in moments.',
    value: 6, category: 'shadow',
  },
  {
    id: 'shadow_crystal', name: 'Shadow Crystal', rarity: 'rare',
    description: 'A crystal that absorbs all light, creating a sphere of absolute darkness around it. Even void phantoms cannot see through its shadow.',
    lore: 'Shadow Crystals are the solidified essence of absolute darkness. They do not merely block light — they consume it. A Shadow Crystal placed in a lit room will gradually absorb all illumination until the room is plunged into perfect darkness.',
    value: 100, category: 'shadow',
  },
  {
    id: 'shadow_essence', name: 'Shadow Essence', rarity: 'uncommon',
    description: 'Liquid shadow distilled from the darkest corners of the void network, used to empower shadow wraith summons.',
    lore: 'Shadow Essence is produced by distilling raw shadow under immense pressure. The resulting liquid is darker than black — it absorbs not just light but all forms of energy. A single drop can empower a shadow wraith to epic levels of power.',
    value: 30, category: 'shadow',
  },
  {
    id: 'phantom_tear', name: 'Phantom Tear', rarity: 'epic',
    description: 'A tear shed by a dying phantom, containing compressed memories of a lost dimension that no longer exists.',
    lore: 'Phantom Tears are among the most valuable materials in the void. Each one contains the complete compressed memories of a dimension that was erased from existence. They are used in the most powerful phantom summoning rituals.',
    value: 450, category: 'shadow',
  },

  // Abyss (4)
  {
    id: 'abyss_crystal', name: 'Abyss Crystal', rarity: 'uncommon',
    description: 'A crystal grown in the crushing depths of the interdimensional abyss, infused with the pressure of infinite dimensions.',
    lore: 'Abyss Crystals form only in the deepest trenches of the interdimensional abyss, where the combined pressure of every dimension compresses matter into crystalline form. Their internal structure encodes information about every dimension above them.',
    value: 22, category: 'abyss',
  },
  {
    id: 'null_pebble', name: 'Null Pebble', rarity: 'common',
    description: 'A smooth stone from the null space between dimensions, impossibly dense and surprisingly heavy for its small size.',
    lore: 'Null Pebbles are fragments of the null space between dimensions that have condensed into solid form. Despite their small size, they are incredibly dense — a handful weighs as much as a boulder. They are used as weights in dimensional anchor systems.',
    value: 7, category: 'abyss',
  },
  {
    id: 'null_core_fragment', name: 'Null Core Fragment', rarity: 'epic',
    description: 'A fragment of a null core — the compressed remains of an erased dimension, radiating the essence of nothingness.',
    lore: 'Null Core Fragments are the remnants of dimensions that have been completely erased. The compression of an entire dimension into a single point creates these fragments, which radiate a powerful null field that cancels all nearby energy.',
    value: 380, category: 'abyss',
  },
  {
    id: 'abyssal_iron', name: 'Abyssal Iron', rarity: 'rare',
    description: 'Metal forged under infinite pressure in the deepest abyss trenches, stronger than any material found in any single dimension.',
    lore: 'Abyssal Iron is forged in the crushing depths of the interdimensional abyss. The combined pressure of every dimension compresses iron ore into a metal that is harder than diamond, heavier than lead, and capable of withstanding direct void energy blasts.',
    value: 90, category: 'abyss',
  },

  // Rift (4)
  {
    id: 'rift_essence', name: 'Rift Essence', rarity: 'uncommon',
    description: 'Concentrated energy harvested from stable dimensional rifts, crackling with cross-dimensional power.',
    lore: 'Rift Essence is the lifeblood of the dimensional network. It flows through every rift and passage, powering the connections between dimensions. Harvesting it requires careful technique — too much extraction can destabilize the rift itself.',
    value: 20, category: 'rift',
  },
  {
    id: 'rift_crystal', name: 'Rift Crystal', rarity: 'rare',
    description: 'A crystal that resonates with dimensional frequencies, used in rift engineering and gateway construction.',
    lore: 'Rift Crystals naturally attune themselves to the dimensional frequency of their birth rift. They can be programmed to resonate at any desired frequency, making them essential components in rift gate construction and dimensional communication devices.',
    value: 110, category: 'rift',
  },
  {
    id: 'rift_thread', name: 'Rift Thread', rarity: 'common',
    description: 'A strand of dimensional fabric pulled from a healing rift, stronger than steel and thinner than silk.',
    lore: 'Rift Thread is the basic building material of dimensional barriers. When a rift heals, it leaves behind these threads — residual dimensional fabric that is stronger than any known material. Rift Keepers harvest them for repair work.',
    value: 3, category: 'rift',
  },
  {
    id: 'rift_star_core', name: 'Rift Star Core', rarity: 'legendary',
    description: 'The compressed core of a star pulled through a rift — impossibly hot and dense, radiating energy across dimensions.',
    lore: 'Rift Star Cores are created when a dying star falls through a dimensional rift during its final collapse. The rift compresses the stellar core to densities that should not be possible, creating an object that radiates energy across every dimension simultaneously.',
    value: 1800, category: 'rift',
  },

  // Dimension (4)
  {
    id: 'dimensional_mote', name: 'Dimensional Mote', rarity: 'uncommon',
    description: 'A tiny speck of pure dimensional energy that glows with shifting colors representing different realities.',
    lore: 'Dimensional Motes are the visible manifestation of dimensional energy. Each one contains a tiny fragment of a dimension, and its color shifts as the internal dimension fluctuates. Collecting enough of them from the same dimension can reveal its complete structure.',
    value: 18, category: 'dimension',
  },
  {
    id: 'dimensional_fabric', name: 'Dimensional Fabric', rarity: 'rare',
    description: 'A sheet of woven dimensional threads, flexible yet indestructible — the material from which reality itself is made.',
    lore: 'Dimensional Fabric is the literal substance of reality. Dimensions are woven from threads of dimensional energy, and occasionally, a section of this fabric can be harvested intact. It is flexible as silk yet can withstand any force.',
    value: 95, category: 'dimension',
  },
  {
    id: 'dimensional_ink', name: 'Dimensional Ink', rarity: 'common',
    description: 'Ink that writes in dimensions beyond the visible — used in void contracts that bind across all realities.',
    lore: 'Dimensional Ink writes not just on paper but across the dimensional fabric itself. Contracts written in this ink are binding across every dimension — there is no reality in which the terms can be broken. It is the ink of unbreakable oaths.',
    value: 5, category: 'dimension',
  },
  {
    id: 'dimensional_key', name: 'Dimensional Key', rarity: 'epic',
    description: 'A key that can unlock any dimensional barrier — the ultimate access tool and the most sought-after item in the void.',
    lore: 'Dimensional Keys are artifacts of immense power, said to have been created by the first Dimension Overlord. A single key can unlock any dimensional barrier, from the simplest rift seal to the most complex dimensional lock. Only eight are known to exist.',
    value: 500, category: 'dimension',
  },

  // Entropy (4)
  {
    id: 'entropy_residue', name: 'Entropy Residue', rarity: 'common',
    description: 'Sludgy residue left by entropy spirits, still radiating chaotic energy that slowly breaks down nearby matter.',
    lore: 'Entropy Residue is the byproduct of entropy spirit activity. It looks like dark, viscous sludge that constantly shifts and moves on its own. Left unchecked, it will slowly consume any matter it touches, converting it into more entropy residue.',
    value: 6, category: 'entropy',
  },
  {
    id: 'entropy_crystal', name: 'Entropy Crystal', rarity: 'rare',
    description: 'A crystal that vibrates with chaotic energy, capable of destabilizing matter and dimensional barriers on contact.',
    lore: 'Entropy Crystals form when entropy residue is compressed under controlled conditions. The resulting crystal vibrates at chaotic frequencies that can destabilize molecular bonds and dimensional barriers alike. They are used in entropy-based weaponry.',
    value: 85, category: 'entropy',
  },
  {
    id: 'entropy_prism', name: 'Entropy Prism', rarity: 'legendary',
    description: 'A prism that splits organized energy into its chaotic components, accelerating decay across everything it touches.',
    lore: 'The Entropy Prism is one of the most dangerous artifacts in existence. It does not destroy energy — it transforms it from organized, useful forms into pure chaos. In its presence, stars cool, life decays, and even dimensions begin to unravel.',
    value: 1600, category: 'entropy',
  },
  {
    id: 'entropy_spark', name: 'Entropy Spark', rarity: 'uncommon',
    description: 'A spark of pure entropy that causes nearby matter to slowly break down, useful as a controlled energy source.',
    lore: 'Entropy Sparks are miniature versions of entropy spirits — concentrated chaos contained in a spark of energy. They are used as power sources in entropy reactors, where their chaotic energy is converted into useful citadel power.',
    value: 15, category: 'entropy',
  },

  // Null (4)
  {
    id: 'null_resonance_stone', name: 'Null Resonance Stone', rarity: 'rare',
    description: 'A stone that vibrates at the frequency of the void null, canceling all forms of energy within its resonance field.',
    lore: 'Null Resonance Stones naturally attune to the null frequency — the fundamental frequency of nothingness. When activated, they project a field that cancels all energy forms within range. They are the basis of null-based defense technology.',
    value: 105, category: 'null',
  },
  {
    id: 'null_ink', name: 'Null Ink', rarity: 'uncommon',
    description: 'Ink that writes in absolute nothingness — only visible to null walkers and those attuned to the void frequency.',
    lore: 'Null Ink writes in the null spaces between atoms. The writing exists but is invisible to normal perception. Only null walkers and those who have attuned themselves to the null frequency can read it, making it perfect for secret communications.',
    value: 28, category: 'null',
  },
  {
    id: 'null_echo', name: 'Null Echo', rarity: 'epic',
    description: 'The fading echo of a dimension that was erased — preserved in crystalline form as a testament to what was lost.',
    lore: 'Null Echoes are the last remnants of erased dimensions. When a dimension is completely nullified, its final moments are preserved in these crystals — a ghost of a world that once was. They are hauntingly beautiful and deeply sad.',
    value: 420, category: 'null',
  },
  {
    id: 'null_shard_omega', name: 'Null Shard Omega', rarity: 'legendary',
    description: 'The last fragment of the original null — from before existence began, when there was only perfect nothing.',
    lore: 'The Null Shard Omega predates existence itself. It is a fragment of the primordial null — the perfect nothingness that existed before the first dimension was born. To hold it is to hold the memory of a time when nothing existed, including nothing itself.',
    value: 2000, category: 'null',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: VC_STRUCTURES — 25 Citadel Structures
// ═══════════════════════════════════════════════════════════════════

export const VC_STRUCTURES: readonly VcStructureDef[] = [
  { id: 'void_beacon', name: 'Void Beacon', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A pulsing beacon of void energy that attracts wardens and marks citadel territory in the darkness.', lore: 'Void Beacons serve as lighthouses in the eternal darkness of the void. Their pulsing signal guides allied wardens home and warns all void entities that this territory belongs to a citadel commander.', costPerLevel: 80, bonusType: 'summonBonus', bonusPerLevel: 3 },
  { id: 'shadow_altar', name: 'Shadow Altar', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'An altar of living shadow that empowers shadow wraith summons and reduces their summoning cost.', lore: 'The Shadow Altar draws power from the ambient darkness between dimensions, creating a concentrated pool of shadow energy that makes shadow wraith summons more powerful and less costly.', costPerLevel: 100, bonusType: 'summonBonus', bonusPerLevel: 5 },
  { id: 'abyss_forge', name: 'Abyss Forge', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A forge that burns with abyssal fire, smelting void materials into powerful weaponry and armor.', lore: 'The Abyss Forge is fueled by the compressed energy of the interdimensional abyss. Its flames burn hotter than any star, yet they produce no heat — only transformation. Weapons forged here cut through dimensional barriers.', costPerLevel: 120, bonusType: 'powerBonus', bonusPerLevel: 4 },
  { id: 'rift_gate', name: 'Rift Gate', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A stabilized dimensional gateway for rapid deployment of wardens between connected citadels.', lore: 'Rift Gates are the highways of the void network. They create stable, permanent passages between citadels that allow instant travel for wardens and supplies. The stability of each gate depends on the skill of the rift keepers who maintain it.', costPerLevel: 200, bonusType: 'citadelBonus', bonusPerLevel: 6 },
  { id: 'null_tower', name: 'Null Tower', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A tower of concentrated null energy that projects a defensive shield canceling all incoming attacks.', lore: 'The Null Tower generates a field of perfect null around the citadel, canceling all forms of energy that enter it. Projectiles stop mid-air, energy beams dissipate, and dimensional attacks fizzle out. It is the ultimate passive defense.', costPerLevel: 150, bonusType: 'defenseBonus', bonusPerLevel: 5 },
  { id: 'entropy_reactor', name: 'Entropy Reactor', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A reactor that converts chaotic entropy into usable citadel energy, providing a constant power supply.', lore: 'The Entropy Reactor is a marvel of void engineering. It captures ambient entropy and converts it into clean, usable energy through a process that reverses the natural flow of decay. The more chaotic the surrounding void, the more power it produces.', costPerLevel: 180, bonusType: 'energyRegen', bonusPerLevel: 8 },
  { id: 'dimensional_archive', name: 'Dimensional Archive', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A library containing knowledge from across every known dimension, accessible through dimensional indexing.', lore: 'The Dimensional Archive contains the collected knowledge of every dimension the void has touched. Its shelves stretch across dimensional space, and its books contain information that exists in no single reality. Finding what you need requires a dimensional index.', costPerLevel: 90, bonusType: 'abilityBonus', bonusPerLevel: 3 },
  { id: 'phantom_barracks', name: 'Phantom Barracks', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'Ethereal housing for void phantoms, increasing the citadel\'s warden capacity and phantom recruitment rate.', lore: 'Phantom Barracks exist partially in the phantom dimension, making them larger on the inside than they appear from the outside. Void phantoms housed here rest between missions, their forms stabilized by the barrack\'s dimensional anchor.', costPerLevel: 110, bonusType: 'capacityBonus', bonusPerLevel: 5 },
  { id: 'void_harvester', name: 'Void Harvester', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'An automated harvester that extracts materials from the surrounding void, gathering resources while you command.', lore: 'The Void Harvester reaches into the dimensional fabric and extracts useful materials that have accumulated in the void. It operates continuously, sifting through dimensional debris and depositing valuable materials in the citadel stores.', costPerLevel: 70, bonusType: 'materialBonus', bonusPerLevel: 4 },
  { id: 'shadow_vault', name: 'Shadow Vault', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A vault hidden in shadow space for storing rare void artifacts and precious materials beyond theft.', lore: 'The Shadow Vault exists in a pocket of shadow space accessible only through a specific shadow frequency. Even if an enemy breaches the citadel, they cannot find or enter the vault without knowing its shadow key.', costPerLevel: 160, bonusType: 'defenseBonus', bonusPerLevel: 7 },
  { id: 'abyss_quarry', name: 'Abyss Quarry', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'Deep mining operation that extracts abyssal crystals and null stones from the dimensional bedrock.', lore: 'The Abyss Quarry descends into the dimensional bedrock beneath the citadel, where the pressure of all dimensions compresses raw materials into valuable crystals and stones. The deeper the quarry, the rarer the materials found.', costPerLevel: 95, bonusType: 'materialBonus', bonusPerLevel: 6 },
  { id: 'rift_amplifier', name: 'Rift Amplifier', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'Amplifies the energy output of nearby dimensional rifts, boosting citadel power generation.', lore: 'The Rift Amplifier focuses the chaotic energy of dimensional rifts into a usable beam. It can amplify a small rift into a major power source, providing enough energy to run an entire citadel wing.', costPerLevel: 140, bonusType: 'powerBonus', bonusPerLevel: 5 },
  { id: 'null_sanctuary', name: 'Null Sanctuary', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A healing sanctuary where wounded wardens recover in perfect null stillness, away from all dimensional harm.', lore: 'Within the Null Sanctuary, all external influences are canceled by the null field. Wounded wardens placed here are completely isolated from further harm, and their natural regeneration is accelerated by the perfect stillness.', costPerLevel: 130, bonusType: 'defenseBonus', bonusPerLevel: 4 },
  { id: 'entropy_condenser', name: 'Entropy Condenser', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'Condenses ambient entropy into dense energy crystals that can be stored and used as citadel fuel.', lore: 'The Entropy Condenser captures the chaotic energy of entropy spirits and dimensional decay, compressing it into stable crystals. These entropy crystals are among the most energy-dense materials in the void.', costPerLevel: 170, bonusType: 'energyRegen', bonusPerLevel: 10 },
  { id: 'dimensional_radar', name: 'Dimensional Radar', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'Detects dimensional threats and resource deposits across the void network with increasing precision.', lore: 'The Dimensional Radar scans across dimensional frequencies, detecting threats and resources that would be invisible to normal perception. Higher levels can detect events across entire dimensions and predict dimensional shifts before they occur.', costPerLevel: 85, bonusType: 'materialBonus', bonusPerLevel: 3 },
  { id: 'void_summoning_circle', name: 'Void Summoning Circle', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A powerful summoning circle inscribed with ancient void runes, boosting warden summoning quality and power.', lore: 'The Void Summoning Circle is inscribed with runes from every known dimension, creating a resonance field that attracts and empowers void wardens during summoning. Higher quality summons are virtually guaranteed.', costPerLevel: 250, bonusType: 'summonBonus', bonusPerLevel: 8 },
  { id: 'shadow_training_ground', name: 'Shadow Training Ground', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A dimensionally-shifted arena where wardens hone their combat skills against shadow constructs.', lore: 'The Shadow Training Ground exists in a pocket dimension where time flows differently. Wardens can train for what feels like years while only days pass in the real void. Shadow constructs provide challenging opponents.', costPerLevel: 105, bonusType: 'powerBonus', bonusPerLevel: 6 },
  { id: 'abyss_armory', name: 'Abyss Armory', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'Stocks void weaponry and armor forged from abyssal materials, equipping wardens for dimensional warfare.', lore: 'The Abyss Armory houses weapons and armor forged in the Abyss Forge, ready for distribution to citadel wardens. Each piece is uniquely suited to its assigned warden, growing stronger as the bond between them deepens.', costPerLevel: 135, bonusType: 'defenseBonus', bonusPerLevel: 8 },
  { id: 'rift_workshop', name: 'Rift Workshop', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A workshop for crafting and repairing dimensional technology, including rift gates and dimensional scanners.', lore: 'The Rift Workshop is where dimensional technology is created and maintained. Its specialized equipment can manipulate dimensional fabric directly, creating tools and devices that operate across multiple realities simultaneously.', costPerLevel: 115, bonusType: 'abilityBonus', bonusPerLevel: 5 },
  { id: 'null_shield_generator', name: 'Null Shield Generator', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'Generates a null-energy shield that absorbs and neutralizes incoming dimensional attacks of any magnitude.', lore: 'The Null Shield Generator creates a multi-layered null barrier around the citadel. Each layer cancels a different form of energy — kinetic, thermal, magical, dimensional. Even the most powerful attacks are reduced to nothing.', costPerLevel: 220, bonusType: 'defenseBonus', bonusPerLevel: 12 },
  { id: 'entropy_incubator', name: 'Entropy Incubator', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'An incubator that accelerates the growth and evolution of entropy spirits, producing more powerful variants.', lore: 'The Entropy Incubator provides a controlled environment where entropy spirits can grow and evolve rapidly. By carefully managing the chaos level, keepers can guide entropy spirit evolution toward specific power profiles.', costPerLevel: 190, bonusType: 'powerBonus', bonusPerLevel: 7 },
  { id: 'dimensional_bridge', name: 'Dimensional Bridge', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'A permanent bridge connecting to a specific allied dimension for trade, diplomacy, and resource exchange.', lore: 'Dimensional Bridges are rare and immensely valuable structures. They create permanent, stable connections to specific dimensions, enabling trade of unique resources and alliance with the dimension\'s inhabitants.', costPerLevel: 280, bonusType: 'citadelBonus', bonusPerLevel: 10 },
  { id: 'void_nexus_core', name: 'Void Nexus Core', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'The heart of the citadel, amplifying all other structures within range through void resonance.', lore: 'The Void Nexus Core is the most important structure in any citadel. It creates a resonance field that enhances every other structure connected to it. Without a Nexus Core, a citadel is merely a fortress. With one, it becomes a seat of power.', costPerLevel: 350, bonusType: 'abilityBonus', bonusPerLevel: 8 },
  { id: 'phantom_observatory', name: 'Phantom Observatory', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'An observatory that views events across all connected dimensions in real-time, providing strategic intelligence.', lore: 'The Phantom Observatory uses phantom technology to project real-time images of events across every connected dimension. Its operators can monitor threats, track resources, and coordinate citadel operations across the entire void network.', costPerLevel: 145, bonusType: 'materialBonus', bonusPerLevel: 5 },
  { id: 'eternal_citadel_shield', name: 'Eternal Citadel Shield', maxLevel: VC_MAX_STRUCTURE_LEVEL, description: 'The ultimate defense — a multi-layered shield spanning every dimensional frequency, rendering the citadel virtually invulnerable.', lore: 'The Eternal Citadel Shield is the pinnacle of void defense technology. It projects barriers across every known dimensional frequency simultaneously, creating a defense that no attack from any dimension can penetrate. Only the Void Annihilation ability can theoretically breach it.', costPerLevel: 400, bonusType: 'defenseBonus', bonusPerLevel: 15 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: VC_ABILITIES — 22 Void Abilities
// ═══════════════════════════════════════════════════════════════════

export const VC_ABILITIES: readonly VcAbilityDef[] = [
  // Offensive (6)
  { id: 'void_bolt', name: 'Void Bolt', category: 'offensive', power: 15, cooldown: 3, description: 'Hurl a bolt of concentrated void energy that damages dimensional barriers and tears through matter.', lore: 'The most basic offensive ability, yet devastatingly effective. Void bolts punch through ordinary matter like paper, seeking the dimensional anchor points that hold reality together.', requiredLevel: 1 },
  { id: 'shadow_lance', name: 'Shadow Lance', category: 'offensive', power: 30, cooldown: 8, description: 'Form a lance of pure shadow that pierces through multiple dimensions simultaneously.', lore: 'Shadow Lances are projected from the user\'s shadow across dimensional boundaries, striking targets that exist in parallel realities simultaneously.', requiredLevel: 3 },
  { id: 'abyss_cleave', name: 'Abyss Cleave', category: 'offensive', power: 55, cooldown: 12, description: 'A devastating cleave that channels the crushing pressure of the abyss into a single strike.', lore: 'Abyss Cleave channels the crushing pressure of the interdimensional abyss into a single strike. Nothing forged in any dimension has withstood it.', requiredLevel: 7 },
  { id: 'entropy_blast', name: 'Entropy Blast', category: 'offensive', power: 80, cooldown: 18, description: 'Release a wave of chaotic entropy that disintegrates all matter in its path, leaving only decay.', lore: 'Entropy Blasts are unpredictable even for their users. The wave of chaos they unleash can destroy fortifications, corrupt wardens, and destabilize local dimensional integrity.', requiredLevel: 12 },
  { id: 'dimensional_strike', name: 'Dimensional Strike', category: 'offensive', power: 120, cooldown: 25, description: 'Strike from a parallel dimension, bypassing all defenses. The attack arrives before it is launched.', lore: 'The Dimensional Strike originates from a random parallel dimension, emerging at the target location with no warning. No shield, no barrier, no dimension can block what comes from outside reality.', requiredLevel: 18 },
  { id: 'void_annihilation', name: 'Void Annihilation', category: 'offensive', power: 200, cooldown: 60, description: 'The ultimate void attack — erase a target from all dimensions simultaneously, as if it never existed.', lore: 'Void Annihilation does not destroy. It erases. The target is removed from every dimension, every timeline, every possible reality. As if it never existed at all. This ability can only be used once per cycle.', requiredLevel: 30 },

  // Defensive (6)
  { id: 'void_barrier', name: 'Void Barrier', category: 'defensive', power: 10, cooldown: 5, description: 'Raise a barrier of void energy that absorbs incoming attacks and grows stronger the more it is hit.', lore: 'Void Barriers absorb energy from attacks, growing stronger the more they are hit. Eventually they can reflect the absorbed energy back at the attacker with devastating force.', requiredLevel: 1 },
  { id: 'shadow_veil', name: 'Shadow Veil', category: 'defensive', power: 20, cooldown: 10, description: 'Shroud the citadel in shadow, making it invisible to dimensional scans and physical detection.', lore: 'The Shadow Veil wraps a citadel in layers of living shadow so thick that not even the most sensitive dimensional scanners can penetrate it. The citadel simply vanishes from all detection.', requiredLevel: 4 },
  { id: 'null_dome', name: 'Null Dome', category: 'defensive', power: 40, cooldown: 15, description: 'Generate a dome of null energy that neutralizes all abilities and energy within its radius.', lore: 'The Null Dome creates a sphere of perfect null — a zone where no energy, no magic, no dimensional force can exist. It is the ultimate equalizer.', requiredLevel: 8 },
  { id: 'abyss_wall', name: 'Abyss Wall', category: 'defensive', power: 65, cooldown: 20, description: 'Summon a wall of compressed abyss matter that is virtually indestructible and spans dimensional boundaries.', lore: 'Abyss Walls are forged from matter compressed under infinite dimensional pressure. They are denser than neutron stars, and nothing short of a Void Annihilation can breach them.', requiredLevel: 12 },
  { id: 'rift_mirage', name: 'Rift Mirage', category: 'defensive', power: 35, cooldown: 12, description: 'Create false citadel images across multiple dimensions to confuse and divide attacking forces.', lore: 'Rift Mirages project perfect replicas of the citadel into random dimensions. Attackers never know which citadel is real and which is a phantom.', requiredLevel: 6 },
  { id: 'entropy_absorption', name: 'Entropy Absorption', category: 'defensive', power: 90, cooldown: 30, description: 'Absorb incoming entropy energy and redirect it as a restorative force that heals wardens.', lore: 'Entropy Absorption turns the universe\'s most destructive force into healing energy. The more chaotic the attack, the more powerful the restoration.', requiredLevel: 20 },

  // Utility (5)
  { id: 'void_scan', name: 'Void Scan', category: 'utility', power: 5, cooldown: 2, description: 'Scan the void for hidden resources, dormant wardens, dimensional anomalies, and enemy positions.', lore: 'Void Scan extends the user\'s perception across the local dimensional network, revealing everything within range.', requiredLevel: 1 },
  { id: 'dimensional_blink', name: 'Dimensional Blink', category: 'utility', power: 8, cooldown: 6, description: 'Instantly teleport a short distance by stepping through a micro-rift that opens and closes in an instant.', lore: 'Dimensional Blink creates a momentary micro-rift just large enough to step through.', requiredLevel: 3 },
  { id: 'null_resonance', name: 'Null Resonance', category: 'utility', power: 12, cooldown: 15, description: 'Attune to the null frequency, granting temporary immunity to all void-based effects and abilities.', lore: 'Null Resonance aligns the user\'s dimensional signature with the null frequency.', requiredLevel: 8 },
  { id: 'rift_mapping', name: 'Rift Mapping', category: 'utility', power: 10, cooldown: 20, description: 'Map all dimensional rifts in the vicinity, revealing safe passage routes and hidden connections.', lore: 'Rift Mapping creates a three-dimensional map of every rift and passage in range.', requiredLevel: 12 },
  { id: 'entropy_prediction', name: 'Entropy Prediction', category: 'utility', power: 15, cooldown: 25, description: 'Predict the most likely outcome of current dimensional events by analyzing entropy flow patterns.', lore: 'Entropy Prediction calculates the probability of different outcomes by analyzing the current state of dimensional entropy.', requiredLevel: 18 },

  // Summon (5)
  { id: 'shadow_call', name: 'Shadow Call', category: 'summon', power: 10, cooldown: 10, description: 'Summon a temporary shadow wraith to fight alongside your permanent wardens.', lore: 'The Shadow Call reaches into the shadow dimension and pulls forth a spectral warrior bound by the caller\'s will.', requiredLevel: 2 },
  { id: 'void_gateway', name: 'Void Gateway', category: 'summon', power: 20, cooldown: 20, description: 'Open a gateway to the void, allowing rapid warden deployment to any citadel in the network.', lore: 'The Void Gateway creates a stable passage between the citadel and the deepest void.', requiredLevel: 6 },
  { id: 'abyss_awakening', name: 'Abyss Awakening', category: 'summon', power: 50, cooldown: 35, description: 'Awaken dormant abyss knights from their eternal slumber beneath the citadel foundations.', lore: 'Beneath every citadel, abyss knights sleep in massive crypts, waiting to be called.', requiredLevel: 12 },
  { id: 'null_convergence', name: 'Null Convergence', category: 'summon', power: 70, cooldown: 45, description: 'Converge null energy to temporarily summon a null walker from the between-spaces.', lore: 'Null Convergence focuses the null energy between all nearby dimensions into a single point.', requiredLevel: 20 },
  { id: 'entropy_storm', name: 'Entropy Storm', category: 'summon', power: 100, cooldown: 60, description: 'Summon a localized entropy storm that spawns waves of entropy spirit allies from chaotic energy.', lore: 'The Entropy Storm creates a zone of accelerated entropy that spawns waves of entropy spirits.', requiredLevel: 30 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: VC_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const VC_ACHIEVEMENTS: readonly VcAchievementDef[] = [
  { id: 'ach_first_warden', name: 'First Summoning', description: 'Summon your first void warden and begin your journey into the void.', lore: 'Every great void commander started with a single summoning. The first warden is the seed from which an empire grows.', condition: 'totalSummoned', targetValue: 1, rewardXp: 20, rewardPower: 10 },
  { id: 'ach_five_wardens', name: 'Warden Collector', description: 'Summon 5 different void wardens from across the species.', lore: 'A diverse army is a strong army. Five wardens represent the beginnings of a true void force.', condition: 'totalSummoned', targetValue: 5, rewardXp: 80, rewardPower: 40 },
  { id: 'ach_ten_wardens', name: 'Warden Legion', description: 'Summon 10 different void wardens to form a proper citadel garrison.', lore: 'Ten wardens working in concert can defend a citadel against all but the most devastating dimensional threats.', condition: 'totalSummoned', targetValue: 10, rewardXp: 200, rewardPower: 100 },
  { id: 'ach_twenty_wardens', name: 'Void Commander', description: 'Summon 20 different void wardens, commanding a force that spans all species.', lore: 'Twenty wardens represents true mastery of the summoning arts. The void itself acknowledges your command.', condition: 'totalSummoned', targetValue: 20, rewardXp: 500, rewardPower: 250 },
  { id: 'ach_all_wardens', name: 'Warden Master', description: 'Summon all 35 void wardens, completing the ultimate collection.', lore: 'To hold all 35 wardens under your command is to possess the most complete void army ever assembled.', condition: 'totalSummoned', targetValue: 35, rewardXp: 2000, rewardPower: 1000 },
  { id: 'ach_first_citadel', name: 'Citadel Claimed', description: 'Claim your first citadel location and establish your foothold in the void.', lore: 'The first citadel is the foundation upon which all void power is built. Without territory, there is no authority.', condition: 'totalCitadelsClaimed', targetValue: 1, rewardXp: 30, rewardPower: 15 },
  { id: 'ach_four_citadels', name: 'Citadel Network', description: 'Claim 4 different citadels to establish a defensive network across the void.', lore: 'Four citadels create a network that can support each other against dimensional threats.', condition: 'totalCitadelsClaimed', targetValue: 4, rewardXp: 150, rewardPower: 75 },
  { id: 'ach_all_citadels', name: 'Void Overlord', description: 'Claim all 8 citadel locations, establishing dominion over the entire void network.', lore: 'To hold all eight citadels is to be the void\'s undisputed master. Every dimension answers to your command.', condition: 'totalCitadelsClaimed', targetValue: 8, rewardXp: 1000, rewardPower: 500 },
  { id: 'ach_first_structure', name: 'Foundations Laid', description: 'Build your first citadel structure, beginning the expansion of your void fortress.', lore: 'Every great citadel was built one structure at a time. The first is always the hardest.', condition: 'totalStructuresBuilt', targetValue: 1, rewardXp: 25, rewardPower: 10 },
  { id: 'ach_ten_structures', name: 'Architect of the Void', description: 'Build 10 citadel structures, transforming your citadel into a true fortress.', lore: 'Ten structures working in harmony create a citadel that is far more than the sum of its parts.', condition: 'totalStructuresBuilt', targetValue: 10, rewardXp: 200, rewardPower: 100 },
  { id: 'ach_first_strike', name: 'First Void Strike', description: 'Perform your first void strike attack against a dimensional threat.', lore: 'The first void strike proves your readiness for dimensional warfare. There is no turning back.', condition: 'totalVoidStrikes', targetValue: 1, rewardXp: 15, rewardPower: 5 },
  { id: 'ach_fifty_strikes', name: 'Void Warrior', description: 'Perform 50 void strike attacks, becoming a seasoned veteran of dimensional combat.', lore: 'Fifty void strikes forges a warrior through experience that cannot be taught — only earned.', condition: 'totalVoidStrikes', targetValue: 50, rewardXp: 300, rewardPower: 150 },
  { id: 'ach_first_relic', name: 'Relic Bearer', description: 'Activate your first legendary artifact, tapping into ancient void power.', lore: 'The first artifact is a covenant with the void\'s ancient past. Its power flows through you now.', condition: 'totalRelicsActivated', targetValue: 1, rewardXp: 50, rewardPower: 25 },
  { id: 'ach_five_relics', name: 'Relic Hoarder', description: 'Activate 5 legendary artifacts, amassing a collection of immense void power.', lore: 'Five artifacts resonate with each other, creating a power greater than their individual strengths.', condition: 'totalRelicsActivated', targetValue: 5, rewardXp: 400, rewardPower: 200 },
  { id: 'ach_all_relics', name: 'Relic Master', description: 'Activate all 15 legendary artifacts, achieving complete mastery over ancient void power.', lore: 'All fifteen artifacts united under one commander — a feat achieved by fewer than a handful of void lords throughout history.', condition: 'totalRelicsActivated', targetValue: 15, rewardXp: 2000, rewardPower: 1000 },
  { id: 'ach_first_event', name: 'Event Survivor', description: 'Face your first random void event and survive to tell the tale.', lore: 'The void tests all who enter it. Surviving the first event proves you belong.', condition: 'totalEventsFaced', targetValue: 1, rewardXp: 20, rewardPower: 10 },
  { id: 'ach_ten_events', name: 'Event Veteran', description: 'Survive 10 random void events, earning a reputation as a seasoned void commander.', lore: 'Ten events survived is a mark of true resilience. The void has tested you ten times, and ten times you have endured.', condition: 'totalEventsFaced', targetValue: 10, rewardXp: 250, rewardPower: 125 },
  { id: 'ach_max_structure', name: 'Master Builder', description: 'Max out any citadel structure to its maximum level of 10.', lore: 'A max-level structure represents the pinnacle of void engineering. It stands as a testament to your dedication and resources.', condition: 'totalStructuresBuilt', targetValue: 25, rewardXp: 800, rewardPower: 400 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: VC_TITLES — 8 Titles (Void Initiate → Dimension Overlord)
// ═══════════════════════════════════════════════════════════════════

export const VC_TITLES: readonly VcTitleDef[] = [
  { id: 'void_initiate', name: 'Void Initiate', requirement: 'Summon your first warden and claim your first citadel.', lore: 'The Void Initiate has taken their first step into the darkness. They have glimpsed the void and chosen to remain, setting foot on a path that will lead them through dimensions unseen by mortal eyes.', bonusPercent: 0 },
  { id: 'shadow_acolyte', name: 'Shadow Acolyte', requirement: 'Command 5 wardens and build 3 citadel structures.', lore: 'The Shadow Acolyte has begun to master the shadow arts. Their shadow stretches across multiple dimensions, and the darkness obeys their commands.', bonusPercent: 5 },
  { id: 'rift_guardian', name: 'Rift Guardian', requirement: 'Claim 3 citadels and activate 2 legendary artifacts.', lore: 'The Rift Guardian watches over the dimensional passages with vigilance. They can sense every rift and seal every breach.', bonusPercent: 10 },
  { id: 'abyss_commander', name: 'Abyss Commander', requirement: 'Summon 15 wardens and perform 20 void strikes.', lore: 'The Abyss Commander has earned the respect of the abyss. Knights kneel before them, and the deep trenches echo with their name.', bonusPercent: 15 },
  { id: 'null_sovereign', name: 'Null Sovereign', requirement: 'Claim 5 citadels and unlock 8 achievements.', lore: 'The Null Sovereign commands the spaces between spaces. They walk the null and emerge where they please, unbound by dimensional law.', bonusPercent: 20 },
  { id: 'entropy_lord', name: 'Entropy Lord', requirement: 'Activate 8 artifacts and face 8 void events.', lore: 'The Entropy Lord has faced chaos and mastered it. Entropy spirits bow before them, and decay itself serves their will.', bonusPercent: 28 },
  { id: 'dimensional_walker', name: 'Dimensional Walker', requirement: 'Claim all citadels and summon 25 wardens.', lore: 'The Dimensional Walker has visited every citadel and commanded wardens from every species. They exist in multiple dimensions simultaneously.', bonusPercent: 36 },
  { id: 'dimension_overlord', name: 'Dimension Overlord', requirement: 'Master the void — unlock all achievements and claim every citadel.', lore: 'The Dimension Overlord is the supreme ruler of the void. Every citadel answers to them, every warden serves them, and every dimension bends to their will. Their power is absolute.', bonusPercent: 50 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: VC_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const VC_ARTIFACTS: readonly VcArtifactDef[] = [
  { id: 'crown_of_void', name: 'Crown of the Void', description: 'A crown forged from the first void ever created, granting dominion over all shadow wraiths and shadow-based abilities.', lore: 'The Crown of the Void was forged in the instant the first void was born — the moment before the first dimension existed. It contains the primordial darkness from which all shadow wraiths descend.', bonus: '+25% shadow wraith power', power: 120, rarity: 'epic' },
  { id: 'blade_of_abyss', name: 'Blade of the Abyss', description: 'A greatsword quenched in the deepest abyssal trench, cutting through dimensional barriers and any defense.', lore: 'The Blade of the Abyss was tempered in the crushing depths where all dimensions compress. It can cut through reality itself, slicing dimensional barriers as easily as air.', bonus: '+20% void strike damage', power: 150, rarity: 'epic' },
  { id: 'orb_of_null', name: 'Orb of Null', description: 'A sphere of perfect null energy that silences all magical effects and void abilities within its radius.', lore: 'The Orb of Null was created by the first Null Walker as a tool of absolute peace. Within its influence, all conflict ceases because all power is canceled.', bonus: '+30% defense bonus', power: 130, rarity: 'epic' },
  { id: 'rift_key_eternal', name: 'Eternal Rift Key', description: 'A key that can open any dimensional rift, even those sealed by the Ancient Sealer millennia ago.', lore: 'The Eternal Rift Key is one of the eight Dimensional Keys, said to have been created by the first Dimension Overlord. It can unlock any seal, any barrier, any lock across all dimensions.', bonus: '+15% citadel capacity', power: 100, rarity: 'rare' },
  { id: 'entropy_cauldron', name: 'Entropy Cauldron', description: 'A cauldron that brews entropy spirits from raw chaotic energy, producing powerful allies on demand.', lore: 'The Entropy Cauldron was discovered in the shell of a dead dimension, still bubbling with the entropy of its destruction. It can convert raw chaos into entropy spirits of remarkable power.', bonus: '+20% entropy spirit power', power: 110, rarity: 'epic' },
  { id: 'dimensional_compass', name: 'Dimensional Compass', description: 'A compass that always points toward the nearest dimensional resource deposit, regardless of which dimension it is in.', lore: 'The Dimensional Compass was crafted by the first Dimension Hunter from a shard of the dimensional fabric. Its needle points not north, but toward the nearest source of dimensional value.', bonus: '+25% material yield', power: 90, rarity: 'rare' },
  { id: 'phantom_cloak', name: 'Phantom Cloak', description: 'A cloak woven from phantom tears, granting the wearer intangibility and invisibility across all dimensions.', lore: 'The Phantom Cloak renders its wearer simultaneously invisible and intangible in every dimension. To observe a cloaked figure is to perceive a faint shimmer that might be nothing more than a trick of the void light.', bonus: '+35% evasion chance', power: 140, rarity: 'epic' },
  { id: 'void_heart_shard', name: 'Void Heart Shard', description: 'A shard of the legendary Void Heart, pulsing with infinite dark energy that warps nearby space.', lore: 'The Void Heart is the theoretical core of the void itself. A shard of it contains more energy than most citadels generate in a millennium. To hold one is to hold a piece of the void\'s soul.', bonus: '+40% void power regeneration', power: 200, rarity: 'legendary' },
  { id: 'abyssal_crown', name: 'Abyssal Crown', description: 'A crown of abyssal iron that commands absolute loyalty from abyss knights and all abyss-based entities.', lore: 'The Abyssal Crown was forged in the deepest trench of the interdimensional abyss, under pressure that would crush mountains into atoms. It resonates with the frequency of absolute loyalty.', bonus: '+30% abyss knight power', power: 170, rarity: 'legendary' },
  { id: 'null_mantle', name: 'Null Mantle', description: 'A mantle of absolute nothingness that absorbs all forms of damage, converting attacks into null energy.', lore: 'The Null Mantle is the most powerful defensive artifact known. It wraps the wearer in a layer of perfect null that absorbs any form of attack, converting the destructive energy into harmless null.', bonus: '+50% damage absorption', power: 220, rarity: 'legendary' },
  { id: 'rift_crystal_matrix', name: 'Rift Crystal Matrix', description: 'A matrix of interconnected rift crystals that stabilizes all dimensional passages within range.', lore: 'The Rift Crystal Matrix was assembled over centuries by generations of rift keepers. Its crystals resonate in perfect harmony, creating a field that prevents dimensional instability.', bonus: '+20% structure bonus effectiveness', power: 95, rarity: 'rare' },
  { id: 'entropy_prism_shard', name: 'Entropy Prism Shard', description: 'A shard of the legendary Entropy Prism, radiating chaotic energy that accelerates all processes.', lore: 'A shard of the Entropy Prism is a fragment of universal decay made solid. It radiates chaotic energy that accelerates all natural processes — growth, decay, transformation — within its field.', bonus: '+25% entropy ability power', power: 135, rarity: 'epic' },
  { id: 'shadow_mirror', name: 'Shadow Mirror', description: 'A mirror that reflects attacks back through the dimensional plane they came from, turning strength against itself.', lore: 'The Shadow Mirror does not merely reflect attacks — it sends them back through the dimensional plane they originated from, often hitting the attacker with amplified force.', bonus: '+30% counter-attack damage', power: 160, rarity: 'epic' },
  { id: 'dimensional_anvil', name: 'Dimensional Anvil', description: 'An anvil that can reshape the fabric of dimensions under tremendous force, forging new realities.', lore: 'The Dimensional Anvil was used by the first Dimension Overlord to shape the early dimensional network. Upon it, the fabric of reality itself can be hammered and reshaped.', bonus: '+20% structure build speed', power: 105, rarity: 'rare' },
  { id: 'void_sovereign_scepter', name: 'Void Sovereign Scepter', description: 'The scepter of absolute authority over the void, wielded only by the Dimension Overlord. Its power is without limit.', lore: 'The Void Sovereign Scepter is the symbol and source of the Dimension Overlord\'s authority. It channels the combined power of every dimension in the void network, and its wielder commands reality itself.', bonus: '+50% all warden power', power: 300, rarity: 'legendary' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: VC_EVENTS — 12 Random Void Events
// ═══════════════════════════════════════════════════════════════════

export const VC_EVENTS: readonly VcEventDef[] = [
  { id: 'evt_rift_storm', name: 'Rift Storm', description: 'A violent dimensional storm tears through the void, damaging citadel barriers and disrupting rift connections.', lore: 'Rift Storms occur when multiple dimensional rifts destabilize simultaneously, creating cascading waves of dimensional energy that batter everything in their path.', effect: '-15% citadel defense for a duration', severity: 4, rewardMaterialId: 'rift_essence', rewardMaterialCount: 5 },
  { id: 'evt_shadow_surge', name: 'Shadow Surge', description: 'A massive surge of shadow energy floods the citadel corridors, empowering shadow wraiths temporarily.', lore: 'Shadow Surges are caused by dimensional alignments that compress shadow dimensions, releasing vast quantities of shadow energy that floods through connected rifts.', effect: '+30% shadow wraith power temporarily', severity: 2, rewardMaterialId: 'shadow_essence', rewardMaterialCount: 3 },
  { id: 'evt_null_quake', name: 'Null Quake', description: 'The null space between dimensions shudders violently, destabilizing all rift connections in the network.', lore: 'Null Quakes shake the very foundations of dimensional space. When the null between dimensions shifts, every rift, passage, and gateway trembles with it.', effect: 'All rift gates disabled temporarily', severity: 5, rewardMaterialId: 'null_pebble', rewardMaterialCount: 8 },
  { id: 'evt_entropy_bloom', name: 'Entropy Bloom', description: 'Entropy spirits undergo a rapid blooming event, swarming the citadel with chaotic energy.', lore: 'Entropy Blooms are rare natural events where entropy spirits reproduce explosively, filling the void with their chaotic presence. While dangerous, the residual entropy residue they leave behind is valuable.', effect: '+50% entropy spirit summoning rate temporarily', severity: 3, rewardMaterialId: 'entropy_spark', rewardMaterialCount: 4 },
  { id: 'evt_void_echo', name: 'Void Echo', description: 'Echoes from erased dimensions reverberate through the void network, revealing hidden secrets.', lore: 'Void Echoes are the fading memories of dimensions that no longer exist. When they resonate, they temporarily reveal things that are normally hidden — secret passages, buried resources, and dormant wardens.', effect: 'Reveal hidden material deposits across all citadels', severity: 1, rewardMaterialId: 'null_echo', rewardMaterialCount: 2 },
  { id: 'evt_abyssal_tide', name: 'Abyssal Tide', description: 'The abyss rises, flooding lower citadel levels with crushing interdimensional pressure.', lore: 'Abyssal Tides occur when the pressure in the interdimensional abyss spikes dramatically, sending waves of compressed reality crashing through lower citadel levels.', effect: '-20% capacity in affected citadels', severity: 4, rewardMaterialId: 'abyssal_iron', rewardMaterialCount: 6 },
  { id: 'evt_dimensional_convergence', name: 'Dimensional Convergence', description: 'Multiple dimensions briefly align, creating unprecedented power surges across the void network.', lore: 'Dimensional Convergences are rare cosmic events where multiple dimensions align perfectly, amplifying all energy and power across the void network. They are times of great opportunity and great danger.', effect: '+40% all warden power temporarily', severity: 1, rewardMaterialId: 'dimensional_mote', rewardMaterialCount: 10 },
  { id: 'evt_phantom_invasion', name: 'Phantom Invasion', description: 'Rogue phantoms pour through a dimensional breach, launching a coordinated attack on the citadel.', lore: 'Phantom Invasions occur when a dimensional breach opens near a phantom dimension, allowing rogue phantoms to flood through in vast numbers. They attack in coordinated waves.', effect: 'Citadel defense must repel phantom waves', severity: 5, rewardMaterialId: 'phantom_tear', rewardMaterialCount: 3 },
  { id: 'evt_rift_collapse', name: 'Rift Collapse', description: 'A major rift collapses, stranding resources and wardens between dimensions temporarily.', lore: 'Rift Collapses are among the most feared events in the void. When a major rift collapses, anything passing through it at the time becomes stranded between dimensions until the rift can be reopened.', effect: 'Lose access to one citadel temporarily', severity: 4, rewardMaterialId: 'rift_thread', rewardMaterialCount: 7 },
  { id: 'evt_null_awakening', name: 'Null Awakening', description: 'Ancient null walkers stir from dormancy in the space between dimensions, offering their allegiance.', lore: 'Null Awakenings are rare events where dormant null walkers scattered throughout the inter-dimensional null space stir to consciousness and seek a commander to serve.', effect: 'Free null walker summoning opportunity', severity: 1, rewardMaterialId: 'null_resonance_stone', rewardMaterialCount: 2 },
  { id: 'evt_entropy_cascade', name: 'Entropy Cascade', description: 'A chain reaction of entropy threatens to consume the entire citadel, accelerating all decay.', lore: 'Entropy Cascades are the most dangerous entropy events. A small entropy disruption triggers a chain reaction that accelerates exponentially, threatening to consume the entire citadel in chaos.', effect: 'All wardens lose 10% power unless stopped', severity: 5, rewardMaterialId: 'entropy_crystal', rewardMaterialCount: 3 },
  { id: 'evt_void_gift', name: 'Void Gift', description: 'The void itself offers a rare and precious gift — a legendary material or artifact fragment.', lore: 'Void Gifts are the void\'s way of rewarding worthy commanders. They appear without warning, manifesting as a shimmering deposit of legendary materials or a fragment of an ancient artifact.', effect: 'Receive legendary material or artifact shard', severity: 0, rewardMaterialId: 'void_heart_fragment', rewardMaterialCount: 1 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function vcFindRarityColor(rarity: VcRarity): string {
  const found = VC_RARITIES.find(r => r.id === rarity)
  if (found) return found.color
  return '#7F8C8D'
}

export function vcFindSpeciesColor(species: VcSpecies): string {
  const found = VC_SPECIES.find(s => s.id === species)
  if (found) return found.color
  return VC_VOID_PURPLE
}

export function vcCalcRarityMultiplier(rarity: VcRarity): number {
  const found = VC_RARITIES.find(r => r.id === rarity)
  if (found) return found.multiplier
  return 1
}

export function vcCalcStructureCost(structureId: string, currentLevel: number): number {
  const def = VC_STRUCTURES.find(s => s.id === structureId)
  if (!def) return 0
  return Math.floor(def.costPerLevel * Math.pow(1.4, currentLevel))
}

export function vcCalcStructureBonus(structureId: string, level: number): number {
  const def = VC_STRUCTURES.find(s => s.id === structureId)
  if (!def) return 0
  return def.bonusPerLevel * level
}

function vcCalcWardenTotalPower(wardenId: string, wardenLevel: number): number {
  const def = VC_WARDENS.find(w => w.id === wardenId)
  if (!def) return 0
  return Math.floor(def.power * wardenLevel * vcCalcRarityMultiplier(def.rarity))
}

function vcCalcWardenDefense(wardenId: string, wardenLevel: number): number {
  const def = VC_WARDENS.find(w => w.id === wardenId)
  if (!def) return 0
  return Math.floor(def.defense * wardenLevel * vcCalcRarityMultiplier(def.rarity))
}

function vcCalcCitadelLevel(state: VoidCitadelState): number {
  const s = state.vcStats
  const raw = (s.totalSummoned * 2 + s.totalCitadelsClaimed * 10 + s.totalStructuresBuilt * 3 + s.totalVoidStrikes + s.totalRelicsActivated * 5 + s.totalEventsFaced * 2) / 10
  return Math.min(VC_MAX_LEVEL, Math.floor(raw) + 1)
}

function vcCalcRiftEnergy(state: VoidCitadelState): number {
  let base = VC_STARTING_RIFT_ENERGY
  for (const sId of Object.keys(state.vcStructures)) {
    const sLevel = state.vcStructures[sId]
    if (sLevel <= 0) continue
    const def = VC_STRUCTURES.find(s => s.id === sId)
    if (def && def.bonusType === 'energyRegen') {
      base += vcCalcStructureBonus(sId, sLevel)
    }
  }
  for (const artId of state.vcArtifacts) {
    const def = VC_ARTIFACTS.find(a => a.id === artId)
    if (def) {
      base += Math.floor(def.power * 0.1)
    }
  }
  return base
}

function vcCheckAndAwardAchievements(state: VoidCitadelState): string[] {
  const statsMap: Record<string, number> = {
    totalSummoned: state.vcStats.totalSummoned,
    totalCitadelsClaimed: state.vcStats.totalCitadelsClaimed,
    totalStructuresBuilt: state.vcStats.totalStructuresBuilt,
    totalVoidStrikes: state.vcStats.totalVoidStrikes,
    totalRelicsActivated: state.vcStats.totalRelicsActivated,
    totalEventsFaced: state.vcStats.totalEventsFaced,
  }

  const newAchievements: string[] = []
  for (const ach of VC_ACHIEVEMENTS) {
    if (state.vcAchievements.includes(ach.id)) continue
    const value = statsMap[ach.condition] ?? 0
    if (value >= ach.targetValue) {
      newAchievements.push(ach.id)
    }
  }
  return newAchievements
}

function vcDetermineTitle(level: number): string {
  const thresholds = [5, 10, 15, 20, 25, 30, 38, 45]
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (level >= thresholds[i]) {
      return VC_TITLES[i].id
    }
  }
  return VC_TITLES[0].id
}

function vcDetermineTitleProgress(level: number): { current: VcTitleDef; next: VcTitleDef | null; percent: number } {
  const thresholds = [5, 10, 15, 20, 25, 30, 38, 45]
  let currentIndex = 0
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (level >= thresholds[i]) {
      currentIndex = i
      break
    }
  }

  const current = VC_TITLES[currentIndex]
  if (currentIndex >= VC_TITLES.length - 1) {
    return { current, next: null, percent: 100 }
  }

  const next = VC_TITLES[currentIndex + 1]
  const prevThreshold = thresholds[currentIndex]
  const nextThreshold = thresholds[currentIndex + 1]
  const percent = Math.min(100, Math.floor(((level - prevThreshold) / (nextThreshold - prevThreshold)) * 100))

  return { current, next, percent }
}

function vcXpRequired(level: number): number {
  if (level <= 0) return 0
  if (level >= VC_MAX_LEVEL) return Infinity
  return Math.floor(VC_XP_PER_LEVEL * Math.pow(VC_XP_SCALE, level - 1))
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const VC_INITIAL_STATE: VoidCitadelState = {
  vcLevel: 1,
  vcVoidPower: VC_STARTING_VOID_POWER,
  vcRiftEnergy: VC_STARTING_RIFT_ENERGY,
  vcWardens: {},
  vcCitadels: {},
  vcStructures: {},
  vcArtifacts: [],
  vcAchievements: [],
  vcInventory: {},
  vcStats: {
    totalSummoned: 0,
    totalCitadelsClaimed: 0,
    totalStructuresBuilt: 0,
    totalVoidStrikes: 0,
    totalRelicsActivated: 0,
    totalEventsFaced: 0,
    totalAbilitiesCast: 0,
    totalMaterialGathered: 0,
    totalDamageDealt: 0,
  },
  vcTitle: 'void_initiate',
}

const useVoidCitadelStore = create<VoidCitadelState>()(
  persist(
    () => ({
      ...VC_INITIAL_STATE,
    }),
    {
      name: 'void-citadel-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: MAIN HOOK — useVoidCitadel
// ═══════════════════════════════════════════════════════════════════

export default function useVoidCitadel() {
  const state = useVoidCitadelStore()
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // ─── Computed Values ──────────────────────────────────────────

  const vcActiveWardenCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.vcWardens)) {
      const w = state.vcWardens[key]
      if (w && w.summoned) count++
    }
    return count
  }, [state])

  const vcTotalWardenPower = useMemo(() => {
    let total = 0
    for (const key of Object.keys(state.vcWardens)) {
      const w = state.vcWardens[key]
      if (w && w.summoned) {
        total += vcCalcWardenTotalPower(key, w.level)
      }
    }
    return total
  }, [state])

  const vcTotalWardenDefense = useMemo(() => {
    let total = 0
    for (const key of Object.keys(state.vcWardens)) {
      const w = state.vcWardens[key]
      if (w && w.summoned) {
        total += vcCalcWardenDefense(key, w.level)
      }
    }
    return total
  }, [state])

  const vcClaimedCitadelCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.vcCitadels)) {
      const c = state.vcCitadels[key]
      if (c && c.claimed) count++
    }
    return count
  }, [state])

  const vcCitadelEfficiency = useMemo(() => {
    const citadels = Object.values(state.vcCitadels)
    if (citadels.length === 0) return 0
    let total = 0
    for (const c of citadels) {
      if (c.claimed) {
        total += c.level * 10
      }
    }
    return Math.round(total / VC_CITADELS.length)
  }, [state])

  const vcMaxRiftEnergy = useMemo(() => {
    return vcCalcRiftEnergy(state)
  }, [state])

  const vcArtifactPower = useMemo(() => {
    let total = 0
    for (const artifactId of state.vcArtifacts) {
      const def = VC_ARTIFACTS.find(a => a.id === artifactId)
      if (def) {
        total += def.power
      }
    }
    return total
  }, [state])

  const vcTotalStructureBonus = useMemo(() => {
    let total = 0
    for (const key of Object.keys(state.vcStructures)) {
      total += vcCalcStructureBonus(key, state.vcStructures[key])
    }
    return total
  }, [state])

  const vcAchievementProgress = useMemo(() => {
    if (VC_ACHIEVEMENTS.length === 0) return 0
    return Math.round((state.vcAchievements.length / VC_ACHIEVEMENTS.length) * 100)
  }, [state])

  const vcAvailableEvents = useMemo(() => {
    return VC_EVENTS
  }, [state])

  const vcCitadelLevel = useMemo(() => {
    return vcCalcCitadelLevel(state)
  }, [state])

  const vcCurrentTitleDef = useMemo(() => {
    const found = VC_TITLES.find(t => t.id === state.vcTitle)
    if (found) return found
    return VC_TITLES[0]
  }, [state])

  const vcTitleProgress = useMemo(() => {
    return vcDetermineTitleProgress(vcCalcCitadelLevel(state))
  }, [state])

  const vcEffectiveMultiplier = useMemo(() => {
    return 1 + (vcCurrentTitleDef.bonusPercent / 100) + (vcArtifactPower / 1000)
  }, [state, vcCurrentTitleDef, vcArtifactPower])

  const vcHasRareWarden = useMemo(() => {
    for (const key of Object.keys(state.vcWardens)) {
      const w = state.vcWardens[key]
      if (w && w.summoned) {
        const def = VC_WARDENS.find(d => d.id === key)
        if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
          return true
        }
      }
    }
    return false
  }, [state])

  const vcHasLegendaryWarden = useMemo(() => {
    for (const key of Object.keys(state.vcWardens)) {
      const w = state.vcWardens[key]
      if (w && w.summoned) {
        const def = VC_WARDENS.find(d => d.id === key)
        if (def && def.rarity === 'legendary') {
          return true
        }
      }
    }
    return false
  }, [state])

  const vcHasLegendaryArtifact = useMemo(() => {
    for (const artId of state.vcArtifacts) {
      const def = VC_ARTIFACTS.find(a => a.id === artId)
      if (def && def.rarity === 'legendary') {
        return true
      }
    }
    return false
  }, [state])

  const vcTotalInventoryCount = useMemo(() => {
    let total = 0
    for (const key of Object.keys(state.vcInventory)) {
      total += state.vcInventory[key]
    }
    return total
  }, [state])

  const vcTotalInventoryValue = useMemo(() => {
    let total = 0
    for (const key of Object.keys(state.vcInventory)) {
      const def = VC_MATERIALS.find(m => m.id === key)
      if (def) {
        total += def.value * state.vcInventory[key]
      }
    }
    return total
  }, [state])

  const vcUnlockedAbilities = useMemo(() => {
    const abilities: VcAbilityDef[] = []
    const level = vcCalcCitadelLevel(state)
    for (const ab of VC_ABILITIES) {
      if (level >= ab.requiredLevel) {
        abilities.push(ab)
      }
    }
    return abilities
  }, [state])

  const vcRareMaterialCount = useMemo(() => {
    let count = 0
    for (const key of Object.keys(state.vcInventory)) {
      if (state.vcInventory[key] > 0) {
        const def = VC_MATERIALS.find(m => m.id === key)
        if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
          count++
        }
      }
    }
    return count
  }, [state])

  const vcStructureLevelAvg = useMemo(() => {
    let total = 0
    let count = 0
    for (const key of Object.keys(state.vcStructures)) {
      total += state.vcStructures[key]
      count++
    }
    if (count === 0) return 0
    return Math.round(total / count)
  }, [state])

  const vcWardensBySpecies = useMemo(() => {
    const result: Record<VcSpecies, number> = {
      shadow_wraith: 0,
      void_phantom: 0,
      abyss_knight: 0,
      null_walker: 0,
      dimension_hunter: 0,
      rift_keeper: 0,
      entropy_spirit: 0,
    }
    for (const key of Object.keys(state.vcWardens)) {
      const w = state.vcWardens[key]
      if (w && w.summoned) {
        const def = VC_WARDENS.find(d => d.id === key)
        if (def) {
          result[def.species] += 1
        }
      }
    }
    return result
  }, [state])

  const vcWardensByRarity = useMemo(() => {
    const result: Record<VcRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const key of Object.keys(state.vcWardens)) {
      const w = state.vcWardens[key]
      if (w && w.summoned) {
        const def = VC_WARDENS.find(d => d.id === key)
        if (def) {
          result[def.rarity] += 1
        }
      }
    }
    return result
  }, [state])

  const vcCombatPower = useMemo(() => {
    return Math.floor((vcTotalWardenPower + vcTotalWardenDefense) * vcEffectiveMultiplier)
  }, [vcTotalWardenPower, vcTotalWardenDefense, vcEffectiveMultiplier])

  const vcTotalDefenseBonus = useMemo(() => {
    let total = 0
    for (const key of Object.keys(state.vcStructures)) {
      const sLevel = state.vcStructures[key]
      if (sLevel <= 0) continue
      const def = VC_STRUCTURES.find(s => s.id === key)
      if (def && def.bonusType === 'defenseBonus') {
        total += vcCalcStructureBonus(key, sLevel)
      }
    }
    return total
  }, [state])

  // ─── Action Functions ──────────────────────────────────────────

  const vcSummonWarden = useMemo(() => {
    return (id: string): boolean => {
      const wardenDef = VC_WARDENS.find(w => w.id === id)
      if (!wardenDef) return false

      let success = false
      useVoidCitadelStore.setState((prev) => {
        if (prev.vcWardens[id]?.summoned) return prev
        success = true
        return {
          vcWardens: {
            ...prev.vcWardens,
            [id]: { summoned: true, level: 1, exp: 0, nickname: '', timesUsed: 0 },
          },
          vcStats: {
            ...prev.vcStats,
            totalSummoned: prev.vcStats.totalSummoned + 1,
          },
        }
      })

      if (success) {
        const s = useVoidCitadelStore.getState()
        const newAchs = vcCheckAndAwardAchievements(s)
        if (newAchs.length > 0) {
          useVoidCitadelStore.setState((prev) => ({
            vcAchievements: [...prev.vcAchievements, ...newAchs],
            vcVoidPower: prev.vcVoidPower + newAchs.reduce((sum, achId) => {
              const ach = VC_ACHIEVEMENTS.find(a => a.id === achId)
              return sum + (ach?.rewardPower ?? 0)
            }, 0),
          }))
        }
        const newLevel = vcCalcCitadelLevel(useVoidCitadelStore.getState())
        const newTitle = vcDetermineTitle(newLevel)
        useVoidCitadelStore.setState((prev) => ({
          vcLevel: newLevel,
          vcTitle: newTitle,
        }))
      }

      return success
    }
  }, [])

  const vcCitadelClaim = useMemo(() => {
    return (id: string): boolean => {
      const citadelDef = VC_CITADELS.find(c => c.id === id)
      if (!citadelDef) return false

      let success = false
      useVoidCitadelStore.setState((prev) => {
        if (prev.vcCitadels[id]?.claimed) return prev
        success = true
        return {
          vcCitadels: {
            ...prev.vcCitadels,
            [id]: {
              claimed: true,
              level: citadelDef.level,
              garrisonCount: 0,
              explorationPercent: 0,
              lastVisitedAt: Date.now(),
              totalResourcesGathered: 0,
            },
          },
          vcStats: {
            ...prev.vcStats,
            totalCitadelsClaimed: prev.vcStats.totalCitadelsClaimed + 1,
          },
        }
      })

      if (success) {
        const s = useVoidCitadelStore.getState()
        const newAchs = vcCheckAndAwardAchievements(s)
        if (newAchs.length > 0) {
          useVoidCitadelStore.setState((prev) => ({
            vcAchievements: [...prev.vcAchievements, ...newAchs],
            vcVoidPower: prev.vcVoidPower + newAchs.reduce((sum, achId) => {
              const ach = VC_ACHIEVEMENTS.find(a => a.id === achId)
              return sum + (ach?.rewardPower ?? 0)
            }, 0),
          }))
        }
        const newLevel = vcCalcCitadelLevel(useVoidCitadelStore.getState())
        const newTitle = vcDetermineTitle(newLevel)
        useVoidCitadelStore.setState((prev) => ({
          vcLevel: newLevel,
          vcTitle: newTitle,
        }))
      }

      return success
    }
  }, [])

  const vcBuildStructure = useMemo(() => {
    return (id: string): boolean => {
      const structDef = VC_STRUCTURES.find(s => s.id === id)
      if (!structDef) return false

      let success = false
      useVoidCitadelStore.setState((prev) => {
        const currentLevel = prev.vcStructures[id] || 0
        if (currentLevel >= structDef.maxLevel) return prev

        success = true
        return {
          vcStructures: {
            ...prev.vcStructures,
            [id]: currentLevel + 1,
          },
          vcStats: {
            ...prev.vcStats,
            totalStructuresBuilt: prev.vcStats.totalStructuresBuilt + 1,
          },
        }
      })

      if (success) {
        const s = useVoidCitadelStore.getState()
        const newAchs = vcCheckAndAwardAchievements(s)
        if (newAchs.length > 0) {
          useVoidCitadelStore.setState((prev) => ({
            vcAchievements: [...prev.vcAchievements, ...newAchs],
            vcVoidPower: prev.vcVoidPower + newAchs.reduce((sum, achId) => {
              const ach = VC_ACHIEVEMENTS.find(a => a.id === achId)
              return sum + (ach?.rewardPower ?? 0)
            }, 0),
          }))
        }
        const newLevel = vcCalcCitadelLevel(useVoidCitadelStore.getState())
        const newTitle = vcDetermineTitle(newLevel)
        useVoidCitadelStore.setState((prev) => ({
          vcLevel: newLevel,
          vcTitle: newTitle,
        }))
      }

      return success
    }
  }, [])

  const vcVoidStrike = useMemo(() => {
    return (): number => {
      let damage = 0
      useVoidCitadelStore.setState((prev) => {
        let baseDamage = 0
        for (const key of Object.keys(prev.vcWardens)) {
          const w = prev.vcWardens[key]
          if (w && w.summoned) {
            baseDamage += vcCalcWardenTotalPower(key, w.level)
          }
        }
        damage = Math.floor(baseDamage * (1 + prev.vcStats.totalVoidStrikes * 0.01))

        return {
          vcStats: {
            ...prev.vcStats,
            totalVoidStrikes: prev.vcStats.totalVoidStrikes + 1,
            totalDamageDealt: prev.vcStats.totalDamageDealt + damage,
          },
          vcVoidPower: prev.vcVoidPower + Math.floor(damage * 0.1),
        }
      })

      const s = useVoidCitadelStore.getState()
      const newAchs = vcCheckAndAwardAchievements(s)
      if (newAchs.length > 0) {
        useVoidCitadelStore.setState((prev) => ({
          vcAchievements: [...prev.vcAchievements, ...newAchs],
          vcVoidPower: prev.vcVoidPower + newAchs.reduce((sum, achId) => {
            const ach = VC_ACHIEVEMENTS.find(a => a.id === achId)
            return sum + (ach?.rewardPower ?? 0)
          }, 0),
        }))
      }
      const newLevel = vcCalcCitadelLevel(useVoidCitadelStore.getState())
      const newTitle = vcDetermineTitle(newLevel)
      useVoidCitadelStore.setState((prev) => ({
        vcLevel: newLevel,
        vcTitle: newTitle,
      }))

      return damage
    }
  }, [])

  const vcActivateRelic = useMemo(() => {
    return (id: string): boolean => {
      const artDef = VC_ARTIFACTS.find(a => a.id === id)
      if (!artDef) return false

      let success = false
      useVoidCitadelStore.setState((prev) => {
        if (prev.vcArtifacts.includes(id)) return prev

        success = true
        return {
          vcArtifacts: [...prev.vcArtifacts, id],
          vcStats: {
            ...prev.vcStats,
            totalRelicsActivated: prev.vcStats.totalRelicsActivated + 1,
          },
          vcVoidPower: prev.vcVoidPower + artDef.power,
        }
      })

      if (success) {
        const s = useVoidCitadelStore.getState()
        const newAchs = vcCheckAndAwardAchievements(s)
        if (newAchs.length > 0) {
          useVoidCitadelStore.setState((prev) => ({
            vcAchievements: [...prev.vcAchievements, ...newAchs],
            vcVoidPower: prev.vcVoidPower + newAchs.reduce((sum, achId) => {
              const ach = VC_ACHIEVEMENTS.find(a => a.id === achId)
              return sum + (ach?.rewardPower ?? 0)
            }, 0),
          }))
        }
        const newLevel = vcCalcCitadelLevel(useVoidCitadelStore.getState())
        const newTitle = vcDetermineTitle(newLevel)
        useVoidCitadelStore.setState((prev) => ({
          vcLevel: newLevel,
          vcTitle: newTitle,
        }))
      }

      return success
    }
  }, [])

  const resetVoidCitadel = useMemo(() => {
    return () => {
      useVoidCitadelStore.setState({
        ...VC_INITIAL_STATE,
      })
    }
  }, [])

  // ─── Lookup Helper Functions ───────────────────────────────────

  const vcGetWardenDef = (id: string): VcWardenDef | null => {
    return VC_WARDENS.find(w => w.id === id) ?? null
  }

  const vcGetCitadelDef = (id: string): VcCitadelDef | null => {
    return VC_CITADELS.find(c => c.id === id) ?? null
  }

  const vcGetMaterialDef = (id: string): VcMaterialDef | null => {
    return VC_MATERIALS.find(m => m.id === id) ?? null
  }

  const vcGetStructureDef = (id: string): VcStructureDef | null => {
    return VC_STRUCTURES.find(s => s.id === id) ?? null
  }

  const vcGetAbilityDef = (id: string): VcAbilityDef | null => {
    return VC_ABILITIES.find(a => a.id === id) ?? null
  }

  const vcGetAchievementDef = (id: string): VcAchievementDef | null => {
    return VC_ACHIEVEMENTS.find(a => a.id === id) ?? null
  }

  const vcGetTitleDef = (id: string): VcTitleDef | null => {
    return VC_TITLES.find(t => t.id === id) ?? null
  }

  const vcGetArtifactDef = (id: string): VcArtifactDef | null => {
    return VC_ARTIFACTS.find(a => a.id === id) ?? null
  }

  const vcGetEventDef = (id: string): VcEventDef | null => {
    return VC_EVENTS.find(e => e.id === id) ?? null
  }

  const vcGetRarityDef = (id: string): (typeof VC_RARITIES)[number] | null => {
    return VC_RARITIES.find(r => r.id === id) ?? null
  }

  const vcGetSpeciesDef = (id: string): (typeof VC_SPECIES)[number] | null => {
    return VC_SPECIES.find(s => s.id === id) ?? null
  }

  const vcFindRarityColorFor = (rarity: VcRarity): string => {
    return vcFindRarityColor(rarity)
  }

  const vcFindSpeciesColorFor = (species: VcSpecies): string => {
    return vcFindSpeciesColor(species)
  }

  const vcCalcRarityMultiplierFor = (rarity: VcRarity): number => {
    return vcCalcRarityMultiplier(rarity)
  }

  const vcCalcStructureCostFor = (structureId: string, currentLevel: number): number => {
    return vcCalcStructureCost(structureId, currentLevel)
  }

  const vcCalcStructureBonusFor = (structureId: string, level: number): number => {
    return vcCalcStructureBonus(structureId, level)
  }

  const vcCalcWardenPowerFor = (wardenId: string, wardenLevel: number): number => {
    return vcCalcWardenTotalPower(wardenId, wardenLevel)
  }

  const vcCalcWardenDefenseFor = (wardenId: string, wardenLevel: number): number => {
    return vcCalcWardenDefense(wardenId, wardenLevel)
  }

  const vcXpRequiredFor = (level: number): number => {
    return vcXpRequired(level)
  }

  const vcGetTitleProgress = (): VcTitleProgress => {
    return vcDetermineTitleProgress(vcCalcCitadelLevel(state))
  }

  // ─── Compose and Return the vcAPI Object (PLAIN OBJECT) ───────

  return {
    // ── Constants ──────────────────────────────────────────────
    VC_WARDENS,
    VC_CITADELS,
    VC_MATERIALS,
    VC_STRUCTURES,
    VC_ABILITIES,
    VC_ACHIEVEMENTS,
    VC_TITLES,
    VC_ARTIFACTS,
    VC_EVENTS,
    VC_RARITIES,
    VC_SPECIES,
    VC_SPECIES_COLORS,
    VC_RARITY_COLORS,
    VC_ALL_COLORS,
    VC_MAX_STRUCTURE_LEVEL,
    VC_MAX_LEVEL,
    VC_SPECIES_COUNT,
    VC_RARITY_TIER_COUNT,
    VC_WARDEN_COUNT,
    VC_CITADEL_COUNT,
    VC_MATERIAL_COUNT,
    VC_STRUCTURE_COUNT,
    VC_ABILITY_COUNT,
    VC_ACHIEVEMENT_COUNT,
    VC_TITLE_COUNT,
    VC_ARTIFACT_COUNT,
    VC_EVENT_COUNT,
    VC_THEME,
    VC_VOID_PURPLE,
    VC_ABYSS_BLACK,
    VC_RIFT_TEAL,
    VC_ENTROPY_RED,
    VC_SHADOW_VIOLET,
    VC_NULL_SILVER,
    VC_DIMENSION_GOLD,
    VC_ABYSS_INDIGO,
    VC_RIFT_STEEL,
    VC_ENTROPY_CRIMSON,
    VC_CITADEL_DARK,
    VC_VOID_GLOW,
    VC_VOID_DEEP,
    VC_ABYSS_MIST,
    VC_RIFT_BRIGHT,
    VC_ENTROPY_GLOW,
    VC_SAVE_KEY,

    // ── State ──────────────────────────────────────────────────
    vcState: state,
    stateRef,

    // ── Computed Values ────────────────────────────────────────
    vcActiveWardenCount,
    vcTotalWardenPower,
    vcTotalWardenDefense,
    vcClaimedCitadelCount,
    vcCitadelEfficiency,
    vcMaxRiftEnergy,
    vcArtifactPower,
    vcTotalStructureBonus,
    vcAchievementProgress,
    vcAvailableEvents,
    vcCitadelLevel,
    vcCurrentTitleDef,
    vcTitleProgress,
    vcEffectiveMultiplier,
    vcHasRareWarden,
    vcHasLegendaryWarden,
    vcHasLegendaryArtifact,
    vcTotalInventoryCount,
    vcTotalInventoryValue,
    vcUnlockedAbilities,
    vcRareMaterialCount,
    vcStructureLevelAvg,
    vcWardensBySpecies,
    vcWardensByRarity,
    vcCombatPower,
    vcTotalDefenseBonus,

    // ── Action Functions ───────────────────────────────────────
    vcSummonWarden,
    vcCitadelClaim,
    vcBuildStructure,
    vcVoidStrike,
    vcActivateRelic,
    resetVoidCitadel,

    // ── Lookup Helpers ─────────────────────────────────────────
    vcGetWardenDef,
    vcGetCitadelDef,
    vcGetMaterialDef,
    vcGetStructureDef,
    vcGetAbilityDef,
    vcGetAchievementDef,
    vcGetTitleDef,
    vcGetArtifactDef,
    vcGetEventDef,
    vcGetRarityDef,
    vcGetSpeciesDef,

    // ── Calculation Helpers ────────────────────────────────────
    vcFindRarityColorFor,
    vcFindSpeciesColorFor,
    vcCalcRarityMultiplierFor,
    vcCalcStructureCostFor,
    vcCalcStructureBonusFor,
    vcCalcWardenPowerFor,
    vcCalcWardenDefenseFor,
    vcXpRequiredFor,
    vcGetTitleProgress,
  }
}
