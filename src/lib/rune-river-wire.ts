// ═══════════════════════════════════════════════════════════════════════════════
// RUNE RIVER — 符文之河 — Wire Hook
//
// A mystical river navigation system for the Word Snake game (单词贪吃蛇).
// Players carve ancient runes, navigate treacherous rivers, harvest mana
// crystals, capture river creatures, build riverside structures, discover
// rune combinations, visit shrines for blessings, and ascend from Rune
// Apprentice to River Archmage.
//
// Persistence: Zustand + localStorage (key: ws_rune_river_wire)
// Prefix: rr (actions), RR_ (constants & types)
// ═══════════════════════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type RRSchool = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Void'
export type RRRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface RRRuneDef {
  readonly id: string
  readonly name: string
  readonly school: RRSchool
  readonly power: number
  readonly description: string
  readonly carvingDifficulty: number
  readonly manaCost: number
  readonly icon: string
}

export interface RRRiverDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly dangerLevel: number
  readonly rewards: string[]
  readonly length: number
  readonly icon: string
}

export interface RRManaTypeDef {
  readonly id: string
  readonly name: string
  readonly element: string
  readonly purity: number
  readonly color: string
  readonly rarity: RRRarity
  readonly description: string
}

export interface RRCreatureDef {
  readonly id: string
  readonly name: string
  readonly rarity: RRRarity
  readonly habitat: string
  readonly description: string
  readonly abilities: string[]
  readonly icon: string
  readonly captureDifficulty: number
}

export interface RRStructureDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly maxLevel: number
  readonly baseBuildCost: number
  readonly upgradeCostPerLevel: number
  readonly category: string
}

export interface RRAbilityDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cooldown: number
  readonly power: number
  readonly icon: string
  readonly school: RRSchool
}

export interface RRAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly conditionKey: string
  readonly targetValue: number
  readonly reward: { type: string; value: number }
}

export interface RRTitleDef {
  readonly id: string
  readonly name: string
  readonly requiredLevel: number
  readonly description: string
  readonly color: string
}

export interface RRRuneComboDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredRunes: string[]
  readonly resultingPower: number
  readonly icon: string
}

export interface RRNavigationChartDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly unlockLevel: number
  readonly reveals: string[]
  readonly icon: string
}

export interface RRShrineDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly blessing: string
  readonly offerings: string[]
  readonly icon: string
}

export interface RRCarvedRuneInstance {
  readonly instanceId: string
  readonly runeId: string
  readonly activated: boolean
  readonly carvedAt: number
}

export interface RRRiverProgress {
  readonly riverId: string
  readonly distanceTraveled: number
  readonly campsSet: number
  readonly firstVisitAt: number | null
  readonly completed: boolean
}

export interface RRCreatureInstance {
  readonly instanceId: string
  readonly creatureId: string
  readonly capturedAt: number
  readonly nickname: string
}

export interface RRStructureInstance {
  readonly instanceId: string
  readonly structureDefId: string
  readonly level: number
  readonly builtAt: number
}

export interface RRShrineInstance {
  readonly shrineId: string
  readonly visited: boolean
  readonly lastVisitAt: number | null
  readonly offeringCount: number
  readonly blessingActive: boolean
}

