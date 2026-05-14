import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

// ─── Seeded PRNG ────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function (): number {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Rarity Constants ───────────────────────────────────────────────────────

export const NB_RARITY_COMMON = 'common';
export const NB_RARITY_UNUSUAL = 'unusual';
export const NB_RARITY_RARE = 'rare';
export const NB_RARITY_EPIC = 'epic';
export const NB_RARITY_LEGENDARY = 'legendary';

export const NB_ALL_RARITIES: string[] = [
  NB_RARITY_COMMON,
  NB_RARITY_UNUSUAL,
  NB_RARITY_RARE,
  NB_RARITY_EPIC,
  NB_RARITY_LEGENDARY,
];

// ─── Starship Constants (35 ships across 5 tiers) ───────────────────────────

export const NB_SHIP_SCOUT_DRONE = 'scout_drone';
export const NB_SHIP_CARGO_SHUTTLE = 'cargo_shuttle';
export const NB_SHIP_MINING_BARGE = 'mining_barge';
export const NB_SHIP_SENTINEL_FRY = 'sentinel_fry';
export const NB_SHIP_REPAIR_SCOOT = 'repair_scoot';
export const NB_SHIP_PULSE_FIGHTER = 'pulse_fighter';
export const NB_SHIP_NEBULA_FRIGATE = 'nebula_frigate';
export const NB_SHIP_PLASMA_CORVETTE = 'plasma_corvette';
export const NB_SHIP_VOID_INTERCEPTOR = 'void_interceptor';
export const NB_SHIP_STORM_CHASER = 'storm_chaser';
export const NB_SHIP_COSMIC_DESTROYER = 'cosmic_destroyer';
export const NB_SHIP_PHOTON_CRUISER = 'photon_cruiser';
export const NB_SHIP_GRAVITON_BATTLESHIP = 'graviton_battleship';
export const NB_SHIP_ION_HAMMER = 'ion_hammer';
export const NB_SHIP_STARFORGE_DREAD = 'starforge_dread';
export const NB_SHIP_ASTRAL_CARRIER = 'astral_carrier';
export const NB_SHIP_DARK_STAR_LEVIATHAN = 'dark_star_leviathan';
export const NB_SHIP_SOLAR_FLARE = 'solar_flare';
export const NB_SHIP_VOID_WALKER = 'void_walker';
export const NB_SHIP_NEXUS_TITAN = 'nexus_titan';
export const NB_SHIP_CHRONO_PHANTOM = 'chrono_phantom';
export const NB_SHIP_CELESTIAL_VANGUARD = 'celestial_vanguard';
export const NB_SHIP_QUANTUM_ARBITER = 'quantum_arbiter';
export const NB_SHIP_WORMHOLE_WARDEN = 'wormhole_warden';
export const NB_SHIP_HYPERNOVA_FORGE = 'hypernova_forge';
export const NB_SHIP_INFINITY_VESSEL = 'infinity_vessel';
export const NB_SHIP_OMEGA_PRIME = 'omega_prime';
export const NB_SHIP_STELLAR_SOVEREIGN = 'stellar_sovereign';
export const NB_SHIP_COSMIC_EMPEROR = 'cosmic_emperor';
export const NB_SHIP_ETERNAL_WATCHER = 'eternal_watcher';
export const NB_SHIP_DIMENSION_FOLD = 'dimension_fold';
export const NB_SHIP_ANTIMATTER_APEX = 'antimatter_apex';
export const NB_SHIP_SINGULARITY_HEART = 'singularity_heart';
export const NB_SHIP_STARLIGHT_ASCENDANT = 'starlight_ascendant';

export const NB_ALL_SHIPS: string[] = [
  NB_SHIP_SCOUT_DRONE,
  NB_SHIP_CARGO_SHUTTLE,
  NB_SHIP_MINING_BARGE,
  NB_SHIP_SENTINEL_FRY,
  NB_SHIP_REPAIR_SCOOT,
  NB_SHIP_PULSE_FIGHTER,
  NB_SHIP_NEBULA_FRIGATE,
  NB_SHIP_PLASMA_CORVETTE,
  NB_SHIP_VOID_INTERCEPTOR,
  NB_SHIP_STORM_CHASER,
  NB_SHIP_COSMIC_DESTROYER,
  NB_SHIP_PHOTON_CRUISER,
  NB_SHIP_GRAVITON_BATTLESHIP,
  NB_SHIP_ION_HAMMER,
  NB_SHIP_STARFORGE_DREAD,
  NB_SHIP_ASTRAL_CARRIER,
  NB_SHIP_DARK_STAR_LEVIATHAN,
  NB_SHIP_SOLAR_FLARE,
  NB_SHIP_VOID_WALKER,
  NB_SHIP_NEXUS_TITAN,
  NB_SHIP_CHRONO_PHANTOM,
  NB_SHIP_CELESTIAL_VANGUARD,
  NB_SHIP_QUANTUM_ARBITER,
  NB_SHIP_WORMHOLE_WARDEN,
  NB_SHIP_HYPERNOVA_FORGE,
  NB_SHIP_INFINITY_VESSEL,
  NB_SHIP_OMEGA_PRIME,
  NB_SHIP_STELLAR_SOVEREIGN,
  NB_SHIP_COSMIC_EMPEROR,
  NB_SHIP_ETERNAL_WATCHER,
  NB_SHIP_DIMENSION_FOLD,
  NB_SHIP_ANTIMATTER_APEX,
  NB_SHIP_SINGULARITY_HEART,
  NB_SHIP_STARLIGHT_ASCENDANT,
];

export const NB_SHIP_DATA: Record<string, {
  name: string;
  shipType: string;
  rarity: string;
  firepower: number;
  speed: number;
  description: string;
  cost: Record<string, number>;
}> = {
  [NB_SHIP_SCOUT_DRONE]: {
    name: 'Scout Drone',
    shipType: 'scout',
    rarity: NB_RARITY_COMMON,
    firepower: 5,
    speed: 8,
    description: 'A lightweight drone for rapid reconnaissance missions.',
    cost: { stellarOre: 30, cosmicDust: 15 },
  },
  [NB_SHIP_CARGO_SHUTTLE]: {
    name: 'Cargo Shuttle',
    shipType: 'transport',
    rarity: NB_RARITY_COMMON,
    firepower: 3,
    speed: 4,
    description: 'Reliable transport for moving resources between sectors.',
    cost: { stellarOre: 40, cosmicDust: 20 },
  },
  [NB_SHIP_MINING_BARGE]: {
    name: 'Mining Barge',
    shipType: 'miner',
    rarity: NB_RARITY_COMMON,
    firepower: 2,
    speed: 2,
    description: 'Slow but effective at extracting minerals from asteroids.',
    cost: { stellarOre: 50, cosmicDust: 10 },
  },
  [NB_SHIP_SENTINEL_FRY]: {
    name: 'Sentinel Fry',
    shipType: 'fighter',
    rarity: NB_RARITY_COMMON,
    firepower: 10,
    speed: 7,
    description: 'Entry-level fighter with basic pulse cannons.',
    cost: { stellarOre: 35, cosmicDust: 25 },
  },
  [NB_SHIP_REPAIR_SCOOT]: {
    name: 'Repair Scoot',
    shipType: 'support',
    rarity: NB_RARITY_COMMON,
    firepower: 1,
    speed: 6,
    description: 'A mobile repair station for field maintenance.',
    cost: { stellarOre: 30, cosmicDust: 20 },
  },
  [NB_SHIP_PULSE_FIGHTER]: {
    name: 'Pulse Fighter',
    shipType: 'fighter',
    rarity: NB_RARITY_UNUSUAL,
    firepower: 18,
    speed: 9,
    description: 'Twin-linked pulse cannons make this a versatile dogfighter.',
    cost: { stellarOre: 80, plasmaCore: 30 },
  },
  [NB_SHIP_NEBULA_FRIGATE]: {
    name: 'Nebula Frigate',
    shipType: 'frigate',
    rarity: NB_RARITY_UNUSUAL,
    firepower: 22,
    speed: 6,
    description: 'Cloaked in nebula haze, this frigate excels at ambush tactics.',
    cost: { stellarOre: 100, plasmaCore: 40 },
  },
  [NB_SHIP_PLASMA_CORVETTE]: {
    name: 'Plasma Corvette',
    shipType: 'corvette',
    rarity: NB_RARITY_UNUSUAL,
    firepower: 20,
    speed: 7,
    description: 'Fast strike vessel armed with plasma torpedo launchers.',
    cost: { stellarOre: 90, plasmaCore: 35 },
  },
  [NB_SHIP_VOID_INTERCEPTOR]: {
    name: 'Void Interceptor',
    shipType: 'fighter',
    rarity: NB_RARITY_UNUSUAL,
    firepower: 16,
    speed: 10,
    description: 'The fastest interceptor in the bastion fleet roster.',
    cost: { stellarOre: 70, plasmaCore: 45 },
  },
  [NB_SHIP_STORM_CHASER]: {
    name: 'Storm Chaser',
    shipType: 'explorer',
    rarity: NB_RARITY_UNUSUAL,
    firepower: 8,
    speed: 8,
    description: 'Designed to navigate ion storms and discover hidden anomalies.',
    cost: { stellarOre: 60, plasmaCore: 30, nebulaEssence: 10 },
  },
  [NB_SHIP_COSMIC_DESTROYER]: {
    name: 'Cosmic Destroyer',
    shipType: 'destroyer',
    rarity: NB_RARITY_RARE,
    firepower: 40,
    speed: 5,
    description: 'Heavy warship capable of devastating orbital bombardments.',
    cost: { stellarOre: 200, plasmaCore: 80, nebulaEssence: 30 },
  },
  [NB_SHIP_PHOTON_CRUISER]: {
    name: 'Photon Cruiser',
    shipType: 'cruiser',
    rarity: NB_RARITY_RARE,
    firepower: 35,
    speed: 6,
    description: 'Equipped with photon lance arrays for precise long-range strikes.',
    cost: { stellarOre: 180, plasmaCore: 70, nebulaEssence: 25 },
  },
  [NB_SHIP_GRAVITON_BATTLESHIP]: {
    name: 'Graviton Battleship',
    shipType: 'battleship',
    rarity: NB_RARITY_RARE,
    firepower: 50,
    speed: 3,
    description: 'Generates localized gravity wells to crush enemy formations.',
    cost: { stellarOre: 250, plasmaCore: 100, nebulaEssence: 50 },
  },
  [NB_SHIP_ION_HAMMER]: {
    name: 'Ion Hammer',
    shipType: 'destroyer',
    rarity: NB_RARITY_RARE,
    firepower: 38,
    speed: 4,
    description: 'Massive ion cannons overload enemy shields in seconds.',
    cost: { stellarOre: 220, plasmaCore: 90, nebulaEssence: 35 },
  },
  [NB_SHIP_STARFORGE_DREAD]: {
    name: 'Starforge Dread',
    shipType: 'dreadnought',
    rarity: NB_RARITY_RARE,
    firepower: 55,
    speed: 2,
    description: 'A slow juggernaut that forges its own ammunition from stellar debris.',
    cost: { stellarOre: 300, plasmaCore: 120, nebulaEssence: 60 },
  },
  [NB_SHIP_ASTRAL_CARRIER]: {
    name: 'Astral Carrier',
    shipType: 'carrier',
    rarity: NB_RARITY_EPIC,
    firepower: 30,
    speed: 3,
    description: 'Deploys squadrons of autonomous drone fighters mid-combat.',
    cost: { stellarOre: 500, plasmaCore: 200, nebulaEssence: 100, darkMatter: 20 },
  },
  [NB_SHIP_DARK_STAR_LEVIATHAN]: {
    name: 'Dark Star Leviathan',
    shipType: 'dreadnought',
    rarity: NB_RARITY_EPIC,
    firepower: 80,
    speed: 2,
    description: 'Powered by a contained dark star, this ship warps spacetime around it.',
    cost: { stellarOre: 600, plasmaCore: 250, nebulaEssence: 120, darkMatter: 30 },
  },
  [NB_SHIP_SOLAR_FLARE]: {
    name: 'Solar Flare',
    shipType: 'destroyer',
    rarity: NB_RARITY_EPIC,
    firepower: 65,
    speed: 5,
    description: 'Channels concentrated solar energy into devastating beam weapons.',
    cost: { stellarOre: 450, plasmaCore: 180, nebulaEssence: 90, darkMatter: 25 },
  },
  [NB_SHIP_VOID_WALKER]: {
    name: 'Void Walker',
    shipType: 'stealth',
    rarity: NB_RARITY_EPIC,
    firepower: 45,
    speed: 7,
    description: 'Can phase through dimensions, becoming temporarily invulnerable.',
    cost: { stellarOre: 400, plasmaCore: 150, nebulaEssence: 80, darkMatter: 35 },
  },
  [NB_SHIP_NEXUS_TITAN]: {
    name: 'Nexus Titan',
    shipType: 'battleship',
    rarity: NB_RARITY_EPIC,
    firepower: 70,
    speed: 3,
    description: 'Connects to the bastion nexus network for real-time tactical data.',
    cost: { stellarOre: 550, plasmaCore: 220, nebulaEssence: 110, darkMatter: 28 },
  },
  [NB_SHIP_CHRONO_PHANTOM]: {
    name: 'Chrono Phantom',
    shipType: 'stealth',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 60,
    speed: 9,
    description: 'Can briefly rewind time in combat to undo critical damage.',
    cost: { stellarOre: 1000, plasmaCore: 500, nebulaEssence: 200, darkMatter: 80, starlightShard: 10 },
  },
  [NB_SHIP_CELESTIAL_VANGUARD]: {
    name: 'Celestial Vanguard',
    shipType: 'dreadnought',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 100,
    speed: 4,
    description: 'Lead ship of the Celestial Fleet, forged from a dying star core.',
    cost: { stellarOre: 1200, plasmaCore: 600, nebulaEssence: 250, darkMatter: 100, starlightShard: 15 },
  },
  [NB_SHIP_QUANTUM_ARBITER]: {
    name: 'Quantum Arbiter',
    shipType: 'flagship',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 90,
    speed: 5,
    description: 'Judges all enemies with quantum-entangled particle lances.',
    cost: { stellarOre: 1100, plasmaCore: 550, nebulaEssence: 220, darkMatter: 90, starlightShard: 12 },
  },
  [NB_SHIP_WORMHOLE_WARDEN]: {
    name: 'Wormhole Warden',
    shipType: 'carrier',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 55,
    speed: 6,
    description: 'Opens stable wormholes to deploy reinforcements anywhere in the sector.',
    cost: { stellarOre: 900, plasmaCore: 450, nebulaEssence: 200, darkMatter: 120, starlightShard: 8 },
  },
  [NB_SHIP_HYPERNOVA_FORGE]: {
    name: 'Hypernova Forge',
    shipType: 'dreadnought',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 120,
    speed: 2,
    description: 'Generates hypernova-scale explosions on command. Devastates entire fleets.',
    cost: { stellarOre: 1500, plasmaCore: 700, nebulaEssence: 300, darkMatter: 150, starlightShard: 20 },
  },
  [NB_SHIP_INFINITY_VESSEL]: {
    name: 'Infinity Vessel',
    shipType: 'flagship',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 110,
    speed: 4,
    description: 'Its power core draws from an infinite energy dimension.',
    cost: { stellarOre: 1300, plasmaCore: 650, nebulaEssence: 280, darkMatter: 130, starlightShard: 18 },
  },
  [NB_SHIP_OMEGA_PRIME]: {
    name: 'Omega Prime',
    shipType: 'flagship',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 130,
    speed: 5,
    description: 'The ultimate evolution of the Omega weapons platform.',
    cost: { stellarOre: 1800, plasmaCore: 800, nebulaEssence: 350, darkMatter: 180, starlightShard: 25 },
  },
  [NB_SHIP_STELLAR_SOVEREIGN]: {
    name: 'Stellar Sovereign',
    shipType: 'flagship',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 95,
    speed: 6,
    description: 'Commands all nearby ships, granting fleet-wide combat bonuses.',
    cost: { stellarOre: 1400, plasmaCore: 600, nebulaEssence: 260, darkMatter: 140, starlightShard: 22 },
  },
  [NB_SHIP_COSMIC_EMPEROR]: {
    name: 'Cosmic Emperor',
    shipType: 'dreadnought',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 140,
    speed: 3,
    description: 'A god-ship that dominates the battlefield through sheer overwhelming force.',
    cost: { stellarOre: 2000, plasmaCore: 900, nebulaEssence: 400, darkMatter: 200, starlightShard: 30 },
  },
  [NB_SHIP_ETERNAL_WATCHER]: {
    name: 'Eternal Watcher',
    shipType: 'support',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 40,
    speed: 7,
    description: 'Projects an eternal shield over the entire fleet, making them nearly invincible.',
    cost: { stellarOre: 800, plasmaCore: 400, nebulaEssence: 180, darkMatter: 160, starlightShard: 16 },
  },
  [NB_SHIP_DIMENSION_FOLD]: {
    name: 'Dimension Fold',
    shipType: 'stealth',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 75,
    speed: 10,
    description: 'Exists partially in another dimension. Almost impossible to hit.',
    cost: { stellarOre: 1100, plasmaCore: 500, nebulaEssence: 240, darkMatter: 170, starlightShard: 14 },
  },
  [NB_SHIP_ANTIMATTER_APEX]: {
    name: 'Antimatter Apex',
    shipType: 'destroyer',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 150,
    speed: 4,
    description: 'Wields antimatter warheads capable of obliterating battle stations.',
    cost: { stellarOre: 2200, plasmaCore: 1000, nebulaEssence: 450, darkMatter: 220, starlightShard: 35 },
  },
  [NB_SHIP_SINGULARITY_HEART]: {
    name: 'Singularity Heart',
    shipType: 'flagship',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 160,
    speed: 3,
    description: 'Contains a miniature singularity. The most powerful ship ever constructed.',
    cost: { stellarOre: 2500, plasmaCore: 1200, nebulaEssence: 500, darkMatter: 250, starlightShard: 40 },
  },
  [NB_SHIP_STARLIGHT_ASCENDANT]: {
    name: 'Starlight Ascendant',
    shipType: 'flagship',
    rarity: NB_RARITY_LEGENDARY,
    firepower: 200,
    speed: 8,
    description: 'Transcends mortal engineering. A vessel of pure crystallized starlight.',
    cost: { stellarOre: 3000, plasmaCore: 1500, nebulaEssence: 600, darkMatter: 300, starlightShard: 50 },
  },
};

