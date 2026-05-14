// ============================================================================
// Quantum Lab Wire Module — Word Snake Game
// Quantum physics research laboratory: discover particles, run experiments,
// unlock subatomic mysteries, and ascend from Intern to Omniscient.
// All state and logic lives inside `useQuantumLab()`.
// ============================================================================

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type ParticleCategory =
  | 'boson'
  | 'fermion'
  | 'lepton'
  | 'quark'
  | 'exotic'
  | 'hypothetical'
  | 'dark'
  | 'condensed_matter';

type ChamberStatus = 'idle' | 'running' | 'cooldown' | 'offline';

type AbilityType =
  | 'active'
  | 'passive'
  | 'toggle'
  | 'burst';

interface Particle {
  id: string;
  name: string;
  symbol: string;
  category: ParticleCategory;
  rarity: Rarity;
  description: string;
  spin: string;
  mass: string;
  charge: string;
  discovered: boolean;
  discoveredAt: number | null;
  quantity: number;
  energyValue: number;
}

interface Chamber {
  id: string;
  name: string;
  description: string;
  status: ChamberStatus;
  energyCost: number;
  discoveryBonus: number;
  researchBonus: number;
  cooldownTicks: number;
  maxCooldown: number;
  level: number;
  maxLevel: number;
  experimentsCompleted: number;
  icon: string;
}

interface Equipment {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  owned: boolean;
  equipped: boolean;
  bonusEnergy: number;
  bonusDiscovery: number;
  bonusResearch: number;
  durability: number;
  maxDurability: number;
  level: number;
  icon: string;
}

interface Facility {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  upgradeCost: number;
  energyOutput: number;
  researchOutput: number;
  creditOutput: number;
  unlocked: boolean;
  icon: string;
}

interface Ability {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  cooldown: number;
  currentCooldown: number;
  energyCost: number;
  researchCost: number;
  unlocked: boolean;
  unlockLevel: number;
  power: number;
  duration: number;
  usesLeft: number;
  maxUses: number;
  icon: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: number | null;
  progress: number;
  target: number;
  rewardCredits: number;
  rewardResearch: number;
  icon: string;
}

interface DailyExperiment {
  dateKey: string;
  title: string;
  description: string;
  targetChamber: string;
  targetParticles: number;
  rewardBonus: number;
  completed: boolean;
  completedAt: number | null;
}

interface ExperimentResult {
  success: boolean;
  particleFound: Particle | null;
  creditsEarned: number;
  researchEarned: number;
  energyUsed: number;
  message: string;
}

interface QuantumEvent {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  effectType: 'bonus_energy' | 'bonus_credits' | 'bonus_research' | 'bonus_discovery' | 'random_particle' | 'facility_boost' | 'ability_reset';
  magnitude: number;
}

interface Stats {
  totalExperiments: number;
  totalParticlesDiscovered: number;
  totalEnergyUsed: number;
  totalCreditsEarned: number;
  totalResearchEarned: number;
  totalEntanglements: number;
  totalWaveCollapses: number;
  totalQuantumComputers: number;
  totalAbilitiesActivated: number;
  legendaryParticlesFound: number;
  epicParticlesFound: number;
  experimentsByChamber: Record<string, number>;
  createdAt: number;
  lastUpdated: number;
}

// ---------------------------------------------------------------------------
// Title Definitions (8 titles)
// ---------------------------------------------------------------------------

const TITLES: readonly string[] = [
  'Quantum Intern',
  'Junior Researcher',
  'Particle Physicist',
  'Senior Theorist',
  'Quantum Engineer',
  'Lab Director',
  'Quantum Architect',
  'Quantum Omniscient',
] as const;

// ---------------------------------------------------------------------------
// Color Theme Constants
// ---------------------------------------------------------------------------

const QL_COLORS = {
  neonTeal: '#00E5FF',
  cyan: '#00BCD4',
  white: '#FFFFFF',
  quantumBlue: '#2979FF',
  deepPurple: '#1A0033',
} as const;

// ---------------------------------------------------------------------------
// Particle Definitions (35 particles, 5 rarity tiers)
// ---------------------------------------------------------------------------

interface ParticleDef {
  id: string;
  name: string;
  symbol: string;
  category: ParticleCategory;
  rarity: Rarity;
  description: string;
  spin: string;
  mass: string;
  charge: string;
  energyValue: number;
}

const PARTICLE_DEFS: readonly ParticleDef[] = [
  // ---- Common (10) ----
  { id: 'photon', name: 'Photon', symbol: 'γ', category: 'boson', rarity: 'common', description: 'The quantum of electromagnetic radiation. Photons are massless gauge bosons that mediate the electromagnetic force, traveling at the speed of light and exhibiting both wave and particle properties.', spin: '1', mass: '0 eV/c²', charge: '0', energyValue: 5 },
  { id: 'electron', name: 'Electron', symbol: 'e⁻', category: 'lepton', rarity: 'common', description: 'A fundamental lepton with negative charge that orbits atomic nuclei. Electrons are responsible for chemical bonding, electricity, and thermal conductivity in materials.', spin: '½', mass: '0.511 MeV/c²', charge: '-1', energyValue: 5 },
  { id: 'proton', name: 'Proton', symbol: 'p', category: 'fermion', rarity: 'common', description: 'A composite particle made of two up quarks and one down quark, bound by gluons. Protons carry positive charge and form the nucleus of every hydrogen atom.', spin: '½', mass: '938.3 MeV/c²', charge: '+1', energyValue: 5 },
  { id: 'neutron', name: 'Neutron', symbol: 'n', category: 'fermion', rarity: 'common', description: 'An electrically neutral composite particle composed of one up quark and two down quarks. Free neutrons decay with a half-life of about 10 minutes via beta decay.', spin: '½', mass: '939.6 MeV/c²', charge: '0', energyValue: 6 },
  { id: 'muon', name: 'Muon', symbol: 'μ', category: 'lepton', rarity: 'common', description: 'A second-generation lepton similar to the electron but 207 times heavier. Muons are produced by cosmic rays and have a mean lifetime of 2.2 microseconds.', spin: '½', mass: '105.7 MeV/c²', charge: '-1', energyValue: 6 },
  { id: 'pion', name: 'Pion', symbol: 'π', category: 'boson', rarity: 'common', description: 'The lightest meson, composed of a quark-antiquark pair. Pions are the primary carriers of the strong nuclear force between nucleons at intermediate range.', spin: '0', mass: '139.6 MeV/c²', charge: '±1, 0', energyValue: 6 },
  { id: 'kaon', name: 'Kaon', symbol: 'K', category: 'boson', rarity: 'common', description: 'A meson containing a strange quark that played a crucial role in the discovery of CP violation. Kaons exist in four charged and neutral states.', spin: '0', mass: '493.7 MeV/c²', charge: '±1, 0', energyValue: 7 },
  { id: 'gluon', name: 'Gluon', symbol: 'g', category: 'boson', rarity: 'common', description: 'The gauge boson that mediates the strong force between quarks. Gluons carry color charge and interact with each other, leading to the unique property of asymptotic freedom.', spin: '1', mass: '0 eV/c²', charge: '0', energyValue: 7 },
  { id: 'w_boson', name: 'W Boson', symbol: 'W±', category: 'boson', rarity: 'common', description: 'A charged weak gauge boson responsible for beta decay and other weak nuclear processes. The W boson was discovered at CERN in 1983.', spin: '1', mass: '80.4 GeV/c²', charge: '±1', energyValue: 8 },
  { id: 'z_boson', name: 'Z Boson', symbol: 'Z⁰', category: 'boson', rarity: 'common', description: 'The neutral weak gauge boson that mediates neutral current weak interactions. Its discovery confirmed the electroweak unification theory.', spin: '1', mass: '91.2 GeV/c²', charge: '0', energyValue: 8 },

  // ---- Uncommon (8) ----
  { id: 'neutrino', name: 'Neutrino', symbol: 'ν', category: 'lepton', rarity: 'uncommon', description: 'A nearly massless neutral lepton that rarely interacts with matter. Neutrinos come in three flavors and undergo oscillations between them as they travel.', spin: '½', mass: '~0.1 eV/c²', charge: '0', energyValue: 12 },
  { id: 'positron', name: 'Positron', symbol: 'e⁺', category: 'lepton', rarity: 'uncommon', description: 'The antimatter counterpart of the electron. When a positron encounters an electron, they annihilate, producing two gamma-ray photons via matter-antimatter annihilation.', spin: '½', mass: '0.511 MeV/c²', charge: '+1', energyValue: 12 },
  { id: 'up_quark', name: 'Up Quark', symbol: 'u', category: 'quark', rarity: 'uncommon', description: 'The lightest quark with charge +2/3. Up quarks combine with down quarks to form protons and neutrons, making them the most fundamental building blocks of visible matter.', spin: '½', mass: '2.2 MeV/c²', charge: '+⅔', energyValue: 10 },
  { id: 'down_quark', name: 'Down Quark', symbol: 'd', category: 'quark', rarity: 'uncommon', description: 'The second lightest quark with charge -1/3. Two down quarks and one up quark form a neutron, while one down and two ups form a proton.', spin: '½', mass: '4.7 MeV/c²', charge: '-⅓', energyValue: 10 },
  { id: 'strange_quark', name: 'Strange Quark', symbol: 's', category: 'quark', rarity: 'uncommon', description: 'A heavier quark carrying strangeness quantum number. Strange quarks are produced in high-energy collisions and decay via the weak force.', spin: '½', mass: '96 MeV/c²', charge: '-⅓', energyValue: 13 },
  { id: 'charm_quark', name: 'Charm Quark', symbol: 'c', category: 'quark', rarity: 'uncommon', description: 'A third-generation quark predicted by the GIM mechanism and discovered in 1974 simultaneously at SLAC and Brookhaven, sparking the November Revolution in particle physics.', spin: '½', mass: '1.28 GeV/c²', charge: '+⅔', energyValue: 14 },
  { id: 'tau_lepton', name: 'Tau Lepton', symbol: 'τ', category: 'lepton', rarity: 'uncommon', description: 'The heaviest known lepton at 3477 times the electron mass. The tau decays rapidly and was instrumental in establishing that only three generations of neutrinos exist.', spin: '½', mass: '1.777 GeV/c²', charge: '-1', energyValue: 14 },
  { id: 'antiproton', name: 'Antiproton', symbol: 'p̄', category: 'exotic', rarity: 'uncommon', description: 'The antimatter counterpart of the proton, discovered by Emilio Segrè and Owen Chamberlain in 1955. Antiprotons are used in antiproton-proton collision experiments at CERN.', spin: '½', mass: '938.3 MeV/c²', charge: '-1', energyValue: 15 },

  // ---- Rare (8) ----
  { id: 'bottom_quark', name: 'Bottom Quark', symbol: 'b', category: 'quark', rarity: 'rare', description: 'A heavy quark discovered at Fermilab in 1977. Bottom quarks are essential for studying CP violation through B meson oscillations and decays.', spin: '½', mass: '4.18 GeV/c²', charge: '-⅓', energyValue: 22 },
  { id: 'top_quark', name: 'Top Quark', symbol: 't', category: 'quark', rarity: 'rare', description: 'The heaviest known elementary particle, discovered at Fermilab in 1995. The top quark decays before it can hadronize, providing a unique probe of bare quark properties.', spin: '½', mass: '173 GeV/c²', charge: '+⅔', energyValue: 28 },
  { id: 'higgs_boson', name: 'Higgs Boson', symbol: 'H', category: 'boson', rarity: 'rare', description: 'The scalar boson responsible for giving other particles mass through the Higgs mechanism. Discovered at CERN in 2012, confirming the last missing piece of the Standard Model.', spin: '0', mass: '125 GeV/c²', charge: '0', energyValue: 30 },
  { id: 'axion', name: 'Axion', symbol: 'a', category: 'hypothetical', rarity: 'rare', description: 'A hypothetical light particle proposed to solve the strong CP problem. If axions exist, they could constitute a significant fraction of cold dark matter in the universe.', spin: '0', mass: '~μeV', charge: '0', energyValue: 20 },
  { id: 'tachyon', name: 'Tachyon', symbol: 'tₐ', category: 'hypothetical', rarity: 'rare', description: 'A hypothetical particle that always travels faster than light. If tachyons existed, they would violate causality and could enable backward-in-time communication.', spin: '1', mass: 'imaginary', charge: '0', energyValue: 25 },
  { id: 'magnetic_monopole', name: 'Magnetic Monopole', symbol: 'm', category: 'hypothetical', rarity: 'rare', description: 'A hypothetical particle carrying an isolated magnetic charge. Dirac showed that the existence of even one monopole would explain electric charge quantization.', spin: '0', mass: '>10¹⁶ GeV/c²', charge: '1g', energyValue: 26 },
  { id: 'preon', name: 'Preon', symbol: 'pre', category: 'hypothetical', rarity: 'rare', description: 'A hypothetical point particle proposed as a substructure of quarks and leptons. While no experimental evidence exists, preon models could explain the particle mass hierarchy.', spin: '½', mass: '~TeV/c²', charge: '±⅓, ±⅔', energyValue: 24 },
  { id: 'sterile_neutrino', name: 'Sterile Neutrino', symbol: 'νₛ', category: 'hypothetical', rarity: 'rare', description: 'A hypothetical neutrino species that interacts only via gravity. Sterile neutrinos are candidates for warm dark matter and could explain reactor neutrino anomalies.', spin: '½', mass: '~keV–GeV/c²', charge: '0', energyValue: 23 },

  // ---- Epic (5) ----
  { id: 'majorana_fermion', name: 'Majorana Fermion', symbol: 'M', category: 'exotic', rarity: 'epic', description: 'A particle that is its own antiparticle, first proposed by Ettore Majorana. Majorana fermions could serve as qubits in topological quantum computers with inherent error correction.', spin: '½', mass: 'variable', charge: '0', energyValue: 45 },
  { id: 'wimp', name: 'WIMP', symbol: 'χ', category: 'dark', rarity: 'epic', description: 'Weakly Interacting Massive Particle — a leading dark matter candidate. WIMPs with masses in the GeV–TeV range could explain galaxy rotation curves and structure formation.', spin: '½', mass: '~100 GeV/c²', charge: '0', energyValue: 48 },
  { id: 'dark_photon', name: 'Dark Photon', symbol: 'A\'', category: 'dark', rarity: 'epic', description: 'A hypothetical force carrier of a dark sector, analogous to the photon in electromagnetism. Dark photons could mediate interactions between dark matter and ordinary matter.', spin: '1', mass: '~MeV–GeV/c²', charge: '0', energyValue: 50 },
  { id: 'anyon', name: 'Anyon', symbol: 'aₙ', category: 'condensed_matter', rarity: 'epic', description: 'An exotic quasiparticle existing only in two-dimensional systems that exhibits fractional statistics between bosons and fermions. Anyons are crucial for topological quantum computing.', spin: 'fractional', mass: 'effective', charge: 'fractional', energyValue: 52 },
  { id: 'graviton', name: 'Graviton', symbol: 'G', category: 'hypothetical', rarity: 'epic', description: 'The hypothetical quantum of gravitational radiation predicted by quantum field theory. If gravitons exist, they must be massless spin-2 bosons, but they have never been observed.', spin: '2', mass: '0 eV/c²', charge: '0', energyValue: 55 },

  // ---- Legendary (4) ----
  { id: 'dark_matter_wisp', name: 'Dark Matter Wisp', symbol: 'DM☆', category: 'dark', rarity: 'legendary', description: 'A rare concentrated form of dark matter that exhibits coherent quantum behavior. Dark Matter Wisps radiate subtle gravitational waves and can warp local spacetime.', spin: 'unknown', mass: '~10⁻¹⁰ eV/c²', charge: '0', energyValue: 100 },
  { id: 'quantum_foam_particle', name: 'Quantum Foam Particle', symbol: 'QF☆', category: 'exotic', rarity: 'legendary', description: 'An ephemeral particle extracted from the Planck-scale foam of spacetime itself. These particles flicker in and out of existence at the smallest possible scales of reality.', spin: '½', mass: 'Planck mass', charge: 'variable', energyValue: 120 },
  { id: 'superstring_excitation', name: 'Superstring Excitation', symbol: 'SS☆', category: 'hypothetical', rarity: 'legendary', description: 'A resonant vibration mode of a fundamental superstring in extra dimensions. Each excitation corresponds to a different particle, and this one resonates at a frequency matching the unified theory.', spin: '2', mass: '~10¹⁹ GeV/c²', charge: '0', energyValue: 150 },
  { id: 'planck_particle', name: 'Planck Particle', symbol: 'Pp☆', category: 'exotic', rarity: 'legendary', description: 'A hypothetical particle whose Compton wavelength equals its Schwarzschild radius — a micro black hole at the Planck scale. It represents the limit where quantum mechanics and gravity merge.', spin: 'any', mass: '2.18×10⁻⁸ kg', charge: '±√α', energyValue: 200 },
];

