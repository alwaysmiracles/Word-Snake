/**
 * Serpent Nile Wire — 蛇之尼罗 (Serpent Nile) feature module for Word Snake
 *
 * A serpent husbandry mini-game along the ancient Nile: tame 35 serpent
 * species across 7 elements, explore 8 temple zones, harvest venom &
 * scales, build temple structures, discover 15 legendary relics, face
 * 12 Nile events, and ascend through 8 titles from Fledgling Handler
 * to Serpent Pharaoh — backed by a Zustand store with persist middleware.
 *
 * Storage key: serpent-nile-wire
 * Prefix: sn / SN_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type SNElement =
  | 'water'
  | 'sand'
  | 'venom'
  | 'shadow'
  | 'sun'
  | 'moon'
  | 'fire'

export type SNRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type SNTitleId =
  | 'title_fledgling'
  | 'title_handler'
  | 'title_charmer'
  | 'title_venom_master'
  | 'title_temple_guardian'
  | 'title_nile_sovereign'
  | 'title_serpent_lord'
  | 'title_serpent_pharaoh'

export interface SNElementDef {
  readonly id: SNElement
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface SNSerpentSpecies {
  readonly id: string
  readonly name: string
  readonly element: SNElement
  readonly rarity: SNRarity
  readonly venomPower: number
  readonly constrictPower: number
  readonly speed: number
  readonly description: string
  readonly abilities: string[]
}

export interface SNSerpentInstance {
  readonly id: string
  speciesId: string
  name: string
  level: number
  xp: number
  venomPower: number
  constrictPower: number
  speed: number
  mood: number
  hunger: number
  tamedAt: number
}

export interface SNZoneDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly dangerLevel: number
  readonly requiredTitle: SNTitleId
  readonly element: SNElement
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface SNMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'scale' | 'venom' | 'bone' | 'relic_shard' | 'essence'
  readonly rarity: SNRarity
  readonly venomBonus: number
  readonly constrictBonus: number
  readonly value: number
  readonly description: string
}

export interface SNStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'serpent_pit' | 'healing_pool' | 'venom_lab' | 'sand_altar' | 'relic_shrine'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface SNStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface SNAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly element: SNElement
  readonly type: 'active' | 'passive'
  readonly rarity: SNRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface SNAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface SNTitleDef {
  readonly id: SNTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minSerpents: number
  readonly description: string
}

export interface SNRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: SNRarity
  readonly element: SNElement
  readonly venomBoost: number
  readonly constrictBoost: number
  readonly speedBoost: number
  readonly value: number
  readonly description: string
}

export interface SNEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface SNStoreState {
  serpents: SNSerpentInstance[]
  zones: string[]
  materials: { materialId: string; count: number }[]
  structures: SNStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: SNTitleId
  gold: number
  renown: number
  totalTamed: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: SNEventDef | null
  eventTurnsRemaining: number
  activeZone: string | null
}

export interface SNStoreActions {
  snTameSerpent: (speciesId: string) => boolean
  snReleaseSerpent: (serpentId: string) => boolean
  snFeedSerpent: (serpentId: string) => boolean
  snHarvestVenom: (serpentId: string) => boolean
  snBuildStructure: (structureDefId: string) => boolean
  snUpgradeStructure: (structureId: string) => boolean
  snExploreZone: (zoneId: string) => SNEventDef | null
  snCollectRelic: (relicId: string) => boolean
  snUnlockAbility: (abilityId: string) => boolean
  snUnlockTitle: (titleId: SNTitleId) => boolean
  snClaimAchievement: (achievementId: string) => boolean
  snTradeMaterial: (materialId: string, count: number) => number
  snEndEvent: () => void
  snResetEvent: () => void
}

export interface SNFullStore extends SNStoreState, SNStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const SN_NILE_BLUE: string = '#1E90FF'
export const SN_DESERT_SAND: string = '#F4A460'
export const SN_SERPENT_GREEN: string = '#2E8B57'
export const SN_GOLD: string = '#FFD700'
export const SN_MIDNIGHT_BLACK: string = '#1C1C1C'
export const SN_SCARLET_RED: string = '#DC143C'
export const SN_PAPYRUS: string = '#F5F5DC'
export const SN_TURQUOISE: string = '#40E0D0'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: ELEMENT DEFINITIONS (7 elements)
// ═══════════════════════════════════════════════════════════════════

export const SN_ELEMENTS: readonly SNElementDef[] = [
  {
    id: 'water',
    name: 'Water',
    color: SN_NILE_BLUE,
    description:
      'Serpents born from the sacred Nile itself. Water serpents command currents, waves, and the life-giving flood.',
  },
  {
    id: 'sand',
    name: 'Sand',
    color: SN_DESERT_SAND,
    description:
      'Desert serpents that swim through dunes as easily as water. They sense vibrations across miles of sand.',
  },
  {
    id: 'venom',
    name: 'Venom',
    color: SN_SCARLET_RED,
    description:
      'The most toxic serpents of the Nile kingdom. A single bite can fell a war elephant in minutes.',
  },
  {
    id: 'shadow',
    name: 'Shadow',
    color: SN_MIDNIGHT_BLACK,
    description:
      'Serpents that dwell in the darkness beneath the temples. They move unseen and strike without warning.',
  },
  {
    id: 'sun',
    name: 'Sun',
    color: SN_GOLD,
    description:
      'Radiant serpents blessed by Ra himself. Their scales shimmer with golden light and heal those they deem worthy.',
  },
  {
    id: 'moon',
    name: 'Moon',
    color: SN_TURQUOISE,
    description:
      'Nocturnal serpents that draw power from the moon. Under a full moon they can mesmerize any creature.',
  },
  {
    id: 'fire',
    name: 'Fire',
    color: SN_SERPENT_GREEN,
    description:
      'Serpents infused with the primordial fire of the desert sun. Their venom burns like liquid flame.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: ELEMENT SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const SN_SYNERGY_MAP: Record<SNElement, SNElement[]> = {
  water: ['fire', 'moon'],
  sand: ['fire', 'shadow'],
  venom: ['water', 'sun'],
  shadow: ['moon', 'sand'],
  sun: ['sand', 'venom'],
  moon: ['shadow', 'water'],
  fire: ['water', 'venom'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: SN_SERPENTS — 35 Serpent Species (7 per element)
// ═══════════════════════════════════════════════════════════════════

export const SN_SERPENTS: readonly SNSerpentSpecies[] = [
  // ── Water Serpents (7) ────────────────────────────────────────
  {
    id: 'water_baby_viper',
    name: 'Nile Reed Viper',
    element: 'water',
    rarity: 'common',
    venomPower: 12,
    constrictPower: 8,
    speed: 18,
    description:
      'A small green viper found among the papyrus reeds of the Nile delta. Harmless to humans but tenacious.',
    abilities: ['water_surge'],
  },
  {
    id: 'water_nile_cobra',
    name: 'Papyrus Cobra',
    element: 'water',
    rarity: 'common',
    venomPower: 18,
    constrictPower: 10,
    speed: 22,
    description:
      'A slender cobra that hunts fish along the riverbanks. Its hood bears markings like hieroglyphs.',
    abilities: ['water_surge', 'aqua_venom'],
  },
  {
    id: 'water_tide_python',
    name: 'Tide Python',
    element: 'water',
    rarity: 'uncommon',
    venomPower: 8,
    constrictPower: 35,
    speed: 15,
    description:
      'A massive constrictor that lurks in the deeper waters of the Nile. It can drag crocodiles under.',
    abilities: ['water_surge', 'tidal_coil'],
  },
  {
    id: 'water_flood_serpent',
    name: 'Flood Serpent',
    element: 'water',
    rarity: 'uncommon',
    venomPower: 25,
    constrictPower: 20,
    speed: 28,
    description:
      'Appears during the annual inundation. It rides the floodwaters and hunts anything caught in the current.',
    abilities: ['water_surge', 'flood_burst'],
  },
  {
    id: 'water_sobek_fang',
    name: "Sobek's Fang",
    element: 'water',
    rarity: 'rare',
    venomPower: 55,
    constrictPower: 45,
    speed: 30,
    description:
      'A crocodile-headed serpent sacred to Sobek. It commands the Nile itself and can summon water at will.',
    abilities: ['water_surge', 'aqua_venom', 'sobek_command'],
  },
  {
    id: 'water_nile_leviathan',
    name: 'Nile Leviathan',
    element: 'water',
    rarity: 'epic',
    venomPower: 80,
    constrictPower: 90,
    speed: 25,
    description:
      'A colossal serpent said to be the living embodiment of the Nile. It creates whirlpools large enough to swallow boats.',
    abilities: ['water_surge', 'aqua_venom', 'tidal_coil', 'leviathan_maw'],
  },
  {
    id: 'water_hapi_guardian',
    name: 'Hapi Guardian',
    element: 'water',
    rarity: 'legendary',
    venomPower: 120,
    constrictPower: 130,
    speed: 40,
    description:
      'The divine serpent guardian of Hapi, god of the Nile flood. Its appearance signals a bountiful harvest year.',
    abilities: ['water_surge', 'aqua_venom', 'sobek_command', 'leviathan_maw', 'hapi_blessing'],
  },

  // ── Sand Serpents (7) ─────────────────────────────────────────
  {
    id: 'sand_dune_adder',
    name: 'Dune Adder',
    element: 'sand',
    rarity: 'common',
    venomPower: 15,
    constrictPower: 5,
    speed: 30,
    description:
      'A small sandy-colored adder that buries itself in the dunes. Nearly invisible until it strikes.',
    abilities: ['sand_burrow'],
  },
  {
    id: 'sand_desert_cobra',
    name: 'Desert Specter',
    element: 'sand',
    rarity: 'common',
    venomPower: 22,
    constrictPower: 8,
    speed: 26,
    description:
      'A pale cobra that haunts desert oases. Nomads say it drinks from mirages.',
    abilities: ['sand_burrow', 'sand_vortex'],
  },
  {
    id: 'sand_caravan_viper',
    name: 'Caravan Viper',
    element: 'sand',
    rarity: 'uncommon',
    venomPower: 30,
    constrictPower: 15,
    speed: 35,
    description:
      'A fast viper that follows trade routes, ambushing caravans from beneath the sand.',
    abilities: ['sand_burrow', 'sandstorm_bite'],
  },
  {
    id: 'sand_sphinx_snake',
    name: 'Sphinx Serpent',
    element: 'sand',
    rarity: 'uncommon',
    venomPower: 20,
    constrictPower: 25,
    speed: 20,
    description:
      'A rare serpent that nests near the Great Sphinx. It can speak in riddles and paralyze prey with its gaze.',
    abilities: ['sand_burrow', 'riddle_gaze'],
  },
  {
    id: 'sand_scarab_constrictor',
    name: 'Scarab Constrictor',
    element: 'sand',
    rarity: 'rare',
    venomPower: 40,
    constrictPower: 70,
    speed: 18,
    description:
      'A massive golden serpent that coils around ancient ruins. Its scales are as hard as scarab shells.',
    abilities: ['sand_burrow', 'sand_vortex', 'golden_coil'],
  },
  {
    id: 'sand_golem_wyrm',
    name: 'Sand Golem Wyrm',
    element: 'sand',
    rarity: 'epic',
    venomPower: 65,
    constrictPower: 85,
    speed: 22,
    description:
      'A towering serpent composed entirely of enchanted desert sand. It reshapes dunes to build massive traps.',
    abilities: ['sand_burrow', 'sand_vortex', 'golden_coil', 'dune_tsunami'],
  },
  {
    id: 'sand_set_beast',
    name: 'Set Beast',
    element: 'sand',
    rarity: 'legendary',
    venomPower: 100,
    constrictPower: 110,
    speed: 45,
    description:
      'A monstrous serpent born from the rage of Set, god of chaos. Its venom turns flesh to sand.',
    abilities: ['sand_burrow', 'sandstorm_bite', 'golden_coil', 'dune_tsunami', 'chaos_desert'],
  },

  // ── Venom Serpents (7) ────────────────────────────────────────
  {
    id: 'venom_reed_spitter',
    name: 'Reed Spitter',
    element: 'venom',
    rarity: 'common',
    venomPower: 20,
    constrictPower: 3,
    speed: 16,
    description:
      'A small snake that spits blinding venom at threats from the safety of reed beds.',
    abilities: ['venom_spit'],
  },
  {
    id: 'venom_papyrus_asp',
    name: 'Papyrus Asp',
    element: 'venom',
    rarity: 'common',
    venomPower: 28,
    constrictPower: 5,
    speed: 24,
    description:
      'The asp of the Nile marshes. Egyptian queens once chose its bite as a noble end.',
    abilities: ['venom_spit', 'neuro_venom'],
  },
  {
    id: 'venom_night_mamba',
    name: 'Night Mamba',
    element: 'venom',
    rarity: 'uncommon',
    venomPower: 45,
    constrictPower: 10,
    speed: 42,
    description:
      'A jet-black mamba that hunts exclusively at night. Its venom causes vivid hallucinations before death.',
    abilities: ['venom_spit', 'hallucinogenic_bite'],
  },
  {
    id: 'venom_scorpion_tail',
    name: 'Scorpion-tailed Serpent',
    element: 'venom',
    rarity: 'uncommon',
    venomPower: 50,
    constrictPower: 20,
    speed: 28,
    description:
      'A hybrid creature with a venomous scorpion stinger at the tip of its tail. Dual envenomation mechanism.',
    abilities: ['venom_spit', 'dual_sting'],
  },
  {
    id: 'venom_plague_cobra',
    name: 'Plague Cobra',
    element: 'venom',
    rarity: 'rare',
    venomPower: 75,
    constrictPower: 15,
    speed: 32,
    description:
      'A cobra whose venom spreads like a plague. Entire villages have fallen to its toxic breath.',
    abilities: ['venom_spit', 'neuro_venom', 'plague_mist'],
  },
  {
    id: 'venom_wadjet_king',
    name: 'Wadjet King Cobra',
    element: 'venom',
    rarity: 'epic',
    venomPower: 110,
    constrictPower: 30,
    speed: 38,
    description:
      'The king of all venomous serpents, blessed by Wadjet herself. Its venom contains the essence of protection.',
    abilities: ['venom_spit', 'neuro_venom', 'plague_mist', 'royal_venom'],
  },
  {
    id: 'venom_apophis_fang',
    name: "Apophis's Fang",
    element: 'venom',
    rarity: 'legendary',
    venomPower: 150,
    constrictPower: 50,
    speed: 48,
    description:
      'The living fang of Apophis, the serpent of chaos. A single drop of its venom could poison the Nile itself.',
    abilities: ['venom_spit', 'neuro_venom', 'plague_mist', 'royal_venom', 'chaos_venom'],
  },

  // ── Shadow Serpents (7) ───────────────────────────────────────
  {
    id: 'shadow_tomb_viper',
    name: 'Tomb Viper',
    element: 'shadow',
    rarity: 'common',
    venomPower: 16,
    constrictPower: 12,
    speed: 20,
    description:
      'A small dark viper found inside sealed tombs. It feeds on scarabs and other tomb dwellers.',
    abilities: ['shadow_blend'],
  },
  {
    id: 'shadow_catacomb_python',
    name: 'Catacomb Python',
    element: 'shadow',
    rarity: 'common',
    venomPower: 10,
    constrictPower: 28,
    speed: 14,
    description:
      'A large python that nests in the catacombs beneath temples. It crushes tomb robbers silently.',
    abilities: ['shadow_blend', 'dark_constrict'],
  },
  {
    id: 'shadow_mummy_cobra',
    name: 'Mummy Cobra',
    element: 'shadow',
    rarity: 'uncommon',
    venomPower: 35,
    constrictPower: 18,
    speed: 22,
    description:
      'A spectral cobra wrapped in ancient linen bandages. It guards the possessions of the dead eternally.',
    abilities: ['shadow_blend', 'undead_fang'],
  },
  {
    id: 'shadow_void_striker',
    name: 'Void Striker',
    element: 'shadow',
    rarity: 'uncommon',
    venomPower: 42,
    constrictPower: 15,
    speed: 45,
    description:
      'A serpent that exists partially between the world of the living and the Duat. It phases through walls.',
    abilities: ['shadow_blend', 'phase_strike'],
  },
  {
    id: 'shadow_anubis_serpent',
    name: 'Anubis Serpent',
    element: 'shadow',
    rarity: 'rare',
    venomPower: 60,
    constrictPower: 40,
    speed: 30,
    description:
      'A jackal-headed serpent that serves Anubis in the weighing of hearts. It can sense the dying.',
    abilities: ['shadow_blend', 'dark_constrict', 'death_sense'],
  },
  {
    id: 'shadow_nightmare_wyrm',
    name: 'Nightmare Wyrm',
    element: 'shadow',
    rarity: 'epic',
    venomPower: 90,
    constrictPower: 55,
    speed: 35,
    description:
      'A massive serpent that feeds on fear and nightmares. Its victims never wake from the dreams it weaves.',
    abilities: ['shadow_blend', 'phase_strike', 'death_sense', 'nightmare_coil'],
  },
  {
    id: 'shadow_osiris_wraith',
    name: 'Osiris Wraith Serpent',
    element: 'shadow',
    rarity: 'legendary',
    venomPower: 130,
    constrictPower: 80,
    speed: 50,
    description:
      'A serpentine wraith that serves Osiris in the afterlife. It traverses both the living world and the Duat freely.',
    abilities: ['shadow_blend', 'phase_strike', 'death_sense', 'nightmare_coil', 'duat_passage'],
  },

  // ── Sun Serpents (7) ──────────────────────────────────────────
  {
    id: 'sun_dawn_viper',
    name: 'Dawn Viper',
    element: 'sun',
    rarity: 'common',
    venomPower: 10,
    constrictPower: 10,
    speed: 25,
    description:
      'A golden-scaled viper that emerges only at sunrise. Its venom has mild healing properties.',
    abilities: ['solar_glow'],
  },
  {
    id: 'sun_ra_cobra',
    name: 'Sun Cobra',
    element: 'sun',
    rarity: 'common',
    venomPower: 18,
    constrictPower: 12,
    speed: 22,
    description:
      'A radiant cobra with a hood that blazes like the sun. Sacred to Ra and kept in temple gardens.',
    abilities: ['solar_glow', 'radiant_hood'],
  },
  {
    id: 'sun_scarab_serpent',
    name: 'Scarab Serpent',
    element: 'sun',
    rarity: 'uncommon',
    venomPower: 25,
    constrictPower: 30,
    speed: 20,
    description:
      'A sun-worshipping serpent with iridescent scarab-like scales. It can regenerate its own wounds.',
    abilities: ['solar_glow', 'scarab_regen'],
  },
  {
    id: 'sun_solstice_python',
    name: 'Solstice Python',
    element: 'sun',
    rarity: 'uncommon',
    venomPower: 15,
    constrictPower: 50,
    speed: 16,
    description:
      'A massive python that only moves on the summer solstice. Its coils generate incredible heat.',
    abilities: ['solar_glow', 'solstice_heat'],
  },
  {
    id: 'sun_bennu_serpent',
    name: 'Bennu Serpent',
    element: 'sun',
    rarity: 'rare',
    venomPower: 55,
    constrictPower: 45,
    speed: 35,
    description:
      'A phoenix-like serpent associated with Bennu, the heron of creation. It can ignite itself in golden fire.',
    abilities: ['solar_glow', 'radiant_hood', 'phoenix_flame'],
  },
  {
    id: 'sun_ra_ancient',
    name: 'Eye of Ra Serpent',
    element: 'sun',
    rarity: 'epic',
    venomPower: 85,
    constrictPower: 60,
    speed: 40,
    description:
      'A divine serpent that serves as Ra\'s personal guardian during his journey through the Duat each night.',
    abilities: ['solar_glow', 'radiant_hood', 'phoenix_flame', 'solar_flare'],
  },
  {
    id: 'sun_aten_radiance',
    name: 'Aten Radiance',
    element: 'sun',
    rarity: 'legendary',
    venomPower: 110,
    constrictPower: 75,
    speed: 55,
    description:
      'The ultimate sun serpent, embodying the Aten itself. Its mere presence cures all ailments and turns away darkness.',
    abilities: ['solar_glow', 'radiant_hood', 'phoenix_flame', 'solar_flare', 'aten_disc'],
  },

  // ── Moon Serpents (7) ─────────────────────────────────────────
  {
    id: 'moon_silver_asp',
    name: 'Silver Asp',
    element: 'moon',
    rarity: 'common',
    venomPower: 14,
    constrictPower: 6,
    speed: 28,
    description:
      'A small asp with silver scales that reflect moonlight. Most active during the full moon.',
    abilities: ['moon_shimmer'],
  },
  {
    id: 'moon_khonsu_cobra',
    name: 'Khonsu Cobra',
    element: 'moon',
    rarity: 'common',
    venomPower: 22,
    constrictPower: 15,
    speed: 24,
    description:
      'A blue-hooded cobra sacred to Khonsu, god of the moon. It can hypnotize prey with its gaze.',
    abilities: ['moon_shimmer', 'lunar_charm'],
  },
  {
    id: 'moon_tide_serpent',
    name: 'Lunar Tide Serpent',
    element: 'moon',
    rarity: 'uncommon',
    venomPower: 20,
    constrictPower: 35,
    speed: 22,
    description:
      'A deep-sea serpent that follows the moon\'s gravitational pull. It can control tides.',
    abilities: ['moon_shimmer', 'tidal_pull'],
  },
  {
    id: 'moon_night_gazer',
    name: 'Night Gazer',
    element: 'moon',
    rarity: 'uncommon',
    venomPower: 38,
    constrictPower: 18,
    speed: 30,
    description:
      'A mysterious serpent with eyes like twin moons. It can induce sleep and prophetic dreams.',
    abilities: ['moon_shimmer', 'lunar_charm', 'dream_weave'],
  },
  {
    id: 'moon_thoth_serpent',
    name: 'Thoth Serpent',
    element: 'moon',
    rarity: 'rare',
    venomPower: 50,
    constrictPower: 40,
    speed: 35,
    description:
      'An ibis-feathered serpent sacred to Thoth. It possesses ancient knowledge and can read hieroglyphs.',
    abilities: ['moon_shimmer', 'lunar_charm', 'dream_weave', 'wisdom_bite'],
  },
  {
    id: 'moon_isis_guardian',
    name: 'Isis Moon Guardian',
    element: 'moon',
    rarity: 'epic',
    venomPower: 80,
    constrictPower: 55,
    speed: 38,
    description:
      'A silver serpent blessed by Isis herself. Its moonlight can heal any wound and shield against curses.',
    abilities: ['moon_shimmer', 'lunar_charm', 'dream_weave', 'moon_shield'],
  },
  {
    id: 'moon_weret_hesy',
    name: 'Weret Hesy',
    element: 'moon',
    rarity: 'legendary',
    venomPower: 120,
    constrictPower: 85,
    speed: 52,
    description:
      'The Great Serpent of the Moon, spoken of only in the oldest papyri. It controls the lunar cycle itself.',
    abilities: ['moon_shimmer', 'lunar_charm', 'dream_weave', 'moon_shield', 'eclipse_ritual'],
  },

  // ── Fire Serpents (7) ─────────────────────────────────────────
  {
    id: 'fire_ember_viper',
    name: 'Ember Viper',
    element: 'fire',
    rarity: 'common',
    venomPower: 22,
    constrictPower: 5,
    speed: 26,
    description:
      'A small viper whose venom burns like liquid fire. Found near volcanic vents in the eastern desert.',
    abilities: ['fire_fang'],
  },
  {
    id: 'fire_brazier_cobra',
    name: 'Brazier Cobra',
    element: 'fire',
    rarity: 'common',
    venomPower: 28,
    constrictPower: 10,
    speed: 22,
    description:
      'A cobra that nests in temple braziers. Its scales are always warm to the touch.',
    abilities: ['fire_fang', 'flame_hood'],
  },
  {
    id: 'fire_pyre_python',
    name: 'Pyre Python',
    element: 'fire',
    rarity: 'uncommon',
    venomPower: 18,
    constrictPower: 45,
    speed: 15,
    description:
      'A massive python whose coils generate intense heat. Prey is cooked alive within its embrace.',
    abilities: ['fire_fang', 'pyre_coil'],
  },
  {
    id: 'fire_inferno_asp',
    name: 'Inferno Asp',
    element: 'fire',
    rarity: 'uncommon',
    venomPower: 48,
    constrictPower: 15,
    speed: 32,
    description:
      'An asp whose venom ignites on contact with air. Its fangs glow orange in the dark.',
    abilities: ['fire_fang', 'flame_hood', 'blazing_spit'],
  },
  {
    id: 'fire_sekmet_serpent',
    name: 'Sekmet Serpent',
    element: 'fire',
    rarity: 'rare',
    venomPower: 65,
    constrictPower: 35,
    speed: 38,
    description:
      'A lioness-headed serpent sacred to Sekhmet, goddess of war and fire. It breathes actual flame.',
    abilities: ['fire_fang', 'flame_hood', 'blazing_spit', 'war_flame'],
  },
  {
    id: 'fire_ptah_forge',
    name: 'Ptah Forge Serpent',
    element: 'fire',
    rarity: 'epic',
    venomPower: 95,
    constrictPower: 55,
    speed: 30,
    description:
      'A serpent forged by Ptah himself in the celestial foundry. Its body is made of molten bronze and living fire.',
    abilities: ['fire_fang', 'flame_hood', 'blazing_spit', 'molten_scales'],
  },
  {
    id: 'fire_nun_primordial',
    name: 'Nun Primordial Flame',
    element: 'fire',
    rarity: 'legendary',
    venomPower: 140,
    constrictPower: 70,
    speed: 55,
    description:
      'The first fire serpent, born from the primordial waters of Nun at the moment of creation. It is fire incarnate.',
    abilities: ['fire_fang', 'flame_hood', 'blazing_spit', 'molten_scales', 'creation_fire'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: SN_TEMPLES — 8 Nile Temple Zones
// ═══════════════════════════════════════════════════════════════════

export const SN_TEMPLES: readonly SNZoneDef[] = [
  {
    id: 'delta_marshes',
    name: 'Delta Marshes',
    description:
      'The fertile marshlands where the Nile meets the Mediterranean. Reeds, lotus flowers, and countless water serpents abound.',
    depth: 0,
    dangerLevel: 1,
    requiredTitle: 'title_fledgling',
    element: 'water',
    bgGradient: 'linear-gradient(180deg, #1E90FF 0%, #2E8B57 50%, #F4A460 100%)',
    ambientColor: SN_NILE_BLUE,
  },
  {
    id: 'fayum_oasis',
    name: 'Fayum Oasis',
    description:
      'A sacred oasis in the western desert where sand and water serpents coexist. Ancient healers gathered medicinal herbs here.',
    depth: 1,
    dangerLevel: 2,
    requiredTitle: 'title_fledgling',
    element: 'sand',
    bgGradient: 'linear-gradient(180deg, #F4A460 0%, #2E8B57 50%, #1E90FF 100%)',
    ambientColor: SN_DESERT_SAND,
  },
  {
    id: 'giza_plateau',
    name: 'Giza Plateau',
    description:
      'The great plateau of the pyramids. Shadow serpents nest in hidden passages beneath the Sphinx.',
    depth: 2,
    dangerLevel: 3,
    requiredTitle: 'title_handler',
    element: 'shadow',
    bgGradient: 'linear-gradient(180deg, #F4A460 0%, #1C1C1C 50%, #FFD700 100%)',
    ambientColor: SN_DESERT_SAND,
  },
  {
    id: 'valley_kings',
    name: 'Valley of the Kings',
    description:
      'The royal necropolis on the west bank. The most venomous and dangerous serpents guard the pharaohs\' tombs.',
    depth: 3,
    dangerLevel: 4,
    requiredTitle: 'title_charmer',
    element: 'venom',
    bgGradient: 'linear-gradient(180deg, #1C1C1C 0%, #DC143C 50%, #FFD700 100%)',
    ambientColor: SN_MIDNIGHT_BLACK,
  },
  {
    id: 'karnak_temple',
    name: 'Karnak Temple',
    description:
      'The largest temple complex in Egypt. Sun serpents bask on the sacred lake, and moon serpents emerge at dusk.',
    depth: 4,
    dangerLevel: 5,
    requiredTitle: 'title_venom_master',
    element: 'sun',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #F4A460 50%, #1E90FF 100%)',
    ambientColor: SN_GOLD,
  },
  {
    id: 'luxor_sanctum',
    name: 'Luxor Sanctum',
    description:
      'A hidden sanctuary within Luxor Temple where the oldest serpent relics are kept. Fire serpents guard the inner sanctum.',
    depth: 5,
    dangerLevel: 6,
    requiredTitle: 'title_temple_guardian',
    element: 'fire',
    bgGradient: 'linear-gradient(180deg, #DC143C 0%, #2E8B57 50%, #FFD700 100%)',
    ambientColor: SN_SCARLET_RED,
  },
  {
    id: 'abu_simbel',
    name: 'Abu Simbel Caverns',
    description:
      'The underground caverns beneath Abu Simbel. Only the most powerful serpents survive the depths here.',
    depth: 6,
    dangerLevel: 7,
    requiredTitle: 'title_nile_sovereign',
    element: 'moon',
    bgGradient: 'linear-gradient(180deg, #40E0D0 0%, #1C1C1C 50%, #1E90FF 100%)',
    ambientColor: SN_TURQUOISE,
  },
  {
    id: 'source_nile',
    name: 'Source of the Nile',
    description:
      'The mythical source of the Nile where all elements converge. The rarest and most powerful serpents dwell here.',
    depth: 7,
    dangerLevel: 8,
    requiredTitle: 'title_serpent_lord',
    element: 'water',
    bgGradient: 'linear-gradient(180deg, #40E0D0 0%, #1E90FF 50%, #FFD700 100%)',
    ambientColor: SN_TURQUOISE,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: SN_MATERIALS — 30 Scales/Venoms/Materials
// ═══════════════════════════════════════════════════════════════════

export const SN_MATERIALS: readonly SNMaterialDef[] = [
  // Common (8)
  { id: 'mat_shed_skin', name: 'Shed Skin', emoji: '🪶', type: 'scale', rarity: 'common', venomBonus: 2, constrictBonus: 1, value: 10, description: 'A freshly shed serpent skin, still slightly iridescent.' },
  { id: 'mat_reed_venom', name: 'Reed Viper Venom', emoji: '💧', type: 'venom', rarity: 'common', venomBonus: 5, constrictBonus: 0, value: 15, description: 'Mild venom from a Nile reed viper. Useful for basic tinctures.' },
  { id: 'mat_sand_scale', name: 'Sand Scale', emoji: '🟡', type: 'scale', rarity: 'common', venomBonus: 1, constrictBonus: 3, value: 12, description: 'A weathered scale from a desert serpent. Gritty to the touch.' },
  { id: 'mat_tomb_fang', name: 'Tomb Viper Fang', emoji: '🦷', type: 'bone', rarity: 'common', venomBonus: 4, constrictBonus: 0, value: 18, description: 'A small fang from a shadow viper found in a minor tomb.' },
  { id: 'mat_dawn_scale', name: 'Dawn Scale', emoji: '✨', type: 'scale', rarity: 'common', venomBonus: 3, constrictBonus: 2, value: 14, description: 'A golden scale from a dawn viper. It glows faintly at sunrise.' },
  { id: 'mat_silver_fang', name: 'Silver Asp Fang', emoji: '🦷', type: 'bone', rarity: 'common', venomBonus: 6, constrictBonus: 0, value: 20, description: 'A delicate fang from a silver asp, reflecting moonlight.' },
  { id: 'mat_ember_fang', name: 'Ember Viper Fang', emoji: '🔥', type: 'bone', rarity: 'common', venomBonus: 5, constrictBonus: 1, value: 16, description: 'A fang that is always warm to the touch, even days after removal.' },
  { id: 'mat_pond_bone', name: 'Pond Serpent Bone', emoji: '🦴', type: 'bone', rarity: 'common', venomBonus: 0, constrictBonus: 4, value: 8, description: 'A small bone from a water serpent. Used in basic healing poultices.' },

  // Uncommon (7)
  { id: 'mat_papyrus_cobra_venom', name: 'Papyrus Cobra Venom', emoji: '⚗️', type: 'venom', rarity: 'uncommon', venomBonus: 15, constrictBonus: 0, value: 80, description: 'Concentrated venom from a Papyrus Cobra. A prized alchemical ingredient.' },
  { id: 'mat_caravan_scale', name: 'Caravan Viper Scale', emoji: '🟠', type: 'scale', rarity: 'uncommon', venomBonus: 5, constrictBonus: 8, value: 65, description: 'A hardened scale from a fast desert viper. Excellent for armor crafting.' },
  { id: 'mat_night_mamba_venom', name: 'Night Mamba Venom', emoji: '🧪', type: 'venom', rarity: 'uncommon', venomBonus: 20, constrictBonus: 0, value: 90, description: 'Hallucinogenic venom that induces vivid, sometimes prophetic, visions.' },
  { id: 'mat_catacomb_bone', name: 'Catacomb Python Bone', emoji: '🦴', type: 'bone', rarity: 'uncommon', venomBonus: 2, constrictBonus: 15, value: 70, description: 'A massive vertebra from a catacomb python. Still radiates cold energy.' },
  { id: 'mat_solstice_scale', name: 'Solstice Python Scale', emoji: '☀️', type: 'scale', rarity: 'uncommon', venomBonus: 8, constrictBonus: 12, value: 75, description: 'A scale that generates warmth. It pulses with solar energy.' },
  { id: 'mat_tide_serpent_venom', name: 'Lunar Tide Venom', emoji: '🌙', type: 'venom', rarity: 'uncommon', venomBonus: 18, constrictBonus: 5, value: 85, description: 'Venom that responds to the moon\'s phases, strongest during full moon.' },
  { id: 'mat_pyre_scale', name: 'Pyre Python Scale', emoji: '🔶', type: 'scale', rarity: 'uncommon', venomBonus: 10, constrictBonus: 10, value: 72, description: 'A heat-generating scale from the pyre python. Used in fire rituals.' },

  // Rare (6)
  { id: 'mat_sobek_fang', name: "Sobek's Fang", emoji: '🦷', type: 'bone', rarity: 'rare', venomBonus: 35, constrictBonus: 15, value: 350, description: 'A massive fang from the sacred Sobek\'s Fang serpent. It radiates river energy.' },
  { id: 'mat_sphinx_scale', name: 'Sphinx Serpent Scale', emoji: '🔵', type: 'scale', rarity: 'rare', venomBonus: 20, constrictBonus: 25, value: 300, description: 'A scale inscribed with tiny hieroglyphs that shift and change.' },
  { id: 'mat_plague_cobra_venom', name: 'Plague Cobra Venom', emoji: '☠️', type: 'venom', rarity: 'rare', venomBonus: 45, constrictBonus: 0, value: 400, description: 'Highly dangerous plague venom. Must be stored in sealed canopic jars.' },
  { id: 'mat_bennu_scale', name: 'Bennu Serpent Scale', emoji: '🌟', type: 'scale', rarity: 'rare', venomBonus: 15, constrictBonus: 20, value: 320, description: 'A phoenix-like scale that glows with inner fire. It can regenerate when cracked.' },
  { id: 'mat_anubis_bone', name: 'Anubis Serpent Bone', emoji: '💀', type: 'bone', rarity: 'rare', venomBonus: 30, constrictBonus: 25, value: 380, description: 'A bone from the Anubis serpent. It is ice-cold and whispers to the dead.' },
  { id: 'mat_thoth_venom', name: 'Thoth Serpent Venom', emoji: '📜', type: 'venom', rarity: 'rare', venomBonus: 25, constrictBonus: 10, value: 360, description: 'Venom that grants temporary knowledge of ancient languages when ingested.' },

  // Epic (5)
  { id: 'mat_wadjet_venom', name: 'Wadjet King Venom', emoji: '👁️', type: 'venom', rarity: 'epic', venomBonus: 80, constrictBonus: 20, value: 1500, description: 'Royal venom from the Wadjet King Cobra. Contains divine protective essence.' },
  { id: 'mat_leviathan_scale', name: 'Nile Leviathan Scale', emoji: '🌊', type: 'scale', rarity: 'epic', venomBonus: 30, constrictBonus: 60, value: 1400, description: 'A colossal scale from the Nile Leviathan. It hums with the power of the entire river.' },
  { id: 'mat_isis_essence', name: 'Isis Moon Essence', emoji: '💎', type: 'essence', rarity: 'epic', venomBonus: 20, constrictBonus: 20, value: 1600, description: 'Liquid moonlight essence from the Isis Guardian. The ultimate healing reagent.' },
  { id: 'mat_eye_ra_venom', name: 'Eye of Ra Venom', emoji: '🔆', type: 'venom', rarity: 'epic', venomBonus: 75, constrictBonus: 40, value: 1800, description: 'Venom that burns with the literal fire of the sun. Can melt bronze.' },
  { id: 'mat_ptah_scale', name: 'Ptah Forge Scale', emoji: '⚒️', type: 'scale', rarity: 'epic', venomBonus: 40, constrictBonus: 35, value: 1700, description: 'A scale of molten bronze from the Ptah Forge Serpent. It glows like a furnace.' },

  // Legendary (4)
  { id: 'mat_hapi_essence', name: 'Hapi Divine Essence', emoji: '👑', type: 'essence', rarity: 'legendary', venomBonus: 50, constrictBonus: 50, value: 8000, description: 'Pure essence of the Nile flood itself. A single drop fertilizes an entire field.' },
  { id: 'mat_apophis_venom', name: "Apophis's Venom", emoji: '🕳️', type: 'venom', rarity: 'legendary', venomBonus: 120, constrictBonus: 30, value: 10000, description: 'The most toxic substance in existence. Even its container corrodes over time.' },
  { id: 'mat_osiris_bone', name: 'Osiris Wraith Bone', emoji: '⚰️', type: 'bone', rarity: 'legendary', venomBonus: 60, constrictBonus: 80, value: 9000, description: 'A bone from the serpent that walks between life and death. It pulses with dark energy.' },
  { id: 'mat_phoenix_feather', name: 'Phoenix Feather Scale', emoji: '🪶', type: 'relic_shard', rarity: 'legendary', venomBonus: 40, constrictBonus: 40, value: 12000, description: 'A scale that is also a phoenix feather. It can resurrect a fallen serpent once.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: SN_STRUCTURES — 25 Temple Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const SN_STRUCTURES: readonly SNStructureDef[] = [
  // ── Serpent Pits (7) ───────────────────────────────────────────
  { id: 'str_reed_pit', name: 'Reed Serpent Pit', emoji: '🕳️', category: 'serpent_pit', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A simple pit lined with papyrus reeds for housing common water serpents.' },
  { id: 'str_sand_burrow', name: 'Sand Burrow Complex', emoji: '🏜️', category: 'serpent_pit', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'An underground network of tunnels for desert serpent habitation.' },
  { id: 'str_venom_den', name: 'Venom Den', emoji: '🐍', category: 'serpent_pit', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'A reinforced pit with venom-resistant walls for housing toxic serpents.' },
  { id: 'str_shadow_crypt', name: 'Shadow Crypt', emoji: '💀', category: 'serpent_pit', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'A sealed chamber beneath the temple where shadow serpents thrive in darkness.' },
  { id: 'str_sun_garden', name: 'Solar Garden Pit', emoji: '☀️', category: 'serpent_pit', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'An open-air pit bathed in sunlight for sun serpent health and growth.' },
  { id: 'str_moon_pool', name: 'Lunar Pool Pit', emoji: '🌙', category: 'serpent_pit', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A reflective pool pit where moon serpents bathe in moonlight.' },
  { id: 'str_forge_cavern', name: 'Fire Forge Cavern', emoji: '🔥', category: 'serpent_pit', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'A volcanic cavern where fire serpents can safely nest and molt.' },

  // ── Healing Pools (6) ──────────────────────────────────────────
  { id: 'str_nile_pool', name: 'Nile Healing Pool', emoji: '💧', category: 'healing_pool', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A pool fed by Nile water that restores serpent health and mood.' },
  { id: 'str_holy_oasis', name: 'Sacred Oasis', emoji: '🌿', category: 'healing_pool', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'An enchanted oasis that heals all serpent ailments and boosts mood.' },
  { id: 'str_scarab_bath', name: 'Scarab Regeneration Bath', emoji: '🪲', category: 'healing_pool', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A bath infused with scarab essence that accelerates serpent regeneration.' },
  { id: 'str_isis_well', name: 'Well of Isis', emoji: '🙏', category: 'healing_pool', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A blessed well that can fully restore even legendary serpents to peak condition.' },
  { id: 'str_solar_sanctum', name: 'Solar Rejuvenation Sanctum', emoji: '🌟', category: 'healing_pool', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A sun-drenched chamber that permanently enhances serpent vitality each visit.' },
  { id: 'str_lunar_spring', name: 'Moonlight Spring', emoji: '💎', category: 'healing_pool', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'A spring that glows with moonlight. Serpents that drink from it gain prophetic abilities.' },

  // ── Venom Labs (5) ────────────────────────────────────────────
  { id: 'str_basic_lab', name: 'Basic Venom Lab', emoji: '🧪', category: 'venom_lab', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A simple workstation for extracting and storing common serpent venom.' },
  { id: 'str_alchemy_bench', name: 'Alchemy Bench', emoji: '⚗️', category: 'venom_lab', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'An advanced alchemy station for combining venoms with materials.' },
  { id: 'str_canopic_vault', name: 'Canopic Venom Vault', emoji: '🏺', category: 'venom_lab', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A climate-controlled vault that preserves venom potency indefinitely.' },
  { id: 'str_pure_extraction', name: 'Pure Extraction Chamber', emoji: '🔬', category: 'venom_lab', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A magical chamber that extracts pure essence from any venom sample.' },
  { id: 'str_chaos_crucible', name: 'Chaos Crucible', emoji: '🌋', category: 'venom_lab', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate venom laboratory. Can synthesize legendary-grade venoms from raw materials.' },

  // ── Sand Altars (4) ───────────────────────────────────────────
  { id: 'str_dune_altar', name: 'Dune Altar', emoji: '🏛️', category: 'sand_altar', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A stone altar in the desert that amplifies sand serpent abilities.' },
  { id: 'str_sphinx_shrine', name: 'Sphinx Shrine', emoji: '🦁', category: 'sand_altar', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'A shrine near the Sphinx that grants wisdom and insight to serpent handlers.' },
  { id: 'str_obelisk', name: 'Ritual Obelisk', emoji: '🔺', category: 'sand_altar', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A towering obelisk that channels solar energy and boosts all serpent powers.' },
  { id: 'str_temple_mount', name: 'Temple Mount Altar', emoji: '👑', category: 'sand_altar', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'The highest altar, placed at the summit of the temple mount. All blessings are amplified here.' },

  // ── Relic Shrines (3) ─────────────────────────────────────────
  { id: 'str_relic_case', name: 'Relic Display Case', emoji: '🖼️', category: 'relic_shrine', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A glass case for displaying serpent relics and boosting their passive effects.' },
  { id: 'str_sacred_vault', name: 'Sacred Relic Vault', emoji: '🔒', category: 'relic_shrine', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A magically sealed vault that preserves and amplifies the power of stored relics.' },
  { id: 'str_phoenix_shrine', name: 'Phoenix Shrine', emoji: '🔥', category: 'relic_shrine', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'A shrine blessed by Bennu that can restore and even upgrade relics placed within it.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: SN_ABILITIES — 22 Serpent Abilities
// ═══════════════════════════════════════════════════════════════════

export const SN_ABILITIES: readonly SNAbilityDef[] = [
  { id: 'ab_constrict', name: 'Constrict', emoji: '🐍', element: 'water', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Wrap around the target and squeeze with crushing force.' },
  { id: 'ab_venom_spit', name: 'Venom Spit', emoji: '🤮', element: 'venom', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Spit a stream of venom at a distant target.' },
  { id: 'ab_sand_burrow', name: 'Sand Burrow', emoji: '🏜️', element: 'sand', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 10, description: 'Burrow beneath the sand and emerge behind the target.' },
  { id: 'ab_shadow_blend', name: 'Shadow Blend', emoji: '👻', element: 'shadow', type: 'active', rarity: 'common', energyCost: 12, cooldown: 90, power: 5, description: 'Become nearly invisible in darkened areas for a short duration.' },
  { id: 'ab_solar_glow', name: 'Solar Glow', emoji: '☀️', element: 'sun', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Emit a blinding burst of golden light that stuns nearby threats.' },
  { id: 'ab_moon_shimmer', name: 'Moon Shimmer', emoji: '🌙', element: 'moon', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 10, description: 'Create shimmering moonlight illusions that confuse enemies.' },
  { id: 'ab_fire_fang', name: 'Fire Fang', emoji: '🔥', element: 'fire', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 18, description: 'Bite with fangs that ignite venom on contact.' },
  { id: 'ab_water_surge', name: 'Water Surge', emoji: '🌊', element: 'water', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Summon a surge of Nile water to sweep away enemies.' },
  { id: 'ab_neuro_venom', name: 'Neuro Venom', emoji: '🧠', element: 'venom', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 90, power: 35, description: 'Inject potent neurotoxin that paralyzes the target.' },
  { id: 'ab_sand_vortex', name: 'Sand Vortex', emoji: '🌪️', element: 'sand', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Create a whirling vortex of sand that damages and blinds.' },
  { id: 'ab_dark_constrict', name: 'Dark Constrict', emoji: '🕳️', element: 'shadow', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 100, power: 32, description: 'Constrict the target while draining their life force.' },
  { id: 'ab_radiant_hood', name: 'Radiant Hood', emoji: '👑', element: 'sun', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 25, description: 'Spread your hood wide and emit searing light that damages undead.' },
  { id: 'ab_lunar_charm', name: 'Lunar Charm', emoji: '✨', element: 'moon', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 80, power: 22, description: 'Mesmerize a target with hypnotic moonlight patterns.' },
  { id: 'ab_flame_hood', name: 'Flame Hood', emoji: '🔥', element: 'fire', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 55, power: 30, description: 'Spread your hood and engulf it in protective flame.' },
  { id: 'ab_tidal_coil', name: 'Tidal Coil', emoji: '🌊', element: 'water', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Summon a massive wave while coiling for devastating combo damage.' },
  { id: 'ab_plague_mist', name: 'Plague Mist', emoji: '☠️', element: 'venom', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Release a cloud of plague venom that damages everything in an area.' },
  { id: 'ab_golden_coil', name: 'Golden Coil', emoji: '✨', element: 'sand', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 110, power: 45, description: 'Wrap targets in coils of enchanted golden sand that hardens like stone.' },
  { id: 'ab_death_sense', name: 'Death Sense', emoji: '💀', element: 'shadow', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Sense nearby danger and detect traps automatically.' },
  { id: 'ab_phoenix_flame', name: 'Phoenix Flame', emoji: '🌟', element: 'sun', type: 'active', rarity: 'rare', energyCost: 40, cooldown: 180, power: 60, description: 'Ignite yourself in phoenix fire, damaging nearby enemies and healing allies.' },
  { id: 'ab_dream_weave', name: 'Dream Weave', emoji: '💭', element: 'moon', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 120, power: 40, description: 'Put a target into a deep sleep filled with revealing visions.' },
  { id: 'ab_leviathan_maw', name: 'Leviathan Maw', emoji: '🐲', element: 'water', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Open a massive maw that creates a whirlpool, swallowing everything nearby.' },
  { id: 'ab_chaos_venom', name: 'Chaos Venom', emoji: '🌀', element: 'venom', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'Inject the primordial venom of Apophis itself. Nothing can survive it.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: SN_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const SN_ACHIEVEMENTS: readonly SNAchievementDef[] = [
  { id: 'ach_first_tame', name: 'First Taming', emoji: '🐍', description: 'Tame your first serpent.', condition: 'tame_1', reward: { gold: 50, renown: 10 } },
  { id: 'ach_five_tamed', name: 'Handler\'s Hand', emoji: '🤚', description: 'Tame 5 different serpents.', condition: 'tame_5', reward: { gold: 200, renown: 40 } },
  { id: 'ach_first_harvest', name: 'Venom Collector', emoji: '💧', description: 'Harvest venom for the first time.', condition: 'harvest_1', reward: { gold: 80, renown: 15 } },
  { id: 'ach_ten_harvests', name: 'Master Extractor', emoji: '⚗️', description: 'Harvest venom 10 times.', condition: 'harvest_10', reward: { gold: 300, renown: 60 } },
  { id: 'ach_first_build', name: 'Groundbreaking', emoji: '🏗️', description: 'Build your first temple structure.', condition: 'build_1', reward: { gold: 100, renown: 20 } },
  { id: 'ach_five_builds', name: 'Temple Architect', emoji: '🏛️', description: 'Build 5 different temple structures.', condition: 'build_5', reward: { gold: 500, renown: 80 } },
  { id: 'ach_zone_explore', name: 'Explorer', emoji: '🗺️', description: 'Explore 4 different Nile zones.', condition: 'zone_4', reward: { gold: 400, renown: 50 } },
  { id: 'ach_all_zones', name: 'Nile Cartographer', emoji: '🌍', description: 'Explore all 8 Nile zones.', condition: 'zone_8', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_rare_tame', name: 'Rare Catch', emoji: '💎', description: 'Tame a rare serpent.', condition: 'rare_tame', reward: { gold: 500, renown: 100 } },
  { id: 'ach_epic_tame', name: 'Epic Discovery', emoji: '🌟', description: 'Tame an epic serpent.', condition: 'epic_tame', reward: { gold: 1500, renown: 250 } },
  { id: 'ach_legendary_tame', name: 'Legendary Handler', emoji: '👑', description: 'Tame a legendary serpent.', condition: 'legendary_tame', reward: { gold: 5000, renown: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first relic.', condition: 'relic_1', reward: { gold: 300, renown: 60 } },
  { id: 'ach_five_relics', name: 'Relic Hunter', emoji: '🔍', description: 'Collect 5 different relics.', condition: 'relic_5', reward: { gold: 1000, renown: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first Nile event.', condition: 'event_1', reward: { gold: 200, renown: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 Nile events.', condition: 'event_10', reward: { gold: 800, renown: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_all_elements', name: 'Elemental Master', emoji: '🌈', description: 'Tame at least one serpent of each element.', condition: 'all_elements', reward: { gold: 3000, renown: 300 } },
  { id: 'ach_max_renown', name: 'Serpent Pharaoh', emoji: '👑', description: 'Reach the title of Serpent Pharaoh.', condition: 'max_title', reward: { gold: 10000, renown: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: SN_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const SN_TITLES: readonly SNTitleDef[] = [
  { id: 'title_fledgling', name: 'Fledgling Handler', emoji: '🐣', minRenown: 0, minSerpents: 0, description: 'A novice who has just begun their journey with serpents.' },
  { id: 'title_handler', name: 'Serpent Handler', emoji: '🐍', minRenown: 50, minSerpents: 3, description: 'A competent handler who can tame and care for common serpents.' },
  { id: 'title_charmer', name: 'Serpent Charmer', emoji: '🎵', minRenown: 200, minSerpents: 7, description: 'A skilled charmer whose music can calm the most agitated serpents.' },
  { id: 'title_venom_master', name: 'Venom Master', emoji: '⚗️', minRenown: 500, minSerpents: 12, description: 'An expert in venom extraction who commands respect across the Nile.' },
  { id: 'title_temple_guardian', name: 'Temple Guardian', emoji: '🏛️', minRenown: 1200, minSerpents: 18, description: 'A guardian of the sacred temples, trusted with the rarest serpents.' },
  { id: 'title_nile_sovereign', name: 'Nile Sovereign', emoji: '🌊', minRenown: 2500, minSerpents: 24, description: 'A ruler of the Nile serpent kingdom, commanding legions of serpents.' },
  { id: 'title_serpent_lord', name: 'Serpent Lord', emoji: '🐲', minRenown: 5000, minSerpents: 30, description: 'A legendary serpent lord whose power is feared and revered.' },
  { id: 'title_serpent_pharaoh', name: 'Serpent Pharaoh', emoji: '👑', minRenown: 10000, minSerpents: 35, description: 'The supreme Serpent Pharaoh, master of all serpents and guardian of the Nile.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: SN_RELICS — 15 Legendary Serpent Relics
// ═══════════════════════════════════════════════════════════════════

export const SN_RELICS: readonly SNRelicDef[] = [
  { id: 'relic_crown_cobras', name: 'Crown of Cobras', emoji: '👑', rarity: 'epic', element: 'sun', venomBoost: 20, constrictBoost: 15, speedBoost: 10, value: 2000, description: 'A golden crown shaped like seven cobras. It radiates authority over all serpents.' },
  { id: 'relic_staff_asps', name: 'Staff of Asps', emoji: '🪄', rarity: 'epic', element: 'venom', venomBoost: 35, constrictBoost: 5, speedBoost: 5, value: 2200, description: 'A staff topped with two asps. Its touch magnifies venom potency tenfold.' },
  { id: 'relic_nile_amulet', name: 'Nile Amulet', emoji: '📿', rarity: 'rare', element: 'water', venomBoost: 10, constrictBoost: 10, speedBoost: 15, value: 800, description: 'An amulet containing a drop of the Nile. It grants serpents uncanny speed.' },
  { id: 'relic_scarab_ring', name: 'Scarab Ring', emoji: '💍', rarity: 'rare', element: 'sand', venomBoost: 5, constrictBoost: 20, speedBoost: 10, value: 750, description: 'A ring bearing a carved scarab. It hardens serpent scales like desert stone.' },
  { id: 'relic_anubis_mask', name: 'Anubis Mask', emoji: '🎭', rarity: 'epic', element: 'shadow', venomBoost: 25, constrictBoost: 20, speedBoost: 15, value: 2500, description: 'A mask of Anubis that grants shadow serpents the power of invisibility.' },
  { id: 'relic_isis_veil', name: 'Veil of Isis', emoji: '🪶', rarity: 'epic', element: 'moon', venomBoost: 15, constrictBoost: 15, speedBoost: 25, value: 2400, description: 'A shimmering veil blessed by Isis. It protects serpents from all curses.' },
  { id: 'relic_ptah_hammer', name: 'Ptah\'s Hammer', emoji: '🔨', rarity: 'epic', element: 'fire', venomBoost: 20, constrictBoost: 25, speedBoost: 10, value: 2600, description: 'A small hammer forged by Ptah. It can repair and strengthen serpent scales.' },
  { id: 'relic_wadjet_eye', name: 'Eye of Wadjet', emoji: '👁️', rarity: 'legendary', element: 'sun', venomBoost: 40, constrictBoost: 30, speedBoost: 20, value: 8000, description: 'The divine Eye of Wadjet, protector of the pharaohs. It sees all threats.' },
  { id: 'relic_sphinx_sphinx', name: 'Sphinx Stone', emoji: '🗿', rarity: 'legendary', element: 'sand', venomBoost: 30, constrictBoost: 40, speedBoost: 15, value: 7500, description: 'A stone from the Great Sphinx itself. It grants ancient wisdom to serpents.' },
  { id: 'relic_apophis_fang', name: 'Fang of Apophis', emoji: '🗡️', rarity: 'legendary', element: 'venom', venomBoost: 60, constrictBoost: 20, speedBoost: 20, value: 10000, description: 'The actual fang of Apophis, the chaos serpent. Its venom is limitless.' },
  { id: 'relic_hapi_vessel', name: 'Hapi\'s Vessel', emoji: '🏺', rarity: 'legendary', element: 'water', venomBoost: 25, constrictBoost: 35, speedBoost: 30, value: 9000, description: 'A vessel that never empties, filled with sacred Nile water. Infinite healing.' },
  { id: 'relic_osiris_scepter', name: 'Osiris Scepter', emoji: '⚜️', rarity: 'legendary', element: 'shadow', venomBoost: 35, constrictBoost: 35, speedBoost: 25, value: 9500, description: 'The scepter of Osiris, lord of the underworld. It commands life and death.' },
  { id: 'relic_thoth_scroll', name: 'Scroll of Thoth', emoji: '📜', rarity: 'epic', element: 'moon', venomBoost: 20, constrictBoost: 15, speedBoost: 30, value: 2300, description: 'A fragment of the Book of Thoth. It enhances serpent intelligence.' },
  { id: 'relic_sekmet_claw', name: 'Claw of Sekhmet', emoji: '🦁', rarity: 'legendary', element: 'fire', venomBoost: 50, constrictBoost: 45, speedBoost: 25, value: 11000, description: 'The fiery claw of the lioness goddess. It makes serpents fearless in battle.' },
  { id: 'relic_phoenix_egg', name: 'Phoenix Egg', emoji: '🥚', rarity: 'legendary', element: 'sun', venomBoost: 30, constrictBoost: 30, speedBoost: 40, value: 12000, description: 'An eternal phoenix egg. If a serpent falls, it will be reborn from its shell.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: SN_EVENTS — 12 Nile Events
// ═══════════════════════════════════════════════════════════════════

export const SN_EVENTS: readonly SNEventDef[] = [
  { id: 'evt_flood_season', name: 'Flood Season', emoji: '🌊', durationTurns: 5, effectType: 'buff', effectDescription: 'Water serpent power doubled. All zones accessible.', description: 'The annual Nile flood brings abundance and danger in equal measure.' },
  { id: 'evt_sandstorm', name: 'Great Sandstorm', emoji: '🌪️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Speed reduced by 30%. Sand serpents immune.', description: 'A massive sandstorm engulfs the land, reducing visibility and movement.' },
  { id: 'evt_mummy_awakening', name: 'Mummy Awakening', emoji: '⚰️', durationTurns: 4, effectType: 'special', effectDescription: 'Shadow serpents gain +50 power. Rare materials appear.', description: 'Ancient mummies rise from their tombs, disturbing the shadow serpents within.' },
  { id: 'evt_solar_eclipse', name: 'Solar Eclipse', emoji: '🌑', durationTurns: 2, effectType: 'special', effectDescription: 'Moon serpents triple power. Sun serpents halved.', description: 'The sun is devoured. Shadow and moon serpents surge in power.' },
  { id: 'evt_scorpion_plague', name: 'Scorpion Plague', emoji: '🦂', durationTurns: 3, effectType: 'debuff', effectDescription: 'Venom serpents lose 25% power. Antidotes available.', description: 'A swarm of venomous scorpions overwhelms the region, competing with serpents.' },
  { id: 'evt_golden_dawn', name: 'Golden Dawn', emoji: '🌅', durationTurns: 5, effectType: 'buff', effectDescription: 'Gold rewards doubled. Sun serpents gain +30% power.', description: 'The dawn sky turns golden, signifying a day of exceptional fortune.' },
  { id: 'evt_lunar_festival', name: 'Lunar Festival', emoji: '🎑', durationTurns: 4, effectType: 'buff', effectDescription: 'All serpents gain +20% mood. Moon serpents enhanced.', description: 'A sacred festival honoring Khonsu. Serpents are unusually calm and cooperative.' },
  { id: 'evt_temple_robbery', name: 'Temple Robbery', emoji: '🏃', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% gold. Relic chance increased.', description: 'Tomb robbers raid the temple vaults! But they leave something behind...' },
  { id: 'evt_phoenix_rising', name: 'Phoenix Rising', emoji: '🔥', durationTurns: 3, effectType: 'buff', effectDescription: 'Fire serpents resurrect once. All healing doubled.', description: 'A phoenix rises from the temple flames, blessing all fire serpents with rebirth.' },
  { id: 'evt_nile_drought', name: 'Nile Drought', emoji: '☀️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Water serpent power halved. Sand serpents thrive.', description: 'The Nile runs low. Water serpents suffer while desert serpents flourish.' },
  { id: 'evt_hieroglyph_madness', name: 'Hieroglyph Madness', emoji: '🔤', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus renown for each exploration. Puzzle rewards doubled.', description: 'The temple walls come alive with shifting hieroglyphs that contain secrets.' },
  { id: 'evt_serpent_migration', name: 'Great Serpent Migration', emoji: '🐍', durationTurns: 6, effectType: 'buff', effectDescription: 'Taming chance doubled. New serpent species appear.', description: 'Thousands of serpents migrate along the Nile. The perfect time to tame new ones.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const SN_MAX_SERPENT_LEVEL = 50
const SN_MAX_STRUCTURE_LEVEL = 10
const SN_INITIAL_GOLD = 200
const SN_INITIAL_RENOWN = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function snXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function snCalcStats(species: SNSerpentSpecies, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    venomPower: Math.floor(species.venomPower * growth),
    constrictPower: Math.floor(species.constrictPower * growth),
    speed: Math.floor(species.speed * growth),
  }
}

let _snIdCounter = 0
function snGenerateId(): string {
  _snIdCounter += 1
  return `sn_${_snIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function snFindSpecies(id: string): SNSerpentSpecies | undefined {
  return SN_SERPENTS.find((s) => s.id === id)
}

function snFindZone(id: string): SNZoneDef | undefined {
  return SN_TEMPLES.find((z) => z.id === id)
}

function snFindMaterial(id: string): SNMaterialDef | undefined {
  return SN_MATERIALS.find((m) => m.id === id)
}

function snFindStructureDef(id: string): SNStructureDef | undefined {
  return SN_STRUCTURES.find((s) => s.id === id)
}

function snFindAbility(id: string): SNAbilityDef | undefined {
  return SN_ABILITIES.find((a) => a.id === id)
}

function snFindRelic(id: string): SNRelicDef | undefined {
  return SN_RELICS.find((r) => r.id === id)
}

function snFindAchievement(id: string): SNAchievementDef | undefined {
  return SN_ACHIEVEMENTS.find((a) => a.id === id)
}

function snFindTitle(id: SNTitleId): SNTitleDef | undefined {
  return SN_TITLES.find((t) => t.id === id)
}

function snRarityMultiplier(rarity: SNRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function snRarityColor(rarity: SNRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function snElementColor(element: SNElement): string {
  switch (element) {
    case 'water': return SN_NILE_BLUE
    case 'sand': return SN_DESERT_SAND
    case 'venom': return SN_SCARLET_RED
    case 'shadow': return SN_MIDNIGHT_BLACK
    case 'sun': return SN_GOLD
    case 'moon': return SN_TURQUOISE
    case 'fire': return SN_SERPENT_GREEN
    default: return '#888888'
  }
}

export function snCheckSynergy(attacker: SNElement, defender: SNElement): number {
  const advantages = SN_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = SN_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function snCalcStructureUpgradeCost(def: SNStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function snCalcMaxTitle(renown: number, serpentCount: number): SNTitleId {
  let bestId: SNTitleId = 'title_fledgling'
  for (const title of SN_TITLES) {
    if (renown >= title.minRenown && serpentCount >= title.minSerpents) {
      bestId = title.id
    }
  }
  return bestId
}

function snCheckAchievementCondition(
  condition: string,
  state: SNStoreState
): boolean {
  switch (condition) {
    case 'tame_1':
      return state.totalTamed >= 1
    case 'tame_5':
      return state.totalTamed >= 5
    case 'harvest_1':
      return state.totalHarvested >= 1
    case 'harvest_10':
      return state.totalHarvested >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'zone_4':
      return state.zones.length >= 4
    case 'zone_8':
      return state.zones.length >= 8
    case 'rare_tame':
      return state.serpents.some((s) => {
        const sp = snFindSpecies(s.speciesId)
        return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'epic_tame':
      return state.serpents.some((s) => {
        const sp = snFindSpecies(s.speciesId)
        return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'legendary_tame':
      return state.serpents.some((s) => {
        const sp = snFindSpecies(s.speciesId)
        return sp && sp.rarity === 'legendary'
      })
    case 'relic_1':
      return state.relics.length >= 1
    case 'relic_5':
      return state.relics.length >= 5
    case 'event_1':
      return state.totalEventsFaced >= 1
    case 'event_10':
      return state.totalEventsFaced >= 10
    case 'upgrade_10':
      return state.structures.some((s) => s.level >= 10)
    case 'all_elements': {
      const elements = new Set<SNElement>()
      for (const s of state.serpents) {
        const sp = snFindSpecies(s.speciesId)
        if (sp) elements.add(sp.element)
      }
      return elements.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_serpent_pharaoh'
    default:
      return false
  }
}

function snPickRandomEvent(): SNEventDef {
  const idx = Math.floor(Math.random() * SN_EVENTS.length)
  return SN_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useSNStore = create<SNFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      serpents: [] as SNSerpentInstance[],
      zones: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as SNStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_fledgling' as SNTitleId,
      gold: SN_INITIAL_GOLD,
      renown: SN_INITIAL_RENOWN,
      totalTamed: 0,
      totalHarvested: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as SNEventDef | null,
      eventTurnsRemaining: 0,
      activeZone: null as string | null,

      // ── snTameSerpent ──────────────────────────────────────────
      snTameSerpent: (speciesId: string): boolean => {
        const species = snFindSpecies(speciesId)
        if (!species) return false
        const cost = Math.floor(50 * snRarityMultiplier(species.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = snCalcStats(species, 1)
        const newSerpent: SNSerpentInstance = {
          id: snGenerateId(),
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          venomPower: stats.venomPower,
          constrictPower: stats.constrictPower,
          speed: stats.speed,
          mood: 80,
          hunger: 70,
          tamedAt: Date.now(),
        }
        set((prev) => {
          const updated = {
            serpents: [...prev.serpents, newSerpent],
            gold: prev.gold - cost,
            totalTamed: prev.totalTamed + 1,
            renown: prev.renown + snRarityMultiplier(species.rarity) * 5,
            currentTitle: snCalcMaxTitle(
              prev.renown + snRarityMultiplier(species.rarity) * 5,
              prev.serpents.length + 1
            ),
          }
          return updated
        })
        return true
      },

      // ── snReleaseSerpent ───────────────────────────────────────
      snReleaseSerpent: (serpentId: string): boolean => {
        const state = get()
        const exists = state.serpents.find((s) => s.id === serpentId)
        if (!exists) return false
        const species = snFindSpecies(exists.speciesId)
        const refund = species ? Math.floor(25 * snRarityMultiplier(species.rarity)) : 10
        set((prev) => ({
          serpents: prev.serpents.filter((s) => s.id !== serpentId),
          gold: prev.gold + refund,
          currentTitle: snCalcMaxTitle(prev.renown, prev.serpents.length - 1),
        }))
        return true
      },

      // ── snFeedSerpent ──────────────────────────────────────────
      snFeedSerpent: (serpentId: string): boolean => {
        const feedCost = 10
        const state = get()
        if (state.gold < feedCost) return false
        set((prev) => {
          const serpents = prev.serpents.map((s) => {
            if (s.id !== serpentId) return s
            const newXp = s.xp + 20
            const xpNeeded = snXpForLevel(s.level)
            let newLevel = s.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && s.level < SN_MAX_SERPENT_LEVEL) {
              newLevel = s.level + 1
              currentXp = newXp - xpNeeded
            }
            const species = snFindSpecies(s.speciesId)
            const stats = species ? snCalcStats(species, newLevel) : { venomPower: s.venomPower, constrictPower: s.constrictPower, speed: s.speed }
            return {
              ...s,
              level: newLevel,
              xp: currentXp,
              venomPower: stats.venomPower,
              constrictPower: stats.constrictPower,
              speed: stats.speed,
              mood: Math.min(100, s.mood + 10),
              hunger: Math.min(100, s.hunger + 20),
            }
          })
          return { serpents, gold: prev.gold - feedCost, renown: prev.renown + 2 }
        })
        return true
      },

      // ── snHarvestVenom ────────────────────────────────────────
      snHarvestVenom: (serpentId: string): boolean => {
        const state = get()
        const serpent = state.serpents.find((s) => s.id === serpentId)
        if (!serpent) return false
        if (serpent.hunger < 20) return false
        const species = snFindSpecies(serpent.speciesId)
        if (!species) return false
        const materialId = `mat_${species.element}_${species.rarity}_venom`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(serpent.venomPower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalHarvested: prev.totalHarvested + 1,
          renown: prev.renown + 3,
          serpents: prev.serpents.map((s) =>
            s.id === serpentId ? { ...s, hunger: Math.max(0, s.hunger - 20) } : s
          ),
        }))
        return true
      },

      // ── snBuildStructure ──────────────────────────────────────
      snBuildStructure: (structureDefId: string): boolean => {
        const def = snFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: SNStructureInstance = {
          id: snGenerateId(),
          structureDefId,
          level: 1,
          builtAt: Date.now(),
        }
        set((prev) => ({
          structures: [...prev.structures, newStructure],
          gold: prev.gold - def.baseCost,
          totalBuilt: prev.totalBuilt + 1,
          renown: prev.renown + 10,
        }))
        return true
      },

      // ── snUpgradeStructure ────────────────────────────────────
      snUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= SN_MAX_STRUCTURE_LEVEL) return false
        const def = snFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = snCalcStructureUpgradeCost(def, structure.level)
        if (state.gold < cost) return false
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === structureId ? { ...s, level: s.level + 1 } : s
          ),
          gold: prev.gold - cost,
          renown: prev.renown + Math.floor(def.effectPerLevel * 2),
        }))
        return true
      },

      // ── snExploreZone ─────────────────────────────────────────
      snExploreZone: (zoneId: string): SNEventDef | null => {
        const zone = snFindZone(zoneId)
        if (!zone) return null
        const state = get()
        const requiredTitleIdx = SN_TITLES.findIndex((t) => t.id === zone.requiredTitle)
        const currentTitleIdx = SN_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newZones = state.zones.includes(zoneId) ? state.zones : [...state.zones, zoneId]
        const event = snPickRandomEvent()
        set((prev) => ({
          zones: newZones,
          activeZone: zoneId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          renown: prev.renown + 5,
        }))
        return event
      },

      // ── snCollectRelic ────────────────────────────────────────
      snCollectRelic: (relicId: string): boolean => {
        const relic = snFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => ({
          relics: [...prev.relics, relicId],
          renown: prev.renown + Math.floor(snRarityMultiplier(relic.rarity) * 20),
          currentTitle: snCalcMaxTitle(
            prev.renown + Math.floor(snRarityMultiplier(relic.rarity) * 20),
            prev.serpents.length
          ),
        }))
        return true
      },

      // ── snUnlockAbility ───────────────────────────────────────
      snUnlockAbility: (abilityId: string): boolean => {
        const ability = snFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * snRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── snUnlockTitle ─────────────────────────────────────────
      snUnlockTitle: (titleId: SNTitleId): boolean => {
        const title = snFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.renown < title.minRenown) return false
        if (state.serpents.length < title.minSerpents) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── snClaimAchievement ────────────────────────────────────
      snClaimAchievement: (achievementId: string): boolean => {
        const achievement = snFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!snCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + achievement.reward.gold,
          renown: prev.renown + achievement.reward.renown,
          currentTitle: snCalcMaxTitle(
            prev.renown + achievement.reward.renown,
            prev.serpents.length
          ),
        }))
        return true
      },

      // ── snTradeMaterial ───────────────────────────────────────
      snTradeMaterial: (materialId: string, count: number): number => {
        const material = snFindMaterial(materialId)
        if (!material) return 0
        const state = get()
        const owned = state.materials.find((m) => m.materialId === materialId)
        if (!owned || owned.count < count) return 0
        const goldEarned = material.value * count
        set((prev) => ({
          materials:
            owned.count - count <= 0
              ? prev.materials.filter((m) => m.materialId !== materialId)
              : prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count - count } : m)),
          gold: prev.gold + goldEarned,
        }))
        return goldEarned
      },

      // ── snEndEvent ────────────────────────────────────────────
      snEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── snResetEvent ──────────────────────────────────────────
      snResetEvent: () => {
        const event = snPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'serpent-nile-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useSerpentNile()
// ═══════════════════════════════════════════════════════════════════

export default function useSerpentNile() {
  const store = useSNStore()

  // ── Computed: Owned serpents with species info ────────────────
  const snOwnedSerpents = useMemo(() => {
    return store.serpents.map((s) => {
      const species = snFindSpecies(s.speciesId)
      return {
        ...s,
        species,
        elementColor: species ? snElementColor(species.element) : '#888888',
        rarityColor: species ? snRarityColor(species.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available serpent species to tame ───────────────
  const snAvailableSpecies = useMemo(() => {
    return SN_SERPENTS.filter((sp) => {
      const cost = Math.floor(50 * snRarityMultiplier(sp.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ───────────────────────────
  const snCurrentTitleDetail = useMemo(() => {
    return snFindTitle(store.currentTitle) ?? SN_TITLES[0]
  }, [store])

  // ── Computed: Next title info ─────────────────────────────────
  const snNextTitle = useMemo(() => {
    const currentIdx = SN_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= SN_TITLES.length - 1) return null
    return SN_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active zone details ─────────────────────────────
  const snActiveZoneDetail = useMemo(() => {
    if (!store.activeZone) return null
    return snFindZone(store.activeZone) ?? null
  }, [store])

  // ── Computed: Unexplored zones ────────────────────────────────
  const snUnexploredZones = useMemo(() => {
    return SN_TEMPLES.filter((z) => !store.zones.includes(z.id))
  }, [store])

  // ── Computed: Structures with defs ────────────────────────────
  const snBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = snFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ────────────────────────────
  const snUnlockableAbilities = useMemo(() => {
    return SN_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * snRarityMultiplier(a.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ──────────────────────────
  const snOwnedRelics = useMemo(() => {
    return store.relics.map((rId) => {
      const def = snFindRelic(rId)
      return def ?? null
    }).filter((r): r is SNRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────────
  const snUnclaimedAchievements = useMemo(() => {
    return SN_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return snCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ─────────────────────────────
  const snInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = snFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect bonus ────────────────────
  const snTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = snFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average serpent level ───────────────────────────
  const snAverageSerpentLevel = useMemo(() => {
    if (store.serpents.length === 0) return 0
    const total = store.serpents.reduce((sum, s) => sum + s.level, 0)
    return Math.floor(total / store.serpents.length)
  }, [store])

  // ── Computed: Total serpent power ─────────────────────────────
  const snTotalSerpentPower = useMemo(() => {
    return store.serpents.reduce(
      (sum, s) => sum + s.venomPower + s.constrictPower + s.speed,
      0
    )
  }, [store])

  // ── Computed: Element distribution ────────────────────────────
  const snElementDistribution = useMemo(() => {
    const counts: Record<SNElement, number> = {
      water: 0, sand: 0, venom: 0, shadow: 0, sun: 0, moon: 0, fire: 0,
    }
    for (const s of store.serpents) {
      const sp = snFindSpecies(s.speciesId)
      if (sp) counts[sp.element]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ─────────────────────────────
  const snRarityDistribution = useMemo(() => {
    const counts: Record<SNRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const s of store.serpents) {
      const sp = snFindSpecies(s.speciesId)
      if (sp) counts[sp.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Serpents by rarity ──────────────────────────────
  const snSerpentsByRarity = useMemo(() => {
    const groups: Record<SNRarity, SNSerpentInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const s of store.serpents) {
      const sp = snFindSpecies(s.speciesId)
      if (sp) groups[sp.rarity].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Serpents by element ─────────────────────────────
  const snSerpentsByElement = useMemo(() => {
    const groups: Record<SNElement, SNSerpentInstance[]> = {
      water: [], sand: [], venom: [], shadow: [], sun: [], moon: [], fire: [],
    }
    for (const s of store.serpents) {
      const sp = snFindSpecies(s.speciesId)
      if (sp) groups[sp.element].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ──────────────────────────
  const snTitleProgress = useMemo(() => {
    const next = snNextTitle
    if (!next) return { percent: 100, renownNeeded: 0, serpentsNeeded: 0 }
    const renownProgress = Math.min(100, (store.renown / next.minRenown) * 100)
    const serpentProgress = Math.min(100, (store.serpents.length / next.minSerpents) * 100)
    return {
      percent: Math.floor((renownProgress + serpentProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - store.renown),
      serpentsNeeded: Math.max(0, next.minSerpents - store.serpents.length),
    }
  }, [store, snNextTitle])

  // ── Computed: Rare materials count ────────────────────────────
  const snRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = snFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Hungry serpents ─────────────────────────────────
  const snHungrySerpents = useMemo(() => {
    return store.serpents.filter((s) => s.hunger < 30)
  }, [store])

  // ── Computed: Low mood serpents ───────────────────────────────
  const snUnhappySerpents = useMemo(() => {
    return store.serpents.filter((s) => s.mood < 30)
  }, [store])

  // ── Computed: Total relic boost ───────────────────────────────
  const snTotalRelicBoost = useMemo(() => {
    let venomBoost = 0
    let constrictBoost = 0
    let speedBoost = 0
    for (const rId of store.relics) {
      const relic = snFindRelic(rId)
      if (relic) {
        venomBoost += relic.venomBoost
        constrictBoost += relic.constrictBoost
        speedBoost += relic.speedBoost
      }
    }
    return { venomBoost, constrictBoost, speedBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return snAPI object
  // ═════════════════════════════════════════════════════════════

  const snAPI = {
    // ── Direct constants ──────────────────────────────────────
    SN_NILE_BLUE,
    SN_DESERT_SAND,
    SN_SERPENT_GREEN,
    SN_GOLD,
    SN_MIDNIGHT_BLACK,
    SN_SCARLET_RED,
    SN_PAPYRUS,
    SN_TURQUOISE,
    SN_SERPENTS,
    SN_TEMPLES,
    SN_MATERIALS,
    SN_STRUCTURES,
    SN_ABILITIES,
    SN_ACHIEVEMENTS,
    SN_TITLES,
    SN_RELICS,
    SN_EVENTS,
    SN_ELEMENTS,
    snCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    serpents: store.serpents,
    zones: store.zones,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    gold: store.gold,
    renown: store.renown,
    totalTamed: store.totalTamed,
    totalHarvested: store.totalHarvested,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeZone: store.activeZone,

    // ── Store actions ─────────────────────────────────────────
    snTameSerpent: store.snTameSerpent,
    snReleaseSerpent: store.snReleaseSerpent,
    snFeedSerpent: store.snFeedSerpent,
    snHarvestVenom: store.snHarvestVenom,
    snBuildStructure: store.snBuildStructure,
    snUpgradeStructure: store.snUpgradeStructure,
    snExploreZone: store.snExploreZone,
    snCollectRelic: store.snCollectRelic,
    snUnlockAbility: store.snUnlockAbility,
    snUnlockTitle: store.snUnlockTitle,
    snClaimAchievement: store.snClaimAchievement,
    snTradeMaterial: store.snTradeMaterial,
    snEndEvent: store.snEndEvent,
    snResetEvent: store.snResetEvent,

    // ── Computed getters ──────────────────────────────────────
    snOwnedSerpents,
    snAvailableSpecies,
    snCurrentTitleDetail,
    snNextTitle,
    snActiveZoneDetail,
    snUnexploredZones,
    snBuiltStructures,
    snUnlockableAbilities,
    snOwnedRelics,
    snUnclaimedAchievements,
    snInventoryMaterials,
    snTotalStructureEffect,
    snAverageSerpentLevel,
    snTotalSerpentPower,
    snElementDistribution,
    snRarityDistribution,
    snSerpentsByRarity,
    snSerpentsByElement,
    snTitleProgress,
    snRareMaterialCount,
    snHungrySerpents,
    snUnhappySerpents,
    snTotalRelicBoost,
  }

  return snAPI
}
