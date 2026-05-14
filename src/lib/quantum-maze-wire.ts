// ============================================================================
// Quantum Maze Wire Module — Word Snake Game
// Quantum Maze (量子迷宫): Navigate 8 quantum dimensions, collect 35 particles,
// solve paradoxes, build structures, and ascend from Quantum Observer to
// Multiverse Architect. All state and logic lives inside `useQuantumMaze()`.
// ============================================================================

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

type QMRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type QMParticleType = 'boson' | 'fermion' | 'quark' | 'lepton' | 'gauge';

type QMDifficulty = 'easy' | 'medium' | 'hard' | 'extreme' | 'paradox';

type QMParadoxSeverity = 'minor' | 'moderate' | 'severe' | 'catastrophic' | 'reality-breaking';

// ---------------------------------------------------------------------------
// Dimension Interfaces
// ---------------------------------------------------------------------------

interface QMDimensionDef {
  id: string;
  name: string;
  description: string;
  paradoxLevel: number;
  unlockLevel: number;
}

interface QMDimensionState {
  id: string;
  entered: boolean;
  exploredDepth: number;
  maxDepth: number;
  particlesFound: number;
  paradoxesSolved: number;
}

// ---------------------------------------------------------------------------
// Particle Interfaces
// ---------------------------------------------------------------------------

interface QMParticleDef {
  id: string;
  name: string;
  rarity: QMRarity;
  type: QMParticleType;
  spin: string;
  charge: string;
  description: string;
  energyValue: number;
}

interface QMCollectedParticle {
  particleId: string;
  quantity: number;
  firstCollectedAt: number | null;
  entangledWith: string | null;
}

// ---------------------------------------------------------------------------
// Artifact Interfaces
// ---------------------------------------------------------------------------

interface QMArtifactDef {
  id: string;
  name: string;
  rarity: QMRarity;
  description: string;
  power: number;
  goldCost: number;
}

interface QMArtifactState {
  id: string;
  owned: boolean;
  quantity: number;
  equipped: boolean;
}

// ---------------------------------------------------------------------------
// Structure Interfaces
// ---------------------------------------------------------------------------

interface QMStructureDef {
  id: string;
  name: string;
  description: string;
  baseUpgradeCost: number;
  basePower: number;
  maxLevel: number;
}

interface QMStructureState {
  id: string;
  level: number;
  built: boolean;
  power: number;
}

// ---------------------------------------------------------------------------
// Ability Interfaces
// ---------------------------------------------------------------------------

interface QMAbilityDef {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  power: number;
  energyCost: number;
  unlockLevel: number;
}

interface QMAbilityState {
  id: string;
  unlocked: boolean;
  currentCooldown: number;
}

// ---------------------------------------------------------------------------
// Achievement Interfaces
// ---------------------------------------------------------------------------

interface QMAchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: string;
  target: number;
}

interface QMAchievementState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
  progress: number;
}

// ---------------------------------------------------------------------------
// Title, Path, Paradox Interfaces
// ---------------------------------------------------------------------------

interface QMTitleDef {
  id: string;
  name: string;
  requiredLevel: number;
  requiredParticles: number;
  requiredParadoxes: number;
}

interface QMMazePathDef {
  id: string;
  name: string;
  description: string;
  difficulty: QMDifficulty;
  length: number;
  rewards: string[];
  goldReward: number;
  energyReward: number;
}

interface QMParadoxDef {
  id: string;
  name: string;
  description: string;
  severity: QMParadoxSeverity;
  resolutionReward: number;
}

interface QMParadoxState {
  id: string;
  active: boolean;
  solved: boolean;
  solvedAt: number | null;
  attempts: number;
}

// ---------------------------------------------------------------------------
// Combined State Type
// ---------------------------------------------------------------------------

interface QMState {
  dimensions: QMDimensionState[];
  collectedParticles: QMCollectedParticle[];
  artifacts: QMArtifactState[];
  structures: QMStructureState[];
  achievements: QMAchievementState[];
  abilities: QMAbilityState[];
  paradoxes: QMParadoxState[];
  currentTitle: string;
  mazeLevel: number;
  mazeExp: number;
  gold: number;
  quantumEnergy: number;
  probability: number;
  currentDimensionId: string;
  activeParadoxId: string | null;
  totalObserved: number;
  totalCollapsed: number;
  totalNavigated: number;
  coherenceLevel: number;
  entanglementCount: number;
}

// ---------------------------------------------------------------------------
// Color Theme Constants (8 colors)
// ---------------------------------------------------------------------------

const QM_COLOR_QUANTUM = '#00FFFF';
const QM_COLOR_WAVE = '#8B5CF6';
const QM_COLOR_PARTICLE = '#F43F5E';
const QM_COLOR_ENTANGLE = '#10B981';
const QM_COLOR_PARADOX = '#F59E0B';
const QM_COLOR_SINGULARITY = '#1E1B4B';
const QM_COLOR_MULTIVERSE = '#EC4899';
const QM_COLOR_OBSERVER = '#6366F1';

// ---------------------------------------------------------------------------
// QM_DIMENSIONS: 8 quantum dimensions
// ---------------------------------------------------------------------------

const QM_DIMENSIONS: readonly QMDimensionDef[] = [
  {
    id: 'probability_realm',
    name: 'Probability Realm',
    description: 'A shimmering landscape where all possible outcomes exist simultaneously as ghostly echoes. Every path you take splits into infinite branches, each representing a different quantum probability.',
    paradoxLevel: 1,
    unlockLevel: 1,
  },
  {
    id: 'superposition_hall',
    name: 'Superposition Hall',
    description: 'A vast crystalline chamber where objects exist in multiple states at once. The walls themselves shift between solid and transparent depending on whether you are observing them.',
    paradoxLevel: 2,
    unlockLevel: 3,
  },
  {
    id: 'entanglement_garden',
    name: 'Entanglement Garden',
    description: 'A bioluminescent garden where every flower is quantum-entangled with another across impossible distances. Pluck one petal and its twin instantly wilts in a dimension far away.',
    paradoxLevel: 2,
    unlockLevel: 5,
  },
  {
    id: 'wave_chamber',
    name: 'Wave Chamber',
    description: 'An echoing cavern where matter dissolves into probability waves. Your footsteps ripple outward as interference patterns, sometimes reinforcing and sometimes canceling into nothing.',
    paradoxLevel: 3,
    unlockLevel: 8,
  },
  {
    id: 'singularity_core',
    name: 'Singularity Core',
    description: 'The heart of the maze, where gravity and quantum mechanics merge into an infinitely dense point. Time slows to a crawl and space curves back upon itself in dizzying loops.',
    paradoxLevel: 4,
    unlockLevel: 12,
  },
  {
    id: 'observers_balcony',
    name: "Observer's Balcony",
    description: 'A panoramic vantage point that exists only when someone is looking at it. The act of observation collapses the balcony into being, revealing views across all eight dimensions simultaneously.',
    paradoxLevel: 3,
    unlockLevel: 15,
  },
  {
    id: 'uncertainty_vault',
    name: 'Uncertainty Vault',
    description: 'An impregnable vault where the more precisely you know one thing, the less you can know about anything else. Its contents are always exactly determined yet forever unknowable.',
    paradoxLevel: 5,
    unlockLevel: 20,
  },
  {
    id: 'multiverse_gate',
    name: 'Multiverse Gate',
    description: 'The final gateway, a swirling vortex of infinite possibilities leading to every version of the maze that could ever exist. Only those who have mastered all paradoxes may pass through.',
    paradoxLevel: 5,
    unlockLevel: 25,
  },
];

// ---------------------------------------------------------------------------
// QM_PARTICLES: 35 quantum particles (5 rarity tiers, 7 per tier)
// ---------------------------------------------------------------------------

