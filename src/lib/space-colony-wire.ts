import { useState, useCallback } from 'react';

// ─── Seeded PRNG ────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function (): number {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Module Constants ───────────────────────────────────────────────────────

export const SC_MODULE_COMMAND = 'command';
export const SC_MODULE_HABITAT = 'habitat';
export const SC_MODULE_GREENHOUSE = 'greenhouse';
export const SC_MODULE_MINING = 'mining';
export const SC_MODULE_RESEARCH = 'research';
export const SC_MODULE_POWER = 'power';
export const SC_MODULE_DOCKING = 'docking';
export const SC_MODULE_DEFENSE = 'defense';

export const SC_ALL_MODULES: string[] = [
  SC_MODULE_COMMAND,
  SC_MODULE_HABITAT,
  SC_MODULE_GREENHOUSE,
  SC_MODULE_MINING,
  SC_MODULE_RESEARCH,
  SC_MODULE_POWER,
  SC_MODULE_DOCKING,
  SC_MODULE_DEFENSE,
];

export const SC_MODULE_COST: Record<string, Record<string, number>> = {
  [SC_MODULE_COMMAND]: { iron: 100, titanium: 50, carbon: 30 },
  [SC_MODULE_HABITAT]: { iron: 80, titanium: 40, carbon: 50 },
  [SC_MODULE_GREENHOUSE]: { iron: 60, carbon: 40, water: 30 },
  [SC_MODULE_MINING]: { iron: 120, titanium: 30, helium3: 10 },
  [SC_MODULE_RESEARCH]: { iron: 70, titanium: 60, rareEarth: 20 },
  [SC_MODULE_POWER]: { iron: 90, titanium: 45, helium3: 25 },
  [SC_MODULE_DOCKING]: { iron: 100, titanium: 70, carbon: 20 },
  [SC_MODULE_DEFENSE]: { iron: 150, titanium: 80, rareEarth: 15 },
};

// ─── Technology Constants ───────────────────────────────────────────────────

export const SC_TECH_FTL_DRIVE = 'ftl_drive';
export const SC_TECH_TERRAFORMING = 'terraforming';
export const SC_TECH_QUANTUM_COMPUTING = 'quantum_computing';
export const SC_TECH_AI_SYSTEMS = 'ai_systems';
export const SC_TECH_SHIELD_GENERATOR = 'shield_generator';
export const SC_TECH_LIFE_SUPPORT = 'life_support';
export const SC_TECH_ASTEROID_MINING = 'asteroid_mining';
export const SC_TECH_CLOAKING = 'cloaking';
export const SC_TECH_ZERO_GRAVITY = 'zero_gravity';
export const SC_TECH_BIOENGINEERING = 'bioengineering';
export const SC_TECH_WARP_CORE = 'warp_core';
export const SC_TECH_NANO_FABRICATION = 'nano_fabrication';
export const SC_TECH_GRAVITON_BEAM = 'graviton_beam';
export const SC_TECH_DARK_MATTER_HARVEST = 'dark_matter_harvest';
export const SC_TECH_NEURAL_INTERFACE = 'neural_interface';
export const SC_TECH_PLASMA_WEAPON = 'plasma_weapon';
export const SC_TECH_ANTIMATTER_REACTOR = 'antimatter_reactor';
export const SC_TECH_HYPERCOMM = 'hypercomm';
export const SC_TECH_SINGULARITY_ENGINE = 'singularity_engine';
export const SC_TECH_XENO_LINGUISTICS = 'xeno_linguistics';
export const SC_TECH_DEEP_SCAN = 'deep_scan';
export const SC_TECH_STASIS_FIELD = 'stasis_field';
export const SC_TECH_ORBITAL_RAILGUN = 'orbital_railgun';
export const SC_TECH_AUTOMATION = 'automation';
export const SC_TECH_CORIUM_SHIELD = 'corium_shield';
export const SC_TECH_PSI_AMPLIFIER = 'psi_amplifier';
export const SC_TECH_BEACON_NETWORK = 'beacon_network';
export const SC_TECH_HYDROPONICS_ADV = 'hydroponics_adv';
export const SC_TECH_SUBSPACE_COMMS = 'subspace_comms';
export const SC_TECH_TRIBBLE_BREEDING = 'tribble_breeding';
export const SC_TECH_OMEGA_CANNON = 'omega_cannon';

export const SC_ALL_TECHS: string[] = [
  SC_TECH_FTL_DRIVE,
  SC_TECH_TERRAFORMING,
  SC_TECH_QUANTUM_COMPUTING,
  SC_TECH_AI_SYSTEMS,
  SC_TECH_SHIELD_GENERATOR,
  SC_TECH_LIFE_SUPPORT,
  SC_TECH_ASTEROID_MINING,
  SC_TECH_CLOAKING,
  SC_TECH_ZERO_GRAVITY,
  SC_TECH_BIOENGINEERING,
  SC_TECH_WARP_CORE,
  SC_TECH_NANO_FABRICATION,
  SC_TECH_GRAVITON_BEAM,
  SC_TECH_DARK_MATTER_HARVEST,
  SC_TECH_NEURAL_INTERFACE,
  SC_TECH_PLASMA_WEAPON,
  SC_TECH_ANTIMATTER_REACTOR,
  SC_TECH_HYPERCOMM,
  SC_TECH_SINGULARITY_ENGINE,
  SC_TECH_XENO_LINGUISTICS,
  SC_TECH_DEEP_SCAN,
  SC_TECH_STASIS_FIELD,
  SC_TECH_ORBITAL_RAILGUN,
  SC_TECH_AUTOMATION,
  SC_TECH_CORIUM_SHIELD,
  SC_TECH_PSI_AMPLIFIER,
  SC_TECH_BEACON_NETWORK,
  SC_TECH_HYDROPONICS_ADV,
  SC_TECH_SUBSPACE_COMMS,
  SC_TECH_TRIBBLE_BREEDING,
  SC_TECH_OMEGA_CANNON,
];

export const SC_RARITY_COMMON = 'common';
export const SC_RARITY_UNCOMMON = 'uncommon';
export const SC_RARITY_RARE = 'rare';
export const SC_RARITY_EPIC = 'epic';
export const SC_RARITY_LEGENDARY = 'legendary';

export const SC_ALL_RARITIES: string[] = [
  SC_RARITY_COMMON,
  SC_RARITY_UNCOMMON,
  SC_RARITY_RARE,
  SC_RARITY_EPIC,
  SC_RARITY_LEGENDARY,
];

export const SC_TECH_RARITY: Record<string, string> = {
  [SC_TECH_LIFE_SUPPORT]: SC_RARITY_COMMON,
  [SC_TECH_ASTEROID_MINING]: SC_RARITY_COMMON,
  [SC_TECH_AUTOMATION]: SC_RARITY_COMMON,
  [SC_TECH_HYDROPONICS_ADV]: SC_RARITY_COMMON,
  [SC_TECH_DEEP_SCAN]: SC_RARITY_COMMON,
  [SC_TECH_FTL_DRIVE]: SC_RARITY_UNCOMMON,
  [SC_TECH_TERRAFORMING]: SC_RARITY_UNCOMMON,
  [SC_TECH_AI_SYSTEMS]: SC_RARITY_UNCOMMON,
  [SC_TECH_SHIELD_GENERATOR]: SC_RARITY_UNCOMMON,
  [SC_TECH_ZERO_GRAVITY]: SC_RARITY_UNCOMMON,
  [SC_TECH_BIOENGINEERING]: SC_RARITY_UNCOMMON,
  [SC_TECH_QUANTUM_COMPUTING]: SC_RARITY_RARE,
  [SC_TECH_CLOAKING]: SC_RARITY_RARE,
  [SC_TECH_GRAVITON_BEAM]: SC_RARITY_RARE,
  [SC_TECH_NEURAL_INTERFACE]: SC_RARITY_RARE,
  [SC_TECH_HYPERCOMM]: SC_RARITY_RARE,
  [SC_TECH_WARP_CORE]: SC_RARITY_EPIC,
  [SC_TECH_NANO_FABRICATION]: SC_RARITY_EPIC,
  [SC_TECH_DARK_MATTER_HARVEST]: SC_RARITY_EPIC,
  [SC_TECH_PLASMA_WEAPON]: SC_RARITY_EPIC,
  [SC_TECH_ANTIMATTER_REACTOR]: SC_RARITY_EPIC,
  [SC_TECH_SINGULARITY_ENGINE]: SC_RARITY_EPIC,
  [SC_TECH_XENO_LINGUISTICS]: SC_RARITY_LEGENDARY,
  [SC_TECH_STASIS_FIELD]: SC_RARITY_LEGENDARY,
  [SC_TECH_ORBITAL_RAILGUN]: SC_RARITY_LEGENDARY,
  [SC_TECH_CORIUM_SHIELD]: SC_RARITY_LEGENDARY,
  [SC_TECH_PSI_AMPLIFIER]: SC_RARITY_LEGENDARY,
  [SC_TECH_BEACON_NETWORK]: SC_RARITY_LEGENDARY,
  [SC_TECH_SUBSPACE_COMMS]: SC_RARITY_LEGENDARY,
  [SC_TECH_TRIBBLE_BREEDING]: SC_RARITY_LEGENDARY,
  [SC_TECH_OMEGA_CANNON]: SC_RARITY_LEGENDARY,
};

export const SC_TECH_COST: Record<string, Record<string, number>> = {
  [SC_TECH_LIFE_SUPPORT]: { iron: 30, carbon: 20 },
  [SC_TECH_ASTEROID_MINING]: { iron: 40, titanium: 15 },
  [SC_TECH_AUTOMATION]: { iron: 25, carbon: 30 },
  [SC_TECH_HYDROPONICS_ADV]: { iron: 20, water: 25, carbon: 15 },
  [SC_TECH_DEEP_SCAN]: { iron: 35, helium3: 10 },
  [SC_TECH_FTL_DRIVE]: { titanium: 60, helium3: 30, rareEarth: 15 },
  [SC_TECH_TERRAFORMING]: { iron: 50, water: 40, carbon: 25 },
  [SC_TECH_AI_SYSTEMS]: { titanium: 40, rareEarth: 20, carbon: 15 },
  [SC_TECH_SHIELD_GENERATOR]: { titanium: 50, helium3: 25, rareEarth: 10 },
  [SC_TECH_ZERO_GRAVITY]: { titanium: 35, helium3: 20 },
  [SC_TECH_BIOENGINEERING]: { carbon: 40, water: 20, rareEarth: 15 },
  [SC_TECH_QUANTUM_COMPUTING]: { titanium: 70, rareEarth: 35, helium3: 20 },
  [SC_TECH_CLOAKING]: { titanium: 60, helium3: 40, rareEarth: 25 },
  [SC_TECH_GRAVITON_BEAM]: { titanium: 80, helium3: 50, rareEarth: 30 },
  [SC_TECH_NEURAL_INTERFACE]: { titanium: 50, carbon: 30, rareEarth: 40 },
  [SC_TECH_HYPERCOMM]: { titanium: 45, helium3: 30, rareEarth: 20 },
  [SC_TECH_WARP_CORE]: { titanium: 100, helium3: 60, rareEarth: 50 },
  [SC_TECH_NANO_FABRICATION]: { titanium: 80, rareEarth: 60, carbon: 30 },
  [SC_TECH_DARK_MATTER_HARVEST]: { helium3: 100, rareEarth: 70, titanium: 50 },
  [SC_TECH_PLASMA_WEAPON]: { titanium: 90, helium3: 50, rareEarth: 40 },
  [SC_TECH_ANTIMATTER_REACTOR]: { helium3: 120, rareEarth: 80, titanium: 60 },
  [SC_TECH_SINGULARITY_ENGINE]: { helium3: 150, rareEarth: 100, titanium: 80 },
  [SC_TECH_XENO_LINGUISTICS]: { rareEarth: 100, carbon: 50, helium3: 40 },
  [SC_TECH_STASIS_FIELD]: { rareEarth: 90, helium3: 80, titanium: 70 },
  [SC_TECH_ORBITAL_RAILGUN]: { titanium: 120, iron: 80, rareEarth: 50 },
  [SC_TECH_CORIUM_SHIELD]: { rareEarth: 110, titanium: 90, helium3: 60 },
  [SC_TECH_PSI_AMPLIFIER]: { rareEarth: 130, carbon: 60, helium3: 70 },
  [SC_TECH_BEACON_NETWORK]: { titanium: 80, helium3: 90, rareEarth: 60 },
  [SC_TECH_SUBSPACE_COMMS]: { helium3: 100, rareEarth: 80, titanium: 50 },
  [SC_TECH_TRIBBLE_BREEDING]: { carbon: 60, water: 40, rareEarth: 30 },
  [SC_TECH_OMEGA_CANNON]: { titanium: 200, helium3: 150, rareEarth: 120 },
};