// ---------------------------------------------------------------------------
// Chamber Definitions (8 experiment chambers)
// ---------------------------------------------------------------------------

interface ChamberDef {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  discoveryBonus: number;
  researchBonus: number;
  maxCooldown: number;
  maxLevel: number;
  icon: string;
}

const CHAMBER_DEFS: readonly ChamberDef[] = [
  { id: 'particle_accelerator', name: 'Particle Accelerator', description: 'A massive circular accelerator that smashes particles together at near-light speeds, producing showers of exotic debris for analysis.', energyCost: 20, discoveryBonus: 5, researchBonus: 10, maxCooldown: 3, maxLevel: 10, icon: '⚛️' },
  { id: 'quantum_entanglement_lab', name: 'Quantum Entanglement Lab', description: 'Specialized equipment for creating and studying entangled particle pairs separated by vast distances, testing quantum non-locality.', energyCost: 25, discoveryBonus: 8, researchBonus: 15, maxCooldown: 4, maxLevel: 10, icon: '🔗' },
  { id: 'wave_function_chamber', name: 'Wave Function Chamber', description: 'An isolated vacuum chamber where quantum superposition states can be maintained and observed without decoherence for extended periods.', energyCost: 30, discoveryBonus: 10, researchBonus: 18, maxCooldown: 5, maxLevel: 10, icon: '🌊' },
  { id: 'superposition_room', name: 'Superposition Room', description: 'A room-sized quantum isolation chamber capable of placing macroscopic objects into quantum superposition for brief, mind-bending moments.', energyCost: 35, discoveryBonus: 12, researchBonus: 22, maxCooldown: 5, maxLevel: 10, icon: '🌀' },
  { id: 'string_theory_lab', name: 'String Theory Lab', description: 'A theoretical and computational lab dedicated to simulating string vibrations in 11 dimensions, probing the fundamental nature of reality.', energyCost: 45, discoveryBonus: 15, researchBonus: 28, maxCooldown: 6, maxLevel: 10, icon: '🎵' },
  { id: 'dark_energy_observatory', name: 'Dark Energy Observatory', description: 'A deep-space observation deck monitoring cosmic expansion and dark energy fluctuations, searching for signals from the accelerating universe.', energyCost: 50, discoveryBonus: 18, researchBonus: 32, maxCooldown: 7, maxLevel: 10, icon: '🔭' },
  { id: 'quantum_computing_bay', name: 'Quantum Computing Bay', description: 'A cryogenic facility housing superconducting qubits and trapped-ion processors, pushing the boundaries of quantum computation.', energyCost: 60, discoveryBonus: 20, researchBonus: 38, maxCooldown: 8, maxLevel: 10, icon: '💻' },
  { id: 'antimatter_containment', name: 'Antimatter Containment', description: 'The most dangerous chamber in the lab, equipped with Penning traps and magnetic bottles to safely study and contain antimatter samples.', energyCost: 70, discoveryBonus: 25, researchBonus: 45, maxCooldown: 9, maxLevel: 10, icon: '☢️' },
];

// ---------------------------------------------------------------------------
// Equipment Definitions (30 lab equipment/tools)
// ---------------------------------------------------------------------------

interface EquipmentDef {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  bonusEnergy: number;
  bonusDiscovery: number;
  bonusResearch: number;
  maxDurability: number;
  icon: string;
}

const EQUIPMENT_DEFS: readonly EquipmentDef[] = [
  { id: 'particle_detector', name: 'Particle Detector', description: 'A multi-layer detector array that identifies particles by their mass, charge, and energy signatures through calorimetry and tracking.', rarity: 'common', bonusEnergy: 2, bonusDiscovery: 3, bonusResearch: 1, maxDurability: 100, icon: '📡' },
  { id: 'hadron_collider_module', name: 'Hadron Collider Module', description: 'A compact collider module capable of accelerating protons to TeV energies for on-demand particle production experiments.', rarity: 'common', bonusEnergy: 3, bonusDiscovery: 4, bonusResearch: 2, maxDurability: 120, icon: '🔄' },
  { id: 'quantum_microscope', name: 'Quantum Microscope', description: 'An advanced scanning tunneling microscope capable of imaging individual atoms and observing quantum tunneling events in real time.', rarity: 'common', bonusEnergy: 1, bonusDiscovery: 5, bonusResearch: 3, maxDurability: 80, icon: '🔬' },
  { id: 'entanglement_generator', name: 'Entanglement Generator', description: 'A crystal-based device that produces entangled photon pairs through spontaneous parametric down-conversion at high rates.', rarity: 'common', bonusEnergy: 2, bonusDiscovery: 3, bonusResearch: 4, maxDurability: 90, icon: '💎' },
  { id: 'superconducting_magnet', name: 'Superconducting Magnet', description: 'A powerful electromagnet using niobium-titanium coils cooled to 4.2K, generating fields up to 10 Tesla for particle beam steering.', rarity: 'uncommon', bonusEnergy: 5, bonusDiscovery: 4, bonusResearch: 3, maxDurability: 150, icon: '🧲' },
  { id: 'cryogenic_cooler', name: 'Cryogenic Cooler', description: 'A dilution refrigerator achieving temperatures below 10 millikelvin, essential for maintaining quantum coherence in superconducting circuits.', rarity: 'common', bonusEnergy: 4, bonusDiscovery: 2, bonusResearch: 5, maxDurability: 100, icon: '❄️' },
  { id: 'laser_interferometer', name: 'Laser Interferometer', description: 'A precision laser system measuring distance changes at the attometer scale, capable of detecting gravitational wave signatures.', rarity: 'uncommon', bonusEnergy: 3, bonusDiscovery: 6, bonusResearch: 5, maxDurability: 130, icon: '🔦' },
  { id: 'spectral_analyzer', name: 'Spectral Analyzer', description: 'An advanced spectrometer that decomposes particle emission spectra into component frequencies for precise identification.', rarity: 'common', bonusEnergy: 2, bonusDiscovery: 4, bonusResearch: 3, maxDurability: 90, icon: '🌈' },
  { id: 'quantum_randomizer', name: 'Quantum Randomizer', description: 'A device using quantum noise to generate true random numbers, essential for probability manipulation experiments.', rarity: 'uncommon', bonusEnergy: 3, bonusDiscovery: 5, bonusResearch: 4, maxDurability: 100, icon: '🎲' },
  { id: 'neutrino_detector', name: 'Neutrino Detector', description: 'A massive tank of ultra-pure water surrounded by photomultiplier tubes, detecting Cherenkov radiation from passing neutrinos.', rarity: 'uncommon', bonusEnergy: 4, bonusDiscovery: 7, bonusResearch: 4, maxDurability: 160, icon: '💧' },
  { id: 'dark_matter_sensor', name: 'Dark Matter Sensor', description: 'An ultrasensitive detector using liquid xenon to search for rare nuclear recoils caused by dark matter particle interactions.', rarity: 'rare', bonusEnergy: 6, bonusDiscovery: 10, bonusResearch: 6, maxDurability: 200, icon: '🌑' },
  { id: 'plasma_confinement_unit', name: 'Plasma Confinement Unit', description: 'A tokamak-derived magnetic confinement system that sustains high-temperature plasma for particle creation experiments.', rarity: 'uncommon', bonusEnergy: 5, bonusDiscovery: 5, bonusResearch: 6, maxDurability: 140, icon: '🌀' },
  { id: 'quantum_teleporter', name: 'Quantum Teleporter', description: 'An experimental device that transfers quantum states between distant nodes using entanglement and classical communication channels.', rarity: 'epic', bonusEnergy: 8, bonusDiscovery: 8, bonusResearch: 10, maxDurability: 180, icon: '✈️' },
  { id: 'quark_gun', name: 'Quark Gun', description: 'A precision particle beam weaponized for targeted quark liberation experiments, capable of isolating individual quark flavors.', rarity: 'rare', bonusEnergy: 7, bonusDiscovery: 9, bonusResearch: 5, maxDurability: 170, icon: '🔫' },
  { id: 'wave_collapser', name: 'Wave Collapser', description: 'A device that forces wave function collapse through controlled measurement, revealing the definite quantum state of superposed systems.', rarity: 'rare', bonusEnergy: 5, bonusDiscovery: 8, bonusResearch: 8, maxDurability: 150, icon: '🎯' },
  { id: 'probability_engine', name: 'Probability Engine', description: 'A quantum circuit that manipulates probability amplitudes to favor desired experimental outcomes within quantum mechanical constraints.', rarity: 'epic', bonusEnergy: 10, bonusDiscovery: 12, bonusResearch: 9, maxDurability: 200, icon: '⚙️' },
  { id: 'vacuum_fluctuator', name: 'Vacuum Fluctuator', description: 'An instrument that amplifies quantum vacuum fluctuations to temporarily extract virtual particles into observable reality.', rarity: 'epic', bonusEnergy: 8, bonusDiscovery: 15, bonusResearch: 8, maxDurability: 190, icon: '🌪️' },
  { id: 'chroniton_emitter', name: 'Chroniton Emitter', description: 'A speculative device that generates chroniton particles, allowing brief glimpses into quantum temporal dynamics.', rarity: 'legendary', bonusEnergy: 12, bonusDiscovery: 18, bonusResearch: 12, maxDurability: 250, icon: '⏰' },
  { id: 'dimensional_prism', name: 'Dimensional Prism', description: 'A crystalline structure theorized to interact with compactified extra dimensions, channeling energy from higher-dimensional spaces.', rarity: 'legendary', bonusEnergy: 15, bonusDiscovery: 20, bonusResearch: 15, maxDurability: 300, icon: '🔮' },
  { id: 'muon_spectrometer', name: 'Muon Spectrometer', description: 'A precision tracking device that measures muon momentum and charge by analyzing curved trajectories in a magnetic field.', rarity: 'uncommon', bonusEnergy: 4, bonusDiscovery: 6, bonusResearch: 5, maxDurability: 120, icon: '📐' },
  { id: 'electron_scanner', name: 'Electron Scanner', description: 'A high-resolution electron beam scanner used for surface analysis and electron diffraction studies of quantum materials.', rarity: 'common', bonusEnergy: 2, bonusDiscovery: 3, bonusResearch: 4, maxDurability: 80, icon: '📡' },
  { id: 'photon_collector', name: 'Photon Collector', description: 'A parabolic mirror array that collects and focuses photons across a wide spectral range for quantum optics experiments.', rarity: 'common', bonusEnergy: 3, bonusDiscovery: 4, bonusResearch: 2, maxDurability: 85, icon: '☀️' },
  { id: 'gravitational_lens', name: 'Gravitational Lens', description: 'An artificial gravitational lens using controlled mass distributions to bend light and study spacetime curvature effects.', rarity: 'rare', bonusEnergy: 7, bonusDiscovery: 10, bonusResearch: 7, maxDurability: 180, icon: '🔭' },
  { id: 'quantum_dot_array', name: 'Quantum Dot Array', description: 'A semiconductor chip with engineered quantum dots that trap individual electrons for quantum information processing.', rarity: 'rare', bonusEnergy: 5, bonusDiscovery: 8, bonusResearch: 9, maxDurability: 140, icon: '🔴' },
  { id: 'spin_polarizer', name: 'Spin Polarizer', description: 'A device that aligns particle spins along a chosen axis, essential for spintronics and quantum entanglement experiments.', rarity: 'uncommon', bonusEnergy: 3, bonusDiscovery: 5, bonusResearch: 6, maxDurability: 110, icon: '🧭' },
  { id: 'bosenova_trigger', name: 'Bosenova Trigger', description: 'A device that reverses the sign of the scattering length in a Bose-Einstein condensate, triggering a dramatic bosenova implosion.', rarity: 'epic', bonusEnergy: 9, bonusDiscovery: 12, bonusResearch: 11, maxDurability: 210, icon: '💥' },
  { id: 'time_crystal_forge', name: 'Time Crystal Forge', description: 'A laboratory setup that creates and sustains discrete time crystals — phases of matter with periodic structure in time.', rarity: 'epic', bonusEnergy: 8, bonusDiscovery: 14, bonusResearch: 12, maxDurability: 220, icon: '💎' },
  { id: 'wormhole_stabilizer', name: 'Wormhole Stabilizer', description: 'A theoretical device using exotic matter with negative energy density to hold open a traversable wormhole throat.', rarity: 'legendary', bonusEnergy: 15, bonusDiscovery: 22, bonusResearch: 18, maxDurability: 280, icon: '🕳️' },
  { id: 'planck_scale_probe', name: 'Planck Scale Probe', description: 'The ultimate sensing instrument designed to measure phenomena at the Planck length scale where spacetime itself becomes quantized.', rarity: 'legendary', bonusEnergy: 18, bonusDiscovery: 25, bonusResearch: 20, maxDurability: 350, icon: '📏' },
  { id: 'quantum_memory_core', name: 'Quantum Memory Core', description: 'A high-fidelity quantum memory system using rare-earth-doped crystals to store qubit states for extended periods.', rarity: 'rare', bonusEnergy: 4, bonusDiscovery: 6, bonusResearch: 10, maxDurability: 160, icon: '🧠' },
];