const QM_PARTICLES: readonly QMParticleDef[] = [
  // ---- Common (7) ----
  {
    id: 'qm_photon_alpha',
    name: 'Alpha Photon',
    rarity: 'common',
    type: 'boson',
    spin: '1',
    charge: '0',
    description: 'A basic photon found drifting through the Probability Realm. It carries no charge and travels at maximum speed through the maze corridors.',
    energyValue: 5,
  },
  {
    id: 'qm_electron_beta',
    name: 'Beta Electron',
    rarity: 'common',
    type: 'lepton',
    spin: '1/2',
    charge: '-1',
    description: 'A negatively charged lepton orbiting the crystalline structures of the Superposition Hall. Its spin creates tiny magnetic vortices in the maze walls.',
    energyValue: 5,
  },
  {
    id: 'qm_up_quark_charm',
    name: 'Charm Up Quark',
    rarity: 'common',
    type: 'quark',
    spin: '1/2',
    charge: '+2/3',
    description: 'A light quark with an unusual charm signature found near the Entanglement Garden. It binds with down quarks to form the fabric of maze corridors.',
    energyValue: 6,
  },
  {
    id: 'qm_down_quark_strange',
    name: 'Strange Down Quark',
    rarity: 'common',
    type: 'quark',
    spin: '1/2',
    charge: '-1/3',
    description: 'A down quark exhibiting strange behavior in the Wave Chamber. It occasionally flips between existence and non-existence without warning.',
    energyValue: 6,
  },
  {
    id: 'qm_gluon_weave',
    name: 'Weave Gluon',
    rarity: 'common',
    type: 'gauge',
    spin: '1',
    charge: '0',
    description: 'A gluon that weaves the strong force binding maze walls together. It carries color charge and constantly shifts between red, green, and blue.',
    energyValue: 7,
  },
  {
    id: 'qm_neutrino_echo',
    name: 'Echo Neutrino',
    rarity: 'common',
    type: 'lepton',
    spin: '1/2',
    charge: '0',
    description: 'A ghostly neutrino that passes through all maze walls as if they were not there. It barely interacts with anything, leaving only the faintest trace.',
    energyValue: 7,
  },
  {
    id: 'qm_muon_shimmer',
    name: 'Shimmer Muon',
    rarity: 'common',
    type: 'lepton',
    spin: '1/2',
    charge: '-1',
    description: 'A short-lived muon that shimmers into existence near the Singularity Core before decaying. Its brief lifetime makes it a challenge to capture.',
    energyValue: 8,
  },

  // ---- Uncommon (7) ----
  {
    id: 'qm_w_boson_crest',
    name: 'Crest W Boson',
    rarity: 'uncommon',
    type: 'gauge',
    spin: '1',
    charge: '+1',
    description: 'A charged weak boson that mediates transformations between maze particles. It can change a quark type, altering the fundamental structure of corridors.',
    energyValue: 12,
  },
  {
    id: 'qm_z_boson_null',
    name: 'Null Z Boson',
    rarity: 'uncommon',
    type: 'gauge',
    spin: '1',
    charge: '0',
    description: 'A neutral heavy boson that marks zones of stability within the maze. Where Z Bosons gather, quantum fluctuations are temporarily suppressed.',
    energyValue: 13,
  },
  {
    id: 'qm_pion_dual',
    name: 'Dual Pion',
    rarity: 'uncommon',
    type: 'boson',
    spin: '0',
    charge: '0',
    description: 'A meson existing as both a positive and negative pion simultaneously. It creates interference patterns that reveal hidden maze passages.',
    energyValue: 14,
  },
  {
    id: 'qm_kaon_flux',
    name: 'Flux Kaon',
    rarity: 'uncommon',
    type: 'boson',
    spin: '0',
    charge: '0',
    description: 'A strange quark-containing meson that fluctuates between dimensions. It provides brief glimpses of parallel maze paths.',
    energyValue: 14,
  },
  {
    id: 'qm_tau_residual',
    name: 'Residual Tau',
    rarity: 'uncommon',
    type: 'lepton',
    spin: '1/2',
    charge: '-1',
    description: 'A heavy tau lepton residue left behind after dimensional collapses. Its decay products mark safe paths through paradox zones.',
    energyValue: 15,
  },
  {
    id: 'qm_positron_mirror',
    name: 'Mirror Positron',
    rarity: 'uncommon',
    type: 'lepton',
    spin: '1/2',
    charge: '+1',
    description: 'The antimatter twin of the electron, found in mirrored sections of the maze. Annihilating it with an electron releases pure maze energy.',
    energyValue: 16,
  },
  {
    id: 'qm_quark_top_glance',
    name: 'Top Glance Quark',
    rarity: 'uncommon',
    type: 'quark',
    spin: '1/2',
    charge: '+2/3',
    description: 'A rare top quark glimpse that appears only for an instant before decaying. Capturing it requires perfect timing and observation.',
    energyValue: 17,
  },

  // ---- Rare (7) ----
  {
    id: 'qm_higgs_shroud',
    name: 'Higgs Shroud',
    rarity: 'rare',
    type: 'boson',
    spin: '0',
    charge: '0',
    description: 'A scalar boson cloaked in the Higgs field that gives mass to maze structures. Its presence determines which walls are solid and which are phantom.',
    energyValue: 25,
  },
  {
    id: 'qm_axion_whisper',
    name: 'Whisper Axion',
    rarity: 'rare',
    type: 'boson',
    spin: '0',
    charge: '0',
    description: 'A hypothetical axion that whispers clues about hidden maze exits. It may constitute the dark matter scaffolding of the labyrinth.',
    energyValue: 28,
  },
  {
    id: 'qm_anyon_braid',
    name: 'Braid Anyon',
    rarity: 'rare',
    type: 'fermion',
    spin: 'fractional',
    charge: 'fractional',
    description: 'An exotic anyon that exists only in two-dimensional maze surfaces. Braiding anyons together creates topological paths immune to paradox corruption.',
    energyValue: 30,
  },
  {
    id: 'qm_tachyon_bolt',
    name: 'Tachyon Bolt',
    rarity: 'rare',
    type: 'fermion',
    spin: '1',
    charge: '0',
    description: 'A superluminal particle that arrives before it was emitted. In the maze, it reveals future paths, allowing navigators to see obstacles before they form.',
    energyValue: 32,
  },
  {
    id: 'qm_majorana_ghost',
    name: 'Ghost Majorana',
    rarity: 'rare',
    type: 'fermion',
    spin: '1/2',
    charge: '0',
    description: 'A Majorana fermion that is its own antiparticle, haunting the Uncertainty Vault. It can exist in two places at once, marking entangled maze junctions.',
    energyValue: 35,
  },
  {
    id: 'qm_sterile_drift',
    name: 'Sterile Drift',
    rarity: 'rare',
    type: 'fermion',
    spin: '1/2',
    charge: '0',
    description: 'A sterile neutrino that drifts between dimensions without interacting. It leaves invisible trails that only coherence-boosted observers can follow.',
    energyValue: 33,
  },
  {
    id: 'qm_preon_seed',
    name: 'Preon Seed',
    rarity: 'rare',
    type: 'quark',
    spin: '1/2',
    charge: 'variable',
    description: 'A hypothetical sub-quark particle that seeds new maze corridors when planted. It contains the blueprints for entire quantum structures.',
    energyValue: 36,
  },

  // ---- Epic (7) ----
  {
    id: 'qm_graviton_pulse',
    name: 'Graviton Pulse',
    rarity: 'epic',
    type: 'gauge',
    spin: '2',
    charge: '0',
    description: 'A massless spin-2 boson that warps the spacetime fabric of the maze. Its gravitational waves can bend corridors and create shortcuts through impossible geometries.',
    energyValue: 50,
  },
  {
    id: 'qm_dark_phantom',
    name: 'Dark Phantom',
    rarity: 'epic',
    type: 'fermion',
    spin: '1/2',
    charge: '0',
    description: 'A WIMP-like dark matter particle that phases through normal maze walls while solidifying dark corridors invisible to ordinary observation.',
    energyValue: 55,
  },
  {
    id: 'qm_dark_glow',
    name: 'Dark Glow',
    rarity: 'epic',
    type: 'gauge',
    spin: '1',
    charge: '0',
    description: 'A dark photon from a hidden sector that illuminates secret maze pathways with invisible light. It mediates forces unknown to standard physics.',
    energyValue: 58,
  },
  {
    id: 'qm_monopole_anchor',
    name: 'Monopole Anchor',
    rarity: 'epic',
    type: 'fermion',
    spin: '0',
    charge: '1g',
    description: 'A magnetic monopole carrying isolated north charge. It anchors paradox-stable regions of the maze, creating safe zones where reality does not fracture.',
    energyValue: 60,
  },
  {
    id: 'qm_time_crystal_shard',
    name: 'Time Crystal Shard',
    rarity: 'epic',
    type: 'boson',
    spin: '0',
    charge: '0',
    description: 'A fragment of a time crystal exhibiting periodic structure in time rather than space. It creates temporal loops in the maze that repeat favorable outcomes.',
    energyValue: 65,
  },
  {
    id: 'qm_bosenova_core',
    name: 'Bosenova Core',
    rarity: 'epic',
    type: 'boson',
    spin: '0',
    charge: '0',
    description: 'The remnant of a bosenova implosion, where a Bose-Einstein condensate collapsed inward. It generates powerful shockwaves that clear maze obstacles.',
    energyValue: 62,
  },
  {
    id: 'qm_condensate_dew',
    name: 'Condensate Dew',
    rarity: 'epic',
    type: 'boson',
    spin: '0',
    charge: '0',
    description: 'Drops of quantum condensate that form at absolute zero points within the maze. They freeze paradox effects in place, preventing escalation.',
    energyValue: 55,
  },

  // ---- Legendary (7) ----
  {
    id: 'qm_planck_grain',
    name: 'Planck Grain',
    rarity: 'legendary',
    type: 'fermion',
    spin: 'variable',
    charge: 'variable',
    description: 'A single grain of reality at the Planck scale, the smallest possible unit of maze structure. It contains the compressed information of an entire dimension.',
    energyValue: 100,
  },
  {
    id: 'qm_superstring_resonance',
    name: 'Superstring Resonance',
    rarity: 'legendary',
    type: 'boson',
    spin: '2',
    charge: '0',
    description: 'A fundamental string vibration from the eleventh dimension that defines the maze itself. Changing its resonance frequency rewrites local maze geometry.',
    energyValue: 120,
  },
  {
    id: 'qm_foam_bubble',
    name: 'Foam Bubble',
    rarity: 'legendary',
    type: 'boson',
    spin: '1/2',
    charge: '0',
    description: 'A bubble of quantum foam extracted from the fabric of spacetime itself. Inside it, the maze has infinite resolution and zero uncertainty.',
    energyValue: 130,
  },
  {
    id: 'qm_wormhole_thread',
    name: 'Wormhole Thread',
    rarity: 'legendary',
    type: 'fermion',
    spin: '2',
    charge: '0',
    description: 'A thread of exotic matter holding open a microscopic wormhole. It connects two distant points in the maze, creating an instantaneous corridor.',
    energyValue: 140,
  },
  {
    id: 'qm_vacuum_spark',
    name: 'Vacuum Spark',
    rarity: 'legendary',
    type: 'gauge',
    spin: '1',
    charge: '0',
    description: 'A spark of pure energy from quantum vacuum fluctuations. It can manifest matter from nothing, creating temporary maze structures at will.',
    energyValue: 150,
  },
  {
    id: 'qm_infinity_loop',
    name: 'Infinity Loop',
    rarity: 'legendary',
    type: 'boson',
    spin: '0',
    charge: '0',
    description: 'A self-sustaining quantum loop that generates infinite energy from nothing. It powers the Multiverse Gate and is the ultimate prize of the maze.',
    energyValue: 200,
  },
  {
    id: 'qm_omniscience_orb',
    name: 'Omniscience Orb',
    rarity: 'legendary',
    type: 'boson',
    spin: 'infinite',
    charge: '0',
    description: 'A transcendent sphere containing the complete quantum state of all eight dimensions simultaneously. Holding it grants perfect knowledge of every maze path.',
    energyValue: 250,
  },
];

// ---------------------------------------------------------------------------
// QM_ARTIFACTS: 30 quantum artifacts
// ---------------------------------------------------------------------------

const QM_ARTIFACTS: readonly QMArtifactDef[] = [
  { id: 'qm_prob_engine_basic', name: 'Basic Probability Engine', rarity: 'common', description: 'A simple device that nudges probability slightly in your favor when navigating maze paths.', power: 5, goldCost: 50 },
  { id: 'qm_wave_collapser_mk1', name: 'Wave Collapser Mk.I', rarity: 'common', description: 'Forces partial wave function collapse, revealing one step ahead in the maze corridor.', power: 5, goldCost: 60 },
  { id: 'qm_entangle_ring_pair', name: 'Entangle Ring Pair', rarity: 'common', description: 'Two quantum-linked rings that vibrate when your entangled partner approaches a paradox zone.', power: 8, goldCost: 80 },
  { id: 'qm_coherence_lens', name: 'Coherence Lens', rarity: 'common', description: 'A precision lens that focuses your quantum coherence, extending observation range by a small margin.', power: 6, goldCost: 70 },
  { id: 'qm_probability_compass', name: 'Probability Compass', rarity: 'common', description: 'A compass whose needle points toward the most probable successful path through the maze.', power: 7, goldCost: 90 },
  { id: 'qm_energy_condenser', name: 'Energy Condenser', rarity: 'common', description: 'Condenses ambient quantum energy into a usable form, providing a small passive energy income.', power: 4, goldCost: 40 },
  { id: 'qm_particle_sieve', name: 'Particle Sieve', rarity: 'common', description: 'Filters quantum noise to isolate particle signatures, increasing particle observation quality.', power: 5, goldCost: 55 },
  { id: 'qm_dimension_echo', name: 'Dimension Echo', rarity: 'uncommon', description: 'Records and replays echoes from parallel dimensions, revealing alternative maze routes.', power: 15, goldCost: 200 },
  { id: 'qm_prob_engine_adv', name: 'Advanced Probability Engine', rarity: 'uncommon', description: 'An upgraded probability engine with finer control over quantum outcomes during navigation.', power: 18, goldCost: 250 },
  { id: 'qm_wave_collapser_mk2', name: 'Wave Collapser Mk.II', rarity: 'uncommon', description: 'Collapses wave functions across a wider area, revealing multiple maze corridors at once.', power: 16, goldCost: 220 },
  { id: 'qm_entangle_necklace', name: 'Entanglement Necklace', rarity: 'uncommon', description: 'A necklace of quantum-entangled beads that warns of incoming paradox shifts with subtle vibrations.', power: 14, goldCost: 180 },
  { id: 'qm_coherence_booster', name: 'Coherence Booster', rarity: 'uncommon', description: 'Boosts quantum coherence levels temporarily, allowing clearer observation of superposed paths.', power: 17, goldCost: 240 },
  { id: 'qm_paradox_shield', name: 'Paradox Shield', rarity: 'uncommon', description: 'Generates a protective field that absorbs minor paradox damage while navigating unstable corridors.', power: 20, goldCost: 280 },
  { id: 'qm_tunnel_gloves', name: 'Quantum Tunnel Gloves', rarity: 'uncommon', description: 'Gloves that allow brief quantum tunneling through thin maze walls to reach otherwise inaccessible areas.', power: 15, goldCost: 210 },
  { id: 'qm_singularity_lens', name: 'Singularity Lens', rarity: 'rare', description: 'Focuses gravitational effects from the Singularity Core to warp local maze geometry in your favor.', power: 35, goldCost: 600 },
  { id: 'qm_prob_engine_elite', name: 'Elite Probability Engine', rarity: 'rare', description: 'A precision probability engine that can rewrite quantum amplitudes to guarantee favorable navigation outcomes.', power: 40, goldCost: 700 },
  { id: 'qm_wave_collapser_mk3', name: 'Wave Collapser Mk.III', rarity: 'rare', description: 'The most powerful wave collapser, capable of collapsing entire maze sections into definite states.', power: 38, goldCost: 650 },
  { id: 'qm_observer_crown', name: "Observer's Crown", rarity: 'rare', description: 'A crown that amplifies the observer effect, allowing you to reshape maze reality through focused attention.', power: 42, goldCost: 750 },
  { id: 'qm_entropy_reverser', name: 'Entropy Reverser', rarity: 'rare', description: 'Reverses local entropy within a maze corridor, restoring collapsed paths and regenerating lost structures.', power: 36, goldCost: 620 },
  { id: 'qm_dimension_key', name: 'Dimension Key', rarity: 'rare', description: 'A key forged from interdimensional alloy that unlocks hidden passages between quantum dimensions.', power: 45, goldCost: 800 },
  { id: 'qm_vacuum_armor', name: 'Vacuum Armor', rarity: 'rare', description: 'Armor woven from quantum vacuum fluctuations that makes the wearer partially immune to paradox effects.', power: 37, goldCost: 680 },
  { id: 'qm_paradox_mirror', name: 'Paradox Mirror', rarity: 'rare', description: 'A mirror that reflects paradoxes back onto themselves, neutralizing moderate paradox zones.', power: 44, goldCost: 780 },
  { id: 'qm_multiverse_map', name: 'Multiverse Map', rarity: 'epic', description: 'A map that shows all possible versions of the maze simultaneously, highlighting the optimal path across all realities.', power: 80, goldCost: 2000 },
  { id: 'qm_singularity_harness', name: 'Singularity Harness', rarity: 'epic', description: 'Harnesses the gravitational power of a controlled singularity to bend space and create permanent maze shortcuts.', power: 85, goldCost: 2200 },
  { id: 'qm_time_crystal_staff', name: 'Time Crystal Staff', rarity: 'epic', description: 'A staff topped with a stabilized time crystal that can freeze local time within maze corridors.', power: 90, goldCost: 2500 },
  { id: 'qm_omni_collar', name: 'Omniscience Collar', rarity: 'epic', description: 'A collar connected to every dimension simultaneously, granting awareness of all active paradoxes and particle positions.', power: 95, goldCost: 2800 },
  { id: 'qm_grand_theory_ring', name: 'Grand Theory Ring', rarity: 'epic', description: 'A ring inscribed with the equations of a unified theory, boosting all quantum abilities by a significant margin.', power: 88, goldCost: 2400 },
  { id: 'qm_reality_anchor', name: 'Reality Anchor', rarity: 'legendary', description: 'An anchor that pins a section of the maze to definite reality, permanently eliminating all local paradox effects.', power: 150, goldCost: 8000 },
  { id: 'qm_infinity_gauntlet', name: 'Infinity Gauntlet', rarity: 'legendary', description: 'A gauntlet containing six quantum gems, each controlling a fundamental aspect of maze reality.', power: 200, goldCost: 12000 },
  { id: 'qm_multiverse_key', name: 'Multiverse Master Key', rarity: 'legendary', description: 'The master key that unlocks every sealed passage, door, and barrier across all eight quantum dimensions simultaneously.', power: 250, goldCost: 15000 },
];

