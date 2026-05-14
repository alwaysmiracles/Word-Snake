/**
 * Astral Nexus Wire — A cosmic space station hub mini-game
 *
 * Recruit 35 star navigators across 7 celestial paths, manage 8 nexus
 * stations, collect 30 cosmic/stellar materials, build 25 station
 * structures, unlock 22 astral abilities, discover 15 legendary cosmic
 * relics, face 12 space events, and ascend through 8 titles from Star
 * Cadet to Astral Deity — backed by a Zustand store with persist middleware.
 *
 * Storage key: astral-nexus-wire
 * Prefix: an / AN_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type AnCelestialPath =
  | 'solar'
  | 'lunar'
  | 'stellar'
  | 'galactic'
  | 'nebular'
  | 'void'
  | 'quasar'

export type AnRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type AnTitleId =
  | 'title_star_cadet'
  | 'title_pathfinder'
  | 'title_star_pilot'
  | 'title_nexus_commander'
  | 'title_celestial_captain'
  | 'title_cosmic_admiral'
  | 'title_void_sovereign'
  | 'title_astral_deity'

export interface AnPathDef {
  readonly id: AnCelestialPath
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface AnNavigatorDef {
  readonly id: string
  readonly name: string
  readonly path: AnCelestialPath
  readonly rarity: AnRarity
  readonly navigationPower: number
  readonly pilotingPower: number
  readonly astrogation: number
  readonly description: string
  readonly abilities: string[]
}

export interface AnNavigatorInstance {
  readonly id: string
  navigatorDefId: string
  name: string
  level: number
  readonly xp: number
  navigationPower: number
  pilotingPower: number
  astrogation: number
  morale: number
  focus: number
  recruitedAt: number
}

export interface AnStationDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly sector: number
  readonly threatLevel: number
  readonly requiredTitle: AnTitleId
  readonly path: AnCelestialPath
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface AnMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'cosmic_dust' | 'stellar_core' | 'nebula_gas' | 'dark_matter' | 'void_essence'
  readonly rarity: AnRarity
  readonly navBonus: number
  readonly pilotBonus: number
  readonly value: number
  readonly description: string
}

export interface AnStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'hangar_bay' | 'comms_array' | 'engineering_lab' | 'medical_wing' | 'relic_vault'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface AnStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface AnAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly path: AnCelestialPath
  readonly type: 'active' | 'passive'
  readonly rarity: AnRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface AnAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { stardust: number; prestige: number }
}

export interface AnTitleDef {
  readonly id: AnTitleId
  readonly name: string
  readonly emoji: string
  readonly minPrestige: number
  readonly minNavigators: number
  readonly description: string
}

export interface AnRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: AnRarity
  readonly path: AnCelestialPath
  readonly navBoost: number
  readonly pilotBoost: number
  readonly astroBoost: number
  readonly value: number
  readonly description: string
}

export interface AnEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface AnStoreState {
  navigators: AnNavigatorInstance[]
  stations: string[]
  materials: { materialId: string; count: number }[]
  structures: AnStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: AnTitleId
  stardust: number
  prestige: number
  totalRecruited: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: AnEventDef | null
  eventTurnsRemaining: number
  activeStation: string | null
}

export interface AnStoreActions {
  anRecruitNavigator: (navigatorDefId: string) => boolean
  anDismissNavigator: (navigatorId: string) => boolean
  anTrainNavigator: (navigatorId: string) => boolean
  anHarvestStardust: (navigatorId: string) => boolean
  anBuildStructure: (structureDefId: string) => boolean
  anUpgradeStructure: (structureId: string) => boolean
  anOperateStation: (stationId: string) => AnEventDef | null
  anCollectRelic: (relicId: string) => boolean
  anUnlockAbility: (abilityId: string) => boolean
  anUnlockTitle: (titleId: AnTitleId) => boolean
  anClaimAchievement: (achievementId: string) => boolean
  anTradeMaterial: (materialId: string, count: number) => number
  anEndEvent: () => void
  anResetEvent: () => void
}

export interface AnFullStore extends AnStoreState, AnStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const AN_COSMIC_PURPLE: string = '#7B2D8E'
export const AN_STELLAR_GOLD: string = '#FFD700'
export const AN_NEBULA_BLUE: string = '#1E90FF'
export const AN_SOLAR_ORANGE: string = '#FF6347'
export const AN_VOID_BLACK: string = '#0A0A1A'
export const AN_LUNAR_SILVER: string = '#C0C0C0'
export const AN_ASTRA_TEAL: string = '#20B2AA'
export const AN_QUASAR_WHITE: string = '#F0FFFF'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: PATH DEFINITIONS (7 celestial paths)
// ═══════════════════════════════════════════════════════════════════

export const AN_PATHS: readonly AnPathDef[] = [
  {
    id: 'solar',
    name: 'Solar',
    color: AN_SOLAR_ORANGE,
    description:
      'Navigators who harness the raw power of stars. Solar path masters command fire and light across the cosmos.',
  },
  {
    id: 'lunar',
    name: 'Lunar',
    color: AN_LUNAR_SILVER,
    description:
      'Navigators attuned to moonlight and gravitational tides. The lunar path rewards precision and foresight.',
  },
  {
    id: 'stellar',
    name: 'Stellar',
    color: AN_STELLAR_GOLD,
    description:
      'Navigators who ride the stellar winds between star systems. Stellar pilots are the fastest in the galaxy.',
  },
  {
    id: 'galactic',
    name: 'Galactic',
    color: AN_COSMIC_PURPLE,
    description:
      'Navigators who map the great galactic arms. Galactic path followers understand the structure of the universe.',
  },
  {
    id: 'nebular',
    name: 'Nebular',
    color: AN_NEBULA_BLUE,
    description:
      'Navigators who navigate through dense nebulae. Nebular masters can see through cosmic clouds and radiation.',
  },
  {
    id: 'void',
    name: 'Void',
    color: AN_VOID_BLACK,
    description:
      'Navigators who traverse the empty void between galaxies. Void walkers are fearless and transcend physical limits.',
  },
  {
    id: 'quasar',
    name: 'Quasar',
    color: AN_QUASAR_WHITE,
    description:
      'Navigators who channel the energy of quasars. Quasar masters wield the most powerful force in the known universe.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: PATH SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const AN_SYNERGY_MAP: Record<AnCelestialPath, AnCelestialPath[]> = {
  solar: ['nebular', 'quasar'],
  lunar: ['void', 'solar'],
  stellar: ['quasar', 'lunar'],
  galactic: ['nebular', 'stellar'],
  nebular: ['solar', 'galactic'],
  void: ['lunar', 'galactic'],
  quasar: ['stellar', 'void'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: AN_NAVIGATORS — 35 Star Navigators (5 per path)
// ═══════════════════════════════════════════════════════════════════

export const AN_NAVIGATORS: readonly AnNavigatorDef[] = [
  // ── Solar Navigators (5) ───────────────────────────────────────
  {
    id: 'solar_ember_recruit',
    name: 'Ember Recruit',
    path: 'solar',
    rarity: 'common',
    navigationPower: 12,
    pilotingPower: 8,
    astrogation: 18,
    description:
      'A fresh recruit who learned to navigate by tracking solar flares across the inner system.',
    abilities: ['solar_sense'],
  },

  {
    id: 'solar_flare_navigator',
    name: 'Flare Navigator',
    path: 'solar',
    rarity: 'uncommon',
    navigationPower: 8,
    pilotingPower: 35,
    astrogation: 15,
    description:
      'A daring navigator who rides solar flares to achieve incredible speeds between close systems.',
    abilities: ['solar_sense', 'flare_surf'],
  },

  {
    id: 'solar_chromosphere_elite',
    name: 'Chromosphere Elite',
    path: 'solar',
    rarity: 'rare',
    navigationPower: 55,
    pilotingPower: 45,
    astrogation: 30,
    description:
      'An elite navigator who has descended into the chromosphere of a star and returned transformed.',
    abilities: ['solar_sense', 'corona_shield', 'chromo_ignite'],
  },
  {
    id: 'solar_fusion_ace',
    name: 'Fusion Ace',
    path: 'solar',
    rarity: 'epic',
    navigationPower: 80,
    pilotingPower: 90,
    astrogation: 25,
    description:
      'A legendary ace who channels fusion reactions directly through their navigation console.',
    abilities: ['solar_sense', 'corona_shield', 'flare_surf', 'fusion_burst'],
  },
  {
    id: 'solar_singularity_avatar',
    name: 'Singularity Avatar',
    path: 'solar',
    rarity: 'legendary',
    navigationPower: 120,
    pilotingPower: 130,
    astrogation: 40,
    description:
      'The living embodiment of solar energy. They can ignite miniature stars to illuminate dark space.',
    abilities: ['solar_sense', 'corona_shield', 'flare_surf', 'fusion_burst', 'stellar_ignition'],
  },

  // ── Lunar Navigators (5) ───────────────────────────────────────
  {
    id: 'lunar_tide_cadet',
    name: 'Tide Cadet',
    path: 'lunar',
    rarity: 'common',
    navigationPower: 15,
    pilotingPower: 5,
    astrogation: 30,
    description:
      'A cadet who learned navigation by following the gravitational tides of moons.',
    abilities: ['tidal_pull'],
  },

  {
    id: 'lunar_crescent_pilot',
    name: 'Crescent Pilot',
    path: 'lunar',
    rarity: 'uncommon',
    navigationPower: 30,
    pilotingPower: 15,
    astrogation: 35,
    description:
      'A pilot whose maneuvers mirror the crescent moon phases, always turning at the perfect angle.',
    abilities: ['tidal_pull', 'crescent_turn'],
  },

  {
    id: 'lunar_harmony_master',
    name: 'Harmony Master',
    path: 'lunar',
    rarity: 'rare',
    navigationPower: 40,
    pilotingPower: 70,
    astrogation: 45,
    description:
      'A master who achieves perfect harmony between gravitational forces, piloting with zero effort.',
    abilities: ['tidal_pull', 'silver_glow', 'harmony_field'],
  },
  {
    id: 'lunar_full_moon_sovereign',
    name: 'Full Moon Sovereign',
    path: 'lunar',
    rarity: 'epic',
    navigationPower: 65,
    pilotingPower: 85,
    astrogation: 55,
    description:
      'A sovereign navigator whose power peaks during the full moon. They can move small moons.',
    abilities: ['tidal_pull', 'silver_glow', 'crescent_turn', 'full_moon_zenith'],
  },
  {
    id: 'lunar_abyssal_watcher',
    name: 'Abyssal Watcher',
    path: 'lunar',
    rarity: 'legendary',
    navigationPower: 100,
    pilotingPower: 110,
    astrogation: 45,
    description:
      'An ancient navigator who has watched over the lunar cycle for millennia. They command all tides.',
    abilities: ['tidal_pull', 'silver_glow', 'eclipse_cloak', 'full_moon_zenith', 'tidal_sovereignty'],
  },

  // ── Stellar Navigators (5) ─────────────────────────────────────
  {
    id: 'stellar_spark_recruit',
    name: 'Spark Recruit',
    path: 'stellar',
    rarity: 'common',
    navigationPower: 10,
    pilotingPower: 12,
    astrogation: 16,
    description:
      'A young navigator who follows stellar spark trails left by passing comets.',
    abilities: ['spark_trail'],
  },

  {
    id: 'stellar_wind_surfer',
    name: 'Wind Surfer',
    path: 'stellar',
    rarity: 'uncommon',
    navigationPower: 45,
    pilotingPower: 20,
    astrogation: 30,
    description:
      'A surfer of stellar winds who traverses between stars using only the pressure of light.',
    abilities: ['spark_trail', 'wind_surf'],
  },

  {
    id: 'stellar_supernova_elite',
    name: 'Supernova Elite',
    path: 'stellar',
    rarity: 'rare',
    navigationPower: 70,
    pilotingPower: 40,
    astrogation: 55,
    description:
      'An elite who has flown through the heart of a supernova remnant and survived.',
    abilities: ['spark_trail', 'beam_lock', 'nova_dodge', 'supernova_aura'],
  },
  {
    id: 'stellar_pulsar_rider',
    name: 'Pulsar Rider',
    path: 'stellar',
    rarity: 'epic',
    navigationPower: 90,
    pilotingPower: 80,
    astrogation: 60,
    description:
      'A rider of pulsar beams who can lock onto the rhythm of neutron stars for perfect navigation.',
    abilities: ['spark_trail', 'beam_lock', 'wind_surf', 'pulsar_sync'],
  },
  {
    id: 'stellar_hypernova_lord',
    name: 'Hypernova Lord',
    path: 'stellar',
    rarity: 'legendary',
    navigationPower: 130,
    pilotingPower: 120,
    astrogation: 50,
    description:
      'A lord of stellar cataclysms who can channel hypernova energy into their navigation systems.',
    abilities: ['spark_trail', 'beam_lock', 'nova_dodge', 'supernova_aura', 'hypernova_channel'],
  },

  // ── Galactic Navigators (5) ────────────────────────────────────
  {
    id: 'galactic_arm_scout',
    name: 'Arm Scout',
    path: 'galactic',
    rarity: 'common',
    navigationPower: 16,
    pilotingPower: 14,
    astrogation: 20,
    description:
      'A scout who maps the spiral arms of the galaxy, finding shortcuts through stellar nurseries.',
    abilities: ['arm_sense'],
  },

  {
    id: 'galactic_spine_runner',
    name: 'Spine Runner',
    path: 'galactic',
    rarity: 'uncommon',
    navigationPower: 35,
    pilotingPower: 25,
    astrogation: 40,
    description:
      'A runner who travels along the galactic spine, the dense star-filled center of the Milky Way.',
    abilities: ['arm_sense', 'spine_dash'],
  },

  {
    id: 'galactic_spiral_master',
    name: 'Spiral Master',
    path: 'galactic',
    rarity: 'rare',
    navigationPower: 60,
    pilotingPower: 40,
    astrogation: 70,
    description:
      'A master who understands the spiral pattern of the entire galaxy and can predict stellar drift.',
    abilities: ['arm_sense', 'core_vision', 'spine_dash', 'spiral_predict'],
  },
  {
    id: 'galactic_dark_matter_seer',
    name: 'Dark Matter Seer',
    path: 'galactic',
    rarity: 'epic',
    navigationPower: 85,
    pilotingPower: 55,
    astrogation: 90,
    description:
      'A seer who perceives the invisible dark matter filaments that structure the cosmos.',
    abilities: ['arm_sense', 'core_vision', 'halo_reach', 'dark_filament_sight'],
  },
  {
    id: 'galactic_great_attractor_herald',
    name: 'Great Attractor Herald',
    path: 'galactic',
    rarity: 'legendary',
    navigationPower: 110,
    pilotingPower: 95,
    astrogation: 140,
    description:
      'A herald who has glimpsed the Great Attractor and returned with knowledge of the universe\'s fate.',
    abilities: ['arm_sense', 'core_vision', 'spine_dash', 'dark_filament_sight', 'attractor_pull'],
  },

  // ── Nebular Navigators (5) ─────────────────────────────────────
  {
    id: 'nebular_mist_drifter',
    name: 'Mist Drifter',
    path: 'nebular',
    rarity: 'common',
    navigationPower: 14,
    pilotingPower: 18,
    astrogation: 12,
    description:
      'A drifter who navigates through the colorful mists of emission nebulae by feel.',
    abilities: ['mist_sense'],
  },

  {
    id: 'nebular_ion_cruiser',
    name: 'Ion Cruiser',
    path: 'nebular',
    rarity: 'uncommon',
    navigationPower: 28,
    pilotingPower: 35,
    astrogation: 25,
    description:
      'A cruiser who charges their ship\'s hull with ionized nebular gas for extra speed.',
    abilities: ['mist_sense', 'ion_charge'],
  },

  {
    id: 'nebular_pillars_guardian',
    name: 'Pillars Guardian',
    path: 'nebular',
    rarity: 'rare',
    navigationPower: 50,
    pilotingPower: 45,
    astrogation: 60,
    description:
      'A guardian of the Pillars of Creation who navigates where no sensor can penetrate.',
    abilities: ['mist_sense', 'cloud_part', 'ion_charge', 'pillar_guidance'],
  },
  {
    id: 'nebular_planetary_forge',
    name: 'Planetary Forge Pilot',
    path: 'nebular',
    rarity: 'epic',
    navigationPower: 75,
    pilotingPower: 70,
    astrogation: 65,
    description:
      'A pilot who navigates planetary nebulae where new worlds are being born from dying stars.',
    abilities: ['mist_sense', 'cloud_part', 'plasma_beacon', 'birth_sight'],
  },
  {
    id: 'nebular_cosmic_nursery_lord',
    name: 'Cosmic Nursery Lord',
    path: 'nebular',
    rarity: 'legendary',
    navigationPower: 105,
    pilotingPower: 100,
    astrogation: 120,
    description:
      'A lord of the cosmic nurseries who can navigate any nebula blindfolded, sensing every particle.',
    abilities: ['mist_sense', 'cloud_part', 'ion_charge', 'pillar_guidance', 'nebula_heart'],
  },

  // ── Void Navigators (5) ────────────────────────────────────────
  {
    id: 'void_shade_enlistee',
    name: 'Shade Enlistee',
    path: 'void',
    rarity: 'common',
    navigationPower: 16,
    pilotingPower: 12,
    astrogation: 20,
    description:
      'An enlistee trained to navigate the absolute darkness between star systems.',
    abilities: ['void_sight'],
  },

  {
    id: 'void_abyss_walker',
    name: 'Abyss Walker',
    path: 'void',
    rarity: 'uncommon',
    navigationPower: 35,
    pilotingPower: 18,
    astrogation: 42,
    description:
      'A walker of the intergalactic abyss who navigates by sensing the cosmic microwave background.',
    abilities: ['void_sight', 'abyss_echo'],
  },

  {
    id: 'void_entropy_weaver',
    name: 'Entropy Weaver',
    path: 'void',
    rarity: 'rare',
    navigationPower: 60,
    pilotingPower: 40,
    astrogation: 55,
    description:
      'A weaver who manipulates local entropy to ease navigation through the harshest void.',
    abilities: ['void_sight', 'silence_drive', 'abyss_echo', 'entropy_shift'],
  },
  {
    id: 'void_dimensional_phase',
    name: 'Dimensional Phase Captain',
    path: 'void',
    rarity: 'epic',
    navigationPower: 90,
    pilotingPower: 55,
    astrogation: 85,
    description:
      'A captain who can phase their ship partially into another dimension to bypass obstacles.',
    abilities: ['void_sight', 'null_state', 'abyss_echo', 'dimensional_phase'],
  },
  {
    id: 'void_omni_void_sovereign',
    name: 'Omni-Void Sovereign',
    path: 'void',
    rarity: 'legendary',
    navigationPower: 125,
    pilotingPower: 80,
    astrogation: 130,
    description:
      'A sovereign of the void who sees all paths through nothingness and can create corridors in empty space.',
    abilities: ['void_sight', 'silence_drive', 'null_state', 'dimensional_phase', 'void_corridor'],
  },

  // ── Quasar Navigators (5) ──────────────────────────────────────
  {
    id: 'quasar_glint_cadet',
    name: 'Glint Cadet',
    path: 'quasar',
    rarity: 'common',
    navigationPower: 10,
    pilotingPower: 22,
    astrogation: 15,
    description:
      'A cadet who navigates by the distant glint of quasar light across billions of light-years.',
    abilities: ['quasar_beacon'],
  },

  {
    id: 'quasar_jet_rider',
    name: 'Jet Rider',
    path: 'quasar',
    rarity: 'uncommon',
    navigationPower: 25,
    pilotingPower: 30,
    astrogation: 35,
    description:
      'A rider who surfs the relativistic jets emitted by active galactic nuclei.',
    abilities: ['quasar_beacon', 'jet_stream'],
  },

  {
    id: 'quasar_omega_herald',
    name: 'Omega Herald',
    path: 'quasar',
    rarity: 'rare',
    navigationPower: 55,
    pilotingPower: 50,
    astrogation: 65,
    description:
      'A herald who channels quasar energy into navigational precision across galactic distances.',
    abilities: ['quasar_beacon', 'radiance_aura', 'jet_stream', 'omega_resonance'],
  },
  {
    id: 'quasar_blazar_champion',
    name: 'Blazar Champion',
    path: 'quasar',
    rarity: 'epic',
    navigationPower: 80,
    pilotingPower: 75,
    astrogation: 95,
    description:
      'A champion who has tamed a blazar, the most energetic object in the observable universe.',
    abilities: ['quasar_beacon', 'jet_stream', 'accretion_spin', 'blazar_taming'],
  },
  {
    id: 'quasar_primordial_deity',
    name: 'Primordial Deity',
    path: 'quasar',
    rarity: 'legendary',
    navigationPower: 135,
    pilotingPower: 115,
    astrogation: 125,
    description:
      'A being who has merged with a primordial quasar. They are the brightest point in the cosmos.',
    abilities: ['quasar_beacon', 'radiance_aura', 'jet_stream', 'omega_resonance', 'primordial_light'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: AN_STATIONS — 8 Nexus Stations
// ═══════════════════════════════════════════════════════════════════

export const AN_STATIONS: readonly AnStationDef[] = [
  {
    id: 'station_sol_gateway',
    name: 'Sol Gateway',
    description:
      'The primary nexus station orbiting Sol. A bustling hub where navigators begin their cosmic journey.',
    sector: 0,
    threatLevel: 1,
    requiredTitle: 'title_star_cadet',
    path: 'solar',
    bgGradient: 'linear-gradient(180deg, #FF6347 0%, #7B2D8E 50%, #FFD700 100%)',
    ambientColor: AN_SOLAR_ORANGE,
  },
  {
    id: 'station_luna_harbor',
    name: 'Luna Harbor',
    description:
      'A lunar orbital station that serves as a refueling depot and navigator training center.',
    sector: 1,
    threatLevel: 2,
    requiredTitle: 'title_star_cadet',
    path: 'lunar',
    bgGradient: 'linear-gradient(180deg, #C0C0C0 0%, #20B2AA 50%, #1E90FF 100%)',
    ambientColor: AN_LUNAR_SILVER,
  },
  {
    id: 'station_alpha_centauri_nexus',
    name: 'Alpha Centauri Nexus',
    description:
      'The first interstellar nexus station. Navigators who reach it have proven their worth beyond the home system.',
    sector: 2,
    threatLevel: 3,
    requiredTitle: 'title_pathfinder',
    path: 'stellar',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #1E90FF 50%, #C0C0C0 100%)',
    ambientColor: AN_STELLAR_GOLD,
  },
  {
    id: 'station_orion_arm_outpost',
    name: 'Orion Arm Outpost',
    description:
      'An outpost deep within the Orion Arm. Pirate activity and asteroid fields make navigation treacherous.',
    sector: 3,
    threatLevel: 4,
    requiredTitle: 'title_star_pilot',
    path: 'galactic',
    bgGradient: 'linear-gradient(180deg, #7B2D8E 0%, #0A0A1A 50%, #FF6347 100%)',
    ambientColor: AN_COSMIC_PURPLE,
  },
  {
    id: 'station_eagle_nebula_hub',
    name: 'Eagle Nebula Hub',
    description:
      'A hub station inside the Eagle Nebula, surrounded by towering pillars of gas and newborn stars.',
    sector: 4,
    threatLevel: 5,
    requiredTitle: 'title_nexus_commander',
    path: 'nebular',
    bgGradient: 'linear-gradient(180deg, #1E90FF 0%, #7B2D8E 50%, #FFD700 100%)',
    ambientColor: AN_NEBULA_BLUE,
  },
  {
    id: 'station_void_reach_terminal',
    name: 'Void Reach Terminal',
    description:
      'A terminal station at the edge of known space. Beyond it lies only the vast intergalactic void.',
    sector: 5,
    threatLevel: 6,
    requiredTitle: 'title_celestial_captain',
    path: 'void',
    bgGradient: 'linear-gradient(180deg, #0A0A1A 0%, #7B2D8E 50%, #F0FFFF 100%)',
    ambientColor: AN_VOID_BLACK,
  },
  {
    id: 'station_andromeda_bridge',
    name: 'Andromeda Bridge',
    description:
      'A bridge station in the Andromeda collision zone. The most dangerous posting in the local group.',
    sector: 6,
    threatLevel: 7,
    requiredTitle: 'title_cosmic_admiral',
    path: 'quasar',
    bgGradient: 'linear-gradient(180deg, #F0FFFF 0%, #0A0A1A 50%, #1E90FF 100%)',
    ambientColor: AN_QUASAR_WHITE,
  },
  {
    id: 'station_cosmic_origin',
    name: 'Cosmic Origin',
    description:
      'The mythical station at the center of the observable universe. Only Astral Deities can reach it.',
    sector: 7,
    threatLevel: 8,
    requiredTitle: 'title_void_sovereign',
    path: 'quasar',
    bgGradient: 'linear-gradient(180deg, #F0FFFF 0%, #FFD700 50%, #7B2D8E 100%)',
    ambientColor: AN_QUASAR_WHITE,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: AN_MATERIALS — 30 Cosmic/Stellar Materials
// ═══════════════════════════════════════════════════════════════════

export const AN_MATERIALS: readonly AnMaterialDef[] = [
  // Common (8)
  { id: 'mat_solar_dust', name: 'Solar Dust', emoji: '✨', type: 'cosmic_dust', rarity: 'common', navBonus: 2, pilotBonus: 1, value: 10, description: 'Fine particles of stellar matter shed by a dying star.' },
  { id: 'mat_moon_shard', name: 'Moon Shard', emoji: '🌙', type: 'cosmic_dust', rarity: 'common', navBonus: 1, pilotBonus: 3, value: 12, description: 'A crystalline shard from a shattered moon surface.' },
  { id: 'mat_star_scrap', name: 'Star Scrap', emoji: '⭐', type: 'stellar_core', rarity: 'common', navBonus: 3, pilotBonus: 2, value: 15, description: 'Metallic debris from a stellar core fragment.' },
  { id: 'mat_nebula_mist_vial', name: 'Nebula Mist Vial', emoji: '💧', type: 'nebula_gas', rarity: 'common', navBonus: 2, pilotBonus: 4, value: 14, description: 'A vial of compressed nebula gas, swirling with color.' },
  { id: 'mat_asteroid_ore', name: 'Asteroid Ore', emoji: '🪨', type: 'stellar_core', rarity: 'common', navBonus: 4, pilotBonus: 1, value: 8, description: 'Raw ore mined from a metallic asteroid.' },
  { id: 'mat_comet_ice', name: 'Comet Ice', emoji: '❄️', type: 'nebula_gas', rarity: 'common', navBonus: 1, pilotBonus: 5, value: 16, description: 'Pristine ice from a comet nucleus, containing primordial water.' },
  { id: 'mat_plasma_sample', name: 'Plasma Sample', emoji: '🔶', type: 'stellar_core', rarity: 'common', navBonus: 5, pilotBonus: 2, value: 18, description: 'A contained sample of stellar plasma, still radiating heat.' },
  { id: 'mat_cosmic_ray_fragment', name: 'Cosmic Ray Fragment', emoji: '⚡', type: 'cosmic_dust', rarity: 'common', navBonus: 3, pilotBonus: 3, value: 11, description: 'A condensed fragment of a cosmic ray burst.' },

  // Uncommon (7)
  { id: 'mat_solar_corona_glass', name: 'Corona Glass', emoji: '🔮', type: 'stellar_core', rarity: 'uncommon', navBonus: 8, pilotBonus: 5, value: 75, description: 'Glass formed from rapidly cooled solar corona plasma. Remarkably durable.' },
  { id: 'mat_lunar_regolith_gem', name: 'Regolith Gem', emoji: '💎', type: 'cosmic_dust', rarity: 'uncommon', navBonus: 5, pilotBonus: 10, value: 80, description: 'A gem that formed under extreme lunar tidal pressures.' },
  { id: 'mat_stellar_wind_crystal', name: 'Stellar Wind Crystal', emoji: '💠', type: 'nebula_gas', rarity: 'uncommon', navBonus: 10, pilotBonus: 6, value: 85, description: 'A crystal grown in the high-velocity winds between binary stars.' },
  { id: 'mat_dark_nebula_resin', name: 'Dark Nebula Resin', emoji: '🫧', type: 'nebula_gas', rarity: 'uncommon', navBonus: 7, pilotBonus: 12, value: 90, description: 'Resin harvested from a dark nebula. Absorbs all light that touches it.' },
  { id: 'mat_pulsar_magnetite', name: 'Pulsar Magnetite', emoji: '🧲', type: 'stellar_core', rarity: 'uncommon', navBonus: 12, pilotBonus: 8, value: 95, description: 'Highly magnetized ore from near a pulsar. Interacts with navigation systems.' },
  { id: 'mat_void_echo_stone', name: 'Void Echo Stone', emoji: '🪨', type: 'dark_matter', rarity: 'uncommon', navBonus: 6, pilotBonus: 15, value: 100, description: 'A stone that emits faint echoes of the void it was found in.' },
  { id: 'mat_quasar_lens_shard', name: 'Quasar Lens Shard', emoji: '🔭', type: 'cosmic_dust', rarity: 'uncommon', navBonus: 14, pilotBonus: 7, value: 110, description: 'A shard that acts as a gravitational lens, bending light from quasars.' },

  // Rare (6)
  { id: 'mat_supernova_core', name: 'Supernova Core Fragment', emoji: '💥', type: 'stellar_core', rarity: 'rare', navBonus: 20, pilotBonus: 15, value: 350, description: 'A fragment of a supernova core, still emitting immense energy.' },
  { id: 'mat_nebula_heart_crystal', name: 'Nebula Heart Crystal', emoji: '❤️‍🔥', type: 'nebula_gas', rarity: 'rare', navBonus: 15, pilotBonus: 25, value: 380, description: 'A crystal from the dense heart of an emission nebula. Vibrates with life.' },
  { id: 'mat_dark_matter_shard', name: 'Dark Matter Shard', emoji: '🌑', type: 'dark_matter', rarity: 'rare', navBonus: 25, pilotBonus: 20, value: 400, description: 'A visible shard of dark matter, held stable by unknown forces.' },
  { id: 'mat_black_hole_accretion', name: 'Black Hole Accretion Gem', emoji: '🕳️', type: 'stellar_core', rarity: 'rare', navBonus: 30, pilotBonus: 18, value: 420, description: 'A gem formed from superheated accretion disk material near a black hole.' },
  { id: 'mat_void_essence_droplet', name: 'Void Essence Droplet', emoji: '🫗', type: 'void_essence', rarity: 'rare', navBonus: 18, pilotBonus: 30, value: 390, description: 'Liquid essence of pure void, somehow stable in atmospheric conditions.' },
  { id: 'mat_lunar_singularity_seed', name: 'Singularity Seed', emoji: '🌱', type: 'void_essence', rarity: 'rare', navBonus: 22, pilotBonus: 22, value: 370, description: 'A microscopic singularity suspended in a containment field. Infinite potential.' },

  // Epic (5)
  { id: 'mat_galactic_core_heart', name: 'Galactic Core Heart', emoji: '💫', type: 'void_essence', rarity: 'epic', navBonus: 35, pilotBonus: 30, value: 1500, description: 'The crystallized heart of the galactic core. It pulses with the rhythm of the galaxy.' },
  { id: 'mat_pulsar_perfect_magnet', name: 'Perfect Magnet', emoji: '🧲', type: 'stellar_core', rarity: 'epic', navBonus: 30, pilotBonus: 40, value: 1600, description: 'A perfectly structured magnet from a millisecond pulsar. Defies known physics.' },
  { id: 'mat_nebula_birth_catalyst', name: 'Birth Catalyst', emoji: '🌟', type: 'nebula_gas', rarity: 'epic', navBonus: 25, pilotBonus: 35, value: 1700, description: 'A catalyst that accelerates star formation within nebulae.' },
  { id: 'mat_void_singularity_core', name: 'Stable Singularity Core', emoji: '⚫', type: 'dark_matter', rarity: 'epic', navBonus: 40, pilotBonus: 28, value: 1800, description: 'A stabilized singularity core. It warps space-time around it.' },
  { id: 'mat_quasar_radiance_essence', name: 'Quasar Radiance Essence', emoji: '🔆', type: 'void_essence', rarity: 'epic', navBonus: 32, pilotBonus: 38, value: 1650, description: 'Distilled radiance from the brightest quasar ever observed.' },

  // Legendary (4)
  { id: 'mat_cosmic_infinity_pearl', name: 'Infinity Pearl', emoji: '🫧', type: 'void_essence', rarity: 'legendary', navBonus: 50, pilotBonus: 50, value: 8000, description: 'A pearl that contains a pocket of infinite space. One of seven in existence.' },
  { id: 'mat_primordial_fire', name: 'Primordial Fire Essence', emoji: '🔥', type: 'stellar_core', rarity: 'legendary', navBonus: 60, pilotBonus: 40, value: 9000, description: 'Essence of the first fire that ignited after the Big Bang. Inextinguishable.' },
  { id: 'mat_dark_flow_shard', name: 'Dark Flow Shard', emoji: '🌀', type: 'dark_matter', rarity: 'legendary', navBonus: 45, pilotBonus: 55, value: 10000, description: 'A shard of the mysterious dark flow that pulls galaxies toward the unknown.' },
  { id: 'mat_multiverse_key', name: 'Multiverse Key Fragment', emoji: '🔑', type: 'void_essence', rarity: 'legendary', navBonus: 40, pilotBonus: 60, value: 12000, description: 'A fragment that could unlock passage to parallel universes if all seven are assembled.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: AN_STRUCTURES — 25 Station Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const AN_STRUCTURES: readonly AnStructureDef[] = [
  // ── Hangar Bays (7) ────────────────────────────────────────────
  { id: 'str_solar_hangar', name: 'Solar Hangar Bay', emoji: '🚀', category: 'hangar_bay', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A hangar bay powered by solar panels for housing solar-path navigators.' },
  { id: 'str_lunar_dock', name: 'Lunar Dry Dock', emoji: '🌙', category: 'hangar_bay', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A dry dock illuminated by moonlight where lunar navigators refurbish their ships.' },
  { id: 'str_stellar_garage', name: 'Stellar Motor Garage', emoji: '⭐', category: 'hangar_bay', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'A garage optimized for stellar-wind-powered vessel maintenance.' },
  { id: 'str_galactic_hub', name: 'Galactic Hub Hangar', emoji: '🌀', category: 'hangar_bay', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'A massive hangar that serves as the central hub for galactic path navigators.' },
  { id: 'str_nebula_shelter', name: 'Nebula Shelter Bay', emoji: '🌫️', category: 'hangar_bay', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A sheltered bay protected from nebular radiation by advanced shielding.' },
  { id: 'str_void_anchor', name: 'Void Anchor Dock', emoji: '⚓', category: 'hangar_bay', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A dock anchored in void space by dark matter tethers. Essential for void navigators.' },
  { id: 'str_quasar_beacon_tower', name: 'Quasar Beacon Tower', emoji: '🗼', category: 'hangar_bay', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'A tower housing a quasar beacon that guides navigators across immense distances.' },

  // ── Comms Arrays (6) ───────────────────────────────────────────
  { id: 'str_basic_antenna', name: 'Basic Comm Antenna', emoji: '📡', category: 'comms_array', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A standard antenna for short-range communication between nearby stations.' },
  { id: 'str_hyper_relay', name: 'Hyper Relay Array', emoji: '📶', category: 'comms_array', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A hyper-frequency relay that enables instant communication across a sector.' },
  { id: 'str_tachyon_transceiver', name: 'Tachyon Transceiver', emoji: '📡', category: 'comms_array', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A tachyon-based transceiver that sends messages backward in time by microseconds.' },
  { id: 'str_entanglement_hub', name: 'Entanglement Hub', emoji: '🔗', category: 'comms_array', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'A quantum entanglement hub enabling truly instantaneous communication anywhere.' },
  { id: 'str_galactic_internet_node', name: 'Galactic Internet Node', emoji: '🌐', category: 'comms_array', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A node in the galactic information network. Grants access to universal knowledge.' },
  { id: 'str_cosmic_whisper_array', name: 'Cosmic Whisper Array', emoji: '🛸', category: 'comms_array', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'An array that picks up the cosmic microwave background whispers of the Big Bang.' },

  // ── Engineering Labs (5) ───────────────────────────────────────
  { id: 'str_basic_workshop', name: 'Basic Workshop', emoji: '🔧', category: 'engineering_lab', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A simple workshop for basic ship repairs and material refinement.' },
  { id: 'str_nanoforge', name: 'Nanoforge', emoji: '⚗️', category: 'engineering_lab', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'A molecular nanoforge that can assemble materials atom by atom.' },
  { id: 'str_dark_forge', name: 'Dark Matter Forge', emoji: '🔨', category: 'engineering_lab', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A forge that manipulates dark matter to create impossibly strong materials.' },
  { id: 'str_singularity_press', name: 'Singularity Press', emoji: '⚙️', category: 'engineering_lab', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A press that uses micro-singularity gravity to compress materials beyond normal limits.' },
  { id: 'str_cosmic_lattice_foundry', name: 'Cosmic Lattice Foundry', emoji: '🏭', category: 'engineering_lab', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate foundry. Can forge materials using the lattice structure of spacetime itself.' },

  // ── Medical Wings (4) ──────────────────────────────────────────
  { id: 'str_med_bay', name: 'Medical Bay', emoji: '🏥', category: 'medical_wing', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A medical bay that treats navigator fatigue and restores morale.' },
  { id: 'str_genetic_clinic', name: 'Genetic Enhancement Clinic', emoji: '🧬', category: 'medical_wing', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'A clinic that enhances navigator abilities through genetic optimization.' },
  { id: 'str_nanite_infirmary', name: 'Nanite Infirmary', emoji: '🤖', category: 'medical_wing', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'An infirmary using medical nanites for instant healing and cellular repair.' },
  { id: 'str_resurrection_chamber', name: 'Resurrection Chamber', emoji: '🏛️', category: 'medical_wing', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'A legendary chamber that can reconstruct a navigator from pure energy patterns.' },

  // ── Relic Vaults (3) ───────────────────────────────────────────
  { id: 'str_relic_case', name: 'Relic Display Case', emoji: '🖼️', category: 'relic_vault', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A sealed case for displaying cosmic relics and amplifying their passive effects.' },
  { id: 'str_sacred_vault', name: 'Sacred Relic Vault', emoji: '🔒', category: 'relic_vault', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A vacuum-sealed vault that preserves and amplifies the power of stored relics.' },
  { id: 'str_cosmic_sanctum', name: 'Cosmic Sanctum', emoji: '✨', category: 'relic_vault', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'A sanctum outside normal spacetime where relics can merge and evolve.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: AN_ABILITIES — 22 Astral Abilities
// ═══════════════════════════════════════════════════════════════════

export const AN_ABILITIES: readonly AnAbilityDef[] = [
  { id: 'ab_solar_flare', name: 'Solar Flare', emoji: '☀️', path: 'solar', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Unleash a burst of solar energy that temporarily blinds hostile sensors.' },
  { id: 'ab_lunar_tide', name: 'Lunar Tide', emoji: '🌙', path: 'lunar', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Generate a gravitational tide that pushes threats away from the station.' },
  { id: 'ab_stellar_drift', name: 'Stellar Drift', emoji: '💫', path: 'stellar', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 10, description: 'Enter a stellar drift state, becoming nearly undetectable for a short time.' },
  { id: 'ab_galactic_scan', name: 'Galactic Scan', emoji: '🔭', path: 'galactic', type: 'active', rarity: 'common', energyCost: 12, cooldown: 90, power: 5, description: 'Scan an entire sector of the galaxy, revealing hidden objects and paths.' },
  { id: 'ab_nebula_cloud', name: 'Nebula Cloud', emoji: '🌫️', path: 'nebular', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Deploy a cloud of nebular gas that obscures vision and damages electronics.' },
  { id: 'ab_void_step', name: 'Void Step', emoji: '🕳️', path: 'void', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 10, description: 'Step partially into the void, phasing through solid obstacles.' },
  { id: 'ab_quasar_beam', name: 'Quasar Beam', emoji: '🔆', path: 'quasar', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 18, description: 'Fire a concentrated beam of quasar energy that cuts through anything.' },
  { id: 'ab_corona_shield', name: 'Corona Shield', emoji: '🛡️', path: 'solar', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Project a shield of solar corona energy that absorbs incoming damage.' },
  { id: 'ab_eclipse_cloak', name: 'Eclipse Cloak', emoji: '🌑', path: 'lunar', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 90, power: 35, description: 'Create an eclipse effect that cloaks the entire station from detection.' },
  { id: 'ab_nova_burst', name: 'Nova Burst', emoji: '💥', path: 'stellar', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Trigger a localized nova burst that obliterates nearby threats.' },
  { id: 'ab_dark_filament', name: 'Dark Filament', emoji: '🕸️', path: 'galactic', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 100, power: 32, description: 'Weave dark matter filaments that trap and immobilize hostile vessels.' },
  { id: 'ab_mist_walk', name: 'Mist Walk', emoji: '👤', path: 'nebular', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 25, description: 'Move freely through nebular mist, gaining speed and evasion bonuses.' },
  { id: 'ab_entropy_collapse', name: 'Entropy Collapse', emoji: '🌀', path: 'void', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 55, power: 30, description: 'Collapse local entropy, causing nearby systems to temporarily fail.' },
  { id: 'ab_omega_resonance', name: 'Omega Resonance', emoji: '📶', path: 'quasar', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 60, power: 28, description: 'Resonate with the omega frequency, boosting all station systems.' },
  { id: 'ab_fusion_burst', name: 'Fusion Burst', emoji: '☢️', path: 'solar', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Channel fusion energy into a devastating burst that devastates a wide area.' },
  { id: 'ab_tidal_sovereignty', name: 'Tidal Sovereignty', emoji: '🌊', path: 'lunar', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Command all gravitational tides in the sector, reshaping orbital paths.' },
  { id: 'ab_hypernova_channel', name: 'Hypernova Channel', emoji: '🌠', path: 'stellar', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 110, power: 45, description: 'Channel hypernova energy for a massive speed and power boost across all navigators.' },
  { id: 'ab_void_corridor', name: 'Void Corridor', emoji: '🚪', path: 'void', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Automatically detects and maps void corridors for faster interstation travel.' },
  { id: 'ab_pillar_guidance', name: 'Pillar Guidance', emoji: '🏛️', path: 'nebular', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 120, power: 40, description: 'Summon the Pillars of Creation as navigational beacons across the nebula.' },
  { id: 'ab_dark_filament_sight', name: 'Dark Filament Sight', emoji: '👁️', path: 'galactic', type: 'active', rarity: 'rare', energyCost: 40, cooldown: 180, power: 60, description: 'See all dark matter structures in the galaxy, revealing hidden routes and threats.' },
  { id: 'ab_attractor_pull', name: 'Attractor Pull', emoji: '🧲', path: 'galactic', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Tap into the Great Attractor to pull all resources and navigators toward the station.' },
  { id: 'ab_primordial_light', name: 'Primordial Light', emoji: '🌟', path: 'quasar', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'Unleash the primordial light of creation. All enemies are obliterated. All allies are restored.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: AN_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const AN_ACHIEVEMENTS: readonly AnAchievementDef[] = [
  { id: 'ach_first_recruit', name: 'First Recruit', emoji: '🚀', description: 'Recruit your first star navigator.', condition: 'recruit_1', reward: { stardust: 50, prestige: 10 } },
  { id: 'ach_five_navigators', name: 'Squad Leader', emoji: '👥', description: 'Recruit 5 different navigators.', condition: 'recruit_5', reward: { stardust: 200, prestige: 40 } },
  { id: 'ach_first_harvest', name: 'Dust Collector', emoji: '✨', description: 'Harvest stardust for the first time.', condition: 'harvest_1', reward: { stardust: 80, prestige: 15 } },
  { id: 'ach_ten_harvests', name: 'Master Harvester', emoji: '⛏️', description: 'Harvest stardust 10 times.', condition: 'harvest_10', reward: { stardust: 300, prestige: 60 } },
  { id: 'ach_first_build', name: 'Station Builder', emoji: '🏗️', description: 'Build your first station structure.', condition: 'build_1', reward: { stardust: 100, prestige: 20 } },
  { id: 'ach_five_builds', name: 'Station Architect', emoji: '🏙️', description: 'Build 5 different station structures.', condition: 'build_5', reward: { stardust: 500, prestige: 80 } },
  { id: 'ach_station_explore', name: 'Sector Explorer', emoji: '🗺️', description: 'Operate at 4 different nexus stations.', condition: 'station_4', reward: { stardust: 400, prestige: 50 } },
  { id: 'ach_all_stations', name: 'Galactic Cartographer', emoji: '🌍', description: 'Operate at all 8 nexus stations.', condition: 'station_8', reward: { stardust: 2000, prestige: 200 } },
  { id: 'ach_rare_recruit', name: 'Rare Find', emoji: '💎', description: 'Recruit a rare navigator.', condition: 'rare_recruit', reward: { stardust: 500, prestige: 100 } },
  { id: 'ach_epic_recruit', name: 'Epic Discovery', emoji: '🌟', description: 'Recruit an epic navigator.', condition: 'epic_recruit', reward: { stardust: 1500, prestige: 250 } },
  { id: 'ach_legendary_recruit', name: 'Legendary Commander', emoji: '👑', description: 'Recruit a legendary navigator.', condition: 'legendary_recruit', reward: { stardust: 5000, prestige: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first cosmic relic.', condition: 'relic_1', reward: { stardust: 300, prestige: 60 } },
  { id: 'ach_five_relics', name: 'Relic Hunter', emoji: '🔍', description: 'Collect 5 different relics.', condition: 'relic_5', reward: { stardust: 1000, prestige: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first space event.', condition: 'event_1', reward: { stardust: 200, prestige: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 space events.', condition: 'event_10', reward: { stardust: 800, prestige: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Engineer', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { stardust: 2000, prestige: 200 } },
  { id: 'ach_all_paths', name: 'Path Master', emoji: '🌈', description: 'Recruit at least one navigator from each celestial path.', condition: 'all_paths', reward: { stardust: 3000, prestige: 300 } },
  { id: 'ach_max_title', name: 'Astral Deity', emoji: '👑', description: 'Reach the title of Astral Deity.', condition: 'max_title', reward: { stardust: 10000, prestige: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: AN_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const AN_TITLES: readonly AnTitleDef[] = [
  { id: 'title_star_cadet', name: 'Star Cadet', emoji: '⭐', minPrestige: 0, minNavigators: 0, description: 'A novice who has just begun their journey among the stars.' },
  { id: 'title_pathfinder', name: 'Pathfinder', emoji: '🧭', minPrestige: 50, minNavigators: 3, description: 'A capable pathfinder who can navigate between nearby star systems.' },
  { id: 'title_star_pilot', name: 'Star Pilot', emoji: '✈️', minPrestige: 200, minNavigators: 7, description: 'A skilled pilot who can thread through asteroid fields at full speed.' },
  { id: 'title_nexus_commander', name: 'Nexus Commander', emoji: '🎮', minPrestige: 500, minNavigators: 12, description: 'A commander who oversees operations at nexus stations across multiple sectors.' },
  { id: 'title_celestial_captain', name: 'Celestial Captain', emoji: '⭐', minPrestige: 1200, minNavigators: 18, description: 'A captain trusted with the rarest navigators and the most dangerous missions.' },
  { id: 'title_cosmic_admiral', name: 'Cosmic Admiral', emoji: '🌌', minPrestige: 2500, minNavigators: 24, description: 'An admiral commanding fleets across the galaxy, respected by all paths.' },
  { id: 'title_void_sovereign', name: 'Void Sovereign', emoji: '🕳️', minPrestige: 5000, minNavigators: 30, description: 'A sovereign who commands the void itself. Their word shapes galactic policy.' },
  { id: 'title_astral_deity', name: 'Astral Deity', emoji: '👑', minPrestige: 10000, minNavigators: 35, description: 'The supreme Astral Deity. Master of all celestial paths and all of known space.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: AN_RELICS — 15 Legendary Cosmic Relics
// ═══════════════════════════════════════════════════════════════════

export const AN_RELICS: readonly AnRelicDef[] = [
  { id: 'relic_solar_crown', name: 'Solar Crown', emoji: '👑', rarity: 'epic', path: 'solar', navBoost: 20, pilotBoost: 15, astroBoost: 10, value: 2000, description: 'A crown forged in the heart of a yellow star. It radiates warmth and authority.' },
  { id: 'relic_lunar_lens', name: 'Lunar Magnifying Lens', emoji: '🔭', rarity: 'epic', path: 'lunar', navBoost: 15, pilotBoost: 20, astroBoost: 25, value: 2200, description: 'A lens ground from perfect lunar crystal. It reveals hidden paths in space.' },
  { id: 'relic_stellar_compass', name: 'Stellar Compass', emoji: '🧭', rarity: 'rare', path: 'stellar', navBoost: 10, pilotBoost: 10, astroBoost: 30, value: 800, description: 'A compass that always points toward the nearest habitable star system.' },
  { id: 'relic_galactic_map', name: 'Galactic Map Fragment', emoji: '🗺️', rarity: 'rare', path: 'galactic', navBoost: 25, pilotBoost: 15, astroBoost: 15, value: 750, description: 'A fragment of the complete galactic map. It slowly reveals more detail over time.' },
  { id: 'relic_nebula_core', name: 'Nebula Heart Core', emoji: '❤️', rarity: 'epic', path: 'nebular', navBoost: 25, pilotBoost: 20, astroBoost: 15, value: 2500, description: 'The crystallized heart of a nebula. It pulses with the energy of newborn stars.' },
  { id: 'relic_void_mask', name: 'Void Walker Mask', emoji: '🎭', rarity: 'epic', path: 'void', navBoost: 15, pilotBoost: 15, astroBoost: 25, value: 2400, description: 'A mask that allows the wearer to perceive and traverse void dimensions.' },
  { id: 'relic_quasar_prism', name: 'Quasar Prism', emoji: '🔺', rarity: 'epic', path: 'quasar', navBoost: 20, pilotBoost: 25, astroBoost: 10, value: 2600, description: 'A prism that splits quasar light into navigable frequency bands.' },
  { id: 'relic_sun_stone', name: 'Sun Stone', emoji: '☀️', rarity: 'legendary', path: 'solar', navBoost: 40, pilotBoost: 30, astroBoost: 20, value: 8000, description: 'A stone containing a miniature star. It provides infinite solar energy.' },
  { id: 'relic_moon_scepter', name: 'Moon Scepter', emoji: '🌙', rarity: 'legendary', path: 'lunar', navBoost: 30, pilotBoost: 40, astroBoost: 15, value: 7500, description: 'A scepter that controls the gravitational pull of all nearby moons.' },
  { id: 'relic_nova_core', name: 'Nova Core Shard', emoji: '💥', rarity: 'legendary', path: 'stellar', navBoost: 60, pilotBoost: 20, astroBoost: 20, value: 10000, description: 'A shard from a nova core. It periodically releases devastating energy bursts.' },
  { id: 'relic_galactic_eye', name: 'Galactic Eye', emoji: '👁️', rarity: 'legendary', path: 'galactic', navBoost: 25, pilotBoost: 35, astroBoost: 30, value: 9000, description: 'An eye that sees the entire galaxy at once. Nothing remains hidden.' },
  { id: 'relic_nebula_cloak', name: 'Nebula Cloak', emoji: '🧥', rarity: 'legendary', path: 'nebular', navBoost: 35, pilotBoost: 35, astroBoost: 25, value: 9500, description: 'A cloak woven from nebular gas. The wearer is completely undetectable.' },
  { id: 'relic_void_key', name: 'Void Master Key', emoji: '🗝️', rarity: 'legendary', path: 'void', navBoost: 20, pilotBoost: 20, astroBoost: 50, value: 11000, description: 'A key that opens passages through void space to any known location.' },
  { id: 'relic_quasar_core', name: 'Quasar Core', emoji: '💎', rarity: 'legendary', path: 'quasar', navBoost: 30, pilotBoost: 30, astroBoost: 40, value: 12000, description: 'The core of an ancient quasar. It powers an entire nexus station by itself.' },
  { id: 'relic_cosmic_egg', name: 'Cosmic Egg', emoji: '🥚', rarity: 'legendary', path: 'solar', navBoost: 25, pilotBoost: 25, astroBoost: 45, value: 13000, description: 'An egg that contains a nascent universe. If hatched, it could create a new reality.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: AN_EVENTS — 12 Space Events
// ═══════════════════════════════════════════════════════════════════

export const AN_EVENTS: readonly AnEventDef[] = [
  { id: 'evt_solar_storm', name: 'Solar Storm', emoji: '🌊', durationTurns: 5, effectType: 'buff', effectDescription: 'Solar navigator power doubled. All stations accessible.', description: 'A massive solar storm engulfs the system, supercharging solar-powered systems.' },
  { id: 'evt_gravity_wave', name: 'Gravity Wave Cascade', emoji: '🌊', durationTurns: 3, effectType: 'debuff', effectDescription: 'Astrogation reduced by 30%. Lunar navigators immune.', description: 'Gravitational waves distort spacetime, making precise navigation nearly impossible.' },
  { id: 'evt_nebula_eruption', name: 'Nebula Eruption', emoji: '🌋', durationTurns: 4, effectType: 'special', effectDescription: 'Nebular navigators gain +50 power. Rare materials appear.', description: 'A nearby nebula erupts, releasing vast clouds of energized gas and rare isotopes.' },
  { id: 'evt_black_hole_transit', name: 'Black Hole Transit', emoji: '🕳️', durationTurns: 2, effectType: 'special', effectDescription: 'Void navigators triple power. Stellar navigators halved.', description: 'A black hole passes through the sector. Void navigators thrive in its warped gravity.' },
  { id: 'evt_pirate_raid', name: 'Pirate Raid', emoji: '🏴‍☠️', durationTurns: 3, effectType: 'debuff', effectDescription: 'Stardust income reduced by 25%. Defeating pirates yields relics.', description: 'A fleet of space pirates raids the station. Defend or lose resources.' },
  { id: 'evt_cosmic_alignment', name: 'Cosmic Alignment', emoji: '⭐', durationTurns: 5, effectType: 'buff', effectDescription: 'All stardust rewards doubled. Galactic navigators enhanced.', description: 'The stars align in a rare cosmic configuration. Luck and power surge through the nexus.' },
  { id: 'evt_quasar_flare', name: 'Quasar Flare', emoji: '💡', durationTurns: 4, effectType: 'buff', effectDescription: 'All navigators gain +20% morale. Quasar navigators enhanced.', description: 'A distant quasar emits a massive flare that bathes the galaxy in enhanced radiation.' },
  { id: 'evt_alien_signal', name: 'Alien Signal', emoji: '📡', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% stardust. Relic discovery chance greatly increased.', description: 'An alien signal is detected! Investigating it costs resources but may yield great rewards.' },
  { id: 'evt_wormhole_opening', name: 'Wormhole Opening', emoji: '🌀', durationTurns: 3, effectType: 'buff', effectDescription: 'Travel between stations costs nothing. New navigators appear.', description: 'A stable wormhole opens near the station, connecting to distant sectors of space.' },
  { id: 'evt_dark_matter_surge', name: 'Dark Matter Surge', emoji: '🌑', durationTurns: 5, effectType: 'debuff', effectDescription: 'Galactic power halved. Void navigators thrive.', description: 'A surge of dark matter disrupts normal space. Only void navigators can navigate safely.' },
  { id: 'evt_star_birth', name: 'Star Birth Event', emoji: '🌟', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus prestige for station operations. Material yields doubled.', description: 'A new star is born in a nearby nebula. The energy wave brings abundant resources.' },
  { id: 'evt_dimensional_rift', name: 'Dimensional Rift', emoji: '🚪', durationTurns: 6, effectType: 'buff', effectDescription: 'Recruitment chance doubled. Legendary navigator sighting possible.', description: 'A rift in spacetime allows navigators from parallel dimensions to cross over.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const AN_MAX_NAVIGATOR_LEVEL = 50
const AN_MAX_STRUCTURE_LEVEL = 10
const AN_INITIAL_STARDUST = 200
const AN_INITIAL_PRESTIGE = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function anXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function anCalcStats(navDef: AnNavigatorDef, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    navigationPower: Math.floor(navDef.navigationPower * growth),
    pilotingPower: Math.floor(navDef.pilotingPower * growth),
    astrogation: Math.floor(navDef.astrogation * growth),
  }
}

let _anIdCounter = 0
function anGenerateId(): string {
  _anIdCounter += 1
  return `an_${_anIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function anFindNavigatorDef(id: string): AnNavigatorDef | undefined {
  return AN_NAVIGATORS.find((n) => n.id === id)
}

function anFindStation(id: string): AnStationDef | undefined {
  return AN_STATIONS.find((s) => s.id === id)
}

function anFindMaterial(id: string): AnMaterialDef | undefined {
  return AN_MATERIALS.find((m) => m.id === id)
}

function anFindStructureDef(id: string): AnStructureDef | undefined {
  return AN_STRUCTURES.find((s) => s.id === id)
}

function anFindAbility(id: string): AnAbilityDef | undefined {
  return AN_ABILITIES.find((a) => a.id === id)
}

function anFindRelic(id: string): AnRelicDef | undefined {
  return AN_RELICS.find((r) => r.id === id)
}

function anFindAchievement(id: string): AnAchievementDef | undefined {
  return AN_ACHIEVEMENTS.find((a) => a.id === id)
}

function anFindTitle(id: AnTitleId): AnTitleDef | undefined {
  return AN_TITLES.find((t) => t.id === id)
}

function anRarityMultiplier(rarity: AnRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function anRarityColor(rarity: AnRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function anPathColor(path: AnCelestialPath): string {
  switch (path) {
    case 'solar': return AN_SOLAR_ORANGE
    case 'lunar': return AN_LUNAR_SILVER
    case 'stellar': return AN_STELLAR_GOLD
    case 'galactic': return AN_COSMIC_PURPLE
    case 'nebular': return AN_NEBULA_BLUE
    case 'void': return AN_VOID_BLACK
    case 'quasar': return AN_QUASAR_WHITE
    default: return '#888888'
  }
}

export function anCheckSynergy(attacker: AnCelestialPath, defender: AnCelestialPath): number {
  const advantages = AN_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = AN_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function anCalcStructureUpgradeCost(def: AnStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function anCalcMaxTitle(prestige: number, navigatorCount: number): AnTitleId {
  let bestId: AnTitleId = 'title_star_cadet'
  for (const title of AN_TITLES) {
    if (prestige >= title.minPrestige && navigatorCount >= title.minNavigators) {
      bestId = title.id
    }
  }
  return bestId
}

function anCheckAchievementCondition(
  condition: string,
  state: AnStoreState
): boolean {
  switch (condition) {
    case 'recruit_1':
      return state.totalRecruited >= 1
    case 'recruit_5':
      return state.totalRecruited >= 5
    case 'harvest_1':
      return state.totalHarvested >= 1
    case 'harvest_10':
      return state.totalHarvested >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'station_4':
      return state.stations.length >= 4
    case 'station_8':
      return state.stations.length >= 8
    case 'rare_recruit':
      return state.navigators.some((n) => {
        const def = anFindNavigatorDef(n.navigatorDefId)
        return def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'epic_recruit':
      return state.navigators.some((n) => {
        const def = anFindNavigatorDef(n.navigatorDefId)
        return def && (def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'legendary_recruit':
      return state.navigators.some((n) => {
        const def = anFindNavigatorDef(n.navigatorDefId)
        return def && def.rarity === 'legendary'
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
    case 'all_paths': {
      const paths = new Set<AnCelestialPath>()
      for (const n of state.navigators) {
        const def = anFindNavigatorDef(n.navigatorDefId)
        if (def) paths.add(def.path)
      }
      return paths.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_astral_deity'
    default:
      return false
  }
}

function anPickRandomEvent(): AnEventDef {
  const idx = Math.floor(Math.random() * AN_EVENTS.length)
  return AN_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useANStore = create<AnFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      navigators: [] as AnNavigatorInstance[],
      stations: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as AnStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_star_cadet' as AnTitleId,
      stardust: AN_INITIAL_STARDUST,
      prestige: AN_INITIAL_PRESTIGE,
      totalRecruited: 0,
      totalHarvested: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as AnEventDef | null,
      eventTurnsRemaining: 0,
      activeStation: null as string | null,

      // ── anRecruitNavigator ─────────────────────────────────────
      anRecruitNavigator: (navigatorDefId: string): boolean => {
        const navDef = anFindNavigatorDef(navigatorDefId)
        if (!navDef) return false
        const cost = Math.floor(50 * anRarityMultiplier(navDef.rarity))
        const state = get()
        if (state.stardust < cost) return false
        const stats = anCalcStats(navDef, 1)
        const newNavigator: AnNavigatorInstance = {
          id: anGenerateId(),
          navigatorDefId,
          name: navDef.name,
          level: 1,
          xp: 0,
          navigationPower: stats.navigationPower,
          pilotingPower: stats.pilotingPower,
          astrogation: stats.astrogation,
          morale: 80,
          focus: 70,
          recruitedAt: Date.now(),
        }
        set((prev) => {
          const updated = {
            navigators: [...prev.navigators, newNavigator],
            stardust: prev.stardust - cost,
            totalRecruited: prev.totalRecruited + 1,
            prestige: prev.prestige + anRarityMultiplier(navDef.rarity) * 5,
            currentTitle: anCalcMaxTitle(
              prev.prestige + anRarityMultiplier(navDef.rarity) * 5,
              prev.navigators.length + 1
            ),
          }
          return updated
        })
        return true
      },

      // ── anDismissNavigator ─────────────────────────────────────
      anDismissNavigator: (navigatorId: string): boolean => {
        const state = get()
        const exists = state.navigators.find((n) => n.id === navigatorId)
        if (!exists) return false
        const navDef = anFindNavigatorDef(exists.navigatorDefId)
        const refund = navDef ? Math.floor(25 * anRarityMultiplier(navDef.rarity)) : 10
        set((prev) => ({
          navigators: prev.navigators.filter((n) => n.id !== navigatorId),
          stardust: prev.stardust + refund,
          currentTitle: anCalcMaxTitle(prev.prestige, prev.navigators.length - 1),
        }))
        return true
      },

      // ── anTrainNavigator ────────────────────────────────────────
      anTrainNavigator: (navigatorId: string): boolean => {
        const trainCost = 10
        const state = get()
        if (state.stardust < trainCost) return false
        set((prev) => {
          const navigators = prev.navigators.map((n) => {
            if (n.id !== navigatorId) return n
            const newXp = n.xp + 20
            const xpNeeded = anXpForLevel(n.level)
            let newLevel = n.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && n.level < AN_MAX_NAVIGATOR_LEVEL) {
              newLevel = n.level + 1
              currentXp = newXp - xpNeeded
            }
            const navDef = anFindNavigatorDef(n.navigatorDefId)
            const stats = navDef ? anCalcStats(navDef, newLevel) : { navigationPower: n.navigationPower, pilotingPower: n.pilotingPower, astrogation: n.astrogation }
            return {
              ...n,
              level: newLevel,
              xp: currentXp,
              navigationPower: stats.navigationPower,
              pilotingPower: stats.pilotingPower,
              astrogation: stats.astrogation,
              morale: Math.min(100, n.morale + 10),
              focus: Math.min(100, n.focus + 20),
            }
          })
          return { navigators, stardust: prev.stardust - trainCost, prestige: prev.prestige + 2 }
        })
        return true
      },

      // ── anHarvestStardust ──────────────────────────────────────
      anHarvestStardust: (navigatorId: string): boolean => {
        const state = get()
        const navigator = state.navigators.find((n) => n.id === navigatorId)
        if (!navigator) return false
        if (navigator.focus < 20) return false
        const navDef = anFindNavigatorDef(navigator.navigatorDefId)
        if (!navDef) return false
        const materialId = `mat_${navDef.path}_harvest`
        const fallbackMatId = 'mat_solar_dust'
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(navigator.astrogation / 10)
        const targetId = anFindMaterial(materialId) ? materialId : fallbackMatId
        const existingTarget = state.materials.find((m) => m.materialId === targetId)
        set((prev) => ({
          materials: existingTarget
            ? prev.materials.map((m) => (m.materialId === targetId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId: targetId, count: amount }],
          totalHarvested: prev.totalHarvested + 1,
          prestige: prev.prestige + 3,
          navigators: prev.navigators.map((n) =>
            n.id === navigatorId ? { ...n, focus: Math.max(0, n.focus - 20) } : n
          ),
        }))
        return true
      },

      // ── anBuildStructure ───────────────────────────────────────
      anBuildStructure: (structureDefId: string): boolean => {
        const def = anFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.stardust < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: AnStructureInstance = {
          id: anGenerateId(),
          structureDefId,
          level: 1,
          builtAt: Date.now(),
        }
        set((prev) => ({
          structures: [...prev.structures, newStructure],
          stardust: prev.stardust - def.baseCost,
          totalBuilt: prev.totalBuilt + 1,
          prestige: prev.prestige + 10,
        }))
        return true
      },

      // ── anUpgradeStructure ─────────────────────────────────────
      anUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= AN_MAX_STRUCTURE_LEVEL) return false
        const def = anFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = anCalcStructureUpgradeCost(def, structure.level)
        if (state.stardust < cost) return false
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === structureId ? { ...s, level: s.level + 1 } : s
          ),
          stardust: prev.stardust - cost,
          prestige: prev.prestige + Math.floor(def.effectPerLevel * 2),
        }))
        return true
      },

      // ── anOperateStation ────────────────────────────────────────
      anOperateStation: (stationId: string): AnEventDef | null => {
        const station = anFindStation(stationId)
        if (!station) return null
        const state = get()
        const requiredTitleIdx = AN_TITLES.findIndex((t) => t.id === station.requiredTitle)
        const currentTitleIdx = AN_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newStations = state.stations.includes(stationId) ? state.stations : [...state.stations, stationId]
        const event = anPickRandomEvent()
        set((prev) => ({
          stations: newStations,
          activeStation: stationId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          prestige: prev.prestige + 5,
        }))
        return event
      },

      // ── anCollectRelic ──────────────────────────────────────────
      anCollectRelic: (relicId: string): boolean => {
        const relic = anFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => ({
          relics: [...prev.relics, relicId],
          prestige: prev.prestige + Math.floor(anRarityMultiplier(relic.rarity) * 20),
          currentTitle: anCalcMaxTitle(
            prev.prestige + Math.floor(anRarityMultiplier(relic.rarity) * 20),
            prev.navigators.length
          ),
        }))
        return true
      },

      // ── anUnlockAbility ────────────────────────────────────────
      anUnlockAbility: (abilityId: string): boolean => {
        const ability = anFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * anRarityMultiplier(ability.rarity))
        if (state.stardust < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          stardust: prev.stardust - cost,
        }))
        return true
      },

      // ── anUnlockTitle ──────────────────────────────────────────
      anUnlockTitle: (titleId: AnTitleId): boolean => {
        const title = anFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.prestige < title.minPrestige) return false
        if (state.navigators.length < title.minNavigators) return false
        set((prev) => ({
          currentTitle: titleId,
        }))
        return true
      },

      // ── anClaimAchievement ──────────────────────────────────────
      anClaimAchievement: (achievementId: string): boolean => {
        const achievement = anFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!anCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          stardust: prev.stardust + achievement.reward.stardust,
          prestige: prev.prestige + achievement.reward.prestige,
        }))
        return true
      },

      // ── anTradeMaterial ────────────────────────────────────────
      anTradeMaterial: (materialId: string, count: number): number => {
        const matDef = anFindMaterial(materialId)
        if (!matDef) return 0
        const state = get()
        const held = state.materials.find((m) => m.materialId === materialId)
        if (!held || held.count < count) return 0
        const earned = matDef.value * count
        set((prev) => ({
          materials: prev.materials.map((m) =>
            m.materialId === materialId ? { ...m, count: m.count - count } : m
          ).filter((m) => m.count > 0),
          stardust: prev.stardust + earned,
        }))
        return earned
      },

      // ── anEndEvent ─────────────────────────────────────────────
      anEndEvent: () => {
        set((prev) => ({
          activeEvent: null,
          eventTurnsRemaining: 0,
        }))
      },

      // ── anResetEvent ───────────────────────────────────────────
      anResetEvent: () => {
        const event = anPickRandomEvent()
        set((prev) => ({
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
        }))
      },
    }),
    {
      name: 'astral-nexus-wire',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        navigators: state.navigators,
        stations: state.stations,
        materials: state.materials,
        structures: state.structures,
        abilities: state.abilities,
        achievements: state.achievements,
        relics: state.relics,
        currentTitle: state.currentTitle,
        stardust: state.stardust,
        prestige: state.prestige,
        totalRecruited: state.totalRecruited,
        totalHarvested: state.totalHarvested,
        totalBuilt: state.totalBuilt,
        totalEventsFaced: state.totalEventsFaced,
        activeEvent: state.activeEvent,
        eventTurnsRemaining: state.eventTurnsRemaining,
        activeStation: state.activeStation,
      }),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: HOOK — useAstralNexus (default export)
// ═══════════════════════════════════════════════════════════════════

export default function useAstralNexus() {
  const store = useANStore()

  // ═════════════════════════════════════════════════════════════
  // useMemo getters — all depend on [store] only
  // ═════════════════════════════════════════════════════════════

  const anOwnedNavigators = useMemo(() => {
    return store.navigators.map((n) => {
      const def = anFindNavigatorDef(n.navigatorDefId)
      return { ...n, def: def ?? null }
    })
  }, [store])

  const anAvailableNavigatorDefs = useMemo(() => {
    const ownedIds = new Set(store.navigators.map((n) => n.navigatorDefId))
    return AN_NAVIGATORS.filter((d) => !ownedIds.has(d.id))
  }, [store])

  const anCurrentTitleDetail = useMemo(() => {
    return anFindTitle(store.currentTitle) ?? null
  }, [store])

  const anNextTitle = useMemo(() => {
    const currentIdx = AN_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx < AN_TITLES.length - 1) return AN_TITLES[currentIdx + 1] ?? null
    return null
  }, [store])

  const anActiveStationDetail = useMemo(() => {
    if (!store.activeStation) return null
    return anFindStation(store.activeStation) ?? null
  }, [store])

  const anUnoperatedStations = useMemo(() => {
    const operatedSet = new Set(store.stations)
    return AN_STATIONS.filter((s) => !operatedSet.has(s.id))
  }, [store])

  const anBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = anFindStructureDef(s.structureDefId)
      return { ...s, def: def ?? null }
    })
  }, [store])

  const anUnlockableAbilities = useMemo(() => {
    const ownedIds = new Set(store.abilities)
    return AN_ABILITIES.filter((a) => !ownedIds.has(a.id))
  }, [store])

  const anOwnedRelics = useMemo(() => {
    return store.relics.map((rId) => anFindRelic(rId)).filter((r): r is AnRelicDef => r !== undefined)
  }, [store])

  const anUnclaimedAchievements = useMemo(() => {
    const claimedSet = new Set(store.achievements)
    return AN_ACHIEVEMENTS.filter(
      (a) => !claimedSet.has(a.id) && anCheckAchievementCondition(a.condition, store)
    )
  }, [store])

  const anInventoryMaterials = useMemo(() => {
    return store.materials
      .map((m) => {
        const def = anFindMaterial(m.materialId)
        return { ...m, def: def ?? null }
      })
      .filter((m) => m.count > 0)
  }, [store])

  const anTotalStructureEffect = useMemo(() => {
    let total = 0
    for (const s of store.structures) {
      const def = anFindStructureDef(s.structureDefId)
      if (def) {
        total += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return total
  }, [store])

  const anAverageNavigatorLevel = useMemo(() => {
    if (store.navigators.length === 0) return 0
    const sum = store.navigators.reduce((acc, n) => acc + n.level, 0)
    return Math.floor(sum / store.navigators.length)
  }, [store])

  const anTotalNavigatorPower = useMemo(() => {
    let nav = 0
    let pilot = 0
    let astro = 0
    for (const n of store.navigators) {
      nav += n.navigationPower
      pilot += n.pilotingPower
      astro += n.astrogation
    }
    return { navigationPower: nav, pilotingPower: pilot, astrogation: astro, total: nav + pilot + astro }
  }, [store])

  const anPathDistribution = useMemo(() => {
    const dist: Record<string, number> = {}
    for (const path of AN_PATHS) {
      dist[path.id] = 0
    }
    for (const n of store.navigators) {
      const def = anFindNavigatorDef(n.navigatorDefId)
      if (def) dist[def.path] = (dist[def.path] ?? 0) + 1
    }
    return dist
  }, [store])

  const anRarityDistribution = useMemo(() => {
    const dist: Record<string, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 }
    for (const n of store.navigators) {
      const def = anFindNavigatorDef(n.navigatorDefId)
      if (def) dist[def.rarity] = (dist[def.rarity] ?? 0) + 1
    }
    return dist
  }, [store])

  const anNavigatorsByRarity = useMemo(() => {
    const grouped: Record<string, AnNavigatorInstance[]> = { common: [], uncommon: [], rare: [], epic: [], legendary: [] }
    for (const n of store.navigators) {
      const def = anFindNavigatorDef(n.navigatorDefId)
      if (def) grouped[def.rarity].push(n)
    }
    return grouped
  }, [store])

  const anNavigatorsByPath = useMemo(() => {
    const grouped: Record<string, AnNavigatorInstance[]> = {}
    for (const path of AN_PATHS) {
      grouped[path.id] = []
    }
    for (const n of store.navigators) {
      const def = anFindNavigatorDef(n.navigatorDefId)
      if (def) grouped[def.path].push(n)
    }
    return grouped
  }, [store])

  const anTitleProgress = useMemo(() => {
    const current = anFindTitle(store.currentTitle)
    if (!current) return { currentPrestige: 0, nextPrestige: 0, progress: 0 }
    const next = anNextTitle
    if (!next) return { currentPrestige: current.minPrestige, nextPrestige: current.minPrestige, progress: 1 }
    const range = next.minPrestige - current.minPrestige
    const progress = range > 0 ? (store.prestige - current.minPrestige) / range : 1
    return { currentPrestige: current.minPrestige, nextPrestige: next.minPrestige, progress: Math.min(1, Math.max(0, progress)) }
  }, [store])

  const anRareMaterialCount = useMemo(() => {
    return store.materials.filter((m) => {
      const def = anFindMaterial(m.materialId)
      return def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')
    }).length
  }, [store])

  const anUnfocusedNavigators = useMemo(() => {
    return store.navigators.filter((n) => n.focus < 30)
  }, [store])

  const anLowMoraleNavigators = useMemo(() => {
    return store.navigators.filter((n) => n.morale < 40)
  }, [store])

  const anTotalRelicBoost = useMemo(() => {
    let navBoost = 0
    let pilotBoost = 0
    let astroBoost = 0
    for (const rId of store.relics) {
      const relic = anFindRelic(rId)
      if (relic) {
        navBoost += relic.navBoost
        pilotBoost += relic.pilotBoost
        astroBoost += relic.astroBoost
      }
    }
    return { navBoost, pilotBoost, astroBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return anAPI object
  // ═════════════════════════════════════════════════════════════

  const anAPI = {
    // ── Direct constants ──────────────────────────────────────
    AN_COSMIC_PURPLE,
    AN_STELLAR_GOLD,
    AN_NEBULA_BLUE,
    AN_SOLAR_ORANGE,
    AN_VOID_BLACK,
    AN_LUNAR_SILVER,
    AN_ASTRA_TEAL,
    AN_QUASAR_WHITE,
    AN_PATHS,
    AN_NAVIGATORS,
    AN_STATIONS,
    AN_MATERIALS,
    AN_STRUCTURES,
    AN_ABILITIES,
    AN_ACHIEVEMENTS,
    AN_TITLES,
    AN_RELICS,
    AN_EVENTS,
    anCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    navigators: store.navigators,
    stations: store.stations,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    stardust: store.stardust,
    prestige: store.prestige,
    totalRecruited: store.totalRecruited,
    totalHarvested: store.totalHarvested,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeStation: store.activeStation,

    // ── Store actions ─────────────────────────────────────────
    anRecruitNavigator: store.anRecruitNavigator,
    anDismissNavigator: store.anDismissNavigator,
    anTrainNavigator: store.anTrainNavigator,
    anHarvestStardust: store.anHarvestStardust,
    anBuildStructure: store.anBuildStructure,
    anUpgradeStructure: store.anUpgradeStructure,
    anOperateStation: store.anOperateStation,
    anCollectRelic: store.anCollectRelic,
    anUnlockAbility: store.anUnlockAbility,
    anUnlockTitle: store.anUnlockTitle,
    anClaimAchievement: store.anClaimAchievement,
    anTradeMaterial: store.anTradeMaterial,
    anEndEvent: store.anEndEvent,
    anResetEvent: store.anResetEvent,

    // ── Computed getters ──────────────────────────────────────
    anOwnedNavigators,
    anAvailableNavigatorDefs,
    anCurrentTitleDetail,
    anNextTitle,
    anActiveStationDetail,
    anUnoperatedStations,
    anBuiltStructures,
    anUnlockableAbilities,
    anOwnedRelics,
    anUnclaimedAchievements,
    anInventoryMaterials,
    anTotalStructureEffect,
    anAverageNavigatorLevel,
    anTotalNavigatorPower,
    anPathDistribution,
    anRarityDistribution,
    anNavigatorsByRarity,
    anNavigatorsByPath,
    anTitleProgress,
    anRareMaterialCount,
    anUnfocusedNavigators,
    anLowMoraleNavigators,
    anTotalRelicBoost,
  }

  return anAPI
}
