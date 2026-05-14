// ============================================================================
// Cyber Arena Wire — Cyberpunk Mech Combat Game Module
// SSR-safe · React hooks · Fully typed TypeScript
// ============================================================================

import { useState, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CyMechClass =
  | "Scout"
  | "Striker"
  | "Sentinel"
  | "Vanguard"
  | "Phantom"
  | "Juggernaut"
  | "Ronin"
  | "Aegis"
  | "Wraith"
  | "Titan"
  | "Nova"
  | "Omega";

export type CyPartSlot =
  | "weapon"
  | "shield"
  | "core"
  | "mobility"
  | "sensor";

export type CyRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export type CyLeagueName =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master"
  | "Grandmaster"
  | "Legend";

export type CyBattlePhase = "idle" | "select" | "combat" | "result" | "fled";

export type CyTournamentFormat =
  | "bracket"
  | "round_robin"
  | "battle_royale"
  | "king_of_hill"
  | "capture_flag"
  | "survival";

export type CyQuestStatus = "available" | "accepted" | "completed" | "claimed";

export interface CyMechStats {
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

export interface CyMechDef {
  id: string;
  name: string;
  mechClass: CyMechClass;
  weight: number;
  tier: number;
  baseStats: CyMechStats;
  description: string;
}

export interface CyPartDef {
  id: string;
  name: string;
  slot: CyPartSlot;
  rarity: CyRarity;
  cost: number;
  stats: Partial<CyMechStats>;
  level: number;
  maxLevel: number;
  description: string;
}

export interface CyLeagueDef {
  name: CyLeagueName;
  rankMin: number;
  rankMax: number;
  bonusMultiplier: number;
  rewards: { coins: number; xp: number; parts: number };
  color: string;
}

export interface CyAbilityDef {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cooldown: number;
  type: "offensive" | "defensive" | "utility";
  power: number;
  effect: string;
  tier: number;
}

export interface CyOpponentDef {
  id: string;
  name: string;
  mechClass: CyMechClass;
  level: number;
  stats: CyMechStats;
  abilities: string[];
  personality: string;
  reward: number;
}

export interface CyTournamentDef {
  id: string;
  name: string;
  format: CyTournamentFormat;
  entryCost: number;
  maxParticipants: number;
  rounds: number;
  rewardCoins: number;
  rewardXP: number;
  description: string;
}

export interface CyEnhancementDef {
  id: string;
  name: string;
  description: string;
  slot: string;
  bonus: Partial<CyMechStats>;
  cost: number;
  tier: number;
}

export interface CyNpcDef {
  id: string;
  name: string;
  role: string;
  dialogue: string[];
  shop: string[];
  questGiver: boolean;
}

export interface CyAchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: { coins: number; xp: number };
  icon: string;
}

export interface CyMechBuild {
  mechId: string;
  weapon: string | null;
  shield: string | null;
  core: string | null;
  mobility: string | null;
  sensor: string | null;
  enhancementIds: string[];
}

export interface CyBattleState {
  phase: CyBattlePhase;
  opponentId: string;
  round: number;
  maxRounds: number;
  playerHP: number;
  playerMaxHP: number;
  opponentHP: number;
  opponentMaxHP: number;
  playerEnergy: number;
  opponentEnergy: number;
  log: string[];
  cooldowns: Record<string, number>;
  result: "win" | "loss" | "draw" | null;
  coinsEarned: number;
  xpEarned: number;
}

export interface CyQuest {
  id: string;
  name: string;
  description: string;
  status: CyQuestStatus;
  progress: number;
  goal: number;
  reward: { coins: number; xp: number };
  type: string;
}

export interface CyDailyTask {
  id: string;
  name: string;
  description: string;
  progress: number;
  goal: number;
  claimed: boolean;
  reward: { coins: number; xp: number };
}

export interface CyTeamMember {
  mechId: string;
  role: "lead" | "support" | "flex";
}

export interface CyPlayerState {
  level: number;
  xp: number;
  coins: number;
  totalXP: number;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  activeMechId: string | null;
  mechs: CyMechBuild[];
  parts: CyPartDef[];
  unlockedAbilityIds: string[];
  enhancementIds: string[];
  team: CyTeamMember[];
  quests: CyQuest[];
  achievements: string[];
  dailySeed: number;
  dailyClaimed: boolean;
  tournamentIds: string[];
  gamesPlayed: number;
  highestRank: number;
  opponentsDefeated: string[];
  partsBought: number;
  partsUpgraded: number;
  abilitiesUsed: number;
  battlesFled: number;
  tournamentsWon: number;
}

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32)
// ---------------------------------------------------------------------------

