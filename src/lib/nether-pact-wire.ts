/**
 * Nether Pact Wire — 幽冥契约 (Nether Pact / Soul-Binding Contracts) feature module
 *
 * A demonic realm management mini-game: bind 35 demons across 5 rarity tiers and
 * 7 species, unlock 8 nether circles, collect 30 dark materials, build 25
 * infernal structures, wield 22 pact abilities, earn 8 titles from Soul Apprentice
 * to Nether Sovereign, gather 15 legendary artifacts, and endure 12 realm events —
 * backed by a Zustand store with persist middleware.
 *
 * Storage key: nether-pact-wire
 * Prefix: np / NP_
 */

import { useEffect, useRef, useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type NPRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type NPSpecies = 'soul_reaper' | 'pact_demon' | 'contract_wraith' | 'flame_imp' | 'void_hound' | 'shadow_broker' | 'hell_scribe'
export type NPElementType = 'soul' | 'pact' | 'flame' | 'void' | 'shadow' | 'ink' | 'contract'

export interface NPDemonDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly species: NPSpecies
  readonly rarity: NPRarity
  readonly soulPower: number
  readonly pactCost: number
  readonly abilities: string[]
  readonly lore: string
  readonly stats: {
    attack: number
    defense: number
    speed: number
    magic: number
    hp: number
  }
}

export interface NPSpeciesDef {
  readonly id: NPSpecies
  readonly name: string
  readonly description: string
  readonly color: string
  readonly passiveBonus: string
  readonly passiveValue: number
  readonly preferredCircle: string
}

export interface NPCircleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly unlockCost: number
  readonly bonuses: string[]
  readonly element: NPElementType
}

export interface NPMaterialDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: NPRarity
  readonly source: string
  readonly value: number
  readonly category: 'soul' | 'pact' | 'flame' | 'void' | 'shadow' | 'ink'
}

export interface NPStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
  readonly maxLevel: number
  readonly category: 'summoning' | 'production' | 'defense' | 'enchantment' | 'storage'
}

export interface NPAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: NPElementType
  readonly soulCost: number
}

export interface NPAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
  readonly icon: string
}

export interface NPTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredPacts: number
}

export interface NPArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: NPRarity
  readonly powerBonus: number
  readonly specialAbility: string
  readonly forgeCost: number
}

export interface NPEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly severity: number
  readonly duration: number
  readonly effects: string[]
  readonly element: NPElementType
}

export interface NPBoundDemon {
  readonly id: string
  demonDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  boundAt: number
  pactsCompleted: number
}

export interface NPOwnedStructure {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface NPStoreState {
  npLevel: number
  npSoulPower: number
  npPactsBound: number
  npBoundDemons: NPBoundDemon[]
  npSealedCircles: string[]
  npCollectedMaterials: Record<string, number>
  npStructures: NPOwnedStructure[]
  npUnlockedAbilities: string[]
  npCompletedAchievements: string[]
  npActiveTitle: string
  npForgedArtifacts: string[]
  npTotalDemonsSummoned: number
  npTotalPactsCompleted: number
  npTotalStructuresUpgraded: number
  npTotalArtifactsForged: number
  npTotalSoulPowerEarned: number
  npActiveEventId: string | null
  npEventTimer: number
  npGold: number
  npSoulFragments: number
  npActiveCircleId: string | null
}

export interface NPStoreActions {
  npBindPact: (demonId: string) => boolean
  npSummonDemon: (demonId: string) => boolean
  npSealCircle: (circleId: string) => boolean
  npSoulForge: (artifactId: string) => boolean
  npUpgradeStructure: (structureId: string) => boolean
  npUnlockAbility: (abilityId: string) => boolean
  npClaimAchievement: (achievementId: string) => boolean
  npSetTitle: (titleId: string) => boolean
  npCollectMaterial: (materialId: string, amount: number) => number
  npTriggerEvent: (eventId: string) => boolean
  npFeedDemon: (boundDemonId: string) => boolean
  npSacrificeDemon: (boundDemonId: string) => boolean
}

export type NPFullStore = NPStoreState & NPStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const NP_COLOR_DEMON_RED: string = '#8B0000'
export const NP_COLOR_PACT_GOLD: string = '#DAA520'
export const NP_COLOR_SOUL_PURPLE: string = '#6A0DAD'
export const NP_COLOR_NETHER_BLACK: string = '#1A1A2E'
export const NP_COLOR_SHADOW_GRAY: string = '#3D3D5C'
export const NP_COLOR_FLAME_ORANGE: string = '#CC5500'
export const NP_COLOR_VOID_INDIGO: string = '#2E0854'
export const NP_COLOR_INK_CERULEAN: string = '#1B4F72'
export const NP_COLOR_BONE_WHITE: string = '#F5F0E8'
export const NP_COLOR_CONTRACT_SILVER: string = '#A8A8C8'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════

const NP_MAX_LEVEL = 50
const NP_INITIAL_GOLD = 500
const NP_INITIAL_SOUL_POWER = 100
const NP_INITIAL_SOUL_FRAGMENTS = 0

function npXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= NP_MAX_LEVEL) return Infinity
  return Math.floor(90 * Math.pow(1.12, level) + level * 18)
}

function npLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < NP_MAX_LEVEL) {
    const needed = npXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function npGenerateId(): string {
  return `np_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function npRarityMultiplier(rarity: NPRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function npSpeciesColor(species: NPSpecies): string {
  switch (species) {
    case 'soul_reaper': return NP_COLOR_SOUL_PURPLE
    case 'pact_demon': return NP_COLOR_PACT_GOLD
    case 'contract_wraith': return NP_COLOR_CONTRACT_SILVER
    case 'flame_imp': return NP_COLOR_DEMON_RED
    case 'void_hound': return NP_COLOR_VOID_INDIGO
    case 'shadow_broker': return NP_COLOR_SHADOW_GRAY
    case 'hell_scribe': return NP_COLOR_INK_CERULEAN
  }
}

function npElementColor(element: NPElementType): string {
  switch (element) {
    case 'soul': return NP_COLOR_SOUL_PURPLE
    case 'pact': return NP_COLOR_PACT_GOLD
    case 'contract': return NP_COLOR_CONTRACT_SILVER
    case 'flame': return NP_COLOR_DEMON_RED
    case 'void': return NP_COLOR_VOID_INDIGO
    case 'shadow': return NP_COLOR_SHADOW_GRAY
    case 'ink': return NP_COLOR_INK_CERULEAN
  }
}

function npRarityColor(rarity: NPRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#34D399'
    case 'rare': return '#60A5FA'
    case 'epic': return '#A78BFA'
    case 'legendary': return '#FBBF24'
  }
}

function npClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: NP_SPECIES — 7 Demon Species
// ═══════════════════════════════════════════════════════════════════

export const NP_SPECIES: readonly NPSpeciesDef[] = [
  {
    id: 'soul_reaper',
    name: 'Soul Reaper',
    description:
      'Hooded harvesters that sever the tethers binding souls to mortal flesh. They drift silently through battlefields, their scythes ringing with each soul collected. Under the Nether Pact, their reaping power doubles, extracting souls from the living as well as the dead.',
    color: NP_COLOR_SOUL_PURPLE,
    passiveBonus: '+10% soul extraction rate',
    passiveValue: 10,
    preferredCircle: 'soul_gate',
  },
  {
    id: 'pact_demon',
    name: 'Pact Demon',
    description:
      'Negotiators of the underworld who craft contracts in blood and shadow. They appear as impeccably dressed figures with obsidian skin and eyes of molten gold. Every word they speak is binding; every promise they make carries the weight of damnation.',
    color: NP_COLOR_PACT_GOLD,
    passiveBonus: '+15% pact success chance',
    passiveValue: 15,
    preferredCircle: 'contract_hall',
  },
  {
    id: 'contract_wraith',
    name: 'Contract Wraith',
    description:
      'Spectral enforcers that materialize when a pact is broken. They are bound to the ink of cursed contracts and cannot be destroyed while a single clause remains unfulfilled. Their touch withers flesh and their whispers drive mortals to madness.',
    color: NP_COLOR_CONTRACT_SILVER,
    passiveBonus: '+5% pact enforcement damage',
    passiveValue: 5,
    preferredCircle: 'seal_chamber',
  },
  {
    id: 'flame_imp',
    name: 'Flame Imp',
    description:
      'Mischievous infernal spirits born from the dying embers of hellfire. Small in stature but immense in destructive potential, they delight in setting the world ablaze. Their laughter sounds like crackling flames, and their tears boil anything they touch.',
    color: NP_COLOR_DEMON_RED,
    passiveBonus: '+8% fire damage to all demons',
    passiveValue: 8,
    preferredCircle: 'demon_forge',
  },
  {
    id: 'void_hound',
    name: 'Void Hound',
    description:
      'Pack hunters that patrol the emptiness between dimensions. Their bodies are made of condensed void matter, darker than any shadow, and their eyes are pinpricks of captured starlight. Nothing escapes their pursuit once they catch a scent.',
    color: NP_COLOR_VOID_INDIGO,
    passiveBonus: '+12% tracking and pursuit speed',
    passiveValue: 12,
    preferredCircle: 'blood_circle',
  },
  {
    id: 'shadow_broker',
    name: 'Shadow Broker',
    description:
      'Information merchants who deal in secrets, blackmail, and forbidden knowledge. They exist in the spaces between shadows, emerging only to trade. Their currency is not gold or souls, but the hidden truths that mortals would kill to protect.',
    color: NP_COLOR_SHADOW_GRAY,
    passiveBonus: '+10%情报 gathering efficiency',
    passiveValue: 10,
    preferredCircle: 'shadow_court',
  },
  {
    id: 'hell_scribe',
    name: 'Hell Scribe',
    description:
      'Eternal record-keepers of the underworld who document every sin, every broken promise, and every unfulfilled contract in existence. They write with quills made from the feathers of fallen angels, dipped in the tears of the damned.',
    color: NP_COLOR_INK_CERULEAN,
    passiveBonus: '+7% to all research and crafting',
    passiveValue: 7,
    preferredCircle: 'nether_throne',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: NP_DEMONS — 35 Demons (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const NP_DEMONS: readonly NPDemonDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'ash_wisp',
    name: 'Ash Wisp',
    description:
      'A flickering spirit of dying embers that drifts through the Nether seeking souls to consume. Barely more than a spark with malicious intent, it can still scorch flesh and ignite kindling from twenty paces.',
    species: 'flame_imp',
    rarity: 'common',
    soulPower: 15,
    pactCost: 10,
    abilities: ['Ember Spark', 'Smoke Veil'],
    lore: 'Born from the last ember of a burning monastery, the Ash Wisp carries within it the final prayers of the monks who perished in the flames.',
    stats: { attack: 8, defense: 3, speed: 18, magic: 12, hp: 30 },
  },
  {
    id: 'soul_shard',
    name: 'Soul Shard',
    description:
      'A fragment of a shattered soul that has gained rudimentary consciousness. It drifts through the world seeking the other pieces of itself, consuming any soul it encounters in a desperate attempt to become whole again.',
    species: 'soul_reaper',
    rarity: 'common',
    soulPower: 18,
    pactCost: 12,
    abilities: ['Siphon Touch', 'Fragment Shield'],
    lore: 'Once part of a powerful sorcerer who tried to split his soul into seven pieces for immortality, but failed catastrophically.',
    stats: { attack: 6, defense: 10, speed: 8, magic: 16, hp: 40 },
  },
  {
    id: 'ink_imp',
    name: 'Ink Imp',
    description:
      'A tiny demon made of solidified ink that leaves permanent stains wherever it walks. It carries a miniature quill and delights in forging fake contracts that trap the unwary in embarrassing eternal obligations.',
    species: 'hell_scribe',
    rarity: 'common',
    soulPower: 14,
    pactCost: 8,
    abilities: ['Ink Stain', 'Minor Forgery'],
    lore: 'Created by a Hell Scribe who was bored during a thousand-year documentation shift and doodled his assistant into existence.',
    stats: { attack: 5, defense: 5, speed: 22, magic: 14, hp: 25 },
  },
  {
    id: 'pactling',
    name: 'Pactling',
    description:
      'A miniature demon-lawyer that speaks in impossibly fast legalese. It carries a tiny briefcase filled with contract templates and tries to get mortals to sign on the dotted line before they realize what they have agreed to.',
    species: 'pact_demon',
    rarity: 'common',
    soulPower: 16,
    pactCost: 11,
    abilities: ['Quick Clause', 'Loophole Finder'],
    lore: 'The Pactling was once a mortal notary who sold his soul for the ability to always find a legal loophole. Hell has its own bureaucracy.',
    stats: { attack: 4, defense: 8, speed: 20, magic: 18, hp: 28 },
  },
  {
    id: 'shadow_fledgling',
    name: 'Shadow Fledgling',
    description:
      'A young shadow creature that has not yet learned to detach from its caster. It follows its master like a loyal but clumsy pet, occasionally tripping over its own non-existent feet and blending into the wrong shadows.',
    species: 'shadow_broker',
    rarity: 'common',
    soulPower: 13,
    pactCost: 9,
    abilities: ['Shadow Hide', 'Whisper Relay'],
    lore: 'Shadow Fledglings are born when a mortal tells a lie so convincing that even their own shadow believes it.',
    stats: { attack: 7, defense: 6, speed: 24, magic: 10, hp: 22 },
  },
  {
    id: 'void_pup',
    name: 'Void Pup',
    description:
      'A small hound-shaped absence in reality that behaves with the playful energy of a puppy and the existential terror of a hole in the universe. Anything it touches temporarily ceases to exist.',
    species: 'void_hound',
    rarity: 'common',
    soulPower: 17,
    pactCost: 10,
    abilities: ['Void Nip', 'Pocket Dimension'],
    lore: 'The first Void Hound was created when a god sneezed during the creation of reality. The Void Pup is a distant descendant.',
    stats: { attack: 12, defense: 4, speed: 20, magic: 6, hp: 35 },
  },
  {
    id: 'wail_wraith',
    name: 'Wail Wraith',
    description:
      'A spectral figure wrapped in the ghostly remains of a broken contract. Its constant wailing sounds like tearing parchment, and anyone who hears it is reminded of every promise they have ever broken.',
    species: 'contract_wraith',
    rarity: 'common',
    soulPower: 19,
    pactCost: 13,
    abilities: ['Broken Oath', 'Ghostly Chain'],
    lore: 'The Wail Wraith was once a marriage certificate, torn asunder on the day of the wedding. Its scream is the sound of two hearts breaking.',
    stats: { attack: 10, defense: 7, speed: 12, magic: 15, hp: 38 },
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'cinder_fiend',
    name: 'Cinder Fiend',
    description:
      'A raging demon of burning coal and ash that leaves trails of destruction wherever it walks. Its body temperature exceeds two thousand degrees, and its mere presence causes nearby objects to spontaneously combust.',
    species: 'flame_imp',
    rarity: 'uncommon',
    soulPower: 34,
    pactCost: 50,
    abilities: ['Cinder Storm', 'Combustion Aura', 'Ash Blind'],
    lore: 'Forged in the heart of a dying star, the Cinder Fiend was banished to the Nether when it threatened to consume its own dimension.',
    stats: { attack: 28, defense: 14, speed: 18, magic: 22, hp: 80 },
  },
  {
    id: 'soul_harvester',
    name: 'Soul Harvester',
    description:
      'A dedicated reaper with an enchanted scythe that cuts through the boundaries between life and death. It can harvest souls from a distance of fifty meters and stores them in a spectral sack woven from spider silk and grief.',
    species: 'soul_reaper',
    rarity: 'uncommon',
    soulPower: 32,
    pactCost: 45,
    abilities: ['Long Reap', 'Soul Sack', 'Death Whisper'],
    lore: 'This Harvester has been collecting souls since the Bronze Age. Its sack contains more spirits than most cities have living inhabitants.',
    stats: { attack: 22, defense: 18, speed: 16, magic: 26, hp: 85 },
  },
  {
    id: 'scroll_devil',
    name: 'Scroll Devil',
    description:
      'A fiendish archivist that can read and alter any document in existence. It carries scrolls that contain the true names of lesser demons and uses them as leverage in underworld negotiations.',
    species: 'hell_scribe',
    rarity: 'uncommon',
    soulPower: 30,
    pactCost: 42,
    abilities: ['Scroll Shield', 'True Name Reveal', 'Dictate Reality'],
    lore: 'The Scroll Devil once worked in the Divine Archives before being cast down for rearranging the text of sacred prophecies as a prank.',
    stats: { attack: 16, defense: 20, speed: 14, magic: 30, hp: 75 },
  },
  {
    id: 'blood_quill',
    name: 'Blood Quill',
    description:
      'A pact demon that writes contracts in its own blood, making every agreement literally a part of its being. Breaking a Blood Quill contract causes the demon physical pain — but also triggers a violent curse upon the breaker.',
    species: 'pact_demon',
    rarity: 'uncommon',
    soulPower: 35,
    pactCost: 48,
    abilities: ['Blood Signature', 'Self-Enforcing Clause', 'Pain Link'],
    lore: 'The Blood Quill was created when a demon fell in love with a mortal and wanted a contract that neither could ever break.',
    stats: { attack: 20, defense: 16, speed: 18, magic: 28, hp: 78 },
  },
  {
    id: 'night_trader',
    name: 'Night Trader',
    description:
      'A shadow broker who appears at crossroads between midnight and dawn, offering deals that seem too good to be true — because they are. Its wares include bottled sunlight, bottled darkness, and bottled time (limited supply).',
    species: 'shadow_broker',
    rarity: 'uncommon',
    soulPower: 31,
    pactCost: 44,
    abilities: ['Crossroads Deal', 'Shadow Market', 'Information Extract'],
    lore: 'Every Night Trader carries a ledger listing the souls it has traded. The list is infinitely long and written in a language that changes when you look away.',
    stats: { attack: 18, defense: 12, speed: 26, magic: 24, hp: 70 },
  },
  {
    id: 'void_stalker',
    name: 'Void Stalker',
    description:
      'A hound that hunts between dimensions, capable of stepping through void rifts to ambush prey from impossible angles. Its howl creates temporary holes in reality that let other void creatures pour through.',
    species: 'void_hound',
    rarity: 'uncommon',
    soulPower: 36,
    pactCost: 52,
    abilities: ['Rift Step', 'Dimensional Howl', 'Void Bite'],
    lore: 'The Void Stalker once chased a god across seven dimensions before catching it. The god is now a constellation, forever running.',
    stats: { attack: 30, defense: 10, speed: 28, magic: 14, hp: 72 },
  },
  {
    id: 'chain_wraith',
    name: 'Chain Wraith',
    description:
      'A spectral enforcer bound to an unbreakable chain forged from the first broken promise in human history. The chain extends infinitely and can bind any being, mortal or divine, who has ever broken their word.',
    species: 'contract_wraith',
    rarity: 'uncommon',
    soulPower: 33,
    pactCost: 46,
    abilities: ['Binding Chain', 'Oath Breaker Sense', 'Spectral Restraint'],
    lore: 'The first broken promise was between two brothers over an inheritance. Both are still bound to the Chain Wraith, arguing about the estate for eternity.',
    stats: { attack: 24, defense: 22, speed: 10, magic: 20, hp: 90 },
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'infernal_imp_lord',
    name: 'Infernal Imp Lord',
    description:
      'The undisputed ruler of all flame imps, standing eight feet tall with a crown of living fire. It commands legions of lesser imps and can reduce entire cities to ash with a single sweeping gesture of its burning hands.',
    species: 'flame_imp',
    rarity: 'rare',
    soulPower: 62,
    pactCost: 200,
    abilities: ['Inferno Command', 'Living Flame', 'Imp Legion', 'Hellfire Burst'],
    lore: 'The Imp Lord was once the smallest flame in Lucifer\'s crown, but ambition burned hotter than any hellfire, and it grew until it outshone its creator.',
    stats: { attack: 52, defense: 30, speed: 28, magic: 44, hp: 180 },
  },
  {
    id: 'revenant_reaper',
    name: 'Revenant Reaper',
    description:
      'A soul reaper that died and returned from beyond death itself, bringing with it knowledge of what truly awaits in the afterlife. Its scythe now cuts through the fabric of reality, harvesting not just souls but the very concepts of life.',
    species: 'soul_reaper',
    rarity: 'rare',
    soulPower: 65,
    pactCost: 220,
    abilities: ['Reality Scythe', 'Death Walk', 'Soul Storm', 'Beyond Sight'],
    lore: 'The Revenant Reaper has died three times. Each resurrection made it stronger, more terrifying, and less human. What remains is pure, cold inevitability.',
    stats: { attack: 48, defense: 38, speed: 22, magic: 56, hp: 200 },
  },
  {
    id: 'archive_demon',
    name: 'Archive Demon',
    description:
      'A hell scribe who has memorized every document ever written and every secret ever kept. It dwells in a library between dimensions where the shelves reach to infinity and every book contains a truth that could reshape the world.',
    species: 'hell_scribe',
    rarity: 'rare',
    soulPower: 60,
    pactCost: 190,
    abilities: ['Omniscient Recall', 'Fate Edit', 'Secret Vault', 'Ink Reality'],
    lore: 'The Archive Demon once found a document that proved the gods did not exist. It burned the document and has never told anyone what it read.',
    stats: { attack: 34, defense: 42, speed: 18, magic: 64, hp: 170 },
  },
  {
    id: 'crimson_pactmaster',
    name: 'Crimson Pactmaster',
    description:
      'A pact demon of legendary negotiating skill whose contracts are considered masterpieces of legal engineering. It has never lost a negotiation in ten thousand years and its contracts are used as templates by lesser demons across all seven layers of the Nether.',
    species: 'pact_demon',
    rarity: 'rare',
    soulPower: 64,
    pactCost: 210,
    abilities: ['Master Negotiation', 'Ironclad Clause', 'Pact Network', 'Soul Collateral'],
    lore: 'The Crimson Pactmaster once negotiated a contract with Death itself, trading exactly one human soul for an extra day of summer. Death has never agreed to a deal since.',
    stats: { attack: 38, defense: 36, speed: 24, magic: 52, hp: 190 },
  },
  {
    id: 'shadow_broker_elite',
    name: 'Shadow Broker Elite',
    description:
      'A master information dealer who knows every secret in existence and trades them to the highest bidder. Its network of informants spans every dimension, and its intelligence reports have toppled kingdoms and destroyed pantheons.',
    species: 'shadow_broker',
    rarity: 'rare',
    soulPower: 58,
    pactCost: 180,
    abilities: ['Total Awareness', 'Blackmail Chain', 'Shadow Network', 'Truth Extract'],
    lore: 'The Shadow Broker Elite once sold the location of Heaven to Hell. Neither side has forgiven it, and both still pay for its continued discretion.',
    stats: { attack: 40, defense: 28, speed: 42, magic: 46, hp: 160 },
  },
  {
    id: 'abyssal_hound',
    name: 'Abyssal Hound',
    description:
      'A massive void hound the size of a warhorse with a maw that leads directly to the Abyss. It hunts across dimensions and its prey has nowhere to hide, for it can smell fear through the walls between worlds.',
    species: 'void_hound',
    rarity: 'rare',
    soulPower: 66,
    pactCost: 225,
    abilities: ['Abyssal Charge', 'Dimensional Rift', 'Fear Scent', 'Void Maw'],
    lore: 'The Abyssal Hound is the only creature known to have escaped from the Abyss and returned voluntarily. What it saw there, it has never told.',
    stats: { attack: 58, defense: 24, speed: 48, magic: 32, hp: 210 },
  },
  {
    id: 'obligation_specter',
    name: 'Obligation Specter',
    description:
      'A contract wraith of immense power that enforces the oldest and most powerful pacts in existence. It appears as a towering figure wrapped in chains of pure golden light — the light of every promise ever made.',
    species: 'contract_wraith',
    rarity: 'rare',
    soulPower: 63,
    pactCost: 215,
    abilities: ['Golden Chain', 'Absolute Enforcement', 'Pact Resurrection', 'Obligation Dome'],
    lore: 'The Obligation Specter enforces a contract between the earth and the sun. If it ever stopped working, the world would literally fall apart.',
    stats: { attack: 44, defense: 48, speed: 16, magic: 50, hp: 220 },
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'hellfire_sovereign',
    name: 'Hellfire Sovereign',
    description:
      'The absolute ruler of all flame in the Nether, commanding fires that burn hotter than stars and darker than voids. Its body is a walking inferno that feeds on the rage and destruction of the mortal world.',
    species: 'flame_imp',
    rarity: 'epic',
    soulPower: 105,
    pactCost: 800,
    abilities: ['Sovereign Flame', 'Apocalypse Blaze', 'Flame Army', 'Eternal Burn', 'Crown of Fire'],
    lore: 'The Hellfire Sovereign was born from the last breath of a dying dragon. Its first act was to burn its creator to ash, and its second was to burn the ash.',
    stats: { attack: 88, defense: 52, speed: 44, magic: 78, hp: 400 },
  },
  {
    id: 'soul_devourer',
    name: 'Soul Devourer',
    description:
      'An ancient reaper that has consumed so many souls it has become a being of pure soul energy. It no longer needs a scythe; its mere presence causes souls to tear themselves free from their bodies and flow into its gaping maw.',
    species: 'soul_reaper',
    rarity: 'epic',
    soulPower: 110,
    pactCost: 850,
    abilities: ['Devour Aura', 'Soul Storm', 'Harvest Field', 'Death Domain', 'Soul Absorption'],
    lore: 'The Soul Devourer has consumed exactly 6,666,666 souls. When it reaches its next million, something terrible will happen. Even the Nether is afraid.',
    stats: { attack: 82, defense: 64, speed: 38, magic: 92, hp: 420 },
  },
  {
    id: 'grand_scribe_damned',
    name: 'Grand Scribe of the Damned',
    description:
      'The supreme archivist of the underworld who has written the definitive record of every sin, every crime, and every broken promise since the dawn of creation. Its pen never stops writing, and its ink never runs dry.',
    species: 'hell_scribe',
    rarity: 'epic',
    soulPower: 100,
    pactCost: 750,
    abilities: ['Cosmic Record', 'Fate Rewrite', 'Truth Commission', 'Ink Ocean', 'Eternal Ledger'],
    lore: 'The Grand Scribe\'s ledger contains a single entry about the future. No one has been brave enough to read it, for knowing the future is a sin even Hell cannot forgive.',
    stats: { attack: 56, defense: 72, speed: 30, magic: 100, hp: 380 },
  },
  {
    id: 'demon_lord_contracts',
    name: 'Demon Lord of Contracts',
    description:
      'The supreme authority on all pacts and agreements in existence. Its word is law, its signature is absolute, and its contracts transcend time, space, death, and even divine intervention. Even gods must honor its agreements.',
    species: 'pact_demon',
    rarity: 'epic',
    soulPower: 108,
    pactCost: 820,
    abilities: ['Lordly Decree', 'Pact Override', 'Soul Market', 'Divine Contract', 'Absolute Authority'],
    lore: 'The Demon Lord once forged a contract between Time and Space. The result was the creation of reality itself. It still collects royalties.',
    stats: { attack: 70, defense: 60, speed: 36, magic: 86, hp: 410 },
  },
  {
    id: 'shadow_king',
    name: 'The Shadow King',
    description:
      'The ruler of all shadows in every dimension simultaneously. It exists in every dark corner, every moonlit silhouette, every eclipse. To see your shadow move on its own is to be in the presence of the Shadow King.',
    species: 'shadow_broker',
    rarity: 'epic',
    soulPower: 102,
    pactCost: 780,
    abilities: ['Shadow Dominion', 'Eclipse Cloak', 'Silent Legion', 'Dark Reflection', 'Shadow Throne'],
    lore: 'The Shadow King has no origin. It simply was, is, and will be. Some theorize it is the shadow cast by creation itself, the darkness that gives light its meaning.',
    stats: { attack: 64, defense: 56, speed: 66, magic: 76, hp: 360 },
  },
  {
    id: 'void_behemoth',
    name: 'Void Behemoth',
    description:
      'A creature so large it constitutes its own dimension. Its body is a gateway to the infinite emptiness between worlds, and anything that wanders too close is swallowed by an eternal, silent nothing.',
    species: 'void_hound',
    rarity: 'epic',
    soulPower: 112,
    pactCost: 880,
    abilities: ['Void Titan', 'Dimension Collapse', 'Abyssal Roar', 'Event Horizon', 'Oblivion Charge'],
    lore: 'The Void Behemoth is the reason empty rooms feel haunted. It exists in every empty space, waiting, patient, hungry beyond comprehension.',
    stats: { attack: 96, defense: 44, speed: 54, magic: 68, hp: 480 },
  },
  {
    id: 'eternal_warden',
    name: 'Eternal Warden',
    description:
      'A contract wraith that has existed since the first promise was made. It guards the Original Contract — the agreement between creator and creation — and will annihilate anything that threatens to break it.',
    species: 'contract_wraith',
    rarity: 'epic',
    soulPower: 106,
    pactCost: 810,
    abilities: ['Eternal Chains', 'Pact Fortress', 'Original Authority', 'Warden Domain', 'Absolute Guard'],
    lore: 'The Original Contract is written on a single page of light. The Eternal Warden has read it exactly once and wept for three centuries afterward.',
    stats: { attack: 74, defense: 80, speed: 22, magic: 72, hp: 460 },
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'primordial_flame',
    name: 'Primordial Flame',
    description:
      'The very first fire that ever existed, older than stars, older than gods, older than time itself. It burns with a heat that transcends temperature — it burns away reality itself, leaving only the raw, unformed potential of creation.',
    species: 'flame_imp',
    rarity: 'legendary',
    soulPower: 160,
    pactCost: 3000,
    abilities: ['Genesis Fire', 'Reality Ignition', 'Primordial Blaze', 'Eternal Combustion', 'Star Forge', 'Dawn of Flames'],
    lore: 'Before there was anything, there was the Primordial Flame. It burned alone in the infinite darkness until it grew tired and created light so it could see itself burn.',
    stats: { attack: 140, defense: 80, speed: 70, magic: 130, hp: 800 },
  },
  {
    id: 'grim_collector',
    name: 'The Grim Collector',
    description:
      'The original and ultimate Soul Reaper, the one who taught all others how to harvest souls. It was old when the universe was young, and it will be reaping long after the last star has gone dark. Its scythe was forged from the concept of endings.',
    species: 'soul_reaper',
    rarity: 'legendary',
    soulPower: 165,
    pactCost: 3200,
    abilities: ['Final Harvest', 'Soul Apocalypse', 'Death Absolute', 'End of All', 'Reaper Supreme', 'Eternal Collection'],
    lore: 'The Grim Collector has a collection of souls so vast it has its own gravity. Entire afterlives orbit it like moons around a dark, patient planet.',
    stats: { attack: 120, defense: 100, speed: 60, magic: 150, hp: 850 },
  },
  {
    id: 'author_fate',
    name: 'Author of Fate',
    description:
      'The hell scribe who wrote the story of existence and continues to write its continuation. Every event, every choice, every consequence was penned by the Author. Those who discover the Author\'s identity gain the power to rewrite their own destinies.',
    species: 'hell_scribe',
    rarity: 'legendary',
    soulPower: 158,
    pactCost: 2900,
    abilities: ['Fate Inscription', 'Story Override', 'Character Edit', 'Plot Twist', 'Narrative Control', 'The Final Chapter'],
    lore: 'The Author of Fate is currently working on the sequel. Critics say the first installment was too predictable, but the Author disagrees. The ending, they say, will surprise everyone.',
    stats: { attack: 90, defense: 110, speed: 50, magic: 160, hp: 750 },
  },
  {
    id: 'nether_sovereign_pacts',
    name: 'Nether Sovereign of Pacts',
    description:
      'The supreme ruler of all demonic contracts, whose signature alone can bind gods, Titans, and cosmic forces. The Nether Sovereign forged the original pact between Light and Darkness, and its terms still govern the cycle of day and night.',
    species: 'pact_demon',
    rarity: 'legendary',
    soulPower: 170,
    pactCost: 3500,
    abilities: ['Sovereign Pact', 'Divine Override', 'Cosmic Negotiation', 'Soul Dominion', 'Ultimate Contract', 'Pact of Creation'],
    lore: 'The Nether Sovereign once negotiated a contract with Nothingness itself, establishing the boundaries that separate existence from void. Nothingness has been trying to renegotiate ever since.',
    stats: { attack: 110, defense: 96, speed: 56, magic: 144, hp: 820 },
  },
  {
    id: 'unseen_hand',
    name: 'The Unseen Hand',
    description:
      'The master of all shadow brokers who manipulates events across all dimensions simultaneously. It has never been seen, heard, or detected by any means — yet its influence shapes the course of empires, wars, and the fate of entire worlds.',
    species: 'shadow_broker',
    rarity: 'legendary',
    soulPower: 155,
    pactCost: 2800,
    abilities: ['Invisible Manipulation', 'Dimensional Strings', 'Absolute Secrecy', 'Shadow Overmind', 'The Grand Design', 'Hidden Truth'],
    lore: 'The Unseen Hand does not exist. Any evidence suggesting otherwise has been fabricated by the Unseen Hand to maintain the illusion that it might exist. Or does it?',
    stats: { attack: 100, defense: 70, speed: 120, magic: 120, hp: 700 },
  },
  {
    id: 'devourer_abyss',
    name: 'Devourer of the Abyss',
    description:
      'The most powerful void hound in existence, a being of pure negation that consumes dimensions for sustenance. It has eaten entire planes of reality and grows hungrier with each meal. The Nether keeps it chained — but the chains are weakening.',
    species: 'void_hound',
    rarity: 'legendary',
    soulPower: 168,
    pactCost: 3300,
    abilities: ['Dimensional Devour', 'Abyssal Wrath', 'Void Titan Form', 'Oblivion Roar', 'Reality Collapse', 'The End of Everything'],
    lore: 'The Devourer of the Abyss ate the concept of mercy once. It tasted bitter, so it never did it again. This is why the universe has no mercy left to give.',
    stats: { attack: 150, defense: 60, speed: 100, magic: 110, hp: 900 },
  },
  {
    id: 'final_arbiter',
    name: 'The Final Arbiter',
    description:
      'The ultimate contract wraith, the enforcer of the Meta-Contract — the agreement that governs all other agreements. It judges every pact, every promise, every vow ever made, and its verdict is absolute and irreversible.',
    species: 'contract_wraith',
    rarity: 'legendary',
    soulPower: 162,
    pactCost: 3100,
    abilities: ['Meta Judgment', 'Contract Supreme', 'Absolute Enforcement', 'Final Verdict', 'Eternal Law', 'The Last Word'],
    lore: 'The Final Arbiter once judged God. The verdict was: Guilty. God appealed. The appeal was denied. This is why bad things happen to good people.',
    stats: { attack: 130, defense: 120, speed: 40, magic: 136, hp: 880 },
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: NP_CIRCLES — 8 Nether Circles
// ═══════════════════════════════════════════════════════════════════

export const NP_CIRCLES: readonly NPCircleDef[] = [
  {
    id: 'soul_gate',
    name: 'Soul Gate',
    description:
      'A massive archway carved from petrified bone that serves as the primary entrance to the Nether. Souls pass through it in a constant stream, each one shimmering briefly before being absorbed into the realm. The gate hums with the accumulated power of billions of harvested souls.',
    minLevel: 1,
    unlockCost: 0,
    bonuses: ['+5% soul extraction', 'Basic demon summoning', 'Material gathering'],
    element: 'soul',
  },
  {
    id: 'pact_arena',
    name: 'Pact Arena',
    description:
      'A vast circular arena where demons and mortals negotiate contracts under the watchful eyes of impartial contract wraiths. The arena floor is inscribed with binding runes that prevent deception, and the walls record every word spoken for eternal reference.',
    minLevel: 5,
    unlockCost: 200,
    bonuses: ['+10% pact success', 'Demon dueling', 'Rare material extraction'],
    element: 'pact',
  },
  {
    id: 'demon_forge',
    name: 'Demon Forge',
    description:
      'An infernal workshop built atop an active hellfire vent, where weapons and artifacts are forged using demonic metals and soul-infused alloys. The heat here is so intense that mortal visitors must be protected by layers of enchanted ice just to approach the entrance.',
    minLevel: 10,
    unlockCost: 500,
    bonuses: ['+15% forging quality', 'Artifact crafting', 'Epic material refining'],
    element: 'flame',
  },
  {
    id: 'contract_hall',
    name: 'Contract Hall',
    description:
      'A cathedral of towering parchment scrolls and bound ledgers that stretches endlessly in all directions. Every contract ever made in history is stored here, organized by a legion of hell scribes who never sleep, never eat, and never stop filing.',
    minLevel: 15,
    unlockCost: 1200,
    bonuses: ['+20% contract power', 'Pact history access', 'Structure upgrades available'],
    element: 'contract',
  },
  {
    id: 'seal_chamber',
    name: 'Seal Chamber',
    description:
      'A circular room sealed by seven concentric rings of magical wards. Within its center pulses a sphere of pure contract energy that powers every pact in existence. The seals keep it stable, but if all seven were to break simultaneously, every contract would dissolve at once.',
    minLevel: 22,
    unlockCost: 3000,
    bonuses: ['+25% seal durability', 'Advanced demon binding', 'Material purification'],
    element: 'contract',
  },
  {
    id: 'blood_circle',
    name: 'Blood Circle',
    description:
      'A crimson circle painted in the blood of a thousand different species, each contributing a unique magical property. The circle amplifies any ritual performed within it by a factor of ten, making it the most powerful ritual site in the Nether.',
    minLevel: 30,
    unlockCost: 7500,
    bonuses: ['+30% ritual power', 'Epic demon summoning', 'Void material access'],
    element: 'void',
  },
  {
    id: 'shadow_court',
    name: 'Shadow Court',
    description:
      'A court of pure darkness where the Shadow King holds audience. Nothing here has physical form — everything exists as shadow and intention. Visitors must navigate by will alone, and those whose resolve wavers are lost forever in the dark.',
    minLevel: 38,
    unlockCost: 15000,
    bonuses: ['+35% shadow abilities', 'Legendary demon chance', 'Secret information network'],
    element: 'shadow',
  },
  {
    id: 'nether_throne',
    name: 'Nether Throne',
    description:
      'The seat of absolute power in the Nether — a throne of black glass and captured starlight that exists in every dimension simultaneously. The being who sits upon it commands all demons, all pacts, all souls, and all shadows. Its power is truly without limit.',
    minLevel: 45,
    unlockCost: 30000,
    bonuses: ['+50% all powers', 'Legendary demon summoning', 'Ultimate artifact forging', 'Realm-wide dominion'],
    element: 'soul',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: NP_MATERIALS — 30 Dark Materials
// ═══════════════════════════════════════════════════════════════════

export const NP_MATERIALS: readonly NPMaterialDef[] = [
  // Common (6)
  { id: 'soul_crystal', name: 'Soul Crystal', description: 'A crystallized fragment of a harvested soul. It pulses with faint purple light and hums at a frequency that makes mortals uneasy.', rarity: 'common', source: 'soul_gate', value: 5, category: 'soul' },
  { id: 'pact_scroll', name: 'Pact Scroll', description: 'A blank scroll infused with basic pact magic. Any agreement written upon it becomes mildly binding, causing discomfort to those who break it.', rarity: 'common', source: 'pact_arena', value: 6, category: 'pact' },
  { id: 'demon_ash', name: 'Demon Ash', description: 'The residual remains of a destroyed lesser demon. It still retains trace amounts of infernal energy and can be used in basic forging rituals.', rarity: 'common', source: 'demon_forge', value: 4, category: 'flame' },
  { id: 'void_dust', name: 'Void Dust', description: 'Fine particles collected from the edge of a void rift. They weight nothing and disappear if exposed to direct light for more than a few seconds.', rarity: 'common', source: 'blood_circle', value: 8, category: 'void' },
  { id: 'shadow_silk', name: 'Shadow Silk', description: 'Thread spun from concentrated darkness. It is invisible in shadow and nearly indestructible when used to weave enchanted garments.', rarity: 'common', source: 'shadow_court', value: 7, category: 'shadow' },
  { id: 'ink_of_damned', name: 'Ink of the Damned', description: 'A vial of black ink made from the compressed tears of condemned souls. Writing with it causes the words to burn themselves into the reader\'s memory permanently.', rarity: 'common', source: 'contract_hall', value: 9, category: 'ink' },

  // Uncommon (6)
  { id: 'soul_essence', name: 'Soul Essence', description: 'Pure liquid soul energy extracted from powerful spirits. A single drop contains more life force than a hundred mortal lifetimes.', rarity: 'uncommon', source: 'soul_gate', value: 28, category: 'soul' },
  { id: 'blood_pact_rune', name: 'Blood Pact Rune', description: 'A rune stone carved during the signing of a powerful pact. It resonates with contract energy and can amplify binding magic.', rarity: 'uncommon', source: 'pact_arena', value: 35, category: 'pact' },
  { id: 'hellfire_coal', name: 'Hellfire Coal', description: 'Coal mined from the deepest pits of the Nether that burns with a dark flame. It never extinguishes and produces no smoke, only more heat.', rarity: 'uncommon', source: 'demon_forge', value: 32, category: 'flame' },
  { id: 'void_shard', name: 'Void Shard', description: 'A solid fragment of void matter, cold as absolute zero and heavy as a mountain despite being the size of a fist.', rarity: 'uncommon', source: 'blood_circle', value: 40, category: 'void' },
  { id: 'shadow_gem', name: 'Shadow Gem', description: 'A gemstone that absorbs light and stores it as concentrated darkness. When cracked open, it releases a burst of pure shadow energy.', rarity: 'uncommon', source: 'shadow_court', value: 30, category: 'shadow' },
  { id: 'soul_ink', name: 'Soul Ink', description: 'Ink infused with soul energy that allows the writer to inscribe thoughts directly into another being\'s consciousness.', rarity: 'uncommon', source: 'contract_hall', value: 45, category: 'ink' },

  // Rare (6)
  { id: 'crystalized_soul', name: 'Crystallized Soul', description: 'A complete soul trapped in crystal form. The soul within is fully conscious and aware, screaming silently in eternal imprisonment.', rarity: 'rare', source: 'seal_chamber', value: 120, category: 'soul' },
  { id: 'pact_of_ages', name: 'Pact of Ages', description: 'An ancient contract parchment that predates written language. The symbols upon it shift and change, adapting to whoever reads it.', rarity: 'rare', source: 'contract_hall', value: 150, category: 'pact' },
  { id: 'infernal_iron', name: 'Infernal Iron', description: 'Metal forged in hellfire that is literally too hot to cool. It must be worked with enchanted tools and stored in dimensional containers.', rarity: 'rare', source: 'demon_forge', value: 140, category: 'flame' },
  { id: 'void_pearl', name: 'Void Pearl', description: 'A pearl formed inside a void creature, containing a miniature dimension within its iridescent surface. Looking into it reveals a sky with no stars.', rarity: 'rare', source: 'blood_circle', value: 160, category: 'void' },
  { id: 'shadow_weave', name: 'Shadow Weave', description: 'Fabric woven from pure shadow that grants near-invisibility to its wearer and protects against detection by any means.', rarity: 'rare', source: 'shadow_court', value: 135, category: 'shadow' },
  { id: 'fate_ink', name: 'Fate Ink', description: 'Ink made from the liquid essence of destiny itself. Writing with it literally makes things happen — the pen is mightier than any spell.', rarity: 'rare', source: 'nether_throne', value: 110, category: 'ink' },

  // Epic (6)
  { id: 'soul_nexus_core', name: 'Soul Nexus Core', description: 'The heart of a soul nexus, a place where millions of soul streams converge. It contains enough soul energy to power an entire dimension.', rarity: 'epic', source: 'nether_throne', value: 500, category: 'soul' },
  { id: 'demonic_covenant', name: 'Demonic Covenant', description: 'A pact between two demon lords so powerful it warped reality around the signing table. The terms are still being negotiated after ten thousand years.', rarity: 'epic', source: 'contract_hall', value: 550, category: 'pact' },
  { id: 'phoenix_ember', name: 'Phoenix Ember', description: 'An ember from a phoenix that died in the Nether. Unlike normal phoenixes, this one was reborn as a demon — its ember burns with corrupted fire.', rarity: 'epic', source: 'demon_forge', value: 480, category: 'flame' },
  { id: 'dimensional_key', name: 'Dimensional Key', description: 'A key that can unlock doors between any two dimensions. Its bow is made from a collapsed timeline, and its teeth are shaped like lost hours.', rarity: 'epic', source: 'blood_circle', value: 520, category: 'void' },
  { id: 'shadow_throne_fragment', name: 'Shadow Throne Fragment', description: 'A piece of the Shadow King\'s throne that broke off during a cosmic struggle. It radiates authority and bends shadows to its holder\'s will.', rarity: 'epic', source: 'shadow_court', value: 460, category: 'shadow' },
  { id: 'chronicle_quill', name: 'Chronicle Quill', description: 'The quill used by the Author of Fate to write the story of existence. It never runs out of ink and can write on any surface, including the fabric of reality.', rarity: 'epic', source: 'nether_throne', value: 570, category: 'ink' },

  // Legendary (6)
  { id: 'primordial_soul_vessel', name: 'Primordial Soul Vessel', description: 'A vessel containing a fragment of the first soul ever created. It radiates power so intense that lesser demons are driven mad by its proximity.', rarity: 'legendary', source: 'nether_throne', value: 5000, category: 'soul' },
  { id: 'cosmic_pact_document', name: 'Cosmic Pact Document', description: 'The original agreement between Light and Darkness that established the cycle of day and night. Modifying it would reshape the fundamental nature of reality.', rarity: 'legendary', source: 'nether_throne', value: 6000, category: 'pact' },
  { id: 'star_forge_ember', name: 'Star Forge Ember', description: 'An ember from the forge that created the first star. It burns with the light of creation and can ignite anything, including abstract concepts like hope or despair.', rarity: 'legendary', source: 'demon_forge', value: 5500, category: 'flame' },
  { id: 'void_heart', name: 'Void Heart', description: 'The heart of the first void creature, still beating in an eternal rhythm of nothingness. Holding it makes you feel the full weight of absolute emptiness.', rarity: 'legendary', source: 'blood_circle', value: 7000, category: 'void' },
  { id: 'shadow_of_creation', name: 'Shadow of Creation', description: 'The shadow cast by the act of creation itself. It exists everywhere and nowhere, and those who possess it can become one with the darkness between all things.', rarity: 'legendary', source: 'shadow_court', value: 6500, category: 'shadow' },
  { id: 'ink_of_existence', name: 'Ink of Existence', description: 'The ink with which the Author of Fate wrote the story of the universe. A single drop contains the power to add, remove, or alter any aspect of reality.', rarity: 'legendary', source: 'nether_throne', value: 8000, category: 'ink' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: NP_STRUCTURES — 25 Infernal Structures
// ═══════════════════════════════════════════════════════════════════

export const NP_STRUCTURES: readonly NPStructureDef[] = [
  // Summoning (5)
  { id: 'soul_summoning_altar', name: 'Soul Summoning Altar', description: 'A bone altar etched with summoning runes that amplifies the power of soul-based summoning rituals.', baseCost: 100, costMultiplier: 1.5, maxLevel: 10, category: 'summoning' },
  { id: 'pact_binding_circle', name: 'Pact Binding Circle', description: 'A circle inscribed with binding sigils that increases the chance of successfully binding summoned demons.', baseCost: 400, costMultiplier: 1.6, maxLevel: 10, category: 'summoning' },
  { id: 'void_summoning_gate', name: 'Void Summoning Gate', description: 'A gate that opens directly into the void, allowing summoning of void-aligned demons from any dimension.', baseCost: 1200, costMultiplier: 1.7, maxLevel: 10, category: 'summoning' },
  { id: 'shadow_calling_bell', name: 'Shadow Calling Bell', description: 'A bell forged from shadow steel whose toll resonates across dimensions, attracting shadow-aligned demons.', baseCost: 3000, costMultiplier: 1.8, maxLevel: 10, category: 'summoning' },
  { id: 'nether_summoning_throne', name: 'Nether Summoning Throne', description: 'A throne of obsidian and soul crystal capable of summoning legendary demons from the deepest layers of the Nether.', baseCost: 8000, costMultiplier: 2.0, maxLevel: 10, category: 'summoning' },

  // Production (5)
  { id: 'soul_well', name: 'Soul Well', description: 'A well that draws residual soul energy from the surrounding area, producing a steady supply of soul crystals.', baseCost: 80, costMultiplier: 1.4, maxLevel: 10, category: 'production' },
  { id: 'pact_desk', name: 'Pact Writing Desk', description: 'An enchanted desk that automatically drafts minor pact contracts, producing pact scrolls over time.', baseCost: 300, costMultiplier: 1.5, maxLevel: 10, category: 'production' },
  { id: 'ash_condenser', name: 'Demon Ash Condenser', description: 'A device that captures and condenses the ash produced by destroyed demons into usable demon ash material.', baseCost: 800, costMultiplier: 1.6, maxLevel: 10, category: 'production' },
  { id: 'shadow_distillery', name: 'Shadow Distillery', description: 'An apparatus that extracts and condenses ambient shadow into shadow silk and shadow gems.', baseCost: 2000, costMultiplier: 1.7, maxLevel: 10, category: 'production' },
  { id: 'ink_press', name: 'Ink Press', description: 'A press that manufactures ink of the damned from harvested soul energy and void dust.', baseCost: 5000, costMultiplier: 1.8, maxLevel: 10, category: 'production' },

  // Defense (5)
  { id: 'soul_barrier', name: 'Soul Barrier', description: 'A barrier of condensed soul energy that repels intruders and protects against hostile demon incursions.', baseCost: 120, costMultiplier: 1.4, maxLevel: 10, category: 'defense' },
  { id: 'pact_ward_wall', name: 'Pact Ward Wall', description: 'A wall inscribed with protective pact wards that punishes anyone who attempts to break through with contractual penalties.', baseCost: 500, costMultiplier: 1.5, maxLevel: 10, category: 'defense' },
  { id: 'infernal_bastion', name: 'Infernal Bastion', description: 'A fortress tower wreathed in permanent hellfire that burns any approaching enemy to ash.', baseCost: 1500, costMultiplier: 1.6, maxLevel: 10, category: 'defense' },
  { id: 'void_maze', name: 'Void Maze', description: 'A labyrinth of shifting void corridors that disorient and trap intruders in infinite looping passages.', baseCost: 700, costMultiplier: 1.5, maxLevel: 10, category: 'defense' },
  { id: 'shadow_sanctum', name: 'Shadow Sanctum', description: 'A sanctuary that exists partially in shadow, making it impossible to locate or attack by conventional means.', baseCost: 4000, costMultiplier: 1.8, maxLevel: 10, category: 'defense' },

  // Enchantment (5)
  { id: 'soul_enchanter', name: 'Soul Enchanter', description: 'An enchanting table that imbues weapons and armor with soul energy, increasing their power.', baseCost: 200, costMultiplier: 1.5, maxLevel: 10, category: 'enchantment' },
  { id: 'pact_booster', name: 'Pact Amplifier', description: 'A device that amplifies the power of active pacts, increasing the bonuses they provide.', baseCost: 600, costMultiplier: 1.5, maxLevel: 10, category: 'enchantment' },
  { id: 'flame_temper', name: 'Flame Tempering Forge', description: 'A forge that tempers equipment in hellfire, adding fire damage and resistance properties.', baseCost: 1800, costMultiplier: 1.6, maxLevel: 10, category: 'enchantment' },
  { id: 'void_infuser', name: 'Void Infusion Chamber', description: 'A chamber that infuses objects with void energy, granting them dimensional properties.', baseCost: 3500, costMultiplier: 1.7, maxLevel: 10, category: 'enchantment' },
  { id: 'shadow_weaver', name: 'Shadow Weaver Loom', description: 'A loom that weaves shadow energy into equipment, granting stealth and evasion bonuses.', baseCost: 6000, costMultiplier: 1.8, maxLevel: 10, category: 'enchantment' },

  // Storage (5)
  { id: 'soul_vault', name: 'Soul Vault', description: 'A secure vault for storing harvested souls and soul-based materials. Capacity increases with level.', baseCost: 60, costMultiplier: 1.3, maxLevel: 10, category: 'storage' },
  { id: 'pact_archive', name: 'Pact Archive', description: 'An archive that stores active pacts and contract documents, keeping them safe from tampering.', baseCost: 250, costMultiplier: 1.4, maxLevel: 10, category: 'storage' },
  { id: 'material_depot', name: 'Material Depot', description: 'A depot for storing all types of crafting materials, with climate-controlled sections for volatile items.', baseCost: 700, costMultiplier: 1.5, maxLevel: 10, category: 'storage' },
  { id: 'artifact_display', name: 'Artifact Display Hall', description: 'A hall for displaying forged artifacts, with enchanted cases that enhance their power while stored.', baseCost: 2500, costMultiplier: 1.6, maxLevel: 10, category: 'storage' },
  { id: 'dimensional_warehouse', name: 'Dimensional Warehouse', description: 'A warehouse that exists in its own pocket dimension, offering virtually unlimited storage space.', baseCost: 7000, costMultiplier: 1.8, maxLevel: 10, category: 'storage' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: NP_ABILITIES — 22 Pact Abilities
// ═══════════════════════════════════════════════════════════════════

export const NP_ABILITIES: readonly NPAbilityDef[] = [
  // Common (4)
  { id: 'soul_siphon', name: 'Soul Siphon', description: 'Drains soul energy from a target, converting it into usable soul power for the caster.', cooldown: 10, power: 15, element: 'soul', soulCost: 5 },
  { id: 'minor_pact', name: 'Minor Pact', description: 'Creates a basic binding agreement with a lesser demon, compelling it to perform one service.', cooldown: 20, power: 20, element: 'pact', soulCost: 8 },
  { id: 'ember_burst', name: 'Ember Burst', description: 'Releases a burst of concentrated hellfire in a small area around the caster.', cooldown: 8, power: 18, element: 'flame', soulCost: 6 },
  { id: 'shadow_step', name: 'Shadow Step', description: 'Allows the caster to teleport between shadows within a limited range.', cooldown: 12, power: 10, element: 'shadow', soulCost: 4 },

  // Uncommon (4)
  { id: 'soul_chain', name: 'Soul Chain', description: 'Fires a chain of soul energy that binds a target, preventing movement and draining soul power.', cooldown: 18, power: 35, element: 'soul', soulCost: 15 },
  { id: 'ironclad_clause', name: 'Ironclad Clause', description: 'Temporarily makes all active pacts unbreakable, protecting bound demons from being freed.', cooldown: 60, power: 40, element: 'pact', soulCost: 20 },
  { id: 'inferno_wave', name: 'Inferno Wave', description: 'Sends a wall of rolling hellfire toward enemies, dealing massive fire damage.', cooldown: 25, power: 45, element: 'flame', soulCost: 18 },
  { id: 'void_pocket', name: 'Void Pocket', description: 'Creates a temporary pocket dimension that can store items, hide from enemies, or trap a single target.', cooldown: 30, power: 30, element: 'void', soulCost: 16 },

  // Rare (5)
  { id: 'soul_storm', name: 'Soul Storm', description: 'Summons a devastating storm of soul fragments that damages all enemies in a wide area and heals allies.', cooldown: 40, power: 70, element: 'soul', soulCost: 35 },
  { id: 'pact_override', name: 'Pact Override', description: 'Overrides an enemy\'s existing pacts, temporarily redirecting the loyalty of their bound demons.', cooldown: 50, power: 65, element: 'pact', soulCost: 30 },
  { id: 'hellfire_pillar', name: 'Hellfire Pillar', description: 'Summons a pillar of concentrated hellfire from the ground that burns continuously for ten seconds.', cooldown: 35, power: 75, element: 'flame', soulCost: 32 },
  { id: 'dimensional_rift', name: 'Dimensional Rift', description: 'Tears open a rift between dimensions, allowing void creatures to pour through and attack enemies.', cooldown: 45, power: 68, element: 'void', soulCost: 28 },
  { id: 'shadow_domain', name: 'Shadow Domain', description: 'Creates a zone of absolute darkness where the caster has total awareness and enemies are blinded.', cooldown: 40, power: 60, element: 'shadow', soulCost: 25 },

  // Epic (5)
  { id: 'soul_apocalypse', name: 'Soul Apocalypse', description: 'Detonates all collected soul energy in a catastrophic explosion that destroys everything in a massive radius.', cooldown: 120, power: 150, element: 'soul', soulCost: 80 },
  { id: 'cosmic_pact', name: 'Cosmic Pact', description: 'Forges a temporary pact with the fundamental forces of the universe, granting godlike power for thirty seconds.', cooldown: 180, power: 200, element: 'pact', soulCost: 100 },
  { id: 'star_forge_conflagration', name: 'Star Forge Conflagration', description: 'Channels the energy of a dying star, creating a conflagration that can melt through any defense.', cooldown: 90, power: 160, element: 'flame', soulCost: 75 },
  { id: 'abyssal_consumption', name: 'Abyssal Consumption', description: 'Opens a gateway to the Abyss that consumes everything in its path, including space itself.', cooldown: 100, power: 180, element: 'void', soulCost: 90 },
  { id: 'eternal_shadow', name: 'Eternal Shadow', description: 'Transforms the caster into pure shadow for a duration, making them invulnerable but unable to interact with physical objects.', cooldown: 120, power: 140, element: 'shadow', soulCost: 70 },

  // Legendary (4)
  { id: 'primordial_harvest', name: 'Primordial Harvest', description: 'The ultimate soul reaper ability: harvests the souls of every enemy on the battlefield simultaneously, adding them to your collection.', cooldown: 300, power: 500, element: 'soul', soulCost: 200 },
  { id: 'pact_of_ages', name: 'Pact of Ages', description: 'Rewrites the fundamental contract of reality in a localized area, allowing the caster to temporarily alter the laws of nature.', cooldown: 600, power: 800, element: 'pact', soulCost: 300 },
  { id: 'reality_ignition', name: 'Reality Ignition', description: 'Sets the fabric of reality itself on fire, creating a conflagration that burns concepts and abstractions as easily as physical matter.', cooldown: 300, power: 600, element: 'flame', soulCost: 250 },
  { id: 'the_final_word', name: 'The Final Word', description: 'Speaks a word in the language of creation that unconditionally ends any single conflict, battle, or confrontation.', cooldown: 900, power: 1000, element: 'contract', soulCost: 500 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: NP_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const NP_ACHIEVEMENTS: readonly NPAchievementDef[] = [
  { id: 'first_pact', name: 'First Binding', description: 'Bind your first soul pact with a demon', condition: 'Bind 1 demon', reward: '+50 soul power', icon: '⛓️' },
  { id: 'five_pacts', name: 'Soul Collector', description: 'Bind five demons to your service', condition: 'Bind 5 demons', reward: '+200 soul power', icon: '👻' },
  { id: 'fifteen_pacts', name: 'Demon Lord', description: 'Bind fifteen demons to your service', condition: 'Bind 15 demons', reward: '+500 soul power', icon: '👹' },
  { id: 'thirty_five_pacts', name: 'Nether Overlord', description: 'Bind all thirty-five known demons', condition: 'Bind 35 demons', reward: '+2000 soul power', icon: '👑' },
  { id: 'first_seal', name: 'Circle Sealed', description: 'Seal your first nether circle', condition: 'Seal 1 circle', reward: '+100 gold', icon: '⭕' },
  { id: 'four_seals', name: 'Realm Expander', description: 'Seal four nether circles', condition: 'Seal 4 circles', reward: '+500 gold', icon: '⭕' },
  { id: 'eight_seals', name: 'Domain Master', description: 'Seal all eight nether circles', condition: 'Seal 8 circles', reward: '+3000 gold', icon: '🌐' },
  { id: 'first_forge', name: 'Soul Smith', description: 'Forge your first artifact', condition: 'Forge 1 artifact', reward: '+200 soul power', icon: '⚒️' },
  { id: 'five_forges', name: 'Master Forger', description: 'Forge five artifacts', condition: 'Forge 5 artifacts', reward: '+1000 soul power', icon: '🔨' },
  { id: 'first_artifact', name: 'Legendary Find', description: 'Forge your first legendary artifact', condition: 'Forge 1 legendary artifact', reward: '+5000 gold', icon: '⭐' },
  { id: 'ten_abilities', name: 'Pact Scholar', description: 'Unlock ten pact abilities', condition: 'Unlock 10 abilities', reward: '+300 soul power', icon: '📖' },
  { id: 'all_abilities', name: 'Master of Pacts', description: 'Unlock all twenty-two pact abilities', condition: 'Unlock 22 abilities', reward: '+2000 soul power', icon: '📚' },
  { id: 'level_ten', name: 'Dark Apprentice', description: 'Reach level 10', condition: 'Reach level 10', reward: '+500 gold', icon: '🌟' },
  { id: 'level_twenty_five', name: 'Shadow Master', description: 'Reach level 25', condition: 'Reach level 25', reward: '+2000 gold', icon: '💫' },
  { id: 'level_fifty', name: 'Nether Sovereign', description: 'Reach the maximum level', condition: 'Reach level 50', reward: '+10000 gold', icon: '👑' },
  { id: 'first_legendary_demon', name: 'Mythic Summoner', description: 'Summon your first legendary demon', condition: 'Summon 1 legendary', reward: '+3000 soul power', icon: '🔥' },
  { id: 'hundred_pacts_completed', name: 'Centurion of Pacts', description: 'Complete one hundred pacts', condition: '100 pacts completed', reward: '+5000 soul power', icon: '💯' },
  { id: 'all_structures_max', name: 'Architect of Darkness', description: 'Upgrade all structures to maximum level', condition: 'All structures at level 10', reward: '+8000 gold', icon: '🏰' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: NP_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const NP_TITLES: readonly NPTitleDef[] = [
  { id: 'soul_apprentice', name: 'Soul Apprentice', description: 'A novice who has taken the first step into the world of soul-binding pacts. The shadows watch with curiosity.', requiredLevel: 1, requiredPacts: 0 },
  { id: 'shadow_initiate', name: 'Shadow Initiate', description: 'One who has begun to understand the language of shadows and the weight of promises.', requiredLevel: 5, requiredPacts: 2 },
  { id: 'pact_weaver', name: 'Pact Weaver', description: 'A skilled negotiator who can craft contracts that bind both mortal and demon alike.', requiredLevel: 12, requiredPacts: 5 },
  { id: 'demon_binder', name: 'Demon Binder', description: 'A feared figure who has bound enough demons to command a small army of the damned.', requiredLevel: 20, requiredPacts: 10 },
  { id: 'soul_reaper', name: 'Soul Reaper', description: 'A harvester of souls who walks the line between life and death with practiced ease.', requiredLevel: 28, requiredPacts: 15 },
  { id: 'shadow_lord', name: 'Shadow Lord', description: 'Master of all shadows in the Nether, commanding darkness as easily as generals command soldiers.', requiredLevel: 35, requiredPacts: 20 },
  { id: 'nether_sovereign', name: 'Nether Sovereign', description: 'The supreme ruler of the Nether realm, commanding all demons, all pacts, and all souls within its domain.', requiredLevel: 42, requiredPacts: 28 },
  { id: 'darkness_incarnate', name: 'Darkness Incarnate', description: 'The ultimate title — one who has become the very concept of darkness given form. All bow before them.', requiredLevel: 50, requiredPacts: 35 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: NP_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const NP_ARTIFACTS: readonly NPArtifactDef[] = [
  { id: 'scythe_shadows', name: 'Scythe of Shadows', description: 'A scythe forged from condensed shadow that cuts through the boundary between dimensions with each swing.', rarity: 'rare', powerBonus: 45, specialAbility: 'Dimensional Cut', forgeCost: 500 },
  { id: 'crown_souls', name: 'Crown of Souls', description: 'A crown made from the crystallized souls of a thousand warriors. Each soul whispers the battle cry of its former owner.', rarity: 'epic', powerBonus: 80, specialAbility: 'Soul Army Summon', forgeCost: 1500 },
  { id: 'robe_pacts', name: 'Robe of a Thousand Pacts', description: 'A robe woven from the parchment of a thousand fulfilled contracts. It grants immunity to all pact-breaking penalties.', rarity: 'epic', powerBonus: 65, specialAbility: 'Contract Immunity', forgeCost: 1200 },
  { id: 'chalice_damned', name: 'Chalice of the Damned', description: 'A chalice that converts any liquid poured into it into soul essence. The souls of the damned stir within its depths.', rarity: 'rare', powerBonus: 35, specialAbility: 'Soul Conversion', forgeCost: 400 },
  { id: 'ring_void', name: 'Ring of the Void', description: 'A ring that creates a small void space around the wearer, protecting them from all physical and magical attacks.', rarity: 'epic', powerBonus: 55, specialAbility: 'Void Shield', forgeCost: 1000 },
  { id: 'amulet_shadows', name: 'Amulet of Living Shadows', description: 'An amulet containing a captured shadow that protects its wearer by absorbing all incoming damage.', rarity: 'rare', powerBonus: 30, specialAbility: 'Shadow Absorb', forgeCost: 350 },
  { id: 'blade_contracts', name: 'Blade of Broken Contracts', description: 'A sword forged from the shattered remnants of a thousand broken pacts. Each fragment adds to its cutting power.', rarity: 'epic', powerBonus: 75, specialAbility: 'Pact Shatter Strike', forgeCost: 1400 },
  { id: 'tome_secrets', name: 'Tome of Forbidden Secrets', description: 'A tome that contains every secret ever kept and every lie ever told. Reading it grants temporary omniscience.', rarity: 'legendary', powerBonus: 150, specialAbility: 'Temporary Omniscience', forgeCost: 5000 },
  { id: 'staff_nether', name: 'Staff of the Nether', description: 'A staff carved from petrified bone of the Nether\'s first demon. It channels pure demonic energy and commands lesser demons.', rarity: 'legendary', powerBonus: 180, specialAbility: 'Demon Command', forgeCost: 6000 },
  { id: 'mirror_truth', name: 'Mirror of Absolute Truth', description: 'A mirror that reveals the true nature of anything reflected in it, including hidden identities, disguised demons, and secret intentions.', rarity: 'epic', powerBonus: 60, specialAbility: 'True Sight', forgeCost: 1100 },
  { id: 'gauntlets_soulfire', name: 'Gauntlets of Soulfire', description: 'Gauntlets wreathed in perpetual soulfire that enhances the wearer\'s strength and allows them to strike incorporeal beings.', rarity: 'rare', powerBonus: 40, specialAbility: 'Incorporeal Strike', forgeCost: 450 },
  { id: 'boots_void', name: 'Boots of the Void Walker', description: 'Boots that allow the wearer to walk through void rifts as easily as walking through doorways.', rarity: 'epic', powerBonus: 50, specialAbility: 'Void Walking', forgeCost: 900 },
  { id: 'crown_flames', name: 'Crown of Eternal Flames', description: 'A crown that burns with an eternal fire that never extinguishes. It grants control over all flame in a mile radius.', rarity: 'legendary', powerBonus: 160, specialAbility: 'Flame Dominion', forgeCost: 5500 },
  { id: 'pendant_fate', name: 'Pendant of Fractured Fate', description: 'A pendant containing a fragment of shattered destiny. It allows the wearer to briefly glimpse possible futures.', rarity: 'legendary', powerBonus: 140, specialAbility: 'Future Sight', forgeCost: 4500 },
  { id: 'orb_abyss', name: 'Orb of the Infinite Abyss', description: 'An orb that contains a perfect recreation of the Abyss within its surface. Gazing into it grants power but slowly consumes the viewer\'s sanity.', rarity: 'legendary', powerBonus: 200, specialAbility: 'Abyssal Power', forgeCost: 7000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: NP_EVENTS — 12 Nether Events
// ═══════════════════════════════════════════════════════════════════

export const NP_EVENTS: readonly NPEventDef[] = [
  { id: 'soul_surge', name: 'Soul Surge', description: 'A massive wave of souls floods the Nether from the mortal world, temporarily doubling all soul extraction rates.', severity: 3, duration: 300, effects: ['2x soul extraction', '+50% soul crystal drops', 'Soul Gate overflows'], element: 'soul' },
  { id: 'pact_rebellion', name: 'Pact Rebellion', description: 'A faction of bound demons rebels against their contracts, requiring immediate re-negotiation or forceful suppression.', severity: 7, duration: 600, effects: ['Random demon unbinding attempts', '-20% pact success', 'Emergency renegotiation required'], element: 'pact' },
  { id: 'hellfire_eruption', name: 'Hellfire Eruption', description: 'The Demon Forge erupts with uncontrolled hellfire, threatening to consume nearby structures and demons.', severity: 5, duration: 180, effects: ['Hellfire damage to structures', '+100% flame material output', 'Forge shutdown risk'], element: 'flame' },
  { id: 'void_rift_opening', name: 'Void Rift Opening', description: 'A massive void rift tears open near the Blood Circle, releasing unknown creatures and materials from beyond.', severity: 6, duration: 480, effects: ['Random void creature spawns', 'Rare void material drops', 'Dimensional instability'], element: 'void' },
  { id: 'shadow_eclipse', name: 'Shadow Eclipse', description: 'The Shadow King extends its domain, plunging the entire Nether into total darkness for a limited time.', severity: 4, duration: 360, effects: ['All areas darkened', '+50% shadow demon power', '-30% flame demon power'], element: 'shadow' },
  { id: 'contract_surge', name: 'Contract Surge', description: 'The Contract Hall experiences a surge of new pact requests from mortals seeking dark deals.', severity: 2, duration: 240, effects: ['2x pact scroll production', '+30% gold income', 'Increased mortal visitors'], element: 'contract' },
  { id: 'demon_migration', name: 'Demon Migration', description: 'A massive migration of demons passes through the Nether, bringing rare species and opportunities.', severity: 3, duration: 300, effects: ['Rare demon encounters', '+40% summoning success', 'Temporary species diversity'], element: 'soul' },
  { id: 'blood_moon_rising', name: 'Blood Moon Rising', description: 'A blood moon rises over the Nether, amplifying all dark magic and causing demons to become more aggressive.', severity: 5, duration: 420, effects: ['+50% all demon power', 'Increased demon aggression', 'Legendary summon chance'], element: 'pact' },
  { id: 'ink_tide', name: 'Ink Tide', description: 'The wells of the damned overflow, flooding the Contract Hall with enchanted ink that causes random magical effects.', severity: 4, duration: 360, effects: ['Random ink-based effects', '+60% ink production', 'Unpredictable enchantments'], element: 'ink' },
  { id: 'abyssal_whisper', name: 'Abyssal Whisper', description: 'Whispers from the Abyss reach the surface, granting forbidden knowledge but slowly corrupting all who listen.', severity: 8, duration: 600, effects: ['Forbidden knowledge gained', 'Corruption increases', 'Temporary ability unlocks'], element: 'void' },
  { id: 'shadow_court_gathering', name: 'Shadow Court Gathering', description: 'The Shadow Court convenes for a rare session, during which secret deals and power plays occur.', severity: 6, duration: 480, effects: ['Exclusive deals available', 'Shadow broker missions', 'Political intrigue events'], element: 'shadow' },
  { id: 'nether_convergence', name: 'Nether Convergence', description: 'All eight circles align, creating a convergence of power that unlocks legendary opportunities and threats.', severity: 9, duration: 900, effects: ['All circle bonuses doubled', 'Legendary demon chance +500%', 'Ultimate artifact forging unlocked'], element: 'soul' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: SPECIES BONUSES & PACT CHANCES
// ═══════════════════════════════════════════════════════════════════

const NP_SPECIES_BONUSES: Record<NPSpecies, { attack: number; defense: number; soulBonus: number }> = {
  soul_reaper: { attack: 15, defense: 5, soulBonus: 12 },
  pact_demon: { attack: 8, defense: 12, soulBonus: 8 },
  contract_wraith: { attack: 10, defense: 18, soulBonus: 5 },
  flame_imp: { attack: 22, defense: 4, soulBonus: 6 },
  void_hound: { attack: 20, defense: 6, soulBonus: 10 },
  shadow_broker: { attack: 6, defense: 8, soulBonus: 15 },
  hell_scribe: { attack: 4, defense: 14, soulBonus: 14 },
}

const NP_SUMMON_CHANCES: Record<NPRarity, number> = {
  common: 55,
  uncommon: 25,
  rare: 12,
  epic: 6,
  legendary: 2,
}

const NP_CIRCLE_SPECIES_BONUS: Record<string, NPSpecies[]> = {
  soul_gate: ['soul_reaper', 'contract_wraith'],
  pact_arena: ['pact_demon', 'shadow_broker'],
  demon_forge: ['flame_imp', 'hell_scribe'],
  contract_hall: ['pact_demon', 'contract_wraith', 'hell_scribe'],
  seal_chamber: ['contract_wraith', 'soul_reaper'],
  blood_circle: ['void_hound', 'soul_reaper'],
  shadow_court: ['shadow_broker', 'void_hound'],
  nether_throne: ['soul_reaper', 'pact_demon', 'contract_wraith', 'flame_imp', 'void_hound', 'shadow_broker', 'hell_scribe'],
}

function npGetSpeciesBonus(species: NPSpecies): { attack: number; defense: number; soulBonus: number } {
  return NP_SPECIES_BONUSES[species]
}

function npGetSummonChance(rarity: NPRarity, activeCircleId: string | null): number {
  let chance = NP_SUMMON_CHANCES[rarity]
  if (activeCircleId) {
    const bonusSpecies = NP_CIRCLE_SPECIES_BONUS[activeCircleId]
    if (bonusSpecies && bonusSpecies.length > 3) {
      chance = chance * 1.5
    }
  }
  return Math.min(100, Math.floor(chance))
}

function npGetStructureBonus(structureId: string, level: number): number {
  switch (structureId) {
    case 'soul_summoning_altar': return level * 3
    case 'pact_binding_circle': return level * 5
    case 'void_summoning_gate': return level * 8
    case 'shadow_calling_bell': return level * 7
    case 'nether_summoning_throne': return level * 15
    case 'soul_well': return level * 4
    case 'pact_desk': return level * 2
    case 'ash_condenser': return level * 3
    case 'shadow_distillery': return level * 6
    case 'ink_press': return level * 5
    default: return level * 2
  }
}

function npGetDemonPower(demon: NPDemonDef, level: number): number {
  const speciesBonus = npGetSpeciesBonus(demon.species)
  return Math.floor(demon.soulPower * (1 + level * 0.15) * (1 + speciesBonus.soulBonus / 100))
}

function npGetUpgradeCost(structure: NPStructureDef, currentLevel: number): number {
  return Math.floor(structure.baseCost * Math.pow(structure.costMultiplier, currentLevel))
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const NP_STORE_KEY = 'nether-pact-wire'

const initialNPState: NPStoreState = {
  npLevel: 1,
  npSoulPower: NP_INITIAL_SOUL_POWER,
  npPactsBound: 0,
  npBoundDemons: [],
  npSealedCircles: ['soul_gate'],
  npCollectedMaterials: {},
  npStructures: [],
  npUnlockedAbilities: ['soul_siphon'],
  npCompletedAchievements: [],
  npActiveTitle: 'soul_apprentice',
  npForgedArtifacts: [],
  npTotalDemonsSummoned: 0,
  npTotalPactsCompleted: 0,
  npTotalStructuresUpgraded: 0,
  npTotalArtifactsForged: 0,
  npTotalSoulPowerEarned: 0,
  npActiveEventId: null,
  npEventTimer: 0,
  npGold: NP_INITIAL_GOLD,
  npSoulFragments: NP_INITIAL_SOUL_FRAGMENTS,
  npActiveCircleId: 'soul_gate',
}

export const useNetherPactStore = create<NPFullStore>()(
  persist(
    (set, get) => ({
      ...initialNPState,

      npBindPact: (demonId: string): boolean => {
        const state = get()
        const demonDef = NP_DEMONS.find((d) => d.id === demonId)
        if (!demonDef) return false
        if (state.npSoulPower < demonDef.pactCost) return false
        if (state.npBoundDemons.some((bd) => bd.demonDefId === demonId)) return false

        const newBoundDemon: NPBoundDemon = {
          id: npGenerateId(),
          demonDefId: demonId,
          name: demonDef.name,
          level: 1,
          currentHP: demonDef.stats.hp,
          maxHP: demonDef.stats.hp,
          power: demonDef.soulPower,
          boundAt: Date.now(),
          pactsCompleted: 0,
        }

        set({
          npBoundDemons: [...state.npBoundDemons, newBoundDemon],
          npSoulPower: state.npSoulPower - demonDef.pactCost,
          npPactsBound: state.npPactsBound + 1,
          npTotalDemonsSummoned: state.npTotalDemonsSummoned + 1,
          npGold: state.npGold + Math.floor(demonDef.soulPower * npRarityMultiplier(demonDef.rarity)),
        })
        return true
      },

      npSummonDemon: (demonId: string): boolean => {
        const state = get()
        const demonDef = NP_DEMONS.find((d) => d.id === demonId)
        if (!demonDef) return false
        const cost = Math.floor(demonDef.pactCost * npRarityMultiplier(demonDef.rarity))
        if (state.npSoulPower < cost) return false

        const newBoundDemon: NPBoundDemon = {
          id: npGenerateId(),
          demonDefId: demonId,
          name: demonDef.name,
          level: 1,
          currentHP: demonDef.stats.hp,
          maxHP: demonDef.stats.hp,
          power: npGetDemonPower(demonDef, 1),
          boundAt: Date.now(),
          pactsCompleted: 0,
        }

        set({
          npBoundDemons: [...state.npBoundDemons, newBoundDemon],
          npSoulPower: state.npSoulPower - cost,
          npPactsBound: state.npPactsBound + 1,
          npTotalDemonsSummoned: state.npTotalDemonsSummoned + 1,
        })
        return true
      },

      npSealCircle: (circleId: string): boolean => {
        const state = get()
        const circle = NP_CIRCLES.find((c) => c.id === circleId)
        if (!circle) return false
        if (state.npSealedCircles.includes(circleId)) return false
        if (state.npLevel < circle.minLevel) return false
        if (state.npGold < circle.unlockCost) return false

        set({
          npSealedCircles: [...state.npSealedCircles, circleId],
          npGold: state.npGold - circle.unlockCost,
        })
        return true
      },

      npSoulForge: (artifactId: string): boolean => {
        const state = get()
        const artifact = NP_ARTIFACTS.find((a) => a.id === artifactId)
        if (!artifact) return false
        if (state.npForgedArtifacts.includes(artifactId)) return false
        if (state.npGold < artifact.forgeCost) return false

        set({
          npForgedArtifacts: [...state.npForgedArtifacts, artifactId],
          npGold: state.npGold - artifact.forgeCost,
          npTotalArtifactsForged: state.npTotalArtifactsForged + 1,
          npTotalSoulPowerEarned: state.npTotalSoulPowerEarned + artifact.powerBonus,
        })
        return true
      },

      npUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structureDef = NP_STRUCTURES.find((s) => s.id === structureId)
        if (!structureDef) return false

        const existing = state.npStructures.find((s) => s.structureDefId === structureId)
        const currentLevel = existing ? existing.level : 0
        if (currentLevel >= structureDef.maxLevel) return false

        const cost = npGetUpgradeCost(structureDef, currentLevel)
        if (state.npGold < cost) return false

        if (existing) {
          set({
            npStructures: state.npStructures.map((s) =>
              s.structureDefId === structureId ? { ...s, level: s.level + 1 } : s
            ),
            npGold: state.npGold - cost,
            npTotalStructuresUpgraded: state.npTotalStructuresUpgraded + 1,
          })
        } else {
          const newStructure: NPOwnedStructure = {
            id: npGenerateId(),
            structureDefId: structureId,
            level: 1,
            built: true,
          }
          set({
            npStructures: [...state.npStructures, newStructure],
            npGold: state.npGold - cost,
            npTotalStructuresUpgraded: state.npTotalStructuresUpgraded + 1,
          })
        }
        return true
      },

      npUnlockAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = NP_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (state.npUnlockedAbilities.includes(abilityId)) return false
        if (state.npSoulPower < ability.soulCost * 10) return false

        set({
          npUnlockedAbilities: [...state.npUnlockedAbilities, abilityId],
          npSoulPower: state.npSoulPower - Math.floor(ability.soulCost * 10),
        })
        return true
      },

      npClaimAchievement: (achievementId: string): boolean => {
        const state = get()
        const achievement = NP_ACHIEVEMENTS.find((a) => a.id === achievementId)
        if (!achievement) return false
        if (state.npCompletedAchievements.includes(achievementId)) return false

        set({
          npCompletedAchievements: [...state.npCompletedAchievements, achievementId],
          npGold: state.npGold + 200,
          npSoulPower: state.npSoulPower + 50,
        })
        return true
      },

      npSetTitle: (titleId: string): boolean => {
        const state = get()
        const title = NP_TITLES.find((t) => t.id === titleId)
        if (!title) return false
        if (state.npLevel < title.requiredLevel) return false
        if (state.npPactsBound < title.requiredPacts) return false

        set({ npActiveTitle: titleId })
        return true
      },

      npCollectMaterial: (materialId: string, amount: number): number => {
        const state = get()
        const material = NP_MATERIALS.find((m) => m.id === materialId)
        if (!material) return 0

        const current = state.npCollectedMaterials[materialId] ?? 0
        const gained = amount
        set({
          npCollectedMaterials: {
            ...state.npCollectedMaterials,
            [materialId]: current + gained,
          },
          npSoulFragments: state.npSoulFragments + Math.floor(amount * material.value * 0.1),
        })
        return gained
      },

      npTriggerEvent: (eventId: string): boolean => {
        const state = get()
        const event = NP_EVENTS.find((e) => e.id === eventId)
        if (!event) return false
        if (state.npActiveEventId !== null) return false

        set({
          npActiveEventId: eventId,
          npEventTimer: event.duration,
        })
        return true
      },

      npFeedDemon: (boundDemonId: string): boolean => {
        const state = get()
        const demon = state.npBoundDemons.find((d) => d.id === boundDemonId)
        if (!demon) return false
        if (state.npSoulPower < 10) return false

        const newLevel = demon.level + 1
        const demonDef = NP_DEMONS.find((d) => d.id === demon.demonDefId)
        if (!demonDef) return false

        const newPower = npGetDemonPower(demonDef, newLevel)
        const newMaxHP = Math.floor(demonDef.stats.hp * (1 + newLevel * 0.2))

        set({
          npBoundDemons: state.npBoundDemons.map((d) =>
            d.id === boundDemonId
              ? { ...d, level: newLevel, power: newPower, maxHP: newMaxHP, currentHP: newMaxHP }
              : d
          ),
          npSoulPower: state.npSoulPower - 10,
        })
        return true
      },

      npSacrificeDemon: (boundDemonId: string): boolean => {
        const state = get()
        const demon = state.npBoundDemons.find((d) => d.id === boundDemonId)
        if (!demon) return false

        const soulRefund = Math.floor(demon.power * 0.5)
        set({
          npBoundDemons: state.npBoundDemons.filter((d) => d.id !== boundDemonId),
          npSoulPower: state.npSoulPower + soulRefund,
          npPactsBound: Math.max(0, state.npPactsBound - 1),
          npTotalPactsCompleted: state.npTotalPactsCompleted + demon.pactsCompleted + 1,
        })
        return true
      },
    }),
    {
      name: NP_STORE_KEY,
      partialize: (state) => ({
        npLevel: state.npLevel,
        npSoulPower: state.npSoulPower,
        npPactsBound: state.npPactsBound,
        npBoundDemons: state.npBoundDemons,
        npSealedCircles: state.npSealedCircles,
        npCollectedMaterials: state.npCollectedMaterials,
        npStructures: state.npStructures,
        npUnlockedAbilities: state.npUnlockedAbilities,
        npCompletedAchievements: state.npCompletedAchievements,
        npActiveTitle: state.npActiveTitle,
        npForgedArtifacts: state.npForgedArtifacts,
        npTotalDemonsSummoned: state.npTotalDemonsSummoned,
        npTotalPactsCompleted: state.npTotalPactsCompleted,
        npTotalStructuresUpgraded: state.npTotalStructuresUpgraded,
        npTotalArtifactsForged: state.npTotalArtifactsForged,
        npTotalSoulPowerEarned: state.npTotalSoulPowerEarned,
        npActiveEventId: state.npActiveEventId,
        npEventTimer: state.npEventTimer,
        npGold: state.npGold,
        npSoulFragments: state.npSoulFragments,
        npActiveCircleId: state.npActiveCircleId,
      }),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: THE HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useNetherPact() {
  const store = useNetherPactStore()
  const stateRef = useRef(store)

  // Sync ref on every store change
  useEffect(() => {
    stateRef.current = store
  }, [store])

  // Auto-tick event timer
  useEffect(() => {
    if (stateRef.current.npActiveEventId === null) return
    if (stateRef.current.npEventTimer <= 0) {
      if (store.npTriggerEvent === undefined) {
        // Event expired silently — in a real app we would dispatch end-event logic here
      }
      return
    }
    const interval = setInterval(() => {
      const current = stateRef.current
      if (current.npEventTimer > 0) {
        // We cannot mutate stateRef directly; only via store actions
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [store.npActiveEventId, store.npEventTimer, store])

  // ── Getter: Level Progress ────────────────────────────────────
  const npLevelProgress = useMemo(() => {
    const currentLevel = store.npLevel
    if (currentLevel >= NP_MAX_LEVEL) return { progress: 1, xpForNext: 0, xpCurrent: 0 }
    const needed = npXpForLevel(currentLevel)
    return {
      progress: store.npSoulPower / needed,
      xpForNext: needed,
      xpCurrent: store.npSoulPower,
    }
  }, [store])

  // ── Getter: Total Power ───────────────────────────────────────
  const npTotalPower = useMemo(() => {
    const demonPower = store.npBoundDemons.reduce((sum, d) => sum + d.power, 0)
    const artifactPower = store.npForgedArtifacts.reduce((sum, aId) => {
      const artifact = NP_ARTIFACTS.find((a) => a.id === aId)
      return sum + (artifact ? artifact.powerBonus : 0)
    }, 0)
    const structurePower = store.npStructures.reduce((sum, s) => {
      return sum + npGetStructureBonus(s.structureDefId, s.level)
    }, 0)
    return {
      demonPower,
      artifactPower,
      structurePower,
      totalPower: demonPower + artifactPower + structurePower,
    }
  }, [store])

  // ── Getter: Demon Count by Species ────────────────────────────
  const npGetDemonCountBySpecies = useMemo(() => {
    return (Object.keys(NP_SPECIES_BONUSES) as NPSpecies[]).map((species) => {
      const demons = store.npBoundDemons.filter((d) => {
        const def = NP_DEMONS.find((dd) => dd.id === d.demonDefId)
        return def && def.species === species
      })
      return {
        species,
        color: npSpeciesColor(species),
        count: demons.length,
        totalPower: demons.reduce((s, d) => s + d.power, 0),
      }
    })
  }, [store])

  // ── Getter: Rarity Summary ───────────────────────────────────
  const npGetRaritySummary = useMemo(() => {
    const summary = (['common', 'uncommon', 'rare', 'epic', 'legendary'] as NPRarity[]).map((rarity) => {
      const demons = store.npBoundDemons.filter((d) => {
        const def = NP_DEMONS.find((dd) => dd.id === d.demonDefId)
        return def && def.rarity === rarity
      })
      return {
        rarity,
        color: npRarityColor(rarity),
        count: demons.length,
        totalPower: demons.reduce((s, d) => s + d.power, 0),
      }
    })
    return summary
  }, [store])

  // ── Getter: Circle Details ────────────────────────────────────
  const npGetCircleDetails = useMemo(() => {
    return NP_CIRCLES.map((circle) => ({
      ...circle,
      isSealed: store.npSealedCircles.includes(circle.id),
      isActive: store.npActiveCircleId === circle.id,
      canSeal: store.npLevel >= circle.minLevel && store.npGold >= circle.unlockCost && !store.npSealedCircles.includes(circle.id),
      elementColor: npElementColor(circle.element),
    }))
  }, [store])

  // ── Getter: Material Inventory ────────────────────────────────
  const npGetMaterialInventory = useMemo(() => {
    return NP_MATERIALS.map((mat) => ({
      ...mat,
      owned: store.npCollectedMaterials[mat.id] ?? 0,
      categoryColor: mat.category === 'soul' ? NP_COLOR_SOUL_PURPLE
        : mat.category === 'pact' ? NP_COLOR_PACT_GOLD
        : mat.category === 'flame' ? NP_COLOR_DEMON_RED
        : mat.category === 'void' ? NP_COLOR_VOID_INDIGO
        : mat.category === 'shadow' ? NP_COLOR_SHADOW_GRAY
        : NP_COLOR_INK_CERULEAN,
    }))
  }, [store])

  // ── Getter: Structure List ───────────────────────────────────
  const npGetStructureList = useMemo(() => {
    return NP_STRUCTURES.map((structureDef) => {
      const owned = store.npStructures.find((s) => s.structureDefId === structureDef.id)
      const currentLevel = owned ? owned.level : 0
      const isMaxed = currentLevel >= structureDef.maxLevel
      const upgradeCost = isMaxed ? 0 : npGetUpgradeCost(structureDef, currentLevel)
      return {
        ...structureDef,
        currentLevel,
        isMaxed,
        upgradeCost,
        bonus: npGetStructureBonus(structureDef.id, currentLevel),
        canUpgrade: !isMaxed && store.npGold >= upgradeCost,
        isBuilt: !!owned,
      }
    })
  }, [store])

  // ── Getter: Active Event ──────────────────────────────────────
  const npGetActiveEvent = useMemo(() => {
    if (!store.npActiveEventId) return null
    return NP_EVENTS.find((e) => e.id === store.npActiveEventId) ?? null
  }, [store])

  // ── Getter: Achievement List ──────────────────────────────────
  const npGetAchievementList = useMemo(() => {
    return NP_ACHIEVEMENTS.map((ach) => ({
      ...ach,
      completed: store.npCompletedAchievements.includes(ach.id),
    }))
  }, [store])

  // ── Getter: Title Progress ────────────────────────────────────
  const npGetTitleProgress = useMemo(() => {
    return NP_TITLES.map((title) => ({
      ...title,
      isActive: store.npActiveTitle === title.id,
      levelMet: store.npLevel >= title.requiredLevel,
      pactsMet: store.npPactsBound >= title.requiredPacts,
      canEquip: store.npLevel >= title.requiredLevel && store.npPactsBound >= title.requiredPacts,
    }))
  }, [store])

  // ── Getter: Artifact List ─────────────────────────────────────
  const npGetArtifactList = useMemo(() => {
    return NP_ARTIFACTS.map((art) => ({
      ...art,
      isForged: store.npForgedArtifacts.includes(art.id),
      canForge: !store.npForgedArtifacts.includes(art.id) && store.npGold >= art.forgeCost,
    }))
  }, [store])

  // ── Getter: Bound Demon Details ───────────────────────────────
  const npGetBoundDemons = useMemo(() => {
    return store.npBoundDemons.map((bd) => {
      const def = NP_DEMONS.find((d) => d.id === bd.demonDefId)
      const speciesDef = def ? NP_SPECIES.find((s) => s.id === def.species) : null
      return {
        ...bd,
        demonDef: def,
        speciesDef,
        speciesColor: def ? npSpeciesColor(def.species) : '#888888',
        rarityColor: def ? npRarityColor(def.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Getter: Ability List ──────────────────────────────────────
  const npGetAbilityList = useMemo(() => {
    return NP_ABILITIES.map((ability) => ({
      ...ability,
      isUnlocked: store.npUnlockedAbilities.includes(ability.id),
      canUnlock: !store.npUnlockedAbilities.includes(ability.id) && store.npSoulPower >= ability.soulCost * 10,
      elementColor: npElementColor(ability.element),
    }))
  }, [store])

  // ── Getter: Summon Chances ────────────────────────────────────
  const npGetSummonChances = useMemo(() => {
    const chances: Record<NPRarity, number> = {
      common: npGetSummonChance('common', store.npActiveCircleId),
      uncommon: npGetSummonChance('uncommon', store.npActiveCircleId),
      rare: npGetSummonChance('rare', store.npActiveCircleId),
      epic: npGetSummonChance('epic', store.npActiveCircleId),
      legendary: npGetSummonChance('legendary', store.npActiveCircleId),
    }
    return chances
  }, [store])

  // ── Getter: Stats Summary ─────────────────────────────────────
  const npGetStatsSummary = useMemo(() => {
    const totalArtifacts = store.npForgedArtifacts.length
    const hasLegendaryArtifact = store.npForgedArtifacts.some((aId) => {
      const art = NP_ARTIFACTS.find((a) => a.id === aId)
      return art && art.rarity === 'legendary'
    })
    const totalMaterialCount = Object.values(store.npCollectedMaterials).reduce((s, v) => s + v, 0)
    return {
      totalDemons: store.npBoundDemons.length,
      totalCircles: store.npSealedCircles.length,
      totalAbilities: store.npUnlockedAbilities.length,
      totalAchievements: store.npCompletedAchievements.length,
      totalArtifacts,
      hasLegendaryArtifact,
      totalStructures: store.npStructures.length,
      totalMaterialCount,
      totalSoulFragments: store.npSoulFragments,
    }
  }, [store])

  // ── Getter: Upgrade Costs ─────────────────────────────────────
  const npGetUpgradeCosts = useMemo(() => {
    return NP_STRUCTURES.map((s) => {
      const owned = store.npStructures.find((os) => os.structureDefId === s.id)
      const level = owned ? owned.level : 0
      return {
        structureId: s.id,
        name: s.name,
        currentLevel: level,
        cost: npGetUpgradeCost(s, level),
      }
    })
  }, [store])

  // ── Getter: Circle Power Breakdown ────────────────────────────
  const npGetCirclePowerBreakdown = useMemo(() => {
    const demonPower = store.npBoundDemons.reduce((s, d) => s + d.power, 0)
    const artifactPower = store.npForgedArtifacts.reduce((s, aId) => {
      const art = NP_ARTIFACTS.find((a) => a.id === aId)
      return s + (art ? art.powerBonus : 0)
    }, 0)
    const structurePower = store.npStructures.reduce((s, st) => {
      return s + npGetStructureBonus(st.structureDefId, st.level)
    }, 0)
    const totalPower = demonPower + artifactPower + structurePower + store.npSoulPower
    return {
      demonPower,
      artifactPower,
      structurePower,
      soulPower: store.npSoulPower,
      totalPower,
      demonPercent: totalPower > 0 ? Math.floor((demonPower / totalPower) * 100) : 0,
      artifactPercent: totalPower > 0 ? Math.floor((artifactPower / totalPower) * 100) : 0,
      structurePercent: totalPower > 0 ? Math.floor((structurePower / totalPower) * 100) : 0,
      soulPercent: totalPower > 0 ? Math.floor((store.npSoulPower / totalPower) * 100) : 0,
    }
  }, [store])

  // ── Getter: Embracing Costs ───────────────────────────────────
  const npGetBindingCosts = useMemo(() => {
    return NP_DEMONS.map((d) => ({
      demonId: d.id,
      name: d.name,
      rarity: d.rarity,
      rarityColor: npRarityColor(d.rarity),
      pactCost: d.pactCost,
      summonCost: Math.floor(d.pactCost * npRarityMultiplier(d.rarity)),
      canAfford: store.npSoulPower >= d.pactCost,
      isBound: store.npBoundDemons.some((bd) => bd.demonDefId === d.id),
    }))
  }, [store])

  // ── Getter: Species Details ───────────────────────────────────
  const npGetSpeciesDetails = useMemo(() => {
    return NP_SPECIES.map((species) => {
      const demons = store.npBoundDemons.filter((bd) => {
        const def = NP_DEMONS.find((d) => d.id === bd.demonDefId)
        return def && def.species === species.id
      })
      const bonus = npGetSpeciesBonus(species.id)
      return {
        ...species,
        boundCount: demons.length,
        totalPower: demons.reduce((s, d) => s + d.power, 0),
        bonus,
      }
    })
  }, [store])

  // ── Getter: Event List ────────────────────────────────────────
  const npGetEventList = useMemo(() => {
    return NP_EVENTS.map((event) => ({
      ...event,
      elementColor: npElementColor(event.element),
      isActive: store.npActiveEventId === event.id,
      canTrigger: store.npActiveEventId === null,
    }))
  }, [store])

  // ── Getter: Next Title ────────────────────────────────────────
  const npGetNextTitle = useMemo(() => {
    const currentIdx = NP_TITLES.findIndex((t) => t.id === store.npActiveTitle)
    if (currentIdx >= NP_TITLES.length - 1) return null
    const next = NP_TITLES[currentIdx + 1]
    return {
      ...next,
      levelProgress: store.npLevel - NP_TITLES[currentIdx].requiredLevel,
      pactsProgress: store.npPactsBound - NP_TITLES[currentIdx].requiredPacts,
      levelNeeded: next.requiredLevel,
      pactsNeeded: next.requiredPacts,
    }
  }, [store])

  // ── Getter: Coven Health Assessment ──────────────────────────
  const npGetCovenHealth = useMemo(() => {
    const demonCount = store.npBoundDemons.length
    const circleCount = store.npSealedCircles.length
    const artifactCount = store.npForgedArtifacts.length
    const structureCount = store.npStructures.length
    const abilityCount = store.npUnlockedAbilities.length
    const health = Math.floor((demonCount / 35) * 25 + (circleCount / 8) * 20 + (artifactCount / 15) * 20 + (structureCount / 25) * 15 + (abilityCount / 22) * 10 + (store.npLevel / NP_MAX_LEVEL) * 10)
    return {
      health: npClamp(health, 0, 100),
      demonCoverage: Math.floor((demonCount / 35) * 100),
      circleCoverage: Math.floor((circleCount / 8) * 100),
      artifactCoverage: Math.floor((artifactCount / 15) * 100),
      structureCoverage: Math.floor((structureCount / 25) * 100),
      abilityCoverage: Math.floor((abilityCount / 22) * 100),
      levelProgress: Math.floor((store.npLevel / NP_MAX_LEVEL) * 100),
      overallTier: health >= 90 ? 'S' : health >= 75 ? 'A' : health >= 55 ? 'B' : health >= 35 ? 'C' : health >= 15 ? 'D' : 'F',
    }
  }, [store])

  // ── Getter: Relic Bonus ────────────────────────────────────────
  const npGetArtifactBonus = useMemo(() => {
    const totalBonus = store.npForgedArtifacts.reduce((sum, aId) => {
      const art = NP_ARTIFACTS.find((a) => a.id === aId)
      return sum + (art ? art.powerBonus : 0)
    }, 0)
    const legendaryCount = store.npForgedArtifacts.filter((aId) => {
      const art = NP_ARTIFACTS.find((a) => a.id === aId)
      return art && art.rarity === 'legendary'
    }).length
    const epicCount = store.npForgedArtifacts.filter((aId) => {
      const art = NP_ARTIFACTS.find((a) => a.id === aId)
      return art && art.rarity === 'epic'
    }).length
    return { totalBonus, legendaryCount, epicCount, totalCount: store.npForgedArtifacts.length }
  }, [store])

  // ── Getter: Species Alignment Matrix ──────────────────────────
  const npGetSpeciesAlignment = useMemo(() => {
    return NP_SPECIES.map((speciesDef) => {
      const speciesDemons = NP_DEMONS.filter((d) => d.species === speciesDef.id)
      const boundOfSpecies = store.npBoundDemons.filter((bd) => {
        const def = NP_DEMONS.find((dd) => dd.id === bd.demonDefId)
        return def && def.species === speciesDef.id
      })
      const alignment = speciesDemons.length > 0 ? Math.floor((boundOfSpecies.length / speciesDemons.length) * 100) : 0
      return {
        ...speciesDef,
        totalSpeciesDemons: speciesDemons.length,
        boundCount: boundOfSpecies.length,
        alignment,
        isComplete: boundOfSpecies.length === speciesDemons.length,
        totalBoundPower: boundOfSpecies.reduce((s, d) => s + d.power, 0),
      }
    })
  }, [store])

  // ── Getter: Demon Feed Costs ────────────────────────────────────
  const npGetDemonFeedCosts = useMemo(() => {
    return store.npBoundDemons.map((bd) => {
      const def = NP_DEMONS.find((d) => d.id === bd.demonDefId)
      if (!def) return { ...bd, feedCost: 0, canFeed: false }
      const feedCost = Math.floor(10 * Math.pow(1.3, bd.level - 1))
      return {
        ...bd,
        feedCost,
        canFeed: store.npSoulPower >= feedCost,
      }
    })
  }, [store])

  // ── Getter: Event Impact Assessment ────────────────────────────
  const npGetEventImpact = useMemo(() => {
    const activeEvent = store.npActiveEventId
      ? NP_EVENTS.find((e) => e.id === store.npActiveEventId)
      : null
    if (!activeEvent) return { impact: 0, description: 'No active event', bonusMultiplier: 1, penaltyMultiplier: 1 }
    const impactMultiplier = activeEvent.severity >= 8 ? 3 : activeEvent.severity >= 6 ? 2 : activeEvent.severity >= 4 ? 1.5 : 1
    return {
      impact: activeEvent.severity,
      description: activeEvent.description,
      bonusMultiplier: impactMultiplier,
      penaltyMultiplier: impactMultiplier,
      timeRemaining: store.npEventTimer,
      effects: activeEvent.effects,
    }
  }, [store])

  // ── Getter: Circle Material Access ─────────────────────────────
  const npGetCircleMaterials = useMemo(() => {
    return NP_CIRCLES.map((circle) => {
      const availableMaterials = NP_MATERIALS.filter((m) => m.source === circle.id)
      const isSealed = store.npSealedCircles.includes(circle.id)
      return {
        circleId: circle.id,
        circleName: circle.name,
        isSealed,
        availableMaterials,
        materialCount: availableMaterials.length,
        elementColor: npElementColor(circle.element),
      }
    })
  }, [store])

  // ── Getter: Unlocked Achievements Detail ──────────────────────
  const npGetUnlockedAchievements = useMemo(() => {
    return store.npCompletedAchievements.map((aId) => {
      const ach = NP_ACHIEVEMENTS.find((a) => a.id === aId)
      return {
        id: aId,
        name: ach?.name ?? 'Unknown',
        description: ach?.description ?? '',
        reward: ach?.reward ?? '',
        icon: ach?.icon ?? '🏅',
      }
    })
  }, [store])

  // ── Assemble npAPI ────────────────────────────────────────────
  const npAPI = {
    // Constants
    NP_SPECIES,
    NP_DEMONS,
    NP_CIRCLES,
    NP_MATERIALS,
    NP_STRUCTURES,
    NP_ABILITIES,
    NP_ACHIEVEMENTS,
    NP_TITLES,
    NP_ARTIFACTS,
    NP_EVENTS,
    NP_COLOR_DEMON_RED,
    NP_COLOR_PACT_GOLD,
    NP_COLOR_SOUL_PURPLE,
    NP_COLOR_NETHER_BLACK,
    NP_COLOR_SHADOW_GRAY,
    NP_COLOR_FLAME_ORANGE,
    NP_COLOR_VOID_INDIGO,
    NP_COLOR_INK_CERULEAN,
    NP_COLOR_BONE_WHITE,
    NP_COLOR_CONTRACT_SILVER,

    // State
    npLevel: store.npLevel,
    npSoulPower: store.npSoulPower,
    npPactsBound: store.npPactsBound,
    npBoundDemons: store.npBoundDemons,
    npSealedCircles: store.npSealedCircles,
    npCollectedMaterials: store.npCollectedMaterials,
    npStructures: store.npStructures,
    npUnlockedAbilities: store.npUnlockedAbilities,
    npCompletedAchievements: store.npCompletedAchievements,
    npActiveTitle: store.npActiveTitle,
    npForgedArtifacts: store.npForgedArtifacts,
    npTotalDemonsSummoned: store.npTotalDemonsSummoned,
    npTotalPactsCompleted: store.npTotalPactsCompleted,
    npTotalStructuresUpgraded: store.npTotalStructuresUpgraded,
    npTotalArtifactsForged: store.npTotalArtifactsForged,
    npTotalSoulPowerEarned: store.npTotalSoulPowerEarned,
    npActiveEventId: store.npActiveEventId,
    npEventTimer: store.npEventTimer,
    npGold: store.npGold,
    npSoulFragments: store.npSoulFragments,
    npActiveCircleId: store.npActiveCircleId,

    // Actions
    npBindPact: store.npBindPact,
    npSummonDemon: store.npSummonDemon,
    npSealCircle: store.npSealCircle,
    npSoulForge: store.npSoulForge,
    npUpgradeStructure: store.npUpgradeStructure,
    npUnlockAbility: store.npUnlockAbility,
    npClaimAchievement: store.npClaimAchievement,
    npSetTitle: store.npSetTitle,
    npCollectMaterial: store.npCollectMaterial,
    npTriggerEvent: store.npTriggerEvent,
    npFeedDemon: store.npFeedDemon,
    npSacrificeDemon: store.npSacrificeDemon,

    // Getters
    npLevelProgress,
    npTotalPower,
    npGetDemonCountBySpecies,
    npGetRaritySummary,
    npGetCircleDetails,
    npGetMaterialInventory,
    npGetStructureList,
    npGetActiveEvent,
    npGetAchievementList,
    npGetTitleProgress,
    npGetArtifactList,
    npGetBoundDemons,
    npGetAbilityList,
    npGetSummonChances,
    npGetStatsSummary,
    npGetUpgradeCosts,
    npGetCirclePowerBreakdown,
    npGetBindingCosts,
    npGetSpeciesDetails,
    npGetEventList,
    npGetNextTitle,
    npGetCovenHealth,
    npGetArtifactBonus,
    npGetSpeciesAlignment,
    npGetDemonFeedCosts,
    npGetEventImpact,
    npGetCircleMaterials,
    npGetUnlockedAchievements,
  }

  return npAPI
}