// ---------------------------------------------------------------------------
// QM_STRUCTURES: 25 upgradeable maze structures (level 1-10)
// ---------------------------------------------------------------------------

const QM_STRUCTURES: readonly QMStructureDef[] = [
  { id: 'qm_lab_basic', name: 'Basic Quantum Lab', description: 'A simple laboratory for analyzing quantum particles found in the maze corridors.', baseUpgradeCost: 100, basePower: 5, maxLevel: 10 },
  { id: 'qm_obs_deck_1', name: 'Observation Deck Alpha', description: 'A raised platform providing a better vantage point for observing quantum phenomena in nearby corridors.', baseUpgradeCost: 120, basePower: 6, maxLevel: 10 },
  { id: 'qm_accel_linear', name: 'Linear Particle Accelerator', description: 'A straight accelerator for boosting particles to moderate energies for maze navigation experiments.', baseUpgradeCost: 150, basePower: 8, maxLevel: 10 },
  { id: 'qm_detector_array', name: 'Quantum Detector Array', description: 'An array of sensors detecting particle signatures, paradox fluctuations, and dimensional boundaries.', baseUpgradeCost: 130, basePower: 7, maxLevel: 10 },
  { id: 'qm_energy_cell', name: 'Quantum Energy Cell', description: 'A storage cell that harvests and stores quantum energy from ambient maze fluctuations.', baseUpgradeCost: 100, basePower: 5, maxLevel: 10 },
  { id: 'qm_entangle_chamber', name: 'Entanglement Chamber', description: 'A sealed chamber for creating and maintaining stable quantum entanglement between particle pairs.', baseUpgradeCost: 180, basePower: 10, maxLevel: 10 },
  { id: 'qm_wave_bank', name: 'Wave Function Bank', description: 'A repository storing wave function states for later analysis and manipulation during maze runs.', baseUpgradeCost: 160, basePower: 9, maxLevel: 10 },
  { id: 'qm_obs_deck_2', name: 'Observation Deck Beta', description: 'An advanced observation platform with enhanced sensors for monitoring distant maze sectors.', baseUpgradeCost: 200, basePower: 11, maxLevel: 10 },
  { id: 'qm_lab_advanced', name: 'Advanced Quantum Lab', description: 'A well-equipped laboratory capable of synthesizing quantum materials from collected particles.', baseUpgradeCost: 250, basePower: 13, maxLevel: 10 },
  { id: 'qm_accel_ring', name: 'Ring Particle Accelerator', description: 'A circular accelerator achieving higher energies, producing rarer particles from maze matter.', baseUpgradeCost: 280, basePower: 14, maxLevel: 10 },
  { id: 'qm_paradox_lab', name: 'Paradox Research Lab', description: 'A specialized laboratory for studying and developing countermeasures against quantum paradoxes.', baseUpgradeCost: 220, basePower: 12, maxLevel: 10 },
  { id: 'qm_probability_forge', name: 'Probability Forge', description: 'A forge that manipulates probability fields to create favorable outcomes during maze navigation.', baseUpgradeCost: 300, basePower: 15, maxLevel: 10 },
  { id: 'qm_coherence_tower', name: 'Coherence Tower', description: 'A tall tower that extends quantum coherence across wide areas of the maze, stabilizing corridors.', baseUpgradeCost: 320, basePower: 16, maxLevel: 10 },
  { id: 'qm_lab_elite', name: 'Elite Quantum Lab', description: 'A cutting-edge laboratory with equipment for the most demanding quantum experiments.', baseUpgradeCost: 350, basePower: 18, maxLevel: 10 },
  { id: 'qm_accel_collider', name: 'Quantum Collider', description: 'A massive collider smashing particles at extreme energies to probe the deepest maze mysteries.', baseUpgradeCost: 400, basePower: 20, maxLevel: 10 },
  { id: 'qm_singularity_shield', name: 'Singularity Shield Generator', description: 'Generates a protective barrier around maze sections, shielding them from singularity radiation.', baseUpgradeCost: 380, basePower: 19, maxLevel: 10 },
  { id: 'qm_dimension_bridge', name: 'Dimension Bridge', description: 'A bridge connecting two dimensions, allowing direct travel between previously isolated maze zones.', baseUpgradeCost: 420, basePower: 22, maxLevel: 10 },
  { id: 'qm_obs_deck_omega', name: 'Observation Deck Omega', description: 'The ultimate observation platform with sensors spanning all eight dimensions simultaneously.', baseUpgradeCost: 450, basePower: 24, maxLevel: 10 },
  { id: 'qm_paradox_engine', name: 'Paradox Engine', description: 'An engine that converts paradox energy into usable maze power, turning obstacles into resources.', baseUpgradeCost: 480, basePower: 25, maxLevel: 10 },
  { id: 'qm_time_craft', name: 'Time Crafting Station', description: 'A station for manipulating temporal aspects of the maze, slowing or reversing local time flow.', baseUpgradeCost: 500, basePower: 26, maxLevel: 10 },
  { id: 'qm_lab_master', name: 'Master Quantum Lab', description: 'A legendary laboratory combining all quantum research capabilities into one extraordinary facility.', baseUpgradeCost: 550, basePower: 28, maxLevel: 10 },
  { id: 'qm_reality_loom', name: 'Reality Loom', description: 'A loom that weaves and unweaves the fabric of maze reality, creating and destroying corridors at will.', baseUpgradeCost: 600, basePower: 30, maxLevel: 10 },
  { id: 'qm_infinity_reactor', name: 'Infinity Reactor', description: 'A reactor harnessing infinite quantum energy to power all maze structures simultaneously.', baseUpgradeCost: 700, basePower: 35, maxLevel: 10 },
  { id: 'qm_multiverse_nexus', name: 'Multiverse Nexus Hub', description: 'A central hub connecting to all parallel maze versions, enabling cross-dimensional resource sharing.', baseUpgradeCost: 800, basePower: 38, maxLevel: 10 },
  { id: 'qm_omniscience_spire', name: 'Omniscience Spire', description: 'The ultimate maze structure, a spire reaching across all dimensions granting complete quantum awareness.', baseUpgradeCost: 1000, basePower: 45, maxLevel: 10 },
];

// ---------------------------------------------------------------------------
// QM_ABILITIES: 22 quantum abilities
// ---------------------------------------------------------------------------

