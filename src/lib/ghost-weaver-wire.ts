/**
 * Ghost Weaver Wire — 幽灵织匠 feature module
 *
 * Spectral weavers who spin threads of memory and shadow. Summon 35 specters
 * across 5 rarity tiers (7 species: shadow_weaver, memory_spider,
 * soul_silkwraith, dream_stitcher, phantom_tailor, echo_cobbler, veil_moth),
 * operate 8 spectral looms, collect 30 ethereal materials, build 25 thread
 * structures, wield 22 weaving abilities, earn 8 titles from Threadling to
 * Phantom Sovereign, gather 15 legendary artifacts, and navigate 12 spectral
 * events — backed by a Zustand store with persist middleware.
 *
 * Storage key: ghost-weaver-wire
 * Prefix: gw / GW_
 */

import { useMemo, useEffect, useRef, useCallback } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type GWRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type GWSpecies =
  | 'shadow_weaver'
  | 'memory_spider'
  | 'soul_silkwraith'
  | 'dream_stitcher'
  | 'phantom_tailor'
  | 'echo_cobbler'
  | 'veil_moth'
export type GWWeaveSchool = 'Threadcraft' | 'Soulbind' | 'Shadowloom'

export interface GWSpecterDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly species: GWSpecies
  readonly rarity: GWRarity
  readonly basePower: number
  readonly ability: string
}

export interface GWLoomDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
  readonly weavePower: number
}

export interface GWMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: GWRarity
  readonly source: string
  readonly value: number
}

export interface GWStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
  readonly maxLevel: number
}

export interface GWAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly school: GWWeaveSchool
}

export interface GWAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface GWTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredLooms: number
}

export interface GWArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: GWRarity
  readonly weavePower: number
  readonly specialAbility: string
}

export interface GWEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface GWSummonedSpecter {
  readonly id: string
  specterDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  bound: boolean
  bindCount: number
  acquiredAt: number
}

export interface GWOwnedStructure {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface GWWeaverState {
  resonance: number
  maxResonance: number
  veilThickness: number
  lastWovenAt: number | null
}

export interface GWStoreState {
  summonedSpecters: GWSummonedSpecter[]
  collectedMaterials: Record<string, number>
  structures: GWOwnedStructure[]
  achievements: string[]
  currentTitle: string
  collectedArtifacts: string[]
  unlockedLooms: string[]
  gwLevel: number
  gwExp: number
  spectralThreads: number
  weaveDepth: number
  totalSummoned: number
  totalSpun: number
  totalUpgraded: number
  totalBound: number
  totalWoven: number
  activeEventId: string | null
  eventTimer: number
  weaver: GWWeaverState
  activeLoomId: string | null
}

export interface GWStoreActions {
  gwSummonSpecter: (specterId: string) => boolean
  gwSpinThread: (specterId: string) => number
  gwBuildStructure: (structureId: string) => boolean
  gwUseAbility: (abilityId: string) => boolean
  gwTriggerEvent: (eventId: string) => boolean
  gwCollectArtifact: (artifactId: string) => boolean
  gwSummonLoom: (loomId: string) => boolean
  gwBindSpirit: (specterId: string) => boolean
  gwWeavePattern: (patternId: string) => number
}

export type GWFullStore = GWStoreState & GWStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const GW_COLOR_GHOST_PURPLE: string = '#9370DB'
export const GW_COLOR_SPECTRAL_WHITE: string = '#F8F8FF'
export const GW_COLOR_THREAD_SILVER: string = '#C0C0C0'
export const GW_COLOR_VEIL_INDIGO: string = '#4B0082'
export const GW_COLOR_SHADOW_BLACK: string = '#1A1A2E'
export const GW_COLOR_MEMORY_BLUE: string = '#6A5ACD'
export const GW_COLOR_SOUL_AMBER: string = '#FFBF00'
export const GW_COLOR_DAWN_ROSE: string = '#E6A8D7'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const GW_MAX_LEVEL = 50
const GW_INITIAL_THREADS = 500
const GW_INITIAL_DEPTH = 100

function gwXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= GW_MAX_LEVEL) return Infinity
  return Math.floor(90 * Math.pow(1.12, level) + level * 18)
}

function gwLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < GW_MAX_LEVEL) {
    const needed = gwXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function gwGenerateId(): string {
  return `gw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function gwRarityMultiplier(rarity: GWRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function gwSpeciesColor(species: GWSpecies): string {
  switch (species) {
    case 'shadow_weaver': return GW_COLOR_VEIL_INDIGO
    case 'memory_spider': return GW_COLOR_MEMORY_BLUE
    case 'soul_silkwraith': return GW_COLOR_SOUL_AMBER
    case 'dream_stitcher': return GW_COLOR_GHOST_PURPLE
    case 'phantom_tailor': return GW_COLOR_SPECTRAL_WHITE
    case 'echo_cobbler': return GW_COLOR_THREAD_SILVER
    case 'veil_moth': return GW_COLOR_DAWN_ROSE
  }
}

function gwRarityColor(rarity: GWRarity): string {
  switch (rarity) {
    case 'common': return GW_COLOR_THREAD_SILVER
    case 'uncommon': return GW_COLOR_MEMORY_BLUE
    case 'rare': return GW_COLOR_GHOST_PURPLE
    case 'epic': return GW_COLOR_DAWN_ROSE
    case 'legendary': return GW_COLOR_SOUL_AMBER
  }
}

function gwSchoolColor(school: GWWeaveSchool): string {
  switch (school) {
    case 'Threadcraft': return GW_COLOR_THREAD_SILVER
    case 'Soulbind': return GW_COLOR_SOUL_AMBER
    case 'Shadowloom': return GW_COLOR_VEIL_INDIGO
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: SPECIES BONUSES & SUMMON CHANCES
// ═══════════════════════════════════════════════════════════════════

const GW_SPECIES_BONUSES: Record<GWSpecies, { spinBonus: number; bindBonus: number; weaveBonus: number }> = {
  shadow_weaver: { spinBonus: 20, bindBonus: 10, weaveBonus: 0 },
  memory_spider: { spinBonus: 5, bindBonus: 5, weaveBonus: 25 },
  soul_silkwraith: { spinBonus: 15, bindBonus: 0, weaveBonus: 15 },
  dream_stitcher: { spinBonus: 0, bindBonus: 25, weaveBonus: 5 },
  phantom_tailor: { spinBonus: 10, bindBonus: 15, weaveBonus: 0 },
  echo_cobbler: { spinBonus: 5, bindBonus: 5, weaveBonus: 20 },
  veil_moth: { spinBonus: 15, bindBonus: 0, weaveBonus: 20 },
}

const GW_SUMMON_CHANCES: Record<GWRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
}

const GW_LOOM_SPECIES_BONUS: Record<string, GWSpecies[]> = {
  threadbare_sanctum: ['shadow_weaver', 'soul_silkwraith'],
  veil_workshop: ['phantom_tailor', 'echo_cobbler'],
  memory_loom: ['memory_spider', 'dream_stitcher'],
  spectral_spindle: ['shadow_weaver', 'veil_moth'],
  phantom_stitchery: ['phantom_tailor', 'dream_stitcher'],
  shadow_loom: ['soul_silkwraith', 'echo_cobbler'],
  echo_weave: ['memory_spider', 'veil_moth'],
  soul_tapestry: ['shadow_weaver', 'memory_spider', 'soul_silkwraith', 'dream_stitcher', 'phantom_tailor', 'echo_cobbler', 'veil_moth'],
}

function gwGetSpeciesBonus(species: GWSpecies): { spinBonus: number; bindBonus: number; weaveBonus: number } {
  return GW_SPECIES_BONUSES[species]
}

function gwGetSummonChance(rarity: GWRarity, activeLoomId: string | null): number {
  let chance = GW_SUMMON_CHANCES[rarity]
  if (activeLoomId) {
    const bonusSpecies = GW_LOOM_SPECIES_BONUS[activeLoomId]
    if (bonusSpecies && bonusSpecies.length > 3) {
      chance = chance * 1.5
    }
  }
  return Math.min(100, Math.floor(chance))
}

function gwGetBindBonus(level: number, bindCount: number): number {
  return Math.floor(level * 12 * (1 + bindCount * 0.25))
}

function gwGetStructureBonus(structureId: string, level: number): number {
  switch (structureId) {
    case 'thread_distillery': return level * 2
    case 'silk_repository': return level * 5
    case 'memory_vault': return level * 8
    case 'spectral_forge': return level * 12
    case 'veil_gateway': return level * 20
    case 'spider_nursery': return level * 3
    case 'shadow_quarter': return level * 7
    case 'phantom_atelier': return level * 15
    default: return level * 2
  }
}

function gwGetBindTier(count: number): string {
  if (count <= 0) return 'Unbound'
  if (count === 1) return 'Faint Tether'
  if (count === 2) return 'Soul Link'
  if (count === 3) return 'Spirit Chain'
  if (count === 4) return 'Eternal Binding'
  return 'Omnipresent Thread'
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: GW_SPECTERS — 35 Specter Entities (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const GW_SPECTERS: readonly GWSpecterDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'gossamer_wisp',
    name: 'Gossamer Wisp',
    description:
      'A faint shadow weaver that appears as a drifting ribbon of translucent silk in the moonlight. It weaves gossamer threads between sleeping dreamers, connecting their subconscious minds in vast invisible webs of shared reverie.',
    species: 'shadow_weaver',
    rarity: 'common',
    basePower: 14,
    ability: 'Gossamer Drift',
  },
  {
    id: 'web_spinner',
    name: 'Humble Web Spinner',
    description:
      'A small memory spider that spins webs from crystallized nostalgia. Each strand contains a fragment of a forgotten childhood memory — the smell of rain on hot pavement, the sound of a screen door slamming shut.',
    species: 'memory_spider',
    rarity: 'common',
    basePower: 16,
    ability: 'Nostalgia Snare',
  },
  {
    id: 'silk_flicker',
    name: 'Silk Flicker',
    description:
      'A tiny soul silkwraith that leaves trails of glowing thread wherever it floats. The silk fades after a few minutes, but while it lingers, it reveals hidden pathways between the worlds of the living and the dead.',
    species: 'soul_silkwraith',
    rarity: 'common',
    basePower: 13,
    ability: 'Flickering Path',
  },
  {
    id: 'needle_dreamer',
    name: 'Needle Dreamer',
    description:
      'A dream stitcher that embroiders visions into the fabric of sleep. Its needle moves without hands, stitching nightmares into beauty and beauty into nightmares with equal care and unsettling precision.',
    species: 'dream_stitcher',
    rarity: 'common',
    basePower: 17,
    ability: 'Dream Hemming',
  },
  {
    id: 'pocket_tailor',
    name: 'Pocket Phantom Tailor',
    description:
      'A diminutive phantom tailor that repairs damaged souls by stitching their frayed edges with invisible thread. Those it helps wake feeling inexplicably whole, as if some inner wound has been mended in the night.',
    species: 'phantom_tailor',
    rarity: 'common',
    basePower: 15,
    ability: 'Soul Patch',
  },
  {
    id: 'cobble_tap',
    name: 'Cobble Tap',
    description:
      'An echo cobbler that repairs memories by hammering echoes back into cracked recollections. Its tiny hammer strikes produce sounds that only the dreamer can hear — the exact sound they have been trying to remember for years.',
    species: 'echo_cobbler',
    rarity: 'common',
    basePower: 12,
    ability: 'Echo Mend',
  },
  {
    id: 'dust_moth',
    name: 'Dust Moth',
    description:
      'A veil moth that feeds on the dust of forgotten intentions — all those things people meant to do but never did. Its wings shimmer with the accumulated weight of unlived lives, casting prismatic shadows on bedroom walls.',
    species: 'veil_moth',
    rarity: 'common',
    basePower: 18,
    ability: 'Dust Veil',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'umbra_weft',
    name: 'Umbra Weft',
    description:
      'A shadow weaver that creates fabric from the shadows of inanimate objects. Clothing made from these wefts grants the wearer partial intangibility for short periods, though the effect weakens in direct sunlight.',
    species: 'shadow_weaver',
    rarity: 'uncommon',
    basePower: 31,
    ability: 'Shadow Fabric',
  },
  {
    id: 'archive_spider',
    name: 'Archive Spider',
    description:
      'A memory spider that lives inside abandoned libraries, spinning its webs across the spines of unread books. Each web captures the essence of the stories within, and touching them briefly implants the entire narrative into the reader\'s mind.',
    species: 'memory_spider',
    rarity: 'uncommon',
    basePower: 34,
    ability: 'Story Capture Web',
  },
  {
    id: 'soul_winder',
    name: 'Soul Winder',
    description:
      'A soul silkwraith that winds the lifeforce of dying stars into thread. Each strand carries the compressed energy of a billion years of stellar fusion, warm to the touch and humming with barely contained power.',
    species: 'soul_silkwraith',
    rarity: 'uncommon',
    basePower: 29,
    ability: 'Stellar Thread',
  },
  {
    id: 'lucid_stitcher',
    name: 'Lucid Stitcher',
    description:
      'A dream stitcher that can enter and alter lucid dreams from the outside, embroidering new elements into dreamscapes. Experienced lucid dreamers sometimes find impossible details in their dreams — her signature work.',
    species: 'dream_stitcher',
    rarity: 'uncommon',
    basePower: 33,
    ability: 'Lucid Embroidery',
  },
  {
    id: 'vestment_phantom',
    name: 'Vestment Phantom',
    description:
      'A phantom tailor that crafts spectral garments from the emotions of the recently deceased. A cloak of grief keeps the wearer warm in any cold. A belt of determination grants temporary immunity to fear.',
    species: 'phantom_tailor',
    rarity: 'uncommon',
    basePower: 36,
    ability: 'Emotion Tailoring',
  },
  {
    id: 'resonance_cobbler',
    name: 'Resonance Cobbler',
    description:
      'An echo cobbler that fashions shoes from the resonant frequencies of ancient events. Wearing its creations allows the wearer to walk through time within a limited radius, hearing and seeing echoes of what once transpired.',
    species: 'echo_cobbler',
    rarity: 'uncommon',
    basePower: 30,
    ability: 'Temporal Footwear',
  },
  {
    id: 'twilight_moth',
    name: 'Twilight Moth',
    description:
      'A veil moth that emerges only during the boundary between day and night. Its wings are stained with the exact colors of every sunset that has ever occurred, and each wingbeat releases a particle of fading light.',
    species: 'veil_moth',
    rarity: 'uncommon',
    basePower: 35,
    ability: 'Sunset Dust',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'void_weaver',
    name: 'Void Weaver',
    description:
      'A shadow weaver that spins threads from the fabric of empty space itself. Its creations are invisible, weightless, and impossibly strong — used by ancient civilizations to bind the foundations of reality together.',
    species: 'shadow_weaver',
    rarity: 'rare',
    basePower: 56,
    ability: 'Void Spinning',
  },
  {
    id: 'destiny_spider',
    name: 'Destiny Spider',
    description:
      'A memory spider that weaves the web of fate from the threads of collective memory. Every human destiny passes through its web at least once, and some threads it chooses to snap, redirecting lives into entirely new patterns.',
    species: 'memory_spider',
    rarity: 'rare',
    basePower: 60,
    ability: 'Fate Web',
  },
  {
    id: 'ghost_cocoon',
    name: 'Ghost Cocoon',
    description:
      'A soul silkwraith that can encase a dying spirit in a protective cocoon of spectral silk, preserving the soul from dissolution. Inside the cocoon, the spirit experiences centuries of peaceful dreams while time stands still.',
    species: 'soul_silkwraith',
    rarity: 'rare',
    basePower: 54,
    ability: 'Soul Preservation',
  },
  {
    id: 'nightmare_tailor',
    name: 'Nightmare Tailor',
    description:
      'A dream stitcher that specializes in deconstructing nightmares. It unravels the fabric of terrifying dreams thread by thread, revealing the hidden fears beneath. Once unraveled, the same nightmare can never return.',
    species: 'dream_stitcher',
    rarity: 'rare',
    basePower: 62,
    ability: 'Nightmare Unraveling',
  },
  {
    id: 'ephemeral_couturier',
    name: 'Ephemeral Couturier',
    description:
      'A phantom tailor of extraordinary skill that creates garments from literal ephemera — passing moments, fleeting emotions, vanishing thoughts. Its masterwork is a wedding dress made from the exact moment two people first fall in love.',
    species: 'phantom_tailor',
    rarity: 'rare',
    basePower: 65,
    ability: 'Ephemeral Couture',
  },
  {
    id: 'echo_architect',
    name: 'Echo Architect',
    description:
      'An echo cobbler that builds entire structures from layered echoes — buildings made of remembered sound, bridges constructed from the resonance of ancient footsteps. Its creations exist only when someone remembers them.',
    species: 'echo_cobbler',
    rarity: 'rare',
    basePower: 57,
    ability: 'Echo Architecture',
  },
  {
    id: 'aurora_moth',
    name: 'Aurora Moth',
    description:
      'A veil moth whose wings contain miniature auroras that shift and dance with spectral light. Flying through its auroral field cleanses spiritual corruption and mends broken soul-threads in those nearby.',
    species: 'veil_moth',
    rarity: 'rare',
    basePower: 58,
    ability: 'Aurora Cleansing',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'abstraction_weaver',
    name: 'Abstraction Weaver',
    description:
      'A shadow weaver so advanced it can spin threads from abstract concepts — justice, entropy, nostalgia. Wearing a scarf woven from the thread of nostalgia makes the wearer irresistible to anyone they have ever loved.',
    species: 'shadow_weaver',
    rarity: 'epic',
    basePower: 92,
    ability: 'Concept Threading',
  },
  {
    id: 'akashic_arachne',
    name: 'Akashic Arachne',
    description:
      'A memory spider that dwells within the Akashic Records, the cosmic library of all events across all timelines. Its web spans every reality simultaneously, and a single strand can transport knowledge across dimensions.',
    species: 'memory_spider',
    rarity: 'epic',
    basePower: 98,
    ability: 'Akashic Web',
  },
  {
    id: 'celestial_wraith',
    name: 'Celestial Silkwraith',
    description:
      'A soul silkwraith that harvests thread from the aurora of dying galaxies. Each strand contains the compressed memory of an entire civilization, and garments woven from it grant temporary omniscience about that civilization.',
    species: 'soul_silkwraith',
    rarity: 'epic',
    basePower: 95,
    ability: 'Galactic Silk Harvest',
  },
  {
    id: 'dreamsovereign',
    name: 'Dream Sovereign Stitcher',
    description:
      'A dream stitcher who rules over an entire dream dimension. Every dream that has ever been dreamed exists as fabric in its infinite wardrobe. It can cut and re-stitch the dreamscape of an entire city at once.',
    species: 'dream_stitcher',
    rarity: 'epic',
    basePower: 100,
    ability: 'Dreamscape Dominion',
  },
  {
    id: 'soulcouture_master',
    name: 'Soul Couture Master',
    description:
      'A phantom tailor whose craft transcends mere clothing — it tailors the soul itself. It can reshape a person\'s fundamental nature by restitching their spiritual fabric, adding traits, removing flaws, and reinforcing weaknesses.',
    species: 'phantom_tailor',
    rarity: 'epic',
    basePower: 104,
    ability: 'Soul Restitching',
  },
  {
    id: 'primordial_echo',
    name: 'Primordial Echo Cobbler',
    description:
      'An echo cobbler who crafts from the very first sounds ever produced in the universe — the Big Bang\'s residual hum. Its creations exist outside of time entirely, granting the wearer immunity to temporal manipulation.',
    species: 'echo_cobbler',
    rarity: 'epic',
    basePower: 88,
    ability: 'Primordial Shoemaking',
  },
  {
    id: 'infinity_moth',
    name: 'Infinity Moth',
    description:
      'A veil moth whose wings contain an infinite fractal of smaller wings, each containing smaller wings still, continuing forever. Looking at its wings induces a trance state where the boundaries between dream and reality dissolve completely.',
    species: 'veil_moth',
    rarity: 'epic',
    basePower: 96,
    ability: 'Infinite Veil Gaze',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'origin_weaver',
    name: 'Origin Weaver',
    description:
      'The first weaver, born at the exact moment the first shadow was cast by the first light. It wove the initial thread that separates the living from the dead, creating the veil between worlds that all other weavers maintain.',
    species: 'shadow_weaver',
    rarity: 'legendary',
    basePower: 148,
    ability: 'Veil Genesis',
  },
  {
    id: 'memory_matrix',
    name: 'Memory Matrix Spider',
    description:
      'The spider that wove the original web of collective human memory. Every thought, every experience, every sensation ever felt by any conscious being exists as a dewdrop on its web. It remembers everything that has ever been forgotten.',
    species: 'memory_spider',
    rarity: 'legendary',
    basePower: 142,
    ability: 'Total Recollection',
  },
  {
    id: 'soul_origin',
    name: 'Soul Origin Silkwraith',
    description:
      'The silkwraith that spins the raw material of souls themselves. Before any soul is born, it passes through this creature\'s loom, receiving its first threads of consciousness. It decides the fundamental nature of every new soul.',
    species: 'soul_silkwraith',
    rarity: 'legendary',
    basePower: 145,
    ability: 'Soul Genesis',
  },
  {
    id: 'dream_architect_prime',
    name: 'Prime Dream Architect',
    description:
      'The dream stitcher that designed the architecture of dreams themselves. It created the logic by which dreams operate — why falling happens, why teeth fall out, why you cannot read in dreams. It can change these rules at will.',
    species: 'dream_stitcher',
    rarity: 'legendary',
    basePower: 150,
    ability: 'Dream Law Override',
  },
  {
    id: 'fate_tailor',
    name: 'Fate Tailor',
    description:
      'The phantom tailor who measures every soul for its destined garment — the life it will live. The measurements are taken at birth and the suit is assembled piece by piece throughout a lifetime. Only this tailor can alter a soul\'s fate.',
    species: 'phantom_tailor',
    rarity: 'legendary',
    basePower: 152,
    ability: 'Fate Measurement',
  },
  {
    id: 'time_cobbler',
    name: 'Time Cobbler Eternal',
    description:
      'The echo cobbler who crafted the boots that Time itself wears to walk forward. When Time stumbles, it is because this cobbler is resoling its shoes. When Time runs fast, the boots are new. It controls the pace of temporal flow.',
    species: 'echo_cobbler',
    rarity: 'legendary',
    basePower: 138,
    ability: 'Temporal Pacing',
  },
  {
    id: 'veil_matriarch',
    name: 'Veil Matriarch',
    description:
      'The original veil moth that first spread its wings across the boundary between life and death, creating the gauze through which ghosts become visible. Her wingspan is infinite, and she simultaneously covers every threshold in existence.',
    species: 'veil_moth',
    rarity: 'legendary',
    basePower: 140,
    ability: 'Universal Veil Spread',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: GW_LOOMS — 8 Spectral Looms
// ═══════════════════════════════════════════════════════════════════

export const GW_LOOMS: readonly GWLoomDef[] = [
  {
    id: 'threadbare_sanctum',
    name: 'Threadbare Sanctum',
    description:
      'A crumbling sanctuary of stone and shadow where the first spectral weavers learned their craft. The walls are covered in faded tapestries that still whisper weaving instructions to those who listen. Ideal for beginners.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['+5% shadow weaver encounter rate', 'Basic thread gathering'],
    weavePower: 10,
  },
  {
    id: 'veil_workshop',
    name: 'Veil Workshop',
    description:
      'A workshop suspended within the veil between worlds, accessible only by threading a needle with moonlight and sewing open a hidden seam. Phantom tailors work here in silence, crafting garments from pure spectral essence.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['+10% tailor and cobbler encounters', 'Rare specter summoning chance'],
    weavePower: 20,
  },
  {
    id: 'memory_loom',
    name: 'Memory Loom',
    description:
      'A colossal loom woven from the shared memories of everyone who has ever gazed into a mirror and seen someone else looking back. Its shuttles are carved from bone and move by themselves, weaving patterns that no living weaver could design.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['+15% weave power', 'Spectral thread regeneration aura'],
    weavePower: 35,
  },
  {
    id: 'spectral_spindle',
    name: 'Spectral Spindle',
    description:
      'A spindle that spins endlessly, drawing raw spectral energy from the air and converting it into usable thread. It hums at a frequency that soothes restless spirits and calms troubled dreams within a mile radius.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['+20% material yield', 'Soulbind ability enhancement'],
    weavePower: 50,
  },
  {
    id: 'phantom_stitchery',
    name: 'Phantom Stitchery',
    description:
      'An underground workshop where dream stitchers labor in perpetual twilight, embroidering entire dreamscapes into existence. The air smells of lavender and forgotten things, and the walls pulse with a slow heartbeat.',
    minLevel: 22,
    unlockCost: 3000,
    bonuses: ['+25% weave bonus', 'Epic specter summoning unlocked'],
    weavePower: 70,
  },
  {
    id: 'shadow_loom',
    name: 'Shadow Loom',
    description:
      'A loom that operates entirely in shadow. It is invisible in direct light and reveals itself only in darkness, where its threads gleam like captured starlight. Only the most skilled weavers can operate its pedals.',
    minLevel: 30,
    unlockCost: 7500,
    bonuses: ['+30% shadow weaver power', 'Rare artifact encounters'],
    weavePower: 90,
  },
  {
    id: 'echo_weave',
    name: 'Echo Weave',
    description:
      'A loom that responds to sound — each echo, each whispered word, each forgotten song becomes thread material. The patterns it produces are auditory tapestries that replay the sounds woven into them when touched.',
    minLevel: 38,
    unlockCost: 15000,
    bonuses: ['+35% echo cobbler power', 'Legendary material chance'],
    weavePower: 120,
  },
  {
    id: 'soul_tapestry',
    name: 'Soul Tapestry',
    description:
      'The masterloom of all ghost weavers, a tapestry so vast it depicts the interconnected souls of every living being. Zooming in reveals individual threads; zooming out shows the grand pattern of fate that binds all life together.',
    minLevel: 45,
    unlockCost: 30000,
    bonuses: ['+50% all specter power', 'Legendary summoning', 'Spectral events'],
    weavePower: 200,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: GW_MATERIALS — 30 Ethereal Materials
// ═══════════════════════════════════════════════════════════════════

export const GW_MATERIALS: readonly GWMaterialDef[] = [
  // Common (6)
  { id: 'spectral_silk', name: 'Spectral Silk', description: 'A shimmering strand of ghost silk harvested from the webs of memory spiders. Cool to the touch, it vibrates faintly when held near strong emotions.', rarity: 'common', source: 'threadbare_sanctum', value: 5 },
  { id: 'memory_thread', name: 'Memory Thread', description: 'A thread spun from a single crystallized memory. Holding it briefly transfers the memory to the holder — a summer afternoon, a first kiss, the taste of strawberries.', rarity: 'common', source: 'threadbare_sanctum', value: 6 },
  { id: 'phantom_dye', name: 'Phantom Dye', description: 'A vial of translucent dye extracted from shadow weaver secretions. It can color any fabric with hues that do not exist in the visible spectrum, visible only to spirits.', rarity: 'common', source: 'threadbare_sanctum', value: 7 },
  { id: 'dream_fiber', name: 'Dream Fiber', description: 'A wisp of material pulled directly from the fabric of a dream. It is weightless and changes texture depending on the dreamer\'s emotional state when harvested.', rarity: 'common', source: 'memory_loom', value: 4 },
  { id: 'soulfilament', name: 'Soul Filament', description: 'A thin filament of condensed soul energy that connects the spiritual body to the physical form. Severing it creates a temporary ghost; reinforcing it wards against possession.', rarity: 'common', source: 'spectral_spindle', value: 8 },
  { id: 'veil_dust', name: 'Veil Dust', description: 'Fine particles scraped from the surface of the veil between worlds. It sparkles with residual dimensional energy and can temporarily thin the barrier between realities.', rarity: 'common', source: 'threadbare_sanctum', value: 5 },

  // Uncommon (6)
  { id: 'shadow_lace', name: 'Shadow Lace', description: 'A delicate lacework made from woven shadows. When draped over an object, the object casts no shadow of its own — because the lace IS its shadow, stretched into fabric.', rarity: 'uncommon', source: 'shadow_loom', value: 28 },
  { id: 'nostalgia_web', name: 'Nostalgia Web', description: 'A fragment of memory spider silk preserved in amber resin. The web vibrates with captured nostalgia, and pressing it against the forehead induces vivid, detailed childhood memories.', rarity: 'uncommon', source: 'memory_loom', value: 35 },
  { id: 'soul_spool', name: 'Soul Spool', description: 'A spool of thread wound from the lifeforce of a willing donor. Each revolution of thread represents one year of life, and using it extends the life of the weaver proportionally.', rarity: 'uncommon', source: 'spectral_spindle', value: 32 },
  { id: 'dreamcatcher_string', name: 'Dreamcatcher String', description: 'String harvested from a living dreamcatcher that has been actively filtering nightmares. The string glows blue when nightmares are near and hums soothingly during pleasant dreams.', rarity: 'uncommon', source: 'phantom_stitchery', value: 40 },
  { id: 'echo_nail', name: 'Echo Nail', description: 'A nail forged from compressed sound echoes. When hammered into wood or stone, the surface begins to replay whatever sound was most recently made near it, growing louder over time.', rarity: 'uncommon', source: 'echo_weave', value: 30 },
  { id: 'moth_scale', name: 'Veil Moth Scale', description: 'A single iridescent scale shed by a veil moth during metamorphosis. It is thinner than a whisper and stronger than steel, and it refracts light into colors that exist only in dreams.', rarity: 'uncommon', source: 'veil_workshop', value: 45 },

  // Rare (6)
  { id: 'void_yarn', name: 'Void Yarn', description: 'Yarn spun from the literal absence of everything. It appears as a hole in the shape of thread — looking through it shows absolute nothingness. Garments knitted from it grant intangibility.', rarity: 'rare', source: 'shadow_loom', value: 120 },
  { id: 'akashic_drop', name: 'Akashic Dewdrop', description: 'A dewdrop from the web of the Akashic Records containing the complete biography of one randomly selected individual. Drinking it grants temporary access to that person\'s entire memory.', rarity: 'rare', source: 'memory_loom', value: 150 },
  { id: 'stellar_silk', name: 'Stellar Silk', description: 'Silk harvested from the cocoon of a soul silkwraith that fed on a dying star. It is warm, golden, and faintly radioactive with spiritual energy that strengthens nearby specters.', rarity: 'rare', source: 'soul_tapestry', value: 140 },
  { id: 'nightmare_fabric', name: 'Nightmare Fabric', description: 'A swatch of fabric cut from a deconstructed nightmare. It is ice cold and occasionally shifts to display imagery from the original terror. It is used as armor against fear-based attacks.', rarity: 'rare', source: 'phantom_stitchery', value: 160 },
  { id: 'fate_thread', name: 'Fate Thread', description: 'A single thread from the tapestry of fate. Pulling it gently reveals information about the future; pulling it hard can unravel and redirect destiny itself. Each thread can only be used once.', rarity: 'rare', source: 'soul_tapestry', value: 135 },
  { id: 'temporal_leather', name: 'Temporal Leather', description: 'Leather tanned from the hide of moments frozen in time. It has the peculiar property of existing in the present while simultaneously being slightly in the past and slightly in the future.', rarity: 'rare', source: 'echo_weave', value: 110 },

  // Epic (6)
  { id: 'concept_bobbin', name: 'Concept Bobbin', description: 'A bobbin wound with thread spun from an abstract concept — this one contains the thread of Curiosity. Unrolling it near any entity makes that entity desperately curious about its own existence.', rarity: 'epic', source: 'shadow_loom', value: 500 },
  { id: 'soul_ribbon', name: 'Soul Ribbon', description: 'A ribbon cut from the fabric of a pure soul. It cannot be torn, burned, or aged, and it glows with warm inner light. Tying it around the wrist prevents spiritual corruption of any kind.', rarity: 'epic', source: 'soul_tapestry', value: 550 },
  { id: 'dream_blueprint', name: 'Dream Blueprint', description: 'A detailed architectural plan drawn by a dream stitcher showing the layout of an entire dreamscape. Following the blueprint in a meditative state allows entry into that specific dream.', rarity: 'epic', source: 'phantom_stitchery', value: 600 },
  { id: 'shadow_gossamer', name: 'Shadow Gossamer', description: 'An impossibly thin fabric woven from the shadows of multiple dimensions layered together. It weighs nothing, blocks nothing physical, but is completely impenetrable to spiritual entities.', rarity: 'epic', source: 'shadow_loom', value: 520 },
  { id: 'origin_echo', name: 'Origin Echo', description: 'A preserved sound from the very beginning of the universe — a low hum containing all the frequencies that would ever exist. Playing it backward reverses local entropy for a brief moment.', rarity: 'epic', source: 'echo_weave', value: 480 },
  { id: 'veil_fragment', name: 'Veil Fragment', description: 'A torn piece of the actual veil between worlds, still functional. Holding it up creates a window through which the ghost realm is fully visible. Stepping through it is possible but extremely dangerous.', rarity: 'epic', source: 'soul_tapestry', value: 570 },

  // Legendary (6)
  { id: 'genesis_thread', name: 'Genesis Thread', description: 'The very first thread ever spun, from which all other threads in existence are descended. It cannot be cut, burned, dissolved, or destroyed. It glows with the primordial light of creation itself.', rarity: 'legendary', source: 'soul_tapestry', value: 5000 },
  { id: 'omnipattern_needle', name: 'Omnipattern Needle', description: 'A needle that can stitch any two things together — concepts, souls, dimensions, moments in time. It has no eye, yet it threads itself. It has no point, yet it pierces everything.', rarity: 'legendary', source: 'soul_tapestry', value: 6000 },
  { id: 'fate_shuttle', name: 'Fate Shuttle', description: 'The shuttle used by the Fates themselves to weave the tapestry of destiny. It moves of its own accord, inserting and removing threads from the cosmic weave according to a plan only it understands.', rarity: 'legendary', source: 'soul_tapestry', value: 5500 },
  { id: 'memory_crystal_web', name: 'Memory Crystal Web', description: 'A web spun from crystallized memories so dense it has become a solid structure — a transparent fortress made of everyone\'s happiest moments. Being inside it induces permanent euphoria.', rarity: 'legendary', source: 'memory_loom', value: 7000 },
  { id: 'soul_cocoon_prime', name: 'Primordial Soul Cocoon', description: 'The cocoon containing the original soul template from which all subsequent souls are copied. It pulses with the rhythm of creation and radiates enough spiritual energy to resurrect the recently dead.', rarity: 'legendary', source: 'soul_tapestry', value: 6500 },
  { id: 'veil_matriarch_wing', name: 'Matriarch Wing Scale', description: 'A single scale from the Veil Matriarch\'s infinite wings. It contains within it a complete map of every threshold between life and death across all dimensions, updated in real time.', rarity: 'legendary', source: 'soul_tapestry', value: 8000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: GW_STRUCTURES — 25 Thread Structures (upgradeable to level 10)
// ═══════════════════════════════════════════════════════════════════

export const GW_STRUCTURES: readonly GWStructureDef[] = [
  // Spinning (5)
  { id: 'thread_distillery', name: 'Thread Distillery', description: 'A spectral device that condenses ambient spiritual energy into raw thread. Produces a steady trickle of spectral silk from the thin air between dimensions.', baseCost: 100, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'silk_repository', name: 'Silk Repository', description: 'A climate-controlled vault that stores collected silk at optimal conditions. Materials stored here never decay, and the vault subtly improves the quality of nearby threads.', baseCost: 400, costMultiplier: 1.6, maxLevel: 10 },
  { id: 'memory_vault', name: 'Memory Thread Vault', description: 'A vault that stores memory threads in stasis, preserving the memories perfectly. Required for rare specter summoning rituals that draw on stored collective memory.', baseCost: 1200, costMultiplier: 1.7, maxLevel: 10 },
  { id: 'spectral_forge', name: 'Spectral Thread Forge', description: 'A forge that tempers spectral thread with ghost fire, increasing its durability and resonance. Essential for epic specter summoning and advanced ability crafting.', baseCost: 3000, costMultiplier: 1.8, maxLevel: 10 },
  { id: 'veil_gateway', name: 'Veil Gateway Arch', description: 'The ultimate summoning structure — an archway woven from the veil itself that opens directly into the spectral realm. Capable of calling legendary specters.', baseCost: 8000, costMultiplier: 2.0, maxLevel: 10 },

  // Production (5)
  { id: 'spider_nursery', name: 'Spider Nursery', description: 'A warm, dark chamber where memory spiders hatch and begin spinning their first webs. Produces a steady supply of raw memory thread from the spiders\' instinctive weaving.', baseCost: 80, costMultiplier: 1.4, maxLevel: 10 },
  { id: 'shadow_quarter', name: 'Shadow Quarter', description: 'A district of shadow weavers who work in perpetual darkness, spinning shadow thread from the ambient gloom. Produces rare shadow lace during peak shadow density hours.', baseCost: 300, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'phantom_atelier', name: 'Phantom Atelier', description: 'A workshop where phantom tailors craft garments and tools from spectral materials. Produces phantom dye and soul filament from collected raw materials.', baseCost: 800, costMultiplier: 1.6, maxLevel: 10 },
  { id: 'dream_laboratory', name: 'Dream Thread Laboratory', description: 'A laboratory where dream stitchers extract and process dream fiber from sleeping subjects. Generates dream fiber and occasional nightmare fabric overnight.', baseCost: 2000, costMultiplier: 1.7, maxLevel: 10 },
  { id: 'echo_chamber', name: 'Echo Collection Chamber', description: 'A soundproofed chamber that captures and processes environmental echoes into usable echo nails and temporal leather. Louder environments produce better materials.', baseCost: 5000, costMultiplier: 1.8, maxLevel: 10 },

  // Weaving (5)
  { id: 'loom_hall', name: 'Grand Loom Hall', description: 'A vast hall containing dozens of spectral looms running simultaneously. Provides basic weaving bonuses to all active specters and improves thread quality.', baseCost: 120, costMultiplier: 1.4, maxLevel: 10 },
  { id: 'pattern_library', name: 'Pattern Library', description: 'A library of weaving patterns inscribed on spectral parchment. Each pattern amplifies the effect of woven items and provides bonuses to pattern-based abilities.', baseCost: 500, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'dye_garden', name: 'Phantom Dye Garden', description: 'A garden of spectral flowers that produce phantom dye when their petals are harvested. The flowers glow with bioluminescent light and bloom in colors that exist only in the spirit realm.', baseCost: 1500, costMultiplier: 1.6, maxLevel: 10 },
  { id: 'resonance_chamber', name: 'Resonance Amplification Chamber', description: 'A chamber that amplifies the spiritual resonance of all threads within it. Specters working inside gain increased power and their bindings become stronger.', baseCost: 3500, costMultiplier: 1.7, maxLevel: 10 },
  { id: 'cosmic_lattice', name: 'Cosmic Thread Lattice', description: 'A lattice structure that connects to the cosmic thread network, drawing energy from distant stars and galaxies. The ultimate weaving structure, it empowers all operations exponentially.', baseCost: 7000, costMultiplier: 1.9, maxLevel: 10 },

  // Utility (5)
  { id: 'thread_well', name: 'Spectral Thread Well', description: 'A well that draws raw spectral energy from deep beneath the veil. Provides passive spectral thread regeneration for all weaving operations and specter maintenance.', baseCost: 150, costMultiplier: 1.4, maxLevel: 10 },
  { id: 'material_wardrobe', name: 'Ethereal Material Wardrobe', description: 'A wardrobe that preserves collected materials at perfect spectral conditions. Materials stored here never fade and occasionally spontaneously organize themselves by resonance.', baseCost: 250, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'rest_cocoon', name: 'Spirit Rest Cocoon', description: 'A cocoon where specters recover their energy faster. Reduces cooldowns on weaving abilities and provides a sanctuary where specters cannot be banished or dispersed.', baseCost: 600, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'veil_monitor', name: 'Veil Thickness Monitor', description: 'A device that monitors the thickness and integrity of the veil between worlds. Prevents over-weaving that could thin the veil dangerously and cause spectral leaks.', baseCost: 1000, costMultiplier: 1.6, maxLevel: 10 },
  { id: 'weave_altar', name: 'Weave Altar', description: 'A sacred altar where spectral events can be triggered and controlled. Requires immense spectral threads but produces extraordinary weaving phenomena when activated.', baseCost: 3000, costMultiplier: 1.7, maxLevel: 10 },

  // Decoration (5)
  { id: 'thread_lantern_row', name: 'Thread Lantern Row', description: 'A row of lanterns made from stretched spectral silk over bone frames. Their light is warm and purple, illuminating hidden threads and revealing invisible specters.', baseCost: 100, costMultiplier: 1.3, maxLevel: 10 },
  { id: 'silk_hammock_grove', name: 'Silk Hammock Grove', description: 'A grove of spectral trees strung with silk hammocks where visiting specters rest. The hammocks are woven from memory thread and induce peaceful, dreamless sleep.', baseCost: 200, costMultiplier: 1.4, maxLevel: 10 },
  { id: 'moth_garden', name: 'Veil Moth Garden', description: 'A garden of luminescent flowers that attract veil moths. The moths\' wings cast prismatic shadows that boost the power of Threadcraft abilities performed in the garden.', baseCost: 350, costMultiplier: 1.4, maxLevel: 10 },
  { id: 'echo_chime_grove', name: 'Echo Chime Grove', description: 'A grove of spectral trees hung with chimes made from solidified echoes. The chimes play haunting melodies that boost the power of Soulbind abilities performed nearby.', baseCost: 600, costMultiplier: 1.5, maxLevel: 10 },
  { id: 'spirit_fountain', name: 'Spectral Thread Fountain', description: 'A fountain that pumps liquid spectral thread instead of water. Specters that drink from it gain temporary invulnerability, and visitors who touch it feel their soul strengthen.', baseCost: 1200, costMultiplier: 1.6, maxLevel: 10 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: GW_ABILITIES — 22 Weaving Abilities
// ═══════════════════════════════════════════════════════════════════

export const GW_ABILITIES: readonly GWAbilityDef[] = [
  // Threadcraft School (8)
  { id: 'gossamer_shield', name: 'Gossamer Shield', description: 'Weave a shield of gossamer thread so fine it is invisible but strong enough to deflect physical and spiritual attacks. The shield resonates with a high-pitched hum when struck.', cooldown: 5, power: 15, school: 'Threadcraft' },
  { id: 'thread_lash', name: 'Thread Lash', description: 'Lash out with a whip of condensed spectral thread that can bind, cut, or snare targets. The thread is razor-thin and cuts through spiritual matter like butter.', cooldown: 8, power: 22, school: 'Threadcraft' },
  { id: 'silk_bomb', name: 'Silk Bomb', description: 'Detonate a mass of compressed spectral silk that explodes into a web of sticky threads, immobilizing everything within a large radius. The threads dissolve after thirty seconds.', cooldown: 15, power: 35, school: 'Threadcraft' },
  { id: 'spider_trap', name: 'Spider Trap', description: 'Lay a trap of invisible memory thread that detects the presence of any spiritual entity. When triggered, it wraps the entity in binding silk and alerts the weaver.', cooldown: 12, power: 28, school: 'Threadcraft' },
  { id: 'weave_heal', name: 'Weave Healing', description: 'Stitch closed wounds in the spiritual body using soul filament. The healing process is painless and leaves no scar, though a faint silver thread is visible at the wound site temporarily.', cooldown: 20, power: 45, school: 'Threadcraft' },
  { id: 'binding_circle', name: 'Binding Circle', description: 'Inscribe a circle on the ground using spectral thread that prevents any spiritual entity from crossing it. The circle persists until the thread naturally degrades.', cooldown: 18, power: 40, school: 'Threadcraft' },
  { id: 'domain_weave', name: 'Domain Weaving', description: 'Transform the surrounding area into a woven domain where all threads obey your command. Within this domain, Threadcraft abilities are doubled and enemies move as if through syrup.', cooldown: 30, power: 60, school: 'Threadcraft' },
  { id: 'tapestry_bind', name: 'Tapestry of Binding', description: 'Weave a living tapestry that captures and imprisons a spiritual entity within its threads. The captured entity can communicate through the tapestry but cannot escape until the weaving is undone.', cooldown: 40, power: 80, school: 'Threadcraft' },

  // Soulbind School (7)
  { id: 'soul_stitch', name: 'Soul Stitch', description: 'Temporarily stitch your soul to another, sharing senses and emotions. The recipient sees through your eyes and feels what you feel for the duration of the binding.', cooldown: 6, power: 18, school: 'Soulbind' },
  { id: 'memory_weave', name: 'Memory Weave', description: 'Extract a memory from your mind and weave it into a physical thread that can be given to another. Touching the thread transfers the memory with perfect clarity and emotional fidelity.', cooldown: 10, power: 25, school: 'Soulbind' },
  { id: 'fate_snip', name: 'Fate Snip', description: 'Snip a single thread from a target\'s fate tapestry, removing one predetermined event from their future. The effect is subtle and the target usually attributes the change to coincidence.', cooldown: 14, power: 32, school: 'Soulbind' },
  { id: 'spirit_graft', name: 'Spirit Graft', description: 'Graft a portion of one specter\'s essence onto another, transferring abilities and traits. The process is permanent and irreversible, and both specters are changed by it.', cooldown: 20, power: 42, school: 'Soulbind' },
  { id: 'soul_lantern', name: 'Soul Lantern', description: 'Create a lantern from soul filament that burns with captured soul energy. The lantern reveals hidden specters, illuminates invisible threads, and attracts wandering spirits.', cooldown: 22, power: 48, school: 'Soulbind' },
  { id: 'resonance_weave', name: 'Resonance Weaving', description: 'Weave a pattern that synchronizes the soul frequencies of all nearby specters, creating a temporary hive mind. The coordinated specters gain massive power but share damage.', cooldown: 25, power: 50, school: 'Soulbind' },
  { id: 'grand_soulbind', name: 'Grand Soul Binding', description: 'The ultimate Soulbind ability — permanently bind your soul to the tapestry of all living things, gaining omniscient awareness of every soul in existence for a brief moment.', cooldown: 45, power: 90, school: 'Soulbind' },

  // Shadowloom School (7)
  { id: 'shadow_needle', name: 'Shadow Needle', description: 'Throw a needle made of solidified shadow that phases through all physical matter and strikes directly at the spiritual body. Impossible to block with physical defenses.', cooldown: 5, power: 16, school: 'Shadowloom' },
  { id: 'gloom_cloak', name: 'Gloom Cloak', description: 'Wrap yourself in a cloak of living shadow that makes you invisible to both physical and spiritual perception. The cloak also dampens all sound and erases your footprints.', cooldown: 7, power: 20, school: 'Shadowloom' },
  { id: 'shadow_stitch', name: 'Shadow Stitch', description: 'Stitch shadow to shadow, creating invisible connections between dark spaces. Anything that enters one shadowed area can exit through any other connected shadow within range.', cooldown: 12, power: 30, school: 'Shadowloom' },
  { id: 'void_thread', name: 'Void Thread Pull', description: 'Pull on a thread connected to the void, creating a localized area of absolute darkness that absorbs all light, sound, and spiritual energy. Only the weaver can see within it.', cooldown: 9, power: 24, school: 'Shadowloom' },
  { id: 'shadow_puppet', name: 'Shadow Puppetry', description: 'Animate the shadows of nearby objects and creatures, turning them into controllable puppets. The puppets retain the basic abilities of their source but lack free will.', cooldown: 16, power: 38, school: 'Shadowloom' },
  { id: 'veil_thin', name: 'Veil Thinning', description: 'Temporarily thin the veil between worlds in a large area, allowing free passage between the living and spirit realms. Dangerous — entities from both sides can cross unpredictably.', cooldown: 22, power: 48, school: 'Shadowloom' },
  { id: 'absolute_darkness', name: 'Absolute Darkness Weave', description: 'Weave a sphere of absolute darkness so complete that even concepts like hope and fear cannot exist within it. Those trapped experience true sensory deprivation — the mind turns on itself.', cooldown: 45, power: 90, school: 'Shadowloom' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: GW_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const GW_ACHIEVEMENTS: readonly GWAchievementDef[] = [
  { id: 'ach_first_specter', name: 'First Thread Spun', description: 'Summon your first specter and begin your journey as a ghost weaver.', condition: 'Summon 1 specter', reward: '+50 spectral threads' },
  { id: 'ach_specter_collector', name: 'Specter Collector', description: 'Build a collection of spectral beings that would impress the Veil Matriarch herself.', condition: 'Summon 10 specters', reward: '+200 spectral threads' },
  { id: 'ach_full_common', name: 'Common Weave Complete', description: 'Every common specter has answered your call. The basic fabric of your spectral tapestry is woven.', condition: 'Summon all 7 common specters', reward: '+500 spectral threads' },
  { id: 'ach_first_loom', name: 'Loom Apprentice', description: 'Activate your first spectral loom and begin operating the ancient machinery.', condition: 'Activate 1 loom', reward: '+100 spectral threads' },
  { id: 'ach_all_looms', name: 'Master of All Looms', description: 'You have activated every spectral loom in existence. The Soul Tapestry acknowledges your mastery.', condition: 'Unlock all 8 looms', reward: '+2000 spectral threads' },
  { id: 'ach_first_structure', name: 'Structure Builder', description: 'Construct your first thread structure and begin shaping the weaver domain.', condition: 'Build 1 structure', reward: '+100 spectral threads' },
  { id: 'ach_structure_empire', name: 'Structure Empire', description: 'Build an empire of structures that dominates the spectral landscape.', condition: 'Build 15 structures', reward: '+1000 spectral threads' },
  { id: 'ach_max_structure', name: 'Master Architect', description: 'Fully upgrade a structure to its maximum potential of level 10.', condition: 'Max out 1 structure to level 10', reward: '+1500 spectral threads' },
  { id: 'ach_first_spin', name: 'First Spin', description: 'Spin your first spectral thread and feel the fabric of reality yield to your touch.', condition: 'Spin 1 thread', reward: '+75 spectral threads' },
  { id: 'ach_spin_factory', name: 'Thread Factory', description: 'Your spinning is so prolific that threads cascade from your looms in an endless stream.', condition: 'Spin 100 threads', reward: '+1000 spectral threads' },
  { id: 'ach_event_survivor', name: 'Veil Event Survivor', description: 'Survive your first spectral event and learn the true nature of the veil between worlds.', condition: 'Survive 1 spectral event', reward: '+300 spectral threads' },
  { id: 'ach_first_artifact', name: 'Artifact Collector', description: 'Claim your first legendary artifact and discover that spectral power comes with spectral responsibility.', condition: 'Collect 1 artifact', reward: '+100 spectral threads' },
  { id: 'ach_artifact_hoarder', name: 'Artifact Hoarder', description: 'Amass a collection of legendary artifacts that any ghost weaver would envy.', condition: 'Collect 10 artifacts', reward: '+2000 spectral threads' },
  { id: 'ach_first_bind', name: 'Spirit Binder', description: 'Perform your first spirit binding and forge a connection that transcends death.', condition: 'Bind 1 spirit', reward: '+50 spectral threads' },
  { id: 'ach_master_binder', name: 'Master Binder', description: 'Your bindings have become legendary, told about by specters across all realms.', condition: 'Bind 50 spirits', reward: '+1500 spectral threads' },
  { id: 'ach_epic_specter', name: 'Epic Summoner', description: 'Summon your first epic specter, a being of immense spectral weaving power.', condition: 'Summon 1 epic specter', reward: '+2000 spectral threads' },
  { id: 'ach_legendary_specter', name: 'Legendary Summoner', description: 'Summon a legendary specter, one of the most powerful entities in the spectral realm.', condition: 'Summon 1 legendary specter', reward: '+5000 spectral threads' },
  { id: 'ach_phantom_weaver', name: 'Phantom Weaver', description: 'Achieve the rank of Phantom Weaver. The spectral realm recognizes you as one of its masters.', condition: 'Reach weaver level 40', reward: '+10000 spectral threads' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: GW_TITLES — 8 Titles (Threadling → Phantom Sovereign)
// ═══════════════════════════════════════════════════════════════════

export const GW_TITLES: readonly GWTitleDef[] = [
  {
    id: 'title_threadling',
    name: 'Threadling',
    description: 'A novice weaver who has just begun to see the threads that connect all things. The world looks different now — full of invisible connections and shimmering strands.',
    requiredLevel: 1,
    requiredLooms: 0,
  },
  {
    id: 'title_thread_apprentice',
    name: 'Thread Apprentice',
    description: 'An apprentice who can spin basic spectral thread and perform simple weaves. The veil between worlds recognizes your growing skill and occasionally thins when you are near.',
    requiredLevel: 5,
    requiredLooms: 1,
  },
  {
    id: 'title_novice_weaver',
    name: 'Novice Weaver',
    description: 'A weaver who has mastered the basics of spectral spinning. Your threads are strong enough to repair minor soul damage and bind weak spirits to your service.',
    requiredLevel: 10,
    requiredLooms: 2,
  },
  {
    id: 'title_spirit_tailor',
    name: 'Spirit Tailor',
    description: 'A skilled tailor of spirits who can reshape the fundamental nature of specters. Your needle can add traits, remove flaws, and reinforce the spiritual fabric of any entity.',
    requiredLevel: 18,
    requiredLooms: 3,
  },
  {
    id: 'title_fate_weaver',
    name: 'Fate Weaver',
    description: 'A weaver who can see and manipulate the threads of fate. You know where each thread leads and can gently redirect destiny by snipping and re-stitching the cosmic tapestry.',
    requiredLevel: 26,
    requiredLooms: 4,
  },
  {
    id: 'title_veil_master',
    name: 'Veil Master',
    description: 'A master of the veil who can thin or thicken the barrier between worlds at will. Specters bow to you, and even the Origin Weaver acknowledges your growing authority.',
    requiredLevel: 34,
    requiredLooms: 6,
  },
  {
    id: 'title_phantom_weaver',
    name: 'Phantom Weaver',
    description: 'A phantom weaver whose threads connect to every living soul simultaneously. You feel every emotion, know every thought, and can weave reality itself from pure spectral thread.',
    requiredLevel: 42,
    requiredLooms: 7,
  },
  {
    id: 'title_phantom_sovereign',
    name: 'Phantom Sovereign',
    description: 'The supreme ruler of all spectral weavers across every dimension. The Veil Matriarch herself yields to your authority. You ARE the thread that connects all things.',
    requiredLevel: 50,
    requiredLooms: 8,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: GW_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const GW_ARTIFACTS: readonly GWArtifactDef[] = [
  { id: 'artifact_gossamer_ring', name: 'Gossamer Ring', description: 'A ring woven from a single thread of gossamer so fine it is invisible. Wearing it allows the user to see all threads of connection between living beings, revealing hidden relationships and secret bonds.', rarity: 'common', weavePower: 5, specialAbility: 'Reveals hidden connections' },
  { id: 'artifact_spider_eye_brooch', name: 'Spider Eye Brooch', description: 'A brooch containing the preserved eye of a memory spider. Through it, the wearer can see the memories embedded in any thread or fabric, reading the history woven into everyday objects.', rarity: 'common', weavePower: 8, specialAbility: 'Reads thread memories' },
  { id: 'artifact_cocoon_pendant', name: 'Silkwraith Cocoon Pendant', description: 'A miniature cocoon worn as a pendant that occasionally hatches a tiny soul silkwraith. The silkwraith produces a single thread of pure soul filament before dissolving back into spiritual energy.', rarity: 'common', weavePower: 6, specialAbility: 'Produces free soul filament' },
  { id: 'artifact_dream_needle', name: 'Dream Stitcher\'s Needle', description: 'A needle that can sew in dreams. Holding it while falling asleep allows the user to consciously modify their dreams, creating impossible landscapes and scenarios with perfect realism.', rarity: 'common', weavePower: 7, specialAbility: 'Enables conscious dream modification' },
  { id: 'artifact_phantom_thimble', name: 'Phantom Thimble', description: 'A thimble worn by the first phantom tailor. It makes the wearer\'s fingers invisible and allows them to manipulate spiritual threads directly without tools, though only within arm\'s reach.', rarity: 'uncommon', weavePower: 20, specialAbility: 'Invisible thread manipulation' },
  { id: 'artifact_echo_hammer', name: 'Echo Cobbler\'s Hammer', description: 'A hammer that resonates with the frequency of any surface it strikes. It can repair broken objects by replaying the moment of their creation, un-breaking them through temporal resonance.', rarity: 'uncommon', weavePower: 25, specialAbility: 'Temporal object repair' },
  { id: 'artifact_moth_powder', name: 'Veil Moth Wing Powder', description: 'Powder ground from the wings of a veil moth. Sprinkling it creates a thin barrier between the living world and the spirit realm, allowing brief two-way communication with the dead.', rarity: 'uncommon', weavePower: 18, specialAbility: 'Enables brief spirit communication' },
  { id: 'artifact_shadow_spool', name: 'Shadow Weaver\'s Endless Spool', description: 'A spool of shadow thread that never runs out. The thread is invisible in light and visible in darkness, and it can support the weight of an adult human when used as a climbing rope.', rarity: 'uncommon', weavePower: 22, specialAbility: 'Infinite shadow thread supply' },
  { id: 'artifact_fate_scissors', name: 'Fate Snipping Scissors', description: 'Scissors that can cut a single thread from the tapestry of fate. Each cut permanently removes one event from the future. The scissors rust slightly with each use, and no one knows how many cuts remain.', rarity: 'rare', weavePower: 50, specialAbility: 'Can cut threads of fate' },
  { id: 'artifact_soul_measure', name: 'Soul Measurement Tape', description: 'A measuring tape that reads the dimensions of a soul rather than a body. It reveals the exact spiritual potential, emotional capacity, and remaining lifespan of anyone it measures.', rarity: 'rare', weavePower: 55, specialAbility: 'Measures soul dimensions' },
  { id: 'artifact_akashic_lens', name: 'Akashic Record Lens', description: 'A lens ground from crystallized memory web that allows the wearer to read the Akashic Records directly. Every event in history is visible through it, though the sheer volume of information can be overwhelming.', rarity: 'rare', weavePower: 48, specialAbility: 'Reads the Akashic Records' },
  { id: 'artifact_dreamscape_mantle', name: 'Dreamscape Mantle', description: 'A cloak that allows the wearer to physically enter the dreamscape of anyone whose name they speak while wearing it. The wearer becomes tangible within the dream and can interact with dream objects.', rarity: 'epic', weavePower: 100, specialAbility: 'Physical dream entry' },
  { id: 'artifact_origin_needle', name: 'Origin Weaver\'s Needle', description: 'The needle used by the Origin Weaver to separate the living from the dead. It can stitch the veil back together if torn, or cut new openings if needed. One of the most powerful artifacts in existence.', rarity: 'epic', weavePower: 110, specialAbility: 'Can mend or cut the veil' },
  { id: 'artifact_time_boots', name: 'Time Cobbler\'s Eternal Boots', description: 'Boots that allow the wearer to walk through time as easily as space. Each step forward moves one second into the future; each step backward moves one second into the past. The boots leave footprints in time.', rarity: 'epic', weavePower: 95, specialAbility: 'Temporal walking' },
  { id: 'artifact_matriarch_wing', name: 'Veil Matriarch\'s Wing', description: 'A single enormous wing from the Veil Matriarch herself. It covers the wearer in an absolute barrier between worlds, making them simultaneously exist in the living realm and the spirit realm. They are neither fully alive nor fully dead.', rarity: 'legendary', weavePower: 250, specialAbility: 'Simultaneous dual-realm existence' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: GW_EVENTS — 12 Spectral Events
// ═══════════════════════════════════════════════════════════════════

export const GW_EVENTS: readonly GWEventDef[] = [
  {
    id: 'event_thread_blizzard',
    name: 'Thread Blizzard',
    description: 'A massive blizzard of spectral threads sweeps through the weaver domain, blanketing everything in shimmering silk. The threads are useful raw material but make visibility nearly impossible and movement treacherous.',
    severity: 2,
    duration: 300,
    effects: ['+20% spectral thread regeneration', 'All specters gain temporary power boost', 'Thread collection rate doubled'],
  },
  {
    id: 'event_veil_storm',
    name: 'Veil Storm',
    description: 'The veil between worlds erupts into a violent storm of dimensional energy. Specters from both sides are tossed together in chaos, and the boundaries between living and dead become dangerously permeable.',
    severity: 3,
    duration: 600,
    effects: ['Reduced veil thickness', 'Weaving abilities gain +15% range', 'Material gathering bonus', 'Weave depth increases'],
  },
  {
    id: 'event_memory_flood',
    name: 'Memory Thread Flood',
    description: 'A flood of memory threads cascades from the Memory Loom as forgotten memories worldwide suddenly surface simultaneously. The threads form rivers of crystallized nostalgia flowing through the spectral domain.',
    severity: 5,
    duration: 180,
    effects: ['Memory material drops everywhere', 'Specters become visible', 'Thread cost reduced', 'Memory spider power tripled'],
  },
  {
    id: 'event_shadow_invasion',
    name: 'Shadow Entity Invasion',
    description: 'Hostile shadow entities from beyond the void attempt to invade through weakened points in the spectral fabric. They must be repelled by using Shadowloom abilities to restitch the torn areas.',
    severity: 7,
    duration: 900,
    effects: ['Hostile shadow entities appear', 'Shadowloom ability damage tripled', 'Domain resonance at risk', 'Defeating shadows drops rare materials'],
  },
  {
    id: 'event_spider_convergence',
    name: 'Great Spider Convergence',
    description: 'Every memory spider in every dimension simultaneously converges on the spectral domain for their once-per-millennium congress. The webs they weave during this event contain extraordinary knowledge.',
    severity: 3,
    duration: 480,
    effects: ['Memory spider power doubled', 'Rare material chance increased', 'Web-based abilities strengthened', 'Veil moth attracted in large numbers'],
  },
  {
    id: 'event_soul_surge',
    name: 'Soul Surge',
    description: 'A massive surge of soul energy pulses through the spectral domain as a cosmic event causes millions of souls to simultaneously resonate. The energy can be harvested but is dangerously unstable.',
    severity: 4,
    duration: 360,
    effects: ['Soul filament production tripled', 'Soulbind ability cost halved', 'Weave depth surges', 'Resonance temporarily maximum'],
  },
  {
    id: 'event_dream_collapse',
    name: 'Dream Collapse',
    description: 'The boundary between dreams and reality dissolves, causing dream elements to manifest physically. Dream stitchers must work frantically to re-stitch the dreamscape before permanent damage occurs.',
    severity: 6,
    duration: 720,
    effects: ['Dream elements manifest physically', 'Dream stitcher power supreme', 'Nightmare material spawns', 'Reality becomes unstable'],
  },
  {
    id: 'event_tailor_gala',
    name: 'Phantom Tailor Gala',
    description: 'Every phantom tailor across all realms gathers for a grand gala showcasing their finest spectral garments. The garments are judged, and the best tailors receive extraordinary thread rewards.',
    severity: 4,
    duration: 420,
    effects: ['Phantom tailor power doubled', 'Spectral thread reward rate tripled', 'Emotion materials drop everywhere', 'Weaving speed increased'],
  },
  {
    id: 'event_cobbler_symphony',
    name: 'Echo Cobbler Symphony',
    description: 'Every echo cobbler simultaneously produces a sound from their finest creation, creating a symphony of temporal resonance. The harmonics open brief windows to specific moments in history.',
    severity: 3,
    duration: 600,
    effects: ['Echo materials rain from above', 'Temporal leather chance 500%', 'Time-based abilities enhanced', 'History reveals itself'],
  },
  {
    id: 'event_moth_migration',
    name: 'Veil Moth Migration',
    description: 'Billions of veil moths migrate through the spectral domain, their collective wings creating a blizzard of iridescent scales. The scales are valuable crafting materials and temporarily empower all Threadcraft abilities.',
    severity: 5,
    duration: 540,
    effects: ['All entities covered in moth scales', 'Threadcraft power tripled', 'Structure upgrades complete during migration', 'Resonance surges'],
  },
  {
    id: 'event_tear_in_fabric',
    name: 'Tear in the Cosmic Fabric',
    description: 'A catastrophic tear opens in the fabric that separates dimensions. Through it, the void is visible — not darkness, but absolute absence. Legendary materials leak through the tear before it can be mended.',
    severity: 8,
    duration: 180,
    effects: ['Legendary material chance 10x', 'Void materials appear', 'All specter power doubled', 'Resonance at extreme risk', 'Rare artifacts materialize'],
  },
  {
    id: 'event_weaving_apex',
    name: 'The Weaving Apex',
    description: 'Once per era, every spectral loom in existence synchronizes and operates at maximum power simultaneously. The combined weaving energy creates a brief window where anything can be woven into reality from pure thought.',
    severity: 9,
    duration: 1200,
    effects: ['All weaving abilities empowered', 'Loom rewards tripled', 'Achievement progress accelerated', 'Thread regeneration maximized', 'Ultimate rewards at conclusion'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: LOOM-MATERIAL MAPPING
// ═══════════════════════════════════════════════════════════════════

interface GWLoomMaterialMap {
  readonly loomId: string
  readonly materialIds: readonly string[]
  readonly bonusMaterialIds: readonly string[]
}

const GW_LOOM_MATERIAL_MAP: readonly GWLoomMaterialMap[] = [
  { loomId: 'threadbare_sanctum', materialIds: ['spectral_silk', 'memory_thread', 'phantom_dye', 'dream_fiber', 'soulfilament', 'veil_dust'], bonusMaterialIds: ['moth_scale'] },
  { loomId: 'veil_workshop', materialIds: ['shadow_lace', 'phantom_dye', 'moth_scale', 'dream_fiber'], bonusMaterialIds: ['veil_dust'] },
  { loomId: 'memory_loom', materialIds: ['memory_thread', 'nostalgia_web', 'akashic_drop', 'phantom_dye'], bonusMaterialIds: ['memory_thread', 'veil_dust'] },
  { loomId: 'spectral_spindle', materialIds: ['soulfilament', 'soul_spool', 'stellar_silk'], bonusMaterialIds: ['dream_fiber', 'spectral_silk'] },
  { loomId: 'phantom_stitchery', materialIds: ['dream_fiber', 'nightmare_fabric', 'dreamcatcher_string'], bonusMaterialIds: ['phantom_dye'] },
  { loomId: 'shadow_loom', materialIds: ['shadow_lace', 'void_yarn', 'shadow_gossamer'], bonusMaterialIds: ['soulfilament'] },
  { loomId: 'echo_weave', materialIds: ['echo_nail', 'temporal_leather', 'origin_echo', 'shadow_lace'], bonusMaterialIds: ['memory_thread'] },
  { loomId: 'soul_tapestry', materialIds: ['genesis_thread', 'omnipattern_needle', 'fate_thread', 'fate_shuttle', 'memory_crystal_web', 'soul_cocoon_prime', 'veil_matriarch_wing'], bonusMaterialIds: ['stellar_silk', 'fate_thread'] },
]

function gwGetLoomMaterialMap(loomId: string): GWLoomMaterialMap | null {
  return GW_LOOM_MATERIAL_MAP.find((m) => m.loomId === loomId) ?? null
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const useGWStore = create<GWFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      summonedSpecters: [] as GWSummonedSpecter[],
      collectedMaterials: {} as Record<string, number>,
      structures: [] as GWOwnedStructure[],
      achievements: [] as string[],
      currentTitle: 'title_threadling',
      collectedArtifacts: [] as string[],
      unlockedLooms: ['threadbare_sanctum'] as string[],
      gwLevel: 1,
      gwExp: 0,
      spectralThreads: GW_INITIAL_THREADS,
      weaveDepth: GW_INITIAL_DEPTH,
      totalSummoned: 0,
      totalSpun: 0,
      totalUpgraded: 0,
      totalBound: 0,
      totalWoven: 0,
      activeEventId: null as string | null,
      eventTimer: 0,
      weaver: {
        resonance: 100,
        maxResonance: 100,
        veilThickness: 100,
        lastWovenAt: null,
      },
      activeLoomId: 'threadbare_sanctum',

      // ── gwSummonSpecter ────────────────────────────────────────
      gwSummonSpecter: (specterId: string): boolean => {
        const state = get()
        const specterDef = GW_SPECTERS.find((s) => s.id === specterId)
        if (!specterDef) return false
        if (state.summonedSpecters.some((s) => s.specterDefId === specterId)) return false

        const summonCost = Math.floor(10 * gwRarityMultiplier(specterDef.rarity))
        if (state.spectralThreads < summonCost) return false

        const newXp = state.gwExp + Math.floor(specterDef.basePower * 0.5)
        const newLevel = gwLevelFromXp(newXp)
        set((prev) => ({
          summonedSpecters: [
            ...prev.summonedSpecters,
            {
              id: gwGenerateId(),
              specterDefId: specterId,
              name: specterDef.name,
              level: 1,
              currentHP: 50 + specterDef.basePower,
              maxHP: 50 + specterDef.basePower,
              power: specterDef.basePower,
              bound: false,
              bindCount: 0,
              acquiredAt: Date.now(),
            },
          ],
          spectralThreads: Math.max(0, prev.spectralThreads - summonCost),
          gwExp: newXp,
          gwLevel: newLevel,
          weaveDepth: prev.weaveDepth + Math.floor(specterDef.basePower * 0.5),
          totalSummoned: prev.totalSummoned + 1,
        }))
        return true
      },

      // ── gwSpinThread ───────────────────────────────────────────
      gwSpinThread: (specterId: string): number => {
        const state = get()
        const specter = state.summonedSpecters.find((s) => s.id === specterId)
        if (!specter) return 0
        if (specter.currentHP <= 0) return 0
        if (state.weaveDepth < 3) return 0

        const specterDef = GW_SPECTERS.find((d) => d.id === specter.specterDefId)
        if (!specterDef) return 0

        const speciesBonus = gwGetSpeciesBonus(specterDef.species)
        const spinPower = Math.floor(specter.power * (1 + specter.level * 0.15) * (1 + speciesBonus.spinBonus * 0.01))
        const threadsEarned = Math.floor(spinPower * gwRarityMultiplier(specterDef.rarity))

        set((prev) => ({
          weaveDepth: Math.max(0, prev.weaveDepth - 3),
          spectralThreads: prev.spectralThreads + threadsEarned,
          totalSpun: prev.totalSpun + 1,
          weaver: {
            ...prev.weaver,
            veilThickness: Math.min(100, prev.weaver.veilThickness + 1),
          },
        }))
        return threadsEarned
      },

      // ── gwBuildStructure ───────────────────────────────────────
      gwBuildStructure: (structureId: string): boolean => {
        const state = get()
        const structureDef = GW_STRUCTURES.find((s) => s.id === structureId)
        if (!structureDef) return false

        const owned = state.structures.find((s) => s.structureDefId === structureId)
        if (!owned) {
          if (state.spectralThreads < structureDef.baseCost) return false
          const newXp = state.gwExp + 20
          const newLevel = gwLevelFromXp(newXp)
          set((prev) => ({
            structures: [
              ...prev.structures,
              {
                id: gwGenerateId(),
                structureDefId: structureId,
                level: 1,
                built: true,
              },
            ],
            spectralThreads: prev.spectralThreads - structureDef.baseCost,
            gwExp: newXp,
            gwLevel: newLevel,
            totalUpgraded: prev.totalUpgraded + 1,
          }))
          return true
        }

        if (owned.level >= structureDef.maxLevel) return false
        const upgradeCost = Math.floor(structureDef.baseCost * Math.pow(structureDef.costMultiplier, owned.level))
        if (state.spectralThreads < upgradeCost) return false

        const newXp = state.gwExp + 15
        const newLevel = gwLevelFromXp(newXp)
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === owned.id
              ? { ...s, level: s.level + 1 }
              : s
          ),
          spectralThreads: prev.spectralThreads - upgradeCost,
          gwExp: newXp,
          gwLevel: newLevel,
          totalUpgraded: prev.totalUpgraded + 1,
        }))
        return true
      },

      // ── gwUseAbility ───────────────────────────────────────────
      gwUseAbility: (abilityId: string): boolean => {
        const state = get()
        const abilityDef = GW_ABILITIES.find((a) => a.id === abilityId)
        if (!abilityDef) return false
        if (state.weaveDepth < abilityDef.cooldown) return false

        const newXp = state.gwExp + abilityDef.power
        const newLevel = gwLevelFromXp(newXp)
        set((prev) => ({
          weaveDepth: Math.max(0, prev.weaveDepth - abilityDef.cooldown),
          gwExp: newXp,
          gwLevel: newLevel,
          spectralThreads: prev.spectralThreads + Math.floor(abilityDef.power * 2),
        }))
        return true
      },

      // ── gwTriggerEvent ─────────────────────────────────────────
      gwTriggerEvent: (eventId: string): boolean => {
        const state = get()
        const eventDef = GW_EVENTS.find((e) => e.id === eventId)
        if (!eventDef) return false
        if (state.activeEventId !== null) return false
        if (state.weaveDepth < 50) return false

        set((prev) => ({
          activeEventId: eventId,
          eventTimer: eventDef.duration,
          weaveDepth: Math.max(0, prev.weaveDepth - 50),
          weaver: {
            ...prev.weaver,
            veilThickness: Math.min(100, prev.weaver.veilThickness + eventDef.severity * 5),
          },
        }))
        return true
      },

      // ── gwCollectArtifact ──────────────────────────────────────
      gwCollectArtifact: (artifactId: string): boolean => {
        const state = get()
        const artifactDef = GW_ARTIFACTS.find((a) => a.id === artifactId)
        if (!artifactDef) return false
        if (state.collectedArtifacts.includes(artifactId)) return false

        const cost = Math.floor(20 * gwRarityMultiplier(artifactDef.rarity))
        if (state.spectralThreads < cost) return false

        set((prev) => ({
          collectedArtifacts: [...prev.collectedArtifacts, artifactId],
          spectralThreads: prev.spectralThreads - cost,
        }))
        return true
      },

      // ── gwSummonLoom ───────────────────────────────────────────
      gwSummonLoom: (loomId: string): boolean => {
        const state = get()
        const loomDef = GW_LOOMS.find((l) => l.id === loomId)
        if (!loomDef) return false
        if (state.unlockedLooms.includes(loomId)) return false
        if (state.gwLevel < loomDef.minLevel) return false
        if (state.spectralThreads < loomDef.unlockCost) return false

        const newXp = state.gwExp + loomDef.weavePower * 2
        const newLevel = gwLevelFromXp(newXp)
        set((prev) => ({
          unlockedLooms: [...prev.unlockedLooms, loomId],
          activeLoomId: loomId,
          spectralThreads: prev.spectralThreads - loomDef.unlockCost,
          gwExp: newXp,
          gwLevel: newLevel,
          weaveDepth: prev.weaveDepth + Math.floor(loomDef.weavePower * 0.5),
        }))
        return true
      },

      // ── gwBindSpirit ───────────────────────────────────────────
      gwBindSpirit: (specterId: string): boolean => {
        const state = get()
        const specter = state.summonedSpecters.find((s) => s.id === specterId)
        if (!specter) return false
        if (specter.currentHP <= 0) return false
        if (specter.bindCount >= 5) return false
        if (state.weaveDepth < 5) return false

        const specterDef = GW_SPECTERS.find((d) => d.id === specter.specterDefId)
        if (!specterDef) return false

        const speciesBonus = gwGetSpeciesBonus(specterDef.species)
        const bindPower = Math.floor(specter.power * (1 + specter.level * 0.15) * (1 + speciesBonus.bindBonus * 0.01))

        const newXp = state.gwExp + Math.floor(bindPower * 0.5)
        const newLevel = gwLevelFromXp(newXp)
        set((prev) => ({
          weaveDepth: Math.max(0, prev.weaveDepth - 5),
          summonedSpecters: prev.summonedSpecters.map((s) =>
            s.id === specterId
              ? { ...s, bindCount: s.bindCount + 1, bound: true }
              : s
          ),
          gwExp: newXp,
          gwLevel: newLevel,
          spectralThreads: prev.spectralThreads + Math.floor(bindPower * 0.3),
          totalBound: prev.totalBound + 1,
          weaver: {
            ...prev.weaver,
            resonance: Math.min(prev.weaver.maxResonance, prev.weaver.resonance + 2),
          },
        }))
        return true
      },

      // ── gwWeavePattern ─────────────────────────────────────────
      gwWeavePattern: (patternId: string): number => {
        const state = get()
        const specter = state.summonedSpecters.find((s) => s.specterDefId === patternId)
        if (!specter) {
          const specterDef = GW_SPECTERS.find((s) => s.id === patternId)
          if (!specterDef) return 0
          if (state.weaveDepth < 10) return 0

          const speciesBonus = gwGetSpeciesBonus(specterDef.species)
          const weavePower = Math.floor(specterDef.basePower * (1 + speciesBonus.weaveBonus * 0.01))
          const threadsEarned = Math.floor(weavePower * gwRarityMultiplier(specterDef.rarity))

          const newXp = state.gwExp + Math.floor(weavePower * 0.3)
          const newLevel = gwLevelFromXp(newXp)
          set((prev) => ({
            weaveDepth: Math.max(0, prev.weaveDepth - 10),
            spectralThreads: prev.spectralThreads + threadsEarned,
            gwExp: newXp,
            gwLevel: newLevel,
            totalWoven: prev.totalWoven + 1,
            weaver: {
              ...prev.weaver,
              lastWovenAt: Date.now(),
              resonance: Math.min(prev.weaver.maxResonance, prev.weaver.resonance + 3),
            },
          }))
          return threadsEarned
        }

        if (specter.currentHP <= 0) return 0
        if (state.weaveDepth < 10) return 0

        const specterDef = GW_SPECTERS.find((d) => d.id === specter.specterDefId)
        if (!specterDef) return 0

        const speciesBonus = gwGetSpeciesBonus(specterDef.species)
        const weavePower = Math.floor(specter.power * (1 + specter.level * 0.15) * (1 + speciesBonus.weaveBonus * 0.01))
        const threadsEarned = Math.floor(weavePower * gwRarityMultiplier(specterDef.rarity))

        const newXp = state.gwExp + Math.floor(weavePower * 0.3)
        const newLevel = gwLevelFromXp(newXp)
        set((prev) => ({
          weaveDepth: Math.max(0, prev.weaveDepth - 10),
          spectralThreads: prev.spectralThreads + threadsEarned,
          gwExp: newXp,
          gwLevel: newLevel,
          totalWoven: prev.totalWoven + 1,
          weaver: {
            ...prev.weaver,
            lastWovenAt: Date.now(),
            resonance: Math.min(prev.weaver.maxResonance, prev.weaver.resonance + 3),
          },
        }))
        return threadsEarned
      },
    }),
    {
      name: 'ghost-weaver-wire',
      version: 1,
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: SPECIES HELPERS (exported)
// ═══════════════════════════════════════════════════════════════════

export const GW_SPECIES: readonly GWSpecies[] = [
  'shadow_weaver',
  'memory_spider',
  'soul_silkwraith',
  'dream_stitcher',
  'phantom_tailor',
  'echo_cobbler',
  'veil_moth',
]

export function gwGetSpeciesName(species: GWSpecies): string {
  switch (species) {
    case 'shadow_weaver': return 'Shadow Weaver'
    case 'memory_spider': return 'Memory Spider'
    case 'soul_silkwraith': return 'Soul Silkwraith'
    case 'dream_stitcher': return 'Dream Stitcher'
    case 'phantom_tailor': return 'Phantom Tailor'
    case 'echo_cobbler': return 'Echo Cobbler'
    case 'veil_moth': return 'Veil Moth'
  }
}

export function gwGetSchoolName(school: GWWeaveSchool): string {
  switch (school) {
    case 'Threadcraft': return 'Threadcraft'
    case 'Soulbind': return 'Soulbind'
    case 'Shadowloom': return 'Shadowloom'
  }
}

export function gwGetRarityName(rarity: GWRarity): string {
  switch (rarity) {
    case 'common': return 'Common'
    case 'uncommon': return 'Uncommon'
    case 'rare': return 'Rare'
    case 'epic': return 'Epic'
    case 'legendary': return 'Legendary'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: LORE ENTRIES
// ═══════════════════════════════════════════════════════════════════

export interface GWLoreEntry {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly loom: string
  readonly requiredLevel: number
}

export const GW_LORE: readonly GWLoreEntry[] = [
  {
    id: 'lore_first_thread',
    name: 'The First Thread',
    description:
      'Before the universe had form, there was only light and shadow. When the first shadow was cast, the Origin Weaver reached between the two and pulled — and the first thread came into being. That thread became the veil between worlds.',
    loom: 'threadbare_sanctum',
    requiredLevel: 1,
  },
  {
    id: 'lore_veil_tears',
    name: 'The Great Veil Tearing',
    description:
      'In the second age of weaving, a war between weavers nearly destroyed the veil. The Origin Weaver spent a thousand years restitching the damage, and the weakened areas are still thinner today — the places where hauntings are most common.',
    loom: 'veil_workshop',
    requiredLevel: 5,
  },
  {
    id: 'lore_memory_spider_covenant',
    name: 'The Spider Covenant',
    description:
      'The memory spiders forged a pact with the first humans, offering to store their memories in exchange for protection. This covenant created the first memory webs and established the symbiosis between weavers and mortals.',
    loom: 'memory_loom',
    requiredLevel: 10,
  },
  {
    id: 'lore_soul_silk_discovery',
    name: 'Discovery of Soul Silk',
    description:
      'The Soul Origin Silkwraith discovered that souls could be harvested and rewoven. This discovery was considered sacred and dangerous in equal measure, leading to the creation of the soul preservation rituals still used today.',
    loom: 'spectral_spindle',
    requiredLevel: 15,
  },
  {
    id: 'lore_dream_architecture',
    name: 'The Architecture of Dreams',
    description:
      'The Prime Dream Architect designed the rules that govern all dreams — the logic of falling, the inability to read, the sensation of paralysis. These rules were woven into the dreamscape fabric and cannot be permanently changed.',
    loom: 'phantom_stitchery',
    requiredLevel: 22,
  },
  {
    id: 'lore_shadow_loom_secret',
    name: 'Secrets of the Shadow Loom',
    description:
      'The Shadow Loom was not built — it manifested from the collective shadows of every living creature at once. It exists only because shadows exist, and if all shadows were to vanish, the loom would simply cease to be.',
    loom: 'shadow_loom',
    requiredLevel: 30,
  },
  {
    id: 'lore_echo_origins',
    name: 'The First Echo',
    description:
      'The very first sound ever made — a gasp of surprise when the first conscious being became aware of its own existence — still reverberates through the Echo Weave. Every echo since is a harmonic of that original sound.',
    loom: 'echo_weave',
    requiredLevel: 38,
  },
  {
    id: 'lore_soul_tapestry_revelation',
    name: 'The Tapestry Revealed',
    description:
      'When the Soul Tapestry was first completed, the weavers who created it looked upon their work and wept. They saw that every soul is connected, every life is intertwined, and the pattern they wove was more beautiful than anything they had imagined.',
    loom: 'soul_tapestry',
    requiredLevel: 45,
  },
  {
    id: 'lore_time_cobbler_boots',
    name: 'The Boots of Time',
    description:
      'The Time Cobbler Eternal crafted boots for Time itself from the leather of the first frozen moment. When Time walks too fast, the boots wear thin; when Time stumbles, the cobbler must repair them. Thus, the pace of temporal flow is maintained.',
    loom: 'echo_weave',
    requiredLevel: 38,
  },
  {
    id: 'lore_matriarch_spread',
    name: 'The Matriarch\'s Final Spread',
    description:
      'Before spreading her wings for the last time, the Veil Matriarch laid ten thousand eggs, each containing a new veil moth. The eggs will not hatch until the current veil begins to fail, ensuring the barrier between worlds will always be maintained.',
    loom: 'soul_tapestry',
    requiredLevel: 45,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: WEAVE PATTERNS (craftable designs)
// ═══════════════════════════════════════════════════════════════════

export interface GWWeavePattern {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly school: GWWeaveSchool
  readonly threadsCost: number
  readonly depthCost: number
  readonly power: number
  readonly requiredLevel: number
}

export const GW_WEAVE_PATTERNS: readonly GWWeavePattern[] = [
  { id: 'wp_simple_garment', name: 'Simple Spirit Garment', description: 'A basic garment woven from spectral silk that provides mild spiritual protection to the wearer. It shimmers faintly and feels like wearing a cloud of lavender-scented mist.', school: 'Threadcraft', threadsCost: 10, depthCost: 5, power: 15, requiredLevel: 1 },
  { id: 'wp_memory_web_shield', name: 'Memory Web Shield', description: 'A circular shield woven from memory spider silk. It absorbs the first blow against the wearer by replacing the painful memory with a pleasant one from childhood.', school: 'Soulbind', threadsCost: 25, depthCost: 12, power: 30, requiredLevel: 5 },
  { id: 'wp_shadow_cloak', name: 'Shadow Cloak of Invisibility', description: 'A cloak woven from layered shadows that renders the wearer invisible in darkness. In dim light, the wearer appears as a faint outline; in bright light, the cloak becomes transparent.', school: 'Shadowloom', threadsCost: 40, depthCost: 20, power: 45, requiredLevel: 10 },
  { id: 'wp_dream_catcher', name: 'Amplified Dreamcatcher', description: 'An enlarged dreamcatcher woven with dream fiber and soul filament. It captures nightmares from a mile radius and converts them into pleasant dreams distributed to sleeping children nearby.', school: 'Soulbind', threadsCost: 60, depthCost: 30, power: 60, requiredLevel: 15 },
  { id: 'wp_fate_gloves', name: 'Fate-Touch Gloves', description: 'Gloves woven with fate thread that allow the wearer to briefly see the consequences of any action before taking it. The visions are fuzzy and incomplete, but enough to avoid catastrophic choices.', school: 'Soulbind', threadsCost: 80, depthCost: 40, power: 75, requiredLevel: 22 },
  { id: 'wp_void_mantle', name: 'Mantle of the Void', description: 'A magnificent mantle woven from void yarn that exists partially outside reality. The wearer can phase through solid matter for short durations and is immune to all physical damage while phased.', school: 'Shadowloom', threadsCost: 120, depthCost: 55, power: 100, requiredLevel: 30 },
  { id: 'wp_soul_tapestry_fragment', name: 'Soul Tapestry Fragment', description: 'A fragment of the cosmic Soul Tapestry that reveals the connections between the wearer and everyone they have ever loved. The fragment glows brighter for stronger bonds and dims for forgotten ones.', school: 'Soulbind', threadsCost: 150, depthCost: 65, power: 120, requiredLevel: 38 },
  { id: 'wp_origin_stitch', name: 'Origin Stitch', description: 'A single stitch made with Genesis Thread that contains the memory of creation itself. Those who touch it briefly understand why the universe exists — though they forget immediately afterward.', school: 'Threadcraft', threadsCost: 200, depthCost: 80, power: 150, requiredLevel: 45 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 19: THE HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useGhostWeaver() {
  const store = useGWStore()
  const stateRef = useRef(store)

  // Sync ref on every state change — stateRef.current reads only in useEffect
  useEffect(() => {
    stateRef.current = store
  }, [store])

  // ── Getter: Loom Details, Material Inventory, Summoned Specters, Structure List, Total Power ──
  const {
    gwGetLoomDetails,
    gwGetMaterialInventory,
    gwGetSummonedSpecters,
    gwGetStructureList,
    gwGetTotalPower,
  } = useMemo(() => {
    function getLoomDetails() {
      return store.unlockedLooms.map((loomId) => {
        const def = GW_LOOMS.find((l) => l.id === loomId)
        return {
          id: loomId,
          def,
          active: store.activeLoomId === loomId,
          weavePower: def ? def.weavePower : 0,
        }
      })
    }

    function getMaterialInventory() {
      return Object.entries(store.collectedMaterials).map(([materialId, count]) => {
        const def = GW_MATERIALS.find((m) => m.id === materialId)
        return {
          materialId,
          count,
          def: def ?? null,
          totalValue: def ? def.value * count : 0,
        }
      }).sort((a, b) => b.totalValue - a.totalValue)
    }

    function getSummonedSpecters() {
      return store.summonedSpecters.map((s) => {
        const def = GW_SPECTERS.find((d) => d.id === s.specterDefId)
        return {
          ...s,
          def,
          speciesColor: def ? gwSpeciesColor(def.species) : GW_COLOR_SPECTRAL_WHITE,
          rarityColor: def ? gwRarityColor(def.rarity) : GW_COLOR_THREAD_SILVER,
          totalPower: Math.floor(s.power * (1 + s.level * 0.15) * (1 + s.bindCount * 0.25)),
        }
      })
    }

    function getStructureList() {
      return GW_STRUCTURES.map((def) => {
        const owned = store.structures.find((s) => s.structureDefId === def.id)
        const level = owned?.level ?? 0
        return {
          ...def,
          owned: !!owned,
          level,
          upgradeCost: level >= def.maxLevel ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, level)),
          maxed: level >= def.maxLevel,
        }
      })
    }

    function getTotalPower() {
      return store.summonedSpecters.reduce((sum, s) => {
        const def = GW_SPECTERS.find((d) => d.id === s.specterDefId)
        if (!def) return sum
        return sum + Math.floor(s.power * (1 + s.level * 0.15) * (1 + s.bindCount * 0.25))
      }, 0)
    }

    return { gwGetLoomDetails: getLoomDetails, gwGetMaterialInventory: getMaterialInventory, gwGetSummonedSpecters: getSummonedSpecters, gwGetStructureList: getStructureList, gwGetTotalPower: getTotalPower }
  }, [store])

  // ── Getter: Event Status ──────────────────────────────────────
  const gwGetEventStatus = useMemo(() => {
    if (!store.activeEventId) {
      return { active: false, event: null, timer: 0, severity: 0 }
    }
    const event = GW_EVENTS.find((e) => e.id === store.activeEventId)
    return {
      active: true,
      event: event ?? null,
      timer: store.eventTimer,
      severity: event ? event.severity : 0,
    }
  }, [store])

  // ── Getter: Loom Progress ─────────────────────────────────────
  const gwGetLoomProgress = useMemo(() => {
    const totalLooms = GW_LOOMS.length
    const unlocked = store.unlockedLooms.length
    return {
      totalLooms,
      unlocked,
      percent: Math.floor((unlocked / totalLooms) * 100),
      allUnlocked: unlocked >= totalLooms,
    }
  }, [store])

  // ── Getter: Achievement Progress ──────────────────────────────
  const gwGetAchievementProgress = useMemo(() => {
    const unlocked = store.achievements.length
    return { unlocked, total: GW_ACHIEVEMENTS.length, progress: unlocked }
  }, [store])

  // ── Getter: Title Progress ────────────────────────────────────
  const gwGetTitleProgress = useMemo(() => {
    return GW_TITLES.map((title) => ({
      ...title,
      unlocked: store.gwLevel >= title.requiredLevel && store.unlockedLooms.length >= title.requiredLooms,
      levelMet: store.gwLevel >= title.requiredLevel,
      loomsMet: store.unlockedLooms.length >= title.requiredLooms,
    }))
  }, [store])

  // ── Getter: Weaver State ──────────────────────────────────────
  const gwGetWeaverState = useMemo(() => {
    const { resonance, maxResonance, veilThickness } = store.weaver
    return {
      resonance,
      maxResonance,
      veilThickness,
      resonancePercent: Math.floor((resonance / maxResonance) * 100),
      veilStatus: veilThickness > 70 ? 'Stable' : veilThickness > 30 ? 'Thinning' : 'Critical',
    }
  }, [store])

  // ── Getter: Level Progress ────────────────────────────────────
  const gwGetLevelProgress = useMemo(() => {
    const current = gwXpForLevel(store.gwLevel)
    return {
      level: store.gwLevel,
      currentXp: store.gwExp,
      xpToNext: current,
      maxLevel: store.gwLevel >= GW_MAX_LEVEL,
      progressPercent:
        store.gwLevel >= GW_MAX_LEVEL
          ? 100
          : Math.floor(((store.gwExp - current) / current) * 100),
    }
  }, [store])

  // ── Getter: Stats Summary ─────────────────────────────────────
  const gwGetStatsSummary = useMemo(() => {
    const statsSummary = {
      totalPower: store.summonedSpecters.reduce((sum, s) => {
        const def = GW_SPECTERS.find((d) => d.id === s.specterDefId)
        if (!def) return sum
        return sum + Math.floor(s.power * (1 + s.level * 0.15) * (1 + s.bindCount * 0.25))
      }, 0),
      specterCount: store.summonedSpecters.length,
      materialCount: Object.keys(store.collectedMaterials).length,
      structureCount: store.structures.filter((s) => s.built).length,
      artifactCount: store.collectedArtifacts.length,
      loomCount: store.unlockedLooms.length,
      totalSpun: store.totalSpun,
      totalBound: store.totalBound,
      totalWoven: store.totalWoven,
    }

    const ghostCountByType = GW_SPECIES.map((species) => {
      const ghostsOfType = store.summonedSpecters.filter((s) => {
        const def = GW_SPECTERS.find((d) => d.id === s.specterDefId)
        return def && def.species === species
      })
      const bonus = gwGetSpeciesBonus(species)
      return {
        species,
        name: gwGetSpeciesName(species),
        count: ghostsOfType.length,
        color: gwSpeciesColor(species),
        spinBonus: bonus.spinBonus,
        bindBonus: bonus.bindBonus,
        weaveBonus: bonus.weaveBonus,
      }
    })

    return { gwGetStatsSummary: statsSummary, gwGetSpeciesSummary: ghostCountByType }
  }, [store])

  // ── Getter: Upgrade Costs ─────────────────────────────────────
  const gwGetUpgradeCosts = useMemo(() => {
    return store.structures.map((s) => {
      const def = GW_STRUCTURES.find((d) => d.id === s.structureDefId)
      if (!def) return { ...s, nextCost: 0, maxed: s.level >= 10 }
      const nextCost = s.level >= def.maxLevel ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level))
      return { ...s, def, nextCost, maxed: s.level >= def.maxLevel }
    })
  }, [store])

  // ── Getter: Artifact Power Bonus ──────────────────────────────
  const gwGetArtifactPowerBonus = useMemo(() => {
    const totalWeavePower = store.collectedArtifacts.reduce((sum, aId) => {
      const artifact = GW_ARTIFACTS.find((a) => a.id === aId)
      return sum + (artifact ? artifact.weavePower : 0)
    }, 0)
    return {
      totalWeavePower,
      artifactCount: store.collectedArtifacts.length,
      hasLegendaryArtifact: store.collectedArtifacts.some((aId) => {
        const artifact = GW_ARTIFACTS.find((a) => a.id === aId)
        return artifact && artifact.rarity === 'legendary'
      }),
      powerMultiplier: 1 + totalWeavePower * 0.001,
    }
  }, [store])

  // ── Getter: Bind Tier ─────────────────────────────────────────
  const gwGetSpecterBindTiers = useMemo(() => {
    return store.summonedSpecters.map((s) => {
      const def = GW_SPECTERS.find((d) => d.id === s.specterDefId)
      const bindTier = gwGetBindTier(s.bindCount)
      const nextTier = s.bindCount < 5 ? gwGetBindTier(s.bindCount + 1) : null
      return {
        ...s,
        def,
        bindTier,
        nextTier,
        canBind: s.bindCount < 5,
        bindBonus: gwGetBindBonus(s.level, s.bindCount),
      }
    })
  }, [store])

  // ── Getter: Loom Materials ────────────────────────────────────
  const gwGetLoomMaterials = useMemo(() => {
    if (!store.activeLoomId) return { materials: [], bonusMaterials: [] }
    const loomMap = gwGetLoomMaterialMap(store.activeLoomId)
    if (!loomMap) return { materials: [], bonusMaterials: [] }

    const materials = loomMap.materialIds
      .map((mId) => GW_MATERIALS.find((m) => m.id === mId))
      .filter((m): m is GWMaterialDef => m !== undefined)

    const bonusMaterials = loomMap.bonusMaterialIds
      .map((mId) => GW_MATERIALS.find((m) => m.id === mId))
      .filter((m): m is GWMaterialDef => m !== undefined)

    return { materials, bonusMaterials }
  }, [store])

  // ── Getter: Ectoplasm Efficiency, Species Summary, Resonance Details ──
  const {
    gwGetWeaveEfficiency,
    gwGetSpeciesSummary2,
    gwGetResonanceDetails,
  } = useMemo(() => {
    function getWeaveEfficiency() {
      const totalStructureBonus = store.structures.reduce((sum, s) => {
        return sum + gwGetStructureBonus(s.structureDefId, s.level)
      }, 0)
      const baseEfficiency = 1.0
      const structureBonus = totalStructureBonus * 0.01
      const loomBonus = store.unlockedLooms.length * 0.05
      return {
        total: Math.floor((baseEfficiency + structureBonus + loomBonus) * 100) / 100,
        structureContribution: structureBonus,
        loomContribution: loomBonus,
      }
    }

    function getSpeciesSummary2() {
      return GW_SPECIES.map((species) => {
        const specters = store.summonedSpecters.filter((s) => {
          const def = GW_SPECTERS.find((d) => d.id === s.specterDefId)
          return def && def.species === species
        })
        const bonus = gwGetSpeciesBonus(species)
        return {
          type: species,
          count: specters.length,
          color: gwSpeciesColor(species),
          spinBonus: bonus.spinBonus,
          bindBonus: bonus.bindBonus,
          weaveBonus: bonus.weaveBonus,
          totalPower: specters.reduce((sum, s) => sum + Math.floor(s.power * (1 + s.level * 0.15)), 0),
        }
      })
    }

    function getResonanceDetails() {
      const { resonance, maxResonance, veilThickness } = store.weaver
      const resonancePercent = Math.floor((resonance / maxResonance) * 100)
      const veilPercent = veilThickness
      return {
        resonance,
        maxResonance,
        resonancePercent,
        veilThickness,
        veilPercent,
        resonanceStatus: resonancePercent >= 80 ? 'Harmonic' : resonancePercent >= 50 ? 'Stable' : resonancePercent >= 20 ? 'Weak' : 'Critical',
        veilStatus: veilPercent >= 70 ? 'Intact' : veilPercent >= 40 ? 'Thinning' : veilPercent >= 15 ? 'Torn' : 'Breached',
      }
    }

    return { gwGetWeaveEfficiency: getWeaveEfficiency, gwGetSpeciesSummary2: getSpeciesSummary2, gwGetResonanceDetails: getResonanceDetails }
  }, [store])

  // ── Side Effects (stateRef.current reads only inside useEffect) ──
  useEffect(() => {
    const current = stateRef.current
    // Auto-check title upgrades
    for (const title of GW_TITLES) {
      if (current.gwLevel >= title.requiredLevel && current.unlockedLooms.length >= title.requiredLooms) {
        if (!current.achievements.includes(`title_${title.id}`)) {
          // Title progress is computed reactively, no state mutation needed here
        }
      }
    }
  }, [store])

  useEffect(() => {
    const current = stateRef.current
    // Sync current title based on level and looms
    let bestTitle = GW_TITLES[0]
    for (const title of GW_TITLES) {
      if (current.gwLevel >= title.requiredLevel && current.unlockedLooms.length >= title.requiredLooms) {
        bestTitle = title
      }
    }
    if (current.currentTitle !== bestTitle.id) {
      useGWStore.getState().currentTitle = bestTitle.id
    }
  }, [store])

  // ── Callbacks ─────────────────────────────────────────────────
  const gwSpinThread = useCallback((specterId: string): number => {
    return useGWStore.getState().gwSpinThread(specterId)
  }, [])

  const gwWeavePattern = useCallback((patternId: string): number => {
    return useGWStore.getState().gwWeavePattern(patternId)
  }, [])

  const gwSummonLoom = useCallback((loomId: string): boolean => {
    return useGWStore.getState().gwSummonLoom(loomId)
  }, [])

  const gwBindSpirit = useCallback((specterId: string): boolean => {
    return useGWStore.getState().gwBindSpirit(specterId)
  }, [])

  const gwSummonSpecter = useCallback((specterId: string): boolean => {
    return useGWStore.getState().gwSummonSpecter(specterId)
  }, [])

  const gwBuildStructure = useCallback((structureId: string): boolean => {
    return useGWStore.getState().gwBuildStructure(structureId)
  }, [])

  const gwUseAbility = useCallback((abilityId: string): boolean => {
    return useGWStore.getState().gwUseAbility(abilityId)
  }, [])

  const gwTriggerEvent = useCallback((eventId: string): boolean => {
    return useGWStore.getState().gwTriggerEvent(eventId)
  }, [])

  const gwCollectArtifact = useCallback((artifactId: string): boolean => {
    return useGWStore.getState().gwCollectArtifact(artifactId)
  }, [])

  // ── Assemble gwAPI ────────────────────────────────────────────
  const gwAPI = {
    // Constants
    GW_SPECTERS,
    GW_SPECIES,
    GW_LOOMS,
    GW_MATERIALS,
    GW_STRUCTURES,
    GW_ABILITIES,
    GW_ACHIEVEMENTS,
    GW_TITLES,
    GW_ARTIFACTS,
    GW_EVENTS,

    // Color constants
    GW_COLOR_GHOST_PURPLE,
    GW_COLOR_SPECTRAL_WHITE,
    GW_COLOR_THREAD_SILVER,
    GW_COLOR_VEIL_INDIGO,
    GW_COLOR_SHADOW_BLACK,
    GW_COLOR_MEMORY_BLUE,
    GW_COLOR_SOUL_AMBER,
    GW_COLOR_DAWN_ROSE,

    // State
    gwLevel: store.gwLevel,
    gwSpectralThreads: store.spectralThreads,
    gwWeaveDepth: store.weaveDepth,

    // Getters
    gwGetLoomDetails,
    gwGetMaterialInventory,
    gwGetSummonedSpecters,
    gwGetStructureList,
    gwGetTotalPower,
    gwGetEventStatus,
    gwGetLoomProgress,
    gwGetAchievementProgress,
    gwGetTitleProgress,
    gwGetWeaverState,
    gwGetLevelProgress,
    gwGetStatsSummary,
    gwGetUpgradeCosts,
    gwGetArtifactPowerBonus,
    gwGetSpecterBindTiers,
    gwGetLoomMaterials,
    gwGetWeaveEfficiency,
    gwGetSpeciesSummary2,
    gwGetResonanceDetails,

    // Full store state access
    store,

    // Actions
    gwSummonSpecter,
    gwSpinThread,
    gwBuildStructure,
    gwUseAbility,
    gwTriggerEvent,
    gwCollectArtifact,
    gwSummonLoom,
    gwBindSpirit,
    gwWeavePattern,
  }

  return gwAPI
}
