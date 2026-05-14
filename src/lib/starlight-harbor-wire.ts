import { useState, useCallback, useMemo } from 'react';

// ─── Seeded PRNG ────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function (): number {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Rarity Constants ────────────────────────────────────────────────────────

export const SH_RARITY_COMMON = 'common';
export const SH_RARITY_UNCOMMON = 'uncommon';
export const SH_RARITY_RARE = 'rare';
export const SH_RARITY_EPIC = 'epic';
export const SH_RARITY_LEGENDARY = 'legendary';

export const SH_ALL_RARITIES: string[] = [
  SH_RARITY_COMMON,
  SH_RARITY_UNCOMMON,
  SH_RARITY_RARE,
  SH_RARITY_EPIC,
  SH_RARITY_LEGENDARY,
];

export const SH_RARITY_EMOJI: Record<string, string> = {
  [SH_RARITY_COMMON]: '⬜',
  [SH_RARITY_UNCOMMON]: '🟩',
  [SH_RARITY_RARE]: '🟦',
  [SH_RARITY_EPIC]: '🟪',
  [SH_RARITY_LEGENDARY]: '🟨',
};

export const SH_RARITY_DOCK_FEE_MULTIPLIER: Record<string, number> = {
  [SH_RARITY_COMMON]: 1.0,
  [SH_RARITY_UNCOMMON]: 1.5,
  [SH_RARITY_RARE]: 2.0,
  [SH_RARITY_EPIC]: 3.5,
  [SH_RARITY_LEGENDARY]: 6.0,
};

// ─── Starship Constants (35 types) ───────────────────────────────────────────

export const SH_SHIP_SHUTTLE_POD = 'shuttle_pod';
export const SH_SHIP_COURIER = 'courier';
export const SH_SHIP_CARGO_LITE = 'cargo_lite';
export const SH_SHIP_MINING_DRONE = 'mining_drone';
export const SH_SHIP_RECON = 'recon';
export const SH_SHIP_SLOOP = 'sloop';
export const SH_SHIP_TRANSPORT = 'transport';
export const SH_SHIP_SURVEYOR = 'surveyor';
export const SH_SHIP_FREIGHTER = 'freighter';
export const SH_SHIP_MEDICAL_FRIGATE = 'medical_frigate';
export const SH_SHIP_CRUISER = 'cruiser';
export const SH_SHIP_RESEARCH_VESSEL = 'research_vessel';
export const SH_SHIP_HEAVY_FREIGHTER = 'heavy_freighter';
export const SH_SHIP_DESTROYER = 'destroyer';
export const SH_SHIP_DIPLOMAT_BARGE = 'diplomat_barge';
export const SH_SHIP_BATTLECRUISER = 'battlecruiser';
export const SH_SHIP_CARRIER = 'carrier';
export const SH_SHIP_MOBILE_REFINERY = 'mobile_refinery';
export const SH_SHIP_STEALTH_CORVETTE = 'stealth_corvette';
export const SH_SHIP_LUXURY_YACHT = 'luxury_yacht';
export const SH_SHIP_BATTLESHIP = 'battleship';
export const SH_SHIP_DREADNOUGHT = 'dreadnought';
export const SH_SHIP_FLAGSHIP = 'flagship';
export const SH_SHIP_SMUGGLER_RUNNER = 'smuggler_runner';
export const SH_SHIP_PIRATE_BRIG = 'pirate_brig';
export const SH_SHIP_BLACK_MARKET_BARGE = 'black_market_barge';
export const SH_SHIP_VOID_CRAWLER = 'void_crawler';
export const SH_SHIP_NEBULA_WEAVER = 'nebula_weaver';
export const SH_SHIP_STAR_WHISPER = 'star_whisper';
export const SH_SHIP_ANCIENT_DERELICT = 'ancient_derelict';
export const SH_SHIP_CRYO_ARC = 'cryo_arc';
export const SH_SHIP_WARP_JUMPER = 'warp_jumper';
export const SH_SHIP_SINGULARITY_CARRIER = 'singularity_carrier';
export const SH_SHIP_TITAN_CLASS = 'titan_class';
export const SH_SHIP_CELESTIAL_FORTRESS = 'celestial_fortress';

export const SH_ALL_SHIPS: string[] = [
  SH_SHIP_SHUTTLE_POD,
  SH_SHIP_COURIER,
  SH_SHIP_CARGO_LITE,
  SH_SHIP_MINING_DRONE,
  SH_SHIP_RECON,
  SH_SHIP_SLOOP,
  SH_SHIP_TRANSPORT,
  SH_SHIP_SURVEYOR,
  SH_SHIP_FREIGHTER,
  SH_SHIP_MEDICAL_FRIGATE,
  SH_SHIP_CRUISER,
  SH_SHIP_RESEARCH_VESSEL,
  SH_SHIP_HEAVY_FREIGHTER,
  SH_SHIP_DESTROYER,
  SH_SHIP_DIPLOMAT_BARGE,
  SH_SHIP_BATTLECRUISER,
  SH_SHIP_CARRIER,
  SH_SHIP_MOBILE_REFINERY,
  SH_SHIP_STEALTH_CORVETTE,
  SH_SHIP_LUXURY_YACHT,
  SH_SHIP_BATTLESHIP,
  SH_SHIP_DREADNOUGHT,
  SH_SHIP_FLAGSHIP,
  SH_SHIP_SMUGGLER_RUNNER,
  SH_SHIP_PIRATE_BRIG,
  SH_SHIP_BLACK_MARKET_BARGE,
  SH_SHIP_VOID_CRAWLER,
  SH_SHIP_NEBULA_WEAVER,
  SH_SHIP_STAR_WHISPER,
  SH_SHIP_ANCIENT_DERELICT,
  SH_SHIP_CRYO_ARC,
  SH_SHIP_WARP_JUMPER,
  SH_SHIP_SINGULARITY_CARRIER,
  SH_SHIP_TITAN_CLASS,
  SH_SHIP_CELESTIAL_FORTRESS,
];

export interface ShShipDef {
  id: string;
  name: string;
  emoji: string;
  rarity: string;
  hull: number;
  speed: number;
  cargo: number;
  crewCap: number;
  dockFee: number;
  description: string;
}

export const SH_SHIP_DEFS: Record<string, ShShipDef> = {
  [SH_SHIP_SHUTTLE_POD]: { id: SH_SHIP_SHUTTLE_POD, name: 'Shuttle Pod', emoji: '🛸', rarity: SH_RARITY_COMMON, hull: 30, speed: 8, cargo: 5, crewCap: 2, dockFee: 10, description: 'A tiny two-seater for short hops around the harbor.' },
  [SH_SHIP_COURIER]: { id: SH_SHIP_COURIER, name: 'Courier', emoji: '📬', rarity: SH_RARITY_COMMON, hull: 40, speed: 10, cargo: 8, crewCap: 2, dockFee: 15, description: 'Fast message runner built for speed over safety.' },
  [SH_SHIP_CARGO_LITE]: { id: SH_SHIP_CARGO_LITE, name: 'Cargo Lite', emoji: '📦', rarity: SH_RARITY_COMMON, hull: 60, speed: 4, cargo: 30, crewCap: 3, dockFee: 20, description: 'Light freight hauler for small loads.' },
  [SH_SHIP_MINING_DRONE]: { id: SH_SHIP_MINING_DRONE, name: 'Mining Drone', emoji: '⛏️', rarity: SH_RARITY_COMMON, hull: 50, speed: 3, cargo: 25, crewCap: 1, dockFee: 12, description: 'Automated mining platform with basic AI pilot.' },
  [SH_SHIP_RECON]: { id: SH_SHIP_RECON, name: 'Recon Skiff', emoji: '🔭', rarity: SH_RARITY_COMMON, hull: 35, speed: 9, cargo: 10, crewCap: 3, dockFee: 18, description: 'Long-range scanner skiff for surveying asteroid fields.' },
  [SH_SHIP_SLOOP]: { id: SH_SHIP_SLOOP, name: 'Star Sloop', emoji: '⛵', rarity: SH_RARITY_UNCOMMON, hull: 80, speed: 7, cargo: 20, crewCap: 6, dockFee: 35, description: 'Versatile mid-size vessel favored by independent traders.' },
  [SH_SHIP_TRANSPORT]: { id: SH_SHIP_TRANSPORT, name: 'Transport', emoji: '🚀', rarity: SH_RARITY_UNCOMMON, hull: 100, speed: 5, cargo: 50, crewCap: 5, dockFee: 40, description: 'Standard passenger and cargo transport.' },
  [SH_SHIP_SURVEYOR]: { id: SH_SHIP_SURVEYOR, name: 'Deep Surveyor', emoji: '🛰️', rarity: SH_RARITY_UNCOMMON, hull: 70, speed: 6, cargo: 15, crewCap: 4, dockFee: 45, description: 'Equipped with advanced sensors for deep space analysis.' },
  [SH_SHIP_FREIGHTER]: { id: SH_SHIP_FREIGHTER, name: 'Heavy Freighter', emoji: '🚛', rarity: SH_RARITY_UNCOMMON, hull: 150, speed: 3, cargo: 100, crewCap: 8, dockFee: 60, description: 'Bulky hauler capable of moving massive cargo loads.' },
  [SH_SHIP_MEDICAL_FRIGATE]: { id: SH_SHIP_MEDICAL_FRIGATE, name: 'Medical Frigate', emoji: '🏥', rarity: SH_RARITY_UNCOMMON, hull: 90, speed: 5, cargo: 30, crewCap: 10, dockFee: 50, description: 'Floating hospital with state-of-the-art bio-bays.' },
  [SH_SHIP_CRUISER]: { id: SH_SHIP_CRUISER, name: 'Patrol Cruiser', emoji: '🛡️', rarity: SH_RARITY_RARE, hull: 180, speed: 6, cargo: 25, crewCap: 15, dockFee: 90, description: 'Well-armed patrol ship guarding trade routes.' },
  [SH_SHIP_RESEARCH_VESSEL]: { id: SH_SHIP_RESEARCH_VESSEL, name: 'Research Vessel', emoji: '🔬', rarity: SH_RARITY_RARE, hull: 120, speed: 4, cargo: 40, crewCap: 12, dockFee: 85, description: 'Mobile laboratory for studying exotic phenomena.' },
  [SH_SHIP_HEAVY_FREIGHTER]: { id: SH_SHIP_HEAVY_FREIGHTER, name: 'Super Freighter', emoji: '🚢', rarity: SH_RARITY_RARE, hull: 250, speed: 2, cargo: 200, crewCap: 12, dockFee: 100, description: 'Enormous cargo transport with reinforced hull plating.' },
  [SH_SHIP_DESTROYER]: { id: SH_SHIP_DESTROYER, name: 'Destroyer', emoji: '⚔️', rarity: SH_RARITY_RARE, hull: 200, speed: 7, cargo: 15, crewCap: 20, dockFee: 110, description: 'Fast attack vessel bristling with weapons.' },
  [SH_SHIP_DIPLOMAT_BARGE]: { id: SH_SHIP_DIPLOMAT_BARGE, name: 'Diplomat Barge', emoji: '🕊️', rarity: SH_RARITY_RARE, hull: 160, speed: 5, cargo: 35, crewCap: 8, dockFee: 95, description: 'Luxurious envoy ship for interstellar negotiations.' },
  [SH_SHIP_BATTLECRUISER]: { id: SH_SHIP_BATTLECRUISER, name: 'Battlecruiser', emoji: '💥', rarity: SH_RARITY_EPIC, hull: 350, speed: 5, cargo: 30, crewCap: 30, dockFee: 200, description: 'Heavy combat vessel that dominates any engagement.' },
  [SH_SHIP_CARRIER]: { id: SH_SHIP_CARRIER, name: 'Fleet Carrier', emoji: '✈️', rarity: SH_RARITY_EPIC, hull: 400, speed: 3, cargo: 60, crewCap: 50, dockFee: 250, description: 'Launches squadrons of fighters from its massive hangar.' },
  [SH_SHIP_MOBILE_REFINERY]: { id: SH_SHIP_MOBILE_REFINERY, name: 'Mobile Refinery', emoji: '🏭', rarity: SH_RARITY_EPIC, hull: 300, speed: 2, cargo: 150, crewCap: 15, dockFee: 180, description: 'Processes raw ore into refined materials on-site.' },
  [SH_SHIP_STEALTH_CORVETTE]: { id: SH_SHIP_STEALTH_CORVETTE, name: 'Stealth Corvette', emoji: '👻', rarity: SH_RARITY_EPIC, hull: 140, speed: 10, cargo: 20, crewCap: 6, dockFee: 220, description: 'Virtually undetectable — perfect for covert ops.' },
  [SH_SHIP_LUXURY_YACHT]: { id: SH_SHIP_LUXURY_YACHT, name: 'Luxury Yacht', emoji: '🥂', rarity: SH_RARITY_EPIC, hull: 100, speed: 6, cargo: 40, crewCap: 10, dockFee: 300, description: 'Opulent pleasure craft for the galaxy\'s elite.' },
  [SH_SHIP_BATTLESHIP]: { id: SH_SHIP_BATTLESHIP, name: 'Battleship', emoji: '🐉', rarity: SH_RARITY_LEGENDARY, hull: 500, speed: 4, cargo: 40, crewCap: 40, dockFee: 400, description: 'A fortress of firepower among the stars.' },
  [SH_SHIP_DREADNOUGHT]: { id: SH_SHIP_DREADNOUGHT, name: 'Dreadnought', emoji: '💀', rarity: SH_RARITY_LEGENDARY, hull: 700, speed: 2, cargo: 50, crewCap: 60, dockFee: 550, description: 'Massive warship that can level space stations.' },
  [SH_SHIP_FLAGSHIP]: { id: SH_SHIP_FLAGSHIP, name: 'Fleet Flagship', emoji: '👑', rarity: SH_RARITY_LEGENDARY, hull: 600, speed: 5, cargo: 80, crewCap: 50, dockFee: 500, description: 'Command vessel that rallies entire fleets to victory.' },
  [SH_SHIP_SMUGGLER_RUNNER]: { id: SH_SHIP_SMUGGLER_RUNNER, name: 'Smuggler Runner', emoji: '🌑', rarity: SH_RARITY_LEGENDARY, hull: 120, speed: 12, cargo: 30, crewCap: 4, dockFee: 350, description: 'Custom-built blockade runner with hidden compartments.' },
  [SH_SHIP_PIRATE_BRIG]: { id: SH_SHIP_PIRATE_BRIG, name: 'Pirate Brig', emoji: '🏴‍☠️', rarity: SH_RARITY_LEGENDARY, hull: 250, speed: 8, cargo: 60, crewCap: 25, dockFee: 380, description: 'Infamous raider ship that strikes fear across sectors.' },
  [SH_SHIP_BLACK_MARKET_BARGE]: { id: SH_SHIP_BLACK_MARKET_BARGE, name: 'Black Market Barge', emoji: '🔒', rarity: SH_RARITY_LEGENDARY, hull: 200, speed: 4, cargo: 120, crewCap: 10, dockFee: 420, description: 'Floating bazaar where anything can be bought… for a price.' },
  [SH_SHIP_VOID_CRAWLER]: { id: SH_SHIP_VOID_CRAWLER, name: 'Void Crawler', emoji: '🕷️', rarity: SH_RARITY_LEGENDARY, hull: 400, speed: 6, cargo: 25, crewCap: 20, dockFee: 600, description: 'Bio-mechanical alien vessel harvested from a dead hive fleet.' },
  [SH_SHIP_NEBULA_WEAVER]: { id: SH_SHIP_NEBULA_WEAVER, name: 'Nebula Weaver', emoji: '🌈', rarity: SH_RARITY_LEGENDARY, hull: 180, speed: 9, cargo: 15, crewCap: 8, dockFee: 500, description: 'Harnesses nebula energy for propulsion and shields.' },
  [SH_SHIP_STAR_WHISPER]: { id: SH_SHIP_STAR_WHISPER, name: 'Star Whisper', emoji: '✨', rarity: SH_RARITY_LEGENDARY, hull: 350, speed: 11, cargo: 20, crewCap: 6, dockFee: 700, description: 'Ancient alien craft that travels faster than thought.' },
  [SH_SHIP_ANCIENT_DERELICT]: { id: SH_SHIP_ANCIENT_DERELICT, name: 'Ancient Derelict', emoji: '⚱️', rarity: SH_RARITY_LEGENDARY, hull: 800, speed: 1, cargo: 200, crewCap: 30, dockFee: 450, description: 'Reanimated precursor vessel of unimaginable age and power.' },
  [SH_SHIP_CRYO_ARC]: { id: SH_SHIP_CRYO_ARC, name: 'Cryo Arc', emoji: '❄️', rarity: SH_RARITY_LEGENDARY, hull: 300, speed: 3, cargo: 180, crewCap: 5, dockFee: 380, description: 'Generation ship carrying thousands in cryogenic sleep.' },
  [SH_SHIP_WARP_JUMPER]: { id: SH_SHIP_WARP_JUMPER, name: 'Warp Jumper', emoji: '🌀', rarity: SH_RARITY_LEGENDARY, hull: 220, speed: 14, cargo: 10, crewCap: 4, dockFee: 800, description: 'Experimental warp-capable prototype from a lost civilization.' },
  [SH_SHIP_SINGULARITY_CARRIER]: { id: SH_SHIP_SINGULARITY_CARRIER, name: 'Singularity Carrier', emoji: '🕳️', rarity: SH_RARITY_LEGENDARY, hull: 1000, speed: 3, cargo: 100, crewCap: 80, dockFee: 1000, description: 'Powers its systems with a contained micro-singularity.' },
  [SH_SHIP_TITAN_CLASS]: { id: SH_SHIP_TITAN_CLASS, name: 'Titan', emoji: '🏔️', rarity: SH_RARITY_LEGENDARY, hull: 1200, speed: 2, cargo: 150, crewCap: 100, dockFee: 1200, description: 'The largest class of ship ever constructed in known space.' },
  [SH_SHIP_CELESTIAL_FORTRESS]: { id: SH_SHIP_CELESTIAL_FORTRESS, name: 'Celestial Fortress', emoji: '🌌', rarity: SH_RARITY_LEGENDARY, hull: 2000, speed: 1, cargo: 300, crewCap: 200, dockFee: 2000, description: 'A mobile space station — a city among the stars.' },
};

