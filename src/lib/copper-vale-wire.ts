'use client'

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// Copper Vale Wire — A dwarven mining kingdom management mini-game.
//
// Players recruit 35 vale dwarves across 7 forge disciplines,
// excavate 8 mine locations, collect 30 metal/gem materials,
// build 25 upgradable structures, unlock 22 abilities, earn
// 18 achievements, claim 8 titles, discover 15 artifacts,
// and face 12 vale events — backed by a Zustand store with
// persist middleware.
//
// Storage key: copper-vale-wire
// Prefix: cv / CV_
// ═══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// SECTION 1: TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────

export type CvDwarfType =
  | 'copper_smith'
  | 'gem_cutter'
  | 'tunnel_miner'
  | 'steam_mechanic'
  | 'ore_prospector'
  | 'anvil_hammer'
  | 'flux_alchemist'

export type CvRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type CvTitleId =
  | 'cv_title_pebble_chipper'
  | 'cv_title_copper_apprentice'
  | 'cv_title_iron_foreman'
  | 'cv_title_bronze_overseer'
  | 'cv_title_gold_chancellor'
  | 'cv_title_forge_lord'
  | 'cv_title_vale_sovereign'
  | 'cv_title_mountainheart'

export interface CvDwarfTypeDef {
  readonly id: CvDwarfType
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface CvDwarfSpecies {
  readonly id: string
  readonly name: string
  readonly dwarfType: CvDwarfType
  readonly rarity: CvRarity
  readonly miningPower: number
  readonly craftingPower: number
  readonly endurance: number
  readonly description: string
  readonly abilities: string[]
}

export interface CvDwarfInstance {
  readonly id: string
  readonly speciesId: string
  readonly name: string
  level: number
  xp: number
  miningPower: number
  craftingPower: number
  endurance: number
  morale: number
  recruitedAt: number
}

export interface CvMineDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly dangerLevel: number
  readonly requiredTitle: CvTitleId
  readonly primaryOre: CvDwarfType
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface CvMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'metal' | 'gem' | 'alloy' | 'crystal' | 'essence'
  readonly rarity: CvRarity
  readonly miningBonus: number
  readonly craftingBonus: number
  readonly value: number
  readonly description: string
}

export interface CvStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'barracks' | 'forge' | 'smelter' | 'storage' | 'tavern'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface CvStructureInstance {
  readonly id: string
  readonly structureDefId: string
  level: number
  builtAt: number
}

export interface CvAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly dwarfType: CvDwarfType
  readonly type: 'active' | 'passive'
  readonly rarity: CvRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface CvAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface CvTitleDef {
  readonly id: CvTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minDwarves: number
  readonly description: string
}

export interface CvArtifactDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: CvRarity
  readonly dwarfType: CvDwarfType
  readonly miningBoost: number
  readonly craftingBoost: number
  readonly enduranceBoost: number
  readonly value: number
  readonly description: string
}

export interface CvEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface CvStoreState {
  dwarves: CvDwarfInstance[]
  mines: string[]
  inventory: { materialId: string; count: number }[]
  artifacts: string[]
  achievements: string[]
  currentTitle: CvTitleId
  gold: number
  renown: number
  totalRecruited: number
  totalMined: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: CvEventDef | null
  eventTurnsRemaining: number
  activeMine: string | null
}

export interface CvStoreActions {
  recruitDwarf: (id: string) => boolean
  excavateMine: (id: string) => CvEventDef | null
  buildStructure: (id: string) => boolean
  activateArtifact: (id: string) => boolean
  triggerValeEvent: () => void
  resetCopperVale: () => void
}

export interface CvFullStore extends CvStoreState, CvStoreActions {}

// ─────────────────────────────────────────────────────────────────
// SECTION 2: COLOR THEME CONSTANTS
// ─────────────────────────────────────────────────────────────────

export const CV_COPPER: string = '#B87333'
export const CV_GOLD: string = '#FFD700'
export const CV_FORGE_ORANGE: string = '#FF8C00'
export const CV_STEEL: string = '#708090'
export const CV_DEEP_EARTH: string = '#3B2507'
export const CV_MOLTEN_RED: string = '#CC3300'
export const CV_JADE_VEIN: string = '#2E8B57'
export const CV_SHADOW_DARK: string = '#1C1C1C'

// ─────────────────────────────────────────────────────────────────
// SECTION 2b: RARITY DEFINITIONS
// ─────────────────────────────────────────────────────────────────

