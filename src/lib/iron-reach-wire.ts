import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Iron Reach (钢铁延伸) — Industrial Frontier Fortress Module
// Color theme: Iron Gray #71797E, Steel Blue #4682B4,
//              Copper #B87333, Molten Orange #FF4500
// ============================================================

// ─── SECTION 1: TYPE DEFINITIONS ────────────────────────────────────────────────

export type IrRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type IrSpecies = 'ironclad_beetle' | 'steel_wyrm' | 'copper_sentinel' | 'bronze_titan' | 'tungsten_golem' | 'chrome_hawk' | 'nickel_spider';
export type IrAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'passive';
export type IrStructureBonusType = 'forge_boost' | 'defense_rating' | 'storage_cap' | 'energy_regen' | 'deploy_power' | 'material_yield' | 'mech_repair' | 'scout_range';
export type IrMaterialCategory = 'ore' | 'alloy' | 'component' | 'rare_earth' | 'mythic';

// ─── RARITY CONSTANTS ───────────────────────────────────────────────────────────

export const IR_RARITY_COMMON: IrRarity = 'common';
export const IR_RARITY_UNCOMMON: IrRarity = 'uncommon';
export const IR_RARITY_RARE: IrRarity = 'rare';
export const IR_RARITY_EPIC: IrRarity = 'epic';
export const IR_RARITY_LEGENDARY: IrRarity = 'legendary';

// ─── COLOR CONSTANTS ────────────────────────────────────────────────────────────

export const IR_IRON_GRAY = '#71797E';
export const IR_STEEL_BLUE = '#4682B4';
export const IR_COPPER = '#B87333';
export const IR_MOLTEN_ORANGE = '#FF4500';
export const IR_CHROME_SILVER = '#C0C0C0';
export const IR_BRONZE = '#CD7F32';
export const IR_DARK_FORGE = '#2C2C2C';

export const IR_RARITY_COLORS: Record<IrRarity, string> = {
  [IR_RARITY_COMMON]: IR_IRON_GRAY,
  [IR_RARITY_UNCOMMON]: IR_COPPER,
  [IR_RARITY_RARE]: IR_STEEL_BLUE,
  [IR_RARITY_EPIC]: IR_MOLTEN_ORANGE,
  [IR_RARITY_LEGENDARY]: IR_CHROME_SILVER,
};

export const IR_RARITY_LABELS: Record<IrRarity, string> = {
  [IR_RARITY_COMMON]: 'Common',
  [IR_RARITY_UNCOMMON]: 'Uncommon',
  [IR_RARITY_RARE]: 'Rare',
  [IR_RARITY_EPIC]: 'Epic',
  [IR_RARITY_LEGENDARY]: 'Legendary',
};

export const IR_RARITY_XP_MULTIPLIER: Record<IrRarity, number> = {
  [IR_RARITY_COMMON]: 1,
  [IR_RARITY_UNCOMMON]: 1.5,
  [IR_RARITY_RARE]: 2.5,
  [IR_RARITY_EPIC]: 4,
  [IR_RARITY_LEGENDARY]: 7,
};

export const IR_SPECIES_COLORS: Record<IrSpecies, string> = {
  ironclad_beetle: '#71797E',
  steel_wyrm: '#4682B4',
  copper_sentinel: '#B87333',
  bronze_titan: '#CD7F32',
  tungsten_golem: '#A9A9A9',
  chrome_hawk: '#C0C0C0',
  nickel_spider: '#8B8682',
};

export const IR_SPECIES_ICONS: Record<IrSpecies, string> = {
  ironclad_beetle: '🪲',
  steel_wyrm: '🐉',
  copper_sentinel: '🤖',
  bronze_titan: '🗿',
  tungsten_golem: '🗿',
  chrome_hawk: '🦅',
  nickel_spider: '🕷️',
};

// ─── DEF INTERFACES ─────────────────────────────────────────────────────────────

export interface IrCreatureDef {
  id: string;
  name: string;
  species: IrSpecies;
  rarity: IrRarity;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  forgePower: number;
  assembleCost: number;
  description: string;
  lore: string;
  icon: string;
  color: string;
}

export interface IrChamberDef {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  resources: { tungstenOre: number; chromiumSteel: number; copperCoil: number };
  capacity: number;
  defenseRating: number;
  regionColor: string;
  icon: string;
  unlockLevel: number;
}

export interface IrMaterialDef {
  id: string;
  name: string;
  rarity: IrRarity;
  category: IrMaterialCategory;
  description: string;
  icon: string;
  color: string;
}

export interface IrStructureDef {
  id: string;
  name: string;
  description: string;
  bonusType: IrStructureBonusType;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effectPerLevel: number;
  chamberId: string;
  icon: string;
}

export interface IrAbilityDef {
  id: string;
  name: string;
  category: IrAbilityCategory;
  rarity: IrRarity;
  power: number;
  cooldown: number;
  energyCost: number;
  description: string;
  icon: string;
  color: string;
}

export interface IrAchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  rewardXp: number;
  hidden: boolean;
  icon: string;
}

export interface IrTitleDef {
  id: string;
  name: string;
  requirement: string;
  minMechs: number;
  minChambers: number;
  bonusMultiplier: number;
  icon: string;
  description: string;
}

export interface IrArtifactDef {
  id: string;
  name: string;
  rarity: IrRarity;
  description: string;
  lore: string;
  powerBonus: number;
  defenseBonus: number;
  forgeBonus: number;
  icon: string;
  color: string;
}

export interface IrEventDef {
  id: string;
  name: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe' | 'catastrophic';
  duration: number;
  rewardXp: number;
  rewardCoins: number;
  riskLevel: number;
  icon: string;
  color: string;
}

// ─── RUNTIME STATE TYPES ────────────────────────────────────────────────────────

export interface IrMechState {
  mechId: string;
  nickname: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  assembledAt: number | null;
  chamberId: string | null;
  isActive: boolean;
}

export interface IrInventoryItem {
  materialId: string;
  count: number;
}

export interface IrStructureState {
  structureId: string;
  level: number;
  builtAt: number | null;
}

export interface IrChamberState {
  chamberId: string;
  discovered: boolean;
  garrisonCount: number;
  supplyLevel: number;
  morale: number;
  lastDefendedAt: number | null;
}

export interface IrEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
}

export interface IrStats {
  totalAssembled: number;
  totalDeployed: number;
  totalBuilt: number;
  totalArtifactsActivated: number;
  totalEventsTriggered: number;
  totalEventsResolved: number;
  totalMaterialsGathered: number;
  totalCoinsEarned: number;
  totalXpEarned: number;
  totalMechsLost: number;
  totalChambersDefended: number;
}

export interface IrReachState {
  irLevel: number;
  irXp: number;
  irMaxXp: number;
  irCurrentTitle: string;
  irTotalXp: number;
  irTotalCoins: number;
  irMechs: IrMechState[];
  irInventory: IrInventoryItem[];
  irStructures: IrStructureState[];
  irArtifacts: string[];
  irAbilities: string[];
  irAchievements: string[];
  irChambers: IrChamberState[];
  irEventLog: IrEventLogEntry[];
  irActiveEvent: string | null;
  irStats: IrStats;
}

// ─── SECTION 2: IR_ CONSTANTS ───────────────────────────────────────────────────

export const IR_SAVE_KEY = 'iron-reach-save';
export const IR_MAX_LEVEL = 50;
export const IR_XP_BASE = 100;
export const IR_XP_SCALE = 1.5;

// ─── IR_SPECIES: 7 species definitions ──────────────────────────────────────────

export const IR_SPECIES: { species: IrSpecies; name: string; description: string; icon: string; color: string }[] = [
  { species: 'ironclad_beetle', name: 'Ironclad Beetle', description: 'Resilient beetles with natural iron carapaces. Sturdy frontline defenders.', icon: '🪲', color: '#71797E' },
  { species: 'steel_wyrm', name: 'Steel Wyrm', description: 'Serpentine war machines forged from flexible steel alloys. Devastating attackers.', icon: '🐉', color: '#4682B4' },
  { species: 'copper_sentinel', name: 'Copper Sentinel', description: 'Automated guard units with intricate copper circuitry. Excellent scouts.', icon: '🤖', color: '#B87333' },
  { species: 'bronze_titan', name: 'Bronze Titan', description: 'Massive bronze colossi that tower over the battlefield. Immovable anchors.', icon: '🗿', color: '#CD7F32' },
  { species: 'tungsten_golem', name: 'Tungsten Golem', description: 'Indestructible golems of pure tungsten. The heaviest and toughest mechs.', icon: '🗿', color: '#A9A9A9' },
  { species: 'chrome_hawk', name: 'Chrome Hawk', description: 'Lightning-fast aerial mechs with chrome-plated wings. Supreme speed.', icon: '🦅', color: '#C0C0C0' },
  { species: 'nickel_spider', name: 'Nickel Spider', description: 'Eight-legged mechs that weave traps of nickel wire. Master tacticians.', icon: '🕷️', color: '#8B8682' },
];

// ─── IR_CREATURES: 35 mechs (5 per species) ─────────────────────────────────────