// ─── Bastion Sectors (8) ────────────────────────────────────────────────────

export const NB_SECTOR_COMMAND_BRIDGE = 'command_bridge';
export const NB_SECTOR_ENGINE_CORE = 'engine_core';
export const NB_SECTOR_SHIELD_ARRAY = 'shield_array';
export const NB_SECTOR_WEAPON_BAY = 'weapon_bay';
export const NB_SECTOR_HANGAR_DECK = 'hangar_deck';
export const NB_SECTOR_RESEARCH_LAB = 'research_lab';
export const NB_SECTOR_NEBULA_HARVESTER = 'nebula_harvester';
export const NB_SECTOR_LIFE_SUPPORT = 'life_support';

export const NB_ALL_SECTORS: string[] = [
  NB_SECTOR_COMMAND_BRIDGE,
  NB_SECTOR_ENGINE_CORE,
  NB_SECTOR_SHIELD_ARRAY,
  NB_SECTOR_WEAPON_BAY,
  NB_SECTOR_HANGAR_DECK,
  NB_SECTOR_RESEARCH_LAB,
  NB_SECTOR_NEBULA_HARVESTER,
  NB_SECTOR_LIFE_SUPPORT,
];

export const NB_SECTOR_COST: Record<string, Record<string, number>> = {
  [NB_SECTOR_COMMAND_BRIDGE]: { stellarOre: 150, plasmaCore: 60 },
  [NB_SECTOR_ENGINE_CORE]: { stellarOre: 120, plasmaCore: 80, cosmicDust: 30 },
  [NB_SECTOR_SHIELD_ARRAY]: { stellarOre: 200, plasmaCore: 100, nebulaEssence: 20 },
  [NB_SECTOR_WEAPON_BAY]: { stellarOre: 180, plasmaCore: 70, cosmicDust: 40 },
  [NB_SECTOR_HANGAR_DECK]: { stellarOre: 250, plasmaCore: 90, cosmicDust: 50 },
  [NB_SECTOR_RESEARCH_LAB]: { stellarOre: 160, plasmaCore: 110, nebulaEssence: 40 },
  [NB_SECTOR_NEBULA_HARVESTER]: { stellarOre: 130, cosmicDust: 80, nebulaEssence: 50 },
  [NB_SECTOR_LIFE_SUPPORT]: { stellarOre: 100, cosmicDust: 60, plasmaCore: 30 },
};

export const NB_SECTOR_DISPLAY: Record<string, string> = {
  [NB_SECTOR_COMMAND_BRIDGE]: 'Command Bridge',
  [NB_SECTOR_ENGINE_CORE]: 'Engine Core',
  [NB_SECTOR_SHIELD_ARRAY]: 'Shield Array',
  [NB_SECTOR_WEAPON_BAY]: 'Weapon Bay',
  [NB_SECTOR_HANGAR_DECK]: 'Hangar Deck',
  [NB_SECTOR_RESEARCH_LAB]: 'Research Lab',
  [NB_SECTOR_NEBULA_HARVESTER]: 'Nebula Harvester',
  [NB_SECTOR_LIFE_SUPPORT]: 'Life Support',
};

// ─── Nebula Resources (30) ──────────────────────────────────────────────────

export const NB_RES_STELLAR_ORE = 'stellarOre';
export const NB_RES_COSMIC_DUST = 'cosmicDust';
export const NB_RES_PLASMA_CORE = 'plasmaCore';
export const NB_RES_NEBULA_ESSENCE = 'nebulaEssence';
export const NB_RES_DARK_MATTER = 'darkMatter';
export const NB_RES_STARLIGHT_SHARD = 'starlightShard';
export const NB_RES_ION_CRYSTAL = 'ionCrystal';
export const NB_RES_QUANTUM_FILAMENT = 'quantumFilament';
export const NB_RES_ANTIMATTER_CELL = 'antimatterCell';
export const NB_RES_GRAVITON_NODE = 'gravitonNode';
export const NB_RES_PHOTON_ENERGY = 'photonEnergy';
export const NB_RES_VOID_SILK = 'voidSilk';
export const NB_RES_PLASMA_GEL = 'plasmaGel';
export const NB_RES_STAR_IRON = 'starIron';
export const NB_RES_COSMIC_PEARL = 'cosmicPearl';
export const NB_RES_SOLAR_GLASS = 'solarGlass';
export const NB_RES_NEUTRON_DEW = 'neutronDew';
export const NB_RES_WARP_COIL = 'warpCoil';
export const NB_RES_SINGULARITY_SALT = 'singularitySalt';
export const NB_RES_CHRONO_SPARK = 'chronoSpark';
export const NB_RES_STARDUST_ALLOY = 'stardustAlloy';
export const NB_RES_VOID_METAL = 'voidMetal';
export const NB_RES_NEBULA_NECTAR = 'nebulaNectar';
export const NB_RES_ASTEROID_PLATINUM = 'asteroidPlatinum';
export const NB_RES_BIOLUM_ESSENCE = 'biolumEssence';
export const NB_RES_HELIUM_FUSION = 'heliumFusion';
export const NB_RES_DEEP_CRYSTAL = 'deepCrystal';
export const NB_RES_COMET_TAIL = 'cometTail';
export const NB_RES_PULSAR_SHARD = 'pulsarShard';
export const NB_RES_GALAXY_CORE_FRAGMENT = 'galaxyCoreFragment';

export const NB_ALL_RESOURCES: string[] = [
  NB_RES_STELLAR_ORE,
  NB_RES_COSMIC_DUST,
  NB_RES_PLASMA_CORE,
  NB_RES_NEBULA_ESSENCE,
  NB_RES_DARK_MATTER,
  NB_RES_STARLIGHT_SHARD,
  NB_RES_ION_CRYSTAL,
  NB_RES_QUANTUM_FILAMENT,
  NB_RES_ANTIMATTER_CELL,
  NB_RES_GRAVITON_NODE,
  NB_RES_PHOTON_ENERGY,
  NB_RES_VOID_SILK,
  NB_RES_PLASMA_GEL,
  NB_RES_STAR_IRON,
  NB_RES_COSMIC_PEARL,
  NB_RES_SOLAR_GLASS,
  NB_RES_NEUTRON_DEW,
  NB_RES_WARP_COIL,
  NB_RES_SINGULARITY_SALT,
  NB_RES_CHRONO_SPARK,
  NB_RES_STARDUST_ALLOY,
  NB_RES_VOID_METAL,
  NB_RES_NEBULA_NECTAR,
  NB_RES_ASTEROID_PLATINUM,
  NB_RES_BIOLUM_ESSENCE,
  NB_RES_HELIUM_FUSION,
  NB_RES_DEEP_CRYSTAL,
  NB_RES_COMET_TAIL,
  NB_RES_PULSAR_SHARD,
  NB_RES_GALAXY_CORE_FRAGMENT,
];

// ─── Tech Constants (30) ────────────────────────────────────────────────────

export const NB_TECH_BASIC_SHIELDS = 'basic_shields';
export const NB_TECH_PLASMA_WEAPONS = 'plasma_weapons';
export const NB_TECH_NEBULA_MINING = 'nebula_mining';
export const NB_TECH_FTL_BOOSTERS = 'ftl_boosters';
export const NB_TECH_AUTOREPAIR = 'autorepair';
export const NB_TECH_SHIP_ARMOR = 'ship_armor';
export const NB_TECH_DOCK_EXPANSION = 'dock_expansion';
export const NB_TECH_RESOURCE_SCANNER = 'resource_scanner';
export const NB_TECH_REINFORCED_HULL = 'reinforced_hull';
export const NB_TECH_GRAVITY_WELL = 'gravity_well';
export const NB_TECH_DARK_COLLECTOR = 'dark_collector';
export const NB_TECH_STARLIGHT_FORGE = 'starlight_forge';
export const NB_TECH_WARP_DRIVE = 'warp_drive';
export const NB_TECH_NANO_SHIELDS = 'nano_shields';
export const NB_TECH_PULSE_CANNON = 'pulse_cannon';
export const NB_TECH_ASTEROID_DEFENSE = 'asteroid_defense';
export const NB_TECH_PHOTON_ARTILLERY = 'photon_artillery';
export const NB_TECH_QUANTUM_COMMS = 'quantum_comms';
export const NB_TECH_VOID_ENGINE = 'void_engine';
export const NB_TECH_SINGULARITY_CORE = 'singularity_core';
export const NB_TECH_CHRONO_FIELD = 'chrono_field';
export const NB_TECH_DARK_MATTER_REACTOR = 'dark_matter_reactor';
export const NB_TECH_OMEGA_BEAM = 'omega_beam';
export const NB_TECH_NEUTRON_FORGE = 'neutron_forge';
export const NB_TECH_DIMENSIONAL_RIFT = 'dimensional_rift';
export const NB_TECH_ASCENDANT_SHIELD = 'ascendant_shield';
export const NB_TECH_COSMIC_HARVESTER = 'cosmic_harvester';
export const NB_TECH_INFINITE_ENERGY = 'infinite_energy';
export const NB_TECH_TIME_DILATION = 'time_dilation';
export const NB_TECH_FINAL_PROTOCOL = 'final_protocol';

