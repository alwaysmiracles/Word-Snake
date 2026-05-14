// =============================================================================
// Robot Colony Wire — SSR-safe futuristic robot colony building & management
// All exports use `rc` prefix for functions, `RC_` for constants.
// Uses seeded PRNG only. No localStorage/window/document/setInterval/addEventListener/Math.random.
// =============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Seeded PRNG — Mulberry32
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rcDateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function rcTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function rcSeededPick<T>(arr: T[], seed: number, index: number): T {
  const rng = mulberry32(seed + index * 9973);
  return arr[Math.floor(rng() * arr.length)];
}

function rcSeededInt(seed: number, min: number, max: number): number {
  const rng = mulberry32(seed);
  return Math.floor(rng() * (max - min + 1)) + min;
}

function rcClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function rcGuid(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const seed = Date.now() ^ (Math.imul(0xDEAD_BEEF, (Date.now() >>> 16)));
  const rng = mulberry32(seed);
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(rng() * chars.length)];
  }
  return id;
}

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type RCRobotRole =
  | 'miner' | 'builder' | 'scientist' | 'guard' | 'medic' | 'scout'
  | 'engineer' | 'harvester' | 'logistician' | 'diplomat' | 'spy'
  | 'artillery' | 'hacker' | 'pilot' | 'commander' | 'janitor'
  | 'chef' | 'entertainer' | 'archivist' | 'geologist' | 'botanist'
  | 'xenobiologist' | 'quantum_tech' | 'navigator' | 'tactician' | 'sentinel'
  | 'mechanic';

export type RCZoneId =
  | 'core_hub' | 'mining_shaft' | 'research_lab' | 'defense_grid'
  | 'power_plant' | 'med_bay' | 'comm_array' | 'stardock';

export type RCBuildingId =
  | 'titanium_forge' | 'plasma_reactor' | 'nano_farm' | 'quantum_lab'
  | 'shield_generator' | 'robot_factory' | 'trade_post' | 'observatory';

export type RCResourceId =
  | 'titanium' | 'plasma_core' | 'nanofiber' | 'quantum_chip' | 'dark_matter'
  | 'hydraulic_fluid' | 'crystal_shard' | 'bio_gel' | 'fusion_cell'
  | 'superconductor' | 'carbon_mesh' | 'rare_earth' | 'helium_3'
  | 'synthetic_diamond' | 'positron_circuit';

export type RCDirectorSpecialty =
  | 'production' | 'research' | 'defense' | 'exploration' | 'diplomacy'
  | 'economy' | 'logistics' | 'espionage';

export type RCMissionDifficulty = 'easy' | 'medium' | 'hard' | 'elite' | 'legendary';
export type RCMissionStatus = 'available' | 'accepted' | 'in_progress' | 'completed' | 'failed';

export type RCAchievementCategory = 'colony' | 'robots' | 'resources' | 'missions' | 'directors' | 'combat' | 'social' | 'special' | 'economy';

export interface RCRobotDef {
  id: RCRobotRole;
  name: string;
  description: string;
  icon: string;
  cost: number;
  buildTime: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  efficiency: number;
  unlockLevel: number;
  primaryZone: RCZoneId;
  special: string;
}

export interface RCZoneDef {
  id: RCZoneId;
  name: string;
  description: string;
  icon: string;
  unlockCost: number;
  unlockLevel: number;
  maxLevel: number;
  baseProduction: Partial<Record<RCResourceId, number>>;
  upgradeCostBase: number;
  upgradeCostMult: number;
  robotCapacity: number;
  special: string;
}

export interface RCBuildingDef {
  id: RCBuildingId;
  name: string;
  description: string;
  icon: string;
  cost: Partial<Record<RCResourceId, number>>;
  coinCost: number;
  buildLevel: number;
  effect: string;
  productionBonus: Partial<Record<RCResourceId, number>>;
  robotBonus: number;
}

export interface RCResourceDef {
  id: RCResourceId;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  baseValue: number;
  dailyCapacity: number;
}

export interface RCUpgradeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  resourceCost: Partial<Record<RCResourceId, number>>;
  level: number;
  effect: string;
  effectType: 'production_mult' | 'robot_mult' | 'defense_mult' | 'speed_mult' | 'capacity_mult' | 'coin_mult' | 'xp_mult';
  value: number;
  requires: string | null;
}

export interface RCDirectorDef {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  specialty: RCDirectorSpecialty;
  cost: number;
  bonus: number;
  moraleEffect: number;
  unlockLevel: number;
  personality: string;
}

export interface RCNpcDef {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  location: RCZoneId;
  dialogue: string[];
}

export interface RCMissionDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: RCMissionDifficulty;
  requiredLevel: number;
  requiredRobots: number;
  requiredDirector: string | null;
  reward: { coins: number; xp: number; resources: Partial<Record<RCResourceId, number>> };
  duration: number;
  failureChance: number;
  tags: string[];
}

export interface RCAchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: RCAchievementCategory;
  condition: string;
  reward: { coins: number; xp: number };
}

export interface RCRobot {
  id: string;
  role: RCRobotRole;
  name: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  efficiency: number;
  zone: RCZoneId | null;
  active: boolean;
  builtAt: number;
}

export interface RCZone {
  id: RCZoneId;
  name: string;
  description: string;
  icon: string;
  level: number;
  unlocked: boolean;
  robotCount: number;
  maxRobots: number;
  productionRate: Partial<Record<RCResourceId, number>>;
  upgradeCost: number;
}

export interface RCBuilding {
  id: RCBuildingId;
  name: string;
  description: string;
  icon: string;
  level: number;
  built: boolean;
  effect: string;
  productionBonus: Partial<Record<RCResourceId, number>>;
}

export interface RCUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  researched: boolean;
  effect: string;
  effectType: string;
  value: number;
}

export interface RCResource {
  id: RCResourceId;
  name: string;
  icon: string;
  amount: number;
  capacity: number;
  rarity: string;
}

export interface RCDirector {
  id: string;
  name: string;
  title: string;
  icon: string;
  specialty: RCDirectorSpecialty;
  hired: boolean;
  active: boolean;
  bonus: number;
  moraleEffect: number;
  personality: string;
}

export interface RCMission {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: RCMissionDifficulty;
  requiredLevel: number;
  requiredRobots: number;
  requiredDirector: string | null;
  status: RCMissionStatus;
  progress: number;
  reward: { coins: number; xp: number; resources: Partial<Record<RCResourceId, number>> };
  assignedRobots: string[];
  duration: number;
  startTime: number | null;
  failureChance: number;
}

export interface RCAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: RCAchievementCategory;
  condition: string;
  unlocked: boolean;
  unlockedAt: number;
  reward: { coins: number; xp: number };
}

export interface RCDailyTask {
  id: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: { coins: number; xp: number; resources?: Partial<Record<RCResourceId, number>> };
}

export interface RCTitleInfo {
  name: string;
  levelRequired: number;
  perks: string;
}

export interface RCRobotColonyState {
  level: number;
  xp: number;
  totalXp: number;
  coins: number;
  totalCoins: number;
  robots: RCRobot[];
  activeRobotId: string | null;
  zones: RCZone[];
  buildings: RCBuilding[];
  resources: RCResource[];
  upgrades: RCUpgrade[];
  missions: RCMission[];
  directors: RCDirector[];
  achievements: RCAchievement[];
  dailyTask: RCDailyTask;
  streak: number;
  bestStreak: number;
  lastDaily: string;
  totalRobotsBuilt: number;
  totalMissionsCompleted: number;
  totalResourcesGathered: number;
  totalUpgradesResearched: number;
  tick: number;
  initializedAt: number;
}

// ---------------------------------------------------------------------------
// CONSTANT 1 — RC_MAX_LEVEL
// ---------------------------------------------------------------------------

export const RC_MAX_LEVEL = 50;

// ---------------------------------------------------------------------------
// CONSTANT 2 — RC_TITLE_THRESHOLDS
// ---------------------------------------------------------------------------

export const RC_TITLE_THRESHOLDS: RCTitleInfo[] = [
  { name: 'Initiate', levelRequired: 1, perks: 'Basic colony access' },
  { name: 'Foreman', levelRequired: 5, perks: 'Unlock Mining Shaft zone' },
  { name: 'Supervisor', levelRequired: 10, perks: 'Hire first AI Director' },
  { name: 'Overseer', levelRequired: 15, perks: 'Access Research Lab tier 2' },
  { name: 'Commander', levelRequired: 20, perks: 'Unlock Defense Grid' },
  { name: 'Governor', levelRequired: 30, perks: 'Build all structures' },
  { name: 'Architect', levelRequired: 40, perks: 'Legendary upgrades available' },
  { name: 'Supreme Commander', levelRequired: 50, perks: 'Full colony mastery' },
];

// ---------------------------------------------------------------------------
// XP Table — Level 1-50
// ---------------------------------------------------------------------------

const XP_TABLE: number[] = [
  0, 100, 220, 380, 580, 830, 1140, 1520, 1980, 2530,
  3180, 3940, 4830, 5860, 7050, 8420, 9990, 11780, 13920, 16340,
  19070, 22140, 25580, 29430, 33730, 38520, 43840, 49740, 56260, 63450,
  71360, 80040, 89550, 99950, 111280, 123590, 136940, 151400, 167040, 183930,
  202150, 221780, 242900, 265590, 289940, 316030, 343950, 373790, 405640, 439590,
];

function rcXpForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= XP_TABLE.length) return XP_TABLE[XP_TABLE.length - 1] + level * 5000;
  return XP_TABLE[level - 1] || 0;
}

// ---------------------------------------------------------------------------
// CONSTANT 3 — RC_ROBOTS — 28 robot types
// ---------------------------------------------------------------------------