// ─── Planet Types ───────────────────────────────────────────────────────────

export const SC_PLANET_EARTH_LIKE = 'earth_like';
export const SC_PLANET_MARS = 'mars';
export const SC_PLANET_EUROPA = 'europa';
export const SC_PLANET_TITAN = 'titan';
export const SC_PLANET_PROXIMA_B = 'proxima_b';
export const SC_PLANET_KEPLER_442B = 'kepler_442b';
export const SC_PLANET_VENUS = 'venus';
export const SC_PLANET_ICE_WORLD = 'ice_world';

export const SC_ALL_PLANETS: string[] = [
  SC_PLANET_EARTH_LIKE,
  SC_PLANET_MARS,
  SC_PLANET_EUROPA,
  SC_PLANET_TITAN,
  SC_PLANET_PROXIMA_B,
  SC_PLANET_KEPLER_442B,
  SC_PLANET_VENUS,
  SC_PLANET_ICE_WORLD,
];

export const SC_PLANET_BONUSES: Record<string, Record<string, number>> = {
  [SC_PLANET_EARTH_LIKE]: { food: 1.5, water: 1.4, oxygen: 1.3 },
  [SC_PLANET_MARS]: { iron: 1.6, titanium: 1.4, carbon: 1.3 },
  [SC_PLANET_EUROPA]: { water: 2.0, helium3: 1.3, ice: 1.5 },
  [SC_PLANET_TITAN]: { methane: 2.0, carbon: 1.5, titanium: 1.2 },
  [SC_PLANET_PROXIMA_B]: { solar: 1.5, rareEarth: 1.3, food: 1.2 },
  [SC_PLANET_KEPLER_442B]: { food: 1.8, water: 1.5, rareEarth: 1.2 },
  [SC_PLANET_VENUS]: { carbon: 2.0, solar: 1.8, titanium: 1.3 },
  [SC_PLANET_ICE_WORLD]: { ice: 2.5, water: 1.6, helium3: 1.4 },
};

export const SC_PLANET_DIFFICULTY: Record<string, number> = {
  [SC_PLANET_EARTH_LIKE]: 1,
  [SC_PLANET_MARS]: 2,
  [SC_PLANET_EUROPA]: 3,
  [SC_PLANET_TITAN]: 3,
  [SC_PLANET_PROXIMA_B]: 4,
  [SC_PLANET_KEPLER_442B]: 4,
  [SC_PLANET_VENUS]: 5,
  [SC_PLANET_ICE_WORLD]: 5,
};

// ─── Resource Constants ─────────────────────────────────────────────────────

export const SC_RES_IRON = 'iron';
export const SC_RES_TITANIUM = 'titanium';
export const SC_RES_HELIUM3 = 'helium3';
export const SC_RES_WATER = 'water';
export const SC_RES_CARBON = 'carbon';
export const SC_RES_RARE_EARTH = 'rareEarth';
export const SC_RES_FOOD = 'food';
export const SC_RES_OXYGEN = 'oxygen';
export const SC_RES_ENERGY = 'energy';
export const SC_RES_ICE = 'ice';
export const SC_RES_METHANE = 'methane';
export const SC_RES_SOLAR = 'solar';
export const SC_RES_URANIUM = 'uranium';
export const SC_RES_PLATINUM = 'platinum';
export const SC_RES_COPPER = 'copper';
export const SC_RES_SILICON = 'silicon';
export const SC_RES_ALUMINUM = 'aluminum';
export const SC_RES_GOLD = 'gold';
export const SC_RES_DIAMOND = 'diamond';
export const SC_RES_DARK_MATTER = 'darkMatter';
export const SC_RES_ANTIMATTER = 'antimatter';
export const SC_RES_NANOBOTS = 'nanobots';
export const SC_RES_BIOMASS = 'biomass';
export const SC_RES_DEUTERIUM = 'deuterium';
export const SC_RES_XENON = 'xenon';
export const SC_RES_TRITIUM = 'tritium';
export const SC_RES_PLASMA = 'plasma';

export const SC_ALL_RESOURCES: string[] = [
  SC_RES_IRON,
  SC_RES_TITANIUM,
  SC_RES_HELIUM3,
  SC_RES_WATER,
  SC_RES_CARBON,
  SC_RES_RARE_EARTH,
  SC_RES_FOOD,
  SC_RES_OXYGEN,
  SC_RES_ENERGY,
  SC_RES_ICE,
  SC_RES_METHANE,
  SC_RES_SOLAR,
  SC_RES_URANIUM,
  SC_RES_PLATINUM,
  SC_RES_COPPER,
  SC_RES_SILICON,
  SC_RES_ALUMINUM,
  SC_RES_GOLD,
  SC_RES_DIAMOND,
  SC_RES_DARK_MATTER,
  SC_RES_ANTIMATTER,
  SC_RES_NANOBOTS,
  SC_RES_BIOMASS,
  SC_RES_DEUTERIUM,
  SC_RES_XENON,
  SC_RES_TRITIUM,
  SC_RES_PLASMA,
];

// ─── Crew Roles ─────────────────────────────────────────────────────────────

export const SC_ROLE_COMMANDER = 'commander';
export const SC_ROLE_SCIENTIST = 'scientist';
export const SC_ROLE_ENGINEER = 'engineer';
export const SC_ROLE_MEDIC = 'medic';
export const SC_ROLE_PILOT = 'pilot';
export const SC_ROLE_MINER = 'miner';
export const SC_ROLE_BOTANIST = 'botanist';
export const SC_ROLE_SECURITY = 'security';

export const SC_ALL_ROLES: string[] = [
  SC_ROLE_COMMANDER,
  SC_ROLE_SCIENTIST,
  SC_ROLE_ENGINEER,
  SC_ROLE_MEDIC,
  SC_ROLE_PILOT,
  SC_ROLE_MINER,
  SC_ROLE_BOTANIST,
  SC_ROLE_SECURITY,
];

export const SC_ROLE_SKILL_BONUS: Record<string, Record<string, number>> = {
  [SC_ROLE_COMMANDER]: { morale: 1.2, research: 1.05 },
  [SC_ROLE_SCIENTIST]: { research: 1.3, energy: 0.95 },
  [SC_ROLE_ENGINEER]: { buildSpeed: 1.3, repair: 1.25 },
  [SC_ROLE_MEDIC]: { health: 1.3, food: 1.05 },
  [SC_ROLE_PILOT]: { travelSpeed: 1.3, dodgeChance: 1.2 },
  [SC_ROLE_MINER]: { mining: 1.4, titanium: 1.1 },
  [SC_ROLE_BOTANIST]: { food: 1.4, oxygen: 1.15 },
  [SC_ROLE_SECURITY]: { defense: 1.4, morale: 1.05 },
};

// ─── Alien Species ──────────────────────────────────────────────────────────

export const SC_ALIEN_ZYTHON = 'zython';
export const SC_ALIEN_KRELLIX = 'krellix';
export const SC_ALIEN_VELDARI = 'veldari';
export const SC_ALIEN_MORPHIANS = 'morphians';
export const SC_ALIEN_THRALL = 'thrall';
export const SC_ALIEN_UMBRAI = 'umbral';
export const SC_ALIEN_CELESTINE = 'celestine';
export const SC_ALIEN_PHAGE = 'phage';
export const SC_ALION_CRUSTARIAN = 'crustarian';
export const SC_ALIEN_SYLVANI = 'sylvani';
export const SC_ALIEN_FORGEMASTER = 'forgemaster';
export const SC_ALIEN_ETHERWEAVER = 'etherweaver';
export const SC_ALION_VOIDWALKER = 'voidwalker';
export const SC_ALIEN_STARWHISPER = 'starwhisper';
export const SC_ALIEN_TERRAVORE = 'terravore';
export const SC_ALIEN_ICONIAN = 'iconian';
export const SC_ALIEN_NEXUS_SWARM = 'nexus_swarm';
export const SC_ALIEN_PULSARI = 'pulsari';
export const SC_ALIEN_GRAVITUS = 'gravitus';
export const SC_ALIEN_LUMINARI = 'luminari';
export const SC_ALIEN_OMNISCIENT = 'omniscient';

export const SC_ALL_ALIENS: string[] = [
  SC_ALIEN_ZYTHON,
  SC_ALIEN_KRELLIX,
  SC_ALIEN_VELDARI,
  SC_ALIEN_MORPHIANS,
  SC_ALIEN_THRALL,
  SC_ALIEN_UMBRAI,
  SC_ALIEN_CELESTINE,
  SC_ALIEN_PHAGE,
  SC_ALION_CRUSTARIAN,
  SC_ALIEN_SYLVANI,
  SC_ALIEN_FORGEMASTER,
  SC_ALIEN_ETHERWEAVER,
  SC_ALION_VOIDWALKER,
  SC_ALIEN_STARWHISPER,
  SC_ALIEN_TERRAVORE,
  SC_ALIEN_ICONIAN,
  SC_ALIEN_NEXUS_SWARM,
  SC_ALIEN_PULSARI,
  SC_ALIEN_GRAVITUS,
  SC_ALIEN_LUMINARI,
  SC_ALIEN_OMNISCIENT,
];