// ─── Harbor Dock Constants (8 docks) ────────────────────────────────────────

export const SH_DOCK_ARRIVAL_BAY = 'arrival_bay';
export const SH_DOCK_TRADE_PIER = 'trade_pier';
export const SH_DOCK_MILITARY = 'military_dock';
export const SH_DOCK_RESEARCH = 'research_berth';
export const SH_DOCK_REPAIR = 'repair_station';
export const SH_DOCK_EMBASSY = 'embassy_row';
export const SH_DOCK_BLACK_MARKET = 'black_market';
export const SH_DOCK_DEEP_SPACE = 'deep_space_terminal';

export const SH_ALL_DOCKS: string[] = [
  SH_DOCK_ARRIVAL_BAY,
  SH_DOCK_TRADE_PIER,
  SH_DOCK_MILITARY,
  SH_DOCK_RESEARCH,
  SH_DOCK_REPAIR,
  SH_DOCK_EMBASSY,
  SH_DOCK_BLACK_MARKET,
  SH_DOCK_DEEP_SPACE,
];

export interface ShDockDef {
  id: string;
  name: string;
  emoji: string;
  maxShips: number;
  services: string[];
  description: string;
}

export const SH_DOCK_DEFS: Record<string, ShDockDef> = {
  [SH_DOCK_ARRIVAL_BAY]: { id: SH_DOCK_ARRIVAL_BAY, name: 'Arrival Bay', emoji: '🛬', maxShips: 12, services: ['dock', 'refuel', 'basic_repair'], description: 'The main entry point where all newcomers first touch down.' },
  [SH_DOCK_TRADE_PIER]: { id: SH_DOCK_TRADE_PIER, name: 'Trade Pier', emoji: '💱', maxShips: 8, services: ['dock', 'trade', 'refuel', 'cargo_transfer'], description: 'Bustling marketplace dock for interstellar commerce.' },
  [SH_DOCK_MILITARY]: { id: SH_DOCK_MILITARY, name: 'Military Dock', emoji: '⚔️', maxShips: 6, services: ['dock', 'refuel', 'full_repair', 'rearm', 'patrol'], description: 'Heavily fortified dock reserved for military vessels.' },
  [SH_DOCK_RESEARCH]: { id: SH_DOCK_RESEARCH, name: 'Research Berth', emoji: '🔬', maxShips: 4, services: ['dock', 'scan', 'sample_analysis'], description: 'Specialized berth for science and exploration vessels.' },
  [SH_DOCK_REPAIR]: { id: SH_DOCK_REPAIR, name: 'Repair Station', emoji: '🔧', maxShips: 5, services: ['dock', 'full_repair', 'upgrade_hull', 'refit'], description: 'Massive repair gantries can restore any ship to peak condition.' },
  [SH_DOCK_EMBASSY]: { id: SH_DOCK_EMBASSY, name: 'Embassy Row', emoji: '🏛️', maxShips: 6, services: ['dock', 'diplomacy', 'ambassador_meeting'], description: 'Diplomatic quarter for official alien emissary vessels.' },
  [SH_DOCK_BLACK_MARKET]: { id: SH_DOCK_BLACK_MARKET, name: 'Black Market', emoji: '🏴‍☠️', maxShips: 3, services: ['dock', 'smuggle', 'bounty_posting'], description: 'Shadowy dock hidden in the harbor\'s underbelly.' },
  [SH_DOCK_DEEP_SPACE]: { id: SH_DOCK_DEEP_SPACE, name: 'Deep Space Terminal', emoji: '🌌', maxShips: 4, services: ['dock', 'long_range_comm', 'expedition_prep'], description: 'Outermost dock for ships preparing for deep space expeditions.' },
};

// ─── Trade Goods Constants (30 goods) ───────────────────────────────────────

export const SH_GOOD_STELLAR_ORE = 'stellar_ore';
export const SH_GOOD_PLASMA_CORE = 'plasma_core';
export const SH_GOOD_QUANTUM_CHIP = 'quantum_chip';
export const SH_GOOD_VOID_ESSENCE = 'void_essence';
export const SH_GOOD_BIO_LUMEN = 'bio_lumen';
export const SH_GOOD_NEBULA_GAS = 'nebula_gas';
export const SH_GOOD_CRYSTAL_SHARD = 'crystal_shard';
export const SH_GOOD_ANCIENT_RELIC = 'ancient_relic';
export const SH_GOOD_SYNTH_FOOD = 'synth_food';
export const SH_GOOD_MED_GEL = 'med_gel';
export const SH_GOOD_FUEL_CELL = 'fuel_cell';
export const SH_GOOD_TITANIUM_INGOT = 'titanium_ingot';
export const SH_GOOD_DARK_MATTER = 'dark_matter_shard';
export const SH_GOOD_LIVING_SEED = 'living_seed';
export const SH_GOOD_ALIEN_ARTIFACT = 'alien_artifact';
export const SH_GOOD_SPICE_NEON = 'spice_neon';
export const SH_GOOD_RARE_EARTH = 'rare_earth';
export const SH_GOOD_ANTIMATTER_FLASK = 'antimatter_flask';
export const SH_GOOD_EXO_PLANKTON = 'exo_plankton';
export const SH_GOOD_SILK_VOID = 'silk_void';
export const SH_GOOD_SENTIENT_GEM = 'sentient_gem';
export const SH_GOOD_HYDRO_CREDIT = 'hydro_credit';
export const SH_GOOD_GRAVITON_ORB = 'graviton_orb';
export const SH_GOOD_PHOTON_STEEL = 'photon_steel';
export const SH_GOOD_DREAM_ESSENCE = 'dream_essence';
export const SH_GOOD_CRYO_SAMPLE = 'cryo_sample';
export const SH_GOOD_WORMCORE = 'wormcore';
export const SH_GOOD_STAR_DUST = 'star_dust';
export const SH_GOOD_PHASER_CRYSTAL = 'phaser_crystal';
export const SH_GOOD_LIVING_METAL = 'living_metal';

export const SH_ALL_GOODS: string[] = [
  SH_GOOD_STELLAR_ORE,
  SH_GOOD_PLASMA_CORE,
  SH_GOOD_QUANTUM_CHIP,
  SH_GOOD_VOID_ESSENCE,
  SH_GOOD_BIO_LUMEN,
  SH_GOOD_NEBULA_GAS,
  SH_GOOD_CRYSTAL_SHARD,
  SH_GOOD_ANCIENT_RELIC,
  SH_GOOD_SYNTH_FOOD,
  SH_GOOD_MED_GEL,
  SH_GOOD_FUEL_CELL,
  SH_GOOD_TITANIUM_INGOT,
  SH_GOOD_DARK_MATTER,
  SH_GOOD_LIVING_SEED,
  SH_GOOD_ALIEN_ARTIFACT,
  SH_GOOD_SPICE_NEON,
  SH_GOOD_RARE_EARTH,
  SH_GOOD_ANTIMATTER_FLASK,
  SH_GOOD_EXO_PLANKTON,
  SH_GOOD_SILK_VOID,
  SH_GOOD_SENTIENT_GEM,
  SH_GOOD_HYDRO_CREDIT,
  SH_GOOD_GRAVITON_ORB,
  SH_GOOD_PHOTON_STEEL,
  SH_GOOD_DREAM_ESSENCE,
  SH_GOOD_CRYO_SAMPLE,
  SH_GOOD_WORMCORE,
  SH_GOOD_STAR_DUST,
  SH_GOOD_PHASER_CRYSTAL,
  SH_GOOD_LIVING_METAL,
];

export interface ShGoodDef {
  id: string;
  name: string;
  emoji: string;
  category: string;
  basePrice: number;
  volatility: number;
  description: string;
}