const QM_ABILITIES: readonly QMAbilityDef[] = [
  { id: 'qm_tunnel_shift', name: 'Tunnel Shift', description: 'Quantum tunnel through a single maze wall to reach an adjacent hidden corridor.', cooldown: 3, power: 10, energyCost: 15, unlockLevel: 1 },
  { id: 'qm_wave_glimpse', name: 'Wave Glimpse', description: 'See the wave function of nearby corridors, revealing hidden paths and upcoming obstacles.', cooldown: 2, power: 8, energyCost: 10, unlockLevel: 1 },
  { id: 'qm_prob_nudge', name: 'Probability Nudge', description: 'Nudge quantum probabilities slightly to favor finding rare particles in the current dimension.', cooldown: 4, power: 12, energyCost: 20, unlockLevel: 2 },
  { id: 'qm_entangle_pulse', name: 'Entangle Pulse', description: 'Send out an entanglement pulse that links all particles within range, boosting coherence.', cooldown: 5, power: 15, energyCost: 25, unlockLevel: 3 },
  { id: 'qm_collapse_burst', name: 'Collapse Burst', description: 'Force a mass wave function collapse across the current dimension, revealing all hidden corridors at once.', cooldown: 8, power: 25, energyCost: 40, unlockLevel: 4 },
  { id: 'qm_paradox_freeze', name: 'Paradox Freeze', description: 'Freeze all active paradoxes in the current dimension for a brief period, allowing safe passage.', cooldown: 10, power: 30, energyCost: 50, unlockLevel: 5 },
  { id: 'qm_dimension_blink', name: 'Dimension Blink', description: 'Instantly teleport to any entered dimension, leaving behind a quantum echo at your origin.', cooldown: 6, power: 20, energyCost: 30, unlockLevel: 6 },
  { id: 'qm_energy_siphon', name: 'Energy Siphon', description: 'Siphon quantum energy from the maze environment, restoring a portion of your energy reserves.', cooldown: 3, power: 10, energyCost: 5, unlockLevel: 7 },
  { id: 'qm_particle_lure', name: 'Particle Lure', description: 'Set a quantum lure that attracts nearby particles to your current location for easy collection.', cooldown: 7, power: 18, energyCost: 35, unlockLevel: 8 },
  { id: 'qm_observation_beam', name: 'Observation Beam', description: 'Project a beam of focused observation that collapses distant wave functions without moving.', cooldown: 4, power: 14, energyCost: 20, unlockLevel: 9 },
  { id: 'qm_coherence_surge', name: 'Coherence Surge', description: 'Surge your coherence level, temporarily boosting all observation and navigation abilities.', cooldown: 8, power: 22, energyCost: 45, unlockLevel: 10 },
  { id: 'qm_gravity_well', name: 'Gravity Well', description: 'Create a miniature gravity well that pulls distant maze paths toward you, revealing shortcuts.', cooldown: 6, power: 20, energyCost: 35, unlockLevel: 11 },
  { id: 'qm_time_dilate', name: 'Time Dilation', description: 'Slow local time around you, giving extra time to navigate complex maze sections and avoid paradoxes.', cooldown: 10, power: 28, energyCost: 50, unlockLevel: 12 },
  { id: 'qm_singularity_flare', name: 'Singularity Flare', description: 'Release a controlled flare from the Singularity Core that illuminates all paradox weak points.', cooldown: 12, power: 35, energyCost: 60, unlockLevel: 14 },
  { id: 'qm_multiverse_echo', name: 'Multiverse Echo', description: 'Listen to echoes from parallel maze versions, learning the optimal path through a difficult section.', cooldown: 8, power: 30, energyCost: 45, unlockLevel: 16 },
  { id: 'qm_reality_stitch', name: 'Reality Stitch', description: 'Stitch together two disconnected maze corridors, creating a permanent new passage between them.', cooldown: 15, power: 40, energyCost: 70, unlockLevel: 18 },
  { id: 'qm_quantum_clone', name: 'Quantum Clone', description: 'Create a quantum clone of yourself to explore a branching path simultaneously, then merge results.', cooldown: 10, power: 25, energyCost: 55, unlockLevel: 20 },
  { id: 'qm_paradox_absorb', name: 'Paradox Absorb', description: 'Absorb an active paradox into your energy reserves, converting its chaotic energy into power.', cooldown: 8, power: 35, energyCost: 40, unlockLevel: 22 },
  { id: 'qm_infinity_step', name: 'Infinity Step', description: 'Take a single step that traverses an infinite distance, teleporting to any point in the maze.', cooldown: 20, power: 50, energyCost: 100, unlockLevel: 24 },
  { id: 'qm_omni_observe', name: 'Omni Observe', description: 'Observe all eight dimensions simultaneously, collapsing wave functions across the entire maze.', cooldown: 15, power: 45, energyCost: 80, unlockLevel: 26 },
  { id: 'qm_dimension_weave', name: 'Dimension Weave', description: 'Weave together threads from multiple dimensions to create a custom maze path with optimal properties.', cooldown: 18, power: 55, energyCost: 90, unlockLevel: 28 },
  { id: 'qm_reality_rewrite', name: 'Reality Rewrite', description: 'Rewrite a small section of maze reality, changing walls to floors, traps to treasures, and paradoxes to peace.', cooldown: 25, power: 100, energyCost: 150, unlockLevel: 30 },
];

// ---------------------------------------------------------------------------
// QM_ACHIEVEMENTS: 18 achievements
// ---------------------------------------------------------------------------

const QM_ACHIEVEMENTS: readonly QMAchievementDef[] = [
  { id: 'qm_ach_first_observation', name: 'First Observation', description: 'Observe your first quantum particle in the maze.', condition: 'Observe 1 particle', reward: '+50 gold', target: 1 },
  { id: 'qm_ach_first_collapse', name: 'Wave Collapser', description: 'Collapse your first wave function to reveal a hidden path.', condition: 'Collapse 1 wave', reward: '+50 gold', target: 1 },
  { id: 'qm_ach_pathfinder', name: 'Pathfinder', description: 'Successfully navigate 5 maze paths of any difficulty.', condition: 'Navigate 5 paths', reward: '+200 gold', target: 5 },
  { id: 'qm_ach_paradox_solver', name: 'Paradox Solver', description: 'Resolve your first quantum paradox.', condition: 'Solve 1 paradox', reward: '+100 gold', target: 1 },
  { id: 'qm_ach_dimension_hopper', name: 'Dimension Hopper', description: 'Enter and explore all 8 quantum dimensions at least once.', condition: 'Enter 8 dimensions', reward: '+500 gold', target: 8 },
  { id: 'qm_ach_collector_10', name: 'Particle Collector', description: 'Collect at least 10 different quantum particle types.', condition: 'Collect 10 particles', reward: '+300 gold', target: 10 },
  { id: 'qm_ach_collector_25', name: 'Particle Hoarder', description: 'Collect at least 25 different quantum particle types.', condition: 'Collect 25 particles', reward: '+800 gold', target: 25 },
  { id: 'qm_ach_rare_find', name: 'Rare Discovery', description: 'Collect your first rare-tier particle from the maze.', condition: 'Find 1 rare particle', reward: '+200 gold', target: 1 },
  { id: 'qm_ach_epic_find', name: 'Epic Discovery', description: 'Collect your first epic-tier particle from the maze.', condition: 'Find 1 epic particle', reward: '+500 gold', target: 1 },
  { id: 'qm_ach_legendary_find', name: 'Legendary Discovery', description: 'Collect your first legendary-tier particle from the maze.', condition: 'Find 1 legendary particle', reward: '+2000 gold', target: 1 },
  { id: 'qm_ach_builder_5', name: 'Structure Builder', description: 'Build and upgrade 5 different maze structures.', condition: 'Build 5 structures', reward: '+400 gold', target: 5 },
  { id: 'qm_ach_builder_15', name: 'Master Architect', description: 'Build and upgrade 15 different maze structures.', condition: 'Build 15 structures', reward: '+1500 gold', target: 15 },
  { id: 'qm_ach_coherence_5', name: 'Coherent Mind', description: 'Reach coherence level 5 through sustained maze exploration.', condition: 'Reach coherence 5', reward: '+300 gold', target: 5 },
  { id: 'qm_ach_coherence_10', name: 'Perfect Clarity', description: 'Reach coherence level 10, the pinnacle of quantum awareness.', condition: 'Reach coherence 10', reward: '+1000 gold', target: 10 },
  { id: 'qm_ach_entangle_10', name: 'Quantum Entangler', description: 'Create 10 entangled particle pairs in the Entanglement Garden.', condition: 'Entangle 10 pairs', reward: '+400 gold', target: 10 },
  { id: 'qm_ach_paradox_master', name: 'Paradox Master', description: 'Resolve 5 quantum paradoxes of any severity level.', condition: 'Solve 5 paradoxes', reward: '+600 gold', target: 5 },
  { id: 'qm_ach_full_collection', name: 'Complete Collection', description: 'Collect all 35 quantum particle types across all dimensions.', condition: 'Collect 35 particles', reward: '+5000 gold', target: 35 },
  { id: 'qm_ach_multiverse_walker', name: 'Multiverse Walker', description: 'Reach maze level 25 and unlock the Multiverse Gate dimension.', condition: 'Reach level 25', reward: '+3000 gold', target: 25 },
];

// ---------------------------------------------------------------------------
// QM_TITLES: 8 titles (Quantum Observer -> Multiverse Architect)
// ---------------------------------------------------------------------------

const QM_TITLES: readonly QMTitleDef[] = [
  { id: 'qm_title_observer', name: 'Quantum Observer', requiredLevel: 1, requiredParticles: 0, requiredParadoxes: 0 },
  { id: 'qm_title_navigator', name: 'Quantum Navigator', requiredLevel: 5, requiredParticles: 5, requiredParadoxes: 1 },
  { id: 'qm_title_explorer', name: 'Dimension Explorer', requiredLevel: 10, requiredParticles: 12, requiredParadoxes: 3 },
  { id: 'qm_title_collapser', name: 'Wave Collapser', requiredLevel: 15, requiredParticles: 18, requiredParadoxes: 5 },
  { id: 'qm_title_weaver', name: 'Probability Weaver', requiredLevel: 20, requiredParticles: 24, requiredParadoxes: 7 },
  { id: 'qm_title_sage', name: 'Quantum Sage', requiredLevel: 25, requiredParticles: 28, requiredParadoxes: 9 },
  { id: 'qm_title_master', name: 'Paradox Master', requiredLevel: 30, requiredParticles: 32, requiredParadoxes: 11 },
  { id: 'qm_title_architect', name: 'Multiverse Architect', requiredLevel: 35, requiredParticles: 35, requiredParadoxes: 12 },
];

// ---------------------------------------------------------------------------
// QM_MAZE_PATHS: 15 maze paths
// ---------------------------------------------------------------------------

const QM_MAZE_PATHS: readonly QMMazePathDef[] = [
  { id: 'qm_path_gentle_prob', name: 'Gentle Probability Walk', description: 'A calm introductory path through the Probability Realm with minimal paradox risk.', difficulty: 'easy', length: 5, rewards: ['Alpha Photon', 'Beta Electron'], goldReward: 30, energyReward: 20 },
  { id: 'qm_path_superposition_intro', name: 'Superposition Introduction', description: 'Navigate the shimmering corridors of the Superposition Hall where walls phase in and out.', difficulty: 'easy', length: 6, rewards: ['Charm Up Quark', 'Weave Gluon'], goldReward: 40, energyReward: 25 },
  { id: 'qm_path_garden_stroll', name: 'Entanglement Garden Stroll', description: 'A peaceful walk through the Entanglement Garden, collecting paired particles along the way.', difficulty: 'easy', length: 7, rewards: ['Echo Neutrino', 'Dual Pion'], goldReward: 50, energyReward: 30 },
  { id: 'qm_path_wave_venture', name: 'Wave Chamber Venture', description: 'Step into the Wave Chamber where matter becomes waves and waves become matter.', difficulty: 'medium', length: 8, rewards: ['Flux Kaon', 'Crest W Boson'], goldReward: 80, energyReward: 50 },
  { id: 'qm_path_singularity_edge', name: 'Singularity Edge Path', description: 'Walk the razor edge of the Singularity Core where gravity bends perception itself.', difficulty: 'medium', length: 9, rewards: ['Null Z Boson', 'Residual Tau'], goldReward: 100, energyReward: 60 },
  { id: 'qm_path_observers_ascent', name: "Observer's Ascent", description: 'Climb the Observer Balcony through shifting realities that change based on where you look.', difficulty: 'medium', length: 10, rewards: ['Mirror Positron', 'Top Glance Quark'], goldReward: 120, energyReward: 70 },
  { id: 'qm_path_paradox_rings', name: 'Paradox Rings Challenge', description: 'Navigate through concentric rings of paradoxes that grow more severe toward the center.', difficulty: 'hard', length: 12, rewards: ['Higgs Shroud', 'Whisper Axion'], goldReward: 200, energyReward: 100 },
  { id: 'qm_path_uncertainty_descent', name: 'Uncertainty Descent', description: 'Descend into the Uncertainty Vault where knowing less means navigating more.', difficulty: 'hard', length: 13, rewards: ['Braid Anyon', 'Tachyon Bolt'], goldReward: 250, energyReward: 120 },
  { id: 'qm_path_ghost_haunt', name: 'Ghost Majorana Haunt', description: 'A haunted path through dimension boundaries where Majorana fermions stalk the corridors.', difficulty: 'hard', length: 14, rewards: ['Ghost Majorana', 'Sterile Drift'], goldReward: 300, energyReward: 140 },
  { id: 'qm_path_gravity_cascade', name: 'Gravity Cascade Run', description: 'A high-speed run through cascading gravity waves that reshape the maze in real time.', difficulty: 'hard', length: 15, rewards: ['Preon Seed', 'Graviton Pulse'], goldReward: 350, energyReward: 150 },
  { id: 'qm_path_dark_corridor', name: 'Dark Matter Corridor', description: 'Navigate a corridor made entirely of dark matter, invisible to normal observation.', difficulty: 'extreme', length: 18, rewards: ['Dark Phantom', 'Dark Glow'], goldReward: 500, energyReward: 200 },
  { id: 'qm_path_time_fracture', name: 'Time Fracture Gauntlet', description: 'A gauntlet where time flows backward, forward, and sideways through different maze sections.', difficulty: 'extreme', length: 20, rewards: ['Monopole Anchor', 'Time Crystal Shard'], goldReward: 600, energyReward: 250 },
  { id: 'qm_path_reality_maze', name: 'Reality Labyrinth', description: 'A labyrinth within the maze where reality itself becomes the puzzle to solve.', difficulty: 'extreme', length: 22, rewards: ['Bosenova Core', 'Condensate Dew'], goldReward: 700, energyReward: 300 },
  { id: 'qm_path_planck_dungeon', name: 'Planck Scale Dungeon', description: 'Descend to the Planck scale where the maze structure itself becomes quantum and uncertain.', difficulty: 'paradox', length: 25, rewards: ['Planck Grain', 'Superstring Resonance'], goldReward: 1000, energyReward: 500 },
  { id: 'qm_path_multiverse_gate_run', name: 'Multiverse Gate Final Run', description: 'The ultimate maze challenge: a single path spanning all eight dimensions to reach the Multiverse Gate.', difficulty: 'paradox', length: 30, rewards: ['Foam Bubble', 'Wormhole Thread', 'Infinity Loop'], goldReward: 2000, energyReward: 1000 },
];