export const NB_ALL_TECHS: string[] = [
  NB_TECH_BASIC_SHIELDS,
  NB_TECH_PLASMA_WEAPONS,
  NB_TECH_NEBULA_MINING,
  NB_TECH_FTL_BOOSTERS,
  NB_TECH_AUTOREPAIR,
  NB_TECH_SHIP_ARMOR,
  NB_TECH_DOCK_EXPANSION,
  NB_TECH_RESOURCE_SCANNER,
  NB_TECH_REINFORCED_HULL,
  NB_TECH_GRAVITY_WELL,
  NB_TECH_DARK_COLLECTOR,
  NB_TECH_STARLIGHT_FORGE,
  NB_TECH_WARP_DRIVE,
  NB_TECH_NANO_SHIELDS,
  NB_TECH_PULSE_CANNON,
  NB_TECH_ASTEROID_DEFENSE,
  NB_TECH_PHOTON_ARTILLERY,
  NB_TECH_QUANTUM_COMMS,
  NB_TECH_VOID_ENGINE,
  NB_TECH_SINGULARITY_CORE,
  NB_TECH_CHRONO_FIELD,
  NB_TECH_DARK_MATTER_REACTOR,
  NB_TECH_OMEGA_BEAM,
  NB_TECH_NEUTRON_FORGE,
  NB_TECH_DIMENSIONAL_RIFT,
  NB_TECH_ASCENDANT_SHIELD,
  NB_TECH_COSMIC_HARVESTER,
  NB_TECH_INFINITE_ENERGY,
  NB_TECH_TIME_DILATION,
  NB_TECH_FINAL_PROTOCOL,
];

export const NB_TECH_RARITY: Record<string, string> = {
  [NB_TECH_BASIC_SHIELDS]: NB_RARITY_COMMON,
  [NB_TECH_PLASMA_WEAPONS]: NB_RARITY_COMMON,
  [NB_TECH_NEBULA_MINING]: NB_RARITY_COMMON,
  [NB_TECH_FTL_BOOSTERS]: NB_RARITY_COMMON,
  [NB_TECH_AUTOREPAIR]: NB_RARITY_COMMON,
  [NB_TECH_SHIP_ARMOR]: NB_RARITY_COMMON,
  [NB_TECH_DOCK_EXPANSION]: NB_RARITY_COMMON,
  [NB_TECH_RESOURCE_SCANNER]: NB_RARITY_COMMON,
  [NB_TECH_REINFORCED_HULL]: NB_RARITY_UNUSUAL,
  [NB_TECH_GRAVITY_WELL]: NB_RARITY_UNUSUAL,
  [NB_TECH_DARK_COLLECTOR]: NB_RARITY_UNUSUAL,
  [NB_TECH_STARLIGHT_FORGE]: NB_RARITY_UNUSUAL,
  [NB_TECH_WARP_DRIVE]: NB_RARITY_UNUSUAL,
  [NB_TECH_NANO_SHIELDS]: NB_RARITY_UNUSUAL,
  [NB_TECH_PULSE_CANNON]: NB_RARITY_UNUSUAL,
  [NB_TECH_ASTEROID_DEFENSE]: NB_RARITY_RARE,
  [NB_TECH_PHOTON_ARTILLERY]: NB_RARITY_RARE,
  [NB_TECH_QUANTUM_COMMS]: NB_RARITY_RARE,
  [NB_TECH_VOID_ENGINE]: NB_RARITY_RARE,
  [NB_TECH_SINGULARITY_CORE]: NB_RARITY_RARE,
  [NB_TECH_CHRONO_FIELD]: NB_RARITY_RARE,
  [NB_TECH_DARK_MATTER_REACTOR]: NB_RARITY_EPIC,
  [NB_TECH_OMEGA_BEAM]: NB_RARITY_EPIC,
  [NB_TECH_NEUTRON_FORGE]: NB_RARITY_EPIC,
  [NB_TECH_DIMENSIONAL_RIFT]: NB_RARITY_EPIC,
  [NB_TECH_ASCENDANT_SHIELD]: NB_RARITY_EPIC,
  [NB_TECH_COSMIC_HARVESTER]: NB_RARITY_EPIC,
  [NB_TECH_INFINITE_ENERGY]: NB_RARITY_LEGENDARY,
  [NB_TECH_TIME_DILATION]: NB_RARITY_LEGENDARY,
  [NB_TECH_FINAL_PROTOCOL]: NB_RARITY_LEGENDARY,
};

export const NB_TECH_COST: Record<string, Record<string, number>> = {
  [NB_TECH_BASIC_SHIELDS]: { stellarOre: 40, cosmicDust: 20 },
  [NB_TECH_PLASMA_WEAPONS]: { stellarOre: 35, plasmaCore: 15 },
  [NB_TECH_NEBULA_MINING]: { stellarOre: 30, cosmicDust: 25 },
  [NB_TECH_FTL_BOOSTERS]: { stellarOre: 50, plasmaCore: 20 },
  [NB_TECH_AUTOREPAIR]: { stellarOre: 45, cosmicDust: 15, plasmaCore: 10 },
  [NB_TECH_SHIP_ARMOR]: { stellarOre: 60, cosmicDust: 20 },
  [NB_TECH_DOCK_EXPANSION]: { stellarOre: 55, plasmaCore: 15 },
  [NB_TECH_RESOURCE_SCANNER]: { stellarOre: 25, nebulaEssence: 15 },
  [NB_TECH_REINFORCED_HULL]: { stellarOre: 80, plasmaCore: 30, cosmicDust: 20 },
  [NB_TECH_GRAVITY_WELL]: { stellarOre: 100, plasmaCore: 50, nebulaEssence: 10 },
  [NB_TECH_DARK_COLLECTOR]: { stellarOre: 70, nebulaEssence: 40, darkMatter: 5 },
  [NB_TECH_STARLIGHT_FORGE]: { stellarOre: 90, nebulaEssence: 30, starlightShard: 3 },
  [NB_TECH_WARP_DRIVE]: { plasmaCore: 80, nebulaEssence: 50, stellarOre: 40 },
  [NB_TECH_NANO_SHIELDS]: { stellarOre: 100, plasmaCore: 60, nebulaEssence: 20 },
  [NB_TECH_PULSE_CANNON]: { plasmaCore: 70, stellarOre: 60, cosmicDust: 30 },
  [NB_TECH_ASTEROID_DEFENSE]: { stellarOre: 150, plasmaCore: 80, nebulaEssence: 40 },
  [NB_TECH_PHOTON_ARTILLERY]: { plasmaCore: 130, nebulaEssence: 50, stellarOre: 60 },
  [NB_TECH_QUANTUM_COMMS]: { stellarOre: 120, nebulaEssence: 70, darkMatter: 10 },
  [NB_TECH_VOID_ENGINE]: { plasmaCore: 150, nebulaEssence: 80, darkMatter: 15 },
  [NB_TECH_SINGULARITY_CORE]: { stellarOre: 200, nebulaEssence: 100, darkMatter: 20 },
  [NB_TECH_CHRONO_FIELD]: { nebulaEssence: 120, darkMatter: 30, starlightShard: 8 },
  [NB_TECH_DARK_MATTER_REACTOR]: { darkMatter: 50, stellarOre: 200, plasmaCore: 150 },
  [NB_TECH_OMEGA_BEAM]: { plasmaCore: 200, nebulaEssence: 100, darkMatter: 40 },
  [NB_TECH_NEUTRON_FORGE]: { stellarOre: 250, nebulaEssence: 120, darkMatter: 35 },
  [NB_TECH_DIMENSIONAL_RIFT]: { nebulaEssence: 150, darkMatter: 60, starlightShard: 15 },
  [NB_TECH_ASCENDANT_SHIELD]: { darkMatter: 80, starlightShard: 20, nebulaEssence: 100 },
  [NB_TECH_COSMIC_HARVESTER]: { nebulaEssence: 200, stellarOre: 150, darkMatter: 50 },
  [NB_TECH_INFINITE_ENERGY]: { darkMatter: 150, starlightShard: 40, nebulaEssence: 200 },
  [NB_TECH_TIME_DILATION]: { darkMatter: 120, starlightShard: 30, nebulaEssence: 180 },
  [NB_TECH_FINAL_PROTOCOL]: { darkMatter: 200, starlightShard: 60, nebulaEssence: 300 },
};

// ─── Bastion Structures (25) ────────────────────────────────────────────────

export const NB_STRUCT_COMMAND_TOWER = 'command_tower';
export const NB_STRUCT_REACTOR_HUB = 'reactor_hub';
export const NB_STRUCT_SHIELD_GENERATOR = 'shield_generator';
export const NB_STRUCT_TURRET_ARRAY = 'turret_array';
export const NB_STRUCT_DRYDOCK = 'drydock';
export const NB_STRUCT_RESEARCH_STATION = 'research_station';
export const NB_STRUCT_HARVESTER_BAY = 'harvester_bay';
export const NB_STRUCT_O2_GARDEN = 'o2_garden';
export const NB_STRUCT_COMM_RELAY = 'comm_relay';
export const NB_STRUCT_AMMO_DEPOT = 'ammo_depot';
export const NB_STRUCT_FUSION_PLANT = 'fusion_plant';
export const NB_STRUCT_CARGO_HOLD = 'cargo_hold';
export const NB_STRUCT_MED_BAY = 'med_bay';
export const NB_STRUCT_TRAINING_HALL = 'training_hall';
export const NB_STRUCT_OBSERVATORY = 'observatory';
export const NB_STRUCT_HEAVY_SHIELD = 'heavy_shield';
export const NB_STRUCT_MISSILE_SILO = 'missile_silo';
export const NB_STRUCT_WARP_GATE = 'warp_gate';
export const NB_STRUCT_DARK_FORGE = 'dark_forge';
export const NB_STRUCT_STARLIGHT_BEACON = 'starlight_beacon';
export const NB_STRUCT_GRAVITY_ANCHOR = 'gravity_anchor';
export const NB_STRUCT_CHRONO_VAULT = 'chrono_vault';
export const NB_STRUCT_VOID_GATE = 'void_gate';
export const NB_STRUCT_COSMIC_CRUCIBLE = 'cosmic_crucible';
export const NB_STRUCT_ASCENDANT_SPIRE = 'ascendant_spire';

export const NB_ALL_STRUCTURES: string[] = [
  NB_STRUCT_COMMAND_TOWER,
  NB_STRUCT_REACTOR_HUB,
  NB_STRUCT_SHIELD_GENERATOR,
  NB_STRUCT_TURRET_ARRAY,
  NB_STRUCT_DRYDOCK,
  NB_STRUCT_RESEARCH_STATION,
  NB_STRUCT_HARVESTER_BAY,
  NB_STRUCT_O2_GARDEN,
  NB_STRUCT_COMM_RELAY,
  NB_STRUCT_AMMO_DEPOT,
  NB_STRUCT_FUSION_PLANT,
  NB_STRUCT_CARGO_HOLD,
  NB_STRUCT_MED_BAY,
  NB_STRUCT_TRAINING_HALL,
  NB_STRUCT_OBSERVATORY,
  NB_STRUCT_HEAVY_SHIELD,
  NB_STRUCT_MISSILE_SILO,
  NB_STRUCT_WARP_GATE,
  NB_STRUCT_DARK_FORGE,
  NB_STRUCT_STARLIGHT_BEACON,
  NB_STRUCT_GRAVITY_ANCHOR,
  NB_STRUCT_CHRONO_VAULT,
  NB_STRUCT_VOID_GATE,
  NB_STRUCT_COSMIC_CRUCIBLE,
  NB_STRUCT_ASCENDANT_SPIRE,
];

export const NB_STRUCT_COST: Record<string, Record<string, number>> = {
  [NB_STRUCT_COMMAND_TOWER]: { stellarOre: 80, plasmaCore: 30 },
  [NB_STRUCT_REACTOR_HUB]: { stellarOre: 100, plasmaCore: 50, cosmicDust: 20 },
  [NB_STRUCT_SHIELD_GENERATOR]: { stellarOre: 120, plasmaCore: 60, nebulaEssence: 10 },
  [NB_STRUCT_TURRET_ARRAY]: { stellarOre: 90, plasmaCore: 40 },
  [NB_STRUCT_DRYDOCK]: { stellarOre: 150, plasmaCore: 60, cosmicDust: 30 },
  [NB_STRUCT_RESEARCH_STATION]: { stellarOre: 110, plasmaCore: 70, nebulaEssence: 20 },
  [NB_STRUCT_HARVESTER_BAY]: { stellarOre: 80, cosmicDust: 50, nebulaEssence: 30 },
  [NB_STRUCT_O2_GARDEN]: { stellarOre: 60, cosmicDust: 40, plasmaCore: 15 },
  [NB_STRUCT_COMM_RELAY]: { stellarOre: 70, plasmaCore: 35, cosmicDust: 20 },
  [NB_STRUCT_AMMO_DEPOT]: { stellarOre: 85, plasmaCore: 25, cosmicDust: 15 },
  [NB_STRUCT_FUSION_PLANT]: { stellarOre: 130, plasmaCore: 80, nebulaEssence: 15 },
  [NB_STRUCT_CARGO_HOLD]: { stellarOre: 100, cosmicDust: 40 },
  [NB_STRUCT_MED_BAY]: { stellarOre: 75, plasmaCore: 30, cosmicDust: 25 },
  [NB_STRUCT_TRAINING_HALL]: { stellarOre: 90, plasmaCore: 35, cosmicDust: 20 },
  [NB_STRUCT_OBSERVATORY]: { stellarOre: 110, nebulaEssence: 25, cosmicDust: 15 },
  [NB_STRUCT_HEAVY_SHIELD]: { stellarOre: 200, plasmaCore: 100, nebulaEssence: 40 },
  [NB_STRUCT_MISSILE_SILO]: { stellarOre: 180, plasmaCore: 90, cosmicDust: 40 },
  [NB_STRUCT_WARP_GATE]: { stellarOre: 250, plasmaCore: 120, nebulaEssence: 60, darkMatter: 10 },
  [NB_STRUCT_DARK_FORGE]: { stellarOre: 300, nebulaEssence: 80, darkMatter: 20 },
  [NB_STRUCT_STARLIGHT_BEACON]: { nebulaEssence: 100, starlightShard: 15, stellarOre: 150 },
  [NB_STRUCT_GRAVITY_ANCHOR]: { stellarOre: 200, darkMatter: 30, plasmaCore: 100 },
  [NB_STRUCT_CHRONO_VAULT]: { darkMatter: 50, nebulaEssence: 80, starlightShard: 10 },
  [NB_STRUCT_VOID_GATE]: { darkMatter: 80, nebulaEssence: 120, starlightShard: 20 },
  [NB_STRUCT_COSMIC_CRUCIBLE]: { darkMatter: 100, starlightShard: 30, nebulaEssence: 150 },
  [NB_STRUCT_ASCENDANT_SPIRE]: { darkMatter: 200, starlightShard: 50, nebulaEssence: 250 },
};