export const IR_CREATURES: IrCreatureDef[] = [
  // ── Ironclad Beetle (5) ──
  {
    id: 'ir_ironclad_beetle_grub',
    name: 'Ironclad Beetle Grub',
    species: 'ironclad_beetle',
    rarity: IR_RARITY_COMMON,
    hp: 120, attack: 18, defense: 25, speed: 3, forgePower: 8,
    assembleCost: 50,
    description: 'A basic ironclad beetle grub with a rudimentary iron shell. Reliable frontline mech.',
    lore: 'The first ironclad beetles were discovered in the deepest iron mines, feeding on raw ore.',
    icon: '🪲', color: '#71797E',
  },
  {
    id: 'ir_ironclad_beetle_scout',
    name: 'Ironclad Beetle Scout',
    species: 'ironclad_beetle',
    rarity: IR_RARITY_UNCOMMON,
    hp: 180, attack: 28, defense: 35, speed: 6, forgePower: 15,
    assembleCost: 180,
    description: 'A reinforced scout beetle with enhanced sensory arrays and thicker plating.',
    lore: 'Scout beetles can detect vibrations through iron ore deposits from miles away.',
    icon: '🪲', color: '#8B9297',
  },
  {
    id: 'ir_ironclad_beetle_husk',
    name: 'Ironclad Beetle Husk',
    species: 'ironclad_beetle',
    rarity: IR_RARITY_RARE,
    hp: 300, attack: 42, defense: 55, speed: 4, forgePower: 25,
    assembleCost: 500,
    description: 'A massive beetle whose shell has been replaced with layered iron plates. Nearly impervious to damage.',
    lore: 'Husk beetles molt their shells annually, and the discarded carapaces are used to forge fortress walls.',
    icon: '🪲', color: '#6B7378',
  },
  {
    id: 'ir_ironclad_beetle_bastion',
    name: 'Ironclad Beetle Bastion',
    species: 'ironclad_beetle',
    rarity: IR_RARITY_EPIC,
    hp: 450, attack: 55, defense: 75, speed: 3, forgePower: 40,
    assembleCost: 1200,
    description: 'A living fortress beetle whose shell forms an impenetrable dome over allies.',
    lore: 'The Bastion beetle is said to be the reincarnation of the first Iron Reach fortress itself.',
    icon: '🪲', color: '#5B6368',
  },
  {
    id: 'ir_ironclad_beetle_eternal',
    name: 'Eternal Ironclad Beetle',
    species: 'ironclad_beetle',
    rarity: IR_RARITY_LEGENDARY,
    hp: 700, attack: 70, defense: 100, speed: 5, forgePower: 60,
    assembleCost: 3000,
    description: 'The primordial beetle whose shell contains every metal ever forged. It cannot be destroyed.',
    lore: 'Legend says the Eternal Beetle was the first living thing to emerge from the primal forge.',
    icon: '🪲', color: '#C0C0C0',
  },

  // ── Steel Wyrm (5) ──
  {
    id: 'ir_steel_wyrm_hatchling',
    name: 'Steel Wyrm Hatchling',
    species: 'steel_wyrm',
    rarity: IR_RARITY_COMMON,
    hp: 80, attack: 22, defense: 12, speed: 14, forgePower: 10,
    assembleCost: 55,
    description: 'A young steel wyrm made of flexible steel segments. Fast and aggressive.',
    lore: 'Steel wyrm hatchlings are born when lightning strikes an iron deposit during a thunderstorm.',
    icon: '🐉', color: '#4682B4',
  },
  {
    id: 'ir_steel_wyrm_striker',
    name: 'Steel Wyrm Striker',
    species: 'steel_wyrm',
    rarity: IR_RARITY_UNCOMMON,
    hp: 150, attack: 38, defense: 22, speed: 18, forgePower: 18,
    assembleCost: 200,
    description: 'An adult wyrm with razor-sharp steel fangs and a devastating charge attack.',
    lore: 'Striker wyrms can bite through titanium plate in a single strike, their teeth never dulling.',
    icon: '🐉', color: '#5A92B4',
  },
  {
    id: 'ir_steel_wyrm_siege',
    name: 'Steel Wyrm Siege',
    species: 'steel_wyrm',
    rarity: IR_RARITY_RARE,
    hp: 250, attack: 58, defense: 35, speed: 16, forgePower: 30,
    assembleCost: 550,
    description: 'A siege-type wyrm capable of burrowing through rock and steel fortifications.',
    lore: 'Siege wyrms were originally designed to tunnel beneath enemy fortress walls during the Iron Wars.',
    icon: '🐉', color: '#3A72A4',
  },
  {
    id: 'ir_steel_wyrm_tempest',
    name: 'Steel Wyrm Tempest',
    species: 'steel_wyrm',
    rarity: IR_RARITY_EPIC,
    hp: 380, attack: 75, defense: 45, speed: 24, forgePower: 48,
    assembleCost: 1300,
    description: 'A storm-riding wyrm whose steel body channels electrical energy through every segment.',
    lore: 'Tempest wyrms are drawn to thunderstorms, absorbing lightning to power their devastating attacks.',
    icon: '🐉', color: '#2A6294',
  },
  {
    id: 'ir_steel_wyrm_omnivore',
    name: 'Omnivore Steel Wyrm',
    species: 'steel_wyrm',
    rarity: IR_RARITY_LEGENDARY,
    hp: 600, attack: 95, defense: 60, speed: 28, forgePower: 70,
    assembleCost: 3200,
    description: 'The ultimate wyrm — a segmented leviathan of living steel that devours all in its path.',
    lore: 'The Omnivore Wyrm consumes metal and grows stronger with every meal, eventually becoming indestructible.',
    icon: '🐉', color: '#C0C0C0',
  },

  // ── Copper Sentinel (5) ──
  {
    id: 'ir_copper_sentinel_drone',
    name: 'Copper Sentinel Drone',
    species: 'copper_sentinel',
    rarity: IR_RARITY_COMMON,
    hp: 70, attack: 14, defense: 18, speed: 12, forgePower: 6,
    assembleCost: 45,
    description: 'A basic autonomous drone made of copper wire and simple circuitry.',
    lore: 'Copper drones were the first automated units ever built in the Iron Reach, patrolling mine shafts.',
    icon: '🤖', color: '#B87333',
  },
  {
    id: 'ir_copper_sentinel_warden',
    name: 'Copper Sentinel Warden',
    species: 'copper_sentinel',
    rarity: IR_RARITY_UNCOMMON,
    hp: 140, attack: 25, defense: 30, speed: 15, forgePower: 14,
    assembleCost: 170,
    description: 'A guard sentinel with advanced copper sensors and an electrified stun baton.',
    lore: 'Wardens communicate through copper wire networks, forming a hive mind across the fortress.',
    icon: '🤖', color: '#C88343',
  },
  {
    id: 'ir_copper_sentinel_overseer',
    name: 'Copper Sentinel Overseer',
    species: 'copper_sentinel',
    rarity: IR_RARITY_RARE,
    hp: 220, attack: 40, defense: 42, speed: 14, forgePower: 28,
    assembleCost: 480,
    description: 'An overseer unit that coordinates lesser sentinels and boosts their combat efficiency.',
    lore: 'Overseers have copper brains that process tactical data faster than any human commander.',
    icon: '🤖', color: '#D89353',
  },
  {
    id: 'ir_copper_sentinel_wardmaster',
    name: 'Copper Sentinel Wardmaster',
    species: 'copper_sentinel',
    rarity: IR_RARITY_EPIC,
    hp: 350, attack: 58, defense: 55, speed: 18, forgePower: 42,
    assembleCost: 1150,
    description: 'The supreme sentinel that commands an entire army of copper units through electromagnetic pulses.',
    lore: 'Wardmasters can see through every copper sentinel simultaneously, making them omniscient commanders.',
    icon: '🤖', color: '#E8A363',
  },
  {
    id: 'ir_copper_sentinel_primarch',
    name: 'Copper Sentinel Primarch',
    species: 'copper_sentinel',
    rarity: IR_RARITY_LEGENDARY,
    hp: 550, attack: 80, defense: 75, speed: 22, forgePower: 65,
    assembleCost: 2800,
    description: 'The original copper sentinel from which all others were copied. It possesses true consciousness.',
    lore: 'The Primarch was built by an unknown civilization long before the Iron Reach was founded.',
    icon: '🤖', color: '#C0C0C0',
  },

  // ── Bronze Titan (5) ──
  {
    id: 'ir_bronze_titan_effigy',
    name: 'Bronze Titan Effigy',
    species: 'bronze_titan',
    rarity: IR_RARITY_COMMON,
    hp: 160, attack: 16, defense: 30, speed: 2, forgePower: 12,
    assembleCost: 60,
    description: 'A small bronze effigy animated by basic furnace magic. Slow but tough.',
    lore: 'Bronze effigies were originally built as temple guardians in the ancient canyon temples.',
    icon: '🗿', color: '#CD7F32',
  },
  {
    id: 'ir_bronze_titan_sentinel',
    name: 'Bronze Titan Sentinel',
    species: 'bronze_titan',
    rarity: IR_RARITY_UNCOMMON,
    hp: 280, attack: 28, defense: 48, speed: 3, forgePower: 20,
    assembleCost: 220,
    description: 'A full-sized bronze titan standing twenty feet tall. Its bronze skin is nearly impervious.',
    lore: 'Titan sentinels weigh several tons and their footsteps cause minor tremors in the iron canyons.',
    icon: '🗿', color: '#DD8F42',
  },
  {
    id: 'ir_bronze_titan_colossus',
    name: 'Bronze Titan Colossus',
    species: 'bronze_titan',
    rarity: IR_RARITY_RARE,
    hp: 420, attack: 45, defense: 65, speed: 2, forgePower: 32,
    assembleCost: 600,
    description: 'A colossus-class titan that towers over fortresses. Its bronze fists shatter stone walls.',
    lore: 'The Colossus was commissioned during the Bronze Era to defend the Great Bridge against invaders.',
    icon: '🗿', color: '#ED9F52',
  },
  {
    id: 'ir_bronze_titan_herald',
    name: 'Bronze Titan Herald',
    species: 'bronze_titan',
    rarity: IR_RARITY_EPIC,
    hp: 580, attack: 60, defense: 80, speed: 3, forgePower: 50,
    assembleCost: 1400,
    description: 'A herald titan inscribed with ancient bronze runes that amplify its defensive aura.',
    lore: 'Herald titans radiate a protective field that makes all nearby allies nearly immune to damage.',
    icon: '🗿', color: '#FDAF62',
  },
  {
    id: 'ir_bronze_titan_immortal',
    name: 'Immortal Bronze Titan',
    species: 'bronze_titan',
    rarity: IR_RARITY_LEGENDARY,
    hp: 800, attack: 85, defense: 110, speed: 4, forgePower: 75,
    assembleCost: 3500,
    description: 'The Immortal Titan — a self-repairing bronze colossus that has guarded the Reach since its founding.',
    lore: 'No weapon has ever breached the Immortal Titan armor. It repairs itself by absorbing bronze from the earth.',
    icon: '🗿', color: '#C0C0C0',
  },

  // ── Tungsten Golem (5) ──
  {
    id: 'ir_tungsten_golem_core',
    name: 'Tungsten Golem Core',
    species: 'tungsten_golem',
    rarity: IR_RARITY_COMMON,
    hp: 200, attack: 12, defense: 40, speed: 1, forgePower: 15,
    assembleCost: 70,
    description: 'A heavy golem with a tungsten core providing extreme durability. Extremely slow.',
    lore: 'Tungsten golems are so dense they sink into solid ground if they stand still too long.',
    icon: '🗿', color: '#A9A9A9',
  },
  {
    id: 'ir_tungsten_golem_bulwark',
    name: 'Tungsten Golem Bulwark',
    species: 'tungsten_golem',
    rarity: IR_RARITY_UNCOMMON,
    hp: 350, attack: 22, defense: 58, speed: 2, forgePower: 22,
    assembleCost: 250,
    description: 'A reinforced golem whose tungsten frame can withstand direct cannon fire.',
    lore: 'Bulwark golems are used as mobile fortifications, deployed at chokepoints throughout the Reach.',
    icon: '🗿', color: '#B9B9B9',
  },
  {
    id: 'ir_tungsten_golem_juggernaut',
    name: 'Tungsten Golem Juggernaut',
    species: 'tungsten_golem',
    rarity: IR_RARITY_RARE,
    hp: 520, attack: 38, defense: 78, speed: 2, forgePower: 35,
    assembleCost: 650,
    description: 'A juggernaut-class golem that cannot be stopped by any conventional force.',
    lore: 'Juggernaut golems have been known to walk through molten lava without slowing down.',
    icon: '🗿', color: '#C9C9C9',
  },
  {
    id: 'ir_tungsten_golem_monolith',
    name: 'Tungsten Golem Monolith',
    species: 'tungsten_golem',
    rarity: IR_RARITY_EPIC,
    hp: 700, attack: 52, defense: 95, speed: 2, forgePower: 55,
    assembleCost: 1500,
    description: 'A monolithic tungsten construct whose density warps the ground around it.',
    lore: 'Monolith golems are so heavy they create their own gravity wells, pulling enemies toward them.',
    icon: '🗿', color: '#D9D9D9',
  },
  {
    id: 'ir_tungsten_golem_everlasting',
    name: 'Everlasting Tungsten Golem',
    species: 'tungsten_golem',
    rarity: IR_RARITY_LEGENDARY,
    hp: 1000, attack: 75, defense: 130, speed: 3, forgePower: 80,
    assembleCost: 4000,
    description: 'The Everlasting Golem — forged from pure tungsten at the core of a collapsed star.',
    lore: 'Nothing in the known universe can scratch the Everlasting Golem. It predates the Iron Reach itself.',
    icon: '🗿', color: '#C0C0C0',
  },

  // ── Chrome Hawk (5) ──
  {
    id: 'ir_chrome_hawk_fledgling',
    name: 'Chrome Hawk Fledgling',
    species: 'chrome_hawk',
    rarity: IR_RARITY_COMMON,
    hp: 50, attack: 20, defense: 6, speed: 25, forgePower: 5,
    assembleCost: 40,
    description: 'A young chrome-plated hawk mech with incredible speed but fragile construction.',
    lore: 'Chrome hawks are the fastest mechs in the Iron Reach, used for reconnaissance and courier missions.',
    icon: '🦅', color: '#C0C0C0',
  },
  {
    id: 'ir_chrome_hawk_interceptor',
    name: 'Chrome Hawk Interceptor',
    species: 'chrome_hawk',
    rarity: IR_RARITY_UNCOMMON,
    hp: 90, attack: 35, defense: 12, speed: 30, forgePower: 12,
    assembleCost: 160,
    description: 'An interceptor hawk with sharpened chrome talons that can slice through steel cables.',
    lore: 'Interceptor hawks can reach speeds that generate sonic booms, shattering enemy formations.',
    icon: '🦅', color: '#D0D0D0',
  },
  {
    id: 'ir_chrome_hawk_dive_bomber',
    name: 'Chrome Hawk Dive Bomber',
    species: 'chrome_hawk',
    rarity: IR_RARITY_RARE,
    hp: 150, attack: 55, defense: 18, speed: 35, forgePower: 22,
    assembleCost: 450,
    description: 'A specialized hawk that dives from extreme altitude with explosive chrome-tipped talons.',
    lore: 'Dive bombers reach terminal velocity before impact, concentrating all their force into a single devastating strike.',
    icon: '🦅', color: '#E0E0E0',
  },
  {
    id: 'ir_chrome_hawk_stormrider',
    name: 'Chrome Hawk Stormrider',
    species: 'chrome_hawk',
    rarity: IR_RARITY_EPIC,
    hp: 220, attack: 70, defense: 25, speed: 40, forgePower: 38,
    assembleCost: 1100,
    description: 'A storm-riding hawk that channels electricity through its chrome feathers during flight.',
    lore: 'Stormriders only fly during electrical storms, using lightning to power their devastating attacks.',
    icon: '🦅', color: '#F0F0F0',
  },
  {
    id: 'ir_chrome_hawk_sky_sovereign',
    name: 'Sky Sovereign Chrome Hawk',
    species: 'chrome_hawk',
    rarity: IR_RARITY_LEGENDARY,
    hp: 350, attack: 90, defense: 35, speed: 50, forgePower: 58,
    assembleCost: 2600,
    description: 'The Sky Sovereign — a chrome hawk so perfectly aerodynamic it can fly faster than light itself.',
    lore: 'The Sky Sovereign rules the skies above the Iron Reach, and no enemy has ever breached the airspace it patrols.',
    icon: '🦅', color: '#C0C0C0',
  },

  // ── Nickel Spider (5) ──
  {
    id: 'ir_nickel_spider_ling',
    name: 'Nickel Spider Ling',
    species: 'nickel_spider',
    rarity: IR_RARITY_COMMON,
    hp: 60, attack: 16, defense: 10, speed: 16, forgePower: 7,
    assembleCost: 48,
    description: 'A small nickel spider mech that weaves conductive nickel wire traps.',
    lore: 'Nickel spiders spin webs that can carry electrical current, stunning anything caught in them.',
    icon: '🕷️', color: '#8B8682',
  },
  {
    id: 'ir_nickel_spider_weaver',
    name: 'Nickel Spider Weaver',
    species: 'nickel_spider',
    rarity: IR_RARITY_UNCOMMON,
    hp: 110, attack: 28, defense: 20, speed: 20, forgePower: 16,
    assembleCost: 175,
    description: 'A skilled weaver that creates complex nickel wire networks across the battlefield.',
    lore: 'Weaver spiders can sense vibrations through their webs from miles away, acting as early warning systems.',
    icon: '🕷️', color: '#9B9692',
  },
  {
    id: 'ir_nickel_spider_trapdoor',
    name: 'Nickel Spider Trapdoor',
    species: 'nickel_spider',
    rarity: IR_RARITY_RARE,
    hp: 200, attack: 42, defense: 32, speed: 18, forgePower: 26,
    assembleCost: 480,
    description: 'An ambush spider that creates hidden nickel pitfalls lined with razor wire.',
    lore: 'Trapdoor spiders have been known to capture entire squads of enemies in a single web deployment.',
    icon: '🕷️', color: '#ABA69E',
  },
  {
    id: 'ir_nickel_spider_arachnarch',
    name: 'Nickel Spider Arachnarch',
    species: 'nickel_spider',
    rarity: IR_RARITY_EPIC,
    hp: 320, attack: 60, defense: 45, speed: 22, forgePower: 40,
    assembleCost: 1200,
    description: 'The Arachnarch commands lesser nickel spiders through electromagnetic pheromone signals.',
    lore: 'An Arachnarch web covers entire canyon systems, turning them into inescapable death traps.',
    icon: '🕷️', color: '#BBB6AE',
  },
  {
    id: 'ir_nickel_spider_void_weaver',
    name: 'Void Weaver Nickel Spider',
    species: 'nickel_spider',
    rarity: IR_RARITY_LEGENDARY,
    hp: 500, attack: 85, defense: 60, speed: 28, forgePower: 62,
    assembleCost: 2900,
    description: 'The Void Weaver spins webs between dimensions, trapping enemies in nickel-coated pocket dimensions.',
    lore: 'The Void Weaver exists in multiple dimensions simultaneously, and its webs span the fabric of reality.',
    icon: '🕷️', color: '#C0C0C0',
  },
];