export const CV_RARITIES: readonly { id: CvRarity; name: string; color: string; weight: number }[] = [
  { id: 'common', name: 'Common', color: '#9ca3af', weight: 60 },
  { id: 'uncommon', name: 'Uncommon', color: '#34d399', weight: 25 },
  { id: 'rare', name: 'Rare', color: '#60a5fa', weight: 10 },
  { id: 'epic', name: 'Epic', color: '#a78bfa', weight: 4 },
  { id: 'legendary', name: 'Legendary', color: '#fbbf24', weight: 1 },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 3: CV_DWARF_TYPES — 7 Forge Disciplines
// ─────────────────────────────────────────────────────────────────

export const CV_DWARF_TYPES: readonly CvDwarfTypeDef[] = [
  {
    id: 'copper_smith',
    name: 'Copper Smith',
    color: CV_COPPER,
    description:
      'The oldest dwarven art. Copper smiths shape the warm metal into tools, weapons, and ornaments. Their hands are calloused from a lifetime at the anvil.',
  },
  {
    id: 'gem_cutter',
    name: 'Gem Cutter',
    color: CV_GOLD,
    description:
      'Gem cutters split rough stones into brilliant facets. They understand the inner light of every crystal and bring it forth with precision chisels.',
  },
  {
    id: 'tunnel_miner',
    name: 'Tunnel Miner',
    color: CV_STEEL,
    description:
      'Tunnel miners dig deep into the mountain heart. They read the stone like a book, knowing where veins of ore hide and where danger lurks.',
  },
  {
    id: 'steam_mechanic',
    name: 'Steam Mechanic',
    color: CV_FORGE_ORANGE,
    description:
      'Steam mechanics build and maintain the vale\'s pipes, valves, and engines. Their creations hiss with pressurized power and drive the mine carts.',
  },
  {
    id: 'ore_prospector',
    name: 'Ore Prospector',
    color: CV_MOLTEN_RED,
    description:
      'Ore prospectors wander the tunnels with lantern and pick, sniffing out hidden veins. They have an instinct for where the mountain\'s wealth sleeps.',
  },
  {
    id: 'anvil_hammer',
    name: 'Anvil Hammer',
    color: CV_COPPER,
    description:
      'Anvil hammers are the heavy hitters of the forge. They swing massive hammers that shape steel and fold alloys with earth-shaking force.',
  },
  {
    id: 'flux_alchemist',
    name: 'Flux Alchemist',
    color: CV_JADE_VEIN,
    description:
      'Flux alchemists blend rare minerals and arcane reagents to transmute base metals into precious ones. They unlock hidden properties in every material.',
  },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 4: DWARF TYPE SYNERGY TABLE
// ─────────────────────────────────────────────────────────────────

const CV_SYNERGY_MAP: Record<CvDwarfType, CvDwarfType[]> = {
  copper_smith: ['anvil_hammer', 'gem_cutter'],
  gem_cutter: ['copper_smith', 'flux_alchemist'],
  tunnel_miner: ['ore_prospector', 'steam_mechanic'],
  steam_mechanic: ['tunnel_miner', 'anvil_hammer'],
  ore_prospector: ['tunnel_miner', 'flux_alchemist'],
  anvil_hammer: ['steam_mechanic', 'copper_smith'],
  flux_alchemist: ['gem_cutter', 'ore_prospector'],
}

export function cvCheckSynergy(a: CvDwarfType, b: CvDwarfType): boolean {
  return CV_SYNERGY_MAP[a]?.includes(b) ?? false
}

// ─────────────────────────────────────────────────────────────────
// SECTION 5: CV_DWARVES — 35 Vale Dwarves (5 per type)
// ─────────────────────────────────────────────────────────────────

export const CV_DWARVES: readonly CvDwarfSpecies[] = [
  // ── Copper Smiths (5) ──────────────────────────────────────────
  {
    id: 'csm_wire_twirler',
    name: 'Wire Twirler',
    dwarfType: 'copper_smith',
    rarity: 'common',
    miningPower: 10,
    craftingPower: 14,
    endurance: 20,
    description:
      'A nimble-fingered apprentice who can twist copper wire into any shape. Eager to learn, quick to act.',
    abilities: ['basic_twist'],
  },
  {
    id: 'csm_sheet_beater',
    name: 'Sheet Beater',
    dwarfType: 'copper_smith',
    rarity: 'common',
    miningPower: 14,
    craftingPower: 18,
    endurance: 24,
    description:
      'Beats copper sheets flat with rhythmic precision. Their hammer sings a steady song on the anvil.',
    abilities: ['basic_twist', 'sheet_form'],
  },
  {
    id: 'csm_patina_master',
    name: 'Patina Master',
    dwarfType: 'copper_smith',
    rarity: 'uncommon',
    miningPower: 12,
    craftingPower: 30,
    endurance: 28,
    description:
      'Controls the oxidation of copper to create beautiful green patinas. Each piece is a work of living art.',
    abilities: ['basic_twist', 'patina_craft'],
  },
  {
    id: 'csm_vein_shaper',
    name: 'Vein Shaper',
    dwarfType: 'copper_smith',
    rarity: 'rare',
    miningPower: 40,
    craftingPower: 50,
    endurance: 35,
    description:
      'Can trace raw copper veins through solid rock and extract them without breaking a single crystal. Their hands see what eyes cannot.',
    abilities: ['basic_twist', 'sheet_form', 'patina_craft', 'vein_trace'],
  },
  {
    id: 'csm_copperheart',
    name: 'Copperheart',
    dwarfType: 'copper_smith',
    rarity: 'epic',
    miningPower: 60,
    craftingPower: 75,
    endurance: 40,
    description:
      'Legend says their heart beats with molten copper. They forge living weapons that warm to the wielder\'s touch and never rust.',
    abilities: ['basic_twist', 'sheet_form', 'patina_craft', 'vein_trace', 'living_forge'],
  },

  // ── Gem Cutters (5) ────────────────────────────────────────────
  {
    id: 'gct_chip_scraper',
    name: 'Chip Scraper',
    dwarfType: 'gem_cutter',
    rarity: 'common',
    miningPower: 12,
    craftingPower: 10,
    endurance: 18,
    description:
      'A beginner who chips rough gems with a steady hand. Their work is crude but full of promise.',
    abilities: ['chip_basic'],
  },
  {
    id: 'gct_facet_apprentice',
    name: 'Facet Apprentice',
    dwarfType: 'gem_cutter',
    rarity: 'common',
    miningPower: 16,
    craftingPower: 16,
    endurance: 22,
    description:
      'Learning the sacred art of faceting. Each angle they cut brings more fire to the stone.',
    abilities: ['chip_basic', 'facet_angle'],
  },
  {
    id: 'gct_rainbow_splitter',
    name: 'Rainbow Splitter',
    dwarfType: 'gem_cutter',
    rarity: 'uncommon',
    miningPower: 20,
    craftingPower: 35,
    endurance: 26,
    description:
      'Splits gems along their natural cleavage planes to reveal hidden rainbows within. Their cuts never waste a carat.',
    abilities: ['chip_basic', 'rainbow_split'],
  },
  {
    id: 'gct_diamond_whisper',
    name: 'Diamond Whisper',
    dwarfType: 'gem_cutter',
    rarity: 'rare',
    miningPower: 45,
    craftingPower: 55,
    endurance: 32,
    description:
      'Whispers to diamonds and they obey. Can cut the hardest stones with tools that should not work, guided by an inexplicable bond.',
    abilities: ['chip_basic', 'facet_angle', 'rainbow_split', 'diamond_speak'],
  },
  {
    id: 'gct_prism_sovereign',
    name: 'Prism Sovereign',
    dwarfType: 'gem_cutter',
    rarity: 'epic',
    miningPower: 55,
    craftingPower: 80,
    endurance: 38,
    description:
      'The undisputed master of all gem cutting. A single gem from their hand can illuminate an entire cavern with captured starlight.',
    abilities: ['chip_basic', 'facet_angle', 'rainbow_split', 'diamond_speak', 'prism_crown'],
  },

  // ── Tunnel Miners (5) ──────────────────────────────────────────
  {
    id: 'tnm_pick_scraper',
    name: 'Pick Scraper',
    dwarfType: 'tunnel_miner',
    rarity: 'common',
    miningPower: 18,
    craftingPower: 6,
    endurance: 24,
    description:
      'A fresh-faced miner with a pick and a dream. They dig where told and dream of striking veins.',
    abilities: ['basic_dig'],
  },
  {
    id: 'tnm_shovel_grunt',
    name: 'Shovel Grunt',
    dwarfType: 'tunnel_miner',
    rarity: 'common',
    miningPower: 22,
    craftingPower: 8,
    endurance: 30,
    description:
      'Moves mountains of rubble with tireless efficiency. The backbone of every mining operation.',
    abilities: ['basic_dig', 'rapid_shovel'],
  },
  {
    id: 'tnm_cavern_scout',
    name: 'Cavern Scout',
    dwarfType: 'tunnel_miner',
    rarity: 'uncommon',
    miningPower: 28,
    craftingPower: 12,
    endurance: 35,
    description:
      'Scouts ahead in uncharted tunnels. They can sense cave-ins before they happen and find safe paths through darkness.',
    abilities: ['basic_dig', 'cavern_sense'],
  },
  {
    id: 'tnm_bedrock_breaker',
    name: 'Bedrock Breaker',
    dwarfType: 'tunnel_miner',
    rarity: 'rare',
    miningPower: 60,
    craftingPower: 20,
    endurance: 42,
    description:
      'Smashes through bedrock that stops other miners cold. Their enchanted pick cracks stone like thin ice.',
    abilities: ['basic_dig', 'rapid_shovel', 'cavern_sense', 'bedrock_smash'],
  },
  {
    id: 'tnm_deepheart',
    name: 'Deepheart',
    dwarfType: 'tunnel_miner',
    rarity: 'epic',
    miningPower: 75,
    craftingPower: 25,
    endurance: 50,
    description:
      'Born in the deepest mine, raised by the stone itself. They feel the mountain\'s heartbeat and dig where it guides them, always finding treasure.',
    abilities: ['basic_dig', 'rapid_shovel', 'cavern_sense', 'bedrock_smash', 'stone_whisper'],
  },

  // ── Steam Mechanics (5) ────────────────────────────────────────
  {
    id: 'stm_valve_turner',
    name: 'Valve Turner',
    dwarfType: 'steam_mechanic',
    rarity: 'common',
    miningPower: 8,
    craftingPower: 12,
    endurance: 20,
    description:
      'A junior mechanic who keeps the pipes flowing. They know every valve in the lower tunnels by touch.',
    abilities: ['valve_control'],
  },
  {
    id: 'stm_pipe_fitter',
    name: 'Pipe Fitter',
    dwarfType: 'steam_mechanic',
    rarity: 'common',
    miningPower: 10,
    craftingPower: 18,
    endurance: 24,
    description:
      'Fits pipes together with molten lead seals. Their joints never leak and their systems run forever.',
    abilities: ['valve_control', 'pipe_join'],
  },
  {
    id: 'stm_gauge_reader',
    name: 'Gauge Reader',
    dwarfType: 'steam_mechanic',
    rarity: 'uncommon',
    miningPower: 12,
    craftingPower: 30,
    endurance: 28,
    description:
      'Reads pressure gauges with supernatural accuracy. Can predict system failures hours before they occur.',
    abilities: ['valve_control', 'gauge_sight'],
  },
  {
    id: 'stm_boiler_forge',
    name: 'Boiler Forge',
    dwarfType: 'steam_mechanic',
    rarity: 'rare',
    miningPower: 20,
    craftingPower: 55,
    endurance: 36,
    description:
      'Builds steam-powered forging rigs that automate basic smithing. Their boilers never explode and always run at optimal pressure.',
    abilities: ['valve_control', 'pipe_join', 'gauge_sight', 'boiler_craft'],
  },
  {
    id: 'stm_clockwork_titan',
    name: 'Clockwork Titan',
    dwarfType: 'steam_mechanic',
    rarity: 'epic',
    miningPower: 30,
    craftingPower: 70,
    endurance: 45,
    description:
      'Has replaced half their body with steam-powered clockwork. They work without rest and their mechanical arms can lift boulders.',
    abilities: ['valve_control', 'pipe_join', 'gauge_sight', 'boiler_craft', 'clockwork_body'],
  },

  // ── Ore Prospectors (5) ────────────────────────────────────────
  {
    id: 'orp_nose_twitcher',
    name: 'Nose Twitcher',
    dwarfType: 'ore_prospector',
    rarity: 'common',
    miningPower: 15,
    craftingPower: 5,
    endurance: 22,
    description:
      'Twitches their nose at the faintest mineral scent. Can smell copper from three tunnels away.',
    abilities: ['ore_sniff'],
  },
  {
    id: 'orp_lantern_searcher',
    name: 'Lantern Searcher',
    dwarfType: 'ore_prospector',
    rarity: 'common',
    miningPower: 20,
    craftingPower: 8,
    endurance: 26,
    description:
      'Carries a lantern enchanted to glow brighter near ore deposits. The stone guides them to wealth.',
    abilities: ['ore_sniff', 'lantern_hunt'],
  },
  {
    id: 'orp_vein_tracker',
    name: 'Vein Tracker',
    dwarfType: 'ore_prospector',
    rarity: 'uncommon',
    miningPower: 28,
    craftingPower: 15,
    endurance: 30,
    description:
      'Tracks veins through rock by reading mineral traces in dust. They can follow a seam of gold for miles underground.',
    abilities: ['ore_sniff', 'vein_follow'],
  },
  {
    id: 'orp_motherlode',
    name: 'Motherlode Seeker',
    dwarfType: 'ore_prospector',
    rarity: 'rare',
    miningPower: 50,
    craftingPower: 22,
    endurance: 38,
    description:
      'Has an uncanny talent for finding motherlodes — massive deposits that can supply the vale for decades.',
    abilities: ['ore_sniff', 'lantern_hunt', 'vein_follow', 'motherlode_sense'],
  },
  {
    id: 'orp_earth_diviner',
    name: 'Earth Diviner',
    dwarfType: 'ore_prospector',
    rarity: 'epic',
    miningPower: 65,
    craftingPower: 28,
    endurance: 42,
    description:
      'Divines ore locations by pressing their palm to the stone and listening. The mountain whispers its secrets only to them.',
    abilities: ['ore_sniff', 'lantern_hunt', 'vein_follow', 'motherlode_sense', 'earth_commune'],
  },

  // ── Anvil Hammers (5) ──────────────────────────────────────────
  {
    id: 'anh_tap_ringer',
    name: 'Tap Ringer',
    dwarfType: 'anvil_hammer',
    rarity: 'common',
    miningPower: 6,
    craftingPower: 16,
    endurance: 26,
    description:
      'Taps the anvil with precise rhythm. Every tap shapes the metal a fraction closer to perfection.',
    abilities: ['anvil_tap'],
  },
  {
    id: 'anh_spark_forged',
    name: 'Spark Forged',
    dwarfType: 'anvil_hammer',
    rarity: 'common',
    miningPower: 8,
    craftingPower: 22,
    endurance: 30,
    description:
      'Hammers so hot that sparks fly like fireworks. Each strike welds metal with incredible force.',
    abilities: ['anvil_tap', 'spark_strike'],
  },
  {
    id: 'anh_fold_master',
    name: 'Fold Master',
    dwarfType: 'anvil_hammer',
    rarity: 'uncommon',
    miningPower: 10,
    craftingPower: 38,
    endurance: 34,
    description:
      'Folds steel hundreds of times like ancient dwarven Damascus. The resulting blades can cut through stone.',
    abilities: ['anvil_tap', 'steel_fold'],
  },
  {
    id: 'anh_quench_lord',
    name: 'Quench Lord',
    dwarfType: 'anvil_hammer',
    rarity: 'rare',
    miningPower: 15,
    craftingPower: 58,
    endurance: 40,
    description:
      'Master of the quench — their oil baths harden steel to impossible levels. Weapons from their anvil never dull or chip.',
    abilities: ['anvil_tap', 'spark_strike', 'steel_fold', 'perfect_quench'],
  },
  {
    id: 'anh_titan_strike',
    name: 'Titan Strike',
    dwarfType: 'anvil_hammer',
    rarity: 'epic',
    miningPower: 20,
    craftingPower: 85,
    endurance: 48,
    description:
      'Their hammer was forged from a fallen star. A single strike can reshape an entire ingot into a finished weapon in moments.',
    abilities: ['anvil_tap', 'spark_strike', 'steel_fold', 'perfect_quench', 'star_hammer'],
  },

  // ── Flux Alchemists (5) ────────────────────────────────────────
  {
    id: 'fxa_potion_brewer',
    name: 'Potion Brewer',
    dwarfType: 'flux_alchemist',
    rarity: 'common',
    miningPower: 8,
    craftingPower: 14,
    endurance: 18,
    description:
      'Brews basic flux potions that help separate ore from rock. Their cauldron bubbles day and night.',
    abilities: ['brew_basic'],
  },
  {
    id: 'fxa_resin_mixer',
    name: 'Resin Mixer',
    dwarfType: 'flux_alchemist',
    rarity: 'common',
    miningPower: 10,
    craftingPower: 18,
    endurance: 22,
    description:
      'Mixes volatile resins that soften hard rock for mining. Their concoctions smell terrible but work wonders.',
    abilities: ['brew_basic', 'resin_blend'],
  },
  {
    id: 'fxa_transmute_novice',
    name: 'Transmute Novice',
    dwarfType: 'flux_alchemist',
    rarity: 'uncommon',
    miningPower: 14,
    craftingPower: 32,
    endurance: 26,
    description:
      'Learning the art of transmutation. Can convert small amounts of lead into tin and copper into bronze.',
    abilities: ['brew_basic', 'minor_transmute'],
  },
  {
    id: 'fxa_elders_brew',
    name: 'Elder\'s Brew',
    dwarfType: 'flux_alchemist',
    rarity: 'rare',
    miningPower: 22,
    craftingPower: 55,
    endurance: 34,
    description:
      'Brews elixirs from the recipe of the mountain elders. Their potions can strengthen steel, sharpen gems, and heal wounds.',
    abilities: ['brew_basic', 'resin_blend', 'minor_transmute', 'elder_recipe'],
  },
  {
    id: 'fxa_philosopher_smith',
    name: 'Philosopher Smith',
    dwarfType: 'flux_alchemist',
    rarity: 'epic',
    miningPower: 28,
    craftingPower: 78,
    endurance: 40,
    description:
      'Has glimpsed the Philosopher\'s Ore and understands the fundamental unity of all metals. They transmute with whispered formulae and starlight.',
    abilities: ['brew_basic', 'resin_blend', 'minor_transmute', 'elder_recipe', 'philosopher_stone'],
  },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 6: CV_MINES — 8 Mine Locations
// ─────────────────────────────────────────────────────────────────

export const CV_MINES: readonly CvMineDef[] = [
  {
    id: 'copper_knoll',
    name: 'Copper Knoll',
    description:
      'A gentle hill of exposed copper deposits. The first mine of the vale, where every newcomer learns to swing a pick.',
    depth: 0,
    dangerLevel: 1,
    requiredTitle: 'cv_title_pebble_chipper',
    primaryOre: 'copper_smith',
    bgGradient: 'linear-gradient(180deg, #B87333 0%, #708090 50%, #FFD700 100%)',
    ambientColor: CV_COPPER,
  },
  {
    id: 'tin_hollow',
    name: 'Tin Hollow',
    description:
      'A winding network of natural caves filled with tin nodules. Echoing drips guide miners deeper into the dark.',
    depth: 1,
    dangerLevel: 2,
    requiredTitle: 'cv_title_pebble_chipper',
    primaryOre: 'tunnel_miner',
    bgGradient: 'linear-gradient(180deg, #708090 0%, #B87333 50%, #3B2507 100%)',
    ambientColor: CV_STEEL,
  },
  {
    id: 'ruby_grotto',
    name: 'Ruby Grotto',
    description:
      'A crystalline cavern where rubies grow from the walls like frozen fire. The heat here is intense but the gems are worth it.',
    depth: 2,
    dangerLevel: 3,
    requiredTitle: 'cv_title_copper_apprentice',
    primaryOre: 'gem_cutter',
    bgGradient: 'linear-gradient(180deg, #CC3300 0%, #1C1C1C 50%, #FFD700 100%)',
    ambientColor: CV_MOLTEN_RED,
  },
  {
    id: 'iron_vein_deeps',
    name: 'Iron Vein Deeps',
    description:
      'Deep iron deposits run through these tunnels like metallic arteries. The ore here is tough but makes the finest steel.',
    depth: 3,
    dangerLevel: 4,
    requiredTitle: 'cv_title_iron_foreman',
    primaryOre: 'anvil_hammer',
    bgGradient: 'linear-gradient(180deg, #708090 0%, #FF8C00 50%, #3B2507 100%)',
    ambientColor: CV_STEEL,
  },
  {
    id: 'steam_catacombs',
    name: 'Steam Catacombs',
    description:
      'Ancient tunnels filled with geothermal vents and boiling springs. Steam mechanics thrive here, harnessing natural pressure.',
    depth: 4,
    dangerLevel: 5,
    requiredTitle: 'cv_title_bronze_overseer',
    primaryOre: 'steam_mechanic',
    bgGradient: 'linear-gradient(180deg, #FF8C00 0%, #B87333 50%, #1C1C1C 100%)',
    ambientColor: CV_FORGE_ORANGE,
  },
  {
    id: 'emerald_maze',
    name: 'Emerald Maze',
    description:
      'A labyrinthine network of emerald-studded passages. Prospectors who enter often find riches — if they can find their way out.',
    depth: 5,
    dangerLevel: 6,
    requiredTitle: 'cv_title_gold_chancellor',
    primaryOre: 'ore_prospector',
    bgGradient: 'linear-gradient(180deg, #2E8B57 0%, #FFD700 50%, #1C1C1C 100%)',
    ambientColor: CV_JADE_VEIN,
  },
  {
    id: 'obsidian_sanctum',
    name: 'Obsidian Sanctum',
    description:
      'A chamber of pure obsidian glass, dark as midnight and sharp as razors. Flux alchemists draw strange powers from its volcanic origins.',
    depth: 6,
    dangerLevel: 7,
    requiredTitle: 'cv_title_forge_lord',
    primaryOre: 'flux_alchemist',
    bgGradient: 'linear-gradient(180deg, #1C1C1C 0%, #B87333 50%, #CC3300 100%)',
    ambientColor: CV_SHADOW_DARK,
  },
  {
    id: 'the_mountainheart',
    name: 'The Mountainheart',
    description:
      'The mythical core of the mountain where all ores converge. Legends say the mountain itself is alive here, and its heart beats with pure gold.',
    depth: 7,
    dangerLevel: 8,
    requiredTitle: 'cv_title_vale_sovereign',
    primaryOre: 'copper_smith',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #B87333 50%, #2E8B57 100%)',
    ambientColor: CV_GOLD,
  },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 7: CV_MATERIALS — 30 Metal/Gem Materials
// ─────────────────────────────────────────────────────────────────

export const CV_MATERIALS: readonly CvMaterialDef[] = [
  // Common (8)
  { id: 'cv_mat_raw_copper', name: 'Raw Copper', emoji: '🟤', type: 'metal', rarity: 'common', miningBonus: 2, craftingBonus: 3, value: 10, description: 'Unrefined copper ore straight from the mine wall. Warm to the touch.' },
  { id: 'cv_mat_tin_pebble', name: 'Tin Pebble', emoji: '⚪', type: 'metal', rarity: 'common', miningBonus: 1, craftingBonus: 2, value: 8, description: 'A small pebble of tin. Plentiful but essential for bronze alloying.' },
  { id: 'cv_mat_iron_scrap', name: 'Iron Scrap', emoji: '🔩', type: 'metal', rarity: 'common', miningBonus: 2, craftingBonus: 4, value: 12, description: 'Scrap iron from mining debris. Can be smelted into useful bars.' },
  { id: 'cv_mat_coal_chunk', name: 'Coal Chunk', emoji: '▪️', type: 'metal', rarity: 'common', miningBonus: 0, craftingBonus: 5, value: 6, description: 'A chunk of high-quality coal. The fuel that feeds every forge fire.' },
  { id: 'cv_mat_quartz_shard', name: 'Quartz Shard', emoji: '💎', type: 'crystal', rarity: 'common', miningBonus: 3, craftingBonus: 1, value: 14, description: 'A clear quartz crystal shard. Used in basic flux potions.' },
  { id: 'cv_mat_copper_wire', name: 'Copper Wire', emoji: '🪝', type: 'metal', rarity: 'common', miningBonus: 0, craftingBonus: 4, value: 11, description: 'Drawn copper wire for binding and basic crafting.' },
  { id: 'cv_mat_clay_lump', name: 'Clay Lump', emoji: '🟫', type: 'metal', rarity: 'common', miningBonus: 1, craftingBonus: 2, value: 5, description: 'Malleable clay for mold-making and furnace lining.' },
  { id: 'cv_mat_slate_slab', name: 'Slate Slab', emoji: '⬛', type: 'metal', rarity: 'common', miningBonus: 0, craftingBonus: 3, value: 7, description: 'A smooth slab of slate used as an anvil surface for fine work.' },

  // Uncommon (7)
  { id: 'cv_mat_bronze_ingot', name: 'Bronze Ingot', emoji: '🟡', type: 'alloy', rarity: 'uncommon', miningBonus: 0, craftingBonus: 10, value: 55, description: 'A solid ingot of copper-tin bronze. The backbone of dwarven engineering.' },
  { id: 'cv_mat_garnet_chip', name: 'Garnet Chip', emoji: '🔴', type: 'gem', rarity: 'uncommon', miningBonus: 8, craftingBonus: 3, value: 65, description: 'A deep red garnet chip. Adds fire to any blade it inlays.' },
  { id: 'cv_mat_steel_bar', name: 'Steel Bar', emoji: '🔶', type: 'alloy', rarity: 'uncommon', miningBonus: 0, craftingBonus: 14, value: 70, description: 'A forged steel bar of excellent quality. Strong and reliable.' },
  { id: 'cv_mat_citrine_cluster', name: 'Citrine Cluster', emoji: '🟠', type: 'crystal', rarity: 'uncommon', miningBonus: 10, craftingBonus: 5, value: 60, description: 'A cluster of golden citrine crystals. Radiates warmth and luck.' },
  { id: 'cv_mat_brass_gear', name: 'Brass Gear', emoji: '⚙️', type: 'alloy', rarity: 'uncommon', miningBonus: 0, craftingBonus: 12, value: 72, description: 'A precision-machined brass gear for steam mechanisms.' },
  { id: 'cv_mat_topaz_facet', name: 'Topaz Facet', emoji: '💛', type: 'gem', rarity: 'uncommon', miningBonus: 7, craftingBonus: 6, value: 68, description: 'A cut topaz gem. Its golden facets glow with inner fire.' },
  { id: 'cv_mat_nickel_rod', name: 'Nickel Rod', emoji: '🪄', type: 'metal', rarity: 'uncommon', miningBonus: 5, craftingBonus: 8, value: 58, description: 'A corrosion-resistant nickel rod. Used in high-temperature alloys.' },

  // Rare (6)
  { id: 'cv_mat_titanium_ore', name: 'Titanium Ore', emoji: '🔷', type: 'metal', rarity: 'rare', miningBonus: 25, craftingBonus: 10, value: 320, description: 'Extremely durable titanium ore. Lightweight yet stronger than steel.' },
  { id: 'cv_mat_ruby_heart', name: 'Ruby Heart', emoji: '❤️', type: 'gem', rarity: 'rare', miningBonus: 15, craftingBonus: 20, value: 350, description: 'A heart-shaped ruby of exceptional clarity. Worth a king\'s ransom.' },
  { id: 'cv_mat_electrum_chain', name: 'Electrum Chain', emoji: '🔗', type: 'alloy', rarity: 'rare', miningBonus: 0, craftingBonus: 25, value: 380, description: 'A chain of gold-silver electrum. Conducts magical energy perfectly.' },
  { id: 'cv_mat_sapphire_lense', name: 'Sapphire Lens', emoji: '🔵', type: 'crystal', rarity: 'rare', miningBonus: 18, craftingBonus: 15, value: 340, description: 'A flawless sapphire lens. Can focus light into a cutting beam.' },
  { id: 'cv_mat_platinum_nugget', name: 'Platinum Nugget', emoji: '✨', type: 'metal', rarity: 'rare', miningBonus: 20, craftingBonus: 18, value: 400, description: 'A nugget of pure platinum. Virtually indestructible and eternal.' },
  { id: 'cv_mat_emerald_tablet', name: 'Emerald Tablet', emoji: '💚', type: 'gem', rarity: 'rare', miningBonus: 12, craftingBonus: 22, value: 420, description: 'An emerald inscribed with ancient dwarven formulae. Contains lost knowledge.' },

  // Epic (5)
  { id: 'cv_mat_mithril_strand', name: 'Mithril Strand', emoji: '🕸️', type: 'metal', rarity: 'epic', miningBonus: 40, craftingBonus: 35, value: 1500, description: 'A single strand of true mithril. Lighter than silk, harder than diamond.' },
  { id: 'cv_mat_onyx_soul', name: 'Onyx Soul', emoji: '🖤', type: 'gem', rarity: 'epic', miningBonus: 30, craftingBonus: 45, value: 1600, description: 'A black onyx that seems to absorb all light. Said to contain a trapped spirit.' },
  { id: 'cv_mat_starmetal_ingot', name: 'Starmetal Ingot', emoji: '🌟', type: 'alloy', rarity: 'epic', miningBonus: 0, craftingBonus: 50, value: 1800, description: 'Metal forged from a fallen meteorite. Glows faintly with cosmic energy.' },
  { id: 'cv_mat_void_crystal', name: 'Void Crystal', emoji: '🔮', type: 'crystal', rarity: 'epic', miningBonus: 50, craftingBonus: 30, value: 1700, description: 'A crystal from the space between worlds. Looking into it reveals other dimensions.' },
  { id: 'cv_mat_dragonscale_alloy', name: 'Dragonscale Alloy', emoji: '🐉', type: 'alloy', rarity: 'epic', miningBonus: 35, craftingBonus: 40, value: 2000, description: 'An alloy infused with dragon scale. Nearly impervious to heat and blades.' },

  // Legendary (4)
  { id: 'cv_mat_adamantine_heart', name: 'Adamantine Heart', emoji: '💜', type: 'metal', rarity: 'legendary', miningBonus: 70, craftingBonus: 70, value: 8000, description: 'The heart of an adamantine golem. The hardest substance in existence, impervious to all damage.' },
  { id: 'cv_mat_solar_diamond', name: 'Solar Diamond', emoji: '☀️', type: 'gem', rarity: 'legendary', miningBonus: 60, craftingBonus: 80, value: 10000, description: 'A diamond that radiates sunlight. In darkness it glows like a captured star.' },
  { id: 'cv_mat_primordial_ore', name: 'Primordial Ore', emoji: '🌀', type: 'essence', rarity: 'legendary', miningBonus: 80, craftingBonus: 60, value: 9000, description: 'Ore from before the world was shaped. Contains the raw material of creation itself.' },
  { id: 'cv_mat_eternal_copper', name: 'Eternal Copper', emoji: '🏆', type: 'essence', rarity: 'legendary', miningBonus: 50, craftingBonus: 100, value: 12000, description: 'Copper that never tarnishes, never weakens. The foundational metal of the Copper Vale, blessed by the mountain spirit.' },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 8: CV_STRUCTURES — 25 Structures (upgradable to lv10)
// ─────────────────────────────────────────────────────────────────

export const CV_STRUCTURES: readonly CvStructureDef[] = [
  // ── Barracks (7) ──────────────────────────────────────────────
  { id: 'cv_str_copper_hut', name: 'Copper Hut', emoji: '🏚️', category: 'barracks', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A humble hut of hammered copper sheets. Houses 2 dwarves.' },
  { id: 'cv_str_bronze_cottage', name: 'Bronze Cottage', emoji: '🏠', category: 'barracks', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A sturdy bronze cottage with proper bunks and a small hearth.' },
  { id: 'cv_str_iron_lodge', name: 'Iron Lodge', emoji: '🏢', category: 'barracks', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'An iron-walled lodge housing veteran dwarves. Includes an armory.' },
  { id: 'cv_str_steel_hall', name: 'Steel Hall', emoji: '🏰', category: 'barracks', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'A grand steel hall for elite dwarves. Training grounds and mess hall included.' },
  { id: 'cv_str_copperkeep', name: 'Copperkeep', emoji: '🏯', category: 'barracks', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A copper-roofed keep that serves as the heart of any dwarf encampment.' },
  { id: 'cv_str_deep_barracks', name: 'Deep Barracks', emoji: '⛰️', category: 'barracks', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'Barracks built into the tunnel walls. Dwarves sleep within arm\'s reach of the mine.' },
  { id: 'cv_str_vale_castle', name: 'Vale Castle', emoji: '🏰', category: 'barracks', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 250, costMultiplier: 1.7, description: 'The grandest barracks in the vale. Fit for legendary dwarves and their retinues.' },

  // ── Forge (6) ──────────────────────────────────────────────────
  { id: 'cv_str_ember_forge', name: 'Ember Forge', emoji: '🔨', category: 'forge', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A coal-fed forge that glows with steady embers. The workhorse of the vale.' },
  { id: 'cv_str_copper_anvil', name: 'Copper Anvil Forge', emoji: '⚒️', category: 'forge', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A forge built around a massive copper anvil. Tools shaped here carry extra quality.' },
  { id: 'cv_str_inferno_forge', name: 'Inferno Forge', emoji: '🔥', category: 'forge', maxLevel: 10, baseEffect: 12, effectPerLevel: 5, baseCost: 500, costMultiplier: 1.7, description: 'Fueled by volcanic vents, this forge burns hot enough to melt titanium.' },
  { id: 'cv_str_star_forge', name: 'Star Forge', emoji: '⭐', category: 'forge', maxLevel: 10, baseEffect: 16, effectPerLevel: 6, baseCost: 900, costMultiplier: 1.8, description: 'A forge that draws power from captured starlight. Items made here glow faintly.' },
  { id: 'cv_str_void_forge', name: 'Void Forge', emoji: '🌀', category: 'forge', maxLevel: 10, baseEffect: 20, effectPerLevel: 7, baseCost: 1500, costMultiplier: 1.9, description: 'Exists partially in the void. Forges items that phase between realities.' },
  { id: 'cv_str_mountain_forge', name: 'Mountain Forge', emoji: '🏔️', category: 'forge', maxLevel: 10, baseEffect: 18, effectPerLevel: 7, baseCost: 1200, costMultiplier: 1.8, description: 'The heart of the mountain\'s forge network. Taps directly into geothermal power.' },

  // ── Smelter (4) ────────────────────────────────────────────────
  { id: 'cv_str_clay_smelter', name: 'Clay Smelter', emoji: '🏺', category: 'smelter', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 60, costMultiplier: 1.4, description: 'A crude clay smelter for basic ore refinement.' },
  { id: 'cv_str_stone_furnace', name: 'Stone Furnace', emoji: '🧱', category: 'smelter', maxLevel: 10, baseEffect: 7, effectPerLevel: 3, baseCost: 200, costMultiplier: 1.5, description: 'A well-built stone furnace that can smelt iron and copper efficiently.' },
  { id: 'cv_str_steel_smelter', name: 'Steel Smelter', emoji: '🔥', category: 'smelter', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 500, costMultiplier: 1.7, description: 'A high-temperature smelter for steel and advanced alloys.' },
  { id: 'cv_str_auric_smelter', name: 'Auric Smelter', emoji: '✨', category: 'smelter', maxLevel: 10, baseEffect: 15, effectPerLevel: 6, baseCost: 1000, costMultiplier: 1.8, description: 'A golden smelter that refines the rarest materials without loss.' },

  // ── Storage (4) ────────────────────────────────────────────────
  { id: 'cv_str_wooden_chest', name: 'Wooden Chest', emoji: '📦', category: 'storage', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 40, costMultiplier: 1.3, description: 'A reinforced wooden chest for basic material storage.' },
  { id: 'cv_str_iron_vault', name: 'Iron Vault', emoji: '🏦', category: 'storage', maxLevel: 10, baseEffect: 20, effectPerLevel: 8, baseCost: 150, costMultiplier: 1.5, description: 'An iron-walled vault that protects valuable materials from theft and decay.' },
  { id: 'cv_str_copper_treasury', name: 'Copper Treasury', emoji: '🏛️', category: 'storage', maxLevel: 10, baseEffect: 30, effectPerLevel: 10, baseCost: 400, costMultiplier: 1.6, description: 'A grand treasury lined with copper. The pride of any vale operation.' },
  { id: 'cv_str_mountain_vault', name: 'Mountain Vault', emoji: '🕳️', category: 'storage', maxLevel: 10, baseEffect: 50, effectPerLevel: 15, baseCost: 800, costMultiplier: 1.8, description: 'Buried deep in the mountain, this vault can hold anything safely forever.' },

  // ── Tavern (4) ─────────────────────────────────────────────────
  { id: 'cv_str_copper_mug', name: 'Copper Mug Tavern', emoji: '🍺', category: 'tavern', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 70, costMultiplier: 1.4, description: 'A small tavern serving ale in copper mugs. Boosts dwarf morale.' },
  { id: 'cv_str_golden_goblet', name: 'Golden Goblet Inn', emoji: '🍷', category: 'tavern', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 200, costMultiplier: 1.5, description: 'A popular inn where dwarves gather to drink and share mining tales.' },
  { id: 'cv_str_forge_fire_hall', name: 'Forge Fire Hall', emoji: '🪔', category: 'tavern', maxLevel: 10, baseEffect: 7, effectPerLevel: 4, baseCost: 450, costMultiplier: 1.6, description: 'A grand hall with a roaring fire pit. Legendary feats are sung here.' },
  { id: 'cv_str_mountainheart_inn', name: 'Mountainheart Inn', emoji: '🏔️', category: 'tavern', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 900, costMultiplier: 1.7, description: 'The most famous inn in the vale. Dwarves travel from across the mountain to drink here.' },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 9: CV_ABILITIES — 22 Abilities
// ─────────────────────────────────────────────────────────────────

export const CV_ABILITIES: readonly CvAbilityDef[] = [
  // Active abilities (11)
  { id: 'cv_abil_copper_burst', name: 'Copper Burst', emoji: '💥', dwarfType: 'copper_smith', type: 'active', rarity: 'common', energyCost: 10, cooldown: 2, power: 20, description: 'Unleash a burst of molten copper that damages enemies and coats allies in protective copper armor.' },
  { id: 'cv_abil_gem_shatter', name: 'Gem Shatter', emoji: '💎', dwarfType: 'gem_cutter', type: 'active', rarity: 'common', energyCost: 12, cooldown: 3, power: 25, description: 'Shatter a gem to release its stored energy in a devastating concussive blast.' },
  { id: 'cv_abil_tunnel_collapse', name: 'Tunnel Collapse', emoji: '🪨', dwarfType: 'tunnel_miner', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 4, power: 40, description: 'Cause a controlled tunnel collapse that buries enemies while your dwarves escape through prepared routes.' },
  { id: 'cv_abil_steam_blast', name: 'Steam Blast', emoji: '💨', dwarfType: 'steam_mechanic', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 3, power: 35, description: 'Release a jet of superheated steam that scalds enemies and powers up nearby machines.' },
  { id: 'cv_abil_ore_surge', name: 'Ore Surge', emoji: '⛰️', dwarfType: 'ore_prospector', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 3, power: 30, description: 'Cause a sudden surge of ore to erupt from the walls, dealing damage and scattering bonus materials.' },
  { id: 'cv_abil_anvil_quake', name: 'Anvil Quake', emoji: '🔨', dwarfType: 'anvil_hammer', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 5, power: 55, description: 'Strike the anvil with earth-shaking force, sending shockwaves through the ground that topple foes.' },
  { id: 'cv_abil_flux_fire', name: 'Flux Fire', emoji: '🔥', dwarfType: 'flux_alchemist', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 4, power: 50, description: 'Ignite a volatile flux mixture that creates green fire, burning through armor and enchantments alike.' },
  { id: 'cv_abil_copper_rain', name: 'Copper Rain', emoji: '🌧️', dwarfType: 'copper_smith', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 5, power: 45, description: 'Summon a rain of molten copper droplets that sear enemies and leave the ground coated in metal.' },
  { id: 'cv_abil_gem_storm', name: 'Gem Storm', emoji: '🌪️', dwarfType: 'gem_cutter', type: 'active', rarity: 'epic', energyCost: 40, cooldown: 6, power: 75, description: 'Summon a whirlwind of razor-sharp gem fragments that shred everything in their path.' },
  { id: 'cv_abil_titan_drill', name: 'Titan Drill', emoji: '🔩', dwarfType: 'tunnel_miner', type: 'active', rarity: 'epic', energyCost: 45, cooldown: 7, power: 80, description: 'Deploy a massive drill that bores through anything — earth, stone, steel, or enemy fortifications.' },
  { id: 'cv_abil_mountain_wrath', name: 'Mountain Wrath', emoji: '🌋', dwarfType: 'anvil_hammer', type: 'active', rarity: 'legendary', energyCost: 80, cooldown: 10, power: 150, description: 'Awaken the mountain itself. The ground erupts with copper veins, gold geysers, and devastating force.' },

  // Passive abilities (11)
  { id: 'cv_abil_copper_skin', name: 'Copper Skin', emoji: '🛡️', dwarfType: 'copper_smith', type: 'passive', rarity: 'common', energyCost: 0, cooldown: 0, power: 10, description: 'Permanently increases all dwarves\' armor by coating them in thin copper plating.' },
  { id: 'cv_abil_gem_sight', name: 'Gem Sight', emoji: '👁️', dwarfType: 'gem_cutter', type: 'passive', rarity: 'common', energyCost: 0, cooldown: 0, power: 8, description: 'Grants all dwarves the ability to see in the dark by the light of nearby gems.' },
  { id: 'cv_abil_stone_footing', name: 'Stone Footing', emoji: '🦶', dwarfType: 'tunnel_miner', type: 'passive', rarity: 'uncommon', energyCost: 0, cooldown: 0, power: 15, description: 'All dwarves gain perfect balance on uneven terrain, never slipping or stumbling in tunnels.' },
  { id: 'cv_abil_steam_powered', name: 'Steam Powered', emoji: '⚙️', dwarfType: 'steam_mechanic', type: 'passive', rarity: 'uncommon', energyCost: 0, cooldown: 0, power: 12, description: 'All structures gain +10% efficiency when adjacent to steam pipes.' },
  { id: 'cv_abil_ore_magnet', name: 'Ore Magnet', emoji: '🧲', dwarfType: 'ore_prospector', type: 'passive', rarity: 'uncommon', energyCost: 0, cooldown: 0, power: 14, description: 'Attracts loose ore fragments toward dwarves, increasing passive mining yield by 15%.' },
  { id: 'cv_abil_hammer_rhythm', name: 'Hammer Rhythm', emoji: '🎵', dwarfType: 'anvil_hammer', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 22, description: 'All forging actions gain a rhythm bonus — consecutive crafts increase quality by 5% each.' },
  { id: 'cv_abil_flux_aura', name: 'Flux Aura', emoji: '💚', dwarfType: 'flux_alchemist', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 20, description: 'A constant aura of flux energy that slowly repairs nearby structures and heals dwarves.' },
  { id: 'cv_abil_deep_breath', name: 'Deep Breath', emoji: '🌬️', dwarfType: 'tunnel_miner', type: 'passive', rarity: 'epic', energyCost: 0, cooldown: 0, power: 35, description: 'Dwarves can work in any atmosphere — poison gas, smoke, or vacuum — without penalty.' },
  { id: 'cv_abil_starmetal_touch', name: 'Starmetal Touch', emoji: '✨', dwarfType: 'copper_smith', type: 'passive', rarity: 'epic', energyCost: 0, cooldown: 0, power: 40, description: 'All crafted items gain a subtle starmetal enhancement, increasing durability by 25%.' },
  { id: 'cv_abil_flux_transcend', name: 'Flux Transcendence', emoji: '🌀', dwarfType: 'flux_alchemist', type: 'passive', rarity: 'legendary', energyCost: 0, cooldown: 0, power: 60, description: 'All transmutation effects are doubled. The alchemist touches the fundamental nature of matter itself.' },
  { id: 'cv_abil_eternal_copper', name: 'Eternal Copper Blessing', emoji: '🏆', dwarfType: 'copper_smith', type: 'passive', rarity: 'legendary', energyCost: 0, cooldown: 0, power: 50, description: 'All dwarves gain the blessing of eternal copper — their tools never break and their armor never dents.' },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 10: CV_ACHIEVEMENTS — 18 Achievements
// ─────────────────────────────────────────────────────────────────

export const CV_ACHIEVEMENTS: readonly CvAchievementDef[] = [
  { id: 'cv_ach_first_pick', name: 'First Pick Strike', emoji: '⛏️', description: 'Recruit your first dwarf.', condition: 'totalRecruited >= 1', reward: { gold: 50, renown: 10 } },
  { id: 'cv_ach_five_dwarves', name: 'Small Company', emoji: '👷', description: 'Have 5 dwarves in your crew.', condition: 'dwarves >= 5', reward: { gold: 150, renown: 25 } },
  { id: 'cv_ach_first_mine', name: 'Into the Dark', emoji: '🕳️', description: 'Excavate your first mine.', condition: 'mines >= 1', reward: { gold: 100, renown: 20 } },
  { id: 'cv_ach_copper_hoard', name: 'Copper Hoarder', emoji: '🟤', description: 'Collect 100 raw copper.', condition: 'material_cv_mat_raw_copper >= 100', reward: { gold: 200, renown: 30 } },
  { id: 'cv_ach_first_forge', name: 'Sparks Fly', emoji: '🔥', description: 'Build your first forge structure.', condition: 'forgeBuilt >= 1', reward: { gold: 120, renown: 25 } },
  { id: 'cv_ach_ten_dwarves', name: 'Growing Clan', emoji: '?family', description: 'Have 10 dwarves in your crew.', condition: 'dwarves >= 10', reward: { gold: 300, renown: 50 } },
  { id: 'cv_ach_half_mines', name: 'Half the Mountain', emoji: '⛰️', description: 'Excavate 4 different mines.', condition: 'mines >= 4', reward: { gold: 400, renown: 60 } },
  { id: 'cv_ach_bronze_age', name: 'Bronze Age', emoji: '🟡', description: 'Craft 50 bronze ingots.', condition: 'material_cv_mat_bronze_ingot >= 50', reward: { gold: 500, renown: 70 } },
  { id: 'cv_ach_artifact_found', name: 'Relic Unearthed', emoji: '🏺', description: 'Activate your first artifact.', condition: 'artifacts >= 1', reward: { gold: 250, renown: 40 } },
  { id: 'cv_ach_twenty_dwarves', name: 'Dwarven Legion', emoji: '⚔️', description: 'Have 20 dwarves in your crew.', condition: 'dwarves >= 20', reward: { gold: 600, renown: 100 } },
  { id: 'cv_ach_all_mines', name: 'Mountain Conquered', emoji: '🏔️', description: 'Excavate all 8 mines.', condition: 'mines >= 8', reward: { gold: 1000, renown: 150 } },
  { id: 'cv_ach_steel_empire', name: 'Steel Empire', emoji: '🔩', description: 'Build all forge structures.', condition: 'allForges', reward: { gold: 800, renown: 120 } },
  { id: 'cv_ach_first_event', name: 'Eventful Day', emoji: '📜', description: 'Face your first vale event.', condition: 'totalEventsFaced >= 1', reward: { gold: 100, renown: 15 } },
  { id: 'cv_ach_five_events', name: 'Event Veteran', emoji: '🎪', description: 'Face 5 vale events.', condition: 'totalEventsFaced >= 5', reward: { gold: 400, renown: 80 } },
  { id: 'cv_ach_ten_achievements', name: 'Achievement Hunter', emoji: '🏅', description: 'Unlock 10 achievements.', condition: 'achievements >= 10', reward: { gold: 1000, renown: 200 } },
  { id: 'cv_ach_epic_dwarf', name: 'Elite Recruit', emoji: '🟣', description: 'Recruit an epic rarity dwarf.', condition: 'hasEpic', reward: { gold: 500, renown: 100 } },
  { id: 'cv_ach_legendary_find', name: 'Legend Awakened', emoji: '👑', description: 'Recruit a legendary dwarf.', condition: 'hasLegendary', reward: { gold: 2000, renown: 300 } },
  { id: 'cv_ach_mountainheart', name: 'Heart of the Mountain', emoji: '💎', description: 'Excavate the Mountainheart mine.', condition: 'mines_mountainheart', reward: { gold: 5000, renown: 500 } },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 11: CV_TITLES — 8 Titles
// ─────────────────────────────────────────────────────────────────

export const CV_TITLES: readonly CvTitleDef[] = [
  { id: 'cv_title_pebble_chipper', name: 'Pebble Chipper', emoji: '🪨', minRenown: 0, minDwarves: 0, description: 'A newcomer who chips pebbles from the mountain\'s base. Every dwarf must start somewhere.' },
  { id: 'cv_title_copper_apprentice', name: 'Copper Apprentice', emoji: '🔧', minRenown: 100, minDwarves: 3, description: 'Has learned the basics of copper work and earned the trust of the vale elders.' },
  { id: 'cv_title_iron_foreman', name: 'Iron Foreman', emoji: '👷', minRenown: 300, minDwarves: 6, description: 'Leads a crew of miners with iron discipline. Their word is law in the lower tunnels.' },
  { id: 'cv_title_bronze_overseer', name: 'Bronze Overseer', emoji: '🏛️', minRenown: 600, minDwarves: 10, description: 'Oversees multiple mining operations. Their bronze badge opens every door in the vale.' },
  { id: 'cv_title_gold_chancellor', name: 'Gold Chancellor', emoji: '👑', minRenown: 1000, minDwarves: 15, description: 'Manages the vale\'s treasury and trade agreements. Their financial acumen is legendary.' },
  { id: 'cv_title_forge_lord', name: 'Forge Lord', emoji: '🔥', minRenown: 1500, minDwarves: 20, description: 'Commands the forge district. Their creations arm the entire dwarven army.' },
  { id: 'cv_title_vale_sovereign', name: 'Vale Sovereign', emoji: '🏔️', minRenown: 2500, minDwarves: 28, description: 'Rules the Copper Vale itself. The mountain bows to their authority.' },
  { id: 'cv_title_mountainheart', name: 'Mountainheart', emoji: '💎', minRenown: 5000, minDwarves: 35, description: 'One with the mountain. The most prestigious title in dwarven history, granted only to those who have touched the heart of all things.' },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 12: CV_ARTIFACTS — 15 Artifacts
// ─────────────────────────────────────────────────────────────────

export const CV_ARTIFACTS: readonly CvArtifactDef[] = [
  { id: 'cv_art_copper_hammer', name: 'Hammer of the First Smith', emoji: '🔨', rarity: 'common', dwarfType: 'copper_smith', miningBoost: 5, craftingBoost: 10, enduranceBoost: 0, value: 100, description: 'The original hammer used to forge the first copper tool in the vale. Still warm to the touch.' },
  { id: 'cv_art_gem_lens', name: 'Lens of True Facets', emoji: '🔍', rarity: 'common', dwarfType: 'gem_cutter', miningBoost: 3, craftingBoost: 8, enduranceBoost: 0, value: 120, description: 'A magnifying lens that reveals the perfect cut in any gemstone.' },
  { id: 'cv_art_miners_lamp', name: 'Miner\'s Eternal Lamp', emoji: '🏮', rarity: 'common', dwarfType: 'tunnel_miner', miningBoost: 8, craftingBoost: 0, enduranceBoost: 5, value: 90, description: 'A lamp that burns without fuel, lighting tunnels for all eternity.' },
  { id: 'cv_art_steam_whistle', name: 'Whistle of Pressure', emoji: '📢', rarity: 'uncommon', dwarfType: 'steam_mechanic', miningBoost: 5, craftingBoost: 12, enduranceBoost: 3, value: 250, description: 'A whistle that controls steam pressure across the entire vale network with a single blow.' },
  { id: 'cv_art_prospectors_compass', name: 'Oreseeker\'s Compass', emoji: '🧭', rarity: 'uncommon', dwarfType: 'ore_prospector', miningBoost: 15, craftingBoost: 0, enduranceBoost: 5, value: 300, description: 'A compass whose needle always points toward the nearest vein of ore.' },
  { id: 'cv_art_anvil_ring', name: 'Ring of the Eternal Anvil', emoji: '💍', rarity: 'uncommon', dwarfType: 'anvil_hammer', miningBoost: 0, craftingBoost: 15, enduranceBoost: 8, value: 280, description: 'A ring forged on the eternal anvil. Makes the wearer\'s strikes perfectly balanced.' },
  { id: 'cv_art_flux_cauldron', name: 'Cauldron of Transmutation', emoji: '🫕', rarity: 'uncommon', dwarfType: 'flux_alchemist', miningBoost: 5, craftingBoost: 14, enduranceBoost: 0, value: 260, description: 'An ancient cauldron that makes any transmutation attempt 20% more likely to succeed.' },
  { id: 'cv_art_copper_crown', name: 'Crown of the Vale', emoji: '👑', rarity: 'rare', dwarfType: 'copper_smith', miningBoost: 15, craftingBoost: 20, enduranceBoost: 10, value: 800, description: 'The ceremonial crown of the vale\'s founder. Grants authority over all copper workings.' },
  { id: 'cv_art_diamond_chisel', name: 'Diamond Chisel of Ages', emoji: '💎', rarity: 'rare', dwarfType: 'gem_cutter', miningBoost: 10, craftingBoost: 30, enduranceBoost: 5, value: 900, description: 'A chisel tipped with an eternal diamond. Can cut any substance, even starmetal.' },
  { id: 'cv_art_tunnel_map', name: 'Map of All Tunnels', emoji: '🗺️', rarity: 'rare', dwarfType: 'tunnel_miner', miningBoost: 25, craftingBoost: 5, enduranceBoost: 15, value: 850, description: 'A map that shows every tunnel in the mountain, including ones not yet dug.' },
  { id: 'cv_art_pressure_gauge', name: 'Gauge of Infinite Pressure', emoji: '📊', rarity: 'epic', dwarfType: 'steam_mechanic', miningBoost: 10, craftingBoost: 35, enduranceBoost: 20, value: 2000, description: 'Measures pressure beyond mortal comprehension. Can predict volcanic eruptions.' },
  { id: 'cv_art_golden_pick', name: 'Golden Pick of the Mountain King', emoji: '⛏️', rarity: 'epic', dwarfType: 'ore_prospector', miningBoost: 40, craftingBoost: 10, enduranceBoost: 15, value: 2200, description: 'A pick of solid gold that strikes where the mountain is richest. Never misses a vein.' },
  { id: 'cv_art_titans_gavel', name: 'Titan\'s Gavel', emoji: ' Justice', rarity: 'epic', dwarfType: 'anvil_hammer', miningBoost: 5, craftingBoost: 45, enduranceBoost: 25, value: 2500, description: 'A gavel forged by mountain titans. One strike on the anvil creates a masterpiece.' },
  { id: 'cv_art_mountain_heart_stone', name: 'Mountain Heart Stone', emoji: '❤️', rarity: 'legendary', dwarfType: 'flux_alchemist', miningBoost: 30, craftingBoost: 50, enduranceBoost: 30, value: 8000, description: 'A stone cut from the living heart of the mountain. Pulsates with geothermal energy and grants mastery over all earth.' },
  { id: 'cv_art_eternal_copper_mask', name: 'Mask of Eternal Copper', emoji: '🎭', rarity: 'legendary', dwarfType: 'copper_smith', miningBoost: 35, craftingBoost: 55, enduranceBoost: 35, value: 10000, description: 'A mask of living copper that bonds to the wearer\'s face. Grants the wisdom and skill of every smith who ever lived.' },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 13: CV_EVENTS — 12 Vale Events
// ─────────────────────────────────────────────────────────────────

export const CV_EVENTS: readonly CvEventDef[] = [
  { id: 'cv_evt_copper_rush', name: 'Copper Rush', emoji: '🟤', durationTurns: 3, effectType: 'buff', effectDescription: '+50% copper mining yield', description: 'A massive copper vein is discovered! All copper mining operations produce 50% more ore for 3 turns.' },
  { id: 'cv_evt_cave_in', name: 'Cave-In', emoji: '🪨', durationTurns: 2, effectType: 'debuff', effectDescription: '-30% mining speed, -20 endurance', description: 'A section of tunnel collapses! Mining speed drops and dwarf endurance suffers as they dig out.' },
  { id: 'cv_evt_gem_shower', name: 'Gem Shower', emoji: '💎', durationTurns: 2, effectType: 'buff', effectDescription: '+100% gem material drops', description: 'Pressure releases a pocket of gems! All mining produces double gem materials for 2 turns.' },
  { id: 'cv_evt_steam_leak', name: 'Steam Leak', emoji: '💨', durationTurns: 3, effectType: 'debuff', effectDescription: '-25% structure efficiency', description: 'A major steam pipe bursts! All structures lose 25% efficiency until repairs are complete.' },
  { id: 'cv_evt_merchant_caravan', name: 'Merchant Caravan', emoji: '🐫', durationTurns: 1, effectType: 'special', effectDescription: 'Buy materials at 50% cost', description: 'A trader caravan arrives at the vale! Purchase materials at half price for one turn.' },
  { id: 'cv_evt_mountain_tremor', name: 'Mountain Tremor', emoji: '🌍', durationTurns: 2, effectType: 'debuff', effectDescription: 'Random mine sealed, -15% all stats', description: 'The mountain shakes violently! A random mine may become temporarily sealed and all operations suffer.' },
  { id: 'cv_evt_golem_awakening', name: 'Golem Awakening', emoji: '🗿', durationTurns: 4, effectType: 'buff', effectDescription: '+40% crafting power, auto-repair', description: 'Ancient golems stir in the deep tunnels! They assist in crafting and automatically repair damaged structures.' },
  { id: 'cv_evt_flux_storm', name: 'Flux Storm', emoji: '🌀', durationTurns: 3, effectType: 'special', effectDescription: 'Random material transmutations', description: 'A storm of wild flux energy sweeps through the vale! Random materials may transmute into rarer versions.' },
  { id: 'cv_evt_dwarf_feast', name: 'Dwarf Feast', emoji: '🍽️', durationTurns: 2, effectType: 'buff', effectDescription: '+100% dwarf morale, +20 endurance', description: 'A grand feast is held in the tavern! All dwarves\' morale doubles and they gain extra endurance.' },
  { id: 'cv_evt_iron_rot', name: 'Iron Rot', emoji: '🦠', durationTurns: 3, effectType: 'debuff', effectDescription: '-20% iron/steel material quality', description: 'A fungal blight attacks iron stores! Iron and steel materials lose quality temporarily.' },
  { id: 'cv_evt_golden_vein', name: 'Golden Vein Discovery', emoji: '✨', durationTurns: 3, effectType: 'buff', effectDescription: '+75% gold earning, rare find chance', description: 'An incredible gold vein is struck! Gold earnings soar and rare materials are more likely to appear.' },
  { id: 'cv_evt_ancient_echo', name: 'Ancient Echo', emoji: '👻', durationTurns: 2, effectType: 'special', effectDescription: 'Random dwarf gains +1 level', description: 'The ghost of an ancient dwarf passes through the vale, granting wisdom to one lucky dwarf who gains a free level.' },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 14: CV_DWARF_QUIRKS — 15 Personality Quirks
// ─────────────────────────────────────────────────────────────────

export const CV_DWARF_QUIRKS: readonly { id: string; name: string; emoji: string; effect: string; description: string }[] = [
  { id: 'cv_q_beard_braider', name: 'Beard Braider', emoji: '🧔', effect: '+5% crafting', description: 'Braids their beard into elaborate patterns while working. The focus improves craft quality.' },
  { id: 'cv_q_songhammer', name: 'Songhammer', emoji: '🎵', effect: '+3% all stats', description: 'Sings ancient dwarven work songs that boost morale and rhythm of all nearby dwarves.' },
  { id: 'cv_q_tiny_taster', name: 'Tiny Taster', emoji: '🍺', effect: '+10% morale regen', description: 'Brews and tastes tiny ales. Their tavern creations restore morale twice as fast.' },
  { id: 'cv_q_gem_hoarder', name: 'Gem Hoarder', emoji: '💎', effect: '+15% gem finds', description: 'Obsessively collects gems. Their keen eye spots gem-bearing rock that others miss entirely.' },
  { id: 'cv_q_stone_whisperer', name: 'Stone Whisperer', emoji: '🪨', effect: '+8% mining', description: 'Talks to rocks and claims they talk back. Strangely, they always find the best veins.' },
  { id: 'cv_q_fire_tamer', name: 'Fire Tamer', emoji: '🔥', effect: '+10% forge output', description: 'Can walk barefoot across hot coals. Controls forge fires with uncanny precision.' },
  { id: 'cv_q_map_mnemonic', name: 'Map Mnemonic', emoji: '🗺️', effect: '+5% exploration', description: 'Remembers every tunnel they have ever walked. Never gets lost, always finds shortcuts.' },
  { id: 'cv_q_copper_sniffer', name: 'Copper Sniffer', emoji: '👃', effect: '+12% copper finds', description: 'Can smell copper through solid rock. Their nose has led the vale to its richest deposits.' },
  { id: 'cv_q_night_owl', name: 'Night Owl', emoji: '🦉', effect: '+8% endurance', description: 'Works best in total darkness. Their night vision is legendary and they never tire in the deep dark.' },
  { id: 'cv_q_lucky_strike', name: 'Lucky Strike', emoji: '🍀', effect: '+5% rare finds', description: 'Everything they touch turns to gold. Pure luck, but consistent enough to be supernatural.' },
  { id: 'cv_q_heavy_sleeper', name: 'Heavy Sleeper', emoji: '😴', effect: '+15% morale from rest', description: 'Sleeps like a boulder. When they wake, they are fully refreshed and ready to work double shifts.' },
  { id: 'cv_q_tinker_fingers', name: 'Tinker Fingers', emoji: '🔧', effect: '+7% steam repair', description: 'Cannot stop fiddling with mechanisms. Constantly improves nearby machines without being asked.' },
  { id: 'cv_q_ore_hummer', name: 'Ore Hummer', emoji: '🎶', effect: '+5% ore quality', description: 'Hums at the resonant frequency of different ores. The vibration separates pure metal from slag.' },
  { id: 'cv_q_gold_tooth', name: 'Gold Tooth', emoji: '🦷', effect: '+3% gold earnings', description: 'Has a gold tooth that they claim brings fortune. Superstition or not, they earn more than average.' },
  { id: 'cv_q_mountain_song', name: 'Mountain Song', emoji: '🏔️', effect: '+10% all stats in deep mines', description: 'Sings the Song of the Mountain, an ancient melody that harmonizes with the earth itself. Deep mines empower them.' },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 14b: CV_LORE — 12 Dwarven Sayings
// ─────────────────────────────────────────────────────────────────

export const CV_LORE: readonly { id: string; saying: string; meaning: string; emoji: string }[] = [
  { id: 'cv_lor_1', saying: 'The mountain does not yield — it invites.', meaning: 'Mining is about patience and respect for the stone, not brute force. The mountain opens its treasures to those who listen.', emoji: '⛰️' },
  { id: 'cv_lor_2', saying: 'Copper remembers. Steel forgets.', meaning: 'Copper tools carry the skill and memory of every smith who touched them; steel must be retaught with each generation.', emoji: '🟤' },
  { id: 'cv_lor_3', saying: 'A dwarf\'s worth is measured in the depth of their tunnels.', meaning: 'True value comes from hard-won experience and deep exploration, not surface appearances or easy gains.', emoji: '🕳️' },
  { id: 'cv_lor_4', saying: 'Gold shines brightest in the dark.', meaning: 'Wealth and beauty are most appreciated after hardship. The darkest mine yields the brightest reward.', emoji: '✨' },
  { id: 'cv_lor_5', saying: 'The forge fires burn away all weakness.', meaning: 'Adversity tempers character the way heat tempers steel. What survives the fire is stronger for it.', emoji: '🔥' },
  { id: 'cv_lor_6', saying: 'One gem can feed a clan for a year.', meaning: 'A single great discovery can sustain many for a long time. Quality matters more than quantity.', emoji: '💎' },
  { id: 'cv_lor_7', saying: 'Steam lifts what hands cannot.', meaning: 'Technology and ingenuity can overcome physical limitations. The dwarven spirit is unstoppable.', emoji: '💨' },
  { id: 'cv_lor_8', saying: 'The best pick is the one that does not break.', meaning: 'Reliability and durability matter more than flash or raw power. Choose your tools wisely.', emoji: '⛏️' },
  { id: 'cv_lor_9', saying: 'Every vein has a twin — find one and you find both.', meaning: 'Success breeds more success; one discovery leads to another. The mountain rewards the persistent.', emoji: '🏔️' },
  { id: 'cv_lor_10', saying: 'An anvil that rings true forges true steel.', meaning: 'A good foundation is essential for quality work. Start with the right tools and the rest follows.', emoji: '🔨' },
  { id: 'cv_lor_11', saying: 'Flux reveals what the eye cannot see.', meaning: 'The right tools and processes reveal hidden truths. Alchemy is not magic — it is deeper understanding.', emoji: '🧪' },
  { id: 'cv_lor_12', saying: 'The Mountainheart beats for those who listen.', meaning: 'Great rewards come to those who pay attention to the world around them. The mountain speaks to the patient.', emoji: '❤️' },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 15: HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────

export function cvFindDwarf(id: string): CvDwarfSpecies | null {
  return CV_DWARVES.find((d) => d.id === id) ?? null
}

export function cvFindMine(id: string): CvMineDef | null {
  return CV_MINES.find((m) => m.id === id) ?? null
}

export function cvFindMaterial(id: string): CvMaterialDef | null {
  return CV_MATERIALS.find((m) => m.id === id) ?? null
}

export function cvFindStructure(id: string): CvStructureDef | null {
  return CV_STRUCTURES.find((s) => s.id === id) ?? null
}

export function cvFindAbility(id: string): CvAbilityDef | null {
  return CV_ABILITIES.find((a) => a.id === id) ?? null
}

export function cvFindAchievement(id: string): CvAchievementDef | null {
  return CV_ACHIEVEMENTS.find((a) => a.id === id) ?? null
}

export function cvFindTitle(id: CvTitleId): CvTitleDef | null {
  return CV_TITLES.find((t) => t.id === id) ?? null
}

export function cvFindArtifact(id: string): CvArtifactDef | null {
  return CV_ARTIFACTS.find((a) => a.id === id) ?? null
}

export function cvFindEvent(id: string): CvEventDef | null {
  return CV_EVENTS.find((e) => e.id === id) ?? null
}

export function cvDwarfTypeColor(type: CvDwarfType): string {
  return CV_DWARF_TYPES.find((d) => d.id === type)?.color ?? '#888888'
}

export function cvRarityColor(rarity: CvRarity): string {
  return CV_RARITIES.find((r) => r.id === rarity)?.color ?? '#888888'
}

export function cvRarityMultiplier(rarity: CvRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 4
    case 'epic': return 8
    case 'legendary': return 16
  }
}

export function cvStructureCost(def: CvStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

export function cvDwarfRecruitCost(species: CvDwarfSpecies): number {
  return Math.floor(50 * cvRarityMultiplier(species.rarity))
}

export function cvXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= 50) return Infinity
  return Math.floor(80 * level * (1 + level * 0.1))
}

// ─────────────────────────────────────────────────────────────────
// SECTION 14d: CV_HISTORY — Major Vale Events Timeline
// ─────────────────────────────────────────────────────────────────

export const CV_HISTORY: readonly { era: number; name: string; event: string; emoji: string }[] = [
  { era: 1, name: 'The First Strike', event: 'The founding dwarves struck copper from the mountain\'s base and established the Copper Vale.', emoji: '⛏️' },
  { era: 2, name: 'Age of Bronze', event: 'The discovery of bronze alloying transformed the vale from a camp into a kingdom.', emoji: '🟡' },
  { era: 3, name: 'The Gem Rush', event: 'The Ruby Grotto was discovered, sparking a frenzy of gem cutting and trade.', emoji: '💎' },
  { era: 4, name: 'Steam Revolution', event: 'Steam mechanics harnessed geothermal vents, powering mine carts and forges.', emoji: '💨' },
  { era: 5, name: 'The Iron War', event: 'Rival clans fought over the Iron Vein Deeps. The vale\'s greatest heroes were forged in this conflict.', emoji: '⚔️' },
  { era: 6, name: 'Golden Age', event: 'The discovery of the Golden Vein brought unprecedented wealth and the title of Gold Chancellor was created.', emoji: '👑' },
  { era: 7, name: 'The Deep Expedition', event: 'Dwarves reached the Obsidian Sanctum and the Emerald Maze, mapping the mountain\'s deepest secrets.', emoji: '🕳️' },
  { era: 8, name: 'Mountainheart Awakening', event: 'The legendary Mountainheart mine was breached, revealing the living core of the mountain itself.', emoji: '❤️' },
  { era: 9, name: 'The Flux Incursion', event: 'Wild flux storms swept through the vale, transmuting materials randomly and driving alchemists mad with discovery.', emoji: '🌀' },
  { era: 10, name: 'Age of Eternal Copper', event: 'The Eternal Copper was discovered, granting the vale its namesake metal — copper that never tarnishes.', emoji: '🏆' },
]

// ─────────────────────────────────────────────────────────────────
// SECTION 15: ACHIEVEMENT CONDITION CHECKER
// ─────────────────────────────────────────────────────────────────

function cvCheckCondition(condition: string, state: CvStoreState): boolean {
  if (condition === 'totalRecruited >= 1') return state.totalRecruited >= 1
  if (condition === 'dwarves >= 5') return state.dwarves.length >= 5
  if (condition === 'mines >= 1') return state.mines.length >= 1
  if (condition === 'mines >= 4') return state.mines.length >= 4
  if (condition === 'mines >= 8') return state.mines.length >= 8
  if (condition === 'dwarves >= 10') return state.dwarves.length >= 10
  if (condition === 'dwarves >= 20') return state.dwarves.length >= 20
  if (condition === 'material_cv_mat_raw_copper >= 100') {
    const item = state.inventory.find((m) => m.materialId === 'cv_mat_raw_copper')
    return (item?.count ?? 0) >= 100
  }
  if (condition === 'material_cv_mat_bronze_ingot >= 50') {
    const item = state.inventory.find((m) => m.materialId === 'cv_mat_bronze_ingot')
    return (item?.count ?? 0) >= 50
  }
  if (condition === 'forgeBuilt >= 1') {
    return state.dwarves.length > 0
  }
  if (condition === 'artifacts >= 1') return state.artifacts.length >= 1
  if (condition === 'allForges') {
    const forgeIds = CV_STRUCTURES.filter((s) => s.category === 'forge').map((s) => s.id)
    return forgeIds.every((fid) => state.dwarves.length > 0)
  }
  if (condition === 'totalEventsFaced >= 1') return state.totalEventsFaced >= 1
  if (condition === 'totalEventsFaced >= 5') return state.totalEventsFaced >= 5
  if (condition === 'achievements >= 10') return state.achievements.length >= 10
  if (condition === 'hasEpic') {
    return state.dwarves.some((d) => {
      const sp = cvFindDwarf(d.speciesId)
      return sp?.rarity === 'epic'
    })
  }
  if (condition === 'hasLegendary') {
    return state.dwarves.some((d) => {
      const sp = cvFindDwarf(d.speciesId)
      return sp?.rarity === 'legendary'
    })
  }
  if (condition === 'mines_mountainheart') {
    return state.mines.includes('the_mountainheart')
  }
  return false
}

// ─────────────────────────────────────────────────────────────────
// SECTION 16: ZUSTAND STORE
// ─────────────────────────────────────────────────────────────────

const CV_INITIAL_STATE: CvStoreState = {
  dwarves: [],
  mines: [],
  inventory: [],
  artifacts: [],
  achievements: [],
  currentTitle: 'cv_title_pebble_chipper',
  gold: 100,
  renown: 0,
  totalRecruited: 0,
  totalMined: 0,
  totalBuilt: 0,
  totalEventsFaced: 0,
  activeEvent: null,
  eventTurnsRemaining: 0,
  activeMine: null,
}

export const useCvStore = create<CvFullStore>()(
  persist(
    (set, get) => ({
      ...CV_INITIAL_STATE,

      recruitDwarf: (speciesId: string): boolean => {
        const species = cvFindDwarf(speciesId)
        if (!species) return false

        const state = get()
        const cost = cvDwarfRecruitCost(species)
        if (state.gold < cost) return false

        const newInstance: CvDwarfInstance = {
          id: `dwarf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          miningPower: species.miningPower,
          craftingPower: species.craftingPower,
          endurance: species.endurance,
          morale: 100,
          recruitedAt: Date.now(),
        }

        set({
          gold: state.gold - cost,
          dwarves: [...state.dwarves, newInstance],
          totalRecruited: state.totalRecruited + 1,
          renown: state.renown + Math.floor(10 * cvRarityMultiplier(species.rarity)),
        })

        return true
      },

      excavateMine: (mineId: string): CvEventDef | null => {
        const state = get()
        if (state.mines.includes(mineId)) return null

        const mineDef = cvFindMine(mineId)
        if (!mineDef) return null

        const titleDef = cvFindTitle(state.currentTitle)
        if (!titleDef) return null

        const requiredIdx = CV_TITLES.findIndex((t) => t.id === mineDef.requiredTitle)
        const currentIdx = CV_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentIdx < requiredIdx) return null

        const bonusMaterials: { materialId: string; count: number }[] = []
        const commonMats = CV_MATERIALS.filter((m) => m.rarity === 'common')
        for (let i = 0; i < 3; i++) {
          const mat = commonMats[Math.floor(Math.random() * commonMats.length)]
          bonusMaterials.push({ materialId: mat.id, count: Math.floor(Math.random() * 10) + 5 })
        }

        const newInventory = [...state.inventory]
        for (const bonus of bonusMaterials) {
          const existing = newInventory.find((m) => m.materialId === bonus.materialId)
          if (existing) {
            existing.count += bonus.count
          } else {
            newInventory.push({ materialId: bonus.materialId, count: bonus.count })
          }
        }

        const goldReward = 50 * mineDef.dangerLevel
        const renownReward = 20 * mineDef.dangerLevel

        let triggeredEvent: CvEventDef | null = null
        if (Math.random() < 0.3) {
          const eligibleEvents = CV_EVENTS.filter((e) => e.effectType === 'buff' || e.effectType === 'special')
          if (eligibleEvents.length > 0) {
            triggeredEvent = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)]
          }
        }

        set({
          mines: [...state.mines, mineId],
          inventory: newInventory,
          gold: state.gold + goldReward,
          renown: state.renown + renownReward,
          totalMined: state.totalMined + 1,
          activeEvent: triggeredEvent,
          eventTurnsRemaining: triggeredEvent?.durationTurns ?? 0,
        })

        return triggeredEvent
      },

      buildStructure: (structureDefId: string): boolean => {
        const def = cvFindStructure(structureDefId)
        if (!def) return false

        const state = get()
        const cost = cvStructureCost(def, 0)
        if (state.gold < cost) return false

        const newInstance: CvStructureInstance = {
          id: `str_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          structureDefId,
          level: 1,
          builtAt: Date.now(),
        }

        set({
          gold: state.gold - cost,
          dwarves: [...state.dwarves],
          totalBuilt: state.totalBuilt + 1,
          renown: state.renown + 15,
        })

        if (state.gold >= cost) {
          set({ gold: state.gold - cost })
        }

        return true
      },

      activateArtifact: (artifactId: string): boolean => {
        const def = cvFindArtifact(artifactId)
        if (!def) return false

        const state = get()
        if (state.artifacts.includes(artifactId)) return false
        if (state.gold < Math.floor(def.value * 0.5)) return false

        const updatedDwarves = state.dwarves.map((d) => {
          const species = cvFindDwarf(d.speciesId)
          if (!species) return d
          if (species.dwarfType !== def.dwarfType) return d
          return {
            ...d,
            miningPower: d.miningPower + def.miningBoost,
            craftingPower: d.craftingPower + def.craftingBoost,
            endurance: d.endurance + def.enduranceBoost,
          }
        })

        set({
          artifacts: [...state.artifacts, artifactId],
          dwarves: updatedDwarves,
          gold: state.gold - Math.floor(def.value * 0.5),
          renown: state.renown + Math.floor(50 * cvRarityMultiplier(def.rarity)),
        })

        return true
      },

      triggerValeEvent: (): void => {
        const state = get()
        const randomEvent = CV_EVENTS[Math.floor(Math.random() * CV_EVENTS.length)]

        let newGold = state.gold
        if (randomEvent.effectType === 'buff') {
          newGold += 30
        } else if (randomEvent.effectType === 'debuff') {
          newGold = Math.max(0, newGold - 20)
        }

        set({
          activeEvent: randomEvent,
          eventTurnsRemaining: randomEvent.durationTurns,
          totalEventsFaced: state.totalEventsFaced + 1,
          gold: newGold,
        })
      },

      resetCopperVale: (): void => {
        set({ ...CV_INITIAL_STATE })
      },
    }),
    {
      name: 'copper-vale-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ─────────────────────────────────────────────────────────────────
// SECTION 17: HOOK — useCopperVale
// ─────────────────────────────────────────────────────────────────

export default function useCopperVale() {
  const store = useCvStore()

  // ── Computed: Owned dwarves with species info ─────────────────
  const cvOwnedDwarves = useMemo(() => {
    return store.dwarves.map((d) => {
      const species = cvFindDwarf(d.speciesId)
      return {
        ...d,
        species,
        typeColor: species ? cvDwarfTypeColor(species.dwarfType) : '#888888',
        rarityColor: species ? cvRarityColor(species.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available dwarf species to recruit ──────────────
  const cvAvailableSpecies = useMemo(() => {
    return CV_DWARVES.filter((sp) => {
      const cost = cvDwarfRecruitCost(sp)
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ───────────────────────────
  const cvCurrentTitleDetail = useMemo(() => {
    return cvFindTitle(store.currentTitle) ?? CV_TITLES[0]
  }, [store])

  // ── Computed: Next title info ─────────────────────────────────
  const cvNextTitle = useMemo(() => {
    const currentIdx = CV_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= CV_TITLES.length - 1) return null
    return CV_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active mine details ─────────────────────────────
  const cvActiveMineDetail = useMemo(() => {
    if (!store.activeMine) return null
    return cvFindMine(store.activeMine) ?? null
  }, [store])

  // ── Computed: Unexcavated mines ───────────────────────────────
  const cvUnexcavatedMines = useMemo(() => {
    return CV_MINES.filter((m) => !store.mines.includes(m.id))
  }, [store])

  // ── Computed: Owned artifacts with defs ───────────────────────
  const cvOwnedArtifacts = useMemo(() => {
    return store.artifacts
      .map((aId) => cvFindArtifact(aId))
      .filter((a): a is CvArtifactDef => a !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────────
  const cvUnclaimedAchievements = useMemo(() => {
    return CV_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return cvCheckCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Inventory materials with defs ──────────────────
  const cvInventoryMaterials = useMemo(() => {
    return store.inventory.map((m) => {
      const def = cvFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total artifact boost ────────────────────────────
  const cvTotalArtifactBoost = useMemo(() => {
    let miningBoost = 0
    let craftingBoost = 0
    let enduranceBoost = 0
    for (const aId of store.artifacts) {
      const artifact = cvFindArtifact(aId)
      if (artifact) {
        miningBoost += artifact.miningBoost
        craftingBoost += artifact.craftingBoost
        enduranceBoost += artifact.enduranceBoost
      }
    }
    return { miningBoost, craftingBoost, enduranceBoost }
  }, [store])

  // ── Computed: Average dwarf level ─────────────────────────────
  const cvAverageDwarfLevel = useMemo(() => {
    if (store.dwarves.length === 0) return 0
    const total = store.dwarves.reduce((sum, d) => sum + d.level, 0)
    return Math.floor(total / store.dwarves.length)
  }, [store])

  // ── Computed: Total dwarf power ───────────────────────────────
  const cvTotalDwarfPower = useMemo(() => {
    let miningPower = 0
    let craftingPower = 0
    let endurance = 0
    for (const d of store.dwarves) {
      miningPower += d.miningPower
      craftingPower += d.craftingPower
      endurance += d.endurance
    }
    return { miningPower, craftingPower, endurance }
  }, [store])

  // ── Computed: Dwarf type distribution ─────────────────────────
  const cvDwarfTypeDistribution = useMemo(() => {
    const groups: Record<string, number> = {}
    for (const dt of CV_DWARF_TYPES) {
      groups[dt.id] = 0
    }
    for (const d of store.dwarves) {
      const sp = cvFindDwarf(d.speciesId)
      if (sp) groups[sp.dwarfType] = (groups[sp.dwarfType] || 0) + 1
    }
    return groups
  }, [store])

  // ── Computed: Rarity distribution ─────────────────────────────
  const cvRarityDistribution = useMemo(() => {
    const groups: Record<CvRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 }
    for (const d of store.dwarves) {
      const sp = cvFindDwarf(d.speciesId)
      if (sp) groups[sp.rarity] += 1
    }
    return groups
  }, [store])

  // ── Computed: Dwarves grouped by rarity ───────────────────────
  const cvDwarvesByRarity = useMemo(() => {
    const groups: Record<CvRarity, CvDwarfInstance[]> = { common: [], uncommon: [], rare: [], epic: [], legendary: [] }
    for (const d of store.dwarves) {
      const sp = cvFindDwarf(d.speciesId)
      if (sp) groups[sp.rarity].push(d)
    }
    return groups
  }, [store])

  // ── Computed: Dwarves grouped by type ─────────────────────────
  const cvDwarvesByType = useMemo(() => {
    const groups: Record<string, CvDwarfInstance[]> = {}
    for (const dt of CV_DWARF_TYPES) {
      groups[dt.id] = []
    }
    for (const d of store.dwarves) {
      const sp = cvFindDwarf(d.speciesId)
      if (sp) groups[sp.dwarfType].push(d)
    }
    return groups
  }, [store])

  // ── Computed: Title progress ──────────────────────────────────
  const cvTitleProgress = useMemo(() => {
    const currentIdx = CV_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= CV_TITLES.length - 1) {
      return { percent: 100, renownNeeded: 0, dwarvesNeeded: 0 }
    }
    const next = CV_TITLES[currentIdx + 1]
    const renownProgress = Math.min(100, (store.renown / next.minRenown) * 100)
    const dwarfProgress = Math.min(100, (store.dwarves.length / next.minDwarves) * 100)
    return {
      percent: Math.floor((renownProgress + dwarfProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - store.renown),
      dwarvesNeeded: Math.max(0, next.minDwarves - store.dwarves.length),
    }
  }, [store])

  // ── Computed: Rare materials count ────────────────────────────
  const cvRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.inventory) {
      const def = cvFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Exhausted dwarves ───────────────────────────────
  const cvExhaustedDwarves = useMemo(() => {
    return store.dwarves.filter((d) => d.endurance < 30)
  }, [store])

  // ── Computed: Low morale dwarves ──────────────────────────────
  const cvLowMoraleDwarves = useMemo(() => {
    return store.dwarves.filter((d) => d.morale < 30)
  }, [store])

  // ── Computed: Available structures to build ───────────────────
  const cvAvailableStructures = useMemo(() => {
    return CV_STRUCTURES.filter((s) => {
      const cost = cvStructureCost(s, 0)
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Events by type ──────────────────────────────────
  const cvEventsByType = useMemo(() => {
    const buffs = CV_EVENTS.filter((e) => e.effectType === 'buff')
    const debuffs = CV_EVENTS.filter((e) => e.effectType === 'debuff')
    const specials = CV_EVENTS.filter((e) => e.effectType === 'special')
    return { buffs, debuffs, specials }
  }, [])

  // ── Side effects ──────────────────────────────────────────────
  if (store.eventTurnsRemaining > 0 && store.activeEvent) {
    const newTurns = store.eventTurnsRemaining - 1
    if (newTurns <= 0) {
      if (store.activeEvent !== null) {
        useCvStore.setState({ activeEvent: null, eventTurnsRemaining: 0 })
      }
    }
  }

  // ── Auto title upgrade check ──────────────────────────────────
  const currentIdx = CV_TITLES.findIndex((t) => t.id === store.currentTitle)
  if (currentIdx < CV_TITLES.length - 1) {
    const nextTitle = CV_TITLES[currentIdx + 1]
    if (store.renown >= nextTitle.minRenown && store.dwarves.length >= nextTitle.minDwarves) {
      if (store.currentTitle !== nextTitle.id) {
        useCvStore.setState({ currentTitle: nextTitle.id })
      }
    }
  }

  // ═════════════════════════════════════════════════════════════
  // Return cvAPI object
  // ═════════════════════════════════════════════════════════════

  const cvAPI = {
    // ── Direct constants ──────────────────────────────────────
    CV_COPPER,
    CV_GOLD,
    CV_FORGE_ORANGE,
    CV_STEEL,
    CV_DEEP_EARTH,
    CV_MOLTEN_RED,
    CV_JADE_VEIN,
    CV_SHADOW_DARK,
    CV_RARITIES,
    CV_DWARF_TYPES,
    CV_DWARVES,
    CV_MINES,
    CV_MATERIALS,
    CV_STRUCTURES,
    CV_ABILITIES,
    CV_ACHIEVEMENTS,
    CV_TITLES,
    CV_ARTIFACTS,
    CV_EVENTS,
    CV_DWARF_QUIRKS,
    CV_LORE,
    cvCheckSynergy,
    cvFindDwarf,
    cvFindMine,
    cvFindMaterial,
    cvFindStructure,
    cvFindAbility,
    cvFindAchievement,
    cvFindTitle,
    cvFindArtifact,
    cvFindEvent,
    cvDwarfTypeColor,
    cvRarityColor,
    cvRarityMultiplier,
    cvStructureCost,
    cvDwarfRecruitCost,
    cvXpForLevel,

    // ── Store state ───────────────────────────────────────────
    cvDwarves: store.dwarves,
    cvMines: store.mines,
    cvInventory: store.inventory,
    cvArtifacts: store.artifacts,
    cvAchievements: store.achievements,
    cvTitle: store.currentTitle,
    cvEvents: store.activeEvent,
    cvStats: {
      gold: store.gold,
      renown: store.renown,
      totalRecruited: store.totalRecruited,
      totalMined: store.totalMined,
      totalBuilt: store.totalBuilt,
      totalEventsFaced: store.totalEventsFaced,
      eventTurnsRemaining: store.eventTurnsRemaining,
    },

    // ── Store actions ─────────────────────────────────────────
    recruitDwarf: store.recruitDwarf,
    excavateMine: store.excavateMine,
    buildStructure: store.buildStructure,
    activateArtifact: store.activateArtifact,
    triggerValeEvent: store.triggerValeEvent,
    resetCopperVale: store.resetCopperVale,

    // ── Computed values ───────────────────────────────────────
    cvOwnedDwarves,
    cvAvailableSpecies,
    cvCurrentTitleDetail,
    cvNextTitle,
    cvActiveMineDetail,
    cvUnexcavatedMines,
    cvOwnedArtifacts,
    cvUnclaimedAchievements,
    cvInventoryMaterials,
    cvTotalArtifactBoost,
    cvAverageDwarfLevel,
    cvTotalDwarfPower,
    cvDwarfTypeDistribution,
    cvRarityDistribution,
    cvDwarvesByRarity,
    cvDwarvesByType,
    cvTitleProgress,
    cvRareMaterialCount,
    cvExhaustedDwarves,
    cvLowMoraleDwarves,
    cvAvailableStructures,
    cvEventsByType,
  }

  return cvAPI
}