export const NB_STRUCT_DISPLAY: Record<string, string> = {
  [NB_STRUCT_COMMAND_TOWER]: 'Command Tower',
  [NB_STRUCT_REACTOR_HUB]: 'Reactor Hub',
  [NB_STRUCT_SHIELD_GENERATOR]: 'Shield Generator',
  [NB_STRUCT_TURRET_ARRAY]: 'Turret Array',
  [NB_STRUCT_DRYDOCK]: 'Drydock',
  [NB_STRUCT_RESEARCH_STATION]: 'Research Station',
  [NB_STRUCT_HARVESTER_BAY]: 'Harvester Bay',
  [NB_STRUCT_O2_GARDEN]: 'O2 Garden',
  [NB_STRUCT_COMM_RELAY]: 'Comm Relay',
  [NB_STRUCT_AMMO_DEPOT]: 'Ammo Depot',
  [NB_STRUCT_FUSION_PLANT]: 'Fusion Plant',
  [NB_STRUCT_CARGO_HOLD]: 'Cargo Hold',
  [NB_STRUCT_MED_BAY]: 'Med Bay',
  [NB_STRUCT_TRAINING_HALL]: 'Training Hall',
  [NB_STRUCT_OBSERVATORY]: 'Observatory',
  [NB_STRUCT_HEAVY_SHIELD]: 'Heavy Shield',
  [NB_STRUCT_MISSILE_SILO]: 'Missile Silo',
  [NB_STRUCT_WARP_GATE]: 'Warp Gate',
  [NB_STRUCT_DARK_FORGE]: 'Dark Forge',
  [NB_STRUCT_STARLIGHT_BEACON]: 'Starlight Beacon',
  [NB_STRUCT_GRAVITY_ANCHOR]: 'Gravity Anchor',
  [NB_STRUCT_CHRONO_VAULT]: 'Chrono Vault',
  [NB_STRUCT_VOID_GATE]: 'Void Gate',
  [NB_STRUCT_COSMIC_CRUCIBLE]: 'Cosmic Crucible',
  [NB_STRUCT_ASCENDANT_SPIRE]: 'Ascendant Spire',
};

// ─── Cosmic Abilities (22) ──────────────────────────────────────────────────

export const NB_ABILITY_SHIELD_BURST = 'shield_burst';
export const NB_ABILITY_OVERCHARGE = 'overcharge';
export const NB_ABILITY_NEBULA_CLOAK = 'nebula_cloak';
export const NB_ABILITY_ASTEROID_BOMBARDMENT = 'asteroid_bombardment';
export const NB_ABILITY_FLEET_RECALL = 'fleet_recall';
export const NB_ABILITY_ENERGY_SURGE = 'energy_surge';
export const NB_ABILITY_DARK_PULSE = 'dark_pulse';
export const NB_ABILITY_GRAVITY_CRUSH = 'gravity_crush';
export const NB_ABILITY_PHOTON_STORM = 'photon_storm';
export const NB_ABILITY_WARP_JUMP = 'warp_jump';
export const NB_ABILITY_VOID_PHASE = 'void_phase';
export const NB_ABILITY_SINGULARITY_PULL = 'singularity_pull';
export const NB_ABILITY_CHRONO_FREEZE = 'chrono_freeze';
export const NB_ABILITY_ANTIMATTER_BARRAGE = 'antimatter_barrage';
export const NB_ABILITY_STARLIGHT_HEAL = 'starlight_heal';
export const NB_ABILITY_DIMENSION_SHIFT = 'dimension_shift';
export const NB_ABILITY_COSMIC_FORTIFY = 'cosmic_fortify';
export const NB_ABILITY_NEBULA_DRAIN = 'nebula_drain';
export const NB_ABILITY_QUANTUM_DECOY = 'quantum_decoy';
export const NB_ABILITY_INFINITE_BARRAGE = 'infinite_barrage';
export const NB_ABILITY_ASCENDANT_RAGE = 'ascendant_rage';
export const NB_ABILITY_FINAL_JUDGMENT = 'final_judgment';

export const NB_ALL_ABILITIES: string[] = [
  NB_ABILITY_SHIELD_BURST,
  NB_ABILITY_OVERCHARGE,
  NB_ABILITY_NEBULA_CLOAK,
  NB_ABILITY_ASTEROID_BOMBARDMENT,
  NB_ABILITY_FLEET_RECALL,
  NB_ABILITY_ENERGY_SURGE,
  NB_ABILITY_DARK_PULSE,
  NB_ABILITY_GRAVITY_CRUSH,
  NB_ABILITY_PHOTON_STORM,
  NB_ABILITY_WARP_JUMP,
  NB_ABILITY_VOID_PHASE,
  NB_ABILITY_SINGULARITY_PULL,
  NB_ABILITY_CHRONO_FREEZE,
  NB_ABILITY_ANTIMATTER_BARRAGE,
  NB_ABILITY_STARLIGHT_HEAL,
  NB_ABILITY_DIMENSION_SHIFT,
  NB_ABILITY_COSMIC_FORTIFY,
  NB_ABILITY_NEBULA_DRAIN,
  NB_ABILITY_QUANTUM_DECOY,
  NB_ABILITY_INFINITE_BARRAGE,
  NB_ABILITY_ASCENDANT_RAGE,
  NB_ABILITY_FINAL_JUDGMENT,
];

export const NB_ABILITY_COOLDOWN: Record<string, number> = {
  [NB_ABILITY_SHIELD_BURST]: 3,
  [NB_ABILITY_OVERCHARGE]: 4,
  [NB_ABILITY_NEBULA_CLOAK]: 5,
  [NB_ABILITY_ASTEROID_BOMBARDMENT]: 6,
  [NB_ABILITY_FLEET_RECALL]: 3,
  [NB_ABILITY_ENERGY_SURGE]: 4,
  [NB_ABILITY_DARK_PULSE]: 5,
  [NB_ABILITY_GRAVITY_CRUSH]: 7,
  [NB_ABILITY_PHOTON_STORM]: 6,
  [NB_ABILITY_WARP_JUMP]: 5,
  [NB_ABILITY_VOID_PHASE]: 6,
  [NB_ABILITY_SINGULARITY_PULL]: 8,
  [NB_ABILITY_CHRONO_FREEZE]: 10,
  [NB_ABILITY_ANTIMATTER_BARRAGE]: 8,
  [NB_ABILITY_STARLIGHT_HEAL]: 5,
  [NB_ABILITY_DIMENSION_SHIFT]: 7,
  [NB_ABILITY_COSMIC_FORTIFY]: 6,
  [NB_ABILITY_NEBULA_DRAIN]: 4,
  [NB_ABILITY_QUANTUM_DECOY]: 5,
  [NB_ABILITY_INFINITE_BARRAGE]: 12,
  [NB_ABILITY_ASCENDANT_RAGE]: 10,
  [NB_ABILITY_FINAL_JUDGMENT]: 15,
};

export const NB_ABILITY_DISPLAY: Record<string, string> = {
  [NB_ABILITY_SHIELD_BURST]: 'Shield Burst',
  [NB_ABILITY_OVERCHARGE]: 'Overcharge',
  [NB_ABILITY_NEBULA_CLOAK]: 'Nebula Cloak',
  [NB_ABILITY_ASTEROID_BOMBARDMENT]: 'Asteroid Bombardment',
  [NB_ABILITY_FLEET_RECALL]: 'Fleet Recall',
  [NB_ABILITY_ENERGY_SURGE]: 'Energy Surge',
  [NB_ABILITY_DARK_PULSE]: 'Dark Pulse',
  [NB_ABILITY_GRAVITY_CRUSH]: 'Gravity Crush',
  [NB_ABILITY_PHOTON_STORM]: 'Photon Storm',
  [NB_ABILITY_WARP_JUMP]: 'Warp Jump',
  [NB_ABILITY_VOID_PHASE]: 'Void Phase',
  [NB_ABILITY_SINGULARITY_PULL]: 'Singularity Pull',
  [NB_ABILITY_CHRONO_FREEZE]: 'Chrono Freeze',
  [NB_ABILITY_ANTIMATTER_BARRAGE]: 'Antimatter Barrage',
  [NB_ABILITY_STARLIGHT_HEAL]: 'Starlight Heal',
  [NB_ABILITY_DIMENSION_SHIFT]: 'Dimension Shift',
  [NB_ABILITY_COSMIC_FORTIFY]: 'Cosmic Fortify',
  [NB_ABILITY_NEBULA_DRAIN]: 'Nebula Drain',
  [NB_ABILITY_QUANTUM_DECOY]: 'Quantum Decoy',
  [NB_ABILITY_INFINITE_BARRAGE]: 'Infinite Barrage',
  [NB_ABILITY_ASCENDANT_RAGE]: 'Ascendant Rage',
  [NB_ABILITY_FINAL_JUDGMENT]: 'Final Judgment',
};

// ─── Achievement Constants (18) ─────────────────────────────────────────────

export const NB_ACH_FIRST_SHIP = 'first_ship';
export const NB_ACH_SHIELD_MASTER = 'shield_master';
export const NB_ACH_FLEET_ADMIRAL = 'fleet_admiral';
export const NB_ACH_NEBULA_HARVESTER = 'nebula_harvester_ach';
export const NB_ACH_ASTEROID_CRUSHER = 'asteroid_crusher';
export const NB_ACH_TECH_PIONEER = 'tech_pioneer';
export const NB_ACH_STRUCTURE_MAGNATE = 'structure_magnate';
export const NB_ACH_RESOURCE_BARON = 'resource_baron';
export const NB_ACH_LEGENDARY_FLEET = 'legendary_fleet';
export const NB_ACH_ABILITY_MASTER = 'ability_master';
export const NB_ACH_DAILY_DEVOTEE = 'daily_devotee';
export const NB_ACH_SURVIVOR_30 = 'survivor_30';
export const NB_ACH_SECTOR_EXPERT = 'sector_expert';
export const NB_ACH_DARK_MATTER_HOARDER = 'dark_matter_hoarder';
export const NB_ACH_FULLY_UPGRADED = 'fully_upgraded';
export const NB_ACH_STARLIGHT_COLLECTOR = 'starlight_collector';
export const NB_ACH_BASTION_LEGEND = 'bastion_legend';
export const NB_ACH_ASCENDANT_COMMANDER = 'ascendant_commander';

export const NB_ALL_ACHIEVEMENTS: string[] = [
  NB_ACH_FIRST_SHIP,
  NB_ACH_SHIELD_MASTER,
  NB_ACH_FLEET_ADMIRAL,
  NB_ACH_NEBULA_HARVESTER,
  NB_ACH_ASTEROID_CRUSHER,
  NB_ACH_TECH_PIONEER,
  NB_ACH_STRUCTURE_MAGNATE,
  NB_ACH_RESOURCE_BARON,
  NB_ACH_LEGENDARY_FLEET,
  NB_ACH_ABILITY_MASTER,
  NB_ACH_DAILY_DEVOTEE,
  NB_ACH_SURVIVOR_30,
  NB_ACH_SECTOR_EXPERT,
  NB_ACH_DARK_MATTER_HOARDER,
  NB_ACH_FULLY_UPGRADED,
  NB_ACH_STARLIGHT_COLLECTOR,
  NB_ACH_BASTION_LEGEND,
  NB_ACH_ASCENDANT_COMMANDER,
];

export const NB_ACHIEVEMENT_DEFS: Record<string, { name: string; description: string; xp: number }> = {
  [NB_ACH_FIRST_SHIP]: { name: 'First Launch', description: 'Build your first starship', xp: 50 },
  [NB_ACH_SHIELD_MASTER]: { name: 'Shield Master', description: 'Reach max shield integrity 5 times', xp: 100 },
  [NB_ACH_FLEET_ADMIRAL]: { name: 'Fleet Admiral', description: 'Own 10 starships simultaneously', xp: 150 },
  [NB_ACH_NEBULA_HARVESTER]: { name: 'Nebula Harvester', description: 'Harvest nebula energy 20 times', xp: 120 },
  [NB_ACH_ASTEROID_CRUSHER]: { name: 'Asteroid Crusher', description: 'Destroy 50 asteroids', xp: 180 },
  [NB_ACH_TECH_PIONEER]: { name: 'Tech Pioneer', description: 'Research 15 technologies', xp: 200 },
  [NB_ACH_STRUCTURE_MAGNATE]: { name: 'Structure Magnate', description: 'Build all 25 bastion structures', xp: 300 },
  [NB_ACH_RESOURCE_BARON]: { name: 'Resource Baron', description: 'Accumulate 2000 of any resource', xp: 130 },
  [NB_ACH_LEGENDARY_FLEET]: { name: 'Legendary Fleet', description: 'Own 3 legendary starships', xp: 250 },
  [NB_ACH_ABILITY_MASTER]: { name: 'Ability Master', description: 'Use 50 cosmic abilities', xp: 200 },
  [NB_ACH_DAILY_DEVOTEE]: { name: 'Daily Devotee', description: 'Complete 10 daily quests', xp: 150 },
  [NB_ACH_SURVIVOR_30]: { name: '30-Day Survivor', description: 'Survive 30 asteroid storm cycles', xp: 160 },
  [NB_ACH_SECTOR_EXPERT]: { name: 'Sector Expert', description: 'Upgrade all 8 sectors to level 10', xp: 350 },
  [NB_ACH_DARK_MATTER_HOARDER]: { name: 'Dark Matter Hoarder', description: 'Accumulate 500 dark matter', xp: 200 },
  [NB_ACH_FULLY_UPGRADED]: { name: 'Fully Upgraded', description: 'Upgrade any structure to level 10', xp: 180 },
  [NB_ACH_STARLIGHT_COLLECTOR]: { name: 'Starlight Collector', description: 'Accumulate 100 starlight shards', xp: 220 },
  [NB_ACH_BASTION_LEGEND]: { name: 'Bastion Legend', description: 'Reach level 50', xp: 500 },
  [NB_ACH_ASCENDANT_COMMANDER]: { name: 'Ascendant Commander', description: 'Unlock the Star Commander title', xp: 400 },
};

// ─── Title Constants (8) ────────────────────────────────────────────────────