// ─── IR_CHAMBERS: 8 industrial zones ────────────────────────────────────────────

export const IR_CHAMBERS: IrChamberDef[] = [
  {
    id: 'blast_furnace',
    name: 'The Blast Furnace',
    description: 'The roaring heart of the Iron Reach where raw ore is smelted into usable metal. Temperatures here exceed 2000 degrees. The main production hub for all mechanical units.',
    level: 1, maxLevel: 10,
    resources: { tungstenOre: 100, chromiumSteel: 50, copperCoil: 25 },
    capacity: 8, defenseRating: 75, regionColor: '#FF4500', icon: '🔥', unlockLevel: 1,
  },
  {
    id: 'steel_bridge_outpost',
    name: 'Steel Bridge Outpost',
    description: 'A fortified bridge spanning a molten iron river, connecting the outer canyons to the inner fortress. Critical supply route.',
    level: 1, maxLevel: 10,
    resources: { tungstenOre: 80, chromiumSteel: 70, copperCoil: 30 },
    capacity: 6, defenseRating: 60, regionColor: '#4682B4', icon: '🌉', unlockLevel: 3,
  },
  {
    id: 'iron_canyon_mine',
    name: 'Iron Canyon Mine',
    description: 'A vast open-pit mine carved into the iron canyon walls. Rich deposits of every metal known to civilization can be found here.',
    level: 1, maxLevel: 10,
    resources: { tungstenOre: 150, chromiumSteel: 40, copperCoil: 60 },
    capacity: 10, defenseRating: 50, regionColor: '#71797E', icon: '⛏️', unlockLevel: 1,
  },
  {
    id: 'chrome_plateau',
    name: 'Chrome Plateau',
    description: 'A high-altitude plateau coated in natural chrome deposits. The gleaming surface provides excellent visibility and defensive positioning.',
    level: 1, maxLevel: 10,
    resources: { tungstenOre: 60, chromiumSteel: 90, copperCoil: 40 },
    capacity: 5, defenseRating: 55, regionColor: '#C0C0C0', icon: '🏔️', unlockLevel: 6,
  },
  {
    id: 'copper_forges',
    name: 'Copper Forges',
    description: 'The secondary forge complex specializing in copper alloys and electrical components. The air crackles with static electricity.',
    level: 1, maxLevel: 10,
    resources: { tungstenOre: 70, chromiumSteel: 60, copperCoil: 120 },
    capacity: 7, defenseRating: 45, regionColor: '#B87333', icon: '⚒️', unlockLevel: 10,
  },
  {
    id: 'bronze_bastion',
    name: 'Bronze Bastion',
    description: 'An ancient bronze fortress perched on a canyon cliff. Its walls have withstood centuries of sieges and still stand proud.',
    level: 1, maxLevel: 10,
    resources: { tungstenOre: 90, chromiumSteel: 80, copperCoil: 50 },
    capacity: 9, defenseRating: 85, regionColor: '#CD7F32', icon: '🏰', unlockLevel: 15,
  },
  {
    id: 'tungsten_deep',
    name: 'Tungsten Deep',
    description: 'The deepest mining shaft in the Iron Reach, plunging miles into the earth. Tungsten deposits here are the purest ever found.',
    level: 1, maxLevel: 10,
    resources: { tungstenOre: 200, chromiumSteel: 30, copperCoil: 20 },
    capacity: 4, defenseRating: 40, regionColor: '#A9A9A9', icon: '🕳️', unlockLevel: 25,
  },
  {
    id: 'iron_crown_spire',
    name: 'Iron Crown Spire',
    description: 'The central command spire of the Iron Reach, crowned with an enormous iron crown antenna. All coordination flows from here.',
    level: 1, maxLevel: 10,
    resources: { tungstenOre: 50, chromiumSteel: 100, copperCoil: 100 },
    capacity: 12, defenseRating: 95, regionColor: '#2C2C2C', icon: '🗼', unlockLevel: 35,
  },
];

// ─── IR_MATERIALS: 12 materials ─────────────────────────────────────────────────

export const IR_MATERIALS: IrMaterialDef[] = [
  // Ores (3)
  { id: 'ir_tungsten_ore', name: 'Tungsten Ore', rarity: IR_RARITY_COMMON, category: 'ore', description: 'Raw tungsten ore mined from deep canyon shafts. The foundation of the heaviest mech construction.', icon: '�ite', color: '#A9A9A9' },
  { id: 'ir_chromium_steel', name: 'Chromium Steel', rarity: IR_RARITY_UNCOMMON, category: 'alloy', description: 'A corrosion-resistant steel alloy used in high-durability mech frames and fortress plating.', icon: '🔩', color: '#4682B4' },
  { id: 'ir_copper_coil', name: 'Copper Coil', rarity: IR_RARITY_COMMON, category: 'component', description: 'Precision-wound copper coils essential for powering mech electrical systems and abilities.', icon: '🔌', color: '#B87333' },
  { id: 'ir_titanium_plate', name: 'Titanium Plate', rarity: IR_RARITY_RARE, category: 'alloy', description: 'Lightweight titanium plates with exceptional strength-to-weight ratio. Used in advanced mech armor.', icon: '🛡️', color: '#878681' },
  { id: 'ir_molten_core', name: 'Molten Core', rarity: IR_RARITY_UNCOMMON, category: 'component', description: 'A superheated core of molten metal extracted from the Blast Furnace. Powers mech energy systems.', icon: '☀️', color: '#FF4500' },
  { id: 'ir_nickel_wire', name: 'Nickel Wire', rarity: IR_RARITY_COMMON, category: 'component', description: 'Conductive nickel wire used in mech circuitry and trap construction by spider-type units.', icon: '🧵', color: '#8B8682' },
  { id: 'ir_bronze_ingot', name: 'Bronze Ingot', rarity: IR_RARITY_COMMON, category: 'alloy', description: 'Standardized bronze ingots produced in the Copper Forges. Basic building material for titan-class mechs.', icon: '🧱', color: '#CD7F32' },
  { id: 'ir_chrome_filament', name: 'Chrome Filament', rarity: IR_RARITY_RARE, category: 'component', description: 'Ultra-thin chrome filaments that reflect light and energy. Critical for hawk-class optical systems.', icon: '✨', color: '#C0C0C0' },
  { id: 'ir_cobalt_magnet', name: 'Cobalt Magnet', rarity: IR_RARITY_UNCOMMON, category: 'rare_earth', description: 'Powerful cobalt magnets used in mech propulsion systems and defense field generators.', icon: '🧲', color: '#0047AB' },
  { id: 'ir_iridium_alloy', name: 'Iridium Alloy', rarity: IR_RARITY_EPIC, category: 'alloy', description: 'An extremely rare alloy combining iridium with tungsten. Virtually indestructible under any conditions.', icon: '💎', color: '#B0E0E6' },
  { id: 'ir_void_crystal', name: 'Void Crystal', rarity: IR_RARITY_EPIC, category: 'rare_earth', description: 'Crystals found only in the deepest mine shafts that absorb and store enormous amounts of energy.', icon: '🔮', color: '#4B0082' },
  { id: 'ir_primal_forge_ember', name: 'Primal Forge Ember', rarity: IR_RARITY_LEGENDARY, category: 'mythic', description: 'An ember from the original forge that created the Iron Reach. Contains the primordial fire of creation.', icon: '🌟', color: '#FFD700' },
];