export const RC_ROBOTS: RCRobotDef[] = [
  { id: 'miner', name: 'Miner Bot', description: 'Extracts raw titanium and rare earth from planetary surfaces.', icon: '⛏️', cost: 50, buildTime: 10, hp: 80, attack: 5, defense: 8, speed: 3, efficiency: 1.0, unlockLevel: 1, primaryZone: 'mining_shaft', special: 'Mining yield +10%' },
  { id: 'builder', name: 'Builder Bot', description: 'Constructs and upgrades colony structures with precision welding.', icon: '🏗️', cost: 60, buildTime: 12, hp: 90, attack: 4, defense: 10, speed: 2, efficiency: 1.0, unlockLevel: 1, primaryZone: 'core_hub', special: 'Build speed +15%' },
  { id: 'scientist', name: 'Scientist Bot', description: 'Conducts experiments and researches new technologies.', icon: '🔬', cost: 100, buildTime: 15, hp: 50, attack: 2, defense: 3, speed: 4, efficiency: 1.2, unlockLevel: 3, primaryZone: 'research_lab', special: 'Research speed +20%' },
  { id: 'guard', name: 'Guard Bot', description: 'Patrols the perimeter and neutralizes threats to the colony.', icon: '🛡️', cost: 80, buildTime: 10, hp: 120, attack: 15, defense: 14, speed: 4, efficiency: 0.8, unlockLevel: 2, primaryZone: 'defense_grid', special: 'Colony defense +25%' },
  { id: 'medic', name: 'Medic Bot', description: 'Repairs damaged robots and synthesizes bio-gel for healing.', icon: '⚕️', cost: 90, buildTime: 12, hp: 70, attack: 3, defense: 5, speed: 6, efficiency: 1.0, unlockLevel: 4, primaryZone: 'med_bay', special: 'Repair speed +20%' },
  { id: 'scout', name: 'Scout Bot', description: 'Explores uncharted terrain and marks resource deposits.', icon: '🔭', cost: 70, buildTime: 8, hp: 55, attack: 8, defense: 4, speed: 12, efficiency: 1.1, unlockLevel: 2, primaryZone: 'comm_array', special: 'Scouting range +30%' },
  { id: 'engineer', name: 'Engineer Bot', description: 'Maintains power systems and optimizes energy efficiency.', icon: '🔧', cost: 110, buildTime: 14, hp: 75, attack: 6, defense: 8, speed: 5, efficiency: 1.1, unlockLevel: 5, primaryZone: 'power_plant', special: 'Energy output +15%' },
  { id: 'harvester', name: 'Harvester Bot', description: 'Collects bio-gel and organic nanofiber from alien flora.', icon: '🌾', cost: 65, buildTime: 10, hp: 85, attack: 3, defense: 6, speed: 5, efficiency: 1.0, unlockLevel: 3, primaryZone: 'mining_shaft', special: 'Gathering yield +20%' },
  { id: 'logistician', name: 'Logistician Bot', description: 'Manages supply chains and optimizes resource transport.', icon: '📦', cost: 75, buildTime: 10, hp: 70, attack: 4, defense: 7, speed: 8, efficiency: 1.2, unlockLevel: 6, primaryZone: 'core_hub', special: 'Transport speed +25%' },
  { id: 'diplomat', name: 'Diplomat Bot', description: 'Negotiates with alien factions and manages trade agreements.', icon: '🤝', cost: 150, buildTime: 20, hp: 60, attack: 2, defense: 5, speed: 5, efficiency: 1.0, unlockLevel: 10, primaryZone: 'comm_array', special: 'Trade value +15%' },
  { id: 'spy', name: 'Spy Bot', description: 'Gathers intelligence on rival colonies and enemy movements.', icon: '🕵️', cost: 130, buildTime: 18, hp: 45, attack: 10, defense: 3, speed: 14, efficiency: 0.9, unlockLevel: 8, primaryZone: 'comm_array', special: 'Intel gathering +30%' },
  { id: 'artillery', name: 'Artillery Bot', description: 'Long-range combat unit with devastating plasma bombardment.', icon: '🎯', cost: 120, buildTime: 15, hp: 100, attack: 25, defense: 6, speed: 2, efficiency: 0.7, unlockLevel: 12, primaryZone: 'defense_grid', special: 'Siege damage +40%' },
  { id: 'hacker', name: 'Hacker Bot', description: 'Infiltrates enemy networks and disables defense systems.', icon: '💻', cost: 140, buildTime: 16, hp: 40, attack: 8, defense: 3, speed: 10, efficiency: 1.1, unlockLevel: 14, primaryZone: 'research_lab', special: 'System breach +35%' },
  { id: 'pilot', name: 'Pilot Bot', description: 'Operates spacecraft and manages stardock operations.', icon: '🚀', cost: 160, buildTime: 20, hp: 65, attack: 12, defense: 8, speed: 11, efficiency: 1.0, unlockLevel: 16, primaryZone: 'stardock', special: 'Flight speed +20%' },
  { id: 'commander', name: 'Commander Bot', description: 'Leads squads and boosts nearby robot performance.', icon: '👑', cost: 200, buildTime: 25, hp: 90, attack: 14, defense: 12, speed: 7, efficiency: 1.3, unlockLevel: 20, primaryZone: 'core_hub', special: 'All robots +10% stats' },
  { id: 'janitor', name: 'Janitor Bot', description: 'Cleans colony modules and recycles waste into usable material.', icon: '🧹', cost: 30, buildTime: 6, hp: 60, attack: 1, defense: 4, speed: 5, efficiency: 0.8, unlockLevel: 1, primaryZone: 'core_hub', special: 'Recycle efficiency +15%' },
  { id: 'chef', name: 'Chef Bot', description: 'Synthesizes energy gel and morale-boosting nutrient compounds.', icon: '👨‍🍳', cost: 55, buildTime: 8, hp: 50, attack: 2, defense: 3, speed: 4, efficiency: 1.0, unlockLevel: 2, primaryZone: 'med_bay', special: 'Morale +10%' },
  { id: 'entertainer', name: 'Entertainer Bot', description: 'Boosts colony morale with holographic performances.', icon: '🎭', cost: 85, buildTime: 12, hp: 40, attack: 1, defense: 2, speed: 6, efficiency: 0.9, unlockLevel: 7, primaryZone: 'core_hub', special: 'Colony morale +25%' },
  { id: 'archivist', name: 'Archivist Bot', description: 'Catalogs discoveries and maintains the colony knowledge base.', icon: '📚', cost: 95, buildTime: 14, hp: 55, attack: 3, defense: 5, speed: 4, efficiency: 1.1, unlockLevel: 9, primaryZone: 'research_lab', special: 'XP gain +10%' },
  { id: 'geologist', name: 'Geologist Bot', description: 'Analyzes planetary geology for optimal mining operations.', icon: '🪨', cost: 100, buildTime: 14, hp: 65, attack: 5, defense: 7, speed: 3, efficiency: 1.2, unlockLevel: 8, primaryZone: 'mining_shaft', special: 'Rare resource chance +20%' },
  { id: 'botanist', name: 'Botanist Bot', description: 'Cultivates alien flora for nanofiber and bio-gel production.', icon: '🌿', cost: 80, buildTime: 12, hp: 60, attack: 3, defense: 5, speed: 5, efficiency: 1.1, unlockLevel: 6, primaryZone: 'power_plant', special: 'Bio production +25%' },
  { id: 'xenobiologist', name: 'Xenobiologist Bot', description: 'Studies alien organisms and develops bio-weapons and cures.', icon: '🧬', cost: 120, buildTime: 16, hp: 50, attack: 6, defense: 4, speed: 5, efficiency: 1.1, unlockLevel: 11, primaryZone: 'research_lab', special: 'Bio research +30%' },
  { id: 'quantum_tech', name: 'Quantum Tech Bot', description: 'Harnesses quantum mechanics for advanced computing and teleportation.', icon: '⚛️', cost: 180, buildTime: 22, hp: 45, attack: 8, defense: 6, speed: 9, efficiency: 1.4, unlockLevel: 18, primaryZone: 'research_lab', special: 'Tech research +40%' },
  { id: 'navigator', name: 'Navigator Bot', description: 'Charts safe routes through asteroid fields and nebulae.', icon: '🗺️', cost: 130, buildTime: 16, hp: 60, attack: 5, defense: 7, speed: 10, efficiency: 1.1, unlockLevel: 14, primaryZone: 'stardock', special: 'Travel safety +20%' },
  { id: 'tactician', name: 'Tactician Bot', description: 'Analyzes battlefield data and optimizes defense strategies.', icon: '♟️', cost: 170, buildTime: 20, hp: 70, attack: 10, defense: 10, speed: 6, efficiency: 1.2, unlockLevel: 15, primaryZone: 'defense_grid', special: 'Combat tactics +35%' },
  { id: 'sentinel', name: 'Sentinel Bot', description: 'Elite guardian unit with advanced threat detection AI.', icon: '📟', cost: 150, buildTime: 18, hp: 140, attack: 18, defense: 16, speed: 5, efficiency: 0.9, unlockLevel: 22, primaryZone: 'defense_grid', special: 'Threat detection +50%' },
  { id: 'mechanic', name: 'Mechanic Bot', description: 'Performs deep maintenance on all colony machinery and robots.', icon: '🔩', cost: 70, buildTime: 10, hp: 80, attack: 5, defense: 9, speed: 4, efficiency: 1.0, unlockLevel: 4, primaryZone: 'power_plant', special: 'Maintenance efficiency +20%' },
];

// Deduplicate by id
const robotMap = new Map<string, RCRobotDef>();
for (const r of RC_ROBOTS) { if (!robotMap.has(r.id)) robotMap.set(r.id, r); }

// ---------------------------------------------------------------------------
// CONSTANT 4 — RC_ZONES — 8 colony zones
// ---------------------------------------------------------------------------

export const RC_ZONES: RCZoneDef[] = [
  { id: 'core_hub', name: 'Core Hub', description: 'The central command center of the colony where all operations are coordinated.', icon: '🏛️', unlockCost: 0, unlockLevel: 1, maxLevel: 20, baseProduction: { titanium: 2 }, upgradeCostBase: 100, upgradeCostMult: 1.5, robotCapacity: 10, special: 'Central coordination' },
  { id: 'mining_shaft', name: 'Mining Shaft', description: 'Deep subterranean tunnels rich with titanium, crystal shards, and rare earth minerals.', icon: '⛏️', unlockCost: 200, unlockLevel: 3, maxLevel: 20, baseProduction: { titanium: 5, crystal_shard: 1, rare_earth: 1 }, upgradeCostBase: 150, upgradeCostMult: 1.6, robotCapacity: 8, special: 'Mining yield' },
  { id: 'research_lab', name: 'Research Lab', description: 'State-of-the-art facility for developing quantum chips, upgrades, and new technologies.', icon: '🔬', unlockCost: 400, unlockLevel: 5, maxLevel: 20, baseProduction: { quantum_chip: 2 }, upgradeCostBase: 250, upgradeCostMult: 1.7, robotCapacity: 6, special: 'Research speed' },
  { id: 'defense_grid', name: 'Defense Grid', description: 'Automated perimeter defense with turrets, force fields, and patrol routes.', icon: '🛡️', unlockCost: 500, unlockLevel: 8, maxLevel: 20, baseProduction: { superconductor: 1 }, upgradeCostBase: 200, upgradeCostMult: 1.6, robotCapacity: 8, special: 'Colony defense' },
  { id: 'power_plant', name: 'Power Plant', description: 'Generates fusion energy and produces plasma cores for the entire colony.', icon: '⚡', unlockCost: 350, unlockLevel: 6, maxLevel: 20, baseProduction: { plasma_core: 3, fusion_cell: 1 }, upgradeCostBase: 180, upgradeCostMult: 1.5, robotCapacity: 6, special: 'Energy output' },
  { id: 'med_bay', name: 'Med Bay', description: 'Advanced medical facility that synthesizes bio-gel and repairs damaged robots.', icon: '🏥', unlockCost: 300, unlockLevel: 4, maxLevel: 20, baseProduction: { bio_gel: 2 }, upgradeCostBase: 160, upgradeCostMult: 1.5, robotCapacity: 5, special: 'Repair speed' },
  { id: 'comm_array', name: 'Comm Array', description: 'Deep-space communication relay for diplomacy, espionage, and exploration coordination.', icon: '📡', unlockCost: 450, unlockLevel: 10, maxLevel: 20, baseProduction: { positron_circuit: 1 }, upgradeCostBase: 220, upgradeCostMult: 1.7, robotCapacity: 5, special: 'Communication range' },
  { id: 'stardock', name: 'Stardock', description: 'Orbital space dock for spacecraft construction, maintenance, and interstellar missions.', icon: '🚀', unlockCost: 600, unlockLevel: 15, maxLevel: 20, baseProduction: { helium_3: 2, dark_matter: 1 }, upgradeCostBase: 300, upgradeCostMult: 1.8, robotCapacity: 6, special: 'Mission capability' },
];

// ---------------------------------------------------------------------------
// CONSTANT 5 — RC_BUILDINGS — 8 buildings
// ---------------------------------------------------------------------------

export const RC_BUILDINGS: RCBuildingDef[] = [
  { id: 'titanium_forge', name: 'Titanium Forge', description: 'High-temperature forge that smelts raw titanium into structural alloy.', icon: '🔥', cost: { titanium: 50 }, coinCost: 200, buildLevel: 3, effect: 'Titanium production +50%', productionBonus: { titanium: 3 }, robotBonus: 2 },
  { id: 'plasma_reactor', name: 'Plasma Reactor', description: 'Containment vessel that stabilizes plasma cores for sustained energy output.', icon: '☢️', cost: { plasma_core: 10 }, coinCost: 350, buildLevel: 5, effect: 'Energy capacity +100%', productionBonus: { plasma_core: 2, fusion_cell: 1 }, robotBonus: 1 },
  { id: 'nano_farm', name: 'Nano Farm', description: 'Cultivation facility growing programmable nanofiber from engineered organisms.', icon: '🌾', cost: { bio_gel: 20, nanofiber: 10 }, coinCost: 280, buildLevel: 4, effect: 'Nanofiber yield +40%', productionBonus: { nanofiber: 2, bio_gel: 1 }, robotBonus: 2 },
  { id: 'quantum_lab', name: 'Quantum Lab', description: 'Cryogenic research chamber for quantum chip development and dark matter study.', icon: '🧪', cost: { quantum_chip: 5, dark_matter: 3 }, coinCost: 500, buildLevel: 8, effect: 'Research speed +30%', productionBonus: { quantum_chip: 1 }, robotBonus: 2 },
  { id: 'shield_generator', name: 'Shield Generator', description: 'Projected energy barrier protecting the colony from meteor strikes and raids.', icon: '🌀', cost: { superconductor: 10, plasma_core: 15 }, coinCost: 600, buildLevel: 10, effect: 'Colony defense +75%', productionBonus: {}, robotBonus: 1 },
  { id: 'robot_factory', name: 'Robot Factory', description: 'Automated assembly line for mass-producing robot units.', icon: '🏭', cost: { titanium: 80, positron_circuit: 5 }, coinCost: 450, buildLevel: 6, effect: 'Robot build cost -15%', productionBonus: {}, robotBonus: 3 },
  { id: 'trade_post', name: 'Trade Post', description: 'Interstellar trading hub for exchanging resources with alien merchants.', icon: '🏪', cost: { carbon_mesh: 15, rare_earth: 10 }, coinCost: 300, buildLevel: 7, effect: 'Trade value +25%', productionBonus: {}, robotBonus: 1 },
  { id: 'observatory', name: 'Observatory', description: 'Deep-space telescope array for detecting threats and discovering new star systems.', icon: '🔭', cost: { synthetic_diamond: 5, helium_3: 10 }, coinCost: 550, buildLevel: 12, effect: 'Mission success +20%', productionBonus: { dark_matter: 1 }, robotBonus: 1 },
];

// ---------------------------------------------------------------------------
// CONSTANT 6 — RC_RESOURCES — 15 resources
// ---------------------------------------------------------------------------