export const NB_TITLE_CADET = 'Cadet';
export const NB_TITLE_ENSIGN = 'Ensign';
export const NB_TITLE_LIEUTENANT = 'Lieutenant';
export const NB_TITLE_COMMANDER = 'Commander';
export const NB_TITLE_CAPTAIN = 'Captain';
export const NB_TITLE_ADMIRAL = 'Admiral';
export const NB_TITLE_FLEET_LORD = 'Fleet Lord';
export const NB_TITLE_STAR_COMMANDER = 'Star Commander';

export const NB_ALL_TITLES: string[] = [
  NB_TITLE_CADET,
  NB_TITLE_ENSIGN,
  NB_TITLE_LIEUTENANT,
  NB_TITLE_COMMANDER,
  NB_TITLE_CAPTAIN,
  NB_TITLE_ADMIRAL,
  NB_TITLE_FLEET_LORD,
  NB_TITLE_STAR_COMMANDER,
];

export const NB_TITLE_LEVEL_REQ: Record<string, number> = {
  [NB_TITLE_CADET]: 1,
  [NB_TITLE_ENSIGN]: 5,
  [NB_TITLE_LIEUTENANT]: 12,
  [NB_TITLE_COMMANDER]: 20,
  [NB_TITLE_CAPTAIN]: 30,
  [NB_TITLE_ADMIRAL]: 38,
  [NB_TITLE_FLEET_LORD]: 45,
  [NB_TITLE_STAR_COMMANDER]: 50,
};

// ─── Daily Quest Templates ──────────────────────────────────────────────────

export const NB_DAILY_HARVEST_NEBULA = 'daily_harvest_nebula';
export const NB_DAILY_DESTROY_ASTEROIDS = 'daily_destroy_asteroids';
export const NB_DAILY_BUILD_SHIP = 'daily_build_ship';
export const NB_DAILY_RESEARCH_TECH = 'daily_research_tech';
export const NB_DAILY_USE_ABILITY = 'daily_use_ability';
export const NB_DAILY_UPGRADE_STRUCTURE = 'daily_upgrade_structure';

export const NB_ALL_DAILY_TYPES: string[] = [
  NB_DAILY_HARVEST_NEBULA,
  NB_DAILY_DESTROY_ASTEROIDS,
  NB_DAILY_BUILD_SHIP,
  NB_DAILY_RESEARCH_TECH,
  NB_DAILY_USE_ABILITY,
  NB_DAILY_UPGRADE_STRUCTURE,
];

export const NB_DAILY_DISPLAY: Record<string, string> = {
  [NB_DAILY_HARVEST_NEBULA]: 'Harvest Nebula',
  [NB_DAILY_DESTROY_ASTEROIDS]: 'Destroy Asteroids',
  [NB_DAILY_BUILD_SHIP]: 'Build Ship',
  [NB_DAILY_RESEARCH_TECH]: 'Research Tech',
  [NB_DAILY_USE_ABILITY]: 'Use Ability',
  [NB_DAILY_UPGRADE_STRUCTURE]: 'Upgrade Structure',
};

// ─── Misc Constants ─────────────────────────────────────────────────────────

export const NB_MAX_LEVEL = 50;
export const NB_MAX_SHIELD = 1000;
export const NB_MAX_FLEET_SIZE = 30;
export const NB_MAX_STRUCTURE_LEVEL = 10;
export const NB_BASE_XP_PER_LEVEL = 200;
export const NB_XP_SCALE_FACTOR = 1.5;
export const NB_SHIELD_REGEN_PER_TICK = 5;
export const NB_ASTEROID_DAMAGE_BASE = 20;
export const NB_EVENT_ASTEROID_STORM = 'asteroid_storm';
export const NB_EVENT_NEBULA_SURGE = 'nebula_surge';
export const NB_EVENT_DARK_MATTER_WAVE = 'dark_matter_wave';
export const NB_EVENT_SOLAR_FLARE_BURST = 'solar_flare_burst';
export const NB_EVENT_COSMIC_ANOMALY = 'cosmic_anomaly';
export const NB_EVENT_STARLIGHT_RAIN = 'starlight_rain';
export const NB_EVENT_PIRATE_RAID = 'pirate_raid';
export const NB_EVENT_VOID_TREMOR = 'void_tremor';

// ─── Color Theme ────────────────────────────────────────────────────────────

export const NB_COLOR_NEBULA_PURPLE = '#7c3aed';
export const NB_COLOR_DEEP_SPACE_BLUE = '#1e1b4b';
export const NB_COLOR_STARLIGHT_GOLD = '#f59e0b';
export const NB_COLOR_COSMIC_TEAL = '#06b6d4';
export const NB_COLOR_PLASMA_ORANGE = '#ea580c';

// ─── Types & Interfaces ─────────────────────────────────────────────────────

interface NbFleetShip {
  id: string;
  shipId: string;
  name: string;
  rarity: string;
  firepower: number;
  speed: number;
  shipType: string;
  hp: number;
  maxHp: number;
  status: 'docked' | 'patrolling' | 'harvesting' | 'defending' | 'exploring';
  missionTimer: number;
}

interface NbStructureEntry {
  structureId: string;
  level: number;
  integrity: number;
  built: boolean;
}

interface NbSectorEntry {
  sectorId: string;
  level: number;
  integrity: number;
  unlocked: boolean;
}

interface NbAbilityState {
  abilityId: string;
  cooldownRemaining: number;
  totalUses: number;
}

interface NbDailyQuest {
  questType: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: Record<string, number>;
  day: number;
}

interface NbAchievementEntry {
  achievementId: string;
  unlocked: boolean;
  unlockedDay: number | null;
  progress: number;
}

interface NbEventLog {
  day: number;
  message: string;
  type: string;
}

interface NbNebulaBastionState {
  seed: number;
  day: number;
  cycle: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXpEarned: number;
  title: string;
  bastionName: string;
  resources: Record<string, number>;
  fleet: NbFleetShip[];
  structures: Record<string, NbStructureEntry>;
  sectors: Record<string, NbSectorEntry>;
  researchedTechs: string[];
  abilities: Record<string, NbAbilityState>;
  achievements: NbAchievementEntry[];
  shield: number;
  maxShield: number;
  dailyQuests: NbDailyQuest[];
  eventLog: NbEventLog[];
  asteroidsDestroyed: number;
  nebulaHarvested: number;
  shipsBuilt: number;
  abilitiesUsed: number;
  structuresBuilt: number;
  dailyQuestsCompleted: number;
  totalCyclesSurvived: number;
  maxShieldReached: number;
  currentStormStrength: number;
  hasActiveStorm: boolean;
  stormTimer: number;
}

// ─── Helper: XP calculation ─────────────────────────────────────────────────

function nbCalculateXpToNext(level: number): number {
  return Math.floor(NB_BASE_XP_PER_LEVEL * Math.pow(NB_XP_SCALE_FACTOR, level - 1));
}

// ─── Helper: generate ship instance name ────────────────────────────────────

const NB_SHIP_PREFIXES = ['NBS', 'HVN', 'VDR', 'SLR', 'DSK'];
const NB_SHIP_SUFFIXES = [
  'Alpha', 'Bravo', 'Delta', 'Echo', 'Foxtrot',
  'Gamma', 'Kappa', 'Nova', 'Omega', 'Prism',
  'Quasar', 'Sigma', 'Theta', 'Zeta', 'Eon',
];

function nbGenerateShipInstanceName(rng: () => number): string {
  const prefix = NB_SHIP_PREFIXES[Math.floor(rng() * NB_SHIP_PREFIXES.length)];
  const suffix = NB_SHIP_SUFFIXES[Math.floor(rng() * NB_SHIP_SUFFIXES.length)];
  const num = Math.floor(rng() * 999) + 1;
  return prefix + '-' + suffix + ' ' + num;
}

// ─── Initial State ──────────────────────────────────────────────────────────

function createInitialState(seed?: number): NbNebulaBastionState {
  const actualSeed = seed ?? 42;
  const rng = mulberry32(actualSeed);

  const initialResources: Record<string, number> = {};
  NB_ALL_RESOURCES.forEach((res) => {
    initialResources[res] = res === NB_RES_STELLAR_ORE ? 300 : res === NB_RES_PLASMA_CORE ? 150 : res === NB_RES_COSMIC_DUST ? 200 : 0;
  });

  const initialStructures: Record<string, NbStructureEntry> = {};
  NB_ALL_STRUCTURES.forEach((s) => {
    initialStructures[s] = { structureId: s, level: 0, integrity: 0, built: false };
  });

  const initialSectors: Record<string, NbSectorEntry> = {};
  NB_ALL_SECTORS.forEach((s) => {
    initialSectors[s] = { sectorId: s, level: 0, integrity: 0, unlocked: false };
  });

  const initialAbilities: Record<string, NbAbilityState> = {};
  NB_ALL_ABILITIES.forEach((a) => {
    initialAbilities[a] = { abilityId: a, cooldownRemaining: 0, totalUses: 0 };
  });

  const initialAchievements: NbAchievementEntry[] = NB_ALL_ACHIEVEMENTS.map((a) => ({
    achievementId: a,
    unlocked: false,
    unlockedDay: null,
    progress: 0,
  }));

  const initialDailyQuests: NbDailyQuest[] = generateDailyQuests(1, rng);

  return {
    seed: actualSeed,
    day: 1,
    cycle: 1,
    level: 1,
    xp: 0,
    xpToNextLevel: nbCalculateXpToNext(1),
    totalXpEarned: 0,
    title: NB_TITLE_CADET,
    bastionName: 'Nebula Bastion Prime',
    resources: initialResources,
    fleet: [],
    structures: initialStructures,
    sectors: initialSectors,
    researchedTechs: [],
    abilities: initialAbilities,
    achievements: initialAchievements,
    shield: 500,
    maxShield: 1000,
    dailyQuests: initialDailyQuests,
    eventLog: [
      { day: 1, message: 'Nebula Bastion Prime initialized. Defend the fortress, Commander.', type: 'info' },
    ],
    asteroidsDestroyed: 0,
    nebulaHarvested: 0,
    shipsBuilt: 0,
    abilitiesUsed: 0,
    structuresBuilt: 0,
    dailyQuestsCompleted: 0,
    totalCyclesSurvived: 0,
    maxShieldReached: 500,
    currentStormStrength: 0,
    hasActiveStorm: false,
    stormTimer: 0,
  };
}