export const SH_GOOD_DEFS: Record<string, ShGoodDef> = {
  [SH_GOOD_STELLAR_ORE]: { id: SH_GOOD_STELLAR_ORE, name: 'Stellar Ore', emoji: '🪨', category: 'Mineral', basePrice: 15, volatility: 0.2, description: 'Common ore refined from asteroid belts.' },
  [SH_GOOD_PLASMA_CORE]: { id: SH_GOOD_PLASMA_CORE, name: 'Plasma Core', emoji: '🔥', category: 'Energy', basePrice: 45, volatility: 0.3, description: 'Contained plasma used for reactor fuel.' },
  [SH_GOOD_QUANTUM_CHIP]: { id: SH_GOOD_QUANTUM_CHIP, name: 'Quantum Chip', emoji: '💾', category: 'Tech', basePrice: 80, volatility: 0.4, description: 'Advanced computing component with quantum processing.' },
  [SH_GOOD_VOID_ESSENCE]: { id: SH_GOOD_VOID_ESSENCE, name: 'Void Essence', emoji: '🌑', category: 'Exotic', basePrice: 150, volatility: 0.5, description: 'Mysterious substance harvested from the void between stars.' },
  [SH_GOOD_BIO_LUMEN]: { id: SH_GOOD_BIO_LUMEN, name: 'Bio-Lumen', emoji: '🌿', category: 'Bio', basePrice: 25, volatility: 0.25, description: 'Bioluminescent organism prized for lighting systems.' },
  [SH_GOOD_NEBULA_GAS]: { id: SH_GOOD_NEBULA_GAS, name: 'Nebula Gas', emoji: '☁️', category: 'Energy', basePrice: 35, volatility: 0.35, description: 'Compressed nebula gas used in terraforming.' },
  [SH_GOOD_CRYSTAL_SHARD]: { id: SH_GOOD_CRYSTAL_SHARD, name: 'Crystal Shard', emoji: '💎', category: 'Mineral', basePrice: 60, volatility: 0.3, description: 'Prismatic crystals with unique refractive properties.' },
  [SH_GOOD_ANCIENT_RELIC]: { id: SH_GOOD_ANCIENT_RELIC, name: 'Ancient Relic', emoji: '🏺', category: 'Artifact', basePrice: 200, volatility: 0.6, description: 'Precursor artifacts of immense historical value.' },
  [SH_GOOD_SYNTH_FOOD]: { id: SH_GOOD_SYNTH_FOOD, name: 'Synth-Food', emoji: '🍔', category: 'Supply', basePrice: 8, volatility: 0.1, description: 'Nutrient paste sustaining space-faring crews.' },
  [SH_GOOD_MED_GEL]: { id: SH_GOOD_MED_GEL, name: 'Med-Gel', emoji: '💊', category: 'Medical', basePrice: 30, volatility: 0.2, description: 'Rapid-healing medical compound for field use.' },
  [SH_GOOD_FUEL_CELL]: { id: SH_GOOD_FUEL_CELL, name: 'Fuel Cell', emoji: '🔋', category: 'Energy', basePrice: 20, volatility: 0.15, description: 'Standard hydrogen fuel cell for ship propulsion.' },
  [SH_GOOD_TITANIUM_INGOT]: { id: SH_GOOD_TITANIUM_INGOT, name: 'Titanium Ingot', emoji: '🔩', category: 'Mineral', basePrice: 40, volatility: 0.2, description: 'Refined titanium for hull construction.' },
  [SH_GOOD_DARK_MATTER]: { id: SH_GOOD_DARK_MATTER, name: 'Dark Matter Shard', emoji: '⬛', category: 'Exotic', basePrice: 300, volatility: 0.5, description: 'Incredibly rare dark matter fragments.' },
  [SH_GOOD_LIVING_SEED]: { id: SH_GOOD_LIVING_SEED, name: 'Living Seed', emoji: '🌱', category: 'Bio', basePrice: 55, volatility: 0.35, description: 'Genetically engineered seed that grows in zero gravity.' },
  [SH_GOOD_ALIEN_ARTIFACT]: { id: SH_GOOD_ALIEN_ARTIFACT, name: 'Alien Artifact', emoji: '👾', category: 'Artifact', basePrice: 250, volatility: 0.55, description: 'Technology from unknown alien civilizations.' },
  [SH_GOOD_SPICE_NEON]: { id: SH_GOOD_SPICE_NEON, name: 'Neon Spice', emoji: '🌶️', category: 'Luxury', basePrice: 70, volatility: 0.45, description: 'Intoxicating spice that glows under UV light.' },
  [SH_GOOD_RARE_EARTH]: { id: SH_GOOD_RARE_EARTH, name: 'Rare Earth', emoji: '🌍', category: 'Mineral', basePrice: 50, volatility: 0.25, description: 'Scarce elements vital for advanced electronics.' },
  [SH_GOOD_ANTIMATTER_FLASK]: { id: SH_GOOD_ANTIMATTER_FLASK, name: 'Antimatter Flask', emoji: '☢️', category: 'Energy', basePrice: 350, volatility: 0.5, description: 'Extremely volatile antimatter contained in magnetic flasks.' },
  [SH_GOOD_EXO_PLANKTON]: { id: SH_GOOD_EXO_PLANKTON, name: 'Exo-Plankton', emoji: '🦠', category: 'Bio', basePrice: 20, volatility: 0.3, description: 'Microscopic organisms harvested from gas giant atmospheres.' },
  [SH_GOOD_SILK_VOID]: { id: SH_GOOD_SILK_VOID, name: 'Void Silk', emoji: '🕸️', category: 'Luxury', basePrice: 120, volatility: 0.4, description: 'Impossibly fine fabric woven by space-faring arachnids.' },
  [SH_GOOD_SENTIENT_GEM]: { id: SH_GOOD_SENTIENT_GEM, name: 'Sentient Gem', emoji: '🔮', category: 'Artifact', basePrice: 400, volatility: 0.6, description: 'A gemstone that displays rudimentary consciousness.' },
  [SH_GOOD_HYDRO_CREDIT]: { id: SH_GOOD_HYDRO_CREDIT, name: 'Hydro-Credit', emoji: '💧', category: 'Currency', basePrice: 10, volatility: 0.1, description: 'Water-backed currency for water-scarce colonies.' },
  [SH_GOOD_GRAVITON_ORB]: { id: SH_GOOD_GRAVITON_ORB, name: 'Graviton Orb', emoji: '🔮', category: 'Exotic', basePrice: 180, volatility: 0.45, description: 'Contained graviton particles for artificial gravity systems.' },
  [SH_GOOD_PHOTON_STEEL]: { id: SH_GOOD_PHOTON_STEEL, name: 'Photon Steel', emoji: '⚔️', category: 'Material', basePrice: 90, volatility: 0.3, description: 'Alloy hardened by photon bombardment.' },
  [SH_GOOD_DREAM_ESSENCE]: { id: SH_GOOD_DREAM_ESSENCE, name: 'Dream Essence', emoji: '💭', category: 'Exotic', basePrice: 220, volatility: 0.5, description: 'Extracted from sleeping alien species. Used in medicine.' },
  [SH_GOOD_CRYO_SAMPLE]: { id: SH_GOOD_CRYO_SAMPLE, name: 'Cryo Sample', emoji: '🧊', category: 'Bio', basePrice: 65, volatility: 0.35, description: 'Frozen tissue samples from extinct alien species.' },
  [SH_GOOD_WORMCORE]: { id: SH_GOOD_WORMCORE, name: 'Wormcore', emoji: '🌀', category: 'Exotic', basePrice: 500, volatility: 0.6, description: 'Core of a space-worm, essential for warp drive fabrication.' },
  [SH_GOOD_STAR_DUST]: { id: SH_GOOD_STAR_DUST, name: 'Star Dust', emoji: '✨', category: 'Luxury', basePrice: 100, volatility: 0.4, description: 'Refined stellar material used in high-end manufacturing.' },
  [SH_GOOD_PHASER_CRYSTAL]: { id: SH_GOOD_PHASER_CRYSTAL, name: 'Phaser Crystal', emoji: '💠', category: 'Tech', basePrice: 160, volatility: 0.35, description: 'Crystal matrix for weapon-grade phaser arrays.' },
  [SH_GOOD_LIVING_METAL]: { id: SH_GOOD_LIVING_METAL, name: 'Living Metal', emoji: '🧬', category: 'Bio', basePrice: 280, volatility: 0.5, description: 'Self-repairing bio-metal that heals like living tissue.' },
};

// ─── Harbor Facilities (25 facilities, upgradeable to level 10) ─────────────

export const SH_FAC_REFINERY = 'refinery';
export const SH_FAC_ACADEMY = 'academy';
export const SH_FAC_TAVERN = 'tavern';
export const SH_FAC_VAULT = 'vault';
export const SH_FAC_ARMORY = 'armory';
export const SH_FAC_OBSERVATORY = 'observatory';
export const SH_FAC_MED_BAY = 'med_bay';
export const SH_FAC_COMM_ARRAY = 'comm_array';
export const SH_FAC_QUARANTINE = 'quarantine';
export const SH_FAC_SHIPYARD = 'shipyard';
export const SH_FAC_BOTANICAL = 'botanical_garden';
export const SH_FAC_AUCTION_HOUSE = 'auction_house';
export const SH_FAC_HYDROPONICS = 'hydroponics';
export const SH_FAC_HOLO_THEATER = 'holo_theater';
export const SH_FAC_GENESIS_LAB = 'genesis_lab';
export const SH_FAC_TRADE_EXCHANGE = 'trade_exchange';
export const SH_FAC_BOUNTY_BOARD = 'bounty_board';
export const SH_FAC_LIBRARY = 'library';
export const SH_FAC_POWER_CORE = 'power_core';
export const SH_FAC_GRAV_DOCK = 'grav_dock';
export const SH_FAC_CARGO_HUB = 'cargo_hub';
export const SH_FAC_BLACK_FORGE = 'black_forge';
export const SH_FAC_WARP_GATE = 'warp_gate';
export const SH_FAC_STAR_NURSERY = 'star_nursery';

export const SH_ALL_FACILITIES: string[] = [
  SH_FAC_REFINERY,
  SH_FAC_ACADEMY,
  SH_FAC_TAVERN,
  SH_FAC_VAULT,
  SH_FAC_ARMORY,
  SH_FAC_OBSERVATORY,
  SH_FAC_MED_BAY,
  SH_FAC_COMM_ARRAY,
  SH_FAC_QUARANTINE,
  SH_FAC_SHIPYARD,
  SH_FAC_BOTANICAL,
  SH_FAC_AUCTION_HOUSE,
  SH_FAC_HYDROPONICS,
  SH_FAC_HOLO_THEATER,
  SH_FAC_GENESIS_LAB,
  SH_FAC_TRADE_EXCHANGE,
  SH_FAC_BOUNTY_BOARD,
  SH_FAC_LIBRARY,
  SH_FAC_POWER_CORE,
  SH_FAC_GRAV_DOCK,
  SH_FAC_CARGO_HUB,
  SH_FAC_BLACK_FORGE,
  SH_FAC_WARP_GATE,
  SH_FAC_STAR_NURSERY,
];

export interface ShFacilityDef {
  id: string;
  name: string;
  emoji: string;
  baseCost: number;
  upgradeCostScale: number;
  maxLevel: number;
  description: string;
}

