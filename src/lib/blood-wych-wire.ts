/**
 * Blood Wych Wire — 血巫 (Blood Witch / Vampire Coven) feature module for Word Snake
 *
 * A dark coven management mini-game: embrace 35 vampires across 5 rarity tiers
 * and 7 bloodlines, unlock 8 dark covens, collect 30 blood essences, build 25
 * coven structures, wield 22 blood magic abilities, earn 8 dark titles, gather 15
 * cursed relics, and survive 12 moonlit events — backed by a Zustand store with
 * persist middleware.
 *
 * Storage key: blood-wych-wire
 * Prefix: bw / BW_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type BWRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type BWBloodline = 'Dracula' | 'Carmilla' | 'Lilith' | 'Strigoi' | 'Asanbosam' | 'Chupacabra' | 'Nosferatu'
export type BWElement = 'vampiric' | 'shadow' | 'crimson' | 'bone' | 'thorn' | 'mist' | 'moonlit'

export interface BWVampireDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly bloodline: BWBloodline
  readonly rarity: BWRarity
  readonly basePower: number
  readonly ability: string
}

export interface BWCovenDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
}

export interface BWEssenceDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: BWRarity
  readonly source: string
  readonly value: number
}

export interface BWStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
}

export interface BWAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: BWElement
}

export interface BWAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface BWTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredCovens: number
}

export interface BWRelicDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: BWRarity
  readonly powerBonus: number
  readonly specialAbility: string
}

export interface BWMoonEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
}

export interface BWEmbracedVampire {
  readonly id: string
  vampireDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  awakened: boolean
  awakeningCount: number
  acquiredAt: number
}

export interface BWOwnedStructure {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface BWCovenState {
  bloodPool: number
  maxBloodPool: number
  corruption: number
  lastFedAt: number | null
}

export interface BWStoreState {
  embracedVampires: BWEmbracedVampire[]
  collectedEssences: Record<string, number>
  structures: BWOwnedStructure[]
  achievements: string[]
  currentTitle: string
  collectedRelics: string[]
  unlockedCovens: string[]
  covenLevel: number
  covenExp: number
  gold: number
  bloodEnergy: number
  totalEmbraced: number
  totalCollected: number
  totalUpgraded: number
  totalAwakened: number
  totalRituals: number
  activeEventId: string | null
  eventTimer: number
  covenSanctuary: BWCovenState
  activeCovenId: string | null
}

export interface BWStoreActions {
  bwEmbraceMortal: (vampireId: string) => boolean
  bwCollectEssence: (essenceId: string) => number
  bwUpgradeCoven: (structureId: string) => boolean
  bwUseAbility: (abilityId: string) => boolean
  bwTriggerMoonEvent: (eventId: string) => boolean
  bwAcquireRelic: (relicId: string) => boolean
  bwPerformRitual: (targetId: string) => boolean
  bwSummonBatSwarm: () => boolean
  bwCloakInShadows: () => boolean
  bwAwakenAncient: (instanceId: string) => boolean
}

export type BWFullStore = BWStoreState & BWStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const BW_COLOR_BLOOD_CRIMSON: string = '#8B0000'
export const BW_COLOR_DARK_PURPLE: string = '#2D0A4E'
export const BW_COLOR_MIDNIGHT_BLACK: string = '#0D0D0D'
export const BW_COLOR_SHADOW_GRAY: string = '#4A4A4A'
export const BW_COLOR_MOONLIGHT_SILVER: string = '#C0C0E0'
export const BW_COLOR_THORN_ROSE: string = '#8B1A4A'
export const BW_COLOR_PALE_IVORY: string = '#FFFFF0'
export const BW_COLOR_EMBER_RED: string = '#CC3300'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const BW_MAX_LEVEL = 50
const BW_INITIAL_GOLD = 500
const BW_INITIAL_ENERGY = 100

function bwXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= BW_MAX_LEVEL) return Infinity
  return Math.floor(85 * Math.pow(1.13, level) + level * 16)
}

function bwLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < BW_MAX_LEVEL) {
    const needed = bwXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function bwGenerateId(): string {
  return `bw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function bwRarityMultiplier(rarity: BWRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function bwBloodlineColor(bloodline: BWBloodline): string {
  switch (bloodline) {
    case 'Dracula': return BW_COLOR_BLOOD_CRIMSON
    case 'Carmilla': return BW_COLOR_THORN_ROSE
    case 'Lilith': return BW_COLOR_DARK_PURPLE
    case 'Strigoi': return BW_COLOR_MIDNIGHT_BLACK
    case 'Asanbosam': return BW_COLOR_EMBER_RED
    case 'Chupacabra': return BW_COLOR_SHADOW_GRAY
    case 'Nosferatu': return BW_COLOR_MOONLIGHT_SILVER
  }
}

function bwElementColor(element: BWElement): string {
  switch (element) {
    case 'vampiric': return BW_COLOR_BLOOD_CRIMSON
    case 'shadow': return BW_COLOR_MIDNIGHT_BLACK
    case 'crimson': return BW_COLOR_EMBER_RED
    case 'bone': return BW_COLOR_PALE_IVORY
    case 'thorn': return BW_COLOR_THORN_ROSE
    case 'mist': return BW_COLOR_SHADOW_GRAY
    case 'moonlit': return BW_COLOR_MOONLIGHT_SILVER
  }
}

function bwRarityColor(rarity: BWRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#A855F7'
    case 'rare': return '#DC2626'
    case 'epic': return '#7C3AED'
    case 'legendary': return '#FBBF24'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: BLOODLINE BONUSES & EMBRACE CHANCES
// ═══════════════════════════════════════════════════════════════════

const BW_BLOODLINE_BONUSES: Record<BWBloodline, { strength: number; speed: number; bloodBonus: number }> = {
  Dracula: { strength: 20, speed: 5, bloodBonus: 10 },
  Carmilla: { strength: 10, speed: 15, bloodBonus: 5 },
  Lilith: { strength: 15, speed: 10, bloodBonus: 20 },
  Strigoi: { strength: 25, speed: 0, bloodBonus: 0 },
  Asanbosam: { strength: 18, speed: 12, bloodBonus: 8 },
  Chupacabra: { strength: 12, speed: 20, bloodBonus: 3 },
  Nosferatu: { strength: 22, speed: 8, bloodBonus: 15 },
}

const BW_EMBRACE_CHANCES: Record<BWRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
}

const BW_COVEN_BLOODLINE_BONUS: Record<string, BWBloodline[]> = {
  crypt_of_shadows: ['Nosferatu', 'Strigoi'],
  crimson_chamber: ['Dracula', 'Lilith'],
  velvet_sanctum: ['Carmilla', 'Lilith'],
  bone_catacombs: ['Strigoi', 'Asanbosam'],
  thorned_garden: ['Carmilla', 'Lilith'],
  moonlit_keep: ['Nosferatu', 'Dracula'],
  hollow_sanctuary: ['Asanbosam', 'Chupacabra'],
  throne_of_night: ['Dracula', 'Carmilla', 'Lilith', 'Strigoi', 'Asanbosam', 'Chupacabra', 'Nosferatu'],
}

function bwGetBloodlineBonus(bloodline: BWBloodline): { strength: number; speed: number; bloodBonus: number } {
  return BW_BLOODLINE_BONUSES[bloodline]
}

function bwGetEmbraceChance(rarity: BWRarity, activeCovenId: string | null): number {
  let chance = BW_EMBRACE_CHANCES[rarity]
  if (activeCovenId) {
    const bonusBloodlines = BW_COVEN_BLOODLINE_BONUS[activeCovenId]
    if (bonusBloodlines && bonusBloodlines.length > 2) {
      chance = chance * 1.5
    }
  }
  return Math.min(100, Math.floor(chance))
}

function bwGetAwakeningBonus(level: number, awakeningCount: number): number {
  return Math.floor(level * 14 * (1 + awakeningCount * 0.3))
}

function bwGetStructureBonus(structureId: string, level: number): number {
  switch (structureId) {
    case 'blood_altar': return level * 2
    case 'shadow_summoning_circle': return level * 5
    case 'crimson_conduit': return level * 8
    case 'moonlit_beacon': return level * 12
    case 'throne_summoning_gate': return level * 20
    case 'blood_well': return level * 3
    case 'dark_forge': return level * 7
    case 'ritual_altar': return level * 15
    default: return level * 2
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: BW_VAMPIRES — 35 Vampires (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const BW_VAMPIRES: readonly BWVampireDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'night_fledgling',
    name: 'Night Fledgling',
    description:
      'A recently turned vampire still learning the ways of the night. Their fangs have barely grown in, and they stumble through shadows with the awkwardness of newborn prey. Given time, they will become a lethal predator of the dark.',
    bloodline: 'Dracula',
    rarity: 'common',
    basePower: 15,
    ability: 'Night Vision',
  },
  {
    id: 'grave_dirt_gnawer',
    name: 'Grave Dirt Gnawer',
    description:
      'A lowly Nosferatu that sleeps in shallow graves and feeds on small animals. Its hideous appearance frightens even other vampires. Despite its weakness, it possesses an uncanny ability to sense underground blood veins.',
    bloodline: 'Nosferatu',
    rarity: 'common',
    basePower: 18,
    ability: 'Earth Sense',
  },
  {
    id: 'crimson_thrall',
    name: 'Crimson Thrall',
    description:
      'A mindless servant created by a Lilith-blood vampire. It obeys commands without question and fights with desperate ferocity when its master is threatened. Its eyes glow a dull crimson in the dark.',
    bloodline: 'Lilith',
    rarity: 'common',
    basePower: 16,
    ability: 'Thrall Bond',
  },
  {
    id: 'mist_wisp',
    name: 'Mist Wisp',
    description:
      'A Carmilla-blood vampire that can dissolve into a thin mist. Its powers are too weak for full transformation, but it can slip through cracks in doors and spy through keyholes with ease.',
    bloodline: 'Carmilla',
    rarity: 'common',
    basePower: 14,
    ability: 'Partial Mist Form',
  },
  {
    id: 'bone_cruncher',
    name: 'Bone Cruncher',
    description:
      'A Strigoi ghoul-vampire hybrid that feeds on bone marrow rather than blood. Its jaw strength is immense, capable of cracking femurs with a single bite. Leftover bones are scattered around its lair.',
    bloodline: 'Strigoi',
    rarity: 'common',
    basePower: 19,
    ability: 'Bone Crush',
  },
  {
    id: 'thicket_stalker',
    name: 'Thicket Stalker',
    description:
      'An Asanbosam vampire that lurks in dense forests, ambushing travelers from the treetops. Its iron-hooked feet grip branches with impossible strength, and it drops silently onto its prey below.',
    bloodline: 'Asanbosam',
    rarity: 'common',
    basePower: 17,
    ability: 'Tree Ambush',
  },
  {
    id: 'alley_gnasher',
    name: 'Alley Gnasher',
    description:
      'A Chupacabra-blood vampire that haunts city back alleys and abandoned lots. Small and wiry, it moves on all fours and feeds on stray animals. Its signature spine ridge bristles when it detects prey.',
    bloodline: 'Chupacabra',
    rarity: 'common',
    basePower: 20,
    ability: 'Spine Ridge',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'blood_courtier',
    name: 'Blood Courtier',
    description:
      'A Dracula-blood vampire trained in the dark arts of courtly manipulation. It infiltrates high society with hypnotic charm, arranging "accidents" for the unwary. Its smile hides fangs that drip with venom.',
    bloodline: 'Dracula',
    rarity: 'uncommon',
    basePower: 32,
    ability: 'Hypnotic Charm',
  },
  {
    id: 'velvet_seductress',
    name: 'Velvet Seductress',
    description:
      'A Carmilla-blood vampire of terrible beauty. She appears in the dreams of mortals, luring them to her lair with promises of forbidden pleasure. None who visit her boudoir ever see the sunrise.',
    bloodline: 'Carmilla',
    rarity: 'uncommon',
    basePower: 35,
    ability: 'Dream Lure',
  },
  {
    id: 'lilith_handmaiden',
    name: 'Lilith Handmaiden',
    description:
      'A direct servant of the Lilith bloodline. She wields dark magic drawn from the first woman\'s ancient curse, commanding shadows to bind and choke her enemies. Her laughter echoes with the screams of the damned.',
    bloodline: 'Lilith',
    rarity: 'uncommon',
    basePower: 30,
    ability: 'Shadow Binding',
  },
  {
    id: 'strigoi_rot_knight',
    name: 'Strigoi Rot Knight',
    description:
      'A fallen knight animated by Strigoi necromancy. Its rusted armor is held together by writhing grave worms, and its sword drips with rotting ichor. It cannot be killed — only temporarily destroyed.',
    bloodline: 'Strigoi',
    rarity: 'uncommon',
    basePower: 38,
    ability: 'Rot Aura',
  },
  {
    id: 'iron_hook_climber',
    name: 'Iron Hook Climber',
    description:
      'An Asanbosam vampire that has evolved iron hooks instead of hands and feet. It scales sheer walls and cliffs with ease, and its hooks can tear through armor plate like wet paper. It marks its territory with deep gouges in stone.',
    bloodline: 'Asanbosam',
    rarity: 'uncommon',
    basePower: 34,
    ability: 'Iron Hook Rend',
  },
  {
    id: 'goat_horned_hunter',
    name: 'Goat-Horned Hunter',
    description:
      'A Chupacabra-blood vampire that has grown curved horns from its skull. It hunts in packs across desolate moorlands, coordinating attacks with high-pitched whistles that only its kind can hear.',
    bloodline: 'Chupacabra',
    rarity: 'uncommon',
    basePower: 36,
    ability: 'Pack Howl',
  },
  {
    id: 'sewer_warden',
    name: 'Sewer Warden',
    description:
      'A Nosferatu that rules the underground passages beneath major cities. It knows every tunnel, drain, and secret passage. Its pale eyes can see through total darkness, and it commands armies of sewer rats.',
    bloodline: 'Nosferatu',
    rarity: 'uncommon',
    basePower: 33,
    ability: 'Rat Command',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'count_draculas_heir',
    name: 'Count Dracula\'s Heir',
    description:
      'A direct descendant of the original Count Dracula, bearing the ancient vampire\'s aristocratic features and terrible power. It can command wolves and transform into a bat at will. Its castle is a fortress of shadows and blood.',
    bloodline: 'Dracula',
    rarity: 'rare',
    basePower: 58,
    ability: 'Wolf Command',
  },
  {
    id: 'carmilla_duchess',
    name: 'Carmilla Duchess',
    description:
      'A noble of the Carmilla bloodline who rules over a province of eternally dark forests. She can transform into a massive black cat and commands an entourage of phantom maidens who do her bidding.',
    bloodline: 'Carmilla',
    rarity: 'rare',
    basePower: 62,
    ability: 'Phantom Entourage',
  },
  {
    id: 'lilith_high_priestess',
    name: 'Lilith High Priestess',
    description:
      'A vampire sorceress who channels the primal power of Lilith herself. She can curse entire bloodlines with a single word and raise armies of shadow constructs from the darkness between worlds.',
    bloodline: 'Lilith',
    rarity: 'rare',
    basePower: 65,
    ability: 'Bloodline Curse',
  },
  {
    id: 'strigoi_warlord',
    name: 'Strigoi Warlord',
    description:
      'An ancient Strigoi that has conquered death itself through sheer rage. Its body is a mass of rotting muscle and bone held together by dark willpower. It can raise the dead to fight alongside it in endless war.',
    bloodline: 'Strigoi',
    rarity: 'rare',
    basePower: 60,
    ability: 'Necromantic Horde',
  },
  {
    id: 'asanbosam_iron_titan',
    name: 'Asanbosam Iron Titan',
    description:
      'A massive Asanbosam that has replaced much of its body with iron extracted from its victims\' blood. It stands twelve feet tall and its metallic frame is impervious to conventional weapons.',
    bloodline: 'Asanbosam',
    rarity: 'rare',
    basePower: 55,
    ability: 'Iron Body',
  },
  {
    id: 'chupacabra_alpha',
    name: 'Chupacabra Alpha',
    description:
      'The leader of a massive Chupacabra pack spanning three continents. Its spines drip with paralytic venom, and it can drain a full-grown bull dry in seconds. Cattle mutilations spike wherever it migrates.',
    bloodline: 'Chupacabra',
    rarity: 'rare',
    basePower: 57,
    ability: 'Paralytic Drain',
  },
  {
    id: 'nosferatu_elder',
    name: 'Nosferatu Elder',
    description:
      'An ancient, deformed Nosferatu that has survived for millennia by hiding in the deepest crypts. Its appearance is so horrifying that mortals who glimpse it lose their sanity. It speaks in a whisper that carries for miles.',
    bloodline: 'Nosferatu',
    rarity: 'rare',
    basePower: 63,
    ability: 'Madness Whisper',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'dracula_crown_prince',
    name: 'Dracula Crown Prince',
    description:
      'The firstborn son of Count Dracula, groomed from birth to inherit the throne of darkness. He wields the original Dracula blade — a sword forged from the blood of a thousand conquered nations.',
    bloodline: 'Dracula',
    rarity: 'epic',
    basePower: 95,
    ability: 'Throne of Darkness',
  },
  {
    id: 'carmilla_shadow_queen',
    name: 'Carmilla Shadow Queen',
    description:
      'A Carmilla vampire who has merged with the concept of shadows itself. She IS darkness. In her presence, all light ceases to exist. Her domain is an eternal night where she reigns absolute.',
    bloodline: 'Carmilla',
    rarity: 'epic',
    basePower: 100,
    ability: 'Eternal Night Domain',
  },
  {
    id: 'lilith_avatar',
    name: 'Lilith Avatar',
    description:
      'A vampire chosen by Lilith as her living avatar. Lilith\'s consciousness flows through her like dark lightning. She can reshape reality in a limited radius, creating nightmares made flesh.',
    bloodline: 'Lilith',
    rarity: 'epic',
    basePower: 105,
    ability: 'Nightmare Reality',
  },
  {
    id: 'strigoi_death_king',
    name: 'Strigoi Death King',
    description:
      'The undisputed king of all Strigoi. His army of the dead numbers in the tens of thousands, and he can animate any corpse within a fifty-mile radius. He sits upon a throne of skulls in a citadel of bone.',
    bloodline: 'Strigoi',
    rarity: 'epic',
    basePower: 98,
    ability: 'Death March',
  },
  {
    id: 'asanbosam_iron_god',
    name: 'Asanbosam Iron God',
    description:
      'An Asanbosam that has transcended flesh entirely, becoming a being of pure living iron. It towers over forests and its footsteps create earthquakes. It feeds by impaling victims on its iron protrusions.',
    bloodline: 'Asanbosam',
    rarity: 'epic',
    basePower: 92,
    ability: 'Iron God Form',
  },
  {
    id: 'chupacabra_elder_god',
    name: 'Chupacabra Elder God',
    description:
      'A primordial Chupacabra from before recorded history. It is the ancestor of all goat-suckers and possesses the original curse in its purest form. Its hunger is infinite and insatiable, threatening entire ecosystems.',
    bloodline: 'Chupacabra',
    rarity: 'epic',
    basePower: 96,
    ability: 'Primordial Hunger',
  },
  {
    id: 'nosferatu_void_lord',
    name: 'Nosferatu Void Lord',
    description:
      'A Nosferatu that has expanded into the spaces between dimensions. Its true form exists in a void of non-existence, and only its shadow can be seen in our world. Those who touch the shadow are pulled into nothingness.',
    bloodline: 'Nosferatu',
    rarity: 'epic',
    basePower: 88,
    ability: 'Void Shadow',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'dracula_immortal_sovereign',
    name: 'Dracula — Immortal Sovereign',
    description:
      'Vlad Tepes himself, the original vampire, forged by a pact with dark forces during his mortal crusade against the Ottomans. He is the father of all Dracula-blood vampires. His power is absolute, his hunger eternal, and his castle stands between worlds.',
    bloodline: 'Dracula',
    rarity: 'legendary',
    basePower: 150,
    ability: 'Sovereign\'s Decree',
  },
  {
    id: 'carmilla_original_seductress',
    name: 'Carmilla — Original Seductress',
    description:
      'The original Carmilla, born Mircalla Karnstein in Styria, 1680. She perfected the art of vampiric seduction, becoming the template for all Carmilla-blood vampires. Her beauty transcends mortality itself, and her kisses carry both ecstasy and death.',
    bloodline: 'Carmilla',
    rarity: 'legendary',
    basePower: 145,
    ability: 'Kiss of Eternity',
  },
  {
    id: 'lilith_demon_mother',
    name: 'Lilith — Demon Mother of Vampires',
    description:
      'The first vampire. Before Dracula, before Carmilla, there was Lilith — Adam\'s first wife, cast from Eden for refusing to submit. She made a pact with the serpent and became the mother of all night creatures. Her blood is the source of all vampirism.',
    bloodline: 'Lilith',
    rarity: 'legendary',
    basePower: 148,
    ability: 'Mother\'s Curse',
  },
  {
    id: 'strigoi_first_undead',
    name: 'Strigoi — First of the Undead',
    description:
      'The original Strigoi, a corpse that refused to stay dead. It was the first being to cheat death through sheer rage, and every subsequent undead creature carries a fragment of its furious will. It can never truly be destroyed.',
    bloodline: 'Strigoi',
    rarity: 'legendary',
    basePower: 140,
    ability: 'Absolute Undeath',
  },
  {
    id: 'asanbosam_forest_demon',
    name: 'Asanbosam — Forest Demon of Ashanti',
    description:
      'The primordial Asanbosam from West African legend — a tree-dwelling demon with iron hooks for feet. It has haunted the rainforests since before human memory, and its iron hooks can pierce the veil between the living and spirit worlds.',
    bloodline: 'Asanbosam',
    rarity: 'legendary',
    basePower: 142,
    ability: 'World-Piercing Hooks',
  },
  {
    id: 'chupacabra_first_predator',
    name: 'Chupacabra — First Predator',
    description:
      'The original Chupacabra, born from a curse placed upon a shape-shifting trickster god. It is the perfect predator — fast, silent, and insatiable. Its spines channel dark energy that can drain the life from entire herds in minutes.',
    bloodline: 'Chupacabra',
    rarity: 'legendary',
    basePower: 138,
    ability: 'Apex Predator',
  },
  {
    id: 'nosferatu_original_horror',
    name: 'Nosferatu — Original Horror',
    description:
      'The Nosferatu from which all others descend — the first vampire to be truly monstrous in form. Its appearance inspired every vampire legend of ugliness and decay. To see its true face is to understand the nature of horror itself.',
    bloodline: 'Nosferatu',
    rarity: 'legendary',
    basePower: 135,
    ability: 'Essence of Horror',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: BW_COVENS — 8 Dark Covens (Hidden Sanctuaries)
// ═══════════════════════════════════════════════════════════════════

export const BW_COVENS: readonly BWCovenDef[] = [
  {
    id: 'crypt_of_shadows',
    name: 'Crypt of Shadows',
    description:
      'A crumbling underground crypt where the first vampires of the Nosferatu bloodline gathered to escape the sun. The walls weep with condensation that tastes of old blood, and the air hums with dormant necromantic energy.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['+5% embrace rate', 'Basic essence gathering'],
  },
  {
    id: 'crimson_chamber',
    name: 'Crimson Chamber',
    description:
      'A hidden chamber beneath a nobleman\'s estate, decorated with crimson velvet and filled with the scent of roses. Dracula-blood vampires use it as a meeting place for dark rituals and blood pacts.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['+10% blood energy regeneration', 'Rare vampire encounters'],
  },
  {
    id: 'velvet_sanctum',
    name: 'Velvet Sanctum',
    description:
      'A luxurious underground parlor draped in black velvet and lit by blood-red candles. Carmilla-blood vampires host extravagant soirees here, where mortals are both guests and menu items.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['+15% charm abilities', 'Shadow stealth aura'],
  },
  {
    id: 'bone_catacombs',
    name: 'Bone Catacombs',
    description:
      'Miles of underground tunnels lined with the bones of centuries-dead mortals. Strigoi vampires have expanded the catacombs into a subterranean city of the dead, complete with bone architecture and marrow wells.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['+20% necromantic power', 'Structure upgrades available'],
  },
  {
    id: 'thorned_garden',
    name: 'Thorned Garden',
    description:
      'A garden of dead roses that bloom only under moonlight, their thorns sharp enough to cut through steel. Lilith herself planted the first seeds here, and the garden\'s magic protects all who carry her bloodline.',
    minLevel: 22,
    unlockCost: 3000,
    bonuses: ['+25% dark magic power', 'Essence materials available'],
  },
  {
    id: 'moonlit_keep',
    name: 'Moonlit Keep',
    description:
      'A fortress perched atop a cliff where moonlight never stops shining, even during solar eclipses. The keep\'s silver mirrors focus moonlight into beams that heal vampires and harm their enemies.',
    minLevel: 30,
    unlockCost: 7500,
    bonuses: ['+30% moonlit element power', 'Epic vampire summoning unlocked'],
  },
  {
    id: 'hollow_sanctuary',
    name: 'Hollow Sanctuary',
    description:
      'A vast cavern beneath a dormant volcano, heated by geothermal vents that keep it warm enough for the cold-blooded vampires of southern bloodlines. The walls glow faintly orange with trapped magma light.',
    minLevel: 38,
    unlockCost: 15000,
    bonuses: ['+35% exotic bloodline power', 'Legendary essence chance'],
  },
  {
    id: 'throne_of_night',
    name: 'Throne of Night',
    description:
      'The heart of all vampire domains — a colossal obsidian throne room that exists in perpetual darkness. No light has ever penetrated its depths. The throne itself resonates with the combined power of all seven original bloodlines.',
    minLevel: 45,
    unlockCost: 30000,
    bonuses: ['+50% all bloodline power', 'Legendary vampire summoning', 'Ancient awakening rituals'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: BW_ESSENCES — 30 Blood Essences
// ═══════════════════════════════════════════════════════════════════

export const BW_ESSENCES: readonly BWEssenceDef[] = [
  // Common (6)
  { id: 'crimson_drip', name: 'Crimson Drip', description: 'A single drop of fresh vampire blood. Warm to the touch and pulsing with faint dark energy. Used in basic embrace rituals.', rarity: 'common', source: 'crypt_of_shadows', value: 5 },
  { id: 'shadow_venom', name: 'Shadow Venom', description: 'Venom extracted from a Nosferatu\'s fangs. Causes temporary paralysis in mortals and is a key ingredient in potions of shadow walking.', rarity: 'common', source: 'crypt_of_shadows', value: 6 },
  { id: 'bone_shard', name: 'Bone Shard', description: 'A fragment of enchanted bone from a Strigoi\'s lair. It hums with necromantic resonance and can be used to animate small creatures.', rarity: 'common', source: 'crypt_of_shadows', value: 4 },
  { id: 'mist_vial', name: 'Mist Vial', description: 'A sealed vial containing condensed vampiric mist. When released, it creates a small cloud that obscures vision for several minutes.', rarity: 'common', source: 'crypt_of_shadows', value: 8 },
  { id: 'bat_fang', name: 'Bat Fang', description: 'A fang from a vampire bat, larger than normal and tinged with dark magic. Commonly used as an amulet for basic night vision enhancement.', rarity: 'common', source: 'crimson_chamber', value: 7 },
  { id: 'thorn_blood', name: 'Thorn Blood', description: 'Dark sap that bleeds from the roses in the Thorned Garden when pricked. It has mild healing properties for vampires.', rarity: 'common', source: 'crypt_of_shadows', value: 9 },

  // Uncommon (6)
  { id: 'draculas_tear', name: 'Dracula\'s Tear', description: 'A crystallized tear shed by a Dracula-blood vampire. It glows with aristocratic power and enhances leadership abilities when consumed.', rarity: 'uncommon', source: 'crimson_chamber', value: 28 },
  { id: 'velvet_essence', name: 'Velvet Essence', description: 'Concentrated charm energy extracted from the atmosphere of the Velvet Sanctum. Grants enhanced hypnotic abilities to any vampire.', rarity: 'uncommon', source: 'velvet_sanctum', value: 35 },
  { id: 'bone_marrow_ichor', name: 'Bone Marrow Ichor', description: 'Thick black fluid extracted from the bones in the Bone Catacombs. A single drop can reanimate a recently deceased corpse.', rarity: 'uncommon', source: 'bone_catacombs', value: 32 },
  { id: 'moonlight_dew', name: 'Moonlight Dew', description: 'Condensed moonlight collected from the Moonlit Keep\'s silver mirrors. It glows with a soft silver luminescence and heals vampire wounds.', rarity: 'uncommon', source: 'velvet_sanctum', value: 40 },
  { id: 'iron_hook_fragment', name: 'Iron Hook Fragment', description: 'A piece of an Asanbosam\'s iron hook, still warm with body heat. It grants temporary iron-hard skin to whoever carries it.', rarity: 'uncommon', source: 'crimson_chamber', value: 30 },
  { id: 'liliths_breath', name: 'Lilith\'s Breath', description: 'Captured breath from the mouth of a sleeping Lilith-blood vampire. It smells of nightshade and grants temporary dark vision.', rarity: 'uncommon', source: 'bone_catacombs', value: 45 },

  // Rare (6)
  { id: 'sanguine_crystal', name: 'Sanguine Crystal', description: 'A crystal formed from coagulated vampire blood under extreme pressure. It pulses with a heartbeat and contains concentrated life force.', rarity: 'rare', source: 'thorned_garden', value: 120 },
  { id: 'shadow_weave', name: 'Shadow Weave', description: 'A strand of actual shadow, pulled from between dimensions. It can be woven into clothing that grants near-invisibility in darkness.', rarity: 'rare', source: 'thorned_garden', value: 150 },
  { id: 'phoenix_ash_vial', name: 'Phoenix Ash Vial', description: 'Ash from a vampire phoenix — a creature that dies in flames and is reborn from its own ashes. Grants resistance to fire damage.', rarity: 'rare', source: 'bone_catacombs', value: 140 },
  { id: 'moonstone_heart', name: 'Moonstone Heart', description: 'A heart-shaped moonstone that beats with captured lunar energy. Vampires who hold it feel their powers amplified under moonlight.', rarity: 'rare', source: 'moonlit_keep', value: 160 },
  { id: 'ancient_blood_pact', name: 'Ancient Blood Pact', description: 'A parchment signed in blood by two ancient vampires. The pact binds their power together, allowing shared abilities across any distance.', rarity: 'rare', source: 'thorned_garden', value: 135 },
  { id: 'iron_heart_ore', name: 'Iron Heart Ore', description: 'Metallic ore found only in the Hollow Sanctuary, infused with geothermal energy. When smelted, it produces an unbreakable alloy.', rarity: 'rare', source: 'hollow_sanctuary', value: 110 },

  // Epic (6)
  { id: 'void_essence', name: 'Void Essence', description: 'Essence extracted from the space between dimensions where Nosferatu Void Lords dwell. It consumes all light and warmth near it.', rarity: 'epic', source: 'moonlit_keep', value: 500 },
  { id: 'liliths_diary_page', name: 'Lilith\'s Diary Page', description: 'A page from the diary of Lilith herself, written in a language that predates human speech. Reading it grants forbidden knowledge.', rarity: 'epic', source: 'thorned_garden', value: 550 },
  { id: 'draculas_crown_shard', name: 'Dracula\'s Crown Shard', description: 'A fragment of the crown worn by the original Count Dracula. It radiates authority and compels lesser vampires to kneel.', rarity: 'epic', source: 'moonlit_keep', value: 600 },
  { id: 'carmillas_mirror', name: 'Carmilla\'s Mirror', description: 'A hand mirror once owned by the original Carmilla. It shows the viewer\'s reflection as it will appear after vampiric transformation.', rarity: 'epic', source: 'velvet_sanctum', value: 520 },
  { id: 'blood_ocean_drop', name: 'Blood Ocean Drop', description: 'A drop of liquid from the legendary Blood Ocean — a sea of pure blood said to exist in a pocket dimension. Infinite potential locked in a single drop.', rarity: 'epic', source: 'throne_of_night', value: 480 },
  { id: 'strigoi_death_mark', name: 'Strigoi Death Mark', description: 'A tattoo that appears on the skin of whoever kills a Strigoi Death King. It grants limited control over the undead.', rarity: 'epic', source: 'bone_catacombs', value: 570 },

  // Legendary (6)
  { id: 'liliths_original_blood', name: 'Lilith\'s Original Blood', description: 'A vial of blood drawn from Lilith herself — the source of all vampirism. A single drop can transform any mortal into a vampire of tremendous power.', rarity: 'legendary', source: 'throne_of_night', value: 5000 },
  { id: 'draculas_signet_ring', name: 'Dracula\'s Signet Ring', description: 'The original signet ring of Vlad Tepes, bearing his family crest. It commands absolute loyalty from all Dracula-blood vampires.', rarity: 'legendary', source: 'throne_of_night', value: 6000 },
  { id: 'eternal_night_shard', name: 'Eternal Night Shard', description: 'A fragment of pure darkness from the Carmilla Shadow Queen\'s domain. It can extinguish any light source permanently.', rarity: 'legendary', source: 'throne_of_night', value: 5500 },
  { id: 'primordial_death_essence', name: 'Primordial Death Essence', description: 'The concentrated essence of the first death — the moment mortality was first defied. It holds the key to true immortality.', rarity: 'legendary', source: 'throne_of_night', value: 7000 },
  { id: 'asanbosam_iron_seed', name: 'Asanbosam Iron Seed', description: 'The original iron core from which all Asanbosam hooks grow. Planting it causes iron trees to sprout from the ground overnight.', rarity: 'legendary', source: 'throne_of_night', value: 6500 },
  { id: 'blood_moon_philosophers_stone', name: 'Blood Moon Philosopher\'s Stone', description: 'A stone that turns blood into any material when bathed in the light of a blood moon. The ultimate transmutation artifact of the vampire world.', rarity: 'legendary', source: 'throne_of_night', value: 8000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: BW_STRUCTURES — 25 Coven Structures
// ═══════════════════════════════════════════════════════════════════

export const BW_STRUCTURES: readonly BWStructureDef[] = [
  // Summoning (5)
  { id: 'blood_altar', name: 'Blood Altar', description: 'A stone altar stained with centuries of blood offerings. Used for embracing new vampires and performing basic blood rituals.', baseCost: 100, costMultiplier: 1.5 },
  { id: 'shadow_summoning_circle', name: 'Shadow Summoning Circle', description: 'A circle drawn in blood and ash that amplifies summoning rituals. Increases the chance of attracting uncommon vampires.', baseCost: 400, costMultiplier: 1.6 },
  { id: 'crimson_conduit', name: 'Crimson Conduit', description: 'A crystalline pipe that channels raw blood energy from deep underground. Required for rare vampire summoning.', baseCost: 1200, costMultiplier: 1.7 },
  { id: 'moonlit_beacon', name: 'Moonlit Beacon', description: 'A silver beacon that reflects concentrated moonlight into the shadow realm, attracting powerful vampires from distant covens.', baseCost: 3000, costMultiplier: 1.8 },
  { id: 'throne_summoning_gate', name: 'Throne Summoning Gate', description: 'A massive gate of black iron inscribed with the true names of all seven bloodlines. Capable of calling legendary vampires.', baseCost: 8000, costMultiplier: 2.0 },

  // Production (5)
  { id: 'blood_harvester', name: 'Blood Harvester', description: 'A device that extracts residual blood energy from the surrounding earth, producing a steady supply of basic essences.', baseCost: 80, costMultiplier: 1.4 },
  { id: 'shadow_distillery', name: 'Shadow Distillery', description: 'A dark alchemy apparatus that condenses ambient shadow into usable essence. Produces shadow-themed materials at an enhanced rate.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'essence_condenser', name: 'Essence Condenser', description: 'Captures and condenses blood mist that naturally rises from ancient battlefields. Produces rare essences during peak activity.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'moonlight_collector', name: 'Moonlight Collector', description: 'An array of silver mirrors that focuses moonlight into a single point, generating moonlit essences overnight.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'dark_forge', name: 'Dark Forge', description: 'A forge that operates on blood energy rather than heat. It can process and combine any blood essence into powerful artifacts.', baseCost: 5000, costMultiplier: 1.8 },

  // Defense (5)
  { id: 'shadow_wall', name: 'Shadow Wall', description: 'A wall of animated shadow that regenerates when damaged. Provides basic protection against vampire hunters and sunlight exposure.', baseCost: 120, costMultiplier: 1.4 },
  { id: 'bone_barricade', name: 'Bone Barricade', description: 'A barricade constructed from reinforced bones of fallen enemies. Beautiful and terrifying in equal measure, it shrieks when touched.', baseCost: 500, costMultiplier: 1.5 },
  { id: 'mist_shield_generator', name: 'Mist Shield Generator', description: 'Projects a protective dome of thick vampiric mist powered by concentrated blood energy. Impervious to conventional weapons.', baseCost: 1500, costMultiplier: 1.6 },
  { id: 'bat_swarm_turret', name: 'Bat Swarm Turret', description: 'An automated turret that releases swarms of vampire bats to deter intruders. Effective against both ground and aerial threats.', baseCost: 700, costMultiplier: 1.5 },
  { id: 'coven_fortress', name: 'Coven Fortress', description: 'A massive obsidian citadel that serves as the ultimate defense structure. It generates its own perpetual night for protection.', baseCost: 4000, costMultiplier: 1.8 },

  // Utility (5)
  { id: 'blood_well', name: 'Blood Well', description: 'A well that draws blood energy from the earth\'s veins. Passive blood energy regeneration for all coven operations.', baseCost: 150, costMultiplier: 1.4 },
  { id: 'essence_vault', name: 'Essence Vault', description: 'A cryogenic storage vault that preserves blood essences at perfect conditions. Prevents degradation and spontaneous coagulation.', baseCost: 250, costMultiplier: 1.5 },
  { id: 'vampire_rest_coffin', name: 'Vampire Rest Coffin', description: 'A luxurious coffin lined with grave soil from the vampire\'s homeland. Vampires resting here recover energy twice as fast.', baseCost: 600, costMultiplier: 1.5 },
  { id: 'blood_purifier', name: 'Blood Purifier', description: 'A device that filters corruption and poisons from collected blood. Essential for maintaining coven health and preventing blood madness.', baseCost: 1000, costMultiplier: 1.6 },
  { id: 'ritual_altar', name: 'Ritual Altar', description: 'A sacred altar where complex blood rituals can be performed. Requires immense blood energy but produces extraordinary results.', baseCost: 5000, costMultiplier: 2.0 },

  // Crypts (5)
  { id: 'simple_coffin_niche', name: 'Simple Coffin Niche', description: 'A carved niche in the crypt wall for storing a single vampire\'s resting coffin. Provides basic protection from sunlight.', baseCost: 60, costMultiplier: 1.3 },
  { id: 'family_crypt', name: 'Family Crypt', description: 'A small underground chamber that holds multiple coffins. Provides shared protection and a sense of belonging for related vampires.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'royal_mausoleum', name: 'Royal Mausoleum', description: 'An ornate underground tomb with marble walls and silver fittings. Houses the coven\'s most important vampires in eternal comfort.', baseCost: 1000, costMultiplier: 1.6 },
  { id: 'blood_cathedral', name: 'Blood Cathedral', description: 'A subterranean cathedral with pews made of bone and stained glass windows of congealed blood. The ultimate resting place for ancient vampires.', baseCost: 3000, costMultiplier: 1.7 },
  { id: 'abyssal_tomb', name: 'Abyssal Tomb', description: 'A tomb that descends into the abyss itself. Vampires who rest here dream of the void and wake with enhanced powers of darkness.', baseCost: 6000, costMultiplier: 2.0 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: BW_ABILITIES — 22 Blood Magic Abilities
// ═══════════════════════════════════════════════════════════════════

export const BW_ABILITIES: readonly BWAbilityDef[] = [
  // Vampiric (4)
  { id: 'blood_drain', name: 'Blood Drain', description: 'Drains the life force from a target, converting it into blood energy. The most fundamental vampiric ability.', cooldown: 5, power: 15, element: 'vampiric' },
  { id: 'vampiric_speed', name: 'Vampiric Speed', description: 'Enhances movement speed to supernatural levels, allowing the vampire to cross a room faster than the eye can follow.', cooldown: 8, power: 20, element: 'vampiric' },
  { id: 'fang_strike', name: 'Fang Strike', description: 'A devastating bite attack that deals massive damage and heals the vampire for a portion of damage dealt.', cooldown: 10, power: 35, element: 'vampiric' },
  { id: 'regeneration', name: 'Dark Regeneration', description: 'Accelerated healing that mends even severed limbs over time, using stored blood energy as fuel.', cooldown: 15, power: 40, element: 'vampiric' },

  // Shadow (4)
  { id: 'shadow_step', name: 'Shadow Step', description: 'Teleport between shadows within a limited range. The vampire dissolves into shadow and reforms in another dark spot.', cooldown: 6, power: 18, element: 'shadow' },
  { id: 'shadow_blade', name: 'Shadow Blade', description: 'Conjures a blade of pure shadow that can cut through any material. The blade exists only in darkness and dissolves in light.', cooldown: 12, power: 45, element: 'shadow' },
  { id: 'shadowcloak', name: 'Shadow Cloak', description: 'Wraps the vampire in living shadow, rendering them completely invisible in any lighting condition darker than full daylight.', cooldown: 10, power: 30, element: 'shadow' },
  { id: 'void_grip', name: 'Void Grip', description: 'Extends a hand of shadow from a distance to grab and choke a target. The grip is unbreakable by physical means.', cooldown: 18, power: 55, element: 'shadow' },

  // Crimson (4)
  { id: 'crimson_bolt', name: 'Crimson Bolt', description: 'Fires a bolt of concentrated blood energy that explodes on impact, splattering corrosive blood in all directions.', cooldown: 7, power: 25, element: 'crimson' },
  { id: 'blood_boil', name: 'Blood Boil', description: 'Causes the blood inside a target\'s body to boil, dealing internal damage that ignores all physical armor.', cooldown: 14, power: 50, element: 'crimson' },
  { id: 'crimson_shield', name: 'Crimson Shield', description: 'Creates a shield of coagulated blood that absorbs incoming damage. The shield grows stronger as more blood is spilled nearby.', cooldown: 12, power: 35, element: 'crimson' },
  { id: 'sanguine_storm', name: 'Sanguine Storm', description: 'Summons a whirlwind of blood that damages all enemies in range and heals all allies within its crimson vortex.', cooldown: 20, power: 65, element: 'crimson' },

  // Bone (3)
  { id: 'bone_spear', name: 'Bone Spear', description: 'Conjures a spear of sharpened bone that can be thrown with deadly accuracy. It shatters on impact, sending bone shards everywhere.', cooldown: 8, power: 28, element: 'bone' },
  { id: 'skeleton_army', name: 'Skeleton Army', description: 'Raises a small army of skeleton warriors from the ground. They fight autonomously and crumble to dust when destroyed.', cooldown: 25, power: 70, element: 'bone' },
  { id: 'death_grip', name: 'Death Grip', description: 'The ground opens and skeletal hands reach up to grab and hold targets in place. Escape requires supernatural strength.', cooldown: 15, power: 40, element: 'bone' },

  // Thorn (3)
  { id: 'thorn_whip', name: 'Thorn Whip', description: 'A whip made of living thorned vines extends from the vampire\'s hand. Each thorn carries a blood-draining venom.', cooldown: 7, power: 22, element: 'thorn' },
  { id: 'rose_barrier', name: 'Rose Barrier', description: 'Summons a wall of enchanted thorned roses that damages anyone who tries to pass through. The roses bloom with black petals.', cooldown: 13, power: 38, element: 'thorn' },
  { id: 'thorned_embrace', name: 'Thorned Embrace', description: 'Wraps thorned vines around a target, draining their blood while the thorns inject vampiric venom. Extremely painful.', cooldown: 16, power: 48, element: 'thorn' },

  // Mist (2)
  { id: 'mist_form', name: 'Mist Form', description: 'Transforms the vampire into a cloud of mist that is immune to physical attacks. Can pass through walls and travel at high speed.', cooldown: 20, power: 60, element: 'mist' },
  { id: 'choking_fog', name: 'Choking Fog', description: 'Releases a thick fog of vampiric mist that suffocates non-vampires and obscures all vision. Lasts for several minutes.', cooldown: 15, power: 35, element: 'mist' },

  // Moonlit (2)
  { id: 'moonbeam', name: 'Moonbeam Strike', description: 'Channels focused moonlight into a devastating beam. Ironically, this solar-aligned energy is harmless to vampires but burns mortals.', cooldown: 18, power: 55, element: 'moonlit' },
  { id: 'lunar_eclipse', name: 'Lunar Eclipse', description: 'Creates a temporary zone of total darkness centered on the vampire. All light sources within range are extinguished.', cooldown: 22, power: 70, element: 'moonlit' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: BW_ACHIEVEMENTS — 18 Dark Achievements
// ═══════════════════════════════════════════════════════════════════

export const BW_ACHIEVEMENTS: readonly BWAchievementDef[] = [
  { id: 'ach_first_embrace', name: 'First Embrace', description: 'Embrace your first mortal into vampirism.', condition: 'Embrace 1 vampire', reward: '+100 blood energy' },
  { id: 'ach_bloodline_collector', name: 'Bloodline Collector', description: 'Embrace vampires from at least 5 different bloodlines.', condition: 'Embrace vampires from 5 bloodlines', reward: '+500 gold' },
  { id: 'ach_shadow_master', name: 'Shadow Master', description: 'Use shadow abilities 50 times total.', condition: 'Use 50 shadow abilities', reward: 'Unlock Shadow Step mastery' },
  { id: 'ach_coven_builder', name: 'Coven Builder', description: 'Build 10 coven structures.', condition: 'Build 10 structures', reward: '+20% structure cost reduction' },
  { id: 'ach_essence_hoarder', name: 'Essence Hoarder', description: 'Collect 500 total blood essences.', condition: 'Collect 500 essences', reward: '+200 blood energy' },
  { id: 'ach_ancient_awakener', name: 'Ancient Awakener', description: 'Awaken a vampire to their third awakening tier.', condition: 'Awakening tier 3', reward: '+1000 gold' },
  { id: 'ach_relic_hunter', name: 'Relic Hunter', description: 'Acquire 5 cursed relics.', condition: 'Collect 5 relics', reward: '+30% relic power bonus' },
  { id: 'ach_moonlit_warrior', name: 'Moonlit Warrior', description: 'Win 3 moonlit events in a row.', condition: '3 consecutive event wins', reward: 'Moonlit Beacon upgrade' },
  { id: 'ach_full_bloodline', name: 'Full Bloodline', description: 'Embrace vampires from all 7 bloodlines.', condition: 'All 7 bloodlines represented', reward: '+50% embrace chance bonus' },
  { id: 'ach_rich_coven', name: 'Opulent Coven', description: 'Accumulate 10,000 gold.', condition: 'Reach 10,000 gold', reward: 'Blood Philosopher title' },
  { id: 'ach_dark_ritualist', name: 'Dark Ritualist', description: 'Perform 20 blood rituals successfully.', condition: '20 rituals performed', reward: '+15% ritual efficiency' },
  { id: 'ach_bat_commander', name: 'Bat Commander', description: 'Summon bat swarms 10 times.', condition: '10 bat swarm summons', reward: 'Enhanced bat swarm ability' },
  { id: 'ach_shadow_cloak_master', name: 'Shadow Cloak Master', description: 'Use Cloak in Shadows 25 times.', condition: '25 cloak activations', reward: 'Permanent stealth bonus' },
  { id: 'ach_legendary_embrace', name: 'Legendary Embrace', description: 'Embrace a legendary-tier vampire.', condition: 'Embrace 1 legendary vampire', reward: '+2000 gold, +500 blood energy' },
  { id: 'ach_coven_lord', name: 'Coven Lord', description: 'Unlock all 8 dark covens.', condition: 'Unlock all covens', reward: 'Lord title, +100% blood energy regen' },
  { id: 'ach_undying_army', name: 'Undying Army', description: 'Have 20 or more embraced vampires simultaneously.', condition: '20 active vampires', reward: '+25% army power' },
  { id: 'ach_ancient_awakening', name: 'Ancient Awakening', description: 'Fully awaken a vampire to tier 5.', condition: 'Tier 5 awakening', reward: 'Ancient One title' },
  { id: 'ach_blood_emperor', name: 'Blood Emperor', description: 'Reach the maximum coven level of 50.', condition: 'Coven level 50', reward: 'Blood Emperor title, eternal prestige' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: BW_TITLES — 8 Dark Titles
// ═══════════════════════════════════════════════════════════════════

export const BW_TITLES: readonly BWTitleDef[] = [
  { id: 'title_fledgling', name: 'Fledgling', description: 'A newly turned vampire, still adjusting to the hunger and the darkness. The night is vast and terrifying.', requiredLevel: 1, requiredCovens: 0 },
  { id: 'title_neonate', name: 'Neonate', description: 'A young vampire who has survived their first year of undeath. The hunger has become manageable.', requiredLevel: 5, requiredCovens: 1 },
  { id: 'title_thrall', name: 'Dark Thrall', description: 'A vampire who has proven their loyalty to a coven. They are granted access to deeper secrets of blood magic.', requiredLevel: 10, requiredCovens: 2 },
  { id: 'title_knight', name: 'Night Knight', description: 'A warrior of the night who has mastered basic combat and blood abilities. Respected by fledglings and feared by mortals.', requiredLevel: 18, requiredCovens: 3 },
  { id: 'title_lord', name: 'Coven Lord', description: 'A vampire of considerable power who rules over their own coven. They command lesser vampires with absolute authority.', requiredLevel: 28, requiredCovens: 4 },
  { id: 'title_count', name: 'Dark Count', description: 'An aristocrat of the vampire world, commanding respect from even ancient bloodlines. Their word is law in their domain.', requiredLevel: 36, requiredCovens: 5 },
  { id: 'title_ancient', name: 'Ancient One', description: 'A vampire who has walked the earth for centuries. Their power is legendary and their knowledge of the dark arts is unmatched.', requiredLevel: 44, requiredCovens: 7 },
  { id: 'title_emperor', name: 'Blood Emperor / Blood Empress', description: 'The supreme ruler of all vampire covens. Their power rivals the original blood ancestors. All vampires bow before them.', requiredLevel: 50, requiredCovens: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: BW_RELICS — 15 Cursed Relics
// ═══════════════════════════════════════════════════════════════════

export const BW_RELICS: readonly BWRelicDef[] = [
  // Common (3)
  { id: 'relic_bat_fang_amulet', name: 'Bat Fang Amulet', description: 'An amulet strung with vampire bat fangs. It enhances the wearer\'s hearing and grants echolocation in total darkness.', rarity: 'common', powerBonus: 5, specialAbility: 'Echolocation' },
  { id: 'relic_shadow_cloak_scrap', name: 'Shadow Cloak Scrap', description: 'A torn piece of fabric from a vampire\'s shadow cloak. When worn, it makes the user slightly harder to see in dim light.', rarity: 'common', powerBonus: 8, specialAbility: 'Minor Invisibility' },
  { id: 'relic_bone_charm', name: 'Bone Charm', description: 'A charm carved from the finger bone of a Strigoi. It rattles when danger is near, serving as a supernatural early warning system.', rarity: 'common', powerBonus: 6, specialAbility: 'Danger Sense' },

  // Uncommon (3)
  { id: 'relic_draculas_locket', name: 'Dracula\'s Locket', description: 'A golden locket said to contain a portrait of Count Dracula\'s beloved. It grants enhanced charm abilities to the wearer.', rarity: 'uncommon', powerBonus: 15, specialAbility: 'Enhanced Charm' },
  { id: 'relic_carmillas_glove', name: 'Carmilla\'s Glove', description: 'A lace glove once worn by the original Carmilla. It allows the wearer to dissolve one hand into mist at will.', rarity: 'uncommon', powerBonus: 18, specialAbility: 'Mist Hand' },
  { id: 'relic_liliths_thorn', name: 'Lilith\'s Thorn', description: 'A single thorn from the original roses in Lilith\'s garden. It never wilts and cuts through any material with ease.', rarity: 'uncommon', powerBonus: 20, specialAbility: 'Material Cut' },

  // Rare (3)
  { id: 'relic_strigoi_crown', name: 'Strigoi Death Crown', description: 'A crown of black iron forged from the bones of a Strigoi Warlord. It grants command over minor undead creatures.', rarity: 'rare', powerBonus: 40, specialAbility: 'Undead Command' },
  { id: 'relic_asanbosam_hook', name: 'Asanbosam Iron Hook', description: 'A fully intact iron hook removed from an Asanbosam vampire. It grafts onto the user\'s arm, granting tremendous climbing and slashing power.', rarity: 'rare', powerBonus: 45, specialAbility: 'Iron Arm' },
  { id: 'relic_blood_mirror', name: 'Blood Mirror', description: 'A mirror whose surface is liquid blood. It shows the true nature of anyone who gazes into it and can reveal hidden vampires.', rarity: 'rare', powerBonus: 35, specialAbility: 'True Sight' },

  // Epic (3)
  { id: 'relic_nosferatu_mask', name: 'Nosferatu Void Mask', description: 'A mask that covers the entire face, projecting the wearer into the space between dimensions. While worn, the user exists partially outside reality.', rarity: 'epic', powerBonus: 80, specialAbility: 'Dimensional Phase' },
  { id: 'relic_chupacabra_spine', name: 'Chupacabra Spine Ridge', description: 'The完整 spine ridge of a legendary Chupacabra. When attached to the back, it grants rapid movement and a paralytic aura.', rarity: 'epic', powerBonus: 85, specialAbility: 'Paralytic Aura' },
  { id: 'relic_moonlight_scepter', name: 'Moonlight Scepter', description: 'A scepter that focuses moonlight into a devastating weapon. Its beam is harmless to vampires but burns mortals and undead alike.', rarity: 'epic', powerBonus: 75, specialAbility: 'Moonbeam Focus' },

  // Legendary (3)
  { id: 'relic_draculas_cape', name: 'Dracula\'s Original Cape', description: 'The cape worn by Vlad Tepes during his mortal life and carried into undeath. It grants the power of bat transformation and commands all lesser vampires.', rarity: 'legendary', powerBonus: 150, specialAbility: 'Bat Lord' },
  { id: 'relic_liliths_chalice', name: 'Lilith\'s Chalice', description: 'The chalice from which Lilith first drank the blood that made her the mother of all vampires. Any blood drunk from it grants temporary godlike power.', rarity: 'legendary', powerBonus: 200, specialAbility: 'Godlike Power' },
  { id: 'relic_blood_moon_orb', name: 'Blood Moon Orb', description: 'An orb that contains a captured blood moon. When activated, it creates a permanent eclipse in a wide radius, giving vampires maximum power.', rarity: 'legendary', powerBonus: 180, specialAbility: 'Eclipse Command' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: BW_MOON_EVENTS — 12 Moonlit Events
// ═══════════════════════════════════════════════════════════════════

export const BW_MOON_EVENTS: readonly BWMoonEventDef[] = [
  { id: 'event_blood_moon_rise', name: 'Blood Moon Rise', description: 'The moon turns crimson, amplifying all vampiric abilities by 50%. Mortals lock their doors as primal fear sweeps the land.', severity: 2, duration: 300, effects: ['+50% vampiric power', 'Mortals hide indoors', 'Enhanced blood drain'] },
  { id: 'event_hunter_inquisition', name: 'Hunter Inquisition', description: 'A coordinated vampire hunter patrol sweeps through the area. All vampires must hide or fight. Detection means certain death for the unprepared.', severity: 5, duration: 180, effects: ['Hunter patrols active', '-30% stealth', 'Risk of discovery', 'Reward for survival'] },
  { id: 'event_shadow_convergence', name: 'Shadow Convergence', description: 'All shadows in the area merge into a single massive darkness. Shadow-aligned vampires gain tremendous power, but other bloodlines are weakened.', severity: 3, duration: 240, effects: ['+40% shadow power', '-20% other elements', 'Shadow creatures emerge'] },
  { id: 'event_lunar_eclipse', name: 'Total Lunar Eclipse', description: 'The moon is swallowed by shadow, creating a window of perfect darkness. All vampire abilities reach peak effectiveness. Rare materials become collectible.', severity: 2, duration: 120, effects: ['+30% all abilities', 'Rare essence spawn', 'Enhanced ritual power'] },
  { id: 'event_mortal_feast', name: 'Mortal Festival', description: 'Mortals hold a nighttime festival nearby, creating abundant feeding opportunities. Careful hunting can go unnoticed among the revelry.', severity: 1, duration: 360, effects: ['Abundant feeding', '+20% blood energy gain', 'Low detection risk'] },
  { id: 'event_ancient_awakening', name: 'Ancient Awakening', description: 'An ancient vampire stirs in a nearby tomb, sending shockwaves through the local bloodline network. The awakened one may be ally or enemy.', severity: 4, duration: 200, effects: ['Ancient vampire spawns', 'Bloodline resonance', 'Power surge or threat'] },
  { id: 'event_sunlight_leak', name: 'Sunlight Leak', description: 'A crack in the coven\'s defenses allows sunlight to penetrate. All vampires suffer damage and must seal the breach immediately.', severity: 5, duration: 90, effects: ['Sunlight damage', '-50% vampire power', 'Urgent repair needed', 'Corruption +10'] },
  { id: 'event_blood_rain', name: 'Blood Rain', description: 'It rains blood from the sky — a phenomenon caused by concentrated blood magic in the atmosphere. All vampires gain energy from exposure.', severity: 2, duration: 180, effects: ['+30% blood energy regen', 'Essence material bonus', 'Mortal panic'] },
  { id: 'event_ghost_procession', name: 'Ghost Procession', description: 'The spirits of the vampire\'s past victims march through the coven. Ignoring them brings corruption. Acknowledging them brings wisdom.', severity: 3, duration: 150, effects: ['Spirit interaction', 'Potential corruption', 'Wisdom reward', 'Relic discovery chance'] },
  { id: 'event_werewolf_hunt', name: 'Werewolf Hunt', description: 'Werewolves, ancient enemies of vampires, launch a coordinated attack under the full moon. All vampires must defend the coven or flee.', severity: 6, duration: 240, effects: ['Werewolf attack', 'Combat challenge', 'Lycanthrope essence drop', 'Defense test'] },
  { id: 'event_coven_gathering', name: 'Grand Coven Gathering', description: 'Vampires from across the region converge for a grand meeting. Trade, alliances, and rivalries form. A rare opportunity for diplomacy.', severity: 1, duration: 300, effects: ['Trading available', 'Alliance opportunities', 'Gold bonus', 'Reputation gain'] },
  { id: 'event_void_tear', name: 'Void Tear', description: 'A tear opens between dimensions, releasing void energy and otherworldly creatures. Nosferatu vampires are drawn to it like moths to flame.', severity: 7, duration: 120, effects: ['Dimensional instability', 'Nosferatu power surge', 'Rare materials', 'Extreme danger'] },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: BLOODLINE RITES & DARK CALCULATIONS
// ═══════════════════════════════════════════════════════════════════

const BW_BLOODLINE_RITES: Record<BWBloodline, { riteName: string; riteCost: number; riteBonus: string; riteDescription: string }> = {
  Dracula: {
    riteName: 'Transylvanian Pact',
    riteCost: 200,
    riteBonus: '+10% Dracula embrace chance',
    riteDescription:
      'A pact sworn in the shadow of Castle Dracula, binding the coven to the original vampire\'s will. Performing this rite strengthens all Dracula-blood vampires in the coven.',
  },
  Carmilla: {
    riteName: 'Velvet Midnight Oath',
    riteCost: 180,
    riteBonus: '+8% Carmilla charm power',
    riteDescription:
      'An oath taken under the light of a crimson moon, wearing garments of black velvet. It enhances the seductive powers of all Carmilla-blood vampires.',
  },
  Lilith: {
    riteName: 'Demon Mother\'s Communion',
    riteCost: 250,
    riteBonus: '+12% Lilith dark magic',
    riteDescription:
      'A communion with Lilith\'s ancient spirit that channels her primal power through the coven. Dark magic abilities become significantly more potent.',
  },
  Strigoi: {
    riteName: 'Bone Feast Ritual',
    riteCost: 150,
    riteBonus: '+15% Strigoi necromancy',
    riteDescription:
      'A ritual involving the consumption of ancient bone marrow around a bonfire of coffin wood. It strengthens the bond between the living and the undead.',
  },
  Asanbosam: {
    riteName: 'Iron Binding Ceremony',
    riteCost: 220,
    riteBonus: '+10% Asanbosam iron power',
    riteDescription:
      'A ceremony where iron hooks are driven into a sacred tree, binding the coven to the Asanbosam\'s forest spirits. Physical strength is greatly enhanced.',
  },
  Chupacabra: {
    riteName: 'Predator\'s Blood Hunt',
    riteCost: 160,
    riteBonus: '+12% Chupacabra speed',
    riteDescription:
      'A ritual hunt where the coven hunts as a pack under the full moon. The shared kill strengthens the pack bond and enhances predatory speed.',
  },
  Nosferatu: {
    riteName: 'Void Meditation',
    riteCost: 200,
    riteBonus: '+10% Nosferatu shadow power',
    riteDescription:
      'Deep meditation in total darkness, reaching into the void between dimensions. It strengthens the shadow powers of all Nosferatu-blood vampires.',
  },
}

function bwGetBloodlineRite(bloodline: BWBloodline): { riteName: string; riteCost: number; riteBonus: string; riteDescription: string } {
  return BW_BLOODLINE_RITES[bloodline]
}

function bwCalculateRitualPower(level: number, structureCount: number, relicCount: number, activeEventSeverity: number): number {
  const basePower = level * 2
  const structureMod = 1 + structureCount * 0.05
  const relicMod = 1 + relicCount * 0.1
  const eventMod = 1 + activeEventSeverity * 0.08
  return Math.floor(basePower * structureMod * relicMod * eventMod)
}

function bwCalculateEmbraceSuccess(rarity: BWRarity, covenLevel: number, activeCovenId: string | null): number {
  const baseChance = bwGetEmbraceChance(rarity, activeCovenId)
  const levelBonus = Math.floor(covenLevel * 0.5)
  const totalChance = baseChance + levelBonus
  return Math.min(99, totalChance)
}

function bwCalculateCorruptionRisk(ritualCount: number, covenLevel: number, structureCount: number): number {
  const baseRisk = ritualCount * 0.5
  const mitigationCoven = covenLevel * 0.3
  const mitigationStructures = structureCount * 0.8
  const netRisk = baseRisk - mitigationCoven - mitigationStructures
  return Math.max(0, Math.min(100, Math.floor(netRisk)))
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE — useBWStore
// ═══════════════════════════════════════════════════════════════════

function bwGetAwakeningTier(awakeningCount: number): string {
  if (awakeningCount >= 5) return 'Transcendent'
  if (awakeningCount >= 4) return 'Mythic'
  if (awakeningCount >= 3) return 'Ancient'
  if (awakeningCount >= 2) return 'Elder'
  if (awakeningCount >= 1) return 'Awakened'
  return 'Dormant'
}

const useBWStore = create<BWFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      embracedVampires: [] as BWEmbracedVampire[],
      collectedEssences: {} as Record<string, number>,
      structures: [] as BWOwnedStructure[],
      achievements: [] as string[],
      currentTitle: 'title_fledgling',
      collectedRelics: [] as string[],
      unlockedCovens: ['crypt_of_shadows'] as string[],
      covenLevel: 1,
      covenExp: 0,
      gold: BW_INITIAL_GOLD,
      bloodEnergy: BW_INITIAL_ENERGY,
      totalEmbraced: 0,
      totalCollected: 0,
      totalUpgraded: 0,
      totalAwakened: 0,
      totalRituals: 0,
      activeEventId: null as string | null,
      eventTimer: 0,
      covenSanctuary: {
        bloodPool: 100,
        maxBloodPool: 100,
        corruption: 0,
        lastFedAt: null,
      } as BWCovenState,
      activeCovenId: 'crypt_of_shadows' as string | null,

      // ── bwEmbraceMortal ────────────────────────────────────────
      bwEmbraceMortal: (vampireId: string): boolean => {
        const state = get()
        const vampireDef = BW_VAMPIRES.find((v) => v.id === vampireId)
        if (!vampireDef) return false
        if (state.covenLevel < (BW_COVENS.find((c) => c.id === state.activeCovenId)?.minLevel ?? 1)) return false

        const embraceCost = Math.floor(10 * bwRarityMultiplier(vampireDef.rarity))
        if (state.bloodEnergy < embraceCost) return false
        if (state.embracedVampires.some((v) => v.vampireDefId === vampireId)) return false

        const newXp = state.covenExp + vampireDef.basePower
        const newLevel = bwLevelFromXp(newXp)

        set((prev) => ({
          embracedVampires: [
            ...prev.embracedVampires,
            {
              id: bwGenerateId(),
              vampireDefId: vampireId,
              name: vampireDef.name,
              level: 1,
              currentHP: vampireDef.basePower * 10,
              maxHP: vampireDef.basePower * 10,
              power: vampireDef.basePower,
              awakened: false,
              awakeningCount: 0,
              acquiredAt: Date.now(),
            },
          ],
          bloodEnergy: Math.max(0, prev.bloodEnergy - embraceCost),
          covenExp: newXp,
          covenLevel: newLevel,
          gold: prev.gold + Math.floor(vampireDef.basePower * 0.5),
          totalEmbraced: prev.totalEmbraced + 1,
        }))
        return true
      },

      // ── bwCollectEssence ───────────────────────────────────────
      bwCollectEssence: (essenceId: string): number => {
        const state = get()
        const essence = BW_ESSENCES.find((e) => e.id === essenceId)
        if (!essence) return 0
        if (state.bloodEnergy < 3) return 0

        const quantity = essence.rarity === 'common' ? 3 : essence.rarity === 'uncommon' ? 2 : 1
        set((prev) => ({
          collectedEssences: {
            ...prev.collectedEssences,
            [essenceId]: (prev.collectedEssences[essenceId] || 0) + quantity,
          },
          bloodEnergy: Math.max(0, prev.bloodEnergy - 3),
          totalCollected: prev.totalCollected + quantity,
          gold: prev.gold + essence.value * quantity,
        }))
        return quantity
      },

      // ── bwUpgradeCoven ─────────────────────────────────────────
      bwUpgradeCoven: (structureId: string): boolean => {
        const state = get()
        const structDef = BW_STRUCTURES.find((s) => s.id === structureId)
        if (!structDef) return false

        const owned = state.structures.find((s) => s.structureDefId === structureId)
        if (!owned) {
          if (state.gold < structDef.baseCost) return false
          const newXp = state.covenExp + 20
          const newLevel = bwLevelFromXp(newXp)
          set((prev) => ({
            structures: [
              ...prev.structures,
              {
                id: bwGenerateId(),
                structureDefId: structureId,
                level: 1,
                built: true,
              },
            ],
            gold: prev.gold - structDef.baseCost,
            covenExp: newXp,
            covenLevel: newLevel,
            totalUpgraded: prev.totalUpgraded + 1,
          }))
          return true
        }

        if (owned.level >= 10) return false
        const upgradeCost = Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, owned.level))
        if (state.gold < upgradeCost) return false

        const newXp = state.covenExp + 25
        const newLevel = bwLevelFromXp(newXp)
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === owned.id ? { ...s, level: s.level + 1 } : s
          ),
          gold: prev.gold - upgradeCost,
          covenExp: newXp,
          covenLevel: newLevel,
          totalUpgraded: prev.totalUpgraded + 1,
        }))
        return true
      },

      // ── bwUseAbility ───────────────────────────────────────────
      bwUseAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = BW_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (state.bloodEnergy < ability.cooldown) return false

        set((prev) => ({
          bloodEnergy: Math.max(0, prev.bloodEnergy - ability.cooldown),
        }))
        return true
      },

      // ── bwTriggerMoonEvent ─────────────────────────────────────
      bwTriggerMoonEvent: (eventId: string): boolean => {
        const state = get()
        const event = BW_MOON_EVENTS.find((e) => e.id === eventId)
        if (!event) return false
        if (state.activeEventId !== null) return false

        set((prev) => ({
          activeEventId: eventId,
          eventTimer: event.duration,
          covenSanctuary: {
            ...prev.covenSanctuary,
            corruption: event.severity >= 4
              ? Math.min(100, prev.covenSanctuary.corruption + event.severity * 5)
              : prev.covenSanctuary.corruption,
            bloodPool: event.severity >= 3
              ? Math.max(0, prev.covenSanctuary.bloodPool - event.severity * 3)
              : prev.covenSanctuary.bloodPool,
          },
        }))
        return true
      },

      // ── bwAcquireRelic ─────────────────────────────────────────
      bwAcquireRelic: (relicId: string): boolean => {
        const state = get()
        const relic = BW_RELICS.find((r) => r.id === relicId)
        if (!relic) return false
        if (state.collectedRelics.includes(relicId)) return false

        const relicCost = Math.floor(20 * bwRarityMultiplier(relic.rarity))
        if (state.gold < relicCost) return false

        const newXp = state.covenExp + relic.powerBonus
        const newLevel = bwLevelFromXp(newXp)
        set((prev) => ({
          collectedRelics: [...prev.collectedRelics, relicId],
          gold: prev.gold - relicCost,
          covenExp: newXp,
          covenLevel: newLevel,
        }))
        return true
      },

      // ── bwPerformRitual ────────────────────────────────────────
      bwPerformRitual: (targetId: string): boolean => {
        const state = get()
        if (state.bloodEnergy < 100) return false

        let xpGain = 50
        let goldGain = 500
        let essenceBonus = 0

        const vampire = state.embracedVampires.find((v) => v.id === targetId)
        if (vampire) {
          xpGain = 100
          goldGain = 1000
          set((prev) => ({
            embracedVampires: prev.embracedVampires.map((v) =>
              v.id === targetId
                ? {
                    ...v,
                    power: Math.floor(v.power * 1.5),
                    maxHP: Math.floor(v.maxHP * 1.3),
                    currentHP: Math.floor(v.maxHP * 1.3),
                  }
                : v
            ),
          }))
        }

        const essence = BW_ESSENCES.find((e) => e.id === targetId)
        if (essence) {
          essenceBonus = 5
        }

        const newXp = state.covenExp + xpGain
        const newLevel = bwLevelFromXp(newXp)
        set((prev) => {
          const updatedEssences = { ...prev.collectedEssences }
          if (essenceBonus > 0 && essence) {
            updatedEssences[targetId] = (updatedEssences[targetId] || 0) + essenceBonus
          }
          return {
            bloodEnergy: Math.max(0, prev.bloodEnergy - 100),
            gold: prev.gold + goldGain,
            covenExp: newXp,
            covenLevel: newLevel,
            collectedEssences: updatedEssences,
            totalRituals: prev.totalRituals + 1,
            covenSanctuary: {
              ...prev.covenSanctuary,
              corruption: Math.max(0, prev.covenSanctuary.corruption - 20),
              bloodPool: Math.min(prev.covenSanctuary.maxBloodPool, prev.covenSanctuary.bloodPool + 30),
            },
          }
        })
        return true
      },

      // ── bwSummonBatSwarm ───────────────────────────────────────
      bwSummonBatSwarm: (): boolean => {
        const state = get()
        if (state.bloodEnergy < 25) return false

        set((prev) => ({
          bloodEnergy: Math.max(0, prev.bloodEnergy - 25),
          covenSanctuary: {
            ...prev.covenSanctuary,
            bloodPool: Math.min(
              prev.covenSanctuary.maxBloodPool,
              prev.covenSanctuary.bloodPool + 10
            ),
          },
        }))
        return true
      },

      // ── bwCloakInShadows ───────────────────────────────────────
      bwCloakInShadows: (): boolean => {
        const state = get()
        if (state.bloodEnergy < 15) return false

        set((prev) => ({
          bloodEnergy: Math.max(0, prev.bloodEnergy - 15),
        }))
        return true
      },

      // ── bwAwakenAncient ────────────────────────────────────────
      bwAwakenAncient: (instanceId: string): boolean => {
        const state = get()
        const vampire = state.embracedVampires.find((v) => v.id === instanceId)
        if (!vampire) return false
        if (vampire.awakeningCount >= 5) return false

        const awakeningCost = Math.floor(50 * Math.pow(2, vampire.awakeningCount))
        if (state.bloodEnergy < awakeningCost) return false
        if (state.gold < awakeningCost * 2) return false

        const newXp = state.covenExp + 30
        const newLevel = bwLevelFromXp(newXp)
        set((prev) => ({
          embracedVampires: prev.embracedVampires.map((v) =>
            v.id === instanceId
              ? {
                  ...v,
                  level: v.level + 1,
                  power: Math.floor(v.power * 1.3),
                  maxHP: Math.floor(v.maxHP * 1.2),
                  currentHP: Math.floor(v.maxHP * 1.2),
                  awakened: true,
                  awakeningCount: v.awakeningCount + 1,
                }
              : v
          ),
          bloodEnergy: Math.max(0, prev.bloodEnergy - awakeningCost),
          gold: prev.gold - awakeningCost * 2,
          covenExp: newXp,
          covenLevel: newLevel,
          totalAwakened: prev.totalAwakened + 1,
        }))
        return true
      },
    }),
    {
      name: 'blood-wych-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HOOK — useBloodWych
// ═══════════════════════════════════════════════════════════════════

export default function useBloodWych() {
  const store = useBWStore()

  // ── Getter: Coven Details ─────────────────────────────────────
  const bwGetCovenDetails = useMemo(() => {
    if (!store.activeCovenId) return null
    const coven = BW_COVENS.find((c) => c.id === store.activeCovenId)
    if (!coven) return null
    const bonusBloodlines = BW_COVEN_BLOODLINE_BONUS[store.activeCovenId] || []
    return { ...coven, bonusBloodlines, isActive: true }
  }, [store.activeCovenId])

  // ── Getter: Essence Inventory ─────────────────────────────────
  const bwGetEssenceInventory = useMemo(() => {
    const inventory: { essence: BWEssenceDef; quantity: number; totalValue: number }[] = []
    for (const [essenceId, quantity] of Object.entries(store.collectedEssences)) {
      const essence = BW_ESSENCES.find((e) => e.id === essenceId)
      if (essence && quantity > 0) {
        inventory.push({ essence, quantity, totalValue: essence.value * quantity })
      }
    }
    inventory.sort((a, b) => b.totalValue - a.totalValue)
    return inventory
  }, [store.collectedEssences])

  // ── Getter: Embraced Vampires ─────────────────────────────────
  const bwGetEmbracedVampires = useMemo(() => {
    return store.embracedVampires.map((v) => {
      const def = BW_VAMPIRES.find((d) => d.id === v.vampireDefId)
      return {
        ...v,
        def,
        bloodlineColor: def ? bwBloodlineColor(def.bloodline) : BW_COLOR_SHADOW_GRAY,
        rarityColor: def ? bwRarityColor(def.rarity) : '#9CA3AF',
        awakeningTier: bwGetAwakeningTier(v.awakeningCount),
      }
    })
  }, [store.embracedVampires])

  // ── Getter: Structure List ────────────────────────────────────
  const bwGetStructureList = useMemo(() => {
    return store.structures.map((s) => {
      const def = BW_STRUCTURES.find((d) => d.id === s.structureDefId)
      if (!def) return { ...s, def: null, nextCost: 0, maxed: s.level >= 10 }
      const nextCost = s.level >= 10 ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level))
      return { ...s, def, nextCost, maxed: s.level >= 10 }
    })
  }, [store.structures])

  // ── Getter: Total Power ───────────────────────────────────────
  const bwGetTotalPower = useMemo(() => {
    let total = 0
    for (const v of store.embracedVampires) {
      total += v.power
    }
    for (const rId of store.collectedRelics) {
      const relic = BW_RELICS.find((r) => r.id === rId)
      if (relic) {
        total += relic.powerBonus
      }
    }
    total += store.structures.reduce((sum, s) => {
      return sum + bwGetStructureBonus(s.structureDefId, s.level)
    }, 0)
    return total
  }, [store])

  // ── Getter: Event Status ──────────────────────────────────────
  const bwGetEventStatus = useMemo(() => {
    return {
      hasActiveEvent: store.activeEventId !== null,
      activeEventId: store.activeEventId,
      eventTimer: store.eventTimer,
    }
  }, [store.activeEventId, store.eventTimer])

  // ── Getter: Active Event ──────────────────────────────────────
  const bwGetActiveEvent = useMemo(() => {
    if (!store.activeEventId) return null
    return BW_MOON_EVENTS.find((e) => e.id === store.activeEventId) || null
  }, [store.activeEventId])

  // ── Getter: Next Title ────────────────────────────────────────
  const bwGetNextTitle = useMemo(() => {
    const nextTitle = BW_TITLES.find(
      (t) => t.requiredLevel > store.covenLevel || t.requiredCovens > store.unlockedCovens.length
    )
    if (!nextTitle) return null
    return {
      ...nextTitle,
      levelGap: Math.max(0, nextTitle.requiredLevel - store.covenLevel),
      covenGap: Math.max(0, nextTitle.requiredCovens - store.unlockedCovens.length),
    }
  }, [store.covenLevel, store.unlockedCovens])

  // ── Getter: Rarity Summary ────────────────────────────────────
  const bwGetRaritySummary = useMemo(() => {
    const summary: Record<BWRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 }
    for (const v of store.embracedVampires) {
      const def = BW_VAMPIRES.find((d) => d.id === v.vampireDefId)
      if (def) {
        summary[def.rarity] += 1
      }
    }
    for (const rId of store.collectedRelics) {
      const relic = BW_RELICS.find((r) => r.id === rId)
      if (relic) {
        summary[relic.rarity] += 1
      }
    }
    return summary
  }, [store])

  // ── Getter: Coven Summary ─────────────────────────────────────
  const bwGetCovenSummary = useMemo(() => {
    const totalCovens = BW_COVENS.length
    const unlocked = store.unlockedCovens.length
    return {
      totalCovens,
      unlocked,
      percent: Math.floor((unlocked / totalCovens) * 100),
      allUnlocked: unlocked >= totalCovens,
    }
  }, [store.unlockedCovens])

  // ── Getter: Unlocked Achievements ─────────────────────────────
  const bwGetUnlockedAchievements = useMemo(() => {
    const unlocked: BWAchievementDef[] = []
    for (const ach of BW_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlocked.push(ach)
      }
    }
    return { unlocked, total: BW_ACHIEVEMENTS.length, progress: unlocked.length }
  }, [store])

  // ── Getter: Title Progress ────────────────────────────────────
  const bwGetTitleProgress = useMemo(() => {
    return BW_TITLES.map((title) => ({
      ...title,
      unlocked:
        store.covenLevel >= title.requiredLevel &&
        store.unlockedCovens.length >= title.requiredCovens,
      active: store.currentTitle === title.id,
      levelMet: store.covenLevel >= title.requiredLevel,
      covenMet: store.unlockedCovens.length >= title.requiredCovens,
    }))
  }, [store.currentTitle, store.covenLevel, store.unlockedCovens])

  // ── Getter: Collected Relics Detail ───────────────────────────
  const bwGetCollectedRelics = useMemo(() => {
    return BW_RELICS.map((relic) => ({
      ...relic,
      collected: store.collectedRelics.includes(relic.id),
      rarityColor: bwRarityColor(relic.rarity),
      canAfford:
        store.gold >= Math.floor(20 * bwRarityMultiplier(relic.rarity)) &&
        !store.collectedRelics.includes(relic.id),
    }))
  }, [store])

  // ── Getter: Coven Sanctuary Health ────────────────────────────
  const { bwGetCovenHealth, bwGetBloodEnergyEfficiency } = useMemo(() => {
    const { bloodPool, maxBloodPool, corruption, lastFedAt } = store.covenSanctuary
    const covenHealth = {
      bloodPool,
      maxBloodPool,
      corruption,
      bloodPoolPercent: Math.floor((bloodPool / maxBloodPool) * 100),
      isCorrupted: corruption > 0,
      isCritical: bloodPool < maxBloodPool * 0.25,
      lastFedAt,
    }

    const structureBonus = store.structures.reduce((sum, s) => {
      return sum + bwGetStructureBonus(s.structureDefId, s.level)
    }, 0)
    const relicBonus = store.collectedRelics.reduce((sum, rId) => {
      const relic = BW_RELICS.find((r) => r.id === rId)
      return sum + (relic ? Math.floor(relic.powerBonus * 0.2) : 0)
    }, 0)
    const bloodEnergyEfficiency = {
      baseRegen: 1,
      structureBonus,
      relicBonus,
      totalRegen: 1 + structureBonus + relicBonus,
    }

    return { bwGetCovenHealth: covenHealth, bwGetBloodEnergyEfficiency: bloodEnergyEfficiency }
  }, [store])

  // ── Getter: Embracing Costs ───────────────────────────────────
  const bwGetEmbracingCosts = useMemo(() => {
    return BW_VAMPIRES.filter(
      (v) => !store.embracedVampires.some((s) => s.vampireDefId === v.id)
    ).map((vampire) => ({
      ...vampire,
      embraceCost: Math.floor(10 * bwRarityMultiplier(vampire.rarity)),
      canAfford:
        store.bloodEnergy >= Math.floor(10 * bwRarityMultiplier(vampire.rarity)),
      bloodlineColor: bwBloodlineColor(vampire.bloodline),
      rarityColor: bwRarityColor(vampire.rarity),
    }))
  }, [store])

  // ── Level Progress ────────────────────────────────────────────
  const bwLevelProgress = useMemo(() => {
    const current = bwXpForLevel(store.covenLevel)
    return {
      level: store.covenLevel,
      currentXp: store.covenExp,
      xpToNext: current,
      maxLevel: store.covenLevel >= BW_MAX_LEVEL,
      progressPercent:
        current > 0 ? Math.min(100, Math.floor((store.covenExp / current) * 100)) : 0,
    }
  }, [store.covenLevel, store.covenExp])

  // ── Getter: Ability List ──────────────────────────────────────
  const bwGetAbilityList = useMemo(() => {
    return BW_ABILITIES.map((ability) => ({
      ...ability,
      canUse: store.bloodEnergy >= ability.cooldown,
      elementColor: bwElementColor(ability.element),
    }))
  }, [store.bloodEnergy])

  // ── Getter: Event List ────────────────────────────────────────
  const bwGetEventList = useMemo(() => {
    return BW_MOON_EVENTS.map((event) => ({
      ...event,
      canTrigger: store.activeEventId === null,
      isActive: store.activeEventId === event.id,
    }))
  }, [store.activeEventId])

  // ── Getter: Stats Summary ─────────────────────────────────────
  const { bwGetStatsSummary, bwGetVampireCountByBloodline } = useMemo(() => {
    const vampireCountByBloodline: Record<BWBloodline, number> = {
      Dracula: 0,
      Carmilla: 0,
      Lilith: 0,
      Strigoi: 0,
      Asanbosam: 0,
      Chupacabra: 0,
      Nosferatu: 0,
    }
    for (const v of store.embracedVampires) {
      const def = BW_VAMPIRES.find((d) => d.id === v.vampireDefId)
      if (def) {
        vampireCountByBloodline[def.bloodline] += 1
      }
    }

    const statsSummary = {
      totalVampires: store.embracedVampires.length,
      totalEssences: Object.values(store.collectedEssences).reduce((s, v) => s + v, 0),
      totalStructures: store.structures.length,
      totalRelics: store.collectedRelics.length,
      totalCovens: store.unlockedCovens.length,
      avgVampireLevel:
        store.embracedVampires.length > 0
          ? Math.floor(
              store.embracedVampires.reduce((s, v) => s + v.level, 0) / store.embracedVampires.length
            )
          : 0,
      totalAwakenings: store.embracedVampires.reduce((s, v) => s + v.awakeningCount, 0),
    }

    return { bwGetStatsSummary: statsSummary, bwGetVampireCountByBloodline: vampireCountByBloodline }
  }, [store])

  // ── Getter: Upgrade Costs ─────────────────────────────────────
  const bwGetUpgradeCosts = useMemo(() => {
    return store.structures.map((s) => {
      const def = BW_STRUCTURES.find((d) => d.id === s.structureDefId)
      if (!def) return { ...s, nextCost: 0, maxed: s.level >= 10 }
      const nextCost = s.level >= 10 ? 0 : Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level))
      return { ...s, def, nextCost, maxed: s.level >= 10 }
    })
  }, [store.structures])

  // ── Getter: Relic Bonus ───────────────────────────────────────
  const bwGetRelicBonus = useMemo(() => {
    let totalPowerBonus = 0
    for (const rId of store.collectedRelics) {
      const relic = BW_RELICS.find((r) => r.id === rId)
      if (relic) {
        totalPowerBonus += relic.powerBonus
      }
    }
    return {
      totalPowerBonus,
      relicCount: store.collectedRelics.length,
      hasLegendaryRelic: store.collectedRelics.some((rId) => {
        const relic = BW_RELICS.find((r) => r.id === rId)
        return relic && relic.rarity === 'legendary'
      }),
    }
  }, [store.collectedRelics])

  // ── Getter: Awakening Tier Details ────────────────────────────
  const bwGetAwakeningTierDetails = useMemo(() => {
    return store.embracedVampires.map((v) => {
      const def = BW_VAMPIRES.find((d) => d.id === v.vampireDefId)
      const awakeningTier = bwGetAwakeningTier(v.awakeningCount)
      return {
        ...v,
        def,
        awakeningTier,
        nextTier: v.awakeningCount < 5 ? bwGetAwakeningTier(v.awakeningCount + 1) : null,
        canAwaken: v.awakeningCount < 5,
        awakeningCost: Math.floor(50 * Math.pow(2, v.awakeningCount)),
        awakeningGoldCost: Math.floor(50 * Math.pow(2, v.awakeningCount)) * 2,
      }
    })
  }, [store])

  // ── Getter: Coven Essences Available ──────────────────────────
  const bwGetCovenEssences = useMemo(() => {
    if (!store.activeCovenId) return { essences: [], bonusEssences: [] }
    const coven = BW_COVENS.find((c) => c.id === store.activeCovenId)
    if (!coven) return { essences: [], bonusEssences: [] }

    const essences = BW_ESSENCES
      .filter((e) => e.source === store.activeCovenId)

    const bonusEssences = BW_ESSENCES
      .filter((e) => e.source !== store.activeCovenId && e.rarity !== 'common')

    return { essences, bonusEssences }
  }, [store.activeCovenId])

  // ── Getter: Bloodline Embrace Chances ─────────────────────────
  const bwGetBloodlineEmbraceChances = useMemo(() => {
    const chances: Record<BWRarity, number> = {
      common: bwGetEmbraceChance('common', store.activeCovenId),
      uncommon: bwGetEmbraceChance('uncommon', store.activeCovenId),
      rare: bwGetEmbraceChance('rare', store.activeCovenId),
      epic: bwGetEmbraceChance('epic', store.activeCovenId),
      legendary: bwGetEmbraceChance('legendary', store.activeCovenId),
    }
    return chances
  }, [store.activeCovenId])

  // ── Getter: Bloodline Summary ─────────────────────────────────
  const bwGetBloodlineSummary = useMemo(() => {
    return (Object.keys(BW_BLOODLINE_BONUSES) as BWBloodline[]).map((bloodline) => {
      const bonus = BW_BLOODLINE_BONUSES[bloodline]
      const vampires = store.embracedVampires.filter((v) => {
        const def = BW_VAMPIRES.find((d) => d.id === v.vampireDefId)
        return def && def.bloodline === bloodline
      })
      return {
        bloodline,
        color: bwBloodlineColor(bloodline),
        count: vampires.length,
        bonus,
        totalPower: vampires.reduce((s, v) => s + v.power, 0),
      }
    })
  }, [store])

  // ── Getter: Bloodline Rites Available ─────────────────────────
  const bwGetBloodlineRites = useMemo(() => {
    return (Object.keys(BW_BLOODLINE_RITES) as BWBloodline[]).map((bloodline) => {
      const rite = BW_BLOODLINE_RITES[bloodline]
      const hasVampires = store.embracedVampires.some((v) => {
        const def = BW_VAMPIRES.find((d) => d.id === v.vampireDefId)
        return def && def.bloodline === bloodline
      })
      return {
        bloodline,
        ...rite,
        color: bwBloodlineColor(bloodline),
        available: hasVampires,
        canAfford: store.gold >= rite.riteCost && store.bloodEnergy >= 50,
      }
    })
  }, [store])

  // ── Getter: Corruption Risk Assessment ────────────────────────
  const bwGetCorruptionRisk = useMemo(() => {
    const risk = bwCalculateCorruptionRisk(store.totalRituals, store.covenLevel, store.structures.length)
    return {
      currentRisk: risk,
      isSafe: risk < 10,
      isModerate: risk >= 10 && risk < 30,
      isDangerous: risk >= 30 && risk < 60,
      isCritical: risk >= 60,
      corruptionLevel: store.covenSanctuary.corruption,
      ritualsPerformed: store.totalRituals,
      recommendedPurifications: Math.ceil(risk / 20),
    }
  }, [store])

  // ── Getter: Ritual Power Calculation ──────────────────────────
  const { bwGetRitualPower, bwGetEmbraceSuccessRates } = useMemo(() => {
    const activeEvent = store.activeEventId
      ? BW_MOON_EVENTS.find((e) => e.id === store.activeEventId)
      : null
    const eventSeverity = activeEvent ? activeEvent.severity : 0

    const ritualPower = bwCalculateRitualPower(
      store.covenLevel,
      store.structures.length,
      store.collectedRelics.length,
      eventSeverity
    )

    const embraceSuccessRates: Record<BWRarity, number> = {
      common: bwCalculateEmbraceSuccess('common', store.covenLevel, store.activeCovenId),
      uncommon: bwCalculateEmbraceSuccess('uncommon', store.covenLevel, store.activeCovenId),
      rare: bwCalculateEmbraceSuccess('rare', store.covenLevel, store.activeCovenId),
      epic: bwCalculateEmbraceSuccess('epic', store.covenLevel, store.activeCovenId),
      legendary: bwCalculateEmbraceSuccess('legendary', store.covenLevel, store.activeCovenId),
    }

    return { bwGetRitualPower: ritualPower, bwGetEmbraceSuccessRates: embraceSuccessRates }
  }, [store])

  // ── Getter: Coven Power Breakdown ─────────────────────────────
  const bwGetCovenPowerBreakdown = useMemo(() => {
    const vampirePower = store.embracedVampires.reduce((s, v) => s + v.power, 0)
    const relicPower = store.collectedRelics.reduce((s, rId) => {
      const relic = BW_RELICS.find((r) => r.id === rId)
      return s + (relic ? relic.powerBonus : 0)
    }, 0)
    const structurePower = store.structures.reduce((s, st) => {
      return s + bwGetStructureBonus(st.structureDefId, st.level)
    }, 0)
    const essencePower = Object.values(store.collectedEssences).reduce((s, v) => s + v, 0)
    const totalPower = vampirePower + relicPower + structurePower + Math.floor(essencePower * 0.01)
    return {
      vampirePower,
      relicPower,
      structurePower,
      essencePower: Math.floor(essencePower * 0.01),
      totalPower,
      vampirePercent: totalPower > 0 ? Math.floor((vampirePower / totalPower) * 100) : 0,
      relicPercent: totalPower > 0 ? Math.floor((relicPower / totalPower) * 100) : 0,
      structurePercent: totalPower > 0 ? Math.floor((structurePower / totalPower) * 100) : 0,
    }
  }, [store])

  // ── Assemble bwAPI ────────────────────────────────────────────
  const bwAPI = {
    // Constants
    BW_VAMPIRES,
    BW_COVENS,
    BW_ESSENCES,
    BW_STRUCTURES,
    BW_ABILITIES,
    BW_ACHIEVEMENTS,
    BW_TITLES,
    BW_RELICS,
    BW_MOON_EVENTS,
    BW_COLOR_BLOOD_CRIMSON,
    BW_COLOR_DARK_PURPLE,
    BW_COLOR_MIDNIGHT_BLACK,
    BW_COLOR_SHADOW_GRAY,
    BW_COLOR_MOONLIGHT_SILVER,
    BW_COLOR_THORN_ROSE,
    BW_COLOR_PALE_IVORY,
    BW_COLOR_EMBER_RED,

    // State
    embracedVampires: store.embracedVampires,
    collectedEssences: store.collectedEssences,
    structures: store.structures,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    collectedRelics: store.collectedRelics,
    unlockedCovens: store.unlockedCovens,
    covenLevel: store.covenLevel,
    covenExp: store.covenExp,
    gold: store.gold,
    bloodEnergy: store.bloodEnergy,
    totalEmbraced: store.totalEmbraced,
    totalCollected: store.totalCollected,
    totalUpgraded: store.totalUpgraded,
    totalAwakened: store.totalAwakened,
    totalRituals: store.totalRituals,
    activeEventId: store.activeEventId,
    eventTimer: store.eventTimer,
    covenSanctuary: store.covenSanctuary,
    activeCovenId: store.activeCovenId,

    // Actions
    bwEmbraceMortal: store.bwEmbraceMortal,
    bwCollectEssence: store.bwCollectEssence,
    bwUpgradeCoven: store.bwUpgradeCoven,
    bwUseAbility: store.bwUseAbility,
    bwTriggerMoonEvent: store.bwTriggerMoonEvent,
    bwAcquireRelic: store.bwAcquireRelic,
    bwPerformRitual: store.bwPerformRitual,
    bwSummonBatSwarm: store.bwSummonBatSwarm,
    bwCloakInShadows: store.bwCloakInShadows,
    bwAwakenAncient: store.bwAwakenAncient,

    // Getters
    bwGetCovenDetails,
    bwGetEssenceInventory,
    bwGetEmbracedVampires,
    bwGetStructureList,
    bwGetTotalPower,
    bwGetEventStatus,
    bwGetActiveEvent,
    bwGetNextTitle,
    bwGetRaritySummary,
    bwGetCovenSummary,
    bwGetUnlockedAchievements,
    bwGetTitleProgress,
    bwGetCollectedRelics,
    bwGetCovenHealth,
    bwGetEmbracingCosts,
    bwLevelProgress,
    bwGetAbilityList,
    bwGetEventList,
    bwGetStatsSummary,
    bwGetVampireCountByBloodline,
    bwGetUpgradeCosts,
    bwGetRelicBonus,
    bwGetAwakeningTierDetails,
    bwGetCovenEssences,
    bwGetBloodEnergyEfficiency,
    bwGetBloodlineEmbraceChances,
    bwGetBloodlineSummary,
    bwGetBloodlineRites,
    bwGetCorruptionRisk,
    bwGetRitualPower,
    bwGetEmbraceSuccessRates,
    bwGetCovenPowerBreakdown,
  }

  return bwAPI
}
