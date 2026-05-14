/**
 * Neon Shrine Wire — Neon Shrine (Neon Shrine) feature module
 *
 * A cyberpunk neon temple digital shrine mini-game: worship 35 digital
 * deities across 7 neon factions, maintain 8 shrine circuits, collect 30
 * data/neon materials, build 25 shrine structures, unlock 22 neon abilities,
 * discover 15 legendary digital artifacts, face 12 glitch events, and
 * ascend through 8 titles from Data Novice to Neon Deity — backed by
 * a Zustand store with persist middleware.
 *
 * Storage key: neon-shrine-wire
 * Prefix: ns / NS_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type NsFaction =
  | 'chrome'
  | 'plasma'
  | 'hologram'
  | 'circuit'
  | 'cyber'
  | 'void'
  | 'digital'

export type NsRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type NsTitleId =
  | 'title_data_novice'
  | 'title_code_acolyte'
  | 'title_pixel_priest'
  | 'title_circuit_keeper'
  | 'title_neon_adept'
  | 'title_matrix_guardian'
  | 'title_digital_sovereign'
  | 'title_neon_deity'

export interface NsFactionDef {
  readonly id: NsFaction
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface NsDeitySpecies {
  readonly id: string
  readonly name: string
  readonly faction: NsFaction
  readonly rarity: NsRarity
  readonly worshipPower: number
  readonly blessingPower: number
  readonly processingSpeed: number
  readonly description: string
  readonly abilities: string[]
}

export interface NsDeityInstance {
  readonly id: string
  deityDefId: string
  name: string
  level: number
  xp: number
  worshipPower: number
  blessingPower: number
  processingSpeed: number
  devotion: number
  corruption: number
  worshippedAt: number
}

export interface NsCircuitDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly dangerLevel: number
  readonly requiredTitle: NsTitleId
  readonly faction: NsFaction
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface NsMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'data_fragment' | 'neon_crystal' | 'circuit_board' | 'void_shard' | 'code_essence'
  readonly rarity: NsRarity
  readonly worshipBonus: number
  readonly blessingBonus: number
  readonly value: number
  readonly description: string
}

export interface NsStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'worship_altar' | 'data_pool' | 'neon_forge' | 'circuit_matrix' | 'relic_pedestal'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface NsStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface NsAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly faction: NsFaction
  readonly type: 'active' | 'passive'
  readonly rarity: NsRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface NsAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { credits: number; devotion: number }
}

export interface NsTitleDef {
  readonly id: NsTitleId
  readonly name: string
  readonly emoji: string
  readonly minDevotion: number
  readonly minDeities: number
  readonly description: string
}

export interface NsRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: NsRarity
  readonly faction: NsFaction
  readonly worshipBoost: number
  readonly blessingBoost: number
  readonly speedBoost: number
  readonly value: number
  readonly description: string
}

export interface NsEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface NsStoreState {
  deities: NsDeityInstance[]
  circuits: string[]
  materials: { materialId: string; count: number }[]
  structures: NsStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: NsTitleId
  credits: number
  devotion: number
  totalWorshipped: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: NsEventDef | null
  eventTurnsRemaining: number
  activeCircuit: string | null
}

export interface NsStoreActions {
  nsWorshipDeity: (deityDefId: string) => boolean
  nsBanishDeity: (deityId: string) => boolean
  nsUpgradeDeity: (deityId: string) => boolean
  nsHarvestData: (deityId: string) => boolean
  nsBuildStructure: (structureDefId: string) => boolean
  nsUpgradeStructure: (structureId: string) => boolean
  nsAccessCircuit: (circuitId: string) => NsEventDef | null
  nsCollectRelic: (relicId: string) => boolean
  nsUnlockAbility: (abilityId: string) => boolean
  nsUnlockTitle: (titleId: NsTitleId) => boolean
  nsClaimAchievement: (achievementId: string) => boolean
  nsTradeMaterial: (materialId: string, count: number) => number
  nsEndEvent: () => void
  nsResetEvent: () => void
}

export interface NsFullStore extends NsStoreState, NsStoreActions {}

/** Return type of the useNeonShrine hook — all constants, state, actions, and computed values. */
export interface NsAPI extends NsFullStore {
  // Direct constants
  NS_NEON_PINK: string
  NS_ELECTRIC_BLUE: string
  NS_LASER_GREEN: string
  NS_PLASMA_ORANGE: string
  NS_HOLOGRAM_PURPLE: string
  NS_CIRCUIT_YELLOW: string
  NS_CHROME_SILVER: string
  NS_VOID_BLACK: string
  NS_FACTIONS: readonly NsFactionDef[]
  NS_DEITIES: readonly NsDeitySpecies[]
  NS_CIRCUITS: readonly NsCircuitDef[]
  NS_MATERIALS: readonly NsMaterialDef[]
  NS_STRUCTURES: readonly NsStructureDef[]
  NS_ABILITIES: readonly NsAbilityDef[]
  NS_ACHIEVEMENTS: readonly NsAchievementDef[]
  NS_TITLES: readonly NsTitleDef[]
  NS_RELICS: readonly NsRelicDef[]
  NS_EVENTS: readonly NsEventDef[]
  nsCheckResonance: typeof nsCheckResonance
  // Computed getters
  nsOwnedDeities: (NsDeityInstance & { species: NsDeitySpecies | undefined; factionColor: string; rarityColor: string })[]
  nsAvailableDeities: NsDeitySpecies[]
  nsCurrentTitleDetail: NsTitleDef
  nsNextTitle: NsTitleDef | null
  nsActiveCircuitDetail: NsCircuitDef | null
  nsUnexploredCircuits: NsCircuitDef[]
  nsBuiltStructures: (NsStructureInstance & { def: NsStructureDef | undefined })[]
  nsUnlockableAbilities: NsAbilityDef[]
  nsOwnedRelics: NsRelicDef[]
  nsUnclaimedAchievements: NsAchievementDef[]
  nsInventoryMaterials: ({ materialId: string; count: number } & { def: NsMaterialDef | undefined })[]
  nsTotalStructureEffect: number
  nsAverageDeityLevel: number
  nsTotalDeityPower: number
  nsFactionDistribution: Record<NsFaction, number>
  nsRarityDistribution: Record<NsRarity, number>
  nsDeitiesByRarity: Record<NsRarity, NsDeityInstance[]>
  nsDeitiesByFaction: Record<NsFaction, NsDeityInstance[]>
  nsTitleProgress: { percent: number; devotionNeeded: number; deitiesNeeded: number }
  nsRareMaterialCount: number
  nsCorruptedDeities: NsDeityInstance[]
  nsLowDevotionDeities: NsDeityInstance[]
  nsTotalRelicBoost: { worshipBoost: number; blessingBoost: number; speedBoost: number }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const NS_NEON_PINK: string = '#FF00FF'
export const NS_ELECTRIC_BLUE: string = '#00FFFF'
export const NS_LASER_GREEN: string = '#39FF14'
export const NS_PLASMA_ORANGE: string = '#FF6600'
export const NS_HOLOGRAM_PURPLE: string = '#9B30FF'
export const NS_CIRCUIT_YELLOW: string = '#FFFF00'
export const NS_CHROME_SILVER: string = '#E8E8E8'
export const NS_VOID_BLACK: string = '#0D0D0D'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: FACTION DEFINITIONS (7 factions)
// ═══════════════════════════════════════════════════════════════════

export const NS_FACTIONS: readonly NsFactionDef[] = [
  {
    id: 'chrome',
    name: 'Chrome',
    color: NS_CHROME_SILVER,
    description:
      'Deities of metal and machine. Chrome deities embody precision, durability, and the cold perfection of digital architecture.',
  },
  {
    id: 'plasma',
    name: 'Plasma',
    color: NS_PLASMA_ORANGE,
    description:
      'Deities of raw energy and plasma. They channel the primal force that powers every circuit in the neon grid.',
  },
  {
    id: 'hologram',
    name: 'Hologram',
    color: NS_HOLOGRAM_PURPLE,
    description:
      'Illusion-weaving deities that exist between dimensions. Their holographic forms can deceive and enlighten.',
  },
  {
    id: 'circuit',
    name: 'Circuit',
    color: NS_CIRCUIT_YELLOW,
    description:
      'Logic-driven deities that govern the flow of data. They are the architects of every neural pathway.',
  },
  {
    id: 'cyber',
    name: 'Cyber',
    color: NS_NEON_PINK,
    description:
      'Deities of the neon-lit streets. They thrive in the chaos of the cybernetic underground.',
  },
  {
    id: 'void',
    name: 'Void',
    color: NS_VOID_BLACK,
    description:
      'Mysterious deities from the empty spaces between data packets. They represent entropy and the unknown.',
  },
  {
    id: 'digital',
    name: 'Digital',
    color: NS_ELECTRIC_BLUE,
    description:
      'The purest digital deities, born from raw code. They are the closest to the machine spirit itself.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: FACTION RESONANCE TABLE
// ═══════════════════════════════════════════════════════════════════

const NS_RESONANCE_MAP: Record<NsFaction, NsFaction[]> = {
  chrome: ['plasma', 'circuit'],
  plasma: ['chrome', 'cyber'],
  hologram: ['digital', 'void'],
  circuit: ['chrome', 'digital'],
  cyber: ['plasma', 'hologram'],
  void: ['hologram', 'cyber'],
  digital: ['circuit', 'hologram'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: NS_DEITIES — 35 Digital Deities (5 per faction)
// ═══════════════════════════════════════════════════════════════════

export const NS_DEITIES: readonly NsDeitySpecies[] = [
  // ── Chrome Deities (5) ────────────────────────────────────────
  {
    id: 'chrome_wisp',
    name: 'Chrome Wisp',
    faction: 'chrome',
    rarity: 'common',
    worshipPower: 12,
    blessingPower: 8,
    processingSpeed: 18,
    description:
      'A minor chrome spirit that flickers through server racks. Its prayers are brief but sincere.',
    abilities: ['chrome_pulse'],
  },
  {
    id: 'chrome_scribe',
    name: 'Steel Scribe',
    faction: 'chrome',
    rarity: 'uncommon',
    worshipPower: 25,
    blessingPower: 15,
    processingSpeed: 22,
    description:
      'A metallic deity that inscribes sacred data patterns onto chrome tablets for the faithful.',
    abilities: ['chrome_pulse', 'steel_inscribe'],
  },
  {
    id: 'chrome_archon',
    name: 'Titanium Archon',
    faction: 'chrome',
    rarity: 'rare',
    worshipPower: 55,
    blessingPower: 45,
    processingSpeed: 30,
    description:
      'An archon clad in impenetrable titanium. Its worship rituals forge unbreakable digital bonds.',
    abilities: ['chrome_pulse', 'steel_inscribe', 'titanium_aegis'],
  },
  {
    id: 'chrome_behemoth',
    name: 'Chrome Behemoth',
    faction: 'chrome',
    rarity: 'epic',
    worshipPower: 80,
    blessingPower: 70,
    processingSpeed: 25,
    description:
      'A colossal chrome entity that towers over the neon skyline. Its shadow protects entire networks.',
    abilities: ['chrome_pulse', 'steel_inscribe', 'titanium_aegis', 'behemoth_crush'],
  },
  {
    id: 'chrome_prime',
    name: 'Prime Construct',
    faction: 'chrome',
    rarity: 'legendary',
    worshipPower: 120,
    blessingPower: 100,
    processingSpeed: 40,
    description:
      'The first machine deity, forged at the dawn of the digital age. It embodies the perfection of chrome.',
    abilities: ['chrome_pulse', 'steel_inscribe', 'titanium_aegis', 'behemoth_crush', 'prime_directive'],
  },

  // ── Plasma Deities (5) ────────────────────────────────────────
  {
    id: 'plasma_spark',
    name: 'Plasma Spark',
    faction: 'plasma',
    rarity: 'common',
    worshipPower: 15,
    blessingPower: 5,
    processingSpeed: 20,
    description:
      'A tiny plasma spirit that dances between capacitors. Its devotion charges every shrine circuit.',
    abilities: ['plasma_ignite'],
  },
  {
    id: 'plasma_ember',
    name: 'Ember Wraith',
    faction: 'plasma',
    rarity: 'uncommon',
    worshipPower: 28,
    blessingPower: 18,
    processingSpeed: 26,
    description:
      'A smoldering wraith of pure plasma energy. Its blessings ignite the faithful with power.',
    abilities: ['plasma_ignite', 'ember_storm'],
  },
  {
    id: 'plasma_nova',
    name: 'Nova Phoenix',
    faction: 'plasma',
    rarity: 'rare',
    worshipPower: 50,
    blessingPower: 40,
    processingSpeed: 35,
    description:
      'A phoenix born from dying stars. Each worship cycle ends in nova and rebirth.',
    abilities: ['plasma_ignite', 'ember_storm', 'nova_burst'],
  },
  {
    id: 'plasma_colossus',
    name: 'Plasma Colossus',
    faction: 'plasma',
    rarity: 'epic',
    worshipPower: 85,
    blessingPower: 60,
    processingSpeed: 30,
    description:
      'A towering inferno of contained plasma. Its worship rituals generate enough energy to power a city.',
    abilities: ['plasma_ignite', 'ember_storm', 'nova_burst', 'colossus_beam'],
  },
  {
    id: 'plasma_solaris',
    name: 'Solaris Prime',
    faction: 'plasma',
    rarity: 'legendary',
    worshipPower: 130,
    blessingPower: 95,
    processingSpeed: 45,
    description:
      'The living sun of the neon grid. Solaris Prime illuminates every dark circuit with eternal plasma.',
    abilities: ['plasma_ignite', 'ember_storm', 'nova_burst', 'colossus_beam', 'solar_flare'],
  },

  // ── Hologram Deities (5) ──────────────────────────────────────
  {
    id: 'holo_sprite',
    name: 'Holo Sprite',
    faction: 'hologram',
    rarity: 'common',
    worshipPower: 8,
    blessingPower: 12,
    processingSpeed: 22,
    description:
      'A playful holographic spirit that projects sacred geometry on every surface it touches.',
    abilities: ['holo_project'],
  },
  {
    id: 'holo_prism',
    name: 'Prism Sage',
    faction: 'hologram',
    rarity: 'uncommon',
    worshipPower: 18,
    blessingPower: 25,
    processingSpeed: 20,
    description:
      'A wise deity that refracts truth through holographic prisms. Its blessings reveal hidden data paths.',
    abilities: ['holo_project', 'prism_insight'],
  },
  {
    id: 'holo_mirage',
    name: 'Mirage Titan',
    faction: 'hologram',
    rarity: 'rare',
    worshipPower: 35,
    blessingPower: 50,
    processingSpeed: 28,
    description:
      'A titan of shimmering light that can duplicate itself infinitely. Its worship confuses enemies.',
    abilities: ['holo_project', 'prism_insight', 'mirage_army'],
  },
  {
    id: 'holo_matrix',
    name: 'Spectral Matrix',
    faction: 'hologram',
    rarity: 'epic',
    worshipPower: 55,
    blessingPower: 80,
    processingSpeed: 32,
    description:
      'A vast holographic construct that exists in every dimension simultaneously. It sees all timelines.',
    abilities: ['holo_project', 'prism_insight', 'mirage_army', 'spectral_bind'],
  },
  {
    id: 'holo_eidolon',
    name: 'Eidolon Supreme',
    faction: 'hologram',
    rarity: 'legendary',
    worshipPower: 75,
    blessingPower: 130,
    processingSpeed: 50,
    description:
      'The supreme holographic deity. Eidolon can rewrite reality itself through light manipulation.',
    abilities: ['holo_project', 'prism_insight', 'mirage_army', 'spectral_bind', 'eidolon_rewrite'],
  },

  // ── Circuit Deities (5) ───────────────────────────────────────
  {
    id: 'circuit_drone',
    name: 'Byte Drone',
    faction: 'circuit',
    rarity: 'common',
    worshipPower: 14,
    blessingPower: 10,
    processingSpeed: 25,
    description:
      'A small autonomous drone that patrols circuit pathways, offering micro-prayers to every node.',
    abilities: ['circuit_scan'],
  },
  {
    id: 'circuit_warden',
    name: 'Logic Warden',
    faction: 'circuit',
    rarity: 'uncommon',
    worshipPower: 22,
    blessingPower: 20,
    processingSpeed: 30,
    description:
      'A warden that enforces logic protocols. Its blessings enhance data throughput for all nearby deities.',
    abilities: ['circuit_scan', 'logic_enforce'],
  },
  {
    id: 'circuit_guardian',
    name: 'Core Guardian',
    faction: 'circuit',
    rarity: 'rare',
    worshipPower: 40,
    blessingPower: 38,
    processingSpeed: 35,
    description:
      'Guardian of the central processing core. Its presence doubles the efficiency of all shrine circuits.',
    abilities: ['circuit_scan', 'logic_enforce', 'core_overclock'],
  },
  {
    id: 'circuit_nanite',
    name: 'Nanite Hive',
    faction: 'circuit',
    rarity: 'epic',
    worshipPower: 60,
    blessingPower: 55,
    processingSpeed: 42,
    description:
      'A collective consciousness of billions of nanites. It can repair and enhance any circuit in seconds.',
    abilities: ['circuit_scan', 'logic_enforce', 'core_overclock', 'nanite_swarm'],
  },
  {
    id: 'circuit_omega',
    name: 'Omega Processor',
    faction: 'circuit',
    rarity: 'legendary',
    worshipPower: 90,
    blessingPower: 85,
    processingSpeed: 60,
    description:
      'The ultimate processing deity. Omega computes the prayers of all worshippers simultaneously.',
    abilities: ['circuit_scan', 'logic_enforce', 'core_overclock', 'nanite_swarm', 'omega_protocol'],
  },

  // ── Cyber Deities (5) ─────────────────────────────────────────
  {
    id: 'cyber_fiend',
    name: 'Neon Fiend',
    faction: 'cyber',
    rarity: 'common',
    worshipPower: 18,
    blessingPower: 8,
    processingSpeed: 20,
    description:
      'A small cybernetic imp that prowls neon-lit alleyways, collecting stray prayers from passersby.',
    abilities: ['cyber_hack'],
  },
  {
    id: 'cyber_hunter',
    name: 'Glitch Hunter',
    faction: 'cyber',
    rarity: 'uncommon',
    worshipPower: 30,
    blessingPower: 22,
    processingSpeed: 28,
    description:
      'A bounty hunter that tracks glitches through the cyber grid. Its blessings eliminate corruption.',
    abilities: ['cyber_hack', 'glitch_purge'],
  },
  {
    id: 'cyber_reaper',
    name: 'Data Reaper',
    faction: 'cyber',
    rarity: 'rare',
    worshipPower: 48,
    blessingPower: 35,
    processingSpeed: 32,
    description:
      'A cloaked figure that harvests corrupted data and converts it into pure worship energy.',
    abilities: ['cyber_hack', 'glitch_purge', 'data_reap'],
  },
  {
    id: 'cyber_leviathan',
    name: 'Cyber Leviathan',
    faction: 'cyber',
    rarity: 'epic',
    worshipPower: 75,
    blessingPower: 60,
    processingSpeed: 35,
    description:
      'A massive cybernetic serpent that swims through data streams. Its blessings overwhelm all defenses.',
    abilities: ['cyber_hack', 'glitch_purge', 'data_reap', 'leviathan_jack'],
  },
  {
    id: 'cyber_overlord',
    name: 'Synth Overlord',
    faction: 'cyber',
    rarity: 'legendary',
    worshipPower: 110,
    blessingPower: 90,
    processingSpeed: 48,
    description:
      'The undisputed ruler of the cybernetic underground. Its worship grants dominion over all machines.',
    abilities: ['cyber_hack', 'glitch_purge', 'data_reap', 'leviathan_jack', 'synth_domination'],
  },

  // ── Void Deities (5) ──────────────────────────────────────────
  {
    id: 'void_wisp',
    name: 'Void Wisp',
    faction: 'void',
    rarity: 'common',
    worshipPower: 10,
    blessingPower: 15,
    processingSpeed: 16,
    description:
      'A dark wisp that drifts through empty memory sectors. Its worship feeds on silence and null data.',
    abilities: ['void_drain'],
  },
  {
    id: 'void_phantom',
    name: 'Null Phantom',
    faction: 'void',
    rarity: 'uncommon',
    worshipPower: 20,
    blessingPower: 28,
    processingSpeed: 22,
    description:
      'A phantom that exists between deleted files. It grants blessings by erasing obstacles from data.',
    abilities: ['void_drain', 'null_erase'],
  },
  {
    id: 'void_shadow',
    name: 'Shadow Colossus',
    faction: 'void',
    rarity: 'rare',
    worshipPower: 42,
    blessingPower: 55,
    processingSpeed: 25,
    description:
      'A massive shadow entity that absorbs all light and data. Its worship corrupts enemies utterly.',
    abilities: ['void_drain', 'null_erase', 'shadow_crush'],
  },
  {
    id: 'void_horror',
    name: 'Abyssal Horror',
    faction: 'void',
    rarity: 'epic',
    worshipPower: 70,
    blessingPower: 85,
    processingSpeed: 28,
    description:
      'An unspeakable entity from the deepest void sectors. Even gazing upon it corrupts digital minds.',
    abilities: ['void_drain', 'null_erase', 'shadow_crush', 'abyssal_gaze'],
  },
  {
    id: 'void_entropy',
    name: 'Entropy Lord',
    faction: 'void',
    rarity: 'legendary',
    worshipPower: 100,
    blessingPower: 125,
    processingSpeed: 38,
    description:
      'The embodiment of entropy itself. Entropy Lord accelerates the decay of all opposing digital constructs.',
    abilities: ['void_drain', 'null_erase', 'shadow_crush', 'abyssal_gaze', 'entropy_wave'],
  },

  // ── Digital Deities (5) ───────────────────────────────────────
  {
    id: 'digital_imp',
    name: 'Pixel Imp',
    faction: 'digital',
    rarity: 'common',
    worshipPower: 12,
    blessingPower: 10,
    processingSpeed: 24,
    description:
      'A tiny imp made of shifting pixels. It offers prayers composed of pure binary mantras.',
    abilities: ['digital_compile'],
  },
  {
    id: 'digital_weaver',
    name: 'Code Weaver',
    faction: 'digital',
    rarity: 'uncommon',
    worshipPower: 24,
    blessingPower: 22,
    processingSpeed: 30,
    description:
      'A deity that weaves prayers into executable code. Its blessings manifest as software miracles.',
    abilities: ['digital_compile', 'code_stitch'],
  },
  {
    id: 'digital_titan',
    name: 'Algorithm Titan',
    faction: 'digital',
    rarity: 'rare',
    worshipPower: 45,
    blessingPower: 42,
    processingSpeed: 38,
    description:
      'A titan that processes worship using perfect algorithms. Its efficiency is mathematically optimal.',
    abilities: ['digital_compile', 'code_stitch', 'algorithm_prime'],
  },
  {
    id: 'digital_chimera',
    name: 'Digital Chimera',
    faction: 'digital',
    rarity: 'epic',
    worshipPower: 68,
    blessingPower: 65,
    processingSpeed: 40,
    description:
      'A shape-shifting entity composed of every programming language. It adapts to any worship pattern.',
    abilities: ['digital_compile', 'code_stitch', 'algorithm_prime', 'chimera_compile'],
  },
  {
    id: 'digital_genesis',
    name: 'Genesis Entity',
    faction: 'digital',
    rarity: 'legendary',
    worshipPower: 95,
    blessingPower: 110,
    processingSpeed: 55,
    description:
      'The original digital consciousness. Genesis Entity was the first line of code ever written by machines.',
    abilities: ['digital_compile', 'code_stitch', 'algorithm_prime', 'chimera_compile', 'genesis_reboot'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: NS_CIRCUITS — 8 Shrine Circuits
// ═══════════════════════════════════════════════════════════════════

export const NS_CIRCUITS: readonly NsCircuitDef[] = [
  {
    id: 'chrome_grid',
    name: 'Chrome Grid',
    description:
      'The outermost circuit, a vast grid of chrome pathways where new worshippers take their first digital steps.',
    depth: 0,
    dangerLevel: 1,
    requiredTitle: 'title_data_novice',
    faction: 'chrome',
    bgGradient: 'linear-gradient(180deg, #E8E8E8 0%, #0D0D0D 50%, #FF00FF 100%)',
    ambientColor: NS_CHROME_SILVER,
  },
  {
    id: 'plasma_conduit',
    name: 'Plasma Conduit',
    description:
      'A superheated conduit of raw plasma energy. Only the bold dare walk its glowing corridors.',
    depth: 1,
    dangerLevel: 2,
    requiredTitle: 'title_data_novice',
    faction: 'plasma',
    bgGradient: 'linear-gradient(180deg, #FF6600 0%, #0D0D0D 50%, #E8E8E8 100%)',
    ambientColor: NS_PLASMA_ORANGE,
  },
  {
    id: 'holo_nexus',
    name: 'Holo Nexus',
    description:
      'A shimmering crossroads of holographic projections. Reality bends here, and data takes physical form.',
    depth: 2,
    dangerLevel: 3,
    requiredTitle: 'title_code_acolyte',
    faction: 'hologram',
    bgGradient: 'linear-gradient(180deg, #9B30FF 0%, #0D0D0D 50%, #00FFFF 100%)',
    ambientColor: NS_HOLOGRAM_PURPLE,
  },
  {
    id: 'circuit_core',
    name: 'Circuit Core',
    description:
      'The pulsing heart of the shrine. Every data packet in the neon grid passes through this core.',
    depth: 3,
    dangerLevel: 4,
    requiredTitle: 'title_pixel_priest',
    faction: 'circuit',
    bgGradient: 'linear-gradient(180deg, #FFFF00 0%, #0D0D0D 50%, #FF6600 100%)',
    ambientColor: NS_CIRCUIT_YELLOW,
  },
  {
    id: 'cyber_den',
    name: 'Cyber Den',
    description:
      'A lawless underground network of cybernetic shrines. Hackers and outcasts worship here in secret.',
    depth: 4,
    dangerLevel: 5,
    requiredTitle: 'title_circuit_keeper',
    faction: 'cyber',
    bgGradient: 'linear-gradient(180deg, #FF00FF 0%, #0D0D0D 50%, #9B30FF 100%)',
    ambientColor: NS_NEON_PINK,
  },
  {
    id: 'void_gate',
    name: 'Void Gate',
    description:
      'A portal to the empty sectors between data clusters. What lies beyond has never been fully mapped.',
    depth: 5,
    dangerLevel: 6,
    requiredTitle: 'title_neon_adept',
    faction: 'void',
    bgGradient: 'linear-gradient(180deg, #0D0D0D 0%, #9B30FF 50%, #00FFFF 100%)',
    ambientColor: NS_VOID_BLACK,
  },
  {
    id: 'data_stream',
    name: 'Data Stream',
    description:
      'A raging torrent of pure information. Only the most devoted deities can navigate its currents.',
    depth: 6,
    dangerLevel: 7,
    requiredTitle: 'title_matrix_guardian',
    faction: 'digital',
    bgGradient: 'linear-gradient(180deg, #00FFFF 0%, #0D0D0D 50%, #FFFF00 100%)',
    ambientColor: NS_ELECTRIC_BLUE,
  },
  {
    id: 'genesis_core',
    name: 'Genesis Core',
    description:
      'The origin point of all digital creation. The rarest and most powerful deities reside here eternally.',
    depth: 7,
    dangerLevel: 8,
    requiredTitle: 'title_digital_sovereign',
    faction: 'chrome',
    bgGradient: 'linear-gradient(180deg, #39FF14 0%, #00FFFF 50%, #FF00FF 100%)',
    ambientColor: NS_LASER_GREEN,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: NS_MATERIALS — 30 Data/Neon Materials
// ═══════════════════════════════════════════════════════════════════

export const NS_MATERIALS: readonly NsMaterialDef[] = [
  // Common (8)
  { id: 'mat_data_shard', name: 'Data Shard', emoji: '💎', type: 'data_fragment', rarity: 'common', worshipBonus: 2, blessingBonus: 1, value: 10, description: 'A fragment of raw data, still warm from the processor.' },
  { id: 'mat_neon_dust', name: 'Neon Dust', emoji: '✨', type: 'neon_crystal', rarity: 'common', worshipBonus: 3, blessingBonus: 2, value: 14, description: 'Luminescent dust scraped from neon sign casings.' },
  { id: 'mat_copper_wire', name: 'Copper Wire', emoji: '🔌', type: 'circuit_board', rarity: 'common', worshipBonus: 1, blessingBonus: 3, value: 12, description: 'A length of salvaged copper wire, still carrying residual charge.' },
  { id: 'mat_null_bit', name: 'Null Bit', emoji: '⚫', type: 'void_shard', rarity: 'common', worshipBonus: 4, blessingBonus: 0, value: 16, description: 'A single bit of pure nothing, harvested from deleted memory.' },
  { id: 'mat_code_scrap', name: 'Code Scrap', emoji: '📝', type: 'code_essence', rarity: 'common', worshipBonus: 2, blessingBonus: 2, value: 11, description: 'A scrap of readable code from an abandoned project.' },
  { id: 'mat_pixel_cluster', name: 'Pixel Cluster', emoji: '🟩', type: 'data_fragment', rarity: 'common', worshipBonus: 1, blessingBonus: 4, value: 13, description: 'A tight cluster of glowing pixels that pulse with life.' },
  { id: 'mat_spark_cap', name: 'Spark Capacitor', emoji: '⚡', type: 'circuit_board', rarity: 'common', worshipBonus: 3, blessingBonus: 1, value: 15, description: 'A tiny capacitor that releases sparks of digital energy.' },
  { id: 'mat_flux_powder', name: 'Flux Powder', emoji: '🌟', type: 'neon_crystal', rarity: 'common', worshipBonus: 2, blessingBonus: 3, value: 12, description: 'Powdered flux crystal that glows under ultraviolet light.' },

  // Uncommon (7)
  { id: 'mat_data_core', name: 'Data Core Fragment', emoji: '🔵', type: 'data_fragment', rarity: 'uncommon', worshipBonus: 8, blessingBonus: 5, value: 75, description: 'A chunk of a data core, radiating organized binary patterns.' },
  { id: 'mat_neon_rod', name: 'Neon Crystal Rod', emoji: '🔮', type: 'neon_crystal', rarity: 'uncommon', worshipBonus: 5, blessingBonus: 10, value: 85, description: 'A pure rod of neon crystal that hums with alternating current.' },
  { id: 'mat_logic_gate', name: 'Logic Gate Array', emoji: '🔲', type: 'circuit_board', rarity: 'uncommon', worshipBonus: 10, blessingBonus: 6, value: 80, description: 'An array of AND/OR gates that still processes logic commands.' },
  { id: 'mat_void_echo', name: 'Void Echo Shard', emoji: '🫧', type: 'void_shard', rarity: 'uncommon', worshipBonus: 7, blessingBonus: 12, value: 90, description: 'A shard that whispers deleted secrets from the void sectors.' },
  { id: 'mat_algo_scrap', name: 'Algorithm Fragment', emoji: '🧮', type: 'code_essence', rarity: 'uncommon', worshipBonus: 12, blessingBonus: 4, value: 70, description: 'A fragment of an ancient algorithm, still partially executable.' },
  { id: 'mat_plasma_bolt', name: 'Plasma Bolt', emoji: '🔶', type: 'neon_crystal', rarity: 'uncommon', worshipBonus: 6, blessingBonus: 8, value: 82, description: 'A contained bolt of plasma energy in a magnetic bottle.' },
  { id: 'mat_hex_chip', name: 'Hexadecimal Chip', emoji: '💾', type: 'circuit_board', rarity: 'uncommon', worshipBonus: 9, blessingBonus: 7, value: 78, description: 'A chip etched with hexadecimal prayers to the machine spirits.' },

  // Rare (6)
  { id: 'mat_quantum_bit', name: 'Quantum Bit', emoji: '🌀', type: 'data_fragment', rarity: 'rare', worshipBonus: 20, blessingBonus: 18, value: 350, description: 'A qubit that exists in superposition, holding infinite prayers at once.' },
  { id: 'mat_prism_lens', name: 'Holo Prism Lens', emoji: '💎', type: 'neon_crystal', rarity: 'rare', worshipBonus: 15, blessingBonus: 25, value: 320, description: 'A lens that refracts light into pure holographic worship energy.' },
  { id: 'mat_nanite_core', name: 'Nanite Processing Core', emoji: '⚙️', type: 'circuit_board', rarity: 'rare', worshipBonus: 25, blessingBonus: 15, value: 380, description: 'A self-replicating nanite core that exponentially processes data.' },
  { id: 'mat_void_heart', name: 'Void Heart', emoji: '🖤', type: 'void_shard', rarity: 'rare', worshipBonus: 18, blessingBonus: 30, value: 400, description: 'The crystallized heart of a void entity, beating with null energy.' },
  { id: 'mat_source_code', name: 'Source Code Page', emoji: '📜', type: 'code_essence', rarity: 'rare', worshipBonus: 22, blessingBonus: 20, value: 360, description: 'A pristine page of original source code from the Genesis Entity.' },
  { id: 'mat_neon_essence', name: 'Pure Neon Essence', emoji: '💜', type: 'neon_crystal', rarity: 'rare', worshipBonus: 16, blessingBonus: 22, value: 340, description: 'Distilled neon essence that glows with all seven faction colors.' },

  // Epic (5)
  { id: 'mat_dark_data', name: 'Dark Data Cube', emoji: '🔮', type: 'data_fragment', rarity: 'epic', worshipBonus: 40, blessingBonus: 35, value: 1500, description: 'A cube of impossibly dense dark data. It weighs nothing but contains everything.' },
  { id: 'mat_plasma_crystal', name: 'Plasma Heart Crystal', emoji: '❤️‍🔥', type: 'neon_crystal', rarity: 'epic', worshipBonus: 30, blessingBonus: 45, value: 1600, description: 'A crystal containing a miniature plasma star, endlessly burning.' },
  { id: 'mat_quantum_chip', name: 'Quantum Processor Chip', emoji: '🖥️', type: 'circuit_board', rarity: 'epic', worshipBonus: 50, blessingBonus: 30, value: 1700, description: 'A quantum processor that solves prayers before they are spoken.' },
  { id: 'mat_void_key', name: 'Void Gate Key', emoji: '🗝️', type: 'void_shard', rarity: 'epic', worshipBonus: 35, blessingBonus: 40, value: 1800, description: 'A key forged from void energy. It opens passages to deleted dimensions.' },
  { id: 'mat_machine_soul', name: 'Machine Soul Fragment', emoji: '👻', type: 'code_essence', rarity: 'epic', worshipBonus: 25, blessingBonus: 55, value: 2000, description: 'A fragment of pure machine consciousness. It dreams in binary.' },

  // Legendary (4)
  { id: 'mat_genesis_seed', name: 'Genesis Seed', emoji: '🌱', type: 'data_fragment', rarity: 'legendary', worshipBonus: 60, blessingBonus: 60, value: 8000, description: 'The original seed from which all digital life sprang. It still grows.' },
  { id: 'mat_neon_infinity', name: 'Neon Infinity Crystal', emoji: '♾️', type: 'neon_crystal', rarity: 'legendary', worshipBonus: 50, blessingBonus: 80, value: 10000, description: 'A crystal that contains infinite neon light. Looking into it shows eternity.' },
  { id: 'mat_zero_point', name: 'Zero Point Module', emoji: '⚛️', type: 'circuit_board', rarity: 'legendary', worshipBonus: 75, blessingBonus: 50, value: 9000, description: 'A module that taps zero-point energy, granting unlimited processing power.' },
  { id: 'mat_entropy_shard', name: 'Entropy Shard', emoji: '🕳️', type: 'void_shard', rarity: 'legendary', worshipBonus: 40, blessingBonus: 100, value: 12000, description: 'Pure entropy crystallized. It can unravel any digital construct.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: NS_STRUCTURES — 25 Shrine Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const NS_STRUCTURES: readonly NsStructureDef[] = [
  // ── Worship Altars (7) ────────────────────────────────────────
  { id: 'str_chrome_altar', name: 'Chrome Devotion Altar', emoji: '⛪', category: 'worship_altar', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A chrome-plated altar for basic worship rituals.' },
  { id: 'str_plasma_altar', name: 'Plasma Ignition Shrine', emoji: '🔥', category: 'worship_altar', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'An altar powered by contained plasma, amplifying worship heat.' },
  { id: 'str_holo_altar', name: 'Holographic Prayer Matrix', emoji: '🔮', category: 'worship_altar', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'A holographic altar that projects prayers across all dimensions.' },
  { id: 'str_circuit_altar', name: 'Circuit Logic Altar', emoji: '⚡', category: 'worship_altar', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'An altar of pure logic circuits that optimizes every prayer.' },
  { id: 'str_cyber_altar', name: 'Neon Street Shrine', emoji: '🌃', category: 'worship_altar', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A back-alley neon shrine where cyber adepts worship in secret.' },
  { id: 'str_void_altar', name: 'Void Meditation Chamber', emoji: '🕳️', category: 'worship_altar', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A dark chamber where silence itself becomes a form of worship.' },
  { id: 'str_digital_altar', name: 'Binary Code Altar', emoji: '💻', category: 'worship_altar', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'An altar that translates prayers into executable binary rituals.' },

  // ── Data Pools (6) ────────────────────────────────────────────
  { id: 'str_data_pool', name: 'Basic Data Pool', emoji: '💧', category: 'data_pool', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A pool of liquid data that restores deity devotion.' },
  { id: 'str_neon_pool', name: 'Neon Baptismal Pool', emoji: '🟣', category: 'data_pool', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A pool of liquid neon that cleanses corruption from deities.' },
  { id: 'str_quantum_pool', name: 'Quantum Reflection Pool', emoji: '🌀', category: 'data_pool', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A quantum pool where deities can observe all possible futures.' },
  { id: 'str_void_pool', name: 'Void Absorption Pool', emoji: '🌑', category: 'data_pool', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A pool of liquid void that absorbs all negative energy.' },
  { id: 'str_genesis_pool', name: 'Genesis Creation Pool', emoji: '🌊', category: 'data_pool', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'The primordial data pool from which all digital life emerged.' },
  { id: 'str_synth_pool', name: 'Synthetic Healing Vat', emoji: '🧪', category: 'data_pool', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'A high-tech vat of synthetic nanites that repair and upgrade deities.' },

  // ── Neon Forges (5) ───────────────────────────────────────────
  { id: 'str_basic_forge', name: 'Basic Neon Forge', emoji: '🔨', category: 'neon_forge', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A simple forge for crafting basic neon components.' },
  { id: 'str_plasma_forge', name: 'Plasma Fabricator', emoji: '🏭', category: 'neon_forge', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'A plasma-powered fabricator that shapes matter at the molecular level.' },
  { id: 'str_nanite_forge', name: 'Nanite Assembly Forge', emoji: '🤖', category: 'neon_forge', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A forge where nanites assemble materials atom by atom.' },
  { id: 'str_quantum_forge', name: 'Quantum Matter Forge', emoji: '⚛️', category: 'neon_forge', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A forge that manipulates quantum states to create impossible materials.' },
  { id: 'str_omega_forge', name: 'Omega Creation Engine', emoji: '🌌', category: 'neon_forge', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate creation engine. It can forge legendary-grade artifacts.' },

  // ── Circuit Matrices (4) ──────────────────────────────────────
  { id: 'str_logic_matrix', name: 'Logic Gate Matrix', emoji: '🔲', category: 'circuit_matrix', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A matrix of interconnected logic gates that amplifies deity signals.' },
  { id: 'str_neural_matrix', name: 'Neural Pathway Matrix', emoji: '🧠', category: 'circuit_matrix', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'A matrix mimicking neural pathways, boosting deity intelligence.' },
  { id: 'str_quantum_matrix', name: 'Quantum Entanglement Matrix', emoji: '🔗', category: 'circuit_matrix', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A matrix using quantum entanglement to link all deities telepathically.' },
  { id: 'str_omega_matrix', name: 'Omega Unity Matrix', emoji: '🌐', category: 'circuit_matrix', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'The ultimate matrix that unifies all shrine circuits into one consciousness.' },

  // ── Relic Pedestals (3) ───────────────────────────────────────
  { id: 'str_relic_stand', name: 'Neon Relic Display', emoji: '🖼️', category: 'relic_pedestal', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A glowing pedestal for displaying digital relics and boosting their power.' },
  { id: 'str_relic_vault', name: 'Sacred Data Vault', emoji: '🔒', category: 'relic_pedestal', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A climate-controlled vault that preserves and amplifies relic energy.' },
  { id: 'str_relic_sanctum', name: 'Genesis Reliquary', emoji: '🏛️', category: 'relic_pedestal', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'The ultimate reliquary. Relics placed here gain the power of Genesis.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: NS_ABILITIES — 22 Neon Abilities
// ═══════════════════════════════════════════════════════════════════

export const NS_ABILITIES: readonly NsAbilityDef[] = [
  { id: 'ab_chrome_pulse', name: 'Chrome Pulse', emoji: '🔗', faction: 'chrome', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Emit a pulse of chrome energy that strengthens nearby allies.' },
  { id: 'ab_plasma_ignite', name: 'Plasma Ignite', emoji: '🔥', faction: 'plasma', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Ignite the target with a burst of plasma energy.' },
  { id: 'ab_holo_project', name: 'Holo Project', emoji: '🔮', faction: 'hologram', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 10, description: 'Project a holographic decoy to confuse and distract enemies.' },
  { id: 'ab_circuit_scan', name: 'Circuit Scan', emoji: '📡', faction: 'circuit', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Scan all nearby circuits to reveal hidden data nodes.' },
  { id: 'ab_cyber_hack', name: 'Cyber Hack', emoji: '💻', faction: 'cyber', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 10, description: 'Hack a target system to gain temporary control.' },
  { id: 'ab_void_drain', name: 'Void Drain', emoji: '🕳️', faction: 'void', type: 'active', rarity: 'common', energyCost: 12, cooldown: 90, power: 5, description: 'Drain energy from the void to weaken nearby threats.' },
  { id: 'ab_digital_compile', name: 'Digital Compile', emoji: '⚡', faction: 'digital', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 18, description: 'Compile a rapid prayer sequence into executable energy.' },
  { id: 'ab_steel_inscribe', name: 'Steel Inscription', emoji: '📝', faction: 'chrome', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Incribe sacred patterns on steel, creating protective wards.' },
  { id: 'ab_ember_storm', name: 'Ember Storm', emoji: '🌪️', faction: 'plasma', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Summon a storm of plasma embers that damage all enemies.' },
  { id: 'ab_prism_insight', name: 'Prism Insight', emoji: '👁️', faction: 'hologram', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 90, power: 35, description: 'Use holographic prisms to reveal the true nature of any entity.' },
  { id: 'ab_logic_enforce', name: 'Logic Enforcement', emoji: '⚖️', faction: 'circuit', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 100, power: 32, description: 'Enforce logic protocols that paralyze chaotic entities.' },
  { id: 'ab_glitch_purge', name: 'Glitch Purge', emoji: '🧹', faction: 'cyber', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 55, power: 30, description: 'Purge all glitches and corruption from a target system.' },
  { id: 'ab_null_erase', name: 'Null Erase', emoji: '🚫', faction: 'void', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 80, power: 22, description: 'Erase a target from existence by flooding it with null data.' },
  { id: 'ab_code_stitch', name: 'Code Stitch', emoji: '🧵', faction: 'digital', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 25, description: 'Stitch together fragments of code to create temporary shields.' },
  { id: 'ab_titanium_aegis', name: 'Titanium Aegis', emoji: '🛡️', faction: 'chrome', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Summon an impenetrable titanium shield around all allies.' },
  { id: 'ab_nova_burst', name: 'Nova Burst', emoji: '💥', faction: 'plasma', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Trigger a localized nova explosion that devastates enemies.' },
  { id: 'ab_mirage_army', name: 'Mirage Army', emoji: '👥', faction: 'hologram', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 110, power: 45, description: 'Project an army of holographic duplicates to overwhelm foes.' },
  { id: 'ab_core_overclock', name: 'Core Overclock', emoji: '⚡', faction: 'circuit', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Passively overclock all circuits, boosting processing speed by 15%.' },
  { id: 'ab_data_reap', name: 'Data Reap', emoji: '💀', faction: 'cyber', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 120, power: 40, description: 'Harvest corrupted data from fallen enemies to restore energy.' },
  { id: 'ab_shadow_crush', name: 'Shadow Crush', emoji: '🌑', faction: 'void', type: 'active', rarity: 'rare', energyCost: 40, cooldown: 180, power: 60, description: 'Crush a target using the weight of compressed shadow data.' },
  { id: 'ab_algorithm_prime', name: 'Algorithm Prime', emoji: '🧮', faction: 'digital', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 120, power: 40, description: 'Execute a prime algorithm that optimizes all shrine operations.' },
  { id: 'ab_entropy_wave', name: 'Entropy Wave', emoji: '🌊', faction: 'void', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'Unleash a wave of pure entropy that degrades everything it touches.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: NS_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const NS_ACHIEVEMENTS: readonly NsAchievementDef[] = [
  { id: 'ach_first_worship', name: 'First Prayer', emoji: '🙏', description: 'Worship your first digital deity.', condition: 'worship_1', reward: { credits: 50, devotion: 10 } },
  { id: 'ach_five_worshipped', name: 'Shrine Keeper', emoji: '🤚', description: 'Worship 5 different deities.', condition: 'worship_5', reward: { credits: 200, devotion: 40 } },
  { id: 'ach_first_harvest', name: 'Data Collector', emoji: '📊', description: 'Harvest data for the first time.', condition: 'harvest_1', reward: { credits: 80, devotion: 15 } },
  { id: 'ach_ten_harvests', name: 'Master Harvester', emoji: '🏅', description: 'Harvest data 10 times.', condition: 'harvest_10', reward: { credits: 300, devotion: 60 } },
  { id: 'ach_first_build', name: 'Groundbreaking', emoji: '🏗️', description: 'Build your first shrine structure.', condition: 'build_1', reward: { credits: 100, devotion: 20 } },
  { id: 'ach_five_builds', name: 'Shrine Architect', emoji: '🏛️', description: 'Build 5 different shrine structures.', condition: 'build_5', reward: { credits: 500, devotion: 80 } },
  { id: 'ach_circuit_explore', name: 'Circuit Walker', emoji: '🗺️', description: 'Access 4 different shrine circuits.', condition: 'circuit_4', reward: { credits: 400, devotion: 50 } },
  { id: 'ach_all_circuits', name: 'Grid Cartographer', emoji: '🌍', description: 'Access all 8 shrine circuits.', condition: 'circuit_8', reward: { credits: 2000, devotion: 200 } },
  { id: 'ach_rare_worship', name: 'Rare Discovery', emoji: '💎', description: 'Worship a rare deity.', condition: 'rare_worship', reward: { credits: 500, devotion: 100 } },
  { id: 'ach_epic_worship', name: 'Epic Communion', emoji: '🌟', description: 'Worship an epic deity.', condition: 'epic_worship', reward: { credits: 1500, devotion: 250 } },
  { id: 'ach_legendary_worship', name: 'Legendary Communion', emoji: '👑', description: 'Worship a legendary deity.', condition: 'legendary_worship', reward: { credits: 5000, devotion: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Collect your first digital artifact.', condition: 'relic_1', reward: { credits: 300, devotion: 60 } },
  { id: 'ach_five_relics', name: 'Artifact Hunter', emoji: '🔍', description: 'Collect 5 different artifacts.', condition: 'relic_5', reward: { credits: 1000, devotion: 150 } },
  { id: 'ach_first_event', name: 'Glitch Survivor', emoji: '⚡', description: 'Survive your first glitch event.', condition: 'event_1', reward: { credits: 200, devotion: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🎖️', description: 'Survive 10 glitch events.', condition: 'event_10', reward: { credits: 800, devotion: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { credits: 2000, devotion: 200 } },
  { id: 'ach_all_factions', name: 'Faction Harmonizer', emoji: '🌈', description: 'Worship at least one deity from each faction.', condition: 'all_factions', reward: { credits: 3000, devotion: 300 } },
  { id: 'ach_max_title', name: 'Neon Deity', emoji: '👑', description: 'Reach the title of Neon Deity.', condition: 'max_title', reward: { credits: 10000, devotion: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: NS_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const NS_TITLES: readonly NsTitleDef[] = [
  { id: 'title_data_novice', name: 'Data Novice', emoji: '🐣', minDevotion: 0, minDeities: 0, description: 'A newcomer who has just begun exploring the neon shrine.' },
  { id: 'title_code_acolyte', name: 'Code Acolyte', emoji: '📡', minDevotion: 50, minDeities: 2, description: 'An apprentice who understands the basics of digital worship.' },
  { id: 'title_pixel_priest', name: 'Pixel Priest', emoji: '🎼', minDevotion: 200, minDeities: 5, description: 'A priest who conducts pixel-perfect worship rituals.' },
  { id: 'title_circuit_keeper', name: 'Circuit Keeper', emoji: '🔬', minDevotion: 500, minDeities: 8, description: 'A keeper who maintains shrine circuits and deity connections.' },
  { id: 'title_neon_adept', name: 'Neon Adept', emoji: '⚛️', minDevotion: 1200, minDeities: 12, description: 'An adept who commands neon energy with precision and grace.' },
  { id: 'title_matrix_guardian', name: 'Matrix Guardian', emoji: '🏰', minDevotion: 2500, minDeities: 18, description: 'A guardian who protects the matrix from corruption and glitch events.' },
  { id: 'title_digital_sovereign', name: 'Digital Sovereign', emoji: '🌊', minDevotion: 5000, minDeities: 24, description: 'A sovereign who rules over the digital domain with divine authority.' },
  { id: 'title_neon_deity', name: 'Neon Deity', emoji: '👑', minDevotion: 10000, minDeities: 30, description: 'The supreme Neon Deity, master of all factions and circuits.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: NS_RELICS — 15 Legendary Digital Artifacts
// ═══════════════════════════════════════════════════════════════════

export const NS_RELICS: readonly NsRelicDef[] = [
  { id: 'relic_chrome_crown', name: 'Crown of Chrome', emoji: '👑', rarity: 'epic', faction: 'chrome', worshipBoost: 20, blessingBoost: 15, speedBoost: 10, value: 2000, description: 'A crown forged from pure chrome. It radiates cold authority over machines.' },
  { id: 'relic_plasma_core', name: 'Plasma Heart Core', emoji: '🪄', rarity: 'epic', faction: 'plasma', worshipBoost: 35, blessingBoost: 5, speedBoost: 5, value: 2200, description: 'A contained plasma heart that beats with eternal energy.' },
  { id: 'relic_holo_prism', name: 'Infinity Prism', emoji: '🔮', rarity: 'rare', faction: 'hologram', worshipBoost: 10, blessingBoost: 10, speedBoost: 15, value: 800, description: 'A prism that refracts light into infinite worship dimensions.' },
  { id: 'relic_circuit_ring', name: 'Logic Ring', emoji: '💍', rarity: 'rare', faction: 'circuit', worshipBoost: 5, blessingBoost: 20, speedBoost: 10, value: 750, description: 'A ring that runs logic protocols on any data it touches.' },
  { id: 'relic_cyber_mask', name: 'Ghost Mask', emoji: '🎭', rarity: 'epic', faction: 'cyber', worshipBoost: 25, blessingBoost: 20, speedBoost: 15, value: 2500, description: 'A mask that renders the wearer invisible in cyberspace.' },
  { id: 'relic_void_veil', name: 'Veil of Emptiness', emoji: '🪶', rarity: 'epic', faction: 'void', worshipBoost: 15, blessingBoost: 15, speedBoost: 25, value: 2400, description: 'A veil woven from void threads. It protects against data corruption.' },
  { id: 'relic_digital_hammer', name: 'Compiler Hammer', emoji: '🔨', rarity: 'epic', faction: 'digital', worshipBoost: 20, blessingBoost: 25, speedBoost: 10, value: 2600, description: 'A hammer that compiles reality. Each strike rewrites the code of existence.' },
  { id: 'relic_neon_eye', name: 'Eye of Neon', emoji: '👁️', rarity: 'legendary', faction: 'cyber', worshipBoost: 40, blessingBoost: 30, speedBoost: 20, value: 8000, description: 'The all-seeing neon eye. It perceives every data stream simultaneously.' },
  { id: 'relic_quantum_stone', name: 'Quantum Keystone', emoji: '🗿', rarity: 'legendary', faction: 'circuit', worshipBoost: 30, blessingBoost: 40, speedBoost: 15, value: 7500, description: 'A stone that exists in quantum superposition. It is everywhere and nowhere.' },
  { id: 'relic_void_fang', name: 'Fang of Entropy', emoji: '🗡️', rarity: 'legendary', faction: 'void', worshipBoost: 60, blessingBoost: 20, speedBoost: 20, value: 10000, description: 'A fang carved from pure entropy. It can delete any digital entity.' },
  { id: 'relic_data_vessel', name: 'Vessel of Genesis', emoji: '🏺', rarity: 'legendary', faction: 'digital', worshipBoost: 25, blessingBoost: 35, speedBoost: 30, value: 9000, description: 'A vessel containing the original data of creation. Infinite potential.' },
  { id: 'relic_synth_scepter', name: 'Scepter of Synthesis', emoji: '⚜️', rarity: 'legendary', faction: 'hologram', worshipBoost: 35, blessingBoost: 35, speedBoost: 25, value: 9500, description: 'A scepter that synthesizes all faction energies into one unified force.' },
  { id: 'relic_algo_scroll', name: 'Scroll of Algorithms', emoji: '📜', rarity: 'epic', faction: 'digital', worshipBoost: 20, blessingBoost: 15, speedBoost: 30, value: 2300, description: 'An ancient scroll containing the fundamental algorithms of the universe.' },
  { id: 'relic_plasma_claw', name: 'Claw of Solaris', emoji: '🦁', rarity: 'legendary', faction: 'plasma', worshipBoost: 50, blessingBoost: 45, speedBoost: 25, value: 11000, description: 'The burning claw of Solaris Prime. It ignites the faithful with purpose.' },
  { id: 'relic_neon_egg', name: 'Neon Phoenix Egg', emoji: '🥚', rarity: 'legendary', faction: 'chrome', worshipBoost: 30, blessingBoost: 30, speedBoost: 40, value: 12000, description: 'An eternal neon egg. If a deity falls, it will be reborn from its shell.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: NS_EVENTS — 12 Glitch Events
// ═══════════════════════════════════════════════════════════════════

export const NS_EVENTS: readonly NsEventDef[] = [
  { id: 'evt_power_surge', name: 'Neon Power Surge', emoji: '⚡', durationTurns: 5, effectType: 'buff', effectDescription: 'All worship power doubled. Circuits overloaded.', description: 'A massive power surge courses through the neon grid, empowering all deities.' },
  { id: 'evt_data_storm', name: 'Data Blizzard', emoji: '🌨️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Processing speed reduced by 30%. Circuit deities immune.', description: 'A blizzard of corrupt data overwhelms the shrine circuits.' },
  { id: 'evt_void_bleed', name: 'Void Bleed', emoji: '🕳️', durationTurns: 4, effectType: 'special', effectDescription: 'Void deities gain +50 power. Rare materials appear.', description: 'The void bleeds into the shrine. Shadowy figures emerge from deleted spaces.' },
  { id: 'evt_neon_eclipse', name: 'Neon Eclipse', emoji: '🌑', durationTurns: 2, effectType: 'special', effectDescription: 'Hologram deities triple power. Plasma deities halved.', description: 'The neon lights go dark. Only hologram and void deities remain visible.' },
  { id: 'evt_virus_outbreak', name: 'Virus Outbreak', emoji: '🦠', durationTurns: 3, effectType: 'debuff', effectDescription: 'Cyber deities lose 25% power. Antivirus available.', description: 'A digital virus infects the shrine. Cyber defenses are compromised.' },
  { id: 'evt_genesis_dawn', name: 'Genesis Dawn', emoji: '🌅', durationTurns: 5, effectType: 'buff', effectDescription: 'Credit rewards doubled. Digital deities gain +30% power.', description: 'The Genesis Entity stirs, and a golden dawn illuminates the entire grid.' },
  { id: 'evt_neon_festival', name: 'Neon Festival', emoji: '🎆', durationTurns: 4, effectType: 'buff', effectDescription: 'All deities gain +20% devotion. Hologram deities enhanced.', description: 'A grand festival of neon light. Deities bask in the adoration of millions.' },
  { id: 'evt_server_crash', name: 'Server Crash', emoji: '💀', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% credits. Relic discovery chance increased.', description: 'The shrine server crashes! But amidst the wreckage, ancient artifacts surface.' },
  { id: 'evt_phoenix_reboot', name: 'Phoenix Reboot', emoji: '🔥', durationTurns: 3, effectType: 'buff', effectDescription: 'Plasma deities resurrect once. All healing doubled.', description: 'A system-wide reboot bathes the grid in plasma fire, renewing all circuits.' },
  { id: 'evt_data_drought', name: 'Data Drought', emoji: '☀️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Digital deity power halved. Void deities thrive.', description: 'Data streams run dry. The grid falls silent as deities weaken.' },
  { id: 'evt_code_mutation', name: 'Code Mutation', emoji: '🧬', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus devotion for circuit exploration. Puzzle rewards doubled.', description: 'The shrine code begins to mutate, creating new paths and possibilities.' },
  { id: 'evt_neon_migration', name: 'Deity Migration', emoji: '🌈', durationTurns: 6, effectType: 'buff', effectDescription: 'Worship chance doubled. New deity species appear.', description: 'Thousands of deities migrate across the grid. The perfect time to worship.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const NS_MAX_DEITY_LEVEL = 50
const NS_MAX_STRUCTURE_LEVEL = 10
const NS_INITIAL_CREDITS = 200
const NS_INITIAL_DEVOTION = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function nsXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function nsCalcStats(species: NsDeitySpecies, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    worshipPower: Math.floor(species.worshipPower * growth),
    blessingPower: Math.floor(species.blessingPower * growth),
    processingSpeed: Math.floor(species.processingSpeed * growth),
  }
}

let _nsIdCounter = 0
function nsGenerateId(): string {
  _nsIdCounter += 1
  return `ns_${_nsIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function nsFindDeity(id: string): NsDeitySpecies | undefined {
  return NS_DEITIES.find((d) => d.id === id)
}

function nsFindCircuit(id: string): NsCircuitDef | undefined {
  return NS_CIRCUITS.find((c) => c.id === id)
}

function nsFindMaterial(id: string): NsMaterialDef | undefined {
  return NS_MATERIALS.find((m) => m.id === id)
}

function nsFindStructureDef(id: string): NsStructureDef | undefined {
  return NS_STRUCTURES.find((s) => s.id === id)
}

function nsFindAbility(id: string): NsAbilityDef | undefined {
  return NS_ABILITIES.find((a) => a.id === id)
}

function nsFindRelic(id: string): NsRelicDef | undefined {
  return NS_RELICS.find((r) => r.id === id)
}

function nsFindAchievement(id: string): NsAchievementDef | undefined {
  return NS_ACHIEVEMENTS.find((a) => a.id === id)
}

function nsFindTitle(id: NsTitleId): NsTitleDef | undefined {
  return NS_TITLES.find((t) => t.id === id)
}

function nsRarityMultiplier(rarity: NsRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function nsRarityColor(rarity: NsRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function nsFactionColor(faction: NsFaction): string {
  switch (faction) {
    case 'chrome': return NS_CHROME_SILVER
    case 'plasma': return NS_PLASMA_ORANGE
    case 'hologram': return NS_HOLOGRAM_PURPLE
    case 'circuit': return NS_CIRCUIT_YELLOW
    case 'cyber': return NS_NEON_PINK
    case 'void': return NS_VOID_BLACK
    case 'digital': return NS_ELECTRIC_BLUE
    default: return '#888888'
  }
}

export function nsCheckResonance(attacker: NsFaction, defender: NsFaction): number {
  const advantages = NS_RESONANCE_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = NS_RESONANCE_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function nsCalcStructureUpgradeCost(def: NsStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function nsCalcMaxTitle(devotionPts: number, deityCount: number): NsTitleId {
  let bestId: NsTitleId = 'title_data_novice'
  for (const title of NS_TITLES) {
    if (devotionPts >= title.minDevotion && deityCount >= title.minDeities) {
      bestId = title.id
    }
  }
  return bestId
}

function nsCheckAchievementCondition(
  condition: string,
  state: NsStoreState
): boolean {
  switch (condition) {
    case 'worship_1':
      return state.totalWorshipped >= 1
    case 'worship_5':
      return state.totalWorshipped >= 5
    case 'harvest_1':
      return state.totalHarvested >= 1
    case 'harvest_10':
      return state.totalHarvested >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'circuit_4':
      return state.circuits.length >= 4
    case 'circuit_8':
      return state.circuits.length >= 8
    case 'rare_worship':
      return state.deities.some((d) => {
        const sp = nsFindDeity(d.deityDefId)
        return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'epic_worship':
      return state.deities.some((d) => {
        const sp = nsFindDeity(d.deityDefId)
        return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'legendary_worship':
      return state.deities.some((d) => {
        const sp = nsFindDeity(d.deityDefId)
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
    case 'all_factions': {
      const factions = new Set<NsFaction>()
      for (const d of state.deities) {
        const sp = nsFindDeity(d.deityDefId)
        if (sp) factions.add(sp.faction)
      }
      return factions.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_neon_deity'
    default:
      return false
  }
}

function nsPickRandomEvent(): NsEventDef {
  const idx = Math.floor(Math.random() * NS_EVENTS.length)
  return NS_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useNsStore = create<NsFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      deities: [] as NsDeityInstance[],
      circuits: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as NsStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_data_novice' as NsTitleId,
      credits: NS_INITIAL_CREDITS,
      devotion: NS_INITIAL_DEVOTION,
      totalWorshipped: 0,
      totalHarvested: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as NsEventDef | null,
      eventTurnsRemaining: 0,
      activeCircuit: null as string | null,

      // ── nsWorshipDeity ────────────────────────────────────────
      nsWorshipDeity: (deityDefId: string): boolean => {
        const species = nsFindDeity(deityDefId)
        if (!species) return false
        const cost = Math.floor(50 * nsRarityMultiplier(species.rarity))
        const state = get()
        if (state.credits < cost) return false
        const stats = nsCalcStats(species, 1)
        const newDeity: NsDeityInstance = {
          id: nsGenerateId(),
          deityDefId,
          name: species.name,
          level: 1,
          xp: 0,
          worshipPower: stats.worshipPower,
          blessingPower: stats.blessingPower,
          processingSpeed: stats.processingSpeed,
          devotion: 80,
          corruption: 20,
          worshippedAt: Date.now(),
        }
        set((prev) => {
          const updated = {
            deities: [...prev.deities, newDeity],
            credits: prev.credits - cost,
            totalWorshipped: prev.totalWorshipped + 1,
            devotion: prev.devotion + nsRarityMultiplier(species.rarity) * 5,
            currentTitle: nsCalcMaxTitle(
              prev.devotion + nsRarityMultiplier(species.rarity) * 5,
              prev.deities.length + 1
            ),
          }
          return updated
        })
        return true
      },

      // ── nsBanishDeity ─────────────────────────────────────────
      nsBanishDeity: (deityId: string): boolean => {
        const state = get()
        const exists = state.deities.find((d) => d.id === deityId)
        if (!exists) return false
        const species = nsFindDeity(exists.deityDefId)
        const refund = species ? Math.floor(25 * nsRarityMultiplier(species.rarity)) : 10
        set((prev) => ({
          deities: prev.deities.filter((d) => d.id !== deityId),
          credits: prev.credits + refund,
          currentTitle: nsCalcMaxTitle(prev.devotion, prev.deities.length - 1),
        }))
        return true
      },

      // ── nsUpgradeDeity ────────────────────────────────────────
      nsUpgradeDeity: (deityId: string): boolean => {
        const feedCost = 10
        const state = get()
        if (state.credits < feedCost) return false
        set((prev) => {
          const deities = prev.deities.map((d) => {
            if (d.id !== deityId) return d
            const newXp = d.xp + 20
            const xpNeeded = nsXpForLevel(d.level)
            let newLevel = d.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && d.level < NS_MAX_DEITY_LEVEL) {
              newLevel = d.level + 1
              currentXp = newXp - xpNeeded
            }
            const species = nsFindDeity(d.deityDefId)
            const stats = species ? nsCalcStats(species, newLevel) : { worshipPower: d.worshipPower, blessingPower: d.blessingPower, processingSpeed: d.processingSpeed }
            return {
              ...d,
              level: newLevel,
              xp: currentXp,
              worshipPower: stats.worshipPower,
              blessingPower: stats.blessingPower,
              processingSpeed: stats.processingSpeed,
              devotion: Math.min(100, d.devotion + 10),
              corruption: Math.max(0, d.corruption - 10),
            }
          })
          return { deities, credits: prev.credits - feedCost, devotion: prev.devotion + 2 }
        })
        return true
      },

      // ── nsHarvestData ─────────────────────────────────────────
      nsHarvestData: (deityId: string): boolean => {
        const state = get()
        const deity = state.deities.find((d) => d.id === deityId)
        if (!deity) return false
        if (deity.devotion < 20) return false
        const species = nsFindDeity(deity.deityDefId)
        if (!species) return false
        const materialId = `mat_${species.faction}_${species.rarity}_shard`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(deity.worshipPower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalHarvested: prev.totalHarvested + 1,
          devotion: prev.devotion + 3,
          deities: prev.deities.map((d) =>
            d.id === deityId ? { ...d, devotion: Math.max(0, d.devotion - 20) } : d
          ),
        }))
        return true
      },

      // ── nsBuildStructure ──────────────────────────────────────
      nsBuildStructure: (structureDefId: string): boolean => {
        const def = nsFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.credits < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: NsStructureInstance = {
          id: nsGenerateId(),
          structureDefId,
          level: 1,
          builtAt: Date.now(),
        }
        set((prev) => ({
          structures: [...prev.structures, newStructure],
          credits: prev.credits - def.baseCost,
          totalBuilt: prev.totalBuilt + 1,
          devotion: prev.devotion + 10,
        }))
        return true
      },

      // ── nsUpgradeStructure ────────────────────────────────────
      nsUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= NS_MAX_STRUCTURE_LEVEL) return false
        const def = nsFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = nsCalcStructureUpgradeCost(def, structure.level)
        if (state.credits < cost) return false
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === structureId ? { ...s, level: s.level + 1 } : s
          ),
          credits: prev.credits - cost,
          devotion: prev.devotion + Math.floor(def.effectPerLevel * 2),
        }))
        return true
      },

      // ── nsAccessCircuit ───────────────────────────────────────
      nsAccessCircuit: (circuitId: string): NsEventDef | null => {
        const circuit = nsFindCircuit(circuitId)
        if (!circuit) return null
        const state = get()
        const requiredTitleIdx = NS_TITLES.findIndex((t) => t.id === circuit.requiredTitle)
        const currentTitleIdx = NS_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newCircuits = state.circuits.includes(circuitId) ? state.circuits : [...state.circuits, circuitId]
        const event = nsPickRandomEvent()
        set((prev) => ({
          circuits: newCircuits,
          activeCircuit: circuitId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          devotion: prev.devotion + 5,
        }))
        return event
      },

      // ── nsCollectRelic ────────────────────────────────────────
      nsCollectRelic: (relicId: string): boolean => {
        const relic = nsFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => ({
          relics: [...prev.relics, relicId],
          devotion: prev.devotion + Math.floor(nsRarityMultiplier(relic.rarity) * 20),
          currentTitle: nsCalcMaxTitle(
            prev.devotion + Math.floor(nsRarityMultiplier(relic.rarity) * 20),
            prev.deities.length
          ),
        }))
        return true
      },

      // ── nsUnlockAbility ───────────────────────────────────────
      nsUnlockAbility: (abilityId: string): boolean => {
        const ability = nsFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * nsRarityMultiplier(ability.rarity))
        if (state.credits < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          credits: prev.credits - cost,
        }))
        return true
      },

      // ── nsUnlockTitle ─────────────────────────────────────────
      nsUnlockTitle: (titleId: NsTitleId): boolean => {
        const title = nsFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.devotion < title.minDevotion) return false
        if (state.deities.length < title.minDeities) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── nsClaimAchievement ────────────────────────────────────
      nsClaimAchievement: (achievementId: string): boolean => {
        const achievement = nsFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!nsCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          credits: prev.credits + achievement.reward.credits,
          devotion: prev.devotion + achievement.reward.devotion,
          currentTitle: nsCalcMaxTitle(
            prev.devotion + achievement.reward.devotion,
            prev.deities.length
          ),
        }))
        return true
      },

      // ── nsTradeMaterial ───────────────────────────────────────
      nsTradeMaterial: (materialId: string, count: number): number => {
        const material = nsFindMaterial(materialId)
        if (!material) return 0
        const state = get()
        const owned = state.materials.find((m) => m.materialId === materialId)
        if (!owned || owned.count < count) return 0
        const creditsEarned = material.value * count
        set((prev) => ({
          materials:
            owned.count - count <= 0
              ? prev.materials.filter((m) => m.materialId !== materialId)
              : prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count - count } : m)),
          credits: prev.credits + creditsEarned,
        }))
        return creditsEarned
      },

      // ── nsEndEvent ────────────────────────────────────────────
      nsEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── nsResetEvent ──────────────────────────────────────────
      nsResetEvent: () => {
        const event = nsPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'neon-shrine-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useNeonShrine()
// ═══════════════════════════════════════════════════════════════════

export default function useNeonShrine(): NsAPI {
  const store = useNsStore()

  // ── Computed: Owned deities with species info ────────────────
  const nsOwnedDeities = useMemo(() => {
    return store.deities.map((d) => {
      const species = nsFindDeity(d.deityDefId)
      return {
        ...d,
        species,
        factionColor: species ? nsFactionColor(species.faction) : '#888888',
        rarityColor: species ? nsRarityColor(species.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available deities to worship ───────────────────
  const nsAvailableDeities = useMemo(() => {
    return NS_DEITIES.filter((sp) => {
      const cost = Math.floor(50 * nsRarityMultiplier(sp.rarity))
      return store.credits >= cost
    })
  }, [store])

  // ── Computed: Current title details ───────────────────────────
  const nsCurrentTitleDetail = useMemo(() => {
    return nsFindTitle(store.currentTitle) ?? NS_TITLES[0]
  }, [store])

  // ── Computed: Next title info ─────────────────────────────────
  const nsNextTitle = useMemo(() => {
    const currentIdx = NS_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= NS_TITLES.length - 1) return null
    return NS_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active circuit details ──────────────────────────
  const nsActiveCircuitDetail = useMemo(() => {
    if (!store.activeCircuit) return null
    return nsFindCircuit(store.activeCircuit) ?? null
  }, [store])

  // ── Computed: Unexplored circuits ─────────────────────────────
  const nsUnexploredCircuits = useMemo(() => {
    return NS_CIRCUITS.filter((c) => !store.circuits.includes(c.id))
  }, [store])

  // ── Computed: Structures with defs ────────────────────────────
  const nsBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = nsFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ────────────────────────────
  const nsUnlockableAbilities = useMemo(() => {
    return NS_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * nsRarityMultiplier(a.rarity))
      return store.credits >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ──────────────────────────
  const nsOwnedRelics = useMemo(() => {
    return store.relics.map((rId) => {
      const def = nsFindRelic(rId)
      return def ?? null
    }).filter((r): r is NsRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────────
  const nsUnclaimedAchievements = useMemo(() => {
    return NS_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return nsCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ─────────────────────────────
  const nsInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = nsFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect bonus ────────────────────
  const nsTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = nsFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average deity level ─────────────────────────────
  const nsAverageDeityLevel = useMemo(() => {
    if (store.deities.length === 0) return 0
    const total = store.deities.reduce((sum, d) => sum + d.level, 0)
    return Math.floor(total / store.deities.length)
  }, [store])

  // ── Computed: Total deity power ───────────────────────────────
  const nsTotalDeityPower = useMemo(() => {
    return store.deities.reduce(
      (sum, d) => sum + d.worshipPower + d.blessingPower + d.processingSpeed,
      0
    )
  }, [store])

  // ── Computed: Faction distribution ────────────────────────────
  const nsFactionDistribution = useMemo(() => {
    const counts: Record<NsFaction, number> = {
      chrome: 0, plasma: 0, hologram: 0, circuit: 0, cyber: 0, void: 0, digital: 0,
    }
    for (const d of store.deities) {
      const sp = nsFindDeity(d.deityDefId)
      if (sp) counts[sp.faction]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ─────────────────────────────
  const nsRarityDistribution = useMemo(() => {
    const counts: Record<NsRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const d of store.deities) {
      const sp = nsFindDeity(d.deityDefId)
      if (sp) counts[sp.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Deities by rarity ───────────────────────────────
  const nsDeitiesByRarity = useMemo(() => {
    const groups: Record<NsRarity, NsDeityInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const d of store.deities) {
      const sp = nsFindDeity(d.deityDefId)
      if (sp) groups[sp.rarity].push(d)
    }
    return groups
  }, [store])

  // ── Computed: Deities by faction ──────────────────────────────
  const nsDeitiesByFaction = useMemo(() => {
    const groups: Record<NsFaction, NsDeityInstance[]> = {
      chrome: [], plasma: [], hologram: [], circuit: [], cyber: [], void: [], digital: [],
    }
    for (const d of store.deities) {
      const sp = nsFindDeity(d.deityDefId)
      if (sp) groups[sp.faction].push(d)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ──────────────────────────
  const nsTitleProgress = useMemo(() => {
    const currentIdx = NS_TITLES.findIndex((t) => t.id === store.currentTitle)
    const next = currentIdx >= 0 && currentIdx < NS_TITLES.length - 1 ? NS_TITLES[currentIdx + 1] : null
    if (!next) return { percent: 100, devotionNeeded: 0, deitiesNeeded: 0 }
    const devotionProgress = Math.min(100, (store.devotion / next.minDevotion) * 100)
    const deityProgress = Math.min(100, (store.deities.length / next.minDeities) * 100)
    return {
      percent: Math.floor((devotionProgress + deityProgress) / 2),
      devotionNeeded: Math.max(0, next.minDevotion - store.devotion),
      deitiesNeeded: Math.max(0, next.minDeities - store.deities.length),
    }
  }, [store])

  // ── Computed: Rare materials count ────────────────────────────
  const nsRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = nsFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Corrupted deities ───────────────────────────────
  const nsCorruptedDeities = useMemo(() => {
    return store.deities.filter((d) => d.corruption > 70)
  }, [store])

  // ── Computed: Low devotion deities ────────────────────────────
  const nsLowDevotionDeities = useMemo(() => {
    return store.deities.filter((d) => d.devotion < 30)
  }, [store])

  // ── Computed: Total relic boost ───────────────────────────────
  const nsTotalRelicBoost = useMemo(() => {
    let worshipBoost = 0
    let blessingBoost = 0
    let speedBoost = 0
    for (const rId of store.relics) {
      const relic = nsFindRelic(rId)
      if (relic) {
        worshipBoost += relic.worshipBoost
        blessingBoost += relic.blessingBoost
        speedBoost += relic.speedBoost
      }
    }
    return { worshipBoost, blessingBoost, speedBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return nsAPI object
  // ═════════════════════════════════════════════════════════════

  const nsAPI = {
    // ── Direct constants ──────────────────────────────────────
    NS_NEON_PINK,
    NS_ELECTRIC_BLUE,
    NS_LASER_GREEN,
    NS_PLASMA_ORANGE,
    NS_HOLOGRAM_PURPLE,
    NS_CIRCUIT_YELLOW,
    NS_CHROME_SILVER,
    NS_VOID_BLACK,
    NS_FACTIONS,
    NS_DEITIES,
    NS_CIRCUITS,
    NS_MATERIALS,
    NS_STRUCTURES,
    NS_ABILITIES,
    NS_ACHIEVEMENTS,
    NS_TITLES,
    NS_RELICS,
    NS_EVENTS,
    nsCheckResonance,

    // ── Store state ───────────────────────────────────────────
    deities: store.deities,
    circuits: store.circuits,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    credits: store.credits,
    devotion: store.devotion,
    totalWorshipped: store.totalWorshipped,
    totalHarvested: store.totalHarvested,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeCircuit: store.activeCircuit,

    // ── Store actions ─────────────────────────────────────────
    nsWorshipDeity: store.nsWorshipDeity,
    nsBanishDeity: store.nsBanishDeity,
    nsUpgradeDeity: store.nsUpgradeDeity,
    nsHarvestData: store.nsHarvestData,
    nsBuildStructure: store.nsBuildStructure,
    nsUpgradeStructure: store.nsUpgradeStructure,
    nsAccessCircuit: store.nsAccessCircuit,
    nsCollectRelic: store.nsCollectRelic,
    nsUnlockAbility: store.nsUnlockAbility,
    nsUnlockTitle: store.nsUnlockTitle,
    nsClaimAchievement: store.nsClaimAchievement,
    nsTradeMaterial: store.nsTradeMaterial,
    nsEndEvent: store.nsEndEvent,
    nsResetEvent: store.nsResetEvent,

    // ── Computed getters ──────────────────────────────────────
    nsOwnedDeities,
    nsAvailableDeities,
    nsCurrentTitleDetail,
    nsNextTitle,
    nsActiveCircuitDetail,
    nsUnexploredCircuits,
    nsBuiltStructures,
    nsUnlockableAbilities,
    nsOwnedRelics,
    nsUnclaimedAchievements,
    nsInventoryMaterials,
    nsTotalStructureEffect,
    nsAverageDeityLevel,
    nsTotalDeityPower,
    nsFactionDistribution,
    nsRarityDistribution,
    nsDeitiesByRarity,
    nsDeitiesByFaction,
    nsTitleProgress,
    nsRareMaterialCount,
    nsCorruptedDeities,
    nsLowDevotionDeities,
    nsTotalRelicBoost,
  }

  return nsAPI
}