function cyCreateRNG(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cySeededInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function cySeededPick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------

export const CY_MECHS: CyMechDef[] = [
  {
    id: "scout_01",
    name: "Falcon-X Scout",
    mechClass: "Scout",
    weight: 25,
    tier: 1,
    baseStats: { hp: 400, attack: 50, defense: 30, speed: 90, energy: 60, critRate: 15, critDmg: 150, evasion: 20, accuracy: 85 },
    description: "Lightweight reconnaissance mech built for speed and precision strikes.",
  },
  {
    id: "striker_01",
    name: "Viper Striker",
    mechClass: "Striker",
    weight: 35,
    tier: 1,
    baseStats: { hp: 500, attack: 70, defense: 40, speed: 75, energy: 55, critRate: 12, critDmg: 160, evasion: 12, accuracy: 88 },
    description: "Balanced combat mech optimized for aggressive offensive maneuvers.",
  },
  {
    id: "sentinel_01",
    name: "Bastion Sentinel",
    mechClass: "Sentinel",
    weight: 55,
    tier: 2,
    baseStats: { hp: 700, attack: 45, defense: 80, speed: 45, energy: 70, critRate: 8, critDmg: 130, evasion: 5, accuracy: 80 },
    description: "Heavy defensive mech designed to hold positions and protect allies.",
  },
  {
    id: "vanguard_01",
    name: "Ironclad Vanguard",
    mechClass: "Vanguard",
    weight: 50,
    tier: 2,
    baseStats: { hp: 650, attack: 60, defense: 65, speed: 55, energy: 65, critRate: 10, critDmg: 140, evasion: 8, accuracy: 83 },
    description: "Front-line combat mech combining offense and defense capabilities.",
  },
  {
    id: "phantom_01",
    name: "Spectre Phantom",
    mechClass: "Phantom",
    weight: 30,
    tier: 3,
    baseStats: { hp: 450, attack: 65, defense: 35, speed: 95, energy: 80, critRate: 20, critDmg: 180, evasion: 25, accuracy: 90 },
    description: "Stealth-class mech built for ambush tactics and critical strikes.",
  },
  {
    id: "juggernaut_01",
    name: "Colossus Juggernaut",
    mechClass: "Juggernaut",
    weight: 80,
    tier: 3,
    baseStats: { hp: 1000, attack: 55, defense: 90, speed: 30, energy: 50, critRate: 5, critDmg: 120, evasion: 3, accuracy: 75 },
    description: "Massive assault mech with overwhelming HP and armor plating.",
  },
  {
    id: "ronin_01",
    name: "Blade Ronin",
    mechClass: "Ronin",
    weight: 40,
    tier: 4,
    baseStats: { hp: 550, attack: 85, defense: 45, speed: 70, energy: 75, critRate: 18, critDmg: 170, evasion: 15, accuracy: 92 },
    description: "Duelist mech specializing in high-damage melee and ranged combos.",
  },
  {
    id: "aegis_01",
    name: "Fortress Aegis",
    mechClass: "Aegis",
    weight: 70,
    tier: 4,
    baseStats: { hp: 900, attack: 40, defense: 100, speed: 35, energy: 85, critRate: 4, critDmg: 110, evasion: 5, accuracy: 78 },
    description: "Ultimate shield mech with energy barrier generation capabilities.",
  },
  {
    id: "wraith_01",
    name: "Eclipse Wraith",
    mechClass: "Wraith",
    weight: 28,
    tier: 5,
    baseStats: { hp: 420, attack: 90, defense: 30, speed: 100, energy: 90, critRate: 25, critDmg: 200, evasion: 30, accuracy: 95 },
    description: "Experimental stealth mech with cloaking and teleportation modules.",
  },
  {
    id: "titan_01",
    name: "Apocalypse Titan",
    mechClass: "Titan",
    weight: 95,
    tier: 5,
    baseStats: { hp: 1200, attack: 75, defense: 85, speed: 25, energy: 60, critRate: 8, critDmg: 140, evasion: 2, accuracy: 76 },
    description: "Apocalyptic-class siege mech with devastating area-of-effect attacks.",
  },
  {
    id: "nova_01",
    name: "Pulsar Nova",
    mechClass: "Nova",
    weight: 45,
    tier: 6,
    baseStats: { hp: 600, attack: 80, defense: 55, speed: 80, energy: 100, critRate: 15, critDmg: 160, evasion: 18, accuracy: 90 },
    description: "Energy-based mech that channels plasma for both offense and defense.",
  },
  {
    id: "omega_01",
    name: "Singularity Omega",
    mechClass: "Omega",
    weight: 100,
    tier: 6,
    baseStats: { hp: 1500, attack: 100, defense: 95, speed: 50, energy: 120, critRate: 12, critDmg: 180, evasion: 10, accuracy: 88 },
    description: "Legendary Omega-class mech — the pinnacle of cybernetic warfare engineering.",
  },
];

export const CY_PARTS: CyPartDef[] = [
  // --- Weapons (8) ---
  { id: "w_laser_rifle", name: "Laser Rifle Mk.I", slot: "weapon", rarity: "Common", cost: 200, stats: { attack: 10, accuracy: 5 }, level: 1, maxLevel: 10, description: "Standard-issue focused energy weapon." },
  { id: "w_plasma_cannon", name: "Plasma Cannon", slot: "weapon", rarity: "Uncommon", cost: 500, stats: { attack: 22, energy: -5 }, level: 1, maxLevel: 10, description: "High-power plasma projectile launcher." },
  { id: "w_railgun", name: "Electromagnetic Railgun", slot: "weapon", rarity: "Rare", cost: 1200, stats: { attack: 38, critRate: 5, accuracy: 10 }, level: 1, maxLevel: 10, description: "Accelerates projectiles to hypersonic velocities." },
  { id: "w_pulverizer", name: "Neutron Pulverizer", slot: "weapon", rarity: "Epic", cost: 3000, stats: { attack: 55, critDmg: 30, speed: -5 }, level: 1, maxLevel: 10, description: "Devastating neutron bombardment device." },
  { id: "w_void_blade", name: "Void Edge Blade", slot: "weapon", rarity: "Legendary", cost: 8000, stats: { attack: 75, critRate: 10, critDmg: 50, evasion: 5 }, level: 1, maxLevel: 10, description: "Dimensional blade that cuts through any armor." },
  { id: "w_chain_gun", name: "Gatling Chain Gun", slot: "weapon", rarity: "Common", cost: 250, stats: { attack: 8, accuracy: 8 }, level: 1, maxLevel: 10, description: "Rapid-fire kinetic bullet weapon system." },
  { id: "w_missile_pod", name: "Homing Missile Pod", slot: "weapon", rarity: "Uncommon", cost: 600, stats: { attack: 18, accuracy: 15, speed: -3 }, level: 1, maxLevel: 10, description: "Guided missile system with lock-on capability." },
  { id: "w_quantum_lance", name: "Quantum Resonance Lance", slot: "weapon", rarity: "Rare", cost: 1500, stats: { attack: 42, critRate: 8, energy: 10 }, level: 1, maxLevel: 10, description: "Channels quantum fluctuations into a focused beam." },
  // --- Shields (8) ---
  { id: "s_barrier_1", name: "Kinetic Barrier", slot: "shield", rarity: "Common", cost: 200, stats: { defense: 10, hp: 20 }, level: 1, maxLevel: 10, description: "Basic force field against kinetic damage." },
  { id: "s_energy_wall", name: "Energy Wall Generator", slot: "shield", rarity: "Uncommon", cost: 550, stats: { defense: 22, energy: 10 }, level: 1, maxLevel: 10, description: "Projects a sustained energy barrier." },
  { id: "s_nanofiber", name: "Nanofiber Weave", slot: "shield", rarity: "Rare", cost: 1300, stats: { defense: 35, hp: 50, evasion: 5 }, level: 1, maxLevel: 10, description: "Self-repairing nanofiber armor plating." },
  { id: "s_dark_matter", name: "Dark Matter Shield", slot: "shield", rarity: "Epic", cost: 3200, stats: { defense: 55, hp: 80, critDmg: 15 }, level: 1, maxLevel: 10, description: "Absorbs incoming damage into dark matter pockets." },
  { id: "s_omega_field", name: "Omega Singularity Field", slot: "shield", rarity: "Legendary", cost: 8500, stats: { defense: 80, hp: 150, energy: 20 }, level: 1, maxLevel: 10, description: "Ultimate defensive barrier powered by micro-singularity." },
  { id: "s_compound", name: "Compound Armor Plate", slot: "shield", rarity: "Common", cost: 180, stats: { defense: 12, hp: 30 }, level: 1, maxLevel: 10, description: "Layered composite armor plating." },
  { id: "s_plasma_aegis", name: "Plasma Aegis Array", slot: "shield", rarity: "Uncommon", cost: 600, stats: { defense: 25, hp: 40, energy: 5 }, level: 1, maxLevel: 10, description: "Rotating plasma orbs that deflect projectiles." },
  { id: "s_gravity_repel", name: "Gravity Repulsor", slot: "shield", rarity: "Rare", cost: 1400, stats: { defense: 40, evasion: 10, speed: 5 }, level: 1, maxLevel: 10, description: "Gravity field that pushes away incoming threats." },
  // --- Cores (8) ---
  { id: "c_fusion_1", name: "Fusion Cell Mk.I", slot: "core", rarity: "Common", cost: 200, stats: { energy: 15, hp: 30 }, level: 1, maxLevel: 10, description: "Compact fusion reactor for basic energy needs." },
  { id: "c_quantum_core", name: "Quantum Core", slot: "core", rarity: "Uncommon", cost: 600, stats: { energy: 30, attack: 8, defense: 8 }, level: 1, maxLevel: 10, description: "Quantum-state energy source with balanced output." },
  { id: "c_antimatter", name: "Antimatter Reactor", slot: "core", rarity: "Rare", cost: 1500, stats: { energy: 50, attack: 15, critRate: 5 }, level: 1, maxLevel: 10, description: "Harnesses antimatter annihilation for massive power." },
  { id: "c_dark_energy", name: "Dark Energy Nexus", slot: "core", rarity: "Epic", cost: 3500, stats: { energy: 75, hp: 60, evasion: 8 }, level: 1, maxLevel: 10, description: "Taps into dark energy for sustained power output." },
  { id: "c_singularity", name: "Singularity Heart", slot: "core", rarity: "Legendary", cost: 9000, stats: { energy: 120, hp: 100, attack: 20, defense: 20 }, level: 1, maxLevel: 10, description: "Contains a controlled singularity — limitless energy." },
  { id: "c_solar", name: "Solar Array", slot: "core", rarity: "Common", cost: 150, stats: { energy: 12, speed: 5 }, level: 1, maxLevel: 10, description: "Concentrated solar energy collection system." },
  { id: "c_cryo", name: "Cryo-Cell Stabilizer", slot: "core", rarity: "Uncommon", cost: 550, stats: { energy: 25, defense: 12, hp: 40 }, level: 1, maxLevel: 10, description: "Cryo-cooled energy cell with heat dissipation." },
  { id: "c_plasma_vortex", name: "Plasma Vortex Engine", slot: "core", rarity: "Rare", cost: 1600, stats: { energy: 45, attack: 18, speed: -3 }, level: 1, maxLevel: 10, description: "Generates a contained plasma vortex for raw power." },
  // --- Mobility (8) ---
  { id: "m_thrusters", name: "Standard Thrusters", slot: "mobility", rarity: "Common", cost: 200, stats: { speed: 12, evasion: 5 }, level: 1, maxLevel: 10, description: "Basic ion thruster assembly." },
  { id: "m_grav_boots", name: "Gravity Boots", slot: "mobility", rarity: "Uncommon", cost: 500, stats: { speed: 20, evasion: 10, hp: 15 }, level: 1, maxLevel: 10, description: "Anti-gravity locomotion system." },
  { id: "m_phase_drive", name: "Phase Shift Drive", slot: "mobility", rarity: "Rare", cost: 1300, stats: { speed: 35, evasion: 18, accuracy: 5 }, level: 1, maxLevel: 10, description: "Enables short-range phase shifting for rapid repositioning." },
  { id: "m_warp_jets", name: "Micro-Warp Jets", slot: "mobility", rarity: "Epic", cost: 3000, stats: { speed: 50, evasion: 25, critRate: 5 }, level: 1, maxLevel: 10, description: "Warp-capable jet system for teleport-like movement." },
  { id: "m_infinity_glide", name: "Infinity Glide System", slot: "mobility", rarity: "Legendary", cost: 7500, stats: { speed: 85, evasion: 35, accuracy: 15 }, level: 1, maxLevel: 10, description: "Dimensional glide system — ignore terrain entirely." },
  { id: "m_tracks", name: "Heavy Tread System", slot: "mobility", rarity: "Common", cost: 180, stats: { speed: 8, defense: 5, hp: 20 }, level: 1, maxLevel: 10, description: "Reinforced tank treads for stable movement." },
  { id: "m_hover_pad", name: "Hover Pad Array", slot: "mobility", rarity: "Uncommon", cost: 450, stats: { speed: 23, evasion: 8, accuracy: 5 }, level: 1, maxLevel: 10, description: "Magnetic hover pads for smooth traversal." },
  { id: "m_dash_circuit", name: "Overclock Dash Circuit", slot: "mobility", rarity: "Rare", cost: 1200, stats: { speed: 30, accuracy: 10, critRate: 3 }, level: 1, maxLevel: 10, description: "Overclocked movement circuit with burst dash." },
  // --- Sensors (8) ---
  { id: "sn_radar_1", name: "Tactical Radar", slot: "sensor", rarity: "Common", cost: 200, stats: { accuracy: 8, critRate: 3 }, level: 1, maxLevel: 10, description: "Standard range tactical radar system." },
  { id: "sn_infrared", name: "Infrared Scanner", slot: "sensor", rarity: "Uncommon", cost: 500, stats: { accuracy: 15, critRate: 5, evasion: 3 }, level: 1, maxLevel: 10, description: "Heat signature detection and tracking suite." },
  { id: "sn_neural_link", name: "Neural Link Interface", slot: "sensor", rarity: "Rare", cost: 1200, stats: { accuracy: 25, critRate: 8, energy: 10 }, level: 1, maxLevel: 10, description: "Direct neural interface for enhanced targeting." },
  { id: "sn_psi_array", name: "Psionic Detection Array", slot: "sensor", rarity: "Epic", cost: 2800, stats: { accuracy: 35, critRate: 12, critDmg: 20 }, level: 1, maxLevel: 10, description: "Psionic wave detector that predicts enemy movements." },
  { id: "sn_omniscient", name: "Omniscient Eye Core", slot: "sensor", rarity: "Legendary", cost: 7000, stats: { accuracy: 50, critRate: 15, critDmg: 30, evasion: 10 }, level: 1, maxLevel: 10, description: "All-knowing sensor core — perceives everything." },
  { id: "sn_sonar", name: "Deep Sonar Array", slot: "sensor", rarity: "Common", cost: 180, stats: { accuracy: 10, evasion: 5 }, level: 1, maxLevel: 10, description: "Sonar-based detection for enclosed environments." },
  { id: "sn_emp_scope", name: "EMP Scope", slot: "sensor", rarity: "Uncommon", cost: 550, stats: { accuracy: 12, attack: 8, energy: -5 }, level: 1, maxLevel: 10, description: "Electromagnetic pulse targeting scope." },
  { id: "sn_quantum_sight", name: "Quantum Sight Module", slot: "sensor", rarity: "Rare", cost: 1400, stats: { accuracy: 28, critRate: 10, speed: 5 }, level: 1, maxLevel: 10, description: "Quantum-entangled targeting with predictive aim." },
];

export const CY_LEAGUES: CyLeagueDef[] = [
  { name: "Bronze", rankMin: 0, rankMax: 399, bonusMultiplier: 1.0, rewards: { coins: 50, xp: 20, parts: 0 }, color: "#cd7f32" },
  { name: "Silver", rankMin: 400, rankMax: 899, bonusMultiplier: 1.2, rewards: { coins: 100, xp: 40, parts: 1 }, color: "#c0c0c0" },
  { name: "Gold", rankMin: 900, rankMax: 1499, bonusMultiplier: 1.5, rewards: { coins: 200, xp: 60, parts: 2 }, color: "#ffd700" },
  { name: "Platinum", rankMin: 1500, rankMax: 2199, bonusMultiplier: 1.8, rewards: { coins: 350, xp: 90, parts: 3 }, color: "#e5e4e2" },
  { name: "Diamond", rankMin: 2200, rankMax: 2999, bonusMultiplier: 2.2, rewards: { coins: 500, xp: 130, parts: 4 }, color: "#b9f2ff" },
  { name: "Master", rankMin: 3000, rankMax: 3999, bonusMultiplier: 2.7, rewards: { coins: 750, xp: 180, parts: 5 }, color: "#ff6ec7" },
  { name: "Grandmaster", rankMin: 4000, rankMax: 4999, bonusMultiplier: 3.3, rewards: { coins: 1100, xp: 250, parts: 7 }, color: "#ff4500" },
  { name: "Legend", rankMin: 5000, rankMax: 9999, bonusMultiplier: 4.0, rewards: { coins: 1500, xp: 350, parts: 10 }, color: "#00ff88" },
];

export const CY_ABILITIES: CyAbilityDef[] = [
  { id: "ab_overcharge", name: "Overcharge", description: "Boost attack by 50% for 2 rounds.", energyCost: 20, cooldown: 3, type: "offensive", power: 50, effect: "attack_boost", tier: 1 },
  { id: "ab_shield_burst", name: "Shield Burst", description: "Instantly gain 30% max HP as shield.", energyCost: 15, cooldown: 2, type: "defensive", power: 30, effect: "hp_boost", tier: 1 },
  { id: "ab_scan", name: "Tactical Scan", description: "Reveal opponent weakness, +20 accuracy.", energyCost: 10, cooldown: 2, type: "utility", power: 20, effect: "accuracy_boost", tier: 1 },
  { id: "ab_power_strike", name: "Power Strike", description: "Deal 200% weapon damage.", energyCost: 25, cooldown: 3, type: "offensive", power: 100, effect: "heavy_damage", tier: 1 },
  { id: "ab_dodge_protocol", name: "Dodge Protocol", description: "Double evasion for 1 round.", energyCost: 12, cooldown: 3, type: "defensive", power: 50, effect: "evasion_boost", tier: 1 },
  { id: "ab_energy_drain", name: "Energy Drain", description: "Drain 20 energy from opponent.", energyCost: 10, cooldown: 4, type: "offensive", power: 20, effect: "energy_steal", tier: 2 },
  { id: "ab_repair_nanobots", name: "Repair Nanobots", description: "Restore 15% max HP.", energyCost: 18, cooldown: 3, type: "defensive", power: 15, effect: "heal", tier: 2 },
  { id: "ab_missile_barrage", name: "Missile Barrage", description: "Launch 5 missiles dealing 40% damage each.", energyCost: 35, cooldown: 4, type: "offensive", power: 80, effect: "multi_hit", tier: 2 },
  { id: "ab_stealth_mode", name: "Stealth Mode", description: "Become untargetable for 1 round.", energyCost: 22, cooldown: 4, type: "defensive", power: 100, effect: "invulnerable", tier: 2 },
  { id: "ab_emp_pulse", name: "EMP Pulse", description: "Disable opponent ability for 2 rounds.", energyCost: 30, cooldown: 5, type: "utility", power: 60, effect: "disable", tier: 2 },
  { id: "ab_rage_mode", name: "Rage Mode", description: "Attack +80%, defense -30% for 2 rounds.", energyCost: 28, cooldown: 4, type: "offensive", power: 80, effect: "rage", tier: 3 },
  { id: "ab_fortify", name: "Fortify", description: "Defense +60% for 3 rounds.", energyCost: 22, cooldown: 4, type: "defensive", power: 60, effect: "defense_boost", tier: 3 },
  { id: "ab_precision_strike", name: "Precision Strike", description: "Guaranteed critical hit for 250% damage.", energyCost: 35, cooldown: 5, type: "offensive", power: 120, effect: "guaranteed_crit", tier: 3 },
  { id: "ab_counter_attack", name: "Counter Protocol", description: "Reflect 40% of incoming damage.", energyCost: 20, cooldown: 3, type: "defensive", power: 40, effect: "reflect", tier: 3 },
  { id: "ab_hack_systems", name: "Hack Systems", description: "Reduce opponent accuracy and evasion by 30%.", energyCost: 25, cooldown: 4, type: "utility", power: 30, effect: "debuff", tier: 3 },
  { id: "ab_plasma_storm", name: "Plasma Storm", description: "AoE dealing 70% damage for 3 rounds.", energyCost: 45, cooldown: 6, type: "offensive", power: 90, effect: "dot", tier: 4 },
  { id: "ab_quantum_shield", name: "Quantum Shield", description: "Absorb next 3 attacks completely.", energyCost: 40, cooldown: 6, type: "defensive", power: 100, effect: "absorb", tier: 4 },
  { id: "ab_overclock", name: "System Overclock", description: "All stats +25% for 2 rounds.", energyCost: 35, cooldown: 5, type: "utility", power: 25, effect: "all_boost", tier: 4 },
  { id: "ab_orbital_laser", name: "Orbital Laser", description: "Call down orbital strike for 300% damage.", energyCost: 60, cooldown: 8, type: "offensive", power: 150, effect: "ultimate_damage", tier: 4 },
  { id: "ab_clone_decoy", name: "Clone Decoy", description: "Create 2 decoys that absorb hits.", energyCost: 28, cooldown: 5, type: "defensive", power: 50, effect: "decoy", tier: 4 },
  { id: "ab_virus_inject", name: "Virus Injection", description: "Deal 10% max HP damage per round for 4 rounds.", energyCost: 30, cooldown: 5, type: "offensive", power: 40, effect: "poison", tier: 5 },
  { id: "ab_time_dialate", name: "Time Dilate", description: "Take 2 actions this round.", energyCost: 50, cooldown: 7, type: "utility", power: 100, effect: "extra_turn", tier: 5 },
  { id: "ab_neural_overload", name: "Neural Overload", description: "Stun opponent for 1 round, deal 80% damage.", energyCost: 45, cooldown: 6, type: "offensive", power: 80, effect: "stun", tier: 5 },
  { id: "ab_dimensional_fold", name: "Dimensional Fold", description: "Teleport behind enemy, deal 180% damage.", energyCost: 40, cooldown: 5, type: "offensive", power: 90, effect: "teleport_strike", tier: 5 },
  { id: "ab_nanite_swarm", name: "Nanite Swarm", description: "Repair 25% HP and buff defense by 40%.", energyCost: 38, cooldown: 5, type: "defensive", power: 65, effect: "heal_and_buff", tier: 5 },
  { id: "ab_hyper_beam", name: "Hyper Beam", description: "Charge beam dealing 350% damage over 1 round.", energyCost: 70, cooldown: 9, type: "offensive", power: 175, effect: "charge_beam", tier: 6 },
  { id: "ab_absolute_zero", name: "Absolute Zero", description: "Freeze opponent for 2 rounds, 100% evasion.", energyCost: 55, cooldown: 8, type: "utility", power: 100, effect: "freeze", tier: 6 },
  { id: "ab_omega_barrier", name: "Omega Barrier", description: "Invincible for 1 round, heal 20% HP.", energyCost: 60, cooldown: 8, type: "defensive", power: 100, effect: "invincible_heal", tier: 6 },
  { id: "ab_singularity_crush", name: "Singularity Crush", description: "Collapsing singularity for 400% damage.", energyCost: 80, cooldown: 10, type: "offensive", power: 200, effect: "singularity", tier: 6 },
  { id: "ab_mind_break", name: "Mind Break", description: "Confuse opponent — attacks self for 2 rounds.", energyCost: 50, cooldown: 7, type: "utility", power: 80, effect: "confuse", tier: 6 },
  { id: "ab_adaptive_armor", name: "Adaptive Armor", description: "Gain resistance to last damage type taken.", energyCost: 32, cooldown: 4, type: "defensive", power: 50, effect: "adapt", tier: 6 },
  { id: "ab_desintegrate", name: "Desintegrate", description: "Reduce opponent max HP by 15%.", energyCost: 65, cooldown: 9, type: "offensive", power: 150, effect: "hp_reduce", tier: 6 },
  { id: "ab_rewind", name: "Temporal Rewind", description: "Rewind HP to value 3 rounds ago.", energyCost: 55, cooldown: 8, type: "defensive", power: 100, effect: "rewind_hp", tier: 6 },
  { id: "ab_judge", name: "Final Judgment", description: "Instant KO if opponent below 20% HP.", energyCost: 75, cooldown: 10, type: "offensive", power: 300, effect: "execute", tier: 6 },
  { id: "ab_sync_strike", name: "Sync Strike", description: "Both team members attack simultaneously.", energyCost: 45, cooldown: 6, type: "offensive", power: 100, effect: "sync_attack", tier: 5 },
  { id: "ab_energy_siphon", name: "Energy Siphon", description: "Steal 40 energy, gain 10% attack per 10 energy.", energyCost: 15, cooldown: 4, type: "utility", power: 40, effect: "siphon", tier: 3 },
  { id: "ab_decoy_field", name: "Decoy Field", description: "50% chance attacks hit decoy instead.", energyCost: 20, cooldown: 3, type: "defensive", power: 50, effect: "decoy_field", tier: 3 },
  { id: "ab_heat_cascade", name: "Heat Cascade", description: "Stacking burn: 5% + 5% per stack, max 5 stacks.", energyCost: 25, cooldown: 3, type: "offensive", power: 25, effect: "stack_burn", tier: 4 },
  { id: "ab_chaff_cloud", name: "Chaff Cloud", description: "Reduce opponent accuracy by 50% for 2 rounds.", energyCost: 15, cooldown: 3, type: "defensive", power: 50, effect: "accuracy_debuff", tier: 2 },
  { id: "ab_data_mine", name: "Data Mine", description: "Plant mine that deals 150% damage when triggered.", energyCost: 20, cooldown: 4, type: "offensive", power: 75, effect: "trap", tier: 3 },
  { id: "ab_magnetic_lock", name: "Magnetic Lock", description: "Root opponent for 1 round, +30% hit chance.", energyCost: 18, cooldown: 3, type: "utility", power: 30, effect: "root", tier: 2 },
];

export const CY_OPPONENTS: CyOpponentDef[] = [
  { id: "opp_rust_bucket", name: "Rust Bucket", mechClass: "Scout", level: 1, stats: { hp: 380, attack: 42, defense: 25, speed: 85, energy: 55, critRate: 12, critDmg: 140, evasion: 18, accuracy: 80 }, abilities: ["ab_overcharge", "ab_scan"], personality: "reckless", reward: 50 },
  { id: "opp_junker", name: "The Junker", mechClass: "Sentinel", level: 3, stats: { hp: 600, attack: 38, defense: 65, speed: 35, energy: 60, critRate: 6, critDmg: 120, evasion: 4, accuracy: 75 }, abilities: ["ab_shield_burst", "ab_fortify"], personality: "defensive", reward: 80 },
  { id: "opp_nova_kid", name: "Nova Kid", mechClass: "Striker", level: 5, stats: { hp: 480, attack: 62, defense: 35, speed: 70, energy: 50, critRate: 10, critDmg: 155, evasion: 10, accuracy: 85 }, abilities: ["ab_power_strike", "ab_dodge_protocol"], personality: "aggressive", reward: 120 },
  { id: "opp_phantom_x", name: "Phantom-X", mechClass: "Phantom", level: 8, stats: { hp: 430, attack: 58, defense: 30, speed: 90, energy: 75, critRate: 18, critDmg: 175, evasion: 22, accuracy: 88 }, abilities: ["ab_stealth_mode", "ab_precision_strike"], personality: "elusive", reward: 180 },
  { id: "opp_iron_will", name: "Iron Will", mechClass: "Vanguard", level: 10, stats: { hp: 620, attack: 55, defense: 60, speed: 50, energy: 60, critRate: 9, critDmg: 135, evasion: 7, accuracy: 82 }, abilities: ["ab_counter_attack", "ab_rage_mode"], personality: "balanced", reward: 220 },
  { id: "opp_scrap_queen", name: "Scrap Queen", mechClass: "Juggernaut", level: 12, stats: { hp: 900, attack: 48, defense: 80, speed: 28, energy: 45, critRate: 4, critDmg: 115, evasion: 2, accuracy: 72 }, abilities: ["ab_fortify", "ab_missile_barrage"], personality: "stubborn", reward: 280 },
  { id: "opp_blitz", name: "Blitz", mechClass: "Ronin", level: 15, stats: { hp: 520, attack: 78, defense: 40, speed: 68, energy: 70, critRate: 16, critDmg: 165, evasion: 14, accuracy: 90 }, abilities: ["ab_rage_mode", "ab_precision_strike"], personality: "cocky", reward: 350 },
  { id: "opp_spectre", name: "Spectre", mechClass: "Wraith", level: 18, stats: { hp: 400, attack: 85, defense: 28, speed: 95, energy: 85, critRate: 22, critDmg: 190, evasion: 28, accuracy: 92 }, abilities: ["ab_stealth_mode", "ab_dimensional_fold", "ab_neural_overload"], personality: "mysterious", reward: 420 },
  { id: "opp_fortress", name: "The Fortress", mechClass: "Aegis", level: 20, stats: { hp: 850, attack: 35, defense: 95, speed: 30, energy: 80, critRate: 3, critDmg: 108, evasion: 4, accuracy: 76 }, abilities: ["ab_quantum_shield", "ab_adaptive_armor"], personality: "patient", reward: 500 },
  { id: "opp_pyro", name: "Pyromaniac", mechClass: "Striker", level: 22, stats: { hp: 550, attack: 72, defense: 38, speed: 65, energy: 65, critRate: 14, critDmg: 160, evasion: 11, accuracy: 86 }, abilities: ["ab_plasma_storm", "ab_heat_cascade", "ab_missile_barrage"], personality: "chaotic", reward: 580 },
  { id: "opp_glitch", name: "Glitch", mechClass: "Phantom", level: 25, stats: { hp: 460, attack: 80, defense: 32, speed: 92, energy: 90, critRate: 24, critDmg: 195, evasion: 30, accuracy: 94 }, abilities: ["ab_hack_systems", "ab_virus_inject", "ab_time_dialate"], personality: "unpredictable", reward: 650 },
  { id: "opp_titan_prime", name: "Titan Prime", mechClass: "Titan", level: 28, stats: { hp: 1100, attack: 70, defense: 82, speed: 22, energy: 55, critRate: 7, critDmg: 135, evasion: 2, accuracy: 74 }, abilities: ["ab_orbital_laser", "ab_fortify", "ab_plasma_storm"], personality: "dominant", reward: 740 },
  { id: "opp_nova_pilot", name: "Nova Pilot", mechClass: "Nova", level: 30, stats: { hp: 580, attack: 76, defense: 50, speed: 78, energy: 95, critRate: 14, critDmg: 155, evasion: 16, accuracy: 89 }, abilities: ["ab_plasma_storm", "ab_overclock", "ab_energy_drain"], personality: "strategic", reward: 820 },
  { id: "opp_shadow_fang", name: "Shadow Fang", mechClass: "Wraith", level: 32, stats: { hp: 440, attack: 92, defense: 30, speed: 98, energy: 88, critRate: 26, critDmg: 200, evasion: 32, accuracy: 96 }, abilities: ["ab_stealth_mode", "ab_dimensional_fold", "ab_precision_strike"], personality: "lethal", reward: 900 },
  { id: "opp_iron_clad", name: "Iron Clad", mechClass: "Juggernaut", level: 34, stats: { hp: 980, attack: 52, defense: 88, speed: 26, energy: 52, critRate: 5, critDmg: 118, evasion: 3, accuracy: 73 }, abilities: ["ab_fortify", "ab_counter_attack", "ab_nanite_swarm"], personality: "unyielding", reward: 980 },
  { id: "opp_zero_day", name: "Zero Day", mechClass: "Phantom", level: 36, stats: { hp: 480, attack: 88, defense: 35, speed: 96, energy: 92, critRate: 22, critDmg: 185, evasion: 28, accuracy: 93 }, abilities: ["ab_hack_systems", "ab_mind_break", "ab_virus_inject"], personality: "malicious", reward: 1060 },
  { id: "opp_warlord", name: "Warlord Kael", mechClass: "Titan", level: 38, stats: { hp: 1180, attack: 78, defense: 85, speed: 28, energy: 62, critRate: 8, critDmg: 140, evasion: 3, accuracy: 78 }, abilities: ["ab_orbital_laser", "ab_rage_mode", "ab_singularity_crush"], personality: "ruthless", reward: 1150 },
  { id: "opp_cryptid", name: "Cryptid", mechClass: "Omega", level: 40, stats: { hp: 1400, attack: 92, defense: 88, speed: 45, energy: 110, critRate: 10, critDmg: 170, evasion: 8, accuracy: 85 }, abilities: ["ab_omega_barrier", "ab_hyper_beam", "ab_singularity_crush"], personality: "enigmatic", reward: 1300 },
  { id: "opp_neon_viper", name: "Neon Viper", mechClass: "Ronin", level: 42, stats: { hp: 560, attack: 90, defense: 42, speed: 82, energy: 80, critRate: 20, critDmg: 180, evasion: 20, accuracy: 94 }, abilities: ["ab_precision_strike", "ab_sync_strike", "ab_dimensional_fold"], personality: "precise", reward: 1400 },
  { id: "opp_overseer", name: "The Overseer", mechClass: "Aegis", level: 44, stats: { hp: 920, attack: 42, defense: 98, speed: 32, energy: 88, critRate: 4, critDmg: 112, evasion: 5, accuracy: 77 }, abilities: ["ab_omega_barrier", "ab_quantum_shield", "ab_adaptive_armor"], personality: "controlling", reward: 1500 },
  { id: "opp_nemesis", name: "Nemesis", mechClass: "Nova", level: 46, stats: { hp: 620, attack: 88, defense: 55, speed: 82, energy: 100, critRate: 16, critDmg: 165, evasion: 18, accuracy: 92 }, abilities: ["ab_plasma_storm", "ab_hyper_beam", "ab_overclock"], personality: "vengeful", reward: 1600 },
  { id: "opp_void_walker", name: "Void Walker", mechClass: "Wraith", level: 48, stats: { hp: 500, attack: 95, defense: 32, speed: 100, energy: 95, critRate: 28, critDmg: 210, evasion: 35, accuracy: 97 }, abilities: ["ab_dimensional_fold", "ab_time_dialate", "ab_mind_break"], personality: "otherworldly", reward: 1750 },
  { id: "opp_thunder_god", name: "Thunder God", mechClass: "Titan", level: 50, stats: { hp: 1300, attack: 95, defense: 90, speed: 30, energy: 70, critRate: 10, critDmg: 150, evasion: 4, accuracy: 80 }, abilities: ["ab_orbital_laser", "ab_singularity_crush", "ab_desintegrate"], personality: "godlike", reward: 2000 },
  { id: "opp_circuit_breaker", name: "Circuit Breaker", mechClass: "Phantom", level: 5, stats: { hp: 410, attack: 55, defense: 28, speed: 88, energy: 68, critRate: 16, critDmg: 160, evasion: 20, accuracy: 84 }, abilities: ["ab_emp_pulse", "ab_energy_drain"], personality: "disruptive", reward: 100 },
  { id: "opp_grid_lock", name: "Grid Lock", mechClass: "Sentinel", level: 8, stats: { hp: 680, attack: 40, defense: 70, speed: 38, energy: 62, critRate: 5, critDmg: 125, evasion: 5, accuracy: 78 }, abilities: ["ab_shield_burst", "ab_magnetic_lock"], personality: "controlling", reward: 160 },
  { id: "opp_flux", name: "Flux", mechClass: "Nova", level: 12, stats: { hp: 520, attack: 60, defense: 42, speed: 72, energy: 72, critRate: 12, critDmg: 150, evasion: 12, accuracy: 86 }, abilities: ["ab_energy_drain", "ab_overcharge"], personality: "adaptive", reward: 250 },
  { id: "opp_warp_drive", name: "Warp Drive", mechClass: "Scout", level: 15, stats: { hp: 420, attack: 58, defense: 26, speed: 96, energy: 65, critRate: 18, critDmg: 170, evasion: 24, accuracy: 88 }, abilities: ["ab_dodge_protocol", "ab_scan"], personality: "evasive", reward: 320 },
  { id: "opp_magma_core", name: "Magma Core", mechClass: "Juggernaut", level: 20, stats: { hp: 950, attack: 55, defense: 82, speed: 25, energy: 48, critRate: 5, critDmg: 120, evasion: 2, accuracy: 74 }, abilities: ["ab_heat_cascade", "ab_missile_barrage"], personality: "destructive", reward: 480 },
  { id: "opp_echo", name: "Echo", mechClass: "Ronin", level: 24, stats: { hp: 540, attack: 74, defense: 38, speed: 74, energy: 72, critRate: 15, critDmg: 160, evasion: 14, accuracy: 88 }, abilities: ["ab_clone_decoy", "ab_counter_attack"], personality: "reflective", reward: 560 },
  { id: "opp_chrome", name: "Chrome", mechClass: "Vanguard", level: 28, stats: { hp: 670, attack: 64, defense: 62, speed: 52, energy: 64, critRate: 10, critDmg: 140, evasion: 8, accuracy: 84 }, abilities: ["ab_rage_mode", "ab_fortify", "ab_counter_attack"], personality: "relentless", reward: 680 },
  { id: "opp_stardust", name: "Stardust", mechClass: "Nova", level: 35, stats: { hp: 600, attack: 82, defense: 52, speed: 80, energy: 92, critRate: 14, critDmg: 158, evasion: 17, accuracy: 91 }, abilities: ["ab_plasma_storm", "ab_overclock", "ab_energy_siphon"], personality: "cosmic", reward: 1050 },
  { id: "opp_omega_pilot", name: "Commander Omega", mechClass: "Omega", level: 50, stats: { hp: 1600, attack: 100, defense: 100, speed: 48, energy: 120, critRate: 14, critDmg: 185, evasion: 12, accuracy: 90 }, abilities: ["ab_hyper_beam", "ab_singularity_crush", "ab_omega_barrier", "ab_judge"], personality: "supreme", reward: 2500 },
];

export const CY_TOURNAMENTS: CyTournamentDef[] = [
  { id: "tq_rookie_clash", name: "Rookie Clash", format: "bracket", entryCost: 100, maxParticipants: 8, rounds: 3, rewardCoins: 500, rewardXP: 200, description: "Entry-level bracket tournament for new pilots." },
  { id: "tq_steel_circuit", name: "Steel Circuit", format: "round_robin", entryCost: 300, maxParticipants: 6, rounds: 5, rewardCoins: 1200, rewardXP: 500, description: "Round-robin competition — face every opponent." },
  { id: "tq_chaos_arena", name: "Chaos Arena", format: "battle_royale", entryCost: 500, maxParticipants: 16, rounds: 4, rewardCoins: 2500, rewardXP: 1000, description: "Every pilot for themselves — last mech standing wins." },
  { id: "tq_summit_clash", name: "Summit Clash", format: "king_of_hill", entryCost: 800, maxParticipants: 8, rounds: 7, rewardCoins: 5000, rewardXP: 2000, description: "Hold the hill — defend your position against all challengers." },
  { id: "tq_data_heist", name: "Data Heist", format: "capture_flag", entryCost: 600, maxParticipants: 10, rounds: 4, rewardCoins: 3500, rewardXP: 1500, description: "Capture the data core while defending your own." },
  { id: "tq_last_stand", name: "Last Stand", format: "survival", entryCost: 1000, maxParticipants: 32, rounds: 5, rewardCoins: 10000, rewardXP: 5000, description: "Survive endless waves of enemies. How long can you last?" },
];

export const CY_ENHANCEMENTS: CyEnhancementDef[] = [
  { id: "enh_neural_accel", name: "Neural Accelerator", description: "Boosts neural processing speed for faster reactions.", slot: "head", bonus: { speed: 15, accuracy: 10 }, cost: 1000, tier: 1 },
  { id: "enh_carbide_fiber", name: "Carbide Fiber Weave", description: "Advanced carbon-carbide composite armor plating.", slot: "chest", bonus: { defense: 20, hp: 50 }, cost: 1200, tier: 1 },
  { id: "enh_plasma_injector", name: "Plasma Injector", description: "Direct plasma infusion into weapon systems.", slot: "arms", bonus: { attack: 18, critRate: 5 }, cost: 1500, tier: 1 },
  { id: "enh_gravity_spring", name: "Gravity Spring Legs", description: "Gravitational suspension for enhanced mobility.", slot: "legs", bonus: { speed: 12, evasion: 10 }, cost: 1100, tier: 1 },
  { id: "enh_quantum_eye", name: "Quantum Eye", description: "Quantum-entangled targeting reticle.", slot: "head", bonus: { accuracy: 20, critRate: 8 }, cost: 2500, tier: 2 },
  { id: "enh_nanite_armor", name: "Nanite Self-Repair Armor", description: "Armor that continuously regenerates using nanites.", slot: "chest", bonus: { defense: 30, hp: 100 }, cost: 2800, tier: 2 },
  { id: "enh_power_fist", name: "Power Fist Module", description: "Kinetic energy amplifier for melee attacks.", slot: "arms", bonus: { attack: 30, critDmg: 25 }, cost: 3000, tier: 2 },
  { id: "enh_dash_circuit", name: "Overdrive Dash Circuit", description: "Overclocked dash system with burst capability.", slot: "legs", bonus: { speed: 25, evasion: 15 }, cost: 2600, tier: 2 },
  { id: "enh_psi_crown", name: "Psionic Crown", description: "Amplifies latent psionic abilities.", slot: "head", bonus: { accuracy: 30, critDmg: 30, energy: 15 }, cost: 5000, tier: 3 },
  { id: "enh_dark_plate", name: "Dark Matter Plate", description: "Armor infused with stabilized dark matter.", slot: "chest", bonus: { defense: 45, hp: 150, evasion: 5 }, cost: 5500, tier: 3 },
  { id: "enh_void_blade_arm", name: "Void Blade Arm", description: "Arm integrated with a dimensional blade.", slot: "arms", bonus: { attack: 45, critRate: 10, critDmg: 40 }, cost: 6000, tier: 3 },
  { id: "enh_warp_stride", name: "Warp Stride System", description: "Legs capable of short-range warp jumps.", slot: "legs", bonus: { speed: 35, evasion: 25, accuracy: 5 }, cost: 5200, tier: 3 },
  { id: "enh_omega_core", name: "Omega Processing Core", description: "Supreme processing unit for ultimate awareness.", slot: "head", bonus: { accuracy: 40, critRate: 12, critDmg: 40, energy: 20 }, cost: 10000, tier: 4 },
  { id: "enh_singularity_plate", name: "Singularity Plating", description: "Armor drawing power from a micro-singularity.", slot: "chest", bonus: { defense: 60, hp: 250, energy: 30 }, cost: 11000, tier: 4 },
  { id: "enh_apocalypse_arm", name: "Apocalypse Arm", description: "Armament of pure destructive energy.", slot: "arms", bonus: { attack: 65, critRate: 15, critDmg: 50 }, cost: 12000, tier: 4 },
  { id: "enh_infinity_stride", name: "Infinity Stride", description: "Dimensional traversal system for absolute mobility.", slot: "legs", bonus: { speed: 50, evasion: 35, accuracy: 10 }, cost: 10000, tier: 4 },
  { id: "enh_regen_nano", name: "Regenerative Nanite Swarm", description: "Nanite swarm providing passive HP regeneration.", slot: "chest", bonus: { hp: 200, defense: 25 }, cost: 3500, tier: 2 },
  { id: "enh_targeting_ai", name: "Targeting AI Coprocessor", description: "Dedicated targeting AI for improved precision.", slot: "head", bonus: { accuracy: 15, critRate: 6 }, cost: 2000, tier: 2 },
  { id: "enh_hydraulic_rams", name: "Hydraulic Impact Rams", description: "Hydraulic rams for devastating close-range attacks.", slot: "arms", bonus: { attack: 22, defense: 10 }, cost: 1800, tier: 1 },
  { id: "enh_stabilizer_jets", name: "Stabilizer Jet Array", description: "Counter-thrust jets for improved accuracy mid-movement.", slot: "legs", bonus: { accuracy: 12, speed: 8 }, cost: 900, tier: 1 },
];

export const CY_NPCS: CyNpcDef[] = [
  { id: "npc_mechanic", name: "Grease", role: "Mechanic", dialogue: ["Need repairs? I got parts for days.", "That chassis needs work, pilot.", "I salvaged some rare components yesterday."], shop: ["w_laser_rifle", "s_barrier_1", "c_fusion_1", "m_thrusters", "sn_radar_1"], questGiver: true },
  { id: "npc_dealer", name: "Ratchet", role: "Black Market Dealer", dialogue: ["Psst... you want the good stuff?", "These came off a Titan-class, no questions.", "Rarity has its price, pilot."], shop: ["w_void_blade", "s_omega_field", "c_singularity", "m_infinity_glide", "sn_omniscient"], questGiver: false },
  { id: "npc_trainer", name: "Commander Vex", role: "Combat Trainer", dialogue: ["Your stance is sloppy. Again!", "Speed without precision is wasted energy.", "A true pilot reads the battlefield, not the HUD."], shop: ["ab_overcharge", "ab_shield_burst", "ab_power_strike", "ab_dodge_protocol"], questGiver: true },
  { id: "npc_scientist", name: "Dr. Iso", role: "Cybernetics Scientist", dialogue: ["The human-machine interface is fascinating.", "These enhancements push the limit of what's ethical.", "I have a new prototype to test."], shop: ["enh_neural_accel", "enh_quantum_eye", "enh_psi_crown", "enh_omega_core"], questGiver: true },
  { id: "npc_info_broker", name: "Cipher", role: "Information Broker", dialogue: ["I know things about opponents you wouldn't believe.", "The right intel wins battles before they start.", "Data is the ultimate weapon."], shop: ["sn_infrared", "sn_neural_link", "sn_psi_array"], questGiver: false },
  { id: "npc_arena_master", name: "Overlord Koss", role: "Arena Master", dialogue: ["Welcome to the Arena, pilot.", "Only the strongest survive here.", "Your next match awaits."], shop: [], questGiver: true },
  { id: "npc_merchant", name: "Spark", role: "Parts Merchant", dialogue: ["Fresh shipment just arrived!", "Buy now before the other pilots grab the good stuff.", "Bulk discount? Hah, in your dreams."], shop: ["w_plasma_cannon", "s_energy_wall", "c_quantum_core", "m_grav_boots", "sn_sonar"], questGiver: false },
  { id: "npc_mystic", name: "Oracle", role: "Enhancement Mystic", dialogue: ["The machine spirit speaks through enhancements.", "Your mech yearns for transformation.", "I see great potential in your build."], shop: ["enh_carbide_fiber", "enh_dark_plate", "enh_singularity_plate"], questGiver: true },
];

export const CY_ACHIEVEMENTS: CyAchievementDef[] = [
  { id: "ach_first_win", name: "First Blood", description: "Win your first battle.", condition: "wins >= 1", reward: { coins: 100, xp: 50 }, icon: "sword" },
  { id: "ach_10_wins", name: "Battle Hardened", description: "Win 10 battles.", condition: "wins >= 10", reward: { coins: 500, xp: 250 }, icon: "shield" },
  { id: "ach_50_wins", name: "Veteran Pilot", description: "Win 50 battles.", condition: "wins >= 50", reward: { coins: 2000, xp: 1000 }, icon: "medal" },
  { id: "ach_100_wins", name: "Arena Legend", description: "Win 100 battles.", condition: "wins >= 100", reward: { coins: 5000, xp: 2500 }, icon: "crown" },
  { id: "ach_level_10", name: "Rising Star", description: "Reach level 10.", condition: "level >= 10", reward: { coins: 300, xp: 150 }, icon: "star" },
  { id: "ach_level_25", name: "Elite Pilot", description: "Reach level 25.", condition: "level >= 25", reward: { coins: 1000, xp: 500 }, icon: "star" },
  { id: "ach_level_50", name: "Max Power", description: "Reach level 50.", condition: "level >= 50", reward: { coins: 5000, xp: 5000 }, icon: "star" },
  { id: "ach_gold_league", name: "Golden Warrior", description: "Reach Gold league.", condition: "league >= 'Gold'", reward: { coins: 1500, xp: 750 }, icon: "trophy" },
  { id: "ach_legend_league", name: "Living Legend", description: "Reach Legend league.", condition: "league >= 'Legend'", reward: { coins: 10000, xp: 5000 }, icon: "trophy" },
  { id: "ach_5_parts", name: "Gear Collector", description: "Own 5 different parts.", condition: "parts >= 5", reward: { coins: 200, xp: 100 }, icon: "wrench" },
  { id: "ach_20_parts", name: "Hoarder", description: "Own 20 different parts.", condition: "parts >= 20", reward: { coins: 1000, xp: 500 }, icon: "wrench" },
  { id: "ach_first_tournament", name: "Tournament Debut", description: "Enter your first tournament.", condition: "tournamentsEntered >= 1", reward: { coins: 500, xp: 300 }, icon: "flag" },
  { id: "ach_tournament_win", name: "Champion", description: "Win a tournament.", condition: "tournamentsWon >= 1", reward: { coins: 3000, xp: 1500 }, icon: "flag" },
  { id: "ach_3_enhancements", name: "Enhanced", description: "Install 3 enhancements.", condition: "enhancements >= 3", reward: { coins: 800, xp: 400 }, icon: "bolt" },
  { id: "ach_full_team", name: "Squad Leader", description: "Assemble a full 3-mech team.", condition: "teamSize >= 3", reward: { coins: 600, xp: 300 }, icon: "users" },
];

export const CY_TITLE_THRESHOLDS: { title: string; minLevel: number }[] = [
  { title: "Recruit", minLevel: 1 },
  { title: "Cadet", minLevel: 5 },
  { title: "Pilot", minLevel: 10 },
  { title: "Veteran", minLevel: 18 },
  { title: "Elite", minLevel: 28 },
  { title: "Commander", minLevel: 38 },
  { title: "Champion", minLevel: 45 },
  { title: "Legend", minLevel: 50 },
];

export const CY_MAX_LEVEL = 50;

export const CY_RARITY_ORDER: CyRarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const XP_PER_LEVEL = 500;
const BASE_RNG_SEED = 42;

function xpForLevel(level: number): number {
  return Math.floor(XP_PER_LEVEL * level * (1 + level * 0.1));
}

function createDefaultState(): CyPlayerState {
  return {
    level: 1,
    xp: 0,
    coins: 1000,
    totalXP: 0,
    rank: 100,
    wins: 0,
    losses: 0,
    draws: 0,
    activeMechId: "scout_01",
    mechs: [{ mechId: "scout_01", weapon: null, shield: null, core: null, mobility: null, sensor: null, enhancementIds: [] }],
    parts: [],
    unlockedAbilityIds: ["ab_overcharge", "ab_shield_burst", "ab_scan"],
    enhancementIds: [],
    team: [],
    quests: [
      { id: "q_win_3", name: "Win 3 Battles", description: "Win 3 arena battles.", status: "available", progress: 0, goal: 3, reward: { coins: 300, xp: 150 }, type: "battle" },
      { id: "q_buy_2_parts", name: "Acquire Gear", description: "Purchase 2 mech parts.", status: "available", progress: 0, goal: 2, reward: { coins: 200, xp: 100 }, type: "shop" },
      { id: "q_reach_5", name: "Level Up", description: "Reach level 5.", status: "available", progress: 0, goal: 5, reward: { coins: 500, xp: 250 }, type: "level" },
    ],
    achievements: [],
    dailySeed: 0,
    dailyClaimed: false,
    tournamentIds: [],
    gamesPlayed: 0,
    highestRank: 100,
    opponentsDefeated: [],
    partsBought: 0,
    partsUpgraded: 0,
    abilitiesUsed: 0,
    battlesFled: 0,
    tournamentsWon: 0,
  };
}

function mergeStats(base: CyMechStats, bonuses: Partial<CyMechStats>[]): CyMechStats {
  const result = { ...base };
  for (const b of bonuses) {
    if (b.hp !== undefined) result.hp += b.hp;
    if (b.attack !== undefined) result.attack += b.attack;
    if (b.defense !== undefined) result.defense += b.defense;
    if (b.speed !== undefined) result.speed += b.speed;
    if (b.energy !== undefined) result.energy += b.energy;
    if (b.critRate !== undefined) result.critRate += b.critRate;
    if (b.critDmg !== undefined) result.critDmg += b.critDmg;
    if (b.evasion !== undefined) result.evasion += b.evasion;
    if (b.accuracy !== undefined) result.accuracy += b.accuracy;
  }
  return result;
}

function getMechFullStats(state: CyPlayerState, mechBuild: CyMechBuild): CyMechStats {
  const mechDef = CY_MECHS.find((m) => m.id === mechBuild.mechId);
  if (!mechDef) return { hp: 100, attack: 10, defense: 10, speed: 10, energy: 10, critRate: 0, critDmg: 100, evasion: 0, accuracy: 50 };
  const bonuses: Partial<CyMechStats>[] = [];
  const slots: CyPartSlot[] = ["weapon", "shield", "core", "mobility", "sensor"];
  for (const slot of slots) {
    const partId = mechBuild[slot];
    if (partId) {
      const part = CY_PARTS.find((p) => p.id === partId);
      if (part) bonuses.push(part.stats);
    }
  }
  for (const enhId of mechBuild.enhancementIds) {
    const enh = CY_ENHANCEMENTS.find((e) => e.id === enhId);
    if (enh) bonuses.push(enh.bonus);
  }
  return mergeStats(mechDef.baseStats, bonuses);
}

function createDailyTasks(seed: number): CyDailyTask[] {
  const rng = cyCreateRNG(seed);
  const templates = [
    { id: "dt_win", name: "Win Battles", description: "Win {n} battles today.", goal: cySeededInt(rng, 2, 5), reward: () => ({ coins: cySeededInt(rng, 100, 300), xp: cySeededInt(rng, 50, 150) }) },
    { id: "dt_use_ab", name: "Use Abilities", description: "Use abilities {n} times.", goal: cySeededInt(rng, 5, 15), reward: () => ({ coins: cySeededInt(rng, 80, 200), xp: cySeededInt(rng, 40, 120) }) },
    { id: "dt_upgrade", name: "Upgrade Parts", description: "Upgrade {n} parts.", goal: cySeededInt(rng, 1, 3), reward: () => ({ coins: cySeededInt(rng, 150, 400), xp: cySeededInt(rng, 80, 200) }) },
    { id: "dt_earn_coins", name: "Earn Coins", description: "Earn {n} coins in battle.", goal: cySeededInt(rng, 200, 800), reward: () => ({ coins: cySeededInt(rng, 100, 250), xp: cySeededInt(rng, 60, 150) }) },
  ];
  return templates.map((t) => ({
    id: `${t.id}_${seed}`,
    name: t.name,
    description: t.description.replace("{n}", String(t.goal)),
    progress: 0,
    goal: t.goal,
    claimed: false,
    reward: t.reward(),
  }));
}

// ---------------------------------------------------------------------------
// React hook: useCyberArena
// ---------------------------------------------------------------------------

export function useCyberArena(seed: number = BASE_RNG_SEED) {
  const [state, setState] = useState<CyPlayerState>(createDefaultState);
  const [battle, setBattle] = useState<CyBattleState | null>(null);
  const [dailies, setDailies] = useState<CyDailyTask[]>(() => createDailyTasks(seed));
  const rngRef = useRef(cyCreateRNG(seed));

  // ========================================================================
  // State
  // ========================================================================

  const cyGetState: () => CyPlayerState = useCallback(() => state, [state]);

  const cyResetState: () => void = useCallback(() => {
    setState(createDefaultState());
    setBattle(null);
    setDailies(createDailyTasks(seed));
    rngRef.current = cyCreateRNG(seed);
  }, [seed]);

  // ========================================================================
  // Level / XP
  // ========================================================================

  const cyGetLevel: () => number = useCallback(() => state.level, [state.level]);

  const cyGetTitle: () => string = useCallback(() => {
    let title = "Recruit";
    for (const t of CY_TITLE_THRESHOLDS) {
      if (state.level >= t.minLevel) title = t.title;
    }
    return title;
  }, [state.level]);

  const cyGetProgress: () => number = useCallback(() => {
    const needed = xpForLevel(state.level);
    return Math.min((state.xp / needed) * 100, 100);
  }, [state.level, state.xp]);

  const cyAddXP: (amount: number) => { leveledUp: boolean; newLevel: number } = useCallback((amount: number) => {
    let leveledUp = false;
    let newLevel = state.level;
    setState((prev) => {
      let xp = prev.xp + amount;
      let level = prev.level;
      let totalXP = prev.totalXP + amount;
      while (level < CY_MAX_LEVEL && xp >= xpForLevel(level)) {
        xp -= xpForLevel(level);
        level += 1;
        leveledUp = true;
        newLevel = level;
      }
      return { ...prev, xp, level, totalXP };
    });
    return { leveledUp, newLevel };
  }, [state.level, state.xp]);

  // ========================================================================
  // Coins
  // ========================================================================

  const cyGetCoins: () => number = useCallback(() => state.coins, [state.coins]);

  const cyAddCoins: (amount: number) => void = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, coins: prev.coins + amount }));
  }, []);

  const cySpendCoins: (amount: number) => boolean = useCallback((amount: number) => {
    let success = false;
    setState((prev) => {
      if (prev.coins >= amount) {
        success = true;
        return { ...prev, coins: prev.coins - amount };
      }
      return prev;
    });
    return success;
  }, []);

  // ========================================================================
  // Mechs
  // ========================================================================

  const cyGetMechs: () => CyMechBuild[] = useCallback(() => state.mechs, [state.mechs]);

  const cyBuildMech: (mechId: string) => boolean = useCallback((mechId: string) => {
    const def = CY_MECHS.find((m) => m.id === mechId);
    if (!def) return false;
    const cost = def.tier * 500;
    let ok = false;
    setState((prev) => {
      if (prev.coins < cost) return prev;
      if (prev.mechs.find((m) => m.mechId === mechId)) return prev;
      ok = true;
      return {
        ...prev,
        coins: prev.coins - cost,
        mechs: [...prev.mechs, { mechId, weapon: null, shield: null, core: null, mobility: null, sensor: null, enhancementIds: [] }],
      };
    });
    return ok;
  }, []);

  const cyGetActiveMech: () => CyMechBuild | null = useCallback(() => {
    return state.mechs.find((m) => m.mechId === state.activeMechId) ?? null;
  }, [state.mechs, state.activeMechId]);

  const cyEquipPart: (partId: string, mechId: string) => boolean = useCallback((partId: string, mechId: string) => {
    const partDef = CY_PARTS.find((p) => p.id === partId);
    if (!partDef) return false;
    const owned = state.parts.find((p) => p.id === partId);
    if (!owned) return false;
    let success = false;
    setState((prev) => {
      const newMechs = prev.mechs.map((m) => {
        if (m.mechId !== mechId) return m;
        success = true;
        return { ...m, [partDef.slot]: partId };
      });
      return { ...prev, mechs: newMechs };
    });
    return success;
  }, [state.parts]);

  // ========================================================================
  // Parts
  // ========================================================================

  const cyGetParts: () => CyPartDef[] = useCallback(() => state.parts, [state.parts]);

  const cyBuyPart: (partId: string) => boolean = useCallback((partId: string) => {
    const def = CY_PARTS.find((p) => p.id === partId);
    if (!def) return false;
    let ok = false;
    setState((prev) => {
      if (prev.coins < def.cost) return prev;
      if (prev.parts.find((p) => p.id === partId)) return prev;
      ok = true;
      return { ...prev, coins: prev.coins - def.cost, parts: [...prev.parts, { ...def }], partsBought: prev.partsBought + 1 };
    });
    return ok;
  }, []);

  const cyUpgradePart: (partId: string) => CyPartDef | null = useCallback((partId: string) => {
    let result: CyPartDef | null = null;
    setState((prev) => {
      const idx = prev.parts.findIndex((p) => p.id === partId);
      if (idx === -1) return prev;
      const part = prev.parts[idx];
      if (part.level >= part.maxLevel) return prev;
      const cost = Math.floor(part.cost * 0.5 * part.level);
      if (prev.coins < cost) return prev;
      const upgraded = { ...part, level: part.level + 1 };
      const scale = 1 + 0.12 * upgraded.level;
      upgraded.stats = { ...part.stats };
      if (upgraded.stats.hp !== undefined) upgraded.stats.hp = Math.floor(part.stats.hp! * scale);
      if (upgraded.stats.attack !== undefined) upgraded.stats.attack = Math.floor(part.stats.attack! * scale);
      if (upgraded.stats.defense !== undefined) upgraded.stats.defense = Math.floor(part.stats.defense! * scale);
      if (upgraded.stats.speed !== undefined) upgraded.stats.speed = Math.floor(part.stats.speed! * scale);
      if (upgraded.stats.energy !== undefined) upgraded.stats.energy = Math.floor(part.stats.energy! * scale);
      if (upgraded.stats.critRate !== undefined) upgraded.stats.critRate = Math.floor(part.stats.critRate! * scale * 10) / 10;
      if (upgraded.stats.critDmg !== undefined) upgraded.stats.critDmg = Math.floor(part.stats.critDmg! * scale);
      if (upgraded.stats.evasion !== undefined) upgraded.stats.evasion = Math.floor(part.stats.evasion! * scale);
      if (upgraded.stats.accuracy !== undefined) upgraded.stats.accuracy = Math.floor(part.stats.accuracy! * scale);
      const newParts = [...prev.parts];
      newParts[idx] = upgraded;
      result = upgraded;
      return { ...prev, coins: prev.coins - cost, parts: newParts, partsUpgraded: prev.partsUpgraded + 1 };
    });
    return result;
  }, []);

  // ========================================================================
  // Abilities
  // ========================================================================

  const cyGetAbilities: () => CyAbilityDef[] = useCallback(() => {
    return CY_ABILITIES.filter((a) => state.unlockedAbilityIds.includes(a.id));
  }, [state.unlockedAbilityIds]);

  const cyUnlockAbility: (abilityId: string) => boolean = useCallback((abilityId: string) => {
    const def = CY_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return false;
    const cost = def.tier * 400;
    let ok = false;
    setState((prev) => {
      if (prev.coins < cost) return prev;
      if (prev.unlockedAbilityIds.includes(abilityId)) return prev;
      ok = true;
      return { ...prev, coins: prev.coins - cost, unlockedAbilityIds: [...prev.unlockedAbilityIds, abilityId] };
    });
    return ok;
  }, []);

  const cyUseAbility: (abilityId: string, targetHP: number, playerEnergy: number, opponentMaxHP: number, playerStats: CyMechStats) => { damage: number; energyCost: number; newCooldown: number; healed: number; log: string } = useCallback(
    (abilityId: string, targetHP: number, playerEnergy: number, opponentMaxHP: number, playerStats: CyMechStats) => {
      const def = CY_ABILITIES.find((a) => a.id === abilityId);
      if (!def || playerEnergy < def.energyCost) {
        return { damage: 0, energyCost: 0, newCooldown: 0, healed: 0, log: "Not enough energy or ability not found." };
      }
      const rng = cyCreateRNG(rngRef.current());
      const baseAtk = playerStats.attack || 50;
      let damage = 0;
      let healed = 0;
      const log: string[] = [];

      if (def.effect === "heal" || def.effect === "hp_boost") {
        healed = Math.floor((def.power / 100) * playerStats.hp);
        log.push(`Used ${def.name}: restored ${healed} HP.`);
      } else if (def.effect === "heavy_damage") {
        const crit = rng() * 100 < playerStats.critRate;
        damage = Math.floor(baseAtk * (def.power / 100) * (crit ? (playerStats.critDmg / 100) : 1));
        log.push(`Used ${def.name}: dealt ${damage} damage.${crit ? " CRITICAL!" : ""}`);
      } else if (def.effect === "ultimate_damage" || def.effect === "charge_beam" || def.effect === "singularity") {
        damage = Math.floor(baseAtk * (def.power / 100));
        log.push(`Used ${def.name}: unleashed ${damage} devastation!`);
      } else if (def.effect === "multi_hit") {
        const hits = 5;
        let total = 0;
        for (let i = 0; i < hits; i++) {
          total += Math.floor(baseAtk * 0.4);
        }
        damage = total;
        log.push(`Used ${def.name}: ${hits} hits for ${damage} total damage!`);
      } else if (def.effect === "dot" || def.effect === "poison") {
        damage = Math.floor(baseAtk * 0.5);
        log.push(`Used ${def.name}: dealing ${damage} damage over time.`);
      } else if (def.effect === "guaranteed_crit") {
        damage = Math.floor(baseAtk * (def.power / 100) * (playerStats.critDmg / 100));
        log.push(`Used ${def.name}: GUARANTEED CRITICAL for ${damage}!`);
      } else if (def.effect === "execute") {
        if (targetHP / opponentMaxHP < 0.2) {
          damage = targetHP;
          log.push(`Used ${def.name}: EXECUTE! Instant KO!`);
        } else {
          damage = Math.floor(baseAtk * 0.5);
          log.push(`Used ${def.name}: target too healthy (${damage} damage).`);
        }
      } else if (def.effect === "heal_and_buff") {
        healed = Math.floor((def.power / 100) * playerStats.hp);
        log.push(`Used ${def.name}: restored ${healed} HP and boosted defense.`);
      } else if (def.effect === "invincible_heal" || def.effect === "invulnerable") {
        healed = Math.floor(playerStats.hp * 0.1);
        log.push(`Used ${def.name}: invincible this round! Healed ${healed} HP.`);
      } else {
        damage = Math.floor(baseAtk * (def.power / 100));
        log.push(`Used ${def.name}: dealt ${damage} damage.`);
      }

      if (damage > 0) {
        damage = Math.max(1, damage - Math.floor(playerStats.defense * 0.1));
      }

      setState((prev) => ({ ...prev, abilitiesUsed: prev.abilitiesUsed + 1 }));
      return { damage, energyCost: def.energyCost, newCooldown: def.cooldown, healed, log: log.join(" ") };
    },
    []
  );

  // ========================================================================
  // Leagues
  // ========================================================================

  const cyGetLeague: () => CyLeagueDef = useCallback(() => {
    for (const league of CY_LEAGUES) {
      if (state.rank >= league.rankMin && state.rank <= league.rankMax) return league;
    }
    return CY_LEAGUES[0];
  }, [state.rank]);

  const cyGetRank: () => number = useCallback(() => state.rank, [state.rank]);

  const cyAdvanceRank: (delta: number) => void = useCallback((delta: number) => {
    setState((prev) => {
      const newRank = Math.max(0, prev.rank + delta);
      return { ...prev, rank: newRank, highestRank: Math.max(prev.highestRank, newRank) };
    });
  }, []);

  // ========================================================================
  // Battle System
  // ========================================================================

  const cyStartBattle: (opponentId: string) => CyBattleState | null = useCallback(
    (opponentId: string) => {
      const opp = CY_OPPONENTS.find((o) => o.id === opponentId);
      if (!opp) return null;
      const activeMech = state.mechs.find((m) => m.mechId === state.activeMechId);
      if (!activeMech) return null;
      const playerStats = getMechFullStats(state, activeMech);
      const b: CyBattleState = {
        phase: "combat",
        opponentId,
        round: 1,
        maxRounds: 10,
        playerHP: playerStats.hp,
        playerMaxHP: playerStats.hp,
        opponentHP: opp.stats.hp,
        opponentMaxHP: opp.stats.hp,
        playerEnergy: playerStats.energy,
        opponentEnergy: opp.stats.energy,
        log: [`Battle started against ${opp.name}!`],
        cooldowns: {},
        result: null,
        coinsEarned: 0,
        xpEarned: 0,
      };
      setBattle(b);
      return b;
    },
    [state.mechs, state.activeMechId, state]
  );

  const cyBattleAction: (action: "attack" | "defend" | "ability" | "flee", abilityId?: string) => CyBattleState | null = useCallback(
    (action: "attack" | "defend" | "ability" | "flee", abilityId?: string) => {
      if (!battle || battle.phase !== "combat") return battle;
      const opp = CY_OPPONENTS.find((o) => o.id === battle.opponentId);
      if (!opp) return battle;
      const activeMech = state.mechs.find((m) => m.mechId === state.activeMechId);
      if (!activeMech) return battle;

      const playerStats = getMechFullStats(state, activeMech);
      const rng = cyCreateRNG(rngRef.current() + battle.round * 7);
      let b = { ...battle, log: [...battle.log], cooldowns: { ...battle.cooldowns } };

      // Decrement cooldowns
      for (const key of Object.keys(b.cooldowns)) {
        b.cooldowns[key] = Math.max(0, b.cooldowns[key] - 1);
      }

      if (action === "flee") {
        const fleeChance = 30 + (playerStats.speed - opp.stats.speed) * 0.5;
        if (rng() * 100 < fleeChance) {
          b.phase = "fled";
          b.result = null;
          b.log.push("You fled the battle!");
          setState((prev) => ({ ...prev, battlesFled: prev.battlesFled + 1 }));
        } else {
          b.log.push("Failed to flee! Enemy attacks!");
          // Enemy gets a free attack
          const oppHit = rng() * 100 < opp.stats.accuracy;
          if (oppHit) {
            const evaded = rng() * 100 < playerStats.evasion;
            if (!evaded) {
              const dmg = Math.max(1, opp.stats.attack - Math.floor(playerStats.defense * 0.15));
              b.playerHP = Math.max(0, b.playerHP - dmg);
              b.log.push(`${opp.name} deals ${dmg} damage!`);
            } else {
              b.log.push("You evaded the attack!");
            }
          } else {
            b.log.push(`${opp.name}'s attack missed!`);
          }
        }
        b.round += 1;
        setBattle(b);
        return b;
      }

      // --- Player turn ---
      let playerDamage = 0;
      let playerHealed = 0;

      if (action === "attack") {
        const hit = rng() * 100 < playerStats.accuracy;
        if (hit) {
          const crit = rng() * 100 < playerStats.critRate;
          const baseDmg = playerStats.attack - Math.floor(opp.stats.defense * 0.15);
          playerDamage = Math.max(1, crit ? Math.floor(baseDmg * (playerStats.critDmg / 100)) : baseDmg);
          const evaded = rng() * 100 < opp.stats.evasion;
          if (!evaded) {
            b.opponentHP = Math.max(0, b.opponentHP - playerDamage);
            b.log.push(`You deal ${playerDamage} damage!${crit ? " CRITICAL!" : ""}`);
          } else {
            b.log.push(`${opp.name} evaded your attack!`);
            playerDamage = 0;
          }
        } else {
          b.log.push("Your attack missed!");
        }
      } else if (action === "defend") {
        const shieldAmount = Math.floor(playerStats.defense * 0.5);
        playerHealed = shieldAmount;
        b.playerHP = Math.min(b.playerMaxHP, b.playerHP + shieldAmount);
        b.log.push(`You take a defensive stance, regaining ${shieldAmount} HP.`);
      } else if (action === "ability" && abilityId) {
        const abilityDef = CY_ABILITIES.find((a) => a.id === abilityId);
        if (abilityDef && state.unlockedAbilityIds.includes(abilityId)) {
          if (b.playerEnergy >= abilityDef.energyCost && (b.cooldowns[abilityId] ?? 0) === 0) {
            b.playerEnergy -= abilityDef.energyCost;
            b.cooldowns[abilityId] = abilityDef.cooldown;
            const abilityResult = cyUseAbility(abilityId, b.opponentHP, b.playerEnergy + abilityDef.energyCost, b.opponentMaxHP, playerStats);
            playerDamage = abilityResult.damage;
            playerHealed = abilityResult.healed;
            b.log.push(abilityResult.log);
            if (playerDamage > 0) b.opponentHP = Math.max(0, b.opponentHP - playerDamage);
            if (playerHealed > 0) b.playerHP = Math.min(b.playerMaxHP, b.playerHP + playerHealed);
          } else {
            b.log.push("Ability unavailable (cooldown or insufficient energy).");
          }
        }
      }

      // --- Enemy turn ---
      if (b.opponentHP > 0) {
        const oppAbility = cySeededPick(rng, opp.abilities);
        const oppAbilityDef = CY_ABILITIES.find((a) => a.id === oppAbility);
        if (oppAbilityDef && b.opponentEnergy >= oppAbilityDef.energyCost && rng() < 0.4) {
          b.opponentEnergy -= oppAbilityDef.energyCost;
          const oppDmg = Math.max(1, Math.floor(opp.stats.attack * (oppAbilityDef.power / 100)) - Math.floor(playerStats.defense * 0.1));
          const playerEvade = rng() * 100 < playerStats.evasion;
          if (!playerEvade) {
            b.playerHP = Math.max(0, b.playerHP - oppDmg);
            b.log.push(`${opp.name} uses ${oppAbilityDef.name} for ${oppDmg} damage!`);
          } else {
            b.log.push(`${opp.name} uses ${oppAbilityDef.name} but you evaded!`);
          }
        } else {
          const oppHit = rng() * 100 < opp.stats.accuracy;
          if (oppHit) {
            const evaded = rng() * 100 < playerStats.evasion;
            if (!evaded) {
              const dmg = Math.max(1, opp.stats.attack - Math.floor(playerStats.defense * 0.15));
              b.playerHP = Math.max(0, b.playerHP - dmg);
              b.log.push(`${opp.name} attacks for ${dmg} damage!`);
            } else {
              b.log.push(`You evaded ${opp.name}'s attack!`);
            }
          } else {
            b.log.push(`${opp.name}'s attack missed!`);
          }
        }
      }

      // Energy regen
      b.playerEnergy = Math.min(playerStats.energy, b.playerEnergy + 5);
      b.opponentEnergy = Math.min(opp.stats.energy, b.opponentEnergy + 5);

      // Check end conditions
      b.round += 1;
      if (b.opponentHP <= 0) {
        b.phase = "result";
        b.result = "win";
        b.coinsEarned = opp.reward;
        b.xpEarned = opp.level * 10;
        b.log.push(`Victory! You earned ${b.coinsEarned} coins and ${b.xpEarned} XP.`);
      } else if (b.playerHP <= 0) {
        b.phase = "result";
        b.result = "loss";
        b.log.push("Defeat. Your mech has been destroyed.");
      } else if (b.round > b.maxRounds) {
        b.phase = "result";
        b.result = b.playerHP > b.opponentHP ? "win" : b.playerHP < b.opponentHP ? "loss" : "draw";
        b.log.push(`Time's up! Result: ${b.result}.`);
        if (b.result === "win") {
          b.coinsEarned = Math.floor(opp.reward * 0.5);
          b.xpEarned = Math.floor(opp.level * 5);
        }
      }

      setBattle(b);
      return b;
    },
    [battle, state, cyUseAbility]
  );

  const cyGetBattleResult: () => CyBattleState | null = useCallback(() => battle, [battle]);

  const cyGetWinRate: () => number = useCallback(() => {
    const total = state.wins + state.losses + state.draws;
    if (total === 0) return 0;
    return Math.floor((state.wins / total) * 1000) / 10;
  }, [state.wins, state.losses, state.draws]);

  // ========================================================================
  // Tournaments
  // ========================================================================

  const cyGetTournaments: () => CyTournamentDef[] = useCallback(() => CY_TOURNAMENTS, []);

  const cyEnterTournament: (tournamentId: string) => { success: boolean; placement: number; coinsWon: number; xpWon: number } = useCallback(
    (tournamentId: string) => {
      const def = CY_TOURNAMENTS.find((t) => t.id === tournamentId);
      if (!def) return { success: false, placement: 0, coinsWon: 0, xpWon: 0 };
      let ok = false;
      let placement = 0;
      let coinsWon = 0;
      let xpWon = 0;
      setState((prev) => {
        if (prev.coins < def.entryCost) return prev;
        ok = true;
        const rng = cyCreateRNG(rngRef.current() + prev.gamesPlayed * 13);
        placement = cySeededInt(rng, 1, def.maxParticipants);
        const isWin = placement === 1;
        coinsWon = isWin ? def.rewardCoins : Math.floor(def.rewardCoins * (1 / placement));
        xpWon = isWin ? def.rewardXP : Math.floor(def.rewardXP * (1 / placement));
        return {
          ...prev,
          coins: prev.coins - def.entryCost + coinsWon,
          tournamentIds: [...prev.tournamentIds, tournamentId],
          gamesPlayed: prev.gamesPlayed + 1,
          tournamentsWon: isWin ? prev.tournamentsWon + 1 : prev.tournamentsWon,
        };
      });
      if (ok) {
        cyAddXP(xpWon);
      }
      return { success: ok, placement, coinsWon, xpWon };
    },
    [cyAddXP]
  );

  // ========================================================================
  // Enhancements
  // ========================================================================

  const cyGetEnhancements: () => CyEnhancementDef[] = useCallback(() => {
    return CY_ENHANCEMENTS.filter((e) => state.enhancementIds.includes(e.id));
  }, [state.enhancementIds]);

  const cyInstallEnhancement: (enhancementId: string, mechId: string) => boolean = useCallback(
    (enhancementId: string, mechId: string) => {
      const def = CY_ENHANCEMENTS.find((e) => e.id === enhancementId);
      if (!def) return false;
      let ok = false;
      setState((prev) => {
        if (prev.coins < def.cost) return prev;
        if (!prev.enhancementIds.includes(enhancementId)) {
          ok = true;
          const newMechs = prev.mechs.map((m) => {
            if (m.mechId !== mechId) return m;
            return { ...m, enhancementIds: [...m.enhancementIds, enhancementId] };
          });
          return { ...prev, coins: prev.coins - def.cost, enhancementIds: [...prev.enhancementIds, enhancementId], mechs: newMechs };
        }
        return prev;
      });
      return ok;
    },
    []
  );

  // ========================================================================
  // Team
  // ========================================================================

  const cyGetTeam: () => CyTeamMember[] = useCallback(() => state.team, [state.team]);

  const cyAddTeamMember: (mechId: string) => boolean = useCallback(
    (mechId: string) => {
      if (state.team.length >= 3) return false;
      const mech = state.mechs.find((m) => m.mechId === mechId);
      if (!mech) return false;
      if (state.team.find((t) => t.mechId === mechId)) return false;
      const role: CyTeamMember["role"] = state.team.length === 0 ? "lead" : state.team.length === 1 ? "support" : "flex";
      setState((prev) => ({ ...prev, team: [...prev.team, { mechId, role }] }));
      return true;
    },
    [state.team, state.mechs]
  );

  const cyGetTeamSynergy: () => number = useCallback(() => {
    if (state.team.length < 2) return 0;
    let synergy = 0;
    const teamMechs = state.team.map((t) => CY_MECHS.find((m) => m.id === t.mechId)).filter(Boolean) as CyMechDef[];
    for (let i = 0; i < teamMechs.length; i++) {
      for (let j = i + 1; j < teamMechs.length; j++) {
        const a = teamMechs[i];
        const b = teamMechs[j];
        // Same class bonus
        if (a.mechClass === b.mechClass) synergy += 15;
        // Complementary bonus: high attack + high defense
        if (a.baseStats.attack > b.baseStats.defense && b.baseStats.attack < a.baseStats.defense) synergy += 10;
        // Speed differential bonus
        const speedDiff = Math.abs(a.baseStats.speed - b.baseStats.speed);
        if (speedDiff < 15) synergy += 8;
        // Tier synergy
        if (a.tier === b.tier) synergy += 5;
      }
    }
    // Weight balance
    const avgWeight = teamMechs.reduce((s, m) => s + m.weight, 0) / teamMechs.length;
    if (avgWeight >= 30 && avgWeight <= 60) synergy += 10;
    return Math.min(100, synergy);
  }, [state.team]);

  // ========================================================================
  // Quests
  // ========================================================================

  const cyGetQuests: () => CyQuest[] = useCallback(() => state.quests, [state.quests]);

  const cyAcceptQuest: (questId: string) => boolean = useCallback((questId: string) => {
    let ok = false;
    setState((prev) => {
      const newQuests = prev.quests.map((q) => {
        if (q.id === questId && q.status === "available") {
          ok = true;
          return { ...q, status: "accepted" as CyQuestStatus };
        }
        return q;
      });
      return { ...prev, quests: newQuests };
    });
    return ok;
  }, []);

  const cyCompleteQuest: (questId: string) => { completed: boolean; reward: { coins: number; xp: number } } = useCallback(
    (questId: string) => {
      let completed = false;
      let reward = { coins: 0, xp: 0 };
      setState((prev) => {
        const newQuests = prev.quests.map((q) => {
          if (q.id === questId && q.status === "accepted" && q.progress >= q.goal) {
            completed = true;
            reward = q.reward;
            return { ...q, status: "completed" as CyQuestStatus };
          }
          return q;
        });
        return { ...prev, quests: newQuests };
      });
      if (completed) {
        cyAddCoins(reward.coins);
        cyAddXP(reward.xp);
      }
      return { completed, reward };
    },
    [cyAddCoins, cyAddXP]
  );

  // ========================================================================
  // Achievements
  // ========================================================================

  const cyGetAchievements: () => CyAchievementDef[] = useCallback(() => CY_ACHIEVEMENTS, []);

  const cyCheckAchievements: () => CyAchievementDef[] = useCallback(() => {
    const unlocked: CyAchievementDef[] = [];
    const vars: Record<string, number | string> = {
      wins: state.wins,
      losses: state.losses,
      draws: state.draws,
      level: state.level,
      parts: state.parts.length,
      enhancements: state.enhancementIds.length,
      teamSize: state.team.length,
      tournamentsEntered: state.tournamentIds.length,
      tournamentsWon: state.tournamentsWon,
      league: cyGetLeague().name,
    };
    for (const ach of CY_ACHIEVEMENTS) {
      if (state.achievements.includes(ach.id)) continue;
      const [varName, op, val] = ach.condition.split(" ") as [string, string, string];
      const v = vars[varName];
      if (v === undefined) continue;
      let met = false;
      if (op === ">=") met = typeof v === "number" && v >= Number(val);
      else if (op === ">") met = typeof v === "number" && v > Number(val);
      else if (op === "==") met = String(v) === val;
      if (met) {
        unlocked.push(ach);
      }
    }
    if (unlocked.length > 0) {
      setState((prev) => ({
        ...prev,
        achievements: [...prev.achievements, ...unlocked.map((a) => a.id)],
      }));
    }
    return unlocked;
  }, [state, cyGetLeague]);

  // ========================================================================
  // Daily Tasks
  // ========================================================================

  const cyGetDailyTask: () => CyDailyTask[] = useCallback(() => dailies, [dailies]);

  const cyClaimDailyReward: (taskId: string) => { claimed: boolean; reward: { coins: number; xp: number } } = useCallback(
    (taskId: string) => {
      let claimed = false;
      let reward = { coins: 0, xp: 0 };
      setDailies((prev) =>
        prev.map((d) => {
          if (d.id === taskId && !d.claimed && d.progress >= d.goal) {
            claimed = true;
            reward = d.reward;
            return { ...d, claimed: true };
          }
          return d;
        })
      );
      if (claimed) {
        cyAddCoins(reward.coins);
        cyAddXP(reward.xp);
        setState((prev) => ({ ...prev, dailyClaimed: true }));
      }
      return { claimed, reward };
    },
    [cyAddCoins, cyAddXP]
  );

  // ========================================================================
  // Additional exported functions
  // ========================================================================

  const cyGetMechDef: (mechId: string) => CyMechDef | undefined = useCallback((mechId: string) => CY_MECHS.find((m) => m.id === mechId), []);

  const cyGetMechStats: (mechId: string) => CyMechStats | null = useCallback(
    (mechId: string) => {
      const build = state.mechs.find((m) => m.mechId === mechId);
      if (!build) return null;
      return getMechFullStats(state, build);
    },
    [state]
  );

  const cySetActiveMech: (mechId: string) => boolean = useCallback(
    (mechId: string) => {
      if (!state.mechs.find((m) => m.mechId === mechId)) return false;
      setState((prev) => ({ ...prev, activeMechId: mechId }));
      return true;
    },
    [state.mechs]
  );

  const cyGetOpponentDef: (opponentId: string) => CyOpponentDef | undefined = useCallback((opponentId: string) => CY_OPPONENTS.find((o) => o.id === opponentId), []);

  const cyGetRandomOpponent: (playerLevel: number) => CyOpponentDef | null = useCallback(
    (playerLevel: number) => {
      const rng = cyCreateRNG(rngRef.current() + state.gamesPlayed);
      const levelRange = 5;
      const candidates = CY_OPPONENTS.filter((o) => Math.abs(o.level - playerLevel) <= levelRange);
      if (candidates.length === 0) return cySeededPick(rng, CY_OPPONENTS) ?? null;
      return cySeededPick(rng, candidates) ?? null;
    },
    [state.gamesPlayed]
  );

  const cyGetNpcDialogue: (npcId: string, index?: number) => string = useCallback((npcId: string, index?: number) => {
    const npc = CY_NPCS.find((n) => n.id === npcId);
    if (!npc || npc.dialogue.length === 0) return "...";
    const rng = cyCreateRNG(rngRef.current());
    const i = index !== undefined ? index % npc.dialogue.length : Math.floor(rng() * npc.dialogue.length);
    return npc.dialogue[i];
  }, []);

  const cyGetNpcShop = useCallback((npcId: string): (CyPartDef | CyAbilityDef | CyEnhancementDef)[] => {
    const npc = CY_NPCS.find((n) => n.id === npcId);
    if (!npc) return [];
    const results: (CyPartDef | CyAbilityDef | CyEnhancementDef)[] = [];
    for (const id of npc.shop) {
      results.push(CY_PARTS.find((p) => p.id === id) ?? CY_ABILITIES.find((a) => a.id === id) ?? CY_ENHANCEMENTS.find((e) => e.id === id) ?? { id: "", name: "Unknown", description: "", bonus: {}, cost: 0, tier: 0 } as CyEnhancementDef);
    }
    return results;
  }, []);

  const cyGetTotalGamesPlayed: () => number = useCallback(() => state.gamesPlayed, [state.gamesPlayed]);

  const cyGetHighestRank: () => number = useCallback(() => state.highestRank, [state.highestRank]);

  const cyGetPartsBySlot: (slot: CyPartSlot) => CyPartDef[] = useCallback(
    (slot: CyPartSlot) => state.parts.filter((p) => p.slot === slot),
    [state.parts]
  );

  const cyGetPartsByRarity: (rarity: CyRarity) => CyPartDef[] = useCallback(
    (rarity: CyRarity) => state.parts.filter((p) => p.rarity === rarity),
    [state.parts]
  );

  const cyGetAllPartsCatalog: () => CyPartDef[] = useCallback(() => CY_PARTS, []);

  const cyGetEnhancementCatalog: () => CyEnhancementDef[] = useCallback(() => CY_ENHANCEMENTS, []);

  const cyGetAbilityCatalog: () => CyAbilityDef[] = useCallback(() => CY_ABILITIES, []);

  const cyGetTournamentDef: (tournamentId: string) => CyTournamentDef | undefined = useCallback((tournamentId: string) => CY_TOURNAMENTS.find((t) => t.id === tournamentId), []);

  const cySimulateBattle: (mechId: string, opponentId: string) => { result: "win" | "loss" | "draw"; rounds: number; log: string[] } = useCallback(
    (mechId: string, opponentId: string) => {
      const mechDef = CY_MECHS.find((m) => m.id === mechId);
      const oppDef = CY_OPPONENTS.find((o) => o.id === opponentId);
      if (!mechDef || !oppDef) return { result: "draw", rounds: 0, log: ["Invalid mech or opponent."] };
      const rng = cyCreateRNG(rngRef.current() + mechDef.tier * 17 + oppDef.level * 31);
      let pHp = mechDef.baseStats.hp;
      const pMax = mechDef.baseStats.hp;
      let oHp = oppDef.stats.hp;
      const oMax = oppDef.stats.hp;
      let rounds = 0;
      const log: string[] = [];
      while (pHp > 0 && oHp > 0 && rounds < 10) {
        rounds++;
        const pDmg = Math.max(1, mechDef.baseStats.attack - Math.floor(oppDef.stats.defense * 0.15));
        const oDmg = Math.max(1, oppDef.stats.attack - Math.floor(mechDef.baseStats.defense * 0.15));
        const pHit = rng() * 100 < mechDef.baseStats.accuracy;
        const oHit = rng() * 100 < oppDef.stats.accuracy;
        if (pHit) oHp = Math.max(0, oHp - pDmg);
        if (oHit) pHp = Math.max(0, pHp - oDmg);
        log.push(`Round ${rounds}: You ${pHit ? `deal ${pDmg}` : "miss"}. Enemy ${oHit ? `deals ${oDmg}` : "misses"}.`);
      }
      const result = oHp <= 0 ? "win" : pHp <= 0 ? "loss" : "draw";
      return { result, rounds, log };
    },
    []
  );

  const cyGetLeagueProgress: () => { current: number; next: number; percentage: number } = useCallback(() => {
    const league = cyGetLeague();
    const leagueIdx = CY_LEAGUES.findIndex((l) => l.name === league.name);
    const nextLeague = CY_LEAGUES[leagueIdx + 1];
    if (!nextLeague) return { current: state.rank, next: league.rankMax, percentage: 100 };
    const range = nextLeague.rankMin - league.rankMin;
    const progress = state.rank - league.rankMin;
    return { current: state.rank, next: nextLeague.rankMin, percentage: range > 0 ? Math.floor((progress / range) * 100) : 0 };
  }, [state.rank, cyGetLeague]);

  const cyGetOpponentsForLevel: (level: number) => CyOpponentDef[] = useCallback((level: number) => {
    return CY_OPPONENTS.filter((o) => Math.abs(o.level - level) <= 5).sort((a, b) => a.level - b.level);
  }, []);

  const cyGetMechClassList: () => CyMechClass[] = useCallback(() => ["Scout", "Striker", "Sentinel", "Vanguard", "Phantom", "Juggernaut", "Ronin", "Aegis", "Wraith", "Titan", "Nova", "Omega"], []);

  const cyGetRarityList: () => CyRarity[] = useCallback(() => ["Common", "Uncommon", "Rare", "Epic", "Legendary"], []);

  const cyGetBattleLog: () => string[] = useCallback(() => battle?.log ?? [], [battle]);

  const cyRemoveTeamMember: (mechId: string) => boolean = useCallback((mechId: string) => {
    let ok = false;
    setState((prev) => {
      const idx = prev.team.findIndex((t) => t.mechId === mechId);
      if (idx === -1) return prev;
      ok = true;
      const newTeam = prev.team.filter((t) => t.mechId !== mechId);
      // Reassign roles
      if (newTeam.length > 0) newTeam[0].role = "lead";
      if (newTeam.length > 1) newTeam[1].role = "support";
      if (newTeam.length > 2) newTeam[2].role = "flex";
      return { ...prev, team: newTeam };
    });
    return ok;
  }, []);

  const cyUnequipPart: (slot: CyPartSlot, mechId: string) => boolean = useCallback((slot: CyPartSlot, mechId: string) => {
    let ok = false;
    setState((prev) => {
      const newMechs = prev.mechs.map((m) => {
        if (m.mechId !== mechId) return m;
        if (m[slot] === null) return m;
        ok = true;
        return { ...m, [slot]: null };
      });
      return { ...prev, mechs: newMechs };
    });
    return ok;
  }, []);

  const cyGetRecommendedOpponent: () => CyOpponentDef | null = useCallback(() => {
    const league = cyGetLeague();
    const leagueLevel = Math.floor(league.rankMax / 100);
    const candidates = CY_OPPONENTS.filter((o) => Math.abs(o.level - leagueLevel) <= 3);
    if (candidates.length === 0) return CY_OPPONENTS[0];
    return candidates[0];
  }, [cyGetLeague]);

  const cyGetAvailableQuests: () => CyQuest[] = useCallback(() => state.quests.filter((q) => q.status === "available"), [state.quests]);

  const cyGetActiveQuests: () => CyQuest[] = useCallback(() => state.quests.filter((q) => q.status === "accepted"), [state.quests]);

  const cyUpdateQuestProgress: (questType: string, amount: number) => void = useCallback((questType: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      quests: prev.quests.map((q) => {
        if (q.status !== "accepted" || q.type !== questType) return q;
        return { ...q, progress: Math.min(q.goal, q.progress + amount) };
      }),
    }));
  }, []);

  const cyUpdateDailyProgress: (taskIndex: number, amount: number) => void = useCallback((taskIndex: number, amount: number) => {
    setDailies((prev) =>
      prev.map((d, i) => {
        if (i !== taskIndex) return d;
        return { ...d, progress: Math.min(d.goal, d.progress + amount) };
      })
    );
  }, []);

  const cyGetStatsSummary: () => { wins: number; losses: number; draws: number; winRate: number; totalGames: number; rank: number; level: number; title: string; coins: number } = useCallback(() => {
    const total = state.wins + state.losses + state.draws;
    return {
      wins: state.wins,
      losses: state.losses,
      draws: state.draws,
      winRate: total > 0 ? Math.floor((state.wins / total) * 1000) / 10 : 0,
      totalGames: total,
      rank: state.rank,
      level: state.level,
      title: cyGetTitle(),
      coins: state.coins,
    };
  }, [state, cyGetTitle]);

  const cyProcessBattleEnd: (result: "win" | "loss" | "draw") => void = useCallback(
    (result: "win" | "loss" | "draw") => {
      setState((prev) => {
        const updates = { ...prev };
        updates.gamesPlayed += 1;
        if (result === "win") {
          updates.wins += 1;
          updates.rank += 25;
          updates.highestRank = Math.max(updates.highestRank, updates.rank);
        } else if (result === "loss") {
          updates.losses += 1;
          updates.rank = Math.max(0, updates.rank - 10);
        } else {
          updates.draws += 1;
        }
        return updates;
      });
      cyUpdateQuestProgress("battle", 1);
      cyCheckAchievements();
    },
    [cyUpdateQuestProgress, cyCheckAchievements]
  );

  const cyGetNpcs: () => CyNpcDef[] = useCallback(() => CY_NPCS, []);

  const cyGetNpcDef: (npcId: string) => CyNpcDef | undefined = useCallback((npcId: string) => CY_NPCS.find((n) => n.id === npcId), []);

  // ========================================================================
  // Comparator / Utility
  // ========================================================================

  const cyCompareMechs: (a: string, b: string) => number = useCallback(
    (a: string, b: string) => {
      const mA = CY_MECHS.find((m) => m.id === a);
      const mB = CY_MECHS.find((m) => m.id === b);
      if (!mA || !mB) return 0;
      if (mA.tier !== mB.tier) return mB.tier - mA.tier;
      return mB.weight - mA.weight;
    },
    []
  );

  const cyCompareParts: (a: string, b: string) => number = useCallback(
    (a: string, b: string) => {
      const pA = CY_PARTS.find((p) => p.id === a);
      const pB = CY_PARTS.find((p) => p.id === b);
      if (!pA || !pB) return 0;
      const rarityIdx = (r: CyRarity) => CY_RARITY_ORDER.indexOf(r);
      const rd = rarityIdx(pB.rarity) - rarityIdx(pA.rarity);
      if (rd !== 0) return rd;
      return pB.cost - pA.cost;
    },
    []
  );

  const cyGetMechPowerScore: (mechId: string) => number = useCallback(
    (mechId: string) => {
      const build = state.mechs.find((m) => m.mechId === mechId);
      if (!build) return 0;
      const stats = getMechFullStats(state, build);
      // Weighted power formula
      const hpW = stats.hp * 0.5;
      const atkW = stats.attack * 2.0;
      const defW = stats.defense * 1.5;
      const spdW = stats.speed * 1.0;
      const engW = stats.energy * 0.8;
      const critW = stats.critRate * 3.0;
      const critDW = stats.critDmg * 0.5;
      const evaW = stats.evasion * 2.5;
      const accW = stats.accuracy * 1.2;
      return Math.floor(hpW + atkW + defW + spdW + engW + critW + critDW + evaW + accW);
    },
    [state]
  );

  const cyGetOpponentPowerScore: (opponentId: string) => number = useCallback((opponentId: string) => {
    const opp = CY_OPPONENTS.find((o) => o.id === opponentId);
    if (!opp) return 0;
    const s = opp.stats;
    return Math.floor(s.hp * 0.5 + s.attack * 2.0 + s.defense * 1.5 + s.speed * 1.0 + s.energy * 0.8 + s.critRate * 3.0 + s.critDmg * 0.5 + s.evasion * 2.5 + s.accuracy * 1.2);
  }, []);

  const cyGetBattlePrediction: (mechId: string, opponentId: string) => { winChance: number; recommended: string } = useCallback(
    (mechId: string, opponentId: string) => {
      const playerPower = cyGetMechPowerScore(mechId);
      const oppPower = cyGetOpponentPowerScore(opponentId);
      const total = playerPower + oppPower;
      const winChance = total > 0 ? Math.floor((playerPower / total) * 100) : 50;
      let recommended = "attack";
      if (winChance < 30) recommended = "defend";
      else if (winChance < 50) recommended = "ability";
      else if (winChance > 70) recommended = "attack";
      return { winChance, recommended };
    },
    [cyGetMechPowerScore, cyGetOpponentPowerScore]
  );

  const cyGetMechBuildSummary: (mechId: string) => { mechName: string; slotsFilled: number; totalSlots: number; powerScore: number; enhancementCount: number } = useCallback(
    (mechId: string) => {
      const build = state.mechs.find((m) => m.mechId === mechId);
      const mechDef = CY_MECHS.find((m) => m.id === mechId);
      if (!build || !mechDef) return { mechName: "Unknown", slotsFilled: 0, totalSlots: 5, powerScore: 0, enhancementCount: 0 };
      const slots: Array<keyof Pick<CyMechBuild, "weapon" | "shield" | "core" | "mobility" | "sensor">> = ["weapon", "shield", "core", "mobility", "sensor"];
      const slotsFilled = slots.filter((s) => build[s] !== null).length;
      return {
        mechName: mechDef.name,
        slotsFilled,
        totalSlots: 5,
        powerScore: cyGetMechPowerScore(mechId),
        enhancementCount: build.enhancementIds.length,
      };
    },
    [state.mechs, cyGetMechPowerScore]
  );

  const cyGetCostToFullyEquip: (mechId: string) => number = useCallback((mechId: string) => {
    const build = state.mechs.find((m) => m.mechId === mechId);
    if (!build) return 0;
    const slots: Array<keyof Pick<CyMechBuild, "weapon" | "shield" | "core" | "mobility" | "sensor">> = ["weapon", "shield", "core", "mobility", "sensor"];
    let total = 0;
    for (const slot of slots) {
      if (build[slot] === null) {
        // Average cost of a Common part for this slot
        const partsForSlot = CY_PARTS.filter((p) => p.slot === slot && p.rarity === "Common");
        if (partsForSlot.length > 0) total += partsForSlot.reduce((s, p) => s + p.cost, 0) / partsForSlot.length;
      }
    }
    return Math.floor(total);
  }, [state.mechs]);

  const cyGetLootTable: (opponentLevel: number) => Array<{ partId: string; chance: number }> = useCallback(
    (opponentLevel: number) => {
      const rng = cyCreateRNG(rngRef.current() + opponentLevel * 97);
      const eligible = CY_PARTS.filter((p) => {
        const tier = CY_RARITY_ORDER.indexOf(p.rarity) + 1;
        return tier <= Math.ceil(opponentLevel / 10) + 1;
      });
      const lootTable: Array<{ partId: string; chance: number }> = [];
      const selected: CyPartDef[] = [];
      const count = cySeededInt(rng, 1, Math.min(4, eligible.length));
      for (let i = 0; i < count; i++) {
        let part: CyPartDef;
        let attempts = 0;
        do {
          part = cySeededPick(rng, eligible);
          attempts++;
        } while (selected.includes(part) && attempts < 20);
        if (!selected.includes(part)) {
          selected.push(part);
          const rarityMult = CY_RARITY_ORDER.indexOf(part.rarity) === 0 ? 60 : CY_RARITY_ORDER.indexOf(part.rarity) === 1 ? 30 : CY_RARITY_ORDER.indexOf(part.rarity) === 2 ? 10 : CY_RARITY_ORDER.indexOf(part.rarity) === 3 ? 3 : 1;
          lootTable.push({ partId: part.id, chance: rarityMult });
        }
      }
      return lootTable;
    },
    []
  );

  const cyRollLoot: (opponentLevel: number) => CyPartDef | null = useCallback(
    (opponentLevel: number) => {
      const lootTable = cyGetLootTable(opponentLevel);
      if (lootTable.length === 0) return null;
      const rng = cyCreateRNG(rngRef.current() + state.gamesPlayed * 53 + opponentLevel * 17);
      for (const loot of lootTable) {
        if (rng() * 100 < loot.chance) {
          return CY_PARTS.find((p) => p.id === loot.partId) ?? null;
        }
      }
      return null;
    },
    [cyGetLootTable, state.gamesPlayed]
  );

  const cyClaimBattleRewards: () => { coins: number; xp: number; loot: CyPartDef | null } = useCallback(() => {
    if (!battle || battle.phase !== "result" || battle.result !== "win") {
      return { coins: 0, xp: 0, loot: null };
    }
    const opp = CY_OPPONENTS.find((o) => o.id === battle.opponentId);
    if (!opp) return { coins: 0, xp: 0, loot: null };
    const league = cyGetLeague();
    const coins = Math.floor(opp.reward * league.bonusMultiplier);
    const xp = opp.level * 10 + Math.floor(opp.level * 2 * league.bonusMultiplier);
    const loot = cyRollLoot(opp.level);
    cyAddCoins(coins);
    cyAddXP(xp);
    setState((prev) => ({
      ...prev,
      opponentsDefeated: prev.opponentsDefeated.includes(opp.id)
        ? prev.opponentsDefeated
        : [...prev.opponentsDefeated, opp.id],
    }));
    if (loot) {
      setState((prev) => ({
        ...prev,
        parts: prev.parts.find((p) => p.id === loot.id) ? prev.parts : [...prev.parts, { ...loot }],
      }));
    }
    return { coins, xp, loot };
  }, [battle, cyGetLeague, cyRollLoot, cyAddCoins, cyAddXP]);

  const cyDisassemblePart: (partId: string) => number = useCallback((partId: string) => {
    let refund = 0;
    setState((prev) => {
      const part = prev.parts.find((p) => p.id === partId);
      if (!part) return prev;
      refund = Math.floor(part.cost * 0.3 * (1 + part.level * 0.1));
      // Unequip from all mechs
      const newMechs = prev.mechs.map((m) => {
        const updated = { ...m };
        const slots: CyPartSlot[] = ["weapon", "shield", "core", "mobility", "sensor"];
        for (const slot of slots) {
          if (updated[slot] === partId) updated[slot] = null;
        }
        return updated;
      });
      return { ...prev, parts: prev.parts.filter((p) => p.id !== partId), mechs: newMechs, coins: prev.coins + refund };
    });
    return refund;
  }, []);

  const cyGetAbilitiesByType: (type: "offensive" | "defensive" | "utility") => CyAbilityDef[] = useCallback(
    (type: "offensive" | "defensive" | "utility") => {
      return CY_ABILITIES.filter((a) => state.unlockedAbilityIds.includes(a.id) && a.type === type);
    },
    [state.unlockedAbilityIds]
  );

  const cyGetAbilitiesByTier: (tier: number) => CyAbilityDef[] = useCallback(
    (tier: number) => {
      return CY_ABILITIES.filter((a) => state.unlockedAbilityIds.includes(a.id) && a.tier === tier);
    },
    [state.unlockedAbilityIds]
  );

  const cyGetMechsByClass: (mechClass: CyMechClass) => CyMechBuild[] = useCallback(
    (mechClass: CyMechClass) => {
      return state.mechs.filter((m) => {
        const def = CY_MECHS.find((d) => d.id === m.mechId);
        return def?.mechClass === mechClass;
      });
    },
    [state.mechs]
  );

  const cySellMech: (mechId: string) => number = useCallback((mechId: string) => {
    let refund = 0;
    setState((prev) => {
      const def = CY_MECHS.find((m) => m.id === mechId);
      if (!def) return prev;
      const idx = prev.mechs.findIndex((m) => m.mechId === mechId);
      if (idx === -1) return prev;
      refund = Math.floor(def.tier * 250);
      const newMechs = prev.mechs.filter((m) => m.mechId !== mechId);
      const newTeam = prev.team.filter((t) => t.mechId !== mechId);
      let newActive = prev.activeMechId;
      if (prev.activeMechId === mechId) newActive = newMechs.length > 0 ? newMechs[0].mechId : null;
      return { ...prev, mechs: newMechs, team: newTeam, activeMechId: newActive, coins: prev.coins + refund };
    });
    return refund;
  }, []);

  const cyGetTotalInventoryValue: () => number = useCallback(() => {
    const partsValue = state.parts.reduce((s, p) => s + Math.floor(p.cost * 0.3 * (1 + p.level * 0.1)), 0);
    const mechsValue = state.mechs.reduce((s, m) => {
      const def = CY_MECHS.find((d) => d.id === m.mechId);
      return s + (def ? Math.floor(def.tier * 250) : 0);
    }, 0);
    return partsValue + mechsValue;
  }, [state.parts, state.mechs]);

  const cyIsMaxLevel: () => boolean = useCallback(() => state.level >= CY_MAX_LEVEL, [state.level]);

  const cyGetXpToNextLevel: () => number = useCallback(() => {
    if (state.level >= CY_MAX_LEVEL) return 0;
    return xpForLevel(state.level) - state.xp;
  }, [state.level, state.xp]);

  const cyGetTotalCoinsEarned: () => number = useCallback(
    () => {
      // Estimate: current coins + total spent (tracked via state differences)
      // Since we don't track spent separately, use rewards as proxy
      const battleRewards = state.wins * 150 + state.losses * 30;
      const questRewards = state.quests
        .filter((q) => q.status === "completed")
        .reduce((s, q) => s + q.reward.coins, 0);
      return battleRewards + questRewards + 1000; // 1000 starting coins
    },
    [state.wins, state.losses, state.quests]
  );

  const cyGetDefeatedOpponents: () => string[] = useCallback(() => state.opponentsDefeated, [state.opponentsDefeated]);

  const cyHasDefeatedOpponent: (opponentId: string) => boolean = useCallback(
    (opponentId: string) => state.opponentsDefeated.includes(opponentId),
    [state.opponentsDefeated]
  );

  // ========================================================================
  // Return
  // ========================================================================

  return {
    // State
    cyGetState,
    cyResetState,
    // Level / XP
    cyGetLevel,
    cyGetTitle,
    cyGetProgress,
    cyAddXP,
    // Coins
    cyGetCoins,
    cyAddCoins,
    cySpendCoins,
    // Mechs
    cyGetMechs,
    cyBuildMech,
    cyGetActiveMech,
    cyEquipPart,
    cySetActiveMech,
    cyGetMechDef,
    cyGetMechStats,
    cyGetMechClassList,
    // Parts
    cyGetParts,
    cyBuyPart,
    cyUpgradePart,
    cyGetPartsBySlot,
    cyGetPartsByRarity,
    cyGetAllPartsCatalog,
    cyUnequipPart,
    // Abilities
    cyGetAbilities,
    cyUnlockAbility,
    cyUseAbility,
    cyGetAbilityCatalog,
    // Leagues
    cyGetLeague,
    cyGetRank,
    cyAdvanceRank,
    cyGetLeagueProgress,
    // Battle
    cyStartBattle,
    cyBattleAction,
    cyGetBattleResult,
    cyGetWinRate,
    cyGetBattleLog,
    cySimulateBattle,
    cyProcessBattleEnd,
    // Tournaments
    cyGetTournaments,
    cyEnterTournament,
    cyGetTournamentDef,
    // Enhancements
    cyGetEnhancements,
    cyInstallEnhancement,
    cyGetEnhancementCatalog,
    // Team
    cyGetTeam,
    cyAddTeamMember,
    cyRemoveTeamMember,
    cyGetTeamSynergy,
    // Quests
    cyGetQuests,
    cyAcceptQuest,
    cyCompleteQuest,
    cyGetAvailableQuests,
    cyGetActiveQuests,
    cyUpdateQuestProgress,
    // Achievements
    cyGetAchievements,
    cyCheckAchievements,
    // Daily
    cyGetDailyTask,
    cyClaimDailyReward,
    cyUpdateDailyProgress,
    // NPC
    cyGetNpcs,
    cyGetNpcDef,
    cyGetNpcDialogue,
    cyGetNpcShop,
    // Opponents
    cyGetOpponentDef,
    cyGetRandomOpponent,
    cyGetOpponentsForLevel,
    cyGetRecommendedOpponent,
    // Summary
    cyGetStatsSummary,
    cyGetTotalGamesPlayed,
    cyGetHighestRank,
    cyGetRarityList,
    // Comparator / Utility
    cyCompareMechs,
    cyCompareParts,
    cyGetMechPowerScore,
    cyGetOpponentPowerScore,
    cyGetBattlePrediction,
    cyGetMechBuildSummary,
    cyGetCostToFullyEquip,
    cyGetLootTable,
    cyRollLoot,
    cyClaimBattleRewards,
    cyDisassemblePart,
    cyGetAbilitiesByType,
    cyGetAbilitiesByTier,
    cyGetMechsByClass,
    cySellMech,
    cyGetTotalInventoryValue,
    cyIsMaxLevel,
    cyGetXpToNextLevel,
    cyGetTotalCoinsEarned,
    cyGetDefeatedOpponents,
    cyHasDefeatedOpponent,
  };
}
