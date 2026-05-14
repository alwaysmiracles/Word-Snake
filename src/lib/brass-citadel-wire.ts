/**
 * Brass Citadel Wire — A steampunk mechanical city mini-game feature module
 *
 * Manage a brass citadel, recruit 35 clockwork engineers across 7 disciplines,
 * operate 8 forge chambers, collect 30 brass/steam materials, build 25
 * upgradeable structures, unlock 22 mechanical abilities, discover 15
 * legendary brass inventions, face 12 steam events, and ascend through
 * 8 titles from Brass Apprentice to Clockwork Deity — backed by a
 * Zustand store with persist middleware.
 *
 * Storage key: brass-citadel-wire
 * Prefix: bc / BC_
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type BcDiscipline =
  | 'gearworks'
  | 'steamworks'
  | 'pneumatics'
  | 'electrics'
  | 'hydraulics'
  | 'magnetis'
  | 'clockworks'

export type BcRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type BcTitleId =
  | 'title_brass_apprentice'
  | 'title_cog_initiate'
  | 'title_steam_artificer'
  | 'title_forge_master'
  | 'title_pressure_lord'
  | 'title_brass_sovereign'
  | 'title_gear_emperor'
  | 'title_clockwork_deity'

export interface BcDisciplineDef {
  readonly id: BcDiscipline
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface BcEngineerDef {
  readonly id: string
  readonly name: string
  readonly discipline: BcDiscipline
  readonly rarity: BcRarity
  readonly forgePower: number
  readonly designPower: number
  readonly efficiency: number
  readonly description: string
  readonly abilities: string[]
}

export interface BcEngineerInstance {
  readonly id: string
  engineerDefId: string
  name: string
  level: number
  xp: number
  forgePower: number
  designPower: number
  efficiency: number
  morale: number
  energy: number
  recruitedAt: number
}

export interface BcChamberDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly level: number
  readonly pressureLevel: number
  readonly requiredTitle: BcTitleId
  readonly discipline: BcDiscipline
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface BcMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'ingot' | 'steam' | 'gear' | 'copper' | 'crystal'
  readonly rarity: BcRarity
  readonly forgeBonus: number
  readonly designBonus: number
  readonly value: number
  readonly description: string
}

export interface BcStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'workshop' | 'foundry' | 'lab' | 'turret' | 'vault'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface BcStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface BcAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly discipline: BcDiscipline
  readonly type: 'active' | 'passive'
  readonly rarity: BcRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface BcAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface BcTitleDef {
  readonly id: BcTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minEngineers: number
  readonly description: string
}

export interface BcRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: BcRarity
  readonly discipline: BcDiscipline
  readonly forgeBoost: number
  readonly designBoost: number
  readonly efficiencyBoost: number
  readonly value: number
  readonly description: string
}

export interface BcEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface BcStoreState {
  engineers: BcEngineerInstance[]
  chambers: string[]
  materials: { materialId: string; count: number }[]
  structures: BcStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: BcTitleId
  gold: number
  renown: number
  totalRecruited: number
  totalForged: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: BcEventDef | null
  eventTurnsRemaining: number
  activeChamber: string | null
}

export interface BcStoreActions {
  bcRecruitEngineer: (engineerDefId: string) => boolean
  bcDismissEngineer: (engineerId: string) => boolean
  bcTrainEngineer: (engineerId: string) => boolean
  bcForgeMaterial: (engineerId: string) => boolean
  bcBuildStructure: (structureDefId: string) => boolean
  bcUpgradeStructure: (structureId: string) => boolean
  bcOperateChamber: (chamberId: string) => BcEventDef | null
  bcCollectRelic: (relicId: string) => boolean
  bcUnlockAbility: (abilityId: string) => boolean
  bcUnlockTitle: (titleId: BcTitleId) => boolean
  bcClaimAchievement: (achievementId: string) => boolean
  bcTradeMaterial: (materialId: string, count: number) => number
  bcEndEvent: () => void
  bcResetEvent: () => void
}

export interface BcFullStore extends BcStoreState, BcStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const BC_BRASS_GOLD: string = '#B8860B'
export const BC_COPPER: string = '#B87333'
export const BC_STEAM_WHITE: string = '#F5F5F5'
export const BC_GEAR_GRAY: string = '#696969'
export const BC_FORGE_ORANGE: string = '#FF8C00'
export const BC_OIL_BLACK: string = '#1C1C1C'
export const BC_ARC_BLUE: string = '#00BFFF'
export const BC_VALVE_RED: string = '#CC3333'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: DISCIPLINE DEFINITIONS (7 disciplines)
// ═══════════════════════════════════════════════════════════════════

export const BC_DISCIPLINES: readonly BcDisciplineDef[] = [
  {
    id: 'gearworks',
    name: 'Gearworks',
    color: BC_BRASS_GOLD,
    description:
      'Masters of interlocking gears and clockwork mechanisms. Gearworks engineers build the skeletal framework of all citadel machines.',
  },
  {
    id: 'steamworks',
    name: 'Steamworks',
    color: BC_FORGE_ORANGE,
    description:
      'Engineers who harness the raw power of steam and pressure. They operate boilers, pistons, and the mighty steam engines of the citadel.',
  },
  {
    id: 'pneumatics',
    name: 'Pneumatics',
    color: BC_STEAM_WHITE,
    description:
      'Specialists in compressed air systems and vacuum technology. Pneumatics engineers power the citadel\'s automated delivery tubes and lifts.',
  },
  {
    id: 'electrics',
    name: 'Electrics',
    color: BC_ARC_BLUE,
    description:
      'Pioneers of voltaic arcs, lightning rods, and electromagnetic generators. Electric engineers illuminate the citadel and power its most advanced systems.',
  },
  {
    id: 'hydraulics',
    name: 'Hydraulics',
    color: BC_COPPER,
    description:
      'Experts in fluid power and pressurized pipe networks. Hydraulic engineers control the citadel\'s great gates, lifts, and defense systems.',
  },
  {
    id: 'magnetis',
    name: 'Magnetis',
    color: BC_VALVE_RED,
    description:
      'Disciples of magnetic force and levitation. Magnetis engineers enable floating platforms, ore sorting, and the citadel\'s anti-gravity systems.',
  },
  {
    id: 'clockworks',
    name: 'Clockworks',
    color: BC_GEAR_GRAY,
    description:
      'Artisans of precision timekeeping and automated sequences. Clockwork engineers program the citadel\'s great orrery and schedule every mechanism.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: DISCIPLINE SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const BC_SYNERGY_MAP: Record<BcDiscipline, BcDiscipline[]> = {
  gearworks: ['steamworks', 'clockworks'],
  steamworks: ['hydraulics', 'pneumatics'],
  pneumatics: ['electrics', 'clockworks'],
  electrics: ['magnetis', 'steamworks'],
  hydraulics: ['gearworks', 'magnetis'],
  magnetis: ['electrics', 'gearworks'],
  clockworks: ['pneumatics', 'hydraulics'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: BC_ENGINEERS — 35 Clockwork Engineers (5 per discipline)
// ═══════════════════════════════════════════════════════════════════

export const BC_ENGINEERS: readonly BcEngineerDef[] = [
  // ── Gearworks Engineers (5) ────────────────────────────────────
  {
    id: 'gear_tooth_apprentice',
    name: 'Tooth Apprentice',
    discipline: 'gearworks',
    rarity: 'common',
    forgePower: 12,
    designPower: 10,
    efficiency: 16,
    description:
      'A junior gear-cutter who can fashion basic brass cogs and simple gear trains.',
    abilities: ['gear_cut'],
  },
  {
    id: 'gear_craftsman',
    name: 'Master Gear Craftsman',
    discipline: 'gearworks',
    rarity: 'uncommon',
    forgePower: 28,
    designPower: 22,
    efficiency: 20,
    description:
      'An artisan capable of crafting helical and bevel gears with micron-level precision.',
    abilities: ['gear_cut', 'mesh_align', 'precision_lathe'],
  },
  {
    id: 'gear_autarch',
    name: 'Gear Autarch',
    discipline: 'gearworks',
    rarity: 'rare',
    forgePower: 45,
    designPower: 55,
    efficiency: 26,
    description:
      'A legendary gear-engineer who designed the citadel\'s central differential transmission.',
    abilities: ['gear_cut', 'mesh_align', 'precision_lathe', 'epicyclic_design'],
  },
  {
    id: 'gear_epicyclic_sage',
    name: 'Epicyclic Sage',
    discipline: 'gearworks',
    rarity: 'epic',
    forgePower: 72,
    designPower: 68,
    efficiency: 32,
    description:
      'A sage who mastered the geometry of epicyclic gear trains that no other engineer could comprehend.',
    abilities: ['gear_cut', 'mesh_align', 'precision_lathe', 'epicyclic_design'],
  },
  {
    id: 'gear_eternal_spring',
    name: 'Eternal Spring Artificer',
    discipline: 'gearworks',
    rarity: 'legendary',
    forgePower: 100,
    designPower: 95,
    efficiency: 42,
    description:
      'The mythical engineer who invented the perpetual motion gear train that could power the citadel forever.',
    abilities: ['gear_cut', 'mesh_align', 'precision_lathe', 'epicyclic_design', 'infinite_geartrain'],
  },

  // ── Steamworks Engineers (5) ──────────────────────────────────
  {
    id: 'steam_stoker',
    name: 'Coal Stoker',
    discipline: 'steamworks',
    rarity: 'common',
    forgePower: 14,
    designPower: 8,
    efficiency: 18,
    description:
      'A hardy worker who shovels coal and monitors boiler pressure gauges in the lower levels.',
    abilities: ['coal_shovel'],
  },
  {
    id: 'steam_piston_forger',
    name: 'Piston Forger',
    discipline: 'steamworks',
    rarity: 'uncommon',
    forgePower: 32,
    designPower: 20,
    efficiency: 22,
    description:
      'A forger who builds and repairs massive steam pistons that drive the citadel\'s industrial heart.',
    abilities: ['coal_shovel', 'pressure_regulate', 'piston_craft'],
  },
  {
    id: 'steam_turbine_lord',
    name: 'Turbine Lord',
    discipline: 'steamworks',
    rarity: 'rare',
    forgePower: 52,
    designPower: 42,
    efficiency: 28,
    description:
      'An aristocrat of steam who commands the citadel\'s great turbine hall with an iron fist.',
    abilities: ['coal_shovel', 'pressure_regulate', 'piston_craft', 'turbine_overdrive'],
  },
  {
    id: 'steam_volcano_core',
    name: 'Volcano Core Engineer',
    discipline: 'steamworks',
    rarity: 'epic',
    forgePower: 80,
    designPower: 62,
    efficiency: 34,
    description:
      'An engineer who tapped into geothermal vents beneath the citadel to fuel a miniature volcano engine.',
    abilities: ['coal_shovel', 'pressure_regulate', 'piston_craft', 'turbine_overdrive', 'magma_steam'],
  },
  {
    id: 'steam_aether_prime',
    name: 'Aetheric Prime Mover',
    discipline: 'steamworks',
    rarity: 'legendary',
    forgePower: 115,
    designPower: 100,
    efficiency: 48,
    description:
      'The supreme steam engineer who built the Aetheric Prime Mover — a steam engine of infinite power.',
    abilities: ['coal_shovel', 'pressure_regulate', 'piston_craft', 'turbine_overdrive', 'aether_engine'],
  },

  // ── Pneumatics Engineers (5) ──────────────────────────────────
  {
    id: 'pneu_valve_adjuster',
    name: 'Valve Adjuster',
    discipline: 'pneumatics',
    rarity: 'common',
    forgePower: 10,
    designPower: 16,
    efficiency: 20,
    description:
      'A meticulous technician who calibrates air pressure valves to within a fraction of a psi.',
    abilities: ['tube_seal', 'valve_calibrate'],
  },
  {
    id: 'pneu_bellows_master',
    name: 'Bellows Master',
    discipline: 'pneumatics',
    rarity: 'uncommon',
    forgePower: 22,
    designPower: 32,
    efficiency: 24,
    description:
      'A master of bellows-driven air compression systems used in the citadel\'s blast furnaces.',
    abilities: ['tube_seal', 'valve_calibrate', 'air_compress'],
  },
  {
    id: 'pneu_vacuum_sage',
    name: 'Vacuum Sage',
    discipline: 'pneumatics',
    rarity: 'rare',
    forgePower: 38,
    designPower: 50,
    efficiency: 28,
    description:
      'A philosopher-engineer who harnessed the power of the vacuum to create levitation tubes.',
    abilities: ['tube_seal', 'valve_calibrate', 'air_compress', 'vacuum_levitate'],
  },
  {
    id: 'pneu_atmos_pilot',
    name: 'Atmospheric Pilot',
    discipline: 'pneumatics',
    rarity: 'epic',
    forgePower: 58,
    designPower: 72,
    efficiency: 34,
    description:
      'An elite pilot who commands the citadel\'s pneumatic airships through pressurized skyways.',
    abilities: ['tube_seal', 'valve_calibrate', 'air_compress', 'vacuum_levitate', 'skyway_navigate'],
  },
  {
    id: 'pneu_zephyr_ascendant',
    name: 'Zephyr Ascendant',
    discipline: 'pneumatics',
    rarity: 'legendary',
    forgePower: 92,
    designPower: 108,
    efficiency: 50,
    description:
      'The legendary pneumatic who constructed a perpetual wind engine that fills the citadel\'s sails with endless air.',
    abilities: ['tube_seal', 'valve_calibrate', 'air_compress', 'vacuum_levitate', 'zephyr_infinity'],
  },

  // ── Electrics Engineers (5) ───────────────────────────────────
  {
    id: 'elec_arc_tech',
    name: 'Arc Technician',
    discipline: 'electrics',
    rarity: 'common',
    forgePower: 16,
    designPower: 12,
    efficiency: 18,
    description:
      'A technician who maintains the citadel\'s voltaic arc lamps and lightning rod arrays.',
    abilities: ['coil_wind', 'arc_channel'],
  },
  {
    id: 'elec_dynamo_engineer',
    name: 'Dynamo Engineer',
    discipline: 'electrics',
    rarity: 'uncommon',
    forgePower: 30,
    designPower: 26,
    efficiency: 22,
    description:
      'An engineer who designs and builds dynamos that convert mechanical rotation into electrical current.',
    abilities: ['coil_wind', 'arc_channel', 'dynamo_build'],
  },
  {
    id: 'elec_thunder_forge',
    name: 'Thunder Forger',
    discipline: 'electrics',
    rarity: 'rare',
    forgePower: 48,
    designPower: 42,
    efficiency: 28,
    description:
      'A forger who uses captured lightning to weld brass components with impossible precision.',
    abilities: ['coil_wind', 'arc_channel', 'dynamo_build', 'lightning_weld'],
  },
  {
    id: 'elec_tesla_adept',
    name: 'Tesla Adept',
    discipline: 'electrics',
    rarity: 'epic',
    forgePower: 74,
    designPower: 65,
    efficiency: 35,
    description:
      'An adept who built a miniature Tesla tower that wirelessly powers entire citadel districts.',
    abilities: ['coil_wind', 'arc_channel', 'dynamo_build', 'lightning_weld', 'tesla_broadcast'],
  },
  {
    id: 'elec_omega_conductor',
    name: 'Omega Conductor',
    discipline: 'electrics',
    rarity: 'legendary',
    forgePower: 108,
    designPower: 95,
    efficiency: 48,
    description:
      'The legendary electrician who discovered zero-resistance brass and achieved infinite current flow.',
    abilities: ['coil_wind', 'arc_channel', 'dynamo_build', 'lightning_weld', 'omega_current'],
  },

  // ── Hydraulics Engineers (5) ──────────────────────────────────
  {
    id: 'hydr_pressure_valve',
    name: 'Pressure Valve Master',
    discipline: 'hydraulics',
    rarity: 'common',
    forgePower: 12,
    designPower: 14,
    efficiency: 20,
    description:
      'A master of high-pressure valve systems who prevents catastrophic pipe bursts across the citadel.',
    abilities: ['pipe_join', 'pressure_seal'],
  },
  {
    id: 'hydr_pump_engineer',
    name: 'Pump Engineer',
    discipline: 'hydraulics',
    rarity: 'uncommon',
    forgePower: 24,
    designPower: 28,
    efficiency: 22,
    description:
      'An engineer who designs the massive water pumps that circulate coolant through the forge chambers.',
    abilities: ['pipe_join', 'pressure_seal', 'pump_design'],
  },
  {
    id: 'hydr_aqua_architect',
    name: 'Aqua Architect',
    discipline: 'hydraulics',
    rarity: 'rare',
    forgePower: 42,
    designPower: 48,
    efficiency: 26,
    description:
      'An architect of fluid systems who engineered the citadel\'s grand aqueduct and fountain network.',
    abilities: ['pipe_join', 'pressure_seal', 'pump_design', 'aqua_construct'],
  },
  {
    id: 'hydr_titan_flow',
    name: 'Titan Flow Master',
    discipline: 'hydraulics',
    rarity: 'epic',
    forgePower: 62,
    designPower: 70,
    efficiency: 32,
    description:
      'A master who controls the citadel\'s massive hydraulic gates that can hold back a flood or drain a lake.',
    abilities: ['pipe_join', 'pressure_seal', 'pump_design', 'aqua_construct', 'titan_gate'],
  },
  {
    id: 'hydr_abyss_engineer',
    name: 'Abyssal Flow Deity',
    discipline: 'hydraulics',
    rarity: 'legendary',
    forgePower: 98,
    designPower: 105,
    efficiency: 45,
    description:
      'The mythical hydraulic deity who plumbed the deep-earth reservoirs and brought infinite water to the citadel.',
    abilities: ['pipe_join', 'pressure_seal', 'pump_design', 'aqua_construct', 'abyssal_flow'],
  },

  // ── Magnetis Engineers (5) ────────────────────────────────────
  {
    id: 'mag_compass_maker',
    name: 'Compass Maker',
    discipline: 'magnetis',
    rarity: 'common',
    forgePower: 10,
    designPower: 18,
    efficiency: 18,
    description:
      'A maker of precision compasses used for navigation and ore detection throughout the citadel mines.',
    abilities: ['stone_polish', 'compass_calibrate'],
  },
  {
    id: 'mag_lev_engineer',
    name: 'Levitation Engineer',
    discipline: 'magnetis',
    rarity: 'uncommon',
    forgePower: 22,
    designPower: 35,
    efficiency: 24,
    description:
      'An engineer who designed the citadel\'s magnetic levitation platforms for cargo transport.',
    abilities: ['stone_polish', 'compass_calibrate', 'mag_levitate'],
  },
  {
    id: 'mag_ore_sovereign',
    name: 'Ore Sovereign',
    discipline: 'magnetis',
    rarity: 'rare',
    forgePower: 40,
    designPower: 52,
    efficiency: 28,
    description:
      'A sovereign of magnetic ore separation who can extract pure brass from the crudest slag.',
    abilities: ['stone_polish', 'compass_calibrate', 'mag_levitate', 'ore_purify'],
  },
  {
    id: 'mag_field_general',
    name: 'Field General',
    discipline: 'magnetis',
    rarity: 'epic',
    forgePower: 58,
    designPower: 70,
    efficiency: 34,
    description:
      'A general who commands magnetic force fields that protect the citadel from incoming projectiles.',
    abilities: ['stone_polish', 'compass_calibrate', 'mag_levitate', 'ore_purify', 'force_field'],
  },
  {
    id: 'mag_monopole_deity',
    name: 'Monopole Deity',
    discipline: 'magnetis',
    rarity: 'legendary',
    forgePower: 95,
    designPower: 100,
    efficiency: 48,
    description:
      'The mythical being who discovered the magnetic monopole and harnessed infinite directional force.',
    abilities: ['stone_polish', 'compass_calibrate', 'mag_levitate', 'ore_purify', 'monopole_ascend'],
  },

  // ── Clockworks Engineers (5) ──────────────────────────────────
  {
    id: 'clock_escapement',
    name: 'Escapement Maker',
    discipline: 'clockworks',
    rarity: 'common',
    forgePower: 8,
    designPower: 20,
    efficiency: 22,
    description:
      'A maker of escapement mechanisms that regulate the release of energy in all citadel timepieces.',
    abilities: ['spring_wind', 'escapement_craft'],
  },
  {
    id: 'clock_automaton_maker',
    name: 'Automaton Maker',
    discipline: 'clockworks',
    rarity: 'uncommon',
    forgePower: 18,
    designPower: 38,
    efficiency: 24,
    description:
      'A maker of clockwork automatons that perform repetitive tasks throughout the citadel workshops.',
    abilities: ['spring_wind', 'escapement_craft', 'automaton_build'],
  },
  {
    id: 'clock_orrery_master',
    name: 'Orrery Master',
    discipline: 'clockworks',
    rarity: 'rare',
    forgePower: 32,
    designPower: 55,
    efficiency: 28,
    description:
      'The master who built the citadel\'s great mechanical orrery — a clockwork model of the entire solar system.',
    abilities: ['spring_wind', 'escapement_craft', 'automaton_build', 'orrery_program'],
  },
  {
    id: 'clock_temporal_sage',
    name: 'Temporal Sage',
    discipline: 'clockworks',
    rarity: 'epic',
    forgePower: 50,
    designPower: 75,
    efficiency: 35,
    description:
      'A sage who discovered how to slow and speed local time using precisely tuned clockwork fields.',
    abilities: ['spring_wind', 'escapement_craft', 'automaton_build', 'orrery_program', 'time_dilate'],
  },
  {
    id: 'clock_chronos_deity',
    name: 'Chronos Prime Mechanism',
    discipline: 'clockworks',
    rarity: 'legendary',
    forgePower: 88,
    designPower: 115,
    efficiency: 52,
    description:
      'The mythical clockwork deity who built the Chronos Prime — a mechanism that can stop time itself.',
    abilities: ['spring_wind', 'escapement_craft', 'automaton_build', 'orrery_program', 'chronos_prime'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: BC_CHAMBERS — 8 Forge Chambers
// ═══════════════════════════════════════════════════════════════════

export const BC_CHAMBERS: readonly BcChamberDef[] = [
  {
    id: 'chamber_copper_forge',
    name: 'Copper Forge',
    description:
      'The entry-level forge where raw copper is smelted and shaped into basic components for the citadel.',
    level: 0,
    pressureLevel: 1,
    requiredTitle: 'title_brass_apprentice',
    discipline: 'gearworks',
    bgGradient: 'linear-gradient(180deg, #B87333 0%, #B8860B 50%, #1C1C1C 100%)',
    ambientColor: BC_COPPER,
  },
  {
    id: 'chamber_brass_foundry',
    name: 'Brass Foundry',
    description:
      'A grand foundry where copper and zinc are alloyed into gleaming brass under extreme heat.',
    level: 1,
    pressureLevel: 2,
    requiredTitle: 'title_brass_apprentice',
    discipline: 'steamworks',
    bgGradient: 'linear-gradient(180deg, #B8860B 0%, #FF8C00 50%, #1C1C1C 100%)',
    ambientColor: BC_BRASS_GOLD,
  },
  {
    id: 'chamber_steam_vault',
    name: 'Steam Vault',
    description:
      'A sealed vault filled with pressurized steam pipes that power the citadel\'s lower mechanisms.',
    level: 2,
    pressureLevel: 3,
    requiredTitle: 'title_cog_initiate',
    discipline: 'hydraulics',
    bgGradient: 'linear-gradient(180deg, #F5F5F5 0%, #696969 50%, #B87333 100%)',
    ambientColor: BC_STEAM_WHITE,
  },
  {
    id: 'chamber_arc_reactor',
    name: 'Arc Reactor Hall',
    description:
      'A towering hall where voltaic arcs crackle between brass electrodes, generating immense electrical power.',
    level: 3,
    pressureLevel: 4,
    requiredTitle: 'title_steam_artificer',
    discipline: 'electrics',
    bgGradient: 'linear-gradient(180deg, #00BFFF 0%, #1C1C1C 50%, #B8860B 100%)',
    ambientColor: BC_ARC_BLUE,
  },
  {
    id: 'chamber_pressure_crucible',
    name: 'Pressure Crucible',
    description:
      'An ultra-high-pressure chamber where materials are compressed into denser, stronger alloys.',
    level: 4,
    pressureLevel: 5,
    requiredTitle: 'title_forge_master',
    discipline: 'pneumatics',
    bgGradient: 'linear-gradient(180deg, #CC3333 0%, #FF8C00 50%, #B8860B 100%)',
    ambientColor: BC_VALVE_RED,
  },
  {
    id: 'chamber_magnetic_anvil',
    name: 'Magnetic Anvil',
    description:
      'A chamber built around a massive lodestone anvil where magnetic fields shape molten metal without touch.',
    level: 5,
    pressureLevel: 6,
    requiredTitle: 'title_pressure_lord',
    discipline: 'magnetis',
    bgGradient: 'linear-gradient(180deg, #CC3333 0%, #00BFFF 50%, #1C1C1C 100%)',
    ambientColor: BC_VALVE_RED,
  },
  {
    id: 'chamber_clockwork_sanctum',
    name: 'Clockwork Sanctum',
    description:
      'A sacred sanctum filled with a billion interlocking gears that track the movements of every mechanism in the citadel.',
    level: 6,
    pressureLevel: 7,
    requiredTitle: 'title_brass_sovereign',
    discipline: 'clockworks',
    bgGradient: 'linear-gradient(180deg, #696969 0%, #B8860B 50%, #F5F5F5 100%)',
    ambientColor: BC_GEAR_GRAY,
  },
  {
    id: 'chamber_omega_forge',
    name: 'Omega Forge',
    description:
      'The mythical heart of the citadel where all disciplines converge to forge legendary brass inventions of impossible power.',
    level: 7,
    pressureLevel: 8,
    requiredTitle: 'title_gear_emperor',
    discipline: 'gearworks',
    bgGradient: 'linear-gradient(180deg, #B8860B 0%, #FF8C00 50%, #00BFFF 100%)',
    ambientColor: BC_BRASS_GOLD,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: BC_MATERIALS — 30 Brass/Steam Materials
// ═══════════════════════════════════════════════════════════════════

export const BC_MATERIALS: readonly BcMaterialDef[] = [
  // Common (8)
  { id: 'mat_raw_copper', name: 'Raw Copper Ore', emoji: '🟤', type: 'copper', rarity: 'common', forgeBonus: 2, designBonus: 1, value: 10, description: 'Unrefined copper nuggets dug from the mines beneath the citadel.' },
  { id: 'mat_brass_dust', name: 'Brass Dust', emoji: '✨', type: 'ingot', rarity: 'common', forgeBonus: 3, designBonus: 2, value: 12, description: 'Fine brass particles left over from grinding and polishing operations.' },
  { id: 'mat_coal_lump', name: 'Coal Lump', emoji: '⚫', type: 'steam', rarity: 'common', forgeBonus: 4, designBonus: 0, value: 8, description: 'A chunk of bituminous coal for feeding the citadel\'s hungry boilers.' },
  { id: 'mat_small_gear', name: 'Small Gear', emoji: '⚙️', type: 'gear', rarity: 'common', forgeBonus: 1, designBonus: 3, value: 14, description: 'A basic brass gear with 12 teeth. The backbone of simple machines.' },
  { id: 'mat_copper_wire', name: 'Copper Wire Spool', emoji: '🔗', type: 'copper', rarity: 'common', forgeBonus: 2, designBonus: 4, value: 15, description: 'A spool of thin copper wire for electrical connections and coil winding.' },
  { id: 'mat_steam_condensate', name: 'Steam Condensate', emoji: '💧', type: 'steam', rarity: 'common', forgeBonus: 3, designBonus: 1, value: 10, description: 'Pure water condensed from the citadel\'s steam pipes. Useful for cooling systems.' },
  { id: 'mat_rivets', name: 'Brass Rivets', emoji: '📌', type: 'ingot', rarity: 'common', forgeBonus: 2, designBonus: 2, value: 9, description: 'A handful of standard brass rivets for joining metal plates.' },
  { id: 'mat_spring_coil', name: 'Spring Coil', emoji: '🌀', type: 'gear', rarity: 'common', forgeBonus: 1, designBonus: 5, value: 18, description: 'A tension spring coiled from tempered brass wire. Essential for clockwork mechanisms.' },

  // Uncommon (7)
  { id: 'mat_refined_brass', name: 'Refined Brass Ingot', emoji: '🥇', type: 'ingot', rarity: 'uncommon', forgeBonus: 8, designBonus: 5, value: 75, description: 'A purified brass ingot free of impurities. The standard material for quality components.' },
  { id: 'mat_pressure_gauge', name: 'Precision Pressure Gauge', emoji: '📏', type: 'steam', rarity: 'uncommon', forgeBonus: 5, designBonus: 10, value: 80, description: 'A finely calibrated brass pressure gauge. Essential for high-pressure operations.' },
  { id: 'mat_copper_plate', name: 'Copper Plate', emoji: '🟫', type: 'copper', rarity: 'uncommon', forgeBonus: 6, designBonus: 6, value: 70, description: 'A flat sheet of hammered copper for armor plating and circuit boards.' },
  { id: 'mat_clockwork_escapement', name: 'Clockwork Escapement', emoji: '⏱️', type: 'gear', rarity: 'uncommon', forgeBonus: 4, designBonus: 12, value: 85, description: 'A precision escapement mechanism that regulates the release of stored energy.' },
  { id: 'mat_arc_shard', name: 'Arc Shard', emoji: '⚡', type: 'crystal', rarity: 'uncommon', forgeBonus: 10, designBonus: 4, value: 90, description: 'A crystal shard infused with captured electrical energy. Glows faintly blue.' },
  { id: 'mat_steam_crystal', name: 'Steam Crystal', emoji: '💎', type: 'crystal', rarity: 'uncommon', forgeBonus: 7, designBonus: 8, value: 78, description: 'A crystal formed from superheated steam under immense pressure.' },
  { id: 'mat_helical_gear', name: 'Helical Gear', emoji: '🔧', type: 'gear', rarity: 'uncommon', forgeBonus: 6, designBonus: 10, value: 82, description: 'A precision-cut helical gear that transfers motion between non-parallel shafts.' },

  // Rare (6)
  { id: 'mat_molten_brass_core', name: 'Molten Brass Core', emoji: '🌋', type: 'ingot', rarity: 'rare', forgeBonus: 25, designBonus: 10, value: 350, description: 'A sphere of semi-molten brass kept perpetually liquid by an internal heat source.' },
  { id: 'mat_tesla_coil_rod', name: 'Tesla Coil Rod', emoji: '🔌', type: 'crystal', rarity: 'rare', forgeBonus: 15, designBonus: 20, value: 380, description: 'A brass rod from a dismantled Tesla coil. It crackles with residual charge.' },
  { id: 'mat_pressure_diamond', name: 'Pressure Diamond', emoji: '💠', type: 'crystal', rarity: 'rare', forgeBonus: 10, designBonus: 25, value: 400, description: 'A diamond formed in the pressure crucible. Unbreakable and perfectly transparent.' },
  { id: 'mat_epicyclic_assembly', name: 'Epicyclic Gear Assembly', emoji: '☀️', type: 'gear', rarity: 'rare', forgeBonus: 20, designBonus: 22, value: 360, description: 'A complete epicyclic gear train that can multiply torque tenfold.' },
  { id: 'mat_magnetic_ore_pure', name: 'Pure Magnetic Ore', emoji: '🧲', type: 'copper', rarity: 'rare', forgeBonus: 18, designBonus: 18, value: 340, description: 'Ore of extraordinary magnetic purity. A single gram can lift a hundredweight.' },
  { id: 'mat_superheated_steam', name: 'Superheated Steam Vial', emoji: '🫧', type: 'steam', rarity: 'rare', forgeBonus: 28, designBonus: 8, value: 370, description: 'A sealed vial of steam heated beyond normal limits. Handle with extreme caution.' },

  // Epic (5)
  { id: 'mat_aetheric_brass', name: 'Aetheric Brass Ingot', emoji: '🌟', type: 'ingot', rarity: 'epic', forgeBonus: 50, designBonus: 30, value: 1500, description: 'Brass infused with aetheric energy. It glows with an inner golden light and never tarnishes.' },
  { id: 'mat_lightning_crystal', name: 'Lightning Crystal', emoji: '⛈️', type: 'crystal', rarity: 'epic', forgeBonus: 30, designBonus: 45, value: 1600, description: 'A crystal that contains a captured bolt of lightning. It pulses with raw power.' },
  { id: 'mat_perpetual_gear', name: 'Perpetual Motion Gear', emoji: '♾️', type: 'gear', rarity: 'epic', forgeBonus: 35, designBonus: 50, value: 1700, description: 'A gear that rotates forever without external power. The holy grail of gearworks.' },
  { id: 'mat_zero_point_steam', name: 'Zero-Point Steam', emoji: '🌀', type: 'steam', rarity: 'epic', forgeBonus: 45, designBonus: 35, value: 1550, description: 'Steam that exists in a quantum superposition of hot and cold. Violates thermodynamic law.' },
  { id: 'mat_infinite_copper', name: 'Infinite Copper Wire', emoji: '🔗', type: 'copper', rarity: 'epic', forgeBonus: 25, designBonus: 55, value: 1650, description: 'A spool of copper wire that never runs out. Coiled from a single crystal of impossible length.' },

  // Legendary (4)
  { id: 'mat_chronos_ingot', name: 'Chronos Brass Ingot', emoji: '⏳', type: 'ingot', rarity: 'legendary', forgeBonus: 80, designBonus: 70, value: 8000, description: 'A brass ingot from outside of time. It exists simultaneously in all eras of the citadel.' },
  { id: 'mat_omega_crystal', name: 'Omega Crystal', emoji: '🔮', type: 'crystal', rarity: 'legendary', forgeBonus: 70, designBonus: 80, value: 9000, description: 'The ultimate crystal, containing the concentrated essence of all seven disciplines.' },
  { id: 'mat_celestial_gear', name: 'Celestial Gear', emoji: '🌌', type: 'gear', rarity: 'legendary', forgeBonus: 90, designBonus: 90, value: 10000, description: 'A gear that meshes with the machinery of the cosmos itself. Turning it moves the stars.' },
  { id: 'mat_void_steam', name: 'Void Steam Essence', emoji: '🕳️', type: 'steam', rarity: 'legendary', forgeBonus: 60, designBonus: 60, value: 11000, description: 'Steam drawn from the void between dimensions. It powers engines that bend reality.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: BC_STRUCTURES — 25 Upgradeable Structures
// ═══════════════════════════════════════════════════════════════════

export const BC_STRUCTURES: readonly BcStructureDef[] = [
  // ── Workshops (7) ─────────────────────────────────────────────
  { id: 'str_gear_workshop', name: 'Gear Cutting Workshop', emoji: '⚙️', category: 'workshop', maxLevel: 10, baseEffect: 3, effectPerLevel: 2, baseCost: 50, costMultiplier: 1.4, description: 'A workshop equipped with precision gear-cutting lathes and milling machines.' },
  { id: 'str_steam_bay', name: 'Steam Engine Bay', emoji: '🏭', category: 'workshop', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 80, costMultiplier: 1.5, description: 'A large bay for assembling and testing steam engines of various sizes.' },
  { id: 'str_air_lab', name: 'Pneumatic Air Lab', emoji: '💨', category: 'workshop', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 75, costMultiplier: 1.5, description: 'A laboratory for experimenting with compressed air and vacuum systems.' },
  { id: 'str_arc_lab', name: 'Arc Lightning Lab', emoji: '⚡', category: 'workshop', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A reinforced lab where electrical experiments can be conducted safely.' },
  { id: 'str_flow_station', name: 'Hydraulic Flow Station', emoji: '🚰', category: 'workshop', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 70, costMultiplier: 1.4, description: 'A station for designing and testing hydraulic pipe networks and pumps.' },
  { id: 'str_mag_lab', name: 'Magnetic Research Lab', emoji: '🧲', category: 'workshop', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 110, costMultiplier: 1.5, description: 'A lab shielded from external magnetic fields for pure magnetic research.' },
  { id: 'str_clock_tower', name: 'Clock Tower Workshop', emoji: '🗼', category: 'workshop', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 90, costMultiplier: 1.5, description: 'A tall workshop in the clock tower where timekeeping mechanisms are assembled.' },

  // ── Foundries (6) ─────────────────────────────────────────────
  { id: 'str_copper_smelter', name: 'Copper Smelter', emoji: '🔥', category: 'foundry', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A smelter that refines raw copper ore into pure, workable copper.' },
  { id: 'str_brass_alloy_forge', name: 'Brass Alloy Forge', emoji: '🔨', category: 'foundry', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.6, description: 'A forge where copper and zinc are combined to create alloys of varying brass grades.' },
  { id: 'str_crystal_grower', name: 'Crystal Growth Chamber', emoji: '💎', category: 'foundry', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 350, costMultiplier: 1.7, description: 'A chamber where steam crystals and arc shards are grown under controlled conditions.' },
  { id: 'str_pressure_forge', name: 'High-Pressure Forge', emoji: '💥', category: 'foundry', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 550, costMultiplier: 1.8, description: 'A forge that uses extreme pressure to fuse metals into ultra-strong alloys.' },
  { id: 'str_magma_crucible', name: 'Magma Crucible', emoji: '🌋', category: 'foundry', maxLevel: 10, baseEffect: 18, effectPerLevel: 9, baseCost: 800, costMultiplier: 1.9, description: 'A crucible that channels geothermal heat to melt even the most refractory metals.' },
  { id: 'str_aether_forge', name: 'Aetheric Forge', emoji: '✨', category: 'foundry', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1200, costMultiplier: 2.0, description: 'The ultimate forge, fueled by aetheric energy. It can forge materials that defy physics.' },

  // ── Labs (5) ──────────────────────────────────────────────────
  { id: 'str_alchemy_bench', name: 'Brass Alchemy Bench', emoji: '⚗️', category: 'lab', maxLevel: 10, baseEffect: 6, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A bench for experimenting with brass alloys and metallurgical transmutation.' },
  { id: 'str_calculus_engine', name: 'Calculus Engine', emoji: '🧮', category: 'lab', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'A mechanical computer that solves complex engineering equations.' },
  { id: 'str_blueprint_archive', name: 'Blueprint Archive', emoji: '📜', category: 'lab', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A vast archive storing blueprints for every structure and invention in the citadel.' },
  { id: 'str_simulator', name: 'Steam Simulator Bay', emoji: '🖥️', category: 'lab', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.8, description: 'A bay where steam-powered simulators test designs before physical construction.' },
  { id: 'str_discovery_lab', name: 'Discovery Laboratory', emoji: '🔬', category: 'lab', maxLevel: 10, baseEffect: 20, effectPerLevel: 10, baseCost: 900, costMultiplier: 1.9, description: 'The most advanced lab, where new materials and mechanisms are first theorized and tested.' },

  // ── Turrets (4) ───────────────────────────────────────────────
  { id: 'str_brass_cannon', name: 'Brass Cannon Turret', emoji: '💣', category: 'turret', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 200, costMultiplier: 1.5, description: 'A brass cannon mounted on a rotating turret to defend the citadel walls.' },
  { id: 'str_arc_emitter', name: 'Arc Emitter Array', emoji: '⚡', category: 'turret', maxLevel: 10, baseEffect: 16, effectPerLevel: 8, baseCost: 400, costMultiplier: 1.7, description: 'An array of voltaic arc emitters that can fry incoming threats at range.' },
  { id: 'str_missile_silo', name: 'Steam Missile Silo', emoji: '🚀', category: 'turret', maxLevel: 10, baseEffect: 22, effectPerLevel: 10, baseCost: 700, costMultiplier: 1.8, description: 'An underground silo that launches steam-powered missiles at approaching enemies.' },
  { id: 'str_omega_beam', name: 'Omega Defense Beam', emoji: '🔮', category: 'turret', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 1500, costMultiplier: 2.0, description: 'The ultimate defense — a beam that combines all seven disciplines into an unstoppable force.' },

  // ── Vaults (3) ────────────────────────────────────────────────
  { id: 'str_component_vault', name: 'Component Vault', emoji: '🗄️', category: 'vault', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 150, costMultiplier: 1.5, description: 'A secure vault for storing valuable brass components and rare materials.' },
  { id: 'str_relic_chamber', name: 'Relic Chamber', emoji: '🔒', category: 'vault', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 500, costMultiplier: 1.7, description: 'A magically sealed chamber that preserves and amplifies legendary brass relics.' },
  { id: 'str_infinity_vault', name: 'Infinity Vault', emoji: '♾️', category: 'vault', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 2000, costMultiplier: 2.0, description: 'A vault outside normal space-time. Items placed within it are preserved for eternity.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: BC_ABILITIES — 22 Mechanical Abilities
// ═══════════════════════════════════════════════════════════════════

export const BC_ABILITIES: readonly BcAbilityDef[] = [
  { id: 'ab_gear_cut', name: 'Precision Gear Cut', emoji: '⚙️', discipline: 'gearworks', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Cut a perfect gear from raw brass stock with a single stroke of the lathe.' },
  { id: 'ab_pressure_regulate', name: 'Pressure Regulate', emoji: '🚿', discipline: 'steamworks', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Instantly adjust all pressure valves in a chamber to optimal levels.' },
  { id: 'ab_tube_seal', name: 'Emergency Tube Seal', emoji: '🔧', discipline: 'pneumatics', type: 'active', rarity: 'common', energyCost: 6, cooldown: 35, power: 12, description: 'Seal a ruptured pneumatic tube before pressure is lost.' },
  { id: 'ab_coil_wind', name: 'Coil Wind', emoji: '🔌', discipline: 'electrics', type: 'active', rarity: 'common', energyCost: 7, cooldown: 40, power: 18, description: 'Wind a perfect electromagnetic coil in seconds, boosting nearby electrical systems.' },
  { id: 'ab_pipe_join', name: 'Pipe Join', emoji: '🔗', discipline: 'hydraulics', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 14, description: 'Weld two hydraulic pipes together with a flawless pressure-tight seal.' },
  { id: 'ab_stone_polish', name: 'Lodestone Polish', emoji: '🧲', discipline: 'magnetis', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 10, description: 'Polish a lodestone to amplify its magnetic field by a factor of ten.' },
  { id: 'ab_spring_wind', name: 'Spring Wind', emoji: '🌀', discipline: 'clockworks', type: 'active', rarity: 'common', energyCost: 4, cooldown: 25, power: 12, description: 'Wind a mainspring to full tension, releasing stored mechanical energy.' },
  { id: 'ab_mesh_align', name: 'Mesh Alignment', emoji: '⚙️', discipline: 'gearworks', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Align all gears in a mechanism simultaneously, eliminating friction and wear.' },
  { id: 'ab_piston_craft', name: 'Piston Craft', emoji: '🏭', discipline: 'steamworks', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 90, power: 35, description: 'Craft a high-performance piston that doubles steam engine output.' },
  { id: 'ab_air_compress', name: 'Air Compress', emoji: '💨', discipline: 'pneumatics', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Compress air to extreme pressures in a single chamber, enabling powerful pneumatic actuation.' },
  { id: 'ab_arc_channel', name: 'Arc Channel', emoji: '⚡', discipline: 'electrics', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 55, power: 30, description: 'Channel a voltaic arc through a series of brass electrodes to power distant systems.' },
  { id: 'ab_pressure_seal', name: 'Pressure Seal', emoji: '🚰', discipline: 'hydraulics', type: 'active', rarity: 'uncommon', energyCost: 14, cooldown: 60, power: 25, description: 'Create an emergency pressure seal that can hold back catastrophic pipe failures.' },
  { id: 'ab_compass_calibrate', name: 'Compass Calibrate', emoji: '🧭', discipline: 'magnetis', type: 'active', rarity: 'uncommon', energyCost: 12, cooldown: 50, power: 22, description: 'Calibrate all compasses and magnetic instruments in the citadel to true north.' },
  { id: 'ab_escapement_craft', name: 'Escapement Craft', emoji: '⏱️', discipline: 'clockworks', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 65, power: 28, description: 'Craft a precision escapement that makes any clockwork mechanism perfectly accurate.' },
  { id: 'ab_precision_lathe', name: 'Precision Lathe', emoji: '🔧', discipline: 'gearworks', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Operate a precision lathe to machine components to within a micron of tolerance.' },
  { id: 'ab_turbine_overdrive', name: 'Turbine Overdrive', emoji: '🌀', discipline: 'steamworks', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Push a steam turbine beyond its rated capacity for a devastating burst of power.' },
  { id: 'ab_vacuum_levitate', name: 'Vacuum Levitate', emoji: '🫧', discipline: 'pneumatics', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 110, power: 45, description: 'Create a vacuum cushion that levitates heavy objects for effortless transport.' },
  { id: 'ab_lightning_weld', name: 'Lightning Weld', emoji: '⛈️', discipline: 'electrics', type: 'active', rarity: 'rare', energyCost: 32, cooldown: 130, power: 52, description: 'Use a captured lightning bolt to weld brass components with supernatural strength.' },
  { id: 'ab_aqua_construct', name: 'Aqua Construct', emoji: '🌊', discipline: 'hydraulics', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 120, power: 48, description: 'Rearrange the citadel\'s water systems to create new hydraulic structures instantly.' },
  { id: 'ab_dynamo_build', name: 'Dynamo Build', emoji: '💡', discipline: 'electrics', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Passively generates electrical energy from mechanical motion in nearby systems.' },
  { id: 'ab_ore_purify', name: 'Ore Purify', emoji: '💎', discipline: 'magnetis', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 120, power: 45, description: 'Use powerful magnetic fields to extract pure metals from raw ore with zero waste.' },
  { id: 'ab_time_dilate', name: 'Time Dilation', emoji: '⏳', discipline: 'clockworks', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Slow time in a localized area, allowing engineers to work at impossible speeds.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: BC_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const BC_ACHIEVEMENTS: readonly BcAchievementDef[] = [
  { id: 'ach_first_recruit', name: 'First Recruitment', emoji: '⚙️', description: 'Recruit your first clockwork engineer.', condition: 'recruit_1', reward: { gold: 50, renown: 10 } },
  { id: 'ach_five_recruits', name: 'Engineering Corps', emoji: '🤚', description: 'Recruit 5 different engineers.', condition: 'recruit_5', reward: { gold: 200, renown: 40 } },
  { id: 'ach_first_forge', name: 'First Forging', emoji: '🔨', description: 'Forge material for the first time.', condition: 'forge_1', reward: { gold: 80, renown: 15 } },
  { id: 'ach_ten_forges', name: 'Master Forger', emoji: '⚒️', description: 'Forge materials 10 times.', condition: 'forge_10', reward: { gold: 300, renown: 60 } },
  { id: 'ach_first_build', name: 'Groundbreaking', emoji: '🏗️', description: 'Build your first citadel structure.', condition: 'build_1', reward: { gold: 100, renown: 20 } },
  { id: 'ach_five_builds', name: 'Citadel Architect', emoji: '🏛️', description: 'Build 5 different citadel structures.', condition: 'build_5', reward: { gold: 500, renown: 80 } },
  { id: 'ach_chamber_explore', name: 'Chamber Explorer', emoji: '🗺️', description: 'Operate 4 different forge chambers.', condition: 'chamber_4', reward: { gold: 400, renown: 50 } },
  { id: 'ach_all_chambers', name: 'Chamber Cartographer', emoji: '🌍', description: 'Operate all 8 forge chambers.', condition: 'chamber_8', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_rare_recruit', name: 'Rare Talent', emoji: '💎', description: 'Recruit a rare engineer.', condition: 'rare_recruit', reward: { gold: 500, renown: 100 } },
  { id: 'ach_epic_recruit', name: 'Epic Discovery', emoji: '🌟', description: 'Recruit an epic engineer.', condition: 'epic_recruit', reward: { gold: 1500, renown: 250 } },
  { id: 'ach_legendary_recruit', name: 'Legendary Engineer', emoji: '👑', description: 'Recruit a legendary engineer.', condition: 'legendary_recruit', reward: { gold: 5000, renown: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first legendary brass invention.', condition: 'relic_1', reward: { gold: 300, renown: 60 } },
  { id: 'ach_five_relics', name: 'Relic Collector', emoji: '🔍', description: 'Collect 5 different brass inventions.', condition: 'relic_5', reward: { gold: 1000, renown: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first steam event.', condition: 'event_1', reward: { gold: 200, renown: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 steam events.', condition: 'event_10', reward: { gold: 800, renown: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_all_disciplines', name: 'Disciplinary Master', emoji: '🌈', description: 'Recruit at least one engineer of each discipline.', condition: 'all_disciplines', reward: { gold: 3000, renown: 300 } },
  { id: 'ach_max_title', name: 'Clockwork Deity', emoji: '👑', description: 'Reach the title of Clockwork Deity.', condition: 'max_title', reward: { gold: 10000, renown: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: BC_TITLES — 8 Titles
// ═══════════════════════════════════════════════════════════════════

export const BC_TITLES: readonly BcTitleDef[] = [
  { id: 'title_brass_apprentice', name: 'Brass Apprentice', emoji: '🔧', minRenown: 0, minEngineers: 0, description: 'A novice who has just begun learning the ways of brass and steam.' },
  { id: 'title_cog_initiate', name: 'Cog Initiate', emoji: '⚙️', minRenown: 50, minEngineers: 3, description: 'An initiate who understands the basic principles of gear mechanics and steam power.' },
  { id: 'title_steam_artificer', name: 'Steam Artificer', emoji: '🏭', minRenown: 200, minEngineers: 7, description: 'A skilled artificer who can build functioning steam-powered machines from scratch.' },
  { id: 'title_forge_master', name: 'Forge Master', emoji: '🔨', minRenown: 500, minEngineers: 12, description: 'A master of the forge who commands the respect of every engineer in the citadel.' },
  { id: 'title_pressure_lord', name: 'Pressure Lord', emoji: '💨', minRenown: 1200, minEngineers: 18, description: 'A lord of pressure systems who controls the flow of steam and air through the entire citadel.' },
  { id: 'title_brass_sovereign', name: 'Brass Sovereign', emoji: '👑', minRenown: 2500, minEngineers: 24, description: 'A sovereign ruler of the citadel whose word shapes the direction of all engineering efforts.' },
  { id: 'title_gear_emperor', name: 'Gear Emperor', emoji: '🐲', minRenown: 5000, minEngineers: 30, description: 'An emperor whose mechanical legions and steam armies are feared across the land.' },
  { id: 'title_clockwork_deity', name: 'Clockwork Deity', emoji: '⏳', minRenown: 10000, minEngineers: 35, description: 'A literal deity of clockwork and brass whose mechanisms govern the laws of physics themselves.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: BC_RELICS — 15 Legendary Brass Inventions
// ═══════════════════════════════════════════════════════════════════

export const BC_RELICS: readonly BcRelicDef[] = [
  { id: 'relic_brass_crown', name: 'Crown of Gears', emoji: '👑', rarity: 'epic', discipline: 'gearworks', forgeBoost: 20, designBoost: 15, efficiencyBoost: 10, value: 2000, description: 'A crown made of interlocking brass gears that whispers the solution to any mechanical problem.' },
  { id: 'relic_steam_heart', name: 'Steam Heart', emoji: '❤️', rarity: 'epic', discipline: 'steamworks', forgeBoost: 25, designBoost: 10, efficiencyBoost: 15, value: 2200, description: 'A perpetual steam engine the size of a human heart. It never stops pumping.' },
  { id: 'relic_air_goggles', name: 'Goggles of the Zephyr', emoji: '🥽', rarity: 'rare', discipline: 'pneumatics', forgeBoost: 10, designBoost: 12, efficiencyBoost: 18, value: 800, description: 'Goggles that let the wearer see air currents and pressure differentials as visible streams.' },
  { id: 'relic_lightning_rod', name: 'Lightning Conductor Staff', emoji: '⚡', rarity: 'rare', discipline: 'electrics', forgeBoost: 15, designBoost: 8, efficiencyBoost: 12, value: 750, description: 'A staff that attracts and stores lightning strikes for later use.' },
  { id: 'relic_water_orb', name: 'Orb of Endless Flow', emoji: '💧', rarity: 'epic', discipline: 'hydraulics', forgeBoost: 15, designBoost: 20, efficiencyBoost: 10, value: 2500, description: 'A brass orb that produces an infinite stream of water at any pressure desired.' },
  { id: 'relic_mag_shield', name: 'Magnetic Aegis', emoji: '🛡️', rarity: 'epic', discipline: 'magnetis', forgeBoost: 12, designBoost: 12, efficiencyBoost: 25, value: 2400, description: 'A shield of pure magnetic force that deflects metal projectiles and energizes allies.' },
  { id: 'relic_timepiece', name: 'Eternal Timepiece', emoji: '⏰', rarity: 'epic', discipline: 'clockworks', forgeBoost: 18, designBoost: 18, efficiencyBoost: 20, value: 2600, description: 'A pocket watch that never needs winding and displays the time in every time zone simultaneously.' },
  { id: 'relic_omega_gear', name: 'Omega Prime Gear', emoji: '⚙️', rarity: 'legendary', discipline: 'gearworks', forgeBoost: 40, designBoost: 35, efficiencyBoost: 20, value: 8000, description: 'The first gear ever created. It meshes with any mechanism regardless of tooth count or pitch.' },
  { id: 'relic_infinite_boiler', name: 'Infinite Boiler', emoji: '🔥', rarity: 'legendary', discipline: 'steamworks', forgeBoost: 35, designBoost: 25, efficiencyBoost: 30, value: 7500, description: 'A boiler that produces infinite steam from a single drop of water, powered by its own exhaust.' },
  { id: 'relic_void_bellows', name: 'Void Bellows', emoji: '🕳️', rarity: 'legendary', discipline: 'pneumatics', forgeBoost: 30, designBoost: 40, efficiencyBoost: 25, value: 8500, description: 'Bellows that draw air from the void itself, creating pressures that exceed physical limits.' },
  { id: 'relic_storm_core', name: 'Storm Core', emoji: '🌪️', rarity: 'legendary', discipline: 'electrics', forgeBoost: 45, designBoost: 30, efficiencyBoost: 20, value: 9000, description: 'A captured thunderstorm in a brass sphere. It provides unlimited electrical energy.' },
  { id: 'relic_leviathan_pump', name: 'Leviathan Pump', emoji: '🌊', rarity: 'legendary', discipline: 'hydraulics', forgeBoost: 25, designBoost: 35, efficiencyBoost: 35, value: 9500, description: 'A pump so powerful it can drain an ocean or fill a canyon in minutes.' },
  { id: 'relic_monopole_sphere', name: 'Monopole Sphere', emoji: '🔮', rarity: 'legendary', discipline: 'magnetis', forgeBoost: 30, designBoost: 30, efficiencyBoost: 40, value: 10000, description: 'A sphere containing a true magnetic monopole. It generates force without limit.' },
  { id: 'relic_chronos_key', name: 'Key of Chronos', emoji: '🗝️', rarity: 'legendary', discipline: 'clockworks', forgeBoost: 35, designBoost: 45, efficiencyBoost: 30, value: 11000, description: 'A key that can lock or unlock any mechanism — even the mechanisms of time and fate.' },
  { id: 'relic_aether_engine', name: 'Aetheric Engine Core', emoji: '✨', rarity: 'legendary', discipline: 'gearworks', forgeBoost: 50, designBoost: 50, efficiencyBoost: 50, value: 15000, description: 'The heart of the Aetheric Prime Mover. It runs on pure aether and outputs infinite energy.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: BC_EVENTS — 12 Steam/Pressure Events
// ═══════════════════════════════════════════════════════════════════

export const BC_EVENTS: readonly BcEventDef[] = [
  { id: 'evt_boiler_burst', name: 'Boiler Burst', emoji: '💥', durationTurns: 3, effectType: 'debuff', effectDescription: 'Steamworks output reduced by 40%. Repair costs doubled.', description: 'A catastrophic boiler explosion rocks the lower levels, damaging steam infrastructure.' },
  { id: 'evt_copper_rush', name: 'Copper Rush', emoji: '⛏️', durationTurns: 5, effectType: 'buff', effectDescription: 'Material yield doubled. Mining operations enhanced.', description: 'A rich copper vein is discovered beneath the citadel, triggering a mining bonanza.' },
  { id: 'evt_lightning_storm', name: 'Lightning Storm', emoji: '⛈️', durationTurns: 3, effectType: 'special', effectDescription: 'Electrics power tripled. Steamworks disabled.', description: 'A massive lightning storm strikes the citadel. Electric systems surge while steam systems short out.' },
  { id: 'evt_pressure_wave', name: 'Pressure Wave', emoji: '🌊', durationTurns: 4, effectType: 'debuff', effectDescription: 'Hydraulics efficiency halved. Pneumatics boosted.', description: 'A shockwave ripples through the pipe networks, straining hydraulic systems.' },
  { id: 'evt_gear_jam', name: 'Great Gear Jam', emoji: '⚙️', durationTurns: 2, effectType: 'debuff', effectDescription: 'All gearworks output stopped. Emergency repairs needed.', description: 'The central gear train seizes up, paralyzing half the citadel\'s mechanisms.' },
  { id: 'evt_magnetic_flare', name: 'Magnetic Flare', emoji: '🌟', durationTurns: 5, effectType: 'buff', effectDescription: 'Magnetis power doubled. All engineers gain +10 morale.', description: 'A surge in the earth\'s magnetic field amplifies all magnetic systems in the citadel.' },
  { id: 'evt_steam_festival', name: 'Grand Steam Festival', emoji: '🎉', durationTurns: 4, effectType: 'buff', effectDescription: 'All forging costs reduced by 30%. Gold rewards increased.', description: 'The annual Steam Festival brings celebration, trade deals, and discounted components.' },
  { id: 'evt_sabotage', name: 'Clockwork Sabotage', emoji: '💣', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 15% gold. Clockworks engineers demoralized.', description: 'Rival engineers sabotage key mechanisms! Gold is lost but the culprits left clues.' },
  { id: 'evt_aether_surge', name: 'Aether Surge', emoji: '✨', durationTurns: 3, effectType: 'buff', effectDescription: 'All engineer training doubled. Rare materials appear.', description: 'A surge of aetheric energy flows through the citadel, accelerating all creative processes.' },
  { id: 'evt_rust_epidemic', name: 'Rust Epidemic', emoji: '🦠', durationTurns: 5, effectType: 'debuff', effectDescription: 'Structure effectiveness reduced 25%. Maintenance costs increased.', description: 'A strange rust spreads through brass components, weakening structures across the citadel.' },
  { id: 'evt_temporal_anomaly', name: 'Temporal Anomaly', emoji: '⏳', durationTurns: 3, effectType: 'special', effectDescription: 'Clockworks gain triple power. Random bonuses each turn.', description: 'Time itself warps around the citadel. Clocks run backwards, forwards, and sideways.' },
  { id: 'evt_great_exposition', name: 'Great Brass Exposition', emoji: '🏆', durationTurns: 6, effectType: 'buff', effectDescription: 'Recruitment cost halved. Renown gains doubled.', description: 'Engineers from across the world gather for the Great Brass Exposition. The perfect time to recruit.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const BC_MAX_ENGINEER_LEVEL = 50
const BC_MAX_STRUCTURE_LEVEL = 10
const BC_INITIAL_GOLD = 200
const BC_INITIAL_RENOWN = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function bcXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function bcCalcStats(def: BcEngineerDef, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    forgePower: Math.floor(def.forgePower * growth),
    designPower: Math.floor(def.designPower * growth),
    efficiency: Math.floor(def.efficiency * growth),
  }
}

let _bcIdCounter = 0
function bcGenerateId(): string {
  _bcIdCounter += 1
  return `bc_${_bcIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function bcFindEngineerDef(id: string): BcEngineerDef | undefined {
  return BC_ENGINEERS.find((e) => e.id === id)
}

function bcFindChamber(id: string): BcChamberDef | undefined {
  return BC_CHAMBERS.find((c) => c.id === id)
}

function bcFindMaterial(id: string): BcMaterialDef | undefined {
  return BC_MATERIALS.find((m) => m.id === id)
}

function bcFindStructureDef(id: string): BcStructureDef | undefined {
  return BC_STRUCTURES.find((s) => s.id === id)
}

function bcFindAbility(id: string): BcAbilityDef | undefined {
  return BC_ABILITIES.find((a) => a.id === id)
}

function bcFindRelic(id: string): BcRelicDef | undefined {
  return BC_RELICS.find((r) => r.id === id)
}

function bcFindAchievement(id: string): BcAchievementDef | undefined {
  return BC_ACHIEVEMENTS.find((a) => a.id === id)
}

function bcFindTitle(id: BcTitleId): BcTitleDef | undefined {
  return BC_TITLES.find((t) => t.id === id)
}

function bcRarityMultiplier(rarity: BcRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function bcRarityColor(rarity: BcRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function bcDisciplineColor(discipline: BcDiscipline): string {
  switch (discipline) {
    case 'gearworks': return BC_BRASS_GOLD
    case 'steamworks': return BC_FORGE_ORANGE
    case 'pneumatics': return BC_STEAM_WHITE
    case 'electrics': return BC_ARC_BLUE
    case 'hydraulics': return BC_COPPER
    case 'magnetis': return BC_VALVE_RED
    case 'clockworks': return BC_GEAR_GRAY
    default: return '#888888'
  }
}

export function bcCheckSynergy(attacker: BcDiscipline, defender: BcDiscipline): number {
  const advantages = BC_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = BC_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function bcCalcStructureUpgradeCost(def: BcStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function bcCalcMaxTitle(renown: number, engineerCount: number): BcTitleId {
  let bestId: BcTitleId = 'title_brass_apprentice'
  for (const title of BC_TITLES) {
    if (renown >= title.minRenown && engineerCount >= title.minEngineers) {
      bestId = title.id
    }
  }
  return bestId
}

function bcCheckAchievementCondition(
  condition: string,
  state: BcStoreState
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
      return state.engineers.some((e) => {
        const def = bcFindEngineerDef(e.engineerDefId)
        return def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'epic_recruit':
      return state.engineers.some((e) => {
        const def = bcFindEngineerDef(e.engineerDefId)
        return def && (def.rarity === 'epic' || def.rarity === 'legendary')
      })
    case 'legendary_recruit':
      return state.engineers.some((e) => {
        const def = bcFindEngineerDef(e.engineerDefId)
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
    case 'all_disciplines': {
      const disciplines = new Set<BcDiscipline>()
      for (const e of state.engineers) {
        const def = bcFindEngineerDef(e.engineerDefId)
        if (def) disciplines.add(def.discipline)
      }
      return disciplines.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_clockwork_deity'
    default:
      return false
  }
}

function bcPickRandomEvent(): BcEventDef {
  const idx = Math.floor(Math.random() * BC_EVENTS.length)
  return BC_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useBcStore = create<BcFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      engineers: [] as BcEngineerInstance[],
      chambers: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as BcStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_brass_apprentice' as BcTitleId,
      gold: BC_INITIAL_GOLD,
      renown: BC_INITIAL_RENOWN,
      totalRecruited: 0,
      totalForged: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as BcEventDef | null,
      eventTurnsRemaining: 0,
      activeChamber: null as string | null,

      // ── bcRecruitEngineer ──────────────────────────────────────
      bcRecruitEngineer: (engineerDefId: string): boolean => {
        const def = bcFindEngineerDef(engineerDefId)
        if (!def) return false
        const cost = Math.floor(50 * bcRarityMultiplier(def.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = bcCalcStats(def, 1)
        const newEngineer: BcEngineerInstance = {
          id: bcGenerateId(),
          engineerDefId,
          name: def.name,
          level: 1,
          xp: 0,
          forgePower: stats.forgePower,
          designPower: stats.designPower,
          efficiency: stats.efficiency,
          morale: 80,
          energy: 70,
          recruitedAt: Date.now(),
        }
        set((prev) => {
          const updated = {
            engineers: [...prev.engineers, newEngineer],
            gold: prev.gold - cost,
            totalRecruited: prev.totalRecruited + 1,
            renown: prev.renown + bcRarityMultiplier(def.rarity) * 5,
            currentTitle: bcCalcMaxTitle(
              prev.renown + bcRarityMultiplier(def.rarity) * 5,
              prev.engineers.length + 1
            ),
          }
          return updated
        })
        return true
      },

      // ── bcDismissEngineer ──────────────────────────────────────
      bcDismissEngineer: (engineerId: string): boolean => {
        const state = get()
        const exists = state.engineers.find((e) => e.id === engineerId)
        if (!exists) return false
        const def = bcFindEngineerDef(exists.engineerDefId)
        const refund = def ? Math.floor(25 * bcRarityMultiplier(def.rarity)) : 10
        set((prev) => ({
          engineers: prev.engineers.filter((e) => e.id !== engineerId),
          gold: prev.gold + refund,
          currentTitle: bcCalcMaxTitle(prev.renown, prev.engineers.length - 1),
        }))
        return true
      },

      // ── bcTrainEngineer ────────────────────────────────────────
      bcTrainEngineer: (engineerId: string): boolean => {
        const trainCost = 10
        const state = get()
        if (state.gold < trainCost) return false
        set((prev) => {
          const engineers = prev.engineers.map((e) => {
            if (e.id !== engineerId) return e
            const newXp = e.xp + 20
            const xpNeeded = bcXpForLevel(e.level)
            let newLevel = e.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && e.level < BC_MAX_ENGINEER_LEVEL) {
              newLevel = e.level + 1
              currentXp = newXp - xpNeeded
            }
            const def = bcFindEngineerDef(e.engineerDefId)
            const stats = def ? bcCalcStats(def, newLevel) : { forgePower: e.forgePower, designPower: e.designPower, efficiency: e.efficiency }
            return {
              ...e,
              level: newLevel,
              xp: currentXp,
              forgePower: stats.forgePower,
              designPower: stats.designPower,
              efficiency: stats.efficiency,
              morale: Math.min(100, e.morale + 10),
              energy: Math.min(100, e.energy + 20),
            }
          })
          return { engineers, gold: prev.gold - trainCost, renown: prev.renown + 2 }
        })
        return true
      },

      // ── bcForgeMaterial ────────────────────────────────────────
      bcForgeMaterial: (engineerId: string): boolean => {
        const state = get()
        const engineer = state.engineers.find((e) => e.id === engineerId)
        if (!engineer) return false
        if (engineer.energy < 20) return false
        const def = bcFindEngineerDef(engineer.engineerDefId)
        if (!def) return false
        const materialId = `mat_${def.discipline}_${def.rarity}`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(engineer.forgePower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalForged: prev.totalForged + 1,
          renown: prev.renown + 3,
          engineers: prev.engineers.map((e) =>
            e.id === engineerId ? { ...e, energy: Math.max(0, e.energy - 20) } : e
          ),
        }))
        return true
      },

      // ── bcBuildStructure ───────────────────────────────────────
      bcBuildStructure: (structureDefId: string): boolean => {
        const def = bcFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: BcStructureInstance = {
          id: bcGenerateId(),
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

      // ── bcUpgradeStructure ─────────────────────────────────────
      bcUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= BC_MAX_STRUCTURE_LEVEL) return false
        const def = bcFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = bcCalcStructureUpgradeCost(def, structure.level)
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

      // ── bcOperateChamber ───────────────────────────────────────
      bcOperateChamber: (chamberId: string): BcEventDef | null => {
        const chamber = bcFindChamber(chamberId)
        if (!chamber) return null
        const state = get()
        const requiredTitleIdx = BC_TITLES.findIndex((t) => t.id === chamber.requiredTitle)
        const currentTitleIdx = BC_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newChambers = state.chambers.includes(chamberId) ? state.chambers : [...state.chambers, chamberId]
        const event = bcPickRandomEvent()
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

      // ── bcCollectRelic ─────────────────────────────────────────
      bcCollectRelic: (relicId: string): boolean => {
        const relic = bcFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => ({
          relics: [...prev.relics, relicId],
          renown: prev.renown + Math.floor(bcRarityMultiplier(relic.rarity) * 20),
          currentTitle: bcCalcMaxTitle(
            prev.renown + Math.floor(bcRarityMultiplier(relic.rarity) * 20),
            prev.engineers.length
          ),
        }))
        return true
      },

      // ── bcUnlockAbility ────────────────────────────────────────
      bcUnlockAbility: (abilityId: string): boolean => {
        const ability = bcFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * bcRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── bcUnlockTitle ──────────────────────────────────────────
      bcUnlockTitle: (titleId: BcTitleId): boolean => {
        const title = bcFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.renown < title.minRenown) return false
        if (state.engineers.length < title.minEngineers) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── bcClaimAchievement ─────────────────────────────────────
      bcClaimAchievement: (achievementId: string): boolean => {
        const achievement = bcFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!bcCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + achievement.reward.gold,
          renown: prev.renown + achievement.reward.renown,
          currentTitle: bcCalcMaxTitle(
            prev.renown + achievement.reward.renown,
            prev.engineers.length
          ),
        }))
        return true
      },

      // ── bcTradeMaterial ────────────────────────────────────────
      bcTradeMaterial: (materialId: string, count: number): number => {
        const material = bcFindMaterial(materialId)
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

      // ── bcEndEvent ─────────────────────────────────────────────
      bcEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── bcResetEvent ───────────────────────────────────────────
      bcResetEvent: () => {
        const event = bcPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'brass-citadel-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: MAIN HOOK — useBrassCitadel()
// ═══════════════════════════════════════════════════════════════════

export default function useBrassCitadel() {
  const store = useBcStore()

  // ── Computed: Owned engineers with def info ────────────────────
  const bcOwnedEngineers = useMemo(() => {
    return store.engineers.map((e) => {
      const def = bcFindEngineerDef(e.engineerDefId)
      return {
        ...e,
        def,
        disciplineColor: def ? bcDisciplineColor(def.discipline) : '#888888',
        rarityColor: def ? bcRarityColor(def.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available engineers to recruit ───────────────────
  const bcAvailableEngineers = useMemo(() => {
    return BC_ENGINEERS.filter((def) => {
      const cost = Math.floor(50 * bcRarityMultiplier(def.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ───────────────────────────
  const bcCurrentTitleDetail = useMemo(() => {
    return bcFindTitle(store.currentTitle) ?? BC_TITLES[0]
  }, [store])

  // ── Computed: Next title info ─────────────────────────────────
  const bcNextTitle = useMemo(() => {
    const currentIdx = BC_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= BC_TITLES.length - 1) return null
    return BC_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active chamber details ───────────────────────────
  const bcActiveChamberDetail = useMemo(() => {
    if (!store.activeChamber) return null
    return bcFindChamber(store.activeChamber) ?? null
  }, [store])

  // ── Computed: Unoperated chambers ──────────────────────────────
  const bcUnoperatedChambers = useMemo(() => {
    return BC_CHAMBERS.filter((c) => !store.chambers.includes(c.id))
  }, [store])

  // ── Computed: Structures with defs ────────────────────────────
  const bcBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = bcFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ────────────────────────────
  const bcUnlockableAbilities = useMemo(() => {
    return BC_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * bcRarityMultiplier(a.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Owned relics with defs ──────────────────────────
  const bcOwnedRelics = useMemo(() => {
    return store.relics.map((rId) => {
      const def = bcFindRelic(rId)
      return def ?? null
    }).filter((r): r is BcRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ──────────────────────────
  const bcUnclaimedAchievements = useMemo(() => {
    return BC_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return bcCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ─────────────────────────────
  const bcInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = bcFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect bonus ────────────────────
  const bcTotalStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = bcFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average engineer level ───────────────────────────
  const bcAverageEngineerLevel = useMemo(() => {
    if (store.engineers.length === 0) return 0
    const total = store.engineers.reduce((sum, e) => sum + e.level, 0)
    return Math.floor(total / store.engineers.length)
  }, [store])

  // ── Computed: Total engineer power ────────────────────────────
  const bcTotalEngineerPower = useMemo(() => {
    return store.engineers.reduce(
      (sum, e) => sum + e.forgePower + e.designPower + e.efficiency,
      0
    )
  }, [store])

  // ── Computed: Discipline distribution ─────────────────────────
  const bcDisciplineDistribution = useMemo(() => {
    const counts: Record<BcDiscipline, number> = {
      gearworks: 0, steamworks: 0, pneumatics: 0, electrics: 0,
      hydraulics: 0, magnetis: 0, clockworks: 0,
    }
    for (const e of store.engineers) {
      const def = bcFindEngineerDef(e.engineerDefId)
      if (def) counts[def.discipline]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ─────────────────────────────
  const bcRarityDistribution = useMemo(() => {
    const counts: Record<BcRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const e of store.engineers) {
      const def = bcFindEngineerDef(e.engineerDefId)
      if (def) counts[def.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Engineers by rarity ──────────────────────────────
  const bcEngineersByRarity = useMemo(() => {
    const groups: Record<BcRarity, BcEngineerInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const e of store.engineers) {
      const def = bcFindEngineerDef(e.engineerDefId)
      if (def) groups[def.rarity].push(e)
    }
    return groups
  }, [store])

  // ── Computed: Engineers by discipline ─────────────────────────
  const bcEngineersByDiscipline = useMemo(() => {
    const groups: Record<BcDiscipline, BcEngineerInstance[]> = {
      gearworks: [], steamworks: [], pneumatics: [], electrics: [],
      hydraulics: [], magnetis: [], clockworks: [],
    }
    for (const e of store.engineers) {
      const def = bcFindEngineerDef(e.engineerDefId)
      if (def) groups[def.discipline].push(e)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ──────────────────────────
  const bcTitleProgress = useMemo(() => {
    const next = bcNextTitle
    if (!next) return { percent: 100, renownNeeded: 0, engineersNeeded: 0 }
    const renownProgress = Math.min(100, (store.renown / next.minRenown) * 100)
    const engineerProgress = Math.min(100, (store.engineers.length / next.minEngineers) * 100)
    return {
      percent: Math.floor((renownProgress + engineerProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - store.renown),
      engineersNeeded: Math.max(0, next.minEngineers - store.engineers.length),
    }
  }, [store, bcNextTitle])

  // ── Computed: Rare materials count ────────────────────────────
  const bcRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = bcFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Low energy engineers ────────────────────────────
  const bcTiredEngineers = useMemo(() => {
    return store.engineers.filter((e) => e.energy < 30)
  }, [store])

  // ── Computed: Low morale engineers ────────────────────────────
  const bcDemoralizedEngineers = useMemo(() => {
    return store.engineers.filter((e) => e.morale < 30)
  }, [store])

  // ── Computed: Total relic boost ───────────────────────────────
  const bcTotalRelicBoost = useMemo(() => {
    let forgeBoost = 0
    let designBoost = 0
    let efficiencyBoost = 0
    for (const rId of store.relics) {
      const relic = bcFindRelic(rId)
      if (relic) {
        forgeBoost += relic.forgeBoost
        designBoost += relic.designBoost
        efficiencyBoost += relic.efficiencyBoost
      }
    }
    return { forgeBoost, designBoost, efficiencyBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return bcAPI object
  // ═════════════════════════════════════════════════════════════

  const bcAPI = {
    // ── Direct constants ──────────────────────────────────────
    BC_BRASS_GOLD,
    BC_COPPER,
    BC_STEAM_WHITE,
    BC_GEAR_GRAY,
    BC_FORGE_ORANGE,
    BC_OIL_BLACK,
    BC_ARC_BLUE,
    BC_VALVE_RED,
    BC_DISCIPLINES,
    BC_ENGINEERS,
    BC_CHAMBERS,
    BC_MATERIALS,
    BC_STRUCTURES,
    BC_ABILITIES,
    BC_ACHIEVEMENTS,
    BC_TITLES,
    BC_RELICS,
    BC_EVENTS,
    bcCheckSynergy,

    // ── Store state ───────────────────────────────────────────
    engineers: store.engineers,
    chambers: store.chambers,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    gold: store.gold,
    renown: store.renown,
    totalRecruited: store.totalRecruited,
    totalForged: store.totalForged,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activeChamber: store.activeChamber,

    // ── Store actions ─────────────────────────────────────────
    bcRecruitEngineer: store.bcRecruitEngineer,
    bcDismissEngineer: store.bcDismissEngineer,
    bcTrainEngineer: store.bcTrainEngineer,
    bcForgeMaterial: store.bcForgeMaterial,
    bcBuildStructure: store.bcBuildStructure,
    bcUpgradeStructure: store.bcUpgradeStructure,
    bcOperateChamber: store.bcOperateChamber,
    bcCollectRelic: store.bcCollectRelic,
    bcUnlockAbility: store.bcUnlockAbility,
    bcUnlockTitle: store.bcUnlockTitle,
    bcClaimAchievement: store.bcClaimAchievement,
    bcTradeMaterial: store.bcTradeMaterial,
    bcEndEvent: store.bcEndEvent,
    bcResetEvent: store.bcResetEvent,

    // ── Computed getters ──────────────────────────────────────
    bcOwnedEngineers,
    bcAvailableEngineers,
    bcCurrentTitleDetail,
    bcNextTitle,
    bcActiveChamberDetail,
    bcUnoperatedChambers,
    bcBuiltStructures,
    bcUnlockableAbilities,
    bcOwnedRelics,
    bcUnclaimedAchievements,
    bcInventoryMaterials,
    bcTotalStructureEffect,
    bcAverageEngineerLevel,
    bcTotalEngineerPower,
    bcDisciplineDistribution,
    bcRarityDistribution,
    bcEngineersByRarity,
    bcEngineersByDiscipline,
    bcTitleProgress,
    bcRareMaterialCount,
    bcTiredEngineers,
    bcDemoralizedEngineers,
    bcTotalRelicBoost,
  }

  return bcAPI
}
