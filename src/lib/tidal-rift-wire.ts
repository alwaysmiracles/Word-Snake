/**
 * Tidal Rift Wire — 潮汐裂隙 (Tidal Rift) deep-sea exploration mini-game
 *
 * Command 35 abyssal leviathans across 7 ocean zones, explore 8 rift
 * chambers, collect 30 deep-sea materials, build 25 rift structures,
 * unlock 22 tidal abilities, discover 15 legendary abyssal relics,
 * face 12 rift events, and ascend through 8 titles from Tide Pooler
 * to Tidal Deity — backed by a Zustand store with persist middleware.
 *
 * Storage key: tidal-rift-wire
 * Prefix: tr / TR_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type TrOceanZone =
  | 'twilight'
  | 'midnight'
  | 'abyssal'
  | 'hadal'
  | 'trench'
  | 'vent'
  | 'whirlpool'

export type TrRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type TrTitleId =
  | 'title_tide_pooler'
  | 'title_depth_diver'
  | 'title_abyssal_scout'
  | 'title_rift_warden'
  | 'title_trench_lord'
  | 'title_vent_sovereign'
  | 'title_leviathan_king'
  | 'title_tidal_deity'

export interface TrZoneDef {
  readonly id: TrOceanZone
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface TrLeviathanSpecies {
  readonly id: string
  readonly name: string
  readonly zone: TrOceanZone
  readonly rarity: TrRarity
  readonly bitePower: number
  readonly crushPower: number
  readonly swimSpeed: number
  readonly description: string
  readonly abilities: string[]
}

export interface TrLeviathanInstance {
  readonly id: string
  speciesId: string
  name: string
  level: number
  xp: number
  bitePower: number
  crushPower: number
  swimSpeed: number
  vitality: number
  hunger: number
  commandedAt: number
}

export interface TrChamberDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly dangerLevel: number
  readonly requiredTitle: TrTitleId
  readonly zone: TrOceanZone
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface TrMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'scale' | 'venom' | 'bone' | 'relic_shard' | 'essence'
  readonly rarity: TrRarity
  readonly biteBonus: number
  readonly crushBonus: number
  readonly value: number
  readonly description: string
}

export interface TrStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'holding_pen' | 'depth_tank' | 'venom_lab' | 'pressure_forge' | 'relic_vault'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface TrStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface TrAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly zone: TrOceanZone
  readonly type: 'active' | 'passive'
  readonly rarity: TrRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface TrAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface TrTitleDef {
  readonly id: TrTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minLeviathans: number
  readonly description: string
}

export interface TrRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: TrRarity
  readonly zone: TrOceanZone
  readonly biteBoost: number
  readonly crushBoost: number
  readonly speedBoost: number
  readonly value: number
  readonly description: string
}

export interface TrEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface TrStoreState {
  leviathans: TrLeviathanInstance[]
  chambers: string[]
  materials: { materialId: string; count: number }[]
  structures: TrStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: TrTitleId
  gold: number
  renown: number
  totalCommanded: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: TrEventDef | null
  eventTurnsRemaining: number
  activeChamber: string | null
}

export interface TrStoreActions {
  trCommandLeviathan: (speciesId: string) => boolean
  trReleaseLeviathan: (leviathanId: string) => boolean
  trFeedLeviathan: (leviathanId: string) => boolean
  trHarvestDepth: (leviathanId: string) => boolean
  trBuildStructure: (structureDefId: string) => boolean
  trUpgradeStructure: (structureId: string) => boolean
  trExploreChamber: (chamberId: string) => TrEventDef | null
  trCollectRelic: (relicId: string) => boolean
  trUnlockAbility: (abilityId: string) => boolean
  trUnlockTitle: (titleId: TrTitleId) => boolean
  trClaimAchievement: (achievementId: string) => boolean
  trTradeMaterial: (materialId: string, count: number) => number
  trEndEvent: () => void
  trResetEvent: () => void
}

export interface TrFullStore extends TrStoreState, TrStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const TR_ABYSS_BLUE: string = '#00008B'
export const TR_BIO_CYAN: string = '#00FFEF'
export const TR_TRENCH_PURPLE: string = '#4B0082'
export const TR_VENT_ORANGE: string = '#FF4500'
export const TR_WHIRLPOOL_TEAL: string = '#20B2AA'
export const TR_MIDNIGHT_INDIGO: string = '#191970'
export const TR_DEEP_GREEN: string = '#006400'
export const TR_PEARL_WHITE: string = '#F0F8FF'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: OCEAN ZONE DEFINITIONS (7 zones)
// ═══════════════════════════════════════════════════════════════════

export const TR_ZONES: readonly TrZoneDef[] = [
  {
    id: 'twilight',
    name: 'Twilight Zone',
    color: TR_BIO_CYAN,
    description:
      'The dimly lit realm between sunlight and darkness. Bioluminescent creatures drift through eternal dusk.',
  },
  {
    id: 'midnight',
    name: 'Midnight Zone',
    color: TR_MIDNIGHT_INDIGO,
    description:
      'Total darkness reigns. Only the strongest bioluminescence pierces the ink-black waters.',
  },
  {
    id: 'abyssal',
    name: 'Abyssal Plains',
    color: TR_ABYSS_BLUE,
    description:
      'Vast flat plains of the deep ocean floor. Pressure crushes all but the most hardened leviathans.',
  },
  {
    id: 'hadal',
    name: 'Hadal Depths',
    color: TR_TRENCH_PURPLE,
    description:
      'The deepest trenches of the ocean. Leviathans here have evolved to withstand impossible pressure.',
  },
  {
    id: 'trench',
    name: 'Great Trench',
    color: TR_DEEP_GREEN,
    description:
      'A colossal rift in the ocean floor. Ancient currents carry nutrients from the mantle below.',
  },
  {
    id: 'vent',
    name: 'Hydrothermal Vents',
    color: TR_VENT_ORANGE,
    description:
      'Superheated vents spew mineral-rich water. Only vent-adapted leviathans survive the scalding currents.',
  },
  {
    id: 'whirlpool',
    name: 'Whirlpool Abyss',
    color: TR_WHIRLPOOL_TEAL,
    description:
      'A massive permanent whirlpool draws everything into its depths. The most dangerous zone of all.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: ZONE SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const TR_SYNERGY_MAP: Record<TrOceanZone, TrOceanZone[]> = {
  twilight: ['midnight', 'whirlpool'],
  midnight: ['abyssal', 'trench'],
  abyssal: ['hadal', 'vent'],
  hadal: ['trench', 'vent'],
  trench: ['whirlpool', 'twilight'],
  vent: ['twilight', 'abyssal'],
  whirlpool: ['midnight', 'hadal'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: TR_LEVIATHANS — 35 Abyssal Leviathan Species (5 per zone)
// ═══════════════════════════════════════════════════════════════════

export const TR_LEVIATHANS: readonly TrLeviathanSpecies[] = [
  // ── Twilight Zone Leviathans (5) ───────────────────────────────
  {
    id: 'twi_glow_worm',
    name: 'Luminous Glow Worm',
    zone: 'twilight',
    rarity: 'common',
    bitePower: 10,
    crushPower: 5,
    swimSpeed: 20,
    description:
      'A small bioluminescent worm that leaves trails of cyan light in the twilight waters.',
    abilities: ['bio_glow'],
  },
  {
    id: 'twi_jelly_drake',
    name: 'Jelly Drake',
    zone: 'twilight',
    rarity: 'common',
    bitePower: 16,
    crushPower: 8,
    swimSpeed: 24,
    description:
      'A translucent drake with a jellyfish-like mantle. It stings prey with trailing tentacles.',
    abilities: ['bio_glow', 'sting_lash'],
  },
  {
    id: 'twi_pearl_serpent',
    name: 'Pearl Serpent',
    zone: 'twilight',
    rarity: 'uncommon',
    bitePower: 22,
    crushPower: 18,
    swimSpeed: 30,
    description:
      'A sleek serpent covered in nacreous scales that refract the faint light beautifully.',
    abilities: ['bio_glow', 'pearl_shield'],
  },
  {
    id: 'twi_dusk_angler',
    name: 'Dusk Angler Leviathan',
    zone: 'twilight',
    rarity: 'rare',
    bitePower: 45,
    crushPower: 30,
    swimSpeed: 28,
    description:
      'A massive angler fish whose lure creates an entire false horizon of shimmering light.',
    abilities: ['bio_glow', 'sting_lash', 'dusk_illusion'],
  },
  {
    id: 'twi_abyss_herald',
    name: 'Twilight Herald',
    zone: 'twilight',
    rarity: 'epic',
    bitePower: 70,
    crushPower: 55,
    swimSpeed: 35,
    description:
      'A regal leviathan that patrols the boundary between light and dark. Its arrival signals tidal shifts.',
    abilities: ['bio_glow', 'pearl_shield', 'dusk_illusion', 'tidal_call'],
  },

  // ── Midnight Zone Leviathans (5) ───────────────────────────────
  {
    id: 'mid_void_eel',
    name: 'Void Eel',
    zone: 'midnight',
    rarity: 'common',
    bitePower: 14,
    crushPower: 6,
    swimSpeed: 35,
    description:
      'A jet-black eel that hunts in complete darkness using electroreception.',
    abilities: ['dark_pulse'],
  },
  {
    id: 'mid_shadow_maw',
    name: 'Shadow Maw',
    zone: 'midnight',
    rarity: 'common',
    bitePower: 20,
    crushPower: 12,
    swimSpeed: 22,
    description:
      'A terrifying leviathan with an expandable jaw that can swallow prey whole in the dark.',
    abilities: ['dark_pulse', 'gulp_strike'],
  },
  {
    id: 'mid_ink_specter',
    name: 'Ink Specter',
    zone: 'midnight',
    rarity: 'uncommon',
    bitePower: 28,
    crushPower: 15,
    swimSpeed: 38,
    description:
      'A colossal squid-like leviathan that blankets the water in blinding ink.',
    abilities: ['dark_pulse', 'ink_cloud'],
  },
  {
    id: 'mid_phantom_kraken',
    name: 'Phantom Kraken',
    zone: 'midnight',
    rarity: 'rare',
    bitePower: 50,
    crushPower: 40,
    swimSpeed: 26,
    description:
      'A kraken whose tentacles phase between dimensions. Prey never sees it coming.',
    abilities: ['dark_pulse', 'ink_cloud', 'phase_tentacle'],
  },
  {
    id: 'mid_nightmare_depths',
    name: 'Nightmare of the Depths',
    zone: 'midnight',
    rarity: 'legendary',
    bitePower: 120,
    crushPower: 95,
    swimSpeed: 40,
    description:
      'The apex predator of the midnight zone. It induces terror in all creatures within a mile.',
    abilities: ['dark_pulse', 'gulp_strike', 'ink_cloud', 'phase_tentacle', 'abyssal_roar'],
  },

  // ── Abyssal Plains Leviathans (5) ──────────────────────────────
  {
    id: 'abyss_crawler',
    name: 'Abyssal Crawler',
    zone: 'abyssal',
    rarity: 'common',
    bitePower: 18,
    crushPower: 20,
    swimSpeed: 10,
    description:
      'A heavily armored crawler that traverses the abyssal plains on multiple jointed legs.',
    abilities: ['pressure_shell'],
  },
  {
    id: 'abyss_mud_wyrm',
    name: 'Mud Wyrm',
    zone: 'abyssal',
    rarity: 'common',
    bitePower: 15,
    crushPower: 25,
    swimSpeed: 12,
    description:
      'A burrowing worm that swims through the soft sediment of the ocean floor.',
    abilities: ['pressure_shell', 'sediment_burst'],
  },
  {
    id: 'abyss_pressure_lord',
    name: 'Pressure Lord',
    zone: 'abyssal',
    rarity: 'uncommon',
    bitePower: 35,
    crushPower: 42,
    swimSpeed: 14,
    description:
      'A crab-like leviathan with a shell that can withstand the crushing pressure of the abyss.',
    abilities: ['pressure_shell', 'crush_claw'],
  },
  {
    id: 'abyss_granite_beast',
    name: 'Granite Beast',
    zone: 'abyssal',
    rarity: 'rare',
    bitePower: 55,
    crushPower: 65,
    swimSpeed: 8,
    description:
      'A slow but immensely powerful leviathan covered in stone-like plating scavenged from the seafloor.',
    abilities: ['pressure_shell', 'sediment_burst', 'stone_rampart'],
  },
  {
    id: 'abyss_colossus',
    name: 'Abyssal Colossus',
    zone: 'abyssal',
    rarity: 'epic',
    bitePower: 85,
    crushPower: 100,
    swimSpeed: 6,
    description:
      'The largest leviathan of the plains. It moves so slowly that barnacles grow cities on its back.',
    abilities: ['pressure_shell', 'crush_claw', 'stone_rampart', 'seismic_slam'],
  },

  // ── Hadal Depths Leviathans (5) ────────────────────────────────
  {
    id: 'had_trenchling',
    name: 'Trenchling',
    zone: 'hadal',
    rarity: 'common',
    bitePower: 22,
    crushPower: 15,
    swimSpeed: 18,
    description:
      'A small but resilient fish that thrives in the deepest trenches. Nearly indestructible for its size.',
    abilities: ['depth_adapt'],
  },
  {
    id: 'had_ripjaw',
    name: 'Ripjaw',
    zone: 'hadal',
    rarity: 'common',
    bitePower: 30,
    crushPower: 12,
    swimSpeed: 28,
    description:
      'A ferocious hadal predator with teeth that can bite through steel cables.',
    abilities: ['depth_adapt', 'steel_bite'],
  },
  {
    id: 'had_vortex_wyrm',
    name: 'Vortex Wyrm',
    zone: 'hadal',
    rarity: 'uncommon',
    bitePower: 38,
    crushPower: 30,
    swimSpeed: 32,
    description:
      'A serpentine leviathan that creates miniature whirlpools to disorient prey.',
    abilities: ['depth_adapt', 'mini_vortex'],
  },
  {
    id: 'had_pressure_dragon',
    name: 'Pressure Dragon',
    zone: 'hadal',
    rarity: 'rare',
    bitePower: 60,
    crushPower: 50,
    swimSpeed: 25,
    description:
      'A dragon-like leviathan that channels extreme pressure into devastating breath attacks.',
    abilities: ['depth_adapt', 'steel_bite', 'pressure_breath'],
  },
  {
    id: 'had_pearl_emperor',
    name: 'Pearl Emperor',
    zone: 'hadal',
    rarity: 'legendary',
    bitePower: 110,
    crushPower: 90,
    swimSpeed: 30,
    description:
      'An ancient emperor leviathan encased in a shell of abyssal pearls. It rules the hadal depths.',
    abilities: ['depth_adapt', 'mini_vortex', 'pressure_breath', 'pearl_cascade', 'imperial_decree'],
  },

  // ── Great Trench Leviathans (5) ────────────────────────────────
  {
    id: 'trn_cliff_fish',
    name: 'Cliff Fish',
    zone: 'trench',
    rarity: 'common',
    bitePower: 12,
    crushPower: 10,
    swimSpeed: 26,
    description:
      'A nimble fish that clings to the sheer walls of the Great Trench.',
    abilities: ['wall_cling'],
  },
  {
    id: 'trn_rift_crawler',
    name: 'Rift Crawler',
    zone: 'trench',
    rarity: 'common',
    bitePower: 20,
    crushPower: 18,
    swimSpeed: 14,
    description:
      'A multi-limbed crawler that navigates the treacherous rift walls with ease.',
    abilities: ['wall_cling', 'rift_grapple'],
  },
  {
    id: 'trn_current_serpent',
    name: 'Current Serpent',
    zone: 'trench',
    rarity: 'uncommon',
    bitePower: 30,
    crushPower: 22,
    swimSpeed: 40,
    description:
      'A serpent that rides the powerful updraft currents within the trench at incredible speed.',
    abilities: ['wall_cling', 'current_surf'],
  },
  {
    id: 'trn_rift_guardian',
    name: 'Rift Guardian',
    zone: 'trench',
    rarity: 'rare',
    bitePower: 55,
    crushPower: 48,
    swimSpeed: 20,
    description:
      'A massive guardian that patrols the Great Trench entrance. Nothing passes without its consent.',
    abilities: ['wall_cling', 'rift_grapple', 'trench_call'],
  },
  {
    id: 'trn_chasm_wyrm',
    name: 'Chasm Wyrm',
    zone: 'trench',
    rarity: 'epic',
    bitePower: 80,
    crushPower: 75,
    swimSpeed: 22,
    description:
      'A colossal wyrm that lives in the deepest chasm of the Great Trench. It can cause earthquakes.',
    abilities: ['wall_cling', 'current_surf', 'trench_call', 'chasm_quake'],
  },

  // ── Hydrothermal Vent Leviathans (5) ───────────────────────────
  {
    id: 'vent_scorch_ling',
    name: 'Scorchling',
    zone: 'vent',
    rarity: 'common',
    bitePower: 16,
    crushPower: 5,
    swimSpeed: 22,
    description:
      'A small vent fish that feeds directly from superheated mineral plumes.',
    abilities: ['heat_resist'],
  },
  {
    id: 'vent_brimstone_crab',
    name: 'Brimstone Crab',
    zone: 'vent',
    rarity: 'common',
    bitePower: 24,
    crushPower: 20,
    swimSpeed: 10,
    description:
      'A crab with a shell of hardened volcanic minerals. It thrives in scalding water.',
    abilities: ['heat_resist', 'scald_pinch'],
  },
  {
    id: 'vent_magma_eel',
    name: 'Magma Eel',
    zone: 'vent',
    rarity: 'uncommon',
    bitePower: 35,
    crushPower: 15,
    swimSpeed: 30,
    description:
      'An eel that channels heat through its body to superheated levels. Burns on contact.',
    abilities: ['heat_resist', 'superheat'],
  },
  {
    id: 'vent_smoke_viper',
    name: 'Smoke Viper',
    zone: 'vent',
    rarity: 'rare',
    bitePower: 48,
    crushPower: 28,
    swimSpeed: 28,
    description:
      'A viper that exhales clouds of superheated black smoke to blind and burn prey.',
    abilities: ['heat_resist', 'scald_pinch', 'smoke_venom'],
  },
  {
    id: 'vent_eruption_titan',
    name: 'Eruption Titan',
    zone: 'vent',
    rarity: 'legendary',
    bitePower: 105,
    crushPower: 80,
    swimSpeed: 15,
    description:
      'A massive titan that dwells in the caldera of an active submarine volcano. It causes eruptions.',
    abilities: ['heat_resist', 'superheat', 'smoke_venom', 'eruption_wave', 'magma_armor'],
  },

  // ── Whirlpool Abyss Leviathans (5) ─────────────────────────────
  {
    id: 'whl_drift_ray',
    name: 'Drift Ray',
    zone: 'whirlpool',
    rarity: 'common',
    bitePower: 8,
    crushPower: 8,
    swimSpeed: 40,
    description:
      'A flat ray that rides the outermost currents of the whirlpool with effortless grace.',
    abilities: ['current_ride'],
  },
  {
    id: 'whl_spin_shark',
    name: 'Spin Shark',
    zone: 'whirlpool',
    rarity: 'common',
    bitePower: 25,
    crushPower: 10,
    swimSpeed: 38,
    description:
      'A shark that spins at incredible speed, creating a drill-like attack through water.',
    abilities: ['current_ride', 'spin_drill'],
  },
  {
    id: 'whl_maelstrom_serpent',
    name: 'Maelstrom Serpent',
    zone: 'whirlpool',
    rarity: 'uncommon',
    bitePower: 32,
    crushPower: 35,
    swimSpeed: 42,
    description:
      'A serpent that generates its own whirlpool, pulling prey into its coils.',
    abilities: ['current_ride', 'maelstrom_coil'],
  },
  {
    id: 'whl_abyss_manta',
    name: 'Abyss Manta',
    zone: 'whirlpool',
    rarity: 'rare',
    bitePower: 40,
    crushPower: 50,
    swimSpeed: 35,
    description:
      'A giant manta whose wingspan creates wind tunnels that can fling enemies miles away.',
    abilities: ['current_ride', 'spin_drill', 'gale_wing'],
  },
  {
    id: 'whl_eye_storm',
    name: 'Eye of the Storm',
    zone: 'whirlpool',
    rarity: 'epic',
    bitePower: 75,
    crushPower: 65,
    swimSpeed: 50,
    description:
      'A mysterious leviathan that dwells at the calm center of the whirlpool. It controls the vortex.',
    abilities: ['current_ride', 'maelstrom_coil', 'gale_wing', 'storm_eye'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: TR_CHAMBERS — 8 Rift Chambers
// ═══════════════════════════════════════════════════════════════════

export const TR_CHAMBERS: readonly TrChamberDef[] = [
  {
    id: 'sunlit_portal',
    name: 'Sunlit Portal',
    description:
      'A rare shaft of sunlight pierces through to this shallow rift chamber. Bioluminescent algae bloom here.',
    depth: 0,
    dangerLevel: 1,
    requiredTitle: 'title_tide_pooler',
    zone: 'twilight',
    bgGradient: 'linear-gradient(180deg, #00FFEF 0%, #00008B 50%, #191970 100%)',
    ambientColor: TR_BIO_CYAN,
  },
  {
    id: 'coral_cathedral',
    name: 'Coral Cathedral',
    description:
      'Massive bioluminescent coral formations create cathedral-like arches. Home to twilight zone leviathans.',
    depth: 1,
    dangerLevel: 2,
    requiredTitle: 'title_tide_pooler',
    zone: 'twilight',
    bgGradient: 'linear-gradient(180deg, #20B2AA 0%, #006400 50%, #00008B 100%)',
    ambientColor: TR_WHIRLPOOL_TEAL,
  },
  {
    id: 'midnight_sanctum',
    name: 'Midnight Sanctum',
    description:
      'A sealed chamber where no light has ever reached. Ancient leviathans sleep in suspended animation here.',
    depth: 2,
    dangerLevel: 3,
    requiredTitle: 'title_depth_diver',
    zone: 'midnight',
    bgGradient: 'linear-gradient(180deg, #191970 0%, #00008B 50%, #4B0082 100%)',
    ambientColor: TR_MIDNIGHT_INDIGO,
  },
  {
    id: 'echoing_void',
    name: 'Echoing Void',
    description:
      'A vast open chamber where sound carries for miles. Leviathans here communicate across the abyss.',
    depth: 3,
    dangerLevel: 4,
    requiredTitle: 'title_abyssal_scout',
    zone: 'abyssal',
    bgGradient: 'linear-gradient(180deg, #00008B 0%, #191970 50%, #006400 100%)',
    ambientColor: TR_ABYSS_BLUE,
  },
  {
    id: 'pressure_crucible',
    name: 'Pressure Crucible',
    description:
      'A chamber where tectonic forces create impossible pressure. Only the hardest leviathans survive.',
    depth: 4,
    dangerLevel: 5,
    requiredTitle: 'title_rift_warden',
    zone: 'hadal',
    bgGradient: 'linear-gradient(180deg, #4B0082 0%, #00008B 50%, #191970 100%)',
    ambientColor: TR_TRENCH_PURPLE,
  },
  {
    id: 'trench_throne',
    name: 'Trench Throne',
    description:
      'The deepest point of the Great Trench. A throne of ancient coral sits here, radiating primal energy.',
    depth: 5,
    dangerLevel: 6,
    requiredTitle: 'title_trench_lord',
    zone: 'trench',
    bgGradient: 'linear-gradient(180deg, #006400 0%, #4B0082 50%, #00008B 100%)',
    ambientColor: TR_DEEP_GREEN,
  },
  {
    id: 'vent_forge',
    name: 'Vent Forge',
    description:
      'A ring of hydrothermal vents that superheat the water to volcanic temperatures. Minerals crystallize here.',
    depth: 6,
    dangerLevel: 7,
    requiredTitle: 'title_vent_sovereign',
    zone: 'vent',
    bgGradient: 'linear-gradient(180deg, #FF4500 0%, #006400 50%, #00008B 100%)',
    ambientColor: TR_VENT_ORANGE,
  },
  {
    id: 'whirlpool_core',
    name: 'Whirlpool Core',
    description:
      'The calm center of the eternal whirlpool. Time flows differently here. The ultimate challenge awaits.',
    depth: 7,
    dangerLevel: 8,
    requiredTitle: 'title_leviathan_king',
    zone: 'whirlpool',
    bgGradient: 'linear-gradient(180deg, #20B2AA 0%, #00FFEF 50%, #00008B 100%)',
    ambientColor: TR_WHIRLPOOL_TEAL,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: TR_MATERIALS — 30 Deep-Sea Materials
// ═══════════════════════════════════════════════════════════════════

export const TR_MATERIALS: readonly TrMaterialDef[] = [
  // Common (8)
  { id: 'mat_glow_scale', name: 'Bioluminescent Scale', emoji: '💎', type: 'scale', rarity: 'common', biteBonus: 2, crushBonus: 1, value: 10, description: 'A scale that glows with faint cyan light even after removal.' },
  { id: 'mat_pearl_shard', name: 'Pearl Shard', emoji: '🦪', type: 'scale', rarity: 'common', biteBonus: 1, crushBonus: 3, value: 12, description: 'A fragment of deep-sea pearl, iridescent and smooth to the touch.' },
  { id: 'mat_ink_sac', name: 'Ink Sac', emoji: '⚫', type: 'essence', rarity: 'common', biteBonus: 4, crushBonus: 0, value: 8, description: 'A sac of midnight-zone ink, used for darkening potions.' },
  { id: 'mat_coral_chip', name: 'Coral Chip', emoji: '🪸', type: 'bone', rarity: 'common', biteBonus: 1, crushBonus: 2, value: 9, description: 'A small chip of bioluminescent coral. Still faintly glowing.' },
  { id: 'mat_abyss_sand', name: 'Abyssal Sand', emoji: '⬛', type: 'essence', rarity: 'common', biteBonus: 0, crushBonus: 2, value: 6, description: 'Fine black sand from the abyssal plains. Packed with minerals.' },
  { id: 'mat_trench_claw', name: 'Trench Claw Fragment', emoji: '🦀', type: 'bone', rarity: 'common', biteBonus: 5, crushBonus: 1, value: 14, description: 'A broken claw from a trench crawler. Still sharp after centuries.' },
  { id: 'mat_vent_mineral', name: 'Vent Mineral Crystal', emoji: '🔶', type: 'relic_shard', rarity: 'common', biteBonus: 3, crushBonus: 2, value: 15, description: 'A mineral crystal formed by hydrothermal vent deposits.' },
  { id: 'mat_drift_bone', name: 'Drift Bone', emoji: '🦴', type: 'bone', rarity: 'common', biteBonus: 2, crushBonus: 3, value: 7, description: 'A porous bone from a deep-sea scavenger. Lightweight but strong.' },

  // Uncommon (7)
  { id: 'mat_jelly_venom', name: 'Jelly Drake Venom', emoji: '🧪', type: 'venom', rarity: 'uncommon', biteBonus: 12, crushBonus: 0, value: 80, description: 'Potent neurotoxin from a jelly drake. Causes paralysis.' },
  { id: 'mat_pearl_plate', name: 'Pearl Serpent Plate', emoji: '📿', type: 'scale', rarity: 'uncommon', biteBonus: 5, crushBonus: 10, value: 75, description: 'A large scale from a pearl serpent. Highly resistant to pressure.' },
  { id: 'mat_shadow_fang', name: 'Shadow Maw Fang', emoji: '🦷', type: 'bone', rarity: 'uncommon', biteBonus: 15, crushBonus: 3, value: 85, description: 'A massive fang from a midnight zone shadow maw.' },
  { id: 'mat_void_ink', name: 'Void Eel Ink', emoji: '🖤', type: 'essence', rarity: 'uncommon', biteBonus: 8, crushBonus: 5, value: 70, description: 'Ink from a void eel that absorbs all light. Used in cloaking elixirs.' },
  { id: 'mat_pressure_shell', name: 'Pressure Lord Shell', emoji: '🛡️', type: 'scale', rarity: 'uncommon', biteBonus: 3, crushBonus: 14, value: 90, description: 'A fragment of the impenetrable shell of a pressure lord.' },
  { id: 'mat_vent_sulfur', name: 'Vent Sulfur Crystal', emoji: '💛', type: 'relic_shard', rarity: 'uncommon', biteBonus: 10, crushBonus: 8, value: 82, description: 'A crystal of pure sulfur from a hydrothermal vent. Burns underwater.' },
  { id: 'mat_current_pearl', name: 'Whirlpool Pearl', emoji: '🌀', type: 'essence', rarity: 'uncommon', biteBonus: 7, crushBonus: 12, value: 88, description: 'A pearl formed in the extreme currents of a whirlpool.' },

  // Rare (6)
  { id: 'mat_angler_lure', name: 'Dusk Angler Lure', emoji: '🐟', type: 'relic_shard', rarity: 'rare', biteBonus: 20, crushBonus: 15, value: 350, description: 'The bioluminescent lure of a dusk angler. Projects holographic illusions.' },
  { id: 'mat_kraken_beak', name: 'Phantom Kraken Beak', emoji: '🦑', type: 'bone', rarity: 'rare', biteBonus: 30, crushBonus: 20, value: 380, description: 'A massive beak from a phantom kraken. Can bite through titanium.' },
  { id: 'mat_granite_plate', name: 'Granite Beast Armor Plate', emoji: '🪨', type: 'scale', rarity: 'rare', biteBonus: 10, crushBonus: 35, value: 320, description: 'A stone-like armor plate from a granite beast. Immensely heavy.' },
  { id: 'mat_dragon_scale', name: 'Pressure Dragon Scale', emoji: '🐉', type: 'scale', rarity: 'rare', biteBonus: 25, crushBonus: 18, value: 360, description: 'A scale from a pressure dragon. Channels depth pressure into force.' },
  { id: 'mat_rift_crystal', name: 'Rift Guardian Crystal', emoji: '💠', type: 'relic_shard', rarity: 'rare', biteBonus: 18, crushBonus: 25, value: 340, description: 'A crystal grown in a rift wall. Pulsates with tectonic energy.' },
  { id: 'mat_smoke_gland', name: 'Smoke Viper Gland', emoji: '☁️', type: 'venom', rarity: 'rare', biteBonus: 22, crushBonus: 10, value: 370, description: 'A gland from a smoke viper that produces superheated black smoke.' },

  // Epic (5)
  { id: 'mat_herald_crown', name: 'Twilight Herald Crown Scale', emoji: '👑', type: 'scale', rarity: 'epic', biteBonus: 35, crushBonus: 30, value: 1500, description: 'A radiant scale from the Twilight Herald\'s crown. Commands tidal forces.' },
  { id: 'mat_nightmare_heart', name: 'Nightmare Heart', emoji: '💀', type: 'essence', rarity: 'epic', biteBonus: 45, crushBonus: 20, value: 1600, description: 'The still-beating heart of a Nightmare of the Depths. Radiates pure terror.' },
  { id: 'mat_colossus_core', name: 'Colossus Core Fragment', emoji: '⭐', type: 'relic_shard', rarity: 'epic', biteBonus: 20, crushBonus: 50, value: 1700, description: 'A fragment of the Abyssal Colossus\'s core. Unimaginably dense.' },
  { id: 'mat_emperor_pearl', name: 'Pearl Emperor Pearl', emoji: '🫧', type: 'essence', rarity: 'epic', biteBonus: 30, crushBonus: 35, value: 1800, description: 'A pearl from the Pearl Emperor\'s crown. Grants hydrostatic immunity.' },
  { id: 'mat_titan_heart', name: 'Eruption Titan Heart', emoji: '🌋', type: 'essence', rarity: 'epic', biteBonus: 40, crushBonus: 25, value: 1400, description: 'The volcanic heart of an Eruption Titan. Burns with eternal magma.' },

  // Legendary (4)
  { id: 'mat_tidal_essence', name: 'Tidal Essence', emoji: '🌊', type: 'essence', rarity: 'legendary', biteBonus: 60, crushBonus: 60, value: 8000, description: 'Pure concentrated tidal energy. A single drop can power a submarine.' },
  { id: 'mat_rift_core', name: 'Rift Core Shard', emoji: '🕳️', type: 'relic_shard', rarity: 'legendary', biteBonus: 80, crushBonus: 40, value: 10000, description: 'A shard from the center of an ocean rift. It hums with primordial energy.' },
  { id: 'mat_storm_eye', name: 'Storm Eye Gem', emoji: '🌀', type: 'essence', rarity: 'legendary', biteBonus: 50, crushBonus: 70, value: 9000, description: 'The gem from the Eye of the Storm\'s forehead. Controls water currents.' },
  { id: 'mat_abyss_blood', name: 'Abyssal Blood Crystal', emoji: '🔴', type: 'relic_shard', rarity: 'legendary', biteBonus: 45, crushBonus: 45, value: 12000, description: 'Crystallized blood from the oldest leviathan. Contains the memory of the deep.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: TR_STRUCTURES — 25 Rift Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const TR_STRUCTURES: readonly TrStructureDef[] = [
  // ── Holding Pens (7) ───────────────────────────────────────────
  { id: 'str_glow_pen', name: 'Bioluminescent Pen', emoji: '🕳️', category: 'holding_pen', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A pen lined with bioluminescent coral for housing twilight zone leviathans.' },
  { id: 'str_dark_tank', name: 'Dark Water Tank', emoji: '🌑', category: 'holding_pen', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A lightless tank for housing midnight zone leviathans that shun illumination.' },
  { id: 'str_pressure_pen', name: 'Pressure Pen', emoji: '🪨', category: 'holding_pen', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'A reinforced pen that simulates abyssal pressure for deep-sea leviathans.' },
  { id: 'str_hadal_vault', name: 'Hadal Containment Vault', emoji: '🔒', category: 'holding_pen', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'A vault capable of withstanding hadal-level pressure and darkness.' },
  { id: 'str_trench_cage', name: 'Trench Wall Cage', emoji: '⛓️', category: 'holding_pen', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A cage built into the trench walls for housing trench-zone leviathans.' },
  { id: 'str_vent_pool', name: 'Heated Vent Pool', emoji: '♨️', category: 'holding_pen', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A pool fed by hydrothermal vents for housing vent-zone leviathans.' },
  { id: 'str_vortex_pen', name: 'Vortex Containment', emoji: '🌀', category: 'holding_pen', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'A specially designed pen with current dampeners for whirlpool leviathans.' },

  // ── Depth Tanks (6) ────────────────────────────────────────────
  { id: 'str_shallow_tank', name: 'Shallow Depth Tank', emoji: '💧', category: 'depth_tank', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A pressurized tank for healing and restoring twilight-zone leviathans.' },
  { id: 'str_midnight_pool', name: 'Midnight Healing Pool', emoji: '🌊', category: 'depth_tank', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A dark pool infused with healing minerals from the midnight zone.' },
  { id: 'str_abyssal_bath', name: 'Abyssal Rejuvenation Bath', emoji: '🛁', category: 'depth_tank', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A mineral-rich bath that restores leviathans to peak condition.' },
  { id: 'str_hadal_sanctuary', name: 'Hadal Sanctuary', emoji: '🙏', category: 'depth_tank', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A deep sanctuary that can fully restore even legendary leviathans.' },
  { id: 'str_thermal_spring', name: 'Thermal Spring', emoji: '♨️', category: 'depth_tank', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A volcanic spring that permanently boosts leviathan vitality.' },
  { id: 'str_vortex_spring', name: 'Vortex Healing Spring', emoji: '💫', category: 'depth_tank', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'A spring in the calm eye of a vortex. Grants mystical resilience.' },

  // ── Venom Labs (5) ─────────────────────────────────────────────
  { id: 'str_basic_extractor', name: 'Basic Venom Extractor', emoji: '🧪', category: 'venom_lab', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A simple extraction device for harvesting common leviathan venom.' },
  { id: 'str_pressure_centrifuge', name: 'Pressure Centrifuge', emoji: '⚗️', category: 'venom_lab', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'A centrifuge that uses deep-sea pressure to extract pure venom.' },
  { id: 'str_abyssal_still', name: 'Abyssal Distillation Still', emoji: '🫧', category: 'venom_lab', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A still that distills venom using abyssal cold for maximum purity.' },
  { id: 'str_void_chamber', name: 'Void Extraction Chamber', emoji: '🔬', category: 'venom_lab', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A chamber that extracts essence from venom using void-zone physics.' },
  { id: 'str_tidal_crucible', name: 'Tidal Crucible', emoji: '🌋', category: 'venom_lab', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate venom laboratory. Synthesizes legendary compounds from raw materials.' },

  // ── Pressure Forges (4) ────────────────────────────────────────
  { id: 'str_depth_forge', name: 'Depth Forge', emoji: '🔨', category: 'pressure_forge', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A forge that uses hydrostatic pressure to harden materials.' },
  { id: 'str_trench_anvil', name: 'Trench Anvil', emoji: '⚒️', category: 'pressure_forge', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'An anvil made from trench metal. Amplifies material properties.' },
  { id: 'str_hadal_press', name: 'Hadal Hydraulic Press', emoji: '🏗️', category: 'pressure_forge', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A press that applies hadal-level force to forge legendary items.' },
  { id: 'str_rift_cauldron', name: 'Rift Cauldron', emoji: '🏺', category: 'pressure_forge', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'A cauldron at the rift\'s edge. Its fire never extinguishes.' },

  // ── Relic Vaults (3) ───────────────────────────────────────────
  { id: 'str_relic_shelf', name: 'Relic Display Shelf', emoji: '🖼️', category: 'relic_vault', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A pressure-resistant shelf for displaying abyssal relics.' },
  { id: 'str_abyss_vault', name: 'Abyssal Relic Vault', emoji: '🏦', category: 'relic_vault', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A magically sealed vault that amplifies the power of stored relics.' },
  { id: 'str_tidal_sanctum', name: 'Tidal Sanctum', emoji: '👑', category: 'relic_vault', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'A sanctum at the ocean\'s heart. Relics placed here gain tidal power.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: TR_ABILITIES — 22 Tidal Abilities
// ═══════════════════════════════════════════════════════════════════

export const TR_ABILITIES: readonly TrAbilityDef[] = [
  { id: 'ab_crush', name: 'Crush', emoji: '🦑', zone: 'abyssal', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Constrict the target with crushing force.' },
  { id: 'ab_bite', name: 'Abyssal Bite', emoji: '🦷', zone: 'hadal', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Bite with fangs that pierce any armor.' },
  { id: 'ab_bio_glow', name: 'Bioluminescent Flash', emoji: '💡', zone: 'twilight', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Emit a blinding flash of bioluminescent light.' },
  { id: 'ab_dark_pulse', name: 'Dark Pulse', emoji: '🌑', zone: 'midnight', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 10, description: 'Emit a pulse of absolute darkness that disorients foes.' },
  { id: 'ab_pressure_shell', name: 'Pressure Shell', emoji: '🛡️', zone: 'abyssal', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 8, description: 'Harden your shell using deep-sea pressure.' },
  { id: 'ab_heat_resist', name: 'Heat Resistance', emoji: '🔥', zone: 'vent', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Become immune to heat and volcanic damage.' },
  { id: 'ab_current_ride', name: 'Current Ride', emoji: '🌊', zone: 'whirlpool', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 10, description: 'Ride a deep current for a burst of incredible speed.' },
  { id: 'ab_wall_cling', name: 'Wall Cling', emoji: '🧗', zone: 'trench', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 10, description: 'Attach to any surface and traverse walls effortlessly.' },
  { id: 'ab_depth_adapt', name: 'Depth Adaptation', emoji: '🔦', zone: 'hadal', type: 'passive', rarity: 'common', energyCost: 0, cooldown: 0, power: 15, description: 'Automatically adapt to any pressure level. No depth penalty.' },
  { id: 'ab_sting_lash', name: 'Sting Lash', emoji: '⚡', zone: 'twilight', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Lash out with electrified tentacles that stun targets.' },
  { id: 'ab_ink_cloud', name: 'Ink Cloud', emoji: '💨', zone: 'midnight', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Release a massive cloud of blinding ink.' },
  { id: 'ab_stone_rampart', name: 'Stone Rampart', emoji: '🪨', zone: 'abyssal', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 80, power: 25, description: 'Raise a wall of compressed seafloor stone.' },
  { id: 'ab_mini_vortex', name: 'Mini Vortex', emoji: '🌀', zone: 'hadal', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 100, power: 32, description: 'Create a small whirlpool that pulls enemies in.' },
  { id: 'ab_rift_grapple', name: 'Rift Grapple', emoji: '⛓️', zone: 'trench', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 55, power: 22, description: 'Fire a grapple hook that anchors to rift walls.' },
  { id: 'ab_scald_pinch', name: 'Scald Pinch', emoji: '🦀', zone: 'vent', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 65, power: 30, description: 'Pinch with superheated claws that cauterize wounds.' },
  { id: 'ab_spin_drill', name: 'Spin Drill', emoji: '💥', zone: 'whirlpool', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 28, description: 'Spin at extreme speed and drill through obstacles.' },
  { id: 'ab_dusk_illusion', name: 'Dusk Illusion', emoji: '🎭', zone: 'twilight', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 45, description: 'Create holographic duplicates that confuse enemies.' },
  { id: 'ab_phase_tentacle', name: 'Phase Tentacle', emoji: '👻', zone: 'midnight', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 110, power: 50, description: 'Strike with tentacles that phase through solid matter.' },
  { id: 'ab_seismic_slam', name: 'Seismic Slam', emoji: '💥', zone: 'abyssal', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Slam the seafloor and trigger a localized earthquake.' },
  { id: 'ab_eruption_wave', name: 'Eruption Wave', emoji: '🌋', zone: 'vent', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Trigger a volcanic eruption that devastates everything in range.' },
  { id: 'ab_storm_eye', name: 'Storm Eye', emoji: '🌀', zone: 'whirlpool', type: 'active', rarity: 'epic', energyCost: 45, cooldown: 250, power: 70, description: 'Create a zone of perfect calm that shields allies.' },
  { id: 'ab_abyssal_roar', name: 'Abyssal Roar', emoji: '🐉', zone: 'midnight', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'A roar so powerful it creates a shockwave across the entire ocean.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: TR_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const TR_ACHIEVEMENTS: readonly TrAchievementDef[] = [
  { id: 'ach_first_command', name: 'First Command', emoji: '🐙', description: 'Command your first leviathan.', condition: 'command_1', reward: { gold: 50, renown: 10 } },
  { id: 'ach_five_commanded', name: 'Leviathan Handler', emoji: '🤚', description: 'Command 5 different leviathans.', condition: 'command_5', reward: { gold: 200, renown: 40 } },
  { id: 'ach_first_harvest', name: 'Depth Harvester', emoji: '⛏️', description: 'Harvest from the deep for the first time.', condition: 'harvest_1', reward: { gold: 80, renown: 15 } },
  { id: 'ach_ten_harvests', name: 'Master Dredger', emoji: '🧲', description: 'Harvest from the deep 10 times.', condition: 'harvest_10', reward: { gold: 300, renown: 60 } },
  { id: 'ach_first_build', name: 'Rift Architect', emoji: '🏗️', description: 'Build your first rift structure.', condition: 'build_1', reward: { gold: 100, renown: 20 } },
  { id: 'ach_five_builds', name: 'Deep Builder', emoji: '🏛️', description: 'Build 5 different rift structures.', condition: 'build_5', reward: { gold: 500, renown: 80 } },
  { id: 'ach_chamber_explore', name: 'Chamber Explorer', emoji: '🗺️', description: 'Explore 4 different rift chambers.', condition: 'chamber_4', reward: { gold: 400, renown: 50 } },
  { id: 'ach_all_chambers', name: 'Rift Cartographer', emoji: '🌍', description: 'Explore all 8 rift chambers.', condition: 'chamber_8', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_rare_command', name: 'Rare Catch', emoji: '💎', description: 'Command a rare leviathan.', condition: 'rare_command', reward: { gold: 500, renown: 100 } },
  { id: 'ach_epic_command', name: 'Epic Discovery', emoji: '🌟', description: 'Command an epic leviathan.', condition: 'epic_command', reward: { gold: 1500, renown: 250 } },
  { id: 'ach_legendary_command', name: 'Legendary Commander', emoji: '👑', description: 'Command a legendary leviathan.', condition: 'legendary_command', reward: { gold: 5000, renown: 500 } },
  { id: 'ach_first_relic', name: 'Relic Diver', emoji: '🏺', description: 'Discover your first abyssal relic.', condition: 'relic_1', reward: { gold: 300, renown: 60 } },
  { id: 'ach_five_relics', name: 'Relic Hunter', emoji: '🔍', description: 'Collect 5 different relics.', condition: 'relic_5', reward: { gold: 1000, renown: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first rift event.', condition: 'event_1', reward: { gold: 200, renown: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 rift events.', condition: 'event_10', reward: { gold: 800, renown: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_all_zones', name: 'Zone Master', emoji: '🌈', description: 'Command at least one leviathan from each zone.', condition: 'all_zones', reward: { gold: 3000, renown: 300 } },
  { id: 'ach_max_title', name: 'Tidal Deity', emoji: '👑', description: 'Reach the title of Tidal Deity.', condition: 'max_title', reward: { gold: 10000, renown: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: TR_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const TR_TITLES: readonly TrTitleDef[] = [
  { id: 'title_tide_pooler', name: 'Tide Pooler', emoji: '🪸', minRenown: 0, minLeviathans: 0, description: 'A novice explorer who has just begun exploring the tidal pools.' },
  { id: 'title_depth_diver', name: 'Depth Diver', emoji: '🤿', minRenown: 50, minLeviathans: 3, description: 'A skilled diver who can command common deep-sea leviathans.' },
  { id: 'title_abyssal_scout', name: 'Abyssal Scout', emoji: '🔦', minRenown: 200, minLeviathans: 7, description: 'A scout who ventures into the abyss and returns with treasures.' },
  { id: 'title_rift_warden', name: 'Rift Warden', emoji: '🛡️', minRenown: 500, minLeviathans: 12, description: 'A guardian of the ocean rifts, trusted with rare leviathans.' },
  { id: 'title_trench_lord', name: 'Trench Lord', emoji: '⛓️', minRenown: 1200, minLeviathans: 18, description: 'A lord of the Great Trench who commands legions of deep leviathans.' },
  { id: 'title_vent_sovereign', name: 'Vent Sovereign', emoji: '🔥', minRenown: 2500, minLeviathans: 24, description: 'A sovereign of the hydrothermal vents. Fire and water obey.' },
  { id: 'title_leviathan_king', name: 'Leviathan King', emoji: '🐉', minRenown: 5000, minLeviathans: 30, description: 'A legendary king whose power is feared across every ocean zone.' },
  { id: 'title_tidal_deity', name: 'Tidal Deity', emoji: '👑', minRenown: 10000, minLeviathans: 35, description: 'The supreme Tidal Deity, master of all oceans and every leviathan.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: TR_RELICS — 15 Legendary Abyssal Relics
// ═══════════════════════════════════════════════════════════════════

export const TR_RELICS: readonly TrRelicDef[] = [
  { id: 'relic_glow_crown', name: 'Crown of Bioluminescence', emoji: '👑', rarity: 'epic', zone: 'twilight', biteBoost: 20, crushBoost: 15, speedBoost: 10, value: 2000, description: 'A crown made of living bioluminescent coral. It illuminates the deepest darkness.' },
  { id: 'relic_void_trident', name: 'Void Trident', emoji: '🔱', rarity: 'epic', zone: 'midnight', biteBoost: 35, crushBoost: 5, speedBoost: 5, value: 2200, description: 'A trident forged in the void zone. Its strikes create tears in reality.' },
  { id: 'relic_pearl_amulet', name: 'Abyssal Pearl Amulet', emoji: '📿', rarity: 'rare', zone: 'twilight', biteBoost: 10, crushBoost: 10, speedBoost: 15, value: 800, description: 'An amulet containing a perfect abyssal pearl. Grants hydrostatic grace.' },
  { id: 'relic_pressure_gauntlet', name: 'Pressure Gauntlet', emoji: '🧤', rarity: 'rare', zone: 'abyssal', biteBoost: 5, crushBoost: 20, speedBoost: 10, value: 750, description: 'A gauntlet that channels abyssal pressure into devastating punches.' },
  { id: 'relic_shadow_mask', name: 'Mask of the Deep', emoji: '🎭', rarity: 'epic', zone: 'midnight', biteBoost: 25, crushBoost: 20, speedBoost: 15, value: 2500, description: 'A mask carved from midnight-zone obsidian. Grants true darkvision.' },
  { id: 'relic_tidal_veil', name: 'Veil of the Tides', emoji: '🪶', rarity: 'epic', zone: 'whirlpool', biteBoost: 15, crushBoost: 15, speedBoost: 25, value: 2400, description: 'A shimmering veil of compressed tidal energy. Shields against all currents.' },
  { id: 'relic_vent_hammer', name: 'Volcanic Hammer', emoji: '🔨', rarity: 'epic', zone: 'vent', biteBoost: 20, crushBoost: 25, speedBoost: 10, value: 2600, description: 'A hammer forged in submarine volcanic fire. It smashes through anything.' },
  { id: 'relic_abyssal_eye', name: 'Eye of the Abyss', emoji: '👁️', rarity: 'legendary', zone: 'abyssal', biteBoost: 40, crushBoost: 30, speedBoost: 20, value: 8000, description: 'An eye from the oldest abyssal creature. It sees through water and stone.' },
  { id: 'relic_trench_blade', name: 'Trench Blade', emoji: '🗡️', rarity: 'legendary', zone: 'trench', biteBoost: 30, crushBoost: 40, speedBoost: 15, value: 7500, description: 'A blade forged from compressed trench metal. Cuts through water itself.' },
  { id: 'relic_nightmare_fang', name: 'Nightmare Fang', emoji: '🦷', rarity: 'legendary', zone: 'midnight', biteBoost: 60, crushBoost: 20, speedBoost: 20, value: 10000, description: 'A fang from the Nightmare of the Depths. It induces terror in all who see it.' },
  { id: 'relic_depth_chalice', name: 'Chalice of Depths', emoji: '🏆', rarity: 'legendary', zone: 'hadal', biteBoost: 25, crushBoost: 35, speedBoost: 30, value: 9000, description: 'A chalice that fills with water from any depth. Grants unlimited breath.' },
  { id: 'relic_storm_scepter', name: 'Storm Scepter', emoji: '⚜️', rarity: 'legendary', zone: 'whirlpool', biteBoost: 35, crushBoost: 35, speedBoost: 25, value: 9500, description: 'A scepter that commands whirlpools and tidal forces at will.' },
  { id: 'relic_hadal_scroll', name: 'Scroll of the Hadal', emoji: '📜', rarity: 'epic', zone: 'hadal', biteBoost: 20, crushBoost: 15, speedBoost: 30, value: 2300, description: 'A scroll that contains the deepest secrets of the ocean floor.' },
  { id: 'relic_eruption_gem', name: 'Gem of Eruption', emoji: '🔥', rarity: 'legendary', zone: 'vent', biteBoost: 50, crushBoost: 45, speedBoost: 25, value: 11000, description: 'A gem from the heart of an Eruption Titan. Channels volcanic fury.' },
  { id: 'relic_tidal_orb', name: 'Orb of Tides', emoji: '🔮', rarity: 'legendary', zone: 'whirlpool', biteBoost: 30, crushBoost: 30, speedBoost: 40, value: 12000, description: 'An ancient orb that contains the essence of every ocean current.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: TR_EVENTS — 12 Rift Events
// ═══════════════════════════════════════════════════════════════════

export const TR_EVENTS: readonly TrEventDef[] = [
  { id: 'evt_tidal_surge', name: 'Tidal Surge', emoji: '🌊', durationTurns: 5, effectType: 'buff', effectDescription: 'Twilight zone leviathans gain double power. All chambers accessible.', description: 'A massive tidal surge sweeps through the rifts, bringing nutrients and opportunity.' },
  { id: 'evt_abyssal_collapse', name: 'Abyssal Collapse', emoji: '🏚️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Swim speed reduced by 30%. Abyssal leviathans immune.', description: 'Part of the abyssal floor collapses, creating dangerous debris fields.' },
  { id: 'evt_bioluminescence_bloom', name: 'Bio Bloom', emoji: '✨', durationTurns: 4, effectType: 'special', effectDescription: 'Twilight leviathans gain +50 power. Rare materials appear.', description: 'A massive bloom of bioluminescent organisms transforms the twilight zone.' },
  { id: 'evt_midnight_eclipse', name: 'Midnight Eclipse', emoji: '🌑', durationTurns: 2, effectType: 'special', effectDescription: 'Midnight zone leviathans triple power. Twilight ones halved.', description: 'Even the faintest bioluminescence is extinguished. True darkness reigns.' },
  { id: 'evt_vent_eruption', name: 'Vent Eruption', emoji: '🌋', durationTurns: 3, effectType: 'debuff', effectDescription: 'Vent leviathans lose 25% power. Minerals scattered everywhere.', description: 'A chain of hydrothermal vents erupts simultaneously. Danger and riches.' },
  { id: 'evt_pearl_rain', name: 'Pearl Rain', emoji: '💎', durationTurns: 5, effectType: 'buff', effectDescription: 'Gold rewards doubled. All leviathans gain +30% vitality.', description: 'Millions of pearls rain from the rift walls. A rare bounty event.' },
  { id: 'evt_deep_current', name: 'Deep Current Shift', emoji: '💨', durationTurns: 4, effectType: 'buff', effectDescription: 'All leviathans gain +20% speed. Whirlpool zone enhanced.', description: 'The deep ocean currents shift, creating new pathways and opportunities.' },
  { id: 'evt_pressure_wave', name: 'Pressure Wave', emoji: '⚖️', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% gold. Relic discovery chance increased.', description: 'A massive pressure wave rocks the rift. Structures are damaged but secrets revealed.' },
  { id: 'evt_thermal_bloom', name: 'Thermal Bloom', emoji: '♨️', durationTurns: 3, effectType: 'buff', effectDescription: 'Vent leviathans resurrect once. All healing doubled.', description: 'A thermal bloom revitalizes all vent-zone life. Remarkable recovery.' },
  { id: 'evt_abyssal_drought', name: 'Nutrient Drought', emoji: '🏜️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Twilight zone leviathans weakened. Abyssal ones thrive.', description: 'Nutrients vanish from the upper zones. The deep becomes richer.' },
  { id: 'evt_rift_resonance', name: 'Rift Resonance', emoji: '🔔', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus renown per chamber exploration. Puzzle rewards doubled.', description: 'The rift walls vibrate with harmonic resonance, revealing hidden chambers.' },
  { id: 'evt_leviathan_migration', name: 'Great Leviathan Migration', emoji: '🐙', durationTurns: 6, effectType: 'buff', effectDescription: 'Command chance doubled. New leviathan species appear.', description: 'Thousands of leviathans migrate through the rifts. The perfect time to command.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const TR_MAX_LEVIATHAN_LEVEL = 50
const TR_MAX_STRUCTURE_LEVEL = 10
const TR_INITIAL_GOLD = 200
const TR_INITIAL_RENOWN = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function trXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function trCalcStats(species: TrLeviathanSpecies, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    bitePower: Math.floor(species.bitePower * growth),
    crushPower: Math.floor(species.crushPower * growth),
    swimSpeed: Math.floor(species.swimSpeed * growth),
  }
}

let _trIdCounter = 0
function trGenerateId(): string {
  _trIdCounter += 1
  return `tr_${_trIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function trFindSpecies(id: string): TrLeviathanSpecies | undefined {
  return TR_LEVIATHANS.find((s) => s.id === id)
}

function trFindChamber(id: string): TrChamberDef | undefined {
  return TR_CHAMBERS.find((z) => z.id === id)
}

function trFindMaterial(id: string): TrMaterialDef | undefined {
  return TR_MATERIALS.find((m) => m.id === id)
}

function trFindStructureDef(id: string): TrStructureDef | undefined {
  return TR_STRUCTURES.find((s) => s.id === id)
}

function trFindAbility(id: string): TrAbilityDef | undefined {
  return TR_ABILITIES.find((a) => a.id === id)
}

function trFindRelic(id: string): TrRelicDef | undefined {
  return TR_RELICS.find((r) => r.id === id)
}

function trFindAchievement(id: string): TrAchievementDef | undefined {
  return TR_ACHIEVEMENTS.find((a) => a.id === id)
}

function trFindTitle(id: TrTitleId): TrTitleDef | undefined {
  return TR_TITLES.find((t) => t.id === id)
}

function trRarityMultiplier(rarity: TrRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function trRarityColor(rarity: TrRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function trZoneColor(zone: TrOceanZone): string {
  switch (zone) {
    case 'twilight': return TR_BIO_CYAN
    case 'midnight': return TR_MIDNIGHT_INDIGO
    case 'abyssal': return TR_ABYSS_BLUE
    case 'hadal': return TR_TRENCH_PURPLE
    case 'trench': return TR_DEEP_GREEN
    case 'vent': return TR_VENT_ORANGE
    case 'whirlpool': return TR_WHIRLPOOL_TEAL
    default: return '#888888'
  }
}

export function trCheckSynergy(attacker: TrOceanZone, defender: TrOceanZone): number {
  const advantages = TR_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = TR_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function trCalcStructureUpgradeCost(def: TrStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function trCalcMaxTitle(renown: number, leviathanCount: number): TrTitleId {
  let bestId: TrTitleId = 'title_tide_pooler'
  for (const title of TR_TITLES) {
    if (renown >= title.minRenown && leviathanCount >= title.minLeviathans) {
      bestId = title.id
    }
  }
  return bestId
}

function trCheckAchievementCondition(
  condition: string,
  state: TrStoreState
): boolean {
  switch (condition) {
    case 'command_1':
      return state.totalCommanded >= 1
    case 'command_5':
      return state.totalCommanded >= 5
    case 'harvest_1':
      return state.totalHarvested >= 1
    case 'harvest_10':
      return state.totalHarvested >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'chamber_4':
      return state.chambers.length >= 4
    case 'chamber_8':
      return state.chambers.length >= 8
    case 'rare_command':
      return state.leviathans.some((l) => {
        const sp = trFindSpecies(l.speciesId)
        return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'epic_command':
      return state.leviathans.some((l) => {
        const sp = trFindSpecies(l.speciesId)
        return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'legendary_command':
      return state.leviathans.some((l) => {
        const sp = trFindSpecies(l.speciesId)
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
    case 'all_zones': {
      const zones = new Set<TrOceanZone>()
      for (const l of state.leviathans) {
        const sp = trFindSpecies(l.speciesId)
        if (sp) zones.add(sp.zone)
      }
      return zones.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_tidal_deity'
    default:
      return false
  }
}

function trPickRandomEvent(): TrEventDef {
  const idx = Math.floor(Math.random() * TR_EVENTS.length)
  return TR_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useTrStore = create<TrFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      leviathans: [] as TrLeviathanInstance[],
      chambers: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as TrStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_tide_pooler' as TrTitleId,
      gold: TR_INITIAL_GOLD,
      renown: TR_INITIAL_RENOWN,
      totalCommanded: 0,
      totalHarvested: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as TrEventDef | null,
      eventTurnsRemaining: 0,
      activeChamber: null as string | null,

      // ── trCommandLeviathan ─────────────────────────────────────
      trCommandLeviathan: (speciesId: string): boolean => {
        const species = trFindSpecies(speciesId)
        if (!species) return false
        const cost = Math.floor(50 * trRarityMultiplier(species.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = trCalcStats(species, 1)
        const newLeviathan: TrLeviathanInstance = {
          id: trGenerateId(),
          speciesId,
          name: species.name,
          level: 1,
          xp: 0,
          bitePower: stats.bitePower,
          crushPower: stats.crushPower,
          swimSpeed: stats.swimSpeed,
          vitality: 80,
          hunger: 70,
          commandedAt: Date.now(),
        }
        set((prev) => {
          const newRenown = prev.renown + trRarityMultiplier(species.rarity) * 5
          return {
            leviathans: [...prev.leviathans, newLeviathan],
            gold: prev.gold - cost,
            totalCommanded: prev.totalCommanded + 1,
            renown: newRenown,
            currentTitle: trCalcMaxTitle(newRenown, prev.leviathans.length + 1),
          }
        })
        return true
      },

      // ── trReleaseLeviathan ────────────────────────────────────
      trReleaseLeviathan: (leviathanId: string): boolean => {
        const state = get()
        const exists = state.leviathans.find((l) => l.id === leviathanId)
        if (!exists) return false
        const species = trFindSpecies(exists.speciesId)
        const refund = species ? Math.floor(25 * trRarityMultiplier(species.rarity)) : 10
        set((prev) => ({
          leviathans: prev.leviathans.filter((l) => l.id !== leviathanId),
          gold: prev.gold + refund,
          currentTitle: trCalcMaxTitle(prev.renown, prev.leviathans.length - 1),
        }))
        return true
      },

      // ── trFeedLeviathan ──────────────────────────────────────
      trFeedLeviathan: (leviathanId: string): boolean => {
        const feedCost = 10
        const state = get()
        if (state.gold < feedCost) return false
        set((prev) => {
          const leviathans = prev.leviathans.map((l) => {
            if (l.id !== leviathanId) return l
            const newXp = l.xp + 20
            const xpNeeded = trXpForLevel(l.level)
            let newLevel = l.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && l.level < TR_MAX_LEVIATHAN_LEVEL) {
              newLevel = l.level + 1
              currentXp = newXp - xpNeeded
            }
            const species = trFindSpecies(l.speciesId)
            const stats = species ? trCalcStats(species, newLevel) : { bitePower: l.bitePower, crushPower: l.crushPower, swimSpeed: l.swimSpeed }
            return {
              ...l,
              level: newLevel,
              xp: currentXp,
              bitePower: stats.bitePower,
              crushPower: stats.crushPower,
              swimSpeed: stats.swimSpeed,
              vitality: Math.min(100, l.vitality + 10),
              hunger: Math.min(100, l.hunger + 20),
            }
          })
          return { leviathans, gold: prev.gold - feedCost, renown: prev.renown + 2 }
        })
        return true
      },

      // ── trHarvestDepth ────────────────────────────────────────
      trHarvestDepth: (leviathanId: string): boolean => {
        const state = get()
        const leviathan = state.leviathans.find((l) => l.id === leviathanId)
        if (!leviathan) return false
        if (leviathan.hunger < 20) return false
        const species = trFindSpecies(leviathan.speciesId)
        if (!species) return false
        const materialId = `mat_${species.zone}_${species.rarity}_venom`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(leviathan.bitePower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalHarvested: prev.totalHarvested + 1,
          renown: prev.renown + 3,
          leviathans: prev.leviathans.map((l) =>
            l.id === leviathanId ? { ...l, hunger: Math.max(0, l.hunger - 20) } : l
          ),
        }))
        return true
      },

      // ── trBuildStructure ──────────────────────────────────────
      trBuildStructure: (structureDefId: string): boolean => {
        const def = trFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: TrStructureInstance = {
          id: trGenerateId(),
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

      // ── trUpgradeStructure ────────────────────────────────────
      trUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= TR_MAX_STRUCTURE_LEVEL) return false
        const def = trFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = trCalcStructureUpgradeCost(def, structure.level)
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

      // ── trExploreChamber ──────────────────────────────────────
      trExploreChamber: (chamberId: string): TrEventDef | null => {
        const chamber = trFindChamber(chamberId)
        if (!chamber) return null
        const state = get()
        const requiredTitleIdx = TR_TITLES.findIndex((t) => t.id === chamber.requiredTitle)
        const currentTitleIdx = TR_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newChambers = state.chambers.includes(chamberId) ? state.chambers : [...state.chambers, chamberId]
        const event = trPickRandomEvent()
        set((prev) => ({
          chambers: newChambers,
          activeChamber: chamberId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          renown: prev.renown + 5,
        }))
        return event
      },

      // ── trCollectRelic ────────────────────────────────────────
      trCollectRelic: (relicId: string): boolean => {
        const relic = trFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => {
          const newRenown = prev.renown + Math.floor(trRarityMultiplier(relic.rarity) * 20)
          return {
            relics: [...prev.relics, relicId],
            renown: newRenown,
            currentTitle: trCalcMaxTitle(newRenown, prev.leviathans.length),
          }
        })
        return true
      },

      // ── trUnlockAbility ───────────────────────────────────────
      trUnlockAbility: (abilityId: string): boolean => {
        const ability = trFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * trRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── trUnlockTitle ─────────────────────────────────────────
      trUnlockTitle: (titleId: TrTitleId): boolean => {
        const title = trFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.renown < title.minRenown) return false
        if (state.leviathans.length < title.minLeviathans) return false
        const currentIdx = TR_TITLES.findIndex((t) => t.id === state.currentTitle)
        const targetIdx = TR_TITLES.findIndex((t) => t.id === titleId)
        if (targetIdx <= currentIdx) return false
        set({ currentTitle: titleId })
        return true
      },

      // ── trClaimAchievement ────────────────────────────────────
      trClaimAchievement: (achievementId: string): boolean => {
        const achievement = trFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!trCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + achievement.reward.gold,
          renown: prev.renown + achievement.reward.renown,
        }))
        return true
      },

      // ── trTradeMaterial ──────────────────────────────────────
      trTradeMaterial: (materialId: string, count: number): number => {
        const mat = trFindMaterial(materialId)
        if (!mat) return 0
        const state = get()
        const holding = state.materials.find((m) => m.materialId === materialId)
        if (!holding || holding.count < count) return 0
        const goldEarned = Math.floor(mat.value * count * 0.8)
        set((prev) => ({
          materials: prev.materials.map((m) =>
            m.materialId === materialId ? { ...m, count: m.count - count } : m
          ).filter((m) => m.count > 0),
          gold: prev.gold + goldEarned,
        }))
        return goldEarned
      },

      // ── trEndEvent ────────────────────────────────────────────
      trEndEvent: (): void => {
        const state = get()
        if (!state.activeEvent) return
        set((prev) => ({
          eventTurnsRemaining: Math.max(0, prev.eventTurnsRemaining - 1),
          ...(prev.eventTurnsRemaining <= 1 ? { activeEvent: null, eventTurnsRemaining: 0 } : {}),
        }))
      },

      // ── trResetEvent ──────────────────────────────────────────
      trResetEvent: (): void => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },
    }),
    {
      name: 'tidal-rift-wire',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        leviathans: state.leviathans,
        chambers: state.chambers,
        materials: state.materials,
        structures: state.structures,
        abilities: state.abilities,
        achievements: state.achievements,
        relics: state.relics,
        currentTitle: state.currentTitle,
        gold: state.gold,
        renown: state.renown,
        totalCommanded: state.totalCommanded,
        totalHarvested: state.totalHarvested,
        totalBuilt: state.totalBuilt,
        totalEventsFaced: state.totalEventsFaced,
        activeEvent: state.activeEvent,
        eventTurnsRemaining: state.eventTurnsRemaining,
        activeChamber: state.activeChamber,
      }),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useTidalRift()
// ═══════════════════════════════════════════════════════════════════

export default function useTidalRift(): TrAPI {
  const store = useTrStore()

  // ── Computed: Leviathans with species data ─────────────────────
  const leviathansWithSpecies = useMemo(() => {
    return store.leviathans.map((l) => {
      const def = trFindSpecies(l.speciesId)
      return { ...l, def: def ?? null }
    })
  }, [store])

  // ── Computed: Structures with defs ────────────────────────────
  const structuresWithDefs = useMemo(() => {
    return store.structures.map((s) => {
      const def = trFindStructureDef(s.structureDefId)
      return { ...s, def: def ?? null }
    })
  }, [store])

  // ── Computed: Materials with defs ────────────────────────────
  const materialsWithDefs = useMemo(() => {
    return store.materials.map((m) => {
      const def = trFindMaterial(m.materialId)
      return { ...m, def: def ?? null }
    })
  }, [store])

  // ── Computed: Current title def ───────────────────────────────
  const currentTitleDef = useMemo(() => {
    return trFindTitle(store.currentTitle) ?? null
  }, [store])

  // ── Computed: Active event def ────────────────────────────────
  const activeEventDef = useMemo(() => {
    return store.activeEvent ?? null
  }, [store])

  // ── Computed: Claimable achievements ──────────────────────────
  const claimableAchievements = useMemo(() => {
    return TR_ACHIEVEMENTS.filter(
      (a) => !store.achievements.includes(a.id) && trCheckAchievementCondition(a.condition, store)
    )
  }, [store])

  // ── Computed: Total fleet power ───────────────────────────────
  const totalFleetPower = useMemo(() => {
    return store.leviathans.reduce((sum, l) => sum + l.bitePower + l.crushPower, 0)
  }, [store])

  // ── Computed: Average leviathan level ─────────────────────────
  const averageLevel = useMemo(() => {
    if (store.leviathans.length === 0) return 0
    return store.leviathans.reduce((sum, l) => sum + l.level, 0) / store.leviathans.length
  }, [store])

  // ── Computed: Rare+ leviathan count ───────────────────────────
  const rareLeviathanCount = useMemo(() => {
    return store.leviathans.filter((l) => {
      const sp = trFindSpecies(l.speciesId)
      return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
    }).length
  }, [store])

  // ── Computed: Zone distribution ───────────────────────────────
  const zoneDistribution = useMemo(() => {
    const dist: Record<string, number> = {}
    for (const zone of TR_ZONES) {
      dist[zone.id] = 0
    }
    for (const l of store.leviathans) {
      const sp = trFindSpecies(l.speciesId)
      if (sp) dist[sp.zone] = (dist[sp.zone] || 0) + 1
    }
    return dist
  }, [store])

  // ── Computed: Unlocked abilities with defs ────────────────────
  const unlockedAbilitiesWithDefs = useMemo(() => {
    return store.abilities
      .map((id) => {
        const def = trFindAbility(id)
        return def ?? null
      })
      .filter((a): a is TrAbilityDef => a !== null)
  }, [store])

  // ── Computed: Collected relics with defs ──────────────────────
  const collectedRelicsWithDefs = useMemo(() => {
    return store.relics
      .map((id) => {
        const def = trFindRelic(id)
        return def ?? null
      })
      .filter((r): r is TrRelicDef => r !== null)
  }, [store])

  // ── Computed: Next title progress ─────────────────────────────
  const nextTitleProgress = useMemo(() => {
    const currentIdx = TR_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= TR_TITLES.length - 1) {
      return { percent: 100, renownNeeded: 0, leviathansNeeded: 0 }
    }
    const next = TR_TITLES[currentIdx + 1]
    const renownProgress = Math.min(100, (store.renown / next.minRenown) * 100)
    const leviathanProgress = Math.min(100, (store.leviathans.length / next.minLeviathans) * 100)
    return {
      percent: Math.floor((renownProgress + leviathanProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - store.renown),
      leviathansNeeded: Math.max(0, next.minLeviathans - store.leviathans.length),
    }
  }, [store])

  // ── Computed: Total relic boosts ──────────────────────────────
  const totalRelicBoosts = useMemo(() => {
    let biteBoost = 0
    let crushBoost = 0
    let speedBoost = 0
    for (const relicId of store.relics) {
      const relic = trFindRelic(relicId)
      if (relic) {
        biteBoost += relic.biteBoost
        crushBoost += relic.crushBoost
        speedBoost += relic.speedBoost
      }
    }
    return { biteBoost, crushBoost, speedBoost }
  }, [store])

  // ── Computed: Unbuilt structures ──────────────────────────────
  const unbuiltStructures = useMemo(() => {
    const builtIds = new Set(store.structures.map((s) => s.structureDefId))
    return TR_STRUCTURES.filter((s) => !builtIds.has(s.id))
  }, [store])

  // ── Computed: Explored chambers with defs ─────────────────────
  const exploredChambersWithDefs = useMemo(() => {
    return store.chambers
      .map((id) => {
        const def = trFindChamber(id)
        return def ?? null
      })
      .filter((c): c is TrChamberDef => c !== null)
  }, [store])

  // ── Build the API object ──────────────────────────────────────
  const trAPI: TrAPI = useMemo(() => {
    return {
      // Constants
      TR_ZONES,
      TR_LEVIATHANS,
      TR_CHAMBERS,
      TR_MATERIALS,
      TR_STRUCTURES,
      TR_ABILITIES,
      TR_ACHIEVEMENTS,
      TR_TITLES,
      TR_RELICS,
      TR_EVENTS,
      TR_ABYSS_BLUE,
      TR_BIO_CYAN,
      TR_TRENCH_PURPLE,
      TR_VENT_ORANGE,
      TR_WHIRLPOOL_TEAL,
      TR_MIDNIGHT_INDIGO,
      TR_DEEP_GREEN,
      TR_PEARL_WHITE,

      // State
      leviathans: store.leviathans,
      chambers: store.chambers,
      materials: store.materials,
      structures: store.structures,
      abilities: store.abilities,
      achievements: store.achievements,
      relics: store.relics,
      currentTitle: store.currentTitle,
      gold: store.gold,
      renown: store.renown,
      totalCommanded: store.totalCommanded,
      totalHarvested: store.totalHarvested,
      totalBuilt: store.totalBuilt,
      totalEventsFaced: store.totalEventsFaced,
      activeEvent: store.activeEvent,
      eventTurnsRemaining: store.eventTurnsRemaining,
      activeChamber: store.activeChamber,

      // Actions
      trCommandLeviathan: store.trCommandLeviathan,
      trReleaseLeviathan: store.trReleaseLeviathan,
      trFeedLeviathan: store.trFeedLeviathan,
      trHarvestDepth: store.trHarvestDepth,
      trBuildStructure: store.trBuildStructure,
      trUpgradeStructure: store.trUpgradeStructure,
      trExploreChamber: store.trExploreChamber,
      trCollectRelic: store.trCollectRelic,
      trUnlockAbility: store.trUnlockAbility,
      trUnlockTitle: store.trUnlockTitle,
      trClaimAchievement: store.trClaimAchievement,
      trTradeMaterial: store.trTradeMaterial,
      trEndEvent: store.trEndEvent,
      trResetEvent: store.trResetEvent,

      // Computed
      leviathansWithSpecies,
      structuresWithDefs,
      materialsWithDefs,
      currentTitleDef,
      activeEventDef,
      claimableAchievements,
      totalFleetPower,
      averageLevel,
      rareLeviathanCount,
      zoneDistribution,
      unlockedAbilitiesWithDefs,
      collectedRelicsWithDefs,
      nextTitleProgress,
      totalRelicBoosts,
      unbuiltStructures,
      exploredChambersWithDefs,

      // Helpers (exported)
      trCheckSynergy,
      trRarityColor,
      trZoneColor,
      trRarityMultiplier,
    }
  }, [store, leviathansWithSpecies, structuresWithDefs, materialsWithDefs, currentTitleDef, activeEventDef, claimableAchievements, totalFleetPower, averageLevel, rareLeviathanCount, zoneDistribution, unlockedAbilitiesWithDefs, collectedRelicsWithDefs, nextTitleProgress, totalRelicBoosts, unbuiltStructures, exploredChambersWithDefs])

  return trAPI
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: API TYPE
// ═══════════════════════════════════════════════════════════════════

export interface TrAPI {
  // Constants
  readonly TR_ZONES: typeof TR_ZONES
  readonly TR_LEVIATHANS: typeof TR_LEVIATHANS
  readonly TR_CHAMBERS: typeof TR_CHAMBERS
  readonly TR_MATERIALS: typeof TR_MATERIALS
  readonly TR_STRUCTURES: typeof TR_STRUCTURES
  readonly TR_ABILITIES: typeof TR_ABILITIES
  readonly TR_ACHIEVEMENTS: typeof TR_ACHIEVEMENTS
  readonly TR_TITLES: typeof TR_TITLES
  readonly TR_RELICS: typeof TR_RELICS
  readonly TR_EVENTS: typeof TR_EVENTS
  readonly TR_ABYSS_BLUE: string
  readonly TR_BIO_CYAN: string
  readonly TR_TRENCH_PURPLE: string
  readonly TR_VENT_ORANGE: string
  readonly TR_WHIRLPOOL_TEAL: string
  readonly TR_MIDNIGHT_INDIGO: string
  readonly TR_DEEP_GREEN: string
  readonly TR_PEARL_WHITE: string

  // State
  readonly leviathans: TrLeviathanInstance[]
  readonly chambers: string[]
  readonly materials: { materialId: string; count: number }[]
  readonly structures: TrStructureInstance[]
  readonly abilities: string[]
  readonly achievements: string[]
  readonly relics: string[]
  readonly currentTitle: TrTitleId
  readonly gold: number
  readonly renown: number
  readonly totalCommanded: number
  readonly totalHarvested: number
  readonly totalBuilt: number
  readonly totalEventsFaced: number
  readonly activeEvent: TrEventDef | null
  readonly eventTurnsRemaining: number
  readonly activeChamber: string | null

  // Actions
  readonly trCommandLeviathan: (speciesId: string) => boolean
  readonly trReleaseLeviathan: (leviathanId: string) => boolean
  readonly trFeedLeviathan: (leviathanId: string) => boolean
  readonly trHarvestDepth: (leviathanId: string) => boolean
  readonly trBuildStructure: (structureDefId: string) => boolean
  readonly trUpgradeStructure: (structureId: string) => boolean
  readonly trExploreChamber: (chamberId: string) => TrEventDef | null
  readonly trCollectRelic: (relicId: string) => boolean
  readonly trUnlockAbility: (abilityId: string) => boolean
  readonly trUnlockTitle: (titleId: TrTitleId) => boolean
  readonly trClaimAchievement: (achievementId: string) => boolean
  readonly trTradeMaterial: (materialId: string, count: number) => number
  readonly trEndEvent: () => void
  readonly trResetEvent: () => void

  // Computed
  readonly leviathansWithSpecies: (TrLeviathanInstance & { def: TrLeviathanSpecies | null })[]
  readonly structuresWithDefs: (TrStructureInstance & { def: TrStructureDef | null })[]
  readonly materialsWithDefs: ({ materialId: string; count: number; def: TrMaterialDef | null })[]
  readonly currentTitleDef: TrTitleDef | null
  readonly activeEventDef: TrEventDef | null
  readonly claimableAchievements: TrAchievementDef[]
  readonly totalFleetPower: number
  readonly averageLevel: number
  readonly rareLeviathanCount: number
  readonly zoneDistribution: Record<string, number>
  readonly unlockedAbilitiesWithDefs: TrAbilityDef[]
  readonly collectedRelicsWithDefs: TrRelicDef[]
  readonly nextTitleProgress: { percent: number; renownNeeded: number; leviathansNeeded: number }
  readonly totalRelicBoosts: { biteBoost: number; crushBoost: number; speedBoost: number }
  readonly unbuiltStructures: TrStructureDef[]
  readonly exploredChambersWithDefs: TrChamberDef[]

  // Helpers
  readonly trCheckSynergy: (attacker: TrOceanZone, defender: TrOceanZone) => number
  readonly trRarityColor: (rarity: TrRarity) => string
  readonly trZoneColor: (zone: TrOceanZone) => string
  readonly trRarityMultiplier: (rarity: TrRarity) => number
}
