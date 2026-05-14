/**
 * Drift Fleet Wire — Nomadic Ocean Fleet Management Mini-Game
 *
 * Command 35 drift ships across 7 fleet classes, manage 8 harbor ports,
 * collect 30 nautical materials, build 25 fleet structures, unlock 22
 * maritime abilities, discover 15 legendary nautical relics, face 12
 * ocean events, and ascend through 8 titles from Deck Hand to Fleet Deity
 * — backed by a Zustand store with persist middleware.
 *
 * Storage key: drift-fleet-wire
 * Prefix: df / DF_
 *
 * Constants: DF_CLASSES(7), DF_RARITIES(5), DF_TITLES(8), DF_SHIPS(35),
 * DF_PORTS(8), DF_MATERIALS(30), DF_STRUCTURES(25), DF_ABILITIES(22),
 * DF_ACHIEVEMENTS(18), DF_RELICS(15), DF_EVENTS(12)
 *
 * Actions: dfCommissionShip, dfDecommissionShip, dfCrewShip, dfHarvestCargo,
 * dfBuildStructure, dfUpgradeStructure, dfDockAtPort, dfCollectRelic,
 * dfUnlockAbility, dfUnlockTitle, dfClaimAchievement, dfTradeMaterial,
 * dfEndEvent, dfResetEvent
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type DfFleetClass =
  | 'galleon'
  | 'frigate'
  | 'schooner'
  | 'caravel'
  | 'trireme'
  | 'catamaran'
  | 'submarine'

export type DfRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type DfTitleId =
  | 'title_deck_hand'
  | 'title_able_seaman'
  | 'title_boatswain'
  | 'title_first_mate'
  | 'title_captain'
  | 'title_commodore'
  | 'title_admiral'
  | 'title_fleet_deity'

export interface DfClassDef {
  readonly id: DfFleetClass
  readonly name: string
  readonly color: string
  readonly description: string
}

export interface DfRarityDef {
  readonly id: DfRarity
  readonly name: string
  readonly color: string
}

export interface DfShipSpecies {
  readonly id: string
  readonly name: string
  readonly fleetClass: DfFleetClass
  readonly rarity: DfRarity
  readonly cannonPower: number
  readonly hullStrength: number
  readonly speed: number
  readonly description: string
  readonly abilities: string[]
}

export interface DfShipInstance {
  readonly id: string
  shipDefId: string
  name: string
  level: number
  xp: number
  cannonPower: number
  hullStrength: number
  speed: number
  morale: number
  provisions: number
  commissionedAt: number
}

export interface DfPortDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly depth: number
  readonly dangerLevel: number
  readonly requiredTitle: DfTitleId
  readonly fleetClass: DfFleetClass
  readonly bgGradient: string
  readonly ambientColor: string
}

export interface DfMaterialDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly type: 'plank' | 'sailcloth' | 'cannon' | 'nautical_chart' | 'essence'
  readonly rarity: DfRarity
  readonly cannonBonus: number
  readonly hullBonus: number
  readonly value: number
  readonly description: string
}

export interface DfStructureDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly category: 'drydock' | 'armory' | 'galley' | 'lighthouse' | 'relic_vault'
  readonly maxLevel: number
  readonly baseEffect: number
  readonly effectPerLevel: number
  readonly baseCost: number
  readonly costMultiplier: number
  readonly description: string
}

export interface DfStructureInstance {
  readonly id: string
  structureDefId: string
  level: number
  builtAt: number
}

export interface DfAbilityDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly fleetClass: DfFleetClass
  readonly type: 'active' | 'passive'
  readonly rarity: DfRarity
  readonly energyCost: number
  readonly cooldown: number
  readonly power: number
  readonly description: string
}

export interface DfAchievementDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly condition: string
  readonly reward: { gold: number; renown: number }
}

export interface DfTitleDef {
  readonly id: DfTitleId
  readonly name: string
  readonly emoji: string
  readonly minRenown: number
  readonly minShips: number
  readonly description: string
}

export interface DfRelicDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly rarity: DfRarity
  readonly fleetClass: DfFleetClass
  readonly cannonBoost: number
  readonly hullBoost: number
  readonly speedBoost: number
  readonly value: number
  readonly description: string
}

export interface DfEventDef {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly durationTurns: number
  readonly effectType: 'buff' | 'debuff' | 'special'
  readonly effectDescription: string
  readonly description: string
}

export interface DfStoreState {
  ships: DfShipInstance[]
  ports: string[]
  materials: { materialId: string; count: number }[]
  structures: DfStructureInstance[]
  abilities: string[]
  achievements: string[]
  relics: string[]
  currentTitle: DfTitleId
  gold: number
  renown: number
  totalCommissioned: number
  totalHarvested: number
  totalBuilt: number
  totalEventsFaced: number
  activeEvent: DfEventDef | null
  eventTurnsRemaining: number
  activePort: string | null
}

export interface DfStoreActions {
  dfCommissionShip: (shipDefId: string) => boolean
  dfDecommissionShip: (shipId: string) => boolean
  dfCrewShip: (shipId: string) => boolean
  dfHarvestCargo: (shipId: string) => boolean
  dfBuildStructure: (structureDefId: string) => boolean
  dfUpgradeStructure: (structureId: string) => boolean
  dfDockAtPort: (portId: string) => DfEventDef | null
  dfCollectRelic: (relicId: string) => boolean
  dfUnlockAbility: (abilityId: string) => boolean
  dfUnlockTitle: (titleId: DfTitleId) => boolean
  dfClaimAchievement: (achievementId: string) => boolean
  dfTradeMaterial: (materialId: string, count: number) => number
  dfEndEvent: () => void
  dfResetEvent: () => void
}

export interface DfFullStore extends DfStoreState, DfStoreActions {}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS (8 colors)
// ═══════════════════════════════════════════════════════════════════

export const DF_OCEAN_BLUE: string = '#0077B6'
export const DF_DECK_BROWN: string = '#8B6914'
export const DF_SAIL_WHITE: string = '#F5F5F5'
export const DF_HULL_BLACK: string = '#2F2F2F'
export const DF_ANCHOR_GOLD: string = '#FFD700'
export const DF_FOG_GRAY: string = '#A9A9A9'
export const DF_CORAL_PINK: string = '#FF7F50'
export const DF_NAVY_INDIGO: string = '#191970'

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: FLEET CLASS DEFINITIONS (7 classes)
// ═══════════════════════════════════════════════════════════════════

export const DF_CLASSES: readonly DfClassDef[] = [
  {
    id: 'galleon',
    name: 'Galleon',
    color: DF_DECK_BROWN,
    description:
      'Heavy ocean-going vessels built for trade and war. Galleons carry the most cargo and boast formidable hulls.',
  },
  {
    id: 'frigate',
    name: 'Frigate',
    color: DF_OCEAN_BLUE,
    description:
      'Fast and maneuverable warships. Frigates excel in ship-to-ship combat and reconnaissance missions.',
  },
  {
    id: 'schooner',
    name: 'Schooner',
    color: DF_SAIL_WHITE,
    description:
      'Swift two-masted sailing vessels. Schooners are the fastest ships in the fleet, ideal for courier runs.',
  },
  {
    id: 'caravel',
    name: 'Caravel',
    color: DF_CORAL_PINK,
    description:
      'Exploration vessels designed for long voyages into unknown waters. Caravels have exceptional range.',
  },
  {
    id: 'trireme',
    name: 'Trireme',
    color: DF_HULL_BLACK,
    description:
      'Ancient rowed warships with reinforced bronze rams. Triremes dominate close-quarters naval combat.',
  },
  {
    id: 'catamaran',
    name: 'Catamaran',
    color: DF_ANCHOR_GOLD,
    description:
      'Twin-hulled vessels that ride above rough seas. Catamarans are stable in any weather and carry large crews.',
  },
  {
    id: 'submarine',
    name: 'Submarine',
    color: DF_NAVY_INDIGO,
    description:
      'Deep-diving vessels that operate beneath the waves. Submarines can ambush enemies undetected.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: RARITY DEFINITIONS (5 rarities)
// ═══════════════════════════════════════════════════════════════════

export const DF_RARITIES: readonly DfRarityDef[] = [
  { id: 'common', name: 'Common', color: '#9ca3af' },
  { id: 'uncommon', name: 'Uncommon', color: '#34d399' },
  { id: 'rare', name: 'Rare', color: '#60a5fa' },
  { id: 'epic', name: 'Epic', color: '#a78bfa' },
  { id: 'legendary', name: 'Legendary', color: '#fbbf24' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: FLEET CLASS SYNERGY TABLE
// ═══════════════════════════════════════════════════════════════════

const DF_SYNERGY_MAP: Record<DfFleetClass, DfFleetClass[]> = {
  galleon: ['trireme', 'catamaran'],
  frigate: ['schooner', 'submarine'],
  schooner: ['caravel', 'galleon'],
  caravel: ['catamaran', 'frigate'],
  trireme: ['submarine', 'galleon'],
  catamaran: ['frigate', 'caravel'],
  submarine: ['trireme', 'schooner'],
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: DF_SHIPS — 35 Drift Ships (5 per class)
// ═══════════════════════════════════════════════════════════════════

export const DF_SHIPS: readonly DfShipSpecies[] = [
  // ── Galleons (5) ──────────────────────────────────────────────
  {
    id: 'gal_coastal_dhow',
    name: 'Coastal Dhow',
    fleetClass: 'galleon',
    rarity: 'common',
    cannonPower: 12,
    hullStrength: 18,
    speed: 14,
    description:
      'A small wooden dhow used for coastal fishing and short trade runs. Reliable but unremarkable in battle.',
    abilities: ['broadside'],
  },
  {
    id: 'gal_trade_carrack',
    name: 'Trade Carrack',
    fleetClass: 'galleon',
    rarity: 'uncommon',
    cannonPower: 20,
    hullStrength: 30,
    speed: 10,
    description:
      'A broad-beamed merchant vessel with spacious cargo holds. Its reinforced hull can weather most storms.',
    abilities: ['broadside', 'cargo_boost'],
  },
  {
    id: 'gal_battle_galleon',
    name: 'Battle Galleon',
    fleetClass: 'galleon',
    rarity: 'rare',
    cannonPower: 40,
    hullStrength: 50,
    speed: 8,
    description:
      'A purpose-built war galleon bristling with cannons on three decks. Slow but devastating in fleet engagements.',
    abilities: ['broadside', 'iron_hull', 'volley_fire'],
  },
  {
    id: 'gal_treasure_galleon',
    name: 'Treasure Galleon',
    fleetClass: 'galleon',
    rarity: 'epic',
    cannonPower: 35,
    hullStrength: 70,
    speed: 6,
    description:
      'A legendary treasure hauler with vault-like cargo bays. Its hull is clad in bronze plates recovered from ancient wrecks.',
    abilities: ['broadside', 'iron_hull', 'treasure_vault', 'fortress_mode'],
  },
  {
    id: 'gal_sovereign_galleon',
    name: 'Sovereign Galleon',
    fleetClass: 'galleon',
    rarity: 'legendary',
    cannonPower: 65,
    hullStrength: 100,
    speed: 10,
    description:
      'The crown jewel of any fleet. The Sovereign Galleon carries enough firepower to level a port and enough cargo to fund a kingdom.',
    abilities: ['broadside', 'iron_hull', 'volley_fire', 'fortress_mode', 'sovereign_decree'],
  },

  // ── Frigates (5) ──────────────────────────────────────────────
  {
    id: 'fri_patrol_cutter',
    name: 'Patrol Cutter',
    fleetClass: 'frigate',
    rarity: 'common',
    cannonPower: 15,
    hullStrength: 10,
    speed: 22,
    description:
      'A nimble patrol vessel used to guard harbors and chase down smugglers. Fast but lightly armored.',
    abilities: ['chase'],
  },
  {
    id: 'fri_scout_brigantine',
    name: 'Scout Brigantine',
    fleetClass: 'frigate',
    rarity: 'uncommon',
    cannonPower: 25,
    hullStrength: 18,
    speed: 30,
    description:
      'A fast two-masted brigantine used for reconnaissance. Its crow\'s nest can spot land twenty leagues away.',
    abilities: ['chase', 'spyglass'],
  },
  {
    id: 'fri_war_frigate',
    name: 'War Frigate',
    fleetClass: 'frigate',
    rarity: 'rare',
    cannonPower: 55,
    hullStrength: 35,
    speed: 25,
    description:
      'A dedicated warship with a reinforced keel and 40 cannon broadside. The backbone of any serious navy.',
    abilities: ['chase', 'spyglass', 'flanking_run'],
  },
  {
    id: 'fri_ironclad_frigate',
    name: 'Ironclad Frigate',
    fleetClass: 'frigate',
    rarity: 'epic',
    cannonPower: 60,
    hullStrength: 55,
    speed: 18,
    description:
      'An experimental frigate sheathed in iron plating. Cannons bounce off its hull like pebbles off a cliff.',
    abilities: ['chase', 'iron_hull', 'flanking_run', 'ramming_speed'],
  },
  {
    id: 'fri_phantom_frigate',
    name: 'Phantom Frigate',
    fleetClass: 'frigate',
    rarity: 'legendary',
    cannonPower: 80,
    hullStrength: 60,
    speed: 45,
    description:
      'A spectral warship that appears and vanishes like sea fog. Legends say it sails on moonlight alone.',
    abilities: ['chase', 'spyglass', 'flanking_run', 'ramming_speed', 'phantom_veil'],
  },

  // ── Schooners (5) ─────────────────────────────────────────────
  {
    id: 'sch_fisherman_sloop',
    name: 'Fisherman Sloop',
    fleetClass: 'schooner',
    rarity: 'common',
    cannonPower: 5,
    hullStrength: 8,
    speed: 28,
    description:
      'A humble fishing sloop with a single sail. Perfect for harvesting coastal waters and outrunning trouble.',
    abilities: ['tailwind'],
  },
  {
    id: 'sch_messenger_schooner',
    name: 'Messenger Schooner',
    fleetClass: 'schooner',
    rarity: 'uncommon',
    cannonPower: 10,
    hullStrength: 12,
    speed: 38,
    description:
      'A swift courier vessel built to carry dispatches across the open ocean. Nothing catches a Messenger at full sail.',
    abilities: ['tailwind', 'signal_flare'],
  },
  {
    id: 'sch_storm_schooner',
    name: 'Storm Schooner',
    fleetClass: 'schooner',
    rarity: 'rare',
    cannonPower: 25,
    hullStrength: 30,
    speed: 35,
    description:
      'A weather-proof schooner that thrives in hurricanes. While others seek shelter, the Storm Schooner sails on.',
    abilities: ['tailwind', 'signal_flare', 'storm_rider'],
  },
  {
    id: 'sch_windracer',
    name: 'Windracer Schooner',
    fleetClass: 'schooner',
    rarity: 'epic',
    cannonPower: 20,
    hullStrength: 25,
    speed: 55,
    description:
      'The fastest sailing ship ever built. The Windracer can outrun cannon fire and even some steam-powered vessels.',
    abilities: ['tailwind', 'signal_flare', 'storm_rider', 'breakwater'],
  },
  {
    id: 'sch_ghost_schooner',
    name: 'Ghost Schooner',
    fleetClass: 'schooner',
    rarity: 'legendary',
    cannonPower: 35,
    hullStrength: 40,
    speed: 60,
    description:
      'A spectral schooner crewed by the damned. It appears during electrical storms and can phase through solid matter.',
    abilities: ['tailwind', 'signal_flare', 'storm_rider', 'breakwater', 'ghostly_appear'],
  },

  // ── Caravels (5) ──────────────────────────────────────────────
  {
    id: 'car_explorer_caravel',
    name: 'Explorer Caravel',
    fleetClass: 'caravel',
    rarity: 'common',
    cannonPower: 8,
    hullStrength: 14,
    speed: 20,
    description:
      'A small but seaworthy exploration vessel. Its lateen sails allow it to tack against the wind efficiently.',
    abilities: ['navigate'],
  },
  {
    id: 'car_navigator_caravel',
    name: 'Navigator Caravel',
    fleetClass: 'caravel',
    rarity: 'uncommon',
    cannonPower: 15,
    hullStrength: 22,
    speed: 22,
    description:
      'Equipped with the finest nautical instruments. The Navigator Caravel can chart courses through uncharted waters.',
    abilities: ['navigate', 'star_chart'],
  },
  {
    id: 'car_deep_sea_caravel',
    name: 'Deep Sea Caravel',
    fleetClass: 'caravel',
    rarity: 'rare',
    cannonPower: 30,
    hullStrength: 40,
    speed: 18,
    description:
      'A reinforced caravel designed for extended voyages into deep ocean. Its hull resists pressure and corrosion.',
    abilities: ['navigate', 'star_chart', 'deep_anchor'],
  },
  {
    id: 'car_horizon_caravel',
    name: 'Horizon Caravel',
    fleetClass: 'caravel',
    rarity: 'epic',
    cannonPower: 35,
    hullStrength: 45,
    speed: 24,
    description:
      'A caravel that always finds its way home, no matter how far it has sailed. Said to follow currents invisible to all others.',
    abilities: ['navigate', 'star_chart', 'deep_anchor', 'horizon_sense'],
  },
  {
    id: 'car_eternal_caravel',
    name: 'Eternal Caravel',
    fleetClass: 'caravel',
    rarity: 'legendary',
    cannonPower: 50,
    hullStrength: 60,
    speed: 30,
    description:
      'An immortal vessel that has sailed every ocean on Earth. Its charts contain routes that lead to other worlds.',
    abilities: ['navigate', 'star_chart', 'deep_anchor', 'horizon_sense', 'world_sailor'],
  },

  // ── Triremes (5) ──────────────────────────────────────────────
  {
    id: 'tri_training_trireme',
    name: 'Training Trireme',
    fleetClass: 'trireme',
    rarity: 'common',
    cannonPower: 18,
    hullStrength: 12,
    speed: 16,
    description:
      'A practice vessel used to train new crews in ramming tactics. Lightweight but surprisingly effective in numbers.',
    abilities: ['ram'],
  },
  {
    id: 'tri_war_trireme',
    name: 'War Trireme',
    fleetClass: 'trireme',
    rarity: 'uncommon',
    cannonPower: 35,
    hullStrength: 25,
    speed: 18,
    description:
      'A battle-ready trireme with a bronze-clad ram and 30 oarsmen. Devastating in close-quarters combat.',
    abilities: ['ram', 'boarders'],
  },
  {
    id: 'tri_bronze_trireme',
    name: 'Bronze Trireme',
    fleetClass: 'trireme',
    rarity: 'rare',
    cannonPower: 50,
    hullStrength: 40,
    speed: 15,
    description:
      'An ancient warship recovered from a Mediterranean tomb and restored. Its bronze ram can split any hull.',
    abilities: ['ram', 'boarders', 'bronze_bow'],
  },
  {
    id: 'tri_leviathan_trireme',
    name: 'Leviathan Trireme',
    fleetClass: 'trireme',
    rarity: 'epic',
    cannonPower: 65,
    hullStrength: 55,
    speed: 20,
    description:
      'A colossal trireme crewed by 180 oarsmen. When it rams, the shockwave capsizes nearby vessels.',
    abilities: ['ram', 'boarders', 'bronze_bow', 'shockwave'],
  },
  {
    id: 'tri_titan_trireme',
    name: 'Titan Trireme',
    fleetClass: 'trireme',
    rarity: 'legendary',
    cannonPower: 90,
    hullStrength: 80,
    speed: 22,
    description:
      'The legendary flagship of an ancient armada that conquered the seven seas. Its ram is forged from a fallen star.',
    abilities: ['ram', 'boarders', 'bronze_bow', 'shockwave', 'star_ram'],
  },

  // ── Catamarans (5) ────────────────────────────────────────────
  {
    id: 'cat_reef_runner',
    name: 'Reef Runner',
    fleetClass: 'catamaran',
    rarity: 'common',
    cannonPower: 8,
    hullStrength: 16,
    speed: 24,
    description:
      'A shallow-draft catamaran that skims over coral reefs and sandbars. Popular among island traders.',
    abilities: ['twin_hull'],
  },
  {
    id: 'cat_island_hopper',
    name: 'Island Hopper',
    fleetClass: 'catamaran',
    rarity: 'uncommon',
    cannonPower: 15,
    hullStrength: 24,
    speed: 28,
    description:
      'A versatile catamaran that carries passengers and cargo between island chains. Extremely stable in rough seas.',
    abilities: ['twin_hull', 'stable_deck'],
  },
  {
    id: 'cat_stormbreaker',
    name: 'Stormbreaker Catamaran',
    fleetClass: 'catamaran',
    rarity: 'rare',
    cannonPower: 30,
    hullStrength: 45,
    speed: 25,
    description:
      'A heavy catamaran built to weather the fiercest storms. Its twin hulls can split and absorb massive waves.',
    abilities: ['twin_hull', 'stable_deck', 'wave_splitter'],
  },
  {
    id: 'cat_coral_catamaran',
    name: 'Coral Catamaran',
    fleetClass: 'catamaran',
    rarity: 'epic',
    cannonPower: 40,
    hullStrength: 50,
    speed: 30,
    description:
      'A living vessel grown from enchanted coral. It heals itself over time and grows stronger in tropical waters.',
    abilities: ['twin_hull', 'stable_deck', 'wave_splitter', 'coral_regen'],
  },
  {
    id: 'cat_tsunami_catamaran',
    name: 'Tsunami Catamaran',
    fleetClass: 'catamaran',
    rarity: 'legendary',
    cannonPower: 60,
    hullStrength: 75,
    speed: 40,
    description:
      'A mythical twin-hulled vessel that rides tsunamis like surfboards. It can summon and direct tidal waves at will.',
    abilities: ['twin_hull', 'stable_deck', 'wave_splitter', 'coral_regen', 'tidal_summon'],
  },

  // ── Submarines (5) ────────────────────────────────────────────
  {
    id: 'sub_diving_bell',
    name: 'Diving Bell Sub',
    fleetClass: 'submarine',
    rarity: 'common',
    cannonPower: 10,
    hullStrength: 20,
    speed: 8,
    description:
      'A primitive hand-cranked submarine that can dive to shallow depths. Cramped but effective for ambushes.',
    abilities: ['dive'],
  },
  {
    id: 'sub_iron_diver',
    name: 'Iron Diver',
    fleetClass: 'submarine',
    rarity: 'uncommon',
    cannonPower: 25,
    hullStrength: 35,
    speed: 10,
    description:
      'A steam-powered submarine with a reinforced iron hull. It can stay submerged for hours and fire torpedoes.',
    abilities: ['dive', 'torpedo'],
  },
  {
    id: 'sub_depth_charger',
    name: 'Depth Charger',
    fleetClass: 'submarine',
    rarity: 'rare',
    cannonPower: 45,
    hullStrength: 50,
    speed: 12,
    description:
      'A military submarine armed with depth charges and explosive torpedoes. It haunts the darkness below merchant routes.',
    abilities: ['dive', 'torpedo', 'sonar_ping'],
  },
  {
    id: 'sub_abyssal_sub',
    name: 'Abyssal Submarine',
    fleetClass: 'submarine',
    rarity: 'epic',
    cannonPower: 55,
    hullStrength: 65,
    speed: 14,
    description:
      'A deep-sea submarine that can dive to crushing depths. Its reinforced titanium hull withstands any pressure.',
    abilities: ['dive', 'torpedo', 'sonar_ping', 'abyssal_cloak'],
  },
  {
    id: 'sub_kraken_sub',
    name: 'Kraken Submarine',
    fleetClass: 'submarine',
    rarity: 'legendary',
    cannonPower: 85,
    hullStrength: 90,
    speed: 18,
    description:
      'A submarine shaped like a kraken that can crush surface ships with mechanical tentacles. The terror of the deep.',
    abilities: ['dive', 'torpedo', 'sonar_ping', 'abyssal_cloak', 'kraken_grip'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: DF_PORTS — 8 Harbor Ports
// ═══════════════════════════════════════════════════════════════════

export const DF_PORTS: readonly DfPortDef[] = [
  {
    id: 'shallow_bay',
    name: 'Shallow Bay',
    description:
      'A sheltered inlet with calm waters and a small fishing village. The perfect starting point for any aspiring fleet commander.',
    depth: 0,
    dangerLevel: 1,
    requiredTitle: 'title_deck_hand',
    fleetClass: 'galleon',
    bgGradient: 'linear-gradient(180deg, #0077B6 0%, #F5F5F5 50%, #8B6914 100%)',
    ambientColor: DF_OCEAN_BLUE,
  },
  {
    id: 'coral_harbor',
    name: 'Coral Harbor',
    description:
      'A natural harbor nestled within a protective coral reef. Tropical fish abound and catamarans are the preferred vessel here.',
    depth: 1,
    dangerLevel: 2,
    requiredTitle: 'title_deck_hand',
    fleetClass: 'catamaran',
    bgGradient: 'linear-gradient(180deg, #0077B6 0%, #FF7F50 50%, #FFD700 100%)',
    ambientColor: DF_CORAL_PINK,
  },
  {
    id: 'traders_cove',
    name: "Trader's Cove",
    description:
      'A bustling marketplace port where merchants from across the seas gather. Galleons and caravels dock side by side.',
    depth: 2,
    dangerLevel: 3,
    requiredTitle: 'title_able_seaman',
    fleetClass: 'galleon',
    bgGradient: 'linear-gradient(180deg, #8B6914 0%, #F5F5F5 50%, #0077B6 100%)',
    ambientColor: DF_DECK_BROWN,
  },
  {
    id: 'foggy_anchorage',
    name: 'Foggy Anchorage',
    description:
      'A mysterious harbor perpetually shrouded in thick fog. Submarines lurk beneath the surface, and ships disappear without trace.',
    depth: 3,
    dangerLevel: 4,
    requiredTitle: 'title_boatswain',
    fleetClass: 'submarine',
    bgGradient: 'linear-gradient(180deg, #A9A9A9 0%, #191970 50%, #2F2F2F 100%)',
    ambientColor: DF_FOG_GRAY,
  },
  {
    id: 'iron_port',
    name: 'Iron Port',
    description:
      'An industrial naval base with massive drydocks and armories. Frigates are refitted and triremes repaired here.',
    depth: 4,
    dangerLevel: 5,
    requiredTitle: 'title_first_mate',
    fleetClass: 'frigate',
    bgGradient: 'linear-gradient(180deg, #2F2F2F 0%, #8B6914 50%, #FFD700 100%)',
    ambientColor: DF_HULL_BLACK,
  },
  {
    id: 'abyssal_drydock',
    name: 'Abyssal Drydock',
    description:
      'A deep-water facility built into an underwater volcanic caldera. Only submarines can access its deepest berths.',
    depth: 5,
    dangerLevel: 6,
    requiredTitle: 'title_captain',
    fleetClass: 'submarine',
    bgGradient: 'linear-gradient(180deg, #191970 0%, #0077B6 50%, #A9A9A9 100%)',
    ambientColor: DF_NAVY_INDIGO,
  },
  {
    id: 'maelstrom_haven',
    name: 'Maelstrom Haven',
    description:
      'A port built inside the eye of a permanent whirlpool. Only the most skilled captains can navigate the swirling currents.',
    depth: 6,
    dangerLevel: 7,
    requiredTitle: 'title_commodore',
    fleetClass: 'schooner',
    bgGradient: 'linear-gradient(180deg, #0077B6 0%, #191970 50%, #FF7F50 100%)',
    ambientColor: DF_OCEAN_BLUE,
  },
  {
    id: 'worlds_edge',
    name: "World's Edge",
    description:
      'The final harbor at the edge of the known map. Beyond it lies only open ocean and legend. The ultimate destination for a fleet deity.',
    depth: 7,
    dangerLevel: 8,
    requiredTitle: 'title_admiral',
    fleetClass: 'caravel',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #0077B6 50%, #191970 100%)',
    ambientColor: DF_ANCHOR_GOLD,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: DF_MATERIALS — 30 Nautical Materials
// ═══════════════════════════════════════════════════════════════════

export const DF_MATERIALS: readonly DfMaterialDef[] = [
  // Common (8)
  { id: 'mat_oak_plank', name: 'Oak Plank', emoji: '🪵', type: 'plank', rarity: 'common', cannonBonus: 1, hullBonus: 3, value: 10, description: 'A sturdy oak plank salvaged from a wrecked vessel.' },
  { id: 'mat_hemp_rope', name: 'Hemp Rope', emoji: '🪢', type: 'sailcloth', rarity: 'common', cannonBonus: 0, hullBonus: 2, value: 8, description: 'Rough hemp rope used for rigging and cargo securing.' },
  { id: 'mat_sailcloth_scrap', name: 'Sailcloth Scrap', emoji: '⛵', type: 'sailcloth', rarity: 'common', cannonBonus: 1, hullBonus: 1, value: 12, description: 'A torn piece of canvas from a decommissioned sail.' },
  { id: 'mat_iron_scrap', name: 'Iron Scrap', emoji: '⚙️', type: 'cannon', rarity: 'common', cannonBonus: 3, hullBonus: 1, value: 15, description: 'Rusted iron scraps useful for patching cannon carriages.' },
  { id: 'mat_driftwood', name: 'Driftwood', emoji: '🪵', type: 'plank', rarity: 'common', cannonBonus: 0, hullBonus: 4, value: 6, description: 'Weathered wood that has floated across entire oceans.' },
  { id: 'mat_brass_nail', name: 'Brass Nail', emoji: '🔩', type: 'cannon', rarity: 'common', cannonBonus: 2, hullBonus: 2, value: 11, description: 'A brass nail used in ship construction. Still gleaming.' },
  { id: 'mat_pitch_barrel', name: 'Pitch Barrel', emoji: '🛢️', type: 'plank', rarity: 'common', cannonBonus: 0, hullBonus: 5, value: 14, description: 'A barrel of pitch for waterproofing hull seams.' },
  { id: 'mat_sea_salt', name: 'Sea Salt', emoji: '🧂', type: 'essence', rarity: 'common', cannonBonus: 1, hullBonus: 1, value: 7, description: 'Crystallized sea salt harvested from evaporated lagoon water.' },

  // Uncommon (7)
  { id: 'mat_tequila_plank', name: 'Ironwood Plank', emoji: '🪵', type: 'plank', rarity: 'uncommon', cannonBonus: 2, hullBonus: 10, value: 70, description: 'A dense ironwood plank that is nearly impervious to rot and shipworm.' },
  { id: 'mat_silk_sail', name: 'Silk Sail', emoji: '🧵', type: 'sailcloth', rarity: 'uncommon', cannonBonus: 0, hullBonus: 0, value: 85, description: 'A sail woven from sea-silk. Ships with silk sails are 20% faster.' },
  { id: 'mat_cannonball', name: 'Cast Cannonball', emoji: '⚫', type: 'cannon', rarity: 'uncommon', cannonBonus: 8, hullBonus: 0, value: 65, description: 'A standard-issue iron cannonball for shipboard artillery.' },
  { id: 'mat_brass_compact', name: 'Brass Compass', emoji: '🧭', type: 'nautical_chart', rarity: 'uncommon', cannonBonus: 2, hullBonus: 2, value: 90, description: 'A precision brass compass that always points to the nearest port.' },
  { id: 'mat_copper_sheet', name: 'Copper Sheathing', emoji: '🟤', type: 'plank', rarity: 'uncommon', cannonBonus: 3, hullBonus: 12, value: 80, description: 'Thin copper sheets used to sheath hulls against barnacles and rot.' },
  { id: 'mat_chain_shot', name: 'Chain Shot', emoji: '⛓️', type: 'cannon', rarity: 'uncommon', cannonBonus: 12, hullBonus: 0, value: 75, description: 'Two cannonballs linked by chain, designed to shred enemy rigging.' },
  { id: 'mat_barnacle_glue', name: 'Barnacle Resin', emoji: '🐚', type: 'essence', rarity: 'uncommon', cannonBonus: 0, hullBonus: 8, value: 60, description: 'A strong adhesive harvested from giant barnacles. Excellent for hull repairs.' },

  // Rare (6)
  { id: 'mat_steel_hull', name: 'Steel Hull Plate', emoji: '🔧', type: 'plank', rarity: 'rare', cannonBonus: 5, hullBonus: 25, value: 350, description: 'A pre-fabricated steel hull plate from a modern shipyard. Reinforces any vessel.' },
  { id: 'mat_naval_chart', name: 'Admiral\'s Chart', emoji: '🗺️', type: 'nautical_chart', rarity: 'rare', cannonBonus: 5, hullBonus: 5, value: 380, description: 'A master navigation chart showing hidden routes and safe harbors across the known seas.' },
  { id: 'mat_heavy_cannon', name: 'Heavy Cannon', emoji: '💥', type: 'cannon', rarity: 'rare', cannonBonus: 25, hullBonus: 0, value: 400, description: 'A 32-pounder cannon capable of punching through any wooden hull at range.' },
  { id: 'mat_dragons_silk', name: 'Dragon-silk Sail', emoji: '🐉', type: 'sailcloth', rarity: 'rare', cannonBonus: 3, hullBonus: 3, value: 320, description: 'Sailcloth woven from fibers of a sea dragon. Immune to fire and lightning.' },
  { id: 'mat_coral_essence', name: 'Living Coral Essence', emoji: '🪸', type: 'essence', rarity: 'rare', cannonBonus: 8, hullBonus: 15, value: 340, description: 'Liquid essence from living coral that can regenerate hull damage over time.' },
  { id: 'mat_powder_keg', name: 'Powder Keg', emoji: '🧨', type: 'cannon', rarity: 'rare', cannonBonus: 20, hullBonus: 0, value: 300, description: 'A keg of the finest gunpowder. Doubles cannon damage when used properly.' },

  // Epic (5)
  { id: 'mat_titanium_plate', name: 'Titanium Hull Plate', emoji: '🛡️', type: 'plank', rarity: 'epic', cannonBonus: 10, hullBonus: 60, value: 1600, description: 'A featherweight titanium plate stronger than steel. The ultimate hull reinforcement.' },
  { id: 'mat_leviathan_bone', name: 'Leviathan Bone', emoji: '🦴', type: 'plank', rarity: 'epic', cannonBonus: 5, hullBonus: 50, value: 1500, description: 'A massive bone from a sea leviathan. Hulls reinforced with it become nearly indestructible.' },
  { id: 'mat_star_chart', name: 'Celestial Star Chart', emoji: '⭐', type: 'nautical_chart', rarity: 'epic', cannonBonus: 15, hullBonus: 15, value: 1800, description: 'A chart inscribed with star maps visible only at midnight. Reveals hidden islands.' },
  { id: 'mat_kraken_ink', name: 'Kraken Ink Essence', emoji: '🐙', type: 'essence', rarity: 'epic', cannonBonus: 20, hullBonus: 20, value: 1700, description: 'Dark ink from a kraken\'s ink sac. Grants submarines perfect stealth capabilities.' },
  { id: 'mat_volcanic_cannon', name: 'Volcanic Forge Cannon', emoji: '🌋', type: 'cannon', rarity: 'epic', cannonBonus: 50, hullBonus: 0, value: 2000, description: 'A cannon forged in an underwater volcano. Its shots ignite on impact.' },

  // Legendary (4)
  { id: 'mat_abyssal_heart', name: 'Abyssal Heart', emoji: '💙', type: 'essence', rarity: 'legendary', cannonBonus: 30, hullBonus: 40, value: 9000, description: 'The crystallized heart of an abyssal creature. It pulses with deep-ocean energy.' },
  { id: 'mat_world_tree_wood', name: 'World Tree Plank', emoji: '🌲', type: 'plank', rarity: 'legendary', cannonBonus: 20, hullBonus: 80, value: 10000, description: 'A plank from a tree that grows on the ocean floor. It cannot be burned, rot, or broken.' },
  { id: 'mat_storm_god_charged', name: 'Storm God Charged Core', emoji: '⚡', type: 'essence', rarity: 'legendary', cannonBonus: 60, hullBonus: 30, value: 12000, description: 'A sphere of concentrated lightning from the heart of a hurricane. Powers any ship indefinitely.' },
  { id: 'mat_maelstrom_shard', name: 'Maelstrom Shard', emoji: '🌀', type: 'nautical_chart', rarity: 'legendary', cannonBonus: 40, hullBonus: 50, value: 11000, description: 'A crystallized fragment of a maelstrom. It contains the map to World\'s Edge encoded in water currents.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: DF_STRUCTURES — 25 Fleet Structures
// ═══════════════════════════════════════════════════════════════════

export const DF_STRUCTURES: readonly DfStructureDef[] = [
  // ── Drydocks (7) ──────────────────────────────────────────────
  { id: 'str_wooden_dock', name: 'Wooden Drydock', emoji: '🏗️', category: 'drydock', maxLevel: 10, baseEffect: 2, effectPerLevel: 1, baseCost: 50, costMultiplier: 1.4, description: 'A basic wooden dock for minor hull repairs and ship storage.' },
  { id: 'str_stone_dock', name: 'Stone Drydock', emoji: '🏰', category: 'drydock', maxLevel: 10, baseEffect: 3, effectPerLevel: 1, baseCost: 80, costMultiplier: 1.5, description: 'A reinforced stone dock that can handle larger vessels and heavier repairs.' },
  { id: 'str_iron_dock', name: 'Iron Drydock', emoji: '⚙️', category: 'drydock', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 120, costMultiplier: 1.5, description: 'An iron-framed dock with steam-powered cranes for complex ship overhauls.' },
  { id: 'str_submarine_pen', name: 'Submarine Pen', emoji: '🐋', category: 'drydock', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 180, costMultiplier: 1.6, description: 'An underwater pen for submarine maintenance and torpedo restocking.' },
  { id: 'str_galley_dock', name: 'Galley Repair Dock', emoji: '🚢', category: 'drydock', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 150, costMultiplier: 1.5, description: 'A specialized dock for repairing oar damage and hull breaches on triremes.' },
  { id: 'str_catamaran_slip', name: 'Catamaran Slipway', emoji: '⛵', category: 'drydock', maxLevel: 10, baseEffect: 4, effectPerLevel: 2, baseCost: 160, costMultiplier: 1.5, description: 'A wide slipway designed for the twin hulls of catamarans.' },
  { id: 'str_legend_dock', name: 'Legendary Shipyard', emoji: '⚓', category: 'drydock', maxLevel: 10, baseEffect: 5, effectPerLevel: 2, baseCost: 200, costMultiplier: 1.6, description: 'The ultimate shipyard. Legendary vessels can only be commissioned here.' },

  // ── Armories (6) ──────────────────────────────────────────────
  { id: 'str_cannon_foundry', name: 'Cannon Foundry', emoji: '🔥', category: 'armory', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 100, costMultiplier: 1.5, description: 'A foundry that casts and repairs shipboard cannons.' },
  { id: 'str_ballista_tower', name: 'Ballista Tower', emoji: '🏹', category: 'armory', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 250, costMultiplier: 1.6, description: 'A defensive tower equipped with ship-to-shore ballistae for port defense.' },
  { id: 'str_powder_magazine', name: 'Powder Magazine', emoji: '💣', category: 'armory', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 400, costMultiplier: 1.7, description: 'A climate-controlled magazine storing gunpowder and ammunition safely.' },
  { id: 'str_torpedo_bay', name: 'Torpedo Bay', emoji: '🐟', category: 'armory', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 600, costMultiplier: 1.8, description: 'An underwater bay for loading and maintaining submarine torpedoes.' },
  { id: 'str_iron_forge', name: 'Iron Forge', emoji: '🔨', category: 'armory', maxLevel: 10, baseEffect: 15, effectPerLevel: 7, baseCost: 900, costMultiplier: 1.9, description: 'A massive forge that smelts iron and steel for ship construction.' },
  { id: 'str_volcanic_forge', name: 'Volcanic Forge', emoji: '🌋', category: 'armory', maxLevel: 10, baseEffect: 14, effectPerLevel: 7, baseCost: 850, costMultiplier: 1.9, description: 'A forge built inside an active volcano. Produces weapons of extraordinary power.' },

  // ── Galleys (5) ───────────────────────────────────────────────
  { id: 'str_mess_hall', name: 'Fleet Mess Hall', emoji: '🍽️', category: 'galley', maxLevel: 10, baseEffect: 5, effectPerLevel: 3, baseCost: 120, costMultiplier: 1.5, description: 'A dining hall that feeds the fleet and boosts crew morale.' },
  { id: 'str_rum_distillery', name: 'Rum Distillery', emoji: '🥃', category: 'galley', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.6, description: 'A distillery producing fine rum. Essential for maintaining fleet morale.' },
  { id: 'str_scout_camp', name: 'Scout Camp', emoji: '⛺', category: 'galley', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A camp for training new crew members and scouts for reconnaissance.' },
  { id: 'str_quartermaster', name: 'Quartermaster Office', emoji: '📋', category: 'galley', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 500, costMultiplier: 1.7, description: 'The quartermaster manages provisions and supplies for the entire fleet.' },
  { id: 'str_admirals_quarter', name: "Admiral's Quarters", emoji: '👑', category: 'galley', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 800, costMultiplier: 1.8, description: 'Luxurious quarters for the fleet commander. Grants renown and boosts all ship stats.' },

  // ── Lighthouses (4) ───────────────────────────────────────────
  { id: 'str_stone_lighthouse', name: 'Stone Lighthouse', emoji: '🏮', category: 'lighthouse', maxLevel: 10, baseEffect: 8, effectPerLevel: 4, baseCost: 200, costMultiplier: 1.5, description: 'A lighthouse that guides ships safely to port and increases trade income.' },
  { id: 'str_signal_tower', name: 'Signal Tower', emoji: '📡', category: 'lighthouse', maxLevel: 10, baseEffect: 12, effectPerLevel: 6, baseCost: 450, costMultiplier: 1.7, description: 'A tower with signal flags and mirrors for long-distance fleet communication.' },
  { id: 'str_storm_beacon', name: 'Storm Beacon', emoji: '⚡', category: 'lighthouse', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 700, costMultiplier: 1.8, description: 'A beacon that warns of incoming storms and reveals hidden dangers.' },
  { id: 'str_world_beacon', name: 'World Beacon', emoji: '🌐', category: 'lighthouse', maxLevel: 10, baseEffect: 25, effectPerLevel: 12, baseCost: 1500, costMultiplier: 2.0, description: 'A beacon visible across the entire ocean. All ports become permanently visible.' },

  // ── Relic Vaults (3) ──────────────────────────────────────────
  { id: 'str_relic_case', name: 'Relic Display Case', emoji: '🖼️', category: 'relic_vault', maxLevel: 10, baseEffect: 10, effectPerLevel: 5, baseCost: 300, costMultiplier: 1.5, description: 'A glass case for displaying nautical relics and boosting their passive effects.' },
  { id: 'str_sacred_vault', name: 'Sacred Relic Vault', emoji: '🔒', category: 'relic_vault', maxLevel: 10, baseEffect: 18, effectPerLevel: 8, baseCost: 600, costMultiplier: 1.7, description: 'A magically sealed vault that preserves and amplifies the power of stored relics.' },
  { id: 'str_ocean_sanctum', name: 'Ocean Sanctum', emoji: '🌊', category: 'relic_vault', maxLevel: 10, baseEffect: 30, effectPerLevel: 15, baseCost: 2000, costMultiplier: 2.0, description: 'A sanctum blessed by the ocean itself. Relics placed here gain sentience and power.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: DF_ABILITIES — 22 Maritime Abilities
// ═══════════════════════════════════════════════════════════════════

export const DF_ABILITIES: readonly DfAbilityDef[] = [
  { id: 'ab_broadside', name: 'Broadside', emoji: '💥', fleetClass: 'galleon', type: 'active', rarity: 'common', energyCost: 5, cooldown: 30, power: 15, description: 'Fire all cannons on one side simultaneously for devastating damage.' },
  { id: 'ab_chase', name: 'Chase', emoji: '💨', fleetClass: 'frigate', type: 'active', rarity: 'common', energyCost: 8, cooldown: 45, power: 20, description: 'Engage pursuit mode, gaining burst speed to run down fleeing vessels.' },
  { id: 'ab_tailwind', name: 'Tailwind', emoji: '🌬️', fleetClass: 'schooner', type: 'active', rarity: 'common', energyCost: 10, cooldown: 60, power: 10, description: 'Catch a supernatural tailwind that doubles your sailing speed briefly.' },
  { id: 'ab_navigate', name: 'Navigate', emoji: '🧭', fleetClass: 'caravel', type: 'active', rarity: 'common', energyCost: 12, cooldown: 90, power: 5, description: 'Plot a perfect course through dangerous waters, avoiding all hazards.' },
  { id: 'ab_ram', name: 'Ram', emoji: '🔱', fleetClass: 'trireme', type: 'active', rarity: 'common', energyCost: 6, cooldown: 30, power: 12, description: 'Accelerate and drive the bronze ram into an enemy hull.' },
  { id: 'ab_twin_hull', name: 'Twin Hull', emoji: '⛵', fleetClass: 'catamaran', type: 'active', rarity: 'common', energyCost: 7, cooldown: 35, power: 10, description: 'Stabilize both hulls to absorb incoming damage and maintain speed.' },
  { id: 'ab_dive', name: 'Dive', emoji: '🌊', fleetClass: 'submarine', type: 'active', rarity: 'common', energyCost: 8, cooldown: 40, power: 18, description: 'Submerge below the waves, becoming invisible to surface ships.' },
  { id: 'ab_cargo_boost', name: 'Cargo Boost', emoji: '📦', fleetClass: 'galleon', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 30, description: 'Optimize cargo holds to carry 50% more loot from the next haul.' },
  { id: 'ab_spyglass', name: 'Spyglass', emoji: '🔭', fleetClass: 'frigate', type: 'active', rarity: 'uncommon', energyCost: 20, cooldown: 90, power: 35, description: 'Scout enemy positions and reveal hidden threats within a large radius.' },
  { id: 'ab_signal_flare', name: 'Signal Flare', emoji: '🚨', fleetClass: 'schooner', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 75, power: 28, description: 'Launch a flare that summons nearby fleet ships to your position.' },
  { id: 'ab_star_chart', name: 'Star Chart', emoji: '⭐', fleetClass: 'caravel', type: 'active', rarity: 'uncommon', energyCost: 22, cooldown: 100, power: 32, description: 'Read the stars to reveal hidden islands, reefs, and treasure locations.' },
  { id: 'ab_boarders', name: 'Boarders', emoji: '⚔️', fleetClass: 'trireme', type: 'active', rarity: 'uncommon', energyCost: 15, cooldown: 60, power: 25, description: 'Send boarding parties to capture an enemy vessel in close combat.' },
  { id: 'ab_stable_deck', name: 'Stable Deck', emoji: '🛡️', fleetClass: 'catamaran', type: 'active', rarity: 'uncommon', energyCost: 16, cooldown: 55, power: 30, description: 'Lock the deck stabilizers, making the ship immune to wave effects.' },
  { id: 'ab_torpedo', name: 'Torpedo', emoji: '🐟', fleetClass: 'submarine', type: 'active', rarity: 'uncommon', energyCost: 18, cooldown: 80, power: 35, description: 'Fire an explosive torpedo at a surface target from below.' },
  { id: 'ab_iron_hull', name: 'Iron Hull', emoji: '🛡️', fleetClass: 'galleon', type: 'passive', rarity: 'rare', energyCost: 0, cooldown: 0, power: 15, description: 'Reinforce the hull with iron plating, reducing all damage taken by 20%.' },
  { id: 'ab_flanking_run', name: 'Flanking Run', emoji: '↗️', fleetClass: 'frigate', type: 'active', rarity: 'rare', energyCost: 30, cooldown: 120, power: 50, description: 'Circle the enemy at high speed and strike from their blind side.' },
  { id: 'ab_storm_rider', name: 'Storm Rider', emoji: '🌩️', fleetClass: 'schooner', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 110, power: 45, description: 'Harness the power of a storm to gain massive speed and electrocute nearby enemies.' },
  { id: 'ab_deep_anchor', name: 'Deep Anchor', emoji: '⚓', fleetClass: 'caravel', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 120, power: 40, description: 'Drop a deep-sea anchor that stabilizes the ship and prevents being pushed by currents.' },
  { id: 'ab_bronze_bow', name: 'Bronze Bow', emoji: '🔱', fleetClass: 'trireme', type: 'active', rarity: 'rare', energyCost: 35, cooldown: 150, power: 55, description: 'Charge forward with the bronze ram energized, dealing triple ram damage.' },
  { id: 'ab_wave_splitter', name: 'Wave Splitter', emoji: '🌊', fleetClass: 'catamaran', type: 'active', rarity: 'rare', energyCost: 28, cooldown: 110, power: 45, description: 'Split a massive wave that damages nearby ships while passing through unharmed.' },
  { id: 'ab_sonar_ping', name: 'Sonar Ping', emoji: '📡', fleetClass: 'submarine', type: 'active', rarity: 'rare', energyCost: 25, cooldown: 120, power: 40, description: 'Emit a sonar pulse that reveals all submerged objects and enemy positions.' },
  { id: 'ab_abyssal_cloak', name: 'Abyssal Cloak', emoji: '🌑', fleetClass: 'submarine', type: 'active', rarity: 'epic', energyCost: 50, cooldown: 300, power: 80, description: 'Enter perfect stealth mode, invisible to all detection for an extended duration.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: DF_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const DF_ACHIEVEMENTS: readonly DfAchievementDef[] = [
  { id: 'ach_first_commission', name: 'First Commission', emoji: '🚢', description: 'Commission your first drift ship.', condition: 'commission_1', reward: { gold: 50, renown: 10 } },
  { id: 'ach_five_ships', name: 'Fleet of Five', emoji: '✋', description: 'Commission 5 different drift ships.', condition: 'commission_5', reward: { gold: 200, renown: 40 } },
  { id: 'ach_first_harvest', name: 'Cargo Collector', emoji: '📦', description: 'Harvest cargo for the first time.', condition: 'harvest_1', reward: { gold: 80, renown: 15 } },
  { id: 'ach_ten_harvests', name: 'Master Trader', emoji: '💰', description: 'Harvest cargo 10 times.', condition: 'harvest_10', reward: { gold: 300, renown: 60 } },
  { id: 'ach_first_build', name: 'Groundbreaking', emoji: '🏗️', description: 'Build your first fleet structure.', condition: 'build_1', reward: { gold: 100, renown: 20 } },
  { id: 'ach_five_builds', name: 'Port Architect', emoji: '🏘️', description: 'Build 5 different fleet structures.', condition: 'build_5', reward: { gold: 500, renown: 80 } },
  { id: 'ach_port_explore', name: 'Explorer', emoji: '🗺️', description: 'Dock at 4 different ports.', condition: 'port_4', reward: { gold: 400, renown: 50 } },
  { id: 'ach_all_ports', name: 'Ocean Cartographer', emoji: '🌍', description: 'Dock at all 8 harbor ports.', condition: 'port_8', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_rare_ship', name: 'Rare Commission', emoji: '💎', description: 'Commission a rare drift ship.', condition: 'rare_commission', reward: { gold: 500, renown: 100 } },
  { id: 'ach_epic_ship', name: 'Epic Discovery', emoji: '🌟', description: 'Commission an epic drift ship.', condition: 'epic_commission', reward: { gold: 1500, renown: 250 } },
  { id: 'ach_legendary_ship', name: 'Legendary Commander', emoji: '👑', description: 'Commission a legendary drift ship.', condition: 'legendary_commission', reward: { gold: 5000, renown: 500 } },
  { id: 'ach_first_relic', name: 'Relic Finder', emoji: '🏺', description: 'Discover your first nautical relic.', condition: 'relic_1', reward: { gold: 300, renown: 60 } },
  { id: 'ach_five_relics', name: 'Relic Collector', emoji: '🔍', description: 'Collect 5 different nautical relics.', condition: 'relic_5', reward: { gold: 1000, renown: 150 } },
  { id: 'ach_first_event', name: 'Event Survivor', emoji: '⚡', description: 'Survive your first ocean event.', condition: 'event_1', reward: { gold: 200, renown: 30 } },
  { id: 'ach_ten_events', name: 'Event Veteran', emoji: '🏅', description: 'Survive 10 ocean events.', condition: 'event_10', reward: { gold: 800, renown: 120 } },
  { id: 'ach_upgrade_max', name: 'Master Builder', emoji: '🔨', description: 'Upgrade any structure to level 10.', condition: 'upgrade_10', reward: { gold: 2000, renown: 200 } },
  { id: 'ach_all_classes', name: 'Fleet Master', emoji: '🌈', description: 'Commission at least one ship of each fleet class.', condition: 'all_classes', reward: { gold: 3000, renown: 300 } },
  { id: 'ach_fleet_deity', name: 'Fleet Deity', emoji: '👑', description: 'Reach the title of Fleet Deity.', condition: 'max_title', reward: { gold: 10000, renown: 1000 } },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: DF_TITLES — 8 Maritime Titles
// ═══════════════════════════════════════════════════════════════════

export const DF_TITLES: readonly DfTitleDef[] = [
  { id: 'title_deck_hand', name: 'Deck Hand', emoji: '👶', minRenown: 0, minShips: 0, description: 'A novice who has just stepped aboard their first ship.' },
  { id: 'title_able_seaman', name: 'Able Seaman', emoji: '🧑‍cargo', minRenown: 50, minShips: 3, description: 'A competent sailor who can handle ropes, sails, and basic navigation.' },
  { id: 'title_boatswain', name: 'Boatswain', emoji: '🪖', minRenown: 200, minShips: 7, description: 'A seasoned boatswain who commands the deck crew and maintains the vessel.' },
  { id: 'title_first_mate', name: 'First Mate', emoji: '🧭', minRenown: 500, minShips: 12, description: 'The second-in-command of a ship. A trusted leader who can sail any vessel.' },
  { id: 'title_captain', name: 'Captain', emoji: '⚓', minRenown: 1200, minShips: 18, description: 'A ship\'s captain with full command authority. Respected across every port.' },
  { id: 'title_commodore', name: 'Commodore', emoji: '🚢', minRenown: 2500, minShips: 24, description: 'A commodore who commands a squadron of ships across multiple seas.' },
  { id: 'title_admiral', name: 'Admiral', emoji: '🏆', minRenown: 5000, minShips: 30, description: 'An admiral whose fleet spans the horizon. Their name is spoken with fear and awe.' },
  { id: 'title_fleet_deity', name: 'Fleet Deity', emoji: '👑', minRenown: 10000, minShips: 35, description: 'A legendary being who commands the ocean itself. Master of all fleets and lord of every tide.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: DF_RELICS — 15 Legendary Nautical Relics
// ═══════════════════════════════════════════════════════════════════

export const DF_RELICS: readonly DfRelicDef[] = [
  { id: 'relic_captains_wheel', name: "Captain's Wheel", emoji: '🔄', rarity: 'epic', fleetClass: 'schooner', cannonBoost: 15, hullBoost: 10, speedBoost: 25, value: 2000, description: 'A wheel carved from driftwood that turns of its own accord toward danger.' },
  { id: 'relic_anchors_blessing', name: "Anchor's Blessing", emoji: '⚓', rarity: 'epic', fleetClass: 'galleon', cannonBoost: 10, hullBoost: 30, speedBoost: 5, value: 2200, description: 'A blessed anchor that holds any ship steady in the fiercest storm.' },
  { id: 'relic_trident_shard', name: 'Trident Shard', emoji: '🔱', rarity: 'rare', fleetClass: 'trireme', cannonBoost: 20, hullBoost: 20, speedBoost: 10, value: 800, description: 'A fragment of a divine trident. Ships carrying it never run aground.' },
  { id: 'relic_sirens_horn', name: "Siren's Horn", emoji: '📯', rarity: 'rare', fleetClass: 'caravel', cannonBoost: 5, hullBoost: 15, speedBoost: 20, value: 750, description: 'A horn carved from a conch shell. When blown, it calms all seas within earshot.' },
  { id: 'relic_kraken_eye', name: 'Kraken Eye', emoji: '👁️', rarity: 'epic', fleetClass: 'submarine', cannonBoost: 25, hullBoost: 20, speedBoost: 15, value: 2500, description: 'A crystallized eye from a kraken. It allows submarines to see through murky depths.' },
  { id: 'relic_neptune_crown', name: "Neptune's Crown", emoji: '👑', rarity: 'epic', fleetClass: 'frigate', cannonBoost: 20, hullBoost: 15, speedBoost: 20, value: 2400, description: 'A coral crown blessed by Neptune. It grants its wearer command over the tides.' },
  { id: 'relic_leviathan_scale', name: 'Leviathan Scale', emoji: '🐉', rarity: 'epic', fleetClass: 'galleon', cannonBoost: 15, hullBoost: 35, speedBoost: 10, value: 2600, description: 'A scale from a sea leviathan. Hulls reinforced with it glow with deep-sea light.' },
  { id: 'relic_poseidon_trident', name: "Poseidon's Trident", emoji: '🔱', rarity: 'legendary', fleetClass: 'trireme', cannonBoost: 40, hullBoost: 30, speedBoost: 20, value: 8000, description: 'The actual trident of Poseidon. It commands the sea and all creatures within it.' },
  { id: 'relic_davy_jones_locker', name: "Davy Jones' Locker", emoji: '🗄️', rarity: 'legendary', fleetClass: 'submarine', cannonBoost: 30, hullBoost: 50, speedBoost: 15, value: 7500, description: 'A supernatural locker that imprisons defeated ships. Enemies retreat in terror.' },
  { id: 'relic_flying_dutchman_flag', name: 'Flying Dutchman Flag', emoji: '🏴', rarity: 'legendary', fleetClass: 'schooner', cannonBoost: 60, hullBoost: 20, speedBoost: 25, value: 10000, description: 'The tattered flag of the Flying Dutchman. Ships under it sail faster than the wind.' },
  { id: 'relic_ocean_heart', name: 'Ocean Heart', emoji: '💙', rarity: 'legendary', fleetClass: 'catamaran', cannonBoost: 25, hullBoost: 40, speedBoost: 30, value: 9000, description: 'The living heart of the ocean itself. It heals all ships and calms all waters.' },
  { id: 'relic_storm_glass', name: 'Storm Glass', emoji: '🔮', rarity: 'legendary', fleetClass: 'caravel', cannonBoost: 35, hullBoost: 35, speedBoost: 35, value: 9500, description: 'A magical glass that predicts and controls weather. Storms obey its bearer.' },
  { id: 'relic_maelstrom_stone', name: 'Maelstrom Stone', emoji: '🌀', rarity: 'epic', fleetClass: 'catamaran', cannonBoost: 20, hullBoost: 25, speedBoost: 30, value: 2300, description: 'A stone from the center of a permanent whirlpool. It stabilizes any vessel.' },
  { id: 'relic_aurora_shell', name: 'Aurora Shell', emoji: '🐚', rarity: 'legendary', fleetClass: 'frigate', cannonBoost: 50, hullBoost: 45, speedBoost: 30, value: 11000, description: 'A iridescent shell from a mythical sea snail. It creates aurora borealis over the ocean.' },
  { id: 'relic_tide_crest', name: 'Tide Crest', emoji: '🌊', rarity: 'legendary', fleetClass: 'schooner', cannonBoost: 35, hullBoost: 35, speedBoost: 45, value: 12000, description: 'A crest made of frozen tidal energy. It lets its bearer ride any wave like a surfboard.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: DF_EVENTS — 12 Ocean Events
// ═══════════════════════════════════════════════════════════════════

export const DF_EVENTS: readonly DfEventDef[] = [
  { id: 'evt_golden_tide', name: 'Golden Tide', emoji: '✨', durationTurns: 5, effectType: 'buff', effectDescription: 'Gold rewards doubled. All fleet morale boosted.', description: 'A shimmering tide of golden light washes over the fleet, bringing fortune and high spirits.' },
  { id: 'evt_hurricane', name: 'Great Hurricane', emoji: '🌀', durationTurns: 3, effectType: 'debuff', effectDescription: 'Speed reduced by 40%. Schooners immune.', description: 'A category five hurricane bears down on the fleet. All ships must battened down.' },
  { id: 'evt_kraken_awakening', name: 'Kraken Awakening', emoji: '🐙', durationTurns: 4, effectType: 'special', effectDescription: 'Submarine power doubled. Rare materials appear.', description: 'A kraken surfaces from the deep, disturbing the ocean and revealing sunken treasures.' },
  { id: 'evt_northern_lights', name: 'Aurora Over Ocean', emoji: '🌌', durationTurns: 2, effectType: 'special', effectDescription: 'Caravel speed tripled. Frigate power halved.', description: 'The northern lights reflect across the ocean. Caravels bask in their guiding glow.' },
  { id: 'evt_scurvy_outbreak', name: 'Scurvy Outbreak', emoji: '🤢', durationTurns: 3, effectType: 'debuff', effectDescription: 'Morale drops 30%. Galley structures double effect.', description: 'Scurvy spreads through the fleet. Only proper provisions can restore the crew\'s health.' },
  { id: 'evt_merchant_convoy', name: 'Merchant Convoy', emoji: '🚢', durationTurns: 5, effectType: 'buff', effectDescription: 'Trade income tripled. Galleon stats boosted.', description: 'A massive merchant convoy offers to trade with the fleet at exceptional rates.' },
  { id: 'evt_fog_bank', name: 'Dense Fog Bank', emoji: '🌫️', durationTurns: 4, effectType: 'buff', effectDescription: 'All ships gain stealth. Detection range halved.', description: 'An unnatural fog envelops the fleet, hiding it from enemies and rival fleets.' },
  { id: 'evt_pirate_raid', name: 'Pirate Raid', emoji: '🏴‍☠️', durationTurns: 2, effectType: 'debuff', effectDescription: 'Lose 10% gold. Relic discovery chance increased.', description: 'Pirates attack the fleet! But among their plunder lies something ancient and valuable.' },
  { id: 'evt_whale_migration', name: 'Whale Migration', emoji: '🐋', durationTurns: 3, effectType: 'buff', effectDescription: 'Provisions restored. Speed increased for catamarans.', description: 'Thousands of whales pass through the area. The fleet follows them to rich feeding grounds.' },
  { id: 'evt_tsunami', name: 'Tsunami Warning', emoji: '🌊', durationTurns: 5, effectType: 'debuff', effectDescription: 'Catamaran power halved. Trireme power doubled.', description: 'A massive tsunami approaches. Catamarans struggle while triremes ride the surge.' },
  { id: 'evt_ghost_fleet', name: 'Ghost Fleet Sighting', emoji: '👻', durationTurns: 3, effectType: 'special', effectDescription: 'Bonus renown per action. Legendary ship chance rises.', description: 'A spectral fleet appears on the horizon. Interacting with it yields otherworldly rewards.' },
  { id: 'evt_solar_eclipse', name: 'Ocean Eclipse', emoji: '🌑', durationTurns: 6, effectType: 'buff', effectDescription: 'Taming chance doubled. New ship classes available.', description: 'The sun darkens over the ocean. In the twilight, rare ships appear at every port.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: INTERNAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const DF_MAX_SHIP_LEVEL = 50
const DF_MAX_STRUCTURE_LEVEL = 10
const DF_INITIAL_GOLD = 200
const DF_INITIAL_RENOWN = 0

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: HELPER FUNCTIONS (hoisted with `function`)
// ═══════════════════════════════════════════════════════════════════

function dfXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.25, level - 1))
}

function dfCalcShipStats(species: DfShipSpecies, level: number) {
  const growth = 1 + (level - 1) * 0.12
  return {
    cannonPower: Math.floor(species.cannonPower * growth),
    hullStrength: Math.floor(species.hullStrength * growth),
    speed: Math.floor(species.speed * growth),
  }
}

let _dfIdCounter = 0
function dfGenerateId(): string {
  _dfIdCounter += 1
  return `df_${_dfIdCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`
}

function dfFindShipDef(id: string): DfShipSpecies | undefined {
  return DF_SHIPS.find((s) => s.id === id)
}

function dfFindPort(id: string): DfPortDef | undefined {
  return DF_PORTS.find((p) => p.id === id)
}

function dfFindMaterial(id: string): DfMaterialDef | undefined {
  return DF_MATERIALS.find((m) => m.id === id)
}

function dfFindStructureDef(id: string): DfStructureDef | undefined {
  return DF_STRUCTURES.find((s) => s.id === id)
}

function dfFindAbility(id: string): DfAbilityDef | undefined {
  return DF_ABILITIES.find((a) => a.id === id)
}

function dfFindRelic(id: string): DfRelicDef | undefined {
  return DF_RELICS.find((r) => r.id === id)
}

function dfFindAchievement(id: string): DfAchievementDef | undefined {
  return DF_ACHIEVEMENTS.find((a) => a.id === id)
}

function dfFindTitle(id: DfTitleId): DfTitleDef | undefined {
  return DF_TITLES.find((t) => t.id === id)
}

function dfRarityMultiplier(rarity: DfRarity): number {
  switch (rarity) {
    case 'common': return 1
    case 'uncommon': return 2
    case 'rare': return 5
    case 'epic': return 10
    case 'legendary': return 25
    default: return 1
  }
}

function dfRarityColor(rarity: DfRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'uncommon': return '#34d399'
    case 'rare': return '#60a5fa'
    case 'epic': return '#a78bfa'
    case 'legendary': return '#fbbf24'
    default: return '#9ca3af'
  }
}

function dfFleetClassColor(fleetClass: DfFleetClass): string {
  switch (fleetClass) {
    case 'galleon': return DF_DECK_BROWN
    case 'frigate': return DF_OCEAN_BLUE
    case 'schooner': return DF_SAIL_WHITE
    case 'caravel': return DF_CORAL_PINK
    case 'trireme': return DF_HULL_BLACK
    case 'catamaran': return DF_ANCHOR_GOLD
    case 'submarine': return DF_NAVY_INDIGO
    default: return '#888888'
  }
}

export function dfCheckFleetSynergy(attacker: DfFleetClass, defender: DfFleetClass): number {
  const advantages = DF_SYNERGY_MAP[attacker]
  if (advantages?.includes(defender)) return 1.4
  const disadvantages = DF_SYNERGY_MAP[defender]
  if (disadvantages?.includes(attacker)) return 0.7
  return 1.0
}

function dfCalcStructureUpgradeCost(def: DfStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel))
}

function dfCalcMaxTitle(renown: number, shipCount: number): DfTitleId {
  let bestId: DfTitleId = 'title_deck_hand'
  for (const title of DF_TITLES) {
    if (renown >= title.minRenown && shipCount >= title.minShips) {
      bestId = title.id
    }
  }
  return bestId
}

function dfCheckAchievementCondition(
  condition: string,
  state: DfStoreState
): boolean {
  switch (condition) {
    case 'commission_1':
      return state.totalCommissioned >= 1
    case 'commission_5':
      return state.totalCommissioned >= 5
    case 'harvest_1':
      return state.totalHarvested >= 1
    case 'harvest_10':
      return state.totalHarvested >= 10
    case 'build_1':
      return state.totalBuilt >= 1
    case 'build_5':
      return state.totalBuilt >= 5
    case 'port_4':
      return state.ports.length >= 4
    case 'port_8':
      return state.ports.length >= 8
    case 'rare_commission':
      return state.ships.some((s) => {
        const sp = dfFindShipDef(s.shipDefId)
        return sp && (sp.rarity === 'rare' || sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'epic_commission':
      return state.ships.some((s) => {
        const sp = dfFindShipDef(s.shipDefId)
        return sp && (sp.rarity === 'epic' || sp.rarity === 'legendary')
      })
    case 'legendary_commission':
      return state.ships.some((s) => {
        const sp = dfFindShipDef(s.shipDefId)
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
    case 'all_classes': {
      const classes = new Set<DfFleetClass>()
      for (const s of state.ships) {
        const sp = dfFindShipDef(s.shipDefId)
        if (sp) classes.add(sp.fleetClass)
      }
      return classes.size >= 7
    }
    case 'max_title':
      return state.currentTitle === 'title_fleet_deity'
    default:
      return false
  }
}

function dfPickRandomEvent(): DfEventDef {
  const idx = Math.floor(Math.random() * DF_EVENTS.length)
  return DF_EVENTS[idx]
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════════════════

const useDFStore = create<DfFullStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────
      ships: [] as DfShipInstance[],
      ports: [] as string[],
      materials: [] as { materialId: string; count: number }[],
      structures: [] as DfStructureInstance[],
      abilities: [] as string[],
      achievements: [] as string[],
      relics: [] as string[],
      currentTitle: 'title_deck_hand' as DfTitleId,
      gold: DF_INITIAL_GOLD,
      renown: DF_INITIAL_RENOWN,
      totalCommissioned: 0,
      totalHarvested: 0,
      totalBuilt: 0,
      totalEventsFaced: 0,
      activeEvent: null as DfEventDef | null,
      eventTurnsRemaining: 0,
      activePort: null as string | null,

      // ── dfCommissionShip ──────────────────────────────────────
      dfCommissionShip: (shipDefId: string): boolean => {
        const species = dfFindShipDef(shipDefId)
        if (!species) return false
        const cost = Math.floor(50 * dfRarityMultiplier(species.rarity))
        const state = get()
        if (state.gold < cost) return false
        const stats = dfCalcShipStats(species, 1)
        const newShip: DfShipInstance = {
          id: dfGenerateId(),
          shipDefId,
          name: species.name,
          level: 1,
          xp: 0,
          cannonPower: stats.cannonPower,
          hullStrength: stats.hullStrength,
          speed: stats.speed,
          morale: 80,
          provisions: 70,
          commissionedAt: Date.now(),
        }
        set((prev) => {
          const newRenown = prev.renown + dfRarityMultiplier(species.rarity) * 5
          return {
            ships: [...prev.ships, newShip],
            gold: prev.gold - cost,
            totalCommissioned: prev.totalCommissioned + 1,
            renown: newRenown,
            currentTitle: dfCalcMaxTitle(newRenown, prev.ships.length + 1),
          }
        })
        return true
      },

      // ── dfDecommissionShip ────────────────────────────────────
      dfDecommissionShip: (shipId: string): boolean => {
        const state = get()
        const exists = state.ships.find((s) => s.id === shipId)
        if (!exists) return false
        const species = dfFindShipDef(exists.shipDefId)
        const refund = species ? Math.floor(25 * dfRarityMultiplier(species.rarity)) : 10
        set((prev) => ({
          ships: prev.ships.filter((s) => s.id !== shipId),
          gold: prev.gold + refund,
          currentTitle: dfCalcMaxTitle(prev.renown, prev.ships.length - 1),
        }))
        return true
      },

      // ── dfCrewShip ───────────────────────────────────────────
      dfCrewShip: (shipId: string): boolean => {
        const crewCost = 10
        const state = get()
        if (state.gold < crewCost) return false
        set((prev) => {
          const ships = prev.ships.map((s) => {
            if (s.id !== shipId) return s
            const newXp = s.xp + 20
            const xpNeeded = dfXpForLevel(s.level)
            let newLevel = s.level
            let currentXp = newXp
            if (currentXp >= xpNeeded && s.level < DF_MAX_SHIP_LEVEL) {
              newLevel = s.level + 1
              currentXp = newXp - xpNeeded
            }
            const species = dfFindShipDef(s.shipDefId)
            const stats = species
              ? dfCalcShipStats(species, newLevel)
              : { cannonPower: s.cannonPower, hullStrength: s.hullStrength, speed: s.speed }
            return {
              ...s,
              level: newLevel,
              xp: currentXp,
              cannonPower: stats.cannonPower,
              hullStrength: stats.hullStrength,
              speed: stats.speed,
              morale: Math.min(100, s.morale + 10),
              provisions: Math.min(100, s.provisions + 20),
            }
          })
          return { ships, gold: prev.gold - crewCost, renown: prev.renown + 2 }
        })
        return true
      },

      // ── dfHarvestCargo ────────────────────────────────────────
      dfHarvestCargo: (shipId: string): boolean => {
        const state = get()
        const ship = state.ships.find((s) => s.id === shipId)
        if (!ship) return false
        if (ship.provisions < 20) return false
        const species = dfFindShipDef(ship.shipDefId)
        if (!species) return false
        const materialId = `mat_${species.fleetClass}_${species.rarity}_cargo`
        const existingMaterial = state.materials.find((m) => m.materialId === materialId)
        const amount = Math.ceil(ship.cannonPower / 10)
        set((prev) => ({
          materials: existingMaterial
            ? prev.materials.map((m) => (m.materialId === materialId ? { ...m, count: m.count + amount } : m))
            : [...prev.materials, { materialId, count: amount }],
          totalHarvested: prev.totalHarvested + 1,
          renown: prev.renown + 3,
          ships: prev.ships.map((s) =>
            s.id === shipId ? { ...s, provisions: Math.max(0, s.provisions - 20) } : s
          ),
        }))
        return true
      },

      // ── dfBuildStructure ──────────────────────────────────────
      dfBuildStructure: (structureDefId: string): boolean => {
        const def = dfFindStructureDef(structureDefId)
        if (!def) return false
        const state = get()
        if (state.gold < def.baseCost) return false
        const alreadyBuilt = state.structures.find((s) => s.structureDefId === structureDefId)
        if (alreadyBuilt) return false
        const newStructure: DfStructureInstance = {
          id: dfGenerateId(),
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

      // ── dfUpgradeStructure ────────────────────────────────────
      dfUpgradeStructure: (structureId: string): boolean => {
        const state = get()
        const structure = state.structures.find((s) => s.id === structureId)
        if (!structure) return false
        if (structure.level >= DF_MAX_STRUCTURE_LEVEL) return false
        const def = dfFindStructureDef(structure.structureDefId)
        if (!def) return false
        const cost = dfCalcStructureUpgradeCost(def, structure.level)
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

      // ── dfDockAtPort ──────────────────────────────────────────
      dfDockAtPort: (portId: string): DfEventDef | null => {
        const port = dfFindPort(portId)
        if (!port) return null
        const state = get()
        const requiredTitleIdx = DF_TITLES.findIndex((t) => t.id === port.requiredTitle)
        const currentTitleIdx = DF_TITLES.findIndex((t) => t.id === state.currentTitle)
        if (currentTitleIdx < requiredTitleIdx) return null
        const newPorts = state.ports.includes(portId) ? state.ports : [...state.ports, portId]
        const event = dfPickRandomEvent()
        set((prev) => ({
          ports: newPorts,
          activePort: portId,
          activeEvent: event,
          eventTurnsRemaining: event.durationTurns,
          totalEventsFaced: prev.totalEventsFaced + 1,
          renown: prev.renown + 5,
        }))
        return event
      },

      // ── dfCollectRelic ────────────────────────────────────────
      dfCollectRelic: (relicId: string): boolean => {
        const relic = dfFindRelic(relicId)
        if (!relic) return false
        const state = get()
        if (state.relics.includes(relicId)) return false
        set((prev) => {
          const newRenown = prev.renown + Math.floor(dfRarityMultiplier(relic.rarity) * 20)
          return {
            relics: [...prev.relics, relicId],
            renown: newRenown,
            currentTitle: dfCalcMaxTitle(newRenown, prev.ships.length),
          }
        })
        return true
      },

      // ── dfUnlockAbility ───────────────────────────────────────
      dfUnlockAbility: (abilityId: string): boolean => {
        const ability = dfFindAbility(abilityId)
        if (!ability) return false
        const state = get()
        if (state.abilities.includes(abilityId)) return false
        const cost = Math.floor(100 * dfRarityMultiplier(ability.rarity))
        if (state.gold < cost) return false
        set((prev) => ({
          abilities: [...prev.abilities, abilityId],
          gold: prev.gold - cost,
        }))
        return true
      },

      // ── dfUnlockTitle ─────────────────────────────────────────
      dfUnlockTitle: (titleId: DfTitleId): boolean => {
        const title = dfFindTitle(titleId)
        if (!title) return false
        const state = get()
        if (state.renown < title.minRenown) return false
        if (state.ships.length < title.minShips) return false
        set((prev) => ({ currentTitle: titleId }))
        return true
      },

      // ── dfClaimAchievement ────────────────────────────────────
      dfClaimAchievement: (achievementId: string): boolean => {
        const achievement = dfFindAchievement(achievementId)
        if (!achievement) return false
        const state = get()
        if (state.achievements.includes(achievementId)) return false
        if (!dfCheckAchievementCondition(achievement.condition, state)) return false
        set((prev) => {
          const newRenown = prev.renown + achievement.reward.renown
          return {
            achievements: [...prev.achievements, achievementId],
            gold: prev.gold + achievement.reward.gold,
            renown: newRenown,
            currentTitle: dfCalcMaxTitle(newRenown, prev.ships.length),
          }
        })
        return true
      },

      // ── dfTradeMaterial ───────────────────────────────────────
      dfTradeMaterial: (materialId: string, count: number): number => {
        const material = dfFindMaterial(materialId)
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

      // ── dfEndEvent ────────────────────────────────────────────
      dfEndEvent: () => {
        set({ activeEvent: null, eventTurnsRemaining: 0 })
      },

      // ── dfResetEvent ──────────────────────────────────────────
      dfResetEvent: () => {
        const event = dfPickRandomEvent()
        set({ activeEvent: event, eventTurnsRemaining: event.durationTurns })
      },
    }),
    {
      name: 'drift-fleet-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: MAIN HOOK — useDriftFleet()
// ═══════════════════════════════════════════════════════════════════

export default function useDriftFleet() {
  const store = useDFStore()

  // ── Computed: Owned ships with def info ──────────────────────
  const dfOwnedShips = useMemo(() => {
    return store.ships.map((s) => {
      const species = dfFindShipDef(s.shipDefId)
      return {
        ...s,
        shipDef: species,
        fleetClassColor: species ? dfFleetClassColor(species.fleetClass) : '#888888',
        rarityColor: species ? dfRarityColor(species.rarity) : '#888888',
      }
    })
  }, [store])

  // ── Computed: Available ship defs to commission ──────────────
  const dfAvailableShipDefs = useMemo(() => {
    return DF_SHIPS.filter((sp) => {
      const cost = Math.floor(50 * dfRarityMultiplier(sp.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Current title details ──────────────────────────
  const dfCurrentTitleDetail = useMemo(() => {
    return dfFindTitle(store.currentTitle) ?? DF_TITLES[0]
  }, [store])

  // ── Computed: Next title info ────────────────────────────────
  const dfNextTitle = useMemo(() => {
    const currentIdx = DF_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= DF_TITLES.length - 1) return null
    return DF_TITLES[currentIdx + 1]
  }, [store])

  // ── Computed: Active port details ────────────────────────────
  const dfActivePortDetail = useMemo(() => {
    if (!store.activePort) return null
    return dfFindPort(store.activePort) ?? null
  }, [store])

  // ── Computed: Undiscovered ports ─────────────────────────────
  const dfUndiscoveredPorts = useMemo(() => {
    return DF_PORTS.filter((p) => !store.ports.includes(p.id))
  }, [store])

  // ── Computed: Built structures with defs ─────────────────────
  const dfBuiltStructures = useMemo(() => {
    return store.structures.map((s) => {
      const def = dfFindStructureDef(s.structureDefId)
      return { ...s, def }
    })
  }, [store])

  // ── Computed: Unlockable abilities ───────────────────────────
  const dfUnlockableAbilities = useMemo(() => {
    return DF_ABILITIES.filter((a) => {
      if (store.abilities.includes(a.id)) return false
      const cost = Math.floor(100 * dfRarityMultiplier(a.rarity))
      return store.gold >= cost
    })
  }, [store])

  // ── Computed: Collected relics with defs ─────────────────────
  const dfCollectedRelics = useMemo(() => {
    return store.relics
      .map((rId) => dfFindRelic(rId))
      .filter((r): r is DfRelicDef => r !== null)
  }, [store])

  // ── Computed: Unclaimed achievements ─────────────────────────
  const dfUnclaimedAchievements = useMemo(() => {
    return DF_ACHIEVEMENTS.filter((a) => {
      if (store.achievements.includes(a.id)) return false
      return dfCheckAchievementCondition(a.condition, store)
    })
  }, [store])

  // ── Computed: Materials with defs ────────────────────────────
  const dfInventoryMaterials = useMemo(() => {
    return store.materials.map((m) => {
      const def = dfFindMaterial(m.materialId)
      return { ...m, def }
    })
  }, [store])

  // ── Computed: Total structure effect bonus ───────────────────
  const dfTotalFleetStructureEffect = useMemo(() => {
    let totalEffect = 0
    for (const s of store.structures) {
      const def = dfFindStructureDef(s.structureDefId)
      if (def) {
        totalEffect += def.baseEffect + def.effectPerLevel * (s.level - 1)
      }
    }
    return totalEffect
  }, [store])

  // ── Computed: Average ship level ─────────────────────────────
  const dfAverageShipLevel = useMemo(() => {
    if (store.ships.length === 0) return 0
    const total = store.ships.reduce((sum, s) => sum + s.level, 0)
    return Math.floor(total / store.ships.length)
  }, [store])

  // ── Computed: Total fleet power ──────────────────────────────
  const dfTotalFleetPower = useMemo(() => {
    return store.ships.reduce(
      (sum, s) => sum + s.cannonPower + s.hullStrength + s.speed,
      0
    )
  }, [store])

  // ── Computed: Fleet class distribution ───────────────────────
  const dfFleetClassDistribution = useMemo(() => {
    const counts: Record<DfFleetClass, number> = {
      galleon: 0, frigate: 0, schooner: 0, caravel: 0, trireme: 0, catamaran: 0, submarine: 0,
    }
    for (const s of store.ships) {
      const sp = dfFindShipDef(s.shipDefId)
      if (sp) counts[sp.fleetClass]++
    }
    return counts
  }, [store])

  // ── Computed: Rarity distribution ────────────────────────────
  const dfRarityDistribution = useMemo(() => {
    const counts: Record<DfRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    }
    for (const s of store.ships) {
      const sp = dfFindShipDef(s.shipDefId)
      if (sp) counts[sp.rarity]++
    }
    return counts
  }, [store])

  // ── Computed: Ships by rarity ────────────────────────────────
  const dfShipsByRarity = useMemo(() => {
    const groups: Record<DfRarity, DfShipInstance[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const s of store.ships) {
      const sp = dfFindShipDef(s.shipDefId)
      if (sp) groups[sp.rarity].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Ships by class ─────────────────────────────────
  const dfShipsByClass = useMemo(() => {
    const groups: Record<DfFleetClass, DfShipInstance[]> = {
      galleon: [], frigate: [], schooner: [], caravel: [], trireme: [], catamaran: [], submarine: [],
    }
    for (const s of store.ships) {
      const sp = dfFindShipDef(s.shipDefId)
      if (sp) groups[sp.fleetClass].push(s)
    }
    return groups
  }, [store])

  // ── Computed: Progress to next title ──────────────────────────
  const dfTitleProgress = useMemo(() => {
    const currentIdx = DF_TITLES.findIndex((t) => t.id === store.currentTitle)
    if (currentIdx >= DF_TITLES.length - 1) {
      return { percent: 100, renownNeeded: 0, shipsNeeded: 0 }
    }
    const next = DF_TITLES[currentIdx + 1]
    const renownProgress = Math.min(100, (store.renown / next.minRenown) * 100)
    const shipProgress = Math.min(100, (store.ships.length / next.minShips) * 100)
    return {
      percent: Math.floor((renownProgress + shipProgress) / 2),
      renownNeeded: Math.max(0, next.minRenown - store.renown),
      shipsNeeded: Math.max(0, next.minShips - store.ships.length),
    }
  }, [store])

  // ── Computed: Rare materials count ───────────────────────────
  const dfRareMaterialCount = useMemo(() => {
    let count = 0
    for (const m of store.materials) {
      const def = dfFindMaterial(m.materialId)
      if (def && (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary')) {
        count += m.count
      }
    }
    return count
  }, [store])

  // ── Computed: Low provisions ships ───────────────────────────
  const dfLowProvisionsShips = useMemo(() => {
    return store.ships.filter((s) => s.provisions < 30)
  }, [store])

  // ── Computed: Low morale ships ───────────────────────────────
  const dfLowMoraleShips = useMemo(() => {
    return store.ships.filter((s) => s.morale < 30)
  }, [store])

  // ── Computed: Total relic boost ──────────────────────────────
  const dfTotalRelicBoost = useMemo(() => {
    let cannonBoost = 0
    let hullBoost = 0
    let speedBoost = 0
    for (const rId of store.relics) {
      const relic = dfFindRelic(rId)
      if (relic) {
        cannonBoost += relic.cannonBoost
        hullBoost += relic.hullBoost
        speedBoost += relic.speedBoost
      }
    }
    return { cannonBoost, hullBoost, speedBoost }
  }, [store])

  // ═════════════════════════════════════════════════════════════
  // Return dfAPI object
  // ═════════════════════════════════════════════════════════════

  const dfAPI = {
    // ── Direct constants ──────────────────────────────────────
    DF_OCEAN_BLUE,
    DF_DECK_BROWN,
    DF_SAIL_WHITE,
    DF_HULL_BLACK,
    DF_ANCHOR_GOLD,
    DF_FOG_GRAY,
    DF_CORAL_PINK,
    DF_NAVY_INDIGO,
    DF_CLASSES,
    DF_RARITIES,
    DF_SHIPS,
    DF_PORTS,
    DF_MATERIALS,
    DF_STRUCTURES,
    DF_ABILITIES,
    DF_ACHIEVEMENTS,
    DF_TITLES,
    DF_RELICS,
    DF_EVENTS,
    dfCheckFleetSynergy,

    // ── Store state ───────────────────────────────────────────
    ships: store.ships,
    ports: store.ports,
    materials: store.materials,
    structures: store.structures,
    abilities: store.abilities,
    achievements: store.achievements,
    relics: store.relics,
    currentTitle: store.currentTitle,
    gold: store.gold,
    renown: store.renown,
    totalCommissioned: store.totalCommissioned,
    totalHarvested: store.totalHarvested,
    totalBuilt: store.totalBuilt,
    totalEventsFaced: store.totalEventsFaced,
    activeEvent: store.activeEvent,
    eventTurnsRemaining: store.eventTurnsRemaining,
    activePort: store.activePort,

    // ── Store actions ─────────────────────────────────────────
    dfCommissionShip: store.dfCommissionShip,
    dfDecommissionShip: store.dfDecommissionShip,
    dfCrewShip: store.dfCrewShip,
    dfHarvestCargo: store.dfHarvestCargo,
    dfBuildStructure: store.dfBuildStructure,
    dfUpgradeStructure: store.dfUpgradeStructure,
    dfDockAtPort: store.dfDockAtPort,
    dfCollectRelic: store.dfCollectRelic,
    dfUnlockAbility: store.dfUnlockAbility,
    dfUnlockTitle: store.dfUnlockTitle,
    dfClaimAchievement: store.dfClaimAchievement,
    dfTradeMaterial: store.dfTradeMaterial,
    dfEndEvent: store.dfEndEvent,
    dfResetEvent: store.dfResetEvent,

    // ── Computed getters ──────────────────────────────────────
    dfOwnedShips,
    dfAvailableShipDefs,
    dfCurrentTitleDetail,
    dfNextTitle,
    dfActivePortDetail,
    dfUndiscoveredPorts,
    dfBuiltStructures,
    dfUnlockableAbilities,
    dfCollectedRelics,
    dfUnclaimedAchievements,
    dfInventoryMaterials,
    dfTotalFleetStructureEffect,
    dfAverageShipLevel,
    dfTotalFleetPower,
    dfFleetClassDistribution,
    dfRarityDistribution,
    dfShipsByRarity,
    dfShipsByClass,
    dfTitleProgress,
    dfRareMaterialCount,
    dfLowProvisionsShips,
    dfLowMoraleShips,
    dfTotalRelicBoost,
  }

  return dfAPI
}
