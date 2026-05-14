/**
 * Magnet Keep Wire — 磁力要塞 (Magnet Keep) feature module
 *
 * A magnetic fortress defense mini-game: command 35 magnetic guardians
 * across 7 polarity types, maintain 8 fortress chambers, collect 30
 * metal/ore materials, build 25 fortress structures, unlock 22 magnetic
 * abilities, discover 15 legendary magnetic relics, face 12 fortress
 * siege events, and ascend through 8 titles from Iron Recruit to
 * Magnet Deity — backed by a Zustand store with persist middleware.
 *
 * Storage key: magnet-keep-wire
 * Prefix: mk / MK_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type MkPolarityType =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'zenith'
  | 'nadir'
  | 'chaos'

export type MkRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type MkTitleId =
  | 'title_iron_recruit'
  | 'title_steel_sentry'
  | 'title_ironclad_guard'
  | 'title_magnet_sergeant'
  | 'title_polarity_commander'
  | 'title_fortress_warden'
  | 'title_field_marshal'
  | 'title_magnet_deity'

export interface MkPolarityDef {
  readonly id: MkPolarityType
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface MkGuardianDef {
  readonly id: string
  readonly name: string
  readonly polarity: MkPolarityType
  readonly rarity: MkRarity
  readonly magneticPower: number
  readonly shieldPower: number
  readonly chargeSpeed: number
  readonly description: string
  readonly abilities: string[]
}

export interface MkGuardianInstance {
  readonly id: string
  guardianDefId: string
  name: string
  level: number
  xp: number
  magneticPower: number
  shieldPower: number
  chargeSpeed: number
  charge: number
  morale: number
  stationedAt: string | null
  recruitedAt: number
}

export interface MkChamberDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly defenseLevel: number
  readonly requiredTitle: MkTitleId
  readonly polarity: MkPolarityType
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface MkMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'metal' | 'ore' | 'crystal' | 'alloy' | 'essence'
  readonly rarity: MkRarity
  readonly magneticBonus: number
  readonly shieldBonus: number
  readonly value: number
  readonly description: string
}

export interface MkStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'guard_post' | 'forge' | 'armory' | 'shield_wall' | 'relic_vault'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface MkStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface MkAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly polarity: MkPolarityType
  readonly type: 'active' | 'passive'
  readonly rarity: MkRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface MkAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { iron: number; prestige: number }
}

export interface MkTitleDef {
  readonly id: MkTitleId
  readonly name: string
  readonly emoji: string
  readonly minPrestige: number
  readonly minGuardians: number
  readonly description: string
}

export interface MkRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: MkRarity
  readonly polarity: MkPolarityType
  readonly magneticBoost: number
  readonly shieldBoost: number
  readonly speedBoost: number
  readonly value: number
  readonly description: string
}

export interface MkEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface MkStoreState {
  guardians: MkGuardianInstance[]
  chambers: string[]
  materials: { materialId: string; count: number }[]
  structures: MkStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: MkTitleId
  iron: number
  prestige: number
  totalRecruited: number
  totalForged: number
  totalBuilt: number
  totalSiegesFaced: number
  activeEvent: MkEventDef | null
  eventTurnsRemaining: number
  activeChamber: string | null
}

export interface MkStoreActions {
  mkRecruitGuardian: (guardianDefId: string) => boolean
  mkDismissGuardian: (guardianId: string) => boolean
  mkChargeGuardian: (guardianId: string) => boolean
  mkForgeMaterial: (guardianId: string) => boolean
  mkBuildStructure: (structureDefId: string) => boolean
  mkUpgradeStructure: (structureId: string) => boolean
  mkDefendChamber: (chamberId: string) => MkEventDef | null
  mkCollectRelic: (relicId: string) => boolean
  mkUnlockAbility: (abilityId: string) => boolean
  mkUnlockTitle: (titleId: MkTitleId) => boolean
  mkClaimAchievement: (achievementId: string) => boolean
  mkTradeMaterial: (materialId: string, count: number) => number
  mkEndEvent: () => void
  mkResetEvent: () => void
}

export interface MkFullStore extends MkStoreState, MkStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const MK_MAGNET_RED: string = '#FF0000'
export const MK_POLARITY_BLUE: string = '#0000FF'
export const MK_IRON_GRAY: string = '#708090'
export const MK_FORGE_ORANGE: string = '#FF8C00'
export const MK_LIGHTNING_YELLOW: string = '#FFD700'
export const MK_STEEL_SILVER: string = '#C0C0C0'
export const MK_SHIELD_GREEN: string = '#2E8B57'
export const MK_CRYSTAL_CYAN: string = '#00CED1'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: POLARITY DEFINITIONS (7 polarities)
// ═══════════════════════════════════════════════════════════════════

export const MK_POLARITIES: readonly MkPolarityDef[] = [
  {
    id: 'north',
    name: 'North',
    color: MK_POLARITY_BLUE,
    description:
      'The pulling force of the north pole. North guardians attract metal and draw enemies into crushing magnetic fields.',
  },
  {
    id: 'south',
    name: 'South',
    color: MK_MAGNET_RED,
    description:
      'The repulsive might of the south pole. South guardians push threats away and create impenetrable repulsion barriers.',
  },
  {
    id: 'east',
    name: 'East',
    color: MK_LIGHTNING_YELLOW,
    description:
      'The conductive energy of the east. East guardians channel lightning-fast electrical currents through the fortress grid.',
  },
  {
    id: 'west',
    name: 'West',
    color: MK_SHIELD_GREEN,
    description:
      'The grounding stability of the west. West guardians absorb and dissipate incoming energy through deep earth currents.',
  },
  {
    id: 'zenith',
    name: 'Zenith',
    color: MK_STEEL_SILVER,
    description:
      'The ascending power of the zenith. Zenith guardians levitate above the battlefield, striking from impossible angles.',
  },
  {
    id: 'nadir',
    name: 'Nadir',
    color: MK_IRON_GRAY,
    description:
      'The crushing depth of the nadir. Nadir guardians exert immense downward force, pinning enemies to the ground.',
  },
  {
    id: 'chaos',
    name: 'Chaos',
    color: MK_CRYSTAL_CYAN,
    description:
      'The unpredictable wild polarity. Chaos guardians can reverse fields at will, creating devastating electromagnetic storms.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: POLARITY SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const MK_SYNERGY_MAP: Record<MkPolarityType, MkPolarityType[]> = {
  north: ['west', 'zenith'],
  south: ['north', 'east'],
  east: ['south', 'nadir'],
  west: ['east', 'chaos'],
  zenith: ['north', 'chaos'],
  nadir: ['east', 'west'],
  chaos: ['zenith', 'nadir'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: MK_GUARDIANS — 35 Magnetic Guardians (5 per polarity)
// ═══════════════════════════════════════════════════════════════════

export const MK_GUARDIANS: readonly MkGuardianDef[] = [
  // ── North Guardians (5) ──────────────────────────────────────
  {
    id: 'north_magnet_shard',
    name: 'Magnet Shard',
    polarity: 'north',
    rarity: 'common',
    magneticPower: 12,
    shieldPower: 8,
    chargeSpeed: 18,
    description:
      'A small crystallized fragment of lodestone. It hums with a faint attractive force, pulling loose nails from walls.',
    abilities: ['ab_attract'],
  },
  {
    id: 'north_lodestone_needle',
    name: 'Lodestone Needle',
    polarity: 'north',
    rarity: 'common',
    magneticPower: 18,
    shieldPower: 10,
    chargeSpeed: 22,
    description:
      'A slender guardian carved from natural magnetite. Its needle always points toward enemy formations.',
    abilities: ['ab_attract', 'ab_north_pull'],
  },
  {
    id: 'north_attractor',
    name: 'North Attractor',
    polarity: 'north',
    rarity: 'uncommon',
    magneticPower: 30,
    shieldPower: 15,
    chargeSpeed: 25,
    description:
      'A medium-sized guardian that generates a constant pull field. Armored enemies are dragged helplessly toward it.',
    abilities: ['ab_attract', 'ab_north_pull'],
  },
  {
    id: 'north_field_puller',
    name: 'Field Puller',
    polarity: 'north',
    rarity: 'rare',
    magneticPower: 55,
    shieldPower: 30,
    chargeSpeed: 28,
    description:
      'A towering construct of aligned magnetic crystals. It can pull entire siege engines off the ground.',
    abilities: ['ab_attract', 'ab_north_pull', 'ab_field_mastery'],
  },
  {
    id: 'north_monolith',
    name: 'North Monolith',
    polarity: 'north',
    rarity: 'epic',
    magneticPower: 80,
    shieldPower: 55,
    chargeSpeed: 32,
    description:
      'A colossal magnetic obelisk that serves as the ultimate north-pole anchor. Nothing can escape its gravitational pull.',
    abilities: ['ab_attract', 'ab_north_pull', 'ab_field_mastery'],
  },

  // ── South Guardians (5) ──────────────────────────────────────
  {
    id: 'south_repulsor',
    name: 'South Repulsor',
    polarity: 'south',
    rarity: 'common',
    magneticPower: 15,
    shieldPower: 12,
    chargeSpeed: 20,
    description:
      'A compact guardian that emits a steady push field. Projectiles bounce harmlessly off its repulsion aura.',
    abilities: ['ab_repulse'],
  },
  {
    id: 'south_deflector',
    name: 'Shield Deflector',
    polarity: 'south',
    rarity: 'common',
    magneticPower: 12,
    shieldPower: 20,
    chargeSpeed: 18,
    description:
      'A wide-bodied guardian shaped like a convex shield. It specializes in deflecting incoming attacks back at foes.',
    abilities: ['ab_repulse', 'ab_south_push'],
  },
  {
    id: 'south_bouncer',
    name: 'South Bouncer',
    polarity: 'south',
    rarity: 'uncommon',
    magneticPower: 22,
    shieldPower: 30,
    chargeSpeed: 28,
    description:
      'A spring-like guardian that stores incoming kinetic energy and releases it as devastating repulsive blasts.',
    abilities: ['ab_repulse', 'ab_south_push'],
  },
  {
    id: 'south_fortress',
    name: 'South Fortress',
    polarity: 'south',
    rarity: 'rare',
    magneticPower: 40,
    shieldPower: 65,
    chargeSpeed: 15,
    description:
      'An immovable fortress guardian that creates walls of pure repulsive force. Siege weapons shatter against its barriers.',
    abilities: ['ab_repulse', 'ab_south_push', 'ab_fortress_wall'],
  },
  {
    id: 'south_warden',
    name: 'South Warden',
    polarity: 'south',
    rarity: 'legendary',
    magneticPower: 70,
    shieldPower: 120,
    chargeSpeed: 35,
    description:
      'The ultimate defensive guardian. Its south-pole field is so powerful it can repel armies, dragons, and falling mountains.',
    abilities: ['ab_repulse', 'ab_south_push', 'ab_fortress_wall'],
  },

  // ── East Guardians (5) ───────────────────────────────────────
  {
    id: 'east_spark',
    name: 'East Spark',
    polarity: 'east',
    rarity: 'common',
    magneticPower: 20,
    shieldPower: 5,
    chargeSpeed: 30,
    description:
      'A small crackling guardian that generates electrical arcs between its crystalline prongs.',
    abilities: ['ab_polarity_flash'],
  },
  {
    id: 'east_flasher',
    name: 'East Flasher',
    polarity: 'east',
    rarity: 'uncommon',
    magneticPower: 28,
    shieldPower: 10,
    chargeSpeed: 35,
    description:
      'A swift guardian that moves in blinding flashes of electric light. Enemies cannot track its movements.',
    abilities: ['ab_polarity_flash', 'ab_east_bolt'],
  },
  {
    id: 'east_conductor',
    name: 'Conductor Sentinel',
    polarity: 'east',
    rarity: 'uncommon',
    magneticPower: 25,
    shieldPower: 18,
    chargeSpeed: 32,
    description:
      'A sentinel of pure conductive metal. It channels lightning through the fortress grid to energize allied guardians.',
    abilities: ['ab_polarity_flash', 'ab_conductance'],
  },
  {
    id: 'east_stormcaller',
    name: 'Storm Caller',
    polarity: 'east',
    rarity: 'rare',
    magneticPower: 60,
    shieldPower: 20,
    chargeSpeed: 42,
    description:
      'A crackling tower guardian that summons electromagnetic storms. Lightning arcs between it and every nearby conductor.',
    abilities: ['ab_polarity_flash', 'ab_east_bolt', 'ab_conductance'],
  },
  {
    id: 'east_radiance',
    name: 'East Radiance',
    polarity: 'east',
    rarity: 'epic',
    magneticPower: 85,
    shieldPower: 35,
    chargeSpeed: 48,
    description:
      'A blazing sun-like guardian of pure electrical energy. Its radiance empowers all east-aligned guardians within range.',
    abilities: ['ab_polarity_flash', 'ab_east_bolt', 'ab_conductance'],
  },

  // ── West Guardians (5) ───────────────────────────────────────
  {
    id: 'west_anchor',
    name: 'West Anchor',
    polarity: 'west',
    rarity: 'common',
    magneticPower: 8,
    shieldPower: 18,
    chargeSpeed: 14,
    description:
      'A heavy, earth-bound guardian that roots itself deep into the ground. Immune to knockback effects.',
    abilities: ['ab_charge_shield'],
  },
  {
    id: 'west_ground',
    name: 'Ground Sentinel',
    polarity: 'west',
    rarity: 'common',
    magneticPower: 10,
    shieldPower: 22,
    chargeSpeed: 16,
    description:
      'A sentinel that channels earth currents to dissipate incoming energy. Thunderbolts fizzle against its grounding field.',
    abilities: ['ab_charge_shield', 'ab_iron_bind'],
  },
  {
    id: 'west_absorber',
    name: 'Absorber Guardian',
    polarity: 'west',
    rarity: 'uncommon',
    magneticPower: 15,
    shieldPower: 40,
    chargeSpeed: 18,
    description:
      'A sponge-like guardian that absorbs electromagnetic attacks and converts them into healing energy for the fortress.',
    abilities: ['ab_charge_shield', 'ab_iron_bind'],
  },
  {
    id: 'west_voidwalker',
    name: 'Void Walker',
    polarity: 'west',
    rarity: 'epic',
    magneticPower: 50,
    shieldPower: 75,
    chargeSpeed: 30,
    description:
      'A ghostly guardian that phases between the material world and a pocket of null-space. Attacks pass through it harmlessly.',
    abilities: ['ab_charge_shield', 'ab_iron_bind', 'ab_void_lock'],
  },
  {
    id: 'west_deity',
    name: 'West Deity',
    polarity: 'west',
    rarity: 'legendary',
    magneticPower: 65,
    shieldPower: 110,
    chargeSpeed: 38,
    description:
      'The living embodiment of grounding energy. It creates a zone where all electromagnetic forces are neutralized.',
    abilities: ['ab_charge_shield', 'ab_iron_bind', 'ab_void_lock'],
  },

  // ── Zenith Guardians (5) ─────────────────────────────────────
  {
    id: 'zenith_climber',
    name: 'Zenith Climber',
    polarity: 'zenith',
    rarity: 'common',
    magneticPower: 14,
    shieldPower: 8,
    chargeSpeed: 25,
    description:
      'A lightweight guardian that defies gravity, hovering several meters above the ground. It scouts from the air.',
    abilities: ['ab_levitate'],
  },
  {
    id: 'zenith_ascender',
    name: 'Zenith Ascender',
    polarity: 'zenith',
    rarity: 'uncommon',
    magneticPower: 22,
    shieldPower: 12,
    chargeSpeed: 35,
    description:
      'A rising sentinel that gains power the higher it levitates. At maximum altitude, its magnetic field is devastating.',
    abilities: ['ab_levitate', 'ab_zenith_lift'],
  },
  {
    id: 'zenith_lifter',
    name: 'Zenith Lifter',
    polarity: 'zenith',
    rarity: 'rare',
    magneticPower: 45,
    shieldPower: 25,
    chargeSpeed: 38,
    description:
      'A powerful levitator that can lift siege engines and enemy troops into the sky, then drop them from great heights.',
    abilities: ['ab_levitate', 'ab_zenith_lift', 'ab_z_gravity'],
  },
  {
    id: 'zenith_illuminator',
    name: 'Zenith Illuminator',
    polarity: 'zenith',
    rarity: 'epic',
    magneticPower: 70,
    shieldPower: 40,
    chargeSpeed: 45,
    description:
      'A radiant zenith guardian that floats at the apex of the fortress, bathing the keep in protective silver light.',
    abilities: ['ab_levitate', 'ab_zenith_lift', 'ab_z_gravity'],
  },
  {
    id: 'zenith_sovereign',
    name: 'Zenith Sovereign',
    polarity: 'zenith',
    rarity: 'legendary',
    magneticPower: 100,
    shieldPower: 60,
    chargeSpeed: 55,
    description:
      'The ruler of the zenith polarity. It commands an anti-gravity field that makes the entire fortress weightless and untouchable.',
    abilities: ['ab_levitate', 'ab_zenith_lift', 'ab_z_gravity'],
  },

  // ── Nadir Guardians (5) ──────────────────────────────────────
  {
    id: 'nadir_digger',
    name: 'Nadir Digger',
    polarity: 'nadir',
    rarity: 'common',
    magneticPower: 16,
    shieldPower: 10,
    chargeSpeed: 20,
    description:
      'A compact underground guardian that burrows through stone using localized gravity wells.',
    abilities: ['ab_ground_slam'],
  },
  {
    id: 'nadir_sinker',
    name: 'Nadir Sinker',
    polarity: 'nadir',
    rarity: 'common',
    magneticPower: 14,
    shieldPower: 15,
    chargeSpeed: 18,
    description:
      'A heavy guardian that increases gravity in its vicinity. Enemies within range feel like they are carrying boulders.',
    abilities: ['ab_ground_slam', 'ab_nadir_sink'],
  },
  {
    id: 'nadir_crusher',
    name: 'Nadir Crusher',
    polarity: 'nadir',
    rarity: 'uncommon',
    magneticPower: 35,
    shieldPower: 30,
    chargeSpeed: 22,
    description:
      'A brutal guardian that amplifies downward force to crush enemies into the bedrock beneath the fortress.',
    abilities: ['ab_ground_slam', 'ab_nadir_sink'],
  },
  {
    id: 'nadir_vortex',
    name: 'Nadir Vortex',
    polarity: 'nadir',
    rarity: 'rare',
    magneticPower: 55,
    shieldPower: 40,
    chargeSpeed: 25,
    description:
      'A swirling vortex guardian that creates gravity wells in the ground. Enemies are pulled underground and trapped.',
    abilities: ['ab_ground_slam', 'ab_nadir_sink', 'ab_nadir_crush'],
  },
  {
    id: 'nadir_echo',
    name: 'Nadir Echo',
    polarity: 'nadir',
    rarity: 'epic',
    magneticPower: 75,
    shieldPower: 50,
    chargeSpeed: 30,
    description:
      'A resonant nadir guardian that sends seismic pulses through the earth. The shockwaves topple siege towers at range.',
    abilities: ['ab_ground_slam', 'ab_nadir_sink', 'ab_nadir_crush'],
  },

  // ── Chaos Guardians (5) ──────────────────────────────────────
  {
    id: 'chaos_flicker',
    name: 'Chaos Flicker',
    polarity: 'chaos',
    rarity: 'common',
    magneticPower: 18,
    shieldPower: 6,
    chargeSpeed: 28,
    description:
      'An unstable guardian that randomly shifts between polarities. Unpredictable but occasionally devastating.',
    abilities: ['ab_static_discharge'],
  },
  {
    id: 'chaos_tangler',
    name: 'Chaos Tangler',
    polarity: 'chaos',
    rarity: 'uncommon',
    magneticPower: 30,
    shieldPower: 15,
    chargeSpeed: 25,
    description:
      'A writhing mass of crossed magnetic fields. It tangles enemy formations into confused, self-defeating knots.',
    abilities: ['ab_static_discharge', 'ab_chaos_reversal'],
  },
  {
    id: 'chaos_reverser',
    name: 'Chaos Reverser',
    polarity: 'chaos',
    rarity: 'rare',
    magneticPower: 50,
    shieldPower: 25,
    chargeSpeed: 32,
    description:
      'A terrifying guardian that can reverse the polarity of any magnetic field. Allied defenses become enemy weapons.',
    abilities: ['ab_static_discharge', 'ab_chaos_reversal'],
  },
  {
    id: 'chaos_quasar',
    name: 'Chaos Quasar',
    polarity: 'chaos',
    rarity: 'epic',
    magneticPower: 85,
    shieldPower: 35,
    chargeSpeed: 40,
    description:
      'A swirling maelstrom of raw electromagnetic chaos. It generates magnetic fields that physics cannot predict.',
    abilities: ['ab_static_discharge', 'ab_chaos_reversal', 'ab_chaos_storm'],
  },
  {
    id: 'chaos_overlord',
    name: 'Chaos Overlord',
    polarity: 'chaos',
    rarity: 'legendary',
    magneticPower: 130,
    shieldPower: 45,
    chargeSpeed: 50,
    description:
      'The supreme chaos guardian. It commands all seven polarities simultaneously, creating electromagnetic conditions that warp reality itself.',
    abilities: ['ab_static_discharge', 'ab_chaos_reversal', 'ab_chaos_storm', 'ab_magnet_deity'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: MK_CHAMBERS — 8 Fortress Chambers
// ═══════════════════════════════════════════════════════════════════

export const MK_CHAMBERS: readonly MkChamberDef[] = [
  {
    id: 'outer_gate',
    name: 'Outer Gate',
    description:
      'The fortified entrance to the Magnet Keep. Massive magnetic doors repel intruders while north-pole guardians pull enemies into trap corridors.',
    depth: 0,
    defenseLevel: 1,
    requiredTitle: 'title_iron_recruit',
    polarity: 'north',
    bgGradient: 'linear-gradient(180deg, #708090 0%, #0000FF 50%, #FF0000 100%)',
    ambientColor: MK_IRON_GRAY,
  },
  {
    id: 'iron_hall',
    name: 'Iron Hall',
    description:
      'The central corridor lined with magnetic iron plates. Guardians patrol this hall, their fields creating overlapping barriers of repulsive force.',
    depth: 1,
    defenseLevel: 2,
    requiredTitle: 'title_iron_recruit',
    polarity: 'south',
    bgGradient: 'linear-gradient(180deg, #FF0000 0%, #708090 50%, #C0C0C0 100%)',
    ambientColor: MK_MAGNET_RED,
  },
  {
    id: 'forge_chamber',
    name: 'Armory Forge',
    description:
      'The heated forge chamber where weapons and armor are crafted from magnetic alloys. The ambient magnetism here sharpens any blade.',
    depth: 2,
    defenseLevel: 3,
    requiredTitle: 'title_steel_sentry',
    polarity: 'east',
    bgGradient: 'linear-gradient(180deg, #FF8C00 0%, #FFD700 50%, #708090 100%)',
    ambientColor: MK_FORGE_ORANGE,
  },
  {
    id: 'crystal_vault',
    name: 'Crystal Vault',
    description:
      'A vault lined with crystallized lodestone formations. Rare magnetic crystals glow with pulsing energy, powering the fortress defenses.',
    depth: 3,
    defenseLevel: 4,
    requiredTitle: 'title_ironclad_guard',
    polarity: 'zenith',
    bgGradient: 'linear-gradient(180deg, #C0C0C0 0%, #00CED1 50%, #FFD700 100%)',
    ambientColor: MK_STEEL_SILVER,
  },
  {
    id: 'shield_bastion',
    name: 'Shield Bastion',
    description:
      'The primary defensive chamber where south-pole guardians maintain overlapping repulsion shields. Nothing physical can penetrate.',
    depth: 4,
    defenseLevel: 5,
    requiredTitle: 'title_magnet_sergeant',
    polarity: 'south',
    bgGradient: 'linear-gradient(180deg, #2E8B57 0%, #0000FF 50%, #FF0000 100%)',
    ambientColor: MK_SHIELD_GREEN,
  },
  {
    id: 'lightning_spire',
    name: 'Lightning Spire',
    description:
      'A towering spire chamber that channels atmospheric electricity. East-pole guardians here can summon lightning at will.',
    depth: 5,
    defenseLevel: 6,
    requiredTitle: 'title_polarity_commander',
    polarity: 'east',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #FF8C00 50%, #0000FF 100%)',
    ambientColor: MK_LIGHTNING_YELLOW,
  },
  {
    id: 'deep_core',
    name: 'Deep Core',
    description:
      'The heart of the fortress, containing a massive magnetic core that powers every defense system. Only the most elite guardians are stationed here.',
    depth: 6,
    defenseLevel: 7,
    requiredTitle: 'title_fortress_warden',
    polarity: 'west',
    bgGradient: 'linear-gradient(180deg, #00CED1 0%, #708090 50%, #C0C0C0 100%)',
    ambientColor: MK_CRYSTAL_CYAN,
  },
  {
    id: 'apex_throne',
    name: 'Apex Throne',
    description:
      'The final chamber at the apex of the keep, where the Magnet Deity presides. All seven polarities converge here in perfect harmony.',
    depth: 7,
    defenseLevel: 8,
    requiredTitle: 'title_field_marshal',
    polarity: 'chaos',
    bgGradient: 'linear-gradient(180deg, #00CED1 0%, #FFD700 50%, #FF0000 100%)',
    ambientColor: MK_CRYSTAL_CYAN,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: MK_MATERIALS — 30 Metal/Ore Materials
// ═══════════════════════════════════════════════════════════════════

export const MK_MATERIALS: readonly MkMaterialDef[] = [
  // Common (8)
  { id: 'mat_iron_scrap', name: 'Iron Scrap', emoji: '🔩', type: 'metal', rarity: 'common', magneticBonus: 2, shieldBonus: 1, value: 10, description: 'Discarded iron fragments salvaged from the forge floor. Still slightly magnetized.' },
  { id: 'mat_copper_wire', name: 'Copper Wire', emoji: '🔌', type: 'metal', rarity: 'common', magneticBonus: 1, shieldBonus: 2, value: 12, description: 'Coils of copper wire used for conducting electricity through guardian circuits.' },
  { id: 'mat_raw_magnetite', name: 'Raw Magnetite', emoji: '🪨', type: 'ore', rarity: 'common', magneticBonus: 4, shieldBonus: 0, value: 15, description: 'Naturally occurring magnetic ore. The fundamental building block of all guardian construction.' },
  { id: 'mat_steel_plate', name: 'Steel Plate', emoji: '🛡️', type: 'metal', rarity: 'common', magneticBonus: 1, shieldBonus: 4, value: 14, description: 'A flat plate of forged steel. Essential for reinforcing fortress walls and guardian armor.' },
  { id: 'mat_nickel_nugget', name: 'Nickel Nugget', emoji: '⚪', type: 'ore', rarity: 'common', magneticBonus: 3, shieldBonus: 1, value: 13, description: 'A small nugget of nickel. Highly resistant to corrosion and useful in magnetic alloys.' },
  { id: 'mat_cobalt_dust', name: 'Cobalt Dust', emoji: '🔵', type: 'ore', rarity: 'common', magneticBonus: 5, shieldBonus: 0, value: 18, description: 'Fine blue cobalt powder. When added to alloys, it dramatically increases magnetic retention.' },
  { id: 'mat_tin_ingot', name: 'Tin Ingot', emoji: '🟤', type: 'metal', rarity: 'common', magneticBonus: 0, shieldBonus: 3, value: 8, description: 'A small ingot of tin. Used as a bonding agent in electromagnetic soldering.' },
  { id: 'mat_zinc_shard', name: 'Zinc Shard', emoji: '⬜', type: 'metal', rarity: 'common', magneticBonus: 2, shieldBonus: 2, value: 11, description: 'A jagged shard of zinc. Protects other metals from electromagnetic degradation.' },

  // Uncommon (7)
  { id: 'mat_ferrite_core', name: 'Ferrite Core', emoji: '⚫', type: 'alloy', rarity: 'uncommon', magneticBonus: 8, shieldBonus: 5, value: 75, description: 'A dense ferrite core that concentrates magnetic fields. Used in advanced guardian construction.' },
  { id: 'mat_neodymium_shard', name: 'Neodymium Shard', emoji: '💎', type: 'crystal', rarity: 'uncommon', magneticBonus: 15, shieldBonus: 2, value: 90, description: 'A rare-earth crystal fragment of extraordinary magnetic strength. The most powerful permanent magnet material.' },
  { id: 'mat_samarium_ore', name: 'Samarium Ore', emoji: '🟣', type: 'ore', rarity: 'uncommon', magneticBonus: 12, shieldBonus: 8, value: 80, description: 'Rare samarium ore used in high-temperature magnetic applications. Guardians made with it resist heat.' },
  { id: 'mat_quartz_crystal', name: 'Quartz Crystal', emoji: '🔮', type: 'crystal', rarity: 'uncommon', magneticBonus: 5, shieldBonus: 12, value: 70, description: 'A piezoelectric quartz crystal. Generates electrical charge under mechanical pressure.' },
  { id: 'mat_electrum_wire', name: 'Electrum Wire', emoji: '⚡', type: 'metal', rarity: 'uncommon', magneticBonus: 10, shieldBonus: 3, value: 85, description: 'Wire spun from a gold-silver alloy that conducts magnetic fields with zero resistance.' },
  { id: 'mat_cobalt_steel', name: 'Cobalt Steel', emoji: '🔩', type: 'alloy', rarity: 'uncommon', magneticBonus: 8, shieldBonus: 10, value: 72, description: 'An alloy of steel and cobalt that retains magnetism permanently. Perfect for guardian weapons.' },
  { id: 'mat_hematite_gem', name: 'Hematite Gem', emoji: '🩶', type: 'crystal', rarity: 'uncommon', magneticBonus: 7, shieldBonus: 7, value: 65, description: 'A polished hematite gemstone. Ancient warriors used it as a compass in battle.' },

  // Rare (6)
  { id: 'mat_gauss_coil', name: 'Gauss Coil', emoji: '🌀', type: 'alloy', rarity: 'rare', magneticBonus: 25, shieldBonus: 15, value: 350, description: 'A precision-wound electromagnetic coil capable of accelerating projectiles to extreme velocities.' },
  { id: 'mat_permalloy_sheet', name: 'Permalloy Sheet', emoji: '📋', type: 'alloy', rarity: 'rare', magneticBonus: 20, shieldBonus: 30, value: 320, description: 'A sheet of nickel-iron alloy with extraordinarily high magnetic permeability. Blocks all EM interference.' },
  { id: 'mat_magnetic_monopole', name: 'Magnetic Monopole', emoji: '🔺', type: 'crystal', rarity: 'rare', magneticBonus: 40, shieldBonus: 5, value: 450, description: 'A theoretical crystal that exhibits only north or south polarity. Incredibly rare and powerful.' },
  { id: 'mat_auric_ferrite', name: 'Auric Ferrite', emoji: '✨', type: 'alloy', rarity: 'rare', magneticBonus: 15, shieldBonus: 25, value: 380, description: 'A golden ferrite alloy infused with trace lodestone essence. Used in elite guardian construction.' },
  { id: 'mat_tempered_iron', name: 'Tempered Iron', emoji: '⚒️', type: 'metal', rarity: 'rare', magneticBonus: 18, shieldBonus: 20, value: 340, description: 'Iron that has been tempered in magnetic fields for a century. Its crystalline structure is perfectly aligned.' },
  { id: 'mat_tesla_crystal', name: 'Tesla Crystal', emoji: '⚡', type: 'crystal', rarity: 'rare', magneticBonus: 30, shieldBonus: 10, value: 420, description: 'A crystal that generates spontaneous electrical discharges. Named in honor of the legendary inventor.' },

  // Epic (5)
  { id: 'mat_dark_matter_shard', name: 'Dark Matter Shard', emoji: '🌌', type: 'essence', rarity: 'epic', magneticBonus: 50, shieldBonus: 30, value: 1800, description: 'A fragment of condensed dark matter. It warps the magnetic field around it in impossible ways.' },
  { id: 'mat_terra_magnet', name: 'Terra Magnet Core', emoji: '🌍', type: 'essence', rarity: 'epic', magneticBonus: 35, shieldBonus: 50, value: 2000, description: 'A crystallized fragment of the planet\'s own magnetic core. It pulses with deep-earth energy.' },
  { id: 'mat_void_iron', name: 'Void Iron', emoji: '🕳️', type: 'alloy', rarity: 'epic', magneticBonus: 40, shieldBonus: 40, value: 1700, description: 'Iron forged in the space between dimensions. It absorbs all electromagnetic radiation.' },
  { id: 'mat_starforge_alloy', name: 'Starforge Alloy', emoji: '⭐', type: 'alloy', rarity: 'epic', magneticBonus: 45, shieldBonus: 35, value: 2200, description: 'An alloy created in the heart of a dying star. Its magnetic properties defy known physics.' },
  { id: 'mat_levitation_crystal', name: 'Levitation Crystal', emoji: '💎', type: 'crystal', rarity: 'epic', magneticBonus: 30, shieldBonus: 55, value: 1900, description: 'A crystal that generates a permanent anti-gravity field. Anything placed near it begins to float.' },

  // Legendary (4)
  { id: 'mat_cosmic_lore', name: 'Cosmic Lore Fragment', emoji: '🌌', type: 'essence', rarity: 'legendary', magneticBonus: 60, shieldBonus: 60, value: 9000, description: 'A fragment of the universe\'s original magnetic field, preserved since the Big Bang itself.' },
  { id: 'mat_deity_essence', name: 'Deity Essence', emoji: '👑', type: 'essence', rarity: 'legendary', magneticBonus: 80, shieldBonus: 40, value: 12000, description: 'Pure concentrated essence of a magnetic deity. A single drop can empower a guardian to legendary status.' },
  { id: 'mat_omega_magnet', name: 'Omega Magnet', emoji: '🔮', type: 'crystal', rarity: 'legendary', magneticBonus: 100, shieldBonus: 70, value: 15000, description: 'The ultimate magnetic crystal, containing the combined power of all seven polarities in perfect balance.' },
  { id: 'mat_infinity_ore', name: 'Infinity Ore', emoji: '♾️', type: 'essence', rarity: 'legendary', magneticBonus: 50, shieldBonus: 100, value: 11000, description: 'Ore from beyond the edge of reality. It generates an infinitely regenerating magnetic field.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: MK_STRUCTURES — 25 Fortress Structures (upgradeable to L10)
// ═══════════════════════════════════════════════════════════════════

export const MK_STRUCTURES: readonly MkStructureDef[] = [
  // ── Guard Posts (7) ─────────────────────────────────────────
  { id: 'str_north_post', name: 'North Guard Post', emoji: '🏰', category: 'guard_post', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A fortified post where north-pole guardians maintain attraction fields to pull enemies into kill zones.' },
  { id: 'str_south_post', name: 'South Guard Post', emoji: '🛡️', category: 'guard_post', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A reinforced post for south-pole guardians. Their repulsion fields create an impenetrable defensive barrier.' },
  { id: 'str_east_post', name: 'East Relay Post', emoji: '⚡', category: 'guard_post', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 80, costMultiplier: 1.5, description: 'An electrical relay station for east-pole guardians. Channels lightning through the fortress defense grid.' },
  { id: 'str_west_post', name: 'West Anchor Post', emoji: '⛰️', category: 'guard_post', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 80, costMultiplier: 1.5, description: 'A deeply rooted post for west-pole guardians. Grounds all incoming electromagnetic attacks harmlessly.' },
  { id: 'str_zenith_platform', name: 'Zenith Platform', emoji: '☁️', category: 'guard_post', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 100, costMultiplier: 1.5, description: 'An elevated levitating platform where zenith guardians maintain aerial surveillance and attack positions.' },
  { id: 'str_nadir_bunker', name: 'Nadir Bunker', emoji: '🕳️', category: 'guard_post', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.6, description: 'An underground bunker where nadir guardians amplify gravity to crush tunneling invaders.' },
  { id: 'str_chaos_nexus', name: 'Chaos Nexus', emoji: '🌀', category: 'guard_post', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 150, costMultiplier: 1.6, description: 'A swirling nexus of conflicting magnetic fields where chaos guardians channel wild electromagnetic energy.' },

  // ── Forges (5) ──────────────────────────────────────────────
  { id: 'str_iron_forge', name: 'Iron Forge', emoji: '🔥', category: 'forge', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A basic forge for smelting iron and crafting guardian components. The heart of fortress production.' },
  { id: 'str_alloy_crucible', name: 'Alloy Crucible', emoji: '⚗️', category: 'forge', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'A high-temperature crucible for creating advanced magnetic alloys. Essential for rare guardian construction.' },
  { id: 'str_crystal_grower', name: 'Crystal Grower', emoji: '💎', category: 'forge', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A controlled environment where magnetic crystals can be grown to precise specifications.' },
  { id: 'str_starforge', name: 'Starforge', emoji: '⭐', category: 'forge', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 800, costMultiplier: 1.8, description: 'A forge that harnesses stellar energy. Can create epic-grade materials from common ores.' },
  { id: 'str_void_anvil', name: 'Void Anvil', emoji: '🌌', category: 'forge', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'An anvil that exists between dimensions. Can forge legendary alloys impossible to create in normal space.' },

  // ── Armories (5) ────────────────────────────────────────────
  { id: 'str_weapon_rack', name: 'Magnetic Weapon Rack', emoji: '🗡️', category: 'armory', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 80, costMultiplier: 1.4, description: 'A rack of magnetically enhanced weapons. Guardians equipped here gain increased magnetic power.' },
  { id: 'str_armor_vault', name: 'Polarity Armor Vault', emoji: '🛡️', category: 'armory', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A vault of armor forged with polarity-aligned metals. Boosts shield power of stationed guardians.' },
  { id: 'str_charge_station', name: 'Charge Station', emoji: '🔋', category: 'armory', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 350, costMultiplier: 1.6, description: 'A charging station that rapidly restores guardian energy. Higher levels charge faster and more efficiently.' },
  { id: 'str_upgrade_bay', name: 'Guardian Upgrade Bay', emoji: '🔧', category: 'armory', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.7, description: 'An advanced maintenance bay where guardians can be upgraded with new abilities and enhanced components.' },
  { id: 'str_war_room', name: 'War Command Room', emoji: '🗺️', category: 'armory', maxLevel: 10, baseEffect: 15, effectPerLevel: 8, baseCost: 1000, costMultiplier: 1.8, description: 'A tactical command center with magnetic field mapping. All guardian coordination is improved from here.' },

  // ── Shield Walls (5) ────────────────────────────────────────
  { id: 'str_iron_wall', name: 'Iron Shield Wall', emoji: '🧱', category: 'shield_wall', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 120, costMultiplier: 1.5, description: 'A wall reinforced with iron and lodestone. Creates a basic magnetic barrier against physical attacks.' },
  { id: 'str_repulsion_gate', name: 'Repulsion Gate', emoji: '🚪', category: 'shield_wall', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 300, costMultiplier: 1.6, description: 'A gate that generates a repulsion field. Enemies who approach are violently pushed backward.' },
  { id: 'str_conductance_fence', name: 'Conductance Fence', emoji: '⚡', category: 'shield_wall', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'An electrified fence that channels current through anyone who touches it. Devastating to metal-armored foes.' },
  { id: 'str_levitation_moat', name: 'Levitation Moat', emoji: '🌊', category: 'shield_wall', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 800, costMultiplier: 1.8, description: 'A moat filled with anti-gravity fluid. Enemies who fall in float helplessly while guardians attack from above.' },
  { id: 'str_absolute_barrier', name: 'Absolute Barrier', emoji: '🔮', category: 'shield_wall', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'The ultimate defensive structure. A multi-layered barrier combining all seven polarity types in perfect harmony.' },

  // ── Relic Vaults (3) ────────────────────────────────────────
  { id: 'str_relic_display', name: 'Relic Display Case', emoji: '🖼️', category: 'relic_vault', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A magnetic display case that showcases relics while amplifying their passive effects across the fortress.' },
  { id: 'str_sacred_vault', name: 'Sacred Relic Vault', emoji: '🔒', category: 'relic_vault', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A heavily shielded vault that preserves and magnifies the power of every stored relic.' },
  { id: 'str_harmony_shrine', name: 'Polarity Harmony Shrine', emoji: '⛩️', category: 'relic_vault', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'A shrine attuned to all seven polarities. Relics placed here resonate with each other for exponential power.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: MK_ABILITIES — 22 Magnetic Abilities
// ═══════════════════════════════════════════════════════════════════

export const MK_ABILITIES: readonly MkAbilityDef[] = [
  { id: 'ab_attract', name: 'Magnetic Attract', emoji: '🧲', polarity: 'north', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Generate a pulling field that drags metal-armored enemies toward the guardian.' },
  { id: 'ab_repulse', name: 'Polarity Repulse', emoji: '💥', polarity: 'south', type: 'active', rarity: 'common', energyCost: 6, cooldown: 35, power: 15, description: 'Emit a burst of repulsive force that knocks back all nearby enemies.' },
  { id: 'ab_charge_shield', name: 'Charge Shield', emoji: '🛡️', polarity: 'west', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 12, description: 'Absorb incoming electromagnetic energy and convert it into a protective shield.' },
  { id: 'ab_polarity_flash', name: 'Polarity Flash', emoji: '⚡', polarity: 'east', type: 'active', rarity: 'common', energyCost: 7, cooldown: 30, power: 18, description: 'Discharge a blinding flash of electrical energy that stuns enemies in an arc.' },
  { id: 'ab_levitate', name: 'Levitate', emoji: '☁️', polarity: 'zenith', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 10, description: 'Defy gravity and rise above the battlefield, gaining aerial superiority.' },
  { id: 'ab_ground_slam', name: 'Ground Slam', emoji: '🌑', polarity: 'nadir', type: 'active', rarity: 'common', energyCost: 8, cooldown: 35, power: 16, description: 'Amplify local gravity and slam downward, crushing anything beneath the guardian.' },
  { id: 'ab_static_discharge', name: 'Static Discharge', emoji: '⚡', polarity: 'chaos', type: 'active', rarity: 'common', energyCost: 9, cooldown: 40, power: 20, description: 'Release chaotic static electricity in all directions with unpredictable polarity shifts.' },
  { id: 'ab_north_pull', name: 'North Pull', emoji: '🧭', polarity: 'north', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Create a powerful vacuum of magnetic attraction. Metal objects and enemies are pulled irresistibly.' },
  { id: 'ab_south_push', name: 'South Push', emoji: '💨', polarity: 'south', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 28, description: 'Generate a concentrated repulsion beam that shatters barriers and launches enemies backward.' },
  { id: 'ab_iron_bind', name: 'Iron Bind', emoji: '⛓️', polarity: 'west', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 25, description: 'Lock enemies in place with chains of magnetic iron that resist all escape attempts.' },
  { id: 'ab_east_bolt', name: 'East Lightning Bolt', emoji: '⚡', polarity: 'east', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 70, power: 35, description: 'Call down a devastating bolt of lightning from the fortress spires onto a single target.' },
  { id: 'ab_zenith_lift', name: 'Zenith Lift', emoji: '⬆️', polarity: 'zenith', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 80, power: 22, description: 'Lift enemies into the air with anti-gravity, suspending them helplessly while allies strike.' },
  { id: 'ab_nadir_sink', name: 'Nadir Sink', emoji: '⬇️', polarity: 'nadir', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 80, power: 28, description: 'Multiply gravity in a zone, causing enemies to sink into the ground under crushing weight.' },
  { id: 'ab_chaos_reversal', name: 'Chaos Reversal', emoji: '🔄', polarity: 'chaos', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 90, power: 30, description: 'Reverse the polarity of an enemy\'s magnetic field, turning their own defenses against them.' },
  { id: 'ab_field_mastery', name: 'Field Mastery', emoji: '🌀', polarity: 'north', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Dominate the entire battlefield with a massive attraction field. All enemies are pulled to one point.' },
  { id: 'ab_fortress_wall', name: 'Fortress Wall', emoji: '🏰', polarity: 'south', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Erect an impenetrable wall of pure repulsive force. Nothing physical or magical can pass through.' },
  { id: 'ab_conductance', name: 'Perfect Conductance', emoji: '⚡', polarity: 'east', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Gain perfect electrical conductance. All allied guardians in range receive a permanent speed boost.' },
  { id: 'ab_void_lock', name: 'Void Lock', emoji: '🕳️', polarity: 'west', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Open a void in space that absorbs all incoming attacks. Trapped energy is released as a devastating counter-blast.' },
  { id: 'ab_z_gravity', name: 'Zero Gravity', emoji: '🌌', polarity: 'zenith', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 120, power: 40, description: 'Nullify gravity in a wide area. Enemies float helplessly while zenith guardians strike from all angles.' },
  { id: 'ab_nadir_crush', name: 'Nadir Crush', emoji: '🌑', polarity: 'nadir', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 110, power: 45, description: 'Focus nadir energy into a single point of extreme gravity. Anything caught is compressed into nothingness.' },
  { id: 'ab_chaos_storm', name: 'Chaos Storm', emoji: '🌪️', polarity: 'chaos', type: 'active', rarity: 'epic', energyCost: 45, cooldown: 250, power: 75, description: 'Unleash a storm of random polarity shifts that devastates everything in a massive radius.' },
  { id: 'ab_magnet_deity', name: 'Magnet Deity', emoji: '👑', polarity: 'chaos', type: 'active', rarity: 'legendary', energyCost: 60, cooldown: 600, power: 120, description: 'Channel the power of the Magnet Deity. All seven polarities obey your command for a devastating combined attack.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: MK_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const MK_ACHIEVEMENTS: readonly MkAchievementDef[] = [
  { id: 'ach_first_recruit', name: 'First Recruitment', emoji: '🧲', description: 'Recruit your first magnetic guardian.', condition: 'recruit_1', reward: { iron: 50, prestige: 10 } },
  { id: 'ach_five_recruits', name: 'Squad Leader', emoji: '🤚', description: 'Recruit 5 different guardians.', condition: 'recruit_5', reward: { iron: 200, prestige: 40 } },
  { id: 'ach_first_forge', name: 'First Forge', emoji: '⚒️', description: 'Forge material for the first time.', condition: 'forge_1', reward: { iron: 80, prestige: 15 } },
  { id: 'ach_ten_forges', name: 'Master Smith', emoji: '🔨', description: 'Forge materials 10 times.', condition: 'forge_10', reward: { iron: 300, prestige: 60 } },
  { id: 'ach_first_build', name: 'Foundation Stone', emoji: '🏗️', description: 'Build your first fortress structure.', condition: 'build_1', reward: { iron: 100, prestige: 20 } },
  { id: 'ach_five_builds', name: 'Fortress Architect', emoji: '🏰', description: 'Build 5 different fortress structures.', condition: 'build_5', reward: { iron: 500, prestige: 80 } },
  { id: 'ach_chamber_explore', name: 'Chamber Scout', emoji: '🗺️', description: 'Explore 4 different fortress chambers.', condition: 'chamber_4', reward: { iron: 400, prestige: 50 } },
  { id: 'ach_all_chambers', name: 'Keep Cartographer', emoji: '🌍', description: 'Explore all 8 fortress chambers.', condition: 'chamber_8', reward: { iron: 2000, prestige: 200 } },
  { id: 'ach_rare_recruit', name: 'Rare Pull', emoji: '💎', description: 'Recruit a rare guardian.', condition: 'rare_recruit', reward: { iron: 500, prestige: 100 } },
  { id: 'ach_epic_recruit', name: 'Epic Discovery', emoji: '🌟', description: 'Recruit an epic guardian.', condition: 'epic_recruit', reward: { iron: 1500, prestige: 250 } },
  { id: 'ach_legendary_recruit', name: 'Legendary Commander', emoji: '👑', description: 'Recruit a legendary guardian.', condition: 'legendary_recruit', reward: { iron: 5000, prestige: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first magnetic relic.', condition: 'relic_1', reward: { iron: 300, prestige: 60 } },
  { id: 'ach_five_relics', name: 'Relic Collector', emoji: '🔍', description: 'Collect 5 different relics.', condition: 'relic_5', reward: { iron: 1000, prestige: 150 } },
  { id: 'ach_first_siege', name: 'Siege Survivor', emoji: '⚔️', description: 'Survive your first fortress siege event.', condition: 'siege_1', reward: { iron: 200, prestige: 30 } },
  { id: 'ach_ten_sieges', name: 'Siege Veteran', emoji: '🏅', description: 'Survive 10 fortress siege events.', condition: 'siege_10', reward: { iron: 800, prestige: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { iron: 2000, prestige: 200 } },
  { id: 'ach_all_polarities', name: 'Polarity Master', emoji: '🌈', description: 'Recruit at least one guardian of each polarity.', condition: 'all_polarities', reward: { iron: 3000, prestige: 300 } },
  { id: 'ach_max_title', name: 'Magnet Deity', emoji: '👑', description: 'Reach the title of Magnet Deity.', condition: 'max_title', reward: { iron: 10000, prestige: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: MK_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const MK_TITLES: readonly MkTitleDef[] = [
  { id: 'title_iron_recruit', name: 'Iron Recruit', emoji: '🔩', minPrestige: 0, minGuardians: 0, description: 'A new recruit who has just begun their magnetic training at the fortress gates.' },
  { id: 'title_steel_sentry', name: 'Steel Sentry', emoji: '🛡️', minPrestige: 50, minGuardians: 3, description: 'A dependable sentry who can maintain basic magnetic barriers and command common guardians.' },
  { id: 'title_ironclad_guard', name: 'Ironclad Guard', emoji: '⚔️', minPrestige: 200, minGuardians: 7, description: 'A seasoned guard whose armor is permanently magnetized. Uncommon guardians answer their call.' },
  { id: 'title_magnet_sergeant', name: 'Magnet Sergeant', emoji: '🧲', minPrestige: 500, minGuardians: 12, description: 'A sergeant who commands multiple polarity types simultaneously. Rare guardians join their ranks.' },
  { id: 'title_polarity_commander', name: 'Polarity Commander', emoji: '⚡', minPrestige: 1200, minGuardians: 18, description: 'A commander who has mastered all seven polarities. Epic guardians pledge their loyalty.' },
  { id: 'title_fortress_warden', name: 'Fortress Warden', emoji: '🏰', minPrestige: 2500, minGuardians: 24, description: 'The warden of the entire Magnet Keep. All chambers and defenses are under their command.' },
  { id: 'title_field_marshal', name: 'Field Marshal', emoji: '🌟', minPrestige: 5000, minGuardians: 30, description: 'A legendary marshal whose tactical genius has never been defeated. Even legendary guardians kneel.' },
  { id: 'title_magnet_deity', name: 'Magnet Deity', emoji: '👑', minPrestige: 10000, minGuardians: 35, description: 'The supreme Magnet Deity, master of all magnetic forces and ruler of the invincible fortress.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: MK_RELICS — 15 Legendary Magnetic Relics
// ═══════════════════════════════════════════════════════════════════

export const MK_RELICS: readonly MkRelicDef[] = [
  { id: 'relic_crown_north', name: 'Crown of the North', emoji: '👑', rarity: 'epic', polarity: 'north', magneticBoost: 25, shieldBoost: 15, speedBoost: 10, value: 2200, description: 'A crown of lodestone crystals that permanently attracts fortune and power to its wearer.' },
  { id: 'relic_shield_south', name: 'Aegis of the South', emoji: '🛡️', rarity: 'epic', polarity: 'south', magneticBoost: 15, shieldBoost: 35, speedBoost: 5, value: 2500, description: 'An indestructible shield forged from pure south-pole energy. It repels all harm.' },
  { id: 'relic_gauntlet_east', name: 'Lightning Gauntlet', emoji: '🧤', rarity: 'rare', polarity: 'east', magneticBoost: 20, shieldBoost: 5, speedBoost: 20, value: 900, description: 'A gauntlet crackling with perpetual lightning. Punches with the force of a thunderbolt.' },
  { id: 'relic_iron_ring', name: 'Iron Root Ring', emoji: '💍', rarity: 'rare', polarity: 'west', magneticBoost: 5, shieldBoost: 25, speedBoost: 10, value: 850, description: 'A ring that connects the wearer to the earth\'s core. Grants unshakable stability.' },
  { id: 'relic_west_mask', name: 'Void Walker Mask', emoji: '🎭', rarity: 'epic', polarity: 'west', magneticBoost: 20, shieldBoost: 30, speedBoost: 15, value: 2600, description: 'A mask that allows the wearer to phase between dimensions. Attacks pass through harmlessly.' },
  { id: 'relic_zenith_wings', name: 'Zenith Sky Wings', emoji: '🪶', rarity: 'epic', polarity: 'zenith', magneticBoost: 15, shieldBoost: 15, speedBoost: 30, value: 2400, description: 'Wings of pure anti-gravity energy. The wearer can fly at impossible speeds.' },
  { id: 'relic_nadir_hammer', name: 'Nadir Gravity Hammer', emoji: '🔨', rarity: 'epic', polarity: 'nadir', magneticBoost: 30, shieldBoost: 20, speedBoost: 10, value: 2700, description: 'A hammer that multiplies gravity on impact. Each strike crushes like a mountain.' },
  { id: 'relic_north_eye', name: 'Eye of the North Pole', emoji: '👁️', rarity: 'legendary', polarity: 'north', magneticBoost: 50, shieldBoost: 30, speedBoost: 20, value: 8000, description: 'The crystallized eye of the original north magnetic pole. It sees and pulls all hidden threats into the light.' },
  { id: 'relic_south_fist', name: 'Fist of Repulsion', emoji: '✊', rarity: 'legendary', polarity: 'south', magneticBoost: 30, shieldBoost: 50, speedBoost: 15, value: 8500, description: 'A fist gauntlet of infinite repulsive force. It can push away mountains, armies, and even time itself.' },
  { id: 'relic_east_scepter', name: 'Scepter of the Storm', emoji: '🪄', rarity: 'legendary', polarity: 'east', magneticBoost: 60, shieldBoost: 20, speedBoost: 30, value: 9000, description: 'A scepter that commands the weather. Lightning, thunder, and electromagnetic storms obey its wielder.' },
  { id: 'relic_west_monolith', name: 'Monolith of Stability', emoji: '🗿', rarity: 'legendary', polarity: 'west', magneticBoost: 25, shieldBoost: 60, speedBoost: 10, value: 9500, description: 'A floating monolith of absolute zero. All chaotic forces are nullified in its presence.' },
  { id: 'relic_zenith_crown', name: 'Crown of Ascension', emoji: '👑', rarity: 'legendary', polarity: 'zenith', magneticBoost: 40, shieldBoost: 40, speedBoost: 50, value: 11000, description: 'The crown worn by the zenith sovereign. It grants perfect mastery over anti-gravity and levitation.' },
  { id: 'relic_nadir_core', name: 'Core of the Earth', emoji: '🌍', rarity: 'epic', polarity: 'nadir', magneticBoost: 20, shieldBoost: 35, speedBoost: 5, value: 2300, description: 'A fragment of the planet\'s molten core. It pulses with the deep magnetic heartbeat of the world.' },
  { id: 'relic_chaos_orb', name: 'Chaos Orb', emoji: '🔮', rarity: 'legendary', polarity: 'chaos', magneticBoost: 70, shieldBoost: 35, speedBoost: 25, value: 12000, description: 'An orb containing all seven polarities in constant conflict. It grants dominion over chaos itself.' },
  { id: 'relic_deity_chalice', name: 'Chalice of the Deity', emoji: '🏆', rarity: 'legendary', polarity: 'chaos', magneticBoost: 45, shieldBoost: 45, speedBoost: 40, value: 15000, description: 'The sacred chalice of the first Magnet Deity. Drinking from it grants temporary mastery of all seven polarities.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: MK_EVENTS — 12 Fortress Siege Events
// ═══════════════════════════════════════════════════════════════════

export const MK_EVENTS: readonly MkEventDef[] = [
  { id: 'evt_iron_invasion', name: 'Iron Invasion', emoji: '⚔️', durationTurns: 5, effectType: 'debuff', effectDescription: 'Enemy iron golems attack. Guardian charge -20%.', description: 'An army of iron golems marches on the fortress, exploiting magnetic weaknesses in the outer walls.' },
  { id: 'evt_polarity_storm', name: 'Polarity Storm', emoji: '🌪️', durationTurns: 3, effectType: 'special', effectDescription: 'Random polarity shifts. Chaos guardians empowered.', description: 'A massive electromagnetic storm sweeps across the fortress, randomly flipping guardian polarities.' },
  { id: 'evt_lightning_siege', name: 'Lightning Siege', emoji: '⚡', durationTurns: 4, effectType: 'debuff', effectDescription: 'East guardians disabled. Shield structures weakened.', description: 'Enemy mages conjure a permanent lightning storm directly over the fortress, disabling east-pole systems.' },
  { id: 'evt_magnetic_reversal', name: 'Magnetic Reversal', emoji: '🔄', durationTurns: 2, effectType: 'special', effectDescription: 'North and south swap. All attacks reversed.', description: 'The planet\'s magnetic poles suddenly reverse. North becomes south and all fortress defenses are inverted.' },
  { id: 'evt_dragon_assault', name: 'Dragon Assault', emoji: '🐉', durationTurns: 5, effectType: 'debuff', effectDescription: 'All guardian shield -30%. Rare relics appear.', description: 'A massive dragon with magnetically-scaled armor attacks the fortress. Its breath reverses polarity fields.' },
  { id: 'evt_fortune_surge', name: 'Fortune Surge', emoji: '✨', durationTurns: 5, effectType: 'buff', effectDescription: 'Iron rewards doubled. Guardian morale +30%.', description: 'A surge of magnetic energy sweeps through the fortress deposits, revealing hidden iron veins and boosting morale.' },
  { id: 'evt_alliance_reinforce', name: 'Allied Reinforcement', emoji: '🤝', durationTurns: 4, effectType: 'buff', effectDescription: 'Recruitment cost halved. Zenith guardians boosted.', description: 'Allied guardians from neighboring keeps arrive to reinforce the fortress during a period of vulnerability.' },
  { id: 'evt_sabotage', name: 'Chamber Sabotage', emoji: '💣', durationTurns: 2, effectType: 'debuff', effectDescription: 'One random chamber weakened. Repair costs doubled.', description: 'Enemy spies infiltrate the fortress and sabotage a chamber, disabling its defenses temporarily.' },
  { id: 'evt_crystal_bloom', name: 'Crystal Bloom', emoji: '💎', durationTurns: 3, effectType: 'buff', effectDescription: 'Material forging doubled. Crystal yields tripled.', description: 'A rare magnetic crystal bloom occurs in the vault, supercharging all crystal-based forging operations.' },
  { id: 'evt_void_leak', name: 'Void Energy Leak', emoji: '🕳️', durationTurns: 5, effectType: 'debuff', effectDescription: 'West guardians weakened. Chaos activity increased.', description: 'A crack opens between dimensions, leaking void energy that destabilizes the west wing defenses.' },
  { id: 'evt_ancestral_awakening', name: 'Ancestral Awakening', emoji: '👻', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus prestige per defense. Guardian XP tripled.', description: 'The spirits of ancient Magnet Deities awaken within the fortress, granting blessings and wisdom.' },
  { id: 'evt_siege_colossus', name: 'Colossus Siege', emoji: '🗿', durationTurns: 6, effectType: 'debuff', effectDescription: 'Massive siege colossus attacks. All defenses tested.', description: 'A towering colossus of magnetic iron advances on the keep. Every defense system must work in concert to stop it.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const MK_MAX_GUARDIAN_LEVEL = 50
const MK_MAX_STRUCTURE_LEVEL = 10
const MK_INITIAL_IRON = 200
const MK_INITIAL_PRESTIGE = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function mkXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function mkCalcStats(def: MkGuardianDef, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    magneticPower: Math.floor(def.magneticPower * growth),
    shieldPower: Math.floor(def.shieldPower * growth),
    chargeSpeed: Math.floor(def.chargeSpeed * growth),
  }
}

let _mkIdCounter = 0
function mkGenerateId(): string {
  _mkIdCounter += 1
  return `mk_${_mkIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function mkFindGuardianDef(id: string): MkGuardianDef | undefined {
  return MK_GUARDIANS.find((g) => g.id === id)
}

function mkFindChamber(id: string): MkChamberDef | undefined {
  return MK_CHAMBERS.find((c) => c.id === id)
}

function mkFindMaterial(id: string): MkMaterialDef | undefined {
  return MK_MATERIALS.find((m) => m.id === id)
}

function mkFindStructureDef(id: string): MkStructureDef | undefined {
  return MK_STRUCTURES.find((s) => s.id === id)
}

function mkFindAbility(id: string): MkAbilityDef | undefined {
  return MK_ABILITIES.find((a) => a.id === id)
}

function mkFindRelic(id: string): MkRelicDef | undefined {
  return MK_RELICS.find((r) => r.id === id)
}

function mkFindAchievement(id: string): MkAchievementDef | undefined {
  return MK_ACHIEVEMENTS.find((a) => a.id === id)
}

function mkFindTitle(id: MkTitleId): MkTitleDef | undefined {
  return MK_TITLES.find((t) => t.id === id)
}

function mkRarityMultiplier(rarity: MkRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function mkRarityColor(rarity: MkRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function mkPolarityColor(polarity: MkPolarityType): string {
  switch (polarity) {
    case 'north': return MK_POLARITY_BLUE
    case 'south': return MK_MAGNET_RED
    case 'east': return MK_LIGHTNING_YELLOW
    case 'west': return MK_SHIELD_GREEN
    case 'zenith': return MK_STEEL_SILVER
    case 'nadir': return MK_IRON_GRAY
    case 'chaos': return MK_CRYSTAL_CYAN
    default: return '#888888'
  }
}

export function mkCheckSynergy(attacker: MkPolarityType, defender: MkPolarityType): number {
  const advantages = MK_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = MK_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function mkCalcStructureUpgradeCost(def: MkStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function mkCalcMaxTitle(prestige: number, guardianCount: number): MkTitleId {
  let bestId: MkTitleId = 'title_iron_recruit'
  for (const title of MK_TITLES) {
    if (prestige >= title.minPrestige && guardianCount >= title.minGuardians) {
      bestId = title.id
    }
  }
  return bestId
}

function mkCheckAchievementCondition(
  condition: string,
  state: MkStoreState
): boolean {
  switch (condition) {
    case 'recruit_1':
      return state.totalRecruited >= 1
    case 'recruit_5':
      return state.totalRecruited >= 5
    case 'forge_1':
      return state.totalForged >= 1
    case 'forge_10':
      return state.totalForged >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'chamber_4':
      return state.chambers.length >= 4
    case 'chamber_8':
      return state.chambers.length >= 8
    case 'rare_recruit':
      return state.guardians.some((g) => {
        const def = mkFindGuardianDef(g.guardianDefId)
        return def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'epic_recruit':
      return state.guardians.some((g) => {
        const def = mkFindGuardianDef(g.guardianDefId)
        return def && (def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'legendary_recruit':
      return state.guardians.some((g) => {
        const def = mkFindGuardianDef(g.guardianDefId)
        return def && def.rarity === 'legendary'
      })
    case 'relic_1':
      return state.relics.length >= 1
    case 'relic_5':
      return state.relics.length >= 5
    case 'siege_1':
      return state.totalSiegesFaced >= 1
    case 'siege_10':
      return state.totalSiegesFaced >= 10
    case 'upgrade_10':
      return state.structures.some((s) => s.level >= 10)
    case 'all_polarities': {
      const polarities = new Set<MkPolarityType>()
      for (const g of state.guardians) {
        const def = mkFindGuardianDef(g.guardianDefId)
        if (def) polarities.add(def.polarity)
      }
      return polarities.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_magnet_deity'
    default:
      return false
  }
}

function mkPickRandomEvent(): MkEventDef {
  const idx = Math.floor(Math.random() * MK_EVENTS.length)
  return MK_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useMKStore = create<MkFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      guardians: [] as MkGuardianInstance[],
      chambers: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as MkStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_iron_recruit' as MkTitleId,
      iron: MK_INITIAL_IRON,
      prestige: MK_INITIAL_PRESTIGE,
      totalRecruited: 0,
      totalForged: 0,
      totalBuilt: 0,
      totalSiegesFaced: 0,
      activeEvent: null as MkEventDef | null,
      eventTurnsRemaining: 0,
      activeChamber: null as string | null,

      // ── mkRecruitGuardian ──────────────────────────────────────
      mkRecruitGuardian: (guardianDefId: string): boolean => {
        const def = mkFindGuardianDef(guardianDefId)
        if (!def) return false
        const cost = Math.floor(50 * mkRarityMultiplier(def.rarity))
        const state = get()
        if (state.iron < cost) return false
        const stats = mkCalcStats(def, 1)
        const newGuardian: MkGuardianInstance = {
          id: mkGenerateId(),
          guardianDefId,
          name: def.name,
          level: 1,
          xp: 0,
          magneticPower: stats.magneticPower,
          shieldPower: stats.shieldPower,
          chargeSpeed: stats.chargeSpeed,
          charge: 80,
          morale: 80,
          stationedAt: null,
          recruitedAt: Date.now(),
        }
        set((prev) => {
          const updated = {
            guardians: [...prev.guardians, newGuardian],
            iron: prev.iron - cost,
            totalRecruited: prev.totalRecruited + 1,
            prestige: prev.prestige + mkRarityMultiplier(def.rarity) * 5,
            currentTitle: mkCalcMaxTitle(
              prev.prestige + mkRarityMultiplier(def.rarity) * 5,
              prev.guardians.length + 1
            ),
          }
          return updated
        })
        return true
      },

      // ── mkDismissGuardian ──────────────────────────────────────
      mkDismissGuardian: (guardianId: string): boolean => {
        const state = get()
        const exists = state.guardians.find((g) => g.id === guardianId)
        if (!exists) return false
        const def = mkFindGuardianDef(exists.guardianDefId)
        const refund = def ? Math.floor(25 * mkRarityMultiplier(def.rarity)) : 10
        set((prev) => ({
          guardians: prev.guardians.filter((g) => g.id !== guardianId),
          iron: prev.iron + refund,
          currentTitle: mkCalcMaxTitle(prev.prestige, prev.guardians.length - 1),
        }))
        return true
      },

      // ── mkChargeGuardian ───────────────────────────────────────
      mkChargeGuardian: (guardianId: string): boolean => {
        const chargeCost = 10
        const state = get()
        if (state.iron < chargeCost) return false
        set((prev) => {
          const guardians = prev.guardians.map((g) => {
            if (g.id !== guardianId) return g
            const newXp = g.xp + 20
            const xpNeeded = mkXpForLevel(g.level)
            let newLevel = g.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && g.level < MK_MAX_GUARDIAN_LEVEL) {
              newLevel = g.level + 1
              currentXp = newXp - xpNeeded
            }
            const guardianDef = mkFindGuardianDef(g.guardianDefId)
            const stats = guardianDef ? mkCalcStats(guardianDef, newLevel) : { magneticPower: g.magneticPower, shieldPower: g.shieldPower, chargeSpeed: g.chargeSpeed }
            return {
              ...g,
              level: newLevel,
              xp: currentXp,
              magneticPower: stats.magneticPower,
              shieldPower: stats.shieldPower,
              chargeSpeed: stats.chargeSpeed,
              charge: Math.min(100, g.charge + 15),
              morale: Math.min(100, g.morale + 10),
            }
          })
          return { guardians, iron: prev.iron - chargeCost, prestige: prev.prestige + 2 }
        })
        return true
      },

      // ── mkForgeMaterial ───────────────────────────────────────
      mkForgeMaterial: (guardianId: string): boolean => {
        const state = get()
        const guardian = state.guardians.find((g) => g.id === guardianId)
        if (!guardian) return false
        if (guardian.charge < 30) return false
        const def = mkFindGuardianDef(guardian.guardianDefId)
        if (!def) return false
        const materialId = `mat_${def.polarity}_${def.rarity}_essence`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(guardian.magneticPower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalForged: prev.totalForged + 1,
          prestige: prev.prestige + 3,
          guardians: prev.guardians.map((g) =>
            g.id === guardianId ? { ...g, charge: Math.max(0, g.charge - 25) } : g
          ),
        }))
        return true
      },

      // ── mkBuildStructure ───────────────────────────────────────
      mkBuildStructure: (structureDefId: string): boolean => {
        const def = mkFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.iron < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: MkStructureInstance = {
          id: mkGenerateId(),
          structureDefId,
          level: 1,
          builtAt: Date.now(),
        }
        set((prev) => ({
          structures: [...prev.structures, newStructure],
          iron: prev.iron - def.baseCost,
          totalBuilt: prev.totalBuilt + 1,
          prestige: prev.prestige + 10,
        }))
        return true
      },

      // ── mkUpgradeStructure ─────────────────────────────────────
      mkUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= MK_MAX_STRUCTURE_LEVEL) return false
        const def = mkFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = mkCalcStructureUpgradeCost(def, structure.level)
        if (state.iron < cost) return false
        set((prev) => ({
          structures: prev.structures.map((s) =>
            s.id === structureId ? { ...s, level: s.level + 1 } : s
          ),
          iron: prev.iron - cost,
          prestige: prev.prestige + Math.floor(def.effectPerLevel * 2),
        }))
        return true
      },

      // ── mkDefendChamber ────────────────────────────────────────
      mkDefendChamber: (chamberId: string): MkEventDef | null => {
        const chamber = mkFindChamber(chamberId)
        if (!chamber) return null
        const state = get()
        const requiredTitleIdx = MK_TITLES.findIndex((t) => t.id === chamber.requiredTitle)
        const currentTitleIdx = MK_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newChambers = state.chambers.includes(chamberId) ? state.chambers : [...state.chambers, chamberId]
        const event = mkPickRandomEvent()
        set((prev) => ({
          chambers: newChambers,
          activeChamber: chamberId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalSiegesFaced: prev.totalSiegesFaced + 1,
          prestige: prev.prestige + 5,
        }))
        return event
      },

      // ── mkCollectRelic ─────────────────────────────────────────
      mkCollectRelic: (relicId: string): boolean => {
        const relic = mkFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => ({
          relics: [...prev.relics, relicId],
          prestige: prev.prestige + Math.floor(mkRarityMultiplier(relic.rarity) * 20),
          currentTitle: mkCalcMaxTitle(
            prev.prestige + Math.floor(mkRarityMultiplier(relic.rarity) * 20),
            prev.guardians.length
          ),
        }))
        return true
      },

      // ── mkUnlockAbility ────────────────────────────────────────
      mkUnlockAbility: (abilityId: string): boolean => {
        const ability = mkFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * mkRarityMultiplier(ability.rarity))
        if (state.iron < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          iron: prev.iron - cost,
        }))
        return true
      },

      // ── mkUnlockTitle ──────────────────────────────────────────
      mkUnlockTitle: (titleId: MkTitleId): boolean => {
        const title = mkFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.prestige < title.minPrestige) return false
        if (state.guardians.length < title.minGuardians) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── mkClaimAchievement ─────────────────────────────────────
      mkClaimAchievement: (achievementId: string): boolean => {
        const achievement = mkFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!mkCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          iron: prev.iron + achievement.reward.iron,
          prestige: prev.prestige + achievement.reward.prestige,
          currentTitle: mkCalcMaxTitle(
            prev.prestige + achievement.reward.prestige,
            prev.guardians.length
          ),
        }))
        return true
      },

      // ── mkTradeMaterial ────────────────────────────────────────
      mkTradeMaterial: (materialId: string, count: number): number => {
        const material = mkFindMaterial(materialId)
        if (!material) return 0
        const state = get()
        const owned = state.materials.find((m) => m.materialId === materialId)
        if (!owned || owned.count < count) return 0
        const ironEarned = material.value * count
        set((prev) => ({
          materials:
            owned.count - count <= 0
              ? prev.materials.filter((m) => m.materialId !== materialId)
              : prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count - count } : m)),
          iron: prev.iron + ironEarned,
        }))
        return ironEarned
      },

      // ── mkEndEvent ─────────────────────────────────────────────
      mkEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── mkResetEvent ───────────────────────────────────────────
      mkResetEvent: () => {
        const event = mkPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'magnet-keep-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useMagnetKeep()
// ═══════════════════════════════════════════════════════════════════

export default function useMagnetKeep(): MkAPI {
  const store = useMKStore()

  // ── Computed: Owned guardians with def info ───────────────────
  const mkOwnedGuardians = useMemo(() => {
    return store.guardians.map((g) => {
      const def = mkFindGuardianDef(g.guardianDefId)
      return {
        ...g,
        def,
        polarityColor: def ? mkPolarityColor(def.polarity) : '#888888',
        rarityColor: def ? mkRarityColor(def.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available guardian defs to recruit ──────────────
  const mkAvailableGuardians = useMemo(() => {
    return MK_GUARDIANS.filter((gDef) => {
      const cost = Math.floor(50 * mkRarityMultiplier(gDef.rarity))
      return store.iron >= cost
    })
  }, [store])

  // ── Computed: Current title details ───────────────────────────
  const mkCurrentTitleDetail = useMemo(() => {
    return mkFindTitle(store.currentTitle) ?? MK_TITLES[0]
  }, [store])

  // ── Computed: Next title info ─────────────────────────────────
  const mkNextTitle = useMemo(() => {
    const currentIdx = MK_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= MK_TITLES.length - 1) return null
    return MK_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active chamber details ──────────────────────────
  const mkActiveChamberDetail = useMemo(() => {
    if (!store.activeChamber) return null
    return mkFindChamber(store.activeChamber) ?? null
  }, [store])

  // ── Computed: Unexplored chambers ─────────────────────────────
  const mkUnexploredChambers = useMemo(() => {
    return MK_CHAMBERS.filter((c) => !store.chambers.includes(c.id))
  }, [store])

  // ── Computed: Structures with defs ────────────────────────────
  const mkBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = mkFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ────────────────────────────
  const mkUnlockableAbilities = useMemo(() => {
    return MK_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * mkRarityMultiplier(a.rarity))
      return store.iron >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ──────────────────────────
  const mkOwnedRelics = useMemo(() => {
    return store.relics.map((rId) => {
      const def = mkFindRelic(rId)
      return def ?? null
    }).filter((r): r is MkRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────────
  const mkUnclaimedAchievements = useMemo(() => {
    return MK_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return mkCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ─────────────────────────────
  const mkInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = mkFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect bonus ────────────────────
  const mkTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = mkFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average guardian level ──────────────────────────
  const mkAverageGuardianLevel = useMemo(() => {
    if (store.guardians.length === 0) return 0
    const total = store.guardians.reduce((sum, g) => sum + g.level, 0)
    return Math.floor(total / store.guardians.length)
  }, [store])

  // ── Computed: Total guardian power ────────────────────────────
  const mkTotalGuardianPower = useMemo(() => {
    return store.guardians.reduce(
      (sum, g) => sum + g.magneticPower + g.shieldPower + g.chargeSpeed,
      0
    )
  }, [store])

  // ── Computed: Polarity distribution ───────────────────────────
  const mkPolarityDistribution = useMemo(() => {
    const counts: Record<MkPolarityType, number> = {
      north: 0, south: 0, east: 0, west: 0, zenith: 0, nadir: 0, chaos: 0,
    }
    for (const g of store.guardians) {
      const def = mkFindGuardianDef(g.guardianDefId)
      if (def) counts[def.polarity]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ─────────────────────────────
  const mkRarityDistribution = useMemo(() => {
    const counts: Record<MkRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const g of store.guardians) {
      const def = mkFindGuardianDef(g.guardianDefId)
      if (def) counts[def.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Guardians by rarity ─────────────────────────────
  const mkGuardiansByRarity = useMemo(() => {
    const groups: Record<MkRarity, MkGuardianInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const g of store.guardians) {
      const def = mkFindGuardianDef(g.guardianDefId)
      if (def) groups[def.rarity].push(g)
    }
    return groups
  }, [store])

  // ── Computed: Guardians by polarity ───────────────────────────
  const mkGuardiansByPolarity = useMemo(() => {
    const groups: Record<MkPolarityType, MkGuardianInstance[]> = {
      north: [], south: [], east: [], west: [], zenith: [], nadir: [], chaos: [],
    }
    for (const g of store.guardians) {
      const def = mkFindGuardianDef(g.guardianDefId)
      if (def) groups[def.polarity].push(g)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ──────────────────────────
  const mkTitleProgress = useMemo(() => {
    const currentIdx = MK_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= MK_TITLES.length - 1) return { percent: 100, prestigeNeeded: 0, guardiansNeeded: 0 }
    const nextTitle = MK_TITLES[currentIdx + 1]
    const prestigeProgress = Math.min(100, (store.prestige / nextTitle.minPrestige) * 100)
    const guardianProgress = Math.min(100, (store.guardians.length / nextTitle.minGuardians) * 100)
    return {
      percent: Math.floor((prestigeProgress + guardianProgress) / 2),
      prestigeNeeded: Math.max(0, nextTitle.minPrestige - store.prestige),
      guardiansNeeded: Math.max(0, nextTitle.minGuardians - store.guardians.length),
    }
  }, [store])

  // ── Computed: Rare materials count ────────────────────────────
  const mkRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = mkFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Low charge guardians ────────────────────────────
  const mkLowChargeGuardians = useMemo(() => {
    return store.guardians.filter((g) => g.charge < 30)
  }, [store])

  // ── Computed: Low morale guardians ────────────────────────────
  const mkLowMoraleGuardians = useMemo(() => {
    return store.guardians.filter((g) => g.morale < 30)
  }, [store])

  // ── Computed: Total relic boost ───────────────────────────────
  const mkTotalRelicBoost = useMemo(() => {
    let magneticBoost = 0
    let shieldBoost = 0
    let speedBoost = 0
    for (const rId of store.relics) {
      const relic = mkFindRelic(rId)
      if (relic) {
        magneticBoost += relic.magneticBoost
        shieldBoost += relic.shieldBoost
        speedBoost += relic.speedBoost
      }
    }
    return { magneticBoost, shieldBoost, speedBoost }
  }, [store])

  // ── Computed: Stationed guardians by chamber ──────────────────
  const mkStationedGuardians = useMemo(() => {
    const groups: Record<string, MkGuardianInstance[]> = {}
    for (const g of store.guardians) {
      const chamberId = g.stationedAt ?? 'unstationed'
      if (!groups[chamberId]) groups[chamberId] = []
      groups[chamberId].push(g)
    }
    return groups
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return mkAPI object
  // ═════════════════════════════════════════════════════════════

  const mkAPI: MkAPI = {
    // ── Direct constants ──────────────────────────────────────
    MK_MAGNET_RED,
    MK_POLARITY_BLUE,
    MK_IRON_GRAY,
    MK_FORGE_ORANGE,
    MK_LIGHTNING_YELLOW,
    MK_STEEL_SILVER,
    MK_SHIELD_GREEN,
    MK_CRYSTAL_CYAN,
    MK_POLARITIES,
    MK_GUARDIANS,
    MK_CHAMBERS,
    MK_MATERIALS,
    MK_STRUCTURES,
    MK_ABILITIES,
    MK_ACHIEVEMENTS,
    MK_TITLES,
    MK_RELICS,
    MK_EVENTS,
    mkCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    guardians: store.guardians,
    chambers: store.chambers,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    iron: store.iron,
    prestige: store.prestige,
    totalRecruited: store.totalRecruited,
    totalForged: store.totalForged,
    totalBuilt: store.totalBuilt,
    totalSiegesFaced: store.totalSiegesFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeChamber: store.activeChamber,

    // ── Store actions ─────────────────────────────────────────
    mkRecruitGuardian: store.mkRecruitGuardian,
    mkDismissGuardian: store.mkDismissGuardian,
    mkChargeGuardian: store.mkChargeGuardian,
    mkForgeMaterial: store.mkForgeMaterial,
    mkBuildStructure: store.mkBuildStructure,
    mkUpgradeStructure: store.mkUpgradeStructure,
    mkDefendChamber: store.mkDefendChamber,
    mkCollectRelic: store.mkCollectRelic,
    mkUnlockAbility: store.mkUnlockAbility,
    mkUnlockTitle: store.mkUnlockTitle,
    mkClaimAchievement: store.mkClaimAchievement,
    mkTradeMaterial: store.mkTradeMaterial,
    mkEndEvent: store.mkEndEvent,
    mkResetEvent: store.mkResetEvent,

    // ── Computed getters ──────────────────────────────────────
    mkOwnedGuardians,
    mkAvailableGuardians,
    mkCurrentTitleDetail,
    mkNextTitle,
    mkActiveChamberDetail,
    mkUnexploredChambers,
    mkBuiltStructures,
    mkUnlockableAbilities,
    mkOwnedRelics,
    mkUnclaimedAchievements,
    mkInventoryMaterials,
    mkTotalStructureEffect,
    mkAverageGuardianLevel,
    mkTotalGuardianPower,
    mkPolarityDistribution,
    mkRarityDistribution,
    mkGuardiansByRarity,
    mkGuardiansByPolarity,
    mkTitleProgress,
    mkRareMaterialCount,
    mkLowChargeGuardians,
    mkLowMoraleGuardians,
    mkTotalRelicBoost,
    mkStationedGuardians,
  }

  return mkAPI
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: MkAPI RETURN TYPE
// ═══════════════════════════════════════════════════════════════════

export interface MkAPI extends MkFullStore {
  // Color constants
  MK_MAGNET_RED: string
  MK_POLARITY_BLUE: string
  MK_IRON_GRAY: string
  MK_FORGE_ORANGE: string
  MK_LIGHTNING_YELLOW: string
  MK_STEEL_SILVER: string
  MK_SHIELD_GREEN: string
  MK_CRYSTAL_CYAN: string
  // Data constants
  MK_POLARITIES: readonly MkPolarityDef[]
  MK_GUARDIANS: readonly MkGuardianDef[]
  MK_CHAMBERS: readonly MkChamberDef[]
  MK_MATERIALS: readonly MkMaterialDef[]
  MK_STRUCTURES: readonly MkStructureDef[]
  MK_ABILITIES: readonly MkAbilityDef[]
  MK_ACHIEVEMENTS: readonly MkAchievementDef[]
  MK_TITLES: readonly MkTitleDef[]
  MK_RELICS: readonly MkRelicDef[]
  MK_EVENTS: readonly MkEventDef[]
  // Helper
  mkCheckSynergy: (attacker: MkPolarityType, defender: MkPolarityType) => number
  // Computed: owned guardians with defs
  mkOwnedGuardians: (MkGuardianInstance & {
    def: MkGuardianDef | undefined
    polarityColor: string
    rarityColor: string
  })[]
  mkAvailableGuardians: MkGuardianDef[]
  mkCurrentTitleDetail: MkTitleDef
  mkNextTitle: MkTitleDef | null
  mkActiveChamberDetail: MkChamberDef | null
  mkUnexploredChambers: MkChamberDef[]
  mkBuiltStructures: (MkStructureInstance & { def: MkStructureDef | undefined })[]
  mkUnlockableAbilities: MkAbilityDef[]
  mkOwnedRelics: MkRelicDef[]
  mkUnclaimedAchievements: MkAchievementDef[]
  mkInventoryMaterials: ({ materialId: string; count: number } & { def: MkMaterialDef | undefined })[]
  mkTotalStructureEffect: number
  mkAverageGuardianLevel: number
  mkTotalGuardianPower: number
  mkPolarityDistribution: Record<MkPolarityType, number>
  mkRarityDistribution: Record<MkRarity, number>
  mkGuardiansByRarity: Record<MkRarity, MkGuardianInstance[]>
  mkGuardiansByPolarity: Record<MkPolarityType, MkGuardianInstance[]>
  mkTitleProgress: { percent: number; prestigeNeeded: number; guardiansNeeded: number }
  mkRareMaterialCount: number
  mkLowChargeGuardians: MkGuardianInstance[]
  mkLowMoraleGuardians: MkGuardianInstance[]
  mkTotalRelicBoost: { magneticBoost: number; shieldBoost: number; speedBoost: number }
  mkStationedGuardians: Record<string, MkGuardianInstance[]>
}