export const SH_FACILITY_DEFS: Record<string, ShFacilityDef> = {
  [SH_FAC_REFINERY]: { id: SH_FAC_REFINERY, name: 'Starlight Refinery', emoji: '🏭', baseCost: 200, upgradeCostScale: 1.8, maxLevel: 10, description: 'Processes raw ore into refined materials for trade.' },
  [SH_FAC_ACADEMY]: { id: SH_FAC_ACADEMY, name: 'Navigator Academy', emoji: '🎓', baseCost: 300, upgradeCostScale: 2.0, maxLevel: 10, description: 'Trains crew members in advanced starship operations.' },
  [SH_FAC_TAVERN]: { id: SH_FAC_TAVERN, name: 'Cosmic Tavern', emoji: '🍺', baseCost: 100, upgradeCostScale: 1.5, maxLevel: 10, description: 'Where spacers drink, swap stories, and find contracts.' },
  [SH_FAC_VAULT]: { id: SH_FAC_VAULT, name: 'Quantum Vault', emoji: '🏦', baseCost: 500, upgradeCostScale: 2.2, maxLevel: 10, description: 'Secure storage for your most valuable goods and coins.' },
  [SH_FAC_ARMORY]: { id: SH_FAC_ARMORY, name: 'Plasma Armory', emoji: '🔫', baseCost: 250, upgradeCostScale: 1.9, maxLevel: 10, description: 'Stocks weapons and defensive systems for your fleet.' },
  [SH_FAC_OBSERVATORY]: { id: SH_FAC_OBSERVATORY, name: 'Star Observatory', emoji: '🔭', baseCost: 350, upgradeCostScale: 2.0, maxLevel: 10, description: 'Scans nearby systems for trade opportunities and threats.' },
  [SH_FAC_MED_BAY]: { id: SH_FAC_MED_BAY, name: 'Bio Med-Bay', emoji: '🏥', baseCost: 200, upgradeCostScale: 1.7, maxLevel: 10, description: 'Heals injured crew and cures exotic space diseases.' },
  [SH_FAC_COMM_ARRAY]: { id: SH_FAC_COMM_ARRAY, name: 'Hypercomm Array', emoji: '📡', baseCost: 400, upgradeCostScale: 2.1, maxLevel: 10, description: 'Long-range communications to receive trading tips and alerts.' },
  [SH_FAC_QUARANTINE]: { id: SH_FAC_QUARANTINE, name: 'Quarantine Zone', emoji: '☣️', baseCost: 150, upgradeCostScale: 1.6, maxLevel: 10, description: 'Safely houses exotic bio-samples and alien specimens.' },
  [SH_FAC_SHIPYARD]: { id: SH_FAC_SHIPYARD, name: 'Orbital Shipyard', emoji: '🚧', baseCost: 600, upgradeCostScale: 2.5, maxLevel: 10, description: 'Builds and repairs starships of any class.' },
  [SH_FAC_BOTANICAL]: { id: SH_FAC_BOTANICAL, name: 'Space Botanical Garden', emoji: '🌺', baseCost: 180, upgradeCostScale: 1.6, maxLevel: 10, description: 'Grows rare plants in zero-G environments.' },
  [SH_FAC_AUCTION_HOUSE]: { id: SH_FAC_AUCTION_HOUSE, name: 'Galactic Auction House', emoji: '🔨', baseCost: 450, upgradeCostScale: 2.0, maxLevel: 10, description: 'Hosts rare item auctions with interstellar bidders.' },
  [SH_FAC_HYDROPONICS]: { id: SH_FAC_HYDROPONICS, name: 'Hydroponics Farm', emoji: '🥬', baseCost: 120, upgradeCostScale: 1.5, maxLevel: 10, description: 'Produces fresh food and oxygen for the harbor.' },
  [SH_FAC_HOLO_THEATER]: { id: SH_FAC_HOLO_THEATER, name: 'Holo Theater', emoji: '🎭', baseCost: 200, upgradeCostScale: 1.7, maxLevel: 10, description: 'Entertainment venue boosting crew morale.' },
  [SH_FAC_GENESIS_LAB]: { id: SH_FAC_GENESIS_LAB, name: 'Genesis Lab', emoji: '🧪', baseCost: 700, upgradeCostScale: 2.3, maxLevel: 10, description: 'Bio-engineering lab for creating new trade goods.' },
  [SH_FAC_TRADE_EXCHANGE]: { id: SH_FAC_TRADE_EXCHANGE, name: 'Trade Exchange', emoji: '📊', baseCost: 300, upgradeCostScale: 1.8, maxLevel: 10, description: 'Improves trade margins and unlocks market data.' },
  [SH_FAC_BOUNTY_BOARD]: { id: SH_FAC_BOUNTY_BOARD, name: 'Bounty Board', emoji: '📜', baseCost: 250, upgradeCostScale: 1.9, maxLevel: 10, description: 'Posts lucrative bounties on space pirates and criminals.' },
  [SH_FAC_LIBRARY]: { id: SH_FAC_LIBRARY, name: 'Void Library', emoji: '📚', baseCost: 200, upgradeCostScale: 1.6, maxLevel: 10, description: 'Archives of galactic knowledge boosting XP gains.' },
  [SH_FAC_POWER_CORE]: { id: SH_FAC_POWER_CORE, name: 'Fusion Power Core', emoji: '⚡', baseCost: 500, upgradeCostScale: 2.2, maxLevel: 10, description: 'Powers all harbor facilities and reduces energy costs.' },
  [SH_FAC_GRAV_DOCK]: { id: SH_FAC_GRAV_DOCK, name: 'Gravity Dock', emoji: '🌀', baseCost: 400, upgradeCostScale: 2.0, maxLevel: 10, description: 'Advanced docking clamps for handling the largest vessels.' },
  [SH_FAC_CARGO_HUB]: { id: SH_FAC_CARGO_HUB, name: 'Central Cargo Hub', emoji: '🏗️', baseCost: 350, upgradeCostScale: 1.9, maxLevel: 10, description: 'Expands storage capacity for all docked ships.' },
  [SH_FAC_BLACK_FORGE]: { id: SH_FAC_BLACK_FORGE, name: 'Black Forge', emoji: '⚒️', baseCost: 550, upgradeCostScale: 2.3, maxLevel: 10, description: 'Smelts exotic materials into legendary equipment.' },
  [SH_FAC_WARP_GATE]: { id: SH_FAC_WARP_GATE, name: 'Warp Gate', emoji: '🌀', baseCost: 1000, upgradeCostScale: 3.0, maxLevel: 10, description: 'Enables instant travel to distant trade hubs.' },
  [SH_FAC_STAR_NURSERY]: { id: SH_FAC_STAR_NURSERY, name: 'Star Nursery', emoji: '⭐', baseCost: 800, upgradeCostScale: 2.5, maxLevel: 10, description: 'Incubates stellar fragments into energy-rich fuel.' },
};

// ─── Crew Member Types (22 types) ───────────────────────────────────────────

export const SH_CREW_CAPTAIN = 'captain';
export const SH_CREW_FIRST_MATE = 'first_mate';
export const SH_CREW_NAVIGATOR = 'navigator';
export const SH_CREW_ENGINEER = 'engineer';
export const SH_CREW_MECHANIC = 'mechanic';
export const SH_CREW_SCIENTIST = 'scientist';
export const SH_CREW_MEDIC = 'medic';
export const SH_CREW_QUARTERMASTER = 'quartermaster';
export const SH_CREW_GUNNER = 'gunner';
export const SH_CREW_PILOT = 'pilot';
export const SH_CREW_COMM_OFFICER = 'comm_officer';
export const SH_CREW_SECURITY = 'security';
export const SH_CREW_SMUGGLER = 'smuggler';
export const SH_CREW_DIPLOMAT = 'diplomat';
export const SH_CREW_TRADER = 'trader';
export const SH_CREW_MINER = 'miner';
export const SH_CREW_BOTANIST = 'botanist';
export const SH_CREW_COOK = 'cook';
export const SH_CREW_XENO_BIO = 'xeno_biologist';
export const SH_CREW_HACKER = 'hacker';
export const SH_CREW_PREACHER = 'preacher';
export const SH_CREW_BOUNTY_HUNTER = 'bounty_hunter';

export const SH_ALL_CREW_TYPES: string[] = [
  SH_CREW_CAPTAIN,
  SH_CREW_FIRST_MATE,
  SH_CREW_NAVIGATOR,
  SH_CREW_ENGINEER,
  SH_CREW_MECHANIC,
  SH_CREW_SCIENTIST,
  SH_CREW_MEDIC,
  SH_CREW_QUARTERMASTER,
  SH_CREW_GUNNER,
  SH_CREW_PILOT,
  SH_CREW_COMM_OFFICER,
  SH_CREW_SECURITY,
  SH_CREW_SMUGGLER,
  SH_CREW_DIPLOMAT,
  SH_CREW_TRADER,
  SH_CREW_MINER,
  SH_CREW_BOTANIST,
  SH_CREW_COOK,
  SH_CREW_XENO_BIO,
  SH_CREW_HACKER,
  SH_CREW_PREACHER,
  SH_CREW_BOUNTY_HUNTER,
];

export interface ShCrewTypeDef {
  id: string;
  name: string;
  emoji: string;
  hireCost: number;
  dailyWage: number;
  skills: Record<string, number>;
  description: string;
}

export const SH_CREW_TYPE_DEFS: Record<string, ShCrewTypeDef> = {
  [SH_CREW_CAPTAIN]: { id: SH_CREW_CAPTAIN, name: 'Captain', emoji: '🧑‍✈️', hireCost: 300, dailyWage: 25, skills: { leadership: 6, navigation: 3, trade: 2 }, description: 'Seasoned leader who commands respect across the galaxy.' },
  [SH_CREW_FIRST_MATE]: { id: SH_CREW_FIRST_MATE, name: 'First Mate', emoji: '🫡', hireCost: 200, dailyWage: 18, skills: { leadership: 4, combat: 3, repair: 2 }, description: 'Trusted second-in-command keeping the crew in line.' },
  [SH_CREW_NAVIGATOR]: { id: SH_CREW_NAVIGATOR, name: 'Navigator', emoji: '🗺️', hireCost: 180, dailyWage: 15, skills: { navigation: 7, astrophysics: 4, scouting: 3 }, description: 'Charts courses through hyperspace with uncanny precision.' },
  [SH_CREW_ENGINEER]: { id: SH_CREW_ENGINEER, name: 'Chief Engineer', emoji: '🔧', hireCost: 220, dailyWage: 20, skills: { repair: 7, upgrade: 5, power: 3 }, description: 'Keeps the ship running and tinkers with improvements.' },
  [SH_CREW_MECHANIC]: { id: SH_CREW_MECHANIC, name: 'Mechanic', emoji: '🔩', hireCost: 120, dailyWage: 10, skills: { repair: 5, maintenance: 4 }, description: 'Hands-on grease monkey who fixes anything mechanical.' },
  [SH_CREW_SCIENTIST]: { id: SH_CREW_SCIENTIST, name: 'Scientist', emoji: '🔬', hireCost: 250, dailyWage: 22, skills: { research: 7, analysis: 5, medicine: 2 }, description: 'Brilliant mind advancing the frontiers of knowledge.' },
  [SH_CREW_MEDIC]: { id: SH_CREW_MEDIC, name: 'Medic', emoji: '💉', hireCost: 160, dailyWage: 14, skills: { medicine: 6, biology: 3, morale: 2 }, description: 'Patch up injuries and keep exotic diseases at bay.' },
  [SH_CREW_QUARTERMASTER]: { id: SH_CREW_QUARTERMASTER, name: 'Quartermaster', emoji: '📋', hireCost: 200, dailyWage: 18, skills: { trade: 5, logistics: 6, negotiation: 3 }, description: 'Manages supplies, inventory, and cargo distribution.' },
  [SH_CREW_GUNNER]: { id: SH_CREW_GUNNER, name: 'Gunner', emoji: '🎯', hireCost: 150, dailyWage: 13, skills: { combat: 7, weapons: 5, defense: 3 }, description: 'Expert marksman who mans the ship\'s weapons systems.' },
  [SH_CREW_PILOT]: { id: SH_CREW_PILOT, name: 'Ace Pilot', emoji: '✈️', hireCost: 200, dailyWage: 17, skills: { piloting: 7, evasion: 5, navigation: 3 }, description: 'Hotshot flyer capable of extraordinary maneuvers.' },
  [SH_CREW_COMM_OFFICER]: { id: SH_CREW_COMM_OFFICER, name: 'Comm Officer', emoji: '📻', hireCost: 140, dailyWage: 12, skills: { diplomacy: 5, communication: 6, trade: 2 }, description: 'Maintains contact with other ships and stations.' },
  [SH_CREW_SECURITY]: { id: SH_CREW_SECURITY, name: 'Security Chief', emoji: '🛡️', hireCost: 170, dailyWage: 15, skills: { defense: 7, combat: 5, tactics: 4 }, description: 'Protects the ship and crew from all threats.' },
  [SH_CREW_SMUGGLER]: { id: SH_CREW_SMUGGLER, name: 'Smuggler', emoji: '🥷', hireCost: 180, dailyWage: 16, skills: { stealth: 7, trade: 4, hacking: 3 }, description: 'Knows every hidden route and customs blind spot.' },
  [SH_CREW_DIPLOMAT]: { id: SH_CREW_DIPLOMAT, name: 'Ambassador', emoji: '🕊️', hireCost: 280, dailyWage: 24, skills: { diplomacy: 7, negotiation: 6, xenolinguistics: 4 }, description: 'Smooths relations with alien species and factions.' },
  [SH_CREW_TRADER]: { id: SH_CREW_TRADER, name: 'Merchant', emoji: '💰', hireCost: 160, dailyWage: 14, skills: { trade: 7, appraisal: 5, negotiation: 3 }, description: 'Shrewd dealmaker who maximizes profit margins.' },
  [SH_CREW_MINER]: { id: SH_CREW_MINER, name: 'Astro-Miner', emoji: '⛏️', hireCost: 130, dailyWage: 11, skills: { mining: 7, geology: 4, endurance: 3 }, description: 'Extracts valuable minerals from asteroids and planets.' },
  [SH_CREW_BOTANIST]: { id: SH_CREW_BOTANIST, name: 'Xeno-Botanist', emoji: '🌱', hireCost: 190, dailyWage: 16, skills: { biology: 6, agriculture: 5, medicine: 2 }, description: 'Cultivates alien flora for food and medicine.' },
  [SH_CREW_COOK]: { id: SH_CREW_COOK, name: 'Ship\'s Cook', emoji: '👨‍🍳', hireCost: 80, dailyWage: 7, skills: { cooking: 7, morale: 5, medicine: 1 }, description: 'Prevents mutiny by keeping the crew well-fed and happy.' },
  [SH_CREW_XENO_BIO]: { id: SH_CREW_XENO_BIO, name: 'Xeno-Biologist', emoji: '🧬', hireCost: 260, dailyWage: 22, skills: { xenobiology: 7, research: 5, genetics: 4 }, description: 'Studies alien lifeforms with fascination and caution.' },
  [SH_CREW_HACKER]: { id: SH_CREW_HACKER, name: 'NetRunner', emoji: '💻', hireCost: 200, dailyWage: 18, skills: { hacking: 7, electronics: 5, stealth: 3 }, description: 'Breaks into secure systems and decrypts alien codes.' },
  [SH_CREW_PREACHER]: { id: SH_CREW_PREACHER, name: 'Void Preacher', emoji: '📿', hireCost: 100, dailyWage: 8, skills: { morale: 7, leadership: 3, diplomacy: 2 }, description: 'Tends to the spiritual needs of the crew.' },
  [SH_CREW_BOUNTY_HUNTER]: { id: SH_CREW_BOUNTY_HUNTER, name: 'Bounty Hunter', emoji: '💵', hireCost: 220, dailyWage: 19, skills: { combat: 6, tracking: 7, stealth: 4 }, description: 'Relentless tracker who always gets their mark.' },
};