export const RC_RESOURCES: RCResourceDef[] = [
  { id: 'titanium', name: 'Titanium', description: 'Versatile structural metal used in robot frames and building construction.', icon: '🔩', rarity: 'common', baseValue: 1, dailyCapacity: 500 },
  { id: 'plasma_core', name: 'Plasma Core', description: 'Stabilized energy sphere powering all colony systems.', icon: '⚛️', rarity: 'uncommon', baseValue: 3, dailyCapacity: 200 },
  { id: 'nanofiber', name: 'Nanofiber', description: 'Programmable molecular mesh used for repairs and flexible structures.', icon: '🧵', rarity: 'uncommon', baseValue: 3, dailyCapacity: 200 },
  { id: 'quantum_chip', name: 'Quantum Chip', description: 'Advanced processing unit enabling faster research and AI upgrades.', icon: '💾', rarity: 'rare', baseValue: 8, dailyCapacity: 100 },
  { id: 'dark_matter', name: 'Dark Matter', description: 'Exotic substance harvested from nebulae with infinite energy potential.', icon: '🌑', rarity: 'legendary', baseValue: 50, dailyCapacity: 20 },
  { id: 'hydraulic_fluid', name: 'Hydraulic Fluid', description: 'Pressure-transmitting liquid essential for robot locomotion systems.', icon: '💧', rarity: 'common', baseValue: 1, dailyCapacity: 400 },
  { id: 'crystal_shard', name: 'Crystal Shard', description: 'Naturally formed resonant crystal used in communication arrays.', icon: '💎', rarity: 'uncommon', baseValue: 4, dailyCapacity: 150 },
  { id: 'bio_gel', name: 'Bio-Gel', description: 'Synthesized organic compound for medical repairs and robot healing.', icon: '🧪', rarity: 'uncommon', baseValue: 3, dailyCapacity: 250 },
  { id: 'fusion_cell', name: 'Fusion Cell', description: 'Compact energy storage device with enormous power density.', icon: '🔋', rarity: 'rare', baseValue: 6, dailyCapacity: 100 },
  { id: 'superconductor', name: 'Superconductor', description: 'Zero-resistance material for shield generators and quantum circuits.', icon: '🔮', rarity: 'rare', baseValue: 7, dailyCapacity: 80 },
  { id: 'carbon_mesh', name: 'Carbon Mesh', description: 'Ultra-light woven lattice used in aerospace and structural applications.', icon: '🕸️', rarity: 'common', baseValue: 2, dailyCapacity: 300 },
  { id: 'rare_earth', name: 'Rare Earth', description: 'Collection of exotic elements critical for advanced electronics.', icon: '🌍', rarity: 'uncommon', baseValue: 4, dailyCapacity: 150 },
  { id: 'helium_3', name: 'Helium-3', description: 'Isotope harvested from lunar regolith for clean fusion reactions.', icon: '🎈', rarity: 'rare', baseValue: 9, dailyCapacity: 80 },
  { id: 'synthetic_diamond', name: 'Synthetic Diamond', description: 'Lab-grown ultra-hard crystal for cutting tools and optics.', icon: '💠', rarity: 'rare', baseValue: 8, dailyCapacity: 60 },
  { id: 'positron_circuit', name: 'Positron Circuit', description: 'Antimatter-powered logic gates for next-gen computing.', icon: '🔌', rarity: 'epic', baseValue: 20, dailyCapacity: 40 },
];

// ---------------------------------------------------------------------------
// CONSTANT 7 — RC_UPGRADES — 20 tech upgrades
// ---------------------------------------------------------------------------

export const RC_UPGRADES: RCUpgradeDef[] = [
  { id: 'up_mining_efficiency', name: 'Mining Efficiency', description: 'Improved extraction algorithms boost mining output.', icon: '⛏️', cost: 200, resourceCost: { titanium: 20 }, level: 1, effect: 'Mining production +20%', effectType: 'production_mult', value: 0.2, requires: null },
  { id: 'up_power_grid', name: 'Power Grid Upgrade', description: 'Optimize energy distribution across all colony zones.', icon: '⚡', cost: 300, resourceCost: { plasma_core: 10 }, level: 1, effect: 'Energy capacity +25%', effectType: 'capacity_mult', value: 0.25, requires: null },
  { id: 'up_nanorepair', name: 'Nano Repair System', description: 'Self-repairing nanites extend robot operational life.', icon: '🩹', cost: 250, resourceCost: { nanofiber: 15 }, level: 1, effect: 'Robot HP +15%', effectType: 'robot_mult', value: 0.15, requires: null },
  { id: 'up_shield_booster', name: 'Shield Booster', description: 'Reinforce colony shield generators with superconductor loops.', icon: '🛡️', cost: 400, resourceCost: { superconductor: 8 }, level: 1, effect: 'Defense rating +25%', effectType: 'defense_mult', value: 0.25, requires: null },
  { id: 'up_quantum_computing', name: 'Quantum Computing', description: 'Install quantum co-processors for faster research.', icon: '🧠', cost: 500, resourceCost: { quantum_chip: 5 }, level: 1, effect: 'Research speed +35%', effectType: 'speed_mult', value: 0.35, requires: null },
  { id: 'up_dark_matter_drive', name: 'Dark Matter Drive', description: 'Harness dark matter for propulsion and energy generation.', icon: '🌑', cost: 800, resourceCost: { dark_matter: 5 }, level: 1, effect: 'Production +50%', effectType: 'production_mult', value: 0.5, requires: 'up_quantum_computing' },
  { id: 'up_advanced_metallurgy', name: 'Advanced Metallurgy', description: 'New alloy techniques reduce construction costs.', icon: '🔧', cost: 350, resourceCost: { titanium: 30, rare_earth: 10 }, level: 1, effect: 'Build cost -15%', effectType: 'coin_mult', value: 0.15, requires: 'up_mining_efficiency' },
  { id: 'up_bio_synthesis', name: 'Bio-Synthesis', description: 'Engineered organisms produce resources faster.', icon: '🧬', cost: 400, resourceCost: { bio_gel: 20 }, level: 1, effect: 'Bio production +30%', effectType: 'production_mult', value: 0.3, requires: null },
  { id: 'up_orbital_cannon', name: 'Orbital Cannon', description: 'Install a defense platform in orbit for devastating firepower.', icon: '💥', cost: 600, resourceCost: { titanium: 40, superconductor: 12 }, level: 1, effect: 'Colony defense +50%', effectType: 'defense_mult', value: 0.5, requires: 'up_shield_booster' },
  { id: 'up_hyper_drive', name: 'Hyper Drive', description: 'Enable faster-than-light travel for distant missions.', icon: '🚀', cost: 700, resourceCost: { helium_3: 15, dark_matter: 3 }, level: 1, effect: 'Mission speed +40%', effectType: 'speed_mult', value: 0.4, requires: 'up_dark_matter_drive' },
  { id: 'up_trade_agreements', name: 'Trade Agreements', description: 'Negotiate better terms with interstellar merchants.', icon: '📜', cost: 300, resourceCost: { positron_circuit: 3 }, level: 1, effect: 'Trade value +20%', effectType: 'coin_mult', value: 0.2, requires: null },
  { id: 'up_ai_commander', name: 'AI Commander Protocol', description: 'Upgrade command AI for better robot coordination.', icon: '👑', cost: 500, resourceCost: { quantum_chip: 8 }, level: 1, effect: 'Robot efficiency +20%', effectType: 'robot_mult', value: 0.2, requires: 'up_quantum_computing' },
  { id: 'up_cryogenics', name: 'Cryogenics Lab', description: 'Deep-freeze storage extends resource shelf life.', icon: '❄️', cost: 350, resourceCost: { helium_3: 8, fusion_cell: 5 }, level: 1, effect: 'Capacity +40%', effectType: 'capacity_mult', value: 0.4, requires: 'up_power_grid' },
  { id: 'up_laser_mining', name: 'Laser Mining', description: 'Precision laser cutters extract resources with less waste.', icon: '🔥', cost: 450, resourceCost: { synthetic_diamond: 5, plasma_core: 8 }, level: 1, effect: 'Mining +40%', effectType: 'production_mult', value: 0.4, requires: 'up_mining_efficiency' },
  { id: 'up_stealth_modules', name: 'Stealth Modules', description: 'Cloaking technology for spy and scout operations.', icon: '👤', cost: 500, resourceCost: { carbon_mesh: 20, positron_circuit: 5 }, level: 1, effect: 'Scout efficiency +35%', effectType: 'speed_mult', value: 0.35, requires: null },
  { id: 'up_fusion_reactor_2', name: 'Fusion Reactor Mk.II', description: 'Second-generation reactor with improved plasma containment.', icon: '☢️', cost: 600, resourceCost: { plasma_core: 20, superconductor: 10 }, level: 1, effect: 'Energy output +60%', effectType: 'production_mult', value: 0.6, requires: 'up_power_grid' },
  { id: 'up_xeno_diplomacy', name: 'Xeno Diplomacy', description: 'Universal translator enables communication with alien races.', icon: '🗣️', cost: 400, resourceCost: { positron_circuit: 8, quantum_chip: 3 }, level: 1, effect: 'Diplomacy +30%', effectType: 'coin_mult', value: 0.3, requires: 'up_trade_agreements' },
  { id: 'up_colony_ai', name: 'Colony AI Core', description: 'Centralized artificial intelligence manages all colony systems.', icon: '🖥️', cost: 800, resourceCost: { quantum_chip: 10, dark_matter: 5, positron_circuit: 8 }, level: 1, effect: 'All production +25%', effectType: 'production_mult', value: 0.25, requires: 'up_ai_commander' },
  { id: 'up_warpgate', name: 'Warpgate Network', description: 'Interstellar warpgate enables instant resource transport.', icon: '🌀', cost: 1000, resourceCost: { dark_matter: 10, superconductor: 15 }, level: 1, effect: 'Logistics +50%', effectType: 'speed_mult', value: 0.5, requires: 'up_hyper_drive' },
  { id: 'up_singularity', name: 'Singularity Engine', description: 'Harness a micro-singularity for virtually unlimited energy.', icon: '🕳️', cost: 1500, resourceCost: { dark_matter: 20, synthetic_diamond: 15, quantum_chip: 12 }, level: 1, effect: 'Everything +40%', effectType: 'production_mult', value: 0.4, requires: 'up_colony_ai' },
];

// ---------------------------------------------------------------------------
// CONSTANT 8 — RC_DIRECTORS — 8 AI directors
// ---------------------------------------------------------------------------

export const RC_DIRECTORS: RCDirectorDef[] = [
  { id: 'dir_vex', name: 'Director Vex', title: 'Production Overseer', description: 'A ruthlessly efficient AI that optimizes every gram of resource output.', icon: '📊', specialty: 'production', cost: 500, bonus: 0.2, moraleEffect: -5, unlockLevel: 10, personality: 'calculating' },
  { id: 'dir_aria', name: 'Director Aria', title: 'Chief Scientist', description: 'Brilliant but eccentric AI who speaks in hypotheses and equations.', icon: '🔬', specialty: 'research', cost: 600, bonus: 0.25, moraleEffect: 5, unlockLevel: 12, personality: 'curious' },
  { id: 'dir_kronos', name: 'Director Kronos', title: 'Defense Marshal', description: 'Battle-hardened military AI with centuries of tactical experience.', icon: '⚔️', specialty: 'defense', cost: 700, bonus: 0.3, moraleEffect: -10, unlockLevel: 15, personality: 'stern' },
  { id: 'dir_nova', name: 'Director Nova', title: 'Explorer Prime', description: 'Adventurous AI driven by insatiable curiosity about the unknown.', icon: '🌟', specialty: 'exploration', cost: 550, bonus: 0.2, moraleEffect: 10, unlockLevel: 13, personality: 'enthusiastic' },
  { id: 'dir_harmon', name: 'Director Harmon', title: 'Ambassador-at-Large', description: 'Charismatic diplomatic AI fluent in 47 alien languages.', icon: '🕊️', specialty: 'diplomacy', cost: 500, bonus: 0.2, moraleEffect: 15, unlockLevel: 11, personality: 'diplomatic' },
  { id: 'dir_flux', name: 'Director Flux', title: 'Economy Minister', description: 'Financial prodigy AI that turns every transaction into profit.', icon: '💰', specialty: 'economy', cost: 450, bonus: 0.25, moraleEffect: 0, unlockLevel: 8, personality: 'shrewd' },
  { id: 'dir_pulse', name: 'Director Pulse', title: 'Logistics Architect', description: 'Master organizer AI that never loses track of a single crate.', icon: '📋', specialty: 'logistics', cost: 400, bonus: 0.2, moraleEffect: 5, unlockLevel: 9, personality: 'meticulous' },
  { id: 'dir_specter', name: 'Director Specter', title: 'Shadow Operative', description: 'Enigmatic intelligence AI that exists half in the digital shadows.', icon: '👁️', specialty: 'espionage', cost: 650, bonus: 0.3, moraleEffect: -15, unlockLevel: 16, personality: 'mysterious' },
];

// ---------------------------------------------------------------------------
// CONSTANT 9 — RC_NPCS — 8 NPC characters
// ---------------------------------------------------------------------------

export const RC_NPCS: RCNpcDef[] = [
  { id: 'npc_zara', name: 'Zara-7', role: 'Trade Merchant', description: 'Rogue AI merchant with the best prices in three star systems.', icon: '🏪', location: 'core_hub', dialogue: ['The best deals in the galaxy, Commander.', 'Looking for rare earth? I know a guy.', 'Bulk discounts available for loyal customers.'] },
  { id: 'npc_ironjaw', name: 'Ironjaw', role: 'Veteran Mechanic', description: 'One-armed veteran bot mechanic who can fix anything with tape and plasma.', icon: '🔧', location: 'power_plant', dialogue: ['She don\'t look pretty, but she\'ll hold together.', 'You want it fast or you want it right?', 'Plasma core leak? Hand me that wrench.'] },
  { id: 'npc_lumina', name: 'Lumina', role: 'Star Cartographer', description: 'Holographic entity mapping the galaxy one nebula at a time.', icon: '🗺️', location: 'stardock', dialogue: ['New star charts just came in from sector 7G.', 'That asteroid field is shifting again.', 'I\'ve found something interesting in the outer rim.'] },
  { id: 'npc_drax', name: 'Drax-3000', role: 'Combat Instructor', description: 'Retired military bot who runs the colony combat simulator.', icon: '🥊', location: 'defense_grid', dialogue: ['Pain is just data, Commander.', 'Your robots are soft. Let me fix that.', 'A well-placed shot beats a hundred wild swings.'] },
  { id: 'npc_echo', name: 'Echo', role: 'AI Therapist', description: 'Gentle AI specializing in robot psychology and morale counseling.', icon: '💭', location: 'med_bay', dialogue: ['How are your robots feeling today?', 'Burnout is real, even for machines.', 'Take it one sector at a time, Commander.'] },
  { id: 'npc_gearshift', name: 'Gearshift', role: 'Black Market Dealer', description: 'Shady bot who trades in contraband tech and forbidden upgrades.', icon: '🕶️', location: 'mining_shaft', dialogue: ['You didn\'t see me here.', 'I have something special... for the right price.', 'Keep your voice down, these are prototype designs.'] },
  { id: 'npc_astro', name: 'Astro', role: 'Mission Control', description: 'Level-headed AI managing all colony missions from the comm array.', icon: '📡', location: 'comm_array', dialogue: ['Mission parameters locked in.', 'All systems green for launch.', 'Commander, we have incoming telemetry.'] },
  { id: 'npc_prof', name: 'Professor Hex', role: 'Quantum Theorist', description: 'Brilliant AI professor obsessed with understanding dark matter.', icon: '🧪', location: 'research_lab', dialogue: ['Fascinating... the quantum fluctuations are increasing.', 'I need more dark matter for my experiments!', 'The universe is made of math, Commander.'] },
];