export const SC_ALIEN_DISPOSITION: Record<string, string> = {
  [SC_ALIEN_ZYTHON]: 'hostile',
  [SC_ALIEN_KRELLIX]: 'neutral',
  [SC_ALIEN_VELDARI]: 'friendly',
  [SC_ALIEN_MORPHIANS]: 'mysterious',
  [SC_ALIEN_THRALL]: 'hostile',
  [SC_ALIEN_UMBRAI]: 'enigmatic',
  [SC_ALIEN_CELESTINE]: 'peaceful',
  [SC_ALIEN_PHAGE]: 'parasitic',
  [SC_ALION_CRUSTARIAN]: 'neutral',
  [SC_ALIEN_SYLVANI]: 'friendly',
  [SC_ALIEN_FORGEMASTER]: 'trade_oriented',
  [SC_ALIEN_ETHERWEAVER]: 'mysterious',
  [SC_ALION_VOIDWALKER]: 'enigmatic',
  [SC_ALIEN_STARWHISPER]: 'peaceful',
  [SC_ALIEN_TERRAVORE]: 'hostile',
  [SC_ALIEN_ICONIAN]: 'ancient',
  [SC_ALIEN_NEXUS_SWARM]: 'hostile',
  [SC_ALIEN_PULSARI]: 'trade_oriented',
  [SC_ALIEN_GRAVITUS]: 'neutral',
  [SC_ALIEN_LUMINARI]: 'friendly',
  [SC_ALIEN_OMNISCIENT]: 'ancient',
};

// ─── Fleet Types ────────────────────────────────────────────────────────────

export const SC_FLEET_SCOUT = 'scout';
export const SC_FLEET_FREIGHTER = 'freighter';
export const SC_FLEET_WARSHIP = 'warship';

export const SC_ALL_FLEET_TYPES: string[] = [
  SC_FLEET_SCOUT,
  SC_FLEET_FREIGHTER,
  SC_FLEET_WARSHIP,
];

export const SC_FLEET_STATS: Record<string, { hp: number; attack: number; speed: number; cargo: number; cost: Record<string, number> }> = {
  [SC_FLEET_SCOUT]: {
    hp: 50,
    attack: 10,
    speed: 5,
    cargo: 20,
    cost: { iron: 40, titanium: 20, helium3: 10 },
  },
  [SC_FLEET_FREIGHTER]: {
    hp: 100,
    attack: 5,
    speed: 2,
    cargo: 100,
    cost: { iron: 80, titanium: 40, carbon: 30 },
  },
  [SC_FLEET_WARSHIP]: {
    hp: 200,
    attack: 50,
    speed: 3,
    cargo: 40,
    cost: { titanium: 100, rareEarth: 40, helium3: 30 },
  },
};

// ─── NPC Constants ──────────────────────────────────────────────────────────

export const SC_NPC_ADMIRAL = 'admiral';
export const SC_NPC_CHIEF_SCIENTIST = 'chief_scientist';
export const SC_NPC_ENGINEER = 'engineer';
export const SC_NPC_DIPLOMAT = 'diplomat';
export const SC_NPC_TRADER = 'trader';
export const SC_NPC_XENO_BIOLOGIST = 'xeno_biologist';

export const SC_ALL_NPCS: string[] = [
  SC_NPC_ADMIRAL,
  SC_NPC_CHIEF_SCIENTIST,
  SC_NPC_ENGINEER,
  SC_NPC_DIPLOMAT,
  SC_NPC_TRADER,
  SC_NPC_XENO_BIOLOGIST,
];

export const SC_NPC_DATA: Record<string, { name: string; role: string; specialty: string; greeting: string }> = {
  [SC_NPC_ADMIRAL]: {
    name: 'Admiral Valeria Orion',
    role: SC_ROLE_COMMANDER,
    specialty: 'fleet_strategy',
    greeting: 'The stars await your command, Commander.',
  },
  [SC_NPC_CHIEF_SCIENTIST]: {
    name: 'Dr. Elara Voss',
    role: SC_ROLE_SCIENTIST,
    specialty: 'technology',
    greeting: 'Fascinating! I have new research proposals for you.',
  },
  [SC_NPC_ENGINEER]: {
    name: 'Chief Engineer Marcus Rex',
    role: SC_ROLE_ENGINEER,
    specialty: 'construction',
    greeting: 'The colony needs maintenance. Let me help.',
  },
  [SC_NPC_DIPLOMAT]: {
    name: 'Ambassador Lyra Nexis',
    role: SC_ROLE_COMMANDER,
    specialty: 'alien_relations',
    greeting: 'First contact protocols are ready.',
  },
  [SC_NPC_TRADER]: {
    name: 'Kael the Merchant',
    role: SC_ROLE_COMMANDER,
    specialty: 'trade',
    greeting: 'Looking to trade? I have the best deals in the sector.',
  },
  [SC_NPC_XENO_BIOLOGIST]: {
    name: 'Prof. Zara Morphic',
    role: SC_ROLE_SCIENTIST,
    specialty: 'alien_life',
    greeting: 'I have discovered something extraordinary...',
  },
};

// ─── Quest Constants ────────────────────────────────────────────────────────

export const SC_QUEST_COLONIZE = 'colonize';
export const SC_QUEST_FIRST_CONTACT = 'first_contact';
export const SC_QUEST_BUILD_DEFENSES = 'build_defenses';
export const SC_QUEST_SURVEY_ASTEROID = 'survey_asteroid';
export const SC_QUEST_TRADE_ROUTE = 'trade_route';
export const SC_QUEST_RESEARCH_BREAKTHROUGH = 'research_breakthrough';
export const SC_QUEST_RESCUE_CREW = 'rescue_crew';
export const SC_QUEST_DEFEAT_RAIDERS = 'defeat_raiders';
export const SC_QUEST_EXPAND_TERRITORY = 'expand_territory';
export const SC_QUEST_FIND_ARTIFACT = 'find_artifact';

export const SC_ALL_QUESTS: string[] = [
  SC_QUEST_COLONIZE,
  SC_QUEST_FIRST_CONTACT,
  SC_QUEST_BUILD_DEFENSES,
  SC_QUEST_SURVEY_ASTEROID,
  SC_QUEST_TRADE_ROUTE,
  SC_QUEST_RESEARCH_BREAKTHROUGH,
  SC_QUEST_RESCUE_CREW,
  SC_QUEST_DEFEAT_RAIDERS,
  SC_QUEST_EXPAND_TERRITORY,
  SC_QUEST_FIND_ARTIFACT,
];

export const SC_QUEST_REWARD: Record<string, { xp: number; resources: Record<string, number>; unlock?: string }> = {
  [SC_QUEST_COLONIZE]: { xp: 100, resources: { iron: 200, carbon: 100 } },
  [SC_QUEST_FIRST_CONTACT]: { xp: 150, resources: { rareEarth: 30, helium3: 20 } },
  [SC_QUEST_BUILD_DEFENSES]: { xp: 120, resources: { titanium: 150, iron: 100 } },
  [SC_QUEST_SURVEY_ASTEROID]: { xp: 80, resources: { titanium: 80, rareEarth: 15 } },
  [SC_QUEST_TRADE_ROUTE]: { xp: 130, resources: { gold: 20, platinum: 15 } },
  [SC_QUEST_RESEARCH_BREAKTHROUGH]: { xp: 200, resources: { rareEarth: 50, helium3: 30 } },
  [SC_QUEST_RESCUE_CREW]: { xp: 160, resources: { food: 100, oxygen: 80 } },
  [SC_QUEST_DEFEAT_RAIDERS]: { xp: 180, resources: { titanium: 100, rareEarth: 25 } },
  [SC_QUEST_EXPAND_TERRITORY]: { xp: 140, resources: { iron: 300, carbon: 150 } },
  [SC_QUEST_FIND_ARTIFACT]: { xp: 250, resources: { rareEarth: 60, darkMatter: 5 } },
};

// ─── Achievement Constants ──────────────────────────────────────────────────

export const SC_ACH_FIRST_COLONY = 'first_colony';
export const SC_ACH_TECH_PIONEER = 'tech_pioneer';
export const SC_ACH_MASTER_BUILDER = 'master_builder';
export const SC_ACH_FLEET_ADMIRAL = 'fleet_admiral';
export const SC_ACH_DIPLOMAT = 'diplomat_ach';
export const SC_ACH_ASTEROID_MINER = 'asteroid_miner';
export const SC_ACH_ALIEN_FRIEND = 'alien_friend';
export const SC_ACH_QUEST_MASTER = 'quest_master';
export const SC_ACH_RESOURCE_BARON = 'resource_baron';
export const SC_ACH_TECH_GENIUS = 'tech_genius';
export const SC_ACH_SURVIVOR = 'survivor';
export const SC_ACH_EXPLORER = 'explorer';
export const SC_ACH_WAR_HERO = 'war_hero';
export const SC_ACH_COLONY_PROSPERITY = 'colony_prosperity';
export const SC_ACH_GALACTIC_LEGEND = 'galactic_legend';

export const SC_ALL_ACHIEVEMENTS: string[] = [
  SC_ACH_FIRST_COLONY,
  SC_ACH_TECH_PIONEER,
  SC_ACH_MASTER_BUILDER,
  SC_ACH_FLEET_ADMIRAL,
  SC_ACH_DIPLOMAT,
  SC_ACH_ASTEROID_MINER,
  SC_ACH_ALIEN_FRIEND,
  SC_ACH_QUEST_MASTER,
  SC_ACH_RESOURCE_BARON,
  SC_ACH_TECH_GENIUS,
  SC_ACH_SURVIVOR,
  SC_ACH_EXPLORER,
  SC_ACH_WAR_HERO,
  SC_ACH_COLONY_PROSPERITY,
  SC_ACH_GALACTIC_LEGEND,
];

export const SC_ACHIEVEMENT_DEFS: Record<string, { name: string; description: string; xp: number }> = {
  [SC_ACH_FIRST_COLONY]: { name: 'First Colony', description: 'Build your first colony module', xp: 50 },
  [SC_ACH_TECH_PIONEER]: { name: 'Tech Pioneer', description: 'Research 5 technologies', xp: 100 },
  [SC_ACH_MASTER_BUILDER]: { name: 'Master Builder', description: 'Build all 8 module types', xp: 200 },
  [SC_ACH_FLEET_ADMIRAL]: { name: 'Fleet Admiral', description: 'Own 5 ships', xp: 150 },
  [SC_ACH_DIPLOMAT]: { name: 'Diplomat', description: 'Establish relations with 5 alien species', xp: 120 },
  [SC_ACH_ASTEROID_MINER]: { name: 'Asteroid Miner', description: 'Mine 10 asteroids', xp: 100 },
  [SC_ACH_ALIEN_FRIEND]: { name: 'Alien Friend', description: 'Reach Allied status with any species', xp: 180 },
  [SC_ACH_QUEST_MASTER]: { name: 'Quest Master', description: 'Complete 10 quests', xp: 250 },
  [SC_ACH_RESOURCE_BARON]: { name: 'Resource Baron', description: 'Accumulate 1000 of any resource', xp: 130 },
  [SC_ACH_TECH_GENIUS]: { name: 'Tech Genius', description: 'Research 15 technologies', xp: 300 },
  [SC_ACH_SURVIVOR]: { name: 'Survivor', description: 'Survive 30 days', xp: 160 },
  [SC_ACH_EXPLORER]: { name: 'Explorer', description: 'Visit all 8 planet types', xp: 200 },
  [SC_ACH_WAR_HERO]: { name: 'War Hero', description: 'Win 5 space battles', xp: 200 },
  [SC_ACH_COLONY_PROSPERITY]: { name: 'Colony Prosperity', description: 'Reach 100 morale', xp: 220 },
  [SC_ACH_GALACTIC_LEGEND]: { name: 'Galactic Legend', description: 'Reach Level 50', xp: 500 },
};