// ─── Achievement Constants (18 achievements) ────────────────────────────────

export const SH_ACH_FIRST_DOCK = 'first_dock';
export const SH_ACH_TRADE_ROOKIE = 'trade_rookie';
export const SH_ACH_MASTER_TRADER = 'master_trader';
export const SH_ACH_FLEET_ADMIRAL = 'fleet_admiral';
export const SH_ACH_HARBOR_MASTER = 'harbor_master_ach';
export const SH_ACH_RARE_COLLECTOR = 'rare_collector';
export const SH_ACH_CREW_LEGEND = 'crew_legend';
export const SH_ACH_UPGRADE_KING = 'upgrade_king';
export const SH_ACH_PIRATE_HUNTER = 'pirate_hunter';
export const SH_ACH_SPACE_EVENT_VET = 'space_event_vet';
export const SH_ACH_BIO_EXPERT = 'bio_expert';
export const SH_ACH_BLACK_MARKET_BARON = 'black_market_baron';
export const SH_ACH_DAILY_RUNNER = 'daily_runner';
export const SH_ACH_TITAN_OWNER = 'titan_owner';
export const SH_ACH_MAX_FACILITIES = 'max_facilities';
export const SH_ACH_GALACTIC_RICH = 'galactic_rich';
export const SH_ACH_EVENT_SURVIVOR = 'event_survivor';
export const SH_ACH_STARLIGHT_LEGEND = 'starlight_legend';

export const SH_ALL_ACHIEVEMENTS: string[] = [
  SH_ACH_FIRST_DOCK,
  SH_ACH_TRADE_ROOKIE,
  SH_ACH_MASTER_TRADER,
  SH_ACH_FLEET_ADMIRAL,
  SH_ACH_HARBOR_MASTER,
  SH_ACH_RARE_COLLECTOR,
  SH_ACH_CREW_LEGEND,
  SH_ACH_UPGRADE_KING,
  SH_ACH_PIRATE_HUNTER,
  SH_ACH_SPACE_EVENT_VET,
  SH_ACH_BIO_EXPERT,
  SH_ACH_BLACK_MARKET_BARON,
  SH_ACH_DAILY_RUNNER,
  SH_ACH_TITAN_OWNER,
  SH_ACH_MAX_FACILITIES,
  SH_ACH_GALACTIC_RICH,
  SH_ACH_EVENT_SURVIVOR,
  SH_ACH_STARLIGHT_LEGEND,
];

export const SH_ACHIEVEMENT_DEFS: Record<string, { name: string; description: string; xp: number }> = {
  [SH_ACH_FIRST_DOCK]: { name: 'First Dock', description: 'Dock your first starship at the harbor', xp: 50 },
  [SH_ACH_TRADE_ROOKIE]: { name: 'Trade Rookie', description: 'Complete 10 successful trades', xp: 80 },
  [SH_ACH_MASTER_TRADER]: { name: 'Master Trader', description: 'Complete 100 successful trades', xp: 250 },
  [SH_ACH_FLEET_ADMIRAL]: { name: 'Fleet Admiral', description: 'Own 10 docked ships simultaneously', xp: 200 },
  [SH_ACH_HARBOR_MASTER]: { name: 'Harbor Master', description: 'Upgrade all 25 facilities to level 5+', xp: 300 },
  [SH_ACH_RARE_COLLECTOR]: { name: 'Rare Collector', description: 'Own 5 legendary rarity ships', xp: 220 },
  [SH_ACH_CREW_LEGEND]: { name: 'Crew Legend', description: 'Hire and retain 20 crew members', xp: 180 },
  [SH_ACH_UPGRADE_KING]: { name: 'Upgrade King', description: 'Upgrade any facility to maximum level 10', xp: 150 },
  [SH_ACH_PIRATE_HUNTER]: { name: 'Pirate Hunter', description: 'Survive 10 pirate attacks successfully', xp: 160 },
  [SH_ACH_SPACE_EVENT_VET]: { name: 'Space Event Veteran', description: 'Encounter 30 random space events', xp: 140 },
  [SH_ACH_BIO_EXPERT]: { name: 'Bio Expert', description: 'Trade 50 bio-category goods', xp: 120 },
  [SH_ACH_BLACK_MARKET_BARON]: { name: 'Black Market Baron', description: 'Make 20 trades at the Black Market dock', xp: 200 },
  [SH_ACH_DAILY_RUNNER]: { name: 'Daily Runner', description: 'Complete 15 daily supply run quests', xp: 130 },
  [SH_ACH_TITAN_OWNER]: { name: 'Titan Owner', description: 'Own a Titan-class or Celestial Fortress ship', xp: 350 },
  [SH_ACH_MAX_FACILITIES]: { name: 'Facility Magnate', description: 'Build all 25 harbor facilities', xp: 280 },
  [SH_ACH_GALACTIC_RICH]: { name: 'Galactic Rich', description: 'Accumulate 50,000 coins', xp: 300 },
  [SH_ACH_EVENT_SURVIVOR]: { name: 'Event Survivor', description: 'Survive 5 consecutive days with events', xp: 100 },
  [SH_ACH_STARLIGHT_LEGEND]: { name: 'Starlight Legend', description: 'Reach Level 50', xp: 500 },
};

// ─── Title Constants (8 titles: Deckhand → Harbor Master) ───────────────────

export const SH_TITLE_DECKHAND = 'Deckhand';
export const SH_TITLE_BOATSWAIN = 'Boatswain';
export const SH_TITLE_NAVIGATOR = 'Navigator';
export const SH_TITLE_COMMANDER = 'Commander';
export const SH_TITLE_CAPTAIN = 'Captain';
export const SH_TITLE_COMMODORE = 'Commodore';
export const SH_TITLE_ADMIRAL = 'Admiral';
export const SH_TITLE_HARBOR_MASTER = 'Harbor Master';

export const SH_ALL_TITLES: string[] = [
  SH_TITLE_DECKHAND,
  SH_TITLE_BOATSWAIN,
  SH_TITLE_NAVIGATOR,
  SH_TITLE_COMMANDER,
  SH_TITLE_CAPTAIN,
  SH_TITLE_COMMODORE,
  SH_TITLE_ADMIRAL,
  SH_TITLE_HARBOR_MASTER,
];

export const SH_TITLE_LEVEL_REQ: Record<string, number> = {
  [SH_TITLE_DECKHAND]: 1,
  [SH_TITLE_BOATSWAIN]: 5,
  [SH_TITLE_NAVIGATOR]: 12,
  [SH_TITLE_COMMANDER]: 20,
  [SH_TITLE_CAPTAIN]: 28,
  [SH_TITLE_COMMODORE]: 36,
  [SH_TITLE_ADMIRAL]: 43,
  [SH_TITLE_HARBOR_MASTER]: 50,
};

// ─── Space Events ───────────────────────────────────────────────────────────

export const SH_EVENT_PIRATES = 'pirate_attack';
export const SH_EVENT_NEBULA_STORM = 'nebula_storm';
export const SH_EVENT_ALIEN_ENCOUNTER = 'alien_encounter';
export const SH_EVENT_COMMERCE_BOOM = 'commerce_boom';
export const SH_EVENT_ASTEROID_STRIKE = 'asteroid_strike';
export const SH_EVENT_DERELICT_SHIP = 'derelict_ship';
export const SH_EVENT_PLAGUE_OUTBREAK = 'plague_outbreak';
export const SH_EVENT_DISTRESS_SIGNAL = 'distress_signal';
export const SH_EVENT_WORMHOLE = 'wormhole_opening';
export const SH_EVENT_SOLAR_FLARE = 'solar_flare';

export const SH_ALL_EVENTS: string[] = [
  SH_EVENT_PIRATES,
  SH_EVENT_NEBULA_STORM,
  SH_EVENT_ALIEN_ENCOUNTER,
  SH_EVENT_COMMERCE_BOOM,
  SH_EVENT_ASTEROID_STRIKE,
  SH_EVENT_DERELICT_SHIP,
  SH_EVENT_PLAGUE_OUTBREAK,
  SH_EVENT_DISTRESS_SIGNAL,
  SH_EVENT_WORMHOLE,
  SH_EVENT_SOLAR_FLARE,
];

// ─── Misc Constants ─────────────────────────────────────────────────────────

export const SH_MAX_LEVEL = 50;
export const SH_MAX_CREW = 30;
export const SH_MAX_DOCKED_SHIPS = 20;
export const SH_MAX_FACILITY_LEVEL = 10;
export const SH_BASE_XP_PER_LEVEL = 200;
export const SH_XP_SCALE_FACTOR = 1.5;
export const SH_STARTING_COINS = 500;
export const SH_DAILY_SUPPLY_COINS = 100;
export const SH_DAILY_SUPPLY_XP = 50;
export const SH_EVENT_CHANCE = 0.25;
export const SH_TRADE_TAX_RATE = 0.08;
export const SH_DOCK_CAPACITY_BONUS_PER_LEVEL = 2;

// ─── Types & Interfaces ─────────────────────────────────────────────────────

interface ShDockedShip {
  shipId: string;
  dockId: string;
  hullCurrent: number;
  arrivedDay: number;
  missionTimer: number;
}

interface ShCrewMember {
  id: string;
  crewTypeId: string;
  name: string;
  morale: number;
  health: number;
  experience: number;
  assignedShipId: string | null;
  hiredDay: number;
}

interface ShInventoryEntry {
  goodId: string;
  quantity: number;
}

interface ShFacilityState {
  facilityId: string;
  level: number;
  built: boolean;
}

interface ShAchievementState {
  achievementId: string;
  unlocked: boolean;
  unlockedDay: number | null;
}

interface ShPriceCache {
  goodId: string;
  price: number;
  daySet: number;
}

interface ShDailyState {
  day: number;
  supplyRunClaimed: boolean;
  supplyRunProgress: number;
  eventsEncountered: string[];
}

interface ShEventLog {
  day: number;
  message: string;
  type: string;
}

interface ShQuestState {
  questId: string;
  status: 'available' | 'active' | 'completed';
  progress: number;
  target: number;
}

interface ShStarlightHarborState {
  seed: number;
  day: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXpEarned: number;
  title: string;
  coins: number;
  totalCoinsEarned: number;
  totalTrades: number;
  totalBioTrades: number;
  totalBlackMarketTrades: number;
  pirateAttacksSurvived: number;
  totalEventsEncountered: number;
  dailySupplyRunsCompleted: number;
  dockedShips: ShDockedShip[];
  crew: ShCrewMember[];
  inventory: ShInventoryEntry[];
  facilities: ShFacilityState[];
  achievements: ShAchievementState[];
  priceCache: ShPriceCache[];
  dailyState: ShDailyState;
  eventLog: ShEventLog[];
  quests: ShQuestState[];
  consecutiveEventDays: number;
  shipCounter: number;
  crewCounter: number;
}

// ─── Helper: XP calculation ─────────────────────────────────────────────────

function shCalculateXpToNext(level: number): number {
  return Math.floor(SH_BASE_XP_PER_LEVEL * Math.pow(SH_XP_SCALE_FACTOR, level - 1));
}

// ─── Helper: generate crew name ─────────────────────────────────────────────

const SH_FIRST_NAMES = [
  'Astra', 'Blaze', 'Cosmo', 'Drift', 'Echo', 'Flux', 'Glow', 'Helix',
  'Ion', 'Jett', 'Kira', 'Lux', 'Mira', 'Nova', 'Orion', 'Pulse',
  'Quasar', 'Raze', 'Sol', 'Terra', 'Uma', 'Vex', 'Wren', 'Xara',
  'Yuki', 'Zane', 'Atlas', 'Brio', 'Cryo', 'Dax', 'Elara', 'Finn',
];

const SH_LAST_NAMES = [
  'Starweaver', 'Deepvoid', 'Ironclad', 'Nebula', 'Vortex', 'Solaris', 'Crux', 'Draven',
  'Nightfall', 'Starfire', 'Voidwalker', 'Brightsun', 'Stardust', 'Ironforge', 'Wavecrest', 'Mistral',
  'Moonrise', 'Skyfall', 'Dawnbreak', 'Starborn', 'Horizon', 'Deepwell', 'Fairwind', 'Ashford',
];

function shGenerateCrewName(rng: () => number): string {
  const firstIdx = Math.floor(rng() * SH_FIRST_NAMES.length);
  const lastIdx = Math.floor(rng() * SH_LAST_NAMES.length);
  return SH_FIRST_NAMES[firstIdx] + ' ' + SH_LAST_NAMES[lastIdx];
}

// ─── Helper: dynamic price ──────────────────────────────────────────────────

