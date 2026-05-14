import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════
// Thunder Nexus Wire (雷暴枢纽) — Word Snake Game Feature Hook
// A floating sky fortress at the eye of an eternal storm where players
// harness lightning energy, tame thunder beasts, build storm towers,
// and command weather phenomena.
// ═══════════════════════════════════════════════════════════════════

// ── Color Theme Constants ─────────────────────────────────────────
const TN_ELECTRIC_BLUE = '#2979FF';
const TN_LIGHTNING_YELLOW = '#FFD600';
const TN_STORM_GRAY = '#546E7A';
const TN_WHITE_FLASH = '#FFFFFF';
const TN_DARK_NAVY = '#0D47A1';

// ── Game Balance Constants ────────────────────────────────────────
const TN_MAX_ENERGY = 200;
const TN_MAX_STATIC_CHARGE = 100;
const TN_MAX_NEXUS_POWER = 10000;
const TN_MAX_STORM_INTENSITY = 100;
const TN_MAX_LIGHTNING_STRIKES = 9999;
const TN_CREATURE_COUNT = 35;
const TN_SECTOR_COUNT = 8;
const TN_EQUIPMENT_COUNT = 30;
const TN_FACILITY_COUNT = 25;
const TN_ABILITY_COUNT = 22;
const TN_ACHIEVEMENT_COUNT = 18;
const TN_TITLE_COUNT = 8;
const TN_MAX_FACILITY_LEVEL = 10;
const TN_ENERGY_REGEN_RATE = 2;
const TN_STATIC_DECAY_RATE = 1;
const TN_DAILY_TASK_EXPIRY_MS = 86400000;
const TN_LIGHTNING_BASE_DAMAGE = 15;
const TN_CHAIN_LIGHTNING_RANGE = 3;
const TN_STORM_CALM_THRESHOLD = 10;
const TN_NEXUS_POWER_PER_STRIKE = 5;
const TN_NEXUS_POWER_PER_TAME = 20;
const TN_NEXUS_POWER_PER_UPGRADE = 10;
const TN_BARRIER_DURATION_MS = 30000;
const TN_BARRIER_COST = 30;

// ── Type Definitions ──────────────────────────────────────────────

type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

type Creature = {
  id: number;
  name: string;
  rarity: RarityTier;
  power: number;
  speed: number;
  description: string;
  tamed: boolean;
  tamedAt: number | null;
  stormAffinity: number;
};

type Sector = {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  unlockCost: number;
  energyGenerated: number;
  dangerLevel: number;
  creatureSpawns: string[];
};

type Equipment = {
  id: number;
  name: string;
  description: string;
  rarity: RarityTier;
  power: number;
  defense: number;
  equipped: boolean;
  cost: number;
};

type Facility = {
  id: number;
  name: string;
  description: string;
  level: number;
  upgradeCost: number;
  energyOutput: number;
  maxLevel: number;
};

type Ability = {
  id: number;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  energyCost: number;
  unlocked: boolean;
  unlockCost: number;
  power: number;
  type: 'offensive' | 'defensive' | 'utility';
};

type Achievement = {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: number | null;
  condition: string;
  reward: string;
};

type Title = {
  id: number;
  name: string;
  description: string;
  requiredPower: number;
};

type DailyStormTask = {
  id: number;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  expiresAt: number;
  type: 'strike' | 'tame' | 'upgrade' | 'ability' | 'sector';
};

type BarrierState = {
  active: boolean;
  expiresAt: number | null;
  strength: number;
};

type ThunderNexusState = {
  creatures: Creature[];
  sectors: Sector[];
  equipment: Equipment[];
  facilities: Facility[];
  abilities: Ability[];
  achievements: Achievement[];
  currentSector: number;
  thunderEnergy: number;
  staticCharge: number;
  lightningStrikes: number;
  creaturesTamed: number;
  titleIndex: number;
  nexusPower: number;
  stormIntensity: number;
  dailyStormTask: DailyStormTask;
  barrier: BarrierState;
  stormCalmed: boolean;
  totalUpgrades: number;
  totalAbilitiesUsed: number;
  sectorsExplored: number;
};

// ── Seed Data ─────────────────────────────────────────────────────

function buildInitialCreatures(): Creature[] {
  return [
    // Common (7)
    { id: 1, name: 'Spark Sprite', rarity: 'Common', power: 5, speed: 12, description: 'A tiny flickering spirit born from stray lightning arcs.', tamed: false, tamedAt: null, stormAffinity: 10 },
    { id: 2, name: 'Static Wisp', rarity: 'Common', power: 4, speed: 15, description: 'A drifting ball of crackling static that hums in the wind.', tamed: false, tamedAt: null, stormAffinity: 8 },
    { id: 3, name: 'Bolt Hare', rarity: 'Common', power: 6, speed: 20, description: 'A rabbit that moves at the speed of a lightning bolt.', tamed: false, tamedAt: null, stormAffinity: 12 },
    { id: 4, name: 'Thunder Mouse', rarity: 'Common', power: 3, speed: 18, description: 'A small rodent that crackles with every step.', tamed: false, tamedAt: null, stormAffinity: 6 },
    { id: 5, name: 'Flash Finch', rarity: 'Common', power: 5, speed: 22, description: 'A bird whose feathers glow with electric charge.', tamed: false, tamedAt: null, stormAffinity: 9 },
    { id: 6, name: 'Zap Toad', rarity: 'Common', power: 7, speed: 8, description: 'An amphibian that shocks anything that touches it.', tamed: false, tamedAt: null, stormAffinity: 11 },
    { id: 7, name: 'Spark Fly', rarity: 'Common', power: 3, speed: 25, description: 'An insect that leaves trails of tiny sparks.', tamed: false, tamedAt: null, stormAffinity: 7 },
    // Uncommon (7)
    { id: 8, name: 'Storm Hawk', rarity: 'Uncommon', power: 15, speed: 28, description: 'A raptor that rides gale-force winds and strikes with lightning talons.', tamed: false, tamedAt: null, stormAffinity: 25 },
    { id: 9, name: 'Cyclone Wolf', rarity: 'Uncommon', power: 18, speed: 24, description: 'A predator that summons miniature tornadoes while hunting.', tamed: false, tamedAt: null, stormAffinity: 22 },
    { id: 10, name: 'Voltage Lizard', rarity: 'Uncommon', power: 14, speed: 16, description: 'A reptile whose scales generate voltage on contact.', tamed: false, tamedAt: null, stormAffinity: 20 },
    { id: 11, name: 'Gale Serpent', rarity: 'Uncommon', power: 20, speed: 19, description: 'A wind-riding snake that coils through storm clouds.', tamed: false, tamedAt: null, stormAffinity: 24 },
    { id: 12, name: 'Surge Fox', rarity: 'Uncommon', power: 13, speed: 26, description: 'A cunning fox that absorbs static from its surroundings.', tamed: false, tamedAt: null, stormAffinity: 21 },
    { id: 13, name: 'Thunder Rabbit', rarity: 'Uncommon', power: 12, speed: 30, description: 'A lagomorph that creates sonic booms when it leaps.', tamed: false, tamedAt: null, stormAffinity: 19 },
    { id: 14, name: 'Storm Crab', rarity: 'Uncommon', power: 22, speed: 6, description: 'A crustacean with a shell that deflects lightning.', tamed: false, tamedAt: null, stormAffinity: 23 },
    // Rare (7)
    { id: 15, name: 'Lightning Serpent', rarity: 'Rare', power: 35, speed: 22, description: 'A massive snake that channels lightning through its body.', tamed: false, tamedAt: null, stormAffinity: 40 },
    { id: 16, name: 'Tempest Phoenix', rarity: 'Rare', power: 40, speed: 30, description: 'A fiery bird reborn in thunderstorms, ablaze with plasma.', tamed: false, tamedAt: null, stormAffinity: 45 },
    { id: 17, name: 'Storm Drake', rarity: 'Rare', power: 38, speed: 20, description: 'A young dragon that breathes bolts of concentrated lightning.', tamed: false, tamedAt: null, stormAffinity: 42 },
    { id: 18, name: 'Plasma Wraith', rarity: 'Rare', power: 32, speed: 18, description: 'An ethereal entity composed entirely of ionized plasma.', tamed: false, tamedAt: null, stormAffinity: 38 },
    { id: 19, name: 'Thunder Mammoth', rarity: 'Rare', power: 50, speed: 8, description: 'A colossal beast whose footsteps trigger lightning strikes.', tamed: false, tamedAt: null, stormAffinity: 44 },
    { id: 20, name: 'Ion Eagle', rarity: 'Rare', power: 28, speed: 35, description: 'An eagle that soars through the ionosphere unharmed.', tamed: false, tamedAt: null, stormAffinity: 36 },
    { id: 21, name: 'Arc Panther', rarity: 'Rare', power: 36, speed: 27, description: 'A stealthy feline that teleports via electric arcs.', tamed: false, tamedAt: null, stormAffinity: 41 },
    // Epic (7)
    { id: 22, name: 'Thunder Drake', rarity: 'Epic', power: 65, speed: 25, description: 'An ancient drake that commands entire thunderstorms.', tamed: false, tamedAt: null, stormAffinity: 60 },
    { id: 23, name: 'Plasma Hydra', rarity: 'Epic', power: 70, speed: 14, description: 'A multi-headed horror that regenerates via plasma energy.', tamed: false, tamedAt: null, stormAffinity: 65 },
    { id: 24, name: 'Cyclone Titan', rarity: 'Epic', power: 75, speed: 10, description: 'A towering giant wrapped in perpetual cyclones.', tamed: false, tamedAt: null, stormAffinity: 62 },
    { id: 25, name: 'Storm Sovereign', rarity: 'Epic', power: 68, speed: 20, description: 'A regal creature that rules over lesser storm beasts.', tamed: false, tamedAt: null, stormAffinity: 58 },
    { id: 26, name: 'Lightning Colossus', rarity: 'Epic', power: 80, speed: 5, description: 'A golem of pure lightning that devastates the battlefield.', tamed: false, tamedAt: null, stormAffinity: 67 },
    { id: 27, name: 'Voltage Golem', rarity: 'Epic', power: 72, speed: 7, description: 'A mechanical construct powered by infinite voltage.', tamed: false, tamedAt: null, stormAffinity: 64 },
    { id: 28, name: 'Tempest Sphinx', rarity: 'Epic', power: 60, speed: 22, description: 'A riddle-spouting enigma wreathed in violent storms.', tamed: false, tamedAt: null, stormAffinity: 55 },
    // Legendary (7)
    { id: 29, name: 'Zephyr Leviathan', rarity: 'Legendary', power: 100, speed: 18, description: 'An abyssal beast that swims through the sky itself.', tamed: false, tamedAt: null, stormAffinity: 85 },
    { id: 30, name: 'Eternal Thunderbird', rarity: 'Legendary', power: 110, speed: 35, description: 'The primordial bird whose wingspan spans entire storm systems.', tamed: false, tamedAt: null, stormAffinity: 90 },
    { id: 31, name: 'Storm Primordial', rarity: 'Legendary', power: 120, speed: 12, description: 'An ancient entity older than the first thunderstorm.', tamed: false, tamedAt: null, stormAffinity: 95 },
    { id: 32, name: 'Aether Vortex', rarity: 'Legendary', power: 95, speed: 30, description: 'A sentient vortex of pure aetheric energy.', tamed: false, tamedAt: null, stormAffinity: 88 },
    { id: 33, name: 'Ragnarok Wyrm', rarity: 'Legendary', power: 130, speed: 8, description: 'The world-ending serpent prophesied to shatter the sky.', tamed: false, tamedAt: null, stormAffinity: 100 },
    { id: 34, name: 'Chrono Tempest', rarity: 'Legendary', power: 105, speed: 25, description: 'A temporal storm entity that exists across all moments.', tamed: false, tamedAt: null, stormAffinity: 92 },
    { id: 35, name: 'Nexus Dragon', rarity: 'Legendary', power: 150, speed: 20, description: 'The guardian of the Eternal Storm Core itself.', tamed: false, tamedAt: null, stormAffinity: 100 },
  ];
}

function buildInitialSectors(): Sector[] {
  return [
    { id: 0, name: 'Lightning Forge', description: 'The industrial heart where raw lightning is forged into usable energy and equipment.', unlocked: true, unlockCost: 0, energyGenerated: 5, dangerLevel: 1, creatureSpawns: ['Spark Sprite', 'Static Wisp', 'Bolt Hare'] },
    { id: 1, name: 'Storm Eye Observatory', description: 'A towering lookout post at the calm center of the hurricane, used for storm reading.', unlocked: false, unlockCost: 50, energyGenerated: 3, dangerLevel: 2, creatureSpawns: ['Flash Finch', 'Zap Toad', 'Storm Hawk'] },
    { id: 2, name: 'Thunder Peak Arena', description: 'A combat arena built atop the highest storm cloud, where creatures battle for dominance.', unlocked: false, unlockCost: 100, energyGenerated: 0, dangerLevel: 5, creatureSpawns: ['Cyclone Wolf', 'Gale Serpent', 'Storm Crab'] },
    { id: 3, name: 'Wind Tunnel', description: 'A high-speed corridor of concentrated wind currents used for rapid travel.', unlocked: false, unlockCost: 150, energyGenerated: 4, dangerLevel: 3, creatureSpawns: ['Voltage Lizard', 'Surge Fox', 'Thunder Rabbit'] },
    { id: 4, name: 'Cloud Bridge', description: 'A suspended walkway across cumulonimbus formations connecting distant fortress sections.', unlocked: false, unlockCost: 200, energyGenerated: 2, dangerLevel: 4, creatureSpawns: ['Lightning Serpent', 'Tempest Phoenix', 'Storm Drake'] },
    { id: 5, name: 'Static Fields', description: 'Vast open plains crackling with static energy where rare creatures graze.', unlocked: false, unlockCost: 300, energyGenerated: 8, dangerLevel: 6, creatureSpawns: ['Plasma Wraith', 'Arc Panther', 'Ion Eagle'] },
    { id: 6, name: 'Tempest Harbor', description: 'A docking bay for storm vessels and the gateway to the outer storm wall.', unlocked: false, unlockCost: 500, energyGenerated: 6, dangerLevel: 7, creatureSpawns: ['Thunder Drake', 'Plasma Hydra', 'Cyclone Titan'] },
    { id: 7, name: 'Eternal Storm Core', description: 'The innermost sanctum of infinite storm energy, guarded by the Nexus Dragon.', unlocked: false, unlockCost: 1000, energyGenerated: 15, dangerLevel: 10, creatureSpawns: ['Zephyr Leviathan', 'Eternal Thunderbird', 'Nexus Dragon'] },
  ];
}