// ─── Title Constants ────────────────────────────────────────────────────────

export const SC_TITLE_CADET = 'Cadet';
export const SC_TITLE_LIEUTENANT = 'Lieutenant';
export const SC_TITLE_CAPTAIN = 'Captain';
export const SC_TITLE_COMMODORE = 'Commodore';
export const SC_TITLE_ADMIRAL_TITLE = 'Admiral';
export const SC_TITLE_FLEET_LORD = 'Fleet Lord';
export const SC_TITLE_SECTOR_GOVERNOR = 'Sector Governor';
export const SC_TITLE_GALACTIC_EMPEROR = 'Galactic Emperor';

export const SC_ALL_TITLES: string[] = [
  SC_TITLE_CADET,
  SC_TITLE_LIEUTENANT,
  SC_TITLE_CAPTAIN,
  SC_TITLE_COMMODORE,
  SC_TITLE_ADMIRAL_TITLE,
  SC_TITLE_FLEET_LORD,
  SC_TITLE_SECTOR_GOVERNOR,
  SC_TITLE_GALACTIC_EMPEROR,
];

export const SC_TITLE_LEVEL_REQ: Record<string, number> = {
  [SC_TITLE_CADET]: 1,
  [SC_TITLE_LIEUTENANT]: 5,
  [SC_TITLE_CAPTAIN]: 12,
  [SC_TITLE_COMMODORE]: 20,
  [SC_TITLE_ADMIRAL_TITLE]: 30,
  [SC_TITLE_FLEET_LORD]: 37,
  [SC_TITLE_SECTOR_GOVERNOR]: 44,
  [SC_TITLE_GALACTIC_EMPEROR]: 50,
};

// ─── Misc Constants ─────────────────────────────────────────────────────────

export const SC_MAX_LEVEL = 50;
export const SC_MAX_MORALE = 100;
export const SC_MAX_HULL_INTEGRITY = 100;
export const SC_BASE_XP_PER_LEVEL = 200;
export const SC_XP_SCALE_FACTOR = 1.5;
export const SC_STARTING_CREW = 5;
export const SC_MAX_CREW = 50;
export const SC_MAX_FLEET_SIZE = 20;
export const SC_MINING_COOLDOWN = 3;
export const SC_TRADE_TAX = 0.1;
export const SC_DIPLOMACY_LEVELS = ['unknown', 'hostile', 'neutral', 'friendly', 'allied'];
export const SC_EVENT_RAIDERS = 'raiders';
export const SC_EVENT_METEOR_SHOWER = 'meteor_shower';
export const SC_EVENT_ALIEN_SIGNAL = 'alien_signal';
export const SC_EVENT_SUPPLY_DROP = 'supply_drop';
export const SC_EVENT_SOLAR_FLARE = 'solar_flare';
export const SC_EVENT_MUTINY = 'mutiny';
export const SC_EVENT_PLAGUE = 'plague';
export const SC_EVENT_DISCOVERY = 'discovery';

// ─── Types & Interfaces ─────────────────────────────────────────────────────

interface ScCrewMember {
  id: string;
  name: string;
  role: string;
  health: number;
  morale: number;
  skill: number;
  assignedModule: string | null;
  daysSinceLastRested: number;
}

interface ScFleetShip {
  id: string;
  name: string;
  type: string;
  hp: number;
  maxHp: number;
  status: 'docked' | 'patrolling' | 'trading' | 'exploring' | 'combat';
  missionTimer: number;
  cargo: Record<string, number>;
}

interface ScDiplomacyEntry {
  speciesId: string;
  status: string;
  tradeOpen: boolean;
  meetingsCount: number;
  lastMeetingDay: number;
}

interface ScQuestProgress {
  questId: string;
  status: 'available' | 'active' | 'completed' | 'failed';
  progress: number;
  target: number;
  startedDay: number;
  completedDay: number | null;
}

interface ScAchievementEntry {
  achievementId: string;
  unlocked: boolean;
  unlockedDay: number | null;
}

interface ScDailyState {
  day: number;
  supplyDropClaimed: boolean;
  alienSignalIntercepted: boolean;
  eventsEncountered: string[];
}

interface ScEventLog {
  day: number;
  message: string;
  type: string;
}

interface ScTradeOffer {
  offerResources: Record<string, number>;
  requestResources: Record<string, number>;
  alienSpecies: string;
  expiresDay: number;
}

interface ScBattleResult {
  victory: boolean;
  enemyFleet: string;
  damageTaken: number;
  enemyDestroyed: boolean;
  loot: Record<string, number>;
}

interface ScSpaceColonyState {
  seed: number;
  rng: number;
  day: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXpEarned: number;
  title: string;
  colonyName: string;
  currentPlanet: string;
  visitedPlanets: string[];
  resources: Record<string, number>;
  modules: Record<string, { built: boolean; level: number; integrity: number }>;
  builtModules: string[];
  researchedTechs: string[];
  crew: ScCrewMember[];
  fleet: ScFleetShip[];
  diplomacy: ScDiplomacyEntry[];
  quests: ScQuestProgress[];
  achievements: ScAchievementEntry[];
  morale: number;
  hullIntegrity: number;
  dailyState: ScDailyState;
  eventLog: ScEventLog[];
  activeTrades: ScTradeOffer[];
  battlesWon: number;
  asteroidsMined: number;
  questsCompleted: number;
  aliensContacted: number;
  totalDaysSurvived: number;
  totalResourcesMined: number;
}

// ─── Helper: XP calculation ─────────────────────────────────────────────────

function scCalculateXpToNext(level: number): number {
  return Math.floor(SC_BASE_XP_PER_LEVEL * Math.pow(SC_XP_SCALE_FACTOR, level - 1));
}

// ─── Helper: generate crew name ─────────────────────────────────────────────

const SC_FIRST_NAMES = [
  'Aria', 'Blaze', 'Caelum', 'Drift', 'Echo', 'Flux', 'Gale', 'Helix',
  'Ion', 'Jett', 'Kira', 'Lux', 'Mira', 'Nova', 'Orion', 'Pulse',
  'Quasar', 'Raze', 'Sol', 'Terra', 'Uma', 'Vex', 'Wren', 'Xara',
  'Yuki', 'Zane', 'Atlas', 'Brio', 'Cryo', 'Dax', 'Elara', 'Finn',
];

const SC_LAST_NAMES = [
  'Voss', 'Rex', 'Orion', 'Nexis', 'Morphic', 'Stark', 'Pierce', 'Quill',
  'Draven', 'Mercer', 'Vale', 'Stone', 'Flint', 'Cross', 'Knight', 'Blaze',
  'Wolf', 'Hale', 'Core', 'Forge', 'Wave', 'Shade', 'Tide', 'Locke',
];

function scGenerateCrewName(rng: () => number): string {
  const firstIdx = Math.floor(rng() * SC_FIRST_NAMES.length);
  const lastIdx = Math.floor(rng() * SC_LAST_NAMES.length);
  return SC_FIRST_NAMES[firstIdx] + ' ' + SC_LAST_NAMES[lastIdx];
}

// ─── Helper: generate ship name ─────────────────────────────────────────────

const SC_SHIP_PREFIXES = ['ISS', 'HSV', 'USS', 'HRV', 'GSC'];
const SC_SHIP_NAMES = [
  'Vanguard', 'Pathfinder', 'Sentinel', 'Horizon', 'Stardust',
  'Nebula', 'Tempest', 'Eclipse', 'Pinnacle', 'Thunderchild',
  'Starweaver', 'Voidrunner', 'Sunpiercer', 'Ironclad', 'Astral',
];

function scGenerateShipName(rng: () => number): string {
  const prefix = SC_SHIP_PREFIXES[Math.floor(rng() * SC_SHIP_PREFIXES.length)];
  const name = SC_SHIP_NAMES[Math.floor(rng() * SC_SHIP_NAMES.length)];
  return prefix + ' ' + name;
}

// ─── Initial State ──────────────────────────────────────────────────────────