export interface RRState {
  carvedRunes: RRCarvedRuneInstance[]
  riverProgress: RRRiverProgress[]
  manaCrystals: Record<string, number>
  creatures: RRCreatureInstance[]
  structures: RRStructureInstance[]
  runeCombos: string[]
  charts: string[]
  shrines: Record<string, RRShrineInstance>
  riverLevel: number
  riverExp: number
  gold: number
  mana: number
  currentRiver: string | null
  achievements: string[]
  currentTitle: string
  totalCarved: number
  totalNavigated: number
  totalCaptured: number
  flowEnergy: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: COLOR CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_COLOR_FIRE_RUNE = '#FF6347'
export const RR_COLOR_WATER_RUNE = '#4169E1'
export const RR_COLOR_EARTH_RUNE = '#8B4513'
export const RR_COLOR_AIR_RUNE = '#87CEEB'
export const RR_COLOR_VOID_RUNE = '#483D8B'
export const RR_COLOR_MANA = '#00FF7F'
export const RR_COLOR_RIVER = '#20B2AA'
export const RR_COLOR_SHRINE = '#DAA520'

export const RR_SCHOOL_COLORS: Record<RRSchool, string> = {
  Fire: RR_COLOR_FIRE_RUNE,
  Water: RR_COLOR_WATER_RUNE,
  Earth: RR_COLOR_EARTH_RUNE,
  Air: RR_COLOR_AIR_RUNE,
  Void: RR_COLOR_VOID_RUNE,
}

export const RR_RARITY_COLORS: Record<RRRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: RUNES — 30 ancient runes across 5 schools (6 per school)
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_RUNES: RRRuneDef[] = [
  // ── Fire School (6) ────────────────────────────────────────────────
  {
    id: 'inferno_mark',
    name: 'Inferno Mark',
    school: 'Fire',
    power: 12,
    description: 'A blazing sigil that channels raw flame energy into the river currents, heating the waters to scalding temperatures.',
    carvingDifficulty: 1,
    manaCost: 10,
    icon: '🔥',
  },
  {
    id: 'ember_spiral',
    name: 'Ember Spiral',
    school: 'Fire',
    power: 18,
    description: 'A coiling rune of smoldering embers that ignites the surface of the river, creating a protective barrier of living flame.',
    carvingDifficulty: 2,
    manaCost: 18,
    icon: '🌀',
  },
  {
    id: 'sun_forge_seal',
    name: 'Sun Forge Seal',
    school: 'Fire',
    power: 28,
    description: 'An ancient seal inscribed by the first sun-smiths. When carved near a river, it forges new channels through sheer heat.',
    carvingDifficulty: 4,
    manaCost: 32,
    icon: '☀️',
  },
  {
    id: 'phoenix_crest',
    name: 'Phoenix Crest',
    school: 'Fire',
    power: 40,
    description: 'The legendary crest of the river phoenix. Carving it summons flames that purify even the most tainted waters.',
    carvingDifficulty: 6,
    manaCost: 50,
    icon: '🦅',
  },
  {
    id: 'magma_heart',
    name: 'Magma Heart',
    school: 'Fire',
    power: 55,
    description: 'A pulsing rune drawn from the planet\'s molten core. It can boil an entire river basin if left unchecked.',
    carvingDifficulty: 8,
    manaCost: 75,
    icon: '🌋',
  },
  {
    id: 'blaze_sovereign',
    name: 'Blaze Sovereign',
    school: 'Fire',
    power: 72,
    description: 'The supreme fire rune — the signature of the Blaze Sovereign who once ruled the River of Flame.',
    carvingDifficulty: 10,
    manaCost: 100,
    icon: '👑',
  },

  // ── Water School (6) ───────────────────────────────────────────────
  {
    id: 'droplet_sigil',
    name: 'Droplet Sigil',
    school: 'Water',
    power: 10,
    description: 'The simplest water rune, shaped like a single perfect droplet. It calms turbulent waters with a gentle touch.',
    carvingDifficulty: 1,
    manaCost: 8,
    icon: '💧',
  },
  {
    id: 'tide_weaver',
    name: 'Tide Weaver',
    school: 'Water',
    power: 16,
    description: 'A flowing rune that weaves the tides to the carver\'s will, allowing safe passage through flooded channels.',
    carvingDifficulty: 2,
    manaCost: 16,
    icon: '🌊',
  },
  {
    id: 'frost_fang',
    name: 'Frost Fang',
    school: 'Water',
    power: 26,
    description: 'A biting rune that crystallizes river water into deadly ice fangs, useful for both offense and bridge building.',
    carvingDifficulty: 4,
    manaCost: 30,
    icon: '🧊',
  },
  {
    id: 'whispering_flood',
    name: 'Whispering Flood',
    school: 'Water',
    power: 38,
    description: 'A sentient water rune that speaks in the voices of drowned sages, revealing hidden river passages.',
    carvingDifficulty: 6,
    manaCost: 48,
    icon: '🗣️',
  },
  {
    id: 'monsoon_wrath',
    name: 'Monsoon Wrath',
    school: 'Water',
    power: 52,
    description: 'Summons the fury of the great monsoons, causing river levels to rise dramatically and sweep away obstacles.',
    carvingDifficulty: 8,
    manaCost: 70,
    icon: '⛈️',
  },
  {
    id: 'abyssal_crown',
    name: 'Abyssal Crown',
    school: 'Water',
    power: 68,
    description: 'The deep-sea crown of the Abyssal Leviathan. Grants dominion over all underwater currents and creatures.',
    carvingDifficulty: 10,
    manaCost: 95,
    icon: '🐙',
  },

  // ── Earth School (6) ───────────────────────────────────────────────
  {
    id: 'stone_scratch',
    name: 'Stone Scratch',
    school: 'Earth',
    power: 11,
    description: 'A rudimentary earth rune scratched onto river stones. It reinforces riverbanks against erosion.',
    carvingDifficulty: 1,
    manaCost: 9,
    icon: '🪨',
  },
  {
    id: 'root_bind',
    name: 'Root Bind',
    school: 'Earth',
    power: 17,
    description: 'Summons ancient tree roots from beneath the riverbed to bind structures and stabilize bridges.',
    carvingDifficulty: 2,
    manaCost: 17,
    icon: '🌿',
  },
  {
    id: 'crystal_spine',
    name: 'Crystal Spine',
    school: 'Earth',
    power: 27,
    description: 'Grows a ridge of living crystals along the river\'s edge, forming a natural defense against floods.',
    carvingDifficulty: 4,
    manaCost: 31,
    icon: '💎',
  },
  {
    id: 'petrified_wake',
    name: 'Petrified Wake',
    school: 'Earth',
    power: 39,
    description: 'Turns the water itself to stone for a brief moment, creating instant crossings where none existed before.',
    carvingDifficulty: 6,
    manaCost: 49,
    icon: '🪵',
  },
  {
    id: 'continental_press',
    name: 'Continental Press',
    school: 'Earth',
    power: 54,
    description: 'A cataclysmic rune that shifts the very plates beneath the river, rerouting its course entirely.',
    carvingDifficulty: 8,
    manaCost: 72,
    icon: '🏔️',
  },
  {
    id: 'world_root_scepter',
    name: 'World Root Scepter',
    school: 'Earth',
    power: 70,
    description: 'Taps into the deepest root of the world tree, granting total control over stone, soil, and sediment.',
    carvingDifficulty: 10,
    manaCost: 98,
    icon: '🌳',
  },

  // ── Air School (6) ─────────────────────────────────────────────────
  {
    id: 'breeze_stroke',
    name: 'Breeze Stroke',
    school: 'Air',
    power: 10,
    description: 'A light rune that whispers across the river surface, summoning favorable winds for downstream travel.',
    carvingDifficulty: 1,
    manaCost: 8,
    icon: '💨',
  },
  {
    id: 'gale_spiral',
    name: 'Gale Spiral',
    school: 'Air',
    power: 15,
    description: 'Creates a spiraling updraft above the river that can lift small boats over rapids and waterfalls.',
    carvingDifficulty: 2,
    manaCost: 15,
    icon: '🌪️',
  },
  {
    id: 'storm_caller',
    name: 'Storm Caller',
    school: 'Air',
    power: 25,
    description: 'A tempestuous rune that summons localized storms, charging the river with electrical energy.',
    carvingDifficulty: 4,
    manaCost: 29,
    icon: '⚡',
  },
  {
    id: 'zephyr_mantle',
    name: 'Zephyr Mantle',
    school: 'Air',
    power: 37,
    description: 'Wraps the river navigator in a cloak of air spirits that allow brief flight over dangerous waters.',
    carvingDifficulty: 6,
    manaCost: 47,
    icon: '🪶',
  },
  {
    id: 'cyclone_eye',
    name: 'Cyclone Eye',
    school: 'Air',
    power: 50,
    description: 'Opens the eye of a cyclone above the river, creating a column of unnatural calm in the midst of chaos.',
    carvingDifficulty: 8,
    manaCost: 68,
    icon: '🌀',
  },
  {
    id: 'aether_sovereign',
    name: 'Aether Sovereign',
    school: 'Air',
    power: 66,
    description: 'The wind king\'s personal rune. It commands the breath of the world, reshaping weather on a continental scale.',
    carvingDifficulty: 10,
    manaCost: 96,
    icon: '🌬️',
  },

  // ── Void School (6) ────────────────────────────────────────────────
  {
    id: 'shadow_flicker',
    name: 'Shadow Flicker',
    school: 'Void',
    power: 13,
    description: 'A flickering rune that bends shadows around the river\'s edge, hiding the navigator from hostile creatures.',
    carvingDifficulty: 1,
    manaCost: 11,
    icon: '🌑',
  },
  {
    id: 'void_stitch',
    name: 'Void Stitch',
    school: 'Void',
    power: 19,
    description: 'Sews small tears in reality along the riverbank, creating shortcuts through pockets of folded space.',
    carvingDifficulty: 2,
    manaCost: 19,
    icon: '✂️',
  },
  {
    id: 'null_current',
    name: 'Null Current',
    school: 'Void',
    power: 30,
    description: 'Creates a zone of absolute stillness in the river where all magic and physical forces are negated.',
    carvingDifficulty: 4,
    manaCost: 34,
    icon: '🕳️',
  },
  {
    id: 'abyss_gaze',
    name: 'Abyss Gaze',
    school: 'Void',
    power: 42,
    description: 'Opens a portal to the void beneath the river\'s surface, swallowing obstacles and enemies into nothingness.',
    carvingDifficulty: 6,
    manaCost: 52,
    icon: '👁️',
  },
  {
    id: 'entropy_spine',
    name: 'Entropy Spine',
    school: 'Void',
    power: 56,
    description: 'A rune of decay that accelerates time around it, eroding rocks, rusting bridges, and dissolving barriers.',
    carvingDifficulty: 8,
    manaCost: 74,
    icon: '💀',
  },
  {
    id: 'oblivion_crest',
    name: 'Oblivion Crest',
    school: 'Void',
    power: 74,
    description: 'The most feared of all void runes. Its activation can unmake entire rivers — or create them from nothing.',
    carvingDifficulty: 10,
    manaCost: 102,
    icon: '🏴',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: RIVERS — 8 mystical rivers
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_RIVERS: RRRiverDef[] = [
  {
    id: 'river_of_flame',
    name: 'River of Flame',
    description: 'A scorching waterway fed by underground volcanic vents. The water glows orange at night and boils near the banks, home to fire salamanders and magma serpents.',
    dangerLevel: 4,
    rewards: ['fire_runes', 'obsidian_shards', 'magma_pearls'],
    length: 480,
    icon: '🔥',
  },
  {
    id: 'crystal_stream',
    name: 'Crystal Stream',
    description: 'A glittering tributary where the riverbed is carpeted with living crystals that hum ancient melodies. The water is so clear it is nearly invisible.',
    dangerLevel: 2,
    rewards: ['earth_runes', 'crystal_shards', 'gem_essence'],
    length: 320,
    icon: '💎',
  },
  {
    id: 'whispering_brook',
    name: 'Whispering Brook',
    description: 'A gentle, meandering brook where the water speaks in forgotten tongues. Those who listen carefully can learn secrets of the ancient world.',
    dangerLevel: 1,
    rewards: ['air_runes', 'wisdom_fragments', 'spirit_dust'],
    length: 200,
    icon: '🗣️',
  },
  {
    id: 'abyss_current',
    name: 'Abyss Current',
    description: 'A dark, bottomless river that flows through an underground cavern system. Bioluminescent creatures light the way, but the depths hold unspeakable horrors.',
    dangerLevel: 8,
    rewards: ['void_runes', 'deep_crystals', 'leviathan_scales'],
    length: 750,
    icon: '🌊',
  },
  {
    id: 'aurora_flow',
    name: 'Aurora Flow',
    description: 'A shimmering river that runs through arctic tundra, reflecting the aurora borealis in its frozen surface. Time flows differently along its banks.',
    dangerLevel: 5,
    rewards: ['water_runes', 'aurora_essence', 'frost_blossoms'],
    length: 560,
    icon: '🌈',
  },
  {
    id: 'petrified_river',
    name: 'Petrified River',
    description: 'Once a mighty waterway, now almost entirely turned to stone. Only thin veins of water still flow between towering stone pillars shaped like waves.',
    dangerLevel: 6,
    rewards: ['earth_runes', 'petrified_wood', 'stone_spirits'],
    length: 620,
    icon: '🪨',
  },
  {
    id: 'spirit_tide',
    name: 'Spirit Tide',
    description: 'A river that flows uphill under the light of the full moon. Ghostly vessels traverse its length, crewed by the spirits of drowned navigators.',
    dangerLevel: 7,
    rewards: ['void_runes', 'spirit_cloths', 'spectral_compasses'],
    length: 680,
    icon: '👻',
  },
  {
    id: 'void_channel',
    name: 'Void Channel',
    description: 'The most dangerous river in existence. It flows between dimensions, its waters existing partially in our world and partially in the void. Only the most powerful rune carvers dare navigate it.',
    dangerLevel: 10,
    rewards: ['void_runes', 'dimensional_shards', 'entropy_orbs'],
    length: 900,
    icon: '🕳️',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: MANA CRYSTALS — 12 types
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_MANA_TYPES: RRManaTypeDef[] = [
  {
    id: 'spark_crystal',
    name: 'Spark Crystal',
    element: 'Fire',
    purity: 15,
    color: '#FF6347',
    rarity: 'common',
    description: 'A common crystal that crackles with minor fire energy, found along the banks of the River of Flame.',
  },
  {
    id: 'dewdrop_shard',
    name: 'Dewdrop Shard',
    element: 'Water',
    purity: 18,
    color: '#4169E1',
    rarity: 'common',
    description: 'A translucent water-aligned shard that tastes of pure mountain dew and hums at a gentle frequency.',
  },
  {
    id: 'moss_stone',
    name: 'Moss Stone',
    element: 'Earth',
    purity: 12,
    color: '#228B22',
    rarity: 'common',
    description: 'A humble earth crystal covered in living moss. Slowly generates mana when planted in fertile soil.',
  },
  {
    id: 'wind_gem',
    name: 'Wind Gem',
    element: 'Air',
    purity: 20,
    color: '#87CEEB',
    rarity: 'common',
    description: 'A lightweight gem that floats an inch above any surface, constantly generating a gentle breeze.',
  },
  {
    id: 'shadow_opal',
    name: 'Shadow Opal',
    element: 'Void',
    purity: 14,
    color: '#483D8B',
    rarity: 'common',
    description: 'A dark opal that absorbs ambient light, useful for basic void rune inscription and shadow magic.',
  },
  {
    id: 'blaze_heart',
    name: 'Blaze Heart',
    element: 'Fire',
    purity: 55,
    color: '#FF4500',
    rarity: 'uncommon',
    description: 'A rare fire crystal with a glowing core that radiates constant warmth. Sought by fire rune masters.',
  },
  {
    id: 'tidal_sapphire',
    name: 'Tidal Sapphire',
    element: 'Water',
    purity: 60,
    color: '#1E90FF',
    rarity: 'uncommon',
    description: 'A deep blue sapphire attuned to the ocean\'s rhythm. It pulses in time with the tides.',
  },
  {
    id: 'quartz_root',
    name: 'Quartz Root',
    element: 'Earth',
    purity: 50,
    color: '#DAA520',
    rarity: 'uncommon',
    description: 'A golden quartz crystal with roots that extend into the ground, drawing earth mana from deep below.',
  },
  {
    id: 'storm_peridot',
    name: 'Storm Peridot',
    element: 'Air',
    purity: 65,
    color: '#00FA9A',
    rarity: 'rare',
    description: 'A vivid green gemstone born inside thunderstorms. It crackles with captured lightning.',
  },
  {
    id: 'void_pearl',
    name: 'Void Pearl',
    element: 'Void',
    purity: 70,
    color: '#8B008B',
    rarity: 'rare',
    description: 'A pearl formed in the void between worlds. Looking into it reveals glimpses of other dimensions.',
  },
  {
    id: 'primordial_diamond',
    name: 'Primordial Diamond',
    element: 'All',
    purity: 95,
    color: '#FFD700',
    rarity: 'epic',
    description: 'A diamond from the birth of the world, containing traces of every element. The ultimate mana catalyst.',
  },
  {
    id: 'entropy_orb',
    name: 'Entropy Orb',
    element: 'Void',
    purity: 99,
    color: '#2F0047',
    rarity: 'legendary',
    description: 'A perfectly black sphere that devours light and emits pure void energy. The rarest of all mana crystals.',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: CREATURES — 35 river creatures (5 rarity tiers, 7 each)
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_CREATURES: RRCreatureDef[] = [
  // ── Common (7) ─────────────────────────────────────────────────────
  {
    id: 'river_newt',
    name: 'River Newt',
    rarity: 'common',
    habitat: 'whispering_brook',
    description: 'A small, iridescent newt that glows faintly in moonlight. Harmless but surprisingly fast swimmers.',
    abilities: ['glow', 'swift_swim'],
    icon: '🦎',
    captureDifficulty: 1,
  },
  {
    id: 'crystal_shrimp',
    name: 'Crystal Shrimp',
    rarity: 'common',
    habitat: 'crystal_stream',
    description: 'Translucent shrimp with crystalline shells that refract light into rainbow patterns.',
    abilities: ['light_refraction', 'shell_armor'],
    icon: '🦐',
    captureDifficulty: 1,
  },
  {
    id: 'moss_turtle',
    name: 'Moss Turtle',
    rarity: 'common',
    habitat: 'whispering_brook',
    description: 'A docile turtle whose shell is a miniature garden of river moss and tiny flowers.',
    abilities: ['nature_affinity', 'shell_shield'],
    icon: '🐢',
    captureDifficulty: 2,
  },
  {
    id: 'bubble_jellyfish',
    name: 'Bubble Jellyfish',
    rarity: 'common',
    habitat: 'aurora_flow',
    description: 'A jellyfish that encases itself in a permanent bubble, floating above the water surface.',
    abilities: ['bubble_trap', 'levitation'],
    icon: '🫧',
    captureDifficulty: 1,
  },
  {
    id: 'stone_minnow',
    name: 'Stone Minnow',
    rarity: 'common',
    habitat: 'petrified_river',
    description: 'A fish with stone-like scales that disguises itself as a pebble on the riverbed.',
    abilities: ['stone_disguise', 'rapid_burial'],
    icon: '🐟',
    captureDifficulty: 2,
  },
  {
    id: 'ember_salamander',
    name: 'Ember Salamander',
    rarity: 'common',
    habitat: 'river_of_flame',
    description: 'A small salamander that thrives in boiling water, leaving trails of sparks as it swims.',
    abilities: ['fire_resistance', 'spark_trail'],
    icon: '🦎',
    captureDifficulty: 2,
  },
  {
    id: 'dusk_moth',
    name: 'Dusk Moth',
    rarity: 'common',
    habitat: 'spirit_tide',
    description: 'A moth drawn to the spectral glow of the Spirit Tide, its wings carry faint echoes of the dead.',
    abilities: ['spirit_sense', 'wing_dust'],
    icon: '🦋',
    captureDifficulty: 1,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────────
  {
    id: 'frost_crab',
    name: 'Frost Crab',
    rarity: 'uncommon',
    habitat: 'aurora_flow',
    description: 'A crab with ice-crystal claws that can freeze small sections of river in seconds.',
    abilities: ['ice_claw', 'river_freeze'],
    icon: '🦀',
    captureDifficulty: 4,
  },
  {
    id: 'echo_dolphin',
    name: 'Echo Dolphin',
    rarity: 'uncommon',
    habitat: 'crystal_stream',
    description: 'A dolphin that uses sonic resonance to shatter underwater obstacles and communicate across vast distances.',
    abilities: ['sonic_blast', 'echo_location'],
    icon: '🐬',
    captureDifficulty: 5,
  },
  {
    id: 'magma_eel',
    name: 'Magma Eel',
    rarity: 'uncommon',
    habitat: 'river_of_flame',
    description: 'A serpentine eel that swims through molten rock as easily as water. Its bite can melt steel.',
    abilities: ['magma_swim', 'molten_bite'],
    icon: '🐍',
    captureDifficulty: 5,
  },
  {
    id: 'stone_golem_fish',
    name: 'Stone Golem Fish',
    rarity: 'uncommon',
    habitat: 'petrified_river',
    description: 'A massive fish made of animated stone plates that patrols the shallows of the Petrified River.',
    abilities: ['stone_body', 'ground_slam'],
    icon: '🗿',
    captureDifficulty: 6,
  },
  {
    id: 'whisper_wraith',
    name: 'Whisper Wraith',
    rarity: 'uncommon',
    habitat: 'spirit_tide',
    description: 'A semi-transparent eel-like creature that whispers the names of those who drowned in its waters.',
    abilities: ['name_whisper', 'phantom_dive'],
    icon: '👻',
    captureDifficulty: 4,
  },
  {
    id: 'gale_swallow',
    name: 'Gale Swallow',
    rarity: 'uncommon',
    habitat: 'whispering_brook',
    description: 'A swallow that rides wind currents above the water, creating miniature waterspouts when it dives.',
    abilities: ['wind_rider', 'waterspout'],
    icon: '🐦',
    captureDifficulty: 5,
  },
  {
    id: 'void_guppy',
    name: 'Void Guppy',
    rarity: 'uncommon',
    habitat: 'abyss_current',
    description: 'A small fish that periodically vanishes into micro-portals, reappearing elsewhere in the river.',
    abilities: ['blink', 'void_sense'],
    icon: '🐠',
    captureDifficulty: 5,
  },

  // ── Rare (7) ───────────────────────────────────────────────────────
  {
    id: 'aurora_serpent',
    name: 'Aurora Serpent',
    rarity: 'rare',
    habitat: 'aurora_flow',
    description: 'A massive snake whose scales shimmer with the colors of the northern lights. It controls the flow of the Aurora Flow itself.',
    abilities: ['aurora_shroud', 'flow_control', 'light_weave'],
    icon: '🐉',
    captureDifficulty: 8,
  },
  {
    id: 'crystal_crawler',
    name: 'Crystal Crawler',
    rarity: 'rare',
    habitat: 'crystal_stream',
    description: 'A spider-like creature made entirely of living crystal. It spins webs of pure diamond filament.',
    abilities: ['crystal_web', 'prism_laser', 'gem_armor'],
    icon: '🕷️',
    captureDifficulty: 9,
  },
  {
    id: 'inferno_koi',
    name: 'Inferno Koi',
    rarity: 'rare',
    habitat: 'river_of_flame',
    description: 'A legendary koi that swims through lava. Each scale contains a miniature flame that never extinguishes.',
    abilities: ['lava_swim', 'flame_scales', 'heat_aura'],
    icon: '🐡',
    captureDifficulty: 8,
  },
  {
    id: 'petrified_leviathan',
    name: 'Petrified Leviathan',
    rarity: 'rare',
    habitat: 'petrified_river',
    description: 'An ancient sea creature turned entirely to stone. Despite being petrified, it can still move — slowly.',
    abilities: ['stone_gaze', 'earthquake_step', 'petrify_touch'],
    icon: '🦕',
    captureDifficulty: 10,
  },
  {
    id: 'storm_heron',
    name: 'Storm Heron',
    rarity: 'rare',
    habitat: 'whispering_brook',
    description: 'A heron that summons thunderstorms when it takes flight. Lightning follows its beak like a beacon.',
    abilities: ['storm_call', 'lightning_strike', 'wind_barrier'],
    icon: '🦩',
    captureDifficulty: 8,
  },
  {
    id: 'spectral_crocodile',
    name: 'Spectral Crocodile',
    rarity: 'rare',
    habitat: 'spirit_tide',
    description: 'A ghostly crocodile that exists between life and death. It can drag living creatures into the spirit realm.',
    abilities: ['death_roll', 'spirit_drain', 'phase_shift'],
    icon: '🐊',
    captureDifficulty: 9,
  },
  {
    id: 'deep_angler',
    name: 'Deep Angler',
    rarity: 'rare',
    habitat: 'abyss_current',
    description: 'A horrifying anglerfish from the deepest reaches of the Abyss Current. Its lure contains a captured star.',
    abilities: ['star_lure', 'abyssal_bite', 'darkness_field'],
    icon: '🐡',
    captureDifficulty: 9,
  },

  // ── Epic (7) ───────────────────────────────────────────────────────
  {
    id: 'frost_dragon_turtle',
    name: 'Frost Dragon Turtle',
    rarity: 'epic',
    habitat: 'aurora_flow',
    description: 'A colossal turtle with dragon features, encased in eternal ice. Its breath freezes the river for miles.',
    abilities: ['ice_breath', 'glacial_shell', 'permafrost_aura'],
    icon: '🐲',
    captureDifficulty: 13,
  },
  {
    id: 'living_crystal_golem',
    name: 'Living Crystal Golem',
    rarity: 'epic',
    habitat: 'crystal_stream',
    description: 'A humanoid construct of pure crystal that guards a hidden chamber beneath the Crystal Stream.',
    abilities: ['crystal_storm', 'prison_shard', 'refract_field'],
    icon: '🗿',
    captureDifficulty: 14,
  },
  {
    id: 'magma_titan_serpent',
    name: 'Magma Titan Serpent',
    rarity: 'epic',
    habitat: 'river_of_flame',
    description: 'The largest creature in the River of Flame — a serpent so vast it IS the riverbed itself in places.',
    abilities: ['river_eruption', 'magma_tide', 'inferno_coil'],
    icon: '🐉',
    captureDifficulty: 15,
  },
  {
    id: 'echo_leviathan',
    name: 'Echo Leviathan',
    rarity: 'epic',
    habitat: 'whispering_brook',
    description: 'An invisible whale that reveals itself only through sound. Its songs can reshape reality.',
    abilities: ['reality_song', 'sonic_cannon', 'perception_warp'],
    icon: '🐋',
    captureDifficulty: 13,
  },
  {
    id: 'undying_pharaoh_fish',
    name: 'Undying Pharaoh Fish',
    rarity: 'epic',
    habitat: 'petrified_river',
    description: 'An immortal fish wrapped in ancient bandages that swims through solid stone as if it were water.',
    abilities: ['stone_pass', 'curse_touch', 'undying_will'],
    icon: '👻',
    captureDifficulty: 14,
  },
  {
    id: 'ghost_armada',
    name: 'Ghost Armada',
    rarity: 'epic',
    habitat: 'spirit_tide',
    description: 'Not a single creature but an armada of ghost ships crewed by spectral warriors that patrol the Spirit Tide.',
    abilities: ['spectral_broadside', 'fog_shroud', 'ghost_boarding'],
    icon: '🚢',
    captureDifficulty: 15,
  },
  {
    id: 'void_manta',
    name: 'Void Manta',
    rarity: 'epic',
    habitat: 'abyss_current',
    description: 'A manta ray that glides through the void between worlds, trailing streams of dissolved reality behind it.',
    abilities: ['void_glide', 'reality_tear', 'dimension_shift'],
    icon: '🦈',
    captureDifficulty: 14,
  },

  // ── Legendary (7) ──────────────────────────────────────────────────
  {
    id: 'world_river_dragon',
    name: 'World River Dragon',
    rarity: 'legendary',
    habitat: 'aurora_flow',
    description: 'The dragon that created all rivers by digging its claws into the world. To see it is to understand the flow of all things.',
    abilities: ['world_flow', 'river_creation', 'time_current', 'elemental_breath'],
    icon: '🐉',
    captureDifficulty: 20,
  },
  {
    id: 'diamond_serpent_king',
    name: 'Diamond Serpent King',
    rarity: 'legendary',
    habitat: 'crystal_stream',
    description: 'A serpent made of flawless diamond that rules the Crystal Stream. Its scales are each worth a fortune.',
    abilities: ['diamond_harden', 'prism_world', 'gem_domination', 'radiant_blind'],
    icon: '👑',
    captureDifficulty: 22,
  },
  {
    id: 'primordial_fire_whale',
    name: 'Primordial Fire Whale',
    rarity: 'legendary',
    habitat: 'river_of_flame',
    description: 'The first creature to swim in the River of Flame when the world was young. Its body temperature exceeds the sun\'s surface.',
    abilities: ['nova_burst', 'magma_diving', 'fire_storm', 'immolation_aura'],
    icon: '🐋',
    captureDifficulty: 21,
  },
  {
    id: 'monolith_sentinel',
    name: 'Monolith Sentinel',
    rarity: 'legendary',
    habitat: 'petrified_river',
    description: 'A sentient stone monolith that has watched over the Petrified River since before civilization began.',
    abilities: ['stone_awakening', 'continent_shift', 'petrify_all', 'eternal_vigil'],
    icon: '🏛️',
    captureDifficulty: 23,
  },
  {
    id: 'song_of_all_waters',
    name: 'Song of All Waters',
    rarity: 'legendary',
    habitat: 'whispering_brook',
    description: 'Not a creature but a sentient sound that travels through every river in the world simultaneously.',
    abilities: ['omniscient_sound', 'water_speech', 'flood_summon', 'calm_all'],
    icon: '🎵',
    captureDifficulty: 20,
  },
  {
    id: 'spectral_admiral',
    name: 'Spectral Admiral',
    rarity: 'legendary',
    habitat: 'spirit_tide',
    description: 'The ghost of the greatest navigator who ever lived, commanding an invincible fleet of phantom warships.',
    abilities: ['fleet_command', 'spirit_storm', 'dimensional_anchor', 'eternal_tide'],
    icon: '🏴‍☠️',
    captureDifficulty: 22,
  },
  {
    id: 'abyss_sovereign',
    name: 'Abyss Sovereign',
    rarity: 'legendary',
    habitat: 'abyss_current',
    description: 'The ruler of the Abyss Current — a being of pure void energy that has never been seen and lived to tell the tale.',
    abilities: ['void_domination', 'reality_dissolve', 'infinite_depths', 'oblivion_gaze'],
    icon: '👁️',
    captureDifficulty: 25,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: STRUCTURES — 25 upgradeable riverside structures
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_STRUCTURES: RRStructureDef[] = [
  // ── Runestone Workshops (5) ────────────────────────────────────────
  {
    id: 'basic_rune_workshop',
    name: 'Basic Rune Workshop',
    description: 'A modest riverside shelter with a stone table for carving beginner-level runes into river stones.',
    icon: '⚒️',
    maxLevel: 10,
    baseBuildCost: 50,
    upgradeCostPerLevel: 25,
    category: 'runestone_workshop',
  },
  {
    id: 'enchanted_carving_studio',
    name: 'Enchanted Carving Studio',
    description: 'A workshop infused with mana that aids in carving intermediate runes with greater precision.',
    icon: '✨',
    maxLevel: 10,
    baseBuildCost: 200,
    upgradeCostPerLevel: 60,
    category: 'runestone_workshop',
  },
  {
    id: 'elemental_forge',
    name: 'Elemental Forge',
    description: 'A forge powered by all five elements simultaneously, capable of producing powerful combination runes.',
    icon: '🔥',
    maxLevel: 10,
    baseBuildCost: 500,
    upgradeCostPerLevel: 100,
    category: 'runestone_workshop',
  },
  {
    id: 'void_inscription_chamber',
    name: 'Void Inscription Chamber',
    description: 'A chamber that exists partially in the void, enabling the carving of the most dangerous void runes.',
    icon: '🕳️',
    maxLevel: 10,
    baseBuildCost: 1200,
    upgradeCostPerLevel: 200,
    category: 'runestone_workshop',
  },
  {
    id: 'primordial_workshop',
    name: 'Primordial Workshop',
    description: 'The ultimate rune workshop, built on the site where the first rune was ever carved into the world.',
    icon: '🌟',
    maxLevel: 10,
    baseBuildCost: 3000,
    upgradeCostPerLevel: 500,
    category: 'runestone_workshop',
  },

  // ── Docks (5) ──────────────────────────────────────────────────────
  {
    id: 'wooden_dock',
    name: 'Wooden Dock',
    description: 'A simple wooden dock extending into the river, providing a safe place to board small vessels.',
    icon: '🪵',
    maxLevel: 10,
    baseBuildCost: 40,
    upgradeCostPerLevel: 20,
    category: 'dock',
  },
  {
    id: 'stone_pier',
    name: 'Stone Pier',
    description: 'A sturdy stone pier that can withstand flooding and provides mooring for larger boats.',
    icon: '🏗️',
    maxLevel: 10,
    baseBuildCost: 150,
    upgradeCostPerLevel: 45,
    category: 'dock',
  },
  {
    id: 'crystal_harbor',
    name: 'Crystal Harbor',
    description: 'A harbor with crystal-reinforced walls that protect vessels from magical attacks while docked.',
    icon: '💎',
    maxLevel: 10,
    baseBuildCost: 400,
    upgradeCostPerLevel: 80,
    category: 'dock',
  },
  {
    id: 'spirit_wharf',
    name: 'Spirit Wharf',
    description: 'A wharf that can dock both physical and spectral vessels, existing simultaneously in both realms.',
    icon: '👻',
    maxLevel: 10,
    baseBuildCost: 900,
    upgradeCostPerLevel: 150,
    category: 'dock',
  },
  {
    id: 'void_anchor_station',
    name: 'Void Anchor Station',
    description: 'A station that anchors ships in dimensional space, preventing them from drifting into the void.',
    icon: '⚓',
    maxLevel: 10,
    baseBuildCost: 2500,
    upgradeCostPerLevel: 400,
    category: 'dock',
  },

  // ── Bridges (5) ────────────────────────────────────────────────────
  {
    id: 'rope_bridge',
    name: 'Rope Bridge',
    description: 'A swaying rope bridge spanning a narrow section of the river. Serviceable but terrifying in strong winds.',
    icon: '🌉',
    maxLevel: 10,
    baseBuildCost: 30,
    upgradeCostPerLevel: 15,
    category: 'bridge',
  },
  {
    id: 'stone_arch_bridge',
    name: 'Stone Arch Bridge',
    description: 'A graceful stone arch bridge that provides safe crossing and a vantage point for observing river traffic.',
    icon: '🏛️',
    maxLevel: 10,
    baseBuildCost: 120,
    upgradeCostPerLevel: 35,
    category: 'bridge',
  },
  {
    id: 'living_vine_bridge',
    name: 'Living Vine Bridge',
    description: 'A bridge woven from living magical vines that self-repair and grow stronger over time.',
    icon: '🌿',
    maxLevel: 10,
    baseBuildCost: 350,
    upgradeCostPerLevel: 70,
    category: 'bridge',
  },
  {
    id: 'ice_sky_bridge',
    name: 'Ice Sky Bridge',
    description: 'A bridge of enchanted ice suspended high above the river, refracting light into dazzling patterns.',
    icon: '❄️',
    maxLevel: 10,
    baseBuildCost: 800,
    upgradeCostPerLevel: 130,
    category: 'bridge',
  },
  {
    id: 'dimensional_portal_bridge',
    name: 'Dimensional Portal Bridge',
    description: 'A bridge that folds space, connecting two points on the river regardless of the actual distance between them.',
    icon: '🌀',
    maxLevel: 10,
    baseBuildCost: 2000,
    upgradeCostPerLevel: 350,
    category: 'bridge',
  },

  // ── Shrines (5) ────────────────────────────────────────────────────
  {
    id: 'riverbank_altar',
    name: 'Riverbank Altar',
    description: 'A simple altar of smooth river stones where travelers can offer thanks to the river spirits.',
    icon: '⛩️',
    maxLevel: 10,
    baseBuildCost: 60,
    upgradeCostPerLevel: 22,
    category: 'shrine',
  },
  {
    id: 'water_spirit_shrine',
    name: 'Water Spirit Shrine',
    description: 'A shrine dedicated to the water spirits, surrounded by a perpetual mist of fine droplets.',
    icon: '💧',
    maxLevel: 10,
    baseBuildCost: 180,
    upgradeCostPerLevel: 55,
    category: 'shrine',
  },
  {
    id: 'elemental_sanctuary',
    name: 'Elemental Sanctuary',
    description: 'A sanctuary honoring all five rune schools, where elemental energy converges in perfect balance.',
    icon: '🔮',
    maxLevel: 10,
    baseBuildCost: 500,
    upgradeCostPerLevel: 90,
    category: 'shrine',
  },
  {
    id: 'ancient_temple_ruins',
    name: 'Ancient Temple Ruins',
    description: 'The ruins of a prehistoric temple that still emanates powerful spiritual energy from its crumbling walls.',
    icon: '🏚️',
    maxLevel: 10,
    baseBuildCost: 1100,
    upgradeCostPerLevel: 180,
    category: 'shrine',
  },
  {
    id: 'celestial_observatory',
    name: 'Celestial Observatory',
    description: 'An observatory atop the river cliffs that channels celestial energy into the waters below.',
    icon: '🔭',
    maxLevel: 10,
    baseBuildCost: 2800,
    upgradeCostPerLevel: 450,
    category: 'shrine',
  },

  // ── Misc (5) ───────────────────────────────────────────────────────
  {
    id: 'mana_distillery',
    name: 'Mana Distillery',
    description: 'Extracts and refines raw mana from river water, producing purified mana crystals for rune carving.',
    icon: '⚗️',
    maxLevel: 10,
    baseBuildCost: 100,
    upgradeCostPerLevel: 40,
    category: 'production',
  },
  {
    id: 'creature_pen',
    name: 'Creature Pen',
    description: 'A riverside enclosure for safely housing captured river creatures and studying their abilities.',
    icon: '🐄',
    maxLevel: 10,
    baseBuildCost: 150,
    upgradeCostPerLevel: 50,
    category: 'production',
  },
  {
    id: 'scroll_repository',
    name: 'Scroll Repository',
    description: 'A waterproof library carved into a river cliff, storing navigation charts and ancient river knowledge.',
    icon: '📚',
    maxLevel: 10,
    baseBuildCost: 300,
    upgradeCostPerLevel: 75,
    category: 'production',
  },
  {
    id: 'flow_energy_relay',
    name: 'Flow Energy Relay',
    description: 'A device that captures the kinetic energy of river currents and converts it into usable flow energy.',
    icon: '⚡',
    maxLevel: 10,
    baseBuildCost: 700,
    upgradeCostPerLevel: 120,
    category: 'production',
  },
  {
    id: 'dimensional_waypoint',
    name: 'Dimensional Waypoint',
    description: 'A beacon that marks a stable point in dimensional space, allowing instant travel between waypoints.',
    icon: '📡',
    maxLevel: 10,
    baseBuildCost: 1500,
    upgradeCostPerLevel: 250,
    category: 'production',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: ABILITIES — 22 rune/river abilities
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_ABILITIES: RRAbilityDef[] = [
  {
    id: 'river_sense',
    name: 'River Sense',
    description: 'Perceive the river\'s hidden currents and underlying dangers for a brief period.',
    cooldown: 30,
    power: 5,
    icon: '👁️',
    school: 'Water',
  },
  {
    id: 'flame_barrier',
    name: 'Flame Barrier',
    description: 'Conjure a wall of fire on the river surface that repels hostile creatures and obstacles.',
    cooldown: 45,
    power: 12,
    icon: '🔥',
    school: 'Fire',
  },
  {
    id: 'stone_bridge',
    name: 'Stone Bridge',
    description: 'Instantly raise a stone bridge from the riverbed to cross a gap or bypass a rapid.',
    cooldown: 60,
    power: 18,
    icon: '🪨',
    school: 'Earth',
  },
  {
    id: 'gale_push',
    name: 'Gale Push',
    description: 'Summon a powerful wind that propels your vessel forward at triple speed for a short burst.',
    cooldown: 25,
    power: 8,
    icon: '💨',
    school: 'Air',
  },
  {
    id: 'shadow_veil',
    name: 'Shadow Veil',
    description: 'Shroud yourself and your vessel in shadows, becoming invisible to all river creatures.',
    cooldown: 50,
    power: 15,
    icon: '🌑',
    school: 'Void',
  },
  {
    id: 'tidal_surge',
    name: 'Tidal Surge',
    description: 'Summon a massive wave that sweeps everything before it, clearing obstacles and creatures.',
    cooldown: 90,
    power: 35,
    icon: '🌊',
    school: 'Water',
  },
  {
    id: 'inferno_rain',
    name: 'Inferno Rain',
    description: 'Rains fire from above onto a section of river, evaporating water and destroying ice barriers.',
    cooldown: 75,
    power: 30,
    icon: '☔',
    school: 'Fire',
  },
  {
    id: 'earthquake_slam',
    name: 'Earthquake Slam',
    description: 'Strike the riverbed to create a localized earthquake, destabilizing nearby structures and creatures.',
    cooldown: 80,
    power: 32,
    icon: '💥',
    school: 'Earth',
  },
  {
    id: 'cyclone_summon',
    name: 'Cyclone Summon',
    description: 'Summon a waterspout that lifts obstacles from the river and deposits them on the banks.',
    cooldown: 70,
    power: 28,
    icon: '🌪️',
    school: 'Air',
  },
  {
    id: 'void_tear',
    name: 'Void Tear',
    description: 'Tear open a small rift in reality, allowing you to pass through obstacles or escape danger.',
    cooldown: 100,
    power: 45,
    icon: '✂️',
    school: 'Void',
  },
  {
    id: 'healing_spring',
    name: 'Healing Spring',
    description: 'Create a temporary spring of healing water that restores health and mana to all nearby allies.',
    cooldown: 120,
    power: 20,
    icon: '💚',
    school: 'Water',
  },
  {
    id: 'ember_shield',
    name: 'Ember Shield',
    description: 'Encase your vessel in a shield of swirling embers that burns anything that comes into contact.',
    cooldown: 55,
    power: 22,
    icon: '🛡️',
    school: 'Fire',
  },
  {
    id: 'root_cage',
    name: 'Root Cage',
    description: 'Summon massive roots from the riverbed to entangle and trap a creature or obstacle.',
    cooldown: 65,
    power: 25,
    icon: '🌿',
    school: 'Earth',
  },
  {
    id: 'feather_fall',
    name: 'Feather Fall',
    description: 'Call upon wind spirits to gently lower you and your vessel, preventing fall damage over waterfalls.',
    cooldown: 40,
    power: 10,
    icon: '🪶',
    school: 'Air',
  },
  {
    id: 'abyssal_gaze',
    name: 'Abyssal Gaze',
    description: 'Open your eyes to the void beneath the river, revealing hidden treasures and secret passages.',
    cooldown: 85,
    power: 40,
    icon: '👁️',
    school: 'Void',
  },
  {
    id: 'water_whisper',
    name: 'Water Whisper',
    description: 'Communicate with the river itself, learning the safest path and impending dangers.',
    cooldown: 20,
    power: 3,
    icon: '🗣️',
    school: 'Water',
  },
  {
    id: 'flame_surf',
    name: 'Flame Surf',
    description: 'Turn the river surface into a sheet of flame you can ride upon, greatly increasing speed.',
    cooldown: 60,
    power: 20,
    icon: '🏄',
    school: 'Fire',
  },
  {
    id: 'petrify_current',
    name: 'Petrify Current',
    description: 'Temporarily turn a section of flowing water to stone, creating a platform or dam.',
    cooldown: 70,
    power: 27,
    icon: '🗿',
    school: 'Earth',
  },
  {
    id: 'wind_compass',
    name: 'Wind Compass',
    description: 'A compass made of wind that always points toward your next objective, regardless of distance.',
    cooldown: 15,
    power: 2,
    icon: '🧭',
    school: 'Air',
  },
  {
    id: 'void_anchor',
    name: 'Void Anchor',
    description: 'Drop an anchor into the void, fixing your position in space-time and preventing displacement.',
    cooldown: 55,
    power: 18,
    icon: '⚓',
    school: 'Void',
  },
  {
    id: 'river_song',
    name: 'River Song',
    description: 'Sing the ancient song of the rivers, pacifying all hostile creatures within earshot.',
    cooldown: 110,
    power: 38,
    icon: '🎵',
    school: 'Water',
  },
  {
    id: 'oblivion_wave',
    name: 'Oblivion Wave',
    description: 'Release a wave of pure void energy that erases everything it touches from existence.',
    cooldown: 180,
    power: 80,
    icon: '🌊',
    school: 'Void',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: ACHIEVEMENTS — 18 achievements
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_ACHIEVEMENTS: RRAchievementDef[] = [
  {
    id: 'first_carving',
    name: 'First Carving',
    description: 'Carve your very first rune into a river stone.',
    icon: '✒️',
    conditionKey: 'totalCarved',
    targetValue: 1,
    reward: { type: 'gold', value: 25 },
  },
  {
    id: 'rune_apprentice_10',
    name: 'Ten Runes Carved',
    description: 'Carve ten runes to prove your dedication to the art.',
    icon: '📜',
    conditionKey: 'totalCarved',
    targetValue: 10,
    reward: { type: 'exp', value: 50 },
  },
  {
    id: 'rune_master_30',
    name: 'Master Carver',
    description: 'Carve thirty runes — a true master of the carving art.',
    icon: '🏆',
    conditionKey: 'totalCarved',
    targetValue: 30,
    reward: { type: 'exp', value: 200 },
  },
  {
    id: 'first_navigation',
    name: 'First Voyage',
    description: 'Navigate your first river successfully.',
    icon: '🚣',
    conditionKey: 'totalNavigated',
    targetValue: 1,
    reward: { type: 'gold', value: 30 },
  },
  {
    id: 'explorer_5_rivers',
    name: 'River Explorer',
    description: 'Successfully navigate five different rivers.',
    icon: '🗺️',
    conditionKey: 'totalNavigated',
    targetValue: 5,
    reward: { type: 'exp', value: 100 },
  },
  {
    id: 'all_rivers_complete',
    name: 'Conqueror of Rivers',
    description: 'Navigate and complete all eight mystical rivers.',
    icon: '👑',
    conditionKey: 'totalNavigated',
    targetValue: 8,
    reward: { type: 'exp', value: 500 },
  },
  {
    id: 'first_capture',
    name: 'First Capture',
    description: 'Capture your first river creature.',
    icon: '🦎',
    conditionKey: 'totalCaptured',
    targetValue: 1,
    reward: { type: 'gold', value: 20 },
  },
  {
    id: 'creature_collector_10',
    name: 'Creature Collector',
    description: 'Capture ten different river creatures.',
    icon: '🗂️',
    conditionKey: 'totalCaptured',
    targetValue: 10,
    reward: { type: 'exp', value: 75 },
  },
  {
    id: 'legendary_capture',
    name: 'Legendary Capture',
    description: 'Capture a legendary-tier river creature.',
    icon: '⭐',
    conditionKey: 'totalCaptured',
    targetValue: 1,
    reward: { type: 'gold', value: 500 },
  },
  {
    id: 'first_combo',
    name: 'Combination Discovery',
    description: 'Discover your first rune combination.',
    icon: '🔮',
    conditionKey: 'runeCombos',
    targetValue: 1,
    reward: { type: 'exp', value: 60 },
  },
  {
    id: 'combo_master_10',
    name: 'Combo Master',
    description: 'Discover ten different rune combinations.',
    icon: '✨',
    conditionKey: 'runeCombos',
    targetValue: 10,
    reward: { type: 'exp', value: 300 },
  },
  {
    id: 'all_combos',
    name: 'Grand Alchemist',
    description: 'Discover every rune combination in existence.',
    icon: '🧪',
    conditionKey: 'runeCombos',
    targetValue: 20,
    reward: { type: 'exp', value: 1000 },
  },
  {
    id: 'shrine_pilgrim_5',
    name: 'Shrine Pilgrim',
    description: 'Visit five different riverside shrines.',
    icon: '⛩️',
    conditionKey: 'shrinesVisited',
    targetValue: 5,
    reward: { type: 'gold', value: 100 },
  },
  {
    id: 'all_shrines',
    name: 'Sacred Pilgrimage',
    description: 'Visit and receive blessings from all fifteen shrines.',
    icon: '🙏',
    conditionKey: 'shrinesVisited',
    targetValue: 15,
    reward: { type: 'exp', value: 500 },
  },
  {
    id: 'structure_builder',
    name: 'Builder\'s Spirit',
    description: 'Build and upgrade your first riverside structure to level 5.',
    icon: '🏗️',
    conditionKey: 'maxStructureLevel',
    targetValue: 5,
    reward: { type: 'gold', value: 150 },
  },
  {
    id: 'structure_master',
    name: 'Master Architect',
    description: 'Build and fully upgrade a structure to maximum level 10.',
    icon: '🏰',
    conditionKey: 'maxStructureLevel',
    targetValue: 10,
    reward: { type: 'exp', value: 400 },
  },
  {
    id: 'flow_channeler',
    name: 'Flow Channeler',
    description: 'Accumulate 1000 flow energy from river magic.',
    icon: '⚡',
    conditionKey: 'flowEnergy',
    targetValue: 1000,
    reward: { type: 'gold', value: 300 },
  },
  {
    id: 'archmage_level',
    name: 'River Archmage',
    description: 'Reach the maximum river level and claim the title of River Archmage.',
    icon: '🌟',
    conditionKey: 'riverLevel',
    targetValue: 50,
    reward: { type: 'exp', value: 2000 },
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: TITLES — 8 progression titles
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_TITLES: RRTitleDef[] = [
  {
    id: 'rune_apprentice',
    name: 'Rune Apprentice',
    requiredLevel: 1,
    description: 'A beginner who has just begun to learn the ancient art of river rune carving.',
    color: '#9CA3AF',
  },
  {
    id: 'rune_carver',
    name: 'Rune Carver',
    requiredLevel: 5,
    description: 'An established carver whose runes have begun to affect the flow of local waters.',
    color: '#22C55E',
  },
  {
    id: 'river_navigator',
    name: 'River Navigator',
    requiredLevel: 10,
    description: 'A skilled navigator who has safely traversed multiple mystical rivers.',
    color: '#3B82F6',
  },
  {
    id: 'mana_harvester',
    name: 'Mana Harvester',
    requiredLevel: 18,
    description: 'An expert at extracting and refining mana crystals from river currents.',
    color: '#00FF7F',
  },
  {
    id: 'creature_whisperer',
    name: 'Creature Whisperer',
    requiredLevel: 25,
    description: 'A rare individual who can communicate with and tame river creatures of all types.',
    color: '#A855F7',
  },
  {
    id: 'rune_forge_master',
    name: 'Rune Forge Master',
    requiredLevel: 33,
    description: 'A master of rune combination, capable of forging entirely new runes from existing ones.',
    color: '#F59E0B',
  },
  {
    id: 'river_sovereign',
    name: 'River Sovereign',
    requiredLevel: 42,
    description: 'A ruler of rivers whose word shapes the currents and whose runes command all water.',
    color: '#EF4444',
  },
  {
    id: 'river_archmage',
    name: 'River Archmage',
    requiredLevel: 50,
    description: 'The supreme master of all river magic — the only being who can navigate the Void Channel unaided.',
    color: '#FFD700',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: RUNE COMBINATIONS — 20 recipes
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_RUNE_COMBOS: RRRuneComboDef[] = [
  {
    id: 'steam_veil',
    name: 'Steam Veil',
    description: 'Combining a Fire rune with a Water rune creates a concealing veil of dense steam along the river.',
    requiredRunes: ['inferno_mark', 'droplet_sigil'],
    resultingPower: 22,
    icon: '♨️',
  },
  {
    id: 'lava_flow',
    name: 'Lava Flow',
    description: 'A devastating combination that turns river water into molten lava, destroying barriers and terrifying creatures.',
    requiredRunes: ['ember_spiral', 'stone_scratch'],
    resultingPower: 35,
    icon: '🌋',
  },
  {
    id: 'mist_walker',
    name: 'Mist Walker',
    description: 'Water and Air runes merge to create a permanent mist that grants invisibility to those within.',
    requiredRunes: ['tide_weaver', 'breeze_stroke'],
    resultingPower: 25,
    icon: '🌫️',
  },
  {
    id: 'quake_boil',
    name: 'Quake Boil',
    description: 'Earth and Fire combine to superheat the riverbed, causing violent eruptions of steam and stone.',
    requiredRunes: ['root_bind', 'sun_forge_seal'],
    resultingPower: 45,
    icon: '💥',
  },
  {
    id: 'void_storm',
    name: 'Void Storm',
    description: 'A terrifying fusion of Void and Air that creates a storm of anti-matter, shredding everything in its path.',
    requiredRunes: ['shadow_flicker', 'gale_spiral'],
    resultingPower: 34,
    icon: '🌪️',
  },
  {
    id: 'crystal_ice',
    name: 'Crystal Ice',
    description: 'Water and Earth form perfect crystal ice structures that can be shaped into bridges, weapons, or shelters.',
    requiredRunes: ['frost_fang', 'crystal_spine'],
    resultingPower: 53,
    icon: '❄️',
  },
  {
    id: 'phoenix_storm',
    name: 'Phoenix Storm',
    description: 'The legendary combination of Fire and Air that summons a phoenix made of fire and lightning.',
    requiredRunes: ['phoenix_crest', 'storm_caller'],
    resultingPower: 65,
    icon: '🔥',
  },
  {
    id: 'abyssal_earth',
    name: 'Abyssal Earth',
    description: 'Void and Earth fuse to create stone that exists between dimensions — indestructible and impossible to detect.',
    requiredRunes: ['void_stitch', 'petrified_wake'],
    resultingPower: 66,
    icon: '🕳️',
  },
  {
    id: 'monsoon_wrath_combo',
    name: 'Monsoon Wrath',
    description: 'Water and Water at their most powerful — a combination that summons a continent-spanning mega-storm.',
    requiredRunes: ['whispering_flood', 'monsoon_wrath'],
    resultingPower: 90,
    icon: '⛈️',
  },
  {
    id: 'magma_heart_combo',
    name: 'Core Magma',
    description: 'Fire and Earth reach their ultimate expression, tapping into the planet\'s molten heart.',
    requiredRunes: ['magma_heart', 'continental_press'],
    resultingPower: 109,
    icon: '🌋',
  },
  {
    id: 'zephyr_void',
    name: 'Zephyr Void',
    description: 'Air and Void combine to create wind that blows through dimensional gaps, carrying messages across worlds.',
    requiredRunes: ['zephyr_mantle', 'null_current'],
    resultingPower: 64,
    icon: '🌬️',
  },
  {
    id: 'frost_fire_paradox',
    name: 'Frost-Fire Paradox',
    description: 'A paradoxical combination of Fire and Water that creates flames that freeze and ice that burns.',
    requiredRunes: ['blaze_sovereign', 'abyssal_crown'],
    resultingPower: 140,
    icon: '🔶',
  },
  {
    id: 'world_root_void',
    name: 'World Root Void',
    description: 'Earth and Void entwine to create roots that grow into the space between worlds, anchoring reality itself.',
    requiredRunes: ['world_root_scepter', 'entropy_spine'],
    resultingPower: 126,
    icon: '🌳',
  },
  {
    id: 'aether_storm',
    name: 'Aether Storm',
    description: 'Air at its most powerful — a storm that spans the upper atmosphere and reshapes weather patterns permanently.',
    requiredRunes: ['cyclone_eye', 'aether_sovereign'],
    resultingPower: 116,
    icon: '🌀',
  },
  {
    id: 'oblivion_river',
    name: 'Oblivion River',
    description: 'The most dangerous Void combination — it can unmake entire rivers or create new ones from nothing.',
    requiredRunes: ['abyss_gaze', 'oblivion_crest'],
    resultingPower: 116,
    icon: '🏴',
  },
  {
    id: 'fire_stone_gale',
    name: 'Fire-Stone Gale',
    description: 'A triple-element combo of Fire, Earth, and Air that creates a devastating storm of burning rocks.',
    requiredRunes: ['ember_spiral', 'crystal_spine', 'storm_caller'],
    resultingPower: 70,
    icon: '☄️',
  },
  {
    id: 'void_water_earth',
    name: 'Tri-Element Maw',
    description: 'A three-element fusion of Void, Water, and Earth that creates a bottomless whirlpool of dissolution.',
    requiredRunes: ['null_current', 'frost_fang', 'stone_scratch'],
    resultingPower: 58,
    icon: '🌊',
  },
  {
    id: 'elemental_convergence',
    name: 'Elemental Convergence',
    description: 'All five schools align in perfect harmony, creating a moment of absolute elemental balance.',
    requiredRunes: ['inferno_mark', 'droplet_sigil', 'stone_scratch', 'breeze_stroke', 'shadow_flicker'],
    resultingPower: 200,
    icon: '☯️',
  },
  {
    id: 'dual_heart_fire_water',
    name: 'Twin Hearts',
    description: 'The core of Fire meets the core of Water — two opposing forces that find equilibrium in their union.',
    requiredRunes: ['magma_heart', 'abyssal_crown'],
    resultingPower: 123,
    icon: '💜',
  },
  {
    id: 'sovereign_convergence',
    name: 'Sovereign Convergence',
    description: 'The ultimate combination — all five supreme runes fuse into a single rune of godlike power.',
    requiredRunes: ['blaze_sovereign', 'abyssal_crown', 'world_root_scepter', 'aether_sovereign', 'oblivion_crest'],
    resultingPower: 380,
    icon: '👑',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: NAVIGATION CHARTS — 10 charts
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_NAVIGATION_CHARTS: RRNavigationChartDef[] = [
  {
    id: 'basic_waterways_map',
    name: 'Basic Waterways Map',
    description: 'A simple hand-drawn map showing the mouths and general direction of the major rivers.',
    unlockLevel: 1,
    reveals: ['whispering_brook', 'crystal_stream'],
    icon: '🗺️',
  },
  {
    id: 'flame_current_chart',
    name: 'Flame Current Chart',
    description: 'A heat-resistant chart that maps the thermal currents and safe channels of the River of Flame.',
    unlockLevel: 5,
    reveals: ['river_of_flame'],
    icon: '🔥',
  },
  {
    id: 'frost_navigation_guide',
    name: 'Frost Navigation Guide',
    description: 'A guide for navigating the treacherous ice fields of the Aurora Flow, including aurora timing.',
    unlockLevel: 10,
    reveals: ['aurora_flow'],
    icon: '❄️',
  },
  {
    id: 'petrified_passages',
    name: 'Petrified Passages',
    description: 'Charts the narrow water veins still flowing through the vast stone expanse of the Petrified River.',
    unlockLevel: 14,
    reveals: ['petrified_river'],
    icon: '🪨',
  },
  {
    id: 'spirit_tide_almanac',
    name: 'Spirit Tide Almanac',
    description: 'An almanac that predicts when the Spirit Tide flows uphill and when ghostly vessels appear.',
    unlockLevel: 18,
    reveals: ['spirit_tide'],
    icon: '👻',
  },
  {
    id: 'abyssal_depths_sonar',
    name: 'Abyssal Depths Sonar',
    description: 'Sonar readings that map the deep trenches and bioluminescent zones of the Abyss Current.',
    unlockLevel: 25,
    reveals: ['abyss_current'],
    icon: '📡',
  },
  {
    id: 'shrine_pilgrimage_route',
    name: 'Shrine Pilgrimage Route',
    description: 'A sacred route connecting all riverside shrines, blessed by the river spirits themselves.',
    unlockLevel: 20,
    reveals: [],
    icon: '⛩️',
  },
  {
    id: 'creature_migration_atlas',
    name: 'Creature Migration Atlas',
    description: 'Tracks the seasonal migration patterns of rare river creatures across all eight rivers.',
    unlockLevel: 30,
    reveals: [],
    icon: '🦎',
  },
  {
    id: 'mana_crystal_deposits',
    name: 'Mana Crystal Deposits',
    description: 'A geological survey showing the richest mana crystal deposits along every riverbank.',
    unlockLevel: 35,
    reveals: [],
    icon: '💎',
  },
  {
    id: 'void_channel_star_chart',
    name: 'Void Channel Star Chart',
    description: 'The only known chart that maps the Void Channel — it shifts constantly and requires continuous updates.',
    unlockLevel: 42,
    reveals: ['void_channel'],
    icon: '🌌',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 13: SHRINES — 15 riverside shrines
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_SHRINES: RRShrineDef[] = [
  {
    id: 'shrine_of_first_waters',
    name: 'Shrine of First Waters',
    description: 'The oldest shrine, built at the source of the Whispering Brook where the first drop of river water fell from the sky.',
    blessing: '+10% water rune power for 1 hour',
    offerings: ['droplet_sigil', 'river_stone'],
    icon: '💧',
  },
  {
    id: 'ember_sanctum',
    name: 'Ember Sanctum',
    description: 'A shrine carved into volcanic rock beside the River of Flame, eternally warmed by geothermal springs.',
    blessing: '+10% fire rune power for 1 hour',
    offerings: ['spark_crystal', 'ember_salamander_scale'],
    icon: '🔥',
  },
  {
    id: 'crystal_echo_shrine',
    name: 'Crystal Echo Shrine',
    description: 'A shrine made of living crystal that amplifies and returns any sound made within its walls.',
    blessing: '+10% earth rune power for 1 hour',
    offerings: ['crystal_shard', 'moss_stone'],
    icon: '💎',
  },
  {
    id: 'windward_altar',
    name: 'Windward Altar',
    description: 'An open-air altar perched on a cliff above the Whispering Brook, always surrounded by swirling winds.',
    blessing: '+10% air rune power for 1 hour',
    offerings: ['wind_gem', 'gale_feather'],
    icon: '🌬️',
  },
  {
    id: 'void_watchtower',
    name: 'Void Watchtower',
    description: 'A crumbling tower at the edge of the Abyss Current where the void is closest to our reality.',
    blessing: '+10% void rune power for 1 hour',
    offerings: ['shadow_opal', 'void_pearl'],
    icon: '🕳️',
  },
  {
    id: 'aurora_meditation_grotto',
    name: 'Aurora Meditation Grotto',
    description: 'A natural grotto beneath the Aurora Flow where the northern lights are reflected perfectly in still pools.',
    blessing: '+20% experience gain for 1 hour',
    offerings: ['aurora_essence', 'frost_blossom'],
    icon: '🌈',
  },
  {
    id: 'petrified_sage_shrine',
    name: 'Petrified Sage Shrine',
    description: 'A shrine surrounding the petrified remains of an ancient sage who meditated for so long they became stone.',
    blessing: '+15% structure upgrade efficiency for 1 hour',
    offerings: ['petrified_wood', 'stone_spirit_essence'],
    icon: '🗿',
  },
  {
    id: 'spirit_ferry_crossing',
    name: 'Spirit Ferry Crossing',
    description: 'A shrine at the only point where the Spirit Tide can be safely crossed by the living.',
    blessing: 'Safe passage on Spirit Tide for 1 hour',
    offerings: ['spirit_cloth', 'spectral_compass'],
    icon: '👻',
  },
  {
    id: 'mana_well_shrine',
    name: 'Mana Well Shrine',
    description: 'A shrine built around a natural well of pure liquid mana that bubbles up from deep underground.',
    blessing: '+25% mana regeneration for 1 hour',
    offerings: ['any_mana_crystal'],
    icon: '⚗️',
  },
  {
    id: 'confluence_sanctuary',
    name: 'Confluence Sanctuary',
    description: 'A great sanctuary at the point where the Whispering Brook and Crystal Stream merge into one river.',
    blessing: '+5% power to all rune schools for 1 hour',
    offerings: ['droplet_sigil', 'crystal_shard'],
    icon: '☯️',
  },
  {
    id: 'dragon_bone_shrine',
    name: 'Dragon Bone Shrine',
    description: 'A shrine constructed from the fossilized bones of a river dragon, radiating ancient power.',
    blessing: '+30% creature capture success for 1 hour',
    offerings: ['dragon_scale', 'leviathan_bone'],
    icon: '🐉',
  },
  {
    id: 'flood_queen_altar',
    name: 'Flood Queen Altar',
    description: 'An altar dedicated to the mythical Flood Queen who once drowned the world to cleanse it.',
    blessing: 'Water abilities cost 50% less mana for 1 hour',
    offerings: ['tidal_sapphire', 'primordial_water'],
    icon: '👸',
  },
  {
    id: 'starlit_shore_shrine',
    name: 'Starlit Shore Shrine',
    description: 'A shrine on a beach that only appears at midnight under a cloudless sky, illuminated by starlight.',
    blessing: '+20% gold earned from river navigation for 1 hour',
    offerings: ['star_fragment', 'moonstone'],
    icon: '⭐',
  },
  {
    id: 'abyss_gate_shrine',
    name: 'Abyss Gate Shrine',
    description: 'The final shrine, located at the very entrance to the Void Channel. Only the worthy may approach.',
    blessing: '+20% void resistance for 1 hour',
    offerings: ['void_pearl', 'entropy_orb'],
    icon: '🚪',
  },
  {
    id: 'harmony_grove_shrine',
    name: 'Harmony Grove Shrine',
    description: 'A hidden shrine within a riverside grove where all five elemental energies exist in perfect balance.',
    blessing: '+10% all stats for 1 hour',
    offerings: ['one_of_each_element'],
    icon: '🌿',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 14: UTILITY CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const RR_MAX_LEVEL = 50
export const RR_BASE_XP = 80
export const RR_XP_GROWTH = 1.16
export const RR_BASE_GOLD = 10
export const RR_GOLD_PER_LEVEL = 5
export const RR_MANA_REGEN_RATE = 2
export const RR_FLOW_ENERGY_PER_NAVIGATE = 25
export const RR_SAVE_KEY = 'ws_rune_river_wire'

// XP table (cumulative)
export const RR_XP_TABLE: number[] = (() => {
  const table: number[] = [0]
  for (let i = 1; i <= RR_MAX_LEVEL; i++) {
    const previous = table[i - 1]
    table.push(Math.floor(previous + RR_BASE_XP * Math.pow(RR_XP_GROWTH, i - 1)))
  }
  return table
})()

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 15: INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function rrGenerateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function rrCalculateLevel(xp: number): number {
  for (let i = RR_MAX_LEVEL; i >= 1; i--) {
    if (xp >= RR_XP_TABLE[i]) return i
  }
  return 1
}

function rrGetXpToNext(level: number): number {
  if (level >= RR_MAX_LEVEL) return 0
  return RR_XP_TABLE[level + 1] - RR_XP_TABLE[level]
}

function rrCreateDefaultShrineState(): Record<string, RRShrineInstance> {
  const result: Record<string, RRShrineInstance> = {}
  for (const shrine of RR_SHRINES) {
    result[shrine.id] = {
      shrineId: shrine.id,
      visited: false,
      lastVisitAt: null,
      offeringCount: 0,
      blessingActive: false,
    }
  }
  return result
}

function rrCreateDefaultState(): RRState {
  return {
    carvedRunes: [],
    riverProgress: [],
    manaCrystals: {},
    creatures: [],
    structures: [],
    runeCombos: [],
    charts: [],
    shrines: rrCreateDefaultShrineState(),
    riverLevel: 1,
    riverExp: 0,
    gold: 0,
    mana: 50,
    currentRiver: null,
    achievements: [],
    currentTitle: 'rune_apprentice',
    totalCarved: 0,
    totalNavigated: 0,
    totalCaptured: 0,
    flowEnergy: 0,
  }
}

function rrCheckAchievements(state: RRState): string[] {
  const newlyUnlocked: string[] = []
  for (const ach of RR_ACHIEVEMENTS) {
    if (state.achievements.includes(ach.id)) continue
    let met = false
    if (ach.conditionKey === 'totalCarved' && state.totalCarved >= ach.targetValue) met = true
    if (ach.conditionKey === 'totalNavigated' && state.totalNavigated >= ach.targetValue) met = true
    if (ach.conditionKey === 'totalCaptured' && state.totalCaptured >= ach.targetValue) met = true
    if (ach.conditionKey === 'runeCombos' && state.runeCombos.length >= ach.targetValue) met = true
    if (ach.conditionKey === 'flowEnergy' && state.flowEnergy >= ach.targetValue) met = true
    if (ach.conditionKey === 'riverLevel' && state.riverLevel >= ach.targetValue) met = true
    if (ach.conditionKey === 'shrinesVisited') {
      const visitedCount = Object.values(state.shrines).filter(s => s.visited).length
      if (visitedCount >= ach.targetValue) met = true
    }
    if (ach.conditionKey === 'maxStructureLevel') {
      const maxLevel = state.structures.reduce((max, s) => Math.max(max, s.level), 0)
      if (maxLevel >= ach.targetValue) met = true
    }
    if (met) newlyUnlocked.push(ach.id)
  }
  return newlyUnlocked
}

function rrGrantRewards(state: RRState, achievementIds: string[]): Partial<RRState> {
  let bonusGold = 0
  let bonusExp = 0
  for (const achId of achievementIds) {
    const ach = RR_ACHIEVEMENTS.find(a => a.id === achId)
    if (!ach) continue
    if (ach.reward.type === 'gold') bonusGold += ach.reward.value
    if (ach.reward.type === 'exp') bonusExp += ach.reward.value
  }
  const newExp = state.riverExp + bonusExp
  const newLevel = rrCalculateLevel(newExp)
  return {
    achievements: [...state.achievements, ...achievementIds],
    gold: state.gold + bonusGold,
    riverExp: newExp,
    riverLevel: newLevel,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════════════════

interface RRActions {
  rrCarveRune: (runeId: string) => void
  rrActivateRune: (carvedRuneId: string) => void
  rrCombineRunes: (runeAId: string, runeBId: string) => void
  rrDiscoveredCombo: (comboId: string) => void
  rrNavigateRiver: (riverId: string) => void
  rrSetCamp: (riverId: string) => void
  rrHarvestMana: (crystalId: string) => void
  rrRefineMana: (crystalId: string) => void
  rrCaptureCreature: (creatureId: string) => void
  rrReleaseCreature: (instanceId: string) => void
  rrBuildStructure: (structDefId: string) => void
  rrUpgradeStructure: (instanceId: string) => void
  rrVisitShrine: (shrineId: string) => void
  rrMakeOffering: (shrineId: string, offeringId: string) => void
  rrBuyChart: (chartId: string) => void
  rrReadChart: (chartId: string) => void
  rrUnlockTitle: (titleId: string) => void
  rrClaimAchievement: (achievementId: string) => void
  rrChannelFlow: (riverId: string) => void
  rrPurifyWater: (riverId: string) => void
}

type RRStore = RRState & RRActions

const useRuneRiverStore = create<RRStore>()(
  persist(
    (set, get) => ({
      ...rrCreateDefaultState(),

      rrCarveRune: (runeId: string) => {
        const runeDef = RR_RUNES.find(r => r.id === runeId)
        if (!runeDef) return
        const state = get()
        if (state.mana < runeDef.manaCost) return
        const instance: RRCarvedRuneInstance = {
          instanceId: rrGenerateId('cr'),
          runeId,
          activated: false,
          carvedAt: Date.now(),
        }
        const newCarved = [...state.carvedRunes, instance]
        const newTotalCarved = state.totalCarved + 1
        const expGain = runeDef.power * 2
        const newExp = state.riverExp + expGain
        const newLevel = rrCalculateLevel(newExp)
        const newState: Partial<RRState> = {
          carvedRunes: newCarved,
          totalCarved: newTotalCarved,
          mana: state.mana - runeDef.manaCost,
          riverExp: newExp,
          riverLevel: newLevel,
        }
        const checkState: RRState = { ...state, ...newState }
        const newAchievements = rrCheckAchievements(checkState)
        if (newAchievements.length > 0) {
          const rewardState = rrGrantRewards(checkState, newAchievements)
          set({ ...newState, ...rewardState })
        } else {
          set(newState)
        }
      },

      rrActivateRune: (carvedRuneId: string) => {
        set(state => ({
          carvedRunes: state.carvedRunes.map(r =>
            r.instanceId === carvedRuneId ? { ...r, activated: true } : r
          ),
        }))
      },

      rrCombineRunes: (runeAId: string, runeBId: string) => {
        const state = get()
        const hasRuneA = state.carvedRunes.some(r => r.runeId === runeAId && r.activated)
        const hasRuneB = state.carvedRunes.some(r => r.runeId === runeBId && r.activated)
        if (!hasRuneA || !hasRuneB) return
        const combo = RR_RUNE_COMBOS.find(c => {
          const a = c.requiredRunes.includes(runeAId)
          const b = c.requiredRunes.includes(runeBId)
          return a && b && c.requiredRunes.length === 2
        })
        if (!combo) return
        if (state.runeCombos.includes(combo.id)) return
        const expGain = combo.resultingPower
        const newExp = state.riverExp + expGain
        const newLevel = rrCalculateLevel(newExp)
        const newCombos = [...state.runeCombos, combo.id]
        const newState: Partial<RRState> = {
          runeCombos: newCombos,
          riverExp: newExp,
          riverLevel: newLevel,
        }
        const checkState: RRState = { ...state, ...newState }
        const newAchievements = rrCheckAchievements(checkState)
        if (newAchievements.length > 0) {
          const rewardState = rrGrantRewards(checkState, newAchievements)
          set({ ...newState, ...rewardState })
        } else {
          set(newState)
        }
      },

      rrDiscoveredCombo: (comboId: string) => {
        const state = get()
        if (state.runeCombos.includes(comboId)) return
        const combo = RR_RUNE_COMBOS.find(c => c.id === comboId)
        if (!combo) return
        const expGain = combo.resultingPower
        const newExp = state.riverExp + expGain
        const newLevel = rrCalculateLevel(newExp)
        const newState: Partial<RRState> = {
          runeCombos: [...state.runeCombos, comboId],
          riverExp: newExp,
          riverLevel: newLevel,
        }
        const checkState: RRState = { ...state, ...newState }
        const newAchievements = rrCheckAchievements(checkState)
        if (newAchievements.length > 0) {
          const rewardState = rrGrantRewards(checkState, newAchievements)
          set({ ...newState, ...rewardState })
        } else {
          set(newState)
        }
      },

      rrNavigateRiver: (riverId: string) => {
        const riverDef = RR_RIVERS.find(r => r.id === riverId)
        if (!riverDef) return
        set(state => {
          const existing = state.riverProgress.find(p => p.riverId === riverId)
          const newProgress = existing
            ? state.riverProgress.map(p =>
                p.riverId === riverId
                  ? { ...p, distanceTraveled: Math.min(p.distanceTraveled + 20, riverDef.length) }
                  : p
              )
            : [
                ...state.riverProgress,
                {
                  riverId,
                  distanceTraveled: 20,
                  campsSet: 0,
                  firstVisitAt: Date.now(),
                  completed: false,
                },
              ]
          const goldReward = Math.floor(riverDef.dangerLevel * 10 + Math.random() * 20)
          const expGain = riverDef.dangerLevel * 15 + riverDef.length / 20
          const newExp = state.riverExp + Math.floor(expGain)
          const newLevel = rrCalculateLevel(newExp)
          const newFlow = state.flowEnergy + RR_FLOW_ENERGY_PER_NAVIGATE
          const newTotalNav = state.totalNavigated + 1
          const newState: RRState = {
            ...state,
            riverProgress: newProgress,
            currentRiver: riverId,
            gold: state.gold + goldReward,
            riverExp: newExp,
            riverLevel: newLevel,
            flowEnergy: newFlow,
            totalNavigated: newTotalNav,
          }
          const newAchievements = rrCheckAchievements(newState)
          if (newAchievements.length > 0) {
            const rewardState = rrGrantRewards(newState, newAchievements)
            return { ...newState, ...rewardState }
          }
          return newState
        })
      },

      rrSetCamp: (riverId: string) => {
        set(state => ({
          riverProgress: state.riverProgress.map(p =>
            p.riverId === riverId ? { ...p, campsSet: p.campsSet + 1 } : p
          ),
          mana: Math.min(state.mana + 30, 200),
        }))
      },

      rrHarvestMana: (crystalId: string) => {
        const crystalDef = RR_MANA_TYPES.find(c => c.id === crystalId)
        if (!crystalDef) return
        set(state => {
          const current = state.manaCrystals[crystalId] ?? 0
          const manaGain = Math.floor(crystalDef.purity * 1.5)
          return {
            manaCrystals: { ...state.manaCrystals, [crystalId]: current + 1 },
            mana: Math.min(state.mana + manaGain, 200),
          }
        })
      },

      rrRefineMana: (crystalId: string) => {
        set(state => {
          const current = state.manaCrystals[crystalId] ?? 0
          if (current < 3) return state
          const crystalDef = RR_MANA_TYPES.find(c => c.id === crystalId)
          if (!crystalDef) return state
          const manaGain = Math.floor(crystalDef.purity * 5)
          return {
            manaCrystals: { ...state.manaCrystals, [crystalId]: current - 3 },
            mana: Math.min(state.mana + manaGain, 200),
            gold: state.gold + Math.floor(crystalDef.purity / 2),
          }
        })
      },

      rrCaptureCreature: (creatureId: string) => {
        const creatureDef = RR_CREATURES.find(c => c.id === creatureId)
        if (!creatureDef) return
        set(state => {
          if (state.gold < creatureDef.captureDifficulty * 10) return state
          const instance: RRCreatureInstance = {
            instanceId: rrGenerateId('cc'),
            creatureId,
            capturedAt: Date.now(),
            nickname: '',
          }
          const expGain = creatureDef.captureDifficulty * 20
          const newExp = state.riverExp + expGain
          const newLevel = rrCalculateLevel(newExp)
          const newState: RRState = {
            ...state,
            creatures: [...state.creatures, instance],
            totalCaptured: state.totalCaptured + 1,
            gold: state.gold - creatureDef.captureDifficulty * 10,
            riverExp: newExp,
            riverLevel: newLevel,
          }
          const newAchievements = rrCheckAchievements(newState)
          if (newAchievements.length > 0) {
            const rewardState = rrGrantRewards(newState, newAchievements)
            return { ...newState, ...rewardState }
          }
          return newState
        })
      },

      rrReleaseCreature: (instanceId: string) => {
        set(state => ({
          creatures: state.creatures.filter(c => c.instanceId !== instanceId),
        }))
      },

      rrBuildStructure: (structDefId: string) => {
        const structDef = RR_STRUCTURES.find(s => s.id === structDefId)
        if (!structDef) return
        set(state => {
          if (state.gold < structDef.baseBuildCost) return state
          const instance: RRStructureInstance = {
            instanceId: rrGenerateId('st'),
            structureDefId: structDefId,
            level: 1,
            builtAt: Date.now(),
          }
          return {
            structures: [...state.structures, instance],
            gold: state.gold - structDef.baseBuildCost,
          }
        })
      },

      rrUpgradeStructure: (instanceId: string) => {
        set(state => {
          const instance = state.structures.find(s => s.instanceId === instanceId)
          if (!instance) return state
          const structDef = RR_STRUCTURES.find(s => s.id === instance.structureDefId)
          if (!structDef) return state
          if (instance.level >= structDef.maxLevel) return state
          const upgradeCost = structDef.upgradeCostPerLevel * instance.level
          if (state.gold < upgradeCost) return state
          const expGain = instance.level * 15
          const newExp = state.riverExp + expGain
          const newLevel = rrCalculateLevel(newExp)
          const newState: RRState = {
            ...state,
            structures: state.structures.map(s =>
              s.instanceId === instanceId ? { ...s, level: s.level + 1 } : s
            ),
            gold: state.gold - upgradeCost,
            riverExp: newExp,
            riverLevel: newLevel,
          }
          const newAchievements = rrCheckAchievements(newState)
          if (newAchievements.length > 0) {
            const rewardState = rrGrantRewards(newState, newAchievements)
            return { ...newState, ...rewardState }
          }
          return newState
        })
      },

      rrVisitShrine: (shrineId: string) => {
        const shrineDef = RR_SHRINES.find(s => s.id === shrineId)
        if (!shrineDef) return
        set(state => {
          const current = state.shrines[shrineId]
          if (!current) return state
          const updated: RRShrineInstance = {
            ...current,
            visited: true,
            lastVisitAt: Date.now(),
            blessingActive: true,
          }
          const newShrines = { ...state.shrines, [shrineId]: updated }
          const expGain = 40
          const newExp = state.riverExp + expGain
          const newLevel = rrCalculateLevel(newExp)
          const newState: RRState = {
            ...state,
            shrines: newShrines,
            riverExp: newExp,
            riverLevel: newLevel,
          }
          const newAchievements = rrCheckAchievements(newState)
          if (newAchievements.length > 0) {
            const rewardState = rrGrantRewards(newState, newAchievements)
            return { ...newState, ...rewardState }
          }
          return newState
        })
      },

      rrMakeOffering: (shrineId: string, _offeringId: string) => {
        set(state => {
          const current = state.shrines[shrineId]
          if (!current || !current.visited) return state
          const shrineDef = RR_SHRINES.find(s => s.id === shrineId)
          if (!shrineDef) return state
          if (state.mana < 20) return state
          const updated: RRShrineInstance = {
            ...current,
            offeringCount: current.offeringCount + 1,
            blessingActive: true,
          }
          return {
            shrines: { ...state.shrines, [shrineId]: updated },
            mana: state.mana - 20,
          }
        })
      },

      rrBuyChart: (chartId: string) => {
        const chartDef = RR_NAVIGATION_CHARTS.find(c => c.id === chartId)
        if (!chartDef) return
        set(state => {
          if (state.charts.includes(chartId)) return state
          const cost = chartDef.unlockLevel * 20
          if (state.gold < cost) return state
          return {
            charts: [...state.charts, chartId],
            gold: state.gold - cost,
          }
        })
      },

      rrReadChart: (chartId: string) => {
        const state = get()
        if (!state.charts.includes(chartId)) return
        const chartDef = RR_NAVIGATION_CHARTS.find(c => c.id === chartId)
        if (!chartDef) return
        const expGain = chartDef.unlockLevel * 5
        const newExp = state.riverExp + expGain
        const newLevel = rrCalculateLevel(newExp)
        set({ riverExp: newExp, riverLevel: newLevel })
      },

      rrUnlockTitle: (titleId: string) => {
        const titleDef = RR_TITLES.find(t => t.id === titleId)
        if (!titleDef) return
        set(state => {
          if (state.riverLevel < titleDef.requiredLevel) return state
          return { currentTitle: titleId }
        })
      },

      rrClaimAchievement: (achievementId: string) => {
        const state = get()
        if (state.achievements.includes(achievementId)) return
        const ach = RR_ACHIEVEMENTS.find(a => a.id === achievementId)
        if (!ach) return
        let bonusGold = 0
        let bonusExp = 0
        if (ach.reward.type === 'gold') bonusGold = ach.reward.value
        if (ach.reward.type === 'exp') bonusExp = ach.reward.value
        const newExp = state.riverExp + bonusExp
        const newLevel = rrCalculateLevel(newExp)
        set({
          achievements: [...state.achievements, achievementId],
          gold: state.gold + bonusGold,
          riverExp: newExp,
          riverLevel: newLevel,
        })
      },

      rrChannelFlow: (riverId: string) => {
        const riverDef = RR_RIVERS.find(r => r.id === riverId)
        if (!riverDef) return
        set(state => {
          const flowGain = riverDef.dangerLevel * 15
          const manaGain = riverDef.dangerLevel * 5
          return {
            flowEnergy: state.flowEnergy + flowGain,
            mana: Math.min(state.mana + manaGain, 200),
          }
        })
      },

      rrPurifyWater: (riverId: string) => {
        set(state => {
          const progress = state.riverProgress.find(p => p.riverId === riverId)
          if (!progress) return state
          if (state.mana < 30) return state
          const expGain = 25
          const newExp = state.riverExp + expGain
          const newLevel = rrCalculateLevel(newExp)
          return {
            mana: state.mana - 30,
            riverExp: newExp,
            riverLevel: newLevel,
          }
        })
      },
    }),
    {
      name: RR_SAVE_KEY,
      version: 1,
      partialize: (state) => {
        const {
          rrCarveRune, rrActivateRune, rrCombineRunes, rrDiscoveredCombo,
          rrNavigateRiver, rrSetCamp, rrHarvestMana, rrRefineMana,
          rrCaptureCreature, rrReleaseCreature, rrBuildStructure,
          rrUpgradeStructure, rrVisitShrine, rrMakeOffering,
          rrBuyChart, rrReadChart, rrUnlockTitle, rrClaimAchievement,
          rrChannelFlow, rrPurifyWater,
          ...rest
        } = state
        return rest as RRState
      },
    }
  )
)

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export default function useRuneRiver() {
  const state = useRuneRiverStore()

  // ── Getters (useMemo) ─────────────────────────────────────────────

  const rrGetCarvedRunes = useMemo(() => {
    return state.carvedRunes.map(inst => {
      const def = RR_RUNES.find(r => r.id === inst.runeId)
      return { ...inst, runeDef: def ?? null }
    })
  }, [state.carvedRunes])

  const rrGetRiverProgress = useMemo(() => {
    return state.riverProgress.map(prog => {
      const def = RR_RIVERS.find(r => r.id === prog.riverId)
      return { ...prog, riverDef: def ?? null }
    })
  }, [state.riverProgress])

  const rrGetManaInventory = useMemo(() => {
    return Object.entries(state.manaCrystals)
      .filter(([, count]) => count > 0)
      .map(([crystalId, count]) => {
        const def = RR_MANA_TYPES.find(c => c.id === crystalId)
        return { crystalId, count, crystalDef: def ?? null }
      })
      .sort((a, b) => (b.count) - (a.count))
  }, [state.manaCrystals])

  const rrGetAvailableCombos = useMemo(() => {
    const activatedRuneIds = new Set(
      state.carvedRunes.filter(r => r.activated).map(r => r.runeId)
    )
    return RR_RUNE_COMBOS.filter(combo => {
      if (state.runeCombos.includes(combo.id)) return false
      return combo.requiredRunes.every(runeId => activatedRuneIds.has(runeId))
    })
  }, [state.carvedRunes, state.runeCombos])

  const rrGetDiscoveredCombos = useMemo(() => {
    return state.runeCombos.map(id => RR_RUNE_COMBOS.find(c => c.id === id)).filter(Boolean)
  }, [state.runeCombos])

  const rrGetCapturedCreatures = useMemo(() => {
    return state.creatures.map(inst => {
      const def = RR_CREATURES.find(c => c.id === inst.creatureId)
      return { ...inst, creatureDef: def ?? null }
    })
  }, [state.creatures])

  const rrGetStructureList = useMemo(() => {
    return state.structures.map(inst => {
      const def = RR_STRUCTURES.find(s => s.id === inst.structureDefId)
      return { ...inst, structureDef: def ?? null }
    })
  }, [state.structures])

  const rrGetTotalPower = useMemo(() => {
    let total = 0
    for (const inst of state.carvedRunes) {
      if (!inst.activated) continue
      const def = RR_RUNES.find(r => r.id === inst.runeId)
      if (def) total += def.power
    }
    for (const comboId of state.runeCombos) {
      const combo = RR_RUNE_COMBOS.find(c => c.id === comboId)
      if (combo) total += combo.resultingPower
    }
    return total
  }, [state.carvedRunes, state.runeCombos])

  const rrGetFlowRate = useMemo(() => {
    let baseRate = RR_MANA_REGEN_RATE
    for (const inst of state.structures) {
      if (inst.structureDefId === 'flow_energy_relay') {
        baseRate += inst.level * 3
      }
    }
    return baseRate + Math.floor(state.flowEnergy / 100)
  }, [state.structures, state.flowEnergy])

  const rrGetRuneSchoolSummary = useMemo(() => {
    const summary: Record<RRSchool, { count: number; totalPower: number; activated: number }> = {
      Fire: { count: 0, totalPower: 0, activated: 0 },
      Water: { count: 0, totalPower: 0, activated: 0 },
      Earth: { count: 0, totalPower: 0, activated: 0 },
      Air: { count: 0, totalPower: 0, activated: 0 },
      Void: { count: 0, totalPower: 0, activated: 0 },
    }
    for (const inst of state.carvedRunes) {
      const def = RR_RUNES.find(r => r.id === inst.runeId)
      if (!def) continue
      summary[def.school].count += 1
      summary[def.school].totalPower += def.power
      if (inst.activated) summary[def.school].activated += 1
    }
    return summary
  }, [state.carvedRunes])

  const rrGetNextTitle = useMemo(() => {
    const currentIdx = RR_TITLES.findIndex(t => t.id === state.currentTitle)
    for (let i = currentIdx + 1; i < RR_TITLES.length; i++) {
      if (state.riverLevel >= RR_TITLES[i].requiredLevel) continue
      return { title: RR_TITLES[i], currentLevel: state.riverLevel, requiredLevel: RR_TITLES[i].requiredLevel }
    }
    return null
  }, [state.currentTitle, state.riverLevel])

  const rrGetRaritySummary = useMemo(() => {
    const summary: Record<RRRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const inst of state.creatures) {
      const def = RR_CREATURES.find(c => c.id === inst.creatureId)
      if (def) summary[def.rarity] += 1
    }
    return summary
  }, [state.creatures])

  const rrGetUnlockedAchievements = useMemo(() => {
    return state.achievements.map(id => RR_ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean)
  }, [state.achievements])

  const rrGetTitleProgress = useMemo(() => {
    const titleDef = RR_TITLES.find(t => t.id === state.currentTitle)
    if (!titleDef) return { current: 'Unknown', color: '#9CA3AF', level: 1 }
    return { current: titleDef.name, color: titleDef.color, level: state.riverLevel }
  }, [state.currentTitle, state.riverLevel])

  const rrGetShrineBlessings = useMemo(() => {
    const blessings: Array<{ shrineId: string; blessingActive: boolean; offeringCount: number; shrineDef: RRShrineDef | null }> = []
    for (const [shrineId, inst] of Object.entries(state.shrines)) {
      const def = RR_SHRINES.find(s => s.id === shrineId)
      blessings.push({
        shrineId,
        blessingActive: inst.blessingActive,
        offeringCount: inst.offeringCount,
        shrineDef: def ?? null,
      })
    }
    return blessings
  }, [state.shrines])

  const rrGetNavigationRange = useMemo(() => {
    const navigated = state.riverProgress.length
    const total = RR_RIVERS.length
    return { navigated, total, percentage: total > 0 ? Math.floor((navigated / total) * 100) : 0 }
  }, [state.riverProgress])

  const rrGetChartReveals = useMemo(() => {
    return state.charts.map(chartId => {
      const def = RR_NAVIGATION_CHARTS.find(c => c.id === chartId)
      return { chartId, chartDef: def ?? null }
    })
  }, [state.charts])

  const rrGetAccessibleRivers = useMemo(() => {
    const chartReveals = new Set<string>()
    for (const chartId of state.charts) {
      const def = RR_NAVIGATION_CHARTS.find(c => c.id === chartId)
      if (def) {
        for (const riverId of def.reveals) chartReveals.add(riverId)
      }
    }
    const alwaysAccessible = ['whispering_brook', 'crystal_stream']
    return RR_RIVERS.filter(r => alwaysAccessible.includes(r.id) || chartReveals.has(r.id))
  }, [state.charts])

  // ── Computed values ───────────────────────────────────────────────

  const rrGetXpProgress = useMemo(() => {
    if (state.riverLevel >= RR_MAX_LEVEL) return { current: RR_XP_TABLE[RR_MAX_LEVEL], needed: 0, percentage: 100 }
    const current = state.riverExp
    const needed = rrGetXpToNext(state.riverLevel)
    const base = RR_XP_TABLE[state.riverLevel]
    const percentage = needed > 0 ? Math.floor(((current - base) / needed) * 100) : 0
    return { current, needed, percentage: Math.min(percentage, 100) }
  }, [state.riverExp, state.riverLevel])

  // ── Actions from store ────────────────────────────────────────────

  const actions: RRActions = {
    rrCarveRune: useRuneRiverStore.getState().rrCarveRune,
    rrActivateRune: useRuneRiverStore.getState().rrActivateRune,
    rrCombineRunes: useRuneRiverStore.getState().rrCombineRunes,
    rrDiscoveredCombo: useRuneRiverStore.getState().rrDiscoveredCombo,
    rrNavigateRiver: useRuneRiverStore.getState().rrNavigateRiver,
    rrSetCamp: useRuneRiverStore.getState().rrSetCamp,
    rrHarvestMana: useRuneRiverStore.getState().rrHarvestMana,
    rrRefineMana: useRuneRiverStore.getState().rrRefineMana,
    rrCaptureCreature: useRuneRiverStore.getState().rrCaptureCreature,
    rrReleaseCreature: useRuneRiverStore.getState().rrReleaseCreature,
    rrBuildStructure: useRuneRiverStore.getState().rrBuildStructure,
    rrUpgradeStructure: useRuneRiverStore.getState().rrUpgradeStructure,
    rrVisitShrine: useRuneRiverStore.getState().rrVisitShrine,
    rrMakeOffering: useRuneRiverStore.getState().rrMakeOffering,
    rrBuyChart: useRuneRiverStore.getState().rrBuyChart,
    rrReadChart: useRuneRiverStore.getState().rrReadChart,
    rrUnlockTitle: useRuneRiverStore.getState().rrUnlockTitle,
    rrClaimAchievement: useRuneRiverStore.getState().rrClaimAchievement,
    rrChannelFlow: useRuneRiverStore.getState().rrChannelFlow,
    rrPurifyWater: useRuneRiverStore.getState().rrPurifyWater,
  }

  return {
    // State
    carvedRunes: state.carvedRunes,
    riverProgress: state.riverProgress,
    manaCrystals: state.manaCrystals,
    creatures: state.creatures,
    structures: state.structures,
    runeCombos: state.runeCombos,
    charts: state.charts,
    shrines: state.shrines,
    riverLevel: state.riverLevel,
    riverExp: state.riverExp,
    gold: state.gold,
    mana: state.mana,
    currentRiver: state.currentRiver,
    achievements: state.achievements,
    currentTitle: state.currentTitle,
    totalCarved: state.totalCarved,
    totalNavigated: state.totalNavigated,
    totalCaptured: state.totalCaptured,
    flowEnergy: state.flowEnergy,
    rrGetXpProgress,

    // Actions
    ...actions,

    // Getters
    rrGetCarvedRunes,
    rrGetRiverProgress,
    rrGetManaInventory,
    rrGetAvailableCombos,
    rrGetDiscoveredCombos,
    rrGetCapturedCreatures,
    rrGetStructureList,
    rrGetTotalPower,
    rrGetFlowRate,
    rrGetRuneSchoolSummary,
    rrGetNextTitle,
    rrGetRaritySummary,
    rrGetUnlockedAchievements,
    rrGetTitleProgress,
    rrGetShrineBlessings,
    rrGetNavigationRange,
    rrGetChartReveals,
    rrGetAccessibleRivers,

    // Constants
    RR_RUNES,
    RR_RIVERS,
    RR_MANA_TYPES,
    RR_CREATURES,
    RR_STRUCTURES,
    RR_ABILITIES,
    RR_ACHIEVEMENTS,
    RR_TITLES,
    RR_RUNE_COMBOS,
    RR_NAVIGATION_CHARTS,
    RR_SHRINES,
    RR_COLOR_FIRE_RUNE,
    RR_COLOR_WATER_RUNE,
    RR_COLOR_EARTH_RUNE,
    RR_COLOR_AIR_RUNE,
    RR_COLOR_VOID_RUNE,
    RR_COLOR_MANA,
    RR_COLOR_RIVER,
    RR_COLOR_SHRINE,
    RR_SCHOOL_COLORS,
    RR_RARITY_COLORS,
    RR_MAX_LEVEL,
    RR_XP_TABLE,
  }
}