function generateDailyQuests(day: number, rng: () => number): NbDailyQuest[] {
  const quests: NbDailyQuest[] = [];
  const shuffled = [...NB_ALL_DAILY_TYPES].sort(() => rng() - 0.5);
  const selected = shuffled.slice(0, 3);

  for (const type of selected) {
    const target = type === NB_DAILY_DESTROY_ASTEROIDS ? 5 + Math.floor(rng() * 5) :
      type === NB_DAILY_HARVEST_NEBULA ? 3 + Math.floor(rng() * 3) :
      type === NB_DAILY_USE_ABILITY ? 2 + Math.floor(rng() * 3) : 1;

    const reward: Record<string, number> = {
      stellarOre: 30 + Math.floor(rng() * 40),
      plasmaCore: 15 + Math.floor(rng() * 25),
    };
    if (rng() < 0.3) {
      reward[NB_RES_NEBULA_ESSENCE] = 5 + Math.floor(rng() * 10);
    }
    if (rng() < 0.1) {
      reward[NB_RES_DARK_MATTER] = 1 + Math.floor(rng() * 3);
    }

    quests.push({
      questType: type,
      target,
      progress: 0,
      completed: false,
      claimed: false,
      reward,
      day,
    });
  }

  return quests;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export default function useNebulaBastion(initialSeed?: number) {
  const [state, setState] = useState<NbNebulaBastionState>(() => createInitialState(initialSeed));

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── Core state accessor ─────────────────────────────────────────────────

  const nbGetState = useCallback((): NbNebulaBastionState => {
    return state;
  }, [state]);

  // ── Pure helper functions (used inside setState callbacks) ───────────────

  function applyXpGain(currentState: NbNebulaBastionState, amount: number): NbNebulaBastionState {
    let newXp = currentState.xp + amount;
    let newLevel = currentState.level;
    let newXpToNext = currentState.xpToNextLevel;
    let newTitle = currentState.title;
    const newTotalXp = currentState.totalXpEarned + amount;

    while (newXp >= newXpToNext && newLevel < NB_MAX_LEVEL) {
      newXp -= newXpToNext;
      newLevel += 1;
      newXpToNext = nbCalculateXpToNext(newLevel);
    }

    if (newXp >= newXpToNext && newLevel >= NB_MAX_LEVEL) {
      newXp = 0;
    }

    for (let i = NB_ALL_TITLES.length - 1; i >= 0; i--) {
      if (newLevel >= NB_TITLE_LEVEL_REQ[NB_ALL_TITLES[i]]) {
        newTitle = NB_ALL_TITLES[i];
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

  function addResources(currentState: NbNebulaBastionState, additions: Record<string, number>): NbNebulaBastionState {
    const newResources = { ...currentState.resources };
    for (const key of Object.keys(additions)) {
      const val = additions[key] ?? 0;
      newResources[key] = (newResources[key] ?? 0) + val;
    }
    return { ...currentState, resources: newResources };
  }

  function removeResources(currentState: NbNebulaBastionState, costs: Record<string, number>): NbNebulaBastionState {
    const newResources = { ...currentState.resources };
    for (const key of Object.keys(costs)) {
      newResources[key] = Math.max(0, (newResources[key] ?? 0) - (costs[key] ?? 0));
    }
    return { ...currentState, resources: newResources };
  }

  function canAfford(currentState: NbNebulaBastionState, costs: Record<string, number>): boolean {
    for (const key of Object.keys(costs)) {
      if ((currentState.resources[key] ?? 0) < (costs[key] ?? 0)) {
        return false;
      }
    }
    return true;
  }

  function checkAchievements(currentState: NbNebulaBastionState): NbNebulaBastionState {
    const newAchievements = currentState.achievements.map((a) => ({ ...a }));
    const newEventLog = [...currentState.eventLog];
    let newState = { ...currentState, achievements: newAchievements, eventLog: newEventLog };
    let xpGain = 0;

    const check = (id: string, condition: boolean, progress?: number) => {
      const entry = newAchievements.find((a) => a.achievementId === id);
      if (entry && !entry.unlocked && condition) {
        entry.unlocked = true;
        entry.unlockedDay = currentState.day;
        if (progress !== undefined) {
          entry.progress = progress;
        }
        const def = NB_ACHIEVEMENT_DEFS[id];
        if (def) {
          xpGain += def.xp;
          newEventLog.push({
            day: currentState.day,
            message: `Achievement Unlocked: ${def.name}! +${def.xp} XP`,
            type: 'achievement',
          });
        }
      }
    };

    check(NB_ACH_FIRST_SHIP, currentState.shipsBuilt >= 1);
    check(NB_ACH_FLEET_ADMIRAL, currentState.fleet.length >= 10);
    check(NB_ACH_NEBULA_HARVESTER, currentState.nebulaHarvested >= 20);
    check(NB_ACH_ASTEROID_CRUSHER, currentState.asteroidsDestroyed >= 50);
    check(NB_ACH_TECH_PIONEER, currentState.researchedTechs.length >= 15);
    check(NB_ACH_DAILY_DEVOTEE, currentState.dailyQuestsCompleted >= 10);
    check(NB_ACH_SURVIVOR_30, currentState.totalCyclesSurvived >= 30);
    check(NB_ACH_LEGENDARY_FLEET, currentState.fleet.filter((s) => s.rarity === NB_RARITY_LEGENDARY).length >= 3);
    check(NB_ACH_ABILITY_MASTER, currentState.abilitiesUsed >= 50);
    check(
      NB_ACH_RESOURCE_BARON,
      NB_ALL_RESOURCES.some((r) => (currentState.resources[r] ?? 0) >= 2000),
    );
    check(
      NB_ACH_STRUCTURE_MAGNATE,
      NB_ALL_STRUCTURES.every((s) => currentState.structures[s]?.built),
    );
    check(
      NB_ACH_DARK_MATTER_HOARDER,
      (currentState.resources[NB_RES_DARK_MATTER] ?? 0) >= 500,
    );
    check(
      NB_ACH_STARLIGHT_COLLECTOR,
      (currentState.resources[NB_RES_STARLIGHT_SHARD] ?? 0) >= 100,
    );
    check(
      NB_ACH_FULLY_UPGRADED,
      NB_ALL_STRUCTURES.some((s) => (currentState.structures[s]?.level ?? 0) >= 10),
    );
    check(
      NB_ACH_SECTOR_EXPERT,
      NB_ALL_SECTORS.every((s) => (currentState.sectors[s]?.level ?? 0) >= 10),
    );
    check(NB_ACH_BASTION_LEGEND, currentState.level >= 50);
    check(NB_ACH_ASCENDANT_COMMANDER, currentState.title === NB_TITLE_STAR_COMMANDER);
    check(NB_ACH_SHIELD_MASTER, currentState.maxShieldReached >= 1000);

    if (xpGain > 0) {
      newState = applyXpGain(newState, xpGain);
    }
    return newState;
  }

  // ── Actions (useCallback-wrapped) ───────────────────────────────────────

  const nbAdvanceDay = useCallback((): void => {
    setState((prev) => {
      const rng = mulberry32(prev.seed + prev.day * 137);
      let next = { ...prev, day: prev.day + 1 };

      // Cycle counter every 5 days
      let newCycle = prev.cycle;
      if (next.day % 5 === 0) {
        newCycle = prev.cycle + 1;
      }
      next = { ...next, cycle: newCycle, totalCyclesSurvived: newCycle };

      // Shield regeneration
      const hasAutoRepair = prev.researchedTechs.includes(NB_TECH_AUTOREPAIR);
      const regenRate = hasAutoRepair ? NB_SHIELD_REGEN_PER_TICK * 2 : NB_SHIELD_REGEN_PER_TICK;
      const shieldBonus = prev.structures[NB_STRUCT_SHIELD_GENERATOR]?.built
        ? prev.structures[NB_STRUCT_SHIELD_GENERATOR].level * 3
        : 0;
      const totalRegen = regenRate + shieldBonus;
      const newShield = Math.min(prev.maxShield, prev.shield + totalRegen);
      const newMaxReached = Math.max(prev.maxShieldReached, newShield);
      next = { ...next, shield: newShield, maxShieldReached: newMaxReached };

      // Fleet mission timers
      next = {
        ...next,
        fleet: next.fleet.map((ship) => {
          if (ship.status !== 'docked' && ship.missionTimer > 0) {
            const newTimer = ship.missionTimer - 1;
            let newStatus: NbFleetShip['status'] = ship.status;
            if (newTimer <= 0) {
              newStatus = 'docked';
            }
            return { ...ship, missionTimer: newTimer, status: newStatus };
          }
          return ship;
        }),
      };

      // Resource generation from structures
      if (prev.structures[NB_STRUCT_FUSION_PLANT]?.built) {
        const level = prev.structures[NB_STRUCT_FUSION_PLANT].level;
        next = addResources(next, { [NB_RES_PLASMA_CORE]: level * 3 + 5 });
      }
      if (prev.structures[NB_STRUCT_HARVESTER_BAY]?.built) {
        const level = prev.structures[NB_STRUCT_HARVESTER_BAY].level;
        next = addResources(next, { [NB_RES_NEBULA_ESSENCE]: level * 2 + 3 });
      }
      if (prev.structures[NB_STRUCT_REACTOR_HUB]?.built) {
        const level = prev.structures[NB_STRUCT_REACTOR_HUB].level;
        next = addResources(next, { [NB_RES_PHOTON_ENERGY]: level * 2 + 4 });
      }

      // Asteroid storm logic
      if (next.hasActiveStorm && next.stormTimer > 0) {
        const damage = NB_ASTEROID_DAMAGE_BASE * next.currentStormStrength;
        const shieldAbsorb = Math.min(next.shield, Math.floor(damage * 0.8));
        const remainingDamage = damage - shieldAbsorb;
        const structureDamage = Math.floor(remainingDamage * 0.3);
        next = { ...next, shield: next.shield - shieldAbsorb };

        // Damage random structures
        const builtStructures = Object.keys(next.structures).filter(
          (s) => next.structures[s].built && next.structures[s].integrity > 0,
        );
        for (let i = 0; i < Math.min(2, builtStructures.length); i++) {
          const idx = Math.floor(rng() * builtStructures.length);
          const struct = { ...next.structures[builtStructures[idx]] };
          struct.integrity = Math.max(0, struct.integrity - structureDamage);
          next.structures = { ...next.structures, [builtStructures[idx]]: struct };
        }

        next.stormTimer -= 1;
        if (next.stormTimer <= 0) {
          next = { ...next, hasActiveStorm: false, currentStormStrength: 0 };
          next.eventLog.push({ day: next.day, message: 'Asteroid storm subsided. Shields stabilizing.', type: 'event' });
        }
      } else {
        // Random storm chance (25%)
        const stormRoll = rng();
        if (stormRoll < 0.25) {
          const strength = 1 + Math.floor(rng() * 3);
          const duration = 2 + Math.floor(rng() * 3);
          next = { ...next, hasActiveStorm: true, currentStormStrength: strength, stormTimer: duration };
          next.eventLog.push({
            day: next.day,
            message: `Asteroid storm incoming! Strength: ${strength}, Duration: ${duration} cycles.`,
            type: NB_EVENT_ASTEROID_STORM,
          });
        }
      }

      // Random events (15% chance)
      if (rng() < 0.15) {
        const eventRoll = rng();
        let eventMessage = '';
        let eventType = 'event';

        if (eventRoll < 0.2) {
          // Nebula surge
          const essenceGain = 10 + Math.floor(rng() * 20);
          next = addResources(next, { [NB_RES_NEBULA_ESSENCE]: essenceGain });
          eventMessage = `Nebula surge! +${essenceGain} nebula essence harvested passively.`;
          eventType = NB_EVENT_NEBULA_SURGE;
        } else if (eventRoll < 0.35) {
          // Solar flare burst
          const energyGain = 15 + Math.floor(rng() * 25);
          next = addResources(next, { [NB_RES_PHOTON_ENERGY]: energyGain });
          eventMessage = `Solar flare burst! +${energyGain} photon energy captured.`;
          eventType = NB_EVENT_SOLAR_FLARE_BURST;
        } else if (eventRoll < 0.5) {
          // Starlight rain
          const shardGain = 1 + Math.floor(rng() * 3);
          next = addResources(next, { [NB_RES_STARLIGHT_SHARD]: shardGain });
          eventMessage = `Starlight rain! +${shardGain} starlight shards collected.`;
          eventType = NB_EVENT_STARLIGHT_RAIN;
        } else if (eventRoll < 0.65) {
          // Dark matter wave
          const dmGain = 2 + Math.floor(rng() * 5);
          next = addResources(next, { [NB_RES_DARK_MATTER]: dmGain });
          next = applyXpGain(next, 30);
          eventMessage = `Dark matter wave detected! +${dmGain} dark matter, +30 XP.`;
          eventType = NB_EVENT_DARK_MATTER_WAVE;
        } else if (eventRoll < 0.8) {
          // Pirate raid
          const damage = 30 + Math.floor(rng() * 50);
          const shieldAbsorb = Math.min(next.shield, Math.floor(damage * 0.6));
          next = { ...next, shield: next.shield - shieldAbsorb };
          eventMessage = `Pirate raid! Shields absorbed ${shieldAbsorb} damage.`;
          eventType = NB_EVENT_PIRATE_RAID;
        } else {
          // Cosmic anomaly
          const rareGain = 3 + Math.floor(rng() * 7);
          next = addResources(next, { [NB_RES_COSMIC_PEARL]: rareGain });
          next = applyXpGain(next, 25);
          eventMessage = `Cosmic anomaly discovered! +${rareGain} cosmic pearls, +25 XP.`;
          eventType = NB_EVENT_COSMIC_ANOMALY;
        }

        next.eventLog.push({ day: next.day, message: eventMessage, type: eventType });
      }

      // Daily quest refresh (every 5 days)
      if (next.day % 5 === 1) {
        const newDailyQuests = generateDailyQuests(next.day, rng);
        next = { ...next, dailyQuests: newDailyQuests };
        next.eventLog.push({ day: next.day, message: 'New daily quests available!', type: 'daily' });
      }

      // Ability cooldown tick
      const newAbilities = { ...next.abilities };
      for (const key of Object.keys(newAbilities)) {
        const ab = { ...newAbilities[key] };
        if (ab.cooldownRemaining > 0) {
          ab.cooldownRemaining -= 1;
        }
        newAbilities[key] = ab;
      }
      next = { ...next, abilities: newAbilities };

      // Check achievements
      next = checkAchievements(next);

      return next;
    });
  }, [state]);

  const nbBuildShip = useCallback((shipId: string): NbFleetShip | null => {
    let built: NbFleetShip | null = null;
    setState((prev) => {
      if (prev.fleet.length >= NB_MAX_FLEET_SIZE) return prev;
      const shipDef = NB_SHIP_DATA[shipId];
      if (!shipDef) return prev;
      if (!canAfford(prev, shipDef.cost)) return prev;

      const rng = mulberry32(prev.seed + prev.day * 71 + prev.fleet.length * 13);
      const instanceId = 'fleet_' + (prev.fleet.length + 1) + '_' + prev.day;
      const instanceName = nbGenerateShipInstanceName(rng);

      const baseHp = shipDef.rarity === NB_RARITY_COMMON ? 50 :
        shipDef.rarity === NB_RARITY_UNUSUAL ? 80 :
        shipDef.rarity === NB_RARITY_RARE ? 120 :
        shipDef.rarity === NB_RARITY_EPIC ? 200 : 350;

      const ship: NbFleetShip = {
        id: instanceId,
        shipId,
        name: instanceName,
        rarity: shipDef.rarity,
        firepower: shipDef.firepower,
        speed: shipDef.speed,
        shipType: shipDef.shipType,
        hp: baseHp,
        maxHp: baseHp,
        status: 'docked',
        missionTimer: 0,
      };

      let next = removeResources(prev, shipDef.cost);
      next = {
        ...next,
        fleet: [...prev.fleet, ship],
        shipsBuilt: prev.shipsBuilt + 1,
      };

      const xpReward = shipDef.rarity === NB_RARITY_COMMON ? 20 :
        shipDef.rarity === NB_RARITY_UNUSUAL ? 40 :
        shipDef.rarity === NB_RARITY_RARE ? 80 :
        shipDef.rarity === NB_RARITY_EPIC ? 150 : 300;

      next = applyXpGain(next, xpReward);
      next.eventLog.push({
        day: next.day,
        message: `Starship built: ${shipDef.name} (${shipDef.rarity})! +${xpReward} XP`,
        type: 'fleet',
      });

      next = checkAchievements(next);
      built = { ...ship };
      return next;
    });
    return built;
  }, [state]);

  const nbDispatchFleet = useCallback((shipInstanceId: string, mission: string, duration: number): boolean => {
    let success = false;
    setState((prev) => {
      const shipIdx = prev.fleet.findIndex((s) => s.id === shipInstanceId);
      if (shipIdx === -1) return prev;
      const ship = prev.fleet[shipIdx];
      if (ship.status !== 'docked') return prev;

      const newFleet = [...prev.fleet];
      newFleet[shipIdx] = {
        ...ship,
        status: mission as NbFleetShip['status'],
        missionTimer: duration,
      };

      const missionLabels: Record<string, string> = {
        patrolling: 'Patrol Mission',
        harvesting: 'Nebula Harvest',
        defending: 'Defense Patrol',
        exploring: 'Deep Space Exploration',
      };
      const label = missionLabels[mission] ?? mission;

      const next = {
        ...prev,
        fleet: newFleet,
        eventLog: [
          ...prev.eventLog,
          { day: prev.day, message: `${ship.name} dispatched on ${label} (${duration} cycles).`, type: 'fleet' },
        ],
      };

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const nbDestroyAsteroid = useCallback((): Record<string, number> => {
    let result: Record<string, number> = {};
    setState((prev) => {
      const rng = mulberry32(prev.seed + prev.day * 31 + prev.asteroidsDestroyed * 7);
      const miningBonus = prev.researchedTechs.includes(NB_TECH_NEBULA_MINING) ? 1.5 : 1.0;
      const structureBonus = prev.structures[NB_STRUCT_HARVESTER_BAY]?.built
        ? 1 + prev.structures[NB_STRUCT_HARVESTER_BAY].level * 0.1
        : 1.0;

      const loot: Record<string, number> = {};
      loot[NB_RES_STELLAR_ORE] = Math.floor((15 + rng() * 25) * miningBonus * structureBonus);
      loot[NB_RES_COSMIC_DUST] = Math.floor((8 + rng() * 15) * miningBonus);

      if (rng() < 0.3) {
        loot[NB_RES_ION_CRYSTAL] = Math.floor((2 + rng() * 5) * miningBonus);
      }
      if (rng() < 0.15) {
        loot[NB_RES_PLASMA_CORE] = Math.floor((1 + rng() * 4) * miningBonus);
      }
      if (rng() < 0.08) {
        loot[NB_RES_DARK_MATTER] = Math.floor(1 + rng() * 2);
      }

      // Fleet firepower bonus
      const dockedFirepower = prev.fleet
        .filter((s) => s.status === 'docked')
        .reduce((sum, s) => sum + s.firepower, 0);
      const firepowerBonus = 1 + dockedFirepower * 0.005;
      for (const key of Object.keys(loot)) {
        loot[key] = Math.floor(loot[key] * firepowerBonus);
      }

      let next = addResources(prev, loot);
      next = { ...next, asteroidsDestroyed: prev.asteroidsDestroyed + 1 };

      next = applyXpGain(next, 10);

      // Progress daily quests
      const newDailyQuests = next.dailyQuests.map((q) => {
        if (q.questType === NB_DAILY_DESTROY_ASTEROIDS && !q.completed) {
          return { ...q, progress: q.progress + 1, completed: q.progress + 1 >= q.target };
        }
        return q;
      });
      next = { ...next, dailyQuests: newDailyQuests };

      next.eventLog.push({
        day: next.day,
        message: `Asteroid destroyed! Loot: ${Object.entries(loot).map(([k, v]) => `${v} ${k}`).join(', ')}`,
        type: 'mining',
      });

      next = checkAchievements(next);
      result = { ...loot };
      return next;
    });
    return result;
  }, [state]);

  const nbHarvestNebula = useCallback((): Record<string, number> => {
    let result: Record<string, number> = {};
    setState((prev) => {
      const rng = mulberry32(prev.seed + prev.day * 53 + prev.nebulaHarvested * 11);
      const harvesterBonus = prev.structures[NB_STRUCT_HARVESTER_BAY]?.built
        ? 1 + prev.structures[NB_STRUCT_HARVESTER_BAY].level * 0.15
        : 1.0;
      const techBonus = prev.researchedTechs.includes(NB_TECH_NEBULA_MINING) ? 1.3 : 1.0;

      const loot: Record<string, number> = {};
      loot[NB_RES_NEBULA_ESSENCE] = Math.floor((10 + rng() * 20) * harvesterBonus * techBonus);
      loot[NB_RES_COSMIC_DUST] = Math.floor((5 + rng() * 12) * harvesterBonus);

      if (rng() < 0.25) {
        loot[NB_RES_VOID_SILK] = Math.floor((1 + rng() * 4) * harvesterBonus);
      }
      if (rng() < 0.15) {
        loot[NB_RES_BIOLUM_ESSENCE] = Math.floor(1 + rng() * 3);
      }
      if (rng() < 0.05) {
        loot[NB_RES_STARLIGHT_SHARD] = Math.floor(1 + rng() * 2);
      }

      let next = addResources(prev, loot);
      next = { ...next, nebulaHarvested: prev.nebulaHarvested + 1 };

      next = applyXpGain(next, 15);

      const newDailyQuests = next.dailyQuests.map((q) => {
        if (q.questType === NB_DAILY_HARVEST_NEBULA && !q.completed) {
          return { ...q, progress: q.progress + 1, completed: q.progress + 1 >= q.target };
        }
        return q;
      });
      next = { ...next, dailyQuests: newDailyQuests };

      next.eventLog.push({
        day: next.day,
        message: `Nebula harvested! +${loot[NB_RES_NEBULA_ESSENCE]} essence, +${loot[NB_RES_COSMIC_DUST]} dust`,
        type: 'harvest',
      });

      next = checkAchievements(next);
      result = { ...loot };
      return next;
    });
    return result;
  }, [state]);

  const nbBuildStructure = useCallback((structureId: string): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.structures[structureId]?.built) return prev;
      const cost = NB_STRUCT_COST[structureId];
      if (!cost || !canAfford(prev, cost)) return prev;

      let next = removeResources(prev, cost);
      const newStructures = { ...next.structures };
      newStructures[structureId] = { ...newStructures[structureId], built: true, level: 1, integrity: 100 };
      next = { ...next, structures: newStructures, structuresBuilt: prev.structuresBuilt + 1 };

      next = applyXpGain(next, 40);
      next.eventLog.push({
        day: next.day,
        message: `Structure built: ${NB_STRUCT_DISPLAY[structureId] ?? structureId}!`,
        type: 'build',
      });

      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const nbUpgradeStructure = useCallback((structureId: string): boolean => {
    let success = false;
    setState((prev) => {
      const struct = prev.structures[structureId];
      if (!struct || !struct.built) return prev;
      if (struct.level >= NB_MAX_STRUCTURE_LEVEL) return prev;

      const scaleFactor = struct.level;
      const cost: Record<string, number> = {};
      const baseCost = NB_STRUCT_COST[structureId];
      if (baseCost) {
        for (const key of Object.keys(baseCost)) {
          cost[key] = Math.floor(baseCost[key] * scaleFactor * 1.5);
        }
      }
      if (!canAfford(prev, cost)) return prev;

      let next = removeResources(prev, cost);
      const newStructures = { ...next.structures };
      newStructures[structureId] = { ...struct, level: struct.level + 1, integrity: 100 };
      next = { ...next, structures: newStructures };

      next = applyXpGain(next, 25);
      next.eventLog.push({
        day: next.day,
        message: `${NB_STRUCT_DISPLAY[structureId] ?? structureId} upgraded to level ${struct.level + 1}!`,
        type: 'upgrade',
      });

      const newDailyQuests = next.dailyQuests.map((q) => {
        if (q.questType === NB_DAILY_UPGRADE_STRUCTURE && !q.completed) {
          return { ...q, progress: q.progress + 1, completed: q.progress + 1 >= q.target };
        }
        return q;
      });
      next = { ...next, dailyQuests: newDailyQuests };

      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const nbUnlockSector = useCallback((sectorId: string): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.sectors[sectorId]?.unlocked) return prev;
      const cost = NB_SECTOR_COST[sectorId];
      if (!cost || !canAfford(prev, cost)) return prev;

      let next = removeResources(prev, cost);
      const newSectors = { ...next.sectors };
      newSectors[sectorId] = { ...newSectors[sectorId], unlocked: true, level: 1, integrity: 100 };
      next = { ...next, sectors: newSectors };

      next = applyXpGain(next, 50);
      next.eventLog.push({
        day: next.day,
        message: `Sector unlocked: ${NB_SECTOR_DISPLAY[sectorId] ?? sectorId}!`,
        type: 'sector',
      });

      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const nbUpgradeSector = useCallback((sectorId: string): boolean => {
    let success = false;
    setState((prev) => {
      const sector = prev.sectors[sectorId];
      if (!sector || !sector.unlocked) return prev;
      if (sector.level >= NB_MAX_STRUCTURE_LEVEL) return prev;

      const scaleFactor = sector.level;
      const cost: Record<string, number> = {};
      const baseCost = NB_SECTOR_COST[sectorId];
      if (baseCost) {
        for (const key of Object.keys(baseCost)) {
          cost[key] = Math.floor(baseCost[key] * scaleFactor * 2.0);
        }
      }
      if (!canAfford(prev, cost)) return prev;

      let next = removeResources(prev, cost);
      const newSectors = { ...next.sectors };
      newSectors[sectorId] = { ...sector, level: sector.level + 1, integrity: 100 };
      next = { ...next, sectors: newSectors };

      // Shield array upgrades boost max shield
      if (sectorId === NB_SECTOR_SHIELD_ARRAY) {
        const newMaxShield = prev.maxShield + 50;
        next = { ...next, maxShield: newMaxShield };
      }

      next = applyXpGain(next, 30);
      next.eventLog.push({
        day: next.day,
        message: `Sector ${NB_SECTOR_DISPLAY[sectorId] ?? sectorId} upgraded to level ${sector.level + 1}!`,
        type: 'sector',
      });

      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const nbResearchTech = useCallback((techId: string): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.researchedTechs.includes(techId)) return prev;
      const cost = NB_TECH_COST[techId];
      if (!cost || !canAfford(prev, cost)) return prev;

      let next = removeResources(prev, cost);
      next = { ...next, researchedTechs: [...prev.researchedTechs, techId] };

      const rarity = NB_TECH_RARITY[techId] ?? NB_RARITY_COMMON;
      const xpReward = rarity === NB_RARITY_COMMON ? 30 :
        rarity === NB_RARITY_UNUSUAL ? 60 :
        rarity === NB_RARITY_RARE ? 100 :
        rarity === NB_RARITY_EPIC ? 160 : 250;

      next = applyXpGain(next, xpReward);
      next.eventLog.push({
        day: next.day,
        message: `Technology researched: ${techId} (${rarity})! +${xpReward} XP`,
        type: 'research',
      });

      const newDailyQuests = next.dailyQuests.map((q) => {
        if (q.questType === NB_DAILY_RESEARCH_TECH && !q.completed) {
          return { ...q, progress: q.progress + 1, completed: q.progress + 1 >= q.target };
        }
        return q;
      });
      next = { ...next, dailyQuests: newDailyQuests };

      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const nbUseAbility = useCallback((abilityId: string): boolean => {
    let success = false;
    setState((prev) => {
      const ability = prev.abilities[abilityId];
      if (!ability) return prev;
      if (ability.cooldownRemaining > 0) return prev;

      const cooldown = NB_ABILITY_COOLDOWN[abilityId] ?? 5;
      const newAbilities = { ...prev.abilities };
      newAbilities[abilityId] = {
        ...ability,
        cooldownRemaining: cooldown,
        totalUses: ability.totalUses + 1,
      };

      let next = { ...prev, abilities: newAbilities, abilitiesUsed: prev.abilitiesUsed + 1 };

      // Apply ability effects
      if (abilityId === NB_ABILITY_SHIELD_BURST) {
        next = { ...next, shield: Math.min(prev.maxShield, prev.shield + 200) };
        next.eventLog.push({ day: next.day, message: 'Shield Burst activated! +200 shield.', type: 'ability' });
      } else if (abilityId === NB_ABILITY_STARLIGHT_HEAL) {
        const newFleet = next.fleet.map((s) => ({
          ...s,
          hp: Math.min(s.maxHp, s.hp + Math.floor(s.maxHp * 0.3)),
        }));
        next = { ...next, fleet: newFleet };
        next.eventLog.push({ day: next.day, message: 'Starlight Heal! All docked ships repaired 30%.', type: 'ability' });
      } else if (abilityId === NB_ABILITY_ENERGY_SURGE) {
        next = addResources(next, {
          [NB_RES_PHOTON_ENERGY]: 30,
          [NB_RES_PLASMA_CORE]: 15,
        });
        next.eventLog.push({ day: next.day, message: 'Energy Surge! +30 photon energy, +15 plasma core.', type: 'ability' });
      } else if (abilityId === NB_ABILITY_NEBULA_DRAIN) {
        next = addResources(next, { [NB_RES_NEBULA_ESSENCE]: 20 });
        next.eventLog.push({ day: next.day, message: 'Nebula Drain! +20 nebula essence.', type: 'ability' });
      } else if (abilityId === NB_ABILITY_OVERCHARGE) {
        next = { ...next, shield: Math.min(prev.maxShield, prev.shield + 150) };
        next = addResources(next, { [NB_RES_PLASMA_CORE]: 20 });
        next.eventLog.push({ day: next.day, message: 'Overcharge! +150 shield, +20 plasma core.', type: 'ability' });
      } else if (abilityId === NB_ABILITY_ASTEROID_BOMBARDMENT) {
        const destroyed = 3 + Math.floor(Math.random() * 3);
        next = { ...next, asteroidsDestroyed: prev.asteroidsDestroyed + destroyed };
        next = addResources(next, {
          [NB_RES_STELLAR_ORE]: destroyed * 15,
          [NB_RES_COSMIC_DUST]: destroyed * 8,
        });
        next = applyXpGain(next, destroyed * 10);
        next.eventLog.push({ day: next.day, message: `Asteroid Bombardment! ${destroyed} asteroids destroyed.`, type: 'ability' });
      } else {
        next.eventLog.push({
          day: next.day,
          message: `${NB_ABILITY_DISPLAY[abilityId] ?? abilityId} activated!`,
          type: 'ability',
        });
      }

      const newDailyQuests = next.dailyQuests.map((q) => {
        if (q.questType === NB_DAILY_USE_ABILITY && !q.completed) {
          return { ...q, progress: q.progress + 1, completed: q.progress + 1 >= q.target };
        }
        return q;
      });
      next = { ...next, dailyQuests: newDailyQuests };

      next = applyXpGain(next, 5);
      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const nbClaimDailyQuest = useCallback((questIndex: number): Record<string, number> | null => {
    let reward: Record<string, number> | null = null;
    setState((prev) => {
      const quest = prev.dailyQuests[questIndex];
      if (!quest || !quest.completed || quest.claimed) return prev;

      const newDailyQuests = [...prev.dailyQuests];
      newDailyQuests[questIndex] = { ...quest, claimed: true };

      let next = addResources(prev, quest.reward);
      next = { ...next, dailyQuests: newDailyQuests, dailyQuestsCompleted: prev.dailyQuestsCompleted + 1 };
      next = applyXpGain(next, 50);

      next.eventLog.push({
        day: next.day,
        message: `Daily quest claimed! ${Object.entries(quest.reward).map(([k, v]) => `+${v} ${k}`).join(', ')}`,
        type: 'daily',
      });

      next = checkAchievements(next);
      reward = { ...quest.reward };
      return next;
    });
    return reward;
  }, [state]);

  const nbRechargeShields = useCallback((): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.shield >= prev.maxShield) return prev;
      const cost = { [NB_RES_PHOTON_ENERGY]: 20, [NB_RES_PLASMA_CORE]: 10 };
      if (!canAfford(prev, cost)) return prev;

      const boostAmount = 100 + (prev.sectors[NB_SECTOR_SHIELD_ARRAY]?.unlocked ? prev.sectors[NB_SECTOR_SHIELD_ARRAY].level * 20 : 0);
      let next = removeResources(prev, cost);
      const newShield = Math.min(prev.maxShield, prev.shield + boostAmount);
      next = { ...next, shield: newShield };

      next.eventLog.push({
        day: next.day,
        message: `Shields recharged! Shield now at ${newShield}/${prev.maxShield}.`,
        type: 'shield',
      });

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const nbRepairFleetShip = useCallback((shipInstanceId: string): boolean => {
    let success = false;
    setState((prev) => {
      const shipIdx = prev.fleet.findIndex((s) => s.id === shipInstanceId);
      if (shipIdx === -1) return prev;
      const ship = prev.fleet[shipIdx];
      if (ship.hp >= ship.maxHp) return prev;

      const cost = { [NB_RES_STELLAR_ORE]: 20, [NB_RES_COSMIC_DUST]: 10 };
      if (!canAfford(prev, cost)) return prev;

      const newFleet = [...prev.fleet];
      newFleet[shipIdx] = { ...ship, hp: Math.min(ship.maxHp, ship.hp + Math.floor(ship.maxHp * 0.4)) };

      let next = removeResources({ ...prev, fleet: newFleet }, cost);
      next.eventLog.push({
        day: next.day,
        message: `${ship.name} repaired.`,
        type: 'fleet',
      });

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const nbSetName = useCallback((name: string): void => {
    setState((prev) => ({ ...prev, bastionName: name }));
  }, [state]);

  const nbRerollSeed = useCallback((newSeed: number): void => {
    setState(() => createInitialState(newSeed));
  }, [state]);

  // ── Query helpers ───────────────────────────────────────────────────────

  const nbGetFleetSize = useCallback((): number => {
    return state.fleet.length;
  }, [state]);

  const nbGetShieldPercent = useCallback((): number => {
    if (state.maxShield <= 0) return 0;
    return Math.floor((state.shield / state.maxShield) * 100);
  }, [state]);

  const nbGetAllResources = useCallback((): Record<string, number> => {
    return { ...state.resources };
  }, [state]);

  const nbGetResourceAmount = useCallback((resourceId: string): number => {
    return state.resources[resourceId] ?? 0;
  }, [state]);

  const nbCanAfford = useCallback((costs: Record<string, number>): boolean => {
    for (const key of Object.keys(costs)) {
      if ((state.resources[key] ?? 0) < (costs[key] ?? 0)) return false;
    }
    return true;
  }, [state]);

  const nbGetBuiltStructures = useCallback((): string[] => {
    return Object.keys(state.structures).filter((s) => state.structures[s].built);
  }, [state]);

  const nbGetStructureLevel = useCallback((structureId: string): number => {
    return state.structures[structureId]?.level ?? 0;
  }, [state]);

  const nbGetUnlockedSectors = useCallback((): string[] => {
    return Object.keys(state.sectors).filter((s) => state.sectors[s].unlocked);
  }, [state]);

  const nbGetResearchCount = useCallback((): number => {
    return state.researchedTechs.length;
  }, [state]);

  const nbHasTech = useCallback((techId: string): boolean => {
    return state.researchedTechs.includes(techId);
  }, [state]);

  const nbGetFleetByRarity = useCallback((rarity: string): NbFleetShip[] => {
    return state.fleet.filter((s) => s.rarity === rarity).map((s) => ({ ...s }));
  }, [state]);

  const nbGetDockedShips = useCallback((): NbFleetShip[] => {
    return state.fleet.filter((s) => s.status === 'docked').map((s) => ({ ...s }));
  }, [state]);

  const nbGetShipById = useCallback((instanceId: string): NbFleetShip | null => {
    const ship = state.fleet.find((s) => s.id === instanceId);
    return ship ? { ...ship } : null;
  }, [state]);

  const nbGetActiveQuests = useCallback((): NbDailyQuest[] => {
    return state.dailyQuests.filter((q) => !q.completed).map((q) => ({ ...q }));
  }, [state]);

  const nbGetClaimableQuests = useCallback((): NbDailyQuest[] => {
    return state.dailyQuests.filter((q) => q.completed && !q.claimed).map((q) => ({ ...q }));
  }, [state]);

  const nbGetTotalFirepower = useCallback((): number => {
    return state.fleet.filter((s) => s.status === 'docked').reduce((sum, s) => sum + s.firepower, 0);
  }, [state]);

  const nbGetUnlockedAchievements = useCallback((): NbAchievementEntry[] => {
    return state.achievements.filter((a) => a.unlocked).map((a) => ({ ...a }));
  }, [state]);

  const nbIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return state.achievements.some((a) => a.achievementId === achievementId && a.unlocked);
  }, [state]);

  const nbGetRecentEvents = useCallback((count: number): NbEventLog[] => {
    return state.eventLog.slice(-count);
  }, [state]);

  const nbGetCurrentTitle = useCallback((): string => {
    return state.title;
  }, [state]);

  const nbGetXpProgress = useCallback((): { current: number; needed: number; percent: number } => {
    return {
      current: state.xp,
      needed: state.xpToNextLevel,
      percent: state.xpToNextLevel > 0 ? Math.floor((state.xp / state.xpToNextLevel) * 100) : 100,
    };
  }, [state]);

  const nbGetAbilityState = useCallback((abilityId: string): NbAbilityState | null => {
    const ab = state.abilities[abilityId];
    return ab ? { ...ab } : null;
  }, [state]);

  // ── Computed data via useMemo ──────────────────────────────────────────

  const fleetSummary = useMemo(() => {
    const s = state;
    const byRarity: Record<string, number> = {};
    for (const rarity of NB_ALL_RARITIES) {
      byRarity[rarity] = 0;
    }
    for (const ship of s.fleet) {
      if (byRarity[ship.rarity] !== undefined) {
        byRarity[ship.rarity] += 1;
      }
    }
    return {
      total: s.fleet.length,
      docked: s.fleet.filter((f) => f.status === 'docked').length,
      deployed: s.fleet.filter((f) => f.status !== 'docked').length,
      totalFirepower: s.fleet.reduce((sum, f) => sum + f.firepower, 0),
      byRarity,
    };
  }, [state]);

  const bastionStats = useMemo(() => {
    const s = state;
    return {
      day: s.day,
      cycle: s.cycle,
      level: s.level,
      title: s.title,
      bastionName: s.bastionName,
      shield: s.shield,
      maxShield: s.maxShield,
      shieldPercent: s.maxShield > 0 ? Math.floor((s.shield / s.maxShield) * 100) : 0,
      hasActiveStorm: s.hasActiveStorm,
      stormStrength: s.currentStormStrength,
      stormTimer: s.stormTimer,
      asteroidsDestroyed: s.asteroidsDestroyed,
      nebulaHarvested: s.nebulaHarvested,
      shipsBuilt: s.shipsBuilt,
      structuresBuilt: s.structuresBuilt,
      researchCount: s.researchedTechs.length,
      abilitiesUsed: s.abilitiesUsed,
      dailyQuestsCompleted: s.dailyQuestsCompleted,
    };
  }, [state]);

  const sectorSummary = useMemo(() => {
    const s = state;
    return NB_ALL_SECTORS.map((sec) => {
      const entry = s.sectors[sec];
      return {
        sectorId: sec,
        displayName: NB_SECTOR_DISPLAY[sec] ?? sec,
        unlocked: entry?.unlocked ?? false,
        level: entry?.level ?? 0,
        integrity: entry?.integrity ?? 0,
      };
    });
  }, [state]);

  const structureSummary = useMemo(() => {
    const s = state;
    return NB_ALL_STRUCTURES.map((struct) => {
      const entry = s.structures[struct];
      return {
        structureId: struct,
        displayName: NB_STRUCT_DISPLAY[struct] ?? struct,
        built: entry?.built ?? false,
        level: entry?.level ?? 0,
        integrity: entry?.integrity ?? 0,
      };
    });
  }, [state]);

  const techSummary = useMemo(() => {
    const s = state;
    return NB_ALL_TECHS.map((tech) => ({
      techId: tech,
      researched: s.researchedTechs.includes(tech),
      rarity: NB_TECH_RARITY[tech] ?? NB_RARITY_COMMON,
      cost: NB_TECH_COST[tech] ?? {},
    }));
  }, [state]);

  const abilitySummary = useMemo(() => {
    const s = state;
    return NB_ALL_ABILITIES.map((ab) => {
      const entry = s.abilities[ab];
      return {
        abilityId: ab,
        displayName: NB_ABILITY_DISPLAY[ab] ?? ab,
        cooldownMax: NB_ABILITY_COOLDOWN[ab] ?? 5,
        cooldownRemaining: entry?.cooldownRemaining ?? 0,
        totalUses: entry?.totalUses ?? 0,
        isReady: (entry?.cooldownRemaining ?? 1) <= 0,
      };
    });
  }, [state]);

  const resourceSummary = useMemo(() => {
    const s = state;
    const summary: Array<{ resourceId: string; amount: number }> = [];
    for (const res of NB_ALL_RESOURCES) {
      const amount = s.resources[res] ?? 0;
      if (amount > 0) {
        summary.push({ resourceId: res, amount });
      }
    }
    return summary.sort((a, b) => b.amount - a.amount);
  }, [state]);

  const achievementSummary = useMemo(() => {
    const s = state;
    const unlocked = s.achievements.filter((a) => a.unlocked).length;
    const total = s.achievements.length;
    return {
      unlocked,
      total,
      percent: total > 0 ? Math.floor((unlocked / total) * 100) : 0,
      entries: s.achievements.map((a) => ({
        ...a,
        def: NB_ACHIEVEMENT_DEFS[a.achievementId] ?? { name: a.achievementId, description: '', xp: 0 },
      })),
    };
  }, [state]);

  const titleProgression = useMemo(() => {
    const s = state;
    return NB_ALL_TITLES.map((title) => ({
      title,
      levelRequired: NB_TITLE_LEVEL_REQ[title],
      unlocked: s.level >= NB_TITLE_LEVEL_REQ[title],
      isCurrent: s.title === title,
    }));
  }, [state]);

  const dailyQuestSummary = useMemo(() => {
    const s = state;
    return s.dailyQuests.map((q) => ({
      ...q,
      displayName: NB_DAILY_DISPLAY[q.questType] ?? q.questType,
    }));
  }, [state]);

  const availableShipBuilds = useMemo(() => {
    const s = state;
    return NB_ALL_SHIPS
      .map((shipId) => ({
        shipId,
        data: NB_SHIP_DATA[shipId],
        canAfford: NB_SHIP_DATA[shipId]
          ? canAfford(s, NB_SHIP_DATA[shipId].cost)
          : false,
      }))
      .filter((entry) => entry.data !== undefined);
  }, [state]);

  const availableTechResearch = useMemo(() => {
    const s = state;
    return NB_ALL_TECHS
      .filter((t) => !s.researchedTechs.includes(t))
      .map((techId) => ({
        techId,
        rarity: NB_TECH_RARITY[techId] ?? NB_RARITY_COMMON,
        cost: NB_TECH_COST[techId] ?? {},
        canAfford: canAfford(s, NB_TECH_COST[techId] ?? {}),
      }));
  }, [state]);

  const defenseReadiness = useMemo(() => {
    const s = state;
    const dockedFirepower = s.fleet.filter((f) => f.status === 'docked').reduce((sum, f) => sum + f.firepower, 0);
    const shieldPercent = s.maxShield > 0 ? Math.floor((s.shield / s.maxShield) * 100) : 0;
    const deployedShips = s.fleet.filter((f) => f.status === 'defending').length;
    const hasShieldTech = s.researchedTechs.includes(NB_TECH_BASIC_SHIELDS);
    const hasNanoshields = s.researchedTechs.includes(NB_TECH_NANO_SHIELDS);
    const defenseLevel = Math.min(100, Math.floor(
      (shieldPercent * 0.3) +
      (dockedFirepower * 0.1) +
      (deployedShips * 5) +
      (hasShieldTech ? 10 : 0) +
      (hasNanoshields ? 15 : 0)
    ));

    return {
      level: defenseLevel,
      label: defenseLevel >= 80 ? 'Fortress' : defenseLevel >= 60 ? 'Strong' : defenseLevel >= 40 ? 'Moderate' : defenseLevel >= 20 ? 'Weak' : 'Critical',
      shieldPercent,
      dockedFirepower,
      deployedShips,
    };
  }, [state]);

  // ── Return API ─────────────────────────────────────────────────────────

  return {
    // State
    state,
    nbGetState,

    // Actions
    nbAdvanceDay,
    nbBuildShip,
    nbDispatchFleet,
    nbDestroyAsteroid,
    nbHarvestNebula,
    nbBuildStructure,
    nbUpgradeStructure,
    nbUnlockSector,
    nbUpgradeSector,
    nbResearchTech,
    nbUseAbility,
    nbClaimDailyQuest,
    nbRechargeShields,
    nbRepairFleetShip,
    nbSetName,
    nbRerollSeed,

    // Queries
    nbGetFleetSize,
    nbGetShieldPercent,
    nbGetAllResources,
    nbGetResourceAmount,
    nbCanAfford,
    nbGetBuiltStructures,
    nbGetStructureLevel,
    nbGetUnlockedSectors,
    nbGetResearchCount,
    nbHasTech,
    nbGetFleetByRarity,
    nbGetDockedShips,
    nbGetShipById,
    nbGetActiveQuests,
    nbGetClaimableQuests,
    nbGetTotalFirepower,
    nbGetUnlockedAchievements,
    nbIsAchievementUnlocked,
    nbGetRecentEvents,
    nbGetCurrentTitle,
    nbGetXpProgress,
    nbGetAbilityState,

    // Computed
    fleetSummary,
    bastionStats,
    sectorSummary,
    structureSummary,
    techSummary,
    abilitySummary,
    resourceSummary,
    achievementSummary,
    titleProgression,
    dailyQuestSummary,
    availableShipBuilds,
    availableTechResearch,
    defenseReadiness,
  };
}
