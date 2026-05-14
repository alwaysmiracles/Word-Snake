/**
 * Elven Grove Wire — 精灵秘林 (Elven Grove) feature module for Word Snake
 *
 * A magical elf forest exploration and management mini-game: recruit 35 elven
 * beings across 5 rarity tiers, explore 8 sacred groves, gather 30 nature
 * essences, build 25 grove structures, wield 22 elven abilities, earn 8
 * titles, play 15 enchanted instruments, and celebrate 12 seasonal festivals
 * — backed by a Zustand store with persist middleware.
 *
 * Storage key: elven-grove-wire
 * Prefix: el / EL_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type ELRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type ELClass = 'Ranger' | 'Mage' | 'Bard' | 'Healer' | 'Shadow' | 'Smith' | 'Sentinel'
export type ELElement = 'Nature' | 'Star' | 'Moon' | 'Sun' | 'Frost' | 'Shadow' | 'Earth'

export interface ELElfDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly elfClass: ELClass
  readonly element: ELElement
  readonly rarity: ELRarity
  readonly basePower: number
  readonly ability: string
}

export interface ELGroveDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly minLevel: number
  readonly element: ELElement
  readonly bonuses: string[]
}

export interface ELEssenceDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: ELRarity
  readonly source: string
  readonly value: number
}

export interface ELStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly baseCost: number
  readonly costMultiplier: number
}

export interface ELAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly element: ELElement
}

export interface ELAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface ELTitleDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredLevel: number
  readonly requiredGroves: number
}

export interface ELInstrumentDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: ELRarity
  readonly powerBonus: number
  readonly specialAbility: string
}

export interface ELFestivalDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly season: string
  readonly duration: number
  readonly effects: string[]
}

export interface ELRecruitedElf {
  readonly id: string
  elfDefId: string
  name: string
  level: number
  currentHP: number
  maxHP: number
  power: number
  awakened: boolean
  awakeningCount: number
  acquiredAt: number
}

export interface ELOwnedStructure {
  readonly id: string
  structureDefId: string
  level: number
  built: boolean
}

export interface ELGroveState {
  vitality: number
  maxVitality: number
  corruption: number
  lastBlessedAt: number | null
}

export interface ELStoreState {
  recruitedElves: ELRecruitedElf[]
  gatheredEssences: Record<string, number>
  structures: ELOwnedStructure[]
  achievements: string[]
  currentTitle: string
  collectedInstruments: string[]
  unlockedGroves: string[]
  groveLevel: number
  groveExp: number
  gold: number
  natureEnergy: number
  totalRecruited: number
  totalGathered: number
  totalUpgraded: number
  totalAwakened: number
  totalRituals: number
  activeFestivalId: string | null
  festivalTimer: number
  groveState: ELGroveState
  activeGroveId: string | null
}

export interface ELStoreActions {
  elExploreGrove: (groveId: string) => boolean
  elRecruitElf: (elfId: string) => boolean
  elGatherEssence: (essenceId: string) => number
  elUpgradeStructure: (structureId: string) => boolean
  elUseAbility: (abilityId: string) => boolean
  elCelebrateFestival: (festivalId: string) => boolean
  elCraftItem: (ingredientIds: string[]) => boolean
  elPlantWorldTree: (groveId: string) => boolean
  elActivatePortal: (portalId: string) => boolean
  elEnchantWeapon: (weaponId: string) => boolean
  elPerformRitual: (ritualId: string) => boolean
  elAwakenElf: (instanceId: string) => boolean
  elPurifyCorruption: (amount: number) => boolean
  elHealGrove: (amount: number) => boolean
  elUnlockGrove: (groveId: string) => boolean
  elCollectInstrument: (instrumentId: string) => boolean
}

export type ELFullStore = ELStoreState & ELStoreActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const EL_COLOR_FOREST_GREEN: string = '#228B22'
export const EL_COLOR_SILVER_MOONLIGHT: string = '#C0C0D0'
export const EL_COLOR_GOLDEN_STARLIGHT: string = '#FFD700'
export const EL_COLOR_MOSS_BROWN: string = '#6B4226'
export const EL_COLOR_PETAL_PINK: string = '#FFB7C5'
export const EL_COLOR_DEWDROP_BLUE: string = '#87CEEB'
export const EL_COLOR_ANCIENT_AMBER: string = '#FFBF00'
export const EL_COLOR_MIST_WHITE: string = '#F5F5F5'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: XP & LEVEL HELPERS
// ═══════════════════════════════════════════════════════════════════

const EL_MAX_LEVEL = 50
const EL_INITIAL_GOLD = 500
const EL_INITIAL_ENERGY = 100

function elXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= EL_MAX_LEVEL) return Infinity
  return Math.floor(85 * Math.pow(1.14, level) + level * 16)
}

function elLevelFromXp(totalXp: number): number {
  let level = 1
  let xpRemaining = totalXp
  while (level < EL_MAX_LEVEL) {
    const needed = elXpForLevel(level)
    if (xpRemaining < needed) break
    xpRemaining -= needed
    level++
  }
  return level
}

function elGenerateId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function elRarityMultiplier(rarity: ELRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function elElementColor(element: ELElement): string {
  switch (element) {
    case 'Nature': return EL_COLOR_FOREST_GREEN
    case 'Star': return EL_COLOR_GOLDEN_STARLIGHT
    case 'Moon': return EL_COLOR_SILVER_MOONLIGHT
    case 'Sun': return EL_COLOR_ANCIENT_AMBER
    case 'Frost': return EL_COLOR_DEWDROP_BLUE
    case 'Shadow': return EL_COLOR_MOSS_BROWN
    case 'Earth': return EL_COLOR_MOSS_BROWN
  }
}

function elRarityColor(rarity: ELRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#22D3EE'
    case 'rare': return '#818CF8'
    case 'epic': return '#F472B6'
    case 'legendary': return '#FBBF24'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: ELEMENT BONUSES & RECRUIT CHANCES
// ═══════════════════════════════════════════════════════════════════

const EL_ELEMENT_BONUSES: Record<ELElement, { defense: number; wisdom: number; healBonus: number }> = {
  Nature: { defense: 15, wisdom: 10, healBonus: 5 },
  Star: { defense: 5, wisdom: 20, healBonus: 10 },
  Moon: { defense: 10, wisdom: 15, healBonus: 15 },
  Sun: { defense: 8, wisdom: 12, healBonus: 20 },
  Frost: { defense: 20, wisdom: 8, healBonus: 0 },
  Shadow: { defense: 18, wisdom: 15, healBonus: 0 },
  Earth: { defense: 25, wisdom: 5, healBonus: 10 },
}

const EL_RECRUIT_CHANCES: Record<ELRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
}

const EL_GROVE_ELEMENT_BONUS: Record<string, ELElement[]> = {
  mossy_glade: ['Nature', 'Earth'],
  starlit_meadow: ['Star', 'Moon'],
  silver_fern_hollow: ['Moon', 'Nature'],
  moonpetal_copse: ['Moon', 'Star'],
  ancient_oak_sanctum: ['Earth', 'Nature'],
  crystal_brook_glen: ['Frost', 'Nature'],
  twilight_canopy: ['Shadow', 'Moon'],
  eternal_star_grove: ['Star', 'Moon', 'Sun', 'Nature', 'Frost', 'Shadow', 'Earth'],
}

function elGetElementBonus(element: ELElement): { defense: number; wisdom: number; healBonus: number } {
  return EL_ELEMENT_BONUSES[element]
}

function elGetRecruitChance(rarity: ELRarity, activeGroveId: string | null): number {
  let chance = EL_RECRUIT_CHANCES[rarity]
  if (activeGroveId) {
    const bonusElements = EL_GROVE_ELEMENT_BONUS[activeGroveId]
    if (bonusElements && bonusElements.length > 2) {
      chance = chance * 1.5
    }
  }
  return Math.min(100, Math.floor(chance))
}

function elGetAwakeningBonus(level: number, awakeningCount: number): number {
  return Math.floor(level * 12 * (1 + awakeningCount * 0.25))
}

function elGetStructureBonus(structureId: string, level: number): number {
  switch (structureId) {
    case 'druid_altar': return level * 2
    case 'rune_circle': return level * 5
    case 'moonwell': return level * 8
    case 'star_beacon': return level * 12
    case 'world_tree_sapling': return level * 20
    case 'essence_pool': return level * 3
    case 'enchanted_forge': return level * 7
    case 'ritual_stone': return level * 15
    default: return level * 2
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: EL_ELVES — 35 Elven Beings (7 per rarity tier)
// ═══════════════════════════════════════════════════════════════════

export const EL_ELVES: readonly ELElfDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'mossfoot_scout',
    name: 'Mossfoot Scout',
    description:
      'A nimble elven scout whose bare feet leave no trace on the forest floor. Moss grows in their footprints, healing the ground they walk upon. Often the first to spot danger approaching the grove.',
    elfClass: 'Ranger',
    element: 'Nature',
    rarity: 'common',
    basePower: 15,
    ability: 'Silent Step',
  },
  {
    id: 'dewdrop_healer',
    name: 'Dewdrop Healer',
    description:
      'A gentle elven healer who collects morning dew from spider silk threads and distills it into potent restorative potions. Their touch can mend minor wounds and soothe fevers in humans and animals alike.',
    elfClass: 'Healer',
    element: 'Moon',
    rarity: 'common',
    basePower: 14,
    ability: 'Dew Mending',
  },
  {
    id: 'barkweaver_apprentice',
    name: 'Barkweaver Apprentice',
    description:
      'A young smith who has learned to shape living wood into tools and armor. Their creations grow with their wielders, becoming stronger over time. Still learning to control the more volatile sap-forges.',
    elfClass: 'Smith',
    element: 'Earth',
    rarity: 'common',
    basePower: 16,
    ability: 'Bark Mold',
  },
  {
    id: 'twigwhistle_bard',
    name: 'Twigwhistle Bard',
    description:
      'A cheerful bard who plays melodies on a flute carved from a living willow branch. Their music encourages plants to grow faster and causes woodland creatures to gather and listen in peace.',
    elfClass: 'Bard',
    element: 'Nature',
    rarity: 'common',
    basePower: 13,
    ability: 'Growth Song',
  },
  {
    id: 'bramble_sentinel',
    name: 'Bramble Sentinel',
    description:
      'A vigilant guardian wrapped in living brambles that move at their command. The thorns can extend to form barriers or lash out at intruders. Their loyalty to the grove is absolute and unwavering.',
    elfClass: 'Sentinel',
    element: 'Earth',
    rarity: 'common',
    basePower: 18,
    ability: 'Bramble Wall',
  },
  {
    id: 'petaleur_sorcerer',
    name: 'Petaleur Sorcerer',
    description:
      'A mage who commands falling petals as weapons and shields. By concentrating, they can create blizzards of razor-sharp flower petals that cut through armor like silk through water.',
    elfClass: 'Mage',
    element: 'Nature',
    rarity: 'common',
    basePower: 17,
    ability: 'Petal Storm',
  },
  {
    id: 'thornshade_assassin',
    name: 'Thornshade Assassin',
    description:
      'A shadow elf who moves unseen through the deepest forest darkness. They coat their daggers with a paralytic thorn extract that immobilizes targets for hours without causing lasting harm.',
    elfClass: 'Shadow',
    element: 'Shadow',
    rarity: 'common',
    basePower: 19,
    ability: 'Thorn Paralysis',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'silverleaf_warden',
    name: 'Silverleaf Warden',
    description:
      'An elven warden whose armor is made of silvered leaves that reflect moonlight. They patrol the borders of the grove each night, their presence a deterrent to all but the most determined threats.',
    elfClass: 'Sentinel',
    element: 'Moon',
    rarity: 'uncommon',
    basePower: 32,
    ability: 'Moonlight Shield',
  },
  {
    id: 'starpollen_mage',
    name: 'Starpollen Mage',
    description:
      'A mage who has learned to harvest pollen from flowers that bloom only under starlight. This pollen glows with captured starlight and can be woven into powerful illumination spells and barriers.',
    elfClass: 'Mage',
    element: 'Star',
    rarity: 'uncommon',
    basePower: 35,
    ability: 'Star Pollen Illumination',
  },
  {
    id: 'windrunner_ranger',
    name: 'Windrunner Ranger',
    description:
      'An exceptionally fast ranger who can run through the densest forest without making a sound. They communicate with birds and use trained hawks to scout areas beyond elven territory.',
    elfClass: 'Ranger',
    element: 'Nature',
    rarity: 'uncommon',
    basePower: 30,
    ability: 'Eagle Eye Scout',
  },
  {
    id: 'moonlily_bard',
    name: 'Moonlily Bard',
    description:
      'An enchanting bard whose songs are powered by moonlight absorbed through moonlily blossoms woven into their hair. Their lullabies can put entire armies to sleep, and their war chants invigorate allies.',
    elfClass: 'Bard',
    element: 'Moon',
    rarity: 'uncommon',
    basePower: 34,
    ability: 'Moonlily Lullaby',
  },
  {
    id: 'rootsong_healer',
    name: 'Rootsong Healer',
    description:
      'A master healer who sings to the roots of ancient trees, channeling their deep earth energy into powerful regeneration spells. They can regrow lost limbs over time by encouraging the body to reconnect with nature.',
    elfClass: 'Healer',
    element: 'Earth',
    rarity: 'uncommon',
    basePower: 33,
    ability: 'Root Regeneration',
  },
  {
    id: 'frostbloom_forger',
    name: 'Frostbloom Forger',
    description:
      'A smith who works with ice flowers that bloom in winter groves. By forging these crystalline petals into weapons, they create arms that freeze wounds shut, preventing bleeding and slowing enemies.',
    elfClass: 'Smith',
    element: 'Frost',
    rarity: 'uncommon',
    basePower: 36,
    ability: 'Frostbloom Blade',
  },
  {
    id: 'duskweaver_shadow',
    name: 'Duskweaver Shadow',
    description:
      'A shadow elf who can weave twilight itself into cloaks of invisibility. They serve as the grove\'s primary intelligence gatherers, slipping into enemy camps at dusk to learn their plans and sabotage supplies.',
    elfClass: 'Shadow',
    element: 'Shadow',
    rarity: 'uncommon',
    basePower: 38,
    ability: 'Twilight Veil',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'starfall_archer',
    name: 'Starfall Archer',
    description:
      'A legendary archer whose arrows are made of condensed starlight. When they fire at night, the arrows leave trails of light across the sky like miniature shooting stars. Each arrow can pierce any armor.',
    elfClass: 'Ranger',
    element: 'Star',
    rarity: 'rare',
    basePower: 58,
    ability: 'Starfall Volley',
  },
  {
    id: 'moonweave_enchantress',
    name: 'Moonweave Enchantress',
    description:
      'A powerful mage who weaves moonlight into solid threads of magical fabric. These threads can be shaped into barriers, weapons, or even temporary shelters. Her creations glow with soft silver light.',
    elfClass: 'Mage',
    element: 'Moon',
    rarity: 'rare',
    basePower: 62,
    ability: 'Moonweave Fabrication',
  },
  {
    id: 'thunderoak_smith',
    name: 'Thunderoak Smith',
    description:
      'A master smith who forges weapons from wood struck by lightning. Each item they create carries a static charge that electrifies enemies on contact. Their greatest creation, a living shield, absorbs lightning.',
    elfClass: 'Smith',
    element: 'Earth',
    rarity: 'rare',
    basePower: 55,
    ability: 'Lightning Wood Forging',
  },
  {
    id: 'verdant_warden_major',
    name: 'Verdant Warden Major',
    description:
      'A senior sentinel whose body has partially merged with an ancient treant. One arm is a living branch that can extend to incredible lengths, and bark armor covers their torso, making them nearly impervious to physical damage.',
    elfClass: 'Sentinel',
    element: 'Nature',
    rarity: 'rare',
    basePower: 60,
    ability: 'Treant Merge',
  },
  {
    id: 'starfrost_healer',
    name: 'Starfrost Healer',
    description:
      'A healer who combines starlight with frost magic to create a unique restorative technique. Their healing touch is cold but invigorating, sealing wounds with crystalline frost that slowly absorbs into the body as pure energy.',
    elfClass: 'Healer',
    element: 'Frost',
    rarity: 'rare',
    basePower: 57,
    ability: 'Starfrost Restoration',
  },
  {
    id: 'nightingale_maestro',
    name: 'Nightingale Maestro',
    description:
      'A bard whose voice can mimic any sound in nature and whose compositions carry actual magical power. Their symphony of a thousand birds can strip enemies of their will to fight, while their rain song summons actual storms.',
    elfClass: 'Bard',
    element: 'Nature',
    rarity: 'rare',
    basePower: 63,
    ability: 'Natures Symphony',
  },
  {
    id: 'voidstep_phantom',
    name: 'Voidstep Phantom',
    description:
      'A shadow elf who has mastered the art of stepping between shadows as if they were doorways. They can disappear into one shadow and emerge from another miles away, making them the perfect operative for deep infiltration missions.',
    elfClass: 'Shadow',
    element: 'Shadow',
    rarity: 'rare',
    basePower: 65,
    ability: 'Shadow Door',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'ancient_oak_sage',
    name: 'Ancient Oak Sage',
    description:
      'An elf who has lived so long they have become one with the oldest oak in the grove. Their body is half-wood, half-flesh, and their wisdom spans millennia. They can command all plant life within the grove simultaneously.',
    elfClass: 'Mage',
    element: 'Nature',
    rarity: 'epic',
    basePower: 95,
    ability: 'Ancient Dominion',
  },
  {
    id: 'lunarcrown_sentinel',
    name: 'Lunarcrown Sentinel',
    description:
      'The personal guardian of the grove\'s sacred moonstone crown. Their helmet is made of polished moonstone that creates a protective dome of lunar energy around them, deflecting all magical and physical attacks.',
    elfClass: 'Sentinel',
    element: 'Moon',
    rarity: 'epic',
    basePower: 100,
    ability: 'Lunar Dome',
  },
  {
    id: 'celestial_fletch',
    name: 'Celestial Fletch',
    description:
      'An archer of extraordinary skill whose arrows are fletched with feathers from celestial birds that visit the grove once a century. Each arrow carries the blessing of a constellation, granting it unique cosmic powers.',
    elfClass: 'Ranger',
    element: 'Star',
    rarity: 'epic',
    basePower: 98,
    ability: 'Constellation Arrow',
  },
  {
    id: 'worldroot_healer',
    name: 'Worldroot Healer',
    description:
      'A healer who has connected their life force to the World Tree\'s root network. They can channel the tree\'s infinite vitality to heal any wound, cure any poison, and even resurrect the recently deceased — at great personal cost.',
    elfClass: 'Healer',
    element: 'Earth',
    rarity: 'epic',
    basePower: 105,
    ability: 'Worldroot Channel',
  },
  {
    id: 'starforge_artificer',
    name: 'Starforge Artificer',
    description:
      'A legendary smith who has discovered how to forge star metal into living weapons. Their creations have rudimentary consciousness and can transform their shape to adapt to any combat situation, growing new features as needed.',
    elfClass: 'Smith',
    element: 'Star',
    rarity: 'epic',
    basePower: 92,
    ability: 'Living Weapon Forge',
  },
  {
    id: 'dawnbringer_bard',
    name: 'Dawnbringer Bard',
    description:
      'A bard whose music can literally bring the dawn. When they play their greatest composition, the sky lightens, flowers bloom, and the darkness retreats. Their song is said to be the reason the sun rises each morning.',
    elfClass: 'Bard',
    element: 'Sun',
    rarity: 'epic',
    basePower: 96,
    ability: 'Dawn Anthem',
  },
  {
    id: 'eclipse_assassin_master',
    name: 'Eclipse Assassin Master',
    description:
      'The grandmaster of the shadow order who can only be seen during a solar eclipse. In total darkness they are omnipresent within a mile radius, able to strike from any shadow simultaneously. None have survived their full assault.',
    elfClass: 'Shadow',
    element: 'Shadow',
    rarity: 'epic',
    basePower: 88,
    ability: 'Eclipse Omniscience',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'eternal_forest_monarch',
    name: 'Eternal Forest Monarch',
    description:
      'The immortal ruler of all elven groves. They have existed since the first seed sprouted on the earth, and their consciousness is distributed across every tree in every forest on the planet. They ARE the forest.',
    elfClass: 'Mage',
    element: 'Nature',
    rarity: 'legendary',
    basePower: 150,
    ability: 'Forest Awakening',
  },
  {
    id: 'star_crowned_sovereign',
    name: 'Star Crowned Sovereign',
    description:
      'An elf who was crowned by the stars themselves at the moment of their birth. The seven stars of the Northern Crown orbit their head at all times, each one granting mastery over a different school of elven magic.',
    elfClass: 'Mage',
    element: 'Star',
    rarity: 'legendary',
    basePower: 145,
    ability: 'Seven Star Dominion',
  },
  {
    id: 'moonsilver_archdruid',
    name: 'Moonsilver Archdruid',
    description:
      'The archdruid of the lunar order who draws power directly from the phases of the moon. During a full moon, their power is amplified a hundredfold. They can reshape landscapes, summon moonbeams as weapons, and speak with the dead.',
    elfClass: 'Mage',
    element: 'Moon',
    rarity: 'legendary',
    basePower: 148,
    ability: 'Moon Phase Mastery',
  },
  {
    id: 'worldheart_sentinel',
    name: 'Worldheart Sentinel',
    description:
      'The guardian of the World Tree\'s heartwood. Their armor is grown from the tree itself and is completely indestructible. They stand eternal vigil at the base of the World Tree, having not moved in ten thousand years.',
    elfClass: 'Sentinel',
    element: 'Earth',
    rarity: 'legendary',
    basePower: 140,
    ability: 'Eternal Vigil',
  },
  {
    id: 'aurora_windrunner',
    name: 'Aurora Windrunner',
    description:
      'The fastest being in the elven realms, capable of outrunning light itself. They leave trails of aurora borealis wherever they run, and their speed creates shockwaves that can level forests or part seas.',
    elfClass: 'Ranger',
    element: 'Star',
    rarity: 'legendary',
    basePower: 138,
    ability: 'Aurora Speed',
  },
  {
    id: 'genesis_healer',
    name: 'Genesis Healer',
    description:
      'A healer so powerful they can restore life to anything, including inanimate objects. They once healed a mountain that had been cracked by an earthquake, causing the stone to flow like water and rejoin seamlessly.',
    elfClass: 'Healer',
    element: 'Nature',
    rarity: 'legendary',
    basePower: 142,
    ability: 'Genesis Restoration',
  },
  {
    id: 'voidsong_apprentice',
    name: 'Voidsong Apprentice',
    description:
      'A bard who learned music from the void between worlds. Their songs tap into primordial chaos, and playing them can reshape reality itself. Each note they play echoes across dimensions, resonating with the fundamental structure of existence.',
    elfClass: 'Bard',
    element: 'Shadow',
    rarity: 'legendary',
    basePower: 135,
    ability: 'Voidsong Resonance',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: EL_GROVES — 8 Sacred Groves
// ═══════════════════════════════════════════════════════════════════

export const EL_GROVES: readonly ELGroveDef[] = [
  {
    id: 'mossy_glade',
    name: 'Mossy Glade',
    description:
      'A sun-dappled clearing carpeted with velvet moss that cushions every footstep. Fireflies drift lazily through the warm air, and a gentle brook babbles at the edge. The perfect starting ground for aspiring grove explorers.',
    minLevel: 1,
    element: 'Nature',
    bonuses: ['+5% recruit rate', 'Basic essence gathering', 'Moss healing aura'],
  },
  {
    id: 'starlit_meadow',
    name: 'Starlit Meadow',
    description:
      'A vast meadow where bioluminescent flowers open only at night, creating a carpet of living stars. The air hums with magical energy, and fallen star fragments can be found among the grass at dawn.',
    minLevel: 5,
    element: 'Star',
    bonuses: ['+10% star essence yield', 'Rare elf encounters', 'Starlight crafting bonus'],
  },
  {
    id: 'silver_fern_hollow',
    name: 'Silver Fern Hollow',
    description:
      'A sheltered hollow where ancient silver ferns grow taller than houses. Their fronds reflect and amplify moonlight, creating an ethereal silver glow that illuminates the entire hollow even on the darkest nights.',
    minLevel: 10,
    element: 'Moon',
    bonuses: ['+15% moon essence yield', 'Lunar healing resonance', 'Moonwell access'],
  },
  {
    id: 'moonpetal_copse',
    name: 'Moonpetal Copse',
    description:
      'A small grove of trees whose blossoms are shaped like crescent moons. They emit a soft glow that cycles with the lunar phases, and their petals are prized ingredients in the most powerful elven potions.',
    minLevel: 15,
    element: 'Moon',
    bonuses: ['+20% nature energy regeneration', 'Potion crafting unlocked', 'Rare ingredient foraging'],
  },
  {
    id: 'ancient_oak_sanctum',
    name: 'Ancient Oak Sanctum',
    description:
      'A circle of oaks so ancient their roots intertwine to form a natural cathedral. Runes carved into their bark pulse with earth magic, and the central clearing contains a sacred stone altar used for the most important rituals.',
    minLevel: 22,
    element: 'Earth',
    bonuses: ['+25% earth element power', 'Ritual performing available', 'Structure upgrades enhanced'],
  },
  {
    id: 'crystal_brook_glen',
    name: 'Crystal Brook Glen',
    description:
      'A glen where the brook has crystallized into a river of living gemstones that flow like water. The crystals sing harmonically as they pass over rocks, and drinking from the brook grants temporary frost resistance.',
    minLevel: 30,
    element: 'Frost',
    bonuses: ['+30% frost element power', 'Crystal essence available', 'Epic elf summoning unlocked'],
  },
  {
    id: 'twilight_canopy',
    name: 'Twilight Canopy',
    description:
      'A dense forest where the canopy is so thick that eternal twilight reigns below. Shadow elves have made this their home, and their dark magic permeates every leaf and root. Dangerous but rich in shadow essences.',
    minLevel: 38,
    element: 'Shadow',
    bonuses: ['+35% shadow element power', 'Legendary essence chance', 'Shadow elf recruitment bonus'],
  },
  {
    id: 'eternal_star_grove',
    name: 'Eternal Star Grove',
    description:
      'The heart of all elven groves — a sacred clearing where the World Tree\'s youngest sapling grows. Starlight converges here from across the sky, and all elements blend in perfect harmony. Only the most accomplished elves may enter.',
    minLevel: 45,
    element: 'Star',
    bonuses: ['+50% all element power', 'Legendary elf recruitment', 'World Tree planting', 'Portal activation'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: EL_ESSENCES — 30 Nature Essences
// ═══════════════════════════════════════════════════════════════════

export const EL_ESSENCES: readonly ELEssenceDef[] = [
  // Common (6)
  { id: 'moonlight_dew', name: 'Moonlight Dew', description: 'Silvery droplets collected from leaves at midnight under a full moon. Used in basic healing potions and as a primer for lunar enchantments.', rarity: 'common', source: 'mossy_glade', value: 5 },
  { id: 'starpetal_dust', name: 'Starpetal Dust', description: 'Fine pollen from star-shaped wildflowers. Glows faintly in darkness and is used as a component in illumination spells and light-based crafting.', rarity: 'common', source: 'mossy_glade', value: 6 },
  { id: 'moss_thread', name: 'Moss Thread', description: 'Silk-like fibers harvested from enchanted moss. Incredibly strong for their weight and used in weaving elven clothing and binding enchantments.', rarity: 'common', source: 'mossy_glade', value: 4 },
  { id: 'bark_resin', name: 'Bark Resin', description: 'Golden sap from ancient trees that hardens into a transparent amber. Used as a protective coating for wood and as an adhesive in magical construction.', rarity: 'common', source: 'mossy_glade', value: 8 },
  { id: 'leafwhisper_essence', name: 'Leafwhisper Essence', description: 'Distilled oils from leaves that rustle with prophetic whispers when the wind blows. Used in divination rituals and fortune-telling spells.', rarity: 'common', source: 'mossy_glade', value: 7 },
  { id: 'brook_pebble', name: 'Brook Pebble', description: 'A smooth stone worn by centuries of flowing water. Contains traces of earth magic and is used as a grounding component in elemental spells.', rarity: 'common', source: 'mossy_glade', value: 5 },

  // Uncommon (6)
  { id: 'starfall_shard', name: 'Starfall Shard', description: 'A fragment of a meteorite that landed in the starlit meadow. Still warm from its passage through the atmosphere and humming with cosmic energy.', rarity: 'uncommon', source: 'starlit_meadow', value: 28 },
  { id: 'lunar_moss', name: 'Lunar Moss', description: 'Rare moss that grows only where moonlight strikes silver deposits. Absorbs and stores lunar energy, releasing it as a soft blue glow when compressed.', rarity: 'uncommon', source: 'silver_fern_hollow', value: 35 },
  { id: 'fern_silver_extract', name: 'Fern Silver Extract', description: 'Liquid silver extracted from the fronds of ancient silver ferns. Used in forging moon-aligned weapons and in protective warding rituals.', rarity: 'uncommon', source: 'silver_fern_hollow', value: 32 },
  { id: 'moonpetal_nectar', name: 'Moonpetal Nectar', description: 'Sweet nectar from crescent-shaped blossoms. A single drop can sustain an elf for a full day, and it is the base ingredient for the most valued elven wines.', rarity: 'uncommon', source: 'moonpetal_copse', value: 40 },
  { id: 'root_heart_crystal', name: 'Root Heart Crystal', description: 'A crystal formed where the roots of the World Tree touch deep mineral deposits. Contains compressed earth magic of immense age and power.', rarity: 'uncommon', source: 'ancient_oak_sanctum', value: 38 },
  { id: 'frostbloom_extract', name: 'Frostbloom Extract', description: 'Essence distilled from flowers that bloom in sub-zero temperatures. Induces a controlled hypothermia that preserves magical properties indefinitely.', rarity: 'uncommon', source: 'crystal_brook_glen', value: 30 },

  // Rare (6)
  { id: 'starlight_pearl', name: 'Starlight Pearl', description: 'A luminous pearl formed inside star-petal clams found only in the deepest starlit pools. Contains concentrated starlight that can power artifacts for years.', rarity: 'rare', source: 'starlit_meadow', value: 120 },
  { id: 'moonsilver_ingot', name: 'Moonsilver Ingot', description: 'Refined lunar metal that is lighter than aluminum yet stronger than steel. Glows with a soft silver radiance and is the preferred material for elite elven weapons.', rarity: 'rare', source: 'silver_fern_hollow', value: 150 },
  { id: 'worldtree_sap', name: 'Worldtree Sap', description: 'A drop of sap from the World Tree itself. Contains the essence of all living things and can be used to heal any wound or strengthen any enchantment beyond normal limits.', rarity: 'rare', source: 'ancient_oak_sanctum', value: 140 },
  { id: 'crystal_brook_gem', name: 'Crystal Brook Gem', description: 'A gemstone that formed naturally in the crystal brook over millennia. Its internal structure refracts light into patterns that encode ancient elven knowledge.', rarity: 'rare', source: 'crystal_brook_glen', value: 135 },
  { id: 'shadow_rose_thorn', name: 'Shadow Rose Thorn', description: 'A thorn from the legendary shadow rose that grows only in eternal darkness. It absorbs light and can be used to create blades of absolute darkness.', rarity: 'rare', source: 'twilight_canopy', value: 130 },
  { id: 'moonpetal_crown_shard', name: 'Moonpetal Crown Shard', description: 'A petal from the Moonpetal Crown, a legendary flower that blooms once every century. Its properties are so potent that even holding it grants visions.', rarity: 'rare', source: 'moonpetal_copse', value: 160 },

  // Epic (6)
  { id: 'void_moon_essence', name: 'Void Moon Essence', description: 'Essence collected during a lunar eclipse when the moon passes through the void between worlds. It is neither light nor dark but something else entirely — pure potential.', rarity: 'epic', source: 'twilight_canopy', value: 500 },
  { id: 'star_forge_core', name: 'Star Forge Core', description: 'The crystallized heart of a dead star, preserved by elven magic for millennia. It generates infinite heat and light and is the ultimate power source for any creation.', rarity: 'epic', source: 'eternal_star_grove', value: 600 },
  { id: 'ancient_oak_heartwood', name: 'Ancient Oak Heartwood', description: 'Wood from the absolute center of the oldest oak in the sanctum. It is so saturated with earth magic that it is effectively indestructible and can channel limitless energy.', rarity: 'epic', source: 'ancient_oak_sanctum', value: 550 },
  { id: 'frost_crystal_matrix', name: 'Frost Crystal Matrix', description: 'A perfectly ordered crystalline structure from the crystal brook that maintains absolute zero in its core. Used in the most advanced preservation and time-stopping enchantments.', rarity: 'epic', source: 'crystal_brook_glen', value: 480 },
  { id: 'eclipse_shadow', name: 'Eclipse Shadow', description: 'Solidified shadow captured during a total solar eclipse. It is heavier than lead and absorbs all forms of energy, making it invaluable for defensive enchantments.', rarity: 'epic', source: 'twilight_canopy', value: 520 },
  { id: 'genesis_moonbeam', name: 'Genesis Moonbeam', description: 'A beam of moonlight from the first full moon after the world was created, preserved in a crystal vial. Its light can create life from nothing when properly channeled.', rarity: 'epic', source: 'eternal_star_grove', value: 570 },

  // Legendary (6)
  { id: 'world_tree_blossom', name: 'World Tree Blossom', description: 'A flower from the World Tree itself. It blooms once every thousand years and contains the distilled essence of all life on the planet. Merely breathing its scent grants enlightenment.', rarity: 'legendary', source: 'eternal_star_grove', value: 5000 },
  { id: 'primordial_star_dust', name: 'Primordial Star Dust', description: 'Dust from the first stars that ever formed, collected by ancient elves before the world had an atmosphere. Each grain contains the blueprint of an entire stellar system.', rarity: 'legendary', source: 'eternal_star_grove', value: 6000 },
  { id: 'eternal_moonlight', name: 'Eternal Moonlight', description: 'Moonlight that has been reflected between mirrors of moonsilver for ten thousand years without losing any intensity. It is pure, undiminished, and infinitely renewable.', rarity: 'legendary', source: 'eternal_star_grove', value: 5500 },
  { id: 'void_bark_shard', name: 'Void Bark Shard', description: 'A piece of bark from a tree that grows in the void between dimensions. It exists in all places simultaneously and can be used as a universal key to any lock, physical or magical.', rarity: 'legendary', source: 'twilight_canopy', value: 7000 },
  { id: 'genesis_seed', name: 'Genesis Seed', description: 'The seed from which the World Tree originally sprouted. It contains the complete genetic code of every plant species that has ever existed or will ever exist. Planting it would create a new world.', rarity: 'legendary', source: 'eternal_star_grove', value: 8000 },
  { id: 'aurora_essence', name: 'Aurora Essence', description: 'Liquid aurora borealis captured in a container of pure crystal. It shifts through every color of the visible spectrum and some that are invisible to mortal eyes. It can reshape reality at the molecular level.', rarity: 'legendary', source: 'eternal_star_grove', value: 6500 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: EL_STRUCTURES — 25 Grove Structures
// ═══════════════════════════════════════════════════════════════════

export const EL_STRUCTURES: readonly ELStructureDef[] = [
  // Altars (5)
  { id: 'druid_altar', name: 'Druid Altar', description: 'A simple stone altar arranged with standing stones aligned to the solstices. Used for basic nature rituals and recruiting common elven beings.', baseCost: 100, costMultiplier: 1.5 },
  { id: 'rune_circle', name: 'Rune Circle', description: 'An intricate circle of carved runes set into the forest floor. Amplifies ritual power and increases the chance of recruiting uncommon elves.', baseCost: 400, costMultiplier: 1.6 },
  { id: 'moonwell', name: 'Moonwell', description: 'A sacred well that collects purified moonlight in liquid form. Required for moon-aligned rituals and rare elf recruitment.', baseCost: 1200, costMultiplier: 1.7 },
  { id: 'star_beacon', name: 'Star Beacon', description: 'A towering crystal spire that channels starlight into the grove. Attracts powerful star-aligned elves and provides passive starlight energy.', baseCost: 3000, costMultiplier: 1.8 },
  { id: 'world_tree_sapling', name: 'World Tree Sapling', description: 'A sapling grown from a cutting of the World Tree itself. The ultimate structure — capable of sustaining legendary elves and channeling infinite nature energy.', baseCost: 8000, costMultiplier: 2.0 },

  // Production (5)
  { id: 'essence_pool', name: 'Essence Pool', description: 'A natural spring infused with ambient magic that slowly generates basic nature essences. Upgrade to increase production rate and quality.', baseCost: 80, costMultiplier: 1.4 },
  { id: 'herb_garden', name: 'Herb Garden', description: 'A carefully tended garden of magical herbs and flowers. Produces a steady supply of uncommon essences used in healing and enchanting.', baseCost: 300, costMultiplier: 1.5 },
  { id: 'crystal_nursery', name: 'Crystal Nursery', description: 'A climate-controlled cavern where frost and star crystals are cultivated. Produces rare elemental essences at an enhanced rate.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'shadow_greenhouse', name: 'Shadow Greenhouse', description: 'A greenhouse shrouded in perpetual twilight where shadow plants grow. Produces rare and epic shadow essences used in dark enchantments.', baseCost: 2000, costMultiplier: 1.7 },
  { id: 'enchanted_forge', name: 'Enchanted Forge', description: 'A forge powered by nature energy rather than fire. Can process and combine any essence into powerful magical items and weapons.', baseCost: 5000, costMultiplier: 1.8 },

  // Defense (5)
  { id: 'thorn_barrier', name: 'Thorn Barrier', description: 'A living wall of enchanted brambles that regenerates when damaged. Provides basic protection against hostile entities entering the grove.', baseCost: 120, costMultiplier: 1.4 },
  { id: 'root_network', name: 'Root Network', description: 'An underground network of connected roots that warns of approaching threats through subtle vibrations felt by every elf in the grove.', baseCost: 500, costMultiplier: 1.5 },
  { id: 'moonlight_shield', name: 'Moonlight Shield Generator', description: 'Projects a protective dome of solidified moonlight powered by concentrated lunar energy. Impervious to most physical and magical attacks.', baseCost: 1500, costMultiplier: 1.6 },
  { id: 'ancient_warden_statue', name: 'Ancient Warden Statue', description: 'A stone statue infused with the spirit of an ancient elven guardian. It animates when the grove is threatened, fighting with stone fists and nature magic.', baseCost: 700, costMultiplier: 1.5 },
  { id: 'living_wall', name: 'Living Wall Fortress', description: 'A massive wall composed of interlocking living trees that can reshape itself to counter any threat. The ultimate defensive structure for the grove.', baseCost: 4000, costMultiplier: 1.8 },

  // Utility (5)
  { id: 'nature_well', name: 'Nature Well', description: 'A well that draws nature energy from deep within the earth. Provides passive nature energy regeneration for all grove operations.', baseCost: 150, costMultiplier: 1.4 },
  { id: 'essence_vault', name: 'Essence Vault', description: 'A vault carved from living rock that preserves gathered essences at perfect conditions. Prevents degradation and magical contamination.', baseCost: 250, costMultiplier: 1.5 },
  { id: 'elf_rest_pavilion', name: 'Elf Rest Pavilion', description: 'A peaceful pavilion woven from living branches where elves recover their energy faster. Reduces ability cooldowns for all recruited elves.', baseCost: 600, costMultiplier: 1.5 },
  { id: 'corruption_purifier', name: 'Corruption Purifier', description: 'A device that detects and neutralizes corruption in the grove. Essential for maintaining grove health and preventing dark magic from taking root.', baseCost: 1000, costMultiplier: 1.6 },
  { id: 'ritual_stone', name: 'Ritual Stone', description: 'A massive standing stone inscribed with the oldest elven runes. Required for performing the most powerful grove rituals and enchantments.', baseCost: 3000, costMultiplier: 1.8 },

  // Crafting (5)
  { id: 'weaving_loom', name: 'Enchanted Loom', description: 'A loom that weaves magical threads into enchanted fabrics. Produces cloaks of invisibility, armor of thorns, and other wearable enchantments.', baseCost: 200, costMultiplier: 1.5 },
  { id: 'potion_bench', name: 'Potion Bench', description: 'A workstation for brewing elven potions and elixirs. Combines gathered essences into consumable items with powerful temporary effects.', baseCost: 400, costMultiplier: 1.5 },
  { id: 'rune_carving_table', name: 'Rune Carving Table', description: 'A table where magical runes are carved into wood, stone, and metal. Runed items gain elemental affinities and enhanced properties.', baseCost: 800, costMultiplier: 1.6 },
  { id: 'instrument_workshop', name: 'Instrument Workshop', description: 'A workshop for crafting enchanted musical instruments. Elven bards require these instruments to perform their most powerful magical songs.', baseCost: 1500, costMultiplier: 1.7 },
  { id: 'portal_frame', name: 'Portal Frame', description: 'A frame of entwined star-iron and world-tree wood that can be activated to create temporary portals to other groves and dimensions.', baseCost: 6000, costMultiplier: 2.0 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: EL_ABILITIES — 22 Elven Abilities
// ═══════════════════════════════════════════════════════════════════

export const EL_ABILITIES: readonly ELAbilityDef[] = [
  // Nature (4)
  { id: 'ability_natures_grasp', name: 'Nature\'s Grasp', description: 'Command roots and vines to erupt from the ground, entangling and restraining enemies within a large area.', cooldown: 15, power: 40, element: 'Nature' },
  { id: 'ability_verdant_growth', name: 'Verdant Growth', description: 'Accelerate plant growth in a massive radius, creating walls of living wood and thorn barriers instantly.', cooldown: 20, power: 55, element: 'Nature' },
  { id: 'ability_wild_empathy', name: 'Wild Empathy', description: 'Communicate with and befriend any natural creature, gaining their trust and assistance in combat and exploration.', cooldown: 30, power: 30, element: 'Nature' },
  { id: 'ability_ancient_wrath', name: 'Ancient Wrath', description: 'Channel the anger of the ancient forest, causing trees to attack enemies with devastating branch strikes.', cooldown: 45, power: 80, element: 'Nature' },

  // Star (4)
  { id: 'ability_starlight_lance', name: 'Starlight Lance', description: 'Forge a lance of pure starlight that pierces any defense and illuminates the target from within.', cooldown: 12, power: 50, element: 'Star' },
  { id: 'ability_constellation_summon', name: 'Constellation Summon', description: 'Project a constellation onto the battlefield, calling down a shower of star fragments on all enemies.', cooldown: 25, power: 70, element: 'Star' },
  { id: 'ability_celestial_navigation', name: 'Celestial Navigation', description: 'Read the stars to reveal hidden paths, detect nearby threats, and determine the optimal route through any terrain.', cooldown: 10, power: 20, element: 'Star' },
  { id: 'ability_nova_flare', name: 'Nova Flare', description: 'Release a blinding burst of starlight that stuns all enemies and restores energy to all allies in range.', cooldown: 50, power: 90, element: 'Star' },

  // Moon (4)
  { id: 'ability_moonbeam_barrage', name: 'Moonbeam Barrage', description: 'Call down concentrated beams of moonlight that strike multiple targets with precision, healing allies and burning enemies.', cooldown: 18, power: 45, element: 'Moon' },
  { id: 'ability_lunar_eclipse', name: 'Lunar Eclipse', description: 'Temporarily plunge the battlefield into darkness, blinding enemies while enhancing shadow elf abilities.', cooldown: 35, power: 65, element: 'Moon' },
  { id: 'ability_tidal_moon', name: 'Tidal Moon', description: 'Tap into the moon\'s gravitational influence to manipulate water and earth, creating tidal waves and earthquakes.', cooldown: 40, power: 75, element: 'Moon' },
  { id: 'ability_silver_healing', name: 'Silver Healing', description: 'Bathe an ally in pure moonlight, rapidly regenerating their health and curing all negative status effects.', cooldown: 20, power: 60, element: 'Moon' },

  // Sun (3)
  { id: 'ability_solar_ray', name: 'Solar Ray', description: 'Focus sunlight into a devastating beam that can cut through stone and metal. Most effective during daytime.', cooldown: 15, power: 55, element: 'Sun' },
  { id: 'ability_photosynthesis_burst', name: 'Photosynthesis Burst', description: 'Supercharge all plant life in the area, causing explosive growth that damages enemies and creates cover.', cooldown: 22, power: 50, element: 'Sun' },
  { id: 'ability_dawnblade', name: 'Dawnblade', description: 'Conjure a sword of solidified sunrise light. It burns with the warmth of a new day and dispels all shadow magic.', cooldown: 30, power: 70, element: 'Sun' },

  // Frost (4)
  { id: 'ability_frostbloom_freeze', name: 'Frostbloom Freeze', description: 'Release a wave of frost that freezes all moisture in the area, encasing enemies in crystal ice.', cooldown: 16, power: 48, element: 'Frost' },
  { id: 'ability_crystal_shard_rain', name: 'Crystal Shard Rain', description: 'Summon a rain of razor-sharp frost crystals that shred enemy armor and slow their movements.', cooldown: 28, power: 62, element: 'Frost' },
  { id: 'ability_glacial_wall', name: 'Glacial Wall', description: 'Raise an impenetrable wall of enchanted ice that absorbs damage and reflects frost-based attacks.', cooldown: 20, power: 40, element: 'Frost' },
  { id: 'ability_absolute_zero', name: 'Absolute Zero', description: 'Instantly freeze a single target to absolute zero, shattering them along molecular fractures.', cooldown: 60, power: 100, element: 'Frost' },

  // Shadow (3)
  { id: 'ability_shadow_step', name: 'Shadow Step', description: 'Meld into the nearest shadow and reappear behind any target within range, delivering a devastating surprise attack.', cooldown: 8, power: 35, element: 'Shadow' },
  { id: 'ability_darkness_consume', name: 'Darkness Consume', description: 'Summon an area of absolute darkness that drains the life force of all enemies trapped within.', cooldown: 35, power: 72, element: 'Shadow' },
  { id: 'ability_void_slash', name: 'Void Slash', description: 'Attack with a blade that cuts through the fabric of reality itself, ignoring all defenses and resistances.', cooldown: 45, power: 88, element: 'Shadow' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: EL_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const EL_ACHIEVEMENTS: readonly ELAchievementDef[] = [
  { id: 'ach_first_steps', name: 'First Steps into the Grove', description: 'Explore your first sacred grove.', condition: 'Explore 1 grove', reward: '+50 gold, +10 nature energy' },
  { id: 'ach_grove_walker', name: 'Grove Walker', description: 'Explore all 8 sacred groves.', condition: 'Explore 8 groves', reward: '+500 gold, rare essence bundle' },
  { id: 'ach_first_recruit', name: 'First Companion', description: 'Recruit your first elven being.', condition: 'Recruit 1 elf', reward: '+100 gold, +20 nature energy' },
  { id: 'ach_elf_council', name: 'Elf Council', description: 'Recruit 15 elven beings.', condition: 'Recruit 15 elves', reward: '+1000 gold, uncommon instrument' },
  { id: 'ach_elf_legion', name: 'Elf Legion', description: 'Recruit 35 elven beings (one of each).', condition: 'Recruit 35 elves', reward: '+5000 gold, legendary essence' },
  { id: 'ach_essence_collector', name: 'Essence Collector', description: 'Gather 100 essences total.', condition: 'Gather 100 essences', reward: '+200 gold, essence storage upgrade' },
  { id: 'ach_master_gatherer', name: 'Master Gatherer', description: 'Gather 1000 essences total.', condition: 'Gather 1000 essences', reward: '+2000 gold, epic essence bundle' },
  { id: 'ach_first_build', name: 'Grove Foundation', description: 'Build your first grove structure.', condition: 'Build 1 structure', reward: '+150 gold' },
  { id: 'ach_grove_city', name: 'Grove City', description: 'Build 20 grove structures.', condition: 'Build 20 structures', reward: '+3000 gold, legendary structure blueprint' },
  { id: 'ach_master_crafter', name: 'Master Crafter', description: 'Craft 50 items at the enchanted forge.', condition: 'Craft 50 items', reward: '+1500 gold, rare instrument' },
  { id: 'ach_ritual_performer', name: 'Ritual Performer', description: 'Perform 10 grove rituals.', condition: 'Perform 10 rituals', reward: '+800 gold, +50 nature energy' },
  { id: 'ach_ritual_master', name: 'Ritual Master', description: 'Perform 100 grove rituals.', condition: 'Perform 100 rituals', reward: '+5000 gold, epic ritual stone' },
  { id: 'ach_first_awakening', name: 'First Awakening', description: 'Awaken your first elven being.', condition: 'Awaken 1 elf', reward: '+500 gold, awakening crystal' },
  { id: 'ach_festival_goer', name: 'Festival Goer', description: 'Celebrate 5 seasonal festivals.', condition: 'Celebrate 5 festivals', reward: '+600 gold, festival trophy' },
  { id: 'ach_festival_master', name: 'Festival Master', description: 'Celebrate all 12 seasonal festivals.', condition: 'Celebrate 12 festivals', reward: '+3000 gold, legendary instrument' },
  { id: 'ach_world_tree_planted', name: 'World Tree Planted', description: 'Successfully plant a World Tree sapling.', condition: 'Plant 1 World Tree', reward: '+10000 gold, eternal title' },
  { id: 'ach_portal_opener', name: 'Portal Opener', description: 'Activate an interdimensional portal.', condition: 'Activate 1 portal', reward: '+5000 gold, portal key' },
  { id: 'ach_legendary_elf', name: 'Legendary Elf Recruited', description: 'Recruit a legendary elven being.', condition: 'Recruit 1 legendary elf', reward: '+5000 gold, crown of stars' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: EL_TITLES — 8 Elven Titles
// ═══════════════════════════════════════════════════════════════════

export const EL_TITLES: readonly ELTitleDef[] = [
  { id: 'title_leaf_sprite', name: 'Leaf Sprite', description: 'A newcomer to the grove, barely distinguishable from the leaves themselves. Every journey of a thousand forests begins with a single step.', requiredLevel: 1, requiredGroves: 0 },
  { id: 'title_moss_tender', name: 'Moss Tender', description: 'One who has learned to tend the moss gardens and maintain the basic health of the grove. A trusted keeper of small but vital things.', requiredLevel: 5, requiredGroves: 1 },
  { id: 'title_fern_walker', name: 'Fern Walker', description: 'A grove explorer who has walked through the silver fern hollow and returned with knowledge of moonlit paths. The forest no longer hides its secrets from you.', requiredLevel: 10, requiredGroves: 2 },
  { id: 'title_bark_guardian', name: 'Bark Guardian', description: 'A proven defender of the grove who has built structures and recruited allies. The ancient trees acknowledge your dedication with a whisper of approval.', requiredLevel: 18, requiredGroves: 4 },
  { id: 'title_root_channeler', name: 'Root Channeler', description: 'An elf who has connected with the deep root network and can draw power directly from the earth. The World Tree knows your name.', requiredLevel: 25, requiredGroves: 5 },
  { id: 'title_moonweaver', name: 'Moonweaver', description: 'A master of moon magic who can weave lunar energy into solid form. Under the full moon, your power rivals that of the ancient elven lords.', requiredLevel: 33, requiredGroves: 6 },
  { id: 'title_starwarden', name: 'Starwarden', description: 'A guardian of starlight who commands the power of constellations. The stars themselves have appointed you their protector in the mortal realm.', requiredLevel: 42, requiredGroves: 7 },
  { id: 'title_star_crowned_monarch', name: 'Star Crowned Monarch', description: 'The supreme ruler of all elven groves, crowned by the stars themselves. You have planted a World Tree, opened the portals, and united all elf-kind under your banner.', requiredLevel: 50, requiredGroves: 8 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: EL_INSTRUMENTS — 15 Enchanted Instruments
// ═══════════════════════════════════════════════════════════════════

export const EL_INSTRUMENTS: readonly ELInstrumentDef[] = [
  // Common (3)
  { id: 'instr_willow_flute', name: 'Willow Flute', description: 'A flute carved from a living willow branch. Its melodies encourage plant growth and calm woodland creatures.', rarity: 'common', powerBonus: 5, specialAbility: 'Growth Melody' },
  { id: 'instr_acorn_drum', name: 'Acorn Drum', description: 'A small drum with a head made from treated acorn caps. Its rhythm synchronizes with the heartbeat of nearby trees.', rarity: 'common', powerBonus: 4, specialAbility: 'Tree Heartbeat' },
  { id: 'instr_leaf_harp', name: 'Leaf Harp', description: 'A delicate harp strung with threads of living leaf fiber. Each string produces a note that mimics a different bird call.', rarity: 'common', powerBonus: 6, specialAbility: 'Bird Chorus' },

  // Uncommon (3)
  { id: 'instr_moonbell_chime', name: 'Moonbell Chime', description: 'Wind chimes made from moonbell flowers that ring without any wind. Their sound induces peaceful sleep and vivid dreams.', rarity: 'uncommon', powerBonus: 12, specialAbility: 'Dream Chime' },
  { id: 'instr_thornviolin', name: 'Thornviolin', description: 'A violin with a body of living briar wood and strings of spun thorn fiber. Its mournful tone can make enemies weep and lose the will to fight.', rarity: 'uncommon', powerBonus: 15, specialAbility: 'Sorrowful Aria' },
  { id: 'instr_brook_ocarina', name: 'Brook Ocarina', description: 'An ocarina shaped like a frog and made from brook clay. When played near water, it creates illusions of flowing rivers and rain.', rarity: 'uncommon', powerBonus: 10, specialAbility: 'Water Illusion' },

  // Rare (3)
  { id: 'instr_starsong_lyre', name: 'Starsong Lyre', description: 'A lyre with strings of pure starlight. Each note sends a visible beam of light into the sky, and the full spectrum creates constellations.', rarity: 'rare', powerBonus: 28, specialAbility: 'Constellation Sonata' },
  { id: 'instr_ancient_oak_horn', name: 'Ancient Oak Horn', description: 'A war horn carved from a branch of the oldest oak. Its blast shakes the earth, causes trees to march, and instills courage in all allies.', rarity: 'rare', powerBonus: 32, specialAbility: 'Forest March' },
  { id: 'instr_frost_crystal_bell', name: 'Frost Crystal Bell', description: 'A bell made from a single perfect frost crystal. When struck, it emits a tone that freezes moisture in the air and slows time briefly.', rarity: 'rare', powerBonus: 25, specialAbility: 'Time Dilation Chime' },

  // Epic (3)
  { id: 'instr_eclipse_banjo', name: 'Eclipse Banjo', description: 'A banjo with a head of solidified eclipse shadow. Its music creates pockets of altered reality where the normal rules of physics do not apply.', rarity: 'epic', powerBonus: 55, specialAbility: 'Reality Rift Rhythm' },
  { id: 'instr_worldroot_organ', name: 'Worldroot Organ', description: 'A massive organ built into the roots of the World Tree. Its pipes are root channels, and its sound resonates through the entire planet.', rarity: 'epic', powerBonus: 60, specialAbility: 'Planetary Resonance' },
  { id: 'instr_moonsilver_cittern', name: 'Moonsilver Cittern', description: 'A cittern with a body of polished moonsilver and strings of captured moonbeams. Its music can literally shape moonlight into solid constructs.', rarity: 'epic', powerBonus: 50, specialAbility: 'Solid Moonlight Song' },

  // Legendary (3)
  { id: 'instr_voidsong_guitar', name: 'Voidsong Guitar', description: 'A guitar whose strings are threads of the void itself. Playing it creates tears in reality through which anything can pass.', rarity: 'legendary', powerBonus: 100, specialAbility: 'Dimensional Riff' },
  { id: 'instr_genesis_trumpet', name: 'Genesis Trumpet', description: 'The trumpet that was played at the creation of the world. A single note can create life, and three notes can reshape continents.', rarity: 'legendary', powerBonus: 120, specialAbility: 'Genesis Fanfare' },
  { id: 'instr_eternal_aurora_piano', name: 'Eternal Aurora Piano', description: 'A grand piano made entirely of crystallized aurora borealis. Each key produces a different colored light, and playing a full composition creates a living aurora.', rarity: 'legendary', powerBonus: 110, specialAbility: 'Eternal Aurora Concerto' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: EL_FESTIVALS — 12 Seasonal Festivals
// ═══════════════════════════════════════════════════════════════════

export const EL_FESTIVALS: readonly ELFestivalDef[] = [
  { id: 'fest_spring_awakening', name: 'Spring Awakening Festival', description: 'A joyous celebration of the first thaw. Elves dance around the budding trees, plant new seeds, and share the first harvest of spring essences. Nature energy production triples during this festival.', season: 'Spring', duration: 30, effects: ['nature_energy: +200% regeneration', 'essence_yield: +50% all gathering', 'recruit_bonus: +10% common elf chance'] },
  { id: 'fest_moonbloom_night', name: 'Moonbloom Night', description: 'A magical night when moonpetal trees bloom simultaneously across all groves. The air fills with silver pollen, and elves perform the sacred Moonweaving Dance under the full moon.', season: 'Spring', duration: 20, effects: ['moon_essence: +100% yield', 'moon_elf_bonus: +20% recruit chance', 'ritual_power: +30% moon rituals'] },
  { id: 'fest_greenfire_eve', name: 'Greenfire Eve', description: 'The night when sacred green flames erupt from the forest floor. Elves jump over the flames for good fortune and compete in contests of nature magic prowess.', season: 'Summer', duration: 25, effects: ['nature_energy: +100% regeneration', 'ability_cooldown: -20% all abilities', 'crafting_bonus: +25% success rate'] },
  { id: 'fest_starfall_carnival', name: 'Starfall Carnival', description: 'A carnival held during the annual meteor shower. Elves collect falling star fragments and use them to craft temporary magical items and spectacular illusions.', season: 'Summer', duration: 35, effects: ['star_essence: +150% yield', 'star_elf_bonus: +15% recruit chance', 'crafting: legendary essence fragments available'] },
  { id: 'fest_sunreturn_feast', name: 'Sunreturn Feast', description: 'A grand feast celebrating the longest day of the year. Elves share food, music, and stories around massive bonfires. All sunlight-based abilities are greatly enhanced.', season: 'Summer', duration: 15, effects: ['sun_ability_power: +50%', 'nature_energy: +150% regeneration', 'festival_gold: +500 passive income per minute'] },
  { id: 'fest_harvest_moon', name: 'Harvest Moon Festival', description: 'The most important elven harvest celebration. Under the harvest moon, elves gather double the usual amount of essences and perform the Gratitude Ritual.', season: 'Autumn', duration: 30, effects: ['essence_yield: +100% all types', 'ritual_power: +40% all rituals', 'gold_income: +300 passive income per minute'] },
  { id: 'fest_leafdance_pageant', name: 'Leafdance Pageant', description: 'A colorful pageant where elves wear elaborate costumes made of autumn leaves. Dancing competitions determine the best performers, and the winner receives a rare essence.', season: 'Autumn', duration: 20, effects: ['bard_power: +30%', 'instrument_bonus: +20% power bonus', 'festival_reward: rare essence on completion'] },
  { id: 'fest_frost_bloom', name: 'Frost Bloom Festival', description: 'A celebration of the paradoxical beauty of frost flowers. Elves create ice sculptures and compete to grow the most beautiful frozen garden. Frost essences are abundant.', season: 'Winter', duration: 25, effects: ['frost_essence: +120% yield', 'frost_elf_bonus: +15% recruit chance', 'ability_power: +20% frost abilities'] },
  { id: 'fest_longnight_vigil', name: 'Longnight Vigil', description: 'The longest night of the year, when elves keep vigil against the forces of darkness. Shadow essences are strongest, and shadow elves hold their annual conclave.', season: 'Winter', duration: 40, effects: ['shadow_essence: +100% yield', 'shadow_elf_bonus: +20% recruit chance', 'defense_bonus: +30% all structures'] },
  { id: 'fest_twilight_eclipse', name: 'Twilight Eclipse Festival', description: 'A rare festival held during celestial alignments. The boundaries between dimensions thin, making portal activation easier and interdimensional travel possible.', season: 'Special', duration: 10, effects: ['portal_power: +50% activation chance', 'dimensional_essence: available', 'all_elf_bonus: +10% recruit chance all rarities'] },
  { id: 'fest_ancient_pact', name: 'Ancient Pact Remembrance', description: 'A solemn ceremony remembering the pact between elves and the World Tree. Rituals performed during this festival are dramatically more powerful.', season: 'Special', duration: 15, effects: ['ritual_power: +100%', 'world_tree_energy: +50% from sapling structures', 'achievement_progress: +25% all conditions'] },
  { id: 'fest_eternal_star_convergence', name: 'Eternal Star Convergence', description: 'The rarest and most powerful festival, occurring when all seven sacred stars align. All elven power is amplified to its maximum, and legendary events can occur.', season: 'Special', duration: 5, effects: ['all_power: +100%', 'legendary_recruit: +5% base chance', 'all_essences: +200% yield', 'ritual_power: +200%'] },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: EL_RUNES — Ancient Elven Runes (bonus section)
// ═══════════════════════════════════════════════════════════════════

export interface ELRuneDef {
  readonly id: string
  readonly name: string
  readonly symbol: string
  readonly description: string
  readonly element: ELElement
  readonly powerLevel: number
  readonly unlockLevel: number
}

export const EL_RUNES: readonly ELRuneDef[] = [
  { id: 'rune_verdant', name: 'Rune of Verdant Growth', symbol: '𖣱', description: 'An ancient rune carved into the bark of the first tree. When activated, it causes all nearby plants to grow at ten times their normal rate for one hour. The rune glows with a deep emerald light.', element: 'Nature', powerLevel: 10, unlockLevel: 1 },
  { id: 'rune_starfall', name: 'Rune of Starfall', symbol: '✦', description: 'A rune that fell from the sky embedded in a meteorite. It pulses with cosmic energy and can briefly illuminate an area with the brightness of a thousand stars, revealing all hidden things.', element: 'Star', powerLevel: 20, unlockLevel: 5 },
  { id: 'rune_lunar_tide', name: 'Rune of Lunar Tide', symbol: '☽', description: 'A rune that responds to the phases of the moon. When the moon is full, this rune generates a protective field that repels all hostile creatures within a hundred paces.', element: 'Moon', powerLevel: 25, unlockLevel: 10 },
  { id: 'rune_solar_flare', name: 'Rune of Solar Flare', symbol: '☀', description: 'A blazing rune that absorbs sunlight during the day and releases it as a concentrated beam of solar energy when invoked. Devastating against shadow creatures and undead.', element: 'Sun', powerLevel: 30, unlockLevel: 15 },
  { id: 'rune_frostbound', name: 'Rune of Frostbound Eternity', symbol: '❄', description: 'A rune etched into eternal ice that never melts. It maintains a constant zone of sub-zero temperatures around it, freezing any moisture into beautiful but deadly crystalline formations.', element: 'Frost', powerLevel: 35, unlockLevel: 20 },
  { id: 'rune_shadowmeld', name: 'Rune of Shadowmeld', symbol: '◇', description: 'A rune that exists simultaneously in light and shadow. Those who touch it can phase between the material world and the shadow realm at will, becoming intangible for short periods.', element: 'Shadow', powerLevel: 40, unlockLevel: 25 },
  { id: 'rune_earthroot', name: 'Rune of Earthroot', symbol: '⬡', description: 'The deepest rune, connected directly to the planet\'s core. When activated, it causes the ground to shake and rearrange, creating walls of stone, opening chasms, and raising pillars from the earth.', element: 'Earth', powerLevel: 45, unlockLevel: 30 },
  { id: 'rune_worldsong', name: 'Rune of the Worldsong', symbol: '♫', description: 'The master rune that harmonizes all other runes. When all seven elemental runes are arranged around it, they resonate together, producing a chord that can heal the world or destroy it.', element: 'Nature', powerLevel: 50, unlockLevel: 40 },
]

function elRunePower(runeId: string, groveLevel: number): number {
  const rune = EL_RUNES.find((r) => r.id === runeId)
  if (!rune) return 0
  if (groveLevel < rune.unlockLevel) return 0
  const levelBonus = 1 + (groveLevel - rune.unlockLevel) * 0.1
  return Math.floor(rune.powerLevel * levelBonus)
}

function elGetAvailableRunes(groveLevel: number): ELRuneDef[] {
  return EL_RUNES.filter((r) => groveLevel >= r.unlockLevel)
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: GROVE AFFINITY MATRIX
// ═══════════════════════════════════════════════════════════════════

const EL_AFFINITY_MATRIX: Record<ELElement, Record<ELElement, number>> = {
  Nature: { Nature: 1.5, Star: 1.0, Moon: 1.2, Sun: 0.8, Frost: 0.5, Shadow: 0.3, Earth: 1.4 },
  Star:   { Nature: 1.0, Star: 1.5, Moon: 1.3, Sun: 1.4, Frost: 0.6, Shadow: 0.4, Earth: 0.7 },
  Moon:   { Nature: 1.2, Star: 1.3, Moon: 1.5, Sun: 0.9, Frost: 1.0, Shadow: 0.8, Earth: 1.1 },
  Sun:    { Nature: 0.8, Star: 1.4, Moon: 0.9, Sun: 1.5, Frost: 0.4, Shadow: 0.2, Earth: 0.9 },
  Frost:  { Nature: 0.5, Star: 0.6, Moon: 1.0, Sun: 0.4, Frost: 1.5, Shadow: 0.6, Earth: 0.8 },
  Shadow: { Nature: 0.3, Star: 0.4, Moon: 0.8, Sun: 0.2, Frost: 0.6, Shadow: 1.5, Earth: 0.5 },
  Earth:  { Nature: 1.4, Star: 0.7, Moon: 1.1, Sun: 0.9, Frost: 0.8, Shadow: 0.5, Earth: 1.5 },
}

function elGetAffinity(attacker: ELElement, defender: ELElement): number {
  return EL_AFFINITY_MATRIX[attacker]?.[defender] ?? 1.0
}

function elCalculateElfPower(elf: ELRecruitedElf, activeGroveElement: ELElement | null): number {
  const def = EL_ELVES.find((d) => d.id === elf.elfDefId)
  if (!def) return elf.power
  let totalPower = elf.power * (1 + elf.level * 0.12)
  if (elf.awakened) {
    totalPower *= 1.5
  }
  if (activeGroveElement) {
    const affinity = elGetAffinity(def.element, activeGroveElement)
    totalPower *= affinity
  }
  return Math.floor(totalPower)
}

function elGetFestivalBonus(festivalId: string | null, effectType: string): number {
  if (!festivalId) return 0
  const festival = EL_FESTIVALS.find((f) => f.id === festivalId)
  if (!festival) return 0
  for (const effect of festival.effects) {
    if (effect.startsWith(effectType)) {
      const match = effect.match(/\+(\d+)/)
      if (match) {
        return parseInt(match[1], 10)
      }
    }
  }
  return 0
}

function elGetEssenceValue(rarity: ELRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 4
    case 'epic': return 8
    case 'legendary': return 16
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15b: EL_RECIPES — 10 Grove Crafting Recipes
// ═══════════════════════════════════════════════════════════════════

export interface ELRecipeDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredEssences: { essenceId: string; amount: number }[]
  readonly result: string
  readonly rarity: ELRarity
}

export const EL_RECIPES: readonly ELRecipeDef[] = [
  {
    id: 'recipe_moss_salve',
    name: 'Craft Moss Healing Salve',
    description: 'Combine moss thread and moonlight dew to create a soothing salve that heals minor wounds and relieves fatigue. A staple of elven field medicine carried by every ranger and scout.',
    requiredEssences: [{ essenceId: 'moss_thread', amount: 3 }, { essenceId: 'moonlight_dew', amount: 2 }],
    result: 'Moss Healing Salve — Restores 20 HP and removes fatigue for 1 hour.',
    rarity: 'common',
  },
  {
    id: 'recipe_bark_shield',
    name: 'Forge Bark Shield',
    description: 'Weave bark resin and moss thread around a brook pebble core to create a lightweight but durable shield. The bark regenerates slowly when exposed to sunlight, making it nearly self-repairing.',
    requiredEssences: [{ essenceId: 'bark_resin', amount: 4 }, { essenceId: 'moss_thread', amount: 2 }, { essenceId: 'brook_pebble', amount: 1 }],
    result: 'Living Bark Shield — +15 defense, regenerates 1 HP per minute in sunlight.',
    rarity: 'common',
  },
  {
    id: 'recipe_starlight_ink',
    name: 'Brew Starlight Ink',
    description: 'Dissolve starpetal dust in moonlight dew and add a pinch of leafwhisper essence to create luminescent ink. Documents written with this ink glow softly in darkness and cannot be forged.',
    requiredEssences: [{ essenceId: 'starpetal_dust', amount: 5 }, { essenceId: 'moonlight_dew', amount: 3 }, { essenceId: 'leafwhisper_essence', amount: 1 }],
    result: 'Starlight Ink — Glowing ink for writing permanent magical documents and rune inscriptions.',
    rarity: 'common',
  },
  {
    id: 'recipe_moonwell_vial',
    name: 'Brew Moonwell Vial',
    description: 'Combine lunar moss with fern silver extract and moonpetal nectar in a ritual vessel. The resulting liquid glows with pure moonlight and can be used to power moon-aligned enchantments.',
    requiredEssences: [{ essenceId: 'lunar_moss', amount: 4 }, { essenceId: 'fern_silver_extract', amount: 2 }, { essenceId: 'moonpetal_nectar', amount: 1 }],
    result: 'Moonwell Vial — Contains concentrated moonlight energy. Powers moon rituals for 24 hours.',
    rarity: 'uncommon',
  },
  {
    id: 'recipe_frost_amulet',
    name: 'Forge Frost Amulet',
    description: 'Set a crystal brook gem into a frame of frostbloom extract and bind it with root heart crystal dust. The amulet radiates cold and grants its wearer resistance to fire and heat.',
    requiredEssences: [{ essenceId: 'crystal_brook_gem', amount: 1 }, { essenceId: 'frostbloom_extract', amount: 3 }, { essenceId: 'root_heart_crystal', amount: 1 }],
    result: 'Frost Amulet — Grants +50% frost resistance and creates a cold aura that slows nearby enemies.',
    rarity: 'rare',
  },
  {
    id: 'recipe_shadow_cloak',
    name: 'Weave Shadow Cloak',
    description: 'Combine shadow rose thorn with eclipse shadow essence and weave it using moss thread. The resulting cloak bends light around its wearer, making them nearly invisible in dim conditions.',
    requiredEssences: [{ essenceId: 'shadow_rose_thorn', amount: 2 }, { essenceId: 'eclipse_shadow', amount: 1 }, { essenceId: 'moss_thread', amount: 5 }],
    result: 'Shadow Cloak — Grants invisibility in shadows and +40% shadow magic power when worn.',
    rarity: 'rare',
  },
  {
    id: 'recipe_moonsilver_blade',
    name: 'Forge Moonsilver Blade',
    description: 'Melt a moonsilver ingot with star forge core heat, then temper it in genesis moonbeam. The resulting blade is lighter than air, sharper than diamond, and glows with soft lunar light.',
    requiredEssences: [{ essenceId: 'moonsilver_ingot', amount: 2 }, { essenceId: 'star_forge_core', amount: 1 }, { essenceId: 'genesis_moonbeam', amount: 1 }],
    result: 'Moonsilver Blade — Legendary weapon: +80 attack, +30% moon magic, infinite durability.',
    rarity: 'epic',
  },
  {
    id: 'recipe_world_tree_elixir',
    name: 'Brew World Tree Elixir',
    description: 'Combine worldtree sap with genesis seed fragments and aurora essence in a ritual performed at the World Tree sapling. The resulting elixir grants temporary godlike powers to its drinker.',
    requiredEssences: [{ essenceId: 'worldtree_sap', amount: 3 }, { essenceId: 'genesis_seed', amount: 1 }, { essenceId: 'aurora_essence', amount: 1 }],
    result: 'World Tree Elixir — Grants +200% all stats for 10 minutes. Can only be brewed once per month.',
    rarity: 'epic',
  },
  {
    id: 'recipe_eternal_star_crown',
    name: 'Forge Eternal Star Crown',
    description: 'The ultimate crafting recipe: combine primordial star dust with eternal moonlight, void bark shard, and a genesis moonbeam. Forged in the heart of the Eternal Star Grove during the Star Convergence festival.',
    requiredEssences: [{ essenceId: 'primordial_star_dust', amount: 3 }, { essenceId: 'eternal_moonlight', amount: 2 }, { essenceId: 'void_bark_shard', amount: 1 }, { essenceId: 'genesis_moonbeam', amount: 1 }],
    result: 'Eternal Star Crown — Grants mastery over all elements. Required to challenge the World Tree Guardian.',
    rarity: 'legendary',
  },
  {
    id: 'recipe_genesis_bloom',
    name: 'Cultivate Genesis Bloom',
    description: 'Plant a world tree blossom in soil enriched with aurora essence and watered with eternal moonlight. If the stars align, it will grow into a new World Tree sapling, creating a new eternal grove.',
    requiredEssences: [{ essenceId: 'world_tree_blossom', amount: 2 }, { essenceId: 'aurora_essence', amount: 3 }, { essenceId: 'eternal_moonlight', amount: 2 }, { essenceId: 'genesis_seed', amount: 1 }],
    result: 'Genesis Bloom Sapling — A new World Tree sapling. Planting it creates a secondary eternal grove.',
    rarity: 'legendary',
  },
]

function elGetCraftableRecipes(gatheredEssences: Record<string, number>): ELRecipeDef[] {
  return EL_RECIPES.filter((recipe) => {
    return recipe.requiredEssences.every((req) => {
      const owned = gatheredEssences[req.essenceId] || 0
      return owned >= req.amount
    })
  })
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15c: EL_CREATURE_COMPANIONS — Forest Creature Companions
// ═══════════════════════════════════════════════════════════════════

export interface ELCreatureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: ELRarity
  readonly baseHP: number
  readonly baseAttack: number
  readonly companionBonus: string
}

export const EL_CREATURES: readonly ELCreatureDef[] = [
  { id: 'creature_fox_spirit', name: 'Fox Spirit', description: 'A mischievous forest fox with three tails that glows with soft green light. It guides lost travelers to safety and steals shiny objects from enemies during combat.', rarity: 'common', baseHP: 30, baseAttack: 8, companionBonus: '+5% movement speed, +3 gold per kill' },
  { id: 'creature_owl_wisdom', name: 'Wisdom Owl', description: 'An ancient owl whose eyes see through all illusions and darkness. Perched on a ranger\'s shoulder, it provides tactical intelligence and can spot ambushes from hundreds of meters away.', rarity: 'common', baseHP: 25, baseAttack: 5, companionBonus: '+10% detection range, +5% accuracy' },
  { id: 'creature_moss_deer', name: 'Moss Deer', description: 'A gentle deer whose antlers are made of living moss and tiny flowers. It can create patches of healing moss wherever it walks, providing passive regeneration to nearby allies.', rarity: 'common', baseHP: 40, baseAttack: 3, companionBonus: '+2 HP regen per minute, +10 nature affinity' },
  { id: 'creature_crystal_squirrel', name: 'Crystal Squirrel', description: 'A squirrel made of living crystal that collects and stores gemstones. In combat, it hurls stored crystals at enemies with surprising accuracy and force.', rarity: 'uncommon', baseHP: 35, baseAttack: 18, companionBonus: '+5 gold per minute, +15% crystal gathering' },
  { id: 'creature_moonlight_falcon', name: 'Moonlight Falcon', description: 'A falcon whose feathers absorb moonlight and redirect it as blinding flashes. It attacks from above at incredible speed, diving on enemies with razor-sharp talons.', rarity: 'uncommon', baseHP: 45, baseAttack: 25, companionBonus: '+20% aerial detection, +10% star affinity' },
  { id: 'creature_shadow_panther', name: 'Shadow Panther', description: 'A panther that is completely invisible in any shadow or darkness. Its claws are coated in a numbing poison, and it can teleport between shadows within fifty meters.', rarity: 'rare', baseHP: 80, baseAttack: 40, companionBonus: '+30% stealth, +20% shadow affinity, poison claws' },
  { id: 'creature_ancient_treant', name: 'Ancient Treant Guardian', description: 'A sentient tree that has walked the forest for thousands of years. Its bark is harder than steel, its roots can extend underground to trip enemies, and its canopy provides shelter for allies.', rarity: 'epic', baseHP: 200, baseAttack: 30, companionBonus: '+50% defense, natural armor, root trap attack' },
  { id: 'creature_starlight_phoenix', name: 'Starlight Phoenix', description: 'A phoenix born from concentrated starlight. When it dies, it explodes into a shower of stars that damage all nearby enemies before reforming from the light. Can resurrect fallen allies once per battle.', rarity: 'legendary', baseHP: 150, baseAttack: 65, companionBonus: '+100% star affinity, resurrection aura, star explosion on death' },
]

function elGetCreaturePower(creature: ELCreatureDef, level: number): number {
  const mult = 1 + level * 0.15
  return Math.floor((creature.baseHP + creature.baseAttack) * mult)
}

function elGetCreatureRarityColor(rarity: ELRarity): string {
  return elRarityColor(rarity)
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const EL_MAX_ENERGY = 200

const useELStore = create<ELFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      recruitedElves: [] as ELRecruitedElf[],
      gatheredEssences: {} as Record<string, number>,
      structures: [] as ELOwnedStructure[],
      achievements: [] as string[],
      currentTitle: 'title_leaf_sprite',
      collectedInstruments: [] as string[],
      unlockedGroves: ['mossy_glade'] as string[],
      groveLevel: 1,
      groveExp: 0,
      gold: EL_INITIAL_GOLD,
      natureEnergy: EL_INITIAL_ENERGY,
      totalRecruited: 0,
      totalGathered: 0,
      totalUpgraded: 0,
      totalAwakened: 0,
      totalRituals: 0,
      activeFestivalId: null,
      festivalTimer: 0,
      groveState: {
        vitality: 100,
        maxVitality: 100,
        corruption: 0,
        lastBlessedAt: null,
      } as ELGroveState,
      activeGroveId: null,

      // ── elExploreGrove ─────────────────────────────────────────
      elExploreGrove: (groveId: string): boolean => {
        const state = get()
        const grove = EL_GROVES.find((g) => g.id === groveId)
        if (!grove) return false
        if (state.unlockedGroves.includes(groveId)) return false
        if (state.groveLevel < grove.minLevel) return false
        if (state.natureEnergy < 5) return false

        set((prev) => {
          const newXp = prev.groveExp + grove.minLevel * 15
          const newLevel = elLevelFromXp(newXp)
          return {
            unlockedGroves: [...prev.unlockedGroves, groveId],
            activeGroveId: groveId,
            natureEnergy: Math.max(0, prev.natureEnergy - 5),
            groveExp: newXp,
            groveLevel: newLevel,
          }
        })
        return true
      },

      // ── elRecruitElf ───────────────────────────────────────────
      elRecruitElf: (elfId: string): boolean => {
        const state = get()
        const def = EL_ELVES.find((e) => e.id === elfId)
        if (!def) return false
        if (state.natureEnergy < 15) return false

        const cost = Math.floor(50 * elRarityMultiplier(def.rarity))
        if (state.gold < cost) return false

        set((prev) => ({
          recruitedElves: [
            ...prev.recruitedElves,
            {
              id: elGenerateId(),
              elfDefId: elfId,
              name: def.name,
              level: 1,
              currentHP: 50 + def.basePower,
              maxHP: 50 + def.basePower,
              power: def.basePower,
              awakened: false,
              awakeningCount: 0,
              acquiredAt: Date.now(),
            },
          ],
          gold: prev.gold - cost,
          natureEnergy: Math.max(0, prev.natureEnergy - 15),
          totalRecruited: prev.totalRecruited + 1,
        }))
        return true
      },

      // ── elGatherEssence ────────────────────────────────────────
      elGatherEssence: (essenceId: string): number => {
        const state = get()
        const essence = EL_ESSENCES.find((e) => e.id === essenceId)
        if (!essence) return 0
        if (state.natureEnergy < 2) return 0

        const quantity = essence.rarity === 'common' ? 3 : essence.rarity === 'uncommon' ? 2 : 1
        set((prev) => ({
          gatheredEssences: {
            ...prev.gatheredEssences,
            [essenceId]: (prev.gatheredEssences[essenceId] || 0) + quantity,
          },
          natureEnergy: Math.max(0, prev.natureEnergy - 2),
          totalGathered: prev.totalGathered + quantity,
          gold: prev.gold + essence.value * quantity,
        }))
        return quantity
      },

      // ── elUpgradeStructure ─────────────────────────────────────
      elUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const struct = state.structures.find((s) => s.id === structureId)
        if (!struct) return false
        if (struct.level >= 10) return false
        const def = EL_STRUCTURES.find((d) => d.id === struct.structureDefId)
        if (!def) return false

        const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, struct.level))
        if (state.gold < cost) return false

        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === structureId ? { ...s, level: s.level + 1 } : s
          ),
          gold: prev.gold - cost,
          totalUpgraded: prev.totalUpgraded + 1,
        }))
        return true
      },

      // ── elUseAbility ───────────────────────────────────────────
      elUseAbility: (abilityId: string): boolean => {
        const state = get()
        const ability = EL_ABILITIES.find((a) => a.id === abilityId)
        if (!ability) return false
        if (state.natureEnergy < ability.power * 0.5) return false

        set((prev) => ({
          natureEnergy: Math.max(0, prev.natureEnergy - Math.floor(ability.power * 0.5)),
          groveExp: prev.groveExp + ability.power,
          groveLevel: elLevelFromXp(prev.groveExp + ability.power),
        }))
        return true
      },

      // ── elCelebrateFestival ────────────────────────────────────
      elCelebrateFestival: (festivalId: string): boolean => {
        const state = get()
        if (state.activeFestivalId) return false
        const festival = EL_FESTIVALS.find((f) => f.id === festivalId)
        if (!festival) return false
        if (state.natureEnergy < 20) return false

        set((prev) => ({
          activeFestivalId: festivalId,
          festivalTimer: festival.duration,
          natureEnergy: Math.max(0, prev.natureEnergy - 20),
          gold: prev.gold + 200,
        }))
        return true
      },

      // ── elCraftItem ────────────────────────────────────────────
      elCraftItem: (ingredientIds: string[]): boolean => {
        const state = get()
        if (ingredientIds.length === 0) return false

        for (const ingId of ingredientIds) {
          const owned = state.gatheredEssences[ingId] || 0
          if (owned < 1) return false
        }

        set((prev) => {
          const newEssences = { ...prev.gatheredEssences }
          for (const ingId of ingredientIds) {
            newEssences[ingId] = (newEssences[ingId] || 0) - 1
          }
          return {
            gatheredEssences: newEssences,
            gold: prev.gold + ingredientIds.length * 20,
            natureEnergy: Math.min(EL_MAX_ENERGY, prev.natureEnergy + 5),
          }
        })
        return true
      },

      // ── elPlantWorldTree ───────────────────────────────────────
      elPlantWorldTree: (groveId: string): boolean => {
        const state = get()
        if (groveId !== 'eternal_star_grove') return false
        if (!state.unlockedGroves.includes(groveId)) return false
        if (state.groveLevel < 45) return false
        if (state.natureEnergy < 50) return false
        if (state.gold < 10000) return false

        set((prev) => ({
          natureEnergy: Math.max(0, prev.natureEnergy - 50),
          gold: prev.gold - 10000,
          groveState: {
            ...prev.groveState,
            vitality: prev.groveState.maxVitality,
            corruption: 0,
          },
        }))
        return true
      },

      // ── elActivatePortal ───────────────────────────────────────
      elActivatePortal: (portalId: string): boolean => {
        const state = get()
        if (state.natureEnergy < 30) return false
        if (state.gold < 2000) return false

        set((prev) => ({
          natureEnergy: Math.max(0, prev.natureEnergy - 30),
          gold: prev.gold - 2000,
          groveExp: prev.groveExp + 500,
          groveLevel: elLevelFromXp(prev.groveExp + 500),
        }))
        return true
      },

      // ── elEnchantWeapon ────────────────────────────────────────
      elEnchantWeapon: (weaponId: string): boolean => {
        const state = get()
        if (!weaponId) return false
        if (state.natureEnergy < 25) return false
        if (state.gold < 500) return false

        set((prev) => ({
          natureEnergy: Math.max(0, prev.natureEnergy - 25),
          gold: prev.gold - 500,
        }))
        return true
      },

      // ── elPerformRitual ────────────────────────────────────────
      elPerformRitual: (ritualId: string): boolean => {
        const state = get()
        if (!ritualId) return false
        if (state.natureEnergy < 20) return false
        if (state.groveState.corruption > 50) return false

        set((prev) => ({
          natureEnergy: Math.max(0, prev.natureEnergy - 20),
          totalRituals: prev.totalRituals + 1,
          groveState: {
            ...prev.groveState,
            corruption: Math.max(0, prev.groveState.corruption - 5),
          },
        }))
        return true
      },

      // ── elAwakenElf ────────────────────────────────────────────
      elAwakenElf: (instanceId: string): boolean => {
        const state = get()
        const elf = state.recruitedElves.find((e) => e.id === instanceId)
        if (!elf) return false
        if (elf.awakened) return false
        if (elf.level < 10) return false
        if (state.natureEnergy < 30) return false
        if (state.gold < 1000) return false

        set((prev) => ({
          recruitedElves: prev.recruitedElves.map((e) => {
            if (e.id !== instanceId) return e
            const newPower = e.power + elGetAwakeningBonus(e.level, e.awakeningCount)
            return {
              ...e,
              awakened: true,
              awakeningCount: e.awakeningCount + 1,
              power: newPower,
            }
          }),
          natureEnergy: Math.max(0, prev.natureEnergy - 30),
          gold: prev.gold - 1000,
          totalAwakened: prev.totalAwakened + 1,
        }))
        return true
      },

      // ── elPurifyCorruption ─────────────────────────────────────
      elPurifyCorruption: (amount: number): boolean => {
        const state = get()
        if (amount <= 0) return false
        if (state.natureEnergy < 10) return false

        set((prev) => ({
          groveState: {
            ...prev.groveState,
            corruption: Math.max(0, prev.groveState.corruption - amount),
          },
          natureEnergy: Math.max(0, prev.natureEnergy - 10),
        }))
        return true
      },

      // ── elHealGrove ────────────────────────────────────────────
      elHealGrove: (amount: number): boolean => {
        const state = get()
        if (amount <= 0) return false
        if (state.groveState.vitality >= state.groveState.maxVitality) return false

        set((prev) => ({
          groveState: {
            ...prev.groveState,
            vitality: Math.min(prev.groveState.maxVitality, prev.groveState.vitality + amount),
            lastBlessedAt: Date.now(),
          },
        }))
        return true
      },

      // ── elUnlockGrove ──────────────────────────────────────────
      elUnlockGrove: (groveId: string): boolean => {
        const state = get()
        const grove = EL_GROVES.find((g) => g.id === groveId)
        if (!grove) return false
        if (state.unlockedGroves.includes(groveId)) return false
        if (state.groveLevel < grove.minLevel) return false

        set((prev) => ({
          unlockedGroves: [...prev.unlockedGroves, groveId],
        }))
        return true
      },

      // ── elCollectInstrument ───────────────────────────────────
      elCollectInstrument: (instrumentId: string): boolean => {
        const state = get()
        const instrument = EL_INSTRUMENTS.find((i) => i.id === instrumentId)
        if (!instrument) return false
        if (state.collectedInstruments.includes(instrumentId)) return false

        const cost = Math.floor(100 * elRarityMultiplier(instrument.rarity))
        if (state.gold < cost) return false

        set((prev) => ({
          collectedInstruments: [...prev.collectedInstruments, instrumentId],
          gold: prev.gold - cost,
        }))
        return true
      },
    }),
    {
      name: 'elven-grove-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: INTERNAL HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function elCheckAchievementCondition(state: ELStoreState, achievementId: string): boolean {
  switch (achievementId) {
    case 'ach_first_steps':
      return state.unlockedGroves.length >= 2
    case 'ach_grove_walker':
      return state.unlockedGroves.length >= 8
    case 'ach_first_recruit':
      return state.recruitedElves.length >= 1
    case 'ach_elf_council':
      return state.recruitedElves.length >= 15
    case 'ach_elf_legion':
      return state.recruitedElves.length >= 35
    case 'ach_essence_collector':
      return state.totalGathered >= 100
    case 'ach_master_gatherer':
      return state.totalGathered >= 1000
    case 'ach_first_build':
      return state.structures.length >= 1
    case 'ach_grove_city':
      return state.structures.length >= 20
    case 'ach_master_crafter':
      return state.totalUpgraded >= 50
    case 'ach_ritual_performer':
      return state.totalRituals >= 10
    case 'ach_ritual_master':
      return state.totalRituals >= 100
    case 'ach_first_awakening':
      return state.totalAwakened >= 1
    case 'ach_festival_goer':
      return state.achievements.filter((a) => a.startsWith('ach_festival')).length >= 1
    case 'ach_festival_master':
      return state.achievements.filter((a) => a.startsWith('ach_festival')).length >= 2
    case 'ach_world_tree_planted':
      return state.groveState.vitality >= state.groveState.maxVitality && state.groveLevel >= 45
    case 'ach_portal_opener':
      return state.groveExp >= 5000
    case 'ach_legendary_elf':
      return state.recruitedElves.some((elf) => {
        const def = EL_ELVES.find((d) => d.id === elf.elfDefId)
        return def && def.rarity === 'legendary'
      })
    default:
      return false
  }
}

function elGetClassColor(elfClass: ELClass): string {
  switch (elfClass) {
    case 'Ranger': return EL_COLOR_FOREST_GREEN
    case 'Mage': return EL_COLOR_DEWDROP_BLUE
    case 'Bard': return EL_COLOR_PETAL_PINK
    case 'Healer': return EL_COLOR_SILVER_MOONLIGHT
    case 'Shadow': return EL_COLOR_MOSS_BROWN
    case 'Smith': return EL_COLOR_ANCIENT_AMBER
    case 'Sentinel': return EL_COLOR_MIST_WHITE
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: DEFAULT EXPORT HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useElvenGrove() {
  const store = useELStore()

  // ── Getter: Grove Details ─────────────────────────────────────
  const {
    elGroveDetails,
    elEssenceInventory,
    elRecruitedElfList,
    elStructureList,
    elTotalPower,
    elGroveStateInfo,
    elActiveFestival,
    elFestivalStatus,
    elGroveSummary,
    elUnlockedAchievements,
    elTitleProgress,
    elNextTitle,
    elLevelProgress,
    elRaritySummary,
  } = useMemo(() => {
    // Grove details
    const groveDetails = EL_GROVES.map((grove) => ({
      ...grove,
      unlocked: store.unlockedGroves.includes(grove.id),
      active: store.activeGroveId === grove.id,
      availableEssences: EL_ESSENCES
        .filter((e) => e.source === grove.id)
        .map((essence) => ({
          ...essence,
          owned: store.gatheredEssences[essence.id] || 0,
          rarityColor: elRarityColor(essence.rarity),
        })),
    }))

    // Essence inventory
    const essenceInventory = EL_ESSENCES.map((essence) => ({
      ...essence,
      owned: store.gatheredEssences[essence.id] || 0,
      rarityColor: elRarityColor(essence.rarity),
    }))

    // Recruited elf list
    const recruitedElfList = store.recruitedElves.map((elf) => {
      const def = EL_ELVES.find((d) => d.id === elf.elfDefId)
      return {
        ...elf,
        def,
        classColor: def ? elGetClassColor(def.elfClass) : EL_COLOR_FOREST_GREEN,
        rarityColor: def ? elRarityColor(def.rarity) : '#9CA3AF',
        totalPower: elf.power * (1 + elf.level * 0.12),
      }
    })

    // Structure list
    const structureList = store.structures.map((s) => {
      const def = EL_STRUCTURES.find((d) => d.id === s.structureDefId)
      return {
        ...s,
        def,
        upgradeCost: def
          ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level))
          : 0,
        maxed: s.level >= 10,
      }
    })

    // Total power
    let elfPower = 0
    for (const elf of store.recruitedElves) {
      elfPower += Math.floor(elf.power * (1 + elf.level * 0.12))
    }
    const structurePower = store.structures.reduce(
      (sum, s) => sum + s.level * 12,
      0
    )

    // Grove state info
    const groveStateInfo = {
      vitality: store.groveState.vitality,
      maxVitality: store.groveState.maxVitality,
      corruption: store.groveState.corruption,
      healthPercent: Math.floor((store.groveState.vitality / store.groveState.maxVitality) * 100),
      corruptionPercent: Math.floor(store.groveState.corruption),
      isHealthy: store.groveState.corruption < 25,
      isCritical: store.groveState.corruption > 75,
    }

    // Active festival
    let activeFestivalData = null
    if (store.activeFestivalId) {
      activeFestivalData = EL_FESTIVALS.find((f) => f.id === store.activeFestivalId) || null
    }

    // Festival status
    const festivalStatus = {
      active: store.activeFestivalId !== null,
      festival: activeFestivalData,
      timer: store.festivalTimer,
    }

    // Grove summary
    const groveSummary = {
      totalGroves: EL_GROVES.length,
      unlocked: store.unlockedGroves.length,
      percent: Math.floor((store.unlockedGroves.length / EL_GROVES.length) * 100),
      allUnlocked: store.unlockedGroves.length >= EL_GROVES.length,
    }

    // Unlocked achievements
    const unlockedAchievements: ELAchievementDef[] = []
    const claimableAchievements: ELAchievementDef[] = []
    for (const ach of EL_ACHIEVEMENTS) {
      if (store.achievements.includes(ach.id)) {
        unlockedAchievements.push(ach)
      } else if (elCheckAchievementCondition(store, ach.id)) {
        claimableAchievements.push(ach)
      }
    }

    // Title progress
    const titleProgress = EL_TITLES.map((title) => ({
      ...title,
      unlocked: store.groveLevel >= title.requiredLevel && store.unlockedGroves.length >= title.requiredGroves,
      active: store.currentTitle === title.id,
      levelMet: store.groveLevel >= title.requiredLevel,
      groveMet: store.unlockedGroves.length >= title.requiredGroves,
    }))

    // Next title
    const currentTitleObj = EL_TITLES.find((t) => t.id === store.currentTitle)
    const currentIndex = currentTitleObj ? EL_TITLES.indexOf(currentTitleObj) : -1
    const nextTitleData = currentIndex >= EL_TITLES.length - 1 ? null : EL_TITLES[currentIndex + 1]

    // Level progress
    const currentXpNeeded = elXpForLevel(store.groveLevel)
    const levelProgressData = {
      level: store.groveLevel,
      currentXp: store.groveExp,
      xpToNext: currentXpNeeded,
      maxLevel: store.groveLevel >= EL_MAX_LEVEL,
      progressPercent:
        currentXpNeeded > 0 ? Math.min(100, Math.floor((store.groveExp / currentXpNeeded) * 100)) : 0,
    }

    // Rarity summary
    const raritySummary: Record<ELRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const elf of store.recruitedElves) {
      const def = EL_ELVES.find((d) => d.id === elf.elfDefId)
      if (def) {
        raritySummary[def.rarity] += 1
      }
    }

    return {
      elGroveDetails: groveDetails,
      elEssenceInventory: essenceInventory,
      elRecruitedElfList: recruitedElfList,
      elStructureList: structureList,
      elTotalPower: { elfPower, structurePower, total: elfPower + structurePower },
      elGroveStateInfo: groveStateInfo,
      elActiveFestival: activeFestivalData,
      elFestivalStatus: festivalStatus,
      elGroveSummary: groveSummary,
      elUnlockedAchievements: { unlocked: unlockedAchievements, claimable: claimableAchievements, total: EL_ACHIEVEMENTS.length, progress: unlockedAchievements.length },
      elTitleProgress: titleProgress,
      elNextTitle: nextTitleData,
      elLevelProgress: levelProgressData,
      elRaritySummary: raritySummary,
    }
  }, [store])

  // ── Assemble elAPI ───────────────────────────────────────────
  const elAPI = {
    // Constants
    EL_ELVES,
    EL_GROVES,
    EL_ESSENCES,
    EL_STRUCTURES,
    EL_ABILITIES,
    EL_ACHIEVEMENTS,
    EL_TITLES,
    EL_INSTRUMENTS,
    EL_FESTIVALS,

    // Color Constants
    EL_COLOR_FOREST_GREEN,
    EL_COLOR_SILVER_MOONLIGHT,
    EL_COLOR_GOLDEN_STARLIGHT,
    EL_COLOR_MOSS_BROWN,
    EL_COLOR_PETAL_PINK,
    EL_COLOR_DEWDROP_BLUE,
    EL_COLOR_ANCIENT_AMBER,
    EL_COLOR_MIST_WHITE,

    // Store state
    ...store,

    // Computed getters
    elGroveDetails,
    elEssenceInventory,
    elRecruitedElfList,
    elStructureList,
    elTotalPower,
    elGroveStateInfo,
    elActiveFestival,
    elFestivalStatus,
    elGroveSummary,
    elUnlockedAchievements,
    elTitleProgress,
    elNextTitle,
    elLevelProgress,
    elRaritySummary,

    // Runes
    EL_RUNES,

    // Recipes
    EL_RECIPES,

    // Helper functions
    elRarityColor,
    elElementColor,
    elRarityMultiplier,
    elGetElementBonus,
    elGetClassColor,
    elGetAffinity,
    elRunePower,
    elGetAvailableRunes,
    elGetFestivalBonus,
    elGetEssenceValue,
    elCalculateElfPower,
    elGetCraftableRecipes,
  }

  return elAPI
}