// ─── IR_STRUCTURES: 8 structures ────────────────────────────────────────────────

export const IR_STRUCTURES: IrStructureDef[] = [
  {
    id: 'ir_struct_mega_forge',
    name: 'Mega Forge',
    description: 'A massive multi-chamber forge capable of assembling the largest mech units. The beating heart of Iron Reach production.',
    bonusType: 'forge_boost', maxLevel: 10, baseCost: 100, costMultiplier: 1.5, effectPerLevel: 5,
    chamberId: 'blast_furnace', icon: '🔨',
  },
  {
    id: 'ir_struct_cannon_bastion',
    name: 'Cannon Bastion',
    description: 'A fortified gun emplacement defending the Steel Bridge approach. Automated cannons provide overlapping fields of fire.',
    bonusType: 'defense_rating', maxLevel: 10, baseCost: 80, costMultiplier: 1.4, effectPerLevel: 4,
    chamberId: 'steel_bridge_outpost', icon: '💣',
  },
  {
    id: 'ir_struct_ore_silo',
    name: 'Ore Storage Silo',
    description: 'A massive reinforced silo for storing raw ore and refined metals. Protects materials from the elements.',
    bonusType: 'storage_cap', maxLevel: 10, baseCost: 60, costMultiplier: 1.3, effectPerLevel: 15,
    chamberId: 'iron_canyon_mine', icon: '🏛️',
  },
  {
    id: 'ir_struct_energy_harvester',
    name: 'Energy Harvester Array',
    description: 'Solar and geothermal energy collectors that power the fortress. Converts natural heat into usable mech energy.',
    bonusType: 'energy_regen', maxLevel: 10, baseCost: 120, costMultiplier: 1.6, effectPerLevel: 3,
    chamberId: 'chrome_plateau', icon: '⚡',
  },
  {
    id: 'ir_struct_deploy_bay',
    name: 'Mech Deploy Bay',
    description: 'A specialized hangar for rapid mech deployment. Launches mechs directly into battle through reinforced drop chutes.',
    bonusType: 'deploy_power', maxLevel: 10, baseCost: 90, costMultiplier: 1.5, effectPerLevel: 4,
    chamberId: 'bronze_bastion', icon: '🚀',
  },
  {
    id: 'ir_struct_alloy_lab',
    name: 'Alloy Research Laboratory',
    description: 'An advanced metallurgy lab where new alloys are discovered and existing ones are perfected.',
    bonusType: 'material_yield', maxLevel: 10, baseCost: 150, costMultiplier: 1.6, effectPerLevel: 6,
    chamberId: 'copper_forges', icon: '🔬',
  },
  {
    id: 'ir_struct_repair_yard',
    name: 'Repair and Salvage Yard',
    description: 'A sprawling yard where damaged mechs are repaired and destroyed enemies are salvaged for parts.',
    bonusType: 'mech_repair', maxLevel: 10, baseCost: 70, costMultiplier: 1.4, effectPerLevel: 5,
    chamberId: 'tungsten_deep', icon: '🔧',
  },
  {
    id: 'ir_struct_scout_tower',
    name: 'Long-Range Scout Tower',
    description: 'A towering observation post equipped with advanced optics and communication arrays. Monitors the entire frontier.',
    bonusType: 'scout_range', maxLevel: 10, baseCost: 110, costMultiplier: 1.5, effectPerLevel: 8,
    chamberId: 'iron_crown_spire', icon: '🔭',
  },
];

// ─── IR_ABILITIES: 8 abilities ──────────────────────────────────────────────────

export const IR_ABILITIES: IrAbilityDef[] = [
  {
    id: 'ir_ability_molten_surge',
    name: 'Molten Surge',
    category: 'offensive',
    rarity: IR_RARITY_COMMON,
    power: 35, cooldown: 120, energyCost: 20,
    description: 'Channels molten iron through the mech frame, superheating its weapons for devastating fire damage.',
    icon: '🔥', color: '#FF4500',
  },
  {
    id: 'ir_ability_iron_wall',
    name: 'Iron Wall',
    category: 'defensive',
    rarity: IR_RARITY_COMMON,
    power: 40, cooldown: 90, energyCost: 15,
    description: 'Raises a temporary wall of solid iron that absorbs incoming damage and blocks enemy movement.',
    icon: '🧱', color: '#71797E',
  },
  {
    id: 'ir_ability_wire_trap',
    name: 'Wire Trap',
    category: 'utility',
    rarity: IR_RARITY_UNCOMMON,
    power: 25, cooldown: 60, energyCost: 10,
    description: 'Deploys a network of electrified nickel wire that stuns and damages enemies who cross it.',
    icon: '🕸️', color: '#8B8682',
  },
  {
    id: 'ir_ability_steel_tempest',
    name: 'Steel Tempest',
    category: 'offensive',
    rarity: IR_RARITY_RARE,
    power: 60, cooldown: 180, energyCost: 35,
    description: 'Generates a whirlwind of steel shrapnel that tears through enemy formations.',
    icon: '🌪️', color: '#4682B4',
  },
  {
    id: 'ir_ability_copper_shield',
    name: 'Copper Shield Matrix',
    category: 'defensive',
    rarity: IR_RARITY_UNCOMMON,
    power: 30, cooldown: 100, energyCost: 25,
    description: 'Creates an electromagnetic shield using copper coils that deflects projectile attacks.',
    icon: '🛡️', color: '#B87333',
  },
  {
    id: 'ir_ability_chrome_reflect',
    name: 'Chrome Reflection',
    category: 'defensive',
    rarity: IR_RARITY_RARE,
    power: 50, cooldown: 150, energyCost: 30,
    description: 'Polishes the mech chrome plating to mirror finish, reflecting enemy energy attacks back at them.',
    icon: '🪞', color: '#C0C0C0',
  },
  {
    id: 'ir_ability_titan_rage',
    name: 'Titan Rage',
    category: 'passive',
    rarity: IR_RARITY_EPIC,
    power: 80, cooldown: 300, energyCost: 50,
    description: 'Activates the titan core, doubling attack and defense for a short duration at the cost of mobility.',
    icon: '😤', color: '#CD7F32',
  },
  {
    id: 'ir_ability_forge Awakening',
    name: 'Forge Awakening',
    category: 'offensive',
    rarity: IR_RARITY_LEGENDARY,
    power: 120, cooldown: 600, energyCost: 100,
    description: 'Temporarily connects to the primal forge itself, granting godlike power to all allied mechs in range.',
    icon: '🌟', color: '#FFD700',
  },
];

// ─── IR_ACHIEVEMENTS: 10 achievements ───────────────────────────────────────────

export const IR_ACHIEVEMENTS: IrAchievementDef[] = [
  {
    id: 'ir_ach_first_assembly',
    name: 'First Assembly',
    description: 'Assemble your first mech unit, beginning your journey as an ironclad engineer.',
    condition: 'irStats.totalAssembled >= 1',
    rewardXp: 50, hidden: false, icon: '🔩',
  },
  {
    id: 'ir_ach_bridge_defender',
    name: 'Bridge Defender',
    description: 'Deploy 5 mechs to the Steel Bridge Outpost and successfully defend it against an incursion.',
    condition: 'irStats.totalDeployed >= 5',
    rewardXp: 150, hidden: false, icon: '🌉',
  },
  {
    id: 'ir_ach_fortress_builder',
    name: 'Fortress Builder',
    description: 'Build all 8 structures to at least level 1, establishing a fully operational frontier fortress.',
    condition: 'irStructures.length >= 8',
    rewardXp: 300, hidden: false, icon: '🏗️',
  },
  {
    id: 'ir_ach_material_hoarder',
    name: 'Material Hoarder',
    description: 'Accumulate 500 total materials across all types, demonstrating mastery of resource gathering.',
    condition: 'irStats.totalMaterialsGathered >= 500',
    rewardXp: 200, hidden: false, icon: '📦',
  },
  {
    id: 'ir_ach_artifact_collector',
    name: 'Artifact Collector',
    description: 'Activate 3 ancient artifacts, harnessing their power for the Iron Reach defense.',
    condition: 'irArtifacts.length >= 3',
    rewardXp: 400, hidden: false, icon: '🏺',
  },
  {
    id: 'ir_ach_mech_army',
    name: 'Mech Army',
    description: 'Have 10 active mechs deployed simultaneously across all chambers.',
    condition: 'irMechs.length >= 10',
    rewardXp: 500, hidden: false, icon: '🤖',
  },
  {
    id: 'ir_ach_event_resolver',
    name: 'Event Resolver',
    description: 'Successfully resolve 10 frontier events, proving your leadership under pressure.',
    condition: 'irStats.totalEventsResolved >= 10',
    rewardXp: 350, hidden: false, icon: '⚡',
  },
  {
    id: 'ir_ach_canyon_master',
    name: 'Canyon Master',
    description: 'Discover all 8 chambers of the Iron Reach, mapping the entire frontier.',
    condition: 'irChambers.filter(c => c.discovered).length >= 8',
    rewardXp: 600, hidden: true, icon: '🗺️',
  },
  {
    id: 'ir_ach_forge_legend',
    name: 'Forge Legend',
    description: 'Reach Iron Reach level 40, standing among the greatest engineers in frontier history.',
    condition: 'irLevel >= 40',
    rewardXp: 800, hidden: true, icon: '👑',
  },
  {
    id: 'ir_ach_eternal_guardian',
    name: 'Eternal Guardian',
    description: 'Assemble a legendary-tier mech, commanding the most powerful war machine in the Iron Reach.',
    condition: 'irMechs.some(m => m.level >= 10)',
    rewardXp: 1000, hidden: true, icon: '⭐',
  },
];

// ─── IR_TITLES: 8 titles ───────────────────────────────────────────────────────

