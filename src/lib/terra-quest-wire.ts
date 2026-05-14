/**
 * Terra Quest Wire — A global archaeological adventure mini-game module
 *
 * Players recruit 35 archaeologist explorers across 7 expedition types,
 * explore 8 ancient ruins, collect 30 artifact/fossil materials, build 25
 * expedition camp structures, unlock 22 exploration abilities, discover
 * 15 legendary ancient relics, face 12 expedition events, and ascend
 * through 8 titles from Dirt Scraper to Terra Deity — backed by a
 * Zustand store with persist middleware.
 *
 * Storage key: terra-quest-wire
 * Prefix: tq / TQ_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type TqExpeditionType =
  | 'tomb'
  | 'diving'
  | 'jungle'
  | 'desert'
  | 'glacier'
  | 'volcanic'
  | 'underwater'

export type TqRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type TqTitleId =
  | 'title_dirt_scraper'
  | 'title_digger'
  | 'title_excavator'
  | 'title_researcher'
  | 'title_expedition_leader'
  | 'title_relic_seeker'
  | 'title_terra_scholar'
  | 'title_terra_deity'

export interface TqExpeditionTypeDef {
  readonly id: TqExpeditionType
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface TqExplorerSpecies {
  readonly id: string
  readonly name: string
  readonly expeditionType: TqExpeditionType
  readonly rarity: TqRarity
  readonly skillPower: number
  readonly endurancePower: number
  readonly agility: number
  readonly description: string
  readonly abilities: string[]
}

export interface TqExplorerInstance {
  readonly id: string
  speciesId: string
  name: string
  level: number
  xp: number
  skillPower: number
  endurancePower: number
  agility: number
  morale: number
  stamina: number
  recruitedAt: number
}

export interface TqRuinDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly dangerLevel: number
  readonly requiredTitle: TqTitleId
  readonly expeditionType: TqExpeditionType
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface TqMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'artifact' | 'fossil' | 'mineral' | 'relic_shard' | 'essence'
  readonly rarity: TqRarity
  readonly skillBonus: number
  readonly enduranceBonus: number
  readonly value: number
  readonly description: string
}

export interface TqStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'excavation_tent' | 'research_lab' | 'artifact_vault' | 'supply_depot' | 'relic_shrine'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface TqStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface TqAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly expeditionType: TqExpeditionType
  readonly type: 'active' | 'passive'
  readonly rarity: TqRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface TqAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface TqTitleDef {
  readonly id: TqTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minExplorers: number
  readonly description: string
}

export interface TqRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: TqRarity
  readonly expeditionType: TqExpeditionType
  readonly skillBoost: number
  readonly enduranceBoost: number
  readonly agilityBoost: number
  readonly value: number
  readonly description: string
}

export interface TqEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface TqStoreState {
  explorers: TqExplorerInstance[]
  ruins: string[]
  materials: { materialId: string; count: number }[]
  structures: TqStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: TqTitleId
  gold: number
  renown: number
  totalRecruited: number
  totalExcavated: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: TqEventDef | null
  eventTurnsRemaining: number
  activeRuin: string | null
}

export interface TqStoreActions {
  tqRecruitExplorer: (speciesId: string) => boolean
  tqDismissExplorer: (explorerId: string) => boolean
  tqTrainExplorer: (explorerId: string) => boolean
  tqExcavateMaterial: (explorerId: string) => boolean
  tqBuildStructure: (structureDefId: string) => boolean
  tqUpgradeStructure: (structureId: string) => boolean
  tqExploreRuin: (ruinId: string) => TqEventDef | null
  tqCollectRelic: (relicId: string) => boolean
  tqUnlockAbility: (abilityId: string) => boolean
  tqUnlockTitle: (titleId: TqTitleId) => boolean
  tqClaimAchievement: (achievementId: string) => boolean
  tqTradeMaterial: (materialId: string, count: number) => number
  tqEndEvent: () => void
  tqResetEvent: () => void
}

export interface TqFullStore extends TqStoreState, TqStoreActions {}

export interface TqOwnedExplorer extends TqExplorerInstance {
  species: TqExplorerSpecies | undefined
  expeditionColor: string
  rarityColor: string
}

export interface TqStructureWithDef extends TqStructureInstance {
  def: TqStructureDef | undefined
}

export interface TqMaterialWithDef {
  materialId: string
  count: number
  def: TqMaterialDef | undefined
}

export interface TqTitleProgress {
  percent: number
  renownNeeded: number
  explorersNeeded: number
}

export interface TqRelicBoosts {
  skillBoost: number
  enduranceBoost: number
  agilityBoost: number
}

export interface TqAPI extends TqFullStore {
  TQ_EARTH_BROWN: string
  TQ_SAND_BEIGE: string
  TQ_JUNGLE_GREEN: string
  TQ_OCEAN_TEAL: string
  TQ_GLACIER_CYAN: string
  TQ_LAVA_ORANGE: string
  TQ_OBSIDIAN_BLACK: string
  TQ_GOLD_TREASURE: string
  TQ_EXPEDITION_TYPES: readonly TqExpeditionTypeDef[]
  TQ_EXPLORERS: readonly TqExplorerSpecies[]
  TQ_RUINS: readonly TqRuinDef[]
  TQ_MATERIALS: readonly TqMaterialDef[]
  TQ_STRUCTURES: readonly TqStructureDef[]
  TQ_ABILITIES: readonly TqAbilityDef[]
  TQ_ACHIEVEMENTS: readonly TqAchievementDef[]
  TQ_TITLES: readonly TqTitleDef[]
  TQ_RELICS: readonly TqRelicDef[]
  TQ_EVENTS: readonly TqEventDef[]
  tqCheckSynergy: (attacker: TqExpeditionType, defender: TqExpeditionType) => number
  tqOwnedExplorers: TqOwnedExplorer[]
  tqAvailableSpecies: TqExplorerSpecies[]
  tqCurrentTitleDetail: TqTitleDef
  tqNextTitle: TqTitleDef | null
  tqActiveRuinDetail: TqRuinDef | null
  tqUnexploredRuins: TqRuinDef[]
  tqBuiltStructures: TqStructureWithDef[]
  tqUnlockableAbilities: TqAbilityDef[]
  tqOwnedRelics: TqRelicDef[]
  tqUnclaimedAchievements: TqAchievementDef[]
  tqInventoryMaterials: TqMaterialWithDef[]
  tqTotalStructureEffect: number
  tqAverageExplorerLevel: number
  tqTotalExplorerPower: number
  tqExpeditionDistribution: Record<TqExpeditionType, number>
  tqRarityDistribution: Record<TqRarity, number>
  tqExplorersByRarity: Record<TqRarity, TqExplorerInstance[]>
  tqExplorersByExpedition: Record<TqExpeditionType, TqExplorerInstance[]>
  tqTitleProgress: TqTitleProgress
  tqRareMaterialCount: number
  tqExhaustedExplorers: TqExplorerInstance[]
  tqLowMoraleExplorers: TqExplorerInstance[]
  tqTotalRelicBoost: TqRelicBoosts
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const TQ_EARTH_BROWN: string = '#8B4513'
export const TQ_SAND_BEIGE: string = '#F5DEB3'
export const TQ_JUNGLE_GREEN: string = '#228B22'
export const TQ_OCEAN_TEAL: string = '#008B8B'
export const TQ_GLACIER_CYAN: string = '#E0FFFF'
export const TQ_LAVA_ORANGE: string = '#FF4500'
export const TQ_OBSIDIAN_BLACK: string = '#2F2F2F'
export const TQ_GOLD_TREASURE: string = '#FFD700'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: EXPEDITION TYPE DEFINITIONS (7 types)
// ═══════════════════════════════════════════════════════════════════

export const TQ_EXPEDITION_TYPES: readonly TqExpeditionTypeDef[] = [
  {
    id: 'tomb',
    name: 'Tomb',
    color: TQ_EARTH_BROWN,
    description:
      'Ancient burial sites and underground chambers. Tomb specialists navigate traps, read hieroglyphs, and uncover sealed crypts.',
  },
  {
    id: 'diving',
    name: 'Diving',
    color: TQ_OCEAN_TEAL,
    description:
      'Sunken ruins and underwater shipwrecks. Diving explorers brave the depths to retrieve artifacts lost beneath the waves.',
  },
  {
    id: 'jungle',
    name: 'Jungle',
    color: TQ_JUNGLE_GREEN,
    description:
      'Overgrown temples hidden beneath dense canopy. Jungle explorers cut through vegetation to reach forgotten civilizations.',
  },
  {
    id: 'desert',
    name: 'Desert',
    color: TQ_SAND_BEIGE,
    description:
      'Vast sand dunes concealing ancient monuments. Desert specialists read dune patterns and survive extreme heat.',
  },
  {
    id: 'glacier',
    name: 'Glacier',
    color: TQ_GLACIER_CYAN,
    description:
      'Frozen wastelands preserving prehistoric fossils. Glacier explorers chip through millennia of ice to find primordial relics.',
  },
  {
    id: 'volcanic',
    name: 'Volcanic',
    color: TQ_LAVA_ORANGE,
    description:
      'Active volcanic zones with obsidian-rich deposits. Volcanic specialists harvest rare minerals forged in molten rock.',
  },
  {
    id: 'underwater',
    name: 'Underwater',
    color: TQ_OBSIDIAN_BLACK,
    description:
      'Deep ocean trenches and submerged caves. Underwater explorers descend into the abyss where lost cities sleep.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: EXPEDITION SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const TQ_SYNERGY_MAP: Record<TqExpeditionType, TqExpeditionType[]> = {
  tomb: ['desert', 'volcanic'],
  diving: ['underwater', 'glacier'],
  jungle: ['volcanic', 'underwater'],
  desert: ['tomb', 'glacier'],
  glacier: ['diving', 'jungle'],
  volcanic: ['jungle', 'tomb'],
  underwater: ['diving', 'desert'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: TQ_EXPLORERS — 35 Explorer Specialists (5 per type)
// ═══════════════════════════════════════════════════════════════════

export const TQ_EXPLORERS: readonly TqExplorerSpecies[] = [
  // ── Tomb Explorers (5) ───────────────────────────────────────
  {
    id: 'tomb_novice_digger',
    name: 'Novice Digger',
    expeditionType: 'tomb',
    rarity: 'common',
    skillPower: 12,
    endurancePower: 8,
    agility: 14,
    description:
      'A fresh-faced archaeologist who just graduated from field school. Enthusiastic but inexperienced with ancient traps.',
    abilities: ['ab_brush_dust'],
  },
  {
    id: 'tomb_trench_walker',
    name: 'Trench Walker',
    expeditionType: 'tomb',
    rarity: 'uncommon',
    skillPower: 22,
    endurancePower: 18,
    agility: 20,
    description:
      'A seasoned trench supervisor who can identify burial layers by soil color alone. Never misses a stratification clue.',
    abilities: ['ab_brush_dust', 'ab_trench_sense'],
  },
  {
    id: 'tomb_sarcophagus_sage',
    name: 'Sarcophagus Sage',
    expeditionType: 'tomb',
    rarity: 'rare',
    skillPower: 40,
    endurancePower: 35,
    agility: 25,
    description:
      'An expert in opening sealed sarcophagi without damaging contents. Can detect curse inscriptions at a glance.',
    abilities: ['ab_brush_dust', 'ab_trench_sense', 'ab_seal_break'],
  },
  {
    id: 'tomb_pyramid_engineer',
    name: 'Pyramid Engineer',
    expeditionType: 'tomb',
    rarity: 'epic',
    skillPower: 65,
    endurancePower: 55,
    agility: 35,
    description:
      'A structural genius who understands pyramid architecture intimately. Can navigate internal passages others consider impossible.',
    abilities: ['ab_brush_dust', 'ab_trench_sense', 'ab_seal_break', 'ab_passage_find'],
  },
  {
    id: 'tomb_pharaoh_whisperer',
    name: 'Pharaoh Whisperer',
    expeditionType: 'tomb',
    rarity: 'legendary',
    skillPower: 100,
    endurancePower: 85,
    agility: 50,
    description:
      'A legendary archaeologist said to commune with ancient pharaohs through dream visions. No tomb has ever remained sealed before them.',
    abilities: ['ab_brush_dust', 'ab_trench_sense', 'ab_seal_break', 'ab_passage_find', 'ab_royal_decree'],
  },

  // ── Diving Explorers (5) ─────────────────────────────────────
  {
    id: 'diving_wreck_diver',
    name: 'Wreck Diver',
    expeditionType: 'diving',
    rarity: 'common',
    skillPower: 10,
    endurancePower: 12,
    agility: 18,
    description:
      'A recreational diver turned amateur archaeologist. Skilled at basic underwater recovery in shallow waters.',
    abilities: ['ab_sonar_ping'],
  },
  {
    id: 'diving_pearl_excavator',
    name: 'Pearl Excavator',
    expeditionType: 'diving',
    rarity: 'uncommon',
    skillPower: 20,
    endurancePower: 25,
    agility: 22,
    description:
      'A deep-sea specialist who originally hunted for pearls. Now applies that expertise to retrieving sunken artifacts.',
    abilities: ['ab_sonar_ping', 'ab_deep_dive'],
  },
  {
    id: 'diving_abyssal_archaeologist',
    name: 'Abyssal Archaeologist',
    expeditionType: 'diving',
    rarity: 'rare',
    skillPower: 38,
    endurancePower: 45,
    agility: 28,
    description:
      'A marine archaeologist who works at crushing depths. Can read ancient inscriptions through layers of barnacles and coral.',
    abilities: ['ab_sonar_ping', 'ab_deep_dive', 'ab_pressure_adapt'],
  },
  {
    id: 'diving_titanic_chronicler',
    name: 'Titanic Chronicler',
    expeditionType: 'diving',
    rarity: 'epic',
    skillPower: 58,
    endurancePower: 70,
    agility: 32,
    description:
      'A historian who documents great shipwrecks. Their chronicles have preserved knowledge lost to the ocean depths for centuries.',
    abilities: ['ab_sonar_ping', 'ab_deep_dive', 'ab_pressure_adapt', 'ab_wreck_map'],
  },
  {
    id: 'diving_poseidon_cartographer',
    name: 'Poseidon Cartographer',
    expeditionType: 'diving',
    rarity: 'legendary',
    skillPower: 90,
    endurancePower: 95,
    agility: 48,
    description:
      'A mythical deep-sea explorer who claims to have met Poseidon. Can sense submerged ruins from miles away through ocean currents.',
    abilities: ['ab_sonar_ping', 'ab_deep_dive', 'ab_pressure_adapt', 'ab_wreck_map', 'ab_abyss_call'],
  },

  // ── Jungle Explorers (5) ─────────────────────────────────────
  {
    id: 'jungle_vine_cutter',
    name: 'Vine Cutter',
    expeditionType: 'jungle',
    rarity: 'common',
    skillPower: 14,
    endurancePower: 10,
    agility: 16,
    description:
      'A local guide who clears paths through dense undergrowth. Knows which plants are medicine and which are poison.',
    abilities: ['ab_machete_chop'],
  },
  {
    id: 'jungle_temple_tracer',
    name: 'Temple Tracer',
    expeditionType: 'jungle',
    rarity: 'uncommon',
    skillPower: 24,
    endurancePower: 20,
    agility: 26,
    description:
      'An expert at following ancient stone paths hidden beneath centuries of jungle growth. Can find temples by reading tree root patterns.',
    abilities: ['ab_machete_chop', 'ab_canopy_sight'],
  },
  {
    id: 'jungle_canopy_researcher',
    name: 'Canopy Researcher',
    expeditionType: 'jungle',
    rarity: 'rare',
    skillPower: 35,
    endurancePower: 30,
    agility: 40,
    description:
      'A treetop archaeologist who studies ruins from above. Has discovered more hidden temples from the canopy than anyone on the ground.',
    abilities: ['ab_machete_chop', 'ab_canopy_sight', 'ab_vine_grapple'],
  },
  {
    id: 'jungle_rainforest_oracle',
    name: 'Rainforest Oracle',
    expeditionType: 'jungle',
    rarity: 'epic',
    skillPower: 55,
    endurancePower: 48,
    agility: 52,
    description:
      'A shaman-archaeologist who reads the jungle like a book. Animals guide them to ancient sites, and storms part at their approach.',
    abilities: ['ab_machete_chop', 'ab_canopy_sight', 'ab_vine_grapple', 'ab_spirit_path'],
  },
  {
    id: 'jungle_el_dorado_seeker',
    name: 'El Dorado Seeker',
    expeditionType: 'jungle',
    rarity: 'legendary',
    skillPower: 85,
    endurancePower: 75,
    agility: 65,
    description:
      'The only living explorer who has seen the golden city. Their map, tattooed on their own skin, is the only known guide to its location.',
    abilities: ['ab_machete_chop', 'ab_canopy_sight', 'ab_vine_grapple', 'ab_spirit_path', 'ab_gold_rush'],
  },

  // ── Desert Explorers (5) ─────────────────────────────────────
  {
    id: 'desert_sand_sweeper',
    name: 'Sand Sweeper',
    expeditionType: 'desert',
    rarity: 'common',
    skillPower: 11,
    endurancePower: 15,
    agility: 12,
    description:
      'A desert field worker skilled at surface surveys and brush clearing. Can spot pottery shards half-buried in sand.',
    abilities: ['ab_sand_scan'],
  },
  {
    id: 'desert_dune_reader',
    name: 'Dune Reader',
    expeditionType: 'desert',
    rarity: 'uncommon',
    skillPower: 21,
    endurancePower: 28,
    agility: 18,
    description:
      'A nomadic archaeologist who interprets dune formations to locate buried structures. The sand reveals its secrets to them.',
    abilities: ['ab_sand_scan', 'ab_oasis_track'],
  },
  {
    id: 'desert_oasis_excavator',
    name: 'Oasis Excavator',
    expeditionType: 'desert',
    rarity: 'rare',
    skillPower: 36,
    endurancePower: 42,
    agility: 22,
    description:
      'A specialist in excavating oasis sites where civilizations once thrived. Can work for days in extreme heat without rest.',
    abilities: ['ab_sand_scan', 'ab_oasis_track', 'ab_heat_resist'],
  },
  {
    id: 'desert_sphinx_decoder',
    name: 'Sphinx Decoder',
    expeditionType: 'desert',
    rarity: 'epic',
    skillPower: 60,
    endurancePower: 50,
    agility: 30,
    description:
      'A linguist who has cracked previously undecipherable scripts. The Sphinx itself is said to have whispered riddles to them.',
    abilities: ['ab_sand_scan', 'ab_oasis_track', 'ab_heat_resist', 'ab_glyph_read'],
  },
  {
    id: 'desert_giza_grandmaster',
    name: 'Giza Grandmaster',
    expeditionType: 'desert',
    rarity: 'legendary',
    skillPower: 95,
    endurancePower: 80,
    agility: 45,
    description:
      'The supreme authority on the Giza plateau. They know every hidden passage, every sealed chamber, and every secret the desert holds.',
    abilities: ['ab_sand_scan', 'ab_oasis_track', 'ab_heat_resist', 'ab_glyph_read', 'ab_desert_sovereign'],
  },

  // ── Glacier Explorers (5) ────────────────────────────────────
  {
    id: 'glacier_ice_picker',
    name: 'Ice Picker',
    expeditionType: 'glacier',
    rarity: 'common',
    skillPower: 13,
    endurancePower: 14,
    agility: 10,
    description:
      'A polar field technician who chips ice cores and extracts frozen specimens. Tough against cold but slow on rough terrain.',
    abilities: ['ab_ice_chip'],
  },
  {
    id: 'glacier_frost_analyst',
    name: 'Frost Analyst',
    expeditionType: 'glacier',
    rarity: 'uncommon',
    skillPower: 25,
    endurancePower: 30,
    agility: 15,
    description:
      'A cryo-archaeologist who analyzes ice layers to date ancient artifacts. Can determine the exact age of frozen finds on site.',
    abilities: ['ab_ice_chip', 'ab_permafrost_melt'],
  },
  {
    id: 'glacier_permafrost_researcher',
    name: 'Permafrost Researcher',
    expeditionType: 'glacier',
    rarity: 'rare',
    skillPower: 42,
    endurancePower: 50,
    agility: 20,
    description:
      'A deep-permafrost specialist who has uncovered intact mammoth specimens. Their preservation techniques are unmatched worldwide.',
    abilities: ['ab_ice_chip', 'ab_permafrost_melt', 'ab_frost_shield'],
  },
  {
    id: 'glacier_tomb_raider',
    name: 'Glacier Tomb Raider',
    expeditionType: 'glacier',
    rarity: 'epic',
    skillPower: 62,
    endurancePower: 68,
    agility: 28,
    description:
      'A daring explorer who raids ice tombs sealed for millennia. Has survived avalanches, frostbite, and ancient guardian traps.',
    abilities: ['ab_ice_chip', 'ab_permafrost_melt', 'ab_frost_shield', 'ab_avalanche_dodge'],
  },
  {
    id: 'glacier_mammoth_elder',
    name: 'Mammoth Elder',
    expeditionType: 'glacier',
    rarity: 'legendary',
    skillPower: 92,
    endurancePower: 100,
    agility: 38,
    description:
      'An ancient explorer who legend says was once a mammoth. They can hear the whispers of extinct creatures frozen in the ice.',
    abilities: ['ab_ice_chip', 'ab_permafrost_melt', 'ab_frost_shield', 'ab_avalanche_dodge', 'ab_primordial_call'],
  },

  // ── Volcanic Explorers (5) ───────────────────────────────────
  {
    id: 'volcanic_ash_collector',
    name: 'Ash Collector',
    expeditionType: 'volcanic',
    rarity: 'common',
    skillPower: 15,
    endurancePower: 10,
    agility: 12,
    description:
      'A vulcanologist-archaeologist who collects ash-embedded artifacts from eruption sites. Wears heat-resistant gear at all times.',
    abilities: ['ab_ash_brush'],
  },
  {
    id: 'volcanic_lava_channeler',
    name: 'Lava Channeler',
    expeditionType: 'volcanic',
    rarity: 'uncommon',
    skillPower: 28,
    endurancePower: 22,
    agility: 20,
    description:
      'An explorer who redirects lava flows to reveal buried structures. Understands magma behavior better than anyone alive.',
    abilities: ['ab_ash_brush', 'ab_lava_redirect'],
  },
  {
    id: 'volcanic_obsidian_crafter',
    name: 'Obsidian Crafter',
    expeditionType: 'volcanic',
    rarity: 'rare',
    skillPower: 45,
    endurancePower: 35,
    agility: 25,
    description:
      'A master obsidian worker who extracts pristine volcanic glass from ancient tool workshops. Their replicas are indistinguishable from originals.',
    abilities: ['ab_ash_brush', 'ab_lava_redirect', 'ab_obsidian_sense'],
  },
  {
    id: 'volcanic_caldera_pioneer',
    name: 'Caldera Pioneer',
    expeditionType: 'volcanic',
    rarity: 'epic',
    skillPower: 68,
    endurancePower: 55,
    agility: 30,
    description:
      'The first explorer to descend into an active caldera and return with artifacts. The heat cannot touch them, and the earth obeys their footsteps.',
    abilities: ['ab_ash_brush', 'ab_lava_redirect', 'ab_obsidian_sense', 'ab_magma_forge'],
  },
  {
    id: 'volcanic_pompeii_ghost',
    name: 'Pompeii Ghost',
    expeditionType: 'volcanic',
    rarity: 'legendary',
    skillPower: 98,
    endurancePower: 78,
    agility: 42,
    description:
      'An immortal explorer who survived the eruption of Vesuvius. They walk through lava unscathed and can hear the voices of Pompeii preserved in ash.',
    abilities: ['ab_ash_brush', 'ab_lava_redirect', 'ab_obsidian_sense', 'ab_magma_forge', 'ab_eruption_bind'],
  },

  // ── Underwater Explorers (5) ─────────────────────────────────
  {
    id: 'underwater_coral_diver',
    name: 'Coral Diver',
    expeditionType: 'underwater',
    rarity: 'common',
    skillPower: 10,
    endurancePower: 12,
    agility: 16,
    description:
      'A coral reef archaeologist who recovers artifacts tangled in reef formations. Gentle technique prevents damage to both relics and coral.',
    abilities: ['ab_coral_bloom'],
  },
  {
    id: 'underwater_kelp_navigator',
    name: 'Kelp Navigator',
    expeditionType: 'underwater',
    rarity: 'uncommon',
    skillPower: 20,
    endurancePower: 24,
    agility: 24,
    description:
      'An underwater pathfinder who uses kelp forest currents to locate submerged ruins. Can hold their breath for extraordinary durations.',
    abilities: ['ab_coral_bloom', 'ab_current_ride'],
  },
  {
    id: 'underwater_abyss_excavator',
    name: 'Abyss Excavator',
    expeditionType: 'underwater',
    rarity: 'rare',
    skillPower: 35,
    endurancePower: 48,
    agility: 28,
    description:
      'A deep-trench excavator who operates robotic arms from a submersible. Has retrieved artifacts from depths no human could survive.',
    abilities: ['ab_coral_bloom', 'ab_current_ride', 'ab_biolum_sight'],
  },
  {
    id: 'underwater_leviathan_tracker',
    name: 'Leviathan Tracker',
    expeditionType: 'underwater',
    rarity: 'epic',
    skillPower: 55,
    endurancePower: 65,
    agility: 35,
    description:
      'A fearless deep-sea tracker who follows ancient leviathan migration routes to find sunken cities. Giant creatures flee at their approach.',
    abilities: ['ab_coral_bloom', 'ab_current_ride', 'ab_biolum_sight', 'ab_depth_crush'],
  },
  {
    id: 'underwater_atlantis_chronicler',
    name: 'Atlantis Chronicler',
    expeditionType: 'underwater',
    rarity: 'legendary',
    skillPower: 88,
    endurancePower: 90,
    agility: 50,
    description:
      'The sole keeper of the Atlantis archives. They breathe water as easily as air and have walked the streets of the drowned city itself.',
    abilities: ['ab_coral_bloom', 'ab_current_ride', 'ab_biolum_sight', 'ab_depth_crush', 'ab_atlantis_awaken'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: TQ_RUINS — 8 Ancient Ruins
// ═══════════════════════════════════════════════════════════════════

export const TQ_RUINS: readonly TqRuinDef[] = [
  {
    id: 'ruin_giza_pyramids',
    name: 'Pyramids of Giza',
    description:
      'The last surviving wonder of the ancient world. Endless passages and hidden chambers beneath the great pyramids hold untold treasures.',
    depth: 0,
    dangerLevel: 1,
    requiredTitle: 'title_dirt_scraper',
    expeditionType: 'tomb',
    bgGradient: 'linear-gradient(180deg, #F5DEB3 0%, #8B4513 50%, #FFD700 100%)',
    ambientColor: TQ_SAND_BEIGE,
  },
  {
    id: 'ruin_machu_picchu',
    name: 'Machu Picchu',
    description:
      'The lost citadel of the Incas perched high in the Andes. Overgrown terraces conceal temples aligned to celestial events.',
    depth: 1,
    dangerLevel: 2,
    requiredTitle: 'title_dirt_scraper',
    expeditionType: 'jungle',
    bgGradient: 'linear-gradient(180deg, #228B22 0%, #8B4513 50%, #F5DEB3 100%)',
    ambientColor: TQ_JUNGLE_GREEN,
  },
  {
    id: 'ruin_petra',
    name: 'Petra',
    description:
      'The rose-red city carved into sandstone cliffs. Water channels and hidden tombs snake through the narrow canyon passages.',
    depth: 2,
    dangerLevel: 3,
    requiredTitle: 'title_digger',
    expeditionType: 'desert',
    bgGradient: 'linear-gradient(180deg, #8B4513 0%, #F5DEB3 50%, #FF4500 100%)',
    ambientColor: TQ_EARTH_BROWN,
  },
  {
    id: 'ruin_pompeii',
    name: 'Pompeii',
    description:
      'The Roman city frozen in volcanic ash. Molds of fleeing citizens and intact mosaics provide a perfect snapshot of ancient life.',
    depth: 3,
    dangerLevel: 4,
    requiredTitle: 'title_excavator',
    expeditionType: 'volcanic',
    bgGradient: 'linear-gradient(180deg, #2F2F2F 0%, #FF4500 50%, #8B4513 100%)',
    ambientColor: TQ_OBSIDIAN_BLACK,
  },
  {
    id: 'ruin_angkor_wat',
    name: 'Angkor Wat',
    description:
      'The largest religious monument ever built. Its jungle-covered towers and hidden libraries contain centuries of Khmer knowledge.',
    depth: 4,
    dangerLevel: 5,
    requiredTitle: 'title_researcher',
    expeditionType: 'jungle',
    bgGradient: 'linear-gradient(180deg, #228B22 0%, #008B8B 50%, #F5DEB3 100%)',
    ambientColor: TQ_JUNGLE_GREEN,
  },
  {
    id: 'ruin_atlantis',
    name: 'Atlantis Ruins',
    description:
      'The legendary sunken city beneath the Atlantic. Bioluminescent ruins and crystal-powered mechanisms still pulse with ancient energy.',
    depth: 5,
    dangerLevel: 6,
    requiredTitle: 'title_expedition_leader',
    expeditionType: 'underwater',
    bgGradient: 'linear-gradient(180deg, #008B8B 0%, #2F2F2F 50%, #E0FFFF 100%)',
    ambientColor: TQ_OCEAN_TEAL,
  },
  {
    id: 'ruin_tikal',
    name: 'Tikal',
    description:
      'The deep-jungle Mayan metropolis with towering pyramids piercing the canopy. Sacred caves beneath contain ritual offerings to the gods.',
    depth: 6,
    dangerLevel: 7,
    requiredTitle: 'title_relic_seeker',
    expeditionType: 'diving',
    bgGradient: 'linear-gradient(180deg, #228B22 0%, #E0FFFF 50%, #008B8B 100%)',
    ambientColor: TQ_JUNGLE_GREEN,
  },
  {
    id: 'ruin_easter_island',
    name: 'Easter Island',
    description:
      'The remote volcanic island guarded by towering moai statues. Underground caverns contain the Rongorongo tablets — a script never fully deciphered.',
    depth: 7,
    dangerLevel: 8,
    requiredTitle: 'title_terra_scholar',
    expeditionType: 'glacier',
    bgGradient: 'linear-gradient(180deg, #E0FFFF 0%, #008B8B 50%, #FFD700 100%)',
    ambientColor: TQ_GLACIER_CYAN,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: TQ_MATERIALS — 30 Artifacts/Fossils/Materials
// ═══════════════════════════════════════════════════════════════════

export const TQ_MATERIALS: readonly TqMaterialDef[] = [
  // Common (8)
  { id: 'mat_shard_pottery', name: 'Pottery Shard', emoji: '🏺', type: 'artifact', rarity: 'common', skillBonus: 2, enduranceBonus: 1, value: 10, description: 'A fragment of ancient pottery with faded painted patterns.' },
  { id: 'mat_bone_fragment', name: 'Bone Fragment', emoji: '🦴', type: 'fossil', rarity: 'common', skillBonus: 1, enduranceBonus: 3, value: 12, description: 'A small fossilized bone fragment from an unknown prehistoric creature.' },
  { id: 'mat_copper_coin', name: 'Copper Coin', emoji: '🪙', type: 'artifact', rarity: 'common', skillBonus: 3, enduranceBonus: 0, value: 15, description: 'A weathered copper coin bearing an unrecognizable ruler\'s face.' },
  { id: 'mat_flint_tool', name: 'Flint Tool', emoji: '🪨', type: 'artifact', rarity: 'common', skillBonus: 2, enduranceBonus: 2, value: 8, description: 'A crude flint tool, one of humanity\'s earliest inventions.' },
  { id: 'mat_sand_sample', name: 'Desert Sand Sample', emoji: '⏳', type: 'mineral', rarity: 'common', skillBonus: 1, enduranceBonus: 1, value: 6, description: 'A vial of colored sand from an ancient desert excavation site.' },
  { id: 'mat_coral_piece', name: 'Coral Piece', emoji: '🪸', type: 'mineral', rarity: 'common', skillBonus: 2, enduranceBonus: 2, value: 9, description: 'A piece of fossilized coral with unusual mineral deposits.' },
  { id: 'mat_charcoal_mark', name: 'Charcoal Mark', emoji: '✏️', type: 'artifact', rarity: 'common', skillBonus: 4, enduranceBonus: 0, value: 11, description: 'A cave wall charcoal drawing showing prehistoric hunting scenes.' },
  { id: 'mat_amber_chip', name: 'Amber Chip', emoji: '🟡', type: 'mineral', rarity: 'common', skillBonus: 3, enduranceBonus: 1, value: 14, description: 'A small chip of amber that may contain a tiny preserved insect.' },

  // Uncommon (7)
  { id: 'mat_jade_amulet', name: 'Jade Amulet', emoji: '💚', type: 'artifact', rarity: 'uncommon', skillBonus: 8, enduranceBonus: 5, value: 75, description: 'A polished jade amulet inscribed with protective symbols.' },
  { id: 'mat_trilobite_fossil', name: 'Trilobite Fossil', emoji: '🦟', type: 'fossil', rarity: 'uncommon', skillBonus: 5, enduranceBonus: 10, value: 80, description: 'A perfectly preserved trilobite from the Cambrian explosion.' },
  { id: 'mat_silver_ring', name: 'Silver Ring', emoji: '💍', type: 'artifact', rarity: 'uncommon', skillBonus: 10, enduranceBonus: 3, value: 85, description: 'An ornate silver ring with an unreadable inscription inside the band.' },
  { id: 'mat_obsidian_blade', name: 'Obsidian Blade', emoji: '🗡️', type: 'artifact', rarity: 'uncommon', skillBonus: 7, enduranceBonus: 7, value: 70, description: 'A razor-sharp obsidian blade used in ancient Mesoamerican rituals.' },
  { id: 'mat_permafrost_ice', name: 'Permafrost Ice Core', emoji: '🧊', type: 'mineral', rarity: 'uncommon', skillBonus: 4, enduranceBonus: 12, value: 90, description: 'A cylindrical ice core containing trapped ancient air bubbles.' },
  { id: 'mat_papyrus_scrap', name: 'Papyrus Scrap', emoji: '📜', type: 'artifact', rarity: 'uncommon', skillBonus: 12, enduranceBonus: 2, value: 78, description: 'A fragment of papyrus with partial hieroglyphic text.' },
  { id: 'mat_volcanic_glass', name: 'Volcanic Glass', emoji: '🔴', type: 'mineral', rarity: 'uncommon', skillBonus: 6, enduranceBonus: 8, value: 82, description: 'A flawless piece of volcanic glass with unusual refractive properties.' },

  // Rare (6)
  { id: 'mat_gold_mask', name: 'Gold Death Mask', emoji: '🎭', type: 'artifact', rarity: 'rare', skillBonus: 20, enduranceBonus: 15, value: 350, description: 'A ceremonial gold mask from an unidentified royal burial.' },
  { id: 'mat_mammoth_tusk', name: 'Mammoth Tusk', emoji: '🦷', type: 'fossil', rarity: 'rare', skillBonus: 10, enduranceBonus: 25, value: 380, description: 'A complete mammoth tusk with intricate carvings depicting a lost migration route.' },
  { id: 'mat_crystal_skull', name: 'Crystal Skull Fragment', emoji: '💎', type: 'mineral', rarity: 'rare', skillBonus: 18, enduranceBonus: 18, value: 400, description: 'A fragment of a legendary crystal skull that hums with faint energy.' },
  { id: 'mat_rune_stone', name: 'Rune Stone', emoji: '🪨', type: 'artifact', rarity: 'rare', skillBonus: 22, enduranceBonus: 10, value: 320, description: 'A stone tablet carved with runic symbols that glow under moonlight.' },
  { id: 'mat_dinosaur_egg', name: 'Dinosaur Egg', emoji: '🥚', type: 'fossil', rarity: 'rare', skillBonus: 15, enduranceBonus: 22, value: 360, description: 'A fossilized dinosaur egg with intact embryo visible through the shell.' },
  { id: 'mat_ancient_compass', name: 'Ancient Compass', emoji: '🧭', type: 'artifact', rarity: 'rare', skillBonus: 25, enduranceBonus: 8, value: 340, description: 'A compass-like device of unknown origin that always points to the nearest ruin.' },

  // Epic (5)
  { id: 'mat_pharaoh_crown', name: 'Pharaoh Crown Fragment', emoji: '👑', type: 'relic_shard', rarity: 'epic', skillBonus: 35, enduranceBonus: 30, value: 1500, description: 'A golden fragment from the crown of an unnamed pharaoh. It radiates authority.' },
  { id: 'mat_platypus_fossil', name: 'Leviathan Bone', emoji: '🦴', type: 'fossil', rarity: 'epic', skillBonus: 25, enduranceBonus: 45, value: 1600, description: 'A massive bone from an undiscovered deep-sea leviathan species.' },
  { id: 'mat_star_map', name: 'Ancient Star Map', emoji: '🗺️', type: 'artifact', rarity: 'epic', skillBonus: 40, enduranceBonus: 20, value: 1800, description: 'A celestial map charting star positions from 12000 years ago.' },
  { id: 'mat_magma_crystal', name: 'Magma Crystal', emoji: '🔶', type: 'mineral', rarity: 'epic', skillBonus: 30, enduranceBonus: 35, value: 1700, description: 'A crystal formed in the Earth\'s mantle. It pulses with geothermal energy.' },
  { id: 'mat_atlantis_shard', name: 'Atlantis Crystal Shard', emoji: '💠', type: 'relic_shard', rarity: 'epic', skillBonus: 38, enduranceBonus: 28, value: 2000, description: 'A shard of the power crystal that once illuminated all of Atlantis.' },

  // Legendary (4)
  { id: 'mat_ark_stone', name: 'Stone of the Ark', emoji: '📦', type: 'relic_shard', rarity: 'legendary', skillBonus: 50, enduranceBonus: 50, value: 8000, description: 'A stone from the foundation of the legendary Ark. It vibrates with immense power.' },
  { id: 'mat_dragon_fossil', name: 'Dragon Fossil', emoji: '🐉', type: 'fossil', rarity: 'legendary', skillBonus: 45, enduranceBonus: 60, value: 10000, description: 'A complete fossil skeleton of what appears to be an actual dragon.' },
  { id: 'mat_time_sand', name: 'Hourglass of Time', emoji: '⌛', type: 'essence', rarity: 'legendary', skillBonus: 60, enduranceBonus: 40, value: 12000, description: 'An hourglass containing sand that flows backward. It slows time around its bearer.' },
  { id: 'mat_world_seed', name: 'Seed of the World', emoji: '🌱', type: 'essence', rarity: 'legendary', skillBonus: 40, enduranceBonus: 55, value: 15000, description: 'A seed from the World Tree Yggdrasil. It grows into any material known to exist.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: TQ_STRUCTURES — 25 Camp Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const TQ_STRUCTURES: readonly TqStructureDef[] = [
  // ── Excavation Tents (7) ──────────────────────────────────────
  { id: 'str_digging_tent', name: 'Digging Tent', emoji: '⛺', category: 'excavation_tent', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A basic tent for sheltering dig site workers and storing tools.' },
  { id: 'str_sifting_station', name: 'Sifting Station', emoji: '🔍', category: 'excavation_tent', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A sieving station for separating artifacts from soil and debris.' },
  { id: 'str_survey_post', name: 'Survey Post', emoji: '📐', category: 'excavation_tent', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'An elevated post for surveying the surrounding terrain and mapping dig sites.' },
  { id: 'str_ice_shelter', name: 'Ice Shelter', emoji: '🧊', category: 'excavation_tent', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'An insulated shelter for glacier excavations. Keeps explorers warm in subzero conditions.' },
  { id: 'str_diving_platform', name: 'Diving Platform', emoji: '🏊', category: 'excavation_tent', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A floating platform with equipment racks for underwater artifact recovery.' },
  { id: 'str_volcanic_bunker', name: 'Volcanic Bunker', emoji: '🛡️', category: 'excavation_tent', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'A heat-resistant bunker for safe volcanic zone operations.' },
  { id: 'str_jungle_canopy_base', name: 'Canopy Base', emoji: '🌴', category: 'excavation_tent', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'An elevated base camp built into the jungle canopy for aerial excavation surveys.' },

  // ── Research Labs (6) ──────────────────────────────────────────
  { id: 'str_field_lab', name: 'Field Research Lab', emoji: '🔬', category: 'research_lab', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A portable laboratory for on-site artifact analysis and carbon dating.' },
  { id: 'str_translation_bureau', name: 'Translation Bureau', emoji: '📚', category: 'research_lab', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A library of ancient languages and AI-assisted translation tools for decoding inscriptions.' },
  { id: 'str_fossil_prep', name: 'Fossil Preparation Lab', emoji: '🦕', category: 'research_lab', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A specialized lab for carefully removing rock matrix from delicate fossil specimens.' },
  { id: 'str_geology_lab', name: 'Advanced Geology Lab', emoji: '🌋', category: 'research_lab', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A state-of-the-art geological analysis facility for dating and compositional studies.' },
  { id: 'str_cartography_room', name: 'Cartography Room', emoji: '🗺️', category: 'research_lab', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A mapping center that integrates satellite data with ancient maps to locate hidden sites.' },
  { id: 'str_xray_vault', name: 'X-Ray Analysis Vault', emoji: '☢️', category: 'research_lab', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'A lead-lined vault with X-ray imaging for non-invasive artifact examination.' },

  // ── Artifact Vaults (5) ────────────────────────────────────────
  { id: 'str_display_case', name: 'Artifact Display Case', emoji: '🖼️', category: 'artifact_vault', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A climate-controlled display case for preserving and showcasing recovered artifacts.' },
  { id: 'str_climate_vault', name: 'Climate Vault', emoji: '❄️', category: 'artifact_vault', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'A sealed vault maintaining perfect humidity and temperature for fragile relics.' },
  { id: 'str_relic_archive', name: 'Relic Archive', emoji: '🗄️', category: 'artifact_vault', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A massive underground archive with enchanted preservation fields.' },
  { id: 'str_enchanted_sarcophagus', name: 'Enchanted Sarcophagus', emoji: '⚱️', category: 'artifact_vault', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A magically sealed sarcophagus that can contain even the most dangerous artifacts.' },
  { id: 'str_infinity_vault', name: 'Infinity Vault', emoji: '♾️', category: 'artifact_vault', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'A pocket-dimension vault with infinite storage capacity. Preserves artifacts for eternity.' },

  // ── Supply Depots (4) ──────────────────────────────────────────
  { id: 'str_supply_crate', name: 'Supply Crate', emoji: '📦', category: 'supply_depot', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A reinforced crate stocked with expedition essentials: rope, lights, and rations.' },
  { id: 'str_medical_station', name: 'Medical Station', emoji: '🏥', category: 'supply_depot', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'A fully equipped medical station for treating expedition injuries and tropical diseases.' },
  { id: 'str_comms_tower', name: 'Communications Tower', emoji: '📡', category: 'supply_depot', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A high-frequency tower for coordinating multiple excavation teams across vast distances.' },
  { id: 'str_helipad', name: 'Expedition Helipad', emoji: '🚁', category: 'supply_depot', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'A reinforced helipad for rapid deployment and supply drops to remote sites.' },

  // ── Relic Shrines (3) ──────────────────────────────────────────
  { id: 'str_ancient_altar', name: 'Ancient Altar', emoji: '🏛️', category: 'relic_shrine', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A reconstructed altar from a forgotten civilization that amplifies relic energy.' },
  { id: 'str_sacred_grove', name: 'Sacred Grove', emoji: '🌳', category: 'relic_shrine', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A grove of ancient trees where relic offerings are blessed by nature spirits.' },
  { id: 'str_cosmic_observatory', name: 'Cosmic Observatory', emoji: '🔭', category: 'relic_shrine', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'An observatory aligned to celestial bodies that can restore and upgrade ancient relics using starlight.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: TQ_ABILITIES — 22 Exploration Abilities
// ═══════════════════════════════════════════════════════════════════

export const TQ_ABILITIES: readonly TqAbilityDef[] = [
  { id: 'ab_brush_dust', name: 'Brush & Dust', emoji: '🪶', expeditionType: 'tomb', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Carefully brush away dust and debris to reveal hidden inscriptions.' },
  { id: 'ab_sonar_ping', name: 'Sonar Ping', emoji: '📡', expeditionType: 'diving', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Emit a sonar pulse to locate submerged artifacts in murky water.' },
  { id: 'ab_machete_chop', name: 'Machete Chop', emoji: '🔪', expeditionType: 'jungle', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Slice through dense vegetation to clear a path to hidden ruins.' },
  { id: 'ab_sand_scan', name: 'Sand Scan', emoji: '🏜️', expeditionType: 'desert', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 10, description: 'Scan the sand layers to detect buried structures beneath the dunes.' },
  { id: 'ab_ice_chip', name: 'Ice Chip', emoji: '⛏️', expeditionType: 'glacier', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 14, description: 'Chip through ice formations to extract perfectly preserved specimens.' },
  { id: 'ab_ash_brush', name: 'Ash Brush', emoji: '🌬️', expeditionType: 'volcanic', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 18, description: 'Gently brush away volcanic ash to uncover artifacts trapped beneath.' },
  { id: 'ab_coral_bloom', name: 'Coral Bloom', emoji: '🪸', expeditionType: 'underwater', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 11, description: 'Encourage coral growth to naturally dislodge artifacts from reef formations.' },
  { id: 'ab_trench_sense', name: 'Trench Sense', emoji: '🕳️', expeditionType: 'tomb', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Sense the safest path through treacherous tomb corridors filled with traps.' },
  { id: 'ab_deep_dive', name: 'Deep Dive', emoji: '🤿', expeditionType: 'diving', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 90, power: 35, description: 'Descend to extreme depths with enhanced pressure resistance for deep wreck recovery.' },
  { id: 'ab_canopy_sight', name: 'Canopy Sight', emoji: '🦅', expeditionType: 'jungle', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Ascend to the canopy for a bird\'s-eye view to spot hidden temple complexes.' },
  { id: 'ab_oasis_track', name: 'Oasis Track', emoji: '💧', expeditionType: 'desert', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 100, power: 32, description: 'Follow ancient underground water channels to locate buried oasis settlements.' },
  { id: 'ab_permafrost_melt', name: 'Permafrost Melt', emoji: '🔥', expeditionType: 'glacier', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 25, description: 'Carefully melt permafrost layers to access deeper fossil deposits without damage.' },
  { id: 'ab_lava_redirect', name: 'Lava Redirect', emoji: '🌋', expeditionType: 'volcanic', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 55, power: 30, description: 'Redirect a lava flow to reveal buried volcanic chambers and their contents.' },
  { id: 'ab_current_ride', name: 'Current Ride', emoji: '🌊', expeditionType: 'underwater', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 80, power: 22, description: 'Harness ocean currents to travel rapidly between distant underwater excavation sites.' },
  { id: 'ab_seal_break', name: 'Seal Break', emoji: '🔓', expeditionType: 'tomb', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Break ancient tomb seals using precise resonant frequency techniques without damaging contents.' },
  { id: 'ab_pressure_adapt', name: 'Pressure Adapt', emoji: '💎', expeditionType: 'diving', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Passively adapt to crushing deep-sea pressure, enabling unlimited depth exploration.' },
  { id: 'ab_vine_grapple', name: 'Vine Grapple', emoji: '🌿', expeditionType: 'jungle', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 110, power: 45, description: 'Use enchanted vines to grapple across chasms and climb vertical temple walls.' },
  { id: 'ab_heat_resist', name: 'Heat Resistance', emoji: '☀️', expeditionType: 'desert', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Resist extreme desert heat, doubling excavation time before needing rest.' },
  { id: 'ab_frost_shield', name: 'Frost Shield', emoji: '❄️', expeditionType: 'glacier', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 120, power: 40, description: 'Generate a protective frost barrier that shields the team from avalanches and ice collapses.' },
  { id: 'ab_passage_find', name: 'Passage Finder', emoji: '🚪', expeditionType: 'tomb', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Reveal all hidden passages and secret rooms within a tomb complex instantly.' },
  { id: 'ab_desert_sovereign', name: 'Desert Sovereign', emoji: '👑', expeditionType: 'desert', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'Command the desert itself to part, revealing every buried structure within a mile.' },
  { id: 'ab_royal_decree', name: 'Royal Decree', emoji: '📜', expeditionType: 'tomb', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'Invoke the authority of ancient pharaohs to command tomb guardians to stand aside.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: TQ_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const TQ_ACHIEVEMENTS: readonly TqAchievementDef[] = [
  { id: 'ach_first_recruit', name: 'First Recruitment', emoji: '🧑‍🔬', description: 'Recruit your first explorer.', condition: 'recruit_1', reward: { gold: 50, renown: 10 } },
  { id: 'ach_five_recruits', name: 'Expedition Force', emoji: '🤚', description: 'Recruit 5 different explorers.', condition: 'recruit_5', reward: { gold: 200, renown: 40 } },
  { id: 'ach_first_excavate', name: 'Artifact Collector', emoji: '🏺', description: 'Excavate a material for the first time.', condition: 'excavate_1', reward: { gold: 80, renown: 15 } },
  { id: 'ach_ten_excavates', name: 'Master Excavator', emoji: '⛏️', description: 'Excavate materials 10 times.', condition: 'excavate_10', reward: { gold: 300, renown: 60 } },
  { id: 'ach_first_build', name: 'Camp Founder', emoji: '🏗️', description: 'Build your first camp structure.', condition: 'build_1', reward: { gold: 100, renown: 20 } },
  { id: 'ach_five_builds', name: 'Camp Architect', emoji: '🏛️', description: 'Build 5 different camp structures.', condition: 'build_5', reward: { gold: 500, renown: 80 } },
  { id: 'ach_ruin_explore', name: 'Ruin Explorer', emoji: '🗺️', description: 'Explore 4 different ancient ruins.', condition: 'ruin_4', reward: { gold: 400, renown: 50 } },
  { id: 'ach_all_ruins', name: 'World Cartographer', emoji: '🌍', description: 'Explore all 8 ancient ruins.', condition: 'ruin_8', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_rare_recruit', name: 'Rare Find', emoji: '💎', description: 'Recruit a rare explorer.', condition: 'rare_recruit', reward: { gold: 500, renown: 100 } },
  { id: 'ach_epic_recruit', name: 'Epic Discovery', emoji: '🌟', description: 'Recruit an epic explorer.', condition: 'epic_recruit', reward: { gold: 1500, renown: 250 } },
  { id: 'ach_legendary_recruit', name: 'Legendary Recruiter', emoji: '👑', description: 'Recruit a legendary explorer.', condition: 'legendary_recruit', reward: { gold: 5000, renown: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first relic.', condition: 'relic_1', reward: { gold: 300, renown: 60 } },
  { id: 'ach_five_relics', name: 'Relic Hunter', emoji: '🔍', description: 'Collect 5 different relics.', condition: 'relic_5', reward: { gold: 1000, renown: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first expedition event.', condition: 'event_1', reward: { gold: 200, renown: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 expedition events.', condition: 'event_10', reward: { gold: 800, renown: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_all_types', name: 'Expedition Master', emoji: '🌈', description: 'Recruit at least one explorer of each expedition type.', condition: 'all_types', reward: { gold: 3000, renown: 300 } },
  { id: 'ach_max_title', name: 'Terra Deity', emoji: '👑', description: 'Reach the title of Terra Deity.', condition: 'max_title', reward: { gold: 10000, renown: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: TQ_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const TQ_TITLES: readonly TqTitleDef[] = [
  { id: 'title_dirt_scraper', name: 'Dirt Scraper', emoji: '🪨', minRenown: 0, minExplorers: 0, description: 'A beginner who has just started scraping dirt in search of artifacts.' },
  { id: 'title_digger', name: 'Rookie Digger', emoji: '⛏️', minRenown: 50, minExplorers: 3, description: 'A competent digger who can operate basic excavation equipment and identify common artifacts.' },
  { id: 'title_excavator', name: 'Master Excavator', emoji: '🏗️', minRenown: 200, minExplorers: 7, description: 'A skilled excavator who leads small teams and manages complex dig sites.' },
  { id: 'title_researcher', name: 'Field Researcher', emoji: '🔬', minRenown: 500, minExplorers: 12, description: 'A published researcher whose discoveries have contributed to archaeological science.' },
  { id: 'title_expedition_leader', name: 'Expedition Leader', emoji: '🧭', minRenown: 1200, minExplorers: 18, description: 'A veteran leader who commands multi-site expeditions across the globe.' },
  { id: 'title_relic_seeker', name: 'Relic Seeker', emoji: '🏺', minRenown: 2500, minExplorers: 24, description: 'A renowned seeker of ancient relics whose collection rivals national museums.' },
  { id: 'title_terra_scholar', name: 'Terra Scholar', emoji: '📜', minRenown: 5000, minExplorers: 30, description: 'A living legend whose knowledge of Earth\'s hidden history is unparalleled.' },
  { id: 'title_terra_deity', name: 'Terra Deity', emoji: '👑', minRenown: 10000, minExplorers: 35, description: 'The supreme Terra Deity, master of all expeditions and guardian of Earth\'s ancient secrets.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: TQ_RELICS — 15 Legendary Ancient Relics
// ═══════════════════════════════════════════════════════════════════

export const TQ_RELICS: readonly TqRelicDef[] = [
  { id: 'relic_excalibur', name: 'Excalibur Shard', emoji: '🗡️', rarity: 'epic', expeditionType: 'tomb', skillBoost: 20, enduranceBoost: 15, agilityBoost: 10, value: 2000, description: 'A fragment of the legendary sword Excalibur, unearthed from a forgotten burial mound.' },
  { id: 'relic_stone_tablet', name: 'Stone of Scribes', emoji: '📜', rarity: 'epic', expeditionType: 'desert', skillBoost: 35, enduranceBoost: 5, agilityBoost: 5, value: 2200, description: 'A stone tablet inscribed with every known ancient writing system. It translates itself to the reader.' },
  { id: 'relic_trident', name: 'Poseidon Trident Tip', emoji: '🔱', rarity: 'rare', expeditionType: 'diving', skillBoost: 10, enduranceBoost: 10, agilityBoost: 15, value: 800, description: 'The tip of Poseidon\'s trident, recovered from an underwater shrine. It commands the tides.' },
  { id: 'relic_vine_crown', name: 'Green Crown', emoji: '🌿', rarity: 'rare', expeditionType: 'jungle', skillBoost: 5, enduranceBoost: 20, agilityBoost: 10, value: 750, description: 'A living crown of ancient vines that never wilts. It grants mastery over jungle terrain.' },
  { id: 'relic_shadow_mask', name: 'Shadow Priest Mask', emoji: '🎭', rarity: 'epic', expeditionType: 'tomb', skillBoost: 25, enduranceBoost: 20, agilityBoost: 15, value: 2500, description: 'A mask that allows the wearer to see through walls and detect hidden chambers.' },
  { id: 'relic_pearl_depth', name: 'Abyssal Pearl', emoji: '珍珠', rarity: 'epic', expeditionType: 'underwater', skillBoost: 15, enduranceBoost: 15, agilityBoost: 25, value: 2400, description: 'A pearl from the deepest ocean trench. It allows the bearer to breathe underwater indefinitely.' },
  { id: 'relic_fire_hammer', name: 'Vulcan Hammer', emoji: '🔨', rarity: 'epic', expeditionType: 'volcanic', skillBoost: 20, enduranceBoost: 25, agilityBoost: 10, value: 2600, description: 'A hammer forged by Vulcan himself. It can shape any mineral and withstand any heat.' },
  { id: 'relic_sun_stone', name: 'Sun Stone of Heliopolis', emoji: '☀️', rarity: 'legendary', expeditionType: 'desert', skillBoost: 40, enduranceBoost: 30, agilityBoost: 20, value: 8000, description: 'A stone that absorbs and redirects sunlight. It illuminates the darkest tombs.' },
  { id: 'relic_moon_obelisk', name: 'Moon Obelisk Fragment', emoji: '🌑', rarity: 'legendary', expeditionType: 'glacier', skillBoost: 30, enduranceBoost: 40, agilityBoost: 15, value: 7500, description: 'A shard of an obelisk that stores moonlight. It can freeze time in a ten-meter radius.' },
  { id: 'relic_serpent_staff', name: 'Serpent Staff', emoji: '🐍', rarity: 'legendary', expeditionType: 'jungle', skillBoost: 60, enduranceBoost: 20, agilityBoost: 20, value: 10000, description: 'A staff carved from a single serpent stone. It charms all creatures and reveals hidden paths.' },
  { id: 'relic_noah_compass', name: 'Noah\'s Compass', emoji: '🧭', rarity: 'legendary', expeditionType: 'diving', skillBoost: 25, enduranceBoost: 35, agilityBoost: 30, value: 9000, description: 'The compass that guided Noah\'s ark. It points toward the nearest undiscovered ruin.' },
  { id: 'relic_ice_crown', name: 'Crown of the Frost King', emoji: '👑', rarity: 'legendary', expeditionType: 'glacier', skillBoost: 35, enduranceBoost: 35, agilityBoost: 25, value: 9500, description: 'The crown of a mythical frost king. It grants immunity to cold and reveals ice-locked secrets.' },
  { id: 'relic_scroll', name: 'Scroll of Atlantis', emoji: '📜', rarity: 'epic', expeditionType: 'underwater', skillBoost: 20, enduranceBoost: 15, agilityBoost: 30, value: 2300, description: 'A waterproof scroll from the library of Atlantis containing maps to other lost cities.' },
  { id: 'relic_fire_gem', name: 'Heart of the Volcano', emoji: '🔶', rarity: 'legendary', expeditionType: 'volcanic', skillBoost: 50, enduranceBoost: 45, agilityBoost: 25, value: 11000, description: 'A gemstone formed in the Earth\'s core. It grants mastery over all geological formations.' },
  { id: 'relic_earth_seed', name: 'Seed of Creation', emoji: '🌱', rarity: 'legendary', expeditionType: 'tomb', skillBoost: 30, enduranceBoost: 30, agilityBoost: 40, value: 12000, description: 'The primordial seed from which all ancient civilizations sprang. It reveals the deepest truths of the earth.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: TQ_EVENTS — 12 Expedition Events
// ═══════════════════════════════════════════════════════════════════

export const TQ_EVENTS: readonly TqEventDef[] = [
  { id: 'evt_sandstorm', name: 'Great Sandstorm', emoji: '🌪️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Desert exploration speed reduced by 30%. Tomb explorers immune.', description: 'A massive sandstorm engulfs the region, reducing visibility and blocking desert routes.' },
  { id: 'evt_earthquake', name: 'Ancient Earthquake', emoji: '💥', durationTurns: 3, effectType: 'special', effectDescription: 'New ruin passages revealed. Volcanic explorers gain +50 power.', description: 'Seismic activity shakes the ground, opening new passages in ancient structures.' },
  { id: 'evt_monsoon', name: 'Monsoon Season', emoji: '🌧️', durationTurns: 4, effectType: 'buff', effectDescription: 'Jungle explorers double power. Underwater materials more common.', description: 'Heavy rains flood the jungle lowlands, revealing artifacts previously hidden by canopy.' },
  { id: 'evt_permafrost_melt', name: 'Permafrost Melt', emoji: '🌡️', durationTurns: 5, effectType: 'buff', effectDescription: 'Glacier excavation yields doubled. Rare fossils appear.', description: 'Unusual warmth causes permafrost to melt rapidly, exposing fossils frozen for millennia.' },
  { id: 'evt_volcanic_eruption', name: 'Volcanic Eruption', emoji: '🌋', durationTurns: 3, effectType: 'debuff', effectDescription: 'Volcanic zone inaccessible. Obsidian materials become available.', description: 'A nearby volcano erupts violently. The ash fallout creates new obsidian deposits.' },
  { id: 'evt_gold_rush', name: 'Artifact Gold Rush', emoji: '💰', durationTurns: 5, effectType: 'buff', effectDescription: 'Gold rewards doubled. Desert explorers gain +30% power.', description: 'News of a major discovery spreads. Funding pours in and morale skyrockets.' },
  { id: 'evt_solar_eclipse', name: 'Solar Eclipse', emoji: '🌑', durationTurns: 2, effectType: 'special', effectDescription: 'Tomb explorers triple power. Ancient inscriptions glow.', description: 'The sun darkens. Ancient inscriptions begin to glow, revealing hidden messages in tomb walls.' },
  { id: 'evt_pirate_raid', name: 'Pirate Raid', emoji: '🏴‍☠️', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% gold. Rare diving artifacts may appear.', description: 'Pirates raid the coastal supply depot! But their sunken loot contains rare treasures.' },
  { id: 'evt_ancient_ritual', name: 'Ancient Ritual', emoji: '🕯️', durationTurns: 3, effectType: 'buff', effectDescription: 'All explorer stamina restored. Relic discovery chance increased.', description: 'A mysterious ancient ritual activates in a nearby ruin, boosting all expedition efforts.' },
  { id: 'evt_ice_age', name: 'Mini Ice Age', emoji: '🥶', durationTurns: 5, effectType: 'debuff', effectDescription: 'Glacier explorers thrive. Jungle and desert power halved.', description: 'A sudden cold snap freezes the region. Only glacier-equipped explorers can operate effectively.' },
  { id: 'evt_ley_line', name: 'Ley Line Surge', emoji: '✨', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus renown for each exploration. Structure effects doubled.', description: 'Ancient ley lines pulse with energy, amplifying the power of camp structures.' },
  { id: 'evt_migration', name: 'Great Explorer Migration', emoji: '🧭', durationTurns: 6, effectType: 'buff', effectDescription: 'Recruitment cost halved. New explorer species available.', description: 'Explorers from around the world converge on the expedition. The perfect time to recruit new talent.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const TQ_MAX_EXPLORER_LEVEL = 50
const TQ_MAX_STRUCTURE_LEVEL = 10
const TQ_INITIAL_GOLD = 200
const TQ_INITIAL_RENOWN = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function tqXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function tqCalcStats(species: TqExplorerSpecies, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    skillPower: Math.floor(species.skillPower * growth),
    endurancePower: Math.floor(species.endurancePower * growth),
    agility: Math.floor(species.agility * growth),
  }
}

let _tqIdCounter = 0
function tqGenerateId(): string {
  _tqIdCounter += 1
  return `tq_${_tqIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function tqFindExplorerSpecies(id: string): TqExplorerSpecies | undefined {
  return TQ_EXPLORERS.find((s) => s.id === id)
}

function tqFindRuin(id: string): TqRuinDef | undefined {
  return TQ_RUINS.find((z) => z.id === id)
}

function tqFindMaterial(id: string): TqMaterialDef | undefined {
  return TQ_MATERIALS.find((m) => m.id === id)
}

function tqFindStructureDef(id: string): TqStructureDef | undefined {
  return TQ_STRUCTURES.find((s) => s.id === id)
}

function tqFindAbility(id: string): TqAbilityDef | undefined {
  return TQ_ABILITIES.find((a) => a.id === id)
}

function tqFindRelic(id: string): TqRelicDef | undefined {
  return TQ_RELICS.find((r) => r.id === id)
}

function tqFindAchievement(id: string): TqAchievementDef | undefined {
  return TQ_ACHIEVEMENTS.find((a) => a.id === id)
}

function tqFindTitle(id: TqTitleId): TqTitleDef | undefined {
  return TQ_TITLES.find((t) => t.id === id)
}

function tqRarityMultiplier(rarity: TqRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function tqRarityColor(rarity: TqRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function tqExpeditionColor(expeditionType: TqExpeditionType): string {
  switch (expeditionType) {
    case 'tomb': return TQ_EARTH_BROWN
    case 'diving': return TQ_OCEAN_TEAL
    case 'jungle': return TQ_JUNGLE_GREEN
    case 'desert': return TQ_SAND_BEIGE
    case 'glacier': return TQ_GLACIER_CYAN
    case 'volcanic': return TQ_LAVA_ORANGE
    case 'underwater': return TQ_OBSIDIAN_BLACK
    default: return '#888888'
  }
}

export function tqCheckSynergy(attacker: TqExpeditionType, defender: TqExpeditionType): number {
  const advantages = TQ_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = TQ_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function tqCalcStructureUpgradeCost(def: TqStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function tqCalcMaxTitle(renown: number, explorerCount: number): TqTitleId {
  let bestId: TqTitleId = 'title_dirt_scraper'
  for (const title of TQ_TITLES) {
    if (renown >= title.minRenown && explorerCount >= title.minExplorers) {
      bestId = title.id
    }
  }
  return bestId
}

function tqCheckAchievementCondition(
  condition: string,
  state: TqStoreState
): boolean {
  switch (condition) {
    case 'recruit_1':
      return state.totalRecruited >= 1
    case 'recruit_5':
      return state.totalRecruited >= 5
    case 'excavate_1':
      return state.totalExcavated >= 1
    case 'excavate_10':
      return state.totalExcavated >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'ruin_4':
      return state.ruins.length >= 4
    case 'ruin_8':
      return state.ruins.length >= 8
    case 'rare_recruit':
      return state.explorers.some((s) => {
        const sp = tqFindExplorerSpecies(s.speciesId)
        return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'epic_recruit':
      return state.explorers.some((s) => {
        const sp = tqFindExplorerSpecies(s.speciesId)
        return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'legendary_recruit':
      return state.explorers.some((s) => {
        const sp = tqFindExplorerSpecies(s.speciesId)
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
    case 'all_types': {
      const types = new Set<TqExpeditionType>()
      for (const s of state.explorers) {
        const sp = tqFindExplorerSpecies(s.speciesId)
        if (sp) types.add(sp.expeditionType)
      }
      return types.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_terra_deity'
    default:
      return false
  }
}

function tqPickRandomEvent(): TqEventDef {
  const idx = Math.floor(Math.random() * TQ_EVENTS.length)
  return TQ_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useTQStore = create<TqFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      explorers: [] as TqExplorerInstance[],
      ruins: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as TqStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_dirt_scraper' as TqTitleId,
      gold: TQ_INITIAL_GOLD,
      renown: TQ_INITIAL_RENOWN,
      totalRecruited: 0,
      totalExcavated: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as TqEventDef | null,
      eventTurnsRemaining: 0,
      activeRuin: null as string | null,

      // ── tqRecruitExplorer ──────────────────────────────────────
      tqRecruitExplorer: (speciesId: string): boolean => {
        const species = tqFindExplorerSpecies(speciesId)
        if (!species) return false
        const cost = Math.floor(50 * tqRarityMultiplier(species.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = tqCalcStats(species, 1)
        const newExplorer: TqExplorerInstance = {
          id: tqGenerateId(),
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          skillPower: stats.skillPower,
          endurancePower: stats.endurancePower,
          agility: stats.agility,
          morale: 80,
          stamina: 70,
          recruitedAt: Date.now(),
        }
        set((prev) => {
          const updated = {
            explorers: [...prev.explorers, newExplorer],
            gold: prev.gold - cost,
            totalRecruited: prev.totalRecruited + 1,
            renown: prev.renown + tqRarityMultiplier(species.rarity) * 5,
            currentTitle: tqCalcMaxTitle(
              prev.renown + tqRarityMultiplier(species.rarity) * 5,
              prev.explorers.length + 1
            ),
          }
          return updated
        })
        return true
      },

      // ── tqDismissExplorer ──────────────────────────────────────
      tqDismissExplorer: (explorerId: string): boolean => {
        const state = get()
        const exists = state.explorers.find((s) => s.id === explorerId)
        if (!exists) return false
        const species = tqFindExplorerSpecies(exists.speciesId)
        const refund = species ? Math.floor(25 * tqRarityMultiplier(species.rarity)) : 10
        set((prev) => ({
          explorers: prev.explorers.filter((s) => s.id !== explorerId),
          gold: prev.gold + refund,
          currentTitle: tqCalcMaxTitle(prev.renown, prev.explorers.length - 1),
        }))
        return true
      },

      // ── tqTrainExplorer ────────────────────────────────────────
      tqTrainExplorer: (explorerId: string): boolean => {
        const trainCost = 10
        const state = get()
        if (state.gold < trainCost) return false
        set((prev) => {
          const explorers = prev.explorers.map((s) => {
            if (s.id !== explorerId) return s
            const newXp = s.xp + 20
            const xpNeeded = tqXpForLevel(s.level)
            let newLevel = s.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && s.level < TQ_MAX_EXPLORER_LEVEL) {
              newLevel = s.level + 1
              currentXp = newXp - xpNeeded
            }
            const species = tqFindExplorerSpecies(s.speciesId)
            const stats = species ? tqCalcStats(species, newLevel) : { skillPower: s.skillPower, endurancePower: s.endurancePower, agility: s.agility }
            return {
              ...s,
              level: newLevel,
              xp: currentXp,
              skillPower: stats.skillPower,
              endurancePower: stats.endurancePower,
              agility: stats.agility,
              morale: Math.min(100, s.morale + 10),
              stamina: Math.min(100, s.stamina + 20),
            }
          })
          return { explorers, gold: prev.gold - trainCost, renown: prev.renown + 2 }
        })
        return true
      },

      // ── tqExcavateMaterial ─────────────────────────────────────
      tqExcavateMaterial: (explorerId: string): boolean => {
        const state = get()
        const explorer = state.explorers.find((s) => s.id === explorerId)
        if (!explorer) return false
        if (explorer.stamina < 20) return false
        const species = tqFindExplorerSpecies(explorer.speciesId)
        if (!species) return false
        const materialId = `mat_${species.expeditionType}_${species.rarity}`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(explorer.skillPower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalExcavated: prev.totalExcavated + 1,
          renown: prev.renown + 3,
          explorers: prev.explorers.map((s) =>
            s.id === explorerId ? { ...s, stamina: Math.max(0, s.stamina - 20) } : s
          ),
        }))
        return true
      },

      // ── tqBuildStructure ───────────────────────────────────────
      tqBuildStructure: (structureDefId: string): boolean => {
        const def = tqFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: TqStructureInstance = {
          id: tqGenerateId(),
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

      // ── tqUpgradeStructure ─────────────────────────────────────
      tqUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= TQ_MAX_STRUCTURE_LEVEL) return false
        const def = tqFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = tqCalcStructureUpgradeCost(def, structure.level)
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

      // ── tqExploreRuin ──────────────────────────────────────────
      tqExploreRuin: (ruinId: string): TqEventDef | null => {
        const ruin = tqFindRuin(ruinId)
        if (!ruin) return null
        const state = get()
        const requiredTitleIdx = TQ_TITLES.findIndex((t) => t.id === ruin.requiredTitle)
        const currentTitleIdx = TQ_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newRuins = state.ruins.includes(ruinId) ? state.ruins : [...state.ruins, ruinId]
        const event = tqPickRandomEvent()
        set((prev) => ({
          ruins: newRuins,
          activeRuin: ruinId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          renown: prev.renown + 5,
        }))
        return event
      },

      // ── tqCollectRelic ─────────────────────────────────────────
      tqCollectRelic: (relicId: string): boolean => {
        const relic = tqFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => ({
          relics: [...prev.relics, relicId],
          renown: prev.renown + Math.floor(tqRarityMultiplier(relic.rarity) * 20),
          currentTitle: tqCalcMaxTitle(
            prev.renown + Math.floor(tqRarityMultiplier(relic.rarity) * 20),
            prev.explorers.length
          ),
        }))
        return true
      },

      // ── tqUnlockAbility ────────────────────────────────────────
      tqUnlockAbility: (abilityId: string): boolean => {
        const ability = tqFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * tqRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── tqUnlockTitle ──────────────────────────────────────────
      tqUnlockTitle: (titleId: TqTitleId): boolean => {
        const title = tqFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.renown < title.minRenown) return false
        if (state.explorers.length < title.minExplorers) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── tqClaimAchievement ─────────────────────────────────────
      tqClaimAchievement: (achievementId: string): boolean => {
        const achievement = tqFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!tqCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + achievement.reward.gold,
          renown: prev.renown + achievement.reward.renown,
          currentTitle: tqCalcMaxTitle(
            prev.renown + achievement.reward.renown,
            prev.explorers.length
          ),
        }))
        return true
      },

      // ── tqTradeMaterial ────────────────────────────────────────
      tqTradeMaterial: (materialId: string, count: number): number => {
        const material = tqFindMaterial(materialId)
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

      // ── tqEndEvent ─────────────────────────────────────────────
      tqEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── tqResetEvent ───────────────────────────────────────────
      tqResetEvent: () => {
        const event = tqPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'terra-quest-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useTerraQuest()
// ═══════════════════════════════════════════════════════════════════

export default function useTerraQuest(): TqAPI {
  const tqStore = useTQStore()

  // ── Computed: Owned explorers with species info ───────────────
  const tqOwnedExplorers = useMemo(() => {
    return tqStore.explorers.map((s) => {
      const species = tqFindExplorerSpecies(s.speciesId)
      return {
        ...s,
        species,
        expeditionColor: species ? tqExpeditionColor(species.expeditionType) : '#888888',
        rarityColor: species ? tqRarityColor(species.rarity) : '#888888',
      }
    })
  }, [tqStore])

  // ── Computed: Available explorer species to recruit ───────────
  const tqAvailableSpecies = useMemo(() => {
    return TQ_EXPLORERS.filter((sp) => {
      const cost = Math.floor(50 * tqRarityMultiplier(sp.rarity))
      return tqStore.gold >= cost
    })
  }, [tqStore])

  // ── Computed: Current title details ───────────────────────────
  const tqCurrentTitleDetail = useMemo(() => {
    return tqFindTitle(tqStore.currentTitle) ?? TQ_TITLES[0]
  }, [tqStore])

  // ── Computed: Next title info ─────────────────────────────────
  const tqNextTitle = useMemo(() => {
    const currentIdx = TQ_TITLES.findIndex((t) => t.id === tqStore.currentTitle)
    if (currentIdx >= TQ_TITLES.length - 1) return null
    return TQ_TITLES[currentIdx + 1]
  }, [tqStore])

  // ── Computed: Active ruin details ─────────────────────────────
  const tqActiveRuinDetail = useMemo(() => {
    if (!tqStore.activeRuin) return null
    return tqFindRuin(tqStore.activeRuin) ?? null
  }, [tqStore])

  // ── Computed: Unexplored ruins ────────────────────────────────
  const tqUnexploredRuins = useMemo(() => {
    return TQ_RUINS.filter((z) => !tqStore.ruins.includes(z.id))
  }, [tqStore])

  // ── Computed: Structures with defs ────────────────────────────
  const tqBuiltStructures = useMemo(() => {
    return tqStore.structures.map((s) => {
      const def = tqFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [tqStore])

  // ── Computed: Unlockable abilities ────────────────────────────
  const tqUnlockableAbilities = useMemo(() => {
    return TQ_ABILITIES.filter((a) => {
      if (tqStore.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * tqRarityMultiplier(a.rarity))
      return tqStore.gold >= cost
    })
  }, [tqStore])

  // ── Computed: Owned relics with defs ──────────────────────────
  const tqOwnedRelics = useMemo(() => {
    return tqStore.relics.map((rId) => {
      const def = tqFindRelic(rId)
      return def ?? null
    }).filter((r): r is TqRelicDef => r !== null)
  }, [tqStore])

  // ── Computed: Unclaimed achievements ──────────────────────────
  const tqUnclaimedAchievements = useMemo(() => {
    return TQ_ACHIEVEMENTS.filter((a) => {
      if (tqStore.achievements.includes(a.id)) return false
      return tqCheckAchievementCondition(a.condition, tqStore)
    })
  }, [tqStore])

  // ── Computed: Materials with defs ─────────────────────────────
  const tqInventoryMaterials = useMemo(() => {
    return tqStore.materials.map((m) => {
      const def = tqFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [tqStore])

  // ── Computed: Total structure effect bonus ────────────────────
  const tqTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of tqStore.structures) {
      const def = tqFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [tqStore])

  // ── Computed: Average explorer level ──────────────────────────
  const tqAverageExplorerLevel = useMemo(() => {
    if (tqStore.explorers.length === 0) return 0
    const total = tqStore.explorers.reduce((sum, s) => sum + s.level, 0)
    return Math.floor(total / tqStore.explorers.length)
  }, [tqStore])

  // ── Computed: Total explorer power ────────────────────────────
  const tqTotalExplorerPower = useMemo(() => {
    return tqStore.explorers.reduce(
      (sum, s) => sum + s.skillPower + s.endurancePower + s.agility,
      0
    )
  }, [tqStore])

  // ── Computed: Expedition type distribution ────────────────────
  const tqExpeditionDistribution = useMemo(() => {
    const counts: Record<TqExpeditionType, number> = {
      tomb: 0, diving: 0, jungle: 0, desert: 0, glacier: 0, volcanic: 0, underwater: 0,
    }
    for (const s of tqStore.explorers) {
      const sp = tqFindExplorerSpecies(s.speciesId)
      if (sp) counts[sp.expeditionType]++
    }
    return counts
  }, [tqStore])

  // ── Computed: Rarity distribution ─────────────────────────────
  const tqRarityDistribution = useMemo(() => {
    const counts: Record<TqRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const s of tqStore.explorers) {
      const sp = tqFindExplorerSpecies(s.speciesId)
      if (sp) counts[sp.rarity]++
    }
    return counts
  }, [tqStore])

  // ── Computed: Explorers by rarity ─────────────────────────────
  const tqExplorersByRarity = useMemo(() => {
    const groups: Record<TqRarity, TqExplorerInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const s of tqStore.explorers) {
      const sp = tqFindExplorerSpecies(s.speciesId)
      if (sp) groups[sp.rarity].push(s)
    }
    return groups
  }, [tqStore])

  // ── Computed: Explorers by expedition type ────────────────────
  const tqExplorersByExpedition = useMemo(() => {
    const groups: Record<TqExpeditionType, TqExplorerInstance[]> = {
      tomb: [], diving: [], jungle: [], desert: [], glacier: [], volcanic: [], underwater: [],
    }
    for (const s of tqStore.explorers) {
      const sp = tqFindExplorerSpecies(s.speciesId)
      if (sp) groups[sp.expeditionType].push(s)
    }
    return groups
  }, [tqStore])

  // ── Computed: Progress to next title ──────────────────────────
  const tqTitleProgress = useMemo(() => {
    const currentIdx = TQ_TITLES.findIndex((t) => t.id === tqStore.currentTitle)
    const next = currentIdx >= TQ_TITLES.length - 1 ? null : TQ_TITLES[currentIdx + 1]
    if (!next) return { percent: 100, renownNeeded: 0, explorersNeeded: 0 }
    const renownProgress = Math.min(100, (tqStore.renown / next.minRenown) * 100)
    const explorerProgress = Math.min(100, (tqStore.explorers.length / next.minExplorers) * 100)
    return {
      percent: Math.floor((renownProgress + explorerProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - tqStore.renown),
      explorersNeeded: Math.max(0, next.minExplorers - tqStore.explorers.length),
    }
  }, [tqStore])

  // ── Computed: Rare materials count ────────────────────────────
  const tqRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of tqStore.materials) {
      const def = tqFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [tqStore])

  // ── Computed: Exhausted explorers ─────────────────────────────
  const tqExhaustedExplorers = useMemo(() => {
    return tqStore.explorers.filter((s) => s.stamina < 30)
  }, [tqStore])

  // ── Computed: Low morale explorers ────────────────────────────
  const tqLowMoraleExplorers = useMemo(() => {
    return tqStore.explorers.filter((s) => s.morale < 30)
  }, [tqStore])

  // ── Computed: Total relic boost ───────────────────────────────
  const tqTotalRelicBoost = useMemo(() => {
    let skillBoost = 0
    let enduranceBoost = 0
    let agilityBoost = 0
    for (const rId of tqStore.relics) {
      const relic = tqFindRelic(rId)
      if (relic) {
        skillBoost += relic.skillBoost
        enduranceBoost += relic.enduranceBoost
        agilityBoost += relic.agilityBoost
      }
    }
    return { skillBoost, enduranceBoost, agilityBoost }
  }, [tqStore])

  // ═════════════════════════════════════════════════════════════
  // Return tqAPI object
  // ═════════════════════════════════════════════════════════════

  const tqAPI: TqAPI = {
    // ── Direct constants ──────────────────────────────────────
    TQ_EARTH_BROWN,
    TQ_SAND_BEIGE,
    TQ_JUNGLE_GREEN,
    TQ_OCEAN_TEAL,
    TQ_GLACIER_CYAN,
    TQ_LAVA_ORANGE,
    TQ_OBSIDIAN_BLACK,
    TQ_GOLD_TREASURE,
    TQ_EXPEDITION_TYPES,
    TQ_EXPLORERS,
    TQ_RUINS,
    TQ_MATERIALS,
    TQ_STRUCTURES,
    TQ_ABILITIES,
    TQ_ACHIEVEMENTS,
    TQ_TITLES,
    TQ_RELICS,
    TQ_EVENTS,
    tqCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    explorers: tqStore.explorers,
    ruins: tqStore.ruins,
    materials: tqStore.materials,
    structures: tqStore.structures,
    abilities: tqStore.abilities,
    achievements: tqStore.achievements,
    relics: tqStore.relics,
    currentTitle: tqStore.currentTitle,
    gold: tqStore.gold,
    renown: tqStore.renown,
    totalRecruited: tqStore.totalRecruited,
    totalExcavated: tqStore.totalExcavated,
    totalBuilt: tqStore.totalBuilt,
    totalEventsFaced: tqStore.totalEventsFaced,
    activeEvent: tqStore.activeEvent,
    eventTurnsRemaining: tqStore.eventTurnsRemaining,
    activeRuin: tqStore.activeRuin,

    // ── Store actions ─────────────────────────────────────────
    tqRecruitExplorer: tqStore.tqRecruitExplorer,
    tqDismissExplorer: tqStore.tqDismissExplorer,
    tqTrainExplorer: tqStore.tqTrainExplorer,
    tqExcavateMaterial: tqStore.tqExcavateMaterial,
    tqBuildStructure: tqStore.tqBuildStructure,
    tqUpgradeStructure: tqStore.tqUpgradeStructure,
    tqExploreRuin: tqStore.tqExploreRuin,
    tqCollectRelic: tqStore.tqCollectRelic,
    tqUnlockAbility: tqStore.tqUnlockAbility,
    tqUnlockTitle: tqStore.tqUnlockTitle,
    tqClaimAchievement: tqStore.tqClaimAchievement,
    tqTradeMaterial: tqStore.tqTradeMaterial,
    tqEndEvent: tqStore.tqEndEvent,
    tqResetEvent: tqStore.tqResetEvent,

    // ── Computed getters ──────────────────────────────────────
    tqOwnedExplorers,
    tqAvailableSpecies,
    tqCurrentTitleDetail,
    tqNextTitle,
    tqActiveRuinDetail,
    tqUnexploredRuins,
    tqBuiltStructures,
    tqUnlockableAbilities,
    tqOwnedRelics,
    tqUnclaimedAchievements,
    tqInventoryMaterials,
    tqTotalStructureEffect,
    tqAverageExplorerLevel,
    tqTotalExplorerPower,
    tqExpeditionDistribution,
    tqRarityDistribution,
    tqExplorersByRarity,
    tqExplorersByExpedition,
    tqTitleProgress,
    tqRareMaterialCount,
    tqExhaustedExplorers,
    tqLowMoraleExplorers,
    tqTotalRelicBoost,
  }

  return tqAPI
}
