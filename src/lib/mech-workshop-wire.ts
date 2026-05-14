// ============================================================================
// Mech Workshop Wire — Modern Mecha Engineering & Robot Battles
// SSR-safe · React hooks · Fully typed TypeScript
// ============================================================================

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MWRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type MWSlot = 'weapon' | 'shield' | 'core' | 'mobility' | 'sensor';
export type MWBayId = 'assembly' | 'testing' | 'paint' | 'armory' | 'hangar' | 'research' | 'simulation' | 'launch';
export type MWBattlePhase = 'idle' | 'select' | 'combat' | 'result' | 'fled';
export type MWEventType = 'tournament' | 'invasion' | 'expo';
export type MWPartCategory = 'weapon' | 'shield' | 'engine' | 'mobility' | 'sensor' | 'utility';
export type MWSkillType = 'combat' | 'defense' | 'engineering' | 'leadership' | 'tactical';

export interface MWMechStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  energy: number;
  critRate: number;
  critDmg: number;
  evasion: number;
  accuracy: number;
}

export interface MWMechFrameDef {
  id: string;
  name: string;
  rarity: MWRarity;
  cost: number;
  baseStats: MWMechStats;
  description: string;
  requiredLevel: number;
}

export interface MWWorkshopBayDef {
  id: MWBayId;
  name: string;
  description: string;
  unlockLevel: number;
  unlockCost: number;
  maxSlots: number;
  icon: string;
}

export interface MWPartDef {
  id: string;
  name: string;
  category: MWPartCategory;
  slot: MWSlot;
  rarity: MWRarity;
  cost: number;
  stats: Partial<MWMechStats>;
  description: string;
  requiredLevel: number;
}

export interface MWUpgradeModuleDef {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effectPerLevel: Partial<MWMechStats>;
  requiredLevel: number;
}

export interface MWPilotSkillDef {
  id: string;
  name: string;
  description: string;
  type: MWSkillType;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  cooldownBase: number;
  energyCost: number;
  effectPerLevel: Partial<MWMechStats>;
  requiredLevel: number;
}

export interface MWAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXP: number;
  icon: string;
}

export interface MWEventDef {
  id: string;
  name: string;
  type: MWEventType;
  description: string;
  durationHours: number;
  rewardCoins: number;
  rewardXP: number;
  requiredLevel: number;
  icon: string;
}

export interface MWTitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface MWRarityInfo {
  key: MWRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface MWMechState {
  id: string;
  owned: boolean;
  count: number;
  equipped: boolean;
}

export interface MWPartState {
  id: string;
  owned: boolean;
  count: number;
  equipped: boolean;
}

export interface MWUpgradeState {
  id: string;
  owned: boolean;
  level: number;
}

export interface MWSkillState {
  id: string;
  owned: boolean;
  level: number;
}

export interface MWAchievementState {
  id: string;
  unlocked: boolean;
  progress: number;
}

export interface MWBattleRecord {
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  bestStreak: number;
  totalBattles: number;
}

export interface MWDailyChallenge {
  dateKey: string;
  completed: boolean;
  type: string;
  progress: number;
  goal: number;
  rewardCoins: number;
  rewardXP: number;
}

export interface MWEventState {
  id: string;
  joined: boolean;
  progress: number;
  goal: number;
  completed: boolean;
  claimed: boolean;
}

export interface MWBattleState {
  phase: MWBattlePhase;
  opponentIndex: number;
  round: number;
  maxRounds: number;
  playerHP: number;
  playerMaxHP: number;
  opponentHP: number;
  opponentMaxHP: number;
  playerEnergy: number;
  opponentEnergy: number;
  log: string[];
  result: 'win' | 'loss' | 'draw' | null;
  coinsEarned: number;
  xpEarned: number;
}

export interface MWSalvageItem {
  partId: string;
  timestamp: number;
}

export interface MechWorkshopState {
  level: number;
  xp: number;
  coins: number;
  title: string;
  currentBay: MWBayId;
  activeMechId: string;
  mechs: MWMechState[];
  parts: MWPartState[];
  upgrades: MWUpgradeState[];
  skills: MWSkillState[];
  achievements: MWAchievementState[];
  battleStats: MWBattleRecord;
  dailyChallenge: MWDailyChallenge;
  events: MWEventState[];
  salvageQueue: MWSalvageItem[];
  automationLevel: number;
  workshopLevel: number;
  workshopCapacity: number;
  totalMechsBuilt: number;
  totalPartsCrafted: number;
  totalBattlesWon: number;
  totalSalvage: number;
  totalCoinsEarned: number;
  totalXPEarned: number;
  seed: number;
}

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32)
// ---------------------------------------------------------------------------

function mwCreateRNG(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mwXpForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= MW_MAX_LEVEL) return Infinity;
  return Math.floor(150 * level * (1 + level * 0.12));
}

function mwClampLevel(lvl: number): number {
  return Math.max(1, Math.min(MW_MAX_LEVEL, lvl));
}

function mwDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function mwRarityCostMultiplier(r: MWRarity): number {
  const map: Record<MWRarity, number> = { Common: 1, Uncommon: 1.5, Rare: 2.5, Epic: 4, Legendary: 8 };
  return map[r] ?? 1;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MW_MAX_LEVEL = 50;

export const MW_COLORS = {
  steelGray: '#708090',
  neonBlue: '#00BFFF',
  hotOrange: '#FF6600',
  electricYellow: '#FFD700',
  darkIron: '#2F4F4F',
  hologramCyan: '#00FFFF',
};

export const MW_RARITY_INFO: MWRarityInfo[] = [
  { key: 'Common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'Uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'Rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2.5 },
  { key: 'Epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 4 },
  { key: 'Legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 8 },
];

export const MW_TITLES: MWTitleInfo[] = [
  { name: 'Mech Cadet', levelRequired: 1, description: 'A fresh recruit entering the mech engineering academy' },
  { name: 'Junior Mechanic', levelRequired: 5, description: 'Can assemble basic mech frames and perform routine maintenance' },
  { name: 'Field Engineer', levelRequired: 12, description: 'Skilled in battlefield repairs and custom mech modifications' },
  { name: 'Senior Mechanic', levelRequired: 20, description: 'Expert in advanced armor plating and weapons integration' },
  { name: 'Chief Engineer', levelRequired: 28, description: 'Leads entire workshop divisions and designs new mech prototypes' },
  { name: 'Mech Commander', levelRequired: 36, description: 'Commands mech squadrons in high-stakes robot battles' },
  { name: 'Master Architect', levelRequired: 44, description: 'Legendary designer of the most powerful mechs ever built' },
  { name: 'Supreme Mech Architect', levelRequired: 50, description: 'The undisputed master of modern mecha engineering' },
];

export const MW_WORKSHOP_BAYS: MWWorkshopBayDef[] = [
  { id: 'assembly', name: 'Assembly Line', description: 'Main production floor where mech frames are bolted together', unlockLevel: 1, unlockCost: 0, maxSlots: 6, icon: '\u{1F3ED}' },
  { id: 'testing', name: 'Testing Ground', description: 'Stress-test mechs against simulated combat scenarios', unlockLevel: 4, unlockCost: 500, maxSlots: 4, icon: '\u{1F3AF}' },
  { id: 'paint', name: 'Paint Bay', description: 'Customize mech appearance with holographic coatings', unlockLevel: 8, unlockCost: 1200, maxSlots: 3, icon: '\u{1F3A8}' },
  { id: 'armory', name: 'Armory', description: 'Forge and install weapons, shields, and combat systems', unlockLevel: 12, unlockCost: 2500, maxSlots: 6, icon: '\u{1F6E1}\uFE0F' },
  { id: 'hangar', name: 'Hangar', description: 'Store and deploy your growing fleet of combat mechs', unlockLevel: 18, unlockCost: 5000, maxSlots: 10, icon: '\u{1F6EC}' },
  { id: 'research', name: 'Research Lab', description: 'Develop cutting-edge technology and upgrade modules', unlockLevel: 24, unlockCost: 10000, maxSlots: 5, icon: '\u{1F52C}' },
  { id: 'simulation', name: 'Simulation Room', description: 'Run advanced AI battle simulations for training', unlockLevel: 32, unlockCost: 20000, maxSlots: 3, icon: '\u{1F3AE}' },
  { id: 'launch', name: 'Launch Pad', description: 'Deploy mechs to battle arenas and tournament events', unlockLevel: 40, unlockCost: 50000, maxSlots: 4, icon: '\u{1F680}' },
];

export const MW_MECH_FRAMES: MWMechFrameDef[] = [
  // --- Common (8) ---
  { id: 'scout_frame', name: 'Scout Frame', rarity: 'Common', cost: 200, baseStats: { hp: 350, attack: 40, defense: 25, speed: 85, energy: 50, critRate: 12, critDmg: 140, evasion: 18, accuracy: 80 }, description: 'Lightweight reconnaissance frame built for speed and agility.', requiredLevel: 1 },
  { id: 'worker_chassis', name: 'Worker Chassis', rarity: 'Common', cost: 180, baseStats: { hp: 450, attack: 30, defense: 35, speed: 40, energy: 40, critRate: 5, critDmg: 120, evasion: 5, accuracy: 70 }, description: 'Industrial utility chassis with basic armor and lift arms.', requiredLevel: 1 },
  { id: 'sentinel_mk1', name: 'Sentinel Mk.I', rarity: 'Common', cost: 250, baseStats: { hp: 500, attack: 35, defense: 45, speed: 35, energy: 45, critRate: 6, critDmg: 125, evasion: 4, accuracy: 75 }, description: 'Standard patrol mech with balanced defensive capabilities.', requiredLevel: 2 },
  { id: 'striker_frame', name: 'Striker Frame', rarity: 'Common', cost: 220, baseStats: { hp: 380, attack: 55, defense: 20, speed: 60, energy: 50, critRate: 10, critDmg: 150, evasion: 10, accuracy: 78 }, description: 'Offensive frame optimized for rapid melee engagements.', requiredLevel: 2 },
  { id: 'digger_frame', name: 'Digger Frame', rarity: 'Common', cost: 150, baseStats: { hp: 550, attack: 25, defense: 50, speed: 25, energy: 35, critRate: 3, critDmg: 110, evasion: 2, accuracy: 65 }, description: 'Heavy mining frame with reinforced plating and drill arms.', requiredLevel: 1 },
  { id: 'patrol_frame', name: 'Patrol Frame', rarity: 'Common', cost: 200, baseStats: { hp: 400, attack: 40, defense: 30, speed: 55, energy: 45, critRate: 8, critDmg: 135, evasion: 8, accuracy: 78 }, description: 'Versatile patrol unit designed for perimeter security.', requiredLevel: 3 },
  { id: 'cargo_chassis', name: 'Cargo Chassis', rarity: 'Common', cost: 160, baseStats: { hp: 600, attack: 15, defense: 55, speed: 20, energy: 30, critRate: 2, critDmg: 105, evasion: 1, accuracy: 60 }, description: 'Heavy transport chassis with enormous carrying capacity.', requiredLevel: 1 },
  { id: 'recon_frame', name: 'Recon Frame', rarity: 'Common', cost: 230, baseStats: { hp: 320, attack: 35, defense: 20, speed: 90, energy: 55, critRate: 14, critDmg: 145, evasion: 20, accuracy: 82 }, description: 'Ultra-fast reconnaissance frame with advanced sensors.', requiredLevel: 3 },
  // --- Uncommon (7) ---
  { id: 'tank_chassis', name: 'Tank Chassis', rarity: 'Uncommon', cost: 600, baseStats: { hp: 700, attack: 45, defense: 65, speed: 25, energy: 50, critRate: 5, critDmg: 120, evasion: 3, accuracy: 72 }, description: 'Heavy assault chassis with massive armor plating.', requiredLevel: 5 },
  { id: 'stealth_frame', name: 'Stealth Frame', rarity: 'Uncommon', cost: 650, baseStats: { hp: 400, attack: 60, defense: 25, speed: 80, energy: 70, critRate: 18, critDmg: 170, evasion: 22, accuracy: 85 }, description: 'Cloak-capable frame built for covert infiltration missions.', requiredLevel: 6 },
  { id: 'aerial_wing', name: 'Aerial Wing', rarity: 'Uncommon', cost: 700, baseStats: { hp: 350, attack: 50, defense: 20, speed: 95, energy: 60, critRate: 12, critDmg: 150, evasion: 25, accuracy: 80 }, description: 'Flight-capable wing frame with VTOL thruster arrays.', requiredLevel: 7 },
  { id: 'assault_frame', name: 'Assault Frame', rarity: 'Uncommon', cost: 550, baseStats: { hp: 550, attack: 65, defense: 40, speed: 45, energy: 55, critRate: 10, critDmg: 150, evasion: 7, accuracy: 80 }, description: 'Aggressive combat frame packing heavy weapons mounts.', requiredLevel: 5 },
  { id: 'medic_chassis', name: 'Medic Chassis', rarity: 'Uncommon', cost: 500, baseStats: { hp: 500, attack: 20, defense: 45, speed: 50, energy: 80, critRate: 4, critDmg: 115, evasion: 10, accuracy: 85 }, description: 'Support chassis with nano-repair systems and energy shields.', requiredLevel: 8 },
  { id: 'arctic_frame', name: 'Arctic Frame', rarity: 'Uncommon', cost: 580, baseStats: { hp: 520, attack: 50, defense: 50, speed: 40, energy: 55, critRate: 8, critDmg: 140, evasion: 6, accuracy: 78 }, description: 'Cold-weather ops frame with cryo-resistant armor.', requiredLevel: 7 },
  { id: 'desert_frame', name: 'Desert Frame', rarity: 'Uncommon', cost: 560, baseStats: { hp: 480, attack: 55, defense: 35, speed: 60, energy: 50, critRate: 10, critDmg: 145, evasion: 12, accuracy: 82 }, description: 'Sand-sealed frame with heat-resistant cooling systems.', requiredLevel: 6 },
  // --- Rare (6) ---
  { id: 'titan_core', name: 'Titan Core', rarity: 'Rare', cost: 1500, baseStats: { hp: 900, attack: 55, defense: 80, speed: 20, energy: 60, critRate: 6, critDmg: 130, evasion: 2, accuracy: 74 }, description: 'Massive siege frame with devastating heavy weapons platforms.', requiredLevel: 12 },
  { id: 'phantom_frame', name: 'Phantom Frame', rarity: 'Rare', cost: 1400, baseStats: { hp: 420, attack: 70, defense: 30, speed: 92, energy: 80, critRate: 22, critDmg: 180, evasion: 28, accuracy: 90 }, description: 'Advanced stealth frame with optical camouflage technology.', requiredLevel: 14 },
  { id: 'fortress_chassis', name: 'Fortress Chassis', rarity: 'Rare', cost: 1600, baseStats: { hp: 1000, attack: 40, defense: 90, speed: 15, energy: 65, critRate: 4, critDmg: 115, evasion: 1, accuracy: 70 }, description: 'Walking fortress with layered reactive armor systems.', requiredLevel: 13 },
  { id: 'nova_frame', name: 'Nova Frame', rarity: 'Rare', cost: 1350, baseStats: { hp: 550, attack: 75, defense: 45, speed: 70, energy: 85, critRate: 15, critDmg: 165, evasion: 15, accuracy: 88 }, description: 'Energy-channeling frame that converts raw plasma into attacks.', requiredLevel: 15 },
  { id: 'vanguard_mk2', name: 'Vanguard Mk.II', rarity: 'Rare', cost: 1300, baseStats: { hp: 650, attack: 65, defense: 55, speed: 55, energy: 60, critRate: 10, critDmg: 145, evasion: 8, accuracy: 82 }, description: 'Upgraded vanguard class with modular weapon hardpoints.', requiredLevel: 11 },
  { id: 'storm_frame', name: 'Storm Frame', rarity: 'Rare', cost: 1450, baseStats: { hp: 480, attack: 72, defense: 35, speed: 78, energy: 75, critRate: 18, critDmg: 170, evasion: 18, accuracy: 86 }, description: 'Lightning-warfare frame with EMP discharge capabilities.', requiredLevel: 16 },
  // --- Epic (5) ---
  { id: 'omega_frame', name: 'Omega Frame', rarity: 'Epic', cost: 4000, baseStats: { hp: 800, attack: 85, defense: 70, speed: 65, energy: 90, critRate: 16, critDmg: 175, evasion: 14, accuracy: 90 }, description: 'Next-gen frame utilizing quantum computing for tactical analysis.', requiredLevel: 24 },
  { id: 'quantum_shell', name: 'Quantum Shell', rarity: 'Epic', cost: 4500, baseStats: { hp: 650, attack: 90, defense: 55, speed: 80, energy: 100, critRate: 20, critDmg: 190, evasion: 20, accuracy: 92 }, description: 'Phase-shifting shell that can partially exist in another dimension.', requiredLevel: 26 },
  { id: 'behemoth_core', name: 'Behemoth Core', rarity: 'Epic', cost: 4200, baseStats: { hp: 1200, attack: 70, defense: 85, speed: 25, energy: 75, critRate: 8, critDmg: 140, evasion: 4, accuracy: 78 }, description: 'Colossal assault core bristling with heavy weapon batteries.', requiredLevel: 28 },
  { id: 'eclipse_frame', name: 'Eclipse Frame', rarity: 'Epic', cost: 3800, baseStats: { hp: 550, attack: 95, defense: 40, speed: 95, energy: 95, critRate: 25, critDmg: 200, evasion: 30, accuracy: 95 }, description: 'Ultimate stealth infiltrator — virtually undetectable in combat.', requiredLevel: 30 },
  { id: 'guardian_frame', name: 'Guardian Frame', rarity: 'Epic', cost: 4000, baseStats: { hp: 1050, attack: 50, defense: 95, speed: 35, energy: 85, critRate: 5, critDmg: 125, evasion: 8, accuracy: 82 }, description: 'Impenetrable defense frame with energy barrier projection.', requiredLevel: 25 },
  // --- Legendary (5) ---
  { id: 'apex_titan', name: 'Apex Titan', rarity: 'Legendary', cost: 12000, baseStats: { hp: 1500, attack: 100, defense: 90, speed: 45, energy: 110, critRate: 12, critDmg: 180, evasion: 8, accuracy: 88 }, description: 'The ultimate titan — feared across all battle arenas.', requiredLevel: 36 },
  { id: 'void_walker', name: 'Void Walker', rarity: 'Legendary', cost: 11000, baseStats: { hp: 700, attack: 105, defense: 50, speed: 100, energy: 120, critRate: 28, critDmg: 210, evasion: 35, accuracy: 98 }, description: 'Dimension-hopping assassin that strikes from between realities.', requiredLevel: 38 },
  { id: 'singularity_core', name: 'Singularity Core', rarity: 'Legendary', cost: 13000, baseStats: { hp: 1800, attack: 95, defense: 100, speed: 30, energy: 130, critRate: 10, critDmg: 170, evasion: 5, accuracy: 85 }, description: 'Powered by a controlled singularity — the pinnacle of mech power.', requiredLevel: 42 },
  { id: 'neural_sovereign', name: 'Neural Sovereign', rarity: 'Legendary', cost: 12500, baseStats: { hp: 900, attack: 110, defense: 70, speed: 85, energy: 150, critRate: 22, critDmg: 200, evasion: 22, accuracy: 95 }, description: 'AI-piloted sovereign frame with adaptive combat intelligence.', requiredLevel: 45 },
  { id: 'genesis_prime', name: 'Genesis Prime', rarity: 'Legendary', cost: 15000, baseStats: { hp: 2000, attack: 120, defense: 110, speed: 50, energy: 150, critRate: 15, critDmg: 200, evasion: 10, accuracy: 92 }, description: 'The original mech blueprint — said to be the first ever built.', requiredLevel: 50 },
];

export const MW_PARTS: MWPartDef[] = [
  // --- Weapons (10) ---
  { id: 'plasma_cannon', name: 'Plasma Cannon', category: 'weapon', slot: 'weapon', rarity: 'Common', cost: 150, stats: { attack: 15, energy: -5 }, description: 'Standard plasma projector with decent damage output.', requiredLevel: 1 },
  { id: 'energy_shield_gen', name: 'Energy Shield Generator', category: 'shield', slot: 'shield', rarity: 'Common', cost: 120, stats: { defense: 12, hp: 20 }, description: 'Basic energy barrier that absorbs incoming damage.', requiredLevel: 1 },
  { id: 'rocket_fist', name: 'Rocket Fist', category: 'weapon', slot: 'weapon', rarity: 'Common', cost: 180, stats: { attack: 20, speed: -5, critDmg: 10 }, description: 'Rocket-powered punch for devastating melee strikes.', requiredLevel: 2 },
  { id: 'laser_blade', name: 'Laser Blade', category: 'weapon', slot: 'weapon', rarity: 'Uncommon', cost: 400, stats: { attack: 30, critRate: 5, speed: 5 }, description: 'High-frequency energy sword that cuts through armor.', requiredLevel: 5 },
  { id: 'thunder_hammer', name: 'Thunder Hammer', category: 'weapon', slot: 'weapon', rarity: 'Rare', cost: 1000, stats: { attack: 50, critDmg: 30, speed: -8 }, description: 'Shockwave-generating hammer that damages area targets.', requiredLevel: 12 },
  { id: 'rail_gun', name: 'Rail Gun', category: 'weapon', slot: 'weapon', rarity: 'Rare', cost: 1200, stats: { attack: 45, accuracy: 15, critRate: 8 }, description: 'Electromagnetic accelerator firing hypersonic projectiles.', requiredLevel: 14 },
  { id: 'pulse_rifle', name: 'Pulse Rifle', category: 'weapon', slot: 'weapon', rarity: 'Common', cost: 160, stats: { attack: 12, accuracy: 8 }, description: 'Rapid-fire pulse weapon with consistent damage.', requiredLevel: 1 },
  { id: 'gauss_rifle', name: 'Gauss Rifle', category: 'weapon', slot: 'weapon', rarity: 'Uncommon', cost: 500, stats: { attack: 35, accuracy: 12, critRate: 5 }, description: 'Magnetic coil rifle with exceptional penetration power.', requiredLevel: 7 },
  { id: 'beam_saber', name: 'Beam Saber', category: 'weapon', slot: 'weapon', rarity: 'Epic', cost: 3000, stats: { attack: 70, critRate: 12, critDmg: 40, speed: 10 }, description: 'Focused plasma blade that melts through any armor.', requiredLevel: 24 },
  { id: 'nova_cannon', name: 'Nova Cannon', category: 'weapon', slot: 'weapon', rarity: 'Legendary', cost: 8000, stats: { attack: 100, critRate: 10, critDmg: 50, energy: -10 }, description: 'Star-powered cannon that unleashes miniature supernovae.', requiredLevel: 38 },
  // --- Shields (6) ---
  { id: 'nano_shield', name: 'Nano Shield', category: 'shield', slot: 'shield', rarity: 'Uncommon', cost: 350, stats: { defense: 25, hp: 40 }, description: 'Self-repairing nano-particle barrier system.', requiredLevel: 5 },
  { id: 'titan_armor', name: 'Titan Armor', category: 'shield', slot: 'shield', rarity: 'Rare', cost: 1100, stats: { defense: 45, hp: 80, speed: -5 }, description: 'Ultra-dense armor plating forged from titanium alloys.', requiredLevel: 12 },
  { id: 'phase_barrier', name: 'Phase Barrier', category: 'shield', slot: 'shield', rarity: 'Epic', cost: 2800, stats: { defense: 60, evasion: 15, energy: 10 }, description: 'Dimensional barrier that shifts attacks between realities.', requiredLevel: 25 },
  { id: 'fortress_wall', name: 'Fortress Wall', category: 'shield', slot: 'shield', rarity: 'Rare', cost: 1000, stats: { defense: 40, hp: 100, critRate: -3 }, description: 'Deployable fortress wall for maximum physical protection.', requiredLevel: 13 },
  { id: 'hologram_shield', name: 'Hologram Shield', category: 'shield', slot: 'shield', rarity: 'Uncommon', cost: 380, stats: { defense: 20, evasion: 10 }, description: 'Hard-light holographic shield that confuses enemy targeting.', requiredLevel: 6 },
  { id: 'aegis_prime', name: 'Aegis Prime', category: 'shield', slot: 'shield', rarity: 'Legendary', cost: 7500, stats: { defense: 80, hp: 150, energy: 20 }, description: 'Ultimate shield system powered by an ancient energy matrix.', requiredLevel: 40 },
  // --- Engines/Cores (6) ---
  { id: 'fusion_core', name: 'Fusion Core', category: 'engine', slot: 'core', rarity: 'Common', cost: 140, stats: { energy: 15, hp: 20 }, description: 'Compact fusion reactor for basic energy needs.', requiredLevel: 1 },
  { id: 'quantum_reactor', name: 'Quantum Reactor', category: 'engine', slot: 'core', rarity: 'Rare', cost: 1200, stats: { energy: 40, attack: 10, defense: 10 }, description: 'Quantum-state energy source with balanced power output.', requiredLevel: 13 },
  { id: 'dark_matter_core', name: 'Dark Matter Core', category: 'engine', slot: 'core', rarity: 'Epic', cost: 3200, stats: { energy: 60, hp: 50, critRate: 5 }, description: 'Harnesses dark matter for massive sustained energy output.', requiredLevel: 26 },
  { id: 'antimatter_cell', name: 'Antimatter Cell', category: 'engine', slot: 'core', rarity: 'Uncommon', cost: 450, stats: { energy: 30, attack: 5, defense: 5 }, description: 'Antimatter annihilation engine for reliable power.', requiredLevel: 6 },
  { id: 'void_reactor', name: 'Void Reactor', category: 'engine', slot: 'core', rarity: 'Legendary', cost: 9000, stats: { energy: 100, hp: 80, attack: 15, defense: 15 }, description: 'Draws infinite energy from the void between dimensions.', requiredLevel: 42 },
  { id: 'plasma_cell', name: 'Plasma Cell', category: 'engine', slot: 'core', rarity: 'Uncommon', cost: 380, stats: { energy: 22, speed: 5 }, description: 'High-output plasma battery for sustained operations.', requiredLevel: 4 },
  // --- Mobility (6) ---
  { id: 'thruster_pack', name: 'Thruster Pack', category: 'mobility', slot: 'mobility', rarity: 'Common', cost: 130, stats: { speed: 12, evasion: 5 }, description: 'Basic ion thruster assembly for increased mobility.', requiredLevel: 1 },
  { id: 'gravity_boots', name: 'Gravity Boots', category: 'mobility', slot: 'mobility', rarity: 'Uncommon', cost: 400, stats: { speed: 18, evasion: 8, hp: 15 }, description: 'Anti-gravity locomotion system for superior maneuvering.', requiredLevel: 5 },
  { id: 'warp_drive', name: 'Warp Drive', category: 'mobility', slot: 'mobility', rarity: 'Rare', cost: 1100, stats: { speed: 30, evasion: 15, accuracy: 5 }, description: 'Short-range warp system for teleport-like dashes.', requiredLevel: 12 },
  { id: 'hover_jets', name: 'Hover Jets', category: 'mobility', slot: 'mobility', rarity: 'Common', cost: 150, stats: { speed: 10, evasion: 4, accuracy: 3 }, description: 'Magnetic hover pads for smooth traversal over terrain.', requiredLevel: 1 },
  { id: 'phase_engine', name: 'Phase Engine', category: 'mobility', slot: 'mobility', rarity: 'Epic', cost: 3000, stats: { speed: 45, evasion: 25, critRate: 5 }, description: 'Phase-shifting engine that allows passing through solid matter.', requiredLevel: 28 },
  { id: 'infinity_glide', name: 'Infinity Glide', category: 'mobility', slot: 'mobility', rarity: 'Legendary', cost: 7000, stats: { speed: 70, evasion: 35, accuracy: 15 }, description: 'Dimensional glide system that ignores all terrain obstacles.', requiredLevel: 40 },
  // --- Sensors (6) ---
  { id: 'tactical_radar', name: 'Tactical Radar', category: 'sensor', slot: 'sensor', rarity: 'Common', cost: 120, stats: { accuracy: 8, critRate: 3 }, description: 'Standard-range tactical radar for target acquisition.', requiredLevel: 1 },
  { id: 'infrared_scanner', name: 'Infrared Scanner', category: 'sensor', slot: 'sensor', rarity: 'Uncommon', cost: 380, stats: { accuracy: 15, critRate: 5, evasion: 3 }, description: 'Heat signature detection system for hidden targets.', requiredLevel: 5 },
  { id: 'neural_link', name: 'Neural Link', category: 'sensor', slot: 'sensor', rarity: 'Rare', cost: 1000, stats: { accuracy: 25, critRate: 8, energy: 10 }, description: 'Direct neural interface for instant targeting and reaction.', requiredLevel: 13 },
  { id: 'sonar_array', name: 'Deep Sonar Array', category: 'sensor', slot: 'sensor', rarity: 'Common', cost: 100, stats: { accuracy: 10, evasion: 3 }, description: 'Sonar-based detection for enclosed environments.', requiredLevel: 1 },
  { id: 'psi_array', name: 'Psionic Array', category: 'sensor', slot: 'sensor', rarity: 'Epic', cost: 2600, stats: { accuracy: 35, critRate: 12, critDmg: 15 }, description: 'Psionic wave detector that predicts enemy movements.', requiredLevel: 24 },
  { id: 'omniscient_eye', name: 'Omniscient Eye', category: 'sensor', slot: 'sensor', rarity: 'Legendary', cost: 6500, stats: { accuracy: 50, critRate: 15, critDmg: 25, evasion: 10 }, description: 'All-knowing sensor core that perceives every battlefield variable.', requiredLevel: 38 },
];

export const MW_UPGRADE_MODULES: MWUpgradeModuleDef[] = [
  { id: 'reactor_core', name: 'Reactor Core', description: 'Upgrades base energy capacity and HP regeneration.', maxLevel: 10, baseCost: 200, costMultiplier: 1.5, effectPerLevel: { energy: 5, hp: 10 }, requiredLevel: 1 },
  { id: 'servo_arms', name: 'Servo Arms', description: 'Enhances melee attack power and grip strength.', maxLevel: 10, baseCost: 200, costMultiplier: 1.5, effectPerLevel: { attack: 4, critDmg: 2 }, requiredLevel: 1 },
  { id: 'thruster_pack_mod', name: 'Thruster Pack Mod', description: 'Improves movement speed and evasion capability.', maxLevel: 10, baseCost: 200, costMultiplier: 1.5, effectPerLevel: { speed: 3, evasion: 2 }, requiredLevel: 1 },
  { id: 'ai_chip', name: 'AI Chip', description: 'Advanced targeting AI improves accuracy and crit rate.', maxLevel: 10, baseCost: 300, costMultiplier: 1.5, effectPerLevel: { accuracy: 2, critRate: 1 }, requiredLevel: 5 },
  { id: 'nano_repair', name: 'Nano Repair', description: 'Nanobots repair damage during combat.', maxLevel: 10, baseCost: 350, costMultiplier: 1.6, effectPerLevel: { hp: 20, defense: 2 }, requiredLevel: 8 },
  { id: 'shield_amplifier', name: 'Shield Amplifier', description: 'Boosts energy shield strength and durability.', maxLevel: 10, baseCost: 300, costMultiplier: 1.5, effectPerLevel: { defense: 4, hp: 15 }, requiredLevel: 5 },
  { id: 'cooling_system', name: 'Cooling System', description: 'Prevents overheating, improves sustained fire rate.', maxLevel: 8, baseCost: 250, costMultiplier: 1.5, effectPerLevel: { attack: 3, speed: 2 }, requiredLevel: 3 },
  { id: 'overclocker', name: 'Overclocker', description: 'Pushes mech systems beyond safe limits for burst power.', maxLevel: 8, baseCost: 400, costMultiplier: 1.6, effectPerLevel: { attack: 5, critRate: 1, speed: 1 }, requiredLevel: 10 },
  { id: 'hull_plating', name: 'Hull Plating', description: 'Additional armor layers increase raw HP.', maxLevel: 10, baseCost: 200, costMultiplier: 1.4, effectPerLevel: { hp: 30, defense: 1 }, requiredLevel: 2 },
  { id: 'targeting_computer', name: 'Targeting Computer', description: 'Precision targeting system for ranged combat.', maxLevel: 10, baseCost: 350, costMultiplier: 1.5, effectPerLevel: { accuracy: 3, critDmg: 3 }, requiredLevel: 7 },
  { id: 'energy_capacitor', name: 'Energy Capacitor', description: 'Larger energy reserves for more ability usage.', maxLevel: 10, baseCost: 280, costMultiplier: 1.5, effectPerLevel: { energy: 8 }, requiredLevel: 4 },
  { id: 'stealth_field', name: 'Stealth Field', description: 'Active camouflage reduces enemy detection.', maxLevel: 8, baseCost: 450, costMultiplier: 1.7, effectPerLevel: { evasion: 3, speed: 1 }, requiredLevel: 12 },
  { id: 'gyro_stabilizer', name: 'Gyro Stabilizer', description: 'Improves balance and accuracy during movement.', maxLevel: 10, baseCost: 220, costMultiplier: 1.5, effectPerLevel: { accuracy: 2, defense: 2 }, requiredLevel: 3 },
  { id: 'power_conduit', name: 'Power Conduit', description: 'Optimizes power flow to all weapon systems.', maxLevel: 10, baseCost: 260, costMultiplier: 1.5, effectPerLevel: { attack: 3, energy: 3 }, requiredLevel: 6 },
  { id: 'reactive_armor', name: 'Reactive Armor', description: 'Armor that adapts to incoming damage types.', maxLevel: 8, baseCost: 500, costMultiplier: 1.7, effectPerLevel: { defense: 5, hp: 10 }, requiredLevel: 15 },
  { id: 'quantum_lock', name: 'Quantum Lock', description: 'Quantum-entangled stabilizer for perfect accuracy.', maxLevel: 8, baseCost: 600, costMultiplier: 1.8, effectPerLevel: { accuracy: 4, critRate: 2 }, requiredLevel: 18 },
  { id: 'magnetosphere', name: 'Magnetosphere', description: 'Magnetic field deflects energy-based attacks.', maxLevel: 6, baseCost: 700, costMultiplier: 1.8, effectPerLevel: { defense: 8, evasion: 2 }, requiredLevel: 20 },
  { id: 'warp_modulator', name: 'Warp Modulator', description: 'Enhances warp drive for faster phase transitions.', maxLevel: 6, baseCost: 800, costMultiplier: 1.9, effectPerLevel: { speed: 5, evasion: 4 }, requiredLevel: 22 },
  { id: 'neural_mesh', name: 'Neural Mesh', description: 'Expands pilot neural bandwidth for faster reactions.', maxLevel: 8, baseCost: 550, costMultiplier: 1.7, effectPerLevel: { speed: 2, accuracy: 2, critRate: 1 }, requiredLevel: 16 },
  { id: 'void_absorber', name: 'Void Absorber', description: 'Absorbs dimensional energy to boost all systems.', maxLevel: 5, baseCost: 1200, costMultiplier: 2.0, effectPerLevel: { attack: 5, defense: 5, hp: 20, energy: 10 }, requiredLevel: 30 },
  { id: 'chrono_matrix', name: 'Chrono Matrix', description: 'Temporal acceleration module for lightning reactions.', maxLevel: 5, baseCost: 1500, costMultiplier: 2.0, effectPerLevel: { speed: 8, evasion: 5, accuracy: 3 }, requiredLevel: 35 },
  { id: 'singularity_cell', name: 'Singularity Cell', description: 'Miniature singularity provides near-infinite energy.', maxLevel: 5, baseCost: 2000, costMultiplier: 2.2, effectPerLevel: { energy: 20, attack: 8, defense: 5 }, requiredLevel: 40 },
  { id: 'dark_matter_infuser', name: 'Dark Matter Infuser', description: 'Infuses mech frame with dark matter for unmatched stats.', maxLevel: 5, baseCost: 2500, costMultiplier: 2.3, effectPerLevel: { hp: 50, defense: 8, critDmg: 10 }, requiredLevel: 45 },
  { id: 'genesis_protocol', name: 'Genesis Protocol', description: 'The original upgrade protocol from the Genesis Blueprint.', maxLevel: 3, baseCost: 5000, costMultiplier: 2.5, effectPerLevel: { hp: 80, attack: 12, defense: 10, speed: 8, energy: 15 }, requiredLevel: 48 },
];

export const MW_PILOT_SKILLS: MWPilotSkillDef[] = [
  { id: 'precision_strike', name: 'Precision Strike', description: 'Focus all power into a single devastating hit.', type: 'combat', maxLevel: 10, baseCost: 200, costMultiplier: 1.5, cooldownBase: 3, energyCost: 20, effectPerLevel: { attack: 5, accuracy: 2 }, requiredLevel: 1 },
  { id: 'shield_wall', name: 'Shield Wall', description: 'Deploy maximum shield energy for absolute defense.', type: 'defense', maxLevel: 10, baseCost: 200, costMultiplier: 1.5, cooldownBase: 3, energyCost: 18, effectPerLevel: { defense: 6, hp: 15 }, requiredLevel: 1 },
  { id: 'overclock', name: 'Overclock', description: 'Push all systems beyond rated limits temporarily.', type: 'tactical', maxLevel: 8, baseCost: 300, costMultiplier: 1.6, cooldownBase: 5, energyCost: 30, effectPerLevel: { speed: 3, attack: 3, critRate: 1 }, requiredLevel: 5 },
  { id: 'emergency_evade', name: 'Emergency Evade', description: 'Execute a last-second dodge with afterburners.', type: 'defense', maxLevel: 10, baseCost: 180, costMultiplier: 1.5, cooldownBase: 2, energyCost: 12, effectPerLevel: { evasion: 4, speed: 2 }, requiredLevel: 2 },
  { id: 'rapid_fire', name: 'Rapid Fire', description: 'Increase fire rate for a barrage of attacks.', type: 'combat', maxLevel: 8, baseCost: 250, costMultiplier: 1.5, cooldownBase: 4, energyCost: 25, effectPerLevel: { attack: 4, critRate: 1 }, requiredLevel: 4 },
  { id: 'energy_surge', name: 'Energy Surge', description: 'Channel raw energy to boost all systems.', type: 'tactical', maxLevel: 10, baseCost: 280, costMultiplier: 1.5, cooldownBase: 5, energyCost: 15, effectPerLevel: { energy: 8, attack: 2, defense: 2 }, requiredLevel: 6 },
  { id: 'counterattack', name: 'Counterattack', description: 'Absorb incoming blow and deliver a devastating counter.', type: 'combat', maxLevel: 8, baseCost: 350, costMultiplier: 1.6, cooldownBase: 4, energyCost: 22, effectPerLevel: { attack: 6, defense: 3, critDmg: 3 }, requiredLevel: 8 },
  { id: 'nano_repair_skill', name: 'Nano Repair', description: 'Deploy repair nanobots to restore mech HP.', type: 'defense', maxLevel: 10, baseCost: 220, costMultiplier: 1.5, cooldownBase: 4, energyCost: 20, effectPerLevel: { hp: 25 }, requiredLevel: 3 },
  { id: 'target_lock', name: 'Target Lock', description: 'Lock onto enemy for guaranteed accuracy boost.', type: 'tactical', maxLevel: 8, baseCost: 200, costMultiplier: 1.5, cooldownBase: 2, energyCost: 10, effectPerLevel: { accuracy: 4, critRate: 1 }, requiredLevel: 3 },
  { id: 'berserker_mode', name: 'Berserker Mode', description: 'Enter rage mode trading defense for massive attack.', type: 'combat', maxLevel: 6, baseCost: 500, costMultiplier: 1.8, cooldownBase: 6, energyCost: 35, effectPerLevel: { attack: 10, critDmg: 5, defense: -3 }, requiredLevel: 12 },
  { id: 'fortify', name: 'Fortify', description: 'Enter fortified stance with massive defense boost.', type: 'defense', maxLevel: 8, baseCost: 400, costMultiplier: 1.6, cooldownBase: 5, energyCost: 25, effectPerLevel: { defense: 8, hp: 20 }, requiredLevel: 10 },
  { id: 'scan_weakness', name: 'Scan Weakness', description: 'Analyze enemy to reveal and exploit weak points.', type: 'tactical', maxLevel: 8, baseCost: 300, costMultiplier: 1.5, cooldownBase: 3, energyCost: 15, effectPerLevel: { critRate: 2, accuracy: 3 }, requiredLevel: 7 },
  { id: 'charge_attack', name: 'Charge Attack', description: 'Rush forward with unstoppable momentum.', type: 'combat', maxLevel: 8, baseCost: 350, costMultiplier: 1.6, cooldownBase: 4, energyCost: 28, effectPerLevel: { attack: 7, speed: 2, critDmg: 2 }, requiredLevel: 9 },
  { id: 'decoy_deploy', name: 'Decoy Deploy', description: 'Launch holographic decoy to confuse enemies.', type: 'tactical', maxLevel: 6, baseCost: 400, costMultiplier: 1.7, cooldownBase: 5, energyCost: 22, effectPerLevel: { evasion: 6, accuracy: 2 }, requiredLevel: 14 },
  { id: 'system_override', name: 'System Override', description: 'Hack enemy systems to disable weapons temporarily.', type: 'tactical', maxLevel: 6, baseCost: 600, costMultiplier: 1.8, cooldownBase: 7, energyCost: 40, effectPerLevel: { attack: 5, accuracy: 4, speed: 2 }, requiredLevel: 18 },
  { id: 'emp_blast', name: 'EMP Blast', description: 'Disable all nearby electronics with an EMP pulse.', type: 'combat', maxLevel: 6, baseCost: 550, costMultiplier: 1.8, cooldownBase: 6, energyCost: 35, effectPerLevel: { attack: 8, critRate: 2, defense: -2 }, requiredLevel: 16 },
  { id: 'warp_strike', name: 'Warp Strike', description: 'Teleport behind enemy for a devastating backstab.', type: 'combat', maxLevel: 6, baseCost: 700, costMultiplier: 1.9, cooldownBase: 5, energyCost: 40, effectPerLevel: { attack: 10, critRate: 3, evasion: 3 }, requiredLevel: 20 },
  { id: 'last_stand', name: 'Last Stand', description: 'Gain massive power when HP drops below critical.', type: 'leadership', maxLevel: 5, baseCost: 800, costMultiplier: 2.0, cooldownBase: 8, energyCost: 0, effectPerLevel: { attack: 15, defense: 10, critDmg: 8 }, requiredLevel: 25 },
  { id: 'orbital_strike', name: 'Orbital Strike', description: 'Call down an orbital laser bombardment on enemies.', type: 'combat', maxLevel: 5, baseCost: 1000, costMultiplier: 2.0, cooldownBase: 10, energyCost: 60, effectPerLevel: { attack: 20, critDmg: 10, accuracy: 5 }, requiredLevel: 30 },
  { id: 'quantum_heal', name: 'Quantum Heal', description: 'Rewind time on your mech to restore previous state.', type: 'defense', maxLevel: 5, baseCost: 900, costMultiplier: 2.0, cooldownBase: 8, energyCost: 50, effectPerLevel: { hp: 60, defense: 5 }, requiredLevel: 28 },
  { id: 'omega_protocol', name: 'Omega Protocol', description: 'The ultimate skill — transforms mech into an unstoppable force.', type: 'leadership', maxLevel: 3, baseCost: 3000, costMultiplier: 2.5, cooldownBase: 15, energyCost: 100, effectPerLevel: { attack: 25, defense: 20, speed: 10, critRate: 5, critDmg: 15 }, requiredLevel: 40 },
];

export const MW_ACHIEVEMENTS: MWAchievementDef[] = [
  { id: 'ach_first_build', name: 'First Assembly', description: 'Build your first mech frame.', conditionKey: 'totalMechsBuilt', targetValue: 1, rewardCoins: 100, rewardXP: 50, icon: '\u{1F527}' },
  { id: 'ach_5_mechs', name: 'Mech Collector', description: 'Own 5 different mech frames.', conditionKey: 'ownedMechs', targetValue: 5, rewardCoins: 300, rewardXP: 150, icon: '\u{1F3ED}' },
  { id: 'ach_10_mechs', name: 'Fleet Commander', description: 'Own 10 different mech frames.', conditionKey: 'ownedMechs', targetValue: 10, rewardCoins: 800, rewardXP: 400, icon: '\u{1F680}' },
  { id: 'ach_15_parts', name: 'Arsenal Master', description: 'Collect 15 different parts.', conditionKey: 'ownedParts', targetValue: 15, rewardCoins: 500, rewardXP: 250, icon: '\u{1F6E1}\uFE0F' },
  { id: 'ach_first_win', name: 'Battle Victor', description: 'Win your first battle.', conditionKey: 'totalBattlesWon', targetValue: 1, rewardCoins: 200, rewardXP: 100, icon: '\u{1F3C6}' },
  { id: 'ach_10_wins', name: 'Arena Champion', description: 'Win 10 battles.', conditionKey: 'totalBattlesWon', targetValue: 10, rewardCoins: 600, rewardXP: 300, icon: '\u{2694}\uFE0F' },
  { id: 'ach_25_wins', name: 'Warlord', description: 'Win 25 battles.', conditionKey: 'totalBattlesWon', targetValue: 25, rewardCoins: 1500, rewardXP: 750, icon: '\u{1F451}' },
  { id: 'ach_5_streak', name: 'Unstoppable', description: 'Achieve a 5-battle win streak.', conditionKey: 'bestStreak', targetValue: 5, rewardCoins: 400, rewardXP: 200, icon: '\u{1F525}' },
  { id: 'ach_10_streak', name: 'Legendary Streak', description: 'Achieve a 10-battle win streak.', conditionKey: 'bestStreak', targetValue: 10, rewardCoins: 1200, rewardXP: 600, icon: '\u{26A1}' },
  { id: 'ach_max_mech', name: 'Max Power', description: 'Fully upgrade any mech with all parts.', conditionKey: 'maxMechPower', targetValue: 1, rewardCoins: 1000, rewardXP: 500, icon: '\u{1F4AA}' },
  { id: 'ach_all_bays', name: 'Full Workshop', description: 'Unlock all 8 workshop bays.', conditionKey: 'unlockedBays', targetValue: 8, rewardCoins: 2000, rewardXP: 1000, icon: '\u{1F3E0}' },
  { id: 'ach_salvage_50', name: 'Salvage King', description: 'Salvage 50 parts from the salvage queue.', conditionKey: 'totalSalvage', targetValue: 50, rewardCoins: 800, rewardXP: 400, icon: '\u{267B}\uFE0F' },
  { id: 'ach_level_25', name: 'Veteran Engineer', description: 'Reach level 25.', conditionKey: 'level', targetValue: 25, rewardCoins: 1000, rewardXP: 500, icon: '\u{1F396}\uFE0F' },
  { id: 'ach_level_50', name: 'Supreme Architect', description: 'Reach the maximum level of 50.', conditionKey: 'level', targetValue: 50, rewardCoins: 5000, rewardXP: 2500, icon: '\u{1F451}' },
  { id: 'ach_daily_7', name: 'Dedicated Worker', description: 'Complete 7 daily challenges.', conditionKey: 'dailiesCompleted', targetValue: 7, rewardCoins: 700, rewardXP: 350, icon: '\u{1F4C5}' },
  { id: 'ach_auto_max', name: 'Full Automation', description: 'Upgrade workshop automation to max level.', conditionKey: 'automationMax', targetValue: 10, rewardCoins: 2000, rewardXP: 1000, icon: '\u{1F916}' },
  { id: 'ach_5_upgrades', name: 'Module Expert', description: 'Purchase and upgrade 5 different modules.', conditionKey: 'ownedUpgrades', targetValue: 5, rewardCoins: 400, rewardXP: 200, icon: '\u{1F50C}' },
  { id: 'ach_event_join', name: 'Event Pioneer', description: 'Participate in your first special event.', conditionKey: 'eventsJoined', targetValue: 1, rewardCoins: 300, rewardXP: 150, icon: '\u{1F389}' },
];

export const MW_EVENTS: MWEventDef[] = [
  { id: 'event_tournament', name: 'Mech Tournament', type: 'tournament', description: 'Compete in the Grand Mech Tournament against elite pilots from around the world.', durationHours: 48, rewardCoins: 3000, rewardXP: 1500, requiredLevel: 10, icon: '\u{1F3C6}' },
  { id: 'event_invasion', name: 'Factory Invasion', type: 'invasion', description: 'Defend your workshop from waves of rogue mechs attacking the facility.', durationHours: 24, rewardCoins: 2000, rewardXP: 1000, requiredLevel: 5, icon: '\u{1F4A5}' },
  { id: 'event_expo', name: 'Tech Expo', type: 'expo', description: 'Showcase your best mechs at the annual Tech Expo for bonus rewards.', durationHours: 72, rewardCoins: 5000, rewardXP: 2500, requiredLevel: 15, icon: '\u{1F4BB}' },
  { id: 'event_clash', name: 'Steel Clash', type: 'tournament', description: 'A fierce bracket tournament with legendary prize pools.', durationHours: 36, rewardCoins: 4000, rewardXP: 2000, requiredLevel: 20, icon: '\u{2694}\uFE0F' },
  { id: 'event_siege', name: 'Workshop Siege', type: 'invasion', description: 'Massive scale invasion — survive 20 waves of increasingly powerful enemies.', durationHours: 12, rewardCoins: 2500, rewardXP: 1250, requiredLevel: 15, icon: '\u{1F3DE}\uFE0F' },
  { id: 'event_innovation', name: 'Innovation Summit', type: 'expo', description: 'Present new mech designs to earn exclusive blueprints and research grants.', durationHours: 96, rewardCoins: 8000, rewardXP: 4000, requiredLevel: 30, icon: '\u{1F4A1}' },
];

// ---------------------------------------------------------------------------
// Opponent definitions (for battle arena)
// ---------------------------------------------------------------------------

interface MWOpponentDef {
  id: string;
  name: string;
  mechName: string;
  level: number;
  stats: MWMechStats;
  reward: number;
  xpReward: number;
}

const MW_OPPONENTS: MWOpponentDef[] = [
  { id: 'opp_rusty', name: 'Rusty Rex', mechName: 'Scout Frame', level: 1, stats: { hp: 300, attack: 35, defense: 20, speed: 75, energy: 40, critRate: 10, critDmg: 130, evasion: 15, accuracy: 75 }, reward: 50, xpReward: 30 },
  { id: 'opp_bolt', name: 'Bolt Baker', mechName: 'Worker Chassis', level: 2, stats: { hp: 400, attack: 28, defense: 30, speed: 35, energy: 35, critRate: 4, critDmg: 110, evasion: 3, accuracy: 65 }, reward: 70, xpReward: 40 },
  { id: 'opp_spark', name: 'Captain Spark', mechName: 'Striker Frame', level: 4, stats: { hp: 350, attack: 50, defense: 18, speed: 55, energy: 45, critRate: 8, critDmg: 140, evasion: 8, accuracy: 74 }, reward: 100, xpReward: 55 },
  { id: 'opp_iron_mike', name: 'Iron Mike', mechName: 'Tank Chassis', level: 6, stats: { hp: 650, attack: 40, defense: 60, speed: 22, energy: 45, critRate: 4, critDmg: 115, evasion: 2, accuracy: 68 }, reward: 150, xpReward: 75 },
  { id: 'opp_phantom', name: 'Phantom Iris', mechName: 'Stealth Frame', level: 8, stats: { hp: 380, attack: 55, defense: 22, speed: 75, energy: 65, critRate: 16, critDmg: 165, evasion: 20, accuracy: 82 }, reward: 200, xpReward: 100 },
  { id: 'opp_hammer', name: 'Hammerfall', mechName: 'Assault Frame', level: 10, stats: { hp: 500, attack: 60, defense: 38, speed: 42, energy: 50, critRate: 9, critDmg: 145, evasion: 6, accuracy: 78 }, reward: 280, xpReward: 130 },
  { id: 'opp_nova', name: 'Nova Kai', mechName: 'Nova Frame', level: 13, stats: { hp: 500, attack: 70, defense: 42, speed: 65, energy: 80, critRate: 14, critDmg: 160, evasion: 13, accuracy: 86 }, reward: 400, xpReward: 180 },
  { id: 'opp_titan', name: 'Titan Grimm', mechName: 'Titan Core', level: 16, stats: { hp: 850, attack: 50, defense: 75, speed: 18, energy: 55, critRate: 5, critDmg: 125, evasion: 2, accuracy: 70 }, reward: 550, xpReward: 250 },
  { id: 'opp_eclipse', name: 'Eclipse Seraph', mechName: 'Eclipse Frame', level: 20, stats: { hp: 500, attack: 90, defense: 38, speed: 90, energy: 90, critRate: 24, critDmg: 195, evasion: 28, accuracy: 93 }, reward: 800, xpReward: 350 },
  { id: 'opp_omega', name: 'Omega Wraith', mechName: 'Omega Frame', level: 25, stats: { hp: 750, attack: 80, defense: 65, speed: 60, energy: 85, critRate: 15, critDmg: 170, evasion: 13, accuracy: 88 }, reward: 1200, xpReward: 500 },
  { id: 'opp_void', name: 'Void Emperor', mechName: 'Void Walker', level: 30, stats: { hp: 650, attack: 100, defense: 48, speed: 95, energy: 115, critRate: 26, critDmg: 205, evasion: 33, accuracy: 96 }, reward: 1800, xpReward: 750 },
  { id: 'opp_singularity', name: 'Singularity Lord', mechName: 'Singularity Core', level: 38, stats: { hp: 1700, attack: 90, defense: 95, speed: 28, energy: 125, critRate: 9, critDmg: 165, evasion: 4, accuracy: 83 }, reward: 3000, xpReward: 1200 },
  { id: 'opp_genesis', name: 'Genesis Prime', mechName: 'Genesis Prime', level: 50, stats: { hp: 1900, attack: 115, defense: 105, speed: 48, energy: 145, critRate: 14, critDmg: 195, evasion: 9, accuracy: 90 }, reward: 5000, xpReward: 2000 },
];

// ---------------------------------------------------------------------------
// Daily challenge pool
// ---------------------------------------------------------------------------

interface MWDailyPoolDef {
  id: string;
  name: string;
  description: string;
  type: string;
  goal: number;
  rewardCoins: number;
  rewardXP: number;
}

const MW_DAILY_POOL: MWDailyPoolDef[] = [
  { id: 'daily_build_1', name: 'Quick Build', description: 'Build 1 mech from the Assembly Line.', type: 'build', goal: 1, rewardCoins: 100, rewardXP: 50 },
  { id: 'daily_build_3', name: 'Mass Production', description: 'Build 3 mechs in the workshop.', type: 'build', goal: 3, rewardCoins: 300, rewardXP: 150 },
  { id: 'daily_battle_2', name: 'Arena Debut', description: 'Win 2 battles in the arena.', type: 'battle', goal: 2, rewardCoins: 200, rewardXP: 100 },
  { id: 'daily_battle_5', name: 'Battle Frenzy', description: 'Win 5 battles in the arena.', type: 'battle', goal: 5, rewardCoins: 500, rewardXP: 250 },
  { id: 'daily_salvage_3', name: 'Salvage Run', description: 'Salvage 3 parts from the salvage queue.', type: 'salvage', goal: 3, rewardCoins: 150, rewardXP: 75 },
  { id: 'daily_parts_2', name: 'Arms Dealer', description: 'Equip 2 new parts to your active mech.', type: 'equip', goal: 2, rewardCoins: 200, rewardXP: 100 },
  { id: 'daily_upgrade_2', name: 'Upgrade Day', description: 'Upgrade any module or skill 2 times.', type: 'upgrade', goal: 2, rewardCoins: 250, rewardXP: 125 },
  { id: 'daily_coins_500', name: 'Coin Rush', description: 'Earn 500 coins through any means.', type: 'coins', goal: 500, rewardCoins: 200, rewardXP: 100 },
];

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

function mwCreateInitialState(seed: number): MechWorkshopState {
  const todayKey = mwDayKey(Date.now());
  return {
    level: 1,
    xp: 0,
    coins: 500,
    title: 'Mech Cadet',
    currentBay: 'assembly',
    activeMechId: '',
    mechs: MW_MECH_FRAMES.map((m) => ({ id: m.id, owned: false, count: 0, equipped: false })),
    parts: MW_PARTS.map((p) => ({ id: p.id, owned: false, count: 0, equipped: false })),
    upgrades: MW_UPGRADE_MODULES.map((u) => ({ id: u.id, owned: false, level: 0 })),
    skills: MW_PILOT_SKILLS.map((s) => ({ id: s.id, owned: false, level: 0 })),
    achievements: MW_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, progress: 0 })),
    battleStats: { wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, totalBattles: 0 },
    dailyChallenge: { dateKey: todayKey, completed: false, type: '', progress: 0, goal: 0, rewardCoins: 0, rewardXP: 0 },
    events: MW_EVENTS.map((e) => ({ id: e.id, joined: false, progress: 0, goal: 10, completed: false, claimed: false })),
    salvageQueue: [],
    automationLevel: 0,
    workshopLevel: 1,
    workshopCapacity: 6,
    totalMechsBuilt: 0,
    totalPartsCrafted: 0,
    totalBattlesWon: 0,
    totalSalvage: 0,
    totalCoinsEarned: 0,
    totalXPEarned: 0,
    seed,
  };
}

// ---------------------------------------------------------------------------
// Helpers for XP leveling
// ---------------------------------------------------------------------------

function mwApplyXP(state: MechWorkshopState, amount: number): MechWorkshopState {
  let next = { ...state, xp: state.xp + amount, totalXPEarned: state.totalXPEarned + amount };
  const needed = mwXpForLevel(next.level);
  while (next.xp >= needed && next.level < MW_MAX_LEVEL) {
    next = { ...next, xp: next.xp - mwXpForLevel(next.level), level: mwClampLevel(next.level + 1) };
    if (next.xp < mwXpForLevel(next.level) || next.level >= MW_MAX_LEVEL) break;
  }
  if (next.level >= MW_MAX_LEVEL) next = { ...next, xp: 0 };
  // Update title
  let newTitle = next.title;
  for (const t of MW_TITLES) {
    if (next.level >= t.levelRequired) newTitle = t.name;
  }
  return { ...next, title: newTitle };
}

// ---------------------------------------------------------------------------
// Computed stat helpers
// ---------------------------------------------------------------------------

function mwGetEquippedMechStats(state: MechWorkshopState): MWMechStats | null {
  const mechDef = MW_MECH_FRAMES.find((m) => m.id === state.activeMechId);
  if (!mechDef) return null;
  let stats = { ...mechDef.baseStats };
  // Apply equipped parts
  for (const ps of state.parts) {
    if (ps.equipped && ps.count > 0) {
      const partDef = MW_PARTS.find((p) => p.id === ps.id);
      if (partDef) {
        for (const [k, v] of Object.entries(partDef.stats)) {
          if (typeof v === 'number' && k in stats) {
            stats = { ...stats, [k]: (stats as Record<string, number>)[k] + v };
          }
        }
      }
    }
  }
  // Apply upgrade modules
  for (const us of state.upgrades) {
    if (us.owned && us.level > 0) {
      const modDef = MW_UPGRADE_MODULES.find((u) => u.id === us.id);
      if (modDef) {
        for (const [k, v] of Object.entries(modDef.effectPerLevel)) {
          if (typeof v === 'number' && k in stats) {
            stats = { ...stats, [k]: (stats as Record<string, number>)[k] + v * us.level };
          }
        }
      }
    }
  }
  return stats;
}

function mwGetTotalPower(stats: MWMechStats | null): number {
  if (!stats) return 0;
  return stats.hp + stats.attack * 3 + stats.defense * 2 + stats.speed * 2 + stats.energy + stats.critRate * 5 + stats.critDmg * 2 + stats.evasion * 3 + stats.accuracy * 2;
}

// ---------------------------------------------------------------------------
// Achievement checking
// ---------------------------------------------------------------------------

function mwCheckAndUnlockAchievements(state: MechWorkshopState): MechWorkshopState {
  let updated = state;
  const ownedMechs = updated.mechs.filter((m) => m.owned).length;
  const ownedParts = updated.parts.filter((p) => p.owned).length;
  const ownedUpgrades = updated.upgrades.filter((u) => u.owned).length;
  const unlockedBays = MW_WORKSHOP_BAYS.filter((b) => updated.level >= b.unlockLevel).length;
  const eventsJoined = updated.events.filter((e) => e.joined).length;
  const maxMechPower = mwGetTotalPower(mwGetEquippedMechStats(updated)) > 500 ? 1 : 0;

  const conditionMap: Record<string, number> = {
    totalMechsBuilt: updated.totalMechsBuilt,
    ownedMechs,
    ownedParts,
    totalBattlesWon: updated.totalBattlesWon,
    bestStreak: updated.battleStats.bestStreak,
    maxMechPower,
    unlockedBays,
    totalSalvage: updated.totalSalvage,
    level: updated.level,
    dailiesCompleted: updated.totalXPEarned,
    automationMax: updated.automationLevel,
    ownedUpgrades,
    eventsJoined,
  };

  const newAchievements = [...updated.achievements];
  let bonusCoins = 0;
  let bonusXP = 0;
  for (let i = 0; i < newAchievements.length; i++) {
    const ach = newAchievements[i];
    if (ach.unlocked) continue;
    const def = MW_ACHIEVEMENTS.find((a) => a.id === ach.id);
    if (!def) continue;
    const currentVal = conditionMap[def.conditionKey] ?? ach.progress;
    const newProgress = Math.min(currentVal, def.targetValue);
    if (newProgress >= def.targetValue) {
      newAchievements[i] = { ...ach, unlocked: true, progress: def.targetValue };
      bonusCoins += def.rewardCoins;
      bonusXP += def.rewardXP;
    } else {
      newAchievements[i] = { ...ach, progress: newProgress };
    }
  }
  updated = { ...updated, achievements: newAchievements };
  if (bonusCoins > 0 || bonusXP > 0) {
    updated = { ...updated, coins: updated.coins + bonusCoins };
    updated = mwApplyXP(updated, bonusXP);
  }
  return updated;
}

// ---------------------------------------------------------------------------
// Hook: useMechWorkshop
// ---------------------------------------------------------------------------

export default function useMechWorkshop(initialSeed?: number) {
  const [state, setState] = useState<MechWorkshopState>(() =>
    mwCreateInitialState(initialSeed ?? (Date.now() & 0x7fffffff))
  );
  const stateRef = useRef<MechWorkshopState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- Core State ----

  const mwGetState = useCallback((): Readonly<MechWorkshopState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const mwResetState = useCallback((newSeed?: number) => {
    const s = newSeed ?? (Date.now() & 0x7fffffff);
    setState(mwCreateInitialState(s));
  }, []);

  const mwRandom = useCallback((): number => {
    const rng = mwCreateRNG(stateRef.current.seed + Date.now());
    return rng();
  }, []);

  const mwRandomInt = useCallback((min: number, max: number): number => {
    const rng = mwCreateRNG(stateRef.current.seed + Date.now());
    return Math.floor(rng() * (max - min + 1)) + min;
  }, []);

  const mwRandomPick = useCallback(<T>(arr: readonly T[]): T | null => {
    if (arr.length === 0) return null;
    const rng = mwCreateRNG(stateRef.current.seed + Date.now());
    return arr[Math.floor(rng() * arr.length)];
  }, []);

  // ---- Level / XP ----

  const mwGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const mwGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const mwGetXPForNextLevel = useCallback((): number => {
    return mwXpForLevel(state.level);
  }, [state.level]);

  const mwGetProgress = useCallback((): number => {
    const needed = mwXpForLevel(state.level);
    if (needed === Infinity) return 100;
    return Math.min(100, (state.xp / needed) * 100);
  }, [state.level, state.xp]);

  const mwGetOverallProgress = useCallback((): number => {
    return (state.level / MW_MAX_LEVEL) * 100;
  }, [state.level]);

  const mwAddXP = useCallback((amount: number): MechWorkshopState => {
    const next = mwApplyXP(state, amount);
    const checked = mwCheckAndUnlockAchievements(next);
    setState(checked);
    return checked;
  }, [state]);

  // ---- Coins ----

  const mwGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const mwAddCoins = useCallback((amount: number): void => {
    setState((prev) => ({ ...prev, coins: prev.coins + amount, totalCoinsEarned: prev.totalCoinsEarned + amount }));
  }, []);

  const mwSpendCoins = useCallback((amount: number): boolean => {
    if (state.coins < amount) return false;
    setState((prev) => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }, [state.coins]);

  const mwCanAfford = useCallback((cost: number): boolean => {
    return state.coins >= cost;
  }, [state.coins]);

  // ---- Title ----

  const mwGetTitle = useCallback((): MWTitleInfo => {
    let title = MW_TITLES[0];
    for (const t of MW_TITLES) {
      if (state.level >= t.levelRequired) title = t;
    }
    return title;
  }, [state.level]);

  const mwGetAllTitles = useCallback((): MWTitleInfo[] => {
    return [...MW_TITLES];
  }, []);

  const mwGetNextTitle = useCallback((): MWTitleInfo | null => {
    const current = mwGetTitle();
    const idx = MW_TITLES.indexOf(current);
    if (idx < MW_TITLES.length - 1) return MW_TITLES[idx + 1];
    return null;
  }, [mwGetTitle]);

  // ---- Mech Frames ----

  const mwGetMechFrames = useCallback((): MWMechFrameDef[] => {
    return [...MW_MECH_FRAMES];
  }, []);

  const mwGetMechById = useCallback((id: string): MWMechFrameDef | null => {
    return MW_MECH_FRAMES.find((m) => m.id === id) ?? null;
  }, []);

  const mwGetMechState = useCallback((id: string): MWMechState | null => {
    return state.mechs.find((m) => m.id === id) ?? null;
  }, [state.mechs]);

  const mwGetOwnedMechs = useCallback((): MWMechState[] => {
    return state.mechs.filter((m) => m.owned);
  }, [state.mechs]);

  const mwGetMechsByRarity = useCallback((rarity: MWRarity): MWMechFrameDef[] => {
    return MW_MECH_FRAMES.filter((m) => m.rarity === rarity);
  }, []);

  const mwGetMechCost = useCallback((id: string): number => {
    const def = MW_MECH_FRAMES.find((m) => m.id === id);
    return def ? def.cost : 0;
  }, []);

  const mwCanBuyMech = useCallback((id: string): boolean => {
    const def = MW_MECH_FRAMES.find((m) => m.id === id);
    if (!def) return false;
    if (state.level < def.requiredLevel) return false;
    return state.coins >= def.cost;
  }, [state.coins, state.level]);

  const mwBuyMech = useCallback((id: string): { success: boolean; state: MechWorkshopState } => {
    const def = MW_MECH_FRAMES.find((m) => m.id === id);
    if (!def || state.coins < def.cost || state.level < def.requiredLevel) {
      return { success: false, state };
    }
    const newMechs = state.mechs.map((m) =>
      m.id === id ? { ...m, owned: true, count: m.count + 1 } : m
    );
    // If no active mech, set this one as active
    const newActiveMechId = state.activeMechId || id;
    const newState = {
      ...state,
      coins: state.coins - def.cost,
      mechs: newMechs,
      activeMechId: newActiveMechId,
      totalMechsBuilt: state.totalMechsBuilt + 1,
    };
    const checked = mwCheckAndUnlockAchievements(newState);
    setState(checked);
    return { success: true, state: checked };
  }, [state]);

  const mwEquipMech = useCallback((id: string): { success: boolean; state: MechWorkshopState } => {
    const mechState = state.mechs.find((m) => m.id === id);
    if (!mechState || !mechState.owned) return { success: false, state };
    const newMechs = state.mechs.map((m) => ({ ...m, equipped: m.id === id }));
    const newState = { ...state, mechs: newMechs, activeMechId: id };
    setState(newState);
    return { success: true, state: newState };
  }, [state]);

  const mwGetActiveMechId = useCallback((): string => {
    return state.activeMechId;
  }, [state.activeMechId]);

  const mwGetActiveMechStats = useCallback((): MWMechStats | null => {
    return mwGetEquippedMechStats(state);
  }, [state]);

  const mwGetMechPower = useCallback((): number => {
    return mwGetTotalPower(mwGetEquippedMechStats(state));
  }, [state]);

  const mwSellMech = useCallback((id: string): { success: boolean; refund: number; state: MechWorkshopState } => {
    const mechState = state.mechs.find((m) => m.id === id);
    if (!mechState || !mechState.owned || mechState.count <= 0) return { success: false, refund: 0, state };
    const def = MW_MECH_FRAMES.find((m) => m.id === id);
    const refund = def ? Math.floor(def.cost * 0.4) : 0;
    const newMechs = state.mechs.map((m) =>
      m.id === id ? { ...m, count: m.count - 1, owned: m.count - 1 > 0 } : m
    );
    const newActiveMechId = state.activeMechId === id ? '' : state.activeMechId;
    const newState = { ...state, coins: state.coins + refund, mechs: newMechs, activeMechId: newActiveMechId };
    setState(newState);
    return { success: true, refund, state: newState };
  }, [state]);

  // ---- Workshop Bays ----

  const mwGetWorkshopBays = useCallback((): MWWorkshopBayDef[] => {
    return [...MW_WORKSHOP_BAYS];
  }, []);

  const mwGetBayById = useCallback((id: MWBayId): MWWorkshopBayDef | null => {
    return MW_WORKSHOP_BAYS.find((b) => b.id === id) ?? null;
  }, []);

  const mwGetCurrentBay = useCallback((): MWBayId => {
    return state.currentBay;
  }, [state.currentBay]);

  const mwSwitchBay = useCallback((id: MWBayId): void => {
    const bay = MW_WORKSHOP_BAYS.find((b) => b.id === id);
    if (bay && state.level >= bay.unlockLevel) {
      setState((prev) => ({ ...prev, currentBay: id }));
    }
  }, [state.level]);

  const mwIsBayUnlocked = useCallback((id: MWBayId): boolean => {
    const bay = MW_WORKSHOP_BAYS.find((b) => b.id === id);
    if (!bay) return false;
    return state.level >= bay.unlockLevel;
  }, [state.level]);

  const mwGetUnlockedBays = useCallback((): MWWorkshopBayDef[] => {
    return MW_WORKSHOP_BAYS.filter((b) => state.level >= b.unlockLevel);
  }, [state.level]);

  const mwUnlockBay = useCallback((id: MWBayId): { success: boolean; cost: number; state: MechWorkshopState } => {
    const bay = MW_WORKSHOP_BAYS.find((b) => b.id === id);
    if (!bay) return { success: false, cost: 0, state };
    if (state.level >= bay.unlockLevel) return { success: true, cost: 0, state };
    // Bays unlock via level, not purchase — but we simulate an XP shortcut
    return { success: false, cost: 0, state };
  }, [state]);

  // ---- Parts ----

  const mwGetParts = useCallback((): MWPartDef[] => {
    return [...MW_PARTS];
  }, []);

  const mwGetPartById = useCallback((id: string): MWPartDef | null => {
    return MW_PARTS.find((p) => p.id === id) ?? null;
  }, []);

  const mwGetPartState = useCallback((id: string): MWPartState | null => {
    return state.parts.find((p) => p.id === id) ?? null;
  }, [state.parts]);

  const mwGetOwnedParts = useCallback((): MWPartState[] => {
    return state.parts.filter((p) => p.owned);
  }, [state.parts]);

  const mwGetEquippedParts = useCallback((): MWPartState[] => {
    return state.parts.filter((p) => p.equipped);
  }, [state.parts]);

  const mwGetPartsBySlot = useCallback((slot: MWSlot): MWPartDef[] => {
    return MW_PARTS.filter((p) => p.slot === slot);
  }, []);

  const mwGetPartsByRarity = useCallback((rarity: MWRarity): MWPartDef[] => {
    return MW_PARTS.filter((p) => p.rarity === rarity);
  }, []);

  const mwGetPartCost = useCallback((id: string): number => {
    const def = MW_PARTS.find((p) => p.id === id);
    return def ? def.cost : 0;
  }, []);

  const mwCanBuyPart = useCallback((id: string): boolean => {
    const def = MW_PARTS.find((p) => p.id === id);
    if (!def) return false;
    return state.coins >= def.cost && state.level >= def.requiredLevel;
  }, [state.coins, state.level]);

  const mwBuyPart = useCallback((id: string): { success: boolean; state: MechWorkshopState } => {
    const def = MW_PARTS.find((p) => p.id === id);
    if (!def || state.coins < def.cost || state.level < def.requiredLevel) {
      return { success: false, state };
    }
    const newParts = state.parts.map((p) =>
      p.id === id ? { ...p, owned: true, count: p.count + 1 } : p
    );
    const newState = { ...state, coins: state.coins - def.cost, parts: newParts, totalPartsCrafted: state.totalPartsCrafted + 1 };
    const checked = mwCheckAndUnlockAchievements(newState);
    setState(checked);
    return { success: true, state: checked };
  }, [state]);

  const mwEquipPart = useCallback((id: string): { success: boolean; state: MechWorkshopState } => {
    const partState = state.parts.find((p) => p.id === id);
    if (!partState || !partState.owned || partState.count <= 0) return { success: false, state };
    const def = MW_PARTS.find((p) => p.id === id);
    if (!def) return { success: false, state };
    // Unequip other parts in same slot
    const newParts = state.parts.map((p) => {
      if (p.id === id) return { ...p, equipped: true };
      const otherDef = MW_PARTS.find((op) => op.id === p.id);
      if (otherDef && otherDef.slot === def.slot) return { ...p, equipped: false };
      return p;
    });
    const newState = { ...state, parts: newParts };
    setState(newState);
    return { success: true, state: newState };
  }, [state]);

  const mwUnequipPart = useCallback((id: string): void => {
    const newParts = state.parts.map((p) =>
      p.id === id ? { ...p, equipped: false } : p
    );
    setState((prev) => ({ ...prev, parts: newParts }));
  }, [state.parts]);

  const mwSellPart = useCallback((id: string): { success: boolean; refund: number; state: MechWorkshopState } => {
    const partState = state.parts.find((p) => p.id === id);
    if (!partState || !partState.owned || partState.count <= 0) return { success: false, refund: 0, state };
    const def = MW_PARTS.find((p) => p.id === id);
    const refund = def ? Math.floor(def.cost * 0.35) : 0;
    const newParts = state.parts.map((p) =>
      p.id === id ? { ...p, count: p.count - 1, owned: p.count - 1 > 0, equipped: p.count - 1 > 0 ? p.equipped : false } : p
    );
    const newState = { ...state, coins: state.coins + refund, parts: newParts };
    setState(newState);
    return { success: true, refund, state: newState };
  }, [state]);

  // ---- Upgrade Modules ----

  const mwGetUpgrades = useCallback((): MWUpgradeModuleDef[] => {
    return [...MW_UPGRADE_MODULES];
  }, []);

  const mwGetUpgradeState = useCallback((id: string): MWUpgradeState | null => {
    return state.upgrades.find((u) => u.id === id) ?? null;
  }, [state.upgrades]);

  const mwGetUpgradeCost = useCallback((id: string, currentLevel: number): number => {
    const def = MW_UPGRADE_MODULES.find((u) => u.id === id);
    if (!def) return 0;
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
  }, []);

  const mwCanUpgradeModule = useCallback((id: string): boolean => {
    const def = MW_UPGRADE_MODULES.find((u) => u.id === id);
    const ust = state.upgrades.find((u) => u.id === id);
    if (!def || !ust) return false;
    if (ust.level >= def.maxLevel) return false;
    if (state.level < def.requiredLevel) return false;
    const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, ust.level));
    return state.coins >= cost;
  }, [state]);

  const mwBuyUpgrade = useCallback((id: string): { success: boolean; cost: number; state: MechWorkshopState } => {
    const def = MW_UPGRADE_MODULES.find((u) => u.id === id);
    const ust = state.upgrades.find((u) => u.id === id);
    if (!def || !ust || ust.level >= def.maxLevel || state.level < def.requiredLevel) {
      return { success: false, cost: 0, state };
    }
    const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, ust.level));
    if (state.coins < cost) return { success: false, cost: 0, state };
    const newUpgrades = state.upgrades.map((u) =>
      u.id === id ? { ...u, owned: true, level: u.level + 1 } : u
    );
    const newState = { ...state, coins: state.coins - cost, upgrades: newUpgrades };
    const checked = mwCheckAndUnlockAchievements(newState);
    setState(checked);
    return { success: true, cost, state: checked };
  }, [state]);

  const mwGetUpgradeEffect = useCallback((id: string, level: number): Partial<MWMechStats> => {
    const def = MW_UPGRADE_MODULES.find((u) => u.id === id);
    if (!def) return {};
    const result: Record<string, number> = {};
    for (const [k, v] of Object.entries(def.effectPerLevel)) {
      if (typeof v === 'number') {
        result[k] = v * level;
      }
    }
    return result;
  }, []);

  // ---- Pilot Skills ----

  const mwGetPilotSkills = useCallback((): MWPilotSkillDef[] => {
    return [...MW_PILOT_SKILLS];
  }, []);

  const mwGetSkillState = useCallback((id: string): MWSkillState | null => {
    return state.skills.find((s) => s.id === id) ?? null;
  }, [state.skills]);

  const mwGetSkillCost = useCallback((id: string, currentLevel: number): number => {
    const def = MW_PILOT_SKILLS.find((s) => s.id === id);
    if (!def) return 0;
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
  }, []);

  const mwCanUpgradeSkill = useCallback((id: string): boolean => {
    const def = MW_PILOT_SKILLS.find((s) => s.id === id);
    const sst = state.skills.find((s) => s.id === id);
    if (!def || !sst) return false;
    if (sst.level >= def.maxLevel) return false;
    if (state.level < def.requiredLevel) return false;
    const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, sst.level));
    return state.coins >= cost;
  }, [state]);

  const mwBuySkill = useCallback((id: string): { success: boolean; cost: number; state: MechWorkshopState } => {
    const def = MW_PILOT_SKILLS.find((s) => s.id === id);
    const sst = state.skills.find((s) => s.id === id);
    if (!def || !sst || sst.level >= def.maxLevel || state.level < def.requiredLevel) {
      return { success: false, cost: 0, state };
    }
    const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, sst.level));
    if (state.coins < cost) return { success: false, cost: 0, state };
    const newSkills = state.skills.map((s) =>
      s.id === id ? { ...s, owned: true, level: s.level + 1 } : s
    );
    const newState = { ...state, coins: state.coins - cost, skills: newSkills };
    setState(newState);
    return { success: true, cost, state: newState };
  }, [state]);

  const mwGetSkillEffect = useCallback((id: string, level: number): Partial<MWMechStats> => {
    const def = MW_PILOT_SKILLS.find((s) => s.id === id);
    if (!def) return {};
    const result: Record<string, number> = {};
    for (const [k, v] of Object.entries(def.effectPerLevel)) {
      if (typeof v === 'number') {
        result[k] = v * level;
      }
    }
    return result;
  }, []);

  const mwGetOwnedSkills = useCallback((): MWSkillState[] => {
    return state.skills.filter((s) => s.owned);
  }, [state.skills]);

  // ---- Battle Arena ----

  const mwGetOpponents = useCallback((): MWOpponentDef[] => {
    return MW_OPPONENTS.filter((o) => o.level <= state.level + 5);
  }, [state.level]);

  const mwGetOpponentById = useCallback((id: string): MWOpponentDef | null => {
    return MW_OPPONENTS.find((o) => o.id === id) ?? null;
  }, []);

  const mwGetBattleStats = useCallback((): MWBattleRecord => {
    return { ...state.battleStats };
  }, [state.battleStats]);

  const mwGetWinRate = useCallback((): number => {
    const { totalBattles, wins } = state.battleStats;
    if (totalBattles === 0) return 0;
    return Math.round((wins / totalBattles) * 100);
  }, [state.battleStats]);

  const mwSimulateBattle = useCallback((
    opponentId: string
  ): { result: 'win' | 'loss' | 'draw'; log: string[]; coinsEarned: number; xpEarned: number; state: MechWorkshopState } => {
    const opponent = MW_OPPONENTS.find((o) => o.id === opponentId);
    if (!opponent) {
      return { result: 'loss', log: ['Invalid opponent.'], coinsEarned: 0, xpEarned: 0, state };
    }
    const playerStats = mwGetEquippedMechStats(state);
    if (!playerStats) {
      return { result: 'loss', log: ['No active mech equipped!'], coinsEarned: 0, xpEarned: 0, state };
    }
    const log: string[] = [];
    let playerHP = playerStats.hp;
    let opponentHP = opponent.stats.hp;
    let round = 0;
    const maxRounds = 10;
    const playerAcc = Math.min(100, playerStats.accuracy);
    const opponentAcc = Math.min(100, opponent.stats.accuracy);
    const playerEvasion = Math.min(80, playerStats.evasion);
    const opponentEvasion = Math.min(80, opponent.stats.evasion);

    while (playerHP > 0 && opponentHP > 0 && round < maxRounds) {
      round++;
      // Player attacks
      if (Math.random() * 100 < playerAcc) {
        if (Math.random() * 100 >= opponentEvasion) {
          const isCrit = Math.random() * 100 < playerStats.critRate;
          const dmg = isCrit
            ? Math.max(1, Math.floor(playerStats.attack * (playerStats.critDmg / 100)))
            : Math.max(1, playerStats.attack);
          const actualDmg = Math.max(1, dmg - Math.floor(opponent.stats.defense * 0.5));
          opponentHP = Math.max(0, opponentHP - actualDmg);
          log.push(`Round ${round}: You deal ${actualDmg} damage${isCrit ? ' (CRITICAL!)' : ''}.`);
        } else {
          log.push(`Round ${round}: ${opponent.name} evades your attack!`);
        }
      } else {
        log.push(`Round ${round}: Your attack misses!`);
      }
      // Opponent attacks
      if (opponentHP > 0) {
        if (Math.random() * 100 < opponentAcc) {
          if (Math.random() * 100 >= playerEvasion) {
            const isCrit = Math.random() * 100 < opponent.stats.critRate;
            const dmg = isCrit
              ? Math.max(1, Math.floor(opponent.stats.attack * (opponent.stats.critDmg / 100)))
              : Math.max(1, opponent.stats.attack);
            const actualDmg = Math.max(1, dmg - Math.floor(playerStats.defense * 0.5));
            playerHP = Math.max(0, playerHP - actualDmg);
            log.push(`  ${opponent.name} deals ${actualDmg} damage${isCrit ? ' (CRITICAL!)' : ''}.`);
          } else {
            log.push(`  ${opponent.name}'s attack evaded!`);
          }
        } else {
          log.push(`  ${opponent.name}'s attack misses!`);
        }
      }
    }

    let result: 'win' | 'loss' | 'draw';
    let coinsEarned = 0;
    let xpEarned = 0;
    if (playerHP <= 0 && opponentHP <= 0) {
      result = 'draw';
      coinsEarned = Math.floor(opponent.reward * 0.3);
      xpEarned = Math.floor(opponent.xpReward * 0.3);
      log.push('Draw! Both mechs are destroyed.');
    } else if (opponentHP <= 0) {
      result = 'win';
      coinsEarned = opponent.reward;
      xpEarned = opponent.xpReward;
      log.push(`Victory! You earned ${coinsEarned} coins and ${xpEarned} XP.`);
    } else {
      result = 'loss';
      coinsEarned = Math.floor(opponent.reward * 0.15);
      xpEarned = Math.floor(opponent.xpReward * 0.2);
      log.push(`Defeat. You earned ${coinsEarned} coins and ${xpEarned} XP as consolation.`);
    }

    const newStreak = result === 'win' ? state.battleStats.streak + 1 : 0;
    const newBestStreak = Math.max(state.battleStats.bestStreak, newStreak);
    const newBattleStats = {
      wins: state.battleStats.wins + (result === 'win' ? 1 : 0),
      losses: state.battleStats.losses + (result === 'loss' ? 1 : 0),
      draws: state.battleStats.draws + (result === 'draw' ? 1 : 0),
      streak: newStreak,
      bestStreak: newBestStreak,
      totalBattles: state.battleStats.totalBattles + 1,
    };
    let newState = {
      ...state,
      coins: state.coins + coinsEarned,
      battleStats: newBattleStats,
      totalBattlesWon: state.totalBattlesWon + (result === 'win' ? 1 : 0),
    };
    newState = mwApplyXP(newState, xpEarned);
    const checked = mwCheckAndUnlockAchievements(newState);
    setState(checked);
    return { result, log, coinsEarned, xpEarned, state: checked };
  }, [state]);

  // ---- Salvage & Recycling ----

  const mwAddToSalvage = useCallback((partId: string): void => {
    setState((prev) => ({
      ...prev,
      salvageQueue: [...prev.salvageQueue, { partId, timestamp: Date.now() }],
    }));
  }, []);

  const mwProcessSalvage = useCallback((): { results: string[]; state: MechWorkshopState } => {
    if (state.salvageQueue.length === 0) return { results: [], state };
    const results: string[] = [];
    let newState = { ...state, salvageQueue: [], totalSalvage: state.totalSalvage + state.salvageQueue.length };
    for (const item of state.salvageQueue) {
      const partDef = MW_PARTS.find((p) => p.id === item.partId);
      const refund = partDef ? Math.floor(partDef.cost * 0.2) : 10;
      newState = { ...newState, coins: newState.coins + refund };
      results.push(`Salvaged ${partDef?.name ?? item.partId} for ${refund} coins.`);
    }
    const checked = mwCheckAndUnlockAchievements(newState);
    setState(checked);
    return { results, state: checked };
  }, [state]);

  const mwGetSalvageQueue = useCallback((): MWSalvageItem[] => {
    return [...state.salvageQueue];
  }, [state.salvageQueue]);

  // ---- Workshop Expansion & Automation ----

  const mwGetWorkshopLevel = useCallback((): number => {
    return state.workshopLevel;
  }, [state.workshopLevel]);

  const mwGetWorkshopCapacity = useCallback((): number => {
    return state.workshopCapacity;
  }, [state.workshopCapacity]);

  const mwGetAutomationLevel = useCallback((): number => {
    return state.automationLevel;
  }, [state.automationLevel]);

  const mwGetAutomationCost = useCallback((): number => {
    return Math.floor(500 * Math.pow(1.8, state.automationLevel));
  }, [state.automationLevel]);

  const mwUpgradeAutomation = useCallback((): { success: boolean; cost: number; state: MechWorkshopState } => {
    if (state.automationLevel >= 10) return { success: false, cost: 0, state };
    const cost = Math.floor(500 * Math.pow(1.8, state.automationLevel));
    if (state.coins < cost) return { success: false, cost, state };
    const newState = {
      ...state,
      coins: state.coins - cost,
      automationLevel: state.automationLevel + 1,
    };
    const checked = mwCheckAndUnlockAchievements(newState);
    setState(checked);
    return { success: true, cost, state: checked };
  }, [state]);

  const mwGetAutomationEffect = useCallback((): { speedBonus: number; efficiencyBonus: number; autoCollect: boolean } => {
    return {
      speedBonus: state.automationLevel * 5,
      efficiencyBonus: state.automationLevel * 3,
      autoCollect: state.automationLevel >= 5,
    };
  }, [state.automationLevel]);

  const mwUpgradeWorkshop = useCallback((): { success: boolean; cost: number; state: MechWorkshopState } => {
    const cost = Math.floor(1000 * Math.pow(2, state.workshopLevel - 1));
    if (state.coins < cost) return { success: false, cost, state };
    const newState = {
      ...state,
      coins: state.coins - cost,
      workshopLevel: state.workshopLevel + 1,
      workshopCapacity: state.workshopCapacity + 2,
    };
    setState(newState);
    return { success: true, cost, state: newState };
  }, [state]);

  // ---- Daily Challenge ----

  const mwGetDailyChallenge = useCallback((): MWDailyChallenge => {
    const todayKey = mwDayKey(Date.now());
    if (state.dailyChallenge.dateKey !== todayKey) {
      const rng = mwCreateRNG(parseInt(todayKey.replace(/-/g, ''), 10));
      const poolIdx = Math.floor(rng() * MW_DAILY_POOL.length);
      const pool = MW_DAILY_POOL[poolIdx];
      return {
        dateKey: todayKey,
        completed: false,
        type: pool.type,
        progress: 0,
        goal: pool.goal,
        rewardCoins: pool.rewardCoins,
        rewardXP: pool.rewardXP,
      };
    }
    return state.dailyChallenge;
  }, [state.dailyChallenge]);

  const mwUpdateDailyProgress = useCallback((amount: number): void => {
    const todayKey = mwDayKey(Date.now());
    setState((prev) => {
      if (prev.dailyChallenge.dateKey !== todayKey) return prev;
      const newProgress = Math.min(prev.dailyChallenge.progress + amount, prev.dailyChallenge.goal);
      return { ...prev, dailyChallenge: { ...prev.dailyChallenge, progress: newProgress } };
    });
  }, []);

  const mwIsDailyCompleted = useCallback((): boolean => {
    return state.dailyChallenge.completed;
  }, [state.dailyChallenge.completed]);

  const mwClaimDailyReward = useCallback((): { success: boolean; coins: number; xp: number; state: MechWorkshopState } => {
    const todayKey = mwDayKey(Date.now());
    if (state.dailyChallenge.completed || state.dailyChallenge.dateKey !== todayKey) {
      return { success: false, coins: 0, xp: 0, state };
    }
    if (state.dailyChallenge.progress < state.dailyChallenge.goal) {
      return { success: false, coins: 0, xp: 0, state };
    }
    const coins = state.dailyChallenge.rewardCoins;
    const xp = state.dailyChallenge.rewardXP;
    let newState = {
      ...state,
      dailyChallenge: { ...state.dailyChallenge, completed: true },
      coins: state.coins + coins,
    };
    newState = mwApplyXP(newState, xp);
    const checked = mwCheckAndUnlockAchievements(newState);
    setState(checked);
    return { success: true, coins, xp, state: checked };
  }, [state]);

  // ---- Events ----

  const mwGetEvents = useCallback((): MWEventDef[] => {
    return MW_EVENTS.filter((e) => e.requiredLevel <= state.level);
  }, [state.level]);

  const mwGetEventState = useCallback((id: string): MWEventState | null => {
    return state.events.find((e) => e.id === id) ?? null;
  }, [state.events]);

  const mwJoinEvent = useCallback((id: string): { success: boolean; state: MechWorkshopState } => {
    const def = MW_EVENTS.find((e) => e.id === id);
    const est = state.events.find((e) => e.id === id);
    if (!def || !est || est.joined || state.level < def.requiredLevel) {
      return { success: false, state };
    }
    const newEvents = state.events.map((e) =>
      e.id === id ? { ...e, joined: true } : e
    );
    const newState = { ...state, events: newEvents };
    const checked = mwCheckAndUnlockAchievements(newState);
    setState(checked);
    return { success: true, state: checked };
  }, [state]);

  const mwUpdateEventProgress = useCallback((id: string, amount: number): void => {
    setState((prev) => {
      const newEvents = prev.events.map((e) =>
        e.id === id ? { ...e, progress: Math.min(e.progress + amount, e.goal), completed: Math.min(e.progress + amount, e.goal) >= e.goal } : e
      );
      return { ...prev, events: newEvents };
    });
  }, []);

  const mwClaimEventReward = useCallback((id: string): { success: boolean; coins: number; xp: number; state: MechWorkshopState } => {
    const def = MW_EVENTS.find((e) => e.id === id);
    const est = state.events.find((e) => e.id === id);
    if (!def || !est || !est.completed || est.claimed) {
      return { success: false, coins: 0, xp: 0, state };
    }
    const coins = def.rewardCoins;
    const xp = def.rewardXP;
    const newEvents = state.events.map((e) =>
      e.id === id ? { ...e, claimed: true } : e
    );
    let newState = { ...state, events: newEvents, coins: state.coins + coins };
    newState = mwApplyXP(newState, xp);
    const checked = mwCheckAndUnlockAchievements(newState);
    setState(checked);
    return { success: true, coins, xp, state: checked };
  }, [state]);

  // ---- Achievements ----

  const mwGetAchievements = useCallback((): MWAchievementDef[] => {
    return [...MW_ACHIEVEMENTS];
  }, []);

  const mwGetAchievementState = useCallback((id: string): MWAchievementState | null => {
    return state.achievements.find((a) => a.id === id) ?? null;
  }, [state.achievements]);

  const mwIsAchievementUnlocked = useCallback((id: string): boolean => {
    return state.achievements.find((a) => a.id === id)?.unlocked ?? false;
  }, [state.achievements]);

  const mwGetUnlockedAchievements = useCallback((): MWAchievementState[] => {
    return state.achievements.filter((a) => a.unlocked);
  }, [state.achievements]);

  const mwGetCompletedCount = useCallback((): number => {
    return state.achievements.filter((a) => a.unlocked).length;
  }, [state.achievements]);

  // ---- Rarity Helpers ----

  const mwGetRarityInfo = useCallback((rarity: MWRarity): MWRarityInfo | null => {
    return MW_RARITY_INFO.find((ri) => ri.key === rarity) ?? null;
  }, []);

  const mwGetAllRarities = useCallback((): MWRarityInfo[] => {
    return [...MW_RARITY_INFO];
  }, []);

  // ---- Stats Summary ----

  const mwGetStats = useCallback((): Record<string, number> => {
    return {
      level: state.level,
      xp: state.xp,
      coins: state.coins,
      ownedMechs: state.mechs.filter((m) => m.owned).length,
      ownedParts: state.parts.filter((p) => p.owned).length,
      totalMechsBuilt: state.totalMechsBuilt,
      totalPartsCrafted: state.totalPartsCrafted,
      totalBattles: state.battleStats.totalBattles,
      wins: state.battleStats.wins,
      losses: state.battleStats.losses,
      winRate: state.battleStats.totalBattles > 0 ? Math.round((state.battleStats.wins / state.battleStats.totalBattles) * 100) : 0,
      bestStreak: state.battleStats.bestStreak,
      currentStreak: state.battleStats.streak,
      totalSalvage: state.totalSalvage,
      automationLevel: state.automationLevel,
      workshopLevel: state.workshopLevel,
      workshopCapacity: state.workshopCapacity,
      achievementsUnlocked: state.achievements.filter((a) => a.unlocked).length,
      totalCoinsEarned: state.totalCoinsEarned,
      totalXPEarned: state.totalXPEarned,
    };
  }, [state]);

  // ---- Tips ----

  const mwGetTips = useCallback((): string[] => {
    const tips: string[] = [];
    if (state.level < 5) tips.push('Build your first mech from the Assembly Line and equip basic parts.');
    if (!state.activeMechId) tips.push('Buy and equip a mech frame to access the battle arena.');
    if (state.mechs.filter((m) => m.owned).length < 2) tips.push('Collect multiple mech frames to handle different combat scenarios.');
    if (state.parts.filter((p) => p.equipped).length < 2) tips.push('Equip weapons and shields to boost your mech\'s combat stats.');
    if (state.upgrades.filter((u) => u.owned).length === 0) tips.push('Purchase upgrade modules to permanently boost your mech power.');
    if (state.battleStats.totalBattles === 0) tips.push('Test your mech in the battle arena against AI opponents!');
    if (state.skills.filter((s) => s.owned).length === 0) tips.push('Unlock pilot skills to gain tactical advantages in battle.');
    if (state.automationLevel < 3) tips.push('Upgrade automation to speed up workshop processes.');
    if (state.dailyChallenge.dateKey !== mwDayKey(Date.now())) tips.push('Complete today\'s daily challenge for bonus rewards!');
    if (state.level >= 20) tips.push('Higher-level opponents offer massive coin and XP rewards.');
    if (tips.length === 0) tips.push('Keep building and battling — you are on your way to becoming the Supreme Mech Architect!');
    return tips;
  }, [state]);

  // ---- Collection Progress ----

  const mwGetCollectionProgress = useCallback((): { mechs: { owned: number; total: number; percent: number }; parts: { owned: number; total: number; percent: number }; achievements: { unlocked: number; total: number; percent: number } } => {
    const ownedMechs = state.mechs.filter((m) => m.owned).length;
    const ownedParts = state.parts.filter((p) => p.owned).length;
    const unlockedAch = state.achievements.filter((a) => a.unlocked).length;
    return {
      mechs: { owned: ownedMechs, total: MW_MECH_FRAMES.length, percent: Math.round((ownedMechs / MW_MECH_FRAMES.length) * 100) },
      parts: { owned: ownedParts, total: MW_PARTS.length, percent: Math.round((ownedParts / MW_PARTS.length) * 100) },
      achievements: { unlocked: unlockedAch, total: MW_ACHIEVEMENTS.length, percent: Math.round((unlockedAch / MW_ACHIEVEMENTS.length) * 100) },
    };
  }, [state]);

  // ---- Recommended Actions ----

  const mwGetRecommendedActions = useCallback((): { type: string; id: string; name: string; cost: number; benefit: string }[] => {
    const actions: { type: string; id: string; name: string; cost: number; benefit: string }[] = [];
    // Recommend affordable mechs
    for (const def of MW_MECH_FRAMES) {
      const ms = state.mechs.find((m) => m.id === def.id);
      if (!ms?.owned && state.level >= def.requiredLevel && def.cost <= state.coins) {
        actions.push({ type: 'mech', id: def.id, name: def.name, cost: def.cost, benefit: `HP:${def.baseStats.hp} ATK:${def.baseStats.attack} DEF:${def.baseStats.defense}` });
      }
    }
    // Recommend affordable parts
    for (const def of MW_PARTS) {
      const ps = state.parts.find((p) => p.id === def.id);
      if (!ps?.owned && state.level >= def.requiredLevel && def.cost <= state.coins) {
        const statStr = Object.entries(def.stats).map(([k, v]) => `${k}:+${v}`).join(', ');
        actions.push({ type: 'part', id: def.id, name: def.name, cost: def.cost, benefit: statStr });
      }
    }
    // Recommend affordable upgrades
    for (const def of MW_UPGRADE_MODULES) {
      const us = state.upgrades.find((u) => u.id === def.id);
      if (us && us.level < def.maxLevel && state.level >= def.requiredLevel) {
        const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, us.level));
        if (cost <= state.coins) {
          actions.push({ type: 'upgrade', id: def.id, name: def.name, cost, benefit: def.description });
        }
      }
    }
    actions.sort((a, b) => a.cost - b.cost);
    return actions.slice(0, 5);
  }, [state]);

  // ---- Reset specific systems ----

  const mwResetBattleStreak = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      battleStats: { ...prev.battleStats, streak: 0 },
    }));
  }, []);

  const mwResetUpgrades = useCallback((): { refund: number; state: MechWorkshopState } => {
    let refund = 0;
    const newUpgrades = state.upgrades.map((u) => {
      const def = MW_UPGRADE_MODULES.find((d) => d.id === u.id);
      if (def && u.level > 0) {
        for (let i = 0; i < u.level; i++) {
          refund += Math.floor(def.baseCost * Math.pow(def.costMultiplier, i));
        }
      }
      return { ...u, owned: false, level: 0 };
    });
    const newState = { ...state, upgrades: newUpgrades, coins: state.coins + refund };
    setState(newState);
    return { refund, state: newState };
  }, [state]);

  const mwResetSkills = useCallback((): { refund: number; state: MechWorkshopState } => {
    let refund = 0;
    const newSkills = state.skills.map((s) => {
      const def = MW_PILOT_SKILLS.find((d) => d.id === s.id);
      if (def && s.level > 0) {
        for (let i = 0; i < s.level; i++) {
          refund += Math.floor(def.baseCost * Math.pow(def.costMultiplier, i));
        }
      }
      return { ...s, owned: false, level: 0 };
    });
    const newState = { ...state, skills: newSkills, coins: state.coins + refund };
    setState(newState);
    return { refund, state: newState };
  }, [state]);

  // ---- Net Worth ----

  const mwGetNetWorth = useCallback((): number => {
    let worth = state.coins;
    for (const ms of state.mechs) {
      if (ms.owned) {
        const def = MW_MECH_FRAMES.find((m) => m.id === ms.id);
        if (def) worth += def.cost * ms.count;
      }
    }
    for (const ps of state.parts) {
      if (ps.owned) {
        const def = MW_PARTS.find((p) => p.id === ps.id);
        if (def) worth += def.cost * ps.count;
      }
    }
    for (const us of state.upgrades) {
      if (us.owned && us.level > 0) {
        const def = MW_UPGRADE_MODULES.find((u) => u.id === us.id);
        if (def) {
          for (let i = 0; i < us.level; i++) {
            worth += Math.floor(def.baseCost * Math.pow(def.costMultiplier, i));
          }
        }
      }
    }
    for (const ss of state.skills) {
      if (ss.owned && ss.level > 0) {
        const def = MW_PILOT_SKILLS.find((s) => s.id === ss.id);
        if (def) {
          for (let i = 0; i < ss.level; i++) {
            worth += Math.floor(def.baseCost * Math.pow(def.costMultiplier, i));
          }
        }
      }
    }
    return worth;
  }, [state]);

  // ---- Battle Preview ----

  const mwGetBattlePreview = useCallback((opponentId: string): { canBattle: boolean; playerPower: number; opponentPower: number; advantage: string } | null => {
    const opponent = MW_OPPONENTS.find((o) => o.id === opponentId);
    if (!opponent) return null;
    const playerStats = mwGetEquippedMechStats(state);
    if (!playerStats) return { canBattle: false, playerPower: 0, opponentPower: mwGetTotalPower(opponent.stats), advantage: 'No mech equipped' };
    const playerPower = mwGetTotalPower(playerStats);
    const opponentPower = mwGetTotalPower(opponent.stats);
    const ratio = playerPower / Math.max(1, opponentPower);
    let advantage: string;
    if (ratio >= 1.3) advantage = 'Strong Advantage';
    else if (ratio >= 1.0) advantage = 'Slight Advantage';
    else if (ratio >= 0.8) advantage = 'Even Match';
    else if (ratio >= 0.6) advantage = 'Slight Disadvantage';
    else advantage = 'Strong Disadvantage';
    return { canBattle: true, playerPower, opponentPower, advantage };
  }, [state]);

  // ---- Mech Comparison ----

  const mwCompareMechs = useCallback((id1: string, id2: string): { mech1: MWMechFrameDef | null; mech2: MWMechFrameDef | null; comparison: Record<string, { v1: number; v2: number; better: string }> } => {
    const m1 = MW_MECH_FRAMES.find((m) => m.id === id1) ?? null;
    const m2 = MW_MECH_FRAMES.find((m) => m.id === id2) ?? null;
    const comparison: Record<string, { v1: number; v2: number; better: string }> = {};
    const stats = ['hp', 'attack', 'defense', 'speed', 'energy', 'critRate', 'critDmg', 'evasion', 'accuracy'] as const;
    for (const s of stats) {
      const v1 = m1?.baseStats[s] ?? 0;
      const v2 = m2?.baseStats[s] ?? 0;
      comparison[s] = { v1, v2, better: v1 > v2 ? 'mech1' : v2 > v1 ? 'mech2' : 'tie' };
    }
    return { mech1: m1, mech2: m2, comparison };
  }, []);

  // ---- Optimal Loadout Suggestion ----

  const mwGetOptimalLoadout = useCallback((): { weapon: string | null; shield: string | null; core: string | null; mobility: string | null; sensor: string | null } => {
    if (!state.activeMechId) return { weapon: null, shield: null, core: null, mobility: null, sensor: null };
    const mechDef = MW_MECH_FRAMES.find((m) => m.id === state.activeMechId);
    if (!mechDef) return { weapon: null, shield: null, core: null, mobility: null, sensor: null };
    const result: Record<string, string | null> = { weapon: null, shield: null, core: null, mobility: null, sensor: null };
    for (const slot of ['weapon', 'shield', 'core', 'mobility', 'sensor'] as const) {
      const available = MW_PARTS.filter((p) => {
        if (p.slot !== slot) return false;
        const ps = state.parts.find((s) => s.id === p.id);
        return ps?.owned && ps.count > 0;
      });
      if (available.length === 0) continue;
      // Pick highest rarity, then highest total stat bonus
      available.sort((a, b) => {
        const rarityOrder: Record<MWRarity, number> = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 4 };
        const rDiff = (rarityOrder[b.rarity] ?? 0) - (rarityOrder[a.rarity] ?? 0);
        if (rDiff !== 0) return rDiff;
        const aTotal = Object.values(a.stats).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
        const bTotal = Object.values(b.stats).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
        return bTotal - aTotal;
      });
      result[slot] = available[0].id;
    }
    return result as { weapon: string | null; shield: string | null; core: string | null; mobility: string | null; sensor: string | null };
  }, [state]);

  // ---- Workshop Summary ----

  const mwGetWorkshopSummary = useCallback((): { totalValue: number; productionCapacity: number; battleReadiness: number; researchProgress: number } => {
    const totalValue = mwGetNetWorth();
    const productionCapacity = state.workshopLevel * 10 + state.automationLevel * 5;
    const playerStats = mwGetEquippedMechStats(state);
    const battleReadiness = playerStats ? Math.min(100, Math.floor(mwGetTotalPower(playerStats) / 30)) : 0;
    const researchProgress = state.upgrades.filter((u) => u.owned).length;
    return { totalValue, productionCapacity, battleReadiness, researchProgress };
  }, [state, mwGetNetWorth]);

  // ---- Get Parts by Category ----

  const mwGetPartsByCategory = useCallback((category: MWPartCategory): MWPartDef[] => {
    return MW_PARTS.filter((p) => p.category === category);
  }, []);

  // ---- Get Skills by Type ----

  const mwGetSkillsByType = useCallback((type: MWSkillType): MWPilotSkillDef[] => {
    return MW_PILOT_SKILLS.filter((s) => s.type === type);
  }, []);

  // ---- Get Upgrades by Required Level ----

  const mwGetUpgradesForLevel = useCallback((level: number): MWUpgradeModuleDef[] => {
    return MW_UPGRADE_MODULES.filter((u) => u.requiredLevel <= level);
  }, []);

  // ---- Get Mechs for Level ----

  const mwGetMechsForLevel = useCallback((level: number): MWMechFrameDef[] => {
    return MW_MECH_FRAMES.filter((m) => m.requiredLevel <= level);
  }, []);

  // ---- Get Parts for Level ----

  const mwGetPartsForLevel = useCallback((level: number): MWPartDef[] => {
    return MW_PARTS.filter((p) => p.requiredLevel <= level);
  }, []);

  // ---- Active Event Count ----

  const mwGetActiveEventCount = useCallback((): number => {
    return state.events.filter((e) => e.joined && !e.completed).length;
  }, [state.events]);

  // ---- Completed Event Count ----

  const mwGetCompletedEventCount = useCallback((): number => {
    return state.events.filter((e) => e.completed).length;
  }, [state.events]);

  // ---- Computed: Colors & Theme ----

  const mwGetThemeColors = useMemo((): typeof MW_COLORS => {
    return { ...MW_COLORS };
  }, []);

  // ---- Full reset ----

  const mwFullReset = useCallback((): void => {
    mwResetState();
  }, [mwResetState]);

  // ============================================================
  // Return
  // ============================================================

  return {
    // Core
    mwGetState,
    mwResetState,
    mwRandom,
    mwRandomInt,
    mwRandomPick,
    mwFullReset,
    // Level / XP
    mwGetLevel,
    mwGetXP,
    mwGetXPForNextLevel,
    mwGetProgress,
    mwGetOverallProgress,
    mwAddXP,
    // Coins
    mwGetCoins,
    mwAddCoins,
    mwSpendCoins,
    mwCanAfford,
    // Titles
    mwGetTitle,
    mwGetAllTitles,
    mwGetNextTitle,
    // Mech Frames
    mwGetMechFrames,
    mwGetMechById,
    mwGetMechState,
    mwGetOwnedMechs,
    mwGetMechsByRarity,
    mwGetMechCost,
    mwCanBuyMech,
    mwBuyMech,
    mwEquipMech,
    mwGetActiveMechId,
    mwGetActiveMechStats,
    mwGetMechPower,
    mwSellMech,
    // Workshop Bays
    mwGetWorkshopBays,
    mwGetBayById,
    mwGetCurrentBay,
    mwSwitchBay,
    mwIsBayUnlocked,
    mwGetUnlockedBays,
    mwUnlockBay,
    // Parts
    mwGetParts,
    mwGetPartById,
    mwGetPartState,
    mwGetOwnedParts,
    mwGetEquippedParts,
    mwGetPartsBySlot,
    mwGetPartsByRarity,
    mwGetPartCost,
    mwCanBuyPart,
    mwBuyPart,
    mwEquipPart,
    mwUnequipPart,
    mwSellPart,
    // Upgrade Modules
    mwGetUpgrades,
    mwGetUpgradeState,
    mwGetUpgradeCost,
    mwCanUpgradeModule,
    mwBuyUpgrade,
    mwGetUpgradeEffect,
    // Pilot Skills
    mwGetPilotSkills,
    mwGetSkillState,
    mwGetSkillCost,
    mwCanUpgradeSkill,
    mwBuySkill,
    mwGetSkillEffect,
    mwGetOwnedSkills,
    // Battle Arena
    mwGetOpponents,
    mwGetOpponentById,
    mwGetBattleStats,
    mwGetWinRate,
    mwSimulateBattle,
    // Salvage
    mwAddToSalvage,
    mwProcessSalvage,
    mwGetSalvageQueue,
    // Workshop
    mwGetWorkshopLevel,
    mwGetWorkshopCapacity,
    mwGetAutomationLevel,
    mwGetAutomationCost,
    mwUpgradeAutomation,
    mwGetAutomationEffect,
    mwUpgradeWorkshop,
    // Daily Challenge
    mwGetDailyChallenge,
    mwUpdateDailyProgress,
    mwIsDailyCompleted,
    mwClaimDailyReward,
    // Events
    mwGetEvents,
    mwGetEventState,
    mwJoinEvent,
    mwUpdateEventProgress,
    mwClaimEventReward,
    // Achievements
    mwGetAchievements,
    mwGetAchievementState,
    mwIsAchievementUnlocked,
    mwGetUnlockedAchievements,
    mwGetCompletedCount,
    // Rarity
    mwGetRarityInfo,
    mwGetAllRarities,
    // Stats
    mwGetStats,
    mwGetTips,
    mwGetCollectionProgress,
    mwGetRecommendedActions,
    // Reset
    mwResetBattleStreak,
    mwResetUpgrades,
    mwResetSkills,
    // Advanced
    mwGetNetWorth,
    mwGetBattlePreview,
    mwCompareMechs,
    mwGetOptimalLoadout,
    mwGetWorkshopSummary,
    mwGetPartsByCategory,
    mwGetSkillsByType,
    mwGetUpgradesForLevel,
    mwGetMechsForLevel,
    mwGetPartsForLevel,
    mwGetActiveEventCount,
    mwGetCompletedEventCount,
    // Theme
    mwGetThemeColors,
    // State (for persist integration)
    state,
  };
}