export const IR_TITLES: IrTitleDef[] = [
  {
    id: 'ir_title_recruit',
    name: 'Iron Recruit',
    requirement: 'Join the Iron Reach as a new recruit.',
    minMechs: 0, minChambers: 1, bonusMultiplier: 1,
    icon: '🔧', description: 'A fresh recruit assigned to the frontier. Eager to learn the art of mech construction and fortress defense.',
  },
  {
    id: 'ir_title_engineer',
    name: 'Ironclad Engineer',
    requirement: 'Assemble 3 mechs and discover 2 chambers.',
    minMechs: 3, minChambers: 2, bonusMultiplier: 1.1,
    icon: '⚙️', description: 'A trained engineer capable of building functional mechs and maintaining frontier infrastructure.',
  },
  {
    id: 'ir_title_foreman',
    name: 'Forge Foreman',
    requirement: 'Assemble 5 mechs, build 2 structures.',
    minMechs: 5, minChambers: 3, bonusMultiplier: 1.2,
    icon: '🔨', description: 'A foreman overseeing forge operations and directing mech deployment across multiple chambers.',
  },
  {
    id: 'ir_title_commander',
    name: 'Steel Commander',
    requirement: 'Assemble 10 mechs, build 4 structures, discover 4 chambers.',
    minMechs: 10, minChambers: 4, bonusMultiplier: 1.35,
    icon: '⚔️', description: 'A battlefield commander who leads mech armies into the iron canyons with strategic brilliance.',
  },
  {
    id: 'ir_title_warden',
    name: 'Frontier Warden',
    requirement: 'Assemble 15 mechs, build 6 structures, activate 2 artifacts.',
    minMechs: 15, minChambers: 5, bonusMultiplier: 1.5,
    icon: '🛡️', description: 'A warden of the frontier responsible for defending the entire Iron Reach from mechanical threats.',
  },
  {
    id: 'ir_title_architect',
    name: 'Master Architect',
    requirement: 'Build all 8 structures to level 5, discover 6 chambers.',
    minMechs: 10, minChambers: 6, bonusMultiplier: 1.7,
    icon: '🏗️', description: 'A master architect whose fortress designs are studied and copied across the frontier.',
  },
  {
    id: 'ir_title_overlord',
    name: 'Iron Overlord',
    requirement: 'Assemble 25 mechs, discover 7 chambers, activate 4 artifacts.',
    minMechs: 25, minChambers: 7, bonusMultiplier: 2.0,
    icon: '👑', description: 'The supreme commander of the Iron Reach, ruling the frontier with absolute authority and unmatched power.',
  },
  {
    id: 'ir_title_eternal',
    name: 'Eternal Guardian',
    requirement: 'Reach level 50, assemble a legendary mech, discover all chambers.',
    minMechs: 30, minChambers: 8, bonusMultiplier: 2.5,
    icon: '🌟', description: 'The Eternal Guardian — a legendary figure who has transcended mortality to become one with the Iron Reach itself.',
  },
];

// ─── IR_ARTIFACTS: 6 artifacts ──────────────────────────────────────────────────

export const IR_ARTIFACTS: IrArtifactDef[] = [
  {
    id: 'ir_art_iron_heart',
    name: 'Iron Heart of the Forge',
    rarity: IR_RARITY_UNCOMMON,
    description: 'A beating heart made of pure iron that pulses with forge energy. Increases all mech HP by 10%.',
    lore: 'The Iron Heart was found at the bottom of the original blast furnace, still beating after centuries.',
    powerBonus: 5, defenseBonus: 10, forgeBonus: 15, icon: '❤️', color: '#71797E',
  },
  {
    id: 'ir_art_steel_crown',
    name: 'Steel Crown of Reach',
    rarity: IR_RARITY_RARE,
    description: 'A crown forged from the strongest steel, once worn by the first Iron Reach ruler. Boosts defense by 20%.',
    lore: 'The Steel Crown was hammered from a single piece of unbreakable steel found in the deepest mine shaft.',
    powerBonus: 10, defenseBonus: 20, forgeBonus: 10, icon: '👑', color: '#4682B4',
  },
  {
    id: 'ir_art_copper_conduit',
    name: 'Copper Conduit of Lightning',
    rarity: IR_RARITY_UNCOMMON,
    description: 'An ancient copper rod that channels lightning into mech power systems. Boosts energy regeneration.',
    lore: 'The Conduit was used by the original engineers to draw lightning from canyon storms.',
    powerBonus: 15, defenseBonus: 5, forgeBonus: 20, icon: '⚡', color: '#B87333',
  },
  {
    id: 'ir_art_chrome_mirror',
    name: 'Chrome Mirror of Reflection',
    rarity: IR_RARITY_RARE,
    description: 'A flawless chrome mirror that reflects any attack back at the attacker. Powerful defensive artifact.',
    lore: 'The Chrome Mirror was polished for a hundred years by blind artisans to achieve its perfect surface.',
    powerBonus: 8, defenseBonus: 30, forgeBonus: 8, icon: '🪞', color: '#C0C0C0',
  },
  {
    id: 'ir_art_bronze_bell',
    name: 'Bronze Bell of Resonance',
    rarity: IR_RARITY_EPIC,
    description: 'A massive bronze bell whose ring resonates through all mech circuits, temporarily boosting all stats.',
    lore: 'When the Bronze Bell tolls, every mech in the Iron Reach stands at attention and fights harder.',
    powerBonus: 25, defenseBonus: 25, forgeBonus: 30, icon: '🔔', color: '#CD7F32',
  },
  {
    id: 'ir_art_primal_anvil',
    name: 'Primal Anvil of Creation',
    rarity: IR_RARITY_LEGENDARY,
    description: 'The original anvil upon which the Iron Reach was forged. Grants unlimited forge power and doubles XP gain.',
    lore: 'The Primal Anvil exists in all times simultaneously. Every forge in the Iron Reach is a reflection of it.',
    powerBonus: 50, defenseBonus: 50, forgeBonus: 100, icon: '⚒️', color: '#FFD700',
  },
];

// ─── IR_EVENTS: 8 events ───────────────────────────────────────────────────────

export const IR_EVENTS: IrEventDef[] = [
  {
    id: 'ir_event_ore_collapse',
    name: 'Mine Shaft Collapse',
    description: 'A section of the Iron Canyon Mine has collapsed, trapping miners and exposing a rich vein of rare ore.',
    severity: 'moderate', duration: 300, rewardXp: 100, rewardCoins: 200, riskLevel: 3,
    icon: '🏚️', color: '#71797E',
  },
  {
    id: 'ir_event_mech_swarm',
    name: 'Rogue Mech Swarm',
    description: 'A swarm of automated mechs has gone haywire and is attacking the outer perimeter defenses.',
    severity: 'severe', duration: 600, rewardXp: 250, rewardCoins: 500, riskLevel: 6,
    icon: '🤖', color: '#FF4500',
  },
  {
    id: 'ir_event_chrome_storm',
    name: 'Chrome Storm',
    description: 'A rare electromagnetic storm is sweeping across the Chrome Plateau, disabling electronics and charging chrome plating.',
    severity: 'mild', duration: 180, rewardXp: 75, rewardCoins: 150, riskLevel: 2,
    icon: '⛈️', color: '#C0C0C0',
  },
  {
    id: 'ir_event_ancient_find',
    name: 'Ancient Discovery',
    description: 'Miners have uncovered an ancient mechanical vault deep beneath the Tungsten Deep, sealed for millennia.',
    severity: 'mild', duration: 120, rewardXp: 150, rewardCoins: 300, riskLevel: 1,
    icon: '🏛️', color: '#FFD700',
  },
  {
    id: 'ir_event_furnace_overload',
    name: 'Blast Furnace Overload',
    description: 'The main Blast Furnace is dangerously overloaded, threatening to explode and destroy the production hub.',
    severity: 'severe', duration: 400, rewardXp: 200, rewardCoins: 400, riskLevel: 7,
    icon: '💥', color: '#FF4500',
  },
  {
    id: 'ir_event_bridge_assault',
    name: 'Steel Bridge Assault',
    description: 'A massive enemy force is attempting to cross the Steel Bridge and breach the inner fortress.',
    severity: 'catastrophic', duration: 900, rewardXp: 500, rewardCoins: 1000, riskLevel: 9,
    icon: '🌉', color: '#4682B4',
  },
  {
    id: 'ir_event_spider_migration',
    name: 'Nickel Spider Migration',
    description: 'Thousands of wild nickel spiders are migrating through the canyon, their webs interfering with all systems.',
    severity: 'moderate', duration: 350, rewardXp: 120, rewardCoins: 250, riskLevel: 4,
    icon: '🕷️', color: '#8B8682',
  },
  {
    id: 'ir_event_forge_awakening',
    name: 'Forge Awakening',
    description: 'The primal forge beneath the Iron Crown Spire has briefly awakened, offering a surge of unlimited power.',
    severity: 'mild', duration: 200, rewardXp: 300, rewardCoins: 600, riskLevel: 2,
    icon: '🌟', color: '#FFD700',
  },
];

// ─── SECTION 3: HOOK IMPLEMENTATION ─────────────────────────────────────────────

// ─── Helper Functions ──────────────────────────────────────────────────────────

let irInstanceCounter = 0;

function irGenerateInstanceId(prefix: string): string {
  irInstanceCounter++;
  return `ir_${prefix}_${Date.now()}_${irInstanceCounter}`;
}

function irXpForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= IR_MAX_LEVEL) return Infinity;
  return Math.floor(IR_XP_BASE * Math.pow(level, IR_XP_SCALE));
}

function irGetRarityMultiplier(rarity: IrRarity): number {
  return IR_RARITY_XP_MULTIPLIER[rarity] ?? 1;
}

function irGetRarityLabel(rarity: IrRarity): string {
  return IR_RARITY_LABELS[rarity] ?? 'Unknown';
}

function irGetRarityColor(rarity: IrRarity): string {
  return IR_RARITY_COLORS[rarity] ?? IR_IRON_GRAY;
}

function irGetLevelUpResult(currentLevel: number, currentXp: number): { level: number; xp: number; leveledUp: boolean } {
  let level = currentLevel;
  let xp = currentXp;
  let leveledUp = false;
  const needed = irXpForLevel(level + 1);
  if (needed !== Infinity && xp >= needed) {
    level = Math.min(level + 1, IR_MAX_LEVEL);
    xp = xp - irXpForLevel(level);
    leveledUp = true;
  }
  return { level, xp, leveledUp };
}

function irCreateInitialInventory(): IrInventoryItem[] {
  return [
    { materialId: 'ir_tungsten_ore', count: 5 },
    { materialId: 'ir_copper_coil', count: 3 },
    { materialId: 'ir_nickel_wire', count: 4 },
    { materialId: 'ir_bronze_ingot', count: 2 },
  ];
}

function irCreateInitialChambers(): IrChamberState[] {
  return IR_CHAMBERS.map(ch => ({
    chamberId: ch.id,
    discovered: ch.unlockLevel <= 1,
    garrisonCount: 0,
    supplyLevel: 100,
    morale: 80,
    lastDefendedAt: null,
  }));
}

function irCreateInitialStructures(): IrStructureState[] {
  return IR_STRUCTURES.map(s => ({
    structureId: s.id,
    level: 0,
    builtAt: null,
  }));
}

function irCreateInitialState(): IrReachState {
  return {
    irLevel: 1,
    irXp: 0,
    irMaxXp: irXpForLevel(2),
    irCurrentTitle: 'ir_title_recruit',
    irTotalXp: 0,
    irTotalCoins: 100,
    irMechs: [],
    irInventory: irCreateInitialInventory(),
    irStructures: irCreateInitialStructures(),
    irArtifacts: [],
    irAbilities: ['ir_ability_molten_surge', 'ir_ability_iron_wall'],
    irAchievements: [],
    irChambers: irCreateInitialChambers(),
    irEventLog: [],
    irActiveEvent: null,
    irStats: {
      totalAssembled: 0,
      totalDeployed: 0,
      totalBuilt: 0,
      totalArtifactsActivated: 0,
      totalEventsTriggered: 0,
      totalEventsResolved: 0,
      totalMaterialsGathered: 0,
      totalCoinsEarned: 0,
      totalXpEarned: 0,
      totalMechsLost: 0,
      totalChambersDefended: 0,
    },
  };
}