// ---------------------------------------------------------------------------
// Facility Definitions (25 research stations/facilities, upgradeable to L10)
// ---------------------------------------------------------------------------

interface FacilityDef {
  id: string;
  name: string;
  description: string;
  baseUpgradeCost: number;
  baseEnergyOutput: number;
  baseResearchOutput: number;
  baseCreditOutput: number;
  unlockLevel: number;
  maxLevel: number;
  icon: string;
}

const FACILITY_DEFS: readonly FacilityDef[] = [
  { id: 'data_center', name: 'Data Center', description: 'High-performance computing cluster for processing experimental data and running particle simulations at massive scale.', baseUpgradeCost: 100, baseEnergyOutput: 2, baseResearchOutput: 3, baseCreditOutput: 5, unlockLevel: 1, maxLevel: 10, icon: '🖥️' },
  { id: 'theory_workshop', name: 'Theory Workshop', description: 'A collaborative workspace where theoretical physicists develop mathematical models and predict new particle properties.', baseUpgradeCost: 120, baseEnergyOutput: 1, baseResearchOutput: 5, baseCreditOutput: 3, unlockLevel: 1, maxLevel: 10, icon: '📝' },
  { id: 'calibration_room', name: 'Calibration Room', description: 'Precision calibration facility ensuring all detectors and instruments maintain optimal accuracy and sensitivity.', baseUpgradeCost: 90, baseEnergyOutput: 3, baseResearchOutput: 2, baseCreditOutput: 4, unlockLevel: 2, maxLevel: 10, icon: '🎯' },
  { id: 'cryogenic_bay', name: 'Cryogenic Bay', description: 'Liquid helium and nitrogen storage and distribution systems maintaining ultra-low temperatures for superconducting equipment.', baseUpgradeCost: 130, baseEnergyOutput: 4, baseResearchOutput: 2, baseCreditOutput: 3, unlockLevel: 3, maxLevel: 10, icon: '🧊' },
  { id: 'power_core', name: 'Power Core', description: 'The central energy generation facility that converts quantum vacuum energy into usable power for all lab operations.', baseUpgradeCost: 150, baseEnergyOutput: 8, baseResearchOutput: 1, baseCreditOutput: 2, unlockLevel: 3, maxLevel: 10, icon: '⚡' },
  { id: 'materials_lab', name: 'Materials Lab', description: 'Synthesizes exotic quantum materials including topological insulators, superconductors, and metamaterials for experiments.', baseUpgradeCost: 140, baseEnergyOutput: 2, baseResearchOutput: 6, baseCreditOutput: 4, unlockLevel: 4, maxLevel: 10, icon: '🧪' },
  { id: 'detector_array', name: 'Detector Array', description: 'A vast array of particle detectors covering multiple detection technologies — calorimetry, tracking, and Cherenkov radiation.', baseUpgradeCost: 160, baseEnergyOutput: 3, baseResearchOutput: 4, baseCreditOutput: 6, unlockLevel: 5, maxLevel: 10, icon: '📡' },
  { id: 'beam_line', name: 'Beam Line', description: 'A precision-guided particle beam channel directing accelerated particles to multiple experimental stations simultaneously.', baseUpgradeCost: 180, baseEnergyOutput: 5, baseResearchOutput: 3, baseCreditOutput: 5, unlockLevel: 5, maxLevel: 10, icon: '💨' },
  { id: 'vacuum_chamber', name: 'Vacuum Chamber', description: 'An ultra-high vacuum environment maintaining pressures below 10⁻¹² torr for particle collision experiments.', baseUpgradeCost: 110, baseEnergyOutput: 2, baseResearchOutput: 4, baseCreditOutput: 3, unlockLevel: 6, maxLevel: 10, icon: '🌑' },
  { id: 'control_room', name: 'Control Room', description: 'The central command hub with real-time monitoring dashboards and automated experiment orchestration systems.', baseUpgradeCost: 170, baseEnergyOutput: 3, baseResearchOutput: 5, baseCreditOutput: 5, unlockLevel: 6, maxLevel: 10, icon: '🎛️' },
  { id: 'isotope_synthesis', name: 'Isotope Synthesis', description: 'Produces rare and unstable isotopes on demand for tracer experiments and particle decay chain studies.', baseUpgradeCost: 200, baseEnergyOutput: 4, baseResearchOutput: 7, baseCreditOutput: 4, unlockLevel: 7, maxLevel: 10, icon: '⚗️' },
  { id: 'radiation_shielding', name: 'Radiation Shielding', description: 'Multi-layered shielding infrastructure protecting personnel and sensitive equipment from harmful radiation exposure.', baseUpgradeCost: 130, baseEnergyOutput: 6, baseResearchOutput: 1, baseCreditOutput: 3, unlockLevel: 8, maxLevel: 10, icon: '🛡️' },
  { id: 'quantum_sensor_network', name: 'Quantum Sensor Network', description: 'A distributed network of entangled quantum sensors providing real-time measurements across the entire facility.', baseUpgradeCost: 220, baseEnergyOutput: 3, baseResearchOutput: 8, baseCreditOutput: 6, unlockLevel: 9, maxLevel: 10, icon: '🕸️' },
  { id: 'fusion_reactor', name: 'Fusion Reactor', description: 'A compact tokamak providing abundant clean energy through deuterium-tritium fusion, powering high-energy experiments.', baseUpgradeCost: 250, baseEnergyOutput: 12, baseResearchOutput: 3, baseCreditOutput: 5, unlockLevel: 10, maxLevel: 10, icon: '☀️' },
  { id: 'dark_sector_lab', name: 'Dark Sector Lab', description: 'A specially shielded laboratory dedicated to searching for dark sector particles and hidden valley phenomena.', baseUpgradeCost: 280, baseEnergyOutput: 4, baseResearchOutput: 10, baseCreditOutput: 7, unlockLevel: 11, maxLevel: 10, icon: '🌑' },
  { id: 'antimatter_factory', name: 'Antimatter Factory', description: 'A containment facility producing and storing small quantities of antimatter for controlled matter-antimatter experiments.', baseUpgradeCost: 300, baseEnergyOutput: 6, baseResearchOutput: 8, baseCreditOutput: 8, unlockLevel: 12, maxLevel: 10, icon: '☢️' },
  { id: 'topological_lab', name: 'Topological Lab', description: 'Studies topological phases of matter and their exotic surface states with potential applications in fault-tolerant quantum computing.', baseUpgradeCost: 260, baseEnergyOutput: 3, baseResearchOutput: 9, baseCreditOutput: 6, unlockLevel: 13, maxLevel: 10, icon: '🌀' },
  { id: 'quantum_communication_hub', name: 'Quantum Communication Hub', description: 'An entanglement-based communication center enabling secure quantum key distribution and quantum networking protocols.', baseUpgradeCost: 240, baseEnergyOutput: 2, baseResearchOutput: 7, baseCreditOutput: 10, unlockLevel: 14, maxLevel: 10, icon: '📡' },
  { id: 'multiverse_simulator', name: 'Multiverse Simulator', description: 'A computational lab running many-worlds interpretation simulations to explore branching quantum probability spaces.', baseUpgradeCost: 320, baseEnergyOutput: 5, baseResearchOutput: 12, baseCreditOutput: 6, unlockLevel: 15, maxLevel: 10, icon: '🌌' },
  { id: 'neutrino_observatory', name: 'Neutrino Observatory', description: 'A deep underground facility detecting neutrinos from the Sun, supernovae, and cosmic ray interactions in Earth\'s atmosphere.', baseUpgradeCost: 200, baseEnergyOutput: 3, baseResearchOutput: 8, baseCreditOutput: 5, unlockLevel: 16, maxLevel: 10, icon: '💧' },
  { id: 'gravitational_lab', name: 'Gravitational Lab', description: 'Measures and manipulates gravitational effects at quantum scales, probing the interface between general relativity and quantum mechanics.', baseUpgradeCost: 350, baseEnergyOutput: 5, baseResearchOutput: 11, baseCreditOutput: 7, unlockLevel: 17, maxLevel: 10, icon: '🪐' },
  { id: 'quantum_bio_lab', name: 'Quantum Bio Lab', description: 'Investigates quantum effects in biological systems including photosynthesis, enzyme catalysis, and avian magnetoreception.', baseUpgradeCost: 230, baseEnergyOutput: 2, baseResearchOutput: 9, baseCreditOutput: 8, unlockLevel: 18, maxLevel: 10, icon: '🧬' },
  { id: 'entanglement_farm', name: 'Entanglement Farm', description: 'A massive array of entanglement sources producing and maintaining thousands of entangled particle pairs simultaneously.', baseUpgradeCost: 280, baseEnergyOutput: 4, baseResearchOutput: 10, baseCreditOutput: 9, unlockLevel: 19, maxLevel: 10, icon: '🔗' },
  { id: 'planck_institute', name: 'Planck Institute', description: 'The most advanced research facility probing physics at the Planck scale, where all four fundamental forces are expected to unify.', baseUpgradeCost: 400, baseEnergyOutput: 8, baseResearchOutput: 15, baseCreditOutput: 10, unlockLevel: 20, maxLevel: 10, icon: '🏛️' },
  { id: 'omniscience_core', name: 'Omniscience Core', description: 'A legendary facility that integrates all quantum knowledge, granting near-complete understanding of subatomic reality.', baseUpgradeCost: 500, baseEnergyOutput: 10, baseResearchOutput: 20, baseCreditOutput: 15, unlockLevel: 25, maxLevel: 10, icon: '👁️' },
];

// ---------------------------------------------------------------------------
// Ability Definitions (22 quantum abilities)
// ---------------------------------------------------------------------------

interface AbilityDef {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  cooldown: number;
  energyCost: number;
  researchCost: number;
  unlockLevel: number;
  power: number;
  duration: number;
  maxUses: number;
  icon: string;
}