function buildInitialEquipment(): Equipment[] {
  return [
    { id: 1, name: 'Lightning Rod', description: 'A basic conductor that attracts and stores stray lightning bolts.', rarity: 'Common', power: 3, defense: 1, equipped: false, cost: 10 },
    { id: 2, name: 'Storm Gauge', description: 'A measuring device that predicts incoming storm patterns.', rarity: 'Common', power: 1, defense: 2, equipped: false, cost: 15 },
    { id: 3, name: 'Thunder Shield', description: 'A buckler that absorbs electrical attacks and discharges them.', rarity: 'Common', power: 2, defense: 5, equipped: false, cost: 20 },
    { id: 4, name: 'Wind Compass', description: 'A compass attuned to air currents for navigation in storms.', rarity: 'Common', power: 1, defense: 1, equipped: false, cost: 12 },
    { id: 5, name: 'Static Gloves', description: 'Insulated gloves that let the wearer channel static electricity.', rarity: 'Common', power: 4, defense: 0, equipped: false, cost: 18 },
    { id: 6, name: 'Spark Amulet', description: 'An amulet that glows faintly, enhancing lightning sensitivity.', rarity: 'Common', power: 3, defense: 1, equipped: false, cost: 14 },
    { id: 7, name: 'Gale Cloak', description: 'A lightweight cloak that reduces wind resistance to zero.', rarity: 'Uncommon', power: 2, defense: 6, equipped: false, cost: 40 },
    { id: 8, name: 'Bolt Pendant', description: 'A pendant that stores emergency lightning charges for later use.', rarity: 'Uncommon', power: 8, defense: 2, equipped: false, cost: 45 },
    { id: 9, name: 'Storm Helm', description: 'A helmet with a built-in visor for seeing through blinding rain.', rarity: 'Uncommon', power: 3, defense: 10, equipped: false, cost: 50 },
    { id: 10, name: 'Thunder Boots', description: 'Boots that ground the wearer and allow walking on clouds.', rarity: 'Uncommon', power: 5, defense: 4, equipped: false, cost: 42 },
    { id: 11, name: 'Ion Gauntlets', description: 'Gauntlets that amplify the wearer\'s bio-electric output.', rarity: 'Uncommon', power: 12, defense: 3, equipped: false, cost: 48 },
    { id: 12, name: 'Arc Ring', description: 'A ring that creates small electric arcs between the fingers.', rarity: 'Uncommon', power: 10, defense: 2, equipped: false, cost: 38 },
    { id: 13, name: 'Lightning Lance', description: 'A spear that crackles with concentrated lightning energy.', rarity: 'Rare', power: 22, defense: 5, equipped: false, cost: 120 },
    { id: 14, name: 'Tempest Armor', description: 'Full-body armor forged in the heart of a thunderstorm.', rarity: 'Rare', power: 8, defense: 25, equipped: false, cost: 150 },
    { id: 15, name: 'Storm Crown', description: 'A crown that grants authority over lesser wind spirits.', rarity: 'Rare', power: 15, defense: 12, equipped: false, cost: 130 },
    { id: 16, name: 'Plasma Blade', description: 'A sword with a blade of pure superheated plasma.', rarity: 'Rare', power: 30, defense: 3, equipped: false, cost: 140 },
    { id: 17, name: 'Voltage Visor', description: 'A visor that reveals hidden electrical patterns in the environment.', rarity: 'Rare', power: 10, defense: 15, equipped: false, cost: 110 },
    { id: 18, name: 'Cyclone Cape', description: 'A cape that creates a personal wind barrier around the wearer.', rarity: 'Rare', power: 6, defense: 20, equipped: false, cost: 125 },
    { id: 19, name: 'Thunder Hammer', description: 'A war hammer that creates shockwaves with every strike.', rarity: 'Epic', power: 45, defense: 10, equipped: false, cost: 350 },
    { id: 20, name: 'Stormbreaker Shield', description: 'An indestructible shield that can shatter entire storm fronts.', rarity: 'Epic', power: 12, defense: 50, equipped: false, cost: 400 },
    { id: 21, name: 'Aether Bow', description: 'A bow that fires arrows of condensed aetheric energy.', rarity: 'Epic', power: 40, defense: 5, equipped: false, cost: 380 },
    { id: 22, name: 'Lightning Mantle', description: 'A mantle of living lightning that attacks nearby enemies.', rarity: 'Epic', power: 35, defense: 30, equipped: false, cost: 370 },
    { id: 23, name: 'Tempest Orb', description: 'A floating orb that generates a protective storm dome.', rarity: 'Epic', power: 20, defense: 40, equipped: false, cost: 360 },
    { id: 24, name: 'Chain Lightning Staff', description: 'A staff that fires bolts that arc between multiple targets.', rarity: 'Epic', power: 50, defense: 8, equipped: false, cost: 390 },
    { id: 25, name: 'Nexus Core Gem', description: 'A gem extracted from the Eternal Storm Core of immense power.', rarity: 'Legendary', power: 80, defense: 40, equipped: false, cost: 800 },
    { id: 26, name: 'Ragnarok Gauntlet', description: 'A gauntlet imbued with the power to call down world-ending storms.', rarity: 'Legendary', power: 100, defense: 25, equipped: false, cost: 900 },
    { id: 27, name: 'Primordial Storm Cloak', description: 'A cloak woven from the fabric of the first thunderstorm.', rarity: 'Legendary', power: 70, defense: 60, equipped: false, cost: 850 },
    { id: 28, name: 'Thunder God\'s Wrath', description: 'A weapon that channels the fury of ancient thunder deities.', rarity: 'Legendary', power: 120, defense: 15, equipped: false, cost: 1000 },
    { id: 29, name: 'Eternal Storm Crown', description: 'The crown of the storm sovereign, radiating infinite power.', rarity: 'Legendary', power: 90, defense: 55, equipped: false, cost: 950 },
    { id: 30, name: 'Void Lightning Blade', description: 'A blade forged from lightning that has passed through the void.', rarity: 'Legendary', power: 110, defense: 35, equipped: false, cost: 980 },
  ];
}

function buildInitialFacilities(): Facility[] {
  return [
    { id: 1, name: 'Tesla Tower', description: 'A towering spire that harvests atmospheric electricity.', level: 1, upgradeCost: 20, energyOutput: 5, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 2, name: 'Wind Generator', description: 'Massive turbines that convert storm winds into usable energy.', level: 1, upgradeCost: 15, energyOutput: 4, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 3, name: 'Storm Cell', description: 'A containment unit for storing raw storm energy.', level: 1, upgradeCost: 25, energyOutput: 6, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 4, name: 'Thunder Forge', description: 'A forge heated by lightning where equipment is crafted.', level: 1, upgradeCost: 30, energyOutput: 3, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 5, name: 'Lightning Rod Array', description: 'An interconnected grid of lightning rods maximizing capture.', level: 1, upgradeCost: 18, energyOutput: 7, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 6, name: 'Cloud Harvester', description: 'A device that extracts charged water vapor from clouds.', level: 1, upgradeCost: 22, energyOutput: 5, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 7, name: 'Plasma Condenser', description: 'Condenses diffuse plasma into concentrated energy cells.', level: 1, upgradeCost: 35, energyOutput: 8, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 8, name: 'Static Accumulator', description: 'Gathers ambient static charge from the environment.', level: 1, upgradeCost: 12, energyOutput: 3, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 9, name: 'Storm Radar', description: 'Detects incoming weather patterns and creature movements.', level: 1, upgradeCost: 20, energyOutput: 2, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 10, name: 'Thunder Storage Vault', description: 'A reinforced vault for storing excess thunder energy.', level: 1, upgradeCost: 40, energyOutput: 0, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 11, name: 'Aether Refinery', description: 'Refines raw aetheric energy from storm cores into pure form.', level: 1, upgradeCost: 50, energyOutput: 10, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 12, name: 'Temple of Storms', description: 'A sacred structure that amplifies the nexus\'s storm power.', level: 1, upgradeCost: 60, energyOutput: 12, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 13, name: 'Creature Sanctuary', description: 'A safe haven for tamed thunder creatures to rest and grow.', level: 1, upgradeCost: 45, energyOutput: 2, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 14, name: 'Battle Spire', description: 'A training spire where creatures and masters hone combat skills.', level: 1, upgradeCost: 35, energyOutput: 1, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 15, name: 'Lightning Foundry', description: 'A specialized forge for creating lightning-enhanced alloys.', level: 1, upgradeCost: 55, energyOutput: 4, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 16, name: 'Wind Channel', description: 'An artificial wind tunnel for directing storm currents.', level: 1, upgradeCost: 28, energyOutput: 6, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 17, name: 'Thunder Archive', description: 'Stores ancient knowledge of storm manipulation techniques.', level: 1, upgradeCost: 32, energyOutput: 3, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 18, name: 'Energy Nexus Hub', description: 'Central distribution point for all harvested energy.', level: 1, upgradeCost: 70, energyOutput: 15, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 19, name: 'Storm Wall Generator', description: 'Projects a defensive wall of compressed storm energy.', level: 1, upgradeCost: 65, energyOutput: 5, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 20, name: 'Thunder Beacon', description: 'A lighthouse-like structure that guides creatures and allies.', level: 1, upgradeCost: 24, energyOutput: 3, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 21, name: 'Ion Collector', description: 'Harvests ionized particles from the upper atmosphere.', level: 1, upgradeCost: 38, energyOutput: 9, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 22, name: 'Tempest Nursery', description: 'Incubates thunder creature eggs until they hatch.', level: 1, upgradeCost: 42, energyOutput: 1, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 23, name: 'Arc Forge', description: 'Creates electric arcs for powering complex machinery.', level: 1, upgradeCost: 48, energyOutput: 7, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 24, name: 'Storm Engine', description: 'A massive engine that converts storm energy into propulsion.', level: 1, upgradeCost: 80, energyOutput: 20, maxLevel: TN_MAX_FACILITY_LEVEL },
    { id: 25, name: 'Eternal Core Chamber', description: 'Houses a fragment of the Eternal Storm Core itself.', level: 1, upgradeCost: 100, energyOutput: 25, maxLevel: TN_MAX_FACILITY_LEVEL },
  ];
}

function buildInitialAbilities(): Ability[] {
  return [
    { id: 1, name: 'Lightning Strike', description: 'Call down a targeted bolt of lightning on a single enemy.', cooldown: 3, currentCooldown: 0, energyCost: 10, unlocked: true, unlockCost: 0, power: TN_LIGHTNING_BASE_DAMAGE, type: 'offensive' },
    { id: 2, name: 'Thunder Roar', description: 'Emit a devastating sonic boom that stuns all nearby foes.', cooldown: 8, currentCooldown: 0, energyCost: 25, unlocked: true, unlockCost: 0, power: 20, type: 'offensive' },
    { id: 3, name: 'Wind Gust', description: 'Release a powerful gust of wind to push enemies back.', cooldown: 4, currentCooldown: 0, energyCost: 8, unlocked: true, unlockCost: 0, power: 10, type: 'utility' },
    { id: 4, name: 'Static Field', description: 'Generate a field of static that slows and damages enemies.', cooldown: 10, currentCooldown: 0, energyCost: 30, unlocked: false, unlockCost: 50, power: 15, type: 'offensive' },
    { id: 5, name: 'Chain Lightning', description: 'Fire a bolt that arcs between multiple targets.', cooldown: 12, currentCooldown: 0, energyCost: 40, unlocked: false, unlockCost: 80, power: 25, type: 'offensive' },
    { id: 6, name: 'Storm Shield', description: 'Create a shield of storm energy that absorbs damage.', cooldown: 15, currentCooldown: 0, energyCost: 35, unlocked: false, unlockCost: 100, power: 30, type: 'defensive' },
    { id: 7, name: 'Thunder Walk', description: 'Move at lightning speed to a target location.', cooldown: 6, currentCooldown: 0, energyCost: 15, unlocked: false, unlockCost: 60, power: 0, type: 'utility' },
    { id: 8, name: 'Lightning Barrage', description: 'Unleash a rapid-fire series of small lightning bolts.', cooldown: 10, currentCooldown: 0, energyCost: 45, unlocked: false, unlockCost: 120, power: 35, type: 'offensive' },
    { id: 9, name: 'Gale Force', description: 'Summon a localized hurricane to sweep the area.', cooldown: 20, currentCooldown: 0, energyCost: 55, unlocked: false, unlockCost: 150, power: 40, type: 'offensive' },
    { id: 10, name: 'Static Discharge', description: 'Release all accumulated static charge in a single burst.', cooldown: 5, currentCooldown: 0, energyCost: 20, unlocked: false, unlockCost: 70, power: 20, type: 'offensive' },
    { id: 11, name: 'Thunder Cloak', description: 'Wrap yourself in a cloak of lightning that damages attackers.', cooldown: 18, currentCooldown: 0, energyCost: 50, unlocked: false, unlockCost: 200, power: 25, type: 'defensive' },
    { id: 12, name: 'Eye of the Storm', description: 'Create a calm zone that reveals all hidden enemies.', cooldown: 25, currentCooldown: 0, energyCost: 40, unlocked: false, unlockCost: 180, power: 0, type: 'utility' },
    { id: 13, name: 'Plasma Beam', description: 'Fire a concentrated beam of superheated plasma.', cooldown: 15, currentCooldown: 0, energyCost: 60, unlocked: false, unlockCost: 250, power: 50, type: 'offensive' },
    { id: 14, name: 'Storm Surge', description: 'Send a massive wave of storm energy forward.', cooldown: 22, currentCooldown: 0, energyCost: 70, unlocked: false, unlockCost: 300, power: 55, type: 'offensive' },
    { id: 15, name: 'Wind Barrier', description: 'Erect a wall of compressed wind that blocks projectiles.', cooldown: 14, currentCooldown: 0, energyCost: 30, unlocked: false, unlockCost: 160, power: 35, type: 'defensive' },
    { id: 16, name: 'Thunder Summon', description: 'Call a thunder creature to fight alongside you.', cooldown: 30, currentCooldown: 0, energyCost: 80, unlocked: false, unlockCost: 400, power: 45, type: 'utility' },
    { id: 17, name: 'Lightning Cage', description: 'Trap an enemy in a cage of electrically charged bars.', cooldown: 20, currentCooldown: 0, energyCost: 55, unlocked: false, unlockCost: 280, power: 30, type: 'offensive' },
    { id: 18, name: 'Tempest Fury', description: 'Enter a berserk state powered by pure storm rage.', cooldown: 45, currentCooldown: 0, energyCost: 90, unlocked: false, unlockCost: 500, power: 70, type: 'offensive' },
    { id: 19, name: 'Aether Shield', description: 'Create an impenetrable shield of aetheric energy.', cooldown: 35, currentCooldown: 0, energyCost: 75, unlocked: false, unlockCost: 450, power: 60, type: 'defensive' },
    { id: 20, name: 'Storm Teleport', description: 'Teleport through the storm to any visible location.', cooldown: 12, currentCooldown: 0, energyCost: 45, unlocked: false, unlockCost: 350, power: 0, type: 'utility' },
    { id: 21, name: 'Ragnarok Bolt', description: 'Call down the most devastating bolt in existence.', cooldown: 60, currentCooldown: 0, energyCost: 100, unlocked: false, unlockCost: 800, power: 100, type: 'offensive' },
    { id: 22, name: 'Eternal Storm', description: 'Unleash the full power of the Eternal Storm Core.', cooldown: 120, currentCooldown: 0, energyCost: 150, unlocked: false, unlockCost: 1000, power: 150, type: 'offensive' },
  ];
}