function irLoadState(): IrReachState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(IR_SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IrReachState;
  } catch {
    return null;
  }
}

function irSaveState(state: IrReachState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(IR_SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

// ─── Main Hook ─────────────────────────────────────────────────────────────────

export default function useIronReach() {
  const stateRef = useRef<IrReachState | null>(null);

  const [state, setState] = useState<IrReachState>(() => {
    const loaded = irLoadState();
    return loaded ?? irCreateInitialState();
  });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ─── Persistence ─────────────────────────────────────────────────────────────

  useEffect(() => {
    irSaveState(state);
  }, [state]);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const assembleMech = useCallback((creatureId: string) => {
    setState(prev => {
      const def = IR_CREATURES.find(c => c.id === creatureId);
      if (!def) return prev;
      if (prev.irTotalCoins < def.assembleCost) return prev;

      const activeMechs = prev.irMechs.filter(m => m.isActive).length;
      const maxMechs = 5 + Math.floor(prev.irLevel / 5);
      if (activeMechs >= maxMechs) return prev;

      const mechState: IrMechState = {
        mechId: irGenerateInstanceId('mech'),
        nickname: def.name,
        level: 1,
        xp: 0,
        hp: def.hp,
        maxHp: def.hp,
        assembledAt: Date.now(),
        chamberId: null,
        isActive: false,
      };

      const rarityMult = irGetRarityMultiplier(def.rarity);
      const xpGained = Math.floor(25 * rarityMult);
      const newTotalXp = prev.irTotalXp + xpGained;
      const levelResult = irGetLevelUpResult(prev.irLevel, prev.irXp + xpGained);

      return {
        ...prev,
        irMechs: [...prev.irMechs, mechState],
        irTotalCoins: prev.irTotalCoins - def.assembleCost,
        irXp: levelResult.xp,
        irLevel: levelResult.level,
        irMaxXp: irXpForLevel(levelResult.level + 1),
        irTotalXp: newTotalXp,
        irStats: {
          ...prev.irStats,
          totalAssembled: prev.irStats.totalAssembled + 1,
          totalXpEarned: prev.irStats.totalXpEarned + xpGained,
        },
      };
    });
  }, []);

  const deployZone = useCallback((mechId: string, chamberId: string) => {
    setState(prev => {
      const mech = prev.irMechs.find(m => m.mechId === mechId);
      if (!mech) return prev;
      if (!mech.isActive) return prev;

      const chamber = prev.irChambers.find(c => c.chamberId === chamberId);
      if (!chamber || !chamber.discovered) return prev;

      const chamberDef = IR_CHAMBERS.find(c => c.id === chamberId);
      const maxGarrison = chamberDef?.capacity ?? 0;
      const currentGarrison = prev.irMechs.filter(m => m.chamberId === chamberId).length;
      if (currentGarrison >= maxGarrison) return prev;

      const xpGained = 10;
      const levelResult = irGetLevelUpResult(prev.irLevel, prev.irXp + xpGained);

      return {
        ...prev,
        irMechs: prev.irMechs.map(m =>
          m.mechId === mechId ? { ...m, chamberId } : m
        ),
        irXp: levelResult.xp,
        irLevel: levelResult.level,
        irMaxXp: irXpForLevel(levelResult.level + 1),
        irTotalXp: prev.irTotalXp + xpGained,
        irStats: {
          ...prev.irStats,
          totalDeployed: prev.irStats.totalDeployed + 1,
          totalXpEarned: prev.irStats.totalXpEarned + xpGained,
        },
      };
    });
  }, []);

  const buildStructure = useCallback((structureId: string) => {
    setState(prev => {
      const structDef = IR_STRUCTURES.find(s => s.id === structureId);
      if (!structDef) return prev;

      const existing = prev.irStructures.find(s => s.structureId === structureId);
      if (existing && existing.level > 0) return prev;

      const currentCost = structDef.baseCost;
      if (prev.irTotalCoins < currentCost) return prev;

      const newStructures = prev.irStructures.map(s => {
        if (s.structureId !== structureId) return s;
        return { ...s, level: 1, builtAt: Date.now() };
      });

      const xpGained = Math.floor(30 * (structDef.effectPerLevel / 5));
      const levelResult = irGetLevelUpResult(prev.irLevel, prev.irXp + xpGained);

      return {
        ...prev,
        irStructures: newStructures,
        irTotalCoins: prev.irTotalCoins - currentCost,
        irXp: levelResult.xp,
        irLevel: levelResult.level,
        irMaxXp: irXpForLevel(levelResult.level + 1),
        irTotalXp: prev.irTotalXp + xpGained,
        irStats: {
          ...prev.irStats,
          totalBuilt: prev.irStats.totalBuilt + 1,
          totalXpEarned: prev.irStats.totalXpEarned + xpGained,
        },
      };
    });
  }, []);

  const upgradeStructure = useCallback((structureId: string) => {
    setState(prev => {
      const structDef = IR_STRUCTURES.find(s => s.id === structureId);
      if (!structDef) return prev;

      const existing = prev.irStructures.find(s => s.structureId === structureId);
      if (!existing || existing.level === 0) return prev;
      if (existing.level >= structDef.maxLevel) return prev;

      const upgradeCost = Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, existing.level + 1));
      if (prev.irTotalCoins < upgradeCost) return prev;

      const newStructures = prev.irStructures.map(s => {
        if (s.structureId !== structureId) return s;
        return { ...s, level: s.level + 1 };
      });

      const xpGained = Math.floor(20 * (structDef.effectPerLevel / 5));
      return {
        ...prev,
        irStructures: newStructures,
        irTotalCoins: prev.irTotalCoins - upgradeCost,
        irXp: prev.irXp + xpGained,
        irTotalXp: prev.irTotalXp + xpGained,
        irStats: {
          ...prev.irStats,
          totalXpEarned: prev.irStats.totalXpEarned + xpGained,
        },
      };
    });
  }, []);

  const activateArtifact = useCallback((artifactId: string) => {
    setState(prev => {
      const artifactDef = IR_ARTIFACTS.find(a => a.id === artifactId);
      if (!artifactDef) return prev;
      if (prev.irArtifacts.includes(artifactId)) return prev;

      const xpGained = Math.floor(100 * irGetRarityMultiplier(artifactDef.rarity));
      const coinReward = Math.floor(200 * irGetRarityMultiplier(artifactDef.rarity));
      const levelResult = irGetLevelUpResult(prev.irLevel, prev.irXp + xpGained);

      return {
        ...prev,
        irArtifacts: [...prev.irArtifacts, artifactId],
        irTotalCoins: prev.irTotalCoins + coinReward,
        irXp: levelResult.xp,
        irLevel: levelResult.level,
        irMaxXp: irXpForLevel(levelResult.level + 1),
        irTotalXp: prev.irTotalXp + xpGained,
        irStats: {
          ...prev.irStats,
          totalArtifactsActivated: prev.irStats.totalArtifactsActivated + 1,
          totalCoinsEarned: prev.irStats.totalCoinsEarned + coinReward,
          totalXpEarned: prev.irStats.totalXpEarned + xpGained,
        },
      };
    });
  }, []);

  const triggerReachEvent = useCallback((eventId: string) => {
    setState(prev => {
      const eventDef = IR_EVENTS.find(e => e.id === eventId);
      if (!eventDef) return prev;
      if (prev.irActiveEvent !== null) return prev;

      const logEntry: IrEventLogEntry = {
        eventId,
        triggeredAt: Date.now(),
        resolved: false,
      };

      return {
        ...prev,
        irActiveEvent: eventId,
        irEventLog: [logEntry, ...prev.irEventLog],
        irStats: {
          ...prev.irStats,
          totalEventsTriggered: prev.irStats.totalEventsTriggered + 1,
        },
      };
    });
  }, []);

  const resolveActiveEvent = useCallback(() => {
    setState(prev => {
      if (prev.irActiveEvent === null) return prev;

      const eventDef = IR_EVENTS.find(e => e.id === prev.irActiveEvent);
      if (!eventDef) return prev;

      const xpGained = eventDef.rewardXp;
      const coinReward = eventDef.rewardCoins;
      const levelResult = irGetLevelUpResult(prev.irLevel, prev.irXp + xpGained);

      return {
        ...prev,
        irActiveEvent: null,
        irEventLog: prev.irEventLog.map(e =>
          e.eventId === prev.irActiveEvent ? { ...e, resolved: true } : e
        ),
        irTotalCoins: prev.irTotalCoins + coinReward,
        irXp: levelResult.xp,
        irLevel: levelResult.level,
        irMaxXp: irXpForLevel(levelResult.level + 1),
        irTotalXp: prev.irTotalXp + xpGained,
        irStats: {
          ...prev.irStats,
          totalEventsResolved: prev.irStats.totalEventsResolved + 1,
          totalCoinsEarned: prev.irStats.totalCoinsEarned + coinReward,
          totalXpEarned: prev.irStats.totalXpEarned + xpGained,
        },
      };
    });
  }, []);

  const resetIronReach = useCallback(() => {
    const freshState = irCreateInitialState();
    setState(freshState);
    irSaveState(freshState);
  }, []);

  // ─── Extended Actions ────────────────────────────────────────────────────────

  const discoverZone = useCallback((chamberId: string) => {
    setState(prev => {
      const chamber = prev.irChambers.find(c => c.chamberId === chamberId);
      if (!chamber || chamber.discovered) return prev;

      const chamberDef = IR_CHAMBERS.find(c => c.id === chamberId);
      if (!chamberDef) return prev;
      if (prev.irLevel < chamberDef.unlockLevel) return prev;

      const xpGained = 50;
      const levelResult = irGetLevelUpResult(prev.irLevel, prev.irXp + xpGained);

      return {
        ...prev,
        irChambers: prev.irChambers.map(c =>
          c.chamberId === chamberId ? { ...c, discovered: true } : c
        ),
        irXp: levelResult.xp,
        irLevel: levelResult.level,
        irMaxXp: irXpForLevel(levelResult.level + 1),
        irTotalXp: prev.irTotalXp + xpGained,
        irStats: {
          ...prev.irStats,
          totalXpEarned: prev.irStats.totalXpEarned + xpGained,
        },
      };
    });
  }, []);

  const checkAndClaimAchievements = useCallback(() => {
    setState(prev => {
      const newlyClaimed: string[] = [];

      for (const ach of IR_ACHIEVEMENTS) {
        if (prev.irAchievements.includes(ach.id)) continue;
        if (newlyClaimed.includes(ach.id)) continue;

        let canClaim = false;
        if (ach.id === 'ir_ach_first_assembly' && prev.irStats.totalAssembled >= 1) canClaim = true;
        if (ach.id === 'ir_ach_bridge_defender' && prev.irStats.totalDeployed >= 5) canClaim = true;
        if (ach.id === 'ir_ach_fortress_builder') {
          const builtCount = prev.irStructures.filter(s => s.level > 0).length;
          if (builtCount >= 8) canClaim = true;
        }
        if (ach.id === 'ir_ach_material_hoarder' && prev.irStats.totalMaterialsGathered >= 500) canClaim = true;
        if (ach.id === 'ir_ach_artifact_collector' && prev.irArtifacts.length >= 3) canClaim = true;
        if (ach.id === 'ir_ach_mech_army' && prev.irMechs.length >= 10) canClaim = true;
        if (ach.id === 'ir_ach_event_resolver' && prev.irStats.totalEventsResolved >= 10) canClaim = true;
        if (ach.id === 'ir_ach_canyon_master') {
          const discoveredCount = prev.irChambers.filter(c => c.discovered).length;
          if (discoveredCount >= 8) canClaim = true;
        }
        if (ach.id === 'ir_ach_forge_legend' && prev.irLevel >= 40) canClaim = true;
        if (ach.id === 'ir_ach_eternal_guardian') {
          if (prev.irMechs.some(m => m.level >= 10)) canClaim = true;
        }

        if (canClaim) newlyClaimed.push(ach.id);
      }

      if (newlyClaimed.length === 0) return prev;

      const totalRewardXp = newlyClaimed.reduce((sum, id) => {
        const ach = IR_ACHIEVEMENTS.find(a => a.id === id);
        return sum + (ach?.rewardXp ?? 0);
      }, 0);

      const totalRewardCoins = newlyClaimed.length * 100;
      const levelResult = irGetLevelUpResult(prev.irLevel, prev.irXp + totalRewardXp);

      return {
        ...prev,
        irAchievements: [...prev.irAchievements, ...newlyClaimed],
        irTotalCoins: prev.irTotalCoins + totalRewardCoins,
        irXp: levelResult.xp,
        irLevel: levelResult.level,
        irMaxXp: irXpForLevel(levelResult.level + 1),
        irTotalXp: prev.irTotalXp + totalRewardXp,
        irStats: {
          ...prev.irStats,
          totalCoinsEarned: prev.irStats.totalCoinsEarned + totalRewardCoins,
          totalXpEarned: prev.irStats.totalXpEarned + totalRewardXp,
        },
      };
    });
  }, []);

  const useAbility = useCallback((abilityId: string, mechId: string) => {
    setState(prev => {
      const abilityDef = IR_ABILITIES.find(a => a.id === abilityId);
      if (!abilityDef) return prev;
      if (!prev.irAbilities.includes(abilityId)) return prev;

      const mech = prev.irMechs.find(m => m.mechId === mechId);
      if (!mech || !mech.isActive) return prev;

      const xpGained = Math.floor(abilityDef.power * irGetRarityMultiplier(abilityDef.rarity));
      const coinReward = Math.floor(10 * irGetRarityMultiplier(abilityDef.rarity));
      const levelResult = irGetLevelUpResult(prev.irLevel, prev.irXp + xpGained);

      return {
        ...prev,
        irTotalCoins: prev.irTotalCoins + coinReward,
        irXp: levelResult.xp,
        irLevel: levelResult.level,
        irMaxXp: irXpForLevel(levelResult.level + 1),
        irTotalXp: prev.irTotalXp + xpGained,
        irStats: {
          ...prev.irStats,
          totalCoinsEarned: prev.irStats.totalCoinsEarned + coinReward,
          totalXpEarned: prev.irStats.totalXpEarned + xpGained,
        },
      };
    });
  }, []);

  const gatherMaterial = useCallback((materialId: string) => {
    setState(prev => {
      const matDef = IR_MATERIALS.find(m => m.id === materialId);
      if (!matDef) return prev;

      const amount = matDef.rarity === IR_RARITY_COMMON ? 3
        : matDef.rarity === IR_RARITY_UNCOMMON ? 2 : 1;

      const newInventory = [...prev.irInventory];
      const existing = newInventory.find(i => i.materialId === materialId);
      if (existing) {
        existing.count += amount;
      } else {
        newInventory.push({ materialId, count: amount });
      }

      const xpGained = Math.floor(5 * irGetRarityMultiplier(matDef.rarity));
      return {
        ...prev,
        irInventory: newInventory,
        irXp: prev.irXp + xpGained,
        irTotalXp: prev.irTotalXp + xpGained,
        irStats: {
          ...prev.irStats,
          totalMaterialsGathered: prev.irStats.totalMaterialsGathered + amount,
          totalXpEarned: prev.irStats.totalXpEarned + xpGained,
        },
      };
    });
  }, []);

  const activateMech = useCallback((mechId: string) => {
    setState(prev => {
      const mech = prev.irMechs.find(m => m.mechId === mechId);
      if (!mech) return prev;
      if (mech.isActive) return prev;

      const activeCount = prev.irMechs.filter(m => m.isActive).length;
      const maxActive = 5 + Math.floor(prev.irLevel / 5);
      if (activeCount >= maxActive) return prev;

      return {
        ...prev,
        irMechs: prev.irMechs.map(m =>
          m.mechId === mechId ? { ...m, isActive: true } : m
        ),
      };
    });
  }, []);

  const deactivateMech = useCallback((mechId: string) => {
    setState(prev => {
      const mech = prev.irMechs.find(m => m.mechId === mechId);
      if (!mech) return prev;
      if (!mech.isActive) return prev;

      return {
        ...prev,
        irMechs: prev.irMechs.map(m =>
          m.mechId === mechId ? { ...m, isActive: false, chamberId: null } : m
        ),
      };
    });
  }, []);

  const levelUpMech = useCallback((mechId: string) => {
    setState(prev => {
      const mech = prev.irMechs.find(m => m.mechId === mechId);
      if (!mech) return prev;
      if (mech.level >= 10) return prev;

      const cost = Math.floor(50 * mech.level * irGetRarityMultiplier(
        IR_CREATURES.find(c => {
          const mechState = prev.irMechs.find(ms => ms.mechId === mechId);
          return IR_CREATURES.some(cr => cr.name === mechState?.nickname);
        })?.rarity ?? 'common'
      ));

      if (prev.irTotalCoins < cost) return prev;

      const mechXpNeeded = Math.floor(50 * Math.pow(mech.level, 1.3));
      if (mech.xp < mechXpNeeded) return prev;

      return {
        ...prev,
        irMechs: prev.irMechs.map(m => {
          if (m.mechId !== mechId) return m;
          const newLevel = m.level + 1;
          return {
            ...m,
            level: newLevel,
            xp: m.xp - mechXpNeeded,
            hp: Math.floor(m.maxHp * (1 + newLevel * 0.1)),
            maxHp: Math.floor(m.maxHp * (1 + newLevel * 0.1)),
          };
        }),
        irTotalCoins: prev.irTotalCoins - cost,
      };
    });
  }, []);

  const unlockAbility = useCallback((abilityId: string) => {
    setState(prev => {
      const abilityDef = IR_ABILITIES.find(a => a.id === abilityId);
      if (!abilityDef) return prev;
      if (prev.irAbilities.includes(abilityId)) return prev;

      const cost = Math.floor(100 * irGetRarityMultiplier(abilityDef.rarity));
      if (prev.irTotalCoins < cost) return prev;

      return {
        ...prev,
        irAbilities: [...prev.irAbilities, abilityId],
        irTotalCoins: prev.irTotalCoins - cost,
      };
    });
  }, []);

  const claimTitle = useCallback((titleId: string) => {
    setState(prev => {
      const titleDef = IR_TITLES.find(t => t.id === titleId);
      if (!titleDef) return prev;

      const activeMechs = prev.irMechs.filter(m => m.isActive).length;
      const discoveredChambers = prev.irChambers.filter(c => c.discovered).length;

      if (activeMechs < titleDef.minMechs) return prev;
      if (discoveredChambers < titleDef.minChambers) return prev;

      return {
        ...prev,
        irCurrentTitle: titleId,
      };
    });
  }, []);

  const earnCoins = useCallback((amount: number) => {
    setState(prev => {
      if (amount <= 0) return prev;
      return {
        ...prev,
        irTotalCoins: prev.irTotalCoins + amount,
        irStats: {
          ...prev.irStats,
          totalCoinsEarned: prev.irStats.totalCoinsEarned + amount,
        },
      };
    });
  }, []);

  // ─── Natural resource regeneration ───────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const discoveredChambers = prev.irChambers.filter(c => c.discovered).length;
        const coinRegen = 1 + Math.floor(prev.irLevel * 0.5) + Math.floor(discoveredChambers * 0.3);
        const newCoins = prev.irTotalCoins + coinRegen;

        return {
          ...prev,
          irTotalCoins: newCoins,
        };
      });
    }, 8000);
    return () => { clearInterval(interval); };
  }, []);

  // ─── Getters (useMemo) ───────────────────────────────────────────────────────

  const irGetEnrichedMechs = useMemo(() => {
    return state.irMechs.map(m => {
      const def = IR_CREATURES.find(c => c.name === m.nickname);
      return {
        ...m,
        species: def?.species ?? 'ironclad_beetle',
        rarity: def?.rarity ?? 'common',
        forgePower: def?.forgePower ?? 0,
        attack: def?.attack ?? 0,
        defense: def?.defense ?? 0,
        speed: def?.speed ?? 0,
        description: def?.description ?? '',
        lore: def?.lore ?? '',
        icon: def?.icon ?? '🤖',
        color: def?.color ?? '#71797E',
      };
    });
  }, [state.irMechs]);

  const irGetActiveMechs = useMemo(() => {
    return irGetEnrichedMechs.filter(m => m.isActive);
  }, [irGetEnrichedMechs]);

  const irGetInactiveMechs = useMemo(() => {
    return irGetEnrichedMechs.filter(m => !m.isActive);
  }, [irGetEnrichedMechs]);

  const irGetMechsByChamber = useMemo(() => {
    const result: Record<string, typeof irGetEnrichedMechs> = {};
    for (const mech of irGetEnrichedMechs) {
      if (mech.chamberId) {
        if (!result[mech.chamberId]) result[mech.chamberId] = [];
        result[mech.chamberId].push(mech);
      }
    }
    return result;
  }, [irGetEnrichedMechs]);

  const irGetEnrichedChambers = useMemo(() => {
    return state.irChambers.map(ch => {
      const def = IR_CHAMBERS.find(c => c.id === ch.chamberId);
      const deployedMechs = state.irMechs.filter(m => m.chamberId === ch.chamberId);
      return {
        ...ch,
        name: def?.name ?? 'Unknown',
        description: def?.description ?? '',
        icon: def?.icon ?? '🏚️',
        regionColor: def?.regionColor ?? '#71797E',
        defenseRating: def?.defenseRating ?? 0,
        capacity: def?.capacity ?? 0,
        maxLevel: def?.maxLevel ?? 10,
        unlockLevel: def?.unlockLevel ?? 1,
        deployedCount: deployedMechs.length,
        availableSlots: (def?.capacity ?? 0) - deployedMechs.length,
      };
    });
  }, [state.irChambers, state.irMechs]);

  const irGetDiscoveredChambers = useMemo(() => {
    return irGetEnrichedChambers.filter(ch => ch.discovered);
  }, [irGetEnrichedChambers]);

  const irGetUndiscoveredChambers = useMemo(() => {
    return irGetEnrichedChambers.filter(ch => !ch.discovered);
  }, [irGetEnrichedChambers]);

  const irGetMaterialInventory = useMemo(() => {
    return state.irInventory.map(inv => {
      const def = IR_MATERIALS.find(m => m.id === inv.materialId);
      return {
        ...inv,
        name: def?.name ?? 'Unknown',
        rarity: def?.rarity ?? 'common',
        category: def?.category ?? 'ore',
        description: def?.description ?? '',
        icon: def?.icon ?? '📦',
        color: def?.color ?? '#71797E',
      };
    });
  }, [state.irInventory]);

  const irGetStructureList = useMemo(() => {
    return state.irStructures.map(s => {
      const def = IR_STRUCTURES.find(d => d.id === s.structureId);
      return {
        ...s,
        name: def?.name ?? 'Unknown',
        description: def?.description ?? '',
        bonusType: def?.bonusType ?? 'forge_boost',
        maxLevel: def?.maxLevel ?? 10,
        baseCost: def?.baseCost ?? 0,
        costMultiplier: def?.costMultiplier ?? 1.5,
        effectPerLevel: def?.effectPerLevel ?? 0,
        chamberId: def?.chamberId ?? '',
        icon: def?.icon ?? '🏗️',
        upgradeCost: def && s.level > 0
          ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level + 1))
          : 0,
        currentBonus: def ? def.effectPerLevel * s.level : 0,
      };
    });
  }, [state.irStructures]);

  const irGetArtifactList = useMemo(() => {
    return IR_ARTIFACTS.map(art => ({
      ...art,
      activated: state.irArtifacts.includes(art.id),
    }));
  }, [state.irArtifacts]);

  const irGetAbilityList = useMemo(() => {
    return IR_ABILITIES.map(ability => ({
      ...ability,
      unlocked: state.irAbilities.includes(ability.id),
    }));
  }, [state.irAbilities]);

  const irGetAchievementList = useMemo(() => {
    return IR_ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: state.irAchievements.includes(ach.id),
    }));
  }, [state.irAchievements]);

  const irGetCurrentTitle = useMemo(() => {
    return IR_TITLES.find(t => t.id === state.irCurrentTitle) ?? IR_TITLES[0];
  }, [state.irCurrentTitle]);

  const irGetNextTitle = useMemo(() => {
    const currentIdx = IR_TITLES.findIndex(t => t.id === state.irCurrentTitle);
    if (currentIdx < 0 || currentIdx >= IR_TITLES.length - 1) return null;
    return IR_TITLES[currentIdx + 1];
  }, [state.irCurrentTitle]);

  const irGetTitleProgress = useMemo(() => {
    const currentTitle = IR_TITLES.find(t => t.id === state.irCurrentTitle) ?? IR_TITLES[0];
    const nextTitle = irGetNextTitle;
    const activeMechs = state.irMechs.filter(m => m.isActive).length;
    const discoveredChambers = state.irChambers.filter(c => c.discovered).length;

    return {
      currentTitle,
      nextTitle,
      activeMechs,
      discoveredChambers,
      nextMechsNeeded: nextTitle ? nextTitle.minMechs - activeMechs : 0,
      nextChambersNeeded: nextTitle ? nextTitle.minChambers - discoveredChambers : 0,
      canClaim: nextTitle
        ? activeMechs >= nextTitle.minMechs && discoveredChambers >= nextTitle.minChambers
        : false,
    };
  }, [state.irCurrentTitle, state.irMechs, state.irChambers, irGetNextTitle]);

  const irGetActiveEvent = useMemo(() => {
    if (state.irActiveEvent === null) return null;
    return IR_EVENTS.find(e => e.id === state.irActiveEvent) ?? null;
  }, [state.irActiveEvent]);

  const irGetEventLog = useMemo(() => {
    return state.irEventLog.map(log => {
      const def = IR_EVENTS.find(e => e.id === log.eventId);
      return {
        ...log,
        name: def?.name ?? 'Unknown',
        severity: def?.severity ?? 'mild',
        icon: def?.icon ?? '❓',
        color: def?.color ?? '#71797E',
      };
    });
  }, [state.irEventLog]);

  const irGetRaritySummary = useMemo(() => {
    const summary: Record<IrRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    };
    for (const mech of state.irMechs) {
      const def = IR_CREATURES.find(c => c.name === mech.nickname);
      if (def) {
        summary[def.rarity] += 1;
      }
    }
    return summary;
  }, [state.irMechs]);

  const irGetSpeciesSummary = useMemo(() => {
    const summary: Record<IrSpecies, number> = {
      ironclad_beetle: 0,
      steel_wyrm: 0,
      copper_sentinel: 0,
      bronze_titan: 0,
      tungsten_golem: 0,
      chrome_hawk: 0,
      nickel_spider: 0,
    };
    for (const mech of state.irMechs) {
      const def = IR_CREATURES.find(c => c.name === mech.nickname);
      if (def) {
        summary[def.species] += 1;
      }
    }
    return summary;
  }, [state.irMechs]);

  const irGetTotalForgePower = useMemo(() => {
    return state.irMechs
      .filter(m => m.isActive)
      .reduce((total, m) => {
        const def = IR_CREATURES.find(c => c.name === m.nickname);
        return total + (def?.forgePower ?? 0) * m.level;
      }, 0);
  }, [state.irMechs]);

  const irGetTotalDefenseRating = useMemo(() => {
    const mechDefense = state.irMechs
      .filter(m => m.isActive)
      .reduce((total, m) => {
        const def = IR_CREATURES.find(c => c.name === m.nickname);
        return total + (def?.defense ?? 0) * m.level;
      }, 0);

    const structureDefense = state.irStructures
      .filter(s => s.level > 0)
      .reduce((total, s) => {
        const def = IR_STRUCTURES.find(d => d.id === s.structureId);
        return total + (def?.effectPerLevel ?? 0) * s.level;
      }, 0);

    const artifactDefense = state.irArtifacts.reduce((total, artId) => {
      const def = IR_ARTIFACTS.find(a => a.id === artId);
      return total + (def?.defenseBonus ?? 0);
    }, 0);

    return mechDefense + structureDefense + artifactDefense;
  }, [state.irMechs, state.irStructures, state.irArtifacts]);

  const irGetFortressEfficiency = useMemo(() => {
    const builtStructures = state.irStructures.filter(s => s.level > 0);
    const activeMechs = state.irMechs.filter(m => m.isActive);
    const discoveredChambers = state.irChambers.filter(c => c.discovered);

    const structureBonus = builtStructures.reduce((sum, s) => {
      const def = IR_STRUCTURES.find(d => d.id === s.structureId);
      return sum + (def?.effectPerLevel ?? 0) * s.level;
    }, 0);

    const base = 20;
    const mechBonus = Math.min(activeMechs.length * 3, 30);
    const chamberBonus = Math.min(discoveredChambers.length * 2, 20);

    return Math.min(Math.floor(base + structureBonus + mechBonus + chamberBonus), 100);
  }, [state.irStructures, state.irMechs, state.irChambers]);

  const irGetCraftableMechs = useMemo(() => {
    return IR_CREATURES.filter(creature => {
      if (state.irTotalCoins < creature.assembleCost) return false;
      const activeCount = state.irMechs.filter(m => m.isActive).length;
      const maxMechs = 5 + Math.floor(state.irLevel / 5);
      if (activeCount >= maxMechs) return false;
      return true;
    });
  }, [state.irTotalCoins, state.irMechs, state.irLevel]);

  const irGetUpgradableStructures = useMemo(() => {
    return state.irStructures
      .filter(s => {
        const def = IR_STRUCTURES.find(d => d.id === s.structureId);
        if (!def || s.level === 0) return false;
        if (s.level >= def.maxLevel) return false;
        const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level + 1));
        return state.irTotalCoins >= cost;
      })
      .map(s => {
        const def = IR_STRUCTURES.find(d => d.id === s.structureId);
        return {
          ...s,
          name: def?.name ?? 'Unknown',
          icon: def?.icon ?? '🏗️',
          effectPerLevel: def?.effectPerLevel ?? 0,
          maxLevel: def?.maxLevel ?? 10,
          upgradeCost: def
            ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level + 1))
            : 0,
        };
      });
  }, [state.irStructures, state.irTotalCoins]);

  // ─── Computed values ─────────────────────────────────────────────────────────

  const irXpToNextLevel = useMemo(() => {
    return irXpForLevel(state.irLevel + 1);
  }, [state.irLevel]);

  const irLevelProgress = useMemo(() => {
    const needed = irXpForLevel(state.irLevel + 1);
    if (needed === Infinity) return 100;
    return Math.floor((state.irXp / needed) * 100);
  }, [state.irXp, state.irLevel]);

  const irMaxActiveMechs = useMemo(() => {
    return 5 + Math.floor(state.irLevel / 5);
  }, [state.irLevel]);

  const irTotalMaterials = useMemo(() => {
    return state.irInventory.reduce((sum, item) => sum + item.count, 0);
  }, [state.irInventory]);

  const irCompletionPercentage = useMemo(() => {
    const totalMechTypes = IR_CREATURES.length;
    const totalStructureTypes = IR_STRUCTURES.length;
    const totalArtifactTypes = IR_ARTIFACTS.length;
    const totalAbilityTypes = IR_ABILITIES.length;
    const totalChamberTypes = IR_CHAMBERS.length;
    const totalAchievementTypes = IR_ACHIEVEMENTS.length;

    const mechProgress = Math.min(state.irMechs.length / Math.floor(totalMechTypes * 0.5), 1);
    const structureProgress = state.irStructures.filter(s => s.level > 0).length / totalStructureTypes;
    const artifactProgress = state.irArtifacts.length / totalArtifactTypes;
    const abilityProgress = state.irAbilities.length / totalAbilityTypes;
    const chamberProgress = state.irChambers.filter(c => c.discovered).length / totalChamberTypes;
    const achievementProgress = state.irAchievements.length / totalAchievementTypes;
    const levelProgress = state.irLevel / IR_MAX_LEVEL;

    const overall = (
      mechProgress * 15 +
      structureProgress * 20 +
      artifactProgress * 15 +
      abilityProgress * 10 +
      chamberProgress * 15 +
      achievementProgress * 10 +
      levelProgress * 15
    );
    return Math.floor(overall);
  }, [state]);

  // ─── Returned API ────────────────────────────────────────────────────────────

  const irAPI = {
    // State
    ...state,

    // Actions
    assembleMech,
    deployZone,
    buildStructure,
    upgradeStructure,
    activateArtifact,
    triggerReachEvent,
    resolveActiveEvent,
    resetIronReach,
    discoverZone,
    checkAndClaimAchievements,
    useAbility,
    gatherMaterial,
    activateMech,
    deactivateMech,
    levelUpMech,
    unlockAbility,
    claimTitle,
    earnCoins,

    // Enriched Getters
    irGetEnrichedMechs,
    irGetActiveMechs,
    irGetInactiveMechs,
    irGetMechsByChamber,
    irGetEnrichedChambers,
    irGetDiscoveredChambers,
    irGetUndiscoveredChambers,
    irGetMaterialInventory,
    irGetStructureList,
    irGetArtifactList,
    irGetAbilityList,
    irGetAchievementList,
    irGetCurrentTitle,
    irGetNextTitle,
    irGetTitleProgress,
    irGetActiveEvent,
    irGetEventLog,
    irGetRaritySummary,
    irGetSpeciesSummary,
    irGetTotalForgePower,
    irGetTotalDefenseRating,
    irGetFortressEfficiency,
    irGetCraftableMechs,
    irGetUpgradableStructures,

    // Computed
    irXpToNextLevel,
    irLevelProgress,
    irMaxActiveMechs,
    irTotalMaterials,
    irCompletionPercentage,

    // Constants
    IR_SAVE_KEY,
    IR_MAX_LEVEL,
    IR_XP_BASE,
    IR_XP_SCALE,
    IR_SPECIES,
    IR_CREATURES,
    IR_CHAMBERS,
    IR_MATERIALS,
    IR_STRUCTURES,
    IR_ABILITIES,
    IR_ACHIEVEMENTS,
    IR_TITLES,
    IR_ARTIFACTS,
    IR_EVENTS,
    IR_IRON_GRAY,
    IR_STEEL_BLUE,
    IR_COPPER,
    IR_MOLTEN_ORANGE,
    IR_CHROME_SILVER,
    IR_BRONZE,
    IR_DARK_FORGE,
    IR_RARITY_COLORS,
    IR_SPECIES_COLORS,
    IR_RARITY_LABELS,
    IR_RARITY_XP_MULTIPLIER,
    IR_SPECIES_ICONS,

    // Helper
    irGetRarityLabel,
    irGetRarityColor,
    irGetRarityMultiplier,
  };

  return irAPI;
}