// ---------------------------------------------------------------------------
// QM_PARADOXES: 12 quantum paradoxes
// ---------------------------------------------------------------------------

const QM_PARADOXES: readonly QMParadoxDef[] = [
  { id: 'qm_paradox_schrodinger', name: "Schrodinger's Path", description: 'A maze corridor that is simultaneously open and closed until you observe it. Observing it forces it open or closed at random.', severity: 'minor', resolutionReward: 50 },
  { id: 'qm_paradox_double_slit', name: 'Double Slit Dilemma', description: 'Two identical paths that produce different outcomes based on whether you watch yourself take them. Self-observation creates interference.', severity: 'minor', resolutionReward: 60 },
  { id: 'qm_paradox_entangle_trap', name: 'Entanglement Trap', description: 'Moving forward in this corridor simultaneously moves a wall in another dimension, trapping your entangled partner.', severity: 'moderate', resolutionReward: 100 },
  { id: 'qm_paradox_zeno_wall', name: "Zeno's Infinite Wall", description: 'A wall you can never fully reach because each step halves the remaining distance. An infinite series of finite movements.', severity: 'moderate', resolutionReward: 120 },
  { id: 'qm_paradox_grandfather', name: 'Grandfather Loop', description: 'A temporal loop where reaching the end sends you back to the beginning with knowledge that changes your starting position.', severity: 'severe', resolutionReward: 200 },
  { id: 'qm_paradox_wigner_friend', name: "Wigner's Friend Corridor", description: 'A corridor where you and a companion observe different realities simultaneously. Both are correct, yet mutually contradictory.', severity: 'severe', resolutionReward: 250 },
  { id: 'qm_paradox_measurement', name: 'Measurement Problem', description: 'A section of the maze that only has definite form when measured, but measuring it changes its form. The act of navigation alters the path.', severity: 'moderate', resolutionReward: 150 },
  { id: 'qm_paradox_boltzmann', name: 'Boltzmann Fluctuation', description: 'A region of the maze that randomly assembles itself from chaos, only to disassemble moments later. Navigate it during the brief window of order.', severity: 'severe', resolutionReward: 300 },
  { id: 'qm_paradox_many_worlds', name: 'Many Worlds Fork', description: 'A junction where every possible choice splits the maze into parallel versions. You must find the one version where all copies survive.', severity: 'catastrophic', resolutionReward: 500 },
  { id: 'qm_paradox_information', name: 'Information Paradox', description: 'A black hole section that absorbs all maze information. Paths that enter are theoretically recoverable but practically lost.', severity: 'catastrophic', resolutionReward: 600 },
  { id: 'qm_paradox_copenhagen', name: 'Copenhagen Crisis', description: 'The entire dimension enters a superposition of explored and unexplored. Every corridor becomes simultaneously known and unknown.', severity: 'catastrophic', resolutionReward: 700 },
  { id: 'qm_paradox_omega', name: 'Omega Point Paradox', description: 'The final paradox at the heart of the Multiverse Gate. Resolving it requires understanding that the maze, the navigator, and the paradox are one.', severity: 'reality-breaking', resolutionReward: 2000 },
];

// ---------------------------------------------------------------------------
// QM Helper Constants
// ---------------------------------------------------------------------------

const QM_INITIAL_GOLD = 100;
const QM_INITIAL_ENERGY = 50;
const QM_INITIAL_PROBABILITY = 50;
const QM_MAX_ENERGY = 500;
const QM_MAX_COHERENCE = 20;
const QM_EXP_PER_LEVEL = 100;
const QM_DIMENSION_COUNT = 8;
const QM_PARTICLE_COUNT = 35;
const QM_ARTIFACT_COUNT = 30;
const QM_STRUCTURE_COUNT = 25;
const QM_ABILITY_COUNT = 22;
const QM_ACHIEVEMENT_COUNT = 18;
const QM_TITLE_COUNT = 8;
const QM_MAZE_PATH_COUNT = 15;
const QM_PARADOX_COUNT = 12;
const QM_OBSERVATION_COST = 5;
const QM_COLLAPSE_COST = 10;
const QM_NAVIGATION_BASE_COST = 15;
const QM_ENTANGLE_COST = 20;
const QM_PROBABILITY_SHIFT_COST = 8;

// ---------------------------------------------------------------------------
// Default State Factory
// ---------------------------------------------------------------------------

function qmCreateDefaultState(): QMState {
  const dimensions: QMDimensionState[] = QM_DIMENSIONS.map((def) => ({
    id: def.id,
    entered: false,
    exploredDepth: 0,
    maxDepth: 10,
    particlesFound: 0,
    paradoxesSolved: 0,
  }));

  const collectedParticles: QMCollectedParticle[] = QM_PARTICLES.map((def) => ({
    particleId: def.id,
    quantity: 0,
    firstCollectedAt: null,
    entangledWith: null,
  }));

  const artifacts: QMArtifactState[] = QM_ARTIFACTS.map((def) => ({
    id: def.id,
    owned: false,
    quantity: 0,
    equipped: false,
  }));

  const structures: QMStructureState[] = QM_STRUCTURES.map((def) => ({
    id: def.id,
    level: 0,
    built: false,
    power: 0,
  }));

  const achievements: QMAchievementState[] = QM_ACHIEVEMENTS.map((def) => ({
    id: def.id,
    unlocked: false,
    unlockedAt: null,
    progress: 0,
  }));

  const abilities: QMAbilityState[] = QM_ABILITIES.map((def) => ({
    id: def.id,
    unlocked: false,
    currentCooldown: 0,
  }));

  const paradoxes: QMParadoxState[] = QM_PARADOXES.map((def) => ({
    id: def.id,
    active: false,
    solved: false,
    solvedAt: null,
    attempts: 0,
  }));

  return {
    dimensions,
    collectedParticles,
    artifacts,
    structures,
    achievements,
    abilities,
    paradoxes,
    currentTitle: 'qm_title_observer',
    mazeLevel: 1,
    mazeExp: 0,
    gold: QM_INITIAL_GOLD,
    quantumEnergy: QM_INITIAL_ENERGY,
    probability: QM_INITIAL_PROBABILITY,
    currentDimensionId: 'probability_realm',
    activeParadoxId: null,
    totalObserved: 0,
    totalCollapsed: 0,
    totalNavigated: 0,
    coherenceLevel: 1,
    entanglementCount: 0,
  };
}

// ---------------------------------------------------------------------------
// QM Rarity Helpers
// ---------------------------------------------------------------------------

function qmRarityWeight(rarity: QMRarity): number {
  if (rarity === 'common') return 40;
  if (rarity === 'uncommon') return 25;
  if (rarity === 'rare') return 15;
  if (rarity === 'epic') return 7;
  if (rarity === 'legendary') return 2;
  return 10;
}

function qmRarityGoldMultiplier(rarity: QMRarity): number {
  if (rarity === 'common') return 1;
  if (rarity === 'uncommon') return 2;
  if (rarity === 'rare') return 4;
  if (rarity === 'epic') return 8;
  if (rarity === 'legendary') return 20;
  return 1;
}

function qmDifficultyMultiplier(difficulty: QMDifficulty): number {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  if (difficulty === 'hard') return 4;
  if (difficulty === 'extreme') return 8;
  if (difficulty === 'paradox') return 16;
  return 1;
}

function qmSeverityMultiplier(severity: QMParadoxSeverity): number {
  if (severity === 'minor') return 1;
  if (severity === 'moderate') return 2;
  if (severity === 'severe') return 4;
  if (severity === 'catastrophic') return 8;
  if (severity === 'reality-breaking') return 16;
  return 1;
}

function qmPickRandomWeighted(particles: readonly QMParticleDef[]): QMParticleDef {
  const weighted: QMParticleDef[] = [];
  for (const p of particles) {
    const w = qmRarityWeight(p.rarity);
    for (let i = 0; i < w; i++) {
      weighted.push(p);
    }
  }
  const idx = Math.floor(Math.random() * weighted.length);
  return weighted[idx];
}

// ---------------------------------------------------------------------------
// The Hook: useQuantumMaze
// ---------------------------------------------------------------------------