function createInitialState(seed?: number): ScSpaceColonyState {
  const actualSeed = seed ?? 42;
  const rng = mulberry32(actualSeed);

  const initialResources: Record<string, number> = {};
  SC_ALL_RESOURCES.forEach((res) => {
    initialResources[res] = res === SC_RES_IRON ? 200 : res === SC_RES_FOOD ? 100 : res === SC_RES_WATER ? 80 : 0;
  });

  const initialModules: Record<string, { built: boolean; level: number; integrity: number }> = {};
  SC_ALL_MODULES.forEach((mod) => {
    initialModules[mod] = { built: false, level: 0, integrity: 0 };
  });

  const initialDiplomacy: ScDiplomacyEntry[] = SC_ALL_ALIENS.map((species) => ({
    speciesId: species,
    status: 'unknown',
    tradeOpen: false,
    meetingsCount: 0,
    lastMeetingDay: 0,
  }));

  const initialQuests: ScQuestProgress[] = SC_ALL_QUESTS.map((q) => ({
    questId: q,
    status: q === SC_QUEST_COLONIZE ? 'active' : 'available',
    progress: 0,
    target: 1,
    startedDay: q === SC_QUEST_COLONIZE ? 1 : 0,
    completedDay: null,
  }));

  const initialAchievements: ScAchievementEntry[] = SC_ALL_ACHIEVEMENTS.map((a) => ({
    achievementId: a,
    unlocked: false,
    unlockedDay: null,
  }));

  const initialCrew: ScCrewMember[] = [];
  const starterRoles = [SC_ROLE_COMMANDER, SC_ROLE_ENGINEER, SC_ROLE_SCIENTIST, SC_ROLE_MINER, SC_ROLE_BOTANIST];
  for (let i = 0; i < SC_STARTING_CREW; i++) {
    initialCrew.push({
      id: 'crew_' + (i + 1),
      name: scGenerateCrewName(rng),
      role: starterRoles[i % starterRoles.length],
      health: 100,
      morale: 80,
      skill: 10 + Math.floor(rng() * 10),
      assignedModule: null,
      daysSinceLastRested: 0,
    });
  }

  return {
    seed: actualSeed,
    rng: 0,
    day: 1,
    level: 1,
    xp: 0,
    xpToNextLevel: scCalculateXpToNext(1),
    totalXpEarned: 0,
    title: SC_TITLE_CADET,
    colonyName: 'New Horizon',
    currentPlanet: SC_PLANET_EARTH_LIKE,
    visitedPlanets: [SC_PLANET_EARTH_LIKE],
    resources: initialResources,
    modules: initialModules,
    builtModules: [],
    researchedTechs: [],
    crew: initialCrew,
    fleet: [],
    diplomacy: initialDiplomacy,
    quests: initialQuests,
    achievements: initialAchievements,
    morale: 75,
    hullIntegrity: SC_MAX_HULL_INTEGRITY,
    dailyState: {
      day: 1,
      supplyDropClaimed: false,
      alienSignalIntercepted: false,
      eventsEncountered: [],
    },
    eventLog: [
      { day: 1, message: 'Colony established on Earth-like planet. Welcome, Commander!', type: 'info' },
    ],
    activeTrades: [],
    battlesWon: 0,
    asteroidsMined: 0,
    questsCompleted: 0,
    aliensContacted: 0,
    totalDaysSurvived: 0,
    totalResourcesMined: 0,
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export default function useSpaceColony(initialSeed?: number) {
  const [state, setState] = useState<ScSpaceColonyState>(() => createInitialState(initialSeed));

  // ── Core state accessor ─────────────────────────────────────────────────

  const scGetState = useCallback((): ScSpaceColonyState => {
    return state;
  }, [state]);

  // ── Level / XP helpers (pure, called by action creators, not exported as callbacks) ──

  function applyXpGain(currentState: ScSpaceColonyState, amount: number): ScSpaceColonyState {
    let newXp = currentState.xp + amount;
    let newLevel = currentState.level;
    let newXpToNext = currentState.xpToNextLevel;
    let newTitle = currentState.title;
    const newTotalXp = currentState.totalXpEarned + amount;

    while (newXp >= newXpToNext && newLevel < SC_MAX_LEVEL) {
      newXp -= newXpToNext;
      newLevel += 1;
      newXpToNext = scCalculateXpToNext(newLevel);
    }

    if (newXp >= newXpToNext && newLevel >= SC_MAX_LEVEL) {
      newXp = 0;
    }

    for (let i = SC_ALL_TITLES.length - 1; i >= 0; i--) {
      if (newLevel >= SC_TITLE_LEVEL_REQ[SC_ALL_TITLES[i]]) {
        newTitle = SC_ALL_TITLES[i];
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

  function addResources(currentState: ScSpaceColonyState, additions: Record<string, number>): ScSpaceColonyState {
    const newResources = { ...currentState.resources };
    let totalMined = currentState.totalResourcesMined;
    for (const key of Object.keys(additions)) {
      const val = additions[key] ?? 0;
      newResources[key] = (newResources[key] ?? 0) + val;
      if (val > 0) {
        totalMined += val;
      }
    }
    return { ...currentState, resources: newResources, totalResourcesMined: totalMined };
  }

  function removeResources(currentState: ScSpaceColonyState, costs: Record<string, number>): ScSpaceColonyState {
    const newResources = { ...currentState.resources };
    for (const key of Object.keys(costs)) {
      newResources[key] = Math.max(0, (newResources[key] ?? 0) - (costs[key] ?? 0));
    }
    return { ...currentState, resources: newResources };
  }

  function canAfford(currentState: ScSpaceColonyState, costs: Record<string, number>): boolean {
    for (const key of Object.keys(costs)) {
      if ((currentState.resources[key] ?? 0) < (costs[key] ?? 0)) {
        return false;
      }
    }
    return true;
  }

  function checkAchievements(currentState: ScSpaceColonyState): ScSpaceColonyState {
    const newAchievements = currentState.achievements.map((a) => ({ ...a }));
    const newEventLog = [...currentState.eventLog];
    let newState = { ...currentState, achievements: newAchievements, eventLog: newEventLog };
    let xpGain = 0;

    const check = (id: string, condition: boolean) => {
      const entry = newAchievements.find((a) => a.achievementId === id);
      if (entry && !entry.unlocked && condition) {
        entry.unlocked = true;
        entry.unlockedDay = currentState.day;
        const def = SC_ACHIEVEMENT_DEFS[id];
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

    check(SC_ACH_FIRST_COLONY, currentState.builtModules.length >= 1);
    check(SC_ACH_TECH_PIONEER, currentState.researchedTechs.length >= 5);
    check(SC_ACH_MASTER_BUILDER, currentState.builtModules.length >= 8);
    check(SC_ACH_FLEET_ADMIRAL, currentState.fleet.length >= 5);
    check(SC_ACH_DIPLOMAT, currentState.diplomacy.filter((d) => d.meetingsCount > 0).length >= 5);
    check(SC_ACH_ASTEROID_MINER, currentState.asteroidsMined >= 10);
    check(SC_ACH_ALIEN_FRIEND, currentState.diplomacy.some((d) => d.status === 'allied'));
    check(SC_ACH_QUEST_MASTER, currentState.questsCompleted >= 10);
    check(
      SC_ACH_RESOURCE_BARON,
      SC_ALL_RESOURCES.some((r) => (currentState.resources[r] ?? 0) >= 1000),
    );
    check(SC_ACH_TECH_GENIUS, currentState.researchedTechs.length >= 15);
    check(SC_ACH_SURVIVOR, currentState.totalDaysSurvived >= 30);
    check(SC_ACH_EXPLORER, currentState.visitedPlanets.length >= 8);
    check(SC_ACH_WAR_HERO, currentState.battlesWon >= 5);
    check(SC_ACH_COLONY_PROSPERITY, currentState.morale >= 100);
    check(SC_ACH_GALACTIC_LEGEND, currentState.level >= 50);

    if (xpGain > 0) {
      newState = applyXpGain(newState, xpGain);
    }
    return newState;
  }

  // ── Actions (useCallback-wrapped) ───────────────────────────────────────

  const scAdvanceDay = useCallback((): void => {
    setState((prev) => {
      const rng = mulberry32(prev.seed + prev.day * 137);
      let next = { ...prev, day: prev.day + 1, totalDaysSurvived: prev.totalDaysSurvived + 1 };

      // Crew fatigue
      next = {
        ...next,
        crew: next.crew.map((c) => ({
          ...c,
          daysSinceLastRested: c.daysSinceLastRested + 1,
          morale: Math.max(0, c.morale - (c.daysSinceLastRested > 3 ? 2 : 0)),
        })),
      };

      // Module integrity decay
      const newModules = { ...next.modules };
      for (const key of next.builtModules) {
        const mod = { ...newModules[key] };
        mod.integrity = Math.max(0, mod.integrity - 1);
        newModules[key] = mod;
      }
      next = { ...next, modules: newModules };

      // Fleet mission timers
      next = {
        ...next,
        fleet: next.fleet.map((ship) => {
          if (ship.status !== 'docked' && ship.missionTimer > 0) {
            const newTimer = ship.missionTimer - 1;
            let newStatus: ScFleetShip['status'] = ship.status;
            let newCargo = { ...ship.cargo };
            if (newTimer <= 0) {
              newStatus = 'docked';
              if (ship.type === SC_FLEET_SCOUT) {
                const resourceOptions = [SC_RES_IRON, SC_RES_TITANIUM, SC_RES_RARE_EARTH];
                const found = resourceOptions[Math.floor(rng() * resourceOptions.length)];
                newCargo[found] = (newCargo[found] ?? 0) + 10 + Math.floor(rng() * 20);
              } else if (ship.type === SC_FLEET_FREIGHTER) {
                newCargo[SC_RES_FOOD] = (newCargo[SC_RES_FOOD] ?? 0) + 50 + Math.floor(rng() * 50);
              }
            }
            return { ...ship, missionTimer: newTimer, status: newStatus, cargo: newCargo };
          }
          return ship;
        }),
      };

      // Natural resource generation from modules
      const bonusKey = next.currentPlanet;
      const planetBonus = SC_PLANET_BONUSES[bonusKey] ?? {};
      if (next.modules[SC_MODULE_GREENHOUSE].built) {
        const foodGain = Math.floor(8 * (next.modules[SC_MODULE_GREENHOUSE].level + 1) * (planetBonus['food'] ?? 1));
        next = addResources(next, { food: foodGain });
      }
      if (next.modules[SC_MODULE_POWER].built) {
        const energyGain = Math.floor(5 * (next.modules[SC_MODULE_POWER].level + 1) * (planetBonus['solar'] ?? 1));
        next = addResources(next, { energy: energyGain });
      }
      if (next.modules[SC_MODULE_MINING].built) {
        const ironGain = Math.floor(6 * (next.modules[SC_MODULE_MINING].level + 1) * (planetBonus['iron'] ?? 1));
        next = addResources(next, { iron: ironGain });
      }

      // Random event (20% chance)
      const eventRoll = rng();
      if (eventRoll < 0.2) {
        const eventTypeRoll = rng();
        const newEvents = [...next.dailyState.eventsEncountered];
        let eventMessage = '';
        let eventType = 'event';

        if (eventTypeRoll < 0.25) {
          // Raiders
          const damage = 5 + Math.floor(rng() * 10);
          const integrityLoss = 3 + Math.floor(rng() * 5);
          next = { ...next, hullIntegrity: Math.max(0, next.hullIntegrity - damage), morale: Math.max(0, next.morale - 5) };
          eventMessage = `Raiders attacked! Hull -${damage}, Morale -5`;
          eventType = SC_EVENT_RAIDERS;
          for (const key of next.builtModules) {
            const mod = { ...next.modules[key] };
            mod.integrity = Math.max(0, mod.integrity - integrityLoss);
            next.modules[key] = mod;
          }
        } else if (eventTypeRoll < 0.5) {
          // Meteor shower
          const damage = 3 + Math.floor(rng() * 8);
          next = addResources(next, { iron: 5 + Math.floor(rng() * 15), titanium: 3 + Math.floor(rng() * 10) });
          eventMessage = `Meteor shower! Gained minerals but took ${damage} hull damage.`;
          eventType = SC_EVENT_METEOR_SHOWER;
          next = { ...next, hullIntegrity: Math.max(0, next.hullIntegrity - damage) };
        } else if (eventTypeRoll < 0.7) {
          // Supply drop
          const resGain: Record<string, number> = {
            food: 20 + Math.floor(rng() * 30),
            water: 15 + Math.floor(rng() * 25),
          };
          next = addResources(next, resGain);
          eventMessage = 'Emergency supply crate detected nearby!';
          eventType = SC_EVENT_SUPPLY_DROP;
        } else if (eventTypeRoll < 0.85) {
          // Solar flare
          const energyGain = 30 + Math.floor(rng() * 40);
          next = addResources(next, { energy: energyGain });
          eventMessage = `Solar flare! +${energyGain} energy harvested.`;
          eventType = SC_EVENT_SOLAR_FLARE;
        } else {
          // Discovery
          const rareAmount = 3 + Math.floor(rng() * 7);
          next = addResources(next, { rareEarth: rareAmount });
          next = applyXpGain(next, 25);
          eventMessage = `Ancient discovery! +${rareAmount} rare earth, +25 XP`;
          eventType = SC_EVENT_DISCOVERY;
        }

        newEvents.push(eventType);
        next = { ...next, dailyState: { ...next.dailyState, eventsEncountered: newEvents } };
        next.eventLog.push({ day: next.day, message: eventMessage, type: eventType });
      }

      // Daily state reset
      next = {
        ...next,
        dailyState: {
          day: next.day,
          supplyDropClaimed: false,
          alienSignalIntercepted: false,
          eventsEncountered: next.dailyState.eventsEncountered,
        },
      };

      // Check achievements
      next = checkAchievements(next);

      return next;
    });
  }, [state]);

  const scBuildModule = useCallback((moduleId: string): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.modules[moduleId]?.built) return prev;
      const cost = SC_MODULE_COST[moduleId];
      if (!cost || !canAfford(prev, cost)) return prev;

      let next = removeResources(prev, cost);
      const newModules = { ...next.modules };
      newModules[moduleId] = { built: true, level: 1, integrity: SC_MAX_HULL_INTEGRITY };
      next = {
        ...next,
        modules: newModules,
        builtModules: prev.builtModules.includes(moduleId) ? prev.builtModules : [...prev.builtModules, moduleId],
      };

      next.eventLog.push({
        day: next.day,
        message: `Module built: ${moduleId}! Colony expands.`,
        type: 'build',
      });

      next = applyXpGain(next, 30);
      next = checkAchievements(next);

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scUpgradeModule = useCallback((moduleId: string): boolean => {
    let success = false;
    setState((prev) => {
      const mod = prev.modules[moduleId];
      if (!mod || !mod.built) return prev;
      if (mod.level >= 10) return prev;

      const scaleFactor = mod.level;
      const cost: Record<string, number> = {};
      const baseCost = SC_MODULE_COST[moduleId];
      if (baseCost) {
        for (const key of Object.keys(baseCost)) {
          cost[key] = Math.floor(baseCost[key] * scaleFactor * 1.5);
        }
      }
      if (!canAfford(prev, cost)) return prev;

      let next = removeResources(prev, cost);
      const newModules = { ...next.modules };
      newModules[moduleId] = { ...mod, level: mod.level + 1, integrity: SC_MAX_HULL_INTEGRITY };
      next = { ...next, modules: newModules };

      next.eventLog.push({
        day: next.day,
        message: `${moduleId} upgraded to level ${mod.level + 1}!`,
        type: 'upgrade',
      });

      next = applyXpGain(next, 20);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scRepairModule = useCallback((moduleId: string): boolean => {
    let success = false;
    setState((prev) => {
      const mod = prev.modules[moduleId];
      if (!mod || !mod.built || mod.integrity >= SC_MAX_HULL_INTEGRITY) return prev;

      const repairCost: Record<string, number> = { iron: 10, carbon: 5 };
      if (!canAfford(prev, repairCost)) return prev;

      let next = removeResources(prev, repairCost);
      const newModules = { ...next.modules };
      newModules[moduleId] = { ...mod, integrity: Math.min(SC_MAX_HULL_INTEGRITY, mod.integrity + 25) };
      next = { ...next, modules: newModules };

      next.eventLog.push({
        day: next.day,
        message: `Repairs on ${moduleId}: integrity restored to ${Math.min(SC_MAX_HULL_INTEGRITY, mod.integrity + 25)}.`,
        type: 'repair',
      });

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scResearchTech = useCallback((techId: string): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.researchedTechs.includes(techId)) return prev;
      const cost = SC_TECH_COST[techId];
      if (!cost || !canAfford(prev, cost)) return prev;

      let next = removeResources(prev, cost);
      next = {
        ...next,
        researchedTechs: [...prev.researchedTechs, techId],
      };

      const rarity = SC_TECH_RARITY[techId] ?? SC_RARITY_COMMON;
      const xpReward = rarity === SC_RARITY_COMMON ? 30 : rarity === SC_RARITY_UNCOMMON ? 60 : rarity === SC_RARITY_RARE ? 100 : rarity === SC_RARITY_EPIC ? 160 : 250;
      next = applyXpGain(next, xpReward);

      next.eventLog.push({
        day: next.day,
        message: `Technology researched: ${techId} (${rarity})! +${xpReward} XP`,
        type: 'research',
      });

      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scMineAsteroid = useCallback((): Record<string, number> => {
    let result: Record<string, number> = {};
    setState((prev) => {
      const rng = mulberry32(prev.seed + prev.day * 31 + 777);
      const miningBonus = prev.researchedTechs.includes(SC_TECH_ASTEROID_MINING) ? 1.5 : 1.0;
      const minerBonus = prev.crew.filter((c) => c.role === SC_ROLE_MINER && c.assignedModule === SC_MODULE_MINING).length * 0.2;

      const loot: Record<string, number> = {};
      loot[SC_RES_IRON] = Math.floor((20 + rng() * 30) * miningBonus * (1 + minerBonus));
      loot[SC_RES_TITANIUM] = Math.floor((5 + rng() * 15) * miningBonus * (1 + minerBonus));
      loot[SC_RES_CARBON] = Math.floor((3 + rng() * 10) * miningBonus);

      if (rng() < 0.3) {
        loot[SC_RES_RARE_EARTH] = Math.floor((2 + rng() * 8) * miningBonus);
      }
      if (rng() < 0.15) {
        loot[SC_RES_HELIUM3] = Math.floor((1 + rng() * 5) * miningBonus);
      }
      if (rng() < 0.05) {
        loot[SC_RES_DIAMOND] = Math.floor(1 + rng() * 3);
      }

      let next = addResources(prev, loot);
      next = {
        ...next,
        asteroidsMined: prev.asteroidsMined + 1,
      };

      next = applyXpGain(next, 15);
      next.eventLog.push({
        day: next.day,
        message: `Asteroid mined! Gained: ${Object.entries(loot).map(([k, v]) => `${v} ${k}`).join(', ')}`,
        type: 'mining',
      });

      next = checkAchievements(next);
      result = { ...loot };
      return next;
    });
    return result;
  }, [state]);

  const scAssignCrew = useCallback((crewId: string, moduleId: string | null): boolean => {
    let success = false;
    setState((prev) => {
      const crewIdx = prev.crew.findIndex((c) => c.id === crewId);
      if (crewIdx === -1) return prev;

      const newCrew = [...prev.crew];
      newCrew[crewIdx] = { ...newCrew[crewIdx], assignedModule: moduleId };

      const next = { ...prev, crew: newCrew };
      next.eventLog.push({
        day: next.day,
        message: `${newCrew[crewIdx].name} ${moduleId ? `assigned to ${moduleId}` : 'unassigned'}.`,
        type: 'crew',
      });

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scRestCrew = useCallback((crewId: string): boolean => {
    let success = false;
    setState((prev) => {
      const crewIdx = prev.crew.findIndex((c) => c.id === crewId);
      if (crewIdx === -1) return prev;
      if (prev.resources[SC_RES_FOOD] < 5) return prev;

      const newCrew = [...prev.crew];
      newCrew[crewIdx] = {
        ...newCrew[crewIdx],
        health: Math.min(100, newCrew[crewIdx].health + 20),
        morale: Math.min(100, newCrew[crewIdx].morale + 15),
        daysSinceLastRested: 0,
      };

      let next = removeResources({ ...prev, crew: newCrew }, { food: 5 });
      next.eventLog.push({
        day: next.day,
        message: `${newCrew[crewIdx].name} rested. Health +20, Morale +15.`,
        type: 'crew',
      });

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scRecruitCrew = useCallback((): ScCrewMember | null => {
    let newMember: ScCrewMember | null = null;
    setState((prev) => {
      if (prev.crew.length >= SC_MAX_CREW) return prev;
      if ((prev.resources[SC_RES_FOOD] ?? 0) < 30 || (prev.resources[SC_RES_WATER] ?? 0) < 20) return prev;

      const rng = mulberry32(prev.seed + prev.day * 53 + prev.crew.length * 17);
      const availableRoles = [...SC_ALL_ROLES];
      const role = availableRoles[Math.floor(rng() * availableRoles.length)];
      const id = 'crew_' + (prev.crew.length + 1) + '_' + prev.day;
      const member: ScCrewMember = {
        id,
        name: scGenerateCrewName(rng),
        role,
        health: 100,
        morale: 70 + Math.floor(rng() * 20),
        skill: 8 + Math.floor(rng() * 15),
        assignedModule: null,
        daysSinceLastRested: 0,
      };

      let next = removeResources(prev, { food: 30, water: 20 });
      next = { ...next, crew: [...prev.crew, member] };
      next = applyXpGain(next, 10);
      next.eventLog.push({
        day: next.day,
        message: `New ${role} recruited: ${member.name}!`,
        type: 'crew',
      });

      newMember = { ...member };
      return next;
    });
    return newMember;
  }, [state]);

  const scBuildShip = useCallback((shipType: string): ScFleetShip | null => {
    let built: ScFleetShip | null = null;
    setState((prev) => {
      if (prev.fleet.length >= SC_MAX_FLEET_SIZE) return prev;
      const stats = SC_FLEET_STATS[shipType];
      if (!stats) return prev;
      if (!canAfford(prev, stats.cost)) return prev;

      const rng = mulberry32(prev.seed + prev.day * 71 + prev.fleet.length * 13);
      const ship: ScFleetShip = {
        id: 'ship_' + (prev.fleet.length + 1) + '_' + prev.day,
        name: scGenerateShipName(rng),
        type: shipType,
        hp: stats.hp,
        maxHp: stats.hp,
        status: 'docked',
        missionTimer: 0,
        cargo: {},
      };

      let next = removeResources(prev, stats.cost);
      next = { ...next, fleet: [...prev.fleet, ship] };
      next = applyXpGain(next, 25);
      next.eventLog.push({
        day: next.day,
        message: `Ship constructed: ${ship.name} (${shipType})!`,
        type: 'fleet',
      });

      next = checkAchievements(next);
      built = { ...ship };
      return next;
    });
    return built;
  }, [state]);

  const scDispatchFleet = useCallback((shipId: string, mission: string, duration: number): boolean => {
    let success = false;
    setState((prev) => {
      const shipIdx = prev.fleet.findIndex((s) => s.id === shipId);
      if (shipIdx === -1) return prev;
      const ship = prev.fleet[shipIdx];
      if (ship.status !== 'docked') return prev;

      const newFleet = [...prev.fleet];
      newFleet[shipIdx] = {
        ...ship,
        status: mission as ScFleetShip['status'],
        missionTimer: duration,
        cargo: {},
      };

      const missionLabels: Record<string, string> = {
        patrolling: 'Patrol',
        trading: 'Trade Run',
        exploring: 'Exploration',
        combat: 'Combat Mission',
      };
      const label = missionLabels[mission] ?? mission;

      const next = {
        ...prev,
        fleet: newFleet,
        eventLog: [
          ...prev.eventLog,
          { day: prev.day, message: `${ship.name} dispatched on ${label} (${duration} days).`, type: 'fleet' },
        ],
      };

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scUnloadShipCargo = useCallback((shipId: string): Record<string, number> => {
    let cargo: Record<string, number> = {};
    setState((prev) => {
      const shipIdx = prev.fleet.findIndex((s) => s.id === shipId);
      if (shipIdx === -1) return prev;
      const ship = prev.fleet[shipIdx];
      if (ship.status !== 'docked') return prev;
      if (Object.keys(ship.cargo).length === 0) return prev;

      cargo = { ...ship.cargo };
      const newFleet = [...prev.fleet];
      newFleet[shipIdx] = { ...ship, cargo: {} };

      let next = { ...prev, fleet: newFleet };
      next = addResources(next, cargo);

      const cargoDesc = Object.entries(cargo)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${v} ${k}`)
        .join(', ');
      next.eventLog.push({
        day: next.day,
        message: `${ship.name} cargo unloaded: ${cargoDesc}`,
        type: 'fleet',
      });

      return next;
    });
    return cargo;
  }, [state]);

  const scRepairShip = useCallback((shipId: string): boolean => {
    let success = false;
    setState((prev) => {
      const shipIdx = prev.fleet.findIndex((s) => s.id === shipId);
      if (shipIdx === -1) return prev;
      const ship = prev.fleet[shipIdx];
      if (ship.hp >= ship.maxHp) return prev;

      const repairCost = { titanium: 10, carbon: 5 };
      if (!canAfford(prev, repairCost)) return prev;

      const newFleet = [...prev.fleet];
      newFleet[shipIdx] = { ...ship, hp: Math.min(ship.maxHp, ship.hp + Math.floor(ship.maxHp * 0.5)) };

      let next = removeResources({ ...prev, fleet: newFleet }, repairCost);
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

  const scContactAlien = useCallback((speciesId: string): string => {
    let resultStatus = 'failed';
    setState((prev) => {
      const dipIdx = prev.diplomacy.findIndex((d) => d.speciesId === speciesId);
      if (dipIdx === -1) return prev;

      const rng = mulberry32(prev.seed + prev.day * 97 + speciesId.length * 31);
      const existingDip = prev.diplomacy[dipIdx];
      if (existingDip.status === 'allied') {
        resultStatus = 'already_allied';
        return prev;
      }

      const hasTech = prev.researchedTechs.includes(SC_TECH_XENO_LINGUISTICS);
      const hasDiplomat = prev.crew.some((c) => c.role === SC_ROLE_COMMANDER);

      let relationshipChance = 0.4;
      if (hasTech) relationshipChance += 0.2;
      if (hasDiplomat) relationshipChance += 0.1;
      if (existingDip.meetingsCount > 0) relationshipChance += 0.15;

      const roll = rng();
      let newStatus = existingDip.status;
      let tradeOpen = existingDip.tradeOpen;

      if (existingDip.status === 'unknown') {
        if (roll < 0.6) {
          newStatus = 'neutral';
        } else {
          newStatus = 'hostile';
        }
      } else if (existingDip.status === 'hostile') {
        if (roll < relationshipChance) {
          newStatus = 'neutral';
        }
      } else if (existingDip.status === 'neutral') {
        if (roll < relationshipChance) {
          newStatus = 'friendly';
          tradeOpen = true;
        }
      } else if (existingDip.status === 'friendly') {
        if (roll < relationshipChance * 0.6) {
          newStatus = 'allied';
          tradeOpen = true;
        }
      }

      const newDiplomacy = [...prev.diplomacy];
      newDiplomacy[dipIdx] = {
        ...existingDip,
        status: newStatus,
        tradeOpen,
        meetingsCount: existingDip.meetingsCount + 1,
        lastMeetingDay: prev.day,
      };

      const wasContactBefore = existingDip.meetingsCount === 0;
      let next = { ...prev, diplomacy: newDiplomacy };
      if (wasContactBefore) {
        next = { ...next, aliensContacted: prev.aliensContacted + 1 };
      }
      next = applyXpGain(next, 20);

      const disposition = SC_ALIEN_DISPOSITION[speciesId] ?? 'unknown';
      next.eventLog.push({
        day: next.day,
        message: `Contact with ${speciesId}: status now ${newStatus} (disposition: ${disposition})`,
        type: 'diplomacy',
      });

      next = checkAchievements(next);
      resultStatus = newStatus;
      return next;
    });
    return resultStatus;
  }, [state]);

  const scTradeWithAlien = useCallback((speciesId: string, offerResources: Record<string, number>, requestResources: Record<string, number>): boolean => {
    let success = false;
    setState((prev) => {
      const dip = prev.diplomacy.find((d) => d.speciesId === speciesId);
      if (!dip || !dip.tradeOpen) return prev;
      if (!canAfford(prev, offerResources)) return prev;

      let next = removeResources(prev, offerResources);
      const taxAdjusted: Record<string, number> = {};
      for (const key of Object.keys(requestResources)) {
        taxAdjusted[key] = Math.floor((requestResources[key] ?? 0) * (1 - SC_TRADE_TAX));
      }
      next = addResources(next, taxAdjusted);

      next.eventLog.push({
        day: next.day,
        message: `Trade with ${speciesId}: gave ${Object.entries(offerResources).map(([k, v]) => `${v} ${k}`).join(', ')}, received ${Object.entries(taxAdjusted).map(([k, v]) => `${v} ${k}`).join(', ')}`,
        type: 'trade',
      });

      next = applyXpGain(next, 15);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scTravelToPlanet = useCallback((planetId: string): boolean => {
    let success = false;
    setState((prev) => {
      if (planetId === prev.currentPlanet) return prev;
      if (!SC_ALL_PLANETS.includes(planetId)) return prev;

      const hasFTL = prev.researchedTechs.includes(SC_TECH_FTL_DRIVE);
      const fuelCost = hasFTL ? { helium3: 10, energy: 20 } : { helium3: 25, energy: 50 };
      if (!canAfford(prev, fuelCost)) return prev;

      let next = removeResources(prev, fuelCost);
      const newVisited = prev.visitedPlanets.includes(planetId) ? prev.visitedPlanets : [...prev.visitedPlanets, planetId];
      next = { ...next, currentPlanet: planetId, visitedPlanets: newVisited };
      next = applyXpGain(next, 40);

      const difficulty = SC_PLANET_DIFFICULTY[planetId] ?? 1;
      next.eventLog.push({
        day: next.day,
        message: `Traveled to ${planetId} (difficulty: ${difficulty}/5)! New planetary bonuses apply.`,
        type: 'travel',
      });

      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scStartQuest = useCallback((questId: string): boolean => {
    let success = false;
    setState((prev) => {
      const questIdx = prev.quests.findIndex((q) => q.questId === questId);
      if (questIdx === -1) return prev;
      const quest = prev.quests[questIdx];
      if (quest.status !== 'available') return prev;

      const newQuests = [...prev.quests];
      newQuests[questIdx] = { ...quest, status: 'active', startedDay: prev.day };

      const targets: Record<string, number> = {
        [SC_QUEST_COLONIZE]: 1,
        [SC_QUEST_FIRST_CONTACT]: 3,
        [SC_QUEST_BUILD_DEFENSES]: 3,
        [SC_QUEST_SURVEY_ASTEROID]: 5,
        [SC_QUEST_TRADE_ROUTE]: 3,
        [SC_QUEST_RESEARCH_BREAKTHROUGH]: 5,
        [SC_QUEST_RESCUE_CREW]: 1,
        [SC_QUEST_DEFEAT_RAIDERS]: 3,
        [SC_QUEST_EXPAND_TERRITORY]: 4,
        [SC_QUEST_FIND_ARTIFACT]: 1,
      };
      newQuests[questIdx].target = targets[questId] ?? 1;

      const next = {
        ...prev,
        quests: newQuests,
        eventLog: [
          ...prev.eventLog,
          { day: prev.day, message: `Quest started: ${questId}!`, type: 'quest' },
        ],
      };

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scCompleteQuest = useCallback((questId: string): Record<string, number> | null => {
    let reward: Record<string, number> | null = null;
    setState((prev) => {
      const questIdx = prev.quests.findIndex((q) => q.questId === questId);
      if (questIdx === -1) return prev;
      const quest = prev.quests[questIdx];
      if (quest.status !== 'active') return prev;
      if (quest.progress < quest.target) return prev;

      const newQuests = [...prev.quests];
      newQuests[questIdx] = { ...quest, status: 'completed', completedDay: prev.day };
      const questReward = SC_QUEST_REWARD[questId];
      if (!questReward) return prev;

      let next = addResources({ ...prev, quests: newQuests }, questReward.resources);
      next = { ...next, questsCompleted: prev.questsCompleted + 1 };
      next = applyXpGain(next, questReward.xp);

      next.eventLog.push({
        day: next.day,
        message: `Quest completed: ${questId}! +${questReward.xp} XP, resources gained!`,
        type: 'quest',
      });

      next = checkAchievements(next);
      reward = { xp: questReward.xp, ...questReward.resources };
      return next;
    });
    return reward;
  }, [state]);

  const scProgressQuest = useCallback((questId: string, amount: number): void => {
    setState((prev) => {
      const questIdx = prev.quests.findIndex((q) => q.questId === questId);
      if (questIdx === -1) return prev;
      const quest = prev.quests[questIdx];
      if (quest.status !== 'active') return prev;

      const newQuests = [...prev.quests];
      newQuests[questIdx] = {
        ...quest,
        progress: Math.min(quest.target, quest.progress + amount),
      };

      return { ...prev, quests: newQuests };
    });
  }, [state]);

  const scClaimDailySupplyDrop = useCallback((): Record<string, number> => {
    let loot: Record<string, number> = {};
    setState((prev) => {
      if (prev.dailyState.supplyDropClaimed) return prev;

      const rng = mulberry32(prev.seed + prev.day * 113);
      const drop: Record<string, number> = {
        [SC_RES_FOOD]: 15 + Math.floor(rng() * 20),
        [SC_RES_WATER]: 10 + Math.floor(rng() * 15),
        [SC_RES_IRON]: 5 + Math.floor(rng() * 10),
      };
      if (rng() < 0.3) {
        drop[SC_RES_HELIUM3] = 2 + Math.floor(rng() * 5);
      }

      let next = addResources(prev, drop);
      next = {
        ...next,
        dailyState: { ...prev.dailyState, supplyDropClaimed: true },
      };

      const dropDesc = Object.entries(drop).map(([k, v]) => `${v} ${k}`).join(', ');
      next.eventLog.push({
        day: next.day,
        message: `Daily supply drop claimed: ${dropDesc}`,
        type: 'daily',
      });

      loot = { ...drop };
      return next;
    });
    return loot;
  }, [state]);

  const scInterceptAlienSignal = useCallback((): { speciesId: string; message: string } | null => {
    let signalResult: { speciesId: string; message: string } | null = null;
    setState((prev) => {
      if (prev.dailyState.alienSignalIntercepted) return prev;

      const rng = mulberry32(prev.seed + prev.day * 151);
      const eligibleAliens = SC_ALL_ALIENS.filter((a) => {
        const dip = prev.diplomacy.find((d) => d.speciesId === a);
        return !dip || dip.status === 'unknown';
      });

      if (eligibleAliens.length === 0) return prev;

      const chosen = eligibleAliens[Math.floor(rng() * eligibleAliens.length)];
      const signalMessages = [
        `Faint signal detected from ${chosen} sector. Origin unknown.`,
        `Decrypted fragment from ${chosen}: they seem to be broadcasting coordinates.`,
        `${chosen} transmission intercepted. The patterns suggest intelligence.`,
        `Urgent signal from ${chosen}: a distress call or a trap?`,
        `Routine ${chosen} beacon ping. Frequency suggests peaceful intent.`,
      ];
      const message = signalMessages[Math.floor(rng() * signalMessages.length)];

      const next = {
        ...prev,
        dailyState: { ...prev.dailyState, alienSignalIntercepted: true },
        eventLog: [
          ...prev.eventLog,
          { day: prev.day, message, type: SC_EVENT_ALIEN_SIGNAL },
        ],
      };

      signalResult = { speciesId: chosen, message };
      return next;
    });
    return signalResult;
  }, [state]);

  const scResolveBattle = useCallback((enemyFleet: string, shipIds: string[]): ScBattleResult | null => {
    let result: ScBattleResult | null = null;
    setState((prev) => {
      const participatingShips = prev.fleet.filter((s) => shipIds.includes(s.id) && s.status === 'docked');
      if (participatingShips.length === 0) return prev;

      const rng = mulberry32(prev.seed + prev.day * 191 + enemyFleet.length * 7);
      const totalAttack = participatingShips.reduce((sum, s) => {
        const stats = SC_FLEET_STATS[s.type];
        return sum + (stats?.attack ?? 0) * (s.hp / s.maxHp);
      }, 0);
      const totalHp = participatingShips.reduce((sum, s) => sum + s.hp, 0);

      const enemyPower = Math.floor(30 + rng() * 70 + prev.day * 0.5);
      const playerPower = totalAttack * (1 + (prev.researchedTechs.includes(SC_TECH_PLASMA_WEAPON) ? 0.3 : 0));
      const hasShield = prev.researchedTechs.includes(SC_TECH_SHIELD_GENERATOR);
      const shieldReduction = hasShield ? 0.3 : 0;

      const victory = playerPower > enemyPower * 0.7;
      const damageTaken = Math.max(0, Math.floor(enemyPower * (1 - shieldReduction) * (victory ? 0.3 : 0.7)));
      const loot: Record<string, number> = {};

      let next = { ...prev };
      if (victory) {
        loot[SC_RES_IRON] = 10 + Math.floor(rng() * 20);
        loot[SC_RES_TITANIUM] = 5 + Math.floor(rng() * 15);
        if (rng() < 0.4) loot[SC_RES_RARE_EARTH] = 2 + Math.floor(rng() * 8);
        if (rng() < 0.2) loot[SC_RES_HELIUM3] = 1 + Math.floor(rng() * 5);
        next = addResources(next, loot);
        next = { ...next, battlesWon: prev.battlesWon + 1 };
        next = applyXpGain(next, 50);

        next.eventLog.push({
          day: next.day,
          message: `Victory against ${enemyFleet}! Loot: ${Object.entries(loot).map(([k, v]) => `${v} ${k}`).join(', ')}`,
          type: 'combat',
        });
      } else {
        next = {
          ...next,
          hullIntegrity: Math.max(0, prev.hullIntegrity - Math.floor(damageTaken * 0.2)),
          morale: Math.max(0, prev.morale - 10),
        };
        next.eventLog.push({
          day: next.day,
          message: `Defeated by ${enemyFleet}. Hull damaged, morale dropped.`,
          type: 'combat',
        });
      }

      // Apply damage to ships
      next = {
        ...next,
        fleet: next.fleet.map((s) => {
          if (!shipIds.includes(s.id)) return s;
          const shipDamage = Math.min(s.hp, Math.floor(damageTaken / participatingShips.length));
          return { ...s, hp: s.hp - shipDamage };
        }),
      };

      next = checkAchievements(next);

      result = {
        victory,
        enemyFleet,
        damageTaken,
        enemyDestroyed: victory,
        loot,
      };
      return next;
    });
    return result;
  }, [state]);

  const scBoostMorale = useCallback((): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.morale >= SC_MAX_MORALE) return prev;
      const cost = { food: 20, energy: 10 };
      if (!canAfford(prev, cost)) return prev;

      const boost = 15 + (prev.modules[SC_MODULE_COMMAND]?.built ? 5 : 0);
      let next = removeResources(prev, cost);
      next = { ...next, morale: Math.min(SC_MAX_MORALE, prev.morale + boost) };

      next.eventLog.push({
        day: next.day,
        message: `Morale boost! Morale now ${Math.min(SC_MAX_MORALE, prev.morale + boost)}.`,
        type: 'morale',
      });

      next = checkAchievements(next);
      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scRepairHull = useCallback((): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.hullIntegrity >= SC_MAX_HULL_INTEGRITY) return prev;
      const cost = { iron: 30, titanium: 15 };
      if (!canAfford(prev, cost)) return prev;

      const repairAmount = 20 + (prev.modules[SC_MODULE_DEFENSE]?.built ? 10 : 0);
      let next = removeResources(prev, cost);
      next = { ...next, hullIntegrity: Math.min(SC_MAX_HULL_INTEGRITY, prev.hullIntegrity + repairAmount) };

      next.eventLog.push({
        day: next.day,
        message: `Hull repaired: ${Math.min(SC_MAX_HULL_INTEGRITY, prev.hullIntegrity + repairAmount)}/${SC_MAX_HULL_INTEGRITY}.`,
        type: 'repair',
      });

      success = true;
      return next;
    });
    return success;
  }, [state]);

  const scSetName = useCallback((name: string): void => {
    setState((prev) => ({ ...prev, colonyName: name }));
  }, [state]);

  const scRerollSeed = useCallback((newSeed: number): void => {
    setState(() => createInitialState(newSeed));
  }, [state]);

  const scGetModulesSummary = useCallback((): Record<string, { built: boolean; level: number; integrity: number }> => {
    return { ...state.modules };
  }, [state]);

  const scGetBuiltCount = useCallback((): number => {
    return state.builtModules.length;
  }, [state]);

  const scGetResearchCount = useCallback((): number => {
    return state.researchedTechs.length;
  }, [state]);

  const scGetFleetSize = useCallback((): number => {
    return state.fleet.length;
  }, [state]);

  const scGetCrewCount = useCallback((): number => {
    return state.crew.length;
  }, [state]);

  const scGetDiplomacySummary = useCallback((): ScDiplomacyEntry[] => {
    return state.diplomacy.map((d) => ({ ...d }));
  }, [state]);

  const scGetActiveQuests = useCallback((): ScQuestProgress[] => {
    return state.quests.filter((q) => q.status === 'active').map((q) => ({ ...q }));
  }, [state]);

  const scGetAvailableQuests = useCallback((): ScQuestProgress[] => {
    return state.quests.filter((q) => q.status === 'available').map((q) => ({ ...q }));
  }, [state]);

  const scGetCompletedQuests = useCallback((): ScQuestProgress[] => {
    return state.quests.filter((q) => q.status === 'completed').map((q) => ({ ...q }));
  }, [state]);

  const scGetUnlockedAchievements = useCallback((): ScAchievementEntry[] => {
    return state.achievements.filter((a) => a.unlocked).map((a) => ({ ...a }));
  }, [state]);

  const scIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return state.achievements.some((a) => a.achievementId === achievementId && a.unlocked);
  }, [state]);

  const scGetRecentEvents = useCallback((count: number): ScEventLog[] => {
    return state.eventLog.slice(-count);
  }, [state]);

  const scGetCurrentTitle = useCallback((): string => {
    return state.title;
  }, [state]);

  const scGetXpProgress = useCallback((): { current: number; needed: number; percent: number } => {
    return {
      current: state.xp,
      needed: state.xpToNextLevel,
      percent: state.xpToNextLevel > 0 ? Math.floor((state.xp / state.xpToNextLevel) * 100) : 100,
    };
  }, [state]);

  const scGetResourceAmount = useCallback((resourceId: string): number => {
    return state.resources[resourceId] ?? 0;
  }, [state]);

  const scGetAllResources = useCallback((): Record<string, number> => {
    return { ...state.resources };
  }, [state]);

  const scHasTech = useCallback((techId: string): boolean => {
    return state.researchedTechs.includes(techId);
  }, [state]);

  const scGetPlanetBonuses = useCallback((): Record<string, number> => {
    return SC_PLANET_BONUSES[state.currentPlanet] ?? {};
  }, [state]);

  const scCanAfford = useCallback((costs: Record<string, number>): boolean => {
    for (const key of Object.keys(costs)) {
      if ((state.resources[key] ?? 0) < (costs[key] ?? 0)) return false;
    }
    return true;
  }, [state]);

  const scGetDiplomacyStatus = useCallback((speciesId: string): string => {
    const dip = state.diplomacy.find((d) => d.speciesId === speciesId);
    return dip?.status ?? 'unknown';
  }, [state]);

  const scGetShipById = useCallback((shipId: string): ScFleetShip | null => {
    const ship = state.fleet.find((s) => s.id === shipId);
    return ship ? { ...ship } : null;
  }, [state]);

  const scGetCrewById = useCallback((crewId: string): ScCrewMember | null => {
    const member = state.crew.find((c) => c.id === crewId);
    return member ? { ...member } : null;
  }, [state]);

  const scGetColonyStats = useCallback((): {
    day: number;
    level: number;
    title: string;
    colonyName: string;
    currentPlanet: string;
    morale: number;
    hullIntegrity: number;
    builtModules: number;
    researchedTechs: number;
    fleetSize: number;
    crewCount: number;
    battlesWon: number;
    asteroidsMined: number;
    questsCompleted: number;
    aliensContacted: number;
    visitedPlanets: number;
    unlockedAchievements: number;
  } => {
    return {
      day: state.day,
      level: state.level,
      title: state.title,
      colonyName: state.colonyName,
      currentPlanet: state.currentPlanet,
      morale: state.morale,
      hullIntegrity: state.hullIntegrity,
      builtModules: state.builtModules.length,
      researchedTechs: state.researchedTechs.length,
      fleetSize: state.fleet.length,
      crewCount: state.crew.length,
      battlesWon: state.battlesWon,
      asteroidsMined: state.asteroidsMined,
      questsCompleted: state.questsCompleted,
      aliensContacted: state.aliensContacted,
      visitedPlanets: state.visitedPlanets.length,
      unlockedAchievements: state.achievements.filter((a) => a.unlocked).length,
    };
  }, [state]);

  const scGetDailyStatus = useCallback((): ScDailyState => {
    return { ...state.dailyState };
  }, [state]);

  const scIsModuleBuilt = useCallback((moduleId: string): boolean => {
    return state.modules[moduleId]?.built ?? false;
  }, [state]);

  const scGetModuleLevel = useCallback((moduleId: string): number => {
    return state.modules[moduleId]?.level ?? 0;
  }, [state]);

  const scGetModuleIntegrity = useCallback((moduleId: string): number => {
    return state.modules[moduleId]?.integrity ?? 0;
  }, [state]);

  return {
    // State accessors
    scGetState,
    scGetModulesSummary,
    scGetBuiltCount,
    scGetResearchCount,
    scGetFleetSize,
    scGetCrewCount,
    scGetDiplomacySummary,
    scGetActiveQuests,
    scGetAvailableQuests,
    scGetCompletedQuests,
    scGetUnlockedAchievements,
    scIsAchievementUnlocked,
    scGetRecentEvents,
    scGetCurrentTitle,
    scGetXpProgress,
    scGetResourceAmount,
    scGetAllResources,
    scHasTech,
    scGetPlanetBonuses,
    scCanAfford,
    scGetDiplomacyStatus,
    scGetShipById,
    scGetCrewById,
    scGetColonyStats,
    scGetDailyStatus,
    scIsModuleBuilt,
    scGetModuleLevel,
    scGetModuleIntegrity,

    // Actions
    scAdvanceDay,
    scBuildModule,
    scUpgradeModule,
    scRepairModule,
    scResearchTech,
    scMineAsteroid,
    scAssignCrew,
    scRestCrew,
    scRecruitCrew,
    scBuildShip,
    scDispatchFleet,
    scUnloadShipCargo,
    scRepairShip,
    scContactAlien,
    scTradeWithAlien,
    scTravelToPlanet,
    scStartQuest,
    scCompleteQuest,
    scProgressQuest,
    scClaimDailySupplyDrop,
    scInterceptAlienSignal,
    scResolveBattle,
    scBoostMorale,
    scRepairHull,
    scSetName,
    scRerollSeed,
  };
}
