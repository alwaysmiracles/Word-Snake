/**
 * Karma Monastery Wire — 因果寺院 (Karma Monastery) feature module for Word Snake
 *
 * A mystical mountain monastery where karma shapes reality. Recruit 35 monks across
 * 7 species, explore 8 shrine chambers, collect 12 sacred materials, build 8 temple
 * structures, master 8 spiritual abilities, earn 10 achievements, unlock 8 titles,
 * discover 6 legendary artifacts, and face 8 karma events.
 *
 * Storage key: karma-monastery-save
 * Prefix: km / KM_
 */

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

export type KmRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type KmSpecies =
  | 'zen_monk'
  | 'karma_guardian'
  | 'lotus_priest'
  | 'jade_sage'
  | 'thunder_recluse'
  | 'mist_wanderer'
  | 'dharma_beast'

export type KmAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon'

export type KmStructureBonusType =
  | 'meditation_boost'
  | 'karma_income'
  | 'resource_yield'
  | 'chant_power'
  | 'enlightenment_rate'
  | 'purify_speed'
  | 'offering_value'
  | 'garden_growth'

export type KmMaterialCategory =
  | 'herbal'
  | 'mineral'
  | 'spiritual'
  | 'crafted'
  | 'divine'

export interface KmSpeciesDef {
  readonly id: KmSpecies
  readonly name: string
  readonly emoji: string
  readonly color: string
  readonly description: string
  readonly lore: string
  readonly basePower: number
  readonly baseDefense: number
}

export interface KmCreatureDef {
  readonly id: string
  readonly name: string
  readonly species: KmSpecies
  readonly rarity: KmRarity
  readonly description: string
  readonly lore: string
  readonly emoji: string
  readonly power: number
  readonly defense: number
  readonly cost: number
  readonly xpReward: number
}

export interface KmCreatureInstance {
  readonly id: string
  creatureDefId: string
  name: string
  level: number
  xp: number
  karma: number
  meditationHours: number
  recruitedAt: number
}

export interface KmChamberDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly lore: string
  readonly emoji: string
  readonly level: number
  readonly resources: string[]
  readonly capacity: number
  readonly unlockLevel: number
  readonly ambientColor: string
  readonly dangerLevel: number
}

export interface KmMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: KmMaterialCategory
  readonly rarity: KmRarity
  readonly value: number
  readonly description: string
}

export interface KmStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: string
  readonly bonusType: KmStructureBonusType
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface KmStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface KmAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: KmAbilityCategory
  readonly species: KmSpecies
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface KmAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { karma: number; coins: number }
}

export interface KmTitleDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly minLevel: number
  readonly minMonks: number
  readonly description: string
}

export interface KmArtifactDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: KmRarity
  readonly species: KmSpecies
  readonly powerBoost: number
  readonly defenseBoost: number
  readonly karmaBoost: number
  readonly value: number
  readonly description: string
  readonly lore: string
}

export interface KmEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface KmInventoryItem {
  materialId: string
  count: number
}

export interface KmEventLogEntry {
  eventId: string
  triggeredAt: number
  resolvedAt: number | null
}

export interface KmMonasteryState {
  level: number
  xp: number
  coins: number
  totalXp: number
  totalCoins: number
  monks: KmCreatureInstance[]
  inventory: KmInventoryItem[]
  structures: KmStructureInstance[]
  artifacts: string[]
  abilities: string[]
  achievements: string[]
  chambers: string[]
  eventLog: KmEventLogEntry[]
  activeEvent: KmEventDef | null
  activeEventTurnsRemaining: number
  currentTitle: string
  totalMeditated: number
  totalChanted: number
  totalOffered: number
  totalCultivated: number
  totalStudied: number
  totalPurified: number
  totalAscended: number
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: KM_ CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const KM_SAVE_KEY = 'karma-monastery-save'
export const KM_MAX_LEVEL = 50
export const KM_STARTING_COINS = 300
export const KM_STARTING_XP = 0
export const KM_BASE_XP_PER_LEVEL = 100
export const KM_XP_SCALING_FACTOR = 1.15
export const KM_AUTO_SAVE_INTERVAL_MS = 30_000
export const KM_MAX_INVENTORY_STACK = 9999
export const KM_ACTION_COOLDOWN_MS = 1_000
export const KM_MEDITATION_BASE_XP = 12
export const KM_CHANT_BASE_XP = 15
export const KM_OFFER_BASE_COINS = 8
export const KM_CULTIVATE_BASE_COINS = 10
export const KM_STUDY_BASE_XP = 20
export const KM_PURIFY_BASE_XP = 14
export const KM_ASCEND_BASE_XP = 50
export const KM_RARITY_ORDER: readonly KmRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

function kmCalcXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= KM_MAX_LEVEL) return Infinity
  return Math.floor(KM_BASE_XP_PER_LEVEL * Math.pow(KM_XP_SCALING_FACTOR, level) + level * 12)
}

function kmCalcRarityMultiplier(rarity: KmRarity): number {
  switch (rarity) {
    case 'common': return 1.0
    case 'uncommon': return 1.5
    case 'rare': return 2.2
    case 'epic': return 3.5
    case 'legendary': return 6.0
  }
}