const ABILITY_DEFS: readonly AbilityDef[] = [
  { id: 'quantum_tunnel', name: 'Quantum Tunnel', description: 'Tunnel through energy barriers, instantly completing an experiment without consuming energy for one run.', type: 'active', cooldown: 5, energyCost: 0, researchCost: 50, unlockLevel: 2, power: 1, duration: 0, maxUses: 3, icon: '🚇' },
  { id: 'wave_collapse', name: 'Wave Collapse', description: 'Force a wave function collapse, guaranteeing a particle discovery from the current experiment.', type: 'active', cooldown: 8, energyCost: 30, researchCost: 100, unlockLevel: 3, power: 1, duration: 0, maxUses: 2, icon: '🎯' },
  { id: 'entangle', name: 'Entangle', description: 'Create an entangled pair, doubling research output for the next 3 experiments.', type: 'toggle', cooldown: 6, energyCost: 15, researchCost: 80, unlockLevel: 4, power: 2, duration: 3, maxUses: 0, icon: '🔗' },
  { id: 'superposition_shift', name: 'Superposition Shift', description: 'Enter a superposition state where the next experiment produces results from two chambers simultaneously.', type: 'active', cooldown: 10, energyCost: 40, researchCost: 150, unlockLevel: 5, power: 2, duration: 0, maxUses: 2, icon: '🌀' },
  { id: 'probability_manipulation', name: 'Probability Manipulation', description: 'Rewrite probability amplitudes to increase the chance of discovering rare and legendary particles for 5 experiments.', type: 'toggle', cooldown: 12, energyCost: 50, researchCost: 200, unlockLevel: 6, power: 3, duration: 5, maxUses: 0, icon: '🎲' },
  { id: 'quantum_lock', name: 'Quantum Lock', description: 'Lock the current quantum state, preventing any energy loss for the next 4 experiments.', type: 'toggle', cooldown: 7, energyCost: 20, researchCost: 120, unlockLevel: 7, power: 1, duration: 4, maxUses: 0, icon: '🔒' },
  { id: 'heisenberg_boost', name: 'Heisenberg Boost', description: 'Temporarily violate the uncertainty principle, gaining maximum precision in both energy and discovery for 2 experiments.', type: 'burst', cooldown: 15, energyCost: 60, researchCost: 300, unlockLevel: 8, power: 5, duration: 2, maxUses: 1, icon: '📐' },
  { id: 'quantum_compression', name: 'Quantum Compression', description: 'Compress quantum states to fit more particle data, increasing lab storage capacity and research throughput temporarily.', type: 'active', cooldown: 8, energyCost: 25, researchCost: 150, unlockLevel: 9, power: 2, duration: 0, maxUses: 3, icon: '📦' },
  { id: 'dark_energy_surge', name: 'Dark Energy Surge', description: 'Channel dark energy to restore all energy to maximum and provide a 50% boost to all outputs for 3 experiments.', type: 'burst', cooldown: 20, energyCost: 0, researchCost: 500, unlockLevel: 10, power: 4, duration: 3, maxUses: 1, icon: '🌑' },
  { id: 'quantum_eraser', name: 'Quantum Eraser', description: 'Erase the which-path information from a past experiment, retroactively changing its outcome to a better result.', type: 'active', cooldown: 14, energyCost: 35, researchCost: 250, unlockLevel: 11, power: 3, duration: 0, maxUses: 2, icon: '🧹' },
  { id: 'schrodinger_cat', name: 'Schrödinger\'s Cat', description: 'Place the lab in a superposition of success and failure — when the box is opened, both outcomes are applied positively.', type: 'active', cooldown: 16, energyCost: 45, researchCost: 350, unlockLevel: 12, power: 4, duration: 0, maxUses: 1, icon: '🐱' },
  { id: 'quantum_teleportation', name: 'Quantum Teleportation', description: 'Teleport resources from one facility to another, redistributing energy, credits, and research optimally.', type: 'active', cooldown: 10, energyCost: 20, researchCost: 200, unlockLevel: 13, power: 2, duration: 0, maxUses: 0, icon: '✈️' },
  { id: 'spin_mirror', name: 'Spin Mirror', description: 'Mirror the spin states of all particles, converting common discoveries into higher-rarity equivalents for one experiment.', type: 'burst', cooldown: 18, energyCost: 55, researchCost: 400, unlockLevel: 14, power: 4, duration: 1, maxUses: 1, icon: '🪞' },
  { id: 'quantum_decoherence_shield', name: 'Decoherence Shield', description: 'Erect a decoherence shield protecting active experiments from random failures for the next 6 experiments.', type: 'toggle', cooldown: 12, energyCost: 30, researchCost: 280, unlockLevel: 15, power: 3, duration: 6, maxUses: 0, icon: '🛡️' },
  { id: 'casimir_effect', name: 'Casimir Effect', description: 'Exploit the Casimir effect to generate free energy from the quantum vacuum, instantly restoring 50% of maximum energy.', type: 'active', cooldown: 8, energyCost: 0, researchCost: 180, unlockLevel: 16, power: 2, duration: 0, maxUses: 0, icon: '📐' },
  { id: 'quantum_zeno', name: 'Quantum Zeno', description: 'Apply the quantum Zeno effect to freeze time for active experiments, preventing cooldowns from ticking for 3 ticks.', type: 'toggle', cooldown: 15, energyCost: 40, researchCost: 350, unlockLevel: 17, power: 3, duration: 3, maxUses: 0, icon: '⏸️' },
  { id: 'planck_walker', name: 'Planck Walker', description: 'Walk the Planck scale for one experiment, accessing a hidden dimension where only legendary particles can be found.', type: 'burst', cooldown: 25, energyCost: 80, researchCost: 600, unlockLevel: 18, power: 5, duration: 1, maxUses: 1, icon: '🚶' },
  { id: 'quantum_cloning', name: 'Quantum Cloning', description: 'Attempt imperfect quantum cloning to duplicate the last discovered particle with 80% fidelity.', type: 'active', cooldown: 10, energyCost: 30, researchCost: 250, unlockLevel: 19, power: 2, duration: 0, maxUses: 0, icon: '👥' },
  { id: 'many_worlds', name: 'Many Worlds', description: 'Branch into parallel universes, running 5 simultaneous experiments and taking the best result from all branches.', type: 'burst', cooldown: 30, energyCost: 100, researchCost: 800, unlockLevel: 20, power: 5, duration: 0, maxUses: 1, icon: '🌌' },
  { id: 'quantum_immortality', name: 'Quantum Immortality', description: 'Guarantee that the next catastrophic experiment failure is retroactively avoided via many-worlds selection.', type: 'passive', cooldown: 30, energyCost: 50, researchCost: 700, unlockLevel: 22, power: 4, duration: 0, maxUses: 1, icon: '♾️' },
  { id: 'vacuum_catalyst', name: 'Vacuum Catalyst', description: 'Catalyze vacuum decay into a lower-energy state, releasing enormous energy and discovering multiple particles at once.', type: 'burst', cooldown: 35, energyCost: 90, researchCost: 900, unlockLevel: 24, power: 5, duration: 0, maxUses: 1, icon: '💥' },
  { id: 'grand_unification', name: 'Grand Unification', description: 'Unify all fundamental forces for one transcendent experiment that can discover any particle regardless of rarity or requirements.', type: 'burst', cooldown: 50, energyCost: 150, researchCost: 1500, unlockLevel: 30, power: 10, duration: 0, maxUses: 1, icon: '🏛️' },
];

// ---------------------------------------------------------------------------
// Achievement Definitions (18 achievements)
// ---------------------------------------------------------------------------

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  target: number;
  rewardCredits: number;
  rewardResearch: number;
  icon: string;
}

const ACHIEVEMENT_DEFS: readonly AchievementDef[] = [
  { id: 'first_discovery', name: 'First Discovery', description: 'Discover your very first quantum particle in the lab.', target: 1, rewardCredits: 50, rewardResearch: 25, icon: '🌟' },
  { id: 'ten_discoveries', name: 'Particle Hunter', description: 'Discover 10 different quantum particles across all rarity tiers.', target: 10, rewardCredits: 200, rewardResearch: 100, icon: '🔍' },
  { id: 'twenty_discoveries', name: 'Subatomic Scholar', description: 'Discover 20 different quantum particles, demonstrating broad expertise.', target: 20, rewardCredits: 500, rewardResearch: 250, icon: '📚' },
  { id: 'all_discoveries', name: 'Complete Bestiary', description: 'Discover all 35 quantum particles, completing the subatomic catalog.', target: 35, rewardCredits: 2000, rewardResearch: 1000, icon: '📖' },
  { id: 'first_legendary', name: 'Legendary Find', description: 'Discover your first legendary-tier quantum particle.', target: 1, rewardCredits: 1000, rewardResearch: 500, icon: '⚡' },
  { id: 'five_legendaries', name: 'Mythical Collector', description: 'Collect 5 legendary quantum particles through experiments and events.', target: 5, rewardCredits: 5000, rewardResearch: 2500, icon: '👑' },
  { id: 'hundred_experiments', name: 'Experiment Machine', description: 'Run a total of 100 experiments across all chambers.', target: 100, rewardCredits: 300, rewardResearch: 150, icon: '🔬' },
  { id: 'five_hundred_experiments', name: 'Research Veteran', description: 'Complete 500 experiments, demonstrating relentless dedication.', target: 500, rewardCredits: 1500, rewardResearch: 750, icon: '🏅' },
  { id: 'max_facility', name: 'Fully Equipped', description: 'Upgrade any single facility to its maximum level 10.', target: 10, rewardCredits: 800, rewardResearch: 400, icon: '🏗️' },
  { id: 'all_facilities_max', name: 'Peak Infrastructure', description: 'Upgrade every unlocked facility to its maximum level.', target: 1, rewardCredits: 3000, rewardResearch: 1500, icon: '🏛️' },
  { id: 'first_entanglement', name: 'Entangled Minds', description: 'Create your first quantum entanglement pair in the Entanglement Lab.', target: 1, rewardCredits: 150, rewardResearch: 75, icon: '🔗' },
  { id: 'fifty_entanglements', name: 'Entanglement Network', description: 'Create 50 entangled pairs, building a quantum communication web.', target: 50, rewardCredits: 2000, rewardResearch: 1000, icon: '🕸️' },
  { id: 'first_computer', name: 'Quantum Computing Birth', description: 'Generate your first quantum computer in the Computing Bay.', target: 1, rewardCredits: 500, rewardResearch: 250, icon: '💻' },
  { id: 'ten_computers', name: 'Quantum Supremacy', description: 'Generate 10 quantum computers, achieving practical quantum advantage.', target: 10, rewardCredits: 3000, rewardResearch: 1500, icon: '🚀' },
  { id: 'all_equipment', name: 'Fully Armed', description: 'Acquire all 30 pieces of laboratory equipment.', target: 30, rewardCredits: 2500, rewardResearch: 1250, icon: '🧰' },
  { id: 'all_abilities', name: 'Master of Quantum', description: 'Unlock all 22 quantum abilities through research and leveling.', target: 22, rewardCredits: 5000, rewardResearch: 2500, icon: '🧙' },
  { id: 'all_chambers_max', name: 'Chamber Master', description: 'Upgrade all 8 experiment chambers to their maximum level.', target: 10, rewardCredits: 4000, rewardResearch: 2000, icon: '🏢' },
  { id: 'title_omniscient', name: 'Quantum Omniscient', description: 'Reach the highest title of Quantum Omniscient by mastering every aspect of the lab.', target: 1, rewardCredits: 10000, rewardResearch: 5000, icon: '👁️' },
];

// ---------------------------------------------------------------------------
// Quantum Event Definitions (random events)
// ---------------------------------------------------------------------------

interface QuantumEventDef {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  effectType: QuantumEvent['effectType'];
  magnitude: number;
}

const QUANTUM_EVENT_DEFS: readonly QuantumEventDef[] = [
  { id: 'vacuum_fluctuation', name: 'Vacuum Fluctuation', description: 'A spontaneous quantum vacuum fluctuation deposits bonus energy into the lab.', rarity: 'common', effectType: 'bonus_energy', magnitude: 30 },
  { id: 'dark_matter_tide', name: 'Dark Matter Tide', description: 'A wave of dark matter passes through the lab, granting research insights.', rarity: 'uncommon', effectType: 'bonus_research', magnitude: 50 },
  { id: 'cosmic_ray_shower', name: 'Cosmic Ray Shower', description: 'A high-energy cosmic ray shower activates the detectors, earning bonus credits.', rarity: 'common', effectType: 'bonus_credits', magnitude: 40 },
  { id: 'entanglement_storm', name: 'Entanglement Storm', description: 'A natural entanglement cascade boosts discovery rates temporarily.', rarity: 'rare', effectType: 'bonus_discovery', magnitude: 3 },
  { id: 'stray_neutrino', name: 'Stray Neutrino Detection', description: 'An unexpected neutrino interaction reveals a random particle sample.', rarity: 'uncommon', effectType: 'random_particle', magnitude: 1 },
  { id: 'facility_power_surge', name: 'Facility Power Surge', description: 'A controlled power surge temporarily boosts all facility outputs.', rarity: 'epic', effectType: 'facility_boost', magnitude: 5 },
  { id: 'quantum_recalibration', name: 'Quantum Recalibration', description: 'Spontaneous quantum recalibration resets all ability cooldowns.', rarity: 'epic', effectType: 'ability_reset', magnitude: 0 },
  { id: 'dark_energy_pulse', name: 'Dark Energy Pulse', description: 'A pulse of dark energy floods the lab with enormous energy reserves.', rarity: 'rare', effectType: 'bonus_energy', magnitude: 80 },
  { id: 'higgs_excitation', name: 'Higgs Field Excitation', description: 'A momentary excitation of the Higgs field reveals exotic particles.', rarity: 'legendary', effectType: 'random_particle', magnitude: 3 },
  { id: 'wormhole_brief_opening', name: 'Wormhole Brief Opening', description: 'A micro-wormhole briefly opens, flooding the lab with energy and credits.', rarity: 'legendary', effectType: 'bonus_credits', magnitude: 200 },
];

// ---------------------------------------------------------------------------
// Helper Functions (non-hook, pure functions)
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `ql_${ts}_${rand}`;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rarityWeight(rarity: Rarity): number {
  switch (rarity) {
    case 'common': return 40;
    case 'uncommon': return 28;
    case 'rare': return 18;
    case 'epic': return 10;
    case 'legendary': return 4;
  }
}

function rarityXPBonus(rarity: Rarity): number {
  switch (rarity) {
    case 'common': return 1;
    case 'uncommon': return 2;
    case 'rare': return 5;
    case 'epic': return 12;
    case 'legendary': return 30;
  }
}

// ---------------------------------------------------------------------------
// The Hook
// ---------------------------------------------------------------------------