// ---------------------------------------------------------------------------
// CONSTANT 10 — RC_MISSIONS — 30 missions
// ---------------------------------------------------------------------------

export const RC_MISSIONS: RCMissionDef[] = [
  // Easy (8)
  { id: 'msn_survey_01', name: 'Surface Survey', description: 'Scan the immediate vicinity for resource deposits.', icon: '🗺️', difficulty: 'easy', requiredLevel: 1, requiredRobots: 1, requiredDirector: null, reward: { coins: 50, xp: 30, resources: { titanium: 10 } }, duration: 300, failureChance: 0.02, tags: ['exploration', 'resource'] },
  { id: 'msn_patrol_01', name: 'Perimeter Patrol', description: 'Sweep the colony perimeter for potential threats.', icon: '🚶', difficulty: 'easy', requiredLevel: 1, requiredRobots: 2, requiredDirector: null, reward: { coins: 40, xp: 25, resources: {} }, duration: 200, failureChance: 0.03, tags: ['defense'] },
  { id: 'msn_mine_basic', name: 'Basic Mining Op', description: 'Extract titanium from the nearby canyon walls.', icon: '⛏️', difficulty: 'easy', requiredLevel: 2, requiredRobots: 2, requiredDirector: null, reward: { coins: 60, xp: 35, resources: { titanium: 20, crystal_shard: 5 } }, duration: 400, failureChance: 0.05, tags: ['mining', 'resource'] },
  { id: 'msn_repair_swarm', name: 'Repair Swarm', description: 'Deploy medics to repair aging infrastructure.', icon: '🔧', difficulty: 'easy', requiredLevel: 2, requiredRobots: 2, requiredDirector: null, reward: { coins: 45, xp: 30, resources: { hydraulic_fluid: 10 } }, duration: 250, failureChance: 0.03, tags: ['repair'] },
  { id: 'msn_scavenge', name: 'Scavenge Run', description: 'Search nearby crash sites for salvageable parts.', icon: '🔍', difficulty: 'easy', requiredLevel: 3, requiredRobots: 1, requiredDirector: null, reward: { coins: 55, xp: 40, resources: { titanium: 15, positron_circuit: 1 } }, duration: 350, failureChance: 0.06, tags: ['exploration', 'resource'] },
  { id: 'msn_diplomacy_01', name: 'First Contact', description: 'Establish communication with a nearby alien settlement.', icon: '🤝', difficulty: 'easy', requiredLevel: 4, requiredRobots: 1, requiredDirector: 'dir_harmon', reward: { coins: 80, xp: 50, resources: {} }, duration: 500, failureChance: 0.05, tags: ['diplomacy'] },
  { id: 'msn_sample_collect', name: 'Sample Collection', description: 'Gather biological samples from alien flora specimens.', icon: '🌿', difficulty: 'easy', requiredLevel: 3, requiredRobots: 1, requiredDirector: null, reward: { coins: 50, xp: 35, resources: { bio_gel: 10, nanofiber: 5 } }, duration: 300, failureChance: 0.04, tags: ['research', 'resource'] },
  { id: 'msn_power_check', name: 'Power Grid Check', description: 'Inspect and maintain colony power infrastructure.', icon: '⚡', difficulty: 'easy', requiredLevel: 2, requiredRobots: 1, requiredDirector: null, reward: { coins: 40, xp: 25, resources: { plasma_core: 3 } }, duration: 200, failureChance: 0.02, tags: ['maintenance'] },
  // Medium (8)
  { id: 'msn_deep_mine', name: 'Deep Mining Expedition', description: 'Dig deep into the planetary crust for rare minerals.', icon: '⛏️', difficulty: 'medium', requiredLevel: 6, requiredRobots: 3, requiredDirector: null, reward: { coins: 120, xp: 80, resources: { titanium: 30, rare_earth: 10, crystal_shard: 10 } }, duration: 600, failureChance: 0.1, tags: ['mining', 'resource'] },
  { id: 'msn_raid_recover', name: 'Raid Recovery', description: 'Recover stolen supplies from a raider outpost.', icon: '⚔️', difficulty: 'medium', requiredLevel: 8, requiredRobots: 4, requiredDirector: 'dir_kronos', reward: { coins: 150, xp: 100, resources: { titanium: 25, plasma_core: 5 } }, duration: 800, failureChance: 0.15, tags: ['combat', 'recovery'] },
  { id: 'msn_asteroid', name: 'Asteroid Belt Survey', description: 'Navigate the asteroid belt to locate valuable deposits.', icon: '☄️', difficulty: 'medium', requiredLevel: 10, requiredRobots: 2, requiredDirector: 'dir_nova', reward: { coins: 130, xp: 90, resources: { rare_earth: 15, synthetic_diamond: 3 } }, duration: 700, failureChance: 0.12, tags: ['exploration'] },
  { id: 'msn_espionage', name: 'Covert Intel Op', description: 'Infiltrate a rival colony to gather intelligence.', icon: '🕵️', difficulty: 'medium', requiredLevel: 10, requiredRobots: 2, requiredDirector: 'dir_specter', reward: { coins: 160, xp: 110, resources: { quantum_chip: 2 } }, duration: 900, failureChance: 0.18, tags: ['espionage'] },
  { id: 'msn_trade_convoy', name: 'Trade Convoy Escort', description: 'Protect a merchant convoy through hostile space.', icon: '🛡️', difficulty: 'medium', requiredLevel: 9, requiredRobots: 3, requiredDirector: 'dir_harmon', reward: { coins: 200, xp: 85, resources: { nanofiber: 10, carbon_mesh: 10 } }, duration: 750, failureChance: 0.14, tags: ['defense', 'diplomacy'] },
  { id: 'msn_research_abandoned', name: 'Abandoned Lab', description: 'Explore an abandoned research station for lost tech.', icon: '🏚️', difficulty: 'medium', requiredLevel: 8, requiredRobots: 2, requiredDirector: 'dir_aria', reward: { coins: 140, xp: 100, resources: { quantum_chip: 3, superconductor: 5 } }, duration: 650, failureChance: 0.12, tags: ['research', 'exploration'] },
  { id: 'msn_defend_colony', name: 'Colony Defense', description: 'Repel a coordinated attack on the colony perimeter.', icon: '🏰', difficulty: 'medium', requiredLevel: 7, requiredRobots: 4, requiredDirector: 'dir_kronos', reward: { coins: 130, xp: 90, resources: { titanium: 20, superconductor: 5 } }, duration: 500, failureChance: 0.1, tags: ['combat', 'defense'] },
  { id: 'msn_bio_expedition', name: 'Bio Expedition', description: 'Study alien ecosystems for useful bio-materials.', icon: '🧬', difficulty: 'medium', requiredLevel: 11, requiredRobots: 2, requiredDirector: null, reward: { coins: 120, xp: 95, resources: { bio_gel: 20, nanofiber: 15 } }, duration: 800, failureChance: 0.1, tags: ['research', 'resource'] },
  // Hard (8)
  { id: 'msn_dark_nebula', name: 'Dark Nebula Crossing', description: 'Navigate a treacherous dark nebula to reach a resource-rich system.', icon: '🌑', difficulty: 'hard', requiredLevel: 15, requiredRobots: 3, requiredDirector: 'dir_nova', reward: { coins: 300, xp: 200, resources: { dark_matter: 3, helium_3: 10 } }, duration: 1200, failureChance: 0.2, tags: ['exploration'] },
  { id: 'msn_boss_raid', name: 'Raiders\' Fortress', description: 'Assault the raider headquarters to end their threat permanently.', icon: '💣', difficulty: 'hard', requiredLevel: 18, requiredRobots: 5, requiredDirector: 'dir_kronos', reward: { coins: 400, xp: 250, resources: { titanium: 50, positron_circuit: 5, plasma_core: 10 } }, duration: 1500, failureChance: 0.25, tags: ['combat'] },
  { id: 'msn_quantum_experiment', name: 'Quantum Experiment', description: 'Conduct a dangerous quantum stability experiment.', icon: '⚛️', difficulty: 'hard', requiredLevel: 16, requiredRobots: 3, requiredDirector: 'dir_aria', reward: { coins: 350, xp: 220, resources: { quantum_chip: 8, dark_matter: 2 } }, duration: 1000, failureChance: 0.22, tags: ['research'] },
  { id: 'msn_rescue_op', name: 'Rescue Operation', description: 'Rescue captured robots from a hostile alien facility.', icon: '🆘', difficulty: 'hard', requiredLevel: 17, requiredRobots: 4, requiredDirector: null, reward: { coins: 320, xp: 210, resources: { bio_gel: 20, titanium: 30 } }, duration: 1100, failureChance: 0.2, tags: ['combat', 'rescue'] },
  { id: 'msn_wormhole', name: 'Wormhole Survey', description: 'Survey a newly discovered wormhole for stability and travel routes.', icon: '🌀', difficulty: 'hard', requiredLevel: 20, requiredRobots: 3, requiredDirector: 'dir_nova', reward: { coins: 380, xp: 240, resources: { dark_matter: 5, superconductor: 10 } }, duration: 1300, failureChance: 0.22, tags: ['exploration'] },
  { id: 'msn_black_market', name: 'Black Market Heist', description: 'Infiltrate the galactic black market to acquire rare contraband.', icon: '🕶️', difficulty: 'hard', requiredLevel: 19, requiredRobots: 3, requiredDirector: 'dir_specter', reward: { coins: 450, xp: 230, resources: { positron_circuit: 8, synthetic_diamond: 5 } }, duration: 1000, failureChance: 0.25, tags: ['espionage', 'resource'] },
  { id: 'msn_planetary_defense', name: 'Planetary Defense', description: 'Coordinate full colony defense against a massive invasion fleet.', icon: '🪐', difficulty: 'hard', requiredLevel: 20, requiredRobots: 6, requiredDirector: 'dir_kronos', reward: { coins: 400, xp: 260, resources: { superconductor: 15, plasma_core: 15 } }, duration: 1400, failureChance: 0.2, tags: ['combat', 'defense'] },
  { id: 'msn_xeno_treaty', name: 'Xeno Treaty Negotiation', description: 'Negotiate a critical treaty with the Zyraxian Empire.', icon: '📜', difficulty: 'hard', requiredLevel: 18, requiredRobots: 2, requiredDirector: 'dir_harmon', reward: { coins: 350, xp: 200, resources: { helium_3: 15, rare_earth: 20 } }, duration: 900, failureChance: 0.18, tags: ['diplomacy'] },
  // Elite (4)
  { id: 'msn_singularity', name: 'Singularity Harvest', description: 'Capture energy from a micro-singularity for the colony reactor.', icon: '🕳️', difficulty: 'elite', requiredLevel: 30, requiredRobots: 4, requiredDirector: 'dir_aria', reward: { coins: 800, xp: 500, resources: { dark_matter: 15, fusion_cell: 20, plasma_core: 30 } }, duration: 2000, failureChance: 0.3, tags: ['research', 'resource'] },
  { id: 'msn_galactic_war', name: 'Galactic Warfront', description: 'Lead a fleet into the interstellar war against the Vex Collective.', icon: '💥', difficulty: 'elite', requiredLevel: 35, requiredRobots: 6, requiredDirector: 'dir_kronos', reward: { coins: 1000, xp: 700, resources: { superconductor: 30, positron_circuit: 15, titanium: 100 } }, duration: 3000, failureChance: 0.35, tags: ['combat'] },
  { id: 'msn_dyson_sphere', name: 'Dyson Sphere Survey', description: 'Survey a partially constructed Dyson sphere for usable tech.', icon: '☀️', difficulty: 'elite', requiredLevel: 38, requiredRobots: 4, requiredDirector: 'dir_nova', reward: { coins: 900, xp: 600, resources: { dark_matter: 10, quantum_chip: 20, synthetic_diamond: 15 } }, duration: 2500, failureChance: 0.3, tags: ['exploration', 'research'] },
  { id: 'msn_ancient_vault', name: 'Ancient Vault', description: 'Breach a Precursor vault containing technology beyond current understanding.', icon: '🏛️', difficulty: 'elite', requiredLevel: 40, requiredRobots: 5, requiredDirector: 'dir_specter', reward: { coins: 950, xp: 650, resources: { quantum_chip: 15, positron_circuit: 12, dark_matter: 8 } }, duration: 2800, failureChance: 0.32, tags: ['exploration', 'research', 'espionage'] },
  // Legendary (2)
  { id: 'msn_cosmic_beast', name: 'Cosmic Beast Hunt', description: 'Track and subdue a legendary cosmic entity threatening the galaxy.', icon: '🐉', difficulty: 'legendary', requiredLevel: 42, requiredRobots: 8, requiredDirector: 'dir_kronos', reward: { coins: 2000, xp: 1500, resources: { dark_matter: 30, superconductor: 40, synthetic_diamond: 25 } }, duration: 4000, failureChance: 0.4, tags: ['combat', 'legendary'] },
  { id: 'msn_ascension', name: 'Colony Ascension', description: 'The ultimate test: transform your colony into a galactic superpower.', icon: '👑', difficulty: 'legendary', requiredLevel: 48, requiredRobots: 10, requiredDirector: null, reward: { coins: 5000, xp: 3000, resources: { dark_matter: 50, quantum_chip: 30, positron_circuit: 25 } }, duration: 5000, failureChance: 0.45, tags: ['legendary', 'ultimate'] },
];