function shCalculatePrice(basePrice: number, volatility: number, day: number, seed: number): number {
  const hash = Math.sin(seed * 12.9898 + day * 78.233) * 43758.5453;
  const noise = (hash - Math.floor(hash)) * 2 - 1;
  const factor = 1 + noise * volatility;
  return Math.max(1, Math.floor(basePrice * factor));
}

// ─── Initial State ──────────────────────────────────────────────────────────

function shCreateInitialState(seed?: number): ShStarlightHarborState {
  const actualSeed = seed ?? 42;
  const rng = mulberry32(actualSeed);

  const initialFacilities: ShFacilityState[] = SH_ALL_FACILITIES.map((facId) => ({
    facilityId: facId,
    level: 0,
    built: false,
  }));

  const initialAchievements: ShAchievementState[] = SH_ALL_ACHIEVEMENTS.map((achId) => ({
    achievementId: achId,
    unlocked: false,
    unlockedDay: null,
  }));

  const initialPriceCache: ShPriceCache[] = SH_ALL_GOODS.map((goodId) => {
    const def = SH_GOOD_DEFS[goodId];
    return {
      goodId,
      price: def ? shCalculatePrice(def.basePrice, def.volatility, 1, actualSeed) : 10,
      daySet: 1,
    };
  });

  const initialInventory: ShInventoryEntry[] = [
    { goodId: SH_GOOD_SYNTH_FOOD, quantity: 20 },
    { goodId: SH_GOOD_FUEL_CELL, quantity: 10 },
    { goodId: SH_GOOD_MED_GEL, quantity: 5 },
  ];

  const initialCrew: ShCrewMember[] = [];
  const starterCrewTypes = [SH_CREW_CAPTAIN, SH_CREW_ENGINEER, SH_CREW_PILOT];
  for (let i = 0; i < starterCrewTypes.length; i++) {
    initialCrew.push({
      id: 'crew_' + (i + 1),
      crewTypeId: starterCrewTypes[i],
      name: shGenerateCrewName(rng),
      morale: 80,
      health: 100,
      experience: 0,
      assignedShipId: null,
      hiredDay: 1,
    });
  }

  const initialQuests: ShQuestState[] = [
    { questId: 'daily_supply_run', status: 'active', progress: 0, target: 3 },
  ];

  return {
    seed: actualSeed,
    day: 1,
    level: 1,
    xp: 0,
    xpToNextLevel: shCalculateXpToNext(1),
    totalXpEarned: 0,
    title: SH_TITLE_DECKHAND,
    coins: SH_STARTING_COINS,
    totalCoinsEarned: SH_STARTING_COINS,
    totalTrades: 0,
    totalBioTrades: 0,
    totalBlackMarketTrades: 0,
    pirateAttacksSurvived: 0,
    totalEventsEncountered: 0,
    dailySupplyRunsCompleted: 0,
    dockedShips: [],
    crew: initialCrew,
    inventory: initialInventory,
    facilities: initialFacilities,
    achievements: initialAchievements,
    priceCache: initialPriceCache,
    dailyState: {
      day: 1,
      supplyRunClaimed: false,
      supplyRunProgress: 0,
      eventsEncountered: [],
    },
    eventLog: [
      { day: 1, message: 'Welcome to Starlight Harbor! Your journey among the stars begins here. ✨', type: 'info' },
    ],
    quests: initialQuests,
    consecutiveEventDays: 0,
    shipCounter: 0,
    crewCounter: 3,
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export default function useStarlightHarbor(initialSeed?: number) {
  const [state, setState] = useState<ShStarlightHarborState>(() => shCreateInitialState(initialSeed));

  // ── Core state accessor ─────────────────────────────────────────────────

  const shGetState = useCallback((): ShStarlightHarborState => {
    return state;
  }, [state]);

  // ── Internal helpers (not exported) ─────────────────────────────────────

  function applyXpGain(currentState: ShStarlightHarborState, amount: number): ShStarlightHarborState {
    let newXp = currentState.xp + amount;
    let newLevel = currentState.level;
    let newXpToNext = currentState.xpToNextLevel;
    let newTitle = currentState.title;
    const newTotalXp = currentState.totalXpEarned + amount;

    while (newXp >= newXpToNext && newLevel < SH_MAX_LEVEL) {
      newXp -= newXpToNext;
      newLevel += 1;
      newXpToNext = shCalculateXpToNext(newLevel);
    }

    if (newXp >= newXpToNext && newLevel >= SH_MAX_LEVEL) {
      newXp = 0;
    }

    for (let i = SH_ALL_TITLES.length - 1; i >= 0; i--) {
      if (newLevel >= SH_TITLE_LEVEL_REQ[SH_ALL_TITLES[i]]) {
        newTitle = SH_ALL_TITLES[i];
        break;
      }
    }

    return {
      ...currentState,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newXpToNext,
      totalXpEarned: newTotalXp,
      title: newTitle,
    };
  }

  function addCoins(currentState: ShStarlightHarborState, amount: number): ShStarlightHarborState {
    const newCoins = currentState.coins + amount;
    const newTotal = currentState.totalCoinsEarned + amount;
    return { ...currentState, coins: Math.max(0, newCoins), totalCoinsEarned: Math.max(0, newTotal) };
  }

  function addInventoryItem(currentState: ShStarlightHarborState, goodId: string, quantity: number): ShStarlightHarborState {
    const newInventory = currentState.inventory.map((item) => ({ ...item }));
    const existing = newInventory.find((item) => item.goodId === goodId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      newInventory.push({ goodId, quantity });
    }
    return { ...currentState, inventory: newInventory };
  }

  function removeInventoryItem(currentState: ShStarlightHarborState, goodId: string, quantity: number): ShStarlightHarborState {
    const newInventory = currentState.inventory.map((item) => ({ ...item }));
    const existing = newInventory.find((item) => item.goodId === goodId);
    if (existing) {
      existing.quantity = Math.max(0, existing.quantity - quantity);
    }
    return { ...currentState, inventory: newInventory.filter((item) => item.quantity > 0) };
  }

  function getInventoryQuantity(currentState: ShStarlightHarborState, goodId: string): number {
    const entry = currentState.inventory.find((item) => item.goodId === goodId);
    if (entry) {
      return entry.quantity;
    }
    return 0;
  }

  function refreshPrices(currentState: ShStarlightHarborState): ShStarlightHarborState {
    const newPriceCache = SH_ALL_GOODS.map((goodId) => {
      const def = SH_GOOD_DEFS[goodId];
      const existingCache = currentState.priceCache.find((p) => p.goodId === goodId);
      if (existingCache && existingCache.daySet === currentState.day) {
        return existingCache;
      }
      const price = def ? shCalculatePrice(def.basePrice, def.volatility, currentState.day, currentState.seed + goodId.length * 7) : 10;
      return { goodId, price, daySet: currentState.day };
    });
    return { ...currentState, priceCache: newPriceCache };
  }

  function checkAchievements(currentState: ShStarlightHarborState): ShStarlightHarborState {
    const newAchievements = currentState.achievements.map((a) => ({ ...a }));
    const newEventLog = [...currentState.eventLog];
    let newState = { ...currentState, achievements: newAchievements, eventLog: newEventLog };
    let xpGain = 0;

    const check = (id: string, condition: boolean) => {
      const entry = newAchievements.find((a) => a.achievementId === id);
      if (entry && !entry.unlocked && condition) {
        entry.unlocked = true;
        entry.unlockedDay = currentState.day;
        const def = SH_ACHIEVEMENT_DEFS[id];
        if (def) {
          xpGain += def.xp;
          newEventLog.push({
            day: currentState.day,
            message: `Achievement Unlocked: ${def.name}! +${def.xp} XP 🏆`,
            type: 'achievement',
          });
        }
      }
    };

    check(SH_ACH_FIRST_DOCK, currentState.dockedShips.length >= 1);
    check(SH_ACH_TRADE_ROOKIE, currentState.totalTrades >= 10);
    check(SH_ACH_MASTER_TRADER, currentState.totalTrades >= 100);
    check(SH_ACH_FLEET_ADMIRAL, currentState.dockedShips.length >= 10);
    check(SH_ACH_HARBOR_MASTER, currentState.facilities.filter((f) => f.built && f.level >= 5).length >= 25);
    check(SH_ACH_RARE_COLLECTOR, currentState.dockedShips.filter((s) => {
      const def = SH_SHIP_DEFS[s.shipId];
      return def && def.rarity === SH_RARITY_LEGENDARY;
    }).length >= 5);
    check(SH_ACH_CREW_LEGEND, currentState.crew.length >= 20);
    check(SH_ACH_UPGRADE_KING, currentState.facilities.some((f) => f.built && f.level >= 10));
    check(SH_ACH_PIRATE_HUNTER, currentState.pirateAttacksSurvived >= 10);
    check(SH_ACH_SPACE_EVENT_VET, currentState.totalEventsEncountered >= 30);
    check(SH_ACH_BIO_EXPERT, currentState.totalBioTrades >= 50);
    check(SH_ACH_BLACK_MARKET_BARON, currentState.totalBlackMarketTrades >= 20);
    check(SH_ACH_DAILY_RUNNER, currentState.dailySupplyRunsCompleted >= 15);
    check(SH_ACH_TITAN_OWNER, currentState.dockedShips.some((s) => s.shipId === SH_SHIP_TITAN_CLASS || s.shipId === SH_SHIP_CELESTIAL_FORTRESS));
    check(SH_ACH_MAX_FACILITIES, currentState.facilities.filter((f) => f.built).length >= 25);
    check(SH_ACH_GALACTIC_RICH, currentState.totalCoinsEarned >= 50000);
    check(SH_ACH_EVENT_SURVIVOR, currentState.consecutiveEventDays >= 5);
    check(SH_ACH_STARLIGHT_LEGEND, currentState.level >= 50);

    if (xpGain > 0) {
      newState = applyXpGain(newState, xpGain);
    }
    return newState;
  }

  // ── Actions (useCallback-wrapped) ───────────────────────────────────────

  const shDockShip = useCallback((shipId: string, dockId: string): boolean => {
    let success = false;
    setState((prev) => {
      const shipDef = SH_SHIP_DEFS[shipId];
      const dockDef = SH_DOCK_DEFS[dockId];
      if (!shipDef || !dockDef) return prev;
      if (prev.dockedShips.length >= SH_MAX_DOCKED_SHIPS) return prev;
      const shipsAtDock = prev.dockedShips.filter((s) => s.dockId === dockId).length;
      if (shipsAtDock >= dockDef.maxShips) return prev;

      const facilityBonus = prev.facilities.find((f) => f.facilityId === SH_FAC_GRAV_DOCK);
      const bonusCapacity = facilityBonus && facilityBonus.built ? facilityBonus.level * SH_DOCK_CAPACITY_BONUS_PER_LEVEL : 0;
      if (shipsAtDock >= dockDef.maxShips + bonusCapacity) return prev;

      const dockFee = Math.floor(shipDef.dockFee * (SH_RARITY_DOCK_FEE_MULTIPLIER[shipDef.rarity] ?? 1));
      if (prev.coins < dockFee) return prev;

      let next = addCoins(prev, -dockFee);
      next = {
        ...next,
        dockedShips: [...next.dockedShips, {
          shipId,
          dockId,
          hullCurrent: shipDef.hull,
          arrivedDay: next.day,
          missionTimer: 0,
        }],
        shipCounter: next.shipCounter + 1,
      };

      next.eventLog.push({
        day: next.day,
        message: `${shipDef.emoji} ${shipDef.name} docked at ${dockDef.name} for ${dockFee} coins.`,
        type: 'dock',
      });

      next = applyXpGain(next, 25);
      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const shUndockShip = useCallback((shipId: string): boolean => {
    let success = false;
    setState((prev) => {
      const idx = prev.dockedShips.findIndex((s) => s.shipId === shipId);
      if (idx < 0) return prev;

      const shipDef = SH_SHIP_DEFS[shipId];
      let next = {
        ...prev,
        dockedShips: prev.dockedShips.filter((s) => s.shipId !== shipId),
        crew: prev.crew.map((c) => c.assignedShipId === shipId ? { ...c, assignedShipId: null } : c),
      };

      if (shipDef) {
        next.eventLog.push({
          day: next.day,
          message: `${shipDef.emoji} ${shipDef.name} has departed Starlight Harbor.`,
          type: 'undock',
        });
      }

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const shTradeGoods = useCallback((goodId: string, quantity: number, action: 'buy' | 'sell'): boolean => {
    let success = false;
    setState((prev) => {
      let next = refreshPrices(prev);
      const priceEntry = next.priceCache.find((p) => p.goodId === goodId);
      if (!priceEntry) return prev;

      const goodDef = SH_GOOD_DEFS[goodId];
      if (!goodDef) return prev;

      const tradeExchange = next.facilities.find((f) => f.facilityId === SH_FAC_TRADE_EXCHANGE);
      const tradeBonus = tradeExchange && tradeExchange.built ? 1 - 0.02 * tradeExchange.level : 1;

      if (action === 'buy') {
        const cost = Math.floor(priceEntry.price * quantity * tradeBonus);
        if (next.coins < cost) return prev;
        if (next.dockedShips.length === 0) return prev;
        next = addCoins(next, -cost);
        next = addInventoryItem(next, goodId, quantity);
        next.eventLog.push({
          day: next.day,
          message: `Bought ${quantity}x ${goodDef.emoji} ${goodDef.name} for ${cost} coins.`,
          type: 'trade',
        });
      } else {
        const haveQty = getInventoryQuantity(next, goodId);
        if (haveQty < quantity) return prev;
        const revenue = Math.floor(priceEntry.price * quantity * 0.9 * (1 + 0.02 * (tradeExchange && tradeExchange.built ? tradeExchange.level : 0)));
        next = addCoins(next, revenue);
        next = removeInventoryItem(next, goodId, quantity);
        next.eventLog.push({
          day: next.day,
          message: `Sold ${quantity}x ${goodDef.emoji} ${goodDef.name} for ${revenue} coins.`,
          type: 'trade',
        });
      }

      const newTotalTrades = next.totalTrades + 1;
      const isBio = goodDef.category === 'Bio';
      const currentShipDock = next.dockedShips[0];
      const isBlackMarket = currentShipDock && currentShipDock.dockId === SH_DOCK_BLACK_MARKET;
      next = {
        ...next,
        totalTrades: newTotalTrades,
        totalBioTrades: next.totalBioTrades + (isBio ? 1 : 0),
        totalBlackMarketTrades: next.totalBlackMarketTrades + (isBlackMarket ? 1 : 0),
      };

      next = applyXpGain(next, 15);
      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const shHireCrew = useCallback((crewTypeId: string): boolean => {
    let success = false;
    setState((prev) => {
      const crewDef = SH_CREW_TYPE_DEFS[crewTypeId];
      if (!crewDef) return prev;
      if (prev.crew.length >= SH_MAX_CREW) return prev;
      if (prev.coins < crewDef.hireCost) return prev;

      const rng = mulberry32(prev.seed + prev.day * 99 + prev.crewCounter * 13);
      const name = shGenerateCrewName(rng);

      let next = addCoins(prev, -crewDef.hireCost);
      next = {
        ...next,
        crew: [...next.crew, {
          id: 'crew_' + (next.crewCounter + 1),
          crewTypeId,
          name,
          morale: 80,
          health: 100,
          experience: 0,
          assignedShipId: null,
          hiredDay: next.day,
        }],
        crewCounter: next.crewCounter + 1,
      };

      next.eventLog.push({
        day: next.day,
        message: `${crewDef.emoji} ${name} (${crewDef.name}) hired for ${crewDef.hireCost} coins!`,
        type: 'crew',
      });

      next = applyXpGain(next, 10);
      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const shDismissCrew = useCallback((crewId: string): boolean => {
    let success = false;
    setState((prev) => {
      const idx = prev.crew.findIndex((c) => c.id === crewId);
      if (idx < 0) return prev;

      const crewMember = prev.crew[idx];
      const crewDef = SH_CREW_TYPE_DEFS[crewMember.crewTypeId];

      let next = {
        ...prev,
        crew: prev.crew.filter((c) => c.id !== crewId),
      };

      if (crewDef) {
        next.eventLog.push({
          day: next.day,
          message: `${crewDef.emoji} ${crewMember.name} has left the harbor.`,
          type: 'crew',
        });
      }

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const shAssignCrew = useCallback((crewId: string, shipId: string | null): boolean => {
    let success = false;
    setState((prev) => {
      const crewIdx = prev.crew.findIndex((c) => c.id === crewId);
      if (crewIdx < 0) return prev;

      if (shipId !== null) {
        const ship = prev.dockedShips.find((s) => s.shipId === shipId);
        if (!ship) return prev;
        const crewOnShip = prev.crew.filter((c) => c.assignedShipId === shipId).length;
        const shipDef = SH_SHIP_DEFS[shipId];
        if (!shipDef) return prev;
        if (crewOnShip >= shipDef.crewCap) return prev;
      }

      let next = {
        ...prev,
        crew: prev.crew.map((c) => c.id === crewId ? { ...c, assignedShipId: shipId } : c),
      };

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const shBuildFacility = useCallback((facilityId: string): boolean => {
    let success = false;
    setState((prev) => {
      const facDef = SH_FACILITY_DEFS[facilityId];
      if (!facDef) return prev;

      const existing = prev.facilities.find((f) => f.facilityId === facilityId);
      if (existing && existing.built) return prev;
      if (prev.coins < facDef.baseCost) return prev;

      let next = addCoins(prev, -facDef.baseCost);
      next = {
        ...next,
        facilities: next.facilities.map((f) => f.facilityId === facilityId ? { ...f, built: true, level: 1 } : f),
      };

      next.eventLog.push({
        day: next.day,
        message: `${facDef.emoji} ${facDef.name} built! The harbor grows stronger.`,
        type: 'build',
      });

      next = applyXpGain(next, 30);
      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const shUpgradeFacility = useCallback((facilityId: string): boolean => {
    let success = false;
    setState((prev) => {
      const facDef = SH_FACILITY_DEFS[facilityId];
      if (!facDef) return prev;

      const existing = prev.facilities.find((f) => f.facilityId === facilityId);
      if (!existing || !existing.built) return prev;
      if (existing.level >= facDef.maxLevel) return prev;

      const upgradeCost = Math.floor(facDef.baseCost * Math.pow(facDef.upgradeCostScale, existing.level));
      if (prev.coins < upgradeCost) return prev;

      let next = addCoins(prev, -upgradeCost);
      const newLevel = existing.level + 1;
      next = {
        ...next,
        facilities: next.facilities.map((f) => f.facilityId === facilityId ? { ...f, level: newLevel } : f),
      };

      next.eventLog.push({
        day: next.day,
        message: `${facDef.emoji} ${facDef.name} upgraded to level ${newLevel}! Cost: ${upgradeCost} coins.`,
        type: 'upgrade',
      });

      next = applyXpGain(next, 20);
      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const shSendOnMission = useCallback((shipId: string, missionType: string, duration: number): boolean => {
    let success = false;
    setState((prev) => {
      const ship = prev.dockedShips.find((s) => s.shipId === shipId);
      if (!ship) return prev;
      if (ship.missionTimer > 0) return prev;

      let next = {
        ...prev,
        dockedShips: prev.dockedShips.map((s) => s.shipId === shipId ? { ...s, missionTimer: duration } : s),
      };

      const shipDef = SH_SHIP_DEFS[shipId];
      next.eventLog.push({
        day: next.day,
        message: `${shipDef ? shipDef.emoji : '🚀'} ${shipDef ? shipDef.name : 'Ship'} sent on ${missionType} mission (${duration} days).`,
        type: 'mission',
      });

      next = applyXpGain(next, 10);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const shClaimDailySupplyRun = useCallback((): { coins: number; xp: number; message: string } => {
    let result = { coins: 0, xp: 0, message: 'Already claimed today.' };
    setState((prev) => {
      if (prev.dailyState.supplyRunClaimed) return prev;

      const tavernBonus = prev.facilities.find((f) => f.facilityId === SH_FAC_TAVERN);
      const tavernMult = tavernBonus && tavernBonus.built ? 1 + 0.1 * tavernBonus.level : 1;

      const coinReward = Math.floor(SH_DAILY_SUPPLY_COINS * tavernMult);
      const xpReward = Math.floor(SH_DAILY_SUPPLY_XP * tavernMult);

      let next = addCoins(prev, coinReward);
      next = applyXpGain(next, xpReward);
      next = {
        ...next,
        dailySupplyRunsCompleted: next.dailySupplyRunsCompleted + 1,
        dailyState: { ...next.dailyState, supplyRunClaimed: true, supplyRunProgress: 0 },
      };

      next.eventLog.push({
        day: next.day,
        message: `Daily Supply Run completed! +${coinReward} coins, +${xpReward} XP 📦`,
        type: 'daily',
      });

      next = addInventoryItem(next, SH_GOOD_SYNTH_FOOD, 5);
      next = addInventoryItem(next, SH_GOOD_FUEL_CELL, 3);
      next = checkAchievements(next);

      result = { coins: coinReward, xp: xpReward, message: `Supply run complete! +${coinReward} coins, +${xpReward} XP` };
      return next;
    });
    return result;
  }, [state]);

  const shHandleEvent = useCallback((eventId: string): { outcome: string; coins: number; xp: number } => {
    let result = { outcome: 'Nothing happened.', coins: 0, xp: 0 };
    setState((prev) => {
      const rng = mulberry32(prev.seed + prev.day * 43 + prev.totalEventsEncountered * 7);
      let next = { ...prev };
      let outcomeMessage = '';
      let coinChange = 0;
      let xpChange = 0;
      let survivedPirate = false;
      let isEvent = true;

      if (eventId === SH_EVENT_PIRATES) {
        const crewStrength = next.crew.filter((c) => {
          const def = SH_CREW_TYPE_DEFS[c.crewTypeId];
          return def && (def.skills.combat > 0 || def.skills.defense > 0);
        }).length;
        const victoryChance = Math.min(0.9, 0.3 + crewStrength * 0.1);
        if (rng() < victoryChance) {
          const loot = 50 + Math.floor(rng() * 150);
          coinChange = loot;
          xpChange = 40;
          outcomeMessage = `🏴‍☠️ Pirates attacked but were repelled! Looted ${loot} coins from their wreckage.`;
          survivedPirate = true;
        } else {
          const damage = 100 + Math.floor(rng() * 200);
          coinChange = -damage;
          xpChange = 10;
          outcomeMessage = `🏴‍☠️ Pirates raided the harbor! Lost ${damage} coins in the scramble.`;
        }
      } else if (eventId === SH_EVENT_NEBULA_STORM) {
        const damage = 50 + Math.floor(rng() * 100);
        coinChange = -damage;
        const salvage = Math.floor(rng() * 30);
        const nebulaGood = SH_ALL_GOODS[Math.floor(rng() * SH_ALL_GOODS.length)];
        next = addInventoryItem(next, nebulaGood, salvage);
        outcomeMessage = `🌪️ Nebula storm! Lost ${damage} coins but salvaged ${salvage}x ${SH_GOOD_DEFS[nebulaGood]?.name ?? 'materials'}.`;
        xpChange = 20;
      } else if (eventId === SH_EVENT_ALIEN_ENCOUNTER) {
        const diplomatCount = next.crew.filter((c) => c.crewTypeId === SH_CREW_DIPLOMAT).length;
        const friendly = rng() < (0.3 + diplomatCount * 0.15);
        if (friendly) {
          const giftGood = SH_ALL_GOODS[Math.floor(rng() * SH_ALL_GOODS.length)];
          const giftQty = 3 + Math.floor(rng() * 10);
          next = addInventoryItem(next, giftGood, giftQty);
          coinChange = 50 + Math.floor(rng() * 100);
          outcomeMessage = `👾 Friendly alien traders arrived! Received ${giftQty}x ${SH_GOOD_DEFS[giftGood]?.name ?? 'goods'} and ${coinChange} coins.`;
          xpChange = 35;
        } else {
          outcomeMessage = `👾 Hostile aliens detected! Diplomatic efforts failed. Ships on alert.`;
          coinChange = -30;
          xpChange = 15;
        }
      } else if (eventId === SH_EVENT_COMMERCE_BOOM) {
        coinChange = 150 + Math.floor(rng() * 300);
        xpChange = 25;
        outcomeMessage = `📈 Interstellar commerce boom! Trading profits soar. +${coinChange} coins!`;
      } else if (eventId === SH_EVENT_ASTEROID_STRIKE) {
        const dockedDamage = next.dockedShips.length > 0;
        const repairCost = 80 + Math.floor(rng() * 120);
        coinChange = -repairCost;
        if (dockedDamage) {
          const oreFound = 5 + Math.floor(rng() * 15);
          next = addInventoryItem(next, SH_GOOD_STELLAR_ORE, oreFound);
          outcomeMessage = `☄️ Asteroid strike! Repairs cost ${repairCost} coins. Found ${oreFound} stellar ore.`;
        } else {
          outcomeMessage = `☄️ Asteroid grazed the harbor! Repairs cost ${repairCost} coins.`;
        }
        xpChange = 20;
      } else if (eventId === SH_EVENT_DERELICT_SHIP) {
        const derelictShips = SH_ALL_SHIPS.filter((sid) => {
          const def = SH_SHIP_DEFS[sid];
          return def && (def.rarity === SH_RARITY_COMMON || def.rarity === SH_RARITY_UNCOMMON);
        });
        const found = derelictShips[Math.floor(rng() * derelictShips.length)];
        const scrapValue = 30 + Math.floor(rng() * 70);
        coinChange = scrapValue;
        const shipDef = SH_SHIP_DEFS[found];
        outcomeMessage = `🚢 Derelict ${shipDef ? shipDef.name : 'ship'} found adrift! Scrapped for ${scrapValue} coins.`;
        xpChange = 30;
      } else if (eventId === SH_EVENT_PLAGUE_OUTBREAK) {
        const medBay = next.facilities.find((f) => f.facilityId === SH_FAC_MED_BAY);
        const medicCount = next.crew.filter((c) => c.crewTypeId === SH_CREW_MEDIC).length;
        const protection = (medBay && medBay.built ? medBay.level * 0.1 : 0) + medicCount * 0.05;
        if (rng() < 0.4 + protection) {
          outcomeMessage = `🦠 Plague outbreak contained! Med-bay and medics saved the harbor.`;
          xpChange = 30;
        } else {
          const loss = 60 + Math.floor(rng() * 100);
          coinChange = -loss;
          next = {
            ...next,
            crew: next.crew.map((c) => ({
              ...c,
              health: Math.max(20, c.health - 20),
              morale: Math.max(10, c.morale - 15),
            })),
          };
          outcomeMessage = `🦠 Plague outbreak! Crew health and morale damaged. Lost ${loss} coins in quarantine costs.`;
          xpChange = 15;
        }
      } else if (eventId === SH_EVENT_DISTRESS_SIGNAL) {
        if (rng() < 0.6) {
          const reward = 100 + Math.floor(rng() * 200);
          coinChange = reward;
          xpChange = 40;
          outcomeMessage = `📡 Responded to distress signal! Grateful survivors rewarded ${reward} coins.`;
        } else {
          const trapLoss = 50 + Math.floor(rng() * 80);
          coinChange = -trapLoss;
          outcomeMessage = `📡 Distress signal was a trap! Lost ${trapLoss} coins escaping the ambush.`;
          xpChange = 20;
        }
      } else if (eventId === SH_EVENT_WORMHOLE) {
        const exoticGoods = [SH_GOOD_WORMCORE, SH_GOOD_VOID_ESSENCE, SH_GOOD_DARK_MATTER, SH_GOOD_SENTIENT_GEM];
        const foundGood = exoticGoods[Math.floor(rng() * exoticGoods.length)];
        const qty = 1 + Math.floor(rng() * 3);
        next = addInventoryItem(next, foundGood, qty);
        xpChange = 50;
        outcomeMessage = `🌀 A wormhole opened! Discovered ${qty}x ${SH_GOOD_DEFS[foundGood]?.name ?? 'exotic goods'} from another dimension.`;
      } else if (eventId === SH_EVENT_SOLAR_FLARE) {
        const powerCore = next.facilities.find((f) => f.facilityId === SH_FAC_POWER_CORE);
        if (powerCore && powerCore.built) {
          const energy = 20 + Math.floor(rng() * 40) * powerCore.level;
          coinChange = energy;
          outcomeMessage = `☀️ Solar flare! Power core absorbed ${energy} coins worth of energy.`;
          xpChange = 25;
        } else {
          const damage = 40 + Math.floor(rng() * 80);
          coinChange = -damage;
          outcomeMessage = `☀️ Solar flare! No power core to absorb it. Lost ${damage} coins in damage.`;
          xpChange = 15;
        }
      } else {
        isEvent = false;
      }

      if (!isEvent) return prev;

      next = addCoins(next, coinChange);
      next = applyXpGain(next, xpChange);
      next = {
        ...next,
        pirateAttacksSurvived: next.pirateAttacksSurvived + (survivedPirate ? 1 : 0),
        totalEventsEncountered: next.totalEventsEncountered + 1,
        consecutiveEventDays: next.consecutiveEventDays + 1,
        dailyState: {
          ...next.dailyState,
          eventsEncountered: [...next.dailyState.eventsEncountered, eventId],
        },
      };

      next.eventLog.push({
        day: next.day,
        message: outcomeMessage,
        type: 'event',
      });

      next = checkAchievements(next);
      result = { outcome: outcomeMessage, coins: coinChange, xp: xpChange };
      return next;
    });
    return result;
  }, [state]);

  const shAdvanceDay = useCallback((): void => {
    setState((prev) => {
      const rng = mulberry32(prev.seed + prev.day * 137);
      let next = {
        ...prev,
        day: prev.day + 1,
        consecutiveEventDays: 0,
        dailyState: {
          day: prev.day + 1,
          supplyRunClaimed: false,
          supplyRunProgress: 0,
          eventsEncountered: [],
        },
      };

      // Crew morale drift
      const tavern = next.facilities.find((f) => f.facilityId === SH_FAC_TAVERN);
      const holoTheater = next.facilities.find((f) => f.facilityId === SH_FAC_HOLO_THEATER);
      const moraleBoost = (tavern && tavern.built ? tavern.level * 0.5 : 0) + (holoTheater && holoTheater.built ? holoTheater.level * 0.3 : 0);
      const cookCount = next.crew.filter((c) => c.crewTypeId === SH_CREW_COOK).length;

      next = {
        ...next,
        crew: next.crew.map((c) => ({
          ...c,
          morale: Math.min(100, Math.max(0, c.morale + Math.floor(moraleBoost + cookCount * 0.5 - 2))),
          health: Math.min(100, Math.max(0, c.health + 1)),
          experience: c.experience + 1,
        })),
      };

      // Deduct crew wages
      let totalWages = 0;
      for (const crew of next.crew) {
        const def = SH_CREW_TYPE_DEFS[crew.crewTypeId];
        if (def) {
          totalWages += def.dailyWage;
        }
      }
      next = addCoins(next, -totalWages);

      // Mission timers
      next = {
        ...next,
        dockedShips: next.dockedShips.map((s) => {
          if (s.missionTimer > 0) {
            const newTimer = s.missionTimer - 1;
            return { ...s, missionTimer: newTimer };
          }
          return s;
        }),
      };

      // Complete missions
      const completedMissions = next.dockedShips.filter((s) => s.missionTimer === 0 && s.arrivedDay !== next.day);
      for (const ship of completedMissions) {
        const shipDef = SH_SHIP_DEFS[ship.shipId];
        const reward = 50 + Math.floor(rng() * 100);
        next = addCoins(next, reward);
        next = applyXpGain(next, 20);
        if (shipDef) {
          next.eventLog.push({
            day: next.day,
            message: `${shipDef.emoji} ${shipDef.name} returned from mission! Earned ${reward} coins. 🎉`,
            type: 'mission_complete',
          });
        }
      }

      // Refresh prices
      next = refreshPrices(next);

      // Random event
      const eventRoll = rng();
      if (eventRoll < SH_EVENT_CHANCE) {
        const events = SH_ALL_EVENTS;
        const eventIdx = Math.floor(rng() * events.length);
        const chosenEvent = events[eventIdx];

        const newEvents = [...next.dailyState.eventsEncountered];
        newEvents.push(chosenEvent);

        next = {
          ...next,
          totalEventsEncountered: next.totalEventsEncountered + 1,
          consecutiveEventDays: next.consecutiveEventDays + 1,
          dailyState: { ...next.dailyState, eventsEncountered: newEvents },
        };

        next.eventLog.push({
          day: next.day,
          message: `⚡ Event: ${chosenEvent.replace(/_/g, ' ')}!`,
          type: 'event_trigger',
        });
      }

      next = checkAchievements(next);
      return next;
    });
  }, [state]);

  const shGetLevel = useCallback((): number => {
    return state.level;
  }, [state]);

  const shGetTitle = useCallback((): string => {
    return state.title;
  }, [state]);

  const shGetCoins = useCallback((): number => {
    return state.coins;
  }, [state]);

  const shGetXp = useCallback((): number => {
    return state.xp;
  }, [state]);

  const shGetXpToNextLevel = useCallback((): number => {
    return state.xpToNextLevel;
  }, [state]);

  const shGetDay = useCallback((): number => {
    return state.day;
  }, [state]);

  const shGetProgress = useCallback((): number => {
    if (state.level >= SH_MAX_LEVEL) return 1;
    return state.xp / state.xpToNextLevel;
  }, [state]);

  const shGetDockedShips = useCallback((): ShDockedShip[] => {
    return state.dockedShips;
  }, [state]);

  const shGetCrew = useCallback((): ShCrewMember[] => {
    return state.crew;
  }, [state]);

  const shGetInventory = useCallback((): ShInventoryEntry[] => {
    return state.inventory;
  }, [state]);

  const shGetFacilities = useCallback((): ShFacilityState[] => {
    return state.facilities;
  }, [state]);

  const shGetEventLog = useCallback((): ShEventLog[] => {
    return state.eventLog;
  }, [state]);

  const shGetAchievements = useCallback((): ShAchievementState[] => {
    return state.achievements;
  }, [state]);

  const shGetPrice = useCallback((goodId: string): number => {
    const entry = state.priceCache.find((p) => p.goodId === goodId);
    if (entry) return entry.price;
    return 0;
  }, [state]);

  const shGetAllPrices = useCallback((): Record<string, number> => {
    const prices: Record<string, number> = {};
    for (const entry of state.priceCache) {
      prices[entry.goodId] = entry.price;
    }
    return prices;
  }, [state]);

  const shGetDailyState = useCallback((): ShDailyState => {
    return state.dailyState;
  }, [state]);

  const shResetState = useCallback((): void => {
    setState(shCreateInitialState());
  }, []);

  const shRestCrew = useCallback((): void => {
    setState((prev) => {
      const medBay = prev.facilities.find((f) => f.facilityId === SH_FAC_MED_BAY);
      const healBonus = medBay && medBay.built ? medBay.level * 5 : 10;
      return {
        ...prev,
        crew: prev.crew.map((c) => ({
          ...c,
          morale: Math.min(100, c.morale + 10),
          health: Math.min(100, c.health + healBonus),
        })),
      };
    });
  }, [state]);

  const shGetQuests = useCallback((): ShQuestState[] => {
    return state.quests;
  }, [state]);

  const shRepairShip = useCallback((shipId: string): boolean => {
    let success = false;
    setState((prev) => {
      const ship = prev.dockedShips.find((s) => s.shipId === shipId);
      if (!ship) return prev;

      const shipDef = SH_SHIP_DEFS[shipId];
      if (!shipDef) return prev;
      if (ship.hullCurrent >= shipDef.hull) return prev;

      const repairStation = prev.facilities.find((f) => f.facilityId === SH_FAC_SHIPYARD);
      const repairBonus = repairStation && repairStation.built ? 1 - 0.05 * repairStation.level : 1;
      const repairCost = Math.floor(20 * (shipDef.hull - ship.hullCurrent) / shipDef.hull * repairBonus);
      if (prev.coins < repairCost) return prev;

      let next = addCoins(prev, -repairCost);
      next = {
        ...next,
        dockedShips: next.dockedShips.map((s) => s.shipId === shipId ? { ...s, hullCurrent: shipDef.hull } : s),
      };

      next.eventLog.push({
        day: next.day,
        message: `${shipDef.emoji} ${shipDef.name} fully repaired for ${repairCost} coins.`,
        type: 'repair',
      });

      success = true;
      return next;
    });
    return success;
  }, [state]);

  // ── Memos ──────────────────────────────────────────────────────────────

  const shShipCatalog = useMemo((): readonly ShShipDef[] => {
    return SH_ALL_SHIPS.map((id) => SH_SHIP_DEFS[id]).filter(Boolean);
  }, []);

  const shDockCatalog = useMemo((): readonly ShDockDef[] => {
    return SH_ALL_DOCKS.map((id) => SH_DOCK_DEFS[id]).filter(Boolean);
  }, []);

  const shGoodCatalog = useMemo((): readonly ShGoodDef[] => {
    return SH_ALL_GOODS.map((id) => SH_GOOD_DEFS[id]).filter(Boolean);
  }, []);

  const shFacilityCatalog = useMemo((): readonly ShFacilityDef[] => {
    return SH_ALL_FACILITIES.map((id) => SH_FACILITY_DEFS[id]).filter(Boolean);
  }, []);

  const shCrewTypeCatalog = useMemo((): readonly ShCrewTypeDef[] => {
    return SH_ALL_CREW_TYPES.map((id) => SH_CREW_TYPE_DEFS[id]).filter(Boolean);
  }, []);

  const shAvailableShips = useMemo((): readonly ShShipDef[] => {
    return shShipCatalog.filter((ship) => {
      if (ship.rarity === SH_RARITY_COMMON) return true;
      if (ship.rarity === SH_RARITY_UNCOMMON) return state.level >= 5;
      if (ship.rarity === SH_RARITY_RARE) return state.level >= 12;
      if (ship.rarity === SH_RARITY_EPIC) return state.level >= 25;
      if (ship.rarity === SH_RARITY_LEGENDARY) return state.level >= 38;
      return false;
    });
  }, [shShipCatalog, state.level]);

  // ── Return API ─────────────────────────────────────────────────────────

  return {
    shGetState,
    shGetLevel,
    shGetTitle,
    shGetCoins,
    shGetXp,
    shGetXpToNextLevel,
    shGetDay,
    shGetProgress,
    shDockShip,
    shUndockShip,
    shTradeGoods,
    shHireCrew,
    shDismissCrew,
    shAssignCrew,
    shBuildFacility,
    shUpgradeFacility,
    shSendOnMission,
    shClaimDailySupplyRun,
    shHandleEvent,
    shAdvanceDay,
    shRestCrew,
    shRepairShip,
    shResetState,
    shGetDockedShips,
    shGetCrew,
    shGetInventory,
    shGetFacilities,
    shGetEventLog,
    shGetAchievements,
    shGetPrice,
    shGetAllPrices,
    shGetDailyState,
    shGetQuests,
    shShipCatalog,
    shDockCatalog,
    shGoodCatalog,
    shFacilityCatalog,
    shCrewTypeCatalog,
    shAvailableShips,
  };
}