function kmCalcRarityColor(rarity: KmRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'
    case 'uncommon': return '#00A86B'
    case 'rare': return '#FF9933'
    case 'epic': return '#6B3FA0'
    case 'legendary': return '#DAA520'
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const KM_THEME = {
  saffronOrange: '#FF9933',
  jadeGreen: '#00A86B',
  lotusPink: '#FFB7C5',
  templeGold: '#DAA520',
  mistGray: '#C0C0C0',
  zenBlack: '#1A1A2E',
  incensePurple: '#6B3FA0',
} as const

export const KM_COLOR_SAFFRON = KM_THEME.saffronOrange
export const KM_COLOR_JADE = KM_THEME.jadeGreen
export const KM_COLOR_LOTUS = KM_THEME.lotusPink
export const KM_COLOR_TEMPLE_GOLD = KM_THEME.templeGold
export const KM_COLOR_MIST = KM_THEME.mistGray
export const KM_COLOR_ZEN_BLACK = KM_THEME.zenBlack
export const KM_COLOR_INCENSE = KM_THEME.incensePurple

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: KM_SPECIES — 7 Monk Types
// ═══════════════════════════════════════════════════════════════════

export const KM_SPECIES: readonly KmSpeciesDef[] = [
  {
    id: 'zen_monk',
    name: 'Zen Monk',
    emoji: '🧘',
    color: KM_THEME.saffronOrange,
    description:
      'Disciples of pure meditation who seek enlightenment through stillness and inner peace. Their calm presence soothes all who enter the monastery.',
    lore:
      'The first Zen Monks descended from the clouds at the monastery\'s founding, drawn by the mountain\'s natural harmonic resonance. They believe that every breath is a universe.',
    basePower: 8,
    baseDefense: 6,
  },
  {
    id: 'karma_guardian',
    name: 'Karma Guardian',
    emoji: '🛡️',
    color: KM_THEME.jadeGreen,
    description:
      'Warrior-monks who protect the monastery and enforce the cosmic law of cause and effect. Their shields are forged from crystallized good deeds.',
    lore:
      'Forged in the karmic fires of a thousand lifetimes, Karma Guardians are the monastery\'s first and last line of defense. They can sense wrongdoing from across the mountain.',
    basePower: 12,
    baseDefense: 10,
  },
  {
    id: 'lotus_priest',
    name: 'Lotus Priest',
    emoji: '🪷',
    color: KM_THEME.lotusPink,
    description:
      'Healers and spiritual guides who channel the purifying energy of the sacred lotus. Their prayers mend body and soul alike.',
    lore:
      'Lotus Priests train for decades at the monastery\'s reflecting pools, learning to draw healing energy from the eternal lotus that blooms in the heart of the sacred lake.',
    basePower: 6,
    baseDefense: 14,
  },
  {
    id: 'jade_sage',
    name: 'Jade Sage',
    emoji: '💚',
    color: KM_THEME.templeGold,
    description:
      'Elders who have accumulated centuries of wisdom. Their jade amulets glow brighter with each truth they uncover.',
    lore:
      'The Jade Sages are the oldest beings in the monastery, some having served since the mountain itself first rose from the earth. Their memories contain the complete history of karma.',
    basePower: 10,
    baseDefense: 8,
  },
  {
    id: 'thunder_recluse',
    name: 'Thunder Recluse',
    emoji: '⚡',
    color: KM_THEME.zenBlack,
    description:
      'Mysterious ascetics who meditate atop lightning rods during storms. They harness the raw power of nature through disciplined stillness.',
    lore:
      'Thunder Recluses choose the most dangerous meditation spots — cliff edges and lightning rods during tempests. They believe that enlightenment comes from embracing chaos.',
    basePower: 16,
    baseDefense: 4,
  },
  {
    id: 'mist_wanderer',
    name: 'Mist Wanderer',
    emoji: '🌫️',
    color: KM_THEME.mistGray,
    description:
      'Nomadic monks who walk between the mortal and spirit realms. The mountain mists part at their approach, revealing hidden paths.',
    lore:
      'Mist Wanderers never stay in one place for more than a day. They carry messages between the monastery chambers and the spirit world, guided only by the whispering winds.',
    basePower: 9,
    baseDefense: 9,
  },
  {
    id: 'dharma_beast',
    name: 'Dharma Beast',
    emoji: '🐉',
    color: KM_THEME.incensePurple,
    description:
      'Sacred creatures who have achieved enlightenment through countless reincarnations. They embody the dharma in physical form.',
    lore:
      'Legend says the first Dharma Beast was a dragon who chose to become mortal to understand suffering. After ten thousand lifetimes, it achieved a form that is neither beast nor human, but pure dharma.',
    basePower: 14,
    baseDefense: 12,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: KM_CREATURES — 35 Creatures (5 tiers × 7 species)
// ═══════════════════════════════════════════════════════════════════

export const KM_CREATURES: readonly KmCreatureDef[] = [
  // ── Zen Monk (5) ──────────────────────────────────────────────
  {
    id: 'zen_novice',
    name: 'Zen Novice',
    species: 'zen_monk',
    rarity: 'common',
    description: 'A young disciple just beginning the path of meditation. Their mind is clouded but their spirit is pure.',
    lore: 'Every master was once a novice, sitting cross-legged and wondering why their legs hurt so much.',
    emoji: '🧒',
    power: 8,
    defense: 6,
    cost: 30,
    xpReward: 10,
  },
  {
    id: 'zen_breathkeeper',
    name: 'Breathkeeper',
    species: 'zen_monk',
    rarity: 'common',
    description: 'A monk who has learned to control their breath to the rhythm of the universe. Each inhale draws in peace.',
    lore: 'The Breathkeeper can slow their heartbeat to once per minute, entering a state between life and meditation.',
    emoji: '🌬️',
    power: 12,
    defense: 8,
    cost: 50,
    xpReward: 15,
  },
  {
    id: 'zen_mindweaver',
    name: 'Mindweaver',
    species: 'zen_monk',
    rarity: 'uncommon',
    description: 'An advanced meditator who can weave thoughts into visible threads of light. Their mental tapestries reveal hidden truths.',
    lore: 'Mindweavers spend years in total darkness, training their inner eye to perceive the patterns woven by karma itself.',
    emoji: '🧵',
    power: 18,
    defense: 14,
    cost: 150,
    xpReward: 30,
  },
  {
    id: 'zen_void_walker',
    name: 'Void Walker',
    species: 'zen_monk',
    rarity: 'rare',
    description: 'A master who has glimpsed the void and returned transformed. Their presence distorts reality around them.',
    lore: 'The Void Walker speaks in riddles not because they wish to be mysterious, but because ordinary language cannot contain what they have seen.',
    emoji: '🕳️',
    power: 30,
    defense: 22,
    cost: 500,
    xpReward: 80,
  },
  {
    id: 'zen_enlightened_one',
    name: 'Enlightened One',
    species: 'zen_monk',
    rarity: 'legendary',
    description: 'A being who has achieved complete enlightenment. They exist simultaneously in all moments and no moments.',
    lore: 'There have been only seven Enlightened Ones in the monastery\'s history. Each one chose to remain as a teacher rather than ascend beyond the mortal plane.',
    emoji: '✨',
    power: 55,
    defense: 40,
    cost: 2000,
    xpReward: 200,
  },

  // ── Karma Guardian (5) ────────────────────────────────────────
  {
    id: 'karma_squire',
    name: 'Karma Squire',
    species: 'karma_guardian',
    rarity: 'common',
    description: 'A young guardian-in-training who carries a shield of woven good intentions. Eager but inexperienced.',
    lore: 'Every Karma Squire begins by performing one thousand acts of kindness to forge their first shield.',
    emoji: '🔰',
    power: 12,
    defense: 10,
    cost: 40,
    xpReward: 12,
  },
  {
    id: 'karma_sentinel',
    name: 'Karma Sentinel',
    species: 'karma_guardian',
    rarity: 'common',
    description: 'A steadfast sentinel who patrols the monastery walls. Their vigilance has prevented a hundred unseen threats.',
    lore: 'Karma Sentinels never sleep. They enter a meditative standing state that is both rest and readiness.',
    emoji: '⚔️',
    power: 18,
    defense: 14,
    cost: 65,
    xpReward: 18,
  },
  {
    id: 'karma_warden',
    name: 'Karma Warden',
    species: 'karma_guardian',
    rarity: 'uncommon',
    description: 'A seasoned warden who can see the karmic threads connecting all beings. They strike only when karma demands it.',
    lore: 'The Karma Warden\'s blade cuts not flesh but the bonds of negative karma, severing cycles of suffering.',
    emoji: '⚖️',
    power: 28,
    defense: 20,
    cost: 200,
    xpReward: 40,
  },
  {
    id: 'karma_executioner',
    name: 'Karma Executioner',
    species: 'karma_guardian',
    rarity: 'rare',
    description: 'A fearsome warrior who delivers karmic justice to those who have accumulated too much negative karma.',
    lore: 'The Karma Executioner is both loved and feared. They do not choose their targets — karma itself guides their blade.',
    emoji: '🗡️',
    power: 42,
    defense: 30,
    cost: 700,
    xpReward: 100,
  },
  {
    id: 'karma_lord',
    name: 'Lord of Retribution',
    species: 'karma_guardian',
    rarity: 'legendary',
    description: 'The supreme guardian who embodies the law of cause and effect. Their mere presence causes the wicked to tremble.',
    lore: 'The Lord of Retribution has existed since the first act of karma was recorded. They are the universe\'s memory of every deed.',
    emoji: '👑',
    power: 70,
    defense: 55,
    cost: 3000,
    xpReward: 250,
  },

  // ── Lotus Priest (5) ──────────────────────────────────────────
  {
    id: 'lotus_acolyte',
    name: 'Lotus Acolyte',
    species: 'lotus_priest',
    rarity: 'common',
    description: 'A young priest learning the healing arts beside the sacred lotus pools. Their prayers are gentle but growing stronger.',
    lore: 'Lotus Acolytes must tend the sacred pools for three years before they are permitted to touch a lotus bloom.',
    emoji: '🌱',
    power: 6,
    defense: 14,
    cost: 35,
    xpReward: 11,
  },
  {
    id: 'lotus_channeler',
    name: 'Lotus Channeler',
    species: 'lotus_priest',
    rarity: 'common',
    description: 'A priest who can channel healing energy through lotus petals. Their touch mends wounds and calms troubled minds.',
    lore: 'The Lotus Channeler carries a living lotus bloom that never wilts. It pulses with the rhythm of the priest\'s heartbeat.',
    emoji: '🌸',
    power: 10,
    defense: 18,
    cost: 55,
    xpReward: 16,
  },
  {
    id: 'lotus_high_priest',
    name: 'High Lotus Priest',
    species: 'lotus_priest',
    rarity: 'uncommon',
    description: 'A senior priest whose prayers can purify even the deepest spiritual corruption. The lotus blooms wherever they walk.',
    lore: 'When the High Lotus Priest prays, the air fills with the scent of lotus and all negative karma within a mile is temporarily suspended.',
    emoji: '🏵️',
    power: 16,
    defense: 28,
    cost: 180,
    xpReward: 35,
  },
  {
    id: 'lotus_avatar',
    name: 'Lotus Avatar',
    species: 'lotus_priest',
    rarity: 'rare',
    description: 'A priest who has become one with the lotus spirit. Their body is partially composed of living lotus petals.',
    lore: 'The Lotus Avatar can resurrect a fallen monk by transferring a portion of their own life force through a lotus bloom.',
    emoji: '🪷',
    power: 24,
    defense: 45,
    cost: 600,
    xpReward: 90,
  },
  {
    id: 'lotus_bodhisattva',
    name: 'Lotus Bodhisattva',
    species: 'lotus_priest',
    rarity: 'legendary',
    description: 'A being of pure compassion who has vowed to heal all suffering in the world before achieving final enlightenment.',
    lore: 'The Lotus Bodhisattva\'s tears become lotus blooms when they touch the ground. A single tear can purify an entire poisoned lake.',
    emoji: '🕊️',
    power: 35,
    defense: 70,
    cost: 2500,
    xpReward: 220,
  },

  // ── Jade Sage (5) ─────────────────────────────────────────────
  {
    id: 'jade_scholar',
    name: 'Jade Scholar',
    species: 'jade_sage',
    rarity: 'common',
    description: 'A studious apprentice who devours ancient texts by candlelight. Their jade pendant glows dimly with acquired knowledge.',
    lore: 'Jade Scholars believe that knowledge is the heaviest substance in the universe, heavier than mountains or oceans.',
    emoji: '📚',
    power: 10,
    defense: 8,
    cost: 45,
    xpReward: 13,
  },
  {
    id: 'jade_historian',
    name: 'Jade Historian',
    species: 'jade_sage',
    rarity: 'common',
    description: 'A keeper of the monastery\'s vast archives. They can recall any event from the last thousand years with perfect clarity.',
    lore: 'The Jade Historian does not read books — they touch them and absorb the knowledge through their fingertips in seconds.',
    emoji: '📜',
    power: 15,
    defense: 12,
    cost: 70,
    xpReward: 17,
  },
  {
    id: 'jade_oracle',
    name: 'Jade Oracle',
    species: 'jade_sage',
    rarity: 'uncommon',
    description: 'A sage whose jade amulet allows them to see glimpses of the future. Their predictions are unsettlingly accurate.',
    lore: 'The Jade Oracle\'s amulet was carved from a single jade stone that fell from the sky during a meteor shower three thousand years ago.',
    emoji: '🔮',
    power: 22,
    defense: 18,
    cost: 220,
    xpReward: 45,
  },
  {
    id: 'jade_elder',
    name: 'Jade Elder',
    species: 'jade_sage',
    rarity: 'rare',
    description: 'An ancient sage whose body has partially turned to jade through centuries of accumulated wisdom. Their words carry the weight of ages.',
    lore: 'Jade Elders no longer need to eat or sleep. They sustain themselves purely on the flow of cosmic knowledge.',
    emoji: '🗿',
    power: 35,
    defense: 28,
    cost: 800,
    xpReward: 110,
  },
  {
    id: 'jade_immortal',
    name: 'Jade Immortal',
    species: 'jade_sage',
    rarity: 'legendary',
    description: 'A being of pure jade who has transcended mortality through knowledge alone. They are the living library of all that has ever been known.',
    lore: 'The Jade Immortal was once a mortal scholar who read every book in existence. When there were no more books, they became one.',
    emoji: '💎',
    power: 50,
    defense: 42,
    cost: 3500,
    xpReward: 280,
  },

  // ── Thunder Recluse (5) ───────────────────────────────────────
  {
    id: 'thunder_initiate',
    name: 'Thunder Initiate',
    species: 'thunder_recluse',
    rarity: 'common',
    description: 'A daring monk who has begun training on the lightning peaks. Their hair stands on end from static charge.',
    lore: 'Thunder Initiates must survive their first storm meditation — sitting on a copper rod during a thunderstorm — before they are accepted.',
    emoji: '⛈️',
    power: 16,
    defense: 4,
    cost: 50,
    xpReward: 14,
  },
  {
    id: 'thunder_stormcaller',
    name: 'Stormcaller',
    species: 'thunder_recluse',
    rarity: 'common',
    description: 'A monk who can summon small electrical storms through meditation. Sparks dance between their fingertips at will.',
    lore: 'The Stormcaller does not fear lightning — they invite it. Each strike that hits them during meditation burns away another layer of illusion.',
    emoji: '🔌',
    power: 22,
    defense: 6,
    cost: 80,
    xpReward: 19,
  },
  {
    id: 'thunder_arc_master',
    name: 'Arc Master',
    species: 'thunder_recluse',
    rarity: 'uncommon',
    description: 'A recluse who commands lightning arcs with deadly precision. They can strike a single leaf on a tree from a mile away.',
    lore: 'The Arc Master sees the world as a web of electrical potential. To them, every object is a conductor waiting to be awakened.',
    emoji: '⚡',
    power: 38,
    defense: 10,
    cost: 250,
    xpReward: 50,
  },
  {
    id: 'thunder_tempest',
    name: 'Living Tempest',
    species: 'thunder_recluse',
    rarity: 'rare',
    description: 'A monk who has merged with the storm itself. Lightning permanently arcs across their body and clouds follow them wherever they walk.',
    lore: 'The Living Tempest has not spoken in fifty years. They communicate through thunderclaps that can be heard across the entire mountain.',
    emoji: '🌪️',
    power: 55,
    defense: 18,
    cost: 900,
    xpReward: 130,
  },
  {
    id: 'thunder_celestial',
    name: 'Celestial Thunder',
    species: 'thunder_recluse',
    rarity: 'legendary',
    description: 'A being who embodies the primal force of celestial lightning. Their power rivals that of the storm gods themselves.',
    lore: 'The Celestial Thunder is said to have been born from the first lightning strike that ever illuminated the primordial darkness.',
    emoji: '💫',
    power: 85,
    defense: 25,
    cost: 4000,
    xpReward: 300,
  },

  // ── Mist Wanderer (5) ─────────────────────────────────────────
  {
    id: 'mist_pathfinder',
    name: 'Mist Pathfinder',
    species: 'mist_wanderer',
    rarity: 'common',
    description: 'A wanderer who can navigate the thickest mountain fogs by sensing the emotional residue left on the stones.',
    lore: 'Mist Pathfinders leave small spirit-lanterns along hidden trails, creating a network of guiding lights visible only to the pure of heart.',
    emoji: '🏮',
    power: 9,
    defense: 9,
    cost: 35,
    xpReward: 12,
  },
  {
    id: 'mist_windrunner',
    name: 'Windrunner',
    species: 'mist_wanderer',
    rarity: 'common',
    description: 'A swift wanderer who travels on the wind itself. They can cross the entire mountain range in a single morning.',
    lore: 'Windrunners tie spirit-silk to their ankles, allowing the mountain winds to carry them along invisible aerial pathways.',
    emoji: '💨',
    power: 14,
    defense: 12,
    cost: 60,
    xpReward: 16,
  },
  {
    id: 'mist_phantom',
    name: 'Mist Phantom',
    species: 'mist_wanderer',
    rarity: 'uncommon',
    description: 'A wanderer who can dissolve into mist and reform elsewhere. They are simultaneously everywhere and nowhere.',
    lore: 'Mist Phantoms carry no possessions and leave no footprints. The only proof they exist is the sudden chill in the air they leave behind.',
    emoji: '👤',
    power: 20,
    defense: 20,
    cost: 190,
    xpReward: 42,
  },
  {
    id: 'mist_spirit_guide',
    name: 'Spirit Guide',
    species: 'mist_wanderer',
    rarity: 'rare',
    description: 'A wanderer who serves as a bridge between the living and the dead. Spirits speak through them to deliver messages to the monastery.',
    lore: 'The Spirit Guide\'s eyes have no pupils — they are filled with swirling mist that reflects the faces of the spirits currently speaking through them.',
    emoji: '👻',
    power: 30,
    defense: 30,
    cost: 650,
    xpReward: 95,
  },
  {
    id: 'mist_worldwalker',
    name: 'Worldwalker',
    species: 'mist_wanderer',
    rarity: 'legendary',
    description: 'A transcendent wanderer who can step between worlds at will. They have visited every realm that exists and some that do not.',
    lore: 'The Worldwalker claims to have walked the boundary between all things. They say reality is thinner than mist, and knowing this is both the greatest power and the greatest burden.',
    emoji: '🌌',
    power: 48,
    defense: 48,
    cost: 2800,
    xpReward: 240,
  },

  // ── Dharma Beast (5) ──────────────────────────────────────────
  {
    id: 'dharma_fox',
    name: 'Dharma Fox',
    species: 'dharma_beast',
    rarity: 'common',
    description: 'A small fox with three tails that has achieved initial enlightenment. It sits in perfect meditation posture.',
    lore: 'The Dharma Fox is the monastery\'s most beloved creature. It attends every ceremony and has learned to ring the prayer bells by itself.',
    emoji: '🦊',
    power: 14,
    defense: 12,
    cost: 55,
    xpReward: 15,
  },
  {
    id: 'dharma_tiger',
    name: 'Dharma Tiger',
    species: 'dharma_beast',
    rarity: 'common',
    description: 'A tiger that walks the monastery grounds in peaceful meditation. Its roar carries the sound of ancient mantras.',
    lore: 'The Dharma Tiger was once a warlord who was cursed to become a beast. After five hundred lifetimes as various animals, it found the monastery and began to remember.',
    emoji: '🐯',
    power: 20,
    defense: 16,
    cost: 85,
    xpReward: 20,
  },
  {
    id: 'dharma_crane',
    name: 'Dharma Crane',
    species: 'dharma_beast',
    rarity: 'uncommon',
    description: 'A magnificent crane that dances the patterns of creation. Each movement generates visible waves of spiritual energy.',
    lore: 'The Dharma Crane\'s dance is said to be the original template for all calligraphy. Every brush stroke is an attempt to capture a single moment of its movement.',
    emoji: '🦢',
    power: 25,
    defense: 22,
    cost: 240,
    xpReward: 48,
  },
  {
    id: 'dharma_turtle',
    name: 'World-Bearing Turtle',
    species: 'dharma_beast',
    rarity: 'rare',
    description: 'An ancient turtle whose shell contains a map of all existence. It carries the weight of the world upon its back, literally.',
    lore: 'The World-Bearing Turtle has existed since before the mountain. The monastery was built on its back — though only the Jade Sages know this truth.',
    emoji: '🐢',
    power: 40,
    defense: 50,
    cost: 1000,
    xpReward: 140,
  },
  {
    id: 'dharma_dragon',
    name: 'Dharma Dragon',
    species: 'dharma_beast',
    rarity: 'legendary',
    description: 'A celestial dragon who chose enlightenment over godhood. Its scales are inscribed with the complete dharma of all sentient beings.',
    lore: 'The Dharma Dragon circles the monastery in the clouds, visible only during moments of perfect karma. When it appears, all monks stop what they are doing and bow.',
    emoji: '🐲',
    power: 65,
    defense: 60,
    cost: 5000,
    xpReward: 350,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: KM_CHAMBERS — 8 Shrine Rooms
// ═══════════════════════════════════════════════════════════════════

export const KM_CHAMBERS: readonly KmChamberDef[] = [
  {
    id: 'chamber_gate_of_breath',
    name: 'Gate of Breath',
    description:
      'The outermost chamber where all visitors begin. A vast hall of incense and soft chanting where the fundamentals of meditation are taught.',
    lore:
      'The Gate of Breath was carved from the living rock by the first Zen Monks. Its walls are covered in breathing patterns that novices trace with their eyes while meditating.',
    emoji: '🏯',
    level: 1,
    resources: ['incense', 'prayer_beads'],
    capacity: 10,
    unlockLevel: 1,
    ambientColor: KM_THEME.saffronOrange,
    dangerLevel: 0,
  },
  {
    id: 'chamber_lotus_pools',
    name: 'Sacred Lotus Pools',
    description:
      'A series of interconnected pools where eternal lotus blooms float on crystal-clear water. The ultimate healing chamber.',
    lore:
      'The water in the Lotus Pools is fed by an underground spring that originates from the heart of the mountain. It is said to contain dissolved karma in its purest form.',
    emoji: '🪷',
    level: 2,
    resources: ['lotus_petals', 'tea_leaves'],
    capacity: 8,
    unlockLevel: 5,
    ambientColor: KM_THEME.lotusPink,
    dangerLevel: 1,
  },
  {
    id: 'chamber_jade_vault',
    name: 'Jade Archive Vault',
    description:
      'A vast underground library where the wisdom of millennia is stored on jade tablets. The air hums with accumulated knowledge.',
    lore:
      'The Jade Archive contains over one million tablets, each inscribed with a complete teaching. It would take a mortal lifetime just to read the index.',
    emoji: '💚',
    level: 3,
    resources: ['jade_stones', 'spirit_ink'],
    capacity: 12,
    unlockLevel: 10,
    ambientColor: KM_THEME.templeGold,
    dangerLevel: 1,
  },
  {
    id: 'chamber_thunder_peak',
    name: 'Thunder Meditation Peak',
    description:
      'An exposed peak where monks meditate during storms. Lightning strikes are absorbed by copper rods and channeled into the monastery.',
    lore:
      'During the Great Storm of Ages, a single lightning bolt struck this peak with enough power to illuminate the entire world. The Thunder Recluses have been trying to recreate it ever since.',
    emoji: '⚡',
    level: 4,
    resources: ['temple_candles', 'chime_bells'],
    capacity: 6,
    unlockLevel: 16,
    ambientColor: KM_THEME.zenBlack,
    dangerLevel: 3,
  },
  {
    id: 'chamber_mist_garden',
    name: 'Mist Spirit Garden',
    description:
      'A garden perpetually shrouded in mist where the boundary between the living and spirit worlds is thinnest. Spirits wander freely among the trees.',
    lore:
      'The Mist Garden was planted by the first Mist Wanderer who brought seeds from every realm they visited. The flowers here bloom in colors that do not exist in the normal spectrum.',
    emoji: '🌫️',
    level: 5,
    resources: ['silk_sashes', 'lotus_petals'],
    capacity: 8,
    unlockLevel: 22,
    ambientColor: KM_THEME.mistGray,
    dangerLevel: 2,
  },
  {
    id: 'chamber_incense_sanctum',
    name: 'Incense Alchemy Sanctum',
    description:
      'A laboratory-like chamber where rare incenses are compounded from sacred ingredients. The air is so thick with fragrance that visitors enter a trance.',
    lore:
      'The Incense Alchemists have developed blends that can induce visions of past lives, future events, and parallel realities. Their most powerful blend is kept under seven seals.',
    emoji: '🪔',
    level: 6,
    resources: ['incense', 'karma_dust'],
    capacity: 10,
    unlockLevel: 28,
    ambientColor: KM_THEME.incensePurple,
    dangerLevel: 2,
  },
  {
    id: 'chamber_karma_mirror',
    name: 'Karma Reflection Hall',
    description:
      'A hall of perfect mirrors that reflect not your appearance but your karmic state. Each mirror shows a different lifetime.',
    lore:
      'The mirrors in the Karma Reflection Hall were polished by Jade Sages over centuries using a technique that involves grinding jade with pure karma dust. They show the truth that words cannot express.',
    emoji: '🪞',
    level: 7,
    resources: ['karma_dust', 'enlightenment_orbs'],
    capacity: 5,
    unlockLevel: 35,
    ambientColor: KM_THEME.jadeGreen,
    dangerLevel: 4,
  },
  {
    id: 'chamber_celestial_throne',
    name: 'Celestial Throne Room',
    description:
      'The innermost sanctum where the Celestial Throne of Karma sits. Only those with pure karma can approach without being overwhelmed.',
    lore:
      'The Celestial Throne is not a seat but a state of being. Those who reach it do not sit upon it — they become it, briefly experiencing the totality of cause and effect across all existence.',
    emoji: '👑',
    level: 8,
    resources: ['enlightenment_orbs', 'dharma_scroll'],
    capacity: 3,
    unlockLevel: 42,
    ambientColor: KM_THEME.templeGold,
    dangerLevel: 5,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: KM_MATERIALS — 12 Materials
// ═══════════════════════════════════════════════════════════════════

export const KM_MATERIALS: readonly KmMaterialDef[] = [
  // Common (3)
  {
    id: 'mat_incense',
    name: 'Mountain Incense',
    emoji: '🪔',
    category: 'crafted',
    rarity: 'common',
    value: 5,
    description: 'Hand-rolled incense made from mountain herbs and cedar. Burns with a clean, meditative fragrance.',
  },
  {
    id: 'mat_prayer_beads',
    name: 'Prayer Beads',
    emoji: '📿',
    category: 'crafted',
    rarity: 'common',
    value: 8,
    description: 'Simple wooden beads strung on silk thread. Each bead represents one completed mantra cycle.',
  },
  {
    id: 'mat_lotus_petals',
    name: 'Lotus Petals',
    emoji: '🪷',
    category: 'herbal',
    rarity: 'common',
    value: 6,
    description: 'Freshly fallen petals from the eternal lotus. They retain their healing properties for exactly one day after falling.',
  },

  // Uncommon (3)
  {
    id: 'mat_jade_stones',
    name: 'Jade Stones',
    emoji: '💚',
    category: 'mineral',
    rarity: 'uncommon',
    value: 25,
    description: 'Raw jade fragments found in the mountain streams. They resonate with spiritual energy when held during meditation.',
  },
  {
    id: 'mat_karma_dust',
    name: 'Karma Dust',
    emoji: '✨',
    category: 'spiritual',
    rarity: 'uncommon',
    value: 30,
    description: 'Luminous particles that condense from purified karma. They shimmer between gold and silver depending on the viewer\'s spiritual state.',
  },
  {
    id: 'mat_spirit_ink',
    name: 'Spirit Ink',
    emoji: '🖋️',
    category: 'crafted',
    rarity: 'uncommon',
    value: 35,
    description: 'Ink compounded from karma dust and mountain minerals. Writings made with it glow faintly in darkness.',
  },

  // Rare (2)
  {
    id: 'mat_silk_sashes',
    name: 'Spirit Silk Sashes',
    emoji: '🎀',
    category: 'crafted',
    rarity: 'rare',
    value: 120,
    description: 'Sashes woven from silk harvested from spirit silkworms that feed on lotus petals. They shimmer with stored spiritual energy.',
  },
  {
    id: 'mat_temple_candles',
    name: 'Eternal Temple Candles',
    emoji: '🕯️',
    category: 'crafted',
    rarity: 'rare',
    value: 100,
    description: 'Candles made from the wax of sacred bees and infused with karma dust. They burn without consuming, lasting indefinitely.',
  },

  // Epic (2)
  {
    id: 'mat_chime_bells',
    name: 'Harmony Chime Bells',
    emoji: '🔔',
    category: 'crafted',
    rarity: 'epic',
    value: 400,
    description: 'Bells cast from meteorite iron and tuned to the frequency of universal harmony. Their sound induces deep meditation.',
  },
  {
    id: 'mat_tea_leaves',
    name: 'Enlightenment Tea Leaves',
    emoji: '🍵',
    category: 'herbal',
    rarity: 'epic',
    value: 350,
    description: 'Leaves from the Enlightenment Tea Tree that grows only in the Mist Garden. A single cup grants moments of perfect clarity.',
  },

  // Legendary (2)
  {
    id: 'mat_enlightenment_orbs',
    name: 'Enlightenment Orbs',
    emoji: '🔮',
    category: 'divine',
    rarity: 'legendary',
    value: 2000,
    description: 'Spheres of condensed enlightenment formed at the Celestial Throne. Gazing into one reveals a complete truth about existence.',
  },
  {
    id: 'mat_dharma_scroll',
    name: 'Original Dharma Scroll',
    emoji: '📜',
    category: 'divine',
    rarity: 'legendary',
    value: 5000,
    description: 'One of the seven original scrolls containing the complete dharma. Merely touching it transfers ancient wisdom directly to the mind.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: KM_STRUCTURES — 8 Structures
// ═══════════════════════════════════════════════════════════════════

export const KM_STRUCTURES: readonly KmStructureDef[] = [
  {
    id: 'str_meditation_hall',
    name: 'Grand Meditation Hall',
    emoji: '🧘',
    category: 'training',
    bonusType: 'meditation_boost',
    maxLevel: 10,
    baseEffect: 5,
    effectPerLevel: 3,
    baseCost: 100,
    costMultiplier: 1.5,
    description: 'A vast hall where monks gather for group meditation. The collective focus amplifies each individual\'s practice.',
  },
  {
    id: 'str_incense_tower',
    name: 'Incense Tower',
    emoji: '🗼',
    category: 'production',
    bonusType: 'karma_income',
    maxLevel: 10,
    baseEffect: 8,
    effectPerLevel: 4,
    baseCost: 200,
    costMultiplier: 1.6,
    description: 'A tall tower where rare incense is produced and distributed. Its fragrant smoke can be seen from miles around, guiding travelers to the monastery.',
  },
  {
    id: 'str_lotus_greenhouse',
    name: 'Lotus Greenhouse',
    emoji: '🌺',
    category: 'resource',
    bonusType: 'resource_yield',
    maxLevel: 10,
    baseEffect: 6,
    effectPerLevel: 3,
    baseCost: 150,
    costMultiplier: 1.5,
    description: 'A climate-controlled greenhouse where sacred lotus varieties from a hundred realms are cultivated side by side.',
  },
  {
    id: 'str_chanting_shrine',
    name: 'Echoing Chant Shrine',
    emoji: '🙏',
    category: 'training',
    bonusType: 'chant_power',
    maxLevel: 10,
    baseEffect: 7,
    effectPerLevel: 4,
    baseCost: 180,
    costMultiplier: 1.55,
    description: 'A shrine built with perfect acoustics that amplifies chants a hundredfold. Mantras spoken here echo through the entire mountain.',
  },
  {
    id: 'str_jade_library',
    name: 'Jade Wisdom Library',
    emoji: '📚',
    category: 'knowledge',
    bonusType: 'enlightenment_rate',
    maxLevel: 10,
    baseEffect: 10,
    effectPerLevel: 5,
    baseCost: 300,
    costMultiplier: 1.7,
    description: 'An expansion of the Jade Archive with reading rooms and study chambers. Contains knowledge from every civilization that has ever existed.',
  },
  {
    id: 'str_purification_fountain',
    name: 'Purification Fountain',
    emoji: '⛲',
    category: 'utility',
    bonusType: 'purify_speed',
    maxLevel: 10,
    baseEffect: 8,
    effectPerLevel: 4,
    baseCost: 250,
    costMultiplier: 1.6,
    description: 'A fountain fed by underground springs that purifies negative karma on contact. Monks come here after difficult missions.',
  },
  {
    id: 'str_offering_altar',
    name: 'Golden Offering Altar',
    emoji: '⛩️',
    category: 'economic',
    bonusType: 'offering_value',
    maxLevel: 10,
    baseEffect: 12,
    effectPerLevel: 6,
    baseCost: 400,
    costMultiplier: 1.75,
    description: 'An ornate altar where offerings are transformed into karma and resources at enhanced rates. The more generous the offering, the greater the return.',
  },
  {
    id: 'str_karma_garden',
    name: 'Karma Garden',
    emoji: '🌳',
    category: 'resource',
    bonusType: 'garden_growth',
    maxLevel: 10,
    baseEffect: 9,
    effectPerLevel: 5,
    baseCost: 350,
    costMultiplier: 1.65,
    description: 'A magical garden where plants grow in direct proportion to the monastery\'s accumulated good karma. At full bloom, it produces rare materials daily.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: KM_ABILITIES — 8 Abilities (2 per category)
// ═══════════════════════════════════════════════════════════════════

export const KM_ABILITIES: readonly KmAbilityDef[] = [
  // Offensive (2)
  {
    id: 'ability_karma_strike',
    name: 'Karma Strike',
    emoji: '⚡',
    category: 'offensive',
    species: 'karma_guardian',
    cooldown: 5000,
    power: 25,
    description: 'Channel accumulated good karma into a devastating strike that deals damage proportional to the target\'s negative karma.',
  },
  {
    id: 'ability_thunder_bolt',
    name: 'Thunder Bolt',
    emoji: '🌩️',
    category: 'offensive',
    species: 'thunder_recluse',
    cooldown: 8000,
    power: 45,
    description: 'Call down a bolt of purified lightning that strikes all enemies in the area while leaving allies unharmed.',
  },

  // Defensive (2)
  {
    id: 'ability_lotus_shield',
    name: 'Lotus Shield',
    emoji: '🛡️',
    category: 'defensive',
    species: 'lotus_priest',
    cooldown: 10000,
    power: 30,
    description: 'Conjure a shield of lotus petals that absorbs incoming damage and converts it into healing energy for nearby allies.',
  },
  {
    id: 'ability_jade_barrier',
    name: 'Jade Barrier',
    emoji: '🧱',
    category: 'defensive',
    species: 'jade_sage',
    cooldown: 12000,
    power: 35,
    description: 'Raise an impenetrable barrier of jade energy that blocks all physical and spiritual attacks for a short duration.',
  },

  // Utility (2)
  {
    id: 'ability_mist_step',
    name: 'Mist Step',
    emoji: '💨',
    category: 'utility',
    species: 'mist_wanderer',
    cooldown: 3000,
    power: 10,
    description: 'Dissolve into mist and reappear at any visible location instantly. While in mist form, you are immune to all effects.',
  },
  {
    id: 'ability_zen_focus',
    name: 'Zen Focus',
    emoji: '🎯',
    category: 'utility',
    species: 'zen_monk',
    cooldown: 15000,
    power: 20,
    description: 'Enter a state of perfect focus that doubles the effectiveness of all abilities and actions for a limited time.',
  },

  // Summon (2)
  {
    id: 'ability_spirit_call',
    name: 'Spirit Call',
    emoji: '👻',
    category: 'summon',
    species: 'mist_wanderer',
    cooldown: 20000,
    power: 40,
    description: 'Summon a spirit ally from the mist realm that fights alongside the monastery\'s defenders for a brief period.',
  },
  {
    id: 'ability_dharma_awakening',
    name: 'Dharma Awakening',
    emoji: '🐲',
    category: 'summon',
    species: 'dharma_beast',
    cooldown: 30000,
    power: 60,
    description: 'Awaken the dormant dharma within a creature, temporarily transforming it into a powerful Dharma Beast ally.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: KM_ACHIEVEMENTS — 10 Achievements
// ═══════════════════════════════════════════════════════════════════

export const KM_ACHIEVEMENTS: readonly KmAchievementDef[] = [
  {
    id: 'ach_first_meditation',
    name: 'First Breath',
    emoji: '🧘',
    description: 'Complete your first meditation session at the monastery.',
    condition: 'meditate_1_time',
    reward: { karma: 10, coins: 20 },
  },
  {
    id: 'ach_monastery_guardian',
    name: 'Monastery Guardian',
    emoji: '🛡️',
    description: 'Recruit 10 monks to defend the monastery.',
    condition: 'recruit_10_monks',
    reward: { karma: 50, coins: 100 },
  },
  {
    id: 'ach_lotus_master',
    name: 'Lotus Master',
    emoji: '🪷',
    description: 'Purify all 8 chambers of negative karma.',
    condition: 'purify_all_chambers',
    reward: { karma: 100, coins: 200 },
  },
  {
    id: 'ach_jade_scholar',
    name: 'Jade Scholar',
    emoji: '📚',
    description: 'Study 50 scrolls in the Jade Archive.',
    condition: 'study_50_scrolls',
    reward: { karma: 75, coins: 150 },
  },
  {
    id: 'ach_karma_wealth',
    name: 'Karma Philanthropist',
    emoji: '🪙',
    description: 'Accumulate 10,000 coins through offerings and cultivation.',
    condition: 'earn_10000_coins',
    reward: { karma: 200, coins: 500 },
  },
  {
    id: 'ach_storm_within',
    name: 'Storm Within',
    emoji: '⛈️',
    description: 'Recruit a Thunder Recluse of rare or higher rarity.',
    condition: 'recruit_rare_thunder',
    reward: { karma: 60, coins: 120 },
  },
  {
    id: 'ach_dharma_collector',
    name: 'Dharma Collector',
    emoji: '🐉',
    description: 'Collect one of each species of monk.',
    condition: 'collect_all_species',
    reward: { karma: 150, coins: 300 },
  },
  {
    id: 'ach_enlightenment_seeker',
    name: 'Enlightenment Seeker',
    emoji: '✨',
    description: 'Reach level 25 on the path of karma.',
    condition: 'reach_level_25',
    reward: { karma: 300, coins: 600 },
  },
  {
    id: 'ach_artifact_hunter',
    name: 'Artifact Hunter',
    emoji: '🏺',
    description: 'Discover all 6 legendary artifacts.',
    condition: 'collect_all_artifacts',
    reward: { karma: 500, coins: 1000 },
  },
  {
    id: 'ach_karma_transcendent',
    name: 'Karma Transcendent',
    emoji: '🌟',
    description: 'Reach the maximum level and unlock all titles.',
    condition: 'reach_max_level',
    reward: { karma: 1000, coins: 2000 },
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: KM_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const KM_TITLES: readonly KmTitleDef[] = [
  {
    id: 'title_mortal_guest',
    name: 'Mortal Guest',
    emoji: '⛩️',
    minLevel: 1,
    minMonks: 0,
    description: 'A visitor who has just arrived at the monastery. The journey of a thousand miles begins with a single step.',
  },
  {
    id: 'title_initiate_disciple',
    name: 'Initiate Disciple',
    emoji: '📿',
    minLevel: 5,
    minMonks: 2,
    description: 'An accepted disciple who has begun formal training. The incense of dedication rises from their practice.',
  },
  {
    id: 'title_path_walker',
    name: 'Path Walker',
    emoji: '🚶',
    minLevel: 10,
    minMonks: 5,
    description: 'A monk who walks the middle path with determination. Neither attached to nor detached from the world.',
  },
  {
    id: 'title_karma_student',
    name: 'Karma Student',
    emoji: '☯️',
    minLevel: 16,
    minMonks: 8,
    description: 'A student of the law of cause and effect who has begun to understand the web of interconnectedness.',
  },
  {
    id: 'title_chamber_keeper',
    name: 'Chamber Keeper',
    emoji: '🔑',
    minLevel: 22,
    minMonks: 12,
    description: 'A trusted guardian who holds the keys to the inner chambers. The monastery\'s secrets are theirs to protect.',
  },
  {
    id: 'title_dharma_master',
    name: 'Dharma Master',
    emoji: '📜',
    minLevel: 30,
    minMonks: 18,
    description: 'A master of the sacred teachings who can interpret the dharma for any being in any realm.',
  },
  {
    id: 'title_karma_sage',
    name: 'Karma Sage',
    emoji: '🌿',
    minLevel: 38,
    minMonks: 25,
    description: 'A sage who can see the entire tapestry of karma and gently guide threads toward harmony.',
  },
  {
    id: 'title_enlightened_one',
    name: 'Enlightened One',
    emoji: '🌟',
    minLevel: 45,
    minMonks: 30,
    description: 'A being who has achieved perfect understanding of cause and effect. They exist in harmony with all things.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: KM_ARTIFACTS — 6 Artifacts
// ═══════════════════════════════════════════════════════════════════

export const KM_ARTIFACTS: readonly KmArtifactDef[] = [
  {
    id: 'art_breath_of_the_first',
    name: 'Breath of the First',
    emoji: '🌬️',
    rarity: 'rare',
    species: 'zen_monk',
    powerBoost: 15,
    defenseBoost: 10,
    karmaBoost: 20,
    value: 800,
    description: 'A jade pendant containing the actual breath of the first Zen Monk. Holding it induces instant calm.',
    lore: 'The first Zen Monk exhaled their dying breath into a jade vessel, saying: "Keep this, and you will never be lost." The pendant has been passed down for ten thousand years.',
  },
  {
    id: 'art_shield_of_causes',
    name: 'Shield of a Thousand Causes',
    emoji: '🛡️',
    rarity: 'epic',
    species: 'karma_guardian',
    powerBoost: 20,
    defenseBoost: 30,
    karmaBoost: 15,
    value: 2000,
    description: 'A shield forged from a thousand good deeds crystallized into jade-metal. It grows stronger with each righteous act.',
    lore: 'Every generation, the Karma Guardian with the most accumulated good deeds adds a layer to this shield. It currently has 1,247 layers and glows with a warm green light.',
  },
  {
    id: 'art_eternal_lotus_seed',
    name: 'Eternal Lotus Seed',
    emoji: '🪷',
    rarity: 'legendary',
    species: 'lotus_priest',
    powerBoost: 10,
    defenseBoost: 25,
    karmaBoost: 50,
    value: 5000,
    description: 'The seed from which all lotus blooms in the monastery originate. It pulses with infinite healing energy.',
    lore: 'Before the monastery existed, there was only the lotus. The Eternal Lotus Seed is said to be the first living thing that achieved enlightenment, before there were even minds to be enlightened.',
  },
  {
    id: 'art_thunder_gods_bell',
    name: 'Thunder God\'s Bell',
    emoji: '🔔',
    rarity: 'epic',
    species: 'thunder_recluse',
    powerBoost: 35,
    defenseBoost: 10,
    karmaBoost: 25,
    value: 2500,
    description: 'A bell forged from the heart of a thunderstorm. When rung, it summons lightning and clears all negative energy.',
    lore: 'The Thunder God\'s Bell was created when the first Thunder Recluse captured a bolt of divine lightning in a jade mold. It rings only when the mountain is in danger.',
  },
  {
    id: 'art_mist_cloak_of_worlds',
    name: 'Mist Cloak of Worlds',
    emoji: '🌫️',
    rarity: 'rare',
    species: 'mist_wanderer',
    powerBoost: 12,
    defenseBoost: 18,
    karmaBoost: 30,
    value: 1200,
    description: 'A cloak woven from the mists of a hundred different realms. The wearer can step between worlds.',
    lore: 'Each thread in this cloak is a different type of mist — morning fog, evening haze, mountain cloud, spirit vapor. Together, they form a fabric that exists in multiple dimensions simultaneously.',
  },
  {
    id: 'art_dragons_dharma_scales',
    name: 'Dragon\'s Dharma Scales',
    emoji: '🐲',
    rarity: 'legendary',
    species: 'dharma_beast',
    powerBoost: 40,
    defenseBoost: 35,
    karmaBoost: 60,
    value: 8000,
    description: 'Scales shed by the Dharma Dragon during its last transformation. Each scale contains a complete teaching.',
    lore: 'The Dharma Dragon sheds one scale per century. There are believed to be only twelve in existence, each containing one-twelfth of the complete dharma.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: KM_EVENTS — 8 Events
// ═══════════════════════════════════════════════════════════════════

export const KM_EVENTS: readonly KmEventDef[] = [
  {
    id: 'event_karma_surge',
    name: 'Karma Surge',
    emoji: '🌊',
    durationTurns: 5,
    effectType: 'buff',
    effectDescription: 'All karma gains are doubled for 5 actions.',
    description: 'A wave of pure karma energy washes over the monastery, amplifying all spiritual gains. The monks can feel the universe smiling upon them.',
  },
  {
    id: 'event_spirit_festival',
    name: 'Spirit Festival',
    emoji: '🏮',
    durationTurns: 8,
    effectType: 'buff',
    effectDescription: 'All meditation and chanting XP is tripled. Spirit allies become more powerful.',
    description: 'The spirits of ancestors and past monks return to celebrate with the living. The monastery is filled with ghostly laughter and ancient songs.',
  },
  {
    id: 'event_dark_karma_storm',
    name: 'Dark Karma Storm',
    emoji: '⛈️',
    durationTurns: 4,
    effectType: 'debuff',
    effectDescription: 'All coin gains are halved. Negative karma accumulates faster.',
    description: 'A storm of accumulated negative karma from the outside world crashes against the monastery walls. The monks must meditate harder to maintain balance.',
  },
  {
    id: 'event_lotus_bloom',
    name: 'Mass Lotus Bloom',
    emoji: '🌸',
    durationTurns: 6,
    effectType: 'buff',
    effectDescription: 'Lotus petal production is 5x. Healing abilities are enhanced.',
    description: 'Every lotus in every pool blooms simultaneously in an event that happens only once every hundred years. The fragrance is intoxicating and deeply healing.',
  },
  {
    id: 'event_jade_resonance',
    name: 'Jade Resonance',
    emoji: '💎',
    durationTurns: 7,
    effectType: 'buff',
    effectDescription: 'Study and research XP is doubled. Chance to discover rare materials.',
    description: 'The jade deposits throughout the mountain begin to resonate at a harmonic frequency, awakening dormant knowledge within the archive tablets.',
  },
  {
    id: 'event_thunder_trial',
    name: 'Thunder Trial',
    emoji: '⚡',
    durationTurns: 3,
    effectType: 'special',
    effectDescription: 'Offensive abilities gain 50% power. Meditation is interrupted periodically.',
    description: 'A sudden thunderstorm engulfs the mountain peak. The Thunder Recluses see it as a trial — those who meditate through it without flinching gain immense power.',
  },
  {
    id: 'event_mist_invasion',
    name: 'Mist Invasion',
    emoji: '🌫️',
    durationTurns: 5,
    effectType: 'debuff',
    effectDescription: 'Navigation is impaired. Resource gathering is reduced by 40%.',
    description: 'The mountain mists descend with unnatural density, blurring the boundaries between chambers. Spirits from the mist realm wander into the monastery, some friendly, some not.',
  },
  {
    id: 'event_celestial_alignment',
    name: 'Celestial Alignment',
    emoji: '🌌',
    durationTurns: 10,
    effectType: 'special',
    effectDescription: 'All abilities enhanced. Chance to recruit legendary monks. Artifact discovery rate increased.',
    description: 'The stars align in a configuration that matches the pattern on the Celestial Throne. For a brief time, the monastery exists in a state of perfect cosmic harmony.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function kmGetDefaultState(): KmMonasteryState {
  return {
    level: 1,
    xp: 0,
    coins: KM_STARTING_COINS,
    totalXp: KM_STARTING_XP,
    totalCoins: KM_STARTING_COINS,
    monks: [],
    inventory: [],
    structures: [],
    artifacts: [],
    abilities: [],
    achievements: [],
    chambers: ['chamber_gate_of_breath'],
    eventLog: [],
    activeEvent: null,
    activeEventTurnsRemaining: 0,
    currentTitle: 'title_mortal_guest',
    totalMeditated: 0,
    totalChanted: 0,
    totalOffered: 0,
    totalCultivated: 0,
    totalStudied: 0,
    totalPurified: 0,
    totalAscended: 0,
  }
}

function kmLoadState(): KmMonasteryState {
  if (typeof window === 'undefined') return kmGetDefaultState()
  try {
    const raw = localStorage.getItem(KM_SAVE_KEY)
    if (!raw) return kmGetDefaultState()
    const parsed = JSON.parse(raw) as Partial<KmMonasteryState>
    const defaults = kmGetDefaultState()
    return { ...defaults, ...parsed }
  } catch {
    return kmGetDefaultState()
  }
}

function kmSaveState(state: KmMonasteryState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KM_SAVE_KEY, JSON.stringify(state))
  } catch {
    // Silently fail if storage is full
  }
}

function kmCalcUpgradeCost(structureDef: KmStructureDef, currentLevel: number): number {
  return Math.floor(structureDef.baseCost * Math.pow(structureDef.costMultiplier, currentLevel))
}

function kmCalcLevelProgress(currentXp: number, currentLevel: number): number {
  if (currentLevel >= KM_MAX_LEVEL) return 100
  const needed = kmCalcXpForLevel(currentLevel)
  if (needed <= 0) return 100
  return Math.min(100, (currentXp / needed) * 100)
}

function kmGetSpeciesColor(speciesId: KmSpecies): string {
  const species = KM_SPECIES.find(s => s.id === speciesId)
  return species?.color ?? KM_THEME.mistGray
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: MAIN HOOK — useKarmaMonastery
// ═══════════════════════════════════════════════════════════════════

export default function useKarmaMonastery() {
  // ────────────────────────────────────────────────────────────────
  // Core State
  // ────────────────────────────────────────────────────────────────
  const [kmLevel, setKmLevel] = useState(1)
  const [kmXp, setKmXp] = useState(0)
  const [kmCoins, setKmCoins] = useState(KM_STARTING_COINS)
  const [kmTotalXp, setKmTotalXp] = useState(KM_STARTING_XP)
  const [kmTotalCoins, setKmTotalCoins] = useState(KM_STARTING_COINS)

  // ────────────────────────────────────────────────────────────────
  // Collection State
  // ────────────────────────────────────────────────────────────────
  const [kmMonks, setKmMonks] = useState<KmCreatureInstance[]>([])
  const [kmInventory, setKmInventory] = useState<KmInventoryItem[]>([])
  const [kmStructures, setKmStructures] = useState<KmStructureInstance[]>([])
  const [kmArtifacts, setKmArtifacts] = useState<string[]>([])
  const [kmAbilities, setKmAbilities] = useState<string[]>([])
  const [kmAchievements, setKmAchievements] = useState<string[]>([])
  const [kmChambers, setKmChambers] = useState<string[]>(['chamber_gate_of_breath'])
  const [kmEventLog, setKmEventLog] = useState<KmEventLogEntry[]>([])
  const [kmActiveEvent, setKmActiveEvent] = useState<KmEventDef | null>(null)
  const [kmActiveEventTurns, setKmActiveEventTurns] = useState(0)

  // ────────────────────────────────────────────────────────────────
  // Title State
  // ────────────────────────────────────────────────────────────────
  const [kmCurrentTitle, setKmCurrentTitle] = useState('title_mortal_guest')

  // ────────────────────────────────────────────────────────────────
  // Stats State
  // ────────────────────────────────────────────────────────────────
  const [kmTotalMeditated, setKmTotalMeditated] = useState(0)
  const [kmTotalChanted, setKmTotalChanted] = useState(0)
  const [kmTotalOffered, setKmTotalOffered] = useState(0)
  const [kmTotalCultivated, setKmTotalCultivated] = useState(0)
  const [kmTotalStudied, setKmTotalStudied] = useState(0)
  const [kmTotalPurified, setKmTotalPurified] = useState(0)
  const [kmTotalAscended, setKmTotalAscended] = useState(0)

  // ────────────────────────────────────────────────────────────────
  // Refs
  // ────────────────────────────────────────────────────────────────
  const initializedRef = useRef(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef<KmMonasteryState>(kmGetDefaultState())

  // Sync stateRef in useEffect — NOT during render
  useEffect(() => {
    stateRef.current = {
      level: kmLevel,
      xp: kmXp,
      coins: kmCoins,
      totalXp: kmTotalXp,
      totalCoins: kmTotalCoins,
      monks: kmMonks,
      inventory: kmInventory,
      structures: kmStructures,
      artifacts: kmArtifacts,
      abilities: kmAbilities,
      achievements: kmAchievements,
      chambers: kmChambers,
      eventLog: kmEventLog,
      activeEvent: kmActiveEvent,
      activeEventTurnsRemaining: kmActiveEventTurns,
      currentTitle: kmCurrentTitle,
      totalMeditated: kmTotalMeditated,
      totalChanted: kmTotalChanted,
      totalOffered: kmTotalOffered,
      totalCultivated: kmTotalCultivated,
      totalStudied: kmTotalStudied,
      totalPurified: kmTotalPurified,
      totalAscended: kmTotalAscended,
    }
  }, [
    kmLevel, kmXp, kmCoins, kmTotalXp, kmTotalCoins,
    kmMonks, kmInventory, kmStructures, kmArtifacts, kmAbilities,
    kmAchievements, kmChambers, kmEventLog, kmActiveEvent, kmActiveEventTurns,
    kmCurrentTitle, kmTotalMeditated, kmTotalChanted, kmTotalOffered,
    kmTotalCultivated, kmTotalStudied, kmTotalPurified, kmTotalAscended,
  ])

  // ────────────────────────────────────────────────────────────────
  // Init Effect: load from localStorage
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    const saved = kmLoadState()
    setKmLevel(saved.level)
    setKmXp(saved.xp)
    setKmCoins(saved.coins)
    setKmTotalXp(saved.totalXp)
    setKmTotalCoins(saved.totalCoins)
    setKmMonks(saved.monks)
    setKmInventory(saved.inventory)
    setKmStructures(saved.structures)
    setKmArtifacts(saved.artifacts)
    setKmAbilities(saved.abilities)
    setKmAchievements(saved.achievements)
    setKmChambers(saved.chambers)
    setKmEventLog(saved.eventLog)
    setKmActiveEvent(saved.activeEvent)
    setKmActiveEventTurns(saved.activeEventTurnsRemaining)
    setKmCurrentTitle(saved.currentTitle)
    setKmTotalMeditated(saved.totalMeditated)
    setKmTotalChanted(saved.totalChanted)
    setKmTotalOffered(saved.totalOffered)
    setKmTotalCultivated(saved.totalCultivated)
    setKmTotalStudied(saved.totalStudied)
    setKmTotalPurified(saved.totalPurified)
    setKmTotalAscended(saved.totalAscended)
  }, [])

  // ────────────────────────────────────────────────────────────────
  // Auto-save Effect
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(() => {
      kmSaveState(stateRef.current)
    }, KM_AUTO_SAVE_INTERVAL_MS)
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [])

  // ────────────────────────────────────────────────────────────────
  // Internal: add XP with level-up logic
  // ────────────────────────────────────────────────────────────────
  const kmAddXp = useCallback((amount: number) => {
    let newXp = kmXp + amount
    let newLevel = kmLevel
    let newTotalXp = kmTotalXp + amount

    while (newXp >= kmCalcXpForLevel(newLevel) && newLevel < KM_MAX_LEVEL) {
      newXp -= kmCalcXpForLevel(newLevel)
      newLevel += 1
    }

    if (newLevel >= KM_MAX_LEVEL) {
      newXp = 0
    }

    setKmXp(newXp)
    setKmLevel(newLevel)
    setKmTotalXp(newTotalXp)
  }, [kmXp, kmLevel, kmTotalXp])

  // ────────────────────────────────────────────────────────────────
  // Internal: add coins
  // ────────────────────────────────────────────────────────────────
  const kmAddCoins = useCallback((amount: number) => {
    setKmCoins(prev => prev + amount)
    setKmTotalCoins(prev => prev + amount)
  }, [])

  // ────────────────────────────────────────────────────────────────
  // Internal: spend coins (returns success)
  // ────────────────────────────────────────────────────────────────
  const kmSpendCoins = useCallback((amount: number): boolean => {
    let success = false
    setKmCoins(prev => {
      if (prev < amount) return prev
      success = true
      return prev - amount
    })
    return success
  }, [])

  // ────────────────────────────────────────────────────────────────
  // Internal: add material to inventory
  // ────────────────────────────────────────────────────────────────
  const kmAddMaterial = useCallback((materialId: string, count: number) => {
    setKmInventory(prev => {
      const existing = prev.find(i => i.materialId === materialId)
      if (existing) {
        return prev.map(i =>
          i.materialId === materialId
            ? { ...i, count: Math.min(KM_MAX_INVENTORY_STACK, i.count + count) }
            : i,
        )
      }
      return [...prev, { materialId, count: Math.min(KM_MAX_INVENTORY_STACK, count) }]
    })
  }, [])

  // ────────────────────────────────────────────────────────────────
  // Internal: check and unlock titles
  // ────────────────────────────────────────────────────────────────
  const kmCheckTitleUnlocks = useCallback((currentLevel: number, currentMonkCount: number) => {
    const eligible = KM_TITLES
      .filter(t => currentLevel >= t.minLevel && currentMonkCount >= t.minMonks)
      .sort((a, b) => b.minLevel - a.minLevel)

    if (eligible.length > 0) {
      setKmCurrentTitle(eligible[0].id)
    }
  }, [])

  // ────────────────────────────────────────────────────────────────
  // Internal: check achievements
  // ────────────────────────────────────────────────────────────────
  const kmCheckAchievements = useCallback((
    state: Pick<KmMonasteryState, 'totalMeditated' | 'totalChanted' | 'totalOffered' | 'totalCultivated' | 'totalStudied' | 'totalPurified' | 'totalAscended' | 'monks' | 'artifacts' | 'chambers' | 'level' | 'coins' | 'totalCoins' | 'achievements'>,
  ) => {
    const newAchievements: string[] = []

    const has = (id: string) => state.achievements.includes(id)

    if (!has('ach_first_meditation') && state.totalMeditated >= 1) {
      newAchievements.push('ach_first_meditation')
    }
    if (!has('ach_monastery_guardian') && state.monks.length >= 10) {
      newAchievements.push('ach_monastery_guardian')
    }
    if (!has('ach_lotus_master') && state.chambers.length >= 8) {
      newAchievements.push('ach_lotus_master')
    }
    if (!has('ach_jade_scholar') && state.totalStudied >= 50) {
      newAchievements.push('ach_jade_scholar')
    }
    if (!has('ach_karma_wealth') && state.totalCoins >= 10000) {
      newAchievements.push('ach_karma_wealth')
    }
    if (!has('ach_storm_within')) {
      const hasRareThunder = state.monks.some(m => {
        const def = KM_CREATURES.find(c => c.id === m.creatureDefId)
        return def && def.species === 'thunder_recluse' && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')
      })
      if (hasRareThunder) newAchievements.push('ach_storm_within')
    }
    if (!has('ach_dharma_collector')) {
      const speciesSet = new Set(state.monks.map(m => {
        const def = KM_CREATURES.find(c => c.id === m.creatureDefId)
        return def?.species
      }).filter(Boolean))
      if (speciesSet.size >= 7) newAchievements.push('ach_dharma_collector')
    }
    if (!has('ach_enlightenment_seeker') && state.level >= 25) {
      newAchievements.push('ach_enlightenment_seeker')
    }
    if (!has('ach_artifact_hunter') && state.artifacts.length >= 6) {
      newAchievements.push('ach_artifact_hunter')
    }
    if (!has('ach_karma_transcendent') && state.level >= KM_MAX_LEVEL) {
      newAchievements.push('ach_karma_transcendent')
    }

    if (newAchievements.length > 0) {
      setKmAchievements(prev => [...prev, ...newAchievements])
      for (const achId of newAchievements) {
        const ach = KM_ACHIEVEMENTS.find(a => a.id === achId)
        if (ach) {
          kmAddCoins(ach.reward.coins)
        }
      }
    }
  }, [kmAddCoins])

  // ────────────────────────────────────────────────────────────────
  // Internal: process event tick
  // ────────────────────────────────────────────────────────────────
  const kmProcessEventTick = useCallback(() => {
    setKmActiveEventTurns(prev => {
      if (prev <= 1) {
        setKmActiveEvent(null)
        setKmEventLog(log => [
          ...log,
          { eventId: stateRef.current.activeEvent?.id ?? 'unknown', triggeredAt: Date.now(), resolvedAt: Date.now() },
        ])
        return 0
      }
      return prev - 1
    })
  }, [])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Meditate Monk
  // ────────────────────────────────────────────────────────────────
  const meditateMonk = useCallback((monkId: string): boolean => {
    const monk = kmMonks.find(m => m.id === monkId)
    if (!monk) return false

    const creatureDef = KM_CREATURES.find(c => c.id === monk.creatureDefId)
    if (!creatureDef) return false

    const structureBonus = kmStructures.reduce((sum, s) => {
      const def = KM_STRUCTURES.find(d => d.id === s.structureDefId)
      if (!def || def.bonusType !== 'meditation_boost') return sum
      return sum + def.baseEffect + def.effectPerLevel * s.level
    }, 0)

    const eventMultiplier = kmActiveEvent?.id === 'event_spirit_festival' ? 3.0 : 1.0
    const baseXp = KM_MEDITATION_BASE_XP + creatureDef.power * 0.5 + structureBonus * 0.2
    const totalXp = Math.floor(baseXp * kmCalcRarityMultiplier(creatureDef.rarity) * eventMultiplier)

    kmAddXp(totalXp)
    setKmTotalMeditated(prev => prev + 1)
    setKmMonks(prev =>
      prev.map(m =>
        m.id === monkId
          ? { ...m, xp: m.xp + totalXp, meditationHours: m.meditationHours + 1, karma: m.karma + 1 }
          : m,
      ),
    )
    kmProcessEventTick()
    return true
  }, [kmMonks, kmStructures, kmActiveEvent, kmAddXp, kmProcessEventTick])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Chant Mantra
  // ────────────────────────────────────────────────────────────────
  const chantMantra = useCallback((monkId: string): boolean => {
    const monk = kmMonks.find(m => m.id === monkId)
    if (!monk) return false

    const creatureDef = KM_CREATURES.find(c => c.id === monk.creatureDefId)
    if (!creatureDef) return false

    const structureBonus = kmStructures.reduce((sum, s) => {
      const def = KM_STRUCTURES.find(d => d.id === s.structureDefId)
      if (!def || def.bonusType !== 'chant_power') return sum
      return sum + def.baseEffect + def.effectPerLevel * s.level
    }, 0)

    const eventMultiplier = kmActiveEvent?.id === 'event_spirit_festival' ? 3.0 : 1.0
    const baseXp = KM_CHANT_BASE_XP + creatureDef.power * 0.3 + structureBonus * 0.25
    const totalXp = Math.floor(baseXp * kmCalcRarityMultiplier(creatureDef.rarity) * eventMultiplier)

    kmAddXp(totalXp)
    kmAddCoins(Math.floor(totalXp * 0.3))
    setKmTotalChanted(prev => prev + 1)
    setKmMonks(prev =>
      prev.map(m =>
        m.id === monkId
          ? { ...m, xp: m.xp + totalXp, karma: m.karma + 2 }
          : m,
      ),
    )
    kmProcessEventTick()
    return true
  }, [kmMonks, kmStructures, kmActiveEvent, kmAddXp, kmAddCoins, kmProcessEventTick])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Offer Incense
  // ────────────────────────────────────────────────────────────────
  const offerIncense = useCallback((): boolean => {
    const structureBonus = kmStructures.reduce((sum, s) => {
      const def = KM_STRUCTURES.find(d => d.id === s.structureDefId)
      if (!def || def.bonusType !== 'offering_value') return sum
      return sum + def.baseEffect + def.effectPerLevel * s.level
    }, 0)

    const eventMultiplier = kmActiveEvent?.id === 'event_karma_surge' ? 2.0 : 1.0
    const baseCoins = KM_OFFER_BASE_COINS + structureBonus * 0.3 + kmLevel * 2
    const totalCoins = Math.floor(baseCoins * eventMultiplier)

    kmAddCoins(totalCoins)
    kmAddXp(Math.floor(totalCoins * 0.5))
    kmAddMaterial('mat_incense', 1)
    setKmTotalOffered(prev => prev + 1)
    kmProcessEventTick()
    return true
  }, [kmStructures, kmActiveEvent, kmLevel, kmAddCoins, kmAddXp, kmAddMaterial, kmProcessEventTick])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Cultivate Garden
  // ────────────────────────────────────────────────────────────────
  const cultivateGarden = useCallback((): boolean => {
    const structureBonus = kmStructures.reduce((sum, s) => {
      const def = KM_STRUCTURES.find(d => d.id === s.structureDefId)
      if (!def || def.bonusType !== 'garden_growth') return sum
      return sum + def.baseEffect + def.effectPerLevel * s.level
    }, 0)

    const eventMultiplier = kmActiveEvent?.id === 'event_lotus_bloom' ? 5.0 : 1.0
    const baseCoins = KM_CULTIVATE_BASE_COINS + structureBonus * 0.4 + kmLevel * 1.5
    const totalCoins = Math.floor(baseCoins * eventMultiplier)

    kmAddCoins(totalCoins)
    kmAddXp(Math.floor(totalCoins * 0.4))
    kmAddMaterial('mat_lotus_petals', Math.max(1, Math.floor(eventMultiplier)))
    if (Math.random() < 0.15 + structureBonus * 0.01) {
      kmAddMaterial('mat_tea_leaves', 1)
    }
    setKmTotalCultivated(prev => prev + 1)
    kmProcessEventTick()
    return true
  }, [kmStructures, kmActiveEvent, kmLevel, kmAddCoins, kmAddXp, kmAddMaterial, kmProcessEventTick])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Study Scroll
  // ────────────────────────────────────────────────────────────────
  const studyScroll = useCallback((): boolean => {
    const structureBonus = kmStructures.reduce((sum, s) => {
      const def = KM_STRUCTURES.find(d => d.id === s.structureDefId)
      if (!def || def.bonusType !== 'enlightenment_rate') return sum
      return sum + def.baseEffect + def.effectPerLevel * s.level
    }, 0)

    const eventMultiplier = kmActiveEvent?.id === 'event_jade_resonance' ? 2.0 : 1.0
    const baseXp = KM_STUDY_BASE_XP + structureBonus * 0.5 + kmLevel * 3
    const totalXp = Math.floor(baseXp * eventMultiplier)

    kmAddXp(totalXp)
    kmAddCoins(Math.floor(totalXp * 0.2))
    if (Math.random() < 0.1) {
      kmAddMaterial('mat_jade_stones', 1)
    }
    setKmTotalStudied(prev => prev + 1)
    kmProcessEventTick()
    return true
  }, [kmStructures, kmActiveEvent, kmLevel, kmAddXp, kmAddCoins, kmAddMaterial, kmProcessEventTick])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Purify Chamber
  // ────────────────────────────────────────────────────────────────
  const purifyChamber = useCallback((chamberId: string): boolean => {
    if (!kmChambers.includes(chamberId)) return false

    const structureBonus = kmStructures.reduce((sum, s) => {
      const def = KM_STRUCTURES.find(d => d.id === s.structureDefId)
      if (!def || def.bonusType !== 'purify_speed') return sum
      return sum + def.baseEffect + def.effectPerLevel * s.level
    }, 0)

    const baseXp = KM_PURIFY_BASE_XP + structureBonus * 0.3 + kmLevel * 2
    const totalXp = Math.floor(baseXp * kmCalcRarityMultiplier('rare'))

    kmAddXp(totalXp)
    setKmTotalPurified(prev => prev + 1)

    // Chance to find materials
    if (Math.random() < 0.2) {
      const randomMaterials = KM_MATERIALS.filter(m => m.rarity === 'common' || m.rarity === 'uncommon')
      if (randomMaterials.length > 0) {
        const mat = randomMaterials[Math.floor(Math.random() * randomMaterials.length)]
        kmAddMaterial(mat.id, 1)
      }
    }

    kmProcessEventTick()

    // Check chamber unlock
    const chamberIdx = KM_CHAMBERS.findIndex(c => c.id === chamberId)
    if (chamberIdx >= 0 && chamberIdx < KM_CHAMBERS.length - 1) {
      const nextChamber = KM_CHAMBERS[chamberIdx + 1]
      if (kmLevel >= nextChamber.unlockLevel && !kmChambers.includes(nextChamber.id)) {
        setKmChambers(prev => [...prev, nextChamber.id])
      }
    }

    return true
  }, [kmChambers, kmStructures, kmLevel, kmAddXp, kmAddMaterial, kmProcessEventTick])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Ascend Realm
  // ────────────────────────────────────────────────────────────────
  const ascendRealm = useCallback((): boolean => {
    if (kmLevel < 10) return false

    const totalPower = kmMonks.reduce((sum, m) => {
      const def = KM_CREATURES.find(c => c.id === m.creatureDefId)
      return sum + (def?.power ?? 0) * (1 + m.level * 0.1)
    }, 0)

    const artifactBonus = kmArtifacts.reduce((sum, artId) => {
      const art = KM_ARTIFACTS.find(a => a.id === artId)
      return sum + (art?.karmaBoost ?? 0)
    }, 0)

    const baseXp = KM_ASCEND_BASE_XP + totalPower * 0.5 + artifactBonus * 0.3 + kmLevel * 5
    const totalXp = Math.floor(baseXp * kmCalcRarityMultiplier('legendary'))

    kmAddXp(totalXp)
    kmAddCoins(Math.floor(totalXp * 0.5))
    setKmTotalAscended(prev => prev + 1)

    // Small chance to trigger an event
    if (!kmActiveEvent && Math.random() < 0.25) {
      const randomEvent = KM_EVENTS[Math.floor(Math.random() * KM_EVENTS.length)]
      setKmActiveEvent(randomEvent)
      setKmActiveEventTurns(randomEvent.durationTurns)
      setKmEventLog(prev => [
        ...prev,
        { eventId: randomEvent.id, triggeredAt: Date.now(), resolvedAt: null },
      ])
    }

    return true
  }, [kmLevel, kmMonks, kmArtifacts, kmActiveEvent, kmAddXp, kmAddCoins])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Recruit Monk
  // ────────────────────────────────────────────────────────────────
  const recruitMonk = useCallback((creatureDefId: string): boolean => {
    const creatureDef = KM_CREATURES.find(c => c.id === creatureDefId)
    if (!creatureDef) return false

    if (!kmSpendCoins(creatureDef.cost)) return false

    const newInstance: KmCreatureInstance = {
      id: `monk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      creatureDefId: creatureDef.id,
      name: creatureDef.name,
      level: 1,
      xp: 0,
      karma: 0,
      meditationHours: 0,
      recruitedAt: Date.now(),
    }

    setKmMonks(prev => [...prev, newInstance])
    kmCheckTitleUnlocks(kmLevel, kmMonks.length + 1)
    kmCheckAchievements({
      totalMeditated: kmTotalMeditated,
      totalChanted: kmTotalChanted,
      totalOffered: kmTotalOffered,
      totalCultivated: kmTotalCultivated,
      totalStudied: kmTotalStudied,
      totalPurified: kmTotalPurified,
      totalAscended: kmTotalAscended,
      monks: [...kmMonks, newInstance],
      artifacts: kmArtifacts,
      chambers: kmChambers,
      level: kmLevel,
      coins: kmCoins,
      totalCoins: kmTotalCoins,
      achievements: kmAchievements,
    })
    return true
  }, [kmCoins, kmTotalCoins, kmLevel, kmMonks, kmArtifacts, kmChambers, kmAchievements, kmTotalMeditated, kmTotalChanted, kmTotalOffered, kmTotalCultivated, kmTotalStudied, kmTotalPurified, kmTotalAscended, kmSpendCoins, kmCheckTitleUnlocks, kmCheckAchievements])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Build Structure
  // ────────────────────────────────────────────────────────────────
  const buildStructure = useCallback((structureDefId: string): boolean => {
    const def = KM_STRUCTURES.find(s => s.id === structureDefId)
    if (!def) return false

    const existing = kmStructures.find(s => s.structureDefId === structureDefId)
    if (existing) {
      const cost = kmCalcUpgradeCost(def, existing.level)
      if (!kmSpendCoins(cost)) return false
      setKmStructures(prev =>
        prev.map(s =>
          s.structureDefId === structureDefId ? { ...s, level: s.level + 1 } : s,
        ),
      )
    } else {
      if (!kmSpendCoins(def.baseCost)) return false
      const newInstance: KmStructureInstance = {
        id: `struct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        structureDefId: def.id,
        level: 1,
        builtAt: Date.now(),
      }
      setKmStructures(prev => [...prev, newInstance])
    }
    return true
  }, [kmStructures, kmSpendCoins])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Activate Artifact
  // ────────────────────────────────────────────────────────────────
  const activateArtifact = useCallback((artifactId: string): boolean => {
    if (kmArtifacts.includes(artifactId)) return false
    const def = KM_ARTIFACTS.find(a => a.id === artifactId)
    if (!def) return false

    setKmArtifacts(prev => [...prev, artifactId])
    kmCheckAchievements({
      totalMeditated: kmTotalMeditated,
      totalChanted: kmTotalChanted,
      totalOffered: kmTotalOffered,
      totalCultivated: kmTotalCultivated,
      totalStudied: kmTotalStudied,
      totalPurified: kmTotalPurified,
      totalAscended: kmTotalAscended,
      monks: kmMonks,
      artifacts: [...kmArtifacts, artifactId],
      chambers: kmChambers,
      level: kmLevel,
      coins: kmCoins,
      totalCoins: kmTotalCoins,
      achievements: kmAchievements,
    })
    return true
  }, [kmArtifacts, kmMonks, kmChambers, kmLevel, kmCoins, kmTotalCoins, kmAchievements, kmTotalMeditated, kmTotalChanted, kmTotalOffered, kmTotalCultivated, kmTotalStudied, kmTotalPurified, kmTotalAscended, kmCheckAchievements])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Unlock Ability
  // ────────────────────────────────────────────────────────────────
  const unlockAbility = useCallback((abilityId: string): boolean => {
    if (kmAbilities.includes(abilityId)) return false
    const def = KM_ABILITIES.find(a => a.id === abilityId)
    if (!def) return false

    setKmAbilities(prev => [...prev, abilityId])
    return true
  }, [kmAbilities])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Set Title
  // ────────────────────────────────────────────────────────────────
  const setTitle = useCallback((titleId: string): boolean => {
    const title = KM_TITLES.find(t => t.id === titleId)
    if (!title) return false
    if (kmLevel < title.minLevel) return false
    if (kmMonks.length < title.minMonks) return false
    setKmCurrentTitle(titleId)
    return true
  }, [kmLevel, kmMonks.length])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Trigger Event
  // ────────────────────────────────────────────────────────────────
  const triggerEvent = useCallback((eventId: string): boolean => {
    if (kmActiveEvent) return false
    const def = KM_EVENTS.find(e => e.id === eventId)
    if (!def) return false

    setKmActiveEvent(def)
    setKmActiveEventTurns(def.durationTurns)
    setKmEventLog(prev => [
      ...prev,
      { eventId: def.id, triggeredAt: Date.now(), resolvedAt: null },
    ])
    return true
  }, [kmActiveEvent])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Dismiss Monk
  // ────────────────────────────────────────────────────────────────
  const dismissMonk = useCallback((monkId: string): boolean => {
    const monk = kmMonks.find(m => m.id === monkId)
    if (!monk) return false
    const def = KM_CREATURES.find(c => c.id === monk.creatureDefId)
    if (!def) return false

    const refund = Math.floor(def.cost * 0.3)
    kmAddCoins(refund)
    setKmMonks(prev => prev.filter(m => m.id !== monkId))
    return true
  }, [kmMonks, kmAddCoins])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Manual Save
  // ────────────────────────────────────────────────────────────────
  const kmSave = useCallback(() => {
    kmSaveState(stateRef.current)
  }, [])

  // ────────────────────────────────────────────────────────────────
  // ACTION: Reset
  // ────────────────────────────────────────────────────────────────
  const kmReset = useCallback(() => {
    const defaults = kmGetDefaultState()
    setKmLevel(defaults.level)
    setKmXp(defaults.xp)
    setKmCoins(defaults.coins)
    setKmTotalXp(defaults.totalXp)
    setKmTotalCoins(defaults.totalCoins)
    setKmMonks(defaults.monks)
    setKmInventory(defaults.inventory)
    setKmStructures(defaults.structures)
    setKmArtifacts(defaults.artifacts)
    setKmAbilities(defaults.abilities)
    setKmAchievements(defaults.achievements)
    setKmChambers(defaults.chambers)
    setKmEventLog(defaults.eventLog)
    setKmActiveEvent(defaults.activeEvent)
    setKmActiveEventTurns(defaults.activeEventTurnsRemaining)
    setKmCurrentTitle(defaults.currentTitle)
    setKmTotalMeditated(defaults.totalMeditated)
    setKmTotalChanted(defaults.totalChanted)
    setKmTotalOffered(defaults.totalOffered)
    setKmTotalCultivated(defaults.totalCultivated)
    setKmTotalStudied(defaults.totalStudied)
    setKmTotalPurified(defaults.totalPurified)
    setKmTotalAscended(defaults.totalAscended)
    kmSaveState(defaults)
  }, [])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Level progress
  // ────────────────────────────────────────────────────────────────
  const kmLevelProgress = useMemo(
    () => kmCalcLevelProgress(kmXp, kmLevel),
    [kmXp, kmLevel],
  )

  const kmXpToNextLevel = useMemo(
    () => kmCalcXpForLevel(kmLevel),
    [kmLevel],
  )

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Current title data
  // ────────────────────────────────────────────────────────────────
  const kmCurrentTitleData = useMemo(() => {
    return KM_TITLES.find(t => t.id === kmCurrentTitle) ?? KM_TITLES[0]
  }, [kmCurrentTitle])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Unlocked titles
  // ────────────────────────────────────────────────────────────────
  const kmUnlockedTitles = useMemo(() => {
    return KM_TITLES.filter(t => kmLevel >= t.minLevel && kmMonks.length >= t.minMonks)
  }, [kmLevel, kmMonks.length])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Enriched monks
  // ────────────────────────────────────────────────────────────────
  const kmEnrichedMonks = useMemo(() => {
    return kmMonks.map(monk => {
      const def = KM_CREATURES.find(c => c.id === monk.creatureDefId)
      const species = def ? KM_SPECIES.find(s => s.id === def.species) : null
      return {
        ...monk,
        creatureDef: def ?? null,
        speciesDef: species ?? null,
        speciesColor: species?.color ?? KM_THEME.mistGray,
      }
    })
  }, [kmMonks])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Available creatures to recruit
  // ────────────────────────────────────────────────────────────────
  const kmAvailableCreatures = useMemo(() => {
    const ownedDefIds = new Set(kmMonks.map(m => m.creatureDefId))
    return KM_CREATURES.filter(c => !ownedDefIds.has(c.id))
  }, [kmMonks])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Available structures
  // ────────────────────────────────────────────────────────────────
  const kmAvailableStructures = useMemo(() => {
    return KM_STRUCTURES.map(def => {
      const instance = kmStructures.find(s => s.structureDefId === def.id)
      const currentLevel = instance?.level ?? 0
      const cost = instance ? kmCalcUpgradeCost(def, currentLevel) : def.baseCost
      const isBuilt = currentLevel > 0
      const isMaxed = currentLevel >= def.maxLevel
      return { def, instance: instance ?? null, currentLevel, cost, isBuilt, isMaxed }
    })
  }, [kmStructures])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Monks by species
  // ────────────────────────────────────────────────────────────────
  const kmMonksBySpecies = useMemo(() => {
    const map: Record<string, KmCreatureInstance[]> = {}
    for (const species of KM_SPECIES) {
      map[species.id] = kmMonks.filter(m => {
        const def = KM_CREATURES.find(c => c.id === m.creatureDefId)
        return def?.species === species.id
      })
    }
    return map
  }, [kmMonks])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Monks by rarity
  // ────────────────────────────────────────────────────────────────
  const kmMonksByRarity = useMemo(() => {
    const map: Record<KmRarity, KmCreatureInstance[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    }
    for (const monk of kmMonks) {
      const def = KM_CREATURES.find(c => c.id === monk.creatureDefId)
      if (def) {
        map[def.rarity].push(monk)
      }
    }
    return map
  }, [kmMonks])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Total monk power
  // ────────────────────────────────────────────────────────────────
  const kmTotalMonkPower = useMemo(() => {
    return kmMonks.reduce((sum, m) => {
      const def = KM_CREATURES.find(c => c.id === m.creatureDefId)
      return sum + (def?.power ?? 0) * (1 + m.level * 0.1)
    }, 0)
  }, [kmMonks])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Total monk defense
  // ────────────────────────────────────────────────────────────────
  const kmTotalMonkDefense = useMemo(() => {
    return kmMonks.reduce((sum, m) => {
      const def = KM_CREATURES.find(c => c.id === m.creatureDefId)
      return sum + (def?.defense ?? 0) * (1 + m.level * 0.1)
    }, 0)
  }, [kmMonks])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Total artifact bonuses
  // ────────────────────────────────────────────────────────────────
  const kmArtifactBonuses = useMemo(() => {
    let powerBoost = 0
    let defenseBoost = 0
    let karmaBoost = 0
    for (const artId of kmArtifacts) {
      const art = KM_ARTIFACTS.find(a => a.id === artId)
      if (art) {
        powerBoost += art.powerBoost
        defenseBoost += art.defenseBoost
        karmaBoost += art.karmaBoost
      }
    }
    return { powerBoost, defenseBoost, karmaBoost }
  }, [kmArtifacts])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Enriched inventory
  // ────────────────────────────────────────────────────────────────
  const kmEnrichedInventory = useMemo(() => {
    return kmInventory.map(item => {
      const mat = KM_MATERIALS.find(m => m.id === item.materialId)
      return {
        ...item,
        materialDef: mat ?? null,
        rarityColor: mat ? kmCalcRarityColor(mat.rarity) : KM_THEME.mistGray,
      }
    })
  }, [kmInventory])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Total karma rating
  // ────────────────────────────────────────────────────────────────
  const kmKarmaRating = useMemo(() => {
    const monkKarma = kmMonks.reduce((sum, m) => sum + m.karma, 0)
    const actionKarma =
      kmTotalMeditated * 1 +
      kmTotalChanted * 2 +
      kmTotalOffered * 1 +
      kmTotalPurified * 3 +
      kmTotalAscended * 10
    return monkKarma + actionKarma + kmArtifactBonuses.karmaBoost
  }, [kmMonks, kmTotalMeditated, kmTotalChanted, kmTotalOffered, kmTotalPurified, kmTotalAscended, kmArtifactBonuses.karmaBoost])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Available chambers (unlocked)
  // ────────────────────────────────────────────────────────────────
  const kmUnlockedChambers = useMemo(() => {
    return KM_CHAMBERS.filter(c => kmChambers.includes(c.id))
  }, [kmChambers])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Locked chambers
  // ────────────────────────────────────────────────────────────────
  const kmLockedChambers = useMemo(() => {
    return KM_CHAMBERS.filter(c => !kmChambers.includes(c.id))
  }, [kmChambers])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Available abilities (not yet unlocked)
  // ────────────────────────────────────────────────────────────────
  const kmAvailableAbilities = useMemo(() => {
    return KM_ABILITIES.filter(a => !kmAbilities.includes(a.id))
  }, [kmAbilities])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Unlocked abilities (with data)
  // ────────────────────────────────────────────────────────────────
  const kmUnlockedAbilitiesData = useMemo(() => {
    return KM_ABILITIES.filter(a => kmAbilities.includes(a.id))
  }, [kmAbilities])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Unclaimed achievements
  // ────────────────────────────────────────────────────────────────
  const kmUnclaimedAchievements = useMemo(() => {
    return KM_ACHIEVEMENTS.filter(a => !kmAchievements.includes(a.id))
  }, [kmAchievements])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Claimed achievements (with data)
  // ────────────────────────────────────────────────────────────────
  const kmClaimedAchievementsData = useMemo(() => {
    return KM_ACHIEVEMENTS.filter(a => kmAchievements.includes(a.id))
  }, [kmAchievements])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Creature stats by species
  // ────────────────────────────────────────────────────────────────
  const kmSpeciesStats = useMemo(() => {
    return KM_SPECIES.map(species => {
      const creatures = KM_CREATURES.filter(c => c.species === species.id)
      const owned = kmMonks.filter(m => {
        const def = KM_CREATURES.find(c => c.id === m.creatureDefId)
        return def?.species === species.id
      })
      return {
        ...species,
        totalCreatures: creatures.length,
        ownedCount: owned.length,
        totalPower: owned.reduce((sum, m) => {
          const def = KM_CREATURES.find(c => c.id === m.creatureDefId)
          return sum + (def?.power ?? 0)
        }, 0),
      }
    })
  }, [kmMonks])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Power ranking
  // ────────────────────────────────────────────────────────────────
  const kmPowerRanking = useMemo(() => {
    const base = kmLevel * 10
    const monkPower = kmTotalMonkPower
    const structurePower = kmStructures.reduce((sum, s) => {
      const def = KM_STRUCTURES.find(d => d.id === s.structureDefId)
      return sum + (def ? (def.baseEffect + def.effectPerLevel * s.level) * 2 : 0)
    }, 0)
    const artifactPower = kmArtifactBonuses.powerBoost + kmArtifactBonuses.defenseBoost + kmArtifactBonuses.karmaBoost
    return Math.floor(base + monkPower + structurePower + artifactPower)
  }, [kmLevel, kmTotalMonkPower, kmStructures, kmArtifactBonuses])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Effective multiplier from structures
  // ────────────────────────────────────────────────────────────────
  const kmStructureMultipliers = useMemo(() => {
    const mults: Record<KmStructureBonusType, number> = {
      meditation_boost: 0,
      karma_income: 0,
      resource_yield: 0,
      chant_power: 0,
      enlightenment_rate: 0,
      purify_speed: 0,
      offering_value: 0,
      garden_growth: 0,
    }
    for (const s of kmStructures) {
      const def = KM_STRUCTURES.find(d => d.id === s.structureDefId)
      if (!def) continue
      mults[def.bonusType] += def.baseEffect + def.effectPerLevel * s.level
    }
    return mults
  }, [kmStructures])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Event is active?
  // ────────────────────────────────────────────────────────────────
  const kmIsEventActive = useMemo(
    () => kmActiveEvent !== null && kmActiveEventTurns > 0,
    [kmActiveEvent, kmActiveEventTurns],
  )

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Is max level?
  // ────────────────────────────────────────────────────────────────
  const kmIsMaxLevel = useMemo(() => kmLevel >= KM_MAX_LEVEL, [kmLevel])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Recent event log (last 20)
  // ────────────────────────────────────────────────────────────────
  const kmRecentEventLog = useMemo(() => {
    return [...kmEventLog].reverse().slice(0, 20).map(entry => ({
      ...entry,
      eventDef: KM_EVENTS.find(e => e.id === entry.eventId) ?? null,
    }))
  }, [kmEventLog])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Materials by rarity
  // ────────────────────────────────────────────────────────────────
  const kmMaterialsByRarity = useMemo(() => {
    const map: Record<KmRarity, KmMaterialDef[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    }
    for (const mat of KM_MATERIALS) {
      map[mat.rarity].push(mat)
    }
    return map
  }, [])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Next chamber unlock info
  // ────────────────────────────────────────────────────────────────
  const kmNextChamberUnlock = useMemo(() => {
    const locked = KM_CHAMBERS.find(c => !kmChambers.includes(c.id))
    if (!locked) return null
    const levelsNeeded = Math.max(0, locked.unlockLevel - kmLevel)
    return { chamber: locked, levelsNeeded }
  }, [kmChambers, kmLevel])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Total structure count
  // ────────────────────────────────────────────────────────────────
  const kmTotalStructuresBuilt = useMemo(() => kmStructures.length, [kmStructures])

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Total inventory items
  // ────────────────────────────────────────────────────────────────
  const kmTotalInventoryItems = useMemo(
    () => kmInventory.reduce((sum, i) => sum + i.count, 0),
    [kmInventory],
  )

  // ────────────────────────────────────────────────────────────────
  // COMPUTED: Total unique materials collected
  // ────────────────────────────────────────────────────────────────
  const kmUniqueMaterialsCollected = useMemo(
    () => kmInventory.filter(i => i.count > 0).length,
    [kmInventory],
  )

  // ══════════════════════════════════════════════════════════════════
  // RETURN OBJECT
  // ══════════════════════════════════════════════════════════════════

  return {
    // ── Constants ───────────────────────────────────────────────
    KM_SAVE_KEY,
    KM_MAX_LEVEL,
    KM_STARTING_COINS,
    KM_STARTING_XP,
    KM_AUTO_SAVE_INTERVAL_MS,
    KM_SPECIES,
    KM_CREATURES,
    KM_CHAMBERS,
    KM_MATERIALS,
    KM_STRUCTURES,
    KM_ABILITIES,
    KM_ACHIEVEMENTS,
    KM_TITLES,
    KM_ARTIFACTS,
    KM_EVENTS,
    KM_THEME,
    KM_RARITY_ORDER,

    // ── Core State ──────────────────────────────────────────────
    kmLevel,
    kmXp,
    kmCoins,
    kmTotalXp,
    kmTotalCoins,

    // ── Collection State ────────────────────────────────────────
    kmMonks,
    kmInventory,
    kmStructures,
    kmArtifacts,
    kmAbilities,
    kmAchievements,
    kmChambers,
    kmEventLog,
    kmActiveEvent,
    kmActiveEventTurns,

    // ── Title & Stats ───────────────────────────────────────────
    kmCurrentTitle,
    kmTotalMeditated,
    kmTotalChanted,
    kmTotalOffered,
    kmTotalCultivated,
    kmTotalStudied,
    kmTotalPurified,
    kmTotalAscended,

    // ── Actions ─────────────────────────────────────────────────
    meditateMonk,
    chantMantra,
    offerIncense,
    cultivateGarden,
    studyScroll,
    purifyChamber,
    ascendRealm,
    recruitMonk,
    buildStructure,
    activateArtifact,
    unlockAbility,
    setTitle,
    triggerEvent,
    dismissMonk,
    kmSave,
    kmReset,

    // ── Computed Values ─────────────────────────────────────────
    kmLevelProgress,
    kmXpToNextLevel,
    kmCurrentTitleData,
    kmUnlockedTitles,
    kmEnrichedMonks,
    kmAvailableCreatures,
    kmAvailableStructures,
    kmMonksBySpecies,
    kmMonksByRarity,
    kmTotalMonkPower,
    kmTotalMonkDefense,
    kmArtifactBonuses,
    kmEnrichedInventory,
    kmKarmaRating,
    kmUnlockedChambers,
    kmLockedChambers,
    kmAvailableAbilities,
    kmUnlockedAbilitiesData,
    kmUnclaimedAchievements,
    kmClaimedAchievementsData,
    kmSpeciesStats,
    kmPowerRanking,
    kmStructureMultipliers,
    kmIsEventActive,
    kmIsMaxLevel,
    kmRecentEventLog,
    kmMaterialsByRarity,
    kmNextChamberUnlock,
    kmTotalStructuresBuilt,
    kmTotalInventoryItems,
    kmUniqueMaterialsCollected,

    // ── Helpers ─────────────────────────────────────────────────
    kmCalcXpForLevel,
    kmCalcRarityMultiplier,
    kmCalcRarityColor,
    kmCalcUpgradeCost,
    kmCalcLevelProgress,
    kmGetSpeciesColor,
    kmGetDefaultState,
  }
}