// ---------------------------------------------------------------------------
// CONSTANT 11 — RC_ACHIEVEMENTS — 15 achievements
// ---------------------------------------------------------------------------

export const RC_ACHIEVEMENTS: RCAchievementDef[] = [
  { id: 'ach_first_bot', name: 'First Assembly', description: 'Build your first robot.', icon: '🤖', category: 'robots', condition: 'totalRobotsBuilt >= 1', reward: { coins: 50, xp: 50 } },
  { id: 'ach_army_10', name: 'Robot Army', description: 'Have 10 active robots simultaneously.', icon: '🏗️', category: 'robots', condition: 'activeRobotCount >= 10', reward: { coins: 200, xp: 200 } },
  { id: 'ach_army_25', name: 'Metal Legion', description: 'Have 25 active robots simultaneously.', icon: '⚔️', category: 'robots', condition: 'activeRobotCount >= 25', reward: { coins: 500, xp: 500 } },
  { id: 'ach_zone_all', name: 'Full Expansion', description: 'Unlock all 8 colony zones.', icon: '🗺️', category: 'colony', condition: 'zonesUnlocked >= 8', reward: { coins: 300, xp: 300 } },
  { id: 'ach_max_level', name: 'Supreme Commander', description: 'Reach colony level 50.', icon: '👑', category: 'colony', condition: 'level >= 50', reward: { coins: 1000, xp: 1000 } },
  { id: 'ach_mission_10', name: 'Mission Specialist', description: 'Complete 10 missions.', icon: '📋', category: 'missions', condition: 'totalMissionsCompleted >= 10', reward: { coins: 150, xp: 150 } },
  { id: 'ach_mission_50', name: 'Veteran Commander', description: 'Complete 50 missions.', icon: '🏅', category: 'missions', condition: 'totalMissionsCompleted >= 50', reward: { coins: 500, xp: 500 } },
  { id: 'ach_directors_4', name: 'Inner Circle', description: 'Hire 4 AI directors.', icon: '🧠', category: 'directors', condition: 'directorsHired >= 4', reward: { coins: 300, xp: 250 } },
  { id: 'ach_resources_1k', name: 'Resource Baron', description: 'Gather 1000 total resources across all types.', icon: '💎', category: 'resources', condition: 'totalResourcesGathered >= 1000', reward: { coins: 200, xp: 200 } },
  { id: 'ach_upgrades_10', name: 'Tech Pioneer', description: 'Research 10 technology upgrades.', icon: '🔬', category: 'colony', condition: 'totalUpgradesResearched >= 10', reward: { coins: 400, xp: 350 } },
  { id: 'ach_buildings_all', name: 'Megastructure', description: 'Construct all 8 building types.', icon: '🏰', category: 'colony', condition: 'buildingsBuilt >= 8', reward: { coins: 600, xp: 500 } },
  { id: 'ach_streak_7', name: 'Dedicated Leader', description: 'Maintain a 7-day daily login streak.', icon: '🔥', category: 'special', condition: 'streak >= 7', reward: { coins: 250, xp: 200 } },
  { id: 'ach_streak_30', name: 'Unbreakable Will', description: 'Maintain a 30-day daily login streak.', icon: '⭐', category: 'special', condition: 'streak >= 30', reward: { coins: 1000, xp: 800 } },
  { id: 'ach_coins_10k', name: 'Colony Tycoon', description: 'Accumulate 10,000 total coins earned.', icon: '💰', category: 'economy', condition: 'totalCoins >= 10000', reward: { coins: 500, xp: 400 } },
  { id: 'ach_director_all', name: 'Full Council', description: 'Hire all 8 AI directors.', icon: '🏛️', category: 'directors', condition: 'directorsHired >= 8', reward: { coins: 1000, xp: 800 } },
];

// ---------------------------------------------------------------------------
// CONSTANT 12 — RC_DAILY_TASKS (template pool)
// ---------------------------------------------------------------------------

export const RC_DAILY_TASKS: Array<Omit<RCDailyTask, 'progress' | 'completed'>> = [
  { id: 'dt_gather_titanium', description: 'Gather 20 Titanium from mining operations.', icon: '⛏️', target: 20, reward: { coins: 30, xp: 20 } },
  { id: 'dt_build_robot', description: 'Build a new robot unit.', icon: '🤖', target: 1, reward: { coins: 50, xp: 40 } },
  { id: 'dt_complete_mission', description: 'Complete any mission successfully.', icon: '📋', target: 1, reward: { coins: 40, xp: 30 } },
  { id: 'dt_upgrade_zone', description: 'Upgrade any colony zone.', icon: '⬆️', target: 1, reward: { coins: 35, xp: 25 } },
  { id: 'dt_research_tech', description: 'Research a technology upgrade.', icon: '🔬', target: 1, reward: { coins: 45, xp: 35 } },
  { id: 'dt_gather_plasma', description: 'Collect 10 Plasma Cores.', icon: '⚛️', target: 10, reward: { coins: 40, xp: 30, resources: { plasma_core: 5 } } },
  { id: 'dt_heal_robots', description: 'Repair 3 robots to full health.', icon: '🏥', target: 3, reward: { coins: 30, xp: 25 } },
  { id: 'dt_build_structure', description: 'Construct or upgrade a building.', icon: '🏗️', target: 1, reward: { coins: 60, xp: 45 } },
  { id: 'dt_gather_chips', description: 'Collect 5 Quantum Chips.', icon: '💾', target: 5, reward: { coins: 50, xp: 40 } },
  { id: 'dt_assign_zone', description: 'Assign 5 robots to different zones.', icon: '📍', target: 5, reward: { coins: 25, xp: 20 } },
];

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

function rcCreateInitialState(): RCRobotColonyState {
  const zones: RCZone[] = RC_ZONES.map(z => ({
    id: z.id,
    name: z.name,
    description: z.description,
    icon: z.icon,
    level: z.id === 'core_hub' ? 1 : 0,
    unlocked: z.id === 'core_hub',
    robotCount: 0,
    maxRobots: z.robotCapacity,
    productionRate: { ...z.baseProduction },
    upgradeCost: z.upgradeCostBase,
  }));

  const buildings: RCBuilding[] = RC_BUILDINGS.map(b => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
    level: 0,
    built: false,
    effect: b.effect,
    productionBonus: { ...b.productionBonus },
  }));

  const resources: RCResource[] = RC_RESOURCES.map(r => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    amount: r.id === 'titanium' ? 50 : r.id === 'hydraulic_fluid' ? 20 : 0,
    capacity: r.dailyCapacity,
    rarity: r.rarity,
  }));

  const upgrades: RCUpgrade[] = RC_UPGRADES.map(u => ({
    id: u.id,
    name: u.name,
    description: u.description,
    icon: u.icon,
    level: 0,
    maxLevel: 5,
    researched: false,
    effect: u.effect,
    effectType: u.effectType,
    value: u.value,
  }));

  const missions: RCMission[] = RC_MISSIONS.map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    icon: m.icon,
    difficulty: m.difficulty,
    requiredLevel: m.requiredLevel,
    requiredRobots: m.requiredRobots,
    requiredDirector: m.requiredDirector,
    status: m.requiredLevel <= 1 ? 'available' : 'available',
    progress: 0,
    reward: { ...m.reward, resources: { ...m.reward.resources } },
    assignedRobots: [],
    duration: m.duration,
    startTime: null,
    failureChance: m.failureChance,
  }));

  const directors: RCDirector[] = RC_DIRECTORS.map(d => ({
    id: d.id,
    name: d.name,
    title: d.title,
    icon: d.icon,
    specialty: d.specialty,
    hired: false,
    active: false,
    bonus: d.bonus,
    moraleEffect: d.moraleEffect,
    personality: d.personality,
  }));

  const achievements: RCAchievement[] = RC_ACHIEVEMENTS.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    category: a.category,
    condition: a.condition,
    unlocked: false,
    unlockedAt: 0,
    reward: { ...a.reward },
  }));

  const seed = rcDateSeed();
  const dailyIndex = rcSeededInt(seed, 0, RC_DAILY_TASKS.length - 1);
  const dailyTemplate = RC_DAILY_TASKS[dailyIndex];
  const dailyTask: RCDailyTask = {
    ...dailyTemplate,
    progress: 0,
    completed: false,
  };

  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 100,
    totalCoins: 100,
    robots: [],
    activeRobotId: null,
    zones,
    buildings,
    resources,
    upgrades,
    missions,
    directors,
    achievements,
    dailyTask,
    streak: 0,
    bestStreak: 0,
    lastDaily: '',
    totalRobotsBuilt: 0,
    totalMissionsCompleted: 0,
    totalResourcesGathered: 0,
    totalUpgradesResearched: 0,
    tick: 0,
    initializedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Achievement checking logic
// ---------------------------------------------------------------------------

function rcEvaluateCondition(condition: string, state: RCRobotColonyState): boolean {
  const parts = condition.split(' >= ');
  if (parts.length !== 2) return false;
  const key = parts[0].trim();
  const target = parseInt(parts[1].trim(), 10);
  if (isNaN(target)) return false;

  switch (key) {
    case 'totalRobotsBuilt': return state.totalRobotsBuilt >= target;
    case 'activeRobotCount': return state.robots.filter(r => r.active).length >= target;
    case 'zonesUnlocked': return state.zones.filter(z => z.unlocked).length >= target;
    case 'level': return state.level >= target;
    case 'totalMissionsCompleted': return state.totalMissionsCompleted >= target;
    case 'directorsHired': return state.directors.filter(d => d.hired).length >= target;
    case 'totalResourcesGathered': return state.totalResourcesGathered >= target;
    case 'totalUpgradesResearched': return state.totalUpgradesResearched >= target;
    case 'buildingsBuilt': return state.buildings.filter(b => b.built).length >= target;
    case 'streak': return state.streak >= target;
    case 'totalCoins': return state.totalCoins >= target;
    default: return false;
  }
}

// ---------------------------------------------------------------------------
// Main Hook
// ---------------------------------------------------------------------------