export default function useQuantumMaze() {
  // ========================================================================
  // State
  // ========================================================================

  const [state, setState] = useState<QMState>(qmCreateDefaultState);
  const [initialized, setInitialized] = useState(false);

  const stateRef = useRef<QMState>(qmCreateDefaultState());

  // ========================================================================
  // Initialization
  // ========================================================================

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    setState(qmCreateDefaultState());
  }, [initialized]);

  // ========================================================================
  // Sync stateRef
  // ========================================================================

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ========================================================================
  // Getters (useMemo [state])
  // ========================================================================

  const qmGetDimensionList = useMemo(() => {
    return QM_DIMENSIONS.map((def) => {
      const dimState = state.dimensions.find((d) => d.id === def.id);
      return {
        ...def,
        entered: dimState?.entered ?? false,
        exploredDepth: dimState?.exploredDepth ?? 0,
        maxDepth: dimState?.maxDepth ?? 10,
        particlesFound: dimState?.particlesFound ?? 0,
        paradoxesSolved: dimState?.paradoxesSolved ?? 0,
        accessible: state.mazeLevel >= def.unlockLevel,
      };
    });
  }, [state]);

  const qmGetParticleCollection = useMemo(() => {
    return QM_PARTICLES.map((def) => {
      const col = state.collectedParticles.find((c) => c.particleId === def.id);
      return {
        ...def,
        collected: (col?.quantity ?? 0) > 0,
        quantity: col?.quantity ?? 0,
        firstCollectedAt: col?.firstCollectedAt ?? null,
        entangledWith: col?.entangledWith ?? null,
      };
    });
  }, [state]);

  const qmGetArtifactList = useMemo(() => {
    return QM_ARTIFACTS.map((def) => {
      const artState = state.artifacts.find((a) => a.id === def.id);
      return {
        ...def,
        owned: artState?.owned ?? false,
        quantity: artState?.quantity ?? 0,
        equipped: artState?.equipped ?? false,
      };
    });
  }, [state]);

  const qmGetStructureList = useMemo(() => {
    return QM_STRUCTURES.map((def) => {
      const stState = state.structures.find((s) => s.id === def.id);
      const level = stState?.level ?? 0;
      const built = stState?.built ?? false;
      const upgradeCost = built ? Math.round(def.baseUpgradeCost * Math.pow(1.5, level)) : def.baseUpgradeCost;
      return {
        ...def,
        level,
        built,
        power: stState?.power ?? 0,
        currentUpgradeCost: upgradeCost,
      };
    });
  }, [state]);

  const qmGetTotalPower = useMemo(() => {
    let total = 0;
    for (const s of state.structures) {
      if (s.built) {
        total += s.power;
      }
    }
    for (const a of state.artifacts) {
      if (a.equipped) {
        const def = QM_ARTIFACTS.find((d) => d.id === a.id);
        if (def) {
          total += def.power;
        }
      }
    }
    total += state.coherenceLevel * 2;
    return total;
  }, [state]);

  const qmGetCoherenceLevel = useMemo(() => {
    return {
      level: state.coherenceLevel,
      maxLevel: QM_MAX_COHERENCE,
      progressPercent: Math.round((state.coherenceLevel / QM_MAX_COHERENCE) * 100),
    };
  }, [state]);

  const qmGetProbabilityField = useMemo(() => {
    const structureBonus = state.structures.reduce((sum, s) => {
      if (!s.built) return sum;
      return sum + Math.floor(s.power * 0.1);
    }, 0);
    const coherenceBonus = Math.floor(state.coherenceLevel * 1.5);
    const artifactBonus = state.artifacts.reduce((sum, a) => {
      if (!a.equipped) return sum;
      const def = QM_ARTIFACTS.find((d) => d.id === a.id);
      if (!def) return sum;
      if (def.name.includes('Probability')) return sum + def.power;
      return sum;
    }, 0);
    return {
      current: Math.min(100, state.probability + structureBonus + coherenceBonus + artifactBonus),
      base: state.probability,
      structureBonus,
      coherenceBonus,
      artifactBonus,
    };
  }, [state]);

  const qmGetParadoxStatus = useMemo(() => {
    return QM_PARADOXES.map((def) => {
      const pState = state.paradoxes.find((p) => p.id === def.id);
      return {
        ...def,
        active: pState?.active ?? false,
        solved: pState?.solved ?? false,
        solvedAt: pState?.solvedAt ?? null,
        attempts: pState?.attempts ?? 0,
        isActive: state.activeParadoxId === def.id,
      };
    });
  }, [state]);

  const qmGetNextTitle = useMemo(() => {
    const currentIdx = QM_TITLES.findIndex((t) => t.id === state.currentTitle);
    if (currentIdx >= QM_TITLES.length - 1) return null;
    const next = QM_TITLES[currentIdx + 1];
    return {
      ...next,
      levelProgress: Math.min(100, Math.round((state.mazeLevel / next.requiredLevel) * 100)),
      particleProgress: Math.min(100, Math.round((state.totalObserved / next.requiredParticles) * 100)),
      paradoxProgress: Math.min(100, Math.round((qmGetParadoxStatus.filter((p) => p.solved).length / next.requiredParadoxes) * 100)),
    };
  }, [state, qmGetParadoxStatus]);

  const qmGetRaritySummary = useMemo(() => {
    const summary: Record<QMRarity, { total: number; collected: number }> = {
      common: { total: 0, collected: 0 },
      uncommon: { total: 0, collected: 0 },
      rare: { total: 0, collected: 0 },
      epic: { total: 0, collected: 0 },
      legendary: { total: 0, collected: 0 },
    };
    for (const def of QM_PARTICLES) {
      summary[def.rarity].total += 1;
    }
    for (const col of state.collectedParticles) {
      if (col.quantity > 0) {
        const def = QM_PARTICLES.find((p) => p.id === col.particleId);
        if (def) {
          summary[def.rarity].collected += 1;
        }
      }
    }
    return summary;
  }, [state]);

  const qmGetUnlockedAchievements = useMemo(() => {
    return state.achievements.filter((a) => a.unlocked);
  }, [state]);

  const qmGetTitleProgress = useMemo(() => {
    return QM_TITLES.map((def) => {
      const particlesMet = state.totalObserved >= def.requiredParticles;
      const paradoxesSolved = state.paradoxes.filter((p) => p.solved).length;
      const paradoxesMet = paradoxesSolved >= def.requiredParadoxes;
      const levelMet = state.mazeLevel >= def.requiredLevel;
      const isUnlocked = state.currentTitle === def.id;
      const canUnlock = particlesMet && paradoxesMet && levelMet;
      return {
        ...def,
        isUnlocked,
        canUnlock,
        particlesMet,
        paradoxesMet,
        levelMet,
      };
    });
  }, [state]);

  const qmGetEntangledCount = useMemo(() => {
    let count = 0;
    for (const col of state.collectedParticles) {
      if (col.entangledWith !== null) {
        count += 1;
      }
    }
    return {
      entangledPairs: Math.floor(count / 2),
      totalEntangled: count,
      entanglementCount: state.entanglementCount,
    };
  }, [state]);

  const qmGetMazePaths = useMemo(() => {
    return QM_MAZE_PATHS.map((def) => {
      const accessible = state.mazeLevel >= qmDifficultyMultiplier(def.difficulty) * 2;
      const energyCost = QM_NAVIGATION_BASE_COST * qmDifficultyMultiplier(def.difficulty);
      return {
        ...def,
        accessible,
        energyCost,
        goldRewardWithMultiplier: Math.round(def.goldReward * (1 + state.mazeLevel * 0.05)),
      };
    });
  }, [state]);

  const qmGetActiveDimension = useMemo(() => {
    const def = QM_DIMENSIONS.find((d) => d.id === state.currentDimensionId);
    const dimState = state.dimensions.find((d) => d.id === state.currentDimensionId);
    const activeParadox = state.activeParadoxId
      ? QM_PARADOXES.find((p) => p.id === state.activeParadoxId) ?? null
      : null;
    return {
      dimension: def ?? QM_DIMENSIONS[0],
      state: dimState,
      activeParadox,
      isActive: state.currentDimensionId !== null,
    };
  }, [state]);

  // ========================================================================
  // Actions (useCallback)
  // ========================================================================

  const qmAddExp = useCallback((amount: number) => {
    setState((prev) => {
      let newExp = prev.mazeExp + amount;
      let newLevel = prev.mazeLevel;
      let remaining = newExp;
      while (remaining >= QM_EXP_PER_LEVEL) {
        remaining -= QM_EXP_PER_LEVEL;
        newLevel += 1;
      }
      return {
        ...prev,
        mazeExp: remaining,
        mazeLevel: newLevel,
      };
    });
  }, []);

  const qmEnterDimension = useCallback((dimensionId: string): { success: boolean; message: string } => {
    const ref = stateRef.current;
    const def = QM_DIMENSIONS.find((d) => d.id === dimensionId);
    if (!def) {
      return { success: false, message: 'Dimension not found.' };
    }
    if (ref.mazeLevel < def.unlockLevel) {
      return { success: false, message: `Requires maze level ${def.unlockLevel}. Current: ${ref.mazeLevel}.` };
    }

    setState((prev) => ({
      ...prev,
      currentDimensionId: dimensionId,
      dimensions: prev.dimensions.map((d) => {
        if (d.id !== dimensionId) return d;
        return { ...d, entered: true };
      }),
    }));

    return { success: true, message: `Entered ${def.name}.` };
  }, []);

  const qmExitDimension = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentDimensionId: '',
      activeParadoxId: null,
    }));
    return { success: true, message: 'Exited current dimension.' };
  }, []);

  const qmObserveParticle = useCallback(() => {
    const ref = stateRef.current;
    if (ref.quantumEnergy < QM_OBSERVATION_COST) {
      return { success: false, particle: null, message: 'Insufficient quantum energy to observe.' };
    }

    setState((prev) => ({
      ...prev,
      quantumEnergy: prev.quantumEnergy - QM_OBSERVATION_COST,
      totalObserved: prev.totalObserved + 1,
    }));

    const probField = qmGetProbabilityField;
    const rareChance = Math.min(30, probField.base * 0.3 + probField.structureBonus + probField.coherenceBonus);

    const undiscovered = QM_PARTICLES.filter((def) => {
      const col = ref.collectedParticles.find((c) => c.particleId === def.id);
      return (col?.quantity ?? 0) === 0;
    });

    const pool = undiscovered.length > 0 ? undiscovered : QM_PARTICLES;
    const chosen = qmPickRandomWeighted(pool);

    const isRare = chosen.rarity !== 'common';
    const roll = Math.random() * 100;
    if (isRare && roll > rareChance) {
      return { success: true, particle: null, message: 'Observation complete but no rare particle appeared.' };
    }

    setState((prev) => ({
      ...prev,
      collectedParticles: prev.collectedParticles.map((c) => {
        if (c.particleId !== chosen.id) return c;
        return {
          ...c,
          quantity: c.quantity + 1,
          firstCollectedAt: c.firstCollectedAt ?? Date.now(),
        };
      }),
    }));

    qmAddExp(Math.round(qmRarityGoldMultiplier(chosen.rarity) * 2));
    const goldGain = Math.round(5 * qmRarityGoldMultiplier(chosen.rarity));
    setState((prev) => ({ ...prev, gold: prev.gold + goldGain }));

    return { success: true, particle: chosen, message: `Observed ${chosen.name} (${chosen.rarity})! +${goldGain} gold` };
  }, [qmAddExp, qmGetProbabilityField]);

  const qmCollapseWave = useCallback(() => {
    const ref = stateRef.current;
    if (ref.quantumEnergy < QM_COLLAPSE_COST) {
      return { success: false, message: 'Insufficient energy to collapse wave.', pathsRevealed: 0 };
    }

    setState((prev) => ({
      ...prev,
      quantumEnergy: prev.quantumEnergy - QM_COLLAPSE_COST,
      totalCollapsed: prev.totalCollapsed + 1,
    }));

    const basePaths = 1 + Math.floor(Math.random() * 3);
    const bonus = Math.floor(ref.coherenceLevel * 0.5);
    const pathsRevealed = basePaths + bonus;

    qmAddExp(pathsRevealed * 3);
    return { success: true, message: `Wave collapsed! ${pathsRevealed} paths revealed.`, pathsRevealed };
  }, [qmAddExp]);

  const qmNavigatePath = useCallback((pathId: string): { success: boolean; message: string; goldEarned: number; expEarned: number } => {
    const ref = stateRef.current;
    const def = QM_MAZE_PATHS.find((p) => p.id === pathId);
    if (!def) {
      return { success: false, message: 'Path not found.', goldEarned: 0, expEarned: 0 };
    }

    const energyCost = QM_NAVIGATION_BASE_COST * qmDifficultyMultiplier(def.difficulty);
    if (ref.quantumEnergy < energyCost) {
      return { success: false, message: `Need ${energyCost} energy. Have ${ref.quantumEnergy}.`, goldEarned: 0, expEarned: 0 };
    }

    const successChance = Math.min(95, 60 + ref.probability * 0.3 + ref.coherenceLevel * 2);
    const roll = Math.random() * 100;
    if (roll > successChance) {
      setState((prev) => ({
        ...prev,
        quantumEnergy: prev.quantumEnergy - Math.floor(energyCost * 0.5),
        totalNavigated: prev.totalNavigated + 1,
      }));
      return { success: false, message: `Navigation failed on ${def.name}. Partial energy consumed.`, goldEarned: 0, expEarned: 0 };
    }

    const goldEarned = Math.round(def.goldReward * (1 + ref.mazeLevel * 0.05));
    const expEarned = def.length * qmDifficultyMultiplier(def.difficulty) * 2;

    setState((prev) => ({
      ...prev,
      quantumEnergy: prev.quantumEnergy - energyCost,
      gold: prev.gold + goldEarned,
      totalNavigated: prev.totalNavigated + 1,
      dimensions: prev.dimensions.map((d) => {
        if (d.id !== prev.currentDimensionId) return d;
        return { ...d, exploredDepth: d.exploredDepth + 1 };
      }),
    }));

    qmAddExp(expEarned);

    const rewardNames = def.rewards.join(', ');
    return {
      success: true,
      message: `Navigated ${def.name}! Rewards: ${rewardNames}. +${goldEarned} gold`,
      goldEarned,
      expEarned,
    };
  }, [qmAddExp]);

  const qmSolveParadox = useCallback((paradoxId: string): { success: boolean; message: string; reward: number } => {
    const ref = stateRef.current;
    const def = QM_PARADOXES.find((p) => p.id === paradoxId);
    if (!def) {
      return { success: false, message: 'Paradox not found.', reward: 0 };
    }

    const pState = ref.paradoxes.find((p) => p.id === paradoxId);
    if (pState?.solved) {
      return { success: false, message: 'Paradox already solved.', reward: 0 };
    }

    const solveChance = Math.min(90, 40 + ref.coherenceLevel * 5 - qmSeverityMultiplier(def.severity) * 5);
    const roll = Math.random() * 100;
    const solved = roll <= solveChance;

    const goldReward = solved ? def.resolutionReward * qmSeverityMultiplier(def.severity) : Math.round(def.resolutionReward * 0.1);

    setState((prev) => ({
      ...prev,
      gold: prev.gold + goldReward,
      paradoxes: prev.paradoxes.map((p) => {
        if (p.id !== paradoxId) return p;
        return {
          ...p,
          attempts: p.attempts + 1,
          solved: solved ? true : p.solved,
          solvedAt: solved ? Date.now() : p.solvedAt,
          active: false,
        };
      }),
      activeParadoxId: solved ? null : prev.activeParadoxId,
      dimensions: prev.dimensions.map((d) => {
        if (d.id !== prev.currentDimensionId) return d;
        return { ...d, paradoxesSolved: d.paradoxesSolved + (solved ? 1 : 0) };
      }),
    }));

    if (solved) {
      qmAddExp(def.resolutionReward);
    }

    const msg = solved
      ? `Resolved "${def.name}"! +${goldReward} gold.`
      : `Failed to resolve "${def.name}". Attempt recorded. +${goldReward} consolation gold.`;
    return { success: solved, message: msg, reward: goldReward };
  }, [qmAddExp]);

  const qmBuildStructure = useCallback((structureId: string): { success: boolean; message: string; cost: number } => {
    const ref = stateRef.current;
    const def = QM_STRUCTURES.find((s) => s.id === structureId);
    if (!def) {
      return { success: false, message: 'Structure not found.', cost: 0 };
    }

    const stState = ref.structures.find((s) => s.id === structureId);
    if (stState?.built) {
      return { success: false, message: 'Structure already built.', cost: 0 };
    }

    if (ref.gold < def.baseUpgradeCost) {
      return { success: false, message: `Need ${def.baseUpgradeCost} gold. Have ${ref.gold}.`, cost: def.baseUpgradeCost };
    }

    setState((prev) => ({
      ...prev,
      gold: prev.gold - def.baseUpgradeCost,
      structures: prev.structures.map((s) => {
        if (s.id !== structureId) return s;
        return {
          ...s,
          built: true,
          level: 1,
          power: def.basePower,
        };
      }),
    }));

    return { success: true, message: `Built ${def.name}!`, cost: def.baseUpgradeCost };
  }, []);

  const qmUpgradeStructure = useCallback((structureId: string): { success: boolean; message: string; newLevel: number; cost: number } => {
    const ref = stateRef.current;
    const def = QM_STRUCTURES.find((s) => s.id === structureId);
    if (!def) {
      return { success: false, message: 'Structure not found.', newLevel: 0, cost: 0 };
    }

    const stState = ref.structures.find((s) => s.id === structureId);
    if (!stState?.built) {
      return { success: false, message: 'Structure not built yet.', newLevel: 0, cost: 0 };
    }
    if (stState.level >= def.maxLevel) {
      return { success: false, message: 'Structure already at max level.', newLevel: stState.level, cost: 0 };
    }

    const cost = Math.round(def.baseUpgradeCost * Math.pow(1.5, stState.level));
    if (ref.gold < cost) {
      return { success: false, message: `Need ${cost} gold. Have ${ref.gold}.`, newLevel: stState.level, cost };
    }

    const newLevel = stState.level + 1;
    const newPower = Math.round(def.basePower * (1 + (newLevel - 1) * 0.3));

    setState((prev) => ({
      ...prev,
      gold: prev.gold - cost,
      structures: prev.structures.map((s) => {
        if (s.id !== structureId) return s;
        return { ...s, level: newLevel, power: newPower };
      }),
    }));

    return { success: true, message: `Upgraded ${def.name} to level ${newLevel}!`, newLevel, cost };
  }, []);

  const qmCollectArtifact = useCallback((artifactId: string): { success: boolean; message: string } => {
    const ref = stateRef.current;
    const def = QM_ARTIFACTS.find((a) => a.id === artifactId);
    if (!def) {
      return { success: false, message: 'Artifact not found.' };
    }

    const artState = ref.artifacts.find((a) => a.id === artifactId);
    if (artState?.owned) {
      setState((prev) => ({
        ...prev,
        artifacts: prev.artifacts.map((a) => {
          if (a.id !== artifactId) return a;
          return { ...a, quantity: a.quantity + 1 };
        }),
      }));
      return { success: true, message: `Collected another ${def.name}.` };
    }

    setState((prev) => ({
      ...prev,
      artifacts: prev.artifacts.map((a) => {
        if (a.id !== artifactId) return a;
        return { ...a, owned: true, quantity: 1 };
      }),
    }));

    return { success: true, message: `Collected ${def.name} (${def.rarity})!` };
  }, []);

  const qmUseArtifact = useCallback((artifactId: string): { success: boolean; message: string; power: number } => {
    const ref = stateRef.current;
    const def = QM_ARTIFACTS.find((a) => a.id === artifactId);
    if (!def) {
      return { success: false, message: 'Artifact not found.', power: 0 };
    }

    const artState = ref.artifacts.find((a) => a.id === artifactId);
    if (!artState?.owned || artState.quantity <= 0) {
      return { success: false, message: 'Artifact not owned or out of stock.', power: 0 };
    }

    setState((prev) => ({
      ...prev,
      artifacts: prev.artifacts.map((a) => {
        if (a.id !== artifactId) return a;
        return { ...a, quantity: Math.max(0, a.quantity - 1) };
      }),
    }));

    return { success: true, message: `Used ${def.name}! Power: ${def.power}`, power: def.power };
  }, []);

  const qmEntangleParticles = useCallback((particleId1: string, particleId2: string): { success: boolean; message: string } => {
    const ref = stateRef.current;
    if (ref.quantumEnergy < QM_ENTANGLE_COST) {
      return { success: false, message: `Need ${QM_ENTANGLE_COST} energy. Have ${ref.quantumEnergy}.` };
    }

    const col1 = ref.collectedParticles.find((c) => c.particleId === particleId1);
    const col2 = ref.collectedParticles.find((c) => c.particleId === particleId2);
    if (!col1 || !col2 || col1.quantity <= 0 || col2.quantity <= 0) {
      return { success: false, message: 'Both particles must be collected.' };
    }
    if (col1.entangledWith !== null || col2.entangledWith !== null) {
      return { success: false, message: 'One or both particles already entangled.' };
    }

    setState((prev) => ({
      ...prev,
      quantumEnergy: prev.quantumEnergy - QM_ENTANGLE_COST,
      entanglementCount: prev.entanglementCount + 1,
      collectedParticles: prev.collectedParticles.map((c) => {
        if (c.particleId === particleId1) return { ...c, entangledWith: particleId2 };
        if (c.particleId === particleId2) return { ...c, entangledWith: particleId1 };
        return c;
      }),
    }));

    const def1 = QM_PARTICLES.find((p) => p.id === particleId1);
    const def2 = QM_PARTICLES.find((p) => p.id === particleId2);
    const name1 = def1?.name ?? particleId1;
    const name2 = def2?.name ?? particleId2;

    return { success: true, message: `Entangled ${name1} with ${name2}!` };
  }, []);

  const qmDisentangle = useCallback((particleId: string): { success: boolean; message: string } => {
    const ref = stateRef.current;
    const col = ref.collectedParticles.find((c) => c.particleId === particleId);
    if (!col || col.entangledWith === null) {
      return { success: false, message: 'Particle not entangled.' };
    }

    const otherId = col.entangledWith;

    setState((prev) => ({
      ...prev,
      entanglementCount: Math.max(0, prev.entanglementCount - 1),
      collectedParticles: prev.collectedParticles.map((c) => {
        if (c.particleId === particleId) return { ...c, entangledWith: null };
        if (c.particleId === otherId) return { ...c, entangledWith: null };
        return c;
      }),
    }));

    return { success: true, message: 'Particles disentangled.' };
  }, []);

  const qmIncreaseCoherence = useCallback((amount: number): { success: boolean; message: string; newLevel: number } => {
    setState((prev) => {
      const newLevel = Math.min(QM_MAX_COHERENCE, prev.coherenceLevel + amount);
      return { ...prev, coherenceLevel: newLevel };
    });
    const ref = stateRef.current;
    const newLevel = Math.min(QM_MAX_COHERENCE, ref.coherenceLevel + amount);
    return { success: true, message: `Coherence increased to ${newLevel}.`, newLevel };
  }, []);

  const qmAdjustProbability = useCallback((delta: number): { success: boolean; message: string; newProb: number } => {
    const ref = stateRef.current;
    if (ref.quantumEnergy < QM_PROBABILITY_SHIFT_COST) {
      return { success: false, message: `Need ${QM_PROBABILITY_SHIFT_COST} energy.`, newProb: ref.probability };
    }

    const newProb = Math.max(0, Math.min(100, ref.probability + delta));

    setState((prev) => ({
      ...prev,
      quantumEnergy: prev.quantumEnergy - QM_PROBABILITY_SHIFT_COST,
      probability: newProb,
    }));

    return { success: true, message: `Probability shifted to ${newProb}.`, newProb };
  }, []);

  const qmUnlockTitle = useCallback((titleId: string): { success: boolean; message: string } => {
    const ref = stateRef.current;
    const def = QM_TITLES.find((t) => t.id === titleId);
    if (!def) {
      return { success: false, message: 'Title not found.' };
    }

    if (ref.currentTitle === titleId) {
      return { success: false, message: 'Title already active.' };
    }

    const paradoxesSolved = ref.paradoxes.filter((p) => p.solved).length;
    if (ref.mazeLevel < def.requiredLevel) {
      return { success: false, message: `Requires level ${def.requiredLevel}.` };
    }
    if (ref.totalObserved < def.requiredParticles) {
      return { success: false, message: `Requires ${def.requiredParticles} particles observed.` };
    }
    if (paradoxesSolved < def.requiredParadoxes) {
      return { success: false, message: `Requires ${def.requiredParadoxes} paradoxes solved.` };
    }

    setState((prev) => ({
      ...prev,
      currentTitle: titleId,
    }));

    return { success: true, message: `Title unlocked: ${def.name}!` };
  }, []);

  const qmClaimAchievement = useCallback((achievementId: string): { success: boolean; message: string; reward: string } => {
    const ref = stateRef.current;
    const achState = ref.achievements.find((a) => a.id === achievementId);
    if (!achState) {
      return { success: false, message: 'Achievement not found.', reward: '' };
    }
    if (achState.unlocked) {
      return { success: false, message: 'Already claimed.', reward: '' };
    }

    const def = QM_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!def) {
      return { success: false, message: 'Achievement definition not found.', reward: '' };
    }

    let progress = 0;
    if (achievementId === 'qm_ach_first_observation') {
      progress = ref.totalObserved >= 1 ? 1 : 0;
    } else if (achievementId === 'qm_ach_first_collapse') {
      progress = ref.totalCollapsed >= 1 ? 1 : 0;
    } else if (achievementId === 'qm_ach_pathfinder') {
      progress = Math.min(def.target, ref.totalNavigated);
    } else if (achievementId === 'qm_ach_paradox_solver') {
      progress = ref.paradoxes.filter((p) => p.solved).length;
    } else if (achievementId === 'qm_ach_dimension_hopper') {
      progress = ref.dimensions.filter((d) => d.entered).length;
    } else if (achievementId === 'qm_ach_collector_10' || achievementId === 'qm_ach_collector_25') {
      progress = ref.collectedParticles.filter((c) => c.quantity > 0).length;
    } else if (achievementId === 'qm_ach_rare_find') {
      progress = ref.collectedParticles.some((c) => {
        if (c.quantity <= 0) return false;
        const pDef = QM_PARTICLES.find((p) => p.id === c.particleId);
        return pDef?.rarity === 'rare';
      }) ? 1 : 0;
    } else if (achievementId === 'qm_ach_epic_find') {
      progress = ref.collectedParticles.some((c) => {
        if (c.quantity <= 0) return false;
        const pDef = QM_PARTICLES.find((p) => p.id === c.particleId);
        return pDef?.rarity === 'epic';
      }) ? 1 : 0;
    } else if (achievementId === 'qm_ach_legendary_find') {
      progress = ref.collectedParticles.some((c) => {
        if (c.quantity <= 0) return false;
        const pDef = QM_PARTICLES.find((p) => p.id === c.particleId);
        return pDef?.rarity === 'legendary';
      }) ? 1 : 0;
    } else if (achievementId === 'qm_ach_builder_5' || achievementId === 'qm_ach_builder_15') {
      progress = ref.structures.filter((s) => s.built).length;
    } else if (achievementId === 'qm_ach_coherence_5' || achievementId === 'qm_ach_coherence_10') {
      progress = ref.coherenceLevel >= def.target ? 1 : 0;
    } else if (achievementId === 'qm_ach_entangle_10') {
      progress = ref.entanglementCount;
    } else if (achievementId === 'qm_ach_paradox_master') {
      progress = ref.paradoxes.filter((p) => p.solved).length;
    } else if (achievementId === 'qm_ach_full_collection') {
      progress = ref.collectedParticles.filter((c) => c.quantity > 0).length;
    } else if (achievementId === 'qm_ach_multiverse_walker') {
      progress = ref.mazeLevel >= 25 ? 1 : 0;
    }

    if (progress < def.target) {
      setState((prev) => ({
        ...prev,
        achievements: prev.achievements.map((a) => {
          if (a.id !== achievementId) return a;
          return { ...a, progress };
        }),
      }));
      return { success: false, message: `Progress: ${progress}/${def.target}.`, reward: '' };
    }

    const goldReward = parseInt(def.reward.replace(/[^0-9]/g, ''), 10) || 0;

    setState((prev) => ({
      ...prev,
      gold: prev.gold + goldReward,
      achievements: prev.achievements.map((a) => {
        if (a.id !== achievementId) return a;
        return { ...a, unlocked: true, unlockedAt: Date.now(), progress };
      }),
    }));

    return { success: true, message: `Achievement unlocked: ${def.name}!`, reward: def.reward };
  }, []);

  const qmBuyArtifact = useCallback((artifactId: string): { success: boolean; message: string } => {
    const ref = stateRef.current;
    const def = QM_ARTIFACTS.find((a) => a.id === artifactId);
    if (!def) {
      return { success: false, message: 'Artifact not found.' };
    }

    if (ref.gold < def.goldCost) {
      return { success: false, message: `Need ${def.goldCost} gold. Have ${ref.gold}.` };
    }

    setState((prev) => ({
      ...prev,
      gold: prev.gold - def.goldCost,
      artifacts: prev.artifacts.map((a) => {
        if (a.id !== artifactId) return a;
        return { ...a, owned: true, quantity: a.quantity + 1 };
      }),
    }));

    return { success: true, message: `Purchased ${def.name} for ${def.goldCost} gold!` };
  }, []);

  const qmTradeArtifact = useCallback((giveId: string, receiveId: string): { success: boolean; message: string } => {
    const ref = stateRef.current;
    const giveState = ref.artifacts.find((a) => a.id === giveId);
    const receiveDef = QM_ARTIFACTS.find((a) => a.id === receiveId);

    if (!giveState || !giveState.owned || giveState.quantity <= 0) {
      return { success: false, message: 'Cannot trade: artifact not owned.' };
    }
    if (!receiveDef) {
      return { success: false, message: 'Target artifact not found.' };
    }

    const giveDef = QM_ARTIFACTS.find((a) => a.id === giveId);
    const priceDiff = receiveDef.goldCost - (giveDef?.goldCost ?? 0);
    if (priceDiff > 0 && ref.gold < priceDiff) {
      return { success: false, message: `Need ${priceDiff} additional gold for the trade.` };
    }

    setState((prev) => ({
      ...prev,
      gold: prev.gold - Math.max(0, priceDiff),
      artifacts: prev.artifacts.map((a) => {
        if (a.id === giveId) return { ...a, quantity: Math.max(0, a.quantity - 1), owned: a.quantity > 1 };
        if (a.id === receiveId) return { ...a, owned: true, quantity: a.quantity + 1 };
        return a;
      }),
    }));

    const giveName = giveDef?.name ?? giveId;
    const receiveName = receiveDef.name;
    return { success: true, message: `Traded ${giveName} for ${receiveName}!` };
  }, []);

  const qmAccelerateExperiment = useCallback(() => {
    const ref = stateRef.current;
    if (ref.quantumEnergy < 20) {
      return { success: false, message: 'Need at least 20 energy to accelerate.', energyGained: 0, expGained: 0 };
    }

    const energySpent = 20;
    const energyGained = 30 + Math.floor(Math.random() * 20) + ref.coherenceLevel * 2;
    const expGained = 10 + Math.floor(Math.random() * 10) + ref.mazeLevel;

    setState((prev) => ({
      ...prev,
      quantumEnergy: prev.quantumEnergy - energySpent,
    }));

    qmAddExp(expGained);

    const netEnergy = energyGained - energySpent;

    return {
      success: true,
      message: `Experiment accelerated! Net energy: +${netEnergy}, +${expGained} exp.`,
      energyGained: netEnergy,
      expGained,
    };
  }, [qmAddExp]);

  const qmGenerateParticle = useCallback(() => {
    const ref = stateRef.current;
    if (ref.quantumEnergy < 15) {
      return { success: false, particle: null, message: 'Need 15 energy to generate a particle.' };
    }

    setState((prev) => ({
      ...prev,
      quantumEnergy: prev.quantumEnergy - 15,
    }));

    const chosen = qmPickRandomWeighted(QM_PARTICLES);

    setState((prev) => ({
      ...prev,
      collectedParticles: prev.collectedParticles.map((c) => {
        if (c.particleId !== chosen.id) return c;
        return {
          ...c,
          quantity: c.quantity + 1,
          firstCollectedAt: c.firstCollectedAt ?? Date.now(),
        };
      }),
      totalObserved: prev.totalObserved + 1,
    }));

    qmAddExp(Math.round(qmRarityGoldMultiplier(chosen.rarity) * 2));

    return { success: true, particle: chosen, message: `Generated ${chosen.name} (${chosen.rarity})!` };
  }, [qmAddExp]);

  const qmResetDimension = useCallback((dimensionId: string): { success: boolean; message: string } => {
    const def = QM_DIMENSIONS.find((d) => d.id === dimensionId);
    if (!def) {
      return { success: false, message: 'Dimension not found.' };
    }

    setState((prev) => ({
      ...prev,
      dimensions: prev.dimensions.map((d) => {
        if (d.id !== dimensionId) return d;
        return {
          ...d,
          exploredDepth: 0,
          particlesFound: 0,
          paradoxesSolved: 0,
          entered: false,
        };
      }),
    }));

    return { success: true, message: `Reset ${def.name} to initial state.` };
  }, []);

  // ========================================================================
  // qmAPI Return Object
  // ========================================================================

  const qmAPI = useMemo(() => ({
    // Color Constants
    QM_COLOR_QUANTUM,
    QM_COLOR_WAVE,
    QM_COLOR_PARTICLE,
    QM_COLOR_ENTANGLE,
    QM_COLOR_PARADOX,
    QM_COLOR_SINGULARITY,
    QM_COLOR_MULTIVERSE,
    QM_COLOR_OBSERVER,

    // Data Constants
    QM_DIMENSIONS,
    QM_PARTICLES,
    QM_ARTIFACTS,
    QM_STRUCTURES,
    QM_ABILITIES,
    QM_ACHIEVEMENTS,
    QM_TITLES,
    QM_MAZE_PATHS,
    QM_PARADOXES,

    // Inner Constants
    QM_INITIAL_GOLD,
    QM_INITIAL_ENERGY,
    QM_MAX_ENERGY,
    QM_MAX_COHERENCE,
    QM_EXP_PER_LEVEL,
    QM_OBSERVATION_COST,
    QM_COLLAPSE_COST,
    QM_NAVIGATION_BASE_COST,
    QM_ENTANGLE_COST,
    QM_DIMENSION_COUNT,
    QM_PARTICLE_COUNT,
    QM_ARTIFACT_COUNT,
    QM_STRUCTURE_COUNT,
    QM_ABILITY_COUNT,
    QM_ACHIEVEMENT_COUNT,
    QM_TITLE_COUNT,
    QM_MAZE_PATH_COUNT,
    QM_PARADOX_COUNT,

    // State
    state,

    // Getters
    qmGetDimensionList,
    qmGetParticleCollection,
    qmGetArtifactList,
    qmGetStructureList,
    qmGetTotalPower,
    qmGetCoherenceLevel,
    qmGetProbabilityField,
    qmGetParadoxStatus,
    qmGetNextTitle,
    qmGetRaritySummary,
    qmGetUnlockedAchievements,
    qmGetTitleProgress,
    qmGetEntangledCount,
    qmGetMazePaths,
    qmGetActiveDimension,

    // Actions
    qmEnterDimension,
    qmExitDimension,
    qmObserveParticle,
    qmCollapseWave,
    qmNavigatePath,
    qmSolveParadox,
    qmBuildStructure,
    qmUpgradeStructure,
    qmCollectArtifact,
    qmUseArtifact,
    qmEntangleParticles,
    qmDisentangle,
    qmIncreaseCoherence,
    qmAdjustProbability,
    qmUnlockTitle,
    qmClaimAchievement,
    qmBuyArtifact,
    qmTradeArtifact,
    qmAccelerateExperiment,
    qmGenerateParticle,
    qmResetDimension,
    qmAddExp,
  }), [
    state,
    qmGetDimensionList,
    qmGetParticleCollection,
    qmGetArtifactList,
    qmGetStructureList,
    qmGetTotalPower,
    qmGetCoherenceLevel,
    qmGetProbabilityField,
    qmGetParadoxStatus,
    qmGetNextTitle,
    qmGetRaritySummary,
    qmGetUnlockedAchievements,
    qmGetTitleProgress,
    qmGetEntangledCount,
    qmGetMazePaths,
    qmGetActiveDimension,
    qmEnterDimension,
    qmExitDimension,
    qmObserveParticle,
    qmCollapseWave,
    qmNavigatePath,
    qmSolveParadox,
    qmBuildStructure,
    qmUpgradeStructure,
    qmCollectArtifact,
    qmUseArtifact,
    qmEntangleParticles,
    qmDisentangle,
    qmIncreaseCoherence,
    qmAdjustProbability,
    qmUnlockTitle,
    qmClaimAchievement,
    qmBuyArtifact,
    qmTradeArtifact,
    qmAccelerateExperiment,
    qmGenerateParticle,
    qmResetDimension,
    qmAddExp,
  ]);

  return qmAPI;
}