function buildInitialAchievements(): Achievement[] {
  return [
    { id: 1, name: 'First Spark', description: 'Perform your first lightning strike.', unlocked: false, unlockedAt: null, condition: 'lightningStrikes >= 1', reward: '+10 Thunder Energy' },
    { id: 2, name: 'Storm Novice', description: 'Strike lightning 10 times.', unlocked: false, unlockedAt: null, condition: 'lightningStrikes >= 10', reward: '+25 Thunder Energy' },
    { id: 3, name: 'Creature Tamer', description: 'Tame your first thunder creature.', unlocked: false, unlockedAt: null, condition: 'creaturesTamed >= 1', reward: '+30 Nexus Power' },
    { id: 4, name: 'Bestiary Keeper', description: 'Tame 10 different creatures.', unlocked: false, unlockedAt: null, condition: 'creaturesTamed >= 10', reward: '+50 Nexus Power' },
    { id: 5, name: 'Energy Hoarder', description: 'Reach maximum thunder energy capacity.', unlocked: false, unlockedAt: null, condition: 'thunderEnergy >= 200', reward: '+20 Max Energy' },
    { id: 6, name: 'Sector Explorer', description: 'Unlock 3 different nexus sectors.', unlocked: false, unlockedAt: null, condition: 'sectorsExplored >= 3', reward: '+40 Thunder Energy' },
    { id: 7, name: 'Fortress Builder', description: 'Upgrade 5 facilities to level 5 or higher.', unlocked: false, unlockedAt: null, condition: 'totalUpgrades >= 25', reward: '+60 Nexus Power' },
    { id: 8, name: 'Master Builder', description: 'Fully upgrade any facility to level 10.', unlocked: false, unlockedAt: null, condition: 'totalUpgrades >= 10', reward: 'Facility Discount 10%' },
    { id: 9, name: 'Ability Master', description: 'Unlock and use 10 different abilities.', unlocked: false, unlockedAt: null, condition: 'totalAbilitiesUsed >= 10', reward: '+30 Thunder Energy' },
    { id: 10, name: 'Static Overload', description: 'Reach maximum static charge.', unlocked: false, unlockedAt: null, condition: 'staticCharge >= 100', reward: '+50 Static Charge' },
    { id: 11, name: 'Storm Calmer', description: 'Successfully calm the storm for the first time.', unlocked: false, unlockedAt: null, condition: 'stormCalmed >= 1', reward: '+80 Nexus Power' },
    { id: 12, name: 'Nexus Guardian', description: 'Accumulate 1000 nexus power.', unlocked: false, unlockedAt: null, condition: 'nexusPower >= 1000', reward: 'Title: Storm Commander' },
    { id: 13, name: 'Chain Reaction', description: 'Use Chain Lightning to hit 5 targets at once.', unlocked: false, unlockedAt: null, condition: 'totalAbilitiesUsed >= 20', reward: '+40 Thunder Energy' },
    { id: 14, name: 'Legendary Tamer', description: 'Tame a Legendary-rarity creature.', unlocked: false, unlockedAt: null, condition: 'creaturesTamed >= 29', reward: '+200 Nexus Power' },
    { id: 15, name: 'Full Arsenal', description: 'Equip 5 pieces of equipment simultaneously.', unlocked: false, unlockedAt: null, condition: 'totalUpgrades >= 50', reward: '+100 Thunder Energy' },
    { id: 16, name: 'Eye of Eternity', description: 'Unlock the Eternal Storm Core sector.', unlocked: false, unlockedAt: null, condition: 'sectorsExplored >= 8', reward: '+500 Nexus Power' },
    { id: 17, name: 'Thunder Deity', description: 'Reach the maximum title rank.', unlocked: false, unlockedAt: null, condition: 'titleIndex >= 7', reward: 'Exclusive Skin: Thunder God' },
    { id: 18, name: 'Storm Supremacy', description: 'Accumulate 5000 nexus power.', unlocked: false, unlockedAt: null, condition: 'nexusPower >= 5000', reward: '+300 Nexus Power' },
  ];
}

function buildTitles(): Title[] {
  return [
    { id: 0, name: 'Storm Watcher', description: 'A novice observer of the eternal storm.', requiredPower: 0 },
    { id: 1, name: 'Wind Runner', description: 'One who can navigate the fiercest gales.', requiredPower: 100 },
    { id: 2, name: 'Spark Apprentice', description: 'A student learning to harness lightning.', requiredPower: 300 },
    { id: 3, name: 'Thunder Scout', description: 'An explorer of the storm\'s deepest reaches.', requiredPower: 600 },
    { id: 4, name: 'Storm Commander', description: 'A leader who commands storm forces.', requiredPower: 1000 },
    { id: 5, name: 'Lightning Warden', description: 'A guardian of the nexus\'s lightning energy.', requiredPower: 2000 },
    { id: 6, name: 'Tempest Lord', description: 'A ruler who bends storms to their will.', requiredPower: 4000 },
    { id: 7, name: 'Thunder Deity', description: 'The supreme master of all thunder and storms.', requiredPower: 8000 },
  ];
}

function generateDailyTask(): DailyStormTask {
  const taskTemplates = [
    { description: 'Strike lightning 5 times', target: 5, type: 'strike' as const },
    { description: 'Tame 3 creatures', target: 3, type: 'tame' as const },
    { description: 'Upgrade 2 facilities', target: 2, type: 'upgrade' as const },
    { description: 'Use abilities 5 times', target: 5, type: 'ability' as const },
    { description: 'Explore 1 new sector', target: 1, type: 'sector' as const },
    { description: 'Charge static to 50', target: 50, type: 'strike' as const },
    { description: 'Strike lightning 10 times', target: 10, type: 'strike' as const },
    { description: 'Tame a Rare creature', target: 1, type: 'tame' as const },
  ];
  const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
  return {
    id: Date.now(),
    description: template.description,
    target: template.target,
    progress: 0,
    reward: template.target * 15,
    completed: false,
    expiresAt: Date.now() + TN_DAILY_TASK_EXPIRY_MS,
    type: template.type,
  };
}

function buildInitialState(): ThunderNexusState {
  return {
    creatures: buildInitialCreatures(),
    sectors: buildInitialSectors(),
    equipment: buildInitialEquipment(),
    facilities: buildInitialFacilities(),
    abilities: buildInitialAbilities(),
    achievements: buildInitialAchievements(),
    currentSector: 0,
    thunderEnergy: TN_MAX_ENERGY,
    staticCharge: 0,
    lightningStrikes: 0,
    creaturesTamed: 0,
    titleIndex: 0,
    nexusPower: 0,
    stormIntensity: 50,
    dailyStormTask: generateDailyTask(),
    barrier: { active: false, expiresAt: null, strength: 0 },
    stormCalmed: false,
    totalUpgrades: 0,
    totalAbilitiesUsed: 0,
    sectorsExplored: 1,
  };
}