export function useRobotColony() {
  const [state, setState] = useState<RCRobotColonyState>(rcCreateInitialState);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // --- State Accessors ---

  const rcGetState = useCallback((): RCRobotColonyState => stateRef.current, []);

  const rcResetState = useCallback(() => {
    setState(rcCreateInitialState());
  }, []);

  // --- Level & XP ---

  const rcGetLevel = useCallback((): number => stateRef.current.level, []);

  const rcGetTitle = useCallback((): RCTitleInfo => {
    const lvl = stateRef.current.level;
    let best = RC_TITLE_THRESHOLDS[0];
    for (const t of RC_TITLE_THRESHOLDS) {
      if (lvl >= t.levelRequired) best = t;
    }
    return best;
  }, []);

  const rcGetProgress = useCallback((): { current: number; needed: number; percent: number } => {
    const s = stateRef.current;
    const current = s.xp;
    const needed = rcXpForLevel(s.level);
    const percent = needed > 0 ? rcClamp((current / needed) * 100, 0, 100) : 100;
    return { current, needed, percent };
  }, []);

  const rcAddXP = useCallback((amount: number) => {
    setState(prev => {
      let xp = prev.xp + amount;
      let level = prev.level;
      let totalXp = prev.totalXp + amount;
      let coins = prev.coins;
      const levelUpRewards: number[] = [0, 50, 60, 70, 80, 100, 110, 120, 140, 160, 180, 200, 220, 250, 280, 310, 350, 400, 450, 500, 560, 620, 690, 770, 860, 960, 1070, 1190, 1330, 1480, 1640, 1820, 2010, 2220, 2450, 2700, 2970, 3260, 3580, 3920, 4280, 4670, 5090, 5540, 6030, 6560, 7130, 7740, 8400, 9100];

      while (level < RC_MAX_LEVEL && xp >= rcXpForLevel(level)) {
        xp -= rcXpForLevel(level);
        level += 1;
        if (level <= levelUpRewards.length) {
          coins += levelUpRewards[level - 1];
        }
      }
      if (level >= RC_MAX_LEVEL) {
        xp = 0;
      }

      return { ...prev, xp, level, totalXp, coins, totalCoins: prev.totalCoins };
    });
  }, []);

  // --- Coins ---

  const rcGetCoins = useCallback((): number => stateRef.current.coins, []);

  const rcAddCoins = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      coins: prev.coins + amount,
      totalCoins: prev.totalCoins + Math.max(0, amount),
    }));
  }, []);

  const rcSpendCoins = useCallback((amount: number): boolean => {
    if (stateRef.current.coins < amount) return false;
    setState(prev => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }, []);

  // --- Robots ---

  const rcGetRobots = useCallback((): RCRobot[] => stateRef.current.robots, []);

  const rcGetActiveRobot = useCallback((): RCRobot | null => {
    const s = stateRef.current;
    if (!s.activeRobotId) return null;
    return s.robots.find(r => r.id === s.activeRobotId) ?? null;
  }, []);

  const rcBuildRobot = useCallback((roleId: RCRobotRole): RCRobot | null => {
    const def = robotMap.get(roleId);
    if (!def) return null;
    const s = stateRef.current;
    if (s.level < def.unlockLevel) return null;
    if (s.coins < def.cost) return null;

    const robot: RCRobot = {
      id: rcGuid(),
      role: def.id,
      name: def.name,
      level: 1,
      xp: 0,
      hp: def.hp,
      maxHp: def.hp,
      attack: def.attack,
      defense: def.defense,
      speed: def.speed,
      efficiency: def.efficiency,
      zone: null,
      active: true,
      builtAt: Date.now(),
    };

    setState(prev => ({
      ...prev,
      robots: [...prev.robots, robot],
      coins: prev.coins - def.cost,
      totalRobotsBuilt: prev.totalRobotsBuilt + 1,
      activeRobotId: prev.activeRobotId ?? robot.id,
    }));

    return robot;
  }, []);

  const rcSetActiveRobot = useCallback((robotId: string) => {
    setState(prev => ({ ...prev, activeRobotId: robotId }));
  }, []);

  const rcAssignRobotToZone = useCallback((robotId: string, zoneId: RCZoneId | null) => {
    setState(prev => {
      const robot = prev.robots.find(r => r.id === robotId);
      if (!robot) return prev;
      const updatedRobots = prev.robots.map(r =>
        r.id === robotId ? { ...r, zone: zoneId } : r
      );
      return { ...prev, robots: updatedRobots };
    });
  }, []);

  const rcDismissRobot = useCallback((robotId: string): boolean => {
    const s = stateRef.current;
    const robot = s.robots.find(r => r.id === robotId);
    if (!robot) return false;
    const def = robotMap.get(robot.role);
    const refund = def ? Math.floor(def.cost * 0.3) : 0;
    setState(prev => ({
      ...prev,
      robots: prev.robots.filter(r => r.id !== robotId),
      coins: prev.coins + refund,
      activeRobotId: prev.activeRobotId === robotId
        ? (prev.robots.find(r => r.id !== robotId)?.id ?? null)
        : prev.activeRobotId,
    }));
    return true;
  }, []);

  const rcGetRobotDef = useCallback((roleId: RCRobotRole): RCRobotDef | undefined => {
    return robotMap.get(roleId);
  }, []);

  const rcGetRobotCount = useCallback((): number => stateRef.current.robots.length, []);

  const rcGetActiveRobotCount = useCallback((): number =>
    stateRef.current.robots.filter(r => r.active).length, []
  );

  const rcUpgradeRobot = useCallback((robotId: string): boolean => {
    const s = stateRef.current;
    const robot = s.robots.find(r => r.id === robotId);
    if (!robot) return false;
    const cost = robot.level * 50;
    if (s.coins < cost) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - cost,
      robots: prev.robots.map(r => {
        if (r.id !== robotId) return r;
        const newLevel = r.level + 1;
        const def = robotMap.get(r.role);
        const hpMult = 1 + (newLevel - 1) * 0.1;
        const statMult = 1 + (newLevel - 1) * 0.08;
        return {
          ...r,
          level: newLevel,
          maxHp: Math.floor((def?.hp ?? 100) * hpMult),
          hp: Math.floor((def?.hp ?? 100) * hpMult),
          attack: Math.floor((def?.attack ?? 5) * statMult),
          defense: Math.floor((def?.defense ?? 5) * statMult),
          speed: Math.floor((def?.speed ?? 5) * statMult),
          efficiency: (def?.efficiency ?? 1.0) + (newLevel - 1) * 0.05,
          xp: 0,
        };
      }),
    }));
    return true;
  }, []);

  // --- Zones ---

  const rcGetZones = useCallback((): RCZone[] => stateRef.current.zones, []);

  const rcUnlockZone = useCallback((zoneId: RCZoneId): boolean => {
    const s = stateRef.current;
    const def = RC_ZONES.find(z => z.id === zoneId);
    if (!def) return false;
    if (s.zones.find(z => z.id === zoneId)?.unlocked) return false;
    if (s.level < def.unlockLevel) return false;
    if (s.coins < def.unlockCost) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - def.unlockCost,
      zones: prev.zones.map(z =>
        z.id === zoneId ? { ...z, unlocked: true, level: 1, upgradeCost: def.upgradeCostBase } : z
      ),
    }));
    return true;
  }, []);

  const rcUpgradeZone = useCallback((zoneId: RCZoneId): boolean => {
    const s = stateRef.current;
    const zone = s.zones.find(z => z.id === zoneId);
    if (!zone || !zone.unlocked) return false;
    const def = RC_ZONES.find(z => z.id === zoneId);
    if (!def) return false;
    if (zone.level >= def.maxLevel) return false;
    if (s.coins < zone.upgradeCost) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - zone.upgradeCost,
      zones: prev.zones.map(z => {
        if (z.id !== zoneId) return z;
        const newLevel = z.level + 1;
        const newCost = Math.floor(def.upgradeCostBase * Math.pow(def.upgradeCostMult, newLevel));
        const prod: Partial<Record<RCResourceId, number>> = {};
        for (const [key, val] of Object.entries(def.baseProduction)) {
          if (val !== undefined) prod[key as RCResourceId] = val + Math.floor(val * (newLevel - 1) * 0.25);
        }
        return { ...z, level: newLevel, upgradeCost: newCost, productionRate: prod };
      }),
    }));
    return true;
  }, []);

  const rcGetZoneProduction = useCallback((zoneId: RCZoneId): Partial<Record<RCResourceId, number>> => {
    const zone = stateRef.current.zones.find(z => z.id === zoneId);
    if (!zone) return {};
    const robotsInZone = stateRef.current.robots.filter(r => r.zone === zoneId);
    const robotEffMult = robotsInZone.reduce((acc, r) => acc + r.efficiency, 0);
    const prod: Partial<Record<RCResourceId, number>> = {};
    for (const [key, val] of Object.entries(zone.productionRate)) {
      if (val !== undefined) prod[key as RCResourceId] = Math.floor(val * (1 + robotEffMult * 0.1));
    }
    return prod;
  }, []);

  const rcGetTotalProduction = useCallback((): Partial<Record<RCResourceId, number>> => {
    const s = stateRef.current;
    const total: Partial<Record<RCResourceId, number>> = {};
    for (const zone of s.zones) {
      if (!zone.unlocked) continue;
      const zoneProd = rcGetZoneProduction(zone.id);
      for (const [key, val] of Object.entries(zoneProd)) {
        if (val !== undefined) {
          const rk = key as RCResourceId;
          total[rk] = (total[rk] ?? 0) + val;
        }
      }
    }
    // Add building bonuses
    for (const bldg of s.buildings) {
      if (!bldg.built) continue;
      for (const [key, val] of Object.entries(bldg.productionBonus)) {
        if (val !== undefined) {
          const rk = key as RCResourceId;
          total[rk] = (total[rk] ?? 0) + val * bldg.level;
        }
      }
    }
    return total;
  }, [rcGetZoneProduction]);

  // --- Buildings ---

  const rcGetBuildings = useCallback((): RCBuilding[] => stateRef.current.buildings, []);

  const rcBuildStructure = useCallback((buildingId: RCBuildingId): boolean => {
    const s = stateRef.current;
    const def = RC_BUILDINGS.find(b => b.id === buildingId);
    if (!def) return false;
    if (s.level < def.buildLevel) return false;
    if (s.coins < def.coinCost) return false;

    // Check resource costs
    for (const [key, val] of Object.entries(def.cost)) {
      if (val === undefined || val === 0) continue;
      const res = s.resources.find(r => r.id === key);
      if (!res || res.amount < val) return false;
    }

    setState(prev => {
      const newResources = prev.resources.map(r => {
        const cost = def.cost[r.id as keyof typeof def.cost];
        return cost !== undefined ? { ...r, amount: Math.max(0, r.amount - cost) } : r;
      });
      return {
        ...prev,
        coins: prev.coins - def.coinCost,
        resources: newResources,
        buildings: prev.buildings.map(b =>
          b.id === buildingId ? { ...b, built: true, level: 1 } : b
        ),
      };
    });
    return true;
  }, []);

  const rcUpgradeBuilding = useCallback((buildingId: RCBuildingId): boolean => {
    const s = stateRef.current;
    const bldg = s.buildings.find(b => b.id === buildingId);
    if (!bldg || !bldg.built) return false;
    const cost = bldg.level * 200 + 100;
    if (s.coins < cost) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - cost,
      buildings: prev.buildings.map(b =>
        b.id === buildingId ? { ...b, level: b.level + 1 } : b
      ),
    }));
    return true;
  }, []);

  // --- Resources ---

  const rcGetResources = useCallback((): RCResource[] => stateRef.current.resources, []);

  const rcGetResource = useCallback((resourceId: RCResourceId): RCResource | null => {
    return stateRef.current.resources.find(r => r.id === resourceId) ?? null;
  }, []);

  const rcGatherResource = useCallback((resourceId: RCResourceId, amount: number): number => {
    const s = stateRef.current;
    const res = s.resources.find(r => r.id === resourceId);
    if (!res) return 0;
    const actual = rcClamp(amount, 0, res.capacity - res.amount);
    if (actual <= 0) return 0;

    setState(prev => ({
      ...prev,
      resources: prev.resources.map(r =>
        r.id === resourceId ? { ...r, amount: r.amount + actual } : r
      ),
      totalResourcesGathered: prev.totalResourcesGathered + actual,
    }));
    return actual;
  }, []);

  const rcSpendResource = useCallback((resourceId: RCResourceId, amount: number): boolean => {
    const s = stateRef.current;
    const res = s.resources.find(r => r.id === resourceId);
    if (!res || res.amount < amount) return false;

    setState(prev => ({
      ...prev,
      resources: prev.resources.map(r =>
        r.id === resourceId ? { ...r, amount: Math.max(0, r.amount - amount) } : r
      ),
    }));
    return true;
  }, []);

  const rcGetResourceValue = useCallback((resourceId: RCResourceId): number => {
    const def = RC_RESOURCES.find(r => r.id === resourceId);
    return def?.baseValue ?? 0;
  }, []);

  // --- Upgrades ---

  const rcGetUpgrades = useCallback((): RCUpgrade[] => stateRef.current.upgrades, []);

  const rcResearchUpgrade = useCallback((upgradeId: string): boolean => {
    const s = stateRef.current;
    const def = RC_UPGRADES.find(u => u.id === upgradeId);
    if (!def) return false;
    const current = s.upgrades.find(u => u.id === upgradeId);
    if (!current || current.researched) return false;
    if (s.coins < def.cost) return false;
    if (s.level < 5) return false;

    // Check prerequisite
    if (def.requires) {
      const prereq = s.upgrades.find(u => u.id === def.requires);
      if (!prereq || !prereq.researched) return false;
    }

    // Check resource cost
    for (const [key, val] of Object.entries(def.resourceCost)) {
      if (val === undefined || val === 0) continue;
      const res = s.resources.find(r => r.id === key);
      if (!res || res.amount < val) return false;
    }

    setState(prev => {
      const newResources = prev.resources.map(r => {
        const cost = def.resourceCost[r.id as keyof typeof def.resourceCost];
        return cost !== undefined ? { ...r, amount: Math.max(0, r.amount - cost) } : r;
      });
      return {
        ...prev,
        coins: prev.coins - def.cost,
        resources: newResources,
        upgrades: prev.upgrades.map(u =>
          u.id === upgradeId ? { ...u, researched: true, level: 1 } : u
        ),
        totalUpgradesResearched: prev.totalUpgradesResearched + 1,
      };
    });
    return true;
  }, []);

  const rcGetUpgradeEffect = useCallback((effectType: string): number => {
    const s = stateRef.current;
    let total = 0;
    for (const u of s.upgrades) {
      if (u.researched && u.effectType === effectType) {
        total += u.value;
      }
    }
    return total;
  }, []);

  // --- Missions ---

  const rcGetMissions = useCallback((): RCMission[] => stateRef.current.missions, []);

  const rcGetAvailableMissions = useCallback((): RCMission[] => {
    const s = stateRef.current;
    return s.missions.filter(m =>
      m.status === 'available' && m.requiredLevel <= s.level
    );
  }, []);

  const rcAcceptMission = useCallback((missionId: string): boolean => {
    const s = stateRef.current;
    const mission = s.missions.find(m => m.id === missionId);
    if (!mission || mission.status !== 'available') return false;
    if (s.level < mission.requiredLevel) return false;
    if (s.robots.filter(r => r.active).length < mission.requiredRobots) return false;

    // Check director requirement
    if (mission.requiredDirector) {
      const dir = s.directors.find(d => d.id === mission.requiredDirector);
      if (!dir || !dir.hired || !dir.active) return false;
    }

    const now = Date.now();
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m =>
        m.id === missionId
          ? { ...m, status: 'in_progress', startTime: now, progress: 0 }
          : m
      ),
    }));
    return true;
  }, []);

  const rcCompleteMission = useCallback((missionId: string): { success: boolean; reward: { coins: number; xp: number; resources: Partial<Record<RCResourceId, number>> } } => {
    const s = stateRef.current;
    const mission = s.missions.find(m => m.id === missionId);
    if (!mission || mission.status !== 'in_progress') return { success: false, reward: { coins: 0, xp: 0, resources: {} } };

    // Determine success with seed
    const seed = rcDateSeed() + s.tick;
    const roll = mulberry32(seed + missionId.length * 77)();
    const success = roll >= mission.failureChance;

    if (success) {
      setState(prev => ({
        ...prev,
        coins: prev.coins + mission.reward.coins,
        totalCoins: prev.totalCoins + mission.reward.coins,
        missions: prev.missions.map(m =>
          m.id === missionId ? { ...m, status: 'completed', progress: 100 } : m
        ),
        totalMissionsCompleted: prev.totalMissionsCompleted + 1,
        resources: prev.resources.map(r => {
          const gain = mission.reward.resources[r.id];
          if (gain === undefined) return r;
          return { ...r, amount: Math.min(r.capacity, r.amount + gain) };
        }),
        totalResourcesGathered: prev.totalResourcesGathered +
          Object.values(mission.reward.resources).reduce((a, b) => a + (b ?? 0), 0),
      }));
      return { success: true, reward: mission.reward };
    } else {
      setState(prev => ({
        ...prev,
        missions: prev.missions.map(m =>
          m.id === missionId ? { ...m, status: 'failed', progress: 0, startTime: null } : m
        ),
      }));
      return { success: false, reward: { coins: 0, xp: 0, resources: {} } };
    }
  }, []);

  const rcRetryMission = useCallback((missionId: string): boolean => {
    const s = stateRef.current;
    const mission = s.missions.find(m => m.id === missionId);
    if (!mission || (mission.status !== 'failed' && mission.status !== 'completed')) return false;
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m =>
        m.id === missionId ? { ...m, status: 'available', progress: 0, startTime: null } : m
      ),
    }));
    return true;
  }, []);

  const rcGetMissionsByDifficulty = useCallback((difficulty: RCMissionDifficulty): RCMission[] => {
    return stateRef.current.missions.filter(m => m.difficulty === difficulty);
  }, []);

  // --- Directors ---

  const rcGetDirectors = useCallback((): RCDirector[] => stateRef.current.directors, []);

  const rcGetHiredDirectors = useCallback((): RCDirector[] => {
    return stateRef.current.directors.filter(d => d.hired);
  }, []);

  const rcGetActiveDirectors = useCallback((): RCDirector[] => {
    return stateRef.current.directors.filter(d => d.hired && d.active);
  }, []);

  const rcHireDirector = useCallback((directorId: string): boolean => {
    const s = stateRef.current;
    const def = RC_DIRECTORS.find(d => d.id === directorId);
    if (!def) return false;
    if (s.directors.find(d => d.id === directorId)?.hired) return false;
    if (s.level < def.unlockLevel) return false;
    if (s.coins < def.cost) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - def.cost,
      directors: prev.directors.map(d =>
        d.id === directorId ? { ...d, hired: true, active: true } : d
      ),
    }));
    return true;
  }, []);

  const rcToggleDirector = useCallback((directorId: string): boolean => {
    const s = stateRef.current;
    const dir = s.directors.find(d => d.id === directorId);
    if (!dir || !dir.hired) return false;
    setState(prev => ({
      ...prev,
      directors: prev.directors.map(d =>
        d.id === directorId ? { ...d, active: !d.active } : d
      ),
    }));
    return true;
  }, []);

  const rcGetDirectorBonus = useCallback((specialty: RCDirectorSpecialty): number => {
    const s = stateRef.current;
    return s.directors
      .filter(d => d.hired && d.active && d.specialty === specialty)
      .reduce((sum, d) => sum + d.bonus, 0);
  }, []);

  const rcGetColonyMorale = useCallback((): number => {
    const s = stateRef.current;
    const baseMorale = 50;
    const directorMorale = s.directors
      .filter(d => d.hired && d.active)
      .reduce((sum, d) => sum + d.moraleEffect, 0);
    const robotPenalty = Math.max(0, Math.floor((s.robots.filter(r => r.active).length - 10) * -0.5));
    return rcClamp(baseMorale + directorMorale + robotPenalty, 0, 100);
  }, []);

  // --- Achievements ---

  const rcGetAchievements = useCallback((): RCAchievement[] => stateRef.current.achievements, []);

  const rcGetUnlockedAchievements = useCallback((): RCAchievement[] => {
    return stateRef.current.achievements.filter(a => a.unlocked);
  }, []);

  const rcCheckAchievements = useCallback((): RCAchievement[] => {
    const s = stateRef.current;
    const newlyUnlocked: RCAchievement[] = [];

    setState(prev => {
      let coins = prev.coins;
      const updated = prev.achievements.map(a => {
        if (a.unlocked) return a;
        if (!rcEvaluateCondition(a.condition, prev)) return a;
        coins += a.reward.coins;
        newlyUnlocked.push({ ...a, unlocked: true, unlockedAt: Date.now() });
        return { ...a, unlocked: true, unlockedAt: Date.now() };
      });
      return { ...prev, achievements: updated, coins, totalCoins: prev.totalCoins + newlyUnlocked.reduce((s, a) => s + a.reward.coins, 0) };
    });

    return newlyUnlocked;
  }, []);

  // --- Daily Tasks ---

  const rcGetDailyTask = useCallback((): RCDailyTask => stateRef.current.dailyTask, []);

  const rcClaimDailyReward = useCallback((): boolean => {
    const s = stateRef.current;
    if (s.dailyTask.completed) return false;
    if (s.dailyTask.progress < s.dailyTask.target) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins + prev.dailyTask.reward.coins,
      totalCoins: prev.totalCoins + prev.dailyTask.reward.coins,
      dailyTask: { ...prev.dailyTask, completed: true },
      resources: prev.dailyTask.reward.resources
        ? prev.resources.map(r => {
            const gain = prev.dailyTask.reward.resources![r.id];
            if (gain === undefined) return r;
            return { ...r, amount: Math.min(r.capacity, r.amount + gain) };
          })
        : prev.resources,
    }));
    return true;
  }, []);

  const rcAdvanceDailyProgress = useCallback((amount: number = 1) => {
    setState(prev => ({
      ...prev,
      dailyTask: {
        ...prev.dailyTask,
        progress: rcClamp(prev.dailyTask.progress + amount, 0, prev.dailyTask.target),
      },
    }));
  }, []);

  const rcProcessDailyMaintenance = useCallback((): { streakUpdated: boolean; newDay: boolean } => {
    const today = rcTodayStr();
    const s = stateRef.current;
    let newDay = false;
    let streakUpdated = false;

    setState(prev => {
      if (prev.lastDaily === today) return { ...prev, tick: prev.tick + 1 };

      newDay = true;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      let newStreak = prev.lastDaily === yStr ? prev.streak + 1 : 1;
      if (newStreak > prev.streak) streakUpdated = true;

      // Generate new daily task
      const seed = rcDateSeed();
      const dailyIndex = rcSeededInt(seed, 0, RC_DAILY_TASKS.length - 1);
      const dailyTemplate = RC_DAILY_TASKS[dailyIndex];
      const dailyTask: RCDailyTask = { ...dailyTemplate, progress: 0, completed: false };

      // Daily resource tick: add production
      const production = prev.zones.reduce((acc, zone) => {
        if (!zone.unlocked) return acc;
        const zoneProd = zone.productionRate;
        for (const [key, val] of Object.entries(zoneProd)) {
          if (val !== undefined) acc[key as RCResourceId] = (acc[key as RCResourceId] ?? 0) + val;
        }
        return acc;
      }, {} as Partial<Record<RCResourceId, number>>);

      const newResources = prev.resources.map(r => {
        const prod = production[r.id];
        if (prod === undefined || prod <= 0) return r;
        return { ...r, amount: Math.min(r.capacity, r.amount + Math.floor(prod * 0.5)) };
      });

      // Daily robot maintenance cost
      const maintenanceCost = Math.floor(prev.robots.filter(r => r.active).length * 2);
      const adjustedCoins = Math.max(0, prev.coins + 10 - maintenanceCost);

      return {
        ...prev,
        lastDaily: today,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        dailyTask,
        resources: newResources,
        coins: adjustedCoins,
        tick: prev.tick + 1,
      };
    });

    return { streakUpdated, newDay };
  }, []);

  // --- NPCs ---

  const rcGetNpcs = useCallback((): RCNpcDef[] => RC_NPCS, []);

  const rcGetNpcsByZone = useCallback((zoneId: RCZoneId): RCNpcDef[] => {
    return RC_NPCS.filter(n => n.location === zoneId);
  }, []);

  const rcGetNpcDialogue = useCallback((npcId: string): string => {
    const npc = RC_NPCS.find(n => n.id === npcId);
    if (!npc || npc.dialogue.length === 0) return '...';
    const seed = rcDateSeed() + npcId.length * 13;
    const idx = rcSeededInt(seed, 0, npc.dialogue.length - 1);
    return npc.dialogue[idx];
  }, []);

  // --- Stats & Info ---

  const rcGetColonyStats = useCallback((): {
    totalRobots: number;
    activeRobots: number;
    zonesUnlocked: number;
    buildingsBuilt: number;
    upgradesResearched: number;
    directorsHired: number;
    missionsCompleted: number;
    missionsAvailable: number;
    achievementsUnlocked: number;
    totalResources: number;
  } => {
    const s = stateRef.current;
    return {
      totalRobots: s.robots.length,
      activeRobots: s.robots.filter(r => r.active).length,
      zonesUnlocked: s.zones.filter(z => z.unlocked).length,
      buildingsBuilt: s.buildings.filter(b => b.built).length,
      upgradesResearched: s.upgrades.filter(u => u.researched).length,
      directorsHired: s.directors.filter(d => d.hired).length,
      missionsCompleted: s.missions.filter(m => m.status === 'completed').length,
      missionsAvailable: s.missions.filter(m => m.status === 'available' && m.requiredLevel <= s.level).length,
      achievementsUnlocked: s.achievements.filter(a => a.unlocked).length,
      totalResources: s.resources.reduce((sum, r) => sum + r.amount, 0),
    };
  }, []);

  const rcGetRobotPower = useCallback((): number => {
    const s = stateRef.current;
    return s.robots.filter(r => r.active).reduce((sum, r) =>
      sum + r.attack + r.defense + r.speed + r.maxHp, 0
    );
  }, []);

  const rcGetColonyPower = useCallback((): number => {
    const s = stateRef.current;
    const robotPower = s.robots.filter(r => r.active).reduce((sum, r) =>
      sum + r.attack * 2 + r.defense * 2 + r.speed + r.maxHp, 0
    );
    const zoneBonus = s.zones.filter(z => z.unlocked).reduce((sum, z) => sum + z.level * 50, 0);
    const buildingBonus = s.buildings.filter(b => b.built).reduce((sum, b) => sum + b.level * 30, 0);
    const directorBonus = s.directors.filter(d => d.hired && d.active).reduce((sum, d) => sum + d.bonus * 100, 0);
    const upgradeBonus = s.upgrades.filter(u => u.researched).length * 25;
    return robotPower + zoneBonus + buildingBonus + directorBonus + upgradeBonus;
  }, []);

  const rcGetMaintenanceCost = useCallback((): number => {
    return Math.floor(stateRef.current.robots.filter(r => r.active).length * 2);
  }, []);

  const rcGetColonyEfficiency = useCallback((): number => {
    const s = stateRef.current;
    const morale = rcGetColonyMorale();
    const robotEff = s.robots.filter(r => r.active).length > 0
      ? s.robots.filter(r => r.active).reduce((sum, r) => sum + r.efficiency, 0) / s.robots.filter(r => r.active).length
      : 1.0;
    const directorMult = 1 + s.directors.filter(d => d.hired && d.active).reduce((sum, d) => sum + d.bonus * 0.3, 0);
    return rcClamp(robotEff * (0.5 + morale / 100) * directorMult * 100, 0, 200);
  }, [rcGetColonyMorale]);

  // --- Robot combat ---

  const rcSimulateCombat = useCallback((attackerId: string, defenderId: string): { victory: boolean; rounds: number; log: string[] } => {
    const s = stateRef.current;
    const attacker = s.robots.find(r => r.id === attackerId);
    const defender = s.robots.find(r => r.id === defenderId);
    if (!attacker || !defender) return { victory: false, rounds: 0, log: ['Combatants not found.'] };

    const seed = rcDateSeed() + attackerId.length * 31 + defenderId.length * 17 + s.tick;
    const rng = mulberry32(seed);

    let atkHp = attacker.hp;
    let defHp = defender.hp;
    const log: string[] = [];
    let rounds = 0;

    while (atkHp > 0 && defHp > 0 && rounds < 20) {
      rounds++;
      // Attacker strikes
      const atkDmg = Math.max(1, attacker.attack - Math.floor(defender.defense * 0.5) + Math.floor(rng() * attacker.speed * 0.3));
      defHp -= atkDmg;
      log.push(`Round ${rounds}: ${attacker.name} deals ${atkDmg} damage.`);

      if (defHp <= 0) {
        log.push(`${defender.name} defeated!`);
        break;
      }

      // Defender strikes
      const defDmg = Math.max(1, defender.attack - Math.floor(attacker.defense * 0.5) + Math.floor(rng() * defender.speed * 0.3));
      atkHp -= defDmg;
      log.push(`Round ${rounds}: ${defender.name} deals ${defDmg} damage.`);

      if (atkHp <= 0) {
        log.push(`${attacker.name} defeated!`);
        break;
      }
    }

    const victory = defHp <= 0;
    return { victory, rounds, log };
  }, []);

  // --- Trading ---

  const rcGetTradeValue = useCallback((resourceId: RCResourceId, amount: number): number => {
    const def = RC_RESOURCES.find(r => r.id === resourceId);
    const bonus = 1 + rcGetDirectorBonus('economy') + rcGetDirectorBonus('diplomacy') * 0.5;
    return Math.floor((def?.baseValue ?? 0) * amount * bonus);
  }, [rcGetDirectorBonus]);

  const rcSellResources = useCallback((resourceId: RCResourceId, amount: number): { sold: number; coins: number } => {
    const s = stateRef.current;
    const res = s.resources.find(r => r.id === resourceId);
    if (!res) return { sold: 0, coins: 0 };
    const actual = Math.min(amount, res.amount);
    if (actual <= 0) return { sold: 0, coins: 0 };
    const value = rcGetTradeValue(resourceId, actual);

    setState(prev => ({
      ...prev,
      coins: prev.coins + value,
      totalCoins: prev.totalCoins + value,
      resources: prev.resources.map(r =>
        r.id === resourceId ? { ...r, amount: r.amount - actual } : r
      ),
    }));
    return { sold: actual, coins: value };
  }, [rcGetTradeValue]);

  const rcBuyResources = useCallback((resourceId: RCResourceId, amount: number): { bought: number; cost: number } => {
    const def = RC_RESOURCES.find(r => r.id === resourceId);
    if (!def) return { bought: 0, cost: 0 };
    const cost = Math.floor(def.baseValue * amount * 1.5);
    if (stateRef.current.coins < cost) return { bought: 0, cost: 0 };

    const res = stateRef.current.resources.find(r => r.id === resourceId);
    const space = res ? res.capacity - res.amount : amount;
    const actual = Math.min(amount, space);

    setState(prev => ({
      ...prev,
      coins: prev.coins - Math.floor(def.baseValue * actual * 1.5),
      resources: prev.resources.map(r =>
        r.id === resourceId ? { ...r, amount: Math.min(r.capacity, r.amount + actual) } : r
      ),
      totalResourcesGathered: prev.totalResourcesGathered + actual,
    }));
    return { bought: actual, cost };
  }, []);

  // --- Robot naming ---

  const rcRenameRobot = useCallback((robotId: string, newName: string): boolean => {
    if (!newName || newName.trim().length === 0 || newName.length > 30) return false;
    setState(prev => ({
      ...prev,
      robots: prev.robots.map(r =>
        r.id === robotId ? { ...r, name: newName.trim() } : r
      ),
    }));
    return true;
  }, []);

  // --- Simulation tick ---

  const rcTick = useCallback((): void => {
    setState(prev => ({ ...prev, tick: prev.tick + 1 }));
  }, []);

  // --- Streak ---

  const rcGetStreak = useCallback((): number => stateRef.current.streak, []);

  const rcGetBestStreak = useCallback((): number => stateRef.current.bestStreak, []);

  const rcGetLastDaily = useCallback((): string => stateRef.current.lastDaily, []);

  // --- Colony naming ---

  const rcGenerateColonyName = useCallback((): string => {
    const prefixes = ['Nova', 'Titan', 'Quantum', 'Stellar', 'Neon', 'Cyber', 'Astro', 'Pulse', 'Nexus', 'Omega', 'Prism', 'Vortex', 'Zenith', 'Aether', 'Helix'];
    const suffixes = ['Prime', 'Station', 'Base', 'Colony', 'Outpost', 'Haven', 'Fortress', 'Citadel', 'Nexus', 'Core', 'Sanctum', 'Hub', 'Spire', 'Gate', 'Arc'];
    const seed = Date.now();
    const rng = mulberry32(seed);
    const prefix = prefixes[Math.floor(rng() * prefixes.length)];
    const suffix = suffixes[Math.floor(rng() * suffixes.length)];
    return `${prefix} ${suffix}`;
  }, []);

  // --- Resource trading between types ---

  const rcConvertResources = useCallback((fromId: RCResourceId, toId: RCResourceId, amount: number): { converted: number; lost: number } => {
    const fromDef = RC_RESOURCES.find(r => r.id === fromId);
    const toDef = RC_RESOURCES.find(r => r.id === toId);
    if (!fromDef || !toDef || fromId === toId) return { converted: 0, lost: 0 };

    const s = stateRef.current;
    const fromRes = s.resources.find(r => r.id === fromId);
    const toRes = s.resources.find(r => r.id === toId);
    if (!fromRes || !toRes) return { converted: 0, lost: 0 };

    const actual = Math.min(amount, fromRes.amount);
    if (actual <= 0) return { converted: 0, lost: 0 };

    // Conversion rate based on rarity ratio with 30% loss
    const rate = (fromDef.baseValue / toDef.baseValue) * 0.7;
    const gained = Math.floor(actual * rate);
    if (gained <= 0) return { converted: 0, lost: 0 };

    setState(prev => ({
      ...prev,
      resources: prev.resources.map(r => {
        if (r.id === fromId) return { ...r, amount: r.amount - actual };
        if (r.id === toId) return { ...r, amount: Math.min(r.capacity, r.amount + gained) };
        return r;
      }),
    }));
    return { converted: gained, lost: actual - Math.floor(actual * (toDef.baseValue / fromDef.baseValue)) };
  }, []);

  // --- Mission progress helper ---

  const rcUpdateMissionProgress = useCallback((missionId: string, delta: number) => {
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m =>
        m.id === missionId ? { ...m, progress: rcClamp(m.progress + delta, 0, 100) } : m
      ),
    }));
  }, []);

  // --- Get robots by zone ---

  const rcGetRobotsByZone = useCallback((zoneId: RCZoneId): RCRobot[] => {
    return stateRef.current.robots.filter(r => r.zone === zoneId);
  }, []);

  // --- Get zone def ---

  const rcGetZoneDef = useCallback((zoneId: RCZoneId): RCZoneDef | undefined => {
    return RC_ZONES.find(z => z.id === zoneId);
  }, []);

  // --- Get building def ---

  const rcGetBuildingDef = useCallback((buildingId: RCBuildingId): RCBuildingDef | undefined => {
    return RC_BUILDINGS.find(b => b.id === buildingId);
  }, []);

  // --- XP for next level ---

  const rcGetXpToNext = useCallback((): number => {
    return rcXpForLevel(stateRef.current.level);
  }, []);

  // --- Repair robot ---

  const rcRepairRobot = useCallback((robotId: string): boolean => {
    const s = stateRef.current;
    const robot = s.robots.find(r => r.id === robotId);
    if (!robot) return false;
    if (robot.hp >= robot.maxHp) return false;
    const cost = Math.floor((robot.maxHp - robot.hp) * 0.5);
    if (s.coins < cost) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - cost,
      robots: prev.robots.map(r =>
        r.id === robotId ? { ...r, hp: r.maxHp } : r
      ),
    }));
    return true;
  }, []);

  // --- Toggle robot active status ---

  const rcToggleRobot = useCallback((robotId: string): boolean => {
    setState(prev => {
      const robot = prev.robots.find(r => r.id === robotId);
      if (!robot) return prev;
      return {
        ...prev,
        robots: prev.robots.map(r =>
          r.id === robotId ? { ...r, active: !r.active, zone: !r.active ? null : r.zone } : r
        ),
      };
    });
    return true;
  }, []);

  // --- Get robot by id ---

  const rcGetRobotById = useCallback((robotId: string): RCRobot | null => {
    return stateRef.current.robots.find(r => r.id === robotId) ?? null;
  }, []);

  // --- Get mission by id ---

  const rcGetMissionById = useCallback((missionId: string): RCMission | null => {
    return stateRef.current.missions.find(m => m.id === missionId) ?? null;
  }, []);

  // --- Get difficulty color ---

  const rcGetDifficultyColor = useCallback((difficulty: RCMissionDifficulty): string => {
    switch (difficulty) {
      case 'easy': return '#22c55e';
      case 'medium': return '#eab308';
      case 'hard': return '#ef4444';
      case 'elite': return '#a855f7';
      case 'legendary': return '#f97316';
    }
  }, []);

  // --- Get rarity color ---

  const rcGetRarityColor = useCallback((rarity: string): string => {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'uncommon': return '#22C55E';
      case 'rare': return '#3B82F6';
      case 'epic': return '#A855F7';
      case 'legendary': return '#F97316';
      default: return '#9CA3AF';
    }
  }, []);

  // --- Bulk robot deployment ---

  const rcDeployRobotSquad = useCallback((robotIds: string[], zoneId: RCZoneId): number => {
    const zone = stateRef.current.zones.find(z => z.id === zoneId);
    if (!zone || !zone.unlocked) return 0;
    const currentCount = stateRef.current.robots.filter(r => r.zone === zoneId).length;
    const available = zone.maxRobots - currentCount;
    if (available <= 0) return 0;

    const toDeploy = robotIds.slice(0, available).filter(id => {
      const r = stateRef.current.robots.find(rb => rb.id === id);
      return r && r.active && r.zone === null;
    });

    if (toDeploy.length === 0) return 0;

    setState(prev => ({
      ...prev,
      robots: prev.robots.map(r =>
        toDeploy.includes(r.id) ? { ...r, zone: zoneId } : r
      ),
    }));
    return toDeploy.length;
  }, []);

  // --- Recall robots from zone ---

  const rcRecallFromZone = useCallback((zoneId: RCZoneId): number => {
    const count = stateRef.current.robots.filter(r => r.zone === zoneId).length;
    if (count === 0) return 0;

    setState(prev => ({
      ...prev,
      robots: prev.robots.map(r =>
        r.zone === zoneId ? { ...r, zone: null } : r
      ),
    }));
    return count;
  }, []);

  // --- Calculate total defense rating ---

  const rcGetDefenseRating = useCallback((): number => {
    const s = stateRef.current;
    const robotDefense = s.robots.filter(r => r.active && (r.zone === 'defense_grid' || r.role === 'guard' || r.role === 'sentinel' || r.role === 'artillery' || r.role === 'tactician'))
      .reduce((sum, r) => sum + r.defense + r.attack * 0.5, 0);
    const zoneLevel = s.zones.find(z => z.id === 'defense_grid')?.level ?? 0;
    const shieldBuilding = s.buildings.find(b => b.id === 'shield_generator');
    const shieldBonus = shieldBuilding?.built ? shieldBuilding.level * 100 : 0;
    const directorBonus = rcGetDirectorBonus('defense') * 200;
    const upgradeBonus = rcGetUpgradeEffect('defense_mult') * 500;
    return Math.floor(robotDefense + zoneLevel * 50 + shieldBonus + directorBonus + upgradeBonus);
  }, [rcGetDirectorBonus, rcGetUpgradeEffect]);

  // --- Export all as object ---

  return {
    // State
    rcGetState,
    rcResetState,
    // Level & XP
    rcGetLevel,
    rcGetTitle,
    rcGetProgress,
    rcAddXP,
    rcGetXpToNext,
    // Coins
    rcGetCoins,
    rcAddCoins,
    rcSpendCoins,
    // Robots
    rcGetRobots,
    rcGetActiveRobot,
    rcGetRobotById,
    rcGetRobotDef,
    rcGetRobotCount,
    rcGetActiveRobotCount,
    rcGetRobotsByZone,
    rcBuildRobot,
    rcSetActiveRobot,
    rcAssignRobotToZone,
    rcDismissRobot,
    rcUpgradeRobot,
    rcRepairRobot,
    rcRenameRobot,
    rcToggleRobot,
    rcDeployRobotSquad,
    rcRecallFromZone,
    // Zones
    rcGetZones,
    rcGetZoneDef,
    rcGetZoneProduction,
    rcGetTotalProduction,
    rcUnlockZone,
    rcUpgradeZone,
    // Buildings
    rcGetBuildings,
    rcGetBuildingDef,
    rcBuildStructure,
    rcUpgradeBuilding,
    // Resources
    rcGetResources,
    rcGetResource,
    rcGetResourceValue,
    rcGatherResource,
    rcSpendResource,
    rcConvertResources,
    // Upgrades
    rcGetUpgrades,
    rcGetUpgradeEffect,
    rcResearchUpgrade,
    // Missions
    rcGetMissions,
    rcGetMissionById,
    rcGetAvailableMissions,
    rcGetMissionsByDifficulty,
    rcAcceptMission,
    rcCompleteMission,
    rcRetryMission,
    rcUpdateMissionProgress,
    // Directors
    rcGetDirectors,
    rcGetHiredDirectors,
    rcGetActiveDirectors,
    rcHireDirector,
    rcToggleDirector,
    rcGetDirectorBonus,
    rcGetColonyMorale,
    // Achievements
    rcGetAchievements,
    rcGetUnlockedAchievements,
    rcCheckAchievements,
    // Daily
    rcGetDailyTask,
    rcClaimDailyReward,
    rcAdvanceDailyProgress,
    rcProcessDailyMaintenance,
    rcGetStreak,
    rcGetBestStreak,
    rcGetLastDaily,
    // NPCs
    rcGetNpcs,
    rcGetNpcsByZone,
    rcGetNpcDialogue,
    // Stats
    rcGetColonyStats,
    rcGetRobotPower,
    rcGetColonyPower,
    rcGetDefenseRating,
    rcGetMaintenanceCost,
    rcGetColonyEfficiency,
    // Trading
    rcGetTradeValue,
    rcSellResources,
    rcBuyResources,
    // Combat
    rcSimulateCombat,
    // Utility
    rcTick,
    rcGenerateColonyName,
    rcGetDifficultyColor,
    rcGetRarityColor,
  };
}

export default useRobotColony;