export default function useQuantumLab() {
  // ========================================================================
  // Constants
  // ========================================================================

  const QL_MAX_ENERGY = 200;
  const QL_PARTICLE_COUNT = 35;
  const QL_CHAMBER_COUNT = 8;
  const QL_EQUIPMENT_COUNT = 30;
  const QL_FACILITY_COUNT = 25;
  const QL_ABILITY_COUNT = 22;
  const QL_ACHIEVEMENT_COUNT = 18;
  const QL_TITLE_COUNT = 8;
  const QL_INITIAL_ENERGY = 100;
  const QL_INITIAL_CREDITS = 0;
  const QL_INITIAL_RESEARCH = 0;
  const QL_MAX_TITLE_INDEX = 7;

  // ========================================================================
  // State
  // ========================================================================

  const [particles, setParticles] = useState<Particle[]>([]);
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentChamber, setCurrentChamber] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(QL_INITIAL_ENERGY);
  const [quantumCredits, setQuantumCredits] = useState<number>(QL_INITIAL_CREDITS);
  const [researchPoints, setResearchPoints] = useState<number>(QL_INITIAL_RESEARCH);
  const [experimentsRun, setExperimentsRun] = useState<number>(0);
  const [particlesDiscovered, setParticlesDiscovered] = useState<number>(0);
  const [titleIndex, setTitleIndex] = useState<number>(0);
  const [entanglementPairs, setEntanglementPairs] = useState<number>(0);
  const [dailyExperiment, setDailyExperiment] = useState<DailyExperiment | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Ref for accessing state in callbacks without stale closures
  const stateRef = useRef({
    particles: [] as Particle[],
    chambers: [] as Chamber[],
    equipment: [] as Equipment[],
    facilities: [] as Facility[],
    abilities: [] as Ability[],
    achievements: [] as Achievement[],
    currentChamber: 0,
    energy: QL_INITIAL_ENERGY,
    quantumCredits: QL_INITIAL_CREDITS,
    researchPoints: QL_INITIAL_RESEARCH,
    experimentsRun: 0,
    particlesDiscovered: 0,
    titleIndex: 0,
    entanglementPairs: 0,
  });

  // ========================================================================
  // Initialization
  // ========================================================================

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    const now = Date.now();

    const initParticles: Particle[] = PARTICLE_DEFS.map((def) => ({
      id: def.id,
      name: def.name,
      symbol: def.symbol,
      category: def.category,
      rarity: def.rarity,
      description: def.description,
      spin: def.spin,
      mass: def.mass,
      charge: def.charge,
      discovered: false,
      discoveredAt: null,
      quantity: 0,
      energyValue: def.energyValue,
    }));

    const initChambers: Chamber[] = CHAMBER_DEFS.map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      status: 'idle' as ChamberStatus,
      energyCost: def.energyCost,
      discoveryBonus: def.discoveryBonus,
      researchBonus: def.researchBonus,
      cooldownTicks: 0,
      maxCooldown: def.maxCooldown,
      level: 1,
      maxLevel: def.maxLevel,
      experimentsCompleted: 0,
      icon: def.icon,
    }));

    const initEquipment: Equipment[] = EQUIPMENT_DEFS.map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      rarity: def.rarity,
      owned: false,
      equipped: false,
      bonusEnergy: def.bonusEnergy,
      bonusDiscovery: def.bonusDiscovery,
      bonusResearch: def.bonusResearch,
      durability: def.maxDurability,
      maxDurability: def.maxDurability,
      level: 1,
      icon: def.icon,
    }));

    const initFacilities: Facility[] = FACILITY_DEFS.map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      level: 1,
      maxLevel: def.maxLevel,
      upgradeCost: def.baseUpgradeCost,
      energyOutput: def.baseEnergyOutput,
      researchOutput: def.baseResearchOutput,
      creditOutput: def.baseCreditOutput,
      unlocked: def.unlockLevel <= 1,
      icon: def.icon,
    }));

    const initAbilities: Ability[] = ABILITY_DEFS.map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      type: def.type,
      cooldown: def.cooldown,
      currentCooldown: 0,
      energyCost: def.energyCost,
      researchCost: def.researchCost,
      unlocked: def.unlockLevel <= 1,
      unlockLevel: def.unlockLevel,
      power: def.power,
      duration: def.duration,
      usesLeft: def.maxUses,
      maxUses: def.maxUses,
      icon: def.icon,
    }));

    const initAchievements: Achievement[] = ACHIEVEMENT_DEFS.map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      target: def.target,
      rewardCredits: def.rewardCredits,
      rewardResearch: def.rewardResearch,
      icon: def.icon,
    }));

    setParticles(initParticles);
    setChambers(initChambers);
    setEquipment(initEquipment);
    setFacilities(initFacilities);
    setAbilities(initAbilities);
    setAchievements(initAchievements);

    // Generate daily experiment
    const today = todayKey();
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
      seed = (seed * 31 + today.charCodeAt(i)) | 0;
    }
    seed = Math.abs(seed);
    const rng = seededRandom(seed);

    const dailyTitles = [
      'Dark Matter Scan', 'Higgs Field Mapping', 'Neutrino Oscillation Study',
      'Quantum Tunneling Test', 'Entanglement Verification', 'Wave Function Survey',
      'Antimatter Reaction Analysis', 'Superposition Stability Check',
    ];
    const dailyDescs = [
      'Map the local dark matter density using the Dark Energy Observatory.',
      'Measure Higgs boson couplings in the Particle Accelerator.',
      'Track neutrino flavor changes through multiple detector arrays.',
      'Test quantum tunneling probabilities at macroscopic scales.',
      'Verify Bell inequality violations across entangled pairs.',
      'Survey wave function distributions in the Wave Function Chamber.',
      'Analyze controlled antimatter annihilation energy yields.',
      'Test how long superposition states can be maintained.',
    ];
    const dIdx = Math.floor(rng() * dailyTitles.length);
    const cIdx = Math.floor(rng() * CHAMBER_DEFS.length);

    setDailyExperiment({
      dateKey: today,
      title: dailyTitles[dIdx],
      description: dailyDescs[dIdx],
      targetChamber: CHAMBER_DEFS[cIdx].id,
      targetParticles: 2 + Math.floor(rng() * 4),
      rewardBonus: 50 + Math.floor(rng() * 100),
      completed: false,
      completedAt: null,
    });
  }, [initialized]);

  // ========================================================================
  // Sync stateRef
  // ========================================================================

  useEffect(() => {
    stateRef.current = {
      particles,
      chambers,
      equipment,
      facilities,
      abilities,
      achievements,
      currentChamber,
      energy,
      quantumCredits,
      researchPoints,
      experimentsRun,
      particlesDiscovered,
      titleIndex,
      entanglementPairs,
    };
  }, [particles, chambers, equipment, facilities, abilities, achievements, currentChamber, energy, quantumCredits, researchPoints, experimentsRun, particlesDiscovered, titleIndex, entanglementPairs]);

  // ========================================================================
  // Computed Values (useMemo)
  // ========================================================================

  const discoveredCount = useMemo<number>(() => {
    return particles.filter((p) => p.discovered).length;
  }, [particles]);

  const discoveredParticles = useMemo<Particle[]>(() => {
    return particles.filter((p) => p.discovered);
  }, [particles]);

  const undiscoveredParticles = useMemo<Particle[]>(() => {
    return particles.filter((p) => !p.discovered);
  }, [particles]);

  const totalEnergyOutput = useMemo<number>(() => {
    return facilities.reduce((sum, f) => sum + (f.unlocked ? f.energyOutput * f.level : 0), 0);
  }, [facilities]);

  const totalResearchOutput = useMemo<number>(() => {
    return facilities.reduce((sum, f) => sum + (f.unlocked ? f.researchOutput * f.level : 0), 0);
  }, [facilities]);

  const totalCreditOutput = useMemo<number>(() => {
    return facilities.reduce((sum, f) => sum + (f.unlocked ? f.creditOutput * f.level : 0), 0);
  }, [facilities]);

  const equippedBonuses = useMemo<{ energy: number; discovery: number; research: number }>(() => {
    let energy = 0;
    let discovery = 0;
    let research = 0;
    for (const eq of equipment) {
      if (eq.equipped && eq.owned) {
        energy += eq.bonusEnergy * eq.level;
        discovery += eq.bonusDiscovery * eq.level;
        research += eq.bonusResearch * eq.level;
      }
    }
    return { energy, discovery, research };
  }, [equipment]);

  const effectiveMaxEnergy = useMemo<number>(() => {
    return QL_MAX_ENERGY + equippedBonuses.energy + Math.floor(totalEnergyOutput * 0.5);
  }, [equippedBonuses, totalEnergyOutput]);

  const title = useMemo<string>(() => {
    return TITLES[Math.min(titleIndex, QL_MAX_TITLE_INDEX)];
  }, [titleIndex]);

  const titleList = useMemo<readonly string[]>(() => {
    return TITLES;
  }, []);

  const stats = useMemo<Stats>(() => {
    const experimentsByChamber: Record<string, number> = {};
    for (const ch of chambers) {
      experimentsByChamber[ch.id] = ch.experimentsCompleted;
    }
    return {
      totalExperiments: experimentsRun,
      totalParticlesDiscovered: particlesDiscovered,
      totalEnergyUsed: 0,
      totalCreditsEarned: quantumCredits,
      totalResearchEarned: researchPoints,
      totalEntanglements: entanglementPairs,
      totalWaveCollapses: 0,
      totalQuantumComputers: 0,
      totalAbilitiesActivated: 0,
      legendaryParticlesFound: particles.filter((p) => p.discovered && p.rarity === 'legendary').length,
      epicParticlesFound: particles.filter((p) => p.discovered && p.rarity === 'epic').length,
      experimentsByChamber,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };
  }, [chambers, experimentsRun, particlesDiscovered, quantumCredits, researchPoints, entanglementPairs, particles]);

  const progress = useMemo<{ particlesPercent: number; experimentsPercent: number; achievementsPercent: number; overallPercent: number }>(() => {
    const particlesPercent = Math.round((discoveredCount / QL_PARTICLE_COUNT) * 100);
    const experimentsPercent = Math.min(100, Math.round((experimentsRun / 500) * 100));
    const achievementsPercent = Math.round((achievements.filter((a) => a.unlocked).length / QL_ACHIEVEMENT_COUNT) * 100);
    const overallPercent = Math.round((particlesPercent + experimentsPercent + achievementsPercent) / 3);
    return { particlesPercent, experimentsPercent, achievementsPercent, overallPercent };
  }, [discoveredCount, experimentsRun, achievements]);

  const colorTheme = useMemo(() => QL_COLORS, []);

  const unlockedAbilitiesCount = useMemo<number>(() => {
    return abilities.filter((a) => a.unlocked).length;
  }, [abilities]);

  const unlockedFacilitiesCount = useMemo<number>(() => {
    return facilities.filter((f) => f.unlocked).length;
  }, [facilities]);

  const ownedEquipmentCount = useMemo<number>(() => {
    return equipment.filter((e) => e.owned).length;
  }, [equipment]);

  const particleCountsByRarity = useMemo<Record<Rarity, number>>(() => {
    const counts: Record<Rarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    for (const p of particles) {
      if (p.discovered) counts[p.rarity]++;
    }
    return counts;
  }, [particles]);

  // ========================================================================
  // Action Functions (useCallback)
  // ========================================================================

  const discoverParticle = useCallback((particleId: string): { success: boolean; particle: Particle | null } => {
    const ref = stateRef.current;
    const particle = ref.particles.find((p) => p.id === particleId);
    if (!particle || particle.discovered) {
      return { success: false, particle: null };
    }

    const updated: Particle = {
      ...particle,
      discovered: true,
      discoveredAt: Date.now(),
      quantity: 1,
    };

    setParticles((prev) => prev.map((p) => (p.id === particleId ? updated : p)));
    setParticlesDiscovered((prev) => prev + 1);
    setResearchPoints((prev) => prev + rarityXPBonus(particle.rarity) * 10);
    setQuantumCredits((prev) => prev + rarityXPBonus(particle.rarity) * 5);

    return { success: true, particle: updated };
  }, []);

  const runExperiment = useCallback((): ExperimentResult => {
    const ref = stateRef.current;
    const chamber = ref.chambers[currentChamber];
    if (!chamber) return { success: false, particleFound: null, creditsEarned: 0, researchEarned: 0, energyUsed: 0, message: 'No chamber selected.' };
    if (chamber.status === 'running' || chamber.status === 'cooldown') {
      return { success: false, particleFound: null, creditsEarned: 0, researchEarned: 0, energyUsed: 0, message: 'Chamber is busy.' };
    }
    if (ref.energy < chamber.energyCost) {
      return { success: false, particleFound: null, creditsEarned: 0, researchEarned: 0, energyUsed: 0, message: 'Insufficient energy.' };
    }

    // Consume energy
    setEnergy((prev) => prev - chamber.energyCost);
    setExperimentsRun((prev) => prev + 1);

    // Calculate discovery chance
    const baseChance = 35;
    const chamberBonus = chamber.discoveryBonus * chamber.level;
    const equipBonus = ref.equipment.filter((e) => e.equipped && e.owned).reduce((sum, e) => sum + e.bonusDiscovery * e.level, 0);
    const facilityBonus = ref.facilities.filter((f) => f.unlocked).reduce((sum, f) => sum + f.researchOutput * f.level * 0.1, 0);
    const discoveryChance = Math.min(95, baseChance + chamberBonus + equipBonus + facilityBonus);

    const roll = Math.random() * 100;
    let particleFound: Particle | null = null;
    let message = '';

    if (roll < discoveryChance) {
      // Weighted random particle selection
      const undiscovered = ref.particles.filter((p) => !p.discovered);
      const pool = undiscovered.length > 0 ? undiscovered : ref.particles.filter((p) => p.discovered);

      // Build weighted pool
      const weighted: Particle[] = [];
      for (const p of pool) {
        const w = rarityWeight(p.rarity);
        for (let i = 0; i < w; i++) weighted.push(p);
      }

      const chosen = pickRandom(weighted);
      if (!chosen.discovered) {
        particleFound = { ...chosen, discovered: true, discoveredAt: Date.now(), quantity: 1 };
        setParticles((prev) => prev.map((p) => p.id === chosen.id ? particleFound! : p));
        setParticlesDiscovered((prev) => prev + 1);
        message = `Discovered ${chosen.name} (${chosen.rarity}) in ${chamber.name}!`;
      } else {
        particleFound = { ...chosen, quantity: chosen.quantity + 1 };
        setParticles((prev) => prev.map((p) => p.id === chosen.id ? particleFound! : p));
        message = `Found another ${chosen.name} in ${chamber.name}.`;
      }
    } else {
      message = `No new particles discovered in ${chamber.name}. Try again!`;
    }

    // Calculate rewards
    const chamberLevel = chamber.level;
    const creditsEarned = 10 + chamberLevel * 5 + (particleFound ? rarityXPBonus(particleFound.rarity) * 3 : 0);
    const researchEarned = 5 + chamberLevel * 3 + chamber.researchBonus + (particleFound ? rarityXPBonus(particleFound.rarity) * 5 : 0);

    setQuantumCredits((prev) => prev + creditsEarned);
    setResearchPoints((prev) => prev + researchEarned);

    // Update chamber
    setChambers((prev) => prev.map((ch) => {
      if (ch.id !== chamber.id) return ch;
      return {
        ...ch,
        status: 'cooldown' as ChamberStatus,
        cooldownTicks: ch.maxCooldown,
        experimentsCompleted: ch.experimentsCompleted + 1,
      };
    }));

    return { success: true, particleFound, creditsEarned, researchEarned, energyUsed: chamber.energyCost, message };
  }, [currentChamber]);

  const upgradeFacility = useCallback((facilityId: string): { success: boolean; newLevel: number; cost: number } => {
    const ref = stateRef.current;
    const facility = ref.facilities.find((f) => f.id === facilityId);
    if (!facility || !facility.unlocked) return { success: false, newLevel: facility?.level ?? 0, cost: 0 };
    if (facility.level >= facility.maxLevel) return { success: false, newLevel: facility.level, cost: 0 };

    const def = FACILITY_DEFS.find((d) => d.id === facilityId);
    if (!def) return { success: false, newLevel: facility.level, cost: 0 };

    const cost = Math.round(def.baseUpgradeCost * Math.pow(1.5, facility.level - 1));
    if (ref.quantumCredits < cost) return { success: false, newLevel: facility.level, cost };

    const newLevel = facility.level + 1;
    setQuantumCredits((prev) => prev - cost);
    setFacilities((prev) => prev.map((f) => {
      if (f.id !== facilityId) return f;
      return {
        ...f,
        level: newLevel,
        upgradeCost: Math.round(def.baseUpgradeCost * Math.pow(1.5, newLevel - 1)),
        energyOutput: Math.round(def.baseEnergyOutput * (1 + (newLevel - 1) * 0.3)),
        researchOutput: Math.round(def.baseResearchOutput * (1 + (newLevel - 1) * 0.3)),
        creditOutput: Math.round(def.baseCreditOutput * (1 + (newLevel - 1) * 0.3)),
      };
    }));

    return { success: true, newLevel, cost };
  }, []);

  const activateAbility = useCallback((abilityId: string): { success: boolean; message: string } => {
    const ref = stateRef.current;
    const ability = ref.abilities.find((a) => a.id === abilityId);
    if (!ability || !ability.unlocked) return { success: false, message: 'Ability not unlocked.' };
    if (ability.currentCooldown > 0) return { success: false, message: 'Ability is on cooldown.' };
    if (ability.maxUses > 0 && ability.usesLeft <= 0) return { success: false, message: 'No uses remaining.' };
    if (ref.energy < ability.energyCost) return { success: false, message: 'Insufficient energy.' };

    setEnergy((prev) => prev - ability.energyCost);
    setAbilities((prev) => prev.map((a) => {
      if (a.id !== abilityId) return a;
      return {
        ...a,
        currentCooldown: a.cooldown,
        usesLeft: a.maxUses > 0 ? Math.max(0, a.usesLeft - 1) : a.usesLeft,
      };
    }));

    let message = `Activated ${ability.name}!`;
    if (ability.id === 'casimir_effect') {
      const energyGain = Math.round(effectiveMaxEnergy * 0.5);
      setEnergy((prev) => Math.min(effectiveMaxEnergy, prev + energyGain));
      message = `Casimir Effect restored ${energyGain} energy!`;
    }
    if (ability.id === 'dark_energy_surge') {
      setEnergy((prev) => Math.min(effectiveMaxEnergy, prev + QL_MAX_ENERGY));
      message = 'Dark Energy Surge filled energy to maximum!';
    }

    return { success: true, message };
  }, [effectiveMaxEnergy]);

  const researchTheory = useCallback((researchCost: number): { success: boolean; newResearch: number } => {
    const ref = stateRef.current;
    if (ref.researchPoints < researchCost) return { success: false, newResearch: ref.researchPoints };

    setResearchPoints((prev) => prev - researchCost);
    const gained = Math.round(researchCost * 0.3);
    setQuantumCredits((prev) => prev + gained);

    // Unlock abilities based on research spent
    setAbilities((prev) => prev.map((a) => {
      if (a.unlocked || ref.researchPoints < a.researchCost) return a;
      if (ref.researchPoints >= a.researchCost && ref.experimentsRun >= a.unlockLevel) {
        return { ...a, unlocked: true };
      }
      return a;
    }));

    // Unlock facilities based on experiments run
    setFacilities((prev) => prev.map((f) => {
      if (f.unlocked) return f;
      const def = FACILITY_DEFS.find((d) => d.id === f.id);
      if (def && ref.experimentsRun >= def.unlockLevel) {
        return { ...f, unlocked: true };
      }
      return f;
    }));

    return { success: true, newResearch: researchPoints - researchCost };
  }, [researchPoints]);

  const calibrateEquipment = useCallback((equipmentId: string): { success: boolean; newLevel: number } => {
    const ref = stateRef.current;
    const eq = ref.equipment.find((e) => e.id === equipmentId);
    if (!eq || !eq.owned) return { success: false, newLevel: 0 };
    if (eq.level >= 10) return { success: false, newLevel: eq.level };
    if (eq.durability <= 0) return { success: false, newLevel: eq.level };

    const cost = Math.round(20 * Math.pow(1.4, eq.level - 1));
    if (ref.quantumCredits < cost) return { success: false, newLevel: eq.level };

    const newLevel = eq.level + 1;
    const def = EQUIPMENT_DEFS.find((d) => d.id === equipmentId);
    setQuantumCredits((prev) => prev - cost);
    setEquipment((prev) => prev.map((e) => {
      if (e.id !== equipmentId) return e;
      return {
        ...e,
        level: newLevel,
        durability: e.durability - Math.round(e.maxDurability * 0.1),
        bonusEnergy: def ? Math.round(def.bonusEnergy * (1 + (newLevel - 1) * 0.2)) : e.bonusEnergy,
        bonusDiscovery: def ? Math.round(def.bonusDiscovery * (1 + (newLevel - 1) * 0.2)) : e.bonusDiscovery,
        bonusResearch: def ? Math.round(def.bonusResearch * (1 + (newLevel - 1) * 0.2)) : e.bonusResearch,
      };
    }));

    return { success: true, newLevel };
  }, []);

  const entanglePair = useCallback((): { success: boolean; pairsCreated: number } => {
    const ref = stateRef.current;
    if (ref.energy < 15) return { success: false, pairsCreated: 0 };

    const entanglementChamber = ref.chambers.find((c) => c.id === 'quantum_entanglement_lab');
    if (!entanglementChamber || entanglementChamber.level < 1) return { success: false, pairsCreated: 0 };

    const pairsCreated = 1 + Math.floor(Math.random() * entanglementChamber.level);
    setEnergy((prev) => prev - 15);
    setEntanglementPairs((prev) => prev + pairsCreated);
    setResearchPoints((prev) => prev + pairsCreated * 5);

    return { success: true, pairsCreated };
  }, []);

  const collapseWaveFunction = useCallback((): { success: boolean; particle: Particle | null; energyRestored: number } => {
    const ref = stateRef.current;
    if (ref.energy < 25) return { success: false, particle: null, energyRestored: 0 };

    const waveChamber = ref.chambers.find((c) => c.id === 'wave_function_chamber');
    if (!waveChamber) return { success: false, particle: null, energyRestored: 0 };

    setEnergy((prev) => prev - 25);

    // Guaranteed discovery of an undiscovered particle
    const undiscovered = ref.particles.filter((p) => !p.discovered);
    if (undiscovered.length === 0) {
      // All discovered, get energy back plus bonus
      const restored = 50;
      setEnergy((prev) => Math.min(effectiveMaxEnergy, prev + restored));
      return { success: true, particle: null, energyRestored: restored };
    }

    const chosen = pickRandom(undiscovered);
    const updated: Particle = { ...chosen, discovered: true, discoveredAt: Date.now(), quantity: 1 };

    setParticles((prev) => prev.map((p) => p.id === chosen.id ? updated : p));
    setParticlesDiscovered((prev) => prev + 1);
    setResearchPoints((prev) => prev + 30);

    return { success: true, particle: updated, energyRestored: 0 };
  }, [effectiveMaxEnergy]);

  const generateQuantumComputer = useCallback((): { success: boolean; qubits: number; creditsEarned: number } => {
    const ref = stateRef.current;
    if (ref.energy < 40) return { success: false, qubits: 0, creditsEarned: 0 };

    const computingBay = ref.chambers.find((c) => c.id === 'quantum_computing_bay');
    if (!computingBay) return { success: false, qubits: 0, creditsEarned: 0 };

    setEnergy((prev) => prev - 40);

    const baseQubits = computingBay.level * 10;
    const equipmentBonus = ref.equipment.filter((e) => e.equipped && e.owned).reduce((sum, e) => sum + e.bonusResearch, 0);
    const qubits = baseQubits + equipmentBonus;
    const creditsEarned = qubits * 2;

    setQuantumCredits((prev) => prev + creditsEarned);
    setResearchPoints((prev) => prev + Math.round(qubits * 0.5));

    return { success: true, qubits, creditsEarned };
  }, []);

  const triggerQuantumEvent = useCallback((): QuantumEventDef | null => {
    const roll = Math.random() * 100;
    let eventPool: readonly QuantumEventDef[];

    if (roll < 3) {
      eventPool = QUANTUM_EVENT_DEFS.filter((e) => e.rarity === 'legendary');
    } else if (roll < 15) {
      eventPool = QUANTUM_EVENT_DEFS.filter((e) => e.rarity === 'epic');
    } else if (roll < 40) {
      eventPool = QUANTUM_EVENT_DEFS.filter((e) => e.rarity === 'rare' || e.rarity === 'uncommon');
    } else {
      eventPool = QUANTUM_EVENT_DEFS.filter((e) => e.rarity === 'common');
    }

    const event = pickRandom(eventPool);

    // Apply effects
    switch (event.effectType) {
      case 'bonus_energy':
        setEnergy((prev) => Math.min(effectiveMaxEnergy, prev + event.magnitude));
        break;
      case 'bonus_credits':
        setQuantumCredits((prev) => prev + event.magnitude);
        break;
      case 'bonus_research':
        setResearchPoints((prev) => prev + event.magnitude);
        break;
      case 'ability_reset':
        setAbilities((prev) => prev.map((a) => ({ ...a, currentCooldown: 0 })));
        break;
      default:
        break;
    }

    return event;
  }, [effectiveMaxEnergy]);

  const resetDailyExperiment = useCallback((): DailyExperiment => {
    const today = todayKey();
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
      seed = (seed * 31 + today.charCodeAt(i)) | 0;
    }
    seed = Math.abs(seed);
    const rng = seededRandom(seed);

    const dailyTitles = [
      'Dark Matter Scan', 'Higgs Field Mapping', 'Neutrino Oscillation Study',
      'Quantum Tunneling Test', 'Entanglement Verification', 'Wave Function Survey',
      'Antimatter Reaction Analysis', 'Superposition Stability Check',
    ];
    const dailyDescs = [
      'Map the local dark matter density using the Dark Energy Observatory.',
      'Measure Higgs boson couplings in the Particle Accelerator.',
      'Track neutrino flavor changes through multiple detector arrays.',
      'Test quantum tunneling probabilities at macroscopic scales.',
      'Verify Bell inequality violations across entangled pairs.',
      'Survey wave function distributions in the Wave Function Chamber.',
      'Analyze controlled antimatter annihilation energy yields.',
      'Test how long superposition states can be maintained.',
    ];
    const dIdx = Math.floor(rng() * dailyTitles.length);
    const cIdx = Math.floor(rng() * CHAMBER_DEFS.length);

    const newDaily: DailyExperiment = {
      dateKey: today,
      title: dailyTitles[dIdx],
      description: dailyDescs[dIdx],
      targetChamber: CHAMBER_DEFS[cIdx].id,
      targetParticles: 2 + Math.floor(rng() * 4),
      rewardBonus: 50 + Math.floor(rng() * 100),
      completed: false,
      completedAt: null,
    };

    setDailyExperiment(newDaily);
    return newDaily;
  }, []);

  const checkAchievements = useCallback((): string[] => {
    const ref = stateRef.current;
    const newlyUnlocked: string[] = [];
    const now = Date.now();

    const updateAchievement = (id: string, currentProgress: number, condition: boolean) => {
      if (condition) {
        setAchievements((prev) => prev.map((a) => {
          if (a.id !== id || a.unlocked) return a;
          newlyUnlocked.push(id);
          return { ...a, unlocked: true, unlockedAt: now, progress: a.target };
        }));
      } else {
        setAchievements((prev) => prev.map((a) => {
          if (a.id !== id) return a;
          return { ...a, progress: currentProgress };
        }));
      }
    };

    const discCount = ref.particles.filter((p) => p.discovered).length;
    const legCount = ref.particles.filter((p) => p.discovered && p.rarity === 'legendary').length;

    updateAchievement('first_discovery', discCount, discCount >= 1);
    updateAchievement('ten_discoveries', discCount, discCount >= 10);
    updateAchievement('twenty_discoveries', discCount, discCount >= 20);
    updateAchievement('all_discoveries', discCount, discCount >= 35);
    updateAchievement('first_legendary', legCount, legCount >= 1);
    updateAchievement('five_legendaries', legCount, legCount >= 5);
    updateAchievement('hundred_experiments', ref.experimentsRun, ref.experimentsRun >= 100);
    updateAchievement('five_hundred_experiments', ref.experimentsRun, ref.experimentsRun >= 500);
    updateAchievement('max_facility', ref.facilities.reduce((max, f) => Math.max(max, f.level), 0), ref.facilities.some((f) => f.level >= 10));
    updateAchievement('all_facilities_max', ref.facilities.filter((f) => f.unlocked && f.level >= 10).length, ref.facilities.every((f) => !f.unlocked || f.level >= 10));
    updateAchievement('first_entanglement', ref.entanglementPairs, ref.entanglementPairs >= 1);
    updateAchievement('fifty_entanglements', ref.entanglementPairs, ref.entanglementPairs >= 50);
    updateAchievement('first_computer', 1, false); // tracked externally
    updateAchievement('ten_computers', 10, false); // tracked externally
    updateAchievement('all_equipment', ref.equipment.filter((e) => e.owned).length, ref.equipment.every((e) => e.owned));
    updateAchievement('all_abilities', ref.abilities.filter((a) => a.unlocked).length, ref.abilities.every((a) => a.unlocked));
    updateAchievement('all_chambers_max', ref.chambers.reduce((max, c) => Math.max(max, c.level), 0), ref.chambers.every((c) => c.level >= 10));
    updateAchievement('title_omniscient', ref.titleIndex, ref.titleIndex >= QL_MAX_TITLE_INDEX);

    // Grant rewards for newly unlocked achievements
    if (newlyUnlocked.length > 0) {
      let creditReward = 0;
      let researchReward = 0;
      for (const id of newlyUnlocked) {
        const def = ACHIEVEMENT_DEFS.find((d) => d.id === id);
        if (def) {
          creditReward += def.rewardCredits;
          researchReward += def.rewardResearch;
        }
      }
      setQuantumCredits((prev) => prev + creditReward);
      setResearchPoints((prev) => prev + researchReward);
    }

    return newlyUnlocked;
  }, []);

  const getTitle = useCallback((): string => {
    return TITLES[Math.min(stateRef.current.titleIndex, QL_MAX_TITLE_INDEX)];
  }, []);

  const getProgress = useCallback((): { particlesPercent: number; experimentsPercent: number; achievementsPercent: number; overallPercent: number } => {
    const ref = stateRef.current;
    const dc = ref.particles.filter((p) => p.discovered).length;
    const particlesPercent = Math.round((dc / QL_PARTICLE_COUNT) * 100);
    const experimentsPercent = Math.min(100, Math.round((ref.experimentsRun / 500) * 100));
    const achievementsPercent = Math.round((ref.achievements.filter((a) => a.unlocked).length / QL_ACHIEVEMENT_COUNT) * 100);
    const overallPercent = Math.round((particlesPercent + experimentsPercent + achievementsPercent) / 3);
    return { particlesPercent, experimentsPercent, achievementsPercent, overallPercent };
  }, []);

  const getStats = useCallback((): Stats => {
    const ref = stateRef.current;
    const experimentsByChamber: Record<string, number> = {};
    for (const ch of ref.chambers) {
      experimentsByChamber[ch.id] = ch.experimentsCompleted;
    }
    return {
      totalExperiments: ref.experimentsRun,
      totalParticlesDiscovered: ref.particlesDiscovered,
      totalEnergyUsed: 0,
      totalCreditsEarned: ref.quantumCredits,
      totalResearchEarned: ref.researchPoints,
      totalEntanglements: ref.entanglementPairs,
      totalWaveCollapses: 0,
      totalQuantumComputers: 0,
      totalAbilitiesActivated: 0,
      legendaryParticlesFound: ref.particles.filter((p) => p.discovered && p.rarity === 'legendary').length,
      epicParticlesFound: ref.particles.filter((p) => p.discovered && p.rarity === 'epic').length,
      experimentsByChamber,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };
  }, []);

  const selectChamber = useCallback((chamberIndex: number): void => {
    if (chamberIndex >= 0 && chamberIndex < QL_CHAMBER_COUNT) {
      setCurrentChamber(chamberIndex);
    }
  }, []);

  const acquireEquipment = useCallback((equipmentId: string): { success: boolean; cost: number } => {
    const ref = stateRef.current;
    const eq = ref.equipment.find((e) => e.id === equipmentId);
    if (!eq) return { success: false, cost: 0 };
    if (eq.owned) return { success: false, cost: 0 };

    const rarityCosts: Record<Rarity, number> = { common: 50, uncommon: 150, rare: 400, epic: 1000, legendary: 3000 };
    const cost = rarityCosts[eq.rarity];
    if (ref.quantumCredits < cost) return { success: false, cost };

    setQuantumCredits((prev) => prev - cost);
    setEquipment((prev) => prev.map((e) => e.id === equipmentId ? { ...e, owned: true } : e));
    return { success: true, cost };
  }, []);

  const toggleEquipItem = useCallback((equipmentId: string): { success: boolean; equipped: boolean } => {
    const ref = stateRef.current;
    const eq = ref.equipment.find((e) => e.id === equipmentId);
    if (!eq || !eq.owned) return { success: false, equipped: false };
    if (eq.durability <= 0) return { success: false, equipped: false };

    const newEquipped = !eq.equipped;
    setEquipment((prev) => prev.map((e) => e.id === equipmentId ? { ...e, equipped: newEquipped } : e));
    return { success: true, equipped: newEquipped };
  }, []);

  const repairEquipment = useCallback((equipmentId: string): { success: boolean; cost: number } => {
    const ref = stateRef.current;
    const eq = ref.equipment.find((e) => e.id === equipmentId);
    if (!eq || !eq.owned) return { success: false, cost: 0 };

    const repairAmount = eq.maxDurability - eq.durability;
    if (repairAmount <= 0) return { success: false, cost: 0 };

    const cost = Math.round(repairAmount * 0.5);
    if (ref.quantumCredits < cost) return { success: false, cost };

    setQuantumCredits((prev) => prev - cost);
    setEquipment((prev) => prev.map((e) => e.id === equipmentId ? { ...e, durability: e.maxDurability } : e));
    return { success: true, cost };
  }, []);

  const upgradeChamber = useCallback((chamberId: string): { success: boolean; newLevel: number; cost: number } => {
    const ref = stateRef.current;
    const chamber = ref.chambers.find((c) => c.id === chamberId);
    if (!chamber) return { success: false, newLevel: 0, cost: 0 };
    if (chamber.level >= chamber.maxLevel) return { success: false, newLevel: chamber.level, cost: 0 };

    const def = CHAMBER_DEFS.find((d) => d.id === chamberId);
    if (!def) return { success: false, newLevel: chamber.level, cost: 0 };

    const cost = Math.round(def.energyCost * 5 * Math.pow(1.6, chamber.level - 1));
    if (ref.quantumCredits < cost) return { success: false, newLevel: chamber.level, cost };

    const newLevel = chamber.level + 1;
    setQuantumCredits((prev) => prev - cost);
    setChambers((prev) => prev.map((ch) => {
      if (ch.id !== chamberId) return ch;
      return {
        ...ch,
        level: newLevel,
        discoveryBonus: def.discoveryBonus + Math.round(newLevel * 2),
        researchBonus: def.researchBonus + Math.round(newLevel * 3),
      };
    }));

    return { success: true, newLevel, cost };
  }, []);

  const collectFacilityOutputs = useCallback((): { energy: number; credits: number; research: number } => {
    const ref = stateRef.current;
    let totalEnergy = 0;
    let totalCredits = 0;
    let totalResearch = 0;

    for (const f of ref.facilities) {
      if (!f.unlocked) continue;
      totalEnergy += f.energyOutput * f.level;
      totalCredits += f.creditOutput * f.level;
      totalResearch += f.researchOutput * f.level;
    }

    setEnergy((prev) => Math.min(effectiveMaxEnergy, prev + totalEnergy));
    setQuantumCredits((prev) => prev + totalCredits);
    setResearchPoints((prev) => prev + totalResearch);

    return { energy: totalEnergy, credits: totalCredits, research: totalResearch };
  }, [effectiveMaxEnergy]);

  const tickCooldowns = useCallback((): void => {
    setChambers((prev) => prev.map((ch) => {
      if (ch.cooldownTicks <= 0) {
        return { ...ch, status: 'idle' as ChamberStatus };
      }
      return { ...ch, cooldownTicks: ch.cooldownTicks - 1 };
    }));

    setAbilities((prev) => prev.map((a) => {
      if (a.currentCooldown <= 0) return a;
      return { ...a, currentCooldown: a.currentCooldown - 1 };
    }));
  }, []);

  const restoreEnergy = useCallback((amount: number): number => {
    const restored = Math.min(amount, effectiveMaxEnergy - stateRef.current.energy);
    setEnergy((prev) => Math.min(effectiveMaxEnergy, prev + amount));
    return restored;
  }, [effectiveMaxEnergy]);

  const spendCredits = useCallback((amount: number): { success: boolean; remaining: number } => {
    const ref = stateRef.current;
    if (ref.quantumCredits < amount) return { success: false, remaining: ref.quantumCredits };
    setQuantumCredits((prev) => prev - amount);
    return { success: true, remaining: ref.quantumCredits - amount };
  }, []);

  const spendResearch = useCallback((amount: number): { success: boolean; remaining: number } => {
    const ref = stateRef.current;
    if (ref.researchPoints < amount) return { success: false, remaining: ref.researchPoints };
    setResearchPoints((prev) => prev - amount);
    return { success: true, remaining: ref.researchPoints - amount };
  }, []);

  const completeDailyExperiment = useCallback((): { success: boolean; bonusEarned: number } => {
    const ref = stateRef.current;
    const daily = dailyExperiment;
    if (!daily || daily.completed) return { success: false, bonusEarned: 0 };

    setDailyExperiment((prev) => prev ? { ...prev, completed: true, completedAt: Date.now() } : null);
    setQuantumCredits((prev) => prev + daily.rewardBonus);
    setResearchPoints((prev) => prev + Math.round(daily.rewardBonus * 0.5));

    return { success: true, bonusEarned: daily.rewardBonus };
  }, [dailyExperiment]);

  const advanceTitle = useCallback((): { advanced: boolean; newTitle: string; index: number } => {
    const ref = stateRef.current;
    if (ref.titleIndex >= QL_MAX_TITLE_INDEX) {
      return { advanced: false, newTitle: TITLES[QL_MAX_TITLE_INDEX], index: ref.titleIndex };
    }

    // Title advancement requirements based on discoveries and experiments
    const requiredDiscoveries = (ref.titleIndex + 1) * 5;
    const requiredExperiments = (ref.titleIndex + 1) * 20;
    const currentDisc = ref.particles.filter((p) => p.discovered).length;

    if (currentDisc >= requiredDiscoveries && ref.experimentsRun >= requiredExperiments) {
      const newIndex = ref.titleIndex + 1;
      setTitleIndex(newIndex);
      setQuantumCredits((prev) => prev + (newIndex + 1) * 100);
      setResearchPoints((prev) => prev + (newIndex + 1) * 50);
      return { advanced: true, newTitle: TITLES[newIndex], index: newIndex };
    }

    return { advanced: false, newTitle: TITLES[ref.titleIndex], index: ref.titleIndex };
  }, []);

  const getParticleByRarity = useCallback((rarity: Rarity): Particle[] => {
    return stateRef.current.particles.filter((p) => p.rarity === rarity);
  }, []);

  const getParticleById = useCallback((id: string): Particle | null => {
    return stateRef.current.particles.find((p) => p.id === id) ?? null;
  }, []);

  const getChamberById = useCallback((id: string): Chamber | null => {
    return stateRef.current.chambers.find((c) => c.id === id) ?? null;
  }, []);

  const getFacilityById = useCallback((id: string): Facility | null => {
    return stateRef.current.facilities.find((f) => f.id === id) ?? null;
  }, []);

  const getAbilityById = useCallback((id: string): Ability | null => {
    return stateRef.current.abilities.find((a) => a.id === id) ?? null;
  }, []);

  const getDiscoveryChance = useCallback((chamberId?: string): number => {
    const ref = stateRef.current;
    const chamber = chamberId
      ? ref.chambers.find((c) => c.id === chamberId)
      : ref.chambers[currentChamber];
    if (!chamber) return 0;

    const baseChance = 35;
    const chamberBonus = chamber.discoveryBonus * chamber.level;
    const equipBonus = ref.equipment.filter((e) => e.equipped && e.owned).reduce((sum, e) => sum + e.bonusDiscovery * e.level, 0);
    const facilityBonus = ref.facilities.filter((f) => f.unlocked).reduce((sum, f) => sum + f.researchOutput * f.level * 0.1, 0);
    return Math.min(95, baseChance + chamberBonus + equipBonus + facilityBonus);
  }, [currentChamber]);

  const getNextTitleRequirements = useCallback((): { discoveriesNeeded: number; experimentsNeeded: number; currentDiscoveries: number; currentExperiments: number } => {
    const ref = stateRef.current;
    const nextIndex = Math.min(ref.titleIndex + 1, QL_MAX_TITLE_INDEX);
    const discoveriesNeeded = (nextIndex + 1) * 5;
    const experimentsNeeded = (nextIndex + 1) * 20;
    const currentDiscoveries = ref.particles.filter((p) => p.discovered).length;

    return {
      discoveriesNeeded,
      experimentsNeeded,
      currentDiscoveries,
      currentExperiments: ref.experimentsRun,
    };
  }, []);

  const getTitleRequirements = useCallback((index: number): { discoveriesNeeded: number; experimentsNeeded: number } => {
    const clamped = Math.max(0, Math.min(index, QL_MAX_TITLE_INDEX));
    return {
      discoveriesNeeded: (clamped + 1) * 5,
      experimentsNeeded: (clamped + 1) * 20,
    };
  }, []);

  const getRarityDistribution = useCallback((): Record<Rarity, { total: number; discovered: number; percent: number }> => {
    const ref = stateRef.current;
    const result: Record<Rarity, { total: number; discovered: number; percent: number }> = {
      common: { total: 0, discovered: 0, percent: 0 },
      uncommon: { total: 0, discovered: 0, percent: 0 },
      rare: { total: 0, discovered: 0, percent: 0 },
      epic: { total: 0, discovered: 0, percent: 0 },
      legendary: { total: 0, discovered: 0, percent: 0 },
    };

    for (const p of ref.particles) {
      result[p.rarity].total++;
      if (p.discovered) result[p.rarity].discovered++;
    }

    for (const r of ['common', 'uncommon', 'rare', 'epic', 'legendary'] as Rarity[]) {
      result[r].percent = result[r].total > 0 ? Math.round((result[r].discovered / result[r].total) * 100) : 0;
    }

    return result;
  }, []);

  // ========================================================================
  // Additional Computed Values (useMemo)
  // ========================================================================

  const labScore = useMemo<number>(() => {
    const particleScore = discoveredCount * 25;
    const experimentScore = experimentsRun * 2;
    const facilityScore = facilities.reduce((sum, f) => sum + f.level * 10, 0);
    const chamberScore = chambers.reduce((sum, c) => sum + c.level * 15, 0);
    const equipmentScore = equipment.filter((e) => e.owned).reduce((sum, e) => sum + e.level * 8, 0);
    const achievementScore = achievements.filter((a) => a.unlocked).length * 50;
    const titleScore = titleIndex * 200;
    const entangleScore = entanglementPairs * 5;
    return particleScore + experimentScore + facilityScore + chamberScore + equipmentScore + achievementScore + titleScore + entangleScore;
  }, [discoveredCount, experimentsRun, facilities, chambers, equipment, achievements, titleIndex, entanglementPairs]);

  const labGrade = useMemo<string>(() => {
    const thresholds = [
      { min: 0, grade: 'D', label: 'Novice Lab' },
      { min: 200, grade: 'C', label: 'Apprentice Lab' },
      { min: 500, grade: 'B', label: 'Competent Lab' },
      { min: 1200, grade: 'A', label: 'Advanced Lab' },
      { min: 3000, grade: 'S', label: 'Elite Lab' },
      { min: 6000, grade: 'SS', label: 'Legendary Lab' },
      { min: 12000, grade: 'SS+', label: 'Transcendent Lab' },
      { min: 25000, grade: 'Ω', label: 'Omniscient Lab' },
    ];
    let result = thresholds[0];
    for (const t of thresholds) {
      if (labScore >= t.min) result = t;
    }
    return result.label;
  }, [labScore]);

  const activeChamber = useMemo<Chamber | null>(() => {
    return chambers[currentChamber] ?? null;
  }, [chambers, currentChamber]);

  const chamberSummary = useMemo<Array<{ id: string; name: string; icon: string; level: number; status: string; experimentsCompleted: number }>>(() => {
    return chambers.map((ch) => ({
      id: ch.id,
      name: ch.name,
      icon: ch.icon,
      level: ch.level,
      status: ch.status,
      experimentsCompleted: ch.experimentsCompleted,
    }));
  }, [chambers]);

  const energyPercent = useMemo<number>(() => {
    return effectiveMaxEnergy > 0 ? Math.round((energy / effectiveMaxEnergy) * 100) : 0;
  }, [energy, effectiveMaxEnergy]);

  const readyChambers = useMemo<Chamber[]>(() => {
    return chambers.filter((ch) => ch.status === 'idle');
  }, [chambers]);

  const activeAbilities = useMemo<Ability[]>(() => {
    return abilities.filter((a) => a.unlocked && a.currentCooldown === 0);
  }, [abilities]);

  const cooldownAbilities = useMemo<Ability[]>(() => {
    return abilities.filter((a) => a.unlocked && a.currentCooldown > 0);
  }, [abilities]);

  const dailyComplete = useMemo<boolean>(() => {
    return dailyExperiment?.completed ?? false;
  }, [dailyExperiment]);

  const particleCompletionPercent = useMemo<number>(() => {
    return Math.round((discoveredCount / QL_PARTICLE_COUNT) * 100);
  }, [discoveredCount]);

  const equipmentByRarity = useMemo<Record<Rarity, Equipment[]>>(() => {
    const result: Record<Rarity, Equipment[]> = { common: [], uncommon: [], rare: [], epic: [], legendary: [] };
    for (const eq of equipment) {
      result[eq.rarity].push(eq);
    }
    return result;
  }, [equipment]);

  const totalParticleEnergy = useMemo<number>(() => {
    return particles.reduce((sum, p) => sum + (p.discovered ? p.energyValue * p.quantity : 0), 0);
  }, [particles]);

  const particleCategoriesDiscovered = useMemo<number>(() => {
    const categories = new Set<string>();
    for (const p of particles) {
      if (p.discovered) categories.add(p.category);
    }
    return categories.size;
  }, [particles]);

  // ========================================================================
  // Additional Action Functions (useCallback)
  // ========================================================================

  const runMassExperiment = useCallback((count: number): ExperimentResult[] => {
    const results: ExperimentResult[] = [];
    const maxRuns = Math.min(count, 10);
    for (let i = 0; i < maxRuns; i++) {
      // Use stateRef for reading current state between iterations
      const ref = stateRef.current;
      const chamber = ref.chambers[currentChamber];
      if (!chamber || chamber.status !== 'idle') break;
      if (ref.energy < chamber.energyCost) break;

      const result = runExperiment();
      results.push(result);
    }
    return results;
  }, [currentChamber, runExperiment]);

  const discoverRandomParticle = useCallback((): { success: boolean; particle: Particle | null } => {
    const ref = stateRef.current;
    const undiscovered = ref.particles.filter((p) => !p.discovered);
    if (undiscovered.length === 0) {
      return { success: false, particle: null };
    }
    const chosen = pickRandom(undiscovered);
    return discoverParticle(chosen.id);
  }, [discoverParticle]);

  const boostChamberDiscovery = useCallback((chamberId: string, turns: number): { success: boolean; boostedChamber: Chamber | null } => {
    const ref = stateRef.current;
    const chamber = ref.chambers.find((c) => c.id === chamberId);
    if (!chamber) return { success: false, boostedChamber: null };

    setChambers((prev) => prev.map((ch) => {
      if (ch.id !== chamberId) return ch;
      return { ...ch, discoveryBonus: ch.discoveryBonus + turns * 5 };
    }));

    const updated = ref.chambers.find((c) => c.id === chamberId);
    return { success: true, boostedChamber: updated ? { ...updated, discoveryBonus: updated.discoveryBonus + turns * 5 } : null };
  }, []);

  const convertParticleToEnergy = useCallback((particleId: string, amount: number): { success: boolean; energyGained: number } => {
    const ref = stateRef.current;
    const particle = ref.particles.find((p) => p.id === particleId);
    if (!particle || !particle.discovered || particle.quantity < amount) {
      return { success: false, energyGained: 0 };
    }

    const energyGained = particle.energyValue * amount;
    setEnergy((prev) => Math.min(effectiveMaxEnergy, prev + energyGained));
    setParticles((prev) => prev.map((p) => {
      if (p.id !== particleId) return p;
      return { ...p, quantity: p.quantity - amount };
    }));

    return { success: true, energyGained };
  }, [effectiveMaxEnergy]);

  const convertParticleToResearch = useCallback((particleId: string, amount: number): { success: boolean; researchGained: number } => {
    const ref = stateRef.current;
    const particle = ref.particles.find((p) => p.id === particleId);
    if (!particle || !particle.discovered || particle.quantity < amount) {
      return { success: false, researchGained: 0 };
    }

    const researchGained = Math.round(particle.energyValue * amount * 1.5);
    setResearchPoints((prev) => prev + researchGained);
    setParticles((prev) => prev.map((p) => {
      if (p.id !== particleId) return p;
      return { ...p, quantity: p.quantity - amount };
    }));

    return { success: true, researchGained };
  }, []);

  const fuseParticles = useCallback((particleId1: string, particleId2: string): { success: boolean; fusedParticle: Particle | null; creditsEarned: number } => {
    const ref = stateRef.current;
    const p1 = ref.particles.find((p) => p.id === particleId1);
    const p2 = ref.particles.find((p) => p.id === particleId2);
    if (!p1 || !p2 || !p1.discovered || !p2.discovered) {
      return { success: false, fusedParticle: null, creditsEarned: 0 };
    }
    if (p1.quantity < 1 || p2.quantity < 1) {
      return { success: false, fusedParticle: null, creditsEarned: 0 };
    }

    // Consume the source particles
    setParticles((prev) => prev.map((p) => {
      if (p.id === particleId1) return { ...p, quantity: p.quantity - 1 };
      if (p.id === particleId2) return { ...p, quantity: p.quantity - 1 };
      return p;
    }));

    // Fuse into the higher-rarity particle (grant one quantity)
    const rarityOrder: Record<Rarity, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
    const target = rarityOrder[p1.rarity] >= rarityOrder[p2.rarity] ? p1 : p2;

    setParticles((prev) => prev.map((p) => {
      if (p.id !== target.id) return p;
      return { ...p, quantity: p.quantity + 1 };
    }));

    const creditsEarned = Math.round((p1.energyValue + p2.energyValue) * 0.5);
    setQuantumCredits((prev) => prev + creditsEarned);
    setResearchPoints((prev) => prev + Math.round(creditsEarned * 0.3));

    return { success: true, fusedParticle: { ...target, quantity: target.quantity + 1 }, creditsEarned };
  }, []);

  const autoCollect = useCallback((): { energy: number; credits: number; research: number; cooldownsTicked: number } => {
    const outputs = collectFacilityOutputs();
    tickCooldowns();
    const ref = stateRef.current;
    const cooldownsTicked = ref.chambers.filter((ch) => ch.cooldownTicks > 0 || ch.status !== 'idle').length +
      ref.abilities.filter((a) => a.currentCooldown > 0).length;
    return { ...outputs, cooldownsTicked };
  }, [collectFacilityOutputs, tickCooldowns]);

  const resetLab = useCallback((): void => {
    setInitialized(false);
  }, []);

  const getLabOverview = useCallback((): {
    labScore: number;
    labGrade: string;
    title: string;
    titleIndex: number;
    discoveredCount: number;
    totalParticles: number;
    experimentsRun: number;
    credits: number;
    research: number;
    energy: number;
    maxEnergy: number;
    energyPercent: number;
    entanglements: number;
    achievementsUnlocked: number;
    totalAchievements: number;
    facilitiesUnlocked: number;
    equipmentOwned: number;
    abilitiesUnlocked: number;
  } => {
    return {
      labScore,
      labGrade,
      title: TITLES[Math.min(stateRef.current.titleIndex, QL_MAX_TITLE_INDEX)],
      titleIndex: stateRef.current.titleIndex,
      discoveredCount: stateRef.current.particlesDiscovered,
      totalParticles: QL_PARTICLE_COUNT,
      experimentsRun: stateRef.current.experimentsRun,
      credits: stateRef.current.quantumCredits,
      research: stateRef.current.researchPoints,
      energy: stateRef.current.energy,
      maxEnergy: effectiveMaxEnergy,
      energyPercent: Math.round((stateRef.current.energy / effectiveMaxEnergy) * 100),
      entanglements: stateRef.current.entanglementPairs,
      achievementsUnlocked: stateRef.current.achievements.filter((a) => a.unlocked).length,
      totalAchievements: QL_ACHIEVEMENT_COUNT,
      facilitiesUnlocked: stateRef.current.facilities.filter((f) => f.unlocked).length,
      equipmentOwned: stateRef.current.equipment.filter((e) => e.owned).length,
      abilitiesUnlocked: stateRef.current.abilities.filter((a) => a.unlocked).length,
    };
  }, [labScore, labGrade, effectiveMaxEnergy]);

  const getParticleCatalog = useCallback((): Array<{
    id: string; name: string; symbol: string; rarity: Rarity; category: ParticleCategory;
    discovered: boolean; quantity: number; energyValue: number; spin: string; mass: string; charge: string;
  }> => {
    return stateRef.current.particles.map((p) => ({
      id: p.id,
      name: p.name,
      symbol: p.symbol,
      rarity: p.rarity,
      category: p.category,
      discovered: p.discovered,
      quantity: p.quantity,
      energyValue: p.energyValue,
      spin: p.spin,
      mass: p.mass,
      charge: p.charge,
    }));
  }, []);

  const getTopParticles = useCallback((limit: number): Particle[] => {
    const ref = stateRef.current;
    return ref.particles
      .filter((p) => p.discovered)
      .sort((a, b) => b.energyValue - a.energyValue)
      .slice(0, limit);
  }, []);

  const getChamberLeaderboard = useCallback((): Array<{ id: string; name: string; experiments: number; level: number }> => {
    return stateRef.current.chambers
      .map((ch) => ({ id: ch.id, name: ch.name, experiments: ch.experimentsCompleted, level: ch.level }))
      .sort((a, b) => b.experiments - a.experiments);
  }, []);

  const simulateExperiment = useCallback((chamberId: string): { estimatedChance: number; estimatedCredits: number; estimatedResearch: number; energyCost: number } => {
    const ref = stateRef.current;
    const chamber = ref.chambers.find((c) => c.id === chamberId);
    if (!chamber) return { estimatedChance: 0, estimatedCredits: 0, estimatedResearch: 0, energyCost: 0 };

    const baseChance = 35;
    const chamberBonus = chamber.discoveryBonus * chamber.level;
    const equipBonus = ref.equipment.filter((e) => e.equipped && e.owned).reduce((sum, e) => sum + e.bonusDiscovery * e.level, 0);
    const facilityBonus = ref.facilities.filter((f) => f.unlocked).reduce((sum, f) => sum + f.researchOutput * f.level * 0.1, 0);
    const estimatedChance = Math.min(95, baseChance + chamberBonus + equipBonus + facilityBonus);
    const estimatedCredits = 10 + chamber.level * 5;
    const estimatedResearch = 5 + chamber.level * 3 + chamber.researchBonus;

    return { estimatedChance, estimatedCredits, estimatedResearch, energyCost: chamber.energyCost };
  }, []);

  const getNextUnlockableFacility = useCallback((): Facility | null => {
    const ref = stateRef.current;
    for (const def of FACILITY_DEFS) {
      if (ref.experimentsRun < def.unlockLevel) {
        return {
          id: def.id,
          name: def.name,
          description: def.description,
          level: 1,
          maxLevel: def.maxLevel,
          upgradeCost: def.baseUpgradeCost,
          energyOutput: def.baseEnergyOutput,
          researchOutput: def.baseResearchOutput,
          creditOutput: def.baseCreditOutput,
          unlocked: false,
          icon: def.icon,
        };
      }
    }
    return null;
  }, []);

  const getNextUnlockableAbility = useCallback((): Ability | null => {
    const ref = stateRef.current;
    for (const def of ABILITY_DEFS) {
      const ability = ref.abilities.find((a) => a.id === def.id);
      if (ability && !ability.unlocked) {
        return ability;
      }
    }
    return null;
  }, []);

  // ========================================================================
  // Return
  // ========================================================================

  return {
    // Constants
    QL_MAX_ENERGY,
    QL_PARTICLE_COUNT,
    QL_CHAMBER_COUNT,
    QL_EQUIPMENT_COUNT,
    QL_FACILITY_COUNT,
    QL_ABILITY_COUNT,
    QL_ACHIEVEMENT_COUNT,
    QL_TITLE_COUNT,
    QL_INITIAL_ENERGY,
    QL_INITIAL_CREDITS,
    QL_INITIAL_RESEARCH,
    QL_MAX_TITLE_INDEX,

    // Color theme
    colorTheme,

    // State
    particles,
    chambers,
    equipment,
    facilities,
    abilities,
    achievements,
    currentChamber,
    energy,
    quantumCredits,
    researchPoints,
    experimentsRun,
    particlesDiscovered,
    titleIndex,
    entanglementPairs,
    dailyExperiment,
    initialized,

    // Computed
    discoveredCount,
    discoveredParticles,
    undiscoveredParticles,
    totalEnergyOutput,
    totalResearchOutput,
    totalCreditOutput,
    equippedBonuses,
    effectiveMaxEnergy,
    title,
    titleList,
    stats,
    progress,
    unlockedAbilitiesCount,
    unlockedFacilitiesCount,
    ownedEquipmentCount,
    particleCountsByRarity,

    // Actions
    discoverParticle,
    runExperiment,
    upgradeFacility,
    activateAbility,
    researchTheory,
    calibrateEquipment,
    entanglePair,
    collapseWaveFunction,
    generateQuantumComputer,
    triggerQuantumEvent,
    resetDailyExperiment,
    checkAchievements,
    selectChamber,
    acquireEquipment,
    toggleEquipItem,
    repairEquipment,
    upgradeChamber,
    collectFacilityOutputs,
    tickCooldowns,
    restoreEnergy,
    spendCredits,
    spendResearch,
    completeDailyExperiment,
    advanceTitle,

    // Getters
    getTitle,
    getProgress,
    getStats,
    getParticleByRarity,
    getParticleById,
    getChamberById,
    getFacilityById,
    getAbilityById,
    getDiscoveryChance,
    getNextTitleRequirements,
    getTitleRequirements,
    getRarityDistribution,

    // Additional Computed
    labScore,
    labGrade,
    activeChamber,
    chamberSummary,
    energyPercent,
    readyChambers,
    activeAbilities,
    cooldownAbilities,
    dailyComplete,
    particleCompletionPercent,
    equipmentByRarity,
    totalParticleEnergy,
    particleCategoriesDiscovered,

    // Additional Actions
    runMassExperiment,
    discoverRandomParticle,
    boostChamberDiscovery,
    convertParticleToEnergy,
    convertParticleToResearch,
    fuseParticles,
    autoCollect,
    resetLab,

    // Additional Getters
    getLabOverview,
    getParticleCatalog,
    getTopParticles,
    getChamberLeaderboard,
    simulateExperiment,
    getNextUnlockableFacility,
    getNextUnlockableAbility,
  };
}