// ═══════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useThunderNexus() {
  const [state, setState] = useState<ThunderNexusState>(buildInitialState);
  const stateRef = useRef<ThunderNexusState>(state);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const titles = useRef<Title[]>(buildTitles());

  // Keep stateRef in sync — ONLY inside useEffect as per rules
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── Energy regeneration tick ────────────────────────────────────
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setState(prev => {
        const totalEnergyOutput = prev.facilities.reduce((sum, f) => sum + f.energyOutput * f.level, 0);
        const regenRate = TN_ENERGY_REGEN_RATE + Math.floor(totalEnergyOutput / 10);
        const newEnergy = Math.min(prev.thunderEnergy + regenRate, TN_MAX_ENERGY);
        const staticDecay = Math.max(0, prev.staticCharge - TN_STATIC_DECAY_RATE);
        const barrierExpired = prev.barrier.active && prev.barrier.expiresAt !== null && Date.now() > prev.barrier.expiresAt;
        const taskExpired = Date.now() > prev.dailyStormTask.expiresAt;
        return {
          ...prev,
          thunderEnergy: newEnergy,
          staticCharge: staticDecay,
          barrier: barrierExpired ? { active: false, expiresAt: null, strength: 0 } : prev.barrier,
          dailyStormTask: taskExpired ? generateDailyTask() : prev.dailyStormTask,
        };
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  // ── Ability cooldown tick ───────────────────────────────────────
  useEffect(() => {
    const cdTick = setInterval(() => {
      setState(prev => ({
        ...prev,
        abilities: prev.abilities.map(a => ({
          ...a,
          currentCooldown: Math.max(0, a.currentCooldown - 1),
        })),
      }));
    }, 1000);
    return () => clearInterval(cdTick);
  }, []);

  // ── Computed values via useMemo ─────────────────────────────────

  const currentSectorData = useMemo(() => {
    return state.sectors.find(s => s.id === state.currentSector) ?? state.sectors[0];
  }, [state]);

  const tamedCreatures = useMemo(() => {
    return state.creatures.filter(c => c.tamed);
  }, [state]);

  const equippedItems = useMemo(() => {
    return state.equipment.filter(e => e.equipped);
  }, [state]);

  const totalEquipPower = useMemo(() => {
    return equippedItems.reduce((sum, e) => sum + e.power + e.defense, 0);
  }, [equippedItems]);

  const unlockedAbilities = useMemo(() => {
    return state.abilities.filter(a => a.unlocked);
  }, [state]);

  const readyAbilities = useMemo(() => {
    return state.abilities.filter(a => a.unlocked && a.currentCooldown === 0);
  }, [state]);

  const totalFacilityEnergy = useMemo(() => {
    return state.facilities.reduce((sum, f) => sum + f.energyOutput * f.level, 0);
  }, [state]);

  const creaturesByRarity = useMemo(() => {
    const grouped: Record<RarityTier, Creature[]> = { Common: [], Uncommon: [], Rare: [], Epic: [], Legendary: [] };
    state.creatures.forEach(c => grouped[c.rarity].push(c));
    return grouped;
  }, [state]);

  const tamedCountByRarity = useMemo(() => {
    const counts: Record<RarityTier, number> = { Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0 };
    state.creatures.forEach(c => { if (c.tamed) counts[c.rarity]++; });
    return counts;
  }, [state]);

  const isBarrierActive = useMemo(() => {
    return state.barrier.active && state.barrier.expiresAt !== null && Date.now() < state.barrier.expiresAt;
  }, [state]);

  const availableSectors = useMemo(() => {
    return state.sectors.filter(s => s.unlocked);
  }, [state]);

  const stormStatus = useMemo(() => {
    if (state.stormIntensity >= 80) return 'Catastrophic';
    if (state.stormIntensity >= 60) return 'Severe';
    if (state.stormIntensity >= 40) return 'Moderate';
    if (state.stormIntensity >= 20) return 'Light';
    return 'Calm';
  }, [state]);

  const stormColor = useMemo(() => {
    if (state.stormIntensity >= 80) return '#FF1744';
    if (state.stormIntensity >= 60) return TN_LIGHTNING_YELLOW;
    if (state.stormIntensity >= 40) return TN_ELECTRIC_BLUE;
    return TN_STORM_GRAY;
  }, [state]);

  const energyPercent = useMemo(() => {
    return Math.round((state.thunderEnergy / TN_MAX_ENERGY) * 100);
  }, [state]);

  const chargePercent = useMemo(() => {
    return Math.round((state.staticCharge / TN_MAX_STATIC_CHARGE) * 100);
  }, [state]);

  const nexusPowerPercent = useMemo(() => {
    return Math.round((state.nexusPower / TN_MAX_NEXUS_POWER) * 100);
  }, [state]);

  const nextTitle = useMemo(() => {
    const currentIdx = state.titleIndex;
    if (currentIdx >= titles.current.length - 1) return null;
    return titles.current[currentIdx + 1];
  }, [state]);

  const powerToNextTitle = useMemo(() => {
    if (!nextTitle) return 0;
    return Math.max(0, nextTitle.requiredPower - state.nexusPower);
  }, [state, nextTitle]);

  // ── Action: strikeLightning ─────────────────────────────────────
  const strikeLightning = useCallback((targetCreatureId?: number) => {
    setState(prev => {
      const energyCost = 10;
      if (prev.thunderEnergy < energyCost) return prev;
      const newEnergy = prev.thunderEnergy - energyCost;
      const newStrikes = prev.lightningStrikes + 1;
      const newNexusPower = Math.min(prev.nexusPower + TN_NEXUS_POWER_PER_STRIKE, TN_MAX_NEXUS_POWER);
      const intensityShift = Math.min(prev.stormIntensity + 1, TN_MAX_STORM_INTENSITY);
      const newStaticCharge = Math.min(prev.staticCharge + 2, TN_MAX_STATIC_CHARGE);
      let newCreatures = prev.creatures;
      if (targetCreatureId !== undefined) {
        newCreatures = prev.creatures.map(c => {
          if (c.id === targetCreatureId) {
            return { ...c, power: Math.max(0, c.power - TN_LIGHTNING_BASE_DAMAGE) };
          }
          return c;
        });
      }
      const newTask = prev.dailyStormTask.type === 'strike' && !prev.dailyStormTask.completed
        ? { ...prev.dailyStormTask, progress: prev.dailyStormTask.progress + 1, completed: prev.dailyStormTask.progress + 1 >= prev.dailyStormTask.target }
        : prev.dailyStormTask;
      return {
        ...prev,
        thunderEnergy: newEnergy,
        lightningStrikes: newStrikes,
        nexusPower: newNexusPower,
        stormIntensity: intensityShift,
        staticCharge: newStaticCharge,
        creatures: newCreatures,
        dailyStormTask: newTask,
      };
    });
  }, []);

  // ── Action: tameCreature ────────────────────────────────────────
  const tameCreature = useCallback((creatureId: number) => {
    setState(prev => {
      const creature = prev.creatures.find(c => c.id === creatureId);
      if (!creature || creature.tamed) return prev;
      const energyCost = 5 + creature.power;
      if (prev.thunderEnergy < energyCost) return prev;
      const newEnergy = prev.thunderEnergy - energyCost;
      const newNexusPower = Math.min(prev.nexusPower + TN_NEXUS_POWER_PER_TAME, TN_MAX_NEXUS_POWER);
      const newTamedCount = prev.creaturesTamed + 1;
      const newCreatures = prev.creatures.map(c =>
        c.id === creatureId ? { ...c, tamed: true, tamedAt: Date.now() } : c
      );
      const newTask = prev.dailyStormTask.type === 'tame' && !prev.dailyStormTask.completed
        ? { ...prev.dailyStormTask, progress: prev.dailyStormTask.progress + 1, completed: prev.dailyStormTask.progress + 1 >= prev.dailyStormTask.target }
        : prev.dailyStormTask;
      return {
        ...prev,
        thunderEnergy: newEnergy,
        nexusPower: newNexusPower,
        creaturesTamed: newTamedCount,
        creatures: newCreatures,
        dailyStormTask: newTask,
      };
    });
  }, []);

  // ── Action: upgradeFacility ─────────────────────────────────────
  const upgradeFacility = useCallback((facilityId: number) => {
    setState(prev => {
      const facility = prev.facilities.find(f => f.id === facilityId);
      if (!facility) return prev;
      if (facility.level >= facility.maxLevel) return prev;
      const cost = Math.floor(facility.upgradeCost * Math.pow(1.5, facility.level - 1));
      if (prev.thunderEnergy < cost) return prev;
      const newEnergy = prev.thunderEnergy - cost;
      const newNexusPower = Math.min(prev.nexusPower + TN_NEXUS_POWER_PER_UPGRADE, TN_MAX_NEXUS_POWER);
      const newTotalUpgrades = prev.totalUpgrades + 1;
      const newFacilities = prev.facilities.map(f =>
        f.id === facilityId ? { ...f, level: f.level + 1 } : f
      );
      const newTask = prev.dailyStormTask.type === 'upgrade' && !prev.dailyStormTask.completed
        ? { ...prev.dailyStormTask, progress: prev.dailyStormTask.progress + 1, completed: prev.dailyStormTask.progress + 1 >= prev.dailyStormTask.target }
        : prev.dailyStormTask;
      return {
        ...prev,
        thunderEnergy: newEnergy,
        nexusPower: newNexusPower,
        totalUpgrades: newTotalUpgrades,
        facilities: newFacilities,
        dailyStormTask: newTask,
      };
    });
  }, []);

  // ── Action: activateAbility ─────────────────────────────────────
  const activateAbility = useCallback((abilityId: number) => {
    setState(prev => {
      const ability = prev.abilities.find(a => a.id === abilityId);
      if (!ability) return prev;
      if (!ability.unlocked) return prev;
      if (ability.currentCooldown > 0) return prev;
      if (prev.thunderEnergy < ability.energyCost) return prev;
      const newEnergy = prev.thunderEnergy - ability.energyCost;
      const newAbilities = prev.abilities.map(a =>
        a.id === abilityId ? { ...a, currentCooldown: a.cooldown } : a
      );
      const newTotalAbilitiesUsed = prev.totalAbilitiesUsed + 1;
      const intensityReduction = ability.type === 'defensive' ? 2 : ability.type === 'utility' ? 0 : 1;
      const newIntensity = Math.max(0, prev.stormIntensity - intensityReduction);
      const newTask = prev.dailyStormTask.type === 'ability' && !prev.dailyStormTask.completed
        ? { ...prev.dailyStormTask, progress: prev.dailyStormTask.progress + 1, completed: prev.dailyStormTask.progress + 1 >= prev.dailyStormTask.target }
        : prev.dailyStormTask;
      return {
        ...prev,
        thunderEnergy: newEnergy,
        abilities: newAbilities,
        totalAbilitiesUsed: newTotalAbilitiesUsed,
        stormIntensity: newIntensity,
        dailyStormTask: newTask,
      };
    });
  }, []);

  // ── Action: readStorm ───────────────────────────────────────────
  const readStorm = useCallback(() => {
    setState(prev => {
      const cost = 5;
      if (prev.thunderEnergy < cost) return prev;
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - cost,
        staticCharge: Math.min(prev.staticCharge + 3, TN_MAX_STATIC_CHARGE),
      };
    });
  }, []);

  // ── Action: chargeStatic ────────────────────────────────────────
  const chargeStatic = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      staticCharge: Math.min(prev.staticCharge + amount, TN_MAX_STATIC_CHARGE),
      thunderEnergy: Math.max(0, prev.thunderEnergy - Math.floor(amount / 2)),
    }));
  }, []);

  // ── Action: summonThunder ───────────────────────────────────────
  const summonThunder = useCallback(() => {
    setState(prev => {
      const cost = 40;
      if (prev.thunderEnergy < cost) return prev;
      const damageMultiplier = 1 + prev.staticCharge / TN_MAX_STATIC_CHARGE;
      const intensityIncrease = Math.floor(5 * damageMultiplier);
      const energyGain = Math.floor(10 * damageMultiplier);
      return {
        ...prev,
        thunderEnergy: Math.min(prev.thunderEnergy - cost + energyGain, TN_MAX_ENERGY),
        stormIntensity: Math.min(prev.stormIntensity + intensityIncrease, TN_MAX_STORM_INTENSITY),
        staticCharge: Math.floor(prev.staticCharge * 0.5),
        lightningStrikes: prev.lightningStrikes + 1,
        nexusPower: Math.min(prev.nexusPower + TN_NEXUS_POWER_PER_STRIKE * 2, TN_MAX_NEXUS_POWER),
      };
    });
  }, []);

  // ── Action: deployBarrier ───────────────────────────────────────
  const deployBarrier = useCallback((strength?: number) => {
    setState(prev => {
      if (prev.thunderEnergy < TN_BARRIER_COST) return prev;
      if (prev.barrier.active) return prev;
      const barrierStrength = strength ?? 50;
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - TN_BARRIER_COST,
        barrier: {
          active: true,
          expiresAt: Date.now() + TN_BARRIER_DURATION_MS,
          strength: Math.min(barrierStrength, 100),
        },
      };
    });
  }, []);

  // ── Action: calmStorm ───────────────────────────────────────────
  const calmStorm = useCallback(() => {
    setState(prev => {
      const cost = prev.staticCharge;
      if (cost < 20) return prev;
      const reduction = Math.floor(cost / 3);
      return {
        ...prev,
        staticCharge: 0,
        stormIntensity: Math.max(0, prev.stormIntensity - reduction),
        stormCalmed: true,
        nexusPower: Math.min(prev.nexusPower + 15, TN_MAX_NEXUS_POWER),
      };
    });
  }, []);

  // ── Action: travelToSector ──────────────────────────────────────
  const travelToSector = useCallback((sectorId: number) => {
    setState(prev => {
      const sector = prev.sectors.find(s => s.id === sectorId);
      if (!sector || !sector.unlocked) return prev;
      return { ...prev, currentSector: sectorId };
    });
  }, []);

  // ── Action: unlockSector ────────────────────────────────────────
  const unlockSector = useCallback((sectorId: number) => {
    setState(prev => {
      const sector = prev.sectors.find(s => s.id === sectorId);
      if (!sector || sector.unlocked) return prev;
      if (prev.thunderEnergy < sector.unlockCost) return prev;
      const newSectors = prev.sectors.map(s =>
        s.id === sectorId ? { ...s, unlocked: true } : s
      );
      const newExplored = prev.sectorsExplored + 1;
      const newTask = prev.dailyStormTask.type === 'sector' && !prev.dailyStormTask.completed
        ? { ...prev.dailyStormTask, progress: prev.dailyStormTask.progress + 1, completed: prev.dailyStormTask.progress + 1 >= prev.dailyStormTask.target }
        : prev.dailyStormTask;
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - sector.unlockCost,
        sectors: newSectors,
        sectorsExplored: newExplored,
        dailyStormTask: newTask,
      };
    });
  }, []);

  // ── Action: equipItem ───────────────────────────────────────────
  const equipItem = useCallback((equipmentId: number) => {
    setState(prev => {
      const item = prev.equipment.find(e => e.id === equipmentId);
      if (!item) return prev;
      if (item.equipped) {
        const newEquipment = prev.equipment.map(e =>
          e.id === equipmentId ? { ...e, equipped: false } : e
        );
        return { ...prev, equipment: newEquipment };
      }
      const newEquipment = prev.equipment.map(e =>
        e.id === equipmentId ? { ...e, equipped: true } : e
      );
      return { ...prev, equipment: newEquipment };
    });
  }, []);

  // ── Action: unlockAbility ───────────────────────────────────────
  const unlockAbility = useCallback((abilityId: number) => {
    setState(prev => {
      const ability = prev.abilities.find(a => a.id === abilityId);
      if (!ability || ability.unlocked) return prev;
      if (prev.thunderEnergy < ability.unlockCost) return prev;
      const newAbilities = prev.abilities.map(a =>
        a.id === abilityId ? { ...a, unlocked: true } : a
      );
      return { ...prev, thunderEnergy: prev.thunderEnergy - ability.unlockCost, abilities: newAbilities };
    });
  }, []);

  // ── Action: claimTaskReward ─────────────────────────────────────
  const claimTaskReward = useCallback(() => {
    setState(prev => {
      if (!prev.dailyStormTask.completed) return prev;
      const reward = prev.dailyStormTask.reward;
      return {
        ...prev,
        thunderEnergy: Math.min(prev.thunderEnergy + reward, TN_MAX_ENERGY),
        dailyStormTask: generateDailyTask(),
      };
    });
  }, []);

  // ── Action: checkAchievements ───────────────────────────────────
  const checkAchievements = useCallback(() => {
    setState(prev => {
      let updated = false;
      const newAchievements = prev.achievements.map(a => {
        if (a.unlocked) return a;
        let shouldUnlock = false;
        const cond = a.condition;
        if (cond === `lightningStrikes >= 1` && prev.lightningStrikes >= 1) shouldUnlock = true;
        else if (cond === `lightningStrikes >= 10` && prev.lightningStrikes >= 10) shouldUnlock = true;
        else if (cond === `creaturesTamed >= 1` && prev.creaturesTamed >= 1) shouldUnlock = true;
        else if (cond === `creaturesTamed >= 10` && prev.creaturesTamed >= 10) shouldUnlock = true;
        else if (cond === `thunderEnergy >= 200` && prev.thunderEnergy >= 200) shouldUnlock = true;
        else if (cond === `sectorsExplored >= 3` && prev.sectorsExplored >= 3) shouldUnlock = true;
        else if (cond === `totalUpgrades >= 25` && prev.totalUpgrades >= 25) shouldUnlock = true;
        else if (cond === `totalUpgrades >= 10` && prev.totalUpgrades >= 10) shouldUnlock = true;
        else if (cond === `totalAbilitiesUsed >= 10` && prev.totalAbilitiesUsed >= 10) shouldUnlock = true;
        else if (cond === `staticCharge >= 100` && prev.staticCharge >= 100) shouldUnlock = true;
        else if (cond === `stormCalmed >= 1` && prev.stormCalmed) shouldUnlock = true;
        else if (cond === `nexusPower >= 1000` && prev.nexusPower >= 1000) shouldUnlock = true;
        else if (cond === `totalAbilitiesUsed >= 20` && prev.totalAbilitiesUsed >= 20) shouldUnlock = true;
        else if (cond === `creaturesTamed >= 29` && prev.creaturesTamed >= 29) shouldUnlock = true;
        else if (cond === `totalUpgrades >= 50` && prev.totalUpgrades >= 50) shouldUnlock = true;
        else if (cond === `sectorsExplored >= 8` && prev.sectorsExplored >= 8) shouldUnlock = true;
        else if (cond === `titleIndex >= 7` && prev.titleIndex >= 7) shouldUnlock = true;
        else if (cond === `nexusPower >= 5000` && prev.nexusPower >= 5000) shouldUnlock = true;
        if (shouldUnlock) {
          updated = true;
          return { ...a, unlocked: true, unlockedAt: Date.now() };
        }
        return a;
      });
      if (!updated) return prev;
      return { ...prev, achievements: newAchievements };
    });
  }, []);

  // ── Action: checkTitle ──────────────────────────────────────────
  const checkTitle = useCallback(() => {
    setState(prev => {
      let newTitleIndex = prev.titleIndex;
      for (let i = titles.current.length - 1; i >= 0; i--) {
        if (prev.nexusPower >= titles.current[i].requiredPower) {
          newTitleIndex = i;
          break;
        }
      }
      if (newTitleIndex === prev.titleIndex) return prev;
      return { ...prev, titleIndex: newTitleIndex };
    });
  }, []);

  // ── Getter: getTitle ────────────────────────────────────────────
  const getTitle = useCallback((): Title => {
    return titles.current[stateRef.current.titleIndex] ?? titles.current[0];
  }, []);

  // ── Getter: getProgress ─────────────────────────────────────────
  const getProgress = useCallback(() => {
    const s = stateRef.current;
    const totalCreatures = TN_CREATURE_COUNT;
    const tamed = s.creatures.filter(c => c.tamed).length;
    const totalSectors = TN_SECTOR_COUNT;
    const unlocked = s.sectors.filter(sec => sec.unlocked).length;
    const totalAbilities = TN_ABILITY_COUNT;
    const unlockedAb = s.abilities.filter(ab => ab.unlocked).length;
    const unlockedAch = s.achievements.filter(ac => ac.unlocked).length;
    const totalAch = TN_ACHIEVEMENT_COUNT;
    return {
      creatureProgress: { tamed, total: totalCreatures, percent: Math.round((tamed / totalCreatures) * 100) },
      sectorProgress: { unlocked, total: totalSectors, percent: Math.round((unlocked / totalSectors) * 100) },
      abilityProgress: { unlocked: unlockedAb, total: totalAbilities, percent: Math.round((unlockedAb / totalAbilities) * 100) },
      achievementProgress: { unlocked: unlockedAch, total: totalAch, percent: Math.round((unlockedAch / totalAch) * 100) },
      nexusPowerProgress: { current: s.nexusPower, max: TN_MAX_NEXUS_POWER, percent: nexusPowerPercent },
      overallProgress: Math.round((
        (tamed / totalCreatures) +
        (unlocked / totalSectors) +
        (unlockedAb / totalAbilities) +
        (unlockedAch / totalAch) +
        (s.nexusPower / TN_MAX_NEXUS_POWER)
      ) / 5 * 100),
    };
  }, [nexusPowerPercent]);

  // ── Getter: getStats ────────────────────────────────────────────
  const getStats = useCallback(() => {
    const s = stateRef.current;
    const title = titles.current[s.titleIndex];
    const tamedList = s.creatures.filter(c => c.tamed);
    const avgCreaturePower = tamedList.length > 0
      ? Math.round(tamedList.reduce((sum, c) => sum + c.power, 0) / tamedList.length)
      : 0;
    const maxFacilityLevel = Math.max(...s.facilities.map(f => f.level));
    const avgFacilityLevel = s.facilities.reduce((sum, f) => sum + f.level, 0) / s.facilities.length;
    return {
      thunderEnergy: s.thunderEnergy,
      maxEnergy: TN_MAX_ENERGY,
      staticCharge: s.staticCharge,
      maxStaticCharge: TN_MAX_STATIC_CHARGE,
      lightningStrikes: s.lightningStrikes,
      creaturesTamed: s.creaturesTamed,
      totalCreatures: TN_CREATURE_COUNT,
      nexusPower: s.nexusPower,
      maxNexusPower: TN_MAX_NEXUS_POWER,
      stormIntensity: s.stormIntensity,
      maxStormIntensity: TN_MAX_STORM_INTENSITY,
      stormStatus,
      stormColor,
      title: title.name,
      titleDescription: title.description,
      totalUpgrades: s.totalUpgrades,
      totalAbilitiesUsed: s.totalAbilitiesUsed,
      sectorsExplored: s.sectorsExplored,
      barrierActive: isBarrierActive,
      barrierStrength: s.barrier.strength,
      equippedCount: s.equipment.filter(e => e.equipped).length,
      totalEquipPower,
      totalFacilityEnergy,
      averageCreaturePower: avgCreaturePower,
      maxFacilityLevel,
      averageFacilityLevel: Math.round(avgFacilityLevel * 10) / 10,
    };
  }, [stormStatus, stormColor, isBarrierActive, totalEquipPower, totalFacilityEnergy]);

  // ── Getter: getCreatureById ─────────────────────────────────────
  const getCreatureById = useCallback((id: number) => {
    return stateRef.current.creatures.find(c => c.id === id) ?? null;
  }, []);

  // ── Getter: getSectorById ───────────────────────────────────────
  const getSectorById = useCallback((id: number) => {
    return stateRef.current.sectors.find(s => s.id === id) ?? null;
  }, []);

  // ── Getter: getFacilityById ─────────────────────────────────────
  const getFacilityById = useCallback((id: number) => {
    return stateRef.current.facilities.find(f => f.id === id) ?? null;
  }, []);

  // ── Getter: getAbilityById ──────────────────────────────────────
  const getAbilityById = useCallback((id: number) => {
    return stateRef.current.abilities.find(a => a.id === id) ?? null;
  }, []);

  // ── Getter: getAchievementById ──────────────────────────────────
  const getAchievementById = useCallback((id: number) => {
    return stateRef.current.achievements.find(a => a.id === id) ?? null;
  }, []);

  // ── Getter: getEquipmentById ────────────────────────────────────
  const getEquipmentById = useCallback((id: number) => {
    return stateRef.current.equipment.find(e => e.id === id) ?? null;
  }, []);

  // ── Getter: getUpgradeCostForFacility ───────────────────────────
  const getUpgradeCostForFacility = useCallback((facilityId: number): number => {
    const facility = stateRef.current.facilities.find(f => f.id === facilityId);
    if (!facility || facility.level >= facility.maxLevel) return 0;
    return Math.floor(facility.upgradeCost * Math.pow(1.5, facility.level - 1));
  }, []);

  // ── Getter: getTamingCostForCreature ────────────────────────────
  const getTamingCostForCreature = useCallback((creatureId: number): number => {
    const creature = stateRef.current.creatures.find(c => c.id === creatureId);
    if (!creature || creature.tamed) return 0;
    return 5 + creature.power;
  }, []);

  // ── Action: dischargeStatic ─────────────────────────────────────
  const dischargeStatic = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      staticCharge: Math.max(0, prev.staticCharge - amount),
      thunderEnergy: Math.min(prev.thunderEnergy + amount, TN_MAX_ENERGY),
    }));
  }, []);

  // ── Action: sacrificeCreature ───────────────────────────────────
  const sacrificeCreature = useCallback((creatureId: number) => {
    setState(prev => {
      const creature = prev.creatures.find(c => c.id === creatureId);
      if (!creature || !creature.tamed) return prev;
      const powerGain = Math.floor(creature.power * 1.5);
      const energyGain = Math.floor(creature.stormAffinity * 2);
      const newCreatures = prev.creatures.map(c =>
        c.id === creatureId ? { ...c, tamed: false, tamedAt: null } : c
      );
      return {
        ...prev,
        creatures: newCreatures,
        creaturesTamed: prev.creaturesTamed - 1,
        nexusPower: Math.min(prev.nexusPower + powerGain, TN_MAX_NEXUS_POWER),
        thunderEnergy: Math.min(prev.thunderEnergy + energyGain, TN_MAX_ENERGY),
      };
    });
  }, []);

  // ── Action: setThunderEnergy ────────────────────────────────────
  const setThunderEnergy = useCallback((value: number) => {
    setState(prev => ({
      ...prev,
      thunderEnergy: Math.max(0, Math.min(value, TN_MAX_ENERGY)),
    }));
  }, []);

  // ── Action: setStaticCharge ─────────────────────────────────────
  const setStaticCharge = useCallback((value: number) => {
    setState(prev => ({
      ...prev,
      staticCharge: Math.max(0, Math.min(value, TN_MAX_STATIC_CHARGE)),
    }));
  }, []);

  // ── Action: setStormIntensity ───────────────────────────────────
  const setStormIntensity = useCallback((value: number) => {
    setState(prev => ({
      ...prev,
      stormIntensity: Math.max(0, Math.min(value, TN_MAX_STORM_INTENSITY)),
    }));
  }, []);

  // ── Action: addNexusPower ───────────────────────────────────────
  const addNexusPower = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      nexusPower: Math.min(prev.nexusPower + amount, TN_MAX_NEXUS_POWER),
    }));
  }, []);

  // ── Action: resetAll ────────────────────────────────────────────
  const resetAll = useCallback(() => {
    setState(buildInitialState());
  }, []);

  // ── Action: equipMultiple ───────────────────────────────────────
  const equipMultiple = useCallback((equipmentIds: number[]) => {
    setState(prev => {
      const newEquipment = prev.equipment.map(e => ({
        ...e,
        equipped: equipmentIds.includes(e.id),
      }));
      return { ...prev, equipment: newEquipment };
    });
  }, []);

  // ── Action: unequipAll ──────────────────────────────────────────
  const unequipAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      equipment: prev.equipment.map(e => ({ ...e, equipped: false })),
    }));
  }, []);

  // ── Action: boostStormIntensity ─────────────────────────────────
  const boostStormIntensity = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      stormIntensity: Math.min(prev.stormIntensity + amount, TN_MAX_STORM_INTENSITY),
    }));
  }, []);

  // ── Action: forceUnlockAll ──────────────────────────────────────
  const forceUnlockAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      creatures: prev.creatures.map(c => ({ ...c, tamed: true, tamedAt: Date.now() })),
      sectors: prev.sectors.map(s => ({ ...s, unlocked: true })),
      abilities: prev.abilities.map(a => ({ ...a, unlocked: true })),
      achievements: prev.achievements.map(a => ({ ...a, unlocked: true, unlockedAt: Date.now() })),
      titleIndex: titles.current.length - 1,
      nexusPower: TN_MAX_NEXUS_POWER,
      thunderEnergy: TN_MAX_ENERGY,
      staticCharge: TN_MAX_STATIC_CHARGE,
      creaturesTamed: TN_CREATURE_COUNT,
      sectorsExplored: TN_SECTOR_COUNT,
    }));
  }, []);

  // ── Computed: rarity colors ─────────────────────────────────────
  const rarityColors = useMemo((): Record<RarityTier, string> => {
    return {
      Common: '#B0BEC5',
      Uncommon: TN_ELECTRIC_BLUE,
      Rare: '#AA00FF',
      Epic: TN_LIGHTNING_YELLOW,
      Legendary: '#FF6D00',
    };
  }, []);

  // ── Computed: danger level color ────────────────────────────────
  const dangerLevelColor = useMemo(() => {
    const level = currentSectorData.dangerLevel;
    if (level >= 8) return '#FF1744';
    if (level >= 5) return '#FF9100';
    if (level >= 3) return TN_LIGHTNING_YELLOW;
    return '#69F0AE';
  }, [currentSectorData]);

  // ── Computed: ability type colors ───────────────────────────────
  const abilityTypeColors = useMemo((): Record<string, string> => {
    return {
      offensive: '#FF5252',
      defensive: TN_ELECTRIC_BLUE,
      utility: TN_LIGHTNING_YELLOW,
    };
  }, []);

  // ── Computed: top creatures by power ────────────────────────────
  const topCreaturesByPower = useMemo(() => {
    return [...state.creatures].sort((a, b) => b.power - a.power).slice(0, 5);
  }, [state]);

  // ── Computed: top facilities by level ───────────────────────────
  const topFacilitiesByLevel = useMemo(() => {
    return [...state.facilities].sort((a, b) => b.level - a.level).slice(0, 5);
  }, [state]);

  // ── Computed: available equipment (not equipped) ────────────────
  const availableEquipment = useMemo(() => {
    return state.equipment.filter(e => !e.equipped);
  }, [state]);

  // ── Computed: locked abilities ──────────────────────────────────
  const lockedAbilities = useMemo(() => {
    return state.abilities.filter(a => !a.unlocked);
  }, [state]);

  // ── Computed: recently unlocked achievements ────────────────────
  const recentAchievements = useMemo(() => {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    return state.achievements
      .filter(a => a.unlocked && a.unlockedAt !== null && a.unlockedAt > oneHourAgo)
      .sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0));
  }, [state]);

  // ── Computed: creature completion bonus ─────────────────────────
  const creatureCompletionBonus = useMemo(() => {
    const tamedCount = state.creatures.filter(c => c.tamed).length;
    const percent = tamedCount / TN_CREATURE_COUNT;
    return {
      energyBonus: Math.floor(percent * 20),
      powerBonus: Math.floor(percent * 500),
      description: percent >= 1.0 ? 'All creatures tamed! Maximum bonuses active.' :
        `Tame ${TN_CREATURE_COUNT - tamedCount} more creatures for maximum bonuses.`,
    };
  }, [state]);

  // ── Computed: storm forecast ────────────────────────────────────
  const stormForecast = useMemo(() => {
    const intensity = state.stormIntensity;
    const creatureChance = Math.min(30 + intensity, 90);
    const lightningChance = Math.min(10 + intensity, 70);
    const energyGainMultiplier = 1 + intensity / 100;
    const dangerMultiplier = 1 + intensity / 50;
    return {
      creatureSpawnChance: creatureChance,
      lightningFrequency: lightningChance,
      energyGainMultiplier: Math.round(energyGainMultiplier * 100) / 100,
      dangerMultiplier: Math.round(dangerMultiplier * 100) / 100,
      recommendedSector: intensity >= 70 ? 7 : intensity >= 50 ? 6 : intensity >= 30 ? 5 : 0,
      recommendation: intensity >= 70
        ? 'The storm is extremely violent! Proceed to the Eternal Storm Core with caution.'
        : intensity >= 50
          ? 'Strong storm activity detected. Tempest Harbor is recommended.'
          : intensity >= 30
            ? 'Moderate conditions. Static Fields offer good opportunities.'
            : 'The storm is calm. A good time to explore and build.',
    };
  }, [state]);

  // ── Computed: power ranking ─────────────────────────────────────
  const powerRanking = useMemo(() => {
    const power = state.nexusPower;
    if (power >= 8000) return { rank: 'S', color: '#FFD600', label: 'Transcendent' };
    if (power >= 5000) return { rank: 'A', color: '#FF6D00', label: 'Master' };
    if (power >= 3000) return { rank: 'B', color: '#FF1744', label: 'Expert' };
    if (power >= 1500) return { rank: 'C', color: TN_ELECTRIC_BLUE, label: 'Adept' };
    if (power >= 500) return { rank: 'D', color: TN_STORM_GRAY, label: 'Apprentice' };
    return { rank: 'F', color: '#B0BEC5', label: 'Novice' };
  }, [state]);

  // ── Action: healCreature ────────────────────────────────────────
  const healCreature = useCallback((creatureId: number, amount: number) => {
    setState(prev => {
      const creature = prev.creatures.find(c => c.id === creatureId);
      if (!creature || !creature.tamed) return prev;
      if (prev.thunderEnergy < 5) return prev;
      const basePowers: Record<RarityTier, number> = {
        Common: 5, Uncommon: 15, Rare: 35, Epic: 65, Legendary: 100,
      };
      const maxPower = basePowers[creature.rarity] * (creature.id <= 7 ? 1.5 : creature.id <= 14 ? 1.4 : creature.id <= 21 ? 1.3 : creature.id <= 28 ? 1.2 : 1.1);
      const newPower = Math.min(creature.power + amount, Math.floor(maxPower));
      const newCreatures = prev.creatures.map(c =>
        c.id === creatureId ? { ...c, power: newPower } : c
      );
      return { ...prev, thunderEnergy: prev.thunderEnergy - 5, creatures: newCreatures };
    });
  }, []);

  // ── Action: quickStrike ─────────────────────────────────────────
  const quickStrike = useCallback(() => {
    setState(prev => {
      if (prev.thunderEnergy < 5) return prev;
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - 5,
        lightningStrikes: prev.lightningStrikes + 1,
        staticCharge: Math.min(prev.staticCharge + 1, TN_MAX_STATIC_CHARGE),
        nexusPower: Math.min(prev.nexusPower + 2, TN_MAX_NEXUS_POWER),
        stormIntensity: Math.min(prev.stormIntensity + 1, TN_MAX_STORM_INTENSITY),
      };
    });
  }, []);

  // ── Action: tradeEnergyForNexusPower ────────────────────────────
  const tradeEnergyForNexusPower = useCallback((energyAmount: number) => {
    setState(prev => {
      if (prev.thunderEnergy < energyAmount) return prev;
      const powerGain = Math.floor(energyAmount * 0.5);
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - energyAmount,
        nexusPower: Math.min(prev.nexusPower + powerGain, TN_MAX_NEXUS_POWER),
      };
    });
  }, []);

  // ── Action: tradeNexusPowerForEnergy ────────────────────────────
  const tradeNexusPowerForEnergy = useCallback((powerAmount: number) => {
    setState(prev => {
      if (prev.nexusPower < powerAmount) return prev;
      const energyGain = Math.floor(powerAmount * 1.5);
      return {
        ...prev,
        nexusPower: prev.nexusPower - powerAmount,
        thunderEnergy: Math.min(prev.thunderEnergy + energyGain, TN_MAX_ENERGY),
      };
    });
  }, []);

  // ── Computed: facility upgrade summary ──────────────────────────
  const facilityUpgradeSummary = useMemo(() => {
    return state.facilities.map(f => ({
      id: f.id,
      name: f.name,
      currentLevel: f.level,
      maxLevel: f.maxLevel,
      upgradeCost: f.level >= f.maxLevel ? 0 : Math.floor(f.upgradeCost * Math.pow(1.5, f.level - 1)),
      energyOutput: f.energyOutput * f.level,
      canUpgrade: f.level < f.maxLevel,
      percentComplete: Math.round((f.level / f.maxLevel) * 100),
    }));
  }, [state]);

  // ── Computed: creature taming summary ───────────────────────────
  const creatureTamingSummary = useMemo(() => {
    return state.creatures.map(c => ({
      id: c.id,
      name: c.name,
      rarity: c.rarity,
      power: c.power,
      speed: c.speed,
      tamed: c.tamed,
      tamingCost: c.tamed ? 0 : 5 + c.power,
      stormAffinity: c.stormAffinity,
    }));
  }, [state]);

  // ── Computed: ability readiness ─────────────────────────────────
  const abilityReadiness = useMemo(() => {
    return state.abilities.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      unlocked: a.unlocked,
      unlockCost: a.unlockCost,
      energyCost: a.energyCost,
      power: a.power,
      cooldown: a.cooldown,
      currentCooldown: a.currentCooldown,
      ready: a.unlocked && a.currentCooldown === 0,
      cooldownPercent: a.currentCooldown === 0 ? 0 : Math.round(((a.cooldown - a.currentCooldown) / a.cooldown) * 100),
    }));
  }, [state]);

  // ── Computed: achievement completion rate ───────────────────────
  const achievementCompletionRate = useMemo(() => {
    const total = state.achievements.length;
    const unlocked = state.achievements.filter(a => a.unlocked).length;
    return {
      total,
      unlocked,
      percent: Math.round((unlocked / total) * 100),
      remaining: total - unlocked,
    };
  }, [state]);

  // ── Computed: storm cycle info ──────────────────────────────────
  const stormCycleInfo = useMemo(() => {
    const intensity = state.stormIntensity;
    const phase = intensity >= 80 ? 'Peak' : intensity >= 60 ? 'Rising' : intensity >= 40 ? 'Active' : intensity >= 20 ? 'Settling' : 'Dormant';
    const nextPhase = intensity >= 80 ? 'Peak' : intensity >= 60 ? 'Peak' : intensity >= 40 ? 'Rising' : intensity >= 20 ? 'Active' : 'Settling';
    const timeToNext = Math.max(0, Math.abs((intensity >= 80 ? 100 : intensity >= 60 ? 80 : intensity >= 40 ? 60 : intensity >= 20 ? 40 : 20) - intensity));
    return { phase, nextPhase, timeToNext, intensity };
  }, [state]);

  // ── Computed: daily task status ─────────────────────────────────
  const dailyTaskStatus = useMemo(() => {
    const task = state.dailyStormTask;
    const timeRemaining = Math.max(0, task.expiresAt - Date.now());
    const hours = Math.floor(timeRemaining / 3600000);
    const minutes = Math.floor((timeRemaining % 3600000) / 60000);
    return {
      ...task,
      timeRemaining,
      timeRemainingText: `${hours}h ${minutes}m`,
      progressPercent: task.target > 0 ? Math.min(100, Math.round((task.progress / task.target) * 100)) : 0,
    };
  }, [state]);

  // ── Computed: energy efficiency score ───────────────────────────
  const energyEfficiency = useMemo(() => {
    const totalOutput = state.facilities.reduce((sum, f) => sum + f.energyOutput * f.level, 0);
    const efficiency = totalOutput > 0
      ? Math.round((state.thunderEnergy / TN_MAX_ENERGY) * 100 * (totalOutput / 100))
      : 0;
    return {
      score: Math.min(100, efficiency),
      totalOutput,
      regenPerSecond: TN_ENERGY_REGEN_RATE + Math.floor(totalOutput / 10),
      capacity: TN_MAX_ENERGY,
    };
  }, [state]);

  // ── Computed: combat readiness ──────────────────────────────────
  const combatReadiness = useMemo(() => {
    const offPower = state.abilities
      .filter(a => a.unlocked && a.type === 'offensive')
      .reduce((sum, a) => sum + a.power, 0);
    const defPower = state.abilities
      .filter(a => a.unlocked && a.type === 'defensive')
      .reduce((sum, a) => sum + a.power, 0);
    const creaturePower = state.creatures
      .filter(c => c.tamed)
      .reduce((sum, c) => sum + c.power, 0);
    const totalCombatPower = offPower + defPower + creaturePower + totalEquipPower;
    return {
      offensivePower: offPower,
      defensivePower: defPower,
      creaturePower,
      equipmentPower: totalEquipPower,
      totalCombatPower,
      readinessPercent: Math.min(100, Math.floor(totalCombatPower / 50)),
    };
  }, [state, totalEquipPower]);

  // ── Computed: sector danger assessment ──────────────────────────
  const sectorDangerAssessment = useMemo(() => {
    return state.sectors.map(s => {
      const requiredPower = s.dangerLevel * 100;
      const canSurvive = state.nexusPower >= requiredPower || combatReadiness.totalCombatPower >= requiredPower;
      const riskLevel = canSurvive ? 'Low' : state.nexusPower >= requiredPower * 0.5 ? 'Medium' : 'High';
      return {
        id: s.id,
        name: s.name,
        dangerLevel: s.dangerLevel,
        unlocked: s.unlocked,
        requiredPower,
        canSurvive,
        riskLevel,
        riskColor: riskLevel === 'Low' ? '#69F0AE' : riskLevel === 'Medium' ? TN_LIGHTNING_YELLOW : '#FF1744',
      };
    });
  }, [state, combatReadiness]);

  // ── Computed: equipment power breakdown ─────────────────────────
  const equipmentPowerBreakdown = useMemo(() => {
    return state.equipment.map(e => ({
      id: e.id,
      name: e.name,
      rarity: e.rarity,
      power: e.power,
      defense: e.defense,
      total: e.power + e.defense,
      equipped: e.equipped,
      cost: e.cost,
    }));
  }, [state]);

  // ── Computed: color palette for UI ──────────────────────────────
  const colorPalette = useMemo(() => ({
    electricBlue: TN_ELECTRIC_BLUE,
    lightningYellow: TN_LIGHTNING_YELLOW,
    stormGray: TN_STORM_GRAY,
    whiteFlash: TN_WHITE_FLASH,
    darkNavy: TN_DARK_NAVY,
    rarityColors,
    abilityTypeColors,
    dangerLevelColor,
    stormColor,
    powerRankColor: powerRanking.color,
  }), [rarityColors, abilityTypeColors, dangerLevelColor, stormColor, powerRanking]);

  // ── Action: collectTaskProgress ─────────────────────────────────
  const collectTaskProgress = useCallback((taskType: string, amount: number) => {
    setState(prev => {
      if (prev.dailyStormTask.type !== taskType || prev.dailyStormTask.completed) return prev;
      const newProgress = Math.min(prev.dailyStormTask.progress + amount, prev.dailyStormTask.target);
      return {
        ...prev,
        dailyStormTask: {
          ...prev.dailyStormTask,
          progress: newProgress,
          completed: newProgress >= prev.dailyStormTask.target,
        },
      };
    });
  }, []);

  // ── Action: refreshDailyTask ────────────────────────────────────
  const refreshDailyTask = useCallback(() => {
    setState(prev => ({
      ...prev,
      dailyStormTask: generateDailyTask(),
    }));
  }, []);

  // ── Computed: all titles ────────────────────────────────────────
  const allTitles = useMemo(() => {
    return titles.current.map((t, idx) => ({
      ...t,
      active: idx === state.titleIndex,
      locked: state.nexusPower < t.requiredPower,
      progress: Math.min(100, Math.round((state.nexusPower / t.requiredPower) * 100)),
    }));
  }, [state]);

  // ── Computed: creature power distribution ───────────────────────
  const creaturePowerDistribution = useMemo(() => {
    const ranges = [
      { label: '1-20', min: 1, max: 20, count: 0 },
      { label: '21-40', min: 21, max: 40, count: 0 },
      { label: '41-60', min: 41, max: 60, count: 0 },
      { label: '61-80', min: 61, max: 80, count: 0 },
      { label: '81-100', min: 81, max: 100, count: 0 },
      { label: '100+', min: 101, max: 999, count: 0 },
    ];
    state.creatures.filter(c => c.tamed).forEach(c => {
      const range = ranges.find(r => c.power >= r.min && c.power <= r.max);
      if (range) range.count++;
    });
    return ranges;
  }, [state]);

  // ── Action: randomEncounter ─────────────────────────────────────
  const randomEncounter = useCallback(() => {
    setState(prev => {
      const sector = prev.sectors.find(s => s.id === prev.currentSector);
      if (!sector) return prev;
      const roll = Math.random() * 100;
      const spawnChance = 30 + prev.stormIntensity * 0.5;
      if (roll > spawnChance) {
        // Found energy instead
        const energyFound = Math.floor(Math.random() * 10) + 1;
        return {
          ...prev,
          thunderEnergy: Math.min(prev.thunderEnergy + energyFound, TN_MAX_ENERGY),
          staticCharge: Math.min(prev.staticCharge + Math.floor(Math.random() * 5), TN_MAX_STATIC_CHARGE),
        };
      }
      // Spawn a creature from sector spawns
      const spawnable = prev.creatures.filter(c => !c.tamed && sector.creatureSpawns.includes(c.name));
      if (spawnable.length === 0) return prev;
      const spawned = spawnable[Math.floor(Math.random() * spawnable.length)];
      const intensityBoost = Math.floor(Math.random() * 3) + 1;
      return {
        ...prev,
        stormIntensity: Math.min(prev.stormIntensity + intensityBoost, TN_MAX_STORM_INTENSITY),
      };
    });
  }, []);

  // ── Action: chainLightningStrike ─────────────────────────────────
  const chainLightningStrike = useCallback((targetIds: number[]) => {
    setState(prev => {
      const energyCost = 15 + targetIds.length * 5;
      if (prev.thunderEnergy < energyCost) return prev;
      const maxTargets = Math.min(targetIds.length, TN_CHAIN_LIGHTNING_RANGE);
      const newCreatures = prev.creatures.map(c => {
        if (targetIds.slice(0, maxTargets).includes(c.id)) {
          const damage = Math.floor(TN_LIGHTNING_BASE_DAMAGE * (1 - (targetIds.indexOf(c.id) * 0.15)));
          return { ...c, power: Math.max(0, c.power - damage) };
        }
        return c;
      });
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - energyCost,
        creatures: newCreatures,
        lightningStrikes: prev.lightningStrikes + maxTargets,
        nexusPower: Math.min(prev.nexusPower + TN_NEXUS_POWER_PER_STRIKE * maxTargets, TN_MAX_NEXUS_POWER),
        stormIntensity: Math.min(prev.stormIntensity + 2, TN_MAX_STORM_INTENSITY),
        staticCharge: Math.min(prev.staticCharge + maxTargets, TN_MAX_STATIC_CHARGE),
      };
    });
  }, []);

  // ── Action: trainCreature ────────────────────────────────────────
  const trainCreature = useCallback((creatureId: number, statType: 'power' | 'speed') => {
    setState(prev => {
      const creature = prev.creatures.find(c => c.id === creatureId);
      if (!creature || !creature.tamed) return prev;
      const cost = 10 + (creature.power + creature.speed) * 0.2;
      if (prev.thunderEnergy < cost) return prev;
      const newCreatures = prev.creatures.map(c => {
        if (c.id === creatureId) {
          const increment = statType === 'power' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 1;
          return { ...c, [statType]: c[statType] + increment };
        }
        return c;
      });
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - Math.floor(cost),
        creatures: newCreatures,
        nexusPower: Math.min(prev.nexusPower + 2, TN_MAX_NEXUS_POWER),
      };
    });
  }, []);

  // ── Action: fuseCreatures ────────────────────────────────────────
  const fuseCreatures = useCallback((creatureAId: number, creatureBId: number) => {
    setState(prev => {
      const creatureA = prev.creatures.find(c => c.id === creatureAId);
      const creatureB = prev.creatures.find(c => c.id === creatureBId);
      if (!creatureA || !creatureB || !creatureA.tamed || !creatureB.tamed) return prev;
      if (creatureA.rarity !== creatureB.rarity) return prev;
      if (prev.thunderEnergy < 50) return prev;
      const powerBoost = Math.floor(creatureB.power * 0.3);
      const speedBoost = Math.floor(creatureB.speed * 0.2);
      const affinityBoost = Math.floor(creatureB.stormAffinity * 0.25);
      const newCreatures = prev.creatures.map(c => {
        if (c.id === creatureAId) {
          return {
            ...c,
            power: c.power + powerBoost,
            speed: c.speed + speedBoost,
            stormAffinity: Math.min(100, c.stormAffinity + affinityBoost),
          };
        }
        if (c.id === creatureBId) {
          return { ...c, tamed: false, tamedAt: null, power: Math.floor(c.power * 0.5) };
        }
        return c;
      });
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - 50,
        creatures: newCreatures,
        creaturesTamed: prev.creaturesTamed - 1,
        nexusPower: Math.min(prev.nexusPower + 25, TN_MAX_NEXUS_POWER),
      };
    });
  }, []);

  // ── Action: craftEquipment ───────────────────────────────────────
  const craftEquipment = useCallback((equipmentId: number) => {
    setState(prev => {
      const item = prev.equipment.find(e => e.id === equipmentId);
      if (!item) return prev;
      if (prev.thunderEnergy < item.cost) return prev;
      return { ...prev, thunderEnergy: prev.thunderEnergy - item.cost };
    });
  }, []);

  // ── Action: dismantleEquipment ───────────────────────────────────
  const dismantleEquipment = useCallback((equipmentId: number) => {
    setState(prev => {
      const item = prev.equipment.find(e => e.id === equipmentId);
      if (!item) return prev;
      const refund = Math.floor(item.cost * 0.4);
      const energyRefund = Math.floor(refund * 0.6);
      const powerRefund = Math.floor(refund * 0.4);
      const newEquipment = prev.equipment.map(e =>
        e.id === equipmentId ? { ...e, equipped: false } : e
      );
      return {
        ...prev,
        thunderEnergy: Math.min(prev.thunderEnergy + energyRefund, TN_MAX_ENERGY),
        nexusPower: Math.min(prev.nexusPower + powerRefund, TN_MAX_NEXUS_POWER),
        equipment: newEquipment,
      };
    });
  }, []);

  // ── Action: sellCreature ─────────────────────────────────────────
  const sellCreature = useCallback((creatureId: number) => {
    setState(prev => {
      const creature = prev.creatures.find(c => c.id === creatureId);
      if (!creature || !creature.tamed) return prev;
      const rarityMultiplier: Record<RarityTier, number> = {
        Common: 1, Uncommon: 2, Rare: 5, Epic: 12, Legendary: 30,
      };
      const value = (creature.power + creature.stormAffinity) * rarityMultiplier[creature.rarity];
      const newCreatures = prev.creatures.map(c =>
        c.id === creatureId ? { ...c, tamed: false, tamedAt: null } : c
      );
      return {
        ...prev,
        creatures: newCreatures,
        creaturesTamed: prev.creaturesTamed - 1,
        thunderEnergy: Math.min(prev.thunderEnergy + value, TN_MAX_ENERGY),
        nexusPower: Math.min(prev.nexusPower + Math.floor(value * 0.3), TN_MAX_NEXUS_POWER),
      };
    });
  }, []);

  // ── Action: powerSurge ───────────────────────────────────────────
  const powerSurge = useCallback(() => {
    setState(prev => {
      const cost = Math.floor(prev.staticCharge * 0.75);
      if (prev.staticCharge < 20) return prev;
      const surgePower = Math.floor(prev.staticCharge * 0.4);
      return {
        ...prev,
        staticCharge: prev.staticCharge - cost,
        nexusPower: Math.min(prev.nexusPower + surgePower, TN_MAX_NEXUS_POWER),
        stormIntensity: Math.min(prev.stormIntensity + Math.floor(prev.staticCharge * 0.1), TN_MAX_STORM_INTENSITY),
        lightningStrikes: prev.lightningStrikes + 1,
      };
    });
  }, []);

  // ── Action: fortifyBarrier ───────────────────────────────────────
  const fortifyBarrier = useCallback(() => {
    setState(prev => {
      if (!prev.barrier.active) return prev;
      const cost = 15;
      if (prev.thunderEnergy < cost) return prev;
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - cost,
        barrier: {
          ...prev.barrier,
          strength: Math.min(prev.barrier.strength + 10, 100),
          expiresAt: (prev.barrier.expiresAt ?? Date.now()) + 10000,
        },
      };
    });
  }, []);

  // ── Action: absorbLightning ─────────────────────────────────────
  const absorbLightning = useCallback((energyAmount: number) => {
    setState(prev => ({
      ...prev,
      thunderEnergy: Math.min(prev.thunderEnergy + energyAmount, TN_MAX_ENERGY),
      staticCharge: Math.min(prev.staticCharge + Math.floor(energyAmount * 0.3), TN_MAX_STATIC_CHARGE),
      nexusPower: Math.min(prev.nexusPower + Math.floor(energyAmount * 0.1), TN_MAX_NEXUS_POWER),
    }));
  }, []);

  // ── Action: transferCreaturePower ───────────────────────────────
  const transferCreaturePower = useCallback((fromId: number, toId: number) => {
    setState(prev => {
      const from = prev.creatures.find(c => c.id === fromId);
      const to = prev.creatures.find(c => c.id === toId);
      if (!from || !to || !from.tamed || !to.tamed) return prev;
      const transferAmount = Math.floor(from.power * 0.2);
      const newCreatures = prev.creatures.map(c => {
        if (c.id === fromId) return { ...c, power: c.power - transferAmount };
        if (c.id === toId) return { ...c, power: c.power + transferAmount };
        return c;
      });
      return { ...prev, creatures: newCreatures };
    });
  }, []);

  // ── Action: spendNexusPower ──────────────────────────────────────
  const spendNexusPower = useCallback((amount: number) => {
    setState(prev => {
      if (prev.nexusPower < amount) return prev;
      return { ...prev, nexusPower: prev.nexusPower - amount };
    });
  }, []);

  // ── Action: resetAbilityCooldowns ────────────────────────────────
  const resetAbilityCooldowns = useCallback(() => {
    setState(prev => {
      const cost = 80;
      if (prev.thunderEnergy < cost) return prev;
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - cost,
        abilities: prev.abilities.map(a => ({ ...a, currentCooldown: 0 })),
      };
    });
  }, []);

  // ── Action: evolveCreature ───────────────────────────────────────
  const evolveCreature = useCallback((creatureId: number) => {
    setState(prev => {
      const creature = prev.creatures.find(c => c.id === creatureId);
      if (!creature || !creature.tamed) return prev;
      const rarityOrder: RarityTier[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
      const currentIdx = rarityOrder.indexOf(creature.rarity);
      if (currentIdx >= rarityOrder.length - 1) return prev;
      const nextRarity = rarityOrder[currentIdx + 1];
      const evolveCost = creature.power * 3 + creature.stormAffinity * 2;
      if (prev.thunderEnergy < evolveCost) return prev;
      const newCreatures = prev.creatures.map(c => {
        if (c.id === creatureId) {
          return {
            ...c,
            rarity: nextRarity,
            power: Math.floor(c.power * 1.5),
            speed: Math.floor(c.speed * 1.3),
            stormAffinity: Math.min(100, c.stormAffinity + 15),
          };
        }
        return c;
      });
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - evolveCost,
        creatures: newCreatures,
        nexusPower: Math.min(prev.nexusPower + 50, TN_MAX_NEXUS_POWER),
      };
    });
  }, []);

  // ── Action: weatherCommand ───────────────────────────────────────
  const weatherCommand = useCallback((commandType: 'rain' | 'hail' | 'thunder' | 'clear') => {
    setState(prev => {
      const cost = 25;
      if (prev.thunderEnergy < cost) return prev;
      const effects: Record<string, Partial<ThunderNexusState>> = {
        rain: { staticCharge: Math.min(prev.staticCharge + 10, TN_MAX_STATIC_CHARGE), thunderEnergy: prev.thunderEnergy - cost + 5 },
        hail: { stormIntensity: Math.min(prev.stormIntensity + 5, TN_MAX_STORM_INTENSITY), nexusPower: Math.min(prev.nexusPower + 5, TN_MAX_NEXUS_POWER) },
        thunder: { lightningStrikes: prev.lightningStrikes + 3, stormIntensity: Math.min(prev.stormIntensity + 8, TN_MAX_STORM_INTENSITY), nexusPower: Math.min(prev.nexusPower + 15, TN_MAX_NEXUS_POWER) },
        clear: { stormIntensity: Math.max(0, prev.stormIntensity - 15), staticCharge: Math.max(0, prev.staticCharge - 20) },
      };
      const effect = effects[commandType];
      return { ...prev, ...effect, thunderEnergy: effect.thunderEnergy ?? prev.thunderEnergy - cost };
    });
  }, []);

  // ── Action: summonStormBeast ─────────────────────────────────────
  const summonStormBeast = useCallback((sectorId?: number) => {
    setState(prev => {
      const targetSector = prev.sectors.find(s => s.id === (sectorId ?? prev.currentSector));
      if (!targetSector || !targetSector.unlocked) return prev;
      const cost = 35;
      if (prev.thunderEnergy < cost) return prev;
      const untamed = prev.creatures.filter(c => !c.tamed && targetSector.creatureSpawns.includes(c.name));
      if (untamed.length === 0) return prev;
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - cost,
        stormIntensity: Math.min(prev.stormIntensity + 4, TN_MAX_STORM_INTENSITY),
      };
    });
  }, []);

  // ── Action: constructFacility ────────────────────────────────────
  const constructFacility = useCallback((facilityId: number) => {
    setState(prev => {
      const facility = prev.facilities.find(f => f.id === facilityId);
      if (!facility) return prev;
      if (facility.level > 1) return prev;
      return prev; // Facilities start at level 1; use upgradeFacility instead
    });
  }, []);

  // ── Action: demolishFacility ─────────────────────────────────────
  const demolishFacility = useCallback((facilityId: number) => {
    setState(prev => {
      const facility = prev.facilities.find(f => f.id === facilityId);
      if (!facility || facility.level <= 1) return prev;
      const refundPerLevel = Math.floor(facility.upgradeCost * 0.3);
      const totalRefund = refundPerLevel * (facility.level - 1);
      const newFacilities = prev.facilities.map(f =>
        f.id === facilityId ? { ...f, level: 1 } : f
      );
      return {
        ...prev,
        facilities: newFacilities,
        thunderEnergy: Math.min(prev.thunderEnergy + totalRefund, TN_MAX_ENERGY),
      };
    });
  }, []);

  // ── Action: massUpgradeFacilities ────────────────────────────────
  const massUpgradeFacilities = useCallback((facilityIds: number[]) => {
    setState(prev => {
      let energy = prev.thunderEnergy;
      let totalUpgrades = prev.totalUpgrades;
      let nexusPower = prev.nexusPower;
      const newFacilities = prev.facilities.map(f => {
        if (!facilityIds.includes(f.id)) return f;
        if (f.level >= f.maxLevel) return f;
        const cost = Math.floor(f.upgradeCost * Math.pow(1.5, f.level - 1));
        if (energy < cost) return f;
        energy -= cost;
        totalUpgrades += 1;
        nexusPower = Math.min(nexusPower + TN_NEXUS_POWER_PER_UPGRADE, TN_MAX_NEXUS_POWER);
        return { ...f, level: f.level + 1 };
      });
      return { ...prev, thunderEnergy: energy, facilities: newFacilities, totalUpgrades, nexusPower };
    });
  }, []);

  // ── Action: relocateSector ───────────────────────────────────────
  const relocateSector = useCallback((sectorId: number) => {
    setState(prev => {
      const sector = prev.sectors.find(s => s.id === sectorId);
      if (!sector || !sector.unlocked) return prev;
      const energyCost = Math.floor(sector.unlockCost * 0.1);
      if (prev.thunderEnergy < energyCost) return prev;
      return { ...prev, currentSector: sectorId, thunderEnergy: prev.thunderEnergy - energyCost };
    });
  }, []);

  // ── Action: scatterStorm ─────────────────────────────────────────
  const scatterStorm = useCallback(() => {
    setState(prev => {
      const cost = 20;
      if (prev.thunderEnergy < cost) return prev;
      const scatter = Math.floor(Math.random() * 30) - 10;
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - cost,
        stormIntensity: Math.max(0, Math.min(prev.stormIntensity + scatter, TN_MAX_STORM_INTENSITY)),
      };
    });
  }, []);

  // ── Action: meditateAtCore ───────────────────────────────────────
  const meditateAtCore = useCallback(() => {
    setState(prev => {
      if (prev.currentSector !== 7) return prev;
      if (prev.thunderEnergy < 15) return prev;
      const nexusGain = 30 + Math.floor(Math.random() * 20);
      const intensityReduction = Math.floor(Math.random() * 5) + 3;
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - 15,
        nexusPower: Math.min(prev.nexusPower + nexusGain, TN_MAX_NEXUS_POWER),
        stormIntensity: Math.max(0, prev.stormIntensity - intensityReduction),
      };
    });
  }, []);

  // ── Action: overchargeFacility ───────────────────────────────────
  const overchargeFacility = useCallback((facilityId: number) => {
    setState(prev => {
      const facility = prev.facilities.find(f => f.id === facilityId);
      if (!facility) return prev;
      const cost = 25;
      if (prev.thunderEnergy < cost) return prev;
      const boostDuration = 30000;
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - cost,
        nexusPower: Math.min(prev.nexusPower + 5, TN_MAX_NEXUS_POWER),
      };
    });
  }, []);

  // ── Action: recruitCreature ──────────────────────────────────────
  const recruitCreature = useCallback((creatureId: number) => {
    setState(prev => {
      const creature = prev.creatures.find(c => c.id === creatureId);
      if (!creature || creature.tamed) return prev;
      const cost = 8 + Math.floor(creature.power * 0.8);
      if (prev.thunderEnergy < cost) return prev;
      const newCreatures = prev.creatures.map(c =>
        c.id === creatureId ? { ...c, tamed: true, tamedAt: Date.now() } : c
      );
      return {
        ...prev,
        thunderEnergy: prev.thunderEnergy - cost,
        creatures: newCreatures,
        creaturesTamed: prev.creaturesTamed + 1,
        nexusPower: Math.min(prev.nexusPower + Math.floor(creature.stormAffinity * 0.5), TN_MAX_NEXUS_POWER),
      };
    });
  }, []);

  // ── Computed: session summary ───────────────────────────────────
  const sessionSummary = useMemo(() => {
    return {
      creaturesData: state.creatures,
      sectorsData: state.sectors,
      equipmentData: state.equipment,
      facilitiesData: state.facilities,
      abilitiesData: state.abilities,
      achievementsData: state.achievements,
      currentSector: state.currentSector,
      thunderEnergy: state.thunderEnergy,
      staticCharge: state.staticCharge,
      lightningStrikes: state.lightningStrikes,
      creaturesTamed: state.creaturesTamed,
      titleIndex: state.titleIndex,
      nexusPower: state.nexusPower,
      stormIntensity: state.stormIntensity,
      stormCalmed: state.stormCalmed,
      totalUpgrades: state.totalUpgrades,
      totalAbilitiesUsed: state.totalAbilitiesUsed,
      sectorsExplored: state.sectorsExplored,
      barrier: state.barrier,
    };
  }, [state]);

  // ── Computed: creature synergy matrix ────────────────────────────
  const creatureSynergyMatrix = useMemo(() => {
    const tamed = state.creatures.filter(c => c.tamed);
    const synergies: Array<{ pair: string; bonus: number; type: string }> = [];
    const typeGroups = ['electric', 'wind', 'storm', 'plasma', 'aether'];
    tamed.forEach((a, i) => {
      tamed.forEach((b, j) => {
        if (j <= i) return;
        let bonus = 0;
        let synergyType = 'none';
        if (a.rarity === b.rarity) {
          bonus = Math.floor((a.power + b.power) * 0.1);
          synergyType = 'same-rarity';
        }
        if (Math.abs(a.speed - b.speed) < 5) {
          bonus += Math.floor((a.stormAffinity + b.stormAffinity) * 0.05);
          synergyType = synergyType === 'none' ? 'speed-match' : 'combo';
        }
        if (a.rarity !== b.rarity && ['Rare', 'Epic', 'Legendary'].includes(a.rarity) && ['Rare', 'Epic', 'Legendary'].includes(b.rarity)) {
          bonus += 5;
          synergyType = synergyType === 'none' ? 'cross-rarity' : 'combo';
        }
        if (bonus > 0) {
          synergies.push({ pair: `${a.name} + ${b.name}`, bonus, type: synergyType });
        }
      });
    });
    synergies.sort((a, b) => b.bonus - a.bonus);
    return {
      synergies: synergies.slice(0, 10),
      totalBonus: synergies.reduce((sum, s) => sum + s.bonus, 0),
      topSynergy: synergies.length > 0 ? synergies[0] : null,
    };
  }, [state]);

  // ── Computed: facility investment summary ────────────────────────
  const facilityInvestmentSummary = useMemo(() => {
    let totalInvested = 0;
    let maxReturnRate = 0;
    let bestFacility = '';
    const breakdown = state.facilities.map(f => {
      const invested = Math.floor(f.upgradeCost * (Math.pow(1.5, f.level - 1) - 1) / 0.5);
      totalInvested += invested;
      const returnRate = f.energyOutput > 0 ? (f.energyOutput * f.level) / invested : 0;
      if (returnRate > maxReturnRate) {
        maxReturnRate = returnRate;
        bestFacility = f.name;
      }
      return {
        id: f.id,
        name: f.name,
        level: f.level,
        invested,
        currentOutput: f.energyOutput * f.level,
        returnRate: Math.round(returnRate * 100) / 100,
      };
    });
    return { totalInvested, maxReturnRate: Math.round(maxReturnRate * 100) / 100, bestFacility, breakdown };
  }, [state]);

  // ── Computed: ability power tier list ────────────────────────────
  const abilityPowerTierList = useMemo(() => {
 const tiers = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    const classified: Array<{ name: string; tier: string; power: number; type: string }> = [];
    state.abilities.forEach(a => {
      let tier = 'D';
      if (a.power >= 80) tier = 'S';
      else if (a.power >= 50) tier = 'A';
      else if (a.power >= 30) tier = 'B';
      else if (a.power >= 15) tier = 'C';
      tiers[tier as keyof typeof tiers]++;
      classified.push({ name: a.name, tier, power: a.power, type: a.type });
    });
    const tierOrder = ['S', 'A', 'B', 'C', 'D'];
    classified.sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));
    return { tiers, classified };
  }, [state]);

  // ── Computed: unlock roadmap ─────────────────────────────────────
  const unlockRoadmap = useMemo(() => {
    const lockedSectors = state.sectors.filter(s => !s.unlocked).sort((a, b) => a.unlockCost - b.unlockCost);
    const lockedAbilitiesList = state.abilities.filter(a => !a.unlocked).sort((a, b) => a.unlockCost - b.unlockCost);
    const untamedCreatures = state.creatures.filter(c => !c.tamed).sort((a, b) => (a.power + a.speed) - (b.power + b.speed));
    const affordableSectors = lockedSectors.filter(s => s.unlockCost <= state.thunderEnergy);
    const affordableAbilities = lockedAbilitiesList.filter(a => a.unlockCost <= state.thunderEnergy);
    const affordableCreatures = untamedCreatures.filter(c => 5 + c.power <= state.thunderEnergy);
    return {
      nextCheapestSector: lockedSectors[0] ?? null,
      nextCheapestAbility: lockedAbilitiesList[0] ?? null,
      nextCheapestCreature: untamedCreatures[0] ?? null,
      affordableSectors,
      affordableAbilities,
      affordableCreatures,
      totalLockedSectors: lockedSectors.length,
      totalLockedAbilities: lockedAbilitiesList.length,
      totalUntamedCreatures: untamedCreatures.length,
    };
  }, [state]);

  // ── Computed: storm event log ────────────────────────────────────
  const stormEventLog = useMemo(() => {
    const events: Array<{ type: string; message: string; timestamp: number }> = [];
    if (state.stormIntensity >= 80) {
      events.push({ type: 'warning', message: 'Catastrophic storm! All sectors on high alert.', timestamp: Date.now() });
    }
    if (state.barrier.active) {
      events.push({ type: 'info', message: `Barrier active — ${state.barrier.strength}% strength remaining.`, timestamp: Date.now() });
    }
    if (state.staticCharge >= TN_MAX_STATIC_CHARGE * 0.9) {
      events.push({ type: 'critical', message: 'Static charge near maximum! Consider discharging or using Power Surge.', timestamp: Date.now() });
    }
    if (state.thunderEnergy >= TN_MAX_ENERGY * 0.9) {
      events.push({ type: 'info', message: 'Energy reserves nearly full. Consider spending energy on upgrades.', timestamp: Date.now() });
    }
    if (state.creaturesTamed >= 30) {
      events.push({ type: 'achievement', message: 'Approaching complete bestiary! Only a few creatures remain.', timestamp: Date.now() });
    }
    if (state.dailyStormTask.completed) {
      events.push({ type: 'reward', message: `Daily task complete! Claim ${state.dailyStormTask.reward} energy reward.`, timestamp: Date.now() });
    }
    const tamedLegendary = state.creatures.filter(c => c.tamed && c.rarity === 'Legendary').length;
    if (tamedLegendary > 0) {
      events.push({ type: 'legendary', message: `You command ${tamedLegendary} legendary creature${tamedLegendary > 1 ? 's' : ''}!`, timestamp: Date.now() });
    }
    return events;
  }, [state]);

  // ── Computed: resource balance analysis ──────────────────────────
  const resourceBalance = useMemo(() => {
    const energy = state.thunderEnergy;
    const energyRatio = energy / TN_MAX_ENERGY;
    const charge = state.staticCharge;
    const chargeRatio = charge / TN_MAX_STATIC_CHARGE;
    const power = state.nexusPower;
    const powerRatio = power / TN_MAX_NEXUS_POWER;
    const overallBalance = (energyRatio + chargeRatio + powerRatio) / 3;
    const recommendation =
      energyRatio < 0.3 ? 'Low energy — prioritize facility upgrades for regeneration.' :
      chargeRatio > 0.8 ? 'High static charge — use Power Surge or calm the storm.' :
      powerRatio < 0.2 ? 'Low nexus power — focus on taming creatures and using abilities.' :
      overallBalance > 0.7 ? 'Well balanced! Push for higher storm intensity for better rewards.' :
      'Maintain current strategy and keep resources flowing.';
    return {
      energyBalance: { current: energy, max: TN_MAX_ENERGY, ratio: Math.round(energyRatio * 100) },
      chargeBalance: { current: charge, max: TN_MAX_STATIC_CHARGE, ratio: Math.round(chargeRatio * 100) },
      powerBalance: { current: power, max: TN_MAX_NEXUS_POWER, ratio: Math.round(powerRatio * 100) },
      overallBalance: Math.round(overallBalance * 100),
      recommendation,
    };
  }, [state]);

  // ── Computed: equipment set bonuses ──────────────────────────────
  const equipmentSetBonuses = useMemo(() => {
    const equipped = state.equipment.filter(e => e.equipped);
    const bonuses: Array<{ name: string; active: boolean; bonus: number }> = [];
    const hasWeapon = equipped.some(e => ['Lightning Lance', 'Plasma Blade', 'Thunder Hammer', 'Chain Lightning Staff', 'Ragnarok Gauntlet', 'Thunder God\'s Wrath', 'Void Lightning Blade', 'Aether Bow'].includes(e.name));
    const hasShield = equipped.some(e => ['Thunder Shield', 'Stormbreaker Shield', 'Wind Barrier'].includes(e.name));
    const hasArmor = equipped.some(e => ['Tempest Armor', 'Gale Cloak', 'Lightning Mantle', 'Primordial Storm Cloak'].includes(e.name));
    const hasCrown = equipped.some(e => ['Storm Crown', 'Eternal Storm Crown'].includes(e.name));
    const hasBoots = equipped.some(e => ['Thunder Boots'].includes(e.name));
    bonuses.push({ name: 'Armed Warrior', active: hasWeapon, bonus: hasWeapon ? 15 : 0 });
    bonuses.push({ name: 'Iron Fortress', active: hasShield && hasArmor, bonus: hasShield && hasArmor ? 25 : 0 });
    bonuses.push({ name: 'Storm Sovereign', active: hasCrown && hasWeapon, bonus: hasCrown && hasWeapon ? 35 : 0 });
    bonuses.push({ name: 'Swift Thunder', active: hasBoots && hasWeapon, bonus: hasBoots && hasWeapon ? 10 : 0 });
    bonuses.push({ name: 'Full Arsenal', active: equipped.length >= 5, bonus: equipped.length >= 5 ? 20 : 0 });
    const totalSetBonus = bonuses.reduce((sum, b) => sum + b.bonus, 0);
    return { bonuses, totalSetBonus, activeSets: bonuses.filter(b => b.active).length };
  }, [state]);

  // ── Computed: milestone tracker ──────────────────────────────────
  const milestoneTracker = useMemo(() => {
    const milestones = [
      { id: 'm1', name: 'First Steps', description: 'Strike your first bolt of lightning.', target: 1, type: 'lightningStrikes' as const },
      { id: 'm2', name: 'Storm Rising', description: 'Accumulate 500 nexus power.', target: 500, type: 'nexusPower' as const },
      { id: 'm3', name: 'Creature Collector', description: 'Tame 15 thunder creatures.', target: 15, type: 'creaturesTamed' as const },
      { id: 'm4', name: 'Fortress Architect', description: 'Perform 50 total facility upgrades.', target: 50, type: 'totalUpgrades' as const },
      { id: 'm5', name: 'Ability Adept', description: 'Use abilities 30 times total.', target: 30, type: 'totalAbilitiesUsed' as const },
      { id: 'm6', name: 'Explorer', description: 'Unlock all 8 nexus sectors.', target: 8, type: 'sectorsExplored' as const },
      { id: 'm7', name: 'Lightning Lord', description: 'Strike lightning 100 times.', target: 100, type: 'lightningStrikes' as const },
      { id: 'm8', name: 'Power Ascendant', description: 'Accumulate 3000 nexus power.', target: 3000, type: 'nexusPower' as const },
      { id: 'm9', name: 'Zookeeper', description: 'Tame all 35 creatures.', target: 35, type: 'creaturesTamed' as const },
      { id: 'm10', name: 'Master Builder', description: 'Perform 200 total facility upgrades.', target: 200, type: 'totalUpgrades' as const },
    ];
    return milestones.map(m => {
      const current = state[m.type as keyof ThunderNexusState] as number;
      return {
        ...m,
        current,
        completed: current >= m.target,
        progress: Math.min(100, Math.round((current / m.target) * 100)),
      };
    });
  }, [state]);

  // ── Computed: leaderboard projection ─────────────────────────────
  const leaderboardProjection = useMemo(() => {
    const totalScore = state.nexusPower
      + state.creaturesTamed * 50
      + state.lightningStrikes * 2
      + state.totalUpgrades * 15
      + state.totalAbilitiesUsed * 10
      + state.sectorsExplored * 100;
    return {
      totalScore,
      rank: totalScore >= 10000 ? 'Top 1%' : totalScore >= 5000 ? 'Top 5%' : totalScore >= 2000 ? 'Top 10%' : totalScore >= 500 ? 'Top 25%' : 'Top 50%',
      breakdown: {
        nexusPowerScore: state.nexusPower,
        creatureScore: state.creaturesTamed * 50,
        strikeScore: state.lightningStrikes * 2,
        upgradeScore: state.totalUpgrades * 15,
        abilityScore: state.totalAbilitiesUsed * 10,
        explorationScore: state.sectorsExplored * 100,
      },
    };
  }, [state]);

  // ═══════════════════════════════════════════════════════════════
  // Return full API surface
  // ═══════════════════════════════════════════════════════════════
  return {
    // ── Constants ─────────────────────────────────────────────────
    TN_MAX_ENERGY,
    TN_MAX_STATIC_CHARGE,
    TN_MAX_NEXUS_POWER,
    TN_MAX_STORM_INTENSITY,
    TN_MAX_LIGHTNING_STRIKES,
    TN_CREATURE_COUNT,
    TN_SECTOR_COUNT,
    TN_EQUIPMENT_COUNT,
    TN_FACILITY_COUNT,
    TN_ABILITY_COUNT,
    TN_ACHIEVEMENT_COUNT,
    TN_TITLE_COUNT,
    TN_MAX_FACILITY_LEVEL,
    TN_ENERGY_REGEN_RATE,
    TN_STATIC_DECAY_RATE,
    TN_LIGHTNING_BASE_DAMAGE,
    TN_CHAIN_LIGHTNING_RANGE,
    TN_STORM_CALM_THRESHOLD,
    TN_NEXUS_POWER_PER_STRIKE,
    TN_NEXUS_POWER_PER_TAME,
    TN_NEXUS_POWER_PER_UPGRADE,
    TN_BARRIER_DURATION_MS,
    TN_BARRIER_COST,
    TN_ELECTRIC_BLUE,
    TN_LIGHTNING_YELLOW,
    TN_STORM_GRAY,
    TN_WHITE_FLASH,
    TN_DARK_NAVY,

    // ── Raw state ─────────────────────────────────────────────────
    ...sessionSummary,

    // ── Computed values ───────────────────────────────────────────
    currentSectorData,
    tamedCreatures,
    equippedItems,
    totalEquipPower,
    unlockedAbilities,
    readyAbilities,
    totalFacilityEnergy,
    creaturesByRarity,
    tamedCountByRarity,
    isBarrierActive,
    availableSectors,
    stormStatus,
    stormColor,
    energyPercent,
    chargePercent,
    nexusPowerPercent,
    nextTitle,
    powerToNextTitle,
    rarityColors,
    dangerLevelColor,
    abilityTypeColors,
    topCreaturesByPower,
    topFacilitiesByLevel,
    availableEquipment,
    lockedAbilities,
    recentAchievements,
    creatureCompletionBonus,
    stormForecast,
    powerRanking,
    facilityUpgradeSummary,
    creatureTamingSummary,
    abilityReadiness,
    achievementCompletionRate,
    stormCycleInfo,
    dailyTaskStatus,
    energyEfficiency,
    combatReadiness,
    sectorDangerAssessment,
    equipmentPowerBreakdown,
    colorPalette,
    allTitles,
    creaturePowerDistribution,
    sessionSummary,

    // ── Actions ───────────────────────────────────────────────────
    strikeLightning,
    tameCreature,
    upgradeFacility,
    activateAbility,
    readStorm,
    chargeStatic,
    summonThunder,
    deployBarrier,
    calmStorm,
    travelToSector,
    unlockSector,
    equipItem,
    unlockAbility,
    claimTaskReward,
    checkAchievements,
    checkTitle,
    dischargeStatic,
    sacrificeCreature,
    setThunderEnergy,
    setStaticCharge,
    setStormIntensity,
    addNexusPower,
    resetAll,
    equipMultiple,
    unequipAll,
    boostStormIntensity,
    forceUnlockAll,
    healCreature,
    quickStrike,
    tradeEnergyForNexusPower,
    tradeNexusPowerForEnergy,
    collectTaskProgress,
    refreshDailyTask,
    randomEncounter,
    chainLightningStrike,
    trainCreature,
    fuseCreatures,
    craftEquipment,
    dismantleEquipment,
    sellCreature,
    powerSurge,
    fortifyBarrier,
    absorbLightning,
    transferCreaturePower,
    spendNexusPower,
    resetAbilityCooldowns,
    evolveCreature,
    weatherCommand,
    summonStormBeast,
    constructFacility,
    demolishFacility,
    massUpgradeFacilities,
    relocateSector,
    scatterStorm,
    meditateAtCore,
    overchargeFacility,
    recruitCreature,

    // ── Extended Computed ────────────────────────────────────────
    creatureSynergyMatrix,
    facilityInvestmentSummary,
    abilityPowerTierList,
    unlockRoadmap,
    stormEventLog,
    resourceBalance,
    equipmentSetBonuses,
    milestoneTracker,
    leaderboardProjection,

    // ── Getters ───────────────────────────────────────────────────
    getTitle,
    getProgress,
    getStats,
    getCreatureById,
    getSectorById,
    getFacilityById,
    getAbilityById,
    getAchievementById,
    getEquipmentById,
    getUpgradeCostForFacility,
    getTamingCostForCreature,
  };
}
